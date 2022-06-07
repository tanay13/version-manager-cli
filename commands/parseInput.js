const fs = require("fs");
const csv = require("csv-parser");
const { csvWrite } = require("../helper/csvWriter");
const { urlParser, versionCompare } = require("../helper/utilities");

const {
  forkRepo,
  getContent,
  updateVersion,
  createPR,
} = require("../helper/github-functions");

async function takeInputAndUpdate(csvfile, version, update) {
  const versionSplit = version.split("@");
  const packageName = versionSplit[0];
  const versionNumber = versionSplit[1];
  let data = [];
  await parseInput(csvfile, data);

  for (let row of data) {
    const { username, repoName } = urlParser(row.repo);

    const { jsonData, sha } = await getContent(username, repoName);

    row.version_satisfied = true;
    const rV = jsonData["dependencies"][packageName];
    if (rV === undefined) {
      console.log("No such package present");
      break;
    }
    row.version = rV.split("^")[1];
    if (!versionCompare(jsonData["dependencies"][packageName], versionNumber)) {
      row.version_satisfied = false;
    }
    if (update && row.version_satisfied === false) {
      const { forkedOwner, defaultBranch } = await forkRepo(username, repoName);

      await updateVersion(
        jsonData,
        packageName,
        versionNumber,
        sha,
        forkedOwner,
        repoName,
        defaultBranch
      );
      if (forkedOwner === username) continue;
      const res = await createPR(
        username,
        repoName,
        forkedOwner,
        "version-update",
        defaultBranch
      );
      row.update_pr = res;
    }
  }
  await csvWrite(data, csvfile);
}

// reads the csv file

async function parseInput(csvfile, data) {
  return new Promise(async (resolve, _) => {
    fs.createReadStream(csvfile)
      .pipe(csv())
      .on("data", async (row) => {
        data.push(row);
      })
      .on("end", () => {
        resolve();
        console.log("CSV file successfully processed");
      });
  });
}

module.exports = { parseInput, takeInputAndUpdate };
