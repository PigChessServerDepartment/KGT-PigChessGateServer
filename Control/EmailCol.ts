import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transport =nodemailer.createTransport({
    host:'smtp.163.com',
    port:465,
    secure:true,
    auth:{
        user:process.env.Email_User,
        pass:process.env.Email_Pass
    }
})

export function generateRandomCode() {
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += Math.floor(Math.random() * 10); // 生成一个6位数的随机验证码
    }
    return code;
}

export async function GetVarifyCode(emailto:string,uniqueId:string) {
    console.log("email is ", emailto)
    try{
        // let uniqueId = uuidv4();
        // console.log("uniqueId is ", uniqueId)
        // let text_str =  '您的验证码为'+ uniqueId +'请三分钟内完成注册'
        //发送邮件
        let mailOptions = {
            from: process.env.Email_User,
            to: emailto,
            subject: '验证码',
            // text: text_str,
            html:
             `<h2>PigChess注册验证码${uniqueId}</h2>
             `
             ,
        };
        console.log(mailOptions)
        let send_res = await SendMail(mailOptions);
        console.log("send res is ", send_res)
        return true
    }catch(error){
        console.log("catch error is ", error)
        return false
    }
}


export function SendMail(mailOptions_:any)
{
    //Promise/同步处理
    return new Promise(function(resolve,reject){
        transport.sendMail(mailOptions_,function(error:any,info:any)
        {
            //失败判断
            if(error)
            {
                console.log(error)
                reject(error)
            }
            else
            {
                console.log("email send success"+info.response)
                resolve(info.response)
            }
        })
    })
}