import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const user_id = searchParams.get("user_id");
  const product_id = searchParams.get("product_id");
  const sqlQuery = `
  SELECT EXISTS(
    SELECT 1 FROM PRODUCT_LIKED 
    WHERE User_ID='${user_id}' AND Product_ID=${product_id}
  ) as isLiked;
`;
  return new Promise((resolve, reject) => {
    db.query(sqlQuery, (err, result) => {
      if (err) {
        console.log(err);
        resolve(NextResponse.error(err));
      } else {
        resolve(NextResponse.json(result[0]));
      }
    });
  });
}
