"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { bufferToWav } from "@/lib/audio";

interface AudioEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  audioUrl: string | null;
  onSave: (file: File, newUrl: string) => void;
}

export function AudioEditor({
  open,
  onOpenChange,
  audioUrl,
  onSave,
}: AudioEditorProps) {
  const [audioBuffer, setAudioBuffer] = useState<AudioBuffer | null>(null);
  const [trimRange, setTrimRange] = useState<[number, number]>([0, 100]);
  const [gain, setGain] = useState<number>(1); // Default 100% volume
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformColor, setWaveformColor] = useState("#000000");

  const contextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const trimRangeRef = useRef(trimRange);
  const gainRef = useRef(gain);

  const playbackStartTimeRef = useRef<number | null>(null);
  const playbackStartOffsetRef = useRef<number>(0);

  useEffect(() => {
    trimRangeRef.current = trimRange;
    gainRef.current = gain;

    if (gainNodeRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        gain,
        contextRef.current?.currentTime || 0,
      );
    }
  }, [trimRange, gain]);

  useEffect(() => {
    if (open) {
      const temp = document.createElement("div");
      temp.style.color = "var(--primary)";
      temp.style.display = "none";
      document.body.appendChild(temp);
      const style = window.getComputedStyle(temp);
      if (style.color) setWaveformColor(style.color);
      document.body.removeChild(temp);
    }
  }, [open]);

  useEffect(() => {
    if (open && audioUrl) {
      loadAudio(audioUrl);
    } else {
      cleanup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, audioUrl]);

  const loadAudio = async (url: string) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      contextRef.current = ctx;
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      setAudioBuffer(decoded);
      setTrimRange([0, 100]);
      setGain(1); // Reset volume
      setTimeout(() => requestAnimationFrame(draw), 50);
    } catch (e) {
      console.error(e);
    }
  };

  const cleanup = () => {
    stopPlayback();
    if (contextRef.current) {
      contextRef.current.close();
      contextRef.current = null;
    }
    setAudioBuffer(null);
  };

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas || !audioBuffer) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    if (
      canvas.width !== rect.width * dpr ||
      canvas.height !== rect.height * dpr
    ) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.resetTransform();
    ctx.scale(dpr, dpr);
    const w = rect.width;
    const h = rect.height;

    ctx.clearRect(0, 0, w, h);

    const data = audioBuffer.getChannelData(0);
    const step = Math.ceil(data.length / w);

    // SCALE AMPLITUDE BY GAIN
    // We visually clamp it to h/2 so it doesn't look broken if volume is huge
    const visualGain = gainRef.current;
    const amp = (h / 2) * visualGain;

    ctx.beginPath();
    ctx.strokeStyle = waveformColor;
    ctx.lineWidth = 2;

    for (let i = 0; i < w; i++) {
      let min = 1.0,
        max = -1.0;
      for (let j = 0; j < step; j++) {
        const datum = data[i * step + j];
        if (datum < min) min = datum;
        if (datum > max) max = datum;
      }

      // Calculate height with gain applied
      const yMin = (1 + min) * amp;
      const yMax = Math.max(1, (max - min) * amp) + yMin;

      // Center the wave if gain shrinks it, clamp if it explodes
      // (Simple centering logic: the math (1+min)*amp is based on 0..2 range mapped to height)
      // To keep it centered properly with variable gain:
      const center = h / 2;
      const valMin = center + min * amp;
      const valMax = center + max * amp;

      ctx.moveTo(i, valMin);
      ctx.lineTo(i, valMax);
    }
    ctx.stroke();

    const startX = (trimRangeRef.current[0] / 100) * w;
    const endX = (trimRangeRef.current[1] / 100) * w;

    ctx.fillStyle = "rgba(0,0,0,0.5)";
    if (startX > 0) ctx.fillRect(0, 0, startX, h);
    if (endX < w) ctx.fillRect(endX, 0, w - endX, h);

    ctx.fillStyle = "white";
    ctx.fillRect(startX, 0, 1, h);
    ctx.fillRect(endX - 1, 0, 1, h);

    if (contextRef.current && playbackStartTimeRef.current !== null) {
      const elapsed =
        contextRef.current.currentTime - playbackStartTimeRef.current;
      const startOffset =
        (playbackStartOffsetRef.current / 100) * audioBuffer.duration;
      const currentPos = startOffset + elapsed;
      const cursorX = (currentPos / audioBuffer.duration) * w;

      if (cursorX <= endX && cursorX >= startX) {
        ctx.beginPath();
        ctx.strokeStyle = "#ef4444";
        ctx.lineWidth = 2;
        ctx.moveTo(cursorX, 0);
        ctx.lineTo(cursorX, h);
        ctx.stroke();
      }
    }
  };

  const animate = () => {
    draw();
    if (playbackStartTimeRef.current !== null) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };

  const togglePlay = () => {
    if (!contextRef.current || !audioBuffer) return;

    if (isPlaying) {
      stopPlayback();
    } else {
      const ctx = contextRef.current;

      // Audio Graph: Source -> GainNode -> Destination
      const source = ctx.createBufferSource();
      const gainNode = ctx.createGain();

      source.buffer = audioBuffer;
      gainNode.gain.value = gainRef.current; // Set current volume

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      const duration = audioBuffer.duration;
      const startPct = trimRangeRef.current[0];
      const endPct = trimRangeRef.current[1];
      const startTime = (startPct / 100) * duration;
      const endTime = (endPct / 100) * duration;

      if (endTime - startTime <= 0) return;

      source.start(0, startTime, endTime - startTime);

      sourceRef.current = source;
      gainNodeRef.current = gainNode;

      playbackStartTimeRef.current = ctx.currentTime;
      playbackStartOffsetRef.current = startPct;

      setIsPlaying(true);
      animate();

      source.onended = () => stopPlayback();
    }
  };

  const stopPlayback = () => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop();
      } catch {}
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }

    setIsPlaying(false);
    playbackStartTimeRef.current = null;
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    requestAnimationFrame(draw);
  };

  const handleSave = () => {
    if (!audioBuffer) return;
    const duration = audioBuffer.duration;
    const start = (trimRangeRef.current[0] / 100) * duration;
    const end = (trimRangeRef.current[1] / 100) * duration;

    const sSample = Math.floor(start * audioBuffer.sampleRate);
    const eSample = Math.floor(end * audioBuffer.sampleRate);
    const len = eSample - sSample;
    const finalGain = gainRef.current;

    if (len <= 0) return;

    const ctx = new AudioContext();
    const newBuf = ctx.createBuffer(
      audioBuffer.numberOfChannels,
      len,
      audioBuffer.sampleRate,
    );

    // Copy and Apply Gain
    for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
      const oldData = audioBuffer.getChannelData(i).subarray(sSample, eSample);
      const newData = newBuf.getChannelData(i);

      for (let j = 0; j < len; j++) {
        // Apply gain and clamp to prevent distortion/wrapping
        const sample = oldData[j] * finalGain;
        newData[j] = Math.max(-1, Math.min(1, sample));
      }
    }

    const blob = bufferToWav(newBuf, len);
    const file = new File([blob], "edited.wav", { type: "audio/wav" });
    const newUrl = URL.createObjectURL(blob);

    onSave(file, newUrl);
    onOpenChange(false);
  };

  useEffect(() => {
    if (open && audioBuffer) requestAnimationFrame(draw);
  }, [open, audioBuffer, trimRange, gain]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Audio</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="bg-muted relative h-32 w-full overflow-hidden rounded-md border">
            <canvas ref={canvasRef} className="h-full w-full object-cover" />
          </div>

          {/* Crop Sliders */}
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-medium">
              <span>Trim</span>
              <span className="text-muted-foreground">
                {trimRange[1] - trimRange[0]}% selected
              </span>
            </div>
            <Slider
              defaultValue={[0, 100]}
              value={trimRange}
              min={0}
              max={100}
              step={1}
              minStepsBetweenThumbs={5}
              onValueChange={(v) => setTrimRange(v as [number, number])}
            />
          </div>

          {/* Volume Slider */}
          <div className="space-y-4">
            <div className="flex justify-between text-xs font-medium">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                <span>Volume</span>
              </div>
              <span className="text-muted-foreground">
                {Math.round(gain * 100)}%
              </span>
            </div>
            <Slider
              defaultValue={[1]}
              value={[gain]}
              min={0}
              max={2}
              step={0.01}
              onValueChange={(v) => setGain(v[0])}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={togglePlay} type="button">
            {isPlaying ? (
              <Pause className="mr-2 h-4 w-4" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isPlaying ? "Stop" : "Preview"}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              type="button"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} type="button">
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
