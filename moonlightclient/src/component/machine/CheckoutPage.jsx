"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { clearCart, getCart } from "@/lib/cart";
import "./style/cart.scss";

function formatPrice(price) {
  return (Number(price) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const EMPTY_FORM = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  address: "",
  city: "",
  state: "",
  postalCode: "",
};

export default function CheckoutPage() {
  const [items, setItems] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");
  const [isDirectCheckout, setIsDirectCheckout] = useState(false);

  const loadCart = useCallback(() => {
    let active = true;
    async function load() {
      try {
        const directSlug = new URLSearchParams(window.location.search).get("product");
        const isDirect = Boolean(directSlug);
        const cart = isDirect
          ? [{ id: directSlug, slug: directSlug, name: "Product", quantity: 1 }]
          : getCart();
        if (active) setIsDirectCheckout(isDirect);
        if (!cart.length) {
          if (active) setItems([]);
          return;
        }

        const params = new URLSearchParams();
        [...new Set(cart.map((item) => item.slug).filter(Boolean))].forEach(
          (slug) => params.append("slug", slug),
        );
        const response = await fetch(`/api/home/checkout?${params.toString()}`);
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result?.message || "Checkout products could not be loaded.");
        }

        const currentProducts = new Map(
          result.items.map((item) => [item.slug, item]),
        );
        const currentCart = cart.map((item) => {
          const currentProduct = currentProducts.get(item.slug);
          return {
            ...item,
            ...currentProduct,
            price: currentProduct.unitPrice,
          };
        });
        if (active) {
          setItems(currentCart);
          setError("");
          if (currentCart.some((item) => item.quantity > item.stock)) {
            setError("Your cart contains a quantity that is no longer in stock. Update it before placing the order.");
          }
        }
      } catch (cartError) {
        console.error("Unable to load checkout products:", cartError);
        if (active) {
          setError(
            cartError.message ||
              "Your cart could not be loaded. Please return to your cart and try again.",
          );
        }
      } finally {
        if (active) setIsReady(true);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const cleanup = loadCart();
    return cleanup;
  }, [loadCart]);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items],
  );
  const canSubmit =
    items.length > 0 &&
    items.every(
      (item) =>
        Number(item.stock) >= Number(item.quantity) && Number(item.stock) > 0,
    );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/home/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, items }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "We could not submit your order.");
      }

      if (!isDirectCheckout) clearCart();
      setItems([]);
      setOrderNumber(result.orderNumber);
    } catch (submitError) {
      console.error("Unable to submit COD order:", submitError);
      setError(submitError.message || "We could not submit your order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isReady) {
    return <main className="cart-page"><p className="cart-empty">Loading checkout...</p></main>;
  }

  if (orderNumber) {
    return (
      <main className="cart-page">
        <section className="cart-empty checkout-success" role="status">
          <h1>Order received</h1>
          <p>Your order number is <strong>{orderNumber}</strong>.</p>
          <p>We will contact you to confirm your Cash on Delivery order and delivery details.</p>
          <Link href="/home/machines" className="cart-browse">Continue browsing</Link>
        </section>
      </main>
    );
  }

  if (!items.length) {
    return (
      <main className="cart-page">
        <div className="cart-heading">
          <div>
            <p className="cart-eyebrow">Cash on Delivery</p>
            <h1>Checkout</h1>
          </div>
        </div>
        <section className="cart-empty">
          {error ? (
            <p className="cart-error" role="alert">{error}</p>
          ) : (
            <>
              <h2>Your cart is empty</h2>
              <p>Add an in-stock machine before continuing to checkout.</p>
            </>
          )}
          <Link href="/home/machines" className="cart-browse">Browse products</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page checkout-page">
      <div className="cart-heading">
        <div>
          <p className="cart-eyebrow">Cash on Delivery</p>
          <h1>Checkout</h1>
          <p>Enter your delivery details to place your order.</p>
        </div>
      </div>

      {error && <p className="cart-error" role="alert">{error}</p>}

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          <h2>Delivery details</h2>
          <label>
            Full name
            <input
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              autoComplete="name"
              maxLength={100}
              required
            />
          </label>
          <label>
            Phone number
            <input
              name="customerPhone"
              type="tel"
              value={form.customerPhone}
              onChange={handleChange}
              autoComplete="tel"
              maxLength={30}
              pattern="\+?[0-9\s()-]{8,30}"
              required
            />
          </label>
          <label>
            Email (optional)
            <input
              name="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={handleChange}
              autoComplete="email"
              maxLength={254}
            />
          </label>
          <label>
            Street address
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              autoComplete="street-address"
              maxLength={300}
              rows={3}
              required
            />
          </label>
          <div className="checkout-form-row">
            <label>
              City
              <input
                name="city"
                value={form.city}
                onChange={handleChange}
                autoComplete="address-level2"
                maxLength={80}
                required
              />
            </label>
            <label>
              State
              <input
                name="state"
                value={form.state}
                onChange={handleChange}
                autoComplete="address-level1"
                maxLength={80}
                required
              />
            </label>
          </div>
          <label>
            PIN code (India)
            <input
              name="postalCode"
              inputMode="numeric"
              autoComplete="postal-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={form.postalCode}
              onChange={handleChange}
              required
            />
          </label>
          <button
            type="submit"
            className="cart-order"
            disabled={isSubmitting || !canSubmit}
          >
            {isSubmitting ? "Submitting order..." : "Place order — Cash on Delivery"}
          </button>
          <Link href="/home/cart" className="checkout-back">Back to cart</Link>
        </form>

        <aside className="checkout-summary">
          <h2>Your order</h2>
          {items.map((item) => (
            <div className="checkout-summary-item" key={item.id}>
              <span>{item.name} × {item.quantity}</span>
              <strong>₹{formatPrice(item.price * item.quantity)}</strong>
            </div>
          ))}
          <div className="checkout-summary-total">
            <span>Total (INR)</span>
            <strong>₹{formatPrice(total)}</strong>
          </div>
          <p>Prices include listed product expenses. Delivery across India is free. Pay in cash when your order is delivered.</p>
        </aside>
      </div>
    </main>
  );
}
