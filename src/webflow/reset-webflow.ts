export function resetWebflow() {
  const webflow = window.Webflow || [];
  if (webflow.length > 0) {
    webflow.forEach((wf) => {
      wf.destroy();
      wf.ready();
    });
  }

  console.log(webflow);
}
