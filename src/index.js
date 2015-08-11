
'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var NUM_CPUS = require('os').cpus().length;
var HIDDEN_FILE_RE = /^\./;
var APERTURE_FILE_EXT_RE =
  /\.(apfile|apmaster|apversion|apdb|apfolder|apalbum)$/i;
var DONT_CARE_RE = /\.(db|xml|plist)$/i;
var APERTURE_FOLDERS = new Set(['Previews', 'Thumbnails']);

class Extractor {

  constructor(base, dest) {
    this.base = base;
    assert(path.extname(base) === '.aplibrary', 'use with library');
    this.dest = dest;
    this.dirs = [];
    this.soulsaved = 0;
  }

  run() {
    console.time(process.argv[1]);
    this.dirs.push(this.base);
    while (this.dirs.length > 0) {
      let dir = this.dirs.pop();
      this.process(dir);
    }
    console.timeEnd(process.argv[1]);
    console.log('Rescued %d', this.soulsaved);
  }

  process(dir) {
    let contents = fs.readdirSync(dir);
    contents = contents.map(item => path.join(dir, item));
    for (let item of contents) {
      let stats = fs.statSync(item);
      if (stats.isDirectory()) {
        if (this.isWorthTraversing(item)) {
          this.dirs.push(item);
        }
      } else if (this.isWorthSaving(item)) {
        this.rescue(item);
      }
    }
  }

  rescue(item) {
    let ext = path.extname(item);
    this.soulsaved++;
    let destitem = path.join(this.dest, this.soulsaved + ext)
    console.log('cp %s to %s', item, destitem);
    fs.createReadStream(item).pipe(fs.createWriteStream(destitem));
  }

  isWorthTraversing(dirpath) {
    let dname = path.basename(dirpath);
    if (APERTURE_FOLDERS.has(dname)) {
      return false;
    }
    return true;
  }

  isWorthSaving(filepath) {
    let fname = path.basename(filepath);
    if (HIDDEN_FILE_RE.exec(fname)) {
      return false;
    } else if (APERTURE_FILE_EXT_RE.exec(path.extname(fname))) {
      return false;
    } else if (DONT_CARE_RE.exec(path.extname(fname))) {
      return false;
    }
    return true;
  }

}

if (require.main === module) {
  if (process.argv.length < 4) {
    console.error(
      'usage: %s <src library> <dst dir>',
      path.basename(process.argv[1])
    );
    process.exit(1);
  }
  let ee = new Extractor(process.argv[2], process.argv[3]);
  ee.run();
}
