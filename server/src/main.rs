mod error;
mod types;
pub mod api {
    pub mod v1 {
        include!("../gen/ltd/v1/ltd.v1.rs");
    }
}

use crate::api::v1::{request::Command, Item, Items, Request as WSRequest};
use crate::types::{Claims, LogIn, Value};
use axum::debug_handler;
use axum::extract::ws::{Message, WebSocket, WebSocketUpgrade};
use axum::extract::State;
use axum::response::{Html, IntoResponse, Redirect};
use axum::Form;
use axum::Json;
use axum::{
    routing::{any, get, post},
    Router,
};
use error::Error;
use futures_util::{sink::SinkExt, stream::StreamExt};
use http::{HeaderMap, StatusCode};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use prost::Message as ProstMessage;
use std::collections::{HashMap, VecDeque};
use std::env;
use std::sync::{Arc, Mutex};
use tokio::sync::broadcast;
use tower_cookies::{Cookie, CookieManagerLayer, Cookies};
use tower_http::services::ServeDir;
use tracing::{info, warn};

const COOKIE_NAME: &str = "ltd_auth";

#[derive(Clone)]
struct Core {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
    channels: Arc<Mutex<HashMap<String, broadcast::Sender<Vec<u8>>>>>,
}

impl Core {
    fn default() -> Result<Self, Error> {
        Ok(Core {
            encoding_key: EncodingKey::from_secret(env::var("LTD_SECRET_KEY")?.as_bytes()),
            decoding_key: DecodingKey::from_secret(env::var("LTD_SECRET_KEY")?.as_bytes()),
            channels: Arc::new(Mutex::new(HashMap::new())),
        })
    }

    fn get_encoding_key(&self) -> EncodingKey {
        self.encoding_key.to_owned()
    }

    fn get_or_create_tx(&self, ou: &str) -> broadcast::Sender<Vec<u8>> {
        let mut channels = self.channels.lock().unwrap();
        channels
            .entry(ou.to_string())
            .or_insert_with(|| {
                let (tx, _rx) = broadcast::channel(100);
                tx
            })
            .clone()
    }
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt().init();
    info!("Initialized logger; listening on port 8080.");
    let core = Core::default()?;

    // build our application with a single route
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/auth", get(get_auth_status))
        .route("/api/ldaplogin", post(ldaplogin))
        .route("/api/logout", post(logout))
        .route("/api/post", post(post_item))
        .route("/ws", any(ws_handler))
        .layer(CookieManagerLayer::new())
        .nest_service("/", ServeDir::new("static"))
        .with_state(core);

    axum::Server::bind(&"0.0.0.0:8080".parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
    Ok(())
}

#[debug_handler]
async fn health() -> Html<&'static str> {
    Html("Hello, developer.")
}

#[debug_handler]
async fn get_auth_status(cookies: Cookies, State(core): State<Core>) -> impl IntoResponse {
    match is_valid(cookies, &core.decoding_key) {
        Err(_) => StatusCode::UNAUTHORIZED,
        Ok(_) => StatusCode::OK,
    }
}

#[debug_handler]
async fn ldaplogin(
    cookies: Cookies,
    State(core): State<Core>,
    Form(log_in): Form<LogIn>,
) -> Result<impl IntoResponse, Error> {
    let username = log_in.username.trim();
    let password = log_in.password.trim();
    let (con, mut ldap) = ldap3::LdapConnAsync::new(&env::var("LTD_NETWORK")?).await?;
    ldap3::drive!(con);
    info!("LDAP server connected.");
    if let Ok(_result) = ldap.simple_bind(username, password).await?.success() {
        let my_claims = Claims {
            sub: username.to_string(),
            exp: 2000000000,
        };
        let token = encode(&Header::default(), &my_claims, &core.get_encoding_key())?;
        let cookie = Cookie::build(COOKIE_NAME, token)
            .domain(env::var("LTD_DOMAIN")?)
            .path("/")
            .max_age(cookie::time::Duration::days(7))
            .secure(true)
            .same_site(cookie::SameSite::Strict)
            .http_only(true)
            .finish();
        cookies.add(cookie);
        Ok(Redirect::to("/").into_response())
    } else {
        warn!("Failed to log in.");
        Ok(Redirect::to("/").into_response())
    }
}

#[debug_handler]
async fn logout(cookies: Cookies) -> Result<impl IntoResponse, Error> {
    if cookies.get(COOKIE_NAME).is_some() {
        let cookie = Cookie::build(COOKIE_NAME, "")
            .domain(env::var("LTD_DOMAIN")?)
            .path("/")
            .max_age(cookie::time::Duration::seconds(0))
            .same_site(cookie::SameSite::Strict)
            .secure(true)
            .http_only(true)
            .finish();
        cookies.add(cookie);
        info!("Cookie removed.");
    }
    Ok(Redirect::to("/").into_response())
}

#[debug_handler]
async fn ws_handler(
    cookies: Cookies,
    State(core): State<Core>,
    ws: WebSocketUpgrade,
) -> Result<impl IntoResponse, Error> {
    info!("WebSocket connection is establishing...");
    match is_valid(cookies, &core.decoding_key) {
        Err(_) => Err(Error::NotVerified),
        Ok(name) => {
            info!("Verified.");
            let ou = to_ou(&name)?;
            Ok(ws.on_upgrade(move |socket| async move {
                if let Err(e) = handle_socket(socket, core.into(), ou).await {
                    eprintln!("{}", e);
                }
            }))
        }
    }
}

async fn handle_socket(socket: WebSocket, core: Arc<Core>, ou: String) -> Result<(), Error> {
    // split the socket into a sender and a receiver
    let (mut sender, mut receiver) = socket.split();

    // subscribe to the global broadcast channel
    let tx = core.get_or_create_tx(&ou);
    let mut rx = tx.subscribe();

    // send task: forward broadcast messages to this client
    let mut send_task = tokio::spawn(async move {
        while let Ok(bin_data) = rx.recv().await {
            if sender.send(Message::Binary(bin_data.into())).await.is_err() {
                break;
            }
        }
    });

    // receive task: handle requests from this client
    let tx = tx.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(Message::Binary(b))) = receiver.next().await {
            // decode protobuf
            if let Ok(req) = WSRequest::decode(b.as_slice()) {
                let json = read_json(&ou);
                let mut new_items = vec![];
                if let Ok(json) = json {
                    let mut deque = VecDeque::from(json.items);
                    if let Some(command) = req.command {
                        match command {
                            Command::Create(c) => {
                                deque.push_front(Item {
                                    id: uuid::Uuid::new_v4().to_string(),
                                    value: c.value,
                                    todo: true,
                                    dot: 0,
                                });
                                let items = Items {
                                    items: Vec::from(deque),
                                };
                                if save_json(&items, &ou).is_ok() {
                                    new_items = get_binary(&items);
                                }
                            }
                            Command::Read(_) => {
                                let items = Items {
                                    items: Vec::from(deque),
                                };
                                new_items = get_binary(&items);
                            }
                            Command::Update(u) => {
                                let id = &u.id;
                                let items = Items {
                                    items: Vec::from(deque)
                                        .into_iter()
                                        .map(|item| {
                                            if &item.id == id {
                                                return Item {
                                                    id: u.id.to_owned(),
                                                    value: u.value.to_owned(),
                                                    todo: u.todo,
                                                    dot: u.dot,
                                                };
                                            } else {
                                                item
                                            }
                                        })
                                        .collect(),
                                };
                                if save_json(&items, &ou).is_ok() {
                                    new_items = get_binary(&items);
                                }
                            }
                            Command::Delete(_) => {
                                let items = Items {
                                    items: Vec::from(deque)
                                        .into_iter()
                                        .filter(|item| item.todo)
                                        .collect(),
                                };
                                if save_json(&items, &ou).is_ok() {
                                    new_items = get_binary(&items);
                                }
                            }
                            Command::Sort(s) => {
                                let (mut todo, mut done): (VecDeque<Item>, VecDeque<Item>) =
                                    deque.into_iter().partition(|item| item.todo);

                                let target_idx = todo.iter().position(|item| item.id == s.target);
                                let insert_idx = todo.iter().position(|item| item.id == s.insert);
                                match (target_idx, insert_idx) {
                                    (Some(target), Some(after)) => {
                                        if let Some(target_item) = todo.remove(target) {
                                            todo.insert(
                                                if after > target && !s.last {
                                                    after - 1
                                                } else {
                                                    after
                                                },
                                                target_item,
                                            );
                                        }
                                    }
                                    _ => (),
                                }
                                todo.append(&mut done);
                                let items = Items {
                                    items: Vec::from(todo),
                                };
                                if save_json(&items, &ou).is_ok() {
                                    new_items = get_binary(&items);
                                }
                            }
                        }
                    }
                }
                // broadcast the updated data to all connected clients
                let _ = tx.send(new_items);
            }
        }
    });

    // abort the other task when one task finishes (handle disconnection)
    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    };
    Ok(())
}

#[debug_handler]
async fn post_item(
    State(core): State<Core>,
    headers: HeaderMap,
    Json(payload): Json<Value>,
) -> Result<(), Error> {
    if let Some(token) = headers.get("authorization") {
        if token.to_str()? == env::var("LTD_API_TOKEN")? {
            let value = payload.value;
            let ou = payload.ou;
            let id = uuid::Uuid::new_v4().to_string();
            let json = read_json(&ou)?;
            let mut deque = VecDeque::from(json.items);
            deque.push_front(Item {
                id: id.clone(),
                value: value.clone(),
                todo: true,
                dot: 0,
            });
            let items = Items {
                items: Vec::from(deque),
            };
            save_json(&items, &ou)?;
            let tx = core.get_or_create_tx(&ou);
            let _ = tx.send(get_binary(&items));
            Ok(info!("Added(via API): id {} value {} dot 0", id, value))
        } else {
            warn!("Invalid token.");
            Err(Error::NotVerified)
        }
    } else {
        warn!("No header.");
        Err(Error::Header)
    }
}

fn is_valid(cookies: Cookies, key: &DecodingKey) -> Result<String, Error> {
    if let Some(jwt) = cookies.get(COOKIE_NAME) {
        let claims = decode::<Claims>(jwt.value(), key, &Validation::new(Algorithm::HS256));
        if let Ok(claims) = claims {
            Ok(claims.claims.sub)
        } else {
            Err(Error::Jwt("invalid jwt.".to_string()))
        }
    } else {
        Err(Error::Jwt("invalid jwt.".to_string()))
    }
}

fn to_ou(dn: &str) -> Result<String, Error> {
    let ou = dn.split(',').find(|x| x.starts_with("ou="));
    if let Some(ou) = ou {
        Ok(ou.strip_prefix("ou=").unwrap().to_string())
    } else {
        Err(Error::OrganizationalUnitName)
    }
}

fn read_json(ou: &str) -> Result<Items, Error> {
    let json = std::fs::read_to_string(format!("items/{}.json", ou));
    match json {
        Err(_) => {
            info!("Json file not found: Will create a new one.");
            if !std::path::Path::new("items").exists() {
                std::fs::create_dir("items")?;
            }
            std::fs::File::create(format!("items/{}.json", ou))?;
            Ok(Items { items: Vec::new() })
        }
        Ok(json) => match serde_json::from_str(&json) {
            Ok(items) => Ok(items),
            Err(e) => Err(Error::Json(e.to_string())),
        },
    }
}

fn save_json(items: &Items, ou: &str) -> Result<(), Error> {
    let json = serde_json::to_string(items)?;
    let path = format!("items/{}.json", ou);
    Ok(std::fs::write(path, json)?)
}

fn get_binary(items: &Items) -> Vec<u8> {
    let mut buf = Vec::new();
    buf.reserve(items.encoded_len());
    items.encode(&mut buf).unwrap();
    buf
}
