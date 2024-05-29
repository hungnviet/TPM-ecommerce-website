import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = url.searchParams;
  const category_id = searchParams.get("category_id");
  const sql = `SELECT * FROM PRODUCT WHERE Category_ID='${category_id}' ORDER BY Product_ID DESC LIMIT 10`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, products) => {
      if (err) {
        console.log(err);
        resolve(NextResponse.error(err));
      } else {
        const productImagesPromises = products.map((product) => {
          const sql2 = `SELECT * FROM PRODUCT_IMAGE WHERE Product_ID=${product.Product_ID}`;
          return new Promise((resolve, reject) => {
            db.query(sql2, (err, images) => {
              if (err) {
                console.log(err);
                resolve(null);
              } else {
                product.images = images;
                resolve(product);
              }
            });
          });
        });
        Promise.all(productImagesPromises)
          .then((productsWithImages) => {
            const sellerInfoPromises = productsWithImages.map((product) => {
              const sql3 = `SELECT * FROM USER WHERE User_ID='${product.Seller_ID}'`;
              return new Promise((resolve, reject) => {
                db.query(sql3, (err, sellerInfo) => {
                  if (err) {
                    console.log(err);
                    resolve(null);
                  } else {
                    product.sellerInfo = sellerInfo[0]; // Assuming that Seller_ID is unique and only returns one record
                    resolve(product);
                  }
                });
              });
            });
            Promise.all(sellerInfoPromises)
              .then((productsWithSellerInfo) => {
                resolve(NextResponse.json(productsWithSellerInfo));
              })
              .catch((err) => {
                console.log(err);
                resolve(NextResponse.error(err));
              });
          })
          .catch((err) => {
            console.log(err);
            resolve(NextResponse.error(err));
          });
      }
    });
  });
}
