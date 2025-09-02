import { Router,Request, Response } from "express";
import { PgSqlMgr } from "../Control/PgSqlMgr";
import * as Model from "../Model/Model";
import { RedisMgr } from "../Control/RedisMgr";
import { Defer, RedisUserType } from "../const";
import * as SqlModel from "../Model/SqlModel";

export const PigChessAdminRoute=Router()

PigChessAdminRoute.post('/PigChessAdmin/UpdateUserAreaData', async(req:Request, res:Response) => {
    const data=req.body as Model.UpdateUserAreaDataReq;
    const resbody:Model.UpdateUserAreaDataRes={
        id:Model.HttpId.UpdateUserAreaData,
        error:Model.ErrorCode.Fali,
    }
    let defer:Defer=new Defer(()=>{
        res.send(resbody);
    })
    let sql ="select update_pigchessarea_data($1,$2,$3,$4,$5,$6,$7,$8,$9)";
    let sqlres=await PgSqlMgr.getInstance().Query(sql,[
        data.p_area_id,
        data.p_user_id,
        data.p_coin_change_num,
        data.p_diamond_change_num,
        data.p_pigcoin_change_num,
        data.p_rankpoint_change_num,
        data.p_exppoint_change_num,
        data.p_S00_change_num,
        data.p_S01_change_num
    ])
    if(!sqlres || sqlres.rowCount===0){}
    else
    {
        const result=JSON.parse(sqlres.rows[0].update_pigchessarea_data)as SqlModel.UpdateUserAreaDataRes
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