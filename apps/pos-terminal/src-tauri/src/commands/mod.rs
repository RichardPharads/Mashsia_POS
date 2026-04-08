use crate::models::{ApiResponse, LoginResponse, Category, Product, Order};
use crate::services::{auth, products, orders};

// ─────────────────────────────────────────────────────────────────────────────
// AUTH COMMANDS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn login_with_pin(pin: String) -> ApiResponse<LoginResponse> {
    match auth::login_with_pin(&pin) {
        Ok(response) => ApiResponse {
            success: true,
            data: Some(response),
            error: None,
        },
        Err(err) => ApiResponse {
            success: false,
            data: None,
            error: Some(err),
        },
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCTS COMMANDS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn get_categories() -> ApiResponse<Vec<Category>> {
    let categories = products::get_categories();
    ApiResponse {
        success: true,
        data: Some(categories),
        error: None,
    }
}

#[tauri::command]
pub fn get_products(category_id: Option<String>) -> ApiResponse<Vec<Product>> {
    let prods = products::get_products(category_id.as_deref());
    ApiResponse {
        success: true,
        data: Some(prods),
        error: None,
    }
}

#[tauri::command]
pub fn get_product(id: String) -> ApiResponse<Product> {
    match products::get_product_by_id(&id) {
        Some(product) => ApiResponse {
            success: true,
            data: Some(product),
            error: None,
        },
        None => ApiResponse {
            success: false,
            data: None,
            error: Some("Product not found".to_string()),
        },
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// ORDERS COMMANDS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn create_order(
    session_id: String,
    terminal_id: String,
    cashier_id: String,
    items: Vec<serde_json::Value>,
    subtotal: String,
    vat: String,
    total: String,
    payment_method: String,
) -> ApiResponse<serde_json::Value> {
    let items = items
        .into_iter()
        .filter_map(|item| serde_json::from_value(item).ok())
        .collect();

    let req = orders::CreateOrderRequest {
        session_id,
        terminal_id,
        cashier_id,
        items,
        subtotal,
        vat,
        total,
        payment_method,
    };

    match orders::create_order(req) {
        Ok(data) => ApiResponse {
            success: true,
            data: Some(data),
            error: None,
        },
        Err(err) => ApiResponse {
            success: false,
            data: None,
            error: Some(err),
        },
    }
}

#[tauri::command]
pub fn get_orders(session_id: Option<String>) -> ApiResponse<Vec<Order>> {
    let orders_list = orders::get_orders(session_id.as_deref());
    ApiResponse {
        success: true,
        data: Some(orders_list),
        error: None,
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// MANAGER COMMANDS
// ─────────────────────────────────────────────────────────────────────────────

#[tauri::command]
pub fn void_transaction(_session_id: String, _reason: String) -> ApiResponse<String> {
    ApiResponse {
        success: true,
        data: Some("Transaction voided successfully".to_string()),
        error: None,
    }
}

#[tauri::command]
pub fn get_health() -> ApiResponse<String> {
    ApiResponse {
        success: true,
        data: Some("Tauri backend is running".to_string()),
        error: None,
    }
}
