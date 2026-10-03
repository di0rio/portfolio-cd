import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const ogSize = { width: 1200, height: 630 };

// Ubuntu em TTF direto do Google Fonts; se falhar, cai na fonte padrão do ImageResponse.
async function ubuntu(weight: 400 | 700) {
  try {
    const css = await (await fetch(`https://fonts.googleapis.com/css2?family=Ubuntu:wght@${weight}`)).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:truetype|opentype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Monograma "cd" (base64 do SVG) e as fontes, compartilhados pelas imagens de prévia. */
export async function ogAssets() {
  const [avatar, regular, bold] = await Promise.all([
    readFile(join(process.cwd(), "public/avatar.svg"), "base64"),
    ubuntu(400),
    ubuntu(700),
  ]);
  const fonts = [
    ...(regular ? [{ name: "Ubuntu", data: regular, weight: 400 as const }] : []),
    ...(bold ? [{ name: "Ubuntu", data: bold, weight: 700 as const }] : []),
  ];
  return { avatar, fonts: fonts.length ? fonts : undefined };
}

const clip = (text: string, max: number) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

/** Prévia de uma página interna: prompt `cd ~/<path>`, título, descrição e assinatura com o monograma. */
export async function pageOg({ path, title, description }: { path: string; title: string; description?: string | null }) {
  const { avatar, fonts } = await ogAssets();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 80,
        background: "#1c1c1c",
        color: "#f5f5f5",
        fontFamily: "Ubuntu",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", fontSize: 34, color: "#a3a3a3" }}>
        <span style={{ color: "#ffd23f" }}>~</span>&nbsp;$ cd ~/{clip(path, 40)}
        <span style={{ width: 18, height: 36, marginLeft: 10, background: "#ffd23f" }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: title.length > 18 ? 76 : 104, fontWeight: 700, lineHeight: 1.05 }}>{clip(title, 40)}</div>
        {description && <div style={{ marginTop: 28, fontSize: 38, lineHeight: 1.3, color: "#a3a3a3" }}>{clip(description, 130)}</div>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse só aceita <img> */}
        <img
          alt=""
          height={88}
          src={`data:image/svg+xml;base64,${avatar}`}
          style={{ borderRadius: 18, border: "3px solid #000", boxShadow: "5px 5px 0 #ffd23f" }}
          width={88}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 36, fontWeight: 700 }}>{site.name}</div>
          <div style={{ display: "flex", fontSize: 26, color: "#a3a3a3" }}>github.com/{site.github}</div>
        </div>
      </div>
    </div>,
    { ...ogSize, fonts },
  );
}
