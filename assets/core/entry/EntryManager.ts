import { AssetManager, Node, game } from "cc";
import { DEBUG } from "cc/env";
import { Entry } from "./Entry";

/**@description 入口管理 */
export class EntryManager implements ISingleton{
    static module: string = "【入口管理器】";
    module: string = null!;
    isResident?: boolean  = true;
    private entrysMap: Map<string, Entry> = new Map();

    private node: Node | null = null;

    private mianEntry:Entry = null;

    /**@description 注册入口 */
    register(entryClass: EntryClass<Entry>) {
        let entry = this.getEntry(entryClass.bundle);
        if (entry) {
            this.entrysMap.delete(entryClass.bundle);
        }
        entry = new entryClass;
        entry.bundle = entryClass.bundle;
        this.entrysMap.set(entry.bundle, entry);
    }

    init(node: Node){
        this.node = node;
        if(node){
            this.entrysMap.forEach((entry,key)=>{
                if (!entry.isRunning ){
                    entry.run(this.node as Node);
                }
                if(entry.isMain){
                    this.mianEntry = entry;
                    entry.onLoad();
                }
            });
        }
    }

    enterGame(game:number | String){
        let entry = this.getEntry(game);
        if(entry) {
            entry.onLoad();
            let config = {...entry.config,...this.mianEntry.config}
            app.gui.initConfig(config);
            app.gui.open(entry.lunchUI);
        } else {
            console.error(`${game} 入口文件未找到`);
        }
    }

    onLoad() {
        
    }

    onDestroy(node: Node) {
        this.entrysMap.forEach((entry) => {
            entry.onDestroy();
        });
    }

    getEntry(bundle:number | String){
        let _entry = null;
        //bundle id
        if(typeof bundle == 'number'){
            this.entrysMap.forEach((entry) => {
                if(entry.gameId === bundle){
                    _entry = entry;
                }
            });
        }
        //bundle 名 
        else if(typeof game == 'string'){
            let entry = this.entrysMap.get(bundle.toString())
            if (entry) {
                _entry = entry;
            }
        }
        return _entry;
    }


    debug(){
        console.log(`-------Bundle入口管理器-------`)
        this.entrysMap.forEach(v=>{
            console.log(`bundle : ${v.bundle}`);
        })
    }
}