"use client";
import React, { useRef } from "react";
import AdvertisementCart from "@/components/advertisement_cart/advertisement_cart";
import Product_cart from "@/components/product_cart/product_cart";
import CategoryCart from "@/components/category_cart/category_cart";
import { useRouter } from "next/navigation";
import "./homepage.css";
import { useState, useEffect } from "react";
import Image from "next/image";
export const dynamic = "force-dynamic";
import { BeatLoader } from "react-spinners";
import { getCognitoUserSub } from "@/config/cognito";

export default function Page() {
  const productBestSellerListRef = useRef();
  const advetisementListRef = useRef();
  const router = useRouter();
  const [user_id, setuserID] = useState(null);

  const [advertisements, setAdvertisement] = useState([]);
  const advertisements2 = [
    "1.jpg",
    "2.jpg",
    "3.jpg",
    "4.jpg",
    "5.jpg",
    "6.jpg",
  ]; // replace with your actual image sources
  const categories = [
    "野菜",
    "果物",
    "米・穀類",
    "お茶",
    "魚介類",
    "肉",
    "卵・乳",
    "蜂蜜",
    "加工食品",
    "花・観葉植物",
  ];

  const [bestSellerProducts, setBestSellerProducts] = useState([]);
  const [currentImage, setCurrentImage] = useState(0);
  const [isLoadingShop, setIsLoadingShop] = useState(true);

  const nextImage = () => {
    setCurrentImage((prevImage) => (prevImage + 1) % advertisements2.length);
  };
  const prevImage = () => {
    setCurrentImage(
      (prevImage) =>
        (prevImage - 1 + advertisements2.length) % advertisements2.length
    );
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextImage();
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(timer); // Clean up on component unmount
  }, []);
  useEffect(() => {
    getCognitoUserSub().then((sub) => {
      setuserID(sub);
    });

    if (!user_id) return;

    fetch(`/api/user/productForHomePage?user_id=${user_id}`, {
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
        setBestSellerProducts(data);
        setIsLoadingShop(false);
      })
      .catch((error) => console.error("Error:", error));

    fetch(`/api/user/shops`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        dynamic: "force-dynamic",
      },
      next: { revalidate: 60 },
    })
      .then((response) => response.json())
      .then((data) => {
        setAdvertisement(data);
        console.log(data);
      })
      .catch((error) => console.error("Error:", error));
  }, [user_id]);

  const [saleProducts, setSaleProducts] = useState({
    productImg: "/product_2.webp",
    sellerImg: "/user_icon.png",
    sellerName: "野比のび太",
    productName: "赤いリンゴ",
    location: "北海道日高地方",
    price: "100円",
    unit: "1袋1kg",
    product_id: "product_id",
    isDiscount: true,
    percentage: 50,
  });

  return (
    <>
      {isLoadingShop ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              marginBottom: "20px",
              fontSize: "20px",
              animation: "fade 1s infinite",
            }}
          >
            TPM EC
          </div>
          <BeatLoader loading={isLoadingShop} size={10} color="#36d7b7" />
        </div>
      ) : (
        <div className="homepage_container">
          <div className="big_advertisement_container">
            <div className="advertisement_container">
              {advertisements.map((advertisement, index) => (
                <AdvertisementCart
                  key={index}
                  advertisement={advertisement}
                  user_id={user_id}
                />
              ))}
            </div>
          </div>
          <div className="best_seller_container">
            <p className="best_seller_title">新製品</p>
            <div className="big_best_seller_container">
              <div className="product_list" ref={productBestSellerListRef}>
                {bestSellerProducts.slice(-10).map((product, index) => (
                  <Product_cart
                    key={index}
                    product={product}
                    userID={user_id}
                  />
                ))}
              </div>

              <button
                onClick={() => router.push("/homepage/products")}
                className="morebutton"
              >
                もっと見る{" "}
              </button>
            </div>
          </div>
          <div className="best_seller_container">
            <p
              className="best_seller_title"
              onClick={() => router.push("/homepage/products")}
            >
              人気の商品
            </p>
            <div className="big_best_seller_container">
              <div className="product_list" ref={productBestSellerListRef}>
                {bestSellerProducts
                  .sort((a, b) => b.totalLike - a.totalLike)
                  .slice(0, 10)
                  .map((product, index) => (
                    <Product_cart
                      key={index}
                      product={product}
                      userID={user_id}
                    />
                  ))}
              </div>

              <button className="morebutton">もっと見る</button>
            </div>
          </div>
          {categories.map((category, i) => (
            <div className="best_seller_container" key={i}>
              <p className="best_seller_title">{category}</p>
              <div className="big_best_seller_container">
                <div className="product_list" ref={productBestSellerListRef}>
                  {bestSellerProducts
                    .filter((product) => product.Category_ID === i + 1)
                    .sort((a, b) => b.Product_ID - a.Product_ID)
                    .slice(0, 10)
                    .map((product, index) => (
                      <Product_cart
                        key={index}
                        product={product}
                        userID={user_id}
                      />
                    ))}
                </div>
                <button
                  className="morebutton"
                  onClick={() => router.push("/homepage/category/${i + 1}")}
                >
                  もっと見る
                </button>
              </div>
            </div>
          ))}
          <div className="best_seller_container">
            <p className="best_seller_title">割引商品</p>
            <div className="big_advertisement_container">
              <button onClick={prevImage}>
                <Image
                  src="/icon_arr_left.png"
                  alt="left_arrow"
                  width={30}
                  height={50}
                />
              </button>
              <div
                className="advertisement_container"
                ref={advetisementListRef}
                style={{
                  display: "flex",
                  overflowX: "hidden",
                  width: "90%",
                  justifyContent: "center",
                }}
              >
                {[...advertisements2, ...advertisements2]
                  .slice(currentImage, currentImage + 3)
                  .map((imageName, index) => (
                    <div
                      key={index}
                      style={{
                        width: "400px",
                        height: "400px",
                        overflow: "hidden",
                        flexShrink: 0,
                        margin: "40px",
                      }}
                    >
                      <img
                        src={`/${imageName}`}
                        alt={`Advertisement ${index}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>
                  ))}
              </div>
              <button onClick={nextImage}>
                <Image
                  src="/icon_arr_right.png"
                  alt="left_arrow"
                  width={30}
                  height={50}
                />
              </button>
            </div>
          </div>
          <div className="category_container">
            <p className="category_title">Category</p>
            <div className="category_list">
              <CategoryCart
                category={{ img: "/1.webp", name: "野菜", category_id: 1 }} // Vegetables
                userID={user_id}
              />
              <CategoryCart
                category={{ img: "/2.webp", name: "果物", category_id: 2 }} // Fruits
                userID={user_id}
              />
              <CategoryCart
                category={{ img: "/3.webp", name: "米・穀類", category_id: 3 }} // Rice & Grains
                userID={user_id}
              />
              <CategoryCart
                category={{ img: "/4.webp", name: "お茶", category_id: 4 }} // Tea
                userID={user_id}
              />
              <CategoryCart
                category={{ img: "/5.webp", name: "魚介類", category_id: 5 }} // Seafood
                userID={user_id}
              />
              <CategoryCart
                category={{ img: "/6.webp", name: "肉", category_id: 6 }} // Meat
                userID={user_id}
              />
              <CategoryCart
                category={{ img: "/7.webp", name: "卵・乳", category_id: 7 }} // Eggs & Dairy
                userID={user_id}
              />
              <CategoryCart
                category={{ img: "/8.webp", name: "蜂蜜", category_id: 8 }} // Honey
                userID={user_id}
              />
              <CategoryCart
                category={{ img: "/9.webp", name: "加工食品", category_id: 9 }} // Processed Foods
                userID={user_id}
              />
              <CategoryCart
                category={{
                  img: "/10.webp",
                  name: "花・観葉植物",
                  category_id: 10,
                }} // Flowers & Ornamental Plants
                userID={user_id}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
