import { invoke } from '@tauri-apps/api/core';

/**
 * 角色状态管理服务
 * 用于跟踪当前活跃的角色
 */
export class CharacterStateService {
  /**
   * 设置当前活跃角色
   * @param characterUuid 角色UUID
   */
  static async setActiveCharacter(characterUuid: string): Promise<void> {
    await invoke('set_active_character', { characterUuid });
  }

  /**
   * 获取当前活跃角色UUID
   * @returns 当前活跃角色的UUID，如果没有则返回null
   */
  static async getActiveCharacter(): Promise<string | null> {
    return await invoke('get_active_character');
  }

  /**
   * 清除当前活跃角色（退出角色时）
   */
  static async clearActiveCharacter(): Promise<void> {
    await invoke('clear_active_character');
  }

  /**
   * 检查是否有活跃角色
   * @returns 是否有活跃角色
   */
  static async hasActiveCharacter(): Promise<boolean> {
    return await invoke('has_active_character');
  }
}