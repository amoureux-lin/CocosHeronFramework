/**
 * @description 装饰器定义
 */

import { BaseUI } from "../ui/base/BaseUI";

/**
 * @description bundle入口程序注册
 * @param className 入口类名
 * @param bundle bundle名
 * @param type GameView 类型
 * @returns 
 */
export function registerEntry(className: string, bundle: string) {
    return function (target: any) {
        if ( typeof app == "object" ){
            target["__classname__"] = className;
            target.bundle = bundle;
            app.entryManager.register(target);
        }else{
           
        }
    }
}
