import Image from "next/image";
import { useRouter } from "next/navigation";
import "./product_cart_seller.css";
import { useEffect, useState } from "react";
import { Knock } from "@knocklabs/node";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Product_cart({ product }) {
  const router = useRouter();
  function handleProductDetail() {
    router.push(`/seller_mode/product_list/${product.Product_ID}`);
  }
  return (
    <div className="product_cart_container">
      <ToastContainer />
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
        <button
          className="detail-button_cart_product"
          onClick={handleProductDetail}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
