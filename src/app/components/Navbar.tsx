"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/projets", label: "Projets" },
    { href: "/lab", label: "Lab ML" },
    { href: "/a-propos", label: "À Propos" },
    { href: "/contact", label: "Contact" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <nav
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                zIndex: 100,
                padding: "0 32px",
                height: "64px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
                background: scrolled
                    ? "rgba(10,10,15,0.85)"
                    : "transparent",
                backdropFilter: scrolled ? "blur(16px)" : "none",
                borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
        >
            {/* Logo */}
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                    style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "10px",
                        background: "linear-gradient(135deg, #4f8ef7, #8b5cf6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "800",
                        fontSize: "1rem",
                        color: "white",
                    }}
                >
                    BP
                </div>
                <span style={{ fontWeight: "700", fontSize: "1rem", color: "var(--text-primary)" }}>
                    Berthoni Passo
                </span>
            </Link>

            {/* Desktop Links */}
            <div
                style={{
                    display: "flex",
                    gap: "4px",
                    alignItems: "center",
                }}
                className="desktop-nav"
            >
                {pathname.startsWith("/admin") ? (
                    <>
                        <Link
                            href="/admin/dashboard"
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                color: pathname === "/admin/dashboard" ? "var(--accent-blue)" : "var(--text-secondary)",
                                background: pathname === "/admin/dashboard" ? "rgba(79,142,247,0.12)" : "transparent",
                                textDecoration: "none",
                            }}
                        >
                            📊 Dashboard
                        </Link>
                        <Link
                            href="/admin/projects"
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                color: pathname === "/admin/projects" ? "var(--accent-blue)" : "var(--text-secondary)",
                                background: pathname === "/admin/projects" ? "rgba(79,142,247,0.12)" : "transparent",
                                textDecoration: "none",
                            }}
                        >
                            📁 Projets
                        </Link>
                        <Link
                            href="/admin/comments"
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                color: pathname === "/admin/comments" ? "var(--accent-blue)" : "var(--text-secondary)",
                                background: pathname === "/admin/comments" ? "rgba(79,142,247,0.12)" : "transparent",
                                textDecoration: "none",
                            }}
                        >
                            💬 Commentaires
                        </Link>
                        <Link
                            href="/admin/analytics"
                            style={{
                                padding: "8px 16px",
                                borderRadius: "8px",
                                fontSize: "0.9rem",
                                fontWeight: "600",
                                color: pathname === "/admin/analytics" ? "var(--accent-blue)" : "var(--text-secondary)",
                                background: pathname === "/admin/analytics" ? "rgba(79,142,247,0.12)" : "transparent",
                                textDecoration: "none",
                            }}
                        >
                            📈 Stats
                        </Link>
                    </>
                ) : (
                    navLinks.map((link) => {
                        const isActive = link.href === "/"
                            ? pathname === "/"
                            : pathname === link.href || pathname.startsWith(link.href + "/");
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                style={{
                                    padding: "8px 16px",
                                    borderRadius: "8px",
                                    fontSize: "0.9rem",
                                    fontWeight: isActive ? "600" : "500",
                                    color: isActive ? "var(--accent-blue)" : "var(--text-secondary)",
                                    background: isActive ? "rgba(79,142,247,0.12)" : "transparent",
                                    transition: "all 0.2s ease",
                                    textDecoration: "none",
                                }}
                            >
                                {link.label}
                            </Link>
                        );
                    })
                )}
                {!pathname.startsWith("/admin") && (
                    <Link
                        href="/contact"
                        style={{
                            marginLeft: "12px",
                            padding: "8px 20px",
                            borderRadius: "8px",
                            background: "linear-gradient(135deg, #4f8ef7, #8b5cf6)",
                            color: "white",
                            fontWeight: "600",
                            fontSize: "0.875rem",
                            textDecoration: "none",
                        }}
                    >
                        Me Contacter
                    </Link>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button
                onClick={() => setMenuOpen(!menuOpen)}
                style={{
                    display: "none",
                    background: "none",
                    border: "none",
                    color: "var(--text-primary)",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                }}
                className="mobile-menu-btn"
            >
                {menuOpen ? "✕" : "☰"}
            </button>

            {/* Mobile Menu */}
            {menuOpen && (
                <div
                    style={{
                        position: "absolute",
                        top: "64px",
                        left: 0,
                        right: 0,
                        background: "rgba(10,10,15,0.97)",
                        backdropFilter: "blur(20px)",
                        borderBottom: "1px solid var(--border)",
                        padding: "16px 32px 24px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                    }}
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setMenuOpen(false)}
                            style={{
                                padding: "12px 16px",
                                borderRadius: "8px",
                                color: pathname === link.href ? "var(--accent-blue)" : "var(--text-secondary)",
                                background: pathname === link.href ? "rgba(79,142,247,0.1)" : "transparent",
                                fontWeight: "500",
                            }}
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            )}

            <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
        </nav>
    );
}
