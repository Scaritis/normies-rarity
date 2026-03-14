"use client";
import { useState } from "react";
import { Press_Start_2P } from "next/font/google";

const pixelFont = Press_Start_2P({ weight: "400", subsets: ["latin"] });

export default function Home() {
  const [tokenId, setTokenId] = useState("");
  const [compareId, setCompareId] = useState("");
  const [nftData, setNftData] = useState<any>(null);
  const [compareData, setCompareData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("compare");
  const [loading, setLoading] = useState(false);
  const [showDonate, setShowDonate] = useState(false);

  const fetchNFT = async (id: string, setData: any) => {
    if (!id || isNaN(Number(id))) {
      setError("Enter valid Token ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://api.normies.art/normie/${id}/metadata`);
      const data = await res.json();
      setData(data);
    } catch {
      setError("Failed to fetch Normie");
    }

    setLoading(false);
  };

  const getImage = (data: any) =>
    data
      ? `https://api.normies.art/normie/${data.name.split("#")[1]}/image.svg`
      : "";

  const renderNFT = (data: any) => {
    if (!data) return null;

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
        <h2 style={{ textAlign: "center", fontSize: "0.9rem" }}>
          {data.name}
        </h2>

        <img
          src={getImage(data)}
          style={{
            width: "100%",
            border: "6px solid black",
            margin: "20px 0",
            imageRendering: "pixelated",
          }}
        />

        <div
          style={{
            fontSize: "0.7rem",
            border: "4px solid gray",
            padding: "10px",
            background: "#fff",
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
        background: "#f5f5dc",
        minHeight: "100vh",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h1
        style={{
          fontSize: "1.8rem",
          marginBottom: "40px",
          textShadow: "4px 4px #ff6a00",
        }}
      >
        Normies Rarity Checker
      </h1>

      {/* Tabs */}

      <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
        {["compare", "market", "burnt"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "12px 24px",
              border: "4px solid black",
              background: activeTab === tab ? "#ff6a00" : "#fff",
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
            padding: "10px",
            border: "4px solid black",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      {/* Compare */}

      {activeTab === "compare" && (
        <>
          <div style={{ display: "flex", gap: "20px", marginBottom: "40px" }}>
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
                  border: "4px solid black",
                  marginRight: "10px",
                }}
              />

              <button
                style={{
                  padding: "10px 20px",
                  border: "4px solid black",
                  background: "#ff6a00",
                }}
                disabled={loading}
              >
                {loading ? "SCANNING..." : "SCAN"}
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
                  border: "4px solid black",
                  marginRight: "10px",
                }}
              />

              <button
                style={{
                  padding: "10px 20px",
                  border: "4px solid black",
                  background: "#ff6a00",
                }}
              >
                COMPARE
              </button>
            </form>
          </div>

          <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
            {renderNFT(nftData)}
            {renderNFT(compareData)}
          </div>
        </>
      )}

      {/* Market */}

      {activeTab === "market" && (
        <div
          style={{
            background: "#fff",
            padding: "40px",
            border: "6px solid black",
            boxShadow: "10px 10px 0 #ff6a00",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>Market Stats</h2>

          <p>Active Supply: 8,602</p>
          <p>Unique Holders: ~1,800</p>
          <p>Floor Price: ~0.05 ETH</p>
          <p>24h Volume: ~8 ETH</p>
          <p>Total Volume: ~630 ETH</p>
        </div>
      )}

      {/* Burnt */}

      {activeTab === "burnt" && (
        <div
          style={{
            background: "#fff",
            padding: "40px",
            border: "6px solid black",
            boxShadow: "10px 10px 0 #ff6a00",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: "20px" }}>Burnt Normies</h2>

          <p>Estimated Burnt: ~1,398</p>
          <p>Total Burnt Value: ~55 ETH</p>
          <p>Normies can be sacrificed to transfer action points for upgrades.</p>
        </div>
      )}

      {/* Donate */}

      <button
        onClick={() => setShowDonate(true)}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: "#ff6a00",
          border: "5px solid black",
          padding: "16px",
          cursor: "pointer",
        }}
      >
        $
      </button>

      {showDonate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "40px",
              border: "6px solid black",
              textAlign: "center",
            }}
          >
            <h2>Support the Dev</h2>

            <p style={{ margin: "20px 0" }}>
              0x6d8D5a62Eec504f1B35cae050aDa790077B33e81
            </p>

            <button
              onClick={() => setShowDonate(false)}
              style={{
                padding: "10px 20px",
                border: "4px solid black",
                background: "#ff6a00",
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