# Character Card Copilot

<div align="center">

**AI 驱动的角色卡编辑器**

使用 AI 辅助编辑和管理 TavernCard V2 格式的角色卡

![Tauri](https://img.shields.io/badge/Tauri-FFC131?logo=tauri&logoColor=white)
![Vue 3](https://img.shields.io/badge/Vue.js-4FC08D?logo=vue.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Rust](https://img.shields.io/badge/Rust-000000?logo=rust&logoColor=white)
![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)

</div>

## 📖 项目介绍

Character Card Copilot 是一个桌面应用程序，用于创建、编辑和管理 AI 角色卡，支持 TavernCard V2 标准格式。

---

## ✨ 主要功能

### 📥 **加载角色卡**
- 从 PNG 图片导入（读取 PNG 元数据）
- 从 JSON 文件导入
- 完全兼容 TavernCard V2 格式

### 💾 **导出角色卡**
- 导出为 PNG 格式（嵌入元数据）
- 导出为 JSON 格式
- 保留所有角色数据和世界书内容

### 🤖 **AI 辅助编辑**
- 使用 AI 生成和优化角色卡内容
- **支持的字段**：描述、性格、场景、第一条消息、示例对话、系统提示词、历史指令
- 一键应用 AI 生成的内容

> ~~**注意**：目前 AI 编辑暂时只支持角色卡的主要字段~~
已经支持添加世界书Entry

### 📚 **世界书编辑器**（测试中）
- 创建、编辑、删除世界书条目
- 搜索和筛选功能
- 支持完整的 TavernCard V2 世界书规范
- Extensions 字段完整支持

> **状态**：🧪 仍然在测试，但是应该已经稳定

### ⚙️ **自定义 API 配置**
- 自定义 API 端点，支持openai协议
- API 密钥和模型配置

---

## 🛠️ 技术栈

- **前端**: Vue 3 + TypeScript + TailwindCSS 4.0
- **后端**: Tauri + Rust
- **状态管理**: Pinia
- **AI 集成**: 支持多种 API 提供商

---

## 📦 快速开始

### 安装依赖
```bash
pnpm install
```

### 运行开发环境
```bash
pnpm tauri dev
```

### 构建应用
```bash
pnpm tauri build
```

---

## 📄 开源协议

本项目采用 [Apache License 2.0](LICENSE) 开源协议。

```
Copyright 2025 Character Card Copilot Contributors

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
```

### 第三方开源组件

本项目使用了以下开源组件，详细信息请参阅 [NOTICE](NOTICE) 文件：
- Vue.js, Vite, Tailwind CSS (MIT License)
- Tauri, Serde, Tokio (Apache-2.0 OR MIT License)
- 其他依赖详见 NOTICE 文件

---

<div align="center">

**由 ❤️ 和 ☕ 驱动**

</div>
