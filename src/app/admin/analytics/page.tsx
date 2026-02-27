"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

interface AnalyticsData {
    global: {
        page_view?: number;
        cv_download?: number;
        home_view?: number;
        lab_view?: number;
        project_view?: number;
    };
    unique_visitors: number;
    projects_views: Record<string, number>;
}

export default function AdminAnalytics() {
    const router = useRouter();
    const [stats, setStats] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin");
            return;
        }

        const fetchStats = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/analytics/summary`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (err) {
                console.error("Erreur Analytics :", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [router]);

    if (loading || !stats) return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
                <p style={{ color: "var(--text-muted)" }}>Chargement des statistiques tactiques...</p>
            </div>
        </div>
    );

    const totalViews = (stats.global.home_view || 0) + (stats.global.lab_view || 0) + (stats.global.project_view || 0);

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />
            <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "120px 24px 60px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" }}>
                    <div>
                        <Link href="/admin/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none", display: "inline-block", marginBottom: "16px", fontSize: "0.95rem" }}>
                            ← Retour au Dashboard
                        </Link>
                        <h1 style={{ fontSize: "2.5rem", fontWeight: "800" }}>Analytics & Trafic</h1>
                    </div>
                    <button onClick={() => window.location.reload()} className="btn-secondary" style={{ padding: "8px 16px" }}>
                        🔄 Rafraîchir
                    </button>
                </div>

                {/* KPIs Principaux */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "24px", marginBottom: "48px" }}>
                    <div className="glass-card" style={{ padding: "32px", textAlign: "center", borderTop: "3px solid var(--accent-blue)" }}>
                        <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "16px" }}>Visiteurs Uniques (estimés)</h3>
                        <p style={{ fontSize: "3.5rem", fontWeight: "800", color: "var(--text-primary)", background: "var(--accent-gradient)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                            {stats.unique_visitors}
                        </p>
                    </div>
                    <div className="glass-card" style={{ padding: "32px", textAlign: "center", borderTop: "3px solid var(--accent-cyan)" }}>
                        <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "16px" }}>Pages Vues (Total)</h3>
                        <p style={{ fontSize: "3.5rem", fontWeight: "800", color: "white" }}>
                            {totalViews}
                        </p>
                    </div>
                    <div className="glass-card" style={{ padding: "32px", textAlign: "center", borderTop: "3px solid var(--accent-purple)" }}>
                        <h3 style={{ fontSize: "1rem", color: "var(--text-secondary)", marginBottom: "16px" }}>CV Téléchargés</h3>
                        <p style={{ fontSize: "3.5rem", fontWeight: "800", color: "white" }}>
                            {stats.global.cv_download || 0}
                        </p>
                    </div>
                </div>

                {/* Répartition par pages */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "start" }}>
                    <div className="glass-card" style={{ padding: "32px" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "32px" }}>Trafic par section</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            <StatBar label="Accueil (Hero)" count={stats.global.home_view || 0} max={totalViews || 1} color="var(--accent-blue)" />
                            <StatBar label="Labo Machine Learning" count={stats.global.lab_view || 0} max={totalViews || 1} color="var(--accent-cyan)" />
                            <StatBar label="Détail Projets" count={stats.global.project_view || 0} max={totalViews || 1} color="var(--accent-purple)" />
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: "32px" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "32px" }}>Popularité des Projets (Vues)</h2>
                        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                            {Object.entries(stats.projects_views).length === 0 ? (
                                <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Aucun projet consulté récemment.</p>
                            ) : (
                                Object.entries(stats.projects_views)
                                    .sort(([, a], [, b]) => b - a)
                                    .map(([projectId, count]) => (
                                        <StatBar
                                            key={projectId}
                                            label={`Projet ID n°${projectId.replace('project_', '')}`}
                                            count={count}
                                            max={Math.max(...Object.values(stats.projects_views), 1)}
                                            color="#f59e0b"
                                        />
                                    ))
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

function StatBar({ label, count, max, color }: { label: string, count: number, max: number, color: string }) {
    const percentage = Math.min(100, Math.max(2, (count / max) * 100)); // Min 2% for visibility
    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>{label}</span>
                <span style={{ fontWeight: "bold", color: "var(--text-primary)" }}>{count}</span>
            </div>
            <div style={{ width: "100%", height: "12px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{
                    width: `${percentage}%`,
                    height: "100%",
                    background: color,
                    borderRadius: "6px",
                    boxShadow: `0 0 10px ${color}88`,
                    transition: "width 1s ease-out"
                }} />
            </div>
        </div>
    );
}
