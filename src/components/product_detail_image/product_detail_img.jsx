"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import "./product_detail_img.css";
import { BeatLoader } from "react-spinners";
export default function Product_detail_img({ product_id }) {
  const [img_url, set_img_url] = useState([]);
  const [img_index, set_img_index] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `/api/user/product?product_id=${product_id}`
        );
        const data = await response.json();
        const imageUrls = data.images.map((image) => image.Image_url);
        set_img_url(imageUrls);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchProduct();
  }, [product_id]);

  function slide_right() {
    if (img_index < img_url.length - 1) {
      set_img_index(img_index + 1);
    } else {
      set_img_index(0);
    }
  }

  function slide_left() {
    if (img_index > 0) {
      set_img_index(img_index - 1);
    } else {
      set_img_index(img_url.length - 1);
    }
  }

  return (
    <div className="img_container_product_detail">
      <div className="big_img_container">
        <button className="btn_slide_img_left" onClick={slide_left}>
          <Image src="/icon_arr_left.png" width={30} height={30} />
        </button>
        {img_url.length === 0 ? (
          <div className="loading_img">
            <BeatLoader color="#36d7b7" />
          </div>
        ) : (
          <Image
            src={img_url[img_index]}
            alt="product_detail_img"
            fill="true"
          />
        )}

        <button className="btn_slide_img_right" onClick={slide_right}>
          <Image src="/icon_arr_right.png" width={30} height={30} />
        </button>
      </div>
      <div className="list_img_product_detail">
        {img_url.length > 0 &&
          img_url.map((item, index) => (
            <div
              key={index}
              className={
                img_index === index
                  ? "img_product_detail_active"
                  : "img_product_detail"
              }
              onClick={() => set_img_index(index)}
            >
              <Image src={item} alt="product_detail_img" fill />
            </div>
          ))}
      </div>
    </div>
  );
}
