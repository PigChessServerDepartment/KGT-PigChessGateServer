import * as http from 'http';
import express, { NextFunction, Request, Response } from "express";
import bodyParser from 'body-parser';
import { expressjwt } from "express-jwt";
import { PigChessApiRoute } from './Route/PigChessApiRoute';
import { PigChessAdminRoute } from './Route/PigChessAdminRoute';
import * as Model from "./Model/Model";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { ClearTask } from './Schedule/CleanPlayerHistory';
dotenv.config();
// const secretkey='PigChess'
const app = express();
const server = new http.Server(app);

//所有post/get
app.use(bodyParser.json());
// app.use(expressjwt({ secret: process.env.ACCESS_TOKEN_SECRET!, algorithms: ['HS256'] }).unless({path:[/^\/PigChessApi\//]}))
// app.use('/PigChessAdmin',expressjwt({ secret: process.env.ACCESS_TOKEN_SECRET!, algorithms: ['HS256'] }))
// app.use('/PigChessTokenApi',expressjwt({ secret: process.env.REFRESH_TOKEN_SECRET!, algorithms: ['HS256'] }))
app.post('/PigChessTokenApi/UpdateUserAccessToken', (req: Request, res: Response) => {
    const reqbody:Model.UpdateUserAccessTokenReq = req.body;
    const resbody:Model.UpdateUserAccessTokenRes=
    {
        id:Model.HttpId.UpdateUserAccessToken,
        access_token:"Bearer " + jwt.sign({ username: reqbody.UserName }, process.env.ACCESS_TOKEN_SECRET!, { expiresIn: '1h' }),
        error:Model.ErrorCode.Fali
    }
    res.send(JSON.stringify(resbody));
});

app.use((err:Error, req:Request, res:Response, next:NextFunction) => {
    if (err.name === 'UnauthorizedError') {
        console.error(err);
        const resbody:Model.RouteErrorRes={id:Model.HttpId.RouteError,error:Model.ErrorCode.UnauthorizedError}
        res.status(401).send(JSON.stringify(resbody));
    } else {
        next(err);
    }
});
app.use(PigChessApiRoute);
app.use(PigChessAdminRoute);

function main(){
    const port = 6000;
    server.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });

    ClearTask();
    // 优雅关闭
    process.on('SIGINT', async () => {
        console.log('正在关闭服务...');
        process.exit(0);
    });
}  
main();