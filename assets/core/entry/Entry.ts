
export abstract class Entry {
    constructor() {
        this.onLoad();
    }

    public abstract onLoad();

    /**@description 场景销毁时触发,管理器统一调度 */
    onDestroy(): void {
        
    }

}