"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import "./navbar_seller.css";
import Image from "next/image";
export default function NavbarSeller() {
  const router = useRouter();
  const pathname = usePathname();

  console.log(pathname);
  const [activeMode, setActiveMode] = useState("dashboard");

  function onClickDashboard() {
    if (pathname !== "dashboard") {
      setActiveMode("dashboard");
      //navigtasge to dashboard
      router.push(`/seller_mode/dashboard`);
    }
  }
  function onClickProduct() {
    if (pathname !== "/seller_mode/product_list") {
      //navigate to product
      router.push(`/seller_mode/product_list`);
    }
  }
  function onClickOrder() {
    if (pathname !== "/seller_mode/order_management") {
      //navigate to order
      router.push(`/seller_mode/order_management`);
    }
  }
  function onClickWaitingConfirm() {
    if (pathname !== "/seller_mode/waiting_confirm_order") {
      //navigate to profile
      router.push(`/seller_mode/waiting_confirm_order`);
    }
  }
  function onClickUploadProduct() {
    if (pathname !== "/seller_mode/upload_product") {
      //navigate to profile
      router.push(`/seller_mode/upload_product`);
    }
  }
  function onClickSetting() {
    if (pathname !== "/seller_mode/setting") {
      //navigate to profile
      router.push(`/seller_mode/setting`);
    }
  }
  return (
    <div className="Navbar_user_left_container">
      <div className="left_section_navbar_container">
        <button onClick={() => router.push(`/homepage`)}>
          <h1>TPM</h1>
        </button>
      </div>
      <div className="Navbar_user_left_btn_container">
        <button
          className={
            pathname === "/seller_mode/dashboard"
              ? "Navbar_user_active_button"
              : ""
          }
          onClick={onClickDashboard}
        >
          <Image
            src={
              pathname === "/seller_mode/dashboard"
                ? "/home_active_seller.png"
                : "/home_seller.png"
            }
            width={20}
            height={20}
            alt="icon"
          />
          Dashboard
        </button>
        <button
          className={
            pathname === "/seller_mode/product_list"
              ? "Navbar_user_active_button"
              : ""
          }
          onClick={onClickProduct}
        >
          <Image
            src={
              pathname === "/seller_mode/product_list"
                ? "/product_active_seller.png"
                : "/product_seller.png"
            }
            width={20}
            height={20}
            alt="icon"
          />
          Products
        </button>
        <button
          className={
            pathname === "/seller_mode/order_management"
              ? "Navbar_user_active_button"
              : ""
          }
          onClick={onClickOrder}
        >
          <Image
            src={
              pathname === "/seller_mode/order_management"
                ? "/order_active_seller.png"
                : "/order_seller.png"
            }
            width={20}
            height={20}
            alt="icon"
          />
          Orders
        </button>
        <button
          className={
            pathname === "/seller_mode/waiting_confirm_order"
              ? "Navbar_user_active_button"
              : ""
          }
          onClick={onClickWaitingConfirm}
        >
          <Image
            src={
              pathname === "/seller_mode/waiting_confirm_order"
                ? "/user_active_seller.png"
                : "/user_seller.png"
            }
            width={20}
            height={20}
            alt="icon"
          />
          Wating for confirm order
        </button>

        <button
          className={
            pathname === "/seller_mode/upload_product"
              ? "Navbar_user_active_button"
              : ""
          }
          onClick={onClickUploadProduct}
        >
          <Image
            src={
              pathname === "/seller_mode/upload_product"
                ? "/upload_active_seller.png"
                : "/upload_seller.png"
            }
            width={20}
            height={20}
            alt="icon"
          />
          Upload product
        </button>
        <button
          className={
            pathname === "/seller_mode/setting"
              ? "Navbar_user_active_button"
              : ""
          }
          onClick={onClickSetting}
        >
          <Image
            src={
              pathname === "/seller_mode/setting"
                ? "/setting_active.png"
                : "/setting.png"
            }
            width={20}
            height={20}
            alt="icon"
          />
          Setting
        </button>
      </div>
    </div>
  );
}
