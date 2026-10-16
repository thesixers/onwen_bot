export const config = {
  ispName: process.env.ISP_NAME || "ONWEN NET",
  hotspotSsid: process.env.HOTSPOT_SSID || "ONWEN-NET",
  portalUrl: process.env.PORTAL_URL || "10.0.0.1",
  supportPhone: process.env.SUPPORT_PHONE || "",
  adminPhones: (process.env.ADMIN_PHONE || "")
    .split(",")
    .map((p) => p.trim().replace(/^\+/, ""))
    .filter(Boolean),
  telegramBotHandle: process.env.TELEGRAM_BOT_HANDLE || "",
  flwBaseUrl: process.env.FLW_BASE_URL || "https://api.flutterwave.com/v3",
  flwSecretKey: process.env.FLW_SECRET_KEY,
  flwSecretHash: process.env.FLW_SECRET_HASH,
  mikrotik: {
    host: process.env.MIKROTIK_TUNNEL_IP || "10.200.0.2",
    user: process.env.MIKROTIK_USER,
    pass: process.env.MIKROTIK_PASS,
    port: parseInt(process.env.MIKROTIK_PORT, 10) || 80,
    hotspotServer: process.env.MIKROTIK_HOTSPOT_SERVER || "all",
  },
  allowPayment: process.env.ALLOW_PAYMENT === "true",
};

export default config;
