const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('单文件入口嵌入的脚本与源码一致', () => {
  const root=path.join(__dirname,'..');
  const bundle=fs.readFileSync(path.join(root,'单文件入口.html'),'utf8');
  const scripts=Array.from(bundle.matchAll(/<script>\s*([\s\S]*?)<\/script>/g), match => match[1].trim());
  assert.equal(scripts.length,3);
  ['core.js','sample-data.js','app.js'].forEach((name,i) => {
    assert.equal(scripts[i],fs.readFileSync(path.join(root,name),'utf8').trim(),name);
  });
});
