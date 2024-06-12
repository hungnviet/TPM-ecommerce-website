"use client";
import "./order_management.css";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Knock } from "@knocklabs/node";
import { getCognitoUserSub } from "@/config/cognito";

export default function Page() {
  const [user_id, setUser_id] = useState(null);
  const route = useRouter();
  const [order, setOrder] = useState([]);
  const knockClient = new Knock(process.env.NEXT_PUBLIC_KNOCK_SECRET);
  const [customerid, setCustomerid] = useState("");
  const [indexUpdate, setIndexUpdate] = useState(-1);

  useEffect(() => {
    getCognitoUserSub().then((sub) => {
      setUser_id(sub);
    });
  }, []);

  async function fetchData() {
    const response = await fetch(`/api/seller/orders?seller_id=${user_id}`);
    const data = await response.json();
    console.log(data);
    console.log(user_id);
    const filteredOrders = data.filter(
      (order) => order.Status !== "Waiting confirmation"
    );
    setOrder(filteredOrders);
  }
  useEffect(() => {
    if (user_id) {
      fetchData();
    }
  }, [user_id]);

  useEffect(() => {
    console.log(order);
  }, [order]);

  async function onClick(index) {
    if (indexUpdate === index) {
      await setCustomerid(order[index].Customer_ID);
      //save
      const data = {
        Order_ID: order[index].Order_ID,
        Status: order[index].Status,
        Expected_delivery_date: new Date(order[index].Expected_delivery_date)
          .toISOString()
          .split("T")[0],
      };
      console.log(data);
      const response = await fetch("/api/seller/order", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (response.ok) {
        alert("Update successfully");
        await knockClient.workflows.trigger("updateproduct", {
          recipients: [customerid],
          actor: user_id,
        });
      } else {
        await fetchData();
        alert("Update failed");
      }
      setIndexUpdate(-1);
    } else {
      //edit
      console.log("Edit");
      setIndexUpdate(index);
    }
  }

  function handleChangeState(event, index) {
    const newOrder = [...order];
    newOrder[index].Status = event.target.value;
    setOrder(newOrder);
  }

  function handleChangeDateExpected(event, index) {
    const newOrder = [...order];
    newOrder[index].Expected_delivery_date = event.target.value;
    setOrder(newOrder);
  }
  function handleChangeDateCreation(event, index) {
    const newOrder = [...order];
    newOrder[index].Order_date = event.target.value;
    setOrder(newOrder);
  }
  return (
    <div className="order_management_seller_container">
      <div className="order_management_seller">
        <h3>注文管理</h3>
        {/* <div className="order_management_seller_filter_container">
          <div>
            <label>From</label>
            <input type="date" />
            <label>To</label>
            <input type="date" />
          </div>
          <div>
            <label>Type</label>
            <select>
              <option>All</option>
              <option>Completed</option>
              <option>Packaging</option>
              <option>Shipping</option>
            </select>
          </div>
          <div>
            <label>Order ID:</label>
            <input type="text" />
          </div>
          <button>Apply</button>
          <button>Reset</button>
        </div> */}
        <div className="table_order_seller">
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Order ID</th>
                <th>Status</th>
                <th>Total Price</th>
                <th>Creation Date</th>
                <th>Expected Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {order.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.Order_ID}</td>
                  <td
                    style={{
                      color:
                        item.Status === "Complete"
                          ? "green"
                          : item.Status === "Packaging"
                          ? "orange"
                          : item.Status === "Shipping"
                          ? "blue"
                          : "black",
                    }}
                  >
                    {indexUpdate === index ? (
                      <select
                        value={order[index].Status}
                        onChange={(e) => handleChangeState(e, index)}
                      >
                        <option value="Complete">Complete</option>
                        <option value="Packaging">Packaging</option>
                        <option value="Shipping">Shipping</option>
                        <option value="waiting confirmation">
                          waiting confirmation
                        </option>
                      </select>
                    ) : (
                      item.Status
                    )}
                  </td>
                  <td>{item.Total_price}</td>
                  <td>
                    {indexUpdate === index ? (
                      <input
                        type="Date"
                        value={
                          new Date(order[index].Order_date)
                            .toISOString()
                            .split("T")[0]
                        }
                        onChange={(e) => handleChangeDateCreation(e, index)}
                      />
                    ) : (
                      new Date(item.Order_date).toLocaleDateString()
                    )}
                  </td>
                  <td>
                    {indexUpdate === index ? (
                      <input
                        type="Date"
                        value={
                          new Date(order[index].Expected_delivery_date)
                            .toISOString()
                            .split("T")[0]
                        }
                        onChange={(e) => handleChangeDateExpected(e, index)}
                      />
                    ) : (
                      new Date(item.Expected_delivery_date).toLocaleDateString()
                    )}
                  </td>
                  <td
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <button
                      onClick={() => {
                        route.push(
                          `/seller_mode/view_order/${item.Order_ID}/${item.Customer_ID}`
                        );
                      }}
                    >
                      View
                    </button>
                  </td>
                  <td
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {(item.Status !== "Complete" || indexUpdate === index) && (
                      <button onClick={() => onClick(index)}>
                        {indexUpdate === index ? "Save" : "Edit"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
