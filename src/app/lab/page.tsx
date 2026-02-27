"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ParticlesCanvas from "../components/ParticlesCanvas";

type LabDemo = {
    id: string; // project.id
    title: string;
    icon: string;
    description: string;
    iframeUrl: string;
};

export default function LabPage() {
    const [activeTab, setActiveTab] = useState<string>("");
    const [demos, setDemos] = useState<LabDemo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("http://localhost:8000/api/projects/")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    // Filtrage des projets : "ML Lab" ou "Streamlit" dans les tags et ayant un demo_url
                    const labProjects = data.filter(p => {
                        const hasTag = p.tags && (p.tags.toLowerCase().includes("ml lab") || p.tags.toLowerCase().includes("streamlit"));
                        return hasTag && p.demo_url;
                    }).map((p, idx) => ({
                        id: `project-${p.id}`,
                        title: p.title,
                        // Pseudo icon mapping simple par index :
                        icon: ["🤖", "📈", "⚙️", "🧪", "🔍"][idx % 5],
                        description: p.description,
                        iframeUrl: p.demo_url
                    }));

                    setDemos(labProjects);
                    if (labProjects.length > 0) {
                        setActiveTab(labProjects[0].id);
                    }
                }
            })
            .catch(err => console.error("Erreur chargement ML Lab", err))
            .finally(() => setLoading(false));
    }, []);

    const activeDemo = demos.find(d => d.id === activeTab);

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />
            <section style={{ position: "relative", paddingTop: "120px", paddingBottom: "100px" }}>
                <ParticlesCanvas />
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>

                    <div style={{ textAlign: "center", marginBottom: "60px" }}>
                        <div className="section-badge">✦ Innovation</div>
                        <h1 style={{ marginBottom: "20px" }}>ML <span className="gradient-text">Lab</span></h1>
                        <p style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}>
                            Espace expérimental hébergeant mes modèles de Machine Learning.
                            Interagissez en temps réel avec les solutions déployées via Streamlit.
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                        {loading ? (
                            <div style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
                                <div className="dot-typing" style={{ margin: "0 auto 20px" }}></div>
                                <p>Recherche d'expériences en cours dans le Lab...</p>
                            </div>
                        ) : demos.length === 0 ? (
                            <div className="glass-card" style={{ textAlign: "center", padding: "80px 24px", borderRadius: "24px" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "16px" }}>🧪</div>
                                <h3 style={{ color: "var(--text-primary)", marginBottom: "12px", fontSize: "1.5rem" }}>Le Lab est en préparation</h3>
                                <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto" }}>
                                    Les modèles interactifs de Machine Learning sont actuellement en cours d'entraînement et de déploiement.
                                    Revenez bientôt pour tester les nouvelles applications.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Tabs */}
                                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                                    {demos.map(demo => (
                                        <button
                                            key={demo.id}
                                            onClick={() => setActiveTab(demo.id)}
                                            style={{
                                                padding: "12px 24px",
                                                borderRadius: "12px",
                                                background: activeTab === demo.id ? "rgba(79, 142, 247, 0.1)" : "rgba(255, 255, 255, 0.02)",
                                                border: activeTab === demo.id ? "1px solid var(--accent-blue)" : "1px solid var(--border)",
                                                color: activeTab === demo.id ? "white" : "var(--text-secondary)",
                                                cursor: "pointer",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                fontWeight: "600",
                                                transition: "all 0.3s ease"
                                            }}
                                        >
                                            <span>{demo.icon}</span>
                                            {demo.title}
                                        </button>
                                    ))}
                                </div>

                                {/* Demo Viewer */}
                                <div className="glass-card" style={{ padding: "0", overflow: "hidden", border: "1px solid var(--border)", borderRadius: "24px" }}>
                                    <div style={{ padding: "24px", borderBottom: "1px solid var(--border)", background: "rgba(0,0,0,0.2)" }}>
                                        <h3 style={{ marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
                                            {activeDemo?.icon} {activeDemo?.title}
                                        </h3>
                                        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
                                            {activeDemo?.description}
                                        </p>
                                    </div>

                                    <div style={{ height: "600px", width: "100%", background: "#0e1117", position: "relative" }}>
                                        {/* Fake Streamlit Loader if iframe isn't ready */}
                                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", color: "var(--text-muted)" }}>
                                            <div className="dot-typing" style={{ margin: "0 auto 20px" }}></div>
                                            <p>Chargement du modèle dynamique sur serveurs AWS...</p>
                                            <p style={{ fontSize: "0.8rem", marginTop: "10px" }}>(URL : {activeDemo?.iframeUrl})</p>
                                        </div>

                                        {/* Composant iFrame pour Streamlit */}
                                        <iframe
                                            src={activeDemo?.iframeUrl}
                                            style={{ width: "100%", height: "100%", border: "none", position: "relative", zIndex: 2 }}
                                            title={activeDemo?.title}
                                            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                                        />
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                </div>
            </section>
        </div>
    );
}
