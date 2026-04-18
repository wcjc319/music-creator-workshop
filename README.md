# 智能音乐创作工坊

## 项目简介

智能音乐创作工坊是一个基于AI技术的多模态音乐生成与助唱平台，旨在通过人工智能技术降低音乐创作门槛，为音乐教育、理疗和内容创作等领域提供创新解决方案。平台集成了音乐生成、歌词谱写、AI助唱、曲谱转换等核心功能，支持本地文件上传，实现了从创意到成品的全流程自动化音乐创作。

## 功能特点

- **AI音乐生成**：基于ACE-Step模型，支持多风格、多情绪定制，生成专业品质的音乐
- **智能歌词谱写**：基于Qwen3多模态模型，支持文本主题和音频参考两种方式生成歌词
- **AI助唱**：智能分析参考音频，生成风格匹配的AI人声演唱，实现完美融合
- **曲谱转换**：支持音频转MIDI、MIDI转乐谱，生成PDF、TXT、MusicXML等多种格式
- **本地文件上传**：支持上传本地音频文件进行处理和转换
- **用户认证**：支持用户注册、登录和个人曲库管理
- **跨平台支持**：基于React+Vite开发，支持Web浏览器访问

## 技术栈

| 层级       | 技术选型                | 版本            | 开源协议   |
| -------- | ------------------- | ------------- | ------ |
| 前端界面     | React + Vite + Tailwind CSS | 18.0.0+ / 5.0.0+ | MIT    |
| 后端服务     | Node.js + Express   | 20.0.0+ / 4.18.0+ | MIT    |
| AI 模型与算法 | Python + basic-pitch + music21 | 3.11.0+ | MIT    |
| 数据存储     | 文件系统 + localStorage | - | -      |
| 开发工具     | Git + VS Code       | - | MIT    |

## 安装与使用

### 环境要求

- 操作系统：Windows 10 及以上
- 运行环境：Node.js 16.0 及以上 / Python 3.9 及以上
- 硬件要求：普通 PC 即可

### 安装步骤

1. 克隆项目仓库到本地

```bash
git clone <项目仓库地址>
cd music_generate_v4
```

2. 安装前端依赖

```bash
npm install
```

3. 安装Python依赖

```bash
# 创建虚拟环境（推荐）
conda create -n music_gen python=3.11.4
conda activate music_gen

# 安装依赖
pip install basic-pitch music21
```

4. 安装FFmpeg和MuseScore 4
   - 下载并安装FFmpeg，添加到系统环境变量
   - 下载并安装MuseScore 4

### 运行项目

1. 启动后端服务

```bash
node server.js
```

2. 启动前端开发服务器

```bash
npm run dev
```

3. 访问应用
   打开浏览器访问 `http://localhost:5173`

## AI 工具使用说明

本项目使用的所有 AI 工具均符合国家网信办备案要求与国赛规定范围，具体如下：

- **ACE-Step**：用于音乐生成和AI助唱，通过API调用实现
- **Qwen3**：用于歌词生成，支持多模态输入，通过API调用实现
- **basic-pitch**：用于音频转MIDI，通过Python库实现
- **Music21**：用于MIDI处理和乐谱生成，通过Python库实现

所有 AI 生成内容均经过团队人工审核、修改与优化，确保内容质量和合规性。

## 项目结构

```Plain
music_generate_v4/
├── src/              # 前端代码（React）
│   ├── app/         # 应用组件和页面
│   ├── styles/      # 样式文件
│   └── main.tsx     # 前端入口
├── scripts/         # Python脚本（音频处理和乐谱转换）
│   ├── audio_to_midi.py    # 音频转MIDI
│   └── music21_convert.py   # MIDI转乐谱
├── server.js        # 后端服务器
├── package.json     # 前端依赖
├── index.html       # 前端入口HTML
└── README.md        # 项目说明文档
```

## 版权与开源声明

- 本项目核心代码与算法为团队自主原创，遵循**MIT 开源协议**开放
- 项目使用的开源组件与模型均严格遵循对应开源协议，保留原作者版权声明
- 本项目仅用于学习、研究与参赛展示，未经授权不得用于商业用途
- 所有 AI 生成内容均符合版权合规要求，无侵权行为

## 联系方式

- 团队邮箱：[team@example.com](mailto:team@example.com)
- 项目仓库：<项目仓库地址>

***

**致谢**：感谢所有开源社区贡献者与指导教师的支持。