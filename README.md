# 4D Shape Viewer

An interactive visualization of four-dimensional geometric shapes projected into 3D space, rendered in the browser using Three.js.

## Shapes

| Shape | Vertices | Edges | Description |
|-------|----------|-------|-------------|
| **Tesseract** | 16 | 32 | 4D analog of a cube |
| **5-cell** | 5 | 10 | 4D analog of a tetrahedron (simplest 4D shape) |
| **16-cell** | 8 | 24 | 4D analog of an octahedron |
| **24-cell** | 24 | 96 | Unique to 4D, self-dual polytope |

## Controls

### Keyboard

| Key | Action |
|-----|--------|
| `Q` / `E` | Rotate in XY plane |
| `A` / `D` | Rotate in XZ plane |
| `W` / `S` | Rotate in XW plane (4th dimension) |
| `Z` / `C` | Rotate in YW plane |
| `R` / `F` | Rotate in ZW plane |
| `Space` | Toggle auto-rotation |

### Mouse

Click the shape buttons in the UI panel to switch between shapes.

## Usage

Open `4d-shapes.html` in any modern browser:

```bash
# Linux
xdg-open 4d-shapes.html

# macOS
open 4d-shapes.html

# Windows
start 4d-shapes.html
```

No build step or server required — it's a single self-contained HTML file.

## How It Works

1. **4D Vertices**: Each shape is defined by coordinates in 4D space (x, y, z, w)
2. **4D Rotation**: Rotations happen in 2D planes within 4D space (e.g., XW plane rotates between the X and W axes)
3. **Projection**: 4D coordinates are projected to 3D using perspective projection along the W axis
4. **Rendering**: Three.js draws the resulting 3D wireframe

## License

MIT
