// Mobile/responsive check via the Chrome DevTools Protocol.
//
// Edge clamps a plain --window-size to 500px minimum, so a 390px headless
// screenshot is a CROP of a 500px viewport and looks falsely clipped. Device
// emulation does not have that limitation.
//
// Usage:
//   node scripts/cdp-check.mjs --url https://meridian-digital.co.za/ --width 390
//   node scripts/cdp-check.mjs --url ... --width 768 --shot out.png
//
// Pass criteria: innerWidth === document.documentElement.scrollWidth and no
// meaningful element extends past the right edge.

import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, cur, i, arr) => {
    if (cur.startsWith("--")) acc.push([cur.slice(2), arr[i + 1]?.startsWith("--") ? "true" : arr[i + 1] ?? "true"]);
    return acc;
  }, []),
);

const url = args.url ?? "https://meridian-digital.co.za/";
const width = Number(args.width ?? 390);
const height = Number(args.height ?? 844);
const shot = args.shot;

const EDGE_CANDIDATES = [
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
];
const browser = EDGE_CANDIDATES.find((p) => fs.existsSync(p));
if (!browser) throw new Error("no Edge/Chrome binary found");

const port = 9400 + Math.floor(Math.random() * 400);
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-profile-"));

const child = spawn(
  browser,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForEndpoint() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/version`);
      if (res.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error("browser devtools endpoint never came up");
}

async function newTarget() {
  const res = await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" });
  if (!res.ok) throw new Error(`target creation failed: ${res.status}`);
  return res.json();
}

function connect(wsUrl) {
  const ws = new WebSocket(wsUrl);
  const pending = new Map();
  const events = new Map();
  let id = 0;

  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    } else if (msg.method && events.has(msg.method)) {
      for (const fn of events.get(msg.method)) fn(msg.params);
      events.delete(msg.method);
    }
  });

  const ready = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const msgId = ++id;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

  const once = (method) =>
    new Promise((resolve) => {
      if (!events.has(method)) events.set(method, []);
      events.get(method).push(resolve);
    });

  return { ready, send, once, close: () => ws.close() };
}

try {
  await waitForEndpoint();
  const target = await newTarget();
  const cdp = connect(target.webSocketDebuggerUrl);
  await cdp.ready;

  await cdp.send("Page.enable");
  await cdp.send("Runtime.enable");
  await cdp.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: true,
  });

  const loaded = cdp.once("Page.loadEventFired");
  await cdp.send("Page.navigate", { url });
  await Promise.race([loaded, sleep(15000)]);
  await sleep(1200); // let hydration settle

  const { result } = await cdp.send("Runtime.evaluate", {
    returnByValue: true,
    expression: `(() => {
      const de = document.documentElement;
      const offenders = [...document.querySelectorAll('body *')]
        .map(el => { const r = el.getBoundingClientRect(); return { tag: el.tagName, cls: (el.className || '').toString().slice(0, 60), right: Math.round(r.right), w: Math.round(r.width) }; })
        .filter(o => o.w > 0 && o.right > window.innerWidth + 1)
        .slice(0, 10);
      return {
        innerWidth: window.innerWidth,
        scrollWidth: de.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        title: document.title,
        offenders
      };
    })()`,
  });

  const m = result.value;
  const pass = m.innerWidth === m.scrollWidth && m.offenders.length === 0;

  console.log(`title        : ${m.title}`);
  console.log(`viewport     : ${m.innerWidth} x ${height}`);
  console.log(`scrollWidth  : ${m.scrollWidth}`);
  console.log(`status       : ${pass ? "PASS - no horizontal overflow" : "FAIL"}`);
  if (m.offenders.length) {
    console.log("overflowing elements:");
    for (const o of m.offenders) console.log(`  ${o.tag} right=${o.right} width=${o.w} ${o.cls}`);
  }

  if (shot) {
    const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
    fs.writeFileSync(shot, Buffer.from(data, "base64"));
    console.log(`screenshot   : ${shot}`);
  }

  cdp.close();
  process.exitCode = pass ? 0 : 1;
} finally {
  child.kill();
  await sleep(300);
  fs.rmSync(profile, { recursive: true, force: true });
}
