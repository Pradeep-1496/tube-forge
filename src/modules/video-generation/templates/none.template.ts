import { BackgroundImageConfig } from '../services/background-image.provider';

function bgStyle(bg?: BackgroundImageConfig): string {
  if (!bg?.enabled || !bg.dataUrl) {
    return '';
  }
  return `background-image:url(${bg.dataUrl});background-size:cover;background-position:center;`;
}

export function None(
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
<body style="margin:0;width:1080px;height:1920px;background-color:#111827;${bgCss}display:flex;justify-content:center;align-items:center;font-family:Poppins,sans-serif;overflow:hidden;position:relative;">



</body>
</html>
    `;
}
