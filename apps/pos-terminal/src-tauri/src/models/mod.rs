use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct User {
    pub id: String,
    pub name: String,
    pub email: String,
    pub role: String,
    pub is_active: bool,
    pub avatar_url: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Product {
    pub id: String,
    pub category_id: Option<String>,
    pub name: String,
    pub description: Option<String>,
    pub sku: Option<String>,
    pub barcode: Option<String>,
    pub price: String,
    pub cost: Option<String>,
    pub vat_inclusive: bool,
    pub stock_quantity: i32,
    pub low_stock_threshold: i32,
    pub track_stock: bool,
    pub image_url: Option<String>,
    pub is_active: bool,
    pub is_featured: bool,
    pub sort_order: i32,
    pub tags: Option<Vec<String>>,
    pub allergens: Option<Vec<String>>,
    pub created_at: String,
    pub updated_at: String,
}


#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Category {
    pub id: String,
    pub name: String,
    pub description: Option<String>,
    pub color: Option<String>,
    pub sort_order: i32,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderItem {
    pub product_id: String,
    pub quantity: i32,
    pub unit_price: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Order {
    pub id: String,
    pub session_id: String,
    pub terminal_id: String,
    pub cashier_id: String,
    pub items: Vec<OrderItem>,
    pub subtotal: String,
    pub vat: String,
    pub total: String,
    pub payment_method: String,
    pub status: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LoginResponse {
    pub user: User,
    pub session_id: String,
    pub terminal_id: String,
    pub token: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiResponse<T> {
    pub success: bool,
    pub data: Option<T>,
    pub error: Option<String>,
}
