const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const C = require('../core.js');
const fixture = JSON.parse(fs.readFileSync(require.resolve('./valid-import.json'), 'utf8'));

// Minimal DOM for import event tests; full rendering remains covered by ui-test.cjs.
function setup(options = {}) {
  const nodes = new Map(), readers = [], stored = new Map();
  function element() {
    return {_value:'', get value() { return this._value; }, set value(v) { this._value=String(v); }, checked:false, hidden:true, files:[], listeners:{}, children:[],
      addEventListener(type, fn) { this.listeners[type] = fn; },
      append(...nodes) { this.children.push(...nodes); this.lastChild = nodes.at(-1); },
      appendChild(node) { this.append(node); }, replaceChildren() { this.children = []; },
      focus() {}, reset() {}, scrollIntoView() {}};
  }
  const document = {getElementById(id) { if (!nodes.has(id)) nodes.set(id, element()); return nodes.get(id); }, createElement:element};
  document.getElementById('filter').value='all';
  const storage = {getItem:key => stored.get(key) || null, setItem:(key,value) => stored.set(key,value)};
  if (options.initial) stored.set('taskEffortLedger.v1',JSON.stringify(options.initial));
  vm.runInNewContext(fs.readFileSync(require.resolve('../app.js'), 'utf8'), {
    TaskEffortCore:{...C,MAX_TASKS:options.limit ?? C.MAX_TASKS}, document, localStorage:storage, location:{search:''}, URLSearchParams, Date:options.Date || Date,
    setTimeout() {}, FileReader:class { readAsText() { readers.push(this); } }
  });
  function fire(id, type) { const node = document.getElementById(id); node.listeners[type].call(node,{preventDefault() {}}); }
  return {
    nodes, stored, readers, fire, node:id => document.getElementById(id),
    select() { nodes.get('import-file').files = [{}]; fire('import-file', 'change'); return readers.at(-1); },
    complete(reader, raw = JSON.stringify(fixture)) { reader.result=raw; reader.onload(); }
  };
}

test('导入确认拒绝未保存草稿，重置后可以确认', () => {
  const app=setup(); app.complete(app.select());
  app.fire('task-form','input'); app.fire('import-confirm','click');
  assert.equal(app.stored.size,0); assert.match(app.nodes.get('form-error').textContent,/未保存/);
  assert.equal(app.nodes.get('import-panel').hidden,false);
  app.fire('reset-form','click'); app.fire('import-confirm','click');
  assert.equal(JSON.parse(app.stored.get('taskEffortLedger.v1')).tasks[0].name,fixture.tasks[0].name);
});

test('新文件作废旧预览，过期读取和取消后的读取不能重新显示预览', () => {
  const app=setup(); const first=app.select(), second=app.select();
  app.complete(second); app.complete(first,'invalid JSON');
  assert.equal(app.nodes.get('status')?.hidden ?? true,true);
  assert.equal(app.nodes.get('import-panel').hidden,false);
  const third=app.select(); assert.equal(app.nodes.get('import-panel').hidden,true);
  app.fire('import-confirm','click'); assert.equal(app.stored.size,0);
  app.complete(third); app.fire('import-cancel','click'); app.complete(third);
  assert.equal(app.nodes.get('import-panel').hidden,true);
});

test('读取失败显示错误且旧备份不可再确认', () => {
  const app=setup(); app.complete(app.select()); const reader=app.select();
  reader.onerror(); assert.match(app.nodes.get('status').textContent,/导入失败/);
  app.fire('import-confirm','click'); assert.equal(app.stored.size,0);
});

test('打开清空确认后开始的草稿会阻止破坏性操作', () => {
  const app=setup(); app.fire('clear-all','click'); app.fire('task-form','input'); app.fire('confirm-yes','click');
  assert.equal(app.stored.size,0); assert.match(app.nodes.get('form-error').textContent,/未保存/);
});

test('默认日期使用本地日历日而非 UTC 日期', () => {
  class LocalDate extends Date {
    getFullYear() { return 2026; } getMonth() { return 10; } getDate() { return 10; }
    toISOString() { return '2026-11-09T16:30:00.000Z'; }
  }
  assert.equal(setup({Date:LocalDate}).node('date').value,'2026-11-10');
});

test('录入上限与导入上限一致，拒绝新增但允许编辑', () => {
  const app=setup({initial:fixture,limit:1}); const before=app.stored.get('taskEffortLedger.v1');
  for (const id of ['name','type','model','acceptance']) app.node(id).value='新任务';
  app.node('outcome').value='passed'; app.fire('task-form','submit');
  assert.equal(app.stored.get('taskEffortLedger.v1'),before);
  assert.match(app.node('form-error').textContent,/上限/);
  const card=app.node('task-list').children[0];
  card.children[0].children[1].children[0].listeners.click();
  app.node('name').value='编辑现有任务'; app.fire('task-form','submit');
  assert.equal(JSON.parse(app.stored.get('taskEffortLedger.v1')).tasks[0].name,'编辑现有任务');
});
