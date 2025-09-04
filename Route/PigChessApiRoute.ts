import { Router,Request, Response } from "express";
import { PgSqlMgr } from "../Control/PgSqlMgr";
import * as Model from "../Model/Model";
import { RedisMgr } from "../Control/RedisMgr";
import { Defer, RedisUserType } from "../const";
import jwt from 'jsonwebtoken';
import { generateRandomCode, GetVarifyCode } from "../Control/EmailCol";
export const PigChessApiRoute=Router()
const secretkey='PigChess'

PigChessApiRoute.post('/PigChessApi/UserLogin',async (req:Request, res:Response) => {
    const reqbody:Model.UserLoginReq = req.body;
    let sql = "select find_user($1,$2,$3,$4,$5)";
    const resbody:Model.UserLoginRes={id:Model.HttpId.UserLogin,error:Model.ErrorCode.Fali, tokenstr:"",userid:-1, iconurl:""};
    let defer:Defer=new Defer(()=>{
        res.send(resbody);
    })

    let redisresult=await RedisMgr.getInstance().GetRedis(RedisUserType.LoginCache+reqbody.UserName);
    if(redisresult){
        let usermessage=JSON.parse(redisresult);
        if(usermessage.password===reqbody.PassWord){
            const tokenStr:string="Bearer "+jwt.sign({username:reqbody.UserName},secretkey,{expiresIn:'1h'})
            resbody.tokenstr=tokenStr;
            resbody.error=Model.ErrorCode.Success;
            resbody.userid=usermessage.id;
            resbody.iconurl=usermessage.iconurl;
            return;
        }
    }
    PgSqlMgr.getInstance()
    .Query(sql, [reqbody.uid, reqbody.UserName, reqbody.Email, reqbody.Phone, reqbody.PassWord])
    .then(async(sqlresult)=>{
        if(!sqlresult || sqlresult.rowCount===0){}
        else
        {
            const userData = JSON.parse(sqlresult.rows[0])
            if(userData.exits===1)
            {
                const tokenStr:string="Bearer "+jwt.sign({username:reqbody.UserName},secretkey,{expiresIn:'1h'})
                resbody.error=Model.ErrorCode.Success;
                resbody.tokenstr=tokenStr;
                resbody.userid=userData.id;
                resbody.iconurl=userData.iconurl;
                await RedisMgr.getInstance().SetRedisExpire(RedisUserType.LoginCache+reqbody.UserName, JSON.stringify(sqlresult.rows[0]),43200);
            }
        }
        defer.dispose();
    })
    .catch((error) => {
            console.error('SQL Execution Error:', error);
            defer.dispose();
    });
});

PigChessApiRoute.post('/PigChessApi/UserRegistered', async(req:Request, res:Response) => {
    const reqbody:Model.UserRegisteredReq= req.body;
    const resbody:Model.UserRegisteredRes={id:Model.HttpId.UserRegistered, error:Model.ErrorCode.Fali};

    let defer:Defer=new Defer(()=>{
        res.send(resbody);
    })

    const redisresult= await RedisMgr.getInstance().GetRedis(RedisUserType.RegisteredVarifyCode+reqbody.Email)
    if(redisresult && redisresult === reqbody.VarifyCode) {
        let sql="select insert_user($1, $2, $3, $4, $5)";
        PgSqlMgr.getInstance()
        .Query(sql, [reqbody.UserName, reqbody.Email, reqbody.PassWord, reqbody.NickName, reqbody.Phone])
        .then((sqlresult) => {
            if (!sqlresult || sqlresult.rowCount===0) {}
            else
            {
                resbody.error=Model.ErrorCode.Success;
            }
            defer.dispose();
        })
        .catch((error) => {
            console.error('SQL Execution Error:', error);
            defer.dispose();
        });
    }
    else
    {
        resbody.error=Model.ErrorCode.VarifyCodeErr;
        defer.dispose();
    }
});


PigChessApiRoute.post('/PigChessApi/UpdateUserPassword', async(req:Request, res:Response) => {
    const reqbody:Model.UpdateUserPasswordReq= req.body;
    const resbody:Model.UpdateUserPasswordRes={id:Model.HttpId.UpdateUserPassword, error:Model.ErrorCode.Fali};
    
    let defer:Defer=new Defer(()=>{
        res.send(resbody);
    })
    
    const redisresult= await RedisMgr.getInstance().GetRedis(RedisUserType.UpdatePasswordVarifyCode+reqbody.p_email)
    if(redisresult && redisresult === reqbody.varify_code) {
        let sql="select update_user_password($1, $2)";
        PgSqlMgr.getInstance()
        .Query(sql, [reqbody.p_email, reqbody.p_new_password])
        .then((sqlresult) => {
            if (!sqlresult || sqlresult.rowCount===0) {}
            else
            {
                resbody.error=Model.ErrorCode.Success;
            }
            defer.dispose();
        })
        .catch((error) => {
            console.error('SQL Execution Error:', error);
            defer.dispose();
        });
    }
    else{
        resbody.error=Model.ErrorCode.VarifyCodeErr;
        defer.dispose();
    }
});

PigChessApiRoute.post('/PigChessApi/GetVarifyCode',async (req:Request, res:Response)=>{
    const reqbody:Model.VarifyCodeReq= req.body;
    const resbody:Model.VarifyCodeRes={id:Model.HttpId.VarifyCode, error:Model.ErrorCode.Fali};

    let defer:Defer=new Defer(()=>{
        res.send(resbody);
    })
    let code:string=generateRandomCode();
    switch(reqbody.Purpose){
        case Model.VarifyPurpose.Registered:
            await RedisMgr.getInstance().SetRedisExpire(RedisUserType.RegisteredVarifyCode+reqbody.Email,code,300)
            break;
        case Model.VarifyPurpose.UpdatePassword:
            await RedisMgr.getInstance().SetRedisExpire(RedisUserType.UpdatePasswordVarifyCode+reqbody.Email,code,300)
            break;
        default:
            defer.dispose();
            return;
    }
    GetVarifyCode(reqbody.Email,code,reqbody.Purpose)
    .then((result)=>{
        if(result) resbody.error=Model.ErrorCode.Success;
        defer.dispose();
    })
    .catch((error)=>{
        console.error('GetVarifyCode Error:', error);
        defer.dispose();
    })
});