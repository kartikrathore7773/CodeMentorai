"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  User,
  ChevronDown,
  Menu,
  X,
  BookOpen,
  Code2,
  Users,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/useAuth";
import api from "@/lib/api";

/* ---------------- NAVBAR ---------------- */

export default function AppNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { user, loading } = useAuth();
  const role = user?.role;

  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setAccountOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      <header className={`header-bar nav-root ${scrolled ? "scrolled" : ""}`}>
        <nav
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "14px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* LOGO */}
          <Link href="/" style={{ textDecoration: "none" }}>
            <span
              className="nav-logo"
              style={{ fontSize: "1.5rem", color: "#111827" }}
            >
              CodeMentor AI<span style={{ color: "#6366f1" }}>.</span>
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div
            style={{
              display: "none",
              gap: "32px",
              alignItems: "center",
            }}
            className="desktop-menu"
          >
            <ClickDropdown
              label="Learn"
              icon={<BookOpen size={15} />}
              items={[
                { label: "Blogs & Guides", href: "/blogs" },
                { label: "Study Materials", href: "/courses" },
              ]}
            />
            <ClickDropdown
              label="Build"
              icon={<Code2 size={15} />}
              items={[
                { label: "Development Services", href: "/services" },
                { label: "My Work", href: "/work" },
                { label: "Hackathons", href: "/hackathons" },
              ]}
            />
            <ClickDropdown
              label="Mentorship"
              icon={<Users size={15} />}
              items={[
                {
                  label: "1-to-1 Guidance",
                  href: "https://topmate.io/kartik_singh29/",
                },
                { label: "Career Programs", href: "/programs" },
                { label: "Membership Plans", href: "/premium" },
              ]}
            />
            <Link
              href="/contact"
              className="nav-link"
              style={{ textDecoration: "none" }}
            >
              Contact
            </Link>
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{ display: "none", alignItems: "center", gap: "12px" }}
            className="desktop-right"
          >
            {!user && !loading ? (
              <>
                <Link href="/auth/login" style={{ textDecoration: "none" }}>
                  <button className="btn-login cursor-pointer">Login</button>
                </Link>
                <Link href="/auth/signup" style={{ textDecoration: "none" }}>
                  <button className="btn-cta cursor-pointer">
                    <Sparkles size={14} />
                    Get Started
                  </button>
                </Link>
              </>
            ) : (
              <div ref={accountRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setAccountOpen((p) => !p)}
                  className="user-btn"
                >
                  <div className="user-avatar">
                    <User size={14} />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>
                      {user?.name || user?.email || "Account"}
                    </div>
                    {user?.email && (
                      <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                        {user.email}
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`chevron-icon ${accountOpen ? "open" : ""}`}
                    style={{ color: "#9ca3af" }}
                  />
                </button>

                {accountOpen && (
                  <div
                    className="dropdown-panel"
                    style={{
                      position: "absolute",
                      right: 0,
                      marginTop: "10px",
                      minWidth: "180px",
                    }}
                  >
                    <NavItem
                      href={user?.role === "admin" ? "/admin" : "/dashboard"}
                    >
                      Dashboard
                    </NavItem>
                    <NavItem href="/profile">Profile</NavItem>
                    <NavItem href="/contact">Contact</NavItem>
                    <div
                      style={{
                        height: "1px",
                        background: "#f3f4f6",
                        margin: "4px 0",
                      }}
                    />
                    <button
                      onClick={async () => {
                        try {
                          // Clear local storage first
                          localStorage.removeItem("token");
                          localStorage.removeItem("role");

                          // Try to call logout API (don't fail if it doesn't work)
                          try {
                            await api.post("/auth/logout");
                          } catch (apiErr) {
                            console.warn(
                              "Logout API call failed, but proceeding with local logout:",
                              apiErr,
                            );
                          }

                          // Dispatch custom event to notify other components of logout
                          window.dispatchEvent(
                            new CustomEvent("auth-change", {
                              detail: { type: "logout" },
                            }),
                          );

                          // Redirect to login
                          window.location.href = "/auth/login";
                        } catch (err) {
                          console.error("Logout failed", err);
                          // Even if logout fails, redirect to login
                          window.location.href = "/auth/login";
                        }
                      }}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "11px 18px",
                        fontSize: "0.875rem",
                        color: "#ef4444",
                        border: "none",
                        background: "none",
                        cursor: "pointer",
                        borderRadius: "6px",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                      }}
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              border: "1.5px solid #e5e7eb",
              background: "white",
              cursor: "pointer",
              color: "#374151",
            }}
            className="mobile-toggle"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {/* MOBILE MENU */}
        {mobileOpen && (
          <div className="mobile-menu">
            <div style={{ marginBottom: "20px" }}>
              <p className="mobile-section-label">LEARN</p>
              <Link href="/blogs" className="mobile-link">
                <span>📘 Blogs & Guides</span>
                <span style={{ color: "#c7d2fe" }}>›</span>
              </Link>
              <Link href="/courses" className="mobile-link">
                <span>📚 Study Material</span>
                <span style={{ color: "#c7d2fe" }}>›</span>
              </Link>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <p className="mobile-section-label">BUILD</p>
              <Link href="/services" className="mobile-link">
                <span>💻 Tech Services</span>
                <span style={{ color: "#c7d2fe" }}>›</span>
              </Link>
              <Link href="/work" className="mobile-link">
                <span>🧑‍💻 My Work</span>
                <span style={{ color: "#c7d2fe" }}>›</span>
              </Link>
              <Link href="/hackathons" className="mobile-link">
                <span>🚀 Hackathons</span>
                <span style={{ color: "#c7d2fe" }}>›</span>
              </Link>
            </div>

            <div style={{ marginBottom: "4px" }}>
              <p className="mobile-section-label">CAREER</p>
              <Link href="/premium" className="mobile-link">
                <span>⭐ Membership Plan</span>
                <span style={{ color: "#c7d2fe" }}>›</span>
              </Link>
              <Link href="/contact" className="mobile-link">
                <span>📩 Contact</span>
                <span style={{ color: "#c7d2fe" }}>›</span>
              </Link>
            </div>

            <Link href="/premium" className="mobile-cta">
              ✦ Upgrade to Pro
            </Link>
          </div>
        )}
      </header>
    </>
  );
}

/* ---------------- CLICK DROPDOWN ---------------- */

function ClickDropdown({
  label,
  icon,
  items,
}: {
  label: string;
  icon: React.ReactNode;
  items: { label: string; href: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((p) => !p)}
        className="nav-link"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: "4px 0",
          fontFamily: "DM Sans, sans-serif",
        }}
      >
        <span style={{ color: open ? "#6366f1" : "#9ca3af" }}>{icon}</span>
        <span style={{ color: open ? "#4338ca" : undefined }}>{label}</span>
        <ChevronDown
          size={13}
          className={`chevron-icon ${open ? "open" : ""}`}
          style={{ color: "#9ca3af" }}
        />
      </button>

      {open && (
        <div
          className="dropdown-panel"
          style={{
            position: "absolute",
            left: 0,
            marginTop: "10px",
            minWidth: "210px",
          }}
        >
          {items.map((item) => (
            <NavItem key={item.label} href={item.href}>
              {item.label}
            </NavItem>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------------- REUSABLE ---------------- */

function NavItem({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="dropdown-item"
      style={{ textDecoration: "none" }}
    >
      <span className="dot" />
      {children}
    </Link>
  );
}
