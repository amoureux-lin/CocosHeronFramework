import { Camera, Canvas, Layers, Node, Widget} from "cc";
import { LayerList, LayerType, LayerTypeCls, UICallbacks } from "./UIDefine";
import { LayerUI } from "./base/LayerUI";
import { LayerNotify } from "./base/LayerNotify";
import { UIConfig } from "./base/UIConfig";
import { DelegateComponent } from "./base/DelegateComponent";
import { LayerPopUp } from "./base/LayerPopup";
import { LayerDialog } from "./base/LayerDialog";


export class UIManager{
    /** 单例实例 */
    public static readonly instance: UIManager = new UIManager();

    /** 界面根节点 */
    root!: Node;
    /** 界面摄像机 */
    camera!: Camera;
    /** 游戏界面特效层 */
    game!: Node;
    /** 新手引导层 */
    guide!: Node;

    /** 窗口宽高比例 */
    windowAspectRatio: number = 0;
    /** 设计宽高比例 */
    designAspectRatio: number = 0;
    /** 是否开启移动设备安全区域适配 */
    mobileSafeArea: boolean = false;

    /** 消息提示控制器，请使用show方法来显示 */
    private notify!: LayerNotify;
    /** UI配置 */
    private configs: { [key: number]: UIConfig } = {};
    /** 界面层集合 - 无自定义类型 */
    private uiLayers: Map<string, LayerUI> = new Map();
    /** 界面层组件集合 */
    private clsLayers: Map<string, any> = new Map();

    constructor() {
        this.clsLayers.set(LayerTypeCls.UI, LayerUI);
        this.clsLayers.set(LayerTypeCls.PopUp, LayerPopUp);
        this.clsLayers.set(LayerTypeCls.Dialog, LayerDialog);
        this.clsLayers.set(LayerTypeCls.Notify, LayerNotify);
        this.clsLayers.set(LayerTypeCls.Node, Node);
    }

    /**
     * 初始化UI管理器
     */
    public init(root: Node) {
        if(root){
            console.log("初始化UI管理器",root);
            this.root = root;
            this.camera = root.getComponentInChildren(Camera)!;
            this.createLayer();
        }
    }

    /**
     * 注册自定义界面层对象
     * @param type  自定义界面层类型
     * @param cls   自定义界面层对象
     */
    registerLayerCls(type: string, cls: any) {
        if (this.clsLayers.has(type)) {
            console.error("已存在自定义界面层类型", type);
            return;
        }
        this.clsLayers.set(type, cls);
    }

    private createLayer(){
        // 创建界面层
        for (let i = 0; i < LayerList.length; i++) {
            let data = LayerList[i];
            let layer: Node = null!;
            if (data.type == LayerTypeCls.Node) {
                layer = this.create_node(data.name);
                switch (data.name) {
                    case LayerType.Game:
                        
                        break
                    case LayerType.Guide:
                        
                        break
                }
            }
            else {
                let cls = this.clsLayers.get(data.type);
                if (cls) {
                    layer = new cls(data.name);
                }
                else {
                    console.error("未识别的界面层类型", data.type);
                }
            }
            this.root.addChild(layer);
            if (layer instanceof LayerUI)
                this.uiLayers.set(data.name, layer);
            else if (layer instanceof LayerNotify)
                this.notify = layer;
        }
    }

    /**
     * 初始化所有UI的配置对象
     * @param configs 配置对象
     */
    initConfig(configs: { [key: number]: UIConfig }): void {
        this.configs = configs;
    }

    addConfig(configs: { [key: number]: UIConfig }){
        this.configs = {...this.configs,...configs};
        console.log(this.configs);
        
    }

    /**
     * 设置窗口打开失败回调
     * @param callback  回调方法
     */
    setOpenFailure(callback: Function) {
        this.uiLayers.forEach((layer: LayerUI) => {
            layer.onOpenFailure = callback;
        })
    }

    /**
     * 渐隐飘过提示
     * @param content 文本表示
     * @param useI18n 是否使用多语言
     * @example 
     * app.gui.toast("提示内容");
     */
    toast(content: string, useI18n: boolean = false) {

        this.notify.toast(content, useI18n)
    }

    /** 打开等待提示 */
    waitOpen() {
        this.notify.waitOpen();
    }

    /** 关闭等待提示 */
    waitClose() {
        this.notify.waitClose();
    }

    /**
     * 设置界面配置
     * @param uiName   要设置的界面id
     * @param config 要设置的配置
     */
    setConfig(uiName: string, config: UIConfig): void {
        if (config)
            this.configs[uiName] = config;
        else
            delete this.configs[uiName];
    }

    /**
     * 同步打开一个窗口
     * @param uiName          窗口唯一编号
     * @param uiArgs        窗口参数
     * @param callbacks     回调对象
     * @example
    var uic: UICallbacks = {
        onAdded: (node: Node, params: any) => {
            var comp = node.getComponent(LoadingViewComp) as ecs.Comp;
        }
        onRemoved:(node: Node | null, params: any) => {
                    
        }
    };
    app.gui.open(UIID.Loading, null, uic);
     */
    open(uiName: string, uiArgs: any = null, callbacks?: UICallbacks): void {
        const config = this.configs[uiName];
        if (!config) {
            console.warn(`打开【${uiName}】失败，配置信息不存在`);
            return;
        }

        let layer = this.uiLayers.get(config.layer);
        if (layer) {
            layer.add(uiName, config, uiArgs, callbacks);
        }
        else {
            console.error(`打开【${uiName}】失败，界面层不存在`);
        }
    }

    /**
     * 异步打开一个窗口
     * @param uiName          窗口唯一编号
     * @param uiArgs        窗口参数
     * @example 
     * var node = await app.gui.openAsync(UIID.Loading);
     */
    async openAsync(uiName: string, uiArgs: any = null): Promise<Node | null> {
        return new Promise<Node | null>((resolve, reject) => {
            const callbacks: UICallbacks = {
                onAdded: (node: Node, params: any) => {
                    resolve(node);
                },
                onLoadFailure: () => {
                    resolve(null);
                }
            };
            this.open(uiName, uiArgs, callbacks);
        });
    }


    /**
     * 场景替换
     * @param removeUiId  移除场景编号
     * @param openUiId    新打开场景编号
     * @param uiArgs      新打开场景参数
     */
    replace(removeUiName: string, openUiName: string, uiArgs: any = null) {
        const callbacks: UICallbacks = {
            onAdded: (node: Node, params: any) => {
                this.remove(removeUiName);
            }
        };
        this.open(openUiName, uiArgs, callbacks);

    }

    /**
     * 异步场景替换
     * @param removeUiId  移除场景编号
     * @param openUiId    新打开场景编号
     * @param uiArgs      新打开场景参数
     */
    replaceAsync(removeUiName: string, openUiName: string, uiArgs: any = null): Promise<Node | null> {
        return new Promise<Node | null>(async (resolve, reject) => {
            const node = await this.openAsync(openUiName, uiArgs);
            if (node) {
                this.remove(removeUiName);
                resolve(node);
            }
            else {
                resolve(null);
            }
        });
    }

    /**
     * 缓存中是否存在指定标识的窗口
     * @param uiName 窗口唯一标识
     * @example
     * app.gui.has(UIID.Loading);
     */
    has(uiName: string): boolean {
        const config = this.configs[uiName];
        if (config == null) {
            console.warn(`编号为【${uiName}】的界面配置不存在，配置信息不存在`);
            return false;
        }

        var result = false;
        let layer = this.uiLayers.get(config.layer);
        if (layer) {
            result = layer.has(config.prefab);
        }
        else {
            console.error(`验证编号为【${uiName}】的界面失败，界面层不存在`);
        }

        return result;
    }

    /**
     * 缓存中是否存在指定标识的窗口
     * @param uiName 窗口唯一标识
     * @example
     * app.gui.has(UIID.Loading);
     */
    get(uiName: string): Node {
        const config = this.configs[uiName];
        if (config == null) {
            console.warn(`编号为【${uiName}】的界面配置不存在，配置信息不存在`);
            return null!;
        }

        let result: Node = null!;
        let layer = this.uiLayers.get(config.layer);
        if (layer) {
            result = layer.get(config.prefab);
        }
        else {
            console.error(`获取编号为【${uiName}】的界面失败，界面层不存在`);
        }
        return result;
    }

    /**
     * 移除指定标识的窗口
     * @param uiName         窗口唯一标识
     * @param isDestroy    移除后是否释放（默认释放内存）
     * @example
     * app.gui.remove(UIID.Loading);
     */
    remove(uiName: string, isDestroy: boolean = true) {
        const config = this.configs[uiName];
        if (config == null) {
            console.warn(`删除【${uiName}】失败，配置信息不存在`);
            return;
        }

        let layer = this.uiLayers.get(config.layer);
        if (layer) {
            layer.remove(config.prefab, isDestroy);
        }
        else {
            console.error(`移除【${uiName}】失败，界面层不存在`);
        }
    }

    /**
     * 通过界面节点移除
     * @param node          窗口节点
     * @param isDestroy     移除后是否释放资源（默认释放内存）
     * @example
     * app.gui.removeByNode(cc.Node);
     */
    removeByNode(node: Node, isDestroy: boolean = true) {
        if (node instanceof Node) {
            let comp = node.getComponent(DelegateComponent);
            if (comp && comp.vp) {
                // 释放显示的界面
                if (node.parent) {
                    this.remove(comp.vp.uiName, isDestroy);
                }
                // 释放缓存中的界面
                else if (isDestroy) {
                    let layer = this.uiLayers.get(comp.vp.config.layer);
                    if (layer) {
                        // @ts-ignore 注：不对外使用
                        layer.removeCache(comp.vp.config.prefab);
                    }
                }
            }
            else {
                console.warn(`当前删除的 Node 不是通过界面管理器添加`);
                node.destroy();
            }
        }
    }

    /**
     * 清除所有窗口
     * @param isDestroy 移除后是否释放
     * @example
     * app.gui.clear();
     */
    clear(isDestroy: boolean = false) {
        this.uiLayers.forEach((layer: LayerUI) => {
            layer.clear(isDestroy);
        })
    }

    private create_node(name: string) {
        const node = new Node(name);
        node.layer = Layers.Enum.UI_2D;
        const w: Widget = node.addComponent(Widget);
        w.isAlignLeft = w.isAlignRight = w.isAlignTop = w.isAlignBottom = true;
        w.left = w.right = w.top = w.bottom = 0;
        w.alignMode = 2;
        w.enabled = true;
        return node;
    }
}