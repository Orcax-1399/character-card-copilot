<script setup lang="ts">
import { RouterView } from "vue-router";
import Navbar from "@/components/Navbar.vue";
</script>

<template>
    <div id="app" class="min-h-screen bg-gray-50">
        <Navbar />
        <main class="container mx-auto p-4">
            <RouterView />
        </main>
    </div>
</template>

<style scoped></style>
