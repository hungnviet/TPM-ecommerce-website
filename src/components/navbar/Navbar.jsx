"use client";
import "./navbar.css";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";
const checkActive = (check) => {
  if (check) {
    return "active";
  } else {
    return "";
  }
};
export default function Navbar() {
  const router = useRouter();
  const pathName = usePathname();
  return (
    <div className="navbar_container">
      <div className="name_container">
        <button
          onClick={() => {
            router.push("/homepage/guess");
          }}
          className="btn_home_navbar"
        >
          <h3>TPM</h3>
        </button>
      </div>
      <div className="link_container"></div>
      <div className="btn_container">
        <div>
          <button onClick={() => router.push("/sign_in")}>Sign In</button>
          <button onClick={() => router.push("/sign_up_1")}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}
