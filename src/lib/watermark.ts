/** Burns the VIXL lockup into the bottom-right of a still before it is stored. */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function drawMark(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size / 32;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  roundRect(ctx, 0, 0, 32, 32, 7);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.strokeStyle = "#f4f4f1";
  ctx.lineWidth = 1.25;
  roundRect(ctx, 3, 3, 26, 26, 4);
  ctx.stroke();
  ctx.strokeStyle = "#f4f4f1";
  ctx.lineWidth = 2.8;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(10, 8.5);
  ctx.lineTo(16, 23.5);
  ctx.lineTo(22, 8.5);
  ctx.stroke();
  ctx.strokeStyle = "#d4cfc8";
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.moveTo(16, 5.2);
  ctx.lineTo(16, 7.6);
  ctx.moveTo(16, 24.4);
  ctx.lineTo(16, 26.8);
  ctx.stroke();
  ctx.restore();
}

function paintLockup(ctx: CanvasRenderingContext2D, width: number, height: number) {
  const short = Math.min(width, height);
  const mark = Math.max(40, Math.min(Math.round(short * 0.068), 92));
  const pad = Math.max(18, Math.round(short * 0.032));
  const gap = Math.round(mark * 0.22);
  const titleSize = Math.round(mark * 0.4);
  const subSize = Math.round(titleSize * 0.42);

  ctx.font = `600 ${titleSize}px Syne, "Inter Tight", sans-serif`;
  const title = "VIXL";
  const titleW = ctx.measureText(title).width;
  ctx.font = `500 ${subSize}px "Inter Tight", sans-serif`;
  const sub = "© Visual Excellence Lab";
  const subW = ctx.measureText(sub).width;
  const textW = Math.max(titleW, subW);
  const boxW = mark + gap + textW;
  const boxH = mark;
  const x = width - pad - boxW;
  const y = height - pad - boxH;

  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.48)";
  roundRect(
    ctx,
    x - pad * 0.4,
    y - pad * 0.32,
    boxW + pad * 0.8,
    boxH + pad * 0.64,
    mark * 0.16,
  );
  ctx.fill();
  drawMark(ctx, x, y, mark);
  ctx.fillStyle = "#f4f4f1";
  ctx.textBaseline = "top";
  ctx.font = `600 ${titleSize}px Syne, "Inter Tight", sans-serif`;
  ctx.fillText(title, x + mark + gap, y + mark * 0.14);
  ctx.globalAlpha = 0.78;
  ctx.font = `500 ${subSize}px "Inter Tight", ui-sans-serif, sans-serif`;
  ctx.fillText(sub, x + mark + gap, y + mark * 0.14 + titleSize + mark * 0.08);
  ctx.restore();
}

export async function stampStill(file: File): Promise<File> {
  if (typeof document === "undefined") return file;
  if (!file.type.startsWith("image/")) return file;

  try {
    await Promise.race([
      document.fonts?.ready ?? Promise.resolve(),
      new Promise((resolve) => setTimeout(resolve, 400)),
    ]);
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0);
    paintLockup(ctx, canvas.width, canvas.height);
    bitmap.close();
    const mime = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, mime, 0.92),
    );
    if (!blob) return file;
    const name = file.name.replace(/\.\w+$/, mime === "image/png" ? ".png" : ".jpg");
    return new File([blob], name, { type: mime });
  } catch {
    return file;
  }
}
