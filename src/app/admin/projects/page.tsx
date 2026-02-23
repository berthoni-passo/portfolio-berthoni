"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";

interface Project {
    id: number;
    title: string;
    description: string;
    tags: string;
}

export default function AdminProjects() {
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [demoUrl, setDemoUrl] = useState("");
    const [powerbiUrl, setPowerbiUrl] = useState("");
    const [thumbnailS3, setThumbnailS3] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin");
            return;
        }
        fetchProjects();
    }, [router]);

    const fetchProjects = async () => {
        try {
            const res = await fetch("http://localhost:8000/api/projects/");
            if (res.ok) {
                const data = await res.json();
                setProjects(data);
            }
        } catch (err) {
            console.error("Erreur de récupération :", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const payload = {
            title,
            description,
            tags,
            github_url: githubUrl || null,
            demo_url: demoUrl || null,
            powerbi_url: powerbiUrl || null,
            thumbnail_s3: thumbnailS3 || null,
        };

        try {
            const res = await fetch("http://localhost:8000/api/projects/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Reset form
                setTitle(""); setDescription(""); setTags("");
                setGithubUrl(""); setDemoUrl(""); setPowerbiUrl(""); setThumbnailS3("");
                alert("✨ Projet publié avec succès !");
                fetchProjects(); // Refresh the list
            } else {
                alert("Erreur lors de la publication du projet.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur réseau de publication.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteProject = async (id: number) => {
        if (!confirm("Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible.")) return;

        try {
            const res = await fetch(`http://localhost:8000/api/projects/${id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
                }
            });
            if (res.ok) {
                alert("🗑️ Projet supprimé.");
                fetchProjects();
            } else {
                alert("Erreur lors de la suppression.");
            }
        } catch (err) {
            console.error("Erreur réseau :", err);
            alert("Impossible de joindre le serveur.");
        }
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />
            <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "120px 24px 60px" }}>
                <Link href="/admin/dashboard" style={{ color: "var(--text-muted)", textDecoration: "none", marginBottom: "24px", display: "inline-block", fontSize: "0.95rem" }}>
                    ← Retour au Dashboard Administrateur
                </Link>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "40px", alignItems: "start" }}>

                    {/* Formulaire de Création */}
                    <div className="glass-card fade-in-up" style={{ padding: "32px", position: "sticky", top: "120px", borderTop: "3px solid var(--accent-cyan)" }}>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>Nouveau Projet</h2>

                        <form onSubmit={handleCreateProject} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Titre du projet *</label>
                                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} placeholder="Ex: Détection d'anomalies IoT" />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Description *</label>
                                <textarea required value={description} onChange={e => setDescription(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} placeholder="Explication détaillée du projet..." />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Tags (séparés par des virgules) *</label>
                                <input type="text" required value={tags} onChange={e => setTags(e.target.value)} style={inputStyle} placeholder="Machine Learning, AWS, Python" />
                            </div>

                            <hr style={{ borderColor: "rgba(255,255,255,0.1)", margin: "8px 0" }} />

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>URL GitHub (Optionnel)</label>
                                <input type="url" value={githubUrl} onChange={e => setGithubUrl(e.target.value)} style={inputStyle} placeholder="https://github.com/..." />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>URL Iframe Power BI (Optionnel)</label>
                                <input type="text" value={powerbiUrl} onChange={e => setPowerbiUrl(e.target.value)} style={inputStyle} placeholder="https://app.powerbi.com/view?r=..." />
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Image de Couverture (URL S3 ou publique)</label>
                                <input type="url" value={thumbnailS3} onChange={e => setThumbnailS3(e.target.value)} style={inputStyle} placeholder="https://images.unsplash.com/..." />
                            </div>

                            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: "16px", opacity: isSubmitting ? 0.7 : 1 }}>
                                {isSubmitting ? "Publication en cours..." : "Publier le projet"}
                            </button>
                        </form>
                    </div>

                    {/* Liste des Projets existants */}
                    <div>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>Projets en Base de Données ({projects.length})</h2>

                        {loading ? (
                            <p style={{ color: "var(--text-muted)" }}>Chargement depuis Oracle 23ai...</p>
                        ) : projects.length === 0 ? (
                            <div className="glass-card" style={{ padding: "40px", textAlign: "center", border: "1px dashed var(--border)" }}>
                                <div style={{ fontSize: "2rem", marginBottom: "16px" }}>📭</div>
                                <p style={{ color: "var(--text-muted)" }}>Aucun projet n'a encore été publié.</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {projects.map(proj => (
                                    <div key={proj.id} className="glass-card fade-in-up" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <h3 style={{ fontSize: "1.2rem", marginBottom: "8px", color: "var(--text-primary)" }}>{proj.title}</h3>
                                            <div style={{ display: "flex", gap: "8px" }}>
                                                {proj.tags?.split(",").slice(0, 3).map(tag => (
                                                    <span key={tag} style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "12px", color: "var(--accent-cyan)" }}>
                                                        {tag.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        <div style={{ display: "flex", gap: "12px" }}>
                                            <a href={`/projets/${proj.id}`} target="_blank" rel="noreferrer" className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem" }}>
                                                Voir
                                            </a>
                                            <button onClick={() => handleDeleteProject(proj.id)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem", borderColor: "#ef4444", color: "#ef4444" }}>
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    background: "rgba(0,0,0,0.2)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "white",
    outline: "none",
    fontFamily: "inherit"
};
