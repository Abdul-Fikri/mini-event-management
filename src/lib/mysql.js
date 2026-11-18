import "server-only";
import mysql from "mysql2/promise";

const requiredEnv = [
  "DB_HOST",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
];

function readDatabaseConfig() {
  const missing = requiredEnv.filter((name) => !process.env[name]);

  if (missing.length > 0) {
    throw new Error(
      `Konfigurasi MySQL belum lengkap. Variabel yang belum diisi: ${missing.join(", ")}.`
    );
  }

  const port = Number(process.env.DB_PORT || 3306);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("DB_PORT harus berupa angka port yang valid.");
  }

  return {
    host: process.env.DB_HOST,
    port,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  };
}

// Simpan satu connection pool per proses Node.js. Cache global mencegah
// Next.js development hot-reload membuat pool baru pada setiap perubahan file.
const globalForMysql = globalThis;

export function getMysqlPool() {
  if (!globalForMysql.mysqlPool) {
    globalForMysql.mysqlPool = mysql.createPool({
      ...readDatabaseConfig(),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      charset: "utf8mb4",
      dateStrings: true,
    });
  }

  return globalForMysql.mysqlPool;
}
