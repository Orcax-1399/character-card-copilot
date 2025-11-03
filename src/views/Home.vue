<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAppStore } from '@/stores/app';
import type { CharacterData } from '@/types/character';
import { getAllCharacters, createCharacter } from '@/services/characterStorage';
import CharacterCard from '@/components/CharacterCard.vue';
import NewCharacterCard from '@/components/NewCharacterCard.vue';

const appStore = useAppStore();
const router = useRouter();
const route = useRoute();
const characters = ref<CharacterData[]>([]);
const loading = ref(false);

onMounted(async () => {
  appStore.setPageTitle('首页', false);
  await loadCharacters();
});

// 监听路由变化，当从编辑器返回时重新加载角色数据
watch(
  () => route.path,
  (newPath, oldPath) => {
    // 当从编辑器页面返回首页时，重新加载角色数据
    if (newPath === '/' && oldPath?.startsWith('/editor/')) {
      loadCharacters();
    }
  }
);

// 添加页面可见性监听，当页面重新获得焦点时重新加载数据
onMounted(() => {
  document.addEventListener('visibilitychange', handleVisibilityChange);
});

function handleVisibilityChange() {
  if (!document.hidden && route.path === '/') {
    loadCharacters();
  }
}

// 清理事件监听器
onUnmounted(() => {
  document.removeEventListener('visibilitychange', handleVisibilityChange);
});

async function loadCharacters() {
  loading.value = true;
  try {
    const loadedCharacters = await getAllCharacters();
    console.log('加载的角色数据:', loadedCharacters.map(c => ({
      name: c.card.data.name,
      backgroundPath: c.backgroundPath,
      backgroundPathLength: c.backgroundPath.length,
      isBase64: c.backgroundPath.startsWith('data:')
    })));
    characters.value = loadedCharacters;
  } catch (error) {
    console.error('加载角色卡失败:', error);
  } finally {
    loading.value = false;
  }
}

function handleCharacterClick(uuid: string) {
  router.push(`/editor/${uuid}`);
}

async function handleNewCharacter() {
  try {
    const newCharacter = await createCharacter('新角色');
    characters.value.push(newCharacter);
    router.push(`/editor/${newCharacter.uuid}`);
  } catch (error) {
    console.error('创建角色卡失败:', error);
  }
}
</script>

<template>
  <div class="home">
    <div v-if="loading" class="flex items-center justify-center h-64">
      <div class="text-gray-600">加载中...</div>
    </div>

    <div v-else class="character-grid">
      <CharacterCard
        v-for="character in characters"
        :key="character.uuid"
        :character="character"
        @click="handleCharacterClick"
      />
      <NewCharacterCard @click="handleNewCharacter" />
    </div>
  </div>
</template>

<style scoped>
.character-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}
</style>
