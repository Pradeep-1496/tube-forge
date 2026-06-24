import { BackgroundImageConfig } from '../services/background-image.provider';

function bgStyle(bg?: BackgroundImageConfig): string {
  if (!bg?.enabled || !bg.dataUrl) {
    return '';
  }
  return `background-image:url(${bg.dataUrl});background-size:cover;background-position:center;`;
}

export function LuxuryGold(
  title: string,
  content: string,
  isFirstFrame: boolean = false,
  bg?: BackgroundImageConfig,
) {
  const bgCss = bgStyle(bg);
  return `
<html>
<head><style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap');
</style></head>
<body style="margin:0;width:1080px;height:1920px;background-color:#0f0f0f;${bgCss}display:flex;justify-content:center;align-items:center;font-family:Georgia,serif;position:relative;overflow:hidden;">

<div style="position:absolute;inset:0;background:rgba(15,15,15,0.5);"></div>

<div style="width:85%;padding:90px 60px;border:3px solid #d4af37;border-radius:30px;background:rgba(0,0,0,0.4);text-align:center;position:relative;z-index:1;box-shadow:0 0 60px rgba(212,175,55,0.2),inset 0 0 40px rgba(212,175,55,0.05);">

<div style="font-size:${isFirstFrame ? '95px' : '80px'};font-weight:700;color:#d4af37;line-height:1.2;margin-bottom:40px;text-shadow:0 0 20px rgba(212,175,55,0.5);">
${title}
</div>

${
  content
    ? `
<div style="font-size:58px;line-height:1.6;color:#f5f5f5;text-shadow:0 2px 8px rgba(0,0,0,0.6);">
${content}
</div>
`
    : ''
}

</div>

</body>
</html>
    `;
}
