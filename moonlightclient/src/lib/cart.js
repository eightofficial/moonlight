import { getProductPrice } from "@/lib/productPricing";

const CART_STORAGE_KEY = "moonlight-cart-v1";
export const CART_UPDATED_EVENT = "moonlight:cart-updated";

export function getCart() {
  const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!storedCart) return [];

  const cart = JSON.parse(storedCart);
  if (!Array.isArray(cart)) {
    throw new Error("Saved cart data is not valid.");
  }

  return cart;
}

function saveCart(cart) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function addToCart(product) {
  const id = String(product.slug || product._id || product.id || product.sku || "");
  if (!id) {
    throw new Error("This product cannot be added because it has no identifier.");
  }

  const price = getProductPrice(product.pricing);
  const cart = getCart();
  const existingItem = cart.find((item) => item.id === id);

  if (existingItem) {
    existingItem.quantity += 1;
    existingItem.price = price;
  } else {
    cart.push({
      id,
      slug: product.slug || "",
      name: product.name || "Product",
      sku: product.sku || "",
      image: product.images?.[0] || "",
      price,
      quantity: 1,
    });
  }

  saveCart(cart);
}

export function setCartItemQuantity(id, quantity) {
  const cart = getCart().map((item) =>
    item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item,
  );
  saveCart(cart);
}

export function removeFromCart(id) {
  saveCart(getCart().filter((item) => item.id !== id));
}

export function clearCart() {
  saveCart([]);
}
