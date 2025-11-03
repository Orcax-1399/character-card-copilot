import type { CharacterData, CharacterMeta, TavernCardV2 } from '@/types/character';

/**
 * 角色卡存储服务
 * 管理角色卡的文件系统存储和读取
 */

/**
 * 生成UUID
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 获取所有角色卡列表
 * TODO: 需要实现Tauri后端命令来读取文件系统
 */
export async function getAllCharacters(): Promise<CharacterData[]> {
  // 暂时返回空数组，稍后实现Tauri命令
  console.warn('getAllCharacters: 尚未实现Tauri后端命令');
  return [];
}

/**
 * 根据UUID获取角色卡
 * @param uuid 角色UUID
 */
export async function getCharacterByUUID(uuid: string): Promise<CharacterData | null> {
  // TODO: 实现Tauri后端命令
  console.warn('getCharacterByUUID: 尚未实现Tauri后端命令', uuid);
  return null;
}

/**
 * 创建新的角色卡
 * @param name 角色名称
 * @returns 新创建的角色数据
 */
export async function createCharacter(name: string): Promise<CharacterData> {
  const uuid = generateUUID();
  const now = new Date().toISOString();

  const meta: CharacterMeta = {
    uuid,
    version: '1.0',
    createdAt: now,
    updatedAt: now,
  };

  const card: TavernCardV2 = {
    spec: 'chara_card_v2',
    spec_version: '2.0',
    data: {
      name,
      description: '',
      personality: '',
      scenario: '',
      first_mes: '',
      mes_example: '',
      creator_notes: '',
      system_prompt: '',
      post_history_instructions: '',
      alternate_greetings: [],
      tags: [],
      creator: '',
      character_version: '1.0',
      extensions: {},
    },
  };

  const characterData: CharacterData = {
    uuid,
    meta,
    card,
    backgroundPath: '', // 暂时为空，待上传图片后填充
  };

  // TODO: 调用Tauri后端命令保存到文件系统
  console.warn('createCharacter: 尚未实现Tauri后端命令', characterData);

  return characterData;
}

/**
 * 更新角色卡
 * @param uuid 角色UUID
 * @param card 更新后的角色卡数据
 */
export async function updateCharacter(uuid: string, card: TavernCardV2): Promise<void> {
  // TODO: 实现Tauri后端命令
  console.warn('updateCharacter: 尚未实现Tauri后端命令', uuid, card);
}

/**
 * 删除角色卡
 * @param uuid 角色UUID
 */
export async function deleteCharacter(uuid: string): Promise<void> {
  // TODO: 实现Tauri后端命令
  console.warn('deleteCharacter: 尚未实现Tauri后端命令', uuid);
}

/**
 * 上传角色背景图片
 * @param uuid 角色UUID
 * @param file 图片文件
 */
export async function uploadBackgroundImage(uuid: string, file: File): Promise<string> {
  // TODO: 实现Tauri后端命令
  console.warn('uploadBackgroundImage: 尚未实现Tauri后端命令', uuid, file);
  return '';
}
