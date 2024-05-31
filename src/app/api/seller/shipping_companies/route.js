import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

//get all shipping companies for seller selection
export async function GET(req) {
  const sql = "SELECT * FROM SHIPPING_COMPANY";
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
  const { seller_ID, shipping_company_ID_list } = data;
  const sql =
    "INSERT IGNORE INTO SHIPPING_COMPANY_OF_SELLER (Seller_ID, Company_ID) VALUES (?, ?)";

  return new Promise((resolve, reject) => {
    let queries = shipping_company_ID_list.map((id) => {
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
        resolve(NextResponse.json({ message: "Shipping companies added" }));
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export async function DELETE(req) {
  const data = await req.json();
  const { seller_ID, company_ID } = data;
  const sql =
    "DELETE FROM SHIPPING_COMPANY_OF_SELLER WHERE Seller_ID = ? AND Company_ID = ?";

  return new Promise((resolve, reject) => {
    db.query(sql, [seller_ID, company_ID], (err, result) => {
      if (err) {
        reject(err);
      }
      resolve(NextResponse.json({ message: "Shipping company removed" }));
    });
  });
}
