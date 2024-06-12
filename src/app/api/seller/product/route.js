import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();

//Posting product for seller
export async function POST(req) {
  const data = await req.json();
  const {
    productTitle,
    productDescription,
    productOptionList, // list option [{optionName,optionPrice}]
    productImageList, //list image [{imageURL}]
    productDescriptionList, //list description [{title,content}]
    sellerID,
    categoryID,
    region_id,
    province_id,
  } = data;
  const sql1 = `call Add_Product('${sellerID}','${productTitle}','${productDescription}',${categoryID},${region_id},${province_id})`; /// (sellerID,productTitle,productDescription,categoryID)
  const sql2 = `call Add_Product_Option(?,?,?,?,?,?)`;
  const sql4 = `call Add_Product_Detail_Description(?,?,?,?)`; /// (productID,title,content,descriptionNumber)
  const sql3 = `call Add_Product_Image(?,?)`; /// (productID,imageURL)
  return new Promise((resolve, reject) => {
    db.query(sql1, (err, result) => {
      if (err) {
        console.log(err);
        reject(NextResponse.error(err));
      } else {
        const sqlGetID = `SELECT Product_ID FROM PRODUCT WHERE Seller_ID='${sellerID}' AND Product_Title='${productTitle}' AND Product_Description='${productDescription}' ORDER BY Product_ID DESC LIMIT 1`;
        db.query(sqlGetID, (err, result) => {
          if (err) {
            console.log(err);
            reject(NextResponse.error(err));
          } else {
            const productID = result[0].Product_ID;

            productOptionList.forEach((option, index) => {
              db.query(
                sql2,
                [
                  productID,
                  option.optionName,
                  option.optionPrice,
                  option.optionQuantity,
                  option.freeshipCondition,
                  index,
                ],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    reject(NextResponse.error(err));
                  }
                }
              );
            });

            productImageList.forEach((image) => {
              db.query(sql3, [productID, image.imageURL], (err, result) => {
                if (err) {
                  console.log(err);
                  reject(NextResponse.error(err));
                }
              });
            });

            productDescriptionList.forEach((description, index) => {
              db.query(
                sql4,
                [productID, description.title, description.content, index],
                (err, result) => {
                  if (err) {
                    console.log(err);
                    reject(NextResponse.error(err));
                  }
                }
              );
            });

            resolve(
              NextResponse.json({
                success: true,
                message: "Product added successfully",
              })
            );
          }
        });
      }
    });
  });
}

///Get Product Detail For Seller
export async function GET(req) {
  const sql = `SELECT COUNT(*) AS image_count FROM PRODUCT_IMAGE`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        reject(NextResponse.error(err));
      } else {
        resolve(NextResponse.json({ count: result[0].image_count }));
      }
    });
  });
}

// Updating product for seller
export async function PUT(req) {
  const data = await req.json();
  const {
    productID,
    productTitle,
    productDescription,
    productOptionList, // list option [{optionName,optionPrice}]
    productDescriptionDetail,
    sellerID,
  } = data;

  const sql1 = `UPDATE PRODUCT SET Product_Title='${productTitle}', Product_Description='${productDescription}' WHERE Product_ID='${productID}' AND Seller_ID='${sellerID}'`;
  const sql4 = `call Add_Product_Detail_Description(?,?,?,?)`;
  return new Promise((resolve, reject) => {
    db.query(sql1, (err, result) => {
      if (err) {
        console.log(err);
        reject(NextResponse.error(err));
      } else {
        productOptionList.forEach((option, index) => {
          let sql2;
          if (option.optionisNew) {
            sql2 = `INSERT INTO PRODUCT_OPTION (Product_ID, Option_Name, Option_Price, Quantity, Option_number) VALUES ('${productID}', '${option.optionName}', '${option.optionPrice}', '${option.optionQuantity}',   '${index}')`;
          } else {
            sql2 = `UPDATE PRODUCT_OPTION SET Option_Name='${option.optionName}', Option_Price='${option.optionPrice}', Quantity = '${option.optionQuantity}' WHERE Product_ID='${productID}' AND Option_number='${index}'`;
          }
          db.query(sql2, (err, result) => {
            if (err) {
              console.log(err);
              reject(NextResponse.error(err));
            }
          });
        });

        productDescriptionDetail.forEach((description, index) => {
          if (description.isNew) {
            db.query(
              sql4,
              [productID, description.title, description.content, index],
              (err, result) => {
                if (err) {
                  console.log(err);
                  reject(NextResponse.error(err));
                }
              }
            );
          } else {
            const sql3 = `UPDATE PRODUCT_DETAIL_DESCRIPTION SET Content='${description.content}', Title='${description.title}' WHERE Product_ID='${productID}' AND Description_number='${index}'`;
            db.query(sql3, (err, result) => {
              if (err) {
                console.log(err);
                reject(NextResponse.error(err));
              }
            });
          }
        });

        resolve(
          NextResponse.json({
            success: true,
            message: "Product updated successfully",
          })
        );
      }
    });
  });
}
export async function COUNTIMAGES(req) {
  const sql = `SELECT COUNT(*) AS image_count FROM Product_Image`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        reject(NextResponse.error(err));
      } else {
        resolve(NextResponse.json({ count: result[0].image_count }));
      }
    });
  });
}
