import { useState } from "react";
import { LoginGate, isOwnerAuthenticated } from "../utils/auth";

function drawRoundRect(ctx, x, y, width, height, radius, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
    img.src = src;
  });
}

export default function TableQrCodes({ onClose }) {
  const [authed, setAuthed] = useState(isOwnerAuthenticated);
  const defaultOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const [baseUrl, setBaseUrl] = useState(defaultOrigin);
  const [tableCount, setTableCount] = useState(9);
  const [downloading, setDownloading] = useState(null); // tableNum | 'all' | null

  const cleanBase = baseUrl.replace(/\/+$/, "");
  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  const getTargetUrl = (tableNum) => `${cleanBase}/?table=${tableNum}`;

  const getQrUrl = (tableNum) => {
    const target = getTargetUrl(tableNum);
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&format=svg&data=${encodeURIComponent(target)}`;
  };

  const generateCardCanvas = async (tableNum) => {
    const targetUrl = getTargetUrl(tableNum);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=16&data=${encodeURIComponent(targetUrl)}`;

    const [logoImg, qrImg] = await Promise.all([
      loadImage("/images/logo.jpg").catch(() => null),
      loadImage(qrUrl),
    ]);

    const canvas = document.createElement("canvas");
    const width = 800;
    const height = 1060;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // 1. Crisp White Card Background
    ctx.fillStyle = "#ffffff";
    drawRoundRect(ctx, 10, 10, width - 20, height - 20, 36, true, false);

    // Subtle card border
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 3;
    drawRoundRect(ctx, 10, 10, width - 20, height - 20, 36, false, true);

    // 2. Circular Logo
    const logoY = 60;
    const logoRadius = 46;
    if (logoImg) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(width / 2, logoY + logoRadius, logoRadius, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(logoImg, width / 2 - logoRadius, logoY, logoRadius * 2, logoRadius * 2);
      ctx.restore();

      // Logo warm gold ring
      ctx.beginPath();
      ctx.arc(width / 2, logoY + logoRadius, logoRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "#d4a373";
      ctx.lineWidth = 3;
      ctx.stroke();
    }

    // 3. Cafe Title & Tagline
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillStyle = "#1c1917";
    ctx.font = "bold 34px 'Outfit', 'Inter', system-ui, -apple-system, sans-serif";
    ctx.fillText("Raghuveer Cafe", width / 2, 192);

    ctx.fillStyle = "#78716c";
    ctx.font = "500 17px system-ui, -apple-system, sans-serif";
    ctx.fillText("A Smile In Every Bite", width / 2, 226);

    // 4. Pill Badge: TABLE X
    const badgeW = 200;
    const badgeH = 46;
    const badgeY = 258;
    ctx.fillStyle = "#1c1917";
    drawRoundRect(ctx, width / 2 - badgeW / 2, badgeY, badgeW, badgeH, badgeH / 2, true, false);

    ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
    ctx.fillStyle = "#ffffff";
    ctx.fillText("TABLE ", width / 2 - 16, badgeY + badgeH / 2);

    ctx.fillStyle = "#f59e0b";
    ctx.font = "bold 23px system-ui, -apple-system, sans-serif";
    ctx.fillText(String(tableNum), width / 2 + 34, badgeY + badgeH / 2);

    // 5. QR Code Box
    const qrBoxSize = 420;
    const qrBoxY = 328;
    ctx.fillStyle = "#ffffff";
    ctx.strokeStyle = "#f3f4f6";
    ctx.lineWidth = 2;
    drawRoundRect(ctx, width / 2 - qrBoxSize / 2, qrBoxY, qrBoxSize, qrBoxSize, 24, true, true);

    // Draw QR Code
    const qrImgSize = 380;
    ctx.drawImage(
      qrImg,
      width / 2 - qrImgSize / 2,
      qrBoxY + (qrBoxSize - qrImgSize) / 2,
      qrImgSize,
      qrImgSize
    );

    // 6. Scan Instruction
    ctx.fillStyle = "#c2410c";
    ctx.font = "bold 22px system-ui, -apple-system, sans-serif";
    ctx.fillText("📱 SCAN TO ORDER", width / 2, 790);

    ctx.fillStyle = "#78716c";
    ctx.font = "16px system-ui, -apple-system, sans-serif";
    ctx.fillText("Point phone camera · No app needed", width / 2, 824);

    // 7. Perks Badges
    const perk1 = "🌿 100% Pure Veg";
    const perk2 = "⚡ Quick Service";
    ctx.font = "600 15px system-ui, -apple-system, sans-serif";

    // Perk 1
    const p1w = 170;
    const p1x = width / 2 - p1w - 10;
    const py = 862;
    const ph = 34;
    ctx.fillStyle = "#ecfdf5";
    ctx.strokeStyle = "#a7f3d0";
    ctx.lineWidth = 1;
    drawRoundRect(ctx, p1x, py, p1w, ph, ph / 2, true, true);
    ctx.fillStyle = "#065f46";
    ctx.fillText(perk1, p1x + p1w / 2, py + ph / 2);

    // Perk 2
    const p2w = 160;
    const p2x = width / 2 + 10;
    ctx.fillStyle = "#fefce8";
    ctx.strokeStyle = "#fde047";
    ctx.lineWidth = 1;
    drawRoundRect(ctx, p2x, py, p2w, ph, ph / 2, true, true);
    ctx.fillStyle = "#854d0e";
    ctx.fillText(perk2, p2x + p2w / 2, py + ph / 2);

    // 8. Dashed Divider
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(90, 930);
    ctx.lineTo(width - 90, 930);
    ctx.stroke();
    ctx.setLineDash([]);

    // 9. Footer Branding (clean, no raw URL)
    ctx.fillStyle = "#78716c";
    ctx.font = "600 16px 'Outfit', 'Inter', system-ui, sans-serif";
    ctx.fillText("Raghuveer Cafe · Table " + tableNum, width / 2, 970);

    return canvas;
  };

  const downloadCardPng = async (tableNum) => {
    setDownloading(tableNum);
    try {
      const canvas = await generateCardCanvas(tableNum);
      const link = document.createElement("a");
      link.download = `raghuveer-cafe-table-${tableNum}-card.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Failed to generate card PNG:", err);
      alert("Could not generate card PNG. Please try again.");
    } finally {
      setDownloading(null);
    }
  };

  const downloadAllCards = async () => {
    setDownloading("all");
    try {
      for (const num of tables) {
        const canvas = await generateCardCanvas(num);
        const link = document.createElement("a");
        link.download = `raghuveer-cafe-table-${num}-card.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
        // brief pause so browser allows multi-file downloads
        await new Promise((r) => setTimeout(r, 400));
      }
    } catch (err) {
      console.error("Failed to download all cards:", err);
      alert("Error generating some cards. Please try downloading individually.");
    } finally {
      setDownloading(null);
    }
  };

  const downloadQrOnly = (tableNum) => {
    const link = document.createElement("a");
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=16&data=${encodeURIComponent(getTargetUrl(tableNum))}`;
    link.download = `raghuveer-cafe-table-${tableNum}-qr.png`;
    link.target = "_blank";
    link.click();
  };

  if (!authed) {
    return <LoginGate onSuccess={() => setAuthed(true)} onCancel={onClose} />;
  }

  return (
    <div className="table-qr-page">
      <div className="qr-controls-bar no-print">
        <div className="qr-controls-left">
          <div className="qr-brand-mini">
            <span className="qr-brand-logo">RC</span>
            <div>
              <h3>Table QR Generator</h3>
              <p>Raghuveer Cafe · Ready for {tableCount} Tables</p>
            </div>
          </div>
        </div>

        <div className="qr-controls-center">
          <label className="qr-input-group">
            <span>Website Domain / URL:</span>
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="e.g. https://raghuveercafe.shop"
            />
          </label>

          <label className="qr-input-group small">
            <span>Tables:</span>
            <input
              type="number"
              min="1"
              max="30"
              value={tableCount}
              onChange={(e) => setTableCount(Math.max(1, Number(e.target.value) || 1))}
            />
          </label>
        </div>

        <div className="qr-controls-right">
          <button
            className="owner-btn owner-btn-advance print-btn"
            onClick={downloadAllCards}
            disabled={downloading !== null}
            title="Download full standee card PNG for every table"
          >
            {downloading === "all" ? "⏳ Generating Cards..." : `⬇️ Download All ${tableCount} Cards`}
          </button>
          <button className="owner-btn owner-btn-advance print-btn" onClick={() => window.print()}>
            🖨️ Print All Cards
          </button>
          {onClose ? (
            <button className="owner-btn owner-btn-cancel" onClick={onClose}>
              ✕ Close
            </button>
          ) : (
            <a href="/?owner" className="owner-btn owner-btn-cancel" style={{ textDecoration: "none" }}>
              ← Dashboard
            </a>
          )}
        </div>
      </div>

      <div className="qr-print-tip no-print">
        💡 <strong>Tip:</strong> Click <strong>"Download Card PNG"</strong> on any table card to download the complete standee image with the logo, title, table badge, and QR code ready for printing or acrylic stands.
      </div>

      <div className="qr-cards-grid">
        {tables.map((num) => {
          const targetUrl = getTargetUrl(num);
          const qrSrc = getQrUrl(num);
          const isThisDownloading = downloading === num;

          return (
            <div className="qr-standee-card" key={num}>
              <div className="qr-card-inner">
                <div className="qr-card-header">
                  <img src="/images/logo.jpg" alt="Raghuveer Cafe" className="qr-card-logo" />
                  <div className="qr-card-title">Raghuveer Cafe</div>
                  <div className="qr-card-tagline">A Smile In Every Bite</div>
                </div>

                <div className="qr-table-badge">
                  TABLE <span>{num}</span>
                </div>

                <div className="qr-image-wrapper">
                  <img
                    src={qrSrc}
                    alt={`QR Code for Table ${num}`}
                    className="qr-code-img"
                    loading="lazy"
                  />
                </div>

                <div className="qr-scan-instruction">
                  <div className="qr-scan-title">📱 SCAN TO ORDER</div>
                  <div className="qr-scan-sub">Point phone camera · No app needed</div>
                </div>

                <div className="qr-perks">
                  <span>🌿 100% Pure Veg</span>
                  <span>⚡ Quick Service</span>
                </div>

                <div className="qr-card-footer">
                  <span className="qr-url-text">Raghuveer Cafe · Table {num}</span>
                </div>
              </div>

              <div className="qr-card-actions no-print">
                <button
                  type="button"
                  className="qr-download-btn primary-download-btn"
                  onClick={() => downloadCardPng(num)}
                  disabled={downloading !== null}
                  title="Download complete standee card PNG"
                >
                  {isThisDownloading ? "⏳ Generating Card..." : "⬇️ Download Card PNG"}
                </button>
                <button
                  type="button"
                  className="qr-download-btn-sub"
                  onClick={() => downloadQrOnly(num)}
                  title="Download only the square QR code"
                >
                  QR Only
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
