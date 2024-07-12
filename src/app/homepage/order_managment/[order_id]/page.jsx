"use client";
import "./order_detail.css";
import { useEffect, useState, React } from "react";
import Image from "next/image";
import AWS from "aws-sdk";
import { getCognitoUserSub } from "@/config/cognito";
import { BeatLoader } from "react-spinners";

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});
export default function CheckoutPage({ params }) {
  const [user_id_encode, setUserID] = useState("");
  const s3 = new AWS.S3();
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);
  const [comment, setComment] = useState("");

  const [address, setAddress] = useState("");
  const [iscomplete, setIsComplete] = useState("");
  const [activeCommentId, setActiveCommentId] = useState(null);
  const Order_ID = params.order_id;
  const [orderPrice, setorderPrice] = useState(0);
  const [note, setNote] = useState("");
  const [user_information, setUserInformation] = useState({
    user_name: "",
    user_phone: "",
    user_address: [],
  });
  const [isLoading, setIsLoading] = useState(true);
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
        alert("コメント成功");
        window.location.reload();
      })
      .catch((error) => console.error(error));
  }

  useEffect(() => {
    getCognitoUserSub().then((user_id_encode) => setUserID(user_id_encode));
    if (!user_id_encode) return;
    fetch(`/api/user/order?order_id=${Order_ID}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        if (!data || !data.body || !data.body.order) {
          setUserInformation({
            user_name: "loading",
            user_phone: "loading",
          });
          setIsComplete("loading");
          setNote("loading");
          setAddress("loading");
          setOrderDetails("loading");
        } else {
          setUserInformation({
            user_name: data.body.order.Customer_name || "loading",
            user_phone: data.body.order.Customer_phone_number || "loading",
          });
          setIsComplete(data.body.order.Status || "loading");
          setNote(data.body.order.Note || "");
          setAddress(data.body.order.Address || "loading");

          const orderData = data.body.order;
          const orderItems = data.body.order_items || [];

          const productPromises = orderItems.map((item) =>
            fetch(`/api/user/product?product_id=${item.Product_ID}`).then(
              (response) => response.json()
            )
          );

          return Promise.all(productPromises).then((productData) => {
            const enrichedOrderData = orderItems.map((item, index) => ({
              ...item,
              productDetails: productData[index] || "loading",
            }));

            setOrderDetails({
              ...orderData,
              orderItems: enrichedOrderData,
            });
            setIsLoading(false);
          });
        }
      })
      .catch((error) => console.error(error));
  }, [Order_ID, user_id_encode]);

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
    <div className="order_detail_container">
      <div className="address_order_detail">
        <div className="header_address_order_detail">
          <Image
            src="/location_checkout.png"
            alt="location icon"
            width={20}
            height={20}
          />
          <p>配送先住所</p>
        </div>
        <div className="information_address_order_detail">
          <p>{address}</p>
          <p>
            {user_information.user_name} {user_information.user_phone}
          </p>
        </div>
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {" "}
        <BeatLoader color={"#36d7b7"} loading={isLoading} size={15} />
      </div>
      <div className="scroll_table_order_detail">
        <table className="orderdetailtable">
          <thead>
            <tr>
              <th>画像</th>
              <th>名前</th>
              <th>オプション</th>
              <th>アイテムの数量</th>
              <th>単価</th>
              <th>量</th>
              <th>合計金額</th>
            </tr>
          </thead>

          <tbody>
            {orderDetails?.orderItems?.map((order, index) => (
              <>
                <tr key={index}>
                  <td>
                    <Image
                      src={order.productDetails.images[0].Image_url}
                      alt="product_img"
                      width={100}
                      height={100}
                    />
                  </td>
                  <td>
                    <p>{order.productDetails.Product_title}</p>
                  </td>
                  <td>
                    {
                      order.productDetails.options[order.Option_number]
                        .Option_name
                    }
                  </td>
                  <td>
                    {orderDetails.DiscountType === "Discount"
                      ? `${Math.floor(
                          orderDetails.Discount_percentage
                        )}% プロモーション`
                      : orderDetails.DiscountType === "Freeship"
                      ? "フリーシップ"
                      : "プロモーションはありません"}
                  </td>
                  <td>
                    {Math.floor(order.Original_price).toLocaleString("en-US")}円
                  </td>
                  <td>{order.Quantity}</td>
                  <td>
                    {Math.floor(order.Final_price).toLocaleString("en-US")} 円
                  </td>
                </tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  {iscomplete === "Complete" && (
                    <button
                      onClick={() => openCommentModal(order.Product_ID)}
                      className="comment_button"
                    >
                      この商品についてのコメント
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
                          <h3> 写真をもっと見る</h3>
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
                        コメントを追加する
                      </button>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      <div className="order_detail_footer">
        <div>
          <p>注文総額 </p>{" "}
          <p>
            {Math.floor(orderDetails?.Total_price).toLocaleString("en-US")} 円
          </p>
        </div>
        <p>注記</p>
        <div className="note_order_detail">{note}</div>
      </div>
    </div>
  );
}
