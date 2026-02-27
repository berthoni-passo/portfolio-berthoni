"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    role: "user" | "bot";
    content: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { id: "welc", role: "bot", content: "Bonjour ! Je suis l'assistant IA de Berthoni. Posez-moi des questions sur son parcours, ses projets ou ses compétences en Data & IA !" }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // État pour la bulle d'accueil temporaire
    const [showGreeting, setShowGreeting] = useState(false);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Bulle de bienvenue : 1 fois après 5s, puis 1 fois après 3 minutes — jamais plus
    useEffect(() => {
        if (isOpen) {
            setShowGreeting(false);
            return;
        }

        // 1ère apparition : 5 secondes après le chargement
        const t1Show = setTimeout(() => { if (!isOpen) setShowGreeting(true); }, 5000);
        const t1Hide = setTimeout(() => setShowGreeting(false), 10000);

        // 2ème apparition : 3 minutes (180s) après le chargement
        const t2Show = setTimeout(() => { if (!isOpen) setShowGreeting(true); }, 180000);
        const t2Hide = setTimeout(() => setShowGreeting(false), 185000);

        return () => {
            clearTimeout(t1Show); clearTimeout(t1Hide);
            clearTimeout(t2Show); clearTimeout(t2Hide);
        };
    }, [isOpen]);

    // Cache la bulle si l'utilisateur ouvre le chat
    useEffect(() => {
        if (isOpen) setShowGreeting(false);
    }, [isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Bloquer les messages trop courts (charabia, frappes accidentelles)
        if (input.trim().length < 3) {
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: "bot",
                content: "😊 Posez-moi une vraie question sur Berthoni !"
            }]);
            setInput("");
            return;
        }

        const userMsg: Message = { id: Date.now().toString(), role: "user", content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/rag/chat?question=${encodeURIComponent(userMsg.content)}`, {
                method: "POST"
            });

            if (!res.ok || !res.body) {
                throw new Error("Erreur serveur RAG");
            }

            setIsLoading(false); // On arrête le loader dès que le stream commence

            // 1. On crée le message vide pour lancer l'affichage
            const botMsgId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { id: botMsgId, role: "bot", content: "" }]);

            // 2. On lit le flux continu
            const reader = res.body.getReader();
            const decoder = new TextDecoder("utf-8");
            let done = false;
            let currentText = "";

            while (!done) {
                const { value, done: readerDone } = await reader.read();
                done = readerDone;
                if (value) {
                    const chunk = decoder.decode(value, { stream: !done });
                    currentText += chunk;
                    // Mise à jour frame par frame (React batchera les états)
                    setMessages(prev => prev.map(msg =>
                        msg.id === botMsgId ? { ...msg, content: currentText } : msg
                    ));
                }
            }

        } catch (error) {
            console.error(error);
            const errorMsg: Message = { id: (Date.now() + 1).toString(), role: "bot", content: "Oups, une erreur réseau s'est produite lors de la communication avec l'IA. Veuillez réessayer." };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: "fixed", bottom: "30px", right: "30px", zIndex: 9999 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        className="glass-card chatbot-window"
                        style={{
                            width: "350px",
                            height: "500px",
                            marginBottom: "16px",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                            boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                            border: "1px solid rgba(255,255,255,0.1)"
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: "16px", background: "rgba(0,0,0,0.4)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "var(--accent-cyan)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", color: "#000" }}>
                                    IA
                                </div>
                                <div>
                                    <h3 style={{ fontSize: "1rem", margin: 0 }}>Assistant Berthoni</h3>
                                    <p style={{ fontSize: "0.75rem", color: "var(--accent-green)", margin: 0 }}>En ligne</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "1.2rem" }}>
                                ✖
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", background: "rgba(3, 0, 20, 0.7)" }}>
                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    style={{
                                        alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                                        maxWidth: "85%",
                                        padding: "12px 16px",
                                        borderRadius: "16px",
                                        background: msg.role === "user" ? "var(--accent-cyan)" : "rgba(30, 40, 70, 0.95)",
                                        color: msg.role === "user" ? "#000814" : "#e2e8f0",
                                        fontSize: "0.9rem",
                                        lineHeight: "1.5",
                                        fontWeight: msg.role === "user" ? "600" : "400",
                                        border: msg.role === "bot" ? "1px solid rgba(56,189,248,0.15)" : "none",
                                        borderBottomRightRadius: msg.role === "user" ? "4px" : "16px",
                                        borderBottomLeftRadius: msg.role === "bot" ? "4px" : "16px"
                                    }}
                                >
                                    {msg.content}
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div style={{ alignSelf: "flex-start", padding: "12px 16px", background: "rgba(255,255,255,0.05)", borderRadius: "16px", borderBottomLeftRadius: "4px" }}>
                                    <span className="dot-typing"></span>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSend} style={{ padding: "16px", background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", gap: "8px" }}>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Posez une question..."
                                style={{
                                    flex: 1,
                                    padding: "10px 16px",
                                    borderRadius: "20px",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                    background: "rgba(255,255,255,0.05)",
                                    color: "white",
                                    outline: "none",
                                    fontSize: "0.9rem"
                                }}
                            />
                            <button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: "var(--accent-cyan)",
                                    border: "none",
                                    color: "#000",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    opacity: isLoading || !input.trim() ? 0.5 : 1
                                }}
                            >
                                ↑
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button & Greeting Bubble */}
            {!isOpen && (
                <div style={{ position: "relative" }}>
                    {/* Greeting Bubble */}
                    <AnimatePresence>
                        {showGreeting && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 20, scale: 0.9 }}
                                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                style={{
                                    position: "absolute",
                                    right: "80px",
                                    bottom: "10px",
                                    width: "220px",
                                    background: "rgba(30, 40, 70, 0.95)",
                                    border: "1px solid rgba(56,189,248,0.3)",
                                    borderRadius: "16px",
                                    borderBottomRightRadius: "4px",
                                    padding: "12px 16px",
                                    color: "white",
                                    fontSize: "0.85rem",
                                    lineHeight: "1.4",
                                    boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                                    cursor: "pointer",
                                    zIndex: 10000,
                                }}
                                onClick={() => setIsOpen(true)}
                            >
                                👋 Salut ! Je suis l'IA de Berthoni. As-tu des questions sur son profil ou ses projets Data/IA ?
                                {/* Petite flèche pointant vers l'avatar */}
                                <div style={{
                                    position: "absolute",
                                    right: "-8px",
                                    bottom: "10px",
                                    width: "0",
                                    height: "0",
                                    borderTop: "8px solid transparent",
                                    borderBottom: "8px solid transparent",
                                    borderLeft: "8px solid rgba(30, 40, 70, 0.95)",
                                }} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Avatar Button */}
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpen(true)}
                        style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "50%",
                            background: "url('/img/berthoni_thinking.png.jpeg') center/cover",
                            backgroundColor: "var(--bg-secondary)", // Fallback
                            border: "2px solid var(--accent-cyan)",
                            boxShadow: "0 4px 20px rgba(0, 240, 255, 0.4)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden"
                        }}
                    >
                    </motion.button>
                </div>
            )}

            {/* CSS pour l'animation de frappe (typing indicator) */}
            <style jsx>{`
                .dot-typing {
                    position: relative;
                    left: -9999px;
                    width: 6px;
                    height: 6px;
                    border-radius: 5px;
                    background-color: var(--accent-cyan);
                    color: var(--accent-cyan);
                    box-shadow: 9984px 0 0 0 var(--text-muted), 9999px 0 0 0 var(--text-muted), 10014px 0 0 0 var(--text-muted);
                    animation: dot-typing 1.5s infinite linear;
                }
                @keyframes dot-typing {
                    0% { box-shadow: 9984px 0 0 0 var(--accent-cyan), 9999px 0 0 0 var(--text-muted), 10014px 0 0 0 var(--text-muted); }
                    33% { box-shadow: 9984px 0 0 0 var(--text-muted), 9999px 0 0 0 var(--accent-cyan), 10014px 0 0 0 var(--text-muted); }
                    66% { box-shadow: 9984px 0 0 0 var(--text-muted), 9999px 0 0 0 var(--text-muted), 10014px 0 0 0 var(--accent-cyan); }
                    100% { box-shadow: 9984px 0 0 0 var(--text-muted), 9999px 0 0 0 var(--text-muted), 10014px 0 0 0 var(--text-muted); }
                }
                @media (max-width: 768px) {
                    .chatbot-window {
                        position: fixed !important;
                        top: 0; left: 0; right: 0; bottom: 0;
                        width: 100% !important; height: 100% !important;
                        margin: 0 !important; border-radius: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}
