import {director, Node} from "cc"
import { Logger } from "./log/Logger";
import { Query } from "./query/Query";
import { UIManager} from "./ui/UIManager";
import { MessageManager } from "./message/MessageManager";
import { ResManager } from "./assets/ResManager";
import { AudioComponent } from "./audio/AudioComponent";
import { StorageManager } from "./storage/StorageManager";
import { WebSocketManager } from './network/WebSocketManager';
import { TimerComponent } from './timer/TimerComponent';

export { AsyncQueue } from "../core/utils/AsyncQueue";
export type { NextFunction } from "../core/utils/AsyncQueue";
export {Entry} from "./entry/Entry"
export {LayerType} from "./ui/UIDefine"
export  * as i18n from "./utils/i18n/I18n"
export {EventMessage} from "./message/EventMessage";

export class Framework {

    /**@description 日志 */
    logger:Logger = Logger.instance;

    /**@description URL*/
    query:Query = Query.instance;

    /**@description UI管理器*/
    gui:UIManager = UIManager.instance;

    /**@description 消息管理器 */
    message:MessageManager = MessageManager.instance;

    /**@description 消息管理器 */
    res:ResManager = ResManager.instance;

    /**@description 本地存储 */
    storage:StorageManager = StorageManager.instance;

    /**@description netWork */
    webSocket:WebSocketManager = WebSocketManager.instance;

    /** 游戏时间管理 */
    timer: TimerComponent;
    /** 游戏音乐管理 */
    audio: AudioComponent;
    persist:Node = null;


    constructor(){
        //日志初始化
        this.logger.init();
    }

    public onLoad(node:Node){
        //UI管理初始
        this.gui.init(node);
        // 创建持久根节点
        this.persist = new Node("PersistNode");
        director.addPersistRootNode(this.persist);
        // //创建音频模块
        this.audio = this.persist.addComponent(AudioComponent);
        this.audio.load();
        //创建时间模块
        this.timer = this.persist.addComponent(TimerComponent)!;
    }

    /**
     * 切换语言
     */
    public changeLanguage(language: string): void {
        const win = window as any;
        if (win.changeLanguage) {
            win.changeLanguage(language);
        }
        console.log(`语言切换为: ${language}`);
    }


}

/** 全局 Window 接口 */
declare global {
    interface Window {
        app: Framework;
    }
    const app: Framework;
}
/** 创建 Core 类的实例并赋值给全局 window 对象 */
window.app = new Framework();
(window as any).console = console;