import type { Command, CommandContext, CommandResult, CommandSearchResult } from '@/types/command'

/**
 * 命令服务类
 * 负责命令的注册、管理、搜索和执行
 */
export class CommandService {
  private commands: Map<string, Command> = new Map()

  /**
   * 注册一个命令
   * @param command 要注册的命令
   */
  registerCommand(command: Command): void {
    if (this.commands.has(command.id)) {
      console.warn(`命令 "${command.id}" 已存在，将被覆盖`)
    }
    this.commands.set(command.id, command)
  }

  /**
   * 批量注册命令
   * @param commands 要注册的命令数组
   */
  registerCommands(commands: Command[]): void {
    commands.forEach(command => this.registerCommand(command))
  }

  /**
   * 注销一个命令
   * @param commandId 要注销的命令ID
   */
  unregisterCommand(commandId: string): void {
    if (!this.commands.has(commandId)) {
      console.warn(`命令 "${commandId}" 不存在`)
      return
    }
    this.commands.delete(commandId)
  }

  /**
   * 获取所有可用的命令
   * @param context 命令上下文（用于判断命令是否可用）
   * @returns 可用的命令数组，按优先级排序
   */
  getCommands(context?: CommandContext): Command[] {
    const commands = Array.from(this.commands.values())

    // 过滤出可用的命令
    const availableCommands = context
      ? commands.filter(cmd => !cmd.isAvailable || cmd.isAvailable(context))
      : commands

    // 按优先级排序（优先级数字越小越靠前，未设置优先级的排在最后）
    return availableCommands.sort((a, b) => {
      const priorityA = a.priority ?? 999
      const priorityB = b.priority ?? 999
      return priorityA - priorityB
    })
  }

  /**
   * 根据ID获取命令
   * @param commandId 命令ID
   * @returns 命令对象或undefined
   */
  getCommand(commandId: string): Command | undefined {
    return this.commands.get(commandId)
  }

  /**
   * 搜索命令
   * @param query 搜索关键字（例如："/clear"、"clear"、"清空"）
   * @param context 命令上下文（用于判断命令是否可用）
   * @returns 匹配的命令搜索结果数组，按匹配度排序
   */
  searchCommands(query: string, context?: CommandContext): CommandSearchResult[] {
    if (!query || query.trim() === '') {
      // 如果没有查询，返回所有可用命令
      return this.getCommands(context).map(command => ({
        command,
        score: 1,
      }))
    }

    // 规范化查询字符串
    const normalizedQuery = query.toLowerCase().trim().replace(/^\//, '')

    const results: CommandSearchResult[] = []

    for (const command of this.commands.values()) {
      // 检查命令是否可用
      if (context && command.isAvailable && !command.isAvailable(context)) {
        continue
      }

      // 计算匹配得分
      const score = this.calculateMatchScore(command, normalizedQuery)

      if (score > 0) {
        results.push({
          command,
          score,
          matchedKeywords: this.getMatchedKeywords(command, normalizedQuery),
        })
      }
    }

    // 按匹配得分降序排序
    return results.sort((a, b) => b.score - a.score)
  }

  /**
   * 执行命令
   * @param commandId 命令ID
   * @param context 命令上下文
   * @returns 命令执行结果
   */
  async executeCommand(commandId: string, context: CommandContext): Promise<CommandResult> {
    const command = this.commands.get(commandId)

    if (!command) {
      return {
        success: false,
        error: `命令 "${commandId}" 不存在`,
      }
    }

    // 检查命令是否可用
    if (command.isAvailable && !command.isAvailable(context)) {
      return {
        success: false,
        error: `命令 "${command.name}" 当前不可用`,
      }
    }

    try {
      // 执行命令
      const result = await command.execute(context)
      return result
    } catch (error) {
      console.error(`执行命令 "${commandId}" 失败:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : '命令执行失败',
      }
    }
  }

  /**
   * 计算命令与查询的匹配得分
   * @param command 命令对象
   * @param query 规范化后的查询字符串
   * @returns 匹配得分（0-1之间，0表示不匹配，1表示完美匹配）
   */
  private calculateMatchScore(command: Command, query: string): number {
    const commandId = command.id.toLowerCase()
    const commandName = command.name.toLowerCase().replace(/^\//, '')
    const commandDescription = command.description.toLowerCase()

    // 完美匹配（命令ID或名称完全匹配）
    if (commandId === query || commandName === query) {
      return 1.0
    }

    // 前缀匹配
    if (commandId.startsWith(query) || commandName.startsWith(query)) {
      return 0.9
    }

    // 包含匹配（命令ID或名称包含查询字符串）
    if (commandId.includes(query) || commandName.includes(query)) {
      return 0.7
    }

    // 描述匹配
    if (commandDescription.includes(query)) {
      return 0.5
    }

    // 模糊匹配（查询字符串的字符按顺序出现在命令ID或名称中）
    if (this.fuzzyMatch(commandId, query) || this.fuzzyMatch(commandName, query)) {
      return 0.3
    }

    return 0
  }

  /**
   * 获取匹配的关键字
   * @param command 命令对象
   * @param query 规范化后的查询字符串
   * @returns 匹配的关键字数组
   */
  private getMatchedKeywords(command: Command, query: string): string[] {
    const keywords: string[] = []

    if (command.id.toLowerCase().includes(query)) {
      keywords.push(command.id)
    }

    if (command.name.toLowerCase().includes(query)) {
      keywords.push(command.name)
    }

    if (command.description.toLowerCase().includes(query)) {
      keywords.push('description')
    }

    return keywords
  }

  /**
   * 模糊匹配算法
   * 检查查询字符串的字符是否按顺序出现在目标字符串中
   * @param target 目标字符串
   * @param query 查询字符串
   * @returns 是否匹配
   */
  private fuzzyMatch(target: string, query: string): boolean {
    let queryIndex = 0
    let targetIndex = 0

    while (queryIndex < query.length && targetIndex < target.length) {
      if (query[queryIndex] === target[targetIndex]) {
        queryIndex++
      }
      targetIndex++
    }

    return queryIndex === query.length
  }

  /**
   * 清空所有已注册的命令
   */
  clear(): void {
    this.commands.clear()
  }

  /**
   * 获取已注册的命令数量
   */
  get size(): number {
    return this.commands.size
  }
}

// 导出全局命令服务实例
export const commandService = new CommandService()
