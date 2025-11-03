/**
 * API配置相关的类型定义
 */

export interface ApiConfig {
  /** 配置名称 */
  profile: string;
  /** API链接端点 */
  endpoint: string;
  /** API密钥 */
  key: string;
  /** 使用的模型 */
  model: string;
  /** 是否为默认配置 */
  default: boolean;
  /** 是否启用 */
  enabled: boolean;
}

export interface ApiListResponse {
  apis: ApiConfig[];
}

export interface CreateApiRequest {
  profile: string;
  endpoint?: string;
  key?: string;
  model?: string;
  default?: boolean;
  enabled?: boolean;
}

export interface UpdateApiRequest extends Partial<ApiConfig> {
  /** 要更新的API配置名称 */
  profile: string;
}

/**
 * API测试结果
 */
export interface ApiTestResult {
  success: boolean;
  message: string;
  error?: string;
}

/**
 * 可用模型信息
 */
export interface ModelInfo {
  id: string;
  object: string;
  created?: number;
  owned_by?: string;
}

/**
 * 模型列表响应
 */
export interface ModelsResponse {
  object: string;
  data: ModelInfo[];
}