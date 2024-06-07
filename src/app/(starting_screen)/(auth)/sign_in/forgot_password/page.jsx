"use client";
import "./forgot_password.css";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CognitoUser, CognitoUserPool } from "amazon-cognito-identity-js";

import Link from "next/link";
export default function Forgot_Password() {
  const API_VERYFI_EMAIL = ""; /// API for checking the email have already exit or not if not then generate the code and send to the user. It will give the response that the email is valid or not.
  /// in this page we will use the method GET to check the email and send the code to the user
  const poolData = {
    UserPoolId: process.env.NEXT_PUBLIC_AWS_Userpool_ID,
    ClientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID, // Your Client ID
  };
  const UserPool = new CognitoUserPool(poolData);

  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isCheckCode, setIsCheckCode] = useState(true);
  const [canResetPassword, setCanResetPassword] = useState(false); /// if the code is valid then set the state to true and send the user to the reset password page.
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [seePassword, setSeePassword] = useState(false);
  const [seeConfirmPassword, setSeeConfirmPassword] = useState(false);
  function handle_show_password(e) {
    e.preventDefault();
    setSeePassword(!seePassword);
  }
  function handle_show_confirm_password(e) {
    e.preventDefault();
    setSeeConfirmPassword(!seeConfirmPassword);
  }
  async function handle_enter_email(e) {
    e.preventDefault();
    if (email === "") {
      setErr("Please enter the email");
      return;
    } else {
      const user = new CognitoUser({ Username: email, Pool: UserPool });
      user.forgotPassword({
        onSuccess: function (data) {
          // successfully initiated reset password request
          setIsCheckCode(true);
        },
        onFailure: function (err) {
          // error occurred
          setErr(err.message);
        },
      });
    }
  }
  async function handle_verify_code(e) {
    e.preventDefault();
    if (password === "" || confirmPassword === "") {
      setErr("Please enter all the input");
      return;
    } else if (password !== confirmPassword) {
      setErr("Password does not match");
      return;
    } else if (code === "") {
      setErr("Please enter the code");
      return;
    } else {
      const user = new CognitoUser({ Username: email, Pool: UserPool });
      user.confirmPassword(code, password, {
        onSuccess: function (result) {
          // code verified
          alert("Password has been reset");
          router.push("/sign_in");
        },
        onFailure: function (err) {
          // error occurred
          setErr(err.message);
          console.log(err);
        },
      });
    }
  }

  return (
    <div className="forgot_password_container">
      {!isCheckCode && !canResetPassword && (
        <div>
          <div>
            <h2>Forgot Password</h2>
          </div>
          <form className="form_forget_password" onSubmit={handle_enter_email}>
            <p>
              Please enter your email address. We will send you a code to reset
              your password.
            </p>
            <input
              placeholder=" youremail@gmail.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            ></input>
            <button type="submit" className="btn_sendCode">
              Send Code
            </button>
            <div className="err_msg_forget_password">{err}</div>
          </form>
          <Link href="/sign_in">Back to login</Link>
        </div>
      )}
      {isCheckCode && (
        <div className="input_code_forget_pass">
          <h2>input code</h2>
          <p>Enter the code we have send you via email</p>
          <form className="codeformforgot" onSubmit={handle_verify_code}>
            <input
              type="text"
              className="input_code_forget_pass"
              placeholder="enter code here"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </form>
          <button className="btn_resend_code_forget_password">
            resend code
          </button>
          <div className="reset_password">
            <h2>Reset Your Password</h2>
            <form>
              <p>New Password</p>
              <div className="input_container_reset_password">
                <input
                  className="reset_password form input"
                  type={"password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <p>Confirm Password</p>
              <div className="input_container_reset_password">
                <input
                  type={"password"}
                  placeholder="Confirm Password"
                  className="reset_password form input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="btn_reset_password">
                {err && <div className="err_msg_forget_password">{err}</div>}
              </div>
            </form>
          </div>
          <button
            className="btn_resend_code_forget_password"
            onClick={handle_verify_code}
          >
            Reset password
          </button>
        </div>
      )}
    </div>
  );
}
