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
      {isLoading ? (
        <div className="loader_container">
          <BeatLoader color={"#36d7b7"} loading={isLoading} size={15} />
        </div>
      ) : (
        <div className="table_scrollable">
          <table className="order_table">
            <thead>
              <tr>
                <th>作成日</th>
                <th>販売者名</th>
                <th>合計金額</th>
                <th>アイテムの数量</th>
                <th>状態</th>
                <th>支払方法</th>
                <th>運送会社</th>
                <th>プロモーション</th>
                <th>行動</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((item, index) => (
                <tr key={index}>
                  <td>
                    {new Date(item.Order_date).toISOString().split("T")[0]}
                  </td>
                  <td>{shopNames[item.Seller_ID] || "Loading..."}</td>
                  <td>{Math.floor(item.Total_price)}円</td>
                  <td>{item.Total_quantity}</td>
                  <td>{item.Status}</td>
                  <td>
                    {paymentMethods[item.Payment_method_id - 1]?.Method_name}
                  </td>
                  <td>
                    {
                      shippingCompanies[item.Shipping_company_ID - 1]
                        ?.Company_name
                    }
                  </td>
                  <td>
                    {item.DiscountType === "Discount"
                      ? `${Math.floor(
                          item.Discount_percentage
                        )}% プロモーション`
                      : item.DiscountType === "Freeship"
                      ? "フリーシップ"
                      : "プロモーションはありません"}
                  </td>
                  <td>
                    <button
                      onClick={() =>
                        route.push(`/homepage/order_managment/${item.Order_ID}`)
                      }
                    >
                      ビュー
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
