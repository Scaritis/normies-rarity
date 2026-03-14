// FORCE DEPLOY - March 14 2025
"use client";
import { useState } from "react";
import { Press_Start_2P } from "next/font/google";
import { useAccount, useConnect, useDisconnect } from "wagmi";

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

  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

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
      if (weight > rareTrait.weight) rareTrait = { name: attr.value, weight };
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

  const winner = rarity1 && rarity2
    ? rarity1.score > rarity2.score ? 1 : rarity2.score > rarity1.score ? 2 : 0
    : null;

  const getImage = (data: any) => data ? `https://api.normies.art/normie/${data.name.split("#")[1]}/image.svg` : "";

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
          color: "#000",
          transition: "all 0.3s ease-in-out",
          animation: "fadeIn 0.8s forwards",
        }}
      >
        <h2 style={{ textAlign: "center", fontSize: "1rem" }}>NORMIE #{data.name.split("#")[1]}</h2>
        {winner === index && <p style={{ textAlign: "center", fontSize: "0.8rem", marginBottom: "10px", color: "#ff4500" }}>WINNER</p>}
        <p style={{ textAlign: "center", fontSize: "0.8rem" }}>Rank #{rarity.rank} / 10000</p>
        <p style={{ textAlign: "center", fontSize: "0.8rem" }}>Score: {rarity.score} (Lvl {rarity.level})</p>
        <p style={{ textAlign: "center", fontSize: "0.8rem" }}>Tier: {rarity.tier}</p>
        <p style={{ textAlign: "center", fontSize: "0.7rem", marginTop: "10px" }}>Rarest: {rarity.rareTrait.name}</p>
        <p style={{ textAlign: "center", fontSize: "0.7rem" }}>Est Value: {(rarity.score * 0.001).toFixed(3)} ETH</p>
        <img src={getImage(data)} style={{ maxWidth: "100%", border: "6px solid #000", margin: "20px 0", imageRendering: "pixelated" }} alt="" />
        <div style={{ fontSize: "0.7rem", border: "4px solid #808080", padding: "10px", background: "#f5f5dc" }}>
          {data.attributes?.map((attr: any, i: number) => <div key={i}>{attr.trait_type}: {attr.value}</div>)}
        </div>
      </div>
    );
  };

  return (
    <main className={pixelFont.className} style={{ background: "#ff4500", color: "#000", minHeight: "100vh", padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: "100%", maxWidth: "1200px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px", flexWrap: "wrap" }}>
          <h1 style={{ fontSize: "2rem", textShadow: "5px 5px #808080", textAlign: "center" }}>Normies Rarity Checker</h1>
          <div>
            {isConnected ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "0.9rem" }}>{address?.slice(0, 6)}...{address?.slice(-4)}</span>
                <button onClick={() => disconnect()} style={{ padding: "8px 16px", background: "#808080", border: "4px solid #000", cursor: "pointer" }}>
                  Disconnect
                </button>
              </div>
            ) : (
              <button onClick={() => connect({ connector: connectors[0] })} style={{ padding: "10px 20px", background: "#808080", border: "4px solid #000", cursor: "pointer" }}>
                Connect Wallet
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "15px", marginBottom: "30px", flexWrap: "wrap", justifyContent: "center" }}>
          <button onClick={() => setActiveTab("compare")} style={{ padding: "12px 24px", border: "4px solid #000", background: activeTab === "compare" ? "#808080" : "#ff4500", color: "#000", cursor: "pointer" }}>Compare</button>
          <button onClick={() => setActiveTab("market")} style={{ padding: "12px 24px", border: "4px solid #000", background: activeTab === "market" ? "#808080" : "#ff4500", color: "#000", cursor: "pointer" }}>Market Stats</button>
          <button onClick={() => setActiveTab("burnt")} style={{ padding: "12px 24px", border: "4px solid #000", background: activeTab === "burnt" ? "#808080" : "#ff4500", color: "#000", cursor: "pointer" }}>Burnt Normies</button>
        </div>

        {error && <p style={{ color: "#fff", background: "#ff4500", padding: "12px", border: "4px solid #000", marginBottom: "20px", textAlign: "center" }}>{error}</p>}

        {activeTab === "compare" && (
          <>
            {/* Trait search placeholder */}
            <div style={{ marginBottom: "25px", textAlign: "center" }}>
              <input
                value={traitSearch}
                onChange={e => setTraitSearch(e.target.value)}
                placeholder="Search trait (e.g. Top Hat)"
                style={{ padding: "12px", border: "4px solid #000", width: "320px", background: "#f5f5dc", color: "#000", fontSize: "0.9rem" }}
              />
              {traitSearch && <div style={{ marginTop: "10px", color: "#000" }}>Matches: (coming soon)</div>}
            </div>

            {/* Compare inputs */}
            <div style={{ display: "flex", gap: "15px", marginBottom: "40px", flexWrap: "wrap", justifyContent: "center" }}>
              <form onSubmit={(e) => { e.preventDefault(); fetchNFT(tokenId, setNftData); }}>
                <input
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="TOKEN ID"
                  style={{ padding: "12px", border: "4px solid #000", marginRight: "10px", background: "#f5f5dc", color: "#000", width: "180px" }}
                />
                <button style={{ padding: "12px 24px", border: "4px solid #000", background: "#808080", color: "#000", cursor: "pointer" }} disabled={loading}>
                  {loading ? "SCANNING..." : "SCAN"}
                </button>
              </form>
              <form onSubmit={(e) => { e.preventDefault(); fetchNFT(compareId, setCompareData); }}>
                <input
                  value={compareId}
                  onChange={(e) => setCompareId(e.target.value)}
                  placeholder="COMPARE TOKEN"
                  style={{ padding: "12px", border: "4px solid #000", marginRight: "10px", background: "#f5f5dc", color: "#000", width: "180px" }}
                />
                <button style={{ padding: "12px 24px", border: "4px solid #000", background: "#808080", color: "#000", cursor: "pointer" }} disabled={loading}>
                  COMPARE
                </button>
              </form>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: "50px", flexWrap: "wrap" }}>
              {renderNFT(nftData, rarity1, 1)}
              {renderNFT(compareData, rarity2, 2)}
            </div>
          </>
        )}

        {activeTab === "market" && (
          <div style={{ background: "#f5f5dc", padding: "40px", border: "6px solid #000", boxShadow: "12px 12px 0 #808080", maxWidth: "700px", textAlign: "center", animation: "fadeIn 0.8s" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "25px" }}>Normies Market Stats</h2>
            <p style={{ marginBottom: "12px" }}>Active Supply: 8,602 / 10,000 minted</p>
            <p style={{ marginBottom: "12px" }}>Unique Holders: ~1,800</p>
            <p style={{ marginBottom: "12px" }}>Floor Price: ~0.05 ETH</p>
            <p style={{ marginBottom: "12px" }}>24h Volume: ~8 ETH</p>
            <p style={{ marginBottom: "12px" }}>Total Historical Volume: ~630 ETH</p>
            <p style={{ marginTop: "20px", fontSize: "0.9rem" }}>Live data: OpenSea / CoinGecko</p>
          </div>
        )}

        {activeTab === "burnt" && (
          <div style={{ background: "#f5f5dc", padding: "40px", border: "6px solid #000", boxShadow: "12px 12px 0 #808080", maxWidth: "700px", textAlign: "center", animation: "fadeIn 0.8s" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "25px" }}>Burnt / Sacrificed Normies</h2>
            <p style={{ marginBottom: "12px" }}>Estimated Burnt: ~1,398</p>
            <p style={{ marginBottom: "12px" }}>Total Burnt Value: ~55 ETH (~$108k)</p>
            <p style={{ marginBottom: "12px" }}>Burn mechanism: Holders sacrifice Normies to transfer action points for upgrades.</p>
            <p style={{ marginBottom: "12px" }}>Burnt tokens go to dead addresses – some metadata may still load.</p>
            <p style={{ marginTop: "20px", fontSize: "0.9rem" }}>Check Etherscan for burn transactions on contract.</p>
          </div>
        )}
      </div>

      {/* Donate Button & Modal */}
      <button
        onClick={() => setShowDonate(true)}
        style={{ position: "fixed", bottom: "30px", right: "30px", background: "#808080", border: "5px solid #000", padding: "18px 24px", borderRadius: "50%", fontSize: "1.8rem", cursor: "pointer", boxShadow: "8px 8px 0 #ff4500" }}
      >
        $
      </button>

      {showDonate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#f5f5dc", padding: "40px", border: "6px solid #000", boxShadow: "12px 12px 0 #ff4500", textAlign: "center", maxWidth: "420px" }}>
            <h2 style={{ marginBottom: "20px" }}>Support the Dev</h2>
            <p style={{ marginBottom: "25px" }}>Thanks for using the tool!<br />Any support is appreciated ❤️</p>
            <p style={{ wordBreak: "break-all", fontSize: "1rem", background: "#fff", padding: "15px", border: "4px solid #808080" }}>
              0x6d8D5a62Eec504f1B35cae050aDa790077B33e81
            </p>
            <button onClick={() => setShowDonate(false)} style={{ marginTop: "25px", padding: "12px 30px", background: "#808080", border: "4px solid #000", cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Fade-in animation */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          div[style*="display: flex; justify-content: center; gap:"] {
            flex-direction: column;
            gap: 40px !important;
          }
        }
      `}</style>

      <footer style={{ marginTop: "80px", fontSize: "0.8rem", color: "#000" }}>
        Powered by <a href="https://api.normies.art/" style={{ color: "#808080" }}>api.normies.art</a>
      </footer>
    </main>
  );
}