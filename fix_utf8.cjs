const fs = require('fs');

function fix(file, regex, rep) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(regex, rep);
  fs.writeFileSync(file, c, 'utf8');
}

fix('src/components/players/PlayerSeat.tsx', /text-4xl inline-block .*?'text-sm'/, "text-4xl inline-block ' + (['\\u{1F602}','\\u{1F61C}','\\u{1F973}'].includes(player.activeChat.text) ? 'emoji-laugh' : ['\\u{1F621}','\\u{1F92C}'].includes(player.activeChat.text) ? 'emoji-angry' : ['\\u{1F62D}','\\u{1F631}'].includes(player.activeChat.text) ? 'emoji-cry' : ['\\u{1F929}','\\u{1F60E}'].includes(player.activeChat.text) ? 'emoji-wow' : 'emoji-default') : 'text-sm'");

fix('src/components/modals/ChatModal.tsx', /const EMOJIS = \[.*?\];/, "const EMOJIS = ['\\u{1F602}', '\\u{1F621}', '\\u{1F62D}', '\\u{1F929}', '\\u{1F44D}', '\\u{1F44E}', '\\u{1F973}', '\\u{1F631}', '\\u{1F92B}', '\\u{1F60E}', '\\u{1F61C}', '\\u{1F92C}'];");
