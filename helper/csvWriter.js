const createCsvWriter = require("csv-writer").createObjectCsvWriter;

async function csvWrite(data, csvfile) {
  const csvWriter = createCsvWriter({
    path: csvfile,
    header: [
      { id: "name", title: "name" },
      { id: "repo", title: "repo" },
      { id: "version", title: "version" },
      { id: "version_satisfied", title: "version_satisfied" },
      { id: "update_pr", title: "update_pr" },
    ],
  });

  csvWriter
    .writeRecords(data)
    .then(() => console.log("The CSV file was written successfully"));
}

module.exports = { csvWrite };
