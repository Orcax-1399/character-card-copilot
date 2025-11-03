import type { ApiConfig, CreateApiRequest, UpdateApiRequest, ApiTestResult, ModelInfo, ModelsResponse } from '@/types/api';

/**
 * API配置存储服务
 * 管理API配置的文件系统存储和读取
 */

/**
 * 获取所有API配置
 * TODO: 需要实现Tauri后端命令来读取 api/apis.json 文件
 */
export async function getAllApiConfigs(): Promise<ApiConfig[]> {
  // TODO: 实现Tauri后端命令
  console.warn('getAllApiConfigs: 尚未实现Tauri后端命令');
  return [];
}

/**
 * 根据配置名称获取API配置
 * @param profile 配置名称
 */
export async function getApiConfigByProfile(profile: string): Promise<ApiConfig | null> {
  // TODO: 实现Tauri后端命令
  console.warn('getApiConfigByProfile: 尚未实现Tauri后端命令', profile);
  return null;
}

/**
 * 获取默认API配置
 */
export async function getDefaultApiConfig(): Promise<ApiConfig | null> {
  // TODO: 实现Tauri后端命令
  console.warn('getDefaultApiConfig: 尚未实现Tauri后端命令');
  return null;
}

/**
 * 创建新的API配置
 * @param config API配置数据
 */
export async function createApiConfig(config: CreateApiRequest): Promise<ApiConfig> {
  const newConfig: ApiConfig = {
    profile: config.profile,
    endpoint: config.endpoint || '',
    key: config.key || '',
    model: config.model || '',
    default: config.default || false,
    enabled: config.enabled || false, // 默认为false，需要通过测试才能启用
  };

  // TODO: 调用Tauri后端命令保存到 api/apis.json
  console.warn('createApiConfig: 尚未实现Tauri后端命令', newConfig);

  return newConfig;
}

/**
 * 更新API配置
 * @param config 更新后的API配置数据
 */
export async function updateApiConfig(config: UpdateApiRequest): Promise<void> {
  // TODO: 实现Tauri后端命令
  console.warn('updateApiConfig: 尚未实现Tauri后端命令', config);
}

/**
 * 删除API配置
 * @param profile 配置名称
 */
export async function deleteApiConfig(profile: string): Promise<void> {
  // TODO: 实现Tauri后端命令
  console.warn('deleteApiConfig: 尚未实现Tauri后端命令', profile);
}

/**
 * 设置默认API配置
 * @param profile 配置名称
 */
export async function setDefaultApiConfig(profile: string): Promise<void> {
  // TODO: 实现Tauri后端命令
  console.warn('setDefaultApiConfig: 尚未实现Tauri后端命令', profile);
}

/**
 * 启用/禁用API配置
 * @param profile 配置名称
 * @param enabled 是否启用
 */
export async function toggleApiConfig(profile: string, enabled: boolean): Promise<void> {
  // TODO: 实现Tauri后端命令
  console.warn('toggleApiConfig: 尚未实现Tauri后端命令', profile, enabled);
}

/**
 * 测试API连接
 * @param config API配置
 */
export async function testApiConnection(config: ApiConfig): Promise<ApiTestResult> {
  if (!config.endpoint || !config.key) {
    return {
      success: false,
      message: 'API端点和密钥不能为空',
      error: 'Missing required fields'
    };
  }

  try {
    // TODO: 实现Tauri后端命令来测试API连接
    // 这里会调用 /models 端点来测试连接
    console.warn('testApiConnection: 尚未实现Tauri后端命令', config);

    // 暂时返回成功，待实现后端命令
    return {
      success: true,
      message: '连接测试成功'
    };
  } catch (error) {
    return {
      success: false,
      message: '连接测试失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 获取可用模型列表
 * @param config API配置
 */
export async function fetchModels(config: ApiConfig): Promise<ModelInfo[]> {
  if (!config.endpoint || !config.key) {
    throw new Error('API端点和密钥不能为空');
  }

  try {
    // TODO: 实现Tauri后端命令来获取模型列表
    // 这里会调用 config.endpoint + "/models"
    console.warn('fetchModels: 尚未实现Tauri后端命令', config);

    // 暂时返回一些常见模型，待实现后端命令
    return [
      { id: 'gpt-3.5-turbo', object: 'model' },
      { id: 'gpt-4', object: 'model' },
      { id: 'gpt-4-turbo-preview', object: 'model' },
      { id: 'gpt-4o', object: 'model' },
      { id: 'gpt-4o-mini', object: 'model' }
    ];
  } catch (error) {
    console.error('获取模型列表失败:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to fetch models');
  }
}