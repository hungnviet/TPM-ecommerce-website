"use client";
import { useState, useEffect } from "react";
import "./order_managment.css";
import { useRouter } from "next/navigation";
import { getCognitoUserSub } from "@/config/cognito";
import { BeatLoader } from "react-spinners";

export default function Page() {
  const route = useRouter();
  const [user_id, setUserID] = useState("");
  const [orders, setOrders] = useState([]);
  const [shopNames, setShopNames] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [shippingCompanies, setShippingCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCognitoUserSub().then((user_id) => setUserID(user_id));
    if (!user_id) return;
    function fetchorder() {
      fetch(`/api/user/orders?customer_id=${encodeURIComponent(user_id)}`)
        .then((response) => response.json())
        .then((data) => {
          setOrders([...data].reverse());
          data.forEach((order) => fetchUserInformation(order.Seller_ID));
          setIsLoading(false);
        })
        .catch((error) => console.error(error));
    }
    function fetchPaymentMethods() {
      fetch(`/api/seller/payment_methods`)
        .then((response) => response.json())
        .then((data) => {
          setPaymentMethods(data);
        })
        .catch((error) => console.error(error));
    }
    function fetchShippingcompany() {
      fetch(`/api/seller/shipping_companies`)
        .then((response) => response.json())
        .then((data) => {
          setShippingCompanies(data);
          console.log(data);
        })
        .catch((error) => console.error(error));
    }
    fetchorder();
    fetchPaymentMethods();
    fetchShippingcompany();
  }, [user_id]);
  async function fetchUserInformation(Seller_ID) {
    const response = await fetch(
      `/api/user/information?user_id=${encodeURIComponent(Seller_ID)}`
    );
    if (response.ok) {
      const data = await response.json();
      // Assuming the response data has a 'shopname' field
      setShopNames((prevShopNames) => ({
        ...prevShopNames,
        [Seller_ID]: data.user.Shop_name,
      }));
    } else {
      console.error("Error:", response.statusText);
    }
  }
  return (
    <div className="order_management_page_container">
      <h3>注文管理</h3>

      <div className="order_management_in4">
        <div className="field_bar_order_management">
          <div>作成日</div>
          <div>販売者名</div>
          <div>合計金額</div>
          <div>アイテムの数量</div>
          <div>状態</div>
          <div>支払方法</div>
          <div>運送会社</div>
          <div>行動</div>
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {" "}
          <BeatLoader color={"#36d7b7"} loading={isLoading} size={15} />
        </div>
        {orders.map((item, index) => (
          <div className="field_bar_order_management" key={index}>
            <div>{new Date(item.Order_date).toISOString().split("T")[0]}</div>
            <div>{shopNames[item.Seller_ID]}</div>
            <div>{Math.floor(item.Total_price)}円</div>
            <div>{item.Total_quantity}</div>
            <div>{item.Status}</div>
            <div>
              {paymentMethods[item.Payment_method_id - 1]?.Method_name}
            </div>{" "}
            <div>
              {shippingCompanies[item.Shipping_company_ID - 1]?.Company_name}
            </div>{" "}
            <div>
              <button
                onClick={() => {
                  route.push(`/homepage/order_managment/${item.Order_ID}`);
                }}
              >
                ビュー
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
