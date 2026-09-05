(() => {
  "use strict";

  const W = 160;
  const H = 284;
  const MAX_BALLOONS = 7;
  const canvas = document.querySelector("#game");
  const ctx = canvas.getContext("2d", { alpha: false });
  const shell = document.querySelector(".game-shell");
  const overlay = document.querySelector("#intertitle");
  const chapterEl = document.querySelector("#chapter");
  const titleEl = document.querySelector("#story-title");
  const copyEl = document.querySelector("#story-copy");
  const continueButton = document.querySelector("#continue-button");
  const hintEl = document.querySelector("#controls-hint");
  const difficultySelector = document.querySelector("#difficulty-selector");
  const difficultyButtons = [...document.querySelectorAll("[data-difficulty]")];
  const pauseButton = document.querySelector("#pause-button");
  const monochromeButton = document.querySelector("#monochrome-button");
  const doveInventoryButton = document.querySelector("#dove-inventory");
  const doveInventoryIcon = document.querySelector("#dove-inventory-icon");
  const doveInventoryCtx = doveInventoryIcon.getContext("2d");
  const doveCountEl = document.querySelector("#dove-count");
  const touchStick = document.querySelector("#touch-stick");

  ctx.imageSmoothingEnabled = false;
  doveInventoryCtx.imageSmoothingEnabled = false;

  const atlas = new Image();
  atlas.src = "assets/sprite-atlas-v2.png";
  const luciferSprite = new Image();
  luciferSprite.src = "assets/lucifer.png";
  const doveAtlas = new Image();
  doveAtlas.src = "assets/generated/sprites/peace-dove/sprite-sheet-alpha.png";
  let doveFrames = [];
  let doveDurations = [143, 143, 143, 143];
  fetch("assets/generated/sprites/peace-dove/manifest.json")
    .then((response) => {
      if (!response.ok) throw new Error(`dove manifest ${response.status}`);
      return response.json();
    })
    .then((manifest) => {
      doveFrames = manifest.frame_layout.rows.fly;
      doveDurations = manifest.animation.rows.fly.durations_ms;
      shell.dataset.doveAsset = "ready";
      updateInventoryUI();
    })
    .catch(() => { shell.dataset.doveAsset = "error"; });
  const soundtrack = new Audio("music/ceu-lavanda-game.mp3");
  soundtrack.loop = true;
  soundtrack.preload = "auto";
  soundtrack.volume = 0.42;
  soundtrack.playbackRate = 0.78;
  soundtrack.preservesPitch = false;
  soundtrack.webkitPreservesPitch = false;

  const SPRITES = {
    priest: [105, 66, 128, 218],
    balloon: [420, 70, 112, 210],
    bird: [675, 90, 155, 190],
    bigBird: [976, 35, 230, 255],
    biplane: [40, 390, 255, 175],
    jet: [330, 400, 270, 150],
    satellite: [660, 370, 195, 220],
    ufo: [964, 405, 235, 155],
    alien: [95, 654, 130, 235],
    gate: [345, 666, 240, 210],
    god: [690, 665, 150, 220],
    cloud: [942, 745, 260, 100],
    ghost: [100, 942, 135, 220],
    brokenBalloon: [408, 977, 140, 165],
    feather: [690, 989, 130, 145],
    cross: [1025, 983, 135, 150]
  };

  const stages = [
    {
      name: "AVES BAIXAS",
      duration: 32,
      spawn: 1.15,
      speed: [28, 38],
      types: ["bird"],
      chapter: "I — A PRIMEIRA CAMADA",
      title: "OS PÁSSAROS",
      copy: "Primeiro vieram os que ainda lembravam a terra. Eles não atacavam. Apenas corrigiam o caminho."
    },
    {
      name: "AVES ALTAS",
      duration: 36,
      spawn: 0.95,
      speed: [34, 47],
      types: ["bird", "bigBird"],
      chapter: "II — ONDE O AR AFINA",
      title: "AS AVES SEM NINHO",
      copy: "Mais acima, as aves eram grandes demais. Nenhuma piscava. Bento contou seis sóis dentro de um olho."
    },
    {
      name: "CORREDOR AÉREO",
      duration: 40,
      spawn: 1.55,
      speed: [32, 42],
      types: ["biplane", "jet"],
      chapter: "III — O CÉU DOS HOMENS",
      title: "MÁQUINAS COM ASAS",
      copy: "Abaixo, chamavam aquilo de progresso. Visto de cima, parecia apenas uma fila de dentes."
    },
    {
      name: "ÓRBITA MORTA",
      duration: 42,
      spawn: 1.05,
      speed: [30, 44],
      types: ["satellite"],
      chapter: "IV — DEPOIS DO SOM",
      title: "AS MÁQUINAS REZAVAM",
      copy: "Os satélites repetiam orações captadas por engano. Todas terminavam no meio da palavra."
    },
    {
      name: "VISITANTES",
      duration: 45,
      spawn: 0.82,
      speed: [36, 52],
      types: ["ufo"],
      chapter: "V — O LADO DE FORA",
      title: "ELES SABIAM SEU NOME",
      copy: "Os visitantes não perguntaram de onde ele vinha. Perguntaram qual dos Bentos chegaria primeiro."
    }
  ];

  const finaleStory = {
    chapter: "VI — O ÚLTIMO METRO",
    title: "A PORTA",
    copy: "Quando o sétimo céu se abriu, não havia trombetas. Havia uma senha. E uma fila que não terminava.",
    button: "APROXIMAR"
  };

  const difficulties = {
    easy: { id: "easy", label: "FÁCIL", speed: 0.76, spawn: 1.32, invulnerability: 2.3 },
    normal: { id: "normal", label: "NORMAL", speed: 1, spawn: 1, invulnerability: 1.8 },
    hell: { id: "hell", label: "HELL", speed: 1.38, spawn: 0.68, invulnerability: 1.05 }
  };

  const ROPE_MIN = 28;
  const ROPE_MAX = 62;
  const ROPE_DEFAULT = 45;
  const BALLOON_FORMATION = [
    { x: 0, y: -16 },
    { x: -9, y: -9 },
    { x: 9, y: -7 },
    { x: -15, y: -1 },
    { x: 15, y: 1 },
    { x: -6, y: 4 },
    { x: 6, y: 6 }
  ];

  const keys = { left: false, right: false, up: false, down: false };
  const player = { x: W / 2, y: 210, w: 12, h: 19, speed: 68, invulnerable: 0 };
  let state = "title";
  let stageIndex = 0;
  let stageTime = 0;
  let spawnTimer = 0;
  let balloons = MAX_BALLOONS;
  let altitude = 0;
  let hazards = [];
  let peaceDoves = [];
  let doveInventory = 0;
  let doveSpawnTimer = Infinity;
  let doveSpawnedStages = new Set();
  let doveAttack = null;
  let peaceFlash = 0;
  let particles = [];
  let stars = [];
  let lastTime = performance.now();
  let currentStoryAction = "start-stage";
  let audio = null;
  let ropeLength = ROPE_DEFAULT;
  let difficulty = difficulties.normal;
  let skyTransition = null;
  const touch = { active: false, pointerId: null, originX: 0, originY: 0, currentX: 0, currentY: 0 };

  const random = (min, max) => min + Math.random() * (max - min);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const mix = (from, to, amount) => from + (to - from) * amount;

  function mixColor(from, to, amount) {
    const parse = (color) => [1, 3, 5].map((offset) => Number.parseInt(color.slice(offset, offset + 2), 16));
    const a = parse(from);
    const b = parse(to);
    return `rgb(${a.map((channel, index) => Math.round(mix(channel, b[index], amount))).join(",")})`;
  }

  function initStars() {
    stars = Array.from({ length: 42 }, () => ({
      x: Math.floor(random(2, W - 2)),
      y: Math.floor(random(0, H)),
      size: Math.random() > 0.82 ? 2 : 1,
      speed: random(4, 12),
      phase: Math.random() * 6
    }));
  }

  function ensureAudio() {
    if (audio) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) audio = new AudioContext();
  }

  function tone(frequency, duration = 0.09, volume = 0.035, type = "square") {
    if (!audio) return;
    const oscillator = audio.createOscillator();
    const gain = audio.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(volume, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
    oscillator.connect(gain).connect(audio.destination);
    oscillator.start();
    oscillator.stop(audio.currentTime + duration);
  }

  function startMusic() {
    const playback = soundtrack.play();
    if (playback) playback.catch(() => {
      shell.dataset.music = "blocked";
    });
  }

  soundtrack.addEventListener("playing", () => { shell.dataset.music = "playing"; });
  soundtrack.addEventListener("pause", () => { shell.dataset.music = "paused"; });
  soundtrack.addEventListener("error", () => { shell.dataset.music = "error"; });

  function setDifficulty(id) {
    difficulty = difficulties[id] || difficulties.normal;
    difficultyButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.difficulty === difficulty.id));
    });
  }

  function drawSprite(name, x, y, width, height, flip = false, alpha = 1) {
    const source = SPRITES[name];
    if (!source || !atlas.complete || atlas.naturalWidth === 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    if (flip) {
      ctx.translate(Math.floor(x + width), 0);
      ctx.scale(-1, 1);
      ctx.drawImage(atlas, ...source, 0, Math.floor(y), Math.floor(width), Math.floor(height));
    } else {
      ctx.drawImage(atlas, ...source, Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
    }
    ctx.restore();
  }

  function doveFrameAt(elapsedMs) {
    if (!doveFrames.length) return null;
    const cycle = doveDurations.reduce((sum, duration) => sum + duration, 0);
    let cursor = ((elapsedMs % cycle) + cycle) % cycle;
    for (let index = 0; index < doveDurations.length; index += 1) {
      if (cursor < doveDurations[index]) return doveFrames[index];
      cursor -= doveDurations[index];
    }
    return doveFrames[0];
  }

  function drawDove(target, x, y, width, height, flip = false, rotation = 0, alpha = 1) {
    const source = doveFrameAt(performance.now());
    if (!source || !doveAtlas.complete || doveAtlas.naturalWidth === 0) return;
    target.save();
    target.globalAlpha = alpha;
    target.translate(Math.floor(x + width / 2), Math.floor(y + height / 2));
    target.rotate(rotation);
    if (flip) target.scale(-1, 1);
    target.drawImage(doveAtlas, source.x, source.y, source.w, source.h, -width / 2, -height / 2, width, height);
    target.restore();
  }

  function updateInventoryUI() {
    const available = doveInventory > 0;
    doveInventoryButton.hidden = !available;
    doveInventoryButton.disabled = !available || Boolean(doveAttack) || state !== "playing";
    doveCountEl.textContent = String(doveInventory);
    doveInventoryButton.setAttribute(
      "aria-label",
      available ? `Usar pomba da paz, ${doveInventory} ${doveInventory === 1 ? "disponível" : "disponíveis"}` : "Pomba da paz indisponível"
    );
    shell.dataset.doveInventory = String(doveInventory);
    doveInventoryCtx.clearRect(0, 0, 32, 32);
    if (available) drawDove(doveInventoryCtx, 1, 1, 30, 30);
  }

  function showStory(story, action, buttonText = "CONTINUAR") {
    state = "story";
    currentStoryAction = action;
    chapterEl.textContent = story.chapter;
    titleEl.textContent = story.title;
    copyEl.textContent = story.copy;
    continueButton.textContent = story.button || buttonText;
    const showSetup = (action === "start-stage" && stageIndex === 0) || action === "restart";
    difficultySelector.hidden = !showSetup;
    hintEl.hidden = !showSetup;
    overlay.classList.toggle("is-transition", (action === "start-stage" && stageIndex > 0) || action === "show-finale");
    overlay.classList.add("is-visible");
    shell.classList.remove("is-playing");
  }

  function hideStory() {
    overlay.classList.remove("is-visible");
    shell.classList.add("is-playing");
  }

  function resetRun() {
    stageIndex = 0;
    stageTime = 0;
    spawnTimer = 0.6;
    balloons = MAX_BALLOONS;
    altitude = 0;
    hazards = [];
    peaceDoves = [];
    doveInventory = 0;
    doveSpawnTimer = Infinity;
    doveSpawnedStages = new Set();
    doveAttack = null;
    peaceFlash = 0;
    particles = [];
    skyTransition = null;
    ropeLength = ROPE_DEFAULT;
    soundtrack.pause();
    soundtrack.currentTime = 0;
    player.x = W / 2;
    player.invulnerable = 0;
    updateInventoryUI();
  }

  function beginStage() {
    state = "playing";
    stageTime = 0;
    spawnTimer = 0.7;
    hazards = [];
    peaceDoves = [];
    doveAttack = null;
    doveSpawnTimer = stageIndex < 2 && !doveSpawnedStages.has(stageIndex) ? random(5.5, 9) : Infinity;
    player.invulnerable = Math.min(1.5, difficulty.invulnerability);
    skyTransition = null;
    hideStory();
    tone(110 + stageIndex * 18, 0.35, 0.025, "sine");
    startMusic();
    updateInventoryUI();
  }

  function advanceStory() {
    ensureAudio();
    if (audio?.state === "suspended") audio.resume();
    startMusic();

    if (currentStoryAction === "restart") {
      resetRun();
      showStory(stages[0], "start-stage", "COMEÇAR");
      return;
    }
    if (currentStoryAction === "show-finale") {
      state = "finale";
      overlay.classList.remove("is-visible");
      shell.classList.remove("is-playing");
      tone(55, 1.2, 0.045, "sine");
      return;
    }
    if (currentStoryAction === "start-stage") {
      beginStage();
    }
  }

  function spawnHazard() {
    const stage = stages[stageIndex];
    const type = stage.types[Math.floor(Math.random() * stage.types.length)];
    const specs = {
      bird: { w: 18, h: 13 },
      bigBird: { w: 27, h: 19 },
      biplane: { w: 32, h: 15 },
      jet: { w: 34, h: 14 },
      satellite: { w: 24, h: 25 },
      ufo: { w: 31, h: 16 },
      alien: { w: 13, h: 26 }
    }[type];
    const aircraft = type === "biplane" || type === "jet";
    const direction = Math.random() > 0.5 ? 1 : -1;
    hazards.push({
      type,
      x: random(5, W - specs.w - 5),
      y: -specs.h - 3,
      w: specs.w,
      h: specs.h,
      vy: random(...stage.speed) * difficulty.speed,
      vx: (aircraft ? direction * random(3, 7) : random(-9, 9)) * difficulty.speed,
      rotation: aircraft ? direction * random(0.06, 0.13) : random(-0.08, 0.08),
      spin: type === "satellite" ? random(-1.4, 1.4) : 0,
      flip: direction < 0,
      huntsPlayer: false
    });
  }

  function spawnPeaceDove() {
    if (stageIndex > 1 || doveSpawnedStages.has(stageIndex)) return;
    doveSpawnedStages.add(stageIndex);
    const drift = random(-3.5, 3.5);
    peaceDoves.push({
      x: clamp(player.x - 14 + random(-8, 8), 8, W - 36),
      y: -30,
      w: 28,
      h: 28,
      vx: drift,
      vy: random(19, 24),
      phase: random(0, Math.PI * 2),
      flip: drift < 0
    });
    shell.dataset.doveSpawned = String(stageIndex);
  }

  function collectPeaceDove(dove) {
    doveInventory += 1;
    dove.y = H + 80;
    tone(523.25, 0.16, 0.04, "sine");
    setTimeout(() => tone(783.99, 0.24, 0.03, "sine"), 80);
    for (let i = 0; i < 10; i += 1) {
      particles.push({
        x: player.x + random(-8, 8),
        y: player.y + random(-8, 8),
        vx: random(-18, 18),
        vy: random(-28, -8),
        life: random(0.45, 0.8),
        color: Math.random() > 0.35 ? "#e9dfcb" : "#d6a84b"
      });
    }
    updateInventoryUI();
  }

  function usePeaceDove() {
    if (state !== "playing" || doveInventory <= 0 || doveAttack) return;
    doveInventory -= 1;
    doveAttack = { elapsed: 0, duration: 2.2, cleared: false, x: player.x, y: player.y - 18, trail: [] };
    shell.dataset.doveAttack = "spiral";
    tone(392, 0.26, 0.035, "triangle");
    updateInventoryUI();
  }

  function clearVisibleHazards() {
    const visible = hazards.filter((hazard) => (
      hazard.x + hazard.w >= 0 && hazard.x <= W && hazard.y + hazard.h >= 0 && hazard.y <= H
    ));
    const visibleSet = new Set(visible);
    hazards = hazards.filter((hazard) => !visibleSet.has(hazard));
    visible.forEach((hazard) => {
      for (let i = 0; i < 5; i += 1) {
        particles.push({
          x: hazard.x + hazard.w / 2 + random(-5, 5),
          y: hazard.y + hazard.h / 2 + random(-4, 4),
          vx: random(-30, 30),
          vy: random(-34, -10),
          life: random(0.45, 0.85),
          color: Math.random() > 0.25 ? "#e9dfcb" : "#9a86ad"
        });
      }
    });
    peaceFlash = 0.32;
    shell.dataset.doveCleared = String(visible.length);
    tone(261.63, 0.55, 0.04, "sine");
    if (navigator.vibrate && visible.length) navigator.vibrate([25, 20, 25]);
  }

  function collision(a, b) {
    const inset = 3;
    return a.x - a.w / 2 + inset < b.x + b.w - inset &&
      a.x + a.w / 2 - inset > b.x + inset &&
      a.y - a.h / 2 + inset < b.y + b.h - inset &&
      a.y + a.h / 2 - inset > b.y + inset;
  }

  function loseBalloon() {
    if (player.invulnerable > 0) return;
    balloons -= 1;
    player.invulnerable = difficulty.invulnerability;
    tone(74, 0.38, 0.06, "sawtooth");
    if (navigator.vibrate) navigator.vibrate([45, 35, 70]);

    for (let i = 0; i < 12; i += 1) {
      particles.push({
        x: player.x + random(-12, 12),
        y: player.y - random(28, 45),
        vx: random(-22, 22),
        vy: random(-40, -10),
        life: random(0.45, 0.9),
        color: Math.random() > 0.25 ? "#a62b38" : "#e9dfcb"
      });
    }

    if (balloons <= 0) {
      state = "gameover";
      showStory({
        chapter: "A QUEDA",
        title: "SEM PROMESSAS",
        copy: `Bento alcançou ${Math.floor(altitude)} metros. Lá em cima, alguém anotou a tentativa.`,
        button: "TENTAR OUTRA VEZ"
      }, "restart");
    }
  }

  function finishStage() {
    const previousStage = stageIndex;
    stageIndex += 1;
    hazards = [];
    peaceDoves = [];
    doveAttack = null;
    updateInventoryUI();
    skyTransition = { from: previousStage, to: stageIndex, elapsed: 0, duration: 3.2 };
    if (stageIndex >= stages.length) {
      showStory(finaleStory, "show-finale");
    } else {
      showStory(stages[stageIndex], "start-stage");
    }
  }

  function update(dt) {
    stars.forEach((star) => {
      star.y += star.speed * dt * (1 + stageIndex * 0.14);
      star.phase += dt;
      if (star.y > H) {
        star.y = -2;
        star.x = Math.floor(random(2, W - 2));
      }
    });

    particles = particles.filter((particle) => {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += 45 * dt;
      particle.life -= dt;
      return particle.life > 0;
    });
    peaceFlash = Math.max(0, peaceFlash - dt);

    if (state === "story" && skyTransition) {
      skyTransition.elapsed = Math.min(skyTransition.duration, skyTransition.elapsed + dt);
      altitude += dt * 9;
    }

    if (state !== "playing") return;

    const direction = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    const ropeDirection = (keys.up ? 1 : 0) - (keys.down ? 1 : 0);
    player.x = clamp(player.x + direction * player.speed * dt, 10, W - 10);
    ropeLength = clamp(ropeLength + ropeDirection * 27 * dt, ROPE_MIN, ROPE_MAX);
    player.invulnerable = Math.max(0, player.invulnerable - dt);
    stageTime += dt;
    altitude += dt * (34 + stageIndex * 11);
    spawnTimer -= dt;
    doveSpawnTimer -= dt;

    if (doveSpawnTimer <= 0) {
      spawnPeaceDove();
      doveSpawnTimer = Infinity;
    }

    if (spawnTimer <= 0) {
      spawnHazard();
      const pressure = 1 - Math.min(0.32, stageTime / stages[stageIndex].duration * 0.22);
      spawnTimer = stages[stageIndex].spawn * difficulty.spawn * pressure * random(0.72, 1.15);
    }

    hazards.forEach((hazard) => {
      hazard.x += hazard.vx * dt;
      hazard.y += hazard.vy * dt;
      hazard.rotation += hazard.spin * dt;
      const balloonHit = getBalloonPositions().some((position) => collision({
        x: position.x,
        y: position.y,
        w: 8,
        h: 12
      }, hazard));
      if (collision(player, hazard) || balloonHit) {
        hazard.y = H + 50;
        loseBalloon();
      }
    });
    hazards = hazards.filter((hazard) => hazard.y < H + 35 && hazard.x > -55 && hazard.x < W + 55);

    peaceDoves.forEach((dove) => {
      dove.phase += dt * 2.7;
      dove.x += dove.vx * dt + Math.sin(dove.phase) * 5 * dt;
      dove.y += dove.vy * dt;
      const balloonPickup = getBalloonPositions().some((position) => collision({
        x: position.x,
        y: position.y,
        w: 10,
        h: 14
      }, dove));
      if (collision(player, dove) || balloonPickup) collectPeaceDove(dove);
    });
    peaceDoves = peaceDoves.filter((dove) => dove.y < H + 40 && dove.x > -45 && dove.x < W + 45);

    if (doveAttack) {
      doveAttack.elapsed += dt;
      const progress = Math.min(1, doveAttack.elapsed / doveAttack.duration);
      const angle = -Math.PI / 2 + progress * Math.PI * 5;
      const radius = progress * 76;
      doveAttack.x = clamp(mix(player.x, W / 2, progress) + Math.cos(angle) * radius, 18, W - 18);
      doveAttack.y = clamp(mix(player.y - 18, H / 2, progress) + Math.sin(angle) * radius * 0.68, 18, H - 18);
      doveAttack.trail.push({ x: doveAttack.x, y: doveAttack.y });
      if (doveAttack.trail.length > 24) doveAttack.trail.shift();
      if (!doveAttack.cleared && doveAttack.elapsed >= 0.9) {
        doveAttack.cleared = true;
        clearVisibleHazards();
      }
      if (progress >= 1) {
        doveAttack = null;
        shell.dataset.doveAttack = "idle";
        updateInventoryUI();
      }
    }

    if (stageTime >= stages[stageIndex].duration) finishStage();
  }

  function drawSky() {
    const colors = ["#17152b", "#1c1933", "#24203e", "#2d274a", "#352e53", "#40355f"];
    const transitionProgress = skyTransition
      ? Math.min(1, skyTransition.elapsed / skyTransition.duration)
      : 1;
    const easedProgress = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);
    const visualStage = skyTransition ? mix(skyTransition.from, skyTransition.to, easedProgress) : stageIndex;
    const fromColor = colors[Math.min(skyTransition?.from ?? stageIndex, colors.length - 1)];
    const toColor = colors[Math.min(skyTransition?.to ?? stageIndex, colors.length - 1)];
    const color = mixColor(fromColor, toColor, easedProgress);
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = "#08070d";
    for (let y = 0; y < H; y += 6) {
      const width = 4 + ((y * 7 + Math.floor(altitude / 9)) % 21);
      ctx.globalAlpha = 0.07 + ((y % 18) / 300);
      ctx.fillRect((y * 11 + Math.floor(altitude / 3)) % W, y, width, 1);
    }
    ctx.globalAlpha = 1;

    stars.forEach((star) => {
      const flicker = Math.sin(star.phase * 2.2) > 0.8;
      ctx.fillStyle = flicker ? "#d6a84b" : "#9a86ad";
      ctx.globalAlpha = 0.42 + visualStage * 0.08;
      ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, flicker ? star.size + 1 : star.size);
    });
    ctx.globalAlpha = 1;

    const cloudOffset = Math.floor(altitude * 0.17) % 72;
    ctx.fillStyle = "#5c4d70";
    ctx.globalAlpha = 0.25;
    for (let row = -1; row < 5; row += 1) {
      const y = row * 72 + cloudOffset;
      const x = ((row * 37 + visualStage * 11) % 90) - 20;
      ctx.fillRect(x, y, 48, 2);
      ctx.fillRect(x + 7, y - 2, 24, 2);
      ctx.fillRect(x + 63, y + 8, 29, 2);
    }
    ctx.globalAlpha = 1;
  }

  function getBalloonPositions() {
    return BALLOON_FORMATION.slice(0, balloons).map((offset) => ({
      x: player.x + offset.x,
      y: player.y - ropeLength + offset.y
    }));
  }

  function drawBalloons() {
    getBalloonPositions().forEach((position) => {
      ctx.strokeStyle = "#8f755e";
      ctx.globalAlpha = 0.72;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.floor(player.x), player.y + 4);
      ctx.lineTo(Math.floor(position.x), Math.floor(position.y + 6));
      ctx.stroke();
      ctx.globalAlpha = 1;
      drawSprite("balloon", position.x - 4.5, position.y - 7, 9, 14);
    });
  }

  function drawPlayer() {
    const blink = player.invulnerable > 0 && Math.floor(player.invulnerable * 12) % 2 === 0;
    drawBalloons();
    drawSprite("priest", player.x - 6, player.y - 10, 12, 21, false, blink ? 0.25 : 1);
  }

  function drawHazards() {
    hazards.forEach((hazard) => {
      ctx.save();
      ctx.translate(Math.floor(hazard.x + hazard.w / 2), Math.floor(hazard.y + hazard.h / 2));
      ctx.rotate(hazard.rotation);
      drawSprite(hazard.type, -hazard.w / 2, -hazard.h / 2, hazard.w, hazard.h, hazard.flip);
      ctx.restore();
    });
  }

  function drawPeaceDoves() {
    peaceDoves.forEach((dove) => {
      const bob = Math.sin(dove.phase * 2) * 1.5;
      drawDove(ctx, dove.x, dove.y + bob, dove.w, dove.h, dove.flip);
    });
  }

  function drawDoveAttack() {
    if (!doveAttack) return;
    const angle = doveAttack.elapsed * 9;
    const fade = doveAttack.elapsed > 1.8 ? Math.max(0, (2.2 - doveAttack.elapsed) / 0.4) : 1;
    doveAttack.trail.forEach((point, index) => {
      ctx.globalAlpha = (index / doveAttack.trail.length) * 0.42 * fade;
      ctx.fillStyle = index % 3 === 0 ? "#d6a84b" : "#e9dfcb";
      ctx.fillRect(Math.floor(point.x), Math.floor(point.y), index % 4 === 0 ? 2 : 1, 1);
    });
    ctx.globalAlpha = 1;
    drawDove(ctx, doveAttack.x - 20, doveAttack.y - 20, 40, 40, Math.cos(angle) < 0, angle * 0.08, fade);
  }

  function drawParticles() {
    particles.forEach((particle) => {
      ctx.globalAlpha = Math.max(0, particle.life);
      ctx.fillStyle = particle.color;
      ctx.fillRect(Math.floor(particle.x), Math.floor(particle.y), 2, 2);
    });
    ctx.globalAlpha = 1;
  }

  function drawPeaceFlash() {
    if (peaceFlash <= 0) return;
    ctx.globalAlpha = peaceFlash * 1.7;
    ctx.fillStyle = "#e9dfcb";
    ctx.fillRect(0, 0, W, H);
    ctx.globalAlpha = 1;
  }

  function drawHud() {
    ctx.fillStyle = "rgba(8,7,13,0.66)";
    ctx.fillRect(4, 4, 76, 13);
    ctx.fillStyle = "#e9dfcb";
    ctx.font = "6px monospace";
    ctx.textBaseline = "top";
    ctx.fillText(stages[Math.min(stageIndex, stages.length - 1)].name, 7, 7);

    for (let i = 0; i < MAX_BALLOONS; i += 1) {
      if (i < balloons) {
        drawSprite("balloon", 5 + i * 7, 18, 6, 9);
      } else {
        ctx.fillStyle = "#3c2a35";
        ctx.fillRect(6 + i * 7, 20, 4, 5);
      }
    }
    ctx.fillStyle = "#e9dfcb";
    ctx.textAlign = "right";
    ctx.fillText(`${Math.floor(altitude)}m`, W - 7, 7);
    ctx.fillStyle = difficulty.id === "hell" ? "#a62b38" : "#9a86ad";
    ctx.fillText(difficulty.label, W - 7, 15);
    ctx.textAlign = "left";
  }

  function drawLucifer(x, y, width, height) {
    if (!luciferSprite.complete || luciferSprite.naturalWidth === 0) return;
    ctx.drawImage(luciferSprite, Math.floor(x), Math.floor(y), Math.floor(width), Math.floor(height));
  }

  function drawFinale() {
    ctx.fillStyle = "#08070d";
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 34; i += 1) {
      ctx.fillStyle = i % 5 === 0 ? "#d6a84b" : "#5c4d70";
      ctx.fillRect((i * 47) % W, (i * 31) % 168, 1, 1);
    }

    drawSprite("cloud", 16, 105, 128, 34, false, 0.7);
    drawSprite("gate", 45, 42, 70, 62);
    if (difficulty.id === "hell") {
      drawLucifer(48, 1, 64, 68);
    } else {
      drawSprite("god", 69, 15, 22, 33);
    }

    const lost = MAX_BALLOONS - balloons;
    for (let i = 0; i < lost; i += 1) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      drawSprite("ghost", 39 + col * 23, 151 + row * 27, 14, 23, false, 0.46 + i * 0.04);
    }
    drawSprite("priest", 73, 218, 14, 24);

    ctx.textAlign = "center";
    ctx.fillStyle = "#d6a84b";
    ctx.font = "7px monospace";
    ctx.fillText(difficulty.id === "hell" ? "A PORTA ABRIA PARA BAIXO" : "PORTÃO 7", W / 2, 112);
    ctx.fillStyle = "#e9dfcb";
    ctx.font = "6px monospace";
    ctx.fillText(
      difficulty.id === "hell"
        ? "NÃO ERA DEUS"
        : (lost ? "VOCÊ JÁ ESTAVA NA FILA" : "A FILA ESPERAVA MESMO ASSIM"),
      W / 2,
      255
    );
    ctx.fillStyle = "#9a86ad";
    ctx.fillText("TOQUE PARA RECOMEÇAR", W / 2, 266);
    ctx.textAlign = "left";
  }

  function render() {
    drawSky();
    if (state === "finale") {
      drawFinale();
      return;
    }
    drawHazards();
    drawPeaceDoves();
    drawDoveAttack();
    drawPlayer();
    drawParticles();
    drawPeaceFlash();
    if (state === "playing" || state === "paused" || state === "story") drawHud();
    if (doveInventory > 0) updateInventoryUI();

    if (state === "paused") {
      ctx.fillStyle = "rgba(8,7,13,0.76)";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "#e9dfcb";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText("SUSPENSO", W / 2, H / 2 - 5);
      ctx.font = "6px monospace";
      ctx.fillStyle = "#9a86ad";
      ctx.fillText("TOQUE EM Ⅱ", W / 2, H / 2 + 10);
      ctx.textAlign = "left";
    }
  }

  function frame(now) {
    const dt = Math.min(0.033, (now - lastTime) / 1000);
    lastTime = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  function setControl(control, active) {
    keys[control] = active;
  }

  function updateTouchDirection(clientX, clientY) {
    touch.currentX = clientX;
    touch.currentY = clientY;
    const deltaX = clamp(clientX - touch.originX, -34, 34);
    const deltaY = clamp(clientY - touch.originY, -34, 34);
    const deadzone = 6;
    setControl("left", deltaX < -deadzone);
    setControl("right", deltaX > deadzone);
    setControl("up", deltaY < -deadzone);
    setControl("down", deltaY > deadzone);
    touchStick.style.setProperty("--stick-x", `${deltaX * 0.52}px`);
    touchStick.style.setProperty("--stick-y", `${deltaY * 0.52}px`);
  }

  function releaseTouch() {
    touch.active = false;
    touch.pointerId = null;
    setControl("left", false);
    setControl("right", false);
    setControl("up", false);
    setControl("down", false);
    touchStick.classList.remove("is-visible");
    touchStick.style.setProperty("--stick-x", "0px");
    touchStick.style.setProperty("--stick-y", "0px");
  }

  shell.addEventListener("pointerdown", (event) => {
    if (state !== "playing" || event.target.closest("button")) return;
    event.preventDefault();
    touch.active = true;
    touch.pointerId = event.pointerId;
    touch.originX = event.clientX;
    touch.originY = event.clientY;
    startMusic();
    const bounds = shell.getBoundingClientRect();
    touchStick.style.left = `${event.clientX - bounds.left}px`;
    touchStick.style.top = `${event.clientY - bounds.top}px`;
    touchStick.classList.add("is-visible");
    try {
      shell.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic browser tests do not own an active OS pointer.
    }
  });

  shell.addEventListener("pointermove", (event) => {
    if (!touch.active || event.pointerId !== touch.pointerId) return;
    event.preventDefault();
    updateTouchDirection(event.clientX, event.clientY);
  });

  ["pointerup", "pointercancel", "lostpointercapture"].forEach((eventName) => {
    shell.addEventListener(eventName, (event) => {
      if (touch.active && (event.pointerId === touch.pointerId || eventName === "lostpointercapture")) releaseTouch();
    });
  });

  window.addEventListener("keydown", (event) => {
    if (["ArrowLeft", "a", "A"].includes(event.key)) keys.left = true;
    if (["ArrowRight", "d", "D"].includes(event.key)) keys.right = true;
    if (["ArrowUp", "w", "W"].includes(event.key)) keys.up = true;
    if (["ArrowDown", "s", "S"].includes(event.key)) keys.down = true;
    if ([" ", "Enter"].includes(event.key) && overlay.classList.contains("is-visible")) continueButton.click();
    if (["p", "P", "Escape"].includes(event.key)) pauseButton.click();
  });

  window.addEventListener("keyup", (event) => {
    if (["ArrowLeft", "a", "A"].includes(event.key)) keys.left = false;
    if (["ArrowRight", "d", "D"].includes(event.key)) keys.right = false;
    if (["ArrowUp", "w", "W"].includes(event.key)) keys.up = false;
    if (["ArrowDown", "s", "S"].includes(event.key)) keys.down = false;
  });

  continueButton.addEventListener("click", () => {
    tone(220, 0.08, 0.025);
    advanceStory();
  });

  difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setDifficulty(button.dataset.difficulty);
      tone(button.dataset.difficulty === "hell" ? 73.42 : 196, 0.08, 0.025, "square");
    });
  });

  monochromeButton.addEventListener("click", () => {
    const enabled = !shell.classList.contains("is-monochrome");
    shell.classList.toggle("is-monochrome", enabled);
    monochromeButton.setAttribute("aria-pressed", String(enabled));
    monochromeButton.setAttribute("aria-label", enabled ? "P&B — desativar modo preto e branco" : "P&B — ativar modo preto e branco");
    window.localStorage.setItem("sete-baloes-monochrome", enabled ? "1" : "0");
  });

  doveInventoryButton.addEventListener("click", (event) => {
    event.stopPropagation();
    usePeaceDove();
  });

  pauseButton.addEventListener("click", () => {
    if (state === "playing") {
      state = "paused";
      soundtrack.pause();
      pauseButton.textContent = "▶";
      pauseButton.setAttribute("aria-label", "Continuar jogo");
    } else if (state === "paused") {
      state = "playing";
      startMusic();
      shell.classList.add("is-playing");
      pauseButton.textContent = "Ⅱ";
      pauseButton.setAttribute("aria-label", "Pausar jogo");
      lastTime = performance.now();
    }
  });

  canvas.addEventListener("pointerdown", () => {
    if (state === "finale") {
      resetRun();
      showStory({
        chapter: "UM JOGO DE ASCENSÃO",
        title: "SETE BALÕES",
        copy: "Padre Bento amarrou sete promessas ao corpo. Nenhuma delas sabia o caminho.",
        button: "SUBIR"
      }, "start-stage");
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state === "playing") pauseButton.click();
  });

  initStars();
  const urlParams = new URLSearchParams(window.location.search);
  const difficultyParam = urlParams.get("difficulty");
  if (difficultyParam && difficulties[difficultyParam]) setDifficulty(difficultyParam);
  if (window.localStorage.getItem("sete-baloes-monochrome") === "1") {
    shell.classList.add("is-monochrome");
    monochromeButton.setAttribute("aria-pressed", "true");
    monochromeButton.setAttribute("aria-label", "P&B — desativar modo preto e branco");
  }
  const stageParam = urlParams.get("stage");
  const doveParam = urlParams.get("dove");
  const inventoryParam = Number(urlParams.get("inventory"));
  const transitionParam = urlParams.get("transition");
  const previewStage = stageParam === null ? Number.NaN : Number(stageParam);
  const previewTransition = transitionParam === null ? Number.NaN : Number(transitionParam);
  if (Number.isInteger(previewTransition) && previewTransition > 0 && previewTransition < stages.length) {
    stageIndex = previewTransition;
    skyTransition = { from: stageIndex - 1, to: stageIndex, elapsed: 0, duration: 3.2 };
    showStory(stages[stageIndex], "start-stage");
  } else if (Number.isInteger(previewStage) && previewStage >= 0 && previewStage < stages.length) {
    stageIndex = previewStage;
    stageTime = 0;
    spawnTimer = 0.2;
    state = "playing";
    player.invulnerable = 1;
    overlay.classList.remove("is-visible");
    shell.classList.add("is-playing");
  } else if (window.location.hash === "#finale") {
    balloons = 3;
    state = "finale";
    overlay.classList.remove("is-visible");
    shell.classList.remove("is-playing");
  }
  if (Number.isInteger(inventoryParam) && inventoryParam > 0) {
    doveInventory = clamp(inventoryParam, 1, 9);
    updateInventoryUI();
  }
  if (doveParam === "1" && stageIndex < 2 && state === "playing") doveSpawnTimer = 0.15;
  requestAnimationFrame(frame);
})();
