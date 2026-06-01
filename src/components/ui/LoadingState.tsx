type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Wird geladen …" }: LoadingStateProps) {
  return (
    <div className="state-panel state-panel--loading" role="status" aria-live="polite">
      <div className="state-panel__spinner" aria-hidden />
      <p className="state-panel__text">{label}</p>
    </div>
  );
}
