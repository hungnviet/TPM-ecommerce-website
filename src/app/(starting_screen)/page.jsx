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
      cognitoUser.getSession((err, session) => {
        if (err || !session.isValid()) {
          console.error("Session error or expired:", err);
          // Sign out the user if there is an error or session is not valid
          cognitoUser.signOut();
          setIsSignedIn(false);
          router.push("/sign_in");
          return;
        }

        // Fetch user attributes if session is valid
        cognitoUser.getUserAttributes((err, attributes) => {
          if (err) {
            console.log("Error fetching user attributes:", err);
            cognitoUser.signOut();
            setIsSignedIn(false);
            router.push("/homepage");

            return;
          }
          // Assuming identity and navigation are successful
          const sub = attributes.find((attr) => attr.Name === "sub").Value;
          const name =
            attributes.find((attr) => attr.Name === "given_name").Value +
            " " +
            attributes.find((attr) => attr.Name === "family_name").Value;
          const email = attributes.find((attr) => attr.Name === "email").Value;

          console.log("User identified:", { sub, name, email });
          setIsSignedIn(true);
          router.push("/homepage"); // Redirect to homepage on success
        });
      });
    } else {
      console.log("No Cognito user found, redirecting to sign-in.");
      router.push("/sign_in");
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
