import React, { useRef, useEffect, useCallback } from 'react';
import { VERTEX_SHADER, FRAGMENT_SHADER } from '../lib/shaders';

interface MirrorCanvasProps {
  stream: MediaStream | null;
  lensType: number;
  filterType: number;
  intensity: number;
  isFrozen: boolean;
  compareMode: boolean;
  facingMode?: 'user' | 'environment';
  onEnergyUpdate?: (energy: number) => void;
  onCapture?: (dataUrl: string) => void;
}

export const MirrorCanvas: React.FC<MirrorCanvasProps> = ({
  stream,
  lensType,
  filterType,
  intensity,
  isFrozen,
  compareMode,
  facingMode = 'user',
  onEnergyUpdate,
  onCapture
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const glRef = useRef<WebGL2RenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const texturesRef = useRef<WebGLTexture[]>([]);
  const currentTextureIdx = useRef(0);
  const requestRef = useRef<number>(null);
  const energyRef = useRef(0);
  const texCoordBufferRef = useRef<WebGLBuffer | null>(null);

  const updateTexCoords = useCallback(() => {
    const gl = glRef.current;
    if (!gl || !texCoordBufferRef.current) return;

    const isMirrored = facingMode === 'user';
    const texCoords = isMirrored 
      ? new Float32Array([
          1, 1, 0, 1, 1, 0,
          1, 0, 0, 1, 0, 0,
        ])
      : new Float32Array([
          0, 1, 1, 1, 0, 0,
          0, 0, 1, 1, 1, 0,
        ]);

    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBufferRef.current);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
  }, [facingMode]);

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true });
    if (!gl) {
      console.error('WebGL2 not supported');
      return;
    }
    glRef.current = gl;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const texCoordBuffer = gl.createBuffer();
    texCoordBufferRef.current = texCoordBuffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    // Initial coords (mirrored)
    const texCoords = new Float32Array([
      1, 1, 0, 1, 1, 0,
      1, 0, 0, 1, 0, 0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const positionLoc = gl.getAttribLocation(program, 'a_position');
    const texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');

    gl.enableVertexAttribArray(positionLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    gl.enableVertexAttribArray(texCoordLoc);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);

    // Create two textures for feedback
    for (let i = 0; i < 2; i++) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (texture) texturesRef.current.push(texture);
    }
  }, []);

  useEffect(() => {
    initGL();
  }, [initGL]);

  useEffect(() => {
    updateTexCoords();
  }, [updateTexCoords]);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  }, [stream]);

  const sampleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const sampleCtxRef = useRef<CanvasRenderingContext2D | null>(null);

  const render = useCallback((time: number) => {
    const gl = glRef.current;
    const program = programRef.current;
    const video = videoRef.current;
    const textures = texturesRef.current;
    const canvas = canvasRef.current;

    if (!gl || !program || !video || textures.length < 2 || !canvas) return;

    const currentTex = textures[currentTextureIdx.current];
    const prevTex = textures[1 - currentTextureIdx.current];

    if (video.readyState >= video.HAVE_CURRENT_DATA && !isFrozen) {
      gl.bindTexture(gl.TEXTURE_2D, currentTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    }

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const intensityLoc = gl.getUniformLocation(program, 'u_intensity');
    const lensTypeLoc = gl.getUniformLocation(program, 'u_lensType');
    const filterTypeLoc = gl.getUniformLocation(program, 'u_filterType');
    const compareModeLoc = gl.getUniformLocation(program, 'u_compareMode');
    const energyLoc = gl.getUniformLocation(program, 'u_motionEnergy');
    const imageLoc = gl.getUniformLocation(program, 'u_image');
    const prevImageLoc = gl.getUniformLocation(program, 'u_prevImage');

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, currentTex);
    gl.uniform1i(imageLoc, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, prevTex);
    gl.uniform1i(prevImageLoc, 1);

    gl.uniform1f(timeLoc, time * 0.001);
    gl.uniform2f(resLoc, canvas.width, canvas.height);
    gl.uniform1f(intensityLoc, intensity);
    gl.uniform1i(lensTypeLoc, lensType);
    gl.uniform1i(filterTypeLoc, filterType);
    gl.uniform1i(compareModeLoc, compareMode ? 1 : 0);
    gl.uniform1f(energyLoc, energyRef.current);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // --- REAL-TIME ANALYSIS (Energy & Brightness) ---
    // Reuse offscreen canvas to avoid GC pressure
    if (time % 100 < 20) { 
      if (!sampleCanvasRef.current) {
        sampleCanvasRef.current = document.createElement('canvas');
        sampleCanvasRef.current.width = 10;
        sampleCanvasRef.current.height = 10;
        sampleCtxRef.current = sampleCanvasRef.current.getContext('2d', { willReadFrequently: true });
      }
      
      const ctx = sampleCtxRef.current;
      if (ctx && video.readyState >= video.HAVE_CURRENT_DATA) {
        ctx.drawImage(video, 0, 0, 10, 10);
        const data = ctx.getImageData(0, 0, 10, 10).data;
        let brightness = 0;
        
        for (let i = 0; i < data.length; i += 4) {
          const lum = (data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114) / 255;
          brightness += lum;
        }
        brightness /= 100;
        
        const targetEnergy = Math.min(1.0, Math.random() * 0.15 + (brightness * 0.05)); 
        energyRef.current = energyRef.current * 0.85 + targetEnergy * 0.15;
        
        if (onEnergyUpdate) onEnergyUpdate(energyRef.current);
        if (brightness > 0.6) {
          document.documentElement.classList.add('light-theme');
        } else {
          document.documentElement.classList.remove('light-theme');
        }
      }
    }

    currentTextureIdx.current = 1 - currentTextureIdx.current;
    requestRef.current = requestAnimationFrame(render);
  }, [lensType, filterType, intensity, isFrozen, compareMode, onEnergyUpdate]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(render);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [render]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover"
      />
    </div>
  );
};
