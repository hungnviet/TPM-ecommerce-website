"use client";
import React, { useState, useEffect } from "react";
import "./page.css";
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});
export default function Page({ params }) {
  const { seller_id_encode: sellerid } = params;
  const s3 = new AWS.S3();
  const [rows, setRows] = useState([
    { optionPrice: "", optionName: "", optionQuantity: "" },
  ]);
  const [rows2, setRows2] = useState([{ title: "", content: "" }]);
  const [images, setImages] = useState([]);
  const [productname, setProductname] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  useEffect(() => {
    fetchImageCount();
  }, []);

  const fetchImageCount = async () => {
    try {
      const response = await fetch("/api/seller/product", { method: "GET" });
      const data = await response.json();
      setImageCount(data.count);
    } catch (error) {
      console.error("Failed to fetch image count:", error);
    }
  };

  const options = [
    "野菜",
    "果物",
    "米・穀類",
    "お茶",
    "魚介類",
    "肉",
    "卵・乳",
    "蜂蜜",
    "加工食品",
    "花・観葉植物",
  ];
  const [selectedOption, setSelectedOption] = useState("1");
  const checkAndGenerateFileName = async (s3, bucket, originalName, index) => {
    let newName = `tpmec${imageCount + index + 1}`;
    return newName;
  };
  const submitproduct = async (e) => {
    setIsWaiting(true);
    try {
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
      console.log("Image URLs:", validImageUrls);

      const productImageList = validImageUrls.map((url) => ({ imageURL: url }));
      console.log("Product Image List:", productImageList);
      const productOptionList = rows.map(
        ({ optionName, optionPrice, optionQuantity }) => ({
          optionName,
          optionPrice: Number(optionPrice), // convert string to number
          optionQuantity: Number(optionQuantity), // convert string to number
        })
      );
      const productDescriptionList = rows2.map(({ title, content }) => ({
        title,
        content,
      }));
      console.log("Product Option List:", productOptionList);
      const body = {
        productTitle: productname,
        productDescription: description,
        productOptionList: rows, // assuming rows is an array of options
        productImageList, // add your list of images here
        productDescriptionList: rows2,
        sellerID: sellerid, // replace with actual sellerID
        categoryID: selectedOption,
      };

      console.log(body);
      const res = await fetch("/api/seller/product", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productTitle: productname,
          productDescription: description,
          productOptionList: rows, // assuming rows is an array of options
          productImageList, // add your list of images here
          productDescriptionList: rows2,
          sellerID: sellerid, // replace with actual sellerID
          categoryID: selectedOption,
        }),
      });

      // Send rows to the separate API endpoint
      console.log("Rows:", rows);

      const rowRes = await res.json();
      console.log(rowRes);
      if (res.ok) {
        alert("Product uploaded successfully");
        setIsWaiting(false);
        window.location.reload();
      }

      // Move this fetch request inside the try block
    } catch (error) {
      console.error("Error:", error);
      alert("Error uploading product");
    }
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

  const addRow = () => {
    setRows([...rows, { optionPrice: "", optionName: "", optionQuantity: "" }]);
  };

  const updateRow = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const deleteRow = (index) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };
  const addRow2 = () => {
    setRows2([...rows2, { title: "", content: "" }]);
  };

  const updateRow2 = (index, field, value) => {
    const newRows = [...rows2];
    newRows[index][field] = value;
    setRows2(newRows);
  };

  const deleteRow2 = (index) => {
    const newRows = [...rows2];
    newRows.splice(index, 1);
    setRows2(newRows);
  };

  return (
    <div className="upload_product_big_container">
      <div className="upload_product_container">
        <h3>Add new product to your shop</h3>

        <div style={{ display: "flex", flexDirection: "row" }}>
          <div className="input_name">
            <h3>Name</h3>
            <input
              type="text"
              value={productname}
              onChange={(e) => setProductname(e.target.value)}
              maxLength={200}
            />
          </div>
          <div
            style={{
              marginLeft: "60px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <h3>Category</h3>
            <select
              value={selectedOption}
              onChange={(e) => {
                setSelectedOption(e.target.value);
              }}
              style={{ width: "200px", height: "40px" }}
            >
              {options.map((option, index) => (
                <option key={index} value={index + 1}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="input_price">
          <h3>Sale option</h3>
          <table>
            <thead>
              <tr>
                <th>Price</th>
                <th>¥ per</th>
                <th>Option</th>
                <th>Quantity</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <input
                      type="text"
                      value={row.optionPrice}
                      onChange={(e) =>
                        updateRow(index, "optionPrice", e.target.value)
                      }
                      placeholder="Ex: 100"
                    />
                  </td>
                  <td></td>
                  <td>
                    <input
                      type="text"
                      value={row.optionName}
                      onChange={(e) =>
                        updateRow(index, "optionName", e.target.value)
                      }
                      placeholder="Ex: package of 1.5 kg"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={row.optionQuantity}
                      onChange={(e) =>
                        updateRow(index, "optionQuantity", e.target.value)
                      }
                      placeholder="Ex: 100"
                    />
                  </td>
                  <td>
                    <button onClick={() => deleteRow(index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addRow}>Add row</button>
        </div>
        <div className="input_description">
          <h3>General Description</h3>
          <textarea
            value={description.substring(0, 200)}
            onChange={(e) => setDescription(e.target.value.substring(0, 200))}
            maxLength={200}
          />
          <div className="input_price2">
            <h3>Specific Description</h3>
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>...</th>
                  <th>Content</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {rows2.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <input
                        type="text"
                        value={row.title}
                        onChange={(e) =>
                          updateRow2(index, "title", e.target.value)
                        }
                        placeholder="Ex: 100"
                      />
                    </td>
                    <td></td>
                    <td>
                      <input
                        type="text"
                        value={row.content}
                        onChange={(e) =>
                          updateRow2(index, "content", e.target.value)
                        }
                        placeholder="Ex: package of 1.5 kg"
                      />
                    </td>
                    <td>
                      <button onClick={() => deleteRow2(index)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button onClick={addRow2}>Add row</button>
          </div>
        </div>
        <div>
          <h3>Product Image</h3>
          <input type="file" multiple onChange={handleImageChange} />
          <div className="img_array">
            {images.map((image, index) => (
              <div className="img_container" key={index}>
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="product-image"
                />
                <button
                  onClick={() =>
                    setImages(images.filter((_, i) => i !== index))
                  }
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="submit_button">
          {isWaiting && <p>Posting Product...</p>}
          <button onClick={() => submitproduct()}>Posting</button>
        </div>
      </div>
    </div>
  );
}
