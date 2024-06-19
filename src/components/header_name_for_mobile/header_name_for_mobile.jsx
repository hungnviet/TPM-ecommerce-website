"use client";
import "./header_name_for_mobile.css";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BeatLoader } from "react-spinners";
import { getCognitoUserSub } from "@/config/cognito";

export default function Header_name_for_mobile({ product_id }) {
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [user_id, setUserID] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [option, setOption] = useState([]);
  const [seller, setSeller] = useState({});

  const [listRegion, setListRegion] = useState([]);
  const [listProvince, setListProvince] = useState([]);

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

  useEffect(() => {
    fetchRegion();
    fetchProvince();
  }, []);

  useEffect(() => {
    getCognitoUserSub().then((user_id) => setUserID(user_id));
  }, []);

  useEffect(() => {
    if (!user_id || !product_id) return;

    fetch(`/api/user/product?product_id=${product_id}&user_id=${user_id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Bolero");
        console.log({ product: data });
        setProduct(data);

        setSeller(data.seller);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [product_id, user_id]);

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

  return product && seller && option ? (
    <div className="product_detail_mobile">
      <p className="product_detail_product_name_mobile">
        {product.Product_title}
      </p>
      <div className="product_detail_seller_mobile">
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
    </div>
  ) : (
    <BeatLoader color="#36d7b7" loading={isLoading} size={15} />
  );
}
