"use client";

/**
 * Sons sintetizados via Web Audio API — sem arquivos de áudio externos.
 * Implementação própria (osciladores simples), não reaproveita nenhum
 * arquivo/áudio de terceiros.
 */
let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone(audioCtx: AudioContext, freq: number, start: number, duration: number, gain: number, type: OscillatorType) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
  g.gain.setValueAtTime(gain, audioCtx.currentTime + start);
  g.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + start + duration);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(audioCtx.currentTime + start);
  osc.stop(audioCtx.currentTime + start + duration);
}

/** Clique curto e alegre — usado ao copiar o cupom. */
export function playClickSound(): void {
  const audioCtx = getContext();
  if (!audioCtx) return;
  tone(audioCtx, 880, 0, 0.15, 0.25, "sine");
}

/** Fanfarra curta — usada só quando o parceiro sobe de Rank de verdade. */
export function playRankUpSound(): void {
  const audioCtx = getContext();
  if (!audioCtx) return;
  [523, 659, 784, 1046].forEach((freq, i) => tone(audioCtx, freq, i * 0.09, 0.3, 0.2, "triangle"));
}
