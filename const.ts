export interface RedisConnectIni
{   
    RedisPwd:string;
    RedisPort:string,
    RedisHost:string,
    ConnectNum:number
}

export class Defer {
    private func: (() => void) | null;
    constructor(func: () => void) {
      this.func = func;
      // 返回一个 Proxy 对象，拦截对 dispose 方法的访问
      return new Proxy(this, {
        get(target: Defer, prop: string | symbol) {
          if (prop === 'dispose') {
            // 返回绑定了 target 的 dispose 方法
            return target.dispose.bind(target);
          }
          // 返回其他属性
          return (target as any)[prop];
        },
      });
    }
  
    // 清理函数
    dispose(): void {
      if (this.func) {
        this.func(); // 执行传入的函数
        this.func = null; // 防止重复调用
      }
    }
  }

export enum RedisUserType{
    LoginCache="LoginCache_",
    RegisteredVarifyCode="Registered_VarifyCode_",
    UpdatePasswordVarifyCode="UpdatePassword_VarifyCode_",
    UserInfo="UserInfo_",
}

export enum RedisSystemType{
    SystemEmailId="SystemEmailId_",
    SystemEmailIdList="SystemEmailIdList_"
}