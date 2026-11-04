"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import {
  CART_UPDATED_EVENT,
  clearCart,
  getCart,
  removeFromCart,
  setCartItemQuantity,
} from "@/lib/cart";
import "./style/cart.scss";

function formatPrice(price) {
  return (price || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function CartPage() {
  const [items, setItems] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState("");

  const refreshCart = useCallback(() => {
    try {
      setItems(getCart());
      setError("");
    } catch (cartError) {
      console.error("Unable to read the saved cart:", cartError);
      setError("Your saved cart could not be loaded. Please try again.");
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(refreshCart, 0);
    window.addEventListener(CART_UPDATED_EVENT, refreshCart);
    window.addEventListener("storage", refreshCart);
    return () => {
      window.clearTimeout(initialLoad);
      window.removeEventListener(CART_UPDATED_EVENT, refreshCart);
      window.removeEventListener("storage", refreshCart);
    };
  }, [refreshCart]);

  function updateCart(action) {
    try {
      action();
    } catch (cartError) {
      console.error("Unable to update the saved cart:", cartError);
      setError("Your cart could not be updated. Please try again.");
    }
  }

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  function handleOrderNow() {
    const whatsappPhone = (
      process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "+918178445596"
    ).replace(/\D/g, "");
    const orderDetails = [
      "*Order Request*",
      "",
      ...items.flatMap((item, index) => [
        `*${index + 1}. ${item.name}*`,
        ...(item.sku ? [`SKU: ${item.sku}`] : []),
        `Quantity: ${item.quantity}`,
        `Price: ₹${formatPrice(item.price)} each`,
        `Subtotal: ₹${formatPrice(item.price * item.quantity)}`,
        "",
      ]),
      `*Estimated total: ₹${formatPrice(total)}*`,
      "",
      "Please confirm availability, final pricing, and delivery details.",
    ].join("\n");

    window.open(
      `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(orderDetails)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <p className="cart-eyebrow">Saved on this device</p>
          <h1>Your Cart</h1>
          <p>
            {itemCount} {itemCount === 1 ? "item" : "items"} saved for your next
            visit.
          </p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            className="cart-clear"
            onClick={() => updateCart(clearCart)}
          >
            <Trash2 size={16} /> Clear cart
          </button>
        )}
      </div>

      {error && <p className="cart-error" role="alert">{error}</p>}

      {!isReady ? (
        <p className="cart-empty">Loading your saved cart...</p>
      ) : error && items.length === 0 ? null : items.length === 0 ? (
        <section className="cart-empty">
          <ShoppingCart size={36} />
          <h2>Your cart is empty</h2>
          <p>Add products to keep them saved here on this device.</p>
          <Link href="/home/machines" className="cart-browse">
            Browse products
          </Link>
        </section>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <article className="cart-item" key={item.id}>
                <Link
                  className="cart-item-image"
                  href={
                    item.slug
                      ? `/home/machines/${item.slug}`
                      : "/home/machines"
                  }
                  aria-label={`View ${item.name}`}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={128}
                      height={128}
                    />
                  ) : (
                    <ShoppingCart size={28} />
                  )}
                </Link>

                <div className="cart-item-details">
                  <Link
                    className="cart-item-name"
                    href={
                      item.slug
                        ? `/home/machines/${item.slug}`
                        : "/home/machines"
                    }
                  >
                    {item.name}
                  </Link>
                  {item.sku && <p className="cart-item-sku">SKU {item.sku}</p>}
                  <p className="cart-item-price">₹{formatPrice(item.price)}</p>
                  <div className="cart-item-controls">
                    <div className="cart-quantity">
                      <button
                        type="button"
                        aria-label={`Decrease ${item.name} quantity`}
                        onClick={() =>
                          updateCart(() =>
                            setCartItemQuantity(item.id, item.quantity - 1),
                          )
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span>{item.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase ${item.name} quantity`}
                        onClick={() =>
                          updateCart(() =>
                            setCartItemQuantity(item.id, item.quantity + 1),
                          )
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() =>
                        updateCart(() => removeFromCart(item.id))
                      }
                    >
                      <Trash2 size={15} /> Remove
                    </button>
                  </div>
                </div>

                <p className="cart-item-subtotal">
                  ₹{formatPrice(item.price * item.quantity)}
                </p>
              </article>
            ))}
          </div>

          <section className="cart-summary">
            <p>
              <span>Estimated total</span>
              <strong>₹{formatPrice(total)}</strong>
            </p>
            <small>Final pricing and availability will be confirmed by our team.</small>
            <div className="cart-summary-actions">
              <button
                type="button"
                className="cart-order"
                onClick={handleOrderNow}
              >
                <FaWhatsapp size={19} />
                Order Now via WhatsApp
              </button>
              <Link href="/home/machines" className="cart-browse">
                Continue browsing
              </Link>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
