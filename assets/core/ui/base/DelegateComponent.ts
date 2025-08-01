
import { Component, Node, _decorator } from "cc";
import { ViewParams } from "../UIDefine";
import { resLoader } from "../../assets/ResLoader";

const { ccclass } = _decorator;

const EventOnAdded: string = "onAdded";
const EventOnBeforeRemove: string = "onBeforeRemove";
const EventOnRemoved: string = "onRemoved";

/** 窗口事件触发组件 */
@ccclass('DelegateComponent')
export class DelegateComponent extends Component {
    /** 视图参数 */
    vp: ViewParams = null!;
    /** 界面关闭回调 - 包括关闭动画播放完（辅助框架内存业务流程使用） */
    onCloseWindow: Function = null!;

    /** 窗口添加 */
    add(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            // 触发窗口组件上添加到父节点后的事件
            for (let i = 0; i < this.node.components.length; i++) {
                const component: any = this.node.components[i];
                const func = component[EventOnAdded];
                if (func) {
                    if (await func.call(component, this.vp.params) == false) {
                        resolve(false);
                        return;
                    }
                }
            }

            // 触发外部窗口显示前的事件（辅助实现自定义动画逻辑）
            if (typeof this.vp.callbacks.onAdded === "function") {
                this.vp.callbacks.onAdded(this.node, this.vp.params);
            }

            resolve(true);
        });
    }

    /** 删除节点，该方法只能调用一次，将会触发onBeforeRemoved回调 */
    remove(isDestroy?: boolean) {
        if (this.vp.valid) {
            // 触发窗口移除舞台之前事件
            this.applyComponentsFunction(this.node, EventOnBeforeRemove, this.vp.params);

            //  通知外部对象窗口组件上移除之前的事件（关闭窗口前的关闭动画处理）
            if (typeof this.vp.callbacks.onBeforeRemove === "function") {
                this.vp.callbacks.onBeforeRemove(
                    this.node,
                    this.onBeforeRemoveNext.bind(this, isDestroy));
            }
            else {
                this.removed(this.vp, isDestroy);
            }
        }
        else {
            this.removed(this.vp, isDestroy);
        }
    }

    /** 窗口关闭前动画处理完后的回调方法，主要用于释放资源 */
    private onBeforeRemoveNext(isDestroy?: boolean) {
        this.removed(this.vp, isDestroy);
    }

    /** 窗口组件中触发移除事件与释放窗口对象 */
    private removed(vp: ViewParams, isDestroy?: boolean) {
        vp.valid = false;

        if (vp.callbacks && typeof vp.callbacks.onRemoved === "function") {
            vp.callbacks.onRemoved(this.node, vp.params);
        }

        // 界面移除舞台事件
        this.onCloseWindow && this.onCloseWindow(vp);

        if (isDestroy) {
            // 释放界面显示对象
            this.node.destroy();

            // 释放界面相关资源
            resLoader.release(vp.config.prefab, vp.config.bundle);

            // 释放自动递增编号的界面配置
            if (vp.config.auto) {
                app.gui.setConfig(vp.uiid, null!);
            }

            console.log(`【界面管理】释放【${vp.config.prefab}】界面资源`);
        }
        else {
            this.node.removeFromParent();
        }

        // 触发窗口组件上窗口移除之后的事件
        this.applyComponentsFunction(this.node, EventOnRemoved, this.vp.params);
    }

    onDestroy() {
        this.vp = null!;
    }

    protected applyComponentsFunction(node: Node, funName: string, params: any) {
        for (let i = 0; i < node.components.length; i++) {
            const component: any = node.components[i];
            const func = component[funName];
            if (func) {
                func.call(component, params);
            }
        }
    }
}