
const getReportUrls = (reports) => {
  const results = [];
  const path = reports.path;
  delete reports.path; // removed for clean iteration

  for (let k in reports) {
    let {name, params} = reports[k];
    let url = encodeURI(path);
    url += name.split('/').map(el => encodeURIComponent(el)).join('/'); // encodeURIComponent(name);
    url += getParamsUrl(params);

    results.push(url);
  }

  reports.path = path;
  return results;
};

const getUrlPrefix = (login, rootdir) => {
  let urlprefix = 'http://';
  urlprefix += encodeURI(login.username);
  urlprefix += ':';
  urlprefix += encodeURI(login.password);
  urlprefix += '@';
  urlprefix += encodeURI(rootdir);
  return urlprefix;
};

const getParamsUrl = (params) => {
  let url = '';
  paramkeys = Object.keys(params);

  for (let i=0; i<paramkeys.length; i++) {
    let p = paramkeys[i];
    let param = params[p];

    i === 0 ? url += '?' : url += '&';
    url += p;
    if (param === 'IsNull') { // to pass (Null) to ssrs report params
      url += ':IsNull=True';
    } else {
      url += '=';
      url += encodeURIComponent(param);
    }
  }

  return url;
};

const util = {
  getParamsUrl,
  getUrlPrefix,
  getReportUrls
}

module.exports.util = util;