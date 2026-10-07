const fs = require('fs');
let c = fs.readFileSync('src/game/GameEngine.ts', 'utf8');
c = c.replace(/private handleCapture\(targetPathIndex: number\): boolean \{([\s\S]*?)return captured;\n  \}/, `private handleCapture(targetPathIndex: number): boolean {$1
    if (captured) {
      const id = Math.random().toString();
      this.updateState({
        explosions: [...(this.state.explosions || []), { id, index: targetPathIndex, color: this.state.currentTurnColor }]
      });
      setTimeout(() => {
        if (this.isDestroyed) return;
        this.updateState({ explosions: (this.state.explosions || []).filter(e => e.id !== id) });
      }, 1000);
    }
    return captured;
  }`);
fs.writeFileSync('src/game/GameEngine.ts', c, 'utf8');
