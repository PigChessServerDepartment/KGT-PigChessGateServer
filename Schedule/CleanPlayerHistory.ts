import cron from 'node-cron'
import { PgSqlMgr } from '../Control/PgSqlMgr';
import * as SqlModel from "../Model/SqlModel";
async function doCleanup() {
  console.log(`${new Date().toLocaleString()} - 开始清理`);
  try {
    // 这里写你的清理逻辑
    let sql="select clear_area_player_history_table()";
    let sqlres=await PgSqlMgr.getInstance().Query(sql,[]);
    if(!sqlres || sqlres.rowCount===0){}
    else
    {
        const result=JSON.parse(sqlres.rows[0].clear_area_player_history_table)as SqlModel.SqlAllRes
        switch(result.errorcode)
        {
            case SqlModel.SqlErrorCode.Success:
                console.log('清理成功');
                break;
            default:
                console.log('清理失败，错误码:',result.errorcode);
                break;
        }
    }
  } catch (error) {
    console.error('清理失败:', error);
  }
}

export function ClearTask(){
    // 设置每天凌晨3点执行
    cron.schedule('0 0 3 * * *', doCleanup, {
    timezone: 'Asia/Shanghai'
    });
    console.log('定时清理服务已启动,每天凌晨3点自动执行');
}