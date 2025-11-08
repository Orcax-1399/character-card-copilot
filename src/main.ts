// Copyright 2025 Character Card Copilot Contributors
// SPDX-License-Identifier: Apache-2.0

import { createApp } from "vue";
import App from "./App.vue";
import "./assets/styles.css";
import router from "./router";
import { createPinia } from "pinia";

const app = createApp(App);

app.use(router);
app.use(createPinia());

app.mount("#app");
