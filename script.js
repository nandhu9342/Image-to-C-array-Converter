const $ = (id) => document.getElementById(id);

const fileInput = $("fileInput");
const dropzone = $("dropzone");
const fileInfo = $("fileInfo");
const fileThumb = $("fileThumb");
const fileName = $("fileName");
const fileDimensions = $("fileDimensions");
const removeFile = $("removeFile");
const preset = $("preset");
const widthInput = $("width");
const heightInput = $("height");
const resizeMode = $("resizeMode");
const rotation = $("rotation");
const swapBytes = $("swapBytes");
const progmem = $("progmem");
const convertBtn = $("convertBtn");
const previewCanvas = $("previewCanvas");
const previewStage = $("previewStage");
const previewMeta = $("previewMeta");
const outputMeta = $("outputMeta");
const codeOutput = $("codeOutput");
const copyBtn = $("copyBtn");
const downloadBtn = $("downloadBtn");
const downloadExampleBtn = $("downloadExampleBtn");
const memoryEstimate = $("memoryEstimate");
const memoryStatus = $("memoryStatus");
const toast = $("toast");

let sourceImage = null;
let sourceFile = null;
let generatedCode = "";

const presets = {
  "ili9341-240x320": [240, 320],
  "st7735-128x160": [128, 160],
  "st7789-240x240": [240, 240],
  "st7789-320x240": [320, 240]
};

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function updateMemory() {
  const w = Math.max(1, Number(widthInput.value) || 1);
  const h = Math.max(1, Number(heightInput.value) || 1);
  const bytes = w * h * 2;
  const kb = bytes / 1024;
  memoryEstimate.textContent = kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${kb.toFixed(1)} KB`;
  memoryStatus.className = "status";
  if (bytes <= 512 * 1024) {
    memoryStatus.textContent = "Good for flash";
    memoryStatus.classList.add("good");
  } else if (bytes <= 2 * 1024 * 1024) {
    memoryStatus.textContent = "Large array";
    memoryStatus.classList.add("warn");
  } else {
    memoryStatus.textContent = "Very large";
    memoryStatus.classList.add("high");
  }
}

function setPreset() {
  if (preset.value !== "custom") {
    const [w, h] = presets[preset.value];
    widthInput.value = w;
    heightInput.value = h;
  }
  updateMemory();
}

function loadFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("Please choose a valid image file.");
    return;
  }

  sourceFile = file;
  const url = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    sourceImage = img;
    fileName.textContent = file.name;
    fileDimensions.textContent = `${img.naturalWidth} × ${img.naturalHeight}px`;
    fileThumb.src = url;
    fileInfo.classList.remove("hidden");
    convertBtn.disabled = false;
    previewMeta.textContent = `${img.naturalWidth} × ${img.naturalHeight}px source`;
    drawPreview();
    showToast("Image loaded.");
  };

  img.onerror = () => showToast("Could not read this image.");
  img.src = url;
}

function clearFile() {
  sourceImage = null;
  sourceFile = null;
  fileInput.value = "";
  fileInfo.classList.add("hidden");
  convertBtn.disabled = true;
  previewCanvas.hidden = true;
  previewStage.querySelector(".empty-preview")?.classList.remove("hidden");
  previewMeta.textContent = "No image selected";
  outputMeta.textContent = "Convert an image to generate code.";
  codeOutput.value = "";
  generatedCode = "";
  copyBtn.disabled = true;
  downloadBtn.disabled = true;
}

function getCropRect(sw, sh, dw, dh, mode) {
  if (mode === "stretch") return { sx: 0, sy: 0, sw, sh };

  const srcRatio = sw / sh;
  const dstRatio = dw / dh;

  if (mode === "fit") {
    return { sx: 0, sy: 0, sw, sh };
  }

  if (srcRatio > dstRatio) {
    const newW = sh * dstRatio;
    return { sx: (sw - newW) / 2, sy: 0, sw: newW, sh };
  } else {
    const newH = sw / dstRatio;
    return { sx: 0, sy: (sh - newH) / 2, sw, sh: newH };
  }
}

function drawToCanvas(canvas, w, h) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.imageSmoothingEnabled = true;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, w, h);

  const angle = Number(rotation.value);
  const crop = getCropRect(sourceImage.naturalWidth, sourceImage.naturalHeight, w, h, resizeMode.value);

  if (resizeMode.value === "fit") {
    const scale = Math.min(w / sourceImage.naturalWidth, h / sourceImage.naturalHeight);
    const drawW = sourceImage.naturalWidth * scale;
    const drawH = sourceImage.naturalHeight * scale;
    const x = (w - drawW) / 2;
    const y = (h - drawH) / 2;
    ctx.drawImage(sourceImage, x, y, drawW, drawH);
  } else {
    ctx.drawImage(sourceImage, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, w, h);
  }

  if (angle !== 0) {
    const temp = document.createElement("canvas");
    temp.width = w;
    temp.height = h;
    const t = temp.getContext("2d");
    t.drawImage(canvas, 0, 0);

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(angle * Math.PI / 180);
    if (angle === 90 || angle === 270) {
      ctx.drawImage(temp, -h / 2, -w / 2, h, w);
    } else {
      ctx.drawImage(temp, -w / 2, -h / 2, w, h);
    }
    ctx.restore();
  }

  return ctx;
}

function drawPreview() {
  if (!sourceImage) return;
  const w = Number(widthInput.value);
  const h = Number(heightInput.value);
  if (!w || !h) return;

  previewCanvas.width = w;
  previewCanvas.height = h;
  drawToCanvas(previewCanvas, w, h);
  previewCanvas.hidden = false;
  previewStage.querySelector(".empty-preview")?.classList.add("hidden");
  previewMeta.textContent = `${w} × ${h}px · RGB565 preview`;
}

function rgb888To565(r, g, b) {
  return ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
}

function swap16(v) {
  return ((v & 0xFF) << 8) | ((v >> 8) & 0xFF);
}

function hex4(v) {
  return "0x" + v.toString(16).toUpperCase().padStart(4, "0");
}

function makeIdentifier(name) {
  let base = name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_]/g, "_");
  if (!base) base = "image";
  if (/^\d/.test(base)) base = "_" + base;
  return base.toLowerCase() + "_rgb565";
}

function generateArray() {
  if (!sourceImage) return;

  const w = Number(widthInput.value);
  const h = Number(heightInput.value);
  if (w < 1 || h < 1 || w > 2048 || h > 2048) {
    showToast("Width and height must be between 1 and 2048.");
    return;
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = drawToCanvas(canvas, w, h);
  const pixels = ctx.getImageData(0, 0, w, h).data;

  const values = [];
  for (let i = 0; i < pixels.length; i += 4) {
    let v = rgb888To565(pixels[i], pixels[i + 1], pixels[i + 2]);
    if (swapBytes.checked) v = swap16(v);
    values.push(hex4(v));
  }

  const identifier = makeIdentifier(sourceFile?.name || "image");
  const storage = progmem.checked ? " PROGMEM" : "";
  const lines = [];
  lines.push("// Generated by ESP32 Image → C Array Converter v1.0.0");
  lines.push(`// ${w} × ${h}px · RGB565 · ${values.length * 2} bytes`);
  lines.push("// https://github.com/nandhu9342/esp32-image-to-c-array");
  lines.push("");
  if (progmem.checked) lines.push("#include <pgmspace.h>");
  lines.push("");
  lines.push(`const uint16_t ${identifier}[]${storage ? " PROGMEM": ""} = {)`;

  const perLine = 12;
  for (let i = 0; i < values.length; i += perLine) {
    lines.push("  " + values.slice(i, i + perLine).join(", ") + (i + perLine < values.length ? "," : ""));
  }
  lines.push("};");
  lines.push("");
  lines.push(`// Dimensions: ${w} × ${h}`);
  lines.push(`// Draw with: tft.pushImage(0, 0, ${w}, ${h}, ${identifier});`);

  generatedCode = lines.join("\n");
  codeOutput.value = generatedCode;
  outputMeta.textContent = `${values.length.toLocaleString()} pixels · ${(values.length * 2 / 1024).toFixed(1)} KB`;
  copyBtn.disabled = false;
  downloadBtn.disabled = false;
  showToast("C array generated successfully.");
}

function downloadText(filename, text, type = "text/plain") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function makeExample() {
  const w = Number(widthInput.value) || 240;
  const h = Number(heightInput.value) || 320;
  const identifier = makeIdentifier(sourceFile?.name || "image");
  return `/*
  ESP32 TFT example generated for:
  ${w} × ${h} RGB565 image

  Library: TFT_eSPI
  Before uploading, configure TFT_eSPI/User_Setup.h for your display.
*/

#include <TFT_eSPI.h>
${progmem.checked ? "#include <pgmspace.h>\n" : ""}
TFT_eSPI tft = TFT_eSPI();

#include "image_rgb565.h"

void setup() {
  tft.init();
  tft.setRotation(0);
  tft.fillScreen(TFT_BLACK);
  tft.pushImage(0, 0, ${w}, ${h}, ${identifier});
}

void loop() {
}
`;
}

fileInput.addEventListener("change", e => loadFile(e.target.files[0]));
removeFile.addEventListener("click", clearFile);
preset.addEventListener("change", setPreset);

[widthInput, heightInput, resizeMode, rotation, swapBytes, progmem].forEach(el => {
  el.addEventListener("input", () => { updateMemory(); if (sourceImage) drawPreview(); });
  el.addEventListener("change", () => { updateMemory(); if (sourceImage) drawPreview(); });
});

convertBtn.addEventListener("click", generateArray);

copyBtn.addEventListener("click", async () => {
  if (!generatedCode) return;
  try {
    await navigator.clipboard.writeText(generatedCode);
    showToast("Code copied to clipboard.");
  } catch {
    codeOutput.select();
    document.execCommand("copy");
    showToast("Code copied.");
  }
});

downloadBtn.addEventListener("click", () => {
  if (!generatedCode) return;
  downloadText("image_rgb565.h", generatedCode, "text/x-c");
  showToast("Header downloaded.");
});

downloadExampleBtn.addEventListener("click", () => {
  downloadText("esp32_tft_example.ino", makeExample(), "text/plain");
  showToast("Arduino example downloaded.");
});

$("resetBtn").addEventListener("click", () => {
  preset.value = "ili9341-240x320";
  widthInput.value = 240;
  heightInput.value = 320;
  resizeMode.value = "fit";
  rotation.value = "0";
  swapBytes.checked = false;
  progmem.checked = true;
  updateMemory();
  if (sourceImage) drawPreview();
  showToast("Settings reset.");
});

["dragenter", "dragover"].forEach(type => dropzone.addEventListener(type, e => {
  e.preventDefault();
  dropzone.classList.add("dragover");
}));
["dragleave", "drop"].forEach(type => dropzone.addEventListener(type, e => {
  e.preventDefault();
  dropzone.classList.remove("dragover");
}));
dropzone.addEventListener("drop", e => loadFile(e.dataTransfer.files[0]));

updateMemory();
