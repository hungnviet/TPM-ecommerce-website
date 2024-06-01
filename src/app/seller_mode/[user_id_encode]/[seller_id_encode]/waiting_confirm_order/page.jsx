"use client";
import "./page.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Knock } from "@knocklabs/node";

export default function Page({ params }) {
  const [orderWatingConfirm, setOrderWatingConfirm] = useState([]);
  const route = useRouter();
  const knockClient = new Knock(process.env.NEXT_PUBLIC_KNOCK_SECRET);

  const { user_id_encode, seller_id_encode } = params;

  async function fetchOrders() {
    try {
      const response = await fetch(
        `/api/seller/orders?seller_id=${seller_id_encode}`
      );
      const data = await response.json();
      console.log(data);
      const waitingConfirmationOrders = data.filter(
        (order) => order.Status === "Waiting confirmation"
      );
      setOrderWatingConfirm(waitingConfirmationOrders);
      console.log(data);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchOrders();
  }, [seller_id_encode]);
  async function updateOrderStatus(orderId, status, customerid) {
    const response = await fetch(`/api/seller/order`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Status: status,
        Order_ID: orderId,
        Expected_delivery_date: null,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    await knockClient.workflows.trigger("confirmorder", {
      recipients: [customerid],
      actor: seller_id_encode,
    });

    // Refresh the order list after updating the status
    fetchOrders();
  }
  async function deleteOrder(orderId) {
    const response = await fetch(`/api/seller/order`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Order_ID: orderId,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Refresh the order list after deleting the order
    fetchOrders();
  }

  return (
    <div className="waiting_confirm_container">
      <div className="waiting_conform_order">
        <h3>Confirmation is awaited before proceeding with the order.</h3>
        <table>
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Order ID</th>
              <th>Total Price</th>
              <th>User Name</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orderWatingConfirm.map((order, index) => (
              <tr key={index}>
                <td>{order.Total_quantity}</td>
                <td>{order.Order_ID}</td>
                <td>{order.Total_price}</td>
                <td>{order.FName + " " + order.LName}</td>
                <td>
                  {new Date(order.Order_date).toISOString().split("T")[0]}
                </td>
                <td>
                  <button
                    onClick={() => {
                      route.push(
                        `/seller_mode/view_order/${order.Order_ID}/${order.Customer_ID}`
                      );
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() =>
                      updateOrderStatus(
                        order.Order_ID,
                        "Packaging",
                        order.Customer_ID
                      )
                    }
                  >
                    Accept
                  </button>
                  <button onClick={() => deleteOrder(order.Order_ID)}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
