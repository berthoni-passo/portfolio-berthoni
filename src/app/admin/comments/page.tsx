"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";

type Comment = {
    id: number;
    project_id: number;
    author_name: string;
    content: string;
    created_at: string;
};

const API_URL = "https://www.berthonipassoportfolio.com";

export default function AdminComments() {
    const router = useRouter();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token) {
            router.push("/admin");
        } else {
            setIsAuthenticated(true);
            fetchComments(token);
        }
    }, [router]);

    const fetchComments = async (token: string) => {
        try {
            const res = await fetch(`${API_URL}/api/interactions/comments`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setComments(data);
            }
        } catch (error) {
            console.error("Erreur fetch comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Voulez-vous vraiment supprimer ce commentaire ?")) return;

        const token = localStorage.getItem("admin_token");
        try {
            const res = await fetch(`${API_URL}/api/interactions/comments/${id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                setComments(comments.filter(c => c.id !== id));
            } else {
                alert("Erreur lors de la suppression");
            }
        } catch (error) {
            alert("Erreur serveur");
        }
    };

    if (!isAuthenticated) return null;

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />

            <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "120px 24px 60px" }}>
                <div style={{ marginBottom: "40px" }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
                        <button onClick={() => router.push("/admin/dashboard")} className="btn-secondary" style={{ padding: "8px 16px" }}>
                            ← Retour
                        </button>
                        <div className="section-badge" style={{ margin: 0 }}>Modération</div>
                    </div>
                    <h1 style={{ fontSize: "2.2rem" }}>Gestion des <span className="gradient-text">Commentaires</span></h1>
                </div>

                {loading ? (
                    <div style={{ textAlign: "center", padding: "100px", color: "var(--text-muted)" }}>Chargement...</div>
                ) : comments.length === 0 ? (
                    <div className="glass-card" style={{ padding: "60px", textAlign: "center", color: "var(--text-muted)" }}>
                        Aucun commentaire à modérer.
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {comments.map((comment) => (
                            <div key={comment.id} className="glass-card" style={{ padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "start", gap: "20px" }}>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                                        <span style={{ fontWeight: "700", color: "var(--accent-blue)" }}>{comment.author_name}</span>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                            {new Date(comment.created_at).toLocaleDateString()} à {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <span style={{ fontSize: "0.75rem", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: "100px" }}>ID Projet: {comment.project_id}</span>
                                    </div>
                                    <p style={{ color: "var(--text-primary)", lineHeight: "1.6", margin: 0 }}>{comment.content}</p>
                                </div>
                                <button
                                    onClick={() => handleDelete(comment.id)}
                                    className="btn-secondary"
                                    style={{ borderColor: "#ef4444", color: "#ef4444", padding: "8px 16px", fontSize: "0.85rem" }}
                                >
                                    Supprimer
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
