"use client";
import { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";

export default function GoogleProvider({ children }) {
  const [isMounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  return (
    <GoogleOAuthProvider
      clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
      onScriptLoadError={(error) =>
        console.error("Failed to load Google OAuth script:", error)
      }
      onScriptLoadSuccess={() => console.log("Google OAuth script loaded")}
    >
      {isMounted && children}
    </GoogleOAuthProvider>
  );
}
