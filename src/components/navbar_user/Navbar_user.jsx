"use client";
import Link from "next/link";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import "./navbar_user.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { getCognitoUserSub } from "@/config/cognito";

import {
  KnockProvider,
  KnockFeedProvider,
  NotificationIconButton,
  NotificationFeedPopover,
} from "@knocklabs/react";

// Required CSS import, unless you're overriding the styling
import "@knocklabs/react/dist/index.css";
import AWS from "aws-sdk";

// Configure AWS

AWS.config.update({
  accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
  region: process.env.NEXT_PUBLIC_AWS_REGION,
});
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID, // Your User Pool ID
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID, // Your Client ID
};

const categories = [
  { name: "野菜", image: "/1.webp" },
  { name: "果物", image: "/2.webp" },
  { name: "米・穀類", image: "/3.webp" },
  { name: "お茶", image: "/4.webp" },
  { name: "魚介類", image: "/5.webp" },
  { name: "肉", image: "/6.webp" },
  { name: "卵・乳", image: "/7.webp" },
  { name: "蜂蜜", image: "/8.webp" },
  { name: "加工食品", image: "/9.webp" },
  { name: "花・観葉植物", image: "/10.webp" },
];

export default function NavbarUser({}) {
  const [isSeller, setIsSeller] = useState(false);
  const [cognitoUser, setCognitoUser] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const notifButtonRef = useRef(null);
  const [user, setUser] = useState({});
  const router = useRouter();
  const [userID, setUserID] = useState("");
  useEffect(() => {
    const fetchUserSub = async () => {
      const sub = await getCognitoUserSub();
      setUserID(sub);
    };

    fetchUserSub();
  }, []);

  const cognitoidentityserviceprovider =
    new AWS.CognitoIdentityServiceProvider();

  const [email, setemail] = useState("");
  const [numliked, setnumliked] = useState(0);

  const [show_option, set_show_option] = useState(false);
  const [search_input, set_search_input] = useState("");
  const [isShowCategory, setIsShowCategory] = useState(false);
  const handleClose = () => {
    set_show_option(false);
  };

  useEffect(() => {
    if (!userID) return;

    const params = {
      UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID, // replace with your User Pool ID
      Username: userID, // replace with the username of the user
    };

    cognitoidentityserviceprovider.adminListGroupsForUser(
      params,
      function (err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else {
          const groups = data.Groups.map((group) => group.GroupName);
          setIsSeller(groups.includes("seller"));
        }
      }
    );

    async function fetchUserInformation() {
      const response = await fetch(
        `/api/user/information?user_id=${encodeURIComponent(userID)}`
      );
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        console.log(data.user);
      }
    }

    async function fetchlikedproduct() {
      const response = await fetch(
        `/api/user/product_like?user_id=${encodeURIComponent(userID)}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setnumliked(data.length);
      }
    }

    fetchUserInformation();
    fetchlikedproduct();

    const userPool = new CognitoUserPool(poolData);
    setCognitoUser(userPool.getCurrentUser());

    if (cognitoUser != null) {
      cognitoUser.getSession((err, session) => {
        if (err) {
          console.error(err);
          return;
        }

        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            console.error(err);
            return;
          }

          const nameAttribute = attributes.find(
            (attribute) => attribute.Name === "family_name"
          );

          if (nameAttribute) {
            setemail(nameAttribute.Value);
          }
        });
      });
    }
  }, [userID]); // add userID to the dependency array
  function handle_show_option() {
    set_show_option(!show_option);
  }
  async function register_as_seller() {
    /// check this user is seller or not if not then show register page
    router.push(`/register_for_sales_account`);
    handleClose();
    /// else navigate to seller page
    //router.push(`/seller_mode/seller_dashboard`);
  }
  async function handle_search(e) {
    e.preventDefault();
    set_search_input("");
    router.push(`/homepage/search_result/${search_input}`);
  }
  function signOutUser() {
    handleClose();
    const userPool = new CognitoUserPool(poolData);
    setCognitoUser(userPool.getCurrentUser());
    if (cognitoUser != null) {
      cognitoUser.signOut();
      router.push("/sign_in");
    }
  }
  async function handleSelectCategory(category) {
    await setIsShowCategory(false);
    router.push(`/homepage/category/${category}`);
  }
  return (
    <KnockProvider
      apiKey={"pk_test_pEYdIA3silk_jAqYMf3vgFMiDz-_LtT4iWDP5oUIIgw"}
      userId={userID}
    >
      <KnockFeedProvider feedId={"5dc457d4-da3f-46ec-b7fa-89db6fcf582c"}>
        <div className="navbar_user_container">
          <div className="left_section_navbar_container">
            <button onClick={() => router.push(`/homepage`)}>
              <h3>TPM</h3>
            </button>
          </div>
          <div className="middle_section_navbar_container">
            <form onSubmit={handle_search}>
              <input
                type="text"
                placeholder="商品名またはショップ名を入力して検索してください"
                value={search_input}
                onChange={(e) => set_search_input(e.target.value)}
              />
            </form>
            <button
              onClick={() => setIsShowCategory(true)}
              className="btn_show_category_navbar"
            >
              カテゴリー
            </button>
          </div>
          {(!cognitoUser || userID === "guest") && (
            <div className="right_section_navbar_container2">
              <div>
                <button onClick={() => router.push("/sign_in")}>
                  ログイン
                </button>
              </div>
              <div>
                <button onClick={() => router.push("/sign_up_1")}>
                  新規登録
                </button>
              </div>
            </div>
          )}
          {cognitoUser && userID != "guest" && (
            <div className="right_section_navbar_container">
              <div>
                <button
                  className="icon_navbar_container"
                  onClick={() => {
                    router.push(`/homepage/cart`);
                  }}
                >
                  <Image
                    src="/cart_icon.png"
                    width={25}
                    height={25}
                    alt="cart_icon"
                  />
                </button>
                <p>{user.Total_Quantity ? user.Total_Quantity : "loading.."}</p>
              </div>
              <div>
                <button
                  className="icon_navbar_container"
                  onClick={() => {
                    router.push("/homepage/like_product");
                  }}
                >
                  <Image
                    src="/heart_nav.png"
                    width={25}
                    height={25}
                    alt="cart_icon"
                  />
                </button>
                <p>{numliked}</p>
              </div>
              <div className="notificationknock">
                {/* <button
                  ref={notifButtonRef}
                  className="icon_navbar_container"
                  onClick={() => setIsVisible(!isVisible)}
                >
                  <Image
                    src="/notification.png"
                    width={25}
                    height={25}
                    alt="Notification Icon"
                  />
                </button> */}
                <div style={{ marginTop: "5px" }}>
                  <NotificationIconButton
                    ref={notifButtonRef}
                    onClick={(e) => setIsVisible(!isVisible)}
                  />
                </div>
                <NotificationFeedPopover
                  buttonRef={notifButtonRef}
                  isVisible={isVisible}
                  onClose={() => setIsVisible(false)}
                />
              </div>
              <div>
                <button
                  className="icon_navbar_container"
                  onClick={() => {
                    router.push("/homepage/like_product");
                  }}
                >
                  <div className="icon_navbar_container">
                    <Image
                      src="/user_icon.png"
                      width={25}
                      height={25}
                      alt="cart_icon"
                    />
                  </div>
                </button>
                <p>{user.LName ? user.LName : "loading..."}</p>
              </div>
              <div>
                <button
                  className="icon_navbar_container"
                  onClick={handle_show_option}
                >
                  <Image
                    src="/menu_icon.png"
                    width={20}
                    height={20}
                    alt="cart_icon"
                  />
                </button>
              </div>
            </div>
          )}
          {show_option && (
            <div className="list_option">
              <Link href={`/homepage/user_information`} onClick={handleClose}>
                ユーザー情報
              </Link>
              <Link href={`/homepage/cart`} onClick={handleClose}>
                あなたのカート
              </Link>
              <Link href={`/homepage/order_managment`} onClick={handleClose}>
                注文管理
              </Link>
              {isSeller ? (
                <button onClick={() => router.push(`/seller_mode/dashboard`)}>
                  My Shop
                </button>
              ) : (
                <button onClick={register_as_seller}>Register as seller</button>
              )}
              <button onClick={signOutUser}>ログアウト</button>{" "}
            </div>
          )}
          {/* list category */}
          {isShowCategory && (
            <div className="category_list_contianer">
              <div className="category_list_overlay">
                <div className="list_category">
                  <div className="header_close_show_category">
                    <button onClick={() => setIsShowCategory(false)}>
                      近い
                    </button>
                  </div>
                  <div className="list_btn_category_navbar">
                    {categories.map((category, index) => {
                      return (
                        <button
                          className="btn_category_navbar"
                          key={index}
                          onClick={() => handleSelectCategory(index + 1)}
                        >
                          <div className="btn_category_navbar_img">
                            <Image
                              src={category.image}
                              fill="true"
                              alt="icon category"
                            />
                          </div>
                          <div>{category.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </KnockFeedProvider>
    </KnockProvider>
  );
}
