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

export interface UpdateUserAreaDataRes{
    errorcode:number;
    error:string;
}