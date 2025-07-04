
/**
 * @description 单列接口类
 */
declare interface ISingleton {
	/**@description 初始化 */
	init?(...args: any[]): any;
	/**@description 销毁(单列销毁时调用) */
	destory?(...args: any[]): any;
	/**@description 清理数据 */
	clear?(...args: any[]): any;
	/**@description 是否常驻，即创建后不会删除 */
	isResident?: boolean;
	/**@description 不用自己设置，由单列管理器赋值 */
	module: string;
	/**输出调试信息 */
	debug?(...args: any[]): void;
}

declare interface ModuleClass<T> {
	new(...args: any): T;
	/**@description 模块名 */
	module: string;
}
/**@description 单列类型限制 */
declare interface SingletonClass<T> extends ModuleClass<T> {
	instance?: T;
}

declare interface EntryClass<T> {
	new(): T;
	/**@description 当前bundle名 */
	bundle: string;
}


/**@description 入口用户数据 */
interface EntryUserData{
	[key:string] : any;
	/**@description 是否是预加载资源,并不会进入bundle */
	isPreload ?: boolean;
	/**@description 是否附加在当前 bundle 运行*/
	isAttach ?: boolean;
	/**@description 是否切换显示方向*/
	changeOrientation ?: boolean;
}

declare type BUNDLE_TYPE = string | import("cc").AssetManager.Bundle;