"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./home.css";
import { CognitoUserPool, CognitoUser } from "amazon-cognito-identity-js";
import { Knock } from "@knocklabs/node";
import { BeatLoader } from "react-spinners";

const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID, // Your User Pool ID
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID, // Your Client ID
};

export default function Home() {
  const [isSignedIn, setIsSignedIn] = useState(null);
  const router = useRouter();
  const userPool = new CognitoUserPool(poolData);
  let cognitoUser = userPool.getCurrentUser();
  const knock = new Knock(process.env.NEXT_PUBLIC_KNOCK_SECRET);
  useEffect(() => {
    if (cognitoUser != null) {
      cognitoUser.getSession(function (err, session) {
        if (err) {
          alert(err);
          return;
        }
        cognitoUser.getUserAttributes(async function (err, attributes) {
          if (err) {
            // Handle error
            console.log(err);
          } else {
            const sub = attributes.find(
              (attribute) => attribute.Name === "sub"
            ).Value;
            const name =
              attributes.find((attribute) => attribute.Name === "given_name")
                .Value +
              " " +
              attributes.find((attribute) => attribute.Name === "family_name")
                .Value;
            const email = attributes.find(
              (attribute) => attribute.Name === "email"
            ).Value;
            const knockuser = await knock.users.identify(sub, {
              name: name,
              email: email,
            });
            console.log(knockuser);
            router.push("/homepage");
            setIsSignedIn(true);
          }
        });
      });
    } else {
      setIsSignedIn(false);
      router.push("/homepage");
    }
  }, []);

  const handleShopping = () => {
    router.push("/homepage");
  };

  if (isSignedIn === null) {
    return (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "white",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            marginBottom: "20px",
            fontSize: "20px",
            animation: "fade 1s infinite",
          }}
        >
          TPM EC
        </div>
        <BeatLoader loading={!isSignedIn} size={10} color="#36d7b7" />
      </div>
    );
  }

  if (isSignedIn) {
    return null; // or redirect to homepage
  }

  return (
    <div className="home">
      <div className="content">
        <p>Content</p>
        <button onClick={handleShopping}>Shopping</button>
      </div>
    </div>
  );
}
