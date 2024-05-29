"use client";
import "./product_detail.css";
import Product_detail_img from "@/components/product_detail_image/product_detail_img";
import Product_detail_description from "@/components/product_detail_description/product_detail";
import RealtedProduct from "@/components/related_product/page";
import { useEffect, useState } from "react";
export default function Page({ params }) {
  const { user_id_encode, product_id } = params;
  const user_id = decodeURIComponent(user_id_encode);
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
    const res = await fetch(`/api/user/category?category_id=${category}`);
    const data = await res.json();
    setRelatedProduct(data);
  }

  useEffect(() => {
    if (product_id) {
      getCategoryOfProduct();
    }
  }, []);

  useEffect(() => {
    if (category) {
      getRelatedProduct();
    }
  }, [category]);

  useEffect(() => {
    console.log(relatedProduct);
  }, [relatedProduct]);

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
        {!relatedProduct && <p>loading...</p>}
      </div>
    </div>
  );
}
