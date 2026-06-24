import { BackgroundImageConfig } from '../services/background-image.provider';

function bgStyle(bg?: BackgroundImageConfig): string {
  if (!bg?.enabled || !bg.dataUrl) {
    return '';
  }
  return `background-image:url(${bg.dataUrl});background-size:cover;background-position:center;`;
}

export function ApplePremium(
  title: string,
  content: string,
  isFirstFrame: boolean = false,
  bg?: BackgroundImageConfig,
) {
  const bgCss = bgStyle(bg);
  return `
<html>
<head><style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;800&display=swap');
</style></head>
<body style="margin:0;width:1080px;height:1920px;background-color:#000;${bgCss}display:flex;justify-content:center;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif;position:relative;overflow:hidden;">

<div style="position:absolute;inset:0;background:rgba(0,0,0,0.5);"></div>

<div style="width:88%;padding:80px 60px;background:rgba(255,255,255,0.08);backdrop-filter:blur(30px);-webkit-backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.12);border-radius:48px;text-align:center;position:relative;z-index:1;">

<div style="font-size:${isFirstFrame ? '100px' : '80px'};font-weight:800;line-height:1.1;color:white;letter-spacing:-3px;margin-bottom:40px;text-shadow:0 4px 20px rgba(0,0,0,0.5);">
${title}
</div>

${
  content
    ? `
<div style="font-size:58px;font-weight:500;line-height:1.55;color:rgba(255,255,255,0.9);text-shadow:0 2px 10px rgba(0,0,0,0.5);">
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
