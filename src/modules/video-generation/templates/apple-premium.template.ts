export function ApplePremium(title, content, isFirstFrame = false) {
  return `
<html>
<body style="margin:0;width:1080px;height:1920px;background:#000;display:flex;justify-content:center;align-items:center;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif;">

<div style="width:88%;padding:80px 60px;background:rgba(255,255,255,0.06);backdrop-filter:blur(30px);border:1px solid rgba(255,255,255,0.08);border-radius:48px;text-align:center;">

<div style="font-size:${isFirstFrame ? '100px' : '80px'};font-weight:800;line-height:1.1;color:white;letter-spacing:-3px;margin-bottom:40px;">
${title}
</div>

${
  content
    ? `
<div style="font-size:58px;font-weight:500;line-height:1.55;color:rgba(255,255,255,0.85);">
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
