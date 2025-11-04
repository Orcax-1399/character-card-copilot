# 命令开发指南

本指南将帮助您为AIPanel命令面板开发新的命令。

## 目录

1. [快速开始](#快速开始)
2. [命令结构](#命令结构)
3. [开发步骤](#开发步骤)
4. [最佳实践](#最佳实践)
5. [示例命令](#示例命令)

## 快速开始

### 1. 定义命令

在 `src/services/builtinCommands.ts` 中创建新命令：

```typescript
export const myCommand: Command = {
  id: 'my-command',
  name: '/my-command',
  description: '命令描述',
  icon: 'MdOutlineIcon', // 可选
  category: 'other', // 可选
  priority: 10, // 可选，数字越小优先级越高

  execute: async (context: CommandContext): Promise<CommandResult> => {
    // 命令执行逻辑
    return {
      success: true,
      message: '命令执行成功',
    }
  },
}
```

### 2. 注册命令

在 `getBuiltinCommands()` 函数中添加新命令：

```typescript
export function getBuiltinCommands(): Command[] {
  return [
    clearCommand,
    myCommand, // 添加您的命令
  ]
}
```

### 3. 测试命令

1. 在AIPanel输入框输入 `/`
2. 命令面板会显示您的命令
3. 选择并执行命令

## 命令结构

### Command 接口

```typescript
interface Command {
  // 必需字段
  id: string                      // 命令唯一标识符
  name: string                    // 命令名称（显示在面板中）
  description: string             // 命令描述
  execute: (context) => Promise<CommandResult> | CommandResult

  // 可选字段
  icon?: string                   // 图标名称（vue-icons-plus）
  category?: 'chat' | 'history' | 'export' | 'settings' | 'other'
  priority?: number               // 优先级（默认999）
  requiresConfirmation?: boolean  // 是否需要确认
  confirmationMessage?: string    // 确认提示信息
  isAvailable?: (context) => boolean  // 命令可用性检查
}
```

### CommandContext 接口

执行命令时可以访问的上下文信息：

```typescript
interface CommandContext {
  messages: Ref<Message[]>              // 前端消息列表
  chatHistoryManager: ChatHistoryManager | null  // 聊天历史管理器
  userInput: Ref<string>                // 用户输入
  showCommandPalette: Ref<boolean>      // 命令面板显示状态
  characterData?: any                   // 角色数据（可选）
}
```

### CommandResult 接口

命令执行结果：

```typescript
interface CommandResult {
  success: boolean        // 是否成功
  message?: string        // 成功消息
  error?: string          // 错误信息
}
```

## 开发步骤

### 步骤 1: 规划命令功能

在开发前，明确以下问题：
- 命令的目的是什么？
- 命令需要访问哪些上下文数据？
- 命令是否需要用户确认？
- 命令在什么情况下不可用？

### 步骤 2: 创建命令定义

在 `src/services/builtinCommands.ts` 中定义命令：

```typescript
export const exportCommand: Command = {
  id: 'export',
  name: '/export',
  description: '导出对话记录',
  icon: 'MdOutlineDownload',
  category: 'export',
  priority: 5,

  // 只有当有消息时才可用
  isAvailable: (context: CommandContext) => {
    return context.messages.value.length > 0
  },

  execute: async (context: CommandContext): Promise<CommandResult> => {
    try {
      // 实现导出逻辑
      const messages = context.messages.value
      const exportData = JSON.stringify(messages, null, 2)

      // TODO: 保存到文件或复制到剪贴板

      return {
        success: true,
        message: '对话记录已导出',
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : '导出失败',
      }
    }
  },
}
```

### 步骤 3: 注册命令

在 `getBuiltinCommands()` 函数中注册：

```typescript
export function getBuiltinCommands(): Command[] {
  return [
    clearCommand,
    exportCommand, // 添加新命令
  ]
}
```

### 步骤 4: 添加图标支持（如需要）

如果使用新图标，在 `src/components/CommandPalette.vue` 中添加图标映射：

```typescript
function getCommandIcon(command: Command) {
  const iconMap = {
    'MdOutlineDelete': MdOutlineDelete,
    'MdOutlineDownload': MdOutlineDownload, // 添加新图标
  }

  return command.icon ? iconMap[command.icon] : null
}
```

### 步骤 5: 测试命令

1. 确保命令出现在命令面板中
2. 测试命令执行是否成功
3. 测试错误处理
4. 测试命令可用性检查

## 最佳实践

### 1. 命名规范

- **ID**: 使用小写字母和连字符，例如 `clear-history`, `export-chat`
- **名称**: 以 `/` 开头，使用小写，例如 `/clear`, `/export`
- **描述**: 简洁明了，说明命令功能

### 2. 错误处理

始终使用 try-catch 包裹可能失败的操作：

```typescript
execute: async (context: CommandContext): Promise<CommandResult> => {
  try {
    // 命令逻辑
    return { success: true, message: '成功' }
  } catch (error) {
    console.error('命令执行失败:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }
  }
}
```

### 3. 用户确认

对于危险操作（删除、清空等），启用确认对话框：

```typescript
{
  requiresConfirmation: true,
  confirmationMessage: '确定要执行此操作吗？此操作不可撤销。',
}
```

### 4. 条件可用性

使用 `isAvailable` 限制命令显示：

```typescript
isAvailable: (context: CommandContext) => {
  // 只有当有消息时才显示
  return context.messages.value.length > 0
}
```

### 5. 优先级设置

合理设置优先级，常用命令设置较低数值：

```typescript
{
  priority: 1,  // 最高优先级
  // priority: 5,  // 高优先级
  // priority: 10, // 中优先级
  // priority: 999, // 默认优先级（未设置时）
}
```

### 6. 清理状态

命令执行后，清理相关状态：

```typescript
execute: async (context: CommandContext): Promise<CommandResult> => {
  // 执行逻辑...

  // 关闭命令面板
  context.showCommandPalette.value = false

  // 清空输入
  context.userInput.value = ''

  return { success: true }
}
```

## 示例命令

### 示例 1: 简单命令（无确认）

```typescript
export const refreshCommand: Command = {
  id: 'refresh',
  name: '/refresh',
  description: '刷新AI配置',
  icon: 'MdOutlineRefresh',
  category: 'settings',
  priority: 8,

  execute: async (context: CommandContext): Promise<CommandResult> => {
    try {
      // 刷新逻辑
      console.log('刷新AI配置...')

      context.showCommandPalette.value = false
      context.userInput.value = ''

      return {
        success: true,
        message: 'AI配置已刷新',
      }
    } catch (error) {
      return {
        success: false,
        error: '刷新失败',
      }
    }
  },
}
```

### 示例 2: 带确认的命令

```typescript
export const deleteAllCommand: Command = {
  id: 'delete-all',
  name: '/delete-all',
  description: '删除所有数据',
  icon: 'MdOutlineDelete',
  category: 'history',
  priority: 99,
  requiresConfirmation: true,
  confirmationMessage: '警告：这将删除所有数据，此操作不可撤销！',

  execute: async (context: CommandContext): Promise<CommandResult> => {
    try {
      // 删除逻辑
      console.log('删除所有数据...')

      context.showCommandPalette.value = false

      return {
        success: true,
        message: '所有数据已删除',
      }
    } catch (error) {
      return {
        success: false,
        error: '删除失败',
      }
    }
  },
}
```

### 示例 3: 条件可用命令

```typescript
export const undoCommand: Command = {
  id: 'undo',
  name: '/undo',
  description: '撤销最后一条消息',
  icon: 'MdOutlineUndo',
  category: 'history',
  priority: 3,

  // 只有当有消息时才可用
  isAvailable: (context: CommandContext) => {
    return context.messages.value.length > 0
  },

  execute: async (context: CommandContext): Promise<CommandResult> => {
    try {
      if (context.messages.value.length === 0) {
        return {
          success: false,
          error: '没有可撤销的消息',
        }
      }

      // 删除最后一条消息
      context.messages.value.pop()

      if (context.chatHistoryManager) {
        await context.chatHistoryManager.deleteMessage(
          context.messages.value.length
        )
      }

      context.showCommandPalette.value = false
      context.userInput.value = ''

      return {
        success: true,
        message: '已撤销最后一条消息',
      }
    } catch (error) {
      return {
        success: false,
        error: '撤销失败',
      }
    }
  },
}
```

### 示例 4: 带参数的命令（未来扩展）

```typescript
// 注意：当前版本不支持参数，这是未来扩展的示例
export const exportFormatCommand: Command = {
  id: 'export-format',
  name: '/export',
  description: '导出对话记录（支持 json/markdown/txt 格式）',
  icon: 'MdOutlineDownload',
  category: 'export',

  execute: async (context: CommandContext): Promise<CommandResult> => {
    try {
      // 未来可以从用户输入中解析参数
      // 例如：/export json 或 /export markdown
      const format = 'json' // 默认格式

      // 根据格式导出
      // ...

      return {
        success: true,
        message: `已导出为 ${format} 格式`,
      }
    } catch (error) {
      return {
        success: false,
        error: '导出失败',
      }
    }
  },
}
```

## 常见问题

### Q: 如何访问当前角色数据？

A: 通过 `context.characterData` 访问。

### Q: 如何在命令执行后显示通知？

A: 当前版本在控制台输出。未来版本将集成通知系统。

### Q: 命令可以异步执行吗？

A: 可以，`execute` 方法支持返回 `Promise<CommandResult>`。

### Q: 如何调试命令？

A: 在命令的 `execute` 函数中使用 `console.log()` 输出调试信息。

## 扩展机制

### 命令分类

使用 `category` 字段为命令分类，便于未来实现分组显示：

- `chat`: 聊天相关
- `history`: 历史记录相关
- `export`: 导出相关
- `settings`: 设置相关
- `other`: 其他

### 命令优先级

使用 `priority` 控制命令在面板中的显示顺序：

- `1-5`: 最常用命令
- `6-10`: 常用命令
- `11-50`: 一般命令
- `51-999`: 不常用命令

### 图标扩展

当前支持的图标来自 `vue-icons-plus/md`，要添加新图标：

1. 在 `CommandPalette.vue` 中导入图标
2. 在 `getCommandIcon()` 函数中添加映射

## 贡献

欢迎贡献新命令！请遵循以下流程：

1. Fork 项目
2. 创建功能分支
3. 开发并测试命令
4. 提交 Pull Request

---

**祝您开发愉快！**

如有问题，请在项目 Issues 中提出。
