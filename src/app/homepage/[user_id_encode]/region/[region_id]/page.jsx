"use client";
import React from "react";
import Image from "next/image";

import "./page.css";
import { useState, useEffect } from "react";
import Product_cart from "@/components/product_cart/product_cart";

const regions = [
  { region_id: 1, region_name: "Hokkaido" },
  { region_id: 2, region_name: "Tohoku" },
  { region_id: 3, region_name: "Kanto" },
  { region_id: 4, region_name: "Chubu" },
  { region_id: 5, region_name: "Kinki (Kansai)" },
  { region_id: 6, region_name: "Chugoku" },
  { region_id: 7, region_name: "Shikoku" },
  { region_id: 8, region_name: "Kyushu (including Okinawa)" },
];
export default function Region_Product({ params }) {
  const { user_id_encode, region_id } = params;
  const user_id = decodeURIComponent(user_id_encode);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch(`/api/user/productInRegion?region_id=${region_id}&user_id=${user_id}`)
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
        <h4>{regions[region_id - 1].region_name}</h4>
        <p>
          Here are {products ? `${products.length}` : "some"} products from{" "}
          {regions[region_id - 1].region_name}
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
