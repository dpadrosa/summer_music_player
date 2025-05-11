import React, { useEffect, useRef, useState } from 'react';
import {
  faBroadcastTower,
  faGamepad,
  faMusic,
  faHeadphones
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const STREAMS = {
  Rainwave: {
    url: 'https://stream.rainwave.cc:8000/all.mp3',
    icon: faBroadcastTower
  },
  'Radio Nintendo': {
    url: 'https://r-a-d.io/main.mp3',
    icon: faGamepad
  },
  CVGM: {
    url: 'http://cvgm.net/stream/',
    icon: faMusic
  },
  'SLAY Radio': {
    url: 'http://s1.slotex.pl:8000/slay',
    icon: faHeadphones
  },  'Rainwave': { url: 'https://stream.rainwave.cc:8000/all.mp3', icon: faBroadcastTower },
  'SomaFM – Groove Salad': { url: 'https://ice1.somafm.com/groovesalad-128-mp3', icon: faLeaf },
  'FIP': { url: 'https://icecast.radiofrance.fr/fip-midfi.mp3', icon: faMusic },
  'Japan-A-Radio': { url: 'http://japanaradio.com:8000/stream/1/', icon: faHeadphones },
  'Radio Paradise': { url: 'https://stream.radioparadise.com/mp3-192', icon: faGlobe }
};

export default function RetroStreamVisualizer({ analyserNode }) {
  const audioRef = useRef(null);
  const contextRef = useRef(null);
  const [currentStream, setCurrentStream] = useState(STREAMS['Rainwave'].url);

  useEffect(() => {
    if (!currentStream) return;

    const audio = new Audio(currentStream);
    audio.crossOrigin = 'anonymous';
    audio.loop = true;
    audio.play();

    const context = new (window.AudioContext || window.webkitAudioContext)();
    contextRef.current = context;

    const source = context.createMediaElementSource(audio);
    source.connect(analyserNode);
    analyserNode.connect(context.destination);

    audioRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
      contextRef.current?.close();
    };
  }, [currentStream]);

  const handleStreamChange = (url) => {
    setCurrentStream(url);
  };

  return (
    <div style={{ padding: '1rem', backgroundColor: '#111', color: '#fff' }}>
      <h3 style={{ marginBottom: '1rem' }}>🎮 Choisis ta radio rétro</h3>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {Object.entries(STREAMS).map(([name, { url, icon }]) => (
          <button
            key={url}
            onClick={() => handleStreamChange(url)}
            style={{
              background: currentStream === url ? '#1db954' : '#222',
              border: 'none',
              borderRadius: '10px',
              padding: '1rem',
              color: '#fff',
              fontSize: '1.2rem',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: currentStream === url ? '0 0 10px #1db954' : '0 0 4px #444',
              transition: 'all 0.2s ease'
            }}
          >
            <FontAwesomeIcon icon={icon} size="2x" />
            <span style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>{name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
