use crate::models::{User, LoginResponse};
use uuid::Uuid;
use chrono;

// Mock users - embedded in Rust
pub const MOCK_USERS: &[(&str, &str, &str, &str, &str)] = &[
    ("1", "0000", "Owner - Kape Manager", "owner@kape.com", "owner"),
    ("2", "1234", "Manager - Maria Santos", "manager@kape.com", "manager"),
    ("3", "1111", "Cashier - Juan dela Cruz", "juan@kape.com", "cashier"),
    ("4", "2222", "Cashier - Rosa Garcia", "rosa@kape.com", "cashier"),
];

// Allowed roles for POS Terminal
pub const ALLOWED_POS_ROLES: &[&str] = &["cashier", "manager"];

pub fn login_with_pin(pin: &str) -> Result<LoginResponse, String> {
    // Find user by PIN
    let user_data = MOCK_USERS
        .iter()
        .find(|(_, p, _, _, _)| p == &pin)
        .ok_or_else(|| "Invalid PIN".to_string())?;

    let (id, _, name, email, role) = user_data;

    // Check if role is allowed for POS Terminal
    if !ALLOWED_POS_ROLES.contains(role) {
        return Err(format!(
            "{} accounts use the Admin Dashboard, not POS Terminal",
            role.to_uppercase()
        ));
    }

    let session_id = Uuid::new_v4().to_string();
    let terminal_id = Uuid::new_v4().to_string();
    let token = Uuid::new_v4().to_string();
    let now = chrono::Local::now().to_rfc3339();

    Ok(LoginResponse {
        user: User {
            id: id.to_string(),
            name: name.to_string(),
            email: email.to_string(),
            role: role.to_string(),
            is_active: true,
            avatar_url: None,
            created_at: now.clone(),
            updated_at: now,
        },
        session_id,
        terminal_id,
        token,
    })
}
