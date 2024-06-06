"use client";
import { useState, useEffect } from "react";
import "./order_managment.css";
import { useRouter } from "next/navigation";
import { getCognitoUserSub } from "@/config/cognito";

export default function Page() {
  const route = useRouter();
  const [user_id, setUserID] = useState("");
  const [orders, setOrders] = useState([]);
  const [shopNames, setShopNames] = useState({});
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [shippingCompanies, setShippingCompanies] = useState([]);

  useEffect(() => {
    getCognitoUserSub().then((user_id) => setUserID(user_id));
    if (!user_id) return;
    function fetchorder() {
      fetch(`/api/user/orders?customer_id=${encodeURIComponent(user_id)}`)
        .then((response) => response.json())
        .then((data) => {
          setOrders(data);
          data.forEach((order) => fetchUserInformation(order.Seller_ID));
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
      <h3>Order management</h3>
      <div className="order_management_in4">
        <div className="field_bar_order_management">
          <div>Created date</div>
          <div>Seller Name</div>
          <div>Total Price</div>
          <div>Quantity of items</div>
          <div>Status</div>
          <div>Payment method</div>
          <div>Shipping company</div>
          <div>Actions</div>
        </div>
        {orders.map((item, index) => (
          <div className="field_bar_order_management" key={index}>
            <div>{new Date(item.Order_date).toISOString().split("T")[0]}</div>
            <div>{shopNames[item.Seller_ID]}</div>
            <div>{item.Total_price}</div>
            <div>{item.Total_quantity}</div>
            <div>{item.Status}</div>
            <div>
              {paymentMethods[item.Payment_method_id]?.Method_name}
            </div>{" "}
            <div>
              {shippingCompanies[item.Shipping_company_ID]?.Company_name}
            </div>{" "}
            <div>
              <button
                onClick={() => {
                  route.push(`/homepage/order_managment/${item.Order_ID}`);
                }}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
