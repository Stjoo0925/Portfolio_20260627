import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await mobile.goto("http://localhost:3000/skills", { waitUntil: "networkidle" });
await mobile.waitForTimeout(1500);
const info = await mobile.evaluate(() => {
  const wm = document.querySelector(".portfolio-nav__wordmark");
  return {
    wordmarkDisplay: wm ? getComputedStyle(wm).display : "missing",
    wordmarkText: wm?.textContent,
    brandRect: document.querySelector(".portfolio-nav__brand")?.getBoundingClientRect().width,
  };
});
console.log(JSON.stringify(info));
await mobile.screenshot({ path: "s4-mobile.png", clip: { x: 0, y: 0, width: 390, height: 100 } });
await browser.close();
