(function () {
  "use strict";

  const LINE = "#503a40";
  const SKIN = "#fbe4da";
  const SKIN_MID = "#f2cfc2";
  const SKIN_SHADOW = "#e3b3a4";
  const SKIN_DEEP = "#cf8f7e";
  const SKIN_LIGHT = "#fff8f4";
  const HAIR_DARK = "#1e161c";
  const WHITE = "#ffffff";

  const EMOTION = {
    normal:   { eye: "open",   lid: "normal", mouth: "closed", blush: 0.0,  tear: 0, brow: "soft" },
    smile:    { eye: "smile",  lid: "smile",  mouth: "smile",  blush: 0.2,  tear: 0, brow: "soft" },
    shy:      { eye: "half",   lid: "half",   mouth: "small",  blush: 0.9,  tear: 0, brow: "pout" },
    teasing:  { eye: "half",   lid: "half",   mouth: "smirk",  blush: 0.35, tear: 0, brow: "raised" },
    sad:      { eye: "sad",    lid: "sad",    mouth: "frown",  blush: 0.0,  tear: 0, brow: "worried" },
    cry:      { eye: "closed", lid: "cry",    mouth: "frown",  blush: 0.5,  tear: 1, brow: "worried" },
    surprise: { eye: "wide",   lid: "wide",   mouth: "o",      blush: 0.25, tear: 0, brow: "raised" },
    serious:  { eye: "open",   lid: "sharp",  mouth: "closed", blush: 0.0,  tear: 0, brow: "sharp" },
    love:     { eye: "heart",  lid: "half",   mouth: "smile",  blush: 1.0,  tear: 0, brow: "soft" },
    anger:    { eye: "narrow", lid: "sharp",  mouth: "open",   blush: 0.45, tear: 0, brow: "sharp" }
  };

  const EMO = EMOTION;

  function eyelash(cx, dir, color) {
    return `<path d="M${cx + dir * 26},${-4} C${cx + dir * 34},${-20} ${cx + dir * 10},${-30} ${cx - dir * 4},${-28} L${cx - dir * 6},${-24} C${cx + dir * 8},${-25} ${cx + dir * 28},${-16} ${cx + dir * 22},${-2} Z" fill="${color}" stroke="${color}" stroke-width="1.2"/>`;
  }

  function drawEye(cx, cy, dir, st, t) {
    const s = st;
    const eyeW = 34;
    const eyeH = 30;

    if (s.eye === "closed" || s.eye === "smile") {
      const arc = s.eye === "smile"
        ? `M${cx - 26},${cy + 2} Q${cx},${cy - 14} ${cx + 26},${cy + 2}`
        : `M${cx - 26},${cy - 2} Q${cx},${cy + 12} ${cx + 26},${cy - 2}`;
      return `
        <path d="${arc}" fill="none" stroke="${LINE}" stroke-width="3.6" stroke-linecap="round"/>
        <path d="${arc}" fill="none" stroke="#1a1014" stroke-width="2" stroke-linecap="round" transform="translate(0,-1)"/>
        <path d="M${cx + dir * 26},${cy - 2} L${cx + dir * 34},${cy - 10}" stroke="${LINE}" stroke-width="3" stroke-linecap="round"/>
        ${s.tear ? tearDrop(cx, cy) : ""}`;
    }

    let topLid;
    if (s.lid === "sharp") {
      topLid = `M${cx - eyeW},${cy} C${cx - 22},${cy - eyeH} ${cx + 20},${cy - eyeH} ${cx + eyeW},${cy + 4}`;
    } else if (s.lid === "sad") {
      topLid = `M${cx - eyeW},${cy + 2} C${cx - 24},${cy - eyeH + 8} ${cx + 20},${cy - eyeH} ${cx + eyeW},${cy - 2}`;
    } else if (s.lid === "wide") {
      topLid = `M${cx - eyeW},${cy - 2} C${cx - 24},${cy - eyeH - 8} ${cx + 22},${cy - eyeH - 8} ${cx + eyeW},${cy - 2}`;
    } else {
      topLid = `M${cx - eyeW},${cy} C${cx - 24},${cy - eyeH - 2} ${cx + 22},${cy - eyeH - 2} ${cx + eyeW},${cy + 2}`;
    }
    const bottomLid = `M${cx - eyeW + 4},${cy + 4} C${cx - 20},${cy + eyeH} ${cx + 20},${cy + eyeH} ${cx + eyeW - 2},${cy + 4}`;

    let iris;
    if (s.eye === "heart") {
      iris = `<path d="M${cx},${cy + 16} C${cx - 22},${cy - 2} ${cx - 14},${cy - 22} ${cx},${cy - 8} C${cx + 14},${cy - 22} ${cx + 22},${cy - 2} ${cx},${cy + 16} Z" fill="#f1678f" stroke="${LINE}" stroke-width="1.6"/>
        <ellipse cx="${cx - 6}" cy="${cy}" rx="4" ry="6" fill="#fff" opacity="0.9"/>`;
    } else {
      const pupilW = s.eye === "wide" ? 11 : 13;
      iris = `
        <ellipse cx="${cx}" cy="${cy + 2}" rx="${eyeW - 4}" ry="${eyeH - 6}" fill="${t.irisLight}"/>
        <ellipse cx="${cx}" cy="${cy + 7}" rx="${eyeW - 10}" ry="${eyeH - 12}" fill="${t.irisDeep}"/>
        <ellipse cx="${cx}" cy="${cy + 3}" rx="${pupilW}" ry="${eyeH - 9}" fill="${t.pupil}"/>
        <ellipse cx="${cx}" cy="${cy + 2}" rx="${eyeW - 4}" ry="${eyeH - 6}" fill="url(#irisGrad_${t.uid})" opacity="0.6"/>
        <ellipse cx="${cx}" cy="${cy + eyeH - 8}" rx="${eyeW - 12}" ry="5" fill="${t.irisLight}" opacity="0.5"/>
        <path d="M${cx - eyeW + 10},${cy + 2} C${cx - eyeW + 14},${cy - 10} ${cx - 6},${cy - eyeH + 8} ${cx},${cy - eyeH + 10}" stroke="#ffffff" stroke-width="2.4" fill="none" opacity="0.85"/>
        <ellipse cx="${cx - 7}" cy="${cy - 5}" rx="6" ry="8" fill="${WHITE}" opacity="0.95"/>
        <ellipse cx="${cx + 8}" cy="${cy + 10}" rx="3.2" ry="4" fill="${WHITE}" opacity="0.55"/>
        <circle cx="${cx - 2}" cy="${cy - 12}" r="2.2" fill="${WHITE}" opacity="0.8"/>`;
    }

    const lidLine = s.lid === "sharp"
      ? `<path d="${topLid}" fill="none" stroke="${LINE}" stroke-width="4.6" stroke-linecap="round"/>`
      : `<path d="${topLid}" fill="none" stroke="${LINE}" stroke-width="4" stroke-linecap="round"/>`;

    const lashes = `
      <path d="M${cx + dir * eyeW},${cy + (s.lid === "sharp" ? 4 : 2)} L${cx + dir * (eyeW + 9)},${cy + (s.lid === "sharp" ? -2 : -8)}" stroke="${LINE}" stroke-width="2.8" stroke-linecap="round" opacity="0.9"/>
      <path d="M${cx + dir * (eyeW - 4)},${cy + (s.lid === "sharp" ? 9 : 7)} L${cx + dir * (eyeW + 6)},${cy + 3}" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round" opacity="0.7"/>`;

    return `
      <path d="${topLid} L${cx + eyeW - 2},${cy + 4} C${cx + 20},${cy + eyeH} ${cx - 20},${cy + eyeH} ${cx - eyeW + 4},${cy + 4} Z" fill="${t.eyeWhite}"/>
      ${iris}
      <path d="${bottomLid}" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round" opacity="0.75"/>
      ${lidLine}
      ${lashes}
      <path d="M${cx - eyeW + 14},${cy + 3} C${cx - 8},${cy - eyeH + 10} ${cx + 8},${cy - eyeH + 10} ${cx + eyeW - 14},${cy + 3}" fill="none" stroke="${LINE}" stroke-width="1.4" opacity="0.35"/>
      ${s.eye === "half" ? `<rect x="${cx - eyeW - 2}" y="${cy - eyeH}" width="${eyeW * 2 + 4}" height="${eyeH - 2}" fill="${SKIN}" opacity="0.62"/>
        <path d="M${cx - eyeW},${cy} C${cx - 24},${cy - 8} ${cx + 22},${cy - 8} ${cx + eyeW},${cy}" fill="none" stroke="${LINE}" stroke-width="4" stroke-linecap="round"/>` : ""}
      ${s.eye === "narrow" ? `<path d="M${cx - eyeW},${cy - 6} L${cx + eyeW},${cy + 2}" stroke="${LINE}" stroke-width="4.4" stroke-linecap="round"/>` : ""}
      ${s.tear ? tearDrop(cx, cy) : ""}`;
  }

  function tearDrop(cx, cy) {
    return `<path d="M${cx + 12},${cy + 20} C${cx + 14},${cy + 36} ${cx + 8},${cy + 50} ${cx + 6},${cy + 60}" stroke="#a6dcf2" stroke-width="3.6" fill="none" opacity="0.9" stroke-linecap="round"/>
      <ellipse cx="${cx + 6}" cy="${cy + 60}" rx="3.4" ry="4.2" fill="#cdefff"/>`;
  }

  function brow(cx, dir, type) {
    let d;
    if (type === "sharp") d = `M-30,6 Q0,-4 30,-8`;
    else if (type === "raised") d = `M-30,-2 Q0,-14 30,-6`;
    else if (type === "worried") d = `M-30,-8 Q0,-2 30,6`;
    else if (type === "pout") d = `M-30,2 Q0,-10 30,-2`;
    else d = `M-30,0 Q0,-8 30,-2`;
    return `<path d="${d}" fill="none" stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" opacity="0.9" transform="scale(${dir},1)"/>`;
  }

  function mouthShape(type) {
    if (type === "closed") return `<path d="M-11,0 Q0,4 11,0" stroke="#b05d6d" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    if (type === "small") return `<path d="M-7,-1 Q0,5 7,-1" stroke="#c9707f" stroke-width="2.8" fill="#e08a9a" stroke-linecap="round"/>`;
    if (type === "smile") return `<path d="M-16,-2 Q0,14 16,-2" stroke="#c9707f" stroke-width="2.8" fill="#c06a7a" stroke-linecap="round"/>
      <path d="M-10,4 Q0,9 10,4" stroke="#f3b4bf" stroke-width="2" fill="none" opacity="0.6"/>`;
    if (type === "frown") return `<path d="M-13,6 Q0,-6 13,6" stroke="#b05d6d" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
    if (type === "smirk") return `<path d="M-15,1 Q4,10 16,-4" stroke="#c9707f" stroke-width="2.8" fill="none" stroke-linecap="round"/>`;
    if (type === "o") return `<ellipse cx="0" cy="4" rx="8" ry="11" fill="#8f3b4d" stroke="#c9707f" stroke-width="1.8"/>
      <ellipse cx="0" cy="2" rx="5" ry="3" fill="#d97b8a" opacity="0.7"/>`;
    return `<ellipse cx="0" cy="3" rx="12" ry="14" fill="#8f3b4d" stroke="#c9707f" stroke-width="1.8"/>
      <ellipse cx="0" cy="9" rx="7" ry="6" fill="#d97b8a" opacity="0.7"/>`;
  }

  function blush(type, o, uid) {
    const one = (cx) => `
      <ellipse cx="${cx}" cy="0" rx="30" ry="13" fill="url(#blushGrad_${uid})" opacity="${o * 0.75}"/>
      <path d="M${cx - 15},-5 L${cx - 8},6M${cx - 5},-7 L${cx + 2},7M${cx + 5},-6 L${cx + 12},6" stroke="#e2748d" stroke-width="2" opacity="${o}" stroke-linecap="round"/>`;
    return `<g transform="translate(0,0)">${one(-78)}${one(78)}</g>`;
  }

  const THEMES = {
    kasumi: {
      key: "kasumi",
      name: "藤宫 霞",
      image: "assets/kasumi.webp",
      imageFit: "cover",
      hair: "#332630", hairDeep: "#211a20", hairLight: "#6a4a58", hairShine: "#a87789",
      style: "long",
      irisDeep: "#3a2140", irisLight: "#9c6aa4", pupil: "#2a1830",
      eyeWhite: "#fdf7fb",
      outfit: "cardigan", outfitColor: "#f3ebf0", outfitAccent: "#e07a95",
      accessory: "ribbon", accessoryColor: "#e05f86",
      color: "#f08aa8"
    },
    yuina: {
      key: "yuina",
      name: "白石 结衣",
      image: "assets/yuina.webp",
      imageFit: "cover",
      hair: "#332f42", hairDeep: "#221f2e", hairLight: "#5f5a78", hairShine: "#9a93b8",
      style: "short",
      irisDeep: "#23406a", irisLight: "#5c8fd0", pupil: "#182840",
      eyeWhite: "#f6fafd",
      outfit: "sailor", outfitColor: "#2d3a63", outfitAccent: "#e8ecf6",
      accessory: "pin", accessoryColor: "#8ad4f0",
      color: "#7fb6f0"
    },
    sion: {
      key: "sion",
      name: "星见 栞音",
      image: "assets/download.webp",
      imageFit: "cover",
      hair: "#3f2b30", hairDeep: "#281a1e", hairLight: "#7a5358", hairShine: "#c09080",
      style: "wavy",
      irisDeep: "#5a3218", irisLight: "#d49748", pupil: "#3e2210",
      eyeWhite: "#fefaf3",
      outfit: "dress", outfitColor: "#5f4270", outfitAccent: "#d9b46a",
      accessory: "star", accessoryColor: "#ffe08a",
      color: "#f6b968"
    }
  };

  function faceShape(t) {
    let s = "";
    s += `<ellipse cx="270" cy="356" rx="104" ry="132" fill="${SKIN_MID}"/>`;
    s += `<path d="M270,224 C186,224 158,296 158,368 C158,438 214,486 270,494 C326,486 382,438 382,368 C382,296 354,224 270,224 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="2.2"/>`;
    s += `<ellipse cx="270" cy="292" rx="74" ry="52" fill="${SKIN_LIGHT}" opacity="0.45"/>`;
    s += `<path d="M196,300 C188,336 190,378 202,410 C194,376 194,336 200,300 Z" fill="${SKIN_MID}" opacity="0.45"/>`;
    s += `<path d="M344,300 C352,336 350,378 338,410 C346,376 346,336 340,300 Z" fill="${SKIN_MID}" opacity="0.45"/>`;
    s += `<path d="M270,474 C238,470 210,452 194,426 C216,452 244,466 270,470 C296,466 324,452 346,426 C330,452 302,470 270,474 Z" fill="${SKIN_DEEP}" opacity="0.22"/>`;
    s += `<path d="M262,430 C266,438 268,444 270,448 C272,444 274,438 278,430" stroke="${LINE}" stroke-width="1.6" fill="none" opacity="0.55"/>`;
    s += `<path d="M238,462 C250,470 290,470 302,462" stroke="${SKIN_DEEP}" stroke-width="2.2" fill="none" opacity="0.35"/>`;
    s += `<ellipse cx="270" cy="272" rx="60" ry="26" fill="${SKIN_MID}" opacity="0.28"/>`;
    return s;
  }

  function neck(t) {
    return `
      <path d="M246,468 L246,516 C256,534 284,534 294,516 L294,468 Z" fill="${SKIN}"/>
      <path d="M250,476 C248,492 250,504 256,514" stroke="${SKIN_SHADOW}" stroke-width="3" fill="none" opacity="0.5"/>
      <path d="M290,476 C292,492 290,504 284,514" stroke="${SKIN_SHADOW}" stroke-width="3" fill="none" opacity="0.5"/>
      <ellipse cx="270" cy="514" rx="44" ry="20" fill="${SKIN_MID}" opacity="0.35"/>`;
  }

  function bodyShape(t) {
    const oc = t.outfitColor;
    const ac = t.outfitAccent;
    let s = "";
    s = `<g transform="translate(0,-26)">`;
    s += `<path d="M270,530 C214,540 176,584 160,646 L146,860 L394,860 L380,646 C364,584 326,540 270,530 Z" fill="${SKIN}"/>`;
    s += `<path d="M270,530 C214,540 180,582 166,644 L152,860 L394,860 L380,644 C366,582 326,540 270,530 Z" fill="${oc}" stroke="rgba(0,0,0,0.18)" stroke-width="1.6"/>`;
    s += `<path d="M160,646 C160,760 152,820 146,860" stroke="rgba(0,0,0,0.14)" stroke-width="2" fill="none"/>`;
    s += `<path d="M380,646 C380,760 388,820 394,860" stroke="rgba(0,0,0,0.14)" stroke-width="2" fill="none"/>`;

    if (t.outfit === "cardigan") {
      s += `<path d="M270,528 C232,536 210,566 200,610 L186,860 L354,860 L340,610 C330,566 308,536 270,528 Z" fill="#fbf6f9" stroke="rgba(0,0,0,0.12)" stroke-width="1.4"/>`;
      s += `<path d="M270,536 C252,548 240,576 236,616 L270,590 L304,616 C300,576 288,548 270,536 Z" fill="${SKIN}" stroke="${LINE}" stroke-width="1.4" opacity="0.96"/>`;
      s += `<path d="M270,590 L270,860" stroke="#e7dde4" stroke-width="2.4"/>`;
      s += `<path d="M270,536 C258,548 250,572 248,600M270,536 C282,548 290,572 292,600" stroke="${SKIN_SHADOW}" stroke-width="2" fill="none" opacity="0.6"/>`;
      s += `<path d="M270,536 L248,516 L236,566 M270,536 L292,516 L304,566" fill="#fbf6f9" stroke="rgba(0,0,0,0.1)" stroke-width="1.4" opacity="0.9"/>`;
      s += `<path d="M236,640 C246,634 258,634 266,640 L266,700 C256,694 246,694 236,700 Z" fill="#f2eaf0" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>`;
      s += `<path d="M304,640 C294,634 282,634 274,640 L274,700 C284,694 294,694 304,700 Z" fill="#f2eaf0" stroke="rgba(0,0,0,0.1)" stroke-width="1"/>`;
      s += `<path d="M246,720 L294,720" stroke="${ac}" stroke-width="6" opacity="0.9"/>`;
      s += `<circle cx="270" cy="720" r="5" fill="#d9c3d0" stroke="rgba(0,0,0,0.12)" stroke-width="1"/>`;
    } else if (t.outfit === "sailor") {
      s += `<path d="M270,528 C226,538 196,576 184,632 L170,860 L370,860 L356,632 C344,576 314,538 270,528 Z" fill="${oc}" stroke="rgba(0,0,0,0.2)" stroke-width="1.6"/>`;
      s += `<path d="M270,528 L214,562 L222,592 L270,570 L318,592 L326,562 Z" fill="${ac}" stroke="#8f99bb" stroke-width="1.2"/>`;
      s += `<path d="M256,540 L270,576 L284,540 L270,530 Z" fill="${t.accessoryColor}" stroke="rgba(0,0,0,0.15)" stroke-width="1.2"/>`;
      s += `<path d="M214,562 L202,614M326,562 L338,614" stroke="#8f99bb" stroke-width="2" fill="none" opacity="0.6"/>`;
      s += `<path d="M260,700 L270,724 L280,700 L270,692 Z" fill="${ac}" stroke="#8f99bb" stroke-width="1"/>`;
      s += `<path d="M270,528 C258,546 252,576 252,610M270,528 C282,546 288,576 288,610" stroke="${SKIN_SHADOW}" stroke-width="2" fill="none" opacity="0.5"/>`;
      s += `<path d="M184,632 C184,730 176,800 170,860" stroke="rgba(0,0,0,0.14)" stroke-width="2" fill="none"/>`;
      s += `<path d="M356,632 C356,730 364,800 370,860" stroke="rgba(0,0,0,0.14)" stroke-width="2" fill="none"/>`;
    } else if (t.outfit === "dress") {
      s += `<path d="M270,530 C232,540 208,572 196,624 L172,860 L368,860 L344,624 C332,572 308,540 270,530 Z" fill="${oc}" stroke="rgba(0,0,0,0.16)" stroke-width="1.6"/>`;
      s += `<path d="M270,536 L224,558 L224,586 L270,566 L316,586 L316,558 Z" fill="#8f6a9f" stroke="rgba(0,0,0,0.12)" stroke-width="1.2"/>`;
      s += `<path d="M226,560 C232,548 250,542 270,552 C290,542 308,548 314,560" fill="none" stroke="${ac}" stroke-width="3"/>`;
      s += `<path d="M270,566 L270,860" stroke="rgba(0,0,0,0.1)" stroke-width="2"/>`;
      s += `<path d="M206,700 C236,714 304,714 334,700" stroke="${ac}" stroke-width="2.6" fill="none" opacity="0.8"/>`;
      s += `<circle cx="270" cy="708" r="6" fill="${ac}" stroke="rgba(0,0,0,0.12)" stroke-width="1"/>`;
      s += `<path d="M232,780 C232,808 236,838 240,860M308,780 C308,808 304,838 300,860" stroke="rgba(0,0,0,0.12)" stroke-width="2" fill="none"/>`;
    }
    s += `</g>`;
    return s;
  }

  function hairBack(t) {
    let s = "";
    if (t.style === "long" || t.style === "wavy") {
      s += `<path d="M270,200 C132,200 108,320 106,460 C104,590 84,720 64,860 L122,860 C120,740 134,620 148,520 C150,440 156,330 190,270 Z" fill="${t.hairDeep}" stroke="rgba(0,0,0,0.3)" stroke-width="1.4"/>`;
      s += `<path d="M270,200 C408,200 432,320 434,460 C436,590 456,720 476,860 L418,860 C420,740 406,620 392,520 C390,440 384,330 350,270 Z" fill="${t.hairDeep}" stroke="rgba(0,0,0,0.3)" stroke-width="1.4"/>`;
      s += `<path d="M270,196 C140,196 116,330 120,470 C124,600 108,730 96,860 L436,860 C424,730 408,600 412,470 C416,330 400,196 270,196 Z" fill="${t.hair}"/>`;
      s += `<path d="M180,290 C168,420 172,560 158,720" stroke="${t.hairLight}" stroke-width="7" fill="none" opacity="0.5"/>`;
      s += `<path d="M360,290 C372,420 368,560 382,720" stroke="${t.hairLight}" stroke-width="7" fill="none" opacity="0.5"/>`;
      s += `<path d="M206,470 C200,580 190,700 178,820M334,470 C340,580 350,700 362,820" stroke="${t.hairShine}" stroke-width="2.4" fill="none" opacity="0.35"/>`;
      if (t.style === "wavy") {
        s += `<path d="M150,560 C138,620 146,670 136,726M390,560 C402,620 394,670 404,726" stroke="${t.hairLight}" stroke-width="4" fill="none" opacity="0.4"/>`;
      }
    } else {
      s += `<path d="M270,200 C148,200 122,320 128,470 C132,556 120,640 108,720 L432,720 C420,640 408,556 412,470 C418,320 392,200 270,200 Z" fill="${t.hairDeep}" stroke="rgba(0,0,0,0.3)" stroke-width="1.4"/>`;
      s += `<path d="M270,196 C134,196 118,330 126,490 C130,570 120,640 112,700 L428,700 C420,640 410,570 414,490 C422,330 406,196 270,196 Z" fill="${t.hair}"/>`;
      s += `<path d="M186,280 C172,400 176,520 166,640" stroke="${t.hairLight}" stroke-width="6" fill="none" opacity="0.5"/>`;
      s += `<path d="M354,280 C368,400 364,520 374,640" stroke="${t.hairLight}" stroke-width="6" fill="none" opacity="0.5"/>`;
    }
    return s;
  }

  function hairFront(t) {
    let s = "";
    s += `<path d="M270,196 C170,196 132,252 130,326 C152,290 178,264 214,258 C196,278 188,300 192,322 C210,292 236,278 266,278 C258,290 256,302 260,316 C276,292 300,284 324,292 C342,298 358,308 368,326 C376,288 372,246 340,222 Z" fill="${t.hair}" stroke="rgba(0,0,0,0.22)" stroke-width="1.6"/>`;
    s += `<path d="M270,196 C208,196 172,228 158,278 C182,250 214,236 250,234 C228,252 214,274 214,296 C234,268 262,256 290,258 C286,272 284,284 288,296 C304,272 326,262 348,268 C362,252 372,240 374,240 C360,212 326,196 270,196 Z" fill="${t.hairLight}" stroke="rgba(0,0,0,0.18)" stroke-width="1.2"/>`;
    s += `<path d="M182,262 Q270,226 362,266" stroke="${t.hairShine}" stroke-width="10" fill="none" opacity="0.55"/>`;
    s += `<path d="M198,258 Q246,240 282,246" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.55"/>`;
    s += `<path d="M312,254 Q342,258 360,272" stroke="#ffffff" stroke-width="2.4" fill="none" opacity="0.45"/>`;
    s += `<path d="M202,290 C196,306 194,320 198,334" stroke="${t.hairLight}" stroke-width="3" fill="none" opacity="0.6"/>`;
    s += `<path d="M340,288 C346,304 348,320 344,336" stroke="${t.hairLight}" stroke-width="3" fill="none" opacity="0.6"/>`;
    if (t.style === "long") {
      s += `<path d="M386,214 C408,238 412,278 400,316 C394,284 384,254 386,214 Z" fill="${t.hair}" stroke="rgba(0,0,0,0.2)" stroke-width="1.2"/>`;
    } else if (t.style === "short") {
      s += `<path d="M144,300 C132,344 138,392 152,420 C160,388 154,344 144,300 Z" fill="${t.hair}" stroke="rgba(0,0,0,0.18)" stroke-width="1.2"/>`;
      s += `<path d="M396,300 C408,344 402,392 388,420 C380,388 386,344 396,300 Z" fill="${t.hair}" stroke="rgba(0,0,0,0.18)" stroke-width="1.2"/>`;
      s += `<path d="M310,200 C336,208 356,226 366,248 L358,196 C344,190 324,192 310,200 Z" fill="${t.hair}" stroke="rgba(0,0,0,0.18)" stroke-width="1.2"/>`;
    } else if (t.style === "wavy") {
      s += `<path d="M136,320 C124,366 132,414 142,456 C148,420 144,368 136,320 Z" fill="${t.hair}" stroke="rgba(0,0,0,0.18)" stroke-width="1.2"/>`;
      s += `<path d="M404,320 C416,366 408,414 398,456 C392,420 396,368 404,320 Z" fill="${t.hair}" stroke="rgba(0,0,0,0.18)" stroke-width="1.2"/>`;
    }
    return s;
  }

  function accessory(t) {
    if (t.accessory === "ribbon") {
      return `
        <path d="M372,210 L346,186 L342,226 L372,210 Z" fill="${t.accessoryColor}" stroke="rgba(0,0,0,0.25)" stroke-width="1.4"/>
        <path d="M372,210 L398,186 L402,226 L372,210 Z" fill="${t.accessoryColor}" stroke="rgba(0,0,0,0.25)" stroke-width="1.4"/>
        <path d="M372,210 L394,200 L396,218 L372,210 Z" fill="rgba(255,255,255,0.25)"/>
        <circle cx="372" cy="210" r="6" fill="#f7a5bb" stroke="rgba(0,0,0,0.2)" stroke-width="1.2"/>`;
    }
    if (t.accessory === "pin") {
      return `
        <path d="M186,238 L164,220" stroke="#d7b46a" stroke-width="3"/>
        <circle cx="162" cy="218" r="6" fill="#8ad4f0" stroke="rgba(0,0,0,0.25)" stroke-width="1.2"/>
        <path d="M186,238 L200,212" stroke="#d7b46a" stroke-width="3"/>
        <circle cx="202" cy="210" r="5" fill="#f7a5bb" stroke="rgba(0,0,0,0.25)" stroke-width="1.2"/>`;
    }
    if (t.accessory === "star") {
      const star = (cx, cy, r, col) => {
        let p = "";
        for (let i = 0; i < 10; i++) {
          const ang = -Math.PI / 2 + i * Math.PI / 5;
          const rr = i % 2 === 0 ? r : r * 0.45;
          p += (i === 0 ? "M" : "L") + (cx + Math.cos(ang) * rr).toFixed(1) + "," + (cy + Math.sin(ang) * rr).toFixed(1);
        }
        return `<path d="${p} Z" fill="${col}" stroke="rgba(0,0,0,0.22)" stroke-width="1"/>`;
      };
      return `${star(368, 214, 13, t.accessoryColor)}<circle cx="346" cy="232" r="3.4" fill="#fff4c8"/>`;
    }
    return "";
  }

  function buildSvg(themeKey, emotionKey, uid) {
    const t = Object.assign({}, THEMES[themeKey], { uid: uid });
    const e = EMOTION[emotionKey] ? emotionKey : "normal";
    const st = EMOTION[e];
    const irisGrad = `irisGrad_${uid}`;

    const leftEye = `<g transform="translate(224,318)">${drawEye(0, 0, -1, st, t)}</g>`;
    const rightEye = `<g transform="translate(316,318)">${drawEye(0, 0, 1, st, t)}</g>`;
    const browsHtml = `<g transform="translate(224,274)">${brow(0, -1, st.brow)}</g><g transform="translate(316,274)">${brow(0, 1, st.brow)}</g>`;
    const mouthHtml = `<g transform="translate(270,412)">${mouthShape(st.mouth)}</g>`;
    const blushHtml = st.blush ? `<g transform="translate(270,396)">${blush(st.mouth, st.blush, uid)}</g>` : "";

    return `<svg class="sprite-svg" viewBox="0 0 540 900" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax meet">
      <defs>
        <radialGradient id="${irisGrad}" cx="50%" cy="30%" r="65%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.75"/>
          <stop offset="45%" stop-color="${t.irisLight}" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="${t.irisDeep}" stop-opacity="0.85"/>
        </radialGradient>
        <radialGradient id="blushGrad_${uid}" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stop-color="#ff9db4" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#ff9db4" stop-opacity="0"/>
        </radialGradient>
        <filter id="soft_${uid}" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="0.7"/>
        </filter>
      </defs>
      <g>
        ${hairBack(t)}
        ${neck(t)}
        ${bodyShape(t)}
        ${faceShape(t)}
        ${blushHtml}
        ${browsHtml}
        ${leftEye}${rightEye}
        ${mouthHtml}
        ${hairFront(t)}
        ${accessory(t)}
      </g>
    </svg>`;
  }

  function build(themeKey, emotionKey, uid) {
    const t = THEMES[themeKey];
    if (!t) return "";
    if (t.image) {
      const svg = buildSvg(themeKey, emotionKey, uid);
      return `<img class="sprite-img" src="${t.image}" alt="${t.name}" draggable="false" onerror="window.Art._fallback(this)"/>${svg.replace('<svg class="sprite-svg"', '<svg class="sprite-svg sprite-fallback hidden"')}`;
    }
    return buildSvg(themeKey, emotionKey, uid);
  }

  function _fallback(img) {
    const w = img.parentNode;
    if (!w) return;
    img.style.display = "none";
    const fb = w.querySelector(".sprite-fallback");
    if (fb) fb.classList.remove("hidden");
  }

  window.Art = { build: build, buildSvg: buildSvg, _fallback: _fallback, THEMES: THEMES, EMOTION: EMOTION };
})();