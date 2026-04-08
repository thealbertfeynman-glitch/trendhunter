const pptxgen = require("pptxgenjs");
const pres = new pptxgen();

pres.layout = "LAYOUT_16x9";
pres.author = "TrendHunter Team";
pres.title = "TrendHunter - #1 Trend Detection Agent";

// ── Colors ──
const BG = "0B1326";
const BG_LIGHT = "131B2E";
const CYAN = "00E5FF";
const PURPLE = "6D11AD";
const PURPLE_LIGHT = "C77DFF";
const WHITE = "DAE2FD";
const GRAY = "BAC9CC";
const AMBER = "F59E0B";
const RED = "EF4444";
const GREEN = "10B981";

// ── Helpers ──
const mkShadow = () => ({ type: "outer", blur: 8, offset: 3, angle: 135, color: "000000", opacity: 0.3 });
const mkGlow = () => ({ type: "outer", blur: 12, offset: 0, angle: 0, color: "00E5FF", opacity: 0.15 });

function addSlideNumber(slide, num, total) {
  slide.addText(`${num} / ${total}`, {
    x: 8.5, y: 5.2, w: 1.2, h: 0.3,
    fontSize: 8, color: GRAY, align: "right", fontFace: "Arial"
  });
}

function addAccentLine(slide, x, y, w) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x, y, w, h: 0.03, fill: { color: CYAN }
  });
}

const TOTAL = 11;

// ═══════════════════════════════════════
// SLIDE 1 — Title
// ═══════════════════════════════════════
let s1 = pres.addSlide();
s1.background = { color: BG };

// Radar circles (decorative)
s1.addShape(pres.shapes.OVAL, { x: 3.5, y: 0.8, w: 3, h: 3, line: { color: CYAN, width: 0.5 }, fill: { color: BG, transparency: 100 } });
s1.addShape(pres.shapes.OVAL, { x: 4, y: 1.3, w: 2, h: 2, line: { color: CYAN, width: 0.8 }, fill: { color: BG, transparency: 100 } });
s1.addShape(pres.shapes.OVAL, { x: 4.5, y: 1.8, w: 1, h: 1, line: { color: CYAN, width: 1.2 }, fill: { color: BG, transparency: 100 } });
// Center dot
s1.addShape(pres.shapes.OVAL, { x: 4.85, y: 2.15, w: 0.3, h: 0.3, fill: { color: CYAN } });

// Title
s1.addText("TrendHunter", {
  x: 0.5, y: 3.4, w: 9, h: 0.9,
  fontSize: 48, fontFace: "Arial Black", color: CYAN, align: "center", bold: true, margin: 0
});
// Subtitle
s1.addText("#1 Trend Detection Agent", {
  x: 0.5, y: 4.15, w: 9, h: 0.5,
  fontSize: 18, fontFace: "Arial", color: PURPLE_LIGHT, align: "center", charSpacing: 4
});
// Tagline
s1.addText("AI-powered TikTok trend intelligence for User Acquisition teams", {
  x: 1.5, y: 4.7, w: 7, h: 0.4,
  fontSize: 12, fontFace: "Arial", color: GRAY, align: "center"
});
addSlideNumber(s1, 1, TOTAL);

// ═══════════════════════════════════════
// SLIDE 2 — The Problem
// ═══════════════════════════════════════
let s2 = pres.addSlide();
s2.background = { color: BG };

s2.addText("THE UA BLINDSPOT", {
  x: 0.7, y: 0.4, w: 8, h: 0.4, fontSize: 11, fontFace: "Arial", color: CYAN, charSpacing: 5, margin: 0
});
s2.addText("Why UA Teams Are Flying Blind", {
  x: 0.7, y: 0.85, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0
});
addAccentLine(s2, 0.7, 1.55, 1.5);

// Pain point cards — 2x2 grid
const problems = [
  { icon: "$$", title: "Wasted Ad Spend", desc: "UA teams spend $M on paid ads\nbut miss organic viral trends\nthat drive free installs", color: RED },
  { icon: ">>", title: "Always Too Late", desc: "By the time you spot a trend\non TikTok, it's already peaked.\nFirst-mover advantage = gone", color: AMBER },
  { icon: "//", title: "Manual = Broken", desc: "3-5 hours/day scrolling\nStill miss 80% of signals\nNot scalable across markets", color: PURPLE_LIGHT },
  { icon: "!!", title: "Higher CPI", desc: "Missing trends means competing\non saturated content.\nResult: higher cost per install", color: RED },
];

problems.forEach((p, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.7 + col * 4.4;
  const y = 1.9 + row * 1.7;

  // Card bg
  s2.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: 4, h: 1.5,
    fill: { color: BG_LIGHT }, rectRadius: 0.1,
    line: { color: p.color, width: 0.5 }
  });
  // Left accent bar
  s2.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 0.06, h: 1.5, fill: { color: p.color }
  });
  // Title
  s2.addText(p.title, {
    x: x + 0.3, y: y + 0.15, w: 3.5, h: 0.35,
    fontSize: 14, fontFace: "Arial", color: p.color, bold: true, margin: 0
  });
  // Description
  s2.addText(p.desc, {
    x: x + 0.3, y: y + 0.5, w: 3.5, h: 0.9,
    fontSize: 10, fontFace: "Arial", color: GRAY, margin: 0
  });
});

addSlideNumber(s2, 2, TOTAL);

// ═══════════════════════════════════════
// SLIDE 3 — Current Solutions Fail
// ═══════════════════════════════════════
let s3 = pres.addSlide();
s3.background = { color: BG };

s3.addText("MARKET GAP", {
  x: 0.7, y: 0.4, w: 8, h: 0.4, fontSize: 11, fontFace: "Arial", color: CYAN, charSpacing: 5, margin: 0
});
s3.addText("Why Existing Tools Don't Work", {
  x: 0.7, y: 0.85, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0
});
addAccentLine(s3, 0.7, 1.55, 1.5);

// Comparison table
const tools = [
  { name: "SocialPeta", issue: "Shows competitor ads, NOT organic trends", verdict: "Underserved need" },
  { name: "Manual Browsing", issue: "Subjective, slow, not scalable", verdict: "Human limitation" },
  { name: "Generic Analytics", issue: "Show what already happened", verdict: "Reactive, not predictive" },
];

tools.forEach((t, i) => {
  const y = 1.9 + i * 1.05;
  // Row bg
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.7, y, w: 8.6, h: 0.85,
    fill: { color: BG_LIGHT }, rectRadius: 0.08
  });
  // X icon
  s3.addShape(pres.shapes.OVAL, {
    x: 0.9, y: y + 0.18, w: 0.5, h: 0.5,
    fill: { color: RED, transparency: 80 }
  });
  s3.addText("X", {
    x: 0.9, y: y + 0.18, w: 0.5, h: 0.5,
    fontSize: 16, fontFace: "Arial Black", color: RED, align: "center", valign: "middle", margin: 0
  });
  // Tool name
  s3.addText(t.name, {
    x: 1.6, y: y + 0.1, w: 2.5, h: 0.35,
    fontSize: 14, fontFace: "Arial", color: WHITE, bold: true, margin: 0
  });
  // Issue
  s3.addText(t.issue, {
    x: 1.6, y: y + 0.45, w: 4, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: GRAY, margin: 0
  });
  // Verdict badge
  s3.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 7, y: y + 0.22, w: 2, h: 0.4,
    fill: { color: RED, transparency: 85 }, rectRadius: 0.05
  });
  s3.addText(t.verdict, {
    x: 7, y: y + 0.22, w: 2, h: 0.4,
    fontSize: 9, fontFace: "Arial", color: RED, align: "center", valign: "middle", bold: true, margin: 0
  });
});

// Gap callout
s3.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.7, y: 4.5, w: 8.6, h: 0.7,
  fill: { color: CYAN, transparency: 90 },
  line: { color: CYAN, width: 1 }, rectRadius: 0.08
});
s3.addText("GAP: No tool connects creator behavior  ->  content trends  ->  UA opportunity", {
  x: 0.7, y: 4.5, w: 8.6, h: 0.7,
  fontSize: 13, fontFace: "Arial", color: CYAN, align: "center", valign: "middle", bold: true, margin: 0
});

addSlideNumber(s3, 3, TOTAL);

// ═══════════════════════════════════════
// SLIDE 4 — The Insight
// ═══════════════════════════════════════
let s4 = pres.addSlide();
s4.background = { color: BG };

s4.addText("THE BREAKTHROUGH", {
  x: 0.7, y: 0.4, w: 8, h: 0.4, fontSize: 11, fontFace: "Arial", color: CYAN, charSpacing: 5, margin: 0
});
s4.addText("Creators First, Trends Follow", {
  x: 0.7, y: 0.85, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0
});
addAccentLine(s4, 0.7, 1.55, 1.5);

// Key insight quote
s4.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 1, y: 1.8, w: 8, h: 0.9,
  fill: { color: PURPLE, transparency: 85 },
  line: { color: PURPLE_LIGHT, width: 1 }, rectRadius: 0.1
});
s4.addText('"You can\'t find trends without finding creators first."', {
  x: 1, y: 1.8, w: 8, h: 0.9,
  fontSize: 18, fontFace: "Georgia", color: PURPLE_LIGHT, align: "center", valign: "middle", italic: true, margin: 0
});

// Flow diagram — 4 steps horizontal
const flow = [
  { label: "Find\nCreators", icon: "1", color: CYAN },
  { label: "Content\nSignals", icon: "2", color: CYAN },
  { label: "Trend\nDetection", icon: "3", color: PURPLE_LIGHT },
  { label: "UA\nAction", icon: "4", color: AMBER },
];

flow.forEach((f, i) => {
  const x = 1 + i * 2.2;
  const y = 3.2;

  // Circle
  s4.addShape(pres.shapes.OVAL, {
    x: x + 0.35, y, w: 0.8, h: 0.8,
    fill: { color: f.color, transparency: 85 },
    line: { color: f.color, width: 1.5 }
  });
  s4.addText(f.icon, {
    x: x + 0.35, y, w: 0.8, h: 0.8,
    fontSize: 20, fontFace: "Arial Black", color: f.color, align: "center", valign: "middle", margin: 0
  });
  // Label
  s4.addText(f.label, {
    x: x, y: y + 1, w: 1.5, h: 0.6,
    fontSize: 11, fontFace: "Arial", color: WHITE, align: "center", bold: true, margin: 0
  });
  // Arrow
  if (i < 3) {
    s4.addText("->", {
      x: x + 1.3, y: y + 0.1, w: 0.7, h: 0.6,
      fontSize: 20, fontFace: "Arial", color: GRAY, align: "center", valign: "middle", margin: 0
    });
  }
});

// Bottom insight
s4.addText("Logic: Creators CREATE trends. Track creators -> Detect patterns -> Predict emergence", {
  x: 0.7, y: 4.6, w: 8.6, h: 0.5,
  fontSize: 11, fontFace: "Arial", color: GRAY, align: "center", margin: 0
});

addSlideNumber(s4, 4, TOTAL);

// ═══════════════════════════════════════
// SLIDE 5 — AI Pipeline
// ═══════════════════════════════════════
let s5 = pres.addSlide();
s5.background = { color: BG };

s5.addText("HOW IT WORKS", {
  x: 0.7, y: 0.4, w: 8, h: 0.4, fontSize: 11, fontFace: "Arial", color: CYAN, charSpacing: 5, margin: 0
});
s5.addText("AI-Powered Intelligence Pipeline", {
  x: 0.7, y: 0.85, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0
});
addAccentLine(s5, 0.7, 1.55, 1.5);

const pipeline = [
  { step: "01", title: "AI Find Creators", desc: "Automated creator discovery\nbased on niche, vertical,\nand engagement patterns", color: CYAN },
  { step: "02", title: "AI Crawl", desc: "Stealth browser automation\nAnti-detection mode\nReal-time data extraction", color: GREEN },
  { step: "03", title: "AI Analyze", desc: "NLP content clustering\nTrend scoring algorithm\nFreshness decay + grouping", color: PURPLE_LIGHT },
  { step: "04", title: "AI Report", desc: "Executive summary\nTrend groups + evidence\nActionable insights", color: AMBER },
];

pipeline.forEach((p, i) => {
  const x = 0.5 + i * 2.35;
  const y = 1.9;

  // Card
  s5.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: 2.15, h: 3.2,
    fill: { color: BG_LIGHT }, rectRadius: 0.1,
    line: { color: p.color, width: 0.5, transparency: 50 }
  });
  // Top accent
  s5.addShape(pres.shapes.RECTANGLE, {
    x, y, w: 2.15, h: 0.05, fill: { color: p.color }
  });
  // Step number
  s5.addText(p.step, {
    x: x + 0.15, y: y + 0.2, w: 0.6, h: 0.5,
    fontSize: 24, fontFace: "Arial Black", color: p.color, margin: 0
  });
  // Title
  s5.addText(p.title, {
    x: x + 0.15, y: y + 0.8, w: 1.85, h: 0.5,
    fontSize: 13, fontFace: "Arial", color: WHITE, bold: true, margin: 0
  });
  // Desc
  s5.addText(p.desc, {
    x: x + 0.15, y: y + 1.4, w: 1.85, h: 1.5,
    fontSize: 10, fontFace: "Arial", color: GRAY, margin: 0
  });
  // Arrow between cards
  if (i < 3) {
    s5.addText(">>", {
      x: x + 2.05, y: y + 1.2, w: 0.4, h: 0.5,
      fontSize: 14, fontFace: "Arial", color: GRAY, align: "center", valign: "middle", margin: 0
    });
  }
});

addSlideNumber(s5, 5, TOTAL);

// ═══════════════════════════════════════
// SLIDE 6 — Product Demo
// ═══════════════════════════════════════
let s6 = pres.addSlide();
s6.background = { color: BG };

s6.addText("LIVE PRODUCT", {
  x: 0.7, y: 0.4, w: 8, h: 0.4, fontSize: 11, fontFace: "Arial", color: CYAN, charSpacing: 5, margin: 0
});
s6.addText("TrendHunter Dashboard", {
  x: 0.7, y: 0.85, w: 6, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0
});
addAccentLine(s6, 0.7, 1.55, 1.5);

// Screenshot placeholder
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.5, y: 1.8, w: 5.5, h: 3.4,
  fill: { color: BG_LIGHT },
  line: { color: CYAN, width: 1, transparency: 50 }, rectRadius: 0.15
});
s6.addText("[ LIVE DEMO ]\nPaste dashboard screenshot here", {
  x: 0.5, y: 1.8, w: 5.5, h: 3.4,
  fontSize: 14, fontFace: "Arial", color: GRAY, align: "center", valign: "middle", margin: 0
});

// Feature list on right
const features = [
  { title: "Trend Groups", desc: "AI-classified content categories", color: PURPLE_LIGHT },
  { title: "Hashtag Rankings", desc: "Filtered, scored, ranked by views", color: CYAN },
  { title: "Creator Intelligence", desc: "Profile + video analytics", color: GREEN },
  { title: "AI Executive Summary", desc: "Auto-generated insights", color: AMBER },
];

features.forEach((f, i) => {
  const y = 1.9 + i * 0.75;
  s6.addShape(pres.shapes.OVAL, {
    x: 6.3, y: y + 0.05, w: 0.35, h: 0.35,
    fill: { color: f.color, transparency: 80 }
  });
  s6.addText(f.title, {
    x: 6.8, y, w: 3, h: 0.3,
    fontSize: 12, fontFace: "Arial", color: WHITE, bold: true, margin: 0
  });
  s6.addText(f.desc, {
    x: 6.8, y: y + 0.3, w: 3, h: 0.25,
    fontSize: 9, fontFace: "Arial", color: GRAY, margin: 0
  });
});

// Live URL
s6.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 6.3, y: 4.8, w: 3.2, h: 0.4,
  fill: { color: CYAN, transparency: 90 }, rectRadius: 0.05,
  line: { color: CYAN, width: 0.5 }
});
s6.addText("huggingface.co/spaces/1oganthehusky/trendhunter", {
  x: 6.3, y: 4.8, w: 3.2, h: 0.4,
  fontSize: 8, fontFace: "Consolas", color: CYAN, align: "center", valign: "middle", margin: 0
});

addSlideNumber(s6, 6, TOTAL);

// ═══════════════════════════════════════
// SLIDE 7 — AI Innovation
// ═══════════════════════════════════════
let s7 = pres.addSlide();
s7.background = { color: BG };

s7.addText("AI INNOVATION", {
  x: 0.7, y: 0.4, w: 8, h: 0.4, fontSize: 11, fontFace: "Arial", color: CYAN, charSpacing: 5, margin: 0
});
s7.addText("What Makes It Different", {
  x: 0.7, y: 0.85, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0
});
addAccentLine(s7, 0.7, 1.55, 1.5);

const innovations = [
  { title: "TrendGroup Engine", desc: "NLP-based content clustering from descriptions + hashtags\n7 auto-detected trend categories", color: PURPLE_LIGHT },
  { title: "Trend Scoring Algorithm", desc: "creator_count x log10(views) x freshness_decay\nMulti-factor ranking that surfaces real signals", color: CYAN },
  { title: "Smart Filtering", desc: "Auto-excludes 23+ generic/tool hashtags (CapCut, FYP...)\nSurfaces only real content trends", color: GREEN },
  { title: "AI Executive Summary", desc: "Auto-generated insights with typing animation\nActionable intelligence, not just data", color: AMBER },
  { title: "Full Pipeline", desc: "Crawl -> Enrich -> Analyze -> Visualize\nZero manual steps end-to-end", color: CYAN },
];

innovations.forEach((inn, i) => {
  const y = 1.8 + i * 0.72;
  // Dot
  s7.addShape(pres.shapes.OVAL, {
    x: 0.85, y: y + 0.12, w: 0.2, h: 0.2,
    fill: { color: inn.color }
  });
  // Title
  s7.addText(inn.title, {
    x: 1.2, y, w: 3, h: 0.35,
    fontSize: 13, fontFace: "Arial", color: WHITE, bold: true, margin: 0
  });
  // Desc
  s7.addText(inn.desc, {
    x: 4.5, y, w: 5, h: 0.55,
    fontSize: 10, fontFace: "Arial", color: GRAY, margin: 0
  });
  // Separator
  if (i < 4) {
    s7.addShape(pres.shapes.LINE, {
      x: 0.85, y: y + 0.65, w: 8.3, h: 0,
      line: { color: GRAY, width: 0.3, transparency: 80 }
    });
  }
});

addSlideNumber(s7, 7, TOTAL);

// ═══════════════════════════════════════
// SLIDE 8 — Tech Stack
// ═══════════════════════════════════════
let s8 = pres.addSlide();
s8.background = { color: BG };

s8.addText("ARCHITECTURE", {
  x: 0.7, y: 0.4, w: 8, h: 0.4, fontSize: 11, fontFace: "Arial", color: CYAN, charSpacing: 5, margin: 0
});
s8.addText("Technical Stack", {
  x: 0.7, y: 0.85, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0
});
addAccentLine(s8, 0.7, 1.55, 1.5);

const stack = [
  { layer: "Data Collection", tech: "Puppeteer + Stealth Plugin", detail: "Anti-detection browser automation", color: CYAN },
  { layer: "Data Processing", tech: "Python (analyze_trends.py)", detail: "Trend scoring, freshness decay", color: GREEN },
  { layer: "AI Engine", tech: "Custom NLP (trendgroups.ts)", detail: "Description + hashtag clustering", color: PURPLE_LIGHT },
  { layer: "Frontend", tech: "Next.js 14 + Tailwind CSS", detail: "Dark SaaS dashboard, animations", color: CYAN },
  { layer: "Deploy", tech: "Hugging Face Spaces", detail: "Docker + Node.js runtime", color: AMBER },
  { layer: "Storage", tech: "JSON files (no DB)", detail: "Hackathon speed, zero config", color: GRAY },
];

stack.forEach((s, i) => {
  const y = 1.85 + i * 0.58;
  // Layer label
  s8.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.7, y, w: 2.2, h: 0.45,
    fill: { color: s.color, transparency: 85 }, rectRadius: 0.05
  });
  s8.addText(s.layer, {
    x: 0.7, y, w: 2.2, h: 0.45,
    fontSize: 10, fontFace: "Arial", color: s.color, align: "center", valign: "middle", bold: true, margin: 0
  });
  // Tech
  s8.addText(s.tech, {
    x: 3.1, y, w: 3.5, h: 0.45,
    fontSize: 12, fontFace: "Consolas", color: WHITE, valign: "middle", margin: 0
  });
  // Detail
  s8.addText(s.detail, {
    x: 6.8, y, w: 2.8, h: 0.45,
    fontSize: 10, fontFace: "Arial", color: GRAY, valign: "middle", margin: 0
  });
});

addSlideNumber(s8, 8, TOTAL);

// ═══════════════════════════════════════
// SLIDE 9 — Impact & Value
// ═══════════════════════════════════════
let s9 = pres.addSlide();
s9.background = { color: BG };

s9.addText("IMPACT", {
  x: 0.7, y: 0.4, w: 8, h: 0.4, fontSize: 11, fontFace: "Arial", color: CYAN, charSpacing: 5, margin: 0
});
s9.addText("Value for UA Teams", {
  x: 0.7, y: 0.85, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0
});
addAccentLine(s9, 0.7, 1.55, 1.5);

// Before vs After
// Before
s9.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 0.5, y: 1.8, w: 4.3, h: 1.5,
  fill: { color: BG_LIGHT }, rectRadius: 0.1,
  line: { color: RED, width: 0.5, transparency: 50 }
});
s9.addText("BEFORE", {
  x: 0.7, y: 1.9, w: 1.2, h: 0.3,
  fontSize: 10, fontFace: "Arial", color: RED, bold: true, charSpacing: 3, margin: 0
});
s9.addText("3-5 hours manual scrolling\nMiss 80% of emerging trends\nReactive, not predictive", {
  x: 0.7, y: 2.25, w: 3.8, h: 0.9,
  fontSize: 12, fontFace: "Arial", color: GRAY, margin: 0
});

// Arrow
s9.addText(">>", {
  x: 4.7, y: 2.2, w: 0.6, h: 0.8,
  fontSize: 24, fontFace: "Arial", color: CYAN, align: "center", valign: "middle", margin: 0
});

// After
s9.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 5.2, y: 1.8, w: 4.3, h: 1.5,
  fill: { color: BG_LIGHT }, rectRadius: 0.1,
  line: { color: GREEN, width: 0.5, transparency: 50 }
});
s9.addText("AFTER", {
  x: 5.4, y: 1.9, w: 1.2, h: 0.3,
  fontSize: 10, fontFace: "Arial", color: GREEN, bold: true, charSpacing: 3, margin: 0
});
s9.addText("30 seconds to insights\nAI surfaces ALL emerging trends\nWith visual evidence + scores", {
  x: 5.4, y: 2.25, w: 3.8, h: 0.9,
  fontSize: 12, fontFace: "Arial", color: WHITE, margin: 0
});

// Stats row
const stats = [
  { value: "48", label: "Creators\nTracked", color: CYAN },
  { value: "751", label: "Videos\nAnalyzed", color: PURPLE_LIGHT },
  { value: "25.7M", label: "Views\nProcessed", color: AMBER },
  { value: "6", label: "AI Trend\nGroups", color: GREEN },
  { value: "48%", label: "Commerce\nSignal", color: RED },
];

stats.forEach((st, i) => {
  const x = 0.5 + i * 1.9;
  const y = 3.7;
  s9.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x, y, w: 1.7, h: 1.4,
    fill: { color: BG_LIGHT }, rectRadius: 0.1
  });
  s9.addText(st.value, {
    x, y: y + 0.15, w: 1.7, h: 0.6,
    fontSize: 28, fontFace: "Arial Black", color: st.color, align: "center", margin: 0
  });
  s9.addText(st.label, {
    x, y: y + 0.8, w: 1.7, h: 0.45,
    fontSize: 9, fontFace: "Arial", color: GRAY, align: "center", margin: 0
  });
});

addSlideNumber(s9, 9, TOTAL);

// ═══════════════════════════════════════
// SLIDE 10 — Future Vision
// ═══════════════════════════════════════
let s10 = pres.addSlide();
s10.background = { color: BG };

s10.addText("ROADMAP", {
  x: 0.7, y: 0.4, w: 8, h: 0.4, fontSize: 11, fontFace: "Arial", color: CYAN, charSpacing: 5, margin: 0
});
s10.addText("What's Next", {
  x: 0.7, y: 0.85, w: 8, h: 0.7, fontSize: 32, fontFace: "Arial Black", color: WHITE, margin: 0
});
addAccentLine(s10, 0.7, 1.55, 1.5);

const roadmap = [
  { title: "Real-time Monitoring", desc: "Scheduled crawls every 6 hours\nAlways-on trend detection", phase: "Q2 2026", color: CYAN },
  { title: "Trend Prediction", desc: '"This hashtag will peak in 2 days"\nPredictive intelligence', phase: "Q3 2026", color: PURPLE_LIGHT },
  { title: "Multi-Platform", desc: "Instagram Reels, YouTube Shorts\nCross-platform trend correlation", phase: "Q3 2026", color: GREEN },
  { title: "API & Integrations", desc: "REST API for UA tools\nSlack/Discord alerts", phase: "Q4 2026", color: AMBER },
];

roadmap.forEach((r, i) => {
  const y = 1.8 + i * 0.9;
  // Timeline dot
  s10.addShape(pres.shapes.OVAL, {
    x: 0.85, y: y + 0.15, w: 0.25, h: 0.25,
    fill: { color: r.color }
  });
  // Timeline line
  if (i < 3) {
    s10.addShape(pres.shapes.RECTANGLE, {
      x: 0.95, y: y + 0.4, w: 0.04, h: 0.65,
      fill: { color: GRAY, transparency: 70 }
    });
  }
  // Phase badge
  s10.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 1.3, y: y + 0.1, w: 1, h: 0.35,
    fill: { color: r.color, transparency: 85 }, rectRadius: 0.05
  });
  s10.addText(r.phase, {
    x: 1.3, y: y + 0.1, w: 1, h: 0.35,
    fontSize: 9, fontFace: "Arial", color: r.color, align: "center", valign: "middle", bold: true, margin: 0
  });
  // Title
  s10.addText(r.title, {
    x: 2.5, y, w: 3, h: 0.35,
    fontSize: 14, fontFace: "Arial", color: WHITE, bold: true, margin: 0
  });
  // Desc
  s10.addText(r.desc, {
    x: 2.5, y: y + 0.35, w: 5, h: 0.45,
    fontSize: 10, fontFace: "Arial", color: GRAY, margin: 0
  });
});

addSlideNumber(s10, 10, TOTAL);

// ═══════════════════════════════════════
// SLIDE 11 — CTA
// ═══════════════════════════════════════
let s11 = pres.addSlide();
s11.background = { color: BG };

// Radar circles again
s11.addShape(pres.shapes.OVAL, { x: 3.5, y: 0.5, w: 3, h: 3, line: { color: CYAN, width: 0.5, transparency: 60 }, fill: { color: BG, transparency: 100 } });
s11.addShape(pres.shapes.OVAL, { x: 4, y: 1, w: 2, h: 2, line: { color: CYAN, width: 0.8, transparency: 40 }, fill: { color: BG, transparency: 100 } });
s11.addShape(pres.shapes.OVAL, { x: 4.5, y: 1.5, w: 1, h: 1, line: { color: CYAN, width: 1.2 }, fill: { color: BG, transparency: 100 } });
s11.addShape(pres.shapes.OVAL, { x: 4.85, y: 1.85, w: 0.3, h: 0.3, fill: { color: CYAN } });

// Title
s11.addText("TrendHunter", {
  x: 0.5, y: 3, w: 9, h: 0.9,
  fontSize: 48, fontFace: "Arial Black", color: CYAN, align: "center", bold: true, margin: 0
});
s11.addText("#1 Trend Detection Agent", {
  x: 0.5, y: 3.8, w: 9, h: 0.5,
  fontSize: 18, fontFace: "Arial", color: PURPLE_LIGHT, align: "center", charSpacing: 4
});

// CTA
s11.addText("Hunt trends before they peak.", {
  x: 1.5, y: 4.3, w: 7, h: 0.5,
  fontSize: 14, fontFace: "Georgia", color: WHITE, align: "center", italic: true
});

// URL badge
s11.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 2.5, y: 4.85, w: 5, h: 0.45,
  fill: { color: CYAN, transparency: 90 }, rectRadius: 0.05,
  line: { color: CYAN, width: 1 }
});
s11.addText("TRY IT: huggingface.co/spaces/1oganthehusky/trendhunter", {
  x: 2.5, y: 4.85, w: 5, h: 0.45,
  fontSize: 10, fontFace: "Consolas", color: CYAN, align: "center", valign: "middle", bold: true, margin: 0
});

addSlideNumber(s11, 11, TOTAL);

// ── Save ──
pres.writeFile({ fileName: "D:/trendhunter/TrendHunter_Pitch.pptx" })
  .then(() => console.log("Deck created: TrendHunter_Pitch.pptx"))
  .catch(err => console.error(err));
