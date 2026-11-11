import CheckoutPage from "@/component/machine/CheckoutPage";

export const metadata = {
  title: "Checkout | Moonlight Machinery",
  description: "Place your Moonlight Machinery order with Cash on Delivery.",
};

export default function CheckoutRoute() {
  return (
    <div className="w-full px-4">
      <CheckoutPage />
    </div>
  );
}
