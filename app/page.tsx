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
    let levelColor = level === 0 ? "#aaa" : level <= 5 ? "#ff9500" : level <= 15 ? "#ff6a00" : "#00ff9d";
    let levelDesc = level === 0 ? "BASE - NO UPGRADES" : "UPGRADED - RARER DUE TO LEVEL";

    return (
      <div
        style={{
          width: "360px",
          background: "#0f1620",
          padding: "20px",
          border: "4px solid #ff6a00",
          boxShadow: "0 0 20px rgba(255,106,0,0.4)",
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: "1rem", marginBottom: "12px", color: "#ff6a00" }}>
          {label} – {data.name.toUpperCase()}
        </h2>

        <img
          src={getImage(data)}
          alt={data.name}
          style={{
            width: "100%",
            border: "4px solid #ff6a00",
            imageRendering: "pixelated",
            margin: "16px 0",
            boxShadow: "0 0 15px rgba(255,106,0,0.3)",
          }}
        />

        <div
          style={{
            fontSize: "0.75rem",
            border: "3px solid #333",
            padding: "12px",
            background: "#0a0e15",
            maxHeight: "260px",
            overflowY: "auto",
            color: "#eee",
          }}
        >
          {traits.map((attr, i) => (
            <div key={i} style={{ margin: "6px 0" }}>
              <strong style={{ color: "#ff6a00" }}>{attr.trait_type.toUpperCase()}:</strong> {attr.value}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "16px", fontSize: "0.85rem", color: "#ddd" }}>
          <div style={{ fontWeight: "bold", fontSize: "1.1rem", color: levelColor, marginBottom: "6px" }}>
            {levelText}
          </div>
          <div style={{ color: levelColor, marginBottom: "8px" }}>
            {levelDesc}
          </div>
          <div style={{ margin: "8px 0" }}>
            TRAITS: {traitCount}
          </div>
          {rarity && rarity.rank > 0 ? (
            <div style={{ fontWeight: "bold", color: "#ff6a00" }}>
              RARITY SCORE: {rarity.score.toFixed(2)}<br />
              RANK: #{rarity.rank}
            </div>
          ) : (
            <div style={{ color: "#888" }}>RARITY N/A</div>
          )}
          <div style={{ fontSize: "0.7rem", color: "#888", marginTop: "8px" }}>
            HIGHER LEVEL = MORE RARE (FOUNDER VIBE)
          </div>
        </div>
      </div>
    );
  };

  return (
    <main
      className={pixelFont.className}
      style={{
        backgroundColor: "#000000",
        backgroundImage: 'url("https://images.vexels.com/media/users/3/264959/raw/c8952802430225175500bdaf14bc7fbc-crypto-elements-pixel-art-pattern.jpg")',
        backgroundRepeat: "repeat",
        backgroundSize: "300px",
        backgroundPosition: "center",
        minHeight: "100vh",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color: "#eee",
      }}
    >
      {/* Dark overlay + subtle orange glow */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        boxShadow: "inset 0 0 100px rgba(255,106,0,0.15)",
        zIndex: -1,
      }} />

      <h1 style={{
        fontSize: "2.2rem",
        marginBottom: "32px",
        color: "#ff6a00",
        textShadow: "0 0 10px #ff6a00",
        letterSpacing: "2px",
      }}>
        NORMIES RARITY CHECKER
      </h1>

      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap", justifyContent: "center" }}>
        {["COMPARE", "MARKET", "BURNT"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab.toLowerCase())}
            style={{
              padding: "12px 28px",
              border: "4px solid #ff6a00",
              background: activeTab === tab.toLowerCase() ? "#ff6a00" : "#111",
              color: activeTab === tab.toLowerCase() ? "#000" : "#ff6a00",
              fontWeight: "bold",
              cursor: "pointer",
              textShadow: activeTab === tab.toLowerCase() ? "0 0 5px #000" : "0 0 5px #ff6a00",
              transition: "all 0.15s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "scale(1.08)";
              e.currentTarget.style.boxShadow = "0 0 15px #ff6a00";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "scale(1)";
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
            background: "#ff6a00",
            padding: "12px 24px",
            border: "4px solid #fff",
            marginBottom: "24px",
            textAlign: "center",
            maxWidth: "500px",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          {error.toUpperCase()}
        </div>
      )}

      {activeTab === "compare" && (
        <>
          <div style={{ display: "flex", gap: "16px", marginBottom: "40px", flexWrap: "wrap", justifyContent: "center" }}>
            <form
              onSubmit={(e) => { e.preventDefault(); fetchNFT(tokenId, setNftData, setNftRarity); }}
              style={{ display: "flex" }}
            >
              <input
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value.trim())}
                placeholder="TOKEN ID"
                style={{
                  padding: "12px",
                  border: "4px solid #ff6a00",
                  background: "#111",
                  color: "#eee",
                  width: "160px",
                  marginRight: "8px",
                }}
              />
              <button
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  border: "4px solid #ff6a00",
                  background: loading ? "#333" : "#ff6a00",
                  color: loading ? "#888" : "#000",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {loading ? "..." : "SCAN"}
              </button>
            </form>

            <form
              onSubmit={(e) => { e.preventDefault(); fetchNFT(compareId, setCompareData, setCompareRarity); }}
              style={{ display: "flex" }}
            >
              <input
                value={compareId}
                onChange={(e) => setCompareId(e.target.value.trim())}
                placeholder="COMPARE ID"
                style={{
                  padding: "12px",
                  border: "4px solid #ff6a00",
                  background: "#111",
                  color: "#eee",
                  width: "160px",
                  marginRight: "8px",
                }}
              />
              <button
                style={{
                  padding: "12px 24px",
                  border: "4px solid #ff6a00",
                  background: "#ff6a00",
                  color: "#000",
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
            background: "#0f1620",
            padding: "40px",
            border: "6px solid #ff6a00",
            boxShadow: "0 0 30px rgba(255,106,0,0.3)",
            textAlign: "center",
            maxWidth: "500px",
            color: "#eee",
          }}
        >
          <h2 style={{ color: "#ff6a00" }}>MARKET STATS</h2>
          <p>CIRCULATING: ~8,600</p>
          <p>FLOOR: ~0.05 ETH</p>
          <p>HOLDERS: ~1,800</p>
          <p style={{ marginTop: "16px", fontSize: "0.9rem", color: "#aaa" }}>
            REAL-TIME → OPENSEA / DEXSCREENER
          </p>
        </div>
      )}

      {activeTab === "burnt" && (
        <div
          style={{
            background: "#0f1620",
            padding: "40px",
            border: "6px solid #ff6a00",
            boxShadow: "0 0 30px rgba(255,106,0,0.3)",
            textAlign: "center",
            maxWidth: "500px",
            color: "#eee",
          }}
        >
          <h2 style={{ color: "#ff6a00" }}>BURNT NORMIES</h2>
          <p>~1,300–1,400 BURNT (~13–14%)</p>
          <p>BURN → ACTION POINTS → LEVEL UP → RARITY BOOST</p>
        </div>
      )}

      <button
        onClick={() => setShowDonate(true)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: "#ff6a00",
          border: "5px solid #fff",
          padding: "16px 20px",
          fontSize: "1.2rem",
          color: "#000",
          cursor: "pointer",
          boxShadow: "0 0 15px #ff6a00",
          transition: "transform 0.15s",
        }}
        onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.1)")}
        onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
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
              background: "#0f1620",
              padding: "40px",
              border: "6px solid #ff6a00",
              textAlign: "center",
              maxWidth: "500px",
              color: "#eee",
            }}
          >
            <h2 style={{ color: "#ff6a00" }}>SUPPORT THE TOOL</h2>
            <p style={{ margin: "20px 0", wordBreak: "break-all", color: "#aaa" }}>
              0x6d8D5a62Eec504f1B35cae050aDa790077B33e81
            </p>
            <button
              onClick={() => setShowDonate(false)}
              style={{
                padding: "12px 32px",
                border: "4px solid #ff6a00",
                background: "#ff6a00",
                color: "#000",
                cursor: "pointer",
                fontWeight: "bold",
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