"use client";
import "./product_detail.css";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ShareOnSocial from "react-share-on-social";
import Link from "next/link";
import { BeatLoader } from "react-spinners";
import { getCognitoUserSub } from "@/config/cognito";
import {
  EmailIcon,
  FacebookIcon,
  FacebookShareButton,
  FacebookMessengerIcon,
  GabIcon,
  HatenaIcon,
  InstapaperIcon,
  LineIcon,
  LineShareButton,
  LinkedinIcon,
  LivejournalIcon,
  MailruIcon,
  OKIcon,
  PinterestIcon,
  PocketIcon,
  RedditIcon,
  TelegramIcon,
  TumblrIcon,
  TwitterIcon,
  ViberIcon,
  VKIcon,
  WeiboIcon,
  WhatsappIcon,
  TwitterShareButton,
  WorkplaceIcon,
  XIcon,
} from "react-share";

export default function Product_detail_description({ product_id }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [user_id, setUserID] = useState("");
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
  const [listRegion, setListRegion] = useState([]);
  const [listProvince, setListProvince] = useState([]);
  const [listPaymentMethod, setListPaymentMethod] = useState([]);
  const [listShippingMethod, setListShippingMethod] = useState([]);
  const [isShowShipping, setIsShowShipping] = useState(false);
  const [isShowPayment, setIsShowPayment] = useState(false);

  const [comments, setComment] = useState([
    {
      date: "",
      content: "",
      image: "",
      name: "",
      avatar: "",
    },
  ]);

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

  async function fetchRegion() {
    const res = await fetch("/api/general/regions");
    const data = await res.json();
    console.log(data);
    setListRegion(data);
  }

  async function fetchProvince() {
    const res = await fetch("/api/general/provinces");
    const data = await res.json();
    console.log(data);

    setListProvince(data);
  }

  async function fetchPaymentMethod({ seller_id }) {
    console.log("seller_id for getting payment method", seller_id);
    const res = await fetch(
      `/api/user/payment_method_of_seller?seller_id=${seller_id}`
    );
    const data = await res.json();
    setListPaymentMethod(data);
  }

  async function fetchShippingMethod({ seller_id }) {
    console.log("seller_id for getting shipping method", seller_id);
    const res = await fetch(
      `/api/user/shipping_company_of_seller?seller_id=${seller_id}`
    );
    const data = await res.json();
    setListShippingMethod(data);
  }

  useEffect(() => {
    fetchRegion();
    fetchProvince();
  }, []);

  useEffect(() => {
    getCognitoUserSub().then((user_id) => setUserID(user_id));
  }, []);

  useEffect(() => {
    if (!product) return;
    if (product.Seller_ID) {
      fetchPaymentMethod({ seller_id: product.Seller_ID });
      fetchShippingMethod({ seller_id: product.Seller_ID });
    }
  }, [product]);

  useEffect(() => {
    console.log("listPaymentMethod", listPaymentMethod);
    console.log("listShippingMethod", listShippingMethod);
  }, [listPaymentMethod, listShippingMethod]);

  useEffect(() => {
    if (!user_id || !product_id) return;

    fetch(`/api/user/product?product_id=${product_id}&user_id=${user_id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Bolero");
        console.log({ product: data });
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

  if (isLoading) {
    // Add this block
    return <BeatLoader color="#36d7b7" loading={isLoading} size={15} />;
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
                {listRegion.length > 0 &&
                  listRegion[product.region_id - 1].Region_name}{" "}
              </Link>
            </div>
            <div>
              <p>意識的な :</p>
              <Link href={`/homepage/province/${product.province_id}`}>
                {}
                {listProvince.length > 0 &&
                  listProvince[product.province_id - 1].Province_name}
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="option_container_product_detail">
        {product.discount &&
          product.discount.length > 0 &&
          product.discount[0].Condition_value > 0 && (
            <div className="product_detail_discount">
              <p>Buy {product.discount[0].Condition_value} to get Freeship!</p>
            </div>
          )}
        {option.map((option, index) => {
          return option.Quantity === option.QuantityOfGoodsSold ? (
            <div key={index} className="option_sold_out">
              <p className="option_name_in_detail">{option.Option_name}</p>
              <div>
                <p>
                  {Math.floor(option.Option_price).toLocaleString("en-US")}円
                </p>
                <p className="inventory_option_detail">
                  倉庫: {option.Quantity - option.QuantityOfGoodsSold}製品
                </p>
              </div>
              <div className="sold_out_tag"> 売り切れ</div>
            </div>
          ) : (
            <div
              key={index}
              className={
                index_option === index
                  ? "product_detail_option_active"
                  : "product_detail_option"
              }
              onClick={() => setIndex_option(index)}
            >
              <p className="option_name_in_detail">{option.Option_name}</p>
              <div>
                <p>
                  {Math.floor(option.Option_price).toLocaleString("en-US")}円
                </p>
                <p className="inventory_option_detail">
                  倉庫: {option.Quantity - option.QuantityOfGoodsSold}製品
                </p>
              </div>
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
        <div className="like_total_order_container">
          <div className="like_container_in_detail">
            <p
              style={{
                position: "relative",
                fontWeight: "bold",
              }}
            >
              {product.likes}
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
          </div>
          <div className="total_order_container_in_detail">
            <p
              style={{
                position: "relative",
                fontWeight: "bold",
              }}
            >
              Total Order:
            </p>
            <p> {product.TotalOrder} orders</p>
          </div>
        </div>

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
      <div className="Shipping_company_product_detail_user">
        <div className="header_table">
          <h4>配送会社</h4>
          <button onClick={() => setIsShowShipping(!isShowShipping)}>
            {isShowShipping ? "隠れる" : "見せる"}
          </button>
        </div>

        <table className="shipping-table">
          <thead>
            <tr>
              <th>会社名</th>
              <th>価格</th>
              <th>説明</th>
            </tr>
          </thead>
          <tbody>
            {/* Repeat this row for each company */}
            {isShowShipping &&
              listShippingMethod.length > 0 &&
              listShippingMethod.map((company, index) => (
                <tr key={index}>
                  <td>{company.Company_name}</td>
                  <td>{company.Price}</td>
                  <td>{company.Note}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div>
        <div className="header_table">
          <h4>支払方法</h4>
          <button onClick={() => setIsShowPayment(!isShowPayment)}>
            {isShowPayment ? "隠れる" : "見せる"}
          </button>
        </div>

        <table className="payment-table">
          <thead>
            <tr>
              <th>支払方法</th>
              <th>説明</th>
            </tr>
          </thead>
          <tbody>
            {/* Repeat this row for each payment method */}
            {isShowPayment &&
              listPaymentMethod.length > 0 &&
              listPaymentMethod.map((method, index) => (
                <tr key={index}>
                  <td>{method.Method_name}</td>
                  <td>{method.Note}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      <div>
        <FacebookShareButton
          style={{ marginRight: "10px" }}
          url={window.location.href}
        >
          <FacebookIcon
            style={{ borderRadius: "20px" }}
            size={40}
          ></FacebookIcon>
        </FacebookShareButton>
        <TwitterShareButton
          style={{ marginRight: "10px" }}
          url={window.location.href}
        >
          <XIcon style={{ borderRadius: "20px" }} size={40}></XIcon>
        </TwitterShareButton>
        <LineShareButton
          style={{ marginRight: "10px" }}
          url={window.location.href}
        >
          <LineIcon style={{ borderRadius: "20px" }} size={40}></LineIcon>
        </LineShareButton>
        {/* <ShareOnSocial
          textToShare={product.Product_title}
          link={window.location.href}
          linkTitle={product.Product_title}
          linkMetaDesc={product.Product_description}
          noReferer
        >
          <button className="share">Share this product ↗</button>
        </ShareOnSocial> */}
      </div>
      <div className="comments_container">
        <h2>みんなの投稿</h2>
        <h4>2505件</h4>
        {comments &&
          comments.length > 0 &&
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
