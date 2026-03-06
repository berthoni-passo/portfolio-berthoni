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
                    <div className="section-badge"> Mon Parcours</div>
                    <h1 style={{ marginBottom: "32px" }}>
                        À propos de <span className="gradient-text">Berthoni Passo</span>
                    </h1>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "48px", alignItems: "start" }}>
                        {/* Bio */}
                        <div style={{
                            animation: "fadeInUp 0.6s ease forwards",
                            padding: "32px",
                            borderRadius: "20px",
                            background: "rgba(3, 0, 20, 0.6)",
                            backdropFilter: "blur(14px)",
                            border: "1px solid rgba(255,255,255,0.06)",
                        }}>
                            <p style={{ fontSize: "1.1rem", marginBottom: "24px", color: "#f1f5f9", fontWeight: "500", lineHeight: "1.7" }}>
                                Ingénieur Data & IA doublement certifié (Microsoft Fabric Data Engineer Associate & Power BI Data Analyst), je transforme la donnée brute en leviers de performance stratégiques.
                            </p>
                            <p style={{ marginBottom: "20px", color: "#cbd5e1", lineHeight: "1.75" }}>
                                Fort de mon expérience combinée en Data Engineering et en Analyse de Données, je maîtrise l'intégralité du cycle de valorisation de la donnée. Je conçois et déploie des pipelines automatisés complexes (ETL) et modèle les données pour proposer des Dashboards (Power BI, Qlik Sense) à très fort impact décisionnel, tout en réduisant les coûts opérationnels grâce à l'automatisation.
                            </p>
                            <p style={{ marginBottom: "32px", color: "#cbd5e1", lineHeight: "1.75" }}>
                                Passionné par l'Intelligence Artificielle hybride, je conçois également des architectures avancées intégrant le Machine Learning, les LLM (RAG, LangGraph) et le Cloud pour répondre aux enjeux d'innovation des entreprises et multiplier leur ROI.
                            </p>

                            <div style={{ display: "flex", gap: "16px", marginTop: "40px", flexWrap: "wrap" }}>
                                <a
                                    href="/CV_Berthoni_Passo.pdf"
                                    download
                                    className="btn-primary"
                                    onClick={() => {
                                        fetch(`https://www.berthonipassoportfolio.com/api/analytics/`, {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ event_type: "cv_download" })
                                        }).catch(console.warn);
                                    }}
                                >
                                    📥 Télécharger CV (PDF)
                                </a>
                                <a href="#competences" className="btn-secondary">
                                    Compétences ↓
                                </a>
                            </div>
                        </div>

                        {/* Photo / Visual */}
                        <div style={{ animation: "fadeInUp 0.8s ease forwards" }} className="animate-float">
                            <div className="glass-card" style={{ padding: "12px", borderRadius: "32px", overflow: "hidden" }}>
                                <div style={{
                                    aspectRatio: "1/1",
                                    background: "url('/img/berthoni_thinking.png.jpeg') center/cover, linear-gradient(135deg, #4f8ef722, #8b5cf622)",
                                    borderRadius: "24px",
                                    border: "1px solid var(--border-hover)",
                                    boxShadow: "0 10px 30px rgba(0,0,0,0.5)"
                                }} />
                            </div>
                        </div>
                    </div>

                    {/* Competences */}
                    <div id="competences" style={{ marginTop: "100px" }}>
                        <h2 style={{ marginBottom: "40px" }}>Compétences <span className="gradient-text">Techniques</span></h2>

                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                            {[
                                { title: "Data & DB", items: ["Base de données Oracle", "PostgreSQL / SQL", "Microsoft Fabric", "Data Engineering", "ETL / ELT Pipelines", "Data Warehousing", "dbt (Data Build Tool)"] },
                                { title: "Machine Learning & IA", items: ["Python (Scikit-learn, PyTorch, TensorFlow)", "LLM & RAG (LangChain, LangGraph)", "Computer Vision", "NLP & Text Analytics", "LSTM & Time Series", "MLOps & Model Deployment", "Prompt Engineering"] },
                                { title: "Analytics & Visualisation", items: ["Power BI (certifié)", "Qlik Sense", "Data Storytelling", "KPI & Tableaux de bord", "Analyse prédictive", "Statistiques avancées"] },
                                { title: "Cloud & DevOps", items: ["AWS (EC2, S3, Bedrock, Rekognition)", "Azure (Microsoft Fabric)", "Docker & Conteneurisation", "CI/CD Pipelines", "Next.js & TypeScript", "API REST & FastAPI"] },
                                { title: "IoT & Edge", items: ["LangGraph Agents", "ONVIF Protocol", "Microcontrôleurs", "Smart Home Automation", "Edge Computing"] },
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
