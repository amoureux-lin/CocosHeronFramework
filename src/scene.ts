'use strict';

export function load() {}
export function unload() {}

export const methods = {
    queryCurrentLanguage() {
        const win = window as any;
        return win.i18n.language;
    },
    changeCurrentLanguage(lang: string) {
        const win = window as any;
        win.i18n.init(lang);
        win.i18n.updateSceneRenderers();
        // @ts-ignore
        cce.Engine.repaintInEditMode();
    }
};