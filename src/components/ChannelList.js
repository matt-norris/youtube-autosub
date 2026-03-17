"use client";

import { useState, useMemo } from "react";

export default function ChannelList({
  channels,
  selectedIds,
  onSelectionChange,
  onAutoSub,
  subscribing,
  sourceLabel,
}) {
  const [filter, setFilter] = useState("");

  const filteredChannels = useMemo(() => {
    if (!filter) return channels;
    const q = filter.toLowerCase();
    return channels.filter(
      (ch) =>
        ch.title?.toLowerCase().includes(q) ||
        ch.channelId?.toLowerCase().includes(q)
    );
  }, [channels, filter]);

  const toggleChannel = (channelId) => {
    const next = new Set(selectedIds);
    if (next.has(channelId)) {
      next.delete(channelId);
    } else {
      next.add(channelId);
    }
    onSelectionChange(next);
  };

  const selectAll = () => {
    const ids = new Set(filteredChannels.map((ch) => ch.channelId).filter(Boolean));
    onSelectionChange(ids);
  };

  const deselectAll = () => {
    onSelectionChange(new Set());
  };

  const selectedCount = selectedIds.size;

  if (channels.length === 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3>No channels loaded</h3>
          <p>
            Import channels from a CSV file or search for a channel to clone
            their subscriptions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">
            📋 Channel Queue
            <span className="badge badge-success">{channels.length}</span>
          </div>
          {sourceLabel && (
            <div className="card-subtitle">Source: {sourceLabel}</div>
          )}
        </div>
      </div>

      <div className="autosub-bar">
        <div className="autosub-info">
          <strong>{selectedCount}</strong> of {channels.length} channels selected
        </div>
        <div className="autosub-actions">
          <div className="select-controls">
            <button className="select-all-btn" onClick={selectAll}>
              Select All
            </button>
            <button className="select-all-btn" onClick={deselectAll}>
              Deselect
            </button>
          </div>
          <button
            className="btn btn-primary"
            onClick={onAutoSub}
            disabled={selectedCount === 0 || subscribing}
          >
            {subscribing ? (
              <>
                <span className="spinner" /> Subscribing...
              </>
            ) : (
              <>⚡ AutoSub ({selectedCount})</>
            )}
          </button>
        </div>
      </div>

      {channels.length > 10 && (
        <input
          className="search-input"
          type="text"
          placeholder="Filter channels..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ marginBottom: 12 }}
        />
      )}

      <div className="channel-list">
        {filteredChannels.map((ch, idx) => (
          <div key={`${ch.channelId || "ch"}-${idx}`} className="channel-row">
            {ch.channelId && (
              <input
                type="checkbox"
                className="channel-checkbox"
                checked={selectedIds.has(ch.channelId)}
                onChange={() => toggleChannel(ch.channelId)}
              />
            )}
            {ch.thumbnail ? (
              <img
                src={ch.thumbnail}
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
                  color: "var(--text-muted)",
                }}
              >
                📺
              </div>
            )}
            <div className="channel-info">
              <div className="channel-name">{ch.title}</div>
              {ch.description && (
                <div className="channel-desc">{ch.description}</div>
              )}
            </div>
            {ch.subscriberCount && (
              <div className="channel-stats">
                <span>
                  {Number(ch.subscriberCount).toLocaleString()} subs
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
