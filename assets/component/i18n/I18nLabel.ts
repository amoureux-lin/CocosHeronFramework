

import { _decorator, Component, Label } from 'cc';
const { ccclass, property, executeInEditMode,menu} = _decorator;

import * as i18n from '../../core/utils/i18n/I18n';

@ccclass('I18nLabel')
@executeInEditMode
@menu('Framework/i18n/I18nLabel （文本多语言）')
export class I18nLabel extends Component {
    label: Label | null = null;

    @property({ visible: false })
    key: string = '';

    @property({ displayName: 'Key', visible: true })
    get _key() {
        return this.key;
    }
    set _key(str: string) {
        this.updateLabel();
        this.key = str;
    }

    onLoad() {
        this.fetchRender();
        
    }

    fetchRender () {
        let label = this.getComponent(Label) as Label;
        if (label) {
            this.label = label;
            this.updateLabel();
            return;
        } 
    }

    updateLabel () {
        this.label && (this.label.string = i18n.t(this.key));
    }
}
