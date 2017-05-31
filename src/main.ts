import * as yargs from "yargs";
import { Fixer } from "./lib";
import { IProgramArguments } from "./abstract/program-arguments";

const NON_REGEX_TEMPLATE = "^(?:/|(?:/?\\.{1,2}/){0,})?";

export async function main(args?: string[]) {

    const aux = yargs
        .epilog("Copyright 2017 - Diego Vilar (https://github.com/diegovilar)")
        .usage("Usage: fixmapsources [-v] [-rx] -s <search> -r <replacement> <input-glob>")
        .alias("rx", "regex")
            .describe("re", "Treats search term as a Regular Expression")
        .alias("s", "search")
        .describe("s", "Term to search for")
        .alias("r", "replace")
        .describe("r", "Replacement string")
        .alias("v", "verbose")
        .alias("h", "help")
        .help("h")
        .demandOption(["search", "replace"])
        .demandCommand(1);

    const ARGV: IProgramArguments = args ? aux.parse(args) : aux.argv;
    const FILES_PATTERN = ARGV._[0];
    const REPLACEMENT = ARGV.replace;
    const VERBOSE = ARGV.verbose;
    const REGEX = ARGV.regex;
    const SEARCH = ARGV.search;

    let pattern: RegExp;

    if (REGEX) {
        pattern = new RegExp(SEARCH);
    }
    else {
        pattern = new RegExp(NON_REGEX_TEMPLATE + SEARCH);
    }

    const fixer = new Fixer(VERBOSE);

    if (VERBOSE) {
        fixer.log(`Replacing /${pattern.source}/ for "${REPLACEMENT}" in ${FILES_PATTERN}`);
    }

    try {
        const files = await fixer.fixFiles(FILES_PATTERN, pattern, ARGV.replace);

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
