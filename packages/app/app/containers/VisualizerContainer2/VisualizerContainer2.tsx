import React, { useEffect, useState, useRef } from 'react';
import Visualizer2 from '../../components/RetroVisualizer2/RetroStreamVisualizer'
import { getAudioGraph } from '@nuclear/ui'; // adapte le chemin

const VisualizerContainer2: React.FC = () => {
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const { audioContext, previousNode } = getAudioGraph();
    if (!audioContext || !previousNode || analyserNodeRef.current) return;
    try {
      previousNode.disconnect(analyserNodeRef.current);
      analyserNodeRef.current.disconnect();
    } catch (e) {
      console.warn('Erreur lors de la déconnexion (probablement déjà nettoyé)', e);
    }
    try {
      const analyser = audioContext.createAnalyser();
      previousNode.connect(analyser);
      analyser.connect(audioContext.destination);
  
      analyserNodeRef.current = analyser;
      setAnalyserNode(analyser);
  } catch (e) {
    console.warn('Analyser déjà connecté ?');
  }
  }, []);
  

  //if (!analyserNode) return <p style={{ color: 'white' }}>Chargement du visualiseur…</p>;

  return <Visualizer2 />;
};

export default VisualizerContainer2;