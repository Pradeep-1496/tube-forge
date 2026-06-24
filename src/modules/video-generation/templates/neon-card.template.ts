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
<head>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;700;800;900&display=swap');

*{
  box-sizing:border-box;
}

body{
  margin:0;
  width:1080px;
  height:1920px;
  font-family:'Inter',sans-serif;
  overflow:hidden;
}
</style>
</head>

<body style="
  background:#050505;
  ${bgCss}
  display:flex;
  justify-content:center;
  align-items:center;
  position:relative;
">

<div style="
  position:absolute;
  inset:0;
  background:rgba(0,0,0,0.55);
"></div>

<div style="
  position:relative;
  z-index:2;
  width:92%;
  border-radius:36px;
  overflow:hidden;
  backdrop-filter:blur(18px);
  background:rgba(15,15,15,0.45);
  border:1px solid rgba(255,255,255,0.08);
  box-shadow:
    0 30px 80px rgba(0,0,0,0.7),
    0 0 40px rgba(0,229,255,0.18);
">

  <div style="
    height:8px;
    background:linear-gradient(
      90deg,
      #00e5ff,
      #6a5cff,
      #00e5ff
    );
  "></div>

  <div style="
    padding:38px 42px;
    text-align:center;
  ">

    <div style="
      display:inline-block;
      padding:10px 24px;
      border-radius:999px;
      background:rgba(0,229,255,0.12);
      border:1px solid rgba(0,229,255,0.25);
      margin-bottom:20px;
      font-size:28px;
      font-weight:700;
      color:#8cf6ff;
      letter-spacing:3px;
      text-transform:uppercase;
    ">
      Trending
    </div>

    <div style="
      font-size:${isFirstFrame ? '94px' : '76px'};
      font-weight:900;
      line-height:1.05;
      letter-spacing:-3px;
      margin-bottom:${content ? '24px' : '0'};
      background:linear-gradient(
        180deg,
        #ffffff,
        #00e5ff
      );
      -webkit-background-clip:text;
      -webkit-text-fill-color:transparent;
      text-shadow:
        0 0 40px rgba(0,229,255,0.25);
    ">
      ${title}
    </div>

    ${
      content
        ? `
    <div style="
      font-size:54px;
      line-height:1.35;
      font-weight:600;
      color:rgba(255,255,255,0.96);
      text-shadow:
        0 4px 20px rgba(0,0,0,0.9);
    ">
      ${content}
    </div>
    `
        : ''
    }

  </div>

</div>

</body>
</html>
`;
}
