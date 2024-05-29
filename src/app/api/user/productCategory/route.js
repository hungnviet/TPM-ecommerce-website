import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const productID = searchParams.get("product_id");
  const sql = `SELECT Category_ID FROM PRODUCT WHERE Product_ID='${productID}'`;
  console.log(sql);
  return new Promise((resolve, reject) => {
    db.query(sql, (err, category) => {
      if (err) {
        console.log(err);
        resolve(NextResponse.error(err));
      } else {
        resolve(NextResponse.json(category[0]));
      }
    });
  });
}
