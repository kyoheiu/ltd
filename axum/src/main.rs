mod error;

use axum::debug_handler;
use axum::extract::{Query, State, Json};
use axum::http::StatusCode;
use axum::response::{Html, IntoResponse, Redirect};
use axum::Form;
use axum::{
    routing::{get, post},
    Router,
};
use error::Error;
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, VecDeque};
use std::env;
use std::sync::{Arc, Mutex};
use tower_cookies::{Cookie, CookieManagerLayer, Cookies};
use tower_http::services::ServeDir;

const COOKIE_NAME: &str = "way_auth";

#[derive(Clone)]
struct Core {
    encoding_key: EncodingKey,
    decoding_key: DecodingKey,
    items: Arc<Mutex<VecDeque<Item>>>
}

impl Core {
    fn default() -> Result<Self, Error> {
    let json = std::fs::read_to_string("task.json");
    let json = match json {
        Err(_) => {
            println!("json file not found");
            VecDeque::new()
        },
        Ok(json) => {
            let json: VecDeque<Item> = serde_json::from_str(&json).unwrap();
            println!("{:?}", json);
            json
        }
    };
        Ok(Core {
            encoding_key: EncodingKey::from_secret(env::var("TODO_SECRET_KEY")?.as_bytes()),
            decoding_key: DecodingKey::from_secret(env::var("TODO_SECRET_KEY")?.as_bytes()),
            items: Arc::new(Mutex::new(json))
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
    tags: Option<Vec<String>>
}

#[derive(Debug, Serialize, Deserialize)]
struct PostValue {
    id: String,
    value: String
}

#[derive(Debug, Serialize, Deserialize)]
struct DeleteValue {
    position: usize
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
        .route("/task", get(read_item).post(post_item).delete(delete_item))
        .route("/api/ldaplogin", post(ldaplogin))
        .route("/api/logout", get(logout))
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
async fn read_item(State(core): State<Core>) -> Json<Vec<Item>> {
    Json(core.items.lock().unwrap().clone().into())
}

#[debug_handler]
async fn post_item(State(core): State<Core>, Json(payload): Json<PostValue>) {
    println!("item to add: {:?}", payload);
    let mut items = core.items.lock().unwrap();
    items.push_front(Item {
        id: payload.id,
        value: payload.value,
        todo: true,
        tags: None
    });
    let json = serde_json::to_string(&Items(items.clone())).unwrap();
    std::fs::write("task.json", json).unwrap(); 
}

#[debug_handler]
async fn delete_item(State(core): State<Core>, Json(payload): Json<DeleteValue>) {
    println!("position to delete: {:?}", payload);
    let mut items = core.items.lock().unwrap();
    items.remove(payload.position);
    let json = serde_json::to_string(&Items(items.clone())).unwrap();
    std::fs::write("task.json", json).unwrap(); 
}

#[debug_handler]
async fn auth(
    Query(params): Query<BTreeMap<String, String>>,
    cookies: Cookies,
    State(core): State<Arc<Core>>,
) -> impl IntoResponse {
    if let Ok(_name) = is_valid(cookies, &core.decoding_key) {
        (StatusCode::OK, "Verified").into_response()
    } else {
        let rf = params.get("ref").unwrap();
        Redirect::to(&format!("/?ref={}", rf)).into_response()
    }
}

// #[debug_handler]
// async fn login(
//     Query(params): Query<BTreeMap<String, String>>,
//     cookies: Cookies,
//     State(core): State<Arc<Core>>,
//     Form(log_in): Form<LogIn>,
// ) -> impl IntoResponse {
//     let username = log_in.username.trim();
//     let password = log_in.password.trim();
//     if username == env::var("WAY_USERNAME").unwrap().trim()
//         && password == env::var("WAY_PASSWORD").unwrap().trim()
//     {
//         let my_claims = Claims {
//             sub: env::var("WAY_USERNAME").unwrap(),
//             exp: 2000000000,
//         };
//         let token = encode(&Header::default(), &my_claims, &core.encoding_key).unwrap();
//         let cookie = Cookie::build(COOKIE_NAME, token)
//             .domain(env::var("WAY_DOMAIN").unwrap())
//             .path("/")
//             .max_age(cookie::time::Duration::days(7))
//             .secure(true)
//             .http_only(true)
//             .finish();
//         cookies.add(cookie);
//
//         if let Some(rf) = params.get("ref") {
//             Redirect::to(rf).into_response()
//         } else {
//             Redirect::to("/").into_response()
//         }
//     } else {
//         Redirect::to("/").into_response()
//     }
// }

#[debug_handler]
async fn ldaplogin(
    Query(params): Query<BTreeMap<String, String>>,
    cookies: Cookies,
    State(core): State<Core>,
    Form(log_in): Form<LogIn>,
) -> Result<impl IntoResponse, Error> {
    let username = log_in.username.trim();
    let password = log_in.password.trim();
    let (con, mut ldap) = ldap3::LdapConnAsync::new(&format!("ldap://{}:3890", env::var("TODO_NETWORK")?)).await?;
    ldap3::drive!(con);
    if let Ok(_result) = ldap.simple_bind(username, password).await?.success() {
        println!("{:#?}", _result);
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
            .http_only(true)
            .finish();
        cookies.add(cookie);

        if let Some(rf) = params.get("ref") {
            Ok(Redirect::to(rf).into_response())
        } else {
            Ok(Redirect::to("/").into_response())
        }
    } else {
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
