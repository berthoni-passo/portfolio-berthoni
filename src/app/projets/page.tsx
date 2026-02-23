"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ParticlesCanvas from "../components/ParticlesCanvas";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import ProjectCard from "../components/ProjectCard";

interface Project {
    id: number;
    title: string;
    description: string;
    tags: string;
    github_url?: string;
    demo_url?: string;
    powerbi_url?: string;
    thumbnail_s3?: string;
}

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("Tous");

    useEffect(() => {
        // Fetch projects from the FastAPI backend connected to Oracle 23ai
        const fetchProjects = async () => {
            const DUMMY_PROJECTS: Project[] = [
                {
                    id: 1,
                    title: "IoT Multi-Agents",
                    description: "Contrôle à distance d'appareils IoT (Tapo P100, C225) via LangGraph, AWS Bedrock et ONVIF. Interface Streamlit performante pour la gestion en temps réel.",
                    tags: "LangGraph, AWS, IoT, Oracle",
                    github_url: "https://github.com/berthoni-passo/iot-project",
                    demo_url: "https://demo.berthoni.com",
                    thumbnail_s3: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800"
                },
                {
                    id: 2,
                    title: "Prédiction Crypto",
                    description: "Modèles ML (LSTM, Random Forest, Neural Prophet) pour prédire les prix des cryptomonnaies.",
                    tags: "ML, Python, LSTM, API",
                    github_url: "https://github.com/berthoni-passo/crypto-prediction",
                    thumbnail_s3: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=800"
                },
                {
                    id: 3,
                    title: "Dashboard BI Oracle",
                    description: "Tableaux de bord dynamiques connectés à Oracle 23ai.",
                    tags: "Power BI, Oracle, AWS, SQL",
                    powerbi_url: "https://app.powerbi.com/view?r=eyJrIjoiOWU4YmIyMzQtOTQ1ZS00YzNhLWJhNjItMzZhZGJhNDZjYTE2IiwidCI6IjQyNGZmNTM1LTc2ODktNDRiYi05NTcyLTY0MjgxYzI3OWFkMyJ9",
                    thumbnail_s3: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800"
                }
            ];

            try {
                const res = await fetch("http://localhost:8000/api/projects/");
                if (res.ok) {
                    const data = await res.json();
                    setProjects(data.length > 0 ? data : DUMMY_PROJECTS);
                } else {
                    setProjects(DUMMY_PROJECTS);
                }
            } catch (err) {
                console.error("API non joignable, démarrage avec données mockées", err);
                setProjects(DUMMY_PROJECTS);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, []);

    // Extract unique tags
    const allTags = ["Tous"];
    projects.forEach(p => {
        if (p.tags) {
            p.tags.split(',').forEach(tag => {
                const t = tag.trim();
                if (t && !allTags.includes(t)) allTags.push(t);
            });
        }
    });

    const filteredProjects = filter === "Tous"
        ? projects
        : projects.filter(p => p.tags && p.tags.includes(filter));

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />

            <section style={{ position: "relative", paddingTop: "140px", paddingBottom: "100px", minHeight: "100vh" }}>
                <ParticlesCanvas />

                <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
                    <div style={{ textAlign: "center", marginBottom: "60px" }}>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="section-badge"
                            style={{ margin: "0 auto 20px" }}
                        >
                            ✦ Portfolio
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            style={{ marginBottom: "20px" }}
                        >
                            Mes <span className="gradient-text">Projets</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            style={{ color: "var(--text-secondary)", maxWidth: "600px", margin: "0 auto" }}
                        >
                            Explorez mes réalisations propulsées par l'intelligence artificielle, l'IoT et la data.
                        </motion.p>
                    </div>

                    {/* Filtres */}
                    {projects.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginBottom: "50px" }}
                        >
                            {allTags.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => setFilter(tag)}
                                    style={{
                                        padding: "8px 20px",
                                        borderRadius: "100px",
                                        border: `1px solid ${filter === tag ? "var(--accent)" : "var(--border)"}`,
                                        background: filter === tag ? "var(--accent-glow)" : "rgba(255,255,255,0.02)",
                                        color: filter === tag ? "var(--accent)" : "var(--text-secondary)",
                                        cursor: "pointer",
                                        transition: "all 0.3s ease",
                                        backdropFilter: "blur(10px)",
                                        fontSize: "0.9rem",
                                        fontWeight: filter === tag ? "600" : "500"
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </motion.div>
                    )}

                    {loading ? (
                        <div style={{ textAlign: "center", padding: "100px", color: "var(--text-muted)" }}>
                            Chargement des projets depuis Oracle 23ai...
                        </div>
                    ) : (
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
                                gap: "30px"
                            }}
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredProjects.length > 0 ? filteredProjects.map((project) => (
                                    <ProjectCard key={project.id} project={project} itemVariants={itemVariants} />
                                )) : (
                                    <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "60px", border: "1px dashed var(--border)", borderRadius: "20px" }}>
                                        <div style={{ fontSize: "2rem", marginBottom: "16px" }}>📭</div>
                                        <h3 style={{ color: "var(--text-primary)", marginBottom: "8px" }}>Aucun projet trouvé</h3>
                                        <p style={{ color: "var(--text-muted)" }}>La base de données Oracle 23ai est connectée mais ne contient pas encore de projets pour ce filtre.</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
}
