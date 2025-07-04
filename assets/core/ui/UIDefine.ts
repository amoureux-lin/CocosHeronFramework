
import { Node } from "cc";
import { UIConfig } from "./base/UIConfig";

/*** 界面回调参数对象定义 */
export interface UICallbacks {
    /**
     * 节点添加到层级以后的回调
     * @param node   当前界面节点
     * @param params 外部传递参数
     */
    onAdded?: (node: Node, params: any) => void,

    /**
     * 窗口节点 destroy 之后回调
     * @param node   当前界面节点
     * @param params 外部传递参数
     */
    onRemoved?: (node: Node | null, params: any) => void,

    /** 
     * 如果指定onBeforeRemoved，则next必须调用，否则节点不会被正常删除。
     * 
     * 比如希望节点做一个FadeOut然后删除，则可以在`onBeforeRemoved`当中播放action动画，动画结束后调用next
     * @param node   当前界面节点
     * @param next   回调方法
     */
    onBeforeRemove?: (node: Node, next: Function) => void,

    /** 网络异常时，窗口加载失败回调 */
    onLoadFailure?: () => void;
}

/** 本类型仅供gui模块内部使用，请勿在功能逻辑中使用 */
export class ViewParams {
    /** 界面唯一编号 */
    uiName: string = "";
    /** 界面配置 */
    config: UIConfig = null!;
    /** 传递给打开界面的参数 */
    params: any = null!;
    /** 窗口事件 */
    callbacks: UICallbacks = null!;
    /** 是否在使用状态 */
    valid: boolean = true;
    /** 界面根节点 */
    node: Node = null!;
}
/** 界面层类型 */
export enum LayerType {
    /** 二维游戏层 */
    Game = "LayerGame",
    /** 主界面层 */
    UI = "LayerUI",
    /** 弹窗层 */
    PopUp = "LayerPopUp",
    /** 模式窗口层 */
    Dialog = "LayerDialog",
    /** 系统触发模式窗口层 */
    System = "LayerSystem",
    /** 消息提示层 */
    Notify = "LayerNotify",
    /** 新手引导层 */
    Guide = "LayerGuide",
    /** 新手引导层 */
    TopUI = "LayerUI"
}

/** 界面层组件类型 */
export enum LayerTypeCls {
    /** 主界面层 */
    UI = "UI",
    /** 弹窗层 */
    PopUp = "PopUp",
    /** 模式窗口层 */
    Dialog = "Dialog",
    /** 消息提示层 */
    Notify = "Notify",
    /** 自定义节点层 */
    Node = "Node",
    /** 顶界面层 */
    TopUI = "UI",
}

export const LayerList = [
    {"name": "LayerGame","type": "Node"},
    {"name": "LayerUI","type": "UI"},
    {"name": "LayerPopUp","type": "PopUp"},
    {"name": "LayerDialog","type": "Dialog"},
    {"name": "LayerSystem","type": "Dialog"},
    {"name": "LayerNotify","type": "Notify"},
    {"name": "LayerGuide","type": "Node"},
    {"name": "LayerUI","type": "UI"}
]

export enum PromptResType {
    /** 飘动提示 */
    Toast = 'common/prefab/notify',
    /** 延迟等待提示 */
    Wait = 'common/prefab/wait',
    /** 遮罩层 */
    Mask = 'common/prefab/mask',
}