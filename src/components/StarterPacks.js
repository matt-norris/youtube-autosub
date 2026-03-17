"use client";

import { useState } from "react";
import { starterPacks } from "@/data/starterPacks";

export default function StarterPacks({ onPackLoaded }) {
  const [expandedPack, setExpandedPack] = useState(null);

  const handleLoadPack = (pack) => {
    onPackLoaded(pack.channels, `${pack.icon} ${pack.name} Starter Pack`);
    setExpandedPack(null);
  };

  return (
    <>
      <div className="page-header">
        <h2>🎁 Starter Packs</h2>
        <p>Pre-curated channel collections to jumpstart your subscriptions</p>
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
                  style={{ width: "100%", marginTop: 12 }}
                >
                  ⚡ Load {pack.channels.length} Channels
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
