import { js, Node } from "cc";
import { DEBUG } from "cc/env";
import { BaseUI } from "../ui/base/BaseUI";
import { UIConfig } from "../ui/base/UIConfig";


export abstract class Entry {
    /**@description 子类可直接指定bundle 该值会设置到成员变量 bundle 上 */
    static bundle = "";
    gameViewType : typeof BaseUI = null!;
    /**@description 是否是主包入口，只能有一个主包入口 */
    isMain = false;
    /**@description 当前bundle名,由管理器指定 */
    bundle: string = "";

    /**@description 当前MainController所在节点 */
    protected node: Node = null!;

    /**@description 当胆入口是否已经运行中 */
    isRunning: boolean = false;

    /**@description UI配置 */
    config: { [key: string]: UIConfig } = {};
    /**@description 游戏ID */
    gameId:number = 0;
    /**@description 开始UI页面name */
    lunchUI:string = "";


    constructor() {
        
    }

    /**@description init之后触发,由管理器统一调度 */
    run(node: Node): void {
        this.node = node;
        this.isRunning = true;
    }

    onLoad(){
       
    }

    /**@description 场景销毁时触发,管理器统一调度 */
    onDestroy(): void {
        this.isRunning = false;
    }

    /**@description 管理器通知自己进入GameView */
    onEnter( userData?:EntryUserData): void {
        
    }

    /**@description 预加载资源 */
    protected onPreload(){

    }

}