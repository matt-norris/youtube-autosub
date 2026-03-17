"use client";

import { useState, useCallback } from "react";

export default function ChannelSearch({ onChannelSubsLoaded }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(null);
  const [error, setError] = useState(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    setError(null);
    setResults([]);

    try {
      const res = await fetch(
        `/api/youtube/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Search failed");
      }

      setResults(data.channels || []);
      if (data.channels?.length === 0) {
        setError("No channels found");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleImportSubs = useCallback(
    async (channelId, channelTitle) => {
      setLoadingSubs(channelId);
      setError(null);

      try {
        const res = await fetch(
          `/api/youtube/channel-subs?channelId=${channelId}`
        );
        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.error || "Failed to fetch subscriptions"
          );
        }

        if (data.subscriptions?.length === 0) {
          setError(`${channelTitle} has no public subscriptions`);
          return;
        }

        onChannelSubsLoaded(data.subscriptions, channelTitle);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoadingSubs(null);
      }
    },
    [onChannelSubsLoaded]
  );

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">🔍 Clone from Channel</div>
          <div className="card-subtitle">
            Search a channel to import their subs
          </div>
        </div>
      </div>

      <div className="search-container">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="text"
            placeholder="Search for a YouTube channel..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        <button
          className="btn btn-primary btn-small"
          style={{ marginTop: 10 }}
          onClick={handleSearch}
          disabled={searching || !query.trim()}
        >
          {searching ? <span className="spinner" /> : "Search"}
        </button>
      </div>

      {error && (
        <div className="quota-info" style={{ marginTop: 12 }}>
          ⚠️ {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="search-results" style={{ marginTop: 12 }}>
          {results.map((ch) => (
            <div key={ch.channelId} className="channel-row">
              {ch.thumbnail && (
                <img
                  src={ch.thumbnail}
                  alt=""
                  className="channel-thumb"
                  referrerPolicy="no-referrer"
                />
              )}
              <div className="channel-info">
                <div className="channel-name">{ch.title}</div>
                <div className="channel-desc">{ch.description}</div>
              </div>
              <button
                className="channel-action-btn"
                onClick={() => handleImportSubs(ch.channelId, ch.title)}
                disabled={loadingSubs === ch.channelId}
              >
                {loadingSubs === ch.channelId ? (
                  <span className="spinner" />
                ) : (
                  "Import Subs"
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
