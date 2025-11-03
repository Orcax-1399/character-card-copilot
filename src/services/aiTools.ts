import { invoke } from '@tauri-apps/api/core';

export interface ToolParameter {
  name: string;
  description: string;
  parameter_type: string;
  required: boolean;
  schema?: any;
}

export interface AITool {
  name: string;
  description: string;
  category: string;
  parameters: ToolParameter[];
  enabled: boolean;
}

export interface ToolCallRequest {
  tool_name: string;
  parameters: Record<string, any>;
  context?: any; // CharacterData or other context
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  execution_time_ms: number;
}

export class AIToolsService {
  /**
   * 获取所有可用工具
   */
  static async getAvailableTools(): Promise<AITool[]> {
    return await invoke<AITool[]>('get_available_tools');
  }

  /**
   * 根据分类获取工具
   */
  static async getToolsByCategory(category: string): Promise<AITool[]> {
    return await invoke<AITool[]>('get_tools_by_category', { category });
  }

  /**
   * 执行工具调用
   */
  static async executeToolCall(request: ToolCallRequest): Promise<ToolResult> {
    return await invoke<ToolResult>('execute_tool_call', { request });
  }

  /**
   * 获取工具分类列表
   */
  static async getToolCategories(): Promise<string[]> {
    return await invoke<string[]>('get_tool_categories');
  }

  /**
   * 更新角色字段工具
   */
  static async updateCharacterField(
    fieldName: string,
    newValue: string,
    context?: any
  ): Promise<ToolResult> {
    return this.executeToolCall({
      tool_name: 'update_character_field',
      parameters: {
        field_name: fieldName,
        new_value: newValue,
      },
      context,
    });
  }

  /**
   * 分析角色工具
   */
  static async analyzeCharacter(
    analysisType: 'completeness' | 'consistency' | 'depth' | 'all',
    context?: any
  ): Promise<ToolResult> {
    return this.executeToolCall({
      tool_name: 'analyze_character',
      parameters: {
        analysis_type: analysisType,
      },
      context,
    });
  }

  /**
   * 生成对话工具
   */
  static async generateDialogue(
    scenario: string,
    dialogueType: 'first_meeting' | 'casual_chat' | 'emotional_scene' | 'conflict' | 'collaboration',
    length: 'short' | 'medium' | 'long' = 'medium',
    context?: any
  ): Promise<ToolResult> {
    return this.executeToolCall({
      tool_name: 'generate_dialogue',
      parameters: {
        scenario,
        dialogue_type: dialogueType,
        length,
      },
      context,
    });
  }

  /**
   * 获取改进建议工具
   */
  static async suggestImprovements(
    focusArea: 'personality' | 'backstory' | 'relationships' | 'goals' | 'all',
    context?: any
  ): Promise<ToolResult> {
    return this.executeToolCall({
      tool_name: 'suggest_improvements',
      parameters: {
        focus_area: focusArea,
      },
      context,
    });
  }

  /**
   * 导出角色工具
   */
  static async exportCharacter(
    format: 'json' | 'yaml' | 'tavern' | 'charx',
    includeMetadata: boolean = true,
    context?: any
  ): Promise<ToolResult> {
    return this.executeToolCall({
      tool_name: 'export_character',
      parameters: {
        format,
        include_metadata: includeMetadata,
      },
      context,
    });
  }

  /**
   * 根据工具名称获取工具
   */
  static async getToolByName(toolName: string): Promise<AITool | null> {
    const tools = await this.getAvailableTools();
    return tools.find(tool => tool.name === toolName) || null;
  }

  /**
   * 获取启用的工具
   */
  static async getEnabledTools(): Promise<AITool[]> {
    const tools = await this.getAvailableTools();
    return tools.filter(tool => tool.enabled);
  }

  /**
   * 根据分类获取启用的工具
   */
  static async getEnabledToolsByCategory(category: string): Promise<AITool[]> {
    const tools = await this.getToolsByCategory(category);
    return tools.filter(tool => tool.enabled);
  }
}

// 工具分类映射
export const TOOL_CATEGORIES = {
  character: '角色管理',
  content: '内容生成',
  analysis: '分析评估',
  utility: '实用工具',
} as const;

// 工具分类颜色映射
export const TOOL_CATEGORY_COLORS = {
  character: 'bg-blue-100 text-blue-800',
  content: 'bg-green-100 text-green-800',
  analysis: 'bg-purple-100 text-purple-800',
  utility: 'bg-gray-100 text-gray-800',
} as const;