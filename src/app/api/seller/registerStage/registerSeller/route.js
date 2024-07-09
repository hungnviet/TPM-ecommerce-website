import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

/// post your request to become a seller
export async function POST(request) {
  const data = await request.json();
  const { User_ID, Shop_name, Shop_image, Shop_address } = data;
  const sql1 = `UPDATE USER SET Waiting_become_seller = 1 WHERE User_ID = "${User_ID}"`;
  const sql2 = `INSERT INTO USER_REGISTER_BECOME_SELLER (User_ID, Shop_name, Shop_image, SHop_address) VALUES ("${User_ID}", "${Shop_name}", "${Shop_image}", "${Shop_address}")`;

  return new Promise((resolve, reject) => {
    db.query(sql1, (err, result) => {
      if (err) {
        reject(err);
      }
      db.query(sql2, (err, result) => {
        if (err) {
          reject(err);
        }
        resolve(
          NextResponse.json({
            Message: "Request to become a seller has been sent",
          })
        );
      });
    });
  });
}
