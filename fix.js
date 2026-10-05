const fs = require('fs');

function fixEmojis(file, regex, replacement) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(regex, replacement);
  fs.writeFileSync(file, c, 'utf8');
}

fixEmojis('src/components/modals/ChatModal.tsx', /const EMOJIS = \[.*?\];/, "const EMOJIS = ['😂', '😡', '😭', '🤩', '👍', '👎', '🥳', '😱', '🤫', '😎', '😜', '🤬'];");

fixEmojis('src/services/AudioService.ts', /if \(emoji === '.*?' \|\| emoji === '.*?'\)/g, function(match) {
  if (match.includes("if (emoji === '") && !match.includes("||")) return match;
  return match; // We will just overwrite the whole function since it's easier.
});
