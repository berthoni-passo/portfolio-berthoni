"use client";
import Navbar from "../components/Navbar";
import ParticlesCanvas from "../components/ParticlesCanvas";

export default function ProjectsPage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />
            <section style={{ position: "relative", paddingTop: "120px", paddingBottom: "100px" }}>
                <ParticlesCanvas />
                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1, textAlign: "center" }}>
                    <div className="section-badge">✦ Portfolio</div>
                    <h1 style={{ marginBottom: "20px" }}>Mes <span className="gradient-text">Projets</span></h1>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "60px", maxWidth: "600px", margin: "0 auto 60px" }}>
                        Découvrez mes réalisations en Data Engineering, Machine Learning et IoT.
                        Chaque projet est le fruit d'une recherche de performance et d'innovation.
                    </p>

                    <div style={{ padding: "80px", border: "2px dashed var(--border)", borderRadius: "24px" }}>
                        <div style={{ fontSize: "3rem", marginBottom: "20px" }}>🏗️</div>
                        <h3 style={{ marginBottom: "12px" }}>Phase 2 en préparation</h3>
                        <p style={{ color: "var(--text-muted)" }}>
                            La base de données Oracle 23ai sera bientôt connectée pour afficher dynamiquement les projets et leurs métriques.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}
