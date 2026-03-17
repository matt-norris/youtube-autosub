"use client";

import { signIn } from "next-auth/react";

export default function SignIn() {
  return (
    <div className="signin-page">
      <div className="signin-bg-glow red" />
      <div className="signin-bg-glow purple" />

      <div className="signin-card">
        <div className="signin-logo">⚡</div>
        <h1>SubSync</h1>
        <p>
          Transfer your YouTube subscriptions in seconds. Import from CSV or
          clone another channel&apos;s subscription list.
        </p>

        <button className="signin-btn" onClick={() => signIn("google")}>
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google"
          />
          Sign in with Google
        </button>

        <div className="signin-features">
          <div className="signin-feature">
            <span className="signin-feature-icon">📋</span>
            <span>Import channels from CSV files</span>
          </div>
          <div className="signin-feature">
            <span className="signin-feature-icon">🔍</span>
            <span>Clone subscriptions from any public channel</span>
          </div>
          <div className="signin-feature">
            <span className="signin-feature-icon">⚡</span>
            <span>One-click auto-subscribe to all channels</span>
          </div>
          <div className="signin-feature">
            <span className="signin-feature-icon">💾</span>
            <span>Export your subs as a backup CSV</span>
          </div>
        </div>
      </div>
    </div>
  );
}
