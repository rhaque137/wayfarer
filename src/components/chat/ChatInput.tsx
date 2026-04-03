"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Paperclip, Send } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTranscribe: (audio: Blob) => Promise<void>;
  disabled?: boolean;
};

export function ChatInput({ value, onChange, onSend, onTranscribe, disabled }: Props) {
  const [recording, setRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  useEffect(() => {
    return () => {
      if (recorderRef.current?.state === "recording") recorderRef.current.stop();
    };
  }, []);

  const toggleRecording = async () => {
    setRecordingError(null);
    if (recording) {
      const rec = recorderRef.current;
      if (!rec) return;
      await new Promise<void>((resolve) => {
        rec.onstop = () => resolve();
        rec.stop();
      });
      setRecording(false);
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      chunksRef.current = [];
      await onTranscribe(blob);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => stream.getTracks().forEach((t) => t.stop());
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
    } catch {
      setRecordingError("Microphone permission denied");
    }
  };

  return (
    <div className="glass sticky bottom-4 z-10 rounded-2xl p-3">
      <div className="flex items-center gap-2">
        <button className="focus-ring glass h-10 w-10 rounded-full" aria-label="Attach file">
          <Paperclip className="mx-auto h-4 w-4 text-foreground/70" />
        </button>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Ask anything..."
          className="h-11 w-full rounded-xl bg-transparent px-3 text-sm text-foreground/80 outline-none"
        />
        <button
          className={cn(
            "focus-ring glass h-10 w-10 rounded-full",
            recording && "border-pink/40 bg-pink/10 text-pink",
          )}
          onClick={toggleRecording}
          aria-label="Voice input"
        >
          <Mic className="mx-auto h-4 w-4" />
        </button>
        <button
          className="focus-ring h-10 w-10 rounded-full bg-cyan/20 text-cyan"
          onClick={onSend}
          disabled={disabled}
          aria-label="Send"
        >
          <Send className="mx-auto h-4 w-4" />
        </button>
      </div>

      {recording ? (
        <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-cyan/10">
          <div className="h-full w-1/3 animate-pulse rounded-full bg-cyan/60" />
        </div>
      ) : null}
      {recordingError ? <div className="mt-2 text-xs text-pink">{recordingError}</div> : null}
    </div>
  );
}
