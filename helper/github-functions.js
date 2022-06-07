require("dotenv").config({ path: __dirname + "/../.env" });
const { Octokit } = require("@octokit/core");

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// To fork the repo
async function forkRepo(owner, repo) {
  try {
    const response = await octokit.request(
      `POST /repos/${owner}/${repo}/forks`,
      {
        owner,
        repo,
      }
    );
    const defaultBranch = response.data.default_branch;
    const forkedOwner = response.data.owner.login;

    return {
      forkedOwner,
      defaultBranch,
    };
  } catch (e) {
    console.log(e);
  }
}

// fetching the content of package.json to check the version
async function getContent(owner, repo) {
  try {
    const response = await octokit.request(
      `GET /repos/${owner}/${repo}/contents/package.json`,
      {
        owner,
        repo,
        path: "./package.json",
      }
    );
    const sha = response.data.sha;
    const x = response.data.content.split("+");
    let s = "";
    for (let l of x) {
      let buff = new Buffer.from(l, "base64");
      let text = buff.toString("ascii");
      s += text;
    }

    const jsonData = JSON.parse(s);
    return { jsonData, sha };
  } catch (e) {
    console.log(e);
  }
}

// updating the version locally
async function updateVersion(
  jsonData,
  packageName,
  version,
  blobsha,
  owner,
  repo,
  defaultBranch
) {
  try {
    jsonData["dependencies"][packageName] = "^" + version;
    const text = JSON.stringify(jsonData, null, 2);

    let buff = new Buffer.from(text);
    let base64data = buff.toString("base64");

    // fetching the default branch sha
    const defSha = await octokit.request(
      `GET /repos/${owner}/${repo}/git/ref/heads/${defaultBranch}`,
      {
        owner,
        repo,
        ref: "heads/main",
      }
    );

    //creating new branch from the default branch
    await octokit.request(`POST /repos/${owner}/${repo}/git/refs`, {
      owner,
      repo,
      ref: "refs/heads/version-update",
      sha: defSha.data.object.sha,
    });

    // updatating package.json content in the version-update branch
    await octokit.request(`PUT /repos/${owner}/${repo}/contents/package.json`, {
      owner,
      repo,
      path: "package.json",
      message: "package version update",
      committer: {
        name: "Tanay Raj",
        email: "tanay.raj76@gmail.com",
      },
      content: base64data,
      sha: blobsha,
      branch: "version-update",
    });
  } catch (e) {
    console.log(e);
  }
}

//creating a PR for version update
async function createPR(owner, repo, forkedOwner, localBranch, defaultBranch) {
  const res = await octokit
    .request(`POST /repos/${owner}/${repo}/pulls`, {
      owner: forkedOwner,
      repo,
      title: "Version update",
      body: "Please update the changes by merging this PR!",
      head: forkedOwner + ":" + localBranch,
      base: defaultBranch,
    })
    .then()
    .catch((e) => {
      console.log(e);
    });

  return res.data.html_url;
}

module.exports = { forkRepo, getContent, updateVersion, createPR };
