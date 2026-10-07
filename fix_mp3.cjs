const fs = require('fs');

let content = fs.readFileSync('src/services/AudioService.ts', 'utf8');

content = content.replace(
  /if \(\['1f602', '1f61c', '1f973'\]\.includes\(emoji\)\) \{/,
  `if (['1f602', '1f61c', '1f973'].includes(emoji)) {
      const audio = new Audio('/sounds/laugh.mp3');
      audio.play().catch(() => {
`
).replace(
  /      \}\n    \} else if \(\['1f621', '1f92c'\]\.includes\(emoji\)\) \{/,
  `      });
    } else if (['1f621', '1f92c'].includes(emoji)) {
      const audio = new Audio('/sounds/angry.mp3');
      audio.play().catch(() => {
`
).replace(
  /      osc\.start\(now\); osc\.stop\(now \+ 0\.5\);\n    \} else if \(\['1f62d', '1f631'\]\.includes\(emoji\)\) \{/,
  `      osc.start(now); osc.stop(now + 0.5);
      });
    } else if (['1f62d', '1f631'].includes(emoji)) {
      const audio = new Audio('/sounds/cry.mp3');
      audio.play().catch(() => {
`
).replace(
  /      osc\.start\(now\); osc\.stop\(now \+ 0\.6\);\n    \} else \{/,
  `      osc.start(now); osc.stop(now + 0.6);
      });
    } else {
      const audio = new Audio('/sounds/wow.mp3');
      audio.play().catch(() => {
`
).replace(
  /      osc\.start\(now\); osc\.stop\(now \+ 0\.3\);\n    \}\n  \}\n\}/,
  `      osc.start(now); osc.stop(now + 0.3);
      });
    }
  }
}`
);

fs.writeFileSync('src/services/AudioService.ts', content, 'utf8');
