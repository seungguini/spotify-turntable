import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import Turntable from './components/3d/Turntable';
import './App.css';

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
          <Turntable 
            isPlaying={isPlaying} 
            onToneArmFinished={handleToneArmFinished} 
          />
          
          {/* Environment and controls */}
          <Environment preset="apartment" />
          <OrbitControls 
            enableZoom={true} 
            enablePan={true} 
            minPolarAngle={Math.PI / 6}
            maxPolarAngle={Math.PI / 2}
          />
        </Canvas>
      </div>
    </div>
  );
}

export default App;