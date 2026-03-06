"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

export default function AdminDashboard() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            // Non authentifié -> Retour au login
            router.push("/admin");
        } else {
            setIsAuthenticated(true);
        }
    }, [router]);

    const handleLogout = () => {
        console.log("Logout triggered");
        localStorage.removeItem("admin_token");
        sessionStorage.clear(); // Nettoyage supplémentaire
        // Forcer un rechargement complet vers la racine admin
        window.location.replace("/admin");
    };

    if (!isAuthenticated) return null; // Prévention flash de contenu

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />

            <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "120px 24px 60px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", borderBottom: "1px solid var(--border)", paddingBottom: "20px" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Dashboard <span className="gradient-text">Administrateur</span></h1>
                            <span style={{ fontSize: "0.7rem", background: "rgba(255,255,255,0.1)", padding: "2px 8px", borderRadius: "4px", color: "var(--text-muted)" }}>v2.0.1</span>
                        </div>
                        <p style={{ color: "var(--text-muted)" }}>Gérez vos projets, analysez votre trafic et administrez la base Oracle 23ai.</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn-secondary"
                        style={{
                            borderColor: "#ef4444",
                            color: "#ef4444",
                            fontWeight: "600",
                            transition: "all 0.2s ease",
                            cursor: "pointer",
                            zIndex: 1000 // Force le clic au-dessus de tout
                        }}
                    >
                        🏃 Déconnexion
                    </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                    {/* Widget 1 : Gestion des Projets */}
                    <div className="glass-card fade-in-up" style={{ padding: "32px", borderTop: "3px solid var(--accent-blue)" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>📁</div>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "12px" }}>Base de Projets</h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px", lineHeight: "1.5" }}>
                            Ajoutez, modifiez ou supprimez les projets de votre portfolio. Gère l'upload vers S3.
                        </p>
                        <Link href="/admin/projects" style={{ textDecoration: "none" }}>
                            <button className="btn-primary" style={{ width: "100%", padding: "12px", fontSize: "0.9rem" }}>
                                Gérer les Projets
                            </button>
                        </Link>
                    </div>

                    {/* Widget : Modération des Commentaires */}
                    <div className="glass-card fade-in-up" style={{ padding: "32px", borderTop: "3px solid var(--accent-orange)", animationDelay: "0.05s" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>💬</div>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "12px" }}>Commentaires</h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px", lineHeight: "1.5" }}>
                            Lisez et modérez les retours des visiteurs. Supprimez les messages indésirables.
                        </p>
                        <Link href="/admin/comments" style={{ textDecoration: "none" }}>
                            <button className="btn-secondary" style={{ width: "100%", padding: "12px", fontSize: "0.9rem" }}>
                                Modérer les commentaires
                            </button>
                        </Link>
                    </div>

                    {/* Widget 2 : Modèle IA & RAG */}
                    <div className="glass-card fade-in-up" style={{ padding: "32px", borderTop: "3px solid var(--accent-purple)", animationDelay: "0.1s" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>🤖</div>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "12px" }}>Base de Connaissance IA</h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px", lineHeight: "1.5" }}>
                            Alimentez le Chatbot (Système RAG) avec de nouveaux documents, compétences ou textes.
                        </p>
                        <button
                            className="btn-secondary"
                            style={{ width: "100%", padding: "12px", fontSize: "0.9rem" }}
                            onClick={() => alert("Pour des raisons de coûts API AWS Bedrock, l'entraînement s'effectue directement via le script sécurisé backend/data/seed_rag.py exécuté par l'administrateur système.")}
                        >
                            Entraîner le Modèle
                        </button>
                    </div>

                    {/* Widget 3 : Analytics */}
                    <div className="glass-card fade-in-up" style={{ padding: "32px", borderTop: "3px solid var(--accent-cyan)", animationDelay: "0.2s" }}>
                        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>📈</div>
                        <h2 style={{ fontSize: "1.2rem", marginBottom: "12px" }}>Interactions & Stats</h2>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "24px", lineHeight: "1.5" }}>
                            Visualisez les visites, les téléchargements de CV et la popularité des projets.
                        </p>
                        <Link href="/admin/analytics" style={{ textDecoration: "none" }}>
                            <button className="btn-secondary" style={{ width: "100%", padding: "12px", fontSize: "0.9rem" }}>
                                Afficher les KPI
                            </button>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
