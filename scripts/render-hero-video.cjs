const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "assets", "video");
const format = (process.env.HERO_VIDEO_FORMAT || "webm").toLowerCase();
const outputVideo = path.join(outDir, `xijian-hero-film.${format}`);
const outputPoster = path.join(outDir, "xijian-hero-poster.jpg");

const images = {
  hall: path.join(root, "assets", "real", "hero-gilded-hall.jpg"),
  veil: path.join(root, "assets", "bridal", "bridal-veil-editorial.jpg"),
  atelier: path.join(root, "assets", "bridal", "bridal-atelier-wide.jpg"),
};

function dataUrl(file) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const mime = ext === "png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${fs.readFileSync(file).toString("base64")}`;
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });

  const executablePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--autoplay-policy=no-user-gesture-required"],
  });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

  const result = await page.evaluate(
    async ({ assets, format }) => {
      const width = 1920;
      const height = 1080;
      const fps = 30;
      const duration = 10000;
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      document.body.style.margin = "0";
      document.body.style.background = "#221f1b";
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d", { alpha: false });

      function loadImage(src) {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      }

      const [hall, veil, atelier] = await Promise.all([
        loadImage(assets.hall),
        loadImage(assets.veil),
        loadImage(assets.atelier),
      ]);

      const grain = document.createElement("canvas");
      grain.width = 384;
      grain.height = 216;
      const g = grain.getContext("2d");
      let seed = 42;
      function rand() {
        seed = (seed * 1664525 + 1013904223) >>> 0;
        return seed / 4294967296;
      }
      const grainImage = g.createImageData(grain.width, grain.height);
      for (let i = 0; i < grainImage.data.length; i += 4) {
        const v = 200 + Math.floor(rand() * 55);
        grainImage.data[i] = v;
        grainImage.data[i + 1] = v;
        grainImage.data[i + 2] = v;
        grainImage.data[i + 3] = Math.floor(rand() * 32);
      }
      g.putImageData(grainImage, 0, 0);

      function cover(img, x, y, w, h, scale = 1, shiftX = 0, shiftY = 0) {
        const ratio = Math.max(w / img.width, h / img.height) * scale;
        const dw = img.width * ratio;
        const dh = img.height * ratio;
        ctx.drawImage(img, x + (w - dw) / 2 + shiftX, y + (h - dh) / 2 + shiftY, dw, dh);
      }

      function smoothstep(a, b, x) {
        const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
      }

      function draw(t) {
        const tau = Math.PI * 2;
        const breathe = 0.5 - Math.cos(tau * t) * 0.5;
        const driftX = Math.sin(tau * t) * 18;
        const driftY = Math.sin(tau * t + 0.65) * 9;

        ctx.save();
        ctx.fillStyle = "#221f1b";
        ctx.fillRect(0, 0, width, height);

        ctx.globalAlpha = 1;
        cover(hall, 0, 0, width, height, 1.045 + breathe * 0.042, driftX, driftY - 10);

        ctx.globalCompositeOperation = "screen";
        ctx.globalAlpha = 0.12 + 0.06 * Math.sin(tau * t + 1.3);
        cover(atelier, width * 0.54, height * 0.42, width * 0.48, height * 0.62, 1.16, -22 * Math.sin(tau * t), 16 * Math.cos(tau * t));
        ctx.globalAlpha = 0.15 + 0.04 * Math.sin(tau * t + 2.1);
        cover(veil, width * 0.56, -height * 0.08, width * 0.5, height * 1.18, 1.12, -28 * Math.sin(tau * t + 0.2), 8 * Math.cos(tau * t));
        ctx.globalCompositeOperation = "source-over";

        let radial = ctx.createRadialGradient(width * 0.74, height * 0.28, 0, width * 0.74, height * 0.28, width * 0.45);
        radial.addColorStop(0, "rgba(244,223,183,0.27)");
        radial.addColorStop(0.45, "rgba(183,138,72,0.1)");
        radial.addColorStop(1, "rgba(183,138,72,0)");
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, width, height);

        const leftShade = ctx.createLinearGradient(0, 0, width, 0);
        leftShade.addColorStop(0, "rgba(20,24,22,0.88)");
        leftShade.addColorStop(0.42, "rgba(20,24,22,0.58)");
        leftShade.addColorStop(0.74, "rgba(20,24,22,0.26)");
        leftShade.addColorStop(1, "rgba(20,24,22,0.18)");
        ctx.fillStyle = leftShade;
        ctx.fillRect(0, 0, width, height);

        const bottomShade = ctx.createLinearGradient(0, 0, 0, height);
        bottomShade.addColorStop(0, "rgba(36,62,54,0.1)");
        bottomShade.addColorStop(0.62, "rgba(34,31,27,0.05)");
        bottomShade.addColorStop(1, "rgba(34,31,27,0.56)");
        ctx.fillStyle = bottomShade;
        ctx.fillRect(0, 0, width, height);

        const sweepPhase = t;
        const sweepX = -width * 0.45 + width * 1.9 * sweepPhase;
        const sweepOpacity = Math.sin(Math.PI * sweepPhase) ** 2 * 0.42;
        ctx.save();
        ctx.globalAlpha = sweepOpacity;
        ctx.translate(sweepX, 0);
        ctx.transform(1, 0, -0.28, 1, 0, 0);
        const sweep = ctx.createLinearGradient(0, 0, width * 0.38, 0);
        sweep.addColorStop(0, "rgba(244,223,183,0)");
        sweep.addColorStop(0.48, "rgba(244,223,183,0.5)");
        sweep.addColorStop(1, "rgba(244,223,183,0)");
        ctx.fillStyle = sweep;
        ctx.fillRect(0, -height * 0.1, width * 0.38, height * 1.2);
        ctx.restore();

        const brandOpacity = smoothstep(0.48, 0.62, t) * (1 - smoothstep(0.84, 0.98, t));
        ctx.save();
        ctx.globalAlpha = brandOpacity * 0.42;
        ctx.textAlign = "right";
        ctx.fillStyle = "#fffdf8";
        ctx.shadowColor = "rgba(0,0,0,0.38)";
        ctx.shadowBlur = 34;
        ctx.font = '600 96px "Songti SC", "SimSun", serif';
        ctx.fillText("禧见文化", width * 0.9, height * 0.72);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = brandOpacity * 0.66;
        ctx.fillStyle = "#f4dfb7";
        ctx.font = '700 22px Arial, sans-serif';
        ctx.fillText("XI JIAN CULTURE", width * 0.9, height * 0.775);
        ctx.strokeStyle = "rgba(244,223,183,0.52)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width * 0.7, height * 0.665);
        ctx.lineTo(width * 0.9, height * 0.665);
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.globalAlpha = 0.12;
        ctx.globalCompositeOperation = "overlay";
        const pattern = ctx.createPattern(grain, "repeat");
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
        ctx.restore();

        ctx.restore();
      }

      draw(0.52);
      const poster = canvas.toDataURL("image/jpeg", 0.88).split(",")[1];

      const stream = canvas.captureStream(fps);
      const types = format === "mp4"
        ? [
            "video/mp4;codecs=avc1.42E01E",
            "video/mp4",
          ]
        : [
            "video/webm;codecs=vp9",
            "video/webm;codecs=vp8",
            "video/webm",
          ];
      const mimeType = types.find((type) => MediaRecorder.isTypeSupported(type)) || "";
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 6200000 });
      const chunks = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size) chunks.push(event.data);
      };

      const done = new Promise((resolve) => {
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: mimeType || "video/webm" });
          const reader = new FileReader();
          reader.onloadend = () => resolve({ video: reader.result.split(",")[1], poster, mimeType: blob.type, size: blob.size });
          reader.readAsDataURL(blob);
        };
      });

      recorder.start(100);
      const start = performance.now();
      await new Promise((resolve) => {
        function frame(now) {
          const elapsed = Math.min(now - start, duration);
          draw(elapsed / duration);
          if (elapsed < duration) {
            requestAnimationFrame(frame);
          } else {
            resolve();
          }
        }
        requestAnimationFrame(frame);
      });
      recorder.stop();
      return done;
    },
    {
      assets: {
        hall: dataUrl(images.hall),
        veil: dataUrl(images.veil),
        atelier: dataUrl(images.atelier),
      },
      format,
    },
  );

  fs.writeFileSync(outputVideo, Buffer.from(result.video, "base64"));
  fs.writeFileSync(outputPoster, Buffer.from(result.poster, "base64"));
  await browser.close();

  console.log(JSON.stringify({
    video: path.relative(root, outputVideo),
    poster: path.relative(root, outputPoster),
    mimeType: result.mimeType,
    bytes: fs.statSync(outputVideo).size,
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
