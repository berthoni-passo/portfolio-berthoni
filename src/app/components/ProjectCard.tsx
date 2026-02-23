"use client";
import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';

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

interface ProjectCardProps {
    project: Project;
    itemVariants: any;
}

export default function ProjectCard({ project, itemVariants }: ProjectCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    // Valeurs de mouvement pour l'effet Tilt
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    // Adoucissement des mouvements (Spring)
    const mouseXSpring = useSpring(x, { stiffness: 150, damping: 15 });
    const mouseYSpring = useSpring(y, { stiffness: 150, damping: 15 });

    // Conversion de la position de la souris en degrés de rotation (limité à +-15 degrés)
    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);
    const brightness = useTransform(mouseYSpring, [-0.5, 0.5], [1.2, 0.8]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();

        // Calcul position relative (de -0.5 à 0.5)
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const xPct = (mouseX / width) - 0.5;
        const yPct = (mouseY / height) - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            variants={itemVariants}
            layout
            ref={cardRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                perspective: 1200, // Profondeur 3D nécessaire pour le parent
            }}
        >
            <motion.div
                style={{
                    rotateX,
                    rotateY,
                    filter: `brightness(${brightness})`,
                    transformStyle: 'preserve-3d', // Pour que les enfants puissent aussi poper en 3D
                    background: "rgba(20, 20, 30, 0.7)",
                    border: "1px solid var(--border)",
                    borderRadius: "20px",
                    overflow: "hidden",
                    backdropFilter: "blur(20px)",
                    display: "flex",
                    flexDirection: "column",
                    boxShadow: "0 15px 35px -10px rgba(0,0,0,0.6)",
                    height: "100%",
                }}
                whileHover={{
                    scale: 1.02,
                    boxShadow: "0 25px 50px -12px var(--glow-blue)",
                    borderColor: "var(--border-hover)",
                    transition: { duration: 0.2 }
                }}
            >
                {/* Image Section */}
                <div style={{ height: "220px", background: "url('/img/placeholder.jpg') center/cover", position: "relative", transform: "translateZ(30px)" }}>
                    {project.thumbnail_s3 && (
                        <div
                            style={{
                                position: "absolute", inset: 0,
                                background: `url(${project.thumbnail_s3}) center/cover`,
                                transition: "transform 0.5s"
                            }}
                            className="thumbnail-bg"
                        />
                    )}
                    <div style={{
                        position: "absolute", inset: 0,
                        background: "linear-gradient(to top, rgba(10,10,15,1), transparent)"
                    }}></div>

                    <div style={{ position: "absolute", bottom: "16px", left: "20px", display: "flex", gap: "8px", flexWrap: "wrap", transform: "translateZ(40px)" }}>
                        {project.tags && project.tags.split(',').slice(0, 3).map(t => (
                            <span key={t} style={{
                                fontSize: "0.75rem", padding: "4px 10px", borderRadius: "8px",
                                background: "rgba(0,0,0,0.6)", border: "1px solid var(--border)",
                                backdropFilter: "blur(6px)", color: "var(--accent-cyan)",
                                fontWeight: "600", letterSpacing: "0.5px"
                            }}>{t.trim()}</span>
                        ))}
                    </div>
                </div>

                {/* Content Section */}
                <div style={{ padding: "24px", flexGrow: 1, display: "flex", flexDirection: "column", transform: "translateZ(20px)" }}>
                    <h3 style={{ fontSize: "1.4rem", marginBottom: "12px", color: "var(--text-primary)", fontWeight: "700" }}>
                        {project.title}
                    </h3>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: "1.6", marginBottom: "24px", flexGrow: 1 }}>
                        {project.description.length > 120 ? project.description.substring(0, 120) + "..." : project.description}
                    </p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "auto" }}>
                        <Link href={`/projets/${project.id}`} style={{
                            color: "var(--text-primary)", textDecoration: "none", fontWeight: "600",
                            display: "flex", alignItems: "center", gap: "8px", fontSize: "0.95rem",
                            transition: "all 0.3s"
                        }}
                            onMouseOver={(e) => { e.currentTarget.style.color = "var(--accent-blue)"; }}
                            onMouseOut={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
                        >
                            Voir les détails
                            <span style={{ color: "var(--accent-blue)" }}>→</span>
                        </Link>

                        <div style={{ display: "flex", gap: "12px" }}>
                            {project.github_url && (
                                <a href={project.github_url} target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "white"} onMouseOut={e => e.currentTarget.style.color = "var(--text-muted)"}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                                </a>
                            )}
                            {project.demo_url && (
                                <a href={project.demo_url} target="_blank" rel="noreferrer" style={{ color: "var(--text-muted)", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "white"} onMouseOut={e => e.currentTarget.style.color = "var(--text-muted)"}>
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}
