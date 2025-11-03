import { invoke } from '@tauri-apps/api/core';

export interface AIRole {
  name: string;
  description: string;
  system_prompt: string;
  temperature: number;
  max_tokens: number;
  tools_enabled: boolean;
}

export interface AIConfig {
  default_role: string;
  roles: Record<string, AIRole>;
}

export class AIConfigService {
  /**
   * 获取AI配置
   */
  static async getConfig(): Promise<AIConfig> {
    return await invoke<AIConfig>('get_ai_config');
  }

  /**
   * 获取指定AI角色
   */
  static async getRole(roleName: string): Promise<AIRole | null> {
    return await invoke<AIRole | null>('get_ai_role', { roleName });
  }

  /**
   * 更新AI角色
   */
  static async updateRole(roleName: string, role: AIRole): Promise<void> {
    await invoke<void>('update_ai_role', { roleName, role });
  }

  /**
   * 添加新的AI角色
   */
  static async addRole(roleName: string, role: AIRole): Promise<void> {
    await invoke<void>('add_ai_role', { roleName, role });
  }

  /**
   * 删除AI角色
   */
  static async deleteRole(roleName: string): Promise<void> {
    await invoke<void>('delete_ai_role', { roleName });
  }

  /**
   * 设置默认AI角色
   */
  static async setDefaultRole(roleName: string): Promise<void> {
    await invoke<void>('set_default_ai_role', { roleName });
  }

  /**
   * 获取所有AI角色
   */
  static async getAllRoles(): Promise<Array<{ name: string; role: AIRole }>> {
    const roles = await invoke<Array<[string, AIRole]>>('get_all_ai_roles');
    return roles.map(([name, role]) => ({ name, role }));
  }
}