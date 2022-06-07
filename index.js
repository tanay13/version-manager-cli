#!/usr/bin/env node
const program = require("commander");
const { takeInputAndUpdate } = require("./commands/parseInput");

program
  .version("1.0.0")
  .alias("v")
  .description("CLI tool for dependency checks");

program
  .option("-u,--update", "update the version")
  .option("-i,--input <csvfile...>", "csv file and version")
  .description("take csv file and package version input")
  .action(async () => {
    const opt = program.opts();
    const csvfile = opt.input[0];
    const version = opt.input[1];
    if (opt.update === true) {
      await takeInputAndUpdate(csvfile, version, true);
    } else {
      await takeInputAndUpdate(csvfile, version, false);
    }
  });
program.parse(process.argv);
