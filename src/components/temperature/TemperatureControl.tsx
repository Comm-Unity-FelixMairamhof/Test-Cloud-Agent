"use client";

import { useState } from "react";
import { formatTemperature } from "@/lib/utils/format";

type TemperatureControlProps = {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  onChange: (value: number) => void;
  onSave: (value: number) => Promise<void>;
};

export function TemperatureControl({
  value,
  min = 15,
  max = 28,
  step = 0.5,
  disabled = false,
  onChange,
  onSave,
}: TemperatureControlProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      await onSave(value);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } finally {
      setSaving(false);
    }
  }

  function adjust(delta: number) {
    const next = Math.min(max, Math.max(min, Math.round((value + delta) / step) * step));
    onChange(next);
  }

  return (
    <div className="temp-control">
      <div className="temp-control__display">
        <button
          type="button"
          className="temp-control__step"
          onClick={() => adjust(-step)}
          disabled={disabled || value <= min}
          aria-label="Temperatur senken"
        >
          −
        </button>
        <div className="temp-control__value-wrap">
          <span className="temp-control__value">{formatTemperature(value)}</span>
          <span className="temp-control__label">Zieltemperatur</span>
        </div>
        <button
          type="button"
          className="temp-control__step"
          onClick={() => adjust(step)}
          disabled={disabled || value >= max}
          aria-label="Temperatur erhöhen"
        >
          +
        </button>
      </div>

      <input
        type="range"
        className="temp-control__slider"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number.parseFloat(e.target.value))}
        aria-label="Zieltemperatur einstellen"
      />

      <div className="temp-control__range-labels">
        <span>{min} °C</span>
        <span>{max} °C</span>
      </div>

      <button
        type="button"
        className="app-btn app-btn--primary temp-control__save"
        onClick={() => void handleSave()}
        disabled={disabled || saving}
      >
        {saving ? "Speichern …" : saved ? "Gespeichert ✓" : "Zieltemperatur speichern"}
      </button>
    </div>
  );
}
