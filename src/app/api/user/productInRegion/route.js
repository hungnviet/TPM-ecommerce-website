import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const region_id = searchParams.get("region_id");
  const user_id = searchParams.get("user_id");
  const sql = `call Get_all_product_of_region_with_vouchers('${user_id}',${region_id})`; //just get the title the first image and the first price of the product and the product id
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
