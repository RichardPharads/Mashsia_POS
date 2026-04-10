use crate::models::{ApiResponse, LoginResponse};
use serde::Serialize;
use std::time::Duration;
use tauri::async_runtime;

/// Payload sent to the API login endpoint.
#[derive(Serialize)]
struct LoginRequest {
    pin: String,
    terminal_id: String,
}

/// Resolve the base URL for the API.
///
/// Priority:
/// 1. `API_URL` environment variable.
/// 2. Default to `http://localhost:3000`.
pub fn get_api_url() -> String {
    std::env::var("API_URL").unwrap_or_else(|_| "http://localhost:3000".to_string())
}

pub fn get_terminal_id() -> String {
    std::env::var("TERMINAL_ID").unwrap_or_else(|_| "POS-TERMINAL".to_string())
}

/// Perform a PIN-based login against the external API.
///
/// This function blocks on Tauri's async runtime so it can be used from the
/// synchronous command handler without changing its signature.
fn resolve_terminal_id(override_id: Option<&str>) -> String {
    match override_id {
        Some(id) if !id.trim().is_empty() => id.to_string(),
        _ => get_terminal_id(),
    }
}

pub fn login_with_pin_with_terminal(
    pin: &str,
    terminal_id_override: Option<&str>,
) -> Result<LoginResponse, String> {
    let terminal_id = resolve_terminal_id(terminal_id_override);
    let payload = LoginRequest {
        pin: pin.to_owned(),
        terminal_id,
    };

    async_runtime::block_on(async move {
        let api_url = get_api_url();
        let endpoint = format!("{}/auth/login-pin", api_url.trim_end_matches('/'));

        let client = reqwest::Client::builder()
            .timeout(Duration::from_secs(10))
            .build()
            .map_err(|err| format!("Failed to construct HTTP client: {}", err))?;

        let response = client
            .post(&endpoint)
            .json(&payload)
            .send()
            .await
            .map_err(|err| format!("API request failed: {}", err))?;

        if !response.status().is_success() {
            let status = response.status();
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "<unable to read response body>".to_string());
            return Err(format!("Login failed with status {}: {}", status, body));
        }

        let parsed: ApiResponse<LoginResponse> = response
            .json()
            .await
            .map_err(|err| format!("Failed to deserialize login response: {}", err))?;

        if !parsed.success {
            if let Some(message) = parsed.error {
                return Err(message);
            }
            return Err("Login failed: API returned an unknown error.".to_string());
        }

        parsed
            .data
            .ok_or_else(|| "Login failed: response missing login payload.".to_string())
    })
}

pub fn login_with_pin(pin: &str) -> Result<LoginResponse, String> {
    login_with_pin_with_terminal(pin, None)
}
