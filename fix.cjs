const fs = require('fs');

function fixEmojis(file, regex, replacement) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(regex, replacement);
  fs.writeFileSync(file, c, 'utf8');
}

fixEmojis('src/components/modals/ChatModal.tsx', /const EMOJIS = \[.*?\];/, "const EMOJIS = ['😂', '😡', '😭', '🤩', '👍', '👎', '🥳', '😱', '🤫', '😎', '😜', '🤬'];");

let audioService = fs.readFileSync('src/services/AudioService.ts', 'utf8');
audioService = audioService.replace(/public playEmojiSound\(emoji: string\): void \{[\s\S]*?\}\s*\}/, `public playEmojiSound(emoji: string): void {
    if (!this.soundEnabled) return;
    const ctx = this.initContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    if (emoji === '😂' || emoji === '😜' || emoji === '🥳') {
      for(let i=0; i<4; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(600 + (i%2 * 200), now + i * 0.15);
        osc.frequency.exponentialRampToValueAtTime(800, now + i * 0.15 + 0.1);
        gain.gain.setValueAtTime(0.1, now + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.1);
        osc.connect(gain); gain.connect(this.mainGain);
        osc.start(now + i * 0.15); osc.stop(now + i * 0.15 + 0.1);
      }
    } else if (emoji === '😡' || emoji === '🤬') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
      osc.connect(gain); gain.connect(this.mainGain);
      osc.start(now); osc.stop(now + 0.5);
    } else if (emoji === '😭' || emoji === '😱') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(500, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.6);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.6);
      osc.connect(gain); gain.connect(this.mainGain);
      osc.start(now); osc.stop(now + 0.6);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.connect(gain); gain.connect(this.mainGain);
      osc.start(now); osc.stop(now + 0.3);
    }
  }`);
fs.writeFileSync('src/services/AudioService.ts', audioService, 'utf8');

let playerSeat = fs.readFileSync('src/components/players/PlayerSeat.tsx', 'utf8');
playerSeat = playerSeat.replace(/text-4xl inline-block .*?'text-sm'/, "text-4xl inline-block ' + (['😂','😜','🥳'].includes(player.activeChat.text) ? 'emoji-laugh' : ['😡','🤬'].includes(player.activeChat.text) ? 'emoji-angry' : ['😭','😱'].includes(player.activeChat.text) ? 'emoji-cry' : ['🤩','😎'].includes(player.activeChat.text) ? 'emoji-wow' : 'emoji-default') : 'text-sm'");
fs.writeFileSync('src/components/players/PlayerSeat.tsx', playerSeat, 'utf8');
