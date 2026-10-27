import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars } from '@react-three/drei';
import * as THREE from 'three';

/**
 * High-Fidelity Procedural 3D Plant Meshes
 * Modeled specifically for: Tomato, Brinjal, Chilli, Onion, Cotton, Sugarcane, Wheat, Rice
 */

// 1. Tomato Plant with Vines, Leaves, and Ripe/Unripe Fruit Clusters
function TomatoModel({ leafColor, isDrought }) {
  return (
    <group>
      {/* Bamboo Trellis Stake */}
      <mesh position={[0.08, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.95, 6]} />
        <meshStandardMaterial color="#A1887F" roughness={0.9} />
      </mesh>

      {/* Main Twisting Vine Stem */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.04, 0.7, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>

      {/* Branch 1 */}
      <mesh position={[-0.1, 0.38, 0.05]} rotation={[0.2, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, 0.28, 6]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>
      {/* Branch 2 */}
      <mesh position={[0.1, 0.5, -0.05]} rotation={[-0.2, 0, 0.6]} castShadow>
        <cylinderGeometry args={[0.015, 0.02, 0.28, 6]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>

      {/* Foliage Leaf Tufts */}
      <mesh position={[0, 0.65, 0]} castShadow>
        <sphereGeometry args={[0.22, 8, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.65} />
      </mesh>
      <mesh position={[-0.16, 0.45, 0.1]} castShadow>
        <sphereGeometry args={[0.15, 7, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.65} />
      </mesh>
      <mesh position={[0.16, 0.52, -0.08]} castShadow>
        <sphereGeometry args={[0.15, 7, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.65} />
      </mesh>

      {/* Realistic Tomatoes (Cluster with Sepals) */}
      {!isDrought && (
        <group>
          {/* Large Ripe Tomato */}
          <group position={[0.14, 0.36, 0.12]}>
            <mesh castShadow>
              <sphereGeometry args={[0.09, 10, 10]} />
              <meshStandardMaterial color="#E53935" roughness={0.25} metalness={0.1} />
            </mesh>
            {/* Green Sepal Calyx */}
            <mesh position={[0, 0.085, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.05, 0.03, 5]} />
              <meshStandardMaterial color="#2E7D32" />
            </mesh>
          </group>

          {/* Medium Turning Orange Tomato */}
          <group position={[-0.13, 0.28, 0.1]}>
            <mesh castShadow>
              <sphereGeometry args={[0.075, 10, 10]} />
              <meshStandardMaterial color="#FB8C00" roughness={0.25} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.07, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.04, 0.025, 5]} />
              <meshStandardMaterial color="#2E7D32" />
            </mesh>
          </group>

          {/* Small Green Unripe Tomato */}
          <group position={[0.02, 0.22, -0.12]}>
            <mesh castShadow>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color="#7CB342" roughness={0.3} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

// 2. Brinjal / Eggplant Model with Broad Leaves and Deep Purple Glossy Fruit
function BrinjalModel({ leafColor, isDrought }) {
  return (
    <group>
      {/* Main Bushy Stem */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.05, 0.55, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.85} />
      </mesh>

      {/* Broad Ovate Foliage */}
      <mesh position={[0, 0.48, 0]} scale={[1.2, 0.8, 1.2]} castShadow>
        <sphereGeometry args={[0.26, 8, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.7} />
      </mesh>
      <mesh position={[-0.18, 0.35, 0]} scale={[1.4, 0.6, 1]} castShadow>
        <sphereGeometry args={[0.16, 7, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.7} />
      </mesh>
      <mesh position={[0.18, 0.38, 0]} scale={[1.4, 0.6, 1]} castShadow>
        <sphereGeometry args={[0.16, 7, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.7} />
      </mesh>

      {/* Deep Violet Purple Brinjal / Aubergine Vegetables */}
      {!isDrought && (
        <group>
          {/* Main Hanging Eggplant */}
          <group position={[0.12, 0.22, 0.14]} rotation={[0.3, 0, -0.2]}>
            {/* Green Prickly Calyx Cap */}
            <mesh position={[0, 0.12, 0]} castShadow>
              <coneGeometry args={[0.06, 0.05, 6]} />
              <meshStandardMaterial color="#33691E" roughness={0.6} />
            </mesh>
            {/* Pear-shaped Eggplant Body */}
            <mesh position={[0, 0, 0]} scale={[0.8, 1.4, 0.8]} castShadow>
              <sphereGeometry args={[0.085, 10, 10]} />
              <meshStandardMaterial color="#311B92" roughness={0.18} metalness={0.15} />
            </mesh>
          </group>

          {/* Secondary Maturing Eggplant */}
          <group position={[-0.14, 0.26, -0.08]} rotation={[-0.3, 0, 0.25]}>
            <mesh position={[0, 0.09, 0]} castShadow>
              <coneGeometry args={[0.05, 0.04, 6]} />
              <meshStandardMaterial color="#33691E" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0, 0]} scale={[0.8, 1.3, 0.8]} castShadow>
              <sphereGeometry args={[0.07, 9, 9]} />
              <meshStandardMaterial color="#4A148C" roughness={0.2} metalness={0.15} />
            </mesh>
          </group>

          {/* Purple Flower Blossom */}
          <mesh position={[0, 0.58, 0.12]}>
            <sphereGeometry args={[0.035, 6, 6]} />
            <meshStandardMaterial color="#BA68C8" />
          </mesh>
        </group>
      )}
    </group>
  );
}

// 3. Chilli / Pepper Model with Pointed Curved Red and Green Chillies
function ChilliModel({ leafColor, isDrought }) {
  return (
    <group>
      {/* Branching Pepper Shrub */}
      <mesh position={[0, 0.25, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.04, 0.5, 6]} />
        <meshStandardMaterial color={leafColor} roughness={0.8} />
      </mesh>

      {/* Bushy Foliage */}
      <mesh position={[0, 0.44, 0]} castShadow>
        <sphereGeometry args={[0.24, 8, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.65} />
      </mesh>
      <mesh position={[-0.14, 0.34, 0.08]} castShadow>
        <sphereGeometry args={[0.14, 7, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.65} />
      </mesh>
      <mesh position={[0.14, 0.36, -0.08]} castShadow>
        <sphereGeometry args={[0.14, 7, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.65} />
      </mesh>

      {/* Hanging Sharp Chillies */}
      {!isDrought && (
        <group>
          {/* Fiery Red Ripe Chilli */}
          <group position={[0.12, 0.28, 0.12]} rotation={[2.8, 0.2, 0.4]}>
            <mesh position={[0, 0.05, 0]} castShadow>
              <coneGeometry args={[0.028, 0.13, 6]} />
              <meshStandardMaterial color="#D50000" roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.03, 4]} />
              <meshStandardMaterial color="#2E7D32" />
            </mesh>
          </group>

          {/* Fresh Green Chilli */}
          <group position={[-0.11, 0.32, 0.1]} rotation={[2.9, -0.3, -0.3]}>
            <mesh position={[0, 0.05, 0]} castShadow>
              <coneGeometry args={[0.025, 0.12, 6]} />
              <meshStandardMaterial color="#1B5E20" roughness={0.25} />
            </mesh>
          </group>

          {/* Another Green Chilli */}
          <group position={[0.02, 0.24, -0.14]} rotation={[3.0, 0.4, 0]}>
            <mesh position={[0, 0.045, 0]} castShadow>
              <coneGeometry args={[0.024, 0.11, 6]} />
              <meshStandardMaterial color="#2E7D32" roughness={0.25} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

// 4. Onion / Allium Model with Swelling Bulb and Tubular Scallion Leaves
function OnionModel({ leafColor, isDrought }) {
  return (
    <group>
      {/* Semi-Exposed Onion Bulb in Soil */}
      <mesh position={[0, 0.04, 0]} scale={[1.2, 0.9, 1.2]} castShadow receiveShadow>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshStandardMaterial color="#8D4925" roughness={0.5} />
      </mesh>

      {/* Onion Papery Outer Skin Rings */}
      <mesh position={[0, 0.09, 0]} scale={[0.7, 0.4, 0.7]}>
        <cylinderGeometry args={[0.06, 0.09, 0.08, 8]} />
        <meshStandardMaterial color="#A1887F" roughness={0.7} />
      </mesh>

      {/* Upright Tubular Hollow Scallion Stems */}
      <group position={[0, 0.14, 0]}>
        <mesh position={[0, 0.24, 0]} rotation={[0.05, 0, 0]} castShadow>
          <cylinderGeometry args={[0.015, 0.025, 0.48, 6]} />
          <meshStandardMaterial color={leafColor} roughness={0.7} />
        </mesh>
        <mesh position={[-0.04, 0.2, 0.03]} rotation={[-0.1, 0, -0.18]} castShadow>
          <cylinderGeometry args={[0.012, 0.02, 0.42, 6]} />
          <meshStandardMaterial color={leafColor} roughness={0.7} />
        </mesh>
        <mesh position={[0.04, 0.22, -0.03]} rotation={[0.12, 0, 0.16]} castShadow>
          <cylinderGeometry args={[0.012, 0.02, 0.44, 6]} />
          <meshStandardMaterial color={leafColor} roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}

// 5. Cotton Shrub with Fluffy White Bolls
function CottonModel({ leafColor, isDrought }) {
  return (
    <group>
      {/* Sturdy Stem */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.05, 0.6, 7]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>

      {/* Lobed Foliage */}
      <mesh position={[0, 0.48, 0]} castShadow>
        <sphereGeometry args={[0.22, 7, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.7} />
      </mesh>

      {/* Fluffy White Open Cotton Bolls with Brown Dried Calyx */}
      {!isDrought && (
        <group>
          {/* Boll 1 */}
          <group position={[0.11, 0.42, 0.08]}>
            <mesh position={[0, -0.03, 0]}>
              <coneGeometry args={[0.06, 0.04, 4]} />
              <meshStandardMaterial color="#4E342E" />
            </mesh>
            <mesh castShadow>
              <sphereGeometry args={[0.07, 8, 8]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
            </mesh>
          </group>

          {/* Boll 2 */}
          <group position={[-0.12, 0.36, -0.06]}>
            <mesh position={[0, -0.03, 0]}>
              <coneGeometry args={[0.055, 0.04, 4]} />
              <meshStandardMaterial color="#4E342E" />
            </mesh>
            <mesh castShadow>
              <sphereGeometry args={[0.065, 8, 8]} />
              <meshStandardMaterial color="#FAFAFA" roughness={0.95} />
            </mesh>
          </group>

          {/* Boll 3 */}
          <group position={[0.02, 0.54, 0.1]}>
            <mesh castShadow>
              <sphereGeometry args={[0.06, 8, 8]} />
              <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

// 6. Sugarcane Model with Segmented Cane Nodes and Drooping Leaves
function SugarcaneModel({ leafColor }) {
  return (
    <group>
      {/* Segmented Tall Cane Stalk with Nodes */}
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.055, 1.4, 7]} />
        <meshStandardMaterial color="#43A047" roughness={0.7} />
      </mesh>

      {/* Cane Node Rings */}
      {[0.25, 0.5, 0.75, 1.0, 1.25].map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]}>
          <torusGeometry args={[0.048, 0.008, 5, 12]} />
          <meshStandardMaterial color="#7CB342" roughness={0.9} />
        </mesh>
      ))}

      {/* Drooping Fountain Top Foliage */}
      <mesh position={[0, 1.35, 0]} scale={[1.4, 0.8, 1.4]} castShadow>
        <sphereGeometry args={[0.35, 7, 7]} />
        <meshStandardMaterial color={leafColor} roughness={0.7} />
      </mesh>
    </group>
  );
}

// 7. Golden Wheat Model with Bearded Ear & Awns
function WheatModel({ leafColor }) {
  return (
    <group>
      {/* Slender Golden Stalk */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.025, 0.7, 6]} />
        <meshStandardMaterial color="#D4AF37" roughness={0.8} />
      </mesh>

      {/* Bearded Seed Head Spikes */}
      <mesh position={[0, 0.65, 0]} scale={[0.6, 2.2, 0.6]} castShadow>
        <cylinderGeometry args={[0.03, 0.04, 0.25, 6]} />
        <meshStandardMaterial color="#E6C229" roughness={0.6} />
      </mesh>
    </group>
  );
}

// 8. Rice / Paddy Model
function RiceModel({ leafColor }) {
  return (
    <group>
      {/* Clustered Tillers */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.04, 0.6, 6]} />
        <meshStandardMaterial color="#7CB342" roughness={0.75} />
      </mesh>
      {/* Drooping Heavy Grain Panicles */}
      <mesh position={[0.06, 0.52, 0.04]} rotation={[0.3, 0, 0.4]} scale={[0.8, 1.8, 0.8]} castShadow>
        <sphereGeometry args={[0.14, 6, 6]} />
        <meshStandardMaterial color="#C0CA33" roughness={0.6} />
      </mesh>
    </group>
  );
}

// Procedural Crop Plant Selector
function CropPlant({ position, cropType, simMode }) {
  const meshRef = useRef();

  const isDrought = simMode === 'drought';
  const isPest = simMode === 'pest';

  const leafColor = isDrought 
    ? '#9E8842' // withered drought yellow
    : cropType === 'Wheat' 
    ? '#D4AF37' // golden wheat
    : isPest 
    ? '#795548' // pest infested brown
    : '#2E7D32'; // lush healthy Indian agricultural green

  // Dynamic natural wind sway animation
  useFrame(({ clock }) => {
    if (meshRef.current && simMode !== 'drought') {
      const t = clock.getElapsedTime();
      meshRef.current.rotation.z = Math.sin(t * 2.2 + position[0] * 1.5) * 0.04;
      meshRef.current.rotation.x = Math.cos(t * 1.8 + position[2] * 1.5) * 0.03;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {cropType === 'Tomato' && <TomatoModel leafColor={leafColor} isDrought={isDrought} />}
      {cropType === 'Brinjal' && <BrinjalModel leafColor={leafColor} isDrought={isDrought} />}
      {cropType === 'Chilli' && <ChilliModel leafColor={leafColor} isDrought={isDrought} />}
      {cropType === 'Onion' && <OnionModel leafColor={leafColor} isDrought={isDrought} />}
      {cropType === 'Cotton' && <CottonModel leafColor={leafColor} isDrought={isDrought} />}
      {cropType === 'Sugarcane' && <SugarcaneModel leafColor={leafColor} />}
      {cropType === 'Wheat' && <WheatModel leafColor={leafColor} />}
      {cropType === 'Rice' && <RiceModel leafColor={leafColor} />}

      {/* Pest stress alert indicator */}
      {isPest && (
        <mesh position={[0, 0.8, 0]}>
          <sphereGeometry args={[0.06, 6, 6]} />
          <meshBasicMaterial color="#FF1744" />
        </mesh>
      )}
    </group>
  );
}

// Procedural Crop Field with Soil Furrows & Drip Irrigation Lines
function CropField({ cropType, simMode, farmArea }) {
  const rowCount = Math.min(8, Math.max(5, Math.round(farmArea * 2.2)));
  const plantsPerRow = 10;

  const { plants, dripLines } = useMemo(() => {
    const pList = [];
    const dList = [];
    for (let r = 0; r < rowCount; r++) {
      const z = (r - rowCount / 2) * 1.1;
      dList.push(z);
      for (let p = 0; p < plantsPerRow; p++) {
        const x = (p - plantsPerRow / 2) * 0.75 - 1.5;
        pList.push({ id: `${r}-${p}`, pos: [x, 0, z] });
      }
    }
    return { plants: pList, dripLines: dList };
  }, [rowCount, plantsPerRow]);

  return (
    <group>
      {/* Drip Irrigation Pipes along rows */}
      {dripLines.map((z, idx) => (
        <group key={idx}>
          {/* Black Drip Tube */}
          <mesh position={[-1.5, 0.015, z]}>
            <cylinderGeometry args={[0.012, 0.012, plantsPerRow * 0.8, 5]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#212121" roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Plants */}
      {plants.map(plant => (
        <CropPlant 
          key={plant.id} 
          position={plant.pos} 
          cropType={cropType} 
          simMode={simMode} 
        />
      ))}
    </group>
  );
}

// Realistic Farmland Ground Soil with Furrows
function FarmSoil({ soilType }) {
  // Soil colors according to Indian agronomic classifications
  const soilColor = soilType.includes('Black') || soilType.includes('Regur') 
    ? '#2D2824' // Rich Black Cotton Soil (Regur)
    : soilType.includes('Red') 
    ? '#8D3F2D' // Iron-rich Red Soil
    : soilType.includes('Sandy') 
    ? '#B59E75' // Sandy Loam
    : '#4A3D2A'; // Fertile Alluvial Soil

  return (
    <group>
      {/* Main Ground Soil Plane */}
      <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[26, 26, 32, 32]} />
        <meshStandardMaterial color={soilColor} roughness={0.95} metalness={0.05} />
      </mesh>

      {/* Raised Furrow Mounds */}
      {[-3.3, -2.2, -1.1, 0, 1.1, 2.2, 3.3].map((z, idx) => (
        <mesh key={idx} position={[-1.5, 0.02, z]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[9, 0.45]} />
          <meshStandardMaterial color={soilColor} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Monsoon Rain Simulation Particles
function RainParticles() {
  const pointsRef = useRef();
  const count = 900;

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = Math.random() * 10;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return pos;
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= 0.35;
        if (positions[i * 3 + 1] < 0) {
          positions[i * 3 + 1] = 9;
        }
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count} 
          array={positions} 
          itemSize={3} 
        />
      </bufferGeometry>
      <pointsMaterial color="#81D4FA" size={0.07} transparent opacity={0.7} />
    </points>
  );
}

// Realistic Indian Rural Farmhouse: Proportioned, compact, proper rural masonry home
function FarmHouse({ position = [4.5, 0, -1.5], scale = 0.85 }) {
  return (
    <group position={position} scale={scale}>
      {/* 1. Stone Plinth Foundation (ओटा / Chabutara) */}
      <mesh position={[0, 0.08, 0.15]} castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.16, 2.2]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.9} />
      </mesh>

      {/* Front Entrance Steps */}
      <mesh position={[0, 0.04, 1.3]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.08, 0.3]} />
        <meshStandardMaterial color="#795548" roughness={0.9} />
      </mesh>

      {/* 2. Main House Walls (Lime-washed rural masonry) */}
      <mesh position={[0, 0.72, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.1, 1.25, 1.8]} />
        <meshStandardMaterial color="#FAF5EE" roughness={0.85} />
      </mesh>

      {/* 3. Gable End Walls (Triangular wall extensions on Left and Right) */}
      <mesh position={[-1.05, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0, 0.95, 0.55, 3]} />
        <meshStandardMaterial color="#FAF5EE" roughness={0.85} />
      </mesh>
      <mesh position={[1.05, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0, 0.95, 0.55, 3]} />
        <meshStandardMaterial color="#FAF5EE" roughness={0.85} />
      </mesh>

      {/* 4. Gabled Terracotta Clay Roof with Realistic Eave Overhangs */}
      {/* Front Pitch Slope */}
      <group position={[0, 1.6, 0.52]} rotation={[0.48, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.07, 1.25]} />
          <meshStandardMaterial color="#C84B31" roughness={0.55} />
        </mesh>
        {[-0.8, -0.4, 0, 0.4, 0.8].map((xOffset, idx) => (
          <mesh key={idx} position={[xOffset, 0.045, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 1.22, 5]} />
            <meshStandardMaterial color="#B03A2E" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Back Pitch Slope */}
      <group position={[0, 1.6, -0.52]} rotation={[-0.48, 0, 0]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[2.4, 0.07, 1.25]} />
          <meshStandardMaterial color="#C84B31" roughness={0.55} />
        </mesh>
        {[-0.8, -0.4, 0, 0.4, 0.8].map((xOffset, idx) => (
          <mesh key={idx} position={[xOffset, 0.045, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 1.22, 5]} />
            <meshStandardMaterial color="#B03A2E" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Central Ridge Beam Cap along the roof peak */}
      <mesh position={[0, 1.88, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 2.45, 8]} />
        <meshStandardMaterial color="#8D2918" roughness={0.5} />
      </mesh>

      {/* Brick/Stone Chimney on Roof */}
      <group position={[0.7, 1.7, -0.3]}>
        <mesh castShadow>
          <boxGeometry args={[0.26, 0.5, 0.26]} />
          <meshStandardMaterial color="#A04020" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.27, 0]}>
          <boxGeometry args={[0.32, 0.05, 0.32]} />
          <meshStandardMaterial color="#702815" roughness={0.8} />
        </mesh>
      </group>

      {/* 5. Front Veranda / Porch Overhang with Wooden Pillars */}
      <mesh position={[0, 1.15, 1.18]} rotation={[0.3, 0, 0]} castShadow>
        <boxGeometry args={[1.6, 0.05, 0.65]} />
        <meshStandardMaterial color="#C84B31" roughness={0.6} />
      </mesh>
      <mesh position={[-0.65, 0.55, 1.4]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 1.05, 8]} />
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </mesh>
      <mesh position={[0.65, 0.55, 1.4]} castShadow>
        <cylinderGeometry args={[0.035, 0.045, 1.05, 8]} />
        <meshStandardMaterial color="#5D4037" roughness={0.8} />
      </mesh>

      {/* 6. Wooden Door with rustic dark frame and brass handle */}
      <mesh position={[0, 0.52, 0.92]}>
        <boxGeometry args={[0.5, 0.9, 0.04]} />
        <meshStandardMaterial color="#4E342E" roughness={0.7} />
      </mesh>
      <mesh position={[0.16, 0.5, 0.95]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshStandardMaterial color="#FFB300" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* 7. Windows with wooden shutters */}
      <mesh position={[-0.6, 0.8, 0.92]}>
        <boxGeometry args={[0.36, 0.4, 0.04]} />
        <meshStandardMaterial color="#3E2723" roughness={0.8} />
      </mesh>
      <mesh position={[0.6, 0.8, 0.92]}>
        <boxGeometry args={[0.36, 0.4, 0.04]} />
        <meshStandardMaterial color="#3E2723" roughness={0.8} />
      </mesh>

      {/* 8. Solar Water Pump Panel */}
      <group position={[-1.45, 0.35, 0.7]} rotation={[-0.38, 0.25, 0]}>
        <mesh position={[0, -0.22, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.45, 6]} />
          <meshStandardMaterial color="#78909C" metalness={0.7} />
        </mesh>
        <mesh castShadow>
          <boxGeometry args={[0.8, 0.03, 0.55]} />
          <meshStandardMaterial color="#0D47A1" roughness={0.15} metalness={0.85} />
        </mesh>
      </group>
    </group>
  );
}

// Traditional Rural Farm Well (विहीर / कुआं) positioned in front of the farmhouse
function FarmWell({ position = [4.0, 0, 0.8], scale = 0.85 }) {
  return (
    <group position={position} scale={scale}>
      {/* 1. Cobblestone Base Surround Apron on Ground */}
      <mesh position={[0, 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[0.72, 0.82, 0.04, 16]} />
        <meshStandardMaterial color="#795548" roughness={0.95} />
      </mesh>

      {/* 2. Outer Circular Stone Well Wall */}
      <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.52, 0.55, 0.48, 16]} />
        <meshStandardMaterial color="#8D6E63" roughness={0.9} />
      </mesh>

      {/* 3. Well Stone Rim Coping */}
      <mesh position={[0, 0.51, 0]} castShadow>
        <torusGeometry args={[0.49, 0.06, 8, 18]} />
        <meshStandardMaterial color="#6D4C41" roughness={0.85} />
      </mesh>

      {/* 4. Deep Water Interior with reflective surface */}
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 16]} />
        <meshStandardMaterial color="#0288D1" roughness={0.15} metalness={0.65} />
      </mesh>

      {/* 5. Left Wooden Upright Post */}
      <mesh position={[-0.42, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 0.9, 8]} />
        <meshStandardMaterial color="#4E342E" roughness={0.9} />
      </mesh>

      {/* 6. Right Wooden Upright Post */}
      <mesh position={[0.42, 0.72, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.035, 0.9, 8]} />
        <meshStandardMaterial color="#4E342E" roughness={0.9} />
      </mesh>

      {/* 7. Top Crossbeam */}
      <mesh position={[0, 1.15, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.035, 0.035, 0.95, 8]} />
        <meshStandardMaterial color="#4E342E" roughness={0.9} />
      </mesh>

      {/* 8. Small Terracotta Well Shelter Roof */}
      <group position={[0, 1.28, 0]}>
        <mesh position={[-0.2, 0.06, 0]} rotation={[0, 0, 0.5]} castShadow>
          <boxGeometry args={[0.48, 0.025, 0.7]} />
          <meshStandardMaterial color="#C84B31" roughness={0.6} />
        </mesh>
        <mesh position={[0.2, 0.06, 0]} rotation={[0, 0, -0.5]} castShadow>
          <boxGeometry args={[0.48, 0.025, 0.7]} />
          <meshStandardMaterial color="#C84B31" roughness={0.6} />
        </mesh>
      </group>

      {/* 9. Pulley Wheel in Center */}
      <mesh position={[0, 1.06, 0]} castShadow>
        <cylinderGeometry args={[0.075, 0.075, 0.025, 12]} />
        <meshStandardMaterial color="#37474F" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* 10. Hanging Rope */}
      <mesh position={[0.03, 0.78, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.52, 6]} />
        <meshStandardMaterial color="#D7CCC8" roughness={0.9} />
      </mesh>

      {/* 11. Metal Water Bucket */}
      <group position={[0.03, 0.48, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.065, 0.048, 0.12, 10]} />
          <meshStandardMaterial color="#78909C" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <torusGeometry args={[0.055, 0.007, 6, 10, Math.PI]} />
          <meshStandardMaterial color="#455A64" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// Realistic Normal Indian Farm Shade Tree (Mango / Neem / Peepal archetype)
// Features sturdy woody trunk, natural branching, and dense multi-layered lush leafy canopy
function FarmShadeTree({ position = [0, 0, 0], scale = 1, rotationY = 0, foliageColor = "#1B5E20" }) {
  return (
    <group position={position} scale={scale} rotation={[0, rotationY, 0]}>
      {/* Root flare */}
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.32, 0.22, 8]} />
        <meshStandardMaterial color="#3E2723" roughness={0.95} />
      </mesh>

      {/* Main Sturdy Trunk */}
      <mesh position={[0, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.25, 1.7, 8]} />
        <meshStandardMaterial color="#4E342E" roughness={0.92} />
      </mesh>

      {/* Main Left Branch Fork */}
      <mesh position={[-0.22, 1.72, 0.08]} rotation={[0.28, 0, -0.52]} castShadow>
        <cylinderGeometry args={[0.10, 0.15, 0.95, 6]} />
        <meshStandardMaterial color="#4E342E" roughness={0.92} />
      </mesh>

      {/* Main Right Branch Fork */}
      <mesh position={[0.20, 1.76, -0.06]} rotation={[-0.25, 0, 0.48]} castShadow>
        <cylinderGeometry args={[0.10, 0.15, 0.95, 6]} />
        <meshStandardMaterial color="#4E342E" roughness={0.92} />
      </mesh>

      {/* Dense Multi-Layered Canopy Spheres */}
      {/* Central Dome */}
      <mesh position={[0, 2.65, 0]} scale={[1.32, 1.08, 1.32]} castShadow>
        <sphereGeometry args={[1.05, 8, 8]} />
        <meshStandardMaterial color={foliageColor} roughness={0.72} />
      </mesh>

      {/* Left Tier Cluster */}
      <mesh position={[-0.82, 2.30, 0.28]} scale={[1.05, 0.88, 1.05]} castShadow>
        <sphereGeometry args={[0.78, 7, 7]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.72} />
      </mesh>

      {/* Right Tier Cluster */}
      <mesh position={[0.82, 2.38, -0.25]} scale={[1.10, 0.90, 1.10]} castShadow>
        <sphereGeometry args={[0.80, 7, 7]} />
        <meshStandardMaterial color="#33691E" roughness={0.72} />
      </mesh>

      {/* Back Accent Tier */}
      <mesh position={[0, 2.45, -0.75]} scale={[0.98, 0.85, 0.98]} castShadow>
        <sphereGeometry args={[0.75, 7, 7]} />
        <meshStandardMaterial color="#1B5E20" roughness={0.72} />
      </mesh>

      {/* Top Peak Cluster */}
      <mesh position={[0.08, 3.25, 0.04]} scale={[0.85, 0.75, 0.85]} castShadow>
        <sphereGeometry args={[0.65, 7, 7]} />
        <meshStandardMaterial color="#388E3C" roughness={0.68} />
      </mesh>
    </group>
  );
}

// 3D Tree Perimeter: Strictly 3 sides (Back, Left, Right). Front side removed so camera view is completely open.
// All trees are realistic normal farm shade trees.
function FarmTrees() {
  return (
    <group>
      {/* 1. Behind the FarmHouse (Clusters of lush normal farm trees) */}
      <FarmShadeTree position={[4.6, 0, -3.8]} scale={1.15} foliageColor="#1B5E20" rotationY={0.8} />
      <FarmShadeTree position={[3.1, 0, -3.6]} scale={1.10} foliageColor="#2E7D32" rotationY={1.5} />
      <FarmShadeTree position={[6.2, 0, -3.4]} scale={1.20} foliageColor="#33691E" rotationY={2.2} />
      <FarmShadeTree position={[5.4, 0, -5.2]} scale={1.30} foliageColor="#2E7D32" rotationY={0.4} />
      <FarmShadeTree position={[7.1, 0, -4.8]} scale={1.05} foliageColor="#1B5E20" rotationY={2.8} />
      <FarmShadeTree position={[3.6, 0, -5.5]} scale={1.08} foliageColor="#33691E" rotationY={1.2} />

      {/* 2. Back Far Farmland Boundary (Z = -8.0 to -9.2) */}
      <FarmShadeTree position={[-7.5, 0, -8.3]} scale={1.25} foliageColor="#1B5E20" rotationY={0.5} />
      <FarmShadeTree position={[-5.3, 0, -8.5]} scale={1.15} foliageColor="#2E7D32" rotationY={1.9} />
      <FarmShadeTree position={[-3.1, 0, -8.2]} scale={1.28} foliageColor="#33691E" rotationY={2.4} />
      <FarmShadeTree position={[-0.8, 0, -8.6]} scale={1.20} foliageColor="#1B5E20" rotationY={0.8} />
      <FarmShadeTree position={[1.5, 0, -8.4]} scale={1.16} foliageColor="#2E7D32" rotationY={2.8} />
      <FarmShadeTree position={[-4.2, 0, -9.1]} scale={1.08} foliageColor="#1B5E20" rotationY={1.4} />
      <FarmShadeTree position={[-1.9, 0, -9.2]} scale={1.22} foliageColor="#33691E" rotationY={0.2} />

      {/* 3. Left Side Boundary (X = -8.0 to -9.0) */}
      <FarmShadeTree position={[-8.4, 0, -6.0]} scale={1.20} foliageColor="#2E7D32" rotationY={1.2} />
      <FarmShadeTree position={[-8.2, 0, -3.8]} scale={1.15} foliageColor="#1B5E20" rotationY={2.1} />
      <FarmShadeTree position={[-8.5, 0, -1.4]} scale={1.25} foliageColor="#33691E" rotationY={0.7} />
      <FarmShadeTree position={[-8.3, 0, 1.0]} scale={1.18} foliageColor="#2E7D32" rotationY={2.9} />
      <FarmShadeTree position={[-8.6, 0, 3.4]} scale={1.22} foliageColor="#1B5E20" rotationY={1.6} />

      {/* 4. Right Side Boundary (X = +8.0 to +9.0) */}
      <FarmShadeTree position={[8.4, 0, -1.4]} scale={1.18} foliageColor="#1B5E20" rotationY={2.0} />
      <FarmShadeTree position={[8.2, 0, 1.0]} scale={1.24} foliageColor="#2E7D32" rotationY={0.9} />
      <FarmShadeTree position={[8.5, 0, 3.4]} scale={1.15} foliageColor="#33691E" rotationY={2.6} />

      {/* NOTE: FRONT SIDE (Z > 0) HAS NO TREES SO THE CAMERA VIEW TOWARDS HOUSE AND CROPS IS FULLY UNOBSTRUCTED */}
    </group>
  );
}


// Active Camera Controller for Isometric, Top-Down, and Reset Views
function CameraController({ cameraView = 'iso', resetCounter = 0 }) {
  const { camera } = useThree();
  const controlsRef = useRef();

  const targetPos = useRef(new THREE.Vector3(7.5, 7.0, 8.5));
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));
  const isTransitioning = useRef(true);

  useEffect(() => {
    if (cameraView === 'top') {
      // Top-Down overhead bird's-eye view looking directly down onto the farm grid
      targetPos.current.set(0.001, 15.5, 0.001);
      targetLook.current.set(0, 0, 0);
      isTransitioning.current = true;
    } else {
      // Isometric View (or Reset)
      targetPos.current.set(7.5, 7.0, 8.5);
      targetLook.current.set(0, 0.2, 0);
      isTransitioning.current = true;
    }
  }, [cameraView, resetCounter]);

  useFrame(() => {
    if (isTransitioning.current && controlsRef.current) {
      camera.position.lerp(targetPos.current, 0.09);
      controlsRef.current.target.lerp(targetLook.current, 0.09);
      controlsRef.current.update();

      if (camera.position.distanceTo(targetPos.current) < 0.08) {
        camera.position.copy(targetPos.current);
        controlsRef.current.target.copy(targetLook.current);
        controlsRef.current.update();
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      maxPolarAngle={cameraView === 'top' ? Math.PI : Math.PI / 2.05}
      minDistance={3}
      maxDistance={25}
    />
  );
}

export default function FarmCanvas3D({ 
  cropType = 'Tomato', 
  soilType = 'Black Soil (Regur)', 
  farmArea = 2.4, 
  simMode = 'normal',
  cameraView = 'iso',
  resetCounter = 0
}) {
  const isRain = simMode === 'rain';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Canvas
        camera={{ position: [7.5, 7.0, 8.5], fov: 45 }}
        shadows
        style={{ width: '100%', height: '100%' }}
      >
        {/* Sky & Atmosphere */}
        <Sky 
          sunPosition={isRain ? [0, -10, 0] : [100, 45, 100]} 
          turbidity={isRain ? 12 : 6} 
          rayleigh={isRain ? 0.3 : 1.2} 
        />
        {!isRain && <Stars radius={80} depth={40} count={300} factor={3} />}

        {/* Lighting */}
        <ambientLight intensity={isRain ? 0.4 : 0.75} />
        <directionalLight 
          position={[10, 15, 8]} 
          intensity={isRain ? 0.5 : 1.4} 
          castShadow 
          shadow-mapSize={[1024, 1024]}
        />

        {/* Soil Base with Furrows */}
        <FarmSoil soilType={soilType} />

        {/* Realistic Crop Field */}
        <CropField cropType={cropType} simMode={simMode} farmArea={farmArea} />

        {/* Farm Infrastructure & Rural Landscape */}
        <FarmHouse />
        <FarmWell position={[4.0, 0, 0.8]} />
        <FarmTrees />

        {/* Rain Particles */}
        {isRain && <RainParticles />}

        {/* Dynamic Camera & Orbit Controller */}
        <CameraController cameraView={cameraView} resetCounter={resetCounter} />
      </Canvas>
    </div>
  );
}
