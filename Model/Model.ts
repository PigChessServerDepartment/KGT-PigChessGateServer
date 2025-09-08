import { GateServerErrorCode } from "./ErrorCode";

export { GateServerErrorCode as ErrorCode } from "./ErrorCode";
type ErrorCode=GateServerErrorCode;

export enum HttpId{
    UserLogin=10001,
    UserRegistered=10002,
    VarifyCode=10003,
    UpdateUserAreaData=10004,
    UpdateUserData=10005,
    UpdateUserPassword=10006,
    UpdateUserAccessToken=10007
}
export enum VarifyPurpose{
    Registered=1,
    UpdatePassword=2,
}

export interface UserLoginReq{
    id:HttpId;
    uid: number;
    UserName: string;
    Email: string;
    NickName: string;
    Phone: string;
    PassWord: string;
}


export interface UserLoginRes{
    id:HttpId;
    error:ErrorCode;
    refresh_token: string;
    access_token: string;
    userid: number;
    iconurl: string;
}

export interface UserRegisteredReq{
    id:HttpId;
    UserName: string;
    Email: string;
    PassWord: string;
    NickName: string;
    Phone: string;
    VarifyCode: string;
}

export interface UserRegisteredRes{
    id:HttpId;
    error:ErrorCode;
}

export interface VarifyCodeReq{
    id:HttpId;
    Email: string;
    Purpose: VarifyPurpose;
}

export interface VarifyCodeRes{
    id:HttpId;
    error:ErrorCode;
}

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

export interface UpdateUserAreaDataRes{
    id:HttpId;
    error:ErrorCode;
}

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

export interface UpdateUserDataRes{
    id:HttpId;
    error:ErrorCode;
}

export interface UpdateUserPasswordReq{
    id:HttpId;
    p_email: string,
    p_new_password: string,
    varify_code: string,
}

export interface UpdateUserPasswordRes{
    id:HttpId;
    error:ErrorCode;
}

export interface UpdateUserAccessTokenReq{
    id:HttpId;
    UserName:string;
}

export interface UpdateUserAccessTokenRes{
    id:HttpId;
    access_token:string;
    error:ErrorCode;
}