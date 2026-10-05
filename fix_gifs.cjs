const fs = require('fs');

const EMOJIS = [
  { id: '1f602', char: '\u{1F602}' },
  { id: '1f621', char: '\u{1F621}' },
  { id: '1f62d', char: '\u{1F62D}' },
  { id: '1f929', char: '\u{1F929}' },
  { id: '1f44d', char: '\u{1F44D}' },
  { id: '1f44e', char: '\u{1F44E}' },
  { id: '1f973', char: '\u{1F973}' },
  { id: '1f631', char: '\u{1F631}' },
  { id: '1f92b', char: '\u{1F92B}' },
  { id: '1f60e', char: '\u{1F60E}' },
  { id: '1f61c', char: '\u{1F61C}' },
  { id: '1f92c', char: '\u{1F92C}' }
];

let modal = fs.readFileSync('src/components/modals/ChatModal.tsx', 'utf8');

const newEmojis = `const EMOJIS = [
  { id: '1f602', char: '\\u{1F602}' },
  { id: '1f621', char: '\\u{1F621}' },
  { id: '1f62d', char: '\\u{1F62D}' },
  { id: '1f929', char: '\\u{1F929}' },
  { id: '1f44d', char: '\\u{1F44D}' },
  { id: '1f44e', char: '\\u{1F44E}' },
  { id: '1f973', char: '\\u{1F973}' },
  { id: '1f631', char: '\\u{1F631}' },
  { id: '1f92b', char: '\\u{1F92B}' },
  { id: '1f60e', char: '\\u{1F60E}' },
  { id: '1f61c', char: '\\u{1F61C}' },
  { id: '1f92c', char: '\\u{1F92C}' }
];`;

modal = modal.replace(/const EMOJIS = \[.*?\];/s, newEmojis);
modal = modal.replace(
  /\{EMOJIS\.map\(emoji => \(\s*<button\s*key=\{emoji\}\s*onClick=\{.*?\}\s*className=".*?"\s*>\s*\{emoji\}\s*<\/button>\s*\)\)\}/s,
  `{EMOJIS.map(emoji => (
                <button
                  key={emoji.id}
                  onClick={() => { onSend(emoji.id, true); onClose(); }}
                  className="bg-slate-800/50 hover:bg-slate-700 border border-slate-700 rounded-xl p-2 transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
                >
                  <img src={\`https://fonts.gstatic.com/s/e/notoemoji/latest/\${emoji.id}/512.gif\`} alt={emoji.char} className="w-12 h-12" />
                </button>
              ))}`
);

fs.writeFileSync('src/components/modals/ChatModal.tsx', modal, 'utf8');

let engine = fs.readFileSync('src/game/GameEngine.ts', 'utf8');
engine = engine.replace(/emoji === '\\u\{1F602\}' \|\| emoji === '\\u\{1F61C\}' \|\| emoji === '\\u\{1F973\}'/g, "['1f602', '1f61c', '1f973'].includes(emoji)");
engine = engine.replace(/emoji === '\\u\{1F621\}' \|\| emoji === '\\u\{1F92C\}'/g, "['1f621', '1f92c'].includes(emoji)");
engine = engine.replace(/emoji === '\\u\{1F62D\}' \|\| emoji === '\\u\{1F631\}'/g, "['1f62d', '1f631'].includes(emoji)");
fs.writeFileSync('src/services/AudioService.ts', engine, 'utf8'); // Wait, I read GameEngine.ts but wrote AudioService.ts!

let audioService = fs.readFileSync('src/services/AudioService.ts', 'utf8');
audioService = audioService.replace(/emoji === '\\u\{1F602\}' \|\| emoji === '\\u\{1F61C\}' \|\| emoji === '\\u\{1F973\}'/g, "['1f602', '1f61c', '1f973'].includes(emoji)");
audioService = audioService.replace(/emoji === '\\u\{1F621\}' \|\| emoji === '\\u\{1F92C\}'/g, "['1f621', '1f92c'].includes(emoji)");
audioService = audioService.replace(/emoji === '\\u\{1F62D\}' \|\| emoji === '\\u\{1F631\}'/g, "['1f62d', '1f631'].includes(emoji)");
fs.writeFileSync('src/services/AudioService.ts', audioService, 'utf8');

let seat = fs.readFileSync('src/components/players/PlayerSeat.tsx', 'utf8');
seat = seat.replace(
  /<span className=\{\`text-slate-900 font-bold \$\{player\.activeChat\.isEmoji \? 'text-4xl inline-block ' \+ \(\[\'\\u\{1F602\}\',\'\\u\{1F61C\}\',\'\\u\{1F973\}\'\]\.includes\(player\.activeChat\.text\) \? 'emoji-laugh' : \[\'\\u\{1F621\}\',\'\\u\{1F92C\}\'\]\.includes\(player\.activeChat\.text\) \? 'emoji-angry' : \[\'\\u\{1F62D\}\',\'\\u\{1F631\}\'\]\.includes\(player\.activeChat\.text\) \? 'emoji-cry' : \[\'\\u\{1F929\}\',\'\\u\{1F60E\}\'\]\.includes\(player\.activeChat\.text\) \? 'emoji-wow' : 'emoji-default'\) : 'text-sm'\}\`\}>\s*\{player\.activeChat\.text\}\s*<\/span>/s,
  `{player.activeChat.isEmoji ? (
              <img src={\`https://fonts.gstatic.com/s/e/notoemoji/latest/\${player.activeChat.text}/512.gif\`} alt="emoji" className="w-16 h-16 drop-shadow-xl" />
            ) : (
              <span className="text-slate-900 font-bold text-sm">
                {player.activeChat.text}
              </span>
            )}`
);
fs.writeFileSync('src/components/players/PlayerSeat.tsx', seat, 'utf8');
