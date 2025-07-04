import { WebSock } from './network/WebSock';
import {director, Node} from "cc"
import { Entry } from "./entry/Entry";
import { EntryManager } from "./entry/EntryManager";
import { Logger } from "./log/Logger";
import { Query } from "./query/Query";
import { UIManager} from "./ui/UIManager";
import { Singleton } from "./utils/Singleton";
import { MessageManager } from "./message/MessageManager";
import { ResManager } from "./assets/ResManager";
import { AudioManager } from "./audio/AudioManager";
import { storage } from "./storage/StorageManager";
import { WebSocketManager } from './network/WebSocketManager';

export { AsyncQueue } from "../core/utils/AsyncQueue";
export type { NextFunction } from "../core/utils/AsyncQueue";
export {Entry} from "./entry/Entry"
export {LayerType} from "./ui/UIDefine"
export {registerEntry} from "./defines/Decorators"
export  * as i18n from "./utils/i18n/I18n"

export class Framework {
    /**@description 日志 */
    get logger() {
        return Singleton.get(Logger)!;
    }
    /**@description URL*/
    get query(){
        return Singleton.get(Query)!;
    }
    /**@description UI管理器*/
    get gui(){
        return Singleton.get(UIManager)!;
    }

    /**@description 入口管理器 */
    get entryManager() {
        return Singleton.get(EntryManager)!;
    }

    /**@description 消息管理器 */
    get message (){
        return Singleton.get(MessageManager)!;
    }

    /**@description 消息管理器 */
    get res (){
        return Singleton.get(ResManager)!;
    }

    /**@description 本地存储 */
    get storage(){
        return storage;
    }

    /**@description netWork */
    get webSocket(){
        return Singleton.get(WebSocketManager)!;
    }

    /** 游戏音乐管理 */
    audio: AudioManager;
    persist:Node = null;

    constructor(){
        //日志初始化
        this.logger.init();
    }

    public onLoad(node:Node){
        //UI管理初始
        this.gui.init(node);
        //入口管理器
        this.entryManager.init(node);

        // 创建持久根节点
        this.persist = new Node("PersistNode");
        director.addPersistRootNode(this.persist);
        // //创建音频模块
        this.audio = this.persist.addComponent(AudioManager);
        this.audio.load();
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