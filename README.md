# 🎮 CocosHeronFramework 多子游戏框架

## 简介
- CocosHeronFramework 是专为多子游戏场景设计的 Cocos Creator 框架，支持公共资源与子 Bundle 分离管理，提供统一的 UI/资源/消息/音频等接口，助力高效、低耦合的游戏开发。
- 提供了多子游戏项目中最核心的全局能力，开发者只需通过 app 对象即可访问和管理日志、UI、入口、消息、资源、存储、网络、音频等所有核心功能，实现高效、解耦、模块化的多子游戏开发。
- 典型场景：棋牌、休闲、合集类、平台型等多子游戏项目，适用于需要 Bundle 分离、热更新、国际化、统一UI/资源/消息管理的团队。
- 适用人群：Cocos Creator 游戏开发者、技术美术、项目架构师、希望提升开发效率和项目可维护性的团队。

## 📚 目录
- [项目结构分析](#项目结构分析)
- [核心特性](#核心特性)
- [快速开始](#快速开始)
- [API参考](#api参考)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

---

## 项目结构分析

### 1. 根目录结构
```
assets/
├── script/        # 主项目脚本
├── resources/     # 公共资源
├── i18n/          # 国际化语言包
├── bundle/        # 子游戏Bundle
├── main.ts        # 主入口脚本
├── main.scene     # 主场景
└── scene.scene    # 其他场景
```

### 2. 主要目录说明
- **script/**：主项目脚本，含入口(AppEntry.ts)、公共加载(BaseLoading.ts)等
- **bundle/**：子游戏独立目录，每个子游戏有独立的脚本(gui/logic/model)、资源(res/gui)、入口(PdbEntry.ts)
- **i18n/**：多语言包，按语言(zh/en)和模块(main/pdb)分类
- **resources/**：公共UI、纹理、动画等资源

### 3. 架构特点
- **分层架构**：主项目层/子游戏层/框架层，职责清晰
- **Bundle分离**：主项目与子游戏资源、逻辑完全隔离，支持热更新
- **模块化设计**：入口(Entry)、数据(Model)、逻辑(Logic)、界面(GUI)分明
- **国际化支持**：多语言文本与资源，运行时可切换

### 4. 开发规范
- 目录/文件命名统一，按功能/模块分类
- 子游戏独立开发，公共功能放common目录
- 统一通过框架管理器(app对象)访问资源/消息/音频等

---

## Framework.ts 方法与用法详解

### 1. 全局 app 对象
框架初始化后自动挂载 `window.app`，开发者可全局访问核心能力。

### 2. 主要属性与方法
| 属性/方法      | 说明                     | 用法示例 |
| -------------- | ------------------------ | -------- |
| logger         | 日志管理                 | app.logger.info('日志') |
| query          | URL参数/查询             | app.query.get('key') |
| gui            | UI管理                   | app.gui.show('UIName') |
| entryManager   | 入口/子游戏管理          | app.entryManager.enter('game1') |
| message        | 全局消息事件             | app.message.emit('event', data) |
| res            | 资源加载与管理           | app.res.load('path/to/res') |
| storage        | 本地存储                 | app.storage.set('key', val) |
| webSocket      | WebSocket通信            | app.webSocket.send('msg') |
| audio          | 音频播放与管理           | app.audio.play('bgm') |
| changeLanguage | 切换全局语言             | app.changeLanguage('en') |

### 3. 典型用法
```typescript
// 日志输出
app.logger.info('游戏启动');
// 进入子游戏
app.entryManager.enter('pdb');
// 显示UI
app.gui.show('Alert', { message: '欢迎进入游戏' });
// 资源加载
app.res.load('bundleName/path/to/resource', (err, asset) => {
    if (!err) {
        // 使用asset
    }
});
// 发送全局消息
app.message.emit('gameStart', { level: 1 });
// 存储数据
app.storage.set('userToken', 'abc123');
// 播放音效
app.audio.play('click');
// 切换语言
app.changeLanguage('zh');
```

---

## 📋 目录

- [项目结构分析](#项目结构分析)
- [核心特性](#核心特性)
- [快速开始](#快速开始)
- [API参考](#api参考)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

# 项目结构分析

### Cocos Creator 项目目录结构说明

#### 1. 项目根目录结构
```
assets/
├── script/           # 主项目脚本目录
├── resources/        # 公共资源目录
├── i18n/            # 国际化语言包目录
├── bundle/          # 子游戏Bundle目录
├── main.ts          # 主项目入口脚本
├── main.scene       # 主场景文件
└── scene.scene      # 场景文件
```
---
#### 2. 详细目录说明
##### 2.1 script/ - 主项目脚本目录
```
script/
├── common/          # 公共脚本
│   └── loading/     # 加载相关脚本
│       └── BaseLoading.ts  # 加载基类
└── AppEntry.ts      # 主项目入口类
```
主要文件说明：
- AppEntry.ts: 主项目入口，继承自框架的Entry类，配置公共UI
- BaseLoading.ts: 加载基类，提供统一的资源加载流程和进度管理



##### 2.2 bundle/ - 子游戏Bundle目录
```
bundle/
└── pdb/            # PDB子游戏
    ├── script/     # 子游戏脚本
    │   ├── gui/    # UI脚本
    │   │   ├── PdbLoading.ts  # 加载UI
    │   │   └── PdbGame.ts     # 游戏主UI
    │   ├── logic/  # 逻辑脚本
    │   │   └── PdbLogic.ts    # 游戏逻辑
    │   ├── model/  # 数据模型
    │   │   ├── PdbModel.ts    # 游戏数据模型
    │   │   └── PdbDefine.ts   # 游戏常量定义
    │   └── PdbEntry.ts        # 子游戏入口
    ├── res/        # 子游戏资源
    └── gui/        # 子游戏UI预制体
```
子游戏结构说明：
- PdbEntry.ts: 子游戏入口，继承自框架的Entry类
- gui/: 包含子游戏的所有UI脚本和预制体
- logic/: 包含子游戏的业务逻辑处理
- model/: 包含子游戏的数据模型和常量定义

##### 2.3 i18n/ - 国际化目录
```
i18n/
├── zh/             # 中文语言包
│   ├── main/       # 主项目中文
│   │   ├── zh.ts   # 主项目中文文本
│   │   └── res/    # 主项目中文资源
│   └── pdb/        # PDB子游戏中文
│       └── res/    # PDB子游戏中文资源
└── en/             # 英文语言包
    ├── main/       # 主项目英文
    └── pdb/        # PDB子游戏英文
```
国际化说明：
- 按语言分类（zh/en）
- 按项目模块分类（main/pdb）
- 支持文本和资源的多语言切换
##### 2.4 resources/ - 公共资源目录
```
resources/
└── common/         # 公共组件和资源
    ├── prefab/     # 公共预制体
    │   ├── alert.prefab    # 通用弹窗
    │   └── confirm.prefab  # 通用确认框
    ├── texture/    # 公共纹理
    └── anim/       # 公共动画
```

---
### 3. 项目架构特点
#### 3.1 分层架构
- 主项目层: 负责公共资源、UI、框架初始化
- 子游戏层: 每个子游戏独立，包含专属资源、UI、逻辑
- 框架层: 提供统一的管理器和工具类
#### 3.2 Bundle分离
- 主项目使用 resources Bundle
- 子游戏使用独立的Bundle（如 pdb）
- 支持按需加载和热更新
#### 3.3 模块化设计
- Entry: 入口管理，负责初始化和配置
- Model: 数据模型，管理游戏数据
- Logic: 业务逻辑，处理游戏逻辑
- GUI: 界面层，处理UI交互
#### 3.4 国际化支持
- 支持多语言文本和资源
- 按模块和语言分类管理
- 运行时动态切换语言
### 4. 开发规范
#### 4.1 目录命名规范
- 使用小写字母和下划线
- 子游戏目录使用游戏标识符
- 脚本目录按功能分类（gui/logic/model）
#### 4.2 文件命名规范
- 类文件使用PascalCase（如PdbEntry.ts）
- 常量文件使用PascalCase（如PdbDefine.ts）
- 语言包文件使用小写（如zh.ts）
#### 4.3 代码组织规范
- 每个子游戏独立开发，避免相互依赖
- 公共功能放在common目录
- 使用框架提供的管理器统一管理资源
- 这个目录结构体现了多子游戏框架的设计理念，支持- 模块化开发、Bundle分离、国际化等特性。

---

## Framework.ts 方法与用法详解

## 核心特性
- 🌐 全局 app 对象，统一访问所有核心能力
- 🧩 多 Bundle/多子游戏独立开发与热切换
- 🗂️ 公共资源与子游戏资源分离管理
- 🏗️ 多层级 UI 管理与生命周期自动化
- 🔄 统一资源加载、缓存、释放机制
- 📢 全局消息事件系统，模块解耦
- 🎵 音频播放与管理，支持 Bundle 音频
- 🌍 国际化支持，运行时动态切换语言
- 🛠️ 支持 TypeScript，类型安全
- 🚀 易于扩展，适配多种业务场景

---

## 📋 目录

- [项目结构分析](#项目结构分析)
- [核心特性](#核心特性)
- [快速开始](#快速开始)
- [API参考](#api参考)
- [最佳实践](#最佳实践)
- [常见问题](#常见问题)

# 项目结构分析

### Cocos Creator 项目目录结构说明

#### 1. 项目根目录结构
```
assets/
├── script/           # 主项目脚本目录
├── resources/        # 公共资源目录
├── i18n/            # 国际化语言包目录
├── bundle/          # 子游戏Bundle目录
├── main.ts          # 主项目入口脚本
├── main.scene       # 主场景文件
└── scene.scene      # 场景文件
```
---
#### 2. 详细目录说明
##### 2.1 script/ - 主项目脚本目录
```
script/
├── common/          # 公共脚本
│   └── loading/     # 加载相关脚本
│       └── BaseLoading.ts  # 加载基类
└── AppEntry.ts      # 主项目入口类
```
主要文件说明：
- AppEntry.ts: 主项目入口，继承自框架的Entry类，配置公共UI
- BaseLoading.ts: 加载基类，提供统一的资源加载流程和进度管理



##### 2.2 bundle/ - 子游戏Bundle目录
```
bundle/
└── pdb/            # PDB子游戏
    ├── script/     # 子游戏脚本
    │   ├── gui/    # UI脚本
    │   │   ├── PdbLoading.ts  # 加载UI
    │   │   └── PdbGame.ts     # 游戏主UI
    │   ├── logic/  # 逻辑脚本
    │   │   └── PdbLogic.ts    # 游戏逻辑
    │   ├── model/  # 数据模型
    │   │   ├── PdbModel.ts    # 游戏数据模型
    │   │   └── PdbDefine.ts   # 游戏常量定义
    │   └── PdbEntry.ts        # 子游戏入口
    ├── res/        # 子游戏资源
    └── gui/        # 子游戏UI预制体
```
子游戏结构说明：
- PdbEntry.ts: 子游戏入口，继承自框架的Entry类
- gui/: 包含子游戏的所有UI脚本和预制体
- logic/: 包含子游戏的业务逻辑处理
- model/: 包含子游戏的数据模型和常量定义

##### 2.3 i18n/ - 国际化目录
```
i18n/
├── zh/             # 中文语言包
│   ├── main/       # 主项目中文
│   │   ├── zh.ts   # 主项目中文文本
│   │   └── res/    # 主项目中文资源
│   └── pdb/        # PDB子游戏中文
│       └── res/    # PDB子游戏中文资源
└── en/             # 英文语言包
    ├── main/       # 主项目英文
    └── pdb/        # PDB子游戏英文
```
国际化说明：
- 按语言分类（zh/en）
- 按项目模块分类（main/pdb）
- 支持文本和资源的多语言切换
##### 2.4 resources/ - 公共资源目录
```
resources/
└── common/         # 公共组件和资源
    ├── prefab/     # 公共预制体
    │   ├── alert.prefab    # 通用弹窗
    │   └── confirm.prefab  # 通用确认框
    ├── texture/    # 公共纹理
    └── anim/       # 公共动画
```

---
### 3. 项目架构特点
#### 3.1 分层架构
- 主项目层: 负责公共资源、UI、框架初始化
- 子游戏层: 每个子游戏独立，包含专属资源、UI、逻辑
- 框架层: 提供统一的管理器和工具类
#### 3.2 Bundle分离
- 主项目使用 resources Bundle
- 子游戏使用独立的Bundle（如 pdb）
- 支持按需加载和热更新
#### 3.3 模块化设计
- Entry: 入口管理，负责初始化和配置
- Model: 数据模型，管理游戏数据
- Logic: 业务逻辑，处理游戏逻辑
- GUI: 界面层，处理UI交互
#### 3.4 国际化支持
- 支持多语言文本和资源
- 按模块和语言分类管理
- 运行时动态切换语言
### 4. 开发规范
#### 4.1 目录命名规范
- 使用小写字母和下划线
- 子游戏目录使用游戏标识符
- 脚本目录按功能分类（gui/logic/model）
#### 4.2 文件命名规范
- 类文件使用PascalCase（如PdbEntry.ts）
- 常量文件使用PascalCase（如PdbDefine.ts）
- 语言包文件使用小写（如zh.ts）
#### 4.3 代码组织规范
- 每个子游戏独立开发，避免相互依赖
- 公共功能放在common目录
- 使用框架提供的管理器统一管理资源
- 这个目录结构体现了多子游戏框架的设计理念，支持- 模块化开发、Bundle分离、国际化等特性。

---

# 快速开始

- 执行目录下framework-init.bat文件，拉取框架
具体使用请查看示例工程项目模板使用情况