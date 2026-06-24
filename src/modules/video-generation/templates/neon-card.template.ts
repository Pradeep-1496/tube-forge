import { BackgroundImageConfig } from '../services/background-image.provider';

function bgStyle(bg?: BackgroundImageConfig): string {
  if (!bg?.enabled || !bg.dataUrl) {
    return '';
  }
  return `background-image:url(${bg.dataUrl});background-size:cover;background-position:center;`;
}

export function NeonCard(
  title: string,
  content: string,
  isFirstFrame: boolean = false,
  bg?: BackgroundImageConfig,
) {
  const bgCss = bgStyle(bg);
  return `
<html>
<head><style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@900&display=swap');
</style></head>
<body style="margin:0;width:1080px;height:1920px;background:#050505;${bgCss}display:flex;justify-content:center;align-items:center;font-family:Inter,sans-serif;position:relative;overflow:hidden;">

<div style="position:absolute;inset:0;background:rgba(5,5,5,0.6);"></div>

<div style="width:88%;padding:70px;border-radius:40px;background:rgba(0,0,0,0.55);border:2px solid #00e5ff;box-shadow:0 0 60px rgba(0,229,255,0.35),inset 0 0 30px rgba(0,229,255,0.1);text-align:center;position:relative;z-index:1;">

<div style="font-size:${isFirstFrame ? '92px' : '76px'};font-weight:900;letter-spacing:-2px;color:#00e5ff;text-transform:uppercase;margin-bottom:35px;text-shadow:0 0 30px rgba(0,229,255,0.5);">
${title}
</div>

${
  content
    ? `
<div style="font-size:54px;line-height:1.5;color:white;text-shadow:0 2px 10px rgba(0,0,0,0.8);">
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
