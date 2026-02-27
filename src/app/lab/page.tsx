"use client";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ParticlesCanvas from "../components/ParticlesCanvas";
import EmotionDetector from "../components/EmotionDetector";

type LabDemo = {
    id: string; // project.id
    title: string;
    icon: string;
    description: string;
    iframeUrl: string | null; // null = composant natif
};

export default function LabPage() {
    const [activeTab, setActiveTab] = useState<string>("emotion"); // Onglet émotion actif par défaut
    const [demos, setDemos] = useState<LabDemo[]>([]);
    const [loading, setLoading] = useState(true);

    // Démo native hardcodée — ne dépend pas de la DB
    const NATIVE_DEMOS: LabDemo[] = [
        {
            id: "emotion",
            title: "Détection d'émotion",
            icon: "😊",
            description: "Analyse en temps réel de vos émotions via webcam",
            iframeUrl: null
        }
    ];

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/projects/`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const labProjects = data.filter(p => {
                        const hasTag = p.tags && (p.tags.toLowerCase().includes("ml lab") || p.tags.toLowerCase().includes("streamlit"));
                        return hasTag && p.demo_url;
                    }).map((p, idx) => ({
                        id: `project-${p.id}`,
                        title: p.title,
                        icon: ["🤖", "📈", "⚙️", "🧪", "🔍"][idx % 5],
                        description: p.description,
                        iframeUrl: p.demo_url
                    }));
                    setDemos(labProjects);
                }
            })
            .catch(err => console.error("Erreur chargement ML Lab", err))
            .finally(() => setLoading(false));
    }, []);

    // Tous les onglets = démos natives + démos dynamiques depuis la DB
    const allDemos = [...NATIVE_DEMOS, ...demos];
    const activeDemo = allDemos.find(d => d.id === activeTab);

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
                                <p>Recherche d&apos;expériences en cours dans le Lab...</p>
                            </div>
                        ) : (
                            <>
                                {/* Tabs — natifs + dynamiques */}
                                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                                    {allDemos.map(demo => (
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

                                    <div style={{ padding: activeDemo?.iframeUrl ? "0" : "32px", background: activeDemo?.iframeUrl ? "#0e1117" : "transparent", minHeight: "480px", position: "relative" }}>
                                        {activeDemo?.iframeUrl ? (
                                            <>
                                                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", color: "var(--text-muted)" }}>
                                                    <div className="dot-typing" style={{ margin: "0 auto 20px" }}></div>
                                                    <p>Chargement du modèle dynamique sur serveurs AWS...</p>
                                                </div>
                                                <iframe
                                                    src={activeDemo.iframeUrl}
                                                    style={{ width: "100%", height: "600px", border: "none", position: "relative", zIndex: 2 }}
                                                    title={activeDemo.title}
                                                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
                                                />
                                            </>
                                        ) : activeTab === "emotion" ? (
                                            <EmotionDetector />
                                        ) : null}
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
