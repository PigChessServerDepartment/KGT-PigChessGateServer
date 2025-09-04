import { Router,Request, Response } from "express";
import { PgSqlMgr } from "../Control/PgSqlMgr";
import * as Model from "../Model/Model";
import { RedisMgr } from "../Control/RedisMgr";
import { Defer, RedisUserType } from "../const";
import * as SqlModel from "../Model/SqlModel";

export const PigChessAdminRoute=Router()

PigChessAdminRoute.post('/PigChessAdmin/UpdateUserAreaData', async(req:Request, res:Response) => {
    const reqbody=req.body as Model.UpdateUserAreaDataReq;
    const resbody:Model.UpdateUserAreaDataRes={
        id:Model.HttpId.UpdateUserAreaData,
        error:Model.ErrorCode.Fali,
    }
    let defer:Defer=new Defer(()=>{
        res.send(resbody);
    })
    let sql ="select update_pigchessarea_data($1,$2,$3,$4,$5,$6,$7,$8,$9)";
    let sqlres=await PgSqlMgr.getInstance().Query(sql,[
        reqbody.p_area_id,
        reqbody.p_user_id,
        reqbody.p_coin_change_num,
        reqbody.p_diamond_change_num,
        reqbody.p_pigcoin_change_num,
        reqbody.p_rankpoint_change_num,
        reqbody.p_exppoint_change_num,
        reqbody.p_S00_change_num,
        reqbody.p_S01_change_num
    ])
    if(!sqlres || sqlres.rowCount===0){}
    else
    {
        const result=JSON.parse(sqlres.rows[0].update_pigchessarea_data)as SqlModel.SqlAllRes
        switch(result.errorcode)
        {
            case SqlModel.SqlErrorCode.Success:
                resbody.error=Model.ErrorCode.Success;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error=Model.ErrorCode.Fali;
                break;
        }
    }
})

PigChessAdminRoute.post('/PigChessAdmin/UpdateUserData', async(req:Request, res:Response) => {
    const reqbody=req.body as Model.UpdateUserDataReq;
    const resbody:Model.UpdateUserDataRes={
        id:Model.HttpId.UpdateUserData,
        error:Model.ErrorCode.Fali,
    }
    let defer:Defer=new Defer(()=>{
        res.send(resbody);
    })
    let sql ="select update_user_data($1,$2,$3,$4,$5,$6,$7,$8)";
    let sqlres=await PgSqlMgr.getInstance().Query(sql,[
        reqbody.p_id,
        reqbody.p_username,
        reqbody.p_password,
        reqbody.p_new_username,
        reqbody.p_new_email,
        reqbody.p_new_phone,
        reqbody.p_new_nickname,
        reqbody.p_new_iconurl
    ]);
    if(!sqlres || sqlres.rowCount===0){}
    else
    {
        const result=JSON.parse(sqlres.rows[0].update_user_data)as SqlModel.SqlAllRes
        switch(result.errorcode)
        {
            case SqlModel.SqlErrorCode.Success:
                resbody.error=Model.ErrorCode.Success;
                //base64处理,待写
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error=Model.ErrorCode.Fali;
                break;
        }
    }
});