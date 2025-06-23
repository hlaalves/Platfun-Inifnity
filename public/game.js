// menu and player data
let playerName = '';
let ballColor = '#111';
let sessionScores = [];
let currentScreen = 'menu';

// get DOM elements
const menuScreen = document.getElementById('menuScreen');
const gameScreen = document.getElementById('gameScreen');
const playerNameInput = document.getElementById('playerName');
const startGameBtn = document.getElementById('startGameBtn');
const backToMenuBtn = document.getElementById('backToMenuBtn');
const scoreboardList = document.getElementById('scoreboardList');

// color selection
const colorOptions = document.querySelectorAll('.color-option');
colorOptions.forEach(option => {
    option.addEventListener('click', () => {
        // remove previous selection
        colorOptions.forEach(opt => opt.classList.remove('selected'));
        // select new color
        option.classList.add('selected');
        ballColor = option.dataset.color;
    });
});

// select default color
colorOptions[0].classList.add('selected');

// start game button
startGameBtn.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name.length > 0) {
        playerName = name;
        startGame();
    } else {
        alert('Please enter your name!');
    }
});

// back to menu button
backToMenuBtn.addEventListener('click', () => {
    showMenu();
});

// check if start button should be enabled
playerNameInput.addEventListener('input', () => {
    startGameBtn.disabled = playerNameInput.value.trim().length === 0;
});

// show menu screen
function showMenu() {
    currentScreen = 'menu';
    menuScreen.classList.remove('hidden');
    gameScreen.classList.add('hidden');
    updateScoreboard();
}

// start the game
function startGame() {
    currentScreen = 'game';
    menuScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    initGame();
}

// update scoreboard display
function updateScoreboard() {
    scoreboardList.innerHTML = '';
    
    if (sessionScores.length === 0) {
        scoreboardList.innerHTML = '<p style="color: #666; text-align: center;">No scores yet</p>';
        return;
    }
    
    // sort scores by value (highest first)
    const sortedScores = [...sessionScores].sort((a, b) => b.score - a.score);
    
    sortedScores.forEach((entry, index) => {
        const scoreEntry = document.createElement('div');
        scoreEntry.className = 'score-entry';
        scoreEntry.innerHTML = `
            <span class="score-name">${entry.name}</span>
            <span class="score-value">${entry.score}</span>
        `;
        scoreboardList.appendChild(scoreEntry);
    });
}

// add score to session
function addScore(name, score) {
    sessionScores.push({ name, score });
    updateScoreboard();
}

// initialize game state
function initGame() {
    generateInitialPlatforms();
    stickman.x = canvas.width / 2 - BALL_RADIUS;
    stickman.y = canvas.height - 20 - BALL_RADIUS * 2;
    stickman.vx = 0;
    stickman.vy = 0;
    stickman.onGround = false;
    gameOver = false;
    slowFallTimer = 0;
    phaseTimer = 0;
    hangTimeTimer = 0;
    score = 0;
    displayScore = 0;
    lastPlatformY = null;
    blueBonusActive = false;
    blueBonusRemaining = 0;
    blueBonusTimer = 0;
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// game settings
const GRAVITY = 0.7;
const MOVE_SPEED = 7;
const JUMP_POWER = 19;
const GROUND_FRICTION = 0.8;
const BALL_RADIUS = 20;
let animationFrame = 0;

// figure out how high the ball can jump
const MAX_JUMP_VELOCITY = JUMP_POWER * 1.8; // for blue platforms
const NORMAL_JUMP_VELOCITY = JUMP_POWER;
const MAX_JUMP_HEIGHT = (NORMAL_JUMP_VELOCITY * NORMAL_JUMP_VELOCITY) / (2 * GRAVITY);
const MAX_BOUNCE_HEIGHT = (MAX_JUMP_VELOCITY * MAX_JUMP_VELOCITY) / (2 * GRAVITY);

// platform generation stuff
const PLATFORM_MIN_WIDTH = 80;
const PLATFORM_MAX_WIDTH = 180;
const PLATFORM_HEIGHT = 18;
const PLATFORM_GAP_MIN = Math.max(110, MAX_JUMP_HEIGHT * 0.6); // make sure jumps are possible
const PLATFORM_GAP_MAX = Math.min(180, MAX_JUMP_HEIGHT * 0.95); // but not too easy
const PLATFORM_X_MARGIN = 20;

// the ball/player
const stickman = {
    x: 100,
    y: 500,
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    vx: 0,
    vy: 0,
    onGround: false
};

// game state
let platforms = [];
let platformCount = 0;
let slowFallTimer = 0;
const SLOW_FALL_GRAVITY = 0.28;
const SLOW_FALL_DURATION = 1.2; // seconds
let phaseTimer = 0;
let hangTimeTimer = 0;
const HANG_TIME_GRAVITY = 0.09;
const HANG_TIME_DURATION = 0.22; // seconds
const MAX_UPWARD_VELOCITY = -JUMP_POWER * 2.2;

// scoring system
let score = 0;
let displayScore = 0;
let lastPlatformY = null; // remember where we last landed
const SCORE_PER_PLATFORM = 20; // base points for landing on a platform
const SCORE_PER_PIXEL = 0.1; // extra points based on jump distance
const BLUE_PLATFORM_BONUS = 100;
let blueBonusActive = false;
let blueBonusRemaining = 0;
let blueBonusPerFrame = 0;
let blueBonusTimer = 0;
const BLUE_BONUS_DURATION = 1.0; // seconds

function generateInitialPlatforms() {
    platforms = [];
    platformCount = 0;
    // add the ground
    platforms.push({ x: 0, y: canvas.height - 20, width: canvas.width, height: 20, isGround: true, isBlue: false });
    let y = canvas.height - 120; // start platforms higher up from ground
    for (let i = 0; i < 7; i++) {
        platformCount++;
        const width = Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH) + PLATFORM_MIN_WIDTH;
        const x = Math.random() * (canvas.width - width - PLATFORM_X_MARGIN * 2) + PLATFORM_X_MARGIN;
        const isBlue = platformCount % 4 === 0; // every 4th platform is blue
        platforms.push({ x, y, width, height: PLATFORM_HEIGHT, isBlue });
        y -= Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN) + PLATFORM_GAP_MIN;
    }
}

function generatePlatformAbove(y) {
    platformCount++;
    const width = Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH) + PLATFORM_MIN_WIDTH;
    const x = Math.random() * (canvas.width - width - PLATFORM_X_MARGIN * 2) + PLATFORM_X_MARGIN;
    const isBlue = platformCount % 4 === 0;
    return { x, y, width, height: PLATFORM_HEIGHT, isBlue };
}

// handle keyboard input
const keys = {};
document.addEventListener('keydown', e => {
    if (currentScreen === 'game') {
        keys[e.code] = true;
    }
});
document.addEventListener('keyup', e => {
    if (currentScreen === 'game') {
        keys[e.code] = false;
    }
});

let gameOver = false;

function update() {
    if (gameOver || currentScreen !== 'game') return;
    
    // handle movement
    if (keys['ArrowLeft']) {
        stickman.vx = -MOVE_SPEED;
    } else if (keys['ArrowRight']) {
        stickman.vx = MOVE_SPEED;
    } else {
        stickman.vx = 0;
    }

    // handle jumping
    if (keys['Space'] && stickman.onGround) {
        stickman.vy = -JUMP_POWER;
        stickman.onGround = false;
    }

    // limit how fast the ball can go up
    if (stickman.vy < MAX_UPWARD_VELOCITY) {
        stickman.vy = MAX_UPWARD_VELOCITY;
    }
    
    // handle hang time at the peak of jumps
    if (hangTimeTimer > 0) {
        hangTimeTimer -= 1 / 60;
        if (hangTimeTimer < 0) hangTimeTimer = 0;
    }
    
    // apply gravity (with different effects)
    if (hangTimeTimer > 0) {
        stickman.vy += HANG_TIME_GRAVITY;
    } else if (slowFallTimer > 0) {
        stickman.vy += SLOW_FALL_GRAVITY;
        slowFallTimer -= 1 / 60;
        if (slowFallTimer < 0) slowFallTimer = 0;
    } else {
        stickman.vy += GRAVITY;
    }
    if (phaseTimer > 0) {
        phaseTimer -= 1 / 60;
        if (phaseTimer < 0) phaseTimer = 0;
    }

    // move horizontally and check for collisions
    stickman.x += stickman.vx;
    if (phaseTimer > 0 && stickman.vy < 0) {
        // when phasing, only check ground collision
        for (const plat of platforms) {
            if (!plat.isGround) continue;
            const ballLeft = stickman.x;
            const ballRight = stickman.x + BALL_RADIUS * 2;
            const ballTop = stickman.y;
            const ballBottom = stickman.y + BALL_RADIUS * 2;
            const platLeft = plat.x;
            const platRight = plat.x + plat.width;
            const platTop = plat.y;
            const platBottom = plat.y + plat.height;
            if (
                ballRight > platLeft &&
                ballLeft < platRight &&
                ballBottom > platTop &&
                ballTop < platBottom
            ) {
                if (stickman.vx > 0) {
                    stickman.x = platLeft - BALL_RADIUS * 2;
                } else if (stickman.vx < 0) {
                    stickman.x = platRight;
                }
                stickman.vx = 0;
            }
        }
    } else {
        // normal horizontal collision
        for (const plat of platforms) {
            const ballLeft = stickman.x;
            const ballRight = stickman.x + BALL_RADIUS * 2;
            const ballTop = stickman.y;
            const ballBottom = stickman.y + BALL_RADIUS * 2;
            const platLeft = plat.x;
            const platRight = plat.x + plat.width;
            const platTop = plat.y;
            const platBottom = plat.y + plat.height;
            if (
                ballRight > platLeft &&
                ballLeft < platRight &&
                ballBottom > platTop &&
                ballTop < platBottom
            ) {
                if (stickman.vx > 0) {
                    stickman.x = platLeft - BALL_RADIUS * 2;
                } else if (stickman.vx < 0) {
                    stickman.x = platRight;
                }
                stickman.vx = 0;
            }
        }
    }

    // move vertically and check for collisions
    stickman.y += stickman.vy;
    stickman.onGround = false;
    if (phaseTimer > 0 && stickman.vy < 0) {
        // when phasing up, only check ground collision
        for (const plat of platforms) {
            if (!plat.isGround) continue;
            const ballLeft = stickman.x;
            const ballRight = stickman.x + BALL_RADIUS * 2;
            const ballTop = stickman.y;
            const ballBottom = stickman.y + BALL_RADIUS * 2;
            const platLeft = plat.x;
            const platRight = plat.x + plat.width;
            const platTop = plat.y;
            const platBottom = plat.y + plat.height;
            if (
                ballRight > platLeft &&
                ballLeft < platRight &&
                ballBottom > platTop &&
                ballTop < platBottom
            ) {
                stickman.y = platTop - BALL_RADIUS * 2;
                stickman.vy = 0;
                stickman.onGround = true;
            }
        }
    } else {
        // normal collision with all platforms
        for (const plat of platforms) {
            const ballLeft = stickman.x;
            const ballRight = stickman.x + BALL_RADIUS * 2;
            const ballTop = stickman.y;
            const ballBottom = stickman.y + BALL_RADIUS * 2;
            const platLeft = plat.x;
            const platRight = plat.x + plat.width;
            const platTop = plat.y;
            const platBottom = plat.y + plat.height;
            if (
                ballRight > platLeft &&
                ballLeft < platRight &&
                ballBottom > platTop &&
                ballTop < platBottom
            ) {
                if (stickman.vy > 0) {
                    stickman.y = platTop - BALL_RADIUS * 2;
                    // give points for landing on new platforms (but not ground)
                    if (!plat.isGround && (lastPlatformY === null || Math.abs(platTop - lastPlatformY) > 1)) {
                        let distance = 0;
                        if (lastPlatformY !== null) {
                            distance = Math.abs(lastPlatformY - platTop);
                        }
                        let platformScore = SCORE_PER_PLATFORM + Math.floor(distance * SCORE_PER_PIXEL);
                        score += platformScore;
                        lastPlatformY = platTop;
                    } else if (plat.isGround && lastPlatformY === null) {
                        // remember we started on the ground
                        lastPlatformY = platTop;
                    }
                    // blue platforms give special effects
                    if (plat.isBlue) {
                        stickman.vy = -JUMP_POWER * 1.8;
                        slowFallTimer = SLOW_FALL_DURATION;
                        phaseTimer = SLOW_FALL_DURATION;
                        hangTimeTimer = HANG_TIME_DURATION;
                        // start the bonus animation
                        blueBonusActive = true;
                        blueBonusRemaining = BLUE_PLATFORM_BONUS;
                        blueBonusTimer = BLUE_BONUS_DURATION;
                        blueBonusPerFrame = BLUE_PLATFORM_BONUS / (BLUE_BONUS_DURATION * 60);
                    } else {
                        stickman.vy = 0;
                        stickman.onGround = true;
                    }
                } else if (stickman.vy < 0) {
                    stickman.y = platBottom;
                    stickman.vy = 0;
                }
            }
        }
    }

    // make the world scroll when player climbs
    const scrollThreshold = canvas.height / 2;
    if (stickman.y < scrollThreshold) {
        const dy = scrollThreshold - stickman.y;
        stickman.y = scrollThreshold;
        for (const plat of platforms) {
            plat.y += dy;
        }
    }

    // clean up platforms that are too far down
    platforms = platforms.filter(plat => plat.y < canvas.height + 100);

    // generate new platforms above
    let platformHighestY = Math.min(...platforms.map(p => p.y));
    while (platformHighestY > -PLATFORM_GAP_MAX) {
        const newPlat = generatePlatformAbove(platformHighestY - Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN) - PLATFORM_GAP_MIN);
        platforms.push(newPlat);
        platformHighestY = Math.min(...platforms.map(p => p.y));
    }

    // handle falling off the screen
    if (stickman.y + BALL_RADIUS * 2 > canvas.height) {
        gameOver = true;
        slowFallTimer = 0;
        phaseTimer = 0;
        hangTimeTimer = 0;
        // add score to session and show menu
        addScore(playerName, displayScore);
        setTimeout(() => {
            showMenu();
        }, 2000);
        lastPlatformY = null;
        blueBonusActive = false;
        blueBonusRemaining = 0;
        blueBonusTimer = 0;
    }

    // wrap around the sides of the screen
    if (stickman.x + BALL_RADIUS * 2 < 0) {
        stickman.x = canvas.width;
    }
    if (stickman.x > canvas.width) {
        stickman.x = -BALL_RADIUS * 2;
    }

    // animation for running
    if (stickman.vx !== 0 && stickman.onGround) {
        animationFrame += 0.2;
    } else {
        animationFrame = 0;
    }

    // gradually add blue platform bonus
    if (blueBonusActive) {
        if (blueBonusTimer > 0 && blueBonusRemaining > 0) {
            const add = Math.min(Math.ceil(blueBonusPerFrame), blueBonusRemaining);
            score += add;
            blueBonusRemaining -= add;
            blueBonusTimer -= 1 / 60;
        } else {
            blueBonusActive = false;
            blueBonusRemaining = 0;
            blueBonusTimer = 0;
        }
    }

    // smooth score animation
    if (displayScore < score) {
        displayScore += Math.ceil((score - displayScore) * 0.2);
        if (displayScore > score) displayScore = score;
    } else if (displayScore > score) {
        displayScore = score;
    }
}

function drawStickman(x, y, width, height, vx, vy, onGround) {
    // draw the ball with selected color
    const centerX = x + BALL_RADIUS;
    const centerY = y + BALL_RADIUS;
    ctx.save();
    ctx.fillStyle = ballColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function draw() {
    if (currentScreen !== 'game') return;
    
    // background
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#b3e0ff');
    grad.addColorStop(1, '#e0e7ef');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // draw all the platforms
    for (const plat of platforms) {
        if (plat.isBlue) {
            ctx.fillStyle = '#2196f3';
        } else if (plat.isGround) {
            ctx.fillStyle = '#666';
        } else {
            let platGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
            platGrad.addColorStop(0, '#888');
            platGrad.addColorStop(1, '#444');
            ctx.fillStyle = platGrad;
        }
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
        // add shadows
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(plat.x, plat.y + plat.height, plat.width, 6);
    }
    
    // draw the ball
    ctx.strokeStyle = '#111';
    drawStickman(stickman.x, stickman.y, stickman.width, stickman.height, stickman.vx, stickman.vy, stickman.onGround);
    
    // game over screen
    if (gameOver) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = 'bold 32px Arial';
        ctx.fillText('Final Score: ' + displayScore, canvas.width / 2, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText('Returning to menu...', canvas.width / 2, canvas.height / 2 + 50);
        ctx.restore();
    }
    
    // score display
    ctx.save();
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'right';
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 4;
    ctx.strokeText('Score: ' + displayScore, canvas.width - 30, 40);
    ctx.fillText('Score: ' + displayScore, canvas.width - 30, 40);
    ctx.restore();
    
    // blue bonus animation
    if (blueBonusActive && blueBonusTimer > 0) {
        ctx.save();
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.max(0, blueBonusTimer / BLUE_BONUS_DURATION);
        ctx.fillStyle = '#2196f3';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 6;
        ctx.strokeText('+' + BLUE_PLATFORM_BONUS, canvas.width / 2, 80);
        ctx.fillText('+' + BLUE_PLATFORM_BONUS, canvas.width / 2, 80);
        ctx.restore();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// start the game loop and show initial menu
gameLoop();
updateScoreboard(); 