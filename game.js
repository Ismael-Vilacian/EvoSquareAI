const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gravity = 0.6;
let jumpForce = -20;
let obstacleSpeed = 5;
let obstacleFrequency = 75;
let obstacles = [];
let frame = 0;
let generation = 0;
let bestScore = 0;
let populationSize = 50;
let squares = [];
let maxJumpHeight = 90;
let verticalSpeed = 0.3;
let shownSquare = null;
let bestOfLastGen = null;

class Square {
  constructor(brain, color) {
    this.x = 50;
    this.y = 180;
    this.vy = 0;
    this.width = 20;
    this.height = 20;
    this.score = 0;
    this.fitness = 0;
    this.alive = true;
    this.brain = brain ? brain.copy() : new NeuralNetwork(4, 8, 1);
    if (!brain) this.brain.mutate(1);
    this.color = color || getRandomColor();
    this.jumpStartY = 180;
    this.maxJumpHeight = maxJumpHeight;
    this.isJumping = false;
  }

  update(obstacle) {
    if (this.isJumping && (this.jumpStartY - this.y) >= this.maxJumpHeight) {
      if (this.vy < 0) this.vy = 0; // parando a subida
    }

    this.vy += gravity * verticalSpeed;
    this.y += this.vy;

    if (this.y >= 180) {
      this.y = 180;
      this.vy = 0;
      this.isJumping = false;
    }

    let inputs = [
      obstacle ? (obstacle.x - this.x) / canvas.width : 1,
      obstacle ? obstacle.width / 50 : 0,
      obstacleSpeed / 10,
      this.y / canvas.height
    ];

    let output = this.brain.predict(inputs);
    if (output[0] > 0.5 && this.y >= 180) {
      this.vy = jumpForce * verticalSpeed;
      this.jumpStartY = this.y;
      this.isJumping = true;
    }

    this.score++;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  clone() {
    return new Square(this.brain, this.color);
  }
}

class Obstacle {
  constructor() {
    this.x = canvas.width;
    this.width = 20 + Math.random() * 30;
    this.height = 20 + Math.random() * 40;
    this.y = 200 - this.height;
  }

  update() {
    this.x -= obstacleSpeed;
  }

  draw() {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

function getRandomColor() {
  return `hsl(${Math.random() * 360}, 100%, 50%)`;
}

function setup() {
  squares = [];
  for (let i = 0; i < populationSize; i++) {
    squares.push(new Square());
  }
  obstacles = [];
  frame = 0;
  shownSquare = squares[Math.floor(Math.random() * squares.length)];
}

function nextGeneration() {
  generation++;
  document.getElementById('generation').textContent = generation;

  bestOfLastGen = squares.reduce((a, b) => a.score > b.score ? a : b);
  squares = evolve(squares);
  setup();
}

function updateGame() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (frame % obstacleFrequency === 0) {
    obstacles.push(new Obstacle());
  }

  obstacles.forEach(o => o.update());
  obstacles = obstacles.filter(o => o.x + o.width > 0);

  let currentObstacle = obstacles.find(o => o.x + o.width > 50);
  let aliveCount = 0;

  squares.forEach(d => {
    if (d.alive) {
      d.update(currentObstacle);
      d.draw();

      if (currentObstacle &&
        d.x + d.width > currentObstacle.x &&
        d.x < currentObstacle.x + currentObstacle.width &&
        d.y + d.height > currentObstacle.y) {
        d.alive = false;
      } else {
        aliveCount++;
      }
    }
  });

  obstacles.forEach(o => o.draw());

  document.getElementById('aliveCount').textContent = aliveCount;

  if (!shownSquare || !shownSquare.alive) {
    let alive = squares.filter(d => d.alive);
    shownSquare = alive[Math.floor(Math.random() * alive.length)];
  }

  if (shownSquare) {
    drawNeuralNetwork(shownSquare.brain);
    const color = shownSquare.color;
    const hex = rgbToHex(color);
    const liveTitle = document.getElementById("liveTitle");
    if (liveTitle) { liveTitle.textContent = "IA Atual - " + hex; }

    const liveColor = document.getElementById("liveColor");
    if (liveColor) liveColor.style.backgroundColor = color;

    const liveScore = document.getElementById("score-real-time");
    if (liveScore) liveScore.textContent = shownSquare.score;
  }

  if (shownSquare) {
    drawNeuralNetwork(shownSquare.brain);
  }

  if (aliveCount === 0) {
    let maxScore = Math.max(...squares.map(d => d.score));
    bestScore = Math.max(bestScore, maxScore);
    document.getElementById('bestScore').textContent = bestScore;
    bestOfLastGen = squares.reduce((a, b) => a.score > b.score ? a : b);
    nextGeneration();
  }

  frame++;
  if (bestOfLastGen) {
    drawNeuralNetworkWithWeights(bestOfLastGen.brain);
    const color = bestOfLastGen.color;
    const hex = rgbToHex(color);
    const bestTitle = document.getElementById("bestTitle");
    if (bestTitle) bestTitle.textContent = "Melhor da Geração - " + hex;
    const bestColor = document.getElementById("bestColor");
    if (bestColor) bestColor.style.backgroundColor = color;
  }
  requestAnimationFrame(updateGame);
}

window.changeSpeed = function (delta) {
  obstacleSpeed = Math.max(1, obstacleSpeed + delta);
  const val = document.getElementById('speedValue');
  if (val) val.textContent = `${obstacleSpeed} px/frame`;
};;

window.changeFrequency = function (delta) {
  obstacleFrequency = Math.max(10, obstacleFrequency + delta);
  const val = document.getElementById('frequencyValue');
  if (val) {
    const spawnsPerSecond = (60 / obstacleFrequency).toFixed(1);
    val.textContent = `~${spawnsPerSecond}/s`;
  }
};;

setup();
updateGame();

window.changeJumpForce = function (delta) {
  jumpForce = Math.max(-30, Math.min(-1, jumpForce + delta));
  const val = document.getElementById('jumpForceDisplay');
  if (val) val.textContent = jumpForce;
}

window.changeVerticalSpeed = function (delta) {
  verticalSpeed = Math.max(0.1, Math.round((verticalSpeed + delta) * 10) / 10);
  const val = document.getElementById('verticalSpeedValue');
  if (val) val.textContent = `${verticalSpeed.toFixed(1)}x`;
};

window.changeJumpHeight = function (delta) {
  maxJumpHeight = Math.max(20, maxJumpHeight + delta);
  const val = document.getElementById('jumpHeightValue');
  if (val) val.textContent = `${maxJumpHeight} px`;
};

window.changeJumpForce = function (delta) {
  jumpForce = Math.max(-30, Math.min(-1, jumpForce + delta));
  const val = document.getElementById('jumpForceDisplay');
  if (val) val.textContent = `${(jumpForce * -1) / 20}x`;
}

function rgbToHex(hsl) {
  const temp = document.createElement("div");
  temp.style.color = hsl;
  document.body.appendChild(temp);
  const rgb = window.getComputedStyle(temp).color;
  document.body.removeChild(temp);

  const result = rgb.match(/\d+/g).map(Number);
  return "#" + result.map(x => x.toString(16).padStart(2, "0")).join("").toUpperCase();
}
