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
        res.send(JSON.stringify(resbody));
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
        const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
        // const result=JSON.parse(sqlres.rows[0].update_pigchessarea_data)as SqlModel.SqlAllRes
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
        res.send(JSON.stringify(resbody));
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
        // const result=JSON.parse(sqlres.rows[0].update_user_data)as SqlModel.SqlAllRes
        const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
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

PigChessAdminRoute.post('/PigChessAdmin/InsertFriendApply', async(req:Request, res:Response) => {
    const reqbody=req.body as Model.InsertFriendApplyReq;
    const resbody:Model.InsertFriendApplyRes={
        id:Model.HttpId.InsertFriendApply,
        error:Model.ErrorCode.Fali,
        errordetail:""
    }
    let defer:Defer=new Defer(()=>{
        res.send(JSON.stringify(resbody));
    })
    let sql="select insert_friend_apply($1,$2,$3,$4,$5,$6)";
    let sqlres=await PgSqlMgr.getInstance().Query(sql,[
        reqbody.from_userid,
        reqbody.to_userid,
        reqbody.apply_from_area,
        reqbody.apply_to_area,
        reqbody.from_playername,
        reqbody.to_playername
    ]);
    if(!sqlres || sqlres.rowCount===0){}
    else
    {
        // const result=JSON.parse(sqlres.rows[0].insert_friend_apply)as SqlModel.SqlAllRes
        const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
        switch(result.errorcode)
        {
            case SqlModel.SqlErrorCode.Success:
                resbody.error=Model.ErrorCode.Success;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error=Model.ErrorCode.Fali;
                resbody.errordetail=result.error;
                break;
        }
    }
});

PigChessAdminRoute.post('/PigChessAdmin/UpdateFriendApplyStatus', async(req:Request, res:Response) => {
    const reqbody=req.body as Model.UpdateFriendApplyStatusReq;
    const resbody:Model.UpdateFriendApplyStatusRes={
        id:Model.HttpId.UpdateFriendApplyStatus,
        error:Model.ErrorCode.Fali,
        errordetail:""
    }
    let defer:Defer=new Defer(()=>{
        res.send(JSON.stringify(resbody));
    })

    let sql="select update_friend_apply_status($1,$2,$3,$4,$5,$6,$7)";
    let sqlres=await PgSqlMgr.getInstance().Query(sql,[
        reqbody.from_userid,
        reqbody.to_userid,
        reqbody.apply_from_area,
        reqbody.apply_to_area,
        reqbody.from_playername,
        reqbody.to_playername,
        reqbody.new_status
    ]);
    if(!sqlres || sqlres.rowCount===0){}
    else
    {
        // const result=JSON.parse(sqlres.rows[0].update_friend_apply_status)as SqlModel.SqlAllRes
        const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
        switch(result.errorcode)
        {
            case SqlModel.SqlErrorCode.Success:
                resbody.error=Model.ErrorCode.Success;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error=Model.ErrorCode.Fali;
                resbody.errordetail=result.error;
                break;
        }
    }
});

PigChessAdminRoute.post('/PigChessAdmin/SearchFriendApplyTable', async(req:Request, res:Response) => {
    const reqbody=req.body as Model.SearchFriendApplyTableReq;
    const resbody:Model.SearchFriendApplyTableRes={
        id:Model.HttpId.SearchFriendApplyTable,
        error:Model.ErrorCode.Fali,
        errordetail:"",
        applylist:[],
    }
    let defer:Defer=new Defer(()=>{
        res.send(JSON.stringify(resbody));
    })

    let sql="select search_friend_apply_table($1,$2,$3)";
    let sqlres=await PgSqlMgr.getInstance().Query(sql,[
        reqbody.to_userid,
        reqbody.to_playername,
        reqbody.apply_to_area
    ]);
    if(!sqlres || sqlres.rowCount===0){}
    else
    {
        // const result=JSON.parse(sqlres.rows[0].search_friend_apply_table)as SqlModel.SqlAllRes
        const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
        switch(result.errorcode)
        {
            case SqlModel.SqlErrorCode.Success:
                resbody.error=Model.ErrorCode.Success;
                resbody.applylist=result.data;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error=Model.ErrorCode.Fali;
                resbody.errordetail=result.error;
                break;
        }
    }
})