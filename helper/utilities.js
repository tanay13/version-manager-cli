function urlParser(url) {
  const terms = url.split("/");
  const username = terms[3];
  const repoName = terms[4];
  return {
    username,
    repoName,
  };
}

// function to compare the version

function versionCompare(repoVersion, actualVersion) {
  const v = repoVersion.split("^");
  const v1 = v[1].split(".");

  const f1N = Number(v1[0]);
  const s1N = Number(v1[1]);
  const t1N = Number(v1[2]);

  const v2 = actualVersion.split(".");

  const f2N = Number(v2[0]);
  const s2N = Number(v2[1]);
  const t2N = Number(v2[2]);

  if (f1N < f2N) return false;
  if (s1N < s2N) return false;
  if (t1N < t2N) return false;

  return true;
}

module.exports = { urlParser, versionCompare };
