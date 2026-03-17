"use client";

import { useState, useCallback, useRef } from "react";

export default function CsvUpload({ onChannelsLoaded }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState(null);
  const fileRef = useRef(null);

  const parseCSV = useCallback(
    async (text) => {
      setParsing(true);
      setError(null);

      try {
        const lines = text.split(/\r?\n/).filter((l) => l.trim());
        if (lines.length < 2) {
          throw new Error("CSV must have a header row and at least one data row");
        }

        const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
        const channelIdIdx = headers.findIndex(
          (h) =>
            h === "channel_id" ||
            h === "channelid" ||
            h === "channel id" ||
            h === "id"
        );
        const channelUrlIdx = headers.findIndex(
          (h) =>
            h === "channel_url" ||
            h === "channelurl" ||
            h === "channel url" ||
            h === "url"
        );
        const channelNameIdx = headers.findIndex(
          (h) =>
            h === "channel_name" ||
            h === "channelname" ||
            h === "channel name" ||
            h === "name" ||
            h === "title" ||
            h === "channel title"
        );

        const channels = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(",").map((c) => c.trim());
          if (cols.every((c) => !c)) continue;

          let channelId = channelIdIdx >= 0 ? cols[channelIdIdx] : null;
          let channelUrl = channelUrlIdx >= 0 ? cols[channelUrlIdx] : null;
          let channelName = channelNameIdx >= 0 ? cols[channelNameIdx] : null;

          // Try to extract channel ID from URL
          if (!channelId && channelUrl) {
            const match = channelUrl.match(
              /youtube\.com\/channel\/(UC[\w-]+)/
            );
            if (match) channelId = match[1];
          }

          // If we only have a single column with no recognized headers, treat it as channel ID
          if (!channelId && !channelUrl && !channelName && cols.length === 1) {
            const val = cols[0];
            if (val.startsWith("UC")) {
              channelId = val;
            } else {
              channelName = val;
            }
          }

          if (channelId || channelName) {
            channels.push({
              channelId: channelId || null,
              title: channelName || channelId || "Unknown",
              thumbnail: null,
              fromCSV: true,
            });
          }
        }

        if (channels.length === 0) {
          throw new Error(
            "No valid channels found. Ensure your CSV has columns like channel_id, channel_url, or channel_name"
          );
        }

        // If we have channel IDs, resolve them
        const channelsWithIds = channels.filter((c) => c.channelId);
        const channelsWithoutIds = channels.filter((c) => !c.channelId);

        let resolved = [];
        if (channelsWithIds.length > 0) {
          // Batch resolve in groups of 50
          for (let i = 0; i < channelsWithIds.length; i += 50) {
            const batch = channelsWithIds.slice(i, i + 50);
            const ids = batch.map((c) => c.channelId);

            try {
              const res = await fetch("/api/youtube/resolve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channelIds: ids }),
              });

              if (res.ok) {
                const data = await res.json();
                resolved.push(...data.channels);
              } else {
                // Keep unresolved ones as-is
                resolved.push(...batch);
              }
            } catch {
              resolved.push(...batch);
            }
          }
        }

        const allChannels = [...resolved, ...channelsWithoutIds];
        onChannelsLoaded(allChannels);
      } catch (err) {
        setError(err.message);
      } finally {
        setParsing(false);
      }
    },
    [onChannelsLoaded]
  );

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (!file.name.endsWith(".csv")) {
        setError("Please upload a .csv file");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => parseCSV(e.target.result);
      reader.readAsText(file);
    },
    [parseCSV]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">📄 Import from CSV</div>
          <div className="card-subtitle">Upload a CSV with channel data</div>
        </div>
      </div>

      <div
        className={`csv-upload-zone ${isDragOver ? "drag-over" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          onChange={(e) => handleFile(e.target.files[0])}
        />
        {parsing ? (
          <div className="loading-state">
            <div className="spinner" />
            <span>Parsing CSV...</span>
          </div>
        ) : (
          <>
            <div className="csv-upload-icon">📁</div>
            <div className="csv-upload-text">
              Drop your CSV here or <strong>click to browse</strong>
            </div>
            <div className="csv-upload-hint">
              Supports: channel_id, channel_url, channel_name columns
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="quota-info" style={{ marginTop: 12 }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}
