"use server";

const sqlite3 = require("sqlite3").verbose();

const sqliteConnectionString = process.env.SQLITE_DB_CONNECTION_STRING!;

if (!sqliteConnectionString) {
  process.exit("SQLITE_DB_CONNECTION_STRING is not set");
}

export const getSqliteUserByEmail = async (
  email: string,
): Promise<number | null> => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(
      sqliteConnectionString,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err: any) => {
        if (err) {
          console.error(err.message);
          return reject(err);
        }
      },
    );

    db.get(
      "SELECT id FROM users WHERE email = ?",
      [email],
      (err: any, row: any) => {
        if (err) {
          console.error(err.message);
          return reject(err);
        }
        resolve(row ? row.id : null);
      },
    );

    db.close((err: any) => {
      if (err) {
        console.error(err.message);
        return reject(err);
      }
      console.log("Closed the SQLite database connection.");
    });
  });
};
