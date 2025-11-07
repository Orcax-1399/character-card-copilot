use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

/// AI工具调用结果
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolResult {
    pub success: bool,
    pub data: Option<Value>,
    pub error: Option<String>,
    pub execution_time_ms: u64,
}

/// AI工具调用请求
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolCallRequest {
    pub tool_name: String,
    pub parameters: HashMap<String, Value>,
    pub character_uuid: Option<String>, // 角色UUID
    pub context: Option<Value>,         // CharacterData or other context
}

