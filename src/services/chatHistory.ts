import { invoke } from '@tauri-apps/api/core'

// 聊天消息接口
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  name?: string
  tool_calls?: Array<{
    id: string
    type: string
    function: {
      name: string
      arguments: string
    }
  }>
  tool_call_id?: string
  timestamp?: number
}

// 聊天历史记录管理类
export class ChatHistoryManager {
  private characterId: string

  constructor(characterId: string) {
    this.characterId = characterId
  }

  // 保存消息到历史记录
  async saveMessage(message: ChatMessage): Promise<void> {
    try {
      const messageWithTimestamp = {
        ...message,
        timestamp: Date.now()
      }

      await invoke('save_chat_message', {
        characterId: this.characterId,
        message: messageWithTimestamp
      })
    } catch (error) {
      console.error('保存聊天历史记录失败:', error)
      throw error
    }
  }

  // 加载聊天历史记录
  async loadHistory(): Promise<ChatMessage[]> {
    try {
      const history = await invoke<ChatMessage[]>('load_chat_history', {
        characterId: this.characterId
      })
      return history
    } catch (error) {
      console.error('加载聊天历史记录失败:', error)
      throw error
    }
  }

  // 清空聊天历史记录
  async clearHistory(): Promise<void> {
    try {
      await invoke('clear_chat_history', {
        characterId: this.characterId
      })
    } catch (error) {
      console.error('清空聊天历史记录失败:', error)
      throw error
    }
  }

  // 删除特定历史记录行（用于消息编辑）
  async deleteMessage(index: number): Promise<void> {
    try {
      await invoke('delete_chat_message', {
        characterId: this.characterId,
        index
      })
    } catch (error) {
      console.error('删除消息失败:', error)
      throw error
    }
  }

  // 更新特定消息
  async updateMessage(index: number, newMessage: ChatMessage): Promise<void> {
    try {
      await invoke('update_chat_message', {
        characterId: this.characterId,
        index,
        message: newMessage
      })
    } catch (error) {
      console.error('更新消息失败:', error)
      throw error
    }
  }

  // 获取最后一条消息
  async getLastMessage(): Promise<ChatMessage | null> {
    try {
      const message = await invoke<ChatMessage | null>('get_last_chat_message', {
        characterId: this.characterId
      })
      return message
    } catch (error) {
      console.error('获取最后一条消息失败:', error)
      return null
    }
  }

  // 获取最近的消息（用于上下文）
  async getRecentMessages(count: number = 10): Promise<ChatMessage[]> {
    try {
      const messages = await invoke<ChatMessage[]>('get_recent_chat_messages', {
        characterId: this.characterId,
        count
      })
      return messages
    } catch (error) {
      console.error('获取最近消息失败:', error)
      return []
    }
  }
}