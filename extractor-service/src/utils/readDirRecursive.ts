import fs from 'fs';
import path from 'node:path';

export default function readDirRecursive(dir:string, baseDir:string = dir) {
    let results: string[] = [];
    const list = fs.readdirSync(dir);

    list.forEach((file?:any) => {
        const filePath = path.join(dir, file);
        const stat = fs.lstatSync(filePath);

        if (stat && stat.isDirectory()) {
            results = results.concat(readDirRecursive(filePath, baseDir));
        } else {
            results.push(path.relative(baseDir, filePath));
        }
    });

    return results;
}

