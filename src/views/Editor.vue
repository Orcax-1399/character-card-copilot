<script setup lang="ts">
import { onMounted } from 'vue';
import { useAppStore } from '@/stores/app';

const appStore = useAppStore();

onMounted(() => {
  appStore.setPageTitle('角色卡编辑器', false);
});
</script>

<template>
  <div class="editor">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h2 class="text-2xl font-semibold mb-4">创建和编辑角色卡</h2>
      <p class="text-gray-600">
        编辑器功能开发中...
      </p>
    </div>
  </div>
</template>

<style scoped>
</style>
