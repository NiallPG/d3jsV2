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

function CatalogReleaseChart({ name }) {
    const chartRef = useRef(null);
    const containerRef = useRef(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const { width } = containerRef.current.getBoundingClientRect();
                // Set responsive dimensions
                setDimensions({
                    width: width,
                    height: Math.min(600, width * 0.5) // Maintain aspect ratio, max 600px height
                });
            }
        };
        // Initial size
        handleResize();
        // Add resize listener
        window.addEventListener('resize', handleResize);
        // Also observe container size changes
        const resizeObserver = new ResizeObserver(handleResize);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        return () => {
            window.removeEventListener('resize', handleResize);
            resizeObserver.disconnect();
        };
    }, []);
    useEffect(() => {
        if (!chartRef.current || dimensions.width === 0)
            return;
        // Clear any existing chart
        select(chartRef.current).selectAll("*").remove();
        // Data structure
        const industries = [
            { name: "Aerospace & Defense", retired: new Date(2023, 10, 1), current: new Date(2024, 11, 1), upcoming: "2506" },
            { name: "Automotive", retired: new Date(2023, 2, 1), current: new Date(2024, 5, 1), upcoming: "TBD" },
            { name: "Battery", retired: new Date(2025, 0, 1), current: new Date(2025, 4, 1), upcoming: "2507" },
            { name: "CP&R", retired: new Date(2024, 8, 1), current: new Date(2024, 11, 1), upcoming: "TBD" },
            { name: "Electronics", retired: new Date(2025, 2, 1), current: new Date(2025, 4, 1), upcoming: "2508" },
            { name: "Energy & Utilities", retired: new Date(2024, 8, 1), current: new Date(2025, 1, 1), upcoming: "2505" },
            { name: "Heavy Equipment", retired: new Date(2023, 5, 1), current: new Date(2023, 5, 1), upcoming: "TBD" },
            { name: "Industrial Machinery", retired: new Date(2025, 2, 1), current: new Date(2025, 5, 1), upcoming: "2509" },
            { name: "Marine", retired: new Date(2024, 2, 1), current: new Date(2024, 2, 1), upcoming: "TBD" },
            { name: "Medical Devices", retired: new Date(2024, 9, 1), current: new Date(2025, 0, 1), upcoming: "TBD" },
            { name: "Pharmaceuticals", retired: new Date(2024, 10, 1), current: new Date(2025, 2, 1), upcoming: "2506" },
            { name: "Semiconductor Devices", retired: new Date(2024, 1, 1), current: new Date(2024, 4, 1), upcoming: "TBD" }
        ];
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
        // Add today's date
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
                svg.append("rect")
                    .attr("class", "retired-marker")
                    .attr("x", retiredX - 10)
                    .attr("y", y - 10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("rx", 10)
                    .attr("transform", `rotate(45 ${retiredX} ${y})`);
            }
            // Current marker (diamond)
            if (industry.current) {
                const currentX = timeScale(industry.current);
                svg.append("rect")
                    .attr("class", "current-marker")
                    .attr("x", currentX - 10)
                    .attr("y", y - 10)
                    .attr("width", 20)
                    .attr("height", 20)
                    .attr("rx", 10)
                    .attr("transform", `rotate(45 ${currentX} ${y})`);
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
                    // Place TBD and future dates at the edge but within bounds
                    boxX = width - 70; // Adjusted to keep box within chart area
                }
            }
            else {
                boxX = width - 70; // Keep TBD boxes within the chart area
            }
            svg.append("rect")
                .attr("class", "upcoming-box")
                .attr("x", boxX)
                .attr("y", y - 15)
                .attr("width", 60)
                .attr("height", 30)
                .attr("rx", 4);
            svg.append("text")
                .attr("class", "upcoming-text")
                .attr("x", boxX + 30)
                .attr("y", y + 5)
                .style("font-size", fontSize)
                .text(industry.upcoming);
        });
    }, [dimensions]);
    return (createElement("div", { className: `catalog-release-chart ${name}`, ref: containerRef, style: { width: '100%', height: '100%' } },
        createElement("div", { className: "chart-container" },
            createElement("h1", { className: "chart-title" }, "Catalog Release Schedule"),
            createElement("div", { className: "legend" },
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
                createElement("div", { className: "legend-item" },
                    createElement("svg", { className: "legend-symbol", viewBox: "0 0 20 20" },
                        createElement("circle", { cx: "10", cy: "10", r: "5", className: "today-circle" })),
                    createElement("span", null, "Today's Date"))),
            createElement("div", { ref: chartRef, id: "chart", style: { width: '100%' } }))));
}

export { CatalogReleaseChart };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2F0YWxvZ1JlbGVhc2VDaGFydC5tanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvYXNjZW5kaW5nLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9kZXNjZW5kaW5nLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9iaXNlY3Rvci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvbnVtYmVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9iaXNlY3QuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvaW50ZXJubWFwL3NyYy9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvdGlja3MuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL3JhbmdlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWRpc3BhdGNoL3NyYy9kaXNwYXRjaC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL25hbWVzcGFjZXMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9uYW1lc3BhY2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9jcmVhdG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0b3IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvYXJyYXkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3RvckFsbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3RBbGwuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9tYXRjaGVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdENoaWxkcmVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2ZpbHRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zcGFyc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZW50ZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9jb25zdGFudC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXRhLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2V4aXQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vam9pbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9tZXJnZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vcmRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zb3J0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2NhbGwuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZXMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vbm9kZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zaXplLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VtcHR5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2VhY2guanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vYXR0ci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3dpbmRvdy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zdHlsZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9wcm9wZXJ0eS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbGFzc2VkLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3RleHQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaHRtbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9yYWlzZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9sb3dlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hcHBlbmQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vaW5zZXJ0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3JlbW92ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9jbG9uZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kYXR1bS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9vbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9kaXNwYXRjaC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pdGVyYXRvci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1jb2xvci9zcmMvZGVmaW5lLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9jb2xvci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvY29uc3RhbnQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2NvbG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9yZ2IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL251bWJlckFycmF5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9hcnJheS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvZGF0ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvbnVtYmVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9vYmplY3QuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3N0cmluZy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdmFsdWUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3JvdW5kLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy90cmFuc2Zvcm0vZGVjb21wb3NlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy90cmFuc2Zvcm0vcGFyc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZXIvc3JjL3RpbWVvdXQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zY2hlZHVsZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9pbnRlcnJ1cHQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL2ludGVycnVwdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3R3ZWVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW50ZXJwb2xhdGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9hdHRyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vYXR0clR3ZWVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZGVsYXkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9kdXJhdGlvbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2Vhc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9lYXNlVmFyeWluZy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2ZpbHRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL21lcmdlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vb24uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9yZW1vdmUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3QuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3RBbGwuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zZWxlY3Rpb24uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9zdHlsZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlVHdlZW4uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi90ZXh0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdGV4dFR3ZWVuLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHJhbnNpdGlvbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2VuZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWVhc2Uvc3JjL2N1YmljLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi90cmFuc2l0aW9uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3NlbGVjdGlvbi9pbmRleC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvaW5pdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvb3JkaW5hbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvYmFuZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvY29uc3RhbnQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL251bWJlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvY29udGludW91cy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvbmljZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9pbnRlcnZhbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9taWxsaXNlY29uZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9kdXJhdGlvbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9zZWNvbmQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvbWludXRlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL2hvdXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvZGF5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL3dlZWsuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvbW9udGguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMveWVhci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy90aWNrcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lLWZvcm1hdC9zcmMvbG9jYWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUtZm9ybWF0L3NyYy9kZWZhdWx0TG9jYWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy90aW1lLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXpvb20vc3JjL3RyYW5zZm9ybS5qcyIsIi4uLy4uLy4uLy4uLy4uL3NyYy9DYXRhbG9nUmVsZWFzZUNoYXJ0LnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICByZXR1cm4gYSA9PSBudWxsIHx8IGIgPT0gbnVsbCA/IE5hTiA6IGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiBhID49IGIgPyAwIDogTmFOO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhID09IG51bGwgfHwgYiA9PSBudWxsID8gTmFOXG4gICAgOiBiIDwgYSA/IC0xXG4gICAgOiBiID4gYSA/IDFcbiAgICA6IGIgPj0gYSA/IDBcbiAgICA6IE5hTjtcbn1cbiIsImltcG9ydCBhc2NlbmRpbmcgZnJvbSBcIi4vYXNjZW5kaW5nLmpzXCI7XG5pbXBvcnQgZGVzY2VuZGluZyBmcm9tIFwiLi9kZXNjZW5kaW5nLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJpc2VjdG9yKGYpIHtcbiAgbGV0IGNvbXBhcmUxLCBjb21wYXJlMiwgZGVsdGE7XG5cbiAgLy8gSWYgYW4gYWNjZXNzb3IgaXMgc3BlY2lmaWVkLCBwcm9tb3RlIGl0IHRvIGEgY29tcGFyYXRvci4gSW4gdGhpcyBjYXNlIHdlXG4gIC8vIGNhbiB0ZXN0IHdoZXRoZXIgdGhlIHNlYXJjaCB2YWx1ZSBpcyAoc2VsZi0pIGNvbXBhcmFibGUuIFdlIGNhbuKAmXQgZG8gdGhpc1xuICAvLyBmb3IgYSBjb21wYXJhdG9yIChleGNlcHQgZm9yIHNwZWNpZmljLCBrbm93biBjb21wYXJhdG9ycykgYmVjYXVzZSB3ZSBjYW7igJl0XG4gIC8vIHRlbGwgaWYgdGhlIGNvbXBhcmF0b3IgaXMgc3ltbWV0cmljLCBhbmQgYW4gYXN5bW1ldHJpYyBjb21wYXJhdG9yIGNhbuKAmXQgYmVcbiAgLy8gdXNlZCB0byB0ZXN0IHdoZXRoZXIgYSBzaW5nbGUgdmFsdWUgaXMgY29tcGFyYWJsZS5cbiAgaWYgKGYubGVuZ3RoICE9PSAyKSB7XG4gICAgY29tcGFyZTEgPSBhc2NlbmRpbmc7XG4gICAgY29tcGFyZTIgPSAoZCwgeCkgPT4gYXNjZW5kaW5nKGYoZCksIHgpO1xuICAgIGRlbHRhID0gKGQsIHgpID0+IGYoZCkgLSB4O1xuICB9IGVsc2Uge1xuICAgIGNvbXBhcmUxID0gZiA9PT0gYXNjZW5kaW5nIHx8IGYgPT09IGRlc2NlbmRpbmcgPyBmIDogemVybztcbiAgICBjb21wYXJlMiA9IGY7XG4gICAgZGVsdGEgPSBmO1xuICB9XG5cbiAgZnVuY3Rpb24gbGVmdChhLCB4LCBsbyA9IDAsIGhpID0gYS5sZW5ndGgpIHtcbiAgICBpZiAobG8gPCBoaSkge1xuICAgICAgaWYgKGNvbXBhcmUxKHgsIHgpICE9PSAwKSByZXR1cm4gaGk7XG4gICAgICBkbyB7XG4gICAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgICAgaWYgKGNvbXBhcmUyKGFbbWlkXSwgeCkgPCAwKSBsbyA9IG1pZCArIDE7XG4gICAgICAgIGVsc2UgaGkgPSBtaWQ7XG4gICAgICB9IHdoaWxlIChsbyA8IGhpKTtcbiAgICB9XG4gICAgcmV0dXJuIGxvO1xuICB9XG5cbiAgZnVuY3Rpb24gcmlnaHQoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgaWYgKGxvIDwgaGkpIHtcbiAgICAgIGlmIChjb21wYXJlMSh4LCB4KSAhPT0gMCkgcmV0dXJuIGhpO1xuICAgICAgZG8ge1xuICAgICAgICBjb25zdCBtaWQgPSAobG8gKyBoaSkgPj4+IDE7XG4gICAgICAgIGlmIChjb21wYXJlMihhW21pZF0sIHgpIDw9IDApIGxvID0gbWlkICsgMTtcbiAgICAgICAgZWxzZSBoaSA9IG1pZDtcbiAgICAgIH0gd2hpbGUgKGxvIDwgaGkpO1xuICAgIH1cbiAgICByZXR1cm4gbG87XG4gIH1cblxuICBmdW5jdGlvbiBjZW50ZXIoYSwgeCwgbG8gPSAwLCBoaSA9IGEubGVuZ3RoKSB7XG4gICAgY29uc3QgaSA9IGxlZnQoYSwgeCwgbG8sIGhpIC0gMSk7XG4gICAgcmV0dXJuIGkgPiBsbyAmJiBkZWx0YShhW2kgLSAxXSwgeCkgPiAtZGVsdGEoYVtpXSwgeCkgPyBpIC0gMSA6IGk7XG4gIH1cblxuICByZXR1cm4ge2xlZnQsIGNlbnRlciwgcmlnaHR9O1xufVxuXG5mdW5jdGlvbiB6ZXJvKCkge1xuICByZXR1cm4gMDtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG51bWJlcih4KSB7XG4gIHJldHVybiB4ID09PSBudWxsID8gTmFOIDogK3g7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiogbnVtYmVycyh2YWx1ZXMsIHZhbHVlb2YpIHtcbiAgaWYgKHZhbHVlb2YgPT09IHVuZGVmaW5lZCkge1xuICAgIGZvciAobGV0IHZhbHVlIG9mIHZhbHVlcykge1xuICAgICAgaWYgKHZhbHVlICE9IG51bGwgJiYgKHZhbHVlID0gK3ZhbHVlKSA+PSB2YWx1ZSkge1xuICAgICAgICB5aWVsZCB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgbGV0IGluZGV4ID0gLTE7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAoKHZhbHVlID0gdmFsdWVvZih2YWx1ZSwgKytpbmRleCwgdmFsdWVzKSkgIT0gbnVsbCAmJiAodmFsdWUgPSArdmFsdWUpID49IHZhbHVlKSB7XG4gICAgICAgIHlpZWxkIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IGFzY2VuZGluZyBmcm9tIFwiLi9hc2NlbmRpbmcuanNcIjtcbmltcG9ydCBiaXNlY3RvciBmcm9tIFwiLi9iaXNlY3Rvci5qc1wiO1xuaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxuY29uc3QgYXNjZW5kaW5nQmlzZWN0ID0gYmlzZWN0b3IoYXNjZW5kaW5nKTtcbmV4cG9ydCBjb25zdCBiaXNlY3RSaWdodCA9IGFzY2VuZGluZ0Jpc2VjdC5yaWdodDtcbmV4cG9ydCBjb25zdCBiaXNlY3RMZWZ0ID0gYXNjZW5kaW5nQmlzZWN0LmxlZnQ7XG5leHBvcnQgY29uc3QgYmlzZWN0Q2VudGVyID0gYmlzZWN0b3IobnVtYmVyKS5jZW50ZXI7XG5leHBvcnQgZGVmYXVsdCBiaXNlY3RSaWdodDtcbiIsImV4cG9ydCBjbGFzcyBJbnRlcm5NYXAgZXh0ZW5kcyBNYXAge1xuICBjb25zdHJ1Y3RvcihlbnRyaWVzLCBrZXkgPSBrZXlvZikge1xuICAgIHN1cGVyKCk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnRpZXModGhpcywge19pbnRlcm46IHt2YWx1ZTogbmV3IE1hcCgpfSwgX2tleToge3ZhbHVlOiBrZXl9fSk7XG4gICAgaWYgKGVudHJpZXMgIT0gbnVsbCkgZm9yIChjb25zdCBba2V5LCB2YWx1ZV0gb2YgZW50cmllcykgdGhpcy5zZXQoa2V5LCB2YWx1ZSk7XG4gIH1cbiAgZ2V0KGtleSkge1xuICAgIHJldHVybiBzdXBlci5nZXQoaW50ZXJuX2dldCh0aGlzLCBrZXkpKTtcbiAgfVxuICBoYXMoa2V5KSB7XG4gICAgcmV0dXJuIHN1cGVyLmhhcyhpbnRlcm5fZ2V0KHRoaXMsIGtleSkpO1xuICB9XG4gIHNldChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLnNldChpbnRlcm5fc2V0KHRoaXMsIGtleSksIHZhbHVlKTtcbiAgfVxuICBkZWxldGUoa2V5KSB7XG4gICAgcmV0dXJuIHN1cGVyLmRlbGV0ZShpbnRlcm5fZGVsZXRlKHRoaXMsIGtleSkpO1xuICB9XG59XG5cbmV4cG9ydCBjbGFzcyBJbnRlcm5TZXQgZXh0ZW5kcyBTZXQge1xuICBjb25zdHJ1Y3Rvcih2YWx1ZXMsIGtleSA9IGtleW9mKSB7XG4gICAgc3VwZXIoKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7X2ludGVybjoge3ZhbHVlOiBuZXcgTWFwKCl9LCBfa2V5OiB7dmFsdWU6IGtleX19KTtcbiAgICBpZiAodmFsdWVzICE9IG51bGwpIGZvciAoY29uc3QgdmFsdWUgb2YgdmFsdWVzKSB0aGlzLmFkZCh2YWx1ZSk7XG4gIH1cbiAgaGFzKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmhhcyhpbnRlcm5fZ2V0KHRoaXMsIHZhbHVlKSk7XG4gIH1cbiAgYWRkKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmFkZChpbnRlcm5fc2V0KHRoaXMsIHZhbHVlKSk7XG4gIH1cbiAgZGVsZXRlKHZhbHVlKSB7XG4gICAgcmV0dXJuIHN1cGVyLmRlbGV0ZShpbnRlcm5fZGVsZXRlKHRoaXMsIHZhbHVlKSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gaW50ZXJuX2dldCh7X2ludGVybiwgX2tleX0sIHZhbHVlKSB7XG4gIGNvbnN0IGtleSA9IF9rZXkodmFsdWUpO1xuICByZXR1cm4gX2ludGVybi5oYXMoa2V5KSA/IF9pbnRlcm4uZ2V0KGtleSkgOiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gaW50ZXJuX3NldCh7X2ludGVybiwgX2tleX0sIHZhbHVlKSB7XG4gIGNvbnN0IGtleSA9IF9rZXkodmFsdWUpO1xuICBpZiAoX2ludGVybi5oYXMoa2V5KSkgcmV0dXJuIF9pbnRlcm4uZ2V0KGtleSk7XG4gIF9pbnRlcm4uc2V0KGtleSwgdmFsdWUpO1xuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGludGVybl9kZWxldGUoe19pbnRlcm4sIF9rZXl9LCB2YWx1ZSkge1xuICBjb25zdCBrZXkgPSBfa2V5KHZhbHVlKTtcbiAgaWYgKF9pbnRlcm4uaGFzKGtleSkpIHtcbiAgICB2YWx1ZSA9IF9pbnRlcm4uZ2V0KGtleSk7XG4gICAgX2ludGVybi5kZWxldGUoa2V5KTtcbiAgfVxuICByZXR1cm4gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGtleW9mKHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSAhPT0gbnVsbCAmJiB0eXBlb2YgdmFsdWUgPT09IFwib2JqZWN0XCIgPyB2YWx1ZS52YWx1ZU9mKCkgOiB2YWx1ZTtcbn1cbiIsImNvbnN0IGUxMCA9IE1hdGguc3FydCg1MCksXG4gICAgZTUgPSBNYXRoLnNxcnQoMTApLFxuICAgIGUyID0gTWF0aC5zcXJ0KDIpO1xuXG5mdW5jdGlvbiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgY29uc3Qgc3RlcCA9IChzdG9wIC0gc3RhcnQpIC8gTWF0aC5tYXgoMCwgY291bnQpLFxuICAgICAgcG93ZXIgPSBNYXRoLmZsb29yKE1hdGgubG9nMTAoc3RlcCkpLFxuICAgICAgZXJyb3IgPSBzdGVwIC8gTWF0aC5wb3coMTAsIHBvd2VyKSxcbiAgICAgIGZhY3RvciA9IGVycm9yID49IGUxMCA/IDEwIDogZXJyb3IgPj0gZTUgPyA1IDogZXJyb3IgPj0gZTIgPyAyIDogMTtcbiAgbGV0IGkxLCBpMiwgaW5jO1xuICBpZiAocG93ZXIgPCAwKSB7XG4gICAgaW5jID0gTWF0aC5wb3coMTAsIC1wb3dlcikgLyBmYWN0b3I7XG4gICAgaTEgPSBNYXRoLnJvdW5kKHN0YXJ0ICogaW5jKTtcbiAgICBpMiA9IE1hdGgucm91bmQoc3RvcCAqIGluYyk7XG4gICAgaWYgKGkxIC8gaW5jIDwgc3RhcnQpICsraTE7XG4gICAgaWYgKGkyIC8gaW5jID4gc3RvcCkgLS1pMjtcbiAgICBpbmMgPSAtaW5jO1xuICB9IGVsc2Uge1xuICAgIGluYyA9IE1hdGgucG93KDEwLCBwb3dlcikgKiBmYWN0b3I7XG4gICAgaTEgPSBNYXRoLnJvdW5kKHN0YXJ0IC8gaW5jKTtcbiAgICBpMiA9IE1hdGgucm91bmQoc3RvcCAvIGluYyk7XG4gICAgaWYgKGkxICogaW5jIDwgc3RhcnQpICsraTE7XG4gICAgaWYgKGkyICogaW5jID4gc3RvcCkgLS1pMjtcbiAgfVxuICBpZiAoaTIgPCBpMSAmJiAwLjUgPD0gY291bnQgJiYgY291bnQgPCAyKSByZXR1cm4gdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50ICogMik7XG4gIHJldHVybiBbaTEsIGkyLCBpbmNdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aWNrcyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgc3RvcCA9ICtzdG9wLCBzdGFydCA9ICtzdGFydCwgY291bnQgPSArY291bnQ7XG4gIGlmICghKGNvdW50ID4gMCkpIHJldHVybiBbXTtcbiAgaWYgKHN0YXJ0ID09PSBzdG9wKSByZXR1cm4gW3N0YXJ0XTtcbiAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydCwgW2kxLCBpMiwgaW5jXSA9IHJldmVyc2UgPyB0aWNrU3BlYyhzdG9wLCBzdGFydCwgY291bnQpIDogdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgaWYgKCEoaTIgPj0gaTEpKSByZXR1cm4gW107XG4gIGNvbnN0IG4gPSBpMiAtIGkxICsgMSwgdGlja3MgPSBuZXcgQXJyYXkobik7XG4gIGlmIChyZXZlcnNlKSB7XG4gICAgaWYgKGluYyA8IDApIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMiAtIGkpIC8gLWluYztcbiAgICBlbHNlIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMiAtIGkpICogaW5jO1xuICB9IGVsc2Uge1xuICAgIGlmIChpbmMgPCAwKSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTEgKyBpKSAvIC1pbmM7XG4gICAgZWxzZSBmb3IgKGxldCBpID0gMDsgaSA8IG47ICsraSkgdGlja3NbaV0gPSAoaTEgKyBpKSAqIGluYztcbiAgfVxuICByZXR1cm4gdGlja3M7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrSW5jcmVtZW50KHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgcmV0dXJuIHRpY2tTcGVjKHN0YXJ0LCBzdG9wLCBjb3VudClbMl07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aWNrU3RlcChzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgc3RvcCA9ICtzdG9wLCBzdGFydCA9ICtzdGFydCwgY291bnQgPSArY291bnQ7XG4gIGNvbnN0IHJldmVyc2UgPSBzdG9wIDwgc3RhcnQsIGluYyA9IHJldmVyc2UgPyB0aWNrSW5jcmVtZW50KHN0b3AsIHN0YXJ0LCBjb3VudCkgOiB0aWNrSW5jcmVtZW50KHN0YXJ0LCBzdG9wLCBjb3VudCk7XG4gIHJldHVybiAocmV2ZXJzZSA/IC0xIDogMSkgKiAoaW5jIDwgMCA/IDEgLyAtaW5jIDogaW5jKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJhbmdlKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gIHN0YXJ0ID0gK3N0YXJ0LCBzdG9wID0gK3N0b3AsIHN0ZXAgPSAobiA9IGFyZ3VtZW50cy5sZW5ndGgpIDwgMiA/IChzdG9wID0gc3RhcnQsIHN0YXJ0ID0gMCwgMSkgOiBuIDwgMyA/IDEgOiArc3RlcDtcblxuICB2YXIgaSA9IC0xLFxuICAgICAgbiA9IE1hdGgubWF4KDAsIE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApKSB8IDAsXG4gICAgICByYW5nZSA9IG5ldyBBcnJheShuKTtcblxuICB3aGlsZSAoKytpIDwgbikge1xuICAgIHJhbmdlW2ldID0gc3RhcnQgKyBpICogc3RlcDtcbiAgfVxuXG4gIHJldHVybiByYW5nZTtcbn1cbiIsInZhciBub29wID0ge3ZhbHVlOiAoKSA9PiB7fX07XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKCkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGFyZ3VtZW50cy5sZW5ndGgsIF8gPSB7fSwgdDsgaSA8IG47ICsraSkge1xuICAgIGlmICghKHQgPSBhcmd1bWVudHNbaV0gKyBcIlwiKSB8fCAodCBpbiBfKSB8fCAvW1xccy5dLy50ZXN0KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIHR5cGU6IFwiICsgdCk7XG4gICAgX1t0XSA9IFtdO1xuICB9XG4gIHJldHVybiBuZXcgRGlzcGF0Y2goXyk7XG59XG5cbmZ1bmN0aW9uIERpc3BhdGNoKF8pIHtcbiAgdGhpcy5fID0gXztcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzLCB0eXBlcykge1xuICByZXR1cm4gdHlwZW5hbWVzLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgbmFtZSA9IFwiXCIsIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIG5hbWUgPSB0LnNsaWNlKGkgKyAxKSwgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgaWYgKHQgJiYgIXR5cGVzLmhhc093blByb3BlcnR5KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdCk7XG4gICAgcmV0dXJuIHt0eXBlOiB0LCBuYW1lOiBuYW1lfTtcbiAgfSk7XG59XG5cbkRpc3BhdGNoLnByb3RvdHlwZSA9IGRpc3BhdGNoLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IERpc3BhdGNoLFxuICBvbjogZnVuY3Rpb24odHlwZW5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIF8gPSB0aGlzLl8sXG4gICAgICAgIFQgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIsIF8pLFxuICAgICAgICB0LFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSBULmxlbmd0aDtcblxuICAgIC8vIElmIG5vIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJldHVybiB0aGUgY2FsbGJhY2sgb2YgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgJiYgKHQgPSBnZXQoX1t0XSwgdHlwZW5hbWUubmFtZSkpKSByZXR1cm4gdDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiBhIHR5cGUgd2FzIHNwZWNpZmllZCwgc2V0IHRoZSBjYWxsYmFjayBmb3IgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiBhIG51bGwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmVtb3ZlIGNhbGxiYWNrcyBvZiB0aGUgZ2l2ZW4gbmFtZS5cbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlmICh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBjYWxsYmFjayk7XG4gICAgICBlbHNlIGlmIChjYWxsYmFjayA9PSBudWxsKSBmb3IgKHQgaW4gXykgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY29weTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvcHkgPSB7fSwgXyA9IHRoaXMuXztcbiAgICBmb3IgKHZhciB0IGluIF8pIGNvcHlbdF0gPSBfW3RdLnNsaWNlKCk7XG4gICAgcmV0dXJuIG5ldyBEaXNwYXRjaChjb3B5KTtcbiAgfSxcbiAgY2FsbDogZnVuY3Rpb24odHlwZSwgdGhhdCkge1xuICAgIGlmICgobiA9IGFyZ3VtZW50cy5sZW5ndGggLSAyKSA+IDApIGZvciAodmFyIGFyZ3MgPSBuZXcgQXJyYXkobiksIGkgPSAwLCBuLCB0OyBpIDwgbjsgKytpKSBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAyXTtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHR5cGUsIHRoYXQsIGFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodmFyIHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldCh0eXBlLCBuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGgsIGM7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoKGMgPSB0eXBlW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0KHR5cGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAodHlwZVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICB0eXBlW2ldID0gbm9vcCwgdHlwZSA9IHR5cGUuc2xpY2UoMCwgaSkuY29uY2F0KHR5cGUuc2xpY2UoaSArIDEpKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgdHlwZS5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogY2FsbGJhY2t9KTtcbiAgcmV0dXJuIHR5cGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRpc3BhdGNoO1xuIiwiZXhwb3J0IHZhciB4aHRtbCA9IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbFwiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHN2ZzogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLFxuICB4aHRtbDogeGh0bWwsXG4gIHhsaW5rOiBcImh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmtcIixcbiAgeG1sOiBcImh0dHA6Ly93d3cudzMub3JnL1hNTC8xOTk4L25hbWVzcGFjZVwiLFxuICB4bWxuczogXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zL1wiXG59O1xuIiwiaW1wb3J0IG5hbWVzcGFjZXMgZnJvbSBcIi4vbmFtZXNwYWNlcy5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBwcmVmaXggPSBuYW1lICs9IFwiXCIsIGkgPSBwcmVmaXguaW5kZXhPZihcIjpcIik7XG4gIGlmIChpID49IDAgJiYgKHByZWZpeCA9IG5hbWUuc2xpY2UoMCwgaSkpICE9PSBcInhtbG5zXCIpIG5hbWUgPSBuYW1lLnNsaWNlKGkgKyAxKTtcbiAgcmV0dXJuIG5hbWVzcGFjZXMuaGFzT3duUHJvcGVydHkocHJlZml4KSA/IHtzcGFjZTogbmFtZXNwYWNlc1twcmVmaXhdLCBsb2NhbDogbmFtZX0gOiBuYW1lOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXByb3RvdHlwZS1idWlsdGluc1xufVxuIiwiaW1wb3J0IG5hbWVzcGFjZSBmcm9tIFwiLi9uYW1lc3BhY2UuanNcIjtcbmltcG9ydCB7eGh0bWx9IGZyb20gXCIuL25hbWVzcGFjZXMuanNcIjtcblxuZnVuY3Rpb24gY3JlYXRvckluaGVyaXQobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRvY3VtZW50ID0gdGhpcy5vd25lckRvY3VtZW50LFxuICAgICAgICB1cmkgPSB0aGlzLm5hbWVzcGFjZVVSSTtcbiAgICByZXR1cm4gdXJpID09PSB4aHRtbCAmJiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQubmFtZXNwYWNlVVJJID09PSB4aHRtbFxuICAgICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQobmFtZSlcbiAgICAgICAgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlModXJpLCBuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY3JlYXRvckZpeGVkKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5vd25lckRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKTtcbiAgcmV0dXJuIChmdWxsbmFtZS5sb2NhbFxuICAgICAgPyBjcmVhdG9yRml4ZWRcbiAgICAgIDogY3JlYXRvckluaGVyaXQpKGZ1bGxuYW1lKTtcbn1cbiIsImZ1bmN0aW9uIG5vbmUoKSB7fVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IG5vbmUgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcbiAgfTtcbn1cbiIsImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3Rvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3QgIT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gc2VsZWN0b3Ioc2VsZWN0KTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBzdWJub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChzdWJub2RlID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSkge1xuICAgICAgICBpZiAoXCJfX2RhdGFfX1wiIGluIG5vZGUpIHN1Ym5vZGUuX19kYXRhX18gPSBub2RlLl9fZGF0YV9fO1xuICAgICAgICBzdWJncm91cFtpXSA9IHN1Ym5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsIi8vIEdpdmVuIHNvbWV0aGluZyBhcnJheSBsaWtlIChvciBudWxsKSwgcmV0dXJucyBzb21ldGhpbmcgdGhhdCBpcyBzdHJpY3RseSBhblxuLy8gYXJyYXkuIFRoaXMgaXMgdXNlZCB0byBlbnN1cmUgdGhhdCBhcnJheS1saWtlIG9iamVjdHMgcGFzc2VkIHRvIGQzLnNlbGVjdEFsbFxuLy8gb3Igc2VsZWN0aW9uLnNlbGVjdEFsbCBhcmUgY29udmVydGVkIGludG8gcHJvcGVyIGFycmF5cyB3aGVuIGNyZWF0aW5nIGFcbi8vIHNlbGVjdGlvbjsgd2UgZG9u4oCZdCBldmVyIHdhbnQgdG8gY3JlYXRlIGEgc2VsZWN0aW9uIGJhY2tlZCBieSBhIGxpdmVcbi8vIEhUTUxDb2xsZWN0aW9uIG9yIE5vZGVMaXN0LiBIb3dldmVyLCBub3RlIHRoYXQgc2VsZWN0aW9uLnNlbGVjdEFsbCB3aWxsIHVzZSBhXG4vLyBzdGF0aWMgTm9kZUxpc3QgYXMgYSBncm91cCwgc2luY2UgaXQgc2FmZWx5IGRlcml2ZWQgZnJvbSBxdWVyeVNlbGVjdG9yQWxsLlxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYXJyYXkoeCkge1xuICByZXR1cm4geCA9PSBudWxsID8gW10gOiBBcnJheS5pc0FycmF5KHgpID8geCA6IEFycmF5LmZyb20oeCk7XG59XG4iLCJmdW5jdGlvbiBlbXB0eSgpIHtcbiAgcmV0dXJuIFtdO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gc2VsZWN0b3IgPT0gbnVsbCA/IGVtcHR5IDogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucXVlcnlTZWxlY3RvckFsbChzZWxlY3Rvcik7XG4gIH07XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBhcnJheSBmcm9tIFwiLi4vYXJyYXkuanNcIjtcbmltcG9ydCBzZWxlY3RvckFsbCBmcm9tIFwiLi4vc2VsZWN0b3JBbGwuanNcIjtcblxuZnVuY3Rpb24gYXJyYXlBbGwoc2VsZWN0KSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYXJyYXkoc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgaWYgKHR5cGVvZiBzZWxlY3QgPT09IFwiZnVuY3Rpb25cIikgc2VsZWN0ID0gYXJyYXlBbGwoc2VsZWN0KTtcbiAgZWxzZSBzZWxlY3QgPSBzZWxlY3RvckFsbChzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IFtdLCBwYXJlbnRzID0gW10sIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHN1Ymdyb3Vwcy5wdXNoKHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSk7XG4gICAgICAgIHBhcmVudHMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHBhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm1hdGNoZXMoc2VsZWN0b3IpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2hpbGRNYXRjaGVyKHNlbGVjdG9yKSB7XG4gIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuIG5vZGUubWF0Y2hlcyhzZWxlY3Rvcik7XG4gIH07XG59XG5cbiIsImltcG9ydCB7Y2hpbGRNYXRjaGVyfSBmcm9tIFwiLi4vbWF0Y2hlci5qc1wiO1xuXG52YXIgZmluZCA9IEFycmF5LnByb3RvdHlwZS5maW5kO1xuXG5mdW5jdGlvbiBjaGlsZEZpbmQobWF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmaW5kLmNhbGwodGhpcy5jaGlsZHJlbiwgbWF0Y2gpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjaGlsZEZpcnN0KCkge1xuICByZXR1cm4gdGhpcy5maXJzdEVsZW1lbnRDaGlsZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KG1hdGNoID09IG51bGwgPyBjaGlsZEZpcnN0XG4gICAgICA6IGNoaWxkRmluZCh0eXBlb2YgbWF0Y2ggPT09IFwiZnVuY3Rpb25cIiA/IG1hdGNoIDogY2hpbGRNYXRjaGVyKG1hdGNoKSkpO1xufVxuIiwiaW1wb3J0IHtjaGlsZE1hdGNoZXJ9IGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbnZhciBmaWx0ZXIgPSBBcnJheS5wcm90b3R5cGUuZmlsdGVyO1xuXG5mdW5jdGlvbiBjaGlsZHJlbigpIHtcbiAgcmV0dXJuIEFycmF5LmZyb20odGhpcy5jaGlsZHJlbik7XG59XG5cbmZ1bmN0aW9uIGNoaWxkcmVuRmlsdGVyKG1hdGNoKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZmlsdGVyLmNhbGwodGhpcy5jaGlsZHJlbiwgbWF0Y2gpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3RBbGwobWF0Y2ggPT0gbnVsbCA/IGNoaWxkcmVuXG4gICAgICA6IGNoaWxkcmVuRmlsdGVyKHR5cGVvZiBtYXRjaCA9PT0gXCJmdW5jdGlvblwiID8gbWF0Y2ggOiBjaGlsZE1hdGNoZXIobWF0Y2gpKSk7XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBtYXRjaGVyIGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIGlmICh0eXBlb2YgbWF0Y2ggIT09IFwiZnVuY3Rpb25cIikgbWF0Y2ggPSBtYXRjaGVyKG1hdGNoKTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzdWJncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHN1Ymdyb3VwID0gc3ViZ3JvdXBzW2pdID0gW10sIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgbWF0Y2guY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpIHtcbiAgICAgICAgc3ViZ3JvdXAucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odXBkYXRlKSB7XG4gIHJldHVybiBuZXcgQXJyYXkodXBkYXRlLmxlbmd0aCk7XG59XG4iLCJpbXBvcnQgc3BhcnNlIGZyb20gXCIuL3NwYXJzZS5qc1wiO1xuaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9lbnRlciB8fCB0aGlzLl9ncm91cHMubWFwKHNwYXJzZSksIHRoaXMuX3BhcmVudHMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gRW50ZXJOb2RlKHBhcmVudCwgZGF0dW0pIHtcbiAgdGhpcy5vd25lckRvY3VtZW50ID0gcGFyZW50Lm93bmVyRG9jdW1lbnQ7XG4gIHRoaXMubmFtZXNwYWNlVVJJID0gcGFyZW50Lm5hbWVzcGFjZVVSSTtcbiAgdGhpcy5fbmV4dCA9IG51bGw7XG4gIHRoaXMuX3BhcmVudCA9IHBhcmVudDtcbiAgdGhpcy5fX2RhdGFfXyA9IGRhdHVtO1xufVxuXG5FbnRlck5vZGUucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRW50ZXJOb2RlLFxuICBhcHBlbmRDaGlsZDogZnVuY3Rpb24oY2hpbGQpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIHRoaXMuX25leHQpOyB9LFxuICBpbnNlcnRCZWZvcmU6IGZ1bmN0aW9uKGNoaWxkLCBuZXh0KSB7IHJldHVybiB0aGlzLl9wYXJlbnQuaW5zZXJ0QmVmb3JlKGNoaWxkLCBuZXh0KTsgfSxcbiAgcXVlcnlTZWxlY3RvcjogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTsgfSxcbiAgcXVlcnlTZWxlY3RvckFsbDogZnVuY3Rpb24oc2VsZWN0b3IpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTsgfVxufTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQge0VudGVyTm9kZX0gZnJvbSBcIi4vZW50ZXIuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi4vY29uc3RhbnQuanNcIjtcblxuZnVuY3Rpb24gYmluZEluZGV4KHBhcmVudCwgZ3JvdXAsIGVudGVyLCB1cGRhdGUsIGV4aXQsIGRhdGEpIHtcbiAgdmFyIGkgPSAwLFxuICAgICAgbm9kZSxcbiAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgZGF0YUxlbmd0aCA9IGRhdGEubGVuZ3RoO1xuXG4gIC8vIFB1dCBhbnkgbm9uLW51bGwgbm9kZXMgdGhhdCBmaXQgaW50byB1cGRhdGUuXG4gIC8vIFB1dCBhbnkgbnVsbCBub2RlcyBpbnRvIGVudGVyLlxuICAvLyBQdXQgYW55IHJlbWFpbmluZyBkYXRhIGludG8gZW50ZXIuXG4gIGZvciAoOyBpIDwgZGF0YUxlbmd0aDsgKytpKSB7XG4gICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBQdXQgYW55IG5vbi1udWxsIG5vZGVzIHRoYXQgZG9u4oCZdCBmaXQgaW50byBleGl0LlxuICBmb3IgKDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBleGl0W2ldID0gbm9kZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gYmluZEtleShwYXJlbnQsIGdyb3VwLCBlbnRlciwgdXBkYXRlLCBleGl0LCBkYXRhLCBrZXkpIHtcbiAgdmFyIGksXG4gICAgICBub2RlLFxuICAgICAgbm9kZUJ5S2V5VmFsdWUgPSBuZXcgTWFwLFxuICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICBrZXlWYWx1ZXMgPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpLFxuICAgICAga2V5VmFsdWU7XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIG5vZGUuXG4gIC8vIElmIG11bHRpcGxlIG5vZGVzIGhhdmUgdGhlIHNhbWUga2V5LCB0aGUgZHVwbGljYXRlcyBhcmUgYWRkZWQgdG8gZXhpdC5cbiAgZm9yIChpID0gMDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBrZXlWYWx1ZXNbaV0gPSBrZXlWYWx1ZSA9IGtleS5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSArIFwiXCI7XG4gICAgICBpZiAobm9kZUJ5S2V5VmFsdWUuaGFzKGtleVZhbHVlKSkge1xuICAgICAgICBleGl0W2ldID0gbm9kZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vZGVCeUtleVZhbHVlLnNldChrZXlWYWx1ZSwgbm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gQ29tcHV0ZSB0aGUga2V5IGZvciBlYWNoIGRhdHVtLlxuICAvLyBJZiB0aGVyZSBhIG5vZGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMga2V5LCBqb2luIGFuZCBhZGQgaXQgdG8gdXBkYXRlLlxuICAvLyBJZiB0aGVyZSBpcyBub3QgKG9yIHRoZSBrZXkgaXMgYSBkdXBsaWNhdGUpLCBhZGQgaXQgdG8gZW50ZXIuXG4gIGZvciAoaSA9IDA7IGkgPCBkYXRhTGVuZ3RoOyArK2kpIHtcbiAgICBrZXlWYWx1ZSA9IGtleS5jYWxsKHBhcmVudCwgZGF0YVtpXSwgaSwgZGF0YSkgKyBcIlwiO1xuICAgIGlmIChub2RlID0gbm9kZUJ5S2V5VmFsdWUuZ2V0KGtleVZhbHVlKSkge1xuICAgICAgdXBkYXRlW2ldID0gbm9kZTtcbiAgICAgIG5vZGUuX19kYXRhX18gPSBkYXRhW2ldO1xuICAgICAgbm9kZUJ5S2V5VmFsdWUuZGVsZXRlKGtleVZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZW50ZXJbaV0gPSBuZXcgRW50ZXJOb2RlKHBhcmVudCwgZGF0YVtpXSk7XG4gICAgfVxuICB9XG5cbiAgLy8gQWRkIGFueSByZW1haW5pbmcgbm9kZXMgdGhhdCB3ZXJlIG5vdCBib3VuZCB0byBkYXRhIHRvIGV4aXQuXG4gIGZvciAoaSA9IDA7IGkgPCBncm91cExlbmd0aDsgKytpKSB7XG4gICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIChub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWVzW2ldKSA9PT0gbm9kZSkpIHtcbiAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBkYXR1bShub2RlKSB7XG4gIHJldHVybiBub2RlLl9fZGF0YV9fO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIEFycmF5LmZyb20odGhpcywgZGF0dW0pO1xuXG4gIHZhciBiaW5kID0ga2V5ID8gYmluZEtleSA6IGJpbmRJbmRleCxcbiAgICAgIHBhcmVudHMgPSB0aGlzLl9wYXJlbnRzLFxuICAgICAgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzO1xuXG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdmFsdWUgPSBjb25zdGFudCh2YWx1ZSk7XG5cbiAgZm9yICh2YXIgbSA9IGdyb3Vwcy5sZW5ndGgsIHVwZGF0ZSA9IG5ldyBBcnJheShtKSwgZW50ZXIgPSBuZXcgQXJyYXkobSksIGV4aXQgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgdmFyIHBhcmVudCA9IHBhcmVudHNbal0sXG4gICAgICAgIGdyb3VwID0gZ3JvdXBzW2pdLFxuICAgICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgICAgZGF0YSA9IGFycmF5bGlrZSh2YWx1ZS5jYWxsKHBhcmVudCwgcGFyZW50ICYmIHBhcmVudC5fX2RhdGFfXywgaiwgcGFyZW50cykpLFxuICAgICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGgsXG4gICAgICAgIGVudGVyR3JvdXAgPSBlbnRlcltqXSA9IG5ldyBBcnJheShkYXRhTGVuZ3RoKSxcbiAgICAgICAgdXBkYXRlR3JvdXAgPSB1cGRhdGVbal0gPSBuZXcgQXJyYXkoZGF0YUxlbmd0aCksXG4gICAgICAgIGV4aXRHcm91cCA9IGV4aXRbal0gPSBuZXcgQXJyYXkoZ3JvdXBMZW5ndGgpO1xuXG4gICAgYmluZChwYXJlbnQsIGdyb3VwLCBlbnRlckdyb3VwLCB1cGRhdGVHcm91cCwgZXhpdEdyb3VwLCBkYXRhLCBrZXkpO1xuXG4gICAgLy8gTm93IGNvbm5lY3QgdGhlIGVudGVyIG5vZGVzIHRvIHRoZWlyIGZvbGxvd2luZyB1cGRhdGUgbm9kZSwgc3VjaCB0aGF0XG4gICAgLy8gYXBwZW5kQ2hpbGQgY2FuIGluc2VydCB0aGUgbWF0ZXJpYWxpemVkIGVudGVyIG5vZGUgYmVmb3JlIHRoaXMgbm9kZSxcbiAgICAvLyByYXRoZXIgdGhhbiBhdCB0aGUgZW5kIG9mIHRoZSBwYXJlbnQgbm9kZS5cbiAgICBmb3IgKHZhciBpMCA9IDAsIGkxID0gMCwgcHJldmlvdXMsIG5leHQ7IGkwIDwgZGF0YUxlbmd0aDsgKytpMCkge1xuICAgICAgaWYgKHByZXZpb3VzID0gZW50ZXJHcm91cFtpMF0pIHtcbiAgICAgICAgaWYgKGkwID49IGkxKSBpMSA9IGkwICsgMTtcbiAgICAgICAgd2hpbGUgKCEobmV4dCA9IHVwZGF0ZUdyb3VwW2kxXSkgJiYgKytpMSA8IGRhdGFMZW5ndGgpO1xuICAgICAgICBwcmV2aW91cy5fbmV4dCA9IG5leHQgfHwgbnVsbDtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICB1cGRhdGUgPSBuZXcgU2VsZWN0aW9uKHVwZGF0ZSwgcGFyZW50cyk7XG4gIHVwZGF0ZS5fZW50ZXIgPSBlbnRlcjtcbiAgdXBkYXRlLl9leGl0ID0gZXhpdDtcbiAgcmV0dXJuIHVwZGF0ZTtcbn1cblxuLy8gR2l2ZW4gc29tZSBkYXRhLCB0aGlzIHJldHVybnMgYW4gYXJyYXktbGlrZSB2aWV3IG9mIGl0OiBhbiBvYmplY3QgdGhhdFxuLy8gZXhwb3NlcyBhIGxlbmd0aCBwcm9wZXJ0eSBhbmQgYWxsb3dzIG51bWVyaWMgaW5kZXhpbmcuIE5vdGUgdGhhdCB1bmxpa2Vcbi8vIHNlbGVjdEFsbCwgdGhpcyBpc27igJl0IHdvcnJpZWQgYWJvdXQg4oCcbGl2ZeKAnSBjb2xsZWN0aW9ucyBiZWNhdXNlIHRoZSByZXN1bHRpbmdcbi8vIGFycmF5IHdpbGwgb25seSBiZSB1c2VkIGJyaWVmbHkgd2hpbGUgZGF0YSBpcyBiZWluZyBib3VuZC4gKEl0IGlzIHBvc3NpYmxlIHRvXG4vLyBjYXVzZSB0aGUgZGF0YSB0byBjaGFuZ2Ugd2hpbGUgaXRlcmF0aW5nIGJ5IHVzaW5nIGEga2V5IGZ1bmN0aW9uLCBidXQgcGxlYXNlXG4vLyBkb27igJl0OyB3ZeKAmWQgcmF0aGVyIGF2b2lkIGEgZ3JhdHVpdG91cyBjb3B5LilcbmZ1bmN0aW9uIGFycmF5bGlrZShkYXRhKSB7XG4gIHJldHVybiB0eXBlb2YgZGF0YSA9PT0gXCJvYmplY3RcIiAmJiBcImxlbmd0aFwiIGluIGRhdGFcbiAgICA/IGRhdGEgLy8gQXJyYXksIFR5cGVkQXJyYXksIE5vZGVMaXN0LCBhcnJheS1saWtlXG4gICAgOiBBcnJheS5mcm9tKGRhdGEpOyAvLyBNYXAsIFNldCwgaXRlcmFibGUsIHN0cmluZywgb3IgYW55dGhpbmcgZWxzZVxufVxuIiwiaW1wb3J0IHNwYXJzZSBmcm9tIFwiLi9zcGFyc2UuanNcIjtcbmltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZXhpdCB8fCB0aGlzLl9ncm91cHMubWFwKHNwYXJzZSksIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24ob25lbnRlciwgb251cGRhdGUsIG9uZXhpdCkge1xuICB2YXIgZW50ZXIgPSB0aGlzLmVudGVyKCksIHVwZGF0ZSA9IHRoaXMsIGV4aXQgPSB0aGlzLmV4aXQoKTtcbiAgaWYgKHR5cGVvZiBvbmVudGVyID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBlbnRlciA9IG9uZW50ZXIoZW50ZXIpO1xuICAgIGlmIChlbnRlcikgZW50ZXIgPSBlbnRlci5zZWxlY3Rpb24oKTtcbiAgfSBlbHNlIHtcbiAgICBlbnRlciA9IGVudGVyLmFwcGVuZChvbmVudGVyICsgXCJcIik7XG4gIH1cbiAgaWYgKG9udXBkYXRlICE9IG51bGwpIHtcbiAgICB1cGRhdGUgPSBvbnVwZGF0ZSh1cGRhdGUpO1xuICAgIGlmICh1cGRhdGUpIHVwZGF0ZSA9IHVwZGF0ZS5zZWxlY3Rpb24oKTtcbiAgfVxuICBpZiAob25leGl0ID09IG51bGwpIGV4aXQucmVtb3ZlKCk7IGVsc2Ugb25leGl0KGV4aXQpO1xuICByZXR1cm4gZW50ZXIgJiYgdXBkYXRlID8gZW50ZXIubWVyZ2UodXBkYXRlKS5vcmRlcigpIDogdXBkYXRlO1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgdmFyIHNlbGVjdGlvbiA9IGNvbnRleHQuc2VsZWN0aW9uID8gY29udGV4dC5zZWxlY3Rpb24oKSA6IGNvbnRleHQ7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHNlbGVjdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihtZXJnZXMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gLTEsIG0gPSBncm91cHMubGVuZ3RoOyArK2ogPCBtOykge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gZ3JvdXAubGVuZ3RoIC0gMSwgbmV4dCA9IGdyb3VwW2ldLCBub2RlOyAtLWkgPj0gMDspIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgaWYgKG5leHQgJiYgbm9kZS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihuZXh0KSBeIDQpIG5leHQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobm9kZSwgbmV4dCk7XG4gICAgICAgIG5leHQgPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbXBhcmUpIHtcbiAgaWYgKCFjb21wYXJlKSBjb21wYXJlID0gYXNjZW5kaW5nO1xuXG4gIGZ1bmN0aW9uIGNvbXBhcmVOb2RlKGEsIGIpIHtcbiAgICByZXR1cm4gYSAmJiBiID8gY29tcGFyZShhLl9fZGF0YV9fLCBiLl9fZGF0YV9fKSA6ICFhIC0gIWI7XG4gIH1cblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBzb3J0Z3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzb3J0Z3JvdXAgPSBzb3J0Z3JvdXBzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzb3J0Z3JvdXBbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgICBzb3J0Z3JvdXAuc29ydChjb21wYXJlTm9kZSk7XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzb3J0Z3JvdXBzLCB0aGlzLl9wYXJlbnRzKS5vcmRlcigpO1xufVxuXG5mdW5jdGlvbiBhc2NlbmRpbmcoYSwgYikge1xuICByZXR1cm4gYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IGEgPj0gYiA/IDAgOiBOYU47XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgdmFyIGNhbGxiYWNrID0gYXJndW1lbnRzWzBdO1xuICBhcmd1bWVudHNbMF0gPSB0aGlzO1xuICBjYWxsYmFjay5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICByZXR1cm4gdGhpcztcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICB2YXIgbm9kZSA9IGdyb3VwW2ldO1xuICAgICAgaWYgKG5vZGUpIHJldHVybiBub2RlO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIGxldCBzaXplID0gMDtcbiAgZm9yIChjb25zdCBub2RlIG9mIHRoaXMpICsrc2l6ZTsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby11bnVzZWQtdmFyc1xuICByZXR1cm4gc2l6ZTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gIXRoaXMubm9kZSgpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY2FsbGJhY2spIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAwLCBtID0gZ3JvdXBzLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBpID0gMCwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkgY2FsbGJhY2suY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuLi9uYW1lc3BhY2UuanNcIjtcblxuZnVuY3Rpb24gYXR0clJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clJlbW92ZU5TKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudChuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdmFsdWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnROUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2YWx1ZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIGVsc2UgdGhpcy5zZXRBdHRyaWJ1dGUobmFtZSwgdik7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbk5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBlbHNlIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCB2KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciBub2RlID0gdGhpcy5ub2RlKCk7XG4gICAgcmV0dXJuIGZ1bGxuYW1lLmxvY2FsXG4gICAgICAgID8gbm9kZS5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpXG4gICAgICAgIDogbm9kZS5nZXRBdHRyaWJ1dGUoZnVsbG5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZWFjaCgodmFsdWUgPT0gbnVsbFxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyUmVtb3ZlTlMgOiBhdHRyUmVtb3ZlKSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyRnVuY3Rpb25OUyA6IGF0dHJGdW5jdGlvbilcbiAgICAgIDogKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckNvbnN0YW50TlMgOiBhdHRyQ29uc3RhbnQpKSkoZnVsbG5hbWUsIHZhbHVlKSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlKSB7XG4gIHJldHVybiAobm9kZS5vd25lckRvY3VtZW50ICYmIG5vZGUub3duZXJEb2N1bWVudC5kZWZhdWx0VmlldykgLy8gbm9kZSBpcyBhIE5vZGVcbiAgICAgIHx8IChub2RlLmRvY3VtZW50ICYmIG5vZGUpIC8vIG5vZGUgaXMgYSBXaW5kb3dcbiAgICAgIHx8IG5vZGUuZGVmYXVsdFZpZXc7IC8vIG5vZGUgaXMgYSBEb2N1bWVudFxufVxuIiwiaW1wb3J0IGRlZmF1bHRWaWV3IGZyb20gXCIuLi93aW5kb3cuanNcIjtcblxuZnVuY3Rpb24gc3R5bGVSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVDb25zdGFudChuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgdmFsdWUsIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVGdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICAgIGVsc2UgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2LCBwcmlvcml0eSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgICA/IHN0eWxlUmVtb3ZlIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICAgID8gc3R5bGVGdW5jdGlvblxuICAgICAgICAgICAgOiBzdHlsZUNvbnN0YW50KShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkgPT0gbnVsbCA/IFwiXCIgOiBwcmlvcml0eSkpXG4gICAgICA6IHN0eWxlVmFsdWUodGhpcy5ub2RlKCksIG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3R5bGVWYWx1ZShub2RlLCBuYW1lKSB7XG4gIHJldHVybiBub2RlLnN0eWxlLmdldFByb3BlcnR5VmFsdWUobmFtZSlcbiAgICAgIHx8IGRlZmF1bHRWaWV3KG5vZGUpLmdldENvbXB1dGVkU3R5bGUobm9kZSwgbnVsbCkuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKTtcbn1cbiIsImZ1bmN0aW9uIHByb3BlcnR5UmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIGRlbGV0ZSB0aGlzW25hbWVdO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwcm9wZXJ0eUNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzW25hbWVdID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5RnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciB2ID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAodiA9PSBudWxsKSBkZWxldGUgdGhpc1tuYW1lXTtcbiAgICBlbHNlIHRoaXNbbmFtZV0gPSB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA+IDFcbiAgICAgID8gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBwcm9wZXJ0eVJlbW92ZSA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBwcm9wZXJ0eUZ1bmN0aW9uXG4gICAgICAgICAgOiBwcm9wZXJ0eUNvbnN0YW50KShuYW1lLCB2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpW25hbWVdO1xufVxuIiwiZnVuY3Rpb24gY2xhc3NBcnJheShzdHJpbmcpIHtcbiAgcmV0dXJuIHN0cmluZy50cmltKCkuc3BsaXQoL158XFxzKy8pO1xufVxuXG5mdW5jdGlvbiBjbGFzc0xpc3Qobm9kZSkge1xuICByZXR1cm4gbm9kZS5jbGFzc0xpc3QgfHwgbmV3IENsYXNzTGlzdChub2RlKTtcbn1cblxuZnVuY3Rpb24gQ2xhc3NMaXN0KG5vZGUpIHtcbiAgdGhpcy5fbm9kZSA9IG5vZGU7XG4gIHRoaXMuX25hbWVzID0gY2xhc3NBcnJheShub2RlLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpIHx8IFwiXCIpO1xufVxuXG5DbGFzc0xpc3QucHJvdG90eXBlID0ge1xuICBhZGQ6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPCAwKSB7XG4gICAgICB0aGlzLl9uYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgaSA9IHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgaWYgKGkgPj0gMCkge1xuICAgICAgdGhpcy5fbmFtZXMuc3BsaWNlKGksIDEpO1xuICAgICAgdGhpcy5fbm9kZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCB0aGlzLl9uYW1lcy5qb2luKFwiIFwiKSk7XG4gICAgfVxuICB9LFxuICBjb250YWluczogZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLl9uYW1lcy5pbmRleE9mKG5hbWUpID49IDA7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGNsYXNzZWRBZGQobm9kZSwgbmFtZXMpIHtcbiAgdmFyIGxpc3QgPSBjbGFzc0xpc3Qobm9kZSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgd2hpbGUgKCsraSA8IG4pIGxpc3QuYWRkKG5hbWVzW2ldKTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZFJlbW92ZShub2RlLCBuYW1lcykge1xuICB2YXIgbGlzdCA9IGNsYXNzTGlzdChub2RlKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbikgbGlzdC5yZW1vdmUobmFtZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkVHJ1ZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZEFkZCh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGYWxzZShuYW1lcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgY2xhc3NlZFJlbW92ZSh0aGlzLCBuYW1lcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRGdW5jdGlvbihuYW1lcywgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICh2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpID8gY2xhc3NlZEFkZCA6IGNsYXNzZWRSZW1vdmUpKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIG5hbWVzID0gY2xhc3NBcnJheShuYW1lICsgXCJcIik7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIGxpc3QgPSBjbGFzc0xpc3QodGhpcy5ub2RlKCkpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gICAgd2hpbGUgKCsraSA8IG4pIGlmICghbGlzdC5jb250YWlucyhuYW1lc1tpXSkpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGNsYXNzZWRGdW5jdGlvbiA6IHZhbHVlXG4gICAgICA/IGNsYXNzZWRUcnVlXG4gICAgICA6IGNsYXNzZWRGYWxzZSkobmFtZXMsIHZhbHVlKSk7XG59XG4iLCJmdW5jdGlvbiB0ZXh0UmVtb3ZlKCkge1xuICB0aGlzLnRleHRDb250ZW50ID0gXCJcIjtcbn1cblxuZnVuY3Rpb24gdGV4dENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IHRleHRSZW1vdmUgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IHRleHRGdW5jdGlvblxuICAgICAgICAgIDogdGV4dENvbnN0YW50KSh2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpLnRleHRDb250ZW50O1xufVxuIiwiZnVuY3Rpb24gaHRtbFJlbW92ZSgpIHtcbiAgdGhpcy5pbm5lckhUTUwgPSBcIlwiO1xufVxuXG5mdW5jdGlvbiBodG1sQ29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGh0bWxGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIHRoaXMuaW5uZXJIVE1MID0gdiA9PSBudWxsID8gXCJcIiA6IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCh2YWx1ZSA9PSBudWxsXG4gICAgICAgICAgPyBodG1sUmVtb3ZlIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBodG1sRnVuY3Rpb25cbiAgICAgICAgICA6IGh0bWxDb25zdGFudCkodmFsdWUpKVxuICAgICAgOiB0aGlzLm5vZGUoKS5pbm5lckhUTUw7XG59XG4iLCJmdW5jdGlvbiByYWlzZSgpIHtcbiAgaWYgKHRoaXMubmV4dFNpYmxpbmcpIHRoaXMucGFyZW50Tm9kZS5hcHBlbmRDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmFpc2UpO1xufVxuIiwiZnVuY3Rpb24gbG93ZXIoKSB7XG4gIGlmICh0aGlzLnByZXZpb3VzU2libGluZykgdGhpcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZSh0aGlzLCB0aGlzLnBhcmVudE5vZGUuZmlyc3RDaGlsZCk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKGxvd2VyKTtcbn1cbiIsImltcG9ydCBjcmVhdG9yIGZyb20gXCIuLi9jcmVhdG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmFwcGVuZENoaWxkKGNyZWF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgY3JlYXRvciBmcm9tIFwiLi4vY3JlYXRvci5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yIGZyb20gXCIuLi9zZWxlY3Rvci5qc1wiO1xuXG5mdW5jdGlvbiBjb25zdGFudE51bGwoKSB7XG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCBiZWZvcmUpIHtcbiAgdmFyIGNyZWF0ZSA9IHR5cGVvZiBuYW1lID09PSBcImZ1bmN0aW9uXCIgPyBuYW1lIDogY3JlYXRvcihuYW1lKSxcbiAgICAgIHNlbGVjdCA9IGJlZm9yZSA9PSBudWxsID8gY29uc3RhbnROdWxsIDogdHlwZW9mIGJlZm9yZSA9PT0gXCJmdW5jdGlvblwiID8gYmVmb3JlIDogc2VsZWN0b3IoYmVmb3JlKTtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmluc2VydEJlZm9yZShjcmVhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKSwgc2VsZWN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgfHwgbnVsbCk7XG4gIH0pO1xufVxuIiwiZnVuY3Rpb24gcmVtb3ZlKCkge1xuICB2YXIgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICBpZiAocGFyZW50KSBwYXJlbnQucmVtb3ZlQ2hpbGQodGhpcyk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5lYWNoKHJlbW92ZSk7XG59XG4iLCJmdW5jdGlvbiBzZWxlY3Rpb25fY2xvbmVTaGFsbG93KCkge1xuICB2YXIgY2xvbmUgPSB0aGlzLmNsb25lTm9kZShmYWxzZSksIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgcmV0dXJuIHBhcmVudCA/IHBhcmVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMubmV4dFNpYmxpbmcpIDogY2xvbmU7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbl9jbG9uZURlZXAoKSB7XG4gIHZhciBjbG9uZSA9IHRoaXMuY2xvbmVOb2RlKHRydWUpLCBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIHJldHVybiBwYXJlbnQgPyBwYXJlbnQuaW5zZXJ0QmVmb3JlKGNsb25lLCB0aGlzLm5leHRTaWJsaW5nKSA6IGNsb25lO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihkZWVwKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdChkZWVwID8gc2VsZWN0aW9uX2Nsb25lRGVlcCA6IHNlbGVjdGlvbl9jbG9uZVNoYWxsb3cpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5wcm9wZXJ0eShcIl9fZGF0YV9fXCIsIHZhbHVlKVxuICAgICAgOiB0aGlzLm5vZGUoKS5fX2RhdGFfXztcbn1cbiIsImZ1bmN0aW9uIGNvbnRleHRMaXN0ZW5lcihsaXN0ZW5lcikge1xuICByZXR1cm4gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBsaXN0ZW5lci5jYWxsKHRoaXMsIGV2ZW50LCB0aGlzLl9fZGF0YV9fKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuZnVuY3Rpb24gb25SZW1vdmUodHlwZW5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBvbiA9IHRoaXMuX19vbjtcbiAgICBpZiAoIW9uKSByZXR1cm47XG4gICAgZm9yICh2YXIgaiA9IDAsIGkgPSAtMSwgbSA9IG9uLmxlbmd0aCwgbzsgaiA8IG07ICsraikge1xuICAgICAgaWYgKG8gPSBvbltqXSwgKCF0eXBlbmFtZS50eXBlIHx8IG8udHlwZSA9PT0gdHlwZW5hbWUudHlwZSkgJiYgby5uYW1lID09PSB0eXBlbmFtZS5uYW1lKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIsIG8ub3B0aW9ucyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvblsrK2ldID0gbztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCsraSkgb24ubGVuZ3RoID0gaTtcbiAgICBlbHNlIGRlbGV0ZSB0aGlzLl9fb247XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9uQWRkKHR5cGVuYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uID0gdGhpcy5fX29uLCBvLCBsaXN0ZW5lciA9IGNvbnRleHRMaXN0ZW5lcih2YWx1ZSk7XG4gICAgaWYgKG9uKSBmb3IgKHZhciBqID0gMCwgbSA9IG9uLmxlbmd0aDsgaiA8IG07ICsraikge1xuICAgICAgaWYgKChvID0gb25bal0pLnR5cGUgPT09IHR5cGVuYW1lLnR5cGUgJiYgby5uYW1lID09PSB0eXBlbmFtZS5uYW1lKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIsIG8ub3B0aW9ucyk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcihvLnR5cGUsIG8ubGlzdGVuZXIgPSBsaXN0ZW5lciwgby5vcHRpb25zID0gb3B0aW9ucyk7XG4gICAgICAgIG8udmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmFkZEV2ZW50TGlzdGVuZXIodHlwZW5hbWUudHlwZSwgbGlzdGVuZXIsIG9wdGlvbnMpO1xuICAgIG8gPSB7dHlwZTogdHlwZW5hbWUudHlwZSwgbmFtZTogdHlwZW5hbWUubmFtZSwgdmFsdWU6IHZhbHVlLCBsaXN0ZW5lcjogbGlzdGVuZXIsIG9wdGlvbnM6IG9wdGlvbnN9O1xuICAgIGlmICghb24pIHRoaXMuX19vbiA9IFtvXTtcbiAgICBlbHNlIG9uLnB1c2gobyk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHR5cGVuYW1lLCB2YWx1ZSwgb3B0aW9ucykge1xuICB2YXIgdHlwZW5hbWVzID0gcGFyc2VUeXBlbmFtZXModHlwZW5hbWUgKyBcIlwiKSwgaSwgbiA9IHR5cGVuYW1lcy5sZW5ndGgsIHQ7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIG9uID0gdGhpcy5ub2RlKCkuX19vbjtcbiAgICBpZiAob24pIGZvciAodmFyIGogPSAwLCBtID0gb24ubGVuZ3RoLCBvOyBqIDwgbTsgKytqKSB7XG4gICAgICBmb3IgKGkgPSAwLCBvID0gb25bal07IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKCh0ID0gdHlwZW5hbWVzW2ldKS50eXBlID09PSBvLnR5cGUgJiYgdC5uYW1lID09PSBvLm5hbWUpIHtcbiAgICAgICAgICByZXR1cm4gby52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm47XG4gIH1cblxuICBvbiA9IHZhbHVlID8gb25BZGQgOiBvblJlbW92ZTtcbiAgZm9yIChpID0gMDsgaSA8IG47ICsraSkgdGhpcy5lYWNoKG9uKHR5cGVuYW1lc1tpXSwgdmFsdWUsIG9wdGlvbnMpKTtcbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQgZGVmYXVsdFZpZXcgZnJvbSBcIi4uL3dpbmRvdy5qc1wiO1xuXG5mdW5jdGlvbiBkaXNwYXRjaEV2ZW50KG5vZGUsIHR5cGUsIHBhcmFtcykge1xuICB2YXIgd2luZG93ID0gZGVmYXVsdFZpZXcobm9kZSksXG4gICAgICBldmVudCA9IHdpbmRvdy5DdXN0b21FdmVudDtcblxuICBpZiAodHlwZW9mIGV2ZW50ID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICBldmVudCA9IG5ldyBldmVudCh0eXBlLCBwYXJhbXMpO1xuICB9IGVsc2Uge1xuICAgIGV2ZW50ID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiRXZlbnRcIik7XG4gICAgaWYgKHBhcmFtcykgZXZlbnQuaW5pdEV2ZW50KHR5cGUsIHBhcmFtcy5idWJibGVzLCBwYXJhbXMuY2FuY2VsYWJsZSksIGV2ZW50LmRldGFpbCA9IHBhcmFtcy5kZXRhaWw7XG4gICAgZWxzZSBldmVudC5pbml0RXZlbnQodHlwZSwgZmFsc2UsIGZhbHNlKTtcbiAgfVxuXG4gIG5vZGUuZGlzcGF0Y2hFdmVudChldmVudCk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoQ29uc3RhbnQodHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkaXNwYXRjaEZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGRpc3BhdGNoRXZlbnQodGhpcywgdHlwZSwgcGFyYW1zLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaCgodHlwZW9mIHBhcmFtcyA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IGRpc3BhdGNoRnVuY3Rpb25cbiAgICAgIDogZGlzcGF0Y2hDb25zdGFudCkodHlwZSwgcGFyYW1zKSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiooKSB7XG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB5aWVsZCBub2RlO1xuICAgIH1cbiAgfVxufVxuIiwiaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3QgZnJvbSBcIi4vc2VsZWN0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NlbGVjdEFsbCBmcm9tIFwiLi9zZWxlY3RBbGwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0Q2hpbGQgZnJvbSBcIi4vc2VsZWN0Q2hpbGQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0Q2hpbGRyZW4gZnJvbSBcIi4vc2VsZWN0Q2hpbGRyZW4uanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZmlsdGVyIGZyb20gXCIuL2ZpbHRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kYXRhIGZyb20gXCIuL2RhdGEuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZW50ZXIgZnJvbSBcIi4vZW50ZXIuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZXhpdCBmcm9tIFwiLi9leGl0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2pvaW4gZnJvbSBcIi4vam9pbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9tZXJnZSBmcm9tIFwiLi9tZXJnZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9vcmRlciBmcm9tIFwiLi9vcmRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zb3J0IGZyb20gXCIuL3NvcnQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fY2FsbCBmcm9tIFwiLi9jYWxsLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX25vZGVzIGZyb20gXCIuL25vZGVzLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX25vZGUgZnJvbSBcIi4vbm9kZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zaXplIGZyb20gXCIuL3NpemUuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZW1wdHkgZnJvbSBcIi4vZW1wdHkuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fZWFjaCBmcm9tIFwiLi9lYWNoLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2F0dHIgZnJvbSBcIi4vYXR0ci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zdHlsZSBmcm9tIFwiLi9zdHlsZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9wcm9wZXJ0eSBmcm9tIFwiLi9wcm9wZXJ0eS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jbGFzc2VkIGZyb20gXCIuL2NsYXNzZWQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fdGV4dCBmcm9tIFwiLi90ZXh0LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2h0bWwgZnJvbSBcIi4vaHRtbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9yYWlzZSBmcm9tIFwiLi9yYWlzZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9sb3dlciBmcm9tIFwiLi9sb3dlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9hcHBlbmQgZnJvbSBcIi4vYXBwZW5kLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2luc2VydCBmcm9tIFwiLi9pbnNlcnQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fcmVtb3ZlIGZyb20gXCIuL3JlbW92ZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jbG9uZSBmcm9tIFwiLi9jbG9uZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kYXR1bSBmcm9tIFwiLi9kYXR1bS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9vbiBmcm9tIFwiLi9vbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9kaXNwYXRjaCBmcm9tIFwiLi9kaXNwYXRjaC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9pdGVyYXRvciBmcm9tIFwiLi9pdGVyYXRvci5qc1wiO1xuXG5leHBvcnQgdmFyIHJvb3QgPSBbbnVsbF07XG5cbmV4cG9ydCBmdW5jdGlvbiBTZWxlY3Rpb24oZ3JvdXBzLCBwYXJlbnRzKSB7XG4gIHRoaXMuX2dyb3VwcyA9IGdyb3VwcztcbiAgdGhpcy5fcGFyZW50cyA9IHBhcmVudHM7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24oW1tkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdXSwgcm9vdCk7XG59XG5cbmZ1bmN0aW9uIHNlbGVjdGlvbl9zZWxlY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzO1xufVxuXG5TZWxlY3Rpb24ucHJvdG90eXBlID0gc2VsZWN0aW9uLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFNlbGVjdGlvbixcbiAgc2VsZWN0OiBzZWxlY3Rpb25fc2VsZWN0LFxuICBzZWxlY3RBbGw6IHNlbGVjdGlvbl9zZWxlY3RBbGwsXG4gIHNlbGVjdENoaWxkOiBzZWxlY3Rpb25fc2VsZWN0Q2hpbGQsXG4gIHNlbGVjdENoaWxkcmVuOiBzZWxlY3Rpb25fc2VsZWN0Q2hpbGRyZW4sXG4gIGZpbHRlcjogc2VsZWN0aW9uX2ZpbHRlcixcbiAgZGF0YTogc2VsZWN0aW9uX2RhdGEsXG4gIGVudGVyOiBzZWxlY3Rpb25fZW50ZXIsXG4gIGV4aXQ6IHNlbGVjdGlvbl9leGl0LFxuICBqb2luOiBzZWxlY3Rpb25fam9pbixcbiAgbWVyZ2U6IHNlbGVjdGlvbl9tZXJnZSxcbiAgc2VsZWN0aW9uOiBzZWxlY3Rpb25fc2VsZWN0aW9uLFxuICBvcmRlcjogc2VsZWN0aW9uX29yZGVyLFxuICBzb3J0OiBzZWxlY3Rpb25fc29ydCxcbiAgY2FsbDogc2VsZWN0aW9uX2NhbGwsXG4gIG5vZGVzOiBzZWxlY3Rpb25fbm9kZXMsXG4gIG5vZGU6IHNlbGVjdGlvbl9ub2RlLFxuICBzaXplOiBzZWxlY3Rpb25fc2l6ZSxcbiAgZW1wdHk6IHNlbGVjdGlvbl9lbXB0eSxcbiAgZWFjaDogc2VsZWN0aW9uX2VhY2gsXG4gIGF0dHI6IHNlbGVjdGlvbl9hdHRyLFxuICBzdHlsZTogc2VsZWN0aW9uX3N0eWxlLFxuICBwcm9wZXJ0eTogc2VsZWN0aW9uX3Byb3BlcnR5LFxuICBjbGFzc2VkOiBzZWxlY3Rpb25fY2xhc3NlZCxcbiAgdGV4dDogc2VsZWN0aW9uX3RleHQsXG4gIGh0bWw6IHNlbGVjdGlvbl9odG1sLFxuICByYWlzZTogc2VsZWN0aW9uX3JhaXNlLFxuICBsb3dlcjogc2VsZWN0aW9uX2xvd2VyLFxuICBhcHBlbmQ6IHNlbGVjdGlvbl9hcHBlbmQsXG4gIGluc2VydDogc2VsZWN0aW9uX2luc2VydCxcbiAgcmVtb3ZlOiBzZWxlY3Rpb25fcmVtb3ZlLFxuICBjbG9uZTogc2VsZWN0aW9uX2Nsb25lLFxuICBkYXR1bTogc2VsZWN0aW9uX2RhdHVtLFxuICBvbjogc2VsZWN0aW9uX29uLFxuICBkaXNwYXRjaDogc2VsZWN0aW9uX2Rpc3BhdGNoLFxuICBbU3ltYm9sLml0ZXJhdG9yXTogc2VsZWN0aW9uX2l0ZXJhdG9yXG59O1xuXG5leHBvcnQgZGVmYXVsdCBzZWxlY3Rpb247XG4iLCJpbXBvcnQge1NlbGVjdGlvbiwgcm9vdH0gZnJvbSBcIi4vc2VsZWN0aW9uL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiB0eXBlb2Ygc2VsZWN0b3IgPT09IFwic3RyaW5nXCJcbiAgICAgID8gbmV3IFNlbGVjdGlvbihbW2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpXV0sIFtkb2N1bWVudC5kb2N1bWVudEVsZW1lbnRdKVxuICAgICAgOiBuZXcgU2VsZWN0aW9uKFtbc2VsZWN0b3JdXSwgcm9vdCk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjb25zdHJ1Y3RvciwgZmFjdG9yeSwgcHJvdG90eXBlKSB7XG4gIGNvbnN0cnVjdG9yLnByb3RvdHlwZSA9IGZhY3RvcnkucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICBwcm90b3R5cGUuY29uc3RydWN0b3IgPSBjb25zdHJ1Y3Rvcjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZChwYXJlbnQsIGRlZmluaXRpb24pIHtcbiAgdmFyIHByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUocGFyZW50LnByb3RvdHlwZSk7XG4gIGZvciAodmFyIGtleSBpbiBkZWZpbml0aW9uKSBwcm90b3R5cGVba2V5XSA9IGRlZmluaXRpb25ba2V5XTtcbiAgcmV0dXJuIHByb3RvdHlwZTtcbn1cbiIsImltcG9ydCBkZWZpbmUsIHtleHRlbmR9IGZyb20gXCIuL2RlZmluZS5qc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gQ29sb3IoKSB7fVxuXG5leHBvcnQgdmFyIGRhcmtlciA9IDAuNztcbmV4cG9ydCB2YXIgYnJpZ2h0ZXIgPSAxIC8gZGFya2VyO1xuXG52YXIgcmVJID0gXCJcXFxccyooWystXT9cXFxcZCspXFxcXHMqXCIsXG4gICAgcmVOID0gXCJcXFxccyooWystXT8oPzpcXFxcZCpcXFxcLik/XFxcXGQrKD86W2VFXVsrLV0/XFxcXGQrKT8pXFxcXHMqXCIsXG4gICAgcmVQID0gXCJcXFxccyooWystXT8oPzpcXFxcZCpcXFxcLik/XFxcXGQrKD86W2VFXVsrLV0/XFxcXGQrKT8pJVxcXFxzKlwiLFxuICAgIHJlSGV4ID0gL14jKFswLTlhLWZdezMsOH0pJC8sXG4gICAgcmVSZ2JJbnRlZ2VyID0gbmV3IFJlZ0V4cChgXnJnYlxcXFwoJHtyZUl9LCR7cmVJfSwke3JlSX1cXFxcKSRgKSxcbiAgICByZVJnYlBlcmNlbnQgPSBuZXcgUmVnRXhwKGBecmdiXFxcXCgke3JlUH0sJHtyZVB9LCR7cmVQfVxcXFwpJGApLFxuICAgIHJlUmdiYUludGVnZXIgPSBuZXcgUmVnRXhwKGBecmdiYVxcXFwoJHtyZUl9LCR7cmVJfSwke3JlSX0sJHtyZU59XFxcXCkkYCksXG4gICAgcmVSZ2JhUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5yZ2JhXFxcXCgke3JlUH0sJHtyZVB9LCR7cmVQfSwke3JlTn1cXFxcKSRgKSxcbiAgICByZUhzbFBlcmNlbnQgPSBuZXcgUmVnRXhwKGBeaHNsXFxcXCgke3JlTn0sJHtyZVB9LCR7cmVQfVxcXFwpJGApLFxuICAgIHJlSHNsYVBlcmNlbnQgPSBuZXcgUmVnRXhwKGBeaHNsYVxcXFwoJHtyZU59LCR7cmVQfSwke3JlUH0sJHtyZU59XFxcXCkkYCk7XG5cbnZhciBuYW1lZCA9IHtcbiAgYWxpY2VibHVlOiAweGYwZjhmZixcbiAgYW50aXF1ZXdoaXRlOiAweGZhZWJkNyxcbiAgYXF1YTogMHgwMGZmZmYsXG4gIGFxdWFtYXJpbmU6IDB4N2ZmZmQ0LFxuICBhenVyZTogMHhmMGZmZmYsXG4gIGJlaWdlOiAweGY1ZjVkYyxcbiAgYmlzcXVlOiAweGZmZTRjNCxcbiAgYmxhY2s6IDB4MDAwMDAwLFxuICBibGFuY2hlZGFsbW9uZDogMHhmZmViY2QsXG4gIGJsdWU6IDB4MDAwMGZmLFxuICBibHVldmlvbGV0OiAweDhhMmJlMixcbiAgYnJvd246IDB4YTUyYTJhLFxuICBidXJseXdvb2Q6IDB4ZGViODg3LFxuICBjYWRldGJsdWU6IDB4NWY5ZWEwLFxuICBjaGFydHJldXNlOiAweDdmZmYwMCxcbiAgY2hvY29sYXRlOiAweGQyNjkxZSxcbiAgY29yYWw6IDB4ZmY3ZjUwLFxuICBjb3JuZmxvd2VyYmx1ZTogMHg2NDk1ZWQsXG4gIGNvcm5zaWxrOiAweGZmZjhkYyxcbiAgY3JpbXNvbjogMHhkYzE0M2MsXG4gIGN5YW46IDB4MDBmZmZmLFxuICBkYXJrYmx1ZTogMHgwMDAwOGIsXG4gIGRhcmtjeWFuOiAweDAwOGI4YixcbiAgZGFya2dvbGRlbnJvZDogMHhiODg2MGIsXG4gIGRhcmtncmF5OiAweGE5YTlhOSxcbiAgZGFya2dyZWVuOiAweDAwNjQwMCxcbiAgZGFya2dyZXk6IDB4YTlhOWE5LFxuICBkYXJra2hha2k6IDB4YmRiNzZiLFxuICBkYXJrbWFnZW50YTogMHg4YjAwOGIsXG4gIGRhcmtvbGl2ZWdyZWVuOiAweDU1NmIyZixcbiAgZGFya29yYW5nZTogMHhmZjhjMDAsXG4gIGRhcmtvcmNoaWQ6IDB4OTkzMmNjLFxuICBkYXJrcmVkOiAweDhiMDAwMCxcbiAgZGFya3NhbG1vbjogMHhlOTk2N2EsXG4gIGRhcmtzZWFncmVlbjogMHg4ZmJjOGYsXG4gIGRhcmtzbGF0ZWJsdWU6IDB4NDgzZDhiLFxuICBkYXJrc2xhdGVncmF5OiAweDJmNGY0ZixcbiAgZGFya3NsYXRlZ3JleTogMHgyZjRmNGYsXG4gIGRhcmt0dXJxdW9pc2U6IDB4MDBjZWQxLFxuICBkYXJrdmlvbGV0OiAweDk0MDBkMyxcbiAgZGVlcHBpbms6IDB4ZmYxNDkzLFxuICBkZWVwc2t5Ymx1ZTogMHgwMGJmZmYsXG4gIGRpbWdyYXk6IDB4Njk2OTY5LFxuICBkaW1ncmV5OiAweDY5Njk2OSxcbiAgZG9kZ2VyYmx1ZTogMHgxZTkwZmYsXG4gIGZpcmVicmljazogMHhiMjIyMjIsXG4gIGZsb3JhbHdoaXRlOiAweGZmZmFmMCxcbiAgZm9yZXN0Z3JlZW46IDB4MjI4YjIyLFxuICBmdWNoc2lhOiAweGZmMDBmZixcbiAgZ2FpbnNib3JvOiAweGRjZGNkYyxcbiAgZ2hvc3R3aGl0ZTogMHhmOGY4ZmYsXG4gIGdvbGQ6IDB4ZmZkNzAwLFxuICBnb2xkZW5yb2Q6IDB4ZGFhNTIwLFxuICBncmF5OiAweDgwODA4MCxcbiAgZ3JlZW46IDB4MDA4MDAwLFxuICBncmVlbnllbGxvdzogMHhhZGZmMmYsXG4gIGdyZXk6IDB4ODA4MDgwLFxuICBob25leWRldzogMHhmMGZmZjAsXG4gIGhvdHBpbms6IDB4ZmY2OWI0LFxuICBpbmRpYW5yZWQ6IDB4Y2Q1YzVjLFxuICBpbmRpZ286IDB4NGIwMDgyLFxuICBpdm9yeTogMHhmZmZmZjAsXG4gIGtoYWtpOiAweGYwZTY4YyxcbiAgbGF2ZW5kZXI6IDB4ZTZlNmZhLFxuICBsYXZlbmRlcmJsdXNoOiAweGZmZjBmNSxcbiAgbGF3bmdyZWVuOiAweDdjZmMwMCxcbiAgbGVtb25jaGlmZm9uOiAweGZmZmFjZCxcbiAgbGlnaHRibHVlOiAweGFkZDhlNixcbiAgbGlnaHRjb3JhbDogMHhmMDgwODAsXG4gIGxpZ2h0Y3lhbjogMHhlMGZmZmYsXG4gIGxpZ2h0Z29sZGVucm9keWVsbG93OiAweGZhZmFkMixcbiAgbGlnaHRncmF5OiAweGQzZDNkMyxcbiAgbGlnaHRncmVlbjogMHg5MGVlOTAsXG4gIGxpZ2h0Z3JleTogMHhkM2QzZDMsXG4gIGxpZ2h0cGluazogMHhmZmI2YzEsXG4gIGxpZ2h0c2FsbW9uOiAweGZmYTA3YSxcbiAgbGlnaHRzZWFncmVlbjogMHgyMGIyYWEsXG4gIGxpZ2h0c2t5Ymx1ZTogMHg4N2NlZmEsXG4gIGxpZ2h0c2xhdGVncmF5OiAweDc3ODg5OSxcbiAgbGlnaHRzbGF0ZWdyZXk6IDB4Nzc4ODk5LFxuICBsaWdodHN0ZWVsYmx1ZTogMHhiMGM0ZGUsXG4gIGxpZ2h0eWVsbG93OiAweGZmZmZlMCxcbiAgbGltZTogMHgwMGZmMDAsXG4gIGxpbWVncmVlbjogMHgzMmNkMzIsXG4gIGxpbmVuOiAweGZhZjBlNixcbiAgbWFnZW50YTogMHhmZjAwZmYsXG4gIG1hcm9vbjogMHg4MDAwMDAsXG4gIG1lZGl1bWFxdWFtYXJpbmU6IDB4NjZjZGFhLFxuICBtZWRpdW1ibHVlOiAweDAwMDBjZCxcbiAgbWVkaXVtb3JjaGlkOiAweGJhNTVkMyxcbiAgbWVkaXVtcHVycGxlOiAweDkzNzBkYixcbiAgbWVkaXVtc2VhZ3JlZW46IDB4M2NiMzcxLFxuICBtZWRpdW1zbGF0ZWJsdWU6IDB4N2I2OGVlLFxuICBtZWRpdW1zcHJpbmdncmVlbjogMHgwMGZhOWEsXG4gIG1lZGl1bXR1cnF1b2lzZTogMHg0OGQxY2MsXG4gIG1lZGl1bXZpb2xldHJlZDogMHhjNzE1ODUsXG4gIG1pZG5pZ2h0Ymx1ZTogMHgxOTE5NzAsXG4gIG1pbnRjcmVhbTogMHhmNWZmZmEsXG4gIG1pc3R5cm9zZTogMHhmZmU0ZTEsXG4gIG1vY2Nhc2luOiAweGZmZTRiNSxcbiAgbmF2YWpvd2hpdGU6IDB4ZmZkZWFkLFxuICBuYXZ5OiAweDAwMDA4MCxcbiAgb2xkbGFjZTogMHhmZGY1ZTYsXG4gIG9saXZlOiAweDgwODAwMCxcbiAgb2xpdmVkcmFiOiAweDZiOGUyMyxcbiAgb3JhbmdlOiAweGZmYTUwMCxcbiAgb3JhbmdlcmVkOiAweGZmNDUwMCxcbiAgb3JjaGlkOiAweGRhNzBkNixcbiAgcGFsZWdvbGRlbnJvZDogMHhlZWU4YWEsXG4gIHBhbGVncmVlbjogMHg5OGZiOTgsXG4gIHBhbGV0dXJxdW9pc2U6IDB4YWZlZWVlLFxuICBwYWxldmlvbGV0cmVkOiAweGRiNzA5MyxcbiAgcGFwYXlhd2hpcDogMHhmZmVmZDUsXG4gIHBlYWNocHVmZjogMHhmZmRhYjksXG4gIHBlcnU6IDB4Y2Q4NTNmLFxuICBwaW5rOiAweGZmYzBjYixcbiAgcGx1bTogMHhkZGEwZGQsXG4gIHBvd2RlcmJsdWU6IDB4YjBlMGU2LFxuICBwdXJwbGU6IDB4ODAwMDgwLFxuICByZWJlY2NhcHVycGxlOiAweDY2MzM5OSxcbiAgcmVkOiAweGZmMDAwMCxcbiAgcm9zeWJyb3duOiAweGJjOGY4ZixcbiAgcm95YWxibHVlOiAweDQxNjllMSxcbiAgc2FkZGxlYnJvd246IDB4OGI0NTEzLFxuICBzYWxtb246IDB4ZmE4MDcyLFxuICBzYW5keWJyb3duOiAweGY0YTQ2MCxcbiAgc2VhZ3JlZW46IDB4MmU4YjU3LFxuICBzZWFzaGVsbDogMHhmZmY1ZWUsXG4gIHNpZW5uYTogMHhhMDUyMmQsXG4gIHNpbHZlcjogMHhjMGMwYzAsXG4gIHNreWJsdWU6IDB4ODdjZWViLFxuICBzbGF0ZWJsdWU6IDB4NmE1YWNkLFxuICBzbGF0ZWdyYXk6IDB4NzA4MDkwLFxuICBzbGF0ZWdyZXk6IDB4NzA4MDkwLFxuICBzbm93OiAweGZmZmFmYSxcbiAgc3ByaW5nZ3JlZW46IDB4MDBmZjdmLFxuICBzdGVlbGJsdWU6IDB4NDY4MmI0LFxuICB0YW46IDB4ZDJiNDhjLFxuICB0ZWFsOiAweDAwODA4MCxcbiAgdGhpc3RsZTogMHhkOGJmZDgsXG4gIHRvbWF0bzogMHhmZjYzNDcsXG4gIHR1cnF1b2lzZTogMHg0MGUwZDAsXG4gIHZpb2xldDogMHhlZTgyZWUsXG4gIHdoZWF0OiAweGY1ZGViMyxcbiAgd2hpdGU6IDB4ZmZmZmZmLFxuICB3aGl0ZXNtb2tlOiAweGY1ZjVmNSxcbiAgeWVsbG93OiAweGZmZmYwMCxcbiAgeWVsbG93Z3JlZW46IDB4OWFjZDMyXG59O1xuXG5kZWZpbmUoQ29sb3IsIGNvbG9yLCB7XG4gIGNvcHkoY2hhbm5lbHMpIHtcbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihuZXcgdGhpcy5jb25zdHJ1Y3RvciwgdGhpcywgY2hhbm5lbHMpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gdGhpcy5yZ2IoKS5kaXNwbGF5YWJsZSgpO1xuICB9LFxuICBoZXg6IGNvbG9yX2Zvcm1hdEhleCwgLy8gRGVwcmVjYXRlZCEgVXNlIGNvbG9yLmZvcm1hdEhleC5cbiAgZm9ybWF0SGV4OiBjb2xvcl9mb3JtYXRIZXgsXG4gIGZvcm1hdEhleDg6IGNvbG9yX2Zvcm1hdEhleDgsXG4gIGZvcm1hdEhzbDogY29sb3JfZm9ybWF0SHNsLFxuICBmb3JtYXRSZ2I6IGNvbG9yX2Zvcm1hdFJnYixcbiAgdG9TdHJpbmc6IGNvbG9yX2Zvcm1hdFJnYlxufSk7XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdEhleCgpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0SGV4KCk7XG59XG5cbmZ1bmN0aW9uIGNvbG9yX2Zvcm1hdEhleDgoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdEhleDgoKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SHNsKCkge1xuICByZXR1cm4gaHNsQ29udmVydCh0aGlzKS5mb3JtYXRIc2woKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0UmdiKCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRSZ2IoKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29sb3IoZm9ybWF0KSB7XG4gIHZhciBtLCBsO1xuICBmb3JtYXQgPSAoZm9ybWF0ICsgXCJcIikudHJpbSgpLnRvTG93ZXJDYXNlKCk7XG4gIHJldHVybiAobSA9IHJlSGV4LmV4ZWMoZm9ybWF0KSkgPyAobCA9IG1bMV0ubGVuZ3RoLCBtID0gcGFyc2VJbnQobVsxXSwgMTYpLCBsID09PSA2ID8gcmdibihtKSAvLyAjZmYwMDAwXG4gICAgICA6IGwgPT09IDMgPyBuZXcgUmdiKChtID4+IDggJiAweGYpIHwgKG0gPj4gNCAmIDB4ZjApLCAobSA+PiA0ICYgMHhmKSB8IChtICYgMHhmMCksICgobSAmIDB4ZikgPDwgNCkgfCAobSAmIDB4ZiksIDEpIC8vICNmMDBcbiAgICAgIDogbCA9PT0gOCA/IHJnYmEobSA+PiAyNCAmIDB4ZmYsIG0gPj4gMTYgJiAweGZmLCBtID4+IDggJiAweGZmLCAobSAmIDB4ZmYpIC8gMHhmZikgLy8gI2ZmMDAwMDAwXG4gICAgICA6IGwgPT09IDQgPyByZ2JhKChtID4+IDEyICYgMHhmKSB8IChtID4+IDggJiAweGYwKSwgKG0gPj4gOCAmIDB4ZikgfCAobSA+PiA0ICYgMHhmMCksIChtID4+IDQgJiAweGYpIHwgKG0gJiAweGYwKSwgKCgobSAmIDB4ZikgPDwgNCkgfCAobSAmIDB4ZikpIC8gMHhmZikgLy8gI2YwMDBcbiAgICAgIDogbnVsbCkgLy8gaW52YWxpZCBoZXhcbiAgICAgIDogKG0gPSByZVJnYkludGVnZXIuZXhlYyhmb3JtYXQpKSA/IG5ldyBSZ2IobVsxXSwgbVsyXSwgbVszXSwgMSkgLy8gcmdiKDI1NSwgMCwgMClcbiAgICAgIDogKG0gPSByZVJnYlBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IG5ldyBSZ2IobVsxXSAqIDI1NSAvIDEwMCwgbVsyXSAqIDI1NSAvIDEwMCwgbVszXSAqIDI1NSAvIDEwMCwgMSkgLy8gcmdiKDEwMCUsIDAlLCAwJSlcbiAgICAgIDogKG0gPSByZVJnYmFJbnRlZ2VyLmV4ZWMoZm9ybWF0KSkgPyByZ2JhKG1bMV0sIG1bMl0sIG1bM10sIG1bNF0pIC8vIHJnYmEoMjU1LCAwLCAwLCAxKVxuICAgICAgOiAobSA9IHJlUmdiYVBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IHJnYmEobVsxXSAqIDI1NSAvIDEwMCwgbVsyXSAqIDI1NSAvIDEwMCwgbVszXSAqIDI1NSAvIDEwMCwgbVs0XSkgLy8gcmdiKDEwMCUsIDAlLCAwJSwgMSlcbiAgICAgIDogKG0gPSByZUhzbFBlcmNlbnQuZXhlYyhmb3JtYXQpKSA/IGhzbGEobVsxXSwgbVsyXSAvIDEwMCwgbVszXSAvIDEwMCwgMSkgLy8gaHNsKDEyMCwgNTAlLCA1MCUpXG4gICAgICA6IChtID0gcmVIc2xhUGVyY2VudC5leGVjKGZvcm1hdCkpID8gaHNsYShtWzFdLCBtWzJdIC8gMTAwLCBtWzNdIC8gMTAwLCBtWzRdKSAvLyBoc2xhKDEyMCwgNTAlLCA1MCUsIDEpXG4gICAgICA6IG5hbWVkLmhhc093blByb3BlcnR5KGZvcm1hdCkgPyByZ2JuKG5hbWVkW2Zvcm1hdF0pIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG4gICAgICA6IGZvcm1hdCA9PT0gXCJ0cmFuc3BhcmVudFwiID8gbmV3IFJnYihOYU4sIE5hTiwgTmFOLCAwKVxuICAgICAgOiBudWxsO1xufVxuXG5mdW5jdGlvbiByZ2JuKG4pIHtcbiAgcmV0dXJuIG5ldyBSZ2IobiA+PiAxNiAmIDB4ZmYsIG4gPj4gOCAmIDB4ZmYsIG4gJiAweGZmLCAxKTtcbn1cblxuZnVuY3Rpb24gcmdiYShyLCBnLCBiLCBhKSB7XG4gIGlmIChhIDw9IDApIHIgPSBnID0gYiA9IE5hTjtcbiAgcmV0dXJuIG5ldyBSZ2IociwgZywgYiwgYSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZ2JDb252ZXJ0KG8pIHtcbiAgaWYgKCEobyBpbnN0YW5jZW9mIENvbG9yKSkgbyA9IGNvbG9yKG8pO1xuICBpZiAoIW8pIHJldHVybiBuZXcgUmdiO1xuICBvID0gby5yZ2IoKTtcbiAgcmV0dXJuIG5ldyBSZ2Ioby5yLCBvLmcsIG8uYiwgby5vcGFjaXR5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYihyLCBnLCBiLCBvcGFjaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID09PSAxID8gcmdiQ29udmVydChyKSA6IG5ldyBSZ2IociwgZywgYiwgb3BhY2l0eSA9PSBudWxsID8gMSA6IG9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gUmdiKHIsIGcsIGIsIG9wYWNpdHkpIHtcbiAgdGhpcy5yID0gK3I7XG4gIHRoaXMuZyA9ICtnO1xuICB0aGlzLmIgPSArYjtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShSZ2IsIHJnYiwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gYnJpZ2h0ZXIgOiBNYXRoLnBvdyhicmlnaHRlciwgayk7XG4gICAgcmV0dXJuIG5ldyBSZ2IodGhpcy5yICogaywgdGhpcy5nICogaywgdGhpcy5iICogaywgdGhpcy5vcGFjaXR5KTtcbiAgfSxcbiAgZGFya2VyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gZGFya2VyIDogTWF0aC5wb3coZGFya2VyLCBrKTtcbiAgICByZXR1cm4gbmV3IFJnYih0aGlzLnIgKiBrLCB0aGlzLmcgKiBrLCB0aGlzLmIgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICByZ2IoKSB7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNsYW1wKCkge1xuICAgIHJldHVybiBuZXcgUmdiKGNsYW1waSh0aGlzLnIpLCBjbGFtcGkodGhpcy5nKSwgY2xhbXBpKHRoaXMuYiksIGNsYW1wYSh0aGlzLm9wYWNpdHkpKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuICgtMC41IDw9IHRoaXMuciAmJiB0aGlzLnIgPCAyNTUuNSlcbiAgICAgICAgJiYgKC0wLjUgPD0gdGhpcy5nICYmIHRoaXMuZyA8IDI1NS41KVxuICAgICAgICAmJiAoLTAuNSA8PSB0aGlzLmIgJiYgdGhpcy5iIDwgMjU1LjUpXG4gICAgICAgICYmICgwIDw9IHRoaXMub3BhY2l0eSAmJiB0aGlzLm9wYWNpdHkgPD0gMSk7XG4gIH0sXG4gIGhleDogcmdiX2Zvcm1hdEhleCwgLy8gRGVwcmVjYXRlZCEgVXNlIGNvbG9yLmZvcm1hdEhleC5cbiAgZm9ybWF0SGV4OiByZ2JfZm9ybWF0SGV4LFxuICBmb3JtYXRIZXg4OiByZ2JfZm9ybWF0SGV4OCxcbiAgZm9ybWF0UmdiOiByZ2JfZm9ybWF0UmdiLFxuICB0b1N0cmluZzogcmdiX2Zvcm1hdFJnYlxufSkpO1xuXG5mdW5jdGlvbiByZ2JfZm9ybWF0SGV4KCkge1xuICByZXR1cm4gYCMke2hleCh0aGlzLnIpfSR7aGV4KHRoaXMuZyl9JHtoZXgodGhpcy5iKX1gO1xufVxuXG5mdW5jdGlvbiByZ2JfZm9ybWF0SGV4OCgpIHtcbiAgcmV0dXJuIGAjJHtoZXgodGhpcy5yKX0ke2hleCh0aGlzLmcpfSR7aGV4KHRoaXMuYil9JHtoZXgoKGlzTmFOKHRoaXMub3BhY2l0eSkgPyAxIDogdGhpcy5vcGFjaXR5KSAqIDI1NSl9YDtcbn1cblxuZnVuY3Rpb24gcmdiX2Zvcm1hdFJnYigpIHtcbiAgY29uc3QgYSA9IGNsYW1wYSh0aGlzLm9wYWNpdHkpO1xuICByZXR1cm4gYCR7YSA9PT0gMSA/IFwicmdiKFwiIDogXCJyZ2JhKFwifSR7Y2xhbXBpKHRoaXMucil9LCAke2NsYW1waSh0aGlzLmcpfSwgJHtjbGFtcGkodGhpcy5iKX0ke2EgPT09IDEgPyBcIilcIiA6IGAsICR7YX0pYH1gO1xufVxuXG5mdW5jdGlvbiBjbGFtcGEob3BhY2l0eSkge1xuICByZXR1cm4gaXNOYU4ob3BhY2l0eSkgPyAxIDogTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgb3BhY2l0eSkpO1xufVxuXG5mdW5jdGlvbiBjbGFtcGkodmFsdWUpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDI1NSwgTWF0aC5yb3VuZCh2YWx1ZSkgfHwgMCkpO1xufVxuXG5mdW5jdGlvbiBoZXgodmFsdWUpIHtcbiAgdmFsdWUgPSBjbGFtcGkodmFsdWUpO1xuICByZXR1cm4gKHZhbHVlIDwgMTYgPyBcIjBcIiA6IFwiXCIpICsgdmFsdWUudG9TdHJpbmcoMTYpO1xufVxuXG5mdW5jdGlvbiBoc2xhKGgsIHMsIGwsIGEpIHtcbiAgaWYgKGEgPD0gMCkgaCA9IHMgPSBsID0gTmFOO1xuICBlbHNlIGlmIChsIDw9IDAgfHwgbCA+PSAxKSBoID0gcyA9IE5hTjtcbiAgZWxzZSBpZiAocyA8PSAwKSBoID0gTmFOO1xuICByZXR1cm4gbmV3IEhzbChoLCBzLCBsLCBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGhzbENvbnZlcnQobykge1xuICBpZiAobyBpbnN0YW5jZW9mIEhzbCkgcmV0dXJuIG5ldyBIc2woby5oLCBvLnMsIG8ubCwgby5vcGFjaXR5KTtcbiAgaWYgKCEobyBpbnN0YW5jZW9mIENvbG9yKSkgbyA9IGNvbG9yKG8pO1xuICBpZiAoIW8pIHJldHVybiBuZXcgSHNsO1xuICBpZiAobyBpbnN0YW5jZW9mIEhzbCkgcmV0dXJuIG87XG4gIG8gPSBvLnJnYigpO1xuICB2YXIgciA9IG8uciAvIDI1NSxcbiAgICAgIGcgPSBvLmcgLyAyNTUsXG4gICAgICBiID0gby5iIC8gMjU1LFxuICAgICAgbWluID0gTWF0aC5taW4ociwgZywgYiksXG4gICAgICBtYXggPSBNYXRoLm1heChyLCBnLCBiKSxcbiAgICAgIGggPSBOYU4sXG4gICAgICBzID0gbWF4IC0gbWluLFxuICAgICAgbCA9IChtYXggKyBtaW4pIC8gMjtcbiAgaWYgKHMpIHtcbiAgICBpZiAociA9PT0gbWF4KSBoID0gKGcgLSBiKSAvIHMgKyAoZyA8IGIpICogNjtcbiAgICBlbHNlIGlmIChnID09PSBtYXgpIGggPSAoYiAtIHIpIC8gcyArIDI7XG4gICAgZWxzZSBoID0gKHIgLSBnKSAvIHMgKyA0O1xuICAgIHMgLz0gbCA8IDAuNSA/IG1heCArIG1pbiA6IDIgLSBtYXggLSBtaW47XG4gICAgaCAqPSA2MDtcbiAgfSBlbHNlIHtcbiAgICBzID0gbCA+IDAgJiYgbCA8IDEgPyAwIDogaDtcbiAgfVxuICByZXR1cm4gbmV3IEhzbChoLCBzLCBsLCBvLm9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHNsKGgsIHMsIGwsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyBoc2xDb252ZXJ0KGgpIDogbmV3IEhzbChoLCBzLCBsLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmZ1bmN0aW9uIEhzbChoLCBzLCBsLCBvcGFjaXR5KSB7XG4gIHRoaXMuaCA9ICtoO1xuICB0aGlzLnMgPSArcztcbiAgdGhpcy5sID0gK2w7XG4gIHRoaXMub3BhY2l0eSA9ICtvcGFjaXR5O1xufVxuXG5kZWZpbmUoSHNsLCBoc2wsIGV4dGVuZChDb2xvciwge1xuICBicmlnaHRlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGJyaWdodGVyIDogTWF0aC5wb3coYnJpZ2h0ZXIsIGspO1xuICAgIHJldHVybiBuZXcgSHNsKHRoaXMuaCwgdGhpcy5zLCB0aGlzLmwgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBkYXJrZXIgOiBNYXRoLnBvdyhkYXJrZXIsIGspO1xuICAgIHJldHVybiBuZXcgSHNsKHRoaXMuaCwgdGhpcy5zLCB0aGlzLmwgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICByZ2IoKSB7XG4gICAgdmFyIGggPSB0aGlzLmggJSAzNjAgKyAodGhpcy5oIDwgMCkgKiAzNjAsXG4gICAgICAgIHMgPSBpc05hTihoKSB8fCBpc05hTih0aGlzLnMpID8gMCA6IHRoaXMucyxcbiAgICAgICAgbCA9IHRoaXMubCxcbiAgICAgICAgbTIgPSBsICsgKGwgPCAwLjUgPyBsIDogMSAtIGwpICogcyxcbiAgICAgICAgbTEgPSAyICogbCAtIG0yO1xuICAgIHJldHVybiBuZXcgUmdiKFxuICAgICAgaHNsMnJnYihoID49IDI0MCA/IGggLSAyNDAgOiBoICsgMTIwLCBtMSwgbTIpLFxuICAgICAgaHNsMnJnYihoLCBtMSwgbTIpLFxuICAgICAgaHNsMnJnYihoIDwgMTIwID8gaCArIDI0MCA6IGggLSAxMjAsIG0xLCBtMiksXG4gICAgICB0aGlzLm9wYWNpdHlcbiAgICApO1xuICB9LFxuICBjbGFtcCgpIHtcbiAgICByZXR1cm4gbmV3IEhzbChjbGFtcGgodGhpcy5oKSwgY2xhbXB0KHRoaXMucyksIGNsYW1wdCh0aGlzLmwpLCBjbGFtcGEodGhpcy5vcGFjaXR5KSk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiAoMCA8PSB0aGlzLnMgJiYgdGhpcy5zIDw9IDEgfHwgaXNOYU4odGhpcy5zKSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5sICYmIHRoaXMubCA8PSAxKVxuICAgICAgICAmJiAoMCA8PSB0aGlzLm9wYWNpdHkgJiYgdGhpcy5vcGFjaXR5IDw9IDEpO1xuICB9LFxuICBmb3JtYXRIc2woKSB7XG4gICAgY29uc3QgYSA9IGNsYW1wYSh0aGlzLm9wYWNpdHkpO1xuICAgIHJldHVybiBgJHthID09PSAxID8gXCJoc2woXCIgOiBcImhzbGEoXCJ9JHtjbGFtcGgodGhpcy5oKX0sICR7Y2xhbXB0KHRoaXMucykgKiAxMDB9JSwgJHtjbGFtcHQodGhpcy5sKSAqIDEwMH0lJHthID09PSAxID8gXCIpXCIgOiBgLCAke2F9KWB9YDtcbiAgfVxufSkpO1xuXG5mdW5jdGlvbiBjbGFtcGgodmFsdWUpIHtcbiAgdmFsdWUgPSAodmFsdWUgfHwgMCkgJSAzNjA7XG4gIHJldHVybiB2YWx1ZSA8IDAgPyB2YWx1ZSArIDM2MCA6IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBjbGFtcHQodmFsdWUpIHtcbiAgcmV0dXJuIE1hdGgubWF4KDAsIE1hdGgubWluKDEsIHZhbHVlIHx8IDApKTtcbn1cblxuLyogRnJvbSBGdkQgMTMuMzcsIENTUyBDb2xvciBNb2R1bGUgTGV2ZWwgMyAqL1xuZnVuY3Rpb24gaHNsMnJnYihoLCBtMSwgbTIpIHtcbiAgcmV0dXJuIChoIDwgNjAgPyBtMSArIChtMiAtIG0xKSAqIGggLyA2MFxuICAgICAgOiBoIDwgMTgwID8gbTJcbiAgICAgIDogaCA8IDI0MCA/IG0xICsgKG0yIC0gbTEpICogKDI0MCAtIGgpIC8gNjBcbiAgICAgIDogbTEpICogMjU1O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgeCA9PiAoKSA9PiB4O1xuIiwiaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5cbmZ1bmN0aW9uIGxpbmVhcihhLCBkKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGEgKyB0ICogZDtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZXhwb25lbnRpYWwoYSwgYiwgeSkge1xuICByZXR1cm4gYSA9IE1hdGgucG93KGEsIHkpLCBiID0gTWF0aC5wb3coYiwgeSkgLSBhLCB5ID0gMSAvIHksIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gTWF0aC5wb3coYSArIHQgKiBiLCB5KTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGh1ZShhLCBiKSB7XG4gIHZhciBkID0gYiAtIGE7XG4gIHJldHVybiBkID8gbGluZWFyKGEsIGQgPiAxODAgfHwgZCA8IC0xODAgPyBkIC0gMzYwICogTWF0aC5yb3VuZChkIC8gMzYwKSA6IGQpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnYW1tYSh5KSB7XG4gIHJldHVybiAoeSA9ICt5KSA9PT0gMSA/IG5vZ2FtbWEgOiBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGIgLSBhID8gZXhwb25lbnRpYWwoYSwgYiwgeSkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbm9nYW1tYShhLCBiKSB7XG4gIHZhciBkID0gYiAtIGE7XG4gIHJldHVybiBkID8gbGluZWFyKGEsIGQpIDogY29uc3RhbnQoaXNOYU4oYSkgPyBiIDogYSk7XG59XG4iLCJpbXBvcnQge3JnYiBhcyBjb2xvclJnYn0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQgYmFzaXMgZnJvbSBcIi4vYmFzaXMuanNcIjtcbmltcG9ydCBiYXNpc0Nsb3NlZCBmcm9tIFwiLi9iYXNpc0Nsb3NlZC5qc1wiO1xuaW1wb3J0IG5vZ2FtbWEsIHtnYW1tYX0gZnJvbSBcIi4vY29sb3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uIHJnYkdhbW1hKHkpIHtcbiAgdmFyIGNvbG9yID0gZ2FtbWEoeSk7XG5cbiAgZnVuY3Rpb24gcmdiKHN0YXJ0LCBlbmQpIHtcbiAgICB2YXIgciA9IGNvbG9yKChzdGFydCA9IGNvbG9yUmdiKHN0YXJ0KSkuciwgKGVuZCA9IGNvbG9yUmdiKGVuZCkpLnIpLFxuICAgICAgICBnID0gY29sb3Ioc3RhcnQuZywgZW5kLmcpLFxuICAgICAgICBiID0gY29sb3Ioc3RhcnQuYiwgZW5kLmIpLFxuICAgICAgICBvcGFjaXR5ID0gbm9nYW1tYShzdGFydC5vcGFjaXR5LCBlbmQub3BhY2l0eSk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHN0YXJ0LnIgPSByKHQpO1xuICAgICAgc3RhcnQuZyA9IGcodCk7XG4gICAgICBzdGFydC5iID0gYih0KTtcbiAgICAgIHN0YXJ0Lm9wYWNpdHkgPSBvcGFjaXR5KHQpO1xuICAgICAgcmV0dXJuIHN0YXJ0ICsgXCJcIjtcbiAgICB9O1xuICB9XG5cbiAgcmdiLmdhbW1hID0gcmdiR2FtbWE7XG5cbiAgcmV0dXJuIHJnYjtcbn0pKDEpO1xuXG5mdW5jdGlvbiByZ2JTcGxpbmUoc3BsaW5lKSB7XG4gIHJldHVybiBmdW5jdGlvbihjb2xvcnMpIHtcbiAgICB2YXIgbiA9IGNvbG9ycy5sZW5ndGgsXG4gICAgICAgIHIgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGcgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGIgPSBuZXcgQXJyYXkobiksXG4gICAgICAgIGksIGNvbG9yO1xuICAgIGZvciAoaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGNvbG9yID0gY29sb3JSZ2IoY29sb3JzW2ldKTtcbiAgICAgIHJbaV0gPSBjb2xvci5yIHx8IDA7XG4gICAgICBnW2ldID0gY29sb3IuZyB8fCAwO1xuICAgICAgYltpXSA9IGNvbG9yLmIgfHwgMDtcbiAgICB9XG4gICAgciA9IHNwbGluZShyKTtcbiAgICBnID0gc3BsaW5lKGcpO1xuICAgIGIgPSBzcGxpbmUoYik7XG4gICAgY29sb3Iub3BhY2l0eSA9IDE7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIGNvbG9yLnIgPSByKHQpO1xuICAgICAgY29sb3IuZyA9IGcodCk7XG4gICAgICBjb2xvci5iID0gYih0KTtcbiAgICAgIHJldHVybiBjb2xvciArIFwiXCI7XG4gICAgfTtcbiAgfTtcbn1cblxuZXhwb3J0IHZhciByZ2JCYXNpcyA9IHJnYlNwbGluZShiYXNpcyk7XG5leHBvcnQgdmFyIHJnYkJhc2lzQ2xvc2VkID0gcmdiU3BsaW5lKGJhc2lzQ2xvc2VkKTtcbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgaWYgKCFiKSBiID0gW107XG4gIHZhciBuID0gYSA/IE1hdGgubWluKGIubGVuZ3RoLCBhLmxlbmd0aCkgOiAwLFxuICAgICAgYyA9IGIuc2xpY2UoKSxcbiAgICAgIGk7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkgY1tpXSA9IGFbaV0gKiAoMSAtIHQpICsgYltpXSAqIHQ7XG4gICAgcmV0dXJuIGM7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc051bWJlckFycmF5KHgpIHtcbiAgcmV0dXJuIEFycmF5QnVmZmVyLmlzVmlldyh4KSAmJiAhKHggaW5zdGFuY2VvZiBEYXRhVmlldyk7XG59XG4iLCJpbXBvcnQgdmFsdWUgZnJvbSBcIi4vdmFsdWUuanNcIjtcbmltcG9ydCBudW1iZXJBcnJheSwge2lzTnVtYmVyQXJyYXl9IGZyb20gXCIuL251bWJlckFycmF5LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIChpc051bWJlckFycmF5KGIpID8gbnVtYmVyQXJyYXkgOiBnZW5lcmljQXJyYXkpKGEsIGIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJpY0FycmF5KGEsIGIpIHtcbiAgdmFyIG5iID0gYiA/IGIubGVuZ3RoIDogMCxcbiAgICAgIG5hID0gYSA/IE1hdGgubWluKG5iLCBhLmxlbmd0aCkgOiAwLFxuICAgICAgeCA9IG5ldyBBcnJheShuYSksXG4gICAgICBjID0gbmV3IEFycmF5KG5iKSxcbiAgICAgIGk7XG5cbiAgZm9yIChpID0gMDsgaSA8IG5hOyArK2kpIHhbaV0gPSB2YWx1ZShhW2ldLCBiW2ldKTtcbiAgZm9yICg7IGkgPCBuYjsgKytpKSBjW2ldID0gYltpXTtcblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoaSA9IDA7IGkgPCBuYTsgKytpKSBjW2ldID0geFtpXSh0KTtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGQgPSBuZXcgRGF0ZTtcbiAgcmV0dXJuIGEgPSArYSwgYiA9ICtiLCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGQuc2V0VGltZShhICogKDEgLSB0KSArIGIgKiB0KSwgZDtcbiAgfTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgcmV0dXJuIGEgPSArYSwgYiA9ICtiLCBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGEgKiAoMSAtIHQpICsgYiAqIHQ7XG4gIH07XG59XG4iLCJpbXBvcnQgdmFsdWUgZnJvbSBcIi4vdmFsdWUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgaSA9IHt9LFxuICAgICAgYyA9IHt9LFxuICAgICAgaztcblxuICBpZiAoYSA9PT0gbnVsbCB8fCB0eXBlb2YgYSAhPT0gXCJvYmplY3RcIikgYSA9IHt9O1xuICBpZiAoYiA9PT0gbnVsbCB8fCB0eXBlb2YgYiAhPT0gXCJvYmplY3RcIikgYiA9IHt9O1xuXG4gIGZvciAoayBpbiBiKSB7XG4gICAgaWYgKGsgaW4gYSkge1xuICAgICAgaVtrXSA9IHZhbHVlKGFba10sIGJba10pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjW2tdID0gYltrXTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIGZvciAoayBpbiBpKSBjW2tdID0gaVtrXSh0KTtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cbiIsImltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbnZhciByZUEgPSAvWy0rXT8oPzpcXGQrXFwuP1xcZCp8XFwuP1xcZCspKD86W2VFXVstK10/XFxkKyk/L2csXG4gICAgcmVCID0gbmV3IFJlZ0V4cChyZUEuc291cmNlLCBcImdcIik7XG5cbmZ1bmN0aW9uIHplcm8oYikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGI7XG4gIH07XG59XG5cbmZ1bmN0aW9uIG9uZShiKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIGIodCkgKyBcIlwiO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBiaSA9IHJlQS5sYXN0SW5kZXggPSByZUIubGFzdEluZGV4ID0gMCwgLy8gc2NhbiBpbmRleCBmb3IgbmV4dCBudW1iZXIgaW4gYlxuICAgICAgYW0sIC8vIGN1cnJlbnQgbWF0Y2ggaW4gYVxuICAgICAgYm0sIC8vIGN1cnJlbnQgbWF0Y2ggaW4gYlxuICAgICAgYnMsIC8vIHN0cmluZyBwcmVjZWRpbmcgY3VycmVudCBudW1iZXIgaW4gYiwgaWYgYW55XG4gICAgICBpID0gLTEsIC8vIGluZGV4IGluIHNcbiAgICAgIHMgPSBbXSwgLy8gc3RyaW5nIGNvbnN0YW50cyBhbmQgcGxhY2Vob2xkZXJzXG4gICAgICBxID0gW107IC8vIG51bWJlciBpbnRlcnBvbGF0b3JzXG5cbiAgLy8gQ29lcmNlIGlucHV0cyB0byBzdHJpbmdzLlxuICBhID0gYSArIFwiXCIsIGIgPSBiICsgXCJcIjtcblxuICAvLyBJbnRlcnBvbGF0ZSBwYWlycyBvZiBudW1iZXJzIGluIGEgJiBiLlxuICB3aGlsZSAoKGFtID0gcmVBLmV4ZWMoYSkpXG4gICAgICAmJiAoYm0gPSByZUIuZXhlYyhiKSkpIHtcbiAgICBpZiAoKGJzID0gYm0uaW5kZXgpID4gYmkpIHsgLy8gYSBzdHJpbmcgcHJlY2VkZXMgdGhlIG5leHQgbnVtYmVyIGluIGJcbiAgICAgIGJzID0gYi5zbGljZShiaSwgYnMpO1xuICAgICAgaWYgKHNbaV0pIHNbaV0gKz0gYnM7IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgICBlbHNlIHNbKytpXSA9IGJzO1xuICAgIH1cbiAgICBpZiAoKGFtID0gYW1bMF0pID09PSAoYm0gPSBibVswXSkpIHsgLy8gbnVtYmVycyBpbiBhICYgYiBtYXRjaFxuICAgICAgaWYgKHNbaV0pIHNbaV0gKz0gYm07IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgICBlbHNlIHNbKytpXSA9IGJtO1xuICAgIH0gZWxzZSB7IC8vIGludGVycG9sYXRlIG5vbi1tYXRjaGluZyBudW1iZXJzXG4gICAgICBzWysraV0gPSBudWxsO1xuICAgICAgcS5wdXNoKHtpOiBpLCB4OiBudW1iZXIoYW0sIGJtKX0pO1xuICAgIH1cbiAgICBiaSA9IHJlQi5sYXN0SW5kZXg7XG4gIH1cblxuICAvLyBBZGQgcmVtYWlucyBvZiBiLlxuICBpZiAoYmkgPCBiLmxlbmd0aCkge1xuICAgIGJzID0gYi5zbGljZShiaSk7XG4gICAgaWYgKHNbaV0pIHNbaV0gKz0gYnM7IC8vIGNvYWxlc2NlIHdpdGggcHJldmlvdXMgc3RyaW5nXG4gICAgZWxzZSBzWysraV0gPSBicztcbiAgfVxuXG4gIC8vIFNwZWNpYWwgb3B0aW1pemF0aW9uIGZvciBvbmx5IGEgc2luZ2xlIG1hdGNoLlxuICAvLyBPdGhlcndpc2UsIGludGVycG9sYXRlIGVhY2ggb2YgdGhlIG51bWJlcnMgYW5kIHJlam9pbiB0aGUgc3RyaW5nLlxuICByZXR1cm4gcy5sZW5ndGggPCAyID8gKHFbMF1cbiAgICAgID8gb25lKHFbMF0ueClcbiAgICAgIDogemVybyhiKSlcbiAgICAgIDogKGIgPSBxLmxlbmd0aCwgZnVuY3Rpb24odCkge1xuICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBvOyBpIDwgYjsgKytpKSBzWyhvID0gcVtpXSkuaV0gPSBvLngodCk7XG4gICAgICAgICAgcmV0dXJuIHMuam9pbihcIlwiKTtcbiAgICAgICAgfSk7XG59XG4iLCJpbXBvcnQge2NvbG9yfSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCByZ2IgZnJvbSBcIi4vcmdiLmpzXCI7XG5pbXBvcnQge2dlbmVyaWNBcnJheX0gZnJvbSBcIi4vYXJyYXkuanNcIjtcbmltcG9ydCBkYXRlIGZyb20gXCIuL2RhdGUuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5pbXBvcnQgb2JqZWN0IGZyb20gXCIuL29iamVjdC5qc1wiO1xuaW1wb3J0IHN0cmluZyBmcm9tIFwiLi9zdHJpbmcuanNcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IG51bWJlckFycmF5LCB7aXNOdW1iZXJBcnJheX0gZnJvbSBcIi4vbnVtYmVyQXJyYXkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgdCA9IHR5cGVvZiBiLCBjO1xuICByZXR1cm4gYiA9PSBudWxsIHx8IHQgPT09IFwiYm9vbGVhblwiID8gY29uc3RhbnQoYilcbiAgICAgIDogKHQgPT09IFwibnVtYmVyXCIgPyBudW1iZXJcbiAgICAgIDogdCA9PT0gXCJzdHJpbmdcIiA/ICgoYyA9IGNvbG9yKGIpKSA/IChiID0gYywgcmdiKSA6IHN0cmluZylcbiAgICAgIDogYiBpbnN0YW5jZW9mIGNvbG9yID8gcmdiXG4gICAgICA6IGIgaW5zdGFuY2VvZiBEYXRlID8gZGF0ZVxuICAgICAgOiBpc051bWJlckFycmF5KGIpID8gbnVtYmVyQXJyYXlcbiAgICAgIDogQXJyYXkuaXNBcnJheShiKSA/IGdlbmVyaWNBcnJheVxuICAgICAgOiB0eXBlb2YgYi52YWx1ZU9mICE9PSBcImZ1bmN0aW9uXCIgJiYgdHlwZW9mIGIudG9TdHJpbmcgIT09IFwiZnVuY3Rpb25cIiB8fCBpc05hTihiKSA/IG9iamVjdFxuICAgICAgOiBudW1iZXIpKGEsIGIpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gTWF0aC5yb3VuZChhICogKDEgLSB0KSArIGIgKiB0KTtcbiAgfTtcbn1cbiIsInZhciBkZWdyZWVzID0gMTgwIC8gTWF0aC5QSTtcblxuZXhwb3J0IHZhciBpZGVudGl0eSA9IHtcbiAgdHJhbnNsYXRlWDogMCxcbiAgdHJhbnNsYXRlWTogMCxcbiAgcm90YXRlOiAwLFxuICBza2V3WDogMCxcbiAgc2NhbGVYOiAxLFxuICBzY2FsZVk6IDFcbn07XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIsIGMsIGQsIGUsIGYpIHtcbiAgdmFyIHNjYWxlWCwgc2NhbGVZLCBza2V3WDtcbiAgaWYgKHNjYWxlWCA9IE1hdGguc3FydChhICogYSArIGIgKiBiKSkgYSAvPSBzY2FsZVgsIGIgLz0gc2NhbGVYO1xuICBpZiAoc2tld1ggPSBhICogYyArIGIgKiBkKSBjIC09IGEgKiBza2V3WCwgZCAtPSBiICogc2tld1g7XG4gIGlmIChzY2FsZVkgPSBNYXRoLnNxcnQoYyAqIGMgKyBkICogZCkpIGMgLz0gc2NhbGVZLCBkIC89IHNjYWxlWSwgc2tld1ggLz0gc2NhbGVZO1xuICBpZiAoYSAqIGQgPCBiICogYykgYSA9IC1hLCBiID0gLWIsIHNrZXdYID0gLXNrZXdYLCBzY2FsZVggPSAtc2NhbGVYO1xuICByZXR1cm4ge1xuICAgIHRyYW5zbGF0ZVg6IGUsXG4gICAgdHJhbnNsYXRlWTogZixcbiAgICByb3RhdGU6IE1hdGguYXRhbjIoYiwgYSkgKiBkZWdyZWVzLFxuICAgIHNrZXdYOiBNYXRoLmF0YW4oc2tld1gpICogZGVncmVlcyxcbiAgICBzY2FsZVg6IHNjYWxlWCxcbiAgICBzY2FsZVk6IHNjYWxlWVxuICB9O1xufVxuIiwiaW1wb3J0IGRlY29tcG9zZSwge2lkZW50aXR5fSBmcm9tIFwiLi9kZWNvbXBvc2UuanNcIjtcblxudmFyIHN2Z05vZGU7XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLXVuZGVmICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VDc3ModmFsdWUpIHtcbiAgY29uc3QgbSA9IG5ldyAodHlwZW9mIERPTU1hdHJpeCA9PT0gXCJmdW5jdGlvblwiID8gRE9NTWF0cml4IDogV2ViS2l0Q1NTTWF0cml4KSh2YWx1ZSArIFwiXCIpO1xuICByZXR1cm4gbS5pc0lkZW50aXR5ID8gaWRlbnRpdHkgOiBkZWNvbXBvc2UobS5hLCBtLmIsIG0uYywgbS5kLCBtLmUsIG0uZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVN2Zyh2YWx1ZSkge1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIGlkZW50aXR5O1xuICBpZiAoIXN2Z05vZGUpIHN2Z05vZGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMoXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiLCBcImdcIik7XG4gIHN2Z05vZGUuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsIHZhbHVlKTtcbiAgaWYgKCEodmFsdWUgPSBzdmdOb2RlLnRyYW5zZm9ybS5iYXNlVmFsLmNvbnNvbGlkYXRlKCkpKSByZXR1cm4gaWRlbnRpdHk7XG4gIHZhbHVlID0gdmFsdWUubWF0cml4O1xuICByZXR1cm4gZGVjb21wb3NlKHZhbHVlLmEsIHZhbHVlLmIsIHZhbHVlLmMsIHZhbHVlLmQsIHZhbHVlLmUsIHZhbHVlLmYpO1xufVxuIiwiaW1wb3J0IG51bWJlciBmcm9tIFwiLi4vbnVtYmVyLmpzXCI7XG5pbXBvcnQge3BhcnNlQ3NzLCBwYXJzZVN2Z30gZnJvbSBcIi4vcGFyc2UuanNcIjtcblxuZnVuY3Rpb24gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2UsIHB4Q29tbWEsIHB4UGFyZW4sIGRlZ1BhcmVuKSB7XG5cbiAgZnVuY3Rpb24gcG9wKHMpIHtcbiAgICByZXR1cm4gcy5sZW5ndGggPyBzLnBvcCgpICsgXCIgXCIgOiBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdHJhbnNsYXRlKHhhLCB5YSwgeGIsIHliLCBzLCBxKSB7XG4gICAgaWYgKHhhICE9PSB4YiB8fCB5YSAhPT0geWIpIHtcbiAgICAgIHZhciBpID0gcy5wdXNoKFwidHJhbnNsYXRlKFwiLCBudWxsLCBweENvbW1hLCBudWxsLCBweFBhcmVuKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgfHwgeWIpIHtcbiAgICAgIHMucHVzaChcInRyYW5zbGF0ZShcIiArIHhiICsgcHhDb21tYSArIHliICsgcHhQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcm90YXRlKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgaWYgKGEgLSBiID4gMTgwKSBiICs9IDM2MDsgZWxzZSBpZiAoYiAtIGEgPiAxODApIGEgKz0gMzYwOyAvLyBzaG9ydGVzdCBwYXRoXG4gICAgICBxLnB1c2goe2k6IHMucHVzaChwb3AocykgKyBcInJvdGF0ZShcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJyb3RhdGUoXCIgKyBiICsgZGVnUGFyZW4pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNrZXdYKGEsIGIsIHMsIHEpIHtcbiAgICBpZiAoYSAhPT0gYikge1xuICAgICAgcS5wdXNoKHtpOiBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiwgbnVsbCwgZGVnUGFyZW4pIC0gMiwgeDogbnVtYmVyKGEsIGIpfSk7XG4gICAgfSBlbHNlIGlmIChiKSB7XG4gICAgICBzLnB1c2gocG9wKHMpICsgXCJza2V3WChcIiArIGIgKyBkZWdQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeGEsIHlhLCB4YiwgeWIsIHMsIHEpIHtcbiAgICBpZiAoeGEgIT09IHhiIHx8IHlhICE9PSB5Yikge1xuICAgICAgdmFyIGkgPSBzLnB1c2gocG9wKHMpICsgXCJzY2FsZShcIiwgbnVsbCwgXCIsXCIsIG51bGwsIFwiKVwiKTtcbiAgICAgIHEucHVzaCh7aTogaSAtIDQsIHg6IG51bWJlcih4YSwgeGIpfSwge2k6IGkgLSAyLCB4OiBudW1iZXIoeWEsIHliKX0pO1xuICAgIH0gZWxzZSBpZiAoeGIgIT09IDEgfHwgeWIgIT09IDEpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInNjYWxlKFwiICsgeGIgKyBcIixcIiArIHliICsgXCIpXCIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbihhLCBiKSB7XG4gICAgdmFyIHMgPSBbXSwgLy8gc3RyaW5nIGNvbnN0YW50cyBhbmQgcGxhY2Vob2xkZXJzXG4gICAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcbiAgICBhID0gcGFyc2UoYSksIGIgPSBwYXJzZShiKTtcbiAgICB0cmFuc2xhdGUoYS50cmFuc2xhdGVYLCBhLnRyYW5zbGF0ZVksIGIudHJhbnNsYXRlWCwgYi50cmFuc2xhdGVZLCBzLCBxKTtcbiAgICByb3RhdGUoYS5yb3RhdGUsIGIucm90YXRlLCBzLCBxKTtcbiAgICBza2V3WChhLnNrZXdYLCBiLnNrZXdYLCBzLCBxKTtcbiAgICBzY2FsZShhLnNjYWxlWCwgYS5zY2FsZVksIGIuc2NhbGVYLCBiLnNjYWxlWSwgcywgcSk7XG4gICAgYSA9IGIgPSBudWxsOyAvLyBnY1xuICAgIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgICB2YXIgaSA9IC0xLCBuID0gcS5sZW5ndGgsIG87XG4gICAgICB3aGlsZSAoKytpIDwgbikgc1sobyA9IHFbaV0pLmldID0gby54KHQpO1xuICAgICAgcmV0dXJuIHMuam9pbihcIlwiKTtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtQ3NzID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VDc3MsIFwicHgsIFwiLCBcInB4KVwiLCBcImRlZylcIik7XG5leHBvcnQgdmFyIGludGVycG9sYXRlVHJhbnNmb3JtU3ZnID0gaW50ZXJwb2xhdGVUcmFuc2Zvcm0ocGFyc2VTdmcsIFwiLCBcIiwgXCIpXCIsIFwiKVwiKTtcbiIsInZhciBmcmFtZSA9IDAsIC8vIGlzIGFuIGFuaW1hdGlvbiBmcmFtZSBwZW5kaW5nP1xuICAgIHRpbWVvdXQgPSAwLCAvLyBpcyBhIHRpbWVvdXQgcGVuZGluZz9cbiAgICBpbnRlcnZhbCA9IDAsIC8vIGFyZSBhbnkgdGltZXJzIGFjdGl2ZT9cbiAgICBwb2tlRGVsYXkgPSAxMDAwLCAvLyBob3cgZnJlcXVlbnRseSB3ZSBjaGVjayBmb3IgY2xvY2sgc2tld1xuICAgIHRhc2tIZWFkLFxuICAgIHRhc2tUYWlsLFxuICAgIGNsb2NrTGFzdCA9IDAsXG4gICAgY2xvY2tOb3cgPSAwLFxuICAgIGNsb2NrU2tldyA9IDAsXG4gICAgY2xvY2sgPSB0eXBlb2YgcGVyZm9ybWFuY2UgPT09IFwib2JqZWN0XCIgJiYgcGVyZm9ybWFuY2Uubm93ID8gcGVyZm9ybWFuY2UgOiBEYXRlLFxuICAgIHNldEZyYW1lID0gdHlwZW9mIHdpbmRvdyA9PT0gXCJvYmplY3RcIiAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lID8gd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZS5iaW5kKHdpbmRvdykgOiBmdW5jdGlvbihmKSB7IHNldFRpbWVvdXQoZiwgMTcpOyB9O1xuXG5leHBvcnQgZnVuY3Rpb24gbm93KCkge1xuICByZXR1cm4gY2xvY2tOb3cgfHwgKHNldEZyYW1lKGNsZWFyTm93KSwgY2xvY2tOb3cgPSBjbG9jay5ub3coKSArIGNsb2NrU2tldyk7XG59XG5cbmZ1bmN0aW9uIGNsZWFyTm93KCkge1xuICBjbG9ja05vdyA9IDA7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBUaW1lcigpIHtcbiAgdGhpcy5fY2FsbCA9XG4gIHRoaXMuX3RpbWUgPVxuICB0aGlzLl9uZXh0ID0gbnVsbDtcbn1cblxuVGltZXIucHJvdG90eXBlID0gdGltZXIucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVGltZXIsXG4gIHJlc3RhcnQ6IGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IFR5cGVFcnJvcihcImNhbGxiYWNrIGlzIG5vdCBhIGZ1bmN0aW9uXCIpO1xuICAgIHRpbWUgPSAodGltZSA9PSBudWxsID8gbm93KCkgOiArdGltZSkgKyAoZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXkpO1xuICAgIGlmICghdGhpcy5fbmV4dCAmJiB0YXNrVGFpbCAhPT0gdGhpcykge1xuICAgICAgaWYgKHRhc2tUYWlsKSB0YXNrVGFpbC5fbmV4dCA9IHRoaXM7XG4gICAgICBlbHNlIHRhc2tIZWFkID0gdGhpcztcbiAgICAgIHRhc2tUYWlsID0gdGhpcztcbiAgICB9XG4gICAgdGhpcy5fY2FsbCA9IGNhbGxiYWNrO1xuICAgIHRoaXMuX3RpbWUgPSB0aW1lO1xuICAgIHNsZWVwKCk7XG4gIH0sXG4gIHN0b3A6IGZ1bmN0aW9uKCkge1xuICAgIGlmICh0aGlzLl9jYWxsKSB7XG4gICAgICB0aGlzLl9jYWxsID0gbnVsbDtcbiAgICAgIHRoaXMuX3RpbWUgPSBJbmZpbml0eTtcbiAgICAgIHNsZWVwKCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gdGltZXIoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKSB7XG4gIHZhciB0ID0gbmV3IFRpbWVyO1xuICB0LnJlc3RhcnQoY2FsbGJhY2ssIGRlbGF5LCB0aW1lKTtcbiAgcmV0dXJuIHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lckZsdXNoKCkge1xuICBub3coKTsgLy8gR2V0IHRoZSBjdXJyZW50IHRpbWUsIGlmIG5vdCBhbHJlYWR5IHNldC5cbiAgKytmcmFtZTsgLy8gUHJldGVuZCB3ZeKAmXZlIHNldCBhbiBhbGFybSwgaWYgd2UgaGF2ZW7igJl0IGFscmVhZHkuXG4gIHZhciB0ID0gdGFza0hlYWQsIGU7XG4gIHdoaWxlICh0KSB7XG4gICAgaWYgKChlID0gY2xvY2tOb3cgLSB0Ll90aW1lKSA+PSAwKSB0Ll9jYWxsLmNhbGwodW5kZWZpbmVkLCBlKTtcbiAgICB0ID0gdC5fbmV4dDtcbiAgfVxuICAtLWZyYW1lO1xufVxuXG5mdW5jdGlvbiB3YWtlKCkge1xuICBjbG9ja05vdyA9IChjbG9ja0xhc3QgPSBjbG9jay5ub3coKSkgKyBjbG9ja1NrZXc7XG4gIGZyYW1lID0gdGltZW91dCA9IDA7XG4gIHRyeSB7XG4gICAgdGltZXJGbHVzaCgpO1xuICB9IGZpbmFsbHkge1xuICAgIGZyYW1lID0gMDtcbiAgICBuYXAoKTtcbiAgICBjbG9ja05vdyA9IDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gcG9rZSgpIHtcbiAgdmFyIG5vdyA9IGNsb2NrLm5vdygpLCBkZWxheSA9IG5vdyAtIGNsb2NrTGFzdDtcbiAgaWYgKGRlbGF5ID4gcG9rZURlbGF5KSBjbG9ja1NrZXcgLT0gZGVsYXksIGNsb2NrTGFzdCA9IG5vdztcbn1cblxuZnVuY3Rpb24gbmFwKCkge1xuICB2YXIgdDAsIHQxID0gdGFza0hlYWQsIHQyLCB0aW1lID0gSW5maW5pdHk7XG4gIHdoaWxlICh0MSkge1xuICAgIGlmICh0MS5fY2FsbCkge1xuICAgICAgaWYgKHRpbWUgPiB0MS5fdGltZSkgdGltZSA9IHQxLl90aW1lO1xuICAgICAgdDAgPSB0MSwgdDEgPSB0MS5fbmV4dDtcbiAgICB9IGVsc2Uge1xuICAgICAgdDIgPSB0MS5fbmV4dCwgdDEuX25leHQgPSBudWxsO1xuICAgICAgdDEgPSB0MCA/IHQwLl9uZXh0ID0gdDIgOiB0YXNrSGVhZCA9IHQyO1xuICAgIH1cbiAgfVxuICB0YXNrVGFpbCA9IHQwO1xuICBzbGVlcCh0aW1lKTtcbn1cblxuZnVuY3Rpb24gc2xlZXAodGltZSkge1xuICBpZiAoZnJhbWUpIHJldHVybjsgLy8gU29vbmVzdCBhbGFybSBhbHJlYWR5IHNldCwgb3Igd2lsbCBiZS5cbiAgaWYgKHRpbWVvdXQpIHRpbWVvdXQgPSBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gIHZhciBkZWxheSA9IHRpbWUgLSBjbG9ja05vdzsgLy8gU3RyaWN0bHkgbGVzcyB0aGFuIGlmIHdlIHJlY29tcHV0ZWQgY2xvY2tOb3cuXG4gIGlmIChkZWxheSA+IDI0KSB7XG4gICAgaWYgKHRpbWUgPCBJbmZpbml0eSkgdGltZW91dCA9IHNldFRpbWVvdXQod2FrZSwgdGltZSAtIGNsb2NrLm5vdygpIC0gY2xvY2tTa2V3KTtcbiAgICBpZiAoaW50ZXJ2YWwpIGludGVydmFsID0gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gIH0gZWxzZSB7XG4gICAgaWYgKCFpbnRlcnZhbCkgY2xvY2tMYXN0ID0gY2xvY2subm93KCksIGludGVydmFsID0gc2V0SW50ZXJ2YWwocG9rZSwgcG9rZURlbGF5KTtcbiAgICBmcmFtZSA9IDEsIHNldEZyYW1lKHdha2UpO1xuICB9XG59XG4iLCJpbXBvcnQge1RpbWVyfSBmcm9tIFwiLi90aW1lci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgdmFyIHQgPSBuZXcgVGltZXI7XG4gIGRlbGF5ID0gZGVsYXkgPT0gbnVsbCA/IDAgOiArZGVsYXk7XG4gIHQucmVzdGFydChlbGFwc2VkID0+IHtcbiAgICB0LnN0b3AoKTtcbiAgICBjYWxsYmFjayhlbGFwc2VkICsgZGVsYXkpO1xuICB9LCBkZWxheSwgdGltZSk7XG4gIHJldHVybiB0O1xufVxuIiwiaW1wb3J0IHtkaXNwYXRjaH0gZnJvbSBcImQzLWRpc3BhdGNoXCI7XG5pbXBvcnQge3RpbWVyLCB0aW1lb3V0fSBmcm9tIFwiZDMtdGltZXJcIjtcblxudmFyIGVtcHR5T24gPSBkaXNwYXRjaChcInN0YXJ0XCIsIFwiZW5kXCIsIFwiY2FuY2VsXCIsIFwiaW50ZXJydXB0XCIpO1xudmFyIGVtcHR5VHdlZW4gPSBbXTtcblxuZXhwb3J0IHZhciBDUkVBVEVEID0gMDtcbmV4cG9ydCB2YXIgU0NIRURVTEVEID0gMTtcbmV4cG9ydCB2YXIgU1RBUlRJTkcgPSAyO1xuZXhwb3J0IHZhciBTVEFSVEVEID0gMztcbmV4cG9ydCB2YXIgUlVOTklORyA9IDQ7XG5leHBvcnQgdmFyIEVORElORyA9IDU7XG5leHBvcnQgdmFyIEVOREVEID0gNjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSwgbmFtZSwgaWQsIGluZGV4LCBncm91cCwgdGltaW5nKSB7XG4gIHZhciBzY2hlZHVsZXMgPSBub2RlLl9fdHJhbnNpdGlvbjtcbiAgaWYgKCFzY2hlZHVsZXMpIG5vZGUuX190cmFuc2l0aW9uID0ge307XG4gIGVsc2UgaWYgKGlkIGluIHNjaGVkdWxlcykgcmV0dXJuO1xuICBjcmVhdGUobm9kZSwgaWQsIHtcbiAgICBuYW1lOiBuYW1lLFxuICAgIGluZGV4OiBpbmRleCwgLy8gRm9yIGNvbnRleHQgZHVyaW5nIGNhbGxiYWNrLlxuICAgIGdyb3VwOiBncm91cCwgLy8gRm9yIGNvbnRleHQgZHVyaW5nIGNhbGxiYWNrLlxuICAgIG9uOiBlbXB0eU9uLFxuICAgIHR3ZWVuOiBlbXB0eVR3ZWVuLFxuICAgIHRpbWU6IHRpbWluZy50aW1lLFxuICAgIGRlbGF5OiB0aW1pbmcuZGVsYXksXG4gICAgZHVyYXRpb246IHRpbWluZy5kdXJhdGlvbixcbiAgICBlYXNlOiB0aW1pbmcuZWFzZSxcbiAgICB0aW1lcjogbnVsbCxcbiAgICBzdGF0ZTogQ1JFQVRFRFxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gZ2V0KG5vZGUsIGlkKTtcbiAgaWYgKHNjaGVkdWxlLnN0YXRlID4gQ1JFQVRFRCkgdGhyb3cgbmV3IEVycm9yKFwidG9vIGxhdGU7IGFscmVhZHkgc2NoZWR1bGVkXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gZ2V0KG5vZGUsIGlkKTtcbiAgaWYgKHNjaGVkdWxlLnN0YXRlID4gU1RBUlRFRCkgdGhyb3cgbmV3IEVycm9yKFwidG9vIGxhdGU7IGFscmVhZHkgcnVubmluZ1wiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0KG5vZGUsIGlkKSB7XG4gIHZhciBzY2hlZHVsZSA9IG5vZGUuX190cmFuc2l0aW9uO1xuICBpZiAoIXNjaGVkdWxlIHx8ICEoc2NoZWR1bGUgPSBzY2hlZHVsZVtpZF0pKSB0aHJvdyBuZXcgRXJyb3IoXCJ0cmFuc2l0aW9uIG5vdCBmb3VuZFwiKTtcbiAgcmV0dXJuIHNjaGVkdWxlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGUobm9kZSwgaWQsIHNlbGYpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uLFxuICAgICAgdHdlZW47XG5cbiAgLy8gSW5pdGlhbGl6ZSB0aGUgc2VsZiB0aW1lciB3aGVuIHRoZSB0cmFuc2l0aW9uIGlzIGNyZWF0ZWQuXG4gIC8vIE5vdGUgdGhlIGFjdHVhbCBkZWxheSBpcyBub3Qga25vd24gdW50aWwgdGhlIGZpcnN0IGNhbGxiYWNrIVxuICBzY2hlZHVsZXNbaWRdID0gc2VsZjtcbiAgc2VsZi50aW1lciA9IHRpbWVyKHNjaGVkdWxlLCAwLCBzZWxmLnRpbWUpO1xuXG4gIGZ1bmN0aW9uIHNjaGVkdWxlKGVsYXBzZWQpIHtcbiAgICBzZWxmLnN0YXRlID0gU0NIRURVTEVEO1xuICAgIHNlbGYudGltZXIucmVzdGFydChzdGFydCwgc2VsZi5kZWxheSwgc2VsZi50aW1lKTtcblxuICAgIC8vIElmIHRoZSBlbGFwc2VkIGRlbGF5IGlzIGxlc3MgdGhhbiBvdXIgZmlyc3Qgc2xlZXAsIHN0YXJ0IGltbWVkaWF0ZWx5LlxuICAgIGlmIChzZWxmLmRlbGF5IDw9IGVsYXBzZWQpIHN0YXJ0KGVsYXBzZWQgLSBzZWxmLmRlbGF5KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0KGVsYXBzZWQpIHtcbiAgICB2YXIgaSwgaiwgbiwgbztcblxuICAgIC8vIElmIHRoZSBzdGF0ZSBpcyBub3QgU0NIRURVTEVELCB0aGVuIHdlIHByZXZpb3VzbHkgZXJyb3JlZCBvbiBzdGFydC5cbiAgICBpZiAoc2VsZi5zdGF0ZSAhPT0gU0NIRURVTEVEKSByZXR1cm4gc3RvcCgpO1xuXG4gICAgZm9yIChpIGluIHNjaGVkdWxlcykge1xuICAgICAgbyA9IHNjaGVkdWxlc1tpXTtcbiAgICAgIGlmIChvLm5hbWUgIT09IHNlbGYubmFtZSkgY29udGludWU7XG5cbiAgICAgIC8vIFdoaWxlIHRoaXMgZWxlbWVudCBhbHJlYWR5IGhhcyBhIHN0YXJ0aW5nIHRyYW5zaXRpb24gZHVyaW5nIHRoaXMgZnJhbWUsXG4gICAgICAvLyBkZWZlciBzdGFydGluZyBhbiBpbnRlcnJ1cHRpbmcgdHJhbnNpdGlvbiB1bnRpbCB0aGF0IHRyYW5zaXRpb24gaGFzIGFcbiAgICAgIC8vIGNoYW5jZSB0byB0aWNrIChhbmQgcG9zc2libHkgZW5kKTsgc2VlIGQzL2QzLXRyYW5zaXRpb24jNTQhXG4gICAgICBpZiAoby5zdGF0ZSA9PT0gU1RBUlRFRCkgcmV0dXJuIHRpbWVvdXQoc3RhcnQpO1xuXG4gICAgICAvLyBJbnRlcnJ1cHQgdGhlIGFjdGl2ZSB0cmFuc2l0aW9uLCBpZiBhbnkuXG4gICAgICBpZiAoby5zdGF0ZSA9PT0gUlVOTklORykge1xuICAgICAgICBvLnN0YXRlID0gRU5ERUQ7XG4gICAgICAgIG8udGltZXIuc3RvcCgpO1xuICAgICAgICBvLm9uLmNhbGwoXCJpbnRlcnJ1cHRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgby5pbmRleCwgby5ncm91cCk7XG4gICAgICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gICAgICB9XG5cbiAgICAgIC8vIENhbmNlbCBhbnkgcHJlLWVtcHRlZCB0cmFuc2l0aW9ucy5cbiAgICAgIGVsc2UgaWYgKCtpIDwgaWQpIHtcbiAgICAgICAgby5zdGF0ZSA9IEVOREVEO1xuICAgICAgICBvLnRpbWVyLnN0b3AoKTtcbiAgICAgICAgby5vbi5jYWxsKFwiY2FuY2VsXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIG8uaW5kZXgsIG8uZ3JvdXApO1xuICAgICAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIERlZmVyIHRoZSBmaXJzdCB0aWNrIHRvIGVuZCBvZiB0aGUgY3VycmVudCBmcmFtZTsgc2VlIGQzL2QzIzE1NzYuXG4gICAgLy8gTm90ZSB0aGUgdHJhbnNpdGlvbiBtYXkgYmUgY2FuY2VsZWQgYWZ0ZXIgc3RhcnQgYW5kIGJlZm9yZSB0aGUgZmlyc3QgdGljayFcbiAgICAvLyBOb3RlIHRoaXMgbXVzdCBiZSBzY2hlZHVsZWQgYmVmb3JlIHRoZSBzdGFydCBldmVudDsgc2VlIGQzL2QzLXRyYW5zaXRpb24jMTYhXG4gICAgLy8gQXNzdW1pbmcgdGhpcyBpcyBzdWNjZXNzZnVsLCBzdWJzZXF1ZW50IGNhbGxiYWNrcyBnbyBzdHJhaWdodCB0byB0aWNrLlxuICAgIHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoc2VsZi5zdGF0ZSA9PT0gU1RBUlRFRCkge1xuICAgICAgICBzZWxmLnN0YXRlID0gUlVOTklORztcbiAgICAgICAgc2VsZi50aW1lci5yZXN0YXJ0KHRpY2ssIHNlbGYuZGVsYXksIHNlbGYudGltZSk7XG4gICAgICAgIHRpY2soZWxhcHNlZCk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgc3RhcnQgZXZlbnQuXG4gICAgLy8gTm90ZSB0aGlzIG11c3QgYmUgZG9uZSBiZWZvcmUgdGhlIHR3ZWVuIGFyZSBpbml0aWFsaXplZC5cbiAgICBzZWxmLnN0YXRlID0gU1RBUlRJTkc7XG4gICAgc2VsZi5vbi5jYWxsKFwic3RhcnRcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCk7XG4gICAgaWYgKHNlbGYuc3RhdGUgIT09IFNUQVJUSU5HKSByZXR1cm47IC8vIGludGVycnVwdGVkXG4gICAgc2VsZi5zdGF0ZSA9IFNUQVJURUQ7XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSB0d2VlbiwgZGVsZXRpbmcgbnVsbCB0d2Vlbi5cbiAgICB0d2VlbiA9IG5ldyBBcnJheShuID0gc2VsZi50d2Vlbi5sZW5ndGgpO1xuICAgIGZvciAoaSA9IDAsIGogPSAtMTsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG8gPSBzZWxmLnR3ZWVuW2ldLnZhbHVlLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgc2VsZi5pbmRleCwgc2VsZi5ncm91cCkpIHtcbiAgICAgICAgdHdlZW5bKytqXSA9IG87XG4gICAgICB9XG4gICAgfVxuICAgIHR3ZWVuLmxlbmd0aCA9IGogKyAxO1xuICB9XG5cbiAgZnVuY3Rpb24gdGljayhlbGFwc2VkKSB7XG4gICAgdmFyIHQgPSBlbGFwc2VkIDwgc2VsZi5kdXJhdGlvbiA/IHNlbGYuZWFzZS5jYWxsKG51bGwsIGVsYXBzZWQgLyBzZWxmLmR1cmF0aW9uKSA6IChzZWxmLnRpbWVyLnJlc3RhcnQoc3RvcCksIHNlbGYuc3RhdGUgPSBFTkRJTkcsIDEpLFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSB0d2Vlbi5sZW5ndGg7XG5cbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgdHdlZW5baV0uY2FsbChub2RlLCB0KTtcbiAgICB9XG5cbiAgICAvLyBEaXNwYXRjaCB0aGUgZW5kIGV2ZW50LlxuICAgIGlmIChzZWxmLnN0YXRlID09PSBFTkRJTkcpIHtcbiAgICAgIHNlbGYub24uY2FsbChcImVuZFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKTtcbiAgICAgIHN0b3AoKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzdG9wKCkge1xuICAgIHNlbGYuc3RhdGUgPSBFTkRFRDtcbiAgICBzZWxmLnRpbWVyLnN0b3AoKTtcbiAgICBkZWxldGUgc2NoZWR1bGVzW2lkXTtcbiAgICBmb3IgKHZhciBpIGluIHNjaGVkdWxlcykgcmV0dXJuOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gICAgZGVsZXRlIG5vZGUuX190cmFuc2l0aW9uO1xuICB9XG59XG4iLCJpbXBvcnQge1NUQVJUSU5HLCBFTkRJTkcsIEVOREVEfSBmcm9tIFwiLi90cmFuc2l0aW9uL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5vZGUsIG5hbWUpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uLFxuICAgICAgc2NoZWR1bGUsXG4gICAgICBhY3RpdmUsXG4gICAgICBlbXB0eSA9IHRydWUsXG4gICAgICBpO1xuXG4gIGlmICghc2NoZWR1bGVzKSByZXR1cm47XG5cbiAgbmFtZSA9IG5hbWUgPT0gbnVsbCA/IG51bGwgOiBuYW1lICsgXCJcIjtcblxuICBmb3IgKGkgaW4gc2NoZWR1bGVzKSB7XG4gICAgaWYgKChzY2hlZHVsZSA9IHNjaGVkdWxlc1tpXSkubmFtZSAhPT0gbmFtZSkgeyBlbXB0eSA9IGZhbHNlOyBjb250aW51ZTsgfVxuICAgIGFjdGl2ZSA9IHNjaGVkdWxlLnN0YXRlID4gU1RBUlRJTkcgJiYgc2NoZWR1bGUuc3RhdGUgPCBFTkRJTkc7XG4gICAgc2NoZWR1bGUuc3RhdGUgPSBFTkRFRDtcbiAgICBzY2hlZHVsZS50aW1lci5zdG9wKCk7XG4gICAgc2NoZWR1bGUub24uY2FsbChhY3RpdmUgPyBcImludGVycnVwdFwiIDogXCJjYW5jZWxcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgc2NoZWR1bGUuaW5kZXgsIHNjaGVkdWxlLmdyb3VwKTtcbiAgICBkZWxldGUgc2NoZWR1bGVzW2ldO1xuICB9XG5cbiAgaWYgKGVtcHR5KSBkZWxldGUgbm9kZS5fX3RyYW5zaXRpb247XG59XG4iLCJpbXBvcnQgaW50ZXJydXB0IGZyb20gXCIuLi9pbnRlcnJ1cHQuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICByZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIGludGVycnVwdCh0aGlzLCBuYW1lKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQge2dldCwgc2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiB0d2VlblJlbW92ZShpZCwgbmFtZSkge1xuICB2YXIgdHdlZW4wLCB0d2VlbjE7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICB0d2VlbiA9IHNjaGVkdWxlLnR3ZWVuO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCB0d2VlbiB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCB0d2VlbiBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAodHdlZW4gIT09IHR3ZWVuMCkge1xuICAgICAgdHdlZW4xID0gdHdlZW4wID0gdHdlZW47XG4gICAgICBmb3IgKHZhciBpID0gMCwgbiA9IHR3ZWVuMS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKHR3ZWVuMVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgdHdlZW4xID0gdHdlZW4xLnNsaWNlKCk7XG4gICAgICAgICAgdHdlZW4xLnNwbGljZShpLCAxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHNjaGVkdWxlLnR3ZWVuID0gdHdlZW4xO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0d2VlbkZ1bmN0aW9uKGlkLCBuYW1lLCB2YWx1ZSkge1xuICB2YXIgdHdlZW4wLCB0d2VlbjE7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgdHdlZW4gPSBzY2hlZHVsZS50d2VlbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgdHdlZW4gd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgdHdlZW4gYW5kIHdl4oCZcmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKHR3ZWVuICE9PSB0d2VlbjApIHtcbiAgICAgIHR3ZWVuMSA9ICh0d2VlbjAgPSB0d2Vlbikuc2xpY2UoKTtcbiAgICAgIGZvciAodmFyIHQgPSB7bmFtZTogbmFtZSwgdmFsdWU6IHZhbHVlfSwgaSA9IDAsIG4gPSB0d2VlbjEubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgICAgIGlmICh0d2VlbjFbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICAgIHR3ZWVuMVtpXSA9IHQ7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChpID09PSBuKSB0d2VlbjEucHVzaCh0KTtcbiAgICB9XG5cbiAgICBzY2hlZHVsZS50d2VlbiA9IHR3ZWVuMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgbmFtZSArPSBcIlwiO1xuXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgIHZhciB0d2VlbiA9IGdldCh0aGlzLm5vZGUoKSwgaWQpLnR3ZWVuO1xuICAgIGZvciAodmFyIGkgPSAwLCBuID0gdHdlZW4ubGVuZ3RoLCB0OyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKHQgPSB0d2VlbltpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgICByZXR1cm4gdC52YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsID8gdHdlZW5SZW1vdmUgOiB0d2VlbkZ1bmN0aW9uKShpZCwgbmFtZSwgdmFsdWUpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHR3ZWVuVmFsdWUodHJhbnNpdGlvbiwgbmFtZSwgdmFsdWUpIHtcbiAgdmFyIGlkID0gdHJhbnNpdGlvbi5faWQ7XG5cbiAgdHJhbnNpdGlvbi5lYWNoKGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCk7XG4gICAgKHNjaGVkdWxlLnZhbHVlIHx8IChzY2hlZHVsZS52YWx1ZSA9IHt9KSlbbmFtZV0gPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9KTtcblxuICByZXR1cm4gZnVuY3Rpb24obm9kZSkge1xuICAgIHJldHVybiBnZXQobm9kZSwgaWQpLnZhbHVlW25hbWVdO1xuICB9O1xufVxuIiwiaW1wb3J0IHtjb2xvcn0gZnJvbSBcImQzLWNvbG9yXCI7XG5pbXBvcnQge2ludGVycG9sYXRlTnVtYmVyLCBpbnRlcnBvbGF0ZVJnYiwgaW50ZXJwb2xhdGVTdHJpbmd9IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBjO1xuICByZXR1cm4gKHR5cGVvZiBiID09PSBcIm51bWJlclwiID8gaW50ZXJwb2xhdGVOdW1iZXJcbiAgICAgIDogYiBpbnN0YW5jZW9mIGNvbG9yID8gaW50ZXJwb2xhdGVSZ2JcbiAgICAgIDogKGMgPSBjb2xvcihiKSkgPyAoYiA9IGMsIGludGVycG9sYXRlUmdiKVxuICAgICAgOiBpbnRlcnBvbGF0ZVN0cmluZykoYSwgYik7XG59XG4iLCJpbXBvcnQge2ludGVycG9sYXRlVHJhbnNmb3JtU3ZnIGFzIGludGVycG9sYXRlVHJhbnNmb3JtfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7bmFtZXNwYWNlfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgaW50ZXJwb2xhdGUgZnJvbSBcIi4vaW50ZXJwb2xhdGUuanNcIjtcblxuZnVuY3Rpb24gYXR0clJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZShuYW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0clJlbW92ZU5TKGZ1bGxuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudChuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUxKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50TlMoZnVsbG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uKG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwLCB2YWx1ZTEgPSB2YWx1ZSh0aGlzKSwgc3RyaW5nMTtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHJldHVybiB2b2lkIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICAgIHN0cmluZzAgPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJGdW5jdGlvbk5TKGZ1bGxuYW1lLCBpbnRlcnBvbGF0ZSwgdmFsdWUpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMTAsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCwgdmFsdWUxID0gdmFsdWUodGhpcyksIHN0cmluZzE7XG4gICAgaWYgKHZhbHVlMSA9PSBudWxsKSByZXR1cm4gdm9pZCB0aGlzLnJlbW92ZUF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gICAgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICByZXR1cm4gc3RyaW5nMCA9PT0gc3RyaW5nMSA/IG51bGxcbiAgICAgICAgOiBzdHJpbmcwID09PSBzdHJpbmcwMCAmJiBzdHJpbmcxID09PSBzdHJpbmcxMCA/IGludGVycG9sYXRlMFxuICAgICAgICA6IChzdHJpbmcxMCA9IHN0cmluZzEsIGludGVycG9sYXRlMCA9IGludGVycG9sYXRlKHN0cmluZzAwID0gc3RyaW5nMCwgdmFsdWUxKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHZhciBmdWxsbmFtZSA9IG5hbWVzcGFjZShuYW1lKSwgaSA9IGZ1bGxuYW1lID09PSBcInRyYW5zZm9ybVwiID8gaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBpbnRlcnBvbGF0ZTtcbiAgcmV0dXJuIHRoaXMuYXR0clR3ZWVuKG5hbWUsIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJGdW5jdGlvbk5TIDogYXR0ckZ1bmN0aW9uKShmdWxsbmFtZSwgaSwgdHdlZW5WYWx1ZSh0aGlzLCBcImF0dHIuXCIgKyBuYW1lLCB2YWx1ZSkpXG4gICAgICA6IHZhbHVlID09IG51bGwgPyAoZnVsbG5hbWUubG9jYWwgPyBhdHRyUmVtb3ZlTlMgOiBhdHRyUmVtb3ZlKShmdWxsbmFtZSlcbiAgICAgIDogKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckNvbnN0YW50TlMgOiBhdHRyQ29uc3RhbnQpKGZ1bGxuYW1lLCBpLCB2YWx1ZSkpO1xufVxuIiwiaW1wb3J0IHtuYW1lc3BhY2V9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcblxuZnVuY3Rpb24gYXR0ckludGVycG9sYXRlKG5hbWUsIGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCBpLmNhbGwodGhpcywgdCkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRySW50ZXJwb2xhdGVOUyhmdWxsbmFtZSwgaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsLCBpLmNhbGwodGhpcywgdCkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyVHdlZW5OUyhmdWxsbmFtZSwgdmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiBhdHRySW50ZXJwb2xhdGVOUyhmdWxsbmFtZSwgaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmZ1bmN0aW9uIGF0dHJUd2VlbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIGF0dHJJbnRlcnBvbGF0ZShuYW1lLCBpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGtleSA9IFwiYXR0ci5cIiArIG5hbWU7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIChmdWxsbmFtZS5sb2NhbCA/IGF0dHJUd2Vlbk5TIDogYXR0clR3ZWVuKShmdWxsbmFtZSwgdmFsdWUpKTtcbn1cbiIsImltcG9ydCB7Z2V0LCBpbml0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBkZWxheUZ1bmN0aW9uKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgaW5pdCh0aGlzLCBpZCkuZGVsYXkgPSArdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZGVsYXlDb25zdGFudChpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID0gK3ZhbHVlLCBmdW5jdGlvbigpIHtcbiAgICBpbml0KHRoaXMsIGlkKS5kZWxheSA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBkZWxheUZ1bmN0aW9uXG4gICAgICAgICAgOiBkZWxheUNvbnN0YW50KShpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5kZWxheTtcbn1cbiIsImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGR1cmF0aW9uRnVuY3Rpb24oaWQsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmR1cmF0aW9uID0gK3ZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGR1cmF0aW9uQ29uc3RhbnQoaWQsIHZhbHVlKSB7XG4gIHJldHVybiB2YWx1ZSA9ICt2YWx1ZSwgZnVuY3Rpb24oKSB7XG4gICAgc2V0KHRoaXMsIGlkKS5kdXJhdGlvbiA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICAgICAgPyBkdXJhdGlvbkZ1bmN0aW9uXG4gICAgICAgICAgOiBkdXJhdGlvbkNvbnN0YW50KShpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5kdXJhdGlvbjtcbn1cbiIsImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGVhc2VDb25zdGFudChpZCwgdmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmVhc2UgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKGVhc2VDb25zdGFudChpZCwgdmFsdWUpKVxuICAgICAgOiBnZXQodGhpcy5ub2RlKCksIGlkKS5lYXNlO1xufVxuIiwiaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGVhc2VWYXJ5aW5nKGlkLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh0eXBlb2YgdiAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gICAgc2V0KHRoaXMsIGlkKS5lYXNlID0gdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiB0aGlzLmVhY2goZWFzZVZhcnlpbmcodGhpcy5faWQsIHZhbHVlKSk7XG59XG4iLCJpbXBvcnQge21hdGNoZXJ9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBtYXRjaCAhPT0gXCJmdW5jdGlvblwiKSBtYXRjaCA9IG1hdGNoZXIobWF0Y2gpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBbXSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBtYXRjaC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkge1xuICAgICAgICBzdWJncm91cC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMsIHRoaXMuX25hbWUsIHRoaXMuX2lkKTtcbn1cbiIsImltcG9ydCB7VHJhbnNpdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHJhbnNpdGlvbikge1xuICBpZiAodHJhbnNpdGlvbi5faWQgIT09IHRoaXMuX2lkKSB0aHJvdyBuZXcgRXJyb3I7XG5cbiAgZm9yICh2YXIgZ3JvdXBzMCA9IHRoaXMuX2dyb3VwcywgZ3JvdXBzMSA9IHRyYW5zaXRpb24uX2dyb3VwcywgbTAgPSBncm91cHMwLmxlbmd0aCwgbTEgPSBncm91cHMxLmxlbmd0aCwgbSA9IE1hdGgubWluKG0wLCBtMSksIG1lcmdlcyA9IG5ldyBBcnJheShtMCksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAwID0gZ3JvdXBzMFtqXSwgZ3JvdXAxID0gZ3JvdXBzMVtqXSwgbiA9IGdyb3VwMC5sZW5ndGgsIG1lcmdlID0gbWVyZ2VzW2pdID0gbmV3IEFycmF5KG4pLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cDBbaV0gfHwgZ3JvdXAxW2ldKSB7XG4gICAgICAgIG1lcmdlW2ldID0gbm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmb3IgKDsgaiA8IG0wOyArK2opIHtcbiAgICBtZXJnZXNbal0gPSBncm91cHMwW2pdO1xuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKG1lcmdlcywgdGhpcy5fcGFyZW50cywgdGhpcy5fbmFtZSwgdGhpcy5faWQpO1xufVxuIiwiaW1wb3J0IHtnZXQsIHNldCwgaW5pdH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gc3RhcnQobmFtZSkge1xuICByZXR1cm4gKG5hbWUgKyBcIlwiKS50cmltKCkuc3BsaXQoL158XFxzKy8pLmV2ZXJ5KGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgcmV0dXJuICF0IHx8IHQgPT09IFwic3RhcnRcIjtcbiAgfSk7XG59XG5cbmZ1bmN0aW9uIG9uRnVuY3Rpb24oaWQsIG5hbWUsIGxpc3RlbmVyKSB7XG4gIHZhciBvbjAsIG9uMSwgc2l0ID0gc3RhcnQobmFtZSkgPyBpbml0IDogc2V0O1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2l0KHRoaXMsIGlkKSxcbiAgICAgICAgb24gPSBzY2hlZHVsZS5vbjtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAob24gIT09IG9uMCkgKG9uMSA9IChvbjAgPSBvbikuY29weSgpKS5vbihuYW1lLCBsaXN0ZW5lcik7XG5cbiAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGlkID0gdGhpcy5faWQ7XG5cbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAyXG4gICAgICA/IGdldCh0aGlzLm5vZGUoKSwgaWQpLm9uLm9uKG5hbWUpXG4gICAgICA6IHRoaXMuZWFjaChvbkZ1bmN0aW9uKGlkLCBuYW1lLCBsaXN0ZW5lcikpO1xufVxuIiwiZnVuY3Rpb24gcmVtb3ZlRnVuY3Rpb24oaWQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gICAgZm9yICh2YXIgaSBpbiB0aGlzLl9fdHJhbnNpdGlvbikgaWYgKCtpICE9PSBpZCkgcmV0dXJuO1xuICAgIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLm9uKFwiZW5kLnJlbW92ZVwiLCByZW1vdmVGdW5jdGlvbih0aGlzLl9pZCkpO1xufVxuIiwiaW1wb3J0IHtzZWxlY3Rvcn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQgPSB0aGlzLl9pZDtcblxuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvcihzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIHN1Ym5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKHN1Ym5vZGUgPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpKSB7XG4gICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIHN1Ymdyb3VwW2ldID0gc3Vibm9kZTtcbiAgICAgICAgc2NoZWR1bGUoc3ViZ3JvdXBbaV0sIG5hbWUsIGlkLCBpLCBzdWJncm91cCwgZ2V0KG5vZGUsIGlkKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwiaW1wb3J0IHtzZWxlY3RvckFsbH0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlLCB7Z2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3QpIHtcbiAgdmFyIG5hbWUgPSB0aGlzLl9uYW1lLFxuICAgICAgaWQgPSB0aGlzLl9pZDtcblxuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvckFsbChzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IFtdLCBwYXJlbnRzID0gW10sIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIGZvciAodmFyIGNoaWxkcmVuID0gc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApLCBjaGlsZCwgaW5oZXJpdCA9IGdldChub2RlLCBpZCksIGsgPSAwLCBsID0gY2hpbGRyZW4ubGVuZ3RoOyBrIDwgbDsgKytrKSB7XG4gICAgICAgICAgaWYgKGNoaWxkID0gY2hpbGRyZW5ba10pIHtcbiAgICAgICAgICAgIHNjaGVkdWxlKGNoaWxkLCBuYW1lLCBpZCwgaywgY2hpbGRyZW4sIGluaGVyaXQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdWJncm91cHMucHVzaChjaGlsZHJlbik7XG4gICAgICAgIHBhcmVudHMucHVzaChub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCBwYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLCJpbXBvcnQge3NlbGVjdGlvbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuXG52YXIgU2VsZWN0aW9uID0gc2VsZWN0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RvcjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2dyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCJpbXBvcnQge2ludGVycG9sYXRlVHJhbnNmb3JtQ3NzIGFzIGludGVycG9sYXRlVHJhbnNmb3JtfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCB7c3R5bGV9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7c2V0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuaW1wb3J0IGludGVycG9sYXRlIGZyb20gXCIuL2ludGVycG9sYXRlLmpzXCI7XG5cbmZ1bmN0aW9uIHN0eWxlTnVsbChuYW1lLCBpbnRlcnBvbGF0ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSksXG4gICAgICAgIHN0cmluZzEgPSAodGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKSwgc3R5bGUodGhpcywgbmFtZSkpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCBzdHJpbmcxMCA9IHN0cmluZzEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUNvbnN0YW50KG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHN0eWxlKHRoaXMsIG5hbWUpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUZ1bmN0aW9uKG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSksXG4gICAgICAgIHZhbHVlMSA9IHZhbHVlKHRoaXMpLFxuICAgICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIjtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHN0cmluZzEgPSB2YWx1ZTEgPSAodGhpcy5zdHlsZS5yZW1vdmVQcm9wZXJ0eShuYW1lKSwgc3R5bGUodGhpcywgbmFtZSkpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gc3R5bGVNYXliZVJlbW92ZShpZCwgbmFtZSkge1xuICB2YXIgb24wLCBvbjEsIGxpc3RlbmVyMCwga2V5ID0gXCJzdHlsZS5cIiArIG5hbWUsIGV2ZW50ID0gXCJlbmQuXCIgKyBrZXksIHJlbW92ZTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIG9uID0gc2NoZWR1bGUub24sXG4gICAgICAgIGxpc3RlbmVyID0gc2NoZWR1bGUudmFsdWVba2V5XSA9PSBudWxsID8gcmVtb3ZlIHx8IChyZW1vdmUgPSBzdHlsZVJlbW92ZShuYW1lKSkgOiB1bmRlZmluZWQ7XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAvLyBqdXN0IGFzc2lnbiB0aGUgdXBkYXRlZCBzaGFyZWQgZGlzcGF0Y2ggYW5kIHdl4oCZcmUgZG9uZSFcbiAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgaWYgKG9uICE9PSBvbjAgfHwgbGlzdGVuZXIwICE9PSBsaXN0ZW5lcikgKG9uMSA9IChvbjAgPSBvbikuY29weSgpKS5vbihldmVudCwgbGlzdGVuZXIwID0gbGlzdGVuZXIpO1xuXG4gICAgc2NoZWR1bGUub24gPSBvbjE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIgaSA9IChuYW1lICs9IFwiXCIpID09PSBcInRyYW5zZm9ybVwiID8gaW50ZXJwb2xhdGVUcmFuc2Zvcm0gOiBpbnRlcnBvbGF0ZTtcbiAgcmV0dXJuIHZhbHVlID09IG51bGwgPyB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZU51bGwobmFtZSwgaSkpXG4gICAgICAub24oXCJlbmQuc3R5bGUuXCIgKyBuYW1lLCBzdHlsZVJlbW92ZShuYW1lKSlcbiAgICA6IHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiID8gdGhpc1xuICAgICAgLnN0eWxlVHdlZW4obmFtZSwgc3R5bGVGdW5jdGlvbihuYW1lLCBpLCB0d2VlblZhbHVlKHRoaXMsIFwic3R5bGUuXCIgKyBuYW1lLCB2YWx1ZSkpKVxuICAgICAgLmVhY2goc3R5bGVNYXliZVJlbW92ZSh0aGlzLl9pZCwgbmFtZSkpXG4gICAgOiB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZUNvbnN0YW50KG5hbWUsIGksIHZhbHVlKSwgcHJpb3JpdHkpXG4gICAgICAub24oXCJlbmQuc3R5bGUuXCIgKyBuYW1lLCBudWxsKTtcbn1cbiIsImZ1bmN0aW9uIHN0eWxlSW50ZXJwb2xhdGUobmFtZSwgaSwgcHJpb3JpdHkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIGkuY2FsbCh0aGlzLCB0KSwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZVR3ZWVuKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIgdCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQgPSAoaTAgPSBpKSAmJiBzdHlsZUludGVycG9sYXRlKG5hbWUsIGksIHByaW9yaXR5KTtcbiAgICByZXR1cm4gdDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpIHtcbiAgdmFyIGtleSA9IFwic3R5bGUuXCIgKyAobmFtZSArPSBcIlwiKTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIHN0eWxlVHdlZW4obmFtZSwgdmFsdWUsIHByaW9yaXR5ID09IG51bGwgPyBcIlwiIDogcHJpb3JpdHkpKTtcbn1cbiIsImltcG9ydCB7dHdlZW5WYWx1ZX0gZnJvbSBcIi4vdHdlZW4uanNcIjtcblxuZnVuY3Rpb24gdGV4dENvbnN0YW50KHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gdmFsdWU7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRleHRGdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlMSA9IHZhbHVlKHRoaXMpO1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTEgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZTE7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiB0aGlzLnR3ZWVuKFwidGV4dFwiLCB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgPyB0ZXh0RnVuY3Rpb24odHdlZW5WYWx1ZSh0aGlzLCBcInRleHRcIiwgdmFsdWUpKVxuICAgICAgOiB0ZXh0Q29uc3RhbnQodmFsdWUgPT0gbnVsbCA/IFwiXCIgOiB2YWx1ZSArIFwiXCIpKTtcbn1cbiIsImZ1bmN0aW9uIHRleHRJbnRlcnBvbGF0ZShpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IGkuY2FsbCh0aGlzLCB0KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dFR3ZWVuKHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgdGV4dEludGVycG9sYXRlKGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIga2V5ID0gXCJ0ZXh0XCI7XG4gIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMSkgcmV0dXJuIChrZXkgPSB0aGlzLnR3ZWVuKGtleSkpICYmIGtleS5fdmFsdWU7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gdGhpcy50d2VlbihrZXksIG51bGwpO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCB0ZXh0VHdlZW4odmFsdWUpKTtcbn1cbiIsImltcG9ydCB7VHJhbnNpdGlvbiwgbmV3SWR9IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZDAgPSB0aGlzLl9pZCxcbiAgICAgIGlkMSA9IG5ld0lkKCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgdmFyIGluaGVyaXQgPSBnZXQobm9kZSwgaWQwKTtcbiAgICAgICAgc2NoZWR1bGUobm9kZSwgbmFtZSwgaWQxLCBpLCBncm91cCwge1xuICAgICAgICAgIHRpbWU6IGluaGVyaXQudGltZSArIGluaGVyaXQuZGVsYXkgKyBpbmhlcml0LmR1cmF0aW9uLFxuICAgICAgICAgIGRlbGF5OiAwLFxuICAgICAgICAgIGR1cmF0aW9uOiBpbmhlcml0LmR1cmF0aW9uLFxuICAgICAgICAgIGVhc2U6IGluaGVyaXQuZWFzZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZDEpO1xufVxuIiwiaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgb24wLCBvbjEsIHRoYXQgPSB0aGlzLCBpZCA9IHRoYXQuX2lkLCBzaXplID0gdGhhdC5zaXplKCk7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICB2YXIgY2FuY2VsID0ge3ZhbHVlOiByZWplY3R9LFxuICAgICAgICBlbmQgPSB7dmFsdWU6IGZ1bmN0aW9uKCkgeyBpZiAoLS1zaXplID09PSAwKSByZXNvbHZlKCk7IH19O1xuXG4gICAgdGhhdC5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgICBvbiA9IHNjaGVkdWxlLm9uO1xuXG4gICAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIGEgZGlzcGF0Y2ggd2l0aCB0aGUgcHJldmlvdXMgbm9kZSxcbiAgICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2XigJlyZSBkb25lIVxuICAgICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgICAgaWYgKG9uICE9PSBvbjApIHtcbiAgICAgICAgb24xID0gKG9uMCA9IG9uKS5jb3B5KCk7XG4gICAgICAgIG9uMS5fLmNhbmNlbC5wdXNoKGNhbmNlbCk7XG4gICAgICAgIG9uMS5fLmludGVycnVwdC5wdXNoKGNhbmNlbCk7XG4gICAgICAgIG9uMS5fLmVuZC5wdXNoKGVuZCk7XG4gICAgICB9XG5cbiAgICAgIHNjaGVkdWxlLm9uID0gb24xO1xuICAgIH0pO1xuXG4gICAgLy8gVGhlIHNlbGVjdGlvbiB3YXMgZW1wdHksIHJlc29sdmUgZW5kIGltbWVkaWF0ZWx5XG4gICAgaWYgKHNpemUgPT09IDApIHJlc29sdmUoKTtcbiAgfSk7XG59XG4iLCJpbXBvcnQge3NlbGVjdGlvbn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHRyYW5zaXRpb25fYXR0ciBmcm9tIFwiLi9hdHRyLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9hdHRyVHdlZW4gZnJvbSBcIi4vYXR0clR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9kZWxheSBmcm9tIFwiLi9kZWxheS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZHVyYXRpb24gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2Vhc2UgZnJvbSBcIi4vZWFzZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZWFzZVZhcnlpbmcgZnJvbSBcIi4vZWFzZVZhcnlpbmcuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2ZpbHRlciBmcm9tIFwiLi9maWx0ZXIuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX21lcmdlIGZyb20gXCIuL21lcmdlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9vbiBmcm9tIFwiLi9vbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fcmVtb3ZlIGZyb20gXCIuL3JlbW92ZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0IGZyb20gXCIuL3NlbGVjdC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0QWxsIGZyb20gXCIuL3NlbGVjdEFsbC5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc2VsZWN0aW9uIGZyb20gXCIuL3NlbGVjdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc3R5bGUgZnJvbSBcIi4vc3R5bGUuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3N0eWxlVHdlZW4gZnJvbSBcIi4vc3R5bGVUd2Vlbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdGV4dCBmcm9tIFwiLi90ZXh0LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90ZXh0VHdlZW4gZnJvbSBcIi4vdGV4dFR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90cmFuc2l0aW9uIGZyb20gXCIuL3RyYW5zaXRpb24uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3R3ZWVuIGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lbmQgZnJvbSBcIi4vZW5kLmpzXCI7XG5cbnZhciBpZCA9IDA7XG5cbmV4cG9ydCBmdW5jdGlvbiBUcmFuc2l0aW9uKGdyb3VwcywgcGFyZW50cywgbmFtZSwgaWQpIHtcbiAgdGhpcy5fZ3JvdXBzID0gZ3JvdXBzO1xuICB0aGlzLl9wYXJlbnRzID0gcGFyZW50cztcbiAgdGhpcy5fbmFtZSA9IG5hbWU7XG4gIHRoaXMuX2lkID0gaWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zaXRpb24obmFtZSkge1xuICByZXR1cm4gc2VsZWN0aW9uKCkudHJhbnNpdGlvbihuYW1lKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG5ld0lkKCkge1xuICByZXR1cm4gKytpZDtcbn1cblxudmFyIHNlbGVjdGlvbl9wcm90b3R5cGUgPSBzZWxlY3Rpb24ucHJvdG90eXBlO1xuXG5UcmFuc2l0aW9uLnByb3RvdHlwZSA9IHRyYW5zaXRpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogVHJhbnNpdGlvbixcbiAgc2VsZWN0OiB0cmFuc2l0aW9uX3NlbGVjdCxcbiAgc2VsZWN0QWxsOiB0cmFuc2l0aW9uX3NlbGVjdEFsbCxcbiAgc2VsZWN0Q2hpbGQ6IHNlbGVjdGlvbl9wcm90b3R5cGUuc2VsZWN0Q2hpbGQsXG4gIHNlbGVjdENoaWxkcmVuOiBzZWxlY3Rpb25fcHJvdG90eXBlLnNlbGVjdENoaWxkcmVuLFxuICBmaWx0ZXI6IHRyYW5zaXRpb25fZmlsdGVyLFxuICBtZXJnZTogdHJhbnNpdGlvbl9tZXJnZSxcbiAgc2VsZWN0aW9uOiB0cmFuc2l0aW9uX3NlbGVjdGlvbixcbiAgdHJhbnNpdGlvbjogdHJhbnNpdGlvbl90cmFuc2l0aW9uLFxuICBjYWxsOiBzZWxlY3Rpb25fcHJvdG90eXBlLmNhbGwsXG4gIG5vZGVzOiBzZWxlY3Rpb25fcHJvdG90eXBlLm5vZGVzLFxuICBub2RlOiBzZWxlY3Rpb25fcHJvdG90eXBlLm5vZGUsXG4gIHNpemU6IHNlbGVjdGlvbl9wcm90b3R5cGUuc2l6ZSxcbiAgZW1wdHk6IHNlbGVjdGlvbl9wcm90b3R5cGUuZW1wdHksXG4gIGVhY2g6IHNlbGVjdGlvbl9wcm90b3R5cGUuZWFjaCxcbiAgb246IHRyYW5zaXRpb25fb24sXG4gIGF0dHI6IHRyYW5zaXRpb25fYXR0cixcbiAgYXR0clR3ZWVuOiB0cmFuc2l0aW9uX2F0dHJUd2VlbixcbiAgc3R5bGU6IHRyYW5zaXRpb25fc3R5bGUsXG4gIHN0eWxlVHdlZW46IHRyYW5zaXRpb25fc3R5bGVUd2VlbixcbiAgdGV4dDogdHJhbnNpdGlvbl90ZXh0LFxuICB0ZXh0VHdlZW46IHRyYW5zaXRpb25fdGV4dFR3ZWVuLFxuICByZW1vdmU6IHRyYW5zaXRpb25fcmVtb3ZlLFxuICB0d2VlbjogdHJhbnNpdGlvbl90d2VlbixcbiAgZGVsYXk6IHRyYW5zaXRpb25fZGVsYXksXG4gIGR1cmF0aW9uOiB0cmFuc2l0aW9uX2R1cmF0aW9uLFxuICBlYXNlOiB0cmFuc2l0aW9uX2Vhc2UsXG4gIGVhc2VWYXJ5aW5nOiB0cmFuc2l0aW9uX2Vhc2VWYXJ5aW5nLFxuICBlbmQ6IHRyYW5zaXRpb25fZW5kLFxuICBbU3ltYm9sLml0ZXJhdG9yXTogc2VsZWN0aW9uX3Byb3RvdHlwZVtTeW1ib2wuaXRlcmF0b3JdXG59O1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGN1YmljSW4odCkge1xuICByZXR1cm4gdCAqIHQgKiB0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3ViaWNPdXQodCkge1xuICByZXR1cm4gLS10ICogdCAqIHQgKyAxO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3ViaWNJbk91dCh0KSB7XG4gIHJldHVybiAoKHQgKj0gMikgPD0gMSA/IHQgKiB0ICogdCA6ICh0IC09IDIpICogdCAqIHQgKyAyKSAvIDI7XG59XG4iLCJpbXBvcnQge1RyYW5zaXRpb24sIG5ld0lkfSBmcm9tIFwiLi4vdHJhbnNpdGlvbi9pbmRleC5qc1wiO1xuaW1wb3J0IHNjaGVkdWxlIGZyb20gXCIuLi90cmFuc2l0aW9uL3NjaGVkdWxlLmpzXCI7XG5pbXBvcnQge2Vhc2VDdWJpY0luT3V0fSBmcm9tIFwiZDMtZWFzZVwiO1xuaW1wb3J0IHtub3d9IGZyb20gXCJkMy10aW1lclwiO1xuXG52YXIgZGVmYXVsdFRpbWluZyA9IHtcbiAgdGltZTogbnVsbCwgLy8gU2V0IG9uIHVzZS5cbiAgZGVsYXk6IDAsXG4gIGR1cmF0aW9uOiAyNTAsXG4gIGVhc2U6IGVhc2VDdWJpY0luT3V0XG59O1xuXG5mdW5jdGlvbiBpbmhlcml0KG5vZGUsIGlkKSB7XG4gIHZhciB0aW1pbmc7XG4gIHdoaWxlICghKHRpbWluZyA9IG5vZGUuX190cmFuc2l0aW9uKSB8fCAhKHRpbWluZyA9IHRpbWluZ1tpZF0pKSB7XG4gICAgaWYgKCEobm9kZSA9IG5vZGUucGFyZW50Tm9kZSkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdHJhbnNpdGlvbiAke2lkfSBub3QgZm91bmRgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRpbWluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgaWQsXG4gICAgICB0aW1pbmc7XG5cbiAgaWYgKG5hbWUgaW5zdGFuY2VvZiBUcmFuc2l0aW9uKSB7XG4gICAgaWQgPSBuYW1lLl9pZCwgbmFtZSA9IG5hbWUuX25hbWU7XG4gIH0gZWxzZSB7XG4gICAgaWQgPSBuZXdJZCgpLCAodGltaW5nID0gZGVmYXVsdFRpbWluZykudGltZSA9IG5vdygpLCBuYW1lID0gbmFtZSA9PSBudWxsID8gbnVsbCA6IG5hbWUgKyBcIlwiO1xuICB9XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc2NoZWR1bGUobm9kZSwgbmFtZSwgaWQsIGksIGdyb3VwLCB0aW1pbmcgfHwgaW5oZXJpdChub2RlLCBpZCkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihncm91cHMsIHRoaXMuX3BhcmVudHMsIG5hbWUsIGlkKTtcbn1cbiIsImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2ludGVycnVwdCBmcm9tIFwiLi9pbnRlcnJ1cHQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fdHJhbnNpdGlvbiBmcm9tIFwiLi90cmFuc2l0aW9uLmpzXCI7XG5cbnNlbGVjdGlvbi5wcm90b3R5cGUuaW50ZXJydXB0ID0gc2VsZWN0aW9uX2ludGVycnVwdDtcbnNlbGVjdGlvbi5wcm90b3R5cGUudHJhbnNpdGlvbiA9IHNlbGVjdGlvbl90cmFuc2l0aW9uO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIGluaXRSYW5nZShkb21haW4sIHJhbmdlKSB7XG4gIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgIGNhc2UgMDogYnJlYWs7XG4gICAgY2FzZSAxOiB0aGlzLnJhbmdlKGRvbWFpbik7IGJyZWFrO1xuICAgIGRlZmF1bHQ6IHRoaXMucmFuZ2UocmFuZ2UpLmRvbWFpbihkb21haW4pOyBicmVhaztcbiAgfVxuICByZXR1cm4gdGhpcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRJbnRlcnBvbGF0b3IoZG9tYWluLCBpbnRlcnBvbGF0b3IpIHtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiBicmVhaztcbiAgICBjYXNlIDE6IHtcbiAgICAgIGlmICh0eXBlb2YgZG9tYWluID09PSBcImZ1bmN0aW9uXCIpIHRoaXMuaW50ZXJwb2xhdG9yKGRvbWFpbik7XG4gICAgICBlbHNlIHRoaXMucmFuZ2UoZG9tYWluKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBkZWZhdWx0OiB7XG4gICAgICB0aGlzLmRvbWFpbihkb21haW4pO1xuICAgICAgaWYgKHR5cGVvZiBpbnRlcnBvbGF0b3IgPT09IFwiZnVuY3Rpb25cIikgdGhpcy5pbnRlcnBvbGF0b3IoaW50ZXJwb2xhdG9yKTtcbiAgICAgIGVsc2UgdGhpcy5yYW5nZShpbnRlcnBvbGF0b3IpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIHJldHVybiB0aGlzO1xufVxuIiwiaW1wb3J0IHtJbnRlcm5NYXB9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtpbml0UmFuZ2V9IGZyb20gXCIuL2luaXQuanNcIjtcblxuZXhwb3J0IGNvbnN0IGltcGxpY2l0ID0gU3ltYm9sKFwiaW1wbGljaXRcIik7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG9yZGluYWwoKSB7XG4gIHZhciBpbmRleCA9IG5ldyBJbnRlcm5NYXAoKSxcbiAgICAgIGRvbWFpbiA9IFtdLFxuICAgICAgcmFuZ2UgPSBbXSxcbiAgICAgIHVua25vd24gPSBpbXBsaWNpdDtcblxuICBmdW5jdGlvbiBzY2FsZShkKSB7XG4gICAgbGV0IGkgPSBpbmRleC5nZXQoZCk7XG4gICAgaWYgKGkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHVua25vd24gIT09IGltcGxpY2l0KSByZXR1cm4gdW5rbm93bjtcbiAgICAgIGluZGV4LnNldChkLCBpID0gZG9tYWluLnB1c2goZCkgLSAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHJhbmdlW2kgJSByYW5nZS5sZW5ndGhdO1xuICB9XG5cbiAgc2NhbGUuZG9tYWluID0gZnVuY3Rpb24oXykge1xuICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIGRvbWFpbi5zbGljZSgpO1xuICAgIGRvbWFpbiA9IFtdLCBpbmRleCA9IG5ldyBJbnRlcm5NYXAoKTtcbiAgICBmb3IgKGNvbnN0IHZhbHVlIG9mIF8pIHtcbiAgICAgIGlmIChpbmRleC5oYXModmFsdWUpKSBjb250aW51ZTtcbiAgICAgIGluZGV4LnNldCh2YWx1ZSwgZG9tYWluLnB1c2godmFsdWUpIC0gMSk7XG4gICAgfVxuICAgIHJldHVybiBzY2FsZTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyYW5nZSA9IEFycmF5LmZyb20oXyksIHNjYWxlKSA6IHJhbmdlLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUudW5rbm93biA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/ICh1bmtub3duID0gXywgc2NhbGUpIDogdW5rbm93bjtcbiAgfTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG9yZGluYWwoZG9tYWluLCByYW5nZSkudW5rbm93bih1bmtub3duKTtcbiAgfTtcblxuICBpbml0UmFuZ2UuYXBwbHkoc2NhbGUsIGFyZ3VtZW50cyk7XG5cbiAgcmV0dXJuIHNjYWxlO1xufVxuIiwiaW1wb3J0IHtyYW5nZSBhcyBzZXF1ZW5jZX0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuaW1wb3J0IG9yZGluYWwgZnJvbSBcIi4vb3JkaW5hbC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBiYW5kKCkge1xuICB2YXIgc2NhbGUgPSBvcmRpbmFsKCkudW5rbm93bih1bmRlZmluZWQpLFxuICAgICAgZG9tYWluID0gc2NhbGUuZG9tYWluLFxuICAgICAgb3JkaW5hbFJhbmdlID0gc2NhbGUucmFuZ2UsXG4gICAgICByMCA9IDAsXG4gICAgICByMSA9IDEsXG4gICAgICBzdGVwLFxuICAgICAgYmFuZHdpZHRoLFxuICAgICAgcm91bmQgPSBmYWxzZSxcbiAgICAgIHBhZGRpbmdJbm5lciA9IDAsXG4gICAgICBwYWRkaW5nT3V0ZXIgPSAwLFxuICAgICAgYWxpZ24gPSAwLjU7XG5cbiAgZGVsZXRlIHNjYWxlLnVua25vd247XG5cbiAgZnVuY3Rpb24gcmVzY2FsZSgpIHtcbiAgICB2YXIgbiA9IGRvbWFpbigpLmxlbmd0aCxcbiAgICAgICAgcmV2ZXJzZSA9IHIxIDwgcjAsXG4gICAgICAgIHN0YXJ0ID0gcmV2ZXJzZSA/IHIxIDogcjAsXG4gICAgICAgIHN0b3AgPSByZXZlcnNlID8gcjAgOiByMTtcbiAgICBzdGVwID0gKHN0b3AgLSBzdGFydCkgLyBNYXRoLm1heCgxLCBuIC0gcGFkZGluZ0lubmVyICsgcGFkZGluZ091dGVyICogMik7XG4gICAgaWYgKHJvdW5kKSBzdGVwID0gTWF0aC5mbG9vcihzdGVwKTtcbiAgICBzdGFydCArPSAoc3RvcCAtIHN0YXJ0IC0gc3RlcCAqIChuIC0gcGFkZGluZ0lubmVyKSkgKiBhbGlnbjtcbiAgICBiYW5kd2lkdGggPSBzdGVwICogKDEgLSBwYWRkaW5nSW5uZXIpO1xuICAgIGlmIChyb3VuZCkgc3RhcnQgPSBNYXRoLnJvdW5kKHN0YXJ0KSwgYmFuZHdpZHRoID0gTWF0aC5yb3VuZChiYW5kd2lkdGgpO1xuICAgIHZhciB2YWx1ZXMgPSBzZXF1ZW5jZShuKS5tYXAoZnVuY3Rpb24oaSkgeyByZXR1cm4gc3RhcnQgKyBzdGVwICogaTsgfSk7XG4gICAgcmV0dXJuIG9yZGluYWxSYW5nZShyZXZlcnNlID8gdmFsdWVzLnJldmVyc2UoKSA6IHZhbHVlcyk7XG4gIH1cblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluKF8pLCByZXNjYWxlKCkpIDogZG9tYWluKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoW3IwLCByMV0gPSBfLCByMCA9ICtyMCwgcjEgPSArcjEsIHJlc2NhbGUoKSkgOiBbcjAsIHIxXTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBbcjAsIHIxXSA9IF8sIHIwID0gK3IwLCByMSA9ICtyMSwgcm91bmQgPSB0cnVlLCByZXNjYWxlKCk7XG4gIH07XG5cbiAgc2NhbGUuYmFuZHdpZHRoID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGJhbmR3aWR0aDtcbiAgfTtcblxuICBzY2FsZS5zdGVwID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHN0ZXA7XG4gIH07XG5cbiAgc2NhbGUucm91bmQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocm91bmQgPSAhIV8sIHJlc2NhbGUoKSkgOiByb3VuZDtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdJbm5lciA9IE1hdGgubWluKDEsIHBhZGRpbmdPdXRlciA9ICtfKSwgcmVzY2FsZSgpKSA6IHBhZGRpbmdJbm5lcjtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nSW5uZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ0lubmVyID0gTWF0aC5taW4oMSwgXyksIHJlc2NhbGUoKSkgOiBwYWRkaW5nSW5uZXI7XG4gIH07XG5cbiAgc2NhbGUucGFkZGluZ091dGVyID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHBhZGRpbmdPdXRlciA9ICtfLCByZXNjYWxlKCkpIDogcGFkZGluZ091dGVyO1xuICB9O1xuXG4gIHNjYWxlLmFsaWduID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGFsaWduID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgXykpLCByZXNjYWxlKCkpIDogYWxpZ247XG4gIH07XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBiYW5kKGRvbWFpbigpLCBbcjAsIHIxXSlcbiAgICAgICAgLnJvdW5kKHJvdW5kKVxuICAgICAgICAucGFkZGluZ0lubmVyKHBhZGRpbmdJbm5lcilcbiAgICAgICAgLnBhZGRpbmdPdXRlcihwYWRkaW5nT3V0ZXIpXG4gICAgICAgIC5hbGlnbihhbGlnbik7XG4gIH07XG5cbiAgcmV0dXJuIGluaXRSYW5nZS5hcHBseShyZXNjYWxlKCksIGFyZ3VtZW50cyk7XG59XG5cbmZ1bmN0aW9uIHBvaW50aXNoKHNjYWxlKSB7XG4gIHZhciBjb3B5ID0gc2NhbGUuY29weTtcblxuICBzY2FsZS5wYWRkaW5nID0gc2NhbGUucGFkZGluZ091dGVyO1xuICBkZWxldGUgc2NhbGUucGFkZGluZ0lubmVyO1xuICBkZWxldGUgc2NhbGUucGFkZGluZ091dGVyO1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gcG9pbnRpc2goY29weSgpKTtcbiAgfTtcblxuICByZXR1cm4gc2NhbGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwb2ludCgpIHtcbiAgcmV0dXJuIHBvaW50aXNoKGJhbmQuYXBwbHkobnVsbCwgYXJndW1lbnRzKS5wYWRkaW5nSW5uZXIoMSkpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29uc3RhbnRzKHgpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB4O1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbnVtYmVyKHgpIHtcbiAgcmV0dXJuICt4O1xufVxuIiwiaW1wb3J0IHtiaXNlY3R9IGZyb20gXCJkMy1hcnJheVwiO1xuaW1wb3J0IHtpbnRlcnBvbGF0ZSBhcyBpbnRlcnBvbGF0ZVZhbHVlLCBpbnRlcnBvbGF0ZU51bWJlciwgaW50ZXJwb2xhdGVSb3VuZH0gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5pbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcbmltcG9ydCBudW1iZXIgZnJvbSBcIi4vbnVtYmVyLmpzXCI7XG5cbnZhciB1bml0ID0gWzAsIDFdO1xuXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkoeCkge1xuICByZXR1cm4geDtcbn1cblxuZnVuY3Rpb24gbm9ybWFsaXplKGEsIGIpIHtcbiAgcmV0dXJuIChiIC09IChhID0gK2EpKVxuICAgICAgPyBmdW5jdGlvbih4KSB7IHJldHVybiAoeCAtIGEpIC8gYjsgfVxuICAgICAgOiBjb25zdGFudChpc05hTihiKSA/IE5hTiA6IDAuNSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1wZXIoYSwgYikge1xuICB2YXIgdDtcbiAgaWYgKGEgPiBiKSB0ID0gYSwgYSA9IGIsIGIgPSB0O1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gTWF0aC5tYXgoYSwgTWF0aC5taW4oYiwgeCkpOyB9O1xufVxuXG4vLyBub3JtYWxpemUoYSwgYikoeCkgdGFrZXMgYSBkb21haW4gdmFsdWUgeCBpbiBbYSxiXSBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyBwYXJhbWV0ZXIgdCBpbiBbMCwxXS5cbi8vIGludGVycG9sYXRlKGEsIGIpKHQpIHRha2VzIGEgcGFyYW1ldGVyIHQgaW4gWzAsMV0gYW5kIHJldHVybnMgdGhlIGNvcnJlc3BvbmRpbmcgcmFuZ2UgdmFsdWUgeCBpbiBbYSxiXS5cbmZ1bmN0aW9uIGJpbWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBkMCA9IGRvbWFpblswXSwgZDEgPSBkb21haW5bMV0sIHIwID0gcmFuZ2VbMF0sIHIxID0gcmFuZ2VbMV07XG4gIGlmIChkMSA8IGQwKSBkMCA9IG5vcm1hbGl6ZShkMSwgZDApLCByMCA9IGludGVycG9sYXRlKHIxLCByMCk7XG4gIGVsc2UgZDAgPSBub3JtYWxpemUoZDAsIGQxKSwgcjAgPSBpbnRlcnBvbGF0ZShyMCwgcjEpO1xuICByZXR1cm4gZnVuY3Rpb24oeCkgeyByZXR1cm4gcjAoZDAoeCkpOyB9O1xufVxuXG5mdW5jdGlvbiBwb2x5bWFwKGRvbWFpbiwgcmFuZ2UsIGludGVycG9sYXRlKSB7XG4gIHZhciBqID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKSAtIDEsXG4gICAgICBkID0gbmV3IEFycmF5KGopLFxuICAgICAgciA9IG5ldyBBcnJheShqKSxcbiAgICAgIGkgPSAtMTtcblxuICAvLyBSZXZlcnNlIGRlc2NlbmRpbmcgZG9tYWlucy5cbiAgaWYgKGRvbWFpbltqXSA8IGRvbWFpblswXSkge1xuICAgIGRvbWFpbiA9IGRvbWFpbi5zbGljZSgpLnJldmVyc2UoKTtcbiAgICByYW5nZSA9IHJhbmdlLnNsaWNlKCkucmV2ZXJzZSgpO1xuICB9XG5cbiAgd2hpbGUgKCsraSA8IGopIHtcbiAgICBkW2ldID0gbm9ybWFsaXplKGRvbWFpbltpXSwgZG9tYWluW2kgKyAxXSk7XG4gICAgcltpXSA9IGludGVycG9sYXRlKHJhbmdlW2ldLCByYW5nZVtpICsgMV0pO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHgpIHtcbiAgICB2YXIgaSA9IGJpc2VjdChkb21haW4sIHgsIDEsIGopIC0gMTtcbiAgICByZXR1cm4gcltpXShkW2ldKHgpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkoc291cmNlLCB0YXJnZXQpIHtcbiAgcmV0dXJuIHRhcmdldFxuICAgICAgLmRvbWFpbihzb3VyY2UuZG9tYWluKCkpXG4gICAgICAucmFuZ2Uoc291cmNlLnJhbmdlKCkpXG4gICAgICAuaW50ZXJwb2xhdGUoc291cmNlLmludGVycG9sYXRlKCkpXG4gICAgICAuY2xhbXAoc291cmNlLmNsYW1wKCkpXG4gICAgICAudW5rbm93bihzb3VyY2UudW5rbm93bigpKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybWVyKCkge1xuICB2YXIgZG9tYWluID0gdW5pdCxcbiAgICAgIHJhbmdlID0gdW5pdCxcbiAgICAgIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVWYWx1ZSxcbiAgICAgIHRyYW5zZm9ybSxcbiAgICAgIHVudHJhbnNmb3JtLFxuICAgICAgdW5rbm93bixcbiAgICAgIGNsYW1wID0gaWRlbnRpdHksXG4gICAgICBwaWVjZXdpc2UsXG4gICAgICBvdXRwdXQsXG4gICAgICBpbnB1dDtcblxuICBmdW5jdGlvbiByZXNjYWxlKCkge1xuICAgIHZhciBuID0gTWF0aC5taW4oZG9tYWluLmxlbmd0aCwgcmFuZ2UubGVuZ3RoKTtcbiAgICBpZiAoY2xhbXAgIT09IGlkZW50aXR5KSBjbGFtcCA9IGNsYW1wZXIoZG9tYWluWzBdLCBkb21haW5bbiAtIDFdKTtcbiAgICBwaWVjZXdpc2UgPSBuID4gMiA/IHBvbHltYXAgOiBiaW1hcDtcbiAgICBvdXRwdXQgPSBpbnB1dCA9IG51bGw7XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9XG5cbiAgZnVuY3Rpb24gc2NhbGUoeCkge1xuICAgIHJldHVybiB4ID09IG51bGwgfHwgaXNOYU4oeCA9ICt4KSA/IHVua25vd24gOiAob3V0cHV0IHx8IChvdXRwdXQgPSBwaWVjZXdpc2UoZG9tYWluLm1hcCh0cmFuc2Zvcm0pLCByYW5nZSwgaW50ZXJwb2xhdGUpKSkodHJhbnNmb3JtKGNsYW1wKHgpKSk7XG4gIH1cblxuICBzY2FsZS5pbnZlcnQgPSBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIGNsYW1wKHVudHJhbnNmb3JtKChpbnB1dCB8fCAoaW5wdXQgPSBwaWVjZXdpc2UocmFuZ2UsIGRvbWFpbi5tYXAodHJhbnNmb3JtKSwgaW50ZXJwb2xhdGVOdW1iZXIpKSkoeSkpKTtcbiAgfTtcblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoZG9tYWluID0gQXJyYXkuZnJvbShfLCBudW1iZXIpLCByZXNjYWxlKCkpIDogZG9tYWluLnNsaWNlKCk7XG4gIH07XG5cbiAgc2NhbGUucmFuZ2UgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocmFuZ2UgPSBBcnJheS5mcm9tKF8pLCByZXNjYWxlKCkpIDogcmFuZ2Uuc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZVJvdW5kID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiByYW5nZSA9IEFycmF5LmZyb20oXyksIGludGVycG9sYXRlID0gaW50ZXJwb2xhdGVSb3VuZCwgcmVzY2FsZSgpO1xuICB9O1xuXG4gIHNjYWxlLmNsYW1wID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGNsYW1wID0gXyA/IHRydWUgOiBpZGVudGl0eSwgcmVzY2FsZSgpKSA6IGNsYW1wICE9PSBpZGVudGl0eTtcbiAgfTtcblxuICBzY2FsZS5pbnRlcnBvbGF0ZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChpbnRlcnBvbGF0ZSA9IF8sIHJlc2NhbGUoKSkgOiBpbnRlcnBvbGF0ZTtcbiAgfTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHJldHVybiBmdW5jdGlvbih0LCB1KSB7XG4gICAgdHJhbnNmb3JtID0gdCwgdW50cmFuc2Zvcm0gPSB1O1xuICAgIHJldHVybiByZXNjYWxlKCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNvbnRpbnVvdXMoKSB7XG4gIHJldHVybiB0cmFuc2Zvcm1lcigpKGlkZW50aXR5LCBpZGVudGl0eSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBuaWNlKGRvbWFpbiwgaW50ZXJ2YWwpIHtcbiAgZG9tYWluID0gZG9tYWluLnNsaWNlKCk7XG5cbiAgdmFyIGkwID0gMCxcbiAgICAgIGkxID0gZG9tYWluLmxlbmd0aCAtIDEsXG4gICAgICB4MCA9IGRvbWFpbltpMF0sXG4gICAgICB4MSA9IGRvbWFpbltpMV0sXG4gICAgICB0O1xuXG4gIGlmICh4MSA8IHgwKSB7XG4gICAgdCA9IGkwLCBpMCA9IGkxLCBpMSA9IHQ7XG4gICAgdCA9IHgwLCB4MCA9IHgxLCB4MSA9IHQ7XG4gIH1cblxuICBkb21haW5baTBdID0gaW50ZXJ2YWwuZmxvb3IoeDApO1xuICBkb21haW5baTFdID0gaW50ZXJ2YWwuY2VpbCh4MSk7XG4gIHJldHVybiBkb21haW47XG59XG4iLCJjb25zdCB0MCA9IG5ldyBEYXRlLCB0MSA9IG5ldyBEYXRlO1xuXG5leHBvcnQgZnVuY3Rpb24gdGltZUludGVydmFsKGZsb29yaSwgb2Zmc2V0aSwgY291bnQsIGZpZWxkKSB7XG5cbiAgZnVuY3Rpb24gaW50ZXJ2YWwoZGF0ZSkge1xuICAgIHJldHVybiBmbG9vcmkoZGF0ZSA9IGFyZ3VtZW50cy5sZW5ndGggPT09IDAgPyBuZXcgRGF0ZSA6IG5ldyBEYXRlKCtkYXRlKSksIGRhdGU7XG4gIH1cblxuICBpbnRlcnZhbC5mbG9vciA9IChkYXRlKSA9PiB7XG4gICAgcmV0dXJuIGZsb29yaShkYXRlID0gbmV3IERhdGUoK2RhdGUpKSwgZGF0ZTtcbiAgfTtcblxuICBpbnRlcnZhbC5jZWlsID0gKGRhdGUpID0+IHtcbiAgICByZXR1cm4gZmxvb3JpKGRhdGUgPSBuZXcgRGF0ZShkYXRlIC0gMSkpLCBvZmZzZXRpKGRhdGUsIDEpLCBmbG9vcmkoZGF0ZSksIGRhdGU7XG4gIH07XG5cbiAgaW50ZXJ2YWwucm91bmQgPSAoZGF0ZSkgPT4ge1xuICAgIGNvbnN0IGQwID0gaW50ZXJ2YWwoZGF0ZSksIGQxID0gaW50ZXJ2YWwuY2VpbChkYXRlKTtcbiAgICByZXR1cm4gZGF0ZSAtIGQwIDwgZDEgLSBkYXRlID8gZDAgOiBkMTtcbiAgfTtcblxuICBpbnRlcnZhbC5vZmZzZXQgPSAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIHJldHVybiBvZmZzZXRpKGRhdGUgPSBuZXcgRGF0ZSgrZGF0ZSksIHN0ZXAgPT0gbnVsbCA/IDEgOiBNYXRoLmZsb29yKHN0ZXApKSwgZGF0ZTtcbiAgfTtcblxuICBpbnRlcnZhbC5yYW5nZSA9IChzdGFydCwgc3RvcCwgc3RlcCkgPT4ge1xuICAgIGNvbnN0IHJhbmdlID0gW107XG4gICAgc3RhcnQgPSBpbnRlcnZhbC5jZWlsKHN0YXJ0KTtcbiAgICBzdGVwID0gc3RlcCA9PSBudWxsID8gMSA6IE1hdGguZmxvb3Ioc3RlcCk7XG4gICAgaWYgKCEoc3RhcnQgPCBzdG9wKSB8fCAhKHN0ZXAgPiAwKSkgcmV0dXJuIHJhbmdlOyAvLyBhbHNvIGhhbmRsZXMgSW52YWxpZCBEYXRlXG4gICAgbGV0IHByZXZpb3VzO1xuICAgIGRvIHJhbmdlLnB1c2gocHJldmlvdXMgPSBuZXcgRGF0ZSgrc3RhcnQpKSwgb2Zmc2V0aShzdGFydCwgc3RlcCksIGZsb29yaShzdGFydCk7XG4gICAgd2hpbGUgKHByZXZpb3VzIDwgc3RhcnQgJiYgc3RhcnQgPCBzdG9wKTtcbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgaW50ZXJ2YWwuZmlsdGVyID0gKHRlc3QpID0+IHtcbiAgICByZXR1cm4gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgICBpZiAoZGF0ZSA+PSBkYXRlKSB3aGlsZSAoZmxvb3JpKGRhdGUpLCAhdGVzdChkYXRlKSkgZGF0ZS5zZXRUaW1lKGRhdGUgLSAxKTtcbiAgICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgICAgaWYgKGRhdGUgPj0gZGF0ZSkge1xuICAgICAgICBpZiAoc3RlcCA8IDApIHdoaWxlICgrK3N0ZXAgPD0gMCkge1xuICAgICAgICAgIHdoaWxlIChvZmZzZXRpKGRhdGUsIC0xKSwgIXRlc3QoZGF0ZSkpIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZW1wdHlcbiAgICAgICAgfSBlbHNlIHdoaWxlICgtLXN0ZXAgPj0gMCkge1xuICAgICAgICAgIHdoaWxlIChvZmZzZXRpKGRhdGUsICsxKSwgIXRlc3QoZGF0ZSkpIHt9IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tZW1wdHlcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9O1xuXG4gIGlmIChjb3VudCkge1xuICAgIGludGVydmFsLmNvdW50ID0gKHN0YXJ0LCBlbmQpID0+IHtcbiAgICAgIHQwLnNldFRpbWUoK3N0YXJ0KSwgdDEuc2V0VGltZSgrZW5kKTtcbiAgICAgIGZsb29yaSh0MCksIGZsb29yaSh0MSk7XG4gICAgICByZXR1cm4gTWF0aC5mbG9vcihjb3VudCh0MCwgdDEpKTtcbiAgICB9O1xuXG4gICAgaW50ZXJ2YWwuZXZlcnkgPSAoc3RlcCkgPT4ge1xuICAgICAgc3RlcCA9IE1hdGguZmxvb3Ioc3RlcCk7XG4gICAgICByZXR1cm4gIWlzRmluaXRlKHN0ZXApIHx8ICEoc3RlcCA+IDApID8gbnVsbFxuICAgICAgICAgIDogIShzdGVwID4gMSkgPyBpbnRlcnZhbFxuICAgICAgICAgIDogaW50ZXJ2YWwuZmlsdGVyKGZpZWxkXG4gICAgICAgICAgICAgID8gKGQpID0+IGZpZWxkKGQpICUgc3RlcCA9PT0gMFxuICAgICAgICAgICAgICA6IChkKSA9PiBpbnRlcnZhbC5jb3VudCgwLCBkKSAlIHN0ZXAgPT09IDApO1xuICAgIH07XG4gIH1cblxuICByZXR1cm4gaW50ZXJ2YWw7XG59XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcblxuZXhwb3J0IGNvbnN0IG1pbGxpc2Vjb25kID0gdGltZUludGVydmFsKCgpID0+IHtcbiAgLy8gbm9vcFxufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kIC0gc3RhcnQ7XG59KTtcblxuLy8gQW4gb3B0aW1pemVkIGltcGxlbWVudGF0aW9uIGZvciB0aGlzIHNpbXBsZSBjYXNlLlxubWlsbGlzZWNvbmQuZXZlcnkgPSAoaykgPT4ge1xuICBrID0gTWF0aC5mbG9vcihrKTtcbiAgaWYgKCFpc0Zpbml0ZShrKSB8fCAhKGsgPiAwKSkgcmV0dXJuIG51bGw7XG4gIGlmICghKGsgPiAxKSkgcmV0dXJuIG1pbGxpc2Vjb25kO1xuICByZXR1cm4gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRUaW1lKE1hdGguZmxvb3IoZGF0ZSAvIGspICogayk7XG4gIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGspO1xuICB9LCAoc3RhcnQsIGVuZCkgPT4ge1xuICAgIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gaztcbiAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgbWlsbGlzZWNvbmRzID0gbWlsbGlzZWNvbmQucmFuZ2U7XG4iLCJleHBvcnQgY29uc3QgZHVyYXRpb25TZWNvbmQgPSAxMDAwO1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uTWludXRlID0gZHVyYXRpb25TZWNvbmQgKiA2MDtcbmV4cG9ydCBjb25zdCBkdXJhdGlvbkhvdXIgPSBkdXJhdGlvbk1pbnV0ZSAqIDYwO1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uRGF5ID0gZHVyYXRpb25Ib3VyICogMjQ7XG5leHBvcnQgY29uc3QgZHVyYXRpb25XZWVrID0gZHVyYXRpb25EYXkgKiA3O1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uTW9udGggPSBkdXJhdGlvbkRheSAqIDMwO1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uWWVhciA9IGR1cmF0aW9uRGF5ICogMzY1O1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uU2Vjb25kfSBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuXG5leHBvcnQgY29uc3Qgc2Vjb25kID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VGltZShkYXRlIC0gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25TZWNvbmQpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvblNlY29uZDtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ1NlY29uZHMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3Qgc2Vjb25kcyA9IHNlY29uZC5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvbk1pbnV0ZSwgZHVyYXRpb25TZWNvbmR9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lTWludXRlID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VGltZShkYXRlIC0gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSAtIGRhdGUuZ2V0U2Vjb25kcygpICogZHVyYXRpb25TZWNvbmQpO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGR1cmF0aW9uTWludXRlKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25NaW51dGU7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRNaW51dGVzKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHRpbWVNaW51dGVzID0gdGltZU1pbnV0ZS5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y01pbnV0ZSA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ1NlY29uZHMoMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25NaW51dGUpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbk1pbnV0ZTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ01pbnV0ZXMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdXRjTWludXRlcyA9IHV0Y01pbnV0ZS5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvbkhvdXIsIGR1cmF0aW9uTWludXRlLCBkdXJhdGlvblNlY29uZH0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVIb3VyID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VGltZShkYXRlIC0gZGF0ZS5nZXRNaWxsaXNlY29uZHMoKSAtIGRhdGUuZ2V0U2Vjb25kcygpICogZHVyYXRpb25TZWNvbmQgLSBkYXRlLmdldE1pbnV0ZXMoKSAqIGR1cmF0aW9uTWludXRlKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBkdXJhdGlvbkhvdXIpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbkhvdXI7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRIb3VycygpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB0aW1lSG91cnMgPSB0aW1lSG91ci5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y0hvdXIgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENNaW51dGVzKDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGR1cmF0aW9uSG91cik7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uSG91cjtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ0hvdXJzKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHV0Y0hvdXJzID0gdXRjSG91ci5yYW5nZTtcbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuaW1wb3J0IHtkdXJhdGlvbkRheSwgZHVyYXRpb25NaW51dGV9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lRGF5ID0gdGltZUludGVydmFsKFxuICBkYXRlID0+IGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCksXG4gIChkYXRlLCBzdGVwKSA9PiBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBzdGVwKSxcbiAgKHN0YXJ0LCBlbmQpID0+IChlbmQgLSBzdGFydCAtIChlbmQuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIHN0YXJ0LmdldFRpbWV6b25lT2Zmc2V0KCkpICogZHVyYXRpb25NaW51dGUpIC8gZHVyYXRpb25EYXksXG4gIGRhdGUgPT4gZGF0ZS5nZXREYXRlKCkgLSAxXG4pO1xuXG5leHBvcnQgY29uc3QgdGltZURheXMgPSB0aW1lRGF5LnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjRGF5ID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25EYXk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENEYXRlKCkgLSAxO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1dGNEYXlzID0gdXRjRGF5LnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdW5peERheSA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uRGF5O1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoZGF0ZSAvIGR1cmF0aW9uRGF5KTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdW5peERheXMgPSB1bml4RGF5LnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uTWludXRlLCBkdXJhdGlvbldlZWt9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmZ1bmN0aW9uIHRpbWVXZWVrZGF5KGkpIHtcbiAgcmV0dXJuIHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSAtIChkYXRlLmdldERheSgpICsgNyAtIGkpICUgNyk7XG4gICAgZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKTtcbiAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICBkYXRlLnNldERhdGUoZGF0ZS5nZXREYXRlKCkgKyBzdGVwICogNyk7XG4gIH0sIChzdGFydCwgZW5kKSA9PiB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCAtIChlbmQuZ2V0VGltZXpvbmVPZmZzZXQoKSAtIHN0YXJ0LmdldFRpbWV6b25lT2Zmc2V0KCkpICogZHVyYXRpb25NaW51dGUpIC8gZHVyYXRpb25XZWVrO1xuICB9KTtcbn1cblxuZXhwb3J0IGNvbnN0IHRpbWVTdW5kYXkgPSB0aW1lV2Vla2RheSgwKTtcbmV4cG9ydCBjb25zdCB0aW1lTW9uZGF5ID0gdGltZVdlZWtkYXkoMSk7XG5leHBvcnQgY29uc3QgdGltZVR1ZXNkYXkgPSB0aW1lV2Vla2RheSgyKTtcbmV4cG9ydCBjb25zdCB0aW1lV2VkbmVzZGF5ID0gdGltZVdlZWtkYXkoMyk7XG5leHBvcnQgY29uc3QgdGltZVRodXJzZGF5ID0gdGltZVdlZWtkYXkoNCk7XG5leHBvcnQgY29uc3QgdGltZUZyaWRheSA9IHRpbWVXZWVrZGF5KDUpO1xuZXhwb3J0IGNvbnN0IHRpbWVTYXR1cmRheSA9IHRpbWVXZWVrZGF5KDYpO1xuXG5leHBvcnQgY29uc3QgdGltZVN1bmRheXMgPSB0aW1lU3VuZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVNb25kYXlzID0gdGltZU1vbmRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lVHVlc2RheXMgPSB0aW1lVHVlc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lV2VkbmVzZGF5cyA9IHRpbWVXZWRuZXNkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZVRodXJzZGF5cyA9IHRpbWVUaHVyc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lRnJpZGF5cyA9IHRpbWVGcmlkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZVNhdHVyZGF5cyA9IHRpbWVTYXR1cmRheS5yYW5nZTtcblxuZnVuY3Rpb24gdXRjV2Vla2RheShpKSB7XG4gIHJldHVybiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgLSAoZGF0ZS5nZXRVVENEYXkoKSArIDcgLSBpKSAlIDcpO1xuICAgIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgZGF0ZS5zZXRVVENEYXRlKGRhdGUuZ2V0VVRDRGF0ZSgpICsgc3RlcCAqIDcpO1xuICB9LCAoc3RhcnQsIGVuZCkgPT4ge1xuICAgIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25XZWVrO1xuICB9KTtcbn1cblxuZXhwb3J0IGNvbnN0IHV0Y1N1bmRheSA9IHV0Y1dlZWtkYXkoMCk7XG5leHBvcnQgY29uc3QgdXRjTW9uZGF5ID0gdXRjV2Vla2RheSgxKTtcbmV4cG9ydCBjb25zdCB1dGNUdWVzZGF5ID0gdXRjV2Vla2RheSgyKTtcbmV4cG9ydCBjb25zdCB1dGNXZWRuZXNkYXkgPSB1dGNXZWVrZGF5KDMpO1xuZXhwb3J0IGNvbnN0IHV0Y1RodXJzZGF5ID0gdXRjV2Vla2RheSg0KTtcbmV4cG9ydCBjb25zdCB1dGNGcmlkYXkgPSB1dGNXZWVrZGF5KDUpO1xuZXhwb3J0IGNvbnN0IHV0Y1NhdHVyZGF5ID0gdXRjV2Vla2RheSg2KTtcblxuZXhwb3J0IGNvbnN0IHV0Y1N1bmRheXMgPSB1dGNTdW5kYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjTW9uZGF5cyA9IHV0Y01vbmRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNUdWVzZGF5cyA9IHV0Y1R1ZXNkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjV2VkbmVzZGF5cyA9IHV0Y1dlZG5lc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNUaHVyc2RheXMgPSB1dGNUaHVyc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNGcmlkYXlzID0gdXRjRnJpZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y1NhdHVyZGF5cyA9IHV0Y1NhdHVyZGF5LnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lTW9udGggPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXREYXRlKDEpO1xuICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRNb250aChkYXRlLmdldE1vbnRoKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQuZ2V0TW9udGgoKSAtIHN0YXJ0LmdldE1vbnRoKCkgKyAoZW5kLmdldEZ1bGxZZWFyKCkgLSBzdGFydC5nZXRGdWxsWWVhcigpKSAqIDEyO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0TW9udGgoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdGltZU1vbnRocyA9IHRpbWVNb250aC5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y01vbnRoID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDRGF0ZSgxKTtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VVRDTW9udGgoZGF0ZS5nZXRVVENNb250aCgpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kLmdldFVUQ01vbnRoKCkgLSBzdGFydC5nZXRVVENNb250aCgpICsgKGVuZC5nZXRVVENGdWxsWWVhcigpIC0gc3RhcnQuZ2V0VVRDRnVsbFllYXIoKSkgKiAxMjtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ01vbnRoKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHV0Y01vbnRocyA9IHV0Y01vbnRoLnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5cbmV4cG9ydCBjb25zdCB0aW1lWWVhciA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldE1vbnRoKDAsIDEpO1xuICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQuZ2V0RnVsbFllYXIoKSAtIHN0YXJ0LmdldEZ1bGxZZWFyKCk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRGdWxsWWVhcigpO1xufSk7XG5cbi8vIEFuIG9wdGltaXplZCBpbXBsZW1lbnRhdGlvbiBmb3IgdGhpcyBzaW1wbGUgY2FzZS5cbnRpbWVZZWFyLmV2ZXJ5ID0gKGspID0+IHtcbiAgcmV0dXJuICFpc0Zpbml0ZShrID0gTWF0aC5mbG9vcihrKSkgfHwgIShrID4gMCkgPyBudWxsIDogdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRGdWxsWWVhcihNYXRoLmZsb29yKGRhdGUuZ2V0RnVsbFllYXIoKSAvIGspICogayk7XG4gICAgZGF0ZS5zZXRNb250aCgwLCAxKTtcbiAgICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0RnVsbFllYXIoZGF0ZS5nZXRGdWxsWWVhcigpICsgc3RlcCAqIGspO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB0aW1lWWVhcnMgPSB0aW1lWWVhci5yYW5nZTtcblxuZXhwb3J0IGNvbnN0IHV0Y1llYXIgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENNb250aCgwLCAxKTtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VVRDRnVsbFllYXIoZGF0ZS5nZXRVVENGdWxsWWVhcigpICsgc3RlcCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gZW5kLmdldFVUQ0Z1bGxZZWFyKCkgLSBzdGFydC5nZXRVVENGdWxsWWVhcigpO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDRnVsbFllYXIoKTtcbn0pO1xuXG4vLyBBbiBvcHRpbWl6ZWQgaW1wbGVtZW50YXRpb24gZm9yIHRoaXMgc2ltcGxlIGNhc2UuXG51dGNZZWFyLmV2ZXJ5ID0gKGspID0+IHtcbiAgcmV0dXJuICFpc0Zpbml0ZShrID0gTWF0aC5mbG9vcihrKSkgfHwgIShrID4gMCkgPyBudWxsIDogdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXRVVENGdWxsWWVhcihNYXRoLmZsb29yKGRhdGUuZ2V0VVRDRnVsbFllYXIoKSAvIGspICogayk7XG4gICAgZGF0ZS5zZXRVVENNb250aCgwLCAxKTtcbiAgICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0VVRDRnVsbFllYXIoZGF0ZS5nZXRVVENGdWxsWWVhcigpICsgc3RlcCAqIGspO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB1dGNZZWFycyA9IHV0Y1llYXIucmFuZ2U7XG4iLCJpbXBvcnQge2Jpc2VjdG9yLCB0aWNrU3RlcH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2R1cmF0aW9uRGF5LCBkdXJhdGlvbkhvdXIsIGR1cmF0aW9uTWludXRlLCBkdXJhdGlvbk1vbnRoLCBkdXJhdGlvblNlY29uZCwgZHVyYXRpb25XZWVrLCBkdXJhdGlvblllYXJ9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5pbXBvcnQge21pbGxpc2Vjb25kfSBmcm9tIFwiLi9taWxsaXNlY29uZC5qc1wiO1xuaW1wb3J0IHtzZWNvbmR9IGZyb20gXCIuL3NlY29uZC5qc1wiO1xuaW1wb3J0IHt0aW1lTWludXRlLCB1dGNNaW51dGV9IGZyb20gXCIuL21pbnV0ZS5qc1wiO1xuaW1wb3J0IHt0aW1lSG91ciwgdXRjSG91cn0gZnJvbSBcIi4vaG91ci5qc1wiO1xuaW1wb3J0IHt0aW1lRGF5LCB1bml4RGF5fSBmcm9tIFwiLi9kYXkuanNcIjtcbmltcG9ydCB7dGltZVN1bmRheSwgdXRjU3VuZGF5fSBmcm9tIFwiLi93ZWVrLmpzXCI7XG5pbXBvcnQge3RpbWVNb250aCwgdXRjTW9udGh9IGZyb20gXCIuL21vbnRoLmpzXCI7XG5pbXBvcnQge3RpbWVZZWFyLCB1dGNZZWFyfSBmcm9tIFwiLi95ZWFyLmpzXCI7XG5cbmZ1bmN0aW9uIHRpY2tlcih5ZWFyLCBtb250aCwgd2VlaywgZGF5LCBob3VyLCBtaW51dGUpIHtcblxuICBjb25zdCB0aWNrSW50ZXJ2YWxzID0gW1xuICAgIFtzZWNvbmQsICAxLCAgICAgIGR1cmF0aW9uU2Vjb25kXSxcbiAgICBbc2Vjb25kLCAgNSwgIDUgKiBkdXJhdGlvblNlY29uZF0sXG4gICAgW3NlY29uZCwgMTUsIDE1ICogZHVyYXRpb25TZWNvbmRdLFxuICAgIFtzZWNvbmQsIDMwLCAzMCAqIGR1cmF0aW9uU2Vjb25kXSxcbiAgICBbbWludXRlLCAgMSwgICAgICBkdXJhdGlvbk1pbnV0ZV0sXG4gICAgW21pbnV0ZSwgIDUsICA1ICogZHVyYXRpb25NaW51dGVdLFxuICAgIFttaW51dGUsIDE1LCAxNSAqIGR1cmF0aW9uTWludXRlXSxcbiAgICBbbWludXRlLCAzMCwgMzAgKiBkdXJhdGlvbk1pbnV0ZV0sXG4gICAgWyAgaG91ciwgIDEsICAgICAgZHVyYXRpb25Ib3VyICBdLFxuICAgIFsgIGhvdXIsICAzLCAgMyAqIGR1cmF0aW9uSG91ciAgXSxcbiAgICBbICBob3VyLCAgNiwgIDYgKiBkdXJhdGlvbkhvdXIgIF0sXG4gICAgWyAgaG91ciwgMTIsIDEyICogZHVyYXRpb25Ib3VyICBdLFxuICAgIFsgICBkYXksICAxLCAgICAgIGR1cmF0aW9uRGF5ICAgXSxcbiAgICBbICAgZGF5LCAgMiwgIDIgKiBkdXJhdGlvbkRheSAgIF0sXG4gICAgWyAgd2VlaywgIDEsICAgICAgZHVyYXRpb25XZWVrICBdLFxuICAgIFsgbW9udGgsICAxLCAgICAgIGR1cmF0aW9uTW9udGggXSxcbiAgICBbIG1vbnRoLCAgMywgIDMgKiBkdXJhdGlvbk1vbnRoIF0sXG4gICAgWyAgeWVhciwgIDEsICAgICAgZHVyYXRpb25ZZWFyICBdXG4gIF07XG5cbiAgZnVuY3Rpb24gdGlja3Moc3RhcnQsIHN0b3AsIGNvdW50KSB7XG4gICAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydDtcbiAgICBpZiAocmV2ZXJzZSkgW3N0YXJ0LCBzdG9wXSA9IFtzdG9wLCBzdGFydF07XG4gICAgY29uc3QgaW50ZXJ2YWwgPSBjb3VudCAmJiB0eXBlb2YgY291bnQucmFuZ2UgPT09IFwiZnVuY3Rpb25cIiA/IGNvdW50IDogdGlja0ludGVydmFsKHN0YXJ0LCBzdG9wLCBjb3VudCk7XG4gICAgY29uc3QgdGlja3MgPSBpbnRlcnZhbCA/IGludGVydmFsLnJhbmdlKHN0YXJ0LCArc3RvcCArIDEpIDogW107IC8vIGluY2x1c2l2ZSBzdG9wXG4gICAgcmV0dXJuIHJldmVyc2UgPyB0aWNrcy5yZXZlcnNlKCkgOiB0aWNrcztcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpY2tJbnRlcnZhbChzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgICBjb25zdCB0YXJnZXQgPSBNYXRoLmFicyhzdG9wIC0gc3RhcnQpIC8gY291bnQ7XG4gICAgY29uc3QgaSA9IGJpc2VjdG9yKChbLCwgc3RlcF0pID0+IHN0ZXApLnJpZ2h0KHRpY2tJbnRlcnZhbHMsIHRhcmdldCk7XG4gICAgaWYgKGkgPT09IHRpY2tJbnRlcnZhbHMubGVuZ3RoKSByZXR1cm4geWVhci5ldmVyeSh0aWNrU3RlcChzdGFydCAvIGR1cmF0aW9uWWVhciwgc3RvcCAvIGR1cmF0aW9uWWVhciwgY291bnQpKTtcbiAgICBpZiAoaSA9PT0gMCkgcmV0dXJuIG1pbGxpc2Vjb25kLmV2ZXJ5KE1hdGgubWF4KHRpY2tTdGVwKHN0YXJ0LCBzdG9wLCBjb3VudCksIDEpKTtcbiAgICBjb25zdCBbdCwgc3RlcF0gPSB0aWNrSW50ZXJ2YWxzW3RhcmdldCAvIHRpY2tJbnRlcnZhbHNbaSAtIDFdWzJdIDwgdGlja0ludGVydmFsc1tpXVsyXSAvIHRhcmdldCA/IGkgLSAxIDogaV07XG4gICAgcmV0dXJuIHQuZXZlcnkoc3RlcCk7XG4gIH1cblxuICByZXR1cm4gW3RpY2tzLCB0aWNrSW50ZXJ2YWxdO1xufVxuXG5jb25zdCBbdXRjVGlja3MsIHV0Y1RpY2tJbnRlcnZhbF0gPSB0aWNrZXIodXRjWWVhciwgdXRjTW9udGgsIHV0Y1N1bmRheSwgdW5peERheSwgdXRjSG91ciwgdXRjTWludXRlKTtcbmNvbnN0IFt0aW1lVGlja3MsIHRpbWVUaWNrSW50ZXJ2YWxdID0gdGlja2VyKHRpbWVZZWFyLCB0aW1lTW9udGgsIHRpbWVTdW5kYXksIHRpbWVEYXksIHRpbWVIb3VyLCB0aW1lTWludXRlKTtcblxuZXhwb3J0IHt1dGNUaWNrcywgdXRjVGlja0ludGVydmFsLCB0aW1lVGlja3MsIHRpbWVUaWNrSW50ZXJ2YWx9O1xuIiwiaW1wb3J0IHtcbiAgdGltZURheSxcbiAgdGltZVN1bmRheSxcbiAgdGltZU1vbmRheSxcbiAgdGltZVRodXJzZGF5LFxuICB0aW1lWWVhcixcbiAgdXRjRGF5LFxuICB1dGNTdW5kYXksXG4gIHV0Y01vbmRheSxcbiAgdXRjVGh1cnNkYXksXG4gIHV0Y1llYXJcbn0gZnJvbSBcImQzLXRpbWVcIjtcblxuZnVuY3Rpb24gbG9jYWxEYXRlKGQpIHtcbiAgaWYgKDAgPD0gZC55ICYmIGQueSA8IDEwMCkge1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoLTEsIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpO1xuICAgIGRhdGUuc2V0RnVsbFllYXIoZC55KTtcbiAgICByZXR1cm4gZGF0ZTtcbiAgfVxuICByZXR1cm4gbmV3IERhdGUoZC55LCBkLm0sIGQuZCwgZC5ILCBkLk0sIGQuUywgZC5MKTtcbn1cblxuZnVuY3Rpb24gdXRjRGF0ZShkKSB7XG4gIGlmICgwIDw9IGQueSAmJiBkLnkgPCAxMDApIHtcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKERhdGUuVVRDKC0xLCBkLm0sIGQuZCwgZC5ILCBkLk0sIGQuUywgZC5MKSk7XG4gICAgZGF0ZS5zZXRVVENGdWxsWWVhcihkLnkpO1xuICAgIHJldHVybiBkYXRlO1xuICB9XG4gIHJldHVybiBuZXcgRGF0ZShEYXRlLlVUQyhkLnksIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpKTtcbn1cblxuZnVuY3Rpb24gbmV3RGF0ZSh5LCBtLCBkKSB7XG4gIHJldHVybiB7eTogeSwgbTogbSwgZDogZCwgSDogMCwgTTogMCwgUzogMCwgTDogMH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZvcm1hdExvY2FsZShsb2NhbGUpIHtcbiAgdmFyIGxvY2FsZV9kYXRlVGltZSA9IGxvY2FsZS5kYXRlVGltZSxcbiAgICAgIGxvY2FsZV9kYXRlID0gbG9jYWxlLmRhdGUsXG4gICAgICBsb2NhbGVfdGltZSA9IGxvY2FsZS50aW1lLFxuICAgICAgbG9jYWxlX3BlcmlvZHMgPSBsb2NhbGUucGVyaW9kcyxcbiAgICAgIGxvY2FsZV93ZWVrZGF5cyA9IGxvY2FsZS5kYXlzLFxuICAgICAgbG9jYWxlX3Nob3J0V2Vla2RheXMgPSBsb2NhbGUuc2hvcnREYXlzLFxuICAgICAgbG9jYWxlX21vbnRocyA9IGxvY2FsZS5tb250aHMsXG4gICAgICBsb2NhbGVfc2hvcnRNb250aHMgPSBsb2NhbGUuc2hvcnRNb250aHM7XG5cbiAgdmFyIHBlcmlvZFJlID0gZm9ybWF0UmUobG9jYWxlX3BlcmlvZHMpLFxuICAgICAgcGVyaW9kTG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9wZXJpb2RzKSxcbiAgICAgIHdlZWtkYXlSZSA9IGZvcm1hdFJlKGxvY2FsZV93ZWVrZGF5cyksXG4gICAgICB3ZWVrZGF5TG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV93ZWVrZGF5cyksXG4gICAgICBzaG9ydFdlZWtkYXlSZSA9IGZvcm1hdFJlKGxvY2FsZV9zaG9ydFdlZWtkYXlzKSxcbiAgICAgIHNob3J0V2Vla2RheUxvb2t1cCA9IGZvcm1hdExvb2t1cChsb2NhbGVfc2hvcnRXZWVrZGF5cyksXG4gICAgICBtb250aFJlID0gZm9ybWF0UmUobG9jYWxlX21vbnRocyksXG4gICAgICBtb250aExvb2t1cCA9IGZvcm1hdExvb2t1cChsb2NhbGVfbW9udGhzKSxcbiAgICAgIHNob3J0TW9udGhSZSA9IGZvcm1hdFJlKGxvY2FsZV9zaG9ydE1vbnRocyksXG4gICAgICBzaG9ydE1vbnRoTG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9zaG9ydE1vbnRocyk7XG5cbiAgdmFyIGZvcm1hdHMgPSB7XG4gICAgXCJhXCI6IGZvcm1hdFNob3J0V2Vla2RheSxcbiAgICBcIkFcIjogZm9ybWF0V2Vla2RheSxcbiAgICBcImJcIjogZm9ybWF0U2hvcnRNb250aCxcbiAgICBcIkJcIjogZm9ybWF0TW9udGgsXG4gICAgXCJjXCI6IG51bGwsXG4gICAgXCJkXCI6IGZvcm1hdERheU9mTW9udGgsXG4gICAgXCJlXCI6IGZvcm1hdERheU9mTW9udGgsXG4gICAgXCJmXCI6IGZvcm1hdE1pY3Jvc2Vjb25kcyxcbiAgICBcImdcIjogZm9ybWF0WWVhcklTTyxcbiAgICBcIkdcIjogZm9ybWF0RnVsbFllYXJJU08sXG4gICAgXCJIXCI6IGZvcm1hdEhvdXIyNCxcbiAgICBcIklcIjogZm9ybWF0SG91cjEyLFxuICAgIFwialwiOiBmb3JtYXREYXlPZlllYXIsXG4gICAgXCJMXCI6IGZvcm1hdE1pbGxpc2Vjb25kcyxcbiAgICBcIm1cIjogZm9ybWF0TW9udGhOdW1iZXIsXG4gICAgXCJNXCI6IGZvcm1hdE1pbnV0ZXMsXG4gICAgXCJwXCI6IGZvcm1hdFBlcmlvZCxcbiAgICBcInFcIjogZm9ybWF0UXVhcnRlcixcbiAgICBcIlFcIjogZm9ybWF0VW5peFRpbWVzdGFtcCxcbiAgICBcInNcIjogZm9ybWF0VW5peFRpbWVzdGFtcFNlY29uZHMsXG4gICAgXCJTXCI6IGZvcm1hdFNlY29uZHMsXG4gICAgXCJ1XCI6IGZvcm1hdFdlZWtkYXlOdW1iZXJNb25kYXksXG4gICAgXCJVXCI6IGZvcm1hdFdlZWtOdW1iZXJTdW5kYXksXG4gICAgXCJWXCI6IGZvcm1hdFdlZWtOdW1iZXJJU08sXG4gICAgXCJ3XCI6IGZvcm1hdFdlZWtkYXlOdW1iZXJTdW5kYXksXG4gICAgXCJXXCI6IGZvcm1hdFdlZWtOdW1iZXJNb25kYXksXG4gICAgXCJ4XCI6IG51bGwsXG4gICAgXCJYXCI6IG51bGwsXG4gICAgXCJ5XCI6IGZvcm1hdFllYXIsXG4gICAgXCJZXCI6IGZvcm1hdEZ1bGxZZWFyLFxuICAgIFwiWlwiOiBmb3JtYXRab25lLFxuICAgIFwiJVwiOiBmb3JtYXRMaXRlcmFsUGVyY2VudFxuICB9O1xuXG4gIHZhciB1dGNGb3JtYXRzID0ge1xuICAgIFwiYVwiOiBmb3JtYXRVVENTaG9ydFdlZWtkYXksXG4gICAgXCJBXCI6IGZvcm1hdFVUQ1dlZWtkYXksXG4gICAgXCJiXCI6IGZvcm1hdFVUQ1Nob3J0TW9udGgsXG4gICAgXCJCXCI6IGZvcm1hdFVUQ01vbnRoLFxuICAgIFwiY1wiOiBudWxsLFxuICAgIFwiZFwiOiBmb3JtYXRVVENEYXlPZk1vbnRoLFxuICAgIFwiZVwiOiBmb3JtYXRVVENEYXlPZk1vbnRoLFxuICAgIFwiZlwiOiBmb3JtYXRVVENNaWNyb3NlY29uZHMsXG4gICAgXCJnXCI6IGZvcm1hdFVUQ1llYXJJU08sXG4gICAgXCJHXCI6IGZvcm1hdFVUQ0Z1bGxZZWFySVNPLFxuICAgIFwiSFwiOiBmb3JtYXRVVENIb3VyMjQsXG4gICAgXCJJXCI6IGZvcm1hdFVUQ0hvdXIxMixcbiAgICBcImpcIjogZm9ybWF0VVRDRGF5T2ZZZWFyLFxuICAgIFwiTFwiOiBmb3JtYXRVVENNaWxsaXNlY29uZHMsXG4gICAgXCJtXCI6IGZvcm1hdFVUQ01vbnRoTnVtYmVyLFxuICAgIFwiTVwiOiBmb3JtYXRVVENNaW51dGVzLFxuICAgIFwicFwiOiBmb3JtYXRVVENQZXJpb2QsXG4gICAgXCJxXCI6IGZvcm1hdFVUQ1F1YXJ0ZXIsXG4gICAgXCJRXCI6IGZvcm1hdFVuaXhUaW1lc3RhbXAsXG4gICAgXCJzXCI6IGZvcm1hdFVuaXhUaW1lc3RhbXBTZWNvbmRzLFxuICAgIFwiU1wiOiBmb3JtYXRVVENTZWNvbmRzLFxuICAgIFwidVwiOiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyTW9uZGF5LFxuICAgIFwiVVwiOiBmb3JtYXRVVENXZWVrTnVtYmVyU3VuZGF5LFxuICAgIFwiVlwiOiBmb3JtYXRVVENXZWVrTnVtYmVySVNPLFxuICAgIFwid1wiOiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyU3VuZGF5LFxuICAgIFwiV1wiOiBmb3JtYXRVVENXZWVrTnVtYmVyTW9uZGF5LFxuICAgIFwieFwiOiBudWxsLFxuICAgIFwiWFwiOiBudWxsLFxuICAgIFwieVwiOiBmb3JtYXRVVENZZWFyLFxuICAgIFwiWVwiOiBmb3JtYXRVVENGdWxsWWVhcixcbiAgICBcIlpcIjogZm9ybWF0VVRDWm9uZSxcbiAgICBcIiVcIjogZm9ybWF0TGl0ZXJhbFBlcmNlbnRcbiAgfTtcblxuICB2YXIgcGFyc2VzID0ge1xuICAgIFwiYVwiOiBwYXJzZVNob3J0V2Vla2RheSxcbiAgICBcIkFcIjogcGFyc2VXZWVrZGF5LFxuICAgIFwiYlwiOiBwYXJzZVNob3J0TW9udGgsXG4gICAgXCJCXCI6IHBhcnNlTW9udGgsXG4gICAgXCJjXCI6IHBhcnNlTG9jYWxlRGF0ZVRpbWUsXG4gICAgXCJkXCI6IHBhcnNlRGF5T2ZNb250aCxcbiAgICBcImVcIjogcGFyc2VEYXlPZk1vbnRoLFxuICAgIFwiZlwiOiBwYXJzZU1pY3Jvc2Vjb25kcyxcbiAgICBcImdcIjogcGFyc2VZZWFyLFxuICAgIFwiR1wiOiBwYXJzZUZ1bGxZZWFyLFxuICAgIFwiSFwiOiBwYXJzZUhvdXIyNCxcbiAgICBcIklcIjogcGFyc2VIb3VyMjQsXG4gICAgXCJqXCI6IHBhcnNlRGF5T2ZZZWFyLFxuICAgIFwiTFwiOiBwYXJzZU1pbGxpc2Vjb25kcyxcbiAgICBcIm1cIjogcGFyc2VNb250aE51bWJlcixcbiAgICBcIk1cIjogcGFyc2VNaW51dGVzLFxuICAgIFwicFwiOiBwYXJzZVBlcmlvZCxcbiAgICBcInFcIjogcGFyc2VRdWFydGVyLFxuICAgIFwiUVwiOiBwYXJzZVVuaXhUaW1lc3RhbXAsXG4gICAgXCJzXCI6IHBhcnNlVW5peFRpbWVzdGFtcFNlY29uZHMsXG4gICAgXCJTXCI6IHBhcnNlU2Vjb25kcyxcbiAgICBcInVcIjogcGFyc2VXZWVrZGF5TnVtYmVyTW9uZGF5LFxuICAgIFwiVVwiOiBwYXJzZVdlZWtOdW1iZXJTdW5kYXksXG4gICAgXCJWXCI6IHBhcnNlV2Vla051bWJlcklTTyxcbiAgICBcIndcIjogcGFyc2VXZWVrZGF5TnVtYmVyU3VuZGF5LFxuICAgIFwiV1wiOiBwYXJzZVdlZWtOdW1iZXJNb25kYXksXG4gICAgXCJ4XCI6IHBhcnNlTG9jYWxlRGF0ZSxcbiAgICBcIlhcIjogcGFyc2VMb2NhbGVUaW1lLFxuICAgIFwieVwiOiBwYXJzZVllYXIsXG4gICAgXCJZXCI6IHBhcnNlRnVsbFllYXIsXG4gICAgXCJaXCI6IHBhcnNlWm9uZSxcbiAgICBcIiVcIjogcGFyc2VMaXRlcmFsUGVyY2VudFxuICB9O1xuXG4gIC8vIFRoZXNlIHJlY3Vyc2l2ZSBkaXJlY3RpdmUgZGVmaW5pdGlvbnMgbXVzdCBiZSBkZWZlcnJlZC5cbiAgZm9ybWF0cy54ID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlLCBmb3JtYXRzKTtcbiAgZm9ybWF0cy5YID0gbmV3Rm9ybWF0KGxvY2FsZV90aW1lLCBmb3JtYXRzKTtcbiAgZm9ybWF0cy5jID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlVGltZSwgZm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMueCA9IG5ld0Zvcm1hdChsb2NhbGVfZGF0ZSwgdXRjRm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMuWCA9IG5ld0Zvcm1hdChsb2NhbGVfdGltZSwgdXRjRm9ybWF0cyk7XG4gIHV0Y0Zvcm1hdHMuYyA9IG5ld0Zvcm1hdChsb2NhbGVfZGF0ZVRpbWUsIHV0Y0Zvcm1hdHMpO1xuXG4gIGZ1bmN0aW9uIG5ld0Zvcm1hdChzcGVjaWZpZXIsIGZvcm1hdHMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgdmFyIHN0cmluZyA9IFtdLFxuICAgICAgICAgIGkgPSAtMSxcbiAgICAgICAgICBqID0gMCxcbiAgICAgICAgICBuID0gc3BlY2lmaWVyLmxlbmd0aCxcbiAgICAgICAgICBjLFxuICAgICAgICAgIHBhZCxcbiAgICAgICAgICBmb3JtYXQ7XG5cbiAgICAgIGlmICghKGRhdGUgaW5zdGFuY2VvZiBEYXRlKSkgZGF0ZSA9IG5ldyBEYXRlKCtkYXRlKTtcblxuICAgICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgICAgaWYgKHNwZWNpZmllci5jaGFyQ29kZUF0KGkpID09PSAzNykge1xuICAgICAgICAgIHN0cmluZy5wdXNoKHNwZWNpZmllci5zbGljZShqLCBpKSk7XG4gICAgICAgICAgaWYgKChwYWQgPSBwYWRzW2MgPSBzcGVjaWZpZXIuY2hhckF0KCsraSldKSAhPSBudWxsKSBjID0gc3BlY2lmaWVyLmNoYXJBdCgrK2kpO1xuICAgICAgICAgIGVsc2UgcGFkID0gYyA9PT0gXCJlXCIgPyBcIiBcIiA6IFwiMFwiO1xuICAgICAgICAgIGlmIChmb3JtYXQgPSBmb3JtYXRzW2NdKSBjID0gZm9ybWF0KGRhdGUsIHBhZCk7XG4gICAgICAgICAgc3RyaW5nLnB1c2goYyk7XG4gICAgICAgICAgaiA9IGkgKyAxO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHN0cmluZy5wdXNoKHNwZWNpZmllci5zbGljZShqLCBpKSk7XG4gICAgICByZXR1cm4gc3RyaW5nLmpvaW4oXCJcIik7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld1BhcnNlKHNwZWNpZmllciwgWikge1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIHZhciBkID0gbmV3RGF0ZSgxOTAwLCB1bmRlZmluZWQsIDEpLFxuICAgICAgICAgIGkgPSBwYXJzZVNwZWNpZmllcihkLCBzcGVjaWZpZXIsIHN0cmluZyArPSBcIlwiLCAwKSxcbiAgICAgICAgICB3ZWVrLCBkYXk7XG4gICAgICBpZiAoaSAhPSBzdHJpbmcubGVuZ3RoKSByZXR1cm4gbnVsbDtcblxuICAgICAgLy8gSWYgYSBVTklYIHRpbWVzdGFtcCBpcyBzcGVjaWZpZWQsIHJldHVybiBpdC5cbiAgICAgIGlmIChcIlFcIiBpbiBkKSByZXR1cm4gbmV3IERhdGUoZC5RKTtcbiAgICAgIGlmIChcInNcIiBpbiBkKSByZXR1cm4gbmV3IERhdGUoZC5zICogMTAwMCArIChcIkxcIiBpbiBkID8gZC5MIDogMCkpO1xuXG4gICAgICAvLyBJZiB0aGlzIGlzIHV0Y1BhcnNlLCBuZXZlciB1c2UgdGhlIGxvY2FsIHRpbWV6b25lLlxuICAgICAgaWYgKFogJiYgIShcIlpcIiBpbiBkKSkgZC5aID0gMDtcblxuICAgICAgLy8gVGhlIGFtLXBtIGZsYWcgaXMgMCBmb3IgQU0sIGFuZCAxIGZvciBQTS5cbiAgICAgIGlmIChcInBcIiBpbiBkKSBkLkggPSBkLkggJSAxMiArIGQucCAqIDEyO1xuXG4gICAgICAvLyBJZiB0aGUgbW9udGggd2FzIG5vdCBzcGVjaWZpZWQsIGluaGVyaXQgZnJvbSB0aGUgcXVhcnRlci5cbiAgICAgIGlmIChkLm0gPT09IHVuZGVmaW5lZCkgZC5tID0gXCJxXCIgaW4gZCA/IGQucSA6IDA7XG5cbiAgICAgIC8vIENvbnZlcnQgZGF5LW9mLXdlZWsgYW5kIHdlZWstb2YteWVhciB0byBkYXktb2YteWVhci5cbiAgICAgIGlmIChcIlZcIiBpbiBkKSB7XG4gICAgICAgIGlmIChkLlYgPCAxIHx8IGQuViA+IDUzKSByZXR1cm4gbnVsbDtcbiAgICAgICAgaWYgKCEoXCJ3XCIgaW4gZCkpIGQudyA9IDE7XG4gICAgICAgIGlmIChcIlpcIiBpbiBkKSB7XG4gICAgICAgICAgd2VlayA9IHV0Y0RhdGUobmV3RGF0ZShkLnksIDAsIDEpKSwgZGF5ID0gd2Vlay5nZXRVVENEYXkoKTtcbiAgICAgICAgICB3ZWVrID0gZGF5ID4gNCB8fCBkYXkgPT09IDAgPyB1dGNNb25kYXkuY2VpbCh3ZWVrKSA6IHV0Y01vbmRheSh3ZWVrKTtcbiAgICAgICAgICB3ZWVrID0gdXRjRGF5Lm9mZnNldCh3ZWVrLCAoZC5WIC0gMSkgKiA3KTtcbiAgICAgICAgICBkLnkgPSB3ZWVrLmdldFVUQ0Z1bGxZZWFyKCk7XG4gICAgICAgICAgZC5tID0gd2Vlay5nZXRVVENNb250aCgpO1xuICAgICAgICAgIGQuZCA9IHdlZWsuZ2V0VVRDRGF0ZSgpICsgKGQudyArIDYpICUgNztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3ZWVrID0gbG9jYWxEYXRlKG5ld0RhdGUoZC55LCAwLCAxKSksIGRheSA9IHdlZWsuZ2V0RGF5KCk7XG4gICAgICAgICAgd2VlayA9IGRheSA+IDQgfHwgZGF5ID09PSAwID8gdGltZU1vbmRheS5jZWlsKHdlZWspIDogdGltZU1vbmRheSh3ZWVrKTtcbiAgICAgICAgICB3ZWVrID0gdGltZURheS5vZmZzZXQod2VlaywgKGQuViAtIDEpICogNyk7XG4gICAgICAgICAgZC55ID0gd2Vlay5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgIGQubSA9IHdlZWsuZ2V0TW9udGgoKTtcbiAgICAgICAgICBkLmQgPSB3ZWVrLmdldERhdGUoKSArIChkLncgKyA2KSAlIDc7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoXCJXXCIgaW4gZCB8fCBcIlVcIiBpbiBkKSB7XG4gICAgICAgIGlmICghKFwid1wiIGluIGQpKSBkLncgPSBcInVcIiBpbiBkID8gZC51ICUgNyA6IFwiV1wiIGluIGQgPyAxIDogMDtcbiAgICAgICAgZGF5ID0gXCJaXCIgaW4gZCA/IHV0Y0RhdGUobmV3RGF0ZShkLnksIDAsIDEpKS5nZXRVVENEYXkoKSA6IGxvY2FsRGF0ZShuZXdEYXRlKGQueSwgMCwgMSkpLmdldERheSgpO1xuICAgICAgICBkLm0gPSAwO1xuICAgICAgICBkLmQgPSBcIldcIiBpbiBkID8gKGQudyArIDYpICUgNyArIGQuVyAqIDcgLSAoZGF5ICsgNSkgJSA3IDogZC53ICsgZC5VICogNyAtIChkYXkgKyA2KSAlIDc7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGEgdGltZSB6b25lIGlzIHNwZWNpZmllZCwgYWxsIGZpZWxkcyBhcmUgaW50ZXJwcmV0ZWQgYXMgVVRDIGFuZCB0aGVuXG4gICAgICAvLyBvZmZzZXQgYWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpZWQgdGltZSB6b25lLlxuICAgICAgaWYgKFwiWlwiIGluIGQpIHtcbiAgICAgICAgZC5IICs9IGQuWiAvIDEwMCB8IDA7XG4gICAgICAgIGQuTSArPSBkLlogJSAxMDA7XG4gICAgICAgIHJldHVybiB1dGNEYXRlKGQpO1xuICAgICAgfVxuXG4gICAgICAvLyBPdGhlcndpc2UsIGFsbCBmaWVsZHMgYXJlIGluIGxvY2FsIHRpbWUuXG4gICAgICByZXR1cm4gbG9jYWxEYXRlKGQpO1xuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVNwZWNpZmllcihkLCBzcGVjaWZpZXIsIHN0cmluZywgaikge1xuICAgIHZhciBpID0gMCxcbiAgICAgICAgbiA9IHNwZWNpZmllci5sZW5ndGgsXG4gICAgICAgIG0gPSBzdHJpbmcubGVuZ3RoLFxuICAgICAgICBjLFxuICAgICAgICBwYXJzZTtcblxuICAgIHdoaWxlIChpIDwgbikge1xuICAgICAgaWYgKGogPj0gbSkgcmV0dXJuIC0xO1xuICAgICAgYyA9IHNwZWNpZmllci5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICBpZiAoYyA9PT0gMzcpIHtcbiAgICAgICAgYyA9IHNwZWNpZmllci5jaGFyQXQoaSsrKTtcbiAgICAgICAgcGFyc2UgPSBwYXJzZXNbYyBpbiBwYWRzID8gc3BlY2lmaWVyLmNoYXJBdChpKyspIDogY107XG4gICAgICAgIGlmICghcGFyc2UgfHwgKChqID0gcGFyc2UoZCwgc3RyaW5nLCBqKSkgPCAwKSkgcmV0dXJuIC0xO1xuICAgICAgfSBlbHNlIGlmIChjICE9IHN0cmluZy5jaGFyQ29kZUF0KGorKykpIHtcbiAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBqO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VQZXJpb2QoZCwgc3RyaW5nLCBpKSB7XG4gICAgdmFyIG4gPSBwZXJpb2RSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC5wID0gcGVyaW9kTG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVNob3J0V2Vla2RheShkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IHNob3J0V2Vla2RheVJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLncgPSBzaG9ydFdlZWtkYXlMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlV2Vla2RheShkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IHdlZWtkYXlSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC53ID0gd2Vla2RheUxvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VTaG9ydE1vbnRoKGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gc2hvcnRNb250aFJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLm0gPSBzaG9ydE1vbnRoTG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZU1vbnRoKGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gbW9udGhSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gICAgcmV0dXJuIG4gPyAoZC5tID0gbW9udGhMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTG9jYWxlRGF0ZVRpbWUoZCwgc3RyaW5nLCBpKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BlY2lmaWVyKGQsIGxvY2FsZV9kYXRlVGltZSwgc3RyaW5nLCBpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTG9jYWxlRGF0ZShkLCBzdHJpbmcsIGkpIHtcbiAgICByZXR1cm4gcGFyc2VTcGVjaWZpZXIoZCwgbG9jYWxlX2RhdGUsIHN0cmluZywgaSk7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZUxvY2FsZVRpbWUoZCwgc3RyaW5nLCBpKSB7XG4gICAgcmV0dXJuIHBhcnNlU3BlY2lmaWVyKGQsIGxvY2FsZV90aW1lLCBzdHJpbmcsIGkpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0U2hvcnRXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3Nob3J0V2Vla2RheXNbZC5nZXREYXkoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3dlZWtkYXlzW2QuZ2V0RGF5KCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0U2hvcnRNb250aChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9zaG9ydE1vbnRoc1tkLmdldE1vbnRoKCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0TW9udGgoZCkge1xuICAgIHJldHVybiBsb2NhbGVfbW9udGhzW2QuZ2V0TW9udGgoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRQZXJpb2QoZCkge1xuICAgIHJldHVybiBsb2NhbGVfcGVyaW9kc1srKGQuZ2V0SG91cnMoKSA+PSAxMildO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0UXVhcnRlcihkKSB7XG4gICAgcmV0dXJuIDEgKyB+fihkLmdldE1vbnRoKCkgLyAzKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1Nob3J0V2Vla2RheShkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9zaG9ydFdlZWtkYXlzW2QuZ2V0VVRDRGF5KCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDV2Vla2RheShkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV93ZWVrZGF5c1tkLmdldFVUQ0RheSgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1Nob3J0TW9udGgoZCkge1xuICAgIHJldHVybiBsb2NhbGVfc2hvcnRNb250aHNbZC5nZXRVVENNb250aCgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ01vbnRoKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX21vbnRoc1tkLmdldFVUQ01vbnRoKCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDUGVyaW9kKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3BlcmlvZHNbKyhkLmdldFVUQ0hvdXJzKCkgPj0gMTIpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFVUQ1F1YXJ0ZXIoZCkge1xuICAgIHJldHVybiAxICsgfn4oZC5nZXRVVENNb250aCgpIC8gMyk7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGZvcm1hdDogZnVuY3Rpb24oc3BlY2lmaWVyKSB7XG4gICAgICB2YXIgZiA9IG5ld0Zvcm1hdChzcGVjaWZpZXIgKz0gXCJcIiwgZm9ybWF0cyk7XG4gICAgICBmLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBzcGVjaWZpZXI7IH07XG4gICAgICByZXR1cm4gZjtcbiAgICB9LFxuICAgIHBhcnNlOiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBwID0gbmV3UGFyc2Uoc3BlY2lmaWVyICs9IFwiXCIsIGZhbHNlKTtcbiAgICAgIHAudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBwO1xuICAgIH0sXG4gICAgdXRjRm9ybWF0OiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBmID0gbmV3Rm9ybWF0KHNwZWNpZmllciArPSBcIlwiLCB1dGNGb3JtYXRzKTtcbiAgICAgIGYudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBmO1xuICAgIH0sXG4gICAgdXRjUGFyc2U6IGZ1bmN0aW9uKHNwZWNpZmllcikge1xuICAgICAgdmFyIHAgPSBuZXdQYXJzZShzcGVjaWZpZXIgKz0gXCJcIiwgdHJ1ZSk7XG4gICAgICBwLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7IHJldHVybiBzcGVjaWZpZXI7IH07XG4gICAgICByZXR1cm4gcDtcbiAgICB9XG4gIH07XG59XG5cbnZhciBwYWRzID0ge1wiLVwiOiBcIlwiLCBcIl9cIjogXCIgXCIsIFwiMFwiOiBcIjBcIn0sXG4gICAgbnVtYmVyUmUgPSAvXlxccypcXGQrLywgLy8gbm90ZTogaWdub3JlcyBuZXh0IGRpcmVjdGl2ZVxuICAgIHBlcmNlbnRSZSA9IC9eJS8sXG4gICAgcmVxdW90ZVJlID0gL1tcXFxcXiQqKz98W1xcXSgpLnt9XS9nO1xuXG5mdW5jdGlvbiBwYWQodmFsdWUsIGZpbGwsIHdpZHRoKSB7XG4gIHZhciBzaWduID0gdmFsdWUgPCAwID8gXCItXCIgOiBcIlwiLFxuICAgICAgc3RyaW5nID0gKHNpZ24gPyAtdmFsdWUgOiB2YWx1ZSkgKyBcIlwiLFxuICAgICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcbiAgcmV0dXJuIHNpZ24gKyAobGVuZ3RoIDwgd2lkdGggPyBuZXcgQXJyYXkod2lkdGggLSBsZW5ndGggKyAxKS5qb2luKGZpbGwpICsgc3RyaW5nIDogc3RyaW5nKTtcbn1cblxuZnVuY3Rpb24gcmVxdW90ZShzKSB7XG4gIHJldHVybiBzLnJlcGxhY2UocmVxdW90ZVJlLCBcIlxcXFwkJlwiKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0UmUobmFtZXMpIHtcbiAgcmV0dXJuIG5ldyBSZWdFeHAoXCJeKD86XCIgKyBuYW1lcy5tYXAocmVxdW90ZSkuam9pbihcInxcIikgKyBcIilcIiwgXCJpXCIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRMb29rdXAobmFtZXMpIHtcbiAgcmV0dXJuIG5ldyBNYXAobmFtZXMubWFwKChuYW1lLCBpKSA9PiBbbmFtZS50b0xvd2VyQ2FzZSgpLCBpXSkpO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtkYXlOdW1iZXJTdW5kYXkoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyAoZC53ID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrZGF5TnVtYmVyTW9uZGF5KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAxKSk7XG4gIHJldHVybiBuID8gKGQudSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2Vla051bWJlclN1bmRheShkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLlUgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtOdW1iZXJJU08oZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5WID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrTnVtYmVyTW9uZGF5KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuVyA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRnVsbFllYXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDQpKTtcbiAgcmV0dXJuIG4gPyAoZC55ID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VZZWFyKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQueSA9ICtuWzBdICsgKCtuWzBdID4gNjggPyAxOTAwIDogMjAwMCksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2Vab25lKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IC9eKFopfChbKy1dXFxkXFxkKSg/Ojo/KFxcZFxcZCkpPy8uZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDYpKTtcbiAgcmV0dXJuIG4gPyAoZC5aID0gblsxXSA/IDAgOiAtKG5bMl0gKyAoblszXSB8fCBcIjAwXCIpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVF1YXJ0ZXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyAoZC5xID0gblswXSAqIDMgLSAzLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTW9udGhOdW1iZXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5tID0gblswXSAtIDEsIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VEYXlPZk1vbnRoKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuZCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlRGF5T2ZZZWFyKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAzKSk7XG4gIHJldHVybiBuID8gKGQubSA9IDAsIGQuZCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlSG91cjI0KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuSCA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlTWludXRlcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLk0gPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVNlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5TID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNaWxsaXNlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDMpKTtcbiAgcmV0dXJuIG4gPyAoZC5MID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNaWNyb3NlY29uZHMoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDYpKTtcbiAgcmV0dXJuIG4gPyAoZC5MID0gTWF0aC5mbG9vcihuWzBdIC8gMTAwMCksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VMaXRlcmFsUGVyY2VudChkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBwZXJjZW50UmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyBpICsgblswXS5sZW5ndGggOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VVbml4VGltZXN0YW1wKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgcmV0dXJuIG4gPyAoZC5RID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VVbml4VGltZXN0YW1wU2Vjb25kcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpKSk7XG4gIHJldHVybiBuID8gKGQucyA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdERheU9mTW9udGgoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0RGF0ZSgpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0SG91cjI0KGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldEhvdXJzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRIb3VyMTIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0SG91cnMoKSAlIDEyIHx8IDEyLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF5T2ZZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZCgxICsgdGltZURheS5jb3VudCh0aW1lWWVhcihkKSwgZCksIHAsIDMpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaWxsaXNlY29uZHMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0TWlsbGlzZWNvbmRzKCksIHAsIDMpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaWNyb3NlY29uZHMoZCwgcCkge1xuICByZXR1cm4gZm9ybWF0TWlsbGlzZWNvbmRzKGQsIHApICsgXCIwMDBcIjtcbn1cblxuZnVuY3Rpb24gZm9ybWF0TW9udGhOdW1iZXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0TW9udGgoKSArIDEsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNaW51dGVzKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldE1pbnV0ZXMoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFNlY29uZHMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0U2Vjb25kcygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla2RheU51bWJlck1vbmRheShkKSB7XG4gIHZhciBkYXkgPSBkLmdldERheSgpO1xuICByZXR1cm4gZGF5ID09PSAwID8gNyA6IGRheTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla051bWJlclN1bmRheShkLCBwKSB7XG4gIHJldHVybiBwYWQodGltZVN1bmRheS5jb3VudCh0aW1lWWVhcihkKSAtIDEsIGQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZElTTyhkKSB7XG4gIHZhciBkYXkgPSBkLmdldERheSgpO1xuICByZXR1cm4gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB0aW1lVGh1cnNkYXkoZCkgOiB0aW1lVGh1cnNkYXkuY2VpbChkKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla051bWJlcklTTyhkLCBwKSB7XG4gIGQgPSBkSVNPKGQpO1xuICByZXR1cm4gcGFkKHRpbWVUaHVyc2RheS5jb3VudCh0aW1lWWVhcihkKSwgZCkgKyAodGltZVllYXIoZCkuZ2V0RGF5KCkgPT09IDQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0V2Vla2RheU51bWJlclN1bmRheShkKSB7XG4gIHJldHVybiBkLmdldERheSgpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrTnVtYmVyTW9uZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh0aW1lTW9uZGF5LmNvdW50KHRpbWVZZWFyKGQpIC0gMSwgZCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldEZ1bGxZZWFyKCkgJSAxMDAsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRZZWFySVNPKGQsIHApIHtcbiAgZCA9IGRJU08oZCk7XG4gIHJldHVybiBwYWQoZC5nZXRGdWxsWWVhcigpICUgMTAwLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RnVsbFllYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0RnVsbFllYXIoKSAlIDEwMDAwLCBwLCA0KTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RnVsbFllYXJJU08oZCwgcCkge1xuICB2YXIgZGF5ID0gZC5nZXREYXkoKTtcbiAgZCA9IChkYXkgPj0gNCB8fCBkYXkgPT09IDApID8gdGltZVRodXJzZGF5KGQpIDogdGltZVRodXJzZGF5LmNlaWwoZCk7XG4gIHJldHVybiBwYWQoZC5nZXRGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRab25lKGQpIHtcbiAgdmFyIHogPSBkLmdldFRpbWV6b25lT2Zmc2V0KCk7XG4gIHJldHVybiAoeiA+IDAgPyBcIi1cIiA6ICh6ICo9IC0xLCBcIitcIikpXG4gICAgICArIHBhZCh6IC8gNjAgfCAwLCBcIjBcIiwgMilcbiAgICAgICsgcGFkKHogJSA2MCwgXCIwXCIsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENEYXlPZk1vbnRoKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0RhdGUoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0hvdXIyNChkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENIb3VycygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDSG91cjEyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0hvdXJzKCkgJSAxMiB8fCAxMiwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0RheU9mWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoMSArIHV0Y0RheS5jb3VudCh1dGNZZWFyKGQpLCBkKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pbGxpc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENNaWxsaXNlY29uZHMoKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pY3Jvc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBmb3JtYXRVVENNaWxsaXNlY29uZHMoZCwgcCkgKyBcIjAwMFwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENNb250aE51bWJlcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENNb250aCgpICsgMSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01pbnV0ZXMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDTWludXRlcygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDU2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENTZWNvbmRzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrZGF5TnVtYmVyTW9uZGF5KGQpIHtcbiAgdmFyIGRvdyA9IGQuZ2V0VVRDRGF5KCk7XG4gIHJldHVybiBkb3cgPT09IDAgPyA3IDogZG93O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrTnVtYmVyU3VuZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh1dGNTdW5kYXkuY291bnQodXRjWWVhcihkKSAtIDEsIGQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gVVRDZElTTyhkKSB7XG4gIHZhciBkYXkgPSBkLmdldFVUQ0RheSgpO1xuICByZXR1cm4gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB1dGNUaHVyc2RheShkKSA6IHV0Y1RodXJzZGF5LmNlaWwoZCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtOdW1iZXJJU08oZCwgcCkge1xuICBkID0gVVRDZElTTyhkKTtcbiAgcmV0dXJuIHBhZCh1dGNUaHVyc2RheS5jb3VudCh1dGNZZWFyKGQpLCBkKSArICh1dGNZZWFyKGQpLmdldFVUQ0RheSgpID09PSA0KSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJTdW5kYXkoZCkge1xuICByZXR1cm4gZC5nZXRVVENEYXkoKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDV2Vla051bWJlck1vbmRheShkLCBwKSB7XG4gIHJldHVybiBwYWQodXRjTW9uZGF5LmNvdW50KHV0Y1llYXIoZCkgLSAxLCBkKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1llYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDRnVsbFllYXIoKSAlIDEwMCwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1llYXJJU08oZCwgcCkge1xuICBkID0gVVRDZElTTyhkKTtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0Z1bGxZZWFyKCkgJSAxMDAsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENGdWxsWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENGdWxsWWVhcklTTyhkLCBwKSB7XG4gIHZhciBkYXkgPSBkLmdldFVUQ0RheSgpO1xuICBkID0gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB1dGNUaHVyc2RheShkKSA6IHV0Y1RodXJzZGF5LmNlaWwoZCk7XG4gIHJldHVybiBwYWQoZC5nZXRVVENGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENab25lKCkge1xuICByZXR1cm4gXCIrMDAwMFwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRMaXRlcmFsUGVyY2VudCgpIHtcbiAgcmV0dXJuIFwiJVwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVbml4VGltZXN0YW1wKGQpIHtcbiAgcmV0dXJuICtkO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVbml4VGltZXN0YW1wU2Vjb25kcyhkKSB7XG4gIHJldHVybiBNYXRoLmZsb29yKCtkIC8gMTAwMCk7XG59XG4iLCJpbXBvcnQgZm9ybWF0TG9jYWxlIGZyb20gXCIuL2xvY2FsZS5qc1wiO1xuXG52YXIgbG9jYWxlO1xuZXhwb3J0IHZhciB0aW1lRm9ybWF0O1xuZXhwb3J0IHZhciB0aW1lUGFyc2U7XG5leHBvcnQgdmFyIHV0Y0Zvcm1hdDtcbmV4cG9ydCB2YXIgdXRjUGFyc2U7XG5cbmRlZmF1bHRMb2NhbGUoe1xuICBkYXRlVGltZTogXCIleCwgJVhcIixcbiAgZGF0ZTogXCIlLW0vJS1kLyVZXCIsXG4gIHRpbWU6IFwiJS1JOiVNOiVTICVwXCIsXG4gIHBlcmlvZHM6IFtcIkFNXCIsIFwiUE1cIl0sXG4gIGRheXM6IFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdLFxuICBzaG9ydERheXM6IFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXSxcbiAgbW9udGhzOiBbXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIiwgXCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiXSxcbiAgc2hvcnRNb250aHM6IFtcIkphblwiLCBcIkZlYlwiLCBcIk1hclwiLCBcIkFwclwiLCBcIk1heVwiLCBcIkp1blwiLCBcIkp1bFwiLCBcIkF1Z1wiLCBcIlNlcFwiLCBcIk9jdFwiLCBcIk5vdlwiLCBcIkRlY1wiXVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGRlZmF1bHRMb2NhbGUoZGVmaW5pdGlvbikge1xuICBsb2NhbGUgPSBmb3JtYXRMb2NhbGUoZGVmaW5pdGlvbik7XG4gIHRpbWVGb3JtYXQgPSBsb2NhbGUuZm9ybWF0O1xuICB0aW1lUGFyc2UgPSBsb2NhbGUucGFyc2U7XG4gIHV0Y0Zvcm1hdCA9IGxvY2FsZS51dGNGb3JtYXQ7XG4gIHV0Y1BhcnNlID0gbG9jYWxlLnV0Y1BhcnNlO1xuICByZXR1cm4gbG9jYWxlO1xufVxuIiwiaW1wb3J0IHt0aW1lWWVhciwgdGltZU1vbnRoLCB0aW1lV2VlaywgdGltZURheSwgdGltZUhvdXIsIHRpbWVNaW51dGUsIHRpbWVTZWNvbmQsIHRpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbH0gZnJvbSBcImQzLXRpbWVcIjtcbmltcG9ydCB7dGltZUZvcm1hdH0gZnJvbSBcImQzLXRpbWUtZm9ybWF0XCI7XG5pbXBvcnQgY29udGludW91cywge2NvcHl9IGZyb20gXCIuL2NvbnRpbnVvdXMuanNcIjtcbmltcG9ydCB7aW5pdFJhbmdlfSBmcm9tIFwiLi9pbml0LmpzXCI7XG5pbXBvcnQgbmljZSBmcm9tIFwiLi9uaWNlLmpzXCI7XG5cbmZ1bmN0aW9uIGRhdGUodCkge1xuICByZXR1cm4gbmV3IERhdGUodCk7XG59XG5cbmZ1bmN0aW9uIG51bWJlcih0KSB7XG4gIHJldHVybiB0IGluc3RhbmNlb2YgRGF0ZSA/ICt0IDogK25ldyBEYXRlKCt0KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNhbGVuZGFyKHRpY2tzLCB0aWNrSW50ZXJ2YWwsIHllYXIsIG1vbnRoLCB3ZWVrLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmb3JtYXQpIHtcbiAgdmFyIHNjYWxlID0gY29udGludW91cygpLFxuICAgICAgaW52ZXJ0ID0gc2NhbGUuaW52ZXJ0LFxuICAgICAgZG9tYWluID0gc2NhbGUuZG9tYWluO1xuXG4gIHZhciBmb3JtYXRNaWxsaXNlY29uZCA9IGZvcm1hdChcIi4lTFwiKSxcbiAgICAgIGZvcm1hdFNlY29uZCA9IGZvcm1hdChcIjolU1wiKSxcbiAgICAgIGZvcm1hdE1pbnV0ZSA9IGZvcm1hdChcIiVJOiVNXCIpLFxuICAgICAgZm9ybWF0SG91ciA9IGZvcm1hdChcIiVJICVwXCIpLFxuICAgICAgZm9ybWF0RGF5ID0gZm9ybWF0KFwiJWEgJWRcIiksXG4gICAgICBmb3JtYXRXZWVrID0gZm9ybWF0KFwiJWIgJWRcIiksXG4gICAgICBmb3JtYXRNb250aCA9IGZvcm1hdChcIiVCXCIpLFxuICAgICAgZm9ybWF0WWVhciA9IGZvcm1hdChcIiVZXCIpO1xuXG4gIGZ1bmN0aW9uIHRpY2tGb3JtYXQoZGF0ZSkge1xuICAgIHJldHVybiAoc2Vjb25kKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdE1pbGxpc2Vjb25kXG4gICAgICAgIDogbWludXRlKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdFNlY29uZFxuICAgICAgICA6IGhvdXIoZGF0ZSkgPCBkYXRlID8gZm9ybWF0TWludXRlXG4gICAgICAgIDogZGF5KGRhdGUpIDwgZGF0ZSA/IGZvcm1hdEhvdXJcbiAgICAgICAgOiBtb250aChkYXRlKSA8IGRhdGUgPyAod2VlayhkYXRlKSA8IGRhdGUgPyBmb3JtYXREYXkgOiBmb3JtYXRXZWVrKVxuICAgICAgICA6IHllYXIoZGF0ZSkgPCBkYXRlID8gZm9ybWF0TW9udGhcbiAgICAgICAgOiBmb3JtYXRZZWFyKShkYXRlKTtcbiAgfVxuXG4gIHNjYWxlLmludmVydCA9IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoaW52ZXJ0KHkpKTtcbiAgfTtcblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyBkb21haW4oQXJyYXkuZnJvbShfLCBudW1iZXIpKSA6IGRvbWFpbigpLm1hcChkYXRlKTtcbiAgfTtcblxuICBzY2FsZS50aWNrcyA9IGZ1bmN0aW9uKGludGVydmFsKSB7XG4gICAgdmFyIGQgPSBkb21haW4oKTtcbiAgICByZXR1cm4gdGlja3MoZFswXSwgZFtkLmxlbmd0aCAtIDFdLCBpbnRlcnZhbCA9PSBudWxsID8gMTAgOiBpbnRlcnZhbCk7XG4gIH07XG5cbiAgc2NhbGUudGlja0Zvcm1hdCA9IGZ1bmN0aW9uKGNvdW50LCBzcGVjaWZpZXIpIHtcbiAgICByZXR1cm4gc3BlY2lmaWVyID09IG51bGwgPyB0aWNrRm9ybWF0IDogZm9ybWF0KHNwZWNpZmllcik7XG4gIH07XG5cbiAgc2NhbGUubmljZSA9IGZ1bmN0aW9uKGludGVydmFsKSB7XG4gICAgdmFyIGQgPSBkb21haW4oKTtcbiAgICBpZiAoIWludGVydmFsIHx8IHR5cGVvZiBpbnRlcnZhbC5yYW5nZSAhPT0gXCJmdW5jdGlvblwiKSBpbnRlcnZhbCA9IHRpY2tJbnRlcnZhbChkWzBdLCBkW2QubGVuZ3RoIC0gMV0sIGludGVydmFsID09IG51bGwgPyAxMCA6IGludGVydmFsKTtcbiAgICByZXR1cm4gaW50ZXJ2YWwgPyBkb21haW4obmljZShkLCBpbnRlcnZhbCkpIDogc2NhbGU7XG4gIH07XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBjb3B5KHNjYWxlLCBjYWxlbmRhcih0aWNrcywgdGlja0ludGVydmFsLCB5ZWFyLCBtb250aCwgd2VlaywgZGF5LCBob3VyLCBtaW51dGUsIHNlY29uZCwgZm9ybWF0KSk7XG4gIH07XG5cbiAgcmV0dXJuIHNjYWxlO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0aW1lKCkge1xuICByZXR1cm4gaW5pdFJhbmdlLmFwcGx5KGNhbGVuZGFyKHRpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbCwgdGltZVllYXIsIHRpbWVNb250aCwgdGltZVdlZWssIHRpbWVEYXksIHRpbWVIb3VyLCB0aW1lTWludXRlLCB0aW1lU2Vjb25kLCB0aW1lRm9ybWF0KS5kb21haW4oW25ldyBEYXRlKDIwMDAsIDAsIDEpLCBuZXcgRGF0ZSgyMDAwLCAwLCAyKV0pLCBhcmd1bWVudHMpO1xufVxuIiwiZXhwb3J0IGZ1bmN0aW9uIFRyYW5zZm9ybShrLCB4LCB5KSB7XG4gIHRoaXMuayA9IGs7XG4gIHRoaXMueCA9IHg7XG4gIHRoaXMueSA9IHk7XG59XG5cblRyYW5zZm9ybS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2Zvcm0sXG4gIHNjYWxlOiBmdW5jdGlvbihrKSB7XG4gICAgcmV0dXJuIGsgPT09IDEgPyB0aGlzIDogbmV3IFRyYW5zZm9ybSh0aGlzLmsgKiBrLCB0aGlzLngsIHRoaXMueSk7XG4gIH0sXG4gIHRyYW5zbGF0ZTogZnVuY3Rpb24oeCwgeSkge1xuICAgIHJldHVybiB4ID09PSAwICYgeSA9PT0gMCA/IHRoaXMgOiBuZXcgVHJhbnNmb3JtKHRoaXMuaywgdGhpcy54ICsgdGhpcy5rICogeCwgdGhpcy55ICsgdGhpcy5rICogeSk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiBbcG9pbnRbMF0gKiB0aGlzLmsgKyB0aGlzLngsIHBvaW50WzFdICogdGhpcy5rICsgdGhpcy55XTtcbiAgfSxcbiAgYXBwbHlYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHggKiB0aGlzLmsgKyB0aGlzLng7XG4gIH0sXG4gIGFwcGx5WTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB5ICogdGhpcy5rICsgdGhpcy55O1xuICB9LFxuICBpbnZlcnQ6IGZ1bmN0aW9uKGxvY2F0aW9uKSB7XG4gICAgcmV0dXJuIFsobG9jYXRpb25bMF0gLSB0aGlzLngpIC8gdGhpcy5rLCAobG9jYXRpb25bMV0gLSB0aGlzLnkpIC8gdGhpcy5rXTtcbiAgfSxcbiAgaW52ZXJ0WDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiAoeCAtIHRoaXMueCkgLyB0aGlzLms7XG4gIH0sXG4gIGludmVydFk6IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gKHkgLSB0aGlzLnkpIC8gdGhpcy5rO1xuICB9LFxuICByZXNjYWxlWDogZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB4LmNvcHkoKS5kb21haW4oeC5yYW5nZSgpLm1hcCh0aGlzLmludmVydFgsIHRoaXMpLm1hcCh4LmludmVydCwgeCkpO1xuICB9LFxuICByZXNjYWxlWTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiB5LmNvcHkoKS5kb21haW4oeS5yYW5nZSgpLm1hcCh0aGlzLmludmVydFksIHRoaXMpLm1hcCh5LmludmVydCwgeSkpO1xuICB9LFxuICB0b1N0cmluZzogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwidHJhbnNsYXRlKFwiICsgdGhpcy54ICsgXCIsXCIgKyB0aGlzLnkgKyBcIikgc2NhbGUoXCIgKyB0aGlzLmsgKyBcIilcIjtcbiAgfVxufTtcblxuZXhwb3J0IHZhciBpZGVudGl0eSA9IG5ldyBUcmFuc2Zvcm0oMSwgMCwgMCk7XG5cbnRyYW5zZm9ybS5wcm90b3R5cGUgPSBUcmFuc2Zvcm0ucHJvdG90eXBlO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiB0cmFuc2Zvcm0obm9kZSkge1xuICB3aGlsZSAoIW5vZGUuX196b29tKSBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkgcmV0dXJuIGlkZW50aXR5O1xuICByZXR1cm4gbm9kZS5fX3pvb207XG59XG4iLCJpbXBvcnQgeyBSZWFjdEVsZW1lbnQsIGNyZWF0ZUVsZW1lbnQsIHVzZUVmZmVjdCwgdXNlUmVmLCB1c2VTdGF0ZSB9IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IHsgQ2F0YWxvZ1JlbGVhc2VDaGFydENvbnRhaW5lclByb3BzIH0gZnJvbSBcIi4uL3R5cGluZ3MvQ2F0YWxvZ1JlbGVhc2VDaGFydFByb3BzXCI7XG5pbXBvcnQgKiBhcyBkMyBmcm9tIFwiZDNcIjtcblxuaW1wb3J0IFwiLi91aS9DYXRhbG9nUmVsZWFzZUNoYXJ0LmNzc1wiO1xuXG5leHBvcnQgZnVuY3Rpb24gQ2F0YWxvZ1JlbGVhc2VDaGFydCh7IG5hbWUgfTogQ2F0YWxvZ1JlbGVhc2VDaGFydENvbnRhaW5lclByb3BzKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCBjaGFydFJlZiA9IHVzZVJlZjxIVE1MRGl2RWxlbWVudD4obnVsbCk7XG4gICAgY29uc3QgY29udGFpbmVyUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKTtcbiAgICBjb25zdCBbZGltZW5zaW9ucywgc2V0RGltZW5zaW9uc10gPSB1c2VTdGF0ZSh7IHdpZHRoOiAwLCBoZWlnaHQ6IDAgfSk7XG5cbiAgICAvLyBIYW5kbGUgcmVzaXplXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgY29uc3QgaGFuZGxlUmVzaXplID0gKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGNvbnRhaW5lclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeyB3aWR0aCB9ID0gY29udGFpbmVyUmVmLmN1cnJlbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgICAgICAgICAgLy8gU2V0IHJlc3BvbnNpdmUgZGltZW5zaW9uc1xuICAgICAgICAgICAgICAgIHNldERpbWVuc2lvbnMoe1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIGhlaWdodDogTWF0aC5taW4oNjAwLCB3aWR0aCAqIDAuNSkgLy8gTWFpbnRhaW4gYXNwZWN0IHJhdGlvLCBtYXggNjAwcHggaGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gSW5pdGlhbCBzaXplXG4gICAgICAgIGhhbmRsZVJlc2l6ZSgpO1xuXG4gICAgICAgIC8vIEFkZCByZXNpemUgbGlzdGVuZXJcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGhhbmRsZVJlc2l6ZSk7XG4gICAgICAgIFxuICAgICAgICAvLyBBbHNvIG9ic2VydmUgY29udGFpbmVyIHNpemUgY2hhbmdlc1xuICAgICAgICBjb25zdCByZXNpemVPYnNlcnZlciA9IG5ldyBSZXNpemVPYnNlcnZlcihoYW5kbGVSZXNpemUpO1xuICAgICAgICBpZiAoY29udGFpbmVyUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgIHJlc2l6ZU9ic2VydmVyLm9ic2VydmUoY29udGFpbmVyUmVmLmN1cnJlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUpO1xuICAgICAgICAgICAgcmVzaXplT2JzZXJ2ZXIuZGlzY29ubmVjdCgpO1xuICAgICAgICB9O1xuICAgIH0sIFtdKTtcblxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmICghY2hhcnRSZWYuY3VycmVudCB8fCBkaW1lbnNpb25zLndpZHRoID09PSAwKSByZXR1cm47XG5cbiAgICAgICAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIGNoYXJ0XG4gICAgICAgIGQzLnNlbGVjdChjaGFydFJlZi5jdXJyZW50KS5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuXG4gICAgICAgIC8vIERhdGEgc3RydWN0dXJlXG4gICAgICAgIGNvbnN0IGluZHVzdHJpZXMgPSBbXG4gICAgICAgICAgICB7IG5hbWU6IFwiQWVyb3NwYWNlICYgRGVmZW5zZVwiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDIzLCAxMCwgMSksIGN1cnJlbnQ6IG5ldyBEYXRlKDIwMjQsIDExLCAxKSwgdXBjb21pbmc6IFwiMjUwNlwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiQXV0b21vdGl2ZVwiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDIzLCAyLCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNCwgNSwgMSksIHVwY29taW5nOiBcIlRCRFwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiQmF0dGVyeVwiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDI1LCAwLCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNSwgNCwgMSksIHVwY29taW5nOiBcIjI1MDdcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIkNQJlJcIiwgcmV0aXJlZDogbmV3IERhdGUoMjAyNCwgOCwgMSksIGN1cnJlbnQ6IG5ldyBEYXRlKDIwMjQsIDExLCAxKSwgdXBjb21pbmc6IFwiVEJEXCIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJFbGVjdHJvbmljc1wiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDI1LCAyLCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNSwgNCwgMSksIHVwY29taW5nOiBcIjI1MDhcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIkVuZXJneSAmIFV0aWxpdGllc1wiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDI0LCA4LCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNSwgMSwgMSksIHVwY29taW5nOiBcIjI1MDVcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIkhlYXZ5IEVxdWlwbWVudFwiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDIzLCA1LCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyMywgNSwgMSksIHVwY29taW5nOiBcIlRCRFwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiSW5kdXN0cmlhbCBNYWNoaW5lcnlcIiwgcmV0aXJlZDogbmV3IERhdGUoMjAyNSwgMiwgMSksIGN1cnJlbnQ6IG5ldyBEYXRlKDIwMjUsIDUsIDEpLCB1cGNvbWluZzogXCIyNTA5XCIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJNYXJpbmVcIiwgcmV0aXJlZDogbmV3IERhdGUoMjAyNCwgMiwgMSksIGN1cnJlbnQ6IG5ldyBEYXRlKDIwMjQsIDIsIDEpLCB1cGNvbWluZzogXCJUQkRcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIk1lZGljYWwgRGV2aWNlc1wiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDI0LCA5LCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNSwgMCwgMSksIHVwY29taW5nOiBcIlRCRFwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiUGhhcm1hY2V1dGljYWxzXCIsIHJldGlyZWQ6IG5ldyBEYXRlKDIwMjQsIDEwLCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNSwgMiwgMSksIHVwY29taW5nOiBcIjI1MDZcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIlNlbWljb25kdWN0b3IgRGV2aWNlc1wiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDI0LCAxLCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNCwgNCwgMSksIHVwY29taW5nOiBcIlRCRFwiIH1cbiAgICAgICAgXTtcblxuICAgICAgICAvLyBSZXNwb25zaXZlIG1hcmdpbnMgYmFzZWQgb24gY29udGFpbmVyIHdpZHRoXG4gICAgICAgIGNvbnN0IG1hcmdpbiA9IHtcbiAgICAgICAgICAgIHRvcDogODAsXG4gICAgICAgICAgICByaWdodDogZGltZW5zaW9ucy53aWR0aCA8IDgwMCA/IDEwMCA6IDE1MCxcbiAgICAgICAgICAgIGJvdHRvbTogNDAsXG4gICAgICAgICAgICBsZWZ0OiBkaW1lbnNpb25zLndpZHRoIDwgODAwID8gMTIwIDogMTgwXG4gICAgICAgIH07XG4gICAgICAgIFxuICAgICAgICBjb25zdCB3aWR0aCA9IGRpbWVuc2lvbnMud2lkdGggLSBtYXJnaW4ubGVmdCAtIG1hcmdpbi5yaWdodDtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gZGltZW5zaW9ucy5oZWlnaHQgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcblxuICAgICAgICAvLyBDcmVhdGUgU1ZHIHdpdGggdmlld0JveCBmb3IgYmV0dGVyIHNjYWxpbmdcbiAgICAgICAgY29uc3Qgc3ZnID0gZDMuc2VsZWN0KGNoYXJ0UmVmLmN1cnJlbnQpXG4gICAgICAgICAgICAuYXBwZW5kKFwic3ZnXCIpXG4gICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIGRpbWVuc2lvbnMud2lkdGgpXG4gICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCBkaW1lbnNpb25zLmhlaWdodClcbiAgICAgICAgICAgIC5hdHRyKFwidmlld0JveFwiLCBgMCAwICR7ZGltZW5zaW9ucy53aWR0aH0gJHtkaW1lbnNpb25zLmhlaWdodH1gKVxuICAgICAgICAgICAgLmF0dHIoXCJwcmVzZXJ2ZUFzcGVjdFJhdGlvXCIsIFwieE1pZFlNaWQgbWVldFwiKVxuICAgICAgICAgICAgLmFwcGVuZChcImdcIilcbiAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGB0cmFuc2xhdGUoJHttYXJnaW4ubGVmdH0sJHttYXJnaW4udG9wfSlgKTtcblxuICAgICAgICAvLyBUaW1lIHNjYWxlXG4gICAgICAgIGNvbnN0IHRpbWVTY2FsZSA9IGQzLnNjYWxlVGltZSgpXG4gICAgICAgICAgICAuZG9tYWluKFtuZXcgRGF0ZSgyMDIyLCA3LCAxKSwgbmV3IERhdGUoMjAyNSwgMTEsIDMxKV0pXG4gICAgICAgICAgICAucmFuZ2UoWzAsIHdpZHRoXSk7XG5cbiAgICAgICAgLy8gWSBzY2FsZSBmb3IgaW5kdXN0cmllc1xuICAgICAgICBjb25zdCB5U2NhbGUgPSBkMy5zY2FsZUJhbmQoKVxuICAgICAgICAgICAgLmRvbWFpbihpbmR1c3RyaWVzLm1hcChkID0+IGQubmFtZSkpXG4gICAgICAgICAgICAucmFuZ2UoWzAsIGhlaWdodF0pXG4gICAgICAgICAgICAucGFkZGluZygwLjMpO1xuXG4gICAgICAgIC8vIEFkZCB0aW1lbGluZSBkYXRlc1xuICAgICAgICBjb25zdCB0aW1lbGluZURhdGVzID0gW1xuICAgICAgICAgICAgbmV3IERhdGUoMjAyMiwgNywgMSksXG4gICAgICAgICAgICBuZXcgRGF0ZSgyMDIzLCAyLCAxKSxcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjMsIDksIDEpLFxuICAgICAgICAgICAgbmV3IERhdGUoMjAyNCwgMywgMSksXG4gICAgICAgICAgICBuZXcgRGF0ZSgyMDI0LCAxMCwgMSksXG4gICAgICAgICAgICBuZXcgRGF0ZSgyMDI1LCA0LCAxKSxcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjUsIDExLCAxKVxuICAgICAgICBdO1xuXG4gICAgICAgIC8vIERyYXcgbWFpbiB0aW1lbGluZVxuICAgICAgICBzdmcuYXBwZW5kKFwibGluZVwiKVxuICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRpbWVsaW5lLWxpbmVcIilcbiAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgMClcbiAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgLTQwKVxuICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCB3aWR0aClcbiAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgLTQwKTtcblxuICAgICAgICAvLyBBZGQgdGltZWxpbmUgbWFya2VycyBhbmQgbGFiZWxzXG4gICAgICAgIHRpbWVsaW5lRGF0ZXMuZm9yRWFjaChkYXRlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHggPSB0aW1lU2NhbGUoZGF0ZSk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJjaXJjbGVcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImN4XCIsIHgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjeVwiLCAtNDApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJyXCIsIDQpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJmaWxsXCIsIFwiIzJjNTI4MlwiKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiZGF0ZS10ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIHgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIC01MClcbiAgICAgICAgICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgICAgICAgICAgLnRleHQoZDMudGltZUZvcm1hdChcIiViLSV5XCIpKGRhdGUpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIHRvZGF5J3MgZGF0ZVxuICAgICAgICBjb25zdCB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgICAgIGNvbnN0IHRvZGF5WCA9IHRpbWVTY2FsZSh0b2RheSk7XG4gICAgICAgIFxuICAgICAgICAvLyBUb2RheSdzIHZlcnRpY2FsIGxpbmVcbiAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0b2RheS1saW5lXCIpXG4gICAgICAgICAgICAuYXR0cihcIngxXCIsIHRvZGF5WClcbiAgICAgICAgICAgIC5hdHRyKFwieTFcIiwgLTQwKVxuICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCB0b2RheVgpXG4gICAgICAgICAgICAuYXR0cihcInkyXCIsIGhlaWdodCk7XG4gICAgICAgIFxuICAgICAgICAvLyBUb2RheSdzIGNpcmNsZVxuICAgICAgICBzdmcuYXBwZW5kKFwiY2lyY2xlXCIpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidG9kYXktY2lyY2xlXCIpXG4gICAgICAgICAgICAuYXR0cihcImN4XCIsIHRvZGF5WClcbiAgICAgICAgICAgIC5hdHRyKFwiY3lcIiwgLTQwKVxuICAgICAgICAgICAgLmF0dHIoXCJyXCIsIDgpO1xuICAgICAgICBcbiAgICAgICAgLy8gVG9kYXkncyBkYXRlIGxhYmVsXG4gICAgICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidG9kYXktdGV4dFwiKVxuICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIHRvZGF5WClcbiAgICAgICAgICAgIC5hdHRyKFwieVwiLCAtNjUpXG4gICAgICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgICAgICAudGV4dChkMy50aW1lRm9ybWF0KFwiJS1tLyUtZC8lWVwiKSh0b2RheSkpO1xuXG4gICAgICAgIC8vIEFkanVzdCBmb250IHNpemVzIGZvciBzbWFsbGVyIHNjcmVlbnNcbiAgICAgICAgY29uc3QgZm9udFNpemUgPSBkaW1lbnNpb25zLndpZHRoIDwgODAwID8gXCIxMnB4XCIgOiBcIjE0cHhcIjtcblxuICAgICAgICAvLyBEcmF3IGluZHVzdHJ5IHJvd3NcbiAgICAgICAgaW5kdXN0cmllcy5mb3JFYWNoKChpbmR1c3RyeSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeSA9IHlTY2FsZShpbmR1c3RyeS5uYW1lKSEgKyB5U2NhbGUuYmFuZHdpZHRoKCkgLyAyO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBJbmR1c3RyeSBuYW1lXG4gICAgICAgICAgICBzdmcuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJpbmR1c3RyeS10ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIC0xMClcbiAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgeSArIDUpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcImVuZFwiKVxuICAgICAgICAgICAgICAgIC5zdHlsZShcImZvbnQtc2l6ZVwiLCBmb250U2l6ZSlcbiAgICAgICAgICAgICAgICAudGV4dChpbmR1c3RyeS5uYW1lKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSW5kdXN0cnkgbGluZVxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiaW5kdXN0cnktbGluZVwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgMClcbiAgICAgICAgICAgICAgICAuYXR0cihcInkxXCIsIHkpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCB3aWR0aClcbiAgICAgICAgICAgICAgICAuYXR0cihcInkyXCIsIHkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDb250aW51aXR5IGxpbmUgYmV0d2VlbiByZXRpcmVkIGFuZCBjdXJyZW50XG4gICAgICAgICAgICBpZiAoaW5kdXN0cnkucmV0aXJlZCAmJiBpbmR1c3RyeS5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0aXJlZFggPSB0aW1lU2NhbGUoaW5kdXN0cnkucmV0aXJlZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFggPSB0aW1lU2NhbGUoaW5kdXN0cnkuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImNvbnRpbnVpdHktbGluZVwiKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIngxXCIsIHJldGlyZWRYKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInkxXCIsIHkpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgY3VycmVudFgpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEZ1dHVyZSBjb250aW51aXR5IGxpbmUgZnJvbSBjdXJyZW50IHRvIHVwY29taW5nXG4gICAgICAgICAgICBsZXQgdXBjb21pbmdYUG9zID0gd2lkdGggKyAyMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGluZHVzdHJ5LnVwY29taW5nICE9PSBcIlRCRFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeWVhciA9IHBhcnNlSW50KFwiMjBcIiArIGluZHVzdHJ5LnVwY29taW5nLnN1YnN0cmluZygwLCAyKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9udGggPSBwYXJzZUludChpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMiwgNCkpIC0gMTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cGNvbWluZ0RhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHVwY29taW5nRGF0ZSA8PSB0aW1lU2NhbGUuZG9tYWluKClbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdXBjb21pbmdYUG9zID0gdGltZVNjYWxlKHVwY29taW5nRGF0ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXBjb21pbmdYUG9zID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1cGNvbWluZ1hQb3MgPSB3aWR0aCArIDIwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaW5kdXN0cnkuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRYID0gdGltZVNjYWxlKGluZHVzdHJ5LmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIGxldCBsaW5lRW5kWCA9IHVwY29taW5nWFBvcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoaW5kdXN0cnkudXBjb21pbmcgPT09IFwiVEJEXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZUVuZFggPSB3aWR0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGNvbWluZ0RhdGUgPSBuZXcgRGF0ZShwYXJzZUludChcIjIwXCIgKyBpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMCwyKSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoaW5kdXN0cnkudXBjb21pbmcuc3Vic3RyaW5nKDIsNCkpLTEsMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGNvbWluZ0RhdGUgPiB0aW1lU2NhbGUuZG9tYWluKClbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVFbmRYID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lRW5kWCA9IHRpbWVTY2FsZSh1cGNvbWluZ0RhdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImZ1dHVyZS1jb250aW51aXR5LWxpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCBjdXJyZW50WClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCB5KVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIngyXCIsIGxpbmVFbmRYKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInkyXCIsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBSZXRpcmVkIG1hcmtlciAoZGlhbW9uZClcbiAgICAgICAgICAgIGlmIChpbmR1c3RyeS5yZXRpcmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0aXJlZFggPSB0aW1lU2NhbGUoaW5kdXN0cnkucmV0aXJlZCk7XG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInJldGlyZWQtbWFya2VyXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCByZXRpcmVkWCAtIDEwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgeSAtIDEwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDIwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCAyMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyeFwiLCAxMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHJvdGF0ZSg0NSAke3JldGlyZWRYfSAke3l9KWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDdXJyZW50IG1hcmtlciAoZGlhbW9uZClcbiAgICAgICAgICAgIGlmIChpbmR1c3RyeS5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFggPSB0aW1lU2NhbGUoaW5kdXN0cnkuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImN1cnJlbnQtbWFya2VyXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBjdXJyZW50WCAtIDEwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgeSAtIDEwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDIwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCAyMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyeFwiLCAxMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHJvdGF0ZSg0NSAke2N1cnJlbnRYfSAke3l9KWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBVcGNvbWluZyBib3ggLSBhZGp1c3RlZCBwb3NpdGlvbmluZ1xuICAgICAgICAgICAgbGV0IGJveFggPSB1cGNvbWluZ1hQb3M7XG4gICAgICAgICAgICBpZiAoaW5kdXN0cnkudXBjb21pbmcgIT09IFwiVEJEXCIpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB5ZWFyID0gcGFyc2VJbnQoXCIyMFwiICsgaW5kdXN0cnkudXBjb21pbmcuc3Vic3RyaW5nKDAsIDIpKTtcbiAgICAgICAgICAgICAgICBjb25zdCBtb250aCA9IHBhcnNlSW50KGluZHVzdHJ5LnVwY29taW5nLnN1YnN0cmluZygyLCA0KSkgLSAxO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVwY29taW5nRGF0ZSA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCAxKTtcbiAgICAgICAgICAgICAgICBpZiAodXBjb21pbmdEYXRlIDw9IHRpbWVTY2FsZS5kb21haW4oKVsxXSkge1xuICAgICAgICAgICAgICAgICAgICBib3hYID0gdGltZVNjYWxlKHVwY29taW5nRGF0ZSkgLSAzMDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBQbGFjZSBUQkQgYW5kIGZ1dHVyZSBkYXRlcyBhdCB0aGUgZWRnZSBidXQgd2l0aGluIGJvdW5kc1xuICAgICAgICAgICAgICAgICAgICBib3hYID0gd2lkdGggLSA3MDsgLy8gQWRqdXN0ZWQgdG8ga2VlcCBib3ggd2l0aGluIGNoYXJ0IGFyZWFcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGJveFggPSB3aWR0aCAtIDcwOyAvLyBLZWVwIFRCRCBib3hlcyB3aXRoaW4gdGhlIGNoYXJ0IGFyZWFcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidXBjb21pbmctYm94XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIGJveFgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgLSAxNSlcbiAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDYwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDMwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwicnhcIiwgNCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInVwY29taW5nLXRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgYm94WCArIDMwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCB5ICsgNSlcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJmb250LXNpemVcIiwgZm9udFNpemUpXG4gICAgICAgICAgICAgICAgLnRleHQoaW5kdXN0cnkudXBjb21pbmcpO1xuICAgICAgICB9KTtcbiAgICB9LCBbZGltZW5zaW9uc10pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BjYXRhbG9nLXJlbGVhc2UtY2hhcnQgJHtuYW1lfWB9IHJlZj17Y29udGFpbmVyUmVmfSBzdHlsZT17eyB3aWR0aDogJzEwMCUnLCBoZWlnaHQ6ICcxMDAlJyB9fT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2hhcnQtY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cImNoYXJ0LXRpdGxlXCI+Q2F0YWxvZyBSZWxlYXNlIFNjaGVkdWxlPC9oMT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxlZ2VuZFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxlZ2VuZC1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cImxlZ2VuZC1zeW1ib2xcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgeD1cIjJcIiB5PVwiMlwiIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIHJ4PVwiNTAlXCIgY2xhc3NOYW1lPVwicmV0aXJlZC1tYXJrZXJcIi8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlJldGlyZWQgQ2F0YWxvZzwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGVnZW5kLWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwibGVnZW5kLXN5bWJvbFwiIHZpZXdCb3g9XCIwIDAgMjAgMjBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCB4PVwiMlwiIHk9XCIyXCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgcng9XCI1MCVcIiBjbGFzc05hbWU9XCJjdXJyZW50LW1hcmtlclwiLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+Q3VycmVudCBDYXRhbG9nPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsZWdlbmQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJsZWdlbmQtc3ltYm9sXCIgdmlld0JveD1cIjAgMCAyMCAyMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IHg9XCIyXCIgeT1cIjJcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiByeD1cIjJcIiBjbGFzc05hbWU9XCJ1cGNvbWluZy1ib3hcIi8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlVwY29taW5nIENhdGFsb2c8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxlZ2VuZC1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cImxlZ2VuZC1zeW1ib2xcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjEwXCIgY3k9XCIxMFwiIHI9XCI1XCIgY2xhc3NOYW1lPVwidG9kYXktY2lyY2xlXCIvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5Ub2RheSdzIERhdGU8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDxkaXYgcmVmPXtjaGFydFJlZn0gaWQ9XCJjaGFydFwiIHN0eWxlPXt7IHdpZHRoOiAnMTAwJScgfX0+PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn0iXSwibmFtZXMiOlsiYXNjZW5kaW5nIiwiYSIsImIiLCJOYU4iLCJkZXNjZW5kaW5nIiwiYmlzZWN0b3IiLCJmIiwiY29tcGFyZTEiLCJjb21wYXJlMiIsImRlbHRhIiwibGVuZ3RoIiwiZCIsIngiLCJ6ZXJvIiwibGVmdCIsImxvIiwiaGkiLCJtaWQiLCJyaWdodCIsImNlbnRlciIsImkiLCJudW1iZXIiLCJhc2NlbmRpbmdCaXNlY3QiLCJiaXNlY3RSaWdodCIsIkludGVybk1hcCIsIk1hcCIsImNvbnN0cnVjdG9yIiwiZW50cmllcyIsImtleSIsImtleW9mIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydGllcyIsIl9pbnRlcm4iLCJ2YWx1ZSIsIl9rZXkiLCJzZXQiLCJnZXQiLCJpbnRlcm5fZ2V0IiwiaGFzIiwiaW50ZXJuX3NldCIsImRlbGV0ZSIsImludGVybl9kZWxldGUiLCJ2YWx1ZU9mIiwiZTEwIiwiTWF0aCIsInNxcnQiLCJlNSIsImUyIiwidGlja1NwZWMiLCJzdGFydCIsInN0b3AiLCJjb3VudCIsInN0ZXAiLCJtYXgiLCJwb3dlciIsImZsb29yIiwibG9nMTAiLCJlcnJvciIsInBvdyIsImZhY3RvciIsImkxIiwiaTIiLCJpbmMiLCJyb3VuZCIsInRpY2tJbmNyZW1lbnQiLCJ0aWNrU3RlcCIsInJldmVyc2UiLCJyYW5nZSIsIm4iLCJhcmd1bWVudHMiLCJjZWlsIiwiQXJyYXkiLCJub29wIiwiZGlzcGF0Y2giLCJfIiwidCIsInRlc3QiLCJFcnJvciIsIkRpc3BhdGNoIiwicGFyc2VUeXBlbmFtZXMiLCJ0eXBlbmFtZXMiLCJ0eXBlcyIsInRyaW0iLCJzcGxpdCIsIm1hcCIsIm5hbWUiLCJpbmRleE9mIiwic2xpY2UiLCJoYXNPd25Qcm9wZXJ0eSIsInR5cGUiLCJwcm90b3R5cGUiLCJvbiIsInR5cGVuYW1lIiwiY2FsbGJhY2siLCJUIiwiY29weSIsImNhbGwiLCJ0aGF0IiwiYXJncyIsImFwcGx5IiwiYyIsImNvbmNhdCIsInB1c2giLCJ4aHRtbCIsInN2ZyIsInhsaW5rIiwieG1sIiwieG1sbnMiLCJwcmVmaXgiLCJuYW1lc3BhY2VzIiwic3BhY2UiLCJsb2NhbCIsImNyZWF0b3JJbmhlcml0IiwiZG9jdW1lbnQiLCJvd25lckRvY3VtZW50IiwidXJpIiwibmFtZXNwYWNlVVJJIiwiZG9jdW1lbnRFbGVtZW50IiwiY3JlYXRlRWxlbWVudCIsImNyZWF0ZUVsZW1lbnROUyIsImNyZWF0b3JGaXhlZCIsImZ1bGxuYW1lIiwibmFtZXNwYWNlIiwibm9uZSIsInNlbGVjdG9yIiwicXVlcnlTZWxlY3RvciIsInNlbGVjdCIsImdyb3VwcyIsIl9ncm91cHMiLCJtIiwic3ViZ3JvdXBzIiwiaiIsImdyb3VwIiwic3ViZ3JvdXAiLCJub2RlIiwic3Vibm9kZSIsIl9fZGF0YV9fIiwiU2VsZWN0aW9uIiwiX3BhcmVudHMiLCJhcnJheSIsImlzQXJyYXkiLCJmcm9tIiwiZW1wdHkiLCJxdWVyeVNlbGVjdG9yQWxsIiwiYXJyYXlBbGwiLCJzZWxlY3RvckFsbCIsInBhcmVudHMiLCJtYXRjaGVzIiwiY2hpbGRNYXRjaGVyIiwiZmluZCIsImNoaWxkRmluZCIsIm1hdGNoIiwiY2hpbGRyZW4iLCJjaGlsZEZpcnN0IiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJmaWx0ZXIiLCJjaGlsZHJlbkZpbHRlciIsInNlbGVjdEFsbCIsIm1hdGNoZXIiLCJ1cGRhdGUiLCJfZW50ZXIiLCJzcGFyc2UiLCJFbnRlck5vZGUiLCJwYXJlbnQiLCJkYXR1bSIsIl9uZXh0IiwiX3BhcmVudCIsImFwcGVuZENoaWxkIiwiY2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJuZXh0IiwiYmluZEluZGV4IiwiZW50ZXIiLCJleGl0IiwiZGF0YSIsImdyb3VwTGVuZ3RoIiwiZGF0YUxlbmd0aCIsImJpbmRLZXkiLCJub2RlQnlLZXlWYWx1ZSIsImtleVZhbHVlcyIsImtleVZhbHVlIiwiYmluZCIsImNvbnN0YW50IiwiYXJyYXlsaWtlIiwiZW50ZXJHcm91cCIsInVwZGF0ZUdyb3VwIiwiZXhpdEdyb3VwIiwiaTAiLCJwcmV2aW91cyIsIl9leGl0Iiwib25lbnRlciIsIm9udXBkYXRlIiwib25leGl0Iiwic2VsZWN0aW9uIiwiYXBwZW5kIiwicmVtb3ZlIiwibWVyZ2UiLCJvcmRlciIsImNvbnRleHQiLCJncm91cHMwIiwiZ3JvdXBzMSIsIm0wIiwibTEiLCJtaW4iLCJtZXJnZXMiLCJncm91cDAiLCJncm91cDEiLCJjb21wYXJlRG9jdW1lbnRQb3NpdGlvbiIsInBhcmVudE5vZGUiLCJjb21wYXJlIiwiY29tcGFyZU5vZGUiLCJzb3J0Z3JvdXBzIiwic29ydGdyb3VwIiwic29ydCIsInNpemUiLCJhdHRyUmVtb3ZlIiwicmVtb3ZlQXR0cmlidXRlIiwiYXR0clJlbW92ZU5TIiwicmVtb3ZlQXR0cmlidXRlTlMiLCJhdHRyQ29uc3RhbnQiLCJzZXRBdHRyaWJ1dGUiLCJhdHRyQ29uc3RhbnROUyIsInNldEF0dHJpYnV0ZU5TIiwiYXR0ckZ1bmN0aW9uIiwidiIsImF0dHJGdW5jdGlvbk5TIiwiZ2V0QXR0cmlidXRlTlMiLCJnZXRBdHRyaWJ1dGUiLCJlYWNoIiwiZGVmYXVsdFZpZXciLCJzdHlsZVJlbW92ZSIsInN0eWxlIiwicmVtb3ZlUHJvcGVydHkiLCJzdHlsZUNvbnN0YW50IiwicHJpb3JpdHkiLCJzZXRQcm9wZXJ0eSIsInN0eWxlRnVuY3Rpb24iLCJzdHlsZVZhbHVlIiwiZ2V0UHJvcGVydHlWYWx1ZSIsImdldENvbXB1dGVkU3R5bGUiLCJwcm9wZXJ0eVJlbW92ZSIsInByb3BlcnR5Q29uc3RhbnQiLCJwcm9wZXJ0eUZ1bmN0aW9uIiwiY2xhc3NBcnJheSIsInN0cmluZyIsImNsYXNzTGlzdCIsIkNsYXNzTGlzdCIsIl9ub2RlIiwiX25hbWVzIiwiYWRkIiwiam9pbiIsInNwbGljZSIsImNvbnRhaW5zIiwiY2xhc3NlZEFkZCIsIm5hbWVzIiwibGlzdCIsImNsYXNzZWRSZW1vdmUiLCJjbGFzc2VkVHJ1ZSIsImNsYXNzZWRGYWxzZSIsImNsYXNzZWRGdW5jdGlvbiIsInRleHRSZW1vdmUiLCJ0ZXh0Q29udGVudCIsInRleHRDb25zdGFudCIsInRleHRGdW5jdGlvbiIsImh0bWxSZW1vdmUiLCJpbm5lckhUTUwiLCJodG1sQ29uc3RhbnQiLCJodG1sRnVuY3Rpb24iLCJyYWlzZSIsIm5leHRTaWJsaW5nIiwibG93ZXIiLCJwcmV2aW91c1NpYmxpbmciLCJmaXJzdENoaWxkIiwiY3JlYXRlIiwiY3JlYXRvciIsImNvbnN0YW50TnVsbCIsImJlZm9yZSIsInJlbW92ZUNoaWxkIiwic2VsZWN0aW9uX2Nsb25lU2hhbGxvdyIsImNsb25lIiwiY2xvbmVOb2RlIiwic2VsZWN0aW9uX2Nsb25lRGVlcCIsImRlZXAiLCJwcm9wZXJ0eSIsImNvbnRleHRMaXN0ZW5lciIsImxpc3RlbmVyIiwiZXZlbnQiLCJvblJlbW92ZSIsIl9fb24iLCJvIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9wdGlvbnMiLCJvbkFkZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJkaXNwYXRjaEV2ZW50IiwicGFyYW1zIiwid2luZG93IiwiQ3VzdG9tRXZlbnQiLCJjcmVhdGVFdmVudCIsImluaXRFdmVudCIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiZGV0YWlsIiwiZGlzcGF0Y2hDb25zdGFudCIsImRpc3BhdGNoRnVuY3Rpb24iLCJyb290Iiwic2VsZWN0aW9uX3NlbGVjdGlvbiIsInNlbGVjdGlvbl9zZWxlY3QiLCJzZWxlY3Rpb25fc2VsZWN0QWxsIiwic2VsZWN0Q2hpbGQiLCJzZWxlY3Rpb25fc2VsZWN0Q2hpbGQiLCJzZWxlY3RDaGlsZHJlbiIsInNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbiIsInNlbGVjdGlvbl9maWx0ZXIiLCJzZWxlY3Rpb25fZGF0YSIsInNlbGVjdGlvbl9lbnRlciIsInNlbGVjdGlvbl9leGl0Iiwic2VsZWN0aW9uX2pvaW4iLCJzZWxlY3Rpb25fbWVyZ2UiLCJzZWxlY3Rpb25fb3JkZXIiLCJzZWxlY3Rpb25fc29ydCIsInNlbGVjdGlvbl9jYWxsIiwibm9kZXMiLCJzZWxlY3Rpb25fbm9kZXMiLCJzZWxlY3Rpb25fbm9kZSIsInNlbGVjdGlvbl9zaXplIiwic2VsZWN0aW9uX2VtcHR5Iiwic2VsZWN0aW9uX2VhY2giLCJhdHRyIiwic2VsZWN0aW9uX2F0dHIiLCJzZWxlY3Rpb25fc3R5bGUiLCJzZWxlY3Rpb25fcHJvcGVydHkiLCJjbGFzc2VkIiwic2VsZWN0aW9uX2NsYXNzZWQiLCJ0ZXh0Iiwic2VsZWN0aW9uX3RleHQiLCJodG1sIiwic2VsZWN0aW9uX2h0bWwiLCJzZWxlY3Rpb25fcmFpc2UiLCJzZWxlY3Rpb25fbG93ZXIiLCJzZWxlY3Rpb25fYXBwZW5kIiwiaW5zZXJ0Iiwic2VsZWN0aW9uX2luc2VydCIsInNlbGVjdGlvbl9yZW1vdmUiLCJzZWxlY3Rpb25fY2xvbmUiLCJzZWxlY3Rpb25fZGF0dW0iLCJzZWxlY3Rpb25fb24iLCJzZWxlY3Rpb25fZGlzcGF0Y2giLCJTeW1ib2wiLCJpdGVyYXRvciIsInNlbGVjdGlvbl9pdGVyYXRvciIsImZhY3RvcnkiLCJleHRlbmQiLCJkZWZpbml0aW9uIiwiQ29sb3IiLCJkYXJrZXIiLCJicmlnaHRlciIsInJlSSIsInJlTiIsInJlUCIsInJlSGV4IiwicmVSZ2JJbnRlZ2VyIiwiUmVnRXhwIiwicmVSZ2JQZXJjZW50IiwicmVSZ2JhSW50ZWdlciIsInJlUmdiYVBlcmNlbnQiLCJyZUhzbFBlcmNlbnQiLCJyZUhzbGFQZXJjZW50IiwibmFtZWQiLCJhbGljZWJsdWUiLCJhbnRpcXVld2hpdGUiLCJhcXVhIiwiYXF1YW1hcmluZSIsImF6dXJlIiwiYmVpZ2UiLCJiaXNxdWUiLCJibGFjayIsImJsYW5jaGVkYWxtb25kIiwiYmx1ZSIsImJsdWV2aW9sZXQiLCJicm93biIsImJ1cmx5d29vZCIsImNhZGV0Ymx1ZSIsImNoYXJ0cmV1c2UiLCJjaG9jb2xhdGUiLCJjb3JhbCIsImNvcm5mbG93ZXJibHVlIiwiY29ybnNpbGsiLCJjcmltc29uIiwiY3lhbiIsImRhcmtibHVlIiwiZGFya2N5YW4iLCJkYXJrZ29sZGVucm9kIiwiZGFya2dyYXkiLCJkYXJrZ3JlZW4iLCJkYXJrZ3JleSIsImRhcmtraGFraSIsImRhcmttYWdlbnRhIiwiZGFya29saXZlZ3JlZW4iLCJkYXJrb3JhbmdlIiwiZGFya29yY2hpZCIsImRhcmtyZWQiLCJkYXJrc2FsbW9uIiwiZGFya3NlYWdyZWVuIiwiZGFya3NsYXRlYmx1ZSIsImRhcmtzbGF0ZWdyYXkiLCJkYXJrc2xhdGVncmV5IiwiZGFya3R1cnF1b2lzZSIsImRhcmt2aW9sZXQiLCJkZWVwcGluayIsImRlZXBza3libHVlIiwiZGltZ3JheSIsImRpbWdyZXkiLCJkb2RnZXJibHVlIiwiZmlyZWJyaWNrIiwiZmxvcmFsd2hpdGUiLCJmb3Jlc3RncmVlbiIsImZ1Y2hzaWEiLCJnYWluc2Jvcm8iLCJnaG9zdHdoaXRlIiwiZ29sZCIsImdvbGRlbnJvZCIsImdyYXkiLCJncmVlbiIsImdyZWVueWVsbG93IiwiZ3JleSIsImhvbmV5ZGV3IiwiaG90cGluayIsImluZGlhbnJlZCIsImluZGlnbyIsIml2b3J5Iiwia2hha2kiLCJsYXZlbmRlciIsImxhdmVuZGVyYmx1c2giLCJsYXduZ3JlZW4iLCJsZW1vbmNoaWZmb24iLCJsaWdodGJsdWUiLCJsaWdodGNvcmFsIiwibGlnaHRjeWFuIiwibGlnaHRnb2xkZW5yb2R5ZWxsb3ciLCJsaWdodGdyYXkiLCJsaWdodGdyZWVuIiwibGlnaHRncmV5IiwibGlnaHRwaW5rIiwibGlnaHRzYWxtb24iLCJsaWdodHNlYWdyZWVuIiwibGlnaHRza3libHVlIiwibGlnaHRzbGF0ZWdyYXkiLCJsaWdodHNsYXRlZ3JleSIsImxpZ2h0c3RlZWxibHVlIiwibGlnaHR5ZWxsb3ciLCJsaW1lIiwibGltZWdyZWVuIiwibGluZW4iLCJtYWdlbnRhIiwibWFyb29uIiwibWVkaXVtYXF1YW1hcmluZSIsIm1lZGl1bWJsdWUiLCJtZWRpdW1vcmNoaWQiLCJtZWRpdW1wdXJwbGUiLCJtZWRpdW1zZWFncmVlbiIsIm1lZGl1bXNsYXRlYmx1ZSIsIm1lZGl1bXNwcmluZ2dyZWVuIiwibWVkaXVtdHVycXVvaXNlIiwibWVkaXVtdmlvbGV0cmVkIiwibWlkbmlnaHRibHVlIiwibWludGNyZWFtIiwibWlzdHlyb3NlIiwibW9jY2FzaW4iLCJuYXZham93aGl0ZSIsIm5hdnkiLCJvbGRsYWNlIiwib2xpdmUiLCJvbGl2ZWRyYWIiLCJvcmFuZ2UiLCJvcmFuZ2VyZWQiLCJvcmNoaWQiLCJwYWxlZ29sZGVucm9kIiwicGFsZWdyZWVuIiwicGFsZXR1cnF1b2lzZSIsInBhbGV2aW9sZXRyZWQiLCJwYXBheWF3aGlwIiwicGVhY2hwdWZmIiwicGVydSIsInBpbmsiLCJwbHVtIiwicG93ZGVyYmx1ZSIsInB1cnBsZSIsInJlYmVjY2FwdXJwbGUiLCJyZWQiLCJyb3N5YnJvd24iLCJyb3lhbGJsdWUiLCJzYWRkbGVicm93biIsInNhbG1vbiIsInNhbmR5YnJvd24iLCJzZWFncmVlbiIsInNlYXNoZWxsIiwic2llbm5hIiwic2lsdmVyIiwic2t5Ymx1ZSIsInNsYXRlYmx1ZSIsInNsYXRlZ3JheSIsInNsYXRlZ3JleSIsInNub3ciLCJzcHJpbmdncmVlbiIsInN0ZWVsYmx1ZSIsInRhbiIsInRlYWwiLCJ0aGlzdGxlIiwidG9tYXRvIiwidHVycXVvaXNlIiwidmlvbGV0Iiwid2hlYXQiLCJ3aGl0ZSIsIndoaXRlc21va2UiLCJ5ZWxsb3ciLCJ5ZWxsb3dncmVlbiIsImRlZmluZSIsImNvbG9yIiwiY2hhbm5lbHMiLCJhc3NpZ24iLCJkaXNwbGF5YWJsZSIsInJnYiIsImhleCIsImNvbG9yX2Zvcm1hdEhleCIsImZvcm1hdEhleCIsImZvcm1hdEhleDgiLCJjb2xvcl9mb3JtYXRIZXg4IiwiZm9ybWF0SHNsIiwiY29sb3JfZm9ybWF0SHNsIiwiZm9ybWF0UmdiIiwiY29sb3JfZm9ybWF0UmdiIiwidG9TdHJpbmciLCJoc2xDb252ZXJ0IiwiZm9ybWF0IiwibCIsInRvTG93ZXJDYXNlIiwiZXhlYyIsInBhcnNlSW50IiwicmdibiIsIlJnYiIsInJnYmEiLCJoc2xhIiwiciIsImciLCJyZ2JDb252ZXJ0Iiwib3BhY2l0eSIsImsiLCJjbGFtcCIsImNsYW1waSIsImNsYW1wYSIsInJnYl9mb3JtYXRIZXgiLCJyZ2JfZm9ybWF0SGV4OCIsInJnYl9mb3JtYXRSZ2IiLCJpc05hTiIsImgiLCJzIiwiSHNsIiwiaHNsIiwibTIiLCJoc2wycmdiIiwiY2xhbXBoIiwiY2xhbXB0IiwibGluZWFyIiwiZXhwb25lbnRpYWwiLCJ5IiwiZ2FtbWEiLCJub2dhbW1hIiwicmdiR2FtbWEiLCJlbmQiLCJjb2xvclJnYiIsImlzTnVtYmVyQXJyYXkiLCJBcnJheUJ1ZmZlciIsImlzVmlldyIsIkRhdGFWaWV3IiwiZ2VuZXJpY0FycmF5IiwibmIiLCJuYSIsIkRhdGUiLCJzZXRUaW1lIiwicmVBIiwicmVCIiwic291cmNlIiwib25lIiwiYmkiLCJsYXN0SW5kZXgiLCJhbSIsImJtIiwiYnMiLCJxIiwiaW5kZXgiLCJkYXRlIiwibnVtYmVyQXJyYXkiLCJvYmplY3QiLCJkZWdyZWVzIiwiUEkiLCJpZGVudGl0eSIsInRyYW5zbGF0ZVgiLCJ0cmFuc2xhdGVZIiwicm90YXRlIiwic2tld1giLCJzY2FsZVgiLCJzY2FsZVkiLCJlIiwiYXRhbjIiLCJhdGFuIiwic3ZnTm9kZSIsInBhcnNlQ3NzIiwiRE9NTWF0cml4IiwiV2ViS2l0Q1NTTWF0cml4IiwiaXNJZGVudGl0eSIsImRlY29tcG9zZSIsInBhcnNlU3ZnIiwidHJhbnNmb3JtIiwiYmFzZVZhbCIsImNvbnNvbGlkYXRlIiwibWF0cml4IiwiaW50ZXJwb2xhdGVUcmFuc2Zvcm0iLCJwYXJzZSIsInB4Q29tbWEiLCJweFBhcmVuIiwiZGVnUGFyZW4iLCJwb3AiLCJ0cmFuc2xhdGUiLCJ4YSIsInlhIiwieGIiLCJ5YiIsInNjYWxlIiwiaW50ZXJwb2xhdGVUcmFuc2Zvcm1Dc3MiLCJpbnRlcnBvbGF0ZVRyYW5zZm9ybVN2ZyIsImZyYW1lIiwidGltZW91dCIsImludGVydmFsIiwicG9rZURlbGF5IiwidGFza0hlYWQiLCJ0YXNrVGFpbCIsImNsb2NrTGFzdCIsImNsb2NrTm93IiwiY2xvY2tTa2V3IiwiY2xvY2siLCJwZXJmb3JtYW5jZSIsIm5vdyIsInNldEZyYW1lIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwic2V0VGltZW91dCIsImNsZWFyTm93IiwiVGltZXIiLCJfY2FsbCIsIl90aW1lIiwidGltZXIiLCJyZXN0YXJ0IiwiZGVsYXkiLCJ0aW1lIiwiVHlwZUVycm9yIiwic2xlZXAiLCJJbmZpbml0eSIsInRpbWVyRmx1c2giLCJ1bmRlZmluZWQiLCJ3YWtlIiwibmFwIiwicG9rZSIsInQwIiwidDEiLCJ0MiIsImNsZWFyVGltZW91dCIsImNsZWFySW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImVsYXBzZWQiLCJlbXB0eU9uIiwiZW1wdHlUd2VlbiIsIkNSRUFURUQiLCJTQ0hFRFVMRUQiLCJTVEFSVElORyIsIlNUQVJURUQiLCJSVU5OSU5HIiwiRU5ESU5HIiwiRU5ERUQiLCJpZCIsInRpbWluZyIsInNjaGVkdWxlcyIsIl9fdHJhbnNpdGlvbiIsInR3ZWVuIiwiZHVyYXRpb24iLCJlYXNlIiwic3RhdGUiLCJpbml0Iiwic2NoZWR1bGUiLCJzZWxmIiwidGljayIsImFjdGl2ZSIsImludGVycnVwdCIsInR3ZWVuUmVtb3ZlIiwidHdlZW4wIiwidHdlZW4xIiwidHdlZW5GdW5jdGlvbiIsIl9pZCIsInR3ZWVuVmFsdWUiLCJ0cmFuc2l0aW9uIiwiaW50ZXJwb2xhdGVOdW1iZXIiLCJpbnRlcnBvbGF0ZVJnYiIsImludGVycG9sYXRlU3RyaW5nIiwiaW50ZXJwb2xhdGUiLCJ2YWx1ZTEiLCJzdHJpbmcwMCIsInN0cmluZzEiLCJpbnRlcnBvbGF0ZTAiLCJzdHJpbmcwIiwic3RyaW5nMTAiLCJhdHRyVHdlZW4iLCJhdHRySW50ZXJwb2xhdGUiLCJhdHRySW50ZXJwb2xhdGVOUyIsImF0dHJUd2Vlbk5TIiwiX3ZhbHVlIiwiZGVsYXlGdW5jdGlvbiIsImRlbGF5Q29uc3RhbnQiLCJkdXJhdGlvbkZ1bmN0aW9uIiwiZHVyYXRpb25Db25zdGFudCIsImVhc2VDb25zdGFudCIsImVhc2VWYXJ5aW5nIiwiVHJhbnNpdGlvbiIsIl9uYW1lIiwiZXZlcnkiLCJvbkZ1bmN0aW9uIiwib24wIiwib24xIiwic2l0IiwicmVtb3ZlRnVuY3Rpb24iLCJpbmhlcml0Iiwic3R5bGVOdWxsIiwic3R5bGVNYXliZVJlbW92ZSIsImxpc3RlbmVyMCIsInN0eWxlVHdlZW4iLCJzdHlsZUludGVycG9sYXRlIiwidGV4dEludGVycG9sYXRlIiwidGV4dFR3ZWVuIiwiaWQwIiwiaWQxIiwibmV3SWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImNhbmNlbCIsInNlbGVjdGlvbl9wcm90b3R5cGUiLCJ0cmFuc2l0aW9uX3NlbGVjdCIsInRyYW5zaXRpb25fc2VsZWN0QWxsIiwidHJhbnNpdGlvbl9maWx0ZXIiLCJ0cmFuc2l0aW9uX21lcmdlIiwidHJhbnNpdGlvbl9zZWxlY3Rpb24iLCJ0cmFuc2l0aW9uX3RyYW5zaXRpb24iLCJ0cmFuc2l0aW9uX29uIiwidHJhbnNpdGlvbl9hdHRyIiwidHJhbnNpdGlvbl9hdHRyVHdlZW4iLCJ0cmFuc2l0aW9uX3N0eWxlIiwidHJhbnNpdGlvbl9zdHlsZVR3ZWVuIiwidHJhbnNpdGlvbl90ZXh0IiwidHJhbnNpdGlvbl90ZXh0VHdlZW4iLCJ0cmFuc2l0aW9uX3JlbW92ZSIsInRyYW5zaXRpb25fdHdlZW4iLCJ0cmFuc2l0aW9uX2RlbGF5IiwidHJhbnNpdGlvbl9kdXJhdGlvbiIsInRyYW5zaXRpb25fZWFzZSIsInRyYW5zaXRpb25fZWFzZVZhcnlpbmciLCJ0cmFuc2l0aW9uX2VuZCIsImN1YmljSW5PdXQiLCJkZWZhdWx0VGltaW5nIiwiZWFzZUN1YmljSW5PdXQiLCJzZWxlY3Rpb25faW50ZXJydXB0Iiwic2VsZWN0aW9uX3RyYW5zaXRpb24iLCJpbml0UmFuZ2UiLCJkb21haW4iLCJpbXBsaWNpdCIsIm9yZGluYWwiLCJ1bmtub3duIiwiYmFuZCIsIm9yZGluYWxSYW5nZSIsInIwIiwicjEiLCJiYW5kd2lkdGgiLCJwYWRkaW5nSW5uZXIiLCJwYWRkaW5nT3V0ZXIiLCJhbGlnbiIsInJlc2NhbGUiLCJ2YWx1ZXMiLCJzZXF1ZW5jZSIsInJhbmdlUm91bmQiLCJwYWRkaW5nIiwiY29uc3RhbnRzIiwidW5pdCIsIm5vcm1hbGl6ZSIsImNsYW1wZXIiLCJiaW1hcCIsImQwIiwiZDEiLCJwb2x5bWFwIiwiYmlzZWN0IiwidGFyZ2V0IiwidHJhbnNmb3JtZXIiLCJpbnRlcnBvbGF0ZVZhbHVlIiwidW50cmFuc2Zvcm0iLCJwaWVjZXdpc2UiLCJvdXRwdXQiLCJpbnB1dCIsImludmVydCIsImludGVycG9sYXRlUm91bmQiLCJ1IiwiY29udGludW91cyIsIm5pY2UiLCJ4MCIsIngxIiwidGltZUludGVydmFsIiwiZmxvb3JpIiwib2Zmc2V0aSIsImZpZWxkIiwib2Zmc2V0IiwiaXNGaW5pdGUiLCJtaWxsaXNlY29uZCIsImR1cmF0aW9uU2Vjb25kIiwiZHVyYXRpb25NaW51dGUiLCJkdXJhdGlvbkhvdXIiLCJkdXJhdGlvbkRheSIsImR1cmF0aW9uV2VlayIsImR1cmF0aW9uTW9udGgiLCJkdXJhdGlvblllYXIiLCJzZWNvbmQiLCJnZXRNaWxsaXNlY29uZHMiLCJnZXRVVENTZWNvbmRzIiwidGltZU1pbnV0ZSIsImdldFNlY29uZHMiLCJnZXRNaW51dGVzIiwidXRjTWludXRlIiwic2V0VVRDU2Vjb25kcyIsImdldFVUQ01pbnV0ZXMiLCJ0aW1lSG91ciIsImdldEhvdXJzIiwidXRjSG91ciIsInNldFVUQ01pbnV0ZXMiLCJnZXRVVENIb3VycyIsInRpbWVEYXkiLCJzZXRIb3VycyIsInNldERhdGUiLCJnZXREYXRlIiwiZ2V0VGltZXpvbmVPZmZzZXQiLCJ1dGNEYXkiLCJzZXRVVENIb3VycyIsInNldFVUQ0RhdGUiLCJnZXRVVENEYXRlIiwidW5peERheSIsInRpbWVXZWVrZGF5IiwiZ2V0RGF5IiwidGltZVN1bmRheSIsInRpbWVNb25kYXkiLCJ0aW1lVHVlc2RheSIsInRpbWVXZWRuZXNkYXkiLCJ0aW1lVGh1cnNkYXkiLCJ0aW1lRnJpZGF5IiwidGltZVNhdHVyZGF5IiwidXRjV2Vla2RheSIsImdldFVUQ0RheSIsInV0Y1N1bmRheSIsInV0Y01vbmRheSIsInV0Y1R1ZXNkYXkiLCJ1dGNXZWRuZXNkYXkiLCJ1dGNUaHVyc2RheSIsInV0Y0ZyaWRheSIsInV0Y1NhdHVyZGF5IiwidGltZU1vbnRoIiwic2V0TW9udGgiLCJnZXRNb250aCIsImdldEZ1bGxZZWFyIiwidXRjTW9udGgiLCJzZXRVVENNb250aCIsImdldFVUQ01vbnRoIiwiZ2V0VVRDRnVsbFllYXIiLCJ0aW1lWWVhciIsInNldEZ1bGxZZWFyIiwidXRjWWVhciIsInNldFVUQ0Z1bGxZZWFyIiwidGlja2VyIiwieWVhciIsIm1vbnRoIiwid2VlayIsImRheSIsImhvdXIiLCJtaW51dGUiLCJ0aWNrSW50ZXJ2YWxzIiwidGlja3MiLCJ0aWNrSW50ZXJ2YWwiLCJhYnMiLCJ0aW1lVGlja3MiLCJ0aW1lVGlja0ludGVydmFsIiwibG9jYWxEYXRlIiwiSCIsIk0iLCJTIiwiTCIsInV0Y0RhdGUiLCJVVEMiLCJuZXdEYXRlIiwiZm9ybWF0TG9jYWxlIiwibG9jYWxlIiwibG9jYWxlX2RhdGVUaW1lIiwiZGF0ZVRpbWUiLCJsb2NhbGVfZGF0ZSIsImxvY2FsZV90aW1lIiwibG9jYWxlX3BlcmlvZHMiLCJwZXJpb2RzIiwibG9jYWxlX3dlZWtkYXlzIiwiZGF5cyIsImxvY2FsZV9zaG9ydFdlZWtkYXlzIiwic2hvcnREYXlzIiwibG9jYWxlX21vbnRocyIsIm1vbnRocyIsImxvY2FsZV9zaG9ydE1vbnRocyIsInNob3J0TW9udGhzIiwicGVyaW9kUmUiLCJmb3JtYXRSZSIsInBlcmlvZExvb2t1cCIsImZvcm1hdExvb2t1cCIsIndlZWtkYXlSZSIsIndlZWtkYXlMb29rdXAiLCJzaG9ydFdlZWtkYXlSZSIsInNob3J0V2Vla2RheUxvb2t1cCIsIm1vbnRoUmUiLCJtb250aExvb2t1cCIsInNob3J0TW9udGhSZSIsInNob3J0TW9udGhMb29rdXAiLCJmb3JtYXRzIiwiZm9ybWF0U2hvcnRXZWVrZGF5IiwiZm9ybWF0V2Vla2RheSIsImZvcm1hdFNob3J0TW9udGgiLCJmb3JtYXRNb250aCIsImZvcm1hdERheU9mTW9udGgiLCJmb3JtYXRNaWNyb3NlY29uZHMiLCJmb3JtYXRZZWFySVNPIiwiZm9ybWF0RnVsbFllYXJJU08iLCJmb3JtYXRIb3VyMjQiLCJmb3JtYXRIb3VyMTIiLCJmb3JtYXREYXlPZlllYXIiLCJmb3JtYXRNaWxsaXNlY29uZHMiLCJmb3JtYXRNb250aE51bWJlciIsImZvcm1hdE1pbnV0ZXMiLCJmb3JtYXRQZXJpb2QiLCJmb3JtYXRRdWFydGVyIiwiZm9ybWF0VW5peFRpbWVzdGFtcCIsImZvcm1hdFVuaXhUaW1lc3RhbXBTZWNvbmRzIiwiZm9ybWF0U2Vjb25kcyIsImZvcm1hdFdlZWtkYXlOdW1iZXJNb25kYXkiLCJmb3JtYXRXZWVrTnVtYmVyU3VuZGF5IiwiZm9ybWF0V2Vla051bWJlcklTTyIsImZvcm1hdFdlZWtkYXlOdW1iZXJTdW5kYXkiLCJmb3JtYXRXZWVrTnVtYmVyTW9uZGF5IiwiZm9ybWF0WWVhciIsImZvcm1hdEZ1bGxZZWFyIiwiZm9ybWF0Wm9uZSIsImZvcm1hdExpdGVyYWxQZXJjZW50IiwidXRjRm9ybWF0cyIsImZvcm1hdFVUQ1Nob3J0V2Vla2RheSIsImZvcm1hdFVUQ1dlZWtkYXkiLCJmb3JtYXRVVENTaG9ydE1vbnRoIiwiZm9ybWF0VVRDTW9udGgiLCJmb3JtYXRVVENEYXlPZk1vbnRoIiwiZm9ybWF0VVRDTWljcm9zZWNvbmRzIiwiZm9ybWF0VVRDWWVhcklTTyIsImZvcm1hdFVUQ0Z1bGxZZWFySVNPIiwiZm9ybWF0VVRDSG91cjI0IiwiZm9ybWF0VVRDSG91cjEyIiwiZm9ybWF0VVRDRGF5T2ZZZWFyIiwiZm9ybWF0VVRDTWlsbGlzZWNvbmRzIiwiZm9ybWF0VVRDTW9udGhOdW1iZXIiLCJmb3JtYXRVVENNaW51dGVzIiwiZm9ybWF0VVRDUGVyaW9kIiwiZm9ybWF0VVRDUXVhcnRlciIsImZvcm1hdFVUQ1NlY29uZHMiLCJmb3JtYXRVVENXZWVrZGF5TnVtYmVyTW9uZGF5IiwiZm9ybWF0VVRDV2Vla051bWJlclN1bmRheSIsImZvcm1hdFVUQ1dlZWtOdW1iZXJJU08iLCJmb3JtYXRVVENXZWVrZGF5TnVtYmVyU3VuZGF5IiwiZm9ybWF0VVRDV2Vla051bWJlck1vbmRheSIsImZvcm1hdFVUQ1llYXIiLCJmb3JtYXRVVENGdWxsWWVhciIsImZvcm1hdFVUQ1pvbmUiLCJwYXJzZXMiLCJwYXJzZVNob3J0V2Vla2RheSIsInBhcnNlV2Vla2RheSIsInBhcnNlU2hvcnRNb250aCIsInBhcnNlTW9udGgiLCJwYXJzZUxvY2FsZURhdGVUaW1lIiwicGFyc2VEYXlPZk1vbnRoIiwicGFyc2VNaWNyb3NlY29uZHMiLCJwYXJzZVllYXIiLCJwYXJzZUZ1bGxZZWFyIiwicGFyc2VIb3VyMjQiLCJwYXJzZURheU9mWWVhciIsInBhcnNlTWlsbGlzZWNvbmRzIiwicGFyc2VNb250aE51bWJlciIsInBhcnNlTWludXRlcyIsInBhcnNlUGVyaW9kIiwicGFyc2VRdWFydGVyIiwicGFyc2VVbml4VGltZXN0YW1wIiwicGFyc2VVbml4VGltZXN0YW1wU2Vjb25kcyIsInBhcnNlU2Vjb25kcyIsInBhcnNlV2Vla2RheU51bWJlck1vbmRheSIsInBhcnNlV2Vla051bWJlclN1bmRheSIsInBhcnNlV2Vla051bWJlcklTTyIsInBhcnNlV2Vla2RheU51bWJlclN1bmRheSIsInBhcnNlV2Vla051bWJlck1vbmRheSIsInBhcnNlTG9jYWxlRGF0ZSIsInBhcnNlTG9jYWxlVGltZSIsInBhcnNlWm9uZSIsInBhcnNlTGl0ZXJhbFBlcmNlbnQiLCJuZXdGb3JtYXQiLCJYIiwic3BlY2lmaWVyIiwicGFkIiwiY2hhckNvZGVBdCIsInBhZHMiLCJjaGFyQXQiLCJuZXdQYXJzZSIsIloiLCJwYXJzZVNwZWNpZmllciIsIlEiLCJwIiwiViIsInciLCJXIiwiVSIsInV0Y0Zvcm1hdCIsInV0Y1BhcnNlIiwibnVtYmVyUmUiLCJwZXJjZW50UmUiLCJyZXF1b3RlUmUiLCJmaWxsIiwid2lkdGgiLCJzaWduIiwicmVxdW90ZSIsInJlcGxhY2UiLCJkSVNPIiwieiIsImdldFVUQ01pbGxpc2Vjb25kcyIsImRvdyIsIlVUQ2RJU08iLCJ0aW1lRm9ybWF0IiwiZGVmYXVsdExvY2FsZSIsImNhbGVuZGFyIiwiZm9ybWF0TWlsbGlzZWNvbmQiLCJmb3JtYXRTZWNvbmQiLCJmb3JtYXRNaW51dGUiLCJmb3JtYXRIb3VyIiwiZm9ybWF0RGF5IiwiZm9ybWF0V2VlayIsInRpY2tGb3JtYXQiLCJ0aW1lV2VlayIsInRpbWVTZWNvbmQiLCJUcmFuc2Zvcm0iLCJwb2ludCIsImFwcGx5WCIsImFwcGx5WSIsImxvY2F0aW9uIiwiaW52ZXJ0WCIsImludmVydFkiLCJyZXNjYWxlWCIsInJlc2NhbGVZIiwiZDMuc2VsZWN0IiwiZDMuc2NhbGVUaW1lIiwiZDMuc2NhbGVCYW5kIiwiZDMudGltZUZvcm1hdCJdLCJtYXBwaW5ncyI6Ijs7QUFBZSxTQUFTQSxXQUFTQSxDQUFDQyxDQUFDLEVBQUVDLENBQUMsRUFBRTtBQUN0QyxFQUFBLE9BQU9ELENBQUMsSUFBSSxJQUFJLElBQUlDLENBQUMsSUFBSSxJQUFJLEdBQUdDLEdBQUcsR0FBR0YsQ0FBQyxHQUFHQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUdELENBQUMsR0FBR0MsQ0FBQyxHQUFHLENBQUMsR0FBR0QsQ0FBQyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxHQUFHQyxH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QUFBLGFBQUEsQ0FBQSxLQUFBLEVBQUEsRUFBSyxHQUFHLEVBQUUsUUFBUSxFQUFFLEVBQUUsRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFFLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxHQUFRLENBQzdELENBQ0osRUFDUjtBQUNOOzs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyLDMzLDM0LDM1LDM2LDM3LDM4LDM5LDQwLDQxLDQyLDQzLDQ0LDQ1LDQ2LDQ3LDQ4LDQ5LDUwLDUxLDUyLDUzLDU0LDU1LDU2LDU3LDU4LDU5LDYwLDYxLDYyLDYzLDY0LDY1LDY2LDY3LDY4LDY5LDcwLDcxLDcyLDczLDc0LDc1LDc2LDc3LDc4LDc5LDgwLDgxLDgyLDgzLDg0LDg1LDg2LDg3LDg4LDg5LDkwLDkxLDkyLDkzLDk0LDk1LDk2LDk3LDk4LDk5LDEwMCwxMDEsMTAyLDEwMywxMDQsMTA1LDEwNiwxMDcsMTA4LDEwOSwxMTAsMTExLDExMiwxMTMsMTE0LDExNSwxMTYsMTE3LDExOCwxMTksMTIwLDEyMSwxMjJdfQ==
