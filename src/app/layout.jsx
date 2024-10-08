import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
export const dynamic = "force-dynamic";

export const metadata = {
  title: "TPM ecommerce website",
  description: "Generated by create next app",
};

import "./global.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
