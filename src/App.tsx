import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import './App.css';

// Type for the GLB model nodes
interface TurntableGLTF extends THREE.Object3D {
  nodes: {
    [key: string]: THREE.Mesh;
  };
  materials: {
    [key: string]: THREE.Material;
  };
}

// Context types
type ToneArmFinishedCallbackType = (finished: boolean) => void;

// Turntable component that uses the GLB file
function Turntable() {
  const group = useRef<THREE.Group>(null);
  const modelLocation = "/models/turntable.glb";
  const { nodes, materials, animations } = useGLTF(modelLocation) as unknown as TurntableGLTF;
  const { actions } = useAnimations(animations, group);
  
  const [hovering, setHovering] = useState<boolean>(false);
  const [toneArmFinished, setToneArmFinished] = useState<boolean>(false);
  
  // Get isPlaying state from parent component
  const isPlaying = usePlayState();
  
  // Get ToneArmFinished callback from context
  const onToneArmFinished = useToneArmFinishedCallback();
  
  // Initialize animations
  useEffect(() => {
    const toneArmAction = actions["Tone ArmAction.003"];
    
    if (toneArmAction) {
      toneArmAction.clampWhenFinished = true;
      toneArmAction.paused = true;
      toneArmAction.timeScale = 1;
      toneArmAction.setLoop(THREE.LoopOnce, 1);
      toneArmAction.play();
    }
  }, [actions]);
  
  // Control tone arm animation based on play state
  useEffect(() => {
    const toneArmAction = actions["Tone ArmAction.003"];
    
    if (toneArmAction) {
      setToneArmFinished(false);
      
      if (isPlaying) {
        toneArmAction.setEffectiveTimeScale(1);
        toneArmAction.paused = false;
        toneArmAction.clampWhenFinished = true;
      } else {
        toneArmAction.setEffectiveTimeScale(-1);
        toneArmAction.paused = false;
        toneArmAction.clampWhenFinished = true;
      }
      
      // Let the App know that the tone arm finished (the needle is set on the record)
      // so the audio can start playing
      const mixer = toneArmAction.getMixer();
      mixer.addEventListener("finished", () => {
        setToneArmFinished(true);
        onToneArmFinished(true);
      });
      
      return () => {
        mixer.removeEventListener("finished", () => {
          setToneArmFinished(true);
          onToneArmFinished(true);
        });
      };
    }
  }, [isPlaying, actions, onToneArmFinished]);
  
  // Update cursor style based on hover state
  useEffect(() => {
    document.body.style.cursor = hovering ? "pointer" : "auto";
  }, [hovering]);
  
  // Constants for positioning the turntable
  const TURNTABLE_SCALE = 1.3;
  const TURNTABLE_ROTATION: [number, number, number] = [0.5, 0.5, -0.25];
  const TURNTABLE_POSITION: [number, number, number] = [0, -0.24, 0];
  
  return (
    <group
      ref={group}
      scale={TURNTABLE_SCALE}
      rotation={TURNTABLE_ROTATION}
      position={TURNTABLE_POSITION}
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      <group name="Scene">
        <group name="Plinth" position={[-0.62, 0, -0.86]}>
          <mesh
            name="Cube"
            castShadow
            receiveShadow
            geometry={nodes.Cube.geometry}
            material={nodes.Cube.material}
          />
          <mesh
            name="Cube_1"
            castShadow
            receiveShadow
            geometry={nodes.Cube_1.geometry}
            material={nodes.Cube_1.material}
          />
          <mesh
            name="Cube_2"
            castShadow
            receiveShadow
            geometry={nodes.Cube_2.geometry}
            material={materials["Body- Edges"]}
          />
        </group>
        <group
          name="Case_Cover"
          position={[-0.02, 0.34, -1.66]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[1, 0.79, 1]}
        >
          <mesh
            name="Cube001"
            castShadow
            receiveShadow
            geometry={nodes.Cube001.geometry}
            material={nodes.Cube001.material}
          />
          <mesh
            name="Cube001_1"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_1.geometry}
            material={materials["Intter Yellow"]}
          />
          <mesh
            name="Cube001_2"
            castShadow
            receiveShadow
            geometry={nodes.Cube001_2.geometry}
            material={materials["Material.001"]}
          />
        </group>
        <mesh
          name="Record"
          castShadow
          receiveShadow
          geometry={nodes.Record.geometry}
          material={nodes.Record.material}
          position={[-0.33, -0.7, -0.52]}
          scale={0.97}
        />
        <mesh
          name="Platter"
          castShadow
          receiveShadow
          geometry={nodes.Platter.geometry}
          material={nodes.Platter.material}
          position={[-0.33, -0.66, -0.52]}
          scale={[0.76, 0.98, 0.76]}
        />
        <mesh
          name="Center_Swivel_Album"
          castShadow
          receiveShadow
          geometry={nodes.Center_Swivel_Album.geometry}
          material={nodes.Center_Swivel_Album.material}
          position={[-0.33, -0.57, -0.52]}
          scale={0.97}
        />
        <mesh
          name="Album_inner_cover"
          castShadow
          receiveShadow
          geometry={nodes.Album_inner_cover.geometry}
          material={materials["Album Red"]}
          position={[-0.33, 0.16, -0.52]}
          scale={0.23}
        />
        <mesh
          name="Record003"
          castShadow
          receiveShadow
          geometry={nodes.Record003.geometry}
          material={materials["Album Inner"]}
          position={[-0.33, 0.71, -0.52]}
          scale={[0.46, 0.23, 0.46]}
        />
        <mesh
          name="Arm_Top_Base"
          castShadow
          receiveShadow
          geometry={nodes.Arm_Top_Base.geometry}
          material={nodes.Arm_Top_Base.material}
          position={[1.09, 0.26, -1.18]}
          scale={0.47}
        />
        <group
          name="Tone_Arm"
          position={[1.08, 0.66, -1.19]}
          rotation={[0, 0.02, 0]}
          scale={0.3}
        >
          <mesh
            name="Cylinder005"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder005.geometry}
            material={materials["Tone Arm"]}
          />
          <mesh
            name="Cylinder005_1"
            castShadow
            receiveShadow
            geometry={nodes.Cylinder005_1.geometry}
            material={nodes.Cylinder005_1.material}
          />
        </group>
      </group>
    </group>
  );
}

// Preload the GLB file
useGLTF.preload("/models/turntable.glb");

// Context for state management (all in one file)
const PlayStateContext = React.createContext<boolean>(false);
const ToneArmFinishedCallbackContext = React.createContext<ToneArmFinishedCallbackType>(() => {});

// Hooks to access context values
const usePlayState = () => React.useContext(PlayStateContext);
const useToneArmFinishedCallback = () => React.useContext(ToneArmFinishedCallbackContext);

// Main App component
function App() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [isToneArmFinished, setIsToneArmFinished] = useState<boolean>(false);
  
  // Initialize audio element
  useEffect(() => {
    const audio = new Audio('/audio/sample-track.mp3'); // Replace with your audio file
    setAudioElement(audio);
    
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, []);
  
  // Handle audio playback based on turntable state
  useEffect(() => {
    if (!audioElement) return;
    
    // Only play the audio when the tone arm is in position
    if (isPlaying && isToneArmFinished) {
      audioElement.play().catch(err => {
        console.error("Error playing audio:", err);
      });
    } else {
      audioElement.pause();
    }
  }, [isPlaying, audioElement, isToneArmFinished]);
  
  // Toggle play/pause
  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Callback for when tone arm animation is finished
  const handleToneArmFinished = (finished: boolean) => {
    setIsToneArmFinished(finished);
  };
  
  return (
    <div className="app-container">
      <div className="controls">
        <button 
          onClick={togglePlayback}
          className={`playback-button ${isPlaying ? 'playing' : ''}`}
        >
          {isPlaying ? 'Pause' : 'Play'}
        </button>
      </div>
      
      <div className="canvas-container">
        <PlayStateContext.Provider value={isPlaying}>
          <ToneArmFinishedCallbackContext.Provider value={handleToneArmFinished}>
            <Canvas shadows dpr={[1, 2]}>
              {/* Camera setup */}
              <PerspectiveCamera makeDefault position={[0, 6, 10]} />
              
              {/* Scene lighting */}
              <ambientLight intensity={0.5} />
              <directionalLight 
                position={[10, 10, 5]} 
                intensity={1} 
                castShadow 
                shadow-mapSize-width={2048} 
                shadow-mapSize-height={2048} 
              />
              <spotLight position={[-10, 10, -5]} intensity={0.5} castShadow />
              
              {/* The turntable component */}
              <Turntable />
              
              {/* Environment and controls */}
              <Environment preset="apartment" />
              <OrbitControls 
                enableZoom={true} 
                enablePan={true} 
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2}
              />
            </Canvas>
          </ToneArmFinishedCallbackContext.Provider>
        </PlayStateContext.Provider>
      </div>
    </div>
  );
}

export default App;