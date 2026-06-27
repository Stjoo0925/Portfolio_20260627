import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 14,
          background: "#000000",
          color: "#ffffff",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        {siteConfig.initials}
      </div>
    ),
    { ...size },
  );
}
