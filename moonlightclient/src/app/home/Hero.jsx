import SectionContact from "@/component/home/main/SectionContact";

import Footer from "@/component/home/fixed/Footer";
import ProductShowcase from "@/component/home/main/Listproduct";
import BannerCarousel from "@/component/home/main/Crousal";
import Header from "@/component/home/fixed/Header";
import TrustSection from "@/component/home/main/TrustSection";
import BranchRoute from "@/component/home/main/BranchRoute";
import FaqSection from "@/component/home/main/FaqSection";
import { getProducts } from "@/services/home/getProducts.server";

export default async function Hero() {
  const initialProducts = await getProducts();

  return (
    <div className=" w-full mx-auto justify-center items-center flex flex-col">
      <Header />
      <BannerCarousel />
      {/* <UtilitarianHero /> */}
      <br />

      <ProductShowcase
        view={true}
        initialProducts={initialProducts}
        
      />
      <BranchRoute />

      {/* <ProductPage /> */}
      {/* <HeroDesign /> */}
      {/* <HowItWorks /> */}
      {/* <SectionServices /> */}
      {/* <ProductPA /> */}
      {/* <StackScroll /> */}
      <TrustSection />
      {/* <SectionTestimonials /> */}
      <SectionContact />
      <FaqSection />
      <Footer />
    </div>
  );
}
