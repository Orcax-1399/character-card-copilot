<script setup lang="ts">
import { ref, onMounted } from 'vue';
import type { ApiConfig, ApiTestResult } from '@/types/api';
import { getAllApiConfigs, deleteApiConfig, setDefaultApiConfig, toggleApiConfig } from '@/services/apiConfig';
import ApiItem from './ApiItem.vue';
import NewApiDialog from './NewApiDialog.vue';

const emit = defineEmits<{
  select: [api: ApiConfig];
  testConnection: [result: ApiTestResult];
  copy: [api: ApiConfig];
}>();

const apis = ref<ApiConfig[]>([]);
const loading = ref(false);
const showNewApiDialog = ref(false);

onMounted(async () => {
  await loadApis();
});

async function loadApis() {
  loading.value = true;
  try {
    apis.value = await getAllApiConfigs();
  } catch (error) {
    console.error('加载API配置失败:', error);
  } finally {
    loading.value = false;
  }
}

function handleSelectApi(api: ApiConfig) {
  emit('select', api);
}

function handleDeleteApi(profile: string) {
  // TODO: 确认删除对话框
  deleteApiConfig(profile).then(() => {
    apis.value = apis.value.filter(api => api.profile !== profile);
  });
}

function handleSetDefault(profile: string) {
  setDefaultApiConfig(profile).then(() => {
    apis.value.forEach(api => {
      api.default = api.profile === profile;
    });
  });
}

function handleToggleEnabled(profile: string, enabled: boolean) {
  toggleApiConfig(profile, enabled).then(() => {
    const api = apis.value.find(a => a.profile === profile);
    if (api) {
      api.enabled = enabled;
    }
  });
}

function handleTestConnection(result: ApiTestResult) {
  emit('testConnection', result);
}

function handleCopyApi(api: ApiConfig) {
  emit('copy', api);
}

function handleNewApiCreated(api: ApiConfig) {
  apis.value.push(api);
  showNewApiDialog.value = false;
}
</script>

<template>
  <div class="api-list">
    <div v-if="loading" class="text-center py-8 text-gray-600">
      加载中...
    </div>

    <div v-else class="api-list-container">
      <ApiItem
        v-for="api in apis"
        :key="api.profile"
        :api="api"
        @select="handleSelectApi"
        @delete="handleDeleteApi"
        @setDefault="handleSetDefault"
        @toggleEnabled="handleToggleEnabled"
        @testConnection="handleTestConnection"
        @copy="handleCopyApi"
      />

      <!-- 新建API按钮 -->
      <div
        class="api-item new-api-item cursor-pointer hover:bg-gray-50 border border-gray-200 rounded-lg p-4"
        @click="showNewApiDialog = true"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span class="text-blue-600 font-semibold">+</span>
            </div>
            <span class="text-gray-700 font-medium">新建API</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 新建API对话框 -->
    <NewApiDialog
      v-if="showNewApiDialog"
      @created="handleNewApiCreated"
      @cancel="showNewApiDialog = false"
    />
  </div>
</template>

<style scoped>
.api-list-container {
  max-height: 500px;
  overflow-y: auto;
}

.api-item {
  margin-bottom: 0.5rem;
}

.new-api-item {
  border-style: dashed;
  border-color: #9ca3af;
}

.new-api-item:hover {
  border-style: solid;
  border-color: #3b82f6;
}
</style>