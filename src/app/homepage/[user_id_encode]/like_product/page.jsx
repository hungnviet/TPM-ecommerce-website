"use client";
import { useEffect, useState } from "react";
import "./category.css";
import Product_cart from "@/components/product_cart/product_cart";

export default function Page({ params }) {
  const { user_id_encode, category_id } = params;
  const user_id = decodeURIComponent(user_id_encode);
  const [products, setProducts] = useState([]);
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
        const transformedData = data.products.map((item) => ({
          productImg: item.firstImage,
          sellerImg: item.shopImage,
          sellerName: item.shopName,
          productName: item.title,
          location: "北海道日高地方",
          price: item.firstOptionPrice,
          unit: "1袋1kg",
          product_id: item.productId,
          category_id: item.categoryId,
          isDiscount: false,
          percentage: 0,
          totalLikes: item.totalLikes,
        }));
        setProducts(transformedData);
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
      <div className="category_product_container">
        {currentProducts.map((product, index) => (
          <Product_cart key={index} product={product} userID={user_id} />
        ))}
      </div>
      <div className="pagination">{renderPageNumbers()}</div>
    </div>
  );
}
