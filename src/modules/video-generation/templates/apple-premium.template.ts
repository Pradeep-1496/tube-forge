import { BackgroundImageConfig } from '../services/background-image.provider';

function bgStyle(bg?: BackgroundImageConfig): string {
  if (!bg?.enabled || !bg.dataUrl) {
    return '';
  }
  return `background-image:url(${bg.dataUrl});background-size:cover;background-position:center;`;
}

export function ApplePremium(
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
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            width: 1080px;
            height: 1920px;
            ${bgCss}
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-family: 'Roboto', sans-serif;
            position: relative;
            overflow: hidden;
            padding: 0;
          }
          
          body::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.4);
            z-index: 1;
          }
          
          .container {
            position: relative;
            width: 90%;
            height: 85%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            z-index: 5;
            overflow-y: auto;
            padding: 40px;
          }
          
          h1 {
            color: white;
            font-size: 72px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 50px;
            text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.9);
            line-height: 1.2;
          }
          
          p {
            color: rgba(255, 255, 255, 0.95);
            font-size: 48px;
            font-weight: 500;
            line-height: 1.8;
            margin-bottom: 25px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.9);
            word-wrap: break-word;
            max-width: 100%;
          }
          
          strong {
            color: #ffd700;
            font-weight: 700;
          }
        </style>
      </head>
      <body>
        <div class="container">
            <h1>Job Interview</h1>
<p><strong>Interviewer:</strong> What is your biggest strength?</p>
<p><strong>Candidate:</strong> I learn fast.</p>
<p><strong>Interviewer:</strong> Weakness?</p>
<p><strong>Candidate:</strong> I forget faster.</p>
<p><strong>Interviewer:</strong> What is your biggest strength?</p>
<p><strong>Candidate:</strong> I learn fast.</p>
<p><strong>Interviewer:</strong> Weakness?</p>
<p><strong>Candidate:</strong> I forget faster.</p>
          </div>
        
      </body>
      </html>
    `;
}
