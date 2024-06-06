"use client";
import React from "react";
import Image from "next/image";

import "./page.css";
import { useState, useEffect } from "react";
import Product_cart from "@/components/product_cart/product_cart";
const provinces = [
  { province_id: 1, province_name: "Hokkaido" },
  { province_id: 2, province_name: "Aomori" },
  { province_id: 3, province_name: "Iwate" },
  { province_id: 4, province_name: "Miyagi" },
  { province_id: 5, province_name: "Akita" },
  { province_id: 6, province_name: "Yamagata" },
  { province_id: 7, province_name: "Fukushima" },
  { province_id: 8, province_name: "Ibaraki" },
  { province_id: 9, province_name: "Tochigi" },
  { province_id: 10, province_name: "Gunma" },
  { province_id: 11, province_name: "Saitama" },
  { province_id: 12, province_name: "Chiba" },
  { province_id: 13, province_name: "Tokyo" },
  { province_id: 14, province_name: "Kanagawa" },
  { province_id: 15, province_name: "Niigata" },
  { province_id: 16, province_name: "Toyama" },
  { province_id: 17, province_name: "Ishikawa" },
  { province_id: 18, province_name: "Fukui" },
  { province_id: 19, province_name: "Yamanashi" },
  { province_id: 20, province_name: "Nagano" },
  { province_id: 21, province_name: "Gifu" },
  { province_id: 22, province_name: "Shizuoka" },
  { province_id: 23, province_name: "Aichi" },
  { province_id: 24, province_name: "Mie" },
  { province_id: 25, province_name: "Shiga" },
  { province_id: 26, province_name: "Kyoto" },
  { province_id: 27, province_name: "Osaka" },
  { province_id: 28, province_name: "Hyogo" },
  { province_id: 29, province_name: "Nara" },
  { province_id: 30, province_name: "Wakayama" },
  { province_id: 31, province_name: "Tottori" },
  { province_id: 32, province_name: "Shimane" },
  { province_id: 33, province_name: "Okayama" },
  { province_id: 34, province_name: "Hiroshima" },
  { province_id: 35, province_name: "Yamaguchi" },
  { province_id: 36, province_name: "Tokushima" },
  { province_id: 37, province_name: "Kagawa" },
  { province_id: 38, province_name: "Ehime" },
  { province_id: 39, province_name: "Kochi" },
  { province_id: 40, province_name: "Fukuoka" },
  { province_id: 41, province_name: "Saga" },
  { province_id: 42, province_name: "Nagasaki" },
  { province_id: 43, province_name: "Kumamoto" },
  { province_id: 44, province_name: "Oita" },
  { province_id: 45, province_name: "Miyazaki" },
  { province_id: 46, province_name: "Kagoshima" },
  { province_id: 47, province_name: "Okinawa" },
];

export default function Province_Product({ params }) {
  const { user_id_encode, province_id } = params;
  const user_id = decodeURIComponent(user_id_encode);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(
      `/api/user/productInProvince?province_id=${province_id}&user_id=${user_id}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setProducts(data);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  return (
    <div className="listProductOfRegionContainer">
      <div className="infor_of_region">
        <h4>{provinces[province_id - 1].province_name}</h4>
        <p>
          Here are {products ? `${products.length}` : "some"} products from{" "}
          {provinces[province_id - 1].province_name}
        </p>
        <p>Click on the product to see more details</p>
      </div>
      <div className="productListInRegion">
        {products.map((product, index) => (
          <Product_cart key={index} product={product} userID={user_id} />
        ))}
      </div>
    </div>
  );
}
