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

  const fetchNFT = async (id: string, setData: (d: NFTMetadata | null) => void, setRarity: (r: RarityInfo | null) => void) => {
    if (!id || isNaN(Number(id))) {
      setError("ENTER VALID TOKEN ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://api.normies.art/normie/${id}/metadata`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setData(data);

      const rarityRes = await fetch(`/api/rarity?ids=${id}`);
      if (!rarityRes.ok) throw new Error();
      const rarityData = await rarityRes.json();
      setRarity(rarityData.results[Number(id)] || null);
    } catch {
      setError(`FAILED TO LOAD NORMIE #${id}`);
    }

    setLoading(false);
  };

  const getImage = (data: NFTMetadata | null) =>
    data ? `https://api.normies.art/normie/${data.name.split("#")[1]}/image.svg` : "";

  const renderNFT = (data: NFTMetadata | null, rarity: RarityInfo | null, label = "NORMIE") => {
    if (!data) return null;

    const traits = data.attributes || [];
    const traitCount = traits.length;

    const levelTrait = traits.find(t => t.trait_type.toLowerCase().includes("level"));
    const level = levelTrait ? parseInt(levelTrait.value, 10) || 0 : 0;

    let levelText = `LEVEL ${level}`;
    let levelColor = level === 0 ? "#999" : level <= 5 ? "#ffaa33" : level <= 15 ? "#ff6a00" : "#00ffaa";

    return (
      <div
        style={{
          width: "380px",
          background: "#0d1117",           // dark card bg
          border: "2px solid #30363d",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.8), inset 0 0 12px rgba(255,106,0,0.08)",
          transition: "all 0.2s",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.boxShadow = "0 12px 40px rgba(255,106,0,0.25), inset 0 0 20px rgba(255,106,0,0.12)";
          e.currentTarget.style.transform = "translateY(-4px)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.8), inset 0 0 12px rgba(255,106,0,0.08)";
          e.currentTarget.style.transform = "translateY(0)";
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
          <div style={{ fontSize: "0.95rem", color: "#ff6a00", fontWeight: "bold" }}>
            {data.name.toUpperCase()}
          </div>
          <div style={{ fontSize: "0.85rem", color: levelColor }}>
            {levelText}
          </div>
        </div>

        {/* Image area */}
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

        {/* Traits section */}
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

          <div style={{ marginTop: "16px", textAlign: "center", color: levelColor, fontWeight: "bold" }}>
            {level === 0 ? "BASE NORMIE" : "UPGRADED NORMIE"}
          </div>

          {rarity && rarity.rank > 0 && (
            <div style={{ marginTop: "12px", textAlign: "center", color: "#ff6a00" }}>
              SCORE: {rarity.score.toFixed(2)}<br />
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
        backgroundColor: "#0d1117",          // GitHub-dark-like dark grey-black
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
        letterSpacing: "1px",
      }}>
        NORMIES RARITY CHECKER
      </h1>

      <div style={{ display: "flex", gap: "16px", marginBottom: "40px", flexWrap: "wrap", justifyContent: "center" }}>
        {["COMPARE", "MARKET", "BURNT"].map((tab) => (
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
            borderRadius: "6px",
            marginBottom: "24px",
            color: "#f85149",
            fontWeight: "bold",
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
                  background: "#0d1117",
                  color: "#e6edf3",
                  width: "160px",
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
                  background: "#0d1117",
                  color: "#e6edf3",
                  width: "160px",
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
        <div
          style={{
            background: "#0d1117",
            padding: "32px",
            border: "2px solid #30363d",
            borderRadius: "12px",
            maxWidth: "500px",
            textAlign: "center",
            color: "#e6edf3",
          }}
        >
          <h2 style={{ color: "#ff6a00", marginBottom: "20px" }}>MARKET STATS</h2>
          <p>CIRCULATING: ~8,600</p>
          <p>FLOOR: ~0.05 ETH</p>
          <p>HOLDERS: ~1,800</p>
        </div>
      )}

      {activeTab === "burnt" && (
        <div
          style={{
            background: "#0d1117",
            padding: "32px",
            border: "2px solid #30363d",
            borderRadius: "12px",
            maxWidth: "500px",
            textAlign: "center",
            color: "#e6edf3",
          }}
        >
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
          background: "#21262d",
          border: "2px solid #ff6a00",
          color: "#ff6a00",
          padding: "16px 24px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 0 16px rgba(255,106,0,0.3)",
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
          <div
            style={{
              background: "#0d1117",
              padding: "40px",
              border: "2px solid #30363d",
              borderRadius: "12px",
              textAlign: "center",
              maxWidth: "500px",
              color: "#e6edf3",
            }}
          >
            <h2 style={{ color: "#ff6a00" }}>SUPPORT</h2>
            <p style={{ margin: "20px 0", wordBreak: "break-all", color: "#8b949e" }}>
              0x6d8D5a62Eec504f1B35cae050aDa790077B33e81
            </p>
            <button
              onClick={() => setShowDonate(false)}
              style={{
                padding: "12px 32px",
                background: "#21262d",
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