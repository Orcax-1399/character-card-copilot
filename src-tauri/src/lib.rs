mod file_utils;
mod character_storage;
mod api_config;

use character_storage::{CharacterStorage, CharacterData, TavernCardV2};
use api_config::{ApiConfigService, ApiConfig, CreateApiRequest, UpdateApiRequest, ApiTestResult, ModelInfo};

// ====================== 角色卡相关命令 ======================

#[tauri::command]
async fn get_all_characters(app_handle: tauri::AppHandle) -> Result<Vec<CharacterData>, String> {
    CharacterStorage::get_all_characters(&app_handle)
}

#[tauri::command]
async fn get_character_by_uuid(app_handle: tauri::AppHandle, uuid: String) -> Result<Option<CharacterData>, String> {
    CharacterStorage::get_character_by_uuid(&app_handle, &uuid)
}

#[tauri::command]
async fn create_character(app_handle: tauri::AppHandle, name: String) -> Result<CharacterData, String> {
    CharacterStorage::create_character(&app_handle, &name)
}

#[tauri::command]
async fn update_character(app_handle: tauri::AppHandle, uuid: String, card: TavernCardV2) -> Result<(), String> {
    CharacterStorage::update_character(&app_handle, &uuid, &card)
}

#[tauri::command]
async fn delete_character(app_handle: tauri::AppHandle, uuid: String) -> Result<(), String> {
    CharacterStorage::delete_character(&app_handle, &uuid)
}

#[tauri::command]
async fn upload_background_image(app_handle: tauri::AppHandle, uuid: String, image_data: Vec<u8>, extension: String) -> Result<String, String> {
    CharacterStorage::upload_background_image(&app_handle, &uuid, &image_data, &extension)
}

// ====================== API配置相关命令 ======================

#[tauri::command]
async fn get_all_api_configs(app_handle: tauri::AppHandle) -> Result<Vec<ApiConfig>, String> {
    ApiConfigService::get_all_api_configs(&app_handle)
}

#[tauri::command]
async fn get_api_config_by_profile(app_handle: tauri::AppHandle, profile: String) -> Result<Option<ApiConfig>, String> {
    ApiConfigService::get_api_config_by_profile(&app_handle, &profile)
}

#[tauri::command]
async fn get_default_api_config(app_handle: tauri::AppHandle) -> Result<Option<ApiConfig>, String> {
    ApiConfigService::get_default_api_config(&app_handle)
}

#[tauri::command]
async fn create_api_config(app_handle: tauri::AppHandle, request: CreateApiRequest) -> Result<ApiConfig, String> {
    ApiConfigService::create_api_config(&app_handle, request)
}

#[tauri::command]
async fn update_api_config(app_handle: tauri::AppHandle, request: UpdateApiRequest) -> Result<(), String> {
    ApiConfigService::update_api_config(&app_handle, request)
}

#[tauri::command]
async fn delete_api_config(app_handle: tauri::AppHandle, profile: String) -> Result<(), String> {
    ApiConfigService::delete_api_config(&app_handle, &profile)
}

#[tauri::command]
async fn set_default_api_config(app_handle: tauri::AppHandle, profile: String) -> Result<(), String> {
    ApiConfigService::set_default_api_config(&app_handle, &profile)
}

#[tauri::command]
async fn toggle_api_config(app_handle: tauri::AppHandle, profile: String, enabled: bool) -> Result<(), String> {
    ApiConfigService::toggle_api_config(&app_handle, &profile, enabled)
}

#[tauri::command]
async fn test_api_connection(app_handle: tauri::AppHandle, config: ApiConfig) -> Result<ApiTestResult, String> {
    ApiConfigService::test_api_connection(&app_handle, &config).await
}

#[tauri::command]
async fn fetch_models(app_handle: tauri::AppHandle, config: ApiConfig) -> Result<Vec<ModelInfo>, String> {
    ApiConfigService::fetch_models(&app_handle, &config).await
}

// ====================== 通用命令 ======================

#[tauri::command]
fn generate_uuid() -> String {
    file_utils::FileUtils::generate_uuid()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // 角色卡命令
            get_all_characters,
            get_character_by_uuid,
            create_character,
            update_character,
            delete_character,
            upload_background_image,
            // API配置命令
            get_all_api_configs,
            get_api_config_by_profile,
            get_default_api_config,
            create_api_config,
            update_api_config,
            delete_api_config,
            set_default_api_config,
            toggle_api_config,
            test_api_connection,
            fetch_models,
            // 通用命令
            generate_uuid
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
