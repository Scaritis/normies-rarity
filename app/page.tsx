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

  const MORALIS_API_KEY = process.env.NEXT_PUBLIC_MORALIS_API_KEY || "";
  const CONTRACT_ADDRESS = "0x9eb6e2025b64f340691e424b7fe7022ffde12438";

  const fetchNFT = async (id: string, setData: any) => {

    setLoading(true);
    setError(null);

    try {

      const url =
        `https://deep-index.moralis.io/api/v2.2/nft/${CONTRACT_ADDRESS}/${id}?chain=eth&format=decimal`;

      const res = await fetch(url, {
        headers: {
          accept: "application/json",
          "X-API-Key": MORALIS_API_KEY,
        },
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      const data = await res.json();

      if (data.metadata && typeof data.metadata === "string") {
        data.metadata = JSON.parse(data.metadata);
      }

      setData(data);

    } catch (err: any) {
      setError(err.message);
    }

    setLoading(false);

  };

  const calculateRarity = (attributes: any[]) => {

    if (!attributes) return null;

    let score = 0;
    let rareTrait = { name: "", weight: 0 };

    attributes.forEach((attr: any) => {

      let weight = 1;

      if (attr.trait_type === "Accessory") weight = 15;
      else if (attr.trait_type === "Facial Feature") weight = 12;
      else if (attr.trait_type === "Hair Style") weight = 10;
      else if (attr.trait_type === "Eyes") weight = 8;
      else if (attr.trait_type === "Expression") weight = 6;
      else weight = 3;

      score += weight;

      if (weight > rareTrait.weight) {
        rareTrait = {
          name: attr.value,
          weight,
        };
      }

    });

    const rank = Math.floor(10000 - score * 12);

    let tier = "Common";

    if (score > 60) tier = "Legendary";
    else if (score > 45) tier = "Ultra Rare";
    else if (score > 35) tier = "Rare";
    else if (score > 25) tier = "Uncommon";

    return {
      score: Number(score.toFixed(2)),
      rank,
      tier,
      rareTrait,
    };

  };

  const rarity1 = nftData
    ? calculateRarity(nftData.metadata?.attributes)
    : null;

  const rarity2 = compareData
    ? calculateRarity(compareData.metadata?.attributes)
    : null;

  const winner =
    rarity1 && rarity2
      ? rarity1.score > rarity2.score
        ? 1
        : rarity2.score > rarity1.score
        ? 2
        : 0
      : null;

  const getImage = (img: string) => {

    if (!img) return "";

    if (img.startsWith("ipfs://")) {
      return img.replace("ipfs://", "https://ipfs.io/ipfs/");
    }

    return img;

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
          NORMIE #{data.token_id}
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
          Score: {rarity.score}
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
          src={getImage(data.metadata?.image)}
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
          {data.metadata?.attributes?.map((attr: any, i: number) => (
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

      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (tokenId) fetchNFT(tokenId, setNftData);
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
          >
            {loading ? "SCAN..." : "SCAN"}
          </button>

        </form>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (compareId) fetchNFT(compareId, setCompareData);
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

    </main>

  );
}