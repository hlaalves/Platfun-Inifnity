const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GRAVITY = 0.7;
const MOVE_SPEED = 7;
const JUMP_POWER = 19;
const GROUND_FRICTION = 0.8;
const BALL_RADIUS = 20;
let animationFrame = 0;

// Calculate max jump height
const MAX_JUMP_VELOCITY = JUMP_POWER * 1.8; // for blue platforms
const NORMAL_JUMP_VELOCITY = JUMP_POWER;
const MAX_JUMP_HEIGHT = (NORMAL_JUMP_VELOCITY * NORMAL_JUMP_VELOCITY) / (2 * GRAVITY);
const MAX_BOUNCE_HEIGHT = (MAX_JUMP_VELOCITY * MAX_JUMP_VELOCITY) / (2 * GRAVITY);

// Platform generation constants
const PLATFORM_MIN_WIDTH = 80;
const PLATFORM_MAX_WIDTH = 180;
const PLATFORM_HEIGHT = 18;
const PLATFORM_GAP_MIN = Math.max(110, MAX_JUMP_HEIGHT * 0.6); // more spaced, but always possible
const PLATFORM_GAP_MAX = Math.min(180, MAX_JUMP_HEIGHT * 0.95); // never more than max jump
const PLATFORM_X_MARGIN = 20;

// Stickman properties
const stickman = {
    x: 100,
    y: 500,
    width: BALL_RADIUS * 2,
    height: BALL_RADIUS * 2,
    vx: 0,
    vy: 0,
    onGround: false
};

// Platforms
let platforms = [];
let platformCount = 0;
let slowFallTimer = 0;
const SLOW_FALL_GRAVITY = 0.28;
const SLOW_FALL_DURATION = 1.2; // seconds
let phaseTimer = 0;
function generateInitialPlatforms() {
    platforms = [];
    platformCount = 0;
    // Add ground platform at the bottom
    platforms.push({ x: 0, y: canvas.height - 20, width: canvas.width, height: 20, isGround: true, isBlue: false });
    let y = canvas.height - 60;
    for (let i = 0; i < 7; i++) {
        platformCount++;
        const width = Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH) + PLATFORM_MIN_WIDTH;
        const x = Math.random() * (canvas.width - width - PLATFORM_X_MARGIN * 2) + PLATFORM_X_MARGIN;
        const isBlue = platformCount % 4 === 0;
        platforms.push({ x, y, width, height: PLATFORM_HEIGHT, isBlue });
        y -= Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN) + PLATFORM_GAP_MIN;
    }
}
generateInitialPlatforms();

function generatePlatformAbove(y) {
    platformCount++;
    const width = Math.random() * (PLATFORM_MAX_WIDTH - PLATFORM_MIN_WIDTH) + PLATFORM_MIN_WIDTH;
    const x = Math.random() * (canvas.width - width - PLATFORM_X_MARGIN * 2) + PLATFORM_X_MARGIN;
    const isBlue = platformCount % 4 === 0;
    return { x, y, width, height: PLATFORM_HEIGHT, isBlue };
}

// Input
const keys = {};
document.addEventListener('keydown', e => {
    keys[e.code] = true;
});
document.addEventListener('keyup', e => {
    keys[e.code] = false;
});

let gameOver = false;

function update() {
    if (gameOver) return;
    // Horizontal movement
    if (keys['ArrowLeft']) {
        stickman.vx = -MOVE_SPEED;
    } else if (keys['ArrowRight']) {
        stickman.vx = MOVE_SPEED;
    } else {
        stickman.vx = 0;
    }

    // Jump
    if (keys['Space'] && stickman.onGround) {
        stickman.vy = -JUMP_POWER;
        stickman.onGround = false;
    }

    // Apply gravity (slow fall if active)
    if (slowFallTimer > 0) {
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

    // Move on X axis and check collisions
    stickman.x += stickman.vx;
    if (phaseTimer > 0 && stickman.vy < 0) {
        // Only check for ground collision on X axis
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
        // Normal X collision
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

    // Move on Y axis and check collisions
    stickman.y += stickman.vy;
    stickman.onGround = false;
    if (phaseTimer > 0 && stickman.vy < 0) {
        // Only check for ground collision when moving up
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
        // Normal collision with all platforms
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
                    // Bounce if blue
                    if (plat.isBlue) {
                        stickman.vy = -JUMP_POWER * 1.8;
                        slowFallTimer = SLOW_FALL_DURATION;
                        phaseTimer = SLOW_FALL_DURATION;
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

    // Infinite scrolling: if player climbs, scroll everything down
    const scrollThreshold = canvas.height / 2;
    if (stickman.y < scrollThreshold) {
        const dy = scrollThreshold - stickman.y;
        stickman.y = scrollThreshold;
        for (const plat of platforms) {
            plat.y += dy;
        }
    }

    // Remove platforms that go off the bottom
    platforms = platforms.filter(plat => plat.y < canvas.height + 100);

    // Generate new platforms above if needed
    let highestY = Math.min(...platforms.map(p => p.y));
    while (highestY > -PLATFORM_GAP_MAX) {
        const newPlat = generatePlatformAbove(highestY - Math.random() * (PLATFORM_GAP_MAX - PLATFORM_GAP_MIN) - PLATFORM_GAP_MIN);
        platforms.push(newPlat);
        highestY = Math.min(...platforms.map(p => p.y));
    }

    // Prevent falling below canvas (game over)
    if (stickman.y + BALL_RADIUS * 2 > canvas.height) {
        gameOver = true;
        slowFallTimer = 0;
        phaseTimer = 0;
    }

    // Prevent going out of bounds (wrap horizontally)
    if (stickman.x + BALL_RADIUS * 2 < 0) {
        stickman.x = canvas.width;
    }
    if (stickman.x > canvas.width) {
        stickman.x = -BALL_RADIUS * 2;
    }

    // Animation frame for running
    if (stickman.vx !== 0 && stickman.onGround) {
        animationFrame += 0.2;
    } else {
        animationFrame = 0;
    }
}

function drawStickman(x, y, width, height, vx, vy, onGround) {
    // Draw a round black ball as the main character
    const centerX = x + BALL_RADIUS;
    const centerY = y + BALL_RADIUS;
    ctx.save();
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(centerX, centerY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function draw() {
    // Prettier background
    let grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#b3e0ff');
    grad.addColorStop(1, '#e0e7ef');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Draw platforms (prettier)
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
        // Platform shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(plat.x, plat.y + plat.height, plat.width, 6);
    }
    // Draw stickman
    ctx.strokeStyle = '#111';
    drawStickman(stickman.x, stickman.y, stickman.width, stickman.height, stickman.vx, stickman.vy, stickman.onGround);
    // Game over screen
    if (gameOver) {
        ctx.save();
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
        ctx.font = '24px Arial';
        ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 30);
        ctx.restore();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();

document.addEventListener('keydown', e => {
    if (gameOver && (e.code === 'KeyR' || e.code === 'Space')) {
        generateInitialPlatforms();
        stickman.x = canvas.width / 2 - BALL_RADIUS;
        stickman.y = canvas.height - 20 - BALL_RADIUS * 2;
        stickman.vx = 0;
        stickman.vy = 0;
        stickman.onGround = false;
        gameOver = false;
        slowFallTimer = 0;
        phaseTimer = 0;
    }
}); 