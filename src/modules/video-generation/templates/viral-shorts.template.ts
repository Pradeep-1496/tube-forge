import { BackgroundImageConfig } from '../services/background-image.provider';

function bgStyle(bg?: BackgroundImageConfig): string {
  if (!bg?.enabled || !bg.dataUrl) {
    return '';
  }
  return `background-image:url(${bg.dataUrl});background-size:cover;background-position:center;`;
}

export function ViralShorts(
  title: string,
  content: string,
  isFirstFrame: boolean = false,
  bg?: BackgroundImageConfig,
) {
  const bgCss = bgStyle(bg);
  return `
<html>
<head><style>
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=swap');
</style></head>
<body style="margin:0;width:1080px;height:1920px;background:#18181b;${bgCss}display:flex;justify-content:center;align-items:center;font-family:Montserrat,sans-serif;position:relative;overflow:hidden;">

<div style="position:absolute;inset:0;background:rgba(24,24,27,0.5);"></div>

<div style="width:92%;text-align:center;position:relative;z-index:1;">

${
  content
    ? `
<div style="display:inline-block;padding:30px 50px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border-radius:25px;font-size:${isFirstFrame ? '85px' : '72px'};font-weight:900;line-height:1.2;margin-bottom:40px;box-shadow:0 10px 40px rgba(99,102,241,0.4);">
${title}
</div>

<div style="margin-top:30px;display:inline-block;padding:40px 50px;background:rgba(255,255,255,0.12);backdrop-filter:blur(15px);-webkit-backdrop-filter:blur(15px);border-radius:25px;color:white;font-size:56px;line-height:1.5;font-weight:700;box-shadow:0 8px 30px rgba(0,0,0,0.3);">
${content}
</div>
`
    : `
<div style="display:inline-block;padding:40px 60px;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border-radius:30px;font-size:${isFirstFrame ? '85px' : '72px'};font-weight:900;line-height:1.2;box-shadow:0 10px 40px rgba(99,102,241,0.4);">
${title}
</div>
`
}

</div>

</body>
</html>
    `;
}

