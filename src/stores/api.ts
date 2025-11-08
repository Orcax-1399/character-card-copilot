import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import type { ApiConfig, CreateApiRequest, UpdateApiRequest, ApiTestResult, ModelInfo } from '@/types/api'
import * as apiConfig from '@/services/apiConfig'

export const useApiStore = defineStore('api', () => {
  // ===== 状态 =====
  const apis = ref<ApiConfig[]>([])
  const loading = ref(false)
  const lastFetch = ref(0)
  const CACHE_DURATION = 5 * 60 * 1000 // 5分钟缓存

  // ===== 计算属性 =====
  const defaultApi = computed(() => {
    return apis.value.find(api => api.default) || null
  })

  const enabledApis = computed(() => {
    return apis.value.filter(api => api.enabled)
  })

  const disabledApis = computed(() => {
    return apis.value.filter(api => !api.enabled)
  })

  const isCacheValid = computed(() => {
    return Date.now() - lastFetch.value < CACHE_DURATION
  })

  // ===== 动作 =====

  /**
   * 加载所有API配置
   */
  async function loadAllApis(force = false) {
    // 如果缓存有效且不是强制刷新，则跳过
    if (!force && isCacheValid.value && apis.value.length > 0) {
      return
    }

    loading.value = true
    try {
      const data = await apiConfig.getAllApiConfigs()
      apis.value = data
      lastFetch.value = Date.now()
    } catch (error) {
      console.error('加载API配置失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * 刷新API配置（强制重新加载）
   */
  async function refreshApis() {
    return loadAllApis(true)
  }

  /**
   * 根据配置名称获取API配置
   */
  async function getApiByProfile(profile: string): Promise<ApiConfig | undefined> {
    // 先尝试从缓存中获取
    let api = apis.value.find(a => a.profile === profile)
    if (!api) {
      // 缓存中没有，从后端获取
      const foundApi = await apiConfig.getApiConfigByProfile(profile)
      if (foundApi) {
        apis.value.push(foundApi)
        api = foundApi
      }
    }
    return api
  }

  /**
   * 获取默认API配置
   */
  async function getDefaultApi(): Promise<ApiConfig | undefined> {
    // 先尝试从缓存中获取
    if (defaultApi.value) {
      return defaultApi.value
    }

    // 缓存中没有，从后端获取
    const api = await apiConfig.getDefaultApiConfig()
    if (api) {
      // 更新缓存
      const index = apis.value.findIndex(a => a.profile === api.profile)
      if (index >= 0) {
        apis.value[index] = api
      } else {
        apis.value.push(api)
      }
      return api
    }
    return undefined
  }

  /**
   * 创建新的API配置
   */
  async function createApi(config: CreateApiRequest) {
    const newApi = await apiConfig.createApiConfig(config)
    apis.value.push(newApi)
    lastFetch.value = Date.now()
    return newApi
  }

  /**
   * 更新API配置
   */
  async function updateApi(config: UpdateApiRequest) {
    await apiConfig.updateApiConfig(config)

    // 更新缓存中的数据
    const index = apis.value.findIndex(api => api.profile === config.original_profile)
    if (index >= 0) {
      apis.value[index] = {
        ...apis.value[index],
        ...config,
        profile: config.profile // 使用新的profile名称
      }
    }
    lastFetch.value = Date.now()
  }

  /**
   * 删除API配置
   */
  async function deleteApi(profile: string) {
    await apiConfig.deleteApiConfig(profile)
    apis.value = apis.value.filter(api => api.profile !== profile)
    lastFetch.value = Date.now()
  }

  /**
   * 复制API配置
   */
  async function copyApi(profile: string) {
    const originalApi = await getApiByProfile(profile)
    if (!originalApi) {
      throw new Error(`API配置 ${profile} 不存在`)
    }

    const copyConfig: CreateApiRequest = {
      profile: `${originalApi.profile} (copy)`,
      endpoint: originalApi.endpoint,
      key: originalApi.key,
      model: originalApi.model,
      default: false,
      enabled: originalApi.enabled,
    }

    const newApi = await createApi(copyConfig)
    return newApi
  }

  /**
   * 设置默认API配置
   */
  async function setDefaultApi(profile: string) {
    await apiConfig.setDefaultApiConfig(profile)

    // 更新本地状态
    apis.value.forEach(api => {
      api.default = api.profile === profile
    })
    lastFetch.value = Date.now()
  }

  /**
   * 启用/禁用API配置
   */
  async function toggleApi(profile: string, enabled: boolean) {
    await apiConfig.toggleApiConfig(profile, enabled)

    // 更新本地状态
    const api = apis.value.find(a => a.profile === profile)
    if (api) {
      api.enabled = enabled
    }
    lastFetch.value = Date.now()
  }

  /**
   * 测试API连接
   */
  async function testConnection(config: ApiConfig): Promise<ApiTestResult> {
    return await apiConfig.testApiConnection(config)
  }

  /**
   * 获取可用模型列表
   */
  async function fetchModels(config: ApiConfig): Promise<ModelInfo[]> {
    return await apiConfig.fetchModels(config)
  }

  /**
   * 清除缓存
   */
  function clearCache() {
    lastFetch.value = 0
  }

  /**
   * 重置状态
   */
  function reset() {
    apis.value = []
    loading.value = false
    lastFetch.value = 0
  }

  return {
    // 状态
    apis: readonly(apis),
    loading: readonly(loading),
    lastFetch: readonly(lastFetch),

    // 计算属性
    defaultApi,
    enabledApis,
    disabledApis,
    isCacheValid,

    // 动作
    loadAllApis,
    refreshApis,
    getApiByProfile,
    getDefaultApi,
    createApi,
    updateApi,
    deleteApi,
    copyApi,
    setDefaultApi,
    toggleApi,
    testConnection,
    fetchModels,
    clearCache,
    reset,
  }
})
