const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const { pathToFileURL } = require("node:url");
const { resolve } = require("node:path");
(async () => {
  const browser = await chromium.launch({channel:"chrome", headless:true, chromiumSandbox:true});
  try {
    const page = await browser.newPage({viewport:{width:1160,height:830}, offline:true});
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    page.on("console", event => { if (event.type() === "error") errors.push(event.text()); });
    await page.addInitScript(() => {
      const clear = CanvasRenderingContext2D.prototype.clearRect;
      CanvasRenderingContext2D.prototype.clearRect = function(...args) {
        this.canvas.busLabels = [];
        return clear.apply(this, args);
      };
      const original = CanvasRenderingContext2D.prototype.fillText;
      CanvasRenderingContext2D.prototype.fillText = function(label,...args) {
        (window.labels ??= []).push(label);
        if (/^B[123] ·/.test(label)) {
          this.canvas.busLabels.push({text: label, x: args[0], y: args[1], width: this.measureText(label).width});
        }
        return original.call(this,label,...args);
      };
    });
    await page.clock.install();
    await page.goto(pathToFileURL(resolve("docs/index.html")).href);
    assert.equal(await page.locator("#dispatches").textContent(),"B1 at 1 min · B2 at 5 min · B3 at 9 min");
    assert.match(await page.locator("#reference-status").textContent(), /match the notebook/);
    await page.click("#start");
    await page.clock.fastForward(16_850);
    assert.match(await page.locator("#event").textContent(), /^Holding Bus 2/);
    let labels = await page.evaluate(() => window.labels);
    assert(labels.some(x => /^B2 · \d+ aboard$/.test(x)));
    assert(labels.some(x => /^Market · \d+ waiting$/.test(x)));
    assert(!labels.some(x => x.startsWith("Terminal ·")));
    await page.click("#pause");
    if (process.argv.includes("--screenshot")) {
      await page.screenshot({path:"figures/demo-middle-bus.png",fullPage:true});
    }
    const paused = await page.locator("#clock").textContent();
    await page.clock.fastForward(1000);
    assert.equal(await page.locator("#clock").textContent(), paused);
    await page.click("#start");
    await page.clock.fastForward(5000);
    assert.equal(await page.locator("#event").textContent(), "Bus 2 held for 20 s before Market.");
    assert.equal(await page.locator("#results").isVisible(), false);
    await page.clock.fastForward(21000);
    assert.equal(await page.locator("#results").isVisible(), true);
    assert.deepEqual(await page.locator("tbody tr td:last-child").allTextContents(), ["-0.40","+2.44","+2.04"]);
    assert.match(await page.locator("#cohort").textContent(), /75 riders.*1 caught Bus 2.*0 at Market, 1 at School/);
    for (const cap of ["40","60"]) {
      await page.selectOption("#cap",cap);
      assert.match(await page.locator("#reference-status").textContent(), /match the notebook/);
    }
    await page.selectOption("#cap","0");
    await page.click("#start");
    await page.clock.fastForward(45000);
    assert.equal(await page.locator("#event").textContent(), "Bus 2 released immediately before Market.");
    assert.deepEqual(await page.locator("tbody tr td:last-child").allTextContents(), ["0.00","0.00","0.00"]);
    await page.click(".options summary");
    await page.selectOption("#traffic-delay","360");
    await page.selectOption("#demand","High");
    await page.selectOption("#cap","20");
    await page.setViewportSize({width:375,height:812});
    await page.click("#start");
    await page.evaluate(() => { window.labels = []; });
    await page.clock.fastForward(19000);
    labels = await page.evaluate(() => window.labels);
    for (const bus of [1,2]) assert(labels.some(label => label.startsWith("B"+bus+" ·")));
    for (const boxes of await page.locator("canvas").evaluateAll(charts => charts.map(c => c.busLabels))) {
      assert(boxes.length >= 2);
      for (let i = 0; i < boxes.length; i++) for (const other of boxes.slice(i + 1)) {
        const a = boxes[i];
        assert(Math.abs(a.y-other.y) >= 14 || Math.abs(a.x-other.x) >= (a.width+other.width)/2 + 8);
      }
    }
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.selectOption("#traffic-delay","120");
    await page.selectOption("#demand","Medium");
    await page.click("#reset");
    assert.equal(await page.locator("#clock").textContent(),"0:00:00");
    assert.match(await page.locator("#reference-status").textContent(), /match the notebook/);
    assert.deepEqual(errors,[]);
    console.log("PASS: disk playback, live labels, holding and release states, results, zero cap, preset restoration and mobile bunching.");
  } finally { await browser.close(); }
})().catch(err=>{console.error(err);process.exitCode=1;});
