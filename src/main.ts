const PackageJSON = require("../package.json");
/**
 * @en Registration method for the main process of Extension
 * @zh 为扩展的主进程的注册方法
 */
export const methods: { [key: string]: (...any: any) => any } = {
    openDefaultPanel() {
        console.log("PackageJSON.name",PackageJSON.name)
        Editor.Panel.open(PackageJSON.name);
    }
};

/**
 * @en Hooks triggered after extension loading is complete
 * @zh 扩展加载完成后触发的钩子
 */
export const load = async function() {
    const flag =  await Editor.Profile.getProject('i18n', 'first');
    if (!flag) {
        console.log(Editor.I18n.t('i18n.warnA'));
        console.log(Editor.I18n.t('i18n.warnB'));
        console.log(Editor.I18n.t('i18n.warnC'));
        console.log(Editor.I18n.t('i18n.warnD'));
        Editor.Profile.setProject('i18n', 'first', true);
    }
    
};

/**
 * @en Hooks triggered after extension uninstallation is complete
 * @zh 扩展卸载完成后触发的钩子
 */
export const unload = function() { };
