import Image from "next/image";
import { useRouter } from "next/navigation";
import "./product_cart.css";
import { useEffect, useState } from "react";
export default function Product_cart({ product, userID }) {
  const router = useRouter();
  const productID = product.Product_ID;
  const [isLiked, setIsLiked] = useState(product.isLiked);
  function show_details() {
    router.push(
      `/homepage/${encodeURIComponent(userID)}/${product.Product_ID}`
    );
  }
  function add_to_cart() {
    console.log(`user_id: ${userID}, product_id: ${product.Product_ID}`);
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

  return (
    <div className="product_cart_container">
      <div className="product_cart_image_container">
        <Image src={product.First_Image} fill="true" alt="product image" />
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
              <p>{product.First_Option_Price}</p>
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
        <button className="detail-button_cart_product" onClick={add_to_cart}>
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
