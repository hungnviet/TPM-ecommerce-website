import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function PUT(req) {
  const data = await req.json();
  const user_id = data.user_id;
  const FName = data.FName;
  const LName = data.LName;
  const sql = `UPDATE USER SET FName = '${FName}', LName = '${LName}' WHERE User_ID = '${user_id}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        resolve(NextResponse.error(err));
      } else {
        resolve(
          NextResponse.json({ message: "User name updated successfully" })
        );
      }
    });
  });
}
