import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const user_id = searchParams.get("user_id");
  const sql =
    "SELECT * FROM USER WHERE IsSeller = true ORDER BY RAND() LIMIT 10";
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(NextResponse.json(result));
    });
  });
}
