"use client";
import { useState, useEffect } from "react";
import "./setting.css";
import Image from "next/image";

export default function Page({ params }) {
  const { user_id_encode } = params;
  const [shop, setShop] = useState({
    shopname: "",
    img: "",
    address: "",
  });
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showShippingMethods, setShowShippingMethods] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [addMethodVisible, setAddMethodVisible] = useState(false);
  const [allshippingMethods, setAllShippingMethods] = useState([]);
  const [allpaymentMethods, setAllPaymentMethods] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpen2, setModalOpen2] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);
  function Modal({ isOpen, onClose, onSave, children }) {
    if (!isOpen) return null;

    return (
      <div className="modal">
        <div className="modal-content">
          {children}
          <button onClick={onSave} className="save-button">
            Save
          </button>
          <button onClick={onClose} className="close-button">
            Close
          </button>
        </div>
      </div>
    );
  }
  useEffect(() => {
    fetch(`/api/user/information?user_id=${user_id_encode}`)
      .then((response) => response.json())
      .then((data) => {
        setShop({
          shopname: data.user.Shop_name,
          img: data.user.Shop_image,
          address: data.address[0].Address,
        });
      })
      .catch((err) => console.log(err));
  }, [user_id_encode]);
  async function fetchMethods() {
    const paymentResponse = await fetch(
      `/api/user/payment_method_of_seller?seller_id=${user_id_encode}`
    );
    const paymentData = await paymentResponse.json();
    setPaymentMethods(paymentData);

    const shippingResponse = await fetch(
      `/api/user/shipping_company_of_seller?seller_id=${user_id_encode}`
    );
    const shippingData = await shippingResponse.json();
    setShippingMethods(shippingData);
  }
  useEffect(() => {
    async function fetchAllMethods() {
      const paymentResponse = await fetch(`/api/seller/payment_methods`);
      const shippingResponse = await fetch(`/api/seller/shipping_companies`);
      const shippingData = await shippingResponse.json();
      const paymentData = await paymentResponse.json();
      setAllPaymentMethods(paymentData);
      console.log(allpaymentMethods);
      setAllShippingMethods(shippingData);
    }

    fetchMethods();
    fetchAllMethods();
  }, [user_id_encode]);

  function handleDeleteMethod(type, id) {
    // Placeholder function for deleting a method
    console.log(`Delete ${type} method with id: ${id}`);
    if (type === "payment") {
      async function deletepayment() {
        const response = await fetch(`/api/seller/payment_methods`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seller_ID: user_id_encode,
            method_ID: [id],
          }),
        });
        if (!response.ok) {
          console.log("Failed to delete payment method");
        }

        // Update paymentMethods state with the new method
        fetchMethods();
      }
      deletepayment();
    }
    if (type === "shipping") {
      async function deleteshipping() {
        const response = await fetch(`/api/seller/shipping_companies`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            seller_ID: user_id_encode,
            company_ID: [id],
          }),
        });
        if (!response.ok) {
          console.log("Failed to delete shipping method");
        }

        // Update paymentMethods state with the new method
        fetchMethods();
      }
      deleteshipping();
    }
  }
  const handleAddMethodClick = () => {
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedMethod(null);
  };

  const handleSaveMethod = () => {
    // API call to save newMethod
    async function addpayment() {
      const response = await fetch(`/api/seller/payment_methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seller_ID: user_id_encode,
          payment_method_ID_list: [selectedMethod],
        }),
      });
      if (!response.ok) {
        console.log("Failed to add payment method");
      }

      // Update paymentMethods state with the new method
      fetchMethods();
    }
    addpayment();
    handleModalClose();
  };
  const handleAddMethodClick2 = () => {
    setModalOpen2(true);
  };
  const handleModalClose2 = () => {
    setModalOpen2(false);
    setSelectedMethod(null);
  };

  const handleSaveMethod2 = () => {
    // API call to save newMethod
    async function addpayment() {
      const response = await fetch(`/api/seller/shipping_companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          seller_ID: user_id_encode,
          shipping_company_ID_list: [selectedMethod],
        }),
      });
      if (!response.ok) {
        console.log("Failed to add payment method");
      }

      // Update paymentMethods state with the new method
      fetchMethods();
    }
    addpayment();
    handleModalClose2();
  };

  return (
    <div className="container">
      <div className="profile">
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            overflow: "hidden",
            position: "relative",
            marginRight: "10px",
          }}
        >
          <Image src={shop.img} fill="true" alt="Shop Image" />
        </div>
        <div className="info">
          <h2>
            Shop Name: <span>{shop.shopname}</span>
          </h2>
          <p>
            Shop&apos;s address <span>{shop.address}</span>
          </p>
        </div>
      </div>
      <div className="setting">
        <button
          className="methodbutton"
          onClick={() => setShowPaymentMethods(!showPaymentMethods)}
        >
          Payment Methods
        </button>
        {showPaymentMethods && (
          <div>
            <button className="addmethodbutton" onClick={handleAddMethodClick}>
              Add new Payment method
            </button>
            <Modal
              isOpen={modalOpen}
              onClose={handleModalClose}
              onSave={handleSaveMethod}
            >
              <select
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value);
                }}
              >
                {allpaymentMethods.map((method) => (
                  <option key={method.Method_ID} value={method.Method_ID}>
                    {method.Method_name}
                  </option>
                ))}
              </select>
              {selectedMethod && (
                <p>{allpaymentMethods[selectedMethod].Note}</p>
              )}
            </Modal>
            <ul className="methoddul">
              {paymentMethods.map((method) => (
                <li className="methodli" key={method.Method_ID}>
                  {method.Method_name} - {method.Note}
                  <span
                    onClick={() =>
                      handleDeleteMethod("payment", method.Method_ID)
                    }
                    className="delete-iconmethod"
                  >
                    <Image
                      src="/trash.png"
                      height={15}
                      width={15}
                      alt="location icon"
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          className="methodbutton"
          onClick={() => setShowShippingMethods(!showShippingMethods)}
        >
          Shipping Methods
        </button>
        {showShippingMethods && (
          <div>
            <button onClick={handleAddMethodClick2} className="addmethodbutton">
              Add new Shipping method
            </button>
            <Modal
              isOpen={modalOpen2}
              onClose={handleModalClose2}
              onSave={handleSaveMethod2}
            >
              <select
                value={selectedMethod}
                onChange={(e) => {
                  setSelectedMethod(e.target.value);
                }}
              >
                {allshippingMethods.map((method) => (
                  <option key={method.Company_ID} value={method.Company_ID}>
                    {method.Company_name}
                  </option>
                ))}
              </select>
              {selectedMethod && (
                <p>{allshippingMethods[selectedMethod].Note}</p>
              )}
            </Modal>

            <ul className="methoddul">
              {shippingMethods.map((method) => (
                <li className="methodli" key={method.Company_ID}>
                  {method.Company_name} - {method.Price} VND - {method.Note}
                  <span
                    onClick={() =>
                      handleDeleteMethod("shipping", method.Company_ID)
                    }
                    className="delete-iconmethod"
                  >
                    <Image
                      src="/trash.png"
                      height={15}
                      width={15}
                      alt="location icon"
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
