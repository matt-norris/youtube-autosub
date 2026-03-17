"use client";

export default function AutoSubProgress({
  progress,
  results,
  total,
  onClose,
  isComplete,
}) {
  const succeeded = results.filter((r) => r.success && !r.skipped).length;
  const skipped = results.filter((r) => r.skipped).length;
  const failed = results.filter((r) => !r.success).length;
  const pct = total > 0 ? Math.round((results.length / total) * 100) : 0;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">
          {isComplete ? "✅ AutoSub Complete!" : "⚡ AutoSub in Progress"}
        </div>

        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>

        <div style={{ textAlign: "center", marginBottom: 16, fontSize: 13, color: "var(--text-secondary)" }}>
          {results.length} / {total} channels processed ({pct}%)
        </div>

        <div className="progress-stats">
          <div className="progress-stat success">
            <div className="progress-stat-value">{succeeded}</div>
            <div className="progress-stat-label">Subscribed</div>
          </div>
          <div className="progress-stat skipped">
            <div className="progress-stat-value">{skipped}</div>
            <div className="progress-stat-label">Skipped</div>
          </div>
          <div className="progress-stat failed">
            <div className="progress-stat-value">{failed}</div>
            <div className="progress-stat-label">Failed</div>
          </div>
        </div>

        {results.length > 0 && (
          <div className="progress-log">
            {results
              .slice()
              .reverse()
              .slice(0, 50)
              .map((r, i) => (
                <div
                  key={i}
                  className={`progress-log-entry ${
                    r.success ? (r.skipped ? "skipped" : "success") : "failed"
                  }`}
                >
                  <span>
                    {r.success
                      ? r.skipped
                        ? "⏭"
                        : "✅"
                      : "❌"}
                  </span>
                  <span>
                    {r.channelId}
                    {r.reason ? ` — ${r.reason}` : ""}
                    {r.error ? ` — ${r.error}` : ""}
                  </span>
                </div>
              ))}
          </div>
        )}

        {isComplete && (
          <button
            className="btn btn-primary"
            onClick={onClose}
            style={{ width: "100%" }}
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
}
