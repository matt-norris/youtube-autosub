"use client";

import { useState, useEffect, useCallback } from "react";

export default function MySubscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/youtube/subscriptions");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch subscriptions");
      }

      setSubs(data.subscriptions || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubs();
  }, [fetchSubs]);

  const exportCSV = useCallback(() => {
    if (subs.length === 0) return;

    const header = "channel_id,channel_name,channel_url";
    const rows = subs.map(
      (s) =>
        `${s.channelId},"${(s.title || "").replace(/"/g, '""')}",https://www.youtube.com/channel/${s.channelId}`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `subsync_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [subs]);

  return (
    <>
      <div className="page-header">
        <h2>📺 My Subscriptions</h2>
        <p>Your current YouTube subscriptions</p>
      </div>

      <div className="export-section">
        <button
          className="btn btn-secondary btn-small"
          onClick={fetchSubs}
          disabled={loading}
        >
          🔄 Refresh
        </button>
        <button
          className="btn btn-secondary btn-small"
          onClick={exportCSV}
          disabled={subs.length === 0}
        >
          💾 Export CSV
        </button>
        {subs.length > 0 && (
          <span className="badge badge-success">{subs.length} channels</span>
        )}
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <span>Fetching your subscriptions...</span>
        </div>
      ) : error ? (
        <div className="card">
          <div className="quota-info">⚠️ {error}</div>
        </div>
      ) : subs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📺</div>
            <h3>No subscriptions found</h3>
            <p>
              You don&apos;t seem to have any subscriptions yet. Head to Import &amp;
              Sync to add some!
            </p>
          </div>
        </div>
      ) : (
        <div className="subs-grid">
          {subs.map((sub, idx) => (
            <div key={sub.channelId || idx} className="channel-row card" style={{ padding: 12 }}>
              {sub.thumbnail ? (
                <img
                  src={sub.thumbnail}
                  alt=""
                  className="channel-thumb"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div
                  className="channel-thumb"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                  }}
                >
                  📺
                </div>
              )}
              <div className="channel-info">
                <div className="channel-name">{sub.title}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
