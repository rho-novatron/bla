// Game Configuration
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const restartBtn = document.getElementById('restartBtn');

// Game Constants
const GRAVITY = 0.6;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const PLAYER_SIZE = 30;

// Game State
let gameState = {
    player: null,
    platforms: [],
    components: [],
    keys: {},
    score: 0,
    gameOver: false,
    won: false
};

// Player Class
class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = PLAYER_SIZE;
        this.height = PLAYER_SIZE;
        this.velocityX = 0;
        this.velocityY = 0;
        this.onGround = false;
        this.color = '#e74c3c';
    }

    update() {
        // Horizontal movement
        if (gameState.keys['ArrowLeft'] || gameState.keys['a'] || gameState.keys['A']) {
            this.velocityX = -MOVE_SPEED;
        } else if (gameState.keys['ArrowRight'] || gameState.keys['d'] || gameState.keys['D']) {
            this.velocityX = MOVE_SPEED;
        } else {
            this.velocityX = 0;
        }

        // Jump
        if ((gameState.keys[' '] || gameState.keys['ArrowUp'] || gameState.keys['w'] || gameState.keys['W']) && this.onGround) {
            this.velocityY = JUMP_FORCE;
            this.onGround = false;
        }

        // Apply gravity
        this.velocityY += GRAVITY;

        // Update position
        this.x += this.velocityX;
        this.y += this.velocityY;

        // Keep player in bounds horizontally
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;

        // Check if player fell off screen
        if (this.y > canvas.height + 100) {
            gameState.gameOver = true;
        }

        // Reset onGround flag
        this.onGround = false;
    }

    draw() {
        // Draw player as a simple character
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Add simple face
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + 8, this.y + 10, 5, 5);
        ctx.fillRect(this.x + 17, this.y + 10, 5, 5);
        
        // Smile
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x + 15, this.y + 20, 6, 0, Math.PI);
        ctx.stroke();
    }
}

// Platform Class
class Platform {
    constructor(x, y, width, height, type = 'resistor') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
    }

    draw() {
        switch(this.type) {
            case 'resistor':
                this.drawResistor();
                break;
            case 'capacitor':
                this.drawCapacitor();
                break;
            case 'inductor':
                this.drawInductor();
                break;
            case 'lamp':
                this.drawLamp();
                break;
            case 'ground':
                this.drawGround();
                break;
            default:
                this.drawResistor();
        }
    }

    drawResistor() {
        // Resistor body
        ctx.fillStyle = '#e8be86';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Resistor bands
        const bandWidth = 4;
        ctx.fillStyle = '#8B4513';
        for (let i = 1; i <= 3; i++) {
            ctx.fillRect(this.x + (this.width / 4) * i - bandWidth / 2, this.y, bandWidth, this.height);
        }
        
        // Border
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }

    drawCapacitor() {
        // Capacitor plates
        const gapWidth = 10;
        const plateWidth = (this.width - gapWidth) / 2;
        
        ctx.fillStyle = '#34495e';
        ctx.fillRect(this.x, this.y, plateWidth, this.height);
        ctx.fillRect(this.x + plateWidth + gapWidth, this.y, plateWidth, this.height);
        
        // Capacitor leads
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(this.x + plateWidth, this.y + this.height / 2);
        ctx.lineTo(this.x + plateWidth + gapWidth, this.y + this.height / 2);
        ctx.stroke();
    }

    drawInductor() {
        // Draw coil
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(192, 57, 43, 0.1)';
        
        // Draw spiral/coil pattern
        const coilRadius = this.height / 2;
        const numCoils = Math.floor(this.width / (coilRadius * 2));
        
        ctx.beginPath();
        for (let i = 0; i < numCoils; i++) {
            const centerX = this.x + coilRadius + (i * coilRadius * 2);
            ctx.arc(centerX, this.y + coilRadius, coilRadius, 0, Math.PI, true);
        }
        ctx.stroke();
        
        // Platform surface
        ctx.fillStyle = 'rgba(192, 57, 43, 0.3)';
        ctx.fillRect(this.x, this.y + this.height - 5, this.width, 5);
    }

    drawLamp() {
        // Lamp base
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(this.x, this.y + this.height - 10, this.width, 10);
        
        // Lamp bulb
        ctx.fillStyle = '#f39c12';
        ctx.strokeStyle = '#d68910';
        ctx.lineWidth = 2;
        
        const bulbRadius = this.height / 2;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + bulbRadius, bulbRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Light glow
        const gradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + bulbRadius, 0,
            this.x + this.width / 2, this.y + bulbRadius, bulbRadius * 1.5
        );
        gradient.addColorStop(0, 'rgba(243, 156, 18, 0.3)');
        gradient.addColorStop(1, 'rgba(243, 156, 18, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + bulbRadius, bulbRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGround() {
        // Ground symbol
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Ground lines
        ctx.strokeStyle = '#34495e';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            const lineWidth = this.width - (i * 20);
            const lineY = this.y + (i * 8);
            ctx.beginPath();
            ctx.moveTo(this.x + (this.width - lineWidth) / 2, lineY);
            ctx.lineTo(this.x + (this.width + lineWidth) / 2, lineY);
            ctx.stroke();
        }
    }

    checkCollision(player) {
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }
}

// Goal Class
class Goal {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 60;
        this.animation = 0;
    }

    draw() {
        this.animation += 0.1;
        
        // Draw goal as a glowing battery symbol
        ctx.save();
        
        // Glow effect
        const glowGradient = ctx.createRadialGradient(
            this.x + this.width / 2, this.y + this.height / 2, 0,
            this.x + this.width / 2, this.y + this.height / 2, this.width
        );
        glowGradient.addColorStop(0, 'rgba(46, 204, 113, 0.5)');
        glowGradient.addColorStop(1, 'rgba(46, 204, 113, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width + Math.sin(this.animation) * 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Battery body
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(this.x, this.y + 10, this.width, this.height - 10);
        
        // Battery terminal
        ctx.fillRect(this.x + 10, this.y, this.width - 20, 10);
        
        // Plus sign
        ctx.fillStyle = 'white';
        ctx.fillRect(this.x + this.width / 2 - 10, this.y + 25, 20, 4);
        ctx.fillRect(this.x + this.width / 2 - 2, this.y + 17, 4, 20);
        
        ctx.restore();
    }

    checkCollision(player) {
        return player.x < this.x + this.width &&
               player.x + player.width > this.x &&
               player.y < this.y + this.height &&
               player.y + player.height > this.y;
    }
}

// Initialize Game
function initGame() {
    gameState = {
        keys: {},
        score: 0,
        gameOver: false,
        won: false
    };

    // Create player
    gameState.player = new Player(50, 400);

    // Create platforms with various electronics components
    gameState.platforms = [
        // Ground level platforms
        new Platform(0, 550, 200, 50, 'ground'),
        new Platform(250, 500, 120, 20, 'resistor'),
        new Platform(420, 480, 100, 25, 'inductor'),
        new Platform(570, 450, 80, 20, 'lamp'),
        new Platform(700, 400, 100, 50, 'ground'),
        
        // Mid level platforms
        new Platform(150, 400, 80, 20, 'resistor'),
        new Platform(300, 350, 60, 20, 'capacitor'),
        new Platform(420, 320, 100, 25, 'inductor'),
        new Platform(580, 280, 70, 20, 'resistor'),
        
        // Upper level platforms
        new Platform(50, 250, 90, 20, 'lamp'),
        new Platform(200, 200, 80, 20, 'resistor'),
        new Platform(350, 180, 70, 20, 'capacitor'),
        new Platform(500, 150, 100, 25, 'inductor'),
        new Platform(650, 150, 150, 30, 'ground'),
    ];

    // Create goal
    gameState.goal = new Goal(720, 90);

    updateScore(0);
}

// Collision Detection
function handleCollisions() {
    const player = gameState.player;

    gameState.platforms.forEach(platform => {
        if (platform.checkCollision(player)) {
            // Check collision from above
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.onGround = true;

                // Special platform effects
                if (platform.type === 'inductor' && gameState.keys[' ']) {
                    // Bounce effect on inductor
                    player.velocityY = JUMP_FORCE * 1.2;
                }
            }
            // Collision from below
            else if (player.velocityY < 0 && player.y - player.velocityY >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Side collision
            else if (player.velocityX > 0) {
                player.x = platform.x - player.width;
            } else if (player.velocityX < 0) {
                player.x = platform.x + platform.width;
            }
        }
    });

    // Check goal collision
    if (gameState.goal && gameState.goal.checkCollision(player)) {
        gameState.won = true;
        updateScore(gameState.score + 100);
    }
}

// Update Score
function updateScore(points) {
    gameState.score = points;
    scoreElement.textContent = gameState.score;
}

// Draw Circuit Board Background
function drawBackground() {
    // Clear canvas
    ctx.fillStyle = '#f0f4f8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw circuit traces
    ctx.strokeStyle = '#d0d8e0';
    ctx.lineWidth = 2;

    // Horizontal traces
    for (let y = 0; y < canvas.height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Vertical traces
    for (let x = 0; x < canvas.width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    // Draw connection points
    ctx.fillStyle = '#95a5a6';
    for (let x = 0; x < canvas.width; x += 100) {
        for (let y = 0; y < canvas.height; y += 100) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Game Loop
function gameLoop() {
    if (!gameState.gameOver && !gameState.won) {
        // Update
        gameState.player.update();
        handleCollisions();

        // Draw
        drawBackground();

        // Draw platforms
        gameState.platforms.forEach(platform => platform.draw());

        // Draw goal
        if (gameState.goal) {
            gameState.goal.draw();
        }

        // Draw player
        gameState.player.draw();

        requestAnimationFrame(gameLoop);
    } else {
        // Game over or won
        drawBackground();
        gameState.platforms.forEach(platform => platform.draw());
        if (gameState.goal) gameState.goal.draw();
        gameState.player.draw();

        // Display message
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, canvas.height / 2 - 60, canvas.width, 120);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 40px Courier New';
        ctx.textAlign = 'center';

        if (gameState.won) {
            ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px Courier New';
            ctx.fillText('Circuit Complete! Score: ' + gameState.score, canvas.width / 2, canvas.height / 2 + 35);
        } else {
            ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
            ctx.font = '20px Courier New';
            ctx.fillText('Press Restart to try again', canvas.width / 2, canvas.height / 2 + 35);
        }
    }
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    gameState.keys[e.key] = true;
    // Prevent default behavior for game keys
    if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.key] = false;
});

restartBtn.addEventListener('click', () => {
    initGame();
    gameLoop();
});

// Start Game
initGame();
gameLoop();
