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

  /*
    job: {
    id: "B4ApVubg9E1DES17qQ8t",
    state: "PENDING",
    createdAt: 1746022973310,
  },
  */

  // need to loop until the job is deployed
}

deploy();
