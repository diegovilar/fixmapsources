import { ISourceMap } from "./abstract/sourcemap";
import * as glob from "glob";
import {
    readFileSync,
    writeFileSync
} from "fs";

export class Fixer {

    constructor (private verbose = false) {

    }

    public log(message: any): void {

        console.log(message);

    }

    public logError(reason: any): void {

        console.error(reason);

    }

    public logWarn(reason: any): void {

        console.warn(reason);

    }

    public fixSources(sources: string[], search: RegExp, replace: string): string[] {

        const results = sources.slice();

        for (let i = 0; i < results.length; i++) {
            results[i] = results[i].replace(search, replace);
        }

        return results;

    }

    public fixFile(file: string, search: RegExp, replace: string): void {

        const map: ISourceMap = JSON.parse(readFileSync(file, "utf8"));

        if (!map.sources || !map.sources.length) {
            return;
        }

        if (this.verbose) {
            this.logWarn(`Processing ${file}`);

            if (!map.sourcesContent) {
                this.logWarn(`${file}: sourcesContent no present`);
            }
            else if (map.sourcesContent.length !== map.sources.length) {
                this.logWarn(`${file}: sources and sourcesContent lenghts don't match (${map.sources.length}, ${map.sourcesContent.length})`);
            }
        }

        map.sources = this.fixSources(map.sources, search, replace);

        writeFileSync(file, JSON.stringify(map), {
            encoding: "utf8"
        });

    }

    public fixFiles(globPattern: string, search: RegExp, replace: string): Promise<string[]> {

        return new Promise<string[]>((resolve, reject) => {

            glob(globPattern, (error, files) => {

                const outputs: string[] = [];

                if (error) {
                    reject(error);
                    return;
                }

                try {
                    for (let file of files) {
                        this.fixFile(file, search, replace)
                    }

                    resolve(files);
                }
                catch (reason) {
                    reject(reason)
                }

            });

        });

    }

}

export default Fixer;
