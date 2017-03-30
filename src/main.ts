import * as yargs from "yargs";
import { Fixer } from "./lib";
import { IProgramArguments } from "./abstract/program-arguments";

export async function main(args?: string[]) {

    const aux = yargs
        .epilog("Copyright 2017 - Diego Vilar (https://github.com/diegovilar)")
        .usage("Usage: fixmapsources [-v] [-s <search-regex>] -r <replacement> <input-glob>")
        .alias("s", "search")
            .default("s", '^(?:/|(?:/?\\.{1,2}/){0,})?src/')
            .describe("s", "Regular expression to search for")
        .alias("r", "replace")
            .describe("r", "Replacement string")
        .alias("v", "verbose")
        .alias("h", "help")
            .help("h")
        .demandOption(["replace"])
        .demandCommand(1);

    const ARGV: IProgramArguments = args ? aux.parse(args) : aux.argv;
    const FILES_PATTERN = ARGV._[0];
    const REPLACEMENT = ARGV.replace;
    const VERBOSE = ARGV.verbose;
    let searchPattern = new RegExp(ARGV.search);

    const fixer = new Fixer(VERBOSE);

    if (VERBOSE) {
        fixer.log(`Replacing /${searchPattern.source}/ for "${REPLACEMENT}" in ${FILES_PATTERN}`);
    }

    try {
        const files = await fixer.fixFiles(FILES_PATTERN, searchPattern, ARGV.replace);

        if (VERBOSE) {
            fixer.log(`${files.length} file(s) processed`);
        }
    }
    catch (reason) {
        fixer.logError(`${reason}`);
        process.exit(1);
    }

}

export default main;
