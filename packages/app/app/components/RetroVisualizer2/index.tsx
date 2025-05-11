import React, { useEffect, useRef, useState } from 'react';
import butterchurn from 'butterchurn';
import butterchurnPresets from 'butterchurn-presets';

type Props = {
  analyserNode: AnalyserNode;
};

const Visualizer2: React.FC<Props> = ({ analyserNode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const audioCtx = analyserNode.context;

    const visualizer = butterchurn.createVisualizer(audioCtx, canvas, {
      width: canvas.width,
      height: canvas.height,
      textureRatio: window.devicePixelRatio || 1,
    });

    const presets = butterchurnPresets.getPresets();
    const preset = presets['YING YANG'] || Object.values(presets)[0];
    try {
    visualizer.connectAudio(analyserNode);
    visualizer.loadPreset(preset, 0.0);
  }catch (e) {}
    let id: number;
    const render = () => {
      visualizer.render();
      id = requestAnimationFrame(render);
    };
    render();
    setStarted(true);

 
    return () => cancelAnimationFrame(id);
  }, [analyserNode]);

  return (
    <div style={{ background: 'black', height: '100vh', width: '100vw' }}>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ display: 'block' }}
      />
      {!started && (
        <p style={{ color: 'white' }}>Initialisation du visualiseur...</p>
      )}
    </div>
  );
};

export default Visualizer2;
