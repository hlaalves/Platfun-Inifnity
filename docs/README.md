# Platfun Infinity 🎮

A fun infinite platformer game where you control a colorful ball and climb as high as possible! Jump from platform to platform, collect points, and try to beat your high score.

## 🎯 How to Play

1. **Enter your name** and choose your ball color on the menu screen
2. **Use arrow keys** to move left and right
3. **Press spacebar** to jump
4. **Climb higher** to earn more points
5. **Land on blue platforms** for special bounces and bonus points
6. **Don't fall off the screen** - that's game over!

## 🚀 How to Run the Game

### Option 1: Simple (Recommended)
1. Download all the files to a folder
2. Open the `public/index.html` file in your web browser
3. That's it! The game will start automatically

### Option 2: Local Server (For Developers)
If you have Python installed:
```bash
# Python 3
python -m http.server 8000 --directory public

# Python 2
cd public && python -m SimpleHTTPServer 8000
```
Then open `http://localhost:8000` in your browser.

Or with Node.js:
```bash
# Using the included package.json
npm run dev

# Or directly with npx
npx http-server public
```

## 🎮 Game Features

### Core Gameplay
- **Infinite scrolling** - platforms generate endlessly as you climb
- **Physics-based movement** - realistic jumping and falling
- **Platform variety** - different sizes and gaps to challenge you
- **Screen wrapping** - go off one side, appear on the other

### Special Elements
- **Blue platforms** - every 4th platform gives you a super bounce
- **Bonus points** - blue platforms award extra score with visual effects
- **Smooth animations** - score counter animates smoothly
- **Hang time** - brief pause at the peak of jumps for better control

### Menu System
- **Player customization** - choose your name and ball color
- **Session scoreboard** - tracks all your scores for the current session
- **6 ball colors** - black, red, blue, green, orange, and purple
- **Clean interface** - modern, responsive design

## 📁 File Structure

```
Platfun-Inifnity/
├── public/              # All files needed to run the game in the browser
│   ├── index.html
│   ├── style.css
│   └── game.js
│
├── docs/                # Documentation and meta files
│   ├── README.md
│   ├── CHANGELOG.md
│   └── LICENSE
│
├── package.json
└── .gitignore
```

### File Descriptions

- **`public/index.html`** - The main entry point. Contains the menu screen and game canvas
- **`public/style.css`** - Handles all visual styling including menu design, colors, animations
- **`public/game.js`** - Contains all game logic including physics, scoring, platform generation
- **`docs/README.md`** - Documentation and instructions
- **`docs/CHANGELOG.md`** - Complete development history and feature list
- **`docs/LICENSE`** - MIT license for the project
- **`package.json`** - Project metadata, scripts, and dependencies
- **`.gitignore`** - Rules for Git version control

## 🎯 Controls

| Key | Action |
|-----|--------|
| **Arrow Left/Right** | Move the ball horizontally |
| **Spacebar** | Jump (only when on ground) |
| **R** | Restart game (when game over) |
| **Mouse** | Click color options and buttons in menu |

## 🏆 Scoring System

- **Base points**: 20 points for landing on any platform
- **Distance bonus**: Extra points based on how far you jumped
- **Blue platform bonus**: 100 points + gradual bonus animation
- **Session tracking**: All scores saved until browser tab is closed

## 🛠️ Technical Details

### Built With
- **HTML5 Canvas** - For smooth 2D graphics
- **Vanilla JavaScript** - No frameworks, pure JS for performance
- **CSS3** - Modern styling with gradients and animations

### Key Features
- **60 FPS gameplay** - Smooth animations and responsive controls
- **Collision detection** - Precise platform landing
- **Infinite generation** - Platforms spawn dynamically
- **Session storage** - Scores persist during browser session
- **Responsive design** - Works on different screen sizes

### Physics System
- **Gravity**: 0.7 units per frame
- **Jump power**: 19 units
- **Blue platform bounce**: 1.8x normal jump power
- **Maximum upward velocity**: Capped for balanced gameplay
- **Hang time**: Brief pause at jump peak for better control

## 🎨 Customization

### Ball Colors Available
- ⚫ Black (default)
- 🔴 Red
- 🔵 Blue
- 🟢 Green
- 🟠 Orange
- 🟣 Purple

### Platform Types
- **Gray platforms**: Normal landing platforms
- **Blue platforms**: Special bounce platforms (every 4th platform)
- **Ground platform**: Bottom platform that's always there

## 🐛 Known Features

- **Screen wrapping**: Ball can go off one edge and appear on the other
- **Infinite climbing**: No height limit, climb as high as you want
- **Session persistence**: Scores stay until you close the browser tab
- **Smooth animations**: Score counter and bonus effects are animated

## 🚀 Future Ideas

Some features that could be added:
- Sound effects and background music
- Different ball shapes or characters
- Power-ups and special abilities
- Global leaderboard with server storage
- Mobile touch controls
- Different game modes (time attack, survival, etc.)

## 📝 Development Notes

This game was built as a personal project to practice JavaScript game development. The code is organized with casual comments and follows a simple structure that's easy to understand and modify.

### Code Organization
- **Menu system**: Handles player input and screen transitions
- **Game loop**: 60 FPS update and render cycle
- **Physics engine**: Gravity, collision detection, and movement
- **Platform generation**: Infinite scrolling with random placement
- **Scoring system**: Points calculation and session storage

### Development Setup
The project includes development tools for easier development:
- **package.json**: Contains project metadata and npm scripts
- **.gitignore**: Excludes unnecessary files from version control
- **CHANGELOG.md**: Tracks all development changes and features

### Contributing
Feel free to fork this project and make improvements! The code is well-commented and organized for easy modification.

---

**Enjoy playing Platfun Infinity!** 🎮✨