"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";
import dynamic from "next/dynamic";
import ParticlesCanvas from "./components/ParticlesCanvas";

// Chargement dynamique du composant 3D pour empêcher Next.js de l'exécuter côté serveur (SSR)
const Hero3DObject = dynamic(() => import("./components/Hero3DObject"), {
  ssr: false,
  loading: () => <div style={{ width: 300, height: 300, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Initialisation 3D...</div>
});

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
  "AWS Cloud", "Oracle 23ai", "Python", "LangGraph", "Streamlit",
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
    "Data Engineer passionné",
    "ML Specialist",
    "IoT & Cloud Architect",
    "Développeur Full Stack",
    "Chercheur en IA",
  ]);

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
            <div style={{ flex: "1 1 500px", zIndex: 2 }}>
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
                    <span>📍 France</span>
                    <span style={{ color: "var(--border)" }}>•</span>
                    <span>🎓 Data Engineering & IA</span>
                    <span style={{ color: "var(--border)" }}>•</span>
                    <span>☁️ AWS Certified</span>
                  </p>
                </div>
              </div>

              {/* ─── Main Headline ─── */}
              <div style={{ maxWidth: "800px", marginBottom: "32px", animationDelay: "0.1s" }}
                className="fade-in-up">
                <h1 style={{ marginBottom: "16px", color: "var(--text-primary)" }}>
                  Construire l&apos;avenir{" "}
                  <span className="gradient-text">un projet à la fois</span>
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

            {/* Colonne de Droite : Objet 3D immersif pur */}
            <div style={{ flex: "1 1 500px", position: "relative", height: "500px", minWidth: "320px", zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", animation: "fadeInUp 1s ease forwards" }}>
              {/* Le réseau de neurones 3D dynamique */}
              <div style={{ position: "absolute", right: "-30px", top: "-20px", width: "450px", height: "550px", zIndex: 1 }}>
                <Hero3DObject />
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
          {[
            {
              title: "IoT Multi-Agents",
              desc: "Contrôle à distance d'appareils IoT (Tapo P100, C225) via LangGraph, AWS Bedrock et ONVIF.",
              tags: ["LangGraph", "AWS", "IoT", "Oracle"],
              emoji: "🏠",
              color: "#4f8ef7",
            },
            {
              title: "Prédiction Crypto",
              desc: "Modèles ML (LSTM, Random Forest, Neural Prophet) pour prédire les prix des cryptomonnaies.",
              tags: ["ML", "Python", "LSTM", "API"],
              emoji: "📈",
              color: "#8b5cf6",
            },
            {
              title: "BI Oracle / Power BI",
              desc: "Tableaux de bord dynamiques connectés à Oracle 23ai, déployés sur AWS.",
              tags: ["Power BI", "Oracle", "AWS", "SQL"],
              emoji: "📊",
              color: "#06b6d4",
            },
          ].map((project) => (
            <div
              key={project.title}
              className="glass-card"
              style={{ padding: "28px", cursor: "pointer" }}
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
                {project.tags.map((tag) => (
                  <span key={tag} className="tag" style={{ fontSize: "0.7rem" }}>{tag}</span>
                ))}
              </div>
            </div>
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


