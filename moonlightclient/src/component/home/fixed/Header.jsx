"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import "./header.scss";
import {
  FaFacebook,
  FaInstagram,
  FaPhone,
  FaWhatsapp,
  FaYoutube,
  FaChevronDown,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Cloud, ShoppingCart } from "lucide-react";
import { CART_UPDATED_EVENT, getCart } from "@/lib/cart";

const SOCIALS = [
  {
    name: "Instagram",
    url: "https://instagram.com/moonlightmachinery",
    icon: <FaInstagram />,
  },
  {
    name: "YouTube",
    url: "https://youtube.com/@moonlightmachinery6670?si=1W37CtkGFkI7vX7A",
    icon: <FaYoutube />,
  },
  {
    name: "Facebook",
    url: "https://facebook.com/profile.php?id=100068148668790",
    icon: <FaFacebook />,
  },
  {
    name: "WhatsApp",
    url: "https://wa.me/919354327757",
    icon: <FaWhatsapp />,
  },
];

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/home/machines" },
  { label: "Blog", href: "/blog" },
];

const PRODUCT_CATEGORIES = [
  {
    label: "Paper Plate Making Machine",
    slug: "paper-plate-making-machine",
    subCategories: [
      { label: "Full Automatic", slug: "full-automatic" },
      { label: "Semi Automatic", slug: "semi-automatic" },
      { label: "Hydraulic", slug: "hydraulic" },
      { label: "Manual", slug: "manual" },
    ],
  },
  {
    label: "Paper Plate Lamination Machine",
    slug: "paper-plate-lamination-machine",
    subCategories: [
      { label: "Full Automatic", slug: "full-automatic" },
      { label: "Semi Automatic", slug: "semi-automatic" },
      { label: "Hydraulic", slug: "hydraulic" },
      { label: "Manual", slug: "manual" },
    ],
  },
  {
    label: "Dona Making Machine",
    slug: "dona-making-machine",
    subCategories: [
      { label: "Full Automatic", slug: "full-automatic" },
      { label: "Semi Automatic", slug: "semi-automatic" },
      { label: "Hydraulic", slug: "hydraulic" },
      { label: "Manual", slug: "manual" },
    ],
  },
  {
    label: "Paper Cup Making Machine",
    slug: "paper-cup-making-machine",
    subCategories: [
      { label: "Full Automatic", slug: "full-automatic" },
      { label: "Semi Automatic", slug: "semi-automatic" },
      { label: "Hydraulic", slug: "hydraulic" },
      { label: "Manual", slug: "manual" },
    ],
  },
  {
    label: "Areca Leaf Plate Making Machine",
    slug: "areca-leaf-plate-making-machine",
    subCategories: [
      { label: "Full Automatic", slug: "full-automatic" },
      { label: "Semi Automatic", slug: "semi-automatic" },
      { label: "Hydraulic", slug: "hydraulic" },
      { label: "Manual", slug: "manual" },
    ],
  },
  {
    label: "Disposable Plate Making Machine",
    slug: "disposable-plate-making-machine",
    subCategories: [
      { label: "Full Automatic", slug: "full-automatic" },
      { label: "Semi Automatic", slug: "semi-automatic" },
      { label: "Hydraulic", slug: "hydraulic" },
      { label: "Manual", slug: "manual" },
    ],
  },
  {
    label: "Chappal Making Machine",
    slug: "chappal-making-machine",
    subCategories: [
      { label: "Full Automatic", slug: "full-automatic" },
      { label: "Semi Automatic", slug: "semi-automatic" },
      { label: "Hydraulic", slug: "hydraulic" },
      { label: "Manual", slug: "manual" },
    ],
  },
];

const handelHome = () => {
  window.location.href = "/";
};

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [mobileActivePrimary, setMobileActivePrimary] = useState(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    function updateCartCount() {
      try {
        const cart = getCart();
        setCartCount(
          cart.reduce((total, item) => total + (Number(item.quantity) || 0), 0),
        );
      } catch (error) {
        console.error("Unable to read the saved cart count:", error);
        setCartCount(0);
      }
    }

    updateCartCount();
    window.addEventListener(CART_UPDATED_EVENT, updateCartCount);
    window.addEventListener("storage", updateCartCount);
    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);

  return (
    <motion.header
      className="hd-root"
      initial={{ y: -40, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="hd-topbar">
        {/* <span className="hd-topbar-msg">
          Genuine machine , shipped pan-India
        </span> */}
        <div className="hd-social">
          {SOCIALS.map((s) => (
            <a
              key={s.name}
              className="hd-social-link"
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Moonlight Machinery on ${s.name}`}
            >
              {s.icon}
            </a>
          ))}
          <div className="diwali-wish text-[12px] ">
            <p className="w-full flex items-center gap-3">Chhath Puja Special<Cloud fill="orrange" className="w-6 h-6 text-orange-500 fill-orange-500"/></p>
          </div>
        </div>
      </div>

      <div className="hd-inner cursor-pointer">
        <div className="hd-brand" onClick={(e) => handelHome()}>
          <div className="hd-brand-mark w-12.5 h-12.5 md:w-20 md:h-20">
            <Image
              width={500}
              height={70}
              alt="Moonlight Machinery"
              src="/logo.png"
              priority
              className="hd-brand-logo w-12.5 h-12.5 md:w-20 md:h-20"
            />
          </div>
          <span className="grid leading-tight ">
            <span className="hd-brand-name text-[16px] md:text-[20px]">
              Moonlight Machinery
            </span>
            <span className="hd-brand-tagline  md:block text-[12px] md:text-[14px]">
              Quality Never Compromised
            </span>
          </span>
        </div>

        <div className="hd-links gap-2 md:gap-8">
          <nav className="hd-nav flex items-center gap-6">
            {NAV_LINKS.map((item) => (
              <Link key={item.href} className="hd-nav-link" href={item.href}>
                {item.label}
              </Link>
            ))}

            {/* Product Category Dropdown Menu */}
            <div
              className="relative py-2 cursor-pointer"
              onMouseEnter={() => setIsDropdownOpen(true)}
              onMouseLeave={() => {
                setIsDropdownOpen(false);
                setActiveCategoryIndex(0);
              }}
            >
              <div
                className="hd-nav-link flex items-center gap-1.5 select-none"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>Product Category</span>
                <motion.span
                  animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[10px]"
                >
                  <FaChevronDown />
                </motion.span>
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="absolute top-full right-0 mt-1 w-[700px] bg-white border border-neutral-200 shadow-2xl z-50 rounded-none flex"
                  >
                    {/* Primary Categories Column */}
                    <div className="w-[350px] bg-neutral-50 border-r border-neutral-200 py-3 flex flex-col">
                      {PRODUCT_CATEGORIES.map((category, idx) => (
                        <div
                          key={category.slug}
                          onMouseEnter={() => setActiveCategoryIndex(idx)}
                          className={`px-5 py-3.5 text-sm flex items-center justify-between cursor-pointer transition-colors  ${
                            activeCategoryIndex === idx
                              ? "bg-white text-[var(--accent)] font-bold border-l-4 border-[var(--accent)]"
                              : "text-neutral-800 hover:bg-neutral-100"
                          }`}
                        >
                          <span>{category.label}</span>
                          <span className="text-xs text-neutral-400">›</span>
                        </div>
                      ))}
                    </div>

                    {/* Sub Categories Column */}
                    <div className="w-[350px] bg-white py-3 px-5 flex flex-col justify-start">
                      <div className="text-xs font-bold text-neutral-400 uppercase px-3 pb-2 mb-2 border-b border-neutral-100">
                        {activeCategoryIndex !== null &&
                        PRODUCT_CATEGORIES[activeCategoryIndex]
                          ? PRODUCT_CATEGORIES[activeCategoryIndex].label
                          : "Select Category"}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {activeCategoryIndex !== null &&
                          PRODUCT_CATEGORIES[
                            activeCategoryIndex
                          ]?.subCategories.map((sub) => {
                            const subHref = `/home/machines?query=catagory&Pcatagory=${PRODUCT_CATEGORIES[activeCategoryIndex].slug}&Scatagory=${sub.slug}`;
                            return (
                              <Link
                                key={sub.slug}
                                href={subHref}
                                onClick={() => {
                                  setIsDropdownOpen(false);
                                  setActiveCategoryIndex(0);
                                }}
                                className="px-3 py-3 text-sm text-neutral-700 hover:bg-neutral-100 hover:text-[var(--accent)] transition-colors  rounded"
                              >
                                {sub.label}
                              </Link>
                            );
                          })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          <div className="hd-actions">
            <Link
              className="hd-cart-link"
              href="/home/cart"
              aria-label={`Shopping cart, ${cartCount} ${
                cartCount === 1 ? "item" : "items"
              }`}
              title="View cart"
            >
              <ShoppingCart size={21} />
              {cartCount > 0 && (
                <span className="hd-cart-count" aria-hidden="true">
                  {cartCount > 99 ? "99+" : cartCount}
                </span>
              )}
            </Link>
            <Link className="hd-shop-btn hidden md:inline-block" href="/getway">
              Login
            </Link>
            <a
              className="hd-shop-btn cal hidden md:inline-block"
              href="tel:+919354327757"
            >
              Call
            </a>

            {/* Mobile Menu Hamburger Button */}
            <button
              className="hd-menu-toggle md:hidden p-2 text-[var(--ink)] cursor-pointer"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden bg-[var(--bg)] border-t border-[var(--line-strong)] overflow-hidden px-6 py-6 max-h-[80vh] overflow-y-auto"
          >
            <nav className="flex flex-col gap-4">
              {NAV_LINKS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hd-nav-link text-sm font-bold tracking-wider uppercase py-1 border-b border-neutral-200 pb-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Product Categories Dropdown Section */}
              <div className="border-b border-neutral-200 pb-2">
                <div
                  className="hd-nav-link flex items-center justify-between text-sm font-bold tracking-wider uppercase py-1 cursor-pointer"
                  onClick={() =>
                    setIsMobileCategoriesOpen(!isMobileCategoriesOpen)
                  }
                >
                  <span>Product Category</span>
                  <motion.span
                    animate={{ rotate: isMobileCategoriesOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <FaChevronDown size={12} />
                  </motion.span>
                </div>

                <AnimatePresence>
                  {isMobileCategoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col pl-3 mt-2 gap-3 border-l-2 border-[var(--line-strong)]"
                    >
                      {PRODUCT_CATEGORIES.map((category, idx) => (
                        <div
                          key={category.slug}
                          className="flex flex-col gap-1"
                        >
                          <button
                            type="button"
                            className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider py-2 flex items-center justify-between text-left w-full cursor-pointer"
                            onClick={() =>
                              setMobileActivePrimary(
                                mobileActivePrimary === idx ? null : idx,
                              )
                            }
                          >
                            <span>{category.label}</span>
                            <span className="text-[10px]">
                              {mobileActivePrimary === idx ? "▲" : "▼"}
                            </span>
                          </button>

                          {mobileActivePrimary === idx && (
                            <div className="flex flex-col pl-3 gap-2.5 py-1.5 border-l border-neutral-300">
                              {category.subCategories.map((sub) => {
                                const mobileSubHref = `/home/machines?query=catagory&p-catagory=${category.slug}&s-catagory=${sub.slug}`;
                                return (
                                  <Link
                                    key={sub.slug}
                                    href={mobileSubHref}
                                    className="text-xs text-[var(--ink-dim)] hover:text-[var(--accent)] uppercase tracking-wider py-1.5"
                                    onClick={() => {
                                      setIsMobileCategoriesOpen(false);
                                      setIsMobileMenuOpen(false);
                                    }}
                                  >
                                    • {sub.label}
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex items-center gap-3 pt-4">
                <Link
                  className="hd-shop-btn flex-1 text-center"
                  href="/getway"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <a
                  className="hd-shop-btn cal flex-1 text-center"
                  href="tel:+919354327757"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Call
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
