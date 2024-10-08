"use client";
import { useState, useEffect } from "react";
import AWS from "aws-sdk";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import "./setting.css";
import Image from "next/image";
AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});
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
import { getCognitoUserSub } from "@/config/cognito";
export default function Page() {
  const [user_id, setUser_id] = useState(null);
  const [shop, setShop] = useState({
    shopname: "",
    img: "",
    address: "",
  });
  const s3 = new AWS.S3();
  const [images, setImages] = useState([]);

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
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [Discount, setDiscount] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [showDiscount, setShowDiscount] = useState(false);
  const [modalDiscount, setModalDiscount] = useState(false);
  const [firstTime, setFirstTime] = useState(false);

  const [imageCount, setImageCount] = useState(0);
  const [editShop, setEditShop] = useState({
    shopname: "",
    img: "",
    address: "",
  });
  const [vouchers, setVouchers] = useState([]);
  const [modalOpenVoucher, setModalOpenVoucher] = useState(false);
  const [newVoucher, setNewVoucher] = useState({
    name: "",
    type: "Discount", // Default to 'Discount'
    discount: "",
    start: "",
    end: "",
  });

  useEffect(() => {
    getCognitoUserSub().then((sub) => {
      setUser_id(sub);
    });
  }, []);

  useEffect(() => {
    if (user_id) {
      fetch(`/api/user/information?user_id=${user_id}`)
        .then((response) => response.json())
        .then((data) => {
          const shopData = {
            shopname: data.user.Shop_name,
            img: data.user.Shop_image,
            address: data.address[0].Address,
          };
          setShop(shopData);
          setEditShop(shopData);
        })
        .catch((err) => console.log(err));

      fetch(`/api/seller/discount?seller_id=${user_id}`)
        .then((response) => response.json())
        .then((data) => {
          console.log(data);
          if (data.length == 0) {
            setDiscount(0);
            setFirstTime(true);
          }
          setDiscount(data[0].Shop_condition);
          if (data[0].Shop_condition <= 0 || !data[0].Shop_condition || !data) {
            setFirstTime(true);
          }
        })
        .catch((err) => console.log(err));
    }
    fetchImageCount();
  }, [user_id]);
  const fetchImageCount = async () => {
    try {
      const response = await fetch("/api/seller/product", { method: "GET" });
      const data = await response.json();
      setImageCount(data.count);
    } catch (error) {
      console.error("Failed to fetch image count:", error);
    }
  };
  async function fetchMethods() {
    const paymentResponse = await fetch(
      `/api/user/payment_method_of_seller?seller_id=${user_id}`
    );
    const paymentData = await paymentResponse.json();
    setPaymentMethods(paymentData);

    const shippingResponse = await fetch(
      `/api/user/shipping_company_of_seller?seller_id=${user_id}`
    );
    const shippingData = await shippingResponse.json();
    setShippingMethods(shippingData);
  }
  const checkAndGenerateFileName = async (s3, bucket, originalName, index) => {
    let extension = originalName.split(".").pop();
    let newName = user_id.substring(0, 6) + "." + extension;
    return newName;
  };
  const handleImageChange = (e) => {
    const newSelectedFiles = Array.from(e.target.files);
    setSelectedFiles((prevFiles) => [...prevFiles, ...newSelectedFiles]);

    const fileReaders = newSelectedFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(fileReaders)
      .then((newImages) => {
        setImages((prevImages) => [...prevImages, ...newImages]);
      })
      .catch((error) => {
        console.error("Error reading files:", error);
      });
  };

  async function fetchVouchers() {
    const voucherResponse = await fetch(
      `/api/seller/vouchers?seller_id=${user_id}`
    );
    const voucherData = await voucherResponse.json();
    console.log(voucherData);
    setVouchers(voucherData);
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

    if (user_id) {
      fetchMethods();
      fetchAllMethods();
      fetchVouchers();
    }
  }, [user_id]);
  const handleEditShopInfo = () => {
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditShop(shop); // reset the form inputs
    setEditModalOpen(false);
  };

  const handleEditShopSave = () => {
    setShop(editShop); // update the main state
    updateUserInformation();
    console.log("Save shop info");
    setEditModalOpen(false);
  };
  const handleAddVoucher = () => {
    setModalOpenVoucher(true);
  };

  const handleSaveVoucher = async () => {
    async function addVoucher() {
      const response = await fetch(`/api/seller/vouchers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerId: user_id,
          name: newVoucher.name,
          type: newVoucher.type,
          discountValue: newVoucher.discount,
          start: newVoucher.start,
          end: newVoucher.end,
        }),
      });

      if (!response.ok) {
        console.log("Failed to add voucher");
      } else {
        // Successfully added the voucher, fetch the latest list of vouchers
        fetchVouchers();

        // Reset the newVoucher state to initial values
        setNewVoucher({
          name: "",
          type: "Discount", // Default to 'Discount'
          discount: "",
          start: "",
          end: "",
        });

        // Close the modal
        setModalOpenVoucher(false);
      }
    }

    // Call the addVoucher function
    addVoucher();
  };

  const handleVoucherModalClose = () => {
    setModalOpenVoucher(false);
  };
  async function updateUserInformation() {
    if (selectedFiles) {
      const deleteParams = {
        Bucket: "tpms3",
        Key: user_id.substring(0, 6),
      };

      try {
        await new Promise((resolve, reject) => {
          s3.deleteObject(deleteParams, function (err, data) {
            if (err) {
              console.log(err, err.stack); // an error occurred
              reject(err);
            } else {
              console.log(data); // successful response
              resolve(data);
            }
          });
        });
      } catch (error) {
        console.error("Error deleting file:", error);
        return;
      }
    }
    const imageUrls = await Promise.all(
      selectedFiles.map(async (file, index) => {
        const newName = await checkAndGenerateFileName(
          s3,
          "tpms3",
          file.name,
          index
        );
        const uploadParams = {
          Bucket: "tpms3",
          Key: newName,
          Body: file,
          ACL: "public-read",
        };

        return s3
          .upload(uploadParams)
          .promise()
          .then((data) => data.Location)
          .catch((err) => {
            console.error("Error uploading file:", err);
            return null;
          });
      })
    );
    const validImageUrls = imageUrls.filter((url) => url !== null);
    console.log(validImageUrls);

    const response = await fetch(`/api/seller/information`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        shopName: editShop.shopname,
        User_ID: user_id,
        shopImg: validImageUrls[0],
      }),
    });
    if (!response.ok) {
      toast.error("Failed to update shop information");
    }
    toast.success(
      "Successfully updated shop information! It will take a time for the information to be updated on the website."
    );
    setSelectedFiles([]);
  }

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
            seller_ID: user_id,
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
            seller_ID: user_id,
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
          seller_ID: user_id,
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
          seller_ID: user_id,
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

  const handleDiscount = () => {
    setModalDiscount(true);
  };
  const handleDiscountClost = () => {
    setModalDiscount(false);
  };
  const handleSaveDiscount = () => {
    async function addDiscount() {
      const response = await fetch(`/api/seller/discount`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerID: user_id,
          Shop_condition: Discount,
        }),
      });
      if (!response.ok) {
        toast.error("Failed to add discount");
      } else {
        toast.success("Discount added successfully");
      }
      fetchMethods();
    }
    async function updateDiscount() {
      console.log(Discount);
      const response = await fetch(`/api/seller/discount`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sellerID: user_id,
          Shop_condition: Discount,
        }),
      });
      if (!response.ok) {
        toast.error("Failed to update discount");
      } else {
        toast.success("Discount updated successfully");
      }
      fetchMethods();
    }

    if (firstTime == true) {
      console.log("Add");
      console.log(firstTime);
      addDiscount();
    } else {
      updateDiscount();
    }
    handleDiscountClost();
  };
  const deletevoucher = async (voucher_id) => {
    const response = await fetch(`/api/seller/vouchers`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        voucherId: [voucher_id],
      }),
    });
    if (!response.ok) {
      console.log("Failed to delete voucher");
    }

    fetchVouchers();
  };
  return (
    <div className="container">
      <div className="profile">
        <ToastContainer />

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
      <div className="voucher-section">
        <button onClick={handleAddVoucher} className="add-voucher-button">
          Add New Voucher
        </button>
        <button
          onClick={handleDiscount}
          style={{ marginLeft: "10px" }}
          className="add-voucher-button"
        >
          Discount
        </button>
        <table className="vouchertable ">
          <thead>
            <tr>
              <th>Voucher Code</th>
              <th>Type</th>
              <th>Discount</th>
              <th>Start</th>
              <th>End</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {vouchers.map((voucher, index) => (
              <tr key={index}>
                <td>{voucher.Voucher_Name}</td>
                <td>{voucher.Type}</td>
                <td>{voucher.Discount_Value}%</td>
                <td>{new Date(voucher.Start).toISOString().split("T")[0]}</td>
                <td>{new Date(voucher.End).toISOString().split("T")[0]}</td>
                <td>
                  <button
                    className="deletavoucher"
                    onClick={() => deletevoucher(voucher.Voucher_ID)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={modalOpenVoucher}
        onClose={handleVoucherModalClose}
        onSave={handleSaveVoucher}
      >
        <div>
          <label htmlFor="name">Voucher Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newVoucher.name}
            onChange={(e) =>
              setNewVoucher((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="type">Type:</label>
          <select
            id="type"
            name="type"
            className="voucher-select"
            value={newVoucher.type}
            onChange={(e) =>
              setNewVoucher((prev) => ({ ...prev, type: e.target.value }))
            }
          >
            <option value="Ship">Ship</option>
            <option value="Freeship">Freeship</option>
            <option value="Discount">Discount</option>
          </select>
        </div>
        <div>
          <label htmlFor="discount">Discount (%):</label>
          <input
            type="number"
            id="discount"
            name="discount"
            value={newVoucher.discount}
            onChange={(e) =>
              setNewVoucher((prev) => ({ ...prev, discount: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="start">Start Date:</label>
          <input
            type="date"
            id="start"
            name="start"
            value={newVoucher.start}
            onChange={(e) =>
              setNewVoucher((prev) => ({ ...prev, start: e.target.value }))
            }
          />
        </div>
        <div>
          <label htmlFor="end">End Date:</label>
          <input
            type="date"
            id="end"
            name="end"
            value={newVoucher.end}
            onChange={(e) =>
              setNewVoucher((prev) => ({ ...prev, end: e.target.value }))
            }
          />
        </div>
      </Modal>
      <Modal
        isOpen={modalDiscount}
        onClose={handleDiscountClost}
        onSave={handleSaveDiscount}
      >
        <div>
          <label htmlFor="name">Minimum price to get Discount: </label>
          <input
            type="number"
            value={Discount}
            onChange={(e) => setDiscount(e.target.value)}
          />
        </div>
      </Modal>

      <div className="setting">
        <button className="methodbutton" onClick={handleEditShopInfo}>
          Edit Shop Information
        </button>

        <Modal
          isOpen={editModalOpen}
          onClose={handleEditModalClose}
          onSave={handleEditShopSave}
        >
          <div>
            <label htmlFor="shopName">Shop Name:</label>
            <input
              type="text"
              id="shopName"
              value={editShop.shopname}
              onChange={(e) =>
                setEditShop((prevShop) => ({
                  ...prevShop,
                  shopname: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label htmlFor="shopAddress">Address:</label>
            <input
              type="text"
              id="shopAddress"
              value={editShop.address}
              onChange={(e) =>
                setEditShop((prevShop) => ({
                  ...prevShop,
                  address: e.target.value,
                }))
              }
            />
          </div>
          <div>
            <label htmlFor="shopImage">Image URL:</label>
            <input type="file" multiple onChange={handleImageChange} />
          </div>
        </Modal>
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
