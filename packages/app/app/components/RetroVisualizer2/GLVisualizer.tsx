import React, { useEffect, useRef } from 'react';

type Props = {
  analyserNode: AnalyserNode;
};

const vertexShaderSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;
  uniform float time;
  uniform float audioLevel;

  void main() {
    vec2 uv = gl_FragCoord.xy / vec2(800.0, 600.0);
    float wave = sin((uv.x + time) * 10.0) * 0.1 + 0.5;
    float brightness = smoothstep(wave - 0.02, wave + 0.02, uv.y);
    brightness *= audioLevel;
    gl_FragColor = vec4(vec3(brightness), 1.0);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

export default function GLVisualizer({ analyserNode }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext('webgl')!;
    if (!gl) return;

    const vs = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const posAttrib = gl.getAttribLocation(program, 'position');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1
    ]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    const timeLoc = gl.getUniformLocation(program, 'time');
    const audioLoc = gl.getUniformLocation(program, 'audioLevel');
    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);

    let start = performance.now();
    function render() {
      const now = performance.now();
      const time = (now - start) / 1000;

      analyserNode.getByteFrequencyData(dataArray);
      const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;

      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(timeLoc, time);
      gl.uniform1f(audioLoc, avg / 255);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      requestAnimationFrame(render);
    }

    render();
  }, [analyserNode]);

  return <canvas ref={canvasRef} width={800} height={600} />;
}
