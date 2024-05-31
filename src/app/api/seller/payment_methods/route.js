import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

//get all shipping companies for seller selection
export async function GET(req) {
  const sql = "SELECT * FROM PAYMENT_METHOD";
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(NextResponse.json(result));
    });
  });
}

//
export async function POST(req) {
  const data = await req.json();
  const { seller_ID, payment_method_ID_list } = data;
  const sql =
    "INSERT IGNORE INTO PAYMENT_METHOD_OF_SELLER (Seller_ID, Method_ID) VALUES (?, ?)";

  return new Promise((resolve, reject) => {
    let queries = payment_method_ID_list.map((id) => {
      return new Promise((resolve, reject) => {
        db.query(sql, [seller_ID, id], (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        });
      });
    });

    Promise.all(queries)
      .then((results) => {
        resolve(NextResponse.json({ message: "Payment method added" }));
      })
      .catch((err) => {
        reject(err);
      });
  });
}
