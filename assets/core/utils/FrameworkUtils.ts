import Fingerprint from "./Fingerprint";

/**
 * 静态浏览器指纹生成器
 * 确保相同环境下生成一致的唯一指纹
 */
export default class FrameworkUtils{
  
  static async getFingerprint(){
    return await Fingerprint.getCompleteFingerprint()
  }
}
