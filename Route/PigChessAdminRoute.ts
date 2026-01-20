import { Router,Request, Response } from "express";
import { PgSqlMgr } from "../Control/PgSqlMgr";
import * as Model from "../Model/Model";
import { RedisMgr } from "../Control/RedisMgr";
import { Defer, RedisSystemType, RedisUserType } from "../const";
import * as SqlModel from "../Model/SqlModel";
import { create } from "ts-node";

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
        // const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
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
        const result=JSON.parse(sqlres.rows[0].update_user_data)as SqlModel.SqlAllRes
        // const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
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
        const result=JSON.parse(sqlres.rows[0].insert_friend_apply)as SqlModel.SqlAllRes
        // const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
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
        const result=JSON.parse(sqlres.rows[0].update_friend_apply_status)as SqlModel.SqlAllRes
        // const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
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
        const result=JSON.parse(sqlres.rows[0].search_friend_apply_table)as SqlModel.SqlAllRes
        // const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
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

PigChessAdminRoute.post('/PigChessAdmin/FindAreaPlayername', async(req:Request, res:Response) => {
    const reqbody=req.body as Model.FindAreaPlayernameReq;
    const resbody:Model.FindAreaPlayernameRes={
        id:Model.HttpId.FindAreaPlayername,
        error:Model.ErrorCode.Fali,
        errordetail:"",
        playerlist:[],
    }
    let defer:Defer=new Defer(()=>{
        res.send(JSON.stringify(resbody));
    })
    
    let sql="select find_area_playername($1,$2)";
    let sqlres=await PgSqlMgr.getInstance().Query(sql,[
        reqbody.playername,
        reqbody.area
    ]);
    if(!sqlres || sqlres.rowCount===0){}
    else
    {
        const result=JSON.parse(sqlres.rows[0].find_area_playername)as SqlModel.SqlAllRes
        switch(result.errorcode)
        {
            case SqlModel.SqlErrorCode.Success:
                resbody.error=Model.ErrorCode.Success;
                resbody.playerlist=result.data;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error=Model.ErrorCode.Fali;
                resbody.errordetail=result.error;
                break;
        }
    }
})

PigChessAdminRoute.post('/PigChessAdmin/System/AreaPlayerDataTraceBack', async(req:Request, res:Response) => {
    const reqbody=req.body as Model.AreaPlayerDataTraceBackReq;
    const resbody:Model.AreaPlayerDataTraceBackRes={
        id:Model.HttpId.AreaPlayerDataTraceBack,
        error:Model.ErrorCode.Fali,
        errordetail:"",
    }
    let defer:Defer=new Defer(()=>{
        res.send(JSON.stringify(resbody));
    })
    let sql="select area_player_data_traceback($1,$2,$3,$4)";
    let sqlres=await PgSqlMgr.getInstance().Query(sql,[
        reqbody.playername,
        reqbody.area,
        reqbody.pre_hours,
        reqbody.userid
    ]);
    if(!sqlres || sqlres.rowCount===0){}
    else
    {
        const result=JSON.parse(sqlres.rows[0].area_player_data_traceback)as SqlModel.SqlAllRes
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
})

PigChessAdminRoute.post('/PigChessAdmin/System/SelectAreaPlayerHistory', async(req:Request, res:Response) => {
    const reqbody=req.body as Model.SelectAreaPlayerHistoryReq;
    const resbody:Model.SelectAreaPlayerHistoryRes={
        id:Model.HttpId.SelectAreaPlayerHistory,
        error:Model.ErrorCode.Fali,
        errordetail:"",
        historylist:[],
    }
    let defer:Defer=new Defer(()=>{
        res.send(JSON.stringify(resbody));
    })
    let sql="select select_area_player_history($1,$2,$3)";
    let sqlres=await PgSqlMgr.getInstance().Query(sql,[
        reqbody.playername,
        reqbody.area,
        reqbody.userid
    ]);
    if(!sqlres || sqlres.rowCount===0){}
    else
    {
        const result=JSON.parse(sqlres.rows[0].select_area_player_history)as SqlModel.SqlAllRes
        switch(result.errorcode)
        {
            case SqlModel.SqlErrorCode.Success:
                resbody.error=Model.ErrorCode.Success;
                resbody.historylist=result.data;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error=Model.ErrorCode.Fali;
                resbody.errordetail=result.error;
                break;
        }
    }
});
// ================================================
// 自动添加 - 2026-01-20 20:08:06
// ================================================
PigChessAdminRoute.post('/PigChessAdmin/System/InsertSystemEmail', async(req:Request, res:Response) => {
        const reqbody=req.body as Model.InsertSystemEmailReq;
        const resbody:Model.InsertSystemEmailRes={
            id:Model.HttpId.InsertSystemEmail,
            error:Model.ErrorCode.Fali,
            email_id:-1,
        }
        let defer:Defer=new Defer(()=>{
            res.send(JSON.stringify(resbody));
        })
    let sql="select insert_system_email($1,$2,$3,$4,$5,$6)";
    let sqlres=await PgSqlMgr.getInstance().Query(sql,[
        reqbody.keep_days,
        reqbody.to_area,
        reqbody.email_content,
        reqbody.all_count,
        reqbody.stuff_json,
        reqbody.type
    ]);
    let email_id:number=0;
    if(!sqlres || sqlres.rowCount===0){}
    else
    {
        const result=JSON.parse(sqlres.rows[0].insert_system_email)as SqlModel.SqlAllRes
        switch(result.errorcode)
        {
            case SqlModel.SqlErrorCode.Success:
                resbody.error=Model.ErrorCode.Success;
                resbody.email_id=email_id;
                email_id=result.data;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error=Model.ErrorCode.Fali;
                break;
        }
    }

    await RedisMgr.getInstance().SetRedisExpire(RedisSystemType.SystemEmailId+email_id,JSON.stringify({
        email_id:email_id,
        create_time:new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
        keep_days:reqbody.keep_days,
        to_area:reqbody.to_area,
        email_content:reqbody.email_content,
        all_count:reqbody.all_count,
        send_count:0,
        status:0,
        bitmap:Array(10000).fill(BigInt(0)),
        stuff_json:reqbody.stuff_json,
        type:reqbody.type
    }),reqbody.keep_days*24*60*60);

    let old_emailidlist:any|null=await RedisMgr.getInstance().GetRedis(RedisSystemType.SystemEmailIdList);
    if(old_emailidlist)
    {
        let emailidlist:number[]=JSON.parse(old_emailidlist);
        emailidlist.push(email_id);
        await RedisMgr.getInstance().SetRedis(RedisSystemType.SystemEmailIdList,JSON.stringify(emailidlist));
    }
    else
    {
        let emailidlist:number[]=[];
        emailidlist.push(email_id);
        await RedisMgr.getInstance().SetRedis(RedisSystemType.SystemEmailIdList,JSON.stringify(emailidlist));
    }
});
