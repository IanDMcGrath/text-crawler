
const { Console } = require('console');
const fs = require('fs');

const crawler = (rootdir, searchFunc, filetypes) => {
  // recursively wander through folders, searching through selected filetypes, return dir and searchFunc

  const fileQueue = [];

  const rootfiles = fs.readdirSync(rootdir);
  // rootfiles.forEach(f => console.log(f));

  recursCrawl(rootdir, fileQueue, filetypes);
  // console.log(fileQueue);

  let matches = [];
  fileQueue.forEach((f,i) => {
    let file = fs.readFileSync(f, 'utf-8');
    let found = searchFunc(file);
    // if (found.length > 0) console.log(f.slice(rootdir.length+1).split('.')[0]);
    // found.forEach(el => {
    //   console.log(el);
    // });
    matches[i] = {path: f, params: found};
  });
  return matches;
};

const recursCrawl = (dir, fileQueue, filetypes) => {
  const files = fs.readdirSync(dir);
  files.forEach(f => {
    let isFolder = !f.includes('.');
    if (isFolder) {
      if (f !== 'SSRS') { // blacklist of SSRS folder
        recursCrawl(dir + '/' + f, fileQueue, filetypes);
      }
    } else {
      let type = f.split('.')[1].toString().trim();
      if (filetypes.has(type)) {
        fileQueue.push(dir + '/'  + f);
      }
    }
  });
}

const searchFunc = (search, captureChar) => {
  return (filetxt) => {
    let words = filetxt.split(search);
    words.shift();

    let found = words.map(txtblock => txtblock.split(captureChar)[1]);
    return found;
  }
}


const filetypes = new Set(['rdl', 'rds']);
const myfunc = searchFunc('ReportParameter Name=', `"`);
let rootdir = './../../Documents'

rootdir = './../../Documents/SSRS-new/SSRS-Reports/ORIG';
let res = crawler(rootdir, myfunc, filetypes);
console.log('captured ORIG');
rootdir = './../../Documents/SSRS-new/SSRS-Reports/DWH';
res = res.concat(crawler(rootdir, myfunc, filetypes));
console.log('captured DWH');
rootdir = './../../Documents/SSRS-new/SSRS-Reports/PCRS';
res = res.concat(crawler(rootdir, myfunc, filetypes));
console.log('captured PCRS');

let samenames = {};
res.forEach(el => {
  let len = el.path.split('/').length;
  let branch = el.path.split('/').slice(6,7);
  let comps = el.path.split('/');
  let subpath = el.path.split('/').slice(6, len-1).join('/');
  let name = comps[comps.length-1].split('.')[0];
  if (!samenames[name]) {
    samenames[name] = {name, params: {[branch]: el.params}, paths: {[branch]: subpath}};

  } else {
    samenames[name].params[branch] = el.params;
    samenames[name].paths[branch] = subpath;
  }
});

for (let rpt in samenames) {
  let r = samenames[rpt];

  let func = () => {
    let orig = new Set();
    r.params.ORIG.forEach(el => orig.add(el));
    for (let i=0; i<r.params.PCRS.length; i++) {
      // console.log(orig);
      // console.log('orig has: ' + r.params.PCRS[i] + '?: ' + Boolean(orig.has(r.params.PCRS[i])));
      if (!Boolean(orig.has(r.params.PCRS[i].toString()))) {
        return true;
      }
    }
    return false;
  };

  if (
    r.params.ORIG
    && r.params.PCRS
    && Boolean(func())
    ) {
    console.log('\n');
    delete samenames[rpt].params.DWH;
    delete samenames[rpt].paths.DWH;
    Object.values(samenames[rpt].paths).forEach(p => console.log(p));
    console.log(samenames[rpt].name);
    console.log(samenames[rpt].params);
  }
}