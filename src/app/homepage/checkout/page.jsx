"use client";
import "./checkout.css";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { Knock } from "@knocklabs/node";
import { getCognitoUserSub } from "@/config/cognito";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CheckoutPage({}) {
  const route = useRouter();
  const knockClient = new Knock(process.env.NEXT_PUBLIC_KNOCK_SECRET);

  const [user_id, setUser_id] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isAddNewAddress, setIsAddNewAddress] = useState(false);

  const [listRegion, setListRegion] = useState([]);
  const [listProvince, setListProvince] = useState([]);
  const [listProvinceByRegion, setListProvinceByRegion] = useState([]);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);
  const [selectedProvinceIndex, setSelectedProvinceIndex] = useState(0);
  const [detaiNewAddress, setDetailNewAddress] = useState("");
  const [newAddress, setNewAddress] = useState("");

  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState({});
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState({});
  const [currentShopIndex, setCurrentShopIndex] = useState(null);
  const [currentShippingOptions, setCurrentShippingOptions] = useState([]);
  const [currentPayment, setCurrentPayment] = useState([]);
  const [currentVoucher, setCurrentVoucher] = useState([]);
  const [showPaymentModal, setshowPaymentModal] = useState(false);
  const [shipmentCost, setShipmentCost] = useState(0);
  const [showVoucherModal, setshowVoucherModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState({});

  const [user_information, setUserInformation] = useState({
    user_name: "",
    user_phone: "",
    user_address: [],
  });

  async function fetchRegion() {
    const response = await fetch("/api/general/regions", { method: "GET" });
    if (response.ok) {
      const data = await response.json();
      setListRegion(data);
      setSelectedRegionIndex(0); // This might be redundant if the initial state is already 0
    } else {
      console.error("Failed to fetch regions");
    }
  }

  async function fetchProvince() {
    const response = await fetch("/api/general/provinces", { method: "GET" });
    if (response.ok) {
      const data = await response.json();
      setListProvince(data);
    } else {
      console.error("Failed to fetch provinces");
    }
  }

  useEffect(() => {
    if (listRegion.length > 0 && listProvince.length > 0) {
      const filteredProvinces = listProvince.filter(
        (province) =>
          province.Region_id === listRegion[selectedRegionIndex].Region_id
      );
      setListProvinceByRegion(filteredProvinces);
      setNewAddress(
        listRegion[selectedRegionIndex].Region_name +
          " " +
          filteredProvinces[selectedProvinceIndex].Province_name
      );
    }
  }, [selectedRegionIndex, listProvince, listRegion, selectedProvinceIndex]);

  function handleRegionChange(e) {
    setSelectedRegionIndex(e.target.value);
  }

  useEffect(() => {
    if (listProvince.length > 0 && listRegion.length > 0) {
      setListProvinceByRegion(
        listProvince.filter(
          (province) =>
            province.Region_id === listRegion[selectedRegionIndex].Region_id
        )
      );
      console.log(listProvinceByRegion);
    }
  }, [selectedRegionIndex]);

  /// use userID to get the data that user have checkout
  const [cart, setCart] = useState({});
  const openShipmentModal = (shopIndex) => {
    setCurrentShopIndex(shopIndex);
    setCurrentShippingOptions(cart.shop[shopIndex].shippingmethod);
    setShowShipmentModal(true);
  };
  const openPaymentModal = (shopIndex) => {
    setCurrentShopIndex(shopIndex);
    setCurrentPayment(cart.shop[shopIndex].paymentmethod);
    setshowPaymentModal(true);
  };
  const openVoucherModal = (shopIndex) => {
    setCurrentShopIndex(shopIndex);
    setCurrentVoucher(cart.shop[shopIndex].vouchers);
    setshowVoucherModal(true);
  };
  const handleVoucherSelect = (vouchername, discount, type) => {
    setSelectedVoucher((prevState) => ({
      ...prevState,
      [currentShopIndex]: { vouchername, discount, type },
    }));
    setshowVoucherModal(false);
  };

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(""); // Default selected payment method

  const handlePaymentMethodSelect = (id, payment, note) => {
    setSelectedPaymentMethod((prevState) => ({
      ...prevState,
      [currentShopIndex]: { id, payment, note },
    }));
    setshowPaymentModal(false);
  };
  const handleShipmentSelect = (id, shipment, price, note) => {
    setSelectedShipment((prevState) => ({
      ...prevState,
      [currentShopIndex]: { id, shipment, price, note },
    }));
    setShowShipmentModal(false);
  };

  const handleNoteChange = (index, value) => {
    setNotes((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  function calculateShopTotalPrice(shop, index) {
    let productTotal = shop.product.reduce(
      (sum, product) => sum + product.total,
      0
    );
    let shipmentPrice = selectedShipment[index]
      ? selectedShipment[index].price
      : 0;
    let discount = 0;

    if (selectedVoucher[index]) {
      const voucher = selectedVoucher[index];
      if (voucher.type === "Ship") {
        // Discount on shipping cost
        discount = (shipmentPrice * voucher.discount) / 100;
      } else if (voucher.type !== "Freeship") {
        // Percentage discount on product total
        discount = (productTotal * voucher.discount) / 100;
      }

      if (voucher.type === "Freeship") {
        shipmentPrice = 0;
      }
    } else {
      discount = 0;
    }

    return productTotal + shipmentPrice - discount;
  }

  useEffect(() => {
    function fetchLocation() {
      fetchRegion();
      fetchProvince();
    }
    fetchLocation();
  }, []);

  useEffect(() => {
    getCognitoUserSub().then((user_id) => setUser_id(user_id));
    if (!user_id) return;
    async function fetchCheckout() {
      const response = await fetch(
        `/api/user/cart?user_id=${encodeURIComponent(user_id)}`
      );
      let extraShops = [];

      if (response.ok) {
        const data = await response.json();
        console.log(data);
        const cartShopsPromises = data.checkout.map(async (shop) => {
          const sellerId = shop[0].Seller_ID;
          console.log(shop[0].Shop_condition);
          const shopResponse = await fetch(
            `/api/user/information?user_id=${encodeURIComponent(sellerId)}`
          );
          const shopData = await shopResponse.json();
          const shippingmethod = await fetch(
            `/api/user/shipping_company_of_seller?seller_id=${encodeURIComponent(
              sellerId
            )}`
          );
          const paymentmethod = await fetch(
            `/api/user/payment_method_of_seller?seller_id=${encodeURIComponent(
              sellerId
            )}`
          );
          const vouchers = await fetch(
            `/api/seller/vouchers?seller_id=${encodeURIComponent(sellerId)}`
          );
          const freeshipall = await fetch(
            `/api/seller/discount?seller_id=${encodeURIComponent(sellerId)}`
          );
          const voucherdata = await vouchers.json();
          const paymentdata = await paymentmethod.json();
          const shippingdata = await shippingmethod.json();
          const freeshipallData = await freeshipall.json();
          console.log("Free");
          console.log(freeshipallData);

          let totalshopprice = 0;
          let reason = "";
          let freeship = 0;
          let priceforfreeship = 0;
          const products = shop.map((item) => {
            priceforfreeship += item.Quantity * parseFloat(item.Option_price);

            return {
              ...item,
              check: false,
              total: item.Quantity * parseFloat(item.Option_price),
            };
          });
          if (
            shop[0].Shop_condition > 0 &&
            priceforfreeship >= shop[0].Shop_condition
          ) {
            freeship = 1;
            reason = "condition";
          } else {
            products.forEach((product, index) => {
              if (
                product.Condition_value &&
                product.Quantity >= product.Condition_value
              ) {
                let newShop = {
                  sellerId: sellerId,
                  Shop_name: shopData.user.Shop_name,
                  check: false,
                  product: [product],
                  shippingmethod: shippingdata,
                  paymentmethod: paymentdata,
                  vouchers: voucherdata,
                  totalshopprice,
                  freeship: 1,
                  reason: "product",
                };
                extraShops.push(newShop);
                products.splice(index, 1);
              }
            });
          }

          return {
            sellerId: sellerId,
            Shop_name: shopData.user.Shop_name,
            check: false,
            product: products,
            shippingmethod: shippingdata,
            paymentmethod: paymentdata,
            vouchers: voucherdata,
            totalshopprice,
            freeship: freeship,
            reason: reason,
          };
        });

        let cartShops = await Promise.all(cartShopsPromises);
        cartShops = cartShops.filter((shop) => shop.product.length > 0);

        extraShops.forEach((extraShop) => {
          cartShops.push(extraShop);
        });
        setCart({ shop: cartShops });
        console.log(cartShops);
      } else {
        console.error("Error:", response.statusText);
      }
    }
    async function fetchUserInformation() {
      const response = await fetch(
        `/api/user/information?user_id=${encodeURIComponent(user_id)}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserInformation({
          user_name: data.user.FName + " " + data.user.LName,
          user_phone: data.user.Phone_Number,
          user_address: data.address.map((item) => item.Address),
        });
        setAddress(data.address[0].Address);
      } else {
        console.error("Error:", response.statusText);
      }
    }

    fetchCheckout();
    fetchUserInformation();
    function handleUnload(event) {
      event.preventDefault(); // This may be necessary to ensure the prompt is triggered in some browsers
      event.returnValue = ""; // Chrome requires returnValue to be set

      for (let shop of cart.shop) {
        for (let product of shop.product) {
          const data = {
            operation: "updateIsChecked",
            product_id: product.Product_ID,
            user_id: user_id,
            option_number: product.Option_number,
            isChecked: 0,
          };

          fetch("/api/user/cart", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          }).then((response) => {
            if (!response.ok) {
              console.error(`Failed to update product ${product.product_id}`);
            }
          });
        }
      }
    }

    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, [user_id]);

  async function handleBack() {
    for (let shop of cart.shop) {
      for (let product of shop.product) {
        const data = {
          operation: "updateIsChecked",
          product_id: product.Product_ID,
          user_id: user_id,
          option_number: product.Option_number,
          isChecked: 0,
        };

        const response = await fetch("/api/user/cart", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          toast.error(`Failed to update product ${product.product_id}`);
        }
      }
    }
    // Redirect to the previous page or any other page
    route.push(`/homepage/cart`);
  }
  function calculateTotalPrice() {
    let total = 0;
    if (cart.shop && Array.isArray(cart.shop)) {
      cart.shop.forEach((shop, index) => {
        let shopTotal = shop.product?.reduce((a, b) => a + b.total, 0);
        let shipmentCost = selectedShipment[index]?.price || 0;
        if (selectedVoucher[index]?.type === "Freeship") {
          shipmentCost = 0;
        } else if (selectedVoucher[index]?.type === "Ship") {
          shipmentCost =
            shipmentCost - (shopTotal * selectedVoucher[index]?.discount) / 100;
        } else if (selectedVoucher[index]?.type === "Discount") {
          shopTotal =
            shopTotal - (shopTotal * selectedVoucher[index]?.discount) / 100;
        }
        total += shopTotal + shipmentCost;
      });
    }
    return total;
  }
  function calculateOriginalShopTotalPrice(shop) {
    return shop.product.reduce((total, product) => {
      return total + product.Option_price * product.Quantity;
    }, 0);
  }

  const handleUserInfoChange = (key, value) => {
    setUserInformation((prev) => ({
      ...prev,
      [key]: value,
    }));
  };
  const totalPrice = calculateTotalPrice();
  async function handle_checkout() {
    if (!selectedPaymentMethod) {
      toast.error("Vui lòng chọn phương thức thanh toán.");
      return;
    }

    // Check if all shops have a selected shipping method
    const allShopsHaveShipping = cart.shop.every(
      (_, index) => selectedShipment[index]
    );
    if (!allShopsHaveShipping) {
      toast.error(
        "Vui lòng chọn phương thức vận chuyển cho tất cả các cửa hàng."
      );
      return;
    }
    let new_cart = { ...cart };

    for (let shop of new_cart.shop) {
      let Product_list = [];
      shop.product.forEach((product) => {
        Product_list.push({
          Product_ID: product.Product_ID,
          Option_number: product.Option_number,
          Quantity: product.Quantity,
          Discount_percentage: product.Discount_percentage,
          Original_price: product.Option_price,
          Final_price: product.Option_price * product.Quantity,
        });
      });

      if (Product_list.length > 0) {
        const shopIndex = cart.shop.indexOf(shop);
        const data = {
          Seller_ID: shop.sellerId, // Seller_ID is obtained from the first checked product
          Customer_ID: user_id, // Replace with actual Customer_ID
          Address: address, // Replace with actual Address
          Total_quantity: Product_list.length,
          Product_list,
          Customer_name: user_information.user_name,
          Customer_phone_number: user_information.user_phone,
          Note: notes[shopIndex],
          Shipping_company_ID: selectedShipment[shopIndex].id,
          Payment_method_id: selectedPaymentMethod[shopIndex].id,
          DiscountType: selectedVoucher[shopIndex]?.type,
          Discount_percentage: selectedVoucher[shopIndex]?.discount || 0,
          Total_price: calculateShopTotalPrice(shop, shopIndex),
        };
        console.log(data);
        // Make API request to server
        const response = await fetch("/api/user/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          toast.error("Checkout failed");
          return;
        } else {
          await knockClient.workflows.trigger("buyproduct", {
            recipients: [shop.sellerId],
            actor: user_id,
          });
        }
        for (let product of Product_list) {
          const deleteResponse = await fetch("/api/user/cart", {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              product_id: product.Product_ID,
              user_id: user_id,
              option_number: product.Option_number,
            }),
          });

          if (!deleteResponse.ok) {
            toast.error(
              `Failed to remove product ${product.Product_ID} from cart`
            );
          }
        }
      }
    }

    toast.success("注文が完了しました");

    route.push(`/homepage/order_managment`);
  }

  const pathname = usePathname();

  useEffect(() => {
    console.log(pathname);
  }, [pathname]);

  const ref = useRef(pathname);
  useEffect(() => {
    console.log(
      `Previous Pathname: ${ref.current}, Current Pathname: ${pathname}`
    );
    if (ref.current !== pathname && ref.current === "/homepage/checkout") {
      alert("The pathname has changed!");
    }
    ref.current = pathname;
  }, [pathname]);

  return (
    <div className="checkout_page_container">
      <ToastContainer />
      <div className="address_checkout_page">
        <div className="header_address_checkout">
          <Image
            src="/location_checkout.png"
            alt="location icon"
            width={20}
            height={20}
          />
          <p>配送先住所</p>
        </div>
        <div className="information_address_checkout">
          {isEditing ? (
            <>
              <input
                type="text"
                value={user_information.user_name}
                onChange={(e) =>
                  handleUserInfoChange("user_name", e.target.value)
                }
                placeholder="Ho va ten"
              />
              <input
                type="text"
                value={user_information.user_phone}
                onChange={(e) =>
                  handleUserInfoChange("user_phone", e.target.value)
                }
                placeholder="So dien thoai"
              />

              {isAddNewAddress ? (
                <div className="add_new_address_container_checkout">
                  <div className="select_province_region_for_adding_address">
                    <div>
                      <p>Regions</p>
                      {listRegion.length > 0 ? (
                        <select
                          onChange={handleRegionChange}
                          value={selectedRegionIndex}
                        >
                          {listRegion.map((region, index) => (
                            <option key={index} value={index}>
                              {region.Region_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p>loading...</p>
                      )}
                    </div>
                    <div>
                      <p>Provinces</p>
                      {listProvinceByRegion.length > 0 ? (
                        <select
                          value={selectedProvinceIndex}
                          onChange={(e) =>
                            setSelectedProvinceIndex(e.target.value)
                          }
                        >
                          {listProvinceByRegion.map((province, index) => (
                            <option key={index} value={index}>
                              {province.Province_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p>loading...</p>
                      )}
                    </div>
                  </div>
                  <input
                    placeholder="Detail Address"
                    value={detaiNewAddress}
                    onChange={(e) => {
                      e.preventDefault();
                      setDetailNewAddress(e.target.value);
                    }}
                  ></input>
                  <p>
                    {newAddress} {detaiNewAddress}
                  </p>
                  <button
                    onClick={() => {
                      setAddress(newAddress + " " + detaiNewAddress);
                      setIsAddNewAddress(false);
                      setIsEditing(false);
                    }}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <select
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                >
                  {user_information.user_address.map((address, index) => (
                    <option key={index} value={address}>
                      {address}
                    </option>
                  ))}
                </select>
              )}

              <button onClick={() => setIsAddNewAddress(!isAddNewAddress)}>
                {isAddNewAddress ? "閉じる" : "新しい住所を追加"}
              </button>
            </>
          ) : (
            <>
              <p>
                {user_information.user_name} {user_information.user_phone}
              </p>
              <p>{address}</p>
            </>
          )}
          <button onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "保存" : "変更"}
          </button>
          {isEditing && (
            <button onClick={() => setIsEditing(false)}>閉じる</button>
          )}
        </div>
      </div>
      <div className="field_bar_checkout">
        <div>
          <p>製品</p>
        </div>
        <div>
          <p>価格</p>
          <p>量</p>
          <p>合計金額</p>
        </div>
      </div>
      {cart.shop &&
        Array.isArray(cart.shop) &&
        cart.shop.map((shop, index) => {
          return (
            <div className="shop_checkout" key={index}>
              <div className="shop_checkout_header">
                <p className="s ">{shop.Shop_name}</p>
                {shop.freeship === 1 && (
                  <p style={{ color: "red" }}>
                    この注文の商品は送料無料となります
                  </p>
                )}
              </div>
              {shop.product.map((product, productIndex) => {
                return (
                  <div className="product_checkout" key={productIndex}>
                    <div className="product_checkout_left_section">
                      <Image
                        src={product.Image_url}
                        alt="product_img"
                        width={100}
                        height={100}
                      />
                      <div className="product_information_checkout">
                        <p>{product.Product_title}</p>
                        <p>{product.Option_name}</p>
                      </div>
                    </div>
                    <div className="product_checkout_right_section">
                      <div>
                        <p>{product.Option_price} 円</p>
                      </div>
                      <div>
                        <p>{product.Quantity}</p>
                      </div>
                      <div>
                        <p>{product.total} 円</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div className="checkout_information_shipping">
                <div>
                  <p>注記</p>
                  <textarea
                    placeholder="売り手へのメッセージ"
                    maxLength="200"
                    value={notes[index]}
                    onChange={(e) => handleNoteChange(index, e.target.value)}
                  ></textarea>
                </div>
                <div style={{ display: "flext", flexDirection: "column" }}>
                  <div className="shipping_selection">
                    <p>出荷単位</p>
                    <button onClick={() => openShipmentModal(index)}>
                      出荷単位の選択
                    </button>
                    <p className="shipment_status">
                      {selectedShipment[index] ? (
                        <>
                          <strong>{selectedShipment[index].shipment}</strong>
                          <span className="shipment_status_price">
                            ₫{selectedShipment[index].price.toLocaleString()}
                          </span>
                          <span className="shipment_note">
                            {selectedShipment[index].note}
                          </span>{" "}
                          {/* Make sure it's .note */}
                        </>
                      ) : (
                        "選択していない"
                      )}
                    </p>
                  </div>
                  <div className="shipping_selection">
                    <p>プロモーション</p>
                    <button onClick={() => openVoucherModal(index)}>
                      プロモーションを選択する
                    </button>
                    <p className="shipment_status">
                      {selectedVoucher[index] ? (
                        <>
                          <strong>{selectedVoucher[index].vouchername}</strong>
                          <span className="shipment_note">
                            {selectedVoucher[index].type} +{" "}
                            {selectedVoucher[index].type !== "Freeship"
                              ? selectedVoucher[index].discount + "%"
                              : ""}
                          </span>
                        </>
                      ) : (
                        "選択していない"
                      )}
                    </p>
                  </div>
                  <div className="shipping_selection">
                    <p>お支払い方法 </p>
                    <button onClick={() => openPaymentModal(index)}>
                      支払い方法を選んでください
                    </button>
                    <p className="shipment_status">
                      {selectedPaymentMethod[index] ? (
                        <>
                          <strong>
                            {selectedPaymentMethod[index].payment}
                          </strong>
                          <span className="shipment_note">
                            {selectedPaymentMethod[index].note}
                          </span>{" "}
                          {/* Make sure it's .note */}
                        </>
                      ) : (
                        "選択していない"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping modal */}
              {showShipmentModal && (
                <div className="modal">
                  <div className="modal-content">
                    <h3>配送を選択</h3>
                    <ul>
                      {currentShippingOptions.map((option) => (
                        <li
                          key={option.Company_ID}
                          onClick={() => {
                            console.log("shop:", cart.shop[currentShopIndex]);

                            const cost =
                              cart.shop[currentShopIndex].freeship === 1
                                ? 0
                                : parseInt(option.Price);

                            handleShipmentSelect(
                              option.Company_ID,
                              option.Company_name,
                              cost,
                              option.Note
                            );
                          }}
                        >
                          <strong>{option.Company_name}</strong> - ₫
                          {option.Price.toLocaleString()}
                          <div>{option.Note}</div>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => setShowShipmentModal(false)}>
                      選択
                    </button>
                  </div>
                </div>
              )}
              {showVoucherModal && (
                <div className="modal">
                  <div className="modal-content">
                    <h3>プロモーションを選択</h3>
                    <ul>
                      {currentVoucher
                        .filter((option) => {
                          const currentTime = new Date();
                          return (
                            new Date(option.Start) <= currentTime &&
                            currentTime <= new Date(option.End)
                          );
                        })
                        .map((option, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              handleVoucherSelect(
                                option.Voucher_Name,
                                option.Discount_Value,
                                option.Type
                              );
                            }}
                          >
                            <strong>{option.Voucher_Name}</strong>
                            <div>{option.Type}</div>
                            <div>
                              {option.Type !== "Freeship"
                                ? option.Discount_Value + "%"
                                : ""}
                            </div>
                          </li>
                        ))}
                    </ul>
                    <button onClick={() => setshowVoucherModal(false)}>
                      選択
                    </button>
                  </div>
                </div>
              )}
              {showPaymentModal && (
                <div className="modal">
                  <div className="modal-content">
                    <h3>お支払い方法を選択してください</h3>
                    <ul>
                      {currentPayment.map((option) => (
                        <li
                          key={option.Method_ID}
                          onClick={() => {
                            console.log("shop:", shop);

                            handlePaymentMethodSelect(
                              option.Method_ID,
                              option.Method_name,
                              option.Note
                            );
                          }}
                        >
                          <strong>{option.Method_name}</strong>
                          <div>{option.Note}</div>
                        </li>
                      ))}
                    </ul>
                    <button onClick={() => setshowPaymentModal(false)}>
                      選択
                    </button>
                  </div>
                </div>
              )}

              <div className="price-checkout-container">
                <p style={{ fontWeight: "bold", fontSize: "18px" }}>注文内容</p>

                <div className="price-check-text">
                  <span className="price-label">商品合計金額</span>
                  <span className="price-value">
                    ¥{calculateOriginalShopTotalPrice(shop)}
                  </span>
                </div>
                <div className="price-check-text">+</div>
                <div className="price-check-text">
                  <span className="price-label">配送料・手数料 :</span>
                  <span className="price-value">
                    {shop.freeship === 1 ||
                    selectedVoucher[index]?.type === "Freeship"
                      ? "送料無料" +
                        (shop.reason === "product"
                          ? "：購入商品の合計がプロモーション条件を満たしています"
                          : shop.reason === "condition"
                          ? "：注文金額が送料無料の条件を満たしています"
                          : "")
                      : selectedShipment[index]
                      ? "¥" + selectedShipment[index].price
                      : "¥" + 0}
                  </span>
                </div>
                {selectedVoucher[index] && (
                  <>
                    <div className="price-check-text">-</div>
                    <div className="price-check-text">
                      <span className="price-label">プロモーション :</span>
                      <span className="price-value">
                        {selectedVoucher[index].type === "Freeship"
                          ? "Free shipping"
                          : (
                              "¥" +
                              (selectedVoucher[index].discount / 100) *
                                calculateOriginalShopTotalPrice(shop)
                            ).toFixed(1)}
                      </span>
                    </div>
                  </>
                )}
                <div className="price-check-text separator"></div>
                <div className="price-check-text">
                  <span className="price-final">ご請求額 :</span>
                  <span className="price-final">
                    ¥{calculateShopTotalPrice(shop, index)}
                  </span>
                </div>

                <div className="check-div"></div>
                <div className="price-check-text">
                  <span className="price-label">獲得ポイント :</span>
                  <span className="price-point">
                    +{Math.round(calculateShopTotalPrice(shop, index) / 1000)}
                    ポイント
                  </span>
                </div>
              </div>
            </div>
          );
        })}

      <div className="checkout_final_step">
        <div>
          <p>商品の総原価: </p> <p>¥{totalPrice.toLocaleString()}</p>
        </div>

        <button onClick={handle_checkout}>注文</button>
        <button className="back-button" onClick={handleBack}>
          戻る
        </button>
      </div>
    </div>
  );
}
