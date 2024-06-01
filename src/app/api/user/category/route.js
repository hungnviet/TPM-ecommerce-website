import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const category_id = searchParams.get("category_id");
  const user_id = searchParams.get("user_id");
  const sql = `call Get_All_Products_For_User_With_Category('${user_id}',${category_id})`; //just get the title the first image and the first price of the product and the product id
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        resolve(NextResponse.error(err));
      } else {
        resolve(NextResponse.json(result[0]));
      }
    });
  });
}
