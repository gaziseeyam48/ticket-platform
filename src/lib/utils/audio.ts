/**
 * Synthesizes rapid audio cues using the browser Web Audio API.
 * Does not require external audio assets or network requests.
 */
export function playScanSound(type: "VALID" | "ALREADY_CHECKED_IN" | "ERROR") {
  if (typeof window === "undefined") return;

  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === "VALID") {
      // High-pitched pleasant two-tone ascending chime (880Hz -> 1320Hz)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(880, now); // A5

      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1320, now + 0.08); // E6

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.08);

      osc2.start(now + 0.08);
      osc2.stop(now + 0.3);
    } else if (type === "ALREADY_CHECKED_IN") {
      // Descending warning tone (440Hz -> 330Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(330, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } else {
      // Low alert buzz for invalid / revoked / error (160Hz -> 110Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.setValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch {
    // Gracefully ignore audio synthesis errors if browser restrictions apply
  }
}

/**
 * Triggers tactile vibration on supported mobile devices.
 */
export function triggerHaptic(type: "VALID" | "ALREADY_CHECKED_IN" | "ERROR") {
  if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") {
    try {
      if (type === "VALID") {
        navigator.vibrate(100);
      } else if (type === "ALREADY_CHECKED_IN") {
        navigator.vibrate([100, 50, 100]);
      } else {
        navigator.vibrate([200, 100, 200]);
      }
    } catch {
      // Ignore vibration error
    }
  }
}
