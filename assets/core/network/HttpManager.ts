import { HttpRequest } from "./HttpRequest";
import { HttpCallback, HttpMethod } from "./NetInterface";

export class HttpMnager  implements ISingleton{

    isResident?: boolean = true;
    static module: string = "【事件管理器】";
    module: string = null!;

    private static _instance: HttpMnager;

    /** 网络管理单例对象 */
    static getInstance(): HttpMnager {
        if (!this._instance) {
            this._instance = new HttpMnager();
        }
        return this._instance;
    }

    private http:HttpRequest;

    init(){
        this.http = new HttpRequest();
        this.http.server = "";
        this.http.timeout = 10000;
    }

    /**
     * HTTP请求
     * @param msg 消息或者URL地址
     * @param data 数据
     * @param method 
     * @param onComplete 
     */
    send(msg:string,data:{[key:string]:any},method:HttpMethod = HttpMethod.POST,onComplete?: HttpCallback){
        if(method == HttpMethod.POST){
            this.http.get(msg,onComplete,data);
        } 
        else if(method == HttpMethod.GET){
            this.http.post(msg,onComplete,data)
        }
    }

}