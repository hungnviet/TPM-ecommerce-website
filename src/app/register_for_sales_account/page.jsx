"use client";
import { useEffect, useState } from "react";
import AWS from "aws-sdk";

import "./register_seller.css";
import { useRouter } from "next/navigation";
import { Allerta } from "next/font/google";
import { getCognitoUserSub } from "@/config/cognito";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Image from "next/image";
AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});
export default function Page() {
  const cognitoidentityserviceprovider =
    new AWS.CognitoIdentityServiceProvider();

  const route = useRouter();
  const s3 = new AWS.S3();

  const [isRegister, setIsRegister] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [images, setImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [shopAddress, setShopAddress] = useState("");
  const [user_id, setUser_id] = useState(null);
  const [isCheck, setIsCheck] = useState(false);
  const [shopName, setShopName] = useState("");

  useEffect(() => {
    getCognitoUserSub().then((sub) => {
      setUser_id(sub);
    });
  }, []);

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

  async function handleCreateShop() {
    if (!isCheck) {
      setErrMsg("Please accept the terms and conditions");
    } else if (shopName === "") {
      setErrMsg("Please enter your shop's name");
    } else {
      // handle with server create shop
      // navigate to shop page
      setErrMsg("");

      // Upload files to S3 and get their URLs
      const imageUrls = await Promise.all(
        selectedFiles.map(async (file) => {
          const newName = await checkAndGenerateFileName(
            s3,
            "tpms3",
            file.name
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
      const shopName_encode = encodeURIComponent(shopName.replace(/\s/g, ""));
      // const res = await fetch("/api/seller/information", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     shopName: shopName,
      //     User_ID: user_id,
      //     shippingCompanyList: [
      //       "Default Shipping Company 1",
      //       "Default Shipping Company 2",
      //     ],
      //     shopImg: validImageUrls[0],
      //     shopAddress: shopAddress,
      //   }),
      // });
      // if (res.ok) {
      //   const params = {
      //     UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID, // replace with your User Pool ID
      //     Username: user_id, // replace with the username of the user
      //     GroupName: "seller",
      //   };

      //   cognitoidentityserviceprovider.adminAddUserToGroup(
      //     params,
      //     function (err, data) {
      //       console.log(data); // successful response
      //       if (err) console.log(err, err.stack); // an error occurred
      //       else console.log(data); // successful response
      //     }
      //   );
      // }
      // route.push(`/seller_mode/dashboard`);
      toast.success("We have received your request. Please wait for approval.");

      /// make the request to server to add the user to the list of user register become seller
      /// end points: /api/seller/registerStage/registerSeller
    }
  }

  return (
    <div className="regiester_as_seller_page_container">
      <ToastContainer />

      <div className="header_register_as_seller">
        <h3>TPM</h3>
      </div>
      {!isRegister && (
        <div className="body_register_as_seller">
          <div className="content_for_register_as_seller">
            <h2>Create your own</h2>
            <h1>Online Shop now</h1>
            <p>
              Embark on your journey as a seller and let your unique products
              shine on our platform
            </p>
          </div>
          <div className="btn_container_for_register_as_seller">
            <button>Back to homepage</button>
            <button onClick={() => setIsRegister(true)}>Next</button>
          </div>
        </div>
      )}
      {isRegister && (
        <div className="Register_as_seller_body">
          <div className="register_as_seller_form">
            <p className="header_register_as_seller">Your shop is name</p>
            <input
              type="text"
              placeholder="Enter your shop's name"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
            />
          </div>
          <div className="register_as_seller_form_privacy">
            <input
              type="checkbox"
              checked={isCheck}
              onClick={() => setIsCheck(!isCheck)}
            />
            <div>
              I have read and accepted the
              <a href="#">Terms and Conditions</a>
            </div>
          </div>
          <div className="input_address_seller">
            <h3>Your shop is address</h3>
            <input
              type="text"
              placeholder="Ex: Tokyo 123 street doraemon"
              value={shopAddress}
              onChange={(e) => setShopAddress(e.target.value)}
            ></input>
          </div>
          <div className="choose_shop_image_container">
            <h3> Your Shop is Profile</h3>
            {images.length === 0 && (
              <input type="file" multiple onChange={handleImageChange} />
            )}
            <div className="img_array_choose_seller_image">
              {images.map((image, index) => (
                <div className="img_container_choose_seller_image" key={index}>
                  <Image src={image} alt={`Product ${index + 1}`} fill="true" />
                </div>
              ))}
            </div>
            <button
              onClick={() => setImages(images.filter((_, i) => i !== index))}
              className="btn_delete_image"
            >
              Delete
            </button>
          </div>

          <p>{errMsg}</p>
          <button onClick={handleCreateShop} className="btn_create_shop">
            CREATE SHOP
          </button>
        </div>
      )}
    </div>
  );
}
