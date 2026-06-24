export function Glassmorphism(
  title: string,
  content: string,
  isFirstFrame: boolean = false,
) {
  return `
    <html>
<body style="margin:0;width:1080px;height:1920px;background:#111827;display:flex;justify-content:center;align-items:center;font-family:Poppins,sans-serif;overflow:hidden;">

<div style="width:85%;padding:80px 60px;background:rgba(255,255,255,0.08);backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);border-radius:40px;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,0.4);">

<div style="font-size:${isFirstFrame ? '90px' : '75px'};font-weight:800;line-height:1.2;color:white;text-shadow:0 4px 20px rgba(0,0,0,0.4);margin-bottom:40px;">
${title}
</div>

${
  content
    ? `
<div style="font-size:56px;line-height:1.5;color:rgba(255,255,255,0.9);font-weight:500;">
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
