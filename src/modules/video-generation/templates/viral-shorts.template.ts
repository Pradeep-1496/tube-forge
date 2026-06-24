export function ViralShorts(title, content, isFirstFrame = false) {
  return `
  <html>
<body style="margin:0;width:1080px;height:1920px;background:#18181b;display:flex;justify-content:center;align-items:center;font-family:Montserrat,sans-serif;">

<div style="width:92%;text-align:center;">

<div style="display:inline-block;padding:30px 50px;background:white;color:black;border-radius:25px;font-size:${isFirstFrame ? '85px' : '72px'};font-weight:900;line-height:1.2;margin-bottom:40px;">
${title}
</div>

${
  content
    ? `
<div style="display:inline-block;padding:40px 50px;background:rgba(255,255,255,0.1);backdrop-filter:blur(15px);border-radius:25px;color:white;font-size:56px;line-height:1.5;font-weight:700;">
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
