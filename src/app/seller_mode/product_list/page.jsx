"use client";

import { useEffect, useState } from "react";
import Product_cart_seller from "@/components/product_cart_seller/product_cart_seller";
import "./product_list.css";
import { getCognitoUserSub } from "@/config/cognito";
import { BeatLoader } from "react-spinners";

export default function Page() {
  const [user_id, setUser_id] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCognitoUserSub().then((sub) => {
      setUser_id(sub);
    });
  }, []);

  useEffect(() => {
    if (user_id) {
      const url = `/api/seller/products?seller_id=${user_id}`;
      console.log(url);
      fetch(url)
        .then((response) => response.json())
        .then((data) => {
          setProducts([...data].reverse());
          setIsLoading(false);
        })
        .catch((error) => console.error("Error:", error));
    }
  }, [user_id]);
  return (
    <div className="product_list_seller_big_container">
      <div className="product_list_container">
        <div className="product_list_header_seller">
          <h2>Products of shop</h2>

          <h4>Your shop currently have : {products.length} </h4>
        </div>
        <div className="product_list_tag_container">
          <BeatLoader color={"#36d7b7"} loading={isLoading} size={10} />
          {products.map((product, index) => (
            <Product_cart_seller key={index} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
