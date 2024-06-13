"use client";
import "./dashboard_seller.css";
import { useState, useEffect } from "react";
import Dashboard_tag from "@/components/dashboard_tag/dashboard_tag";
import LineGraph from "@/components/graph_dashboard/graph_dashboard";
import BestSeller from "@/components/best_seller_dashboard/best_seller";
import Image from "next/image";
import { getCognitoUserSub } from "@/config/cognito";
import { BeatLoader } from "react-spinners";

export default function Page() {
  const currentDate = new Date();
  const [user_id, setUser_id] = useState(null);
  const [bestSeller, setBestSeller] = useState([]); // [ { product_id, product_name, sales }, ...
  const [totalOrders, setTotalOrders] = useState(0);
  const [completedOrders, setCompletedOrders] = useState(0);
  const [processingOrders, setProcessingOrders] = useState(0);
  const [isLoadingShop, setIsLoadingShop] = useState(true);
  const [subLoading, setSubLoading] = useState(true);
  const [subLoading2, setSubLoading2] = useState(true);
  const [shop, setShop] = useState({
    shopname: "",
    email: "",
    telephone: "",
    address: [],
  });

  useEffect(() => {
    getCognitoUserSub().then((sub) => {
      setUser_id(sub);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/seller/orders/?seller_id=${user_id}`
        );
        const data = await response.json();
        setTotalOrders(data.length);
        setCompletedOrders(
          data.filter((order) => order.Status === "Complete").length
        );
        setProcessingOrders(
          data.filter((order) => order.Status !== "Complete").length
        );
        setSubLoading(false);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    if (user_id) {
      fetchData();
    }
  }, [user_id]);

  useEffect(() => {
    if (user_id) {
      fetch(`/api/user/information?user_id=${user_id}`)
        .then((response) => response.json())
        .then((data) => {
          setShop({
            shopname: data.user.Shop_name,
            img: data.user.Shop_image,
          });
          setSubLoading2(false);
        })
        .catch((err) => console.log(err));

      fetch(`/api/seller/bestSeller?seller_id=${user_id}`)
        .then((response) => response.json())
        .then((data) => {
          setBestSeller(data);
        })
        .catch((err) => console.log(err));
    }
  }, [user_id]);

  useEffect(() => {
    if (!subLoading && !subLoading2) {
      setIsLoadingShop(false);
    }
  }, [subLoading2, subLoading]);

  const formattedDate = currentDate.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });

  const [optionGraph, setOptionGraph] = useState("month");
  const [dataGraph, setDataGraph] = useState([
    { label: "Jan", sales: 100 },
    { label: "Feb", sales: 150 },
    { label: "Mar", sales: 200 },
    { label: "Apr", sales: 120 },
    { label: "May", sales: 180 },
    { label: "Jun", sales: 250 },
  ]);

  function handleOptionGraph({ option }) {
    setOptionGraph(option);
    /// set dataGraph
    if (option === "week") {
      setDataGraph([
        { label: "Week 1", sales: 100 },
        { label: "Week 2", sales: 150 },
        { label: "Week 3", sales: 200 },
        { label: "Week 4", sales: 120 },
      ]);
    } else if (option === "month") {
      setDataGraph([
        { label: "Jan", sales: 100 },
        { label: "Feb", sales: 150 },
        { label: "Mar", sales: 200 },
        { label: "Apr", sales: 120 },
        { label: "May", sales: 180 },
        { label: "Jun", sales: 250 },
      ]);
    } else if (option === "year") {
      setDataGraph([
        { label: "2018", sales: 100 },
        { label: "2019", sales: 150 },
        { label: "2020", sales: 200 },
        { label: "2021", sales: 120 },
        { label: "2022", sales: 180 },
        { label: "2023", sales: 250 },
      ]);
    }
  }

  return (
    <>
      {isLoadingShop ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "white",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              marginBottom: "20px",
              fontSize: "20px",
              animation: "fade 1s infinite",
            }}
          >
            TPM EC
          </div>
          <BeatLoader loading={isLoadingShop} size={10} color="#36d7b7" />
        </div>
      ) : (
        <div className="dashboard_seller">
          <div className="dashboard_container">
            <div className="dashboard_header">
              <div>
                <div
                  style={{
                    width: "100px",
                    height: "100px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Image src={shop.img} fill="true" />
                </div>
                <p>{shop.shopname}</p>
              </div>
              <p>{formattedDate}</p>
            </div>
            <div className="dasboard_tag_container">
              <Dashboard_tag
                name="Total Order"
                totalValue={totalOrders}
                compareWithTime="Oct 2023"
                isUp={true}
              />
              <Dashboard_tag
                name="Processing Order"
                totalValue={processingOrders}
                rateOfChange={34.7}
                compareWithTime="Oct 2023"
                isUp={true}
              />
              <Dashboard_tag
                name="Completed Order"
                totalValue={completedOrders}
                rateOfChange={34.7}
                compareWithTime="Oct 2023"
                isUp={true}
              />
              <Dashboard_tag
                name="Return Order"
                totalValue={0}
                rateOfChange={34.7}
                compareWithTime="Oct 2023"
                isUp={false}
              />
            </div>
            <div className="middle_section_dashboard">
              <div className="line_graph_container_seller">
                <div className="header_graph_container_seller">
                  <h3>Sale Graph</h3>
                  <div>
                    <button
                      className={optionGraph === "week" ? "btn_active" : "btn"}
                      onClick={() => handleOptionGraph({ option: "week" })}
                    >
                      Weakly
                    </button>
                    <button
                      className={optionGraph === "month" ? "btn_active" : "btn"}
                      onClick={() => handleOptionGraph({ option: "month" })}
                    >
                      Monthly
                    </button>
                    <button
                      className={optionGraph === "year" ? "btn_active" : "btn"}
                      onClick={() => handleOptionGraph({ option: "year" })}
                    >
                      Yearly
                    </button>
                  </div>
                </div>
                <LineGraph salesData={dataGraph} />
              </div>
              <div className="best_seller_container_dashboard">
                <div className="best_seller_dashboard_header">
                  <h3>Best seller</h3>
                </div>
                <div className="best_seller_content">
                  {bestSeller.map((item, index) => (
                    <BestSeller
                      key={index}
                      product_id={item.Product_ID}
                      product_name={item.Product_title}
                      sales={item.TotalOrder}
                      image={item.Image_url}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
