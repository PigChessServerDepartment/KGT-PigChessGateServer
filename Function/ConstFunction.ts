export class ConstFunction {
    SystemEmailCheckStuffIsReceive(Bitmap: bigint[], userid: number): boolean {
        if(!Bitmap || Bitmap.length === 0) {
            return false;
        }
        if(userid < 0) {
            return false;
        }
        const index = userid % 64;
        const arrayindex = Math.floor(userid / 64);
        
        // 边界检查
        if (arrayindex < 0 || arrayindex >= Bitmap.length) {
            return false;
        }
        
        // 使用2的幂次计算掩码（比位移更安全）
        const mask = 2n ** BigInt(index);
        
        // 执行位与操作
        return (Bitmap[arrayindex] & mask) !== 0n;
    }

    SystemEmailSetStuffReceived(Bitmap: bigint[], userid: number): bigint[] {
        if(!Bitmap || Bitmap.length === 0) {
            return Bitmap;
        }
        if(userid < 0) {
            return Bitmap;
        }
        const index = userid % 64;
        const arrayindex = Math.floor(userid / 64);
        
        // 边界检查
        if (arrayindex < 0 || arrayindex >= Bitmap.length) {
            return Bitmap;
        }
        
        // 使用2的幂次计算掩码（比位移更安全）
        const mask = 2n ** BigInt(index);
        
        // 执行位或操作
        Bitmap[arrayindex] = Bitmap[arrayindex] | mask;
        return Bitmap;
    }

    CheckReqAuthValid(reqauth:any):any{
        if(!reqauth){
            return null;
        }
        return reqauth;
    }
}