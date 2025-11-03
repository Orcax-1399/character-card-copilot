/**
 * Character Card V2 类型定义
 * 基于 characterCardV2.md 规范
 */

export interface CharacterBook {
  name?: string;
  description?: string;
  scan_depth?: number;
  token_budget?: number;
  recursive_scanning?: boolean;
  extensions: Record<string, unknown>;
  entries: Array<{
    keys: Array<string>;
    content: string;
    extensions: Record<string, unknown>;
    enabled: boolean;
    insertion_order: number;
    case_sensitive?: boolean;
    name?: string;
    priority?: number;
    id?: number;
    comment?: string;
    selective?: boolean;
    secondary_keys?: Array<string>;
    constant?: boolean;
    position?: 'before_char' | 'after_char';
  }>;
}

export interface TavernCardV2 {
  spec: 'chara_card_v2';
  spec_version: '2.0';
  data: {
    name: string;
    description: string;
    personality: string;
    scenario: string;
    first_mes: string;
    mes_example: string;
    creator_notes: string;
    system_prompt: string;
    post_history_instructions: string;
    alternate_greetings: Array<string>;
    character_book?: CharacterBook;
    tags: Array<string>;
    creator: string;
    character_version: string;
    extensions: Record<string, unknown>;
  };
}

/**
 * 角色元数据
 */
export interface CharacterMeta {
  uuid: string;
  version: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 聊天历史记录项
 */
export interface ChatHistoryItem {
  timestamp: string;
  role: 'user' | 'assistant';
  content: string;
}

/**
 * 角色图层（AI辅助框架，待定义）
 */
export interface CharacterLayers {
  // 待定义
  [key: string]: unknown;
}

/**
 * 角色卡完整数据结构
 */
export interface CharacterData {
  uuid: string;
  meta: CharacterMeta;
  card: TavernCardV2;
  backgroundPath: string; // background.png 路径
}
