import { assetManager, AssetManager, SpriteFrame } from "cc";
import * as i18n from './I18n';
export class I18nUrils{
    static async queryPath(urlOrUUID:string){
        return await Editor.Message.request('asset-db', 'query-path', urlOrUUID);
    }

    static async queryUrl(uuidOrPath:string){
        return await Editor.Message.request('asset-db', 'query-url', uuidOrPath);
    }

    static async queryAssetInfo(uuidOrPath:string){
        return await Editor.Message.request('asset-db', 'query-asset-info', uuidOrPath);
    }

    static async queryUUID(url:string){
        return await Editor.Message.request('asset-db', 'query-uuid', url);
    }

    static getBundle(bundleName:string){
        let bundle = assetManager.getBundle(bundleName);
        return bundle;
    }

    static loadAssetByBundle(bundleName:string,path:string,callback:Function){
        let bundle = this.getBundle(bundleName);
        if(bundle){
            callback(bundle);
        } else {
            assetManager.loadBundle(bundleName, (err: Error | null, bundle: AssetManager.Bundle) => {
                if (!err) {
                    callback(bundle);
                } else {
                    console.error(`${bundleName} bundle load failed`);
                }
            });
        }
       
    }

    static async getAssetsInfo(uuid){
        let info = await this.queryAssetInfo(uuid);
        let infoPath = info.path;
        let url = info.url;
        let pathArr = url.split("/");
        let infoPathArr = infoPath.split("/");
        const win = window as any;
        pathArr[4] = win.i18n.language; // 替换语言目录
        let tempEditorPath = "";
        let tempRootPath = "";
        let path = "";
        //图名
        let assetsName = pathArr[pathArr.length - 2];
        for(let i = 0; i < pathArr.length - 1; i++){
            if(tempEditorPath == "") {
                tempEditorPath += pathArr[i];
            }else {
                tempEditorPath += "/" + pathArr[i];
            }
        }

        for(let i = 0; i < pathArr.length; i++){
            if(tempRootPath == "") {
                tempRootPath += pathArr[i];
            }else {
                tempRootPath += "/" + pathArr[i];
            }
        }

        for(let i = 5; i < infoPathArr.length; i++){
            if(path == "") {
                path += infoPathArr[i];
            }else {
                path += "/" + infoPathArr[i];
            }
        }
        
        return {
            assetsName,
            editorPath:tempEditorPath,
            rootPath:tempRootPath,
            path:path
        }
    }

}