"use client";
import Navbar from "../components/Navbar";
import ParticlesCanvas from "../components/ParticlesCanvas";

export default function AboutPage() {
    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />

            <section style={{ position: "relative", paddingTop: "120px", paddingBottom: "100px", overflow: "hidden" }}>
                <ParticlesCanvas />

                <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
                    <div className="section-badge">✦ Mon Parcours</div>
                    <h1 style={{ marginBottom: "32px" }}>
                        À propos de <span className="gradient-text">Berthoni Passo</span>
                    </h1>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "48px", alignItems: "start" }}>
                        {/* Bio */}
                        <div style={{ animation: "fadeInUp 0.6s ease forwards" }}>
                            <p style={{ fontSize: "1.1rem", marginBottom: "24px", color: "var(--text-primary)" }}>
                                Je suis un développeur passionné par l'exploitation des données et l'intelligence artificielle pour résoudre des problèmes concrets.
                            </p>
                            <p style={{ marginBottom: "20px" }}>
                                Mon expertise s'étend de la conception d'architectures **Data Engineering** robustes (Oracle, AWS) à l'implémentation de modèles de **Machine Learning** avancés.
                                J'aime particulièrement le domaine de l'**IoT** (Internet of Things) et comment les agents intelligents peuvent interagir avec le monde physique.
                            </p>
                            <p style={{ marginBottom: "32px" }}>
                                Actuellement basé en France, je travaille sur des projets intégrant des technologies de pointe comme LangGraph, AWS Bedrock et Oracle 23ai pour créer des solutions IA de nouvelle génération (RAG).
                            </p>

                            <div style={{ display: "flex", gap: "16px" }}>
                                <a href="/CV_Berthoni_Passo.pdf" download className="btn-primary">
                                    📥 Télécharger CV (PDF)
                                </a>
                                <a href="#competences" className="btn-secondary">
                                    Compétences ↓
                                </a>
                            </div>
                        </div>

                        {/* Photo / Visual */}
                        <div style={{ animation: "fadeInUp 0.8s ease forwards" }} className="animate-float">
                            <div className="glass-card" style={{ padding: "10px", borderRadius: "32px", overflow: "hidden" }}>
                                <div style={{
                                    aspectRatio: "1/1",
                                    background: "linear-gradient(135deg, #4f8ef722, #8b5cf622)",
                                    borderRadius: "24px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "5rem",
                                    border: "1px dashed var(--border-hover)"
                                }}>
                                    👨‍💻
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Competences */}
                    <div id="competences" style={{ marginTop: "100px" }}>
                        <h2 style={{ marginBottom: "40px" }}>Compétences <span className="gradient-text">Techniques</span></h2>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                            {[
                                { title: "Data & DB", items: ["Oracle 23ai", "PostgreSQL", "Data Engineering", "ETL Pipelines"] },
                                { title: "Machine Learning", items: ["Python (Scikit-learn, PyTorch)", "LSTM & Time Series", "RAG & LLM Agents", "LangGraph"] },
                                { title: "Cloud & Dev", items: ["AWS (Bedrock, S3, EC2, Amplify)", "Next.js & React", "TypeScript", "Docker"] },
                                { title: "IoT", items: ["ONVIF Protocol", "Microcontrôleurs", "Smart Home Automation", "Edge Computing"] },
                            ].map((skillGroup) => (
                                <div key={skillGroup.title} className="glass-card" style={{ padding: "32px" }}>
                                    <h3 style={{ marginBottom: "20px", color: "var(--accent-blue)" }}>{skillGroup.title}</h3>
                                    <ul style={{ listStyle: "none" }}>
                                        {skillGroup.items.map(item => (
                                            <li key={item} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", fontSize: "0.95rem" }}>
                                                <span className="glow-dot" style={{ width: "6px", height: "6px" }}></span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer minimal */}
            <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                <p>© 2025 Berthoni Passo</p>
            </footer>
        </div>
    );
}
