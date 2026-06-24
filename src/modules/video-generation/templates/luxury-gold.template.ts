export function LuxuryGold(title, content, isFirstFrame = false) {
  return `
<html>
<body style="margin:0;width:1080px;height:1920px;background:#0f0f0f;display:flex;justify-content:center;align-items:center;font-family:Georgia,serif;">

<div style="width:85%;padding:90px 60px;border:3px solid #d4af37;border-radius:30px;background:rgba(255,255,255,0.03);text-align:center;">

<div style="font-size:${isFirstFrame ? '95px' : '80px'};font-weight:700;color:#d4af37;line-height:1.2;margin-bottom:40px;">
${title}
</div>

${
  content
    ? `
<div style="font-size:58px;line-height:1.6;color:#f5f5f5;">
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
