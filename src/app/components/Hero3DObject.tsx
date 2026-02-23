"use client";
import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Line, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// Composant représentant le réseau de neurones
function NeuralNet() {
    const group = useRef<THREE.Group>(null);

    // Générer les positions des nœuds et des connexions
    const { nodes, connections } = useMemo(() => {
        const layers = [4, 6, 8, 7, 5]; // Nombre de neurones par couche (plus de couches)
        const nodes: THREE.Vector3[] = [];
        const connections: [THREE.Vector3, THREE.Vector3][] = [];

        let layerOffset = -8; // Démarrer plus loin sur la gauche pour occuper la largeur
        const nodesByLayer: THREE.Vector3[][] = [];

        // Créer les nœuds (points)
        layers.forEach((count) => {
            const layerList: THREE.Vector3[] = [];
            const startY = ((count - 1) * 2.5) / 2; // Écarter plus verticalement
            for (let j = 0; j < count; j++) {
                // Ajouter un bruit pour un placement organique
                const x = layerOffset + (Math.random() * 1.5 - 0.75);
                const y = startY - j * 2.5 + (Math.random() * 1.5 - 0.75);
                const z = (Math.random() * 4 - 2); // Plus de profondeur
                const pos = new THREE.Vector3(x, y, z);
                layerList.push(pos);
                nodes.push(pos);
            }
            nodesByLayer.push(layerList);
            layerOffset += 4; // Plus d'espace entre les couches horizontalement
        });

        // Créer les connexions (lignes)
        for (let i = 0; i < nodesByLayer.length - 1; i++) {
            const currentLayer = nodesByLayer[i];
            const nextLayer = nodesByLayer[i + 1];
            currentLayer.forEach(nodeA => {
                nextLayer.forEach(nodeB => {
                    // Probabilité de connexion pour ne pas surcharger le rendu visuel
                    if (Math.random() > 0.25) {
                        connections.push([nodeA, nodeB]);
                    }
                });
            });
        }

        return { nodes, connections };
    }, []);

    // Animation de rotation lente standard
    useFrame((state) => {
        if (group.current) {
            // Mouvement autonome lent
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.05) * 0.15;
            group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.08) * 0.1;
        }
    });

    return (
        <group ref={group}>
            {/* Lignes synaptiques */}
            {connections.map((conn, i) => (
                <Line
                    key={`line-${i}`}
                    points={conn}
                    color="#818cf8"
                    opacity={0.25}
                    transparent
                    lineWidth={1.5}
                />
            ))}

            {/* Nœuds neuronaux */}
            {nodes.map((pos, i) => (
                <Sphere key={`node-${i}`} position={pos} args={[0.15, 16, 16]}>
                    <meshStandardMaterial
                        color="#2dd4bf"
                        emissive="#38bdf8"
                        emissiveIntensity={2}
                        toneMapped={false}
                        roughness={0.2}
                        metalness={0.8}
                    />
                </Sphere>
            ))}
        </group>
    );
}

export default function Hero3DObject() {
    return (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", zIndex: 0, opacity: 0.6 }}>
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[15, 15, 15]} intensity={2} color="#818cf8" />
                <pointLight position={[-15, -15, -15]} intensity={1.5} color="#2dd4bf" />

                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
                    <NeuralNet />
                </Float>

                {/* Interaction utilisateur avec la souris (Cliquer-glisser) */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 1.5}
                    minPolarAngle={Math.PI / 3}
                />
            </Canvas>
        </div>
    );
}
