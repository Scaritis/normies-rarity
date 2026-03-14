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
          if (!data?.name || !data?.attributes?.length || data.attributes.length < 6) {
            isPartial = true;
          }
        } catch {
          isPartial = true;
        }
      } else {
        isPartial = true;
      }

      setData(data);

      try {
        const rarityRes = await fetch(`/api/rarity?ids=${id}`);
        if (rarityRes.ok) {
          const rarityData = await rarityRes.json();
          setRarity(rarityData.results[Number(id)] || null);
        }
      } catch {}

      if (!data || !data.attributes?.length) {
        throw new Error("TOKEN NOT FOUND OR FULLY BURNT");
      }

      // No global error for partial — we'll show badge on card instead
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
            border: "2px solid #f85149",
            borderRadius: "12px",
            padding: "40px",
            textAlign: "center",
            color: "#f85149",
          }}
        >
          NO DATA<br />TOKEN NOT FOUND / FULLY BURNT
        </div>
      );
    }

    const traits = data.attributes;
    const traitCount = traits.length;

    const levelTrait = traits.find(t => t.trait_type.toLowerCase().includes("level"));
    const level = levelTrait ? parseInt(levelTrait.value, 10) || 0 : 0;

    const pixelTrait = traits.find(t => t.trait_type.toLowerCase().includes("pixel"));
    const pixels = pixelTrait ? pixelTrait.value : "N/A";

    const apTrait = traits.find(t => t.trait_type.toLowerCase().includes("action"));
    const ap = apTrait ? apTrait.value : "0";

    let levelText = `LEVEL ${level}`;
    let levelColor = level === 0 ? "#999" : level <= 5 ? "#ffaa33" : level <= 15 ? "#ff6a00" : "#00ffaa";

    // Burnt detection heuristic
    const isLikelyBurnt = Number(ap) === 0 && Number(level) <= 1 && traitCount <= 10 && Number(pixels) < 600;

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

          <div style={{ marginTop: "12px", textAlign: "center" }}>
            <div style={{ color: "#aaa" }}>Pixels: {pixels} | AP: {ap}</div>
            {rarity && rarity.rank > 0 && (
              <div style={{ color: "#ff6a00", fontWeight: "bold", marginTop: "8px" }}>
                SCORE: {rarity.score.toFixed(2)} | RANK: #{rarity.rank}
              </div>
            )}
          </div>

          {/* Burnt badge if detected */}
          {isLikelyBurnt && (
            <div style={{
              background: "#2a1a1a",
              marginTop: "16px",
              padding: "10px",
              textAlign: "center",
              color: "#ff4444",
              fontWeight: "bold",
              fontSize: "0.9rem",
              borderTop: "1px solid #f85149",
            }}>
              BURNT / SACRIFICED
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

      <div style={{ display: "flex", gap: "16px", marginBottom: "40px", flexWrap: "wrap", justifyContent: "center" }}>
        {["COMPARE", "MARKET"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            style={{
              padding: "12px 28px",
              border: "2px solid #30363d",
              background: activeTab === tab.toLowerCase() ? "#21262d" : "#161b22",
              color: activeTab === tab.toLowerCase() ? "#ff6a00" : "#8b949e",
              fontWeight: "bold",
              cursor: "pointer",
              borderRadius: "6px",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "#ff6a00";
              e.currentTarget.style.boxShadow = "0 0 16px rgba(255,106,0,0.3)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#30363d";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {tab}
          </button>
        ))}
      </div>

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

      {/* Neon SUPPORT button */}
      <button
        onClick={() => setShowDonate(true)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: "#ff6a00",
          color: "#000",
          padding: "16px 24px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "1.1rem",
          boxShadow: "0 0 20px rgba(255,106,0,0.7), 0 0 40px rgba(255,106,0,0.4)",
          transition: "all 0.3s ease",
          animation: "neonPulse 2s infinite alternate",
        }}
      >
        SUPPORT
      </button>

      <style jsx global>{`
        @keyframes neonPulse {
          from { box-shadow: 0 0 15px rgba(255,106,0,0.6), 0 0 30px rgba(255,106,0,0.4); }
          to   { box-shadow: 0 0 30px rgba(255,106,0,1), 0 0 60px rgba(255,106,0,0.7); }
        }
        button:hover {
          transform: scale(1.08);
          box-shadow: 0 0 40px rgba(255,106,0,1), 0 0 80px rgba(255,106,0,0.8) !important;
        }
      `}</style>

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
            border: "2px solid #ff6a00",
            borderRadius: "12px",
            textAlign: "center",
            maxWidth: "500px",
            color: "#e6edf3",
            boxShadow: "0 0 30px rgba(255,106,0,0.5)",
          }}>
            <h2 style={{ color: "#ff6a00" }}>SUPPORT THE TOOL</h2>
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