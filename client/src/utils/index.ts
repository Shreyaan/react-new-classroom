export const baseUrl = "https://reactnewclassroom.onrender.com";

export function htmlGenerator(html: string, css: string, js: string) {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Document</title>
      <style>
          ${css}
      </style>
  </head>
  <body>
      ${html}
      <script>
          ${js}
      </script>
  </body>
  </html>`;
}

export const handleRunCode = (
  outputRef: React.RefObject<HTMLIFrameElement>,
  code: string
) => {
  const iframe = outputRef.current;
  if (!iframe) return;
  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
  console.log(iframeDoc);

  iframeDoc?.open();
  iframeDoc?.write(code);
  iframeDoc?.close();
};
