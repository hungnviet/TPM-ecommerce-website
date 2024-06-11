import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function POST(req) {
  const data = await req.json();
  const { productID, sellerId, name, type, discountValue, start, end } = data;
  const sql = `call AddNewProductVoucher('${productID}','${sellerId}','${name}', '${type}', ${discountValue}, '${start}', '${end}')`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        reject(NextResponse.error(err));
      } else {
        resolve(
          NextResponse.json({
            success: true,
            message: "Voucher added successfully",
          })
        );
      }
    });
  });
}

export async function GET(req) {
  const url = new URL(req.url);

  const searchParams = new URLSearchParams(url.searchParams);
  const product_id = searchParams.get("product_id");

  const sql = `SELECT * FROM PRODUCT_VOUCHER WHERE Product_ID = '${product_id}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(NextResponse.json(result));
    });
  });
}
