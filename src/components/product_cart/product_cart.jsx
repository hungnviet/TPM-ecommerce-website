import Image from "next/image";
import { useRouter } from "next/navigation";
import "./product_cart.css";
import { useEffect, useState } from "react";
import { Knock } from "@knocklabs/node";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Product_cart({ product, userID, freeship }) {
  const router = useRouter();
  const knockClient = new Knock(process.env.NEXT_PUBLIC_KNOCK_SECRET);
  const productID = product.Product_ID;
  const [isLiked, setIsLiked] = useState(product.isLiked);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  function show_details() {
    router.push(`/homepage/${product.Product_ID}`);
  }
  function add_to_cart() {
    console.log(`user_id: ${userID}, product_id: ${product.Product_ID}`);
  }

  async function handleAddToCart() {
    if (userID === "guest") {
      router.push("/sign_in");
      return;
    }
    const data = {
      product_id: product.Product_ID,
      user_id: userID,
      option_number: 0,
      quantity: 1,
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
      toast.success("商品がカートに正常に追加されました。");
    } else {
      console.error("Error:", response.statusText);
      toast.error(
        "商品をカートに追加できませんでした。もう一度やり直してください。"
      );
    }
  }

  //fetch data for check like

  //like product
  async function handleLikeProduct() {
    if (userID == "guest") {
      router.push("/sign_in");
      return;
    }
    fetch("/api/user/product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productID, user_id: userID }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        setIsLiked(!isLiked);

        // Call the PUT function after the POST request is successful
        fetch(`/api/user/product?product_id=${productID}`, {
          method: "PUT",
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => console.error("Error:", error));
      })
      .catch((error) => {
        console.error("Error:", error);
      });
    await knockClient.workflows.trigger("likeproduct", {
      recipients: [product.Seller_ID],
      actor: userID,
      data: {
        product: {
          title: product.Product_title,
        },
      },
    });
  }

  //dislike product
  async function unlikedProduct() {
    fetch("/api/user/product", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ product_id: productID, user_id: userID }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message);
        setIsLiked(false);

        // Call the PUT request after the DELETE request is successful
        fetch(`/api/user/product?product_id=${productID}`, {
          method: "PUT",
        })
          .then((response) => response.json())
          .then((data) => console.log(data))
          .catch((error) => console.error("Error:", error));
      })
      .catch((error) => {
        console.error("Error:", error);
        ///
      });
  }

  return (
    <div className="product_cart_container">
      <ToastContainer />
      <div className="product_cart_image_container">
        <Image src={product.First_Image} fill="true" alt="product image" />
        {freeship && <div className="free_shipping_label">送料無料 </div>}
      </div>
      <div className="product_cart_info_container">
        <div className="seller_in4_product_cart">
          <div className="seller_img_product_cart">
            <Image src={product.Shop_image} fill="true" alt="Seller Image" />
          </div>
          <p>{product.Shop_name}</p>
        </div>
        <div className="product_in4_in_cart">
          <p className="product_name_cart">{product.Product_title}</p>
          {/* <div className="location_product_cart">
            <Image
              src={"/location_icon.png"}
              height={15}
              width={15}
              alt="Location Icon"
            />
            <p>{product.Shop_address}</p>
          </div> */}
          <div className="price_container_cart">
            <div>
              <p>{product.First_Option_Name}</p>
            </div>
            <div>
              <p>
                {Math.floor(product.First_Option_Price).toLocaleString("en-US")}
                円
              </p>
            </div>
          </div>
        </div>
        {/* {product.isDiscount && (
          <div className="discount_container_cart">
            <p>{product.percentage}% OFF</p>
          </div>
        )} */}
      </div>

      <div className="overlay_cart_product">
        <button className="detail-button_cart_product" onClick={show_details}>
          詳細を表示
        </button>
        <button
          className="detail-button_cart_product"
          onClick={handleAddToCart}
        >
          カートに追加
        </button>
      </div>
      <div className="btn_like_product_cart_homepage_container">
        {isLiked ? (
          <button onClick={unlikedProduct}>
            <Image
              src="/heart_liked.png"
              height={20}
              width={20}
              alt="Like Icon"
            />
          </button>
        ) : (
          <button onClick={handleLikeProduct}>
            <Image src="/heart.png" height={20} width={20} alt="Unlike Icon" />
          </button>
        )}
      </div>
    </div>
  );
}
