import { EDITOR } from "cc/env";

export class Logger implements ISingleton{
    static module: string = "【日志管理器】";
    module: string = null!;
    isResident?: boolean = true;

  private originalConsole = { ...console };
  public enabled: boolean = true;

  public init(): void {
    if(!EDITOR){
      this.overrideAll();
    }
  }

  
  private typeLabels: Record<string, string> = {
    log: '普通',
    info: '信息',
    net: '网络',
    view: '视图',
    warn: '警告',
    error: '错误',
    debug: '调试',
    assert: '断言失败',
    trace: '堆栈',
    count: '计数',
    countReset: '计数重置',
    time: '计时',
    timeEnd: '计时结束',
  };

  private typeStyles: Record<string, string> = {
    log: 'background:#ccc; color:#000; border-radius:4px; padding:2px 6px;',
    info: 'background:#2d8cf0; color:white; border-radius:4px; padding:2px 6px;',
    net: 'background:#ee7700; color:white; border-radius:4px; padding:2px 6px;',
    view: 'background:#008000; color:white; border-radius:4px; padding:2px 6px;',
    warn: 'background:#f90; color:white; border-radius:4px; padding:2px 6px;',
    error: 'background:#e54d42; color:white; border-radius:4px; padding:2px 6px;',
    debug: 'background:#19be6b; color:white; border-radius:4px; padding:2px 6px;',
    assert: 'background:#ff4d4f; color:white; border-radius:4px; padding:2px 6px;',
    trace: 'background:#722ed1; color:white; border-radius:4px; padding:2px 6px;',
    count: 'background:#108ee9; color:white; border-radius:4px; padding:2px 6px;',
    countReset: 'background:#108ee9; color:white; border-radius:4px; padding:2px 6px;',
    time: 'background:#00c1d4; color:white; border-radius:4px; padding:2px 6px;',
    timeEnd: 'background:#00c1d4; color:white; border-radius:4px; padding:2px 6px;',
  };

  private overrideAll() {
    this.override('log', 'log');
    this.override('info', 'info');
    this.override('warn', 'warn');
    this.override('error', 'error');
    this.override('debug', 'debug');

    // 自定义扩展方法
    (console as any).net = this.wrap('log', 'net');
    (console as any).view = this.wrap('log', 'view');
  }

  private override(method: keyof Console, type: string) {
    console[method] = this.wrap(method, type);
  }

  private wrap(method: keyof Console, type: string) {
    const originalFn = this.originalConsole[method];
    const style = this.typeStyles[type] ?? '';
    const label = this.typeLabels[type] ?? type;

    return originalFn?.bind(console, `%c[${label}] ${this.getDateString()}`, style);
  }

  private getDateString(): string {
    const d = new Date();
    const pad = (n: number, width = 2) => n.toString().padStart(width, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    const seconds = pad(d.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
}

declare global {
  interface Console {
    net: (...args: any[]) => void;
    view: (...args: any[]) => void;
  }
}

