"use client";
import { useState } from "react";
import { Press_Start_2P } from "next/font/google";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

export default function Home() {
  const [tokenId, setTokenId] = useState("");
  const [compareId, setCompareId] = useState("");
  const [nftData, setNftData] = useState<any>(null);
  const [compareData, setCompareData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://api.normies.art";

  const fetchNFT = async (id: string, setData: any) => {
    if (!id.trim() || isNaN(Number(id)) || Number(id) < 0 || Number(id) > 9999) {
      setError("Enter a valid Normie ID (0–9999)");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/normie/${id}/metadata`);
      if (!res.ok) {
        throw new Error(`API error: ${res.status} – Check if ID exists`);
      }
      const data = await res.json();
      setData(data);
    } catch (err: any) {
      setError(err.message || "Failed to load Normie");
    }
    setLoading(false);
  };

  const calculateRarity = (attributes: any[]) => {
    if (!attributes || attributes.length === 0) return null;

    let score = 0;
    let rareTrait = { name: "", weight: 0 };

    // Base trait weights (by type)
    attributes.forEach((attr: any) => {
      let weight = 3; // default for most
      if (attr.trait_type === "Accessory") weight = 15;
      else if (attr.trait_type === "Facial Feature") weight = 12;
      else if (attr.trait_type === "Hair Style") weight = 10;
      else if (attr.trait_type === "Eyes") weight = 8;
      else if (attr.trait_type === "Expression") weight = 6;

      score += weight;

      if (weight > rareTrait.weight) {
        rareTrait = { name: attr.value, weight };
      }
    });

    // Heavy Level bonus – higher levels much rarer (founder priority)
    const levelAttr = attributes.find((a: any) => a.trait_type === "Level");
    const level = levelAttr ? Number(levelAttr.value) || 1 : 1;
    score += level * 40; // Level 1: +40, Level 2: +80, Level 3: +120, etc. – tweak if too strong/weak

    // Extra distinction: Pixel Count & Action Points
    const pixelAttr = attributes.find((a: any) => a.trait_type === "Pixel Count");
    const pixelCount = pixelAttr ? Number(pixelAttr.value) || 0 : 0;
    score += pixelCount / 10; // e.g. 500 pixels → +50

    const actionAttr = attributes.find((a: any) => a.trait_type === "Action Points");
    const actionPoints = actionAttr ? Number(actionAttr.value) || 0 : 0;
    score += actionPoints / 5; // e.g. 100 AP → +20

    // Customized bonus
    const customizedAttr = attributes.find((a: any) => a.trait_type === "Customized");
    if (customizedAttr?.value === "Yes") {
      score += 50;
    }

    // Rank with spread (more variation)
    const rank = Math.max(1, Math.floor(10000 - score ** 1.2));

    let tier = "Common";
    if (score > 150) tier = "Legendary";
    else if (score > 110) tier = "Ultra Rare";
    else if (score > 80) tier = "Rare";
    else if (score > 50) tier = "Uncommon";

    return {
      score: Number(score.toFixed(0)),
      rank,
      tier,
      rareTrait,
      level,
    };
  };

  const rarity1 = nftData ? calculateRarity(nftData.attributes) : null;
  const rarity2 = compareData ? calculateRarity(compareData.attributes) : null;

  const winner =
    rarity1 && rarity2
      ? rarity1.score > rarity2.score
        ? 1
        : rarity2.score > rarity1.score
        ? 2
        : 0
      : null;

  const getImage = (data: any) => {
    // Use direct SVG endpoint (cleaner than base64)
    if (data?.name) {
      const id = data.name.split("#")[1];
      return `${API_BASE}/normie/${id}/image.svg`;
    }
    return "";
  };

  const renderNFT = (data: any, rarity: any, index: number) => {
    if (!data || !rarity) return null;
    return (
      <div
        style={{
          width: "420px",
          background: "#fff",
          padding: "25px",
          border: "4px solid #000",
          boxShadow: "8px 8px 0 #000",
          color: "#000",
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: "0.8rem" }}>
          NORMIE #{data.name.split("#")[1]}
        </h2>
        {winner === index && (
          <p
            style={{
              textAlign: "center",
              fontSize: "0.7rem",
              marginBottom: "10px",
              color: "#0a0",
            }}
          >
            WINNER
          </p>
        )}
        <p style={{ textAlign: "center", fontSize: "0.7rem" }}>
          Rank #{rarity.rank} / 10000
        </p>
        <p style={{ textAlign: "center", fontSize: "0.7rem" }}>
          Score: {rarity.score} (Lvl {rarity.level})
        </p>
        <p style={{ textAlign: "center", fontSize: "0.7rem" }}>
          Tier: {rarity.tier}
        </p>
        <p
          style={{
            textAlign: "center",
            fontSize: "0.6rem",
            marginTop: "10px",
          }}
        >
          Rarest Trait: {rarity.rareTrait.name}
        </p>
        <img
          src={getImage(data)}
          style={{
            maxWidth: "100%",
            border: "4px solid #000",
            marginTop: "20px",
            marginBottom: "20px",
            imageRendering: "pixelated",
          }}
          alt={`Normie #${data.name.split("#")[1]}`}
        />
        <div
          style={{
            fontSize: "0.6rem",
            border: "3px solid #000",
            padding: "10px",
            background: "#f8f8f8",
          }}
        >
          {data.attributes?.map((attr: any, i: number) => (
            <div key={i}>
              {attr.trait_type}: {attr.value}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main
      className={pixelFont.className}
      style={{
        background: "#f5f5f5",
        color: "#000",
        minHeight: "100vh",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontSize: "1.4rem",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        Normies Rarity Score
      </h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap", justifyContent: "center" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchNFT(tokenId, setNftData);
          }}
        >
          <input
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="TOKEN ID"
            style={{
              padding: "10px",
              border: "4px solid #000",
              marginRight: "10px",
              color: "#000",
              background: "#fff",
            }}
          />
          <button
            style={{
              padding: "10px 20px",
              border: "4px solid #000",
              background: "#000",
              color: "#fff",
            }}
            disabled={loading}
          >
            {loading ? "SCAN..." : "SCAN"}
          </button>
        </form>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchNFT(compareId, setCompareData);
          }}
        >
          <input
            value={compareId}
            onChange={(e) => setCompareId(e.target.value)}
            placeholder="COMPARE TOKEN"
            style={{
              padding: "10px",
              border: "4px solid #000",
              marginRight: "10px",
              color: "#000",
              background: "#fff",
            }}
          />
          <button
            style={{
              padding: "10px 20px",
              border: "4px solid #000",
              background: "#000",
              color: "#fff",
            }}
            disabled={loading}
          >
            COMPARE
          </button>
        </form>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          flexWrap: "wrap",
        }}
      >
        {renderNFT(nftData, rarity1, 1)}
        {renderNFT(compareData, rarity2, 2)}
      </div>
      <footer style={{ marginTop: "40px", fontSize: "0.7rem", color: "#666" }}>
        Powered by <a href="https://api.normies.art/" style={{ color: "#000" }}>api.normies.art</a>
      </footer>
    </main>
  );
}