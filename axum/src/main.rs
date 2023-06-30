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
use std::sync::{Arc, Mutex, MutexGuard};
use tower_cookies::{Cookie, CookieManagerLayer, Cookies};
use tower_http::services::ServeDir;

const COOKIE_NAME: &str = "ltd_auth";

#[derive(Clone)]
struct Core {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
    items: Arc<Mutex<Items>>,
}

impl Core {
    fn default() -> Result<Self, Error> {
        let json = std::fs::read_to_string("items.json");
        let json = match json {
            Err(_) => {
                println!("Json file not found.");
                Items {
                    items: VecDeque::new(),
                }
            }
            Ok(json) => match serde_json::from_str(&json) {
                Ok(json) => json,
                Err(_) => Items {
                    items: VecDeque::new(),
                },
            },
        };
        Ok(Core {
            encoding_key: EncodingKey::from_secret(env::var("LTD_SECRET_KEY")?.as_bytes()),
            decoding_key: DecodingKey::from_secret(env::var("LTD_SECRET_KEY")?.as_bytes()),
            items: Arc::new(Mutex::new(json)),
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Items {
    items: VecDeque<Item>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Item {
    id: String,
    value: String,
    todo: bool,
    dot: usize,
}

#[derive(Debug, Serialize, Deserialize)]
struct ValueRenamed {
    id: String,
    value: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Value {
    value: String,
}

#[derive(Deserialize)]
struct LogIn {
    username: String,
    password: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: usize,
}

#[derive(Debug, Serialize, Deserialize)]
struct Param {
    token: String,
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    let core = Core::default()?;

    // build our application with a single route
    let app = Router::new()
        .route("/health", get(health))
        .route("/item", get(read_item).post(update_item))
        .route("/api/rename", post(rename_item))
        .route("/api/ldaplogin", post(ldaplogin))
        .route("/api/logout", post(logout))
        .route("/api/post", post(post_item))
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
async fn read_item(cookies: Cookies, State(core): State<Core>) -> Result<impl IntoResponse, Error> {
    if let Ok(name) = is_valid(cookies, &core.decoding_key) {
        println!("{}", name);
        let item = core.items.lock().unwrap().clone();
        Ok(Json(item.items))
    } else {
        Err(Error::NotVerified)
    }
}

#[debug_handler]
async fn update_item(
    cookies: Cookies,
    State(core): State<Core>,
    Json(payload): Json<Items>,
) -> Result<(), Error> {
    if let Ok(_name) = is_valid(cookies, &core.decoding_key) {
        let mut items = core.items.lock().unwrap();
        *items = payload;
        save_json(items)?;
    } else {
        Err(Error::NotVerified)
    }
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
            let id = ulid::Ulid::new().to_string();
            let mut items = core.items.lock().unwrap();
            items.items.push_front(Item {
                id,
                value,
                todo: true,
                dot: 0,
            });
            save_json(items)?;
            Ok(println!("Added new item."))
        } else {
            println!("Invalid token.");
            Err(Error::NotVerified)
        }
    } else {
        println!("No header.");
        Err(Error::Header)
    }
}

#[debug_handler]
async fn rename_item(
    cookies: Cookies,
    State(core): State<Core>,
    Form(payload): Form<ValueRenamed>,
) -> Result<impl IntoResponse, Error> {
    if let Ok(_name) = is_valid(cookies, &core.decoding_key) {
        let mut items = core.items.lock().unwrap();
        if let Some(target) = items.items.iter_mut().find(|x| x.id == payload.id) {
        println!("Rename: {} -> {}", target.value, payload.value);
        target.value = payload.value;
        save_json(items)?;
        Ok(Redirect::to("/").into_response())
        } else {
            Err(Error::Json(format!("Item with this id not found: {}", payload.id)))
        }
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
    println!("LDAP server connected.");
    if let Ok(result) = ldap.simple_bind(username, password).await?.success() {
        println!("{:#?}", result);
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
        println!("Logging in failed.");
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
        println!("Cookie removed.");
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

fn save_json(items: MutexGuard<Items>) -> Result<(), Error> {
    let json = serde_json::to_string(&items.clone())?;
    std::fs::write("items.json", json)?;
    Ok(())
}
