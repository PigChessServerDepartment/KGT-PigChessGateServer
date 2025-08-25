import * as http from 'http';
import express, { NextFunction, Request, Response } from "express";
import bodyParser from 'body-parser';
import { expressjwt } from "express-jwt";
import { PigChessApiRoute } from './Route/PigChessApiRoute';
const secretkey='PigChess'
const app = express();
const server = new http.Server(app);

//所有post/get
app.use(bodyParser.json());
app.use(expressjwt({ secret: secretkey, algorithms: ['HS256'] }).unless({path:[/^\/PigChessApi\//]}))
app.use((err:Error, req:Request, res:Response, next:NextFunction) => {
    if (err.name === 'UnauthorizedError') {
        console.error(err);
        res.status(401).send('Invalid token');
    } else {
        next(err);
    }
});
app.use(PigChessApiRoute);

function main(){
    const port = 6000;
    server.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

main();