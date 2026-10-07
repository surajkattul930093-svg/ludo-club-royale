const fs = require('fs');
let c = fs.readFileSync('src/components/board/GameBoard.tsx', 'utf8');
c = c.replace(/import \{ Token \} from '\.\.\/tokens\/Token';/, "import { Token } from '../tokens/Token';\nimport { ParticleBurst } from '../effects/ParticleBurst';");
c = c.replace(/\{tokens\.map\(\(token\) => \(/, `{explosions.map(e => { const p = getLogicalPosition(e.index); const pct = gridToScreenPercentage(p.r, p.c); return <ParticleBurst key={e.id} x={pct.x} y={pct.y} color={e.color} />; })}\n        {tokens.map((token) => (`);
fs.writeFileSync('src/components/board/GameBoard.tsx', c, 'utf8');
