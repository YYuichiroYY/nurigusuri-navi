/* ぬり薬ナビ - アトピー性皮膚炎 外用指導支援 プロトタイプ */
"use strict";

/* ===================== マスタ定義 ===================== */

const PARTS = {
  head:    { name: "頭部" },
  face:    { name: "顔" },
  eyes:    { name: "目の周り" },
  neck:    { name: "頸部" },
  chest:   { name: "胸腹部" },
  back:    { name: "背部" },
  armR:    { name: "右上肢" },
  armL:    { name: "左上肢" },
  elbowR:  { name: "右肘" },
  elbowL:  { name: "左肘" },
  handR:   { name: "右手" },
  handL:   { name: "左手" },
  legR:    { name: "右下肢" },
  legL:    { name: "左下肢" },
  kneeR:   { name: "右膝" },
  kneeL:   { name: "左膝" },
  genital: { name: "陰部" },
  hip:     { name: "臀部" },
};

/* FTU表（1回塗布あたり）: fc=顔+頸, arm=上肢片側, leg=下肢片側, tf=体幹前面, tb=体幹後面 */
const FTU_BASE = {
  m36:  { label: "3〜6か月", fc: 1,   arm: 1,   leg: 1.5, tf: 1,   tb: 1.5 },
  y12:  { label: "1〜2歳",   fc: 1.5, arm: 1.5, leg: 2,   tf: 2,   tb: 3 },
  y35:  { label: "3〜5歳",   fc: 1.5, arm: 2,   leg: 3,   tf: 3,   tb: 3.5 },
  y610: { label: "6〜10歳",  fc: 2,   arm: 2.5, leg: 4.5, tf: 3.5, tb: 5 },
  a:    { label: "11歳以上・成人", fc: 2.5, arm: 4, leg: 8, tf: 7, tb: 7 },
};

/* 各部位 = 基準値のどのキーの何割か（目安）。"abs"は年齢によらず固定FTU */
const PART_FTU = {
  head:    ["fc", 0.8],
  face:    ["fc", 0.7],
  eyes:    ["fc", 0.15],
  neck:    ["fc", 0.3],
  chest:   ["tf", 0.9],
  genital: ["tf", 0.1],
  back:    ["tb", 0.7],
  hip:     ["tb", 0.3],
  armR:    ["arm", 1], armL: ["arm", 1],
  legR:    ["leg", 1], legL: ["leg", 1],
  elbowR:  ["abs", 0.5], elbowL: ["abs", 0.5],
  kneeR:   ["abs", 0.5], kneeL:  ["abs", 0.5],
  handR:   ["abs", 0.5], handL:  ["abs", 0.5],
};

const CATS = {
  s1: { badge: "1群", cls: "s1", sent: "ステロイド1群" },
  s2: { badge: "2群", cls: "s2", sent: "ステロイド2群" },
  s3: { badge: "3群", cls: "s3", sent: "ステロイド3群" },
  s4: { badge: "4群", cls: "s4", sent: "ステロイド4群" },
  s5: { badge: "5群", cls: "s5", sent: "ステロイド5群" },
  pde4:  { badge: "非ステ", cls: "nonst", sent: "非ステロイド" },
  jak:   { badge: "非ステ", cls: "nonst", sent: "非ステロイド" },
  ns:    { badge: "非ステ", cls: "nonst", sent: "非ステロイド" },
  moist: { badge: "保湿",  cls: "moist", sent: "" },
  base:  { badge: "保湿",  cls: "base",  sent: "" },
  other: { badge: "",      cls: "other", sent: "" },
};

const DEFAULT_OINTS = [
  { id: 1, name: "アンテベート軟膏", cat: "s2" },
  { id: 2, name: "メサデルム軟膏", cat: "s3" },
  { id: 3, name: "リンデロンVローション", cat: "s3" },
  { id: 4, name: "ロコイド軟膏", cat: "s4" },
  { id: 5, name: "クロベタゾン酪酸エステルローション", cat: "s4" },
  { id: 6, name: "モイゼルト軟膏", cat: "pde4" },
  { id: 7, name: "保湿剤（ヘパリン類似物質）", cat: "moist" },
];

/* よく使う外用薬カタログ（設定画面から選んで追加できる） */
const CATALOG = [
  { name: "デルモベート軟膏", cat: "s1" },
  { name: "ダイアコート軟膏", cat: "s1" },
  { name: "アンテベート軟膏", cat: "s2" },
  { name: "マイザー軟膏", cat: "s2" },
  { name: "フルメタ軟膏", cat: "s2" },
  { name: "トプシム軟膏", cat: "s2" },
  { name: "ネリゾナ軟膏", cat: "s2" },
  { name: "パンデル軟膏", cat: "s2" },
  { name: "リンデロンDP軟膏", cat: "s2" },
  { name: "メサデルム軟膏", cat: "s3" },
  { name: "リンデロンV軟膏", cat: "s3" },
  { name: "リンデロンVローション", cat: "s3" },
  { name: "リンデロンVG軟膏", cat: "s3" },
  { name: "ベトネベート軟膏", cat: "s3" },
  { name: "ボアラ軟膏", cat: "s3" },
  { name: "フルコート軟膏", cat: "s3" },
  { name: "ロコイド軟膏", cat: "s4" },
  { name: "キンダベート軟膏", cat: "s4" },
  { name: "クロベタゾン酪酸エステルローション", cat: "s4" },
  { name: "アルメタ軟膏", cat: "s4" },
  { name: "リドメックス軟膏", cat: "s4" },
  { name: "プレドニゾロン軟膏", cat: "s5" },
  { name: "モイゼルト軟膏", cat: "pde4" },
  { name: "コレクチム軟膏", cat: "jak" },
  { name: "プロトピック軟膏", cat: "ns" },
  { name: "プロトピック軟膏（小児用）", cat: "ns" },
  { name: "ブイタマークリーム", cat: "ns" },
  { name: "保湿剤（ヘパリン類似物質）", cat: "moist" },
  { name: "ヒルドイドソフト軟膏", cat: "moist" },
  { name: "ヒルドイドローション", cat: "moist" },
  { name: "尿素クリーム", cat: "moist" },
  { name: "プロペト", cat: "base" },
  { name: "白色ワセリン", cat: "base" },
  { name: "亜鉛華軟膏", cat: "other" },
];

const COLORS = ["#e03e3e", "#2f6fd0", "#2f9e57", "#c98a12", "#7d4fd0", "#d0642f", "#1f9490", "#cc3f8a"];

/* ===================== 状態 ===================== */

let master = loadLS("atopy.oints", DEFAULT_OINTS);
let presets = loadLS("atopy.presets", []);
let state = { age: "a", weeks: 4, items: [] };
let cur = newCur();
let editIndex = -1;

function newCur() { return { parts: [], oint: null, freq: 2, course: { t: "keep" }, rules: {} }; }
function loadLS(k, def) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : JSON.parse(JSON.stringify(def)); }
  catch (e) { return JSON.parse(JSON.stringify(def)); }
}
function saveLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
function ointById(id) { return master.find(o => o.id === id); }
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

/* ===================== 体のイラスト（提供画像＋ポリゴンオーバーレイ） ===================== */

const BODY_IMG = { src: "body.png", w: 1536, h: 1024 };
const AX_FRONT = 894, AX_BACK = 2175, SHIFT_FB = 640;

const RAW_POLYS = {
  head:    [[352,130],[357,88],[380,52],[412,29],[447,23],[482,29],[514,52],[537,88],[542,130],[500,112],[447,108],[394,112]],
  face:    [[350,138],[394,116],[447,112],[500,116],[544,138],[538,170],[520,200],[492,220],[447,228],[402,220],[374,200],[356,170]],
  eyes:    [[385,120],[509,120],[509,158],[385,158]],
  neck:    [[399,214],[499,214],[502,264],[396,264]],
  chest:   [[396,266],[498,266],[524,272],[552,284],[572,298],[578,312],[541,332],[536,368],[528,420],[536,475],[546,520],[550,560],[548,584],[346,584],[344,560],[348,520],[358,475],[366,420],[358,368],[353,332],[316,312],[322,298],[342,284],[370,272]],
  genital: [[400,584],[496,584],[482,630],[448,648],[414,630]],
  armR:    [[318,294],[350,316],[354,338],[342,392],[328,430],[310,472],[294,510],[276,548],[260,585],[248,620],[234,652],[210,668],[186,652],[178,618],[192,578],[212,538],[230,500],[248,460],[266,420],[280,382],[290,340],[296,314]],
  legR:    [[352,592],[440,608],[438,655],[429,705],[424,765],[420,825],[410,882],[408,942],[400,1002],[326,1002],[330,970],[349,940],[352,878],[351,820],[358,762],[358,700],[352,648],[348,618]],
  headB:   [[992,132],[997,88],[1020,52],[1052,29],[1087,23],[1122,29],[1154,52],[1177,88],[1182,132],[1177,165],[1156,195],[1130,212],[1087,218],[1044,212],[1018,195],[997,165]],
  neckB:   [[1039,214],[1139,214],[1142,266],[1036,266]],
  back:    [[1036,268],[1142,268],[1168,274],[1196,286],[1216,300],[1222,314],[1181,334],[1176,370],[1170,424],[1178,478],[998,478],[1006,424],[1000,370],[995,334],[954,314],[960,300],[980,286],[1008,274]],
  hip:     [[998,478],[1178,478],[1186,516],[1190,556],[1186,596],[1160,622],[1120,632],[1087,624],[1054,632],[1014,622],[988,596],[984,556],[988,516]],
  handR:   [[196,526],[250,538],[264,556],[256,588],[240,608],[214,618],[188,606],[172,576],[178,548]],
  elbowR:  [[268,412],[334,424],[302,482],[240,468]],
  kneeR:   [[356,708],[430,712],[423,792],[348,788]],
};
const pMirror = (poly, ax) => poly.map(([x, y]) => [ax - x, y]);
const pShift  = (poly, dx) => poly.map(([x, y]) => [x + dx, y]);

const VIEW_POLYS = {
  front: {
    head: RAW_POLYS.head, face: RAW_POLYS.face, eyes: RAW_POLYS.eyes, neck: RAW_POLYS.neck,
    chest: RAW_POLYS.chest,
    armR: RAW_POLYS.armR, armL: pMirror(RAW_POLYS.armR, AX_FRONT),
    legR: RAW_POLYS.legR, legL: pMirror(RAW_POLYS.legR, AX_FRONT),
    elbowR: RAW_POLYS.elbowR, elbowL: pMirror(RAW_POLYS.elbowR, AX_FRONT),
    kneeR: RAW_POLYS.kneeR, kneeL: pMirror(RAW_POLYS.kneeR, AX_FRONT),
    handR: RAW_POLYS.handR, handL: pMirror(RAW_POLYS.handR, AX_FRONT),
    genital: RAW_POLYS.genital,
  },
  back: {
    head: RAW_POLYS.headB, neck: RAW_POLYS.neckB, back: RAW_POLYS.back,
    armL: pShift(RAW_POLYS.armR, SHIFT_FB), armR: pMirror(pShift(RAW_POLYS.armR, SHIFT_FB), AX_BACK),
    legL: pShift(RAW_POLYS.legR, SHIFT_FB), legR: pMirror(pShift(RAW_POLYS.legR, SHIFT_FB), AX_BACK),
    hip: RAW_POLYS.hip,
    elbowL: pShift(RAW_POLYS.elbowR, SHIFT_FB), elbowR: pMirror(pShift(RAW_POLYS.elbowR, SHIFT_FB), AX_BACK),
    kneeL: pShift(RAW_POLYS.kneeR, SHIFT_FB), kneeR: pMirror(pShift(RAW_POLYS.kneeR, SHIFT_FB), AX_BACK),
    handL: pShift(RAW_POLYS.handR, SHIFT_FB), handR: pMirror(pShift(RAW_POLYS.handR, SHIFT_FB), AX_BACK),
  },
};
/* 描画順: 小さい部位・重なる部位が後（クリック優先・色が見える） */
const VIEW_ORDER = {
  front: ["head", "face", "eyes", "neck", "chest", "armR", "armL", "legR", "legL", "elbowR", "elbowL", "kneeR", "kneeL", "handR", "handL", "genital"],
  back:  ["head", "neck", "back", "armL", "armR", "legL", "legR", "hip", "elbowL", "elbowR", "kneeL", "kneeR", "handL", "handR"],
};
const BADGE_POS = {
  front: {
    head: [447,52], face: [447,196], eyes: [447,138], neck: [447,240], chest: [447,420], genital: [447,614],
    armR: [238,600], armL: [656,600], legR: [388,850], legL: [506,850],
    elbowR: [287,447], elbowL: [607,447], kneeR: [389,750], kneeL: [505,750], handR: [218,572], handL: [676,572],
  },
  back: {
    head: [1087,110], neck: [1087,240], back: [1087,380], hip: [1087,545],
    armL: [878,600], armR: [1297,600], legL: [1028,850], legR: [1147,850],
    elbowL: [927,447], elbowR: [1248,447], kneeL: [1029,750], kneeR: [1145,750], handL: [858,572], handR: [1317,572],
  },
};
const VIEWBOX = { front: "150 0 610 1024", back: "790 0 600 1024" };

function figureSvg(view, opts) {
  // opts: {assign: {part: color}, selecting: [parts], badges: {part: num}, width, plain}
  const a = opts.assign || {}, selSet = new Set(opts.selecting || []), badges = opts.badges || {};
  const W = opts.width || 170;
  const shapes = [`<image href="${BODY_IMG.src}" x="0" y="0" width="${BODY_IMG.w}" height="${BODY_IMG.h}"/>`];

  for (const part of VIEW_ORDER[view]) {
    const poly = VIEW_POLYS[view][part];
    const color = a[part];
    const cls = "bodyPart" + (selSet.has(part) ? " selecting" : "");
    const fill = color ? ` style="fill:${color};fill-opacity:.45"` : "";
    const pts = poly.map(p => p.join(",")).join(" ");
    shapes.push(`<polygon class="${cls}" data-part="${part}" points="${pts}"${fill}/>`);
  }

  for (const p in badges) {
    const pos = BADGE_POS[view][p];
    if (!pos) continue;
    const [x, y] = pos;
    const col = a[p] || "#888";
    shapes.push(`<g pointer-events="none"><circle cx="${x}" cy="${y}" r="24" fill="${col}" stroke="#fff" stroke-width="4"/><text x="${x}" y="${y + 10}" text-anchor="middle" font-size="30" font-weight="bold" fill="#fff">${badges[p]}</text></g>`);
  }

  const cap = opts.plain
    ? (view === "front" ? "からだの前" : "からだのうしろ")
    : (view === "front" ? "前面（向かって右が左半身）" : "背面");
  return `<figure><svg viewBox="${VIEWBOX[view]}" width="${W}" xmlns="http://www.w3.org/2000/svg">${shapes.join("")}</svg><figcaption>${cap}</figcaption></figure>`;
}

/* 部位→色/番号のマップを作る */
function assignMaps(items) {
  const assign = {}, badges = {};
  items.forEach((it, i) => {
    it.parts.forEach(p => { assign[p] = COLORS[i % COLORS.length]; badges[p] = i + 1; });
  });
  return { assign, badges };
}

/* ===================== 指示文の生成 ===================== */

function ointLabel(name, cat) {
  const s = CATS[cat] && CATS[cat].sent;
  return s ? `${name}（${s}）` : name;
}

function sentenceFrom(n, cat, freq, rulesArr) {
  const parts = [`${ointLabel(n, cat)}を1日${freq}回ぬる`];
  for (const r of rulesArr) {
    if (r[0] === "keep") parts.push(`次回の受診まで続ける`);
    if (r[0] === "sw") parts.push(`改善したら${r[1]}へ置き換え`);
    if (r[0] === "pa") parts.push(`よくなったら「プロアクティブ療法」で少しずつ減らす（ぬらない日は${r[1]}・下の説明を参照）`);
    if (r[0] === "end") parts.push(`改善したらぬるのを終了してよい`);
    if (r[0] === "fl") parts.push(`悪化しているところには${r[1]}をぬる`);
    if (r[0] === "fr") parts.push(r[1]);
  }
  return parts.join("。") + "。";
}

/* item(内部形式) → 患者向けルール配列（名前解決済み・方針が先頭） */
function rulesArrOf(item) {
  const arr = [];
  const c = item.course || { t: "keep" };
  if (c.t === "keep") arr.push(["keep"]);
  if (c.t === "sw") { const o = ointById(c.to); if (o) arr.push(["sw", o.name]); }
  if (c.t === "pa") { const o = ointById(c.to); if (o) arr.push(["pa", o.name]); }
  if (c.t === "end") arr.push(["end"]);
  const r = item.rules;
  if (r.fl) { const o = ointById(r.fl.o); if (o) arr.push(["fl", o.name]); }
  if (r.fr && r.fr.text) arr.push(["fr", r.fr.text]);
  return arr;
}

function sentenceOf(item) {
  const o = ointById(item.oint);
  if (!o) return "";
  return sentenceFrom(o.name, o.cat, item.freq, rulesArrOf(item));
}

/* ===================== FTU・処方量計算 ===================== */

function gramsPerApp(parts) {
  const base = FTU_BASE[state.age];
  return parts.reduce((s, p) => {
    const [k, f] = PART_FTU[p];
    const ftu = k === "abs" ? f : base[k] * f;
    return s + ftu * 0.5;
  }, 0);
}

function calcDoses() {
  const D = state.weeks * 7;
  const totals = {}, details = {};
  const add = (id, g, txt) => {
    if (g <= 0.01) return;
    totals[id] = (totals[id] || 0) + g;
    (details[id] = details[id] || []).push(`${txt} ${g.toFixed(1)}g`);
  };
  state.items.forEach((it, i) => {
    const g = gramsPerApp(it.parts);
    const c = it.course || { t: "keep" };
    const num = `指示${i + 1}`;
    if (c.t === "sw") {
      // 即切替: 想定切替週で按分
      const w = Math.min(c.wk, state.weeks);
      add(it.oint, g * it.freq * 7 * w, `${num}:切替前${w}週`);
      add(c.to, g * it.freq * 7 * (state.weeks - w), `${num}:切替後${state.weeks - w}週`);
    } else if (c.t === "pa") {
      // プロアクティブ: Aは最低2週分＋残り期間の半分、Bは残り期間の半分
      const aDays = D <= 14 ? D : 14 + (D - 14) / 2;
      const bDays = D - aDays;
      add(it.oint, g * it.freq * aDays, `${num}:毎日ぬる分`);
      add(c.to, g * it.freq * bDays, `${num}:休薬日の分`);
    } else if (c.t === "end") {
      // 改善したら終了: 期間の半分で計算
      add(it.oint, g * it.freq * D / 2, `${num}:半量計算`);
    } else {
      // 次回外来まで継続: 全期間分
      add(it.oint, g * it.freq * D, `${num}`);
    }
    if (it.rules.fl) add(it.rules.fl.o, g * (it.rules.fl.pct / 100) * it.freq * D, `${num}:増悪部${it.rules.fl.pct}%`);
  });
  return { totals, details };
}

/* ===================== 医師画面 描画 ===================== */

const $ = id => document.getElementById(id);

function renderAll() {
  renderFigures();
  renderSelectedParts();
  renderOintPicker();
  renderRuleEditors();
  renderPreview();
  renderInstrList();
  renderPresets();
  renderDoses();
  $("btnAddInstr").disabled = !(cur.parts.length && cur.oint);
  $("btnAddInstr").textContent = editIndex >= 0 ? "指示を更新" : "この指示を追加";
  $("btnCancelEdit").style.display = editIndex >= 0 ? "" : "none";
}

function renderFigures() {
  const { assign, badges } = assignMaps(state.items);
  $("figureWrap").innerHTML =
    figureSvg("front", { assign, badges, selecting: cur.parts, width: 170 }) +
    figureSvg("back",  { assign, badges, selecting: cur.parts, width: 170 });
  $("figureWrap").querySelectorAll(".bodyPart").forEach(el => {
    el.addEventListener("click", () => togglePart(el.dataset.part));
  });
}

function togglePart(p) {
  const i = cur.parts.indexOf(p);
  if (i >= 0) cur.parts.splice(i, 1); else cur.parts.push(p);
  renderAll();
}

function renderSelectedParts() {
  $("selectedParts").innerHTML = cur.parts.length
    ? "選択中： " + cur.parts.map(p => `<span class="tag">${PARTS[p].name}</span>`).join("")
    : `<span style="color:var(--sub)">部位が未選択です</span>`;
}

function renderOintPicker() {
  $("ointPicker").innerHTML = master.map(o => {
    const c = CATS[o.cat] || CATS.other;
    return `<button class="ointBtn${cur.oint === o.id ? " sel" : ""}" data-id="${o.id}">
      ${c.badge ? `<span class="badge ${c.cls}">${c.badge}</span>` : ""}${esc(o.name)}</button>`;
  }).join("");
  $("ointPicker").querySelectorAll(".ointBtn").forEach(b => {
    b.addEventListener("click", () => { cur.oint = +b.dataset.id; renderAll(); });
  });
  document.querySelectorAll('input[name="freq"]').forEach(r => {
    r.checked = +r.value === cur.freq;
    r.onchange = () => { cur.freq = +r.value; renderAll(); };
  });
}

/* --- ルール編集UI --- */

function ointOptions(selId, prefer) {
  let list = master.slice();
  if (prefer === "moist") list = list.slice().sort((x, y) => (x.cat === "moist" || x.cat === "base" ? -1 : 1) - (y.cat === "moist" || y.cat === "base" ? -1 : 1));
  return master.map(o => `<option value="${o.id}"${o.id === selId ? " selected" : ""}>${esc(o.name)}</option>`).join("");
}

function defaultMoist() {
  const m = master.find(o => o.cat === "moist") || master.find(o => o.cat === "base") || master[0];
  return m ? m.id : null;
}

function renderCourseEditor() {
  const c = cur.course || { t: "keep" };
  document.querySelectorAll('input[name="course"]').forEach(r => {
    r.checked = r.value === c.t;
    r.onchange = () => {
      const t = r.value;
      if (t === "sw") cur.course = { t: "sw", to: defaultMoist(), wk: Math.ceil(state.weeks / 2) };
      else if (t === "pa") cur.course = { t: "pa", to: defaultMoist() };
      else cur.course = { t };
      renderAll();
    };
  });
  const box = $("courseEditor");
  if (c.t === "sw") {
    box.innerHTML = `<div class="ruleEditor">置き換え先：
      <select data-f="to">${ointOptions(c.to)}</select>
      <span>｜切り替え想定：</span><select data-f="wk">${weekOpts(c.wk)}</select><span>週後（量計算用）</span></div>`;
  } else if (c.t === "pa") {
    box.innerHTML = `<div class="ruleEditor">ぬらない日にぬる薬（置き換え先）：
      <select data-f="to">${ointOptions(c.to)}</select>
      <span class="hintInline">※患者画面に減らし方の説明が自動でつきます</span></div>`;
  } else {
    box.innerHTML = "";
  }
  box.querySelectorAll("select").forEach(inp => {
    inp.addEventListener("change", () => { cur.course[inp.dataset.f] = +inp.value; renderAll(); });
  });
}

function renderRuleEditors() {
  renderCourseEditor();
  const R = cur.rules;
  const box = $("ruleEditors");
  const eds = [];
  if (R.fl) eds.push(`<div class="ruleEditor" data-r="fl">悪化しているところには
      <select data-f="o">${ointOptions(R.fl.o)}</select>
      <span>｜想定面積：</span><select data-f="pct">${[10, 25, 50].map(v => `<option value="${v}"${v === R.fl.pct ? " selected" : ""}>${v}%</option>`).join("")}</select>
      <button class="rm" title="削除">✕</button></div>`);
  if (R.fr) eds.push(`<div class="ruleEditor" data-r="fr" style="align-items:flex-start">
      <textarea data-f="text" placeholder="自由記載（例：入浴後5分以内にぬる）">${esc(R.fr.text)}</textarea>
      <button class="rm" title="削除">✕</button></div>`);
  box.innerHTML = eds.join("");

  box.querySelectorAll(".ruleEditor").forEach(ed => {
    const key = ed.dataset.r;
    ed.querySelector(".rm").addEventListener("click", () => { delete cur.rules[key]; renderAll(); });
    ed.querySelectorAll("select,textarea").forEach(inp => {
      inp.addEventListener("change", () => {
        const f = inp.dataset.f;
        cur.rules[key][f] = inp.tagName === "TEXTAREA" ? inp.value : +inp.value || inp.value;
        if (f !== "text") renderAll(); else renderPreview();
      });
    });
  });

  document.querySelectorAll(".ruleChip").forEach(ch => {
    const key = ch.dataset.rule;
    ch.classList.toggle("on", !!cur.rules[key]);
    ch.onclick = () => {
      if (key === "fl") cur.rules.fl = { o: defaultMoist(), pct: 25 };
      if (key === "fr") cur.rules.fr = { text: "" };
      renderAll();
    };
  });
}

function weekOpts(sel) {
  let s = "";
  for (let w = 1; w <= state.weeks; w++) s += `<option value="${w}"${w === sel ? " selected" : ""}>${w}</option>`;
  return s;
}

function renderPreview() {
  const t = cur.oint ? sentenceFrom(ointById(cur.oint).name, ointById(cur.oint).cat, cur.freq,
    rulesArrOf({ course: cur.course, rules: cur.rules })) : "—";
  $("instrPreview").textContent = t;
}

/* --- 指示リスト --- */

function renderInstrList() {
  $("instrList").innerHTML = state.items.map((it, i) => {
    const col = COLORS[i % COLORS.length];
    return `<div class="instrCard" style="border-left-color:${col}">
      <span class="num" style="background:${col}">${i + 1}</span>
      <div class="body">
        <div class="partsLine">${it.parts.map(p => PARTS[p].name).join("・")}</div>
        <div>${esc(sentenceOf(it))}</div>
      </div>
      <div class="ops">
        <button data-op="edit" data-i="${i}" title="編集">✏️</button>
        <button data-op="del" data-i="${i}" title="削除">🗑️</button>
      </div></div>`;
  }).join("");
  $("instrList").querySelectorAll("button").forEach(b => {
    b.addEventListener("click", () => {
      const i = +b.dataset.i;
      if (b.dataset.op === "del") { state.items.splice(i, 1); if (editIndex === i) cancelEdit(); }
      else {
        editIndex = i;
        cur = JSON.parse(JSON.stringify(state.items[i]));
      }
      renderAll();
    });
  });
}

function cancelEdit() { editIndex = -1; cur = newCur(); }

/* --- マイ定型 --- */

function renderPresets() {
  const area = $("presetArea");
  if (!presets.length) { area.innerHTML = ""; return; }
  area.innerHTML = `<div class="pTitle">★ マイ定型（タップで適用）</div>` + presets.map((p, i) =>
    `<span class="presetChip"><button style="border:none;background:none;font:inherit" data-i="${i}">${esc(p.name)}</button><button class="del" data-del="${i}">✕</button></span>`).join("");
  area.querySelectorAll("button[data-i]").forEach(b => b.addEventListener("click", () => {
    const p = presets[+b.dataset.i];
    cur.oint = p.oint; cur.freq = p.freq;
    cur.course = JSON.parse(JSON.stringify(p.course || { t: "keep" }));
    cur.rules = JSON.parse(JSON.stringify(p.rules));
    renderAll();
  }));
  area.querySelectorAll("button[data-del]").forEach(b => b.addEventListener("click", () => {
    presets.splice(+b.dataset.del, 1); saveLS("atopy.presets", presets); renderPresets();
  }));
}

/* --- 処方量表 --- */

function renderDoses() {
  const area = $("doseArea");
  if (!state.items.length) { area.innerHTML = `<div class="doseEmpty">指示を追加すると自動計算されます。</div>`; return; }
  const { totals, details } = calcDoses();
  const rows = Object.entries(totals).map(([id, g]) => {
    const o = ointById(+id);
    if (!o) return "";
    const c = CATS[o.cat] || CATS.other;
    const det = details[id] || [];
    const detHtml = det.length > 1 || (det.length === 1 && det[0].includes(":"))
      ? `<div class="doseDetail">${det.map(esc).join("　")}</div>` : "";
    return `<tr><td>${c.badge ? `<span class="badge ${c.cls}">${c.badge}</span> ` : ""}${esc(o.name)}${detHtml}</td>
      <td class="g">${g.toFixed(1)} g</td>
      <td class="g"><input type="number" step="1" min="0" value="${Math.ceil(g)}"> g</td></tr>`;
  }).join("");
  area.innerHTML = `<table class="doseTable"><thead><tr><th>薬剤</th><th style="text-align:right">計算値</th><th style="text-align:right">処方量（調整可）</th></tr></thead><tbody>${rows}</tbody></table>`;
}

/* ===================== QR・患者データ ===================== */

function buildPayload() {
  const d = new Date();
  const dateStr = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
  return {
    v: 2, d: dateStr,
    it: state.items.map(it => {
      const o = ointById(it.oint);
      return { p: it.parts, n: o.name, c: o.cat, f: it.freq, r: rulesArrOf(it) };
    }),
  };
}

function patientUrl() {
  const data = LZString.compressToEncodedURIComponent(JSON.stringify(buildPayload()));
  return location.origin + location.pathname + "#p=" + data;
}

function makeQrSvg(url, cellSize) {
  const qr = qrcode(0, "M");
  qr.addData(url, "Byte");
  qr.make();
  return qr.createSvgTag({ cellSize: cellSize || 4, margin: 4, scalable: true });
}

function showQR() {
  if (!state.items.length) { alert("先に指示を追加してください。"); return; }
  const url = patientUrl();
  $("qrArea").innerHTML = `
    ${makeQrSvg(url)}
    <div class="qrHint">患者さんのスマホカメラで読み取ってもらってください。<br>読み取り後「画面を保存（スクリーンショット）」するようご案内ください。</div>
    <div style="margin-top:.5em"><a href="${url}" target="_blank" rel="noopener">▶ 患者画面をこの端末で確認</a></div>`;
}

/* ===================== プロアクティブ別記説明 ===================== */

function proactiveNoteHtml(payloadItems) {
  const names = [...new Set(payloadItems.flatMap(it => (it.r || []).filter(r => r[0] === "pa").map(r => r[1])))];
  if (!names.length) return "";
  const b = esc(names.join("・"));
  return `<div class="paNote">
    <div class="paTitle">🌱「プロアクティブ療法」のすすめかた（よくなってからの減らし方）</div>
    <ol>
      <li>肌が<b>「つるつるすべすべ」</b>になっても、<b>2〜3日</b>はそのまま続けます</li>
      <li>つぎに<b>2日に1回</b>に減らします。ぬらない日は <b>${b}</b> をぬります</li>
      <li>2日に1回でも「つるつるすべすべ」がキープできていれば、<b>1週間後</b>を目安に<b>3日に1回 → 4日に1回</b>と少しずつ減らしていきます</li>
    </ol>
  </div>`;
}

/* ===================== 患者ビュー ===================== */

function renderPatient(payload) {
  document.getElementById("doctorView").style.display = "none";
  const v = $("patientView");
  v.style.display = "";

  const assign = {}, badges = {};
  payload.it.forEach((it, i) => it.p.forEach(p => { assign[p] = COLORS[i % COLORS.length]; badges[p] = i + 1; }));

  const items = payload.it.map((it, i) => {
    const col = COLORS[i % COLORS.length];
    return `<div class="ptInstrItem">
      <span class="num" style="background:${col}">${i + 1}</span>
      <div><div class="parts">${it.p.map(p => PARTS[p] ? PARTS[p].name : p).join("・")}</div>
      <div class="how">${esc(sentenceFrom(it.n, it.c, it.f, it.r))}</div></div></div>`;
  }).join("");

  v.innerHTML = `<div class="ptWrap">
    <div class="ptHeader"><h1>ぬり薬の説明</h1><div class="date">${esc(payload.d)}</div></div>
    <div class="ptSave">📱 この画面は<strong>スクリーンショットで保存</strong>して、おうちでぬるときに見てください。</div>
    <div class="ptFigures">${figureSvg("front", { assign, badges, width: 165, plain: true })}${figureSvg("back", { assign, badges, width: 165, plain: true })}</div>
    <div class="ptInstr">${items}</div>
    ${proactiveNoteHtml(payload.it)}
    <div class="ptFtu">💡 <b>ぬる量のめやす（1FTU）</b>：大人の人さし指の先から第1関節まで、チューブから出した量（約0.5g）が、<b>大人の手のひら2枚分</b>の広さに塗る量です。ローションは1円玉大が同じ量のめやすです。すりこまず、皮ふがしっとり光るくらいにやさしく のばしてください。</div>
    <div class="ptFooter">この説明は医師の指示にもとづいて作成されています。症状が悪化する場合は受診してください。</div>
  </div>`;
}

/* ===================== 印刷 ===================== */

function renderPrint() {
  if (!state.items.length) { alert("先に指示を追加してください。"); return; }
  const payload = buildPayload();
  const url = patientUrl();
  const { assign, badges } = assignMaps(state.items);

  const items = payload.it.map((it, i) => {
    const col = COLORS[i % COLORS.length];
    return `<div class="pItem"><span class="num" style="background:${col}">${i + 1}</span>
      <div><b>${it.p.map(p => PARTS[p].name).join("・")}</b><br>${esc(sentenceFrom(it.n, it.c, it.f, it.r))}</div></div>`;
  }).join("");

  $("printArea").innerHTML = `
    <div class="pHead"><h1>ぬり薬の説明</h1><div>${esc(payload.d)}</div></div>
    <div class="pCols">
      <div class="pFig">${figureSvg("front", { assign, badges, width: 150, plain: true })}${figureSvg("back", { assign, badges, width: 150, plain: true })}</div>
      <div class="pList">${items}
        <div class="pQr">${makeQrSvg(url, 3)}<div class="pQrTxt">スマホのカメラでこのQRコードを読み取ると、同じ説明をスマホでも見られます。</div></div>
      </div>
    </div>
    ${proactiveNoteHtml(payload.it)}
    <div class="pFtuNote">ぬる量のめやす：大人の人さし指の先から第1関節までチューブから出した量（約0.5g）＝大人の手のひら2枚分の広さ。ローションは1円玉大が同量のめやす。すりこまず、皮ふがしっとり光る程度にのばす。</div>`;
  window.print();
}

/* ===================== 設定モーダル ===================== */

let editMaster = [];

const CAT_LABELS = { s1: "ステロイド1群（最強）", s2: "ステロイド2群", s3: "ステロイド3群", s4: "ステロイド4群", s5: "ステロイド5群（弱）", pde4: "非ステロイド", jak: "非ステロイド", ns: "非ステロイド", moist: "保湿剤", base: "基剤・保湿", other: "その他" };

function renderCatalogSel() {
  const groups = {};
  CATALOG.forEach((c, i) => {
    const label = CAT_LABELS[c.cat] || "その他";
    (groups[label] = groups[label] || []).push(`<option value="${i}">${esc(c.name)}</option>`);
  });
  $("catalogSel").innerHTML = Object.entries(groups)
    .map(([label, opts]) => `<optgroup label="${label}">${opts.join("")}</optgroup>`).join("");
}

function openSettings() {
  editMaster = JSON.parse(JSON.stringify(master));
  renderCatalogSel();
  renderOintEditor();
  $("settingsModal").style.display = "";
}

function renderOintEditor() {
  const catOpts = id => Object.entries({ s1: "ステロイド1群", s2: "ステロイド2群", s3: "ステロイド3群", s4: "ステロイド4群", s5: "ステロイド5群", pde4: "非ステロイド(PDE4)", jak: "非ステロイド(JAK)", ns: "非ステロイド(その他)", moist: "保湿剤", base: "基剤・保湿", other: "その他" })
    .map(([k, l]) => `<option value="${k}"${k === id ? " selected" : ""}>${l}</option>`).join("");
  $("ointEditor").innerHTML = editMaster.map((o, i) =>
    `<div class="ointRow"><input type="text" value="${esc(o.name)}" data-i="${i}" data-f="name">
     <select data-i="${i}" data-f="cat">${catOpts(o.cat)}</select>
     <button class="del" data-del="${i}" title="削除">🗑️</button></div>`).join("");
  $("ointEditor").querySelectorAll("input,select").forEach(inp => {
    inp.addEventListener("change", () => { editMaster[+inp.dataset.i][inp.dataset.f] = inp.value; });
  });
  $("ointEditor").querySelectorAll("button.del").forEach(b => {
    b.addEventListener("click", () => { editMaster.splice(+b.dataset.del, 1); renderOintEditor(); });
  });
}

function saveSettings() {
  editMaster = editMaster.filter(o => o.name.trim());
  master = editMaster;
  saveLS("atopy.oints", master);
  $("settingsModal").style.display = "none";
  // 削除された軟膏を参照している指示のチェック
  state.items = state.items.filter(it => ointById(it.oint));
  if (cur.oint && !ointById(cur.oint)) cur.oint = null;
  renderAll();
}

/* ===================== 初期化 ===================== */

function initDoctor() {
  $("selAge").innerHTML = Object.entries(FTU_BASE).map(([k, v]) => `<option value="${k}"${k === state.age ? " selected" : ""}>${v.label}</option>`).join("");
  $("selWeeks").innerHTML = [1, 2, 3, 4, 5, 6, 7, 8].map(w => `<option value="${w}"${w === state.weeks ? " selected" : ""}>${w}週間</option>`).join("");
  $("selAge").addEventListener("change", e => { state.age = e.target.value; renderAll(); });
  $("selWeeks").addEventListener("change", e => { state.weeks = +e.target.value; renderAll(); });

  $("btnAddInstr").addEventListener("click", () => {
    if (!cur.parts.length || !cur.oint) return;
    // 同じ部位が他の指示にあれば外す
    const myParts = new Set(cur.parts);
    state.items.forEach((it, i) => { if (i !== editIndex) it.parts = it.parts.filter(p => !myParts.has(p)); });
    if (editIndex >= 0) state.items[editIndex] = JSON.parse(JSON.stringify(cur));
    else state.items.push(JSON.parse(JSON.stringify(cur)));
    state.items = state.items.filter(it => it.parts.length);
    cancelEdit();
    renderAll();
  });
  $("btnCancelEdit").addEventListener("click", () => { cancelEdit(); renderAll(); });

  $("btnSavePreset").addEventListener("click", () => {
    if (!cur.oint) { alert("軟膏を選択してから保存してください。"); return; }
    const name = prompt("定型の名前（例：標準・顔用）", ointById(cur.oint).name.slice(0, 8) + "…定型");
    if (!name) return;
    presets.push({ name, oint: cur.oint, freq: cur.freq, course: JSON.parse(JSON.stringify(cur.course)), rules: JSON.parse(JSON.stringify(cur.rules)) });
    saveLS("atopy.presets", presets);
    renderPresets();
  });

  $("btnQR").addEventListener("click", showQR);
  $("btnPrint").addEventListener("click", renderPrint);
  $("btnReset").addEventListener("click", () => {
    if (confirm("入力した指示をすべてクリアしますか？")) { state.items = []; cancelEdit(); $("qrArea").innerHTML = ""; renderAll(); }
  });

  $("btnSettings").addEventListener("click", openSettings);
  $("btnAddOint").addEventListener("click", () => {
    const maxId = Math.max(0, ...editMaster.map(o => o.id));
    editMaster.push({ id: maxId + 1, name: "", cat: "moist" });
    renderOintEditor();
  });
  $("btnCatalogAdd").addEventListener("click", () => {
    const c = CATALOG[+$("catalogSel").value];
    if (!c) return;
    if (editMaster.some(o => o.name === c.name)) { alert("すでに登録されています。"); return; }
    const maxId = Math.max(0, ...editMaster.map(o => o.id));
    editMaster.push({ id: maxId + 1, name: c.name, cat: c.cat });
    renderOintEditor();
  });
  $("btnResetMaster").addEventListener("click", () => {
    if (confirm("軟膏リストを初期セットに戻しますか？（追加した薬剤は消えます）")) {
      editMaster = JSON.parse(JSON.stringify(DEFAULT_OINTS));
      renderOintEditor();
    }
  });
  $("btnSettingsSave").addEventListener("click", saveSettings);
  $("btnSettingsCancel").addEventListener("click", () => { $("settingsModal").style.display = "none"; });

  renderAll();
}

function boot() {
  const m = location.hash.match(/^#p=(.+)$/);
  if (m) {
    try {
      const payload = JSON.parse(LZString.decompressFromEncodedURIComponent(m[1]));
      if (payload && payload.it) { renderPatient(payload); return; }
    } catch (e) { /* fallthrough */ }
  }
  initDoctor();
}

window.addEventListener("hashchange", () => location.reload());
boot();
