"use client";

import { useState, useCallback } from "react";
import Sidebar from "./Sidebar";
import CsvUpload from "./CsvUpload";
import ChannelSearch from "./ChannelSearch";
import ChannelList from "./ChannelList";
import AutoSubProgress from "./AutoSubProgress";
import MySubscriptions from "./MySubscriptions";

export default function Dashboard() {
  const [activeView, setActiveView] = useState("import");
  const [channels, setChannels] = useState([]);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [sourceLabel, setSourceLabel] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [progressResults, setProgressResults] = useState([]);
  const [progressTotal, setProgressTotal] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const handleCsvLoaded = useCallback(
    (loadedChannels) => {
      setChannels(loadedChannels);
      const ids = new Set(
        loadedChannels.map((ch) => ch.channelId).filter(Boolean)
      );
      setSelectedIds(ids);
      setSourceLabel("CSV Import");
      addToast(`Loaded ${loadedChannels.length} channels from CSV`, "success");
    },
    [addToast]
  );

  const handleChannelSubsLoaded = useCallback(
    (subs, channelTitle) => {
      setChannels(subs);
      const ids = new Set(subs.map((ch) => ch.channelId).filter(Boolean));
      setSelectedIds(ids);
      setSourceLabel(`${channelTitle}'s subscriptions`);
      addToast(
        `Loaded ${subs.length} subscriptions from ${channelTitle}`,
        "success"
      );
    },
    [addToast]
  );

  const handleAutoSub = useCallback(async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setSubscribing(true);
    setShowProgress(true);
    setProgressResults([]);
    setProgressTotal(ids.length);
    setIsComplete(false);

    // Process in batches of 10 for streaming progress
    const BATCH_SIZE = 10;
    const allResults = [];

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batch = ids.slice(i, i + BATCH_SIZE);

      try {
        const res = await fetch("/api/youtube/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelIds: batch }),
        });

        const data = await res.json();

        if (data.results) {
          allResults.push(...data.results);
          setProgressResults([...allResults]);
        }
      } catch (err) {
        const errorResults = batch.map((id) => ({
          channelId: id,
          success: false,
          error: err.message,
        }));
        allResults.push(...errorResults);
        setProgressResults([...allResults]);
      }
    }

    setIsComplete(true);
    setSubscribing(false);

    const succeeded = allResults.filter(
      (r) => r.success && !r.skipped
    ).length;
    const skipped = allResults.filter((r) => r.skipped).length;
    const failed = allResults.filter((r) => !r.success).length;

    if (failed === 0) {
      addToast(
        `Successfully subscribed to ${succeeded} channels (${skipped} already subscribed)`,
        "success"
      );
    } else {
      addToast(
        `Done: ${succeeded} subscribed, ${skipped} skipped, ${failed} failed`,
        "warning"
      );
    }
  }, [selectedIds, addToast]);

  const handleProgressClose = useCallback(() => {
    setShowProgress(false);
    setProgressResults([]);
  }, []);

  return (
    <div className="app-layout">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="main-content">
        {activeView === "import" && (
          <>
            <div className="page-header">
              <h2>⚡ Import & Sync</h2>
              <p>
                Import channels from CSV or clone another channel&apos;s
                subscriptions
              </p>
            </div>

            <div className="quota-info">
              💡 YouTube API allows ~200 subscriptions per day with default
              quota (50 units each, 10,000 units/day).
            </div>

            <div className="import-grid">
              <CsvUpload onChannelsLoaded={handleCsvLoaded} />
              <ChannelSearch onChannelSubsLoaded={handleChannelSubsLoaded} />
            </div>

            <ChannelList
              channels={channels}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onAutoSub={handleAutoSub}
              subscribing={subscribing}
              sourceLabel={sourceLabel}
            />
          </>
        )}

        {activeView === "subscriptions" && <MySubscriptions />}
      </main>

      {showProgress && (
        <AutoSubProgress
          progress={progressResults.length}
          results={progressResults}
          total={progressTotal}
          onClose={handleProgressClose}
          isComplete={isComplete}
        />
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
