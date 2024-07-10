"use client";
import "./sign_in.css";
import { signIn, confirmSignIn } from "aws-amplify/auth";
import { Amplify } from "aws-amplify";

import {
  CognitoUser,
  AuthenticationDetails,
  CognitoUserPool,
} from "amazon-cognito-identity-js";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
const poolData = {
  UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID, // Your User Pool ID
  ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID, // Your Client ID
};
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();
  const userPool = new CognitoUserPool(poolData);
  let cognitoUser = userPool.getCurrentUser();
  useEffect(() => {
    if (cognitoUser != null) {
      cognitoUser.getSession(function (err, session) {
        if (err) {
          alert(err);
          return;
        }
        cognitoUser.getUserAttributes(function (err, attributes) {
          if (err) {
            // Handle error
          } else {
            // Do something with attributes
            const sub = attributes.find(
              (attribute) => attribute.Name === "sub"
            ).Value;
            router.push(`/homepage/${encodeURIComponent(sub)}`);
          }
        });
      });
    }
  }, []);

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
        userPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID,
        loginWith: {
          // Optional
          oauth: {
            domain: process.env.NEXT_PUBLIC_COGNITO_DOMAIN,
            scopes: [
              "openid email phone profile aws.cognito.signin.user.admin ",
            ],
            redirectSignIn: ["http://localhost:3000/", "https://example.com/"],
            redirectSignOut: ["http://localhost:3000/", "https://example.com/"],
            responseType: "code",
          },
          username: "false",
          email: "true", // Optional
          phone: "false", // Optional
        },
      },
    },
  });

  function check_submit(e) {
    e.preventDefault();

    if (email === "") {
      setErr("Please enter your email");
      return;
    } else if (password === "") {
      setErr("Please enter your password");
      return;
    } else {
      setErr("");

      signIn({
        username: email, // use email as the username
        password,
        options: {
          authFlowType: "USER_PASSWORD_AUTH",
        },
      })
        .then((user) => {
          router.push(`/`);
        })
        .catch((err) => {
          setErr(err.message || JSON.stringify(err));
        });
    }
  }

  return (
    <div className="container">
      <p className="helo">
        すでにアカウントをお持ちの場合は、ログインしてください。
      </p>
      <form className="form_container" onSubmit={check_submit}>
        <h2>ログイン</h2>
        <div className="input_container">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <p className="err_msg_logIn">{err}</p>
        </div>
        <button type="submit">ログイン</button>
        <div className="forgot_password">
          <Link href="/sign_in/forgot_password">パスワード変更</Link>
        </div>
      </form>
    </div>
  );
}
