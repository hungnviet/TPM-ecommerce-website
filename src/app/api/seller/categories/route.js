import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function GET() {
  const sql = "select * from CATEGORY";
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        resolve(NextResponse.error(err));
      } else {
        resolve(NextResponse.json(result));
      }
    });
  });
}
