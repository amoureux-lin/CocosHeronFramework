
/**
 * 静态浏览器指纹生成器
 * 确保相同环境下生成一致的唯一指纹
 */
export default class FrameworkUtils{
  
   /**
     * 获取稳定的Canvas指纹(不缓存,但每次都一致)
     * @returns {Promise<string>} Canvas指纹的SHA256哈希值
     */
    static async getCanvasFingerprint(): Promise<string> {
        // 创建Canvas元素
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;
        const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

        // 绘制固定内容
        ctx.font = '14px Arial';
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('flutter-fingerprint', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('flutter-fingerprint', 4, 17);

        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const bytes = new Uint8Array(imageData.data);

        // 收集浏览器信息
        const ua = navigator.userAgent || '';
        const lang = navigator.language || '';
        const resolution = `${screen.width}x${screen.height}`;
        const timezone = new Date().getTimezoneOffset().toString();

        // 组合所有数据
        const textData = `${ua}|${lang}|${resolution}|${timezone}`;
        const textBytes = new TextEncoder().encode(textData);
        
        // 合并文本数据和图像数据
        const buffer = new Uint8Array(textBytes.length + bytes.length);
        buffer.set(textBytes, 0);
        buffer.set(bytes, textBytes.length);

        // 生成SHA256哈希
        return await this.sha256(buffer);
    }

    /**
     * 获取完整的稳定指纹
     * @returns {Promise<string>} 完整指纹哈希
     */
    static async getCompleteFingerprint(): Promise<string> {
        const components = [];

        // 1. Canvas指纹
        components.push(await this.getCanvasFingerprint());

        // 2. WebGL指纹
        components.push(await this.getWebGLFingerprint());

        // 3. 音频指纹
        components.push(await this.getAudioFingerprint());

        // 4. 字体指纹
        components.push(await this.getFontFingerprint());

        // 5. 系统信息指纹
        components.push(await this.getSystemFingerprint());

        // 合并所有组件
        const combined = components.join('|');
        const buffer = new TextEncoder().encode(combined);
        
        return await this.sha256(buffer);
    }

    /**
     * 获取WebGL指纹
     * @returns {Promise<string>} WebGL指纹
     */
    static async getWebGLFingerprint(): Promise<string> {
        try {
            const canvas = document.createElement('canvas');
            const gl:any = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return await this.sha256(new TextEncoder().encode('no-webgl'));
            }

            const info = [];
            
            // 收集WebGL信息
            info.push(gl.getParameter(gl.VERSION) || '');
            info.push(gl.getParameter(gl.RENDERER) || '');
            info.push(gl.getParameter(gl.VENDOR) || '');
            info.push(gl.getParameter(gl.SHADING_LANGUAGE_VERSION) || '');
            
            // 获取扩展
            const extensions = gl.getSupportedExtensions();
            if (extensions) {
                info.push(extensions.sort().join(','));
            }

            // 获取调试信息
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                info.push(gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || '');
                info.push(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || '');
            }

            const combined = info.join('|');
            const buffer = new TextEncoder().encode(combined);
            return await this.sha256(buffer);
        } catch (e) {
            const buffer = new TextEncoder().encode('webgl-error');
            return await this.sha256(buffer);
        }
    }

    /**
     * 获取音频指纹
     * @returns {Promise<string>} 音频指纹
     */
    static async getAudioFingerprint(): Promise<string> {
        return new Promise((resolve) => {
            try {
                const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const analyser = audioContext.createAnalyser();
                const gainNode = audioContext.createGain();
                const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);

                oscillator.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(gainNode);
                gainNode.connect(audioContext.destination);

                let audioData: number[] = [];
                
                scriptProcessor.onaudioprocess = (event) => {
                    const inputBuffer = event.inputBuffer;
                    const inputData = inputBuffer.getChannelData(0);
                    
                    // 采集前100个样本
                    if (audioData.length < 100) {
                        audioData = audioData.concat(Array.from(inputData.slice(0, 100 - audioData.length)));
                    }
                    
                    if (audioData.length >= 100) {
                        oscillator.stop();
                        audioContext.close();
                        
                        // 转换为字符串并生成哈希
                        const audioStr = audioData.map(x => x.toFixed(6)).join(',');
                        this.sha256(new TextEncoder().encode(audioStr)).then(resolve);
                    }
                };

                oscillator.start(0);
                
                // 超时处理
                setTimeout(() => {
                    oscillator.stop();
                    audioContext.close();
                    this.sha256(new TextEncoder().encode('audio-timeout')).then(resolve);
                }, 1000);
                
            } catch (e) {
                this.sha256(new TextEncoder().encode('audio-error')).then(resolve);
            }
        });
    }

    /**
     * 获取字体指纹
     * @returns {Promise<string>} 字体指纹
     */
    static async getFontFingerprint(): Promise<string> {
        const fonts = [
            'Arial', 'Arial Black', 'Arial Narrow', 'Calibri', 'Cambria', 'Courier New',
            'Georgia', 'Helvetica', 'Impact', 'Lucida Console', 'Lucida Sans Unicode',
            'Microsoft Sans Serif', 'Palatino Linotype', 'Tahoma', 'Times New Roman',
            'Trebuchet MS', 'Verdana', 'Comic Sans MS', 'Consolas', 'Monaco'
        ];

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        const availableFonts: string[] = [];

        // 基准字体渲染
        ctx.font = '72px monospace';
        ctx.fillText('BrowserFP测试', 0, 100);
        const baseline = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        for (const font of fonts) {
            // 清除画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 使用测试字体渲染
            ctx.font = `72px ${font}, monospace`;
            ctx.fillText('BrowserFP测试', 0, 100);
            const testData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            // 比较像素差异
            let different = false;
            for (let i = 0; i < baseline.length; i++) {
                if (baseline[i] !== testData[i]) {
                    different = true;
                    break;
                }
            }

            if (different) {
                availableFonts.push(font);
            }
        }

        const fontStr = availableFonts.sort().join(',');
        const buffer = new TextEncoder().encode(fontStr);
        return await this.sha256(buffer);
    }

    /**
     * 获取系统信息指纹
     * @returns {Promise<string>} 系统信息指纹
     */
    static async getSystemFingerprint(): Promise<string> {
        const info = [];

        // 基础浏览器信息
        info.push(`ua:${navigator.userAgent}`);
        info.push(`lang:${navigator.language}`);
        info.push(`langs:${navigator.languages ? navigator.languages.join(',') : ''}`);
        info.push(`platform:${navigator.platform}`);
        info.push(`cookieEnabled:${navigator.cookieEnabled}`);
        info.push(`doNotTrack:${navigator.doNotTrack || 'null'}`);

        // 屏幕信息
        info.push(`screen:${screen.width}x${screen.height}x${screen.colorDepth}`);
        info.push(`availScreen:${screen.availWidth}x${screen.availHeight}`);
        info.push(`pixelRatio:${window.devicePixelRatio || 1}`);

        // 时区信息
        info.push(`timezone:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
        info.push(`timezoneOffset:${new Date().getTimezoneOffset()}`);

        // 硬件信息
        info.push(`hardwareConcurrency:${(navigator as any).hardwareConcurrency || 'unknown'}`);
        info.push(`deviceMemory:${(navigator as any).deviceMemory || 'unknown'}`);

        // 网络连接信息
        const connection = (navigator as any).connection;
        if (connection) {
            info.push(`connection:${connection.effectiveType || 'unknown'}`);
            info.push(`downlink:${connection.downlink || 'unknown'}`);
        }

        // 插件信息
        const plugins = Array.from(navigator.plugins).map(p => p.name).sort();
        info.push(`plugins:${plugins.join(',')}`);

        // 媒体查询信息
        const mediaQueries = [
            'prefers-color-scheme: dark',
            'prefers-reduced-motion: reduce',
            'hover: hover',
            'pointer: fine'
        ];
        
        for (const query of mediaQueries) {
            info.push(`media-${query}:${window.matchMedia(`(${query})`).matches}`);
        }

        const combined = info.join('|');
        const buffer = new TextEncoder().encode(combined);
        return await this.sha256(buffer);
    }

    /**
     * 生成SHA256哈希
     * @param buffer 输入数据
     * @returns {Promise<string>} SHA256哈希值
     */
    private static async sha256(buffer: Uint8Array): Promise<string> {
        try {
            // 优先使用Web Crypto API
            if (crypto && crypto.subtle) {
                const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
        } catch (e) {
            // Fallback to simple hash if Web Crypto API is not available
        }

        // 降级使用简单哈希算法
        return this.simpleHash(buffer);
    }

    /**
     * 简单哈希算法(SHA256不可用时的降级方案)
     * @param buffer 输入数据
     * @returns {string} 哈希值
     */
    private static simpleHash(buffer: Uint8Array): string {
        let hash = 0x811c9dc5; // FNV-1a offset basis
        
        for (let i = 0; i < buffer.length; i++) {
            hash ^= buffer[i];
            hash *= 0x01000193; // FNV-1a prime
            hash >>>= 0; // 转为无符号32位整数
        }
        
        // 转为16进制并确保长度
        return hash.toString(16).padStart(8, '0') + 
               this.additionalHash(buffer).toString(16).padStart(8, '0');
    }

    /**
     * 额外哈希算法增强安全性
     * @param buffer 输入数据
     * @returns {number} 哈希值
     */
    private static additionalHash(buffer: Uint8Array): number {
        let hash = 0;
        for (let i = 0; i < buffer.length; i++) {
            hash = ((hash << 5) - hash + buffer[i]) & 0xffffffff;
        }
        return hash >>> 0;
    }

    /**
     * 获取指纹信息摘要
     * @returns {Promise<object>} 指纹摘要信息
     */
    static async getFingerprintSummary(): Promise<{
        canvasFingerprint: string;
        webglFingerprint: string;
        audioFingerprint: string;
        fontFingerprint: string;
        systemFingerprint: string;
        completeFingerprint: string;
        metadata: {
            timestamp: number;
            userAgent: string;
            language: string;
            screen: string;
            timezone: string;
        };
    }> {
        const [canvas, webgl, audio, font, system] = await Promise.all([
            this.getCanvasFingerprint(),
            this.getWebGLFingerprint(), 
            this.getAudioFingerprint(),
            this.getFontFingerprint(),
            this.getSystemFingerprint()
        ]);

        const complete = await this.getCompleteFingerprint();

        return {
            canvasFingerprint: canvas,
            webglFingerprint: webgl,
            audioFingerprint: audio,
            fontFingerprint: font,
            systemFingerprint: system,
            completeFingerprint: complete,
            metadata: {
                timestamp: Date.now(),
                userAgent: navigator.userAgent,
                language: navigator.language,
                screen: `${screen.width}x${screen.height}`,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
            }
        };
    }

    /**
     * 验证指纹一致性
     * @returns {Promise<boolean>} 一致性验证结果
     */
    static async verifyConsistency(): Promise<boolean> {
        try {
            const [fp1, fp2, fp3] = await Promise.all([
                this.getCompleteFingerprint(),
                this.getCompleteFingerprint(),
                this.getCompleteFingerprint()
            ]);

            return fp1 === fp2 && fp2 === fp3;
        } catch (e) {
            return false;
        }
    }
}

// // Cocos Creator 组件示例
// const { ccclass, property } = cc._decorator;

// @ccclass
// export class FingerprintComponent extends cc.Component {

//     onLoad() {
//         // 获取一致的设备指纹
//         const fingerprint = BrowserFingerprintStatic.getFingerprint();
//         console.log('设备指纹:', fingerprint);

//         // 获取一致的设备ID
//         const deviceId = BrowserFingerprintStatic.getDeviceId();
//         console.log('设备ID:', deviceId);

//         // 获取完整设备信息
//         const deviceInfo = BrowserFingerprintStatic.getDeviceInfo();
//         console.log('设备信息:', deviceInfo);

//         // 验证一致性
//         console.log('指纹一致性:', deviceInfo.validation.isConsistent);
//         console.log('唯一性评分:', deviceInfo.validation.uniquenessScore);
//     }

//     // 示例：检查设备ID是否变化
//     checkDeviceConsistency() {
//         const deviceId1 = BrowserFingerprintStatic.getDeviceId();
//         const deviceId2 = BrowserFingerprintStatic.getDeviceId();
        
//         console.log('设备ID一致性:', deviceId1 === deviceId2); // 应该始终为true
        
//         return deviceId1;
//     }

//     // 示例：重置缓存（测试用）
//     resetFingerprint() {
//         BrowserFingerprintStatic.resetCache();
//         console.log('指纹缓存已重置');
//     }
// }