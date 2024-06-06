"use client";
import { useEffect, useState } from "react";
import "./category.css";
export const dynamic = "force-dynamic";

import Product_cart from "@/components/product_cart/product_cart";
import { getCognitoUserSub } from "@/config/cognito";

export default function Page({}) {
  const [user_id, setUser_id] = useState("");
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 30;
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
      <div className="category_product_container">
        {currentProducts.map((product, index) => (
          <Product_cart key={index} product={product} userID={user_id} />
        ))}
      </div>
      <div className="pagination">{renderPageNumbers()}</div>
    </div>
  );
}
