"use client";
import { useState, useEffect } from "react";
import "./user_infor.css";
import Image from "next/image";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/bootstrap.css";
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID, // Your User Pool ID
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID, // Your Client ID
};
export default function Page({ params }) {
  const API_USER_INFORMATION = ""; ///use for send the table user information to update to DB
  const { user_id_encode } = params;
  const userpool = new CognitoUserPool(poolData);
  const cognitoUser = userpool.getCurrentUser();

  const [user, setUser] = useState({
    user_name: "",
    email: "",
    telephone: "",
    address: [],
  });
  const user_id = decodeURIComponent(user_id_encode);
  const [isChangeName, setIsChangeName] = useState(false);
  const [isChangeTelephone, setIsChangeTelephone] = useState(false);
  const [addressIndex, setAddressIndex] = useState(-1);
  const [newAddress, setNewAddress] = useState(user.address[addressIndex]);
  const [newName, setNewName] = useState(user.user_name);
  const [newTelephone, setNewTelephone] = useState(user.telephone);
  const [isAddNewAddress, setIsAddNewAddress] = useState(false);
  const [newAddressValue, setNewAddressValue] = useState("");
  const [isPhoneValid, setIsPhoneValid] = useState(true);
  useEffect(() => {
    fetch(`/api/user/information?user_id=${user_id}`)
      .then((response) => response.json())
      .then((data) => {
        setUser({
          user_name: `${data.user.FName} ${data.user.LName}`,
          email: data.user.Email,
          telephone: data.user.Phone_Number,
          address: data.address.map((item) => item.Address),
        });
      })
      .catch((err) => console.log(err));
  }, []);
  async function editName() {
    await setIsChangeName(false);

    ///make request to server
    const response = await fetch("/api/user/userName", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user_id,
        FName: newName.substring(0, newName.lastIndexOf(" ")),
        LName: newName.substring(newName.lastIndexOf(" ") + 1),
      }),
    });
    if (response.ok) {
      const data = await response.json();
      await setUser({ ...user, user_name: newName });
      console.log(data);
    } else {
      console.log("Error:", response.statusText);
    }
  }
  const handleChangePhoneNumber = (value) => {
    const formattedPhoneNumber = value.startsWith("+") ? value : `+${value}`;
    setNewTelephone(formattedPhoneNumber);
    setIsPhoneValid(validatePhoneNumber(formattedPhoneNumber));
  };

  async function saveNewPhoneNumber() {
    await setIsChangeTelephone(false);
    const response = await fetch("/api/user/userPhoneNumber", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: user_id,
        phoneNumber: newTelephone,
      }),
    });
    if (response.ok) {
      const data = await response.json();
      console.log(data);
      setUser({ ...user, telephone: newTelephone });
    } else {
      console.log("Error:", response.statusText);
    }
  }

  const validatePhoneNumber = (phoneNumber) => {
    const phoneNumberPattern = /^\+\d{1,3}(\d{9,11})$/;
    return phoneNumberPattern.test(phoneNumber);
  };
  function editAddress() {
    const user_in4 = { ...user };
    user_in4.address[addressIndex] = newAddress;
    setUser(user_in4);
    setAddressIndex(-1);
    ///make request to server
  }
  function deleteAddress(index) {
    const user_in4 = { ...user };
    if (user.address.length === 1) {
      alert("You must have at least 1 address");
      return;
    }
    const addressToDelete = user_in4.address[index];
    user_in4.address.splice(index, 1);
    setUser(user_in4);
    setAddressIndex(-1);

    // Send a DELETE request to the backend
    fetch("/api/user/information/address", {
      // replace with your actual API endpoint
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        User_ID: user_id, // replace with your actual user ID
        Address: addressToDelete,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // handle the response
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }
  useEffect(() => {
    setNewAddress(user.address[addressIndex]);
  }, [addressIndex]);
  return (
    <div className="user_information_container_page">
      <h3>User information</h3>
      <div className="user_infor_page_information_container">
        <div className="user_infor_page_information">
          <div className="user_infor_page_label">User name</div>
          <div className="user_infor_page_value">
            <div className="user_infor_each_value">
              {isChangeName ? (
                <form onSubmit={editName} className="form_input_change_name">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                    }}
                  />
                </form>
              ) : (
                user.user_name
              )}
              <div>
                {isChangeName ? (
                  <button onClick={editName}>
                    <Image src="/save.png" fill="true" alt="edit icon" />
                  </button>
                ) : (
                  <button onClick={(e) => setIsChangeName(true)}>
                    <Image
                      src="/edit_user_in4.png"
                      width={20}
                      height={20}
                      alt="edit icon"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="user_infor_page_information">
          <div className="user_infor_page_label">Email</div>
          <div className="user_infor_page_value">{user.email}</div>
        </div>
        <div className="user_infor_page_information">
          <div className="user_infor_page_label">Telephone</div>
          <div className="user_infor_page_value">
            <div className="user_infor_each_value">
              {isChangeTelephone ? (
                <PhoneInput
                  country={"jp"}
                  enableSearch={true}
                  value={newTelephone}
                  onChange={(phone) => handleChangePhoneNumber(phone)}
                />
              ) : (
                user.telephone
              )}
              <div>
                {isChangeTelephone ? (
                  <button onClick={saveNewPhoneNumber}>
                    {" "}
                    <Image src="/save.png" fill="true" alt="edit icon" />
                  </button>
                ) : (
                  <button onClick={() => setIsChangeTelephone(true)}>
                    <Image
                      src="/edit_user_in4.png"
                      width={20}
                      height={20}
                      alt="edit icon"
                    />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="user_infor_page_information">
          <div className="user_infor_page_label">Address</div>
          <div className="user_infor_page_value">
            {user.address.map((address, index) => {
              return (
                <div className="user_infor_each_value" key={index}>
                  {addressIndex === index ? (
                    <form onSubmit={editAddress}>
                      <input
                        type="text"
                        value={newAddress}
                        onChange={(e) => {
                          setNewAddress(e.target.value);
                        }}
                      />
                    </form>
                  ) : (
                    address
                  )}
                  <div>
                    <button onClick={() => deleteAddress(index)}>
                      <Image
                        src="/delete_user_in4.png"
                        width={20}
                        height={20}
                        alt="edit icon"
                      />
                    </button>
                  </div>
                </div>
              );
            })}
            {isAddNewAddress && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setUser({
                    ...user,
                    address: [...user.address, newAddressValue],
                  });
                  setNewAddressValue("");
                  setIsAddNewAddress(false);
                  fetch("/api/user/information/address", {
                    // replace with your actual API endpoint
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      User_ID: user_id, // replace with your actual user ID
                      Address: newAddressValue,
                    }),
                  })
                    .then((response) => response.json())
                    .then((data) => {
                      // handle the response
                    })
                    .catch((error) => {
                      console.error("Error:", error);
                    });
                }}
                className="form_add_address_user_info"
              >
                <input
                  type="text"
                  value={newAddressValue}
                  onChange={(e) => setNewAddressValue(e.target.value)}
                  className="add_address_user_info_input"
                />
                <button type="submit">Add</button>
              </form>
            )}
            <button
              className="add_address_user_info"
              onClick={() => setIsAddNewAddress(true)}
            >
              Add new address
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
