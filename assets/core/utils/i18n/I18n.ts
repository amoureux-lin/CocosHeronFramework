import { director } from 'cc';



export let ready: boolean = false;

/**
 * 初始化
 * @param language 
 */
export function init(language: string) {
    ready = true;
    if (win.i18n.language === language) {
        return;
    }
    if(!language){
        language = "zh"
    }
    win.i18n.language = language;
}

export function getLanguage(){
    return win.i18n.language || 'zh'
}

/**
 * 翻译数据
 * @param key 
 */
export function t(key: string) {
    const win: any = window;


    let bundle = win.bundle;
    let i18n = win.i18n;
    let language = win.i18n.language;

    if(!bundle){
        bundle = "main";
    }

    if (!i18n) {
        console.error('不存在 win.i18n');
        return key;
    }
    if (!i18n.languages) {
        console.error('不存在 win.i18n.languages');
        return key;
    }
    if(!i18n.languages[bundle]){
        console.error('不存在 win.i18n.languages.game',[bundle]);
        return key;
    }
    if (!i18n.languages[bundle][language]) {
        console.error(`不存在 win.i18n.languages.game[language]`);
        return key;
    }
    const searcher = key.split('.');
    let data = i18n.languages[bundle][language];

    let value = i18n.languages[bundle][language][key];
    if(!value){
        value = i18n.languages["main"][language][key];
        if(!value){
            return key;
        }
        return value;
    }
    return value || '';
}

export function updateSceneRenderers() { // very costly iterations
    console.log("更新多语言",win.i18n.language)
    const rootNodes = director.getScene()!.children;
    // walk all nodes with localize label and update
    const allLocalizedLabels: any[] = [];
    for (let i = 0; i < rootNodes.length; ++i) {
        let labels = rootNodes[i].getComponentsInChildren('I18nLabel');
        Array.prototype.push.apply(allLocalizedLabels, labels);
    }
    for (let i = 0; i < allLocalizedLabels.length; ++i) {
        let label = allLocalizedLabels[i];
        if(!label.node.active)continue;
        label.updateLabel();
    }
    // walk all nodes with localize sprite and update
    const allLocalizedSprites: any[] = [];
    for (let i = 0; i < rootNodes.length; ++i) {
        let sprites = rootNodes[i].getComponentsInChildren('I18nSprite');
        Array.prototype.push.apply(allLocalizedSprites, sprites);
    }
    for (let i = 0; i < allLocalizedSprites.length; ++i) {
        let sprite = allLocalizedSprites[i];
        if(!sprite.node.active)continue;
        sprite.updateSprite();
    }
    // walk all nodes with localize spine and update
    const allLocalizedSpines: any[] = [];
    for (let i = 0; i < rootNodes.length; ++i) {
        let spines = rootNodes[i].getComponentsInChildren('I18nSpine');
        Array.prototype.push.apply(allLocalizedSpines, spines);
    }
    for (let i = 0; i < allLocalizedSpines.length; ++i) {
        let spine = allLocalizedSpines[i];
        if(!spine.node.active)continue;
        spine.updateSpine();
    }
}

// 供插件查询当前语言使用
const win = window as any;
if (!win.i18n) win.i18n = {};
if (!win.i18n.init) win.i18n.init = null;
if (!win.i18n.updateSceneRenderers) win.i18n.updateSceneRenderers = null;

win.i18n.init = init;
win.i18n.updateSceneRenderers = updateSceneRenderers;
win.i18n.language = "zh"

win.changeLanguage = (language: string) => {
    console.log("language:",language)
    if (win.i18n.language === language) {
        return;
    }
    if(!language){
        language = "zh"
    }
    win.i18n.language = language;
    updateSceneRenderers();
}

