"use client";
import { useEffect } from "react";

export function useAnalytics(eventType: string, targetId?: number) {
    useEffect(() => {
        // Enregistrer la page_view silencieusement sans bloquer le rendu
        const trackEvent = async () => {
            try {
                // Afin de ne pas spamer en développement local, on peut ignorer ou faire tourner.
                const res = await fetch(`http://localhost:8000/api/analytics/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        event_type: eventType,
                        target_id: targetId || null
                    }),
                });

                if (!res.ok) {
                    console.warn(`Analytics non tracké: ${res.status}`);
                }
            } catch (error) {
                // Silencieux pour ne pas perturber l'UX du site
                console.warn("Analytics Endpoint injoignable", error);
            }
        };

        // Empêche le doublon strict via sessionStorage pour 'page_view' (Optionnel)
        const sessionKey = `tracked_${eventType}_${targetId || 'global'}`;
        if (!sessionStorage.getItem(sessionKey)) {
            sessionStorage.setItem(sessionKey, "true");
            trackEvent();
        }
    }, [eventType, targetId]);
}
