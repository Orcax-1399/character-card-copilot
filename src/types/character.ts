/**
 * Character Card V2 类型定义
 * 基于 characterCardV2.md 规范
 */

/**
 * 世界书条目的 extensions 字段结构
 */
export interface WorldBookEntryExtensions {
  automation_id: string;
  case_sensitive: boolean | null;
  cooldown: number;
  delay: number;
  delay_until_recursion: boolean;
  depth: number;
  display_index: number;
  exclude_recursion: boolean;
  group: string;
  group_override: boolean;
  group_weight: number;
  match_character_depth_prompt: boolean;
  match_character_description: boolean;
  match_character_personality: boolean;
  match_creator_notes: boolean;
  match_persona_description: boolean;
  match_scenario: boolean;
  match_whole_words: boolean | null;
  position: number;
  prevent_recursion: boolean;
  probability: number;
  role: number;
  scan_depth: number | null;
  selectiveLogic: number;
  sticky: number;
  useProbability: boolean;
  use_group_scoring: boolean;
  vectorized: boolean;
}

/**
 * 创建默认的 extensions 对象
 */
export function createDefaultExtensions(): WorldBookEntryExtensions {
  return {
    automation_id: "",
    case_sensitive: null,
    cooldown: 0,
    delay: 0,
    delay_until_recursion: false,
    depth: 5,
    display_index: 0,
    exclude_recursion: false,
    group: "",
    group_override: false,
    group_weight: 100,
    match_character_depth_prompt: false,
    match_character_description: false,
    match_character_personality: false,
    match_creator_notes: false,
    match_persona_description: false,
    match_scenario: false,
    match_whole_words: null,
    position: 4,
    prevent_recursion: false,
    probability: 100,
    role: 0,
    scan_depth: null,
    selectiveLogic: 0,
    sticky: 0,
    useProbability: true,
    use_group_scoring: false,
    vectorized: false,
  };
}

/**
 * 世界书条目类型
 */
export interface WorldBookEntry {
  keys: Array<string>;
  content: string;
  extensions: WorldBookEntryExtensions | Record<string, unknown>;
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
}

/**
 * 世界书类型
 */
export interface CharacterBook {
  name?: string;
  description?: string;
  scan_depth?: number;
  token_budget?: number;
  recursive_scanning?: boolean;
  extensions: Record<string, unknown>;
  entries: Array<WorldBookEntry>;
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

/**
 * 世界书搜索筛选选项
 */
export interface WorldBookFilterOptions {
  searchText: string;
  showEnabled?: boolean;
  showDisabled?: boolean;
  sortBy?: 'insertion_order' | 'priority' | 'name';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 世界书编辑状态
 */
export interface WorldBookEditState {
  selectedEntryId: number | null;
  expandedEntryIds: Set<number>;
  isCreatingNew: boolean;
  filterOptions: WorldBookFilterOptions;
}

/**
 * 世界书条目创建参数
 */
export interface CreateWorldBookEntryParams {
  name?: string;
  keys: Array<string>;
  content: string;
  enabled?: boolean;
  priority?: number;
  position?: 'before_char' | 'after_char';
}

/**
 * 世界书条目更新参数
 */
export type UpdateWorldBookEntryParams = Partial<WorldBookEntry>;
