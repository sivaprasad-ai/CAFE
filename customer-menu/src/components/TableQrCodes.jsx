import { useState } from "react";

export default function TableQrCodes({ onClose }) {
  const defaultOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";
  const [baseUrl, setBaseUrl] = useState(defaultOrigin);
  const [tableCount, setTableCount] = useState(9);

  const cleanBase = baseUrl.replace(/\/+$/, "");
  const tables = Array.from({ length: tableCount }, (_, i) => i + 1);

  const getQrUrl = (tableNum) => {
    const target = `${cleanBase}/?table=${tableNum}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=12&format=svg&data=${encodeURIComponent(target)}`;
  };

  const getTargetUrl = (tableNum) => `${cleanBase}/?table=${tableNum}`;

  const downloadQr = (tableNum) => {
    const link = document.createElement("a");
    link.href = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&margin=16&data=${encodeURIComponent(getTargetUrl(tableNum))}`;
    link.download = `raghuveer-cafe-table-${tableNum}-qr.png`;
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="table-qr-page">
      <div className="qr-controls-bar no-print">
        <div className="qr-controls-left">
          <div className="qr-brand-mini">
            <span className="qr-brand-logo">RC</span>
            <div>
              <h3>Table QR Generator</h3>
              <p>Raghuveer Cafe · Ready for 9 Tables</p>
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
              placeholder="e.g. https://raghuveercafe.com"
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
          <button className="owner-btn owner-btn-advance print-btn" onClick={() => window.print()}>
            🖨️ Print All {tableCount} Cards
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
        💡 <strong>Tip for Printing:</strong> Enter your live domain above (or use the current URL for testing), then click <strong>"Print All Cards"</strong>. Set destination to <em>Save as PDF</em> or your printer in <strong>A4 paper</strong> size.
      </div>

      <div className="qr-cards-grid">
        {tables.map((num) => {
          const targetUrl = getTargetUrl(num);
          const qrSrc = getQrUrl(num);

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
                  <span className="qr-url-text">{targetUrl}</span>
                </div>
              </div>

              <div className="qr-card-actions no-print">
                <button
                  type="button"
                  className="qr-download-btn"
                  onClick={() => downloadQr(num)}
                  title="Download high-resolution QR PNG"
                >
                  ⬇️ Download PNG
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
