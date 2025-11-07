import { invoke } from '@tauri-apps/api/core'
import type { CommandMetadata, CommandResult } from '@/types/commands'

/**
 * 后端命令服务类 - 后端代理层
 * 负责与后端命令系统交互，并提供本地缓存优化
 */
export class BackendCommandService {
  private cachedCommands: CommandMetadata[] = []
  private lastFetchTime: number = 0
  private cacheDuration: number = 5000 // 5秒缓存

  /**
   * 获取可用命令列表（带缓存）
   */
  async getCommands(forceRefresh: boolean = false): Promise<CommandMetadata[]> {
    const now = Date.now()

    // 如果缓存有效且不强制刷新，返回缓存
    if (
      !forceRefresh &&
      this.cachedCommands.length > 0 &&
      now - this.lastFetchTime < this.cacheDuration
    ) {
      return this.cachedCommands
    }

    try {
      // 从后端获取命令列表
      const commands = await invoke<CommandMetadata[]>('get_available_commands')
      this.cachedCommands = commands
      this.lastFetchTime = now
      return commands
    } catch (error) {
      console.error('获取命令列表失败:', error)
      // 返回缓存的命令（如果有）
      return this.cachedCommands
    }
  }

  /**
   * 搜索命令
   */
  async searchCommands(query: string): Promise<CommandMetadata[]> {
    try {
      // 调用后端搜索（后端已实现搜索逻辑）
      return await invoke<CommandMetadata[]>('search_commands', { query })
    } catch (error) {
      console.error('搜索命令失败:', error)

      // 降级到本地搜索（使用缓存的命令）
      const normalizedQuery = query.toLowerCase().trim().replace(/^\//, '')

      return this.cachedCommands.filter(
        (cmd) =>
          cmd.id.toLowerCase().includes(normalizedQuery) ||
          cmd.name.toLowerCase().includes(normalizedQuery) ||
          cmd.description.toLowerCase().includes(normalizedQuery)
      )
    }
  }

  /**
   * 执行命令
   */
  async executeCommand(commandId: string, userInput?: string): Promise<CommandResult> {
    try {
      return await invoke<CommandResult>('execute_command', {
        commandId,
        userInput: userInput || null,
      })
    } catch (error) {
      console.error(`执行命令 "${commandId}" 失败:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '命令执行失败',
      }
    }
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.cachedCommands = []
    this.lastFetchTime = 0
  }
}

// 导出全局实例
export const backendCommandService = new BackendCommandService()
