"use client";
import { useEffect, useState } from "react";
import "./search_result.css";
import Product_cart from "@/components/product_cart/product_cart";
export default function Page({ params }) {
  const { user_id_encode, product_name_encode } = params;
  const user_id = decodeURIComponent(user_id_encode);
  const product_name = decodeURIComponent(product_name_encode);
  const [num_of_results, set_num_of_results] = useState(0);
  const [products, set_products] = useState();
  const [isWaiting, setIsWaiting] = useState(true);
  useEffect(() => {
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
  }, []);
  useEffect(() => {
    console.log("dayne");
    console.log(products);
  }, [products]);
  return (
    <div className="search_result_container">
      <h3>
        Result for {product_name} ( {num_of_results} results)
      </h3>
      <div className="search_result_list">
        {isWaiting && <h3>Loading...</h3>}
        {products &&
          products.map((product, index) => (
            <Product_cart key={index} product={product} userID={user_id} />
          ))}
        {num_of_results === 0 && <h3>No results found</h3>}
      </div>
    </div>
  );
}
