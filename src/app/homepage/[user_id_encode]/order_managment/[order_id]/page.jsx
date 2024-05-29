"use client";
import "../../checkout/checkout.css";
import { useEffect, useState } from "react";
import Image from "next/image";
import AWS from "aws-sdk";
AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});
export default function CheckoutPage({ params }) {
  const user_id_encode = params.user_id_encode;
  const s3 = new AWS.S3();
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [comment, setComment] = useState("");
  const path = window.location.pathname;
  const pathParts = path.split("/");
  const [address, setAddress] = useState("");
  const [iscomplete, setIsComplete] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);
  const Order_ID = pathParts[pathParts.length - 1];
  const [user_information, setUserInformation] = useState({
    user_name: "",
    user_phone: "",
    user_address: [],
  });
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
  const openCommentModal = (productId) => {
    setActiveCommentId(activeCommentId === productId ? null : productId);
  };
  const checkAndGenerateFileName = async (s3, bucket, originalName) => {
    let baseName = originalName.split(".").slice(0, -1).join(".");
    let extension = originalName.split(".").pop();
    let newName = originalName;
    let counter = 0;

    while (true) {
      const params = {
        Bucket: bucket,
        Prefix: newName,
      };
      try {
        const data = await s3.listObjectsV2(params).promise();
        if (data.Contents.length > 0) {
          // If file exists, generate new name
          newName = `${baseName}${counter}.${extension}`;
          counter++;
        } else {
          // If file does not exist, use this name
          return newName;
        }
      } catch (error) {
        console.log("AWS Error:", error);
        // Handle AWS errors
        throw new Error(`AWS S3 Error: ${error.code}`);
      }
    }
  };
  async function handleComment() {
    if (!activeCommentId) return; // Guard clause in case there's no active comment ID set

    const imageUrls = await Promise.all(
      selectedFiles.map(async (file) => {
        const newName = await checkAndGenerateFileName(s3, "tpms3", file.name);
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
    console.log("Image URLs:", validImageUrls);
    const date = new Date();
    fetch("/api/user/comment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Product_ID: activeCommentId, // Use the activeCommentId state
        User_ID: user_id_encode,
        Comment: comment,
        Comment_date: date,
        image: validImageUrls,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        alert("Bình luận thành công");
        window.location.reload();
      })
      .catch((error) => console.error(error));
  }

  useEffect(() => {
    fetch(`/api/user/order?order_id=${Order_ID}`)
      .then((response) => response.json())
      .then((data) => {
        setUserInformation({
          user_name: data.body.order.Customer_name,
          user_phone: data.body.order.Customer_phone_number,
        });
        setIsComplete(data.body.order.Status);
        const orderData = data.body.order;
        setAddress(data.body.order.Address);
        const orderItems = data.body.order_items;
        const productPromises = orderItems.map((item) =>
          fetch(`/api/user/product?product_id=${item.Product_ID}`).then(
            (response) => response.json()
          )
        );
        return Promise.all(productPromises).then((productData) => {
          const enrichedOrderData = orderItems.map((item, index) => ({
            ...item,
            productDetails: productData[index],
          }));
          setOrderDetails({
            ...orderData,
            orderItems: enrichedOrderData,
          });
        });
      })
      .catch((error) => console.error(error));
  }, [Order_ID]);

  function calculateTotalPrice() {
    let total = 0;
    if (orderDetails && orderDetails.orderItems) {
      total = orderDetails.orderItems.reduce(
        (acc, order) => acc + Number(order.Final_price),
        0
      );
    }
    return total;
  }

  const totalPrice = calculateTotalPrice();
  return (
    <div className="checkout_page_container">
      <div className="address_checkout_page">
        <div className="header_address_checkout">
          <Image
            src="/location_checkout.png"
            alt="location icon"
            width={20}
            height={20}
          />
          <p>Dia chi nhan hang</p>
        </div>
        <div className="information_address_checkout">
          <p>
            {user_information.user_name} {user_information.user_phone}
          </p>
          <p>{address}</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style={{ padding: "0 60px" }}>Hình ảnh</th>
            <th style={{ padding: "0 60px" }}>Tên</th>
            <th style={{ padding: "0 60px" }}>Option</th>
            <th style={{ padding: "0 60px" }}>Đơn giá</th>
            <th style={{ padding: "0 60px" }}>Số lượng</th>
            <th style={{ padding: "0 60px" }}>Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {orderDetails?.orderItems?.map((order, index) => (
            <>
              <tr key={index}>
                <td style={{ padding: "0 60px" }}>
                  <Image
                    src={order.productDetails.images[0].Image_url}
                    alt="product_img"
                    width={100}
                    height={100}
                  />
                </td>
                <td style={{ padding: "0 60px" }}>
                  <div>
                    <p>{order.productDetails.Product_title}</p>
                  </div>
                </td>
                <td style={{ padding: "0 60px" }}>
                  {
                    order.productDetails.options[order.Option_number]
                      .Option_name
                  }
                </td>
                <td style={{ padding: "0 60px" }}>{order.Original_price} 円</td>
                <td style={{ padding: "0 60px" }}>{order.Quantity}</td>
                <td style={{ padding: "0 60px" }}>{order.Final_price} 円</td>
              </tr>
              <td colSpan="6" style={{ textAlign: "center" }}>
                {iscomplete === "Complete" && (
                  <button
                    onClick={() => openCommentModal(order.Product_ID)}
                    className="comment_button"
                  >
                    Bình luận về sản phẩm này
                  </button>
                )}
              </td>

              {activeCommentId === order.Product_ID && (
                <tr>
                  <td colSpan="6">
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        marginLeft: "200px",
                      }}
                    >
                      <textarea
                        placeholder="Comment"
                        style={{
                          width: "500px",
                          height: "100px",
                          marginRight: "20px",
                        }}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      ></textarea>
                      <div className="choose_shop_image_container">
                        <h3> Thêm hình ảnh</h3>
                        {images.length === 0 && (
                          <input
                            type="file"
                            multiple
                            onChange={handleImageChange}
                          />
                        )}
                        <div className="img_array_choose_seller_image">
                          {images.map((image, index) => (
                            <div
                              className="img_container_choose_seller_image"
                              key={index}
                            >
                              <Image
                                src={image}
                                alt={`Product ${index + 1}`}
                                width={120}
                                height={120}
                              />
                              <button
                                onClick={() =>
                                  setImages(
                                    images.filter((_, i) => i !== index)
                                  )
                                }
                                className="btn_delete_image"
                              >
                                Delete
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <button
                      style={{ marginTop: "20px", marginLeft: "200px" }}
                      onClick={handleComment}
                    >
                      Thêm bình luận
                    </button>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>

      <div className="checkout_final_step">
        <div>
          <p>Tong tien hang: </p> <p>{totalPrice} 円</p>
        </div>
      </div>
    </div>
  );
}
