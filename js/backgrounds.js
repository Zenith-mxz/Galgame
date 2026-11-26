(function () {
  const BG_DEFS = {
    station: {
      sky: "linear-gradient(180deg, #2a2740 0%, #5a4060 34%, #c06a5e 62%, #f0a26a 100%)",
      extra: "radial-gradient(circle at 82% 30%, rgba(255, 214, 150, 0.55), transparent 30%)"
    },
    boardwalk: {
      sky: "linear-gradient(180deg, #1e2440 0%, #3c4568 32%, #b4749a 62%, #f0b088 100%)",
      extra: "radial-gradient(circle at 20% 78%, rgba(120, 170, 255, 0.4), transparent 40%)"
    },
    classroom: {
      sky: "linear-gradient(180deg, #16161f 0%, #2a2630 40%, #4a3a40 80%, #6a4a44 100%)",
      extra: "radial-gradient(circle at 30% 62%, rgba(255, 190, 110, 0.35), transparent 34%)"
    },
    clubroom: {
      sky: "linear-gradient(180deg, #0e1018 0%, #1c1c28 40%, #2c2230 100%)",
      extra: "radial-gradient(circle at 68% 24%, rgba(160, 180, 255, 0.3), transparent 34%)"
    },
    rooftop: {
      sky: "linear-gradient(180deg, #0a1020 0%, #1a2440 34%, #3a4a70 70%, #7a6a90 100%)",
      extra: "radial-gradient(circle at 74% 18%, rgba(255, 240, 200, 0.35), transparent 26%)"
    },
    beach: {
      sky: "linear-gradient(180deg, #06080f 0%, #101a2c 40%, #1c2a44 66%, #3a3a5a 100%)",
      extra: "radial-gradient(ellipse at 50% 96%, rgba(120, 200, 255, 0.25), transparent 55%)"
    },
    room: {
      sky: "linear-gradient(180deg, #1a1512 0%, #2c201c 40%, #4a3228 100%)",
      extra: "radial-gradient(circle at 34% 40%, rgba(255, 190, 120, 0.42), transparent 40%)"
    },
    festival: {
      sky: "linear-gradient(180deg, #1a0e1c 0%, #3a1c2c 40%, #7a3a44 72%, #d0704a 100%)",
      extra: "radial-gradient(circle at 24% 30%, rgba(255, 190, 120, 0.6), transparent 28%)"
    },
    stairs: {
      sky: "linear-gradient(180deg, #0c1020 0%, #1a2238 40%, #3a3c58 100%)",
      extra: "radial-gradient(circle at 88% 16%, rgba(255, 230, 180, 0.4), transparent 24%)"
    },
    lighthouse: {
      sky: "linear-gradient(180deg, #05060e 0%, #0e1424 44%, #1c2444 100%)",
      extra: "radial-gradient(circle at 50% 6%, rgba(255, 250, 220, 0.5), transparent 30%)"
    },
    sky: {
      sky: "radial-gradient(ellipse at 50% 8%, #2a3458 0%, #141a30 42%, #05060f 100%)",
      extra: "radial-gradient(circle at 50% 100%, rgba(120, 160, 255, 0.18), transparent 60%)"
    }
  };

  const STARS = `radial-gradient(circle at 12% 14%, #fff 0 1.4px, transparent 2px),
    radial-gradient(circle at 24% 8%, #fff 0 1px, transparent 1.6px),
    radial-gradient(circle at 38% 18%, #fff 0 1.2px, transparent 2px),
    radial-gradient(circle at 56% 6%, #fff 0 1px, transparent 1.8px),
    radial-gradient(circle at 72% 12%, #fff 0 1.5px, transparent 2.2px),
    radial-gradient(circle at 88% 20%, #fff 0 1px, transparent 1.8px),
    radial-gradient(circle at 78% 34%, #fff 0 1.2px, transparent 2px),
    radial-gradient(circle at 18% 30%, #fff 0 1px, transparent 1.8px),
    radial-gradient(circle at 46% 28%, #fff 0 1.1px, transparent 1.9px)`;

  function bgCss(id) {
    const d = BG_DEFS[id];
    if (!d) return "linear-gradient(180deg, #101018, #1c1420)";
    return `${d.extra}, ${STARS}, ${d.sky}`;
  }

  window.Backgrounds = { BG_DEFS, bgCss };
})();