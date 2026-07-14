import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (err) => console.log("[page-error]", err.message));

for (const route of ["", "about", "skills", "experience", "projects", "lab", "contact"]) {
  await page.goto(`http://localhost:3000/${route}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `v-${route || "home"}.png`, fullPage: route !== "" });
}

await browser.close();
