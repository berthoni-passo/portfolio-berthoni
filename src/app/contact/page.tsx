"use client";
import { useState } from "react";
import Navbar from "../components/Navbar";
import ParticlesCanvas from "../components/ParticlesCanvas";

export default function ContactPage() {
    const [formState, setFormState] = useState({ name: "", email: "", subject: "", message: "" });
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus("submitting");

        // Simulation de l'appel AWS SES (Phase 1)
        setTimeout(() => {
            console.log("Form submitted:", formState);
            setStatus("success");
            setFormState({ name: "", email: "", subject: "", message: "" });
        }, 1500);
    };

    return (
        <div style={{ minHeight: "100vh", background: "var(--bg-primary)" }}>
            <Navbar />

            <section style={{ position: "relative", paddingTop: "120px", paddingBottom: "100px", overflow: "hidden" }}>
                <ParticlesCanvas />

                <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 24px", position: "relative", zIndex: 1 }}>
                    <div className="section-badge">✦ Contact</div>
                    <h1 style={{ marginBottom: "16px" }}>Me <span className="gradient-text">Contacter</span></h1>
                    <p style={{ color: "var(--text-secondary)", marginBottom: "48px" }}>
                        Une question, un projet ou une proposition de collaboration ? N'hésitez pas à m'envoyer un message.
                        Je vous répondrai dans les plus brefs délais.
                    </p>

                    <div className="glass-card" style={{ padding: "40px" }}>
                        {status === "success" ? (
                            <div style={{ textAlign: "center", padding: "40px 0" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "20px" }}>✉️</div>
                                <h3 style={{ marginBottom: "12px" }}>Message envoyé !</h3>
                                <p style={{ color: "var(--text-secondary)", marginBottom: "32px" }}>
                                    Merci Berthoni vous répondra très bientôt.
                                </p>
                                <button onClick={() => setStatus("idle")} className="btn-secondary">Envoyer un autre message</button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>Nom Complet</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Jean Dupont"
                                            value={formState.name}
                                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                            style={{
                                                width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                                                borderRadius: "8px", padding: "12px 16px", color: "var(--text-primary)", outline: "none"
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>Adresse Email</label>
                                        <input
                                            required
                                            type="email"
                                            placeholder="jean@exemple.com"
                                            value={formState.email}
                                            onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                            style={{
                                                width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                                                borderRadius: "8px", padding: "12px 16px", color: "var(--text-primary)", outline: "none"
                                            }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>Sujet</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Proposition de projet"
                                        value={formState.subject}
                                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                                        style={{
                                            width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                                            borderRadius: "8px", padding: "12px 16px", color: "var(--text-primary)", outline: "none"
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: "600", color: "var(--text-secondary)", marginBottom: "8px" }}>Message</label>
                                    <textarea
                                        required
                                        rows={6}
                                        placeholder="Parlez-moi de votre projet..."
                                        value={formState.message}
                                        onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                                        style={{
                                            width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
                                            borderRadius: "8px", padding: "12px 16px", color: "var(--text-primary)", outline: "none",
                                            resize: "vertical"
                                        }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === "submitting"}
                                    className="btn-primary"
                                    style={{ alignSelf: "flex-start", minWidth: "200px", justifyContent: "center" }}
                                >
                                    {status === "submitting" ? "Envoi en cours..." : "🚀 Envoyer le message"}
                                </button>
                            </form>
                        )}
                    </div>

                    <div style={{ marginTop: "60px", display: "flex", justifyContent: "center", gap: "40px", flexWrap: "wrap" }}>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "4px" }}>Email Direct</div>
                            <div style={{ fontWeight: "600" }}>berthonipasso@gmail.com</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "4px" }}>Ville</div>
                            <div style={{ fontWeight: "600" }}>France</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginBottom: "4px" }}>LinkedIn / GitHub</div>
                            <div style={{ fontWeight: "600" }}>@berthoni-passo</div>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{ borderTop: "1px solid var(--border)", padding: "40px 24px", textAlign: "center", color: "var(--text-muted)" }}>
                <p>© 2025 Berthoni Passo</p>
            </footer>
        </div>
    );
}
