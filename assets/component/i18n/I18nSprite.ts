

import { _decorator, Component, SpriteFrame, Sprite, assetManager, Texture2D, CCString, AssetManager } from 'cc';
import { I18nUrils } from '../../core/utils/i18n/I18nUtils';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode,menu} = _decorator;


@ccclass('I18nSprite')
@executeInEditMode
@menu('Framework/i18n/I18nSprite （多语言图）')
export class I18nSprite extends Component {
    @property({
        type: SpriteFrame,
        visible: false
    })
    private _spriteFrame: SpriteFrame | null = null;

    @property({
        type: SpriteFrame,
        visible: function(this: I18nSprite) {
            return EDITOR;
        }
    })
    get spriteFrame() {
        return this._spriteFrame;
    }
    
    set spriteFrame(value: SpriteFrame | null) {
        if (this._spriteFrame !== value) {
            this._spriteFrame = value;
            this.assetsInfoInit();
            // this.updateEditorSprite();
        }
    }

    @property({
        tooltip: "根路径",
        readonly: true
    })
    RootPath: string = "";

    @property({
        tooltip: "编辑器路径",
        readonly: true
    })
    EditorPath: string = "";

    @property({
        tooltip: "资源路径",
        readonly: true
    })
    path: string = "";

    @property({
        readonly: true
    })
    spriteName: string = "";



    sprite: Sprite | null = null;


    @property({visible:false})
    curUuid: string = '';



    onLoad() {
        this.fetchRender();
        // this.assetsInfoInit();
        //
        // if(this.cacheFrame && !this._spriteFrame){
        //     this._spriteFrame = this.cacheFrame;
        // }
    }

    fetchRender () {
        let sprite = this.getComponent('cc.Sprite') as Sprite;
        if (sprite) {
            this.sprite = sprite;
            this.updateSprite();
            return;
        } 
    }



    /**
     * 初始资源信息
     */
    async assetsInfoInit() {
        if (EDITOR && this.spriteFrame) {
            let assetsInfo = await I18nUrils.getAssetsInfo(this.spriteFrame.uuid);
            this.RootPath = assetsInfo.rootPath;
            this.EditorPath = assetsInfo.editorPath;
            this.spriteName = assetsInfo.assetsName;
            this.path = assetsInfo.path;
            I18nUrils.queryUUID(assetsInfo.rootPath).then(uuid =>{ 
                this.loadAssets(uuid)
            });
        }
    }

    async updateSprite () {
        if(!EDITOR){
            const win = window as any;
            I18nUrils.loadAssetByBundle(win.i18n.language,this.path,(bundle:AssetManager.Bundle)=>{
                bundle.load(this.path, (err: Error | null, asset: SpriteFrame) => {
                    if (!err) {
                        this.sprite.spriteFrame = asset;
                    } else {
                        console.log("【I18nSprite】加载资源失败 path",this.path);
                    }
                });
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
                this.sprite.spriteFrame = null;
                // 如果是纹理，创建 SpriteFrame
                if (asset instanceof Texture2D) {
                    this.sprite.spriteFrame = new SpriteFrame();
                    this.sprite.spriteFrame.texture = asset;
                } else if (asset instanceof SpriteFrame) {
                    // 如果已经是 SpriteFrame
                    let frame = new SpriteFrame();
                    frame.texture = asset.texture;
                    this.sprite.spriteFrame = frame;
                }
            } else {
                console.error('【I18nSprite】加载资源失败 uuid', uuid);
            }
        });
    }
}
