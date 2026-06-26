import { BackgroundImageConfig } from '../services/background-image.provider';

function bgStyle(bg?: BackgroundImageConfig): string {
  if (!bg?.enabled || !bg.dataUrl) {
    return '';
  }
  return `background-image:url(${bg.dataUrl});background-size:cover;background-position:center;`;
}

export function News(
  title: string,
  content: string,
  _isFirstFrame: boolean = false,
  bg?: BackgroundImageConfig,
) {
  const bgCss = bgStyle(bg);
  return `
<html>
<head><style>
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;800&display=swap');
</style></head>
<body style="margin:0;width:1080px;height:1920px;background-color:#111827;${bgCss}display:flex;justify-content:center;align-items:center;font-family:Poppins,sans-serif;overflow:hidden;position:relative;">

<div style="box-sizing: border-box; width: 1080px; height: 1920px; background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #09090b 100%); font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif; color: #ffffff; padding: 80px 60px; display: flex; flex-direction: column; justify-content: space-between; overflow: hidden; position: relative;">
  
  <!-- Decorative Top Cyber Line -->
  <div style="position: absolute; top: 0; left: 0; width: 100%; height: 12px; background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);"></div>

  <!-- HEADER SECTION -->
  <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
    <div style="display: flex; align-items: center; gap: 16px;">
      <div style="width: 24px; height: 24px; background: #3b82f6; border-radius: 6px; box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);"></div>
      <span style="font-size: 28px; font-weight: 700; letter-spacing: 2px; color: #94a3b8; text-transform: uppercase;">Tech Insights</span>
    </div>
    <span style="font-size: 24px; font-weight: 600; color: #3b82f6; background: rgba(59, 130, 246, 0.15); padding: 8px 20px; border-radius: 30px; border: 1px solid rgba(59, 130, 246, 0.3);">EP. 04</span>
  </div>

  <!-- MAIN VISUAL / CORE CONTENT -->
  <div style="flex-grow: 1; display: flex; flex-direction: column; justify-content: center; gap: 40px; margin-bottom: 80px;">
    
    <!-- Tag/Category -->
    <div style="align-self: flex-start; background: linear-gradient(90deg, #8b5cf6, #ec4899); padding: 12px 28px; border-radius: 50px; font-size: 26px; font-weight: 700; letter-spacing: 1px; box-shadow: 0 8px 20px rgba(139, 92, 246, 0.3);">
      THE ARCHITECTURE
    </div>

    <!-- Main Dynamic Title -->
    <h1 style="margin: 0; font-size: 84px; font-weight: 800; line-height: 1.1; letter-spacing: -2px; background: linear-gradient(to right, #ffffff, #cbd5e1); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
      ${title}
    </h1>

    <!-- Glassmorphic Card for the Explainer -->
    <div style="background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 32px; padding: 48px; box-shadow: 0 30px 60px rgba(0, 0, 0, 0.45);">
      <p style="margin: 0; font-size: 38px; line-height: 1.5; color: #e2e8f0; font-weight: 400;">
      ${content}  
      </p>
    </div>

  </div>

</div>

</body>
</html>
    `;
}
