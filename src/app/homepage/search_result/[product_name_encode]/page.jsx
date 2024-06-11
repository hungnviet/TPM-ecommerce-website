"use client";
import { useEffect, useState } from "react";
import "./search_result.css";
import Product_cart from "@/components/product_cart/product_cart";
import { BeatLoader } from "react-spinners";
import { getCognitoUserSub } from "@/config/cognito";

export default function Page({ params }) {
  const [user_id, setUser_id] = useState("");
  const product_name = decodeURIComponent(params.product_name_encode);
  const [num_of_results, set_num_of_results] = useState(0);
  const [products, set_products] = useState();
  const hasFreeShipping = (vouchers) => {
    return vouchers ? vouchers.some((v) => v.Type === "Freeship") : false;
  };
  const [isWaiting, setIsWaiting] = useState(true);
  useEffect(() => {
    getCognitoUserSub().then((sub) => setUser_id(sub));
    if (!user_id) return;
    fetch("/api/user/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ searchValue: product_name, user_id: user_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        set_num_of_results(data.length);
        set_products(data);
        setIsWaiting(false);
      });
  }, [user_id]);
  useEffect(() => {
    console.log("dayne");
    console.log(products);
  }, [products]);
  return (
    <div className="search_result_container">
      <h3>
        Result for {product_name} ( {num_of_results} results)
      </h3>
      {isWaiting && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100px",
          }}
        >
          <BeatLoader loading={isWaiting} size={10} color="#36d7b7" />
        </div>
      )}

      <div className="search_result_list">
        {products &&
          products.map((product, index) => (
            <Product_cart
              key={index}
              product={product}
              userID={user_id}
              freeship={hasFreeShipping(product.Vouchers)}
            />
          ))}
        {num_of_results === 0 && <h3>No results found</h3>}
      </div>
    </div>
  );
}
