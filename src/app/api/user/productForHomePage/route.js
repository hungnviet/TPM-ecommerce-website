import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";

const db = connectToDatabase();

/// Get all products in categories 1 to 10
export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const user_id = searchParams.get("user_id");

  const categories = Array.from({ length: 10 }, (_, i) => i + 1); // Creates an array with categories from 1 to 10
  const promises = categories.map((category_id) => {
    const sql = `CALL Get_10_Products_For_User_With_Category('${user_id}', ${category_id})`;
    return new Promise((resolve, reject) => {
      db.query(sql, (err, result) => {
        if (err) {
          console.error(
            `Error fetching products for category ${category_id}:`,
            err
          );
          reject(err);
        } else {
          resolve(result[0]);
        }
      });
    });
  });

  return Promise.allSettled(promises)
    .then((results) => {
      const allProducts = results.flatMap((result) =>
        result.status === "fulfilled" ? result.value : []
      );
      return NextResponse.json(allProducts);
    })
    .catch((err) => {
      console.error("Failed to fetch products:", err);
      return NextResponse.error(err);
    });
}
