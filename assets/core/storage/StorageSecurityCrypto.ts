// import { app } from "../../app";
// import { EncryptUtil } from "../../utils/EncryptUtil";
// import { IStorageSecurity } from "./StorageManager";

import { IStorageSecurity } from "./StorageManager";

// /**
//  * 本地存储加密
//  * 优点：
//  * 1、加密强度更高
//  *
//  * 缺点：
//  * 1、整体代码体积增加约200KB
//  * 2、需要下载 CryptoES 加密库
//  */
export class StorageSecurityCrypto implements IStorageSecurity {
    decrypt(str: string): string {
        throw new Error("Method not implemented.");
    }
    encrypt(str: string): string {
        throw new Error("Method not implemented.");
    }
    encryptKey(str: string): string {
        throw new Error("Method not implemented.");
    }
}
//     private _key: string = null!;
//     private _iv: string = null!;

//     constructor() {
//         const key = app.config.game.localDataKey;
//         const iv = app.config.game.localDataIv;

//         EncryptUtil.initCrypto(key, iv);

//         this._key = EncryptUtil.md5(key);
//         this._iv = EncryptUtil.md5(iv);
//     }

//     decrypt(str: string): string {
//         return EncryptUtil.aesDecrypt(str, this._key, this._iv);
//     }

//     encrypt(str: string): string {
//         return EncryptUtil.aesEncrypt(str, this._key, this._iv);
//     }

//     encryptKey(str: string): string {
//         return EncryptUtil.md5(str);
//     }
// }