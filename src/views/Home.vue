<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '@/stores/app';
import type { CharacterData } from '@/types/character';
import { getAllCharacters, createCharacter } from '@/services/characterStorage';
import CharacterCard from '@/components/CharacterCard.vue';
import NewCharacterCard from '@/components/NewCharacterCard.vue';

const appStore = useAppStore();
const router = useRouter();
const characters = ref<CharacterData[]>([]);
const loading = ref(false);

onMounted(async () => {
  appStore.setPageTitle('首页', false);
  await loadCharacters();
});

async function loadCharacters() {
  loading.value = true;
  try {
    characters.value = await getAllCharacters();
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
