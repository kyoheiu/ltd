use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
pub struct LogIn {
    pub username: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct Sorted {
    old: usize,
    new: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
}
