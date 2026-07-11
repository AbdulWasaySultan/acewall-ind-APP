import React, { useState, useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import { useNavigate } from "react-router-dom";
import * as THREE from "three";

const CategoryLabel = ({ point }) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);
  const textRef = useRef();

  useFrame(() => {
    if (textRef.current) {
      textRef.current.lookAt(0, 0, 0);
      textRef.current.rotateY(Math.PI);
    }
  });

  return (
    <Text
      ref={textRef}
      position={point.position}
      fontSize={0.2}
      fontWeight="bold"
      color={hovered ? "#4ade80" : "#ffffffff"}
      anchorX="center"
      anchorY="middle"
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/courses/${point.id}`);
      }}
    >
      {point.title.toUpperCase()}
    </Text>
  );
};

const InteractiveGlobe = ({ subcategories }) => {
  const mainGroupRef = useRef();
  const materialRef = useRef();

  // ✅ Load textures from Earth 2k pack
  const [
    colorMap,    // 2k_earth_daymap.jpg → Base color
    normalMap,   // 2k_earth_normal_map.tif → Subtle ocean waves
    specularMap, // 2k_earth_specular_map.tif → Land vs ocean shine
  ] = useLoader(THREE.TextureLoader, [
    "/img/newimage1.png",
    // "/img/earthblackandwhite.png",
    "/img/2k_earth_normal_map.jpg",
    "/img/2k_earth_specular_map.jpg",
  ]);

  // Wrap for seamless movement
  normalMap.wrapS = normalMap.wrapT = THREE.RepeatWrapping;

  useFrame((state, delta) => {
    // Rotate globe slowly
    if (mainGroupRef.current) {
      mainGroupRef.current.rotation.y += delta * 0.12;
    }

    // Animate subtle ocean waves
    if (materialRef.current) {
      normalMap.offset.y += delta * 0.002;
      normalMap.offset.x += delta * 0.001;
    }
  });

  // Generate 3D points for subcategories on globe
  const points = useMemo(() => {
    return subcategories.map((sub, i) => {
      const phi = Math.acos(-1 + (2 * i) / subcategories.length);
      const theta = Math.sqrt(subcategories.length * Math.PI) * phi;
      const radius = 2.1;

      return {
        id: sub._id,
        title: sub.title,
        position: [
          radius * Math.sin(phi) * Math.cos(theta),
          radius * Math.cos(phi),
          radius * Math.sin(phi) * Math.sin(theta),
        ],
      };
    });
  }, [subcategories]);

  return (
    <group ref={mainGroupRef}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[2, 128, 128]} />

        <meshStandardMaterial
          ref={materialRef}
          map={colorMap}
          normalMap={normalMap}
          normalScale={new THREE.Vector2(0.15, 0.15)} // subtle ocean waves
          roughnessMap={specularMap}                   // defines land vs ocean shine
          roughness={0.9}                              // mostly matte
          metalness={0.02}                             // very low metallic
          color="white"                              // base green tint
          emissive="#66b94dff"                           // subtle glow
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Render category labels */}
      {points.map((point) => (
        <CategoryLabel key={point.id} point={point} />
      ))}
    </group>
  );
};

export default InteractiveGlobe;
