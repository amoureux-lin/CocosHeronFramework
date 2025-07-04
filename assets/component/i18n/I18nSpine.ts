
import { _decorator, Component, SpriteFrame, Sprite, assetManager, Texture2D, CCString, AssetManager, sp } from 'cc';
import { I18nUrils } from '../../core/utils/i18n/I18nUtils';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;


@ccclass('I18nSpine')
@executeInEditMode
export class I18nSpine extends Component {
    @property({
        type: sp.SkeletonData,
        visible: false
    })
    private _skeletonData: sp.SkeletonData | null = null;

    @property({
        type: sp.SkeletonData,
        visible: function(this: I18nSpine) {
            return EDITOR;
        }
    })
    get skeletonData() {
        return this._skeletonData;
    }
    
    set skeletonData(value: sp.SkeletonData | null) {
        if (this._skeletonData !== value) {
            this._skeletonData = value;
            this.assetsInfoInit();
            // this.updateEditorSprite();
        }
    }

    @property({tooltip: "根路径",readonly: true})
    RootPath: string = "";

    @property({tooltip: "编辑器路径",readonly: true})
    EditorPath: string = "";

    @property({tooltip: "资源路径",readonly: true})
    path: string = "";

    @property({readonly: true})
    spriteName: string = "";



    spine: sp.Skeleton | null = null;


    @property({visible:false})
    curUuid: string = '';



    onLoad() {
        this.fetchRender();
        // this.assetsInfoInit();
      
    }

    fetchRender () {
        let spine = this.getComponent(sp.Skeleton);
        if (spine) {
            this.spine = spine;
            this.updateSpine();
            return;
        } 
    }



    /**
     * 初始资源信息
     */
    async assetsInfoInit() {
        if (EDITOR && this.skeletonData) {
            let assetsInfo = await I18nUrils.getAssetsInfo(this.skeletonData.uuid);
            this.RootPath = assetsInfo.rootPath;
            this.EditorPath = assetsInfo.editorPath;
            this.spriteName = assetsInfo.assetsName;
            this.path = assetsInfo.path;
            I18nUrils.queryUUID(assetsInfo.rootPath).then(uuid =>{ 
                this.loadAssets(uuid)
            });
        }
    }

    async updateSpine () {
        if(!EDITOR){
            const win = window as any;
            assetManager.loadBundle(win.i18n.language, (err: Error | null, bundle: AssetManager.Bundle) => {
                if (!err) {
                    bundle.load(this.path,sp.SkeletonData, (err: Error | null, asset: sp.SkeletonData) => {
                        if (!err) {
                            this.spine.skeletonData = asset;
                        } else {
                            console.log("【I18nSpine】加载资源失败 path",this.path);
                        }
                    });
                }
            });
        } else {
            await this.assetsInfoInit();
        }
    }


    //-------------------------------------

    // UUID 转spriteFrame
    loadAssets(uuid){
        assetManager.loadAny(uuid, (err: Error | null, asset: any) => {
            if (!err) {
                let Skeleton = new sp.SkeletonData();
                Skeleton = asset;
                this.spine.skeletonData = Skeleton;
            } else {
                console.error('【I18nSpine】加载资源失败 uuid:', uuid);
            }
        });
    }
}
