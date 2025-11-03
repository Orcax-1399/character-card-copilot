<script setup lang="ts">
import { MdAdd } from 'vue-icons-plus/md';

const emit = defineEmits<{
  click: [];
}>();

function handleClick() {
  emit('click');
}
</script>

<template>
  <div
    class="new-character-card rounded-lg overflow-hidden cursor-pointer transition-all hover:border-blue-500 hover:bg-blue-50"
    @click="handleClick"
  >
    <div class="aspect-[3/4] flex flex-col items-center justify-center">
      <MdAdd class="w-16 h-16 text-gray-400" />
      <span class="mt-4 text-gray-600 font-medium">新建角色</span>
    </div>
  </div>
</template>

<style scoped>
.new-character-card {
  border: 2px dashed #d1d5db;
  background-color: #f9fafb;
}
</style>
