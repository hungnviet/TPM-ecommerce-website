"use client";
import React, { useState, useEffect } from "react";
import "./page.css";
import AWS from "aws-sdk";
import { getCognitoUserSub } from "@/config/cognito";

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});
export default function Page() {
  const [user_id, setUser_id] = useState(null);
  const s3 = new AWS.S3();
  const [rows, setRows] = useState([
    {
      optionPrice: "",
      optionName: "",
      optionQuantity: "",
      optionInventory: "",
      freeshipCondition: "",
    },
  ]);

  const [rows2, setRows2] = useState([{ title: "", content: "" }]);
  const [images, setImages] = useState([]);
  const [productname, setProductname] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isWaiting, setIsWaiting] = useState(false);
  const [imageCount, setImageCount] = useState(0);
  const [listRegion, setListRegion] = useState([]);
  const [listProvince, setListProvince] = useState([]);
  const [listProvinceByRegion, setListProvinceByRegion] = useState([]);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(0);
  const [selectedProvinceIndex, setSelectedProvinceIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getCognitoUserSub().then((sub) => {
      setUser_id(sub);
    });
  }, []);

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
    async function fetchData() {
      await fetchRegion();
      await fetchProvince();
      setIsLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoading && listRegion.length > 0 && listProvince.length > 0) {
      const filteredProvinces = listProvince.filter(
        (province) =>
          province.Region_id === listRegion[selectedRegionIndex].Region_id
      );
      setListProvinceByRegion(filteredProvinces);
    }
  }, [selectedRegionIndex, listProvince, listRegion, isLoading]);

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
        ({
          optionName,
          optionPrice,
          optionQuantity,
          optionInventory,
          freeshipCondition,
        }) => ({
          optionName,
          optionPrice: Number(optionPrice), // convert string to number
          optionQuantity: Number(optionQuantity), // convert string to number
          optionInventory: Number(optionInventory),
          freeshipCondition: Number(freeshipCondition),
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
        sellerID: user_id, // replace with actual sellerID
        categoryID: selectedOption,
        region_id: listRegion[selectedRegionIndex].Region_id,
        province_id: listProvinceByRegion[selectedProvinceIndex].Province_id,
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
          sellerID: user_id, // replace with actual sellerID
          categoryID: selectedOption,
          region_id: listRegion[selectedRegionIndex].Region_id,
          province_id: listProvinceByRegion[selectedProvinceIndex].Province_id,
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
    setRows([
      ...rows,
      {
        optionPrice: "",
        optionName: "",
        optionQuantity: "",
        optionInventory: "",
        freeshipCondition: "",
      },
    ]);
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
          <table className="sellerproduct">
            <thead>
              <tr>
                <th>Price</th>
                <th>¥ per</th>
                <th>Option</th>
                <th>Quantity</th>
                <th>Freeship Condition</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <div>
                      <input
                        type="text"
                        value={row.optionPrice}
                        onChange={(e) =>
                          updateRow(index, "optionPrice", e.target.value)
                        }
                        placeholder="Ex: 100"
                      />
                    </div>
                  </td>
                  <td></td>
                  <td>
                    <div>
                      <input
                        type="text"
                        value={row.optionName}
                        onChange={(e) =>
                          updateRow(index, "optionName", e.target.value)
                        }
                        placeholder="Ex: package of 1.5 kg"
                      />
                    </div>
                  </td>

                  <td>
                    <div>
                      <input
                        type="text"
                        value={row.optionQuantity}
                        onChange={(e) =>
                          updateRow(index, "optionQuantity", e.target.value)
                        }
                        placeholder="Ex: 100"
                      />
                    </div>
                    <div>
                      Inventory
                      <input
                        type="text"
                        value={row.optionInventory}
                        onChange={(e) =>
                          updateRow(index, "optionInventory", e.target.value)
                        }
                        placeholder="Ex: 100"
                      />
                    </div>
                  </td>
                  <td>
                    <div>
                      <input
                        type="text"
                        value={row.freeshipCondition}
                        onChange={(e) =>
                          updateRow(index, "freeshipCondition", e.target.value)
                        }
                        placeholder="Ex: 100"
                      />
                    </div>
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
          <h3>Origin of product</h3>
          <div className="select_region_province_for_product">
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
                  onChange={(e) => setSelectedProvinceIndex(e.target.value)}
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
