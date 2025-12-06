"use client";

import { useState, useRef } from "react";
import {
  Mic,
  Square,
  Trash2,
  Play,
  Pause,
  Scissors,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioEditor } from "@/components/ui/audio-editor";

interface AudioRecorderProps {
  initialUrl?: string | null;
  onAudioRecorded: (file: File) => void;
  onAudioDeleted: () => void;
  wordName?: string | null;
}

export function AudioRecorder({
  initialUrl,
  onAudioRecorded,
  onAudioDeleted,
  wordName,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(initialUrl || null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        const file = new File([blob], "recording.webm", { type: "audio/webm" });
        setAudioUrl(url);
        onAudioRecorded(file);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDelete = () => {
    setAudioUrl(null);
    onAudioDeleted();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleEditSave = (file: File, newUrl: string) => {
    setAudioUrl(newUrl);
    onAudioRecorded(file);
  };

  const downloadAudio = async () => {
    if (!audioUrl) return;

    try {
      const response = await fetch(audioUrl);
      if (!response.ok) throw new Error("Network response was not ok");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      let ext = "wav";
      const mime = blob.type;
      if (mime.includes("webm")) ext = "webm";
      else if (mime.includes("mp3") || mime.includes("mpeg")) ext = "mp3";
      else if (mime.includes("wav")) ext = "wav";

      const dayMounthYear = new Date().toLocaleDateString().replace(/\//g, "-");
      const timestamp = `${dayMounthYear}-${new Date().toLocaleTimeString()}`;
      a.download = `${wordName}${wordName ? "-" : ""}audio-${timestamp}.${ext}`;

      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error("Download failed, falling back to open:", e);
      window.open(audioUrl, "_blank");
    }
  };

  return (
    <div className="flex items-center gap-2">
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {!audioUrl && (
        <Button
          type="button"
          variant={isRecording ? "destructive" : "secondary"}
          size="sm"
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? (
            <Square className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>
      )}

      {audioUrl && (
        <div className="bg-secondary/50 flex items-center gap-1 rounded-md border p-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={togglePlayback}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-blue-500"
            onClick={() => setIsEditorOpen(true)}
          >
            <Scissors className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-green-500"
            onClick={downloadAudio}
          >
            <Download className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:text-destructive h-8 w-8"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <AudioEditor
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        audioUrl={audioUrl}
        onSave={handleEditSave}
      />
    </div>
  );
}
