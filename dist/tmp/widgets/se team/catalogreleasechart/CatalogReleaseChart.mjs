import { useRef, useState, useEffect, createElement } from 'react';

function ascending$1(a, b) {
  return a == null || b == null ? NaN : a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function descending(a, b) {
  return a == null || b == null ? NaN : b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}

function bisector(f) {
  let compare1, compare2, delta;

  // If an accessor is specified, promote it to a comparator. In this case we
  // can test whether the search value is (self-) comparable. We can’t do this
  // for a comparator (except for specific, known comparators) because we can’t
  // tell if the comparator is symmetric, and an asymmetric comparator can’t be
  // used to test whether a single value is comparable.
  if (f.length !== 2) {
    compare1 = ascending$1;
    compare2 = (d, x) => ascending$1(f(d), x);
    delta = (d, x) => f(d) - x;
  } else {
    compare1 = f === ascending$1 || f === descending ? f : zero$1;
    compare2 = f;
    delta = f;
  }
  function left(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x) < 0) lo = mid + 1;else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function right(a, x, lo = 0, hi = a.length) {
    if (lo < hi) {
      if (compare1(x, x) !== 0) return hi;
      do {
        const mid = lo + hi >>> 1;
        if (compare2(a[mid], x) <= 0) lo = mid + 1;else hi = mid;
      } while (lo < hi);
    }
    return lo;
  }
  function center(a, x, lo = 0, hi = a.length) {
    const i = left(a, x, lo, hi - 1);
    return i > lo && delta(a[i - 1], x) > -delta(a[i], x) ? i - 1 : i;
  }
  return {
    left,
    center,
    right
  };
}
function zero$1() {
  return 0;
}

function number$2(x) {
  return x === null ? NaN : +x;
}

const ascendingBisect = bisector(ascending$1);
const bisectRight = ascendingBisect.right;
bisector(number$2).center;
var bisect = bisectRight;

class InternMap extends Map {
  constructor(entries, key = keyof) {
    super();
    Object.defineProperties(this, {
      _intern: {
        value: new Map()
      },
      _key: {
        value: key
      }
    });
    if (entries != null) for (const [key, value] of entries) this.set(key, value);
  }
  get(key) {
    return super.get(intern_get(this, key));
  }
  has(key) {
    return super.has(intern_get(this, key));
  }
  set(key, value) {
    return super.set(intern_set(this, key), value);
  }
  delete(key) {
    return super.delete(intern_delete(this, key));
  }
}
function intern_get({
  _intern,
  _key
}, value) {
  const key = _key(value);
  return _intern.has(key) ? _intern.get(key) : value;
}
function intern_set({
  _intern,
  _key
}, value) {
  const key = _key(value);
  if (_intern.has(key)) return _intern.get(key);
  _intern.set(key, value);
  return value;
}
function intern_delete({
  _intern,
  _key
}, value) {
  const key = _key(value);
  if (_intern.has(key)) {
    value = _intern.get(key);
    _intern.delete(key);
  }
  return value;
}
function keyof(value) {
  return value !== null && typeof value === "object" ? value.valueOf() : value;
}

const e10 = Math.sqrt(50),
  e5 = Math.sqrt(10),
  e2 = Math.sqrt(2);
function tickSpec(start, stop, count) {
  const step = (stop - start) / Math.max(0, count),
    power = Math.floor(Math.log10(step)),
    error = step / Math.pow(10, power),
    factor = error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1;
  let i1, i2, inc;
  if (power < 0) {
    inc = Math.pow(10, -power) / factor;
    i1 = Math.round(start * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start) ++i1;
    if (i2 / inc > stop) --i2;
    inc = -inc;
  } else {
    inc = Math.pow(10, power) * factor;
    i1 = Math.round(start / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start) ++i1;
    if (i2 * inc > stop) --i2;
  }
  if (i2 < i1 && 0.5 <= count && count < 2) return tickSpec(start, stop, count * 2);
  return [i1, i2, inc];
}
function tickIncrement(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  return tickSpec(start, stop, count)[2];
}
function tickStep(start, stop, count) {
  stop = +stop, start = +start, count = +count;
  const reverse = stop < start,
    inc = reverse ? tickIncrement(stop, start, count) : tickIncrement(start, stop, count);
  return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
}

function range(start, stop, step) {
  start = +start, stop = +stop, step = (n = arguments.length) < 2 ? (stop = start, start = 0, 1) : n < 3 ? 1 : +step;
  var i = -1,
    n = Math.max(0, Math.ceil((stop - start) / step)) | 0,
    range = new Array(n);
  while (++i < n) {
    range[i] = start + i * step;
  }
  return range;
}

var noop = {
  value: () => {}
};
function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || t in _ || /[\s.]/.test(t)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}
function Dispatch(_) {
  this._ = _;
}
function parseTypenames$1(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function (t) {
    var name = "",
      i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return {
      type: t,
      name: name
    };
  });
}
Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function (typename, callback) {
    var _ = this._,
      T = parseTypenames$1(typename + "", _),
      t,
      i = -1,
      n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get$1(_[t], typename.name))) return t;
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
    }
    return this;
  },
  copy: function () {
    var copy = {},
      _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function (type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function (type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};
function get$1(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}
function set$1(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({
    name: name,
    value: callback
  });
  return type;
}

var xhtml = "http://www.w3.org/1999/xhtml";
var namespaces = {
  svg: "http://www.w3.org/2000/svg",
  xhtml: xhtml,
  xlink: "http://www.w3.org/1999/xlink",
  xml: "http://www.w3.org/XML/1998/namespace",
  xmlns: "http://www.w3.org/2000/xmlns/"
};

function namespace (name) {
  var prefix = name += "",
    i = prefix.indexOf(":");
  if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
  return namespaces.hasOwnProperty(prefix) ? {
    space: namespaces[prefix],
    local: name
  } : name; // eslint-disable-line no-prototype-builtins
}

function creatorInherit(name) {
  return function () {
    var document = this.ownerDocument,
      uri = this.namespaceURI;
    return uri === xhtml && document.documentElement.namespaceURI === xhtml ? document.createElement(name) : document.createElementNS(uri, name);
  };
}
function creatorFixed(fullname) {
  return function () {
    return this.ownerDocument.createElementNS(fullname.space, fullname.local);
  };
}
function creator (name) {
  var fullname = namespace(name);
  return (fullname.local ? creatorFixed : creatorInherit)(fullname);
}

function none() {}
function selector (selector) {
  return selector == null ? none : function () {
    return this.querySelector(selector);
  };
}

function selection_select (select) {
  if (typeof select !== "function") select = selector(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}

// Given something array like (or null), returns something that is strictly an
// array. This is used to ensure that array-like objects passed to d3.selectAll
// or selection.selectAll are converted into proper arrays when creating a
// selection; we don’t ever want to create a selection backed by a live
// HTMLCollection or NodeList. However, note that selection.selectAll will use a
// static NodeList as a group, since it safely derived from querySelectorAll.
function array(x) {
  return x == null ? [] : Array.isArray(x) ? x : Array.from(x);
}

function empty() {
  return [];
}
function selectorAll (selector) {
  return selector == null ? empty : function () {
    return this.querySelectorAll(selector);
  };
}

function arrayAll(select) {
  return function () {
    return array(select.apply(this, arguments));
  };
}
function selection_selectAll (select) {
  if (typeof select === "function") select = arrayAll(select);else select = selectorAll(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        subgroups.push(select.call(node, node.__data__, i, group));
        parents.push(node);
      }
    }
  }
  return new Selection$1(subgroups, parents);
}

function matcher (selector) {
  return function () {
    return this.matches(selector);
  };
}
function childMatcher(selector) {
  return function (node) {
    return node.matches(selector);
  };
}

var find = Array.prototype.find;
function childFind(match) {
  return function () {
    return find.call(this.children, match);
  };
}
function childFirst() {
  return this.firstElementChild;
}
function selection_selectChild (match) {
  return this.select(match == null ? childFirst : childFind(typeof match === "function" ? match : childMatcher(match)));
}

var filter = Array.prototype.filter;
function children() {
  return Array.from(this.children);
}
function childrenFilter(match) {
  return function () {
    return filter.call(this.children, match);
  };
}
function selection_selectChildren (match) {
  return this.selectAll(match == null ? children : childrenFilter(typeof match === "function" ? match : childMatcher(match)));
}

function selection_filter (match) {
  if (typeof match !== "function") match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Selection$1(subgroups, this._parents);
}

function sparse (update) {
  return new Array(update.length);
}

function selection_enter () {
  return new Selection$1(this._enter || this._groups.map(sparse), this._parents);
}
function EnterNode(parent, datum) {
  this.ownerDocument = parent.ownerDocument;
  this.namespaceURI = parent.namespaceURI;
  this._next = null;
  this._parent = parent;
  this.__data__ = datum;
}
EnterNode.prototype = {
  constructor: EnterNode,
  appendChild: function (child) {
    return this._parent.insertBefore(child, this._next);
  },
  insertBefore: function (child, next) {
    return this._parent.insertBefore(child, next);
  },
  querySelector: function (selector) {
    return this._parent.querySelector(selector);
  },
  querySelectorAll: function (selector) {
    return this._parent.querySelectorAll(selector);
  }
};

function constant$1 (x) {
  return function () {
    return x;
  };
}

function bindIndex(parent, group, enter, update, exit, data) {
  var i = 0,
    node,
    groupLength = group.length,
    dataLength = data.length;

  // Put any non-null nodes that fit into update.
  // Put any null nodes into enter.
  // Put any remaining data into enter.
  for (; i < dataLength; ++i) {
    if (node = group[i]) {
      node.__data__ = data[i];
      update[i] = node;
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Put any non-null nodes that don’t fit into exit.
  for (; i < groupLength; ++i) {
    if (node = group[i]) {
      exit[i] = node;
    }
  }
}
function bindKey(parent, group, enter, update, exit, data, key) {
  var i,
    node,
    nodeByKeyValue = new Map(),
    groupLength = group.length,
    dataLength = data.length,
    keyValues = new Array(groupLength),
    keyValue;

  // Compute the key for each node.
  // If multiple nodes have the same key, the duplicates are added to exit.
  for (i = 0; i < groupLength; ++i) {
    if (node = group[i]) {
      keyValues[i] = keyValue = key.call(node, node.__data__, i, group) + "";
      if (nodeByKeyValue.has(keyValue)) {
        exit[i] = node;
      } else {
        nodeByKeyValue.set(keyValue, node);
      }
    }
  }

  // Compute the key for each datum.
  // If there a node associated with this key, join and add it to update.
  // If there is not (or the key is a duplicate), add it to enter.
  for (i = 0; i < dataLength; ++i) {
    keyValue = key.call(parent, data[i], i, data) + "";
    if (node = nodeByKeyValue.get(keyValue)) {
      update[i] = node;
      node.__data__ = data[i];
      nodeByKeyValue.delete(keyValue);
    } else {
      enter[i] = new EnterNode(parent, data[i]);
    }
  }

  // Add any remaining nodes that were not bound to data to exit.
  for (i = 0; i < groupLength; ++i) {
    if ((node = group[i]) && nodeByKeyValue.get(keyValues[i]) === node) {
      exit[i] = node;
    }
  }
}
function datum(node) {
  return node.__data__;
}
function selection_data (value, key) {
  if (!arguments.length) return Array.from(this, datum);
  var bind = key ? bindKey : bindIndex,
    parents = this._parents,
    groups = this._groups;
  if (typeof value !== "function") value = constant$1(value);
  for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
    var parent = parents[j],
      group = groups[j],
      groupLength = group.length,
      data = arraylike(value.call(parent, parent && parent.__data__, j, parents)),
      dataLength = data.length,
      enterGroup = enter[j] = new Array(dataLength),
      updateGroup = update[j] = new Array(dataLength),
      exitGroup = exit[j] = new Array(groupLength);
    bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

    // Now connect the enter nodes to their following update node, such that
    // appendChild can insert the materialized enter node before this node,
    // rather than at the end of the parent node.
    for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
      if (previous = enterGroup[i0]) {
        if (i0 >= i1) i1 = i0 + 1;
        while (!(next = updateGroup[i1]) && ++i1 < dataLength);
        previous._next = next || null;
      }
    }
  }
  update = new Selection$1(update, parents);
  update._enter = enter;
  update._exit = exit;
  return update;
}

// Given some data, this returns an array-like view of it: an object that
// exposes a length property and allows numeric indexing. Note that unlike
// selectAll, this isn’t worried about “live” collections because the resulting
// array will only be used briefly while data is being bound. (It is possible to
// cause the data to change while iterating by using a key function, but please
// don’t; we’d rather avoid a gratuitous copy.)
function arraylike(data) {
  return typeof data === "object" && "length" in data ? data // Array, TypedArray, NodeList, array-like
  : Array.from(data); // Map, Set, iterable, string, or anything else
}

function selection_exit () {
  return new Selection$1(this._exit || this._groups.map(sparse), this._parents);
}

function selection_join (onenter, onupdate, onexit) {
  var enter = this.enter(),
    update = this,
    exit = this.exit();
  if (typeof onenter === "function") {
    enter = onenter(enter);
    if (enter) enter = enter.selection();
  } else {
    enter = enter.append(onenter + "");
  }
  if (onupdate != null) {
    update = onupdate(update);
    if (update) update = update.selection();
  }
  if (onexit == null) exit.remove();else onexit(exit);
  return enter && update ? enter.merge(update).order() : update;
}

function selection_merge (context) {
  var selection = context.selection ? context.selection() : context;
  for (var groups0 = this._groups, groups1 = selection._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Selection$1(merges, this._parents);
}

function selection_order () {
  for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
    for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
      if (node = group[i]) {
        if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
        next = node;
      }
    }
  }
  return this;
}

function selection_sort (compare) {
  if (!compare) compare = ascending;
  function compareNode(a, b) {
    return a && b ? compare(a.__data__, b.__data__) : !a - !b;
  }
  for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        sortgroup[i] = node;
      }
    }
    sortgroup.sort(compareNode);
  }
  return new Selection$1(sortgroups, this._parents).order();
}
function ascending(a, b) {
  return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
}

function selection_call () {
  var callback = arguments[0];
  arguments[0] = this;
  callback.apply(null, arguments);
  return this;
}

function selection_nodes () {
  return Array.from(this);
}

function selection_node () {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
      var node = group[i];
      if (node) return node;
    }
  }
  return null;
}

function selection_size () {
  let size = 0;
  for (const node of this) ++size; // eslint-disable-line no-unused-vars
  return size;
}

function selection_empty () {
  return !this.node();
}

function selection_each (callback) {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) callback.call(node, node.__data__, i, group);
    }
  }
  return this;
}

function attrRemove$1(name) {
  return function () {
    this.removeAttribute(name);
  };
}
function attrRemoveNS$1(fullname) {
  return function () {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant$1(name, value) {
  return function () {
    this.setAttribute(name, value);
  };
}
function attrConstantNS$1(fullname, value) {
  return function () {
    this.setAttributeNS(fullname.space, fullname.local, value);
  };
}
function attrFunction$1(name, value) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttribute(name);else this.setAttribute(name, v);
  };
}
function attrFunctionNS$1(fullname, value) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) this.removeAttributeNS(fullname.space, fullname.local);else this.setAttributeNS(fullname.space, fullname.local, v);
  };
}
function selection_attr (name, value) {
  var fullname = namespace(name);
  if (arguments.length < 2) {
    var node = this.node();
    return fullname.local ? node.getAttributeNS(fullname.space, fullname.local) : node.getAttribute(fullname);
  }
  return this.each((value == null ? fullname.local ? attrRemoveNS$1 : attrRemove$1 : typeof value === "function" ? fullname.local ? attrFunctionNS$1 : attrFunction$1 : fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, value));
}

function defaultView (node) {
  return node.ownerDocument && node.ownerDocument.defaultView // node is a Node
  || node.document && node // node is a Window
  || node.defaultView; // node is a Document
}

function styleRemove$1(name) {
  return function () {
    this.style.removeProperty(name);
  };
}
function styleConstant$1(name, value, priority) {
  return function () {
    this.style.setProperty(name, value, priority);
  };
}
function styleFunction$1(name, value, priority) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) this.style.removeProperty(name);else this.style.setProperty(name, v, priority);
  };
}
function selection_style (name, value, priority) {
  return arguments.length > 1 ? this.each((value == null ? styleRemove$1 : typeof value === "function" ? styleFunction$1 : styleConstant$1)(name, value, priority == null ? "" : priority)) : styleValue(this.node(), name);
}
function styleValue(node, name) {
  return node.style.getPropertyValue(name) || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
}

function propertyRemove(name) {
  return function () {
    delete this[name];
  };
}
function propertyConstant(name, value) {
  return function () {
    this[name] = value;
  };
}
function propertyFunction(name, value) {
  return function () {
    var v = value.apply(this, arguments);
    if (v == null) delete this[name];else this[name] = v;
  };
}
function selection_property (name, value) {
  return arguments.length > 1 ? this.each((value == null ? propertyRemove : typeof value === "function" ? propertyFunction : propertyConstant)(name, value)) : this.node()[name];
}

function classArray(string) {
  return string.trim().split(/^|\s+/);
}
function classList(node) {
  return node.classList || new ClassList(node);
}
function ClassList(node) {
  this._node = node;
  this._names = classArray(node.getAttribute("class") || "");
}
ClassList.prototype = {
  add: function (name) {
    var i = this._names.indexOf(name);
    if (i < 0) {
      this._names.push(name);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  remove: function (name) {
    var i = this._names.indexOf(name);
    if (i >= 0) {
      this._names.splice(i, 1);
      this._node.setAttribute("class", this._names.join(" "));
    }
  },
  contains: function (name) {
    return this._names.indexOf(name) >= 0;
  }
};
function classedAdd(node, names) {
  var list = classList(node),
    i = -1,
    n = names.length;
  while (++i < n) list.add(names[i]);
}
function classedRemove(node, names) {
  var list = classList(node),
    i = -1,
    n = names.length;
  while (++i < n) list.remove(names[i]);
}
function classedTrue(names) {
  return function () {
    classedAdd(this, names);
  };
}
function classedFalse(names) {
  return function () {
    classedRemove(this, names);
  };
}
function classedFunction(names, value) {
  return function () {
    (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
  };
}
function selection_classed (name, value) {
  var names = classArray(name + "");
  if (arguments.length < 2) {
    var list = classList(this.node()),
      i = -1,
      n = names.length;
    while (++i < n) if (!list.contains(names[i])) return false;
    return true;
  }
  return this.each((typeof value === "function" ? classedFunction : value ? classedTrue : classedFalse)(names, value));
}

function textRemove() {
  this.textContent = "";
}
function textConstant$1(value) {
  return function () {
    this.textContent = value;
  };
}
function textFunction$1(value) {
  return function () {
    var v = value.apply(this, arguments);
    this.textContent = v == null ? "" : v;
  };
}
function selection_text (value) {
  return arguments.length ? this.each(value == null ? textRemove : (typeof value === "function" ? textFunction$1 : textConstant$1)(value)) : this.node().textContent;
}

function htmlRemove() {
  this.innerHTML = "";
}
function htmlConstant(value) {
  return function () {
    this.innerHTML = value;
  };
}
function htmlFunction(value) {
  return function () {
    var v = value.apply(this, arguments);
    this.innerHTML = v == null ? "" : v;
  };
}
function selection_html (value) {
  return arguments.length ? this.each(value == null ? htmlRemove : (typeof value === "function" ? htmlFunction : htmlConstant)(value)) : this.node().innerHTML;
}

function raise() {
  if (this.nextSibling) this.parentNode.appendChild(this);
}
function selection_raise () {
  return this.each(raise);
}

function lower() {
  if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
}
function selection_lower () {
  return this.each(lower);
}

function selection_append (name) {
  var create = typeof name === "function" ? name : creator(name);
  return this.select(function () {
    return this.appendChild(create.apply(this, arguments));
  });
}

function constantNull() {
  return null;
}
function selection_insert (name, before) {
  var create = typeof name === "function" ? name : creator(name),
    select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
  return this.select(function () {
    return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
  });
}

function remove() {
  var parent = this.parentNode;
  if (parent) parent.removeChild(this);
}
function selection_remove () {
  return this.each(remove);
}

function selection_cloneShallow() {
  var clone = this.cloneNode(false),
    parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_cloneDeep() {
  var clone = this.cloneNode(true),
    parent = this.parentNode;
  return parent ? parent.insertBefore(clone, this.nextSibling) : clone;
}
function selection_clone (deep) {
  return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
}

function selection_datum (value) {
  return arguments.length ? this.property("__data__", value) : this.node().__data__;
}

function contextListener(listener) {
  return function (event) {
    listener.call(this, event, this.__data__);
  };
}
function parseTypenames(typenames) {
  return typenames.trim().split(/^|\s+/).map(function (t) {
    var name = "",
      i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    return {
      type: t,
      name: name
    };
  });
}
function onRemove(typename) {
  return function () {
    var on = this.__on;
    if (!on) return;
    for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
      if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
      } else {
        on[++i] = o;
      }
    }
    if (++i) on.length = i;else delete this.__on;
  };
}
function onAdd(typename, value, options) {
  return function () {
    var on = this.__on,
      o,
      listener = contextListener(value);
    if (on) for (var j = 0, m = on.length; j < m; ++j) {
      if ((o = on[j]).type === typename.type && o.name === typename.name) {
        this.removeEventListener(o.type, o.listener, o.options);
        this.addEventListener(o.type, o.listener = listener, o.options = options);
        o.value = value;
        return;
      }
    }
    this.addEventListener(typename.type, listener, options);
    o = {
      type: typename.type,
      name: typename.name,
      value: value,
      listener: listener,
      options: options
    };
    if (!on) this.__on = [o];else on.push(o);
  };
}
function selection_on (typename, value, options) {
  var typenames = parseTypenames(typename + ""),
    i,
    n = typenames.length,
    t;
  if (arguments.length < 2) {
    var on = this.node().__on;
    if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
      for (i = 0, o = on[j]; i < n; ++i) {
        if ((t = typenames[i]).type === o.type && t.name === o.name) {
          return o.value;
        }
      }
    }
    return;
  }
  on = value ? onAdd : onRemove;
  for (i = 0; i < n; ++i) this.each(on(typenames[i], value, options));
  return this;
}

function dispatchEvent(node, type, params) {
  var window = defaultView(node),
    event = window.CustomEvent;
  if (typeof event === "function") {
    event = new event(type, params);
  } else {
    event = window.document.createEvent("Event");
    if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;else event.initEvent(type, false, false);
  }
  node.dispatchEvent(event);
}
function dispatchConstant(type, params) {
  return function () {
    return dispatchEvent(this, type, params);
  };
}
function dispatchFunction(type, params) {
  return function () {
    return dispatchEvent(this, type, params.apply(this, arguments));
  };
}
function selection_dispatch (type, params) {
  return this.each((typeof params === "function" ? dispatchFunction : dispatchConstant)(type, params));
}

function* selection_iterator () {
  for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
    for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
      if (node = group[i]) yield node;
    }
  }
}

var root = [null];
function Selection$1(groups, parents) {
  this._groups = groups;
  this._parents = parents;
}
function selection() {
  return new Selection$1([[document.documentElement]], root);
}
function selection_selection() {
  return this;
}
Selection$1.prototype = selection.prototype = {
  constructor: Selection$1,
  select: selection_select,
  selectAll: selection_selectAll,
  selectChild: selection_selectChild,
  selectChildren: selection_selectChildren,
  filter: selection_filter,
  data: selection_data,
  enter: selection_enter,
  exit: selection_exit,
  join: selection_join,
  merge: selection_merge,
  selection: selection_selection,
  order: selection_order,
  sort: selection_sort,
  call: selection_call,
  nodes: selection_nodes,
  node: selection_node,
  size: selection_size,
  empty: selection_empty,
  each: selection_each,
  attr: selection_attr,
  style: selection_style,
  property: selection_property,
  classed: selection_classed,
  text: selection_text,
  html: selection_html,
  raise: selection_raise,
  lower: selection_lower,
  append: selection_append,
  insert: selection_insert,
  remove: selection_remove,
  clone: selection_clone,
  datum: selection_datum,
  on: selection_on,
  dispatch: selection_dispatch,
  [Symbol.iterator]: selection_iterator
};

function select (selector) {
  return typeof selector === "string" ? new Selection$1([[document.querySelector(selector)]], [document.documentElement]) : new Selection$1([[selector]], root);
}

function define (constructor, factory, prototype) {
  constructor.prototype = factory.prototype = prototype;
  prototype.constructor = constructor;
}
function extend(parent, definition) {
  var prototype = Object.create(parent.prototype);
  for (var key in definition) prototype[key] = definition[key];
  return prototype;
}

function Color() {}
var darker = 0.7;
var brighter = 1 / darker;
var reI = "\\s*([+-]?\\d+)\\s*",
  reN = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)\\s*",
  reP = "\\s*([+-]?(?:\\d*\\.)?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
  reHex = /^#([0-9a-f]{3,8})$/,
  reRgbInteger = new RegExp(`^rgb\\(${reI},${reI},${reI}\\)$`),
  reRgbPercent = new RegExp(`^rgb\\(${reP},${reP},${reP}\\)$`),
  reRgbaInteger = new RegExp(`^rgba\\(${reI},${reI},${reI},${reN}\\)$`),
  reRgbaPercent = new RegExp(`^rgba\\(${reP},${reP},${reP},${reN}\\)$`),
  reHslPercent = new RegExp(`^hsl\\(${reN},${reP},${reP}\\)$`),
  reHslaPercent = new RegExp(`^hsla\\(${reN},${reP},${reP},${reN}\\)$`);
var named = {
  aliceblue: 0xf0f8ff,
  antiquewhite: 0xfaebd7,
  aqua: 0x00ffff,
  aquamarine: 0x7fffd4,
  azure: 0xf0ffff,
  beige: 0xf5f5dc,
  bisque: 0xffe4c4,
  black: 0x000000,
  blanchedalmond: 0xffebcd,
  blue: 0x0000ff,
  blueviolet: 0x8a2be2,
  brown: 0xa52a2a,
  burlywood: 0xdeb887,
  cadetblue: 0x5f9ea0,
  chartreuse: 0x7fff00,
  chocolate: 0xd2691e,
  coral: 0xff7f50,
  cornflowerblue: 0x6495ed,
  cornsilk: 0xfff8dc,
  crimson: 0xdc143c,
  cyan: 0x00ffff,
  darkblue: 0x00008b,
  darkcyan: 0x008b8b,
  darkgoldenrod: 0xb8860b,
  darkgray: 0xa9a9a9,
  darkgreen: 0x006400,
  darkgrey: 0xa9a9a9,
  darkkhaki: 0xbdb76b,
  darkmagenta: 0x8b008b,
  darkolivegreen: 0x556b2f,
  darkorange: 0xff8c00,
  darkorchid: 0x9932cc,
  darkred: 0x8b0000,
  darksalmon: 0xe9967a,
  darkseagreen: 0x8fbc8f,
  darkslateblue: 0x483d8b,
  darkslategray: 0x2f4f4f,
  darkslategrey: 0x2f4f4f,
  darkturquoise: 0x00ced1,
  darkviolet: 0x9400d3,
  deeppink: 0xff1493,
  deepskyblue: 0x00bfff,
  dimgray: 0x696969,
  dimgrey: 0x696969,
  dodgerblue: 0x1e90ff,
  firebrick: 0xb22222,
  floralwhite: 0xfffaf0,
  forestgreen: 0x228b22,
  fuchsia: 0xff00ff,
  gainsboro: 0xdcdcdc,
  ghostwhite: 0xf8f8ff,
  gold: 0xffd700,
  goldenrod: 0xdaa520,
  gray: 0x808080,
  green: 0x008000,
  greenyellow: 0xadff2f,
  grey: 0x808080,
  honeydew: 0xf0fff0,
  hotpink: 0xff69b4,
  indianred: 0xcd5c5c,
  indigo: 0x4b0082,
  ivory: 0xfffff0,
  khaki: 0xf0e68c,
  lavender: 0xe6e6fa,
  lavenderblush: 0xfff0f5,
  lawngreen: 0x7cfc00,
  lemonchiffon: 0xfffacd,
  lightblue: 0xadd8e6,
  lightcoral: 0xf08080,
  lightcyan: 0xe0ffff,
  lightgoldenrodyellow: 0xfafad2,
  lightgray: 0xd3d3d3,
  lightgreen: 0x90ee90,
  lightgrey: 0xd3d3d3,
  lightpink: 0xffb6c1,
  lightsalmon: 0xffa07a,
  lightseagreen: 0x20b2aa,
  lightskyblue: 0x87cefa,
  lightslategray: 0x778899,
  lightslategrey: 0x778899,
  lightsteelblue: 0xb0c4de,
  lightyellow: 0xffffe0,
  lime: 0x00ff00,
  limegreen: 0x32cd32,
  linen: 0xfaf0e6,
  magenta: 0xff00ff,
  maroon: 0x800000,
  mediumaquamarine: 0x66cdaa,
  mediumblue: 0x0000cd,
  mediumorchid: 0xba55d3,
  mediumpurple: 0x9370db,
  mediumseagreen: 0x3cb371,
  mediumslateblue: 0x7b68ee,
  mediumspringgreen: 0x00fa9a,
  mediumturquoise: 0x48d1cc,
  mediumvioletred: 0xc71585,
  midnightblue: 0x191970,
  mintcream: 0xf5fffa,
  mistyrose: 0xffe4e1,
  moccasin: 0xffe4b5,
  navajowhite: 0xffdead,
  navy: 0x000080,
  oldlace: 0xfdf5e6,
  olive: 0x808000,
  olivedrab: 0x6b8e23,
  orange: 0xffa500,
  orangered: 0xff4500,
  orchid: 0xda70d6,
  palegoldenrod: 0xeee8aa,
  palegreen: 0x98fb98,
  paleturquoise: 0xafeeee,
  palevioletred: 0xdb7093,
  papayawhip: 0xffefd5,
  peachpuff: 0xffdab9,
  peru: 0xcd853f,
  pink: 0xffc0cb,
  plum: 0xdda0dd,
  powderblue: 0xb0e0e6,
  purple: 0x800080,
  rebeccapurple: 0x663399,
  red: 0xff0000,
  rosybrown: 0xbc8f8f,
  royalblue: 0x4169e1,
  saddlebrown: 0x8b4513,
  salmon: 0xfa8072,
  sandybrown: 0xf4a460,
  seagreen: 0x2e8b57,
  seashell: 0xfff5ee,
  sienna: 0xa0522d,
  silver: 0xc0c0c0,
  skyblue: 0x87ceeb,
  slateblue: 0x6a5acd,
  slategray: 0x708090,
  slategrey: 0x708090,
  snow: 0xfffafa,
  springgreen: 0x00ff7f,
  steelblue: 0x4682b4,
  tan: 0xd2b48c,
  teal: 0x008080,
  thistle: 0xd8bfd8,
  tomato: 0xff6347,
  turquoise: 0x40e0d0,
  violet: 0xee82ee,
  wheat: 0xf5deb3,
  white: 0xffffff,
  whitesmoke: 0xf5f5f5,
  yellow: 0xffff00,
  yellowgreen: 0x9acd32
};
define(Color, color, {
  copy(channels) {
    return Object.assign(new this.constructor(), this, channels);
  },
  displayable() {
    return this.rgb().displayable();
  },
  hex: color_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: color_formatHex,
  formatHex8: color_formatHex8,
  formatHsl: color_formatHsl,
  formatRgb: color_formatRgb,
  toString: color_formatRgb
});
function color_formatHex() {
  return this.rgb().formatHex();
}
function color_formatHex8() {
  return this.rgb().formatHex8();
}
function color_formatHsl() {
  return hslConvert(this).formatHsl();
}
function color_formatRgb() {
  return this.rgb().formatRgb();
}
function color(format) {
  var m, l;
  format = (format + "").trim().toLowerCase();
  return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
  : l === 3 ? new Rgb(m >> 8 & 0xf | m >> 4 & 0xf0, m >> 4 & 0xf | m & 0xf0, (m & 0xf) << 4 | m & 0xf, 1) // #f00
  : l === 8 ? rgba(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
  : l === 4 ? rgba(m >> 12 & 0xf | m >> 8 & 0xf0, m >> 8 & 0xf | m >> 4 & 0xf0, m >> 4 & 0xf | m & 0xf0, ((m & 0xf) << 4 | m & 0xf) / 0xff) // #f000
  : null // invalid hex
  ) : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
  : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
  : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
  : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
  : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
  : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
  : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
  : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0) : null;
}
function rgbn(n) {
  return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
}
function rgba(r, g, b, a) {
  if (a <= 0) r = g = b = NaN;
  return new Rgb(r, g, b, a);
}
function rgbConvert(o) {
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Rgb();
  o = o.rgb();
  return new Rgb(o.r, o.g, o.b, o.opacity);
}
function rgb(r, g, b, opacity) {
  return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
}
function Rgb(r, g, b, opacity) {
  this.r = +r;
  this.g = +g;
  this.b = +b;
  this.opacity = +opacity;
}
define(Rgb, rgb, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
  },
  rgb() {
    return this;
  },
  clamp() {
    return new Rgb(clampi(this.r), clampi(this.g), clampi(this.b), clampa(this.opacity));
  },
  displayable() {
    return -0.5 <= this.r && this.r < 255.5 && -0.5 <= this.g && this.g < 255.5 && -0.5 <= this.b && this.b < 255.5 && 0 <= this.opacity && this.opacity <= 1;
  },
  hex: rgb_formatHex,
  // Deprecated! Use color.formatHex.
  formatHex: rgb_formatHex,
  formatHex8: rgb_formatHex8,
  formatRgb: rgb_formatRgb,
  toString: rgb_formatRgb
}));
function rgb_formatHex() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}`;
}
function rgb_formatHex8() {
  return `#${hex(this.r)}${hex(this.g)}${hex(this.b)}${hex((isNaN(this.opacity) ? 1 : this.opacity) * 255)}`;
}
function rgb_formatRgb() {
  const a = clampa(this.opacity);
  return `${a === 1 ? "rgb(" : "rgba("}${clampi(this.r)}, ${clampi(this.g)}, ${clampi(this.b)}${a === 1 ? ")" : `, ${a})`}`;
}
function clampa(opacity) {
  return isNaN(opacity) ? 1 : Math.max(0, Math.min(1, opacity));
}
function clampi(value) {
  return Math.max(0, Math.min(255, Math.round(value) || 0));
}
function hex(value) {
  value = clampi(value);
  return (value < 16 ? "0" : "") + value.toString(16);
}
function hsla(h, s, l, a) {
  if (a <= 0) h = s = l = NaN;else if (l <= 0 || l >= 1) h = s = NaN;else if (s <= 0) h = NaN;
  return new Hsl(h, s, l, a);
}
function hslConvert(o) {
  if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
  if (!(o instanceof Color)) o = color(o);
  if (!o) return new Hsl();
  if (o instanceof Hsl) return o;
  o = o.rgb();
  var r = o.r / 255,
    g = o.g / 255,
    b = o.b / 255,
    min = Math.min(r, g, b),
    max = Math.max(r, g, b),
    h = NaN,
    s = max - min,
    l = (max + min) / 2;
  if (s) {
    if (r === max) h = (g - b) / s + (g < b) * 6;else if (g === max) h = (b - r) / s + 2;else h = (r - g) / s + 4;
    s /= l < 0.5 ? max + min : 2 - max - min;
    h *= 60;
  } else {
    s = l > 0 && l < 1 ? 0 : h;
  }
  return new Hsl(h, s, l, o.opacity);
}
function hsl(h, s, l, opacity) {
  return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
}
function Hsl(h, s, l, opacity) {
  this.h = +h;
  this.s = +s;
  this.l = +l;
  this.opacity = +opacity;
}
define(Hsl, hsl, extend(Color, {
  brighter(k) {
    k = k == null ? brighter : Math.pow(brighter, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  darker(k) {
    k = k == null ? darker : Math.pow(darker, k);
    return new Hsl(this.h, this.s, this.l * k, this.opacity);
  },
  rgb() {
    var h = this.h % 360 + (this.h < 0) * 360,
      s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
      l = this.l,
      m2 = l + (l < 0.5 ? l : 1 - l) * s,
      m1 = 2 * l - m2;
    return new Rgb(hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2), hsl2rgb(h, m1, m2), hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2), this.opacity);
  },
  clamp() {
    return new Hsl(clamph(this.h), clampt(this.s), clampt(this.l), clampa(this.opacity));
  },
  displayable() {
    return (0 <= this.s && this.s <= 1 || isNaN(this.s)) && 0 <= this.l && this.l <= 1 && 0 <= this.opacity && this.opacity <= 1;
  },
  formatHsl() {
    const a = clampa(this.opacity);
    return `${a === 1 ? "hsl(" : "hsla("}${clamph(this.h)}, ${clampt(this.s) * 100}%, ${clampt(this.l) * 100}%${a === 1 ? ")" : `, ${a})`}`;
  }
}));
function clamph(value) {
  value = (value || 0) % 360;
  return value < 0 ? value + 360 : value;
}
function clampt(value) {
  return Math.max(0, Math.min(1, value || 0));
}

/* From FvD 13.37, CSS Color Module Level 3 */
function hsl2rgb(h, m1, m2) {
  return (h < 60 ? m1 + (m2 - m1) * h / 60 : h < 180 ? m2 : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60 : m1) * 255;
}

var constant = x => () => x;

function linear(a, d) {
  return function (t) {
    return a + t * d;
  };
}
function exponential(a, b, y) {
  return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function (t) {
    return Math.pow(a + t * b, y);
  };
}
function gamma(y) {
  return (y = +y) === 1 ? nogamma : function (a, b) {
    return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
  };
}
function nogamma(a, b) {
  var d = b - a;
  return d ? linear(a, d) : constant(isNaN(a) ? b : a);
}

var interpolateRgb = (function rgbGamma(y) {
  var color = gamma(y);
  function rgb$1(start, end) {
    var r = color((start = rgb(start)).r, (end = rgb(end)).r),
      g = color(start.g, end.g),
      b = color(start.b, end.b),
      opacity = nogamma(start.opacity, end.opacity);
    return function (t) {
      start.r = r(t);
      start.g = g(t);
      start.b = b(t);
      start.opacity = opacity(t);
      return start + "";
    };
  }
  rgb$1.gamma = rgbGamma;
  return rgb$1;
})(1);

function numberArray (a, b) {
  if (!b) b = [];
  var n = a ? Math.min(b.length, a.length) : 0,
    c = b.slice(),
    i;
  return function (t) {
    for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
    return c;
  };
}
function isNumberArray(x) {
  return ArrayBuffer.isView(x) && !(x instanceof DataView);
}

function genericArray(a, b) {
  var nb = b ? b.length : 0,
    na = a ? Math.min(nb, a.length) : 0,
    x = new Array(na),
    c = new Array(nb),
    i;
  for (i = 0; i < na; ++i) x[i] = interpolate$1(a[i], b[i]);
  for (; i < nb; ++i) c[i] = b[i];
  return function (t) {
    for (i = 0; i < na; ++i) c[i] = x[i](t);
    return c;
  };
}

function date$1 (a, b) {
  var d = new Date();
  return a = +a, b = +b, function (t) {
    return d.setTime(a * (1 - t) + b * t), d;
  };
}

function interpolateNumber (a, b) {
  return a = +a, b = +b, function (t) {
    return a * (1 - t) + b * t;
  };
}

function object (a, b) {
  var i = {},
    c = {},
    k;
  if (a === null || typeof a !== "object") a = {};
  if (b === null || typeof b !== "object") b = {};
  for (k in b) {
    if (k in a) {
      i[k] = interpolate$1(a[k], b[k]);
    } else {
      c[k] = b[k];
    }
  }
  return function (t) {
    for (k in i) c[k] = i[k](t);
    return c;
  };
}

var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
  reB = new RegExp(reA.source, "g");
function zero(b) {
  return function () {
    return b;
  };
}
function one(b) {
  return function (t) {
    return b(t) + "";
  };
}
function interpolateString (a, b) {
  var bi = reA.lastIndex = reB.lastIndex = 0,
    // scan index for next number in b
    am,
    // current match in a
    bm,
    // current match in b
    bs,
    // string preceding current number in b, if any
    i = -1,
    // index in s
    s = [],
    // string constants and placeholders
    q = []; // number interpolators

  // Coerce inputs to strings.
  a = a + "", b = b + "";

  // Interpolate pairs of numbers in a & b.
  while ((am = reA.exec(a)) && (bm = reB.exec(b))) {
    if ((bs = bm.index) > bi) {
      // a string precedes the next number in b
      bs = b.slice(bi, bs);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }
    if ((am = am[0]) === (bm = bm[0])) {
      // numbers in a & b match
      if (s[i]) s[i] += bm; // coalesce with previous string
      else s[++i] = bm;
    } else {
      // interpolate non-matching numbers
      s[++i] = null;
      q.push({
        i: i,
        x: interpolateNumber(am, bm)
      });
    }
    bi = reB.lastIndex;
  }

  // Add remains of b.
  if (bi < b.length) {
    bs = b.slice(bi);
    if (s[i]) s[i] += bs; // coalesce with previous string
    else s[++i] = bs;
  }

  // Special optimization for only a single match.
  // Otherwise, interpolate each of the numbers and rejoin the string.
  return s.length < 2 ? q[0] ? one(q[0].x) : zero(b) : (b = q.length, function (t) {
    for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
    return s.join("");
  });
}

function interpolate$1 (a, b) {
  var t = typeof b,
    c;
  return b == null || t === "boolean" ? constant(b) : (t === "number" ? interpolateNumber : t === "string" ? (c = color(b)) ? (b = c, interpolateRgb) : interpolateString : b instanceof color ? interpolateRgb : b instanceof Date ? date$1 : isNumberArray(b) ? numberArray : Array.isArray(b) ? genericArray : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object : interpolateNumber)(a, b);
}

function interpolateRound (a, b) {
  return a = +a, b = +b, function (t) {
    return Math.round(a * (1 - t) + b * t);
  };
}

var degrees = 180 / Math.PI;
var identity$1 = {
  translateX: 0,
  translateY: 0,
  rotate: 0,
  skewX: 0,
  scaleX: 1,
  scaleY: 1
};
function decompose (a, b, c, d, e, f) {
  var scaleX, scaleY, skewX;
  if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
  if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
  if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
  if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
  return {
    translateX: e,
    translateY: f,
    rotate: Math.atan2(b, a) * degrees,
    skewX: Math.atan(skewX) * degrees,
    scaleX: scaleX,
    scaleY: scaleY
  };
}

var svgNode;

/* eslint-disable no-undef */
function parseCss(value) {
  const m = new (typeof DOMMatrix === "function" ? DOMMatrix : WebKitCSSMatrix)(value + "");
  return m.isIdentity ? identity$1 : decompose(m.a, m.b, m.c, m.d, m.e, m.f);
}
function parseSvg(value) {
  if (value == null) return identity$1;
  if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svgNode.setAttribute("transform", value);
  if (!(value = svgNode.transform.baseVal.consolidate())) return identity$1;
  value = value.matrix;
  return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
}

function interpolateTransform(parse, pxComma, pxParen, degParen) {
  function pop(s) {
    return s.length ? s.pop() + " " : "";
  }
  function translate(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push("translate(", null, pxComma, null, pxParen);
      q.push({
        i: i - 4,
        x: interpolateNumber(xa, xb)
      }, {
        i: i - 2,
        x: interpolateNumber(ya, yb)
      });
    } else if (xb || yb) {
      s.push("translate(" + xb + pxComma + yb + pxParen);
    }
  }
  function rotate(a, b, s, q) {
    if (a !== b) {
      if (a - b > 180) b += 360;else if (b - a > 180) a += 360; // shortest path
      q.push({
        i: s.push(pop(s) + "rotate(", null, degParen) - 2,
        x: interpolateNumber(a, b)
      });
    } else if (b) {
      s.push(pop(s) + "rotate(" + b + degParen);
    }
  }
  function skewX(a, b, s, q) {
    if (a !== b) {
      q.push({
        i: s.push(pop(s) + "skewX(", null, degParen) - 2,
        x: interpolateNumber(a, b)
      });
    } else if (b) {
      s.push(pop(s) + "skewX(" + b + degParen);
    }
  }
  function scale(xa, ya, xb, yb, s, q) {
    if (xa !== xb || ya !== yb) {
      var i = s.push(pop(s) + "scale(", null, ",", null, ")");
      q.push({
        i: i - 4,
        x: interpolateNumber(xa, xb)
      }, {
        i: i - 2,
        x: interpolateNumber(ya, yb)
      });
    } else if (xb !== 1 || yb !== 1) {
      s.push(pop(s) + "scale(" + xb + "," + yb + ")");
    }
  }
  return function (a, b) {
    var s = [],
      // string constants and placeholders
      q = []; // number interpolators
    a = parse(a), b = parse(b);
    translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
    rotate(a.rotate, b.rotate, s, q);
    skewX(a.skewX, b.skewX, s, q);
    scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
    a = b = null; // gc
    return function (t) {
      var i = -1,
        n = q.length,
        o;
      while (++i < n) s[(o = q[i]).i] = o.x(t);
      return s.join("");
    };
  };
}
var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

var frame = 0,
  // is an animation frame pending?
  timeout$1 = 0,
  // is a timeout pending?
  interval = 0,
  // are any timers active?
  pokeDelay = 1000,
  // how frequently we check for clock skew
  taskHead,
  taskTail,
  clockLast = 0,
  clockNow = 0,
  clockSkew = 0,
  clock = typeof performance === "object" && performance.now ? performance : Date,
  setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function (f) {
    setTimeout(f, 17);
  };
function now() {
  return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
}
function clearNow() {
  clockNow = 0;
}
function Timer() {
  this._call = this._time = this._next = null;
}
Timer.prototype = timer.prototype = {
  constructor: Timer,
  restart: function (callback, delay, time) {
    if (typeof callback !== "function") throw new TypeError("callback is not a function");
    time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
    if (!this._next && taskTail !== this) {
      if (taskTail) taskTail._next = this;else taskHead = this;
      taskTail = this;
    }
    this._call = callback;
    this._time = time;
    sleep();
  },
  stop: function () {
    if (this._call) {
      this._call = null;
      this._time = Infinity;
      sleep();
    }
  }
};
function timer(callback, delay, time) {
  var t = new Timer();
  t.restart(callback, delay, time);
  return t;
}
function timerFlush() {
  now(); // Get the current time, if not already set.
  ++frame; // Pretend we’ve set an alarm, if we haven’t already.
  var t = taskHead,
    e;
  while (t) {
    if ((e = clockNow - t._time) >= 0) t._call.call(undefined, e);
    t = t._next;
  }
  --frame;
}
function wake() {
  clockNow = (clockLast = clock.now()) + clockSkew;
  frame = timeout$1 = 0;
  try {
    timerFlush();
  } finally {
    frame = 0;
    nap();
    clockNow = 0;
  }
}
function poke() {
  var now = clock.now(),
    delay = now - clockLast;
  if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
}
function nap() {
  var t0,
    t1 = taskHead,
    t2,
    time = Infinity;
  while (t1) {
    if (t1._call) {
      if (time > t1._time) time = t1._time;
      t0 = t1, t1 = t1._next;
    } else {
      t2 = t1._next, t1._next = null;
      t1 = t0 ? t0._next = t2 : taskHead = t2;
    }
  }
  taskTail = t0;
  sleep(time);
}
function sleep(time) {
  if (frame) return; // Soonest alarm already set, or will be.
  if (timeout$1) timeout$1 = clearTimeout(timeout$1);
  var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
  if (delay > 24) {
    if (time < Infinity) timeout$1 = setTimeout(wake, time - clock.now() - clockSkew);
    if (interval) interval = clearInterval(interval);
  } else {
    if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
    frame = 1, setFrame(wake);
  }
}

function timeout (callback, delay, time) {
  var t = new Timer();
  delay = delay == null ? 0 : +delay;
  t.restart(elapsed => {
    t.stop();
    callback(elapsed + delay);
  }, delay, time);
  return t;
}

var emptyOn = dispatch("start", "end", "cancel", "interrupt");
var emptyTween = [];
var CREATED = 0;
var SCHEDULED = 1;
var STARTING = 2;
var STARTED = 3;
var RUNNING = 4;
var ENDING = 5;
var ENDED = 6;
function schedule (node, name, id, index, group, timing) {
  var schedules = node.__transition;
  if (!schedules) node.__transition = {};else if (id in schedules) return;
  create(node, id, {
    name: name,
    index: index,
    // For context during callback.
    group: group,
    // For context during callback.
    on: emptyOn,
    tween: emptyTween,
    time: timing.time,
    delay: timing.delay,
    duration: timing.duration,
    ease: timing.ease,
    timer: null,
    state: CREATED
  });
}
function init(node, id) {
  var schedule = get(node, id);
  if (schedule.state > CREATED) throw new Error("too late; already scheduled");
  return schedule;
}
function set(node, id) {
  var schedule = get(node, id);
  if (schedule.state > STARTED) throw new Error("too late; already running");
  return schedule;
}
function get(node, id) {
  var schedule = node.__transition;
  if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
  return schedule;
}
function create(node, id, self) {
  var schedules = node.__transition,
    tween;

  // Initialize the self timer when the transition is created.
  // Note the actual delay is not known until the first callback!
  schedules[id] = self;
  self.timer = timer(schedule, 0, self.time);
  function schedule(elapsed) {
    self.state = SCHEDULED;
    self.timer.restart(start, self.delay, self.time);

    // If the elapsed delay is less than our first sleep, start immediately.
    if (self.delay <= elapsed) start(elapsed - self.delay);
  }
  function start(elapsed) {
    var i, j, n, o;

    // If the state is not SCHEDULED, then we previously errored on start.
    if (self.state !== SCHEDULED) return stop();
    for (i in schedules) {
      o = schedules[i];
      if (o.name !== self.name) continue;

      // While this element already has a starting transition during this frame,
      // defer starting an interrupting transition until that transition has a
      // chance to tick (and possibly end); see d3/d3-transition#54!
      if (o.state === STARTED) return timeout(start);

      // Interrupt the active transition, if any.
      if (o.state === RUNNING) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("interrupt", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }

      // Cancel any pre-empted transitions.
      else if (+i < id) {
        o.state = ENDED;
        o.timer.stop();
        o.on.call("cancel", node, node.__data__, o.index, o.group);
        delete schedules[i];
      }
    }

    // Defer the first tick to end of the current frame; see d3/d3#1576.
    // Note the transition may be canceled after start and before the first tick!
    // Note this must be scheduled before the start event; see d3/d3-transition#16!
    // Assuming this is successful, subsequent callbacks go straight to tick.
    timeout(function () {
      if (self.state === STARTED) {
        self.state = RUNNING;
        self.timer.restart(tick, self.delay, self.time);
        tick(elapsed);
      }
    });

    // Dispatch the start event.
    // Note this must be done before the tween are initialized.
    self.state = STARTING;
    self.on.call("start", node, node.__data__, self.index, self.group);
    if (self.state !== STARTING) return; // interrupted
    self.state = STARTED;

    // Initialize the tween, deleting null tween.
    tween = new Array(n = self.tween.length);
    for (i = 0, j = -1; i < n; ++i) {
      if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
        tween[++j] = o;
      }
    }
    tween.length = j + 1;
  }
  function tick(elapsed) {
    var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
      i = -1,
      n = tween.length;
    while (++i < n) {
      tween[i].call(node, t);
    }

    // Dispatch the end event.
    if (self.state === ENDING) {
      self.on.call("end", node, node.__data__, self.index, self.group);
      stop();
    }
  }
  function stop() {
    self.state = ENDED;
    self.timer.stop();
    delete schedules[id];
    for (var i in schedules) return; // eslint-disable-line no-unused-vars
    delete node.__transition;
  }
}

function interrupt (node, name) {
  var schedules = node.__transition,
    schedule,
    active,
    empty = true,
    i;
  if (!schedules) return;
  name = name == null ? null : name + "";
  for (i in schedules) {
    if ((schedule = schedules[i]).name !== name) {
      empty = false;
      continue;
    }
    active = schedule.state > STARTING && schedule.state < ENDING;
    schedule.state = ENDED;
    schedule.timer.stop();
    schedule.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule.index, schedule.group);
    delete schedules[i];
  }
  if (empty) delete node.__transition;
}

function selection_interrupt (name) {
  return this.each(function () {
    interrupt(this, name);
  });
}

function tweenRemove(id, name) {
  var tween0, tween1;
  return function () {
    var schedule = set(this, id),
      tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = tween0 = tween;
      for (var i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1 = tween1.slice();
          tween1.splice(i, 1);
          break;
        }
      }
    }
    schedule.tween = tween1;
  };
}
function tweenFunction(id, name, value) {
  var tween0, tween1;
  if (typeof value !== "function") throw new Error();
  return function () {
    var schedule = set(this, id),
      tween = schedule.tween;

    // If this node shared tween with the previous node,
    // just assign the updated shared tween and we’re done!
    // Otherwise, copy-on-write.
    if (tween !== tween0) {
      tween1 = (tween0 = tween).slice();
      for (var t = {
          name: name,
          value: value
        }, i = 0, n = tween1.length; i < n; ++i) {
        if (tween1[i].name === name) {
          tween1[i] = t;
          break;
        }
      }
      if (i === n) tween1.push(t);
    }
    schedule.tween = tween1;
  };
}
function transition_tween (name, value) {
  var id = this._id;
  name += "";
  if (arguments.length < 2) {
    var tween = get(this.node(), id).tween;
    for (var i = 0, n = tween.length, t; i < n; ++i) {
      if ((t = tween[i]).name === name) {
        return t.value;
      }
    }
    return null;
  }
  return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
}
function tweenValue(transition, name, value) {
  var id = transition._id;
  transition.each(function () {
    var schedule = set(this, id);
    (schedule.value || (schedule.value = {}))[name] = value.apply(this, arguments);
  });
  return function (node) {
    return get(node, id).value[name];
  };
}

function interpolate (a, b) {
  var c;
  return (typeof b === "number" ? interpolateNumber : b instanceof color ? interpolateRgb : (c = color(b)) ? (b = c, interpolateRgb) : interpolateString)(a, b);
}

function attrRemove(name) {
  return function () {
    this.removeAttribute(name);
  };
}
function attrRemoveNS(fullname) {
  return function () {
    this.removeAttributeNS(fullname.space, fullname.local);
  };
}
function attrConstant(name, interpolate, value1) {
  var string00,
    string1 = value1 + "",
    interpolate0;
  return function () {
    var string0 = this.getAttribute(name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrConstantNS(fullname, interpolate, value1) {
  var string00,
    string1 = value1 + "",
    interpolate0;
  return function () {
    var string0 = this.getAttributeNS(fullname.space, fullname.local);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function attrFunction(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function () {
    var string0,
      value1 = value(this),
      string1;
    if (value1 == null) return void this.removeAttribute(name);
    string0 = this.getAttribute(name);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function attrFunctionNS(fullname, interpolate, value) {
  var string00, string10, interpolate0;
  return function () {
    var string0,
      value1 = value(this),
      string1;
    if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
    string0 = this.getAttributeNS(fullname.space, fullname.local);
    string1 = value1 + "";
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function transition_attr (name, value) {
  var fullname = namespace(name),
    i = fullname === "transform" ? interpolateTransformSvg : interpolate;
  return this.attrTween(name, typeof value === "function" ? (fullname.local ? attrFunctionNS : attrFunction)(fullname, i, tweenValue(this, "attr." + name, value)) : value == null ? (fullname.local ? attrRemoveNS : attrRemove)(fullname) : (fullname.local ? attrConstantNS : attrConstant)(fullname, i, value));
}

function attrInterpolate(name, i) {
  return function (t) {
    this.setAttribute(name, i.call(this, t));
  };
}
function attrInterpolateNS(fullname, i) {
  return function (t) {
    this.setAttributeNS(fullname.space, fullname.local, i.call(this, t));
  };
}
function attrTweenNS(fullname, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function attrTween(name, value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_attrTween (name, value) {
  var key = "attr." + name;
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  var fullname = namespace(name);
  return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
}

function delayFunction(id, value) {
  return function () {
    init(this, id).delay = +value.apply(this, arguments);
  };
}
function delayConstant(id, value) {
  return value = +value, function () {
    init(this, id).delay = value;
  };
}
function transition_delay (value) {
  var id = this._id;
  return arguments.length ? this.each((typeof value === "function" ? delayFunction : delayConstant)(id, value)) : get(this.node(), id).delay;
}

function durationFunction(id, value) {
  return function () {
    set(this, id).duration = +value.apply(this, arguments);
  };
}
function durationConstant(id, value) {
  return value = +value, function () {
    set(this, id).duration = value;
  };
}
function transition_duration (value) {
  var id = this._id;
  return arguments.length ? this.each((typeof value === "function" ? durationFunction : durationConstant)(id, value)) : get(this.node(), id).duration;
}

function easeConstant(id, value) {
  if (typeof value !== "function") throw new Error();
  return function () {
    set(this, id).ease = value;
  };
}
function transition_ease (value) {
  var id = this._id;
  return arguments.length ? this.each(easeConstant(id, value)) : get(this.node(), id).ease;
}

function easeVarying(id, value) {
  return function () {
    var v = value.apply(this, arguments);
    if (typeof v !== "function") throw new Error();
    set(this, id).ease = v;
  };
}
function transition_easeVarying (value) {
  if (typeof value !== "function") throw new Error();
  return this.each(easeVarying(this._id, value));
}

function transition_filter (match) {
  if (typeof match !== "function") match = matcher(match);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
      if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
        subgroup.push(node);
      }
    }
  }
  return new Transition(subgroups, this._parents, this._name, this._id);
}

function transition_merge (transition) {
  if (transition._id !== this._id) throw new Error();
  for (var groups0 = this._groups, groups1 = transition._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
    for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
      if (node = group0[i] || group1[i]) {
        merge[i] = node;
      }
    }
  }
  for (; j < m0; ++j) {
    merges[j] = groups0[j];
  }
  return new Transition(merges, this._parents, this._name, this._id);
}

function start(name) {
  return (name + "").trim().split(/^|\s+/).every(function (t) {
    var i = t.indexOf(".");
    if (i >= 0) t = t.slice(0, i);
    return !t || t === "start";
  });
}
function onFunction(id, name, listener) {
  var on0,
    on1,
    sit = start(name) ? init : set;
  return function () {
    var schedule = sit(this, id),
      on = schedule.on;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);
    schedule.on = on1;
  };
}
function transition_on (name, listener) {
  var id = this._id;
  return arguments.length < 2 ? get(this.node(), id).on.on(name) : this.each(onFunction(id, name, listener));
}

function removeFunction(id) {
  return function () {
    var parent = this.parentNode;
    for (var i in this.__transition) if (+i !== id) return;
    if (parent) parent.removeChild(this);
  };
}
function transition_remove () {
  return this.on("end.remove", removeFunction(this._id));
}

function transition_select (select) {
  var name = this._name,
    id = this._id;
  if (typeof select !== "function") select = selector(select);
  for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
      if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
        if ("__data__" in node) subnode.__data__ = node.__data__;
        subgroup[i] = subnode;
        schedule(subgroup[i], name, id, i, subgroup, get(node, id));
      }
    }
  }
  return new Transition(subgroups, this._parents, name, id);
}

function transition_selectAll (select) {
  var name = this._name,
    id = this._id;
  if (typeof select !== "function") select = selectorAll(select);
  for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        for (var children = select.call(node, node.__data__, i, group), child, inherit = get(node, id), k = 0, l = children.length; k < l; ++k) {
          if (child = children[k]) {
            schedule(child, name, id, k, children, inherit);
          }
        }
        subgroups.push(children);
        parents.push(node);
      }
    }
  }
  return new Transition(subgroups, parents, name, id);
}

var Selection = selection.prototype.constructor;
function transition_selection () {
  return new Selection(this._groups, this._parents);
}

function styleNull(name, interpolate) {
  var string00, string10, interpolate0;
  return function () {
    var string0 = styleValue(this, name),
      string1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : interpolate0 = interpolate(string00 = string0, string10 = string1);
  };
}
function styleRemove(name) {
  return function () {
    this.style.removeProperty(name);
  };
}
function styleConstant(name, interpolate, value1) {
  var string00,
    string1 = value1 + "",
    interpolate0;
  return function () {
    var string0 = styleValue(this, name);
    return string0 === string1 ? null : string0 === string00 ? interpolate0 : interpolate0 = interpolate(string00 = string0, value1);
  };
}
function styleFunction(name, interpolate, value) {
  var string00, string10, interpolate0;
  return function () {
    var string0 = styleValue(this, name),
      value1 = value(this),
      string1 = value1 + "";
    if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
    return string0 === string1 ? null : string0 === string00 && string1 === string10 ? interpolate0 : (string10 = string1, interpolate0 = interpolate(string00 = string0, value1));
  };
}
function styleMaybeRemove(id, name) {
  var on0,
    on1,
    listener0,
    key = "style." + name,
    event = "end." + key,
    remove;
  return function () {
    var schedule = set(this, id),
      on = schedule.on,
      listener = schedule.value[key] == null ? remove || (remove = styleRemove(name)) : undefined;

    // If this node shared a dispatch with the previous node,
    // just assign the updated shared dispatch and we’re done!
    // Otherwise, copy-on-write.
    if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event, listener0 = listener);
    schedule.on = on1;
  };
}
function transition_style (name, value, priority) {
  var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
  return value == null ? this.styleTween(name, styleNull(name, i)).on("end.style." + name, styleRemove(name)) : typeof value === "function" ? this.styleTween(name, styleFunction(name, i, tweenValue(this, "style." + name, value))).each(styleMaybeRemove(this._id, name)) : this.styleTween(name, styleConstant(name, i, value), priority).on("end.style." + name, null);
}

function styleInterpolate(name, i, priority) {
  return function (t) {
    this.style.setProperty(name, i.call(this, t), priority);
  };
}
function styleTween(name, value, priority) {
  var t, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
    return t;
  }
  tween._value = value;
  return tween;
}
function transition_styleTween (name, value, priority) {
  var key = "style." + (name += "");
  if (arguments.length < 2) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
}

function textConstant(value) {
  return function () {
    this.textContent = value;
  };
}
function textFunction(value) {
  return function () {
    var value1 = value(this);
    this.textContent = value1 == null ? "" : value1;
  };
}
function transition_text (value) {
  return this.tween("text", typeof value === "function" ? textFunction(tweenValue(this, "text", value)) : textConstant(value == null ? "" : value + ""));
}

function textInterpolate(i) {
  return function (t) {
    this.textContent = i.call(this, t);
  };
}
function textTween(value) {
  var t0, i0;
  function tween() {
    var i = value.apply(this, arguments);
    if (i !== i0) t0 = (i0 = i) && textInterpolate(i);
    return t0;
  }
  tween._value = value;
  return tween;
}
function transition_textTween (value) {
  var key = "text";
  if (arguments.length < 1) return (key = this.tween(key)) && key._value;
  if (value == null) return this.tween(key, null);
  if (typeof value !== "function") throw new Error();
  return this.tween(key, textTween(value));
}

function transition_transition () {
  var name = this._name,
    id0 = this._id,
    id1 = newId();
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        var inherit = get(node, id0);
        schedule(node, name, id1, i, group, {
          time: inherit.time + inherit.delay + inherit.duration,
          delay: 0,
          duration: inherit.duration,
          ease: inherit.ease
        });
      }
    }
  }
  return new Transition(groups, this._parents, name, id1);
}

function transition_end () {
  var on0,
    on1,
    that = this,
    id = that._id,
    size = that.size();
  return new Promise(function (resolve, reject) {
    var cancel = {
        value: reject
      },
      end = {
        value: function () {
          if (--size === 0) resolve();
        }
      };
    that.each(function () {
      var schedule = set(this, id),
        on = schedule.on;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0) {
        on1 = (on0 = on).copy();
        on1._.cancel.push(cancel);
        on1._.interrupt.push(cancel);
        on1._.end.push(end);
      }
      schedule.on = on1;
    });

    // The selection was empty, resolve end immediately
    if (size === 0) resolve();
  });
}

var id = 0;
function Transition(groups, parents, name, id) {
  this._groups = groups;
  this._parents = parents;
  this._name = name;
  this._id = id;
}
function newId() {
  return ++id;
}
var selection_prototype = selection.prototype;
Transition.prototype = {
  constructor: Transition,
  select: transition_select,
  selectAll: transition_selectAll,
  selectChild: selection_prototype.selectChild,
  selectChildren: selection_prototype.selectChildren,
  filter: transition_filter,
  merge: transition_merge,
  selection: transition_selection,
  transition: transition_transition,
  call: selection_prototype.call,
  nodes: selection_prototype.nodes,
  node: selection_prototype.node,
  size: selection_prototype.size,
  empty: selection_prototype.empty,
  each: selection_prototype.each,
  on: transition_on,
  attr: transition_attr,
  attrTween: transition_attrTween,
  style: transition_style,
  styleTween: transition_styleTween,
  text: transition_text,
  textTween: transition_textTween,
  remove: transition_remove,
  tween: transition_tween,
  delay: transition_delay,
  duration: transition_duration,
  ease: transition_ease,
  easeVarying: transition_easeVarying,
  end: transition_end,
  [Symbol.iterator]: selection_prototype[Symbol.iterator]
};

function cubicInOut(t) {
  return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
}

var defaultTiming = {
  time: null,
  // Set on use.
  delay: 0,
  duration: 250,
  ease: cubicInOut
};
function inherit(node, id) {
  var timing;
  while (!(timing = node.__transition) || !(timing = timing[id])) {
    if (!(node = node.parentNode)) {
      throw new Error(`transition ${id} not found`);
    }
  }
  return timing;
}
function selection_transition (name) {
  var id, timing;
  if (name instanceof Transition) {
    id = name._id, name = name._name;
  } else {
    id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
  }
  for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
    for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
      if (node = group[i]) {
        schedule(node, name, id, i, group, timing || inherit(node, id));
      }
    }
  }
  return new Transition(groups, this._parents, name, id);
}

selection.prototype.interrupt = selection_interrupt;
selection.prototype.transition = selection_transition;

function initRange(domain, range) {
  switch (arguments.length) {
    case 0:
      break;
    case 1:
      this.range(domain);
      break;
    default:
      this.range(range).domain(domain);
      break;
  }
  return this;
}

const implicit = Symbol("implicit");
function ordinal() {
  var index = new InternMap(),
    domain = [],
    range = [],
    unknown = implicit;
  function scale(d) {
    let i = index.get(d);
    if (i === undefined) {
      if (unknown !== implicit) return unknown;
      index.set(d, i = domain.push(d) - 1);
    }
    return range[i % range.length];
  }
  scale.domain = function (_) {
    if (!arguments.length) return domain.slice();
    domain = [], index = new InternMap();
    for (const value of _) {
      if (index.has(value)) continue;
      index.set(value, domain.push(value) - 1);
    }
    return scale;
  };
  scale.range = function (_) {
    return arguments.length ? (range = Array.from(_), scale) : range.slice();
  };
  scale.unknown = function (_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  scale.copy = function () {
    return ordinal(domain, range).unknown(unknown);
  };
  initRange.apply(scale, arguments);
  return scale;
}

function band() {
  var scale = ordinal().unknown(undefined),
    domain = scale.domain,
    ordinalRange = scale.range,
    r0 = 0,
    r1 = 1,
    step,
    bandwidth,
    round = false,
    paddingInner = 0,
    paddingOuter = 0,
    align = 0.5;
  delete scale.unknown;
  function rescale() {
    var n = domain().length,
      reverse = r1 < r0,
      start = reverse ? r1 : r0,
      stop = reverse ? r0 : r1;
    step = (stop - start) / Math.max(1, n - paddingInner + paddingOuter * 2);
    if (round) step = Math.floor(step);
    start += (stop - start - step * (n - paddingInner)) * align;
    bandwidth = step * (1 - paddingInner);
    if (round) start = Math.round(start), bandwidth = Math.round(bandwidth);
    var values = range(n).map(function (i) {
      return start + step * i;
    });
    return ordinalRange(reverse ? values.reverse() : values);
  }
  scale.domain = function (_) {
    return arguments.length ? (domain(_), rescale()) : domain();
  };
  scale.range = function (_) {
    return arguments.length ? ([r0, r1] = _, r0 = +r0, r1 = +r1, rescale()) : [r0, r1];
  };
  scale.rangeRound = function (_) {
    return [r0, r1] = _, r0 = +r0, r1 = +r1, round = true, rescale();
  };
  scale.bandwidth = function () {
    return bandwidth;
  };
  scale.step = function () {
    return step;
  };
  scale.round = function (_) {
    return arguments.length ? (round = !!_, rescale()) : round;
  };
  scale.padding = function (_) {
    return arguments.length ? (paddingInner = Math.min(1, paddingOuter = +_), rescale()) : paddingInner;
  };
  scale.paddingInner = function (_) {
    return arguments.length ? (paddingInner = Math.min(1, _), rescale()) : paddingInner;
  };
  scale.paddingOuter = function (_) {
    return arguments.length ? (paddingOuter = +_, rescale()) : paddingOuter;
  };
  scale.align = function (_) {
    return arguments.length ? (align = Math.max(0, Math.min(1, _)), rescale()) : align;
  };
  scale.copy = function () {
    return band(domain(), [r0, r1]).round(round).paddingInner(paddingInner).paddingOuter(paddingOuter).align(align);
  };
  return initRange.apply(rescale(), arguments);
}

function constants(x) {
  return function () {
    return x;
  };
}

function number$1(x) {
  return +x;
}

var unit = [0, 1];
function identity(x) {
  return x;
}
function normalize(a, b) {
  return (b -= a = +a) ? function (x) {
    return (x - a) / b;
  } : constants(isNaN(b) ? NaN : 0.5);
}
function clamper(a, b) {
  var t;
  if (a > b) t = a, a = b, b = t;
  return function (x) {
    return Math.max(a, Math.min(b, x));
  };
}

// normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
// interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
function bimap(domain, range, interpolate) {
  var d0 = domain[0],
    d1 = domain[1],
    r0 = range[0],
    r1 = range[1];
  if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
  return function (x) {
    return r0(d0(x));
  };
}
function polymap(domain, range, interpolate) {
  var j = Math.min(domain.length, range.length) - 1,
    d = new Array(j),
    r = new Array(j),
    i = -1;

  // Reverse descending domains.
  if (domain[j] < domain[0]) {
    domain = domain.slice().reverse();
    range = range.slice().reverse();
  }
  while (++i < j) {
    d[i] = normalize(domain[i], domain[i + 1]);
    r[i] = interpolate(range[i], range[i + 1]);
  }
  return function (x) {
    var i = bisect(domain, x, 1, j) - 1;
    return r[i](d[i](x));
  };
}
function copy(source, target) {
  return target.domain(source.domain()).range(source.range()).interpolate(source.interpolate()).clamp(source.clamp()).unknown(source.unknown());
}
function transformer() {
  var domain = unit,
    range = unit,
    interpolate = interpolate$1,
    transform,
    untransform,
    unknown,
    clamp = identity,
    piecewise,
    output,
    input;
  function rescale() {
    var n = Math.min(domain.length, range.length);
    if (clamp !== identity) clamp = clamper(domain[0], domain[n - 1]);
    piecewise = n > 2 ? polymap : bimap;
    output = input = null;
    return scale;
  }
  function scale(x) {
    return x == null || isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
  }
  scale.invert = function (y) {
    return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
  };
  scale.domain = function (_) {
    return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
  };
  scale.range = function (_) {
    return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
  };
  scale.rangeRound = function (_) {
    return range = Array.from(_), interpolate = interpolateRound, rescale();
  };
  scale.clamp = function (_) {
    return arguments.length ? (clamp = _ ? true : identity, rescale()) : clamp !== identity;
  };
  scale.interpolate = function (_) {
    return arguments.length ? (interpolate = _, rescale()) : interpolate;
  };
  scale.unknown = function (_) {
    return arguments.length ? (unknown = _, scale) : unknown;
  };
  return function (t, u) {
    transform = t, untransform = u;
    return rescale();
  };
}
function continuous() {
  return transformer()(identity, identity);
}

function nice(domain, interval) {
  domain = domain.slice();
  var i0 = 0,
    i1 = domain.length - 1,
    x0 = domain[i0],
    x1 = domain[i1],
    t;
  if (x1 < x0) {
    t = i0, i0 = i1, i1 = t;
    t = x0, x0 = x1, x1 = t;
  }
  domain[i0] = interval.floor(x0);
  domain[i1] = interval.ceil(x1);
  return domain;
}

const t0 = new Date(),
  t1 = new Date();
function timeInterval(floori, offseti, count, field) {
  function interval(date) {
    return floori(date = arguments.length === 0 ? new Date() : new Date(+date)), date;
  }
  interval.floor = date => {
    return floori(date = new Date(+date)), date;
  };
  interval.ceil = date => {
    return floori(date = new Date(date - 1)), offseti(date, 1), floori(date), date;
  };
  interval.round = date => {
    const d0 = interval(date),
      d1 = interval.ceil(date);
    return date - d0 < d1 - date ? d0 : d1;
  };
  interval.offset = (date, step) => {
    return offseti(date = new Date(+date), step == null ? 1 : Math.floor(step)), date;
  };
  interval.range = (start, stop, step) => {
    const range = [];
    start = interval.ceil(start);
    step = step == null ? 1 : Math.floor(step);
    if (!(start < stop) || !(step > 0)) return range; // also handles Invalid Date
    let previous;
    do range.push(previous = new Date(+start)), offseti(start, step), floori(start); while (previous < start && start < stop);
    return range;
  };
  interval.filter = test => {
    return timeInterval(date => {
      if (date >= date) while (floori(date), !test(date)) date.setTime(date - 1);
    }, (date, step) => {
      if (date >= date) {
        if (step < 0) while (++step <= 0) {
          while (offseti(date, -1), !test(date)) {} // eslint-disable-line no-empty
        } else while (--step >= 0) {
          while (offseti(date, +1), !test(date)) {} // eslint-disable-line no-empty
        }
      }
    });
  };
  if (count) {
    interval.count = (start, end) => {
      t0.setTime(+start), t1.setTime(+end);
      floori(t0), floori(t1);
      return Math.floor(count(t0, t1));
    };
    interval.every = step => {
      step = Math.floor(step);
      return !isFinite(step) || !(step > 0) ? null : !(step > 1) ? interval : interval.filter(field ? d => field(d) % step === 0 : d => interval.count(0, d) % step === 0);
    };
  }
  return interval;
}

const millisecond = timeInterval(() => {
  // noop
}, (date, step) => {
  date.setTime(+date + step);
}, (start, end) => {
  return end - start;
});

// An optimized implementation for this simple case.
millisecond.every = k => {
  k = Math.floor(k);
  if (!isFinite(k) || !(k > 0)) return null;
  if (!(k > 1)) return millisecond;
  return timeInterval(date => {
    date.setTime(Math.floor(date / k) * k);
  }, (date, step) => {
    date.setTime(+date + step * k);
  }, (start, end) => {
    return (end - start) / k;
  });
};
millisecond.range;

const durationSecond = 1000;
const durationMinute = durationSecond * 60;
const durationHour = durationMinute * 60;
const durationDay = durationHour * 24;
const durationWeek = durationDay * 7;
const durationMonth = durationDay * 30;
const durationYear = durationDay * 365;

const second = timeInterval(date => {
  date.setTime(date - date.getMilliseconds());
}, (date, step) => {
  date.setTime(+date + step * durationSecond);
}, (start, end) => {
  return (end - start) / durationSecond;
}, date => {
  return date.getUTCSeconds();
});
second.range;

const timeMinute = timeInterval(date => {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond);
}, (date, step) => {
  date.setTime(+date + step * durationMinute);
}, (start, end) => {
  return (end - start) / durationMinute;
}, date => {
  return date.getMinutes();
});
timeMinute.range;
const utcMinute = timeInterval(date => {
  date.setUTCSeconds(0, 0);
}, (date, step) => {
  date.setTime(+date + step * durationMinute);
}, (start, end) => {
  return (end - start) / durationMinute;
}, date => {
  return date.getUTCMinutes();
});
utcMinute.range;

const timeHour = timeInterval(date => {
  date.setTime(date - date.getMilliseconds() - date.getSeconds() * durationSecond - date.getMinutes() * durationMinute);
}, (date, step) => {
  date.setTime(+date + step * durationHour);
}, (start, end) => {
  return (end - start) / durationHour;
}, date => {
  return date.getHours();
});
timeHour.range;
const utcHour = timeInterval(date => {
  date.setUTCMinutes(0, 0, 0);
}, (date, step) => {
  date.setTime(+date + step * durationHour);
}, (start, end) => {
  return (end - start) / durationHour;
}, date => {
  return date.getUTCHours();
});
utcHour.range;

const timeDay = timeInterval(date => date.setHours(0, 0, 0, 0), (date, step) => date.setDate(date.getDate() + step), (start, end) => (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationDay, date => date.getDate() - 1);
timeDay.range;
const utcDay = timeInterval(date => {
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCDate(date.getUTCDate() + step);
}, (start, end) => {
  return (end - start) / durationDay;
}, date => {
  return date.getUTCDate() - 1;
});
utcDay.range;
const unixDay = timeInterval(date => {
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCDate(date.getUTCDate() + step);
}, (start, end) => {
  return (end - start) / durationDay;
}, date => {
  return Math.floor(date / durationDay);
});
unixDay.range;

function timeWeekday(i) {
  return timeInterval(date => {
    date.setDate(date.getDate() - (date.getDay() + 7 - i) % 7);
    date.setHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setDate(date.getDate() + step * 7);
  }, (start, end) => {
    return (end - start - (end.getTimezoneOffset() - start.getTimezoneOffset()) * durationMinute) / durationWeek;
  });
}
const timeSunday = timeWeekday(0);
const timeMonday = timeWeekday(1);
const timeTuesday = timeWeekday(2);
const timeWednesday = timeWeekday(3);
const timeThursday = timeWeekday(4);
const timeFriday = timeWeekday(5);
const timeSaturday = timeWeekday(6);
timeSunday.range;
timeMonday.range;
timeTuesday.range;
timeWednesday.range;
timeThursday.range;
timeFriday.range;
timeSaturday.range;
function utcWeekday(i) {
  return timeInterval(date => {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() + 7 - i) % 7);
    date.setUTCHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setUTCDate(date.getUTCDate() + step * 7);
  }, (start, end) => {
    return (end - start) / durationWeek;
  });
}
const utcSunday = utcWeekday(0);
const utcMonday = utcWeekday(1);
const utcTuesday = utcWeekday(2);
const utcWednesday = utcWeekday(3);
const utcThursday = utcWeekday(4);
const utcFriday = utcWeekday(5);
const utcSaturday = utcWeekday(6);
utcSunday.range;
utcMonday.range;
utcTuesday.range;
utcWednesday.range;
utcThursday.range;
utcFriday.range;
utcSaturday.range;

const timeMonth = timeInterval(date => {
  date.setDate(1);
  date.setHours(0, 0, 0, 0);
}, (date, step) => {
  date.setMonth(date.getMonth() + step);
}, (start, end) => {
  return end.getMonth() - start.getMonth() + (end.getFullYear() - start.getFullYear()) * 12;
}, date => {
  return date.getMonth();
});
timeMonth.range;
const utcMonth = timeInterval(date => {
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCMonth(date.getUTCMonth() + step);
}, (start, end) => {
  return end.getUTCMonth() - start.getUTCMonth() + (end.getUTCFullYear() - start.getUTCFullYear()) * 12;
}, date => {
  return date.getUTCMonth();
});
utcMonth.range;

const timeYear = timeInterval(date => {
  date.setMonth(0, 1);
  date.setHours(0, 0, 0, 0);
}, (date, step) => {
  date.setFullYear(date.getFullYear() + step);
}, (start, end) => {
  return end.getFullYear() - start.getFullYear();
}, date => {
  return date.getFullYear();
});

// An optimized implementation for this simple case.
timeYear.every = k => {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval(date => {
    date.setFullYear(Math.floor(date.getFullYear() / k) * k);
    date.setMonth(0, 1);
    date.setHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setFullYear(date.getFullYear() + step * k);
  });
};
timeYear.range;
const utcYear = timeInterval(date => {
  date.setUTCMonth(0, 1);
  date.setUTCHours(0, 0, 0, 0);
}, (date, step) => {
  date.setUTCFullYear(date.getUTCFullYear() + step);
}, (start, end) => {
  return end.getUTCFullYear() - start.getUTCFullYear();
}, date => {
  return date.getUTCFullYear();
});

// An optimized implementation for this simple case.
utcYear.every = k => {
  return !isFinite(k = Math.floor(k)) || !(k > 0) ? null : timeInterval(date => {
    date.setUTCFullYear(Math.floor(date.getUTCFullYear() / k) * k);
    date.setUTCMonth(0, 1);
    date.setUTCHours(0, 0, 0, 0);
  }, (date, step) => {
    date.setUTCFullYear(date.getUTCFullYear() + step * k);
  });
};
utcYear.range;

function ticker(year, month, week, day, hour, minute) {
  const tickIntervals = [[second, 1, durationSecond], [second, 5, 5 * durationSecond], [second, 15, 15 * durationSecond], [second, 30, 30 * durationSecond], [minute, 1, durationMinute], [minute, 5, 5 * durationMinute], [minute, 15, 15 * durationMinute], [minute, 30, 30 * durationMinute], [hour, 1, durationHour], [hour, 3, 3 * durationHour], [hour, 6, 6 * durationHour], [hour, 12, 12 * durationHour], [day, 1, durationDay], [day, 2, 2 * durationDay], [week, 1, durationWeek], [month, 1, durationMonth], [month, 3, 3 * durationMonth], [year, 1, durationYear]];
  function ticks(start, stop, count) {
    const reverse = stop < start;
    if (reverse) [start, stop] = [stop, start];
    const interval = count && typeof count.range === "function" ? count : tickInterval(start, stop, count);
    const ticks = interval ? interval.range(start, +stop + 1) : []; // inclusive stop
    return reverse ? ticks.reverse() : ticks;
  }
  function tickInterval(start, stop, count) {
    const target = Math.abs(stop - start) / count;
    const i = bisector(([,, step]) => step).right(tickIntervals, target);
    if (i === tickIntervals.length) return year.every(tickStep(start / durationYear, stop / durationYear, count));
    if (i === 0) return millisecond.every(Math.max(tickStep(start, stop, count), 1));
    const [t, step] = tickIntervals[target / tickIntervals[i - 1][2] < tickIntervals[i][2] / target ? i - 1 : i];
    return t.every(step);
  }
  return [ticks, tickInterval];
}
const [timeTicks, timeTickInterval] = ticker(timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute);

function localDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(-1, d.m, d.d, d.H, d.M, d.S, d.L);
    date.setFullYear(d.y);
    return date;
  }
  return new Date(d.y, d.m, d.d, d.H, d.M, d.S, d.L);
}
function utcDate(d) {
  if (0 <= d.y && d.y < 100) {
    var date = new Date(Date.UTC(-1, d.m, d.d, d.H, d.M, d.S, d.L));
    date.setUTCFullYear(d.y);
    return date;
  }
  return new Date(Date.UTC(d.y, d.m, d.d, d.H, d.M, d.S, d.L));
}
function newDate(y, m, d) {
  return {
    y: y,
    m: m,
    d: d,
    H: 0,
    M: 0,
    S: 0,
    L: 0
  };
}
function formatLocale(locale) {
  var locale_dateTime = locale.dateTime,
    locale_date = locale.date,
    locale_time = locale.time,
    locale_periods = locale.periods,
    locale_weekdays = locale.days,
    locale_shortWeekdays = locale.shortDays,
    locale_months = locale.months,
    locale_shortMonths = locale.shortMonths;
  var periodRe = formatRe(locale_periods),
    periodLookup = formatLookup(locale_periods),
    weekdayRe = formatRe(locale_weekdays),
    weekdayLookup = formatLookup(locale_weekdays),
    shortWeekdayRe = formatRe(locale_shortWeekdays),
    shortWeekdayLookup = formatLookup(locale_shortWeekdays),
    monthRe = formatRe(locale_months),
    monthLookup = formatLookup(locale_months),
    shortMonthRe = formatRe(locale_shortMonths),
    shortMonthLookup = formatLookup(locale_shortMonths);
  var formats = {
    "a": formatShortWeekday,
    "A": formatWeekday,
    "b": formatShortMonth,
    "B": formatMonth,
    "c": null,
    "d": formatDayOfMonth,
    "e": formatDayOfMonth,
    "f": formatMicroseconds,
    "g": formatYearISO,
    "G": formatFullYearISO,
    "H": formatHour24,
    "I": formatHour12,
    "j": formatDayOfYear,
    "L": formatMilliseconds,
    "m": formatMonthNumber,
    "M": formatMinutes,
    "p": formatPeriod,
    "q": formatQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatSeconds,
    "u": formatWeekdayNumberMonday,
    "U": formatWeekNumberSunday,
    "V": formatWeekNumberISO,
    "w": formatWeekdayNumberSunday,
    "W": formatWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatYear,
    "Y": formatFullYear,
    "Z": formatZone,
    "%": formatLiteralPercent
  };
  var utcFormats = {
    "a": formatUTCShortWeekday,
    "A": formatUTCWeekday,
    "b": formatUTCShortMonth,
    "B": formatUTCMonth,
    "c": null,
    "d": formatUTCDayOfMonth,
    "e": formatUTCDayOfMonth,
    "f": formatUTCMicroseconds,
    "g": formatUTCYearISO,
    "G": formatUTCFullYearISO,
    "H": formatUTCHour24,
    "I": formatUTCHour12,
    "j": formatUTCDayOfYear,
    "L": formatUTCMilliseconds,
    "m": formatUTCMonthNumber,
    "M": formatUTCMinutes,
    "p": formatUTCPeriod,
    "q": formatUTCQuarter,
    "Q": formatUnixTimestamp,
    "s": formatUnixTimestampSeconds,
    "S": formatUTCSeconds,
    "u": formatUTCWeekdayNumberMonday,
    "U": formatUTCWeekNumberSunday,
    "V": formatUTCWeekNumberISO,
    "w": formatUTCWeekdayNumberSunday,
    "W": formatUTCWeekNumberMonday,
    "x": null,
    "X": null,
    "y": formatUTCYear,
    "Y": formatUTCFullYear,
    "Z": formatUTCZone,
    "%": formatLiteralPercent
  };
  var parses = {
    "a": parseShortWeekday,
    "A": parseWeekday,
    "b": parseShortMonth,
    "B": parseMonth,
    "c": parseLocaleDateTime,
    "d": parseDayOfMonth,
    "e": parseDayOfMonth,
    "f": parseMicroseconds,
    "g": parseYear,
    "G": parseFullYear,
    "H": parseHour24,
    "I": parseHour24,
    "j": parseDayOfYear,
    "L": parseMilliseconds,
    "m": parseMonthNumber,
    "M": parseMinutes,
    "p": parsePeriod,
    "q": parseQuarter,
    "Q": parseUnixTimestamp,
    "s": parseUnixTimestampSeconds,
    "S": parseSeconds,
    "u": parseWeekdayNumberMonday,
    "U": parseWeekNumberSunday,
    "V": parseWeekNumberISO,
    "w": parseWeekdayNumberSunday,
    "W": parseWeekNumberMonday,
    "x": parseLocaleDate,
    "X": parseLocaleTime,
    "y": parseYear,
    "Y": parseFullYear,
    "Z": parseZone,
    "%": parseLiteralPercent
  };

  // These recursive directive definitions must be deferred.
  formats.x = newFormat(locale_date, formats);
  formats.X = newFormat(locale_time, formats);
  formats.c = newFormat(locale_dateTime, formats);
  utcFormats.x = newFormat(locale_date, utcFormats);
  utcFormats.X = newFormat(locale_time, utcFormats);
  utcFormats.c = newFormat(locale_dateTime, utcFormats);
  function newFormat(specifier, formats) {
    return function (date) {
      var string = [],
        i = -1,
        j = 0,
        n = specifier.length,
        c,
        pad,
        format;
      if (!(date instanceof Date)) date = new Date(+date);
      while (++i < n) {
        if (specifier.charCodeAt(i) === 37) {
          string.push(specifier.slice(j, i));
          if ((pad = pads[c = specifier.charAt(++i)]) != null) c = specifier.charAt(++i);else pad = c === "e" ? " " : "0";
          if (format = formats[c]) c = format(date, pad);
          string.push(c);
          j = i + 1;
        }
      }
      string.push(specifier.slice(j, i));
      return string.join("");
    };
  }
  function newParse(specifier, Z) {
    return function (string) {
      var d = newDate(1900, undefined, 1),
        i = parseSpecifier(d, specifier, string += "", 0),
        week,
        day;
      if (i != string.length) return null;

      // If a UNIX timestamp is specified, return it.
      if ("Q" in d) return new Date(d.Q);
      if ("s" in d) return new Date(d.s * 1000 + ("L" in d ? d.L : 0));

      // If this is utcParse, never use the local timezone.
      if (Z && !("Z" in d)) d.Z = 0;

      // The am-pm flag is 0 for AM, and 1 for PM.
      if ("p" in d) d.H = d.H % 12 + d.p * 12;

      // If the month was not specified, inherit from the quarter.
      if (d.m === undefined) d.m = "q" in d ? d.q : 0;

      // Convert day-of-week and week-of-year to day-of-year.
      if ("V" in d) {
        if (d.V < 1 || d.V > 53) return null;
        if (!("w" in d)) d.w = 1;
        if ("Z" in d) {
          week = utcDate(newDate(d.y, 0, 1)), day = week.getUTCDay();
          week = day > 4 || day === 0 ? utcMonday.ceil(week) : utcMonday(week);
          week = utcDay.offset(week, (d.V - 1) * 7);
          d.y = week.getUTCFullYear();
          d.m = week.getUTCMonth();
          d.d = week.getUTCDate() + (d.w + 6) % 7;
        } else {
          week = localDate(newDate(d.y, 0, 1)), day = week.getDay();
          week = day > 4 || day === 0 ? timeMonday.ceil(week) : timeMonday(week);
          week = timeDay.offset(week, (d.V - 1) * 7);
          d.y = week.getFullYear();
          d.m = week.getMonth();
          d.d = week.getDate() + (d.w + 6) % 7;
        }
      } else if ("W" in d || "U" in d) {
        if (!("w" in d)) d.w = "u" in d ? d.u % 7 : "W" in d ? 1 : 0;
        day = "Z" in d ? utcDate(newDate(d.y, 0, 1)).getUTCDay() : localDate(newDate(d.y, 0, 1)).getDay();
        d.m = 0;
        d.d = "W" in d ? (d.w + 6) % 7 + d.W * 7 - (day + 5) % 7 : d.w + d.U * 7 - (day + 6) % 7;
      }

      // If a time zone is specified, all fields are interpreted as UTC and then
      // offset according to the specified time zone.
      if ("Z" in d) {
        d.H += d.Z / 100 | 0;
        d.M += d.Z % 100;
        return utcDate(d);
      }

      // Otherwise, all fields are in local time.
      return localDate(d);
    };
  }
  function parseSpecifier(d, specifier, string, j) {
    var i = 0,
      n = specifier.length,
      m = string.length,
      c,
      parse;
    while (i < n) {
      if (j >= m) return -1;
      c = specifier.charCodeAt(i++);
      if (c === 37) {
        c = specifier.charAt(i++);
        parse = parses[c in pads ? specifier.charAt(i++) : c];
        if (!parse || (j = parse(d, string, j)) < 0) return -1;
      } else if (c != string.charCodeAt(j++)) {
        return -1;
      }
    }
    return j;
  }
  function parsePeriod(d, string, i) {
    var n = periodRe.exec(string.slice(i));
    return n ? (d.p = periodLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortWeekday(d, string, i) {
    var n = shortWeekdayRe.exec(string.slice(i));
    return n ? (d.w = shortWeekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseWeekday(d, string, i) {
    var n = weekdayRe.exec(string.slice(i));
    return n ? (d.w = weekdayLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseShortMonth(d, string, i) {
    var n = shortMonthRe.exec(string.slice(i));
    return n ? (d.m = shortMonthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseMonth(d, string, i) {
    var n = monthRe.exec(string.slice(i));
    return n ? (d.m = monthLookup.get(n[0].toLowerCase()), i + n[0].length) : -1;
  }
  function parseLocaleDateTime(d, string, i) {
    return parseSpecifier(d, locale_dateTime, string, i);
  }
  function parseLocaleDate(d, string, i) {
    return parseSpecifier(d, locale_date, string, i);
  }
  function parseLocaleTime(d, string, i) {
    return parseSpecifier(d, locale_time, string, i);
  }
  function formatShortWeekday(d) {
    return locale_shortWeekdays[d.getDay()];
  }
  function formatWeekday(d) {
    return locale_weekdays[d.getDay()];
  }
  function formatShortMonth(d) {
    return locale_shortMonths[d.getMonth()];
  }
  function formatMonth(d) {
    return locale_months[d.getMonth()];
  }
  function formatPeriod(d) {
    return locale_periods[+(d.getHours() >= 12)];
  }
  function formatQuarter(d) {
    return 1 + ~~(d.getMonth() / 3);
  }
  function formatUTCShortWeekday(d) {
    return locale_shortWeekdays[d.getUTCDay()];
  }
  function formatUTCWeekday(d) {
    return locale_weekdays[d.getUTCDay()];
  }
  function formatUTCShortMonth(d) {
    return locale_shortMonths[d.getUTCMonth()];
  }
  function formatUTCMonth(d) {
    return locale_months[d.getUTCMonth()];
  }
  function formatUTCPeriod(d) {
    return locale_periods[+(d.getUTCHours() >= 12)];
  }
  function formatUTCQuarter(d) {
    return 1 + ~~(d.getUTCMonth() / 3);
  }
  return {
    format: function (specifier) {
      var f = newFormat(specifier += "", formats);
      f.toString = function () {
        return specifier;
      };
      return f;
    },
    parse: function (specifier) {
      var p = newParse(specifier += "", false);
      p.toString = function () {
        return specifier;
      };
      return p;
    },
    utcFormat: function (specifier) {
      var f = newFormat(specifier += "", utcFormats);
      f.toString = function () {
        return specifier;
      };
      return f;
    },
    utcParse: function (specifier) {
      var p = newParse(specifier += "", true);
      p.toString = function () {
        return specifier;
      };
      return p;
    }
  };
}
var pads = {
    "-": "",
    "_": " ",
    "0": "0"
  },
  numberRe = /^\s*\d+/,
  // note: ignores next directive
  percentRe = /^%/,
  requoteRe = /[\\^$*+?|[\]().{}]/g;
function pad(value, fill, width) {
  var sign = value < 0 ? "-" : "",
    string = (sign ? -value : value) + "",
    length = string.length;
  return sign + (length < width ? new Array(width - length + 1).join(fill) + string : string);
}
function requote(s) {
  return s.replace(requoteRe, "\\$&");
}
function formatRe(names) {
  return new RegExp("^(?:" + names.map(requote).join("|") + ")", "i");
}
function formatLookup(names) {
  return new Map(names.map((name, i) => [name.toLowerCase(), i]));
}
function parseWeekdayNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.w = +n[0], i + n[0].length) : -1;
}
function parseWeekdayNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.u = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberSunday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.U = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberISO(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.V = +n[0], i + n[0].length) : -1;
}
function parseWeekNumberMonday(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.W = +n[0], i + n[0].length) : -1;
}
function parseFullYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 4));
  return n ? (d.y = +n[0], i + n[0].length) : -1;
}
function parseYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.y = +n[0] + (+n[0] > 68 ? 1900 : 2000), i + n[0].length) : -1;
}
function parseZone(d, string, i) {
  var n = /^(Z)|([+-]\d\d)(?::?(\d\d))?/.exec(string.slice(i, i + 6));
  return n ? (d.Z = n[1] ? 0 : -(n[2] + (n[3] || "00")), i + n[0].length) : -1;
}
function parseQuarter(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 1));
  return n ? (d.q = n[0] * 3 - 3, i + n[0].length) : -1;
}
function parseMonthNumber(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.m = n[0] - 1, i + n[0].length) : -1;
}
function parseDayOfMonth(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.d = +n[0], i + n[0].length) : -1;
}
function parseDayOfYear(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.m = 0, d.d = +n[0], i + n[0].length) : -1;
}
function parseHour24(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.H = +n[0], i + n[0].length) : -1;
}
function parseMinutes(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.M = +n[0], i + n[0].length) : -1;
}
function parseSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 2));
  return n ? (d.S = +n[0], i + n[0].length) : -1;
}
function parseMilliseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 3));
  return n ? (d.L = +n[0], i + n[0].length) : -1;
}
function parseMicroseconds(d, string, i) {
  var n = numberRe.exec(string.slice(i, i + 6));
  return n ? (d.L = Math.floor(n[0] / 1000), i + n[0].length) : -1;
}
function parseLiteralPercent(d, string, i) {
  var n = percentRe.exec(string.slice(i, i + 1));
  return n ? i + n[0].length : -1;
}
function parseUnixTimestamp(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.Q = +n[0], i + n[0].length) : -1;
}
function parseUnixTimestampSeconds(d, string, i) {
  var n = numberRe.exec(string.slice(i));
  return n ? (d.s = +n[0], i + n[0].length) : -1;
}
function formatDayOfMonth(d, p) {
  return pad(d.getDate(), p, 2);
}
function formatHour24(d, p) {
  return pad(d.getHours(), p, 2);
}
function formatHour12(d, p) {
  return pad(d.getHours() % 12 || 12, p, 2);
}
function formatDayOfYear(d, p) {
  return pad(1 + timeDay.count(timeYear(d), d), p, 3);
}
function formatMilliseconds(d, p) {
  return pad(d.getMilliseconds(), p, 3);
}
function formatMicroseconds(d, p) {
  return formatMilliseconds(d, p) + "000";
}
function formatMonthNumber(d, p) {
  return pad(d.getMonth() + 1, p, 2);
}
function formatMinutes(d, p) {
  return pad(d.getMinutes(), p, 2);
}
function formatSeconds(d, p) {
  return pad(d.getSeconds(), p, 2);
}
function formatWeekdayNumberMonday(d) {
  var day = d.getDay();
  return day === 0 ? 7 : day;
}
function formatWeekNumberSunday(d, p) {
  return pad(timeSunday.count(timeYear(d) - 1, d), p, 2);
}
function dISO(d) {
  var day = d.getDay();
  return day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
}
function formatWeekNumberISO(d, p) {
  d = dISO(d);
  return pad(timeThursday.count(timeYear(d), d) + (timeYear(d).getDay() === 4), p, 2);
}
function formatWeekdayNumberSunday(d) {
  return d.getDay();
}
function formatWeekNumberMonday(d, p) {
  return pad(timeMonday.count(timeYear(d) - 1, d), p, 2);
}
function formatYear(d, p) {
  return pad(d.getFullYear() % 100, p, 2);
}
function formatYearISO(d, p) {
  d = dISO(d);
  return pad(d.getFullYear() % 100, p, 2);
}
function formatFullYear(d, p) {
  return pad(d.getFullYear() % 10000, p, 4);
}
function formatFullYearISO(d, p) {
  var day = d.getDay();
  d = day >= 4 || day === 0 ? timeThursday(d) : timeThursday.ceil(d);
  return pad(d.getFullYear() % 10000, p, 4);
}
function formatZone(d) {
  var z = d.getTimezoneOffset();
  return (z > 0 ? "-" : (z *= -1, "+")) + pad(z / 60 | 0, "0", 2) + pad(z % 60, "0", 2);
}
function formatUTCDayOfMonth(d, p) {
  return pad(d.getUTCDate(), p, 2);
}
function formatUTCHour24(d, p) {
  return pad(d.getUTCHours(), p, 2);
}
function formatUTCHour12(d, p) {
  return pad(d.getUTCHours() % 12 || 12, p, 2);
}
function formatUTCDayOfYear(d, p) {
  return pad(1 + utcDay.count(utcYear(d), d), p, 3);
}
function formatUTCMilliseconds(d, p) {
  return pad(d.getUTCMilliseconds(), p, 3);
}
function formatUTCMicroseconds(d, p) {
  return formatUTCMilliseconds(d, p) + "000";
}
function formatUTCMonthNumber(d, p) {
  return pad(d.getUTCMonth() + 1, p, 2);
}
function formatUTCMinutes(d, p) {
  return pad(d.getUTCMinutes(), p, 2);
}
function formatUTCSeconds(d, p) {
  return pad(d.getUTCSeconds(), p, 2);
}
function formatUTCWeekdayNumberMonday(d) {
  var dow = d.getUTCDay();
  return dow === 0 ? 7 : dow;
}
function formatUTCWeekNumberSunday(d, p) {
  return pad(utcSunday.count(utcYear(d) - 1, d), p, 2);
}
function UTCdISO(d) {
  var day = d.getUTCDay();
  return day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
}
function formatUTCWeekNumberISO(d, p) {
  d = UTCdISO(d);
  return pad(utcThursday.count(utcYear(d), d) + (utcYear(d).getUTCDay() === 4), p, 2);
}
function formatUTCWeekdayNumberSunday(d) {
  return d.getUTCDay();
}
function formatUTCWeekNumberMonday(d, p) {
  return pad(utcMonday.count(utcYear(d) - 1, d), p, 2);
}
function formatUTCYear(d, p) {
  return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCYearISO(d, p) {
  d = UTCdISO(d);
  return pad(d.getUTCFullYear() % 100, p, 2);
}
function formatUTCFullYear(d, p) {
  return pad(d.getUTCFullYear() % 10000, p, 4);
}
function formatUTCFullYearISO(d, p) {
  var day = d.getUTCDay();
  d = day >= 4 || day === 0 ? utcThursday(d) : utcThursday.ceil(d);
  return pad(d.getUTCFullYear() % 10000, p, 4);
}
function formatUTCZone() {
  return "+0000";
}
function formatLiteralPercent() {
  return "%";
}
function formatUnixTimestamp(d) {
  return +d;
}
function formatUnixTimestampSeconds(d) {
  return Math.floor(+d / 1000);
}

var locale;
var timeFormat;
defaultLocale({
  dateTime: "%x, %X",
  date: "%-m/%-d/%Y",
  time: "%-I:%M:%S %p",
  periods: ["AM", "PM"],
  days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  shortDays: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
});
function defaultLocale(definition) {
  locale = formatLocale(definition);
  timeFormat = locale.format;
  locale.parse;
  locale.utcFormat;
  locale.utcParse;
  return locale;
}

function date(t) {
  return new Date(t);
}
function number(t) {
  return t instanceof Date ? +t : +new Date(+t);
}
function calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format) {
  var scale = continuous(),
    invert = scale.invert,
    domain = scale.domain;
  var formatMillisecond = format(".%L"),
    formatSecond = format(":%S"),
    formatMinute = format("%I:%M"),
    formatHour = format("%I %p"),
    formatDay = format("%a %d"),
    formatWeek = format("%b %d"),
    formatMonth = format("%B"),
    formatYear = format("%Y");
  function tickFormat(date) {
    return (second(date) < date ? formatMillisecond : minute(date) < date ? formatSecond : hour(date) < date ? formatMinute : day(date) < date ? formatHour : month(date) < date ? week(date) < date ? formatDay : formatWeek : year(date) < date ? formatMonth : formatYear)(date);
  }
  scale.invert = function (y) {
    return new Date(invert(y));
  };
  scale.domain = function (_) {
    return arguments.length ? domain(Array.from(_, number)) : domain().map(date);
  };
  scale.ticks = function (interval) {
    var d = domain();
    return ticks(d[0], d[d.length - 1], interval == null ? 10 : interval);
  };
  scale.tickFormat = function (count, specifier) {
    return specifier == null ? tickFormat : format(specifier);
  };
  scale.nice = function (interval) {
    var d = domain();
    if (!interval || typeof interval.range !== "function") interval = tickInterval(d[0], d[d.length - 1], interval == null ? 10 : interval);
    return interval ? domain(nice(d, interval)) : scale;
  };
  scale.copy = function () {
    return copy(scale, calendar(ticks, tickInterval, year, month, week, day, hour, minute, second, format));
  };
  return scale;
}
function time() {
  return initRange.apply(calendar(timeTicks, timeTickInterval, timeYear, timeMonth, timeSunday, timeDay, timeHour, timeMinute, second, timeFormat).domain([new Date(2000, 0, 1), new Date(2000, 0, 2)]), arguments);
}

function Transform(k, x, y) {
  this.k = k;
  this.x = x;
  this.y = y;
}
Transform.prototype = {
  constructor: Transform,
  scale: function (k) {
    return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
  },
  translate: function (x, y) {
    return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
  },
  apply: function (point) {
    return [point[0] * this.k + this.x, point[1] * this.k + this.y];
  },
  applyX: function (x) {
    return x * this.k + this.x;
  },
  applyY: function (y) {
    return y * this.k + this.y;
  },
  invert: function (location) {
    return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
  },
  invertX: function (x) {
    return (x - this.x) / this.k;
  },
  invertY: function (y) {
    return (y - this.y) / this.k;
  },
  rescaleX: function (x) {
    return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
  },
  rescaleY: function (y) {
    return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
  },
  toString: function () {
    return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
  }
};
Transform.prototype;

function CatalogReleaseChart(props) {
    const { name, catalogData, nameAttribute, retiredDateAttribute, currentDateAttribute, upcomingCodeAttribute, chartTitle, enableLegend, onItemClick, refreshInterval, chartHeight, showToday } = props;
    const chartRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: chartHeight });
    const [industries, setIndustries] = useState([]);
    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { width } = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: width,
                    height: chartHeight
                });
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, [chartHeight]);
    // Process data from Mendix data source
    useEffect(() => {
        if (catalogData && catalogData.status === "available" /* ValueStatus.Available */ && catalogData.items) {
            const processedIndustries = catalogData.items
                .map(item => {
                try {
                    const name = nameAttribute.get(item);
                    const retiredDate = retiredDateAttribute.get(item);
                    const currentDate = currentDateAttribute.get(item);
                    const upcomingCode = upcomingCodeAttribute.get(item);
                    // Validate that all required data is available
                    if (name.status !== "available" /* ValueStatus.Available */ ||
                        retiredDate.status !== "available" /* ValueStatus.Available */ ||
                        currentDate.status !== "available" /* ValueStatus.Available */ ||
                        upcomingCode.status !== "available" /* ValueStatus.Available */) {
                        return null;
                    }
                    return {
                        name: name.value || "",
                        retired: retiredDate.value || new Date(),
                        current: currentDate.value || new Date(),
                        upcoming: upcomingCode.value || "TBD"
                    };
                }
                catch (error) {
                    console.error("Error processing catalog data item:", error);
                    return null;
                }
            })
                .filter((item) => item !== null)
                .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name
            setIndustries(processedIndustries);
        }
        else {
            setIndustries([]);
        }
    }, [catalogData, nameAttribute, retiredDateAttribute, currentDateAttribute, upcomingCodeAttribute]);
    // Auto-refresh functionality
    useEffect(() => {
        if (refreshInterval > 0) {
            const interval = setInterval(() => {
                if (catalogData && catalogData.reload) {
                    catalogData.reload();
                }
            }, refreshInterval * 1000);
            return () => clearInterval(interval);
        }
    }, [refreshInterval, catalogData]);
    // Render chart
    useEffect(() => {
        if (!chartRef.current || dimensions.width === 0 || industries.length === 0)
            return;
        // Clear any existing chart
        select(chartRef.current).selectAll("*").remove();
        // Responsive margins based on container width
        const margin = {
            top: 80,
            right: dimensions.width < 800 ? 100 : 150,
            bottom: 40,
            left: dimensions.width < 800 ? 120 : 180
        };
        const width = dimensions.width - margin.left - margin.right;
        const height = dimensions.height - margin.top - margin.bottom;
        // Create SVG with viewBox for better scaling
        const svg = select(chartRef.current)
            .append("svg")
            .attr("width", dimensions.width)
            .attr("height", dimensions.height)
            .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`)
            .attr("preserveAspectRatio", "xMidYMid meet")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);
        // Time scale
        const timeScale = time()
            .domain([new Date(2022, 7, 1), new Date(2025, 11, 31)])
            .range([0, width]);
        // Y scale for industries
        const yScale = band()
            .domain(industries.map(d => d.name))
            .range([0, height])
            .padding(0.3);
        // Add timeline dates
        const timelineDates = [
            new Date(2022, 7, 1),
            new Date(2023, 2, 1),
            new Date(2023, 9, 1),
            new Date(2024, 3, 1),
            new Date(2024, 10, 1),
            new Date(2025, 4, 1),
            new Date(2025, 11, 1)
        ];
        // Draw main timeline
        svg.append("line")
            .attr("class", "timeline-line")
            .attr("x1", 0)
            .attr("y1", -40)
            .attr("x2", width)
            .attr("y2", -40);
        // Add timeline markers and labels
        timelineDates.forEach(date => {
            const x = timeScale(date);
            svg.append("circle")
                .attr("cx", x)
                .attr("cy", -40)
                .attr("r", 4)
                .attr("fill", "#2c5282");
            svg.append("text")
                .attr("class", "date-text")
                .attr("x", x)
                .attr("y", -50)
                .attr("text-anchor", "middle")
                .text(timeFormat("%b-%y")(date));
        });
        // Add today's date (if enabled)
        if (showToday) {
            const today = new Date();
            const todayX = timeScale(today);
            // Today's vertical line
            svg.append("line")
                .attr("class", "today-line")
                .attr("x1", todayX)
                .attr("y1", -40)
                .attr("x2", todayX)
                .attr("y2", height);
            // Today's circle
            svg.append("circle")
                .attr("class", "today-circle")
                .attr("cx", todayX)
                .attr("cy", -40)
                .attr("r", 8);
            // Today's date label
            svg.append("text")
                .attr("class", "today-text")
                .attr("x", todayX)
                .attr("y", -65)
                .attr("text-anchor", "middle")
                .text(timeFormat("%-m/%-d/%Y")(today));
        }
        // Adjust font sizes for smaller screens
        const fontSize = dimensions.width < 800 ? "12px" : "14px";
        // Draw industry rows
        industries.forEach((industry) => {
            const y = yScale(industry.name) + yScale.bandwidth() / 2;
            // Industry name
            svg.append("text")
                .attr("class", "industry-text")
                .attr("x", -10)
                .attr("y", y + 5)
                .attr("text-anchor", "end")
                .style("font-size", fontSize)
                .text(industry.name);
            // Industry line
            svg.append("line")
                .attr("class", "industry-line")
                .attr("x1", 0)
                .attr("y1", y)
                .attr("x2", width)
                .attr("y2", y);
            // Continuity line between retired and current
            if (industry.retired && industry.current) {
                const retiredX = timeScale(industry.retired);
                const currentX = timeScale(industry.current);
                svg.append("line")
                    .attr("class", "continuity-line")
                    .attr("x1", retiredX)
                    .attr("y1", y)
                    .attr("x2", currentX)
                    .attr("y2", y);
            }
            // Future continuity line from current to upcoming
            let upcomingXPos = width + 20;
            if (industry.upcoming !== "TBD") {
                const year = parseInt("20" + industry.upcoming.substring(0, 2));
                const month = parseInt(industry.upcoming.substring(2, 4)) - 1;
                const upcomingDate = new Date(year, month, 1);
                if (upcomingDate <= timeScale.domain()[1]) {
                    upcomingXPos = timeScale(upcomingDate);
                }
                else {
                    upcomingXPos = width;
                }
            }
            else {
                upcomingXPos = width + 20;
            }
            if (industry.current) {
                const currentX = timeScale(industry.current);
                let lineEndX = upcomingXPos;
                if (industry.upcoming === "TBD") {
                    lineEndX = width;
                }
                else {
                    const upcomingDate = new Date(parseInt("20" + industry.upcoming.substring(0, 2)), parseInt(industry.upcoming.substring(2, 4)) - 1, 1);
                    if (upcomingDate > timeScale.domain()[1]) {
                        lineEndX = width;
                    }
                    else {
                        lineEndX = timeScale(upcomingDate);
                    }
                }
                svg.append("line")
                    .attr("class", "future-continuity-line")
                    .attr("x1", currentX)
                    .attr("y1", y)
                    .attr("x2", lineEndX)
                    .attr("y2", y);
            }
            // Retired marker (diamond)
            if (industry.retired) {
                const retiredX = timeScale(industry.retired);
                const retiredMarker = svg.append("rect")
                    .attr("class", "retired-marker")
                    .attr("x", retiredX - 10)
                    .attr("y", y - 10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("rx", 10)
                    .attr("transform", `rotate(45 ${retiredX} ${y})`)
                    .style("cursor", onItemClick ? "pointer" : "default");
                if (onItemClick) {
                    retiredMarker.on("click", () => onItemClick.execute());
                }
            }
            // Current marker (diamond)
            if (industry.current) {
                const currentX = timeScale(industry.current);
                const currentMarker = svg.append("rect")
                    .attr("class", "current-marker")
                    .attr("x", currentX - 10)
                    .attr("y", y - 10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("rx", 10)
                    .attr("transform", `rotate(45 ${currentX} ${y})`)
                    .style("cursor", onItemClick ? "pointer" : "default");
                if (onItemClick) {
                    currentMarker.on("click", () => onItemClick.execute());
                }
            }
            // Upcoming box - adjusted positioning
            let boxX = upcomingXPos;
            if (industry.upcoming !== "TBD") {
                const year = parseInt("20" + industry.upcoming.substring(0, 2));
                const month = parseInt(industry.upcoming.substring(2, 4)) - 1;
                const upcomingDate = new Date(year, month, 1);
                if (upcomingDate <= timeScale.domain()[1]) {
                    boxX = timeScale(upcomingDate) - 30;
                }
                else {
                    boxX = width - 70;
                }
            }
            else {
                boxX = width - 70;
            }
            const upcomingBox = svg.append("rect")
                .attr("class", "upcoming-box")
                .attr("x", boxX)
                .attr("y", y - 15)
                .attr("width", 60)
                .attr("height", 30)
                .attr("rx", 4)
                .style("cursor", onItemClick ? "pointer" : "default");
            if (onItemClick) {
                upcomingBox.on("click", () => onItemClick.execute());
            }
            svg.append("text")
                .attr("class", "upcoming-text")
                .attr("x", boxX + 30)
                .attr("y", y + 5)
                .style("font-size", fontSize)
                .text(industry.upcoming);
        });
    }, [dimensions, industries, showToday, onItemClick]);
    // Loading state
    if (!catalogData || catalogData.status === "loading" /* ValueStatus.Loading */) {
        return (createElement("div", { className: `catalog-release-chart ${name}`, ref: containerRef },
            createElement("div", { className: "chart-container" },
                createElement("h1", { className: "chart-title" }, chartTitle),
                createElement("div", { className: "loading-message" }, "Loading catalog data..."))));
    }
    // Error state
    if (catalogData.status === "unavailable" /* ValueStatus.Unavailable */) {
        return (createElement("div", { className: `catalog-release-chart ${name}`, ref: containerRef },
            createElement("div", { className: "chart-container" },
                createElement("h1", { className: "chart-title" }, chartTitle),
                createElement("div", { className: "error-message" }, "Unable to load catalog data. Please check your data source configuration."))));
    }
    // No data state
    if (!catalogData.items || catalogData.items.length === 0) {
        return (createElement("div", { className: `catalog-release-chart ${name}`, ref: containerRef },
            createElement("div", { className: "chart-container" },
                createElement("h1", { className: "chart-title" }, chartTitle),
                createElement("div", { className: "no-data-message" }, "No catalog data available. Please add catalog release schedules to see the chart."))));
    }
    return (createElement("div", { className: `catalog-release-chart ${name}`, ref: containerRef, style: { width: '100%', height: '100%' } },
        createElement("div", { className: "chart-container" },
            createElement("h1", { className: "chart-title" }, chartTitle),
            enableLegend && (createElement("div", { className: "legend" },
                createElement("div", { className: "legend-item" },
                    createElement("svg", { className: "legend-symbol", viewBox: "0 0 20 20" },
                        createElement("rect", { x: "2", y: "2", width: "16", height: "16", rx: "50%", className: "retired-marker" })),
                    createElement("span", null, "Retired Catalog")),
                createElement("div", { className: "legend-item" },
                    createElement("svg", { className: "legend-symbol", viewBox: "0 0 20 20" },
                        createElement("rect", { x: "2", y: "2", width: "16", height: "16", rx: "50%", className: "current-marker" })),
                    createElement("span", null, "Current Catalog")),
                createElement("div", { className: "legend-item" },
                    createElement("svg", { className: "legend-symbol", viewBox: "0 0 20 20" },
                        createElement("rect", { x: "2", y: "2", width: "16", height: "16", rx: "2", className: "upcoming-box" })),
                    createElement("span", null, "Upcoming Catalog")),
                showToday && (createElement("div", { className: "legend-item" },
                    createElement("svg", { className: "legend-symbol", viewBox: "0 0 20 20" },
                        createElement("circle", { cx: "10", cy: "10", r: "5", className: "today-circle" })),
                    createElement("span", null, "Today's Date"))))),
            createElement("div", { ref: chartRef, id: "chart", style: { width: '100%' } }))));
}

export { CatalogReleaseChart };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2F0YWxvZ1JlbGVhc2VDaGFydC5tanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvYXNjZW5kaW5nLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9kZXNjZW5kaW5nLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9iaXNlY3Rvci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbnVtYmVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9iaXNlY3QuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvaW50ZXJubWFwL3NyYy9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvdGlja3MuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3JhbmdlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWRpc3BhdGNoL3NyYy9kaXNwYXRjaC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL25hbWVzcGFjZXMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9uYW1lc3BhY2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9jcmVhdG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0b3IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvYXJyYXkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3RvckFsbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3RBbGwuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9tYXRjaGVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkcmVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2ZpbHRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zcGFyc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZW50ZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9jb25zdGFudC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXRhLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2V4aXQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vam9pbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9tZXJnZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vcmRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zb3J0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2NhbGwuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZXMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zaXplLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VtcHR5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VhY2guanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vYXR0ci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3dpbmRvdy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zdHlsZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9wcm9wZXJ0eS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbGFzc2VkLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3RleHQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaHRtbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yYWlzZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9sb3dlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hcHBlbmQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5zZXJ0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3JlbW92ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbG9uZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXR1bS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kaXNwYXRjaC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pdGVyYXRvci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1jb2xvci9zcmMvZGVmaW5lLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9jb2xvci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvY29uc3RhbnQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2NvbG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9yZ2IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL251bWJlckFycmF5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9hcnJheS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvZGF0ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvbnVtYmVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9vYmplY3QuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3N0cmluZy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdmFsdWUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3JvdW5kLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy90cmFuc2Zvcm0vZGVjb21wb3NlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy90cmFuc2Zvcm0vcGFyc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZXIvc3JjL3RpbWVvdXQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zY2hlZHVsZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9pbnRlcnJ1cHQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL2ludGVycnVwdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3R3ZWVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW50ZXJwb2xhdGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9hdHRyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vYXR0clR3ZWVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZGVsYXkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9kdXJhdGlvbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2Vhc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9lYXNlVmFyeWluZy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2ZpbHRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL21lcmdlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vb24uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9yZW1vdmUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3QuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3RBbGwuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3Rpb24uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zdHlsZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlVHdlZW4uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi90ZXh0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdGV4dFR3ZWVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHJhbnNpdGlvbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2VuZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL2N1YmljLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi90cmFuc2l0aW9uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvaW5pdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvb3JkaW5hbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvYmFuZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvY29uc3RhbnQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL251bWJlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvY29udGludW91cy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvbmljZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9pbnRlcnZhbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9taWxsaXNlY29uZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9kdXJhdGlvbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9zZWNvbmQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvbWludXRlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL2hvdXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvZGF5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL3dlZWsuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvbW9udGguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMveWVhci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy90aWNrcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lLWZvcm1hdC9zcmMvbG9jYWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUtZm9ybWF0L3NyYy9kZWZhdWx0TG9jYWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy90aW1lLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXpvb20vc3JjL3RyYW5zZm9ybS5qcyIsIi4uLy4uLy4uLy4uLy4uL3NyYy9DYXRhbG9nUmVsZWFzZUNoYXJ0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICByZXR1cm4gYSA9PSBudWxsIHx8IGIgPT0gbnVsbCA/IE5hTiA6IGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiBhID49IGIgPyAwIDogTmFOO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhID09IG51bGwgfHwgYiA9PSBudWxsID8gTmFOXG4gICAgOiBiIDwgYSA/IC0xXG4gICAgOiBiID4gYSA/IDFcbiAgICA6IGIgPj0gYSA/IDBcbiAgICA6IE5hTjtcbn1cbiIsImltcG9ydCBhc2NlbmRpbmcgZnJvbSBcIi4vYXNjZW5kaW5nLmpzXCI7XG5pbXBvcnQgZGVzY2VuZGluZyBmcm9tIFwiLi9kZXNjZW5kaW5nLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJpc2VjdG9yKGYpIHtcbiAgbGV0IGNvbXBhcmUxLCBjb21wYXJlMiwgZGVsdGE7XG5cbiAgLy8gSWYgYW4gYWNjZXNzb3IgaXMgc3BlY2lmaWVkLCBwcm9tb3RlIGl0IHRvIGEgY29tcGFyYXRvci4gSW4gdGhpcyBjYXNlIHdlXG4gIC8vIGNhbiB0ZXN0IHdoZXRoZXIgdGhlIHNlYXJjaCB2YWx1ZSBpcyAoc2VsZi0pIGNvbXBhcmFibGUuIFdlIGNhbuKAmXQgZG8gdGhpc1xuICAvLyBmb3IgYSBjb21wYXJhdG9yIChleGNlcHQgZm9yIHNwZWNpZmljLCBrbm93biBjb21wYXJhdG9ycykgYmVjYXVzZSB3ZSBjYW7igJl0XG4gIC8vIHRlbGwgaWYgdGhlIGNvbXBhcmF0b3IgaXMgc3ltbWV0cmljLCBhbmQgYW4gYXN5bW1ldHJpYyBjb21wYXJhdG9yIGNhbuKAmXQgYmVcbiAgLy8gdXNlZCB0byB0ZXN0IHdoZXRoZXIgYSBzaW5nbGUgdmFsdWUgaXMgY29tcGFyYWJsZS5cbiAgaWYgKGYubGVuZ3RoICE9PSAyKSB7XG4gICAgY29tcGFyZTEgPSBhc2NlbmRpbmc7XG4gICAgY29tcGFyZTIgPSAoZCwgeCkgPT4gYXNjZW5kaW5nKGYoZCksIHgpO1xuICAgIGRlbHRhID0gKGQsIHgpID0+IGYoZCkgLSB4O1xuICB9IGVsc2Uge1xuICAgIGNvbXBhcmUxID0gZiA9PT0gYXNjZW5kaW5nIHx8IGYgPT09IGRlc2NlbmRpbmcgPyBmIDogemVybztcbiAgICBjb21wYXJlMiA9IGY7XG4gICAgZGVsdGEgPSBmO1xuICB9XG5cbiAgZnVuY3Rpb24gbGVmdChhLCB4LCBsbyA9IDAsIGhpID0gYS5sZW5ndGgpIHtcbiAgICBpZiAobG8gPCBoaSkge1xuICAgICAgaWYgKGNvbXBhcmUxKHgsIHgpICE9PSAwKSByZXR1cm4gaGk7XG4gICAgICBkbyB7XG4gICAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgICAgaWYgKGNvbXBhcmUyKGFbbWlkXSwgeCkgPCAwKSBsbyA9IG1pZCArIDE7XG4gICAgICAgIGVsc2UgaGkgPSBtaWQ7XG4gICAgICB9IHdoaWxlIChsbyA8IGhpKTtcbiAgICB9XG4gICAgcmV0dXJuIGxvO1xuICB9XG5cbiAgZnVuY3Rpb24gcmlnaHQoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgaWYgKGxvIDwgaGkpIHtcbiAgICAgIGlmIChjb21wYXJlMSh4LCB4KSAhPT0gMCkgcmV0dXJuIGhpO1xuICAgICAgZG8ge1xuICAgICAgICBjb25zdCBtaWQgPSAobG8gKyBoaSkgPj4+IDE7XG4gICAgICAgIGlmIChjb21wYXJlMihhW21pZF0sIHgpIDw9IDApIGxvID0gbWlkICsgMTtcbiAgICAgICAgZWxzZSBoaSA9IG1pZDtcbiAgICAgIH0gd2hpbGUgKGxvIDwgaGkpO1xuICAgIH1cbiAgICByZXR1cm4gbG87XG4gIH1cblxuICBmdW5jdGlvbiBjZW50ZXIoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgY29uc3QgaSA9IGxlZnQoYSwgeCwgbG8sIGhpIC0gMSk7XG4gICAgcmV0dXJuIGkgPiBsbyAmJiBkZWx0YShhW2kgLSAxXSwgeCkgPiAtZGVsdGEoYVtpXSwgeCkgPyBpIC0gMSA6IGk7XG4gIH1cblxuICByZXR1cm4ge2xlZnQsIGNlbnRlciwgcmlnaHR9O1xufVxuXG5mdW5jdGlvbiB6ZXJvKCkge1xuICByZXR1cm4gMDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG51bWJlcih4KSB7XG4gIHJldHVybiB4ID09PSBudWxsID8gTmFOIDogK3g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiogbnVtYmVycyh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgKHZhbHVlID0gK3ZhbHVlKSA+PSB2YWx1ZSkge1xuICAgICAgICB5aWVsZCB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAoKHZhbHVlID0gdmFsdWVvZih2YWx1ZSwgKytpbmRleCwgdmFsdWVzKSkgIT0gbnVsbCAmJiAodmFsdWUgPSArdmFsdWUpID49IHZhbHVlKSB7XG4gICAgICAgIHlpZWxkIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IGFzY2VuZGluZyBmcm9tIFwiLi9hc2NlbmRpbmcuanNcIjtcbmltcG9ydCBiaXNlY3RvciBmcm9tIFwiLi9iaXNlY3Rvci5qc1wiO1xuaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxuY29uc3QgYXNjZW5kaW5nQmlzZWN0ID0gYmlzZWN0b3IoYXNjZW5kaW5nKTtcbmV4cG9ydCBjb25zdCBiaXNlY3RSaWdodCA9IGFzY2VuZGluZ0Jpc2VjdC5yaWdodDtcbmV4cG9ydCBjb25zdCBiaXNlY3RMZWZ0ID0gYXNjZW5kaW5nQmlzZWN0LmxlZnQ7XG5leHBvcnQgY29uc3QgYmlzZWN0Q2VudGVyID0gYmlzZWN0b3IobnVtYmVyKS5jZW50ZXI7XG5leHBvcnQgZGVmYXVsdCBiaXNlY3RSaWdodDtcbiIsImV4cG9ydCBjbGFzcyBJbnRlcm5NYXAgZXh0ZW5kcyBNYXAge1xuICBjb25zdHJ1Y3RvcihlbnRyaWVzLCBrZXkgPSBrZXlvZikge1xuICAgIHN1cGVyKCk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge19pbnRlcm46IHt2YWx1ZTogbmV3IE1hcCgpfSwgX2tleToge3ZhbHVlOiBrZXl9fSk7XG4gICAgaWYgKGVudHJpZXMgIT0gbnVsbCkgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgZW50cmllcykgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gIH1cbiAgZ2V0KGtleSkge1xuICAgIHJldHVybiBzdXBlci5nZXQoaW50ZXJuX2dldCh0aGlzLCBrZXkpKTtcbiAgfVxuICBoYXMoa2V5KSB7XG4gICAgcmV0dXJuIHN1cGVyLmhhcyhpbnRlcm5fZ2V0KHRoaXMsIGtleSkpO1xuICB9XG4gIHNldChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLnNldChpbnRlcm5fc2V0KHRoaXMsIGtleSksIHZhbHVlKTtcbiAgfVxuICBkZWxldGUoa2V5KSB7XG4gICAgcmV0dXJuIHN1cGVyLmRlbGV0ZShpbnRlcm5fZGVsZXRlKHRoaXMsIGtleSkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbnRlcm5TZXQgZXh0ZW5kcyBTZXQge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZXMsIGtleSA9IGtleW9mKSB7XG4gICAgc3VwZXIoKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7X2ludGVybjoge3ZhbHVlOiBuZXcgTWFwKCl9LCBfa2V5OiB7dmFsdWU6IGtleX19KTtcbiAgICBpZiAodmFsdWVzICE9IG51bGwpIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB0aGlzLmFkZCh2YWx1ZSk7XG4gIH1cbiAgaGFzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmhhcyhpbnRlcm5fZ2V0KHRoaXMsIHZhbHVlKSk7XG4gIH1cbiAgYWRkKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmFkZChpbnRlcm5fc2V0KHRoaXMsIHZhbHVlKSk7XG4gIH1cbiAgZGVsZXRlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmRlbGV0ZShpbnRlcm5fZGVsZXRlKHRoaXMsIHZhbHVlKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW50ZXJuX2dldCh7X2ludGVybiwgX2tleX0sIHZhbHVlKSB7XG4gIGNvbnN0IGtleSA9IF9rZXkodmFsdWUpO1xuICByZXR1cm4gX2ludGVybi5oYXMoa2V5KSA/IF9pbnRlcm4uZ2V0KGtleSkgOiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gaW50ZXJuX3NldCh7X2ludGVybiwgX2tleX0sIHZhbHVlKSB7XG4gIGNvbnN0IGtleSA9IF9rZXkodmFsdWUpO1xuICBpZiAoX2ludGVybi5oYXMoa2V5KSkgcmV0dXJuIF9pbnRlcm4uZ2V0KGtleSk7XG4gIF9pbnRlcm4uc2V0KGtleSwgdmFsdWUpO1xuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGludGVybl9kZWxldGUoe19pbnRlcm4sIF9rZXl9LCB2YWx1ZSkge1xuICBjb25zdCBrZXkgPSBfa2V5KHZhbHVlKTtcbiAgaWYgKF9pbnRlcm4uaGFzKGtleSkpIHtcbiAgICB2YWx1ZSA9IF9pbnRlcm4uZ2V0KGtleSk7XG4gICAgX2ludGVybi5kZWxldGUoa2V5KTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGtleW9mKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbn1cbiIsImNvbnN0IGUxMCA9IE1hdGguc3FydCg1MCksXG4gICAgZTUgPSBNYXRoLnNxcnQoMTApLFxuICAgIGUyID0gTWF0aC5zcXJ0KDIpO1xuXG5mdW5jdGlvbiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgY29uc3Qgc3RlcCA9IChzdG9wIC0gc3RhcnQpIC8gTWF0aC5tYXgoMCwgY291bnQpLFxuICAgICAgcG93ZXIgPSBNYXRoLmZsb29yKE1hdGgubG9nMTAoc3RlcCkpLFxuICAgICAgZXJyb3IgPSBzdGVwIC8gTWF0aC5wb3coMTAsIHBvd2VyKSxcbiAgICAgIGZhY3RvciA9IGVycm9yID49IGUxMCA/IDEwIDogZXJyb3IgPj0gZTUgPyA1IDogZXJyb3IgPj0gZTIgPyAyIDogMTtcbiAgbGV0IGkxLCBpMiwgaW5jO1xuICBpZiAocG93ZXIgPCAwKSB7XG4gICAgaW5jID0gTWF0aC5wb3coMTAsIC1wb3dlcikgLyBmYWN0b3I7XG4gICAgaTEgPSBNYXRoLnJvdW5kKHN0YXJ0ICogaW5jKTtcbiAgICBpMiA9IE1hdGgucm91bmQoc3RvcCAqIGluYyk7XG4gICAgaWYgKGkxIC8gaW5jIDwgc3RhcnQpICsraTE7XG4gICAgaWYgKGkyIC8gaW5jID4gc3RvcCkgLS1pMjtcbiAgICBpbmMgPSAtaW5jO1xuICB9IGVsc2Uge1xuICAgIGluYyA9IE1hdGgucG93KDEwLCBwb3dlcikgKiBmYWN0b3I7XG4gICAgaTEgPSBNYXRoLnJvdW5kKHN0YXJ0IC8gaW5jKTtcbiAgICBpMiA9IE1hdGgucm91bmQoc3RvcCAvIGluYyk7XG4gICAgaWYgKGkxICogaW5jIDwgc3RhcnQpICsraTE7XG4gICAgaWYgKGkyICogaW5jID4gc3RvcCkgLS1pMjtcbiAgfVxuICBpZiAoaTIgPCBpMSAmJiAwLjUgPD0gY291bnQgJiYgY291bnQgPCAyKSByZXR1cm4gdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50ICogMik7XG4gIHJldHVybiBbaTEsIGkyLCBpbmNdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aWNrcyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgc3RvcCA9ICtzdG9wLCBzdGFydCA9ICtzdGFydCwgY291bnQgPSArY291bnQ7XG4gIGlmICghKGNvdW50ID4gMCkpIHJldHVybiBbXTtcbiAgaWYgKHN0YXJ0ID09PSBzdG9wKSByZXR1cm4gW3N0YXJ0XTtcbiAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydCwgW2kxLCBpMiwgaW5jXSA9IHJldmVyc2UgPyB0aWNrU3BlYyhzdG9wLCBzdGFydCwgY291bnQpIDogdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgaWYgKCEoaTIgPj0gaTEpKSByZXR1cm4gW107XG4gIGNvbnN0IG4gPSBpMiAtIGkxICsgMSwgdGlja3MgPSBuZXcgQXJyYXkobik7XG4gIGlmIChyZXZlcnNlKSB7XG4gICAgaWYgKGluYyA8IDApIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMiAtIGkpIC8gLWluYztcbiAgICBlbHNlIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMiAtIGkpICogaW5jO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbmMgPCAwKSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTEgKyBpKSAvIC1pbmM7XG4gICAgZWxzZSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTEgKyBpKSAqIGluYztcbiAgfVxuICByZXR1cm4gdGlja3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrSW5jcmVtZW50KHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgcmV0dXJuIHRpY2tTcGVjKHN0YXJ0LCBzdG9wLCBjb3VudClbMl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrU3RlcChzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgc3RvcCA9ICtzdG9wLCBzdGFydCA9ICtzdGFydCwgY291bnQgPSArY291bnQ7XG4gIGNvbnN0IHJldmVyc2UgPSBzdG9wIDwgc3RhcnQsIGluYyA9IHJldmVyc2UgPyB0aWNrSW5jcmVtZW50KHN0b3AsIHN0YXJ0LCBjb3VudCkgOiB0aWNrSW5jcmVtZW50KHN0YXJ0LCBzdG9wLCBjb3VudCk7XG4gIHJldHVybiAocmV2ZXJzZSA/IC0xIDogMSkgKiAoaW5jIDwgMCA/IDEgLyAtaW5jIDogaW5jKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJhbmdlKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gIHN0YXJ0ID0gK3N0YXJ0LCBzdG9wID0gK3N0b3AsIHN0ZXAgPSAobiA9IGFyZ3VtZW50cy5sZW5ndGgpIDwgMiA/IChzdG9wID0gc3RhcnQsIHN0YXJ0ID0gMCwgMSkgOiBuIDwgMyA/IDEgOiArc3RlcDtcblxuICB2YXIgaSA9IC0xLFxuICAgICAgbiA9IE1hdGgubWF4KDAsIE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApKSB8IDAsXG4gICAgICByYW5nZSA9IG5ldyBBcnJheShuKTtcblxuICB3aGlsZSAoKytpIDwgbikge1xuICAgIHJhbmdlW2ldID0gc3RhcnQgKyBpICogc3RlcDtcbiAgfVxuXG4gIHJldHVybiByYW5nZTtcbn1cbiIsInZhciBub29wID0ge3ZhbHVlOiAoKSA9PiB7fX07XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKCkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGFyZ3VtZW50cy5sZW5ndGgsIF8gPSB7fSwgdDsgaSA8IG47ICsraSkge1xuICAgIGlmICghKHQgPSBhcmd1bWVudHNbaV0gKyBcIlwiKSB8fCAodCBpbiBfKSB8fCAvW1xccy5dLy50ZXN0KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIHR5cGU6IFwiICsgdCk7XG4gICAgX1t0XSA9IFtdO1xuICB9XG4gIHJldHVybiBuZXcgRGlzcGF0Y2goXyk7XG59XG5cbmZ1bmN0aW9uIERpc3BhdGNoKF8pIHtcbiAgdGhpcy5fID0gXztcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzLCB0eXBlcykge1xuICByZXR1cm4gdHlwZW5hbWVzLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgbmFtZSA9IFwiXCIsIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIG5hbWUgPSB0LnNsaWNlKGkgKyAxKSwgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgaWYgKHQgJiYgIXR5cGVzLmhhc093blByb3BlcnR5KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdCk7XG4gICAgcmV0dXJuIHt0eXBlOiB0LCBuYW1lOiBuYW1lfTtcbiAgfSk7XG59XG5cbkRpc3BhdGNoLnByb3RvdHlwZSA9IGRpc3BhdGNoLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IERpc3BhdGNoLFxuICBvbjogZnVuY3Rpb24odHlwZW5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIF8gPSB0aGlzLl8sXG4gICAgICAgIFQgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIsIF8pLFxuICAgICAgICB0LFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSBULmxlbmd0aDtcblxuICAgIC8vIElmIG5vIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJldHVybiB0aGUgY2FsbGJhY2sgb2YgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgJiYgKHQgPSBnZXQoX1t0XSwgdHlwZW5hbWUubmFtZSkpKSByZXR1cm4gdDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiBhIHR5cGUgd2FzIHNwZWNpZmllZCwgc2V0IHRoZSBjYWxsYmFjayBmb3IgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiBhIG51bGwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmVtb3ZlIGNhbGxiYWNrcyBvZiB0aGUgZ2l2ZW4gbmFtZS5cbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlmICh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBjYWxsYmFjayk7XG4gICAgICBlbHNlIGlmIChjYWxsYmFjayA9PSBudWxsKSBmb3IgKHQgaW4gXykgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY29weTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvcHkgPSB7fSwgXyA9IHRoaXMuXztcbiAgICBmb3IgKHZhciB0IGluIF8pIGNvcHlbdF0gPSBfW3RdLnNsaWNlKCk7XG4gICAgcmV0dXJuIG5ldyBEaXNwYXRjaChjb3B5KTtcbiAgfSxcbiAgY2FsbDogZnVuY3Rpb24odHlwZSwgdGhhdCkge1xuICAgIGlmICgobiA9IGFyZ3VtZW50cy5sZW5ndGggLSAyKSA+IDApIGZvciAodmFyIGFyZ3MgPSBuZXcgQXJyYXkobiksIGkgPSAwLCBuLCB0OyBpIDwgbjsgKytpKSBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAyXTtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHR5cGUsIHRoYXQsIGFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodmFyIHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldCh0eXBlLCBuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGgsIGM7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoKGMgPSB0eXBlW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0KHR5cGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAodHlwZVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICB0eXBlW2ldID0gbm9vcCwgdHlwZSA9IHR5cGUuc2xpY2UoMCwgaSkuY29uY2F0KHR5cGUuc2xpY2UoaSArIDEpKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgdHlwZS5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogY2FsbGJhY2t9KTtcbiAgcmV0dXJuIHR5cGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpc3BhdGNoO1xuIiwiZXhwb3J0IHZhciB4aHRtbCA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHN2ZzogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuICB4aHRtbDogeGh0bWwsXG4gIHhsaW5rOiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIixcbiAgeG1sOiBcImh0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZVwiLFxuICB4bWxuczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zL1wiXG59O1xuIiwiaW1wb3J0IG5hbWVzcGFjZXMgZnJvbSBcIi4vbmFtZXNwYWNlcy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBwcmVmaXggPSBuYW1lICs9IFwiXCIsIGkgPSBwcmVmaXguaW5kZXhPZihcIjpcIik7XG4gIGlmIChpID49IDAgJiYgKHByZWZpeCA9IG5hbWUuc2xpY2UoMCwgaSkpICE9PSBcInhtbG5zXCIpIG5hbWUgPSBuYW1lLnNsaWNlKGkgKyAxKTtcbiAgcmV0dXJuIG5hbWVzcGFjZXMuaGFzT3duUHJvcGVydHkocHJlZml4KSA/IHtzcGFjZTogbmFtZXNwYWNlc1twcmVmaXhdLCBsb2NhbDogbmFtZX0gOiBuYW1lOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xufVxuIiwiaW1wb3J0IG5hbWVzcGFjZSBmcm9tIFwiLi9uYW1lc3BhY2UuanNcIjtcbmltcG9ydCB7eGh0bWx9IGZyb20gXCIuL25hbWVzcGFjZXMuanNcIjtcblxuZnVuY3Rpb24gY3JlYXRvckluaGVyaXQobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvY3VtZW50ID0gdGhpcy5vd25lckRvY3VtZW50LFxuICAgICAgICB1cmkgPSB0aGlzLm5hbWVzcGFjZVVSSTtcbiAgICByZXR1cm4gdXJpID09PSB4aHRtbCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubmFtZXNwYWNlVVJJID09PSB4aHRtbFxuICAgICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSlcbiAgICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlModXJpLCBuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRvckZpeGVkKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKTtcbiAgcmV0dXJuIChmdWxsbmFtZS5sb2NhbFxuICAgICAgPyBjcmVhdG9yRml4ZWRcbiAgICAgIDogY3JlYXRvckluaGVyaXQpKGZ1bGxuYW1lKTtcbn1cbiIsImZ1bmN0aW9uIG5vbmUoKSB7fVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IG5vbmUgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgfTtcbn1cbiIsImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3Rvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3QgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gc2VsZWN0b3Ioc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBzdWJub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChzdWJub2RlID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSkge1xuICAgICAgICBpZiAoXCJfX2RhdGFfX1wiIGluIG5vZGUpIHN1Ym5vZGUuX19kYXRhX18gPSBub2RlLl9fZGF0YV9fO1xuICAgICAgICBzdWJncm91cFtpXSA9IHN1Ym5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsIi8vIEdpdmVuIHNvbWV0aGluZyBhcnJheSBsaWtlIChvciBudWxsKSwgcmV0dXJucyBzb21ldGhpbmcgdGhhdCBpcyBzdHJpY3RseSBhblxuLy8gYXJyYXkuIFRoaXMgaXMgdXNlZCB0byBlbnN1cmUgdGhhdCBhcnJheS1saWtlIG9iamVjdHMgcGFzc2VkIHRvIGQzLnNlbGVjdEFsbFxuLy8gb3Igc2VsZWN0aW9uLnNlbGVjdEFsbCBhcmUgY29udmVydGVkIGludG8gcHJvcGVyIGFycmF5cyB3aGVuIGNyZWF0aW5nIGFcbi8vIHNlbGVjdGlvbjsgd2UgZG9u4oCZdCBldmVyIHdhbnQgdG8gY3JlYXRlIGEgc2VsZWN0aW9uIGJhY2tlZCBieSBhIGxpdmVcbi8vIEhUTUxDb2xsZWN0aW9uIG9yIE5vZGVMaXN0LiBIb3dldmVyLCBub3RlIHRoYXQgc2VsZWN0aW9uLnNlbGVjdEFsbCB3aWxsIHVzZSBhXG4vLyBzdGF0aWMgTm9kZUxpc3QgYXMgYSBncm91cCwgc2luY2UgaXQgc2FmZWx5IGRlcml2ZWQgZnJvbSBxdWVyeVNlbGVjdG9yQWxsLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXJyYXkoeCkge1xuICByZXR1cm4geCA9PSBudWxsID8gW10gOiBBcnJheS5pc0FycmF5KHgpID8geCA6IEFycmF5LmZyb20oeCk7XG59XG4iLCJmdW5jdGlvbiBlbXB0eSgpIHtcbiAgcmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IGVtcHR5IDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH07XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBhcnJheSBmcm9tIFwiLi4vYXJyYXkuanNcIjtcbmltcG9ydCBzZWxlY3RvckFsbCBmcm9tIFwiLi4vc2VsZWN0b3JBbGwuanNcIjtcblxuZnVuY3Rpb24gYXJyYXlBbGwoc2VsZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYXJyYXkoc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3QgPT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gYXJyYXlBbGwoc2VsZWN0KTtcbiAgZWxzZSBzZWxlY3QgPSBzZWxlY3RvckFsbChzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IFtdLCBwYXJlbnRzID0gW10sIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHN1Ymdyb3Vwcy5wdXNoKHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSk7XG4gICAgICAgIHBhcmVudHMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHBhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoZXMoc2VsZWN0b3IpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hpbGRNYXRjaGVyKHNlbGVjdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubWF0Y2hlcyhzZWxlY3Rvcik7XG4gIH07XG59XG5cbiIsImltcG9ydCB7Y2hpbGRNYXRjaGVyfSBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG52YXIgZmluZCA9IEFycmF5LnByb3RvdHlwZS5maW5kO1xuXG5mdW5jdGlvbiBjaGlsZEZpbmQobWF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmaW5kLmNhbGwodGhpcy5jaGlsZHJlbiwgbWF0Y2gpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjaGlsZEZpcnN0KCkge1xuICByZXR1cm4gdGhpcy5maXJzdEVsZW1lbnRDaGlsZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KG1hdGNoID09IG51bGwgPyBjaGlsZEZpcnN0XG4gICAgICA6IGNoaWxkRmluZCh0eXBlb2YgbWF0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IG1hdGNoIDogY2hpbGRNYXRjaGVyKG1hdGNoKSkpO1xufVxuIiwiaW1wb3J0IHtjaGlsZE1hdGNoZXJ9IGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbnZhciBmaWx0ZXIgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyO1xuXG5mdW5jdGlvbiBjaGlsZHJlbigpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5jaGlsZHJlbik7XG59XG5cbmZ1bmN0aW9uIGNoaWxkcmVuRmlsdGVyKG1hdGNoKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmlsdGVyLmNhbGwodGhpcy5jaGlsZHJlbiwgbWF0Y2gpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3RBbGwobWF0Y2ggPT0gbnVsbCA/IGNoaWxkcmVuXG4gICAgICA6IGNoaWxkcmVuRmlsdGVyKHR5cGVvZiBtYXRjaCA9PT0gXCJmdW5jdGlvblwiID8gbWF0Y2ggOiBjaGlsZE1hdGNoZXIobWF0Y2gpKSk7XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBtYXRjaGVyIGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIGlmICh0eXBlb2YgbWF0Y2ggIT09IFwiZnVuY3Rpb25cIikgbWF0Y2ggPSBtYXRjaGVyKG1hdGNoKTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gW10sIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgbWF0Y2guY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpIHtcbiAgICAgICAgc3ViZ3JvdXAucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odXBkYXRlKSB7XG4gIHJldHVybiBuZXcgQXJyYXkodXBkYXRlLmxlbmd0aCk7XG59XG4iLCJpbXBvcnQgc3BhcnNlIGZyb20gXCIuL3NwYXJzZS5qc1wiO1xuaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9lbnRlciB8fCB0aGlzLl9ncm91cHMubWFwKHNwYXJzZSksIHRoaXMuX3BhcmVudHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRW50ZXJOb2RlKHBhcmVudCwgZGF0dW0pIHtcbiAgdGhpcy5vd25lckRvY3VtZW50ID0gcGFyZW50Lm93bmVyRG9jdW1lbnQ7XG4gIHRoaXMubmFtZXNwYWNlVVJJID0gcGFyZW50Lm5hbWVzcGFjZVVSSTtcbiAgdGhpcy5fbmV4dCA9IG51bGw7XG4gIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5fX2RhdGFfXyA9IGRhdHVtO1xufVxuXG5FbnRlck5vZGUucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRW50ZXJOb2RlLFxuICBhcHBlbmRDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIHRoaXMuX25leHQpOyB9LFxuICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKGNoaWxkLCBuZXh0KSB7IHJldHVybiB0aGlzLl9wYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCBuZXh0KTsgfSxcbiAgcXVlcnlTZWxlY3RvcjogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTsgfSxcbiAgcXVlcnlTZWxlY3RvckFsbDogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTsgfVxufTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge0VudGVyTm9kZX0gZnJvbSBcIi4vZW50ZXIuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi4vY29uc3RhbnQuanNcIjtcblxuZnVuY3Rpb24gYmluZEluZGV4KHBhcmVudCwgZ3JvdXAsIGVudGVyLCB1cGRhdGUsIGV4aXQsIGRhdGEpIHtcbiAgdmFyIGkgPSAwLFxuICAgICAgbm9kZSxcbiAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuXG4gIC8vIFB1dCBhbnkgbm9uLW51bGwgbm9kZXMgdGhhdCBmaXQgaW50byB1cGRhdGUuXG4gIC8vIFB1dCBhbnkgbnVsbCBub2RlcyBpbnRvIGVudGVyLlxuICAvLyBQdXQgYW55IHJlbWFpbmluZyBkYXRhIGludG8gZW50ZXIuXG4gIGZvciAoOyBpIDwgZGF0YUxlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBQdXQgYW55IG5vbi1udWxsIG5vZGVzIHRoYXQgZG9u4oCZdCBmaXQgaW50byBleGl0LlxuICBmb3IgKDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBleGl0W2ldID0gbm9kZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYmluZEtleShwYXJlbnQsIGdyb3VwLCBlbnRlciwgdXBkYXRlLCBleGl0LCBkYXRhLCBrZXkpIHtcbiAgdmFyIGksXG4gICAgICBub2RlLFxuICAgICAgbm9kZUJ5S2V5VmFsdWUgPSBuZXcgTWFwLFxuICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICBrZXlWYWx1ZXMgPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpLFxuICAgICAga2V5VmFsdWU7XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIG5vZGUuXG4gIC8vIElmIG11bHRpcGxlIG5vZGVzIGhhdmUgdGhlIHNhbWUga2V5LCB0aGUgZHVwbGljYXRlcyBhcmUgYWRkZWQgdG8gZXhpdC5cbiAgZm9yIChpID0gMDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBrZXlWYWx1ZXNbaV0gPSBrZXlWYWx1ZSA9IGtleS5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSArIFwiXCI7XG4gICAgICBpZiAobm9kZUJ5S2V5VmFsdWUuaGFzKGtleVZhbHVlKSkge1xuICAgICAgICBleGl0W2ldID0gbm9kZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGVCeUtleVZhbHVlLnNldChrZXlWYWx1ZSwgbm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIGRhdHVtLlxuICAvLyBJZiB0aGVyZSBhIG5vZGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LCBqb2luIGFuZCBhZGQgaXQgdG8gdXBkYXRlLlxuICAvLyBJZiB0aGVyZSBpcyBub3QgKG9yIHRoZSBrZXkgaXMgYSBkdXBsaWNhdGUpLCBhZGQgaXQgdG8gZW50ZXIuXG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhTGVuZ3RoOyArK2kpIHtcbiAgICBrZXlWYWx1ZSA9IGtleS5jYWxsKHBhcmVudCwgZGF0YVtpXSwgaSwgZGF0YSkgKyBcIlwiO1xuICAgIGlmIChub2RlID0gbm9kZUJ5S2V5VmFsdWUuZ2V0KGtleVZhbHVlKSkge1xuICAgICAgdXBkYXRlW2ldID0gbm9kZTtcbiAgICAgIG5vZGUuX19kYXRhX18gPSBkYXRhW2ldO1xuICAgICAgbm9kZUJ5S2V5VmFsdWUuZGVsZXRlKGtleVZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW50ZXJbaV0gPSBuZXcgRW50ZXJOb2RlKHBhcmVudCwgZGF0YVtpXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIGFueSByZW1haW5pbmcgbm9kZXMgdGhhdCB3ZXJlIG5vdCBib3VuZCB0byBkYXRhIHRvIGV4aXQuXG4gIGZvciAoaSA9IDA7IGkgPCBncm91cExlbmd0aDsgKytpKSB7XG4gICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWVzW2ldKSA9PT0gbm9kZSkpIHtcbiAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkYXR1bShub2RlKSB7XG4gIHJldHVybiBub2RlLl9fZGF0YV9fO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIEFycmF5LmZyb20odGhpcywgZGF0dW0pO1xuXG4gIHZhciBiaW5kID0ga2V5ID8gYmluZEtleSA6IGJpbmRJbmRleCxcbiAgICAgIHBhcmVudHMgPSB0aGlzLl9wYXJlbnRzLFxuICAgICAgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzO1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdmFsdWUgPSBjb25zdGFudCh2YWx1ZSk7XG5cbiAgZm9yICh2YXIgbSA9IGdyb3Vwcy5sZW5ndGgsIHVwZGF0ZSA9IG5ldyBBcnJheShtKSwgZW50ZXIgPSBuZXcgQXJyYXkobSksIGV4aXQgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgdmFyIHBhcmVudCA9IHBhcmVudHNbal0sXG4gICAgICAgIGdyb3VwID0gZ3JvdXBzW2pdLFxuICAgICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgICAgZGF0YSA9IGFycmF5bGlrZSh2YWx1ZS5jYWxsKHBhcmVudCwgcGFyZW50ICYmIHBhcmVudC5fX2RhdGFfXywgaiwgcGFyZW50cykpLFxuICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICAgIGVudGVyR3JvdXAgPSBlbnRlcltqXSA9IG5ldyBBcnJheShkYXRhTGVuZ3RoKSxcbiAgICAgICAgdXBkYXRlR3JvdXAgPSB1cGRhdGVbal0gPSBuZXcgQXJyYXkoZGF0YUxlbmd0aCksXG4gICAgICAgIGV4aXRHcm91cCA9IGV4aXRbal0gPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpO1xuXG4gICAgYmluZChwYXJlbnQsIGdyb3VwLCBlbnRlckdyb3VwLCB1cGRhdGVHcm91cCwgZXhpdEdyb3VwLCBkYXRhLCBrZXkpO1xuXG4gICAgLy8gTm93IGNvbm5lY3QgdGhlIGVudGVyIG5vZGVzIHRvIHRoZWlyIGZvbGxvd2luZyB1cGRhdGUgbm9kZSwgc3VjaCB0aGF0XG4gICAgLy8gYXBwZW5kQ2hpbGQgY2FuIGluc2VydCB0aGUgbWF0ZXJpYWxpemVkIGVudGVyIG5vZGUgYmVmb3JlIHRoaXMgbm9kZSxcbiAgICAvLyByYXRoZXIgdGhhbiBhdCB0aGUgZW5kIG9mIHRoZSBwYXJlbnQgbm9kZS5cbiAgICBmb3IgKHZhciBpMCA9IDAsIGkxID0gMCwgcHJldmlvdXMsIG5leHQ7IGkwIDwgZGF0YUxlbmd0aDsgKytpMCkge1xuICAgICAgaWYgKHByZXZpb3VzID0gZW50ZXJHcm91cFtpMF0pIHtcbiAgICAgICAgaWYgKGkwID49IGkxKSBpMSA9IGkwICsgMTtcbiAgICAgICAgd2hpbGUgKCEobmV4dCA9IHVwZGF0ZUdyb3VwW2kxXSkgJiYgKytpMSA8IGRhdGFMZW5ndGgpO1xuICAgICAgICBwcmV2aW91cy5fbmV4dCA9IG5leHQgfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGUgPSBuZXcgU2VsZWN0aW9uKHVwZGF0ZSwgcGFyZW50cyk7XG4gIHVwZGF0ZS5fZW50ZXIgPSBlbnRlcjtcbiAgdXBkYXRlLl9leGl0ID0gZXhpdDtcbiAgcmV0dXJuIHVwZGF0ZTtcbn1cblxuLy8gR2l2ZW4gc29tZSBkYXRhLCB0aGlzIHJldHVybnMgYW4gYXJyYXktbGlrZSB2aWV3IG9mIGl0OiBhbiBvYmplY3QgdGhhdFxuLy8gZXhwb3NlcyBhIGxlbmd0aCBwcm9wZXJ0eSBhbmQgYWxsb3dzIG51bWVyaWMgaW5kZXhpbmcuIE5vdGUgdGhhdCB1bmxpa2Vcbi8vIHNlbGVjdEFsbCwgdGhpcyBpc27igJl0IHdvcnJpZWQgYWJvdXQg4oCcbGl2ZeKAnSBjb2xsZWN0aW9ucyBiZWNhdXNlIHRoZSByZXN1bHRpbmdcbi8vIGFycmF5IHdpbGwgb25seSBiZSB1c2VkIGJyaWVmbHkgd2hpbGUgZGF0YSBpcyBiZWluZyBib3VuZC4gKEl0IGlzIHBvc3NpYmxlIHRvXG4vLyBjYXVzZSB0aGUgZGF0YSB0byBjaGFuZ2Ugd2hpbGUgaXRlcmF0aW5nIGJ5IHVzaW5nIGEga2V5IGZ1bmN0aW9uLCBidXQgcGxlYXNlXG4vLyBkb27igJl0OyB3ZeKAmWQgcmF0aGVyIGF2b2lkIGEgZ3JhdHVpdG91cyBjb3B5LilcbmZ1bmN0aW9uIGFycmF5bGlrZShkYXRhKSB7XG4gIHJldHVybiB0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIiAmJiBcImxlbmd0aFwiIGluIGRhdGFcbiAgICA/IGRhdGEgLy8gQXJyYXksIFR5cGVkQXJyYXksIE5vZGVMaXN0LCBhcnJheS1saWtlXG4gICAgOiBBcnJheS5mcm9tKGRhdGEpOyAvLyBNYXAsIFNldCwgaXRlcmFibGUsIHN0cmluZywgb3IgYW55dGhpbmcgZWxzZVxufVxuIiwiaW1wb3J0IHNwYXJzZSBmcm9tIFwiLi9zcGFyc2UuanNcIjtcbmltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZXhpdCB8fCB0aGlzLl9ncm91cHMubWFwKHNwYXJzZSksIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob25lbnRlciwgb251cGRhdGUsIG9uZXhpdCkge1xuICB2YXIgZW50ZXIgPSB0aGlzLmVudGVyKCksIHVwZGF0ZSA9IHRoaXMsIGV4aXQgPSB0aGlzLmV4aXQoKTtcbiAgaWYgKHR5cGVvZiBvbmVudGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBlbnRlciA9IG9uZW50ZXIoZW50ZXIpO1xuICAgIGlmIChlbnRlcikgZW50ZXIgPSBlbnRlci5zZWxlY3Rpb24oKTtcbiAgfSBlbHNlIHtcbiAgICBlbnRlciA9IGVudGVyLmFwcGVuZChvbmVudGVyICsgXCJcIik7XG4gIH1cbiAgaWYgKG9udXBkYXRlICE9IG51bGwpIHtcbiAgICB1cGRhdGUgPSBvbnVwZGF0ZSh1cGRhdGUpO1xuICAgIGlmICh1cGRhdGUpIHVwZGF0ZSA9IHVwZGF0ZS5zZWxlY3Rpb24oKTtcbiAgfVxuICBpZiAob25leGl0ID09IG51bGwpIGV4aXQucmVtb3ZlKCk7IGVsc2Ugb25leGl0KGV4aXQpO1xuICByZXR1cm4gZW50ZXIgJiYgdXBkYXRlID8gZW50ZXIubWVyZ2UodXBkYXRlKS5vcmRlcigpIDogdXBkYXRlO1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgdmFyIHNlbGVjdGlvbiA9IGNvbnRleHQuc2VsZWN0aW9uID8gY29udGV4dC5zZWxlY3Rpb24oKSA6IGNvbnRleHQ7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHNlbGVjdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihtZXJnZXMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gLTEsIG0gPSBncm91cHMubGVuZ3RoOyArK2ogPCBtOykge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gZ3JvdXAubGVuZ3RoIC0gMSwgbmV4dCA9IGdyb3VwW2ldLCBub2RlOyAtLWkgPj0gMDspIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgaWYgKG5leHQgJiYgbm9kZS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihuZXh0KSBeIDQpIG5leHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgbmV4dCk7XG4gICAgICAgIG5leHQgPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbXBhcmUpIHtcbiAgaWYgKCFjb21wYXJlKSBjb21wYXJlID0gYXNjZW5kaW5nO1xuXG4gIGZ1bmN0aW9uIGNvbXBhcmVOb2RlKGEsIGIpIHtcbiAgICByZXR1cm4gYSAmJiBiID8gY29tcGFyZShhLl9fZGF0YV9fLCBiLl9fZGF0YV9fKSA6ICFhIC0gIWI7XG4gIH1cblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzb3J0Z3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzb3J0Z3JvdXAgPSBzb3J0Z3JvdXBzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzb3J0Z3JvdXBbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgICBzb3J0Z3JvdXAuc29ydChjb21wYXJlTm9kZSk7XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzb3J0Z3JvdXBzLCB0aGlzLl9wYXJlbnRzKS5vcmRlcigpO1xufVxuXG5mdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IGEgPj0gYiA/IDAgOiBOYU47XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzWzBdO1xuICBhcmd1bWVudHNbMF0gPSB0aGlzO1xuICBjYWxsYmFjay5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICB2YXIgbm9kZSA9IGdyb3VwW2ldO1xuICAgICAgaWYgKG5vZGUpIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGxldCBzaXplID0gMDtcbiAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMpICsrc2l6ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICByZXR1cm4gc2l6ZTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gIXRoaXMubm9kZSgpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2FsbGJhY2spIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkgY2FsbGJhY2suY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuLi9uYW1lc3BhY2UuanNcIjtcblxuZnVuY3Rpb24gYXR0clJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clJlbW92ZU5TKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudChuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnROUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2YWx1ZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIGVsc2UgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbk5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBlbHNlIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBub2RlID0gdGhpcy5ub2RlKCk7XG4gICAgcmV0dXJuIGZ1bGxuYW1lLmxvY2FsXG4gICAgICAgID8gbm9kZS5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpXG4gICAgICAgIDogbm9kZS5nZXRBdHRyaWJ1dGUoZnVsbG5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyUmVtb3ZlTlMgOiBhdHRyUmVtb3ZlKSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyRnVuY3Rpb25OUyA6IGF0dHJGdW5jdGlvbilcbiAgICAgIDogKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckNvbnN0YW50TlMgOiBhdHRyQ29uc3RhbnQpKSkoZnVsbG5hbWUsIHZhbHVlKSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlKSB7XG4gIHJldHVybiAobm9kZS5vd25lckRvY3VtZW50ICYmIG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldykgLy8gbm9kZSBpcyBhIE5vZGVcbiAgICAgIHx8IChub2RlLmRvY3VtZW50ICYmIG5vZGUpIC8vIG5vZGUgaXMgYSBXaW5kb3dcbiAgICAgIHx8IG5vZGUuZGVmYXVsdFZpZXc7IC8vIG5vZGUgaXMgYSBEb2N1bWVudFxufVxuIiwiaW1wb3J0IGRlZmF1bHRWaWV3IGZyb20gXCIuLi93aW5kb3cuanNcIjtcblxuZnVuY3Rpb24gc3R5bGVSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVDb25zdGFudChuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgdmFsdWUsIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVGdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICAgIGVsc2UgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2LCBwcmlvcml0eSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgICA/IHN0eWxlUmVtb3ZlIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgID8gc3R5bGVGdW5jdGlvblxuICAgICAgICAgICAgOiBzdHlsZUNvbnN0YW50KShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkgPT0gbnVsbCA/IFwiXCIgOiBwcmlvcml0eSkpXG4gICAgICA6IHN0eWxlVmFsdWUodGhpcy5ub2RlKCksIG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3R5bGVWYWx1ZShub2RlLCBuYW1lKSB7XG4gIHJldHVybiBub2RlLnN0eWxlLmdldFByb3BlcnR5VmFsdWUobmFtZSlcbiAgICAgIHx8IGRlZmF1bHRWaWV3KG5vZGUpLmdldENvbXB1dGVkU3R5bGUobm9kZSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcbn1cbiIsImZ1bmN0aW9uIHByb3BlcnR5UmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eUNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzW25hbWVdID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5RnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSBkZWxldGUgdGhpc1tuYW1lXTtcbiAgICBlbHNlIHRoaXNbbmFtZV0gPSB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBwcm9wZXJ0eVJlbW92ZSA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBwcm9wZXJ0eUZ1bmN0aW9uXG4gICAgICAgICAgOiBwcm9wZXJ0eUNvbnN0YW50KShuYW1lLCB2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpW25hbWVdO1xufVxuIiwiZnVuY3Rpb24gY2xhc3NBcnJheShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy50cmltKCkuc3BsaXQoL158XFxzKy8pO1xufVxuXG5mdW5jdGlvbiBjbGFzc0xpc3Qobm9kZSkge1xuICByZXR1cm4gbm9kZS5jbGFzc0xpc3QgfHwgbmV3IENsYXNzTGlzdChub2RlKTtcbn1cblxuZnVuY3Rpb24gQ2xhc3NMaXN0KG5vZGUpIHtcbiAgdGhpcy5fbm9kZSA9IG5vZGU7XG4gIHRoaXMuX25hbWVzID0gY2xhc3NBcnJheShub2RlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpO1xufVxuXG5DbGFzc0xpc3QucHJvdG90eXBlID0ge1xuICBhZGQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPCAwKSB7XG4gICAgICB0aGlzLl9uYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPj0gMCkge1xuICAgICAgdGhpcy5fbmFtZXMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICBjb250YWluczogZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpID49IDA7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNsYXNzZWRBZGQobm9kZSwgbmFtZXMpIHtcbiAgdmFyIGxpc3QgPSBjbGFzc0xpc3Qobm9kZSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgd2hpbGUgKCsraSA8IG4pIGxpc3QuYWRkKG5hbWVzW2ldKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZFJlbW92ZShub2RlLCBuYW1lcykge1xuICB2YXIgbGlzdCA9IGNsYXNzTGlzdChub2RlKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbikgbGlzdC5yZW1vdmUobmFtZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkVHJ1ZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZEFkZCh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGYWxzZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZFJlbW92ZSh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGdW5jdGlvbihuYW1lcywgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICh2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpID8gY2xhc3NlZEFkZCA6IGNsYXNzZWRSZW1vdmUpKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIG5hbWVzID0gY2xhc3NBcnJheShuYW1lICsgXCJcIik7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIGxpc3QgPSBjbGFzc0xpc3QodGhpcy5ub2RlKCkpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIGlmICghbGlzdC5jb250YWlucyhuYW1lc1tpXSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGNsYXNzZWRGdW5jdGlvbiA6IHZhbHVlXG4gICAgICA/IGNsYXNzZWRUcnVlXG4gICAgICA6IGNsYXNzZWRGYWxzZSkobmFtZXMsIHZhbHVlKSk7XG59XG4iLCJmdW5jdGlvbiB0ZXh0UmVtb3ZlKCkge1xuICB0aGlzLnRleHRDb250ZW50ID0gXCJcIjtcbn1cblxuZnVuY3Rpb24gdGV4dENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IHRleHRSZW1vdmUgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IHRleHRGdW5jdGlvblxuICAgICAgICAgIDogdGV4dENvbnN0YW50KSh2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpLnRleHRDb250ZW50O1xufVxuIiwiZnVuY3Rpb24gaHRtbFJlbW92ZSgpIHtcbiAgdGhpcy5pbm5lckhUTUwgPSBcIlwiO1xufVxuXG5mdW5jdGlvbiBodG1sQ29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGh0bWxGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdiA9PSBudWxsID8gXCJcIiA6IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBodG1sUmVtb3ZlIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBodG1sRnVuY3Rpb25cbiAgICAgICAgICA6IGh0bWxDb25zdGFudCkodmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKS5pbm5lckhUTUw7XG59XG4iLCJmdW5jdGlvbiByYWlzZSgpIHtcbiAgaWYgKHRoaXMubmV4dFNpYmxpbmcpIHRoaXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmFpc2UpO1xufVxuIiwiZnVuY3Rpb24gbG93ZXIoKSB7XG4gIGlmICh0aGlzLnByZXZpb3VzU2libGluZykgdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLCB0aGlzLnBhcmVudE5vZGUuZmlyc3RDaGlsZCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKGxvd2VyKTtcbn1cbiIsImltcG9ydCBjcmVhdG9yIGZyb20gXCIuLi9jcmVhdG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmFwcGVuZENoaWxkKGNyZWF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgY3JlYXRvciBmcm9tIFwiLi4vY3JlYXRvci5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3Rvci5qc1wiO1xuXG5mdW5jdGlvbiBjb25zdGFudE51bGwoKSB7XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCBiZWZvcmUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKSxcbiAgICAgIHNlbGVjdCA9IGJlZm9yZSA9PSBudWxsID8gY29uc3RhbnROdWxsIDogdHlwZW9mIGJlZm9yZSA9PT0gXCJmdW5jdGlvblwiID8gYmVmb3JlIDogc2VsZWN0b3IoYmVmb3JlKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmluc2VydEJlZm9yZShjcmVhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgbnVsbCk7XG4gIH0pO1xufVxuIiwiZnVuY3Rpb24gcmVtb3ZlKCkge1xuICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKHJlbW92ZSk7XG59XG4iLCJmdW5jdGlvbiBzZWxlY3Rpb25fY2xvbmVTaGFsbG93KCkge1xuICB2YXIgY2xvbmUgPSB0aGlzLmNsb25lTm9kZShmYWxzZSksIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgcmV0dXJuIHBhcmVudCA/IHBhcmVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMubmV4dFNpYmxpbmcpIDogY2xvbmU7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbl9jbG9uZURlZXAoKSB7XG4gIHZhciBjbG9uZSA9IHRoaXMuY2xvbmVOb2RlKHRydWUpLCBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIHJldHVybiBwYXJlbnQgPyBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNsb25lLCB0aGlzLm5leHRTaWJsaW5nKSA6IGNsb25lO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihkZWVwKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdChkZWVwID8gc2VsZWN0aW9uX2Nsb25lRGVlcCA6IHNlbGVjdGlvbl9jbG9uZVNoYWxsb3cpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5wcm9wZXJ0eShcIl9fZGF0YV9fXCIsIHZhbHVlKVxuICAgICAgOiB0aGlzLm5vZGUoKS5fX2RhdGFfXztcbn1cbiIsImZ1bmN0aW9uIGNvbnRleHRMaXN0ZW5lcihsaXN0ZW5lcikge1xuICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIGV2ZW50LCB0aGlzLl9fZGF0YV9fKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gb25SZW1vdmUodHlwZW5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBvbiA9IHRoaXMuX19vbjtcbiAgICBpZiAoIW9uKSByZXR1cm47XG4gICAgZm9yICh2YXIgaiA9IDAsIGkgPSAtMSwgbSA9IG9uLmxlbmd0aCwgbzsgaiA8IG07ICsraikge1xuICAgICAgaWYgKG8gPSBvbltqXSwgKCF0eXBlbmFtZS50eXBlIHx8IG8udHlwZSA9PT0gdHlwZW5hbWUudHlwZSkgJiYgby5uYW1lID09PSB0eXBlbmFtZS5uYW1lKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIsIG8ub3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvblsrK2ldID0gbztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCsraSkgb24ubGVuZ3RoID0gaTtcbiAgICBlbHNlIGRlbGV0ZSB0aGlzLl9fb247XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9uQWRkKHR5cGVuYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uID0gdGhpcy5fX29uLCBvLCBsaXN0ZW5lciA9IGNvbnRleHRMaXN0ZW5lcih2YWx1ZSk7XG4gICAgaWYgKG9uKSBmb3IgKHZhciBqID0gMCwgbSA9IG9uLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgICAgaWYgKChvID0gb25bal0pLnR5cGUgPT09IHR5cGVuYW1lLnR5cGUgJiYgby5uYW1lID09PSB0eXBlbmFtZS5uYW1lKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIsIG8ub3B0aW9ucyk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIgPSBsaXN0ZW5lciwgby5vcHRpb25zID0gb3B0aW9ucyk7XG4gICAgICAgIG8udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodHlwZW5hbWUudHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xuICAgIG8gPSB7dHlwZTogdHlwZW5hbWUudHlwZSwgbmFtZTogdHlwZW5hbWUubmFtZSwgdmFsdWU6IHZhbHVlLCBsaXN0ZW5lcjogbGlzdGVuZXIsIG9wdGlvbnM6IG9wdGlvbnN9O1xuICAgIGlmICghb24pIHRoaXMuX19vbiA9IFtvXTtcbiAgICBlbHNlIG9uLnB1c2gobyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHR5cGVuYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xuICB2YXIgdHlwZW5hbWVzID0gcGFyc2VUeXBlbmFtZXModHlwZW5hbWUgKyBcIlwiKSwgaSwgbiA9IHR5cGVuYW1lcy5sZW5ndGgsIHQ7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIG9uID0gdGhpcy5ub2RlKCkuX19vbjtcbiAgICBpZiAob24pIGZvciAodmFyIGogPSAwLCBtID0gb24ubGVuZ3RoLCBvOyBqIDwgbTsgKytqKSB7XG4gICAgICBmb3IgKGkgPSAwLCBvID0gb25bal07IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKCh0ID0gdHlwZW5hbWVzW2ldKS50eXBlID09PSBvLnR5cGUgJiYgdC5uYW1lID09PSBvLm5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gby52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBvbiA9IHZhbHVlID8gb25BZGQgOiBvblJlbW92ZTtcbiAgZm9yIChpID0gMDsgaSA8IG47ICsraSkgdGhpcy5lYWNoKG9uKHR5cGVuYW1lc1tpXSwgdmFsdWUsIG9wdGlvbnMpKTtcbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQgZGVmYXVsdFZpZXcgZnJvbSBcIi4uL3dpbmRvdy5qc1wiO1xuXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KG5vZGUsIHR5cGUsIHBhcmFtcykge1xuICB2YXIgd2luZG93ID0gZGVmYXVsdFZpZXcobm9kZSksXG4gICAgICBldmVudCA9IHdpbmRvdy5DdXN0b21FdmVudDtcblxuICBpZiAodHlwZW9mIGV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBldmVudCA9IG5ldyBldmVudCh0eXBlLCBwYXJhbXMpO1xuICB9IGVsc2Uge1xuICAgIGV2ZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG4gICAgaWYgKHBhcmFtcykgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSksIGV2ZW50LmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XG4gICAgZWxzZSBldmVudC5pbml0RXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlKTtcbiAgfVxuXG4gIG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQ29uc3RhbnQodHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoRXZlbnQodGhpcywgdHlwZSwgcGFyYW1zLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaCgodHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGRpc3BhdGNoRnVuY3Rpb25cbiAgICAgIDogZGlzcGF0Y2hDb25zdGFudCkodHlwZSwgcGFyYW1zKSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiooKSB7XG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB5aWVsZCBub2RlO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3QgZnJvbSBcIi4vc2VsZWN0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NlbGVjdEFsbCBmcm9tIFwiLi9zZWxlY3RBbGwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0Q2hpbGQgZnJvbSBcIi4vc2VsZWN0Q2hpbGQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0Q2hpbGRyZW4gZnJvbSBcIi4vc2VsZWN0Q2hpbGRyZW4uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZmlsdGVyIGZyb20gXCIuL2ZpbHRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kYXRhIGZyb20gXCIuL2RhdGEuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZW50ZXIgZnJvbSBcIi4vZW50ZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZXhpdCBmcm9tIFwiLi9leGl0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2pvaW4gZnJvbSBcIi4vam9pbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9tZXJnZSBmcm9tIFwiLi9tZXJnZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9vcmRlciBmcm9tIFwiLi9vcmRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zb3J0IGZyb20gXCIuL3NvcnQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fY2FsbCBmcm9tIFwiLi9jYWxsLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX25vZGVzIGZyb20gXCIuL25vZGVzLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX25vZGUgZnJvbSBcIi4vbm9kZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zaXplIGZyb20gXCIuL3NpemUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZW1wdHkgZnJvbSBcIi4vZW1wdHkuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZWFjaCBmcm9tIFwiLi9lYWNoLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2F0dHIgZnJvbSBcIi4vYXR0ci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zdHlsZSBmcm9tIFwiLi9zdHlsZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9wcm9wZXJ0eSBmcm9tIFwiLi9wcm9wZXJ0eS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jbGFzc2VkIGZyb20gXCIuL2NsYXNzZWQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fdGV4dCBmcm9tIFwiLi90ZXh0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2h0bWwgZnJvbSBcIi4vaHRtbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9yYWlzZSBmcm9tIFwiLi9yYWlzZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9sb3dlciBmcm9tIFwiLi9sb3dlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9hcHBlbmQgZnJvbSBcIi4vYXBwZW5kLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2luc2VydCBmcm9tIFwiLi9pbnNlcnQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fcmVtb3ZlIGZyb20gXCIuL3JlbW92ZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jbG9uZSBmcm9tIFwiLi9jbG9uZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kYXR1bSBmcm9tIFwiLi9kYXR1bS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9vbiBmcm9tIFwiLi9vbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kaXNwYXRjaCBmcm9tIFwiLi9kaXNwYXRjaC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9pdGVyYXRvciBmcm9tIFwiLi9pdGVyYXRvci5qc1wiO1xuXG5leHBvcnQgdmFyIHJvb3QgPSBbbnVsbF07XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWxlY3Rpb24oZ3JvdXBzLCBwYXJlbnRzKSB7XG4gIHRoaXMuX2dyb3VwcyA9IGdyb3VwcztcbiAgdGhpcy5fcGFyZW50cyA9IHBhcmVudHM7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oW1tkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdXSwgcm9vdCk7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbl9zZWxlY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzO1xufVxuXG5TZWxlY3Rpb24ucHJvdG90eXBlID0gc2VsZWN0aW9uLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFNlbGVjdGlvbixcbiAgc2VsZWN0OiBzZWxlY3Rpb25fc2VsZWN0LFxuICBzZWxlY3RBbGw6IHNlbGVjdGlvbl9zZWxlY3RBbGwsXG4gIHNlbGVjdENoaWxkOiBzZWxlY3Rpb25fc2VsZWN0Q2hpbGQsXG4gIHNlbGVjdENoaWxkcmVuOiBzZWxlY3Rpb25fc2VsZWN0Q2hpbGRyZW4sXG4gIGZpbHRlcjogc2VsZWN0aW9uX2ZpbHRlcixcbiAgZGF0YTogc2VsZWN0aW9uX2RhdGEsXG4gIGVudGVyOiBzZWxlY3Rpb25fZW50ZXIsXG4gIGV4aXQ6IHNlbGVjdGlvbl9leGl0LFxuICBqb2luOiBzZWxlY3Rpb25fam9pbixcbiAgbWVyZ2U6IHNlbGVjdGlvbl9tZXJnZSxcbiAgc2VsZWN0aW9uOiBzZWxlY3Rpb25fc2VsZWN0aW9uLFxuICBvcmRlcjogc2VsZWN0aW9uX29yZGVyLFxuICBzb3J0OiBzZWxlY3Rpb25fc29ydCxcbiAgY2FsbDogc2VsZWN0aW9uX2NhbGwsXG4gIG5vZGVzOiBzZWxlY3Rpb25fbm9kZXMsXG4gIG5vZGU6IHNlbGVjdGlvbl9ub2RlLFxuICBzaXplOiBzZWxlY3Rpb25fc2l6ZSxcbiAgZW1wdHk6IHNlbGVjdGlvbl9lbXB0eSxcbiAgZWFjaDogc2VsZWN0aW9uX2VhY2gsXG4gIGF0dHI6IHNlbGVjdGlvbl9hdHRyLFxuICBzdHlsZTogc2VsZWN0aW9uX3N0eWxlLFxuICBwcm9wZXJ0eTogc2VsZWN0aW9uX3Byb3BlcnR5LFxuICBjbGFzc2VkOiBzZWxlY3Rpb25fY2xhc3NlZCxcbiAgdGV4dDogc2VsZWN0aW9uX3RleHQsXG4gIGh0bWw6IHNlbGVjdGlvbl9odG1sLFxuICByYWlzZTogc2VsZWN0aW9uX3JhaXNlLFxuICBsb3dlcjogc2VsZWN0aW9uX2xvd2VyLFxuICBhcHBlbmQ6IHNlbGVjdGlvbl9hcHBlbmQsXG4gIGluc2VydDogc2VsZWN0aW9uX2luc2VydCxcbiAgcmVtb3ZlOiBzZWxlY3Rpb25fcmVtb3ZlLFxuICBjbG9uZTogc2VsZWN0aW9uX2Nsb25lLFxuICBkYXR1bTogc2VsZWN0aW9uX2RhdHVtLFxuICBvbjogc2VsZWN0aW9uX29uLFxuICBkaXNwYXRjaDogc2VsZWN0aW9uX2Rpc3BhdGNoLFxuICBbU3ltYm9sLml0ZXJhdG9yXTogc2VsZWN0aW9uX2l0ZXJhdG9yXG59O1xuXG5leHBvcnQgZGVmYXVsdCBzZWxlY3Rpb247XG4iLCJpbXBvcnQge1NlbGVjdGlvbiwgcm9vdH0gZnJvbSBcIi4vc2VsZWN0aW9uL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCJcbiAgICAgID8gbmV3IFNlbGVjdGlvbihbW2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXV0sIFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdKVxuICAgICAgOiBuZXcgU2VsZWN0aW9uKFtbc2VsZWN0b3JdXSwgcm9vdCk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb25zdHJ1Y3RvciwgZmFjdG9yeSwgcHJvdG90eXBlKSB7XG4gIGNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGZhY3RvcnkucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICBwcm90b3R5cGUuY29uc3RydWN0b3IgPSBjb25zdHJ1Y3Rvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChwYXJlbnQsIGRlZmluaXRpb24pIHtcbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUocGFyZW50LnByb3RvdHlwZSk7XG4gIGZvciAodmFyIGtleSBpbiBkZWZpbml0aW9uKSBwcm90b3R5cGVba2V5XSA9IGRlZmluaXRpb25ba2V5XTtcbiAgcmV0dXJuIHByb3RvdHlwZTtcbn1cbiIsImltcG9ydCBkZWZpbmUsIHtleHRlbmR9IGZyb20gXCIuL2RlZmluZS5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gQ29sb3IoKSB7fVxuXG5leHBvcnQgdmFyIGRhcmtlciA9IDAuNztcbmV4cG9ydCB2YXIgYnJpZ2h0ZXIgPSAxIC8gZGFya2VyO1xuXG52YXIgcmVJID0gXCJcXFxccyooWystXT9cXFxcZCspXFxcXHMqXCIsXG4gICAgcmVOID0gXCJcXFxccyooWystXT8oPzpcXFxcZCpcXFxcLik/XFxcXGQrKD86W2VFXVsrLV0/XFxcXGQrKT8pXFxcXHMqXCIsXG4gICAgcmVQID0gXCJcXFxccyooWystXT8oPzpcXFxcZCpcXFxcLik/XFxcXGQrKD86W2VFXVsrLV0/XFxcXGQrKT8pJVxcXFxzKlwiLFxuICAgIHJlSGV4ID0gL14jKFswLTlhLWZdezMsOH0pJC8sXG4gICAgcmVSZ2JJbnRlZ2VyID0gbmV3IFJlZ0V4cChgXnJnYlxcXFwoJHtyZUl9LCR7cmVJfSwke3JlSX1cXFxcKSRgKSxcbiAgICByZVJnYlBlcmNlbnQgPSBuZXcgUmVnRXhwKGBecmdiXFxcXCgke3JlUH0sJHtyZVB9LCR7cmVQfVxcXFwpJGApLFxuICAgIHJlUmdiYUludGVnZXIgPSBuZXcgUmVnRXhwKGBecmdiYVxcXFwoJHtyZUl9LCR7cmVJfSwke3JlSX0sJHtyZU59XFxcXCkkYCksXG4gICAgcmVSZ2JhUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5yZ2JhXFxcXCgke3JlUH0sJHtyZVB9LCR7cmVQfSwke3JlTn1cXFxcKSRgKSxcbiAgICByZUhzbFBlcmNlbnQgPSBuZXcgUmVnRXhwKGBeaHNsXFxcXCgke3JlTn0sJHtyZVB9LCR7cmVQfVxcXFwpJGApLFxuICAgIHJlSHNsYVBlcmNlbnQgPSBuZXcgUmVnRXhwKGBeaHNsYVxcXFwoJHtyZU59LCR7cmVQfSwke3JlUH0sJHtyZU59XFxcXCkkYCk7XG5cbnZhciBuYW1lZCA9IHtcbiAgYWxpY2VibHVlOiAweGYwZjhmZixcbiAgYW50aXF1ZXdoaXRlOiAweGZhZWJkNyxcbiAgYXF1YTogMHgwMGZmZmYsXG4gIGFxdWFtYXJpbmU6IDB4N2ZmZmQ0LFxuICBhenVyZTogMHhmMGZmZmYsXG4gIGJlaWdlOiAweGY1ZjVkYyxcbiAgYmlzcXVlOiAweGZmZTRjNCxcbiAgYmxhY2s6IDB4MDAwMDAwLFxuICBibGFuY2hlZGFsbW9uZDogMHhmZmViY2QsXG4gIGJsdWU6IDB4MDAwMGZmLFxuICBibHVldmlvbGV0OiAweDhhMmJlMixcbiAgYnJvd246IDB4YTUyYTJhLFxuICBidXJseXdvb2Q6IDB4ZGViODg3LFxuICBjYWRldGJsdWU6IDB4NWY5ZWEwLFxuICBjaGFydHJldXNlOiAweDdmZmYwMCxcbiAgY2hvY29sYXRlOiAweGQyNjkxZSxcbiAgY29yYWw6IDB4ZmY3ZjUwLFxuICBjb3JuZmxvd2VyYmx1ZTogMHg2NDk1ZWQsXG4gIGNvcm5zaWxrOiAweGZmZjhkYyxcbiAgY3JpbXNvbjogMHhkYzE0M2MsXG4gIGN5YW46IDB4MDBmZmZmLFxuICBkYXJrYmx1ZTogMHgwMDAwOGIsXG4gIGRhcmtjeWFuOiAweDAwOGI4YixcbiAgZGFya2dvbGRlbnJvZDogMHhiODg2MGIsXG4gIGRhcmtncmF5OiAweGE5YTlhOSxcbiAgZGFya2dyZWVuOiAweDAwNjQwMCxcbiAgZGFya2dyZXk6IDB4YTlhOWE5LFxuICBkYXJra2hha2k6IDB4YmRiNzZiLFxuICBkYXJrbWFnZW50YTogMHg4YjAwOGIsXG4gIGRhcmtvbGl2ZWdyZWVuOiAweDU1NmIyZixcbiAgZGFya29yYW5nZTogMHhmZjhjMDAsXG4gIGRhcmtvcmNoaWQ6IDB4OTkzMmNjLFxuICBkYXJrcmVkOiAweDhiMDAwMCxcbiAgZGFya3NhbG1vbjogMHhlOTk2N2EsXG4gIGRhcmtzZWFncmVlbjogMHg4ZmJjOGYsXG4gIGRhcmtzbGF0ZWJsdWU6IDB4NDgzZDhiLFxuICBkYXJrc2xhdGVncmF5OiAweDJmNGY0ZixcbiAgZGFya3NsYXRlZ3JleTogMHgyZjRmNGYsXG4gIGRhcmt0dXJxdW9pc2U6IDB4MDBjZWQxLFxuICBkYXJrdmlvbGV0OiAweDk0MDBkMyxcbiAgZGVlcHBpbms6IDB4ZmYxNDkzLFxuICBkZWVwc2t5Ymx1ZTogMHgwMGJmZmYsXG4gIGRpbWdyYXk6IDB4Njk2OTY5LFxuICBkaW1ncmV5OiAweDY5Njk2OSxcbiAgZG9kZ2VyYmx1ZTogMHgxZTkwZmYsXG4gIGZpcmVicmljazogMHhiMjIyMjIsXG4gIGZsb3JhbHdoaXRlOiAweGZmZmFmMCxcbiAgZm9yZXN0Z3JlZW46IDB4MjI4YjIyLFxuICBmdWNoc2lhOiAweGZmMDBmZixcbiAgZ2FpbnNib3JvOiAweGRjZGNkYyxcbiAgZ2hvc3R3aGl0ZTogMHhmOGY4ZmYsXG4gIGdvbGQ6IDB4ZmZkNzAwLFxuICBnb2xkZW5yb2Q6IDB4ZGFhNTIwLFxuICBncmF5OiAweDgwODA4MCxcbiAgZ3JlZW46IDB4MDA4MDAwLFxuICBncmVlbnllbGxvdzogMHhhZGZmMmYsXG4gIGdyZXk6IDB4ODA4MDgwLFxuICBob25leWRldzogMHhmMGZmZjAsXG4gIGhvdHBpbms6IDB4ZmY2OWI0LFxuICBpbmRpYW5yZWQ6IDB4Y2Q1YzVjLFxuICBpbmRpZ286IDB4NGIwMDgyLFxuICBpdm9yeTogMHhmZmZmZjAsXG4gIGtoYWtpOiAweGYwZTY4YyxcbiAgbGF2ZW5kZXI6IDB4ZTZlNmZhLFxuICBsYXZlbmRlcmJsdXNoOiAweGZmZjBmNSxcbiAgbGF3bmdyZWVuOiAweDdjZmMwMCxcbiAgbGVtb25jaGlmZm9uOiAweGZmZmFjZCxcbiAgbGlnaHRibHVlOiAweGFkZDhlNixcbiAgbGlnaHRjb3JhbDogMHhmMDgwODAsXG4gIGxpZ2h0Y3lhbjogMHhlMGZmZmYsXG4gIGxpZ2h0Z29sZGVucm9keWVsbG93OiAweGZhZmFkMixcbiAgbGlnaHRncmF5OiAweGQzZDNkMyxcbiAgbGlnaHRncmVlbjogMHg5MGVlOTAsXG4gIGxpZ2h0Z3JleTogMHhkM2QzZDMsXG4gIGxpZ2h0cGluazogMHhmZmI2YzEsXG4gIGxpZ2h0c2FsbW9uOiAweGZmYTA3YSxcbiAgbGlnaHRzZWFncmVlbjogMHgyMGIyYWEsXG4gIGxpZ2h0c2t5Ymx1ZTogMHg4N2NlZmEsXG4gIGxpZ2h0c2xhdGVncmF5OiAweDc3ODg5OSxcbiAgbGlnaHRzbGF0ZWdyZXk6IDB4Nzc4ODk5LFxuICBsaWdodHN0ZWVsYmx1ZTogMHhiMGM0ZGUsXG4gIGxpZ2h0eWVsbG93OiAweGZmZmZlMCxcbiAgbGltZTogMHgwMGZmMDAsXG4gIGxpbWVncmVlbjogMHgzMmNkMzIsXG4gIGxpbmVuOiAweGZhZjBlNixcbiAgbWFnZW50YTogMHhmZjAwZmYsXG4gIG1hcm9vbjogMHg4MDAwMDAsXG4gIG1lZGl1bWFxdWFtYXJpbmU6IDB4NjZjZGFhLFxuICBtZWRpdW1ibHVlOiAweDAwMDBjZCxcbiAgbWVkaXVtb3JjaGlkOiAweGJhNTVkMyxcbiAgbWVkaXVtcHVycGxlOiAweDkzNzBkYixcbiAgbWVkaXVtc2VhZ3JlZW46IDB4M2NiMzcxLFxuICBtZWRpdW1zbGF0ZWJsdWU6IDB4N2I2OGVlLFxuICBtZWRpdW1zcHJpbmdncmVlbjogMHgwMGZhOWEsXG4gIG1lZGl1bXR1cnF1b2lzZTogMHg0OGQxY2MsXG4gIG1lZGl1bXZpb2xldHJlZDogMHhjNzE1ODUsXG4gIG1pZG5pZ2h0Ymx1ZTogMHgxOTE5NzAsXG4gIG1pbnRjcmVhbTogMHhmNWZmZmEsXG4gIG1pc3R5cm9zZTogMHhmZmU0ZTEsXG4gIG1vY2Nhc2luOiAweGZmZTRiNSxcbiAgbmF2YWpvd2hpdGU6IDB4ZmZkZWFkLFxuICBuYXZ5OiAweDAwMDA4MCxcbiAgb2xkbGFjZTogMHhmZGY1ZTYsXG4gIG9saXZlOiAweDgwODAwMCxcbiAgb2xpdmVkcmFiOiAweDZiOGUyMyxcbiAgb3JhbmdlOiAweGZmYTUwMCxcbiAgb3JhbmdlcmVkOiAweGZmNDUwMCxcbiAgb3JjaGlkOiAweGRhNzBkNixcbiAgcGFsZWdvbGRlbnJvZDogMHhlZWU4YWEsXG4gIHBhbGVncmVlbjogMHg5OGZiOTgsXG4gIHBhbGV0dXJxdW9pc2U6IDB4YWZlZWVlLFxuICBwYWxldmlvbGV0cmVkOiAweGRiNzA5MyxcbiAgcGFwYXlhd2hpcDogMHhmZmVmZDUsXG4gIHBlYWNocHVmZjogMHhmZmRhYjksXG4gIHBlcnU6IDB4Y2Q4NTNmLFxuICBwaW5rOiAweGZmYzBjYixcbiAgcGx1bTogMHhkZGEwZGQsXG4gIHBvd2RlcmJsdWU6IDB4YjBlMGU2LFxuICBwdXJwbGU6IDB4ODAwMDgwLFxuICByZWJlY2NhcHVycGxlOiAweDY2MzM5OSxcbiAgcmVkOiAweGZmMDAwMCxcbiAgcm9zeWJyb3duOiAweGJjOGY4ZixcbiAgcm95YWxibHVlOiAweDQxNjllMSxcbiAgc2FkZGxlYnJvd246IDB4OGI0NTEzLFxuICBzYWxtb246IDB4ZmE4MDcyLFxuICBzYW5keWJyb3duOiAweGY0YTQ2MCxcbiAgc2VhZ3JlZW46IDB4MmU4YjU3LFxuICBzZWFzaGVsbDogMHhmZmY1ZWUsXG4gIHNpZW5uYTogMHhhMDUyMmQsXG4gIHNpbHZlcjogMHhjMGMwYzAsXG4gIHNreWJsdWU6IDB4ODdjZWViLFxuICBzbGF0ZWJsdWU6IDB4NmE1YWNkLFxuICBzbGF0ZWdyYXk6IDB4NzA4MDkwLFxuICBzbGF0ZWdyZXk6IDB4NzA4MDkwLFxuICBzbm93OiAweGZmZmFmYSxcbiAgc3ByaW5nZ3JlZW46IDB4MDBmZjdmLFxuICBzdGVlbGJsdWU6IDB4NDY4MmI0LFxuICB0YW46IDB4ZDJiNDhjLFxuICB0ZWFsOiAweDAwODA4MCxcbiAgdGhpc3RsZTogMHhkOGJmZDgsXG4gIHRvbWF0bzogMHhmZjYzNDcsXG4gIHR1cnF1b2lzZTogMHg0MGUwZDAsXG4gIHZpb2xldDogMHhlZTgyZWUsXG4gIHdoZWF0OiAweGY1ZGViMyxcbiAgd2hpdGU6IDB4ZmZmZmZmLFxuICB3aGl0ZXNtb2tlOiAweGY1ZjVmNSxcbiAgeWVsbG93OiAweGZmZmYwMCxcbiAgeWVsbG93Z3JlZW46IDB4OWFjZDMyXG59O1xuXG5kZWZpbmUoQ29sb3IsIGNvbG9yLCB7XG4gIGNvcHkoY2hhbm5lbHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgdGhpcy5jb25zdHJ1Y3RvciwgdGhpcywgY2hhbm5lbHMpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZ2IoKS5kaXNwbGF5YWJsZSgpO1xuICB9LFxuICBoZXg6IGNvbG9yX2Zvcm1hdEhleCwgLy8gRGVwcmVjYXRlZCEgVXNlIGNvbG9yLmZvcm1hdEhleC5cbiAgZm9ybWF0SGV4OiBjb2xvcl9mb3JtYXRIZXgsXG4gIGZvcm1hdEhleDg6IGNvbG9yX2Zvcm1hdEhleDgsXG4gIGZvcm1hdEhzbDogY29sb3JfZm9ybWF0SHNsLFxuICBmb3JtYXRSZ2I6IGNvbG9yX2Zvcm1hdFJnYixcbiAgdG9TdHJpbmc6IGNvbG9yX2Zvcm1hdFJnYlxufSk7XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdEhleCgpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0SGV4KCk7XG59XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdEhleDgoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdEhleDgoKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SHNsKCkge1xuICByZXR1cm4gaHNsQ29udmVydCh0aGlzKS5mb3JtYXRIc2woKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0UmdiKCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRSZ2IoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29sb3IoZm9ybWF0KSB7XG4gIHZhciBtLCBsO1xuICBmb3JtYXQgPSAoZm9ybWF0ICsgXCJcIikudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gIHJldHVybiAobSA9IHJlSGV4LmV4ZWMoZm9ybWF0KSkgPyAobCA9IG1bMV0ubGVuZ3RoLCBtID0gcGFyc2VJbnQobVsxXSwgMTYpLCBsID09PSA2ID8gcmdibihtKSAvLyAjZmYwMDAwXG4gICAgICA6IGwgPT09IDMgPyBuZXcgUmdiKChtID4+IDggJiAweGYpIHwgKG0gPj4gNCAmIDB4ZjApLCAobSA+PiA0ICYgMHhmKSB8IChtICYgMHhmMCksICgobSAmIDB4ZikgPDwgNCkgfCAobSAmIDB4ZiksIDEpIC8vICNmMDBcbiAgICAgIDogbCA9PT0gOCA/IHJnYmEobSA+PiAyNCAmIDB4ZmYsIG0gPj4gMTYgJiAweGZmLCBtID4+IDggJiAweGZmLCAobSAmIDB4ZmYpIC8gMHhmZikgLy8gI2ZmMDAwMDAwXG4gICAgICA6IGwgPT09IDQgPyByZ2JhKChtID4+IDEyICYgMHhmKSB8IChtID4+IDggJiAweGYwKSwgKG0gPj4gOCAmIDB4ZikgfCAobSA+PiA0ICYgMHhmMCksIChtID4+IDQgJiAweGYpIHwgKG0gJiAweGYwKSwgKCgobSAmIDB4ZikgPDwgNCkgfCAobSAmIDB4ZikpIC8gMHhmZikgLy8gI2YwMDBcbiAgICAgIDogbnVsbCkgLy8gaW52YWxpZCBoZXhcbiAgICAgIDogKG0gPSByZVJnYkludGVnZXIuZXhlYyhmb3JtYXQpKSA/IG5ldyBSZ2IobVsxXSwgbVsyXSwgbVszXSwgMSkgLy8gcmdiKDI1NSwgMCwgMClcbiAgICAgIDogKG0gPSByZVJnYlBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IG5ldyBSZ2IobVsxXSAqIDI1NSAvIDEwMCwgbVsyXSAqIDI1NSAvIDEwMCwgbVszXSAqIDI1NSAvIDEwMCwgMSkgLy8gcmdiKDEwMCUsIDAlLCAwJSlcbiAgICAgIDogKG0gPSByZVJnYmFJbnRlZ2VyLmV4ZWMoZm9ybWF0KSkgPyByZ2JhKG1bMV0sIG1bMl0sIG1bM10sIG1bNF0pIC8vIHJnYmEoMjU1LCAwLCAwLCAxKVxuICAgICAgOiAobSA9IHJlUmdiYVBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IHJnYmEobVsxXSAqIDI1NSAvIDEwMCwgbVsyXSAqIDI1NSAvIDEwMCwgbVszXSAqIDI1NSAvIDEwMCwgbVs0XSkgLy8gcmdiKDEwMCUsIDAlLCAwJSwgMSlcbiAgICAgIDogKG0gPSByZUhzbFBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IGhzbGEobVsxXSwgbVsyXSAvIDEwMCwgbVszXSAvIDEwMCwgMSkgLy8gaHNsKDEyMCwgNTAlLCA1MCUpXG4gICAgICA6IChtID0gcmVIc2xhUGVyY2VudC5leGVjKGZvcm1hdCkpID8gaHNsYShtWzFdLCBtWzJdIC8gMTAwLCBtWzNdIC8gMTAwLCBtWzRdKSAvLyBoc2xhKDEyMCwgNTAlLCA1MCUsIDEpXG4gICAgICA6IG5hbWVkLmhhc093blByb3BlcnR5KGZvcm1hdCkgPyByZ2JuKG5hbWVkW2Zvcm1hdF0pIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gICAgICA6IGZvcm1hdCA9PT0gXCJ0cmFuc3BhcmVudFwiID8gbmV3IFJnYihOYU4sIE5hTiwgTmFOLCAwKVxuICAgICAgOiBudWxsO1xufVxuXG5mdW5jdGlvbiByZ2JuKG4pIHtcbiAgcmV0dXJuIG5ldyBSZ2IobiA+PiAxNiAmIDB4ZmYsIG4gPj4gOCAmIDB4ZmYsIG4gJiAweGZmLCAxKTtcbn1cblxuZnVuY3Rpb24gcmdiYShyLCBnLCBiLCBhKSB7XG4gIGlmIChhIDw9IDApIHIgPSBnID0gYiA9IE5hTjtcbiAgcmV0dXJuIG5ldyBSZ2IociwgZywgYiwgYSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZ2JDb252ZXJ0KG8pIHtcbiAgaWYgKCEobyBpbnN0YW5jZW9mIENvbG9yKSkgbyA9IGNvbG9yKG8pO1xuICBpZiAoIW8pIHJldHVybiBuZXcgUmdiO1xuICBvID0gby5yZ2IoKTtcbiAgcmV0dXJuIG5ldyBSZ2Ioby5yLCBvLmcsIG8uYiwgby5vcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYihyLCBnLCBiLCBvcGFjaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gcmdiQ29udmVydChyKSA6IG5ldyBSZ2IociwgZywgYiwgb3BhY2l0eSA9PSBudWxsID8gMSA6IG9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmdiKHIsIGcsIGIsIG9wYWNpdHkpIHtcbiAgdGhpcy5yID0gK3I7XG4gIHRoaXMuZyA9ICtnO1xuICB0aGlzLmIgPSArYjtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShSZ2IsIHJnYiwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gYnJpZ2h0ZXIgOiBNYXRoLnBvdyhicmlnaHRlciwgayk7XG4gICAgcmV0dXJuIG5ldyBSZ2IodGhpcy5yICogaywgdGhpcy5nICogaywgdGhpcy5iICogaywgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgZGFya2VyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gZGFya2VyIDogTWF0aC5wb3coZGFya2VyLCBrKTtcbiAgICByZXR1cm4gbmV3IFJnYih0aGlzLnIgKiBrLCB0aGlzLmcgKiBrLCB0aGlzLmIgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICByZ2IoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNsYW1wKCkge1xuICAgIHJldHVybiBuZXcgUmdiKGNsYW1waSh0aGlzLnIpLCBjbGFtcGkodGhpcy5nKSwgY2xhbXBpKHRoaXMuYiksIGNsYW1wYSh0aGlzLm9wYWNpdHkpKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuICgtMC41IDw9IHRoaXMuciAmJiB0aGlzLnIgPCAyNTUuNSlcbiAgICAgICAgJiYgKC0wLjUgPD0gdGhpcy5nICYmIHRoaXMuZyA8IDI1NS41KVxuICAgICAgICAmJiAoLTAuNSA8PSB0aGlzLmIgJiYgdGhpcy5iIDwgMjU1LjUpXG4gICAgICAgICYmICgwIDw9IHRoaXMub3BhY2l0eSAmJiB0aGlzLm9wYWNpdHkgPD0gMSk7XG4gIH0sXG4gIGhleDogcmdiX2Zvcm1hdEhleCwgLy8gRGVwcmVjYXRlZCEgVXNlIGNvbG9yLmZvcm1hdEhleC5cbiAgZm9ybWF0SGV4OiByZ2JfZm9ybWF0SGV4LFxuICBmb3JtYXRIZXg4OiByZ2JfZm9ybWF0SGV4OCxcbiAgZm9ybWF0UmdiOiByZ2JfZm9ybWF0UmdiLFxuICB0b1N0cmluZzogcmdiX2Zvcm1hdFJnYlxufSkpO1xuXG5mdW5jdGlvbiByZ2JfZm9ybWF0SGV4KCkge1xuICByZXR1cm4gYCMke2hleCh0aGlzLnIpfSR7aGV4KHRoaXMuZyl9JHtoZXgodGhpcy5iKX1gO1xufVxuXG5mdW5jdGlvbiByZ2JfZm9ybWF0SGV4OCgpIHtcbiAgcmV0dXJuIGAjJHtoZXgodGhpcy5yKX0ke2hleCh0aGlzLmcpfSR7aGV4KHRoaXMuYil9JHtoZXgoKGlzTmFOKHRoaXMub3BhY2l0eSkgPyAxIDogdGhpcy5vcGFjaXR5KSAqIDI1NSl9YDtcbn1cblxuZnVuY3Rpb24gcmdiX2Zvcm1hdFJnYigpIHtcbiAgY29uc3QgYSA9IGNsYW1wYSh0aGlzLm9wYWNpdHkpO1xuICByZXR1cm4gYCR7YSA9PT0gMSA/IFwicmdiKFwiIDogXCJyZ2JhKFwifSR7Y2xhbXBpKHRoaXMucil9LCAke2NsYW1waSh0aGlzLmcpfSwgJHtjbGFtcGkodGhpcy5iKX0ke2EgPT09IDEgPyBcIilcIiA6IGAsICR7YX0pYH1gO1xufVxuXG5mdW5jdGlvbiBjbGFtcGEob3BhY2l0eSkge1xuICByZXR1cm4gaXNOYU4ob3BhY2l0eSkgPyAxIDogTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgb3BhY2l0eSkpO1xufVxuXG5mdW5jdGlvbiBjbGFtcGkodmFsdWUpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDI1NSwgTWF0aC5yb3VuZCh2YWx1ZSkgfHwgMCkpO1xufVxuXG5mdW5jdGlvbiBoZXgodmFsdWUpIHtcbiAgdmFsdWUgPSBjbGFtcGkodmFsdWUpO1xuICByZXR1cm4gKHZhbHVlIDwgMTYgPyBcIjBcIiA6IFwiXCIpICsgdmFsdWUudG9TdHJpbmcoMTYpO1xufVxuXG5mdW5jdGlvbiBoc2xhKGgsIHMsIGwsIGEpIHtcbiAgaWYgKGEgPD0gMCkgaCA9IHMgPSBsID0gTmFOO1xuICBlbHNlIGlmIChsIDw9IDAgfHwgbCA+PSAxKSBoID0gcyA9IE5hTjtcbiAgZWxzZSBpZiAocyA8PSAwKSBoID0gTmFOO1xuICByZXR1cm4gbmV3IEhzbChoLCBzLCBsLCBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhzbENvbnZlcnQobykge1xuICBpZiAobyBpbnN0YW5jZW9mIEhzbCkgcmV0dXJuIG5ldyBIc2woby5oLCBvLnMsIG8ubCwgby5vcGFjaXR5KTtcbiAgaWYgKCEobyBpbnN0YW5jZW9mIENvbG9yKSkgbyA9IGNvbG9yKG8pO1xuICBpZiAoIW8pIHJldHVybiBuZXcgSHNsO1xuICBpZiAobyBpbnN0YW5jZW9mIEhzbCkgcmV0dXJuIG87XG4gIG8gPSBvLnJnYigpO1xuICB2YXIgciA9IG8uciAvIDI1NSxcbiAgICAgIGcgPSBvLmcgLyAyNTUsXG4gICAgICBiID0gby5iIC8gMjU1LFxuICAgICAgbWluID0gTWF0aC5taW4ociwgZywgYiksXG4gICAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKSxcbiAgICAgIGggPSBOYU4sXG4gICAgICBzID0gbWF4IC0gbWluLFxuICAgICAgbCA9IChtYXggKyBtaW4pIC8gMjtcbiAgaWYgKHMpIHtcbiAgICBpZiAociA9PT0gbWF4KSBoID0gKGcgLSBiKSAvIHMgKyAoZyA8IGIpICogNjtcbiAgICBlbHNlIGlmIChnID09PSBtYXgpIGggPSAoYiAtIHIpIC8gcyArIDI7XG4gICAgZWxzZSBoID0gKHIgLSBnKSAvIHMgKyA0O1xuICAgIHMgLz0gbCA8IDAuNSA/IG1heCArIG1pbiA6IDIgLSBtYXggLSBtaW47XG4gICAgaCAqPSA2MDtcbiAgfSBlbHNlIHtcbiAgICBzID0gbCA+IDAgJiYgbCA8IDEgPyAwIDogaDtcbiAgfVxuICByZXR1cm4gbmV3IEhzbChoLCBzLCBsLCBvLm9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHNsKGgsIHMsIGwsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBoc2xDb252ZXJ0KGgpIDogbmV3IEhzbChoLCBzLCBsLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmZ1bmN0aW9uIEhzbChoLCBzLCBsLCBvcGFjaXR5KSB7XG4gIHRoaXMuaCA9ICtoO1xuICB0aGlzLnMgPSArcztcbiAgdGhpcy5sID0gK2w7XG4gIHRoaXMub3BhY2l0eSA9ICtvcGFjaXR5O1xufVxuXG5kZWZpbmUoSHNsLCBoc2wsIGV4dGVuZChDb2xvciwge1xuICBicmlnaHRlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGJyaWdodGVyIDogTWF0aC5wb3coYnJpZ2h0ZXIsIGspO1xuICAgIHJldHVybiBuZXcgSHNsKHRoaXMuaCwgdGhpcy5zLCB0aGlzLmwgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBkYXJrZXIgOiBNYXRoLnBvdyhkYXJrZXIsIGspO1xuICAgIHJldHVybiBuZXcgSHNsKHRoaXMuaCwgdGhpcy5zLCB0aGlzLmwgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICByZ2IoKSB7XG4gICAgdmFyIGggPSB0aGlzLmggJSAzNjAgKyAodGhpcy5oIDwgMCkgKiAzNjAsXG4gICAgICAgIHMgPSBpc05hTihoKSB8fCBpc05hTih0aGlzLnMpID8gMCA6IHRoaXMucyxcbiAgICAgICAgbCA9IHRoaXMubCxcbiAgICAgICAgbTIgPSBsICsgKGwgPCAwLjUgPyBsIDogMSAtIGwpICogcyxcbiAgICAgICAgbTEgPSAyICogbCAtIG0yO1xuICAgIHJldHVybiBuZXcgUmdiKFxuICAgICAgaHNsMnJnYihoID49IDI0MCA/IGggLSAyNDAgOiBoICsgMTIwLCBtMSwgbTIpLFxuICAgICAgaHNsMnJnYihoLCBtMSwgbTIpLFxuICAgICAgaHNsMnJnYihoIDwgMTIwID8gaCArIDI0MCA6IGggLSAxMjAsIG0xLCBtMiksXG4gICAgICB0aGlzLm9wYWNpdHlcbiAgICApO1xuICB9LFxuICBjbGFtcCgpIHtcbiAgICByZXR1cm4gbmV3IEhzbChjbGFtcGgodGhpcy5oKSwgY2xhbXB0KHRoaXMucyksIGNsYW1wdCh0aGlzLmwpLCBjbGFtcGEodGhpcy5vcGFjaXR5KSk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiAoMCA8PSB0aGlzLnMgJiYgdGhpcy5zIDw9IDEgfHwgaXNOYU4odGhpcy5zKSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5sICYmIHRoaXMubCA8PSAxKVxuICAgICAgICAmJiAoMCA8PSB0aGlzLm9wYWNpdHkgJiYgdGhpcy5vcGFjaXR5IDw9IDEpO1xuICB9LFxuICBmb3JtYXRIc2woKSB7XG4gICAgY29uc3QgYSA9IGNsYW1wYSh0aGlzLm9wYWNpdHkpO1xuICAgIHJldHVybiBgJHthID09PSAxID8gXCJoc2woXCIgOiBcImhzbGEoXCJ9JHtjbGFtcGgodGhpcy5oKX0sICR7Y2xhbXB0KHRoaXMucykgKiAxMDB9JSwgJHtjbGFtcHQodGhpcy5sKSAqIDEwMH0lJHthID09PSAxID8gXCIpXCIgOiBgLCAke2F9KWB9YDtcbiAgfVxufSkpO1xuXG5mdW5jdGlvbiBjbGFtcGgodmFsdWUpIHtcbiAgdmFsdWUgPSAodmFsdWUgfHwgMCkgJSAzNjA7XG4gIHJldHVybiB2YWx1ZSA8IDAgPyB2YWx1ZSArIDM2MCA6IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBjbGFtcHQodmFsdWUpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHZhbHVlIHx8IDApKTtcbn1cblxuLyogRnJvbSBGdkQgMTMuMzcsIENTUyBDb2xvciBNb2R1bGUgTGV2ZWwgMyAqL1xuZnVuY3Rpb24gaHNsMnJnYihoLCBtMSwgbTIpIHtcbiAgcmV0dXJuIChoIDwgNjAgPyBtMSArIChtMiAtIG0xKSAqIGggLyA2MFxuICAgICAgOiBoIDwgMTgwID8gbTJcbiAgICAgIDogaCA8IDI0MCA/IG0xICsgKG0yIC0gbTEpICogKDI0MCAtIGgpIC8gNjBcbiAgICAgIDogbTEpICogMjU1O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgeCA9PiAoKSA9PiB4O1xuIiwiaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5cbmZ1bmN0aW9uIGxpbmVhcihhLCBkKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGEgKyB0ICogZDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZXhwb25lbnRpYWwoYSwgYiwgeSkge1xuICByZXR1cm4gYSA9IE1hdGgucG93KGEsIHkpLCBiID0gTWF0aC5wb3coYiwgeSkgLSBhLCB5ID0gMSAvIHksIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gTWF0aC5wb3coYSArIHQgKiBiLCB5KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh1ZShhLCBiKSB7XG4gIHZhciBkID0gYiAtIGE7XG4gIHJldHVybiBkID8gbGluZWFyKGEsIGQgPiAxODAgfHwgZCA8IC0xODAgPyBkIC0gMzYwICogTWF0aC5yb3VuZChkIC8gMzYwKSA6IGQpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnYW1tYSh5KSB7XG4gIHJldHVybiAoeSA9ICt5KSA9PT0gMSA/IG5vZ2FtbWEgOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGIgLSBhID8gZXhwb25lbnRpYWwoYSwgYiwgeSkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbm9nYW1tYShhLCBiKSB7XG4gIHZhciBkID0gYiAtIGE7XG4gIHJldHVybiBkID8gbGluZWFyKGEsIGQpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG59XG4iLCJpbXBvcnQge3JnYiBhcyBjb2xvclJnYn0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQgYmFzaXMgZnJvbSBcIi4vYmFzaXMuanNcIjtcbmltcG9ydCBiYXNpc0Nsb3NlZCBmcm9tIFwiLi9iYXNpc0Nsb3NlZC5qc1wiO1xuaW1wb3J0IG5vZ2FtbWEsIHtnYW1tYX0gZnJvbSBcIi4vY29sb3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uIHJnYkdhbW1hKHkpIHtcbiAgdmFyIGNvbG9yID0gZ2FtbWEoeSk7XG5cbiAgZnVuY3Rpb24gcmdiKHN0YXJ0LCBlbmQpIHtcbiAgICB2YXIgciA9IGNvbG9yKChzdGFydCA9IGNvbG9yUmdiKHN0YXJ0KSkuciwgKGVuZCA9IGNvbG9yUmdiKGVuZCkpLnIpLFxuICAgICAgICBnID0gY29sb3Ioc3RhcnQuZywgZW5kLmcpLFxuICAgICAgICBiID0gY29sb3Ioc3RhcnQuYiwgZW5kLmIpLFxuICAgICAgICBvcGFjaXR5ID0gbm9nYW1tYShzdGFydC5vcGFjaXR5LCBlbmQub3BhY2l0eSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHN0YXJ0LnIgPSByKHQpO1xuICAgICAgc3RhcnQuZyA9IGcodCk7XG4gICAgICBzdGFydC5iID0gYih0KTtcbiAgICAgIHN0YXJ0Lm9wYWNpdHkgPSBvcGFjaXR5KHQpO1xuICAgICAgcmV0dXJuIHN0YXJ0ICsgXCJcIjtcbiAgICB9O1xuICB9XG5cbiAgcmdiLmdhbW1hID0gcmdiR2FtbWE7XG5cbiAgcmV0dXJuIHJnYjtcbn0pKDEpO1xuXG5mdW5jdGlvbiByZ2JTcGxpbmUoc3BsaW5lKSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xvcnMpIHtcbiAgICB2YXIgbiA9IGNvbG9ycy5sZW5ndGgsXG4gICAgICAgIHIgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGcgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGIgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGksIGNvbG9yO1xuICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGNvbG9yID0gY29sb3JSZ2IoY29sb3JzW2ldKTtcbiAgICAgIHJbaV0gPSBjb2xvci5yIHx8IDA7XG4gICAgICBnW2ldID0gY29sb3IuZyB8fCAwO1xuICAgICAgYltpXSA9IGNvbG9yLmIgfHwgMDtcbiAgICB9XG4gICAgciA9IHNwbGluZShyKTtcbiAgICBnID0gc3BsaW5lKGcpO1xuICAgIGIgPSBzcGxpbmUoYik7XG4gICAgY29sb3Iub3BhY2l0eSA9IDE7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIGNvbG9yLnIgPSByKHQpO1xuICAgICAgY29sb3IuZyA9IGcodCk7XG4gICAgICBjb2xvci5iID0gYih0KTtcbiAgICAgIHJldHVybiBjb2xvciArIFwiXCI7XG4gICAgfTtcbiAgfTtcbn1cblxuZXhwb3J0IHZhciByZ2JCYXNpcyA9IHJnYlNwbGluZShiYXNpcyk7XG5leHBvcnQgdmFyIHJnYkJhc2lzQ2xvc2VkID0gcmdiU3BsaW5lKGJhc2lzQ2xvc2VkKTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgaWYgKCFiKSBiID0gW107XG4gIHZhciBuID0gYSA/IE1hdGgubWluKGIubGVuZ3RoLCBhLmxlbmd0aCkgOiAwLFxuICAgICAgYyA9IGIuc2xpY2UoKSxcbiAgICAgIGk7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkgY1tpXSA9IGFbaV0gKiAoMSAtIHQpICsgYltpXSAqIHQ7XG4gICAgcmV0dXJuIGM7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlckFycmF5KHgpIHtcbiAgcmV0dXJuIEFycmF5QnVmZmVyLmlzVmlldyh4KSAmJiAhKHggaW5zdGFuY2VvZiBEYXRhVmlldyk7XG59XG4iLCJpbXBvcnQgdmFsdWUgZnJvbSBcIi4vdmFsdWUuanNcIjtcbmltcG9ydCBudW1iZXJBcnJheSwge2lzTnVtYmVyQXJyYXl9IGZyb20gXCIuL251bWJlckFycmF5LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIChpc051bWJlckFycmF5KGIpID8gbnVtYmVyQXJyYXkgOiBnZW5lcmljQXJyYXkpKGEsIGIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJpY0FycmF5KGEsIGIpIHtcbiAgdmFyIG5iID0gYiA/IGIubGVuZ3RoIDogMCxcbiAgICAgIG5hID0gYSA/IE1hdGgubWluKG5iLCBhLmxlbmd0aCkgOiAwLFxuICAgICAgeCA9IG5ldyBBcnJheShuYSksXG4gICAgICBjID0gbmV3IEFycmF5KG5iKSxcbiAgICAgIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IG5hOyArK2kpIHhbaV0gPSB2YWx1ZShhW2ldLCBiW2ldKTtcbiAgZm9yICg7IGkgPCBuYjsgKytpKSBjW2ldID0gYltpXTtcblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBuYTsgKytpKSBjW2ldID0geFtpXSh0KTtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZTtcbiAgcmV0dXJuIGEgPSArYSwgYiA9ICtiLCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGQuc2V0VGltZShhICogKDEgLSB0KSArIGIgKiB0KSwgZDtcbiAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGEgPSArYSwgYiA9ICtiLCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGEgKiAoMSAtIHQpICsgYiAqIHQ7XG4gIH07XG59XG4iLCJpbXBvcnQgdmFsdWUgZnJvbSBcIi4vdmFsdWUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgaSA9IHt9LFxuICAgICAgYyA9IHt9LFxuICAgICAgaztcblxuICBpZiAoYSA9PT0gbnVsbCB8fCB0eXBlb2YgYSAhPT0gXCJvYmplY3RcIikgYSA9IHt9O1xuICBpZiAoYiA9PT0gbnVsbCB8fCB0eXBlb2YgYiAhPT0gXCJvYmplY3RcIikgYiA9IHt9O1xuXG4gIGZvciAoayBpbiBiKSB7XG4gICAgaWYgKGsgaW4gYSkge1xuICAgICAgaVtrXSA9IHZhbHVlKGFba10sIGJba10pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjW2tdID0gYltrXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoayBpbiBpKSBjW2tdID0gaVtrXSh0KTtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cbiIsImltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbnZhciByZUEgPSAvWy0rXT8oPzpcXGQrXFwuP1xcZCp8XFwuP1xcZCspKD86W2VFXVstK10/XFxkKyk/L2csXG4gICAgcmVCID0gbmV3IFJlZ0V4cChyZUEuc291cmNlLCBcImdcIik7XG5cbmZ1bmN0aW9uIHplcm8oYikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGI7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9uZShiKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGIodCkgKyBcIlwiO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBiaSA9IHJlQS5sYXN0SW5kZXggPSByZUIubGFzdEluZGV4ID0gMCwgLy8gc2NhbiBpbmRleCBmb3IgbmV4dCBudW1iZXIgaW4gYlxuICAgICAgYW0sIC8vIGN1cnJlbnQgbWF0Y2ggaW4gYVxuICAgICAgYm0sIC8vIGN1cnJlbnQgbWF0Y2ggaW4gYlxuICAgICAgYnMsIC8vIHN0cmluZyBwcmVjZWRpbmcgY3VycmVudCBudW1iZXIgaW4gYiwgaWYgYW55XG4gICAgICBpID0gLTEsIC8vIGluZGV4IGluIHNcbiAgICAgIHMgPSBbXSwgLy8gc3RyaW5nIGNvbnN0YW50cyBhbmQgcGxhY2Vob2xkZXJzXG4gICAgICBxID0gW107IC8vIG51bWJlciBpbnRlcnBvbGF0b3JzXG5cbiAgLy8gQ29lcmNlIGlucHV0cyB0byBzdHJpbmdzLlxuICBhID0gYSArIFwiXCIsIGIgPSBiICsgXCJcIjtcblxuICAvLyBJbnRlcnBvbGF0ZSBwYWlycyBvZiBudW1iZXJzIGluIGEgJiBiLlxuICB3aGlsZSAoKGFtID0gcmVBLmV4ZWMoYSkpXG4gICAgICAmJiAoYm0gPSByZUIuZXhlYyhiKSkpIHtcbiAgICBpZiAoKGJzID0gYm0uaW5kZXgpID4gYmkpIHsgLy8gYSBzdHJpbmcgcHJlY2VkZXMgdGhlIG5leHQgbnVtYmVyIGluIGJcbiAgICAgIGJzID0gYi5zbGljZShiaSwgYnMpO1xuICAgICAgaWYgKHNbaV0pIHNbaV0gKz0gYnM7IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgICBlbHNlIHNbKytpXSA9IGJzO1xuICAgIH1cbiAgICBpZiAoKGFtID0gYW1bMF0pID09PSAoYm0gPSBibVswXSkpIHsgLy8gbnVtYmVycyBpbiBhICYgYiBtYXRjaFxuICAgICAgaWYgKHNbaV0pIHNbaV0gKz0gYm07IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgICBlbHNlIHNbKytpXSA9IGJtO1xuICAgIH0gZWxzZSB7IC8vIGludGVycG9sYXRlIG5vbi1tYXRjaGluZyBudW1iZXJzXG4gICAgICBzWysraV0gPSBudWxsO1xuICAgICAgcS5wdXNoKHtpOiBpLCB4OiBudW1iZXIoYW0sIGJtKX0pO1xuICAgIH1cbiAgICBiaSA9IHJlQi5sYXN0SW5kZXg7XG4gIH1cblxuICAvLyBBZGQgcmVtYWlucyBvZiBiLlxuICBpZiAoYmkgPCBiLmxlbmd0aCkge1xuICAgIGJzID0gYi5zbGljZShiaSk7XG4gICAgaWYgKHNbaV0pIHNbaV0gKz0gYnM7IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgZWxzZSBzWysraV0gPSBicztcbiAgfVxuXG4gIC8vIFNwZWNpYWwgb3B0aW1pemF0aW9uIGZvciBvbmx5IGEgc2luZ2xlIG1hdGNoLlxuICAvLyBPdGhlcndpc2UsIGludGVycG9sYXRlIGVhY2ggb2YgdGhlIG51bWJlcnMgYW5kIHJlam9pbiB0aGUgc3RyaW5nLlxuICByZXR1cm4gcy5sZW5ndGggPCAyID8gKHFbMF1cbiAgICAgID8gb25lKHFbMF0ueClcbiAgICAgIDogemVybyhiKSlcbiAgICAgIDogKGIgPSBxLmxlbmd0aCwgZnVuY3Rpb24odCkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBvOyBpIDwgYjsgKytpKSBzWyhvID0gcVtpXSkuaV0gPSBvLngodCk7XG4gICAgICAgICAgcmV0dXJuIHMuam9pbihcIlwiKTtcbiAgICAgICAgfSk7XG59XG4iLCJpbXBvcnQge2NvbG9yfSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCByZ2IgZnJvbSBcIi4vcmdiLmpzXCI7XG5pbXBvcnQge2dlbmVyaWNBcnJheX0gZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCBkYXRlIGZyb20gXCIuL2RhdGUuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5pbXBvcnQgb2JqZWN0IGZyb20gXCIuL29iamVjdC5qc1wiO1xuaW1wb3J0IHN0cmluZyBmcm9tIFwiLi9zdHJpbmcuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IG51bWJlckFycmF5LCB7aXNOdW1iZXJBcnJheX0gZnJvbSBcIi4vbnVtYmVyQXJyYXkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgdCA9IHR5cGVvZiBiLCBjO1xuICByZXR1cm4gYiA9PSBudWxsIHx8IHQgPT09IFwiYm9vbGVhblwiID8gY29uc3RhbnQoYilcbiAgICAgIDogKHQgPT09IFwibnVtYmVyXCIgPyBudW1iZXJcbiAgICAgIDogdCA9PT0gXCJzdHJpbmdcIiA/ICgoYyA9IGNvbG9yKGIpKSA/IChiID0gYywgcmdiKSA6IHN0cmluZylcbiAgICAgIDogYiBpbnN0YW5jZW9mIGNvbG9yID8gcmdiXG4gICAgICA6IGIgaW5zdGFuY2VvZiBEYXRlID8gZGF0ZVxuICAgICAgOiBpc051bWJlckFycmF5KGIpID8gbnVtYmVyQXJyYXlcbiAgICAgIDogQXJyYXkuaXNBcnJheShiKSA/IGdlbmVyaWNBcnJheVxuICAgICAgOiB0eXBlb2YgYi52YWx1ZU9mICE9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGIudG9TdHJpbmcgIT09IFwiZnVuY3Rpb25cIiB8fCBpc05hTihiKSA/IG9iamVjdFxuICAgICAgOiBudW1iZXIpKGEsIGIpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChhICogKDEgLSB0KSArIGIgKiB0KTtcbiAgfTtcbn1cbiIsInZhciBkZWdyZWVzID0gMTgwIC8gTWF0aC5QSTtcblxuZXhwb3J0IHZhciBpZGVudGl0eSA9IHtcbiAgdHJhbnNsYXRlWDogMCxcbiAgdHJhbnNsYXRlWTogMCxcbiAgcm90YXRlOiAwLFxuICBza2V3WDogMCxcbiAgc2NhbGVYOiAxLFxuICBzY2FsZVk6IDFcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgdmFyIHNjYWxlWCwgc2NhbGVZLCBza2V3WDtcbiAgaWYgKHNjYWxlWCA9IE1hdGguc3FydChhICogYSArIGIgKiBiKSkgYSAvPSBzY2FsZVgsIGIgLz0gc2NhbGVYO1xuICBpZiAoc2tld1ggPSBhICogYyArIGIgKiBkKSBjIC09IGEgKiBza2V3WCwgZCAtPSBiICogc2tld1g7XG4gIGlmIChzY2FsZVkgPSBNYXRoLnNxcnQoYyAqIGMgKyBkICogZCkpIGMgLz0gc2NhbGVZLCBkIC89IHNjYWxlWSwgc2tld1ggLz0gc2NhbGVZO1xuICBpZiAoYSAqIGQgPCBiICogYykgYSA9IC1hLCBiID0gLWIsIHNrZXdYID0gLXNrZXdYLCBzY2FsZVggPSAtc2NhbGVYO1xuICByZXR1cm4ge1xuICAgIHRyYW5zbGF0ZVg6IGUsXG4gICAgdHJhbnNsYXRlWTogZixcbiAgICByb3RhdGU6IE1hdGguYXRhbjIoYiwgYSkgKiBkZWdyZWVzLFxuICAgIHNrZXdYOiBNYXRoLmF0YW4oc2tld1gpICogZGVncmVlcyxcbiAgICBzY2FsZVg6IHNjYWxlWCxcbiAgICBzY2FsZVk6IHNjYWxlWVxuICB9O1xufVxuIiwiaW1wb3J0IGRlY29tcG9zZSwge2lkZW50aXR5fSBmcm9tIFwiLi9kZWNvbXBvc2UuanNcIjtcblxudmFyIHN2Z05vZGU7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDc3ModmFsdWUpIHtcbiAgY29uc3QgbSA9IG5ldyAodHlwZW9mIERPTU1hdHJpeCA9PT0gXCJmdW5jdGlvblwiID8gRE9NTWF0cml4IDogV2ViS2l0Q1NTTWF0cml4KSh2YWx1ZSArIFwiXCIpO1xuICByZXR1cm4gbS5pc0lkZW50aXR5ID8gaWRlbnRpdHkgOiBkZWNvbXBvc2UobS5hLCBtLmIsIG0uYywgbS5kLCBtLmUsIG0uZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN2Zyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGlkZW50aXR5O1xuICBpZiAoIXN2Z05vZGUpIHN2Z05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImdcIik7XG4gIHN2Z05vZGUuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIHZhbHVlKTtcbiAgaWYgKCEodmFsdWUgPSBzdmdOb2RlLnRyYW5zZm9ybS5iYXNlVmFsLmNvbnNvbGlkYXRlKCkpKSByZXR1cm4gaWRlbnRpdHk7XG4gIHZhbHVlID0gdmFsdWUubWF0cml4O1xuICByZXR1cm4gZGVjb21wb3NlKHZhbHVlLmEsIHZhbHVlLmIsIHZhbHVlLmMsIHZhbHVlLmQsIHZhbHVlLmUsIHZhbHVlLmYpO1xufVxuIiwiaW1wb3J0IG51bWJlciBmcm9tIFwiLi4vbnVtYmVyLmpzXCI7XG5pbXBvcnQge3BhcnNlQ3NzLCBwYXJzZVN2Z30gZnJvbSBcIi4vcGFyc2UuanNcIjtcblxuZnVuY3Rpb24gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2UsIHB4Q29tbWEsIHB4UGFyZW4sIGRlZ1BhcmVuKSB7XG5cbiAgZnVuY3Rpb24gcG9wKHMpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPyBzLnBvcCgpICsgXCIgXCIgOiBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKHhhLCB5YSwgeGIsIHliLCBzLCBxKSB7XG4gICAgaWYgKHhhICE9PSB4YiB8fCB5YSAhPT0geWIpIHtcbiAgICAgIHZhciBpID0gcy5wdXNoKFwidHJhbnNsYXRlKFwiLCBudWxsLCBweENvbW1hLCBudWxsLCBweFBhcmVuKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgfHwgeWIpIHtcbiAgICAgIHMucHVzaChcInRyYW5zbGF0ZShcIiArIHhiICsgcHhDb21tYSArIHliICsgcHhQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcm90YXRlKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgaWYgKGEgLSBiID4gMTgwKSBiICs9IDM2MDsgZWxzZSBpZiAoYiAtIGEgPiAxODApIGEgKz0gMzYwOyAvLyBzaG9ydGVzdCBwYXRoXG4gICAgICBxLnB1c2goe2k6IHMucHVzaChwb3AocykgKyBcInJvdGF0ZShcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJyb3RhdGUoXCIgKyBiICsgZGVnUGFyZW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNrZXdYKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgcS5wdXNoKHtpOiBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiArIGIgKyBkZWdQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeGEsIHlhLCB4YiwgeWIsIHMsIHEpIHtcbiAgICBpZiAoeGEgIT09IHhiIHx8IHlhICE9PSB5Yikge1xuICAgICAgdmFyIGkgPSBzLnB1c2gocG9wKHMpICsgXCJzY2FsZShcIiwgbnVsbCwgXCIsXCIsIG51bGwsIFwiKVwiKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgIT09IDEgfHwgeWIgIT09IDEpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInNjYWxlKFwiICsgeGIgKyBcIixcIiArIHliICsgXCIpXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHMgPSBbXSwgLy8gc3RyaW5nIGNvbnN0YW50cyBhbmQgcGxhY2Vob2xkZXJzXG4gICAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcbiAgICBhID0gcGFyc2UoYSksIGIgPSBwYXJzZShiKTtcbiAgICB0cmFuc2xhdGUoYS50cmFuc2xhdGVYLCBhLnRyYW5zbGF0ZVksIGIudHJhbnNsYXRlWCwgYi50cmFuc2xhdGVZLCBzLCBxKTtcbiAgICByb3RhdGUoYS5yb3RhdGUsIGIucm90YXRlLCBzLCBxKTtcbiAgICBza2V3WChhLnNrZXdYLCBiLnNrZXdYLCBzLCBxKTtcbiAgICBzY2FsZShhLnNjYWxlWCwgYS5zY2FsZVksIGIuc2NhbGVYLCBiLnNjYWxlWSwgcywgcSk7XG4gICAgYSA9IGIgPSBudWxsOyAvLyBnY1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICB2YXIgaSA9IC0xLCBuID0gcS5sZW5ndGgsIG87XG4gICAgICB3aGlsZSAoKytpIDwgbikgc1sobyA9IHFbaV0pLmldID0gby54KHQpO1xuICAgICAgcmV0dXJuIHMuam9pbihcIlwiKTtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtQ3NzID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VDc3MsIFwicHgsIFwiLCBcInB4KVwiLCBcImRlZylcIik7XG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtU3ZnID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VTdmcsIFwiLCBcIiwgXCIpXCIsIFwiKVwiKTtcbiIsInZhciBmcmFtZSA9IDAsIC8vIGlzIGFuIGFuaW1hdGlvbiBmcmFtZSBwZW5kaW5nP1xuICAgIHRpbWVvdXQgPSAwLCAvLyBpcyBhIHRpbWVvdXQgcGVuZGluZz9cbiAgICBpbnRlcnZhbCA9IDAsIC8vIGFyZSBhbnkgdGltZXJzIGFjdGl2ZT9cbiAgICBwb2tlRGVsYXkgPSAxMDAwLCAvLyBob3cgZnJlcXVlbnRseSB3ZSBjaGVjayBmb3IgY2xvY2sgc2tld1xuICAgIHRhc2tIZWFkLFxuICAgIHRhc2tUYWlsLFxuICAgIGNsb2NrTGFzdCA9IDAsXG4gICAgY2xvY2tOb3cgPSAwLFxuICAgIGNsb2NrU2tldyA9IDAsXG4gICAgY2xvY2sgPSB0eXBlb2YgcGVyZm9ybWFuY2UgPT09IFwib2JqZWN0XCIgJiYgcGVyZm9ybWFuY2Uubm93ID8gcGVyZm9ybWFuY2UgOiBEYXRlLFxuICAgIHNldEZyYW1lID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIiAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZS5iaW5kKHdpbmRvdykgOiBmdW5jdGlvbihmKSB7IHNldFRpbWVvdXQoZiwgMTcpOyB9O1xuXG5leHBvcnQgZnVuY3Rpb24gbm93KCkge1xuICByZXR1cm4gY2xvY2tOb3cgfHwgKHNldEZyYW1lKGNsZWFyTm93KSwgY2xvY2tOb3cgPSBjbG9jay5ub3coKSArIGNsb2NrU2tldyk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyTm93KCkge1xuICBjbG9ja05vdyA9IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUaW1lcigpIHtcbiAgdGhpcy5fY2FsbCA9XG4gIHRoaXMuX3RpbWUgPVxuICB0aGlzLl9uZXh0ID0gbnVsbDtcbn1cblxuVGltZXIucHJvdG90eXBlID0gdGltZXIucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVGltZXIsXG4gIHJlc3RhcnQ6IGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcImNhbGxiYWNrIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xuICAgIHRpbWUgPSAodGltZSA9PSBudWxsID8gbm93KCkgOiArdGltZSkgKyAoZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXkpO1xuICAgIGlmICghdGhpcy5fbmV4dCAmJiB0YXNrVGFpbCAhPT0gdGhpcykge1xuICAgICAgaWYgKHRhc2tUYWlsKSB0YXNrVGFpbC5fbmV4dCA9IHRoaXM7XG4gICAgICBlbHNlIHRhc2tIZWFkID0gdGhpcztcbiAgICAgIHRhc2tUYWlsID0gdGhpcztcbiAgICB9XG4gICAgdGhpcy5fY2FsbCA9IGNhbGxiYWNrO1xuICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgIHNsZWVwKCk7XG4gIH0sXG4gIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9jYWxsKSB7XG4gICAgICB0aGlzLl9jYWxsID0gbnVsbDtcbiAgICAgIHRoaXMuX3RpbWUgPSBJbmZpbml0eTtcbiAgICAgIHNsZWVwKCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gdGltZXIoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKSB7XG4gIHZhciB0ID0gbmV3IFRpbWVyO1xuICB0LnJlc3RhcnQoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKTtcbiAgcmV0dXJuIHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lckZsdXNoKCkge1xuICBub3coKTsgLy8gR2V0IHRoZSBjdXJyZW50IHRpbWUsIGlmIG5vdCBhbHJlYWR5IHNldC5cbiAgKytmcmFtZTsgLy8gUHJldGVuZCB3ZeKAmXZlIHNldCBhbiBhbGFybSwgaWYgd2UgaGF2ZW7igJl0IGFscmVhZHkuXG4gIHZhciB0ID0gdGFza0hlYWQsIGU7XG4gIHdoaWxlICh0KSB7XG4gICAgaWYgKChlID0gY2xvY2tOb3cgLSB0Ll90aW1lKSA+PSAwKSB0Ll9jYWxsLmNhbGwodW5kZWZpbmVkLCBlKTtcbiAgICB0ID0gdC5fbmV4dDtcbiAgfVxuICAtLWZyYW1lO1xufVxuXG5mdW5jdGlvbiB3YWtlKCkge1xuICBjbG9ja05vdyA9IChjbG9ja0xhc3QgPSBjbG9jay5ub3coKSkgKyBjbG9ja1NrZXc7XG4gIGZyYW1lID0gdGltZW91dCA9IDA7XG4gIHRyeSB7XG4gICAgdGltZXJGbHVzaCgpO1xuICB9IGZpbmFsbHkge1xuICAgIGZyYW1lID0gMDtcbiAgICBuYXAoKTtcbiAgICBjbG9ja05vdyA9IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gcG9rZSgpIHtcbiAgdmFyIG5vdyA9IGNsb2NrLm5vdygpLCBkZWxheSA9IG5vdyAtIGNsb2NrTGFzdDtcbiAgaWYgKGRlbGF5ID4gcG9rZURlbGF5KSBjbG9ja1NrZXcgLT0gZGVsYXksIGNsb2NrTGFzdCA9IG5vdztcbn1cblxuZnVuY3Rpb24gbmFwKCkge1xuICB2YXIgdDAsIHQxID0gdGFza0hlYWQsIHQyLCB0aW1lID0gSW5maW5pdHk7XG4gIHdoaWxlICh0MSkge1xuICAgIGlmICh0MS5fY2FsbCkge1xuICAgICAgaWYgKHRpbWUgPiB0MS5fdGltZSkgdGltZSA9IHQxLl90aW1lO1xuICAgICAgdDAgPSB0MSwgdDEgPSB0MS5fbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgdDIgPSB0MS5fbmV4dCwgdDEuX25leHQgPSBudWxsO1xuICAgICAgdDEgPSB0MCA/IHQwLl9uZXh0ID0gdDIgOiB0YXNrSGVhZCA9IHQyO1xuICAgIH1cbiAgfVxuICB0YXNrVGFpbCA9IHQwO1xuICBzbGVlcCh0aW1lKTtcbn1cblxuZnVuY3Rpb24gc2xlZXAodGltZSkge1xuICBpZiAoZnJhbWUpIHJldHVybjsgLy8gU29vbmVzdCBhbGFybSBhbHJlYWR5IHNldCwgb3Igd2lsbCBiZS5cbiAgaWYgKHRpbWVvdXQpIHRpbWVvdXQgPSBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gIHZhciBkZWxheSA9IHRpbWUgLSBjbG9ja05vdzsgLy8gU3RyaWN0bHkgbGVzcyB0aGFuIGlmIHdlIHJlY29tcHV0ZWQgY2xvY2tOb3cuXG4gIGlmIChkZWxheSA+IDI0KSB7XG4gICAgaWYgKHRpbWUgPCBJbmZpbml0eSkgdGltZW91dCA9IHNldFRpbWVvdXQod2FrZSwgdGltZSAtIGNsb2NrLm5vdygpIC0gY2xvY2tTa2V3KTtcbiAgICBpZiAoaW50ZXJ2YWwpIGludGVydmFsID0gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFpbnRlcnZhbCkgY2xvY2tMYXN0ID0gY2xvY2subm93KCksIGludGVydmFsID0gc2V0SW50ZXJ2YWwocG9rZSwgcG9rZURlbGF5KTtcbiAgICBmcmFtZSA9IDEsIHNldEZyYW1lKHdha2UpO1xuICB9XG59XG4iLCJpbXBvcnQge1RpbWVyfSBmcm9tIFwiLi90aW1lci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgdmFyIHQgPSBuZXcgVGltZXI7XG4gIGRlbGF5ID0gZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXk7XG4gIHQucmVzdGFydChlbGFwc2VkID0+IHtcbiAgICB0LnN0b3AoKTtcbiAgICBjYWxsYmFjayhlbGFwc2VkICsgZGVsYXkpO1xuICB9LCBkZWxheSwgdGltZSk7XG4gIHJldHVybiB0O1xufVxuIiwiaW1wb3J0IHtkaXNwYXRjaH0gZnJvbSBcImQzLWRpc3BhdGNoXCI7XG5pbXBvcnQge3RpbWVyLCB0aW1lb3V0fSBmcm9tIFwiZDMtdGltZXJcIjtcblxudmFyIGVtcHR5T24gPSBkaXNwYXRjaChcInN0YXJ0XCIsIFwiZW5kXCIsIFwiY2FuY2VsXCIsIFwiaW50ZXJydXB0XCIpO1xudmFyIGVtcHR5VHdlZW4gPSBbXTtcblxuZXhwb3J0IHZhciBDUkVBVEVEID0gMDtcbmV4cG9ydCB2YXIgU0NIRURVTEVEID0gMTtcbmV4cG9ydCB2YXIgU1RBUlRJTkcgPSAyO1xuZXhwb3J0IHZhciBTVEFSVEVEID0gMztcbmV4cG9ydCB2YXIgUlVOTklORyA9IDQ7XG5leHBvcnQgdmFyIEVORElORyA9IDU7XG5leHBvcnQgdmFyIEVOREVEID0gNjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSwgbmFtZSwgaWQsIGluZGV4LCBncm91cCwgdGltaW5nKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbjtcbiAgaWYgKCFzY2hlZHVsZXMpIG5vZGUuX190cmFuc2l0aW9uID0ge307XG4gIGVsc2UgaWYgKGlkIGluIHNjaGVkdWxlcykgcmV0dXJuO1xuICBjcmVhdGUobm9kZSwgaWQsIHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIGluZGV4OiBpbmRleCwgLy8gRm9yIGNvbnRleHQgZHVyaW5nIGNhbGxiYWNrLlxuICAgIGdyb3VwOiBncm91cCwgLy8gRm9yIGNvbnRleHQgZHVyaW5nIGNhbGxiYWNrLlxuICAgIG9uOiBlbXB0eU9uLFxuICAgIHR3ZWVuOiBlbXB0eVR3ZWVuLFxuICAgIHRpbWU6IHRpbWluZy50aW1lLFxuICAgIGRlbGF5OiB0aW1pbmcuZGVsYXksXG4gICAgZHVyYXRpb246IHRpbWluZy5kdXJhdGlvbixcbiAgICBlYXNlOiB0aW1pbmcuZWFzZSxcbiAgICB0aW1lcjogbnVsbCxcbiAgICBzdGF0ZTogQ1JFQVRFRFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gZ2V0KG5vZGUsIGlkKTtcbiAgaWYgKHNjaGVkdWxlLnN0YXRlID4gQ1JFQVRFRCkgdGhyb3cgbmV3IEVycm9yKFwidG9vIGxhdGU7IGFscmVhZHkgc2NoZWR1bGVkXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gZ2V0KG5vZGUsIGlkKTtcbiAgaWYgKHNjaGVkdWxlLnN0YXRlID4gU1RBUlRFRCkgdGhyb3cgbmV3IEVycm9yKFwidG9vIGxhdGU7IGFscmVhZHkgcnVubmluZ1wiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0KG5vZGUsIGlkKSB7XG4gIHZhciBzY2hlZHVsZSA9IG5vZGUuX190cmFuc2l0aW9uO1xuICBpZiAoIXNjaGVkdWxlIHx8ICEoc2NoZWR1bGUgPSBzY2hlZHVsZVtpZF0pKSB0aHJvdyBuZXcgRXJyb3IoXCJ0cmFuc2l0aW9uIG5vdCBmb3VuZFwiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGUobm9kZSwgaWQsIHNlbGYpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uLFxuICAgICAgdHdlZW47XG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgc2VsZiB0aW1lciB3aGVuIHRoZSB0cmFuc2l0aW9uIGlzIGNyZWF0ZWQuXG4gIC8vIE5vdGUgdGhlIGFjdHVhbCBkZWxheSBpcyBub3Qga25vd24gdW50aWwgdGhlIGZpcnN0IGNhbGxiYWNrIVxuICBzY2hlZHVsZXNbaWRdID0gc2VsZjtcbiAgc2VsZi50aW1lciA9IHRpbWVyKHNjaGVkdWxlLCAwLCBzZWxmLnRpbWUpO1xuXG4gIGZ1bmN0aW9uIHNjaGVkdWxlKGVsYXBzZWQpIHtcbiAgICBzZWxmLnN0YXRlID0gU0NIRURVTEVEO1xuICAgIHNlbGYudGltZXIucmVzdGFydChzdGFydCwgc2VsZi5kZWxheSwgc2VsZi50aW1lKTtcblxuICAgIC8vIElmIHRoZSBlbGFwc2VkIGRlbGF5IGlzIGxlc3MgdGhhbiBvdXIgZmlyc3Qgc2xlZXAsIHN0YXJ0IGltbWVkaWF0ZWx5LlxuICAgIGlmIChzZWxmLmRlbGF5IDw9IGVsYXBzZWQpIHN0YXJ0KGVsYXBzZWQgLSBzZWxmLmRlbGF5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0KGVsYXBzZWQpIHtcbiAgICB2YXIgaSwgaiwgbiwgbztcblxuICAgIC8vIElmIHRoZSBzdGF0ZSBpcyBub3QgU0NIRURVTEVELCB0aGVuIHdlIHByZXZpb3VzbHkgZXJyb3JlZCBvbiBzdGFydC5cbiAgICBpZiAoc2VsZi5zdGF0ZSAhPT0gU0NIRURVTEVEKSByZXR1cm4gc3RvcCgpO1xuXG4gICAgZm9yIChpIGluIHNjaGVkdWxlcykge1xuICAgICAgbyA9IHNjaGVkdWxlc1tpXTtcbiAgICAgIGlmIChvLm5hbWUgIT09IHNlbGYubmFtZSkgY29udGludWU7XG5cbiAgICAgIC8vIFdoaWxlIHRoaXMgZWxlbWVudCBhbHJlYWR5IGhhcyBhIHN0YXJ0aW5nIHRyYW5zaXRpb24gZHVyaW5nIHRoaXMgZnJhbWUsXG4gICAgICAvLyBkZWZlciBzdGFydGluZyBhbiBpbnRlcnJ1cHRpbmcgdHJhbnNpdGlvbiB1bnRpbCB0aGF0IHRyYW5zaXRpb24gaGFzIGFcbiAgICAgIC8vIGNoYW5jZSB0byB0aWNrIChhbmQgcG9zc2libHkgZW5kKTsgc2VlIGQzL2QzLXRyYW5zaXRpb24jNTQhXG4gICAgICBpZiAoby5zdGF0ZSA9PT0gU1RBUlRFRCkgcmV0dXJuIHRpbWVvdXQoc3RhcnQpO1xuXG4gICAgICAvLyBJbnRlcnJ1cHQgdGhlIGFjdGl2ZSB0cmFuc2l0aW9uLCBpZiBhbnkuXG4gICAgICBpZiAoby5zdGF0ZSA9PT0gUlVOTklORykge1xuICAgICAgICBvLnN0YXRlID0gRU5ERUQ7XG4gICAgICAgIG8udGltZXIuc3RvcCgpO1xuICAgICAgICBvLm9uLmNhbGwoXCJpbnRlcnJ1cHRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgby5pbmRleCwgby5ncm91cCk7XG4gICAgICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gICAgICB9XG5cbiAgICAgIC8vIENhbmNlbCBhbnkgcHJlLWVtcHRlZCB0cmFuc2l0aW9ucy5cbiAgICAgIGVsc2UgaWYgKCtpIDwgaWQpIHtcbiAgICAgICAgby5zdGF0ZSA9IEVOREVEO1xuICAgICAgICBvLnRpbWVyLnN0b3AoKTtcbiAgICAgICAgby5vbi5jYWxsKFwiY2FuY2VsXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIG8uaW5kZXgsIG8uZ3JvdXApO1xuICAgICAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZmVyIHRoZSBmaXJzdCB0aWNrIHRvIGVuZCBvZiB0aGUgY3VycmVudCBmcmFtZTsgc2VlIGQzL2QzIzE1NzYuXG4gICAgLy8gTm90ZSB0aGUgdHJhbnNpdGlvbiBtYXkgYmUgY2FuY2VsZWQgYWZ0ZXIgc3RhcnQgYW5kIGJlZm9yZSB0aGUgZmlyc3QgdGljayFcbiAgICAvLyBOb3RlIHRoaXMgbXVzdCBiZSBzY2hlZHVsZWQgYmVmb3JlIHRoZSBzdGFydCBldmVudDsgc2VlIGQzL2QzLXRyYW5zaXRpb24jMTYhXG4gICAgLy8gQXNzdW1pbmcgdGhpcyBpcyBzdWNjZXNzZnVsLCBzdWJzZXF1ZW50IGNhbGxiYWNrcyBnbyBzdHJhaWdodCB0byB0aWNrLlxuICAgIHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoc2VsZi5zdGF0ZSA9PT0gU1RBUlRFRCkge1xuICAgICAgICBzZWxmLnN0YXRlID0gUlVOTklORztcbiAgICAgICAgc2VsZi50aW1lci5yZXN0YXJ0KHRpY2ssIHNlbGYuZGVsYXksIHNlbGYudGltZSk7XG4gICAgICAgIHRpY2soZWxhcHNlZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgc3RhcnQgZXZlbnQuXG4gICAgLy8gTm90ZSB0aGlzIG11c3QgYmUgZG9uZSBiZWZvcmUgdGhlIHR3ZWVuIGFyZSBpbml0aWFsaXplZC5cbiAgICBzZWxmLnN0YXRlID0gU1RBUlRJTkc7XG4gICAgc2VsZi5vbi5jYWxsKFwic3RhcnRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCk7XG4gICAgaWYgKHNlbGYuc3RhdGUgIT09IFNUQVJUSU5HKSByZXR1cm47IC8vIGludGVycnVwdGVkXG4gICAgc2VsZi5zdGF0ZSA9IFNUQVJURUQ7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSB0d2VlbiwgZGVsZXRpbmcgbnVsbCB0d2Vlbi5cbiAgICB0d2VlbiA9IG5ldyBBcnJheShuID0gc2VsZi50d2Vlbi5sZW5ndGgpO1xuICAgIGZvciAoaSA9IDAsIGogPSAtMTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG8gPSBzZWxmLnR3ZWVuW2ldLnZhbHVlLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCkpIHtcbiAgICAgICAgdHdlZW5bKytqXSA9IG87XG4gICAgICB9XG4gICAgfVxuICAgIHR3ZWVuLmxlbmd0aCA9IGogKyAxO1xuICB9XG5cbiAgZnVuY3Rpb24gdGljayhlbGFwc2VkKSB7XG4gICAgdmFyIHQgPSBlbGFwc2VkIDwgc2VsZi5kdXJhdGlvbiA/IHNlbGYuZWFzZS5jYWxsKG51bGwsIGVsYXBzZWQgLyBzZWxmLmR1cmF0aW9uKSA6IChzZWxmLnRpbWVyLnJlc3RhcnQoc3RvcCksIHNlbGYuc3RhdGUgPSBFTkRJTkcsIDEpLFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSB0d2Vlbi5sZW5ndGg7XG5cbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgdHdlZW5baV0uY2FsbChub2RlLCB0KTtcbiAgICB9XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgZW5kIGV2ZW50LlxuICAgIGlmIChzZWxmLnN0YXRlID09PSBFTkRJTkcpIHtcbiAgICAgIHNlbGYub24uY2FsbChcImVuZFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKTtcbiAgICAgIHN0b3AoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wKCkge1xuICAgIHNlbGYuc3RhdGUgPSBFTkRFRDtcbiAgICBzZWxmLnRpbWVyLnN0b3AoKTtcbiAgICBkZWxldGUgc2NoZWR1bGVzW2lkXTtcbiAgICBmb3IgKHZhciBpIGluIHNjaGVkdWxlcykgcmV0dXJuOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgZGVsZXRlIG5vZGUuX190cmFuc2l0aW9uO1xuICB9XG59XG4iLCJpbXBvcnQge1NUQVJUSU5HLCBFTkRJTkcsIEVOREVEfSBmcm9tIFwiLi90cmFuc2l0aW9uL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5vZGUsIG5hbWUpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uLFxuICAgICAgc2NoZWR1bGUsXG4gICAgICBhY3RpdmUsXG4gICAgICBlbXB0eSA9IHRydWUsXG4gICAgICBpO1xuXG4gIGlmICghc2NoZWR1bGVzKSByZXR1cm47XG5cbiAgbmFtZSA9IG5hbWUgPT0gbnVsbCA/IG51bGwgOiBuYW1lICsgXCJcIjtcblxuICBmb3IgKGkgaW4gc2NoZWR1bGVzKSB7XG4gICAgaWYgKChzY2hlZHVsZSA9IHNjaGVkdWxlc1tpXSkubmFtZSAhPT0gbmFtZSkgeyBlbXB0eSA9IGZhbHNlOyBjb250aW51ZTsgfVxuICAgIGFjdGl2ZSA9IHNjaGVkdWxlLnN0YXRlID4gU1RBUlRJTkcgJiYgc2NoZWR1bGUuc3RhdGUgPCBFTkRJTkc7XG4gICAgc2NoZWR1bGUuc3RhdGUgPSBFTkRFRDtcbiAgICBzY2hlZHVsZS50aW1lci5zdG9wKCk7XG4gICAgc2NoZWR1bGUub24uY2FsbChhY3RpdmUgPyBcImludGVycnVwdFwiIDogXCJjYW5jZWxcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2NoZWR1bGUuaW5kZXgsIHNjaGVkdWxlLmdyb3VwKTtcbiAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICB9XG5cbiAgaWYgKGVtcHR5KSBkZWxldGUgbm9kZS5fX3RyYW5zaXRpb247XG59XG4iLCJpbXBvcnQgaW50ZXJydXB0IGZyb20gXCIuLi9pbnRlcnJ1cHQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIGludGVycnVwdCh0aGlzLCBuYW1lKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQge2dldCwgc2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiB0d2VlblJlbW92ZShpZCwgbmFtZSkge1xuICB2YXIgdHdlZW4wLCB0d2VlbjE7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICB0d2VlbiA9IHNjaGVkdWxlLnR3ZWVuO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCB0d2VlbiB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCB0d2VlbiBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAodHdlZW4gIT09IHR3ZWVuMCkge1xuICAgICAgdHdlZW4xID0gdHdlZW4wID0gdHdlZW47XG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHR3ZWVuMS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKHR3ZWVuMVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgdHdlZW4xID0gdHdlZW4xLnNsaWNlKCk7XG4gICAgICAgICAgdHdlZW4xLnNwbGljZShpLCAxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNjaGVkdWxlLnR3ZWVuID0gdHdlZW4xO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0d2VlbkZ1bmN0aW9uKGlkLCBuYW1lLCB2YWx1ZSkge1xuICB2YXIgdHdlZW4wLCB0d2VlbjE7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgdHdlZW4gPSBzY2hlZHVsZS50d2VlbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgdHdlZW4gd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgdHdlZW4gYW5kIHdl4oCZcmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKHR3ZWVuICE9PSB0d2VlbjApIHtcbiAgICAgIHR3ZWVuMSA9ICh0d2VlbjAgPSB0d2Vlbikuc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIHQgPSB7bmFtZTogbmFtZSwgdmFsdWU6IHZhbHVlfSwgaSA9IDAsIG4gPSB0d2VlbjEubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGlmICh0d2VlbjFbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgIHR3ZWVuMVtpXSA9IHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpID09PSBuKSB0d2VlbjEucHVzaCh0KTtcbiAgICB9XG5cbiAgICBzY2hlZHVsZS50d2VlbiA9IHR3ZWVuMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgbmFtZSArPSBcIlwiO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciB0d2VlbiA9IGdldCh0aGlzLm5vZGUoKSwgaWQpLnR3ZWVuO1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gdHdlZW4ubGVuZ3RoLCB0OyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKHQgPSB0d2VlbltpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICByZXR1cm4gdC52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsID8gdHdlZW5SZW1vdmUgOiB0d2VlbkZ1bmN0aW9uKShpZCwgbmFtZSwgdmFsdWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR3ZWVuVmFsdWUodHJhbnNpdGlvbiwgbmFtZSwgdmFsdWUpIHtcbiAgdmFyIGlkID0gdHJhbnNpdGlvbi5faWQ7XG5cbiAgdHJhbnNpdGlvbi5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCk7XG4gICAgKHNjaGVkdWxlLnZhbHVlIHx8IChzY2hlZHVsZS52YWx1ZSA9IHt9KSlbbmFtZV0gPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgIHJldHVybiBnZXQobm9kZSwgaWQpLnZhbHVlW25hbWVdO1xuICB9O1xufVxuIiwiaW1wb3J0IHtjb2xvcn0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQge2ludGVycG9sYXRlTnVtYmVyLCBpbnRlcnBvbGF0ZVJnYiwgaW50ZXJwb2xhdGVTdHJpbmd9IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBjO1xuICByZXR1cm4gKHR5cGVvZiBiID09PSBcIm51bWJlclwiID8gaW50ZXJwb2xhdGVOdW1iZXJcbiAgICAgIDogYiBpbnN0YW5jZW9mIGNvbG9yID8gaW50ZXJwb2xhdGVSZ2JcbiAgICAgIDogKGMgPSBjb2xvcihiKSkgPyAoYiA9IGMsIGludGVycG9sYXRlUmdiKVxuICAgICAgOiBpbnRlcnBvbGF0ZVN0cmluZykoYSwgYik7XG59XG4iLCJpbXBvcnQge2ludGVycG9sYXRlVHJhbnNmb3JtU3ZnIGFzIGludGVycG9sYXRlVHJhbnNmb3JtfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7bmFtZXNwYWNlfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgaW50ZXJwb2xhdGUgZnJvbSBcIi4vaW50ZXJwb2xhdGUuanNcIjtcblxuZnVuY3Rpb24gYXR0clJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clJlbW92ZU5TKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudChuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUxKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50TlMoZnVsbG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uKG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwLCB2YWx1ZTEgPSB2YWx1ZSh0aGlzKSwgc3RyaW5nMTtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHJldHVybiB2b2lkIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbk5TKGZ1bGxuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCwgdmFsdWUxID0gdmFsdWUodGhpcyksIHN0cmluZzE7XG4gICAgaWYgKHZhbHVlMSA9PSBudWxsKSByZXR1cm4gdm9pZCB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKSwgaSA9IGZ1bGxuYW1lID09PSBcInRyYW5zZm9ybVwiID8gaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBpbnRlcnBvbGF0ZTtcbiAgcmV0dXJuIHRoaXMuYXR0clR3ZWVuKG5hbWUsIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJGdW5jdGlvbk5TIDogYXR0ckZ1bmN0aW9uKShmdWxsbmFtZSwgaSwgdHdlZW5WYWx1ZSh0aGlzLCBcImF0dHIuXCIgKyBuYW1lLCB2YWx1ZSkpXG4gICAgICA6IHZhbHVlID09IG51bGwgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyUmVtb3ZlTlMgOiBhdHRyUmVtb3ZlKShmdWxsbmFtZSlcbiAgICAgIDogKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckNvbnN0YW50TlMgOiBhdHRyQ29uc3RhbnQpKGZ1bGxuYW1lLCBpLCB2YWx1ZSkpO1xufVxuIiwiaW1wb3J0IHtuYW1lc3BhY2V9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcblxuZnVuY3Rpb24gYXR0ckludGVycG9sYXRlKG5hbWUsIGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCBpLmNhbGwodGhpcywgdCkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRySW50ZXJwb2xhdGVOUyhmdWxsbmFtZSwgaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCBpLmNhbGwodGhpcywgdCkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyVHdlZW5OUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiBhdHRySW50ZXJwb2xhdGVOUyhmdWxsbmFtZSwgaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmZ1bmN0aW9uIGF0dHJUd2VlbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIGF0dHJJbnRlcnBvbGF0ZShuYW1lLCBpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGtleSA9IFwiYXR0ci5cIiArIG5hbWU7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIChmdWxsbmFtZS5sb2NhbCA/IGF0dHJUd2Vlbk5TIDogYXR0clR3ZWVuKShmdWxsbmFtZSwgdmFsdWUpKTtcbn1cbiIsImltcG9ydCB7Z2V0LCBpbml0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBkZWxheUZ1bmN0aW9uKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaW5pdCh0aGlzLCBpZCkuZGVsYXkgPSArdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVsYXlDb25zdGFudChpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID0gK3ZhbHVlLCBmdW5jdGlvbigpIHtcbiAgICBpbml0KHRoaXMsIGlkKS5kZWxheSA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBkZWxheUZ1bmN0aW9uXG4gICAgICAgICAgOiBkZWxheUNvbnN0YW50KShpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5kZWxheTtcbn1cbiIsImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGR1cmF0aW9uRnVuY3Rpb24oaWQsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmR1cmF0aW9uID0gK3ZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGR1cmF0aW9uQ29uc3RhbnQoaWQsIHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9ICt2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgc2V0KHRoaXMsIGlkKS5kdXJhdGlvbiA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBkdXJhdGlvbkZ1bmN0aW9uXG4gICAgICAgICAgOiBkdXJhdGlvbkNvbnN0YW50KShpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5kdXJhdGlvbjtcbn1cbiIsImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGVhc2VDb25zdGFudChpZCwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmVhc2UgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKGVhc2VDb25zdGFudChpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5lYXNlO1xufVxuIiwiaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGVhc2VWYXJ5aW5nKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh0eXBlb2YgdiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gICAgc2V0KHRoaXMsIGlkKS5lYXNlID0gdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiB0aGlzLmVhY2goZWFzZVZhcnlpbmcodGhpcy5faWQsIHZhbHVlKSk7XG59XG4iLCJpbXBvcnQge21hdGNoZXJ9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBtYXRjaCAhPT0gXCJmdW5jdGlvblwiKSBtYXRjaCA9IG1hdGNoZXIobWF0Y2gpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBbXSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBtYXRjaC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkge1xuICAgICAgICBzdWJncm91cC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMsIHRoaXMuX25hbWUsIHRoaXMuX2lkKTtcbn1cbiIsImltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHJhbnNpdGlvbikge1xuICBpZiAodHJhbnNpdGlvbi5faWQgIT09IHRoaXMuX2lkKSB0aHJvdyBuZXcgRXJyb3I7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHRyYW5zaXRpb24uX2dyb3VwcywgbTAgPSBncm91cHMwLmxlbmd0aCwgbTEgPSBncm91cHMxLmxlbmd0aCwgbSA9IE1hdGgubWluKG0wLCBtMSksIG1lcmdlcyA9IG5ldyBBcnJheShtMCksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAwID0gZ3JvdXBzMFtqXSwgZ3JvdXAxID0gZ3JvdXBzMVtqXSwgbiA9IGdyb3VwMC5sZW5ndGgsIG1lcmdlID0gbWVyZ2VzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cDBbaV0gfHwgZ3JvdXAxW2ldKSB7XG4gICAgICAgIG1lcmdlW2ldID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKDsgaiA8IG0wOyArK2opIHtcbiAgICBtZXJnZXNbal0gPSBncm91cHMwW2pdO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKG1lcmdlcywgdGhpcy5fcGFyZW50cywgdGhpcy5fbmFtZSwgdGhpcy5faWQpO1xufVxuIiwiaW1wb3J0IHtnZXQsIHNldCwgaW5pdH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gc3RhcnQobmFtZSkge1xuICByZXR1cm4gKG5hbWUgKyBcIlwiKS50cmltKCkuc3BsaXQoL158XFxzKy8pLmV2ZXJ5KGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgcmV0dXJuICF0IHx8IHQgPT09IFwic3RhcnRcIjtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uRnVuY3Rpb24oaWQsIG5hbWUsIGxpc3RlbmVyKSB7XG4gIHZhciBvbjAsIG9uMSwgc2l0ID0gc3RhcnQobmFtZSkgPyBpbml0IDogc2V0O1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2l0KHRoaXMsIGlkKSxcbiAgICAgICAgb24gPSBzY2hlZHVsZS5vbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAob24gIT09IG9uMCkgKG9uMSA9IChvbjAgPSBvbikuY29weSgpKS5vbihuYW1lLCBsaXN0ZW5lcik7XG5cbiAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAyXG4gICAgICA/IGdldCh0aGlzLm5vZGUoKSwgaWQpLm9uLm9uKG5hbWUpXG4gICAgICA6IHRoaXMuZWFjaChvbkZ1bmN0aW9uKGlkLCBuYW1lLCBsaXN0ZW5lcikpO1xufVxuIiwiZnVuY3Rpb24gcmVtb3ZlRnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLl9fdHJhbnNpdGlvbikgaWYgKCtpICE9PSBpZCkgcmV0dXJuO1xuICAgIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9uKFwiZW5kLnJlbW92ZVwiLCByZW1vdmVGdW5jdGlvbih0aGlzLl9pZCkpO1xufVxuIiwiaW1wb3J0IHtzZWxlY3Rvcn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQgPSB0aGlzLl9pZDtcblxuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvcihzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIHN1Ym5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKHN1Ym5vZGUgPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpKSB7XG4gICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIHN1Ymdyb3VwW2ldID0gc3Vibm9kZTtcbiAgICAgICAgc2NoZWR1bGUoc3ViZ3JvdXBbaV0sIG5hbWUsIGlkLCBpLCBzdWJncm91cCwgZ2V0KG5vZGUsIGlkKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwiaW1wb3J0IHtzZWxlY3RvckFsbH0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQgPSB0aGlzLl9pZDtcblxuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvckFsbChzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IFtdLCBwYXJlbnRzID0gW10sIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIGZvciAodmFyIGNoaWxkcmVuID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApLCBjaGlsZCwgaW5oZXJpdCA9IGdldChub2RlLCBpZCksIGsgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBrIDwgbDsgKytrKSB7XG4gICAgICAgICAgaWYgKGNoaWxkID0gY2hpbGRyZW5ba10pIHtcbiAgICAgICAgICAgIHNjaGVkdWxlKGNoaWxkLCBuYW1lLCBpZCwgaywgY2hpbGRyZW4sIGluaGVyaXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdWJncm91cHMucHVzaChjaGlsZHJlbik7XG4gICAgICAgIHBhcmVudHMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCBwYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLCJpbXBvcnQge3NlbGVjdGlvbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuXG52YXIgU2VsZWN0aW9uID0gc2VsZWN0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvcjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2dyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCJpbXBvcnQge2ludGVycG9sYXRlVHJhbnNmb3JtQ3NzIGFzIGludGVycG9sYXRlVHJhbnNmb3JtfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7c3R5bGV9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuaW1wb3J0IGludGVycG9sYXRlIGZyb20gXCIuL2ludGVycG9sYXRlLmpzXCI7XG5cbmZ1bmN0aW9uIHN0eWxlTnVsbChuYW1lLCBpbnRlcnBvbGF0ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSksXG4gICAgICAgIHN0cmluZzEgPSAodGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKSwgc3R5bGUodGhpcywgbmFtZSkpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCBzdHJpbmcxMCA9IHN0cmluZzEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUNvbnN0YW50KG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHN0eWxlKHRoaXMsIG5hbWUpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUZ1bmN0aW9uKG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSksXG4gICAgICAgIHZhbHVlMSA9IHZhbHVlKHRoaXMpLFxuICAgICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHN0cmluZzEgPSB2YWx1ZTEgPSAodGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKSwgc3R5bGUodGhpcywgbmFtZSkpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVNYXliZVJlbW92ZShpZCwgbmFtZSkge1xuICB2YXIgb24wLCBvbjEsIGxpc3RlbmVyMCwga2V5ID0gXCJzdHlsZS5cIiArIG5hbWUsIGV2ZW50ID0gXCJlbmQuXCIgKyBrZXksIHJlbW92ZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIG9uID0gc2NoZWR1bGUub24sXG4gICAgICAgIGxpc3RlbmVyID0gc2NoZWR1bGUudmFsdWVba2V5XSA9PSBudWxsID8gcmVtb3ZlIHx8IChyZW1vdmUgPSBzdHlsZVJlbW92ZShuYW1lKSkgOiB1bmRlZmluZWQ7XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdl4oCZcmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKG9uICE9PSBvbjAgfHwgbGlzdGVuZXIwICE9PSBsaXN0ZW5lcikgKG9uMSA9IChvbjAgPSBvbikuY29weSgpKS5vbihldmVudCwgbGlzdGVuZXIwID0gbGlzdGVuZXIpO1xuXG4gICAgc2NoZWR1bGUub24gPSBvbjE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIgaSA9IChuYW1lICs9IFwiXCIpID09PSBcInRyYW5zZm9ybVwiID8gaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBpbnRlcnBvbGF0ZTtcbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZU51bGwobmFtZSwgaSkpXG4gICAgICAub24oXCJlbmQuc3R5bGUuXCIgKyBuYW1lLCBzdHlsZVJlbW92ZShuYW1lKSlcbiAgICA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdGhpc1xuICAgICAgLnN0eWxlVHdlZW4obmFtZSwgc3R5bGVGdW5jdGlvbihuYW1lLCBpLCB0d2VlblZhbHVlKHRoaXMsIFwic3R5bGUuXCIgKyBuYW1lLCB2YWx1ZSkpKVxuICAgICAgLmVhY2goc3R5bGVNYXliZVJlbW92ZSh0aGlzLl9pZCwgbmFtZSkpXG4gICAgOiB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZUNvbnN0YW50KG5hbWUsIGksIHZhbHVlKSwgcHJpb3JpdHkpXG4gICAgICAub24oXCJlbmQuc3R5bGUuXCIgKyBuYW1lLCBudWxsKTtcbn1cbiIsImZ1bmN0aW9uIHN0eWxlSW50ZXJwb2xhdGUobmFtZSwgaSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIGkuY2FsbCh0aGlzLCB0KSwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZVR3ZWVuKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIgdCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQgPSAoaTAgPSBpKSAmJiBzdHlsZUludGVycG9sYXRlKG5hbWUsIGksIHByaW9yaXR5KTtcbiAgICByZXR1cm4gdDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgdmFyIGtleSA9IFwic3R5bGUuXCIgKyAobmFtZSArPSBcIlwiKTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIHN0eWxlVHdlZW4obmFtZSwgdmFsdWUsIHByaW9yaXR5ID09IG51bGwgPyBcIlwiIDogcHJpb3JpdHkpKTtcbn1cbiIsImltcG9ydCB7dHdlZW5WYWx1ZX0gZnJvbSBcIi4vdHdlZW4uanNcIjtcblxuZnVuY3Rpb24gdGV4dENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlMSA9IHZhbHVlKHRoaXMpO1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTEgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZTE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLnR3ZWVuKFwidGV4dFwiLCB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyB0ZXh0RnVuY3Rpb24odHdlZW5WYWx1ZSh0aGlzLCBcInRleHRcIiwgdmFsdWUpKVxuICAgICAgOiB0ZXh0Q29uc3RhbnQodmFsdWUgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZSArIFwiXCIpKTtcbn1cbiIsImZ1bmN0aW9uIHRleHRJbnRlcnBvbGF0ZShpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IGkuY2FsbCh0aGlzLCB0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dFR3ZWVuKHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgdGV4dEludGVycG9sYXRlKGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIga2V5ID0gXCJ0ZXh0XCI7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSkgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCB0ZXh0VHdlZW4odmFsdWUpKTtcbn1cbiIsImltcG9ydCB7VHJhbnNpdGlvbiwgbmV3SWR9IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZDAgPSB0aGlzLl9pZCxcbiAgICAgIGlkMSA9IG5ld0lkKCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgdmFyIGluaGVyaXQgPSBnZXQobm9kZSwgaWQwKTtcbiAgICAgICAgc2NoZWR1bGUobm9kZSwgbmFtZSwgaWQxLCBpLCBncm91cCwge1xuICAgICAgICAgIHRpbWU6IGluaGVyaXQudGltZSArIGluaGVyaXQuZGVsYXkgKyBpbmhlcml0LmR1cmF0aW9uLFxuICAgICAgICAgIGRlbGF5OiAwLFxuICAgICAgICAgIGR1cmF0aW9uOiBpbmhlcml0LmR1cmF0aW9uLFxuICAgICAgICAgIGVhc2U6IGluaGVyaXQuZWFzZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZDEpO1xufVxuIiwiaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgb24wLCBvbjEsIHRoYXQgPSB0aGlzLCBpZCA9IHRoYXQuX2lkLCBzaXplID0gdGhhdC5zaXplKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgY2FuY2VsID0ge3ZhbHVlOiByZWplY3R9LFxuICAgICAgICBlbmQgPSB7dmFsdWU6IGZ1bmN0aW9uKCkgeyBpZiAoLS1zaXplID09PSAwKSByZXNvbHZlKCk7IH19O1xuXG4gICAgdGhhdC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgICBvbiA9IHNjaGVkdWxlLm9uO1xuXG4gICAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2XigJlyZSBkb25lIVxuICAgICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgICAgaWYgKG9uICE9PSBvbjApIHtcbiAgICAgICAgb24xID0gKG9uMCA9IG9uKS5jb3B5KCk7XG4gICAgICAgIG9uMS5fLmNhbmNlbC5wdXNoKGNhbmNlbCk7XG4gICAgICAgIG9uMS5fLmludGVycnVwdC5wdXNoKGNhbmNlbCk7XG4gICAgICAgIG9uMS5fLmVuZC5wdXNoKGVuZCk7XG4gICAgICB9XG5cbiAgICAgIHNjaGVkdWxlLm9uID0gb24xO1xuICAgIH0pO1xuXG4gICAgLy8gVGhlIHNlbGVjdGlvbiB3YXMgZW1wdHksIHJlc29sdmUgZW5kIGltbWVkaWF0ZWx5XG4gICAgaWYgKHNpemUgPT09IDApIHJlc29sdmUoKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQge3NlbGVjdGlvbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHRyYW5zaXRpb25fYXR0ciBmcm9tIFwiLi9hdHRyLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9hdHRyVHdlZW4gZnJvbSBcIi4vYXR0clR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9kZWxheSBmcm9tIFwiLi9kZWxheS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZHVyYXRpb24gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2Vhc2UgZnJvbSBcIi4vZWFzZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZWFzZVZhcnlpbmcgZnJvbSBcIi4vZWFzZVZhcnlpbmcuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2ZpbHRlciBmcm9tIFwiLi9maWx0ZXIuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX21lcmdlIGZyb20gXCIuL21lcmdlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9vbiBmcm9tIFwiLi9vbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fcmVtb3ZlIGZyb20gXCIuL3JlbW92ZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0IGZyb20gXCIuL3NlbGVjdC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0QWxsIGZyb20gXCIuL3NlbGVjdEFsbC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0aW9uIGZyb20gXCIuL3NlbGVjdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc3R5bGUgZnJvbSBcIi4vc3R5bGUuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3N0eWxlVHdlZW4gZnJvbSBcIi4vc3R5bGVUd2Vlbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdGV4dCBmcm9tIFwiLi90ZXh0LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90ZXh0VHdlZW4gZnJvbSBcIi4vdGV4dFR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90cmFuc2l0aW9uIGZyb20gXCIuL3RyYW5zaXRpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3R3ZWVuIGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lbmQgZnJvbSBcIi4vZW5kLmpzXCI7XG5cbnZhciBpZCA9IDA7XG5cbmV4cG9ydCBmdW5jdGlvbiBUcmFuc2l0aW9uKGdyb3VwcywgcGFyZW50cywgbmFtZSwgaWQpIHtcbiAgdGhpcy5fZ3JvdXBzID0gZ3JvdXBzO1xuICB0aGlzLl9wYXJlbnRzID0gcGFyZW50cztcbiAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gIHRoaXMuX2lkID0gaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zaXRpb24obmFtZSkge1xuICByZXR1cm4gc2VsZWN0aW9uKCkudHJhbnNpdGlvbihuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5ld0lkKCkge1xuICByZXR1cm4gKytpZDtcbn1cblxudmFyIHNlbGVjdGlvbl9wcm90b3R5cGUgPSBzZWxlY3Rpb24ucHJvdG90eXBlO1xuXG5UcmFuc2l0aW9uLnByb3RvdHlwZSA9IHRyYW5zaXRpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVHJhbnNpdGlvbixcbiAgc2VsZWN0OiB0cmFuc2l0aW9uX3NlbGVjdCxcbiAgc2VsZWN0QWxsOiB0cmFuc2l0aW9uX3NlbGVjdEFsbCxcbiAgc2VsZWN0Q2hpbGQ6IHNlbGVjdGlvbl9wcm90b3R5cGUuc2VsZWN0Q2hpbGQsXG4gIHNlbGVjdENoaWxkcmVuOiBzZWxlY3Rpb25fcHJvdG90eXBlLnNlbGVjdENoaWxkcmVuLFxuICBmaWx0ZXI6IHRyYW5zaXRpb25fZmlsdGVyLFxuICBtZXJnZTogdHJhbnNpdGlvbl9tZXJnZSxcbiAgc2VsZWN0aW9uOiB0cmFuc2l0aW9uX3NlbGVjdGlvbixcbiAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbl90cmFuc2l0aW9uLFxuICBjYWxsOiBzZWxlY3Rpb25fcHJvdG90eXBlLmNhbGwsXG4gIG5vZGVzOiBzZWxlY3Rpb25fcHJvdG90eXBlLm5vZGVzLFxuICBub2RlOiBzZWxlY3Rpb25fcHJvdG90eXBlLm5vZGUsXG4gIHNpemU6IHNlbGVjdGlvbl9wcm90b3R5cGUuc2l6ZSxcbiAgZW1wdHk6IHNlbGVjdGlvbl9wcm90b3R5cGUuZW1wdHksXG4gIGVhY2g6IHNlbGVjdGlvbl9wcm90b3R5cGUuZWFjaCxcbiAgb246IHRyYW5zaXRpb25fb24sXG4gIGF0dHI6IHRyYW5zaXRpb25fYXR0cixcbiAgYXR0clR3ZWVuOiB0cmFuc2l0aW9uX2F0dHJUd2VlbixcbiAgc3R5bGU6IHRyYW5zaXRpb25fc3R5bGUsXG4gIHN0eWxlVHdlZW46IHRyYW5zaXRpb25fc3R5bGVUd2VlbixcbiAgdGV4dDogdHJhbnNpdGlvbl90ZXh0LFxuICB0ZXh0VHdlZW46IHRyYW5zaXRpb25fdGV4dFR3ZWVuLFxuICByZW1vdmU6IHRyYW5zaXRpb25fcmVtb3ZlLFxuICB0d2VlbjogdHJhbnNpdGlvbl90d2VlbixcbiAgZGVsYXk6IHRyYW5zaXRpb25fZGVsYXksXG4gIGR1cmF0aW9uOiB0cmFuc2l0aW9uX2R1cmF0aW9uLFxuICBlYXNlOiB0cmFuc2l0aW9uX2Vhc2UsXG4gIGVhc2VWYXJ5aW5nOiB0cmFuc2l0aW9uX2Vhc2VWYXJ5aW5nLFxuICBlbmQ6IHRyYW5zaXRpb25fZW5kLFxuICBbU3ltYm9sLml0ZXJhdG9yXTogc2VsZWN0aW9uX3Byb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdXG59O1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGN1YmljSW4odCkge1xuICByZXR1cm4gdCAqIHQgKiB0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3ViaWNPdXQodCkge1xuICByZXR1cm4gLS10ICogdCAqIHQgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3ViaWNJbk91dCh0KSB7XG4gIHJldHVybiAoKHQgKj0gMikgPD0gMSA/IHQgKiB0ICogdCA6ICh0IC09IDIpICogdCAqIHQgKyAyKSAvIDI7XG59XG4iLCJpbXBvcnQge1RyYW5zaXRpb24sIG5ld0lkfSBmcm9tIFwiLi4vdHJhbnNpdGlvbi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlIGZyb20gXCIuLi90cmFuc2l0aW9uL3NjaGVkdWxlLmpzXCI7XG5pbXBvcnQge2Vhc2VDdWJpY0luT3V0fSBmcm9tIFwiZDMtZWFzZVwiO1xuaW1wb3J0IHtub3d9IGZyb20gXCJkMy10aW1lclwiO1xuXG52YXIgZGVmYXVsdFRpbWluZyA9IHtcbiAgdGltZTogbnVsbCwgLy8gU2V0IG9uIHVzZS5cbiAgZGVsYXk6IDAsXG4gIGR1cmF0aW9uOiAyNTAsXG4gIGVhc2U6IGVhc2VDdWJpY0luT3V0XG59O1xuXG5mdW5jdGlvbiBpbmhlcml0KG5vZGUsIGlkKSB7XG4gIHZhciB0aW1pbmc7XG4gIHdoaWxlICghKHRpbWluZyA9IG5vZGUuX190cmFuc2l0aW9uKSB8fCAhKHRpbWluZyA9IHRpbWluZ1tpZF0pKSB7XG4gICAgaWYgKCEobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdHJhbnNpdGlvbiAke2lkfSBub3QgZm91bmRgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRpbWluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgaWQsXG4gICAgICB0aW1pbmc7XG5cbiAgaWYgKG5hbWUgaW5zdGFuY2VvZiBUcmFuc2l0aW9uKSB7XG4gICAgaWQgPSBuYW1lLl9pZCwgbmFtZSA9IG5hbWUuX25hbWU7XG4gIH0gZWxzZSB7XG4gICAgaWQgPSBuZXdJZCgpLCAodGltaW5nID0gZGVmYXVsdFRpbWluZykudGltZSA9IG5vdygpLCBuYW1lID0gbmFtZSA9PSBudWxsID8gbnVsbCA6IG5hbWUgKyBcIlwiO1xuICB9XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc2NoZWR1bGUobm9kZSwgbmFtZSwgaWQsIGksIGdyb3VwLCB0aW1pbmcgfHwgaW5oZXJpdChub2RlLCBpZCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihncm91cHMsIHRoaXMuX3BhcmVudHMsIG5hbWUsIGlkKTtcbn1cbiIsImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2ludGVycnVwdCBmcm9tIFwiLi9pbnRlcnJ1cHQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fdHJhbnNpdGlvbiBmcm9tIFwiLi90cmFuc2l0aW9uLmpzXCI7XG5cbnNlbGVjdGlvbi5wcm90b3R5cGUuaW50ZXJydXB0ID0gc2VsZWN0aW9uX2ludGVycnVwdDtcbnNlbGVjdGlvbi5wcm90b3R5cGUudHJhbnNpdGlvbiA9IHNlbGVjdGlvbl90cmFuc2l0aW9uO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGluaXRSYW5nZShkb21haW4sIHJhbmdlKSB7XG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogYnJlYWs7XG4gICAgY2FzZSAxOiB0aGlzLnJhbmdlKGRvbWFpbik7IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRoaXMucmFuZ2UocmFuZ2UpLmRvbWFpbihkb21haW4pOyBicmVhaztcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRJbnRlcnBvbGF0b3IoZG9tYWluLCBpbnRlcnBvbGF0b3IpIHtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiBicmVhaztcbiAgICBjYXNlIDE6IHtcbiAgICAgIGlmICh0eXBlb2YgZG9tYWluID09PSBcImZ1bmN0aW9uXCIpIHRoaXMuaW50ZXJwb2xhdG9yKGRvbWFpbik7XG4gICAgICBlbHNlIHRoaXMucmFuZ2UoZG9tYWluKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICB0aGlzLmRvbWFpbihkb21haW4pO1xuICAgICAgaWYgKHR5cGVvZiBpbnRlcnBvbGF0b3IgPT09IFwiZnVuY3Rpb25cIikgdGhpcy5pbnRlcnBvbGF0b3IoaW50ZXJwb2xhdG9yKTtcbiAgICAgIGVsc2UgdGhpcy5yYW5nZShpbnRlcnBvbGF0b3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuIiwiaW1wb3J0IHtJbnRlcm5NYXB9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtpbml0UmFuZ2V9IGZyb20gXCIuL2luaXQuanNcIjtcblxuZXhwb3J0IGNvbnN0IGltcGxpY2l0ID0gU3ltYm9sKFwiaW1wbGljaXRcIik7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9yZGluYWwoKSB7XG4gIHZhciBpbmRleCA9IG5ldyBJbnRlcm5NYXAoKSxcbiAgICAgIGRvbWFpbiA9IFtdLFxuICAgICAgcmFuZ2UgPSBbXSxcbiAgICAgIHVua25vd24gPSBpbXBsaWNpdDtcblxuICBmdW5jdGlvbiBzY2FsZShkKSB7XG4gICAgbGV0IGkgPSBpbmRleC5nZXQoZCk7XG4gICAgaWYgKGkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHVua25vd24gIT09IGltcGxpY2l0KSByZXR1cm4gdW5rbm93bjtcbiAgICAgIGluZGV4LnNldChkLCBpID0gZG9tYWluLnB1c2goZCkgLSAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlW2kgJSByYW5nZS5sZW5ndGhdO1xuICB9XG5cbiAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRvbWFpbi5zbGljZSgpO1xuICAgIGRvbWFpbiA9IFtdLCBpbmRleCA9IG5ldyBJbnRlcm5NYXAoKTtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIF8pIHtcbiAgICAgIGlmIChpbmRleC5oYXModmFsdWUpKSBjb250aW51ZTtcbiAgICAgIGluZGV4LnNldCh2YWx1ZSwgZG9tYWluLnB1c2godmFsdWUpIC0gMSk7XG4gICAgfVxuICAgIHJldHVybiBzY2FsZTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyYW5nZSA9IEFycmF5LmZyb20oXyksIHNjYWxlKSA6IHJhbmdlLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUudW5rbm93biA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh1bmtub3duID0gXywgc2NhbGUpIDogdW5rbm93bjtcbiAgfTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG9yZGluYWwoZG9tYWluLCByYW5nZSkudW5rbm93bih1bmtub3duKTtcbiAgfTtcblxuICBpbml0UmFuZ2UuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG5cbiAgcmV0dXJuIHNjYWxlO1xufVxuIiwiaW1wb3J0IHtyYW5nZSBhcyBzZXF1ZW5jZX0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuaW1wb3J0IG9yZGluYWwgZnJvbSBcIi4vb3JkaW5hbC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBiYW5kKCkge1xuICB2YXIgc2NhbGUgPSBvcmRpbmFsKCkudW5rbm93bih1bmRlZmluZWQpLFxuICAgICAgZG9tYWluID0gc2NhbGUuZG9tYWluLFxuICAgICAgb3JkaW5hbFJhbmdlID0gc2NhbGUucmFuZ2UsXG4gICAgICByMCA9IDAsXG4gICAgICByMSA9IDEsXG4gICAgICBzdGVwLFxuICAgICAgYmFuZHdpZHRoLFxuICAgICAgcm91bmQgPSBmYWxzZSxcbiAgICAgIHBhZGRpbmdJbm5lciA9IDAsXG4gICAgICBwYWRkaW5nT3V0ZXIgPSAwLFxuICAgICAgYWxpZ24gPSAwLjU7XG5cbiAgZGVsZXRlIHNjYWxlLnVua25vd247XG5cbiAgZnVuY3Rpb24gcmVzY2FsZSgpIHtcbiAgICB2YXIgbiA9IGRvbWFpbigpLmxlbmd0aCxcbiAgICAgICAgcmV2ZXJzZSA9IHIxIDwgcjAsXG4gICAgICAgIHN0YXJ0ID0gcmV2ZXJzZSA/IHIxIDogcjAsXG4gICAgICAgIHN0b3AgPSByZXZlcnNlID8gcjAgOiByMTtcbiAgICBzdGVwID0gKHN0b3AgLSBzdGFydCkgLyBNYXRoLm1heCgxLCBuIC0gcGFkZGluZ0lubmVyICsgcGFkZGluZ091dGVyICogMik7XG4gICAgaWYgKHJvdW5kKSBzdGVwID0gTWF0aC5mbG9vcihzdGVwKTtcbiAgICBzdGFydCArPSAoc3RvcCAtIHN0YXJ0IC0gc3RlcCAqIChuIC0gcGFkZGluZ0lubmVyKSkgKiBhbGlnbjtcbiAgICBiYW5kd2lkdGggPSBzdGVwICogKDEgLSBwYWRkaW5nSW5uZXIpO1xuICAgIGlmIChyb3VuZCkgc3RhcnQgPSBNYXRoLnJvdW5kKHN0YXJ0KSwgYmFuZHdpZHRoID0gTWF0aC5yb3VuZChiYW5kd2lkdGgpO1xuICAgIHZhciB2YWx1ZXMgPSBzZXF1ZW5jZShuKS5tYXAoZnVuY3Rpb24oaSkgeyByZXR1cm4gc3RhcnQgKyBzdGVwICogaTsgfSk7XG4gICAgcmV0dXJuIG9yZGluYWxSYW5nZShyZXZlcnNlID8gdmFsdWVzLnJldmVyc2UoKSA6IHZhbHVlcyk7XG4gIH1cblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluKF8pLCByZXNjYWxlKCkpIDogZG9tYWluKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoW3IwLCByMV0gPSBfLCByMCA9ICtyMCwgcjEgPSArcjEsIHJlc2NhbGUoKSkgOiBbcjAsIHIxXTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBbcjAsIHIxXSA9IF8sIHIwID0gK3IwLCByMSA9ICtyMSwgcm91bmQgPSB0cnVlLCByZXNjYWxlKCk7XG4gIH07XG5cbiAgc2NhbGUuYmFuZHdpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGJhbmR3aWR0aDtcbiAgfTtcblxuICBzY2FsZS5zdGVwID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHN0ZXA7XG4gIH07XG5cbiAgc2NhbGUucm91bmQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocm91bmQgPSAhIV8sIHJlc2NhbGUoKSkgOiByb3VuZDtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdJbm5lciA9IE1hdGgubWluKDEsIHBhZGRpbmdPdXRlciA9ICtfKSwgcmVzY2FsZSgpKSA6IHBhZGRpbmdJbm5lcjtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nSW5uZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ0lubmVyID0gTWF0aC5taW4oMSwgXyksIHJlc2NhbGUoKSkgOiBwYWRkaW5nSW5uZXI7XG4gIH07XG5cbiAgc2NhbGUucGFkZGluZ091dGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdPdXRlciA9ICtfLCByZXNjYWxlKCkpIDogcGFkZGluZ091dGVyO1xuICB9O1xuXG4gIHNjYWxlLmFsaWduID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGFsaWduID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgXykpLCByZXNjYWxlKCkpIDogYWxpZ247XG4gIH07XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBiYW5kKGRvbWFpbigpLCBbcjAsIHIxXSlcbiAgICAgICAgLnJvdW5kKHJvdW5kKVxuICAgICAgICAucGFkZGluZ0lubmVyKHBhZGRpbmdJbm5lcilcbiAgICAgICAgLnBhZGRpbmdPdXRlcihwYWRkaW5nT3V0ZXIpXG4gICAgICAgIC5hbGlnbihhbGlnbik7XG4gIH07XG5cbiAgcmV0dXJuIGluaXRSYW5nZS5hcHBseShyZXNjYWxlKCksIGFyZ3VtZW50cyk7XG59XG5cbmZ1bmN0aW9uIHBvaW50aXNoKHNjYWxlKSB7XG4gIHZhciBjb3B5ID0gc2NhbGUuY29weTtcblxuICBzY2FsZS5wYWRkaW5nID0gc2NhbGUucGFkZGluZ091dGVyO1xuICBkZWxldGUgc2NhbGUucGFkZGluZ0lubmVyO1xuICBkZWxldGUgc2NhbGUucGFkZGluZ091dGVyO1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcG9pbnRpc2goY29weSgpKTtcbiAgfTtcblxuICByZXR1cm4gc2NhbGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb2ludCgpIHtcbiAgcmV0dXJuIHBvaW50aXNoKGJhbmQuYXBwbHkobnVsbCwgYXJndW1lbnRzKS5wYWRkaW5nSW5uZXIoMSkpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29uc3RhbnRzKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbnVtYmVyKHgpIHtcbiAgcmV0dXJuICt4O1xufVxuIiwiaW1wb3J0IHtiaXNlY3R9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZSBhcyBpbnRlcnBvbGF0ZVZhbHVlLCBpbnRlcnBvbGF0ZU51bWJlciwgaW50ZXJwb2xhdGVSb3VuZH0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbnZhciB1bml0ID0gWzAsIDFdO1xuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuICByZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplKGEsIGIpIHtcbiAgcmV0dXJuIChiIC09IChhID0gK2EpKVxuICAgICAgPyBmdW5jdGlvbih4KSB7IHJldHVybiAoeCAtIGEpIC8gYjsgfVxuICAgICAgOiBjb25zdGFudChpc05hTihiKSA/IE5hTiA6IDAuNSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wZXIoYSwgYikge1xuICB2YXIgdDtcbiAgaWYgKGEgPiBiKSB0ID0gYSwgYSA9IGIsIGIgPSB0O1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gTWF0aC5tYXgoYSwgTWF0aC5taW4oYiwgeCkpOyB9O1xufVxuXG4vLyBub3JtYWxpemUoYSwgYikoeCkgdGFrZXMgYSBkb21haW4gdmFsdWUgeCBpbiBbYSxiXSBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBwYXJhbWV0ZXIgdCBpbiBbMCwxXS5cbi8vIGludGVycG9sYXRlKGEsIGIpKHQpIHRha2VzIGEgcGFyYW1ldGVyIHQgaW4gWzAsMV0gYW5kIHJldHVybnMgdGhlIGNvcnJlc3BvbmRpbmcgcmFuZ2UgdmFsdWUgeCBpbiBbYSxiXS5cbmZ1bmN0aW9uIGJpbWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBkMCA9IGRvbWFpblswXSwgZDEgPSBkb21haW5bMV0sIHIwID0gcmFuZ2VbMF0sIHIxID0gcmFuZ2VbMV07XG4gIGlmIChkMSA8IGQwKSBkMCA9IG5vcm1hbGl6ZShkMSwgZDApLCByMCA9IGludGVycG9sYXRlKHIxLCByMCk7XG4gIGVsc2UgZDAgPSBub3JtYWxpemUoZDAsIGQxKSwgcjAgPSBpbnRlcnBvbGF0ZShyMCwgcjEpO1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gcjAoZDAoeCkpOyB9O1xufVxuXG5mdW5jdGlvbiBwb2x5bWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBqID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKSAtIDEsXG4gICAgICBkID0gbmV3IEFycmF5KGopLFxuICAgICAgciA9IG5ldyBBcnJheShqKSxcbiAgICAgIGkgPSAtMTtcblxuICAvLyBSZXZlcnNlIGRlc2NlbmRpbmcgZG9tYWlucy5cbiAgaWYgKGRvbWFpbltqXSA8IGRvbWFpblswXSkge1xuICAgIGRvbWFpbiA9IGRvbWFpbi5zbGljZSgpLnJldmVyc2UoKTtcbiAgICByYW5nZSA9IHJhbmdlLnNsaWNlKCkucmV2ZXJzZSgpO1xuICB9XG5cbiAgd2hpbGUgKCsraSA8IGopIHtcbiAgICBkW2ldID0gbm9ybWFsaXplKGRvbWFpbltpXSwgZG9tYWluW2kgKyAxXSk7XG4gICAgcltpXSA9IGludGVycG9sYXRlKHJhbmdlW2ldLCByYW5nZVtpICsgMV0pO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgaSA9IGJpc2VjdChkb21haW4sIHgsIDEsIGopIC0gMTtcbiAgICByZXR1cm4gcltpXShkW2ldKHgpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkoc291cmNlLCB0YXJnZXQpIHtcbiAgcmV0dXJuIHRhcmdldFxuICAgICAgLmRvbWFpbihzb3VyY2UuZG9tYWluKCkpXG4gICAgICAucmFuZ2Uoc291cmNlLnJhbmdlKCkpXG4gICAgICAuaW50ZXJwb2xhdGUoc291cmNlLmludGVycG9sYXRlKCkpXG4gICAgICAuY2xhbXAoc291cmNlLmNsYW1wKCkpXG4gICAgICAudW5rbm93bihzb3VyY2UudW5rbm93bigpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybWVyKCkge1xuICB2YXIgZG9tYWluID0gdW5pdCxcbiAgICAgIHJhbmdlID0gdW5pdCxcbiAgICAgIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVWYWx1ZSxcbiAgICAgIHRyYW5zZm9ybSxcbiAgICAgIHVudHJhbnNmb3JtLFxuICAgICAgdW5rbm93bixcbiAgICAgIGNsYW1wID0gaWRlbnRpdHksXG4gICAgICBwaWVjZXdpc2UsXG4gICAgICBvdXRwdXQsXG4gICAgICBpbnB1dDtcblxuICBmdW5jdGlvbiByZXNjYWxlKCkge1xuICAgIHZhciBuID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKTtcbiAgICBpZiAoY2xhbXAgIT09IGlkZW50aXR5KSBjbGFtcCA9IGNsYW1wZXIoZG9tYWluWzBdLCBkb21haW5bbiAtIDFdKTtcbiAgICBwaWVjZXdpc2UgPSBuID4gMiA/IHBvbHltYXAgOiBiaW1hcDtcbiAgICBvdXRwdXQgPSBpbnB1dCA9IG51bGw7XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgIHJldHVybiB4ID09IG51bGwgfHwgaXNOYU4oeCA9ICt4KSA/IHVua25vd24gOiAob3V0cHV0IHx8IChvdXRwdXQgPSBwaWVjZXdpc2UoZG9tYWluLm1hcCh0cmFuc2Zvcm0pLCByYW5nZSwgaW50ZXJwb2xhdGUpKSkodHJhbnNmb3JtKGNsYW1wKHgpKSk7XG4gIH1cblxuICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIGNsYW1wKHVudHJhbnNmb3JtKChpbnB1dCB8fCAoaW5wdXQgPSBwaWVjZXdpc2UocmFuZ2UsIGRvbWFpbi5tYXAodHJhbnNmb3JtKSwgaW50ZXJwb2xhdGVOdW1iZXIpKSkoeSkpKTtcbiAgfTtcblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluID0gQXJyYXkuZnJvbShfLCBudW1iZXIpLCByZXNjYWxlKCkpIDogZG9tYWluLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFuZ2UgPSBBcnJheS5mcm9tKF8pLCByZXNjYWxlKCkpIDogcmFuZ2Uuc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiByYW5nZSA9IEFycmF5LmZyb20oXyksIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVSb3VuZCwgcmVzY2FsZSgpO1xuICB9O1xuXG4gIHNjYWxlLmNsYW1wID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGNsYW1wID0gXyA/IHRydWUgOiBpZGVudGl0eSwgcmVzY2FsZSgpKSA6IGNsYW1wICE9PSBpZGVudGl0eTtcbiAgfTtcblxuICBzY2FsZS5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChpbnRlcnBvbGF0ZSA9IF8sIHJlc2NhbGUoKSkgOiBpbnRlcnBvbGF0ZTtcbiAgfTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbih0LCB1KSB7XG4gICAgdHJhbnNmb3JtID0gdCwgdW50cmFuc2Zvcm0gPSB1O1xuICAgIHJldHVybiByZXNjYWxlKCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbnRpbnVvdXMoKSB7XG4gIHJldHVybiB0cmFuc2Zvcm1lcigpKGlkZW50aXR5LCBpZGVudGl0eSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBuaWNlKGRvbWFpbiwgaW50ZXJ2YWwpIHtcbiAgZG9tYWluID0gZG9tYWluLnNsaWNlKCk7XG5cbiAgdmFyIGkwID0gMCxcbiAgICAgIGkxID0gZG9tYWluLmxlbmd0aCAtIDEsXG4gICAgICB4MCA9IGRvbWFpbltpMF0sXG4gICAgICB4MSA9IGRvbWFpbltpMV0sXG4gICAgICB0O1xuXG4gIGlmICh4MSA8IHgwKSB7XG4gICAgdCA9IGkwLCBpMCA9IGkxLCBpMSA9IHQ7XG4gICAgdCA9IHgwLCB4MCA9IHgxLCB4MSA9IHQ7XG4gIH1cblxuICBkb21haW5baTBdID0gaW50ZXJ2YWwuZmxvb3IoeDApO1xuICBkb21haW5baTFdID0gaW50ZXJ2YWwuY2VpbCh4MSk7XG4gIHJldHVybiBkb21haW47XG59XG4iLCJjb25zdCB0MCA9IG5ldyBEYXRlLCB0MSA9IG5ldyBEYXRlO1xuXG5leHBvcnQgZnVuY3Rpb24gdGltZUludGVydmFsKGZsb29yaSwgb2Zmc2V0aSwgY291bnQsIGZpZWxkKSB7XG5cbiAgZnVuY3Rpb24gaW50ZXJ2YWwoZGF0ZSkge1xuICAgIHJldHVybiBmbG9vcmkoZGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDAgPyBuZXcgRGF0ZSA6IG5ldyBEYXRlKCtkYXRlKSksIGRhdGU7XG4gIH1cblxuICBpbnRlcnZhbC5mbG9vciA9IChkYXRlKSA9PiB7XG4gICAgcmV0dXJuIGZsb29yaShkYXRlID0gbmV3IERhdGUoK2RhdGUpKSwgZGF0ZTtcbiAgfTtcblxuICBpbnRlcnZhbC5jZWlsID0gKGRhdGUpID0+IHtcbiAgICByZXR1cm4gZmxvb3JpKGRhdGUgPSBuZXcgRGF0ZShkYXRlIC0gMSkpLCBvZmZzZXRpKGRhdGUsIDEpLCBmbG9vcmkoZGF0ZSksIGRhdGU7XG4gIH07XG5cbiAgaW50ZXJ2YWwucm91bmQgPSAoZGF0ZSkgPT4ge1xuICAgIGNvbnN0IGQwID0gaW50ZXJ2YWwoZGF0ZSksIGQxID0gaW50ZXJ2YWwuY2VpbChkYXRlKTtcbiAgICByZXR1cm4gZGF0ZSAtIGQwIDwgZDEgLSBkYXRlID8gZDAgOiBkMTtcbiAgfTtcblxuICBpbnRlcnZhbC5vZmZzZXQgPSAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIHJldHVybiBvZmZzZXRpKGRhdGUgPSBuZXcgRGF0ZSgrZGF0ZSksIHN0ZXAgPT0gbnVsbCA/IDEgOiBNYXRoLmZsb29yKHN0ZXApKSwgZGF0ZTtcbiAgfTtcblxuICBpbnRlcnZhbC5yYW5nZSA9IChzdGFydCwgc3RvcCwgc3RlcCkgPT4ge1xuICAgIGNvbnN0IHJhbmdlID0gW107XG4gICAgc3RhcnQgPSBpbnRlcnZhbC5jZWlsKHN0YXJ0KTtcbiAgICBzdGVwID0gc3RlcCA9PSBudWxsID8gMSA6IE1hdGguZmxvb3Ioc3RlcCk7XG4gICAgaWYgKCEoc3RhcnQgPCBzdG9wKSB8fCAhKHN0ZXAgPiAwKSkgcmV0dXJuIHJhbmdlOyAvLyBhbHNvIGhhbmRsZXMgSW52YWxpZCBEYXRlXG4gICAgbGV0IHByZXZpb3VzO1xuICAgIGRvIHJhbmdlLnB1c2gocHJldmlvdXMgPSBuZXcgRGF0ZSgrc3RhcnQpKSwgb2Zmc2V0aShzdGFydCwgc3RlcCksIGZsb29yaShzdGFydCk7XG4gICAgd2hpbGUgKHByZXZpb3VzIDwgc3RhcnQgJiYgc3RhcnQgPCBzdG9wKTtcbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgaW50ZXJ2YWwuZmlsdGVyID0gKHRlc3QpID0+IHtcbiAgICByZXR1cm4gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgICBpZiAoZGF0ZSA+PSBkYXRlKSB3aGlsZSAoZmxvb3JpKGRhdGUpLCAhdGVzdChkYXRlKSkgZGF0ZS5zZXRUaW1lKGRhdGUgLSAxKTtcbiAgICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgICAgaWYgKGRhdGUgPj0gZGF0ZSkge1xuICAgICAgICBpZiAoc3RlcCA8IDApIHdoaWxlICgrK3N0ZXAgPD0gMCkge1xuICAgICAgICAgIHdoaWxlIChvZmZzZXRpKGRhdGUsIC0xKSwgIXRlc3QoZGF0ZSkpIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZW1wdHlcbiAgICAgICAgfSBlbHNlIHdoaWxlICgtLXN0ZXAgPj0gMCkge1xuICAgICAgICAgIHdoaWxlIChvZmZzZXRpKGRhdGUsICsxKSwgIXRlc3QoZGF0ZSkpIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZW1wdHlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIGlmIChjb3VudCkge1xuICAgIGludGVydmFsLmNvdW50ID0gKHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgIHQwLnNldFRpbWUoK3N0YXJ0KSwgdDEuc2V0VGltZSgrZW5kKTtcbiAgICAgIGZsb29yaSh0MCksIGZsb29yaSh0MSk7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihjb3VudCh0MCwgdDEpKTtcbiAgICB9O1xuXG4gICAgaW50ZXJ2YWwuZXZlcnkgPSAoc3RlcCkgPT4ge1xuICAgICAgc3RlcCA9IE1hdGguZmxvb3Ioc3RlcCk7XG4gICAgICByZXR1cm4gIWlzRmluaXRlKHN0ZXApIHx8ICEoc3RlcCA+IDApID8gbnVsbFxuICAgICAgICAgIDogIShzdGVwID4gMSkgPyBpbnRlcnZhbFxuICAgICAgICAgIDogaW50ZXJ2YWwuZmlsdGVyKGZpZWxkXG4gICAgICAgICAgICAgID8gKGQpID0+IGZpZWxkKGQpICUgc3RlcCA9PT0gMFxuICAgICAgICAgICAgICA6IChkKSA9PiBpbnRlcnZhbC5jb3VudCgwLCBkKSAlIHN0ZXAgPT09IDApO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gaW50ZXJ2YWw7XG59XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcblxuZXhwb3J0IGNvbnN0IG1pbGxpc2Vjb25kID0gdGltZUludGVydmFsKCgpID0+IHtcbiAgLy8gbm9vcFxufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kIC0gc3RhcnQ7XG59KTtcblxuLy8gQW4gb3B0aW1pemVkIGltcGxlbWVudGF0aW9uIGZvciB0aGlzIHNpbXBsZSBjYXNlLlxubWlsbGlzZWNvbmQuZXZlcnkgPSAoaykgPT4ge1xuICBrID0gTWF0aC5mbG9vcihrKTtcbiAgaWYgKCFpc0Zpbml0ZShrKSB8fCAhKGsgPiAwKSkgcmV0dXJuIG51bGw7XG4gIGlmICghKGsgPiAxKSkgcmV0dXJuIG1pbGxpc2Vjb25kO1xuICByZXR1cm4gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRUaW1lKE1hdGguZmxvb3IoZGF0ZSAvIGspICogayk7XG4gIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGspO1xuICB9LCAoc3RhcnQsIGVuZCkgPT4ge1xuICAgIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gaztcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgbWlsbGlzZWNvbmRzID0gbWlsbGlzZWNvbmQucmFuZ2U7XG4iLCJleHBvcnQgY29uc3QgZHVyYXRpb25TZWNvbmQgPSAxMDAwO1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uTWludXRlID0gZHVyYXRpb25TZWNvbmQgKiA2MDtcbmV4cG9ydCBjb25zdCBkdXJhdGlvbkhvdXIgPSBkdXJhdGlvbk1pbnV0ZSAqIDYwO1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uRGF5ID0gZHVyYXRpb25Ib3VyICogMjQ7XG5leHBvcnQgY29uc3QgZHVyYXRpb25XZWVrID0gZHVyYXRpb25EYXkgKiA3O1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uTW9udGggPSBkdXJhdGlvbkRheSAqIDMwO1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uWWVhciA9IGR1cmF0aW9uRGF5ICogMzY1O1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uU2Vjb25kfSBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuXG5leHBvcnQgY29uc3Qgc2Vjb25kID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VGltZShkYXRlIC0gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25TZWNvbmQpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvblNlY29uZDtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ1NlY29uZHMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3Qgc2Vjb25kcyA9IHNlY29uZC5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvbk1pbnV0ZSwgZHVyYXRpb25TZWNvbmR9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lTWludXRlID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VGltZShkYXRlIC0gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSAtIGRhdGUuZ2V0U2Vjb25kcygpICogZHVyYXRpb25TZWNvbmQpO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGR1cmF0aW9uTWludXRlKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25NaW51dGU7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRNaW51dGVzKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHRpbWVNaW51dGVzID0gdGltZU1pbnV0ZS5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y01pbnV0ZSA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ1NlY29uZHMoMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25NaW51dGUpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbk1pbnV0ZTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ01pbnV0ZXMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdXRjTWludXRlcyA9IHV0Y01pbnV0ZS5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvbkhvdXIsIGR1cmF0aW9uTWludXRlLCBkdXJhdGlvblNlY29uZH0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVIb3VyID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VGltZShkYXRlIC0gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSAtIGRhdGUuZ2V0U2Vjb25kcygpICogZHVyYXRpb25TZWNvbmQgLSBkYXRlLmdldE1pbnV0ZXMoKSAqIGR1cmF0aW9uTWludXRlKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBkdXJhdGlvbkhvdXIpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbkhvdXI7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRIb3VycygpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB0aW1lSG91cnMgPSB0aW1lSG91ci5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y0hvdXIgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENNaW51dGVzKDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGR1cmF0aW9uSG91cik7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uSG91cjtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ0hvdXJzKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHV0Y0hvdXJzID0gdXRjSG91ci5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvbkRheSwgZHVyYXRpb25NaW51dGV9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lRGF5ID0gdGltZUludGVydmFsKFxuICBkYXRlID0+IGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCksXG4gIChkYXRlLCBzdGVwKSA9PiBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBzdGVwKSxcbiAgKHN0YXJ0LCBlbmQpID0+IChlbmQgLSBzdGFydCAtIChlbmQuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIHN0YXJ0LmdldFRpbWV6b25lT2Zmc2V0KCkpICogZHVyYXRpb25NaW51dGUpIC8gZHVyYXRpb25EYXksXG4gIGRhdGUgPT4gZGF0ZS5nZXREYXRlKCkgLSAxXG4pO1xuXG5leHBvcnQgY29uc3QgdGltZURheXMgPSB0aW1lRGF5LnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjRGF5ID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25EYXk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENEYXRlKCkgLSAxO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1dGNEYXlzID0gdXRjRGF5LnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdW5peERheSA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uRGF5O1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoZGF0ZSAvIGR1cmF0aW9uRGF5KTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdW5peERheXMgPSB1bml4RGF5LnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uTWludXRlLCBkdXJhdGlvbldlZWt9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmZ1bmN0aW9uIHRpbWVXZWVrZGF5KGkpIHtcbiAgcmV0dXJuIHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSAtIChkYXRlLmdldERheSgpICsgNyAtIGkpICUgNyk7XG4gICAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBzdGVwICogNyk7XG4gIH0sIChzdGFydCwgZW5kKSA9PiB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCAtIChlbmQuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIHN0YXJ0LmdldFRpbWV6b25lT2Zmc2V0KCkpICogZHVyYXRpb25NaW51dGUpIC8gZHVyYXRpb25XZWVrO1xuICB9KTtcbn1cblxuZXhwb3J0IGNvbnN0IHRpbWVTdW5kYXkgPSB0aW1lV2Vla2RheSgwKTtcbmV4cG9ydCBjb25zdCB0aW1lTW9uZGF5ID0gdGltZVdlZWtkYXkoMSk7XG5leHBvcnQgY29uc3QgdGltZVR1ZXNkYXkgPSB0aW1lV2Vla2RheSgyKTtcbmV4cG9ydCBjb25zdCB0aW1lV2VkbmVzZGF5ID0gdGltZVdlZWtkYXkoMyk7XG5leHBvcnQgY29uc3QgdGltZVRodXJzZGF5ID0gdGltZVdlZWtkYXkoNCk7XG5leHBvcnQgY29uc3QgdGltZUZyaWRheSA9IHRpbWVXZWVrZGF5KDUpO1xuZXhwb3J0IGNvbnN0IHRpbWVTYXR1cmRheSA9IHRpbWVXZWVrZGF5KDYpO1xuXG5leHBvcnQgY29uc3QgdGltZVN1bmRheXMgPSB0aW1lU3VuZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVNb25kYXlzID0gdGltZU1vbmRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lVHVlc2RheXMgPSB0aW1lVHVlc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lV2VkbmVzZGF5cyA9IHRpbWVXZWRuZXNkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZVRodXJzZGF5cyA9IHRpbWVUaHVyc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lRnJpZGF5cyA9IHRpbWVGcmlkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZVNhdHVyZGF5cyA9IHRpbWVTYXR1cmRheS5yYW5nZTtcblxuZnVuY3Rpb24gdXRjV2Vla2RheShpKSB7XG4gIHJldHVybiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgLSAoZGF0ZS5nZXRVVENEYXkoKSArIDcgLSBpKSAlIDcpO1xuICAgIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgZGF0ZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpICsgc3RlcCAqIDcpO1xuICB9LCAoc3RhcnQsIGVuZCkgPT4ge1xuICAgIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25XZWVrO1xuICB9KTtcbn1cblxuZXhwb3J0IGNvbnN0IHV0Y1N1bmRheSA9IHV0Y1dlZWtkYXkoMCk7XG5leHBvcnQgY29uc3QgdXRjTW9uZGF5ID0gdXRjV2Vla2RheSgxKTtcbmV4cG9ydCBjb25zdCB1dGNUdWVzZGF5ID0gdXRjV2Vla2RheSgyKTtcbmV4cG9ydCBjb25zdCB1dGNXZWRuZXNkYXkgPSB1dGNXZWVrZGF5KDMpO1xuZXhwb3J0IGNvbnN0IHV0Y1RodXJzZGF5ID0gdXRjV2Vla2RheSg0KTtcbmV4cG9ydCBjb25zdCB1dGNGcmlkYXkgPSB1dGNXZWVrZGF5KDUpO1xuZXhwb3J0IGNvbnN0IHV0Y1NhdHVyZGF5ID0gdXRjV2Vla2RheSg2KTtcblxuZXhwb3J0IGNvbnN0IHV0Y1N1bmRheXMgPSB1dGNTdW5kYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjTW9uZGF5cyA9IHV0Y01vbmRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNUdWVzZGF5cyA9IHV0Y1R1ZXNkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjV2VkbmVzZGF5cyA9IHV0Y1dlZG5lc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNUaHVyc2RheXMgPSB1dGNUaHVyc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNGcmlkYXlzID0gdXRjRnJpZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y1NhdHVyZGF5cyA9IHV0Y1NhdHVyZGF5LnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lTW9udGggPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXREYXRlKDEpO1xuICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRNb250aChkYXRlLmdldE1vbnRoKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQuZ2V0TW9udGgoKSAtIHN0YXJ0LmdldE1vbnRoKCkgKyAoZW5kLmdldEZ1bGxZZWFyKCkgLSBzdGFydC5nZXRGdWxsWWVhcigpKSAqIDEyO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0TW9udGgoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdGltZU1vbnRocyA9IHRpbWVNb250aC5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y01vbnRoID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDRGF0ZSgxKTtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VVRDTW9udGgoZGF0ZS5nZXRVVENNb250aCgpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kLmdldFVUQ01vbnRoKCkgLSBzdGFydC5nZXRVVENNb250aCgpICsgKGVuZC5nZXRVVENGdWxsWWVhcigpIC0gc3RhcnQuZ2V0VVRDRnVsbFllYXIoKSkgKiAxMjtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ01vbnRoKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHV0Y01vbnRocyA9IHV0Y01vbnRoLnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lWWVhciA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldE1vbnRoKDAsIDEpO1xuICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQuZ2V0RnVsbFllYXIoKSAtIHN0YXJ0LmdldEZ1bGxZZWFyKCk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpO1xufSk7XG5cbi8vIEFuIG9wdGltaXplZCBpbXBsZW1lbnRhdGlvbiBmb3IgdGhpcyBzaW1wbGUgY2FzZS5cbnRpbWVZZWFyLmV2ZXJ5ID0gKGspID0+IHtcbiAgcmV0dXJuICFpc0Zpbml0ZShrID0gTWF0aC5mbG9vcihrKSkgfHwgIShrID4gMCkgPyBudWxsIDogdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRGdWxsWWVhcihNYXRoLmZsb29yKGRhdGUuZ2V0RnVsbFllYXIoKSAvIGspICogayk7XG4gICAgZGF0ZS5zZXRNb250aCgwLCAxKTtcbiAgICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpICsgc3RlcCAqIGspO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB0aW1lWWVhcnMgPSB0aW1lWWVhci5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y1llYXIgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENNb250aCgwLCAxKTtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VVRDRnVsbFllYXIoZGF0ZS5nZXRVVENGdWxsWWVhcigpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kLmdldFVUQ0Z1bGxZZWFyKCkgLSBzdGFydC5nZXRVVENGdWxsWWVhcigpO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDRnVsbFllYXIoKTtcbn0pO1xuXG4vLyBBbiBvcHRpbWl6ZWQgaW1wbGVtZW50YXRpb24gZm9yIHRoaXMgc2ltcGxlIGNhc2UuXG51dGNZZWFyLmV2ZXJ5ID0gKGspID0+IHtcbiAgcmV0dXJuICFpc0Zpbml0ZShrID0gTWF0aC5mbG9vcihrKSkgfHwgIShrID4gMCkgPyBudWxsIDogdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRVVENGdWxsWWVhcihNYXRoLmZsb29yKGRhdGUuZ2V0VVRDRnVsbFllYXIoKSAvIGspICogayk7XG4gICAgZGF0ZS5zZXRVVENNb250aCgwLCAxKTtcbiAgICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0VVRDRnVsbFllYXIoZGF0ZS5nZXRVVENGdWxsWWVhcigpICsgc3RlcCAqIGspO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1dGNZZWFycyA9IHV0Y1llYXIucmFuZ2U7XG4iLCJpbXBvcnQge2Jpc2VjdG9yLCB0aWNrU3RlcH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2R1cmF0aW9uRGF5LCBkdXJhdGlvbkhvdXIsIGR1cmF0aW9uTWludXRlLCBkdXJhdGlvbk1vbnRoLCBkdXJhdGlvblNlY29uZCwgZHVyYXRpb25XZWVrLCBkdXJhdGlvblllYXJ9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5pbXBvcnQge21pbGxpc2Vjb25kfSBmcm9tIFwiLi9taWxsaXNlY29uZC5qc1wiO1xuaW1wb3J0IHtzZWNvbmR9IGZyb20gXCIuL3NlY29uZC5qc1wiO1xuaW1wb3J0IHt0aW1lTWludXRlLCB1dGNNaW51dGV9IGZyb20gXCIuL21pbnV0ZS5qc1wiO1xuaW1wb3J0IHt0aW1lSG91ciwgdXRjSG91cn0gZnJvbSBcIi4vaG91ci5qc1wiO1xuaW1wb3J0IHt0aW1lRGF5LCB1bml4RGF5fSBmcm9tIFwiLi9kYXkuanNcIjtcbmltcG9ydCB7dGltZVN1bmRheSwgdXRjU3VuZGF5fSBmcm9tIFwiLi93ZWVrLmpzXCI7XG5pbXBvcnQge3RpbWVNb250aCwgdXRjTW9udGh9IGZyb20gXCIuL21vbnRoLmpzXCI7XG5pbXBvcnQge3RpbWVZZWFyLCB1dGNZZWFyfSBmcm9tIFwiLi95ZWFyLmpzXCI7XG5cbmZ1bmN0aW9uIHRpY2tlcih5ZWFyLCBtb250aCwgd2VlaywgZGF5LCBob3VyLCBtaW51dGUpIHtcblxuICBjb25zdCB0aWNrSW50ZXJ2YWxzID0gW1xuICAgIFtzZWNvbmQsICAxLCAgICAgIGR1cmF0aW9uU2Vjb25kXSxcbiAgICBbc2Vjb25kLCAgNSwgIDUgKiBkdXJhdGlvblNlY29uZF0sXG4gICAgW3NlY29uZCwgMTUsIDE1ICogZHVyYXRpb25TZWNvbmRdLFxuICAgIFtzZWNvbmQsIDMwLCAzMCAqIGR1cmF0aW9uU2Vjb25kXSxcbiAgICBbbWludXRlLCAgMSwgICAgICBkdXJhdGlvbk1pbnV0ZV0sXG4gICAgW21pbnV0ZSwgIDUsICA1ICogZHVyYXRpb25NaW51dGVdLFxuICAgIFttaW51dGUsIDE1LCAxNSAqIGR1cmF0aW9uTWludXRlXSxcbiAgICBbbWludXRlLCAzMCwgMzAgKiBkdXJhdGlvbk1pbnV0ZV0sXG4gICAgWyAgaG91ciwgIDEsICAgICAgZHVyYXRpb25Ib3VyICBdLFxuICAgIFsgIGhvdXIsICAzLCAgMyAqIGR1cmF0aW9uSG91ciAgXSxcbiAgICBbICBob3VyLCAgNiwgIDYgKiBkdXJhdGlvbkhvdXIgIF0sXG4gICAgWyAgaG91ciwgMTIsIDEyICogZHVyYXRpb25Ib3VyICBdLFxuICAgIFsgICBkYXksICAxLCAgICAgIGR1cmF0aW9uRGF5ICAgXSxcbiAgICBbICAgZGF5LCAgMiwgIDIgKiBkdXJhdGlvbkRheSAgIF0sXG4gICAgWyAgd2VlaywgIDEsICAgICAgZHVyYXRpb25XZWVrICBdLFxuICAgIFsgbW9udGgsICAxLCAgICAgIGR1cmF0aW9uTW9udGggXSxcbiAgICBbIG1vbnRoLCAgMywgIDMgKiBkdXJhdGlvbk1vbnRoIF0sXG4gICAgWyAgeWVhciwgIDEsICAgICAgZHVyYXRpb25ZZWFyICBdXG4gIF07XG5cbiAgZnVuY3Rpb24gdGlja3Moc3RhcnQsIHN0b3AsIGNvdW50KSB7XG4gICAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydDtcbiAgICBpZiAocmV2ZXJzZSkgW3N0YXJ0LCBzdG9wXSA9IFtzdG9wLCBzdGFydF07XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBjb3VudCAmJiB0eXBlb2YgY291bnQucmFuZ2UgPT09IFwiZnVuY3Rpb25cIiA/IGNvdW50IDogdGlja0ludGVydmFsKHN0YXJ0LCBzdG9wLCBjb3VudCk7XG4gICAgY29uc3QgdGlja3MgPSBpbnRlcnZhbCA/IGludGVydmFsLnJhbmdlKHN0YXJ0LCArc3RvcCArIDEpIDogW107IC8vIGluY2x1c2l2ZSBzdG9wXG4gICAgcmV0dXJuIHJldmVyc2UgPyB0aWNrcy5yZXZlcnNlKCkgOiB0aWNrcztcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpY2tJbnRlcnZhbChzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBNYXRoLmFicyhzdG9wIC0gc3RhcnQpIC8gY291bnQ7XG4gICAgY29uc3QgaSA9IGJpc2VjdG9yKChbLCwgc3RlcF0pID0+IHN0ZXApLnJpZ2h0KHRpY2tJbnRlcnZhbHMsIHRhcmdldCk7XG4gICAgaWYgKGkgPT09IHRpY2tJbnRlcnZhbHMubGVuZ3RoKSByZXR1cm4geWVhci5ldmVyeSh0aWNrU3RlcChzdGFydCAvIGR1cmF0aW9uWWVhciwgc3RvcCAvIGR1cmF0aW9uWWVhciwgY291bnQpKTtcbiAgICBpZiAoaSA9PT0gMCkgcmV0dXJuIG1pbGxpc2Vjb25kLmV2ZXJ5KE1hdGgubWF4KHRpY2tTdGVwKHN0YXJ0LCBzdG9wLCBjb3VudCksIDEpKTtcbiAgICBjb25zdCBbdCwgc3RlcF0gPSB0aWNrSW50ZXJ2YWxzW3RhcmdldCAvIHRpY2tJbnRlcnZhbHNbaSAtIDFdWzJdIDwgdGlja0ludGVydmFsc1tpXVsyXSAvIHRhcmdldCA/IGkgLSAxIDogaV07XG4gICAgcmV0dXJuIHQuZXZlcnkoc3RlcCk7XG4gIH1cblxuICByZXR1cm4gW3RpY2tzLCB0aWNrSW50ZXJ2YWxdO1xufVxuXG5jb25zdCBbdXRjVGlja3MsIHV0Y1RpY2tJbnRlcnZhbF0gPSB0aWNrZXIodXRjWWVhciwgdXRjTW9udGgsIHV0Y1N1bmRheSwgdW5peERheSwgdXRjSG91ciwgdXRjTWludXRlKTtcbmNvbnN0IFt0aW1lVGlja3MsIHRpbWVUaWNrSW50ZXJ2YWxdID0gdGlja2VyKHRpbWVZZWFyLCB0aW1lTW9udGgsIHRpbWVTdW5kYXksIHRpbWVEYXksIHRpbWVIb3VyLCB0aW1lTWludXRlKTtcblxuZXhwb3J0IHt1dGNUaWNrcywgdXRjVGlja0ludGVydmFsLCB0aW1lVGlja3MsIHRpbWVUaWNrSW50ZXJ2YWx9O1xuIiwiaW1wb3J0IHtcbiAgdGltZURheSxcbiAgdGltZVN1bmRheSxcbiAgdGltZU1vbmRheSxcbiAgdGltZVRodXJzZGF5LFxuICB0aW1lWWVhcixcbiAgdXRjRGF5LFxuICB1dGNTdW5kYXksXG4gIHV0Y01vbmRheSxcbiAgdXRjVGh1cnNkYXksXG4gIHV0Y1llYXJcbn0gZnJvbSBcImQzLXRpbWVcIjtcblxuZnVuY3Rpb24gbG9jYWxEYXRlKGQpIHtcbiAgaWYgKDAgPD0gZC55ICYmIGQueSA8IDEwMCkge1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoLTEsIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpO1xuICAgIGRhdGUuc2V0RnVsbFllYXIoZC55KTtcbiAgICByZXR1cm4gZGF0ZTtcbiAgfVxuICByZXR1cm4gbmV3IERhdGUoZC55LCBkLm0sIGQuZCwgZC5ILCBkLk0sIGQuUywgZC5MKTtcbn1cblxuZnVuY3Rpb24gdXRjRGF0ZShkKSB7XG4gIGlmICgwIDw9IGQueSAmJiBkLnkgPCAxMDApIHtcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKC0xLCBkLm0sIGQuZCwgZC5ILCBkLk0sIGQuUywgZC5MKSk7XG4gICAgZGF0ZS5zZXRVVENGdWxsWWVhcihkLnkpO1xuICAgIHJldHVybiBkYXRlO1xuICB9XG4gIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyhkLnksIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpKTtcbn1cblxuZnVuY3Rpb24gbmV3RGF0ZSh5LCBtLCBkKSB7XG4gIHJldHVybiB7eTogeSwgbTogbSwgZDogZCwgSDogMCwgTTogMCwgUzogMCwgTDogMH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZvcm1hdExvY2FsZShsb2NhbGUpIHtcbiAgdmFyIGxvY2FsZV9kYXRlVGltZSA9IGxvY2FsZS5kYXRlVGltZSxcbiAgICAgIGxvY2FsZV9kYXRlID0gbG9jYWxlLmRhdGUsXG4gICAgICBsb2NhbGVfdGltZSA9IGxvY2FsZS50aW1lLFxuICAgICAgbG9jYWxlX3BlcmlvZHMgPSBsb2NhbGUucGVyaW9kcyxcbiAgICAgIGxvY2FsZV93ZWVrZGF5cyA9IGxvY2FsZS5kYXlzLFxuICAgICAgbG9jYWxlX3Nob3J0V2Vla2RheXMgPSBsb2NhbGUuc2hvcnREYXlzLFxuICAgICAgbG9jYWxlX21vbnRocyA9IGxvY2FsZS5tb250aHMsXG4gICAgICBsb2NhbGVfc2hvcnRNb250aHMgPSBsb2NhbGUuc2hvcnRNb250aHM7XG5cbiAgdmFyIHBlcmlvZFJlID0gZm9ybWF0UmUobG9jYWxlX3BlcmlvZHMpLFxuICAgICAgcGVyaW9kTG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9wZXJpb2RzKSxcbiAgICAgIHdlZWtkYXlSZSA9IGZvcm1hdFJlKGxvY2FsZV93ZWVrZGF5cyksXG4gICAgICB3ZWVrZGF5TG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV93ZWVrZGF5cyksXG4gICAgICBzaG9ydFdlZWtkYXlSZSA9IGZvcm1hdFJlKGxvY2FsZV9zaG9ydFdlZWtkYXlzKSxcbiAgICAgIHNob3J0V2Vla2RheUxvb2t1cCA9IGZvcm1hdExvb2t1cChsb2NhbGVfc2hvcnRXZWVrZGF5cyksXG4gICAgICBtb250aFJlID0gZm9ybWF0UmUobG9jYWxlX21vbnRocyksXG4gICAgICBtb250aExvb2t1cCA9IGZvcm1hdExvb2t1cChsb2NhbGVfbW9udGhzKSxcbiAgICAgIHNob3J0TW9udGhSZSA9IGZvcm1hdFJlKGxvY2FsZV9zaG9ydE1vbnRocyksXG4gICAgICBzaG9ydE1vbnRoTG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9zaG9ydE1vbnRocyk7XG5cbiAgdmFyIGZvcm1hdHMgPSB7XG4gICAgXCJhXCI6IGZvcm1hdFNob3J0V2Vla2RheSxcbiAgICBcIkFcIjogZm9ybWF0V2Vla2RheSxcbiAgICBcImJcIjogZm9ybWF0U2hvcnRNb250aCxcbiAgICBcIkJcIjogZm9ybWF0TW9udGgsXG4gICAgXCJjXCI6IG51bGwsXG4gICAgXCJkXCI6IGZvcm1hdERheU9mTW9udGgsXG4gICAgXCJlXCI6IGZvcm1hdERheU9mTW9udGgsXG4gICAgXCJmXCI6IGZvcm1hdE1pY3Jvc2Vjb25kcyxcbiAgICBcImdcIjogZm9ybWF0WWVhcklTTyxcbiAgICBcIkdcIjogZm9ybWF0RnVsbFllYXJJU08sXG4gICAgXCJIXCI6IGZvcm1hdEhvdXIyNCxcbiAgICBcIklcIjogZm9ybWF0SG91cjEyLFxuICAgIFwialwiOiBmb3JtYXREYXlPZlllYXIsXG4gICAgXCJMXCI6IGZvcm1hdE1pbGxpc2Vjb25kcyxcbiAgICBcIm1cIjogZm9ybWF0TW9udGhOdW1iZXIsXG4gICAgXCJNXCI6IGZvcm1hdE1pbnV0ZXMsXG4gICAgXCJwXCI6IGZvcm1hdFBlcmlvZCxcbiAgICBcInFcIjogZm9ybWF0UXVhcnRlcixcbiAgICBcIlFcIjogZm9ybWF0VW5peFRpbWVzdGFtcCxcbiAgICBcInNcIjogZm9ybWF0VW5peFRpbWVzdGFtcFNlY29uZHMsXG4gICAgXCJTXCI6IGZvcm1hdFNlY29uZHMsXG4gICAgXCJ1XCI6IGZvcm1hdFdlZWtkYXlOdW1iZXJNb25kYXksXG4gICAgXCJVXCI6IGZvcm1hdFdlZWtOdW1iZXJTdW5kYXksXG4gICAgXCJWXCI6IGZvcm1hdFdlZWtOdW1iZXJJU08sXG4gICAgXCJ3XCI6IGZvcm1hdFdlZWtkYXlOdW1iZXJTdW5kYXksXG4gICAgXCJXXCI6IGZvcm1hdFdlZWtOdW1iZXJNb25kYXksXG4gICAgXCJ4XCI6IG51bGwsXG4gICAgXCJYXCI6IG51bGwsXG4gICAgXCJ5XCI6IGZvcm1hdFllYXIsXG4gICAgXCJZXCI6IGZvcm1hdEZ1bGxZZWFyLFxuICAgIFwiWlwiOiBmb3JtYXRab25lLFxuICAgIFwiJVwiOiBmb3JtYXRMaXRlcmFsUGVyY2VudFxuICB9O1xuXG4gIHZhciB1dGNGb3JtYXRzID0ge1xuICAgIFwiYVwiOiBmb3JtYXRVVENTaG9ydFdlZWtkYXksXG4gICAgXCJBXCI6IGZvcm1hdFVUQ1dlZWtkYXksXG4gICAgXCJiXCI6IGZvcm1hdFVUQ1Nob3J0TW9udGgsXG4gICAgXCJCXCI6IGZvcm1hdFVUQ01vbnRoLFxuICAgIFwiY1wiOiBudWxsLFxuICAgIFwiZFwiOiBmb3JtYXRVVENEYXlPZk1vbnRoLFxuICAgIFwiZVwiOiBmb3JtYXRVVENEYXlPZk1vbnRoLFxuICAgIFwiZlwiOiBmb3JtYXRVVENNaWNyb3NlY29uZHMsXG4gICAgXCJnXCI6IGZvcm1hdFVUQ1llYXJJU08sXG4gICAgXCJHXCI6IGZvcm1hdFVUQ0Z1bGxZZWFySVNPLFxuICAgIFwiSFwiOiBmb3JtYXRVVENIb3VyMjQsXG4gICAgXCJJXCI6IGZvcm1hdFVUQ0hvdXIxMixcbiAgICBcImpcIjogZm9ybWF0VVRDRGF5T2ZZZWFyLFxuICAgIFwiTFwiOiBmb3JtYXRVVENNaWxsaXNlY29uZHMsXG4gICAgXCJtXCI6IGZvcm1hdFVUQ01vbnRoTnVtYmVyLFxuICAgIFwiTVwiOiBmb3JtYXRVVENNaW51dGVzLFxuICAgIFwicFwiOiBmb3JtYXRVVENQZXJpb2QsXG4gICAgXCJxXCI6IGZvcm1hdFVUQ1F1YXJ0ZXIsXG4gICAgXCJRXCI6IGZvcm1hdFVuaXhUaW1lc3RhbXAsXG4gICAgXCJzXCI6IGZvcm1hdFVuaXhUaW1lc3RhbXBTZWNvbmRzLFxuICAgIFwiU1wiOiBmb3JtYXRVVENTZWNvbmRzLFxuICAgIFwidVwiOiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyTW9uZGF5LFxuICAgIFwiVVwiOiBmb3JtYXRVVENXZWVrTnVtYmVyU3VuZGF5LFxuICAgIFwiVlwiOiBmb3JtYXRVVENXZWVrTnVtYmVySVNPLFxuICAgIFwid1wiOiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyU3VuZGF5LFxuICAgIFwiV1wiOiBmb3JtYXRVVENXZWVrTnVtYmVyTW9uZGF5LFxuICAgIFwieFwiOiBudWxsLFxuICAgIFwiWFwiOiBudWxsLFxuICAgIFwieVwiOiBmb3JtYXRVVENZZWFyLFxuICAgIFwiWVwiOiBmb3JtYXRVVENGdWxsWWVhcixcbiAgICBcIlpcIjogZm9ybWF0VVRDWm9uZSxcbiAgICBcIiVcIjogZm9ybWF0TGl0ZXJhbFBlcmNlbnRcbiAgfTtcblxuICB2YXIgcGFyc2VzID0ge1xuICAgIFwiYVwiOiBwYXJzZVNob3J0V2Vla2RheSxcbiAgICBcIkFcIjogcGFyc2VXZWVrZGF5LFxuICAgIFwiYlwiOiBwYXJzZVNob3J0TW9udGgsXG4gICAgXCJCXCI6IHBhcnNlTW9udGgsXG4gICAgXCJjXCI6IHBhcnNlTG9jYWxlRGF0ZVRpbWUsXG4gICAgXCJkXCI6IHBhcnNlRGF5T2ZNb250aCxcbiAgICBcImVcIjogcGFyc2VEYXlPZk1vbnRoLFxuICAgIFwiZlwiOiBwYXJzZU1pY3Jvc2Vjb25kcyxcbiAgICBcImdcIjogcGFyc2VZZWFyLFxuICAgIFwiR1wiOiBwYXJzZUZ1bGxZZWFyLFxuICAgIFwiSFwiOiBwYXJzZUhvdXIyNCxcbiAgICBcIklcIjogcGFyc2VIb3VyMjQsXG4gICAgXCJqXCI6IHBhcnNlRGF5T2ZZZWFyLFxuICAgIFwiTFwiOiBwYXJzZU1pbGxpc2Vjb25kcyxcbiAgICBcIm1cIjogcGFyc2VNb250aE51bWJlcixcbiAgICBcIk1cIjogcGFyc2VNaW51dGVzLFxuICAgIFwicFwiOiBwYXJzZVBlcmlvZCxcbiAgICBcInFcIjogcGFyc2VRdWFydGVyLFxuICAgIFwiUVwiOiBwYXJzZVVuaXhUaW1lc3RhbXAsXG4gICAgXCJzXCI6IHBhcnNlVW5peFRpbWVzdGFtcFNlY29uZHMsXG4gICAgXCJTXCI6IHBhcnNlU2Vjb25kcyxcbiAgICBcInVcIjogcGFyc2VXZWVrZGF5TnVtYmVyTW9uZGF5LFxuICAgIFwiVVwiOiBwYXJzZVdlZWtOdW1iZXJTdW5kYXksXG4gICAgXCJWXCI6IHBhcnNlV2Vla051bWJlcklTTyxcbiAgICBcIndcIjogcGFyc2VXZWVrZGF5TnVtYmVyU3VuZGF5LFxuICAgIFwiV1wiOiBwYXJzZVdlZWtOdW1iZXJNb25kYXksXG4gICAgXCJ4XCI6IHBhcnNlTG9jYWxlRGF0ZSxcbiAgICBcIlhcIjogcGFyc2VMb2NhbGVUaW1lLFxuICAgIFwieVwiOiBwYXJzZVllYXIsXG4gICAgXCJZXCI6IHBhcnNlRnVsbFllYXIsXG4gICAgXCJaXCI6IHBhcnNlWm9uZSxcbiAgICBcIiVcIjogcGFyc2VMaXRlcmFsUGVyY2VudFxuICB9O1xuXG4gIC8vIFRoZXNlIHJlY3Vyc2l2ZSBkaXJlY3RpdmUgZGVmaW5pdGlvbnMgbXVzdCBiZSBkZWZlcnJlZC5cbiAgZm9ybWF0cy54ID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlLCBmb3JtYXRzKTtcbiAgZm9ybWF0cy5YID0gbmV3Rm9ybWF0KGxvY2FsZV90aW1lLCBmb3JtYXRzKTtcbiAgZm9ybWF0cy5jID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlVGltZSwgZm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMueCA9IG5ld0Zvcm1hdChsb2NhbGVfZGF0ZSwgdXRjRm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMuWCA9IG5ld0Zvcm1hdChsb2NhbGVfdGltZSwgdXRjRm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMuYyA9IG5ld0Zvcm1hdChsb2NhbGVfZGF0ZVRpbWUsIHV0Y0Zvcm1hdHMpO1xuXG4gIGZ1bmN0aW9uIG5ld0Zvcm1hdChzcGVjaWZpZXIsIGZvcm1hdHMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgdmFyIHN0cmluZyA9IFtdLFxuICAgICAgICAgIGkgPSAtMSxcbiAgICAgICAgICBqID0gMCxcbiAgICAgICAgICBuID0gc3BlY2lmaWVyLmxlbmd0aCxcbiAgICAgICAgICBjLFxuICAgICAgICAgIHBhZCxcbiAgICAgICAgICBmb3JtYXQ7XG5cbiAgICAgIGlmICghKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkgZGF0ZSA9IG5ldyBEYXRlKCtkYXRlKTtcblxuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgaWYgKHNwZWNpZmllci5jaGFyQ29kZUF0KGkpID09PSAzNykge1xuICAgICAgICAgIHN0cmluZy5wdXNoKHNwZWNpZmllci5zbGljZShqLCBpKSk7XG4gICAgICAgICAgaWYgKChwYWQgPSBwYWRzW2MgPSBzcGVjaWZpZXIuY2hhckF0KCsraSldKSAhPSBudWxsKSBjID0gc3BlY2lmaWVyLmNoYXJBdCgrK2kpO1xuICAgICAgICAgIGVsc2UgcGFkID0gYyA9PT0gXCJlXCIgPyBcIiBcIiA6IFwiMFwiO1xuICAgICAgICAgIGlmIChmb3JtYXQgPSBmb3JtYXRzW2NdKSBjID0gZm9ybWF0KGRhdGUsIHBhZCk7XG4gICAgICAgICAgc3RyaW5nLnB1c2goYyk7XG4gICAgICAgICAgaiA9IGkgKyAxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN0cmluZy5wdXNoKHNwZWNpZmllci5zbGljZShqLCBpKSk7XG4gICAgICByZXR1cm4gc3RyaW5nLmpvaW4oXCJcIik7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld1BhcnNlKHNwZWNpZmllciwgWikge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIHZhciBkID0gbmV3RGF0ZSgxOTAwLCB1bmRlZmluZWQsIDEpLFxuICAgICAgICAgIGkgPSBwYXJzZVNwZWNpZmllcihkLCBzcGVjaWZpZXIsIHN0cmluZyArPSBcIlwiLCAwKSxcbiAgICAgICAgICB3ZWVrLCBkYXk7XG4gICAgICBpZiAoaSAhPSBzdHJpbmcubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuICAgICAgLy8gSWYgYSBVTklYIHRpbWVzdGFtcCBpcyBzcGVjaWZpZWQsIHJldHVybiBpdC5cbiAgICAgIGlmIChcIlFcIiBpbiBkKSByZXR1cm4gbmV3IERhdGUoZC5RKTtcbiAgICAgIGlmIChcInNcIiBpbiBkKSByZXR1cm4gbmV3IERhdGUoZC5zICogMTAwMCArIChcIkxcIiBpbiBkID8gZC5MIDogMCkpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlzIHV0Y1BhcnNlLCBuZXZlciB1c2UgdGhlIGxvY2FsIHRpbWV6b25lLlxuICAgICAgaWYgKFogJiYgIShcIlpcIiBpbiBkKSkgZC5aID0gMDtcblxuICAgICAgLy8gVGhlIGFtLXBtIGZsYWcgaXMgMCBmb3IgQU0sIGFuZCAxIGZvciBQTS5cbiAgICAgIGlmIChcInBcIiBpbiBkKSBkLkggPSBkLkggJSAxMiArIGQucCAqIDEyO1xuXG4gICAgICAvLyBJZiB0aGUgbW9udGggd2FzIG5vdCBzcGVjaWZpZWQsIGluaGVyaXQgZnJvbSB0aGUgcXVhcnRlci5cbiAgICAgIGlmIChkLm0gPT09IHVuZGVmaW5lZCkgZC5tID0gXCJxXCIgaW4gZCA/IGQucSA6IDA7XG5cbiAgICAgIC8vIENvbnZlcnQgZGF5LW9mLXdlZWsgYW5kIHdlZWstb2YteWVhciB0byBkYXktb2YteWVhci5cbiAgICAgIGlmIChcIlZcIiBpbiBkKSB7XG4gICAgICAgIGlmIChkLlYgPCAxIHx8IGQuViA+IDUzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKCEoXCJ3XCIgaW4gZCkpIGQudyA9IDE7XG4gICAgICAgIGlmIChcIlpcIiBpbiBkKSB7XG4gICAgICAgICAgd2VlayA9IHV0Y0RhdGUobmV3RGF0ZShkLnksIDAsIDEpKSwgZGF5ID0gd2Vlay5nZXRVVENEYXkoKTtcbiAgICAgICAgICB3ZWVrID0gZGF5ID4gNCB8fCBkYXkgPT09IDAgPyB1dGNNb25kYXkuY2VpbCh3ZWVrKSA6IHV0Y01vbmRheSh3ZWVrKTtcbiAgICAgICAgICB3ZWVrID0gdXRjRGF5Lm9mZnNldCh3ZWVrLCAoZC5WIC0gMSkgKiA3KTtcbiAgICAgICAgICBkLnkgPSB3ZWVrLmdldFVUQ0Z1bGxZZWFyKCk7XG4gICAgICAgICAgZC5tID0gd2Vlay5nZXRVVENNb250aCgpO1xuICAgICAgICAgIGQuZCA9IHdlZWsuZ2V0VVRDRGF0ZSgpICsgKGQudyArIDYpICUgNztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3ZWVrID0gbG9jYWxEYXRlKG5ld0RhdGUoZC55LCAwLCAxKSksIGRheSA9IHdlZWsuZ2V0RGF5KCk7XG4gICAgICAgICAgd2VlayA9IGRheSA+IDQgfHwgZGF5ID09PSAwID8gdGltZU1vbmRheS5jZWlsKHdlZWspIDogdGltZU1vbmRheSh3ZWVrKTtcbiAgICAgICAgICB3ZWVrID0gdGltZURheS5vZmZzZXQod2VlaywgKGQuViAtIDEpICogNyk7XG4gICAgICAgICAgZC55ID0gd2Vlay5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgIGQubSA9IHdlZWsuZ2V0TW9udGgoKTtcbiAgICAgICAgICBkLmQgPSB3ZWVrLmdldERhdGUoKSArIChkLncgKyA2KSAlIDc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXCJXXCIgaW4gZCB8fCBcIlVcIiBpbiBkKSB7XG4gICAgICAgIGlmICghKFwid1wiIGluIGQpKSBkLncgPSBcInVcIiBpbiBkID8gZC51ICUgNyA6IFwiV1wiIGluIGQgPyAxIDogMDtcbiAgICAgICAgZGF5ID0gXCJaXCIgaW4gZCA/IHV0Y0RhdGUobmV3RGF0ZShkLnksIDAsIDEpKS5nZXRVVENEYXkoKSA6IGxvY2FsRGF0ZShuZXdEYXRlKGQueSwgMCwgMSkpLmdldERheSgpO1xuICAgICAgICBkLm0gPSAwO1xuICAgICAgICBkLmQgPSBcIldcIiBpbiBkID8gKGQudyArIDYpICUgNyArIGQuVyAqIDcgLSAoZGF5ICsgNSkgJSA3IDogZC53ICsgZC5VICogNyAtIChkYXkgKyA2KSAlIDc7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGEgdGltZSB6b25lIGlzIHNwZWNpZmllZCwgYWxsIGZpZWxkcyBhcmUgaW50ZXJwcmV0ZWQgYXMgVVRDIGFuZCB0aGVuXG4gICAgICAvLyBvZmZzZXQgYWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpZWQgdGltZSB6b25lLlxuICAgICAgaWYgKFwiWlwiIGluIGQpIHtcbiAgICAgICAgZC5IICs9IGQuWiAvIDEwMCB8IDA7XG4gICAgICAgIGQuTSArPSBkLlogJSAxMDA7XG4gICAgICAgIHJldHVybiB1dGNEYXRlKGQpO1xuICAgICAgfVxuXG4gICAgICAvLyBPdGhlcndpc2UsIGFsbCBmaWVsZHMgYXJlIGluIGxvY2FsIHRpbWUuXG4gICAgICByZXR1cm4gbG9jYWxEYXRlKGQpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVNwZWNpZmllcihkLCBzcGVjaWZpZXIsIHN0cmluZywgaikge1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgbiA9IHNwZWNpZmllci5sZW5ndGgsXG4gICAgICAgIG0gPSBzdHJpbmcubGVuZ3RoLFxuICAgICAgICBjLFxuICAgICAgICBwYXJzZTtcblxuICAgIHdoaWxlIChpIDwgbikge1xuICAgICAgaWYgKGogPj0gbSkgcmV0dXJuIC0xO1xuICAgICAgYyA9IHNwZWNpZmllci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICBpZiAoYyA9PT0gMzcpIHtcbiAgICAgICAgYyA9IHNwZWNpZmllci5jaGFyQXQoaSsrKTtcbiAgICAgICAgcGFyc2UgPSBwYXJzZXNbYyBpbiBwYWRzID8gc3BlY2lmaWVyLmNoYXJBdChpKyspIDogY107XG4gICAgICAgIGlmICghcGFyc2UgfHwgKChqID0gcGFyc2UoZCwgc3RyaW5nLCBqKSkgPCAwKSkgcmV0dXJuIC0xO1xuICAgICAgfSBlbHNlIGlmIChjICE9IHN0cmluZy5jaGFyQ29kZUF0KGorKykpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBqO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VQZXJpb2QoZCwgc3RyaW5nLCBpKSB7XG4gICAgdmFyIG4gPSBwZXJpb2RSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC5wID0gcGVyaW9kTG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVNob3J0V2Vla2RheShkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IHNob3J0V2Vla2RheVJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLncgPSBzaG9ydFdlZWtkYXlMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlV2Vla2RheShkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IHdlZWtkYXlSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC53ID0gd2Vla2RheUxvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VTaG9ydE1vbnRoKGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gc2hvcnRNb250aFJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLm0gPSBzaG9ydE1vbnRoTG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZU1vbnRoKGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gbW9udGhSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC5tID0gbW9udGhMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTG9jYWxlRGF0ZVRpbWUoZCwgc3RyaW5nLCBpKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BlY2lmaWVyKGQsIGxvY2FsZV9kYXRlVGltZSwgc3RyaW5nLCBpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTG9jYWxlRGF0ZShkLCBzdHJpbmcsIGkpIHtcbiAgICByZXR1cm4gcGFyc2VTcGVjaWZpZXIoZCwgbG9jYWxlX2RhdGUsIHN0cmluZywgaSk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUxvY2FsZVRpbWUoZCwgc3RyaW5nLCBpKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BlY2lmaWVyKGQsIGxvY2FsZV90aW1lLCBzdHJpbmcsIGkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0U2hvcnRXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3Nob3J0V2Vla2RheXNbZC5nZXREYXkoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3dlZWtkYXlzW2QuZ2V0RGF5KCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0U2hvcnRNb250aChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9zaG9ydE1vbnRoc1tkLmdldE1vbnRoKCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0TW9udGgoZCkge1xuICAgIHJldHVybiBsb2NhbGVfbW9udGhzW2QuZ2V0TW9udGgoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRQZXJpb2QoZCkge1xuICAgIHJldHVybiBsb2NhbGVfcGVyaW9kc1srKGQuZ2V0SG91cnMoKSA+PSAxMildO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0UXVhcnRlcihkKSB7XG4gICAgcmV0dXJuIDEgKyB+fihkLmdldE1vbnRoKCkgLyAzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1Nob3J0V2Vla2RheShkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9zaG9ydFdlZWtkYXlzW2QuZ2V0VVRDRGF5KCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDV2Vla2RheShkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV93ZWVrZGF5c1tkLmdldFVUQ0RheSgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1Nob3J0TW9udGgoZCkge1xuICAgIHJldHVybiBsb2NhbGVfc2hvcnRNb250aHNbZC5nZXRVVENNb250aCgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ01vbnRoKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX21vbnRoc1tkLmdldFVUQ01vbnRoKCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDUGVyaW9kKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3BlcmlvZHNbKyhkLmdldFVUQ0hvdXJzKCkgPj0gMTIpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1F1YXJ0ZXIoZCkge1xuICAgIHJldHVybiAxICsgfn4oZC5nZXRVVENNb250aCgpIC8gMyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGZvcm1hdDogZnVuY3Rpb24oc3BlY2lmaWVyKSB7XG4gICAgICB2YXIgZiA9IG5ld0Zvcm1hdChzcGVjaWZpZXIgKz0gXCJcIiwgZm9ybWF0cyk7XG4gICAgICBmLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBzcGVjaWZpZXI7IH07XG4gICAgICByZXR1cm4gZjtcbiAgICB9LFxuICAgIHBhcnNlOiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBwID0gbmV3UGFyc2Uoc3BlY2lmaWVyICs9IFwiXCIsIGZhbHNlKTtcbiAgICAgIHAudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBwO1xuICAgIH0sXG4gICAgdXRjRm9ybWF0OiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBmID0gbmV3Rm9ybWF0KHNwZWNpZmllciArPSBcIlwiLCB1dGNGb3JtYXRzKTtcbiAgICAgIGYudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBmO1xuICAgIH0sXG4gICAgdXRjUGFyc2U6IGZ1bmN0aW9uKHNwZWNpZmllcikge1xuICAgICAgdmFyIHAgPSBuZXdQYXJzZShzcGVjaWZpZXIgKz0gXCJcIiwgdHJ1ZSk7XG4gICAgICBwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBzcGVjaWZpZXI7IH07XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gIH07XG59XG5cbnZhciBwYWRzID0ge1wiLVwiOiBcIlwiLCBcIl9cIjogXCIgXCIsIFwiMFwiOiBcIjBcIn0sXG4gICAgbnVtYmVyUmUgPSAvXlxccypcXGQrLywgLy8gbm90ZTogaWdub3JlcyBuZXh0IGRpcmVjdGl2ZVxuICAgIHBlcmNlbnRSZSA9IC9eJS8sXG4gICAgcmVxdW90ZVJlID0gL1tcXFxcXiQqKz98W1xcXSgpLnt9XS9nO1xuXG5mdW5jdGlvbiBwYWQodmFsdWUsIGZpbGwsIHdpZHRoKSB7XG4gIHZhciBzaWduID0gdmFsdWUgPCAwID8gXCItXCIgOiBcIlwiLFxuICAgICAgc3RyaW5nID0gKHNpZ24gPyAtdmFsdWUgOiB2YWx1ZSkgKyBcIlwiLFxuICAgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcbiAgcmV0dXJuIHNpZ24gKyAobGVuZ3RoIDwgd2lkdGggPyBuZXcgQXJyYXkod2lkdGggLSBsZW5ndGggKyAxKS5qb2luKGZpbGwpICsgc3RyaW5nIDogc3RyaW5nKTtcbn1cblxuZnVuY3Rpb24gcmVxdW90ZShzKSB7XG4gIHJldHVybiBzLnJlcGxhY2UocmVxdW90ZVJlLCBcIlxcXFwkJlwiKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0UmUobmFtZXMpIHtcbiAgcmV0dXJuIG5ldyBSZWdFeHAoXCJeKD86XCIgKyBuYW1lcy5tYXAocmVxdW90ZSkuam9pbihcInxcIikgKyBcIilcIiwgXCJpXCIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRMb29rdXAobmFtZXMpIHtcbiAgcmV0dXJuIG5ldyBNYXAobmFtZXMubWFwKChuYW1lLCBpKSA9PiBbbmFtZS50b0xvd2VyQ2FzZSgpLCBpXSkpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtkYXlOdW1iZXJTdW5kYXkoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyAoZC53ID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrZGF5TnVtYmVyTW9uZGF5KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAxKSk7XG4gIHJldHVybiBuID8gKGQudSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2Vla051bWJlclN1bmRheShkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLlUgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtOdW1iZXJJU08oZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5WID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrTnVtYmVyTW9uZGF5KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuVyA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRnVsbFllYXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDQpKTtcbiAgcmV0dXJuIG4gPyAoZC55ID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VZZWFyKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQueSA9ICtuWzBdICsgKCtuWzBdID4gNjggPyAxOTAwIDogMjAwMCksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2Vab25lKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IC9eKFopfChbKy1dXFxkXFxkKSg/Ojo/KFxcZFxcZCkpPy8uZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDYpKTtcbiAgcmV0dXJuIG4gPyAoZC5aID0gblsxXSA/IDAgOiAtKG5bMl0gKyAoblszXSB8fCBcIjAwXCIpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVF1YXJ0ZXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyAoZC5xID0gblswXSAqIDMgLSAzLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTW9udGhOdW1iZXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5tID0gblswXSAtIDEsIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VEYXlPZk1vbnRoKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuZCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF5T2ZZZWFyKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAzKSk7XG4gIHJldHVybiBuID8gKGQubSA9IDAsIGQuZCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlSG91cjI0KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuSCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTWludXRlcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLk0gPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVNlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5TID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNaWxsaXNlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDMpKTtcbiAgcmV0dXJuIG4gPyAoZC5MID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNaWNyb3NlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDYpKTtcbiAgcmV0dXJuIG4gPyAoZC5MID0gTWF0aC5mbG9vcihuWzBdIC8gMTAwMCksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VMaXRlcmFsUGVyY2VudChkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBwZXJjZW50UmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyBpICsgblswXS5sZW5ndGggOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VVbml4VGltZXN0YW1wKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgcmV0dXJuIG4gPyAoZC5RID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VVbml4VGltZXN0YW1wU2Vjb25kcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gIHJldHVybiBuID8gKGQucyA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERheU9mTW9udGgoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0RGF0ZSgpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0SG91cjI0KGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldEhvdXJzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRIb3VyMTIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0SG91cnMoKSAlIDEyIHx8IDEyLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF5T2ZZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZCgxICsgdGltZURheS5jb3VudCh0aW1lWWVhcihkKSwgZCksIHAsIDMpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaWxsaXNlY29uZHMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0TWlsbGlzZWNvbmRzKCksIHAsIDMpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaWNyb3NlY29uZHMoZCwgcCkge1xuICByZXR1cm4gZm9ybWF0TWlsbGlzZWNvbmRzKGQsIHApICsgXCIwMDBcIjtcbn1cblxuZnVuY3Rpb24gZm9ybWF0TW9udGhOdW1iZXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0TW9udGgoKSArIDEsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaW51dGVzKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldE1pbnV0ZXMoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFNlY29uZHMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0U2Vjb25kcygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla2RheU51bWJlck1vbmRheShkKSB7XG4gIHZhciBkYXkgPSBkLmdldERheSgpO1xuICByZXR1cm4gZGF5ID09PSAwID8gNyA6IGRheTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla051bWJlclN1bmRheShkLCBwKSB7XG4gIHJldHVybiBwYWQodGltZVN1bmRheS5jb3VudCh0aW1lWWVhcihkKSAtIDEsIGQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZElTTyhkKSB7XG4gIHZhciBkYXkgPSBkLmdldERheSgpO1xuICByZXR1cm4gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB0aW1lVGh1cnNkYXkoZCkgOiB0aW1lVGh1cnNkYXkuY2VpbChkKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla051bWJlcklTTyhkLCBwKSB7XG4gIGQgPSBkSVNPKGQpO1xuICByZXR1cm4gcGFkKHRpbWVUaHVyc2RheS5jb3VudCh0aW1lWWVhcihkKSwgZCkgKyAodGltZVllYXIoZCkuZ2V0RGF5KCkgPT09IDQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla2RheU51bWJlclN1bmRheShkKSB7XG4gIHJldHVybiBkLmdldERheSgpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrTnVtYmVyTW9uZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh0aW1lTW9uZGF5LmNvdW50KHRpbWVZZWFyKGQpIC0gMSwgZCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldEZ1bGxZZWFyKCkgJSAxMDAsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRZZWFySVNPKGQsIHApIHtcbiAgZCA9IGRJU08oZCk7XG4gIHJldHVybiBwYWQoZC5nZXRGdWxsWWVhcigpICUgMTAwLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RnVsbFllYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0RnVsbFllYXIoKSAlIDEwMDAwLCBwLCA0KTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RnVsbFllYXJJU08oZCwgcCkge1xuICB2YXIgZGF5ID0gZC5nZXREYXkoKTtcbiAgZCA9IChkYXkgPj0gNCB8fCBkYXkgPT09IDApID8gdGltZVRodXJzZGF5KGQpIDogdGltZVRodXJzZGF5LmNlaWwoZCk7XG4gIHJldHVybiBwYWQoZC5nZXRGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRab25lKGQpIHtcbiAgdmFyIHogPSBkLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIHJldHVybiAoeiA+IDAgPyBcIi1cIiA6ICh6ICo9IC0xLCBcIitcIikpXG4gICAgICArIHBhZCh6IC8gNjAgfCAwLCBcIjBcIiwgMilcbiAgICAgICsgcGFkKHogJSA2MCwgXCIwXCIsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENEYXlPZk1vbnRoKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0RhdGUoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0hvdXIyNChkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENIb3VycygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDSG91cjEyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0hvdXJzKCkgJSAxMiB8fCAxMiwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0RheU9mWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoMSArIHV0Y0RheS5jb3VudCh1dGNZZWFyKGQpLCBkKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pbGxpc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENNaWxsaXNlY29uZHMoKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pY3Jvc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBmb3JtYXRVVENNaWxsaXNlY29uZHMoZCwgcCkgKyBcIjAwMFwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENNb250aE51bWJlcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENNb250aCgpICsgMSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pbnV0ZXMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDTWludXRlcygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDU2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENTZWNvbmRzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyTW9uZGF5KGQpIHtcbiAgdmFyIGRvdyA9IGQuZ2V0VVRDRGF5KCk7XG4gIHJldHVybiBkb3cgPT09IDAgPyA3IDogZG93O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrTnVtYmVyU3VuZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh1dGNTdW5kYXkuY291bnQodXRjWWVhcihkKSAtIDEsIGQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gVVRDZElTTyhkKSB7XG4gIHZhciBkYXkgPSBkLmdldFVUQ0RheSgpO1xuICByZXR1cm4gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB1dGNUaHVyc2RheShkKSA6IHV0Y1RodXJzZGF5LmNlaWwoZCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtOdW1iZXJJU08oZCwgcCkge1xuICBkID0gVVRDZElTTyhkKTtcbiAgcmV0dXJuIHBhZCh1dGNUaHVyc2RheS5jb3VudCh1dGNZZWFyKGQpLCBkKSArICh1dGNZZWFyKGQpLmdldFVUQ0RheSgpID09PSA0KSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJTdW5kYXkoZCkge1xuICByZXR1cm4gZC5nZXRVVENEYXkoKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDV2Vla051bWJlck1vbmRheShkLCBwKSB7XG4gIHJldHVybiBwYWQodXRjTW9uZGF5LmNvdW50KHV0Y1llYXIoZCkgLSAxLCBkKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1llYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDRnVsbFllYXIoKSAlIDEwMCwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1llYXJJU08oZCwgcCkge1xuICBkID0gVVRDZElTTyhkKTtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0Z1bGxZZWFyKCkgJSAxMDAsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENGdWxsWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENGdWxsWWVhcklTTyhkLCBwKSB7XG4gIHZhciBkYXkgPSBkLmdldFVUQ0RheSgpO1xuICBkID0gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB1dGNUaHVyc2RheShkKSA6IHV0Y1RodXJzZGF5LmNlaWwoZCk7XG4gIHJldHVybiBwYWQoZC5nZXRVVENGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENab25lKCkge1xuICByZXR1cm4gXCIrMDAwMFwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRMaXRlcmFsUGVyY2VudCgpIHtcbiAgcmV0dXJuIFwiJVwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVbml4VGltZXN0YW1wKGQpIHtcbiAgcmV0dXJuICtkO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVbml4VGltZXN0YW1wU2Vjb25kcyhkKSB7XG4gIHJldHVybiBNYXRoLmZsb29yKCtkIC8gMTAwMCk7XG59XG4iLCJpbXBvcnQgZm9ybWF0TG9jYWxlIGZyb20gXCIuL2xvY2FsZS5qc1wiO1xuXG52YXIgbG9jYWxlO1xuZXhwb3J0IHZhciB0aW1lRm9ybWF0O1xuZXhwb3J0IHZhciB0aW1lUGFyc2U7XG5leHBvcnQgdmFyIHV0Y0Zvcm1hdDtcbmV4cG9ydCB2YXIgdXRjUGFyc2U7XG5cbmRlZmF1bHRMb2NhbGUoe1xuICBkYXRlVGltZTogXCIleCwgJVhcIixcbiAgZGF0ZTogXCIlLW0vJS1kLyVZXCIsXG4gIHRpbWU6IFwiJS1JOiVNOiVTICVwXCIsXG4gIHBlcmlvZHM6IFtcIkFNXCIsIFwiUE1cIl0sXG4gIGRheXM6IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdLFxuICBzaG9ydERheXM6IFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXSxcbiAgbW9udGhzOiBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXSxcbiAgc2hvcnRNb250aHM6IFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlZmF1bHRMb2NhbGUoZGVmaW5pdGlvbikge1xuICBsb2NhbGUgPSBmb3JtYXRMb2NhbGUoZGVmaW5pdGlvbik7XG4gIHRpbWVGb3JtYXQgPSBsb2NhbGUuZm9ybWF0O1xuICB0aW1lUGFyc2UgPSBsb2NhbGUucGFyc2U7XG4gIHV0Y0Zvcm1hdCA9IGxvY2FsZS51dGNGb3JtYXQ7XG4gIHV0Y1BhcnNlID0gbG9jYWxlLnV0Y1BhcnNlO1xuICByZXR1cm4gbG9jYWxlO1xufVxuIiwiaW1wb3J0IHt0aW1lWWVhciwgdGltZU1vbnRoLCB0aW1lV2VlaywgdGltZURheSwgdGltZUhvdXIsIHRpbWVNaW51dGUsIHRpbWVTZWNvbmQsIHRpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbH0gZnJvbSBcImQzLXRpbWVcIjtcbmltcG9ydCB7dGltZUZvcm1hdH0gZnJvbSBcImQzLXRpbWUtZm9ybWF0XCI7XG5pbXBvcnQgY29udGludW91cywge2NvcHl9IGZyb20gXCIuL2NvbnRpbnVvdXMuanNcIjtcbmltcG9ydCB7aW5pdFJhbmdlfSBmcm9tIFwiLi9pbml0LmpzXCI7XG5pbXBvcnQgbmljZSBmcm9tIFwiLi9uaWNlLmpzXCI7XG5cbmZ1bmN0aW9uIGRhdGUodCkge1xuICByZXR1cm4gbmV3IERhdGUodCk7XG59XG5cbmZ1bmN0aW9uIG51bWJlcih0KSB7XG4gIHJldHVybiB0IGluc3RhbmNlb2YgRGF0ZSA/ICt0IDogK25ldyBEYXRlKCt0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGVuZGFyKHRpY2tzLCB0aWNrSW50ZXJ2YWwsIHllYXIsIG1vbnRoLCB3ZWVrLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmb3JtYXQpIHtcbiAgdmFyIHNjYWxlID0gY29udGludW91cygpLFxuICAgICAgaW52ZXJ0ID0gc2NhbGUuaW52ZXJ0LFxuICAgICAgZG9tYWluID0gc2NhbGUuZG9tYWluO1xuXG4gIHZhciBmb3JtYXRNaWxsaXNlY29uZCA9IGZvcm1hdChcIi4lTFwiKSxcbiAgICAgIGZvcm1hdFNlY29uZCA9IGZvcm1hdChcIjolU1wiKSxcbiAgICAgIGZvcm1hdE1pbnV0ZSA9IGZvcm1hdChcIiVJOiVNXCIpLFxuICAgICAgZm9ybWF0SG91ciA9IGZvcm1hdChcIiVJICVwXCIpLFxuICAgICAgZm9ybWF0RGF5ID0gZm9ybWF0KFwiJWEgJWRcIiksXG4gICAgICBmb3JtYXRXZWVrID0gZm9ybWF0KFwiJWIgJWRcIiksXG4gICAgICBmb3JtYXRNb250aCA9IGZvcm1hdChcIiVCXCIpLFxuICAgICAgZm9ybWF0WWVhciA9IGZvcm1hdChcIiVZXCIpO1xuXG4gIGZ1bmN0aW9uIHRpY2tGb3JtYXQoZGF0ZSkge1xuICAgIHJldHVybiAoc2Vjb25kKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdE1pbGxpc2Vjb25kXG4gICAgICAgIDogbWludXRlKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdFNlY29uZFxuICAgICAgICA6IGhvdXIoZGF0ZSkgPCBkYXRlID8gZm9ybWF0TWludXRlXG4gICAgICAgIDogZGF5KGRhdGUpIDwgZGF0ZSA/IGZvcm1hdEhvdXJcbiAgICAgICAgOiBtb250aChkYXRlKSA8IGRhdGUgPyAod2VlayhkYXRlKSA8IGRhdGUgPyBmb3JtYXREYXkgOiBmb3JtYXRXZWVrKVxuICAgICAgICA6IHllYXIoZGF0ZSkgPCBkYXRlID8gZm9ybWF0TW9udGhcbiAgICAgICAgOiBmb3JtYXRZZWFyKShkYXRlKTtcbiAgfVxuXG4gIHNjYWxlLmludmVydCA9IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoaW52ZXJ0KHkpKTtcbiAgfTtcblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyBkb21haW4oQXJyYXkuZnJvbShfLCBudW1iZXIpKSA6IGRvbWFpbigpLm1hcChkYXRlKTtcbiAgfTtcblxuICBzY2FsZS50aWNrcyA9IGZ1bmN0aW9uKGludGVydmFsKSB7XG4gICAgdmFyIGQgPSBkb21haW4oKTtcbiAgICByZXR1cm4gdGlja3MoZFswXSwgZFtkLmxlbmd0aCAtIDFdLCBpbnRlcnZhbCA9PSBudWxsID8gMTAgOiBpbnRlcnZhbCk7XG4gIH07XG5cbiAgc2NhbGUudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKGNvdW50LCBzcGVjaWZpZXIpIHtcbiAgICByZXR1cm4gc3BlY2lmaWVyID09IG51bGwgPyB0aWNrRm9ybWF0IDogZm9ybWF0KHNwZWNpZmllcik7XG4gIH07XG5cbiAgc2NhbGUubmljZSA9IGZ1bmN0aW9uKGludGVydmFsKSB7XG4gICAgdmFyIGQgPSBkb21haW4oKTtcbiAgICBpZiAoIWludGVydmFsIHx8IHR5cGVvZiBpbnRlcnZhbC5yYW5nZSAhPT0gXCJmdW5jdGlvblwiKSBpbnRlcnZhbCA9IHRpY2tJbnRlcnZhbChkWzBdLCBkW2QubGVuZ3RoIC0gMV0sIGludGVydmFsID09IG51bGwgPyAxMCA6IGludGVydmFsKTtcbiAgICByZXR1cm4gaW50ZXJ2YWwgPyBkb21haW4obmljZShkLCBpbnRlcnZhbCkpIDogc2NhbGU7XG4gIH07XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb3B5KHNjYWxlLCBjYWxlbmRhcih0aWNrcywgdGlja0ludGVydmFsLCB5ZWFyLCBtb250aCwgd2VlaywgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZm9ybWF0KSk7XG4gIH07XG5cbiAgcmV0dXJuIHNjYWxlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aW1lKCkge1xuICByZXR1cm4gaW5pdFJhbmdlLmFwcGx5KGNhbGVuZGFyKHRpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbCwgdGltZVllYXIsIHRpbWVNb250aCwgdGltZVdlZWssIHRpbWVEYXksIHRpbWVIb3VyLCB0aW1lTWludXRlLCB0aW1lU2Vjb25kLCB0aW1lRm9ybWF0KS5kb21haW4oW25ldyBEYXRlKDIwMDAsIDAsIDEpLCBuZXcgRGF0ZSgyMDAwLCAwLCAyKV0pLCBhcmd1bWVudHMpO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIFRyYW5zZm9ybShrLCB4LCB5KSB7XG4gIHRoaXMuayA9IGs7XG4gIHRoaXMueCA9IHg7XG4gIHRoaXMueSA9IHk7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2Zvcm0sXG4gIHNjYWxlOiBmdW5jdGlvbihrKSB7XG4gICAgcmV0dXJuIGsgPT09IDEgPyB0aGlzIDogbmV3IFRyYW5zZm9ybSh0aGlzLmsgKiBrLCB0aGlzLngsIHRoaXMueSk7XG4gIH0sXG4gIHRyYW5zbGF0ZTogZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiB4ID09PSAwICYgeSA9PT0gMCA/IHRoaXMgOiBuZXcgVHJhbnNmb3JtKHRoaXMuaywgdGhpcy54ICsgdGhpcy5rICogeCwgdGhpcy55ICsgdGhpcy5rICogeSk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBbcG9pbnRbMF0gKiB0aGlzLmsgKyB0aGlzLngsIHBvaW50WzFdICogdGhpcy5rICsgdGhpcy55XTtcbiAgfSxcbiAgYXBwbHlYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHggKiB0aGlzLmsgKyB0aGlzLng7XG4gIH0sXG4gIGFwcGx5WTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB5ICogdGhpcy5rICsgdGhpcy55O1xuICB9LFxuICBpbnZlcnQ6IGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgcmV0dXJuIFsobG9jYXRpb25bMF0gLSB0aGlzLngpIC8gdGhpcy5rLCAobG9jYXRpb25bMV0gLSB0aGlzLnkpIC8gdGhpcy5rXTtcbiAgfSxcbiAgaW52ZXJ0WDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiAoeCAtIHRoaXMueCkgLyB0aGlzLms7XG4gIH0sXG4gIGludmVydFk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gKHkgLSB0aGlzLnkpIC8gdGhpcy5rO1xuICB9LFxuICByZXNjYWxlWDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4LmNvcHkoKS5kb21haW4oeC5yYW5nZSgpLm1hcCh0aGlzLmludmVydFgsIHRoaXMpLm1hcCh4LmludmVydCwgeCkpO1xuICB9LFxuICByZXNjYWxlWTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB5LmNvcHkoKS5kb21haW4oeS5yYW5nZSgpLm1hcCh0aGlzLmludmVydFksIHRoaXMpLm1hcCh5LmludmVydCwgeSkpO1xuICB9LFxuICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgdGhpcy54ICsgXCIsXCIgKyB0aGlzLnkgKyBcIikgc2NhbGUoXCIgKyB0aGlzLmsgKyBcIilcIjtcbiAgfVxufTtcblxuZXhwb3J0IHZhciBpZGVudGl0eSA9IG5ldyBUcmFuc2Zvcm0oMSwgMCwgMCk7XG5cbnRyYW5zZm9ybS5wcm90b3R5cGUgPSBUcmFuc2Zvcm0ucHJvdG90eXBlO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc2Zvcm0obm9kZSkge1xuICB3aGlsZSAoIW5vZGUuX196b29tKSBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkgcmV0dXJuIGlkZW50aXR5O1xuICByZXR1cm4gbm9kZS5fX3pvb207XG59XG4iLCJpbXBvcnQgeyBSZWFjdEVsZW1lbnQsIGNyZWF0ZUVsZW1lbnQsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQ2F0YWxvZ1JlbGVhc2VDaGFydENvbnRhaW5lclByb3BzIH0gZnJvbSBcIi4uL3R5cGluZ3MvQ2F0YWxvZ1JlbGVhc2VDaGFydFByb3BzXCI7XG5pbXBvcnQgeyBWYWx1ZVN0YXR1cyB9IGZyb20gXCJtZW5kaXhcIjtcbmltcG9ydCAqIGFzIGQzIGZyb20gXCJkM1wiO1xuXG5pbXBvcnQgXCIuL3VpL0NhdGFsb2dSZWxlYXNlQ2hhcnQuY3NzXCI7XG5cbmludGVyZmFjZSBJbmR1c3RyeURhdGEge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICByZXRpcmVkOiBEYXRlO1xuICAgIGN1cnJlbnQ6IERhdGU7XG4gICAgdXBjb21pbmc6IHN0cmluZztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIENhdGFsb2dSZWxlYXNlQ2hhcnQocHJvcHM6IENhdGFsb2dSZWxlYXNlQ2hhcnRDb250YWluZXJQcm9wcyk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge1xuICAgICAgICBuYW1lLFxuICAgICAgICBjYXRhbG9nRGF0YSxcbiAgICAgICAgbmFtZUF0dHJpYnV0ZSxcbiAgICAgICAgcmV0aXJlZERhdGVBdHRyaWJ1dGUsXG4gICAgICAgIGN1cnJlbnREYXRlQXR0cmlidXRlLFxuICAgICAgICB1cGNvbWluZ0NvZGVBdHRyaWJ1dGUsXG4gICAgICAgIGNoYXJ0VGl0bGUsXG4gICAgICAgIGVuYWJsZUxlZ2VuZCxcbiAgICAgICAgb25JdGVtQ2xpY2ssXG4gICAgICAgIHJlZnJlc2hJbnRlcnZhbCxcbiAgICAgICAgY2hhcnRIZWlnaHQsXG4gICAgICAgIHNob3dUb2RheVxuICAgIH0gPSBwcm9wcztcblxuICAgIGNvbnN0IGNoYXJ0UmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKTtcbiAgICBjb25zdCBjb250YWluZXJSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpO1xuICAgIGNvbnN0IFtkaW1lbnNpb25zLCBzZXREaW1lbnNpb25zXSA9IHVzZVN0YXRlKHsgd2lkdGg6IDAsIGhlaWdodDogY2hhcnRIZWlnaHQgfSk7XG4gICAgY29uc3QgW2luZHVzdHJpZXMsIHNldEluZHVzdHJpZXNdID0gdXNlU3RhdGU8SW5kdXN0cnlEYXRhW10+KFtdKTtcblxuICAgIC8vIEhhbmRsZSByZXNpemVcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVSZXNpemUgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29udGFpbmVyUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHdpZHRoIH0gPSBjb250YWluZXJSZWYuY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICBzZXREaW1lbnNpb25zKHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGNoYXJ0SGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaGFuZGxlUmVzaXplKCk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoaGFuZGxlUmVzaXplKTtcbiAgICAgICAgaWYgKGNvbnRhaW5lclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKGNvbnRhaW5lclJlZi5jdXJyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKTtcbiAgICAgICAgICAgIHJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfTtcbiAgICB9LCBbY2hhcnRIZWlnaHRdKTtcblxuICAgIC8vIFByb2Nlc3MgZGF0YSBmcm9tIE1lbmRpeCBkYXRhIHNvdXJjZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChjYXRhbG9nRGF0YSAmJiBjYXRhbG9nRGF0YS5zdGF0dXMgPT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSAmJiBjYXRhbG9nRGF0YS5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgcHJvY2Vzc2VkSW5kdXN0cmllczogSW5kdXN0cnlEYXRhW10gPSBjYXRhbG9nRGF0YS5pdGVtc1xuICAgICAgICAgICAgICAgIC5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gbmFtZUF0dHJpYnV0ZS5nZXQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXRpcmVkRGF0ZSA9IHJldGlyZWREYXRlQXR0cmlidXRlLmdldChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREYXRlID0gY3VycmVudERhdGVBdHRyaWJ1dGUuZ2V0KGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBjb21pbmdDb2RlID0gdXBjb21pbmdDb2RlQXR0cmlidXRlLmdldChpdGVtKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCBhbGwgcmVxdWlyZWQgZGF0YSBpcyBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYW1lLnN0YXR1cyAhPT0gVmFsdWVTdGF0dXMuQXZhaWxhYmxlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0aXJlZERhdGUuc3RhdHVzICE9PSBWYWx1ZVN0YXR1cy5BdmFpbGFibGUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZS5zdGF0dXMgIT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwY29taW5nQ29kZS5zdGF0dXMgIT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUudmFsdWUgfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRpcmVkOiByZXRpcmVkRGF0ZS52YWx1ZSB8fCBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGN1cnJlbnREYXRlLnZhbHVlIHx8IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBjb21pbmc6IHVwY29taW5nQ29kZS52YWx1ZSB8fCBcIlRCRFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHByb2Nlc3NpbmcgY2F0YWxvZyBkYXRhIGl0ZW06XCIsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChpdGVtKTogaXRlbSBpcyBJbmR1c3RyeURhdGEgPT4gaXRlbSAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKSk7IC8vIFNvcnQgYWxwaGFiZXRpY2FsbHkgYnkgbmFtZVxuXG4gICAgICAgICAgICBzZXRJbmR1c3RyaWVzKHByb2Nlc3NlZEluZHVzdHJpZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0SW5kdXN0cmllcyhbXSk7XG4gICAgICAgIH1cbiAgICB9LCBbY2F0YWxvZ0RhdGEsIG5hbWVBdHRyaWJ1dGUsIHJldGlyZWREYXRlQXR0cmlidXRlLCBjdXJyZW50RGF0ZUF0dHJpYnV0ZSwgdXBjb21pbmdDb2RlQXR0cmlidXRlXSk7XG5cbiAgICAvLyBBdXRvLXJlZnJlc2ggZnVuY3Rpb25hbGl0eVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChyZWZyZXNoSW50ZXJ2YWwgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY2F0YWxvZ0RhdGEgJiYgY2F0YWxvZ0RhdGEucmVsb2FkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGFsb2dEYXRhLnJlbG9hZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHJlZnJlc2hJbnRlcnZhbCAqIDEwMDApO1xuXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgIH1cbiAgICB9LCBbcmVmcmVzaEludGVydmFsLCBjYXRhbG9nRGF0YV0pO1xuXG4gICAgLy8gUmVuZGVyIGNoYXJ0XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKCFjaGFydFJlZi5jdXJyZW50IHx8IGRpbWVuc2lvbnMud2lkdGggPT09IDAgfHwgaW5kdXN0cmllcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgICAgICAvLyBDbGVhciBhbnkgZXhpc3RpbmcgY2hhcnRcbiAgICAgICAgZDMuc2VsZWN0KGNoYXJ0UmVmLmN1cnJlbnQpLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKCk7XG5cbiAgICAgICAgLy8gUmVzcG9uc2l2ZSBtYXJnaW5zIGJhc2VkIG9uIGNvbnRhaW5lciB3aWR0aFxuICAgICAgICBjb25zdCBtYXJnaW4gPSB7XG4gICAgICAgICAgICB0b3A6IDgwLFxuICAgICAgICAgICAgcmlnaHQ6IGRpbWVuc2lvbnMud2lkdGggPCA4MDAgPyAxMDAgOiAxNTAsXG4gICAgICAgICAgICBib3R0b206IDQwLFxuICAgICAgICAgICAgbGVmdDogZGltZW5zaW9ucy53aWR0aCA8IDgwMCA/IDEyMCA6IDE4MFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgY29uc3Qgd2lkdGggPSBkaW1lbnNpb25zLndpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IGRpbWVuc2lvbnMuaGVpZ2h0IC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XG5cbiAgICAgICAgLy8gQ3JlYXRlIFNWRyB3aXRoIHZpZXdCb3ggZm9yIGJldHRlciBzY2FsaW5nXG4gICAgICAgIGNvbnN0IHN2ZyA9IGQzLnNlbGVjdChjaGFydFJlZi5jdXJyZW50KVxuICAgICAgICAgICAgLmFwcGVuZChcInN2Z1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBkaW1lbnNpb25zLndpZHRoKVxuICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZGltZW5zaW9ucy5oZWlnaHQpXG4gICAgICAgICAgICAuYXR0cihcInZpZXdCb3hcIiwgYDAgMCAke2RpbWVuc2lvbnMud2lkdGh9ICR7ZGltZW5zaW9ucy5oZWlnaHR9YClcbiAgICAgICAgICAgIC5hdHRyKFwicHJlc2VydmVBc3BlY3RSYXRpb1wiLCBcInhNaWRZTWlkIG1lZXRcIilcbiAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7bWFyZ2luLmxlZnR9LCR7bWFyZ2luLnRvcH0pYCk7XG5cbiAgICAgICAgLy8gVGltZSBzY2FsZVxuICAgICAgICBjb25zdCB0aW1lU2NhbGUgPSBkMy5zY2FsZVRpbWUoKVxuICAgICAgICAgICAgLmRvbWFpbihbbmV3IERhdGUoMjAyMiwgNywgMSksIG5ldyBEYXRlKDIwMjUsIDExLCAzMSldKVxuICAgICAgICAgICAgLnJhbmdlKFswLCB3aWR0aF0pO1xuXG4gICAgICAgIC8vIFkgc2NhbGUgZm9yIGluZHVzdHJpZXNcbiAgICAgICAgY29uc3QgeVNjYWxlID0gZDMuc2NhbGVCYW5kKClcbiAgICAgICAgICAgIC5kb21haW4oaW5kdXN0cmllcy5tYXAoZCA9PiBkLm5hbWUpKVxuICAgICAgICAgICAgLnJhbmdlKFswLCBoZWlnaHRdKVxuICAgICAgICAgICAgLnBhZGRpbmcoMC4zKTtcblxuICAgICAgICAvLyBBZGQgdGltZWxpbmUgZGF0ZXNcbiAgICAgICAgY29uc3QgdGltZWxpbmVEYXRlcyA9IFtcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjIsIDcsIDEpLFxuICAgICAgICAgICAgbmV3IERhdGUoMjAyMywgMiwgMSksXG4gICAgICAgICAgICBuZXcgRGF0ZSgyMDIzLCA5LCAxKSxcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjQsIDMsIDEpLFxuICAgICAgICAgICAgbmV3IERhdGUoMjAyNCwgMTAsIDEpLFxuICAgICAgICAgICAgbmV3IERhdGUoMjAyNSwgNCwgMSksXG4gICAgICAgICAgICBuZXcgRGF0ZSgyMDI1LCAxMSwgMSlcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBEcmF3IG1haW4gdGltZWxpbmVcbiAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0aW1lbGluZS1saW5lXCIpXG4gICAgICAgICAgICAuYXR0cihcIngxXCIsIDApXG4gICAgICAgICAgICAuYXR0cihcInkxXCIsIC00MClcbiAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgd2lkdGgpXG4gICAgICAgICAgICAuYXR0cihcInkyXCIsIC00MCk7XG5cbiAgICAgICAgLy8gQWRkIHRpbWVsaW5lIG1hcmtlcnMgYW5kIGxhYmVsc1xuICAgICAgICB0aW1lbGluZURhdGVzLmZvckVhY2goZGF0ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCB4ID0gdGltZVNjYWxlKGRhdGUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdmcuYXBwZW5kKFwiY2lyY2xlXCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjeFwiLCB4KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY3lcIiwgLTQwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiclwiLCA0KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCBcIiMyYzUyODJcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImRhdGUtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCB4KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCAtNTApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcIm1pZGRsZVwiKVxuICAgICAgICAgICAgICAgIC50ZXh0KGQzLnRpbWVGb3JtYXQoXCIlYi0leVwiKShkYXRlKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCB0b2RheSdzIGRhdGUgKGlmIGVuYWJsZWQpXG4gICAgICAgIGlmIChzaG93VG9kYXkpIHtcbiAgICAgICAgICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IHRvZGF5WCA9IHRpbWVTY2FsZSh0b2RheSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRvZGF5J3MgdmVydGljYWwgbGluZVxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidG9kYXktbGluZVwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgdG9kYXlYKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgLTQwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgdG9kYXlYKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgaGVpZ2h0KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVG9kYXkncyBjaXJjbGVcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJjaXJjbGVcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidG9kYXktY2lyY2xlXCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjeFwiLCB0b2RheVgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjeVwiLCAtNDApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJyXCIsIDgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUb2RheSdzIGRhdGUgbGFiZWxcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRvZGF5LXRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgdG9kYXlYKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCAtNjUpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcIm1pZGRsZVwiKVxuICAgICAgICAgICAgICAgIC50ZXh0KGQzLnRpbWVGb3JtYXQoXCIlLW0vJS1kLyVZXCIpKHRvZGF5KSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGp1c3QgZm9udCBzaXplcyBmb3Igc21hbGxlciBzY3JlZW5zXG4gICAgICAgIGNvbnN0IGZvbnRTaXplID0gZGltZW5zaW9ucy53aWR0aCA8IDgwMCA/IFwiMTJweFwiIDogXCIxNHB4XCI7XG5cbiAgICAgICAgLy8gRHJhdyBpbmR1c3RyeSByb3dzXG4gICAgICAgIGluZHVzdHJpZXMuZm9yRWFjaCgoaW5kdXN0cnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHkgPSB5U2NhbGUoaW5kdXN0cnkubmFtZSkhICsgeVNjYWxlLmJhbmR3aWR0aCgpIC8gMjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSW5kdXN0cnkgbmFtZVxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiaW5kdXN0cnktdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCAtMTApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgKyA1KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJlbmRcIilcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJmb250LXNpemVcIiwgZm9udFNpemUpXG4gICAgICAgICAgICAgICAgLnRleHQoaW5kdXN0cnkubmFtZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEluZHVzdHJ5IGxpbmVcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImluZHVzdHJ5LWxpbmVcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcIngxXCIsIDApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCB5KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgd2lkdGgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCB5KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ29udGludWl0eSBsaW5lIGJldHdlZW4gcmV0aXJlZCBhbmQgY3VycmVudFxuICAgICAgICAgICAgaWYgKGluZHVzdHJ5LnJldGlyZWQgJiYgaW5kdXN0cnkuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldGlyZWRYID0gdGltZVNjYWxlKGluZHVzdHJ5LnJldGlyZWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRYID0gdGltZVNjYWxlKGluZHVzdHJ5LmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJjb250aW51aXR5LWxpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCByZXRpcmVkWClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCB5KVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIngyXCIsIGN1cnJlbnRYKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInkyXCIsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBGdXR1cmUgY29udGludWl0eSBsaW5lIGZyb20gY3VycmVudCB0byB1cGNvbWluZ1xuICAgICAgICAgICAgbGV0IHVwY29taW5nWFBvcyA9IHdpZHRoICsgMjA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpbmR1c3RyeS51cGNvbWluZyAhPT0gXCJUQkRcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHllYXIgPSBwYXJzZUludChcIjIwXCIgKyBpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMCwgMikpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vbnRoID0gcGFyc2VJbnQoaW5kdXN0cnkudXBjb21pbmcuc3Vic3RyaW5nKDIsIDQpKSAtIDE7XG4gICAgICAgICAgICAgICAgY29uc3QgdXBjb21pbmdEYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh1cGNvbWluZ0RhdGUgPD0gdGltZVNjYWxlLmRvbWFpbigpWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwY29taW5nWFBvcyA9IHRpbWVTY2FsZSh1cGNvbWluZ0RhdGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVwY29taW5nWFBvcyA9IHdpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdXBjb21pbmdYUG9zID0gd2lkdGggKyAyMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGluZHVzdHJ5LmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50WCA9IHRpbWVTY2FsZShpbmR1c3RyeS5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICBsZXQgbGluZUVuZFggPSB1cGNvbWluZ1hQb3M7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKGluZHVzdHJ5LnVwY29taW5nID09PSBcIlRCRFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVFbmRYID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBjb21pbmdEYXRlID0gbmV3IERhdGUocGFyc2VJbnQoXCIyMFwiICsgaW5kdXN0cnkudXBjb21pbmcuc3Vic3RyaW5nKDAsMikpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGluZHVzdHJ5LnVwY29taW5nLnN1YnN0cmluZygyLDQpKS0xLDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodXBjb21pbmdEYXRlID4gdGltZVNjYWxlLmRvbWFpbigpWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lRW5kWCA9IHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUVuZFggPSB0aW1lU2NhbGUodXBjb21pbmdEYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJmdXR1cmUtY29udGludWl0eS1saW5lXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgY3VycmVudFgpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgeSlcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCBsaW5lRW5kWClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUmV0aXJlZCBtYXJrZXIgKGRpYW1vbmQpXG4gICAgICAgICAgICBpZiAoaW5kdXN0cnkucmV0aXJlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldGlyZWRYID0gdGltZVNjYWxlKGluZHVzdHJ5LnJldGlyZWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldGlyZWRNYXJrZXIgPSBzdmcuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwicmV0aXJlZC1tYXJrZXJcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIHJldGlyZWRYIC0gMTApXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCB5IC0gMTApXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgMjApXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDIwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInJ4XCIsIDEwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBgcm90YXRlKDQ1ICR7cmV0aXJlZFh9ICR7eX0pYClcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKFwiY3Vyc29yXCIsIG9uSXRlbUNsaWNrID8gXCJwb2ludGVyXCIgOiBcImRlZmF1bHRcIik7XG5cbiAgICAgICAgICAgICAgICBpZiAob25JdGVtQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0aXJlZE1hcmtlci5vbihcImNsaWNrXCIsICgpID0+IG9uSXRlbUNsaWNrLmV4ZWN1dGUoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDdXJyZW50IG1hcmtlciAoZGlhbW9uZClcbiAgICAgICAgICAgIGlmIChpbmR1c3RyeS5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFggPSB0aW1lU2NhbGUoaW5kdXN0cnkuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudE1hcmtlciA9IHN2Zy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJjdXJyZW50LW1hcmtlclwiKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgY3VycmVudFggLSAxMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgLSAxMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAyMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMjApXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwicnhcIiwgMTApXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGByb3RhdGUoNDUgJHtjdXJyZW50WH0gJHt5fSlgKVxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoXCJjdXJzb3JcIiwgb25JdGVtQ2xpY2sgPyBcInBvaW50ZXJcIiA6IFwiZGVmYXVsdFwiKTtcblxuICAgICAgICAgICAgICAgIGlmIChvbkl0ZW1DbGljaykge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50TWFya2VyLm9uKFwiY2xpY2tcIiwgKCkgPT4gb25JdGVtQ2xpY2suZXhlY3V0ZSgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFVwY29taW5nIGJveCAtIGFkanVzdGVkIHBvc2l0aW9uaW5nXG4gICAgICAgICAgICBsZXQgYm94WCA9IHVwY29taW5nWFBvcztcbiAgICAgICAgICAgIGlmIChpbmR1c3RyeS51cGNvbWluZyAhPT0gXCJUQkRcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHllYXIgPSBwYXJzZUludChcIjIwXCIgKyBpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMCwgMikpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vbnRoID0gcGFyc2VJbnQoaW5kdXN0cnkudXBjb21pbmcuc3Vic3RyaW5nKDIsIDQpKSAtIDE7XG4gICAgICAgICAgICAgICAgY29uc3QgdXBjb21pbmdEYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpO1xuICAgICAgICAgICAgICAgIGlmICh1cGNvbWluZ0RhdGUgPD0gdGltZVNjYWxlLmRvbWFpbigpWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgIGJveFggPSB0aW1lU2NhbGUodXBjb21pbmdEYXRlKSAtIDMwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJveFggPSB3aWR0aCAtIDcwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYm94WCA9IHdpZHRoIC0gNzA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHVwY29taW5nQm94ID0gc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidXBjb21pbmctYm94XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIGJveFgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgLSAxNSlcbiAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDYwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDMwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwicnhcIiwgNClcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJjdXJzb3JcIiwgb25JdGVtQ2xpY2sgPyBcInBvaW50ZXJcIiA6IFwiZGVmYXVsdFwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKG9uSXRlbUNsaWNrKSB7XG4gICAgICAgICAgICAgICAgdXBjb21pbmdCb3gub24oXCJjbGlja1wiLCAoKSA9PiBvbkl0ZW1DbGljay5leGVjdXRlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdmcuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ1cGNvbWluZy10ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIGJveFggKyAzMClcbiAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgeSArIDUpXG4gICAgICAgICAgICAgICAgLnN0eWxlKFwiZm9udC1zaXplXCIsIGZvbnRTaXplKVxuICAgICAgICAgICAgICAgIC50ZXh0KGluZHVzdHJ5LnVwY29taW5nKTtcbiAgICAgICAgfSk7XG4gICAgfSwgW2RpbWVuc2lvbnMsIGluZHVzdHJpZXMsIHNob3dUb2RheSwgb25JdGVtQ2xpY2tdKTtcblxuICAgIC8vIExvYWRpbmcgc3RhdGVcbiAgICBpZiAoIWNhdGFsb2dEYXRhIHx8IGNhdGFsb2dEYXRhLnN0YXR1cyA9PT0gVmFsdWVTdGF0dXMuTG9hZGluZykge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BjYXRhbG9nLXJlbGVhc2UtY2hhcnQgJHtuYW1lfWB9IHJlZj17Y29udGFpbmVyUmVmfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNoYXJ0LWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwiY2hhcnQtdGl0bGVcIj57Y2hhcnRUaXRsZX08L2gxPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxvYWRpbmctbWVzc2FnZVwiPkxvYWRpbmcgY2F0YWxvZyBkYXRhLi4uPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBFcnJvciBzdGF0ZVxuICAgIGlmIChjYXRhbG9nRGF0YS5zdGF0dXMgPT09IFZhbHVlU3RhdHVzLlVuYXZhaWxhYmxlKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGNhdGFsb2ctcmVsZWFzZS1jaGFydCAke25hbWV9YH0gcmVmPXtjb250YWluZXJSZWZ9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2hhcnQtY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJjaGFydC10aXRsZVwiPntjaGFydFRpdGxlfTwvaDE+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3ItbWVzc2FnZVwiPlVuYWJsZSB0byBsb2FkIGNhdGFsb2cgZGF0YS4gUGxlYXNlIGNoZWNrIHlvdXIgZGF0YSBzb3VyY2UgY29uZmlndXJhdGlvbi48L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIE5vIGRhdGEgc3RhdGVcbiAgICBpZiAoIWNhdGFsb2dEYXRhLml0ZW1zIHx8IGNhdGFsb2dEYXRhLml0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BjYXRhbG9nLXJlbGVhc2UtY2hhcnQgJHtuYW1lfWB9IHJlZj17Y29udGFpbmVyUmVmfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNoYXJ0LWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwiY2hhcnQtdGl0bGVcIj57Y2hhcnRUaXRsZX08L2gxPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm5vLWRhdGEtbWVzc2FnZVwiPk5vIGNhdGFsb2cgZGF0YSBhdmFpbGFibGUuIFBsZWFzZSBhZGQgY2F0YWxvZyByZWxlYXNlIHNjaGVkdWxlcyB0byBzZWUgdGhlIGNoYXJ0LjwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BjYXRhbG9nLXJlbGVhc2UtY2hhcnQgJHtuYW1lfWB9IHJlZj17Y29udGFpbmVyUmVmfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJyB9fT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2hhcnQtY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cImNoYXJ0LXRpdGxlXCI+e2NoYXJ0VGl0bGV9PC9oMT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB7ZW5hYmxlTGVnZW5kICYmIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsZWdlbmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGVnZW5kLWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cImxlZ2VuZC1zeW1ib2xcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IHg9XCIyXCIgeT1cIjJcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiByeD1cIjUwJVwiIGNsYXNzTmFtZT1cInJldGlyZWQtbWFya2VyXCIvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlJldGlyZWQgQ2F0YWxvZzwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsZWdlbmQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwibGVnZW5kLXN5bWJvbFwiIHZpZXdCb3g9XCIwIDAgMjAgMjBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgeD1cIjJcIiB5PVwiMlwiIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIHJ4PVwiNTAlXCIgY2xhc3NOYW1lPVwiY3VycmVudC1tYXJrZXJcIi8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+Q3VycmVudCBDYXRhbG9nPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxlZ2VuZC1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJsZWdlbmQtc3ltYm9sXCIgdmlld0JveD1cIjAgMCAyMCAyMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCB4PVwiMlwiIHk9XCIyXCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgcng9XCIyXCIgY2xhc3NOYW1lPVwidXBjb21pbmctYm94XCIvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlVwY29taW5nIENhdGFsb2c8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93VG9kYXkgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGVnZW5kLWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJsZWdlbmQtc3ltYm9sXCIgdmlld0JveD1cIjAgMCAyMCAyMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjEwXCIgY3k9XCIxMFwiIHI9XCI1XCIgY2xhc3NOYW1lPVwidG9kYXktY2lyY2xlXCIvPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+VG9kYXkncyBEYXRlPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8ZGl2IHJlZj17Y2hhcnRSZWZ9IGlkPVwiY2hhcnRcIiBzdHlsZT17eyB3aWR0aDogJzEwMCUnIH19PjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59Il0sIm5hbWVzIjpbImFzY2VuZGluZyIsImEiLCJiIiwiTmFOIiwiZGVzY2VuZGluZyIsImJpc2VjdG9yIiwiZiIsImNvbXBhcmUxIiwiY29tcGFyZTIiLCJkZWx0YSIsImxlbmd0aCIsImQiLCJ4IiwiemVybyIsImxlZnQiLCJsbyIsImhpIiwibWlkIiwicmlnaHQiLCJjZW50ZXIiLCJpIiwibnVtYmVyIiwiYXNjZW5kaW5nQmlzZWN0IiwiYmlzZWN0UmlnaHQiLCJJbnRlcm5NYXAiLCJNYXAiLCJjb25zdHJ1Y3RvciIsImVudHJpZXMiLCJrZXkiLCJrZXlvZiIsIk9iamVjdCIsImRlZmluZVByb3BlcnRpZXMiLCJfaW50ZXJuIiwidmFsdWUiLCJfa2V5Iiwic2V0IiwiZ2V0IiwiaW50ZXJuX2dldCIsImhhcyIsImludGVybl9zZXQiLCJkZWxldGUiLCJpbnRlcm5fZGVsZXRlIiwidmFsdWVPZiIsImUxMCIsIk1hdGgiLCJzcXJ0IiwiZTUiLCJlMiIsInRpY2tTcGVjIiwic3RhcnQiLCJzdG9wIiwiY291bnQiLCJzdGVwIiwibWF4IiwicG93ZXIiLCJmbG9vciIsImxvZzEwIiwiZXJyb3IiLCJwb3ciLCJmYWN0b3IiLCJpMSIsImkyIiwiaW5jIiwicm91bmQiLCJ0aWNrSW5jcmVtZW50IiwidGlja1N0ZXAiLCJyZXZlcnNlIiwicmFuZ2UiLCJuIiwiYXJndW1lbnRzIiwiY2VpbCIsIkFycmF5Iiwibm9vcCIsImRpc3BhdGNoIiwiXyIsInQiLCJ0ZXN0IiwiRXJyb3IiLCJEaXNwYXRjaCIsInBhcnNlVHlwZW5hbWVzIiwidHlwZW5hbWVzIiwidHlwZXMiLCJ0cmltIiwic3BsaXQiLCJtYXAiLCJuYW1lIiwiaW5kZXhPZiIsInNsaWNlIiwiaGFzT3duUHJvcGVydHkiLCJ0eXBlIiwicHJvdG90eXBlIiwib24iLCJ0eXBlbmFtZSIsImNhbGxiYWNrIiwiVCIsImNvcHkiLCJjYWxsIiwidGhhdCIsImFyZ3MiLCJhcHBseSIsImMiLCJjb25jYXQiLCJwdXNoIiwieGh0bWwiLCJzdmciLCJ4bGluayIsInhtbCIsInhtbG5zIiwicHJlZml4IiwibmFtZXNwYWNlcyIsInNwYWNlIiwibG9jYWwiLCJjcmVhdG9ySW5oZXJpdCIsImRvY3VtZW50Iiwib3duZXJEb2N1bWVudCIsInVyaSIsIm5hbWVzcGFjZVVSSSIsImRvY3VtZW50RWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJjcmVhdG9yRml4ZWQiLCJmdWxsbmFtZSIsIm5hbWVzcGFjZSIsIm5vbmUiLCJzZWxlY3RvciIsInF1ZXJ5U2VsZWN0b3IiLCJzZWxlY3QiLCJncm91cHMiLCJfZ3JvdXBzIiwibSIsInN1Ymdyb3VwcyIsImoiLCJncm91cCIsInN1Ymdyb3VwIiwibm9kZSIsInN1Ym5vZGUiLCJfX2RhdGFfXyIsIlNlbGVjdGlvbiIsIl9wYXJlbnRzIiwiYXJyYXkiLCJpc0FycmF5IiwiZnJvbSIsImVtcHR5IiwicXVlcnlTZWxlY3RvckFsbCIsImFycmF5QWxsIiwic2VsZWN0b3JBbGwiLCJwYXJlbnRzIiwibWF0Y2hlcyIsImNoaWxkTWF0Y2hlciIsImZpbmQiLCJjaGlsZEZpbmQiLCJtYXRjaCIsImNoaWxkcmVuIiwiY2hpbGRGaXJzdCIsImZpcnN0RWxlbWVudENoaWxkIiwiZmlsdGVyIiwiY2hpbGRyZW5GaWx0ZXIiLCJzZWxlY3RBbGwiLCJtYXRjaGVyIiwidXBkYXRlIiwiX2VudGVyIiwic3BhcnNlIiwiRW50ZXJOb2RlIiwicGFyZW50IiwiZGF0dW0iLCJfbmV4dCIsIl9wYXJlbnQiLCJhcHBlbmRDaGlsZCIsImNoaWxkIiwiaW5zZXJ0QmVmb3JlIiwibmV4dCIsImJpbmRJbmRleCIsImVudGVyIiwiZXhpdCIsImRhdGEiLCJncm91cExlbmd0aCIsImRhdGFMZW5ndGgiLCJiaW5kS2V5Iiwibm9kZUJ5S2V5VmFsdWUiLCJrZXlWYWx1ZXMiLCJrZXlWYWx1ZSIsImJpbmQiLCJjb25zdGFudCIsImFycmF5bGlrZSIsImVudGVyR3JvdXAiLCJ1cGRhdGVHcm91cCIsImV4aXRHcm91cCIsImkwIiwicHJldmlvdXMiLCJfZXhpdCIsIm9uZW50ZXIiLCJvbnVwZGF0ZSIsIm9uZXhpdCIsInNlbGVjdGlvbiIsImFwcGVuZCIsInJlbW92ZSIsIm1lcmdlIiwib3JkZXIiLCJjb250ZXh0IiwiZ3JvdXBzMCIsImdyb3VwczEiLCJtMCIsIm0xIiwibWluIiwibWVyZ2VzIiwiZ3JvdXAwIiwiZ3JvdXAxIiwiY29tcGFyZURvY3VtZW50UG9zaXRpb24iLCJwYXJlbnROb2RlIiwiY29tcGFyZSIsImNvbXBhcmVOb2RlIiwic29ydGdyb3VwcyIsInNvcnRncm91cCIsInNvcnQiLCJzaXplIiwiYXR0clJlbW92ZSIsInJlbW92ZUF0dHJpYnV0ZSIsImF0dHJSZW1vdmVOUyIsInJlbW92ZUF0dHJpYnV0ZU5TIiwiYXR0ckNvbnN0YW50Iiwic2V0QXR0cmlidXRlIiwiYXR0ckNvbnN0YW50TlMiLCJzZXRBdHRyaWJ1dGVOUyIsImF0dHJGdW5jdGlvbiIsInYiLCJhdHRyRnVuY3Rpb25OUyIsImdldEF0dHJpYnV0ZU5TIiwiZ2V0QXR0cmlidXRlIiwiZWFjaCIsImRlZmF1bHRWaWV3Iiwic3R5bGVSZW1vdmUiLCJzdHlsZSIsInJlbW92ZVByb3BlcnR5Iiwic3R5bGVDb25zdGFudCIsInByaW9yaXR5Iiwic2V0UHJvcGVydHkiLCJzdHlsZUZ1bmN0aW9uIiwic3R5bGVWYWx1ZSIsImdldFByb3BlcnR5VmFsdWUiLCJnZXRDb21wdXRlZFN0eWxlIiwicHJvcGVydHlSZW1vdmUiLCJwcm9wZXJ0eUNvbnN0YW50IiwicHJvcGVydHlGdW5jdGlvbiIsImNsYXNzQXJyYXkiLCJzdHJpbmciLCJjbGFzc0xpc3QiLCJDbGFzc0xpc3QiLCJfbm9kZSIsIl9uYW1lcyIsImFkZCIsImpvaW4iLCJzcGxpY2UiLCJjb250YWlucyIsImNsYXNzZWRBZGQiLCJuYW1lcyIsImxpc3QiLCJjbGFzc2VkUmVtb3ZlIiwiY2xhc3NlZFRydWUiLCJjbGFzc2VkRmFsc2UiLCJjbGFzc2VkRnVuY3Rpb24iLCJ0ZXh0UmVtb3ZlIiwidGV4dENvbnRlbnQiLCJ0ZXh0Q29uc3RhbnQiLCJ0ZXh0RnVuY3Rpb24iLCJodG1sUmVtb3ZlIiwiaW5uZXJIVE1MIiwiaHRtbENvbnN0YW50IiwiaHRtbEZ1bmN0aW9uIiwicmFpc2UiLCJuZXh0U2libGluZyIsImxvd2VyIiwicHJldmlvdXNTaWJsaW5nIiwiZmlyc3RDaGlsZCIsImNyZWF0ZSIsImNyZWF0b3IiLCJjb25zdGFudE51bGwiLCJiZWZvcmUiLCJyZW1vdmVDaGlsZCIsInNlbGVjdGlvbl9jbG9uZVNoYWxsb3ciLCJjbG9uZSIsImNsb25lTm9kZSIsInNlbGVjdGlvbl9jbG9uZURlZXAiLCJkZWVwIiwicHJvcGVydHkiLCJjb250ZXh0TGlzdGVuZXIiLCJsaXN0ZW5lciIsImV2ZW50Iiwib25SZW1vdmUiLCJfX29uIiwibyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvcHRpb25zIiwib25BZGQiLCJhZGRFdmVudExpc3RlbmVyIiwiZGlzcGF0Y2hFdmVudCIsInBhcmFtcyIsIndpbmRvdyIsIkN1c3RvbUV2ZW50IiwiY3JlYXRlRXZlbnQiLCJpbml0RXZlbnQiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImRldGFpbCIsImRpc3BhdGNoQ29uc3RhbnQiLCJkaXNwYXRjaEZ1bmN0aW9uIiwicm9vdCIsInNlbGVjdGlvbl9zZWxlY3Rpb24iLCJzZWxlY3Rpb25fc2VsZWN0Iiwic2VsZWN0aW9uX3NlbGVjdEFsbCIsInNlbGVjdENoaWxkIiwic2VsZWN0aW9uX3NlbGVjdENoaWxkIiwic2VsZWN0Q2hpbGRyZW4iLCJzZWxlY3Rpb25fc2VsZWN0Q2hpbGRyZW4iLCJzZWxlY3Rpb25fZmlsdGVyIiwic2VsZWN0aW9uX2RhdGEiLCJzZWxlY3Rpb25fZW50ZXIiLCJzZWxlY3Rpb25fZXhpdCIsInNlbGVjdGlvbl9qb2luIiwic2VsZWN0aW9uX21lcmdlIiwic2VsZWN0aW9uX29yZGVyIiwic2VsZWN0aW9uX3NvcnQiLCJzZWxlY3Rpb25fY2FsbCIsIm5vZGVzIiwic2VsZWN0aW9uX25vZGVzIiwic2VsZWN0aW9uX25vZGUiLCJzZWxlY3Rpb25fc2l6ZSIsInNlbGVjdGlvbl9lbXB0eSIsInNlbGVjdGlvbl9lYWNoIiwiYXR0ciIsInNlbGVjdGlvbl9hdHRyIiwic2VsZWN0aW9uX3N0eWxlIiwic2VsZWN0aW9uX3Byb3BlcnR5IiwiY2xhc3NlZCIsInNlbGVjdGlvbl9jbGFzc2VkIiwidGV4dCIsInNlbGVjdGlvbl90ZXh0IiwiaHRtbCIsInNlbGVjdGlvbl9odG1sIiwic2VsZWN0aW9uX3JhaXNlIiwic2VsZWN0aW9uX2xvd2VyIiwic2VsZWN0aW9uX2FwcGVuZCIsImluc2VydCIsInNlbGVjdGlvbl9pbnNlcnQiLCJzZWxlY3Rpb25fcmVtb3ZlIiwic2VsZWN0aW9uX2Nsb25lIiwic2VsZWN0aW9uX2RhdHVtIiwic2VsZWN0aW9uX29uIiwic2VsZWN0aW9uX2Rpc3BhdGNoIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJzZWxlY3Rpb25faXRlcmF0b3IiLCJmYWN0b3J5IiwiZXh0ZW5kIiwiZGVmaW5pdGlvbiIsIkNvbG9yIiwiZGFya2VyIiwiYnJpZ2h0ZXIiLCJyZUkiLCJyZU4iLCJyZVAiLCJyZUhleCIsInJlUmdiSW50ZWdlciIsIlJlZ0V4cCIsInJlUmdiUGVyY2VudCIsInJlUmdiYUludGVnZXIiLCJyZVJnYmFQZXJjZW50IiwicmVIc2xQZXJjZW50IiwicmVIc2xhUGVyY2VudCIsIm5hbWVkIiwiYWxpY2VibHVlIiwiYW50aXF1ZXdoaXRlIiwiYXF1YSIsImFxdWFtYXJpbmUiLCJhenVyZSIsImJlaWdlIiwiYmlzcXVlIiwiYmxhY2siLCJibGFuY2hlZGFsbW9uZCIsImJsdWUiLCJibHVldmlvbGV0IiwiYnJvd24iLCJidXJseXdvb2QiLCJjYWRldGJsdWUiLCJjaGFydHJldXNlIiwiY2hvY29sYXRlIiwiY29yYWwiLCJjb3JuZmxvd2VyYmx1ZSIsImNvcm5zaWxrIiwiY3JpbXNvbiIsImN5YW4iLCJkYXJrYmx1ZSIsImRhcmtjeWFuIiwiZGFya2dvbGRlbnJvZCIsImRhcmtncmF5IiwiZGFya2dyZWVuIiwiZGFya2dyZXkiLCJkYXJra2hha2kiLCJkYXJrbWFnZW50YSIsImRhcmtvbGl2ZWdyZWVuIiwiZGFya29yYW5nZSIsImRhcmtvcmNoaWQiLCJkYXJrcmVkIiwiZGFya3NhbG1vbiIsImRhcmtzZWFncmVlbiIsImRhcmtzbGF0ZWJsdWUiLCJkYXJrc2xhdGVncmF5IiwiZGFya3NsYXRlZ3JleSIsImRhcmt0dXJxdW9pc2UiLCJkYXJrdmlvbGV0IiwiZGVlcHBpbmsiLCJkZWVwc2t5Ymx1ZSIsImRpbWdyYXkiLCJkaW1ncmV5IiwiZG9kZ2VyYmx1ZSIsImZpcmVicmljayIsImZsb3JhbHdoaXRlIiwiZm9yZXN0Z3JlZW4iLCJmdWNoc2lhIiwiZ2FpbnNib3JvIiwiZ2hvc3R3aGl0ZSIsImdvbGQiLCJnb2xkZW5yb2QiLCJncmF5IiwiZ3JlZW4iLCJncmVlbnllbGxvdyIsImdyZXkiLCJob25leWRldyIsImhvdHBpbmsiLCJpbmRpYW5yZWQiLCJpbmRpZ28iLCJpdm9yeSIsImtoYWtpIiwibGF2ZW5kZXIiLCJsYXZlbmRlcmJsdXNoIiwibGF3bmdyZWVuIiwibGVtb25jaGlmZm9uIiwibGlnaHRibHVlIiwibGlnaHRjb3JhbCIsImxpZ2h0Y3lhbiIsImxpZ2h0Z29sZGVucm9keWVsbG93IiwibGlnaHRncmF5IiwibGlnaHRncmVlbiIsImxpZ2h0Z3JleSIsImxpZ2h0cGluayIsImxpZ2h0c2FsbW9uIiwibGlnaHRzZWFncmVlbiIsImxpZ2h0c2t5Ymx1ZSIsImxpZ2h0c2xhdGVncmF5IiwibGlnaHRzbGF0ZWdyZXkiLCJsaWdodHN0ZWVsYmx1ZSIsImxpZ2h0eWVsbG93IiwibGltZSIsImxpbWVncmVlbiIsImxpbmVuIiwibWFnZW50YSIsIm1hcm9vbiIsIm1lZGl1bWFxdWFtYXJpbmUiLCJtZWRpdW1ibHVlIiwibWVkaXVtb3JjaGlkIiwibWVkaXVtcHVycGxlIiwibWVkaXVtc2VhZ3JlZW4iLCJtZWRpdW1zbGF0ZWJsdWUiLCJtZWRpdW1zcHJpbmdncmVlbiIsIm1lZGl1bXR1cnF1b2lzZSIsIm1lZGl1bXZpb2xldHJlZCIsIm1pZG5pZ2h0Ymx1ZSIsIm1pbnRjcmVhbSIsIm1pc3R5cm9zZSIsIm1vY2Nhc2luIiwibmF2YWpvd2hpdGUiLCJuYXZ5Iiwib2xkbGFjZSIsIm9saXZlIiwib2xpdmVkcmFiIiwib3JhbmdlIiwib3JhbmdlcmVkIiwib3JjaGlkIiwicGFsZWdvbGRlbnJvZCIsInBhbGVncmVlbiIsInBhbGV0dXJxdW9pc2UiLCJwYWxldmlvbGV0cmVkIiwicGFwYXlhd2hpcCIsInBlYWNocHVmZiIsInBlcnUiLCJwaW5rIiwicGx1bSIsInBvd2RlcmJsdWUiLCJwdXJwbGUiLCJyZWJlY2NhcHVycGxlIiwicmVkIiwicm9zeWJyb3duIiwicm95YWxibHVlIiwic2FkZGxlYnJvd24iLCJzYWxtb24iLCJzYW5keWJyb3duIiwic2VhZ3JlZW4iLCJzZWFzaGVsbCIsInNpZW5uYSIsInNpbHZlciIsInNreWJsdWUiLCJzbGF0ZWJsdWUiLCJzbGF0ZWdyYXkiLCJzbGF0ZWdyZXkiLCJzbm93Iiwic3ByaW5nZ3JlZW4iLCJzdGVlbGJsdWUiLCJ0YW4iLCJ0ZWFsIiwidGhpc3RsZSIsInRvbWF0byIsInR1cnF1b2lzZSIsInZpb2xldCIsIndoZWF0Iiwid2hpdGUiLCJ3aGl0ZXNtb2tlIiwieWVsbG93IiwieWVsbG93Z3JlZW4iLCJkZWZpbmUiLCJjb2xvciIsImNoYW5uZWxzIiwiYXNzaWduIiwiZGlzcGxheWFibGUiLCJyZ2IiLCJoZXgiLCJjb2xvcl9mb3JtYXRIZXgiLCJmb3JtYXRIZXgiLCJmb3JtYXRIZXg4IiwiY29sb3JfZm9ybWF0SGV4OCIsImZvcm1hdEhzbCIsImNvbG9yX2Zvcm1hdEhzbCIsImZvcm1hdFJnYiIsImNvbG9yX2Zvcm1hdFJnYiIsInRvU3RyaW5nIiwiaHNsQ29udmVydCIsImZvcm1hdCIsImwiLCJ0b0xvd2VyQ2FzZSIsImV4ZWMiLCJwYXJzZUludCIsInJnYm4iLCJSZ2IiLCJyZ2JhIiwiaHNsYSIsInIiLCJnIiwicmdiQ29udmVydCIsIm9wYWNpdHkiLCJrIiwiY2xhbXAiLCJjbGFtcGkiLCJjbGFtcGEiLCJyZ2JfZm9ybWF0SGV4IiwicmdiX2Zvcm1hdEhleDgiLCJyZ2JfZm9ybWF0UmdiIiwiaXNOYU4iLCJoIiwicyIsIkhzbCIsImhzbCIsIm0yIiwiaHNsMnJnYiIsImNsYW1waCIsImNsYW1wdCIsImxpbmVhciIsImV4cG9uZW50aWFsIiwieSIsImdhbW1hIiwibm9nYW1tYSIsInJnYkdhbW1hIiwiZW5kIiwiY29sb3JSZ2IiLCJpc051bWJlckFycmF5IiwiQXJyYXlCdWZmZXIiLCJpc1ZpZXciLCJEYXRhVmlldyIsImdlbmVyaWNBcnJheSIsIm5iIiwibmEiLCJEYXRlIiwic2V0VGltZSIsInJlQSIsInJlQiIsInNvdXJjZSIsIm9uZSIsImJpIiwibGFzdEluZGV4IiwiYW0iLCJibSIsImJzIiwicSIsImluZGV4IiwiZGF0ZSIsIm51bWJlckFycmF5Iiwib2JqZWN0IiwiZGVncmVlcyIsIlBJIiwiaWRlbnRpdHkiLCJ0cmFuc2xhdGVYIiwidHJhbnNsYXRlWSIsInJvdGF0ZSIsInNrZXdYIiwic2NhbGVYIiwic2NhbGVZIiwiZSIsImF0YW4yIiwiYXRhbiIsInN2Z05vZGUiLCJwYXJzZUNzcyIsIkRPTU1hdHJpeCIsIldlYktpdENTU01hdHJpeCIsImlzSWRlbnRpdHkiLCJkZWNvbXBvc2UiLCJwYXJzZVN2ZyIsInRyYW5zZm9ybSIsImJhc2VWYWwiLCJjb25zb2xpZGF0ZSIsIm1hdHJpeCIsImludGVycG9sYXRlVHJhbnNmb3JtIiwicGFyc2UiLCJweENvbW1hIiwicHhQYXJlbiIsImRlZ1BhcmVuIiwicG9wIiwidHJhbnNsYXRlIiwieGEiLCJ5YSIsInhiIiwieWIiLCJzY2FsZSIsImludGVycG9sYXRlVHJhbnNmb3JtQ3NzIiwiaW50ZXJwb2xhdGVUcmFuc2Zvcm1TdmciLCJmcmFtZSIsInRpbWVvdXQiLCJpbnRlcnZhbCIsInBva2VEZWxheSIsInRhc2tIZWFkIiwidGFza1RhaWwiLCJjbG9ja0xhc3QiLCJjbG9ja05vdyIsImNsb2NrU2tldyIsImNsb2NrIiwicGVyZm9ybWFuY2UiLCJub3ciLCJzZXRGcmFtZSIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInNldFRpbWVvdXQiLCJjbGVhck5vdyIsIlRpbWVyIiwiX2NhbGwiLCJfdGltZSIsInRpbWVyIiwicmVzdGFydCIsImRlbGF5IiwidGltZSIsIlR5cGVFcnJvciIsInNsZWVwIiwiSW5maW5pdHkiLCJ0aW1lckZsdXNoIiwidW5kZWZpbmVkIiwid2FrZSIsIm5hcCIsInBva2UiLCJ0MCIsInQxIiwidDIiLCJjbGVhclRpbWVvdXQiLCJjbGVhckludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJlbGFwc2VkIiwiZW1wdHlPbiIsImVtcHR5VHdlZW4iLCJDUkVBVEVEIiwiU0NIRURVTEVEIiwiU1RBUlRJTkciLCJTVEFSVEVEIiwiUlVOTklORyIsIkVORElORyIsIkVOREVEIiwiaWQiLCJ0aW1pbmciLCJzY2hlZHVsZXMiLCJfX3RyYW5zaXRpb24iLCJ0d2VlbiIsImR1cmF0aW9uIiwiZWFzZSIsInN0YXRlIiwiaW5pdCIsInNjaGVkdWxlIiwic2VsZiIsInRpY2siLCJhY3RpdmUiLCJpbnRlcnJ1cHQiLCJ0d2VlblJlbW92ZSIsInR3ZWVuMCIsInR3ZWVuMSIsInR3ZWVuRnVuY3Rpb24iLCJfaWQiLCJ0d2VlblZhbHVlIiwidHJhbnNpdGlvbiIsImludGVycG9sYXRlTnVtYmVyIiwiaW50ZXJwb2xhdGVSZ2IiLCJpbnRlcnBvbGF0ZVN0cmluZyIsImludGVycG9sYXRlIiwidmFsdWUxIiwic3RyaW5nMDAiLCJzdHJpbmcxIiwiaW50ZXJwb2xhdGUwIiwic3RyaW5nMCIsInN0cmluZzEwIiwiYXR0clR3ZWVuIiwiYXR0ckludGVycG9sYXRlIiwiYXR0ckludGVycG9sYXRlTlMiLCJhdHRyVHdlZW5OUyIsIl92YWx1ZSIsImRlbGF5RnVuY3Rpb24iLCJkZWxheUNvbnN0YW50IiwiZHVyYXRpb25GdW5jdGlvbiIsImR1cmF0aW9uQ29uc3RhbnQiLCJlYXNlQ29uc3RhbnQiLCJlYXNlVmFyeWluZyIsIlRyYW5zaXRpb24iLCJfbmFtZSIsImV2ZXJ5Iiwib25GdW5jdGlvbiIsIm9uMCIsIm9uMSIsInNpdCIsInJlbW92ZUZ1bmN0aW9uIiwiaW5oZXJpdCIsInN0eWxlTnVsbCIsInN0eWxlTWF5YmVSZW1vdmUiLCJsaXN0ZW5lcjAiLCJzdHlsZVR3ZWVuIiwic3R5bGVJbnRlcnBvbGF0ZSIsInRleHRJbnRlcnBvbGF0ZSIsInRleHRUd2VlbiIsImlkMCIsImlkMSIsIm5ld0lkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjYW5jZWwiLCJzZWxlY3Rpb25fcHJvdG90eXBlIiwidHJhbnNpdGlvbl9zZWxlY3QiLCJ0cmFuc2l0aW9uX3NlbGVjdEFsbCIsInRyYW5zaXRpb25fZmlsdGVyIiwidHJhbnNpdGlvbl9tZXJnZSIsInRyYW5zaXRpb25fc2VsZWN0aW9uIiwidHJhbnNpdGlvbl90cmFuc2l0aW9uIiwidHJhbnNpdGlvbl9vbiIsInRyYW5zaXRpb25fYXR0ciIsInRyYW5zaXRpb25fYXR0clR3ZWVuIiwidHJhbnNpdGlvbl9zdHlsZSIsInRyYW5zaXRpb25fc3R5bGVUd2VlbiIsInRyYW5zaXRpb25fdGV4dCIsInRyYW5zaXRpb25fdGV4dFR3ZWVuIiwidHJhbnNpdGlvbl9yZW1vdmUiLCJ0cmFuc2l0aW9uX3R3ZWVuIiwidHJhbnNpdGlvbl9kZWxheSIsInRyYW5zaXRpb25fZHVyYXRpb24iLCJ0cmFuc2l0aW9uX2Vhc2UiLCJ0cmFuc2l0aW9uX2Vhc2VWYXJ5aW5nIiwidHJhbnNpdGlvbl9lbmQiLCJjdWJpY0luT3V0IiwiZGVmYXVsdFRpbWluZyIsImVhc2VDdWJpY0luT3V0Iiwic2VsZWN0aW9uX2ludGVycnVwdCIsInNlbGVjdGlvbl90cmFuc2l0aW9uIiwiaW5pdFJhbmdlIiwiZG9tYWluIiwiaW1wbGljaXQiLCJvcmRpbmFsIiwidW5rbm93biIsImJhbmQiLCJvcmRpbmFsUmFuZ2UiLCJyMCIsInIxIiwiYmFuZHdpZHRoIiwicGFkZGluZ0lubmVyIiwicGFkZGluZ091dGVyIiwiYWxpZ24iLCJyZXNjYWxlIiwidmFsdWVzIiwic2VxdWVuY2UiLCJyYW5nZVJvdW5kIiwicGFkZGluZyIsImNvbnN0YW50cyIsInVuaXQiLCJub3JtYWxpemUiLCJjbGFtcGVyIiwiYmltYXAiLCJkMCIsImQxIiwicG9seW1hcCIsImJpc2VjdCIsInRhcmdldCIsInRyYW5zZm9ybWVyIiwiaW50ZXJwb2xhdGVWYWx1ZSIsInVudHJhbnNmb3JtIiwicGllY2V3aXNlIiwib3V0cHV0IiwiaW5wdXQiLCJpbnZlcnQiLCJpbnRlcnBvbGF0ZVJvdW5kIiwidSIsImNvbnRpbnVvdXMiLCJuaWNlIiwieDAiLCJ4MSIsInRpbWVJbnRlcnZhbCIsImZsb29yaSIsIm9mZnNldGkiLCJmaWVsZCIsIm9mZnNldCIsImlzRmluaXRlIiwibWlsbGlzZWNvbmQiLCJkdXJhdGlvblNlY29uZCIsImR1cmF0aW9uTWludXRlIiwiZHVyYXRpb25Ib3VyIiwiZHVyYXRpb25EYXkiLCJkdXJhdGlvbldlZWsiLCJkdXJhdGlvbk1vbnRoIiwiZHVyYXRpb25ZZWFyIiwic2Vjb25kIiwiZ2V0TWlsbGlzZWNvbmRzIiwiZ2V0VVRDU2Vjb25kcyIsInRpbWVNaW51dGUiLCJnZXRTZWNvbmRzIiwiZ2V0TWludXRlcyIsInV0Y01pbnV0ZSIsInNldFVUQ1NlY29uZHMiLCJnZXRVVENNaW51dGVzIiwidGltZUhvdXIiLCJnZXRIb3VycyIsInV0Y0hvdXIiLCJzZXRVVENNaW51dGVzIiwiZ2V0VVRDSG91cnMiLCJ0aW1lRGF5Iiwic2V0SG91cnMiLCJzZXREYXRlIiwiZ2V0RGF0ZSIsImdldFRpbWV6b25lT2Zmc2V0IiwidXRjRGF5Iiwic2V0VVRDSG91cnMiLCJzZXRVVENEYXRlIiwiZ2V0VVRDRGF0ZSIsInVuaXhEYXkiLCJ0aW1lV2Vla2RheSIsImdldERheSIsInRpbWVTdW5kYXkiLCJ0aW1lTW9uZGF5IiwidGltZVR1ZXNkYXkiLCJ0aW1lV2VkbmVzZGF5IiwidGltZVRodXJzZGF5IiwidGltZUZyaWRheSIsInRpbWVTYXR1cmRheSIsInV0Y1dlZWtkYXkiLCJnZXRVVENEYXkiLCJ1dGNTdW5kYXkiLCJ1dGNNb25kYXkiLCJ1dGNUdWVzZGF5IiwidXRjV2VkbmVzZGF5IiwidXRjVGh1cnNkYXkiLCJ1dGNGcmlkYXkiLCJ1dGNTYXR1cmRheSIsInRpbWVNb250aCIsInNldE1vbnRoIiwiZ2V0TW9udGgiLCJnZXRGdWxsWWVhciIsInV0Y01vbnRoIiwic2V0VVRDTW9udGgiLCJnZXRVVENNb250aCIsImdldFVUQ0Z1bGxZZWFyIiwidGltZVllYXIiLCJzZXRGdWxsWWVhciIsInV0Y1llYXIiLCJzZXRVVENGdWxsWWVhciIsInRpY2tlciIsInllYXIiLCJtb250aCIsIndlZWsiLCJkYXkiLCJob3VyIiwibWludXRlIiwidGlja0ludGVydmFscyIsInRpY2tzIiwidGlja0ludGVydmFsIiwiYWJzIiwidGltZVRpY2tzIiwidGltZVRpY2tJbnRlcnZhbCIsImxvY2FsRGF0ZSIsIkgiLCJNIiwiUyIsIkwiLCJ1dGNEYXRlIiwiVVRDIiwibmV3RGF0ZSIsImZvcm1hdExvY2FsZSIsImxvY2FsZSIsImxvY2FsZV9kYXRlVGltZSIsImRhdGVUaW1lIiwibG9jYWxlX2RhdGUiLCJsb2NhbGVfdGltZSIsImxvY2FsZV9wZXJpb2RzIiwicGVyaW9kcyIsImxvY2FsZV93ZWVrZGF5cyIsImRheXMiLCJsb2NhbGVfc2hvcnRXZWVrZGF5cyIsInNob3J0RGF5cyIsImxvY2FsZV9tb250aHMiLCJtb250aHMiLCJsb2NhbGVfc2hvcnRNb250aHMiLCJzaG9ydE1vbnRocyIsInBlcmlvZFJlIiwiZm9ybWF0UmUiLCJwZXJpb2RMb29rdXAiLCJmb3JtYXRMb29rdXAiLCJ3ZWVrZGF5UmUiLCJ3ZWVrZGF5TG9va3VwIiwic2hvcnRXZWVrZGF5UmUiLCJzaG9ydFdlZWtkYXlMb29rdXAiLCJtb250aFJlIiwibW9udGhMb29rdXAiLCJzaG9ydE1vbnRoUmUiLCJzaG9ydE1vbnRoTG9va3VwIiwiZm9ybWF0cyIsImZvcm1hdFNob3J0V2Vla2RheSIsImZvcm1hdFdlZWtkYXkiLCJmb3JtYXRTaG9ydE1vbnRoIiwiZm9ybWF0TW9udGgiLCJmb3JtYXREYXlPZk1vbnRoIiwiZm9ybWF0TWljcm9zZWNvbmRzIiwiZm9ybWF0WWVhcklTTyIsImZvcm1hdEZ1bGxZZWFySVNPIiwiZm9ybWF0SG91cjI0IiwiZm9ybWF0SG91cjEyIiwiZm9ybWF0RGF5T2ZZZWFyIiwiZm9ybWF0TWlsbGlzZWNvbmRzIiwiZm9ybWF0TW9udGhOdW1iZXIiLCJmb3JtYXRNaW51dGVzIiwiZm9ybWF0UGVyaW9kIiwiZm9ybWF0UXVhcnRlciIsImZvcm1hdFVuaXhUaW1lc3RhbXAiLCJmb3JtYXRVbml4VGltZXN0YW1wU2Vjb25kcyIsImZvcm1hdFNlY29uZHMiLCJmb3JtYXRXZWVrZGF5TnVtYmVyTW9uZGF5IiwiZm9ybWF0V2Vla051bWJlclN1bmRheSIsImZvcm1hdFdlZWtOdW1iZXJJU08iLCJmb3JtYXRXZWVrZGF5TnVtYmVyU3VuZGF5IiwiZm9ybWF0V2Vla051bWJlck1vbmRheSIsImZvcm1hdFllYXIiLCJmb3JtYXRGdWxsWWVhciIsImZvcm1hdFpvbmUiLCJmb3JtYXRMaXRlcmFsUGVyY2VudCIsInV0Y0Zvcm1hdHMiLCJmb3JtYXRVVENTaG9ydFdlZWtkYXkiLCJmb3JtYXRVVENXZWVrZGF5IiwiZm9ybWF0VVRDU2hvcnRNb250aCIsImZvcm1hdFVUQ01vbnRoIiwiZm9ybWF0VVRDRGF5T2ZNb250aCIsImZvcm1hdFVUQ01pY3Jvc2Vjb25kcyIsImZvcm1hdFVUQ1llYXJJU08iLCJmb3JtYXRVVENGdWxsWWVhcklTTyIsImZvcm1hdFVUQ0hvdXIyNCIsImZvcm1hdFVUQ0hvdXIxMiIsImZvcm1hdFVUQ0RheU9mWWVhciIsImZvcm1hdFVUQ01pbGxpc2Vjb25kcyIsImZvcm1hdFVUQ01vbnRoTnVtYmVyIiwiZm9ybWF0VVRDTWludXRlcyIsImZvcm1hdFVUQ1BlcmlvZCIsImZvcm1hdFVUQ1F1YXJ0ZXIiLCJmb3JtYXRVVENTZWNvbmRzIiwiZm9ybWF0VVRDV2Vla2RheU51bWJlck1vbmRheSIsImZvcm1hdFVUQ1dlZWtOdW1iZXJTdW5kYXkiLCJmb3JtYXRVVENXZWVrTnVtYmVySVNPIiwiZm9ybWF0VVRDV2Vla2RheU51bWJlclN1bmRheSIsImZvcm1hdFVUQ1dlZWtOdW1iZXJNb25kYXkiLCJmb3JtYXRVVENZZWFyIiwiZm9ybWF0VVRDRnVsbFllYXIiLCJmb3JtYXRVVENab25lIiwicGFyc2VzIiwicGFyc2VTaG9ydFdlZWtkYXkiLCJwYXJzZVdlZWtkYXkiLCJwYXJzZVNob3J0TW9udGgiLCJwYXJzZU1vbnRoIiwicGFyc2VMb2NhbGVEYXRlVGltZSIsInBhcnNlRGF5T2ZNb250aCIsInBhcnNlTWljcm9zZWNvbmRzIiwicGFyc2VZZWFyIiwicGFyc2VGdWxsWWVhciIsInBhcnNlSG91cjI0IiwicGFyc2VEYXlPZlllYXIiLCJwYXJzZU1pbGxpc2Vjb25kcyIsInBhcnNlTW9udGhOdW1iZXIiLCJwYXJzZU1pbnV0ZXMiLCJwYXJzZVBlcmlvZCIsInBhcnNlUXVhcnRlciIsInBhcnNlVW5peFRpbWVzdGFtcCIsInBhcnNlVW5peFRpbWVzdGFtcFNlY29uZHMiLCJwYXJzZVNlY29uZHMiLCJwYXJzZVdlZWtkYXlOdW1iZXJNb25kYXkiLCJwYXJzZVdlZWtOdW1iZXJTdW5kYXkiLCJwYXJzZVdlZWtOdW1iZXJJU08iLCJwYXJzZVdlZWtkYXlOdW1iZXJTdW5kYXkiLCJwYXJzZVdlZWtOdW1iZXJNb25kYXkiLCJwYXJzZUxvY2FsZURhdGUiLCJwYXJzZUxvY2FsZVRpbWUiLCJwYXJzZVpvbmUiLCJwYXJzZUxpdGVyYWxQZXJjZW50IiwibmV3Rm9ybWF0IiwiWCIsInNwZWNpZmllciIsInBhZCIsImNoYXJDb2RlQXQiLCJwYWRzIiwiY2hhckF0IiwibmV3UGFyc2UiLCJaIiwicGFyc2VTcGVjaWZpZXIiLCJRIiwicCIsIlYiLCJ3IiwiVyIsIlUiLCJ1dGNGb3JtYXQiLCJ1dGNQYXJzZSIsIm51bWJlclJlIiwicGVyY2VudFJlIiwicmVxdW90ZVJlIiwiZmlsbCIsIndpZHRoIiwic2lnbiIsInJlcXVvdGUiLCJyZXBsYWNlIiwiZElTTyIsInoiLCJnZXRVVENNaWxsaXNlY29uZHMiLCJkb3ciLCJVVENkSVNPIiwidGltZUZvcm1hdCIsImRlZmF1bHRMb2NhbGUiLCJjYWxlbmRhciIsImZvcm1hdE1pbGxpc2Vjb25kIiwiZm9ybWF0U2Vjb25kIiwiZm9ybWF0TWludXRlIiwiZm9ybWF0SG91ciIsImZvcm1hdERheSIsImZvcm1hdFdlZWsiLCJ0aWNrRm9ybWF0IiwidGltZVdlZWsiLCJ0aW1lU2Vjb25kIiwiVHJhbnNmb3JtIiwicG9pbnQiLCJhcHBseVgiLCJhcHBseVkiLCJsb2NhdGlvbiIsImludmVydFgiLCJpbnZlcnRZIiwicmVzY2FsZVgiLCJyZXNjYWxlWSIsImQzLnNlbGVjdCIsImQzLnNjYWxlVGltZSIsImQzLnNjYWxlQmFuZCIsImQzLnRpbWVGb3JtYXQiXSwibWFwcGluZ3MiOiI7O0FBQWUsU0FBU0EsV0FBU0EsQ0FBQ0MsQ0FBQyxFQUFFQyxDQUFDLEVBQUU7QUFDdEMsRUFBQSxPQUFPRCxDQUFDLElBQUksSUFBSSxJQUFJQyxDQUFDLElBQUksSUFBSSxHQUFHQyxHQUFHLEdBQUdGLENBQUMsR0FBR0MsQ0FBQyxHQUFHLENBQUMsQ0FB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LFFBQVE7QUFDaEJDLEVBQUFBLEtBQUssRUFBRSxRQUFRO0FBQ2ZDLEVBQUFBLGNBQWMsRUFBRSxRQUFRO0FBQ3hCQyxFQUFBQSxJQUFJLEVBQUUsUUFBUTtBQUNkQyxFQUFBQSxVQUFVLEVBQUUsUUFBUTtBQUNwQkMsRUFBQUEsS0FBSyxFQUFFLFFBQVE7QUFDZkMsRUFBQUEsU0FBUyxFQUFFLFFBQVE7QUFDbkJDLEVBQUFBLFNBQVMsRUFBRSxRQUFRO0FBQ25CQyxFQUFBQSxVQUFVLEVBQUUsUUFBUTtBQUNwQkMsRUFBQUEsU0FBUyxFQUFFLFFBQVE7QUFDbkJDLEVBQUFBLEtBQUssRUFBRSxRQUFRO0FBQ2ZDLEVBQUFBLGNBQWMsRUFBRSxRQUFRO0FBQ3hCQyxFQUFBQSxRQUFRLEVBQUUsUUFBUTtBQUNsQkMsRUFBQUEsT0FBTyxFQUFFLFFBQVE7QUFDakJDLEVBQUFBLElBQUksRUFBRSxRQUFRO0FBQ2RDLEVBQUFBLFFBQVEsRUFBRSxRQUFRO0FBQ2xCQyxFQUFBQSxRQUFRLEVBQUUsUUFBUTtBQUNsQkMsRUFBQUEsYUFBYSxFQUFFLFFBQVE7QUFDdkJDLEVBQUFBLFFBQVEsRUFBRSxRQUFRO0FBQ2xCQyxFQUFBQSxTQUFTLEVBQUUsUUFBUTtBQUNuQkMsRUFBQUEsUUFBUSxFQUFFLFFBQVE7QUFDbEJDLEVBQUFBLFNBQVMsRUFBRSxRQUFRO0FBQ25CQyxFQUFBQSxXQUFXLEVBQUUsUUFBUTtBQUNyQkMsRUFBQUEsY0FBYyxFQUFFLFFBQVE7QUFDeEJDLEVBQUFBLFVBQVUsRUFBRSxRQUFRO0FBQ3BCQyxFQUFBQSxVQUFVLEVBQUUsUUFBUTtBQUNwQkMsRUFBQUEsT0FBTyxFQUFFLFFBQVE7QUFDakJDLEVBQUFBLFVBQVUsRUFBRSxRQUFRO0FBQ3BCQyxFQUFBQSxZQUFZLEVBQUUsUUFBUTtBQUN0QkMsRUFBQUEsYUFBYSxFQUFFLFFBQVE7QUFDdkJDLEVBQUFBLGFBQWEsRUFBRSxRQUFRO0FBQ3ZCQyxFQUFBQSxhQUFhLEVBQUUsUUFBUTtBQUN2QkMsRUFBQUEsYUFBYSxFQUFFLFFBQVE7QUFD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QUFLLEVBQUUsUUFBUTtBQUNmQyxFQUFBQSxTQUFTLEVBQUUsUUFBUTtBQUNuQkMsRUFBQUEsTUFBTSxFQUFFLFFBQVE7QUFDaEJDLEVBQUFBLFNBQVMsRUFBRSxRQUFRO0FBQ25CQyxFQUFBQSxNQUFNLEVBQUUsUUFBUTtBQUNoQkMsRUFBQUEsYUFBYSxFQUFFLFFBQVE7QUFDdkJDLEVBQUFBLFNBQVMsRUFBRSxRQUFRO0FBQ25CQyxFQUFBQSxhQUFhLEVBQUUsUUFBUTtBQUN2QkMsRUFBQUEsYUFBYSxFQUFFLFFBQVE7QUFDdkJDLEVBQUFBLFVBQVUsRUFBRSxRQUFRO0FBQ3BCQyxFQUFBQSxTQUFTLEVBQUUsUUFBUTtBQUNuQkMsRUFBQUEsSUFBSSxFQUFFLFFBQVE7QUFDZEMsRUFBQUEsSUFBSSxFQUFFLFFBQVE7QUFDZEMsRUFBQUEsSUFBSSxFQUFFLFFBQVE7QUFDZEMsRUFBQUEsVUFBVSxFQUFFLFFBQVE7QUFDcEJDLEVBQUFBLE1BQU0sRUFBRSxRQUFRO0FBQ2hCQyxFQUFBQSxhQUFhLEVBQUUsUUFBUTtBQUN2QkMsRUFBQUEsR0FBRyxFQUFFLFFBQVE7QUFDYkMsRUFBQUEsU0FBUyxFQUFFLFFBQVE7QUFDbkJDLEVBQUFBLFNBQVMsRUFBRSxRQUFRO0FBQ25CQyxFQUFBQSxXQUFXLEVBQUUsUUFBUTtBQUNyQkMsRUFBQUEsTUFBTSxFQUFFLFFBQVE7QUFDaEJDLEVBQUFBLFVBQVUsRUFBRSxRQUFRO0FBQ3BCQyxFQUFBQSxRQUFRLEVBQUUsUUFBUTtBQUNsQkMsRUFBQUEsUUFBUSxFQUFFLFFBQVE7QUFDbEJDLEVBQUFBLE1BQU0sRUFBRSxRQUFRO0FBQ2hCQyxFQUFBQSxNQUFNLEVBQUUsUUFBUTtBQUNoQkMsRUFBQUEsT0FBTyxFQUFFLFFBQVE7QUFDakJDLEVBQUFBLFNBQVMsRUFBRSxRQUFRO0FBQ25CQyxFQUFBQSxTQUFTLEVBQUUsUUFBUTtBQUNuQkMsRUFBQUEsU0FBUyxFQUFFLFFBQVE7QUFDbkJDLEVBQUFBLElBQUksRUFBRSxRQUFRO0FBQ2RDLEVBQUFBLFdBQVcsRUFBRSxR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QyxXQUFXLEVBQUE7d0JBQzlDLGFBQU0sQ0FBQSxNQUFBLEVBQUEsRUFBQSxDQUFDLEVBQUMsR0FBRyxFQUFDLENBQUMsRUFBQyxHQUFHLEVBQUMsS0FBSyxFQUFDLElBQUksRUFBQyxNQUFNLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBQyxHQUFHLEVBQUMsU0FBUyxFQUFDLGNBQWMsRUFBQSxDQUFFLENBQ3hFO0FBQ04sb0JBQUEsYUFBQSxDQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsa0JBQUEsQ0FBNkIsQ0FDM0I7QUFDTCxnQkFBQSxTQUFTLEtBQ04sYUFBSyxDQUFBLEtBQUEsRUFBQSxFQUFBLFNBQVMsRUFBQyxhQUFhLEVBQUE7QUFDeEIsb0JBQUEsYUFBQSxDQUFBLEtBQUEsRUFBQSxFQUFLLFNBQVMsRUFBQyxlQUFlLEVBQUMsT0FBTyxFQUFDLFdBQVcsRUFBQTtBQUM5Qyx3QkFBQSxhQUFBLENBQUEsUUFBQSxFQUFBLEVBQVEsRUFBRSxFQUFDLElBQUksRUFBQyxFQUFFLEVBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxHQUFHLEVBQUMsU0FBUyxFQUFDLGNBQWMsR0FBRSxDQUN0RDtvQkFDTixhQUF5QixDQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsY0FBQSxDQUFBLENBQ3ZCLENBQ1QsQ0FDQyxDQUNUO0FBRUQsWUFBQSxhQUFBLENBQUEsS0FBQSxFQUFBLEVBQUssR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUMsT0FBTyxFQUFDLEtBQUssRUFBRSxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsR0FBUSxDQUM3RCxDQUNKLEVBQ1I7QUFDTjs7OzsiLCJ4X2dvb2dsZV9pZ25vcmVMaXN0IjpbMCwxLDIsMyw0LDUsNiw3LDgsOSwxMCwxMSwxMiwxMywxNCwxNSwxNiwxNywxOCwxOSwyMCwyMSwyMiwyMywyNCwyNSwyNiwyNywyOCwyOSwzMCwzMSwzMiwzMywzNCwzNSwzNiwzNywzOCwzOSw0MCw0MSw0Miw0Myw0NCw0NSw0Niw0Nyw0OCw0OSw1MCw1MSw1Miw1Myw1NCw1NSw1Niw1Nyw1OCw1OSw2MCw2MSw2Miw2Myw2NCw2NSw2Niw2Nyw2OCw2OSw3MCw3MSw3Miw3Myw3NCw3NSw3Niw3Nyw3OCw3OSw4MCw4MSw4Miw4Myw4NCw4NSw4Niw4Nyw4OCw4OSw5MCw5MSw5Miw5Myw5NCw5NSw5Niw5Nyw5OCw5OSwxMDAsMTAxLDEwMiwxMDMsMTA0LDEwNSwxMDYsMTA3LDEwOCwxMDksMTEwLDExMSwxMTIsMTEzLDExNCwxMTUsMTE2LDExNywxMTgsMTE5LDEyMCwxMjEsMTIyXX0=
