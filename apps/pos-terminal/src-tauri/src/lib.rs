use tauri::Manager;

pub mod commands;
pub mod models;
pub mod services;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                app.get_webview_window("main").unwrap().open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // Auth commands
            commands::login_with_pin,
            // Products commands
            commands::get_categories,
            commands::get_products,
            commands::get_product,
            // Orders commands
            commands::create_order,
            commands::get_orders,
            // Manager commands
            commands::void_transaction,
            // Health check
            commands::get_health,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

