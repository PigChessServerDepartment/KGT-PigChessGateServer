import { Pool, PoolClient, QueryResult } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

interface PgSqlConnectIni {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
    max: number; // 最大连接数
}

class Defer {
    private fn: () => void;
    constructor(fn: () => void) { this.fn = fn; }
    dispose() { this.fn(); }
}

class PgSqlPool {
    private pool: Pool;
    constructor(private config: PgSqlConnectIni) {
        this.pool = new Pool({
            user: config.user,
            host: config.host,
            database: config.database,
            password: config.password,
            port: config.port,
            max: config.max,
        });
        this.pool.on('error', (err) => {
            console.error('PostgreSQL pool error:', err);
        });
    }

    async getConnection(): Promise<PoolClient> {
        return await this.pool.connect();
    }

    releaseConnection(client: PoolClient) {
        client.release();
    }

    async close(): Promise<void> {
        await this.pool.end();
        console.log('PgSql pool closed.');
    }
}

export class PgSqlMgr {
    private con_pgsql_pool: PgSqlPool;
    private static instance: PgSqlMgr | null = null;

    constructor() {
        this.con_pgsql_pool = new PgSqlPool({
            user: process.env.DB_USER || 'root',
            host: process.env.DB_HOST || '127.0.0.1',
            database: process.env.DB_NAME || 'pigchessdb',
            password: process.env.DB_PASSWORD || 'mmp5sn88d88',
            port: parseInt(process.env.DB_PORT || '5000', 10),
            max: 5,
        });
    }

    static getInstance(): PgSqlMgr {
        if (!PgSqlMgr.instance) PgSqlMgr.instance = new PgSqlMgr();
        return PgSqlMgr.instance;
    }

    async Query(sql: string, params?: any[]): Promise<QueryResult | null> {
        const client = await this.con_pgsql_pool.getConnection();
        let defer = new Defer(() => {
            this.con_pgsql_pool.releaseConnection(client);
            console.log("pgsql connection release");
        });
        try {
            const result = await client.query(sql, params);
            return result;
        } catch (error: any) {
            console.log('PgSql Query error:', error);
            return null;
        } finally {
            defer.dispose();
        }
    }

    async Exec(sql: string, params?: any[]): Promise<boolean> {
        const client = await this.con_pgsql_pool.getConnection();
        let defer = new Defer(() => {
            this.con_pgsql_pool.releaseConnection(client);
            console.log("pgsql connection release");
        });
        try {
            await client.query(sql, params);
            return true;
        } catch (error: any) {
            console.log('PgSql Exec error:', error);
            return false;
        } finally {
            defer.dispose();
        }
    }

    async ClosePool() {
        await this.con_pgsql_pool.close();
    }
}