import { _decorator, Component} from 'cc';
const { ccclass, property, executeInEditMode,menu} = _decorator;
const win = window as any;

@ccclass("BundleInit")
@executeInEditMode
@menu('Framework/bundle/BundleInit ()')
export class BundleInit extends Component{
    
    @property
    bundle: string = '';

    protected onLoad(): void {
        win.bundle = this.bundle;
    }
}

