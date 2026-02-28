"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ParticlesCanvas from "../components/ParticlesCanvas";

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            // Requête form-urlencoded requise par OAuth2 de FastAPI
            const formData = new URLSearchParams();
            formData.append("username", email);
            formData.append("password", password);

            const res = await fetch(`/api/auth/token`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: formData.toString(),
            });

            if (res.ok) {
                const data = await res.json();
                localStorage.setItem("admin_token", data.access_token);
                // Redirection vers le dashboard après connexion
                router.push("/admin/dashboard");
            } else {
                const errData = await res.json();
                setError(errData.detail || "Identifiants incorrects ou serveur injoignable.");
            }
        } catch (err) {
            console.error(err);
            setError("Impossible de contacter le serveur d'authentification.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)", position: "relative" }}>
            <ParticlesCanvas />

            <Link href="/" style={{ position: "absolute", top: "40px", left: "40px", color: "var(--text-muted)", textDecoration: "none", fontSize: "0.9rem" }}>
                ← Retour au portail
            </Link>

            <div className="glass-card fade-in-up" style={{ padding: "48px", width: "100%", maxWidth: "450px", position: "relative", zIndex: 1, borderTop: "4px solid var(--accent-blue)" }}>
                <div style={{ textAlign: "center", marginBottom: "40px" }}>
                    <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🔐</div>
                    <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>Espace Administrateur</h1>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Accédez au système pour gérer vos données (FastAPI + Oracle).</p>
                </div>

                {error && (
                    <div style={{ background: "rgba(220, 38, 38, 0.1)", border: "1px solid rgba(220, 38, 38, 0.3)", color: "#ef4444", padding: "16px", borderRadius: "12px", marginBottom: "24px", fontSize: "0.9rem", textAlign: "center" }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Email Administrateur</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: "100%", padding: "16px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)",
                                borderRadius: "12px", color: "white", outline: "none", fontSize: "1rem"
                            }}
                            placeholder="admin@berthoni.com"
                        />
                    </div>

                    <div>
                        <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Mot de passe</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: "100%", padding: "16px", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border)",
                                borderRadius: "12px", color: "white", outline: "none", fontSize: "1rem"
                            }}
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            background: "linear-gradient(135deg, #4f8ef7, #8b5cf6)",
                            color: "white",
                            padding: "16px",
                            borderRadius: "12px",
                            border: "none",
                            fontWeight: "600",
                            fontSize: "1.1rem",
                            cursor: isLoading ? "not-allowed" : "pointer",
                            opacity: isLoading ? 0.7 : 1,
                            marginTop: "8px",
                            transition: "all 0.3s ease",
                            boxShadow: "0 10px 25px rgba(79, 142, 247, 0.3)"
                        }}
                    >
                        {isLoading ? "Authentification..." : "Connexion Sécurisée"}
                    </button>

                    <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "16px" }}>
                        Session protégée par JWT Bearer Token.
                    </p>
                </form>
            </div>
        </div>
    );
}
