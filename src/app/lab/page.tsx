"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import ParticlesCanvas from "../components/ParticlesCanvas";

export default function LabPage() {
    const [activeTab, setActiveTab] = useState("crypto");
    const demos = [
        {
            id: "crypto",
            title: "Prédiction Crypto",
            icon: "📈",
            description: "Modèle LSTM pour la prédiction des prix des cryptomonnaies basé sur l'historique Binance.",
            iframeUrl: "https://berthoni-crypto-prediction.streamlit.app/?embed=true", // Placeholder URL
        },
        {
            id: "iot",
            title: "Détection d'Anomalies IoT",
            icon: "🌡️",
            description: "Modèle Random Forest détectant les anomalies de température sur les capteurs industriels AWS IoT.",
            iframeUrl: "https://berthoni-iot-anomaly.streamlit.app/?embed=true", // Placeholder URL
        }
    ];

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

                                {/* Uncomment below to embed real Streamlit app */}
                                {/* <iframe 
                                    src={activeDemo?.iframeUrl} 
                                    style={{ width: "100%", height: "100%", border: "none", position: "relative", zIndex: 2 }}
                                    title={activeDemo?.title}
                                /> */}
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
