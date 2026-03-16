import { readFileSync, writeFileSync } from 'fs';

const html = readFileSync('dist/index.html', 'utf-8');
const base64 = Buffer.from(html, 'utf-8').toString('base64');

const tistorySnippet = `<!-- 블록 팡! 게임 - 티스토리용 -->
<div style="width:100%;max-width:640px;margin:20px auto;font-family:'Segoe UI',sans-serif;">

<h2 style="text-align:center;font-size:2rem;margin-bottom:8px;">💥 블록 팡!</h2>
<p style="text-align:center;color:#888;font-size:1.05rem;margin-bottom:24px;">같은 색 블록을 모아서 터뜨리는 퍼즐 게임</p>

<iframe src="data:text/html;base64,${base64}" style="width:100%;height:750px;border:none;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);" scrolling="no" sandbox="allow-scripts allow-same-origin"></iframe>

<div style="margin-top:24px;padding:24px;background:#f8f8fa;border-radius:16px;line-height:1.8;font-size:0.95rem;color:#555;">
<h3 style="font-size:1.2rem;color:#333;margin-bottom:12px;">🎮 게임 방법</h3>
<p>👉 같은 색의 블록이 2개 이상 연결되어 있으면 클릭해서 한번에 터뜨릴 수 있어요!</p>
<p>👉 많이 모아서 한번에 터뜨릴수록 점수가 높아져요. (블록 수 × 블록 수 × 10점)</p>
<p>👉 블록 위에 마우스를 올리면 몇 개가 연결되어 있는지 미리 볼 수 있어요.</p>
<p>👉 더 이상 터뜨릴 블록이 없으면 게임 끝! 남은 블록이 적을수록 보너스 점수!</p>

<h3 style="font-size:1.2rem;color:#333;margin-top:20px;margin-bottom:12px;">⭐ 난이도</h3>
<table style="width:100%;border-collapse:collapse;text-align:center;font-size:0.9rem;">
<tr style="background:#eee;"><th style="padding:8px;">난이도</th><th style="padding:8px;">보드 크기</th><th style="padding:8px;">색상 수</th></tr>
<tr><td style="padding:8px;">🐣 쉬움</td><td style="padding:8px;">8×8</td><td style="padding:8px;">4가지</td></tr>
<tr style="background:#f4f4f6;"><td style="padding:8px;">🐥 보통</td><td style="padding:8px;">10×10</td><td style="padding:8px;">5가지</td></tr>
<tr><td style="padding:8px;">🦅 어려움</td><td style="padding:8px;">12×12</td><td style="padding:8px;">6가지</td></tr>
</table>

<h3 style="font-size:1.2rem;color:#333;margin-top:20px;margin-bottom:12px;">🏆 보너스 점수</h3>
<p>✨ 블록 0개 남김 (퍼펙트 클리어!) → +2,000점</p>
<p>✨ 1~5개 남김 → +500점</p>
<p>✨ 6~10개 남김 → +100점</p>
</div>

</div>`;

writeFileSync('dist/tistory.html', tistorySnippet, 'utf-8');

const sizeKB = (Buffer.byteLength(tistorySnippet) / 1024).toFixed(1);
console.log('✅ dist/tistory.html 생성 완료!');
console.log(`   크기: ${sizeKB}KB`);
