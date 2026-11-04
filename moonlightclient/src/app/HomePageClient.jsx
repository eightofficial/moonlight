"use client";

import { useEffect, useState } from "react";
import CookiesConsent from "@/component/privacy/cookiesConsont/CookiesConsont";

export default function HomePageClient() {
  const [csrfToken, setCsrfToken] = useState(null);
  const [formRenderedAt, setFormRenderedAt] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/home/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ page: window.location.pathname }),
    });
  }, []);

  useEffect(() => {
    fetch("/api/getway/session/init")
      .then((res) => res.json())
      .then((data) => {
        setCsrfToken(data.csrfToken);
        setFormRenderedAt(data.formRenderedAt);
      })
      .catch(() =>
        setError("Could not start a secure session. Please refresh the page."),
      );
  }, []);

  return (
    <CookiesConsent
      csrfToken={csrfToken}
      formRenderedAt={formRenderedAt}
      error={error}
    />
  );
}
