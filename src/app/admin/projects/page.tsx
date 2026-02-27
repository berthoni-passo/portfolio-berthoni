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
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit state
    const [editingProjectId, setEditingProjectId] = useState<number | null>(null);

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

        let finalThumbnailUrl = thumbnailS3;

        // 1. Upload the local file if selected
        if (thumbnailFile) {
            const formData = new FormData();
            formData.append("file", thumbnailFile);

            try {
                const uploadRes = await fetch("http://localhost:8000/api/projects/upload-thumbnail", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
                    },
                    body: formData
                });

                if (uploadRes.ok) {
                    const data = await uploadRes.json();
                    finalThumbnailUrl = data.url;
                } else {
                    alert("Erreur serveur lors de l'upload de l'image vers S3.");
                    setIsSubmitting(false);
                    return;
                }
            } catch (err) {
                console.error("Upload error", err);
                alert("Erreur réseau lors de l'upload de l'image.");
                setIsSubmitting(false);
                return;
            }
        }

        // 2. Submit the project data
        const payload = {
            title,
            description,
            tags,
            github_url: githubUrl || null,
            demo_url: demoUrl || null,
            powerbi_url: powerbiUrl || null,
            thumbnail_s3: finalThumbnailUrl || null,
        };

        try {
            const endpoint = editingProjectId
                ? `http://localhost:8000/api/projects/${editingProjectId}`
                : "http://localhost:8000/api/projects/";

            const method = editingProjectId ? "PUT" : "POST";

            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("admin_token")}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                // Reset form
                resetForm();
                alert(editingProjectId ? "✨ Projet mis à jour avec succès !" : "✨ Projet publié avec succès !");
                fetchProjects(); // Refresh the list
            } else {
                alert("Erreur lors de l'enregistrement du projet.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur réseau de publication.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setTitle(""); setDescription(""); setTags("");
        setGithubUrl(""); setDemoUrl(""); setPowerbiUrl("");
        setThumbnailS3(""); setThumbnailFile(null);
        setEditingProjectId(null);
    };

    const handleEditClick = (project: Project & { github_url?: string, demo_url?: string, powerbi_url?: string, thumbnail_s3?: string }) => {
        setEditingProjectId(project.id);
        setTitle(project.title);
        setDescription(project.description);
        setTags(project.tags || "");
        setGithubUrl(project.github_url || "");
        setDemoUrl(project.demo_url || "");
        setPowerbiUrl(project.powerbi_url || "");
        setThumbnailS3(project.thumbnail_s3 || "");
        setThumbnailFile(null);
        window.scrollTo({ top: 0, behavior: 'smooth' }); // Remonter en haut de page pour voir le formulaire
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

                    {/* Formulaire de Création / Édition */}
                    <div className="glass-card fade-in-up" style={{ padding: "32px", position: "sticky", top: "120px", borderTop: editingProjectId ? "3px solid #f59e0b" : "3px solid var(--accent-cyan)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                            <h2 style={{ fontSize: "1.5rem", margin: 0 }}>
                                {editingProjectId ? `Édition du Projet #${editingProjectId}` : "Nouveau Projet"}
                            </h2>
                            {editingProjectId && (
                                <button onClick={resetForm} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "0.8rem" }}>
                                    ❌ Annuler l'édition
                                </button>
                            )}
                        </div>

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
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>URL Cloud / Démo Interactive (Optionnel)</label>
                                <input type="url" value={demoUrl} onChange={e => setDemoUrl(e.target.value)} style={inputStyle} placeholder="https://..." />
                                <p style={{ fontSize: "0.8rem", color: "var(--accent-blue)", marginTop: "6px" }}>
                                    💡 <i>Astuce : Ajoutez le tag "ML Lab" ou "Streamlit" pour que cette URL s'affiche comme application interactive intégrée (iFrame) dans l'onglet Lab.</i>
                                </p>
                            </div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>Image de Couverture (Fichier local)</label>
                                <input type="file" accept="image/*" onChange={e => setThumbnailFile(e.target.files?.[0] || null)} style={inputStyle} />
                            </div>

                            <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.8rem" }}>OU</div>

                            <div>
                                <label style={{ display: "block", marginBottom: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>URL Externe (S3, web...)</label>
                                <input type="url" value={thumbnailS3} onChange={e => setThumbnailS3(e.target.value)} style={inputStyle} placeholder="https://images.unsplash.com/..." />
                            </div>

                            <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ marginTop: "16px", opacity: isSubmitting ? 0.7 : 1 }}>
                                {isSubmitting ? "Enregistrement en cours..." : (editingProjectId ? "💾 Mettre à jour le projet" : "Publier le projet")}
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
                                            <button onClick={() => handleEditClick(proj as any)} className="btn-secondary" style={{ padding: "8px 16px", fontSize: "0.85rem", borderColor: "#f59e0b", color: "#f59e0b" }}>
                                                Modifier
                                            </button>
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
