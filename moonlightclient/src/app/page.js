import Hero from "./home/Hero";
import HomePageClient from "./HomePageClient";

export const revalidate = 3600;

export default function Page() {
  return (
    <>
      <Hero />
      <HomePageClient />
    </>
  );
}
