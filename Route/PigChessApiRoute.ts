import { Router,Request, Response } from "express";
import { PgSqlMgr } from "../Control/PgSqlMgr";
import * as Model from "../Model/Model";
import { RedisMgr } from "../Control/RedisMgr";
import { Defer, RedisUserType } from "../const";
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import { generateRandomCode, GetVarifyCode } from "../Control/EmailCol";
import dotenv from 'dotenv';
dotenv.config();
export const PigChessApiRoute=Router()
// const secretkey='PigChess'

async function CheckAndUpdateRefreshToken(usermessage:any,reqbody:any){
    if(usermessage.token && usermessage.token_createtime){
        const tokenAge=(new Date().getTime()-new Date(usermessage.token_createtime).getTime())/1000;
        if(tokenAge<3600*24*7-60*60){
            return usermessage.token;
        }   
        else
        {
            const refresh_token:string="Bearer "+jwt.sign({username:reqbody.UserName},process.env.REFRESH_TOKEN_SECRET!,{expiresIn:'7d'})
            const pgslres=await PgSqlMgr.getInstance()
            .Query(
                "select update_user_token($1,$2,$3)",
                [usermessage.id,usermessage.token,usermessage.token_createtime]
            );
            console.log('update_user_token: ',pgslres);
            return refresh_token;
        }
    }
    else
    {
        const refresh_token:string="Bearer "+jwt.sign({username:reqbody.UserName},process.env.REFRESH_TOKEN_SECRET!,{expiresIn:'7d'})
        const pgslres=await PgSqlMgr.getInstance()
        .Query(
            "select update_user_token($1,$2,$3)",
            [usermessage.id,usermessage.token,usermessage.token_createtime]
        );
        console.log('update_user_token: ',pgslres);
        return refresh_token;
    }
}

PigChessApiRoute.post('/PigChessApi/UserLogin',async (req:Request, res:Response) => {
    const reqbody:Model.UserLoginReq = req.body;
    let sql = "select find_user($1,$2,$3,$4,$5)";
    const resbody:Model.UserLoginRes=
    {id:Model.HttpId.UserLogin,error:Model.ErrorCode.Fali, access_token:"",refresh_token:"",userid:-1, iconurl:""};
    let defer:Defer=new Defer(()=>{
        res.send(resbody);
    })

    let redisresult=await RedisMgr.getInstance().GetRedis(RedisUserType.LoginCache+reqbody.UserName);
    if(redisresult){
        let usermessage=JSON.parse(redisresult);
        if(usermessage.password===reqbody.PassWord){
            const access_token:string="Bearer "+jwt.sign({username:reqbody.UserName},process.env.ACCESS_TOKEN_SECRET!,{expiresIn:'1h'})
            resbody.access_token=access_token;
            resbody.error=Model.ErrorCode.Success;
            resbody.userid=usermessage.id;
            resbody.iconurl=usermessage.iconurl;

            //更新长效token和token_createtime
            usermessage.token_createtime=new Date().toISOString();
            resbody.refresh_token=await CheckAndUpdateRefreshToken(usermessage,reqbody);

            usermessage.token=resbody.refresh_token;
            await RedisMgr.getInstance().SetRedisExpire(RedisUserType.LoginCache+reqbody.UserName, JSON.stringify(usermessage),43200);
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
                // const tokenStr:string="Bearer "+jwt.sign({username:reqbody.UserName},secretkey,{expiresIn:'1h'})
                const access_token:string="Bearer "+jwt.sign({username:reqbody.UserName},process.env.ACCESS_TOKEN_SECRET!,{expiresIn:'1h'})
                resbody.error=Model.ErrorCode.Success;
                resbody.access_token=access_token;
                resbody.userid=userData.id;
                resbody.iconurl=userData.iconurl;

                //更新长效token和token_createtime
                userData.token_createtime=new Date().toISOString();
                resbody.refresh_token=await CheckAndUpdateRefreshToken(userData,reqbody)
                userData.token=resbody.refresh_token;
                // defer.dispose();
                //缓存用户登录信息，设置过期时间12小时
                await RedisMgr.getInstance().SetRedisExpire(RedisUserType.LoginCache+reqbody.UserName, JSON.stringify(userData),43200);
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
            await RedisMgr.getInstance().SetRedisExpire(RedisUserType.RegisteredVarifyCode+reqbody.Email,code,180)
            break;
        case Model.VarifyPurpose.UpdatePassword:
            await RedisMgr.getInstance().SetRedisExpire(RedisUserType.UpdatePasswordVarifyCode+reqbody.Email,code,180)
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