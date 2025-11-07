use crate::command_system::builtin::ClearCommand;
use crate::command_system::command::{CommandContext, CommandMetadata, CommandResult};
use crate::command_system::registry::COMMAND_REGISTRY;
use crate::events::EventEmitter;
use std::sync::Arc;

/// 初始化命令系统
/// 在应用启动时调用，注册所有内置命令
pub async fn initialize_command_system() {
    // 注册内置命令
    COMMAND_REGISTRY
        .register(Arc::new(ClearCommand::new()))
        .await;

    println!("✅ 命令系统初始化完成，已注册 1 个命令");
}

/// 获取可用命令列表
#[tauri::command]
pub async fn get_available_commands(app_handle: tauri::AppHandle) -> Result<Vec<CommandMetadata>, String> {
    let session_uuid = crate::character_state::get_active_character();

    let context = CommandContext {
        session_uuid,
        app_handle,
        user_input: None,
    };

    Ok(COMMAND_REGISTRY.get_available_commands(&context).await)
}

/// 搜索命令
#[tauri::command]
pub async fn search_commands(
    app_handle: tauri::AppHandle,
    query: String,
) -> Result<Vec<CommandMetadata>, String> {
    let session_uuid = crate::character_state::get_active_character();

    let context = CommandContext {
        session_uuid,
        app_handle,
        user_input: None,
    };

    Ok(COMMAND_REGISTRY.search_commands(&query, &context).await)
}

/// 执行命令
#[tauri::command]
pub async fn execute_command(
    app_handle: tauri::AppHandle,
    command_id: String,
    user_input: Option<String>,
) -> Result<CommandResult, String> {
    let session_uuid = crate::character_state::get_active_character();

    let context = CommandContext {
        session_uuid: session_uuid.clone(),
        app_handle: app_handle.clone(),
        user_input,
    };

    // 发送命令开始执行事件（使用 progress 事件）
    if let Some(ref uuid) = context.session_uuid {
        EventEmitter::send_progress(
            &app_handle,
            uuid,
            &format!("command:{}", command_id),
            0.0,
            Some("命令开始执行"),
        )?;
    }

    // 执行命令
    let result = COMMAND_REGISTRY
        .execute_command(&command_id, context)
        .await?;

    // 发送命令执行完成事件（使用 progress 事件）
    if let Some(uuid) = session_uuid {
        EventEmitter::send_progress(
            &app_handle,
            &uuid,
            &format!("command:{}", command_id),
            1.0,
            Some(if result.success {
                "命令执行成功"
            } else {
                "命令执行失败"
            }),
        )?;
    }

    Ok(result)
}
