import { Geist, Geist_Mono } from "next/font/google";


import localFont from 'next/font/local'
import '@fontsource-variable/unbounded/wght.css';
import '@fontsource/gugi';
import '@fontsource/kalam';
import '@fontsource/sniglet';
import '@fontsource/dm-serif-text';
import Footer from "@/component/home/fixed/Footer";
import Queryprovider from "@/services/provider/Queryprovider";
import SocialSection from "@/component/home/fixed/Socailsection";
import { ModalProvider } from "@/contaxt/admin/ContaxtApi";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const metadata = {
  title: "Admin Panel | Moonlight Machinery",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}  h-full antialiased`}
    >
      <ModalProvider>      
        <body className="min-h-full bg-[#faf9f5] flex flex-col "><Queryprovider>  {children}</Queryprovider></body>
      </ModalProvider>

    </html>
  );
}
