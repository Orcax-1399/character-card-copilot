import type {
  CharacterBook,
  WorldBookEntry,
  CreateWorldBookEntryParams,
  UpdateWorldBookEntryParams,
  WorldBookFilterOptions,
} from '@/types/character';
import { createDefaultExtensions } from '@/types/character';
import { getCharacterByUUID, updateCharacter } from './characterStorage';

/**
 * 世界书数据管理服务
 * 管理角色卡内嵌的世界书数据
 */

/**
 * 生成新的条目ID
 * @param entries 现有条目列表
 */
function generateEntryId(entries: WorldBookEntry[]): number {
  if (entries.length === 0) return 1;
  const maxId = Math.max(...entries.map(e => e.id || 0));
  return maxId + 1;
}

/**
 * 生成默认的世界书对象
 */
export function createDefaultCharacterBook(): CharacterBook {
  return {
    name: '',
    description: '',
    scan_depth: 2,
    token_budget: 500,
    recursive_scanning: false,
    extensions: {},
    entries: [],
  };
}

/**
 * 获取角色的世界书
 * @param characterUuid 角色UUID
 */
export async function getWorldBook(characterUuid: string): Promise<CharacterBook | null> {
  try {
    const character = await getCharacterByUUID(characterUuid);
    if (!character) return null;

    return character.card.data.character_book || null;
  } catch (error) {
    console.error('获取世界书失败:', error);
    throw error;
  }
}

/**
 * 初始化角色的世界书（如果不存在）
 * @param characterUuid 角色UUID
 */
export async function initializeWorldBook(characterUuid: string): Promise<CharacterBook> {
  try {
    const character = await getCharacterByUUID(characterUuid);
    if (!character) {
      throw new Error('角色不存在');
    }

    if (!character.card.data.character_book) {
      character.card.data.character_book = createDefaultCharacterBook();
      await updateCharacter(characterUuid, character.card);
    }

    return character.card.data.character_book;
  } catch (error) {
    console.error('初始化世界书失败:', error);
    throw error;
  }
}

/**
 * 创建世界书条目
 * @param characterUuid 角色UUID
 * @param params 条目创建参数
 */
export async function createWorldBookEntry(
  characterUuid: string,
  params: CreateWorldBookEntryParams
): Promise<WorldBookEntry> {
  try {
    const character = await getCharacterByUUID(characterUuid);
    if (!character) {
      throw new Error('角色不存在');
    }

    // 确保世界书已初始化
    if (!character.card.data.character_book) {
      character.card.data.character_book = createDefaultCharacterBook();
    }

    const worldBook = character.card.data.character_book;
    const newId = generateEntryId(worldBook.entries);

    // 计算插入顺序
    const maxInsertionOrder = worldBook.entries.length > 0
      ? Math.max(...worldBook.entries.map(e => e.insertion_order))
      : 0;

    const newEntry: WorldBookEntry = {
      id: newId,
      name: params.name || '',
      keys: params.keys || [],
      content: params.content || '',
      enabled: params.enabled !== undefined ? params.enabled : true,
      insertion_order: maxInsertionOrder + 1,
      priority: params.priority || 10,
      position: params.position || 'before_char',
      case_sensitive: false,
      extensions: createDefaultExtensions(),
    };

    worldBook.entries.push(newEntry);
    await updateCharacter(characterUuid, character.card);

    return newEntry;
  } catch (error) {
    console.error('创建世界书条目失败:', error);
    throw error;
  }
}

/**
 * 更新世界书条目
 * @param characterUuid 角色UUID
 * @param entryId 条目ID
 * @param updates 更新数据
 */
export async function updateWorldBookEntry(
  characterUuid: string,
  entryId: number,
  updates: UpdateWorldBookEntryParams
): Promise<WorldBookEntry | null> {
  try {
    const character = await getCharacterByUUID(characterUuid);
    if (!character || !character.card.data.character_book) {
      throw new Error('世界书不存在');
    }

    const worldBook = character.card.data.character_book;
    const entryIndex = worldBook.entries.findIndex(e => e.id === entryId);

    if (entryIndex === -1) {
      return null;
    }

    // 更新条目
    worldBook.entries[entryIndex] = {
      ...worldBook.entries[entryIndex],
      ...updates,
    };

    await updateCharacter(characterUuid, character.card);
    return worldBook.entries[entryIndex];
  } catch (error) {
    console.error('更新世界书条目失败:', error);
    throw error;
  }
}

/**
 * 删除世界书条目
 * @param characterUuid 角色UUID
 * @param entryId 条目ID
 */
export async function deleteWorldBookEntry(
  characterUuid: string,
  entryId: number
): Promise<boolean> {
  try {
    const character = await getCharacterByUUID(characterUuid);
    if (!character || !character.card.data.character_book) {
      throw new Error('世界书不存在');
    }

    const worldBook = character.card.data.character_book;
    const entryIndex = worldBook.entries.findIndex(e => e.id === entryId);

    if (entryIndex === -1) {
      return false;
    }

    worldBook.entries.splice(entryIndex, 1);
    await updateCharacter(characterUuid, character.card);

    return true;
  } catch (error) {
    console.error('删除世界书条目失败:', error);
    throw error;
  }
}

/**
 * 搜索和筛选世界书条目
 * @param entries 条目列表
 * @param filterOptions 筛选选项
 */
export function filterWorldBookEntries(
  entries: WorldBookEntry[],
  filterOptions: WorldBookFilterOptions
): WorldBookEntry[] {
  let filtered = [...entries];

  // 文本搜索
  if (filterOptions.searchText.trim()) {
    const searchLower = filterOptions.searchText.toLowerCase();
    filtered = filtered.filter(entry => {
      const nameMatch = entry.name?.toLowerCase().includes(searchLower);
      const keysMatch = entry.keys.some(key => key.toLowerCase().includes(searchLower));
      const contentMatch = entry.content.toLowerCase().includes(searchLower);
      const commentMatch = entry.comment?.toLowerCase().includes(searchLower);

      return nameMatch || keysMatch || contentMatch || commentMatch;
    });
  }

  // 启用/禁用筛选
  if (filterOptions.showEnabled !== undefined || filterOptions.showDisabled !== undefined) {
    filtered = filtered.filter(entry => {
      if (filterOptions.showEnabled && entry.enabled) return true;
      if (filterOptions.showDisabled && !entry.enabled) return true;
      return false;
    });
  }

  // 排序
  if (filterOptions.sortBy) {
    filtered.sort((a, b) => {
      let aVal: string | number = 0;
      let bVal: string | number = 0;

      switch (filterOptions.sortBy) {
        case 'insertion_order':
          aVal = a.insertion_order;
          bVal = b.insertion_order;
          break;
        case 'priority':
          aVal = a.priority || 0;
          bVal = b.priority || 0;
          break;
        case 'name':
          aVal = a.name || '';
          bVal = b.name || '';
          break;
      }

      if (aVal < bVal) return filterOptions.sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return filterOptions.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  return filtered;
}

/**
 * 批量更新条目启用状态
 * @param characterUuid 角色UUID
 * @param entryIds 条目ID列表
 * @param enabled 启用状态
 */
export async function batchUpdateEntryEnabled(
  characterUuid: string,
  entryIds: number[],
  enabled: boolean
): Promise<void> {
  try {
    const character = await getCharacterByUUID(characterUuid);
    if (!character || !character.card.data.character_book) {
      throw new Error('世界书不存在');
    }

    const worldBook = character.card.data.character_book;

    entryIds.forEach(id => {
      const entry = worldBook.entries.find(e => e.id === id);
      if (entry) {
        entry.enabled = enabled;
      }
    });

    await updateCharacter(characterUuid, character.card);
  } catch (error) {
    console.error('批量更新条目状态失败:', error);
    throw error;
  }
}

/**
 * 批量删除条目
 * @param characterUuid 角色UUID
 * @param entryIds 条目ID列表
 */
export async function batchDeleteEntries(
  characterUuid: string,
  entryIds: number[]
): Promise<void> {
  try {
    const character = await getCharacterByUUID(characterUuid);
    if (!character || !character.card.data.character_book) {
      throw new Error('世界书不存在');
    }

    const worldBook = character.card.data.character_book;
    worldBook.entries = worldBook.entries.filter(e => !entryIds.includes(e.id || 0));

    await updateCharacter(characterUuid, character.card);
  } catch (error) {
    console.error('批量删除条目失败:', error);
    throw error;
  }
}

/**
 * 重新排序条目
 * @param characterUuid 角色UUID
 * @param entryIds 排序后的条目ID列表
 */
export async function reorderEntries(
  characterUuid: string,
  entryIds: number[]
): Promise<void> {
  try {
    const character = await getCharacterByUUID(characterUuid);
    if (!character || !character.card.data.character_book) {
      throw new Error('世界书不存在');
    }

    const worldBook = character.card.data.character_book;

    // 更新插入顺序
    entryIds.forEach((id, index) => {
      const entry = worldBook.entries.find(e => e.id === id);
      if (entry) {
        entry.insertion_order = index + 1;
      }
    });

    await updateCharacter(characterUuid, character.card);
  } catch (error) {
    console.error('重新排序条目失败:', error);
    throw error;
  }
}
