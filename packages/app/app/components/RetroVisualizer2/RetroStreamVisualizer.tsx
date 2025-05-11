import React, { useEffect, useRef, useState } from 'react';
import { getAudioGraph } from '@nuclear/ui';
import {
  faBroadcastTower, faGamepad, faMusic, faHeadphones, faGlobe,
  faLeaf, faSatelliteDish, faExpand, faCompress, faVolumeUp
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';

const STREAMS = {
  'Radio Nintendo': { url: 'https://r-a-d.io/main.mp3', icon: faGamepad },
  'KEXP 90.3 FM': { url: 'https://kexp.streamguys1.com/kexp160.aac', icon: faMusic },
  'KCRW': { url: 'https://streams.kcrw.com/e24_mp3', icon: faMusic },
  'The Current': { url: 'http://current.stream.publicradio.org/kcmp.mp3', icon: faBroadcastTower },
  'CVGM': { url: 'http://cvgm.net/stream/', icon: faMusic },
  'SLAY Radio': { url: 'http://s1.slotex.pl:8000/slay', icon: faHeadphones },
  'SomaFM': { url: 'https://ice1.somafm.com/groovesalad-128-mp3', icon: faLeaf },
  'FIP': { url: 'https://icecast.radiofrance.fr/fip-midfi.mp3', icon: faMusic },
  'Radio Paradise': { url: 'https://stream.radioparadise.com/mp3-192', icon: faGlobe },
  'Japan-A-Radio': { url: 'http://japanaradio.com:8000/stream/1/', icon: faSatelliteDish }
};

const RetroStreamVisualizer: React.FC = () => {
   const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [currentStream, setCurrentStream] = useState(STREAMS['Radio Nintendo'].url);
  const [volume, setVolume] = useState(0.7);
  const [trackTitle, setTrackTitle] = useState('Titre inconnu');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const fullscreen = useFullScreenHandle();

  useEffect(() => {
    const { audioContext, previousNode } = getAudioGraph();
    if (!audioContext || !previousNode || !currentStream) {
      try {
        const analyser = audioContext.createAnalyser();
        previousNode.connect(analyser);
        analyser.connect(audioContext.destination);
  
        setAnalyserNode(analyser);
    } catch (e) {
      console.warn('Analyser déjà connecté ?');
    }
    }

    const audio = new Audio(currentStream);
    audio.crossOrigin = 'anonymous';
    audio.loop = true;
    audio.play();

    const context = new AudioContext();
    contextRef.current = context;

    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    gainNode.gain.value = volume;

    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(context.destination);

    analyserRef.current = analyser;
    gainNodeRef.current = gainNode;
    audioRef.current = audio;

    // Initialiser le titre dès le chargement
    const onLoadedMetadata = () => {
      const station = Object.entries(STREAMS).find(([_, { url }]) => url === currentStream)?.[0];
      setTrackTitle(`🎶 En écoute : ${station || 'Station inconnue'}`);
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    onLoadedMetadata();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const centerY = canvas.height / 2;
    const centerX = canvas.width / 2;
    const radius = 70;

    function render() {
      requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Barres
      const barWidth = canvas.width / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const h = dataArray[i];
        const hue = (i / bufferLength) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        ctx.fillRect(x, canvas.height - h, barWidth - 1, h);
        x += barWidth;
      }

      // Cercle
      /*ctx.beginPath();
      for (let i = 0; i < bufferLength; i++) {
        const angle = (i / bufferLength) * 2 * Math.PI;
        const r = radius + dataArray[i] * 0.5;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      */
    }

    render();

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.pause();
      audio.src = '';
      context.close();
    };
  }, [currentStream]);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  return (
    <FullScreen handle={fullscreen}>
      <div style={{ background: '#111', color: '#fff', height: '100%', padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>🎧 Retro world music</h3>
          <button onClick={fullscreen.active ? fullscreen.exit : fullscreen.enter} style={{ background: 'none', border: 'none', color: '#fff' }}>
            <FontAwesomeIcon icon={fullscreen.active ? faCompress : faExpand} size="lg" />
          </button>
        </div>

        {/* Radios */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginBottom: '1rem' }}>
          {Object.entries(STREAMS).map(([name, { url, icon }]) => (
            <button
              key={url}
              onClick={() => setCurrentStream(url)}
              style={{
                backgroundColor: currentStream === url ? '#1db954' : '#222',
                border: 'none',
                borderRadius: '12px',
                padding: '1rem',
                color: '#fff',
                width: '120px',
                height: '120px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: currentStream === url ? '0 0 10px #1db954' : '0 0 5px #000'
              }}
            >
              <FontAwesomeIcon icon={icon} size="2x" />
              <span style={{ marginTop: '0.5rem', fontSize: '0.9rem', textAlign: 'center' }}>{name}</span>
            </button>
          ))}
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          width={window.innerWidth}
          height={300}
          style={{
            display: 'block',
            backgroundColor: '#000',
            borderRadius: '12px',
            boxShadow: '0 0 20px #222'
          }}
        />

        {/* Titre radio */}
        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '1.1rem', color: '#1db954' }}>
          {trackTitle}
        </div>

        {/* Volume */}
        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <label style={{ marginRight: '0.5rem' }}>
            <FontAwesomeIcon icon={faVolumeUp} /> Volume :
          </label>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(e) => setVolume(Number(e.target.value))}
            style={{ width: '200px' }}
          />
        </div>
      </div>
    </FullScreen>
  );
};

export default RetroStreamVisualizer;
