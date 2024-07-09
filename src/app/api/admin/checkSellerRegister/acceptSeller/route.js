/// this endpoint is used to accept the seller registration request
/// update the status to success

import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function POST(request) {
  const data = await request.json();
  const id = data.id;
  const sql1 = `UPDATE USER_REGISTER_BECOME_SELLER SET Status = "success" WHERE id = ${id}`;
  const sql2 = `select * from USER_REGISTER_BECOME_SELLER where id = ${id}`;
  return new Promise((resolve, reject) => {
    db.query(sql1, (err, result1) => {
      if (err) {
        reject(err);
      }
      db.query(sql2, (err, result2) => {
        if (err) {
          reject(err);
        } else {
          resolve(NextResponse.json(result2));
        }
      });
    });
  });
}
