import { GateServerErrorCode } from "./ErrorCode";

export { GateServerErrorCode as ErrorCode } from "./ErrorCode";
type ErrorCode=GateServerErrorCode;

export enum HttpId{
    RouteError=400,

    UserLogin=10001,
    UserRegistered=10002,
    VarifyCode=10003,
    UpdateUserAreaData=10004,
    UpdateUserData=10005,
    UpdateUserPassword=10006,
    UpdateUserAccessToken=10007,


    InsertFriendApply=20001,
    UpdateFriendApplyStatus=20002,
    SearchFriendApplyTable=20003,
    FindAreaPlayername=20004,

    AreaPlayerDataTraceBack=30001,
    SelectAreaPlayerHistory=30002,
    InsertSystemEmail=30003,
}
export enum VarifyPurpose{
    Registered=1,
    UpdatePassword=2,
}
export interface RouteErrorRes{
    id:HttpId;
    error:ErrorCode
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

export interface InsertFriendApplyReq{
    id:HttpId;
    from_userid:number;
    to_userid:number;
    apply_from_area:string;
    apply_to_area:string;
    from_playername:string;
    to_playername:string;
}

export interface InsertFriendApplyRes{
    id:HttpId;
    error:ErrorCode;
    errordetail:string;
}

export interface UpdateFriendApplyStatusReq{
    id:HttpId;
    from_userid:number;
    to_userid:number;
    apply_from_area:string;
    apply_to_area:string;
    from_playername:string;
    to_playername:string;
    new_status:number;
}

export interface UpdateFriendApplyStatusRes{
    id:HttpId;
    error:ErrorCode;
    errordetail:string;
}

export interface SearchFriendApplyTableReq{
    id:HttpId;
    to_userid:number;
    to_playername:string;
    apply_to_area:string;
}

export interface SearchFriendApplyTableRes{
    id:HttpId;
    error:ErrorCode;
    errordetail:string;
    applylist:JSON[];
}

export interface FindAreaPlayernameReq{
    id:HttpId;
    playername:string;
    area:number;
}

export interface FindAreaPlayernameRes{
    id:HttpId;
    error:ErrorCode;
    errordetail:string;
    playerlist:JSON[];
}

export interface AreaPlayerDataTraceBackReq{
    id:HttpId;
    playername:string;
    area:number;
    pre_hours:number;
    userid:number;
}

export interface AreaPlayerDataTraceBackRes{
    id:HttpId;
    error:ErrorCode;
    errordetail:string;
}

export interface SelectAreaPlayerHistoryReq{
    id:HttpId;
    playername:string;
    area:number;
    userid:number;
}

export interface SelectAreaPlayerHistoryRes{
    id:HttpId;
    error:ErrorCode;
    errordetail:string;
    historylist:JSON[];
}
// ================================================
// 自动添加 - 2026-01-20 05:22:00
// ================================================
export interface InsertSystemEmailReq {
    id:HttpId;
    keep_days:number;
    to_area:number;
    email_content:string;
    all_count:number;
    stuff_json:JSON;
    type:number;
}
export interface InsertSystemEmailRes {
    id:HttpId;
    error:ErrorCode;
    email_id:number;
}
