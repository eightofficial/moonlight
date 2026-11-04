import CartPage from "@/component/machine/CartPage";

export const metadata = {
  title: "Your Cart | Moonlight Machinery",
  description: "Review the products saved in your local Moonlight Machinery cart.",
};

export default function CartRoute() {
  return (
    <div className="w-full px-4">
      <CartPage />
    </div>
  );
}
