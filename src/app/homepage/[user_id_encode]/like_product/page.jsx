"use client";
import { useEffect, useState } from "react";
import "./category.css";
import Product_cart from "@/components/product_cart/product_cart";
import { BeatLoader } from "react-spinners";

export default function Page({ params }) {
  const { user_id_encode, category_id } = params;
  const user_id = decodeURIComponent(user_id_encode);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 30;

  useEffect(() => {
    fetch(`/api/user/product_like?user_id=${user_id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        dynamic: "force-dynamic",
      },
      next: { revalidate: 60 },
    })
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((error) => console.error("Error:", error));
  }, []);

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
      <div className="header_of_like_page">
        <h3>あなたが好きな商品</h3>
        <BeatLoader color={"#000"} loading={isLoading} size={10} />
      </div>
      <div className="category_product_container">
        {!isLoading && currentProducts.length === 0 && (
          <h3>まだ何もお気に入りに追加していません</h3>
        )}
        {currentProducts.map((product, index) => (
          <Product_cart key={index} product={product} userID={user_id} />
        ))}
      </div>
      <div className="pagination">{renderPageNumbers()}</div>
    </div>
  );
}
