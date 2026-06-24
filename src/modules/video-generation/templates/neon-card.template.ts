export function NeonCard(title, content, isFirstFrame = false) {
  return `
   <html>
<body style="margin:0;width:1080px;height:1920px;background:#050505;display:flex;justify-content:center;align-items:center;font-family:Inter,sans-serif;">

<div style="width:88%;padding:70px;border-radius:40px;background:#111;border:2px solid #00e5ff;box-shadow:0 0 40px rgba(0,229,255,0.3);text-align:center;">

<div style="font-size:${isFirstFrame ? '92px' : '76px'};font-weight:900;letter-spacing:-2px;color:#00e5ff;text-transform:uppercase;margin-bottom:35px;">
${title}
</div>

${
  content
    ? `
<div style="font-size:54px;line-height:1.5;color:white;">
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
