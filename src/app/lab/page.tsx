"use client";
import Navbar from "../components/Navbar";
import ParticlesCanvas from "../components/ParticlesCanvas";

export default function LabPage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />
            <section style={{ position: "relative", paddingTop: "120px", paddingBottom: "100px" }}>
                <ParticlesCanvas />
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1, textAlign: "center" }}>
                    <div className="section-badge">✦ Innovation</div>
                    <h1 style={{ marginBottom: "20px" }}>ML <span className="gradient-text">Lab</span></h1>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "60px", maxWidth: "600px", margin: "0 auto 60px" }}>
                        Espace expérimental pour tester mes modèles de Machine Learning en temps réel.
                        Cette section intégrera des démos Streamlit et des interfaces interactives.
                    </p>

                    <div style={{ padding: "80px", border: "2px dashed var(--border)", borderRadius: "24px" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🔬</div>
                        <h3 style={{ marginBottom: "12px" }}>Phase 4 en préparation</h3>
                        <p style={{ color: "var(--text-muted)" }}>
                            Les démonstrations de modèles (Crypto Prediction, IoT Intelligence) seront déployées ici à la fin du projet.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
