use crate::models::{Order, OrderItem};
use serde_json::json;
use std::sync::Mutex;
use uuid::Uuid;

// In-memory order storage
lazy_static::lazy_static! {
    pub static ref ORDERS: Mutex<Vec<Order>> = Mutex::new(Vec::new());
}

#[derive(serde::Deserialize)]
pub struct CreateOrderRequest {
    pub session_id: String,
    pub terminal_id: String,
    pub cashier_id: String,
    pub items: Vec<OrderItem>,
    pub subtotal: String,
    pub vat: String,
    pub total: String,
    pub payment_method: String,
}

pub fn create_order(req: CreateOrderRequest) -> Result<serde_json::Value, String> {
    if req.items.is_empty() {
        return Err("Order must contain at least one item".to_string());
    }

    let order_id = Uuid::new_v4().to_string();
    let order_number = format!("ORD-{}", chrono::Utc::now().timestamp_millis());

    let order = Order {
        id: order_id.clone(),
        session_id: req.session_id,
        terminal_id: req.terminal_id,
        cashier_id: req.cashier_id,
        items: req.items,
        subtotal: req.subtotal,
        vat: req.vat,
        total: req.total.clone(),
        payment_method: req.payment_method,
        status: "completed".to_string(),
        created_at: chrono::Utc::now().to_rfc3339(),
    };

    let mut orders = ORDERS.lock().unwrap();
    orders.push(order);

    Ok(json!({
        "orderId": order_id,
        "orderNumber": order_number,
        "total": req.total
    }))
}

pub fn get_orders(session_id: Option<&str>) -> Vec<Order> {
    let orders = ORDERS.lock().unwrap();
    if let Some(id) = session_id {
        orders
            .iter()
            .filter(|o| o.session_id == id)
            .cloned()
            .collect()
    } else {
        orders.clone()
    }
}
