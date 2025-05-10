let font;
// left and right hit areas
let leftBox, rightBox;
// hold activv notes on screen
let notes = [];
// game over buttons
let gameOver = false;
let restartButton = false;
// timing for notes
let lastSpawnLeft = 0;
let nextSpawnLeft = 1000;
let lastSpawnRight = 0;
let nextSpawnRight = 1000;
// player and boss hp
let bossHP = 200;
let playerHP = 100;
let gameStarted = false;
// press g and h to start game check
let gPressed = false;
let hPressed = false;
// text pulse
let startPulse = 0;
// daft punkkkk
let song;
// times of beats for note spawning
let beatTimes = [];
// song bpm
let bpm = 123.482;
// calculated seconds between beats
let beatInterval = 0.4859634374168137;
//pause buton
let paused = false;
let startTime = 0;
// color palette for notes and boxes
let colorPalette = [
  [0, 255, 255],
  [255, 0, 255],
  [255, 255, 0]
];
let paletteIndex = 0;
let yOffset = -50

//song  note pattern mappig
let notePattern = [
  '', 'br', '', 'br', '', 'bl', '', 'bl',
  '', 'r', '', 'r', '', 'l', 'l', 'l',

  '', 'br', '', 'bl', '', 'br', '', 'bl',
  'r', 'r', 'l', 'l', 'r', 'r', 'l', 'l',

  '', '', '', ['l', 'r'], '', '', '', ['bl', 'br'],
  '', '', '', ['l', 'br'], '', 'l', 'br', ['r', 'bl'],

  'l', 'r', 'l', 'r', 'bl', 'br', 'bl', 'br',
  'l', 'br', 'bl', 'r', 'l', 'br', 'bl', ['l', 'r'],

  'r', 'l', ['l', 'bl'], 'br', 'l', 'r', ['l', 'br'], 'bl',
  'r', ['l', 'br'], 'l', ['r', 'bl'], 'r', ['l', 'br'], ['r', 'bl'], ['l', 'r', 'bl', 'br'],

  'r', ['l', 'br'], 'l', ['r', 'bl'], ['l', 'bl'], 'bl', 'l', ['l', 'r'],
  'l', ['r', 'bl'], 'r', ['l', 'br'], ['r', 'br'], 'br', 'r', ['r', 'l'],

  ['l', 'bl'], ['r', 'bl'], 'r', ['l', 'bl'], ['r', 'br'], 'bl', ['r', 'br'], ['r', 'bl'],
  'br', ['r', 'bl'], 'r', ['l', 'bl'], ['l', 'br'], 'l', ['bl', 'br'], ['l', 'r', 'bl', 'br'],

  ['l', 'bl'], ['r', 'bl'], ['l', 'bl'], ['r', 'bl'], 'bl', ['l', 'br'], ['r', 'br'], ['l', 'br'],
  ['l', 'bl', 'r'], 'br', ['r', 'br', 'bl'], ['l', 'bl'], 'r', ['l', 'bl'], ['l', 'br', 'bl', 'r'], ['l', 'br', 'bl', 'r']
];

// load music and font before game start
function preload() {
  song = loadSound("data/HarderBetter.mp3");
  font = loadFont("data/font0.otf");
}

// background cavbas and font setup
function setup() {
  createCanvas(windowWidth, windowHeight);
  rectMode(CENTER);
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(255);
  textFont(font);
  // left and right boxes
  leftBox = { x: width / 2 - 75, y: height * 0.75 + yOffset, size: 80 };
  rightBox = { x: width / 2 + 75, y: height * 0.75 + yOffset, size: 80 };
  //note spawning based off beat interval
  for (let t = beatInterval * 8; t < 60 + beatInterval * 12; t += beatInterval) {
    beatTimes.push(t);
  }
}

// main draw func
function draw() {
  background(0);
  // notes have colors from the palette
  let cp = colorPalette[paletteIndex];
  fill(cp[0] * 0.6, cp[1] * 0.6, cp[2] * 0.6);
  stroke(cp[0] * 0.85, cp[1] * 0.85, cp[2] * 0.85);
  strokeWeight(8);
  rect(leftBox.x, leftBox.y, 60, 60, 12);
  rect(rightBox.x, rightBox.y, 60, 60, 12);
  fill(cp[0] * 0.7, cp[1] * 0.7, cp[2] * 0.7);
  noStroke();
  rect(leftBox.x, leftBox.y, 40, 40, 10);
  rect(rightBox.x, rightBox.y, 40, 40, 10);
  // label G and H on corresponding bxo
  fill(0);
  noStroke();
  text("G", leftBox.x - 7, leftBox.y);
  text("H", rightBox.x - 6, rightBox.y);
  //starting instruction text
  if (!gameStarted) {
    startPulse += 0.05;
    let pulseSize = 25 + sin(startPulse) * 3;
    fill(180, 100, 255);
    textSize(pulseSize);
    textAlign(CENTER, CENTER);
    text("Press G and H together to start!", width / 2, leftBox.y + 90);
  }
  noFill();
  stroke(255);
  //update and spawn notes
  if (!paused && gameStarted) {
    let speed = 4;
    let pixelsPerSecond = 60 * speed;
    let distance = (height + 40 + yOffset) - leftBox.y;
    let travelTime = distance / pixelsPerSecond;

    if (song.isPlaying()) {
      while (beatTimes.length > 0 && song.currentTime() >= beatTimes[0] - travelTime - 0.15) {
        let currentIndex = 128 - beatTimes.length;
        let patternEntry = notePattern[currentIndex % notePattern.length];
        if (Array.isArray(patternEntry)) {
          for (let dir of patternEntry) {
            if (dir) spawnTimedNote(dir);
          }
        } else if (patternEntry) {
          spawnTimedNote(patternEntry);
        }
        beatTimes.shift();
      }
    }
    //move notes and speed
    for (let i = notes.length - 1; i >= 0; i--) {
      let n = notes[i];
      n.x += n.dx;
      n.y += n.dy;
    }
    //check for missed notes
    if (millis() - startTime > 1000) {
      missedNotes();
    }
  }
  // fade notes
  for (let i = notes.length - 1; i >= 0; i--) {
    let n = notes[i];
    if (n.fading) {
      if (n.hit) {
        fill(255, 255, 255, n.fadeAlpha);
      } else {
        fill(255, 76, 76, n.fadeAlpha);
      }
      n.fadeAlpha -= 25;
      if (n.fadeAlpha <= 0) {
        notes.splice(i, 1);
        continue;
      }
      noStroke();
      rect(n.x, n.y, n.size, n.size, 10);
    } else {
      n.alpha = min(n.alpha + 15, 255);
      fill(...colorPalette[paletteIndex], n.alpha);
      stroke(50);
      strokeWeight(2);
      rect(n.x, n.y, n.size, n.size, 10);
    }
  }

  //hea;th bars
  drawHealthBar(width / 2, height * 0.68 + yOffset, playerHP, 100, "You", color(0, 255, 0));
  drawHealthBar(width / 2, height * 0.62 + yOffset, bossHP, 200, "Boss", color(255, 0, 0));

  // player dies = game ends
  if (playerHP === 0 && !gameOver) {
    gameOver = true;
    noLoop();
    restartButton = true;
    if (song.isPlaying()) song.stop();
  }
  //game over screen
  if (gameOver) {
    textAlign(CENTER, CENTER);
    textSize(72);
    noStroke();
    fill(0);
    text("GAME OVER", width / 2, height / 2 - 80 + yOffset);
    fill(255, 0, 0);
    text("GAME OVER", width / 2, height / 2 - 80 + yOffset);

    startPulse += 0.05;
    let pulseSize = 22 + sin(startPulse) * 3;
    fill(180);
    textSize(pulseSize);
    text("PLAY AGAIN?", width / 2, height / 2 + yOffset);
  }
  // pause screen
  if (paused) {
    fill(0, 170);
    noStroke();
    rect(width / 2, height / 2, width, height);
    fill(255);
    let barWidth = 40;
    let barHeight = 120;
    let x = width / 2 - barWidth * 1.2 + 13;
    let y = height / 2 + yOffset - barHeight / 2 + 50;
    rect(x, y, barWidth, barHeight);
    rect(x + barWidth * 1.6, y, barWidth, barHeight);
  }
}

function mousePressed() {
  //restart button fuctionalty
  if (restartButton) {
    let x = width / 2;
    let y = height / 2 + 60;
    if (mouseX > x - 60 && mouseX < x + 60 && mouseY > y - 20 && mouseY < y + 20) {
      restartGame();
    }
  }
}

function spawnLeftNote() {
  //notes for left side
  let direction = random(["bottom", "left"]);
  if (direction === "bottom") {
    notes.push({ x: leftBox.x, y: height + 40 + yOffset, dx: 0, dy: -4, type: 'tap' });
  } else {
    notes.push({ x: -40, y: leftBox.y, dx: 4, dy: 0, type: 'tap' });
  }
}

function spawnRightNote() {
  //right side notes
  let direction = random(["bottom", "right"]);
  if (direction === "bottom") {
    notes.push({ x: rightBox.x, y: height + 40 + yOffset, dx: 0, dy: -4, type: 'tap' });
  } else {
    notes.push({ x: width + 40, y: rightBox.y, dx: -4, dy: 0, type: 'tap' });
  }
}

function keyPressed() {
  // start and hit note and pause keys
  if (key === ' ') {
    if (gameOver || song.currentTime() >= song.duration()) {
      return;
    }
    paused = !paused;
    if (paused && song.isPlaying()) {
      song.pause();
    } else if (!paused && !song.isPlaying()) {
      song.play();
    }
    return;
  }
  let k = key.toUpperCase();

  //start game with g and h together
  if (!gameStarted) {
    if (k === 'G') gPressed = true;
    if (k === 'H') hPressed = true;
    if (gPressed && hPressed) {
      gameStarted = true;
      startTime = millis();
      if (!song.isPlaying()) {
        song.play();
      }
    }
    return;
  }

  // g key notes
  if (k === 'G') {
    let hits = removeAllOverlappingNotes(leftBox);
    if (hits > 0) {
      paletteIndex = (paletteIndex + 1) % colorPalette.length;
      bossHP = max(0, bossHP - 1.5 * hits);
    } else {
      playerHP = max(0, playerHP - 5);
    }
    return;
  }

  // h key notes
  if (k === 'H') {
    let hits = removeAllOverlappingNotes(rightBox);
    if (hits > 0) {
      paletteIndex = (paletteIndex + 1) % colorPalette.length;
      bossHP = max(0, bossHP - 1.5 * hits);
    } else {
      playerHP = max(0, playerHP - 5);
    }
    return;
  }
}

//remove note when hit
function removeOverlappingNote(box) {
  for (let i = notes.length - 1; i >= 0; i--) {
    let n = notes[i];
    let half = 20;
    let insideX = abs(n.x - box.x) < box.size/2 + half;
    let insideY = abs(n.y - box.y) < box.size/2 + half;
    if (insideX && insideY && !n.fading) {
      n.fading = true;
      n.fadeAlpha = 255;
      n.hit = true;
      return true;
    }
  }
  return false;
}

//remove all notes when hit (fix for not being able to hit 2 at once)
function removeAllOverlappingNotes(box) {
  let hits = 0;
  for (let i = notes.length - 1; i >= 0; i--) {
    let n = notes[i];
    let half = 20;
    let insideX = abs(n.x - box.x) < box.size / 2 + half;
    let insideY = abs(n.y - box.y) < box.size / 2 + half;
    if (insideX && insideY && !n.fading) {
      n.fading = true;
      n.fadeAlpha = 255;
      n.hit = true;
      hits++;
    }
  }
  return hits;
}

//health bar 
function drawHealthBar(x, y, hp, maxHP, label, col) {
  noFill();
  stroke(100);
  strokeWeight(2);
  rect(x, y, 200, 20, 5);

  let barWidth = (hp / maxHP) * 200;
  fill(col);
  noStroke();
  rect(x - 100 + barWidth / 2, y, barWidth, 20, 5);

  fill(255);
  textSize(16);
  textAlign(RIGHT, CENTER);
  text(label, x - 110, y);

  textAlign(LEFT, CENTER);
  text(hp + "/" + maxHP, x + 110, y);
}

//check missed note
function missedNotes() {
  for (let i = notes.length - 1; i >= 0; i--) {
    let n = notes[i];
    if (n.fading) continue;

    let half = 20;
    let missed = false;

    if (n.dy < 0) {
      if (n.target === 'left' && n.y < leftBox.y - half) missed = true;
      if (n.target === 'right' && n.y < rightBox.y - half) missed = true;
    } else if (n.dx > 0 && n.target === 'left') {
      if (n.x > leftBox.x + half) missed = true;
    } else if (n.dx < 0 && n.target === 'right') {
      if (n.x < rightBox.x - half) missed = true;
    }
    // missed note turn red and fade
    if (missed) {
      n.fading = true;
      n.fadeAlpha = 255;
      n.hit = false;
      playerHP = max(0, playerHP - 5);
    }
  }
}

//fully restart game
function restartGame() {
  playerHP = 100;
  bossHP = 200;
  notes = [];
  gameOver = false;
  restartButton = false;
  startTime = millis();
  loop();
  if (song.isPlaying()) {
    song.stop();
  }
  song.play();
}

//spawn note func
function spawnTimedNote(direction) {
  let speed = 4;
  let verticalDistance = (height + 40 + yOffset) - leftBox.y;
  let horizontalDistance = verticalDistance;
//random notes command (ended up not really using)
  if (!direction) {
    direction = random(['bl', 'br', 'l', 'r']);
  }
  let x, y, dx, dy;
// note direction differences
  if (direction === 'bl') {
    x = leftBox.x;
    y = height + 40 + yOffset;
    dx = 0;
    dy = -speed;
  } else if (direction === 'br') {
    x = rightBox.x;
    y = height + 40 + yOffset;
    dx = 0;
    dy = -speed;
  } else if (direction === 'l') {
    x = leftBox.x - horizontalDistance;
    y = leftBox.y;
    dx = speed;
    dy = 0;
  } else if (direction === 'r') {
    x = rightBox.x + horizontalDistance;
    y = rightBox.y;
    dx = -speed;
    dy = 0;
  }
// one type of note (tried making hold note but was unable to)
  notes.push({
    x: x,
    y: y,
    dx: dx,
    dy: dy,
    type: 'tap',
    target: (direction === 'bl' || direction === 'l') ? 'left' : 'right',
    alpha: 0,
    size: 40
  });
}