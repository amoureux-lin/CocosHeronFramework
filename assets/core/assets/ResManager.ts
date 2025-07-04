import { load } from './../../../src/main';
import { Asset, assetManager, AssetManager, Component, SpriteFrame, Texture2D } from 'cc';
import { AssetType, CompleteCallback, Paths, ProgressCallback, resLoader } from './ResLoader';

const win = window as any;
export class ResManager  implements ISingleton{
    
    /** 单例实例 */
    public static readonly instance: ResManager = new ResManager();

    isResident?: boolean = true;
    static module: string = "【资源管理器】";
    module: string = null!;

    currentBundle:string = "";

    /**
     * 初始当前bundle
     * @param bundle bundle名
     */
    intBundel(bundle:string){
        this.currentBundle = bundle;
    }

    loadRes<T extends Asset>(paths: Paths, type: AssetType<T>, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadRes<T extends Asset>(paths: Paths, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadRes<T extends Asset>(paths: Paths, onComplete?: CompleteCallback): void;
    loadRes<T extends Asset>(paths: Paths, type: AssetType<T>, onComplete?: CompleteCallback): void;
    loadRes<T extends Asset>(
        paths?: Paths | AssetType<T> | ProgressCallback | CompleteCallback,
        type?: AssetType<T> | ProgressCallback | CompleteCallback,
        onProgress?: ProgressCallback | CompleteCallback,
        onComplete?: CompleteCallback,
    ) {
        resLoader.load(this.currentBundle,paths,type,onProgress,onComplete);
    }

    loadDir<T extends Asset>(dir: string, type: AssetType<T>, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadDir<T extends Asset>(dir: string, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadDir<T extends Asset>(dir: string, onComplete?: CompleteCallback): void;
    loadDir<T extends Asset>(dir: string, type: AssetType<T>, onComplete?: CompleteCallback): void;
    loadDir<T extends Asset>(
        dir?: string | AssetType<T> | ProgressCallback | CompleteCallback,
        type?: AssetType<T> | ProgressCallback | CompleteCallback,
        onProgress?: ProgressCallback | CompleteCallback,
        onComplete?: CompleteCallback,
    ) {
        resLoader.loadDir(this.currentBundle,dir,type,onProgress,onComplete)
    }

    loadBundleDir<T extends Asset>(bundleName: string, dir: string, type: AssetType<T>, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadBundleDir<T extends Asset>(bundleName: string, dir: string, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadBundleDir<T extends Asset>(bundleName: string, dir: string, onComplete?: CompleteCallback): void;
    loadBundleDir<T extends Asset>(bundleName: string, dir: string, type: AssetType<T>, onComplete?: CompleteCallback): void;
    loadBundleDir<T extends Asset>(dir: string, type: AssetType<T>, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadBundleDir<T extends Asset>(dir: string, onProgress: ProgressCallback, onComplete: CompleteCallback): void;
    loadBundleDir<T extends Asset>(dir: string, onComplete?: CompleteCallback): void;
    loadBundleDir<T extends Asset>(dir: string, type: AssetType<T>, onComplete?: CompleteCallback): void;
    loadBundleDir<T extends Asset>(
        bundleName:string,
        dir?: string | AssetType<T> | ProgressCallback | CompleteCallback,
        type?: AssetType<T> | ProgressCallback | CompleteCallback,
        onProgress?: ProgressCallback | CompleteCallback,
        onComplete?: CompleteCallback,
    ) {
        resLoader.loadDir(bundleName,dir,type,onProgress,onComplete)
    }

    // 加载resources 中公共common 资源
    loadCommonDir<T extends Asset>(
        dir?: string | AssetType<T> | ProgressCallback | CompleteCallback,
        type?: AssetType<T> | ProgressCallback | CompleteCallback,
        onProgress?: ProgressCallback | CompleteCallback,
        onComplete?: CompleteCallback,
    ){
        resLoader.loadDir(dir,type,onProgress,onComplete)
    }

    async loadBundle(bundleName:string){
        let bundle = assetManager.getBundle(bundleName);
        if(!bundle){
            return await resLoader.loadBundle(bundleName);
        }
        return bundle;
    }

    /**
     * 获取多语言资源
     * @param langName 
     * @param path 
     * @param type 
     * @returns 
     */
    getLanguageRes<T extends Asset>(langName: string,path: string, type?: any){
        let url = app.res.currentBundle+'/res/'+path;
        let hasFrame = path.includes('spriteFrame');
        let hasTexture = path.includes('texture');
        if(type == SpriteFrame && !hasFrame){
            url += '/spriteFrame'
        } else if(type == Texture2D && hasTexture){
            url += '/texture'
        }
        return resLoader.get(url,type,langName)
    }
}