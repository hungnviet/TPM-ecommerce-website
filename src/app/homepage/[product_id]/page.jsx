"use client";
import "./product_detail.css";
import Product_detail_img from "@/components/product_detail_image/product_detail_img";
import Product_detail_description from "@/components/product_detail_description/product_detail";
import RealtedProduct from "@/components/related_product/page";
import { useEffect, useState } from "react";
import { BeatLoader } from "react-spinners";
import { getCognitoUserSub } from "@/config/cognito";

export default function Page({ params }) {
  const { product_id } = params;
  const [user_id, setUserID] = useState("");
  const [category, setCategory] = useState(null);
  const [relatedProduct, setRelatedProduct] = useState(null);

  async function getCategoryOfProduct() {
    const res = await fetch(
      `/api/user/productCategory?product_id=${product_id}`
    );
    const data = await res.json();
    console.log(data);
    setCategory(data.Category_ID);
  }

  async function getRelatedProduct() {
    const res = await fetch(
      `/api/user/category?category_id=${category}&user_id=${user_id}`
    );
    const data = await res.json();
    setRelatedProduct(data);
  }

  useEffect(() => {
    getCognitoUserSub().then((user_id) => setUserID(user_id));
    if (!user_id) return;

    if (product_id) {
      getCategoryOfProduct();
    }

    if (category) {
      getRelatedProduct();
    }

    console.log(relatedProduct);
  }, [user_id, category]); // run only when userID changes

  return (
    <div className="product_detail_page">
      <div className="product_detail_content">
        <div className="left_section_product_detail">
          <Product_detail_img product_id={product_id} />
        </div>
        <div className="right_section_product_detail">
          <Product_detail_description
            product_id={product_id}
            user_id={user_id}
          />
        </div>
      </div>
      <div className="relatedProductInProducDetailScreen">
        {relatedProduct &&
          relatedProduct.length > 0 &&
          relatedProduct.map((product, index) => (
            <RealtedProduct key={index} product={product} user_id={user_id} />
          ))}
        <BeatLoader color={"#36d7b7"} loading={!relatedProduct} />
      </div>
    </div>
  );
}
