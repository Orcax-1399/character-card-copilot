<template>
  <div class="h-full flex gap-2">
    <!-- 左侧：条目列表区域 -->
    <div
      class="flex-1 flex flex-col bg-white rounded-xl shadow-2xl p-3 overflow-hidden"
      :class="showEditor ? 'w-[45%]' : 'w-full'"
    >
      <!-- 标题 -->
      <div class="mb-4">
        <h2 class="text-xl font-bold text-gray-900">世界书编辑器</h2>
        <p class="text-sm text-gray-500 mt-1">管理角色的知识库条目</p>
      </div>

      <!-- 搜索和筛选组件 -->
      <WorldBookSearch
        :statistics="worldBookStore.statistics"
        :filtered-count="worldBookStore.filteredEntries.length"
        @search="handleSearch"
        @filter="handleFilter"
        @create="handleCreateNew"
      />

      <!-- 条目列表 -->
      <div class="flex-1 overflow-y-auto mt-4">
        <div v-if="worldBookStore.isLoading" class="flex items-center justify-center h-32">
          <div class="text-gray-500">加载中...</div>
        </div>

        <div v-else-if="worldBookStore.filteredEntries.length === 0" class="flex flex-col items-center justify-center h-32 text-gray-500">
          <svg class="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>暂无条目</p>
          <button
            class="mt-3 bg-blue-500 hover:bg-blue-700 text-white text-sm font-medium py-1.5 px-3 rounded-full"
            @click="handleCreateNew"
          >
            创建第一个条目
          </button>
        </div>

        <div v-else class="space-y-2">
          <WorldBookEntry
            v-for="entry in worldBookStore.filteredEntries"
            :key="entry.id"
            :entry="entry"
            :is-expanded="worldBookStore.expandedEntryIds.has(entry.id || 0)"
            @toggle="worldBookStore.toggleEntryExpanded(entry.id || 0)"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </div>
    </div>

    <!-- 右侧：编辑器面板 -->
    <div
      v-if="showEditor"
      class="w-[55%] transition-all"
    >
      <WorldBookEntryEditor
        :entry="worldBookStore.selectedEntry"
        :is-creating-new="worldBookStore.isCreatingNew"
        @save="handleSave"
        @cancel="handleCancel"
        @delete="handleDeleteFromEditor"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useWorldBookStore } from '@/stores/worldBook';
import WorldBookSearch from './WorldBookSearch.vue';
import WorldBookEntry from './WorldBookEntry.vue';
import WorldBookEntryEditor from './WorldBookEntryEditor.vue';
import type { CreateWorldBookEntryParams, UpdateWorldBookEntryParams } from '@/types/character';

interface Props {
  characterUuid: string;
}

const props = defineProps<Props>();

// Store
const worldBookStore = useWorldBookStore();

// 计算属性
const showEditor = computed(() => {
  return worldBookStore.selectedEntryId !== null || worldBookStore.isCreatingNew;
});

// 生命周期
onMounted(async () => {
  await worldBookStore.loadWorldBook(props.characterUuid);
});

// 事件处理
function handleSearch(searchText: string): void {
  worldBookStore.updateFilterOptions({ searchText });
}

function handleFilter(options: {
  showEnabled: boolean;
  showDisabled: boolean;
  sortBy: 'insertion_order' | 'priority' | 'name';
  sortOrder: 'asc' | 'desc';
}): void {
  worldBookStore.updateFilterOptions(options);
}

function handleCreateNew(): void {
  worldBookStore.startCreatingNew();
}

function handleEdit(entryId: number | undefined): void {
  console.log('🖊️ WorldBookEditor.handleEdit called with entryId:', entryId);
  console.log('  - Current selectedEntry:', worldBookStore.selectedEntry);
  console.log('  - Current isCreatingNew:', worldBookStore.isCreatingNew);

  if (entryId !== undefined) {
    worldBookStore.selectEntry(entryId);

    console.log('  - After selectEntry:');
    console.log('    - selectedEntry:', worldBookStore.selectedEntry);
    console.log('    - isCreatingNew:', worldBookStore.isCreatingNew);
  }
}

async function handleDelete(entryId: number | undefined): Promise<void> {
  if (entryId === undefined) return;

  if (confirm('确定要删除这个条目吗？')) {
    try {
      await worldBookStore.deleteEntry(entryId);
    } catch (error) {
      alert('删除失败: ' + error);
    }
  }
}

async function handleSave(data: CreateWorldBookEntryParams | UpdateWorldBookEntryParams): Promise<void> {
  try {
    if (worldBookStore.isCreatingNew) {
      // 创建新条目
      await worldBookStore.createEntry(data as CreateWorldBookEntryParams);
      alert('条目创建成功！');
    } else if (worldBookStore.selectedEntryId !== null) {
      // 更新现有条目
      await worldBookStore.updateEntry(worldBookStore.selectedEntryId, data);
      alert('条目更新成功！');
    }
  } catch (error) {
    alert('保存失败: ' + error);
  }
}

function handleCancel(): void {
  worldBookStore.selectEntry(null);
  worldBookStore.cancelCreatingNew();
}

async function handleDeleteFromEditor(): Promise<void> {
  if (worldBookStore.selectedEntryId === null) return;

  try {
    await worldBookStore.deleteEntry(worldBookStore.selectedEntryId);
    alert('条目删除成功！');
  } catch (error) {
    alert('删除失败: ' + error);
  }
}
</script>
