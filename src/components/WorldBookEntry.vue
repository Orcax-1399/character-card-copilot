<template>
  <div class="bg-gray-50 rounded-lg border border-gray-200 mb-2 transition-all hover:border-gray-300">
    <!-- 条目头部（可点击展开/收起） -->
    <div
      class="flex items-center justify-between p-3 cursor-pointer"
      @click="toggleExpanded"
    >
      <div class="flex items-center gap-3 flex-1">
        <!-- 展开/收起图标 -->
        <svg
          class="w-5 h-5 text-gray-500 transition-transform"
          :class="{ 'rotate-90': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>

        <!-- 条目名称或备注 -->
        <div class="flex-1">
          <div class="flex items-center gap-2">
            <span class="font-semibold text-gray-900">
              {{ entry.comment || entry.name || `条目 #${entry.id}` }}
            </span>

            <!-- 启用/禁用状态 -->
            <span
              class="px-2 py-1 text-xs font-semibold rounded-full"
              :class="entry.enabled
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'"
            >
              {{ entry.enabled ? '启用' : '禁用' }}
            </span>

            <!-- 优先级标识 -->
            <span
              v-if="entry.priority !== undefined && entry.priority !== 10"
              class="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800"
            >
              优先级: {{ entry.priority }}
            </span>
          </div>

          <!-- 关键词摘要 -->
          <div class="mt-1 text-xs text-gray-500">
            <span class="font-medium">关键词 ({{ entry.keys.length }}):</span>
            <span class="ml-1">{{ keysSummary }}</span>
          </div>
        </div>
      </div>

      <!-- 操作按钮组 -->
      <div class="flex items-center gap-2" @click.stop>
        <button
          class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="编辑"
          @click="handleEdit"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>

        <button
          class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="删除"
          @click="handleDelete"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 详细内容（展开时显示） -->
    <div
      v-if="isExpanded"
      class="px-3 pb-3 space-y-2 border-t border-gray-200 pt-3"
    >
      <!-- 完整关键词列表 -->
      <div>
        <label class="text-sm font-semibold text-gray-700">关键词</label>
        <div class="mt-1 flex flex-wrap gap-1">
          <span
            v-for="(key, index) in entry.keys"
            :key="index"
            class="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
          >
            {{ key }}
          </span>
        </div>
      </div>

      <!-- 次要关键词（如果存在） -->
      <div v-if="entry.secondary_keys && entry.secondary_keys.length > 0">
        <label class="text-sm font-semibold text-gray-700">次要关键词</label>
        <div class="mt-1 flex flex-wrap gap-1">
          <span
            v-for="(key, index) in entry.secondary_keys"
            :key="index"
            class="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full"
          >
            {{ key }}
          </span>
        </div>
      </div>

      <!-- 内容 -->
      <div>
        <label class="text-sm font-semibold text-gray-700">内容</label>
        <p class="mt-1 text-sm text-gray-600 whitespace-pre-wrap">{{ entry.content }}</p>
      </div>

      <!-- 评论/备注 -->
      <div v-if="entry.comment">
        <label class="text-sm font-semibold text-gray-700">备注</label>
        <p class="mt-1 text-sm text-gray-500 italic">{{ entry.comment }}</p>
      </div>

      <!-- 高级设置 -->
      <div class="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100">
        <div>
          <label class="text-xs font-medium text-gray-500">插入位置</label>
          <p class="text-sm text-gray-700">
            {{ entry.position === 'before_char' ? '角色定义之前' : '角色定义之后' }}
          </p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500">插入顺序</label>
          <p class="text-sm text-gray-700">{{ entry.insertion_order }}</p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500">插入深度</label>
          <p class="text-sm text-gray-700">{{ extensionsDepth }}</p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500">概率</label>
          <p class="text-sm text-gray-700">{{ extensionsProbability }}%</p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500">大小写敏感</label>
          <p class="text-sm text-gray-700">{{ entry.case_sensitive ? '是' : '否' }}</p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500">选择性触发</label>
          <p class="text-sm text-gray-700">{{ entry.selective ? '是' : '否' }}</p>
        </div>

        <div>
          <label class="text-xs font-medium text-gray-500">常驻条目</label>
          <p class="text-sm text-gray-700">{{ entry.constant ? '是' : '否' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { WorldBookEntry } from '@/types/character';

interface Props {
  entry: WorldBookEntry;
  isExpanded: boolean;
}

interface Emits {
  (e: 'toggle'): void;
  (e: 'edit', entryId: number | undefined): void;
  (e: 'delete', entryId: number | undefined): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// 关键词摘要（显示前3个）
const keysSummary = computed(() => {
  if (props.entry.keys.length === 0) {
    return '无';
  }

  const displayKeys = props.entry.keys.slice(0, 3);
  const summary = displayKeys.join(', ');

  if (props.entry.keys.length > 3) {
    return `${summary}... (+${props.entry.keys.length - 3})`;
  }

  return summary;
});

// 从 extensions 读取插入深度
const extensionsDepth = computed(() => {
  const ext = props.entry.extensions as any;
  return ext?.depth ?? 5;
});

// 从 extensions 读取概率
const extensionsProbability = computed(() => {
  const ext = props.entry.extensions as any;
  return ext?.probability ?? 100;
});

function toggleExpanded(): void {
  emit('toggle');
}

function handleEdit(): void {
  console.log('🔘 WorldBookEntry edit button clicked');
  console.log('  - entry.id:', props.entry.id);
  console.log('  - full entry:', props.entry);
  emit('edit', props.entry.id);
}

function handleDelete(): void {
  console.log('🗑️ WorldBookEntry delete button clicked');
  console.log('  - entry.id:', props.entry.id);
  emit('delete', props.entry.id);
}
</script>
