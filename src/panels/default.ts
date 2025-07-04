'use strict';

import { join } from 'path';
import { existsSync, readdirSync } from 'fs';

const Vue = require('vue/dist/vue.common.prod');

const languageContentTemplate = `
const win = window as any;

export const languages = {
    // Data
};

if (!win.languages) {
    win.languages = {};
}

win.languages.{{name}} = languages;
`;

// 兼容 3.3.0 之前的版本
Editor.Panel.define = Editor.Panel.define || function(options) {
    return options;
}

module.exports = Editor.Panel.define({
    template: `
    <div class="content">
        <header>
            <ui-button class="transparent add"
                @confirm="add()"
            >
                <ui-icon value="add"></ui-icon>
            </ui-button>
            <ui-button class="transparent refresh"
                @confirm="refresh()"
            >
                <ui-icon value="refresh"></ui-icon>
            </ui-button>
        </header>
        <section>
            <div
                v-for="item of list"
            >
                <ui-icon value="eye-open"
                    v-if="item === current"
                ></ui-icon>
                <ui-icon value="eye-close"
                    v-else
                    @click="select(item)"
                ></ui-icon>
                <span>{{item}}</span>
                <ui-icon class="option" value="del"
                    @click="del(item)"
                ></ui-icon>
            </div>

            <div
                v-if="showAddInput"
            >
                <ui-input ref="addInput"
                    @confirm="generateLanguageFile($event)"
                ></ui-input>
            </div>
        </section>
    <div>
    `,
    style: `
    :host { display: flex; padding: 6px; flex-direction: column; }
    :host .content { flex: 1; display: flex; flex-direction: column; }
    header { margin-bottom: 6px; }
    header > ui-button.refresh { float: right; }
    section { flex: 1; background: var(--color-normal-fill-emphasis); border-radius: calc( var(--size-normal-radius)* 1px); padding: 4px; }
    section > div { padding: 0 10px; }
    section > div > .slider { margin-right: 4px; }
    section > div > .option { float: right; display: none; }
    section > div > ui-icon { cursor: pointer; color: var(--color-warn-fill-normal); }
    section > div > ui-icon[value=eye-open] { color: var(--color-success-fill-normal); }
    section > div > ui-icon[value=del] { color: var(--color-danger-fill-normal); }
    section > div:hover { background: var(--color-normal-fill); border-radius: calc( var(--size-normal-radius)* 1px); }
    section > div:hover > .option { display: inline; }
    `,
    $: {
        content: '.content',
    },
    ready() {
        const vm = new Vue({
            el: this.$.content,
            data: {
                current: '',
                list: [],
                showAddInput: false,
            },
            watch: {
                current() {
                    const vm: any = this;
                    Editor.Message.send('scene', 'execute-scene-script', {
                        name: 'framework',
                        method: 'changeCurrentLanguage',
                        args: [vm.current || ''],
                    });
                },
            },
            methods: {
                add() {
                    vm.showAddInput = true;
                    requestAnimationFrame(() => {
                        vm.$refs.addInput.focus();
                    });
                },
                select(language: string) {
                    vm.current = language;
                },
                async del(name: string) {
                    const result = await Editor.Dialog.info(`确定删除 ${name} 语言文件？`, {
                        buttons: ['确认', '取消'],
                        default: 0,
                        cancel: 1,
                    });
                    if (result.response === 0) {
                        await Editor.Message.request('asset-db', 'delete-asset', `db://assets/i18n/${name}`);
                        vm.refresh();
                    }
                },
                async refresh() {
                    const dir = join(Editor.Project.path, 'assets/i18n');
                    if (!existsSync(dir)) {
                        return;
                    }
                    vm.current = await Editor.Message.request('scene', 'execute-scene-script', {
                        name: 'framework',
                        method: 'queryCurrentLanguage',
                        args: [],
                    }) || '';
                    const names = readdirSync(dir);
                    vm.$set(vm, 'list', []);
                    const regex = /^(?!.*meta).+$/;
                    const filtered = names.filter(item => regex.test(item));
                    filtered.forEach((name) => {
                        const language = name.replace(/\.[^\.]+$/, '');
                        if (!/\./.test(language)) {
                            vm.list.push(language);
                        }
                    });
                    console.log(vm.list);
                    
                },
                async generateLanguageFile(event: Event) {
                    // @ts-ignore
                    const language = event.target.value;

                    if (!/[a-zA-Z]/.test(language)) {
                        console.warn(`语言名称只允许使用 a-z A-Z, ${language} 不合法`);
                        return;
                    }

                    // const languageContent = languageContentTemplate.replace(/{{name}}/g, language);
                    vm.showAddInput = false;

                    const path = `db://assets/i18n/${language}`;
                    // await Editor.Message.request('asset-db', 'create-asset', `db://assets/resources/i18n/${language}.ts`, languageContent);
                    await Editor.Message.request('asset-db', 'create-asset', path,null);
                    const meta = await Editor.Message.request('asset-db', 'query-asset-meta', path);
                    if(meta){
                        meta.userData = meta.userData || {};
                        meta.userData.isBundle = true;
                        meta.userData.bundleName = language;
                        const content = JSON.stringify(meta, null, 2);
                        await Editor.Message.request('asset-db', 'save-asset-meta', path, content);
                    } else {
                        console.error(`❌ 无法获取 meta 数据: ${path}`);
                    }
                    vm.refresh();
                },
            },
        });
        vm.refresh();
    },
});
