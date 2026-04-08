use crate::models::{Product, Category};
use chrono;

// Mock categories
pub const MOCK_CATEGORIES: &[(&str, &str, &str)] = &[
    ("1", "Coffee", "Espresso drinks and coffee"),
    ("2", "Tea", "Tea beverages"),
    ("3", "Pastries", "Breads and pastries"),
    ("4", "Sandwiches", "Breakfast and lunch sandwiches"),
    ("5", "Desserts", "Cakes and desserts"),
];

// Mock products
pub const MOCK_PRODUCTS: &[(&str, &str, &str, &str, &str, i32)] = &[
    ("1", "1", "Espresso", "60.00", "ESP-001", 100),
    ("2", "1", "Americano", "75.00", "AME-001", 100),
    ("3", "1", "Cappuccino", "95.00", "CAP-001", 100),
    ("4", "1", "Latte", "95.00", "LAT-001", 100),
    ("5", "1", "Flat White", "100.00", "FW-001", 100),
    ("6", "1", "Café Café (Spanish Latte)", "85.00", "CC-001", 100),
    ("7", "2", "Iced Tea", "55.00", "ICED-TEA", 100),
    ("8", "2", "Hot Tea", "45.00", "HOT-TEA", 100),
    ("9", "3", "Croissant", "65.00", "CROI-001", 50),
    ("10", "3", "Muffin", "55.00", "MUFF-001", 60),
    ("11", "4", "Ham & Cheese Sandwich", "120.00", "HAM-001", 30),
    ("12", "5", "Chocolate Cake", "145.00", "CHOC-CAKE", 20),
];

pub fn get_categories() -> Vec<Category> {
    MOCK_CATEGORIES
        .iter()
        .enumerate()
        .map(|(idx, (id, name, description))| Category {
            id: id.to_string(),
            name: name.to_string(),
            description: Some(description.to_string()),
            color: None,
            sort_order: idx as i32,
            is_active: true,
            created_at: chrono::Local::now().to_rfc3339(),
            updated_at: chrono::Local::now().to_rfc3339(),
        })
        .collect()
}

pub fn get_products(category_id: Option<&str>) -> Vec<Product> {
    MOCK_PRODUCTS
        .iter()
        .filter(|(_, cat_id, _, _, _, _)| {
            if let Some(filter_cat) = category_id {
                cat_id == &filter_cat
            } else {
                true
            }
        })
        .map(|(id, category_id, name, price, sku, stock)| Product {
            id: id.to_string(),
            category_id: Some(category_id.to_string()),
            name: name.to_string(),
            description: None,
            sku: Some(sku.to_string()),
            barcode: None,
            price: price.to_string(),
            cost: None,
            vat_inclusive: false,
            stock_quantity: *stock,
            low_stock_threshold: 10,
            track_stock: true,
            image_url: None,
            is_active: true,
            is_featured: false,
            sort_order: 0,
            tags: None,
            allergens: None,
            created_at: chrono::Local::now().to_rfc3339(),
            updated_at: chrono::Local::now().to_rfc3339(),
        })
        .collect()
}

pub fn get_product_by_id(product_id: &str) -> Option<Product> {
    MOCK_PRODUCTS
        .iter()
        .find(|(id, _, _, _, _, _)| id == &product_id)
        .map(|(id, category_id, name, price, sku, stock)| Product {
            id: id.to_string(),
            category_id: Some(category_id.to_string()),
            name: name.to_string(),
            description: None,
            sku: Some(sku.to_string()),
            barcode: None,
            price: price.to_string(),
            cost: None,
            vat_inclusive: false,
            stock_quantity: *stock,
            low_stock_threshold: 10,
            track_stock: true,
            image_url: None,
            is_active: true,
            is_featured: false,
            sort_order: 0,
            tags: None,
            allergens: None,
            created_at: chrono::Local::now().to_rfc3339(),
            updated_at: chrono::Local::now().to_rfc3339(),
        })
}

