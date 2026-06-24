import { BackgroundImageConfig } from '../services/background-image.provider';

function bgStyle(bg?: BackgroundImageConfig): string {
  if (!bg?.enabled || !bg.dataUrl) {
    return '';
  }
  return `background-image:url(${bg.dataUrl});background-size:cover;background-position:center;`;
}

export function Glassmorphism(
  title: string,
  content: string,
  isFirstFrame: boolean = false,
  bg?: BackgroundImageConfig,
) {
  const bgCss = bgStyle(bg);
  return `
<html>
<head><style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');
</style></head>
<body style="margin:0;width:1080px;height:1920px;background:#111827;${bgCss}display:flex;justify-content:center;align-items:center;font-family:Poppins,sans-serif;overflow:hidden;position:relative;">

<div style="position:absolute;inset:0;background:rgba(17,24,39,0.55);"></div>

<div style="width:85%;padding:80px 60px;background:rgba(255,255,255,0.1);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,0.2);border-radius:40px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.4);position:relative;z-index:1;">

<div style="font-size:${isFirstFrame ? '90px' : '75px'};font-weight:800;line-height:1.2;color:white;text-shadow:0 4px 20px rgba(0,0,0,0.5);margin-bottom:40px;">
${title}
</div>

${
  content
    ? `
<div style="font-size:56px;line-height:1.5;color:rgba(255,255,255,0.95);font-weight:500;">
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

