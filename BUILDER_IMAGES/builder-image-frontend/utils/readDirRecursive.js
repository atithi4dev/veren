const fs = require('fs');
const path = require('node:path');

function readDirRecursive(dir, baseDir = dir) {
    let results= [];
    const list = fs.readdirSync(dir);

    list.forEach((file) => {
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

module.exports = readDirRecursive
