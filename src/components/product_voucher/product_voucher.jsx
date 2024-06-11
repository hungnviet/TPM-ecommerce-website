"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import "./product_voucher.css";
import { BeatLoader } from "react-spinners";

export default function Product_detail_img({ product_id }) {
  const [voucher, setVoucher] = useState(null);
  const [voucherseller, setVoucherSeller] = useState(null);
  const [seller, setSeller] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(
          `/api/user/product?product_id=${product_id}`
        );
        const data = await response.json();
        setVoucher(data.voucher);
        setSeller(data.Seller_ID);
      } catch (error) {
        console.error("Error:", error);
      }
    };

    const getVoucherSeller = async () => {
      if (!seller) return;
      const res = await fetch(`/api/seller/vouchers?seller_id=${seller}`);
      const data = await res.json();
      console.log(data);
      setVoucherSeller(data);
    };

    fetchProduct().then(() => {
      getVoucherSeller(); // Ensure this is called after fetchProduct is resolved
    });
  }, [product_id, seller]); // Remove seller to avoid loop, manage calls inside useEffect

  return (
    <div className="product-voucher-details">
      <h2>Vouchers</h2>
      {(voucher || voucherseller) && (
        <table className="shipping-table">
          <thead>
            <tr>
              <th>Voucher Name</th>
              <th>Type</th>
              <th>Discount Value</th>
            </tr>
          </thead>
          <tbody>
            {voucher &&
              voucher.map((v, index) => (
                <tr key={`voucher-${index}`}>
                  <td>{v.Voucher_Name}</td>
                  <td>{v.Type}</td>
                  <td>{v.Type !== "Freeship" ? `${v.Discount_Value}%` : ""}</td>
                </tr>
              ))}
            {voucherseller &&
              voucherseller.map((v, index) => (
                <tr key={`voucherseller-${index}`}>
                  <td>{v.Voucher_Name}</td>
                  <td>{v.Type}</td>
                  <td>{v.Type !== "Freeship" ? `${v.Discount_Value}%` : ""}</td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
