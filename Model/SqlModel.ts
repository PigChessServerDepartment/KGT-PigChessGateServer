export enum SqlErrorCode{
    Fali=0,
    Success=1,
}

export interface UpdateUserAreaDataReq{
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

export interface UpdateUserDataReq{
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

export interface UpdateUserPasswordReq{
    p_email: string,
    p_new_password: string,
}

export interface SqlAllRes{
    errorcode:number;
    error:string;
}