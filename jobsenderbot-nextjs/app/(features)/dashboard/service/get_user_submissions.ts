"use server";

import { JobSubmission, type BasicReturn } from "@/app/types";
import { getSqliteUserByEmail } from "./get-sqlite-user-by-email";

const sqlite3 = require("sqlite3").verbose();

const sqliteConnectionString = process.env.SQLITE_DB_CONNECTION_STRING!;

if (!sqliteConnectionString) {
  process.exit("SQLITE_DB_CONNECTION_STRING is not set");
}

// todo: prevent sql injections

export const getUserSubmissions = async (
  email: string,
  limit: number,
  startAt: number | null,
): Promise<BasicReturn<JobSubmission[]>> => {
  return new Promise((resolve) => {
    const db = new sqlite3.Database(
      sqliteConnectionString,
      sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      (err: any) => {
        if (err) {
          console.error(err.message);
          return resolve({
            success: false,
            message: "An unexpected error",
          });
        }
      },
    );

    getSqliteUserByEmail(email)
      .then((value) => {
        if (startAt === null) {
          db.all(
            "SELECT * FROM success WHERE user_id = ? ORDER BY id DESC LIMIT ?",
            [value, limit],
            (err: any, rows: JobSubmission[]) => {
              if (err) {
                console.error(err.message);

                return resolve({
                  success: false,
                  message: "An unexpected error",
                });
              }

              return resolve({
                success: true,
                message: "Success",
                data: rows,
              });
            },
          );
        } else {
          db.all(
            "SELECT * FROM success WHERE user_id = ? AND id < ? ORDER BY id DESC LIMIT ?",
            [value, startAt, limit],
            (err: any, rows: JobSubmission[]) => {
              if (err) {
                console.error(err.message);

                return resolve({
                  success: false,
                  message: "An unexpected error",
                });
              }

              return resolve({
                success: true,
                message: "Success",
                data: rows,
              });
            },
          );
        }
      })
      .finally(() => {
        db.close((err: any) => {
          if (err) {
            console.error(err.message);
          }
        });
      });
  });
};

export const getLatestUserSubmissions = async (
  email: string,
  endAt: number,
): Promise<BasicReturn<JobSubmission[]>> => {
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

    getSqliteUserByEmail(email)
      .then((value) => {
        db.all(
          "SELECT * FROM success WHERE user_id = ? AND id > ? ORDER BY id DESC",
          [value, endAt],
          (err: any, rows: JobSubmission[]) => {
            if (err) {
              console.error(err.message);

              return resolve({
                success: false,
                message: "An unexpected error",
              });
            }

            return resolve({
              success: true,
              message: "Success",
              data: rows,
            });
          },
        );
      })
      .finally(() => {
        db.close((err: any) => {
          if (err) {
            console.error(err.message);
          }
        });
      });
  });
};
