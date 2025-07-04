# 多子游戏框架 (Multi-Game Framework)

一个专为多子游戏设计的Cocos Creator框架，支持公共资源和子Bundle分离管理，提供统一的UI调用接口。

## 🚀 核心特性

### Bundle架构

- **公共Bundle**: 包含公共弹窗、加载UI、设置等共享资源
- **子Bundle**: 每个子游戏独立的Bundle，包含专属UI、场景、音频
- **分层初始化**: 先初始化公共Bundle，再初始化子Bundle
- **统一调用**: 所有UI都通过统一的 `showUI`方法调用

### 核心管理器

- **BundleManager**: Bundle生命周期管理
- **ResourceManager**: 资源加载和缓存管理
- **UIManager**: 多层级UI管理
- **EventManager**: 事件系统管理
- **SceneManager**: 场景切换管理
- **AudioManager**: 音频播放管理

### UI系统

- **多层级支持**: LOADING、TOAST、UI、POPUP、TOP层级
- **生命周期管理**: 自动管理UI的创建、显示、隐藏、销毁
- **动画支持**: 内置显示/隐藏动画
- **模态支持**: 支持模态弹窗，自动处理背景遮罩

## 📦 安装

1. 将框架文件复制到你的Cocos Creator项目中
2. 在项目设置中启用TypeScript支持
3. 确保所有依赖文件都在正确的位置

## 🎯 快速开始

### 1. 初始化框架

```typescript
import { Framework, FrameworkConfig } from "./assets/core/Framework";
import { BundleConfig } from "./assets/core/BundleManager";

// 创建框架配置
const config: FrameworkConfig = {
    debug: true,
    publicBundle: "public",
    bundleConfigs: [
        // 公共Bundle配置
        {
            name: "public",
            isPublic: true,
            entryFile: "scripts/PublicBundleEntry",
            uiConfigs: [
                {
                    name: "LoadingUI",
                    bundleName: "public",
                    prefabPath: "prefabs/LoadingUI",
                    layer: UILayer.LOADING,
                    showType: UIShowType.LOADING,
                    isSingleton: true
                },
                {
                    name: "ToastUI",
                    bundleName: "public",
                    prefabPath: "prefabs/ToastUI",
                    layer: UILayer.TOAST,
                    showType: UIShowType.TOAST,
                    isSingleton: true
                }
            ]
        },
        // 子游戏Bundle配置
        {
            name: "game1",
            isPublic: false,
            dependencies: ["public"],
            entryFile: "scripts/Game1BundleEntry",
            uiConfigs: [
                {
                    name: "Game1MainUI",
                    bundleName: "game1",
                    prefabPath: "prefabs/Game1MainUI",
                    layer: UILayer.UI,
                    showType: UIShowType.NORMAL,
                    isSingleton: true
                }
            ]
        }
    ]
};

// 初始化框架
const canvas = find("Canvas")?.getComponent(Canvas);
await Framework.instance.init(canvas, config);
```

### 2. 创建Bundle入口文件

#### 公共Bundle入口 (PublicBundleEntry.ts)

```typescript
import { Canvas } from "cc";
import { BundleEntry, BundleEntryConfig } from "../BundleEntry";

export class PublicBundleEntry extends BundleEntry {
    constructor(canvas: Canvas) {
        const config: BundleEntryConfig = {
            name: "PublicBundle",
            bundleName: "public",
            canvas: canvas,
            uiConfigs: [
                // UI配置...
            ],
            audioConfigs: [
                // 音频配置...
            ]
        };
        super(config);
    }

    protected async onInit(): Promise<void> {
        // 初始化公共资源
        await this.preloadPublicResources();
        await Framework.audio.playMusic("bgm_main");
    }

    protected async onDestroy(): Promise<void> {
        // 清理公共资源
        Framework.audio.clearAllAudios();
    }

    // 公共方法
    public async showLoading(message: string): Promise<void> {
        await this.showUI("LoadingUI", { data: { message } });
    }

    public async showToast(message: string): Promise<void> {
        await this.showUI("ToastUI", { data: { message } });
    }
}
```

#### 子游戏Bundle入口 (Game1BundleEntry.ts)

```typescript
import { Canvas } from "cc";
import { BundleEntry, BundleEntryConfig } from "../BundleEntry";

export class Game1BundleEntry extends BundleEntry {
    constructor(canvas: Canvas) {
        const config: BundleEntryConfig = {
            name: "Game1Bundle",
            bundleName: "game1",
            canvas: canvas,
            uiConfigs: [
                // 游戏1的UI配置...
            ],
            sceneConfigs: [
                // 游戏1的场景配置...
            ],
            audioConfigs: [
                // 游戏1的音频配置...
            ]
        };
        super(config);
    }

    protected async onInit(): Promise<void> {
        // 初始化游戏1资源
        await this.preloadGame1Resources();
        await Framework.scene.loadScene("Game1Scene");
        await Framework.audio.playMusic("bgm_game1");
    }

    protected async onDestroy(): Promise<void> {
        // 清理游戏1资源
        Framework.audio.stopMusic();
        await Framework.scene.loadScene("");
    }

    // 游戏1特定方法
    public async startGame1(level: number): Promise<void> {
        await this.showUI("Game1MainUI", {
            data: { level, score: 0 },
            animation: true
        });
    }
}
```

### 3. 使用框架

```typescript
// 进入子游戏
await Framework.instance.enterBundle("game1");

// 显示UI（会自动在公共Bundle和当前Bundle中查找）
await Framework.instance.showUI("LoadingUI", {
    data: { message: "加载中..." }
});

await Framework.instance.showUI("Game1MainUI", {
    data: { level: 1, score: 0 },
    animation: true
});

// 显示公共弹窗
await Framework.instance.showUI("SettingsDialog", {
    data: { musicVolume: 0.8 },
    modal: true
});

// 退出子游戏
await Framework.instance.exitCurrentBundle();
```

## 📚 API参考

### Framework

#### 初始化

```typescript
Framework.instance.init(canvas: Canvas, config: FrameworkConfig): Promise<void>
```

#### Bundle管理

```typescript
Framework.instance.enterBundle(bundleName: string): Promise<void>
Framework.instance.exitCurrentBundle(): Promise<void>
```

#### UI操作

```typescript
Framework.instance.showUI(uiName: string, options?: any): Promise<any>
Framework.instance.hideUI(uiName: string): Promise<void>
Framework.instance.getUI(uiName: string): any
```

### BundleManager

```typescript
// 注册Bundle配置
BundleManager.instance.registerBundle(bundleConfig: BundleConfig): void

// 设置公共Bundle
BundleManager.instance.setPublicBundle(bundleName: string): void

// 初始化
BundleManager.instance.init(): Promise<void>

// Bundle操作
BundleManager.instance.enterBundle(bundleName: string): Promise<void>
BundleManager.instance.exitCurrentBundle(): Promise<void>

// UI操作（统一入口）
BundleManager.instance.showUI(uiName: string, options?: any): Promise<any>
BundleManager.instance.hideUI(uiName: string): Promise<void>
BundleManager.instance.getUI(uiName: string): any
```

### BundleEntry

```typescript
// 抽象基类，子类需要实现
abstract class BundleEntry {
    abstract onInit(): Promise<void>;
    abstract onDestroy(): Promise<void>;
  
    // UI操作
    showUI(uiName: string, options?: any): Promise<any>
    hideUI(uiName: string): Promise<void>
    getUI(uiName: string): any
    isUIVisible(uiName: string): boolean
}
```

## ⚙️ 配置说明

### BundleConfig

```typescript
interface BundleConfig {
    name: string;                    // Bundle名称
    isPublic?: boolean;              // 是否为公共Bundle
    isPreload?: boolean;             // 是否预加载
    dependencies?: string[];         // 依赖的其他Bundle
    entryFile?: string;              // 入口文件路径
    uiConfigs?: UIBaseData[];        // UI配置
    sceneConfigs?: SceneData[];      // 场景配置
    audioConfigs?: AudioConfig[];    // 音频配置
}
```

### UIBaseData

```typescript
interface UIBaseData {
    name: string;                    // UI名称
    bundleName: string;              // 所属Bundle
    prefabPath: string;              // 预制体路径
    layer: UILayer;                  // UI层级
    showType: UIShowType;            // 显示类型
    isSingleton?: boolean;           // 是否单例
    isDestroyOnClose?: boolean;      // 关闭时是否销毁
    isModal?: boolean;               // 是否模态
    modalAlpha?: number;             // 模态背景透明度
}
```

## 🎮 使用示例

### 完整的游戏流程

```typescript
class GameController {
    async startGame() {
        // 1. 初始化框架
        await Framework.instance.init(canvas, config);
      
        // 2. 显示加载UI
        await Framework.instance.showUI("LoadingUI", {
            data: { message: "正在初始化..." }
        });
      
        // 3. 进入游戏1
        await Framework.instance.enterBundle("game1");
      
        // 4. 开始游戏
        await Framework.instance.showUI("Game1MainUI", {
            data: { level: 1, score: 0 }
        });
      
        // 5. 隐藏加载UI
        await Framework.instance.hideUI("LoadingUI");
    }
  
    async showSettings() {
        // 显示设置对话框（公共UI）
        await Framework.instance.showUI("SettingsDialog", {
            data: { musicVolume: 0.8 },
            modal: true
        });
    }
  
    async exitGame() {
        // 退出当前游戏
        await Framework.instance.exitCurrentBundle();
      
        // 返回主菜单
        await Framework.instance.showUI("MainMenu");
    }
}
```

## 🔧 最佳实践

### 1. Bundle设计原则

- **公共Bundle**: 只包含真正需要共享的资源
- **子Bundle**: 每个子游戏独立，避免相互依赖
- **依赖管理**: 明确Bundle间的依赖关系

### 2. UI设计原则

- **层级清晰**: 合理使用UI层级
- **生命周期**: 正确管理UI的生命周期
- **性能优化**: 及时销毁不需要的UI

### 3. 资源管理

- **预加载**: 合理预加载关键资源
- **缓存策略**: 根据使用频率决定缓存策略
- **内存管理**: 及时释放不需要的资源

### 4. 错误处理

- **异常捕获**: 所有异步操作都要有错误处理
- **降级策略**: 提供资源加载失败时的降级方案
- **用户反馈**: 给用户明确的加载状态反馈

## 🐛 常见问题

### Q: 如何添加新的子游戏？

A: 1. 创建新的Bundle配置
   2. 创建对应的Bundle入口文件
   3. 在框架配置中注册新的Bundle

### Q: 如何自定义UI动画？

A: 在UI预制体中实现动画逻辑，框架会自动调用

### Q: 如何处理Bundle加载失败？

A: 框架会自动重试，你也可以监听相关事件进行自定义处理

### Q: 如何优化加载性能？

A: 1. 合理使用预加载
   2. 压缩资源文件
   3. 使用CDN加速

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📞 支持

如有问题，请通过以下方式联系：

- 提交Issue
- 发送邮件
- 加入讨论群
