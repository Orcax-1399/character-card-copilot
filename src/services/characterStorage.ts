import type { CharacterData, CharacterMeta, TavernCardV2 } from '@/types/character';
import { invoke } from '@tauri-apps/api/core';

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
 */
export async function getAllCharacters(): Promise<CharacterData[]> {
  try {
    const characters = await invoke<CharacterData[]>('get_all_characters');
    return characters;
  } catch (error) {
    console.error('获取角色卡列表失败:', error);
    throw new Error(error as string);
  }
}

/**
 * 根据UUID获取角色卡
 * @param uuid 角色UUID
 */
export async function getCharacterByUUID(uuid: string): Promise<CharacterData | null> {
  try {
    const character = await invoke<CharacterData | null>('get_character_by_uuid', { uuid });
    return character;
  } catch (error) {
    console.error('获取角色卡失败:', error);
    throw new Error(error as string);
  }
}

/**
 * 创建新的角色卡
 * @param name 角色名称
 * @returns 新创建的角色数据
 */
export async function createCharacter(name: string): Promise<CharacterData> {
  try {
    const character = await invoke<CharacterData>('create_character', { name });
    return character;
  } catch (error) {
    console.error('创建角色卡失败:', error);
    throw new Error(error as string);
  }
}

/**
 * 更新角色卡
 * @param uuid 角色UUID
 * @param card 更新后的角色卡数据
 */
export async function updateCharacter(uuid: string, card: TavernCardV2): Promise<void> {
  try {
    await invoke('update_character', { uuid, card });
  } catch (error) {
    console.error('更新角色卡失败:', error);
    throw new Error(error as string);
  }
}

/**
 * 删除角色卡
 * @param uuid 角色UUID
 */
export async function deleteCharacter(uuid: string): Promise<void> {
  try {
    await invoke('delete_character', { uuid });
  } catch (error) {
    console.error('删除角色卡失败:', error);
    throw new Error(error as string);
  }
}

/**
 * 上传角色背景图片
 * @param uuid 角色UUID
 * @param file 图片文件
 */
export async function uploadBackgroundImage(uuid: string, file: File): Promise<string> {
  try {
    // 将File转换为ArrayBuffer，然后转换为Uint8Array
    const arrayBuffer = await file.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);

    // 获取文件扩展名
    const extension = file.name.split('.').pop() || 'png';

    const backgroundPath = await invoke<string>('upload_background_image', {
      uuid,
      imageData: Array.from(imageBytes),
      extension
    });

    return backgroundPath;
  } catch (error) {
    console.error('上传背景图片失败:', error);
    throw new Error(error as string);
  }
}

/**
 * 更新角色背景图片路径
 * @param uuid 角色UUID
 * @param backgroundPath 背景图片路径
 */
export async function updateCharacterBackgroundPath(uuid: string, backgroundPath: string): Promise<void> {
  try {
    await invoke('update_character_background_path', { uuid, backgroundPath });
  } catch (error) {
    console.error('更新角色背景图片路径失败:', error);
    throw new Error(error as string);
  }
}
