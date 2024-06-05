import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

/// Get all products
export async function POST(req) {
  const data = await req.json();
  const { searchValue, user_id } = data;
  console.log(searchValue);
  const sql1 = `call SearchProductsByShopName('${searchValue}')`;
  const sql2 = `call SearchProductsName('${searchValue}')`;

  return new Promise((resolve, reject) => {
    db.query(sql1, (err, result1) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        db.query(sql2, (err, result2) => {
          if (err) {
            console.log(err);
            reject(err);
          } else {
            const combinedArray = [...result1[0], ...result2[0]];
            const uniqueArray = Array.from(
              new Set(combinedArray.map((item) => item.Product_ID))
            ); // Extract only unique Product_IDs

            const productDetailsPromises = uniqueArray.map((productId) => {
              return new Promise((resolveProduct, rejectProduct) => {
                db.query(
                  `call Get_Product_By_ID('${user_id}',${productId})`,
                  (err, productDetails) => {
                    if (err) {
                      console.log(err);
                      rejectProduct(err);
                    } else {
                      resolveProduct(productDetails[0][0]); // Assuming stored procedure returns only one row per product ID
                    }
                  }
                );
              });
            });

            // Wait for all product detail promises to resolve
            Promise.all(productDetailsPromises)
              .then((products) => {
                resolve(NextResponse.json(products)); // Respond with detailed information about each product
              })
              .catch((error) => {
                reject(error); // Handle errors if any of the product queries fail
              });
          }
        });
      }
    });
  });
}
