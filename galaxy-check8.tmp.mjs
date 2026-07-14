import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
await page.waitForTimeout(2500);
await page.screenshot({ path: "s1-home.png", clip: { x: 0, y: 0, width: 1440, height: 120 } });
await page.goto("http://localhost:3000/skills", { waitUntil: "networkidle" });
await page.waitForTimeout(1200);
await page.screenshot({ path: "s2-detail.png", clip: { x: 0, y: 0, width: 1440, height: 120 } });

const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await mobile.goto("http://localhost:3000/skills", { waitUntil: "networkidle" });
await mobile.waitForTimeout(1200);
await mobile.screenshot({ path: "s3-mobile.png", clip: { x: 0, y: 0, width: 390, height: 100 } });

await browser.close();
