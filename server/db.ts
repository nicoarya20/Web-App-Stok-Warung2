import "dotenv/config";
import pg from "pg";
const { Pool, types } = pg;

// Parse bigint columns (OID 20) as JS number — safe for our timestamp values
types.setTypeParser(20, (val: string) => parseInt(val, 10));

export const db = new Pool({ connectionString: process.env.DATABASE_URL });
