# GateServer

* port=6000
* host=http://119.29.174.60

## id格式:
```typescript
与下面Res和Req对应
export enum HttpId{
    UserLogin=10001,
    UserRegistered=10002,
    VarifyCode=10003,
}
```

## ErrorCode格式
```typescript
export enum GateServerErrorCode{
    Fali=0,
    Success=1,
}
```

## Req格式:
```typescript

路由路径:/PigChessApi/UserLogin
export interface UserLoginReq {
    id: HttpId;
    uid: number;
    UserName: string;
    Email: string;
    NickName: string;
    Phone: string;
    PassWord: string;
}

路由路径:/PigChessApi/UserRegistered
export interface UserRegisteredReq{
    id:HttpId;
    UserName: string;
    Email: string;
    PassWord: string;
    NickName: string;
    Phone: string;
    VarifyCode: string;
}

路由路径:/PigChessApi/GetVarifyCode
export interface VarifyCodeReq{
    id:HttpId;
    Email: string;
}
```

## Res格式:
```typescript
export interface UserLoginRes{
    id:HttpId;
    error:ErrorCode;
    tokenstr: string;
    userid: number;
}

export interface UserRegisteredRes{
    id:HttpId;
    error:ErrorCode;
}

export interface VarifyCodeRes{
    id:HttpId;
    error:ErrorCode;
}
```
