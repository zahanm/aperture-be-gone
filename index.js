
'use strict';

var assert = require('assert');
var fs = require('fs');
var path = require('path');

var NUM_CPUS = require('os').cpus().length;

class Extractor {

  constructor(base, dest) {
    this.base = base;
    assert(path.extname(base) === '.aplibrary', 'use with library');
    this.dest = dest;
    this.dirs = []
  }

  process(dir) {
    let contents = fs.readdirSync(dir);
    contents = contents.map(function(item) { return path.join(dir, item); });
    for (let item of contents) {
      let stats = fs.statSync(item);
      if (stats.isDirectory()) {
        this.dirs.push(item);
      } else {
        console.log('cp %s to %s', item, this.dest);
      }
    }
  }

  run() {
    console.time(process.argv[1]);
    this.dirs.push(this.base);
    let ii = 0;
    while (this.dirs.length > 0) {
      let dir = this.dirs.pop();
      this.process(dir);
      if (ii > 10) {
        break;
      }
      ii++;
    }
    console.timeEnd(process.argv[1]);
  }

}

if (require.main === module) {
  if (process.argv.length < 4) {
    console.error('usage: %s <src library> <dst dir>', process.argv[1]);
    process.exit(1);
  }
  let ee = new Extractor(process.argv[2], process.argv[3]);
  ee.run();
}
