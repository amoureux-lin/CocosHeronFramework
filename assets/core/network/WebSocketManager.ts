import { CallbackObject, INetworkTips, ISocket, NetConnectOptions, NetData, NetNodeState, NetTipsType, RequestObject } from "./NetInterface";
import { WebSock } from "./WebSock";
var NetNodeStateStrs = ["已关闭", "连接中", "验证中", "可传输数据"];
/*
 * 网络节点管理类
 */
export class WebSocketManager{

    /** 单例实例 */
    public static readonly instance: WebSocketManager = new WebSocketManager();
    
    //Socket
    protected _connectOptions: NetConnectOptions | null = null;
    protected _autoReconnect: number = 0;
    protected _socket: ISocket | null = null;                               // Socket对象（可能是原生socket、websocket、wx.socket...)
    protected _state: NetNodeState = NetNodeState.Closed;                   // 节点当前状态
    protected _isSocketInit: boolean = false;                               // Socket是否初始化过
    protected _isSocketOpen: boolean = false;                               // Socket是否连接成功过

    protected _networkTips: INetworkTips | null = null;                     // 网络提示ui对象（请求提示、断线重连提示等）

    protected _keepAliveTimer: any = null;                                  // 心跳定时器
    protected _receiveMsgTimer: any = null;                                 // 接收数据定时器
    protected _reconnectTimer: any = null;                                  // 重连定时器
    protected _heartTime: number = 10000;                                   // 心跳间隔
    protected _receiveTime: number = 6000000;                               // 多久没收到数据断开
    protected _reconnetTimeOut: number = 8000000;                           // 重连间隔
    protected _requests: RequestObject[] = Array<RequestObject>();          // 请求列表
    protected _listener: { [key: string]: CallbackObject[] | null } = {}    // 监听者列表

    // websocket初始化
    init(socket: ISocket,networkTips: INetworkTips | null = null){
        // this._socket = new WebSock();
        console.net(`网络初始化`);
        this._socket = socket;
        this._networkTips = networkTips;
    }

    //websocket链接
    connect(options: NetConnectOptions): boolean {
        if (this._socket && this._state == NetNodeState.Closed) {
            if (!this._isSocketInit) {
                this.initSocket();
            }
            this._state = NetNodeState.Connecting;
            if (!this._socket.connect(options)) {
                this.updateNetTips(NetTipsType.Connecting, false);
                return false;
            }
            if (this._connectOptions == null && typeof options.autoReconnect == "number") {
                this._autoReconnect = options.autoReconnect;
            }
            this._connectOptions = options;
            this.updateNetTips(NetTipsType.Connecting, true);
            return true;
        }
        return false;
    }

    protected initSocket() {
        if (this._socket) {
            this._socket.onConnected = (event) => { this.onConnected(event) };
            this._socket.onMessage = (msg) => { this.onMessage(msg) };
            this._socket.onError = (event) => { this.onError(event) };
            this._socket.onClosed = (event) => { this.onClosed(event) };
            this._isSocketInit = true;
        }
    }

    protected updateNetTips(tipsType: NetTipsType, isShow: boolean) {
        if (this._networkTips) {
            if (tipsType == NetTipsType.Requesting) {
                this._networkTips.requestTips(isShow);
            }
            else if (tipsType == NetTipsType.Connecting) {
                this._networkTips.connectTips(isShow);
            }
            else if (tipsType == NetTipsType.ReConnecting) {
                this._networkTips.reconnectTips(isShow);
            }
        }
    }

    onConnected(event: any) {
        console.net("网络已连接")
        this._isSocketOpen = true;
        // todo ==》连接完成 
        this._state = NetNodeState.Working;
        // 关闭连接或重连中的状态显示
        this.updateNetTips(NetTipsType.Connecting, false);
        this.updateNetTips(NetTipsType.ReConnecting, false);
    }
    onMessage(msg: NetData) {
        console.log('收到消息',msg)
    }
    onError(event: any) {
        console.error('[websocket] onError:',event)
    }
    onClosed(event: any) {
        console.error('[websocket] onClosed:',event);
        this.clearTimer();

        // todo ==》 执行断线回调，返回false表示不进行重连

        // 自动重连
        if (this.isAutoReconnect()) {
            this.updateNetTips(NetTipsType.ReConnecting, true);
            this._reconnectTimer = setTimeout(() => {
                this._socket!.close();
                this._state = NetNodeState.Closed;
                this.connect(this._connectOptions!);
                if (this._autoReconnect > 0) {
                    this._autoReconnect -= 1;
                }
            }, this._reconnetTimeOut);
        }
        else {
            this._state = NetNodeState.Closed;
        }
    }

        /**
     * 断开网络
     * @param code      关闭码
     * @param reason    关闭原因
     */
    close(code?: number, reason?: string) {
        this.clearTimer();
        this._listener = {};
        this._requests.length = 0;
        if (this._networkTips) {
            this._networkTips.connectTips(false);
            this._networkTips.reconnectTips(false);
            this._networkTips.requestTips(false);
        }
        if (this._socket) {
            this._socket.close(code, reason);
        }
        else {
            this._state = NetNodeState.Closed;
        }
    }

    /**
     * 发起请求，如果当前处于重连中，进入缓存列表等待重连完成后发送
     * @param buf       网络数据
     * @param force     是否强制发送
     */
    send(buf: NetData, force: boolean = false): number {
        if (this._state == NetNodeState.Working || force) {
            return this._socket!.send(buf);
        }
        else if (this._state == NetNodeState.Checking ||
            this._state == NetNodeState.Connecting) {
            this._requests.push({
                buffer: buf,
                rspCmd: "",
                rspObject: null
            });
            console.net(`当前状态为【${NetNodeStateStrs[this._state]}】,繁忙并缓冲发送数据`);
            return 0;
        }
        else {
            console.error(`当前状态为【${NetNodeStateStrs[this._state]}】,请求错误`);
            return -1;
        }
    }

    /********************** 心跳、超时相关处理 *********************/
    protected resetReceiveMsgTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer);
        }

        this._receiveMsgTimer = setTimeout(() => {
            console.warn("接收消息定时器关闭网络连接");
            this._socket!.close();
        }, this._receiveTime);
    }

    protected resetHearbeatTimer() {
        if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer);
        }

        this._keepAliveTimer = setTimeout(() => {
            console.net("网络节点保持活跃发送心跳信息");
            // this.send(this._protocolHelper!.getHearbeat());
        }, this._heartTime);
    }

    protected clearTimer() {
        if (this._receiveMsgTimer !== null) {
            clearTimeout(this._receiveMsgTimer);
        }
        if (this._keepAliveTimer !== null) {
            clearTimeout(this._keepAliveTimer);
        }
        if (this._reconnectTimer !== null) {
            clearTimeout(this._reconnectTimer);
        }
    }

    /** 是否自动重连接 */
    isAutoReconnect() {
        return this._autoReconnect != 0;
    }

    /** 拒绝重新连接 */
    rejectReconnect() {
        this._autoReconnect = 0;
        this.clearTimer();
    }
    
}