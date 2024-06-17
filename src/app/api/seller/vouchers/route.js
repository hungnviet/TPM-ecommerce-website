import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function POST(req) {
  const data = await req.json();
  const { sellerId, name, type, discountValue, start, end } = data;
  const sql = `call AddNewVoucher('${sellerId}','${name}', '${type}', ${discountValue}, '${start}', '${end}')`;
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
  const seller_id = searchParams.get("seller_id");
  const sql = `SELECT * FROM SHOP_VOUCHER WHERE Seller_ID = '${seller_id}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(NextResponse.json(result));
    });
  });
}
export async function DELETE(req) {
  const data = await req.json();
  const { voucherId } = data;
  const sql = `DELETE FROM SHOP_VOUCHER WHERE Voucher_ID = '${voucherId}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(
        NextResponse.json({
          success: true,
          message: "Voucher deleted successfully",
        })
      );
    });
  });
}
