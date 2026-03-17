"use client";

import { useState } from "react";
import { starterPacks } from "@/data/starterPacks";

export default function StarterPacks({ onPackLoaded }) {
  const [expandedPack, setExpandedPack] = useState(null);
  const [verifying, setVerifying] = useState(null);

  const handleLoadPack = async (pack) => {
    setVerifying(pack.id);

    try {
      // Deduplicate channel IDs first
      const seen = new Set();
      const uniqueChannels = pack.channels.filter((ch) => {
        if (!ch.channelId || seen.has(ch.channelId)) return false;
        seen.add(ch.channelId);
        return true;
      });

      // Verify channels exist via YouTube API in batches of 50
      const verified = [];

      for (let i = 0; i < uniqueChannels.length; i += 50) {
        const batch = uniqueChannels.slice(i, i + 50);
        const ids = batch.map((ch) => ch.channelId);

        try {
          const res = await fetch("/api/youtube/resolve", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelIds: ids }),
          });

          if (res.ok) {
            const data = await res.json();
            verified.push(...data.channels);
          }
        } catch {
          // Skip failed batches
        }
      }

      if (verified.length === 0) {
        onPackLoaded(
          uniqueChannels,
          `${pack.icon} ${pack.name} Starter Pack (unverified)`
        );
      } else {
        onPackLoaded(
          verified,
          `${pack.icon} ${pack.name} Starter Pack (${verified.length} verified)`
        );
      }
    } catch {
      // Fallback: load unverified
      onPackLoaded(pack.channels, `${pack.icon} ${pack.name} Starter Pack`);
    } finally {
      setVerifying(null);
      setExpandedPack(null);
    }
  };

  return (
    <>
      <div className="page-header">
        <h2>🎁 Starter Packs</h2>
        <p>Pre-curated channel collections to jumpstart your subscriptions</p>
      </div>

      <div className="quota-info">
        💡 Packs are verified against YouTube when loaded — invalid channels are
        automatically filtered out.
      </div>

      <div className="packs-grid">
        {starterPacks.map((pack) => (
          <div
            key={pack.id}
            className={`pack-card ${expandedPack === pack.id ? "expanded" : ""}`}
            style={{ "--pack-color": pack.color }}
          >
            <div
              className="pack-card-header"
              onClick={() =>
                setExpandedPack(expandedPack === pack.id ? null : pack.id)
              }
            >
              <div className="pack-card-icon">{pack.icon}</div>
              <div className="pack-card-info">
                <div className="pack-card-name">{pack.name}</div>
                <div className="pack-card-desc">{pack.description}</div>
              </div>
              <div className="pack-card-count">
                <span className="badge badge-success">
                  {pack.channels.length}
                </span>
              </div>
            </div>

            {expandedPack === pack.id && (
              <div className="pack-card-body">
                <div className="pack-channels-preview">
                  {pack.channels.slice(0, 15).map((ch, i) => (
                    <span key={i} className="pack-channel-tag">
                      {ch.title}
                    </span>
                  ))}
                  {pack.channels.length > 15 && (
                    <span className="pack-channel-tag more">
                      +{pack.channels.length - 15} more
                    </span>
                  )}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() => handleLoadPack(pack)}
                  disabled={verifying === pack.id}
                  style={{ width: "100%", marginTop: 12 }}
                >
                  {verifying === pack.id ? (
                    <>
                      <span className="spinner" /> Verifying channels...
                    </>
                  ) : (
                    <>⚡ Load & Verify Channels</>
                  )}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
