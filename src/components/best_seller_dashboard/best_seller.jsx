"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "./best_seller.css";
import Image from "next/image";
export default function BestSeller({ product_id, product_name, sales, image }) {
  const router = useRouter();
  function onClick() {
    router.push(`/seller_mode/product_list/${product_id}`);
  }
  return (
    <button className="best_seller_tag" onClick={onClick}>
      <div className="best_seller_tag_img">
        <Image src={image} fill="true" alt="img product" />
      </div>
      <div className="best_seller_product_infor">
        <p style={{ textAlign: "start" }}>{product_name}</p>
        <p style={{ fontWeight: "bold" }}>販売数 : {sales}</p>
      </div>
    </button>
  );
}
