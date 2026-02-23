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
        const layers = [3, 5, 6, 4]; // Nombre de neurones par couche
        const nodes: THREE.Vector3[] = [];
        const connections: [THREE.Vector3, THREE.Vector3][] = [];

        let layerOffset = -3;
        const nodesByLayer: THREE.Vector3[][] = [];

        // Créer les nœuds (points)
        layers.forEach((count) => {
            const layerList: THREE.Vector3[] = [];
            const startY = ((count - 1) * 1.5) / 2;
            for (let j = 0; j < count; j++) {
                // Ajouter un bruit pour un placement plus organique
                const x = layerOffset + (Math.random() * 0.4 - 0.2);
                const y = startY - j * 1.5 + (Math.random() * 0.5 - 0.25);
                const z = (Math.random() * 1.5 - 0.75);
                const pos = new THREE.Vector3(x, y, z);
                layerList.push(pos);
                nodes.push(pos);
            }
            nodesByLayer.push(layerList);
            layerOffset += 2;
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

    // Animation de rotation lente
    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.3;
            group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.15) * 0.15;
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
        <div style={{ height: "100%", width: "100%", minHeight: "400px", position: "relative" }}>
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#818cf8" />
                <pointLight position={[-10, -10, -10]} intensity={1} color="#2dd4bf" />

                <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
                    <NeuralNet />
                </Float>

                {/* Interaction utilisateur avec souris */}
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
