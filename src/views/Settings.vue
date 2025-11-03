<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useAppStore } from "@/stores/app";
import type { ApiConfig, ApiTestResult } from "@/types/api";
import ApiList from "@/components/ApiList.vue";
import ModelSelect from "@/components/ModelSelect.vue";

const appStore = useAppStore();
const selectedApi = ref<ApiConfig | null>(null);
const editingApi = ref<ApiConfig | null>(null);
const lastTestResult = ref<ApiTestResult | null>(null);

onMounted(() => {
    appStore.setPageTitle("设置", true);
});

function handleSelectApi(api: ApiConfig) {
    selectedApi.value = api;
    editingApi.value = { ...api }; // 创建副本用于编辑
    lastTestResult.value = null; // 重置测试结果
}

function updateApiModel(model: string) {
    if (editingApi.value) {
        editingApi.value.model = model;
    }
}

function saveApiChanges() {
    if (editingApi.value && selectedApi.value) {
        // TODO: 调用更新API配置的服务
        console.log("保存API配置:", editingApi.value);
        selectedApi.value = { ...editingApi.value };
    }
}

function handleTestConnection(result: ApiTestResult) {
    lastTestResult.value = result;
    if (selectedApi.value) {
        selectedApi.value = { ...selectedApi.value };
    }
}

function handleToggleEnabled() {
    if (selectedApi.value && !selectedApi.value.enabled) {
        // 如果要启用，检查是否有成功的测试结果
        if (lastTestResult.value?.success) {
            selectedApi.value.enabled = true;
        } else {
            alert("请先测试连接成功后再启用此配置");
        }
    } else if (selectedApi.value) {
        selectedApi.value.enabled = false;
    }
}

function handleSetDefault() {
    if (selectedApi.value && !selectedApi.value.default) {
        // TODO: 调用设为默认的服务
        console.log("设为默认:", selectedApi.value.profile);
        selectedApi.value.default = true;
    }
}
</script>

<template>
    <div class="bg-gray-50">
        <div class="max-w-7xl mx-auto">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <!-- 左侧：API列表 -->
                <div class="lg:col-span-1">
                    <div class="bg-white rounded-xl shadow-lg p-4 h-fit">
                        <div class="mb-4">
                            <h2 class="text-lg font-bold text-gray-900 mb-1">
                                API配置
                            </h2>
                            <p class="text-xs text-gray-600">
                                管理AI服务的API配置
                            </p>
                        </div>

                        <ApiList
                            @select="handleSelectApi"
                            @testConnection="handleTestConnection"
                        />
                    </div>
                </div>

                <!-- 右侧：配置详情 -->
                <div class="lg:col-span-2">
                    <div
                        v-if="selectedApi"
                        class="bg-white rounded-xl shadow-lg p-4"
                    >
                        <div class="mb-4">
                            <h3 class="text-xl font-bold text-gray-900 mb-1">
                                {{ selectedApi.profile }} - 配置详情
                            </h3>
                            <div class="h-1 w-16 bg-blue-500 rounded"></div>
                        </div>

                        <div class="space-y-2">
                            <div class="bg-gray-50 rounded-lg p-3">
                                <label
                                    class="block text-sm font-semibold text-gray-700 mb-1"
                                    >配置名称</label
                                >
                                <div
                                    class="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    {{ selectedApi.profile }}
                                </div>
                            </div>

                            <div class="bg-gray-50 rounded-lg p-3">
                                <label
                                    class="block text-sm font-semibold text-gray-700 mb-1"
                                    >链接端点</label
                                >
                                <div
                                    class="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    {{ selectedApi.endpoint || "未设置" }}
                                </div>
                            </div>

                            <div class="bg-gray-50 rounded-lg p-3">
                                <label
                                    class="block text-sm font-semibold text-gray-700 mb-1"
                                    >API密钥</label
                                >
                                <div
                                    class="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    {{
                                        selectedApi.key ? "••••••••" : "未设置"
                                    }}
                                </div>
                            </div>

                            <div class="bg-gray-50 rounded-lg p-3">
                                <label
                                    class="block text-sm font-semibold text-gray-700 mb-1"
                                    >使用模型</label
                                >
                                <ModelSelect
                                    v-if="editingApi"
                                    :api-config="editingApi"
                                    :model-value="editingApi.model"
                                    @update:modelValue="updateApiModel"
                                />
                                <div
                                    v-else
                                    class="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    {{ selectedApi.model || "未设置" }}
                                </div>
                            </div>

                            <div class="bg-gray-50 rounded-lg p-2">
                                <label
                                    class="block text-sm font-semibold text-gray-700 mb-1"
                                    >启用/禁用和默认设置</label
                                >

                                <!-- 测试结果显示 -->
                                <div v-if="lastTestResult" class="mb-3">
                                    <div
                                        class="text-xs px-3 py-2 rounded-lg"
                                        :class="{
                                            'bg-green-100 text-green-800 border border-green-200':
                                                lastTestResult.success,
                                            'bg-red-100 text-red-800 border border-red-200':
                                                !lastTestResult.success,
                                        }"
                                    >
                                        {{ lastTestResult.message }}
                                    </div>
                                </div>

                                <!-- 控制按钮 -->
                                <div class="flex flex-wrap gap-2">
                                    <!-- 启用/禁用按钮 -->
                                    <button
                                        class="font-bold py-1.5 px-4 rounded-full text-sm transition-colors"
                                        :class="{
                                            'bg-green-500 hover:bg-green-600 text-white':
                                                selectedApi.enabled,
                                            'bg-blue-500 hover:bg-blue-600 text-white':
                                                !selectedApi.enabled,
                                            'opacity-50 cursor-not-allowed':
                                                !selectedApi.enabled &&
                                                !lastTestResult?.success,
                                        }"
                                        @click="handleToggleEnabled"
                                        :disabled="
                                            !selectedApi.enabled &&
                                            !lastTestResult?.success
                                        "
                                    >
                                        {{
                                            selectedApi.enabled
                                                ? "禁用"
                                                : "启用"
                                        }}
                                    </button>

                                    <!-- 设为默认按钮 -->
                                    <button
                                        v-if="!selectedApi.default"
                                        class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-4 rounded-full text-sm transition-colors"
                                        @click="handleSetDefault"
                                    >
                                        设为默认
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- 操作按钮区域 -->
                        <div class="mt-6 pt-4 border-t border-gray-200">
                            <div class="flex justify-end gap-3">
                                <button
                                    class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors"
                                    @click="saveApiChanges"
                                >
                                    保存更改
                                </button>
                                <button
                                    class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors"
                                >
                                    测试连接
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-else class="bg-white rounded-xl shadow-lg p-8">
                        <div class="text-center">
                            <div class="mb-4">
                                <span class="text-6xl text-gray-300">🔧</span>
                            </div>
                            <h3 class="text-xl font-bold text-gray-800 mb-3">
                                选择API配置
                            </h3>
                            <p class="text-gray-600 text-sm max-w-sm mx-auto">
                                请从左侧选择一个API配置进行查看和编辑，<br />
                                或创建新的API配置。
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped></style>
