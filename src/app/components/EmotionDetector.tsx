"use client";
import { useState, useRef, useCallback, useEffect } from "react";

const MAX_DAILY_USES = 5;
const CAMERA_TIMEOUT_SEC = 30;
const STORAGE_KEY = "emotion_daily_usage";

function getDailyUsage(): number {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return 0;
        const { count, date } = JSON.parse(stored);
        const today = new Date().toISOString().split("T")[0];
        return date === today ? count : 0;
    } catch { return 0; }
}

function incrementDailyUsage(): number {
    try {
        const today = new Date().toISOString().split("T")[0];
        const current = getDailyUsage();
        const next = current + 1;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: next, date: today }));
        return next;
    } catch { return 1; }
}

type Emotion = {
    type: string;
    emoji: string;
    confidence: number;
};

type FaceInfo = {
    age_range: { low: number | null; high: number | null };
    gender: string | null;
    gender_confidence: number;
    smile: boolean;
    eyeglasses: boolean;
};

type EmotionResult = {
    dominant_emotion: Emotion | null;
    emotions: Emotion[];
    face_info: FaceInfo;
    faces_detected: number;
};

const EMOTION_COLORS: Record<string, string> = {
    HAPPY: "#22c55e",
    SAD: "#60a5fa",
    ANGRY: "#ef4444",
    SURPRISED: "#f59e0b",
    CALM: "#94a3b8",
    DISGUSTED: "#a3e635",
    CONFUSED: "#c084fc",
    FEAR: "#fb923c"
};

export default function EmotionDetector() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [cameraActive, setCameraActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<EmotionResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [permission, setPermission] = useState<"idle" | "requesting" | "denied">("idle");
    const [dailyCount, setDailyCount] = useState(0);
    const [countdown, setCountdown] = useState<number | null>(null);

    // Charger le compteur journalier au montage
    useEffect(() => { setDailyCount(getDailyUsage()); }, []);

    const startCamera = useCallback(async () => {
        if (getDailyUsage() >= MAX_DAILY_USES) {
            setError(`Limite journalière atteinte (${MAX_DAILY_USES} analyses/jour). Revenez demain !`);
            return;
        }
        setError(null);
        setPermission("requesting");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: "user" }
            });
            streamRef.current = stream;
            setCameraActive(true);
            setPermission("idle");
        } catch {
            setPermission("denied");
            setError("Permission caméra refusée. Autorisez l'accès dans votre navigateur.");
        }
    }, []);

    // Assigner le stream APRES que la vidéo soit montée dans le DOM
    useEffect(() => {
        if (cameraActive && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => { });
        }
        if (!cameraActive && videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, [cameraActive]);

    // Timer 30s : arrêt automatique si pas d'analyse
    useEffect(() => {
        if (cameraActive) {
            setCountdown(CAMERA_TIMEOUT_SEC);
            countdownRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev === null || prev <= 1) {
                        if (countdownRef.current) clearInterval(countdownRef.current);
                        if (streamRef.current) {
                            streamRef.current.getTracks().forEach(t => t.stop());
                            streamRef.current = null;
                        }
                        setCameraActive(false);
                        setResult(null);
                        setError("⏱️ Caméra stoppée automatiquement. Vous avez 30 secondes après l'activation pour cliquer sur Analyser.");
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (countdownRef.current) clearInterval(countdownRef.current);
            setCountdown(null);
        }
        return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    }, [cameraActive]);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
        setCameraActive(false);
        setResult(null);
        setError(null);
    }, []);

    const analyzeEmotion = useCallback(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        // Bloquer si limite journalière atteinte
        if (getDailyUsage() >= MAX_DAILY_USES) {
            setError(`Limite atteinte : ${MAX_DAILY_USES} analyses maximum par jour. Revenez demain !`);
            return;
        }

        // Arrêter le timer 30s dès qu'on analyse
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
        setCountdown(null);

        const video = videoRef.current;

        // Guard : la vidéo doit avoir des dimensions réelles avant de capturer
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            setError("La caméra n'est pas encore prête. Patientez 1 seconde et réessayez.");
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        // Capture frame
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        // La vidéo est miroir (scaleX(-1)) → on capture sans miroir pour AWS
        ctx.drawImage(video, 0, 0);
        const base64 = canvas.toDataURL("image/jpeg", 0.9);

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/ml/emotion`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image_base64: base64 })
                }
            );
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || "Erreur serveur");
            }
            const data: EmotionResult = await res.json();
            setResult(data);

            // Incrémenter le compteur journalier après succès
            const newCount = incrementDailyUsage();
            setDailyCount(newCount);

            // Relancer le countdown si l'utilisateur a encore des crédits
            if (newCount < MAX_DAILY_USES) {
                setCountdown(CAMERA_TIMEOUT_SEC);
                countdownRef.current = setInterval(() => {
                    setCountdown(prev => {
                        if (prev === null || prev <= 1) {
                            if (countdownRef.current) clearInterval(countdownRef.current);
                            if (streamRef.current) {
                                streamRef.current.getTracks().forEach(t => t.stop());
                                streamRef.current = null;
                            }
                            setCameraActive(false);
                            setResult(null);
                            setError("⏱️ Caméra stoppée automatiquement. Vous avez 30 secondes après l'activation pour cliquer sur Analyser.");
                            return null;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }

            // Track analytics
            fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/analytics/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ event_type: "ml_emotion_test" })
            }).catch(() => { });
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erreur inconnue";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Header */}
            <div style={{ textAlign: "center" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
                    Activez votre caméra et laissez l&apos;IA analyser vos émotions en temps réel.
                </p>
                {/* Compteur journalier */}
                <div style={{ marginTop: "8px", display: "flex", justifyContent: "center", gap: "6px" }}>
                    {Array.from({ length: MAX_DAILY_USES }).map((_, i) => (
                        <div key={i} style={{
                            width: "10px", height: "10px", borderRadius: "50%",
                            background: i < dailyCount ? "var(--accent-blue)" : "rgba(255,255,255,0.1)",
                            boxShadow: i < dailyCount ? "0 0 6px var(--accent-blue)" : "none",
                            transition: "all 0.3s"
                        }} />
                    ))}
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginLeft: "6px" }}>
                        {dailyCount}/{MAX_DAILY_USES} aujourd&apos;hui
                    </span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", alignItems: "start" }}>

                {/* Left: Camera panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div style={{
                        position: "relative",
                        background: "rgba(0,0,0,0.4)",
                        borderRadius: "16px",
                        overflow: "hidden",
                        border: cameraActive ? "1px solid rgba(56, 189, 248, 0.4)" : "1px solid var(--border)",
                        aspectRatio: "4/3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        {/* Placeholder quand cam inactive */}
                        {!cameraActive && (
                            <div style={{
                                position: "absolute", inset: 0,
                                display: "flex", flexDirection: "column",
                                alignItems: "center", justifyContent: "center",
                                color: "var(--text-muted)"
                            }}>
                                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>📷</div>
                                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                    {permission === "denied" ? "Accès refusé" : "Caméra inactive"}
                                </p>
                            </div>
                        )}

                        {/* Video — toujours dans le DOM, visible seulement quand active */}
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            style={{
                                width: "100%", height: "100%", objectFit: "cover",
                                transform: "scaleX(-1)",
                                display: cameraActive ? "block" : "none"
                            }}
                        />

                        {/* Countdown ring */}
                        {countdown !== null && (
                            <div style={{
                                position: "absolute", top: "12px", right: "12px",
                                background: countdown <= 10 ? "rgba(239,68,68,0.8)" : "rgba(0,0,0,0.6)",
                                borderRadius: "100px", padding: "4px 10px",
                                fontSize: "0.8rem", fontWeight: 700,
                                color: countdown <= 10 ? "white" : "#94a3b8",
                                transition: "background 0.3s"
                            }}>
                                ⏱️ {countdown}s
                            </div>
                        )}

                        {/* Live indicator */}
                        {cameraActive && (
                            <div style={{
                                position: "absolute", top: "12px", left: "12px",
                                display: "flex", alignItems: "center", gap: "6px",
                                background: "rgba(0,0,0,0.6)", borderRadius: "100px",
                                padding: "4px 10px", fontSize: "0.75rem", fontWeight: 600
                            }}>
                                <div className="glow-dot" style={{ width: "6px", height: "6px", background: "#ef4444", boxShadow: "0 0 8px #ef4444" }} />
                                LIVE
                            </div>
                        )}
                    </div>

                    {/* Hidden canvas for capture */}
                    <canvas ref={canvasRef} style={{ display: "none" }} />

                    {/* Controls */}
                    <div style={{ display: "flex", gap: "12px" }}>
                        {!cameraActive ? (
                            <button
                                className="btn-primary"
                                onClick={startCamera}
                                disabled={permission === "requesting"}
                                style={{ flex: 1, justifyContent: "center" }}
                            >
                                {permission === "requesting" ? "⏳ Connexion..." : "📷 Activer la caméra"}
                            </button>
                        ) : (
                            <>
                                <button
                                    className="btn-primary"
                                    onClick={analyzeEmotion}
                                    disabled={loading}
                                    style={{ flex: 1, justifyContent: "center" }}
                                >
                                    {loading ? "🔍 Analyse en cours..." : "📸 Analyser"}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={stopCamera}
                                    style={{ padding: "11px 16px" }}
                                >
                                    ✕
                                </button>
                            </>
                        )}
                    </div>

                    {error && (
                        <div style={{
                            background: "rgba(239, 68, 68, 0.1)",
                            border: "1px solid rgba(239, 68, 68, 0.3)",
                            borderRadius: "12px",
                            padding: "12px 16px",
                            color: "#f87171",
                            fontSize: "0.875rem"
                        }}>
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Right: Results panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {loading ? (
                        <div style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid var(--border)",
                            borderRadius: "16px",
                            padding: "40px",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "16px", animation: "pulse 1s infinite" }}>🔍</div>
                            <p style={{ color: "var(--text-secondary)" }}>Analyse AWS en cours...</p>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "8px" }}>
                                Powered by Amazon Rekognition
                            </p>
                        </div>
                    ) : result ? (
                        <>
                            {/* Dominant emotion */}
                            {result.dominant_emotion && (
                                <div style={{
                                    background: `${EMOTION_COLORS[result.dominant_emotion.type] || "#38bdf8"}18`,
                                    border: `1px solid ${EMOTION_COLORS[result.dominant_emotion.type] || "#38bdf8"}44`,
                                    borderRadius: "16px",
                                    padding: "24px",
                                    textAlign: "center"
                                }}>
                                    <div style={{ fontSize: "3.5rem", marginBottom: "8px" }}>
                                        {result.dominant_emotion.emoji}
                                    </div>
                                    <div style={{
                                        color: EMOTION_COLORS[result.dominant_emotion.type] || "#38bdf8",
                                        fontSize: "1.4rem",
                                        fontWeight: 700,
                                        marginBottom: "4px"
                                    }}>
                                        {result.dominant_emotion.type}
                                    </div>
                                    <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                        {result.dominant_emotion.confidence}% de confiance
                                    </div>
                                </div>
                            )}

                            {/* Emotion bars */}
                            <div style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid var(--border)",
                                borderRadius: "16px",
                                padding: "20px",
                                display: "flex",
                                flexDirection: "column",
                                gap: "12px"
                            }}>
                                <p style={{ color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
                                    Toutes les émotions
                                </p>
                                {result.emotions.map((em) => (
                                    <div key={em.type}>
                                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                            <span style={{ color: "var(--text-primary)", fontSize: "0.85rem" }}>
                                                {em.emoji} {em.type}
                                            </span>
                                            <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                                {em.confidence}%
                                            </span>
                                        </div>
                                        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "100px", height: "6px" }}>
                                            <div style={{
                                                width: `${em.confidence}%`,
                                                height: "100%",
                                                borderRadius: "100px",
                                                background: EMOTION_COLORS[em.type] || "#38bdf8",
                                                transition: "width 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                                                boxShadow: `0 0 8px ${EMOTION_COLORS[em.type] || "#38bdf8"}88`
                                            }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Face info */}
                            <div style={{
                                background: "rgba(255,255,255,0.03)",
                                border: "1px solid var(--border)",
                                borderRadius: "16px",
                                padding: "16px 20px",
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: "12px"
                            }}>
                                <div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: "0 0 2px" }}>ÂGE ESTIMÉ</p>
                                    <p style={{ color: "var(--text-primary)", fontWeight: 600, margin: 0 }}>
                                        {result.face_info.age_range.low}-{result.face_info.age_range.high} ans
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: "0 0 2px" }}>GENRE</p>
                                    <p style={{ color: "var(--text-primary)", fontWeight: 600, margin: 0 }}>
                                        {result.face_info.gender === "Male" ? "👨 Homme" : result.face_info.gender === "Female" ? "👩 Femme" : "—"}
                                        {" "}<span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>({result.face_info.gender_confidence}%)</span>
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: "0 0 2px" }}>SOURIRE</p>
                                    <p style={{ color: "var(--text-primary)", fontWeight: 600, margin: 0 }}>
                                        {result.face_info.smile ? "😊 Oui" : "😶 Non"}
                                    </p>
                                </div>
                                <div>
                                    <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: "0 0 2px" }}>LUNETTES</p>
                                    <p style={{ color: "var(--text-primary)", fontWeight: 600, margin: 0 }}>
                                        {result.face_info.eyeglasses ? "👓 Oui" : "❌ Non"}
                                    </p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            background: "rgba(255,255,255,0.02)",
                            border: "1px dashed var(--border)",
                            borderRadius: "16px",
                            padding: "48px 24px",
                            textAlign: "center"
                        }}>
                            <div style={{ fontSize: "2.5rem", marginBottom: "12px", opacity: 0.4 }}>🧠</div>
                            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                                Activez la caméra et cliquez sur <strong>Analyser</strong> pour détecter vos émotions
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div style={{
                textAlign: "center",
                padding: "12px",
                borderTop: "1px solid var(--border)"
            }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                    🔒 Vos images ne sont jamais stockées · Traitement en temps réel
                </p>
            </div>
        </div>
    );
}
