<script setup lang="ts">
import type { CharacterData } from '@/types/character';

const props = defineProps<{
  character: CharacterData;
}>();

const emit = defineEmits<{
  click: [uuid: string];
}>();

function handleClick() {
  emit('click', props.character.uuid);
}
</script>

<template>
  <div
    class="character-card bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
    @click="handleClick"
  >
    <div class="aspect-[3/4] relative bg-gray-200">
      <img
        v-if="character.backgroundPath"
        :src="character.backgroundPath"
        :alt="character.card.data.name"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full flex items-center justify-center text-gray-400"
      >
        <span>暂无图片</span>
      </div>
    </div>
    <div class="p-4">
      <h3 class="text-lg font-semibold text-gray-800 truncate">
        {{ character.card.data.name || '未命名角色' }}
      </h3>
      <p class="text-sm text-gray-600 mt-1 line-clamp-2">
        {{ character.card.data.description || '暂无描述' }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
