type ErrorStateProps = {
  title?: string;
  message: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = "Fehler beim Laden",
  message,
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <h3 className="state-panel__title">{title}</h3>
      <p className="state-panel__text">{message}</p>
      {onRetry && (
        <button type="button" className="app-btn app-btn--secondary" onClick={onRetry}>
          Erneut versuchen
        </button>
      )}
    </div>
  );
}
