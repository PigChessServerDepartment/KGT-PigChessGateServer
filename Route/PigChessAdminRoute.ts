import { Router, Request, Response } from "express";
import { Request as JWTRequest } from 'express-jwt';
import { PgSqlMgr } from "../Control/PgSqlMgr";
import * as Model from "../Model/Model";
import { RedisMgr } from "../Control/RedisMgr";
import { Defer, RedisSystemType, RedisUserType } from "../const";
import * as SqlModel from "../Model/SqlModel";
import { create } from "ts-node";
import { SqlFunction } from "../Function/SqlFunction";
import { ConstFunction } from "../Function/ConstFunction";

let sqlfunction = new SqlFunction();
let constfunction = new ConstFunction();

export const PigChessAdminRoute = Router()

PigChessAdminRoute.post('/PigChessAdmin/UpdateUserAreaData', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.UpdateUserAreaDataReq;
    const resbody: Model.UpdateUserAreaDataRes = {
        id: Model.HttpId.UpdateUserAreaData,
        error: Model.ErrorCode.Fali,
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })
    let sqlres = await sqlfunction.UpdateUserAreaData(reqbody);
    if (!sqlres || sqlres.rowCount === 0) { }
    else {
        // const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
        const result = JSON.parse(sqlres.rows[0].update_pigchessarea_data) as SqlModel.SqlAllRes
        switch (result.errorcode) {
            case SqlModel.SqlErrorCode.Success:
                resbody.error = Model.ErrorCode.Success;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error = Model.ErrorCode.Fali;
                break;
        }
    }
})

PigChessAdminRoute.post('/PigChessAdmin/UpdateUserData', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.UpdateUserDataReq;
    const resbody: Model.UpdateUserDataRes = {
        id: Model.HttpId.UpdateUserData,
        error: Model.ErrorCode.Fali,
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })
    let sql = "select update_user_data($1,$2,$3,$4,$5,$6,$7,$8)";
    let sqlres = await PgSqlMgr.getInstance().Query(sql, [
        reqbody.p_id,
        reqbody.p_username,
        reqbody.p_password,
        reqbody.p_new_username,
        reqbody.p_new_email,
        reqbody.p_new_phone,
        reqbody.p_new_nickname,
        reqbody.p_new_iconurl
    ]);
    if (!sqlres || sqlres.rowCount === 0) { }
    else {
        const result = JSON.parse(sqlres.rows[0].update_user_data) as SqlModel.SqlAllRes
        // const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
        switch (result.errorcode) {
            case SqlModel.SqlErrorCode.Success:
                resbody.error = Model.ErrorCode.Success;
                //base64处理,待写
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error = Model.ErrorCode.Fali;
                break;
        }
    }
});

PigChessAdminRoute.post('/PigChessAdmin/InsertFriendApply', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.InsertFriendApplyReq;
    const resbody: Model.InsertFriendApplyRes = {
        id: Model.HttpId.InsertFriendApply,
        error: Model.ErrorCode.Fali,
        errordetail: ""
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })
    let sql = "select insert_friend_apply($1,$2,$3,$4,$5,$6)";
    let sqlres = await PgSqlMgr.getInstance().Query(sql, [
        reqbody.from_userid,
        reqbody.to_userid,
        reqbody.apply_from_area,
        reqbody.apply_to_area,
        reqbody.from_playername,
        reqbody.to_playername
    ]);
    if (!sqlres || sqlres.rowCount === 0) { }
    else {
        const result = JSON.parse(sqlres.rows[0].insert_friend_apply) as SqlModel.SqlAllRes
        // const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
        switch (result.errorcode) {
            case SqlModel.SqlErrorCode.Success:
                resbody.error = Model.ErrorCode.Success;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error = Model.ErrorCode.Fali;
                resbody.errordetail = result.error;
                break;
        }
    }
});

PigChessAdminRoute.post('/PigChessAdmin/UpdateFriendApplyStatus', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.UpdateFriendApplyStatusReq;
    const resbody: Model.UpdateFriendApplyStatusRes = {
        id: Model.HttpId.UpdateFriendApplyStatus,
        error: Model.ErrorCode.Fali,
        errordetail: ""
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })

    let sql = "select update_friend_apply_status($1,$2,$3,$4,$5,$6,$7)";
    let sqlres = await PgSqlMgr.getInstance().Query(sql, [
        reqbody.from_userid,
        reqbody.to_userid,
        reqbody.apply_from_area,
        reqbody.apply_to_area,
        reqbody.from_playername,
        reqbody.to_playername,
        reqbody.new_status
    ]);
    if (!sqlres || sqlres.rowCount === 0) { }
    else {
        const result = JSON.parse(sqlres.rows[0].update_friend_apply_status) as SqlModel.SqlAllRes
        // const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
        switch (result.errorcode) {
            case SqlModel.SqlErrorCode.Success:
                resbody.error = Model.ErrorCode.Success;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error = Model.ErrorCode.Fali;
                resbody.errordetail = result.error;
                break;
        }
    }
});

PigChessAdminRoute.post('/PigChessAdmin/SearchFriendApplyTable', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.SearchFriendApplyTableReq;
    const resbody: Model.SearchFriendApplyTableRes = {
        id: Model.HttpId.SearchFriendApplyTable,
        error: Model.ErrorCode.Fali,
        errordetail: "",
        applylist: [],
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })

    let sql = "select search_friend_apply_table($1,$2,$3)";
    let sqlres = await PgSqlMgr.getInstance().Query(sql, [
        reqbody.to_userid,
        reqbody.to_playername,
        reqbody.apply_to_area
    ]);
    if (!sqlres || sqlres.rowCount === 0) { }
    else {
        const result = JSON.parse(sqlres.rows[0].search_friend_apply_table) as SqlModel.SqlAllRes
        // const result=JSON.parse(sqlres.rows[0])as SqlModel.SqlAllRes
        switch (result.errorcode) {
            case SqlModel.SqlErrorCode.Success:
                resbody.error = Model.ErrorCode.Success;
                resbody.applylist = result.data;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error = Model.ErrorCode.Fali;
                resbody.errordetail = result.error;
                break;
        }
    }
})

PigChessAdminRoute.post('/PigChessAdmin/FindAreaPlayername', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.FindAreaPlayernameReq;
    const resbody: Model.FindAreaPlayernameRes = {
        id: Model.HttpId.FindAreaPlayername,
        error: Model.ErrorCode.Fali,
        errordetail: "",
        playerlist: [],
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })

    let sql = "select find_area_playername($1,$2)";
    let sqlres = await PgSqlMgr.getInstance().Query(sql, [
        reqbody.playername,
        reqbody.area
    ]);
    if (!sqlres || sqlres.rowCount === 0) { }
    else {
        const result = JSON.parse(sqlres.rows[0].find_area_playername) as SqlModel.SqlAllRes
        switch (result.errorcode) {
            case SqlModel.SqlErrorCode.Success:
                resbody.error = Model.ErrorCode.Success;
                resbody.playerlist = result.data;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error = Model.ErrorCode.Fali;
                resbody.errordetail = result.error;
                break;
        }
    }
})

PigChessAdminRoute.post('/PigChessAdmin/System/AreaPlayerDataTraceBack', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.AreaPlayerDataTraceBackReq;
    const resbody: Model.AreaPlayerDataTraceBackRes = {
        id: Model.HttpId.AreaPlayerDataTraceBack,
        error: Model.ErrorCode.Fali,
        errordetail: "",
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })
    let auth=constfunction.CheckReqAuthValid(req.auth);
    if(!auth){
        resbody.error=Model.ErrorCode.UnauthorizedError;
        return;
    }

    let sql = "select area_player_data_traceback($1,$2,$3,$4)";
    let sqlres = await PgSqlMgr.getInstance().Query(sql, [
        reqbody.playername,
        reqbody.area,
        reqbody.pre_hours,
        auth.userid
    ]);
    if (!sqlres || sqlres.rowCount === 0) { }
    else {
        const result = JSON.parse(sqlres.rows[0].area_player_data_traceback) as SqlModel.SqlAllRes
        switch (result.errorcode) {
            case SqlModel.SqlErrorCode.Success:
                resbody.error = Model.ErrorCode.Success;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error = Model.ErrorCode.Fali;
                resbody.errordetail = result.error;
                break;
        }
    }
})

PigChessAdminRoute.post('/PigChessAdmin/System/SelectAreaPlayerHistory', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.SelectAreaPlayerHistoryReq;
    const resbody: Model.SelectAreaPlayerHistoryRes = {
        id: Model.HttpId.SelectAreaPlayerHistory,
        error: Model.ErrorCode.Fali,
        errordetail: "",
        historylist: [],
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })
    let auth=constfunction.CheckReqAuthValid(req.auth);
    if(!auth){
        resbody.error=Model.ErrorCode.UnauthorizedError;
        return;
    }
    let sql = "select select_area_player_history($1,$2,$3)";
    let sqlres = await PgSqlMgr.getInstance().Query(sql, [
        reqbody.playername,
        reqbody.area,
        auth.userid
    ]);
    if (!sqlres || sqlres.rowCount === 0) { }
    else {
        const result = JSON.parse(sqlres.rows[0].select_area_player_history) as SqlModel.SqlAllRes
        switch (result.errorcode) {
            case SqlModel.SqlErrorCode.Success:
                resbody.error = Model.ErrorCode.Success;
                resbody.historylist = result.data;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error = Model.ErrorCode.Fali;
                resbody.errordetail = result.error;
                break;
        }
    }
});
// ================================================
// 自动添加 - 2026-01-20 20:08:06
// ================================================
PigChessAdminRoute.post('/PigChessAdmin/System/InsertSystemEmail', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.InsertSystemEmailReq;
    const resbody: Model.InsertSystemEmailRes = {
        id: Model.HttpId.InsertSystemEmail,
        error: Model.ErrorCode.Fali,
        email_id: -1,
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })
    let sql = "select insert_system_email($1,$2,$3,$4,$5,$6)";
    let sqlres = await PgSqlMgr.getInstance().Query(sql, [
        reqbody.keep_days,
        reqbody.to_area,
        reqbody.email_content,
        reqbody.all_count,
        reqbody.stuff_json,
        reqbody.type
    ]);
    let email_id: number = 0;
    if (!sqlres || sqlres.rowCount === 0) { }
    else {
        const result = JSON.parse(sqlres.rows[0].insert_system_email) as SqlModel.SqlAllRes
        switch (result.errorcode) {
            case SqlModel.SqlErrorCode.Success:
                resbody.error = Model.ErrorCode.Success;
                resbody.email_id = email_id;
                email_id = result.data;
                let redisres: boolean;

                redisres = await RedisMgr.getInstance().SetRedisExpire(
                    RedisSystemType.SystemEmailId + email_id + RedisSystemType.SystemEmailArea + reqbody.to_area,
                    JSON.stringify({
                        email_id: email_id,
                        create_time: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        keep_days: reqbody.keep_days,
                        to_area: reqbody.to_area,
                        email_content: reqbody.email_content,
                        all_count: reqbody.all_count,
                        send_count: 0,
                        status: 0,
                        // bitmap:Array(10000).fill(BigInt(0)),
                        stuff_json: reqbody.stuff_json,
                        type: reqbody.type
                    }), reqbody.keep_days * 24 * 60 * 60);

                redisres = redisres || await RedisMgr.getInstance().InitBitmap(RedisSystemType.SystemEmailId + email_id + RedisSystemType.SystemEmailArea + reqbody.to_area + RedisSystemType.SystemEmailBitmap, 64000);

                // if(!redisres) resbody.error=Model.ErrorCode.Fali;
                let old_emailidmap: any | null = await RedisMgr.getInstance().GetRedis(RedisSystemType.SystemEmailIdList);
                if (old_emailidmap) {
                    let emailidmap: Map<number, number[]> = JSON.parse(old_emailidmap) as Map<number, number[]>;
                    let emailidlist: number[] | undefined = emailidmap.get(reqbody.to_area);
                    if (!emailidlist) emailidlist = [];
                    emailidlist.push(email_id);
                    emailidmap.set(reqbody.to_area, emailidlist);
                    redisres = await RedisMgr.getInstance().SetRedis(RedisSystemType.SystemEmailIdList, JSON.stringify(emailidmap));
                }
                else {
                    let emailidmap: Map<number, number[]> = new Map<number, number[]>();
                    let emailidlist: number[] = [];
                    emailidlist.push(email_id);
                    emailidmap.set(reqbody.to_area, emailidlist);
                    redisres = await RedisMgr.getInstance().SetRedis(RedisSystemType.SystemEmailIdList, JSON.stringify(emailidmap));
                }
                // if(!redisres) resbody.error=Model.ErrorCode.Fali;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error = Model.ErrorCode.Fali;
                break;
        }
    }
});
// ================================================
// 自动添加 - 2026-01-28 08:10:27
// ================================================
PigChessAdminRoute.post('/PigChessAdmin/GetSystemEmail', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.GetSystemEmailReq;
    const resbody: Model.GetSystemEmailRes = {
        id: Model.HttpId.GetSystemEmail,
        error: Model.ErrorCode.Fali,
        email: [],
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })
    let auth=constfunction.CheckReqAuthValid(req.auth);
    if(!auth){
        resbody.error=Model.ErrorCode.UnauthorizedError;
        return;
    }
    let redisres: string | null = await RedisMgr.getInstance().GetRedis(RedisSystemType.SystemEmailIdList);
    if (!redisres) {
        return;
    }
    let emailidmap: Map<number, number[]> = JSON.parse(redisres) as Map<number, number[]>;
    let emailidlist: number[] | undefined = emailidmap.get(reqbody.area);
    if (!emailidlist) {
        return;
    }
    let emaillist: Model.ResEmail[] = [];
    for (let emailid of emailidlist) {
        let emailjsonstr: string | null = await RedisMgr.getInstance().GetRedis(RedisSystemType.SystemEmailId + emailid + RedisSystemType.SystemEmailArea + reqbody.area);
        if (emailjsonstr) {

            let emailjson: JSON = JSON.parse(emailjsonstr) as JSON;
            let is_receive: number | null = await RedisMgr.getInstance().GetBitmapBitSafe(
                RedisSystemType.SystemEmailId + emailid + RedisSystemType.SystemEmailArea + reqbody.area + RedisSystemType.SystemEmailBitmap,
                64000, auth.userid);
            if (is_receive === null) is_receive = 0;
            let resemail: Model.ResEmail = {
                emailjson: emailjson,
                is_receive_stuff: is_receive
            }
            emaillist.push(resemail);
        }
    }
    resbody.error = Model.ErrorCode.Success;
    resbody.email = emaillist;
});
// ================================================
// 自动添加 - 2026-01-28 09:37:13
// ================================================
PigChessAdminRoute.post('/PigChessAdmin/ReceiveSystemEmailStuff', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.ReceiveSystemEmailStuffReq;
    const resbody: Model.ReceiveSystemEmailStuffRes = {
        id: Model.HttpId.ReceiveSystemEmailStuff,
        error: Model.ErrorCode.Fali
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })
    let auth=constfunction.CheckReqAuthValid(req.auth);
    if(!auth){
        resbody.error=Model.ErrorCode.UnauthorizedError;
        return;
    }
    let emailjsonstr: string | null = await RedisMgr.getInstance().GetRedis(RedisSystemType.SystemEmailId + reqbody.emailid + RedisSystemType.SystemEmailArea + reqbody.area);
    if (!emailjsonstr) return;
    let emailjson: any = JSON.parse(emailjsonstr) as any;

    // let is_receive = constfunction.SystemEmailCheckStuffIsReceive(emailjson.bitmap, reqbody.userid);
    let is_receive=await RedisMgr.getInstance().GetBitmapBitSafe(
        RedisSystemType.SystemEmailId + reqbody.emailid + RedisSystemType.SystemEmailArea + reqbody.area + RedisSystemType.SystemEmailBitmap,
        64000, auth.userid
    );
    if (is_receive==1) {
        resbody.error = Model.ErrorCode.StuffAlreadyReceived;
        return;
    }
    else if (is_receive==0) {
        let stuff: Model.stuff = emailjson.stuff_json;
        let sql = "select receive_system_email_stuff($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)";
        let sqlres = await PgSqlMgr.getInstance().Query(sql, [
            reqbody.emailid,
            reqbody.area,
            auth.userid,
            stuff.coin,
            stuff.diamond,
            stuff.pigcoin,
            stuff.rankpoint,
            stuff.exppoint,
            stuff.S00,
            stuff.S01
        ]);
        if (!sqlres || sqlres.rowCount === 0) { }
        else {
            const result = JSON.parse(sqlres.rows[0].receive_system_email_stuff) as SqlModel.SqlAllRes
            switch (result.errorcode) {
                case SqlModel.SqlErrorCode.Success:
                    resbody.error = Model.ErrorCode.Success;
                    // emailjson.bitmap = constfunction.SystemEmailSetStuffReceived(emailjson.bitmap, reqbody.userid);
                    // let resdis_system_email_bitmap_update:boolean=await RedisMgr.getInstance().SetRedis(
                    //     RedisSystemType.SystemEmailId+reqbody.emailid+RedisSystemType.SystemEmailArea+reqbody.area,
                    //     JSON.stringify(emailjson)
                    // );
                    // RedisMgr.getInstance().SetRedis(
                    //     RedisSystemType.SystemEmailId + reqbody.emailid + RedisSystemType.SystemEmailArea + reqbody.area,
                    //     JSON.stringify(emailjson)
                    // );
                    await RedisMgr.getInstance().SetBitmapBitSafe(
                        RedisSystemType.SystemEmailId + reqbody.emailid + RedisSystemType.SystemEmailArea + reqbody.area + RedisSystemType.SystemEmailBitmap,
                        64000, reqbody.userid, 1
                    );
                    break;
                case SqlModel.SqlErrorCode.Fali:
                    console.error('SQL Error:', result.error);
                    resbody.error = Model.ErrorCode.Fali;
                    break;
            }
        }
    }
    else{
        resbody.error = Model.ErrorCode.Fali;
    }
});
// ================================================
// 自动添加 - 2026-01-28 15:21:22
// ================================================
PigChessAdminRoute.post('/PigChessAdmin/System/InsertAreaPlayerEmail', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.InsertAreaPlayerEmailReq;
    const resbody: Model.InsertAreaPlayerEmailRes = {
        id: Model.HttpId.InsertAreaPlayerEmail,
        error: Model.ErrorCode.Fali,
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })
    let sql = "select insert_area_player_email($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)";
    let sqlres = await PgSqlMgr.getInstance().Query(sql, [
        reqbody.keep_days,
        reqbody.from_userid,
        reqbody.to_userid,
        reqbody.from_playername,
        reqbody.to_playername,
        reqbody.from_area,
        reqbody.to_area,
        reqbody.email_content,
        reqbody.status,
        reqbody.type,
        reqbody.stuff_json
    ]);
    if (!sqlres || sqlres.rowCount === 0) { }
    else {
        const result = JSON.parse(sqlres.rows[0].insert_area_player_email) as SqlModel.SqlAllRes
        switch (result.errorcode) {
            case SqlModel.SqlErrorCode.Success:
                resbody.error = Model.ErrorCode.Success;
                let emailid = result.data;
                let redisres: boolean;

                redisres = await RedisMgr.getInstance().SetRedisExpire(
                    RedisUserType.UserEmailId + emailid + RedisUserType.UserEmailArea + reqbody.to_area,
                    JSON.stringify({
                        email_id: emailid,
                        create_time: new Date(new Date().getTime() + 8 * 60 * 60 * 1000).toISOString().replace('T', ' ').split('.')[0],
                        keep_days: reqbody.keep_days,
                        from_userid: reqbody.from_userid,
                        to_userid: reqbody.to_userid,
                        from_playername: reqbody.from_playername,
                        to_playername: reqbody.to_playername,
                        from_area: reqbody.from_area,
                        to_area: reqbody.to_area,
                        email_content: reqbody.email_content,
                        status: reqbody.status,
                        type: reqbody.type,
                        stuff_json: reqbody.stuff_json,
                    }), reqbody.keep_days * 24 * 60 * 60);
                // if(!redisres) resbody.error=Model.ErrorCode.Fali;
                let old_emailidmap: any | null = await RedisMgr.getInstance().GetRedis(RedisUserType.UserEmailIdList + reqbody.to_userid);
                if (old_emailidmap) {
                    let emailidmap: Map<number, number[]> = JSON.parse(old_emailidmap) as Map<number, number[]>;
                    let emailidlist: number[] | undefined = emailidmap.get(reqbody.to_area);
                    if (!emailidlist) emailidlist = [];
                    emailidlist.push(emailid);
                    emailidmap.set(reqbody.to_area, emailidlist);
                    redisres = await RedisMgr.getInstance().SetRedis(RedisUserType.UserEmailIdList + reqbody.to_userid, JSON.stringify(emailidmap));
                }
                else {
                    let emailidmap: Map<number, number[]> = new Map<number, number[]>();
                    let emailidlist: number[] = [];
                    emailidlist.push(emailid);
                    emailidmap.set(reqbody.to_area, emailidlist);
                    redisres = await RedisMgr.getInstance().SetRedis(RedisUserType.UserEmailIdList + reqbody.to_userid, JSON.stringify(emailidmap));
                }
                // if(!redisres) resbody.error=Model.ErrorCode.Fali;
                break;
            case SqlModel.SqlErrorCode.Fali:
                console.error('SQL Error:', result.error);
                resbody.error = Model.ErrorCode.Fali;
                break;
        }
    }
});
// ================================================
// 自动添加 - 2026-01-28 16:26:34
// ================================================
PigChessAdminRoute.post('/PigChessAdmin/GetAreaPlayerEmail', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.GetAreaPlayerEmailReq;
    const resbody: Model.GetAreaPlayerEmailRes = {
        id: Model.HttpId.GetAreaPlayerEmail,
        error: Model.ErrorCode.Success,
        email: [],
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })

    let auth=constfunction.CheckReqAuthValid(req.auth);
    if(!auth){
        resbody.error=Model.ErrorCode.UnauthorizedError;
        return;
    }

    let redisres: string | null = await RedisMgr.getInstance().GetRedis(RedisUserType.UserEmailIdList + auth.userid);
    if (!redisres) {
        return;
    }
    let emailidmap: Map<number, number[]> = JSON.parse(redisres) as Map<number, number[]>;
    let emailidlist: number[] | undefined = emailidmap.get(reqbody.area);
    if (!emailidlist) {
        return;
    }
    let emaillist: Model.ResEmail[] = [];
    let end = reqbody.limit_from + reqbody.limit;
    if (end > emailidlist.length) end = emailidlist.length;
    for (let i = reqbody.limit_from; i < end; i++) {
        let emailid = emailidlist[i];
        let emailjsonstr: string | null = await RedisMgr.getInstance().GetRedis(RedisUserType.UserEmailId + emailid + RedisUserType.UserEmailArea + reqbody.area);

        if (emailjsonstr) {

            let emailjson: JSON = JSON.parse(emailjsonstr) as JSON;
            let is_receive = 0;
            if ('status' in emailjson) {
                is_receive = ((emailjson as any).status);
            }
            let resemail: Model.ResEmail = {
                emailjson: emailjson,
                is_receive_stuff: is_receive
            }
            emaillist.push(resemail);
        }
    }
    resbody.error = Model.ErrorCode.Success;
    resbody.email = emaillist;
});
// ================================================
// 自动添加 - 2026-01-28 16:41:57
// ================================================
PigChessAdminRoute.post('/PigChessAdmin/ReceiveAreaPlayerEmailStuff', async (req: JWTRequest, res: Response) => {
    const reqbody = req.body as Model.ReceiveAreaPlayerEmailStuffReq;
    const resbody: Model.ReceiveAreaPlayerEmailStuffRes = {
        id: Model.HttpId.ReceiveAreaPlayerEmailStuff,
        error: Model.ErrorCode.Fali
    }
    let defer: Defer = new Defer(() => {
        res.send(JSON.stringify(resbody));
    })

    let auth=constfunction.CheckReqAuthValid(req.auth);
    if(!auth){
        resbody.error=Model.ErrorCode.UnauthorizedError;
        return;
    }
    let emailjsonstr: string | null = await RedisMgr.getInstance().GetRedis(RedisUserType.UserEmailId + reqbody.emailid + RedisUserType.UserEmailArea + reqbody.area);
    if (!emailjsonstr) return;
    let emailjson: any = JSON.parse(emailjsonstr) as any;
    if ('status' in emailjson) {
        let is_receive = ((emailjson as any).status === 1);
        if (is_receive) {
            resbody.error = Model.ErrorCode.StuffAlreadyReceived;
            return;
        }
        else {
            let stuff: Model.stuff = emailjson.stuff_json;
            let sql = "select receive_area_player_email_stuff($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)";
            let sqlres = await PgSqlMgr.getInstance().Query(sql, [
                reqbody.emailid,
                reqbody.area,
                auth.userid,
                stuff.coin,
                stuff.diamond,
                stuff.pigcoin,
                stuff.rankpoint,
                stuff.exppoint,
                stuff.S00,
                stuff.S01
            ]);
            if (!sqlres || sqlres.rowCount === 0) { }
            else {
                const result = JSON.parse(sqlres.rows[0].receive_area_player_email_stuff) as SqlModel.SqlAllRes
                switch (result.errorcode) {
                    case SqlModel.SqlErrorCode.Success:
                        resbody.error = Model.ErrorCode.Success;
                        emailjson.status = 1;

                        RedisMgr.getInstance().SetRedis(
                            RedisUserType.UserEmailId + reqbody.emailid + RedisUserType.UserEmailArea + reqbody.area,
                            JSON.stringify(emailjson)
                        );

                        break;
                    case SqlModel.SqlErrorCode.Fali:
                        console.error('SQL Error:', result.error);
                        resbody.error = Model.ErrorCode.Fali;
                        break;
                }
            }
        }
    }
});
