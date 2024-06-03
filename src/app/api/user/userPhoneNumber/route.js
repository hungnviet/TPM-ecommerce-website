import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function PUT(req) {
  const data = await req.json();
  const user_id = data.user_id;
  const phoneNumber = data.phoneNumber;
  const sql = `UPDATE USER SET Phone_Number = '${phoneNumber}' WHERE User_ID = '${user_id}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        resolve(NextResponse.error(err));
      } else {
        resolve(
          NextResponse.json({
            message: "User phone number updated successfully",
          })
        );
      }
    });
  });
}
