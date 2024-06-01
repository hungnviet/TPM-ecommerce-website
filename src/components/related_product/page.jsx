"use client";
import { useEffect, useState } from "react";
import "./page.css";
import { useRouter } from "next/navigation";

export default function RelatedProduct({ product, user_id }) {
  const route = useRouter();

  if (!product) {
    return <p>Loading...</p>;
  }
  console.log(product);

  return (
    <button
      className="btn_related_tag"
      onClick={() => {
        route.push(`/homepage/${user_id}/${product.Product_ID}`);
      }}
    >
      <div className="relatedProductTagContainer">
        <div className="imgContainerRelatedTag">
          <img src={product.First_Image || "default_image_url"} alt="product" />
        </div>
        <div className="sellerInforContainerRelatedTag">
          <div className="imgSellerContainerRelatedTag">
            <img src={product.Shop_image || "default_image_url"}></img>
          </div>
          <div className="sellerInforRelatedTag">
            <p>{product.Shop_name || "Loading..."}</p>
            <p>{product.Shop_address || "Loading..."}</p>
          </div>
        </div>
        <div className="productInforRelatedTag">
          <p>{product.Product_title || "Loading..."}</p>
        </div>
      </div>
    </button>
  );
}
