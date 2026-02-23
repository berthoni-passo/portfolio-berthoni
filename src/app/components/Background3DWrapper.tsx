"use client";

import dynamic from "next/dynamic";
import React from "react";

// Le vrai composant Three.js a besoin du navigateur (window, canvas) pour exister
// Ce "Wrapper" est rendu coté Client. On peut y utiliser safely next/dynamic avec ssr: false
const Hero3DObject = dynamic(() => import("./Hero3DObject"), {
    ssr: false,
    loading: () => null // Optionnel: éviter les flashs 
});

export default function Background3DWrapper() {
    return <Hero3DObject />;
}
