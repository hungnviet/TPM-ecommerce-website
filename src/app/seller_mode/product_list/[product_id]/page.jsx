"use client";
import "../../upload_product/page.css";
import { useState, useEffect } from "react";
export default function Page({ params }) {
  const { product_id } = params;
  const [product, setProduct] = useState(null);
  const [name, setName] = useState("");
  const [rows, setRows] = useState([]);
  const [rows2, setRows2] = useState([{}]);
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState("");
  const [Voucher, setVoucher] = useState([{}]);
  const [seller_id_encode, setSeller_id_encode] = useState("");

  useEffect(() => {
    fetch(`/api/user/product?product_id=${product_id}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);

        const formattedVouchers = data.voucher.map((v) => ({
          ...v,
          Start: new Date(v.Start).toISOString(),
          End: new Date(v.End).toISOString(),
        }));
        setProduct(data);
        setName(data.Product_title);
        setRows(data.options);
        setRows2(data.description);
        setImages(data.images);
        setVoucher(formattedVouchers);
        setDescription(data.Product_description);
        setSeller_id_encode(data.Seller_ID);
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
        optionInventory: row.Inventory,
        optionisNew: row.isNew,
      })),
      productVoucherList: Voucher.map((row) => ({
        Voucher_name: row.Voucher_Name,
        Type: row.Type,
        Discount_value: row.Discount_Value,
        Start: row.Start,
        End: row.End,
        isNew: row.isNew,
      })),
      sellerID: seller_id_encode,
    };
    description: rows2.map((row) => ({
      title: row.title,
      content: row.content,
    }));
    console.log(productData.productOptionList);
    console.log(productData.productVoucherList);

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
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const fileReaders = files.map((file) => {
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
  const addVoucher = () => {
    setVoucher([
      ...Voucher,
      {
        Voucher_Name: "",
        Type: "",
        Discount_Value: "",
        Start: "",
        End: "",
        isNew: true,
      },
    ]);
  };
  const updateVoucher = (index, field, value) => {
    if (Voucher && Voucher[index]) {
      const newRows = [...Voucher];
      if (field === "Start" || field === "End") {
        newRows[index][field] = new Date(value);
      } else {
        newRows[index][field] = value;
      }
      setVoucher(newRows);
    } else {
      console.error("Voucher or voucher index is undefined:", Voucher, index);
    }
    console.log("Current Voucher state:", Voucher);
  };

  const deleteVoucher = (index) => {
    const newRows = [...Voucher];
    newRows.splice(index, 1);
    setVoucher(newRows);
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
        <div className="input_name">
          <h3>Name</h3>
          <input
            type="text"
            value={name ? name : ""}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="input_price">
          <h3>Voucher Management</h3>

          <table className="sellerproduct">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Discount Value</th>
                <th>Start</th>
                <th>End</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Voucher.map((row, index) => (
                <tr key={index}>
                  <td>
                    <div>
                      <input
                        type="text"
                        value={row.Voucher_Name}
                        onChange={(e) =>
                          updateVoucher(index, "Voucher_Name", e.target.value)
                        }
                        placeholder="Ex: Flash Sale"
                      />
                    </div>
                  </td>
                  <td>
                    <div>
                      <select
                        id="type"
                        name="type"
                        className="voucher-select"
                        value={row.Type}
                        onChange={(e) =>
                          updateVoucher(index, "Type", e.target.value)
                        }
                      >
                        <option value="Ship">Ship</option>
                        <option value="Freeship">Freeship</option>
                        <option value="Discount">Discount</option>
                      </select>
                    </div>
                  </td>

                  <td>
                    <div>
                      <input
                        type="text"
                        value={row.Discount_Value}
                        onChange={(e) =>
                          updateVoucher(index, "Discount_Value", e.target.value)
                        }
                        placeholder="Ex: 30%"
                      />
                    </div>
                  </td>
                  <td>
                    <div>
                      <input
                        type="date"
                        value={
                          row.Start
                            ? new Date(row.Start).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          updateVoucher(index, "Start", e.target.value)
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <div>
                      <input
                        type="date"
                        value={
                          row.End
                            ? new Date(row.End).toISOString().split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          updateVoucher(index, "End", e.target.value)
                        }
                      />
                    </div>
                  </td>
                  <td>
                    <button onClick={() => deleteVoucher(index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addVoucher}>Add new Voucher</button>
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
                        type="text"
                        value={row.Option_price}
                        onChange={(e) =>
                          updateRow(index, "Option_price", e.target.value)
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
                        value={row.Option_name}
                        onChange={(e) =>
                          updateRow(index, "Option_name", e.target.value)
                        }
                        placeholder="Ex: package of 1.5 kg"
                      />
                    </div>
                  </td>

                  <td>
                    <div>
                      <input
                        type="text"
                        value={row.Quantity}
                        onChange={(e) =>
                          updateRow(index, "Quantity", e.target.value)
                        }
                        placeholder="Ex: 100"
                      />
                    </div>
                    <div>
                      Inventory
                      <input
                        type="text"
                        value={row.Inventory}
                        onChange={(e) =>
                          updateRow(index, "Inventory", e.target.value)
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
