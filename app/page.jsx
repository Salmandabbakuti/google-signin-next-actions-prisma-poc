"use client";
import { GoogleLogin } from "@react-oauth/google";
import { message } from "antd";
import { googleLogin } from "../lib/actions";
import styles from "./page.module.css";

const handleOnSuccess = async (response) => {
  console.log("Google login response:", response);
  try {
    message.info("Logging in...");
    await googleLogin(response?.credential);
    message.success("Login successful. Redirecting...");
  } catch (error) {
    message.error("Login failed. Please try again.");
    console.error("Google login failure:", error);
  }
};

const handleOnError = (error) => {
  console.error("Google login failure:", error);
  message.error("Login failed. Please try again.");
};

export default function Home() {
  return (
    <div className={styles.page}>
      <h1>Welcome to SignIn with Google!</h1>
      <GoogleLogin
        type="standard"
        theme="filled_blue"
        size="large"
        text="continue_with"
        shape="pill"
        onSuccess={handleOnSuccess}
        onError={handleOnError}
        useOneTap
      />
    </div>
  );
}
