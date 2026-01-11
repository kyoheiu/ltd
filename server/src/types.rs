use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct LogIn {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Value {
    pub value: String,
    pub ou: String,
}
