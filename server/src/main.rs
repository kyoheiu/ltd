mod error;

use axum::debug_handler;
use axum::extract::{Json, State};
use axum::http::HeaderMap;
use axum::response::{Html, IntoResponse, Redirect};
use axum::Form;
use axum::{
    routing::{get, post},
    Router,
};
use error::Error;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::collections::VecDeque;
use std::env;
use std::time::UNIX_EPOCH;
use tower_cookies::{Cookie, CookieManagerLayer, Cookies};
use tower_http::services::ServeDir;
use tracing::{info, warn};

const COOKIE_NAME: &str = "ltd_auth";

#[derive(Clone)]
struct Core {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
}

impl Core {
    fn default() -> Result<Self, Error> {
        Ok(Core {
            encoding_key: EncodingKey::from_secret(env::var("LTD_SECRET_KEY")?.as_bytes()),
            decoding_key: DecodingKey::from_secret(env::var("LTD_SECRET_KEY")?.as_bytes()),
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Items {
    items: VecDeque<Item>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ItemsWithModifiedTime {
    items: VecDeque<Item>,
    modified: u128,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ModifiedTime {
    modified: u128,
}

#[derive(PartialEq, Eq, PartialOrd, Ord, Debug, Clone, Serialize, Deserialize)]
struct Item {
    id: String,
    value: String,
    todo: bool,
    suit: usize,
}

#[derive(Debug, Serialize, Deserialize)]
struct Value {
    value: String,
    ou: String,
}

#[derive(Deserialize)]
struct LogIn {
    username: String,
    password: String,
}

#[derive(Deserialize)]
struct Sorted {
    old: usize,
    new: usize,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt().init();
    info!("Initialized logger; listening on port 8080.");
    let core = Core::default()?;

    let static_dir = ServeDir::new("static");
    // build our application with a single route
    let app = Router::new()
        .route("/health", get(health))
        .route("/api/check", get(check_update))
        .route("/api/item", get(read_item).post(add_item))
        .route("/api/item/rename", post(rename_item))
        .route("/api/item/todo", post(toggle_todo))
        .route("/api/item/suit", post(toggle_suit))
        .route("/api/item/sort", post(sort_item))
        .route("/api/item/delete_archived", post(delete_archived))
        .route("/api/ldaplogin", post(ldaplogin))
        .route("/api/logout", post(logout))
        .route("/api/post", post(post_item))
        .layer(CookieManagerLayer::new())
        .nest_service("/", static_dir.clone())
        .nest_service("/login", static_dir)
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
async fn read_item(cookies: Cookies, State(core): State<Core>) -> Result<impl IntoResponse, Error> {
    if let Ok(name) = is_valid(cookies, &core.decoding_key) {
        let ou = to_ou(&name)?;
        let items = read_json(&ou)?;
        let modified = check_modified_time(&ou)?;
        Ok(Json(ItemsWithModifiedTime {
            items: items.items,
            modified,
        }))
    } else {
        Err(Error::NotVerified)
    }
}

#[debug_handler]
async fn check_update(
    cookies: Cookies,
    State(core): State<Core>,
) -> Result<Json<ModifiedTime>, Error> {
    if let Ok(name) = is_valid(cookies, &core.decoding_key) {
        let ou = to_ou(&name)?;
        Ok(Json(ModifiedTime {
            modified: check_modified_time(&ou)?,
        }))
    } else {
        Err(Error::NotVerified)
    }
}

#[debug_handler]
async fn add_item(
    cookies: Cookies,
    State(core): State<Core>,
    Json(payload): Json<Item>,
) -> Result<impl IntoResponse, Error> {
    if let Ok(name) = is_valid(cookies, &core.decoding_key) {
        let ou = to_ou(&name)?;
        let mut items = read_json(&ou)?;

        items.items.push_front(Item {
            id: payload.id,
            value: payload.value.clone(),
            todo: payload.todo,
            suit: payload.suit,
        });
        let modified: u128 = save_json(items, &ou)?;
        info!("Added: {}", payload.value);
        Ok(Json(ModifiedTime { modified }))
    } else {
        Err(Error::NotVerified)
    }
}

#[debug_handler]
async fn toggle_todo(
    cookies: Cookies,
    State(core): State<Core>,
    Json(payload): Json<Item>,
) -> Result<impl IntoResponse, Error> {
    if let Ok(name) = is_valid(cookies, &core.decoding_key) {
        let ou = to_ou(&name)?;
        let mut items = read_json(&ou)?;
        if let Some(target) = items.items.iter_mut().find(|x| x.id == payload.id) {
            match payload.todo {
                false => {
                    target.todo = false;
                    info!("Archived: {}", target.value);
                }
                true => {
                    target.todo = true;
                    info!("Unarchived: {}", target.value);
                }
            }
        } else {
            return Err(Error::MissingId);
        }
        let modified = save_json(items, &ou)?;
        Ok(Json(ModifiedTime { modified }).into_response())
    } else {
        Err(Error::NotVerified)
    }
}

#[debug_handler]
async fn toggle_suit(
    cookies: Cookies,
    State(core): State<Core>,
    Json(payload): Json<Item>,
) -> Result<impl IntoResponse, Error> {
    if let Ok(name) = is_valid(cookies, &core.decoding_key) {
        let ou = to_ou(&name)?;
        let mut items = read_json(&ou)?;
        if let Some(target) = items.items.iter_mut().find(|x| x.id == payload.id) {
            target.suit = payload.suit;
            info!("Toggled suit: {}", target.value);
        } else {
            return Err(Error::MissingId);
        }
        let modified = save_json(items, &ou)?;
        Ok(Json(ModifiedTime { modified }).into_response())
    } else {
        Err(Error::NotVerified)
    }
}

#[debug_handler]
async fn rename_item(
    cookies: Cookies,
    State(core): State<Core>,
    Json(payload): Json<Item>,
) -> Result<impl IntoResponse, Error> {
    if let Ok(name) = is_valid(cookies, &core.decoding_key) {
        let ou = to_ou(&name)?;
        let mut items = read_json(&ou)?;
        if let Some(target) = items.items.iter_mut().find(|x| x.id == payload.id) {
            target.value = payload.value.clone();
            info!("Rename: {} -> {}", target.value, payload.value);
        } else {
            return Err(Error::MissingId);
        }
        let modified = save_json(items, &ou)?;
        Ok(Json(ModifiedTime { modified }).into_response())
    } else {
        Err(Error::NotVerified)
    }
}

#[debug_handler]
async fn delete_archived(
    cookies: Cookies,
    State(core): State<Core>,
) -> Result<impl IntoResponse, Error> {
    if let Ok(name) = is_valid(cookies, &core.decoding_key) {
        let ou = to_ou(&name)?;
        let mut items = read_json(&ou)?;
        let filtered: VecDeque<Item> = items.items.clone().into_iter().filter(|x| x.todo).collect();
        items.items = filtered;
        info!("Deleted Archived items.");
        let modified = save_json(items, &ou)?;
        Ok(Json(ModifiedTime { modified }).into_response())
    } else {
        Err(Error::NotVerified)
    }
}

#[debug_handler]
async fn post_item(headers: HeaderMap, Json(payload): Json<Value>) -> Result<(), Error> {
    if let Some(token) = headers.get("authorization") {
        if token.to_str()? == env::var("LTD_API_TOKEN")? {
            let value = payload.value;
            let ou = payload.ou;
            let id = ulid::Ulid::new().to_string();
            let mut items = read_json(&ou)?;
            items.items.push_front(Item {
                id: id.clone(),
                value: value.clone(),
                todo: true,
                suit: 0,
            });
            save_json(items, &ou)?;
            Ok(info!("Added(via API): id {} value {} suit 0", id, value))
        } else {
            warn!("Invalid token.");
            Err(Error::NotVerified)
        }
    } else {
        warn!("No header.");
        Err(Error::Header)
    }
}

#[debug_handler]
async fn sort_item(
    cookies: Cookies,
    State(core): State<Core>,
    Json(payload): Json<Sorted>,
) -> Result<impl IntoResponse, Error> {
    if let Ok(name) = is_valid(cookies, &core.decoding_key) {
        let ou = to_ou(&name)?;
        let items = read_json(&ou)?.items;
        let mut todo: VecDeque<Item> = items.clone().into_iter().filter(|x| x.todo).collect();
        let mut done: VecDeque<Item> = items.into_iter().filter(|x| !x.todo).collect();
        if let Some(moved) = todo.remove(payload.old) {
            todo.insert(payload.new, moved);
        }

        todo.append(&mut done);
        let modified = save_json(
            Items {
                items: todo.clone(),
            },
            &ou,
        )?;
        info!("Sorted items saved.");
        Ok(Json(ItemsWithModifiedTime {
            items: todo,
            modified,
        }))
    } else {
        Err(Error::NotVerified)
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
        let token = encode(&Header::default(), &my_claims, &core.encoding_key)?;
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

fn is_valid(cookies: Cookies, key: &DecodingKey) -> Result<String, Error> {
    if let Some(jwt) = cookies.get(COOKIE_NAME) {
        let claims = decode::<Claims>(jwt.value(), key, &Validation::new(Algorithm::HS256));
        if let Ok(claims) = claims {
            Ok(claims.claims.sub)
        } else {
            Err(Error::Io("error".to_string()))
        }
    } else {
        Err(Error::Io("error".to_string()))
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
            Ok(Items {
                items: VecDeque::new(),
            })
        }
        Ok(json) => match serde_json::from_str(&json) {
            Ok(json) => Ok(json),
            Err(_) => Ok(Items {
                items: VecDeque::new(),
            }),
        },
    }
}

fn save_json(items: Items, ou: &str) -> Result<u128, Error> {
    let json = serde_json::to_string(&items)?;
    let path = format!("items/{}.json", ou);
    std::fs::write(path, json)?;
    check_modified_time(ou)
}

fn check_modified_time(ou: &str) -> Result<u128, Error> {
    let path = format!("items/{}.json", ou);
    let metadata = std::fs::metadata(path)?;
    Ok(metadata.modified()?.duration_since(UNIX_EPOCH)?.as_millis())
}
