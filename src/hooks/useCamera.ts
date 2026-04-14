import { useState, useEffect, useCallback } from 'react';

export function useCamera() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');

  const startCamera = useCallback(async (deviceId?: string, mode?: 'user' | 'environment') => {
    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } } 
          : { facingMode: mode || facingMode, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setError(null);

      if (mode) setFacingMode(mode);

      // Get available devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
      setDevices(videoDevices);
      
      const activeTrack = newStream.getVideoTracks()[0];
      const settings = activeTrack.getSettings();
      if (settings.deviceId) {
        setActiveDeviceId(settings.deviceId);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera permission denied or not available.');
    }
  }, [stream, facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const switchCamera = useCallback(() => {
    const nextMode = facingMode === 'user' ? 'environment' : 'user';
    startCamera(undefined, nextMode);
  }, [facingMode, startCamera]);

  const setCameraById = useCallback((deviceId: string) => {
    startCamera(deviceId);
  }, [startCamera]);

  return { stream, error, devices, activeDeviceId, facingMode, switchCamera, setCameraById, startCamera };
}
