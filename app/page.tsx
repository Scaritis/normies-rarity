"use client";
import { useState, useEffect } from "react";
import { Press_Start_2P } from "next/font/google";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] });

type Trait = { trait_type: string; value: string };
type NFTMetadata = {
  name: string;
  attributes: Trait[];
  // ... other fields if needed
};

export default function Home() {
  const [tokenId, setTokenId] = useState("");
  const [compareId, setCompareId] = useState("");
  const [nftData, setNftData] = useState<NFTMetadata | null>(null);
  const [compareData, setCompareData] = useState<NFTMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("compare");
  const [loading, setLoading] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [collectionData, setCollectionData] = useState<NFTMetadata[]>([]);
  const [traitCounts, setTraitCounts] = useState<Record<string, Record<string, number>>>({});
  const [totalSupply, setTotalSupply] = useState(0);
  const [rarityCache, setRarityCache] = useState<Record<number, { score: number; rank: number }>>({});
  const [showDonate, setShowDonate] = useState(false);

  // Load cached collection from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem("normies_collection");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setCollectionData(parsed);
        computeRarityStats(parsed);
      } catch {}
    }
  }, []);

  const computeRarityStats = (allNFTs: NFTMetadata[]) => {
    if (allNFTs.length === 0) return;

    const counts: Record<string, Record<string, number>> = {};
    allNFTs.forEach((nft) => {
      nft.attributes?.forEach((attr) => {
        if (!counts[attr.trait_type]) counts[attr.trait_type] = {};
        counts[attr.trait_type][attr.value] = (counts[attr.trait_type][attr.value] || 0) + 1;
      });
    });

    setTraitCounts(counts);
    setTotalSupply(allNFTs.length);

    // Precompute rarity scores & ranks
    const scores = allNFTs.map((nft, idx) => {
      const score = nft.attributes?.reduce((sum, attr) => {
        const traitCount = counts[attr.trait_type]?.[attr.value] || 1;
        return sum + totalSupply / traitCount;
      }, 0) ?? 0;

      return { id: Number(nft.name.split("#")[1]), score, idx };
    });

    // Sort descending score → higher = rarer
    scores.sort((a, b) => b.score - a.score);

    const newCache: Record<number, { score: number; rank: number }> = {};
    scores.forEach((item, rankIdx) => {
      newCache[item.id] = { score: item.score, rank: rankIdx + 1 };
    });

    setRarityCache(newCache);
  };

  const loadFullCollection = async () => {
    if (collectionData.length > 9000) return; // already mostly loaded

    setCollectionLoading(true);
    setError(null);

    const newCollection: NFTMetadata[] = [...collectionData];
    const start = collectionData.length > 0 ? Math.max(...collectionData.map(n => Number(n.name.split("#")[1] || 0))) + 1 : 1;
    const MAX = 10000;

    for (let id = start; id <= MAX; id++) {
      try {
        const res = await fetch(`https://api.normies.art/normie/${id}/metadata`);
        if (!res.ok) continue;
        const data = await res.json();
        if (data?.name) {
          newCollection.push(data);
        }
      } catch {
        // skip failed / burnt / non-existent
      }

      // Update every 50 to avoid freezing UI
      if (id % 50 === 0) {
        setCollectionData([...newCollection]);
        localStorage.setItem("normies_collection", JSON.stringify(newCollection));
      }
    }

    setCollectionData(newCollection);
    localStorage.setItem("normies_collection", JSON.stringify(newCollection));
    computeRarityStats(newCollection);
    setCollectionLoading(false);
  };

  const fetchNFT = async (id: string, setData: (d: NFTMetadata | null) => void) => {
    if (!id || isNaN(Number(id))) {
      setError("Enter valid Token ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://api.normies.art/normie/${id}/metadata`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setData(data);
    } catch {
      setError("Failed to fetch Normie – maybe burnt or invalid?");
    }

    setLoading(false);
  };

  const getImage = (data: NFTMetadata | null) =>
    data ? `https://api.normies.art/normie/${data.name.split("#")[1]}/image.svg` : "";

  const getRarityInfo = (data: NFTMetadata | null) => {
    if (!data) return null;
    const id = Number(data.name.split("#")[1]);
    return rarityCache[id] || null;
  };

  const renderNFT = (data: NFTMetadata | null) => {
    if (!data) return null;

    const rarity = getRarityInfo(data);
    const traitCount = data.attributes?.length || 0;
    let upgradeHint = "Base / lightly edited";
    let color = "#555";
    if (traitCount > 9) {
      upgradeHint = "Heavily upgraded!";
      color = "#ff6a00";
    } else if (traitCount > 6) {
      upgradeHint = "Edited / medium level";
      color = "#ff9500";
    }

    return (
      <div
        style={{
          width: "360px",
          background: "#f5f5dc",
          padding: "20px",
          border: "6px solid black",
          boxShadow: "10px 10px 0 #ff6a00",
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: "1.1rem", marginBottom: "12px" }}>
          {data.name}
        </h2>

        <img
          src={getImage(data)}
          alt={data.name}
          style={{
            width: "100%",
            border: "6px solid black",
            margin: "16px 0",
            imageRendering: "pixelated",
          }}
        />

        <div
          style={{
            fontSize: "0.75rem",
            border: "4px solid gray",
            padding: "12px",
            background: "#fff",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {data.attributes?.map((attr, i) => (
            <div key={i} style={{ margin: "6px 0" }}>
              <strong>{attr.trait_type}:</strong> {attr.value}
            </div>
          ))}
        </div>

        <div style={{ marginTop: "16px", fontSize: "0.8rem" }}>
          <div style={{ fontWeight: "bold", color }}>
            Upgrade level hint: {upgradeHint} ({traitCount} traits)
          </div>

          {rarity ? (
            <>
              <div style={{ fontWeight: "bold", color: "#ff6a00", marginTop: "8px" }}>
                Rarity Score: {rarity.score.toFixed(2)}
              </div>
              <div style={{ fontWeight: "bold" }}>
                Rank: #{rarity.rank} / {totalSupply}
              </div>
            </>
          ) : (
            <div style={{ color: "#777", marginTop: "8px" }}>
              Rarity: not calculated yet (load collection first)
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
        background: "#f5f5dc",
        minHeight: "100vh",
        padding: "40px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2rem",
          marginBottom: "32px",
          // textShadow removed
        }}
      >
        Normies Rarity Checker
      </h1>

      <div style={{ display: "flex", gap: "16px", marginBottom: "32px", flexWrap: "wrap", justifyContent: "center" }}>
        {["compare", "market", "burnt"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 28px",
              border: "4px solid black",
              background: activeTab === tab ? "#ff6a00" : "#fff",
              fontWeight: activeTab === tab ? "bold" : "normal",
              cursor: "pointer",
            }}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {error && (
        <div
          style={{
            background: "#ff6a00",
            padding: "12px 20px",
            border: "4px solid black",
            marginBottom: "24px",
            maxWidth: "600px",
            textAlign: "center",
          }}
        >
          {error}
        </div>
      )}

      {/* Collection loader – only show in compare tab or always? */}
      {activeTab === "compare" && (
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <button
            onClick={loadFullCollection}
            disabled={collectionLoading || collectionData.length > 9000}
            style={{
              padding: "12px 32px",
              border: "4px solid black",
              background: collectionData.length > 0 ? "#4caf50" : "#ff6a00",
              color: "white",
              cursor: "pointer",
              marginBottom: "12px",
            }}
          >
            {collectionLoading
              ? "Loading collection... (can take minutes)"
              : collectionData.length === 0
              ? "Load Collection Data for Rarity (once)"
              : `Collection loaded (${collectionData.length}/${totalSupply})`}
          </button>

          {collectionData.length > 0 && !rarityCache[1] && (
            <p style={{ color: "#777" }}>Computing rarity...</p>
          )}
        </div>
      )}

      {activeTab === "compare" && (
        <>
          <div style={{ display: "flex", gap: "24px", marginBottom: "40px", flexWrap: "wrap", justifyContent: "center" }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchNFT(tokenId, setNftData);
              }}
              style={{ display: "flex" }}
            >
              <input
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value.trim())}
                placeholder="TOKEN ID"
                style={{
                  padding: "12px",
                  border: "4px solid black",
                  width: "160px",
                  marginRight: "8px",
                }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  border: "4px solid black",
                  background: "#ff6a00",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                {loading ? "SCANNING..." : "SCAN"}
              </button>
            </form>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchNFT(compareId, setCompareData);
              }}
              style={{ display: "flex" }}
            >
              <input
                value={compareId}
                onChange={(e) => setCompareId(e.target.value.trim())}
                placeholder="COMPARE ID"
                style={{
                  padding: "12px",
                  border: "4px solid black",
                  width: "160px",
                  marginRight: "8px",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "12px 24px",
                  border: "4px solid black",
                  background: "#ff6a00",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                COMPARE
              </button>
            </form>
          </div>

          <div style={{ display: "flex", gap: "48px", flexWrap: "wrap", justifyContent: "center" }}>
            {renderNFT(nftData)}
            {renderNFT(compareData)}
          </div>
        </>
      )}

      {/* Market tab */}
      {activeTab === "market" && (
        <div
          style={{
            background: "#fff",
            padding: "40px",
            border: "6px solid black",
            boxShadow: "10px 10px 0 #ff6a00",
            textAlign: "center",
            maxWidth: "500px",
          }}
        >
          <h2 style={{ marginBottom: "24px" }}>Market Stats (approx)</h2>
          <p>Active Supply: ~8,600–8,700</p>
          <p>Unique Holders: ~1,800</p>
          <p>Floor Price: ~0.05–0.06 ETH</p>
          <p>Total Volume: ~630+ ETH</p>
          <p style={{ marginTop: "16px", fontSize: "0.9rem", color: "#555" }}>
            (values change – check OpenSea or DexScreener)
          </p>
        </div>
      )}

      {/* Burnt tab */}
      {activeTab === "burnt" && (
        <div
          style={{
            background: "#fff",
            padding: "40px",
            border: "6px solid black",
            boxShadow: "10px 10px 0 #ff6a00",
            textAlign: "center",
            maxWidth: "500px",
          }}
        >
          <h2 style={{ marginBottom: "24px" }}>Burnt Normies</h2>
          <p>Estimated Burnt: ~1,300–1,400 (13–14%)</p>
          <p>Used for action points / canvas upgrades</p>
          <p style={{ marginTop: "16px" }}>
            Burn → gain points → edit your Normie → potentially increase rarity
          </p>
        </div>
      )}

      {/* Floating donate button */}
      <button
        onClick={() => setShowDonate(true)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: "#ff6a00",
          border: "5px solid black",
          padding: "16px 20px",
          fontSize: "1.4rem",
          cursor: "pointer",
          borderRadius: "8px",
        }}
      >
        SUPPORT
      </button>

      {showDonate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "40px",
              border: "6px solid black",
              textAlign: "center",
              maxWidth: "500px",
            }}
          >
            <h2>Support the Tool</h2>
            <p style={{ margin: "24px 0", wordBreak: "break-all" }}>
              0x6d8D5a62Eec504f1B35cae050aDa790077B33e81
            </p>
            <button
              onClick={() => setShowDonate(false)}
              style={{
                padding: "12px 32px",
                border: "4px solid black",
                background: "#ff6a00",
                color: "white",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}