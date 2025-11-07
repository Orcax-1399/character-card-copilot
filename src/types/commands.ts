/**
 * 后端命令系统类型定义
 * 与 Rust 侧的命令结构体对应
 */

/**
 * 命令元数据（与 Rust CommandMetadata 对应）
 */
export interface CommandMetadata {
  /** 命令唯一标识符 */
  id: string
  /** 命令名称（用于显示） */
  name: string
  /** 命令描述 */
  description: string
  /** 命令图标（可选） */
  icon?: string
  /** 命令分类（可选） */
  category?: CommandCategory
  /** 优先级（数值越小优先级越高） */
  priority: number
  /** 是否需要确认 */
  requires_confirmation: boolean
  /** 确认提示消息（可选） */
  confirmation_message?: string
}

/**
 * 命令分类
 */
export type CommandCategory = 'chat' | 'history' | 'export' | 'settings' | 'other'

/**
 * 命令执行结果（与 Rust CommandResult 对应）
 */
export interface CommandResult {
  /** 执行是否成功 */
  success: boolean
  /** 成功消息（可选） */
  message?: string
  /** 错误消息（可选） */
  error?: string
  /** 返回数据（可选） */
  data?: any
}
