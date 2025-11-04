import type { Ref } from 'vue'
import type { ChatHistoryManager } from '@/services/chatHistory'

/**
 * 命令上下文接口
 * 提供命令执行所需的所有上下文信息
 */
export interface CommandContext {
  /** 前端消息列表 */
  messages: Ref<Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
    isEditing?: boolean
  }>>

  /** 聊天历史管理器 */
  chatHistoryManager: ChatHistoryManager | null

  /** 用户输入内容 */
  userInput: Ref<string>

  /** 命令面板显示状态 */
  showCommandPalette: Ref<boolean>

  /** 角色数据（可选） */
  characterData?: any
}

/**
 * 命令执行结果接口
 */
export interface CommandResult {
  /** 是否执行成功 */
  success: boolean

  /** 结果消息 */
  message?: string

  /** 错误信息（如果失败） */
  error?: string

  /** 是否需要用户确认 */
  requiresConfirmation?: boolean

  /** 确认提示信息 */
  confirmationMessage?: string
}

/**
 * 命令接口
 * 定义一个可执行的命令
 */
export interface Command {
  /** 命令唯一标识符（例如：clear） */
  id: string

  /** 命令名称（例如：/clear） */
  name: string

  /** 命令描述 */
  description: string

  /** 命令图标（vue-icons-plus图标名称，可选） */
  icon?: string

  /** 命令分类（可选） */
  category?: 'chat' | 'history' | 'export' | 'settings' | 'other'

  /** 命令优先级（用于排序，数字越小优先级越高） */
  priority?: number

  /** 命令执行函数 */
  execute: (context: CommandContext) => Promise<CommandResult> | CommandResult

  /** 是否在执行前需要确认 */
  requiresConfirmation?: boolean

  /** 确认提示信息 */
  confirmationMessage?: string

  /** 命令是否可用（可选，用于条件性显示命令） */
  isAvailable?: (context: CommandContext) => boolean
}

/**
 * 命令搜索结果
 */
export interface CommandSearchResult {
  /** 匹配的命令 */
  command: Command

  /** 匹配得分（0-1之间，1表示完美匹配） */
  score: number

  /** 匹配的关键字 */
  matchedKeywords?: string[]
}
