# Electronics Schematic Adventure 🎮⚡

A fun Mario-like platform game where you navigate through an electronics circuit board! Jump over capacitor gaps, bounce on inductors, and traverse various electronic components to reach the goal.

## 🎯 Game Features

- **Electronics-themed gameplay**: Navigate through a world made of resistors, capacitors, inductors, and lamps
- **Algorithmically generated chip tune music**: Retro-style background music created with Web Audio API
- **Platform mechanics**: Jump, run, and explore the circuit board
- **Special interactions**:
  - Jump over capacitor gaps (the space between plates)
  - Bounce higher on inductors (coils)
  - Navigate resistor platforms
  - Use lamp platforms as stepping stones
- **Goal**: Reach the battery (goal) at the top of the level

## 🎮 Controls

- **Arrow Keys** or **A/D**: Move left and right
- **Space** or **W** or **Up Arrow**: Jump
- **Restart Button**: Restart the game
- **Music Button**: Toggle background music on/off

## 🚀 Play the Game

You can play the game directly by opening `index.html` in your web browser, or visit the GitHub Pages version (link will be available after deployment).

## 🛠️ Technical Details

- Built with pure HTML5, CSS3, and JavaScript
- Uses Canvas API for rendering
- Algorithmically generated chip tune music using Web Audio API
- No external dependencies or frameworks required
- Responsive design with mobile-friendly layout

## 📦 Deployment to GitHub Pages

To deploy this game to GitHub Pages:

1. Go to your repository settings on GitHub
2. Navigate to the "Pages" section
3. Under "Source", select the branch you want to deploy (usually `main` or `master`)
4. Select the root directory (`/`) as the source folder
5. Click "Save"
6. Your game will be available at `https://<username>.github.io/<repository-name>/`

## 🎨 Game Elements

- **Resistors** (tan with brown bands): Basic platforms
- **Capacitors** (gray plates with gap): Platforms with gaps to jump over
- **Inductors** (red coils): Springy platforms that give you extra bounce
- **Lamps** (yellow bulbs): Glowing platforms
- **Ground** (dark blocks): Solid ground platforms
- **Battery** (green, glowing): The goal to reach

## 🏗️ File Structure

```
.
├── index.html    # Main HTML file
├── style.css     # Styling and layout
├── game.js       # Game logic and physics
├── music.js      # Chip tune music generator
└── README.md     # This file
```

## 🤝 Contributing

Feel free to fork this project and add your own levels, components, or features!

## 📝 License

This project is open source and available for anyone to use and modify.

---

Have fun playing and exploring the world of electronics! ⚡🎮
