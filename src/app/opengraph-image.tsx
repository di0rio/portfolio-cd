import { ImageResponse } from "next/og";
import { ogAssets } from "@/lib/og";
import { site } from "@/lib/site";

// Prévia do link (LinkedIn, WhatsApp, X). Robôs não mandam cookie, então sai no idioma padrão.
export const alt = `${site.name} · desenvolvedor front-end`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
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
      <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse só aceita <img> */}
        <img
          alt=""
          height={180}
          src={`data:image/svg+xml;base64,${avatar}`}
          style={{ borderRadius: 36, border: "4px solid #000", boxShadow: "8px 8px 0 #ffd23f" }}
          width={180}
        />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 88, fontWeight: 700, lineHeight: 1 }}>{site.shortName}</div>
          <div style={{ marginTop: 16, fontSize: 40, color: "#a3a3a3" }}>desenvolvedor front-end · front-end developer</div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", fontSize: 32, color: "#a3a3a3" }}>
        <div style={{ display: "flex" }}>
          <span style={{ color: "#ffd23f" }}>~</span>&nbsp;$ cd {site.github}
          <span style={{ width: 18, height: 36, marginLeft: 10, background: "#ffd23f" }} />
        </div>
        <div style={{ display: "flex" }}>github.com/{site.github}</div>
      </div>
    </div>,
    { ...size, fonts },
  );
}
