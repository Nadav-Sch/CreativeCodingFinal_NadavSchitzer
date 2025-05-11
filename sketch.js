// Nadav Schitzer
// Creative Coding Final, Spring 2025
// Very proud of this one it took me so so long but it was very fun
// Thank You Lady K!!!


let font;
let impyman, impyflinch, impsmack;
let evilimpy;
let impdefeat;
let lastDamageTime = 0;
let lastHitKey = '';
let bossFlinchTimer = 0;
let BOSS_FLINCH_DURATION = 300;
let showWinScreen = false;
let winStartTime = 0;
// left and right hit areas
let leftBox, rightBox;
// hold activv notes on screen
let notes = [];
// game over buttons
let gameOver = false;
let restartButton = false;
// player and boss hp
let bossHP = 170;
let playerHP = 10;
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
  impyman = loadImage("data/impyman.png");
  impyflinch = loadImage("data/impyflinch.png");
  evilimpy = loadImage("data/evilimpy.png");
  impdefeat = loadImage("data/impdefeat.png");
  impsmack = loadImage("data/impsmack.png");
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
  initialBeatCount = beatTimes.length;
}

// main draw func
function draw() {
  background(0);
  // showWinScreen = true;
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
  // label G and H on corresponding box
  push();
  textAlign(CENTER, CENTER);
  textSize(24);
  fill(0);
  noStroke();
  text("G", leftBox.x, leftBox.y);
  text("H", rightBox.x, rightBox.y);
  pop();
  // instruction text
  if (!gameStarted && !showWinScreen) {
    startPulse += 0.05;
    let pulseSize = 25 + sin(startPulse) * 3;
    fill(180, 100, 255);
    textSize(pulseSize);
    textAlign(CENTER, CENTER);
    text("Press G and H together to start!", width / 2, leftBox.y + 90);
  }
  noFill();
  stroke(255);
  // update and spawn ntoes
  if (!paused && gameStarted && !gameOver && !showWinScreen) {
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
  // fade notes on hit
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

  //boss flinch animation when hit
  let flinchActive = millis() - bossFlinchTimer < BOSS_FLINCH_DURATION;
  let bossImg;
  if (flinchActive) {
    if (lastHitKey === 'H') {
      bossImg = impsmack;
    } else {
      bossImg = impyflinch;
    }
  } else if (millis() - lastDamageTime < BOSS_FLINCH_DURATION) {
    bossImg = evilimpy;
  } else if (showWinScreen) {
    bossImg = impdefeat;
  } else {
    bossImg = impyman;
  }
  let floatOffset = sin(millis() / 1000) * 5;
  //boss images
  push();
  imageMode(CENTER);
  translate(width / 2, height * 0.3 + yOffset + floatOffset);
  image(bossImg, 0, 0, bossImg.width / 4, bossImg.height / 4);
  pop();

  //hea;th bars
  drawHealthBar(width / 2, height * 0.68 + yOffset, playerHP, 10, "You", color(0, 255, 0));
  drawHealthBar(width / 2, height * 0.62 + yOffset, bossHP, 170, "Boss", color(255, 0, 0));

  //player dies = game ends
  if (playerHP === 0 && !gameOver) {
    gameOver = true;
    noLoop();
    restartButton = true;
    if (song.isPlaying()) song.stop();
  }
  //boss dies after final note is hit
  if (beatTimes.length === 0 && !notes.some(n => !n.fading) && !gameOver && !showWinScreen) {
    showWinScreen = true;
    winStartTime = millis() - 2000;
  }
  //game over screen
  if (gameOver) {
    fill(0);
    noStroke();
    rect(width/2, height/2, width, height);

    imageMode(CENTER);
    image(evilimpy, width/2, height * 0.25 + yOffset + 80, evilimpy.width/3, evilimpy.height/3);

    push();
      textAlign(CENTER, CENTER);
      textSize(72);
      noStroke();
      fill(255,0,0);
      text("GAME OVER", width/2, height/2 + 100 + yOffset);
    pop();

    push();
      startPulse += 0.05;
      let pulseSizeGO = 24 + sin(startPulse) * 3;
      rectMode(CENTER);
      fill(255);
      rect(width/2, height/2 + 200 + yOffset, 160, 50, 10);
      fill(0);
      textAlign(CENTER, CENTER);
      textSize(pulseSizeGO);
      text("Retry?", width/2, height/2 + 200 + yOffset);
    pop();

    restartButton = {
      x: width/2 - 80,
      y: height/2 + 180 + yOffset - 25,
      w: 160,
      h: 50
    };
  }

  //you win screen
  if (showWinScreen) {
    fill(0);
    noStroke();
    rect(width/2, height/2, width, height);
    imageMode(CENTER);
    image(impdefeat, width/2, height * 0.25 + yOffset + 80, impdefeat.width/2.5, impdefeat.height/2.5);

    push();
      textAlign(CENTER, CENTER);
      let fade = map(millis() - winStartTime, 0, 4000, 0, 255, true);
      textSize(72);
      fill(0,255,0,fade);
      text("YOU WIN!", width/2, height/2 + 100 + yOffset);
    pop();

    push();
      startPulse += 0.05;
      let pulseSizeW = 24 + sin(startPulse) * 3;
      rectMode(CENTER);
      fill(255, fade);
      rect(width/2, height/2 + 200 + yOffset, 160, 50, 10);
      fill(0, fade);
      textAlign(CENTER, CENTER);
      textSize(pulseSizeW);
      text("Again?", width/2, height/2 + 200 + yOffset);
    pop();

    restartButton = {
      x: width/2 - 80,
      y: height/2 + 200 + yOffset - 25,
      w: 160,
      h: 50
    };
  }

  //pause screen
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
    //restart button on pause screen
    push();
    textAlign(CENTER, CENTER);
    textSize(24);
    fill(62, 218, 121);
    rect(width/2, height/2 + 120 + yOffset, 160, 40, 8);
    fill(0);
    text("Restart?", width/2, height/2 + 120 + yOffset);
    pop();
    restartButton = {
      x: width/2 - 80,
      y: height/2 + 120 + yOffset - 20,
      w: 160,
      h: 40
    };
  }
}

function mousePressed() {
//restart button functionaiyty
  if (restartButton
      && mouseX > restartButton.x
      && mouseX < restartButton.x + restartButton.w
      && mouseY > restartButton.y
      && mouseY < restartButton.y + restartButton.h) {
    restartGame();
    return;
  }
}

function keyPressed() {
  //start and hit note and pause keys
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

  //g key notes
  if (k === 'G') {
    lastHitKey = 'G';
    let hits = removeAllOverlappingNotes(leftBox);
    if (hits > 0) {
      bossFlinchTimer = millis();
      paletteIndex = (paletteIndex + 1) % colorPalette.length;
      //boss dies when there are 2 or fewer beats left
      let damage = (beatTimes.length <= 2) ? 10 * hits : hits;
      if (beatTimes.length <= 2) {
      bossHP = max(0, bossHP - damage);
      } else {
        bossHP = max(1, bossHP - damage);
      }

      
    } else {
      playerHP = max(0, playerHP - 1);
      lastDamageTime = millis();
    }
    return;
  }

  //h key notes
  if (k === 'H') {
    lastHitKey = 'H';
    let hits = removeAllOverlappingNotes(rightBox);
    if (hits > 0) {
      bossFlinchTimer = millis();
      paletteIndex = (paletteIndex + 1) % colorPalette.length;

      let damage = (beatTimes.length <= 2) ? 10 * hits : hits;
      if (beatTimes.length <= 2) {
      bossHP = max(0, bossHP - damage);
      } else {
      bossHP = max(1, bossHP - damage);
      }

    } else {
      playerHP = max(0, playerHP - 1);
      lastDamageTime = millis();
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
  let barLength = 200;
  rect(x, y, barLength, 20, 5);

  let barWidth = constrain((hp / maxHP) * barLength, 0, barLength);
  fill(col);
  noStroke();
  rect(x - barLength / 2 + barWidth / 2, y, barWidth, 20, 5);

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
      playerHP = max(0, playerHP - 1);
      lastDamageTime = millis();
    }
  }
}

// restart game completely
function restartGame() {
  window.location.reload();
}

// shared logic to reset game state without starting music
function resetGameState() {
  // stop music
  if (song.isPlaying()) song.stop();
  // rebuild beat times
  beatTimes = [];
  for (let t = beatInterval * 8; t < 60 + beatInterval * 12; t += beatInterval) {
    beatTimes.push(t);
  }
  // reset note data and timers
  notes = [];
  // reset pulse
  startPulse = 0;
  paused = false;
  showWinScreen = false;
  gameOver = false;
  restartButton = false;
  gameStarted = false;
  gPressed = false;
  hPressed = false;
  // reset health and timer
  playerHP = 10;
  bossHP = 170;
}

//spawn note func
function spawnTimedNote(direction) {
  let speed = 4;
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
    x = leftBox.x - ((height + 40 + yOffset) - leftBox.y);
    y = leftBox.y;
    dx = speed;
    dy = 0;
  } else if (direction === 'r') {
    x = rightBox.x + ((height + 40 + yOffset) - rightBox.y);
    y = rightBox.y;
    dx = -speed;
    dy = 0;
  }
// one type of note (2nd type was scrapped)
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