"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Activity, Building2, Eye, EyeOff, ShieldCheck } from "lucide-react";

const workspaces = [
  {
    id: "gym",
    label: "Gym Admin",
    description: "Gym operations",
    Icon: Building2,
  },
  {
    id: "platform",
    label: "Super Admin",
    description: "Platform operations",
    Icon: ShieldCheck,
  },
];

export default function LoginPage() {
  const [portal, setPortal] = useState("gym");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  return (
    <main className="login-grid">
      <section className="login-content">
        <div className="brand login-brand">
          <span className="brand-mark">
            <Activity size={20} />
          </span>
          GymSaas
        </div>
        <div className="login-form">
          <h1>Sign in to GymSaas</h1>
          <p className="login-intro">Select the workspace you want to open.</p>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              router.push("/" + portal);
            }}
          >
            <fieldset className="role-picker">
              <legend>Workspace</legend>
              {workspaces.map(({ id, label, description, Icon }) => (
                <label className="role-option" key={id}>
                  <input
                    type="radio"
                    name="portal"
                    checked={id === portal}
                    onChange={() => setPortal(id)}
                  />
                  <Icon size={18} aria-hidden="true" />
                  <span>
                    <strong>{label}</strong>
                    <small>{description}</small>
                  </span>
                </label>
              ))}
            </fieldset>
            <label className="login-field" htmlFor="email">
              <span>Email address</span>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="off"
                required
              />
            </label>
            <div className="login-field">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter a demo password"
                  autoComplete="off"
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button className="button primary login-submit" type="submit">
              Open workspace
            </button>
          </form>
          <p className="demo-note">
            Demo access. Use a sample email and password.
          </p>
        </div>
      </section>
      <aside className="login-art" aria-hidden="true">
        <div className="login-caption">
          <p>GymSaas for gyms</p>
          <strong>
            Focus on the floor.
            <br />
            Run the business here.
          </strong>
        </div>
      </aside>
    </main>
  );
}
