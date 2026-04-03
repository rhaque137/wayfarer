"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mic, Send, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import { DestinationSpotlight } from "@/components/unsplash/DestinationSpotlight";

type ParsedTrip = {
  title: string;
  origin?: string;
  destinations: string[];
  startDate?: string;
  endDate?: string;
  month?: string;
  travelers?: number;
  budget?: number;
  currency?: string;
  interests: string[];
  travelStyle?: string;
  clarifyingQuestions: string[];
  skeleton: {
    days: Array<{
      day: number;
      base: string;
      headline: string;
      morning: string[];
      afternoon: string[];
      evening: string[];
    }>;
  };
};

function useRecorder() {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const start = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
    chunksRef.current = [];
    mr.ondataavailable = (e) => {
      if (e.data.size) chunksRef.current.push(e.data);
    };
    mr.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
    };
    mr.start();
    mediaRecorderRef.current = mr;
    setRecording(true);
  };

  const stop = async (): Promise<Blob> => {
    const mr = mediaRecorderRef.current;
    if (!mr) throw new Error("Recorder not started");
    await new Promise<void>((resolve) => {
      mr.onstop = () => resolve();
      mr.stop();
    });
    setRecording(false);
    return new Blob(chunksRef.current, { type: "audio/webm" });
  };

  return { recording, start, stop };
}

export function HeroCommander() {
  const router = useRouter();
  const [input, setInput] = useState(
    "Plan me 10 days in Lisbon and Porto for 2 people in September, we love food, history, and wine. Budget $4,000 CAD",
  );
  const [busy, setBusy] = useState(false);
  const [parsed, setParsed] = useState<ParsedTrip | null>(null);
  const [error, setError] = useState<string | null>(null);
  const recorder = useRecorder();

  const preview = useMemo(() => {
    if (!parsed) return null;
    const line1 = `${parsed.destinations.join(" • ")}${
      parsed.month ? ` • ${parsed.month}` : parsed.startDate ? ` • ${parsed.startDate}` : ""
    }`;
    const line2 = parsed.budget && parsed.currency ? `${parsed.currency} ${parsed.budget.toLocaleString()}` : "";
    return { line1, line2 };
  }, [parsed]);

  const runParse = async (text: string) => {
    setBusy(true);
    setError(null);
    setParsed(null);
    try {
      const res = await fetch("/api/parse-trip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input: text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to parse trip");
      setParsed(data.trip as ParsedTrip);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const createTripAndGo = async () => {
    if (!parsed) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/save-trip", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ trip: parsed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to save trip");
      router.push(`/plan/${data.tripId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const onVoice = async () => {
    setError(null);
    try {
      if (!recorder.recording) {
        await recorder.start();
        return;
      }
      setBusy(true);
      const blob = await recorder.stop();
      const fd = new FormData();
      fd.append("file", blob, "voice.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to transcribe");
      setInput(data.text);
      await runParse(data.text);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Voice input failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <GlassCard className="relative overflow-hidden p-6 md:p-7">
        <div className="pointer-events-none absolute inset-0 opacity-70 [background:radial-gradient(800px_circle_at_40%_20%,rgba(124,58,237,0.22),transparent_60%),radial-gradient(900px_circle_at_70%_70%,rgba(0,229,255,0.18),transparent_55%)]" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="glass rounded-2xl p-2">
              <Sparkles className="h-5 w-5 text-violet" />
            </div>
            <div>
              <div className="text-sm text-foreground/70">AI Trip Commander</div>
              <div className="text-lg font-semibold tracking-tight">Tell me your trip. I’ll run the mission plan.</div>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Example: "7 days in Tokyo + Kyoto, solo, April, sushi + temples, mid-range budget"'
              className="min-h-36 md:min-h-40"
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                onClick={onVoice}
                disabled={busy}
                className={cn(recorder.recording && "border-pink/40 bg-pink/10")}
              >
                <Mic className="h-4 w-4" />
                {recorder.recording ? "Stop recording" : "Voice input"}
              </Button>
              <Button variant="primary" onClick={() => runParse(input)} disabled={busy || !input.trim()}>
                <Send className="h-4 w-4" />
                Generate skeleton
              </Button>
              {parsed ? (
                <Button variant="secondary" onClick={createTripAndGo} disabled={busy}>
                  <Wand2 className="h-4 w-4 text-cyan" />
                  Enter workspace
                </Button>
              ) : null}
            </div>
            {error ? <div className="text-sm text-pink">{error}</div> : null}
          </div>

          {parsed ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 grid gap-3 md:grid-cols-3"
            >
              <div className="glass rounded-2xl p-4 md:col-span-1">
                <div className="text-xs text-foreground/60">Trip</div>
                <div className="mt-1 text-base font-semibold">{parsed.title}</div>
                {preview ? (
                  <div className="mt-2 text-sm text-foreground/70">
                    <div>{preview.line1}</div>
                    {preview.line2 ? <div>{preview.line2}</div> : null}
                  </div>
                ) : null}
              </div>
              <div className="glass rounded-2xl p-4 md:col-span-2">
                <div className="text-xs text-foreground/60">Clarifying questions</div>
                <ul className="mt-2 space-y-1 text-sm text-foreground/80">
                  {parsed.clarifyingQuestions.slice(0, 2).map((q) => (
                    <li key={q} className="flex gap-2">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ) : null}

          <div className="mt-3">
            <DestinationSpotlight
              key={(parsed?.destinations?.[0] ?? "Lisbon").toString()}
              query={(parsed?.destinations?.[0] ?? "Lisbon").toString()}
            />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
