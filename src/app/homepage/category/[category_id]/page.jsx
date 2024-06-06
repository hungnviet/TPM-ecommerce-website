"use client";
import { useEffect, useState } from "react";
import "./category.css";
import Product_cart from "@/components/product_cart/product_cart";
import { getCognitoUserSub } from "@/config/cognito";

export default function Page({ params }) {
  const { category_id } = params;
  const [user_id, setUserID] = useState("");
  const [products, setProducts] = useState([]);
  const [number, setNumber] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 30;
  useEffect(() => {
    getCognitoUserSub().then((user_id) => setUserID(user_id));
    if (!user_id) return;
    fetch(`/api/user/category?category_id=${category_id}&user_id=${user_id}`)
      .then((response) => response.json())
      .then((data) => {
        setNumber(data.length);
        setProducts(data);
      })
      .catch((error) => console.error("Error:", error));
  }, [category_id, user_id]);
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
      <h3 style={{ color: "black" }}>カテゴリ肉 の検索結果: {number}件</h3>
      <div className="category_product_container">
        {products.map((product, index) => (
          <Product_cart key={index} product={product} userID={user_id} />
        ))}
      </div>
      <div className="pagination">{renderPageNumbers()}</div>
    </div>
  );
}
