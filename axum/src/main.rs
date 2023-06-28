mod error;

use axum::debug_handler;
use axum::extract::{Json, State};
use axum::response::{Html, IntoResponse, Redirect};
use axum::Form;
use axum::{
    routing::{get, post, put},
    Router,
};
use error::Error;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::collections::{VecDeque};
use std::env;
use std::sync::{Arc, Mutex, MutexGuard};
use tower_cookies::{Cookie, CookieManagerLayer, Cookies};
use tower_http::services::ServeDir;

const COOKIE_NAME: &str = "ltd_auth";

#[derive(Clone)]
struct Core {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
    items: Arc<Mutex<VecDeque<Item>>>,
}

impl Core {
    fn default() -> Result<Self, Error> {
        let json = std::fs::read_to_string("items.json");
        let json = match json {
            Err(_) => {
                println!("json file not found");
                VecDeque::new()
            }
            Ok(json) => {
                let json: VecDeque<Item> = serde_json::from_str(&json).unwrap();
                json
            }
        };
        Ok(Core {
            encoding_key: EncodingKey::from_secret(env::var("TODO_SECRET_KEY")?.as_bytes()),
            decoding_key: DecodingKey::from_secret(env::var("TODO_SECRET_KEY")?.as_bytes()),
            items: Arc::new(Mutex::new(json)),
        })
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct Items(VecDeque<Item>);

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Item {
    id: String,
    value: String,
    todo: bool,
    dot: usize,
}

#[derive(Debug, Serialize, Deserialize)]
struct ValuePosted {
    id: String,
    value: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ValueUpdated {
    id: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct ValueSwapped {
    swap: Vec<String>,
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

#[tokio::main]
async fn main() -> Result<(), Error> {
    let core = Core::default()?;

    // build our application with a single route
    let app = Router::new()
        .route("/health", get(health))
        .route("/item", get(read_item).post(post_item))
        .route("/item/dot", put(change_dot))
        .route("/item/archive", put(archive_item))
        .route("/item/swap", put(change_order))
        .route("/api/ldaplogin", post(ldaplogin))
        .route("/api/logout", post(logout))
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
async fn read_item(
    cookies: Cookies,
    State(core): State<Core>) -> Result<impl IntoResponse, Error> {
    if let Ok(name) = is_valid(cookies, &core.decoding_key) {
        println!("{}", name);
    let item = core.items.lock().unwrap().clone();
    println!("{:?}", item);
    Ok(Json(item))
    } else {
        Err(Error::Ldap("Not verified.".to_string()))
    }
}

#[debug_handler]
async fn post_item(State(core): State<Core>, Json(payload): Json<ValuePosted>) {
    println!("item to add: {:?}", payload);
    let mut items = core.items.lock().unwrap();
    items.push_front(Item {
        id: payload.id,
        value: payload.value,
        todo: true,
        dot: 0,
    });
    save_json(items);
}

#[debug_handler]
async fn archive_item(State(core): State<Core>, Json(payload): Json<ValueUpdated>) {
    println!("position to archive: {:?}", payload);
    let mut items = core.items.lock().unwrap();
    let mut target = items.iter_mut().find(|x| x.id == payload.id).unwrap();
    target.todo = !target.todo;
    save_json(items);
}

#[debug_handler]
async fn change_dot(State(core): State<Core>, Json(payload): Json<ValueUpdated>) {
    println!("item to change dot: {:?}", payload);
    let mut items = core.items.lock().unwrap();
    let mut target = items.iter_mut().find(|x| x.id == payload.id).unwrap();
    let old_dot = target.dot;
    target.dot = if old_dot == 3 { 0 } else { old_dot + 1 };
    save_json(items);
}

#[debug_handler]
async fn change_order(State(core): State<Core>, Json(payload): Json<ValueSwapped>) {
    println!("item to swap: {:?}", payload);
    let mut items = core.items.lock().unwrap();
    let target1 = items
        .iter_mut()
        .position(|x| x.id == payload.swap[0])
        .unwrap();
    let target2 = items
        .iter_mut()
        .position(|x| x.id == payload.swap[1])
        .unwrap();
    items.swap(target1, target2);
    save_json(items);
}

#[debug_handler]
async fn ldaplogin(
    cookies: Cookies,
    State(core): State<Core>,
    Form(log_in): Form<LogIn>,
) -> Result<impl IntoResponse, Error> {
    let username = log_in.username.trim();
    let password = log_in.password.trim();
    let (con, mut ldap) =
        ldap3::LdapConnAsync::new(&format!("ldap://{}:3890", env::var("TODO_NETWORK")?)).await?;
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
            .domain(env::var("TODO_DOMAIN")?)
            .path("/")
            .max_age(cookie::time::Duration::days(7))
            .secure(true)
            .same_site(cookie::SameSite::Strict)
            .http_only(true)
            .finish();
        cookies.add(cookie);
        Ok(Redirect::to("/").into_response())
    } else {
        println!("logging in failed.");
        Ok(Redirect::to("/").into_response())
    }
}

#[debug_handler]
async fn logout(cookies: Cookies) -> Result<impl IntoResponse, Error> {
    if cookies.get(COOKIE_NAME).is_some() {
        let cookie = Cookie::build(COOKIE_NAME, "")
            .domain(env::var("TODO_DOMAIN")?)
            .path("/")
            .max_age(cookie::time::Duration::seconds(0))
            .same_site(cookie::SameSite::Strict)
            .secure(true)
            .http_only(true)
            .finish();
        cookies.add(cookie);
        println!("cookie removed");
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

fn save_json(items: MutexGuard<VecDeque<Item>>) {
    let json = serde_json::to_string(&Items(items.clone())).unwrap();
    std::fs::write("items.json", json).unwrap();
}
