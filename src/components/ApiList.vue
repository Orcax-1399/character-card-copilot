<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import type { ApiConfig, ApiTestResult } from '@/types/api';
import { useApiStore } from '@/stores/api';
import ApiItem from './ApiItem.vue';
import NewApiDialog from './NewApiDialog.vue';

const emit = defineEmits<{
  select: [api: ApiConfig];
  testConnection: [result: ApiTestResult];
  copy: [api: ApiConfig];
}>();

const apiStore = useApiStore();
const { apis, loading } = storeToRefs(apiStore);
const showNewApiDialog = ref(false);

onMounted(async () => {
  // 自动加载API配置
  await apiStore.loadAllApis();
});

function handleSelectApi(api: ApiConfig) {
  emit('select', api);
}

async function handleDeleteApi(profile: string) {
  // TODO: 确认删除对话框
  try {
    await apiStore.deleteApi(profile);
  } catch (error) {
    console.error('删除API配置失败:', error);
  }
}

async function handleSetDefault(profile: string) {
  try {
    await apiStore.setDefaultApi(profile);
  } catch (error) {
    console.error('设置默认API配置失败:', error);
  }
}

async function handleToggleEnabled(profile: string, enabled: boolean) {
  try {
    await apiStore.toggleApi(profile, enabled);
  } catch (error) {
    console.error('切换API启用状态失败:', error);
  }
}

function handleTestConnection(result: ApiTestResult) {
  emit('testConnection', result);
}

function handleCopyApi(_api: ApiConfig) {
  emit('copy', _api);
}

function handleNewApiCreated(_api: ApiConfig) {
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