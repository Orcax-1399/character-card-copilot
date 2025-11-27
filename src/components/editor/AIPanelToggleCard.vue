<script setup lang="ts">
const emit = defineEmits<{
    (e: "toggle"): void;
}>();

function onToggle() {
    emit("toggle");
}
</script>

<template>
    <div
        class="card rounded-xl bg-white p-4 shadow-2xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
        @click="onToggle"
    >
        <div class="text-center text-gray-500">
            <svg
                class="w-6 h-6 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 19l-7-7 7-7"
                />
            </svg>
            <span class="text-xs">显示 AI 面板</span>
        </div>
    </div>
</template>

