import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

/// Get all products
export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const user_id = searchParams.get("user_id");
  const sqlLikedProducts = `SELECT Product_ID FROM PRODUCT_LIKED WHERE User_ID = ?`;

  return new Promise((resolve, reject) => {
    db.query(sqlLikedProducts, [user_id], (err, likedResult) => {
      if (err) {
        console.log(err);
        resolve(NextResponse.error(err));
      } else {
        const productIds = likedResult.map((row) => row.Product_ID);
        if (productIds.length === 0) {
          resolve(NextResponse.json({ productCount: 0, products: [] }));
        } else {
          const sqlDetailedProducts = `
                        SELECT 
                            p.Product_ID,
                            p.Seller_ID,
                            p.Product_title,
                            p.Product_description,
                            p.Category_ID,
                            p.totalLike,
                            u.Shop_name,
                            u.Shop_image,
                            MIN(po.Option_price) AS First_Option_Price,
                            MIN(pi.Image_url) AS First_Image
                        FROM PRODUCT p
                        LEFT JOIN PRODUCT_OPTION po ON p.Product_ID = po.Product_ID AND po.IsValid = TRUE
                        INNER JOIN USER u ON p.Seller_ID = u.User_ID 
                        LEFT JOIN PRODUCT_IMAGE pi ON p.Product_ID = pi.Product_ID
                        WHERE p.Product_ID IN (?)
                        GROUP BY p.Product_ID;
                    `;

          db.query(
            sqlDetailedProducts,
            [productIds],
            (error, detailedResult) => {
              if (error) {
                console.log(error);
                resolve(NextResponse.error(error));
              } else {
                const products = detailedResult.map((product) => ({
                  productId: product.Product_ID,
                  sellerId: product.Seller_ID,
                  title: product.Product_title,
                  description: product.Product_description,
                  categoryId: product.Category_ID,
                  totalLikes: product.totalLike,
                  shopName: product.Shop_name,
                  shopImage: product.Shop_image,
                  firstOptionPrice: product.First_Option_Price,
                  firstImage: product.First_Image,
                }));
                resolve(
                  NextResponse.json({ productCount: products.length, products })
                );
              }
            }
          );
        }
      }
    });
  });
}
