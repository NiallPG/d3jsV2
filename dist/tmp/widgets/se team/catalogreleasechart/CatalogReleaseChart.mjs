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

// Theme colors
const lightTheme = {
    background: "#ffffff",
    text: "#333333",
    primary: "#2c5282",
    secondary: "#757575",
    accent: "#ff9800",
    success: "#8bc34a",
    muted: "#9e9e9e",
    border: "#e0e0e0"
};
const darkTheme = {
    background: "#010028",
    text: "#ffffff",
    primary: "#00cbd3",
    secondary: "#9b9ca4",
    accent: "#00cbd3",
    success: "#00cbd3",
    muted: "#9b9ca4",
    border: "#23233b"
};
function CatalogReleaseChart(props) {
    const { name, catalogData, nameAttribute, retiredDateAttribute, currentDateAttribute, upcomingCodeAttribute, chartTitle, enableLegend, onItemClick, refreshInterval, chartHeight, showToday, useDarkMode } = props;
    const theme = useDarkMode ? darkTheme : lightTheme;
    const chartRef = useRef(null);
    // Points to the div where the D3.js chart will be rendered. 
    // D3 needs direct DOM access to create SVG elements, so this ref 
    // provides a stable reference to the chart container.
    const containerRef = useRef(null); // Refs don't trigger re-renders when changed
    // Points to the outer container div. Used to measure the widget's 
    // available width for responsive sizing.
    const [dimensions, setDimensions] = useState({ width: 0, height: chartHeight });
    // State to hold the dimensions of the chart, stuff is calculated dynamically
    // so width is just a placeholder until the first resize.
    const [industries, setIndustries] = useState([]);
    // State to hold the processed industry data from the Mendix data source.
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
                .attr("fill", theme.primary);
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
                const retiredMarker = svg.append("circle")
                    .attr("class", "retired-marker")
                    .attr("cx", retiredX)
                    .attr("cy", y)
                    .attr("r", 8)
                    .attr("fill", theme.primary)
                    .style("cursor", onItemClick ? "pointer" : "default");
                if (onItemClick) {
                    retiredMarker.on("click", () => onItemClick.execute());
                }
            }
            // Current marker (diamond)
            if (industry.current) {
                const currentX = timeScale(industry.current);
                const currentMarker = svg.append("circle")
                    .attr("class", "current-marker")
                    .attr("cx", currentX)
                    .attr("cy", y)
                    .attr("r", 8)
                    .attr("fill", theme.primary)
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
    }, [dimensions, industries, showToday, onItemClick, theme]);
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
    return (createElement("div", { className: "catalog-release-chart", "data-theme": useDarkMode ? "dark" : "light" },
        createElement("div", { className: "chart-container", ref: containerRef },
            chartTitle && createElement("h1", { className: "chart-title" }, chartTitle),
            enableLegend && (createElement("div", { className: "legend" },
                createElement("div", { className: "legend-item" },
                    createElement("svg", { className: "legend-symbol", width: "20", height: "20", viewBox: "0 0 20 20" },
                        createElement("circle", { cx: "10", cy: "10", r: "8", className: "retired-marker" })),
                    createElement("span", null, "Retired")),
                createElement("div", { className: "legend-item" },
                    createElement("svg", { className: "legend-symbol", width: "20", height: "20", viewBox: "0 0 20 20" },
                        createElement("circle", { cx: "10", cy: "10", r: "8", className: "current-marker" })),
                    createElement("span", null, "Current")),
                createElement("div", { className: "legend-item" },
                    createElement("svg", { className: "legend-symbol", width: "32", height: "20", viewBox: "0 0 32 20" },
                        createElement("rect", { x: "2", y: "2", width: "28", height: "16", rx: "4", className: "upcoming-box" })),
                    createElement("span", null, "Upcoming")),
                showToday && (createElement("div", { className: "legend-item" },
                    createElement("svg", { className: "legend-symbol", width: "20", height: "20", viewBox: "0 0 20 20" },
                        createElement("circle", { cx: "10", cy: "10", r: "8", className: "today-circle" })),
                    createElement("span", null, "Today"))))),
            createElement("div", { id: "chart", ref: chartRef }))));
}

export { CatalogReleaseChart };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2F0YWxvZ1JlbGVhc2VDaGFydC5tanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvYXNjZW5kaW5nLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9kZXNjZW5kaW5nLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9iaXNlY3Rvci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbnVtYmVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9iaXNlY3QuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvaW50ZXJubWFwL3NyYy9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvdGlja3MuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3JhbmdlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWRpc3BhdGNoL3NyYy9kaXNwYXRjaC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL25hbWVzcGFjZXMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9uYW1lc3BhY2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9jcmVhdG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0b3IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvYXJyYXkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3RvckFsbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3RBbGwuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9tYXRjaGVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkcmVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2ZpbHRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zcGFyc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZW50ZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9jb25zdGFudC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXRhLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2V4aXQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vam9pbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9tZXJnZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vcmRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zb3J0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2NhbGwuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZXMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zaXplLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VtcHR5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VhY2guanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vYXR0ci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3dpbmRvdy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zdHlsZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9wcm9wZXJ0eS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbGFzc2VkLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3RleHQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaHRtbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yYWlzZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9sb3dlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hcHBlbmQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5zZXJ0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3JlbW92ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbG9uZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXR1bS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kaXNwYXRjaC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pdGVyYXRvci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1jb2xvci9zcmMvZGVmaW5lLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9jb2xvci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvY29uc3RhbnQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2NvbG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9yZ2IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL251bWJlckFycmF5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9hcnJheS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvZGF0ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvbnVtYmVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9vYmplY3QuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3N0cmluZy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdmFsdWUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3JvdW5kLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy90cmFuc2Zvcm0vZGVjb21wb3NlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy90cmFuc2Zvcm0vcGFyc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZXIvc3JjL3RpbWVvdXQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zY2hlZHVsZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9pbnRlcnJ1cHQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL2ludGVycnVwdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3R3ZWVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW50ZXJwb2xhdGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9hdHRyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vYXR0clR3ZWVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZGVsYXkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9kdXJhdGlvbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2Vhc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9lYXNlVmFyeWluZy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2ZpbHRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL21lcmdlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vb24uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9yZW1vdmUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3QuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3RBbGwuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3Rpb24uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zdHlsZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlVHdlZW4uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi90ZXh0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdGV4dFR3ZWVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHJhbnNpdGlvbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2VuZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL2N1YmljLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi90cmFuc2l0aW9uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvaW5pdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvb3JkaW5hbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvYmFuZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvY29uc3RhbnQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL251bWJlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvY29udGludW91cy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvbmljZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9pbnRlcnZhbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9taWxsaXNlY29uZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9kdXJhdGlvbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9zZWNvbmQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvbWludXRlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL2hvdXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvZGF5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL3dlZWsuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvbW9udGguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMveWVhci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy90aWNrcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lLWZvcm1hdC9zcmMvbG9jYWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUtZm9ybWF0L3NyYy9kZWZhdWx0TG9jYWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy90aW1lLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXpvb20vc3JjL3RyYW5zZm9ybS5qcyIsIi4uLy4uLy4uLy4uLy4uL3NyYy9DYXRhbG9nUmVsZWFzZUNoYXJ0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICByZXR1cm4gYSA9PSBudWxsIHx8IGIgPT0gbnVsbCA/IE5hTiA6IGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiBhID49IGIgPyAwIDogTmFOO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhID09IG51bGwgfHwgYiA9PSBudWxsID8gTmFOXG4gICAgOiBiIDwgYSA/IC0xXG4gICAgOiBiID4gYSA/IDFcbiAgICA6IGIgPj0gYSA/IDBcbiAgICA6IE5hTjtcbn1cbiIsImltcG9ydCBhc2NlbmRpbmcgZnJvbSBcIi4vYXNjZW5kaW5nLmpzXCI7XG5pbXBvcnQgZGVzY2VuZGluZyBmcm9tIFwiLi9kZXNjZW5kaW5nLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJpc2VjdG9yKGYpIHtcbiAgbGV0IGNvbXBhcmUxLCBjb21wYXJlMiwgZGVsdGE7XG5cbiAgLy8gSWYgYW4gYWNjZXNzb3IgaXMgc3BlY2lmaWVkLCBwcm9tb3RlIGl0IHRvIGEgY29tcGFyYXRvci4gSW4gdGhpcyBjYXNlIHdlXG4gIC8vIGNhbiB0ZXN0IHdoZXRoZXIgdGhlIHNlYXJjaCB2YWx1ZSBpcyAoc2VsZi0pIGNvbXBhcmFibGUuIFdlIGNhbuKAmXQgZG8gdGhpc1xuICAvLyBmb3IgYSBjb21wYXJhdG9yIChleGNlcHQgZm9yIHNwZWNpZmljLCBrbm93biBjb21wYXJhdG9ycykgYmVjYXVzZSB3ZSBjYW7igJl0XG4gIC8vIHRlbGwgaWYgdGhlIGNvbXBhcmF0b3IgaXMgc3ltbWV0cmljLCBhbmQgYW4gYXN5bW1ldHJpYyBjb21wYXJhdG9yIGNhbuKAmXQgYmVcbiAgLy8gdXNlZCB0byB0ZXN0IHdoZXRoZXIgYSBzaW5nbGUgdmFsdWUgaXMgY29tcGFyYWJsZS5cbiAgaWYgKGYubGVuZ3RoICE9PSAyKSB7XG4gICAgY29tcGFyZTEgPSBhc2NlbmRpbmc7XG4gICAgY29tcGFyZTIgPSAoZCwgeCkgPT4gYXNjZW5kaW5nKGYoZCksIHgpO1xuICAgIGRlbHRhID0gKGQsIHgpID0+IGYoZCkgLSB4O1xuICB9IGVsc2Uge1xuICAgIGNvbXBhcmUxID0gZiA9PT0gYXNjZW5kaW5nIHx8IGYgPT09IGRlc2NlbmRpbmcgPyBmIDogemVybztcbiAgICBjb21wYXJlMiA9IGY7XG4gICAgZGVsdGEgPSBmO1xuICB9XG5cbiAgZnVuY3Rpb24gbGVmdChhLCB4LCBsbyA9IDAsIGhpID0gYS5sZW5ndGgpIHtcbiAgICBpZiAobG8gPCBoaSkge1xuICAgICAgaWYgKGNvbXBhcmUxKHgsIHgpICE9PSAwKSByZXR1cm4gaGk7XG4gICAgICBkbyB7XG4gICAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgICAgaWYgKGNvbXBhcmUyKGFbbWlkXSwgeCkgPCAwKSBsbyA9IG1pZCArIDE7XG4gICAgICAgIGVsc2UgaGkgPSBtaWQ7XG4gICAgICB9IHdoaWxlIChsbyA8IGhpKTtcbiAgICB9XG4gICAgcmV0dXJuIGxvO1xuICB9XG5cbiAgZnVuY3Rpb24gcmlnaHQoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgaWYgKGxvIDwgaGkpIHtcbiAgICAgIGlmIChjb21wYXJlMSh4LCB4KSAhPT0gMCkgcmV0dXJuIGhpO1xuICAgICAgZG8ge1xuICAgICAgICBjb25zdCBtaWQgPSAobG8gKyBoaSkgPj4+IDE7XG4gICAgICAgIGlmIChjb21wYXJlMihhW21pZF0sIHgpIDw9IDApIGxvID0gbWlkICsgMTtcbiAgICAgICAgZWxzZSBoaSA9IG1pZDtcbiAgICAgIH0gd2hpbGUgKGxvIDwgaGkpO1xuICAgIH1cbiAgICByZXR1cm4gbG87XG4gIH1cblxuICBmdW5jdGlvbiBjZW50ZXIoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgY29uc3QgaSA9IGxlZnQoYSwgeCwgbG8sIGhpIC0gMSk7XG4gICAgcmV0dXJuIGkgPiBsbyAmJiBkZWx0YShhW2kgLSAxXSwgeCkgPiAtZGVsdGEoYVtpXSwgeCkgPyBpIC0gMSA6IGk7XG4gIH1cblxuICByZXR1cm4ge2xlZnQsIGNlbnRlciwgcmlnaHR9O1xufVxuXG5mdW5jdGlvbiB6ZXJvKCkge1xuICByZXR1cm4gMDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG51bWJlcih4KSB7XG4gIHJldHVybiB4ID09PSBudWxsID8gTmFOIDogK3g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiogbnVtYmVycyh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgKHZhbHVlID0gK3ZhbHVlKSA+PSB2YWx1ZSkge1xuICAgICAgICB5aWVsZCB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAoKHZhbHVlID0gdmFsdWVvZih2YWx1ZSwgKytpbmRleCwgdmFsdWVzKSkgIT0gbnVsbCAmJiAodmFsdWUgPSArdmFsdWUpID49IHZhbHVlKSB7XG4gICAgICAgIHlpZWxkIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IGFzY2VuZGluZyBmcm9tIFwiLi9hc2NlbmRpbmcuanNcIjtcbmltcG9ydCBiaXNlY3RvciBmcm9tIFwiLi9iaXNlY3Rvci5qc1wiO1xuaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxuY29uc3QgYXNjZW5kaW5nQmlzZWN0ID0gYmlzZWN0b3IoYXNjZW5kaW5nKTtcbmV4cG9ydCBjb25zdCBiaXNlY3RSaWdodCA9IGFzY2VuZGluZ0Jpc2VjdC5yaWdodDtcbmV4cG9ydCBjb25zdCBiaXNlY3RMZWZ0ID0gYXNjZW5kaW5nQmlzZWN0LmxlZnQ7XG5leHBvcnQgY29uc3QgYmlzZWN0Q2VudGVyID0gYmlzZWN0b3IobnVtYmVyKS5jZW50ZXI7XG5leHBvcnQgZGVmYXVsdCBiaXNlY3RSaWdodDtcbiIsImV4cG9ydCBjbGFzcyBJbnRlcm5NYXAgZXh0ZW5kcyBNYXAge1xuICBjb25zdHJ1Y3RvcihlbnRyaWVzLCBrZXkgPSBrZXlvZikge1xuICAgIHN1cGVyKCk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge19pbnRlcm46IHt2YWx1ZTogbmV3IE1hcCgpfSwgX2tleToge3ZhbHVlOiBrZXl9fSk7XG4gICAgaWYgKGVudHJpZXMgIT0gbnVsbCkgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgZW50cmllcykgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gIH1cbiAgZ2V0KGtleSkge1xuICAgIHJldHVybiBzdXBlci5nZXQoaW50ZXJuX2dldCh0aGlzLCBrZXkpKTtcbiAgfVxuICBoYXMoa2V5KSB7XG4gICAgcmV0dXJuIHN1cGVyLmhhcyhpbnRlcm5fZ2V0KHRoaXMsIGtleSkpO1xuICB9XG4gIHNldChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLnNldChpbnRlcm5fc2V0KHRoaXMsIGtleSksIHZhbHVlKTtcbiAgfVxuICBkZWxldGUoa2V5KSB7XG4gICAgcmV0dXJuIHN1cGVyLmRlbGV0ZShpbnRlcm5fZGVsZXRlKHRoaXMsIGtleSkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbnRlcm5TZXQgZXh0ZW5kcyBTZXQge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZXMsIGtleSA9IGtleW9mKSB7XG4gICAgc3VwZXIoKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7X2ludGVybjoge3ZhbHVlOiBuZXcgTWFwKCl9LCBfa2V5OiB7dmFsdWU6IGtleX19KTtcbiAgICBpZiAodmFsdWVzICE9IG51bGwpIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB0aGlzLmFkZCh2YWx1ZSk7XG4gIH1cbiAgaGFzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmhhcyhpbnRlcm5fZ2V0KHRoaXMsIHZhbHVlKSk7XG4gIH1cbiAgYWRkKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmFkZChpbnRlcm5fc2V0KHRoaXMsIHZhbHVlKSk7XG4gIH1cbiAgZGVsZXRlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmRlbGV0ZShpbnRlcm5fZGVsZXRlKHRoaXMsIHZhbHVlKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW50ZXJuX2dldCh7X2ludGVybiwgX2tleX0sIHZhbHVlKSB7XG4gIGNvbnN0IGtleSA9IF9rZXkodmFsdWUpO1xuICByZXR1cm4gX2ludGVybi5oYXMoa2V5KSA/IF9pbnRlcm4uZ2V0KGtleSkgOiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gaW50ZXJuX3NldCh7X2ludGVybiwgX2tleX0sIHZhbHVlKSB7XG4gIGNvbnN0IGtleSA9IF9rZXkodmFsdWUpO1xuICBpZiAoX2ludGVybi5oYXMoa2V5KSkgcmV0dXJuIF9pbnRlcm4uZ2V0KGtleSk7XG4gIF9pbnRlcm4uc2V0KGtleSwgdmFsdWUpO1xuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGludGVybl9kZWxldGUoe19pbnRlcm4sIF9rZXl9LCB2YWx1ZSkge1xuICBjb25zdCBrZXkgPSBfa2V5KHZhbHVlKTtcbiAgaWYgKF9pbnRlcm4uaGFzKGtleSkpIHtcbiAgICB2YWx1ZSA9IF9pbnRlcm4uZ2V0KGtleSk7XG4gICAgX2ludGVybi5kZWxldGUoa2V5KTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGtleW9mKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbn1cbiIsImNvbnN0IGUxMCA9IE1hdGguc3FydCg1MCksXG4gICAgZTUgPSBNYXRoLnNxcnQoMTApLFxuICAgIGUyID0gTWF0aC5zcXJ0KDIpO1xuXG5mdW5jdGlvbiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgY29uc3Qgc3RlcCA9IChzdG9wIC0gc3RhcnQpIC8gTWF0aC5tYXgoMCwgY291bnQpLFxuICAgICAgcG93ZXIgPSBNYXRoLmZsb29yKE1hdGgubG9nMTAoc3RlcCkpLFxuICAgICAgZXJyb3IgPSBzdGVwIC8gTWF0aC5wb3coMTAsIHBvd2VyKSxcbiAgICAgIGZhY3RvciA9IGVycm9yID49IGUxMCA/IDEwIDogZXJyb3IgPj0gZTUgPyA1IDogZXJyb3IgPj0gZTIgPyAyIDogMTtcbiAgbGV0IGkxLCBpMiwgaW5jO1xuICBpZiAocG93ZXIgPCAwKSB7XG4gICAgaW5jID0gTWF0aC5wb3coMTAsIC1wb3dlcikgLyBmYWN0b3I7XG4gICAgaTEgPSBNYXRoLnJvdW5kKHN0YXJ0ICogaW5jKTtcbiAgICBpMiA9IE1hdGgucm91bmQoc3RvcCAqIGluYyk7XG4gICAgaWYgKGkxIC8gaW5jIDwgc3RhcnQpICsraTE7XG4gICAgaWYgKGkyIC8gaW5jID4gc3RvcCkgLS1pMjtcbiAgICBpbmMgPSAtaW5jO1xuICB9IGVsc2Uge1xuICAgIGluYyA9IE1hdGgucG93KDEwLCBwb3dlcikgKiBmYWN0b3I7XG4gICAgaTEgPSBNYXRoLnJvdW5kKHN0YXJ0IC8gaW5jKTtcbiAgICBpMiA9IE1hdGgucm91bmQoc3RvcCAvIGluYyk7XG4gICAgaWYgKGkxICogaW5jIDwgc3RhcnQpICsraTE7XG4gICAgaWYgKGkyICogaW5jID4gc3RvcCkgLS1pMjtcbiAgfVxuICBpZiAoaTIgPCBpMSAmJiAwLjUgPD0gY291bnQgJiYgY291bnQgPCAyKSByZXR1cm4gdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50ICogMik7XG4gIHJldHVybiBbaTEsIGkyLCBpbmNdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aWNrcyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgc3RvcCA9ICtzdG9wLCBzdGFydCA9ICtzdGFydCwgY291bnQgPSArY291bnQ7XG4gIGlmICghKGNvdW50ID4gMCkpIHJldHVybiBbXTtcbiAgaWYgKHN0YXJ0ID09PSBzdG9wKSByZXR1cm4gW3N0YXJ0XTtcbiAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydCwgW2kxLCBpMiwgaW5jXSA9IHJldmVyc2UgPyB0aWNrU3BlYyhzdG9wLCBzdGFydCwgY291bnQpIDogdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgaWYgKCEoaTIgPj0gaTEpKSByZXR1cm4gW107XG4gIGNvbnN0IG4gPSBpMiAtIGkxICsgMSwgdGlja3MgPSBuZXcgQXJyYXkobik7XG4gIGlmIChyZXZlcnNlKSB7XG4gICAgaWYgKGluYyA8IDApIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMiAtIGkpIC8gLWluYztcbiAgICBlbHNlIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMiAtIGkpICogaW5jO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbmMgPCAwKSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTEgKyBpKSAvIC1pbmM7XG4gICAgZWxzZSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTEgKyBpKSAqIGluYztcbiAgfVxuICByZXR1cm4gdGlja3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrSW5jcmVtZW50KHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgcmV0dXJuIHRpY2tTcGVjKHN0YXJ0LCBzdG9wLCBjb3VudClbMl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrU3RlcChzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgc3RvcCA9ICtzdG9wLCBzdGFydCA9ICtzdGFydCwgY291bnQgPSArY291bnQ7XG4gIGNvbnN0IHJldmVyc2UgPSBzdG9wIDwgc3RhcnQsIGluYyA9IHJldmVyc2UgPyB0aWNrSW5jcmVtZW50KHN0b3AsIHN0YXJ0LCBjb3VudCkgOiB0aWNrSW5jcmVtZW50KHN0YXJ0LCBzdG9wLCBjb3VudCk7XG4gIHJldHVybiAocmV2ZXJzZSA/IC0xIDogMSkgKiAoaW5jIDwgMCA/IDEgLyAtaW5jIDogaW5jKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJhbmdlKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gIHN0YXJ0ID0gK3N0YXJ0LCBzdG9wID0gK3N0b3AsIHN0ZXAgPSAobiA9IGFyZ3VtZW50cy5sZW5ndGgpIDwgMiA/IChzdG9wID0gc3RhcnQsIHN0YXJ0ID0gMCwgMSkgOiBuIDwgMyA/IDEgOiArc3RlcDtcblxuICB2YXIgaSA9IC0xLFxuICAgICAgbiA9IE1hdGgubWF4KDAsIE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApKSB8IDAsXG4gICAgICByYW5nZSA9IG5ldyBBcnJheShuKTtcblxuICB3aGlsZSAoKytpIDwgbikge1xuICAgIHJhbmdlW2ldID0gc3RhcnQgKyBpICogc3RlcDtcbiAgfVxuXG4gIHJldHVybiByYW5nZTtcbn1cbiIsInZhciBub29wID0ge3ZhbHVlOiAoKSA9PiB7fX07XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKCkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGFyZ3VtZW50cy5sZW5ndGgsIF8gPSB7fSwgdDsgaSA8IG47ICsraSkge1xuICAgIGlmICghKHQgPSBhcmd1bWVudHNbaV0gKyBcIlwiKSB8fCAodCBpbiBfKSB8fCAvW1xccy5dLy50ZXN0KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIHR5cGU6IFwiICsgdCk7XG4gICAgX1t0XSA9IFtdO1xuICB9XG4gIHJldHVybiBuZXcgRGlzcGF0Y2goXyk7XG59XG5cbmZ1bmN0aW9uIERpc3BhdGNoKF8pIHtcbiAgdGhpcy5fID0gXztcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzLCB0eXBlcykge1xuICByZXR1cm4gdHlwZW5hbWVzLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgbmFtZSA9IFwiXCIsIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIG5hbWUgPSB0LnNsaWNlKGkgKyAxKSwgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgaWYgKHQgJiYgIXR5cGVzLmhhc093blByb3BlcnR5KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdCk7XG4gICAgcmV0dXJuIHt0eXBlOiB0LCBuYW1lOiBuYW1lfTtcbiAgfSk7XG59XG5cbkRpc3BhdGNoLnByb3RvdHlwZSA9IGRpc3BhdGNoLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IERpc3BhdGNoLFxuICBvbjogZnVuY3Rpb24odHlwZW5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIF8gPSB0aGlzLl8sXG4gICAgICAgIFQgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIsIF8pLFxuICAgICAgICB0LFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSBULmxlbmd0aDtcblxuICAgIC8vIElmIG5vIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJldHVybiB0aGUgY2FsbGJhY2sgb2YgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgJiYgKHQgPSBnZXQoX1t0XSwgdHlwZW5hbWUubmFtZSkpKSByZXR1cm4gdDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiBhIHR5cGUgd2FzIHNwZWNpZmllZCwgc2V0IHRoZSBjYWxsYmFjayBmb3IgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiBhIG51bGwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmVtb3ZlIGNhbGxiYWNrcyBvZiB0aGUgZ2l2ZW4gbmFtZS5cbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlmICh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBjYWxsYmFjayk7XG4gICAgICBlbHNlIGlmIChjYWxsYmFjayA9PSBudWxsKSBmb3IgKHQgaW4gXykgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY29weTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvcHkgPSB7fSwgXyA9IHRoaXMuXztcbiAgICBmb3IgKHZhciB0IGluIF8pIGNvcHlbdF0gPSBfW3RdLnNsaWNlKCk7XG4gICAgcmV0dXJuIG5ldyBEaXNwYXRjaChjb3B5KTtcbiAgfSxcbiAgY2FsbDogZnVuY3Rpb24odHlwZSwgdGhhdCkge1xuICAgIGlmICgobiA9IGFyZ3VtZW50cy5sZW5ndGggLSAyKSA+IDApIGZvciAodmFyIGFyZ3MgPSBuZXcgQXJyYXkobiksIGkgPSAwLCBuLCB0OyBpIDwgbjsgKytpKSBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAyXTtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHR5cGUsIHRoYXQsIGFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodmFyIHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldCh0eXBlLCBuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGgsIGM7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoKGMgPSB0eXBlW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0KHR5cGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAodHlwZVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICB0eXBlW2ldID0gbm9vcCwgdHlwZSA9IHR5cGUuc2xpY2UoMCwgaSkuY29uY2F0KHR5cGUuc2xpY2UoaSArIDEpKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgdHlwZS5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogY2FsbGJhY2t9KTtcbiAgcmV0dXJuIHR5cGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpc3BhdGNoO1xuIiwiZXhwb3J0IHZhciB4aHRtbCA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHN2ZzogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuICB4aHRtbDogeGh0bWwsXG4gIHhsaW5rOiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIixcbiAgeG1sOiBcImh0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZVwiLFxuICB4bWxuczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zL1wiXG59O1xuIiwiaW1wb3J0IG5hbWVzcGFjZXMgZnJvbSBcIi4vbmFtZXNwYWNlcy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBwcmVmaXggPSBuYW1lICs9IFwiXCIsIGkgPSBwcmVmaXguaW5kZXhPZihcIjpcIik7XG4gIGlmIChpID49IDAgJiYgKHByZWZpeCA9IG5hbWUuc2xpY2UoMCwgaSkpICE9PSBcInhtbG5zXCIpIG5hbWUgPSBuYW1lLnNsaWNlKGkgKyAxKTtcbiAgcmV0dXJuIG5hbWVzcGFjZXMuaGFzT3duUHJvcGVydHkocHJlZml4KSA/IHtzcGFjZTogbmFtZXNwYWNlc1twcmVmaXhdLCBsb2NhbDogbmFtZX0gOiBuYW1lOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xufVxuIiwiaW1wb3J0IG5hbWVzcGFjZSBmcm9tIFwiLi9uYW1lc3BhY2UuanNcIjtcbmltcG9ydCB7eGh0bWx9IGZyb20gXCIuL25hbWVzcGFjZXMuanNcIjtcblxuZnVuY3Rpb24gY3JlYXRvckluaGVyaXQobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvY3VtZW50ID0gdGhpcy5vd25lckRvY3VtZW50LFxuICAgICAgICB1cmkgPSB0aGlzLm5hbWVzcGFjZVVSSTtcbiAgICByZXR1cm4gdXJpID09PSB4aHRtbCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubmFtZXNwYWNlVVJJID09PSB4aHRtbFxuICAgICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSlcbiAgICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlModXJpLCBuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRvckZpeGVkKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKTtcbiAgcmV0dXJuIChmdWxsbmFtZS5sb2NhbFxuICAgICAgPyBjcmVhdG9yRml4ZWRcbiAgICAgIDogY3JlYXRvckluaGVyaXQpKGZ1bGxuYW1lKTtcbn1cbiIsImZ1bmN0aW9uIG5vbmUoKSB7fVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IG5vbmUgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgfTtcbn1cbiIsImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3Rvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3QgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gc2VsZWN0b3Ioc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBzdWJub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChzdWJub2RlID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSkge1xuICAgICAgICBpZiAoXCJfX2RhdGFfX1wiIGluIG5vZGUpIHN1Ym5vZGUuX19kYXRhX18gPSBub2RlLl9fZGF0YV9fO1xuICAgICAgICBzdWJncm91cFtpXSA9IHN1Ym5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsIi8vIEdpdmVuIHNvbWV0aGluZyBhcnJheSBsaWtlIChvciBudWxsKSwgcmV0dXJucyBzb21ldGhpbmcgdGhhdCBpcyBzdHJpY3RseSBhblxuLy8gYXJyYXkuIFRoaXMgaXMgdXNlZCB0byBlbnN1cmUgdGhhdCBhcnJheS1saWtlIG9iamVjdHMgcGFzc2VkIHRvIGQzLnNlbGVjdEFsbFxuLy8gb3Igc2VsZWN0aW9uLnNlbGVjdEFsbCBhcmUgY29udmVydGVkIGludG8gcHJvcGVyIGFycmF5cyB3aGVuIGNyZWF0aW5nIGFcbi8vIHNlbGVjdGlvbjsgd2UgZG9u4oCZdCBldmVyIHdhbnQgdG8gY3JlYXRlIGEgc2VsZWN0aW9uIGJhY2tlZCBieSBhIGxpdmVcbi8vIEhUTUxDb2xsZWN0aW9uIG9yIE5vZGVMaXN0LiBIb3dldmVyLCBub3RlIHRoYXQgc2VsZWN0aW9uLnNlbGVjdEFsbCB3aWxsIHVzZSBhXG4vLyBzdGF0aWMgTm9kZUxpc3QgYXMgYSBncm91cCwgc2luY2UgaXQgc2FmZWx5IGRlcml2ZWQgZnJvbSBxdWVyeVNlbGVjdG9yQWxsLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXJyYXkoeCkge1xuICByZXR1cm4geCA9PSBudWxsID8gW10gOiBBcnJheS5pc0FycmF5KHgpID8geCA6IEFycmF5LmZyb20oeCk7XG59XG4iLCJmdW5jdGlvbiBlbXB0eSgpIHtcbiAgcmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IGVtcHR5IDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH07XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBhcnJheSBmcm9tIFwiLi4vYXJyYXkuanNcIjtcbmltcG9ydCBzZWxlY3RvckFsbCBmcm9tIFwiLi4vc2VsZWN0b3JBbGwuanNcIjtcblxuZnVuY3Rpb24gYXJyYXlBbGwoc2VsZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYXJyYXkoc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3QgPT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gYXJyYXlBbGwoc2VsZWN0KTtcbiAgZWxzZSBzZWxlY3QgPSBzZWxlY3RvckFsbChzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IFtdLCBwYXJlbnRzID0gW10sIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHN1Ymdyb3Vwcy5wdXNoKHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSk7XG4gICAgICAgIHBhcmVudHMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHBhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoZXMoc2VsZWN0b3IpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hpbGRNYXRjaGVyKHNlbGVjdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubWF0Y2hlcyhzZWxlY3Rvcik7XG4gIH07XG59XG5cbiIsImltcG9ydCB7Y2hpbGRNYXRjaGVyfSBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG52YXIgZmluZCA9IEFycmF5LnByb3RvdHlwZS5maW5kO1xuXG5mdW5jdGlvbiBjaGlsZEZpbmQobWF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmaW5kLmNhbGwodGhpcy5jaGlsZHJlbiwgbWF0Y2gpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjaGlsZEZpcnN0KCkge1xuICByZXR1cm4gdGhpcy5maXJzdEVsZW1lbnRDaGlsZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KG1hdGNoID09IG51bGwgPyBjaGlsZEZpcnN0XG4gICAgICA6IGNoaWxkRmluZCh0eXBlb2YgbWF0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IG1hdGNoIDogY2hpbGRNYXRjaGVyKG1hdGNoKSkpO1xufVxuIiwiaW1wb3J0IHtjaGlsZE1hdGNoZXJ9IGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbnZhciBmaWx0ZXIgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyO1xuXG5mdW5jdGlvbiBjaGlsZHJlbigpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5jaGlsZHJlbik7XG59XG5cbmZ1bmN0aW9uIGNoaWxkcmVuRmlsdGVyKG1hdGNoKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmlsdGVyLmNhbGwodGhpcy5jaGlsZHJlbiwgbWF0Y2gpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3RBbGwobWF0Y2ggPT0gbnVsbCA/IGNoaWxkcmVuXG4gICAgICA6IGNoaWxkcmVuRmlsdGVyKHR5cGVvZiBtYXRjaCA9PT0gXCJmdW5jdGlvblwiID8gbWF0Y2ggOiBjaGlsZE1hdGNoZXIobWF0Y2gpKSk7XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBtYXRjaGVyIGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIGlmICh0eXBlb2YgbWF0Y2ggIT09IFwiZnVuY3Rpb25cIikgbWF0Y2ggPSBtYXRjaGVyKG1hdGNoKTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gW10sIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgbWF0Y2guY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpIHtcbiAgICAgICAgc3ViZ3JvdXAucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odXBkYXRlKSB7XG4gIHJldHVybiBuZXcgQXJyYXkodXBkYXRlLmxlbmd0aCk7XG59XG4iLCJpbXBvcnQgc3BhcnNlIGZyb20gXCIuL3NwYXJzZS5qc1wiO1xuaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9lbnRlciB8fCB0aGlzLl9ncm91cHMubWFwKHNwYXJzZSksIHRoaXMuX3BhcmVudHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRW50ZXJOb2RlKHBhcmVudCwgZGF0dW0pIHtcbiAgdGhpcy5vd25lckRvY3VtZW50ID0gcGFyZW50Lm93bmVyRG9jdW1lbnQ7XG4gIHRoaXMubmFtZXNwYWNlVVJJID0gcGFyZW50Lm5hbWVzcGFjZVVSSTtcbiAgdGhpcy5fbmV4dCA9IG51bGw7XG4gIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5fX2RhdGFfXyA9IGRhdHVtO1xufVxuXG5FbnRlck5vZGUucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRW50ZXJOb2RlLFxuICBhcHBlbmRDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIHRoaXMuX25leHQpOyB9LFxuICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKGNoaWxkLCBuZXh0KSB7IHJldHVybiB0aGlzLl9wYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCBuZXh0KTsgfSxcbiAgcXVlcnlTZWxlY3RvcjogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTsgfSxcbiAgcXVlcnlTZWxlY3RvckFsbDogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTsgfVxufTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge0VudGVyTm9kZX0gZnJvbSBcIi4vZW50ZXIuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi4vY29uc3RhbnQuanNcIjtcblxuZnVuY3Rpb24gYmluZEluZGV4KHBhcmVudCwgZ3JvdXAsIGVudGVyLCB1cGRhdGUsIGV4aXQsIGRhdGEpIHtcbiAgdmFyIGkgPSAwLFxuICAgICAgbm9kZSxcbiAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuXG4gIC8vIFB1dCBhbnkgbm9uLW51bGwgbm9kZXMgdGhhdCBmaXQgaW50byB1cGRhdGUuXG4gIC8vIFB1dCBhbnkgbnVsbCBub2RlcyBpbnRvIGVudGVyLlxuICAvLyBQdXQgYW55IHJlbWFpbmluZyBkYXRhIGludG8gZW50ZXIuXG4gIGZvciAoOyBpIDwgZGF0YUxlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBQdXQgYW55IG5vbi1udWxsIG5vZGVzIHRoYXQgZG9u4oCZdCBmaXQgaW50byBleGl0LlxuICBmb3IgKDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBleGl0W2ldID0gbm9kZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYmluZEtleShwYXJlbnQsIGdyb3VwLCBlbnRlciwgdXBkYXRlLCBleGl0LCBkYXRhLCBrZXkpIHtcbiAgdmFyIGksXG4gICAgICBub2RlLFxuICAgICAgbm9kZUJ5S2V5VmFsdWUgPSBuZXcgTWFwLFxuICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICBrZXlWYWx1ZXMgPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpLFxuICAgICAga2V5VmFsdWU7XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIG5vZGUuXG4gIC8vIElmIG11bHRpcGxlIG5vZGVzIGhhdmUgdGhlIHNhbWUga2V5LCB0aGUgZHVwbGljYXRlcyBhcmUgYWRkZWQgdG8gZXhpdC5cbiAgZm9yIChpID0gMDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBrZXlWYWx1ZXNbaV0gPSBrZXlWYWx1ZSA9IGtleS5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSArIFwiXCI7XG4gICAgICBpZiAobm9kZUJ5S2V5VmFsdWUuaGFzKGtleVZhbHVlKSkge1xuICAgICAgICBleGl0W2ldID0gbm9kZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGVCeUtleVZhbHVlLnNldChrZXlWYWx1ZSwgbm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIGRhdHVtLlxuICAvLyBJZiB0aGVyZSBhIG5vZGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LCBqb2luIGFuZCBhZGQgaXQgdG8gdXBkYXRlLlxuICAvLyBJZiB0aGVyZSBpcyBub3QgKG9yIHRoZSBrZXkgaXMgYSBkdXBsaWNhdGUpLCBhZGQgaXQgdG8gZW50ZXIuXG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhTGVuZ3RoOyArK2kpIHtcbiAgICBrZXlWYWx1ZSA9IGtleS5jYWxsKHBhcmVudCwgZGF0YVtpXSwgaSwgZGF0YSkgKyBcIlwiO1xuICAgIGlmIChub2RlID0gbm9kZUJ5S2V5VmFsdWUuZ2V0KGtleVZhbHVlKSkge1xuICAgICAgdXBkYXRlW2ldID0gbm9kZTtcbiAgICAgIG5vZGUuX19kYXRhX18gPSBkYXRhW2ldO1xuICAgICAgbm9kZUJ5S2V5VmFsdWUuZGVsZXRlKGtleVZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW50ZXJbaV0gPSBuZXcgRW50ZXJOb2RlKHBhcmVudCwgZGF0YVtpXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIGFueSByZW1haW5pbmcgbm9kZXMgdGhhdCB3ZXJlIG5vdCBib3VuZCB0byBkYXRhIHRvIGV4aXQuXG4gIGZvciAoaSA9IDA7IGkgPCBncm91cExlbmd0aDsgKytpKSB7XG4gICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWVzW2ldKSA9PT0gbm9kZSkpIHtcbiAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkYXR1bShub2RlKSB7XG4gIHJldHVybiBub2RlLl9fZGF0YV9fO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIEFycmF5LmZyb20odGhpcywgZGF0dW0pO1xuXG4gIHZhciBiaW5kID0ga2V5ID8gYmluZEtleSA6IGJpbmRJbmRleCxcbiAgICAgIHBhcmVudHMgPSB0aGlzLl9wYXJlbnRzLFxuICAgICAgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzO1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdmFsdWUgPSBjb25zdGFudCh2YWx1ZSk7XG5cbiAgZm9yICh2YXIgbSA9IGdyb3Vwcy5sZW5ndGgsIHVwZGF0ZSA9IG5ldyBBcnJheShtKSwgZW50ZXIgPSBuZXcgQXJyYXkobSksIGV4aXQgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgdmFyIHBhcmVudCA9IHBhcmVudHNbal0sXG4gICAgICAgIGdyb3VwID0gZ3JvdXBzW2pdLFxuICAgICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgICAgZGF0YSA9IGFycmF5bGlrZSh2YWx1ZS5jYWxsKHBhcmVudCwgcGFyZW50ICYmIHBhcmVudC5fX2RhdGFfXywgaiwgcGFyZW50cykpLFxuICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICAgIGVudGVyR3JvdXAgPSBlbnRlcltqXSA9IG5ldyBBcnJheShkYXRhTGVuZ3RoKSxcbiAgICAgICAgdXBkYXRlR3JvdXAgPSB1cGRhdGVbal0gPSBuZXcgQXJyYXkoZGF0YUxlbmd0aCksXG4gICAgICAgIGV4aXRHcm91cCA9IGV4aXRbal0gPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpO1xuXG4gICAgYmluZChwYXJlbnQsIGdyb3VwLCBlbnRlckdyb3VwLCB1cGRhdGVHcm91cCwgZXhpdEdyb3VwLCBkYXRhLCBrZXkpO1xuXG4gICAgLy8gTm93IGNvbm5lY3QgdGhlIGVudGVyIG5vZGVzIHRvIHRoZWlyIGZvbGxvd2luZyB1cGRhdGUgbm9kZSwgc3VjaCB0aGF0XG4gICAgLy8gYXBwZW5kQ2hpbGQgY2FuIGluc2VydCB0aGUgbWF0ZXJpYWxpemVkIGVudGVyIG5vZGUgYmVmb3JlIHRoaXMgbm9kZSxcbiAgICAvLyByYXRoZXIgdGhhbiBhdCB0aGUgZW5kIG9mIHRoZSBwYXJlbnQgbm9kZS5cbiAgICBmb3IgKHZhciBpMCA9IDAsIGkxID0gMCwgcHJldmlvdXMsIG5leHQ7IGkwIDwgZGF0YUxlbmd0aDsgKytpMCkge1xuICAgICAgaWYgKHByZXZpb3VzID0gZW50ZXJHcm91cFtpMF0pIHtcbiAgICAgICAgaWYgKGkwID49IGkxKSBpMSA9IGkwICsgMTtcbiAgICAgICAgd2hpbGUgKCEobmV4dCA9IHVwZGF0ZUdyb3VwW2kxXSkgJiYgKytpMSA8IGRhdGFMZW5ndGgpO1xuICAgICAgICBwcmV2aW91cy5fbmV4dCA9IG5leHQgfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGUgPSBuZXcgU2VsZWN0aW9uKHVwZGF0ZSwgcGFyZW50cyk7XG4gIHVwZGF0ZS5fZW50ZXIgPSBlbnRlcjtcbiAgdXBkYXRlLl9leGl0ID0gZXhpdDtcbiAgcmV0dXJuIHVwZGF0ZTtcbn1cblxuLy8gR2l2ZW4gc29tZSBkYXRhLCB0aGlzIHJldHVybnMgYW4gYXJyYXktbGlrZSB2aWV3IG9mIGl0OiBhbiBvYmplY3QgdGhhdFxuLy8gZXhwb3NlcyBhIGxlbmd0aCBwcm9wZXJ0eSBhbmQgYWxsb3dzIG51bWVyaWMgaW5kZXhpbmcuIE5vdGUgdGhhdCB1bmxpa2Vcbi8vIHNlbGVjdEFsbCwgdGhpcyBpc27igJl0IHdvcnJpZWQgYWJvdXQg4oCcbGl2ZeKAnSBjb2xsZWN0aW9ucyBiZWNhdXNlIHRoZSByZXN1bHRpbmdcbi8vIGFycmF5IHdpbGwgb25seSBiZSB1c2VkIGJyaWVmbHkgd2hpbGUgZGF0YSBpcyBiZWluZyBib3VuZC4gKEl0IGlzIHBvc3NpYmxlIHRvXG4vLyBjYXVzZSB0aGUgZGF0YSB0byBjaGFuZ2Ugd2hpbGUgaXRlcmF0aW5nIGJ5IHVzaW5nIGEga2V5IGZ1bmN0aW9uLCBidXQgcGxlYXNlXG4vLyBkb27igJl0OyB3ZeKAmWQgcmF0aGVyIGF2b2lkIGEgZ3JhdHVpdG91cyBjb3B5LilcbmZ1bmN0aW9uIGFycmF5bGlrZShkYXRhKSB7XG4gIHJldHVybiB0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIiAmJiBcImxlbmd0aFwiIGluIGRhdGFcbiAgICA/IGRhdGEgLy8gQXJyYXksIFR5cGVkQXJyYXksIE5vZGVMaXN0LCBhcnJheS1saWtlXG4gICAgOiBBcnJheS5mcm9tKGRhdGEpOyAvLyBNYXAsIFNldCwgaXRlcmFibGUsIHN0cmluZywgb3IgYW55dGhpbmcgZWxzZVxufVxuIiwiaW1wb3J0IHNwYXJzZSBmcm9tIFwiLi9zcGFyc2UuanNcIjtcbmltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZXhpdCB8fCB0aGlzLl9ncm91cHMubWFwKHNwYXJzZSksIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob25lbnRlciwgb251cGRhdGUsIG9uZXhpdCkge1xuICB2YXIgZW50ZXIgPSB0aGlzLmVudGVyKCksIHVwZGF0ZSA9IHRoaXMsIGV4aXQgPSB0aGlzLmV4aXQoKTtcbiAgaWYgKHR5cGVvZiBvbmVudGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBlbnRlciA9IG9uZW50ZXIoZW50ZXIpO1xuICAgIGlmIChlbnRlcikgZW50ZXIgPSBlbnRlci5zZWxlY3Rpb24oKTtcbiAgfSBlbHNlIHtcbiAgICBlbnRlciA9IGVudGVyLmFwcGVuZChvbmVudGVyICsgXCJcIik7XG4gIH1cbiAgaWYgKG9udXBkYXRlICE9IG51bGwpIHtcbiAgICB1cGRhdGUgPSBvbnVwZGF0ZSh1cGRhdGUpO1xuICAgIGlmICh1cGRhdGUpIHVwZGF0ZSA9IHVwZGF0ZS5zZWxlY3Rpb24oKTtcbiAgfVxuICBpZiAob25leGl0ID09IG51bGwpIGV4aXQucmVtb3ZlKCk7IGVsc2Ugb25leGl0KGV4aXQpO1xuICByZXR1cm4gZW50ZXIgJiYgdXBkYXRlID8gZW50ZXIubWVyZ2UodXBkYXRlKS5vcmRlcigpIDogdXBkYXRlO1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgdmFyIHNlbGVjdGlvbiA9IGNvbnRleHQuc2VsZWN0aW9uID8gY29udGV4dC5zZWxlY3Rpb24oKSA6IGNvbnRleHQ7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHNlbGVjdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihtZXJnZXMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gLTEsIG0gPSBncm91cHMubGVuZ3RoOyArK2ogPCBtOykge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gZ3JvdXAubGVuZ3RoIC0gMSwgbmV4dCA9IGdyb3VwW2ldLCBub2RlOyAtLWkgPj0gMDspIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgaWYgKG5leHQgJiYgbm9kZS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihuZXh0KSBeIDQpIG5leHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgbmV4dCk7XG4gICAgICAgIG5leHQgPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbXBhcmUpIHtcbiAgaWYgKCFjb21wYXJlKSBjb21wYXJlID0gYXNjZW5kaW5nO1xuXG4gIGZ1bmN0aW9uIGNvbXBhcmVOb2RlKGEsIGIpIHtcbiAgICByZXR1cm4gYSAmJiBiID8gY29tcGFyZShhLl9fZGF0YV9fLCBiLl9fZGF0YV9fKSA6ICFhIC0gIWI7XG4gIH1cblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzb3J0Z3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzb3J0Z3JvdXAgPSBzb3J0Z3JvdXBzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzb3J0Z3JvdXBbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgICBzb3J0Z3JvdXAuc29ydChjb21wYXJlTm9kZSk7XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzb3J0Z3JvdXBzLCB0aGlzLl9wYXJlbnRzKS5vcmRlcigpO1xufVxuXG5mdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IGEgPj0gYiA/IDAgOiBOYU47XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzWzBdO1xuICBhcmd1bWVudHNbMF0gPSB0aGlzO1xuICBjYWxsYmFjay5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICB2YXIgbm9kZSA9IGdyb3VwW2ldO1xuICAgICAgaWYgKG5vZGUpIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGxldCBzaXplID0gMDtcbiAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMpICsrc2l6ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICByZXR1cm4gc2l6ZTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gIXRoaXMubm9kZSgpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2FsbGJhY2spIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkgY2FsbGJhY2suY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuLi9uYW1lc3BhY2UuanNcIjtcblxuZnVuY3Rpb24gYXR0clJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clJlbW92ZU5TKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudChuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnROUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2YWx1ZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIGVsc2UgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbk5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBlbHNlIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBub2RlID0gdGhpcy5ub2RlKCk7XG4gICAgcmV0dXJuIGZ1bGxuYW1lLmxvY2FsXG4gICAgICAgID8gbm9kZS5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpXG4gICAgICAgIDogbm9kZS5nZXRBdHRyaWJ1dGUoZnVsbG5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyUmVtb3ZlTlMgOiBhdHRyUmVtb3ZlKSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyRnVuY3Rpb25OUyA6IGF0dHJGdW5jdGlvbilcbiAgICAgIDogKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckNvbnN0YW50TlMgOiBhdHRyQ29uc3RhbnQpKSkoZnVsbG5hbWUsIHZhbHVlKSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlKSB7XG4gIHJldHVybiAobm9kZS5vd25lckRvY3VtZW50ICYmIG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldykgLy8gbm9kZSBpcyBhIE5vZGVcbiAgICAgIHx8IChub2RlLmRvY3VtZW50ICYmIG5vZGUpIC8vIG5vZGUgaXMgYSBXaW5kb3dcbiAgICAgIHx8IG5vZGUuZGVmYXVsdFZpZXc7IC8vIG5vZGUgaXMgYSBEb2N1bWVudFxufVxuIiwiaW1wb3J0IGRlZmF1bHRWaWV3IGZyb20gXCIuLi93aW5kb3cuanNcIjtcblxuZnVuY3Rpb24gc3R5bGVSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVDb25zdGFudChuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgdmFsdWUsIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVGdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICAgIGVsc2UgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2LCBwcmlvcml0eSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgICA/IHN0eWxlUmVtb3ZlIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgID8gc3R5bGVGdW5jdGlvblxuICAgICAgICAgICAgOiBzdHlsZUNvbnN0YW50KShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkgPT0gbnVsbCA/IFwiXCIgOiBwcmlvcml0eSkpXG4gICAgICA6IHN0eWxlVmFsdWUodGhpcy5ub2RlKCksIG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3R5bGVWYWx1ZShub2RlLCBuYW1lKSB7XG4gIHJldHVybiBub2RlLnN0eWxlLmdldFByb3BlcnR5VmFsdWUobmFtZSlcbiAgICAgIHx8IGRlZmF1bHRWaWV3KG5vZGUpLmdldENvbXB1dGVkU3R5bGUobm9kZSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcbn1cbiIsImZ1bmN0aW9uIHByb3BlcnR5UmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eUNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzW25hbWVdID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5RnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSBkZWxldGUgdGhpc1tuYW1lXTtcbiAgICBlbHNlIHRoaXNbbmFtZV0gPSB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBwcm9wZXJ0eVJlbW92ZSA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBwcm9wZXJ0eUZ1bmN0aW9uXG4gICAgICAgICAgOiBwcm9wZXJ0eUNvbnN0YW50KShuYW1lLCB2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpW25hbWVdO1xufVxuIiwiZnVuY3Rpb24gY2xhc3NBcnJheShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy50cmltKCkuc3BsaXQoL158XFxzKy8pO1xufVxuXG5mdW5jdGlvbiBjbGFzc0xpc3Qobm9kZSkge1xuICByZXR1cm4gbm9kZS5jbGFzc0xpc3QgfHwgbmV3IENsYXNzTGlzdChub2RlKTtcbn1cblxuZnVuY3Rpb24gQ2xhc3NMaXN0KG5vZGUpIHtcbiAgdGhpcy5fbm9kZSA9IG5vZGU7XG4gIHRoaXMuX25hbWVzID0gY2xhc3NBcnJheShub2RlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpO1xufVxuXG5DbGFzc0xpc3QucHJvdG90eXBlID0ge1xuICBhZGQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPCAwKSB7XG4gICAgICB0aGlzLl9uYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPj0gMCkge1xuICAgICAgdGhpcy5fbmFtZXMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICBjb250YWluczogZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpID49IDA7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNsYXNzZWRBZGQobm9kZSwgbmFtZXMpIHtcbiAgdmFyIGxpc3QgPSBjbGFzc0xpc3Qobm9kZSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgd2hpbGUgKCsraSA8IG4pIGxpc3QuYWRkKG5hbWVzW2ldKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZFJlbW92ZShub2RlLCBuYW1lcykge1xuICB2YXIgbGlzdCA9IGNsYXNzTGlzdChub2RlKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbikgbGlzdC5yZW1vdmUobmFtZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkVHJ1ZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZEFkZCh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGYWxzZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZFJlbW92ZSh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGdW5jdGlvbihuYW1lcywgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICh2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpID8gY2xhc3NlZEFkZCA6IGNsYXNzZWRSZW1vdmUpKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIG5hbWVzID0gY2xhc3NBcnJheShuYW1lICsgXCJcIik7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIGxpc3QgPSBjbGFzc0xpc3QodGhpcy5ub2RlKCkpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIGlmICghbGlzdC5jb250YWlucyhuYW1lc1tpXSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGNsYXNzZWRGdW5jdGlvbiA6IHZhbHVlXG4gICAgICA/IGNsYXNzZWRUcnVlXG4gICAgICA6IGNsYXNzZWRGYWxzZSkobmFtZXMsIHZhbHVlKSk7XG59XG4iLCJmdW5jdGlvbiB0ZXh0UmVtb3ZlKCkge1xuICB0aGlzLnRleHRDb250ZW50ID0gXCJcIjtcbn1cblxuZnVuY3Rpb24gdGV4dENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IHRleHRSZW1vdmUgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IHRleHRGdW5jdGlvblxuICAgICAgICAgIDogdGV4dENvbnN0YW50KSh2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpLnRleHRDb250ZW50O1xufVxuIiwiZnVuY3Rpb24gaHRtbFJlbW92ZSgpIHtcbiAgdGhpcy5pbm5lckhUTUwgPSBcIlwiO1xufVxuXG5mdW5jdGlvbiBodG1sQ29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGh0bWxGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdiA9PSBudWxsID8gXCJcIiA6IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBodG1sUmVtb3ZlIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBodG1sRnVuY3Rpb25cbiAgICAgICAgICA6IGh0bWxDb25zdGFudCkodmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKS5pbm5lckhUTUw7XG59XG4iLCJmdW5jdGlvbiByYWlzZSgpIHtcbiAgaWYgKHRoaXMubmV4dFNpYmxpbmcpIHRoaXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmFpc2UpO1xufVxuIiwiZnVuY3Rpb24gbG93ZXIoKSB7XG4gIGlmICh0aGlzLnByZXZpb3VzU2libGluZykgdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLCB0aGlzLnBhcmVudE5vZGUuZmlyc3RDaGlsZCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKGxvd2VyKTtcbn1cbiIsImltcG9ydCBjcmVhdG9yIGZyb20gXCIuLi9jcmVhdG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmFwcGVuZENoaWxkKGNyZWF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgY3JlYXRvciBmcm9tIFwiLi4vY3JlYXRvci5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3Rvci5qc1wiO1xuXG5mdW5jdGlvbiBjb25zdGFudE51bGwoKSB7XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCBiZWZvcmUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKSxcbiAgICAgIHNlbGVjdCA9IGJlZm9yZSA9PSBudWxsID8gY29uc3RhbnROdWxsIDogdHlwZW9mIGJlZm9yZSA9PT0gXCJmdW5jdGlvblwiID8gYmVmb3JlIDogc2VsZWN0b3IoYmVmb3JlKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmluc2VydEJlZm9yZShjcmVhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgbnVsbCk7XG4gIH0pO1xufVxuIiwiZnVuY3Rpb24gcmVtb3ZlKCkge1xuICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKHJlbW92ZSk7XG59XG4iLCJmdW5jdGlvbiBzZWxlY3Rpb25fY2xvbmVTaGFsbG93KCkge1xuICB2YXIgY2xvbmUgPSB0aGlzLmNsb25lTm9kZShmYWxzZSksIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgcmV0dXJuIHBhcmVudCA/IHBhcmVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMubmV4dFNpYmxpbmcpIDogY2xvbmU7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbl9jbG9uZURlZXAoKSB7XG4gIHZhciBjbG9uZSA9IHRoaXMuY2xvbmVOb2RlKHRydWUpLCBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIHJldHVybiBwYXJlbnQgPyBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNsb25lLCB0aGlzLm5leHRTaWJsaW5nKSA6IGNsb25lO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihkZWVwKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdChkZWVwID8gc2VsZWN0aW9uX2Nsb25lRGVlcCA6IHNlbGVjdGlvbl9jbG9uZVNoYWxsb3cpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5wcm9wZXJ0eShcIl9fZGF0YV9fXCIsIHZhbHVlKVxuICAgICAgOiB0aGlzLm5vZGUoKS5fX2RhdGFfXztcbn1cbiIsImZ1bmN0aW9uIGNvbnRleHRMaXN0ZW5lcihsaXN0ZW5lcikge1xuICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIGV2ZW50LCB0aGlzLl9fZGF0YV9fKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gb25SZW1vdmUodHlwZW5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBvbiA9IHRoaXMuX19vbjtcbiAgICBpZiAoIW9uKSByZXR1cm47XG4gICAgZm9yICh2YXIgaiA9IDAsIGkgPSAtMSwgbSA9IG9uLmxlbmd0aCwgbzsgaiA8IG07ICsraikge1xuICAgICAgaWYgKG8gPSBvbltqXSwgKCF0eXBlbmFtZS50eXBlIHx8IG8udHlwZSA9PT0gdHlwZW5hbWUudHlwZSkgJiYgby5uYW1lID09PSB0eXBlbmFtZS5uYW1lKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIsIG8ub3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvblsrK2ldID0gbztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCsraSkgb24ubGVuZ3RoID0gaTtcbiAgICBlbHNlIGRlbGV0ZSB0aGlzLl9fb247XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9uQWRkKHR5cGVuYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uID0gdGhpcy5fX29uLCBvLCBsaXN0ZW5lciA9IGNvbnRleHRMaXN0ZW5lcih2YWx1ZSk7XG4gICAgaWYgKG9uKSBmb3IgKHZhciBqID0gMCwgbSA9IG9uLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgICAgaWYgKChvID0gb25bal0pLnR5cGUgPT09IHR5cGVuYW1lLnR5cGUgJiYgby5uYW1lID09PSB0eXBlbmFtZS5uYW1lKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIsIG8ub3B0aW9ucyk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIgPSBsaXN0ZW5lciwgby5vcHRpb25zID0gb3B0aW9ucyk7XG4gICAgICAgIG8udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodHlwZW5hbWUudHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xuICAgIG8gPSB7dHlwZTogdHlwZW5hbWUudHlwZSwgbmFtZTogdHlwZW5hbWUubmFtZSwgdmFsdWU6IHZhbHVlLCBsaXN0ZW5lcjogbGlzdGVuZXIsIG9wdGlvbnM6IG9wdGlvbnN9O1xuICAgIGlmICghb24pIHRoaXMuX19vbiA9IFtvXTtcbiAgICBlbHNlIG9uLnB1c2gobyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHR5cGVuYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xuICB2YXIgdHlwZW5hbWVzID0gcGFyc2VUeXBlbmFtZXModHlwZW5hbWUgKyBcIlwiKSwgaSwgbiA9IHR5cGVuYW1lcy5sZW5ndGgsIHQ7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIG9uID0gdGhpcy5ub2RlKCkuX19vbjtcbiAgICBpZiAob24pIGZvciAodmFyIGogPSAwLCBtID0gb24ubGVuZ3RoLCBvOyBqIDwgbTsgKytqKSB7XG4gICAgICBmb3IgKGkgPSAwLCBvID0gb25bal07IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKCh0ID0gdHlwZW5hbWVzW2ldKS50eXBlID09PSBvLnR5cGUgJiYgdC5uYW1lID09PSBvLm5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gby52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBvbiA9IHZhbHVlID8gb25BZGQgOiBvblJlbW92ZTtcbiAgZm9yIChpID0gMDsgaSA8IG47ICsraSkgdGhpcy5lYWNoKG9uKHR5cGVuYW1lc1tpXSwgdmFsdWUsIG9wdGlvbnMpKTtcbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQgZGVmYXVsdFZpZXcgZnJvbSBcIi4uL3dpbmRvdy5qc1wiO1xuXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KG5vZGUsIHR5cGUsIHBhcmFtcykge1xuICB2YXIgd2luZG93ID0gZGVmYXVsdFZpZXcobm9kZSksXG4gICAgICBldmVudCA9IHdpbmRvdy5DdXN0b21FdmVudDtcblxuICBpZiAodHlwZW9mIGV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBldmVudCA9IG5ldyBldmVudCh0eXBlLCBwYXJhbXMpO1xuICB9IGVsc2Uge1xuICAgIGV2ZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG4gICAgaWYgKHBhcmFtcykgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSksIGV2ZW50LmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XG4gICAgZWxzZSBldmVudC5pbml0RXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlKTtcbiAgfVxuXG4gIG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQ29uc3RhbnQodHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoRXZlbnQodGhpcywgdHlwZSwgcGFyYW1zLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaCgodHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGRpc3BhdGNoRnVuY3Rpb25cbiAgICAgIDogZGlzcGF0Y2hDb25zdGFudCkodHlwZSwgcGFyYW1zKSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiooKSB7XG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB5aWVsZCBub2RlO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3QgZnJvbSBcIi4vc2VsZWN0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NlbGVjdEFsbCBmcm9tIFwiLi9zZWxlY3RBbGwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0Q2hpbGQgZnJvbSBcIi4vc2VsZWN0Q2hpbGQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0Q2hpbGRyZW4gZnJvbSBcIi4vc2VsZWN0Q2hpbGRyZW4uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZmlsdGVyIGZyb20gXCIuL2ZpbHRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kYXRhIGZyb20gXCIuL2RhdGEuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZW50ZXIgZnJvbSBcIi4vZW50ZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZXhpdCBmcm9tIFwiLi9leGl0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2pvaW4gZnJvbSBcIi4vam9pbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9tZXJnZSBmcm9tIFwiLi9tZXJnZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9vcmRlciBmcm9tIFwiLi9vcmRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zb3J0IGZyb20gXCIuL3NvcnQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fY2FsbCBmcm9tIFwiLi9jYWxsLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX25vZGVzIGZyb20gXCIuL25vZGVzLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX25vZGUgZnJvbSBcIi4vbm9kZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zaXplIGZyb20gXCIuL3NpemUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZW1wdHkgZnJvbSBcIi4vZW1wdHkuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZWFjaCBmcm9tIFwiLi9lYWNoLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2F0dHIgZnJvbSBcIi4vYXR0ci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zdHlsZSBmcm9tIFwiLi9zdHlsZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9wcm9wZXJ0eSBmcm9tIFwiLi9wcm9wZXJ0eS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jbGFzc2VkIGZyb20gXCIuL2NsYXNzZWQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fdGV4dCBmcm9tIFwiLi90ZXh0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2h0bWwgZnJvbSBcIi4vaHRtbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9yYWlzZSBmcm9tIFwiLi9yYWlzZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9sb3dlciBmcm9tIFwiLi9sb3dlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9hcHBlbmQgZnJvbSBcIi4vYXBwZW5kLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2luc2VydCBmcm9tIFwiLi9pbnNlcnQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fcmVtb3ZlIGZyb20gXCIuL3JlbW92ZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jbG9uZSBmcm9tIFwiLi9jbG9uZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kYXR1bSBmcm9tIFwiLi9kYXR1bS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9vbiBmcm9tIFwiLi9vbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kaXNwYXRjaCBmcm9tIFwiLi9kaXNwYXRjaC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9pdGVyYXRvciBmcm9tIFwiLi9pdGVyYXRvci5qc1wiO1xuXG5leHBvcnQgdmFyIHJvb3QgPSBbbnVsbF07XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWxlY3Rpb24oZ3JvdXBzLCBwYXJlbnRzKSB7XG4gIHRoaXMuX2dyb3VwcyA9IGdyb3VwcztcbiAgdGhpcy5fcGFyZW50cyA9IHBhcmVudHM7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oW1tkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdXSwgcm9vdCk7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbl9zZWxlY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzO1xufVxuXG5TZWxlY3Rpb24ucHJvdG90eXBlID0gc2VsZWN0aW9uLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFNlbGVjdGlvbixcbiAgc2VsZWN0OiBzZWxlY3Rpb25fc2VsZWN0LFxuICBzZWxlY3RBbGw6IHNlbGVjdGlvbl9zZWxlY3RBbGwsXG4gIHNlbGVjdENoaWxkOiBzZWxlY3Rpb25fc2VsZWN0Q2hpbGQsXG4gIHNlbGVjdENoaWxkcmVuOiBzZWxlY3Rpb25fc2VsZWN0Q2hpbGRyZW4sXG4gIGZpbHRlcjogc2VsZWN0aW9uX2ZpbHRlcixcbiAgZGF0YTogc2VsZWN0aW9uX2RhdGEsXG4gIGVudGVyOiBzZWxlY3Rpb25fZW50ZXIsXG4gIGV4aXQ6IHNlbGVjdGlvbl9leGl0LFxuICBqb2luOiBzZWxlY3Rpb25fam9pbixcbiAgbWVyZ2U6IHNlbGVjdGlvbl9tZXJnZSxcbiAgc2VsZWN0aW9uOiBzZWxlY3Rpb25fc2VsZWN0aW9uLFxuICBvcmRlcjogc2VsZWN0aW9uX29yZGVyLFxuICBzb3J0OiBzZWxlY3Rpb25fc29ydCxcbiAgY2FsbDogc2VsZWN0aW9uX2NhbGwsXG4gIG5vZGVzOiBzZWxlY3Rpb25fbm9kZXMsXG4gIG5vZGU6IHNlbGVjdGlvbl9ub2RlLFxuICBzaXplOiBzZWxlY3Rpb25fc2l6ZSxcbiAgZW1wdHk6IHNlbGVjdGlvbl9lbXB0eSxcbiAgZWFjaDogc2VsZWN0aW9uX2VhY2gsXG4gIGF0dHI6IHNlbGVjdGlvbl9hdHRyLFxuICBzdHlsZTogc2VsZWN0aW9uX3N0eWxlLFxuICBwcm9wZXJ0eTogc2VsZWN0aW9uX3Byb3BlcnR5LFxuICBjbGFzc2VkOiBzZWxlY3Rpb25fY2xhc3NlZCxcbiAgdGV4dDogc2VsZWN0aW9uX3RleHQsXG4gIGh0bWw6IHNlbGVjdGlvbl9odG1sLFxuICByYWlzZTogc2VsZWN0aW9uX3JhaXNlLFxuICBsb3dlcjogc2VsZWN0aW9uX2xvd2VyLFxuICBhcHBlbmQ6IHNlbGVjdGlvbl9hcHBlbmQsXG4gIGluc2VydDogc2VsZWN0aW9uX2luc2VydCxcbiAgcmVtb3ZlOiBzZWxlY3Rpb25fcmVtb3ZlLFxuICBjbG9uZTogc2VsZWN0aW9uX2Nsb25lLFxuICBkYXR1bTogc2VsZWN0aW9uX2RhdHVtLFxuICBvbjogc2VsZWN0aW9uX29uLFxuICBkaXNwYXRjaDogc2VsZWN0aW9uX2Rpc3BhdGNoLFxuICBbU3ltYm9sLml0ZXJhdG9yXTogc2VsZWN0aW9uX2l0ZXJhdG9yXG59O1xuXG5leHBvcnQgZGVmYXVsdCBzZWxlY3Rpb247XG4iLCJpbXBvcnQge1NlbGVjdGlvbiwgcm9vdH0gZnJvbSBcIi4vc2VsZWN0aW9uL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCJcbiAgICAgID8gbmV3IFNlbGVjdGlvbihbW2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXV0sIFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdKVxuICAgICAgOiBuZXcgU2VsZWN0aW9uKFtbc2VsZWN0b3JdXSwgcm9vdCk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb25zdHJ1Y3RvciwgZmFjdG9yeSwgcHJvdG90eXBlKSB7XG4gIGNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGZhY3RvcnkucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICBwcm90b3R5cGUuY29uc3RydWN0b3IgPSBjb25zdHJ1Y3Rvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChwYXJlbnQsIGRlZmluaXRpb24pIHtcbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUocGFyZW50LnByb3RvdHlwZSk7XG4gIGZvciAodmFyIGtleSBpbiBkZWZpbml0aW9uKSBwcm90b3R5cGVba2V5XSA9IGRlZmluaXRpb25ba2V5XTtcbiAgcmV0dXJuIHByb3RvdHlwZTtcbn1cbiIsImltcG9ydCBkZWZpbmUsIHtleHRlbmR9IGZyb20gXCIuL2RlZmluZS5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gQ29sb3IoKSB7fVxuXG5leHBvcnQgdmFyIGRhcmtlciA9IDAuNztcbmV4cG9ydCB2YXIgYnJpZ2h0ZXIgPSAxIC8gZGFya2VyO1xuXG52YXIgcmVJID0gXCJcXFxccyooWystXT9cXFxcZCspXFxcXHMqXCIsXG4gICAgcmVOID0gXCJcXFxccyooWystXT8oPzpcXFxcZCpcXFxcLik/XFxcXGQrKD86W2VFXVsrLV0/XFxcXGQrKT8pXFxcXHMqXCIsXG4gICAgcmVQID0gXCJcXFxccyooWystXT8oPzpcXFxcZCpcXFxcLik/XFxcXGQrKD86W2VFXVsrLV0/XFxcXGQrKT8pJVxcXFxzKlwiLFxuICAgIHJlSGV4ID0gL14jKFswLTlhLWZdezMsOH0pJC8sXG4gICAgcmVSZ2JJbnRlZ2VyID0gbmV3IFJlZ0V4cChgXnJnYlxcXFwoJHtyZUl9LCR7cmVJfSwke3JlSX1cXFxcKSRgKSxcbiAgICByZVJnYlBlcmNlbnQgPSBuZXcgUmVnRXhwKGBecmdiXFxcXCgke3JlUH0sJHtyZVB9LCR7cmVQfVxcXFwpJGApLFxuICAgIHJlUmdiYUludGVnZXIgPSBuZXcgUmVnRXhwKGBecmdiYVxcXFwoJHtyZUl9LCR7cmVJfSwke3JlSX0sJHtyZU59XFxcXCkkYCksXG4gICAgcmVSZ2JhUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5yZ2JhXFxcXCgke3JlUH0sJHtyZVB9LCR7cmVQfSwke3JlTn1cXFxcKSRgKSxcbiAgICByZUhzbFBlcmNlbnQgPSBuZXcgUmVnRXhwKGBeaHNsXFxcXCgke3JlTn0sJHtyZVB9LCR7cmVQfVxcXFwpJGApLFxuICAgIHJlSHNsYVBlcmNlbnQgPSBuZXcgUmVnRXhwKGBeaHNsYVxcXFwoJHtyZU59LCR7cmVQfSwke3JlUH0sJHtyZU59XFxcXCkkYCk7XG5cbnZhciBuYW1lZCA9IHtcbiAgYWxpY2VibHVlOiAweGYwZjhmZixcbiAgYW50aXF1ZXdoaXRlOiAweGZhZWJkNyxcbiAgYXF1YTogMHgwMGZmZmYsXG4gIGFxdWFtYXJpbmU6IDB4N2ZmZmQ0LFxuICBhenVyZTogMHhmMGZmZmYsXG4gIGJlaWdlOiAweGY1ZjVkYyxcbiAgYmlzcXVlOiAweGZmZTRjNCxcbiAgYmxhY2s6IDB4MDAwMDAwLFxuICBibGFuY2hlZGFsbW9uZDogMHhmZmViY2QsXG4gIGJsdWU6IDB4MDAwMGZmLFxuICBibHVldmlvbGV0OiAweDhhMmJlMixcbiAgYnJvd246IDB4YTUyYTJhLFxuICBidXJseXdvb2Q6IDB4ZGViODg3LFxuICBjYWRldGJsdWU6IDB4NWY5ZWEwLFxuICBjaGFydHJldXNlOiAweDdmZmYwMCxcbiAgY2hvY29sYXRlOiAweGQyNjkxZSxcbiAgY29yYWw6IDB4ZmY3ZjUwLFxuICBjb3JuZmxvd2VyYmx1ZTogMHg2NDk1ZWQsXG4gIGNvcm5zaWxrOiAweGZmZjhkYyxcbiAgY3JpbXNvbjogMHhkYzE0M2MsXG4gIGN5YW46IDB4MDBmZmZmLFxuICBkYXJrYmx1ZTogMHgwMDAwOGIsXG4gIGRhcmtjeWFuOiAweDAwOGI4YixcbiAgZGFya2dvbGRlbnJvZDogMHhiODg2MGIsXG4gIGRhcmtncmF5OiAweGE5YTlhOSxcbiAgZGFya2dyZWVuOiAweDAwNjQwMCxcbiAgZGFya2dyZXk6IDB4YTlhOWE5LFxuICBkYXJra2hha2k6IDB4YmRiNzZiLFxuICBkYXJrbWFnZW50YTogMHg4YjAwOGIsXG4gIGRhcmtvbGl2ZWdyZWVuOiAweDU1NmIyZixcbiAgZGFya29yYW5nZTogMHhmZjhjMDAsXG4gIGRhcmtvcmNoaWQ6IDB4OTkzMmNjLFxuICBkYXJrcmVkOiAweDhiMDAwMCxcbiAgZGFya3NhbG1vbjogMHhlOTk2N2EsXG4gIGRhcmtzZWFncmVlbjogMHg4ZmJjOGYsXG4gIGRhcmtzbGF0ZWJsdWU6IDB4NDgzZDhiLFxuICBkYXJrc2xhdGVncmF5OiAweDJmNGY0ZixcbiAgZGFya3NsYXRlZ3JleTogMHgyZjRmNGYsXG4gIGRhcmt0dXJxdW9pc2U6IDB4MDBjZWQxLFxuICBkYXJrdmlvbGV0OiAweDk0MDBkMyxcbiAgZGVlcHBpbms6IDB4ZmYxNDkzLFxuICBkZWVwc2t5Ymx1ZTogMHgwMGJmZmYsXG4gIGRpbWdyYXk6IDB4Njk2OTY5LFxuICBkaW1ncmV5OiAweDY5Njk2OSxcbiAgZG9kZ2VyYmx1ZTogMHgxZTkwZmYsXG4gIGZpcmVicmljazogMHhiMjIyMjIsXG4gIGZsb3JhbHdoaXRlOiAweGZmZmFmMCxcbiAgZm9yZXN0Z3JlZW46IDB4MjI4YjIyLFxuICBmdWNoc2lhOiAweGZmMDBmZixcbiAgZ2FpbnNib3JvOiAweGRjZGNkYyxcbiAgZ2hvc3R3aGl0ZTogMHhmOGY4ZmYsXG4gIGdvbGQ6IDB4ZmZkNzAwLFxuICBnb2xkZW5yb2Q6IDB4ZGFhNTIwLFxuICBncmF5OiAweDgwODA4MCxcbiAgZ3JlZW46IDB4MDA4MDAwLFxuICBncmVlbnllbGxvdzogMHhhZGZmMmYsXG4gIGdyZXk6IDB4ODA4MDgwLFxuICBob25leWRldzogMHhmMGZmZjAsXG4gIGhvdHBpbms6IDB4ZmY2OWI0LFxuICBpbmRpYW5yZWQ6IDB4Y2Q1YzVjLFxuICBpbmRpZ286IDB4NGIwMDgyLFxuICBpdm9yeTogMHhmZmZmZjAsXG4gIGtoYWtpOiAweGYwZTY4YyxcbiAgbGF2ZW5kZXI6IDB4ZTZlNmZhLFxuICBsYXZlbmRlcmJsdXNoOiAweGZmZjBmNSxcbiAgbGF3bmdyZWVuOiAweDdjZmMwMCxcbiAgbGVtb25jaGlmZm9uOiAweGZmZmFjZCxcbiAgbGlnaHRibHVlOiAweGFkZDhlNixcbiAgbGlnaHRjb3JhbDogMHhmMDgwODAsXG4gIGxpZ2h0Y3lhbjogMHhlMGZmZmYsXG4gIGxpZ2h0Z29sZGVucm9keWVsbG93OiAweGZhZmFkMixcbiAgbGlnaHRncmF5OiAweGQzZDNkMyxcbiAgbGlnaHRncmVlbjogMHg5MGVlOTAsXG4gIGxpZ2h0Z3JleTogMHhkM2QzZDMsXG4gIGxpZ2h0cGluazogMHhmZmI2YzEsXG4gIGxpZ2h0c2FsbW9uOiAweGZmYTA3YSxcbiAgbGlnaHRzZWFncmVlbjogMHgyMGIyYWEsXG4gIGxpZ2h0c2t5Ymx1ZTogMHg4N2NlZmEsXG4gIGxpZ2h0c2xhdGVncmF5OiAweDc3ODg5OSxcbiAgbGlnaHRzbGF0ZWdyZXk6IDB4Nzc4ODk5LFxuICBsaWdodHN0ZWVsYmx1ZTogMHhiMGM0ZGUsXG4gIGxpZ2h0eWVsbG93OiAweGZmZmZlMCxcbiAgbGltZTogMHgwMGZmMDAsXG4gIGxpbWVncmVlbjogMHgzMmNkMzIsXG4gIGxpbmVuOiAweGZhZjBlNixcbiAgbWFnZW50YTogMHhmZjAwZmYsXG4gIG1hcm9vbjogMHg4MDAwMDAsXG4gIG1lZGl1bWFxdWFtYXJpbmU6IDB4NjZjZGFhLFxuICBtZWRpdW1ibHVlOiAweDAwMDBjZCxcbiAgbWVkaXVtb3JjaGlkOiAweGJhNTVkMyxcbiAgbWVkaXVtcHVycGxlOiAweDkzNzBkYixcbiAgbWVkaXVtc2VhZ3JlZW46IDB4M2NiMzcxLFxuICBtZWRpdW1zbGF0ZWJsdWU6IDB4N2I2OGVlLFxuICBtZWRpdW1zcHJpbmdncmVlbjogMHgwMGZhOWEsXG4gIG1lZGl1bXR1cnF1b2lzZTogMHg0OGQxY2MsXG4gIG1lZGl1bXZpb2xldHJlZDogMHhjNzE1ODUsXG4gIG1pZG5pZ2h0Ymx1ZTogMHgxOTE5NzAsXG4gIG1pbnRjcmVhbTogMHhmNWZmZmEsXG4gIG1pc3R5cm9zZTogMHhmZmU0ZTEsXG4gIG1vY2Nhc2luOiAweGZmZTRiNSxcbiAgbmF2YWpvd2hpdGU6IDB4ZmZkZWFkLFxuICBuYXZ5OiAweDAwMDA4MCxcbiAgb2xkbGFjZTogMHhmZGY1ZTYsXG4gIG9saXZlOiAweDgwODAwMCxcbiAgb2xpdmVkcmFiOiAweDZiOGUyMyxcbiAgb3JhbmdlOiAweGZmYTUwMCxcbiAgb3JhbmdlcmVkOiAweGZmNDUwMCxcbiAgb3JjaGlkOiAweGRhNzBkNixcbiAgcGFsZWdvbGRlbnJvZDogMHhlZWU4YWEsXG4gIHBhbGVncmVlbjogMHg5OGZiOTgsXG4gIHBhbGV0dXJxdW9pc2U6IDB4YWZlZWVlLFxuICBwYWxldmlvbGV0cmVkOiAweGRiNzA5MyxcbiAgcGFwYXlhd2hpcDogMHhmZmVmZDUsXG4gIHBlYWNocHVmZjogMHhmZmRhYjksXG4gIHBlcnU6IDB4Y2Q4NTNmLFxuICBwaW5rOiAweGZmYzBjYixcbiAgcGx1bTogMHhkZGEwZGQsXG4gIHBvd2RlcmJsdWU6IDB4YjBlMGU2LFxuICBwdXJwbGU6IDB4ODAwMDgwLFxuICByZWJlY2NhcHVycGxlOiAweDY2MzM5OSxcbiAgcmVkOiAweGZmMDAwMCxcbiAgcm9zeWJyb3duOiAweGJjOGY4ZixcbiAgcm95YWxibHVlOiAweDQxNjllMSxcbiAgc2FkZGxlYnJvd246IDB4OGI0NTEzLFxuICBzYWxtb246IDB4ZmE4MDcyLFxuICBzYW5keWJyb3duOiAweGY0YTQ2MCxcbiAgc2VhZ3JlZW46IDB4MmU4YjU3LFxuICBzZWFzaGVsbDogMHhmZmY1ZWUsXG4gIHNpZW5uYTogMHhhMDUyMmQsXG4gIHNpbHZlcjogMHhjMGMwYzAsXG4gIHNreWJsdWU6IDB4ODdjZWViLFxuICBzbGF0ZWJsdWU6IDB4NmE1YWNkLFxuICBzbGF0ZWdyYXk6IDB4NzA4MDkwLFxuICBzbGF0ZWdyZXk6IDB4NzA4MDkwLFxuICBzbm93OiAweGZmZmFmYSxcbiAgc3ByaW5nZ3JlZW46IDB4MDBmZjdmLFxuICBzdGVlbGJsdWU6IDB4NDY4MmI0LFxuICB0YW46IDB4ZDJiNDhjLFxuICB0ZWFsOiAweDAwODA4MCxcbiAgdGhpc3RsZTogMHhkOGJmZDgsXG4gIHRvbWF0bzogMHhmZjYzNDcsXG4gIHR1cnF1b2lzZTogMHg0MGUwZDAsXG4gIHZpb2xldDogMHhlZTgyZWUsXG4gIHdoZWF0OiAweGY1ZGViMyxcbiAgd2hpdGU6IDB4ZmZmZmZmLFxuICB3aGl0ZXNtb2tlOiAweGY1ZjVmNSxcbiAgeWVsbG93OiAweGZmZmYwMCxcbiAgeWVsbG93Z3JlZW46IDB4OWFjZDMyXG59O1xuXG5kZWZpbmUoQ29sb3IsIGNvbG9yLCB7XG4gIGNvcHkoY2hhbm5lbHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgdGhpcy5jb25zdHJ1Y3RvciwgdGhpcywgY2hhbm5lbHMpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZ2IoKS5kaXNwbGF5YWJsZSgpO1xuICB9LFxuICBoZXg6IGNvbG9yX2Zvcm1hdEhleCwgLy8gRGVwcmVjYXRlZCEgVXNlIGNvbG9yLmZvcm1hdEhleC5cbiAgZm9ybWF0SGV4OiBjb2xvcl9mb3JtYXRIZXgsXG4gIGZvcm1hdEhleDg6IGNvbG9yX2Zvcm1hdEhleDgsXG4gIGZvcm1hdEhzbDogY29sb3JfZm9ybWF0SHNsLFxuICBmb3JtYXRSZ2I6IGNvbG9yX2Zvcm1hdFJnYixcbiAgdG9TdHJpbmc6IGNvbG9yX2Zvcm1hdFJnYlxufSk7XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdEhleCgpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0SGV4KCk7XG59XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdEhleDgoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdEhleDgoKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SHNsKCkge1xuICByZXR1cm4gaHNsQ29udmVydCh0aGlzKS5mb3JtYXRIc2woKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0UmdiKCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRSZ2IoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29sb3IoZm9ybWF0KSB7XG4gIHZhciBtLCBsO1xuICBmb3JtYXQgPSAoZm9ybWF0ICsgXCJcIikudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gIHJldHVybiAobSA9IHJlSGV4LmV4ZWMoZm9ybWF0KSkgPyAobCA9IG1bMV0ubGVuZ3RoLCBtID0gcGFyc2VJbnQobVsxXSwgMTYpLCBsID09PSA2ID8gcmdibihtKSAvLyAjZmYwMDAwXG4gICAgICA6IGwgPT09IDMgPyBuZXcgUmdiKChtID4+IDggJiAweGYpIHwgKG0gPj4gNCAmIDB4ZjApLCAobSA+PiA0ICYgMHhmKSB8IChtICYgMHhmMCksICgobSAmIDB4ZikgPDwgNCkgfCAobSAmIDB4ZiksIDEpIC8vICNmMDBcbiAgICAgIDogbCA9PT0gOCA/IHJnYmEobSA+PiAyNCAmIDB4ZmYsIG0gPj4gMTYgJiAweGZmLCBtID4+IDggJiAweGZmLCAobSAmIDB4ZmYpIC8gMHhmZikgLy8gI2ZmMDAwMDAwXG4gICAgICA6IGwgPT09IDQgPyByZ2JhKChtID4+IDEyICYgMHhmKSB8IChtID4+IDggJiAweGYwKSwgKG0gPj4gOCAmIDB4ZikgfCAobSA+PiA0ICYgMHhmMCksIChtID4+IDQgJiAweGYpIHwgKG0gJiAweGYwKSwgKCgobSAmIDB4ZikgPDwgNCkgfCAobSAmIDB4ZikpIC8gMHhmZikgLy8gI2YwMDBcbiAgICAgIDogbnVsbCkgLy8gaW52YWxpZCBoZXhcbiAgICAgIDogKG0gPSByZVJnYkludGVnZXIuZXhlYyhmb3JtYXQpKSA/IG5ldyBSZ2IobVsxXSwgbVsyXSwgbVszXSwgMSkgLy8gcmdiKDI1NSwgMCwgMClcbiAgICAgIDogKG0gPSByZVJnYlBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IG5ldyBSZ2IobVsxXSAqIDI1NSAvIDEwMCwgbVsyXSAqIDI1NSAvIDEwMCwgbVszXSAqIDI1NSAvIDEwMCwgMSkgLy8gcmdiKDEwMCUsIDAlLCAwJSlcbiAgICAgIDogKG0gPSByZVJnYmFJbnRlZ2VyLmV4ZWMoZm9ybWF0KSkgPyByZ2JhKG1bMV0sIG1bMl0sIG1bM10sIG1bNF0pIC8vIHJnYmEoMjU1LCAwLCAwLCAxKVxuICAgICAgOiAobSA9IHJlUmdiYVBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IHJnYmEobVsxXSAqIDI1NSAvIDEwMCwgbVsyXSAqIDI1NSAvIDEwMCwgbVszXSAqIDI1NSAvIDEwMCwgbVs0XSkgLy8gcmdiKDEwMCUsIDAlLCAwJSwgMSlcbiAgICAgIDogKG0gPSByZUhzbFBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IGhzbGEobVsxXSwgbVsyXSAvIDEwMCwgbVszXSAvIDEwMCwgMSkgLy8gaHNsKDEyMCwgNTAlLCA1MCUpXG4gICAgICA6IChtID0gcmVIc2xhUGVyY2VudC5leGVjKGZvcm1hdCkpID8gaHNsYShtWzFdLCBtWzJdIC8gMTAwLCBtWzNdIC8gMTAwLCBtWzRdKSAvLyBoc2xhKDEyMCwgNTAlLCA1MCUsIDEpXG4gICAgICA6IG5hbWVkLmhhc093blByb3BlcnR5KGZvcm1hdCkgPyByZ2JuKG5hbWVkW2Zvcm1hdF0pIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gICAgICA6IGZvcm1hdCA9PT0gXCJ0cmFuc3BhcmVudFwiID8gbmV3IFJnYihOYU4sIE5hTiwgTmFOLCAwKVxuICAgICAgOiBudWxsO1xufVxuXG5mdW5jdGlvbiByZ2JuKG4pIHtcbiAgcmV0dXJuIG5ldyBSZ2IobiA+PiAxNiAmIDB4ZmYsIG4gPj4gOCAmIDB4ZmYsIG4gJiAweGZmLCAxKTtcbn1cblxuZnVuY3Rpb24gcmdiYShyLCBnLCBiLCBhKSB7XG4gIGlmIChhIDw9IDApIHIgPSBnID0gYiA9IE5hTjtcbiAgcmV0dXJuIG5ldyBSZ2IociwgZywgYiwgYSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZ2JDb252ZXJ0KG8pIHtcbiAgaWYgKCEobyBpbnN0YW5jZW9mIENvbG9yKSkgbyA9IGNvbG9yKG8pO1xuICBpZiAoIW8pIHJldHVybiBuZXcgUmdiO1xuICBvID0gby5yZ2IoKTtcbiAgcmV0dXJuIG5ldyBSZ2Ioby5yLCBvLmcsIG8uYiwgby5vcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYihyLCBnLCBiLCBvcGFjaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gcmdiQ29udmVydChyKSA6IG5ldyBSZ2IociwgZywgYiwgb3BhY2l0eSA9PSBudWxsID8gMSA6IG9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmdiKHIsIGcsIGIsIG9wYWNpdHkpIHtcbiAgdGhpcy5yID0gK3I7XG4gIHRoaXMuZyA9ICtnO1xuICB0aGlzLmIgPSArYjtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShSZ2IsIHJnYiwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gYnJpZ2h0ZXIgOiBNYXRoLnBvdyhicmlnaHRlciwgayk7XG4gICAgcmV0dXJuIG5ldyBSZ2IodGhpcy5yICogaywgdGhpcy5nICogaywgdGhpcy5iICogaywgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgZGFya2VyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gZGFya2VyIDogTWF0aC5wb3coZGFya2VyLCBrKTtcbiAgICByZXR1cm4gbmV3IFJnYih0aGlzLnIgKiBrLCB0aGlzLmcgKiBrLCB0aGlzLmIgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICByZ2IoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNsYW1wKCkge1xuICAgIHJldHVybiBuZXcgUmdiKGNsYW1waSh0aGlzLnIpLCBjbGFtcGkodGhpcy5nKSwgY2xhbXBpKHRoaXMuYiksIGNsYW1wYSh0aGlzLm9wYWNpdHkpKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuICgtMC41IDw9IHRoaXMuciAmJiB0aGlzLnIgPCAyNTUuNSlcbiAgICAgICAgJiYgKC0wLjUgPD0gdGhpcy5nICYmIHRoaXMuZyA8IDI1NS41KVxuICAgICAgICAmJiAoLTAuNSA8PSB0aGlzLmIgJiYgdGhpcy5iIDwgMjU1LjUpXG4gICAgICAgICYmICgwIDw9IHRoaXMub3BhY2l0eSAmJiB0aGlzLm9wYWNpdHkgPD0gMSk7XG4gIH0sXG4gIGhleDogcmdiX2Zvcm1hdEhleCwgLy8gRGVwcmVjYXRlZCEgVXNlIGNvbG9yLmZvcm1hdEhleC5cbiAgZm9ybWF0SGV4OiByZ2JfZm9ybWF0SGV4LFxuICBmb3JtYXRIZXg4OiByZ2JfZm9ybWF0SGV4OCxcbiAgZm9ybWF0UmdiOiByZ2JfZm9ybWF0UmdiLFxuICB0b1N0cmluZzogcmdiX2Zvcm1hdFJnYlxufSkpO1xuXG5mdW5jdGlvbiByZ2JfZm9ybWF0SGV4KCkge1xuICByZXR1cm4gYCMke2hleCh0aGlzLnIpfSR7aGV4KHRoaXMuZyl9JHtoZXgodGhpcy5iKX1gO1xufVxuXG5mdW5jdGlvbiByZ2JfZm9ybWF0SGV4OCgpIHtcbiAgcmV0dXJuIGAjJHtoZXgodGhpcy5yKX0ke2hleCh0aGlzLmcpfSR7aGV4KHRoaXMuYil9JHtoZXgoKGlzTmFOKHRoaXMub3BhY2l0eSkgPyAxIDogdGhpcy5vcGFjaXR5KSAqIDI1NSl9YDtcbn1cblxuZnVuY3Rpb24gcmdiX2Zvcm1hdFJnYigpIHtcbiAgY29uc3QgYSA9IGNsYW1wYSh0aGlzLm9wYWNpdHkpO1xuICByZXR1cm4gYCR7YSA9PT0gMSA/IFwicmdiKFwiIDogXCJyZ2JhKFwifSR7Y2xhbXBpKHRoaXMucil9LCAke2NsYW1waSh0aGlzLmcpfSwgJHtjbGFtcGkodGhpcy5iKX0ke2EgPT09IDEgPyBcIilcIiA6IGAsICR7YX0pYH1gO1xufVxuXG5mdW5jdGlvbiBjbGFtcGEob3BhY2l0eSkge1xuICByZXR1cm4gaXNOYU4ob3BhY2l0eSkgPyAxIDogTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgb3BhY2l0eSkpO1xufVxuXG5mdW5jdGlvbiBjbGFtcGkodmFsdWUpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDI1NSwgTWF0aC5yb3VuZCh2YWx1ZSkgfHwgMCkpO1xufVxuXG5mdW5jdGlvbiBoZXgodmFsdWUpIHtcbiAgdmFsdWUgPSBjbGFtcGkodmFsdWUpO1xuICByZXR1cm4gKHZhbHVlIDwgMTYgPyBcIjBcIiA6IFwiXCIpICsgdmFsdWUudG9TdHJpbmcoMTYpO1xufVxuXG5mdW5jdGlvbiBoc2xhKGgsIHMsIGwsIGEpIHtcbiAgaWYgKGEgPD0gMCkgaCA9IHMgPSBsID0gTmFOO1xuICBlbHNlIGlmIChsIDw9IDAgfHwgbCA+PSAxKSBoID0gcyA9IE5hTjtcbiAgZWxzZSBpZiAocyA8PSAwKSBoID0gTmFOO1xuICByZXR1cm4gbmV3IEhzbChoLCBzLCBsLCBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhzbENvbnZlcnQobykge1xuICBpZiAobyBpbnN0YW5jZW9mIEhzbCkgcmV0dXJuIG5ldyBIc2woby5oLCBvLnMsIG8ubCwgby5vcGFjaXR5KTtcbiAgaWYgKCEobyBpbnN0YW5jZW9mIENvbG9yKSkgbyA9IGNvbG9yKG8pO1xuICBpZiAoIW8pIHJldHVybiBuZXcgSHNsO1xuICBpZiAobyBpbnN0YW5jZW9mIEhzbCkgcmV0dXJuIG87XG4gIG8gPSBvLnJnYigpO1xuICB2YXIgciA9IG8uciAvIDI1NSxcbiAgICAgIGcgPSBvLmcgLyAyNTUsXG4gICAgICBiID0gby5iIC8gMjU1LFxuICAgICAgbWluID0gTWF0aC5taW4ociwgZywgYiksXG4gICAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKSxcbiAgICAgIGggPSBOYU4sXG4gICAgICBzID0gbWF4IC0gbWluLFxuICAgICAgbCA9IChtYXggKyBtaW4pIC8gMjtcbiAgaWYgKHMpIHtcbiAgICBpZiAociA9PT0gbWF4KSBoID0gKGcgLSBiKSAvIHMgKyAoZyA8IGIpICogNjtcbiAgICBlbHNlIGlmIChnID09PSBtYXgpIGggPSAoYiAtIHIpIC8gcyArIDI7XG4gICAgZWxzZSBoID0gKHIgLSBnKSAvIHMgKyA0O1xuICAgIHMgLz0gbCA8IDAuNSA/IG1heCArIG1pbiA6IDIgLSBtYXggLSBtaW47XG4gICAgaCAqPSA2MDtcbiAgfSBlbHNlIHtcbiAgICBzID0gbCA+IDAgJiYgbCA8IDEgPyAwIDogaDtcbiAgfVxuICByZXR1cm4gbmV3IEhzbChoLCBzLCBsLCBvLm9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHNsKGgsIHMsIGwsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBoc2xDb252ZXJ0KGgpIDogbmV3IEhzbChoLCBzLCBsLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmZ1bmN0aW9uIEhzbChoLCBzLCBsLCBvcGFjaXR5KSB7XG4gIHRoaXMuaCA9ICtoO1xuICB0aGlzLnMgPSArcztcbiAgdGhpcy5sID0gK2w7XG4gIHRoaXMub3BhY2l0eSA9ICtvcGFjaXR5O1xufVxuXG5kZWZpbmUoSHNsLCBoc2wsIGV4dGVuZChDb2xvciwge1xuICBicmlnaHRlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGJyaWdodGVyIDogTWF0aC5wb3coYnJpZ2h0ZXIsIGspO1xuICAgIHJldHVybiBuZXcgSHNsKHRoaXMuaCwgdGhpcy5zLCB0aGlzLmwgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBkYXJrZXIgOiBNYXRoLnBvdyhkYXJrZXIsIGspO1xuICAgIHJldHVybiBuZXcgSHNsKHRoaXMuaCwgdGhpcy5zLCB0aGlzLmwgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICByZ2IoKSB7XG4gICAgdmFyIGggPSB0aGlzLmggJSAzNjAgKyAodGhpcy5oIDwgMCkgKiAzNjAsXG4gICAgICAgIHMgPSBpc05hTihoKSB8fCBpc05hTih0aGlzLnMpID8gMCA6IHRoaXMucyxcbiAgICAgICAgbCA9IHRoaXMubCxcbiAgICAgICAgbTIgPSBsICsgKGwgPCAwLjUgPyBsIDogMSAtIGwpICogcyxcbiAgICAgICAgbTEgPSAyICogbCAtIG0yO1xuICAgIHJldHVybiBuZXcgUmdiKFxuICAgICAgaHNsMnJnYihoID49IDI0MCA/IGggLSAyNDAgOiBoICsgMTIwLCBtMSwgbTIpLFxuICAgICAgaHNsMnJnYihoLCBtMSwgbTIpLFxuICAgICAgaHNsMnJnYihoIDwgMTIwID8gaCArIDI0MCA6IGggLSAxMjAsIG0xLCBtMiksXG4gICAgICB0aGlzLm9wYWNpdHlcbiAgICApO1xuICB9LFxuICBjbGFtcCgpIHtcbiAgICByZXR1cm4gbmV3IEhzbChjbGFtcGgodGhpcy5oKSwgY2xhbXB0KHRoaXMucyksIGNsYW1wdCh0aGlzLmwpLCBjbGFtcGEodGhpcy5vcGFjaXR5KSk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiAoMCA8PSB0aGlzLnMgJiYgdGhpcy5zIDw9IDEgfHwgaXNOYU4odGhpcy5zKSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5sICYmIHRoaXMubCA8PSAxKVxuICAgICAgICAmJiAoMCA8PSB0aGlzLm9wYWNpdHkgJiYgdGhpcy5vcGFjaXR5IDw9IDEpO1xuICB9LFxuICBmb3JtYXRIc2woKSB7XG4gICAgY29uc3QgYSA9IGNsYW1wYSh0aGlzLm9wYWNpdHkpO1xuICAgIHJldHVybiBgJHthID09PSAxID8gXCJoc2woXCIgOiBcImhzbGEoXCJ9JHtjbGFtcGgodGhpcy5oKX0sICR7Y2xhbXB0KHRoaXMucykgKiAxMDB9JSwgJHtjbGFtcHQodGhpcy5sKSAqIDEwMH0lJHthID09PSAxID8gXCIpXCIgOiBgLCAke2F9KWB9YDtcbiAgfVxufSkpO1xuXG5mdW5jdGlvbiBjbGFtcGgodmFsdWUpIHtcbiAgdmFsdWUgPSAodmFsdWUgfHwgMCkgJSAzNjA7XG4gIHJldHVybiB2YWx1ZSA8IDAgPyB2YWx1ZSArIDM2MCA6IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBjbGFtcHQodmFsdWUpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHZhbHVlIHx8IDApKTtcbn1cblxuLyogRnJvbSBGdkQgMTMuMzcsIENTUyBDb2xvciBNb2R1bGUgTGV2ZWwgMyAqL1xuZnVuY3Rpb24gaHNsMnJnYihoLCBtMSwgbTIpIHtcbiAgcmV0dXJuIChoIDwgNjAgPyBtMSArIChtMiAtIG0xKSAqIGggLyA2MFxuICAgICAgOiBoIDwgMTgwID8gbTJcbiAgICAgIDogaCA8IDI0MCA/IG0xICsgKG0yIC0gbTEpICogKDI0MCAtIGgpIC8gNjBcbiAgICAgIDogbTEpICogMjU1O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgeCA9PiAoKSA9PiB4O1xuIiwiaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5cbmZ1bmN0aW9uIGxpbmVhcihhLCBkKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGEgKyB0ICogZDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZXhwb25lbnRpYWwoYSwgYiwgeSkge1xuICByZXR1cm4gYSA9IE1hdGgucG93KGEsIHkpLCBiID0gTWF0aC5wb3coYiwgeSkgLSBhLCB5ID0gMSAvIHksIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gTWF0aC5wb3coYSArIHQgKiBiLCB5KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh1ZShhLCBiKSB7XG4gIHZhciBkID0gYiAtIGE7XG4gIHJldHVybiBkID8gbGluZWFyKGEsIGQgPiAxODAgfHwgZCA8IC0xODAgPyBkIC0gMzYwICogTWF0aC5yb3VuZChkIC8gMzYwKSA6IGQpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnYW1tYSh5KSB7XG4gIHJldHVybiAoeSA9ICt5KSA9PT0gMSA/IG5vZ2FtbWEgOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGIgLSBhID8gZXhwb25lbnRpYWwoYSwgYiwgeSkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbm9nYW1tYShhLCBiKSB7XG4gIHZhciBkID0gYiAtIGE7XG4gIHJldHVybiBkID8gbGluZWFyKGEsIGQpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG59XG4iLCJpbXBvcnQge3JnYiBhcyBjb2xvclJnYn0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQgYmFzaXMgZnJvbSBcIi4vYmFzaXMuanNcIjtcbmltcG9ydCBiYXNpc0Nsb3NlZCBmcm9tIFwiLi9iYXNpc0Nsb3NlZC5qc1wiO1xuaW1wb3J0IG5vZ2FtbWEsIHtnYW1tYX0gZnJvbSBcIi4vY29sb3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uIHJnYkdhbW1hKHkpIHtcbiAgdmFyIGNvbG9yID0gZ2FtbWEoeSk7XG5cbiAgZnVuY3Rpb24gcmdiKHN0YXJ0LCBlbmQpIHtcbiAgICB2YXIgciA9IGNvbG9yKChzdGFydCA9IGNvbG9yUmdiKHN0YXJ0KSkuciwgKGVuZCA9IGNvbG9yUmdiKGVuZCkpLnIpLFxuICAgICAgICBnID0gY29sb3Ioc3RhcnQuZywgZW5kLmcpLFxuICAgICAgICBiID0gY29sb3Ioc3RhcnQuYiwgZW5kLmIpLFxuICAgICAgICBvcGFjaXR5ID0gbm9nYW1tYShzdGFydC5vcGFjaXR5LCBlbmQub3BhY2l0eSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHN0YXJ0LnIgPSByKHQpO1xuICAgICAgc3RhcnQuZyA9IGcodCk7XG4gICAgICBzdGFydC5iID0gYih0KTtcbiAgICAgIHN0YXJ0Lm9wYWNpdHkgPSBvcGFjaXR5KHQpO1xuICAgICAgcmV0dXJuIHN0YXJ0ICsgXCJcIjtcbiAgICB9O1xuICB9XG5cbiAgcmdiLmdhbW1hID0gcmdiR2FtbWE7XG5cbiAgcmV0dXJuIHJnYjtcbn0pKDEpO1xuXG5mdW5jdGlvbiByZ2JTcGxpbmUoc3BsaW5lKSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xvcnMpIHtcbiAgICB2YXIgbiA9IGNvbG9ycy5sZW5ndGgsXG4gICAgICAgIHIgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGcgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGIgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGksIGNvbG9yO1xuICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGNvbG9yID0gY29sb3JSZ2IoY29sb3JzW2ldKTtcbiAgICAgIHJbaV0gPSBjb2xvci5yIHx8IDA7XG4gICAgICBnW2ldID0gY29sb3IuZyB8fCAwO1xuICAgICAgYltpXSA9IGNvbG9yLmIgfHwgMDtcbiAgICB9XG4gICAgciA9IHNwbGluZShyKTtcbiAgICBnID0gc3BsaW5lKGcpO1xuICAgIGIgPSBzcGxpbmUoYik7XG4gICAgY29sb3Iub3BhY2l0eSA9IDE7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIGNvbG9yLnIgPSByKHQpO1xuICAgICAgY29sb3IuZyA9IGcodCk7XG4gICAgICBjb2xvci5iID0gYih0KTtcbiAgICAgIHJldHVybiBjb2xvciArIFwiXCI7XG4gICAgfTtcbiAgfTtcbn1cblxuZXhwb3J0IHZhciByZ2JCYXNpcyA9IHJnYlNwbGluZShiYXNpcyk7XG5leHBvcnQgdmFyIHJnYkJhc2lzQ2xvc2VkID0gcmdiU3BsaW5lKGJhc2lzQ2xvc2VkKTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgaWYgKCFiKSBiID0gW107XG4gIHZhciBuID0gYSA/IE1hdGgubWluKGIubGVuZ3RoLCBhLmxlbmd0aCkgOiAwLFxuICAgICAgYyA9IGIuc2xpY2UoKSxcbiAgICAgIGk7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkgY1tpXSA9IGFbaV0gKiAoMSAtIHQpICsgYltpXSAqIHQ7XG4gICAgcmV0dXJuIGM7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlckFycmF5KHgpIHtcbiAgcmV0dXJuIEFycmF5QnVmZmVyLmlzVmlldyh4KSAmJiAhKHggaW5zdGFuY2VvZiBEYXRhVmlldyk7XG59XG4iLCJpbXBvcnQgdmFsdWUgZnJvbSBcIi4vdmFsdWUuanNcIjtcbmltcG9ydCBudW1iZXJBcnJheSwge2lzTnVtYmVyQXJyYXl9IGZyb20gXCIuL251bWJlckFycmF5LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIChpc051bWJlckFycmF5KGIpID8gbnVtYmVyQXJyYXkgOiBnZW5lcmljQXJyYXkpKGEsIGIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJpY0FycmF5KGEsIGIpIHtcbiAgdmFyIG5iID0gYiA/IGIubGVuZ3RoIDogMCxcbiAgICAgIG5hID0gYSA/IE1hdGgubWluKG5iLCBhLmxlbmd0aCkgOiAwLFxuICAgICAgeCA9IG5ldyBBcnJheShuYSksXG4gICAgICBjID0gbmV3IEFycmF5KG5iKSxcbiAgICAgIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IG5hOyArK2kpIHhbaV0gPSB2YWx1ZShhW2ldLCBiW2ldKTtcbiAgZm9yICg7IGkgPCBuYjsgKytpKSBjW2ldID0gYltpXTtcblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBuYTsgKytpKSBjW2ldID0geFtpXSh0KTtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZTtcbiAgcmV0dXJuIGEgPSArYSwgYiA9ICtiLCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGQuc2V0VGltZShhICogKDEgLSB0KSArIGIgKiB0KSwgZDtcbiAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGEgPSArYSwgYiA9ICtiLCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGEgKiAoMSAtIHQpICsgYiAqIHQ7XG4gIH07XG59XG4iLCJpbXBvcnQgdmFsdWUgZnJvbSBcIi4vdmFsdWUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgaSA9IHt9LFxuICAgICAgYyA9IHt9LFxuICAgICAgaztcblxuICBpZiAoYSA9PT0gbnVsbCB8fCB0eXBlb2YgYSAhPT0gXCJvYmplY3RcIikgYSA9IHt9O1xuICBpZiAoYiA9PT0gbnVsbCB8fCB0eXBlb2YgYiAhPT0gXCJvYmplY3RcIikgYiA9IHt9O1xuXG4gIGZvciAoayBpbiBiKSB7XG4gICAgaWYgKGsgaW4gYSkge1xuICAgICAgaVtrXSA9IHZhbHVlKGFba10sIGJba10pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjW2tdID0gYltrXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoayBpbiBpKSBjW2tdID0gaVtrXSh0KTtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cbiIsImltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbnZhciByZUEgPSAvWy0rXT8oPzpcXGQrXFwuP1xcZCp8XFwuP1xcZCspKD86W2VFXVstK10/XFxkKyk/L2csXG4gICAgcmVCID0gbmV3IFJlZ0V4cChyZUEuc291cmNlLCBcImdcIik7XG5cbmZ1bmN0aW9uIHplcm8oYikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGI7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9uZShiKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGIodCkgKyBcIlwiO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBiaSA9IHJlQS5sYXN0SW5kZXggPSByZUIubGFzdEluZGV4ID0gMCwgLy8gc2NhbiBpbmRleCBmb3IgbmV4dCBudW1iZXIgaW4gYlxuICAgICAgYW0sIC8vIGN1cnJlbnQgbWF0Y2ggaW4gYVxuICAgICAgYm0sIC8vIGN1cnJlbnQgbWF0Y2ggaW4gYlxuICAgICAgYnMsIC8vIHN0cmluZyBwcmVjZWRpbmcgY3VycmVudCBudW1iZXIgaW4gYiwgaWYgYW55XG4gICAgICBpID0gLTEsIC8vIGluZGV4IGluIHNcbiAgICAgIHMgPSBbXSwgLy8gc3RyaW5nIGNvbnN0YW50cyBhbmQgcGxhY2Vob2xkZXJzXG4gICAgICBxID0gW107IC8vIG51bWJlciBpbnRlcnBvbGF0b3JzXG5cbiAgLy8gQ29lcmNlIGlucHV0cyB0byBzdHJpbmdzLlxuICBhID0gYSArIFwiXCIsIGIgPSBiICsgXCJcIjtcblxuICAvLyBJbnRlcnBvbGF0ZSBwYWlycyBvZiBudW1iZXJzIGluIGEgJiBiLlxuICB3aGlsZSAoKGFtID0gcmVBLmV4ZWMoYSkpXG4gICAgICAmJiAoYm0gPSByZUIuZXhlYyhiKSkpIHtcbiAgICBpZiAoKGJzID0gYm0uaW5kZXgpID4gYmkpIHsgLy8gYSBzdHJpbmcgcHJlY2VkZXMgdGhlIG5leHQgbnVtYmVyIGluIGJcbiAgICAgIGJzID0gYi5zbGljZShiaSwgYnMpO1xuICAgICAgaWYgKHNbaV0pIHNbaV0gKz0gYnM7IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgICBlbHNlIHNbKytpXSA9IGJzO1xuICAgIH1cbiAgICBpZiAoKGFtID0gYW1bMF0pID09PSAoYm0gPSBibVswXSkpIHsgLy8gbnVtYmVycyBpbiBhICYgYiBtYXRjaFxuICAgICAgaWYgKHNbaV0pIHNbaV0gKz0gYm07IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgICBlbHNlIHNbKytpXSA9IGJtO1xuICAgIH0gZWxzZSB7IC8vIGludGVycG9sYXRlIG5vbi1tYXRjaGluZyBudW1iZXJzXG4gICAgICBzWysraV0gPSBudWxsO1xuICAgICAgcS5wdXNoKHtpOiBpLCB4OiBudW1iZXIoYW0sIGJtKX0pO1xuICAgIH1cbiAgICBiaSA9IHJlQi5sYXN0SW5kZXg7XG4gIH1cblxuICAvLyBBZGQgcmVtYWlucyBvZiBiLlxuICBpZiAoYmkgPCBiLmxlbmd0aCkge1xuICAgIGJzID0gYi5zbGljZShiaSk7XG4gICAgaWYgKHNbaV0pIHNbaV0gKz0gYnM7IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgZWxzZSBzWysraV0gPSBicztcbiAgfVxuXG4gIC8vIFNwZWNpYWwgb3B0aW1pemF0aW9uIGZvciBvbmx5IGEgc2luZ2xlIG1hdGNoLlxuICAvLyBPdGhlcndpc2UsIGludGVycG9sYXRlIGVhY2ggb2YgdGhlIG51bWJlcnMgYW5kIHJlam9pbiB0aGUgc3RyaW5nLlxuICByZXR1cm4gcy5sZW5ndGggPCAyID8gKHFbMF1cbiAgICAgID8gb25lKHFbMF0ueClcbiAgICAgIDogemVybyhiKSlcbiAgICAgIDogKGIgPSBxLmxlbmd0aCwgZnVuY3Rpb24odCkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBvOyBpIDwgYjsgKytpKSBzWyhvID0gcVtpXSkuaV0gPSBvLngodCk7XG4gICAgICAgICAgcmV0dXJuIHMuam9pbihcIlwiKTtcbiAgICAgICAgfSk7XG59XG4iLCJpbXBvcnQge2NvbG9yfSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCByZ2IgZnJvbSBcIi4vcmdiLmpzXCI7XG5pbXBvcnQge2dlbmVyaWNBcnJheX0gZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCBkYXRlIGZyb20gXCIuL2RhdGUuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5pbXBvcnQgb2JqZWN0IGZyb20gXCIuL29iamVjdC5qc1wiO1xuaW1wb3J0IHN0cmluZyBmcm9tIFwiLi9zdHJpbmcuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IG51bWJlckFycmF5LCB7aXNOdW1iZXJBcnJheX0gZnJvbSBcIi4vbnVtYmVyQXJyYXkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgdCA9IHR5cGVvZiBiLCBjO1xuICByZXR1cm4gYiA9PSBudWxsIHx8IHQgPT09IFwiYm9vbGVhblwiID8gY29uc3RhbnQoYilcbiAgICAgIDogKHQgPT09IFwibnVtYmVyXCIgPyBudW1iZXJcbiAgICAgIDogdCA9PT0gXCJzdHJpbmdcIiA/ICgoYyA9IGNvbG9yKGIpKSA/IChiID0gYywgcmdiKSA6IHN0cmluZylcbiAgICAgIDogYiBpbnN0YW5jZW9mIGNvbG9yID8gcmdiXG4gICAgICA6IGIgaW5zdGFuY2VvZiBEYXRlID8gZGF0ZVxuICAgICAgOiBpc051bWJlckFycmF5KGIpID8gbnVtYmVyQXJyYXlcbiAgICAgIDogQXJyYXkuaXNBcnJheShiKSA/IGdlbmVyaWNBcnJheVxuICAgICAgOiB0eXBlb2YgYi52YWx1ZU9mICE9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGIudG9TdHJpbmcgIT09IFwiZnVuY3Rpb25cIiB8fCBpc05hTihiKSA/IG9iamVjdFxuICAgICAgOiBudW1iZXIpKGEsIGIpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChhICogKDEgLSB0KSArIGIgKiB0KTtcbiAgfTtcbn1cbiIsInZhciBkZWdyZWVzID0gMTgwIC8gTWF0aC5QSTtcblxuZXhwb3J0IHZhciBpZGVudGl0eSA9IHtcbiAgdHJhbnNsYXRlWDogMCxcbiAgdHJhbnNsYXRlWTogMCxcbiAgcm90YXRlOiAwLFxuICBza2V3WDogMCxcbiAgc2NhbGVYOiAxLFxuICBzY2FsZVk6IDFcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgdmFyIHNjYWxlWCwgc2NhbGVZLCBza2V3WDtcbiAgaWYgKHNjYWxlWCA9IE1hdGguc3FydChhICogYSArIGIgKiBiKSkgYSAvPSBzY2FsZVgsIGIgLz0gc2NhbGVYO1xuICBpZiAoc2tld1ggPSBhICogYyArIGIgKiBkKSBjIC09IGEgKiBza2V3WCwgZCAtPSBiICogc2tld1g7XG4gIGlmIChzY2FsZVkgPSBNYXRoLnNxcnQoYyAqIGMgKyBkICogZCkpIGMgLz0gc2NhbGVZLCBkIC89IHNjYWxlWSwgc2tld1ggLz0gc2NhbGVZO1xuICBpZiAoYSAqIGQgPCBiICogYykgYSA9IC1hLCBiID0gLWIsIHNrZXdYID0gLXNrZXdYLCBzY2FsZVggPSAtc2NhbGVYO1xuICByZXR1cm4ge1xuICAgIHRyYW5zbGF0ZVg6IGUsXG4gICAgdHJhbnNsYXRlWTogZixcbiAgICByb3RhdGU6IE1hdGguYXRhbjIoYiwgYSkgKiBkZWdyZWVzLFxuICAgIHNrZXdYOiBNYXRoLmF0YW4oc2tld1gpICogZGVncmVlcyxcbiAgICBzY2FsZVg6IHNjYWxlWCxcbiAgICBzY2FsZVk6IHNjYWxlWVxuICB9O1xufVxuIiwiaW1wb3J0IGRlY29tcG9zZSwge2lkZW50aXR5fSBmcm9tIFwiLi9kZWNvbXBvc2UuanNcIjtcblxudmFyIHN2Z05vZGU7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDc3ModmFsdWUpIHtcbiAgY29uc3QgbSA9IG5ldyAodHlwZW9mIERPTU1hdHJpeCA9PT0gXCJmdW5jdGlvblwiID8gRE9NTWF0cml4IDogV2ViS2l0Q1NTTWF0cml4KSh2YWx1ZSArIFwiXCIpO1xuICByZXR1cm4gbS5pc0lkZW50aXR5ID8gaWRlbnRpdHkgOiBkZWNvbXBvc2UobS5hLCBtLmIsIG0uYywgbS5kLCBtLmUsIG0uZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN2Zyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGlkZW50aXR5O1xuICBpZiAoIXN2Z05vZGUpIHN2Z05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImdcIik7XG4gIHN2Z05vZGUuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIHZhbHVlKTtcbiAgaWYgKCEodmFsdWUgPSBzdmdOb2RlLnRyYW5zZm9ybS5iYXNlVmFsLmNvbnNvbGlkYXRlKCkpKSByZXR1cm4gaWRlbnRpdHk7XG4gIHZhbHVlID0gdmFsdWUubWF0cml4O1xuICByZXR1cm4gZGVjb21wb3NlKHZhbHVlLmEsIHZhbHVlLmIsIHZhbHVlLmMsIHZhbHVlLmQsIHZhbHVlLmUsIHZhbHVlLmYpO1xufVxuIiwiaW1wb3J0IG51bWJlciBmcm9tIFwiLi4vbnVtYmVyLmpzXCI7XG5pbXBvcnQge3BhcnNlQ3NzLCBwYXJzZVN2Z30gZnJvbSBcIi4vcGFyc2UuanNcIjtcblxuZnVuY3Rpb24gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2UsIHB4Q29tbWEsIHB4UGFyZW4sIGRlZ1BhcmVuKSB7XG5cbiAgZnVuY3Rpb24gcG9wKHMpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPyBzLnBvcCgpICsgXCIgXCIgOiBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKHhhLCB5YSwgeGIsIHliLCBzLCBxKSB7XG4gICAgaWYgKHhhICE9PSB4YiB8fCB5YSAhPT0geWIpIHtcbiAgICAgIHZhciBpID0gcy5wdXNoKFwidHJhbnNsYXRlKFwiLCBudWxsLCBweENvbW1hLCBudWxsLCBweFBhcmVuKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgfHwgeWIpIHtcbiAgICAgIHMucHVzaChcInRyYW5zbGF0ZShcIiArIHhiICsgcHhDb21tYSArIHliICsgcHhQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcm90YXRlKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgaWYgKGEgLSBiID4gMTgwKSBiICs9IDM2MDsgZWxzZSBpZiAoYiAtIGEgPiAxODApIGEgKz0gMzYwOyAvLyBzaG9ydGVzdCBwYXRoXG4gICAgICBxLnB1c2goe2k6IHMucHVzaChwb3AocykgKyBcInJvdGF0ZShcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJyb3RhdGUoXCIgKyBiICsgZGVnUGFyZW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNrZXdYKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgcS5wdXNoKHtpOiBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiArIGIgKyBkZWdQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeGEsIHlhLCB4YiwgeWIsIHMsIHEpIHtcbiAgICBpZiAoeGEgIT09IHhiIHx8IHlhICE9PSB5Yikge1xuICAgICAgdmFyIGkgPSBzLnB1c2gocG9wKHMpICsgXCJzY2FsZShcIiwgbnVsbCwgXCIsXCIsIG51bGwsIFwiKVwiKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgIT09IDEgfHwgeWIgIT09IDEpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInNjYWxlKFwiICsgeGIgKyBcIixcIiArIHliICsgXCIpXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHMgPSBbXSwgLy8gc3RyaW5nIGNvbnN0YW50cyBhbmQgcGxhY2Vob2xkZXJzXG4gICAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcbiAgICBhID0gcGFyc2UoYSksIGIgPSBwYXJzZShiKTtcbiAgICB0cmFuc2xhdGUoYS50cmFuc2xhdGVYLCBhLnRyYW5zbGF0ZVksIGIudHJhbnNsYXRlWCwgYi50cmFuc2xhdGVZLCBzLCBxKTtcbiAgICByb3RhdGUoYS5yb3RhdGUsIGIucm90YXRlLCBzLCBxKTtcbiAgICBza2V3WChhLnNrZXdYLCBiLnNrZXdYLCBzLCBxKTtcbiAgICBzY2FsZShhLnNjYWxlWCwgYS5zY2FsZVksIGIuc2NhbGVYLCBiLnNjYWxlWSwgcywgcSk7XG4gICAgYSA9IGIgPSBudWxsOyAvLyBnY1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICB2YXIgaSA9IC0xLCBuID0gcS5sZW5ndGgsIG87XG4gICAgICB3aGlsZSAoKytpIDwgbikgc1sobyA9IHFbaV0pLmldID0gby54KHQpO1xuICAgICAgcmV0dXJuIHMuam9pbihcIlwiKTtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtQ3NzID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VDc3MsIFwicHgsIFwiLCBcInB4KVwiLCBcImRlZylcIik7XG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtU3ZnID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VTdmcsIFwiLCBcIiwgXCIpXCIsIFwiKVwiKTtcbiIsInZhciBmcmFtZSA9IDAsIC8vIGlzIGFuIGFuaW1hdGlvbiBmcmFtZSBwZW5kaW5nP1xuICAgIHRpbWVvdXQgPSAwLCAvLyBpcyBhIHRpbWVvdXQgcGVuZGluZz9cbiAgICBpbnRlcnZhbCA9IDAsIC8vIGFyZSBhbnkgdGltZXJzIGFjdGl2ZT9cbiAgICBwb2tlRGVsYXkgPSAxMDAwLCAvLyBob3cgZnJlcXVlbnRseSB3ZSBjaGVjayBmb3IgY2xvY2sgc2tld1xuICAgIHRhc2tIZWFkLFxuICAgIHRhc2tUYWlsLFxuICAgIGNsb2NrTGFzdCA9IDAsXG4gICAgY2xvY2tOb3cgPSAwLFxuICAgIGNsb2NrU2tldyA9IDAsXG4gICAgY2xvY2sgPSB0eXBlb2YgcGVyZm9ybWFuY2UgPT09IFwib2JqZWN0XCIgJiYgcGVyZm9ybWFuY2Uubm93ID8gcGVyZm9ybWFuY2UgOiBEYXRlLFxuICAgIHNldEZyYW1lID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIiAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZS5iaW5kKHdpbmRvdykgOiBmdW5jdGlvbihmKSB7IHNldFRpbWVvdXQoZiwgMTcpOyB9O1xuXG5leHBvcnQgZnVuY3Rpb24gbm93KCkge1xuICByZXR1cm4gY2xvY2tOb3cgfHwgKHNldEZyYW1lKGNsZWFyTm93KSwgY2xvY2tOb3cgPSBjbG9jay5ub3coKSArIGNsb2NrU2tldyk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyTm93KCkge1xuICBjbG9ja05vdyA9IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUaW1lcigpIHtcbiAgdGhpcy5fY2FsbCA9XG4gIHRoaXMuX3RpbWUgPVxuICB0aGlzLl9uZXh0ID0gbnVsbDtcbn1cblxuVGltZXIucHJvdG90eXBlID0gdGltZXIucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVGltZXIsXG4gIHJlc3RhcnQ6IGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcImNhbGxiYWNrIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xuICAgIHRpbWUgPSAodGltZSA9PSBudWxsID8gbm93KCkgOiArdGltZSkgKyAoZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXkpO1xuICAgIGlmICghdGhpcy5fbmV4dCAmJiB0YXNrVGFpbCAhPT0gdGhpcykge1xuICAgICAgaWYgKHRhc2tUYWlsKSB0YXNrVGFpbC5fbmV4dCA9IHRoaXM7XG4gICAgICBlbHNlIHRhc2tIZWFkID0gdGhpcztcbiAgICAgIHRhc2tUYWlsID0gdGhpcztcbiAgICB9XG4gICAgdGhpcy5fY2FsbCA9IGNhbGxiYWNrO1xuICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgIHNsZWVwKCk7XG4gIH0sXG4gIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9jYWxsKSB7XG4gICAgICB0aGlzLl9jYWxsID0gbnVsbDtcbiAgICAgIHRoaXMuX3RpbWUgPSBJbmZpbml0eTtcbiAgICAgIHNsZWVwKCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gdGltZXIoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKSB7XG4gIHZhciB0ID0gbmV3IFRpbWVyO1xuICB0LnJlc3RhcnQoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKTtcbiAgcmV0dXJuIHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lckZsdXNoKCkge1xuICBub3coKTsgLy8gR2V0IHRoZSBjdXJyZW50IHRpbWUsIGlmIG5vdCBhbHJlYWR5IHNldC5cbiAgKytmcmFtZTsgLy8gUHJldGVuZCB3ZeKAmXZlIHNldCBhbiBhbGFybSwgaWYgd2UgaGF2ZW7igJl0IGFscmVhZHkuXG4gIHZhciB0ID0gdGFza0hlYWQsIGU7XG4gIHdoaWxlICh0KSB7XG4gICAgaWYgKChlID0gY2xvY2tOb3cgLSB0Ll90aW1lKSA+PSAwKSB0Ll9jYWxsLmNhbGwodW5kZWZpbmVkLCBlKTtcbiAgICB0ID0gdC5fbmV4dDtcbiAgfVxuICAtLWZyYW1lO1xufVxuXG5mdW5jdGlvbiB3YWtlKCkge1xuICBjbG9ja05vdyA9IChjbG9ja0xhc3QgPSBjbG9jay5ub3coKSkgKyBjbG9ja1NrZXc7XG4gIGZyYW1lID0gdGltZW91dCA9IDA7XG4gIHRyeSB7XG4gICAgdGltZXJGbHVzaCgpO1xuICB9IGZpbmFsbHkge1xuICAgIGZyYW1lID0gMDtcbiAgICBuYXAoKTtcbiAgICBjbG9ja05vdyA9IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gcG9rZSgpIHtcbiAgdmFyIG5vdyA9IGNsb2NrLm5vdygpLCBkZWxheSA9IG5vdyAtIGNsb2NrTGFzdDtcbiAgaWYgKGRlbGF5ID4gcG9rZURlbGF5KSBjbG9ja1NrZXcgLT0gZGVsYXksIGNsb2NrTGFzdCA9IG5vdztcbn1cblxuZnVuY3Rpb24gbmFwKCkge1xuICB2YXIgdDAsIHQxID0gdGFza0hlYWQsIHQyLCB0aW1lID0gSW5maW5pdHk7XG4gIHdoaWxlICh0MSkge1xuICAgIGlmICh0MS5fY2FsbCkge1xuICAgICAgaWYgKHRpbWUgPiB0MS5fdGltZSkgdGltZSA9IHQxLl90aW1lO1xuICAgICAgdDAgPSB0MSwgdDEgPSB0MS5fbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgdDIgPSB0MS5fbmV4dCwgdDEuX25leHQgPSBudWxsO1xuICAgICAgdDEgPSB0MCA/IHQwLl9uZXh0ID0gdDIgOiB0YXNrSGVhZCA9IHQyO1xuICAgIH1cbiAgfVxuICB0YXNrVGFpbCA9IHQwO1xuICBzbGVlcCh0aW1lKTtcbn1cblxuZnVuY3Rpb24gc2xlZXAodGltZSkge1xuICBpZiAoZnJhbWUpIHJldHVybjsgLy8gU29vbmVzdCBhbGFybSBhbHJlYWR5IHNldCwgb3Igd2lsbCBiZS5cbiAgaWYgKHRpbWVvdXQpIHRpbWVvdXQgPSBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gIHZhciBkZWxheSA9IHRpbWUgLSBjbG9ja05vdzsgLy8gU3RyaWN0bHkgbGVzcyB0aGFuIGlmIHdlIHJlY29tcHV0ZWQgY2xvY2tOb3cuXG4gIGlmIChkZWxheSA+IDI0KSB7XG4gICAgaWYgKHRpbWUgPCBJbmZpbml0eSkgdGltZW91dCA9IHNldFRpbWVvdXQod2FrZSwgdGltZSAtIGNsb2NrLm5vdygpIC0gY2xvY2tTa2V3KTtcbiAgICBpZiAoaW50ZXJ2YWwpIGludGVydmFsID0gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFpbnRlcnZhbCkgY2xvY2tMYXN0ID0gY2xvY2subm93KCksIGludGVydmFsID0gc2V0SW50ZXJ2YWwocG9rZSwgcG9rZURlbGF5KTtcbiAgICBmcmFtZSA9IDEsIHNldEZyYW1lKHdha2UpO1xuICB9XG59XG4iLCJpbXBvcnQge1RpbWVyfSBmcm9tIFwiLi90aW1lci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgdmFyIHQgPSBuZXcgVGltZXI7XG4gIGRlbGF5ID0gZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXk7XG4gIHQucmVzdGFydChlbGFwc2VkID0+IHtcbiAgICB0LnN0b3AoKTtcbiAgICBjYWxsYmFjayhlbGFwc2VkICsgZGVsYXkpO1xuICB9LCBkZWxheSwgdGltZSk7XG4gIHJldHVybiB0O1xufVxuIiwiaW1wb3J0IHtkaXNwYXRjaH0gZnJvbSBcImQzLWRpc3BhdGNoXCI7XG5pbXBvcnQge3RpbWVyLCB0aW1lb3V0fSBmcm9tIFwiZDMtdGltZXJcIjtcblxudmFyIGVtcHR5T24gPSBkaXNwYXRjaChcInN0YXJ0XCIsIFwiZW5kXCIsIFwiY2FuY2VsXCIsIFwiaW50ZXJydXB0XCIpO1xudmFyIGVtcHR5VHdlZW4gPSBbXTtcblxuZXhwb3J0IHZhciBDUkVBVEVEID0gMDtcbmV4cG9ydCB2YXIgU0NIRURVTEVEID0gMTtcbmV4cG9ydCB2YXIgU1RBUlRJTkcgPSAyO1xuZXhwb3J0IHZhciBTVEFSVEVEID0gMztcbmV4cG9ydCB2YXIgUlVOTklORyA9IDQ7XG5leHBvcnQgdmFyIEVORElORyA9IDU7XG5leHBvcnQgdmFyIEVOREVEID0gNjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSwgbmFtZSwgaWQsIGluZGV4LCBncm91cCwgdGltaW5nKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbjtcbiAgaWYgKCFzY2hlZHVsZXMpIG5vZGUuX190cmFuc2l0aW9uID0ge307XG4gIGVsc2UgaWYgKGlkIGluIHNjaGVkdWxlcykgcmV0dXJuO1xuICBjcmVhdGUobm9kZSwgaWQsIHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIGluZGV4OiBpbmRleCwgLy8gRm9yIGNvbnRleHQgZHVyaW5nIGNhbGxiYWNrLlxuICAgIGdyb3VwOiBncm91cCwgLy8gRm9yIGNvbnRleHQgZHVyaW5nIGNhbGxiYWNrLlxuICAgIG9uOiBlbXB0eU9uLFxuICAgIHR3ZWVuOiBlbXB0eVR3ZWVuLFxuICAgIHRpbWU6IHRpbWluZy50aW1lLFxuICAgIGRlbGF5OiB0aW1pbmcuZGVsYXksXG4gICAgZHVyYXRpb246IHRpbWluZy5kdXJhdGlvbixcbiAgICBlYXNlOiB0aW1pbmcuZWFzZSxcbiAgICB0aW1lcjogbnVsbCxcbiAgICBzdGF0ZTogQ1JFQVRFRFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gZ2V0KG5vZGUsIGlkKTtcbiAgaWYgKHNjaGVkdWxlLnN0YXRlID4gQ1JFQVRFRCkgdGhyb3cgbmV3IEVycm9yKFwidG9vIGxhdGU7IGFscmVhZHkgc2NoZWR1bGVkXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gZ2V0KG5vZGUsIGlkKTtcbiAgaWYgKHNjaGVkdWxlLnN0YXRlID4gU1RBUlRFRCkgdGhyb3cgbmV3IEVycm9yKFwidG9vIGxhdGU7IGFscmVhZHkgcnVubmluZ1wiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0KG5vZGUsIGlkKSB7XG4gIHZhciBzY2hlZHVsZSA9IG5vZGUuX190cmFuc2l0aW9uO1xuICBpZiAoIXNjaGVkdWxlIHx8ICEoc2NoZWR1bGUgPSBzY2hlZHVsZVtpZF0pKSB0aHJvdyBuZXcgRXJyb3IoXCJ0cmFuc2l0aW9uIG5vdCBmb3VuZFwiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGUobm9kZSwgaWQsIHNlbGYpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uLFxuICAgICAgdHdlZW47XG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgc2VsZiB0aW1lciB3aGVuIHRoZSB0cmFuc2l0aW9uIGlzIGNyZWF0ZWQuXG4gIC8vIE5vdGUgdGhlIGFjdHVhbCBkZWxheSBpcyBub3Qga25vd24gdW50aWwgdGhlIGZpcnN0IGNhbGxiYWNrIVxuICBzY2hlZHVsZXNbaWRdID0gc2VsZjtcbiAgc2VsZi50aW1lciA9IHRpbWVyKHNjaGVkdWxlLCAwLCBzZWxmLnRpbWUpO1xuXG4gIGZ1bmN0aW9uIHNjaGVkdWxlKGVsYXBzZWQpIHtcbiAgICBzZWxmLnN0YXRlID0gU0NIRURVTEVEO1xuICAgIHNlbGYudGltZXIucmVzdGFydChzdGFydCwgc2VsZi5kZWxheSwgc2VsZi50aW1lKTtcblxuICAgIC8vIElmIHRoZSBlbGFwc2VkIGRlbGF5IGlzIGxlc3MgdGhhbiBvdXIgZmlyc3Qgc2xlZXAsIHN0YXJ0IGltbWVkaWF0ZWx5LlxuICAgIGlmIChzZWxmLmRlbGF5IDw9IGVsYXBzZWQpIHN0YXJ0KGVsYXBzZWQgLSBzZWxmLmRlbGF5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0KGVsYXBzZWQpIHtcbiAgICB2YXIgaSwgaiwgbiwgbztcblxuICAgIC8vIElmIHRoZSBzdGF0ZSBpcyBub3QgU0NIRURVTEVELCB0aGVuIHdlIHByZXZpb3VzbHkgZXJyb3JlZCBvbiBzdGFydC5cbiAgICBpZiAoc2VsZi5zdGF0ZSAhPT0gU0NIRURVTEVEKSByZXR1cm4gc3RvcCgpO1xuXG4gICAgZm9yIChpIGluIHNjaGVkdWxlcykge1xuICAgICAgbyA9IHNjaGVkdWxlc1tpXTtcbiAgICAgIGlmIChvLm5hbWUgIT09IHNlbGYubmFtZSkgY29udGludWU7XG5cbiAgICAgIC8vIFdoaWxlIHRoaXMgZWxlbWVudCBhbHJlYWR5IGhhcyBhIHN0YXJ0aW5nIHRyYW5zaXRpb24gZHVyaW5nIHRoaXMgZnJhbWUsXG4gICAgICAvLyBkZWZlciBzdGFydGluZyBhbiBpbnRlcnJ1cHRpbmcgdHJhbnNpdGlvbiB1bnRpbCB0aGF0IHRyYW5zaXRpb24gaGFzIGFcbiAgICAgIC8vIGNoYW5jZSB0byB0aWNrIChhbmQgcG9zc2libHkgZW5kKTsgc2VlIGQzL2QzLXRyYW5zaXRpb24jNTQhXG4gICAgICBpZiAoby5zdGF0ZSA9PT0gU1RBUlRFRCkgcmV0dXJuIHRpbWVvdXQoc3RhcnQpO1xuXG4gICAgICAvLyBJbnRlcnJ1cHQgdGhlIGFjdGl2ZSB0cmFuc2l0aW9uLCBpZiBhbnkuXG4gICAgICBpZiAoby5zdGF0ZSA9PT0gUlVOTklORykge1xuICAgICAgICBvLnN0YXRlID0gRU5ERUQ7XG4gICAgICAgIG8udGltZXIuc3RvcCgpO1xuICAgICAgICBvLm9uLmNhbGwoXCJpbnRlcnJ1cHRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgby5pbmRleCwgby5ncm91cCk7XG4gICAgICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gICAgICB9XG5cbiAgICAgIC8vIENhbmNlbCBhbnkgcHJlLWVtcHRlZCB0cmFuc2l0aW9ucy5cbiAgICAgIGVsc2UgaWYgKCtpIDwgaWQpIHtcbiAgICAgICAgby5zdGF0ZSA9IEVOREVEO1xuICAgICAgICBvLnRpbWVyLnN0b3AoKTtcbiAgICAgICAgby5vbi5jYWxsKFwiY2FuY2VsXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIG8uaW5kZXgsIG8uZ3JvdXApO1xuICAgICAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZmVyIHRoZSBmaXJzdCB0aWNrIHRvIGVuZCBvZiB0aGUgY3VycmVudCBmcmFtZTsgc2VlIGQzL2QzIzE1NzYuXG4gICAgLy8gTm90ZSB0aGUgdHJhbnNpdGlvbiBtYXkgYmUgY2FuY2VsZWQgYWZ0ZXIgc3RhcnQgYW5kIGJlZm9yZSB0aGUgZmlyc3QgdGljayFcbiAgICAvLyBOb3RlIHRoaXMgbXVzdCBiZSBzY2hlZHVsZWQgYmVmb3JlIHRoZSBzdGFydCBldmVudDsgc2VlIGQzL2QzLXRyYW5zaXRpb24jMTYhXG4gICAgLy8gQXNzdW1pbmcgdGhpcyBpcyBzdWNjZXNzZnVsLCBzdWJzZXF1ZW50IGNhbGxiYWNrcyBnbyBzdHJhaWdodCB0byB0aWNrLlxuICAgIHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoc2VsZi5zdGF0ZSA9PT0gU1RBUlRFRCkge1xuICAgICAgICBzZWxmLnN0YXRlID0gUlVOTklORztcbiAgICAgICAgc2VsZi50aW1lci5yZXN0YXJ0KHRpY2ssIHNlbGYuZGVsYXksIHNlbGYudGltZSk7XG4gICAgICAgIHRpY2soZWxhcHNlZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgc3RhcnQgZXZlbnQuXG4gICAgLy8gTm90ZSB0aGlzIG11c3QgYmUgZG9uZSBiZWZvcmUgdGhlIHR3ZWVuIGFyZSBpbml0aWFsaXplZC5cbiAgICBzZWxmLnN0YXRlID0gU1RBUlRJTkc7XG4gICAgc2VsZi5vbi5jYWxsKFwic3RhcnRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCk7XG4gICAgaWYgKHNlbGYuc3RhdGUgIT09IFNUQVJUSU5HKSByZXR1cm47IC8vIGludGVycnVwdGVkXG4gICAgc2VsZi5zdGF0ZSA9IFNUQVJURUQ7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSB0d2VlbiwgZGVsZXRpbmcgbnVsbCB0d2Vlbi5cbiAgICB0d2VlbiA9IG5ldyBBcnJheShuID0gc2VsZi50d2Vlbi5sZW5ndGgpO1xuICAgIGZvciAoaSA9IDAsIGogPSAtMTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG8gPSBzZWxmLnR3ZWVuW2ldLnZhbHVlLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCkpIHtcbiAgICAgICAgdHdlZW5bKytqXSA9IG87XG4gICAgICB9XG4gICAgfVxuICAgIHR3ZWVuLmxlbmd0aCA9IGogKyAxO1xuICB9XG5cbiAgZnVuY3Rpb24gdGljayhlbGFwc2VkKSB7XG4gICAgdmFyIHQgPSBlbGFwc2VkIDwgc2VsZi5kdXJhdGlvbiA/IHNlbGYuZWFzZS5jYWxsKG51bGwsIGVsYXBzZWQgLyBzZWxmLmR1cmF0aW9uKSA6IChzZWxmLnRpbWVyLnJlc3RhcnQoc3RvcCksIHNlbGYuc3RhdGUgPSBFTkRJTkcsIDEpLFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSB0d2Vlbi5sZW5ndGg7XG5cbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgdHdlZW5baV0uY2FsbChub2RlLCB0KTtcbiAgICB9XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgZW5kIGV2ZW50LlxuICAgIGlmIChzZWxmLnN0YXRlID09PSBFTkRJTkcpIHtcbiAgICAgIHNlbGYub24uY2FsbChcImVuZFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKTtcbiAgICAgIHN0b3AoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wKCkge1xuICAgIHNlbGYuc3RhdGUgPSBFTkRFRDtcbiAgICBzZWxmLnRpbWVyLnN0b3AoKTtcbiAgICBkZWxldGUgc2NoZWR1bGVzW2lkXTtcbiAgICBmb3IgKHZhciBpIGluIHNjaGVkdWxlcykgcmV0dXJuOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgZGVsZXRlIG5vZGUuX190cmFuc2l0aW9uO1xuICB9XG59XG4iLCJpbXBvcnQge1NUQVJUSU5HLCBFTkRJTkcsIEVOREVEfSBmcm9tIFwiLi90cmFuc2l0aW9uL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5vZGUsIG5hbWUpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uLFxuICAgICAgc2NoZWR1bGUsXG4gICAgICBhY3RpdmUsXG4gICAgICBlbXB0eSA9IHRydWUsXG4gICAgICBpO1xuXG4gIGlmICghc2NoZWR1bGVzKSByZXR1cm47XG5cbiAgbmFtZSA9IG5hbWUgPT0gbnVsbCA/IG51bGwgOiBuYW1lICsgXCJcIjtcblxuICBmb3IgKGkgaW4gc2NoZWR1bGVzKSB7XG4gICAgaWYgKChzY2hlZHVsZSA9IHNjaGVkdWxlc1tpXSkubmFtZSAhPT0gbmFtZSkgeyBlbXB0eSA9IGZhbHNlOyBjb250aW51ZTsgfVxuICAgIGFjdGl2ZSA9IHNjaGVkdWxlLnN0YXRlID4gU1RBUlRJTkcgJiYgc2NoZWR1bGUuc3RhdGUgPCBFTkRJTkc7XG4gICAgc2NoZWR1bGUuc3RhdGUgPSBFTkRFRDtcbiAgICBzY2hlZHVsZS50aW1lci5zdG9wKCk7XG4gICAgc2NoZWR1bGUub24uY2FsbChhY3RpdmUgPyBcImludGVycnVwdFwiIDogXCJjYW5jZWxcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2NoZWR1bGUuaW5kZXgsIHNjaGVkdWxlLmdyb3VwKTtcbiAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICB9XG5cbiAgaWYgKGVtcHR5KSBkZWxldGUgbm9kZS5fX3RyYW5zaXRpb247XG59XG4iLCJpbXBvcnQgaW50ZXJydXB0IGZyb20gXCIuLi9pbnRlcnJ1cHQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIGludGVycnVwdCh0aGlzLCBuYW1lKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQge2dldCwgc2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiB0d2VlblJlbW92ZShpZCwgbmFtZSkge1xuICB2YXIgdHdlZW4wLCB0d2VlbjE7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICB0d2VlbiA9IHNjaGVkdWxlLnR3ZWVuO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCB0d2VlbiB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCB0d2VlbiBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAodHdlZW4gIT09IHR3ZWVuMCkge1xuICAgICAgdHdlZW4xID0gdHdlZW4wID0gdHdlZW47XG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHR3ZWVuMS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKHR3ZWVuMVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgdHdlZW4xID0gdHdlZW4xLnNsaWNlKCk7XG4gICAgICAgICAgdHdlZW4xLnNwbGljZShpLCAxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNjaGVkdWxlLnR3ZWVuID0gdHdlZW4xO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0d2VlbkZ1bmN0aW9uKGlkLCBuYW1lLCB2YWx1ZSkge1xuICB2YXIgdHdlZW4wLCB0d2VlbjE7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgdHdlZW4gPSBzY2hlZHVsZS50d2VlbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgdHdlZW4gd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgdHdlZW4gYW5kIHdl4oCZcmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKHR3ZWVuICE9PSB0d2VlbjApIHtcbiAgICAgIHR3ZWVuMSA9ICh0d2VlbjAgPSB0d2Vlbikuc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIHQgPSB7bmFtZTogbmFtZSwgdmFsdWU6IHZhbHVlfSwgaSA9IDAsIG4gPSB0d2VlbjEubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGlmICh0d2VlbjFbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgIHR3ZWVuMVtpXSA9IHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpID09PSBuKSB0d2VlbjEucHVzaCh0KTtcbiAgICB9XG5cbiAgICBzY2hlZHVsZS50d2VlbiA9IHR3ZWVuMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgbmFtZSArPSBcIlwiO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciB0d2VlbiA9IGdldCh0aGlzLm5vZGUoKSwgaWQpLnR3ZWVuO1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gdHdlZW4ubGVuZ3RoLCB0OyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKHQgPSB0d2VlbltpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICByZXR1cm4gdC52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsID8gdHdlZW5SZW1vdmUgOiB0d2VlbkZ1bmN0aW9uKShpZCwgbmFtZSwgdmFsdWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR3ZWVuVmFsdWUodHJhbnNpdGlvbiwgbmFtZSwgdmFsdWUpIHtcbiAgdmFyIGlkID0gdHJhbnNpdGlvbi5faWQ7XG5cbiAgdHJhbnNpdGlvbi5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCk7XG4gICAgKHNjaGVkdWxlLnZhbHVlIHx8IChzY2hlZHVsZS52YWx1ZSA9IHt9KSlbbmFtZV0gPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgIHJldHVybiBnZXQobm9kZSwgaWQpLnZhbHVlW25hbWVdO1xuICB9O1xufVxuIiwiaW1wb3J0IHtjb2xvcn0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQge2ludGVycG9sYXRlTnVtYmVyLCBpbnRlcnBvbGF0ZVJnYiwgaW50ZXJwb2xhdGVTdHJpbmd9IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBjO1xuICByZXR1cm4gKHR5cGVvZiBiID09PSBcIm51bWJlclwiID8gaW50ZXJwb2xhdGVOdW1iZXJcbiAgICAgIDogYiBpbnN0YW5jZW9mIGNvbG9yID8gaW50ZXJwb2xhdGVSZ2JcbiAgICAgIDogKGMgPSBjb2xvcihiKSkgPyAoYiA9IGMsIGludGVycG9sYXRlUmdiKVxuICAgICAgOiBpbnRlcnBvbGF0ZVN0cmluZykoYSwgYik7XG59XG4iLCJpbXBvcnQge2ludGVycG9sYXRlVHJhbnNmb3JtU3ZnIGFzIGludGVycG9sYXRlVHJhbnNmb3JtfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7bmFtZXNwYWNlfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgaW50ZXJwb2xhdGUgZnJvbSBcIi4vaW50ZXJwb2xhdGUuanNcIjtcblxuZnVuY3Rpb24gYXR0clJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clJlbW92ZU5TKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudChuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUxKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50TlMoZnVsbG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uKG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwLCB2YWx1ZTEgPSB2YWx1ZSh0aGlzKSwgc3RyaW5nMTtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHJldHVybiB2b2lkIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbk5TKGZ1bGxuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCwgdmFsdWUxID0gdmFsdWUodGhpcyksIHN0cmluZzE7XG4gICAgaWYgKHZhbHVlMSA9PSBudWxsKSByZXR1cm4gdm9pZCB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKSwgaSA9IGZ1bGxuYW1lID09PSBcInRyYW5zZm9ybVwiID8gaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBpbnRlcnBvbGF0ZTtcbiAgcmV0dXJuIHRoaXMuYXR0clR3ZWVuKG5hbWUsIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJGdW5jdGlvbk5TIDogYXR0ckZ1bmN0aW9uKShmdWxsbmFtZSwgaSwgdHdlZW5WYWx1ZSh0aGlzLCBcImF0dHIuXCIgKyBuYW1lLCB2YWx1ZSkpXG4gICAgICA6IHZhbHVlID09IG51bGwgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyUmVtb3ZlTlMgOiBhdHRyUmVtb3ZlKShmdWxsbmFtZSlcbiAgICAgIDogKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckNvbnN0YW50TlMgOiBhdHRyQ29uc3RhbnQpKGZ1bGxuYW1lLCBpLCB2YWx1ZSkpO1xufVxuIiwiaW1wb3J0IHtuYW1lc3BhY2V9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcblxuZnVuY3Rpb24gYXR0ckludGVycG9sYXRlKG5hbWUsIGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCBpLmNhbGwodGhpcywgdCkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRySW50ZXJwb2xhdGVOUyhmdWxsbmFtZSwgaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCBpLmNhbGwodGhpcywgdCkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyVHdlZW5OUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiBhdHRySW50ZXJwb2xhdGVOUyhmdWxsbmFtZSwgaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmZ1bmN0aW9uIGF0dHJUd2VlbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIGF0dHJJbnRlcnBvbGF0ZShuYW1lLCBpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGtleSA9IFwiYXR0ci5cIiArIG5hbWU7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIChmdWxsbmFtZS5sb2NhbCA/IGF0dHJUd2Vlbk5TIDogYXR0clR3ZWVuKShmdWxsbmFtZSwgdmFsdWUpKTtcbn1cbiIsImltcG9ydCB7Z2V0LCBpbml0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBkZWxheUZ1bmN0aW9uKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaW5pdCh0aGlzLCBpZCkuZGVsYXkgPSArdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVsYXlDb25zdGFudChpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID0gK3ZhbHVlLCBmdW5jdGlvbigpIHtcbiAgICBpbml0KHRoaXMsIGlkKS5kZWxheSA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBkZWxheUZ1bmN0aW9uXG4gICAgICAgICAgOiBkZWxheUNvbnN0YW50KShpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5kZWxheTtcbn1cbiIsImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGR1cmF0aW9uRnVuY3Rpb24oaWQsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmR1cmF0aW9uID0gK3ZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGR1cmF0aW9uQ29uc3RhbnQoaWQsIHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9ICt2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgc2V0KHRoaXMsIGlkKS5kdXJhdGlvbiA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBkdXJhdGlvbkZ1bmN0aW9uXG4gICAgICAgICAgOiBkdXJhdGlvbkNvbnN0YW50KShpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5kdXJhdGlvbjtcbn1cbiIsImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGVhc2VDb25zdGFudChpZCwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmVhc2UgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKGVhc2VDb25zdGFudChpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5lYXNlO1xufVxuIiwiaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGVhc2VWYXJ5aW5nKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh0eXBlb2YgdiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gICAgc2V0KHRoaXMsIGlkKS5lYXNlID0gdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiB0aGlzLmVhY2goZWFzZVZhcnlpbmcodGhpcy5faWQsIHZhbHVlKSk7XG59XG4iLCJpbXBvcnQge21hdGNoZXJ9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBtYXRjaCAhPT0gXCJmdW5jdGlvblwiKSBtYXRjaCA9IG1hdGNoZXIobWF0Y2gpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBbXSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBtYXRjaC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkge1xuICAgICAgICBzdWJncm91cC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMsIHRoaXMuX25hbWUsIHRoaXMuX2lkKTtcbn1cbiIsImltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHJhbnNpdGlvbikge1xuICBpZiAodHJhbnNpdGlvbi5faWQgIT09IHRoaXMuX2lkKSB0aHJvdyBuZXcgRXJyb3I7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHRyYW5zaXRpb24uX2dyb3VwcywgbTAgPSBncm91cHMwLmxlbmd0aCwgbTEgPSBncm91cHMxLmxlbmd0aCwgbSA9IE1hdGgubWluKG0wLCBtMSksIG1lcmdlcyA9IG5ldyBBcnJheShtMCksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAwID0gZ3JvdXBzMFtqXSwgZ3JvdXAxID0gZ3JvdXBzMVtqXSwgbiA9IGdyb3VwMC5sZW5ndGgsIG1lcmdlID0gbWVyZ2VzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cDBbaV0gfHwgZ3JvdXAxW2ldKSB7XG4gICAgICAgIG1lcmdlW2ldID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKDsgaiA8IG0wOyArK2opIHtcbiAgICBtZXJnZXNbal0gPSBncm91cHMwW2pdO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKG1lcmdlcywgdGhpcy5fcGFyZW50cywgdGhpcy5fbmFtZSwgdGhpcy5faWQpO1xufVxuIiwiaW1wb3J0IHtnZXQsIHNldCwgaW5pdH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gc3RhcnQobmFtZSkge1xuICByZXR1cm4gKG5hbWUgKyBcIlwiKS50cmltKCkuc3BsaXQoL158XFxzKy8pLmV2ZXJ5KGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgcmV0dXJuICF0IHx8IHQgPT09IFwic3RhcnRcIjtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uRnVuY3Rpb24oaWQsIG5hbWUsIGxpc3RlbmVyKSB7XG4gIHZhciBvbjAsIG9uMSwgc2l0ID0gc3RhcnQobmFtZSkgPyBpbml0IDogc2V0O1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2l0KHRoaXMsIGlkKSxcbiAgICAgICAgb24gPSBzY2hlZHVsZS5vbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAob24gIT09IG9uMCkgKG9uMSA9IChvbjAgPSBvbikuY29weSgpKS5vbihuYW1lLCBsaXN0ZW5lcik7XG5cbiAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAyXG4gICAgICA/IGdldCh0aGlzLm5vZGUoKSwgaWQpLm9uLm9uKG5hbWUpXG4gICAgICA6IHRoaXMuZWFjaChvbkZ1bmN0aW9uKGlkLCBuYW1lLCBsaXN0ZW5lcikpO1xufVxuIiwiZnVuY3Rpb24gcmVtb3ZlRnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLl9fdHJhbnNpdGlvbikgaWYgKCtpICE9PSBpZCkgcmV0dXJuO1xuICAgIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9uKFwiZW5kLnJlbW92ZVwiLCByZW1vdmVGdW5jdGlvbih0aGlzLl9pZCkpO1xufVxuIiwiaW1wb3J0IHtzZWxlY3Rvcn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQgPSB0aGlzLl9pZDtcblxuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvcihzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIHN1Ym5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKHN1Ym5vZGUgPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpKSB7XG4gICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIHN1Ymdyb3VwW2ldID0gc3Vibm9kZTtcbiAgICAgICAgc2NoZWR1bGUoc3ViZ3JvdXBbaV0sIG5hbWUsIGlkLCBpLCBzdWJncm91cCwgZ2V0KG5vZGUsIGlkKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwiaW1wb3J0IHtzZWxlY3RvckFsbH0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQgPSB0aGlzLl9pZDtcblxuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvckFsbChzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IFtdLCBwYXJlbnRzID0gW10sIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIGZvciAodmFyIGNoaWxkcmVuID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApLCBjaGlsZCwgaW5oZXJpdCA9IGdldChub2RlLCBpZCksIGsgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBrIDwgbDsgKytrKSB7XG4gICAgICAgICAgaWYgKGNoaWxkID0gY2hpbGRyZW5ba10pIHtcbiAgICAgICAgICAgIHNjaGVkdWxlKGNoaWxkLCBuYW1lLCBpZCwgaywgY2hpbGRyZW4sIGluaGVyaXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdWJncm91cHMucHVzaChjaGlsZHJlbik7XG4gICAgICAgIHBhcmVudHMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCBwYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLCJpbXBvcnQge3NlbGVjdGlvbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuXG52YXIgU2VsZWN0aW9uID0gc2VsZWN0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvcjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2dyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCJpbXBvcnQge2ludGVycG9sYXRlVHJhbnNmb3JtQ3NzIGFzIGludGVycG9sYXRlVHJhbnNmb3JtfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7c3R5bGV9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuaW1wb3J0IGludGVycG9sYXRlIGZyb20gXCIuL2ludGVycG9sYXRlLmpzXCI7XG5cbmZ1bmN0aW9uIHN0eWxlTnVsbChuYW1lLCBpbnRlcnBvbGF0ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSksXG4gICAgICAgIHN0cmluZzEgPSAodGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKSwgc3R5bGUodGhpcywgbmFtZSkpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCBzdHJpbmcxMCA9IHN0cmluZzEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUNvbnN0YW50KG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHN0eWxlKHRoaXMsIG5hbWUpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUZ1bmN0aW9uKG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSksXG4gICAgICAgIHZhbHVlMSA9IHZhbHVlKHRoaXMpLFxuICAgICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHN0cmluZzEgPSB2YWx1ZTEgPSAodGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKSwgc3R5bGUodGhpcywgbmFtZSkpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVNYXliZVJlbW92ZShpZCwgbmFtZSkge1xuICB2YXIgb24wLCBvbjEsIGxpc3RlbmVyMCwga2V5ID0gXCJzdHlsZS5cIiArIG5hbWUsIGV2ZW50ID0gXCJlbmQuXCIgKyBrZXksIHJlbW92ZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIG9uID0gc2NoZWR1bGUub24sXG4gICAgICAgIGxpc3RlbmVyID0gc2NoZWR1bGUudmFsdWVba2V5XSA9PSBudWxsID8gcmVtb3ZlIHx8IChyZW1vdmUgPSBzdHlsZVJlbW92ZShuYW1lKSkgOiB1bmRlZmluZWQ7XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdl4oCZcmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKG9uICE9PSBvbjAgfHwgbGlzdGVuZXIwICE9PSBsaXN0ZW5lcikgKG9uMSA9IChvbjAgPSBvbikuY29weSgpKS5vbihldmVudCwgbGlzdGVuZXIwID0gbGlzdGVuZXIpO1xuXG4gICAgc2NoZWR1bGUub24gPSBvbjE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIgaSA9IChuYW1lICs9IFwiXCIpID09PSBcInRyYW5zZm9ybVwiID8gaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBpbnRlcnBvbGF0ZTtcbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZU51bGwobmFtZSwgaSkpXG4gICAgICAub24oXCJlbmQuc3R5bGUuXCIgKyBuYW1lLCBzdHlsZVJlbW92ZShuYW1lKSlcbiAgICA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdGhpc1xuICAgICAgLnN0eWxlVHdlZW4obmFtZSwgc3R5bGVGdW5jdGlvbihuYW1lLCBpLCB0d2VlblZhbHVlKHRoaXMsIFwic3R5bGUuXCIgKyBuYW1lLCB2YWx1ZSkpKVxuICAgICAgLmVhY2goc3R5bGVNYXliZVJlbW92ZSh0aGlzLl9pZCwgbmFtZSkpXG4gICAgOiB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZUNvbnN0YW50KG5hbWUsIGksIHZhbHVlKSwgcHJpb3JpdHkpXG4gICAgICAub24oXCJlbmQuc3R5bGUuXCIgKyBuYW1lLCBudWxsKTtcbn1cbiIsImZ1bmN0aW9uIHN0eWxlSW50ZXJwb2xhdGUobmFtZSwgaSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIGkuY2FsbCh0aGlzLCB0KSwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZVR3ZWVuKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIgdCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQgPSAoaTAgPSBpKSAmJiBzdHlsZUludGVycG9sYXRlKG5hbWUsIGksIHByaW9yaXR5KTtcbiAgICByZXR1cm4gdDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgdmFyIGtleSA9IFwic3R5bGUuXCIgKyAobmFtZSArPSBcIlwiKTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIHN0eWxlVHdlZW4obmFtZSwgdmFsdWUsIHByaW9yaXR5ID09IG51bGwgPyBcIlwiIDogcHJpb3JpdHkpKTtcbn1cbiIsImltcG9ydCB7dHdlZW5WYWx1ZX0gZnJvbSBcIi4vdHdlZW4uanNcIjtcblxuZnVuY3Rpb24gdGV4dENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlMSA9IHZhbHVlKHRoaXMpO1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTEgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZTE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLnR3ZWVuKFwidGV4dFwiLCB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyB0ZXh0RnVuY3Rpb24odHdlZW5WYWx1ZSh0aGlzLCBcInRleHRcIiwgdmFsdWUpKVxuICAgICAgOiB0ZXh0Q29uc3RhbnQodmFsdWUgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZSArIFwiXCIpKTtcbn1cbiIsImZ1bmN0aW9uIHRleHRJbnRlcnBvbGF0ZShpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IGkuY2FsbCh0aGlzLCB0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dFR3ZWVuKHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgdGV4dEludGVycG9sYXRlKGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIga2V5ID0gXCJ0ZXh0XCI7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSkgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCB0ZXh0VHdlZW4odmFsdWUpKTtcbn1cbiIsImltcG9ydCB7VHJhbnNpdGlvbiwgbmV3SWR9IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZDAgPSB0aGlzLl9pZCxcbiAgICAgIGlkMSA9IG5ld0lkKCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgdmFyIGluaGVyaXQgPSBnZXQobm9kZSwgaWQwKTtcbiAgICAgICAgc2NoZWR1bGUobm9kZSwgbmFtZSwgaWQxLCBpLCBncm91cCwge1xuICAgICAgICAgIHRpbWU6IGluaGVyaXQudGltZSArIGluaGVyaXQuZGVsYXkgKyBpbmhlcml0LmR1cmF0aW9uLFxuICAgICAgICAgIGRlbGF5OiAwLFxuICAgICAgICAgIGR1cmF0aW9uOiBpbmhlcml0LmR1cmF0aW9uLFxuICAgICAgICAgIGVhc2U6IGluaGVyaXQuZWFzZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZDEpO1xufVxuIiwiaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgb24wLCBvbjEsIHRoYXQgPSB0aGlzLCBpZCA9IHRoYXQuX2lkLCBzaXplID0gdGhhdC5zaXplKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgY2FuY2VsID0ge3ZhbHVlOiByZWplY3R9LFxuICAgICAgICBlbmQgPSB7dmFsdWU6IGZ1bmN0aW9uKCkgeyBpZiAoLS1zaXplID09PSAwKSByZXNvbHZlKCk7IH19O1xuXG4gICAgdGhhdC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgICBvbiA9IHNjaGVkdWxlLm9uO1xuXG4gICAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2XigJlyZSBkb25lIVxuICAgICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgICAgaWYgKG9uICE9PSBvbjApIHtcbiAgICAgICAgb24xID0gKG9uMCA9IG9uKS5jb3B5KCk7XG4gICAgICAgIG9uMS5fLmNhbmNlbC5wdXNoKGNhbmNlbCk7XG4gICAgICAgIG9uMS5fLmludGVycnVwdC5wdXNoKGNhbmNlbCk7XG4gICAgICAgIG9uMS5fLmVuZC5wdXNoKGVuZCk7XG4gICAgICB9XG5cbiAgICAgIHNjaGVkdWxlLm9uID0gb24xO1xuICAgIH0pO1xuXG4gICAgLy8gVGhlIHNlbGVjdGlvbiB3YXMgZW1wdHksIHJlc29sdmUgZW5kIGltbWVkaWF0ZWx5XG4gICAgaWYgKHNpemUgPT09IDApIHJlc29sdmUoKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQge3NlbGVjdGlvbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHRyYW5zaXRpb25fYXR0ciBmcm9tIFwiLi9hdHRyLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9hdHRyVHdlZW4gZnJvbSBcIi4vYXR0clR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9kZWxheSBmcm9tIFwiLi9kZWxheS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZHVyYXRpb24gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2Vhc2UgZnJvbSBcIi4vZWFzZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZWFzZVZhcnlpbmcgZnJvbSBcIi4vZWFzZVZhcnlpbmcuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2ZpbHRlciBmcm9tIFwiLi9maWx0ZXIuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX21lcmdlIGZyb20gXCIuL21lcmdlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9vbiBmcm9tIFwiLi9vbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fcmVtb3ZlIGZyb20gXCIuL3JlbW92ZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0IGZyb20gXCIuL3NlbGVjdC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0QWxsIGZyb20gXCIuL3NlbGVjdEFsbC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0aW9uIGZyb20gXCIuL3NlbGVjdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc3R5bGUgZnJvbSBcIi4vc3R5bGUuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3N0eWxlVHdlZW4gZnJvbSBcIi4vc3R5bGVUd2Vlbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdGV4dCBmcm9tIFwiLi90ZXh0LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90ZXh0VHdlZW4gZnJvbSBcIi4vdGV4dFR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90cmFuc2l0aW9uIGZyb20gXCIuL3RyYW5zaXRpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3R3ZWVuIGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lbmQgZnJvbSBcIi4vZW5kLmpzXCI7XG5cbnZhciBpZCA9IDA7XG5cbmV4cG9ydCBmdW5jdGlvbiBUcmFuc2l0aW9uKGdyb3VwcywgcGFyZW50cywgbmFtZSwgaWQpIHtcbiAgdGhpcy5fZ3JvdXBzID0gZ3JvdXBzO1xuICB0aGlzLl9wYXJlbnRzID0gcGFyZW50cztcbiAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gIHRoaXMuX2lkID0gaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zaXRpb24obmFtZSkge1xuICByZXR1cm4gc2VsZWN0aW9uKCkudHJhbnNpdGlvbihuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5ld0lkKCkge1xuICByZXR1cm4gKytpZDtcbn1cblxudmFyIHNlbGVjdGlvbl9wcm90b3R5cGUgPSBzZWxlY3Rpb24ucHJvdG90eXBlO1xuXG5UcmFuc2l0aW9uLnByb3RvdHlwZSA9IHRyYW5zaXRpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVHJhbnNpdGlvbixcbiAgc2VsZWN0OiB0cmFuc2l0aW9uX3NlbGVjdCxcbiAgc2VsZWN0QWxsOiB0cmFuc2l0aW9uX3NlbGVjdEFsbCxcbiAgc2VsZWN0Q2hpbGQ6IHNlbGVjdGlvbl9wcm90b3R5cGUuc2VsZWN0Q2hpbGQsXG4gIHNlbGVjdENoaWxkcmVuOiBzZWxlY3Rpb25fcHJvdG90eXBlLnNlbGVjdENoaWxkcmVuLFxuICBmaWx0ZXI6IHRyYW5zaXRpb25fZmlsdGVyLFxuICBtZXJnZTogdHJhbnNpdGlvbl9tZXJnZSxcbiAgc2VsZWN0aW9uOiB0cmFuc2l0aW9uX3NlbGVjdGlvbixcbiAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbl90cmFuc2l0aW9uLFxuICBjYWxsOiBzZWxlY3Rpb25fcHJvdG90eXBlLmNhbGwsXG4gIG5vZGVzOiBzZWxlY3Rpb25fcHJvdG90eXBlLm5vZGVzLFxuICBub2RlOiBzZWxlY3Rpb25fcHJvdG90eXBlLm5vZGUsXG4gIHNpemU6IHNlbGVjdGlvbl9wcm90b3R5cGUuc2l6ZSxcbiAgZW1wdHk6IHNlbGVjdGlvbl9wcm90b3R5cGUuZW1wdHksXG4gIGVhY2g6IHNlbGVjdGlvbl9wcm90b3R5cGUuZWFjaCxcbiAgb246IHRyYW5zaXRpb25fb24sXG4gIGF0dHI6IHRyYW5zaXRpb25fYXR0cixcbiAgYXR0clR3ZWVuOiB0cmFuc2l0aW9uX2F0dHJUd2VlbixcbiAgc3R5bGU6IHRyYW5zaXRpb25fc3R5bGUsXG4gIHN0eWxlVHdlZW46IHRyYW5zaXRpb25fc3R5bGVUd2VlbixcbiAgdGV4dDogdHJhbnNpdGlvbl90ZXh0LFxuICB0ZXh0VHdlZW46IHRyYW5zaXRpb25fdGV4dFR3ZWVuLFxuICByZW1vdmU6IHRyYW5zaXRpb25fcmVtb3ZlLFxuICB0d2VlbjogdHJhbnNpdGlvbl90d2VlbixcbiAgZGVsYXk6IHRyYW5zaXRpb25fZGVsYXksXG4gIGR1cmF0aW9uOiB0cmFuc2l0aW9uX2R1cmF0aW9uLFxuICBlYXNlOiB0cmFuc2l0aW9uX2Vhc2UsXG4gIGVhc2VWYXJ5aW5nOiB0cmFuc2l0aW9uX2Vhc2VWYXJ5aW5nLFxuICBlbmQ6IHRyYW5zaXRpb25fZW5kLFxuICBbU3ltYm9sLml0ZXJhdG9yXTogc2VsZWN0aW9uX3Byb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdXG59O1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGN1YmljSW4odCkge1xuICByZXR1cm4gdCAqIHQgKiB0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3ViaWNPdXQodCkge1xuICByZXR1cm4gLS10ICogdCAqIHQgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3ViaWNJbk91dCh0KSB7XG4gIHJldHVybiAoKHQgKj0gMikgPD0gMSA/IHQgKiB0ICogdCA6ICh0IC09IDIpICogdCAqIHQgKyAyKSAvIDI7XG59XG4iLCJpbXBvcnQge1RyYW5zaXRpb24sIG5ld0lkfSBmcm9tIFwiLi4vdHJhbnNpdGlvbi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlIGZyb20gXCIuLi90cmFuc2l0aW9uL3NjaGVkdWxlLmpzXCI7XG5pbXBvcnQge2Vhc2VDdWJpY0luT3V0fSBmcm9tIFwiZDMtZWFzZVwiO1xuaW1wb3J0IHtub3d9IGZyb20gXCJkMy10aW1lclwiO1xuXG52YXIgZGVmYXVsdFRpbWluZyA9IHtcbiAgdGltZTogbnVsbCwgLy8gU2V0IG9uIHVzZS5cbiAgZGVsYXk6IDAsXG4gIGR1cmF0aW9uOiAyNTAsXG4gIGVhc2U6IGVhc2VDdWJpY0luT3V0XG59O1xuXG5mdW5jdGlvbiBpbmhlcml0KG5vZGUsIGlkKSB7XG4gIHZhciB0aW1pbmc7XG4gIHdoaWxlICghKHRpbWluZyA9IG5vZGUuX190cmFuc2l0aW9uKSB8fCAhKHRpbWluZyA9IHRpbWluZ1tpZF0pKSB7XG4gICAgaWYgKCEobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdHJhbnNpdGlvbiAke2lkfSBub3QgZm91bmRgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRpbWluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgaWQsXG4gICAgICB0aW1pbmc7XG5cbiAgaWYgKG5hbWUgaW5zdGFuY2VvZiBUcmFuc2l0aW9uKSB7XG4gICAgaWQgPSBuYW1lLl9pZCwgbmFtZSA9IG5hbWUuX25hbWU7XG4gIH0gZWxzZSB7XG4gICAgaWQgPSBuZXdJZCgpLCAodGltaW5nID0gZGVmYXVsdFRpbWluZykudGltZSA9IG5vdygpLCBuYW1lID0gbmFtZSA9PSBudWxsID8gbnVsbCA6IG5hbWUgKyBcIlwiO1xuICB9XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc2NoZWR1bGUobm9kZSwgbmFtZSwgaWQsIGksIGdyb3VwLCB0aW1pbmcgfHwgaW5oZXJpdChub2RlLCBpZCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihncm91cHMsIHRoaXMuX3BhcmVudHMsIG5hbWUsIGlkKTtcbn1cbiIsImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2ludGVycnVwdCBmcm9tIFwiLi9pbnRlcnJ1cHQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fdHJhbnNpdGlvbiBmcm9tIFwiLi90cmFuc2l0aW9uLmpzXCI7XG5cbnNlbGVjdGlvbi5wcm90b3R5cGUuaW50ZXJydXB0ID0gc2VsZWN0aW9uX2ludGVycnVwdDtcbnNlbGVjdGlvbi5wcm90b3R5cGUudHJhbnNpdGlvbiA9IHNlbGVjdGlvbl90cmFuc2l0aW9uO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGluaXRSYW5nZShkb21haW4sIHJhbmdlKSB7XG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogYnJlYWs7XG4gICAgY2FzZSAxOiB0aGlzLnJhbmdlKGRvbWFpbik7IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRoaXMucmFuZ2UocmFuZ2UpLmRvbWFpbihkb21haW4pOyBicmVhaztcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRJbnRlcnBvbGF0b3IoZG9tYWluLCBpbnRlcnBvbGF0b3IpIHtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiBicmVhaztcbiAgICBjYXNlIDE6IHtcbiAgICAgIGlmICh0eXBlb2YgZG9tYWluID09PSBcImZ1bmN0aW9uXCIpIHRoaXMuaW50ZXJwb2xhdG9yKGRvbWFpbik7XG4gICAgICBlbHNlIHRoaXMucmFuZ2UoZG9tYWluKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICB0aGlzLmRvbWFpbihkb21haW4pO1xuICAgICAgaWYgKHR5cGVvZiBpbnRlcnBvbGF0b3IgPT09IFwiZnVuY3Rpb25cIikgdGhpcy5pbnRlcnBvbGF0b3IoaW50ZXJwb2xhdG9yKTtcbiAgICAgIGVsc2UgdGhpcy5yYW5nZShpbnRlcnBvbGF0b3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuIiwiaW1wb3J0IHtJbnRlcm5NYXB9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtpbml0UmFuZ2V9IGZyb20gXCIuL2luaXQuanNcIjtcblxuZXhwb3J0IGNvbnN0IGltcGxpY2l0ID0gU3ltYm9sKFwiaW1wbGljaXRcIik7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9yZGluYWwoKSB7XG4gIHZhciBpbmRleCA9IG5ldyBJbnRlcm5NYXAoKSxcbiAgICAgIGRvbWFpbiA9IFtdLFxuICAgICAgcmFuZ2UgPSBbXSxcbiAgICAgIHVua25vd24gPSBpbXBsaWNpdDtcblxuICBmdW5jdGlvbiBzY2FsZShkKSB7XG4gICAgbGV0IGkgPSBpbmRleC5nZXQoZCk7XG4gICAgaWYgKGkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHVua25vd24gIT09IGltcGxpY2l0KSByZXR1cm4gdW5rbm93bjtcbiAgICAgIGluZGV4LnNldChkLCBpID0gZG9tYWluLnB1c2goZCkgLSAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlW2kgJSByYW5nZS5sZW5ndGhdO1xuICB9XG5cbiAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRvbWFpbi5zbGljZSgpO1xuICAgIGRvbWFpbiA9IFtdLCBpbmRleCA9IG5ldyBJbnRlcm5NYXAoKTtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIF8pIHtcbiAgICAgIGlmIChpbmRleC5oYXModmFsdWUpKSBjb250aW51ZTtcbiAgICAgIGluZGV4LnNldCh2YWx1ZSwgZG9tYWluLnB1c2godmFsdWUpIC0gMSk7XG4gICAgfVxuICAgIHJldHVybiBzY2FsZTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyYW5nZSA9IEFycmF5LmZyb20oXyksIHNjYWxlKSA6IHJhbmdlLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUudW5rbm93biA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh1bmtub3duID0gXywgc2NhbGUpIDogdW5rbm93bjtcbiAgfTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG9yZGluYWwoZG9tYWluLCByYW5nZSkudW5rbm93bih1bmtub3duKTtcbiAgfTtcblxuICBpbml0UmFuZ2UuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG5cbiAgcmV0dXJuIHNjYWxlO1xufVxuIiwiaW1wb3J0IHtyYW5nZSBhcyBzZXF1ZW5jZX0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuaW1wb3J0IG9yZGluYWwgZnJvbSBcIi4vb3JkaW5hbC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBiYW5kKCkge1xuICB2YXIgc2NhbGUgPSBvcmRpbmFsKCkudW5rbm93bih1bmRlZmluZWQpLFxuICAgICAgZG9tYWluID0gc2NhbGUuZG9tYWluLFxuICAgICAgb3JkaW5hbFJhbmdlID0gc2NhbGUucmFuZ2UsXG4gICAgICByMCA9IDAsXG4gICAgICByMSA9IDEsXG4gICAgICBzdGVwLFxuICAgICAgYmFuZHdpZHRoLFxuICAgICAgcm91bmQgPSBmYWxzZSxcbiAgICAgIHBhZGRpbmdJbm5lciA9IDAsXG4gICAgICBwYWRkaW5nT3V0ZXIgPSAwLFxuICAgICAgYWxpZ24gPSAwLjU7XG5cbiAgZGVsZXRlIHNjYWxlLnVua25vd247XG5cbiAgZnVuY3Rpb24gcmVzY2FsZSgpIHtcbiAgICB2YXIgbiA9IGRvbWFpbigpLmxlbmd0aCxcbiAgICAgICAgcmV2ZXJzZSA9IHIxIDwgcjAsXG4gICAgICAgIHN0YXJ0ID0gcmV2ZXJzZSA/IHIxIDogcjAsXG4gICAgICAgIHN0b3AgPSByZXZlcnNlID8gcjAgOiByMTtcbiAgICBzdGVwID0gKHN0b3AgLSBzdGFydCkgLyBNYXRoLm1heCgxLCBuIC0gcGFkZGluZ0lubmVyICsgcGFkZGluZ091dGVyICogMik7XG4gICAgaWYgKHJvdW5kKSBzdGVwID0gTWF0aC5mbG9vcihzdGVwKTtcbiAgICBzdGFydCArPSAoc3RvcCAtIHN0YXJ0IC0gc3RlcCAqIChuIC0gcGFkZGluZ0lubmVyKSkgKiBhbGlnbjtcbiAgICBiYW5kd2lkdGggPSBzdGVwICogKDEgLSBwYWRkaW5nSW5uZXIpO1xuICAgIGlmIChyb3VuZCkgc3RhcnQgPSBNYXRoLnJvdW5kKHN0YXJ0KSwgYmFuZHdpZHRoID0gTWF0aC5yb3VuZChiYW5kd2lkdGgpO1xuICAgIHZhciB2YWx1ZXMgPSBzZXF1ZW5jZShuKS5tYXAoZnVuY3Rpb24oaSkgeyByZXR1cm4gc3RhcnQgKyBzdGVwICogaTsgfSk7XG4gICAgcmV0dXJuIG9yZGluYWxSYW5nZShyZXZlcnNlID8gdmFsdWVzLnJldmVyc2UoKSA6IHZhbHVlcyk7XG4gIH1cblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluKF8pLCByZXNjYWxlKCkpIDogZG9tYWluKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoW3IwLCByMV0gPSBfLCByMCA9ICtyMCwgcjEgPSArcjEsIHJlc2NhbGUoKSkgOiBbcjAsIHIxXTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBbcjAsIHIxXSA9IF8sIHIwID0gK3IwLCByMSA9ICtyMSwgcm91bmQgPSB0cnVlLCByZXNjYWxlKCk7XG4gIH07XG5cbiAgc2NhbGUuYmFuZHdpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGJhbmR3aWR0aDtcbiAgfTtcblxuICBzY2FsZS5zdGVwID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHN0ZXA7XG4gIH07XG5cbiAgc2NhbGUucm91bmQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocm91bmQgPSAhIV8sIHJlc2NhbGUoKSkgOiByb3VuZDtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdJbm5lciA9IE1hdGgubWluKDEsIHBhZGRpbmdPdXRlciA9ICtfKSwgcmVzY2FsZSgpKSA6IHBhZGRpbmdJbm5lcjtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nSW5uZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ0lubmVyID0gTWF0aC5taW4oMSwgXyksIHJlc2NhbGUoKSkgOiBwYWRkaW5nSW5uZXI7XG4gIH07XG5cbiAgc2NhbGUucGFkZGluZ091dGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdPdXRlciA9ICtfLCByZXNjYWxlKCkpIDogcGFkZGluZ091dGVyO1xuICB9O1xuXG4gIHNjYWxlLmFsaWduID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGFsaWduID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgXykpLCByZXNjYWxlKCkpIDogYWxpZ247XG4gIH07XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBiYW5kKGRvbWFpbigpLCBbcjAsIHIxXSlcbiAgICAgICAgLnJvdW5kKHJvdW5kKVxuICAgICAgICAucGFkZGluZ0lubmVyKHBhZGRpbmdJbm5lcilcbiAgICAgICAgLnBhZGRpbmdPdXRlcihwYWRkaW5nT3V0ZXIpXG4gICAgICAgIC5hbGlnbihhbGlnbik7XG4gIH07XG5cbiAgcmV0dXJuIGluaXRSYW5nZS5hcHBseShyZXNjYWxlKCksIGFyZ3VtZW50cyk7XG59XG5cbmZ1bmN0aW9uIHBvaW50aXNoKHNjYWxlKSB7XG4gIHZhciBjb3B5ID0gc2NhbGUuY29weTtcblxuICBzY2FsZS5wYWRkaW5nID0gc2NhbGUucGFkZGluZ091dGVyO1xuICBkZWxldGUgc2NhbGUucGFkZGluZ0lubmVyO1xuICBkZWxldGUgc2NhbGUucGFkZGluZ091dGVyO1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcG9pbnRpc2goY29weSgpKTtcbiAgfTtcblxuICByZXR1cm4gc2NhbGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb2ludCgpIHtcbiAgcmV0dXJuIHBvaW50aXNoKGJhbmQuYXBwbHkobnVsbCwgYXJndW1lbnRzKS5wYWRkaW5nSW5uZXIoMSkpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29uc3RhbnRzKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbnVtYmVyKHgpIHtcbiAgcmV0dXJuICt4O1xufVxuIiwiaW1wb3J0IHtiaXNlY3R9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZSBhcyBpbnRlcnBvbGF0ZVZhbHVlLCBpbnRlcnBvbGF0ZU51bWJlciwgaW50ZXJwb2xhdGVSb3VuZH0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbnZhciB1bml0ID0gWzAsIDFdO1xuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuICByZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplKGEsIGIpIHtcbiAgcmV0dXJuIChiIC09IChhID0gK2EpKVxuICAgICAgPyBmdW5jdGlvbih4KSB7IHJldHVybiAoeCAtIGEpIC8gYjsgfVxuICAgICAgOiBjb25zdGFudChpc05hTihiKSA/IE5hTiA6IDAuNSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wZXIoYSwgYikge1xuICB2YXIgdDtcbiAgaWYgKGEgPiBiKSB0ID0gYSwgYSA9IGIsIGIgPSB0O1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gTWF0aC5tYXgoYSwgTWF0aC5taW4oYiwgeCkpOyB9O1xufVxuXG4vLyBub3JtYWxpemUoYSwgYikoeCkgdGFrZXMgYSBkb21haW4gdmFsdWUgeCBpbiBbYSxiXSBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBwYXJhbWV0ZXIgdCBpbiBbMCwxXS5cbi8vIGludGVycG9sYXRlKGEsIGIpKHQpIHRha2VzIGEgcGFyYW1ldGVyIHQgaW4gWzAsMV0gYW5kIHJldHVybnMgdGhlIGNvcnJlc3BvbmRpbmcgcmFuZ2UgdmFsdWUgeCBpbiBbYSxiXS5cbmZ1bmN0aW9uIGJpbWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBkMCA9IGRvbWFpblswXSwgZDEgPSBkb21haW5bMV0sIHIwID0gcmFuZ2VbMF0sIHIxID0gcmFuZ2VbMV07XG4gIGlmIChkMSA8IGQwKSBkMCA9IG5vcm1hbGl6ZShkMSwgZDApLCByMCA9IGludGVycG9sYXRlKHIxLCByMCk7XG4gIGVsc2UgZDAgPSBub3JtYWxpemUoZDAsIGQxKSwgcjAgPSBpbnRlcnBvbGF0ZShyMCwgcjEpO1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gcjAoZDAoeCkpOyB9O1xufVxuXG5mdW5jdGlvbiBwb2x5bWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBqID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKSAtIDEsXG4gICAgICBkID0gbmV3IEFycmF5KGopLFxuICAgICAgciA9IG5ldyBBcnJheShqKSxcbiAgICAgIGkgPSAtMTtcblxuICAvLyBSZXZlcnNlIGRlc2NlbmRpbmcgZG9tYWlucy5cbiAgaWYgKGRvbWFpbltqXSA8IGRvbWFpblswXSkge1xuICAgIGRvbWFpbiA9IGRvbWFpbi5zbGljZSgpLnJldmVyc2UoKTtcbiAgICByYW5nZSA9IHJhbmdlLnNsaWNlKCkucmV2ZXJzZSgpO1xuICB9XG5cbiAgd2hpbGUgKCsraSA8IGopIHtcbiAgICBkW2ldID0gbm9ybWFsaXplKGRvbWFpbltpXSwgZG9tYWluW2kgKyAxXSk7XG4gICAgcltpXSA9IGludGVycG9sYXRlKHJhbmdlW2ldLCByYW5nZVtpICsgMV0pO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgaSA9IGJpc2VjdChkb21haW4sIHgsIDEsIGopIC0gMTtcbiAgICByZXR1cm4gcltpXShkW2ldKHgpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkoc291cmNlLCB0YXJnZXQpIHtcbiAgcmV0dXJuIHRhcmdldFxuICAgICAgLmRvbWFpbihzb3VyY2UuZG9tYWluKCkpXG4gICAgICAucmFuZ2Uoc291cmNlLnJhbmdlKCkpXG4gICAgICAuaW50ZXJwb2xhdGUoc291cmNlLmludGVycG9sYXRlKCkpXG4gICAgICAuY2xhbXAoc291cmNlLmNsYW1wKCkpXG4gICAgICAudW5rbm93bihzb3VyY2UudW5rbm93bigpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybWVyKCkge1xuICB2YXIgZG9tYWluID0gdW5pdCxcbiAgICAgIHJhbmdlID0gdW5pdCxcbiAgICAgIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVWYWx1ZSxcbiAgICAgIHRyYW5zZm9ybSxcbiAgICAgIHVudHJhbnNmb3JtLFxuICAgICAgdW5rbm93bixcbiAgICAgIGNsYW1wID0gaWRlbnRpdHksXG4gICAgICBwaWVjZXdpc2UsXG4gICAgICBvdXRwdXQsXG4gICAgICBpbnB1dDtcblxuICBmdW5jdGlvbiByZXNjYWxlKCkge1xuICAgIHZhciBuID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKTtcbiAgICBpZiAoY2xhbXAgIT09IGlkZW50aXR5KSBjbGFtcCA9IGNsYW1wZXIoZG9tYWluWzBdLCBkb21haW5bbiAtIDFdKTtcbiAgICBwaWVjZXdpc2UgPSBuID4gMiA/IHBvbHltYXAgOiBiaW1hcDtcbiAgICBvdXRwdXQgPSBpbnB1dCA9IG51bGw7XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgIHJldHVybiB4ID09IG51bGwgfHwgaXNOYU4oeCA9ICt4KSA/IHVua25vd24gOiAob3V0cHV0IHx8IChvdXRwdXQgPSBwaWVjZXdpc2UoZG9tYWluLm1hcCh0cmFuc2Zvcm0pLCByYW5nZSwgaW50ZXJwb2xhdGUpKSkodHJhbnNmb3JtKGNsYW1wKHgpKSk7XG4gIH1cblxuICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIGNsYW1wKHVudHJhbnNmb3JtKChpbnB1dCB8fCAoaW5wdXQgPSBwaWVjZXdpc2UocmFuZ2UsIGRvbWFpbi5tYXAodHJhbnNmb3JtKSwgaW50ZXJwb2xhdGVOdW1iZXIpKSkoeSkpKTtcbiAgfTtcblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluID0gQXJyYXkuZnJvbShfLCBudW1iZXIpLCByZXNjYWxlKCkpIDogZG9tYWluLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFuZ2UgPSBBcnJheS5mcm9tKF8pLCByZXNjYWxlKCkpIDogcmFuZ2Uuc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiByYW5nZSA9IEFycmF5LmZyb20oXyksIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVSb3VuZCwgcmVzY2FsZSgpO1xuICB9O1xuXG4gIHNjYWxlLmNsYW1wID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGNsYW1wID0gXyA/IHRydWUgOiBpZGVudGl0eSwgcmVzY2FsZSgpKSA6IGNsYW1wICE9PSBpZGVudGl0eTtcbiAgfTtcblxuICBzY2FsZS5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChpbnRlcnBvbGF0ZSA9IF8sIHJlc2NhbGUoKSkgOiBpbnRlcnBvbGF0ZTtcbiAgfTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbih0LCB1KSB7XG4gICAgdHJhbnNmb3JtID0gdCwgdW50cmFuc2Zvcm0gPSB1O1xuICAgIHJldHVybiByZXNjYWxlKCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbnRpbnVvdXMoKSB7XG4gIHJldHVybiB0cmFuc2Zvcm1lcigpKGlkZW50aXR5LCBpZGVudGl0eSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBuaWNlKGRvbWFpbiwgaW50ZXJ2YWwpIHtcbiAgZG9tYWluID0gZG9tYWluLnNsaWNlKCk7XG5cbiAgdmFyIGkwID0gMCxcbiAgICAgIGkxID0gZG9tYWluLmxlbmd0aCAtIDEsXG4gICAgICB4MCA9IGRvbWFpbltpMF0sXG4gICAgICB4MSA9IGRvbWFpbltpMV0sXG4gICAgICB0O1xuXG4gIGlmICh4MSA8IHgwKSB7XG4gICAgdCA9IGkwLCBpMCA9IGkxLCBpMSA9IHQ7XG4gICAgdCA9IHgwLCB4MCA9IHgxLCB4MSA9IHQ7XG4gIH1cblxuICBkb21haW5baTBdID0gaW50ZXJ2YWwuZmxvb3IoeDApO1xuICBkb21haW5baTFdID0gaW50ZXJ2YWwuY2VpbCh4MSk7XG4gIHJldHVybiBkb21haW47XG59XG4iLCJjb25zdCB0MCA9IG5ldyBEYXRlLCB0MSA9IG5ldyBEYXRlO1xuXG5leHBvcnQgZnVuY3Rpb24gdGltZUludGVydmFsKGZsb29yaSwgb2Zmc2V0aSwgY291bnQsIGZpZWxkKSB7XG5cbiAgZnVuY3Rpb24gaW50ZXJ2YWwoZGF0ZSkge1xuICAgIHJldHVybiBmbG9vcmkoZGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDAgPyBuZXcgRGF0ZSA6IG5ldyBEYXRlKCtkYXRlKSksIGRhdGU7XG4gIH1cblxuICBpbnRlcnZhbC5mbG9vciA9IChkYXRlKSA9PiB7XG4gICAgcmV0dXJuIGZsb29yaShkYXRlID0gbmV3IERhdGUoK2RhdGUpKSwgZGF0ZTtcbiAgfTtcblxuICBpbnRlcnZhbC5jZWlsID0gKGRhdGUpID0+IHtcbiAgICByZXR1cm4gZmxvb3JpKGRhdGUgPSBuZXcgRGF0ZShkYXRlIC0gMSkpLCBvZmZzZXRpKGRhdGUsIDEpLCBmbG9vcmkoZGF0ZSksIGRhdGU7XG4gIH07XG5cbiAgaW50ZXJ2YWwucm91bmQgPSAoZGF0ZSkgPT4ge1xuICAgIGNvbnN0IGQwID0gaW50ZXJ2YWwoZGF0ZSksIGQxID0gaW50ZXJ2YWwuY2VpbChkYXRlKTtcbiAgICByZXR1cm4gZGF0ZSAtIGQwIDwgZDEgLSBkYXRlID8gZDAgOiBkMTtcbiAgfTtcblxuICBpbnRlcnZhbC5vZmZzZXQgPSAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIHJldHVybiBvZmZzZXRpKGRhdGUgPSBuZXcgRGF0ZSgrZGF0ZSksIHN0ZXAgPT0gbnVsbCA/IDEgOiBNYXRoLmZsb29yKHN0ZXApKSwgZGF0ZTtcbiAgfTtcblxuICBpbnRlcnZhbC5yYW5nZSA9IChzdGFydCwgc3RvcCwgc3RlcCkgPT4ge1xuICAgIGNvbnN0IHJhbmdlID0gW107XG4gICAgc3RhcnQgPSBpbnRlcnZhbC5jZWlsKHN0YXJ0KTtcbiAgICBzdGVwID0gc3RlcCA9PSBudWxsID8gMSA6IE1hdGguZmxvb3Ioc3RlcCk7XG4gICAgaWYgKCEoc3RhcnQgPCBzdG9wKSB8fCAhKHN0ZXAgPiAwKSkgcmV0dXJuIHJhbmdlOyAvLyBhbHNvIGhhbmRsZXMgSW52YWxpZCBEYXRlXG4gICAgbGV0IHByZXZpb3VzO1xuICAgIGRvIHJhbmdlLnB1c2gocHJldmlvdXMgPSBuZXcgRGF0ZSgrc3RhcnQpKSwgb2Zmc2V0aShzdGFydCwgc3RlcCksIGZsb29yaShzdGFydCk7XG4gICAgd2hpbGUgKHByZXZpb3VzIDwgc3RhcnQgJiYgc3RhcnQgPCBzdG9wKTtcbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgaW50ZXJ2YWwuZmlsdGVyID0gKHRlc3QpID0+IHtcbiAgICByZXR1cm4gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgICBpZiAoZGF0ZSA+PSBkYXRlKSB3aGlsZSAoZmxvb3JpKGRhdGUpLCAhdGVzdChkYXRlKSkgZGF0ZS5zZXRUaW1lKGRhdGUgLSAxKTtcbiAgICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgICAgaWYgKGRhdGUgPj0gZGF0ZSkge1xuICAgICAgICBpZiAoc3RlcCA8IDApIHdoaWxlICgrK3N0ZXAgPD0gMCkge1xuICAgICAgICAgIHdoaWxlIChvZmZzZXRpKGRhdGUsIC0xKSwgIXRlc3QoZGF0ZSkpIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZW1wdHlcbiAgICAgICAgfSBlbHNlIHdoaWxlICgtLXN0ZXAgPj0gMCkge1xuICAgICAgICAgIHdoaWxlIChvZmZzZXRpKGRhdGUsICsxKSwgIXRlc3QoZGF0ZSkpIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZW1wdHlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIGlmIChjb3VudCkge1xuICAgIGludGVydmFsLmNvdW50ID0gKHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgIHQwLnNldFRpbWUoK3N0YXJ0KSwgdDEuc2V0VGltZSgrZW5kKTtcbiAgICAgIGZsb29yaSh0MCksIGZsb29yaSh0MSk7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihjb3VudCh0MCwgdDEpKTtcbiAgICB9O1xuXG4gICAgaW50ZXJ2YWwuZXZlcnkgPSAoc3RlcCkgPT4ge1xuICAgICAgc3RlcCA9IE1hdGguZmxvb3Ioc3RlcCk7XG4gICAgICByZXR1cm4gIWlzRmluaXRlKHN0ZXApIHx8ICEoc3RlcCA+IDApID8gbnVsbFxuICAgICAgICAgIDogIShzdGVwID4gMSkgPyBpbnRlcnZhbFxuICAgICAgICAgIDogaW50ZXJ2YWwuZmlsdGVyKGZpZWxkXG4gICAgICAgICAgICAgID8gKGQpID0+IGZpZWxkKGQpICUgc3RlcCA9PT0gMFxuICAgICAgICAgICAgICA6IChkKSA9PiBpbnRlcnZhbC5jb3VudCgwLCBkKSAlIHN0ZXAgPT09IDApO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gaW50ZXJ2YWw7XG59XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcblxuZXhwb3J0IGNvbnN0IG1pbGxpc2Vjb25kID0gdGltZUludGVydmFsKCgpID0+IHtcbiAgLy8gbm9vcFxufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kIC0gc3RhcnQ7XG59KTtcblxuLy8gQW4gb3B0aW1pemVkIGltcGxlbWVudGF0aW9uIGZvciB0aGlzIHNpbXBsZSBjYXNlLlxubWlsbGlzZWNvbmQuZXZlcnkgPSAoaykgPT4ge1xuICBrID0gTWF0aC5mbG9vcihrKTtcbiAgaWYgKCFpc0Zpbml0ZShrKSB8fCAhKGsgPiAwKSkgcmV0dXJuIG51bGw7XG4gIGlmICghKGsgPiAxKSkgcmV0dXJuIG1pbGxpc2Vjb25kO1xuICByZXR1cm4gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRUaW1lKE1hdGguZmxvb3IoZGF0ZSAvIGspICogayk7XG4gIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGspO1xuICB9LCAoc3RhcnQsIGVuZCkgPT4ge1xuICAgIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gaztcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgbWlsbGlzZWNvbmRzID0gbWlsbGlzZWNvbmQucmFuZ2U7XG4iLCJleHBvcnQgY29uc3QgZHVyYXRpb25TZWNvbmQgPSAxMDAwO1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uTWludXRlID0gZHVyYXRpb25TZWNvbmQgKiA2MDtcbmV4cG9ydCBjb25zdCBkdXJhdGlvbkhvdXIgPSBkdXJhdGlvbk1pbnV0ZSAqIDYwO1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uRGF5ID0gZHVyYXRpb25Ib3VyICogMjQ7XG5leHBvcnQgY29uc3QgZHVyYXRpb25XZWVrID0gZHVyYXRpb25EYXkgKiA3O1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uTW9udGggPSBkdXJhdGlvbkRheSAqIDMwO1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uWWVhciA9IGR1cmF0aW9uRGF5ICogMzY1O1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uU2Vjb25kfSBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuXG5leHBvcnQgY29uc3Qgc2Vjb25kID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VGltZShkYXRlIC0gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25TZWNvbmQpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvblNlY29uZDtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ1NlY29uZHMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3Qgc2Vjb25kcyA9IHNlY29uZC5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvbk1pbnV0ZSwgZHVyYXRpb25TZWNvbmR9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lTWludXRlID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VGltZShkYXRlIC0gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSAtIGRhdGUuZ2V0U2Vjb25kcygpICogZHVyYXRpb25TZWNvbmQpO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGR1cmF0aW9uTWludXRlKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25NaW51dGU7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRNaW51dGVzKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHRpbWVNaW51dGVzID0gdGltZU1pbnV0ZS5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y01pbnV0ZSA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ1NlY29uZHMoMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25NaW51dGUpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbk1pbnV0ZTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ01pbnV0ZXMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdXRjTWludXRlcyA9IHV0Y01pbnV0ZS5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvbkhvdXIsIGR1cmF0aW9uTWludXRlLCBkdXJhdGlvblNlY29uZH0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVIb3VyID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VGltZShkYXRlIC0gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSAtIGRhdGUuZ2V0U2Vjb25kcygpICogZHVyYXRpb25TZWNvbmQgLSBkYXRlLmdldE1pbnV0ZXMoKSAqIGR1cmF0aW9uTWludXRlKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBkdXJhdGlvbkhvdXIpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbkhvdXI7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRIb3VycygpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB0aW1lSG91cnMgPSB0aW1lSG91ci5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y0hvdXIgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENNaW51dGVzKDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGR1cmF0aW9uSG91cik7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uSG91cjtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ0hvdXJzKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHV0Y0hvdXJzID0gdXRjSG91ci5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvbkRheSwgZHVyYXRpb25NaW51dGV9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lRGF5ID0gdGltZUludGVydmFsKFxuICBkYXRlID0+IGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCksXG4gIChkYXRlLCBzdGVwKSA9PiBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBzdGVwKSxcbiAgKHN0YXJ0LCBlbmQpID0+IChlbmQgLSBzdGFydCAtIChlbmQuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIHN0YXJ0LmdldFRpbWV6b25lT2Zmc2V0KCkpICogZHVyYXRpb25NaW51dGUpIC8gZHVyYXRpb25EYXksXG4gIGRhdGUgPT4gZGF0ZS5nZXREYXRlKCkgLSAxXG4pO1xuXG5leHBvcnQgY29uc3QgdGltZURheXMgPSB0aW1lRGF5LnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjRGF5ID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25EYXk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENEYXRlKCkgLSAxO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1dGNEYXlzID0gdXRjRGF5LnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdW5peERheSA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uRGF5O1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoZGF0ZSAvIGR1cmF0aW9uRGF5KTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdW5peERheXMgPSB1bml4RGF5LnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uTWludXRlLCBkdXJhdGlvbldlZWt9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmZ1bmN0aW9uIHRpbWVXZWVrZGF5KGkpIHtcbiAgcmV0dXJuIHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSAtIChkYXRlLmdldERheSgpICsgNyAtIGkpICUgNyk7XG4gICAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBzdGVwICogNyk7XG4gIH0sIChzdGFydCwgZW5kKSA9PiB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCAtIChlbmQuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIHN0YXJ0LmdldFRpbWV6b25lT2Zmc2V0KCkpICogZHVyYXRpb25NaW51dGUpIC8gZHVyYXRpb25XZWVrO1xuICB9KTtcbn1cblxuZXhwb3J0IGNvbnN0IHRpbWVTdW5kYXkgPSB0aW1lV2Vla2RheSgwKTtcbmV4cG9ydCBjb25zdCB0aW1lTW9uZGF5ID0gdGltZVdlZWtkYXkoMSk7XG5leHBvcnQgY29uc3QgdGltZVR1ZXNkYXkgPSB0aW1lV2Vla2RheSgyKTtcbmV4cG9ydCBjb25zdCB0aW1lV2VkbmVzZGF5ID0gdGltZVdlZWtkYXkoMyk7XG5leHBvcnQgY29uc3QgdGltZVRodXJzZGF5ID0gdGltZVdlZWtkYXkoNCk7XG5leHBvcnQgY29uc3QgdGltZUZyaWRheSA9IHRpbWVXZWVrZGF5KDUpO1xuZXhwb3J0IGNvbnN0IHRpbWVTYXR1cmRheSA9IHRpbWVXZWVrZGF5KDYpO1xuXG5leHBvcnQgY29uc3QgdGltZVN1bmRheXMgPSB0aW1lU3VuZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVNb25kYXlzID0gdGltZU1vbmRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lVHVlc2RheXMgPSB0aW1lVHVlc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lV2VkbmVzZGF5cyA9IHRpbWVXZWRuZXNkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZVRodXJzZGF5cyA9IHRpbWVUaHVyc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lRnJpZGF5cyA9IHRpbWVGcmlkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZVNhdHVyZGF5cyA9IHRpbWVTYXR1cmRheS5yYW5nZTtcblxuZnVuY3Rpb24gdXRjV2Vla2RheShpKSB7XG4gIHJldHVybiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgLSAoZGF0ZS5nZXRVVENEYXkoKSArIDcgLSBpKSAlIDcpO1xuICAgIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgZGF0ZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpICsgc3RlcCAqIDcpO1xuICB9LCAoc3RhcnQsIGVuZCkgPT4ge1xuICAgIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25XZWVrO1xuICB9KTtcbn1cblxuZXhwb3J0IGNvbnN0IHV0Y1N1bmRheSA9IHV0Y1dlZWtkYXkoMCk7XG5leHBvcnQgY29uc3QgdXRjTW9uZGF5ID0gdXRjV2Vla2RheSgxKTtcbmV4cG9ydCBjb25zdCB1dGNUdWVzZGF5ID0gdXRjV2Vla2RheSgyKTtcbmV4cG9ydCBjb25zdCB1dGNXZWRuZXNkYXkgPSB1dGNXZWVrZGF5KDMpO1xuZXhwb3J0IGNvbnN0IHV0Y1RodXJzZGF5ID0gdXRjV2Vla2RheSg0KTtcbmV4cG9ydCBjb25zdCB1dGNGcmlkYXkgPSB1dGNXZWVrZGF5KDUpO1xuZXhwb3J0IGNvbnN0IHV0Y1NhdHVyZGF5ID0gdXRjV2Vla2RheSg2KTtcblxuZXhwb3J0IGNvbnN0IHV0Y1N1bmRheXMgPSB1dGNTdW5kYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjTW9uZGF5cyA9IHV0Y01vbmRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNUdWVzZGF5cyA9IHV0Y1R1ZXNkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjV2VkbmVzZGF5cyA9IHV0Y1dlZG5lc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNUaHVyc2RheXMgPSB1dGNUaHVyc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNGcmlkYXlzID0gdXRjRnJpZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y1NhdHVyZGF5cyA9IHV0Y1NhdHVyZGF5LnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lTW9udGggPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXREYXRlKDEpO1xuICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRNb250aChkYXRlLmdldE1vbnRoKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQuZ2V0TW9udGgoKSAtIHN0YXJ0LmdldE1vbnRoKCkgKyAoZW5kLmdldEZ1bGxZZWFyKCkgLSBzdGFydC5nZXRGdWxsWWVhcigpKSAqIDEyO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0TW9udGgoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdGltZU1vbnRocyA9IHRpbWVNb250aC5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y01vbnRoID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDRGF0ZSgxKTtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VVRDTW9udGgoZGF0ZS5nZXRVVENNb250aCgpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kLmdldFVUQ01vbnRoKCkgLSBzdGFydC5nZXRVVENNb250aCgpICsgKGVuZC5nZXRVVENGdWxsWWVhcigpIC0gc3RhcnQuZ2V0VVRDRnVsbFllYXIoKSkgKiAxMjtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ01vbnRoKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHV0Y01vbnRocyA9IHV0Y01vbnRoLnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lWWVhciA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldE1vbnRoKDAsIDEpO1xuICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQuZ2V0RnVsbFllYXIoKSAtIHN0YXJ0LmdldEZ1bGxZZWFyKCk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpO1xufSk7XG5cbi8vIEFuIG9wdGltaXplZCBpbXBsZW1lbnRhdGlvbiBmb3IgdGhpcyBzaW1wbGUgY2FzZS5cbnRpbWVZZWFyLmV2ZXJ5ID0gKGspID0+IHtcbiAgcmV0dXJuICFpc0Zpbml0ZShrID0gTWF0aC5mbG9vcihrKSkgfHwgIShrID4gMCkgPyBudWxsIDogdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRGdWxsWWVhcihNYXRoLmZsb29yKGRhdGUuZ2V0RnVsbFllYXIoKSAvIGspICogayk7XG4gICAgZGF0ZS5zZXRNb250aCgwLCAxKTtcbiAgICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpICsgc3RlcCAqIGspO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB0aW1lWWVhcnMgPSB0aW1lWWVhci5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y1llYXIgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENNb250aCgwLCAxKTtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VVRDRnVsbFllYXIoZGF0ZS5nZXRVVENGdWxsWWVhcigpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kLmdldFVUQ0Z1bGxZZWFyKCkgLSBzdGFydC5nZXRVVENGdWxsWWVhcigpO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDRnVsbFllYXIoKTtcbn0pO1xuXG4vLyBBbiBvcHRpbWl6ZWQgaW1wbGVtZW50YXRpb24gZm9yIHRoaXMgc2ltcGxlIGNhc2UuXG51dGNZZWFyLmV2ZXJ5ID0gKGspID0+IHtcbiAgcmV0dXJuICFpc0Zpbml0ZShrID0gTWF0aC5mbG9vcihrKSkgfHwgIShrID4gMCkgPyBudWxsIDogdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRVVENGdWxsWWVhcihNYXRoLmZsb29yKGRhdGUuZ2V0VVRDRnVsbFllYXIoKSAvIGspICogayk7XG4gICAgZGF0ZS5zZXRVVENNb250aCgwLCAxKTtcbiAgICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0VVRDRnVsbFllYXIoZGF0ZS5nZXRVVENGdWxsWWVhcigpICsgc3RlcCAqIGspO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1dGNZZWFycyA9IHV0Y1llYXIucmFuZ2U7XG4iLCJpbXBvcnQge2Jpc2VjdG9yLCB0aWNrU3RlcH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2R1cmF0aW9uRGF5LCBkdXJhdGlvbkhvdXIsIGR1cmF0aW9uTWludXRlLCBkdXJhdGlvbk1vbnRoLCBkdXJhdGlvblNlY29uZCwgZHVyYXRpb25XZWVrLCBkdXJhdGlvblllYXJ9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5pbXBvcnQge21pbGxpc2Vjb25kfSBmcm9tIFwiLi9taWxsaXNlY29uZC5qc1wiO1xuaW1wb3J0IHtzZWNvbmR9IGZyb20gXCIuL3NlY29uZC5qc1wiO1xuaW1wb3J0IHt0aW1lTWludXRlLCB1dGNNaW51dGV9IGZyb20gXCIuL21pbnV0ZS5qc1wiO1xuaW1wb3J0IHt0aW1lSG91ciwgdXRjSG91cn0gZnJvbSBcIi4vaG91ci5qc1wiO1xuaW1wb3J0IHt0aW1lRGF5LCB1bml4RGF5fSBmcm9tIFwiLi9kYXkuanNcIjtcbmltcG9ydCB7dGltZVN1bmRheSwgdXRjU3VuZGF5fSBmcm9tIFwiLi93ZWVrLmpzXCI7XG5pbXBvcnQge3RpbWVNb250aCwgdXRjTW9udGh9IGZyb20gXCIuL21vbnRoLmpzXCI7XG5pbXBvcnQge3RpbWVZZWFyLCB1dGNZZWFyfSBmcm9tIFwiLi95ZWFyLmpzXCI7XG5cbmZ1bmN0aW9uIHRpY2tlcih5ZWFyLCBtb250aCwgd2VlaywgZGF5LCBob3VyLCBtaW51dGUpIHtcblxuICBjb25zdCB0aWNrSW50ZXJ2YWxzID0gW1xuICAgIFtzZWNvbmQsICAxLCAgICAgIGR1cmF0aW9uU2Vjb25kXSxcbiAgICBbc2Vjb25kLCAgNSwgIDUgKiBkdXJhdGlvblNlY29uZF0sXG4gICAgW3NlY29uZCwgMTUsIDE1ICogZHVyYXRpb25TZWNvbmRdLFxuICAgIFtzZWNvbmQsIDMwLCAzMCAqIGR1cmF0aW9uU2Vjb25kXSxcbiAgICBbbWludXRlLCAgMSwgICAgICBkdXJhdGlvbk1pbnV0ZV0sXG4gICAgW21pbnV0ZSwgIDUsICA1ICogZHVyYXRpb25NaW51dGVdLFxuICAgIFttaW51dGUsIDE1LCAxNSAqIGR1cmF0aW9uTWludXRlXSxcbiAgICBbbWludXRlLCAzMCwgMzAgKiBkdXJhdGlvbk1pbnV0ZV0sXG4gICAgWyAgaG91ciwgIDEsICAgICAgZHVyYXRpb25Ib3VyICBdLFxuICAgIFsgIGhvdXIsICAzLCAgMyAqIGR1cmF0aW9uSG91ciAgXSxcbiAgICBbICBob3VyLCAgNiwgIDYgKiBkdXJhdGlvbkhvdXIgIF0sXG4gICAgWyAgaG91ciwgMTIsIDEyICogZHVyYXRpb25Ib3VyICBdLFxuICAgIFsgICBkYXksICAxLCAgICAgIGR1cmF0aW9uRGF5ICAgXSxcbiAgICBbICAgZGF5LCAgMiwgIDIgKiBkdXJhdGlvbkRheSAgIF0sXG4gICAgWyAgd2VlaywgIDEsICAgICAgZHVyYXRpb25XZWVrICBdLFxuICAgIFsgbW9udGgsICAxLCAgICAgIGR1cmF0aW9uTW9udGggXSxcbiAgICBbIG1vbnRoLCAgMywgIDMgKiBkdXJhdGlvbk1vbnRoIF0sXG4gICAgWyAgeWVhciwgIDEsICAgICAgZHVyYXRpb25ZZWFyICBdXG4gIF07XG5cbiAgZnVuY3Rpb24gdGlja3Moc3RhcnQsIHN0b3AsIGNvdW50KSB7XG4gICAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydDtcbiAgICBpZiAocmV2ZXJzZSkgW3N0YXJ0LCBzdG9wXSA9IFtzdG9wLCBzdGFydF07XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBjb3VudCAmJiB0eXBlb2YgY291bnQucmFuZ2UgPT09IFwiZnVuY3Rpb25cIiA/IGNvdW50IDogdGlja0ludGVydmFsKHN0YXJ0LCBzdG9wLCBjb3VudCk7XG4gICAgY29uc3QgdGlja3MgPSBpbnRlcnZhbCA/IGludGVydmFsLnJhbmdlKHN0YXJ0LCArc3RvcCArIDEpIDogW107IC8vIGluY2x1c2l2ZSBzdG9wXG4gICAgcmV0dXJuIHJldmVyc2UgPyB0aWNrcy5yZXZlcnNlKCkgOiB0aWNrcztcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpY2tJbnRlcnZhbChzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBNYXRoLmFicyhzdG9wIC0gc3RhcnQpIC8gY291bnQ7XG4gICAgY29uc3QgaSA9IGJpc2VjdG9yKChbLCwgc3RlcF0pID0+IHN0ZXApLnJpZ2h0KHRpY2tJbnRlcnZhbHMsIHRhcmdldCk7XG4gICAgaWYgKGkgPT09IHRpY2tJbnRlcnZhbHMubGVuZ3RoKSByZXR1cm4geWVhci5ldmVyeSh0aWNrU3RlcChzdGFydCAvIGR1cmF0aW9uWWVhciwgc3RvcCAvIGR1cmF0aW9uWWVhciwgY291bnQpKTtcbiAgICBpZiAoaSA9PT0gMCkgcmV0dXJuIG1pbGxpc2Vjb25kLmV2ZXJ5KE1hdGgubWF4KHRpY2tTdGVwKHN0YXJ0LCBzdG9wLCBjb3VudCksIDEpKTtcbiAgICBjb25zdCBbdCwgc3RlcF0gPSB0aWNrSW50ZXJ2YWxzW3RhcmdldCAvIHRpY2tJbnRlcnZhbHNbaSAtIDFdWzJdIDwgdGlja0ludGVydmFsc1tpXVsyXSAvIHRhcmdldCA/IGkgLSAxIDogaV07XG4gICAgcmV0dXJuIHQuZXZlcnkoc3RlcCk7XG4gIH1cblxuICByZXR1cm4gW3RpY2tzLCB0aWNrSW50ZXJ2YWxdO1xufVxuXG5jb25zdCBbdXRjVGlja3MsIHV0Y1RpY2tJbnRlcnZhbF0gPSB0aWNrZXIodXRjWWVhciwgdXRjTW9udGgsIHV0Y1N1bmRheSwgdW5peERheSwgdXRjSG91ciwgdXRjTWludXRlKTtcbmNvbnN0IFt0aW1lVGlja3MsIHRpbWVUaWNrSW50ZXJ2YWxdID0gdGlja2VyKHRpbWVZZWFyLCB0aW1lTW9udGgsIHRpbWVTdW5kYXksIHRpbWVEYXksIHRpbWVIb3VyLCB0aW1lTWludXRlKTtcblxuZXhwb3J0IHt1dGNUaWNrcywgdXRjVGlja0ludGVydmFsLCB0aW1lVGlja3MsIHRpbWVUaWNrSW50ZXJ2YWx9O1xuIiwiaW1wb3J0IHtcbiAgdGltZURheSxcbiAgdGltZVN1bmRheSxcbiAgdGltZU1vbmRheSxcbiAgdGltZVRodXJzZGF5LFxuICB0aW1lWWVhcixcbiAgdXRjRGF5LFxuICB1dGNTdW5kYXksXG4gIHV0Y01vbmRheSxcbiAgdXRjVGh1cnNkYXksXG4gIHV0Y1llYXJcbn0gZnJvbSBcImQzLXRpbWVcIjtcblxuZnVuY3Rpb24gbG9jYWxEYXRlKGQpIHtcbiAgaWYgKDAgPD0gZC55ICYmIGQueSA8IDEwMCkge1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoLTEsIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpO1xuICAgIGRhdGUuc2V0RnVsbFllYXIoZC55KTtcbiAgICByZXR1cm4gZGF0ZTtcbiAgfVxuICByZXR1cm4gbmV3IERhdGUoZC55LCBkLm0sIGQuZCwgZC5ILCBkLk0sIGQuUywgZC5MKTtcbn1cblxuZnVuY3Rpb24gdXRjRGF0ZShkKSB7XG4gIGlmICgwIDw9IGQueSAmJiBkLnkgPCAxMDApIHtcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKC0xLCBkLm0sIGQuZCwgZC5ILCBkLk0sIGQuUywgZC5MKSk7XG4gICAgZGF0ZS5zZXRVVENGdWxsWWVhcihkLnkpO1xuICAgIHJldHVybiBkYXRlO1xuICB9XG4gIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyhkLnksIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpKTtcbn1cblxuZnVuY3Rpb24gbmV3RGF0ZSh5LCBtLCBkKSB7XG4gIHJldHVybiB7eTogeSwgbTogbSwgZDogZCwgSDogMCwgTTogMCwgUzogMCwgTDogMH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZvcm1hdExvY2FsZShsb2NhbGUpIHtcbiAgdmFyIGxvY2FsZV9kYXRlVGltZSA9IGxvY2FsZS5kYXRlVGltZSxcbiAgICAgIGxvY2FsZV9kYXRlID0gbG9jYWxlLmRhdGUsXG4gICAgICBsb2NhbGVfdGltZSA9IGxvY2FsZS50aW1lLFxuICAgICAgbG9jYWxlX3BlcmlvZHMgPSBsb2NhbGUucGVyaW9kcyxcbiAgICAgIGxvY2FsZV93ZWVrZGF5cyA9IGxvY2FsZS5kYXlzLFxuICAgICAgbG9jYWxlX3Nob3J0V2Vla2RheXMgPSBsb2NhbGUuc2hvcnREYXlzLFxuICAgICAgbG9jYWxlX21vbnRocyA9IGxvY2FsZS5tb250aHMsXG4gICAgICBsb2NhbGVfc2hvcnRNb250aHMgPSBsb2NhbGUuc2hvcnRNb250aHM7XG5cbiAgdmFyIHBlcmlvZFJlID0gZm9ybWF0UmUobG9jYWxlX3BlcmlvZHMpLFxuICAgICAgcGVyaW9kTG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9wZXJpb2RzKSxcbiAgICAgIHdlZWtkYXlSZSA9IGZvcm1hdFJlKGxvY2FsZV93ZWVrZGF5cyksXG4gICAgICB3ZWVrZGF5TG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV93ZWVrZGF5cyksXG4gICAgICBzaG9ydFdlZWtkYXlSZSA9IGZvcm1hdFJlKGxvY2FsZV9zaG9ydFdlZWtkYXlzKSxcbiAgICAgIHNob3J0V2Vla2RheUxvb2t1cCA9IGZvcm1hdExvb2t1cChsb2NhbGVfc2hvcnRXZWVrZGF5cyksXG4gICAgICBtb250aFJlID0gZm9ybWF0UmUobG9jYWxlX21vbnRocyksXG4gICAgICBtb250aExvb2t1cCA9IGZvcm1hdExvb2t1cChsb2NhbGVfbW9udGhzKSxcbiAgICAgIHNob3J0TW9udGhSZSA9IGZvcm1hdFJlKGxvY2FsZV9zaG9ydE1vbnRocyksXG4gICAgICBzaG9ydE1vbnRoTG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9zaG9ydE1vbnRocyk7XG5cbiAgdmFyIGZvcm1hdHMgPSB7XG4gICAgXCJhXCI6IGZvcm1hdFNob3J0V2Vla2RheSxcbiAgICBcIkFcIjogZm9ybWF0V2Vla2RheSxcbiAgICBcImJcIjogZm9ybWF0U2hvcnRNb250aCxcbiAgICBcIkJcIjogZm9ybWF0TW9udGgsXG4gICAgXCJjXCI6IG51bGwsXG4gICAgXCJkXCI6IGZvcm1hdERheU9mTW9udGgsXG4gICAgXCJlXCI6IGZvcm1hdERheU9mTW9udGgsXG4gICAgXCJmXCI6IGZvcm1hdE1pY3Jvc2Vjb25kcyxcbiAgICBcImdcIjogZm9ybWF0WWVhcklTTyxcbiAgICBcIkdcIjogZm9ybWF0RnVsbFllYXJJU08sXG4gICAgXCJIXCI6IGZvcm1hdEhvdXIyNCxcbiAgICBcIklcIjogZm9ybWF0SG91cjEyLFxuICAgIFwialwiOiBmb3JtYXREYXlPZlllYXIsXG4gICAgXCJMXCI6IGZvcm1hdE1pbGxpc2Vjb25kcyxcbiAgICBcIm1cIjogZm9ybWF0TW9udGhOdW1iZXIsXG4gICAgXCJNXCI6IGZvcm1hdE1pbnV0ZXMsXG4gICAgXCJwXCI6IGZvcm1hdFBlcmlvZCxcbiAgICBcInFcIjogZm9ybWF0UXVhcnRlcixcbiAgICBcIlFcIjogZm9ybWF0VW5peFRpbWVzdGFtcCxcbiAgICBcInNcIjogZm9ybWF0VW5peFRpbWVzdGFtcFNlY29uZHMsXG4gICAgXCJTXCI6IGZvcm1hdFNlY29uZHMsXG4gICAgXCJ1XCI6IGZvcm1hdFdlZWtkYXlOdW1iZXJNb25kYXksXG4gICAgXCJVXCI6IGZvcm1hdFdlZWtOdW1iZXJTdW5kYXksXG4gICAgXCJWXCI6IGZvcm1hdFdlZWtOdW1iZXJJU08sXG4gICAgXCJ3XCI6IGZvcm1hdFdlZWtkYXlOdW1iZXJTdW5kYXksXG4gICAgXCJXXCI6IGZvcm1hdFdlZWtOdW1iZXJNb25kYXksXG4gICAgXCJ4XCI6IG51bGwsXG4gICAgXCJYXCI6IG51bGwsXG4gICAgXCJ5XCI6IGZvcm1hdFllYXIsXG4gICAgXCJZXCI6IGZvcm1hdEZ1bGxZZWFyLFxuICAgIFwiWlwiOiBmb3JtYXRab25lLFxuICAgIFwiJVwiOiBmb3JtYXRMaXRlcmFsUGVyY2VudFxuICB9O1xuXG4gIHZhciB1dGNGb3JtYXRzID0ge1xuICAgIFwiYVwiOiBmb3JtYXRVVENTaG9ydFdlZWtkYXksXG4gICAgXCJBXCI6IGZvcm1hdFVUQ1dlZWtkYXksXG4gICAgXCJiXCI6IGZvcm1hdFVUQ1Nob3J0TW9udGgsXG4gICAgXCJCXCI6IGZvcm1hdFVUQ01vbnRoLFxuICAgIFwiY1wiOiBudWxsLFxuICAgIFwiZFwiOiBmb3JtYXRVVENEYXlPZk1vbnRoLFxuICAgIFwiZVwiOiBmb3JtYXRVVENEYXlPZk1vbnRoLFxuICAgIFwiZlwiOiBmb3JtYXRVVENNaWNyb3NlY29uZHMsXG4gICAgXCJnXCI6IGZvcm1hdFVUQ1llYXJJU08sXG4gICAgXCJHXCI6IGZvcm1hdFVUQ0Z1bGxZZWFySVNPLFxuICAgIFwiSFwiOiBmb3JtYXRVVENIb3VyMjQsXG4gICAgXCJJXCI6IGZvcm1hdFVUQ0hvdXIxMixcbiAgICBcImpcIjogZm9ybWF0VVRDRGF5T2ZZZWFyLFxuICAgIFwiTFwiOiBmb3JtYXRVVENNaWxsaXNlY29uZHMsXG4gICAgXCJtXCI6IGZvcm1hdFVUQ01vbnRoTnVtYmVyLFxuICAgIFwiTVwiOiBmb3JtYXRVVENNaW51dGVzLFxuICAgIFwicFwiOiBmb3JtYXRVVENQZXJpb2QsXG4gICAgXCJxXCI6IGZvcm1hdFVUQ1F1YXJ0ZXIsXG4gICAgXCJRXCI6IGZvcm1hdFVuaXhUaW1lc3RhbXAsXG4gICAgXCJzXCI6IGZvcm1hdFVuaXhUaW1lc3RhbXBTZWNvbmRzLFxuICAgIFwiU1wiOiBmb3JtYXRVVENTZWNvbmRzLFxuICAgIFwidVwiOiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyTW9uZGF5LFxuICAgIFwiVVwiOiBmb3JtYXRVVENXZWVrTnVtYmVyU3VuZGF5LFxuICAgIFwiVlwiOiBmb3JtYXRVVENXZWVrTnVtYmVySVNPLFxuICAgIFwid1wiOiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyU3VuZGF5LFxuICAgIFwiV1wiOiBmb3JtYXRVVENXZWVrTnVtYmVyTW9uZGF5LFxuICAgIFwieFwiOiBudWxsLFxuICAgIFwiWFwiOiBudWxsLFxuICAgIFwieVwiOiBmb3JtYXRVVENZZWFyLFxuICAgIFwiWVwiOiBmb3JtYXRVVENGdWxsWWVhcixcbiAgICBcIlpcIjogZm9ybWF0VVRDWm9uZSxcbiAgICBcIiVcIjogZm9ybWF0TGl0ZXJhbFBlcmNlbnRcbiAgfTtcblxuICB2YXIgcGFyc2VzID0ge1xuICAgIFwiYVwiOiBwYXJzZVNob3J0V2Vla2RheSxcbiAgICBcIkFcIjogcGFyc2VXZWVrZGF5LFxuICAgIFwiYlwiOiBwYXJzZVNob3J0TW9udGgsXG4gICAgXCJCXCI6IHBhcnNlTW9udGgsXG4gICAgXCJjXCI6IHBhcnNlTG9jYWxlRGF0ZVRpbWUsXG4gICAgXCJkXCI6IHBhcnNlRGF5T2ZNb250aCxcbiAgICBcImVcIjogcGFyc2VEYXlPZk1vbnRoLFxuICAgIFwiZlwiOiBwYXJzZU1pY3Jvc2Vjb25kcyxcbiAgICBcImdcIjogcGFyc2VZZWFyLFxuICAgIFwiR1wiOiBwYXJzZUZ1bGxZZWFyLFxuICAgIFwiSFwiOiBwYXJzZUhvdXIyNCxcbiAgICBcIklcIjogcGFyc2VIb3VyMjQsXG4gICAgXCJqXCI6IHBhcnNlRGF5T2ZZZWFyLFxuICAgIFwiTFwiOiBwYXJzZU1pbGxpc2Vjb25kcyxcbiAgICBcIm1cIjogcGFyc2VNb250aE51bWJlcixcbiAgICBcIk1cIjogcGFyc2VNaW51dGVzLFxuICAgIFwicFwiOiBwYXJzZVBlcmlvZCxcbiAgICBcInFcIjogcGFyc2VRdWFydGVyLFxuICAgIFwiUVwiOiBwYXJzZVVuaXhUaW1lc3RhbXAsXG4gICAgXCJzXCI6IHBhcnNlVW5peFRpbWVzdGFtcFNlY29uZHMsXG4gICAgXCJTXCI6IHBhcnNlU2Vjb25kcyxcbiAgICBcInVcIjogcGFyc2VXZWVrZGF5TnVtYmVyTW9uZGF5LFxuICAgIFwiVVwiOiBwYXJzZVdlZWtOdW1iZXJTdW5kYXksXG4gICAgXCJWXCI6IHBhcnNlV2Vla051bWJlcklTTyxcbiAgICBcIndcIjogcGFyc2VXZWVrZGF5TnVtYmVyU3VuZGF5LFxuICAgIFwiV1wiOiBwYXJzZVdlZWtOdW1iZXJNb25kYXksXG4gICAgXCJ4XCI6IHBhcnNlTG9jYWxlRGF0ZSxcbiAgICBcIlhcIjogcGFyc2VMb2NhbGVUaW1lLFxuICAgIFwieVwiOiBwYXJzZVllYXIsXG4gICAgXCJZXCI6IHBhcnNlRnVsbFllYXIsXG4gICAgXCJaXCI6IHBhcnNlWm9uZSxcbiAgICBcIiVcIjogcGFyc2VMaXRlcmFsUGVyY2VudFxuICB9O1xuXG4gIC8vIFRoZXNlIHJlY3Vyc2l2ZSBkaXJlY3RpdmUgZGVmaW5pdGlvbnMgbXVzdCBiZSBkZWZlcnJlZC5cbiAgZm9ybWF0cy54ID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlLCBmb3JtYXRzKTtcbiAgZm9ybWF0cy5YID0gbmV3Rm9ybWF0KGxvY2FsZV90aW1lLCBmb3JtYXRzKTtcbiAgZm9ybWF0cy5jID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlVGltZSwgZm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMueCA9IG5ld0Zvcm1hdChsb2NhbGVfZGF0ZSwgdXRjRm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMuWCA9IG5ld0Zvcm1hdChsb2NhbGVfdGltZSwgdXRjRm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMuYyA9IG5ld0Zvcm1hdChsb2NhbGVfZGF0ZVRpbWUsIHV0Y0Zvcm1hdHMpO1xuXG4gIGZ1bmN0aW9uIG5ld0Zvcm1hdChzcGVjaWZpZXIsIGZvcm1hdHMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgdmFyIHN0cmluZyA9IFtdLFxuICAgICAgICAgIGkgPSAtMSxcbiAgICAgICAgICBqID0gMCxcbiAgICAgICAgICBuID0gc3BlY2lmaWVyLmxlbmd0aCxcbiAgICAgICAgICBjLFxuICAgICAgICAgIHBhZCxcbiAgICAgICAgICBmb3JtYXQ7XG5cbiAgICAgIGlmICghKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkgZGF0ZSA9IG5ldyBEYXRlKCtkYXRlKTtcblxuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgaWYgKHNwZWNpZmllci5jaGFyQ29kZUF0KGkpID09PSAzNykge1xuICAgICAgICAgIHN0cmluZy5wdXNoKHNwZWNpZmllci5zbGljZShqLCBpKSk7XG4gICAgICAgICAgaWYgKChwYWQgPSBwYWRzW2MgPSBzcGVjaWZpZXIuY2hhckF0KCsraSldKSAhPSBudWxsKSBjID0gc3BlY2lmaWVyLmNoYXJBdCgrK2kpO1xuICAgICAgICAgIGVsc2UgcGFkID0gYyA9PT0gXCJlXCIgPyBcIiBcIiA6IFwiMFwiO1xuICAgICAgICAgIGlmIChmb3JtYXQgPSBmb3JtYXRzW2NdKSBjID0gZm9ybWF0KGRhdGUsIHBhZCk7XG4gICAgICAgICAgc3RyaW5nLnB1c2goYyk7XG4gICAgICAgICAgaiA9IGkgKyAxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN0cmluZy5wdXNoKHNwZWNpZmllci5zbGljZShqLCBpKSk7XG4gICAgICByZXR1cm4gc3RyaW5nLmpvaW4oXCJcIik7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld1BhcnNlKHNwZWNpZmllciwgWikge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIHZhciBkID0gbmV3RGF0ZSgxOTAwLCB1bmRlZmluZWQsIDEpLFxuICAgICAgICAgIGkgPSBwYXJzZVNwZWNpZmllcihkLCBzcGVjaWZpZXIsIHN0cmluZyArPSBcIlwiLCAwKSxcbiAgICAgICAgICB3ZWVrLCBkYXk7XG4gICAgICBpZiAoaSAhPSBzdHJpbmcubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuICAgICAgLy8gSWYgYSBVTklYIHRpbWVzdGFtcCBpcyBzcGVjaWZpZWQsIHJldHVybiBpdC5cbiAgICAgIGlmIChcIlFcIiBpbiBkKSByZXR1cm4gbmV3IERhdGUoZC5RKTtcbiAgICAgIGlmIChcInNcIiBpbiBkKSByZXR1cm4gbmV3IERhdGUoZC5zICogMTAwMCArIChcIkxcIiBpbiBkID8gZC5MIDogMCkpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlzIHV0Y1BhcnNlLCBuZXZlciB1c2UgdGhlIGxvY2FsIHRpbWV6b25lLlxuICAgICAgaWYgKFogJiYgIShcIlpcIiBpbiBkKSkgZC5aID0gMDtcblxuICAgICAgLy8gVGhlIGFtLXBtIGZsYWcgaXMgMCBmb3IgQU0sIGFuZCAxIGZvciBQTS5cbiAgICAgIGlmIChcInBcIiBpbiBkKSBkLkggPSBkLkggJSAxMiArIGQucCAqIDEyO1xuXG4gICAgICAvLyBJZiB0aGUgbW9udGggd2FzIG5vdCBzcGVjaWZpZWQsIGluaGVyaXQgZnJvbSB0aGUgcXVhcnRlci5cbiAgICAgIGlmIChkLm0gPT09IHVuZGVmaW5lZCkgZC5tID0gXCJxXCIgaW4gZCA/IGQucSA6IDA7XG5cbiAgICAgIC8vIENvbnZlcnQgZGF5LW9mLXdlZWsgYW5kIHdlZWstb2YteWVhciB0byBkYXktb2YteWVhci5cbiAgICAgIGlmIChcIlZcIiBpbiBkKSB7XG4gICAgICAgIGlmIChkLlYgPCAxIHx8IGQuViA+IDUzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKCEoXCJ3XCIgaW4gZCkpIGQudyA9IDE7XG4gICAgICAgIGlmIChcIlpcIiBpbiBkKSB7XG4gICAgICAgICAgd2VlayA9IHV0Y0RhdGUobmV3RGF0ZShkLnksIDAsIDEpKSwgZGF5ID0gd2Vlay5nZXRVVENEYXkoKTtcbiAgICAgICAgICB3ZWVrID0gZGF5ID4gNCB8fCBkYXkgPT09IDAgPyB1dGNNb25kYXkuY2VpbCh3ZWVrKSA6IHV0Y01vbmRheSh3ZWVrKTtcbiAgICAgICAgICB3ZWVrID0gdXRjRGF5Lm9mZnNldCh3ZWVrLCAoZC5WIC0gMSkgKiA3KTtcbiAgICAgICAgICBkLnkgPSB3ZWVrLmdldFVUQ0Z1bGxZZWFyKCk7XG4gICAgICAgICAgZC5tID0gd2Vlay5nZXRVVENNb250aCgpO1xuICAgICAgICAgIGQuZCA9IHdlZWsuZ2V0VVRDRGF0ZSgpICsgKGQudyArIDYpICUgNztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3ZWVrID0gbG9jYWxEYXRlKG5ld0RhdGUoZC55LCAwLCAxKSksIGRheSA9IHdlZWsuZ2V0RGF5KCk7XG4gICAgICAgICAgd2VlayA9IGRheSA+IDQgfHwgZGF5ID09PSAwID8gdGltZU1vbmRheS5jZWlsKHdlZWspIDogdGltZU1vbmRheSh3ZWVrKTtcbiAgICAgICAgICB3ZWVrID0gdGltZURheS5vZmZzZXQod2VlaywgKGQuViAtIDEpICogNyk7XG4gICAgICAgICAgZC55ID0gd2Vlay5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgIGQubSA9IHdlZWsuZ2V0TW9udGgoKTtcbiAgICAgICAgICBkLmQgPSB3ZWVrLmdldERhdGUoKSArIChkLncgKyA2KSAlIDc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXCJXXCIgaW4gZCB8fCBcIlVcIiBpbiBkKSB7XG4gICAgICAgIGlmICghKFwid1wiIGluIGQpKSBkLncgPSBcInVcIiBpbiBkID8gZC51ICUgNyA6IFwiV1wiIGluIGQgPyAxIDogMDtcbiAgICAgICAgZGF5ID0gXCJaXCIgaW4gZCA/IHV0Y0RhdGUobmV3RGF0ZShkLnksIDAsIDEpKS5nZXRVVENEYXkoKSA6IGxvY2FsRGF0ZShuZXdEYXRlKGQueSwgMCwgMSkpLmdldERheSgpO1xuICAgICAgICBkLm0gPSAwO1xuICAgICAgICBkLmQgPSBcIldcIiBpbiBkID8gKGQudyArIDYpICUgNyArIGQuVyAqIDcgLSAoZGF5ICsgNSkgJSA3IDogZC53ICsgZC5VICogNyAtIChkYXkgKyA2KSAlIDc7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGEgdGltZSB6b25lIGlzIHNwZWNpZmllZCwgYWxsIGZpZWxkcyBhcmUgaW50ZXJwcmV0ZWQgYXMgVVRDIGFuZCB0aGVuXG4gICAgICAvLyBvZmZzZXQgYWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpZWQgdGltZSB6b25lLlxuICAgICAgaWYgKFwiWlwiIGluIGQpIHtcbiAgICAgICAgZC5IICs9IGQuWiAvIDEwMCB8IDA7XG4gICAgICAgIGQuTSArPSBkLlogJSAxMDA7XG4gICAgICAgIHJldHVybiB1dGNEYXRlKGQpO1xuICAgICAgfVxuXG4gICAgICAvLyBPdGhlcndpc2UsIGFsbCBmaWVsZHMgYXJlIGluIGxvY2FsIHRpbWUuXG4gICAgICByZXR1cm4gbG9jYWxEYXRlKGQpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVNwZWNpZmllcihkLCBzcGVjaWZpZXIsIHN0cmluZywgaikge1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgbiA9IHNwZWNpZmllci5sZW5ndGgsXG4gICAgICAgIG0gPSBzdHJpbmcubGVuZ3RoLFxuICAgICAgICBjLFxuICAgICAgICBwYXJzZTtcblxuICAgIHdoaWxlIChpIDwgbikge1xuICAgICAgaWYgKGogPj0gbSkgcmV0dXJuIC0xO1xuICAgICAgYyA9IHNwZWNpZmllci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICBpZiAoYyA9PT0gMzcpIHtcbiAgICAgICAgYyA9IHNwZWNpZmllci5jaGFyQXQoaSsrKTtcbiAgICAgICAgcGFyc2UgPSBwYXJzZXNbYyBpbiBwYWRzID8gc3BlY2lmaWVyLmNoYXJBdChpKyspIDogY107XG4gICAgICAgIGlmICghcGFyc2UgfHwgKChqID0gcGFyc2UoZCwgc3RyaW5nLCBqKSkgPCAwKSkgcmV0dXJuIC0xO1xuICAgICAgfSBlbHNlIGlmIChjICE9IHN0cmluZy5jaGFyQ29kZUF0KGorKykpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBqO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VQZXJpb2QoZCwgc3RyaW5nLCBpKSB7XG4gICAgdmFyIG4gPSBwZXJpb2RSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC5wID0gcGVyaW9kTG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVNob3J0V2Vla2RheShkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IHNob3J0V2Vla2RheVJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLncgPSBzaG9ydFdlZWtkYXlMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlV2Vla2RheShkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IHdlZWtkYXlSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC53ID0gd2Vla2RheUxvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VTaG9ydE1vbnRoKGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gc2hvcnRNb250aFJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLm0gPSBzaG9ydE1vbnRoTG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZU1vbnRoKGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gbW9udGhSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC5tID0gbW9udGhMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTG9jYWxlRGF0ZVRpbWUoZCwgc3RyaW5nLCBpKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BlY2lmaWVyKGQsIGxvY2FsZV9kYXRlVGltZSwgc3RyaW5nLCBpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTG9jYWxlRGF0ZShkLCBzdHJpbmcsIGkpIHtcbiAgICByZXR1cm4gcGFyc2VTcGVjaWZpZXIoZCwgbG9jYWxlX2RhdGUsIHN0cmluZywgaSk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUxvY2FsZVRpbWUoZCwgc3RyaW5nLCBpKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BlY2lmaWVyKGQsIGxvY2FsZV90aW1lLCBzdHJpbmcsIGkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0U2hvcnRXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3Nob3J0V2Vla2RheXNbZC5nZXREYXkoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3dlZWtkYXlzW2QuZ2V0RGF5KCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0U2hvcnRNb250aChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9zaG9ydE1vbnRoc1tkLmdldE1vbnRoKCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0TW9udGgoZCkge1xuICAgIHJldHVybiBsb2NhbGVfbW9udGhzW2QuZ2V0TW9udGgoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRQZXJpb2QoZCkge1xuICAgIHJldHVybiBsb2NhbGVfcGVyaW9kc1srKGQuZ2V0SG91cnMoKSA+PSAxMildO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0UXVhcnRlcihkKSB7XG4gICAgcmV0dXJuIDEgKyB+fihkLmdldE1vbnRoKCkgLyAzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1Nob3J0V2Vla2RheShkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9zaG9ydFdlZWtkYXlzW2QuZ2V0VVRDRGF5KCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDV2Vla2RheShkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV93ZWVrZGF5c1tkLmdldFVUQ0RheSgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1Nob3J0TW9udGgoZCkge1xuICAgIHJldHVybiBsb2NhbGVfc2hvcnRNb250aHNbZC5nZXRVVENNb250aCgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ01vbnRoKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX21vbnRoc1tkLmdldFVUQ01vbnRoKCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDUGVyaW9kKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3BlcmlvZHNbKyhkLmdldFVUQ0hvdXJzKCkgPj0gMTIpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1F1YXJ0ZXIoZCkge1xuICAgIHJldHVybiAxICsgfn4oZC5nZXRVVENNb250aCgpIC8gMyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGZvcm1hdDogZnVuY3Rpb24oc3BlY2lmaWVyKSB7XG4gICAgICB2YXIgZiA9IG5ld0Zvcm1hdChzcGVjaWZpZXIgKz0gXCJcIiwgZm9ybWF0cyk7XG4gICAgICBmLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBzcGVjaWZpZXI7IH07XG4gICAgICByZXR1cm4gZjtcbiAgICB9LFxuICAgIHBhcnNlOiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBwID0gbmV3UGFyc2Uoc3BlY2lmaWVyICs9IFwiXCIsIGZhbHNlKTtcbiAgICAgIHAudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBwO1xuICAgIH0sXG4gICAgdXRjRm9ybWF0OiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBmID0gbmV3Rm9ybWF0KHNwZWNpZmllciArPSBcIlwiLCB1dGNGb3JtYXRzKTtcbiAgICAgIGYudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBmO1xuICAgIH0sXG4gICAgdXRjUGFyc2U6IGZ1bmN0aW9uKHNwZWNpZmllcikge1xuICAgICAgdmFyIHAgPSBuZXdQYXJzZShzcGVjaWZpZXIgKz0gXCJcIiwgdHJ1ZSk7XG4gICAgICBwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBzcGVjaWZpZXI7IH07XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gIH07XG59XG5cbnZhciBwYWRzID0ge1wiLVwiOiBcIlwiLCBcIl9cIjogXCIgXCIsIFwiMFwiOiBcIjBcIn0sXG4gICAgbnVtYmVyUmUgPSAvXlxccypcXGQrLywgLy8gbm90ZTogaWdub3JlcyBuZXh0IGRpcmVjdGl2ZVxuICAgIHBlcmNlbnRSZSA9IC9eJS8sXG4gICAgcmVxdW90ZVJlID0gL1tcXFxcXiQqKz98W1xcXSgpLnt9XS9nO1xuXG5mdW5jdGlvbiBwYWQodmFsdWUsIGZpbGwsIHdpZHRoKSB7XG4gIHZhciBzaWduID0gdmFsdWUgPCAwID8gXCItXCIgOiBcIlwiLFxuICAgICAgc3RyaW5nID0gKHNpZ24gPyAtdmFsdWUgOiB2YWx1ZSkgKyBcIlwiLFxuICAgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcbiAgcmV0dXJuIHNpZ24gKyAobGVuZ3RoIDwgd2lkdGggPyBuZXcgQXJyYXkod2lkdGggLSBsZW5ndGggKyAxKS5qb2luKGZpbGwpICsgc3RyaW5nIDogc3RyaW5nKTtcbn1cblxuZnVuY3Rpb24gcmVxdW90ZShzKSB7XG4gIHJldHVybiBzLnJlcGxhY2UocmVxdW90ZVJlLCBcIlxcXFwkJlwiKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0UmUobmFtZXMpIHtcbiAgcmV0dXJuIG5ldyBSZWdFeHAoXCJeKD86XCIgKyBuYW1lcy5tYXAocmVxdW90ZSkuam9pbihcInxcIikgKyBcIilcIiwgXCJpXCIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRMb29rdXAobmFtZXMpIHtcbiAgcmV0dXJuIG5ldyBNYXAobmFtZXMubWFwKChuYW1lLCBpKSA9PiBbbmFtZS50b0xvd2VyQ2FzZSgpLCBpXSkpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtkYXlOdW1iZXJTdW5kYXkoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyAoZC53ID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrZGF5TnVtYmVyTW9uZGF5KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAxKSk7XG4gIHJldHVybiBuID8gKGQudSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2Vla051bWJlclN1bmRheShkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLlUgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtOdW1iZXJJU08oZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5WID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrTnVtYmVyTW9uZGF5KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuVyA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRnVsbFllYXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDQpKTtcbiAgcmV0dXJuIG4gPyAoZC55ID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VZZWFyKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQueSA9ICtuWzBdICsgKCtuWzBdID4gNjggPyAxOTAwIDogMjAwMCksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2Vab25lKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IC9eKFopfChbKy1dXFxkXFxkKSg/Ojo/KFxcZFxcZCkpPy8uZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDYpKTtcbiAgcmV0dXJuIG4gPyAoZC5aID0gblsxXSA/IDAgOiAtKG5bMl0gKyAoblszXSB8fCBcIjAwXCIpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVF1YXJ0ZXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyAoZC5xID0gblswXSAqIDMgLSAzLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTW9udGhOdW1iZXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5tID0gblswXSAtIDEsIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VEYXlPZk1vbnRoKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuZCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF5T2ZZZWFyKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAzKSk7XG4gIHJldHVybiBuID8gKGQubSA9IDAsIGQuZCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlSG91cjI0KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuSCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTWludXRlcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLk0gPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVNlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5TID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNaWxsaXNlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDMpKTtcbiAgcmV0dXJuIG4gPyAoZC5MID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNaWNyb3NlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDYpKTtcbiAgcmV0dXJuIG4gPyAoZC5MID0gTWF0aC5mbG9vcihuWzBdIC8gMTAwMCksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VMaXRlcmFsUGVyY2VudChkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBwZXJjZW50UmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyBpICsgblswXS5sZW5ndGggOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VVbml4VGltZXN0YW1wKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgcmV0dXJuIG4gPyAoZC5RID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VVbml4VGltZXN0YW1wU2Vjb25kcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gIHJldHVybiBuID8gKGQucyA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERheU9mTW9udGgoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0RGF0ZSgpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0SG91cjI0KGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldEhvdXJzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRIb3VyMTIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0SG91cnMoKSAlIDEyIHx8IDEyLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF5T2ZZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZCgxICsgdGltZURheS5jb3VudCh0aW1lWWVhcihkKSwgZCksIHAsIDMpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaWxsaXNlY29uZHMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0TWlsbGlzZWNvbmRzKCksIHAsIDMpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaWNyb3NlY29uZHMoZCwgcCkge1xuICByZXR1cm4gZm9ybWF0TWlsbGlzZWNvbmRzKGQsIHApICsgXCIwMDBcIjtcbn1cblxuZnVuY3Rpb24gZm9ybWF0TW9udGhOdW1iZXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0TW9udGgoKSArIDEsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaW51dGVzKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldE1pbnV0ZXMoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFNlY29uZHMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0U2Vjb25kcygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla2RheU51bWJlck1vbmRheShkKSB7XG4gIHZhciBkYXkgPSBkLmdldERheSgpO1xuICByZXR1cm4gZGF5ID09PSAwID8gNyA6IGRheTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla051bWJlclN1bmRheShkLCBwKSB7XG4gIHJldHVybiBwYWQodGltZVN1bmRheS5jb3VudCh0aW1lWWVhcihkKSAtIDEsIGQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZElTTyhkKSB7XG4gIHZhciBkYXkgPSBkLmdldERheSgpO1xuICByZXR1cm4gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB0aW1lVGh1cnNkYXkoZCkgOiB0aW1lVGh1cnNkYXkuY2VpbChkKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla051bWJlcklTTyhkLCBwKSB7XG4gIGQgPSBkSVNPKGQpO1xuICByZXR1cm4gcGFkKHRpbWVUaHVyc2RheS5jb3VudCh0aW1lWWVhcihkKSwgZCkgKyAodGltZVllYXIoZCkuZ2V0RGF5KCkgPT09IDQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla2RheU51bWJlclN1bmRheShkKSB7XG4gIHJldHVybiBkLmdldERheSgpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrTnVtYmVyTW9uZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh0aW1lTW9uZGF5LmNvdW50KHRpbWVZZWFyKGQpIC0gMSwgZCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldEZ1bGxZZWFyKCkgJSAxMDAsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRZZWFySVNPKGQsIHApIHtcbiAgZCA9IGRJU08oZCk7XG4gIHJldHVybiBwYWQoZC5nZXRGdWxsWWVhcigpICUgMTAwLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RnVsbFllYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0RnVsbFllYXIoKSAlIDEwMDAwLCBwLCA0KTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RnVsbFllYXJJU08oZCwgcCkge1xuICB2YXIgZGF5ID0gZC5nZXREYXkoKTtcbiAgZCA9IChkYXkgPj0gNCB8fCBkYXkgPT09IDApID8gdGltZVRodXJzZGF5KGQpIDogdGltZVRodXJzZGF5LmNlaWwoZCk7XG4gIHJldHVybiBwYWQoZC5nZXRGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRab25lKGQpIHtcbiAgdmFyIHogPSBkLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIHJldHVybiAoeiA+IDAgPyBcIi1cIiA6ICh6ICo9IC0xLCBcIitcIikpXG4gICAgICArIHBhZCh6IC8gNjAgfCAwLCBcIjBcIiwgMilcbiAgICAgICsgcGFkKHogJSA2MCwgXCIwXCIsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENEYXlPZk1vbnRoKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0RhdGUoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0hvdXIyNChkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENIb3VycygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDSG91cjEyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0hvdXJzKCkgJSAxMiB8fCAxMiwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0RheU9mWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoMSArIHV0Y0RheS5jb3VudCh1dGNZZWFyKGQpLCBkKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pbGxpc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENNaWxsaXNlY29uZHMoKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pY3Jvc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBmb3JtYXRVVENNaWxsaXNlY29uZHMoZCwgcCkgKyBcIjAwMFwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENNb250aE51bWJlcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENNb250aCgpICsgMSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pbnV0ZXMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDTWludXRlcygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDU2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENTZWNvbmRzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyTW9uZGF5KGQpIHtcbiAgdmFyIGRvdyA9IGQuZ2V0VVRDRGF5KCk7XG4gIHJldHVybiBkb3cgPT09IDAgPyA3IDogZG93O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrTnVtYmVyU3VuZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh1dGNTdW5kYXkuY291bnQodXRjWWVhcihkKSAtIDEsIGQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gVVRDZElTTyhkKSB7XG4gIHZhciBkYXkgPSBkLmdldFVUQ0RheSgpO1xuICByZXR1cm4gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB1dGNUaHVyc2RheShkKSA6IHV0Y1RodXJzZGF5LmNlaWwoZCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtOdW1iZXJJU08oZCwgcCkge1xuICBkID0gVVRDZElTTyhkKTtcbiAgcmV0dXJuIHBhZCh1dGNUaHVyc2RheS5jb3VudCh1dGNZZWFyKGQpLCBkKSArICh1dGNZZWFyKGQpLmdldFVUQ0RheSgpID09PSA0KSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJTdW5kYXkoZCkge1xuICByZXR1cm4gZC5nZXRVVENEYXkoKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDV2Vla051bWJlck1vbmRheShkLCBwKSB7XG4gIHJldHVybiBwYWQodXRjTW9uZGF5LmNvdW50KHV0Y1llYXIoZCkgLSAxLCBkKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1llYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDRnVsbFllYXIoKSAlIDEwMCwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1llYXJJU08oZCwgcCkge1xuICBkID0gVVRDZElTTyhkKTtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0Z1bGxZZWFyKCkgJSAxMDAsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENGdWxsWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENGdWxsWWVhcklTTyhkLCBwKSB7XG4gIHZhciBkYXkgPSBkLmdldFVUQ0RheSgpO1xuICBkID0gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB1dGNUaHVyc2RheShkKSA6IHV0Y1RodXJzZGF5LmNlaWwoZCk7XG4gIHJldHVybiBwYWQoZC5nZXRVVENGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENab25lKCkge1xuICByZXR1cm4gXCIrMDAwMFwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRMaXRlcmFsUGVyY2VudCgpIHtcbiAgcmV0dXJuIFwiJVwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVbml4VGltZXN0YW1wKGQpIHtcbiAgcmV0dXJuICtkO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVbml4VGltZXN0YW1wU2Vjb25kcyhkKSB7XG4gIHJldHVybiBNYXRoLmZsb29yKCtkIC8gMTAwMCk7XG59XG4iLCJpbXBvcnQgZm9ybWF0TG9jYWxlIGZyb20gXCIuL2xvY2FsZS5qc1wiO1xuXG52YXIgbG9jYWxlO1xuZXhwb3J0IHZhciB0aW1lRm9ybWF0O1xuZXhwb3J0IHZhciB0aW1lUGFyc2U7XG5leHBvcnQgdmFyIHV0Y0Zvcm1hdDtcbmV4cG9ydCB2YXIgdXRjUGFyc2U7XG5cbmRlZmF1bHRMb2NhbGUoe1xuICBkYXRlVGltZTogXCIleCwgJVhcIixcbiAgZGF0ZTogXCIlLW0vJS1kLyVZXCIsXG4gIHRpbWU6IFwiJS1JOiVNOiVTICVwXCIsXG4gIHBlcmlvZHM6IFtcIkFNXCIsIFwiUE1cIl0sXG4gIGRheXM6IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdLFxuICBzaG9ydERheXM6IFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXSxcbiAgbW9udGhzOiBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXSxcbiAgc2hvcnRNb250aHM6IFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlZmF1bHRMb2NhbGUoZGVmaW5pdGlvbikge1xuICBsb2NhbGUgPSBmb3JtYXRMb2NhbGUoZGVmaW5pdGlvbik7XG4gIHRpbWVGb3JtYXQgPSBsb2NhbGUuZm9ybWF0O1xuICB0aW1lUGFyc2UgPSBsb2NhbGUucGFyc2U7XG4gIHV0Y0Zvcm1hdCA9IGxvY2FsZS51dGNGb3JtYXQ7XG4gIHV0Y1BhcnNlID0gbG9jYWxlLnV0Y1BhcnNlO1xuICByZXR1cm4gbG9jYWxlO1xufVxuIiwiaW1wb3J0IHt0aW1lWWVhciwgdGltZU1vbnRoLCB0aW1lV2VlaywgdGltZURheSwgdGltZUhvdXIsIHRpbWVNaW51dGUsIHRpbWVTZWNvbmQsIHRpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbH0gZnJvbSBcImQzLXRpbWVcIjtcbmltcG9ydCB7dGltZUZvcm1hdH0gZnJvbSBcImQzLXRpbWUtZm9ybWF0XCI7XG5pbXBvcnQgY29udGludW91cywge2NvcHl9IGZyb20gXCIuL2NvbnRpbnVvdXMuanNcIjtcbmltcG9ydCB7aW5pdFJhbmdlfSBmcm9tIFwiLi9pbml0LmpzXCI7XG5pbXBvcnQgbmljZSBmcm9tIFwiLi9uaWNlLmpzXCI7XG5cbmZ1bmN0aW9uIGRhdGUodCkge1xuICByZXR1cm4gbmV3IERhdGUodCk7XG59XG5cbmZ1bmN0aW9uIG51bWJlcih0KSB7XG4gIHJldHVybiB0IGluc3RhbmNlb2YgRGF0ZSA/ICt0IDogK25ldyBEYXRlKCt0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGVuZGFyKHRpY2tzLCB0aWNrSW50ZXJ2YWwsIHllYXIsIG1vbnRoLCB3ZWVrLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmb3JtYXQpIHtcbiAgdmFyIHNjYWxlID0gY29udGludW91cygpLFxuICAgICAgaW52ZXJ0ID0gc2NhbGUuaW52ZXJ0LFxuICAgICAgZG9tYWluID0gc2NhbGUuZG9tYWluO1xuXG4gIHZhciBmb3JtYXRNaWxsaXNlY29uZCA9IGZvcm1hdChcIi4lTFwiKSxcbiAgICAgIGZvcm1hdFNlY29uZCA9IGZvcm1hdChcIjolU1wiKSxcbiAgICAgIGZvcm1hdE1pbnV0ZSA9IGZvcm1hdChcIiVJOiVNXCIpLFxuICAgICAgZm9ybWF0SG91ciA9IGZvcm1hdChcIiVJICVwXCIpLFxuICAgICAgZm9ybWF0RGF5ID0gZm9ybWF0KFwiJWEgJWRcIiksXG4gICAgICBmb3JtYXRXZWVrID0gZm9ybWF0KFwiJWIgJWRcIiksXG4gICAgICBmb3JtYXRNb250aCA9IGZvcm1hdChcIiVCXCIpLFxuICAgICAgZm9ybWF0WWVhciA9IGZvcm1hdChcIiVZXCIpO1xuXG4gIGZ1bmN0aW9uIHRpY2tGb3JtYXQoZGF0ZSkge1xuICAgIHJldHVybiAoc2Vjb25kKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdE1pbGxpc2Vjb25kXG4gICAgICAgIDogbWludXRlKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdFNlY29uZFxuICAgICAgICA6IGhvdXIoZGF0ZSkgPCBkYXRlID8gZm9ybWF0TWludXRlXG4gICAgICAgIDogZGF5KGRhdGUpIDwgZGF0ZSA/IGZvcm1hdEhvdXJcbiAgICAgICAgOiBtb250aChkYXRlKSA8IGRhdGUgPyAod2VlayhkYXRlKSA8IGRhdGUgPyBmb3JtYXREYXkgOiBmb3JtYXRXZWVrKVxuICAgICAgICA6IHllYXIoZGF0ZSkgPCBkYXRlID8gZm9ybWF0TW9udGhcbiAgICAgICAgOiBmb3JtYXRZZWFyKShkYXRlKTtcbiAgfVxuXG4gIHNjYWxlLmludmVydCA9IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoaW52ZXJ0KHkpKTtcbiAgfTtcblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyBkb21haW4oQXJyYXkuZnJvbShfLCBudW1iZXIpKSA6IGRvbWFpbigpLm1hcChkYXRlKTtcbiAgfTtcblxuICBzY2FsZS50aWNrcyA9IGZ1bmN0aW9uKGludGVydmFsKSB7XG4gICAgdmFyIGQgPSBkb21haW4oKTtcbiAgICByZXR1cm4gdGlja3MoZFswXSwgZFtkLmxlbmd0aCAtIDFdLCBpbnRlcnZhbCA9PSBudWxsID8gMTAgOiBpbnRlcnZhbCk7XG4gIH07XG5cbiAgc2NhbGUudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKGNvdW50LCBzcGVjaWZpZXIpIHtcbiAgICByZXR1cm4gc3BlY2lmaWVyID09IG51bGwgPyB0aWNrRm9ybWF0IDogZm9ybWF0KHNwZWNpZmllcik7XG4gIH07XG5cbiAgc2NhbGUubmljZSA9IGZ1bmN0aW9uKGludGVydmFsKSB7XG4gICAgdmFyIGQgPSBkb21haW4oKTtcbiAgICBpZiAoIWludGVydmFsIHx8IHR5cGVvZiBpbnRlcnZhbC5yYW5nZSAhPT0gXCJmdW5jdGlvblwiKSBpbnRlcnZhbCA9IHRpY2tJbnRlcnZhbChkWzBdLCBkW2QubGVuZ3RoIC0gMV0sIGludGVydmFsID09IG51bGwgPyAxMCA6IGludGVydmFsKTtcbiAgICByZXR1cm4gaW50ZXJ2YWwgPyBkb21haW4obmljZShkLCBpbnRlcnZhbCkpIDogc2NhbGU7XG4gIH07XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb3B5KHNjYWxlLCBjYWxlbmRhcih0aWNrcywgdGlja0ludGVydmFsLCB5ZWFyLCBtb250aCwgd2VlaywgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZm9ybWF0KSk7XG4gIH07XG5cbiAgcmV0dXJuIHNjYWxlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aW1lKCkge1xuICByZXR1cm4gaW5pdFJhbmdlLmFwcGx5KGNhbGVuZGFyKHRpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbCwgdGltZVllYXIsIHRpbWVNb250aCwgdGltZVdlZWssIHRpbWVEYXksIHRpbWVIb3VyLCB0aW1lTWludXRlLCB0aW1lU2Vjb25kLCB0aW1lRm9ybWF0KS5kb21haW4oW25ldyBEYXRlKDIwMDAsIDAsIDEpLCBuZXcgRGF0ZSgyMDAwLCAwLCAyKV0pLCBhcmd1bWVudHMpO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIFRyYW5zZm9ybShrLCB4LCB5KSB7XG4gIHRoaXMuayA9IGs7XG4gIHRoaXMueCA9IHg7XG4gIHRoaXMueSA9IHk7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2Zvcm0sXG4gIHNjYWxlOiBmdW5jdGlvbihrKSB7XG4gICAgcmV0dXJuIGsgPT09IDEgPyB0aGlzIDogbmV3IFRyYW5zZm9ybSh0aGlzLmsgKiBrLCB0aGlzLngsIHRoaXMueSk7XG4gIH0sXG4gIHRyYW5zbGF0ZTogZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiB4ID09PSAwICYgeSA9PT0gMCA/IHRoaXMgOiBuZXcgVHJhbnNmb3JtKHRoaXMuaywgdGhpcy54ICsgdGhpcy5rICogeCwgdGhpcy55ICsgdGhpcy5rICogeSk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBbcG9pbnRbMF0gKiB0aGlzLmsgKyB0aGlzLngsIHBvaW50WzFdICogdGhpcy5rICsgdGhpcy55XTtcbiAgfSxcbiAgYXBwbHlYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHggKiB0aGlzLmsgKyB0aGlzLng7XG4gIH0sXG4gIGFwcGx5WTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB5ICogdGhpcy5rICsgdGhpcy55O1xuICB9LFxuICBpbnZlcnQ6IGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgcmV0dXJuIFsobG9jYXRpb25bMF0gLSB0aGlzLngpIC8gdGhpcy5rLCAobG9jYXRpb25bMV0gLSB0aGlzLnkpIC8gdGhpcy5rXTtcbiAgfSxcbiAgaW52ZXJ0WDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiAoeCAtIHRoaXMueCkgLyB0aGlzLms7XG4gIH0sXG4gIGludmVydFk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gKHkgLSB0aGlzLnkpIC8gdGhpcy5rO1xuICB9LFxuICByZXNjYWxlWDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4LmNvcHkoKS5kb21haW4oeC5yYW5nZSgpLm1hcCh0aGlzLmludmVydFgsIHRoaXMpLm1hcCh4LmludmVydCwgeCkpO1xuICB9LFxuICByZXNjYWxlWTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB5LmNvcHkoKS5kb21haW4oeS5yYW5nZSgpLm1hcCh0aGlzLmludmVydFksIHRoaXMpLm1hcCh5LmludmVydCwgeSkpO1xuICB9LFxuICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgdGhpcy54ICsgXCIsXCIgKyB0aGlzLnkgKyBcIikgc2NhbGUoXCIgKyB0aGlzLmsgKyBcIilcIjtcbiAgfVxufTtcblxuZXhwb3J0IHZhciBpZGVudGl0eSA9IG5ldyBUcmFuc2Zvcm0oMSwgMCwgMCk7XG5cbnRyYW5zZm9ybS5wcm90b3R5cGUgPSBUcmFuc2Zvcm0ucHJvdG90eXBlO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc2Zvcm0obm9kZSkge1xuICB3aGlsZSAoIW5vZGUuX196b29tKSBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkgcmV0dXJuIGlkZW50aXR5O1xuICByZXR1cm4gbm9kZS5fX3pvb207XG59XG4iLCJpbXBvcnQgeyBSZWFjdEVsZW1lbnQsIGNyZWF0ZUVsZW1lbnQsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQ2F0YWxvZ1JlbGVhc2VDaGFydENvbnRhaW5lclByb3BzIH0gZnJvbSBcIi4uL3R5cGluZ3MvQ2F0YWxvZ1JlbGVhc2VDaGFydFByb3BzXCI7XG5pbXBvcnQgeyBWYWx1ZVN0YXR1cyB9IGZyb20gXCJtZW5kaXhcIjtcbmltcG9ydCAqIGFzIGQzIGZyb20gXCJkM1wiO1xuXG4vLyBNYWluIHJlYWN0IGNvbXBvbmVudCBmb3IgdGhlIENhdGFsb2cgUmVsZWFzZSBDaGFydFxuLy8gUmVuZGVycyBkMyBjaGFydFxuXG5pbXBvcnQgXCIuL3VpL0NhdGFsb2dSZWxlYXNlQ2hhcnQuY3NzXCI7XG5cbmludGVyZmFjZSBJbmR1c3RyeURhdGEge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICByZXRpcmVkOiBEYXRlO1xuICAgIGN1cnJlbnQ6IERhdGU7XG4gICAgdXBjb21pbmc6IHN0cmluZztcbn1cblxuLy8gVGhlbWUgY29sb3JzXG5jb25zdCBsaWdodFRoZW1lID0ge1xuICAgIGJhY2tncm91bmQ6IFwiI2ZmZmZmZlwiLFxuICAgIHRleHQ6IFwiIzMzMzMzM1wiLFxuICAgIHByaW1hcnk6IFwiIzJjNTI4MlwiLFxuICAgIHNlY29uZGFyeTogXCIjNzU3NTc1XCIsXG4gICAgYWNjZW50OiBcIiNmZjk4MDBcIixcbiAgICBzdWNjZXNzOiBcIiM4YmMzNGFcIixcbiAgICBtdXRlZDogXCIjOWU5ZTllXCIsXG4gICAgYm9yZGVyOiBcIiNlMGUwZTBcIlxufTtcblxuY29uc3QgZGFya1RoZW1lID0ge1xuICAgIGJhY2tncm91bmQ6IFwiIzAxMDAyOFwiLFxuICAgIHRleHQ6IFwiI2ZmZmZmZlwiLFxuICAgIHByaW1hcnk6IFwiIzAwY2JkM1wiLFxuICAgIHNlY29uZGFyeTogXCIjOWI5Y2E0XCIsXG4gICAgYWNjZW50OiBcIiMwMGNiZDNcIixcbiAgICBzdWNjZXNzOiBcIiMwMGNiZDNcIixcbiAgICBtdXRlZDogXCIjOWI5Y2E0XCIsXG4gICAgYm9yZGVyOiBcIiMyMzIzM2JcIlxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIENhdGFsb2dSZWxlYXNlQ2hhcnQocHJvcHM6IENhdGFsb2dSZWxlYXNlQ2hhcnRDb250YWluZXJQcm9wcyk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3Qge1xuICAgICAgICBuYW1lLFxuICAgICAgICBjYXRhbG9nRGF0YSxcbiAgICAgICAgbmFtZUF0dHJpYnV0ZSxcbiAgICAgICAgcmV0aXJlZERhdGVBdHRyaWJ1dGUsXG4gICAgICAgIGN1cnJlbnREYXRlQXR0cmlidXRlLFxuICAgICAgICB1cGNvbWluZ0NvZGVBdHRyaWJ1dGUsXG4gICAgICAgIGNoYXJ0VGl0bGUsXG4gICAgICAgIGVuYWJsZUxlZ2VuZCxcbiAgICAgICAgb25JdGVtQ2xpY2ssXG4gICAgICAgIHJlZnJlc2hJbnRlcnZhbCxcbiAgICAgICAgY2hhcnRIZWlnaHQsXG4gICAgICAgIHNob3dUb2RheSxcbiAgICAgICAgdXNlRGFya01vZGVcbiAgICB9ID0gcHJvcHM7XG5cbiAgICBjb25zdCB0aGVtZSA9IHVzZURhcmtNb2RlID8gZGFya1RoZW1lIDogbGlnaHRUaGVtZTtcblxuICAgIGNvbnN0IGNoYXJ0UmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKTtcbiAgICAvLyBQb2ludHMgdG8gdGhlIGRpdiB3aGVyZSB0aGUgRDMuanMgY2hhcnQgd2lsbCBiZSByZW5kZXJlZC4gXG4gICAgLy8gRDMgbmVlZHMgZGlyZWN0IERPTSBhY2Nlc3MgdG8gY3JlYXRlIFNWRyBlbGVtZW50cywgc28gdGhpcyByZWYgXG4gICAgLy8gcHJvdmlkZXMgYSBzdGFibGUgcmVmZXJlbmNlIHRvIHRoZSBjaGFydCBjb250YWluZXIuXG5cblxuICAgIGNvbnN0IGNvbnRhaW5lclJlZiA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbCk7IC8vIFJlZnMgZG9uJ3QgdHJpZ2dlciByZS1yZW5kZXJzIHdoZW4gY2hhbmdlZFxuICAgIC8vIFBvaW50cyB0byB0aGUgb3V0ZXIgY29udGFpbmVyIGRpdi4gVXNlZCB0byBtZWFzdXJlIHRoZSB3aWRnZXQncyBcbiAgICAvLyBhdmFpbGFibGUgd2lkdGggZm9yIHJlc3BvbnNpdmUgc2l6aW5nLlxuXG4gICAgY29uc3QgW2RpbWVuc2lvbnMsIHNldERpbWVuc2lvbnNdID0gdXNlU3RhdGUoeyB3aWR0aDogMCwgaGVpZ2h0OiBjaGFydEhlaWdodCB9KTtcbiAgICAvLyBTdGF0ZSB0byBob2xkIHRoZSBkaW1lbnNpb25zIG9mIHRoZSBjaGFydCwgc3R1ZmYgaXMgY2FsY3VsYXRlZCBkeW5hbWljYWxseVxuICAgIC8vIHNvIHdpZHRoIGlzIGp1c3QgYSBwbGFjZWhvbGRlciB1bnRpbCB0aGUgZmlyc3QgcmVzaXplLlxuXG4gICAgY29uc3QgW2luZHVzdHJpZXMsIHNldEluZHVzdHJpZXNdID0gdXNlU3RhdGU8SW5kdXN0cnlEYXRhW10+KFtdKTtcbiAgICAvLyBTdGF0ZSB0byBob2xkIHRoZSBwcm9jZXNzZWQgaW5kdXN0cnkgZGF0YSBmcm9tIHRoZSBNZW5kaXggZGF0YSBzb3VyY2UuXG5cbiAgICAvLyBIYW5kbGUgcmVzaXplXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgaGFuZGxlUmVzaXplID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5lclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyB3aWR0aCB9ID0gY29udGFpbmVyUmVmLmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgc2V0RGltZW5zaW9ucyh7XG4gICAgICAgICAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0OiBjaGFydEhlaWdodFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIGhhbmRsZVJlc2l6ZSgpO1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHJlc2l6ZU9ic2VydmVyID0gbmV3IFJlc2l6ZU9ic2VydmVyKGhhbmRsZVJlc2l6ZSk7XG4gICAgICAgIGlmIChjb250YWluZXJSZWYuY3VycmVudCkge1xuICAgICAgICAgICAgcmVzaXplT2JzZXJ2ZXIub2JzZXJ2ZShjb250YWluZXJSZWYuY3VycmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgd2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSk7XG4gICAgICAgICAgICByZXNpemVPYnNlcnZlci5kaXNjb25uZWN0KCk7XG4gICAgICAgIH07XG4gICAgfSwgW2NoYXJ0SGVpZ2h0XSk7XG5cbiAgICAvLyBQcm9jZXNzIGRhdGEgZnJvbSBNZW5kaXggZGF0YSBzb3VyY2VcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAoY2F0YWxvZ0RhdGEgJiYgY2F0YWxvZ0RhdGEuc3RhdHVzID09PSBWYWx1ZVN0YXR1cy5BdmFpbGFibGUgJiYgY2F0YWxvZ0RhdGEuaXRlbXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHByb2Nlc3NlZEluZHVzdHJpZXM6IEluZHVzdHJ5RGF0YVtdID0gY2F0YWxvZ0RhdGEuaXRlbXNcbiAgICAgICAgICAgICAgICAubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IG5hbWVBdHRyaWJ1dGUuZ2V0KGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmV0aXJlZERhdGUgPSByZXRpcmVkRGF0ZUF0dHJpYnV0ZS5nZXQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50RGF0ZSA9IGN1cnJlbnREYXRlQXR0cmlidXRlLmdldChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHVwY29taW5nQ29kZSA9IHVwY29taW5nQ29kZUF0dHJpYnV0ZS5nZXQoaXRlbSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIFZhbGlkYXRlIHRoYXQgYWxsIHJlcXVpcmVkIGRhdGEgaXMgYXZhaWxhYmxlXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAobmFtZS5zdGF0dXMgIT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldGlyZWREYXRlLnN0YXR1cyAhPT0gVmFsdWVTdGF0dXMuQXZhaWxhYmxlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudERhdGUuc3RhdHVzICE9PSBWYWx1ZVN0YXR1cy5BdmFpbGFibGUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGNvbWluZ0NvZGUuc3RhdHVzICE9PSBWYWx1ZVN0YXR1cy5BdmFpbGFibGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBuYW1lLnZhbHVlIHx8IFwiXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0aXJlZDogcmV0aXJlZERhdGUudmFsdWUgfHwgbmV3IERhdGUoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50OiBjdXJyZW50RGF0ZS52YWx1ZSB8fCBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwY29taW5nOiB1cGNvbWluZ0NvZGUudmFsdWUgfHwgXCJUQkRcIlxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJFcnJvciBwcm9jZXNzaW5nIGNhdGFsb2cgZGF0YSBpdGVtOlwiLCBlcnJvcik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmZpbHRlcigoaXRlbSk6IGl0ZW0gaXMgSW5kdXN0cnlEYXRhID0+IGl0ZW0gIT09IG51bGwpXG4gICAgICAgICAgICAgICAgLnNvcnQoKGEsIGIpID0+IGEubmFtZS5sb2NhbGVDb21wYXJlKGIubmFtZSkpOyAvLyBTb3J0IGFscGhhYmV0aWNhbGx5IGJ5IG5hbWVcblxuICAgICAgICAgICAgc2V0SW5kdXN0cmllcyhwcm9jZXNzZWRJbmR1c3RyaWVzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldEluZHVzdHJpZXMoW10pO1xuICAgICAgICB9XG4gICAgfSwgW2NhdGFsb2dEYXRhLCBuYW1lQXR0cmlidXRlLCByZXRpcmVkRGF0ZUF0dHJpYnV0ZSwgY3VycmVudERhdGVBdHRyaWJ1dGUsIHVwY29taW5nQ29kZUF0dHJpYnV0ZV0pO1xuXG4gICAgLy8gQXV0by1yZWZyZXNoIGZ1bmN0aW9uYWxpdHlcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBpZiAocmVmcmVzaEludGVydmFsID4gMCkge1xuICAgICAgICAgICAgY29uc3QgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNhdGFsb2dEYXRhICYmIGNhdGFsb2dEYXRhLnJlbG9hZCkge1xuICAgICAgICAgICAgICAgICAgICBjYXRhbG9nRGF0YS5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCByZWZyZXNoSW50ZXJ2YWwgKiAxMDAwKTtcblxuICAgICAgICAgICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwoaW50ZXJ2YWwpO1xuICAgICAgICB9XG4gICAgfSwgW3JlZnJlc2hJbnRlcnZhbCwgY2F0YWxvZ0RhdGFdKTtcblxuICAgIC8vIFJlbmRlciBjaGFydFxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICghY2hhcnRSZWYuY3VycmVudCB8fCBkaW1lbnNpb25zLndpZHRoID09PSAwIHx8IGluZHVzdHJpZXMubGVuZ3RoID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIGNoYXJ0XG4gICAgICAgIGQzLnNlbGVjdChjaGFydFJlZi5jdXJyZW50KS5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuXG4gICAgICAgIC8vIFJlc3BvbnNpdmUgbWFyZ2lucyBiYXNlZCBvbiBjb250YWluZXIgd2lkdGhcbiAgICAgICAgY29uc3QgbWFyZ2luID0ge1xuICAgICAgICAgICAgdG9wOiA4MCxcbiAgICAgICAgICAgIHJpZ2h0OiBkaW1lbnNpb25zLndpZHRoIDwgODAwID8gMTAwIDogMTUwLFxuICAgICAgICAgICAgYm90dG9tOiA0MCxcbiAgICAgICAgICAgIGxlZnQ6IGRpbWVuc2lvbnMud2lkdGggPCA4MDAgPyAxMjAgOiAxODBcbiAgICAgICAgfTtcbiAgICAgICAgXG4gICAgICAgIGNvbnN0IHdpZHRoID0gZGltZW5zaW9ucy53aWR0aCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xuICAgICAgICBjb25zdCBoZWlnaHQgPSBkaW1lbnNpb25zLmhlaWdodCAtIG1hcmdpbi50b3AgLSBtYXJnaW4uYm90dG9tO1xuXG4gICAgICAgIC8vIENyZWF0ZSBTVkcgd2l0aCB2aWV3Qm94IGZvciBiZXR0ZXIgc2NhbGluZ1xuICAgICAgICBjb25zdCBzdmcgPSBkMy5zZWxlY3QoY2hhcnRSZWYuY3VycmVudClcbiAgICAgICAgICAgIC5hcHBlbmQoXCJzdmdcIilcbiAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgZGltZW5zaW9ucy53aWR0aClcbiAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIGRpbWVuc2lvbnMuaGVpZ2h0KVxuICAgICAgICAgICAgLmF0dHIoXCJ2aWV3Qm94XCIsIGAwIDAgJHtkaW1lbnNpb25zLndpZHRofSAke2RpbWVuc2lvbnMuaGVpZ2h0fWApXG4gICAgICAgICAgICAuYXR0cihcInByZXNlcnZlQXNwZWN0UmF0aW9cIiwgXCJ4TWlkWU1pZCBtZWV0XCIpXG4gICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke21hcmdpbi5sZWZ0fSwke21hcmdpbi50b3B9KWApO1xuXG4gICAgICAgIC8vIFRpbWUgc2NhbGVcbiAgICAgICAgY29uc3QgdGltZVNjYWxlID0gZDMuc2NhbGVUaW1lKClcbiAgICAgICAgICAgIC5kb21haW4oW25ldyBEYXRlKDIwMjIsIDcsIDEpLCBuZXcgRGF0ZSgyMDI1LCAxMSwgMzEpXSlcbiAgICAgICAgICAgIC5yYW5nZShbMCwgd2lkdGhdKTtcblxuICAgICAgICAvLyBZIHNjYWxlIGZvciBpbmR1c3RyaWVzXG4gICAgICAgIGNvbnN0IHlTY2FsZSA9IGQzLnNjYWxlQmFuZCgpXG4gICAgICAgICAgICAuZG9tYWluKGluZHVzdHJpZXMubWFwKGQgPT4gZC5uYW1lKSlcbiAgICAgICAgICAgIC5yYW5nZShbMCwgaGVpZ2h0XSlcbiAgICAgICAgICAgIC5wYWRkaW5nKDAuMyk7XG5cbiAgICAgICAgLy8gQWRkIHRpbWVsaW5lIGRhdGVzXG4gICAgICAgIGNvbnN0IHRpbWVsaW5lRGF0ZXMgPSBbXG4gICAgICAgICAgICBuZXcgRGF0ZSgyMDIyLCA3LCAxKSxcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjMsIDIsIDEpLFxuICAgICAgICAgICAgbmV3IERhdGUoMjAyMywgOSwgMSksXG4gICAgICAgICAgICBuZXcgRGF0ZSgyMDI0LCAzLCAxKSxcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjQsIDEwLCAxKSxcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjUsIDQsIDEpLFxuICAgICAgICAgICAgbmV3IERhdGUoMjAyNSwgMTEsIDEpXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gRHJhdyBtYWluIHRpbWVsaW5lXG4gICAgICAgIHN2Zy5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidGltZWxpbmUtbGluZVwiKVxuICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCAwKVxuICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCAtNDApXG4gICAgICAgICAgICAuYXR0cihcIngyXCIsIHdpZHRoKVxuICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCAtNDApO1xuXG4gICAgICAgIC8vIEFkZCB0aW1lbGluZSBtYXJrZXJzIGFuZCBsYWJlbHNcbiAgICAgICAgdGltZWxpbmVEYXRlcy5mb3JFYWNoKGRhdGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgeCA9IHRpbWVTY2FsZShkYXRlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImNpcmNsZVwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY3hcIiwgeClcbiAgICAgICAgICAgICAgICAuYXR0cihcImN5XCIsIC00MClcbiAgICAgICAgICAgICAgICAuYXR0cihcInJcIiwgNClcbiAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgdGhlbWUucHJpbWFyeSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImRhdGUtdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCB4KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCAtNTApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcIm1pZGRsZVwiKVxuICAgICAgICAgICAgICAgIC50ZXh0KGQzLnRpbWVGb3JtYXQoXCIlYi0leVwiKShkYXRlKSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEFkZCB0b2RheSdzIGRhdGUgKGlmIGVuYWJsZWQpXG4gICAgICAgIGlmIChzaG93VG9kYXkpIHtcbiAgICAgICAgICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICAgICAgICAgIGNvbnN0IHRvZGF5WCA9IHRpbWVTY2FsZSh0b2RheSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRvZGF5J3MgdmVydGljYWwgbGluZVxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidG9kYXktbGluZVwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgdG9kYXlYKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgLTQwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgdG9kYXlYKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgaGVpZ2h0KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVG9kYXkncyBjaXJjbGVcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJjaXJjbGVcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidG9kYXktY2lyY2xlXCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjeFwiLCB0b2RheVgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjeVwiLCAtNDApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJyXCIsIDgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUb2RheSdzIGRhdGUgbGFiZWxcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRvZGF5LXRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgdG9kYXlYKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCAtNjUpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcIm1pZGRsZVwiKVxuICAgICAgICAgICAgICAgIC50ZXh0KGQzLnRpbWVGb3JtYXQoXCIlLW0vJS1kLyVZXCIpKHRvZGF5KSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGp1c3QgZm9udCBzaXplcyBmb3Igc21hbGxlciBzY3JlZW5zXG4gICAgICAgIGNvbnN0IGZvbnRTaXplID0gZGltZW5zaW9ucy53aWR0aCA8IDgwMCA/IFwiMTJweFwiIDogXCIxNHB4XCI7XG5cbiAgICAgICAgLy8gRHJhdyBpbmR1c3RyeSByb3dzXG4gICAgICAgIGluZHVzdHJpZXMuZm9yRWFjaCgoaW5kdXN0cnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHkgPSB5U2NhbGUoaW5kdXN0cnkubmFtZSkhICsgeVNjYWxlLmJhbmR3aWR0aCgpIC8gMjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSW5kdXN0cnkgbmFtZVxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiaW5kdXN0cnktdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCAtMTApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgKyA1KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJlbmRcIilcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJmb250LXNpemVcIiwgZm9udFNpemUpXG4gICAgICAgICAgICAgICAgLnRleHQoaW5kdXN0cnkubmFtZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEluZHVzdHJ5IGxpbmVcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImluZHVzdHJ5LWxpbmVcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcIngxXCIsIDApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCB5KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgd2lkdGgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCB5KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gQ29udGludWl0eSBsaW5lIGJldHdlZW4gcmV0aXJlZCBhbmQgY3VycmVudFxuICAgICAgICAgICAgaWYgKGluZHVzdHJ5LnJldGlyZWQgJiYgaW5kdXN0cnkuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldGlyZWRYID0gdGltZVNjYWxlKGluZHVzdHJ5LnJldGlyZWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRYID0gdGltZVNjYWxlKGluZHVzdHJ5LmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJjb250aW51aXR5LWxpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCByZXRpcmVkWClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCB5KVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIngyXCIsIGN1cnJlbnRYKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInkyXCIsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBGdXR1cmUgY29udGludWl0eSBsaW5lIGZyb20gY3VycmVudCB0byB1cGNvbWluZ1xuICAgICAgICAgICAgbGV0IHVwY29taW5nWFBvcyA9IHdpZHRoICsgMjA7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmIChpbmR1c3RyeS51cGNvbWluZyAhPT0gXCJUQkRcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHllYXIgPSBwYXJzZUludChcIjIwXCIgKyBpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMCwgMikpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vbnRoID0gcGFyc2VJbnQoaW5kdXN0cnkudXBjb21pbmcuc3Vic3RyaW5nKDIsIDQpKSAtIDE7XG4gICAgICAgICAgICAgICAgY29uc3QgdXBjb21pbmdEYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh1cGNvbWluZ0RhdGUgPD0gdGltZVNjYWxlLmRvbWFpbigpWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgIHVwY29taW5nWFBvcyA9IHRpbWVTY2FsZSh1cGNvbWluZ0RhdGUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHVwY29taW5nWFBvcyA9IHdpZHRoO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdXBjb21pbmdYUG9zID0gd2lkdGggKyAyMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGluZHVzdHJ5LmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50WCA9IHRpbWVTY2FsZShpbmR1c3RyeS5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICBsZXQgbGluZUVuZFggPSB1cGNvbWluZ1hQb3M7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKGluZHVzdHJ5LnVwY29taW5nID09PSBcIlRCRFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVFbmRYID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBjb21pbmdEYXRlID0gbmV3IERhdGUocGFyc2VJbnQoXCIyMFwiICsgaW5kdXN0cnkudXBjb21pbmcuc3Vic3RyaW5nKDAsMikpLCBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGluZHVzdHJ5LnVwY29taW5nLnN1YnN0cmluZygyLDQpKS0xLDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAodXBjb21pbmdEYXRlID4gdGltZVNjYWxlLmRvbWFpbigpWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lRW5kWCA9IHdpZHRoO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGluZUVuZFggPSB0aW1lU2NhbGUodXBjb21pbmdEYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJmdXR1cmUtY29udGludWl0eS1saW5lXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgY3VycmVudFgpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgeSlcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCBsaW5lRW5kWClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gUmV0aXJlZCBtYXJrZXIgKGRpYW1vbmQpXG4gICAgICAgICAgICBpZiAoaW5kdXN0cnkucmV0aXJlZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldGlyZWRYID0gdGltZVNjYWxlKGluZHVzdHJ5LnJldGlyZWQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJldGlyZWRNYXJrZXIgPSBzdmcuYXBwZW5kKFwiY2lyY2xlXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJyZXRpcmVkLW1hcmtlclwiKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImN4XCIsIHJldGlyZWRYKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImN5XCIsIHkpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiclwiLCA4KVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgdGhlbWUucHJpbWFyeSlcbiAgICAgICAgICAgICAgICAgICAgLnN0eWxlKFwiY3Vyc29yXCIsIG9uSXRlbUNsaWNrID8gXCJwb2ludGVyXCIgOiBcImRlZmF1bHRcIik7XG5cbiAgICAgICAgICAgICAgICBpZiAob25JdGVtQ2xpY2spIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0aXJlZE1hcmtlci5vbihcImNsaWNrXCIsICgpID0+IG9uSXRlbUNsaWNrLmV4ZWN1dGUoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDdXJyZW50IG1hcmtlciAoZGlhbW9uZClcbiAgICAgICAgICAgIGlmIChpbmR1c3RyeS5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFggPSB0aW1lU2NhbGUoaW5kdXN0cnkuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudE1hcmtlciA9IHN2Zy5hcHBlbmQoXCJjaXJjbGVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImN1cnJlbnQtbWFya2VyXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY3hcIiwgY3VycmVudFgpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY3lcIiwgeSlcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyXCIsIDgpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCB0aGVtZS5wcmltYXJ5KVxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoXCJjdXJzb3JcIiwgb25JdGVtQ2xpY2sgPyBcInBvaW50ZXJcIiA6IFwiZGVmYXVsdFwiKTtcblxuICAgICAgICAgICAgICAgIGlmIChvbkl0ZW1DbGljaykge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50TWFya2VyLm9uKFwiY2xpY2tcIiwgKCkgPT4gb25JdGVtQ2xpY2suZXhlY3V0ZSgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFVwY29taW5nIGJveCAtIGFkanVzdGVkIHBvc2l0aW9uaW5nXG4gICAgICAgICAgICBsZXQgYm94WCA9IHVwY29taW5nWFBvcztcbiAgICAgICAgICAgIGlmIChpbmR1c3RyeS51cGNvbWluZyAhPT0gXCJUQkRcIikge1xuICAgICAgICAgICAgICAgIGNvbnN0IHllYXIgPSBwYXJzZUludChcIjIwXCIgKyBpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMCwgMikpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG1vbnRoID0gcGFyc2VJbnQoaW5kdXN0cnkudXBjb21pbmcuc3Vic3RyaW5nKDIsIDQpKSAtIDE7XG4gICAgICAgICAgICAgICAgY29uc3QgdXBjb21pbmdEYXRlID0gbmV3IERhdGUoeWVhciwgbW9udGgsIDEpO1xuICAgICAgICAgICAgICAgIGlmICh1cGNvbWluZ0RhdGUgPD0gdGltZVNjYWxlLmRvbWFpbigpWzFdKSB7XG4gICAgICAgICAgICAgICAgICAgIGJveFggPSB0aW1lU2NhbGUodXBjb21pbmdEYXRlKSAtIDMwO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGJveFggPSB3aWR0aCAtIDcwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYm94WCA9IHdpZHRoIC0gNzA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHVwY29taW5nQm94ID0gc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidXBjb21pbmctYm94XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIGJveFgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgLSAxNSlcbiAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDYwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDMwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwicnhcIiwgNClcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJjdXJzb3JcIiwgb25JdGVtQ2xpY2sgPyBcInBvaW50ZXJcIiA6IFwiZGVmYXVsdFwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKG9uSXRlbUNsaWNrKSB7XG4gICAgICAgICAgICAgICAgdXBjb21pbmdCb3gub24oXCJjbGlja1wiLCAoKSA9PiBvbkl0ZW1DbGljay5leGVjdXRlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdmcuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ1cGNvbWluZy10ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIGJveFggKyAzMClcbiAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgeSArIDUpXG4gICAgICAgICAgICAgICAgLnN0eWxlKFwiZm9udC1zaXplXCIsIGZvbnRTaXplKVxuICAgICAgICAgICAgICAgIC50ZXh0KGluZHVzdHJ5LnVwY29taW5nKTtcbiAgICAgICAgfSk7XG4gICAgfSwgW2RpbWVuc2lvbnMsIGluZHVzdHJpZXMsIHNob3dUb2RheSwgb25JdGVtQ2xpY2ssIHRoZW1lXSk7XG5cbiAgICAvLyBMb2FkaW5nIHN0YXRlXG4gICAgaWYgKCFjYXRhbG9nRGF0YSB8fCBjYXRhbG9nRGF0YS5zdGF0dXMgPT09IFZhbHVlU3RhdHVzLkxvYWRpbmcpIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgY2F0YWxvZy1yZWxlYXNlLWNoYXJ0ICR7bmFtZX1gfSByZWY9e2NvbnRhaW5lclJlZn0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjaGFydC1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cImNoYXJ0LXRpdGxlXCI+e2NoYXJ0VGl0bGV9PC9oMT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsb2FkaW5nLW1lc3NhZ2VcIj5Mb2FkaW5nIGNhdGFsb2cgZGF0YS4uLjwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gRXJyb3Igc3RhdGVcbiAgICBpZiAoY2F0YWxvZ0RhdGEuc3RhdHVzID09PSBWYWx1ZVN0YXR1cy5VbmF2YWlsYWJsZSkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BjYXRhbG9nLXJlbGVhc2UtY2hhcnQgJHtuYW1lfWB9IHJlZj17Y29udGFpbmVyUmVmfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNoYXJ0LWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwiY2hhcnQtdGl0bGVcIj57Y2hhcnRUaXRsZX08L2gxPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImVycm9yLW1lc3NhZ2VcIj5VbmFibGUgdG8gbG9hZCBjYXRhbG9nIGRhdGEuIFBsZWFzZSBjaGVjayB5b3VyIGRhdGEgc291cmNlIGNvbmZpZ3VyYXRpb24uPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBObyBkYXRhIHN0YXRlXG4gICAgaWYgKCFjYXRhbG9nRGF0YS5pdGVtcyB8fCBjYXRhbG9nRGF0YS5pdGVtcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgY2F0YWxvZy1yZWxlYXNlLWNoYXJ0ICR7bmFtZX1gfSByZWY9e2NvbnRhaW5lclJlZn0+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjaGFydC1jb250YWluZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cImNoYXJ0LXRpdGxlXCI+e2NoYXJ0VGl0bGV9PC9oMT5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJuby1kYXRhLW1lc3NhZ2VcIj5ObyBjYXRhbG9nIGRhdGEgYXZhaWxhYmxlLiBQbGVhc2UgYWRkIGNhdGFsb2cgcmVsZWFzZSBzY2hlZHVsZXMgdG8gc2VlIHRoZSBjaGFydC48L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2F0YWxvZy1yZWxlYXNlLWNoYXJ0XCIgZGF0YS10aGVtZT17dXNlRGFya01vZGUgPyBcImRhcmtcIiA6IFwibGlnaHRcIn0+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNoYXJ0LWNvbnRhaW5lclwiIHJlZj17Y29udGFpbmVyUmVmfT5cbiAgICAgICAgICAgICAgICB7Y2hhcnRUaXRsZSAmJiA8aDEgY2xhc3NOYW1lPVwiY2hhcnQtdGl0bGVcIj57Y2hhcnRUaXRsZX08L2gxPn1cbiAgICAgICAgICAgICAgICB7ZW5hYmxlTGVnZW5kICYmIChcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsZWdlbmRcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGVnZW5kLWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cImxlZ2VuZC1zeW1ib2xcIiB3aWR0aD1cIjIwXCIgaGVpZ2h0PVwiMjBcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxjaXJjbGUgY3g9XCIxMFwiIGN5PVwiMTBcIiByPVwiOFwiIGNsYXNzTmFtZT1cInJldGlyZWQtbWFya2VyXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5SZXRpcmVkPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxlZ2VuZC1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJsZWdlbmQtc3ltYm9sXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCAyMCAyMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiMTBcIiBjeT1cIjEwXCIgcj1cIjhcIiBjbGFzc05hbWU9XCJjdXJyZW50LW1hcmtlclwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+Q3VycmVudDwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsZWdlbmQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwibGVnZW5kLXN5bWJvbFwiIHdpZHRoPVwiMzJcIiBoZWlnaHQ9XCIyMFwiIHZpZXdCb3g9XCIwIDAgMzIgMjBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgeD1cIjJcIiB5PVwiMlwiIHdpZHRoPVwiMjhcIiBoZWlnaHQ9XCIxNlwiIHJ4PVwiNFwiIGNsYXNzTmFtZT1cInVwY29taW5nLWJveFwiIC8+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+VXBjb21pbmc8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIHtzaG93VG9kYXkgJiYgKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGVnZW5kLWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJsZWdlbmQtc3ltYm9sXCIgd2lkdGg9XCIyMFwiIGhlaWdodD1cIjIwXCIgdmlld0JveD1cIjAgMCAyMCAyMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjEwXCIgY3k9XCIxMFwiIHI9XCI4XCIgY2xhc3NOYW1lPVwidG9kYXktY2lyY2xlXCIgLz5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlRvZGF5PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgKX1cbiAgICAgICAgICAgICAgICA8ZGl2IGlkPVwiY2hhcnRcIiByZWY9e2NoYXJ0UmVmfT48L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICA8L2Rpdj5cbiAgICApO1xufSJdLCJuYW1lcyI6WyJhc2NlbmRpbmciLCJhIiwiYiIsIk5hTiIsImRlc2NlbmRpbmciLCJiaXNlY3RvciIsImYiLCJjb21wYXJlMSIsImNvbXBhcmUyIiwiZGVsdGEiLCJsZW5ndGgiLCJkIiwieCIsInplcm8iLCJsZWZ0IiwibG8iLCJoaSIsIm1pZCIsInJpZ2h0IiwiY2VudGVyIiwiaSIsIm51bWJlciIsImFzY2VuZGluZ0Jpc2VjdCIsImJpc2VjdFJpZ2h0IiwiSW50ZXJuTWFwIiwiTWFwIiwiY29uc3RydWN0b3IiLCJlbnRyaWVzIiwia2V5Iiwia2V5b2YiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0aWVzIiwiX2ludGVybiIsInZhbHVlIiwiX2tleSIsInNldCIsImdldCIsImludGVybl9nZXQiLCJoYXMiLCJpbnRlcm5fc2V0IiwiZGVsZXRlIiwiaW50ZXJuX2RlbGV0ZSIsInZhbHVlT2YiLCJlMTAiLCJNYXRoIiwic3FydCIsImU1IiwiZTIiLCJ0aWNrU3BlYyIsInN0YXJ0Iiwic3RvcCIsImNvdW50Iiwic3RlcCIsIm1heCIsInBvd2VyIiwiZmxvb3IiLCJsb2cxMCIsImVycm9yIiwicG93IiwiZmFjdG9yIiwiaTEiLCJpMiIsImluYyIsInJvdW5kIiwidGlja0luY3JlbWVudCIsInRpY2tTdGVwIiwicmV2ZXJzZSIsInJhbmdlIiwibiIsImFyZ3VtZW50cyIsImNlaWwiLCJBcnJheSIsIm5vb3AiLCJkaXNwYXRjaCIsIl8iLCJ0IiwidGVzdCIsIkVycm9yIiwiRGlzcGF0Y2giLCJwYXJzZVR5cGVuYW1lcyIsInR5cGVuYW1lcyIsInR5cGVzIiwidHJpbSIsInNwbGl0IiwibWFwIiwibmFtZSIsImluZGV4T2YiLCJzbGljZSIsImhhc093blByb3BlcnR5IiwidHlwZSIsInByb3RvdHlwZSIsIm9uIiwidHlwZW5hbWUiLCJjYWxsYmFjayIsIlQiLCJjb3B5IiwiY2FsbCIsInRoYXQiLCJhcmdzIiwiYXBwbHkiLCJjIiwiY29uY2F0IiwicHVzaCIsInhodG1sIiwic3ZnIiwieGxpbmsiLCJ4bWwiLCJ4bWxucyIsInByZWZpeCIsIm5hbWVzcGFjZXMiLCJzcGFjZSIsImxvY2FsIiwiY3JlYXRvckluaGVyaXQiLCJkb2N1bWVudCIsIm93bmVyRG9jdW1lbnQiLCJ1cmkiLCJuYW1lc3BhY2VVUkkiLCJkb2N1bWVudEVsZW1lbnQiLCJjcmVhdGVFbGVtZW50IiwiY3JlYXRlRWxlbWVudE5TIiwiY3JlYXRvckZpeGVkIiwiZnVsbG5hbWUiLCJuYW1lc3BhY2UiLCJub25lIiwic2VsZWN0b3IiLCJxdWVyeVNlbGVjdG9yIiwic2VsZWN0IiwiZ3JvdXBzIiwiX2dyb3VwcyIsIm0iLCJzdWJncm91cHMiLCJqIiwiZ3JvdXAiLCJzdWJncm91cCIsIm5vZGUiLCJzdWJub2RlIiwiX19kYXRhX18iLCJTZWxlY3Rpb24iLCJfcGFyZW50cyIsImFycmF5IiwiaXNBcnJheSIsImZyb20iLCJlbXB0eSIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJhcnJheUFsbCIsInNlbGVjdG9yQWxsIiwicGFyZW50cyIsIm1hdGNoZXMiLCJjaGlsZE1hdGNoZXIiLCJmaW5kIiwiY2hpbGRGaW5kIiwibWF0Y2giLCJjaGlsZHJlbiIsImNoaWxkRmlyc3QiLCJmaXJzdEVsZW1lbnRDaGlsZCIsImZpbHRlciIsImNoaWxkcmVuRmlsdGVyIiwic2VsZWN0QWxsIiwibWF0Y2hlciIsInVwZGF0ZSIsIl9lbnRlciIsInNwYXJzZSIsIkVudGVyTm9kZSIsInBhcmVudCIsImRhdHVtIiwiX25leHQiLCJfcGFyZW50IiwiYXBwZW5kQ2hpbGQiLCJjaGlsZCIsImluc2VydEJlZm9yZSIsIm5leHQiLCJiaW5kSW5kZXgiLCJlbnRlciIsImV4aXQiLCJkYXRhIiwiZ3JvdXBMZW5ndGgiLCJkYXRhTGVuZ3RoIiwiYmluZEtleSIsIm5vZGVCeUtleVZhbHVlIiwia2V5VmFsdWVzIiwia2V5VmFsdWUiLCJiaW5kIiwiY29uc3RhbnQiLCJhcnJheWxpa2UiLCJlbnRlckdyb3VwIiwidXBkYXRlR3JvdXAiLCJleGl0R3JvdXAiLCJpMCIsInByZXZpb3VzIiwiX2V4aXQiLCJvbmVudGVyIiwib251cGRhdGUiLCJvbmV4aXQiLCJzZWxlY3Rpb24iLCJhcHBlbmQiLCJyZW1vdmUiLCJtZXJnZSIsIm9yZGVyIiwiY29udGV4dCIsImdyb3VwczAiLCJncm91cHMxIiwibTAiLCJtMSIsIm1pbiIsIm1lcmdlcyIsImdyb3VwMCIsImdyb3VwMSIsImNvbXBhcmVEb2N1bWVudFBvc2l0aW9uIiwicGFyZW50Tm9kZSIsImNvbXBhcmUiLCJjb21wYXJlTm9kZSIsInNvcnRncm91cHMiLCJzb3J0Z3JvdXAiLCJzb3J0Iiwic2l6ZSIsImF0dHJSZW1vdmUiLCJyZW1vdmVBdHRyaWJ1dGUiLCJhdHRyUmVtb3ZlTlMiLCJyZW1vdmVBdHRyaWJ1dGVOUyIsImF0dHJDb25zdGFudCIsInNldEF0dHJpYnV0ZSIsImF0dHJDb25zdGFudE5TIiwic2V0QXR0cmlidXRlTlMiLCJhdHRyRnVuY3Rpb24iLCJ2IiwiYXR0ckZ1bmN0aW9uTlMiLCJnZXRBdHRyaWJ1dGVOUyIsImdldEF0dHJpYnV0ZSIsImVhY2giLCJkZWZhdWx0VmlldyIsInN0eWxlUmVtb3ZlIiwic3R5bGUiLCJyZW1vdmVQcm9wZXJ0eSIsInN0eWxlQ29uc3RhbnQiLCJwcmlvcml0eSIsInNldFByb3BlcnR5Iiwic3R5bGVGdW5jdGlvbiIsInN0eWxlVmFsdWUiLCJnZXRQcm9wZXJ0eVZhbHVlIiwiZ2V0Q29tcHV0ZWRTdHlsZSIsInByb3BlcnR5UmVtb3ZlIiwicHJvcGVydHlDb25zdGFudCIsInByb3BlcnR5RnVuY3Rpb24iLCJjbGFzc0FycmF5Iiwic3RyaW5nIiwiY2xhc3NMaXN0IiwiQ2xhc3NMaXN0IiwiX25vZGUiLCJfbmFtZXMiLCJhZGQiLCJqb2luIiwic3BsaWNlIiwiY29udGFpbnMiLCJjbGFzc2VkQWRkIiwibmFtZXMiLCJsaXN0IiwiY2xhc3NlZFJlbW92ZSIsImNsYXNzZWRUcnVlIiwiY2xhc3NlZEZhbHNlIiwiY2xhc3NlZEZ1bmN0aW9uIiwidGV4dFJlbW92ZSIsInRleHRDb250ZW50IiwidGV4dENvbnN0YW50IiwidGV4dEZ1bmN0aW9uIiwiaHRtbFJlbW92ZSIsImlubmVySFRNTCIsImh0bWxDb25zdGFudCIsImh0bWxGdW5jdGlvbiIsInJhaXNlIiwibmV4dFNpYmxpbmciLCJsb3dlciIsInByZXZpb3VzU2libGluZyIsImZpcnN0Q2hpbGQiLCJjcmVhdGUiLCJjcmVhdG9yIiwiY29uc3RhbnROdWxsIiwiYmVmb3JlIiwicmVtb3ZlQ2hpbGQiLCJzZWxlY3Rpb25fY2xvbmVTaGFsbG93IiwiY2xvbmUiLCJjbG9uZU5vZGUiLCJzZWxlY3Rpb25fY2xvbmVEZWVwIiwiZGVlcCIsInByb3BlcnR5IiwiY29udGV4dExpc3RlbmVyIiwibGlzdGVuZXIiLCJldmVudCIsIm9uUmVtb3ZlIiwiX19vbiIsIm8iLCJyZW1vdmVFdmVudExpc3RlbmVyIiwib3B0aW9ucyIsIm9uQWRkIiwiYWRkRXZlbnRMaXN0ZW5lciIsImRpc3BhdGNoRXZlbnQiLCJwYXJhbXMiLCJ3aW5kb3ciLCJDdXN0b21FdmVudCIsImNyZWF0ZUV2ZW50IiwiaW5pdEV2ZW50IiwiYnViYmxlcyIsImNhbmNlbGFibGUiLCJkZXRhaWwiLCJkaXNwYXRjaENvbnN0YW50IiwiZGlzcGF0Y2hGdW5jdGlvbiIsInJvb3QiLCJzZWxlY3Rpb25fc2VsZWN0aW9uIiwic2VsZWN0aW9uX3NlbGVjdCIsInNlbGVjdGlvbl9zZWxlY3RBbGwiLCJzZWxlY3RDaGlsZCIsInNlbGVjdGlvbl9zZWxlY3RDaGlsZCIsInNlbGVjdENoaWxkcmVuIiwic2VsZWN0aW9uX3NlbGVjdENoaWxkcmVuIiwic2VsZWN0aW9uX2ZpbHRlciIsInNlbGVjdGlvbl9kYXRhIiwic2VsZWN0aW9uX2VudGVyIiwic2VsZWN0aW9uX2V4aXQiLCJzZWxlY3Rpb25fam9pbiIsInNlbGVjdGlvbl9tZXJnZSIsInNlbGVjdGlvbl9vcmRlciIsInNlbGVjdGlvbl9zb3J0Iiwic2VsZWN0aW9uX2NhbGwiLCJub2RlcyIsInNlbGVjdGlvbl9ub2RlcyIsInNlbGVjdGlvbl9ub2RlIiwic2VsZWN0aW9uX3NpemUiLCJzZWxlY3Rpb25fZW1wdHkiLCJzZWxlY3Rpb25fZWFjaCIsImF0dHIiLCJzZWxlY3Rpb25fYXR0ciIsInNlbGVjdGlvbl9zdHlsZSIsInNlbGVjdGlvbl9wcm9wZXJ0eSIsImNsYXNzZWQiLCJzZWxlY3Rpb25fY2xhc3NlZCIsInRleHQiLCJzZWxlY3Rpb25fdGV4dCIsImh0bWwiLCJzZWxlY3Rpb25faHRtbCIsInNlbGVjdGlvbl9yYWlzZSIsInNlbGVjdGlvbl9sb3dlciIsInNlbGVjdGlvbl9hcHBlbmQiLCJpbnNlcnQiLCJzZWxlY3Rpb25faW5zZXJ0Iiwic2VsZWN0aW9uX3JlbW92ZSIsInNlbGVjdGlvbl9jbG9uZSIsInNlbGVjdGlvbl9kYXR1bSIsInNlbGVjdGlvbl9vbiIsInNlbGVjdGlvbl9kaXNwYXRjaCIsIlN5bWJvbCIsIml0ZXJhdG9yIiwic2VsZWN0aW9uX2l0ZXJhdG9yIiwiZmFjdG9yeSIsImV4dGVuZCIsImRlZmluaXRpb24iLCJDb2xvciIsImRhcmtlciIsImJyaWdodGVyIiwicmVJIiwicmVOIiwicmVQIiwicmVIZXgiLCJyZVJnYkludGVnZXIiLCJSZWdFeHAiLCJyZVJnYlBlcmNlbnQiLCJyZVJnYmFJbnRlZ2VyIiwicmVSZ2JhUGVyY2VudCIsInJlSHNsUGVyY2VudCIsInJlSHNsYVBlcmNlbnQiLCJuYW1lZCIsImFsaWNlYmx1ZSIsImFudGlxdWV3aGl0ZSIsImFxdWEiLCJhcXVhbWFyaW5lIiwiYXp1cmUiLCJiZWlnZSIsImJpc3F1ZSIsImJsYWNrIiwiYmxhbmNoZWRhbG1vbmQiLCJibHVlIiwiYmx1ZXZpb2xldCIsImJyb3duIiwiYnVybHl3b29kIiwiY2FkZXRibHVlIiwiY2hhcnRyZXVzZSIsImNob2NvbGF0ZSIsImNvcmFsIiwiY29ybmZsb3dlcmJsdWUiLCJjb3Juc2lsayIsImNyaW1zb24iLCJjeWFuIiwiZGFya2JsdWUiLCJkYXJrY3lhbiIsImRhcmtnb2xkZW5yb2QiLCJkYXJrZ3JheSIsImRhcmtncmVlbiIsImRhcmtncmV5IiwiZGFya2toYWtpIiwiZGFya21hZ2VudGEiLCJkYXJrb2xpdmVncmVlbiIsImRhcmtvcmFuZ2UiLCJkYXJrb3JjaGlkIiwiZGFya3JlZCIsImRhcmtzYWxtb24iLCJkYXJrc2VhZ3JlZW4iLCJkYXJrc2xhdGVibHVlIiwiZGFya3NsYXRlZ3JheSIsImRhcmtzbGF0ZWdyZXkiLCJkYXJrdHVycXVvaXNlIiwiZGFya3Zpb2xldCIsImRlZXBwaW5rIiwiZGVlcHNreWJsdWUiLCJkaW1ncmF5IiwiZGltZ3JleSIsImRvZGdlcmJsdWUiLCJmaXJlYnJpY2siLCJmbG9yYWx3aGl0ZSIsImZvcmVzdGdyZWVuIiwiZnVjaHNpYSIsImdhaW5zYm9ybyIsImdob3N0d2hpdGUiLCJnb2xkIiwiZ29sZGVucm9kIiwiZ3JheSIsImdyZWVuIiwiZ3JlZW55ZWxsb3ciLCJncmV5IiwiaG9uZXlkZXciLCJob3RwaW5rIiwiaW5kaWFucmVkIiwiaW5kaWdvIiwiaXZvcnkiLCJraGFraSIsImxhdmVuZGVyIiwibGF2ZW5kZXJibHVzaCIsImxhd25ncmVlbiIsImxlbW9uY2hpZmZvbiIsImxpZ2h0Ymx1ZSIsImxpZ2h0Y29yYWwiLCJsaWdodGN5YW4iLCJsaWdodGdvbGRlbnJvZHllbGxvdyIsImxpZ2h0Z3JheSIsImxpZ2h0Z3JlZW4iLCJsaWdodGdyZXkiLCJsaWdodHBpbmsiLCJsaWdodHNhbG1vbiIsImxpZ2h0c2VhZ3JlZW4iLCJsaWdodHNreWJsdWUiLCJsaWdodHNsYXRlZ3JheSIsImxpZ2h0c2xhdGVncmV5IiwibGlnaHRzdGVlbGJsdWUiLCJsaWdodHllbGxvdyIsImxpbWUiLCJsaW1lZ3JlZW4iLCJsaW5lbiIsIm1hZ2VudGEiLCJtYXJvb24iLCJtZWRpdW1hcXVhbWFyaW5lIiwibWVkaXVtYmx1ZSIsIm1lZGl1bW9yY2hpZCIsIm1lZGl1bXB1cnBsZSIsIm1lZGl1bXNlYWdyZWVuIiwibWVkaXVtc2xhdGVibHVlIiwibWVkaXVtc3ByaW5nZ3JlZW4iLCJtZWRpdW10dXJxdW9pc2UiLCJtZWRpdW12aW9sZXRyZWQiLCJtaWRuaWdodGJsdWUiLCJtaW50Y3JlYW0iLCJtaXN0eXJvc2UiLCJtb2NjYXNpbiIsIm5hdmFqb3doaXRlIiwibmF2eSIsIm9sZGxhY2UiLCJvbGl2ZSIsIm9saXZlZHJhYiIsIm9yYW5nZSIsIm9yYW5nZXJlZCIsIm9yY2hpZCIsInBhbGVnb2xkZW5yb2QiLCJwYWxlZ3JlZW4iLCJwYWxldHVycXVvaXNlIiwicGFsZXZpb2xldHJlZCIsInBhcGF5YXdoaXAiLCJwZWFjaHB1ZmYiLCJwZXJ1IiwicGluayIsInBsdW0iLCJwb3dkZXJibHVlIiwicHVycGxlIiwicmViZWNjYXB1cnBsZSIsInJlZCIsInJvc3licm93biIsInJveWFsYmx1ZSIsInNhZGRsZWJyb3duIiwic2FsbW9uIiwic2FuZHlicm93biIsInNlYWdyZWVuIiwic2Vhc2hlbGwiLCJzaWVubmEiLCJzaWx2ZXIiLCJza3libHVlIiwic2xhdGVibHVlIiwic2xhdGVncmF5Iiwic2xhdGVncmV5Iiwic25vdyIsInNwcmluZ2dyZWVuIiwic3RlZWxibHVlIiwidGFuIiwidGVhbCIsInRoaXN0bGUiLCJ0b21hdG8iLCJ0dXJxdW9pc2UiLCJ2aW9sZXQiLCJ3aGVhdCIsIndoaXRlIiwid2hpdGVzbW9rZSIsInllbGxvdyIsInllbGxvd2dyZWVuIiwiZGVmaW5lIiwiY29sb3IiLCJjaGFubmVscyIsImFzc2lnbiIsImRpc3BsYXlhYmxlIiwicmdiIiwiaGV4IiwiY29sb3JfZm9ybWF0SGV4IiwiZm9ybWF0SGV4IiwiZm9ybWF0SGV4OCIsImNvbG9yX2Zvcm1hdEhleDgiLCJmb3JtYXRIc2wiLCJjb2xvcl9mb3JtYXRIc2wiLCJmb3JtYXRSZ2IiLCJjb2xvcl9mb3JtYXRSZ2IiLCJ0b1N0cmluZyIsImhzbENvbnZlcnQiLCJmb3JtYXQiLCJsIiwidG9Mb3dlckNhc2UiLCJleGVjIiwicGFyc2VJbnQiLCJyZ2JuIiwiUmdiIiwicmdiYSIsImhzbGEiLCJyIiwiZyIsInJnYkNvbnZlcnQiLCJvcGFjaXR5IiwiayIsImNsYW1wIiwiY2xhbXBpIiwiY2xhbXBhIiwicmdiX2Zvcm1hdEhleCIsInJnYl9mb3JtYXRIZXg4IiwicmdiX2Zvcm1hdFJnYiIsImlzTmFOIiwiaCIsInMiLCJIc2wiLCJoc2wiLCJtMiIsImhzbDJyZ2IiLCJjbGFtcGgiLCJjbGFtcHQiLCJsaW5lYXIiLCJleHBvbmVudGlhbCIsInkiLCJnYW1tYSIsIm5vZ2FtbWEiLCJyZ2JHYW1tYSIsImVuZCIsImNvbG9yUmdiIiwiaXNOdW1iZXJBcnJheSIsIkFycmF5QnVmZmVyIiwiaXNWaWV3IiwiRGF0YVZpZXciLCJnZW5lcmljQXJyYXkiLCJuYiIsIm5hIiwiRGF0ZSIsInNldFRpbWUiLCJyZUEiLCJyZUIiLCJzb3VyY2UiLCJvbmUiLCJiaSIsImxhc3RJbmRleCIsImFtIiwiYm0iLCJicyIsInEiLCJpbmRleCIsImRhdGUiLCJudW1iZXJBcnJheSIsIm9iamVjdCIsImRlZ3JlZXMiLCJQSSIsImlkZW50aXR5IiwidHJhbnNsYXRlWCIsInRyYW5zbGF0ZVkiLCJyb3RhdGUiLCJza2V3WCIsInNjYWxlWCIsInNjYWxlWSIsImUiLCJhdGFuMiIsImF0YW4iLCJzdmdOb2RlIiwicGFyc2VDc3MiLCJET01NYXRyaXgiLCJXZWJLaXRDU1NNYXRyaXgiLCJpc0lkZW50aXR5IiwiZGVjb21wb3NlIiwicGFyc2VTdmciLCJ0cmFuc2Zvcm0iLCJiYXNlVmFsIiwiY29uc29saWRhdGUiLCJtYXRyaXgiLCJpbnRlcnBvbGF0ZVRyYW5zZm9ybSIsInBhcnNlIiwicHhDb21tYSIsInB4UGFyZW4iLCJkZWdQYXJlbiIsInBvcCIsInRyYW5zbGF0ZSIsInhhIiwieWEiLCJ4YiIsInliIiwic2NhbGUiLCJpbnRlcnBvbGF0ZVRyYW5zZm9ybUNzcyIsImludGVycG9sYXRlVHJhbnNmb3JtU3ZnIiwiZnJhbWUiLCJ0aW1lb3V0IiwiaW50ZXJ2YWwiLCJwb2tlRGVsYXkiLCJ0YXNrSGVhZCIsInRhc2tUYWlsIiwiY2xvY2tMYXN0IiwiY2xvY2tOb3ciLCJjbG9ja1NrZXciLCJjbG9jayIsInBlcmZvcm1hbmNlIiwibm93Iiwic2V0RnJhbWUiLCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUiLCJzZXRUaW1lb3V0IiwiY2xlYXJOb3ciLCJUaW1lciIsIl9jYWxsIiwiX3RpbWUiLCJ0aW1lciIsInJlc3RhcnQiLCJkZWxheSIsInRpbWUiLCJUeXBlRXJyb3IiLCJzbGVlcCIsIkluZmluaXR5IiwidGltZXJGbHVzaCIsInVuZGVmaW5lZCIsIndha2UiLCJuYXAiLCJwb2tlIiwidDAiLCJ0MSIsInQyIiwiY2xlYXJUaW1lb3V0IiwiY2xlYXJJbnRlcnZhbCIsInNldEludGVydmFsIiwiZWxhcHNlZCIsImVtcHR5T24iLCJlbXB0eVR3ZWVuIiwiQ1JFQVRFRCIsIlNDSEVEVUxFRCIsIlNUQVJUSU5HIiwiU1RBUlRFRCIsIlJVTk5JTkciLCJFTkRJTkciLCJFTkRFRCIsImlkIiwidGltaW5nIiwic2NoZWR1bGVzIiwiX190cmFuc2l0aW9uIiwidHdlZW4iLCJkdXJhdGlvbiIsImVhc2UiLCJzdGF0ZSIsImluaXQiLCJzY2hlZHVsZSIsInNlbGYiLCJ0aWNrIiwiYWN0aXZlIiwiaW50ZXJydXB0IiwidHdlZW5SZW1vdmUiLCJ0d2VlbjAiLCJ0d2VlbjEiLCJ0d2VlbkZ1bmN0aW9uIiwiX2lkIiwidHdlZW5WYWx1ZSIsInRyYW5zaXRpb24iLCJpbnRlcnBvbGF0ZU51bWJlciIsImludGVycG9sYXRlUmdiIiwiaW50ZXJwb2xhdGVTdHJpbmciLCJpbnRlcnBvbGF0ZSIsInZhbHVlMSIsInN0cmluZzAwIiwic3RyaW5nMSIsImludGVycG9sYXRlMCIsInN0cmluZzAiLCJzdHJpbmcxMCIsImF0dHJUd2VlbiIsImF0dHJJbnRlcnBvbGF0ZSIsImF0dHJJbnRlcnBvbGF0ZU5TIiwiYXR0clR3ZWVuTlMiLCJfdmFsdWUiLCJkZWxheUZ1bmN0aW9uIiwiZGVsYXlDb25zdGFudCIsImR1cmF0aW9uRnVuY3Rpb24iLCJkdXJhdGlvbkNvbnN0YW50IiwiZWFzZUNvbnN0YW50IiwiZWFzZVZhcnlpbmciLCJUcmFuc2l0aW9uIiwiX25hbWUiLCJldmVyeSIsIm9uRnVuY3Rpb24iLCJvbjAiLCJvbjEiLCJzaXQiLCJyZW1vdmVGdW5jdGlvbiIsImluaGVyaXQiLCJzdHlsZU51bGwiLCJzdHlsZU1heWJlUmVtb3ZlIiwibGlzdGVuZXIwIiwic3R5bGVUd2VlbiIsInN0eWxlSW50ZXJwb2xhdGUiLCJ0ZXh0SW50ZXJwb2xhdGUiLCJ0ZXh0VHdlZW4iLCJpZDAiLCJpZDEiLCJuZXdJZCIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwiY2FuY2VsIiwic2VsZWN0aW9uX3Byb3RvdHlwZSIsInRyYW5zaXRpb25fc2VsZWN0IiwidHJhbnNpdGlvbl9zZWxlY3RBbGwiLCJ0cmFuc2l0aW9uX2ZpbHRlciIsInRyYW5zaXRpb25fbWVyZ2UiLCJ0cmFuc2l0aW9uX3NlbGVjdGlvbiIsInRyYW5zaXRpb25fdHJhbnNpdGlvbiIsInRyYW5zaXRpb25fb24iLCJ0cmFuc2l0aW9uX2F0dHIiLCJ0cmFuc2l0aW9uX2F0dHJUd2VlbiIsInRyYW5zaXRpb25fc3R5bGUiLCJ0cmFuc2l0aW9uX3N0eWxlVHdlZW4iLCJ0cmFuc2l0aW9uX3RleHQiLCJ0cmFuc2l0aW9uX3RleHRUd2VlbiIsInRyYW5zaXRpb25fcmVtb3ZlIiwidHJhbnNpdGlvbl90d2VlbiIsInRyYW5zaXRpb25fZGVsYXkiLCJ0cmFuc2l0aW9uX2R1cmF0aW9uIiwidHJhbnNpdGlvbl9lYXNlIiwidHJhbnNpdGlvbl9lYXNlVmFyeWluZyIsInRyYW5zaXRpb25fZW5kIiwiY3ViaWNJbk91dCIsImRlZmF1bHRUaW1pbmciLCJlYXNlQ3ViaWNJbk91dCIsInNlbGVjdGlvbl9pbnRlcnJ1cHQiLCJzZWxlY3Rpb25fdHJhbnNpdGlvbiIsImluaXRSYW5nZSIsImRvbWFpbiIsImltcGxpY2l0Iiwib3JkaW5hbCIsInVua25vd24iLCJiYW5kIiwib3JkaW5hbFJhbmdlIiwicjAiLCJyMSIsImJhbmR3aWR0aCIsInBhZGRpbmdJbm5lciIsInBhZGRpbmdPdXRlciIsImFsaWduIiwicmVzY2FsZSIsInZhbHVlcyIsInNlcXVlbmNlIiwicmFuZ2VSb3VuZCIsInBhZGRpbmciLCJjb25zdGFudHMiLCJ1bml0Iiwibm9ybWFsaXplIiwiY2xhbXBlciIsImJpbWFwIiwiZDAiLCJkMSIsInBvbHltYXAiLCJiaXNlY3QiLCJ0YXJnZXQiLCJ0cmFuc2Zvcm1lciIsImludGVycG9sYXRlVmFsdWUiLCJ1bnRyYW5zZm9ybSIsInBpZWNld2lzZSIsIm91dHB1dCIsImlucHV0IiwiaW52ZXJ0IiwiaW50ZXJwb2xhdGVSb3VuZCIsInUiLCJjb250aW51b3VzIiwibmljZSIsIngwIiwieDEiLCJ0aW1lSW50ZXJ2YWwiLCJmbG9vcmkiLCJvZmZzZXRpIiwiZmllbGQiLCJvZmZzZXQiLCJpc0Zpbml0ZSIsIm1pbGxpc2Vjb25kIiwiZHVyYXRpb25TZWNvbmQiLCJkdXJhdGlvbk1pbnV0ZSIsImR1cmF0aW9uSG91ciIsImR1cmF0aW9uRGF5IiwiZHVyYXRpb25XZWVrIiwiZHVyYXRpb25Nb250aCIsImR1cmF0aW9uWWVhciIsInNlY29uZCIsImdldE1pbGxpc2Vjb25kcyIsImdldFVUQ1NlY29uZHMiLCJ0aW1lTWludXRlIiwiZ2V0U2Vjb25kcyIsImdldE1pbnV0ZXMiLCJ1dGNNaW51dGUiLCJzZXRVVENTZWNvbmRzIiwiZ2V0VVRDTWludXRlcyIsInRpbWVIb3VyIiwiZ2V0SG91cnMiLCJ1dGNIb3VyIiwic2V0VVRDTWludXRlcyIsImdldFVUQ0hvdXJzIiwidGltZURheSIsInNldEhvdXJzIiwic2V0RGF0ZSIsImdldERhdGUiLCJnZXRUaW1lem9uZU9mZnNldCIsInV0Y0RheSIsInNldFVUQ0hvdXJzIiwic2V0VVRDRGF0ZSIsImdldFVUQ0RhdGUiLCJ1bml4RGF5IiwidGltZVdlZWtkYXkiLCJnZXREYXkiLCJ0aW1lU3VuZGF5IiwidGltZU1vbmRheSIsInRpbWVUdWVzZGF5IiwidGltZVdlZG5lc2RheSIsInRpbWVUaHVyc2RheSIsInRpbWVGcmlkYXkiLCJ0aW1lU2F0dXJkYXkiLCJ1dGNXZWVrZGF5IiwiZ2V0VVRDRGF5IiwidXRjU3VuZGF5IiwidXRjTW9uZGF5IiwidXRjVHVlc2RheSIsInV0Y1dlZG5lc2RheSIsInV0Y1RodXJzZGF5IiwidXRjRnJpZGF5IiwidXRjU2F0dXJkYXkiLCJ0aW1lTW9udGgiLCJzZXRNb250aCIsImdldE1vbnRoIiwiZ2V0RnVsbFllYXIiLCJ1dGNNb250aCIsInNldFVUQ01vbnRoIiwiZ2V0VVRDTW9udGgiLCJnZXRVVENGdWxsWWVhciIsInRpbWVZZWFyIiwic2V0RnVsbFllYXIiLCJ1dGNZZWFyIiwic2V0VVRDRnVsbFllYXIiLCJ0aWNrZXIiLCJ5ZWFyIiwibW9udGgiLCJ3ZWVrIiwiZGF5IiwiaG91ciIsIm1pbnV0ZSIsInRpY2tJbnRlcnZhbHMiLCJ0aWNrcyIsInRpY2tJbnRlcnZhbCIsImFicyIsInRpbWVUaWNrcyIsInRpbWVUaWNrSW50ZXJ2YWwiLCJsb2NhbERhdGUiLCJIIiwiTSIsIlMiLCJMIiwidXRjRGF0ZSIsIlVUQyIsIm5ld0RhdGUiLCJmb3JtYXRMb2NhbGUiLCJsb2NhbGUiLCJsb2NhbGVfZGF0ZVRpbWUiLCJkYXRlVGltZSIsImxvY2FsZV9kYXRlIiwibG9jYWxlX3RpbWUiLCJsb2NhbGVfcGVyaW9kcyIsInBlcmlvZHMiLCJsb2NhbGVfd2Vla2RheXMiLCJkYXlzIiwibG9jYWxlX3Nob3J0V2Vla2RheXMiLCJzaG9ydERheXMiLCJsb2NhbGVfbW9udGhzIiwibW9udGhzIiwibG9jYWxlX3Nob3J0TW9udGhzIiwic2hvcnRNb250aHMiLCJwZXJpb2RSZSIsImZvcm1hdFJlIiwicGVyaW9kTG9va3VwIiwiZm9ybWF0TG9va3VwIiwid2Vla2RheVJlIiwid2Vla2RheUxvb2t1cCIsInNob3J0V2Vla2RheVJlIiwic2hvcnRXZWVrZGF5TG9va3VwIiwibW9udGhSZSIsIm1vbnRoTG9va3VwIiwic2hvcnRNb250aFJlIiwic2hvcnRNb250aExvb2t1cCIsImZvcm1hdHMiLCJmb3JtYXRTaG9ydFdlZWtkYXkiLCJmb3JtYXRXZWVrZGF5IiwiZm9ybWF0U2hvcnRNb250aCIsImZvcm1hdE1vbnRoIiwiZm9ybWF0RGF5T2ZNb250aCIsImZvcm1hdE1pY3Jvc2Vjb25kcyIsImZvcm1hdFllYXJJU08iLCJmb3JtYXRGdWxsWWVhcklTTyIsImZvcm1hdEhvdXIyNCIsImZvcm1hdEhvdXIxMiIsImZvcm1hdERheU9mWWVhciIsImZvcm1hdE1pbGxpc2Vjb25kcyIsImZvcm1hdE1vbnRoTnVtYmVyIiwiZm9ybWF0TWludXRlcyIsImZvcm1hdFBlcmlvZCIsImZvcm1hdFF1YXJ0ZXIiLCJmb3JtYXRVbml4VGltZXN0YW1wIiwiZm9ybWF0VW5peFRpbWVzdGFtcFNlY29uZHMiLCJmb3JtYXRTZWNvbmRzIiwiZm9ybWF0V2Vla2RheU51bWJlck1vbmRheSIsImZvcm1hdFdlZWtOdW1iZXJTdW5kYXkiLCJmb3JtYXRXZWVrTnVtYmVySVNPIiwiZm9ybWF0V2Vla2RheU51bWJlclN1bmRheSIsImZvcm1hdFdlZWtOdW1iZXJNb25kYXkiLCJmb3JtYXRZZWFyIiwiZm9ybWF0RnVsbFllYXIiLCJmb3JtYXRab25lIiwiZm9ybWF0TGl0ZXJhbFBlcmNlbnQiLCJ1dGNGb3JtYXRzIiwiZm9ybWF0VVRDU2hvcnRXZWVrZGF5IiwiZm9ybWF0VVRDV2Vla2RheSIsImZvcm1hdFVUQ1Nob3J0TW9udGgiLCJmb3JtYXRVVENNb250aCIsImZvcm1hdFVUQ0RheU9mTW9udGgiLCJmb3JtYXRVVENNaWNyb3NlY29uZHMiLCJmb3JtYXRVVENZZWFySVNPIiwiZm9ybWF0VVRDRnVsbFllYXJJU08iLCJmb3JtYXRVVENIb3VyMjQiLCJmb3JtYXRVVENIb3VyMTIiLCJmb3JtYXRVVENEYXlPZlllYXIiLCJmb3JtYXRVVENNaWxsaXNlY29uZHMiLCJmb3JtYXRVVENNb250aE51bWJlciIsImZvcm1hdFVUQ01pbnV0ZXMiLCJmb3JtYXRVVENQZXJpb2QiLCJmb3JtYXRVVENRdWFydGVyIiwiZm9ybWF0VVRDU2Vjb25kcyIsImZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJNb25kYXkiLCJmb3JtYXRVVENXZWVrTnVtYmVyU3VuZGF5IiwiZm9ybWF0VVRDV2Vla051bWJlcklTTyIsImZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJTdW5kYXkiLCJmb3JtYXRVVENXZWVrTnVtYmVyTW9uZGF5IiwiZm9ybWF0VVRDWWVhciIsImZvcm1hdFVUQ0Z1bGxZZWFyIiwiZm9ybWF0VVRDWm9uZSIsInBhcnNlcyIsInBhcnNlU2hvcnRXZWVrZGF5IiwicGFyc2VXZWVrZGF5IiwicGFyc2VTaG9ydE1vbnRoIiwicGFyc2VNb250aCIsInBhcnNlTG9jYWxlRGF0ZVRpbWUiLCJwYXJzZURheU9mTW9udGgiLCJwYXJzZU1pY3Jvc2Vjb25kcyIsInBhcnNlWWVhciIsInBhcnNlRnVsbFllYXIiLCJwYXJzZUhvdXIyNCIsInBhcnNlRGF5T2ZZZWFyIiwicGFyc2VNaWxsaXNlY29uZHMiLCJwYXJzZU1vbnRoTnVtYmVyIiwicGFyc2VNaW51dGVzIiwicGFyc2VQZXJpb2QiLCJwYXJzZVF1YXJ0ZXIiLCJwYXJzZVVuaXhUaW1lc3RhbXAiLCJwYXJzZVVuaXhUaW1lc3RhbXBTZWNvbmRzIiwicGFyc2VTZWNvbmRzIiwicGFyc2VXZWVrZGF5TnVtYmVyTW9uZGF5IiwicGFyc2VXZWVrTnVtYmVyU3VuZGF5IiwicGFyc2VXZWVrTnVtYmVySVNPIiwicGFyc2VXZWVrZGF5TnVtYmVyU3VuZGF5IiwicGFyc2VXZWVrTnVtYmVyTW9uZGF5IiwicGFyc2VMb2NhbGVEYXRlIiwicGFyc2VMb2NhbGVUaW1lIiwicGFyc2Vab25lIiwicGFyc2VMaXRlcmFsUGVyY2VudCIsIm5ld0Zvcm1hdCIsIlgiLCJzcGVjaWZpZXIiLCJwYWQiLCJjaGFyQ29kZUF0IiwicGFkcyIsImNoYXJBdCIsIm5ld1BhcnNlIiwiWiIsInBhcnNlU3BlY2lmaWVyIiwiUSIsInAiLCJWIiwidyIsIlciLCJVIiwidXRjRm9ybWF0IiwidXRjUGFyc2UiLCJudW1iZXJSZSIsInBlcmNlbnRSZSIsInJlcXVvdGVSZSIsImZpbGwiLCJ3aWR0aCIsInNpZ24iLCJyZXF1b3RlIiwicmVwbGFjZSIsImRJU08iLCJ6IiwiZ2V0VVRDTWlsbGlzZWNvbmRzIiwiZG93IiwiVVRDZElTTyIsInRpbWVGb3JtYXQiLCJkZWZhdWx0TG9jYWxlIiwiY2FsZW5kYXIiLCJmb3JtYXRNaWxsaXNlY29uZCIsImZvcm1hdFNlY29uZCIsImZvcm1hdE1pbnV0ZSIsImZvcm1hdEhvdXIiLCJmb3JtYXREYXkiLCJmb3JtYXRXZWVrIiwidGlja0Zvcm1hdCIsInRpbWVXZWVrIiwidGltZVNlY29uZCIsIlRyYW5zZm9ybSIsInBvaW50IiwiYXBwbHlYIiwiYXBwbHlZIiwibG9jYXRpb24iLCJpbnZlcnRYIiwiaW52ZXJ0WSIsInJlc2NhbGVYIiwicmVzY2FsZVkiLCJkMy5zZWxlY3QiLCJkMy5zY2FsZVRpbWUiLCJkMy5zY2FsZUJhbmQiLCJkMy50aW1lRm9ybWF0Il0sIm1hcHBpbmdzIjoiOztBQUFlLFNBQVNBLFdBQVNBLENBQUND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QUcsR0FBS0EsQ0FBQyxHQUFHLElBQUssRUFBRyxDQUFDQSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBS0EsQ0FBQyxHQUFHLEdBQUksRUFBRSxDQUFDLENBQUM7QUFBQyxJQUNsSHNaLENBQUMsS0FBSyxDQUFDLEdBQUdNLElBQUksQ0FBQzVaLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFQSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksRUFBRUEsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQ0EsQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUM7SUFDaEZzWixDQUFDLEtBQUssQ0FBQyxHQUFHTSxJQUFJLENBQUU1WixDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBS0EsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFLLEVBQUdBLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFLQSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUssRUFBR0EsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUtBLENBQUMsR0FBRyxJQUFLLEVBQUUsQ0FBRSxDQUFDQSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBS0EsQ0FBQyxHQUFHLEdBQUksSUFBSSxJQUFJLENBQUM7QUFBQyxJQUN4SixJQUFJO0FBQUUsTUFDTixDQUFDQSxDQUFDLEdBQUd3TyxZQUFZLENBQUNnTCxJQUFJLENBQUNILE1BQU0sQ0FBQyxJQUFJLElBQUlNLEdBQUcsQ0FBQzNaLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFQSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQUMsSUFDL0QsQ0FBQ0EsQ0FBQyxHQUFHME8sWUFBWSxDQUFDOEssSUFBSSxDQUFDSCxNQUFNLENBQUMsSUFBSSxJQUFJTSxHQUFHLENBQUMzWixDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsRUFBRUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFH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QUFBLGFBQUEsQ0FBQSxRQUFBLEVBQUEsRUFBUSxFQUFFLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBQyxJQUFJLEVBQUMsQ0FBQyxFQUFDLEdBQUcsRUFBQyxTQUFTLEVBQUMsY0FBYyxHQUFHLENBQ3ZEO29CQUNOLGFBQWtCLENBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLENBQUEsQ0FDaEIsQ0FDVCxDQUNDLENBQ1Q7WUFDRCxhQUFLLENBQUEsS0FBQSxFQUFBLEVBQUEsRUFBRSxFQUFDLE9BQU8sRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFRLENBQUEsQ0FDbkMsQ0FDSixFQUNSO0FBQ047Ozs7IiwieF9nb29nbGVfaWdub3JlTGlzdCI6WzAsMSwyLDMsNCw1LDYsNyw4LDksMTAsMTEsMTIsMTMsMTQsMTUsMTYsMTcsMTgsMTksMjAsMjEsMjIsMjMsMjQsMjUsMjYsMjcsMjgsMjksMzAsMzEsMzIsMzMsMzQsMzUsMzYsMzcsMzgsMzksNDAsNDEsNDIsNDMsNDQsNDUsNDYsNDcsNDgsNDksNTAsNTEsNTIsNTMsNTQsNTUsNTYsNTcsNTgsNTksNjAsNjEsNjIsNjMsNjQsNjUsNjYsNjcsNjgsNjksNzAsNzEsNzIsNzMsNzQsNzUsNzYsNzcsNzgsNzksODAsODEsODIsODMsODQsODUsODYsODcsODgsODksOTAsOTEsOTIsOTMsOTQsOTUsOTYsOTcsOTgsOTksMTAwLDEwMSwxMDIsMTAzLDEwNCwxMDUsMTA2LDEwNywxMDgsMTA5LDExMCwxMTEsMTEyLDExMywxMTQsMTE1LDExNiwxMTcsMTE4LDExOSwxMjAsMTIxLDEyMl19
