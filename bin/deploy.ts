async function deploy() {
  if (!process.env.VERCEL_DEPLOY_HOOK) {
    console.log("VERCEL_DEPLOY_HOOK is not set");
    return;
  }

  const res = await fetch(process.env.VERCEL_DEPLOY_HOOK!, {
    method: "POST",
  });

  if (!res.ok) {
    console.log("Deploy failed ;(");
  }

  const data = await res.json();
  console.log(data);

  if (process.env.VERCEL_URL) {
    const url = process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`;
    console.log(`\nDeployment URL: ${url}`);
    console.log("Check the build progress at the URL above");
  }
}

deploy();
