<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import type { ApiConfig, ModelInfo } from '@/types/api';
import { fetchModels } from '@/services/apiConfig';
import { MdRefresh } from 'vue-icons-plus/md';

const props = defineProps<{
  apiConfig: ApiConfig;
  modelValue?: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const models = ref<ModelInfo[]>([]);
const loading = ref(false);
const error = ref('');
const isOpen = ref(false);

const selectedModel = computed({
  get: () => props.modelValue || '',
  set: (value: string) => emit('update:modelValue', value)
});

const displayModels = computed(() => {
  if (props.modelValue && !models.value.some(m => m.id === props.modelValue)) {
    // 如果当前选中的模型不在列表中，添加到列表开头
    return [{ id: props.modelValue, object: 'model' }, ...models.value];
  }
  return models.value;
});

async function loadModels() {
  if (!props.apiConfig.endpoint || !props.apiConfig.key) {
    error.value = '请先配置API端点和密钥';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    models.value = await fetchModels(props.apiConfig);
  } catch (err) {
    error.value = err instanceof Error ? err.message : '获取模型失败';
    console.error('获取模型失败:', err);
  } finally {
    loading.value = false;
  }
}

function toggleDropdown() {
  isOpen.value = !isOpen.value;
  if (isOpen.value && models.value.length === 0) {
    loadModels();
  }
}

function selectModel(modelId: string) {
  selectedModel.value = modelId;
  isOpen.value = false;
}

function handleRefreshModels() {
  loadModels();
}

// 监听API配置变化，清空模型列表
watch(() => [props.apiConfig.endpoint, props.apiConfig.key], () => {
  models.value = [];
  error.value = '';
  selectedModel.value = '';
}, { deep: true });

// 点击外部关闭下拉框
function handleClickOutside(event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (!target.closest('.model-select')) {
    isOpen.value = false;
  }
}

// 添加全局点击监听
if (typeof document !== 'undefined') {
  document.addEventListener('click', handleClickOutside);
}
</script>

<template>
  <div class="model-select">
    <div class="model-input-group">
      <div class="model-input-wrapper">
        <input
          v-model="selectedModel"
          type="text"
          class="model-input"
          placeholder="请选择或输入模型名称"
          @focus="toggleDropdown"
        />
        <button
          class="refresh-button"
          :disabled="loading || !apiConfig.endpoint || !apiConfig.key"
          @click="handleRefreshModels"
          title="刷新模型列表"
        >
          <MdRefresh class="w-4 h-4" :class="{ 'animate-spin': loading }" />
        </button>
      </div>

      <!-- 下拉模型列表 -->
      <div v-if="isOpen" class="model-dropdown">
        <div v-if="loading" class="dropdown-loading">
          加载中...
        </div>
        <div v-else-if="error" class="dropdown-error">
          {{ error }}
        </div>
        <div v-else-if="displayModels.length === 0" class="dropdown-empty">
          暂无可用模型
        </div>
        <div v-else class="dropdown-list">
          <div
            v-for="model in displayModels"
            :key="model.id"
            class="dropdown-item"
            :class="{ active: selectedModel === model.id }"
            @click="selectModel(model.id)"
          >
            <span class="model-name">{{ model.id }}</span>
            <span v-if="model.owned_by" class="model-owner">{{ model.owned_by }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.model-select {
  position: relative;
  width: 100%;
}

.model-input-group {
  position: relative;
}

.model-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.model-input {
  width: 100%;
  padding: 0.5rem 2.5rem 0.5rem 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #1f2937;
  background-color: white;
  transition: border-color 0.2s;
}

.model-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.refresh-button {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  padding: 0.25rem;
  border: none;
  background: none;
  cursor: pointer;
  color: #6b7280;
  border-radius: 4px;
  transition: all 0.2s;
}

.refresh-button:hover:not(:disabled) {
  background-color: #f3f4f6;
  color: #374151;
}

.refresh-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.model-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-loading,
.dropdown-error,
.dropdown-empty {
  padding: 0.75rem;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;
}

.dropdown-error {
  color: #ef4444;
}

.dropdown-list {
  max-height: 200px;
  overflow-y: auto;
}

.dropdown-item {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-item.active {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.model-name {
  font-weight: 500;
}

.model-owner {
  font-size: 0.75rem;
  color: #6b7280;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>