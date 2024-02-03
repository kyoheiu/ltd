use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
};
use tracing::warn;

#[derive(Debug)]
pub enum Error {
    Io(String),
    Env(String),
    Ldap(String),
    Jwt(String),
    Json(String),
    ParseInt(String),
    SystemTime,
    Header,
    NotVerified,
    OrganizationalUnitName,
    MissingId,
}

impl std::error::Error for Error {}

impl std::fmt::Display for Error {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        let printable = match self {
            Error::Io(s) => s,
            Error::Env(s) => s,
            Error::Ldap(s) => s,
            Error::Jwt(s) => s,
            Error::Json(s) => s,
            Error::ParseInt(s) => s,
            Error::SystemTime => "SystemTimeError.",
            Error::Header => "Token not found.",
            Error::NotVerified => "Not verified.",
            Error::OrganizationalUnitName => "OrganizationalUnitName not found.",
            Error::MissingId => "ID not found.",
        };
        write!(f, "{}", printable)
    }
}

impl From<std::io::Error> for Error {
    fn from(err: std::io::Error) -> Self {
        Error::Io(err.to_string())
    }
}

impl From<ldap3::LdapError> for Error {
    fn from(err: ldap3::LdapError) -> Self {
        Error::Ldap(err.to_string())
    }
}

impl From<std::env::VarError> for Error {
    fn from(err: std::env::VarError) -> Self {
        Error::Env(err.to_string())
    }
}

impl From<http::header::ToStrError> for Error {
    fn from(err: http::header::ToStrError) -> Self {
        Error::Io(err.to_string())
    }
}

impl From<serde_json::Error> for Error {
    fn from(err: serde_json::Error) -> Self {
        Error::Json(err.to_string())
    }
}

impl From<jsonwebtoken::errors::Error> for Error {
    fn from(err: jsonwebtoken::errors::Error) -> Self {
        Error::Jwt(err.to_string())
    }
}

impl From<std::num::ParseIntError> for Error {
    fn from(err: std::num::ParseIntError) -> Self {
        Error::ParseInt(err.to_string())
    }
}

impl From<std::time::SystemTimeError> for Error {
    fn from(_err: std::time::SystemTimeError) -> Self {
        Error::SystemTime
    }
}

impl IntoResponse for Error {
    fn into_response(self) -> Response {
        let body = match self {
            Error::Io(s) => s,
            Error::Env(s) => s,
            Error::Ldap(s) => s,
            Error::Jwt(s) => s,
            Error::Json(s) => s,
            Error::ParseInt(s) => s,
            Error::SystemTime => "SystemTimeError.".to_string(),
            Error::Header => "Token not found.".to_string(),
            Error::NotVerified => "Not verified.".to_string(),
            Error::OrganizationalUnitName => "OrganizationalUnitName not found.".to_string(),
            Error::MissingId => "ID not found.".to_string(),
        };
        warn!(body);
        (StatusCode::INTERNAL_SERVER_ERROR, body).into_response()
    }
}
