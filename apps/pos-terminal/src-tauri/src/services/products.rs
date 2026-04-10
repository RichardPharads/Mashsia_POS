use crate::models::{ApiResponse, Category, Product};
use reqwest::{Client, StatusCode};
use serde::de::DeserializeOwned;
use std::time::Duration;
use tauri::async_runtime;

pub fn get_categories() -> Vec<Category> {
    match async_runtime::block_on(async {
        let client = http_client()?;
        let url = build_url("/categories");
        let response = client
            .get(url)
            .send()
            .await
            .map_err(|err| format!("GET /categories failed: {}", err))?;

        parse_api_response::<Vec<Category>>(response).await
    }) {
        Ok(categories) => categories,
        Err(err) => {
            log_error("get_categories", &err);
            Vec::new()
        }
    }
}

pub fn get_products(category_id: Option<&str>) -> Vec<Product> {
    let category_filter = category_id.map(|value| value.to_string());

    match async_runtime::block_on(async move {
        let client = http_client()?;
        let url = build_url("/products");
        let mut request = client.get(url);

        if let Some(ref filter) = category_filter {
            let params = [("categoryId", filter.as_str())];
            request = request.query(&params);
        }

        let response = request
            .send()
            .await
            .map_err(|err| format!("GET /products failed: {}", err))?;

        parse_api_response::<Vec<Product>>(response).await
    }) {
        Ok(products) => products,
        Err(err) => {
            log_error("get_products", &err);
            Vec::new()
        }
    }
}

pub fn get_product_by_id(product_id: &str) -> Option<Product> {
    let product_id = product_id.to_string();

    match async_runtime::block_on(async move {
        let client = http_client()?;
        let url = build_url(&format!("/products/{}", product_id));
        let response = client
            .get(url)
            .send()
            .await
            .map_err(|err| format!("GET /products/{product_id} failed: {}", err))?;

        let status = response.status();

        if status == StatusCode::NOT_FOUND {
            return Ok(None);
        }

        if !status.is_success() {
            let body = response
                .text()
                .await
                .unwrap_or_else(|_| "<unable to read response body>".to_string());
            return Err(format!(
                "GET /products/{product_id} returned {status}: {body}"
            ));
        }

        let product = parse_api_response::<Product>(response).await?;
        Ok(Some(product))
    }) {
        Ok(product) => product,
        Err(err) => {
            log_error("get_product_by_id", &err);
            None
        }
    }
}

fn http_client() -> Result<Client, String> {
    Client::builder()
        .timeout(Duration::from_secs(10))
        .build()
        .map_err(|err| format!("Failed to construct HTTP client: {}", err))
}

fn build_url(path: &str) -> String {
    let base = super::auth::get_api_url();
    format!(
        "{}/{}",
        base.trim_end_matches('/'),
        path.trim_start_matches('/')
    )
}

fn log_error(context: &str, message: &str) {
    eprintln!("[services::products] {context}: {message}");
}

async fn parse_api_response<T>(response: reqwest::Response) -> Result<T, String>
where
    T: DeserializeOwned,
{
    let status = response.status();
    let text = response
        .text()
        .await
        .map_err(|err| format!("Failed to read response body: {}", err))?;

    match serde_json::from_str::<ApiResponse<T>>(&text) {
        Ok(envelope) => {
            if envelope.success {
                envelope
                    .data
                    .ok_or_else(|| "Response payload was empty.".to_string())
            } else {
                Err(envelope
                    .error
                    .unwrap_or_else(|| format!("Request failed (status {status}): {text}")))
            }
        }
        Err(err) => Err(format!(
            "Failed to parse response (status {status}): {text} ({err})"
        )),
    }
}
