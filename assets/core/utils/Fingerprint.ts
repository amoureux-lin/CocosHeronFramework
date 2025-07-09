/**
 * 静态浏览器指纹生成器 - 稳定性修复版本
 * 确保相同环境下生成一致的唯一指纹，修复浏览器警告但保持指纹一致性
 */
export default class Fingerprint {

    /**
     * 获取稳定的Canvas指纹(不缓存,但每次都一致)
     * @returns {Promise<string>} Canvas指纹的SHA256哈希值
     */
    static async getCanvasFingerprint(): Promise<string> {
        // 创建Canvas元素
        const canvas = document.createElement('canvas');
        canvas.width = 200;
        canvas.height = 50;
        // 添加 willReadFrequently 优化，但不影响渲染结果
        const ctx = canvas.getContext('2d', { willReadFrequently: true }) as CanvasRenderingContext2D;

        // 绘制固定内容 - 保持与原版完全一致
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

        // 收集浏览器信息 - 保持与原版完全一致
        const ua = navigator.userAgent || '';
        const lang = navigator.language || '';
        const resolution = `${screen.width}x${screen.height}`;
        const timezone = new Date().getTimezoneOffset().toString();

        // 组合所有数据 - 保持与原版完全一致
        const textData = `${ua}|${lang}|${resolution}|${timezone}`;
        const textBytes = new TextEncoder().encode(textData);
        
        // 合并文本数据和图像数据 - 保持与原版完全一致
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

        // 合并所有组件 - 保持与原版完全一致
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
            const gl: WebGLRenderingContext | any = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            
            if (!gl) {
                return await this.sha256(new TextEncoder().encode('no-webgl'));
            }

            const info = [];
            
            // 收集WebGL信息 - 保持与原版完全一致
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
     * 获取音频指纹 - 修复版本但保持结果一致性
     * @returns {Promise<string>} 音频指纹
     */
    static async getAudioFingerprint(): Promise<string> {
        return new Promise((resolve) => {
            // 检查音频API可用性
            if (!window.AudioContext && !(window as any).webkitAudioContext) {
                this.sha256(new TextEncoder().encode('no-audio-api')).then(resolve);
                return;
            }

            try {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                const audioContext = new AudioContextClass();

                // 检查AudioContext状态
                if (audioContext.state === 'suspended') {
                    // 无法启动AudioContext时，使用确定性的静态指纹
                    audioContext.close();
                    this.getStaticAudioFingerprint().then(resolve);
                    return;
                }

                // 尝试使用现代AudioWorkletNode，但确保结果一致
                if (this.supportsAudioWorklet(audioContext)) {
                    this.getAudioFingerprintWithWorklet(audioContext).then(resolve).catch(() => {
                        // WorkletNode失败时降级到ScriptProcessor
                        this.getAudioFingerprintWithProcessor(audioContext).then(resolve);
                    });
                } else {
                    // 直接使用ScriptProcessor
                    this.getAudioFingerprintWithProcessor(audioContext).then(resolve);
                }
            } catch (e) {
                // 完全无法使用AudioContext时，使用静态指纹
                this.getStaticAudioFingerprint().then(resolve);
            }
        });
    }

    /**
     * 检查是否支持AudioWorklet
     */
    private static supportsAudioWorklet(audioContext: AudioContext): boolean {
        return !!(audioContext.audioWorklet && typeof audioContext.audioWorklet.addModule === 'function');
    }

    /**
     * 使用AudioWorkletNode获取音频指纹（确保与ScriptProcessor结果一致）
     */
    private static async getAudioFingerprintWithWorklet(audioContext: AudioContext): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                // 创建与ScriptProcessor完全相同的音频处理逻辑
                const workletCode = `
                    class AudioFingerprintProcessor extends AudioWorkletProcessor {
                        constructor() {
                            super();
                            this.audioData = [];
                        }
                        
                        process(inputs, outputs, parameters) {
                            const input = inputs[0];
                            if (input.length > 0) {
                                const inputData = input[0];
                                // 使用与ScriptProcessor相同的采样逻辑
                                for (let i = 0; i < inputData.length && this.audioData.length < 100; i++) {
                                    this.audioData.push(inputData[i]);
                                }
                                
                                if (this.audioData.length >= 100) {
                                    this.port.postMessage({ audioData: this.audioData });
                                    return false; // 停止处理
                                }
                            }
                            return this.audioData.length < 100;
                        }
                    }
                    
                    registerProcessor('audio-fingerprint-processor', AudioFingerprintProcessor);
                `;

                const blob = new Blob([workletCode], { type: 'application/javascript' });
                const workletUrl = URL.createObjectURL(blob);

                await audioContext.audioWorklet.addModule(workletUrl);
                
                // 创建与原版完全相同的音频链路
                const oscillator = audioContext.createOscillator();
                const workletNode = new AudioWorkletNode(audioContext, 'audio-fingerprint-processor');
                const gainNode = audioContext.createGain();

                // 使用与原版完全相同的参数
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);

                oscillator.connect(workletNode);
                workletNode.connect(gainNode);
                gainNode.connect(audioContext.destination);

                let isProcessed = false;

                workletNode.port.onmessage = async (event) => {
                    if (isProcessed) return;
                    isProcessed = true;
                    
                    const audioData = event.data.audioData;
                    
                    // 清理资源
                    try {
                        oscillator.stop();
                        await audioContext.close();
                        URL.revokeObjectURL(workletUrl);
                    } catch (e) {
                        // 忽略清理错误
                    }
                    
                    // 使用与原版完全相同的处理逻辑
                    const audioStr = audioData.map((x: number) => x.toFixed(6)).join(',');
                    const result = await Fingerprint.sha256(new TextEncoder().encode(audioStr));
                    resolve(result);
                };

                oscillator.start(0);
                
                // 超时处理 - 保持与原版一致
                setTimeout(async () => {
                    if (!isProcessed) {
                        isProcessed = true;
                        try {
                            oscillator.stop();
                            await audioContext.close();
                            URL.revokeObjectURL(workletUrl);
                        } catch (e) {
                            // 忽略清理错误
                        }
                        const result = await Fingerprint.sha256(new TextEncoder().encode('audio-timeout'));
                        resolve(result);
                    }
                }, 1000);
                
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * 使用ScriptProcessorNode获取音频指纹（原版逻辑）
     */
    private static async getAudioFingerprintWithProcessor(audioContext: AudioContext): Promise<string> {
        return new Promise((resolve) => {
            try {
                const oscillator = audioContext.createOscillator();
                const analyser = audioContext.createAnalyser();
                const gainNode = audioContext.createGain();
                const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);

                // 保持与原版完全相同的参数
                oscillator.type = 'triangle';
                oscillator.frequency.setValueAtTime(10000, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0, audioContext.currentTime);

                oscillator.connect(analyser);
                analyser.connect(scriptProcessor);
                scriptProcessor.connect(gainNode);
                gainNode.connect(audioContext.destination);

                let audioData: number[] = [];
                let isProcessed = false;
                
                scriptProcessor.onaudioprocess = (event) => {
                    if (isProcessed) return;
                    
                    const inputBuffer = event.inputBuffer;
                    const inputData = inputBuffer.getChannelData(0);
                    
                    // 采集前100个样本 - 保持与原版完全一致
                    if (audioData.length < 100) {
                        audioData = audioData.concat(Array.from(inputData.slice(0, 100 - audioData.length)));
                    }
                    
                    if (audioData.length >= 100) {
                        isProcessed = true;
                        
                        // 清理资源
                        try {
                            oscillator.stop();
                            audioContext.close();
                        } catch (e) {
                            // 忽略清理错误
                        }
                        
                        // 转换为字符串并生成哈希 - 保持与原版完全一致
                        const audioStr = audioData.map(x => x.toFixed(6)).join(',');
                        Fingerprint.sha256(new TextEncoder().encode(audioStr)).then(resolve);
                    }
                };

                oscillator.start(0);
                
                // 超时处理 - 保持与原版完全一致
                setTimeout(() => {
                    if (!isProcessed) {
                        isProcessed = true;
                        try {
                            oscillator.stop();
                            audioContext.close();
                        } catch (e) {
                            // 忽略清理错误
                        }
                        Fingerprint.sha256(new TextEncoder().encode('audio-timeout')).then(resolve);
                    }
                }, 1000);
                
            } catch (e) {
                Fingerprint.sha256(new TextEncoder().encode('audio-error')).then(resolve);
            }
        });
    }

    /**
     * 获取静态音频指纹（当AudioContext不可用时的确定性降级）
     */
    private static async getStaticAudioFingerprint(): Promise<string> {
        // 使用确定性的设备信息来生成"模拟"音频指纹
        // 这确保了在相同设备上总是返回相同的结果
        const staticInfo = [];
        
        // 收集音频相关的静态信息
        staticInfo.push('audio-context-suspended');
        staticInfo.push(navigator.userAgent || '');
        staticInfo.push(navigator.platform || '');
        
        // 模拟原版音频指纹的结构：100个固定精度的数值
        // 使用设备特征生成确定性的"伪音频数据"
        const deviceSeed = this.getDeviceSeed();
        const pseudoAudioData = [];
        
        for (let i = 0; i < 100; i++) {
            // 基于设备种子生成确定性的伪音频值
            const value = Math.sin((deviceSeed + i) * 0.1) * 0.001;
            pseudoAudioData.push(value.toFixed(6));
        }
        
        const audioStr = pseudoAudioData.join(',');
        return await this.sha256(new TextEncoder().encode(audioStr));
    }

    /**
     * 获取设备种子（用于生成确定性的伪随机数）
     */
    private static getDeviceSeed(): number {
        let seed = 0;
        const userAgent = navigator.userAgent || '';
        const platform = navigator.platform || '';
        const language = navigator.language || '';
        
        // 基于设备信息生成确定性种子
        const combined = userAgent + platform + language;
        for (let i = 0; i < combined.length; i++) {
            seed = ((seed << 5) - seed + combined.charCodeAt(i)) & 0xffffffff;
        }
        
        return seed;
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
        // 添加 willReadFrequently 优化，但不影响渲染结果
        const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
        const availableFonts: string[] = [];

        // 基准字体渲染 - 保持与原版完全一致
        ctx.font = '72px monospace';
        ctx.fillText('BrowserFP测试', 0, 100);
        const baseline = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

        for (const font of fonts) {
            // 清除画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // 使用测试字体渲染 - 保持与原版完全一致
            ctx.font = `72px ${font}, monospace`;
            ctx.fillText('BrowserFP测试', 0, 100);
            const testData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

            // 比较像素差异 - 保持与原版完全一致
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

        // 基础浏览器信息 - 保持与原版完全一致
        info.push(`ua:${navigator.userAgent}`);
        info.push(`lang:${navigator.language}`);
        info.push(`langs:${navigator.languages ? navigator.languages.join(',') : ''}`);
        info.push(`platform:${navigator.platform}`);
        info.push(`cookieEnabled:${navigator.cookieEnabled}`);
        info.push(`doNotTrack:${navigator.doNotTrack || 'null'}`);

        // 屏幕信息 - 保持与原版完全一致
        info.push(`screen:${screen.width}x${screen.height}x${screen.colorDepth}`);
        info.push(`availScreen:${screen.availWidth}x${screen.availHeight}`);
        info.push(`pixelRatio:${window.devicePixelRatio || 1}`);

        // 时区信息 - 保持与原版完全一致
        info.push(`timezone:${Intl.DateTimeFormat().resolvedOptions().timeZone}`);
        info.push(`timezoneOffset:${new Date().getTimezoneOffset()}`);

        // 硬件信息 - 保持与原版完全一致
        info.push(`hardwareConcurrency:${(navigator as any).hardwareConcurrency || 'unknown'}`);
        info.push(`deviceMemory:${(navigator as any).deviceMemory || 'unknown'}`);

        // 网络连接信息 - 保持与原版完全一致
        const connection = (navigator as any).connection;
        if (connection) {
            info.push(`connection:${connection.effectiveType || 'unknown'}`);
            info.push(`downlink:${connection.downlink || 'unknown'}`);
        }

        // 插件信息 - 保持与原版完全一致
        const plugins = Array.from(navigator.plugins).map(p => p.name).sort();
        info.push(`plugins:${plugins.join(',')}`);

        // 媒体查询信息 - 保持与原版完全一致
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
     * 生成SHA256哈希 - 保持与原版完全一致
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

        // 降级使用简单哈希算法 - 保持与原版完全一致
        return this.simpleHash(buffer);
    }

    /**
     * 简单哈希算法(SHA256不可用时的降级方案) - 保持与原版完全一致
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
        
        // 转为16进制并确保长度 - 保持与原版完全一致
        return hash.toString(16).padStart(8, '0') + 
               this.additionalHash(buffer).toString(16).padStart(8, '0');
    }

    /**
     * 额外哈希算法增强安全性 - 保持与原版完全一致
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
     * 获取指纹信息摘要 - 保持与原版完全一致
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
     * 验证指纹一致性 - 保持与原版完全一致
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