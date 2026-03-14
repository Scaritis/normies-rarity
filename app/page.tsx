// FORCE DEPLOY - March 14 2025
"use client";
import { useState } from "react";
import { Press_Start_2P } from "next/font/google";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] });

const CONTRACT_ADDRESS = "0x9eb6e2025b64f340691e424b7fe7022ffde12438";

export default function Home() {
  const [tokenId, setTokenId] = useState("");
  const [compareId, setCompareId] = useState("");
  const [nftData, setNftData] = useState<any>(null);
  const [compareData, setCompareData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("compare");
  const [traitSearch, setTraitSearch] = useState("");
  const [showDonate, setShowDonate] = useState(false);

  const fetchNFT = async (id: string, setData: any) => {
    if (!id.trim() || isNaN(Number(id)) || Number(id) < 0 || Number(id) > 9999) {
      setError("Enter valid Normie ID (0–9999)");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://api.normies.art/normie/${id}/metadata`);

      if (!res.ok) {
        throw new Error(`Failed to load (possibly burnt – check Etherscan)`);
      }

      const data = await res.json();
      setData(data);
    } catch (err: any) {
      setError(err.message || "Error fetching Normie");
    }

    setLoading(false);
  };

  const calculateRarity = (attributes: any[]) => {
    if (!attributes || attributes.length === 0) return null;

    let score = 0;
    let rareTrait = { name: "", weight: 0 };

    attributes.forEach((attr: any) => {
      let weight = 3;

      if (attr.trait_type === "Accessory") weight = 15;
      else if (attr.trait_type === "Facial Feature") weight = 12;
      else if (attr.trait_type === "Hair Style") weight = 10;
      else if (attr.trait_type === "Eyes") weight = 8;
      else if (attr.trait_type === "Expression") weight = 6;

      if (attr.trait_type === "Accessory") {
        if (["Top Hat", "Crown", "Fedora"].includes(attr.value)) weight += 15;
        if (["Bandana", "Cap"].includes(attr.value)) weight += 10;
      }

      score += weight;

      if (weight > rareTrait.weight) {
        rareTrait = { name: attr.value, weight };
      }
    });

    const level = Number(attributes.find(a => a.trait_type === "Level")?.value || 1);
    score += level * 40;

    const pixelCount = Number(attributes.find(a => a.trait_type === "Pixel Count")?.value || 0);
    score += pixelCount / 8;

    const actionPoints = Number(attributes.find(a => a.trait_type === "Action Points")?.value || 0);
    score += actionPoints / 3;

    if (attributes.find(a => a.trait_type === "Customized")?.value === "Yes") score += 50;
    if (pixelCount > 800 || pixelCount < 200) score += 30;

    const rank = Math.max(1, Math.floor(10000 - score ** 1.3));

    let tier = "Common";

    if (score > 180) tier = "Legendary";
    else if (score > 130) tier = "Ultra Rare";
    else if (score > 90) tier = "Rare";
    else if (score > 60) tier = "Uncommon";

    return { score: Number(score.toFixed(0)), rank, tier, rareTrait, level };
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

  const getImage = (data: any) =>
    data ? `https://api.normies.art/normie/${data.name.split("#")[1]}/image.svg` : "";

  const renderNFT = (data: any, rarity: any, index: number) => {
    if (!data || !rarity) return null;

    return (
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#f5f5dc",
          padding: "25px",
          border: "6px solid #000",
          boxShadow: "12px 12px 0 #ff4500",
          color: "#000"
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: "1rem" }}>
          NORMIE #{data.name.split("#")[1]}
        </h2>

        {winner === index && (
          <p style={{ textAlign: "center", fontSize: "0.8rem", color: "#ff4500" }}>
            WINNER
          </p>
        )}

        <p style={{ textAlign: "center", fontSize: "0.8rem" }}>
          Rank #{rarity.rank} / 10000
        </p>

        <p style={{ textAlign: "center", fontSize: "0.8rem" }}>
          Score: {rarity.score} (Lvl {rarity.level})
        </p>

        <p style={{ textAlign: "center", fontSize: "0.8rem" }}>
          Tier: {rarity.tier}
        </p>

        <img
          src={getImage(data)}
          style={{
            maxWidth: "100%",
            border: "6px solid #000",
            margin: "20px 0",
            imageRendering: "pixelated"
          }}
        />

        <div
          style={{
            fontSize: "0.7rem",
            border: "4px solid #808080",
            padding: "10px",
            background: "#f5f5dc"
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
        background: "#ff4500",
        color: "#000",
        minHeight: "100vh",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <h1 style={{ fontSize: "2rem", marginBottom: "40px" }}>
        Normies Rarity Checker
      </h1>

      <div style={{ display: "flex", gap: "15px", marginBottom: "40px" }}>
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
          />
          <button>SCAN</button>
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
          />
          <button>COMPARE</button>
        </form>
      </div>

      <div style={{ display: "flex", gap: "50px", flexWrap: "wrap" }}>
        {renderNFT(nftData, rarity1, 1)}
        {renderNFT(compareData, rarity2, 2)}
      </div>
    </main>
  );
}