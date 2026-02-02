import { PgSqlMgr } from "../Control/PgSqlMgr";
import * as Model from "../Model/Model";
export class SqlFunction {
    async UpdateUserAreaData(reqbody: Model.UpdateUserAreaDataReq) {
        let sql = "select update_pigchessarea_data($1,$2,$3,$4,$5,$6,$7,$8,$9)";
        let sqlres = await PgSqlMgr.getInstance().Query(sql, [
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
        return sqlres;
    }

}