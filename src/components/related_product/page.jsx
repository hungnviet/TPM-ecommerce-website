"use client";
import { useEffect, useState } from "react";
import "./page.css";
import { useRouter } from "next/navigation";

export default function RealtedProduct({ product, user_id }) {
  const route = useRouter();
  return (
    <button
      className="btn_related_tag"
      onClick={() => {
        route.push(`/homepage/${user_id}/${product.Product_ID}`);
      }}
    >
      <div className="relatedProductTagContainer">
        <div className="imgContainerRelatedTag">
          <img src={product.images[0].Image_url} alt="product" />
        </div>
        <div className="sellerInforContainerRelatedTag">
          <div className="imgSellerContainerRelatedTag">
            <img src={product.sellerInfo.Shop_image}></img>
          </div>
          <div className="sellerInforRelatedTag">
            <p>{product.sellerInfo.Shop_name}</p>
            <p>{product.sellerInfo.Shop_address}</p>
          </div>
        </div>
        <div className="productInforRelatedTag">
          <p>{product.Product_title}</p>
        </div>
      </div>
    </button>
  );
}
