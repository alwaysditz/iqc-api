import { createCanvas } from "canvas";

export default async function handler(req, res) {
  try {
    const {
      time = "11:26",
      messageText = "Stay focused and keep building!",
      carrierName = "INDOSAT OOREDOO",
      batteryPercentage = "88",
      signalStrength = "4",
      author = "Unknown",
      subtitle = "",
    } = req.query;

    const battery = Math.max(0, Math.min(100, parseInt(batteryPercentage, 10)));
    const signal = Math.max(0, Math.min(5, parseInt(signalStrength, 10)));

    const WIDTH = 1024;
    const HEIGHT = 1024;
    const DPR = 2;
    const canvas = createCanvas(WIDTH * DPR, HEIGHT * DPR);
    const ctx = canvas.getContext("2d");
    ctx.scale(DPR, DPR);

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    gradient.addColorStop(0, "#0b1220");
    gradient.addColorStop(1, "#111827");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Time
    ctx.fillStyle = "#fff";
    ctx.font = "600 36px sans-serif";
    ctx.textBaseline = "top";
    ctx.fillText(time, 40, 40);

    // Carrier
    ctx.font = "500 28px sans-serif";
    ctx.fillText(
      carrierName,
      WIDTH / 2 - ctx.measureText(carrierName).width / 2,
      44
    );

    // Signal bars
    const bars = 5;
    const barW = 12;
    const barGap = 5;
    const baseX = WIDTH - 220;
    const baseY = 70;
    for (let i = 0; i < bars; i++) {
      const h = 12 + i * 6;
      const x = baseX + i * (barW + barGap);
      const y = baseY - h;
      ctx.fillStyle = i < signal ? "#fff" : "rgba(255,255,255,0.3)";
      ctx.fillRect(x, y, barW, h);
    }

    // Battery
    const bx = WIDTH - 120;
    const by = 50;
    const bw = 50;
    const bh = 22;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = battery < 15 ? "#ef4444" : "#22c55e";
    ctx.fillRect(
      bx + 3,
      by + 3,
      Math.max(2, Math.round((bw - 6) * (battery / 100))),
      bh - 6
    );
    ctx.fillStyle = "#fff";
    ctx.fillRect(bx + bw + 2, by + bh / 4, 4, bh / 2);

    // Author + subtitle
    ctx.font = "700 36px sans-serif";
    ctx.fillStyle = "#e5e7eb";
    ctx.fillText(author, 60, 150);
    if (subtitle) {
      ctx.font = "400 28px sans-serif";
      ctx.fillStyle = "#9ca3af";
      ctx.fillText(subtitle, 60, 190);
    }

    // Message text
    ctx.font = "500 32px sans-serif";
    ctx.fillStyle = "#f3f4f6";
    const maxWidth = WIDTH - 120;
    const words = messageText.split(/\s+/);
    let line = "";
    let y = 260;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, 60, y);
        line = words[n] + " ";
        y += 46;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, 60, y);

    res.setHeader("Content-Type", "image/png");
    res.send(canvas.toBuffer("image/png"));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Rendering failed", details: err.message });
  }
                                                       }
