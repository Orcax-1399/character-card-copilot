import type { Command, CommandContext, CommandResult } from '@/types/command'

/**
 * 内置命令集合
 * 包含所有预定义的系统命令
 */

/**
 * /clear 命令 - 清空所有对话记录
 */
export const clearCommand: Command = {
  id: 'clear',
  name: '/clear',
  description: '清空所有对话记录',
  icon: 'MdOutlineDelete',
  category: 'history',
  priority: 1,
  requiresConfirmation: true,
  confirmationMessage: '确定要清空所有对话记录吗？此操作不可撤销。',

  // 只有当有消息记录时才显示此命令
  isAvailable: (context: CommandContext) => {
    return context.messages.value.length > 0
  },

  execute: async (context: CommandContext): Promise<CommandResult> => {
    try {
      // 清空后端聊天历史
      if (context.chatHistoryManager) {
        await context.chatHistoryManager.clearHistory()
      }

      // 清空前端消息列表
      context.messages.value = []

      // 关闭命令面板
      context.showCommandPalette.value = false

      // 清空用户输入
      context.userInput.value = ''

      return {
        success: true,
        message: '已清空所有对话记录',
      }
    } catch (error) {
      console.error('清空对话记录失败:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '清空失败，请重试',
      }
    }
  },
}

/**
 * 获取所有内置命令
 * @returns 内置命令数组
 */
export function getBuiltinCommands(): Command[] {
  return [
    clearCommand,
    // 未来可以在这里添加更多命令：
    // exportCommand,
    // helpCommand,
    // statsCommand,
  ]
}

/**
 * 命令模板示例
 * 开发新命令时可以参考此模板
 */
/*
export const exampleCommand: Command = {
  id: 'example',
  name: '/example',
  description: '示例命令说明',
  icon: 'MdOutlineInfo', // 可选，vue-icons-plus 图标名称
  category: 'other', // 可选，命令分类
  priority: 10, // 可选，优先级（数字越小越靠前）
  requiresConfirmation: false, // 可选，是否需要确认

  // 可选，判断命令是否可用
  isAvailable: (context: CommandContext) => {
    return true
  },

  // 命令执行逻辑
  execute: async (context: CommandContext): Promise<CommandResult> => {
    try {
      // 在这里实现命令的具体逻辑
      // 可以访问 context 中的所有上下文信息：
      // - context.messages - 前端消息列表
      // - context.chatHistoryManager - 聊天历史管理器
      // - context.userInput - 用户输入
      // - context.showCommandPalette - 命令面板显示状态
      // - context.characterData - 角色数据（可选）

      return {
        success: true,
        message: '命令执行成功',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '命令执行失败',
      }
    }
  },
}
*/
