"use client";
import React, { useEffect, useState, use } from "react";
import Navbar from "../../components/Navbar";
import ParticlesCanvas from "../../components/ParticlesCanvas";

type Project = {
    id: number;
    title: string;
    description: string;
    tags: string | null;
    github_url: string | null;
    demo_url: string | null;
    powerbi_url: string | null;
    thumbnail_s3: string | null;
    images: { s3_url: string, caption: string | null }[];
    comments: { id: number, author_name: string, content: string, created_at: string }[];
};

export default function ProjectDetail({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const id = resolvedParams.id;
    const [project, setProject] = useState<Project | null>(null);
    const [likes, setLikes] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);

    // Formulaires
    const [commentName, setCommentName] = useState("");
    const [commentContent, setCommentContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [statusMessage, setStatusMessage] = useState("");

    // Identifier le visiteur
    const [visitorId, setVisitorId] = useState("");

    useEffect(() => {
        // ID visiteur stocké en local pour limiter les likes
        let vId = localStorage.getItem("visitor_id");
        if (!vId) {
            vId = "visitor_" + Math.random().toString(36).substring(2, 15);
            localStorage.setItem("visitor_id", vId);
        }
        setVisitorId(vId);

        // Fetch project data (avec mock si API non dispo)
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/projects/${id}`)
            .then(res => {
                if (!res.ok) {
                    throw new Error("Projet non trouvé via API");
                }
                return res.json();
            })
            .then(data => setProject(data))
            .catch(err => {
                console.warn("Backend indisponible ou projet manquant, utilisation des données simulées (mock).", err.message);
                // Données mockées pour que la démo fonctionne côté front
                setProject({
                    id: parseInt(id),
                    title: id === "1" ? "IoT Multi-Agents" : id === "2" ? "Prédiction Crypto" : "Dashboard BI Oracle",
                    description: "Projet de démonstration chargé en local car l'API n'est potentiellement pas connectée ou vide. Implémentation complète : Machine Learning, IoT et analyse de données.",
                    tags: "LangGraph, AWS, Python, Oracle",
                    github_url: "https://github.com",
                    demo_url: "https://localhost",
                    powerbi_url: id === "3" ? "https://app.powerbi.com/view?r=eyJrIjoiOWU4YmIyMzQtOTQ1ZS00YzNhLWJhNjItMzZhZGJhNDZjYTE2IiwidCI6IjQyNGZmNTM1LTc2ODktNDRiYi05NTcyLTY0MjgxYzI3OWFkMyJ9" : null,
                    thumbnail_s3: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
                    images: [
                        { s3_url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?auto=format&fit=crop&q=80&w=800", caption: "Interface graphique" },
                        { s3_url: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&q=80&w=800", caption: "Architecture logicielle" }
                    ],
                    comments: [
                        { id: 101, author_name: "Expert Cloud", content: "L'architecture décrite dans ce projet est très scalable. Beau travail !", created_at: new Date().toISOString() }
                    ]
                });
            });

        // Fetch likes count
        fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/interactions/likes/project/${id}`)
            .then(res => res.json())
            .then(data => {
                setLikes(data.count);
                // Si la BDD indique 0 like mais que le localStorage dit l'inverse, 
                // c'est que la BDD a été purgée. On réinitialise l'état local.
                if (data.count === 0 && localStorage.getItem(`liked_project_${id}`)) {
                    localStorage.removeItem(`liked_project_${id}`);
                    setHasLiked(false);
                }
            })
            .catch(err => {
                console.error("Likes API error", err);
                // setLikes(14); // Suppression du mock trompeur
            });

        // Pour des raisons pratiques de l'UX
        if (localStorage.getItem(`liked_project_${id}`)) {
            setHasLiked(true);
        }
    }, [id]);

    const handleLike = async () => {
        if (hasLiked) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/interactions/likes?ip_hash=${visitorId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ target_type: "project", target_id: parseInt(id, 10) })
            });
            const data = await res.json();

            if (res.ok) {
                setLikes(l => l + 1);
                setHasLiked(true);
                localStorage.setItem(`liked_project_${id}`, "true");
            } else {
                console.warn(data.detail || "API retour", data);
                if (data.detail === "Vous avez déjà liké cet élément.") {
                    setHasLiked(true);
                    localStorage.setItem(`liked_project_${id}`, "true");
                }
            }
        } catch (e) {
            console.error("API Error, fallback to local state impossible sans backend valide", e);
        }
    };

    const handleComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!commentName.trim() || !commentContent.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/interactions/comments?project_id=${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ author_name: commentName, content: commentContent })
            });

            if (res.ok) {
                const newComment = await res.json();
                setProject(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : prev);
                setCommentContent("");
                setStatusMessage("Commentaire ajouté avec succès !");
                setTimeout(() => setStatusMessage(""), 3000);
            } else {
                throw new Error("L'API a refusé le commentaire (projet manquant ou erreur serveur)");
            }
        } catch (e) {
            console.warn("API indisponible, simulation de l'ajout du commentaire localement...", e);
            // Fallback UI : On ajoute le commentaire fictivement à l'écran
            const mockComment = {
                id: Date.now(),
                author_name: commentName,
                content: commentContent,
                created_at: new Date().toISOString()
            };
            setProject(prev => prev ? { ...prev, comments: [...prev.comments, mockComment] } : prev);
            setCommentContent("");
            setStatusMessage("(Mode Démo) Commentaire ajouté !");
            setTimeout(() => setStatusMessage(""), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!project) return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-primary)" }}>
            <Navbar />
            <div style={{ color: "var(--text-muted)" }}>Chargement de l'espace de travail immersif...</div>
        </div>
    );

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
            <Navbar />

            {/* HEADER PROJET */}
            <header style={{ position: "relative", paddingTop: "120px", paddingBottom: "60px", overflow: "hidden", textAlign: "center" }}>
                <ParticlesCanvas />
                <div style={{ position: "relative", zIndex: 1, maxWidth: "800px", margin: "0 auto", padding: "0 24px", animation: "fadeInUp 0.6s ease forwards" }}>
                    <div style={{ display: "flex", justifyContent: "center", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
                        {project.tags?.split(",").map(tag => (
                            <span key={tag} className="tag">{tag.trim()}</span>
                        ))}
                    </div>

                    <h1 style={{ fontSize: "clamp(2rem, 5vw, 4rem)", marginBottom: "24px", fontWeight: "800" }}>
                        {project.title}
                    </h1>

                    <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "40px" }}>
                        {project.description}
                    </p>

                    <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
                        {project.github_url && (
                            <a href={project.github_url} target="_blank" rel="noreferrer" className="btn-secondary">
                                {`</>`} Code Source
                            </a>
                        )}
                        {project.demo_url && (
                            <a href={project.demo_url} target="_blank" rel="noreferrer" className="btn-primary">
                                🚀 Lancer la Démo
                            </a>
                        )}
                    </div>
                </div>
            </header>

            {/* CONTENU MEDIA & INTERACTIF */}
            <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px 100px", display: "flex", flexDirection: "column", gap: "80px" }}>

                {/* Visualisation Interactive (PowerBI UI si existant) */}
                {project.powerbi_url && (
                    <section style={{ animation: "fadeInUp 0.8s ease forwards" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ fontSize: "1.5rem" }}>📊</span>
                                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Dashboard Analytique</h2>
                            </div>
                            <a href={project.powerbi_url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ fontSize: "0.9rem", padding: "8px 16px" }}>
                                ↗️ Ouvrir en plein écran
                            </a>
                        </div>
                        <div className="glass-card" style={{ padding: "8px", borderRadius: "16px", height: "800px", overflow: "hidden" }}>
                            <iframe
                                title="Data Visualization"
                                src={project.powerbi_url}
                                frameBorder="0"
                                allowFullScreen={true}
                                style={{ width: "100%", height: "100%", borderRadius: "12px" }}
                            />
                        </div>
                    </section>
                )}

                {/* Galerie du projet */}
                {(project.thumbnail_s3 || (project.images && project.images.length > 0)) && (
                    <section>
                        <h2 style={{ fontSize: "1.5rem", marginBottom: "24px" }}>Média du Projet</h2>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
                            {project.thumbnail_s3 && (
                                <div className="glass-card" style={{ padding: "8px", borderRadius: "16px", height: "350px", overflow: "hidden" }}>
                                    <img
                                        src={project.thumbnail_s3.replace('public', '')}
                                        alt="Miniature Principale"
                                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                </div>
                            )}
                            {project.images?.map((img, i) => (
                                <div key={i} className="glass-card" style={{ padding: "8px", borderRadius: "16px", height: "350px", overflow: "hidden" }}>
                                    <img
                                        src={img.s3_url.replace('public', '')}
                                        alt={img.caption || `Image projet ${i}`}
                                        title={img.caption || ""}
                                        style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "12px" }}
                                    />
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* INTERACTIONS COMMUNAUTAIRES (Likes & Commentaires) */}
                <section style={{ borderTop: "1px solid var(--border)", paddingTop: "60px" }}>

                    {/* Action Like globale */}
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "60px" }}>
                        <button
                            onClick={handleLike}
                            style={{
                                background: hasLiked ? "var(--bg-card)" : "linear-gradient(135deg, #4f8ef7, #8b5cf6)",
                                border: hasLiked ? "1px solid var(--accent-blue)" : "none",
                                padding: "16px 32px",
                                borderRadius: "30px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                fontSize: "1.1rem",
                                cursor: hasLiked ? "default" : "pointer",
                                color: "white",
                                fontWeight: "600",
                                boxShadow: hasLiked ? "0 0 20px rgba(79, 142, 247, 0.4)" : "0 10px 30px rgba(139, 92, 246, 0.3)",
                                transition: "all 0.3s ease",
                                transform: hasLiked ? "scale(1.05)" : "scale(1)"
                            }}
                        >
                            <span style={{ fontSize: "1.5rem", filter: hasLiked ? "grayscale(0)" : "grayscale(0.8)" }}>🔥</span>
                            <span>{hasLiked ? "Vous avez apprécié ce projet !" : "J'apprécie ce travail"}</span>
                            <div style={{ background: "rgba(0,0,0,0.2)", padding: "4px 12px", borderRadius: "20px", fontSize: "0.9rem" }}>
                                {likes}
                            </div>
                        </button>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 1.5fr) minmax(300px, 1fr)", gap: "48px" }}>

                        {/* Section liste des commentaires */}
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "32px" }}>
                                <span style={{ fontSize: "1.5rem" }}>💬</span>
                                <h2 style={{ fontSize: "1.5rem", margin: 0 }}>Commentaires ({project.comments.length})</h2>
                            </div>

                            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                {project.comments.length === 0 ? (
                                    <div style={{ color: "var(--text-muted)", fontStyle: "italic", padding: "20px", background: "var(--bg-card)", borderRadius: "12px" }}>
                                        Aucun retour professionnel pour le moment. Soyez le premier !
                                    </div>
                                ) : project.comments.map(c => (
                                    <div key={c.id} className="glass-card" style={{ padding: "20px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                                            <strong style={{ color: "var(--accent-blue)" }}>{c.author_name}</strong>
                                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                                {new Date(c.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p style={{ margin: 0, color: "var(--text-secondary)", lineHeight: "1.5", fontSize: "0.95rem" }}>
                                            {c.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Formulaire ajout de commentaire */}
                        <div style={{ position: "sticky", top: "120px", alignSelf: "start" }}>
                            <div className="glass-card" style={{ padding: "32px", borderTop: "3px solid var(--accent-purple)" }}>
                                <h3 style={{ marginBottom: "24px" }}>Contribuer la discussion</h3>
                                <form onSubmit={handleComment} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                    <input
                                        type="text"
                                        placeholder="Votre nom complet"
                                        value={commentName}
                                        onChange={e => setCommentName(e.target.value)}
                                        required
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", color: "white", outline: "none" }}
                                    />
                                    <textarea
                                        placeholder="Que pensez-vous du retour sur investissement technique de ces composants..."
                                        value={commentContent}
                                        onChange={e => setCommentContent(e.target.value)}
                                        required
                                        rows={4}
                                        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", borderRadius: "8px", padding: "12px", color: "white", outline: "none", resize: "vertical" }}
                                    />
                                    <button type="submit" className="btn-primary" disabled={isSubmitting} style={{ opacity: isSubmitting ? 0.7 : 1 }}>
                                        {isSubmitting ? "Envoi..." : "Envoyer mon avis"}
                                    </button>
                                    {statusMessage && <div style={{ color: "var(--accent-blue)", fontSize: "0.9rem", textAlign: "center", marginTop: "8px" }}>{statusMessage}</div>}
                                </form>
                            </div>
                        </div>

                    </div>
                </section>
            </main>

            <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                <p>© 2025 Berthoni Passo</p>
            </footer>
        </div>
    );
}
