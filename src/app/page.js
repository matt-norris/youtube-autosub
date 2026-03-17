"use client";

import { useSession } from "next-auth/react";
import SignIn from "@/components/SignIn";
import Dashboard from "@/components/Dashboard";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="signin-page">
        <div className="loading-state">
          <div className="spinner" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return <SignIn />;
  }

  return <Dashboard />;
}
