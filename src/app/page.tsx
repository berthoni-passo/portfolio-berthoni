"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import ParticlesCanvas from "./components/ParticlesCanvas";
import { useAnalytics } from "./hooks/useAnalytics";

// ─── Typewriter Hook ───
function useTypewriter(texts: string[], speed = 80, pause = 2000) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[index];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && charIdx <= current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx));
        setCharIdx((c) => c + 1);
      }, speed);
    } else if (!deleting && charIdx > current.length) {
      timeout = setTimeout(() => setDeleting(true), pause);
    } else if (deleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, charIdx - 1));
        setCharIdx((c) => c - 1);
      }, speed / 2);
    } else if (deleting && charIdx === 0) {
      setDeleting(false);
      setIndex((i) => (i + 1) % texts.length);
    }

    return () => clearTimeout(timeout);
  }, [charIdx, deleting, index, texts, speed, pause]);

  return displayed;
}

// ─── Skills ───
const skills = [
  "Data Engineering", "Machine Learning", "IoT & Embarqué",
  "Microsoft Fabric", "Oracle 23ai", "Python", "LangGraph", "Streamlit",
];

// ─── Stats ───
const stats = [
  { value: "5+", label: "Projets publiés" },
  { value: "100%", label: "Projets Open Source" },
  { value: "3", label: "Technologies cloud" },
  { value: "∞", label: "Curiosité" },
];

export default function HomePage() {
  const tagline = useTypewriter([
    "Expert Data Engineering & Analytics",
    "Développeur IA & Machine Learning",
    "Spécialiste Microsoft Fabric & Power BI",
    "Créateur de pipelines de données (ETL)",
    "Architecte de solutions Cloud (AWS/Azure)",
  ]);

  useAnalytics('home_view');

  const [recentProjects, setRecentProjects] = useState<any[]>([
    {
      id: "mock1",
      title: "IoT Multi-Agents",
      desc: "Contrôle à distance d'appareils IoT (Tapo P100, C225) via LangGraph, AWS Bedrock et ONVIF.",
      tags: ["LangGraph", "AWS", "IoT", "Oracle"],
      emoji: "🏠",
      color: "#4f8ef7",
    },
    {
      id: "mock2",
      title: "Prédiction Crypto",
      desc: "Modèles ML (LSTM, Random Forest, Neural Prophet) pour prédire les prix des cryptomonnaies.",
      tags: ["ML", "Python", "LSTM", "API"],
      emoji: "📈",
      color: "#8b5cf6",
    },
    {
      id: "mock3",
      title: "BI Oracle / Power BI",
      desc: "Tableaux de bord dynamiques connectés à Oracle 23ai, déployés sur AWS.",
      tags: ["Power BI", "Oracle", "AWS", "SQL"],
      emoji: "📊",
      color: "#06b6d4",
    },
  ]);

  useEffect(() => {
    fetch("http://localhost:8000/api/projects/")
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          const sorted = data.sort((a: any, b: any) => b.id - a.id).slice(0, 3);
          const formatted = sorted.map((p: any, idx: number) => ({
            id: p.id,
            title: p.title,
            desc: p.description.length > 100 ? p.description.substring(0, 100) + "..." : p.description,
            tags: p.tags ? p.tags.split(",").map((t: string) => t.trim()) : [],
            emoji: ["🚀", "💡", "🛠️", "💻", "🧠"][idx % 5],
            color: ["#4f8ef7", "#8b5cf6", "#06b6d4", "#f59e0b", "#ec4899"][idx % 5]
          }));
          setRecentProjects(formatted);
        }
      })
      .catch(err => console.error("API non joignable, conservation des projets liés (mock) :", err));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
      <Navbar />

      {/* ═══ HERO SECTION ═══ */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          paddingTop: "64px",
        }}
      >
        <ParticlesCanvas />

        {/* Gradient blobs */}
        <div style={{
          position: "absolute", top: "20%", left: "60%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          filter: "blur(40px)", zIndex: 0,
        }} />
        <div style={{
          position: "absolute", bottom: "10%", left: "10%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(79,142,247,0.07) 0%, transparent 70%)",
          filter: "blur(40px)", zIndex: 0,
        }} />

        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "80px 24px",
            position: "relative",
            zIndex: 1,
            width: "100%",
          }}
        >
          {/* Main Content Layout */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "40px" }}>

            {/* Colonne de Gauche : Textes, Profil, Boutons */}
            <div style={{
              flex: "1 1 500px",
              zIndex: 2,
              padding: "32px",
              borderRadius: "24px",
              background: "transparent",
              backdropFilter: "none",
              border: "none",
            }}>
              {/* ─── Profile Card (top-left) ─── */}
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "20px",
                  marginBottom: "48px",
                  animation: "fadeInUp 0.6s ease forwards",
                }}
              >
                {/* Avatar */}
                <div style={{ flexShrink: 0, position: "relative" }}>
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "24px",
                      background: "url('/img/berthoni_thinking.png.jpeg') center/cover, linear-gradient(135deg, #4f8ef7, #8b5cf6, #06b6d4)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "2rem",
                      boxShadow: "0 8px 30px rgba(79,142,247,0.35)",
                      border: "2px solid rgba(255,255,255,0.1)",
                      overflow: "hidden"
                    }}
                  >
                    <span style={{ opacity: 0 }} title="Remplacez /public/img/berthoni_thinking.png pour voir votre portrait">👨‍💻</span>
                  </div>
                </div>

                {/* Info */}
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                    }}
                  >
                    <div className="glow-dot" />
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--accent-blue)",
                        fontWeight: "600",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      Disponible pour missions
                    </span>
                  </div>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "800",
                      color: "var(--text-primary)",
                      marginBottom: "4px",
                    }}
                  >
                    Berthoni Passo
                  </h3>
                  <p
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--text-secondary)",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span>🌍 Paris, France</span>
                    <span style={{ color: "var(--border)" }}>•</span>
                    <span>🎓 Data Analyst / Data Engineer / AI Enthusiast</span>
                    <span style={{ color: "var(--border)" }}>•</span>
                    <a
                      href="https://learn.microsoft.com/en-us/users/berthoniromarionjimohpasso-8883/credentials/4cc2c9981c240652"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s ease", display: "flex", alignItems: "center", gap: "6px" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "var(--accent-blue)"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
                    >
                      <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 2L30 10V22L16 30L2 22V10L16 2Z" fill="url(#fabricGrad)" />
                        <path d="M16 4.3L28 11.2V20.8L16 27.7L4 20.8V11.2L16 4.3Z" fill="#1E1E1E" />
                        <path d="M16 8L24 12V18L16 22L8 18V12L16 8Z" fill="url(#fabricGrad2)" />
                        <defs>
                          <linearGradient id="fabricGrad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#0B556D" />
                            <stop offset="1" stopColor="#1E93B3" />
                          </linearGradient>
                          <linearGradient id="fabricGrad2" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#22C8ED" />
                            <stop offset="1" stopColor="#6EE0F5" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <span>Certifié Ms Fabric Data Engineer</span>
                    </a>

                    <span style={{ color: "var(--border)", display: "none" }} className="hide-on-mobile">•</span>

                    <a
                      href="https://learn.microsoft.com/en-us/users/berthoniromarionjimohpasso-8883/credentials/d4a2782d8a945d22"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "inherit", textDecoration: "none", transition: "color 0.2s ease", display: "flex", alignItems: "center", gap: "6px" }}
                      onMouseEnter={(e) => e.currentTarget.style.color = "#F2C811"}
                      onMouseLeave={(e) => e.currentTarget.style.color = "inherit"}
                    >
                      <svg width="16" height="16" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="20" width="6" height="10" fill="#E6AD10" />
                        <rect x="13" y="12" width="6" height="18" fill="#F2C811" />
                        <rect x="22" y="4" width="6" height="26" fill="#F2E64A" />
                      </svg>
                      <span>Certifié Power BI Data Analyst Associate</span>
                    </a>
                  </p>
                </div>
              </div>

              {/* ─── Main Headline ─── */}
              <div style={{ maxWidth: "800px", marginBottom: "32px", animationDelay: "0.1s" }}
                className="fade-in-up">
                <h1 style={{ marginBottom: "16px", color: "var(--text-primary)" }}>
                  Transformer vos données en{" "}
                  <span className="gradient-text">décisions stratégiques</span>
                </h1>
                <div
                  style={{
                    fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
                    color: "var(--text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0",
                    minHeight: "2rem",
                  }}
                >
                  <span>{tagline}</span>
                  <span
                    style={{
                      display: "inline-block",
                      width: "2px",
                      height: "1.2em",
                      background: "var(--accent-blue)",
                      marginLeft: "2px",
                      animation: "pulse 1s infinite",
                    }}
                  />
                </div>
              </div>

              {/* ─── CTA Buttons ─── */}
              <div
                style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginBottom: "56px" }}
                className="fade-in-up"
              >
                <Link href="/projets" className="btn-primary">
                  🚀 Voir mes projets
                </Link>
                <Link href="/a-propos" className="btn-secondary">
                  📄 Télécharger mon CV
                </Link>
              </div>

              {/* ─── Skill Tags ─── */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "8px",
                  marginBottom: "80px",
                }}
              >
                {skills.map((skill) => (
                  <span key={skill} className="tag">{skill}</span>
                ))}
              </div>

              {/* ─── Stats ─── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: "16px",
                }}
              >
                {stats.map((s) => (
                  <div key={s.label} className="stat-card glass-card">
                    <div className="stat-number">{s.value}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-muted)",
            fontSize: "0.75rem",
            animation: "float 2s ease-in-out infinite",
          }}
        >
          <span>Défiler</span>
          <span style={{ fontSize: "1.2rem" }}>↓</span>
        </div>
      </section>

      {/* ═══ PROJETS RÉCENTS ═══ */}
      <section style={{ padding: "100px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "60px" }}>
          <div className="section-badge">✦ Mes Travaux</div>
          <h2>Projets <span className="gradient-text">Récents</span></h2>
          <p style={{ marginTop: "12px", maxWidth: "500px", margin: "12px auto 0" }}>
            Une sélection de mes projets les plus récents en Data Engineering, ML et IoT.
          </p>
        </div>

        {/* Project cards placeholder */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          {recentProjects.map((project: any, idx: number) => (
            <Link
              key={project.id || idx}
              href={typeof project.id === 'string' && project.id.startsWith("mock") ? "/projets" : `/projets/${project.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                className="glass-card"
                style={{ padding: "28px", cursor: "pointer", height: "100%", transition: "all 0.3s ease" }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.borderColor = "var(--border-hover)";
                  e.currentTarget.style.boxShadow = `0 10px 30px ${project.color}22`;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.borderColor = "var(--border)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "14px",
                    background: `linear-gradient(135deg, ${project.color}22, ${project.color}44)`,
                    border: `1px solid ${project.color}33`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.5rem",
                    marginBottom: "16px",
                  }}
                >
                  {project.emoji}
                </div>
                <h3 style={{ color: "var(--text-primary)", marginBottom: "10px" }}>
                  {project.title}
                </h3>
                <p style={{ fontSize: "0.875rem", marginBottom: "16px", lineHeight: "1.6" }}>
                  {project.desc}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {Array.isArray(project.tags) ? project.tags.map((tag: string) => (
                    <span key={tag} className="tag" style={{ fontSize: "0.7rem" }}>{tag}</span>
                  )) : null}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ textAlign: "center" }}>
          <Link href="/projets" className="btn-secondary">
            Voir tous les projets →
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer
        style={{
          borderTop: "1px solid var(--border)",
          padding: "32px 24px",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.85rem",
        }}
      >
        <p>© 2025 Berthoni Passo — Construit avec ❤️ et Next.js</p>
        <div style={{ display: "flex", justifyContent: "center", gap: "24px", marginTop: "12px" }}>
          <Link href="https://github.com/berthoni-passo" target="_blank"
            style={{ color: "var(--text-secondary)" }}>GitHub</Link>
          <Link href="/contact" style={{ color: "var(--text-secondary)" }}>Contact</Link>
          <Link href="/projets" style={{ color: "var(--text-secondary)" }}>Projets</Link>
        </div>
      </footer>
    </div>
  );
}


