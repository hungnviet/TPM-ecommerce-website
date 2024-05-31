"use client";
import "./forgot_password.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";

import Link from "next/link";
export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [err, setErr] = useState("");

  const poolData = {
    UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID,
    ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID,
  };
  const userPool = new CognitoUserPool(poolData);

  const handleEnterEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setErr("Please enter the email");
      return;
    }

    const user = new CognitoUser({ Username: email, Pool: userPool });
    user.forgotPassword({
      onSuccess: () => {
        alert("Please check your email for the password reset link.");
        router.push("/sign_in");
      },
      onFailure: (err) => {
        setErr(err.message);
      },
    });
  };

  return (
    <div className="forgot_password_container">
      <div>
        <h2>Forgot Password</h2>
        <form className="form_forget_password" onSubmit={handleEnterEmail}>
          <p>
            Please enter your email address. We will send you a link to reset
            your password.
          </p>
          <input
            placeholder="youremail@gmail.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
          <button type="submit" className="btn_sendCode">
            Send Reset Link
          </button>
          <div className="err_msg_forget_password">{err}</div>
        </form>
        <Link href="/sign_in">Back to login</Link>
      </div>
    </div>
  );
}
