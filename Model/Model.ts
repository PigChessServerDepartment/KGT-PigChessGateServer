import { GateServerErrorCode } from "./ErrorCode";

export { GateServerErrorCode as ErrorCode } from "./ErrorCode";
type ErrorCode=GateServerErrorCode;

export enum HttpId{
    UserLogin=10001,
    UserRegistered=10002,
    VarifyCode=10003,
    UpdateUserAreaData=10004,
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
    tokenstr: string;
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