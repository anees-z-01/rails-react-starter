// Shared loading / error / empty rendering for list pages.
const RequestState = ({ loading, error, empty, emptyText, onRetry, children }) => {
  if (error) {
    return (
      <div className="notice notice--error" role="alert">
        <p>{error}</p>
        {onRetry && <button type="button" className="button button--ghost" onClick={onRetry}>Try again</button>}
      </div>
    );
  }
  if (loading) return <p className="notice" role="status">Loading…</p>;
  if (empty) return <p className="notice">{emptyText}</p>;
  return children;
};

export default RequestState;
