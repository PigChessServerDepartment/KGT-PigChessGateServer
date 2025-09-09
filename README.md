# GateServer

* port=6000
* host=http://

## id格式:
```typescript
与下面Res和Req对应
export enum HttpId{
    RotueError=400,

    UserLogin=10001,
    UserRegistered=10002,
    VarifyCode=10003,
    UpdateUserAreaData=10004,
    UpdateUserData=10005,
    UpdateUserPassword=10006,
    UpdateUserAccessToken=10007
}
```
## 接口Token限定
```ts
要求必须在header携带access_token(有效时间1小时)
app.use('/PigChessAdmin',expressjwt({ secret: process.env.ACCESS_TOKEN_SECRET!, algorithms: ['HS256'] }))

要求必须在header携带refresh_token(有效时间7天)
app.use('/PigChessTokenApi',expressjwt({ secret: process.env.REFRESH_TOKEN_SECRET!, algorithms: ['HS256'] }))
```
---
## ErrorCode格式
```typescript
export enum GateServerErrorCode{
    Fali=0,
    Success=1,
    VarifyCodeErr=2,
    UnauthorizedError=401,
}
```
## VarifyPurpose
```ts
export enum VarifyPurpose{
    Registered=1,
    UpdatePassword=2,
}
```

# Http Req / Res 对照表 (左右两栏)

## 目录
- [RotueError = 400](#RotueError--400)
- [UserLogin = 10001](#userlogin--10001)
- [UserRegistered = 10002](#userregistered--10002)
- [VarifyCode = 10003](#varifycode--10003)
- [UpdateUserAreaData = 10004](#updateuserareadata--10004)
- [UpdateUserData = 10005](#UpdateUserData--10005)
- [UpdateUserPassword = 10006](#UpdateUserPassword--10006)
- [UpdateUserAccessToken = 10007](#UpdateUserAccessToken--10007)
---
### RotueError=400
路由错误通用id,具体错误看错误码的枚举类型
<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  export interface RotueErrorRes{
    id:HttpId;
    error:ErrorCode
}
  ```
  </div>

</div>

---


### UserLogin = 10001

```mermaid
sequenceDiagram
    participant A as 用户
    participant B as 系统
    participant C as Redis
    participant D as PgSql
    A->>B:发送UserLoginReq
    B->>C:查看缓存
    B->>B:若缓存有效则校验缓存中refresh_token(7d)
    B->>C:refresh_token过期更新缓存
    B->>D:refresh_token过期更新数据库
    B->>A:返回UserLoginRes,结束
    B->>D:若缓存无效则请求用户数据
    D->>D:校验请求
    B->>B:校验refresh_token(7d)
    D->>B:返回用户数据
    B->>C:refresh_token过期更新缓存
    B->>D:refresh_token过期更新数据库
    B->>A:返回UserLoginRes,结束

```
<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
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
  ```
  </div>

  <div style="flex:1;">

  ```ts
refresh_token长效token,7天有效期,用来获取敏感接口的access_token
access_token短效token,1小时有效期,用来访问数据增删改查的接口,每次登录会先给一次,后面过期了要通过UpdateUserAccessTokenRes重新获取
export interface UserLoginRes{
    id:HttpId;
    error:ErrorCode;
    refresh_token: string;
    access_token: string;
    userid: number;
    iconurl: string;
}
  ```
  </div>

</div>

---

### UserRegistered = 10002

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  路由路径:/PigChessApi/UserRegistered
  export interface UserRegisteredReq {
      id: HttpId;
      UserName: string;
      Email: string;
      PassWord: string;
      NickName: string;
      Phone: string;
      VarifyCode: string;
  }
  ```
  </div>

  <div style="flex:1;">

  ```ts
  export interface UserRegisteredRes {
      id: HttpId;
      error: ErrorCode;
  }
  ```
  </div>

</div>

---

### VarifyCode = 10003
```mermaid
sequenceDiagram
    participant A as 用户
    participant B as 用户邮箱
    participant C as 系统
    A->>C: 验证码请求(Purpose:VarifyPurpose)
    C->>C: 生成code记录进缓存目前设定缓存有3分钟
    C->>B: 发送验证码(varify_code)
    B->>A: 用户获取到验证码
    A->>C: 进一步调用处理接口添加验证码到Req对应属性中

```
<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  路由路径:/PigChessApi/GetVarifyCode
  export interface VarifyCodeReq{
    id:HttpId;
    Email: string;
    Purpose: VarifyPurpose;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  export interface VarifyCodeRes {
      id: HttpId;
      error: ErrorCode;
  }
  ```
  </div>

</div>

---

### UpdateUserAreaData = 10004

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
路由路径:/PigChessAdmin/UpdateUserAreaData
该方法属于同时修改一个给表项的多个数据,不用修改的直接填0就行
p_area_id是用户所在的区目前只有1区,填1就行,后续会建立区名称与区号的映射表
p_user_id为登录后获取到的用户唯一id属于必须填写的项
export interface UpdateUserAreaDataReq{
    id:HttpId;
    p_area_id: string;
    p_user_id: number;
    p_coin_change_num: number;
    p_diamond_change_num: number;
    p_pigcoin_change_num: number;
    p_rankpoint_change_num: number;
    p_exppoint_change_num: number;
    p_S00_change_num: number;
    p_S01_change_num: number;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
export interface UpdateUserAreaDataRes{
    id:HttpId;
    error:ErrorCode;
}
  ```
  </div>

</div>

---

### UpdateUserData = 10005

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
路由路径:/PigChessAdmin/UpdateUserData
export interface UpdateUserDataReq{
    id:HttpId;
    p_id : number,
    p_username:string,
    p_password:string,
    p_new_username:string,
    p_new_email:string,
    p_new_phone:string,
    p_new_nickname :string,
    p_new_iconurl:string,
    p_new_iconBase64:string
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
export interface UpdateUserDataRes{
    id:HttpId;
    error:ErrorCode;
}
  ```
  </div>

</div>

---

### UpdateUserPassword = 10006

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
路由路径:/PigChessApi/UpdateUserPassword
使用前要求先调用VarifyCode,Purpose为VarifyPurpose.UpdatePassword获取到邮箱的varify_code先
export interface UpdateUserPasswordReq{
    id:HttpId;
    p_email: string,
    p_new_password: string,
    varify_code: string,
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
export interface UpdateUserPasswordRes{
    id:HttpId;
    error:ErrorCode;
}
  ```
  </div>

</div>

---

### UpdateUserAccessToken = 10007
```mermaid
sequenceDiagram
    participant A as 用户
    participant B as 系统
    A->>B:请求access_token限定的接口
    B->>A:若返回id为RotueError(400),error为401错误码
    A->>B:应发送UpdateUserAccessTokenReq获取新的access_token使用
    B->>A:若依旧是返回错误码,则应该强制要求重新登录
    B->>A:新的access_token(1h的存活时间)

```
<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
路由路径:/PigChessTokenApi/UpdateUserAccessToken
export interface UpdateUserAccessTokenReq{
    id:HttpId;
    UserName:string;
}

  ```
  </div>

  <div style="flex:1;">

  ```ts
export interface UpdateUserAccessTokenRes{
    id:HttpId;
    access_token:string;
    error:ErrorCode;
}
  ```
  </div>

</div>

---
