"use client";
import "./product_detail.css";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ShareOnSocial from "react-share-on-social";

export default function Product_detail_description({ user_id, product_id }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [selectedOptionDelivery, setSelectedOptionDelivery] = useState("");
  const [index_option, setIndex_option] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true); // Add this line
  const [option, setOption] = useState([]);
  const [seller, setSeller] = useState({});
  const [liked, setLiked] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
    fetch(`/api/user/product?product_id=${product_id}&user_id=${user_id}`)
      .then((response) => response.json())
      .then((data) => {
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
  }, [product_id]);
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
    return <div>Loading...</div>;
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
              onClick={() =>
                router.push(`/homepage/${encodeURIComponent(user_id)}/cart`)
              }
            >
              Go to My Cart
            </button>
          </div>
        </div>
      </div>
    );
  }

  function visitShop() {
    router.push(
      `/homepage/${encodeURIComponent(user_id)}/shop/${encodeURIComponent(
        seller.User_ID
      )}`
    );
  }

  function visitCategory(category_id) {
    router.push(
      `/homepage/${encodeURIComponent(user_id)}/category/${category_id}`
    );
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
    <div>Loading...</div>
  );
}
