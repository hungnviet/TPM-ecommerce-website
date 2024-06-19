"use client";
import { useEffect, useState } from "react";
import "./category.css";
export const dynamic = "force-dynamic";

import Product_cart from "@/components/product_cart/product_cart";
import { getCognitoUserSub } from "@/config/cognito";
import { BeatLoader } from "react-spinners";

export default function Page({}) {
  const [user_id, setUser_id] = useState("");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const productsPerPage = 30;
  const hasFreeShipping = (vouchers) => {
    return vouchers ? vouchers.some((v) => v.Type === "Freeship") : false;
  };
  const [isMounted, setIsMounted] = useState(false); // new state variable

  useEffect(() => {
    getCognitoUserSub().then((sub) => setUser_id(sub));
  }, []);
  useEffect(() => {
    setIsMounted(true); // set isMounted to true after the component has been mounted
  }, []);

  useEffect(() => {
    if (!user_id) return;
    fetch(`/api/user/products?user_id=${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        dynamic: "force-dynamic",
      },
      next: { revalidate: 60 },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setProducts(data);
        setIsLoading(false);
      })
      .catch((error) => console.error("Error:", error));
  }, [user_id, isMounted]);

  const indexOfLastProduct = (currentPage + 1) * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(products.length / productsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 0; i < totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          className={currentPage === i ? "active" : ""}
          onClick={() => setCurrentPage(i)}
        >
          {i + 1}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <div className="category_page">
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {" "}
        <BeatLoader color={"#36d7b7"} loading={isLoading} size={15} />
      </div>

      <div className="category_product_container">
        {currentProducts.map((product, index) => (
          <Product_cart
            key={index}
            product={product}
            userID={user_id}
            freeship={hasFreeShipping(product.Vouchers)}
          />
        ))}
      </div>
      <div className="category_product_container_mobile">
        <div className="rowProduct">
          {currentProducts
            .slice(0, Math.ceil(currentProducts.length / 4))
            .map((product, index) => (
              <Product_cart
                key={index}
                product={product}
                userID={user_id}
                freeship={hasFreeShipping(product.Vouchers)}
              />
            ))}
        </div>
        <div className="rowProduct">
          {currentProducts
            .slice(
              Math.ceil(currentProducts.length / 4),
              2 * Math.ceil(currentProducts.length / 4)
            )
            .map((product, index) => (
              <Product_cart
                key={index}
                product={product}
                userID={user_id}
                freeship={hasFreeShipping(product.Vouchers)}
              />
            ))}
        </div>
        <div className="rowProduct">
          {currentProducts
            .slice(
              2 * Math.ceil(currentProducts.length / 4),
              3 * Math.ceil(currentProducts.length / 4)
            )
            .map((product, index) => (
              <Product_cart
                key={index}
                product={product}
                userID={user_id}
                freeship={hasFreeShipping(product.Vouchers)}
              />
            ))}
        </div>
        <div className="rowProduct">
          {currentProducts
            .slice(3 * Math.ceil(currentProducts.length / 4))
            .map((product, index) => (
              <Product_cart
                key={index}
                product={product}
                userID={user_id}
                freeship={hasFreeShipping(product.Vouchers)}
              />
            ))}
        </div>
      </div>
      <div className="pagination">{renderPageNumbers()}</div>
    </div>
  );
}
