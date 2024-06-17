"use client";
import "./product_detail_seller.css";
import { useState, useEffect } from "react";
export default function Page({ params }) {
  const { product_id } = params;
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);
  const [rows2, setRows2] = useState([{}]);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [Discount, setDiscount] = useState([{}]);
  const [seller_id_encode, setSeller_id_encode] = useState("");
  const [additionalProductQuantity, setAdditionalProductQuantity] = useState(
    []
  );

  useEffect(() => {
    fetch(`/api/user/product?product_id=${product_id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        setProduct(data);
        setName(data.Product_title);
        setRows(data.options);
        setAdditionalProductQuantity(new Array(data.options.length).fill(0)); // Assuming you want to initialize with 0s
        setRows2(data.description);
        setImages(data.images);
        setDiscount(data.discount);
        setDescription(data.Product_description);
        setSeller_id_encode(data.Seller_ID);
        console.log();
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [product_id]);

  const handleUpdate = () => {
    const productData = {
      productID: product_id,
      productTitle: name,
      productDescription: description,
      productOptionList: rows.map((row) => ({
        optionName: row.Option_name,
        optionPrice: row.Option_price,
        optionQuantity: row.Quantity,
        optionisNew: row.isNew,
      })),

      productDescriptionDetail: rows2.map((row) => ({
        title: row.title,
        content: row.content,
        isNew: row.isNew,
      })),
      productDiscount: Discount.map((row) => ({
        isNew: row.isNew,
        Condition_value: row.Condition_value,
      })),
      sellerID: seller_id_encode,
    };

    console.log(productData.productOptionList);
    console.log(productData.productDescriptionDetail);

    fetch(`/api/seller/product`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(productData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          console.log(data.message);
          alert(data.message);
        } else {
          console.error("Error:", data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  const addDiscount = () => {
    setDiscount([
      ...Discount,
      {
        Discount_Name: "",
        Type: "",
        Discount_Value: "",
        isNew: true,
      },
    ]);
  };
  const updateDiscount = (index, field, value) => {
    if (Discount && Discount[index]) {
      const newRows = [...Discount];
      if (field === "Start" || field === "End") {
        newRows[index][field] = new Date(value);
      } else {
        newRows[index][field] = value;
      }
      setDiscount(newRows);
    } else {
      console.error(
        "Discount or Discount index is undefined:",
        Discount,
        index
      );
    }
    console.log("Current Discount state:", Discount);
  };

  const deleteDiscount = (index) => {
    const newRows = [...Discount];
    newRows.splice(index, 1);
    setDiscount(newRows);
  };
  const addRow = () => {
    setRows([
      ...rows,
      { optionPrice: "", optionName: "", optionQuantity: "", isNew: true },
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
    setRows2([...rows2, { title: "", content: "", isNew: true }]);
  };

  const updateRow2 = (index, field, value) => {
    const newRows = [...rows2];
    console.log(newRows[index]);
    newRows[index][field] = value;
    setRows2(newRows);
  };

  const deleteRow2 = (index) => {
    const newRows = [...rows2];
    newRows.splice(index, 1);
    setRows2(newRows);
  };

  function handleAddQuantityToExistenceOption(index) {
    updateRow(
      index,
      "Quantity",
      Number(rows[index].Quantity) + Number(additionalProductQuantity[index])
    );

    setAdditionalProductQuantity((prev) =>
      prev.map((item, i) => (i === index ? 0 : item))
    );
  }

  return (
    <div className="upload_product_big_container">
      <div className="upload_product_container">
        <div className="input_name">
          <div>
            <h3>Name</h3>
            <input
              type="text"
              value={name ? name : ""}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <h3>Category</h3>
            <p>{product?.Category_ID}</p>
          </div>
          <div>
            <h3>Total Sale</h3>
            <p>{product?.TotalOrder} Orders</p>
          </div>
        </div>

        <div className="input_price">
          <h3>Discount</h3>

          {Discount && Discount.length > 0 && (
            <table className="sellerproduct">
              <thead>
                <tr>
                  <th>Discount Type</th>
                  <th>Quantity need</th>
                  <th>Description</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {Discount.map((row, index) => (
                  <tr key={index}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        Freeship
                      </div>
                    </td>

                    <td>
                      <div>
                        <input
                          type="number"
                          value={row.Condition_value}
                          onChange={(e) =>
                            updateDiscount(
                              index,
                              "Condition_value",
                              e.target.value
                            )
                          }
                          placeholder="Ex: 5"
                        />
                      </div>
                    </td>
                    <td>
                      <div>
                        The customer will get Freeship if they buy{" "}
                        {row.Condition_value} or more! Set to 0 to disable this
                      </div>
                    </td>

                    {row.isNew && (
                      <td>
                        <button
                          className="addrowbutton"
                          onClick={() => deleteDiscount(index)}
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {(Discount.length == 0 || !Discount) && (
            <button className="addrowbutton" onClick={addDiscount}>
              Add new Discount
            </button>
          )}
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
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index}>
                  <td>
                    <div>
                      <input
                        type="Number"
                        value={Math.floor(row.Option_price)}
                        onChange={(e) =>
                          updateRow(index, "Option_price", e.target.value)
                        }
                        placeholder="Ex: 100¥"
                      />
                      ¥
                    </div>
                  </td>
                  <td></td>
                  <td>
                    <div>
                      <input
                        type="text"
                        value={row.Option_name}
                        onChange={(e) =>
                          updateRow(index, "Option_name", e.target.value)
                        }
                        placeholder="Ex: package of 1.5 kg"
                      />
                    </div>
                  </td>

                  <td>
                    {row.isNew ? (
                      <div>
                        <input
                          type="Number"
                          placeholder="Enter the number of product in your stock"
                          value={row.Quantity}
                          onChange={(e) =>
                            updateRow(index, "Quantity", e.target.value)
                          }
                        ></input>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          flexDirection: "column",
                        }}
                      >
                        {/* <button
                        className="buttonquantity"
                        onClick={() =>
                          updateRow(index, "Quantity", Number(row.Quantity) + 1)
                        }
                      >
                        +
                      </button> */}
                        <div>
                          Total goods entered into inventory from the beginning:{" "}
                          {row.Quantity}
                        </div>
                        <div>
                          Total goods sold from the beginning:{" "}
                          {row.QuantityOfGoodsSold}
                        </div>
                        <div>
                          Total goods currenly exist in inventory:{" "}
                          {row.Quantity - row.QuantityOfGoodsSold}
                        </div>
                        <div>Additional goods added to inventory:</div>
                        <div
                          style={{
                            display: "flex",
                            columnGap: "10px",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <input
                            type="Number"
                            placeholder="The quantity of products you have added to inventory."
                            value={additionalProductQuantity[index]}
                            onChange={(e) =>
                              setAdditionalProductQuantity((prev) =>
                                prev.map((item, i) =>
                                  i === index ? e.target.value : item
                                )
                              )
                            }
                          ></input>
                          <button
                            className="addrowbutton"
                            onClick={() =>
                              handleAddQuantityToExistenceOption(index)
                            }
                          >
                            Add
                          </button>
                        </div>

                        {/* <button
                        className="buttonquantity"
                        onClick={() =>
                          updateRow(index, "Quantity", Number(row.Quantity) - 1)
                        }
                      >
                        -
                      </button> */}
                      </div>
                    )}
                  </td>
                  {row.isNew && (
                    <td>
                      <button
                        className="addrowbutton"
                        onClick={() => deleteRow(index)}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <button className="addrowbutton" onClick={addRow}>
            Add row
          </button>
        </div>
        <div className="input_description">
          <h3>Description</h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
                {rows2.length > 0 &&
                  rows2.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <input
                          type="text"
                          value={row.Title}
                          onChange={(e) =>
                            updateRow2(index, "Title", e.target.value)
                          }
                          placeholder="Ex: 100"
                        />
                      </td>
                      <td></td>
                      <td>
                        <input
                          type="text"
                          value={row.Content}
                          onChange={(e) =>
                            updateRow2(index, "Content", e.target.value)
                          }
                          placeholder="Ex: package of 1.5 kg"
                        />
                      </td>
                      {row.isNew && (
                        <td>
                          <button
                            className="addrowbutton"
                            onClick={() => deleteRow2(index)}
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
            <button className="addrowbutton" onClick={addRow2}>
              Add row
            </button>
          </div>
        </div>
        <div>
          <h3>Product Image</h3>
          {/* <input type="file" multiple onChange={handleImageChange} /> */}
          <div className="img_array">
            {images.map((image, index) => (
              <div className="img_container" key={index}>
                <img
                  src={image.Image_url} // Use Image_url property
                  alt={`Product ${index + 1}`}
                  className="product-image"
                />
                {/* <button
                  onClick={() =>
                    setImages(images.filter((_, i) => i !== index))
                  }
                >
                  Delete
                </button> */}
              </div>
            ))}
          </div>
        </div>
        <div className="submit_button">
          <button onClick={handleUpdate}>Update</button>
        </div>
      </div>
    </div>
  );
}
