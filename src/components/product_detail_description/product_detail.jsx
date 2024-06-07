"use client";
import "./product_detail.css";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ShareOnSocial from "react-share-on-social";
import Link from "next/link";
import { BeatLoader } from "react-spinners";
import { getCognitoUserSub } from "@/config/cognito";

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

const provinces = [
  { province_id: 1, province_name: "Hokkaido" },
  { province_id: 2, province_name: "Aomori" },
  { province_id: 3, province_name: "Iwate" },
  { province_id: 4, province_name: "Miyagi" },
  { province_id: 5, province_name: "Akita" },
  { province_id: 6, province_name: "Yamagata" },
  { province_id: 7, province_name: "Fukushima" },
  { province_id: 8, province_name: "Ibaraki" },
  { province_id: 9, province_name: "Tochigi" },
  { province_id: 10, province_name: "Gunma" },
  { province_id: 11, province_name: "Saitama" },
  { province_id: 12, province_name: "Chiba" },
  { province_id: 13, province_name: "Tokyo" },
  { province_id: 14, province_name: "Kanagawa" },
  { province_id: 15, province_name: "Niigata" },
  { province_id: 16, province_name: "Toyama" },
  { province_id: 17, province_name: "Ishikawa" },
  { province_id: 18, province_name: "Fukui" },
  { province_id: 19, province_name: "Yamanashi" },
  { province_id: 20, province_name: "Nagano" },
  { province_id: 21, province_name: "Gifu" },
  { province_id: 22, province_name: "Shizuoka" },
  { province_id: 23, province_name: "Aichi" },
  { province_id: 24, province_name: "Mie" },
  { province_id: 25, province_name: "Shiga" },
  { province_id: 26, province_name: "Kyoto" },
  { province_id: 27, province_name: "Osaka" },
  { province_id: 28, province_name: "Hyogo" },
  { province_id: 29, province_name: "Nara" },
  { province_id: 30, province_name: "Wakayama" },
  { province_id: 31, province_name: "Tottori" },
  { province_id: 32, province_name: "Shimane" },
  { province_id: 33, province_name: "Okayama" },
  { province_id: 34, province_name: "Hiroshima" },
  { province_id: 35, province_name: "Yamaguchi" },
  { province_id: 36, province_name: "Tokushima" },
  { province_id: 37, province_name: "Kagawa" },
  { province_id: 38, province_name: "Ehime" },
  { province_id: 39, province_name: "Kochi" },
  { province_id: 40, province_name: "Fukuoka" },
  { province_id: 41, province_name: "Saga" },
  { province_id: 42, province_name: "Nagasaki" },
  { province_id: 43, province_name: "Kumamoto" },
  { province_id: 44, province_name: "Oita" },
  { province_id: 45, province_name: "Miyazaki" },
  { province_id: 46, province_name: "Kagoshima" },
  { province_id: 47, province_name: "Okinawa" },
];

export default function Product_detail_description({ product_id }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [user_id, setUserID] = useState("");
  const [selectedOptionDelivery, setSelectedOptionDelivery] = useState("");
  const [index_option, setIndex_option] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [option, setOption] = useState([]);
  const [seller, setSeller] = useState({});
  const [liked, setLiked] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectfreeshipping, setSelectFreeshipping] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const style = {
    copyContainer: {
      width: "0%",
      backgroundcolor: "white",
    },
    title: {
      color: "aquamarine",
      fontStyle: "italic",
    },
  };

  const [comments, setComment] = useState({
    date: "",
    content: "",
    image: "",
    name: "",
    avatar: "",
  });
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

  useEffect(() => {
    getCognitoUserSub().then((user_id) => setUserID(user_id));
    if (!user_id) return;
    fetch(`/api/user/product?product_id=${product_id}&user_id=${user_id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Bolero");
        console.log(data);
        setProduct(data);
        setOption(data.options);
        setSeller(data.seller);
        setIsLoading(false);
        if (data.isLiked === 1) {
          setLiked(true);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });

    fetch(`/api/user/comment?product_id=${product_id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setComment(
          data.map((item) => ({
            date: item.Comment_date,
            content: item.Comment,
            image: item.Comment_image,
            name: item.user.LName,
            avatar: "https://tpms3.s3.ap-southeast-2.amazonaws.com/9.jpg",
          }))
        );
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [product_id, user_id]);
  async function handleLikeProduct() {
    if (user_id == "guest") {
      router.push("/sign_in");
      return;
    }
    fetch("/api/user/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id, user_id }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        setLiked(true);
        setProduct((prevProduct) => ({
          ...prevProduct,
          likes: prevProduct.likes + 1,
        })); // Update likes

        // Call the PUT function after the POST request is successful
        fetch(`/api/user/product?product_id=${product_id}`, {
          method: "PUT",
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => console.error("Error:", error));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  function handleDetailClick(detail) {
    setSelectedTitle(detail.Title);
  }
  async function unlikedProduct() {
    fetch("/api/user/product", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id, user_id }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        setLiked(false);
        setProduct((prevProduct) => ({
          ...prevProduct,
          likes: prevProduct.likes - 1,
        })); // Update likes

        // Call the PUT request after the DELETE request is successful
        fetch(`/api/user/product?product_id=${product_id}`, {
          method: "PUT",
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => console.error("Error:", error));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }

  if (isLoading) {
    // Add this block
    return <BeatLoader color="#36d7b7" loading={isLoading} size={15} />;
  }
  async function handleAddToCart() {
    if (user_id === "guest") {
      router.push("/sign_in");
      return;
    }
    const data = {
      product_id,
      user_id,
      option_number: index_option,
      quantity,
    };

    const response = await fetch("/api/user/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result.message);
      setModalMessage("Item added to cart successfully!");
      setShowModal(true);
    } else {
      console.error("Error:", response.statusText);
      setModalMessage("Failed to add item to cart. Please try again.");
      setShowModal(true);
    }
  }
  function Modal({ show, message, onClose }) {
    if (!show) {
      return null;
    }

    return (
      <div className="modal">
        <div className="modal_content">
          <p>{message}</p>
          <div className="modal_actions">
            <button className="btn_continue" onClick={onClose}>
              Continue Shopping
            </button>
            <button
              className="btn_to_cart"
              onClick={() => router.push(`/homepage/cart`)}
            >
              Go to My Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  function visitShop() {
    router.push(`/homepage/shop/${encodeURIComponent(seller.User_ID)}`);
  }

  function visitCategory(category_id) {
    router.push(`/homepage/category/${category_id}`);
  }
  return product && seller && option && comments ? (
    <div className="product_detail">
      <p className="product_detail_product_name">{product.Product_title}</p>
      <div className="product_detail_seller">
        <div className="product_detail_seller_img_contaienr">
          <Image src={seller.Shop_image} alt="seller_img" fill="true" />
        </div>
        <div className="product_detail_seller_in4">
          <div>
            <Image
              src="/location_icon.png"
              height={15}
              width={15}
              alt="location icon"
            />
            <p>{seller.Shop_address}</p>
          </div>
          <div className="btn_container_heade_product_description">
            <button className="btn_visit_shop" onClick={visitShop}>
              <p className="product_detail_seller_name">{seller.Shop_name}</p>
            </button>
            <button
              className="btn_category_of_product"
              onClick={() => visitCategory(product.Category_ID)}
            >
              <p>{categories[product.Category_ID - 1]}</p>
            </button>
          </div>
          <div className="origin_container_product_detail">
            <p>起源</p>
            <div>
              <p>地域:</p>
              <Link href={`/homepage/region/${product.region_id}`}>
                {regions[product.region_id - 1].region_name}{" "}
              </Link>
            </div>
            <div>
              <p>意識的な :</p>
              <Link href={`/homepage/province/${product.province_id}`}>
                {provinces[product.province_id - 1].province_name}{" "}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="option_container_product_detail">
        {option.map((option, index) => {
          return (
            <div
              key={index}
              className={
                index_option === index
                  ? "product_detail_option_active"
                  : "product_detail_option"
              }
              onClick={() => setIndex_option(index)}
            >
              <p>{option.Option_name}</p>
              <p>{option.Option_price}円</p>
            </div>
          );
        })}
      </div>
      <div className="product_detail_selection_number_product">
        <p>製品の数</p>
        <div>
          <button
            onClick={() => {
              quantity > 1 && setQuantity(quantity - 1);
            }}
          >
            <Image src="/minus_icon.png" fill="true" alt="minus icon" />
          </button>
          <p>{quantity}</p>
          <button
            onClick={() => {
              setQuantity(quantity + 1);
            }}
          >
            <Image src="/add_icon.png" fill="true" alt="add icon" />
          </button>
        </div>
      </div>

      <div className="product_detail_btn">
        <p style={{ right: "40px", position: "relative", fontWeight: "bold" }}>
          Total like : {product.likes}
        </p>
        <button
          className="btn_like_product_detail"
          onClick={liked ? unlikedProduct : handleLikeProduct}
        >
          <Image
            src={liked ? "/heart_liked.png" : "/heart.png"}
            width={30}
            height={30}
          />
        </button>
        <button
          className="product_detail_add_to_cart"
          onClick={handleAddToCart}
        >
          Add to cart
        </button>
      </div>
      <div className="product_detail_description">
        <p className="description_title_product_detail">商品説明</p>
        <div>
          <p>{product.Product_description}</p>
        </div>
      </div>
      <div className="product_detail_description">
        <table>
          <tbody>
            <tr onClick={() => setSelectFreeshipping(true)}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                  borderBottom: "1px solid grey",
                }}
              >
                <td style={{ fontWeight: "bold", color: "grey" }}>
                  送料無料条件
                </td>
                <td>
                  {selectfreeshipping && (
                    <Image src={"/arrow.png"} width={24} height={24}></Image>
                  )}
                </td>
              </div>
            </tr>
            {selectfreeshipping && (
              <tr style={{ transition: "all 0.5s ease-in-out" }}>
                <td
                  style={{ paddingLeft: "10px", fontSize: "12px" }}
                  colSpan="6"
                >
                  <table className="sellerproduct">
                    <thead>
                      <tr>
                        {product.options.map((option, index) => (
                          <th key={`header-${index}`}>{option.Option_name}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {product.options.map((option, index) => (
                          <td key={`price-${index}`}>
                            {option.FreeshipCondition}つ購入すると送料無料
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            )}

            {product.description.map((detail, index) => (
              <React.Fragment key={index}>
                <tr onClick={() => handleDetailClick(detail)}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      borderBottom: "1px solid grey",
                    }}
                  >
                    <td style={{ fontWeight: "bold", color: "grey" }}>
                      {detail.Title}
                    </td>
                    <td>
                      {selectedTitle !== detail.Title && (
                        <Image
                          src={"/arrow.png"}
                          width={24}
                          height={24}
                        ></Image>
                      )}
                    </td>
                  </div>
                </tr>
                {selectedTitle === detail.Title && (
                  <tr style={{ transition: "all 0.5s ease-in-out" }}>
                    <td style={{ marginLeft: "10px", fontSize: "12px" }}>
                      {detail.Content}
                    </td>
                  </tr>
                )}
                <div style={{ height: "20px" }} />
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div>
        <ShareOnSocial
          textToShare={product.Product_title}
          link={window.location.href}
          linkTitle={product.Product_title}
          linkMetaDesc={product.Product_description}
          noReferer
        >
          <button className="share">Share this product ↗</button>
        </ShareOnSocial>
      </div>
      <div className="comments_container">
        <h2>みんなの投稿</h2>
        <h4>2505件</h4>
        {comments &&
          comments.map((comment, index) => (
            <div className="comments" key={index}>
              <div className="comment_content">
                <div style={{ display: "flex", flexDirection: "row" }}>
                  <Image
                    style={{ borderRadius: "50%" }}
                    src={comment.avatar}
                    height={50}
                    width={50}
                    alt="avatar"
                  />
                  <div className="comment_user">
                    <p>{comment.name}</p>
                    <p>{comment.date}</p>
                  </div>
                </div>
                <p>{comment.content}</p>
                {comment.image && (
                  <div className="comment_img">
                    <Image
                      src={comment.image}
                      height={150}
                      width={150}
                      alt="comment"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
      </div>
      <Modal
        show={showModal}
        message={modalMessage}
        onClose={() => setShowModal(false)}
      />
    </div>
  ) : (
    <BeatLoader color="#36d7b7" loading={isLoading} size={15} />
  );
}
