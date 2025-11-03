use std::sync::{Arc, Mutex};

/// 全局角色状态管理器
pub struct CharacterStateManager {
    current_character: Arc<Mutex<Option<String>>>, // 存储当前活跃角色的UUID
}

impl CharacterStateManager {
    /// 创建新的状态管理器
    pub fn new() -> Self {
        Self {
            current_character: Arc::new(Mutex::new(None)),
        }
    }

    /// 设置当前活跃角色
    pub fn set_current_character(&self, character_uuid: String) -> Result<(), String> {
        let mut current = self
            .current_character
            .lock()
            .map_err(|e| format!("锁定失败: {}", e))?;
        *current = Some(character_uuid);
        Ok(())
    }

    /// 获取当前活跃角色UUID
    pub fn get_current_character(&self) -> Option<String> {
        let current = self.current_character.lock().ok()?;
        current.clone()
    }

    /// 清除当前活跃角色（退出角色时）
    pub fn clear_current_character(&self) -> Result<(), String> {
        let mut current = self
            .current_character
            .lock()
            .map_err(|e| format!("锁定失败: {}", e))?;
        *current = None;
        Ok(())
    }

    /// 检查是否有活跃角色
    pub fn has_active_character(&self) -> bool {
        let current = self.current_character.lock().ok();
        current.map(|c| c.is_some()).unwrap_or(false)
    }
}

// 全局状态管理器实例
lazy_static::lazy_static! {
    pub static ref CHARACTER_STATE: CharacterStateManager = CharacterStateManager::new();
}

// ====================== Tauri命令 ======================

#[tauri::command]
pub fn set_active_character(character_uuid: String) -> Result<(), String> {
    CHARACTER_STATE.set_current_character(character_uuid)
}

#[tauri::command]
pub fn get_active_character() -> Option<String> {
    CHARACTER_STATE.get_current_character()
}

#[tauri::command]
pub fn clear_active_character() -> Result<(), String> {
    CHARACTER_STATE.clear_current_character()
}

#[tauri::command]
pub fn has_active_character() -> bool {
    CHARACTER_STATE.has_active_character()
}
