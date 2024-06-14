import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function POST(req) {
  const data = await req.json();
  const { productID, sellerID, Condition_value } = data;
  const sql = `INSERT INTO DISCOUNT (Product_ID, Seller_ID, Type, Condition_type, Condition_value) VALUES ('${productID}', '${sellerID}', 'Freeship', 'TotalPrice', '${Condition_value}')`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        reject(NextResponse.error(err));
      } else {
        resolve(
          NextResponse.json({
            success: true,
            message: "Discount added successfully",
          })
        );
      }
    });
  });
}

export async function GET(req) {
  const url = new URL(req.url);

  const searchParams = new URLSearchParams(url.searchParams);
  const seller_ID = searchParams.get("seller_id");

  const sql = `SELECT * FROM DISCOUNT WHERE Seller_ID = '${seller_ID}' AND Product_ID = 'shop'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(NextResponse.json(result));
    });
  });
}
export async function PUT(req) {
  const data = await req.json();
  const { productID, sellerID, Shop_condition } = data;

  const sql = `UPDATE DISCOUNT SET Shop_condition = '${Shop_condition}' WHERE Product_ID='${productID}' AND Seller_ID='${sellerID}'`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(NextResponse.json(result));
    });
  });
}
