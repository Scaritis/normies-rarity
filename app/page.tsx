"use client";
import { useState } from "react";
import { Press_Start_2P } from "next/font/google";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] });

type Trait = { trait_type: string; value: string };
type NFTMetadata = { name: string; attributes: Trait[] };
type RarityInfo = { score: number; rank: number };

export default function Home() {
  const [tokenId, setTokenId] = useState("");
  const [compareId, setCompareId] = useState("");
  const [nftData, setNftData] = useState<NFTMetadata | null>(null);
  const [compareData, setCompareData] = useState<NFTMetadata | null>(null);
  const [nftRarity, setNftRarity] = useState<RarityInfo | null>(null);
  const [compareRarity, setCompareRarity] = useState<RarityInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("compare");
  const [loading, setLoading] = useState(false);
  const [showDonate, setShowDonate] = useState(false);

  const fetchNFT = async (
    id: string,
    setData: (d: NFTMetadata | null) => void,
    setRarity: (r: RarityInfo | null) => void
  ) => {
    if (!id || isNaN(Number(id))) {
      setError("ENTER VALID TOKEN ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://api.normies.art/normie/${id}/metadata`);

      let data: NFTMetadata | null = null;
      let isPartial = false;

      if (res.ok) {
        try {
          data = await res.json();
          // Partial check: if no name/attributes → treat as incomplete
          if (!data?.name || !data?.attributes?.length) {
            isPartial = true;
          }
        } catch {
          isPartial = true;
        }
      } else {
        isPartial = true;
      }

      setData(data);

      // Try rarity anyway (if partial data exists)
      try {
        const rarityRes = await fetch(`/api/rarity?ids=${id}`);
        if (rarityRes.ok) {
          const rarityData = await rarityRes.json();
          setRarity(rarityData.results[Number(id)] || null);
        }
      } catch {}

      // If truly nothing loaded → error
      if (!data || !data.attributes?.length) {
        throw new Error("TOKEN NOT FOUND OR BURNT");
      }

      if (isPartial) {
        setError("PARTIAL DATA LOADED – POSSIBLY BURNT OR INCOMPLETE");
      }
    } catch (err: any) {
      setData(null);
      setRarity(null);
      setError(err.message.toUpperCase() || "FAILED TO LOAD NORMIE");
    } finally {
      setLoading(false);
    }
  };

  const getImage = (data: NFTMetadata | null) =>
    data ? `https://api.normies.art/normie/${data.name.split("#")[1]}/image.svg` : "";

  const renderNFT = (data: NFTMetadata | null, rarity: RarityInfo | null, label = "NORMIE") => {
    if (!data || !data.attributes?.length) {
      return (
        <div
          style={{
            width: "380px",
            background: "#0d1117",
            border: "2px solid #30363d",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            color: "#f85149",
            fontSize: "1rem",
          }}
        >
          NO DATA<br />TOKEN NOT FOUND / BURNT
        </div>
      );
    }

    const traits = data.attributes;
    const traitCount = traits.length;

    const levelTrait = traits.find(t => t.trait_type.toLowerCase().includes("level"));
    const level = levelTrait ? parseInt(levelTrait.value, 10) || 0 : 0;

    let levelText = `LEVEL ${level}`;
    let levelColor = level === 0 ? "#999" : level <= 5 ? "#ffaa33" : level <= 15 ? "#ff6a00" : "#00ffaa";

    return (
      <div
        style={{
          width: "380px",
          background: "#0d1117",
          border: "2px solid #30363d",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#161b22",
            padding: "12px 16px",
            borderBottom: "1px solid #30363d",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ color: "#ff6a00", fontSize: "1rem", fontWeight: "bold" }}>
            {label.toUpperCase()} #{data.name.split("#")[1]}
          </div>
          <div style={{ color: levelColor, fontSize: "0.9rem" }}>
            {levelText}
          </div>
        </div>

        {/* Image */}
        <div style={{ padding: "16px", background: "#000" }}>
          <img
            src={getImage(data)}
            alt={data.name}
            style={{
              width: "100%",
              imageRendering: "pixelated",
              border: "2px solid #30363d",
              borderRadius: "8px",
            }}
          />
        </div>

        {/* Traits */}
        <div style={{ padding: "16px", fontSize: "0.8rem", color: "#c9d1d9" }}>
          {traits.map((attr, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "space-between",
                margin: "8px 0",
                padding: "4px 8px",
                background: i % 2 === 0 ? "#161b22" : "transparent",
                borderRadius: "4px",
              }}
            >
              <span style={{ color: "#58a6ff" }}>{attr.trait_type}</span>
              <span style={{ color: "#e6edf3" }}>{attr.value}</span>
            </div>
          ))}

          {rarity && rarity.rank > 0 && (
            <div style={{ marginTop: "16px", textAlign: "center", color: "#ff6a00", fontWeight: "bold" }}>
              RARITY SCORE: {rarity.score.toFixed(2)}<br />
              RANK: #{rarity.rank}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <main
      className={pixelFont.className}
      style={{
        backgroundColor: "#0d1117",
        color: "#c9d1d9",
        minHeight: "100vh",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1 style={{
        fontSize: "2.2rem",
        marginBottom: "40px",
        color: "#ff6a00",
        textShadow: "0 0 12px rgba(255,106,0,0.5)",
      }}>
        NORMIES RARITY CHECKER
      </h1>

      {error && (
        <div
          style={{
            background: "#21262d",
            padding: "12px 24px",
            border: "2px solid #f85149",
            borderRadius: "8px",
            marginBottom: "24px",
            color: "#f85149",
            fontWeight: "bold",
            textAlign: "center",
            maxWidth: "600px",
          }}
        >
          {error}
        </div>
      )}

      {activeTab === "compare" && (
        <>
          <div style={{ display: "flex", gap: "16px", marginBottom: "40px", flexWrap: "wrap", justifyContent: "center" }}>
            <form onSubmit={(e) => { e.preventDefault(); fetchNFT(tokenId, setNftData, setNftRarity); }} style={{ display: "flex" }}>
              <input
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value.trim())}
                placeholder="TOKEN ID"
                style={{
                  padding: "12px 16px",
                  border: "2px solid #30363d",
                  background: "#161b22",
                  color: "#e6edf3",
                  width: "140px",
                  marginRight: "8px",
                  borderRadius: "6px",
                }}
              />
              <button
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  background: loading ? "#21262d" : "#238636",
                  color: "#fff",
                  border: "2px solid #238636",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  minWidth: "100px",
                }}
              >
                {loading ? "..." : "SCAN"}
              </button>
            </form>

            <form onSubmit={(e) => { e.preventDefault(); fetchNFT(compareId, setCompareData, setCompareRarity); }} style={{ display: "flex" }}>
              <input
                value={compareId}
                onChange={(e) => setCompareId(e.target.value.trim())}
                placeholder="COMPARE ID"
                style={{
                  padding: "12px 16px",
                  border: "2px solid #30363d",
                  background: "#161b22",
                  color: "#e6edf3",
                  width: "140px",
                  marginRight: "8px",
                  borderRadius: "6px",
                }}
              />
              <button
                style={{
                  padding: "12px 24px",
                  background: "#238636",
                  color: "#fff",
                  border: "2px solid #238636",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  minWidth: "100px",
                }}
              >
                COMPARE
              </button>
            </form>
          </div>

          <div style={{ display: "flex", gap: "32px", flexWrap: "wrap", justifyContent: "center" }}>
            {renderNFT(nftData, nftRarity, "LEFT")}
            {renderNFT(compareData, compareRarity, "RIGHT")}
          </div>
        </>
      )}

      {/* Market & Burnt tabs (simple dark cards) */}
      {activeTab === "market" && (
        <div style={{
          background: "#0d1117",
          padding: "32px",
          border: "2px solid #30363d",
          borderRadius: "12px",
          maxWidth: "500px",
          textAlign: "center",
        }}>
          <h2 style={{ color: "#ff6a00", marginBottom: "20px" }}>MARKET STATS</h2>
          <p>CIRCULATING: ~8,600</p>
          <p>FLOOR: ~0.05 ETH</p>
          <p>HOLDERS: ~1,800</p>
        </div>
      )}

      {activeTab === "burnt" && (
        <div style={{
          background: "#0d1117",
          padding: "32px",
          border: "2px solid #30363d",
          borderRadius: "12px",
          maxWidth: "500px",
          textAlign: "center",
        }}>
          <h2 style={{ color: "#ff6a00", marginBottom: "20px" }}>BURNT NORMIES</h2>
          <p>~1,300–1,400 BURNT</p>
          <p>BURN → ACTION POINTS → LEVEL UP</p>
        </div>
      )}

      <button
        onClick={() => setShowDonate(true)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: "#161b22",
          border: "2px solid #ff6a00",
          color: "#ff6a00",
          padding: "16px 24px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        SUPPORT
      </button>

      {showDonate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div style={{
            background: "#0d1117",
            padding: "40px",
            border: "2px solid #30363d",
            borderRadius: "12px",
            textAlign: "center",
            maxWidth: "500px",
            color: "#e6edf3",
          }}>
            <h2 style={{ color: "#ff6a00" }}>SUPPORT</h2>
            <p style={{ margin: "20px 0", wordBreak: "break-all", color: "#8b949e" }}>
              0x6d8D5a62Eec504f1B35cae050aDa790077B33e81
            </p>
            <button
              onClick={() => setShowDonate(false)}
              style={{
                padding: "12px 32px",
                background: "#161b22",
                border: "2px solid #ff6a00",
                color: "#ff6a00",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </main>
  );
}