/* ============================================
   QR Scanner — Upgrade Ready Module
   (Safe placeholder — does not break logic)
===============================================*/

let qrScannerActive = false;
let qrStream = null;

function openQRScanner(){

  if(qrScannerActive){
    closeQRScanner();
    return;
  }

  qrScannerActive = true;

  // Create overlay container
  const overlay = document.createElement("div");
  overlay.id = "qrOverlay";
  overlay.style.cssText = `
    position:fixed;
    inset:0;
    background:#000000cc;
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:9999;
    backdrop-filter:blur(4px);
  `;

  // Scanner card
  overlay.innerHTML = `
    <div style="
      background:#ffffffee;
      border-radius:18px;
      padding:18px;
      width:360px;
      text-align:center;
      box-shadow:0 22px 48px #00000055;
      border:1px solid #e2e4ef;
    ">

      <h3 style="margin:6px 0 12px">QR Code Scanner</h3>

      <video id="qrVideo" style="
        width:100%;
        border-radius:14px;
        border:1px solid #ccd2e2;
        background:#111;
      " autoplay muted></video>

      <p style="opacity:.7;font-size:.9rem;margin-top:8px">
        Align QR inside frame
      </p>

      <button onclick="closeQRScanner()" style="
        margin-top:10px;
        padding:10px 14px;
        border-radius:10px;
        border:1px solid #c4cad8;
        cursor:pointer;
      ">
        ✖ Close Scanner
      </button>

    </div>
  `;

  document.body.appendChild(overlay);


  /* ==========================
     Camera Access
  ===========================*/
  navigator.mediaDevices.getUserMedia({
    video:{ facingMode:"environment" }
  })
  .then(stream => {

    qrStream = stream;

    const video = document.getElementById("qrVideo");
    video.srcObject = stream;

    // 🔹 Placeholder — Decoder Hook
    // (Ready for jsQR / ZXing)
    video.onloadedmetadata = () => {
      console.log("📷 QR Scanner Ready — decoder can be attached");
    };

  })
  .catch(err => {

    document.getElementById("qrOverlay")
    .innerHTML = `
      <div style="
        background:#fff;
        border-radius:16px;
        padding:18px;
        width:360px;
        text-align:center;
      ">
        <h3>Camera Access Blocked</h3>
        <p style="opacity:.75">
          Please enable camera permission and try again.
        </p>

        <button onclick="closeQRScanner()" class="danger">
          Close
        </button>
      </div>
    `;

    console.warn("Camera permission denied", err);
  });
}


/* ==========================
   Close Scanner
==========================*/

function closeQRScanner(){

  qrScannerActive = false;

  if(qrStream){
    qrStream.getTracks().forEach(t => t.stop());
    qrStream = null;
  }

  document.getElementById("qrOverlay")?.remove();
}
