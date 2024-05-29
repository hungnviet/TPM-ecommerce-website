import connectToDatabase from "@/config/db";
import { NextResponse } from "next/server";
const db = connectToDatabase();
export async function GET(req) {
  const url = new URL(req.url);
  const searchParams = new URLSearchParams(url.searchParams);
  const product_id = searchParams.get("product_id");
  const sql = `select * from PRODUCT_COMMENT where Product_ID=${product_id} order by Comment_date desc`;

  return new Promise((resolve, reject) => {
    db.query(sql, async (err, comments) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        // For each comment, fetch the user data
        const commentsWithUser = await Promise.all(
          comments.map(async (comment) => {
            const userSql = `select * from USER where User_ID='${comment.User_ID}'`;
            return new Promise((resolve, reject) => {
              db.query(userSql, (err, users) => {
                if (err) {
                  console.log(err);
                  reject(err);
                } else {
                  // Add the user data to the comment
                  comment.user = users[0];
                  resolve(comment);
                }
              });
            });
          })
        );

        resolve(NextResponse.json(commentsWithUser));
      }
    });
  });
}

export async function POST(req) {
  const data = await req.json();
  const { Product_ID, User_ID, Comment, Comment_date, image } = data;
  console.log(data);
  const sql = `insert into PRODUCT_COMMENT (Product_ID, User_ID, Comment, Comment_date, Comment_image) values (${Product_ID}, "${User_ID}", "${Comment}", "${Comment_date}","${image}")`;
  return new Promise((resolve, reject) => {
    db.query(sql, (err, result) => {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        resolve(NextResponse.json({ message: "Comment added successfully" }));
      }
    });
  });
}
