
/** 网络状态枚举 */
export enum NetNodeState {
    Closed,                     // 已关闭
    Connecting,                 // 连接中
    Checking,                   // 验证中
    Working,                    // 可传输数据
}

/** 网络连接参数 */
export interface NetConnectOptions {
    host?: string,              // 地址
    port?: number,              // 端口
    url?: string,               // url，与地址+端口二选一
    autoReconnect?: number,     // -1 永久重连，0不自动重连，其他正整数为自动重试次数
}
/** 网络提示类型枚举 */
export enum NetTipsType {
    Connecting,
    ReConnecting,
    Requesting,
}







/*
 * 网络相关接口定义
 */
export type NetData = (string | ArrayBufferLike | Blob | ArrayBufferView);
export type NetCallFunc = (data: any) => void;

/** 请求协议 */
export interface IRequestProtocol {
    /** 协议命令编号 */
    cmd: string,
    /** 回调方法名 */
    callback?: string,
    /** 是否压缩 */
    isCompress: boolean,
    /** 渠道编号 */
    channelid: number,
    /** 消息内容 */
    data?: any;
}

/** 响应协议 */
export interface IResponseProtocol {
    /** 响应协议状态码 */
    code: number,
    /** 数据是否压缩 */
    isCompress: boolean,
    /** 协议数据 */
    data?: any,
    /** 协议回调方法名 */
    callback?: string
}

/** 回调对象 */
export interface CallbackObject {
    target: any,                // 回调对象，不为null时调用target.callback(xxx)
    callback: NetCallFunc,      // 回调函数
}

/** 请求对象 */
export interface RequestObject {
    buffer: NetData,                   // 请求的Buffer
    rspCmd: string,                    // 等待响应指令
    rspObject: CallbackObject | null,  // 等待响应的回调对象
}

/** 协议辅助接口 */
export interface IProtocolHelper {
    /** 返回包头长度 */
    getHeadlen(): number;
    /** 返回一个心跳包 */
    getHearbeat(): NetData;
    /** 返回整个包的长度 */
    getPackageLen(msg: NetData): number;
    /** 检查包数据是否合法（避免客户端报错崩溃） */
    checkResponsePackage(msg: IResponseProtocol): boolean;
    /** 处理请求包数据 */
    handlerRequestPackage(reqProtocol: IRequestProtocol): string;
    /** 处理响应包数据 */
    handlerResponsePackage(respProtocol: IResponseProtocol): boolean;
    /** 返回包的id或协议类型 */
    getPackageId(msg: IResponseProtocol): string;
}

export type SocketFunc = (event: any) => void;
export type MessageFunc = (msg: NetData) => void;

/** Socket接口 */
export interface ISocket {
    onConnected: SocketFunc | null;         // 连接回调
    onMessage: MessageFunc | null;          // 消息回调
    onError: SocketFunc | null;             // 错误回调
    onClosed: SocketFunc | null;            // 关闭回调

    connect(options: any): any;                     // 连接接口
    send(buffer: NetData): number;                  // 数据发送接口
    close(code?: number, reason?: string): void;    // 关闭接口
}

/** 网络提示接口 */
export interface INetworkTips {
    connectTips(isShow: boolean): void;
    reconnectTips(isShow: boolean): void;
    requestTips(isShow: boolean): void;
    responseErrorCode(code: number): void;
}
/**
 * HTTP请求返回值
 */
export class HttpReturn {
    /** 是否请求成功 */
    isSucc: boolean = false;
    /** 请求返回数据 */
    res?: any;
    /** 请求错误数据 */
    err?: any;
}
export type HttpCallback = (ret: HttpReturn) => void;
export enum HttpMethod{
    POST="POST",
    GET="GET"
}