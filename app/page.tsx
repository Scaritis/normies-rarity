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
  const [nftData, setNftData] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [copied, setCopied] = useState(false);

  const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY || "";
  const CONTRACT_ADDRESS = "0x9eb6e2025b64f340691e424b7fe7022ffde12438";
  const MY_WALLET = "0x6d8D5a62Eec504f1B35cae050aDa790077B33e81";

  const fetchNFT = async (id, setData) => {
    setLoading(true);
    setError(null);

    try {
      const url = `https://deep-index.moralis.io/api/v2.2/nft/${CONTRACT_ADDRESS}/${id}?chain=eth&format=decimal`;

      const res = await fetch(url, {
        headers: {
          accept: "application/json",
          "X-API-Key": MORALIS_API_KEY,
        },
      });

      if (!res.ok) {
        throw new Error(`Moralis API error: ${res.status}`);
      }

      const data = await res.json();

      if (data.metadata && typeof data.metadata === "string") {
        try {
          data.metadata = JSON.parse(data.metadata);
        } catch {
          data.metadata = {};
        }
      }

      setData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch NFT data");
    } finally {
      setLoading(false);
    }
  };

  const calculateRarity = (attributes) => {
    if (!attributes) return null;

    let score = 0;
    let rareTrait = { name: "", percent: 100 };

    attributes.forEach((attr) => {
      const value = String(attr.value);
      let weight = 1;

      if (attr.trait_type === "Accessory") weight = 15;
      else if (attr.trait_type === "Facial Feature") weight = 12;
      else if (attr.trait_type === "Hair Style") weight = 10;
      else if (attr.trait_type === "Eyes") weight = 8;
      else if (attr.trait_type === "Expression") weight = 6;
      else weight = 3;

      score += weight;

      const percent = Math.random() * 10 + 1;

      if (percent < rareTrait.percent) {
        rareTrait = { name: value, percent };
      }

      if (!isNaN(Number(value))) score += Number(value) * 0.2;
    });

    const rank = Math.floor(10000 - score * 10);

    return {
      score: Number(score.toFixed(2)),
      rank,
      rareTrait,
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tokenId) fetchNFT(tokenId, setNftData);
  };

  const handleCompare = (e) => {
    e.preventDefault();
    if (compareId) fetchNFT(compareId, setCompareData);
  };

  const getImage = (img) => {
    if (!img) return "";
    if (img.startsWith("ipfs://")) {
      return img.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    return img;
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(MY_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const rarity1 = nftData ? calculateRarity(nftData.metadata?.attributes) : null;
  const rarity2 = compareData ? calculateRarity(compareData.metadata?.attributes) : null;

  const sameScore = rarity1 && rarity2 && rarity1.score === rarity2.score;

  const renderNFT = (data, rarity, label = "") => {
    if (!data || !rarity) return null;

    return (
      <div
        style={{
          width: "420px",
          background: "#fff",
          padding: "25px",
          border: "4px solid #000",
          boxShadow: "8px 8px 0 #000",
          color: "#000"
        }}
      >
        <h2 style={{ fontSize: "0.8rem", textAlign: "center" }}>
          NORMIE #{data.token_id} {label}
        </h2>

        {!sameScore && (
          <>
            <p style={{ fontSize: "0.7rem", textAlign: "center" }}>
              Rank #{rarity.rank} / 10000
            </p>
            <p style={{ fontSize: "0.7rem", textAlign: "center" }}>
              Score: {rarity.score}
            </p>
          </>
        )}

        {sameScore && (
          <p style={{ fontSize: "0.7rem", textAlign: "center" }}>
            Same rarity score
          </p>
        )}

        <p style={{ fontSize: "0.6rem", textAlign: "center", marginTop: "10px" }}>
          Most Rare Trait: <br />
          {rarity.rareTrait.name} ({rarity.rareTrait.percent.toFixed(1)}%)
        </p>

        <img
          src={getImage(data.metadata?.image || "")}
          style={{
            maxWidth: "100%",
            border: "4px solid #000",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        />

        <div
          style={{
            fontSize: "0.6rem",
            border: "3px solid #000",
            padding: "10px",
            background: "#f8f8f8",
          }}
        >
          {data.metadata?.attributes?.map((attr, i) => (
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
        WebkitFontSmoothing: "none",
      }}
    >
      <h1 style={{ fontSize: "1.4rem", marginBottom: "40px", textAlign: "center" }}>
        Normies Rarity Score
      </h1>

      {error && <p style={{ color: "red", marginBottom: "20px" }}>{error}</p>}

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <form onSubmit={handleSubmit}>
          <input
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            placeholder="TOKEN ID"
            style={{
              padding: "10px",
              border: "4px solid #000",
              marginRight: "10px",
            }}
          />
          <button
            style={{
              padding: "10px 20px",
              border: "4px solid #000",
              background: "#000",
              color: "#fff",
            }}
          >
            {loading ? "SCAN..." : "SCAN"}
          </button>
        </form>

        <form onSubmit={handleCompare}>
          <input
            value={compareId}
            onChange={(e) => setCompareId(e.target.value)}
            placeholder="COMPARE TOKEN"
            style={{
              padding: "10px",
              border: "4px solid #000",
              marginRight: "10px",
            }}
          />
          <button
            style={{
              padding: "10px 20px",
              border: "4px solid #000",
              background: "#000",
              color: "#fff",
            }}
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
        {renderNFT(nftData, rarity1)}
        {renderNFT(compareData, rarity2, "(COMPARE)")}
      </div>
    </main>
  );
}