define(['exports', 'react'], (function (exports, react) { 'use strict';

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
      const chartRef = react.useRef(null);
      react.useEffect(() => {
          if (!chartRef.current)
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
          // Chart dimensions
          const margin = { top: 80, right: 150, bottom: 40, left: 180 };
          const width = 1200 - margin.left - margin.right;
          const height = 600 - margin.top - margin.bottom;
          // Create SVG
          const svg = select(chartRef.current)
              .append("svg")
              .attr("width", width + margin.left + margin.right)
              .attr("height", height + margin.top + margin.bottom)
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
          // Draw industry rows
          industries.forEach((industry) => {
              const y = yScale(industry.name) + yScale.bandwidth() / 2;
              // Industry name
              svg.append("text")
                  .attr("class", "industry-text")
                  .attr("x", -10)
                  .attr("y", y + 5)
                  .attr("text-anchor", "end")
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
              // Upcoming box
              let boxX = upcomingXPos;
              if (industry.upcoming !== "TBD") {
                  const year = parseInt("20" + industry.upcoming.substring(0, 2));
                  const month = parseInt(industry.upcoming.substring(2, 4)) - 1;
                  const upcomingDate = new Date(year, month, 1);
                  if (upcomingDate <= timeScale.domain()[1]) {
                      boxX = timeScale(upcomingDate) - 30;
                  }
                  else {
                      boxX = width + 20;
                  }
              }
              else {
                  boxX = width + 20;
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
                  .text(industry.upcoming);
          });
      }, []);
      return (react.createElement("div", { className: `catalog-release-chart ${name}` },
          react.createElement("div", { className: "chart-container" },
              react.createElement("h1", { className: "chart-title" }, "Catalog Release Schedule"),
              react.createElement("div", { className: "legend" },
                  react.createElement("div", { className: "legend-item" },
                      react.createElement("svg", { className: "legend-symbol", viewBox: "0 0 20 20" },
                          react.createElement("rect", { x: "2", y: "2", width: "16", height: "16", rx: "50%", className: "retired-marker" })),
                      react.createElement("span", null, "Retired Catalog")),
                  react.createElement("div", { className: "legend-item" },
                      react.createElement("svg", { className: "legend-symbol", viewBox: "0 0 20 20" },
                          react.createElement("rect", { x: "2", y: "2", width: "16", height: "16", rx: "50%", className: "current-marker" })),
                      react.createElement("span", null, "Current Catalog")),
                  react.createElement("div", { className: "legend-item" },
                      react.createElement("svg", { className: "legend-symbol", viewBox: "0 0 20 20" },
                          react.createElement("rect", { x: "2", y: "2", width: "16", height: "16", rx: "2", className: "upcoming-box" })),
                      react.createElement("span", null, "Upcoming Catalog")),
                  react.createElement("div", { className: "legend-item" },
                      react.createElement("svg", { className: "legend-symbol", viewBox: "0 0 20 20" },
                          react.createElement("circle", { cx: "10", cy: "10", r: "5", className: "today-circle" })),
                      react.createElement("span", null, "Today's Date"))),
              react.createElement("div", { ref: chartRef, id: "chart" }))));
  }

  exports.CatalogReleaseChart = CatalogReleaseChart;

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2F0YWxvZ1JlbGVhc2VDaGFydC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9hc2NlbmRpbmcuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2Rlc2NlbmRpbmcuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2Jpc2VjdG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9udW1iZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2Jpc2VjdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9pbnRlcm5tYXAvc3JjL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy90aWNrcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvcmFuZ2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtZGlzcGF0Y2gvc3JjL2Rpc3BhdGNoLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvbmFtZXNwYWNlcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL25hbWVzcGFjZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NyZWF0b3IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rvci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3QuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9hcnJheS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdG9yQWxsLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdEFsbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL21hdGNoZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0Q2hpbGQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0Q2hpbGRyZW4uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZmlsdGVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NwYXJzZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9lbnRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NvbnN0YW50LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2RhdGEuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZXhpdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9qb2luLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL21lcmdlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL29yZGVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NvcnQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vY2FsbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9ub2Rlcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9ub2RlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NpemUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZW1wdHkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZWFjaC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hdHRyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvd2luZG93LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3N0eWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3Byb3BlcnR5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2NsYXNzZWQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vdGV4dC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9odG1sLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3JhaXNlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2xvd2VyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2FwcGVuZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pbnNlcnQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vcmVtb3ZlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Nsb25lLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2RhdHVtLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL29uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Rpc3BhdGNoLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2l0ZXJhdG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9kZWZpbmUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtY29sb3Ivc3JjL2NvbG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9jb25zdGFudC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvY29sb3IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3JnYi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvbnVtYmVyQXJyYXkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2FycmF5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9kYXRlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9udW1iZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL29iamVjdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvc3RyaW5nLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy92YWx1ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvcm91bmQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9kZWNvbXBvc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9wYXJzZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWVyL3NyYy90aW1lci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZW91dC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NjaGVkdWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL2ludGVycnVwdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9zZWxlY3Rpb24vaW50ZXJydXB0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHdlZW4uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9pbnRlcnBvbGF0ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2F0dHIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9hdHRyVHdlZW4uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9kZWxheS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2R1cmF0aW9uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZWFzZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2Vhc2VWYXJ5aW5nLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZmlsdGVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vbWVyZ2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9vbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3JlbW92ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdEFsbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdGlvbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vc3R5bGVUd2Vlbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3RleHQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi90ZXh0VHdlZW4uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi90cmFuc2l0aW9uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZW5kLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtZWFzZS9zcmMvY3ViaWMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL3RyYW5zaXRpb24uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9pbml0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9vcmRpbmFsLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9iYW5kLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9jb25zdGFudC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvbnVtYmVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9jb250aW51b3VzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9uaWNlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL2ludGVydmFsLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL21pbGxpc2Vjb25kLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL2R1cmF0aW9uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL3NlY29uZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9taW51dGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvaG91ci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9kYXkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvd2Vlay5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9tb250aC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy95ZWFyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL3RpY2tzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUtZm9ybWF0L3NyYy9sb2NhbGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS1mb3JtYXQvc3JjL2RlZmF1bHRMb2NhbGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL3RpbWUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtem9vbS9zcmMvdHJhbnNmb3JtLmpzIiwiLi4vLi4vLi4vLi4vLi4vc3JjL0NhdGFsb2dSZWxlYXNlQ2hhcnQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhID09IG51bGwgfHwgYiA9PSBudWxsID8gTmFOIDogYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IGEgPj0gYiA/IDAgOiBOYU47XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZXNjZW5kaW5nKGEsIGIpIHtcbiAgcmV0dXJuIGEgPT0gbnVsbCB8fCBiID09IG51bGwgPyBOYU5cbiAgICA6IGIgPCBhID8gLTFcbiAgICA6IGIgPiBhID8gMVxuICAgIDogYiA+PSBhID8gMFxuICAgIDogTmFOO1xufVxuIiwiaW1wb3J0IGFzY2VuZGluZyBmcm9tIFwiLi9hc2NlbmRpbmcuanNcIjtcbmltcG9ydCBkZXNjZW5kaW5nIGZyb20gXCIuL2Rlc2NlbmRpbmcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYmlzZWN0b3IoZikge1xuICBsZXQgY29tcGFyZTEsIGNvbXBhcmUyLCBkZWx0YTtcblxuICAvLyBJZiBhbiBhY2Nlc3NvciBpcyBzcGVjaWZpZWQsIHByb21vdGUgaXQgdG8gYSBjb21wYXJhdG9yLiBJbiB0aGlzIGNhc2Ugd2VcbiAgLy8gY2FuIHRlc3Qgd2hldGhlciB0aGUgc2VhcmNoIHZhbHVlIGlzIChzZWxmLSkgY29tcGFyYWJsZS4gV2UgY2Fu4oCZdCBkbyB0aGlzXG4gIC8vIGZvciBhIGNvbXBhcmF0b3IgKGV4Y2VwdCBmb3Igc3BlY2lmaWMsIGtub3duIGNvbXBhcmF0b3JzKSBiZWNhdXNlIHdlIGNhbuKAmXRcbiAgLy8gdGVsbCBpZiB0aGUgY29tcGFyYXRvciBpcyBzeW1tZXRyaWMsIGFuZCBhbiBhc3ltbWV0cmljIGNvbXBhcmF0b3IgY2Fu4oCZdCBiZVxuICAvLyB1c2VkIHRvIHRlc3Qgd2hldGhlciBhIHNpbmdsZSB2YWx1ZSBpcyBjb21wYXJhYmxlLlxuICBpZiAoZi5sZW5ndGggIT09IDIpIHtcbiAgICBjb21wYXJlMSA9IGFzY2VuZGluZztcbiAgICBjb21wYXJlMiA9IChkLCB4KSA9PiBhc2NlbmRpbmcoZihkKSwgeCk7XG4gICAgZGVsdGEgPSAoZCwgeCkgPT4gZihkKSAtIHg7XG4gIH0gZWxzZSB7XG4gICAgY29tcGFyZTEgPSBmID09PSBhc2NlbmRpbmcgfHwgZiA9PT0gZGVzY2VuZGluZyA/IGYgOiB6ZXJvO1xuICAgIGNvbXBhcmUyID0gZjtcbiAgICBkZWx0YSA9IGY7XG4gIH1cblxuICBmdW5jdGlvbiBsZWZ0KGEsIHgsIGxvID0gMCwgaGkgPSBhLmxlbmd0aCkge1xuICAgIGlmIChsbyA8IGhpKSB7XG4gICAgICBpZiAoY29tcGFyZTEoeCwgeCkgIT09IDApIHJldHVybiBoaTtcbiAgICAgIGRvIHtcbiAgICAgICAgY29uc3QgbWlkID0gKGxvICsgaGkpID4+PiAxO1xuICAgICAgICBpZiAoY29tcGFyZTIoYVttaWRdLCB4KSA8IDApIGxvID0gbWlkICsgMTtcbiAgICAgICAgZWxzZSBoaSA9IG1pZDtcbiAgICAgIH0gd2hpbGUgKGxvIDwgaGkpO1xuICAgIH1cbiAgICByZXR1cm4gbG87XG4gIH1cblxuICBmdW5jdGlvbiByaWdodChhLCB4LCBsbyA9IDAsIGhpID0gYS5sZW5ndGgpIHtcbiAgICBpZiAobG8gPCBoaSkge1xuICAgICAgaWYgKGNvbXBhcmUxKHgsIHgpICE9PSAwKSByZXR1cm4gaGk7XG4gICAgICBkbyB7XG4gICAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgICAgaWYgKGNvbXBhcmUyKGFbbWlkXSwgeCkgPD0gMCkgbG8gPSBtaWQgKyAxO1xuICAgICAgICBlbHNlIGhpID0gbWlkO1xuICAgICAgfSB3aGlsZSAobG8gPCBoaSk7XG4gICAgfVxuICAgIHJldHVybiBsbztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNlbnRlcihhLCB4LCBsbyA9IDAsIGhpID0gYS5sZW5ndGgpIHtcbiAgICBjb25zdCBpID0gbGVmdChhLCB4LCBsbywgaGkgLSAxKTtcbiAgICByZXR1cm4gaSA+IGxvICYmIGRlbHRhKGFbaSAtIDFdLCB4KSA+IC1kZWx0YShhW2ldLCB4KSA/IGkgLSAxIDogaTtcbiAgfVxuXG4gIHJldHVybiB7bGVmdCwgY2VudGVyLCByaWdodH07XG59XG5cbmZ1bmN0aW9uIHplcm8oKSB7XG4gIHJldHVybiAwO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbnVtYmVyKHgpIHtcbiAgcmV0dXJuIHggPT09IG51bGwgPyBOYU4gOiAreDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uKiBudW1iZXJzKHZhbHVlcywgdmFsdWVvZikge1xuICBpZiAodmFsdWVvZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAodmFsdWUgIT0gbnVsbCAmJiAodmFsdWUgPSArdmFsdWUpID49IHZhbHVlKSB7XG4gICAgICAgIHlpZWxkIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICgodmFsdWUgPSB2YWx1ZW9mKHZhbHVlLCArK2luZGV4LCB2YWx1ZXMpKSAhPSBudWxsICYmICh2YWx1ZSA9ICt2YWx1ZSkgPj0gdmFsdWUpIHtcbiAgICAgICAgeWllbGQgdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgYXNjZW5kaW5nIGZyb20gXCIuL2FzY2VuZGluZy5qc1wiO1xuaW1wb3J0IGJpc2VjdG9yIGZyb20gXCIuL2Jpc2VjdG9yLmpzXCI7XG5pbXBvcnQgbnVtYmVyIGZyb20gXCIuL251bWJlci5qc1wiO1xuXG5jb25zdCBhc2NlbmRpbmdCaXNlY3QgPSBiaXNlY3Rvcihhc2NlbmRpbmcpO1xuZXhwb3J0IGNvbnN0IGJpc2VjdFJpZ2h0ID0gYXNjZW5kaW5nQmlzZWN0LnJpZ2h0O1xuZXhwb3J0IGNvbnN0IGJpc2VjdExlZnQgPSBhc2NlbmRpbmdCaXNlY3QubGVmdDtcbmV4cG9ydCBjb25zdCBiaXNlY3RDZW50ZXIgPSBiaXNlY3RvcihudW1iZXIpLmNlbnRlcjtcbmV4cG9ydCBkZWZhdWx0IGJpc2VjdFJpZ2h0O1xuIiwiZXhwb3J0IGNsYXNzIEludGVybk1hcCBleHRlbmRzIE1hcCB7XG4gIGNvbnN0cnVjdG9yKGVudHJpZXMsIGtleSA9IGtleW9mKSB7XG4gICAgc3VwZXIoKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7X2ludGVybjoge3ZhbHVlOiBuZXcgTWFwKCl9LCBfa2V5OiB7dmFsdWU6IGtleX19KTtcbiAgICBpZiAoZW50cmllcyAhPSBudWxsKSBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBlbnRyaWVzKSB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgfVxuICBnZXQoa2V5KSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldChpbnRlcm5fZ2V0KHRoaXMsIGtleSkpO1xuICB9XG4gIGhhcyhrZXkpIHtcbiAgICByZXR1cm4gc3VwZXIuaGFzKGludGVybl9nZXQodGhpcywga2V5KSk7XG4gIH1cbiAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gc3VwZXIuc2V0KGludGVybl9zZXQodGhpcywga2V5KSwgdmFsdWUpO1xuICB9XG4gIGRlbGV0ZShrZXkpIHtcbiAgICByZXR1cm4gc3VwZXIuZGVsZXRlKGludGVybl9kZWxldGUodGhpcywga2V5KSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEludGVyblNldCBleHRlbmRzIFNldCB7XG4gIGNvbnN0cnVjdG9yKHZhbHVlcywga2V5ID0ga2V5b2YpIHtcbiAgICBzdXBlcigpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtfaW50ZXJuOiB7dmFsdWU6IG5ldyBNYXAoKX0sIF9rZXk6IHt2YWx1ZToga2V5fX0pO1xuICAgIGlmICh2YWx1ZXMgIT0gbnVsbCkgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHRoaXMuYWRkKHZhbHVlKTtcbiAgfVxuICBoYXModmFsdWUpIHtcbiAgICByZXR1cm4gc3VwZXIuaGFzKGludGVybl9nZXQodGhpcywgdmFsdWUpKTtcbiAgfVxuICBhZGQodmFsdWUpIHtcbiAgICByZXR1cm4gc3VwZXIuYWRkKGludGVybl9zZXQodGhpcywgdmFsdWUpKTtcbiAgfVxuICBkZWxldGUodmFsdWUpIHtcbiAgICByZXR1cm4gc3VwZXIuZGVsZXRlKGludGVybl9kZWxldGUodGhpcywgdmFsdWUpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnRlcm5fZ2V0KHtfaW50ZXJuLCBfa2V5fSwgdmFsdWUpIHtcbiAgY29uc3Qga2V5ID0gX2tleSh2YWx1ZSk7XG4gIHJldHVybiBfaW50ZXJuLmhhcyhrZXkpID8gX2ludGVybi5nZXQoa2V5KSA6IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBpbnRlcm5fc2V0KHtfaW50ZXJuLCBfa2V5fSwgdmFsdWUpIHtcbiAgY29uc3Qga2V5ID0gX2tleSh2YWx1ZSk7XG4gIGlmIChfaW50ZXJuLmhhcyhrZXkpKSByZXR1cm4gX2ludGVybi5nZXQoa2V5KTtcbiAgX2ludGVybi5zZXQoa2V5LCB2YWx1ZSk7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gaW50ZXJuX2RlbGV0ZSh7X2ludGVybiwgX2tleX0sIHZhbHVlKSB7XG4gIGNvbnN0IGtleSA9IF9rZXkodmFsdWUpO1xuICBpZiAoX2ludGVybi5oYXMoa2V5KSkge1xuICAgIHZhbHVlID0gX2ludGVybi5nZXQoa2V5KTtcbiAgICBfaW50ZXJuLmRlbGV0ZShrZXkpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24ga2V5b2YodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xufVxuIiwiY29uc3QgZTEwID0gTWF0aC5zcXJ0KDUwKSxcbiAgICBlNSA9IE1hdGguc3FydCgxMCksXG4gICAgZTIgPSBNYXRoLnNxcnQoMik7XG5cbmZ1bmN0aW9uIHRpY2tTcGVjKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBjb25zdCBzdGVwID0gKHN0b3AgLSBzdGFydCkgLyBNYXRoLm1heCgwLCBjb3VudCksXG4gICAgICBwb3dlciA9IE1hdGguZmxvb3IoTWF0aC5sb2cxMChzdGVwKSksXG4gICAgICBlcnJvciA9IHN0ZXAgLyBNYXRoLnBvdygxMCwgcG93ZXIpLFxuICAgICAgZmFjdG9yID0gZXJyb3IgPj0gZTEwID8gMTAgOiBlcnJvciA+PSBlNSA/IDUgOiBlcnJvciA+PSBlMiA/IDIgOiAxO1xuICBsZXQgaTEsIGkyLCBpbmM7XG4gIGlmIChwb3dlciA8IDApIHtcbiAgICBpbmMgPSBNYXRoLnBvdygxMCwgLXBvd2VyKSAvIGZhY3RvcjtcbiAgICBpMSA9IE1hdGgucm91bmQoc3RhcnQgKiBpbmMpO1xuICAgIGkyID0gTWF0aC5yb3VuZChzdG9wICogaW5jKTtcbiAgICBpZiAoaTEgLyBpbmMgPCBzdGFydCkgKytpMTtcbiAgICBpZiAoaTIgLyBpbmMgPiBzdG9wKSAtLWkyO1xuICAgIGluYyA9IC1pbmM7XG4gIH0gZWxzZSB7XG4gICAgaW5jID0gTWF0aC5wb3coMTAsIHBvd2VyKSAqIGZhY3RvcjtcbiAgICBpMSA9IE1hdGgucm91bmQoc3RhcnQgLyBpbmMpO1xuICAgIGkyID0gTWF0aC5yb3VuZChzdG9wIC8gaW5jKTtcbiAgICBpZiAoaTEgKiBpbmMgPCBzdGFydCkgKytpMTtcbiAgICBpZiAoaTIgKiBpbmMgPiBzdG9wKSAtLWkyO1xuICB9XG4gIGlmIChpMiA8IGkxICYmIDAuNSA8PSBjb3VudCAmJiBjb3VudCA8IDIpIHJldHVybiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQgKiAyKTtcbiAgcmV0dXJuIFtpMSwgaTIsIGluY107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRpY2tzKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgaWYgKCEoY291bnQgPiAwKSkgcmV0dXJuIFtdO1xuICBpZiAoc3RhcnQgPT09IHN0b3ApIHJldHVybiBbc3RhcnRdO1xuICBjb25zdCByZXZlcnNlID0gc3RvcCA8IHN0YXJ0LCBbaTEsIGkyLCBpbmNdID0gcmV2ZXJzZSA/IHRpY2tTcGVjKHN0b3AsIHN0YXJ0LCBjb3VudCkgOiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQpO1xuICBpZiAoIShpMiA+PSBpMSkpIHJldHVybiBbXTtcbiAgY29uc3QgbiA9IGkyIC0gaTEgKyAxLCB0aWNrcyA9IG5ldyBBcnJheShuKTtcbiAgaWYgKHJldmVyc2UpIHtcbiAgICBpZiAoaW5jIDwgMCkgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHRpY2tzW2ldID0gKGkyIC0gaSkgLyAtaW5jO1xuICAgIGVsc2UgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHRpY2tzW2ldID0gKGkyIC0gaSkgKiBpbmM7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGluYyA8IDApIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMSArIGkpIC8gLWluYztcbiAgICBlbHNlIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMSArIGkpICogaW5jO1xuICB9XG4gIHJldHVybiB0aWNrcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tJbmNyZW1lbnQoc3RhcnQsIHN0b3AsIGNvdW50KSB7XG4gIHN0b3AgPSArc3RvcCwgc3RhcnQgPSArc3RhcnQsIGNvdW50ID0gK2NvdW50O1xuICByZXR1cm4gdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50KVsyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tTdGVwKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydCwgaW5jID0gcmV2ZXJzZSA/IHRpY2tJbmNyZW1lbnQoc3RvcCwgc3RhcnQsIGNvdW50KSA6IHRpY2tJbmNyZW1lbnQoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgcmV0dXJuIChyZXZlcnNlID8gLTEgOiAxKSAqIChpbmMgPCAwID8gMSAvIC1pbmMgOiBpbmMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmFuZ2Uoc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgc3RhcnQgPSArc3RhcnQsIHN0b3AgPSArc3RvcCwgc3RlcCA9IChuID0gYXJndW1lbnRzLmxlbmd0aCkgPCAyID8gKHN0b3AgPSBzdGFydCwgc3RhcnQgPSAwLCAxKSA6IG4gPCAzID8gMSA6ICtzdGVwO1xuXG4gIHZhciBpID0gLTEsXG4gICAgICBuID0gTWF0aC5tYXgoMCwgTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCkpIHwgMCxcbiAgICAgIHJhbmdlID0gbmV3IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgcmFuZ2VbaV0gPSBzdGFydCArIGkgKiBzdGVwO1xuICB9XG5cbiAgcmV0dXJuIHJhbmdlO1xufVxuIiwidmFyIG5vb3AgPSB7dmFsdWU6ICgpID0+IHt9fTtcblxuZnVuY3Rpb24gZGlzcGF0Y2goKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gYXJndW1lbnRzLmxlbmd0aCwgXyA9IHt9LCB0OyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKCEodCA9IGFyZ3VtZW50c1tpXSArIFwiXCIpIHx8ICh0IGluIF8pIHx8IC9bXFxzLl0vLnRlc3QodCkpIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgdHlwZTogXCIgKyB0KTtcbiAgICBfW3RdID0gW107XG4gIH1cbiAgcmV0dXJuIG5ldyBEaXNwYXRjaChfKTtcbn1cblxuZnVuY3Rpb24gRGlzcGF0Y2goXykge1xuICB0aGlzLl8gPSBfO1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMsIHR5cGVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICBpZiAodCAmJiAhdHlwZXMuaGFzT3duUHJvcGVydHkodCkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0KTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuRGlzcGF0Y2gucHJvdG90eXBlID0gZGlzcGF0Y2gucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRGlzcGF0Y2gsXG4gIG9uOiBmdW5jdGlvbih0eXBlbmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgXyA9IHRoaXMuXyxcbiAgICAgICAgVCA9IHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lICsgXCJcIiwgXyksXG4gICAgICAgIHQsXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IFQubGVuZ3RoO1xuXG4gICAgLy8gSWYgbm8gY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmV0dXJuIHRoZSBjYWxsYmFjayBvZiB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSAmJiAodCA9IGdldChfW3RdLCB0eXBlbmFtZS5uYW1lKSkpIHJldHVybiB0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIGEgdHlwZSB3YXMgc3BlY2lmaWVkLCBzZXQgdGhlIGNhbGxiYWNrIGZvciB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICAvLyBPdGhlcndpc2UsIGlmIGEgbnVsbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZW1vdmUgY2FsbGJhY2tzIG9mIHRoZSBnaXZlbiBuYW1lLlxuICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIGVsc2UgaWYgKGNhbGxiYWNrID09IG51bGwpIGZvciAodCBpbiBfKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBjb3B5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29weSA9IHt9LCBfID0gdGhpcy5fO1xuICAgIGZvciAodmFyIHQgaW4gXykgY29weVt0XSA9IF9bdF0uc2xpY2UoKTtcbiAgICByZXR1cm4gbmV3IERpc3BhdGNoKGNvcHkpO1xuICB9LFxuICBjYWxsOiBmdW5jdGlvbih0eXBlLCB0aGF0KSB7XG4gICAgaWYgKChuID0gYXJndW1lbnRzLmxlbmd0aCAtIDIpID4gMCkgZm9yICh2YXIgYXJncyA9IG5ldyBBcnJheShuKSwgaSA9IDAsIG4sIHQ7IGkgPCBuOyArK2kpIGFyZ3NbaV0gPSBhcmd1bWVudHNbaSArIDJdO1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9LFxuICBhcHBseTogZnVuY3Rpb24odHlwZSwgdGhhdCwgYXJncykge1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh2YXIgdCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0KHR5cGUsIG5hbWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aCwgYzsgaSA8IG47ICsraSkge1xuICAgIGlmICgoYyA9IHR5cGVbaV0pLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzZXQodHlwZSwgbmFtZSwgY2FsbGJhY2spIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIGlmICh0eXBlW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHR5cGVbaV0gPSBub29wLCB0eXBlID0gdHlwZS5zbGljZSgwLCBpKS5jb25jYXQodHlwZS5zbGljZShpICsgMSkpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB0eXBlLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiBjYWxsYmFja30pO1xuICByZXR1cm4gdHlwZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGlzcGF0Y2g7XG4iLCJleHBvcnQgdmFyIHhodG1sID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3ZnOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXG4gIHhodG1sOiB4aHRtbCxcbiAgeGxpbms6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLFxuICB4bWw6IFwiaHR0cDovL3d3dy53My5vcmcvWE1MLzE5OTgvbmFtZXNwYWNlXCIsXG4gIHhtbG5zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvXCJcbn07XG4iLCJpbXBvcnQgbmFtZXNwYWNlcyBmcm9tIFwiLi9uYW1lc3BhY2VzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIHByZWZpeCA9IG5hbWUgKz0gXCJcIiwgaSA9IHByZWZpeC5pbmRleE9mKFwiOlwiKTtcbiAgaWYgKGkgPj0gMCAmJiAocHJlZml4ID0gbmFtZS5zbGljZSgwLCBpKSkgIT09IFwieG1sbnNcIikgbmFtZSA9IG5hbWUuc2xpY2UoaSArIDEpO1xuICByZXR1cm4gbmFtZXNwYWNlcy5oYXNPd25Qcm9wZXJ0eShwcmVmaXgpID8ge3NwYWNlOiBuYW1lc3BhY2VzW3ByZWZpeF0sIGxvY2FsOiBuYW1lfSA6IG5hbWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG59XG4iLCJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuL25hbWVzcGFjZS5qc1wiO1xuaW1wb3J0IHt4aHRtbH0gZnJvbSBcIi4vbmFtZXNwYWNlcy5qc1wiO1xuXG5mdW5jdGlvbiBjcmVhdG9ySW5oZXJpdChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZG9jdW1lbnQgPSB0aGlzLm93bmVyRG9jdW1lbnQsXG4gICAgICAgIHVyaSA9IHRoaXMubmFtZXNwYWNlVVJJO1xuICAgIHJldHVybiB1cmkgPT09IHhodG1sICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5uYW1lc3BhY2VVUkkgPT09IHhodG1sXG4gICAgICAgID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKVxuICAgICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh1cmksIG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdG9yRml4ZWQoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuICByZXR1cm4gKGZ1bGxuYW1lLmxvY2FsXG4gICAgICA/IGNyZWF0b3JGaXhlZFxuICAgICAgOiBjcmVhdG9ySW5oZXJpdCkoZnVsbG5hbWUpO1xufVxuIiwiZnVuY3Rpb24gbm9uZSgpIHt9XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBzZWxlY3RvciA9PSBudWxsID8gbm9uZSA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICB9O1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2VsZWN0b3IgZnJvbSBcIi4uL3NlbGVjdG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvcihzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIHN1Ym5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKHN1Ym5vZGUgPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpKSB7XG4gICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIHN1Ymdyb3VwW2ldID0gc3Vibm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiLy8gR2l2ZW4gc29tZXRoaW5nIGFycmF5IGxpa2UgKG9yIG51bGwpLCByZXR1cm5zIHNvbWV0aGluZyB0aGF0IGlzIHN0cmljdGx5IGFuXG4vLyBhcnJheS4gVGhpcyBpcyB1c2VkIHRvIGVuc3VyZSB0aGF0IGFycmF5LWxpa2Ugb2JqZWN0cyBwYXNzZWQgdG8gZDMuc2VsZWN0QWxsXG4vLyBvciBzZWxlY3Rpb24uc2VsZWN0QWxsIGFyZSBjb252ZXJ0ZWQgaW50byBwcm9wZXIgYXJyYXlzIHdoZW4gY3JlYXRpbmcgYVxuLy8gc2VsZWN0aW9uOyB3ZSBkb27igJl0IGV2ZXIgd2FudCB0byBjcmVhdGUgYSBzZWxlY3Rpb24gYmFja2VkIGJ5IGEgbGl2ZVxuLy8gSFRNTENvbGxlY3Rpb24gb3IgTm9kZUxpc3QuIEhvd2V2ZXIsIG5vdGUgdGhhdCBzZWxlY3Rpb24uc2VsZWN0QWxsIHdpbGwgdXNlIGFcbi8vIHN0YXRpYyBOb2RlTGlzdCBhcyBhIGdyb3VwLCBzaW5jZSBpdCBzYWZlbHkgZGVyaXZlZCBmcm9tIHF1ZXJ5U2VsZWN0b3JBbGwuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhcnJheSh4KSB7XG4gIHJldHVybiB4ID09IG51bGwgPyBbXSA6IEFycmF5LmlzQXJyYXkoeCkgPyB4IDogQXJyYXkuZnJvbSh4KTtcbn1cbiIsImZ1bmN0aW9uIGVtcHR5KCkge1xuICByZXR1cm4gW107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBzZWxlY3RvciA9PSBudWxsID8gZW1wdHkgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgfTtcbn1cbiIsImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IGFycmF5IGZyb20gXCIuLi9hcnJheS5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yQWxsIGZyb20gXCIuLi9zZWxlY3RvckFsbC5qc1wiO1xuXG5mdW5jdGlvbiBhcnJheUFsbChzZWxlY3QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhcnJheShzZWxlY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICBpZiAodHlwZW9mIHNlbGVjdCA9PT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBhcnJheUFsbChzZWxlY3QpO1xuICBlbHNlIHNlbGVjdCA9IHNlbGVjdG9yQWxsKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gW10sIHBhcmVudHMgPSBbXSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc3ViZ3JvdXBzLnB1c2goc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKTtcbiAgICAgICAgcGFyZW50cy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHN1Ymdyb3VwcywgcGFyZW50cyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2hlcyhzZWxlY3Rvcik7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGlsZE1hdGNoZXIoc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgfTtcbn1cblxuIiwiaW1wb3J0IHtjaGlsZE1hdGNoZXJ9IGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbnZhciBmaW5kID0gQXJyYXkucHJvdG90eXBlLmZpbmQ7XG5cbmZ1bmN0aW9uIGNoaWxkRmluZChtYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZpbmQuY2FsbCh0aGlzLmNoaWxkcmVuLCBtYXRjaCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNoaWxkRmlyc3QoKSB7XG4gIHJldHVybiB0aGlzLmZpcnN0RWxlbWVudENoaWxkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3QobWF0Y2ggPT0gbnVsbCA/IGNoaWxkRmlyc3RcbiAgICAgIDogY2hpbGRGaW5kKHR5cGVvZiBtYXRjaCA9PT0gXCJmdW5jdGlvblwiID8gbWF0Y2ggOiBjaGlsZE1hdGNoZXIobWF0Y2gpKSk7XG59XG4iLCJpbXBvcnQge2NoaWxkTWF0Y2hlcn0gZnJvbSBcIi4uL21hdGNoZXIuanNcIjtcblxudmFyIGZpbHRlciA9IEFycmF5LnByb3RvdHlwZS5maWx0ZXI7XG5cbmZ1bmN0aW9uIGNoaWxkcmVuKCkge1xuICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNoaWxkcmVuKTtcbn1cblxuZnVuY3Rpb24gY2hpbGRyZW5GaWx0ZXIobWF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmaWx0ZXIuY2FsbCh0aGlzLmNoaWxkcmVuLCBtYXRjaCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdEFsbChtYXRjaCA9PSBudWxsID8gY2hpbGRyZW5cbiAgICAgIDogY2hpbGRyZW5GaWx0ZXIodHlwZW9mIG1hdGNoID09PSBcImZ1bmN0aW9uXCIgPyBtYXRjaCA6IGNoaWxkTWF0Y2hlcihtYXRjaCkpKTtcbn1cbiIsImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IG1hdGNoZXIgZnJvbSBcIi4uL21hdGNoZXIuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBtYXRjaCAhPT0gXCJmdW5jdGlvblwiKSBtYXRjaCA9IG1hdGNoZXIobWF0Y2gpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBbXSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBtYXRjaC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkge1xuICAgICAgICBzdWJncm91cC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih1cGRhdGUpIHtcbiAgcmV0dXJuIG5ldyBBcnJheSh1cGRhdGUubGVuZ3RoKTtcbn1cbiIsImltcG9ydCBzcGFyc2UgZnJvbSBcIi4vc3BhcnNlLmpzXCI7XG5pbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2VudGVyIHx8IHRoaXMuX2dyb3Vwcy5tYXAoc3BhcnNlKSwgdGhpcy5fcGFyZW50cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBFbnRlck5vZGUocGFyZW50LCBkYXR1bSkge1xuICB0aGlzLm93bmVyRG9jdW1lbnQgPSBwYXJlbnQub3duZXJEb2N1bWVudDtcbiAgdGhpcy5uYW1lc3BhY2VVUkkgPSBwYXJlbnQubmFtZXNwYWNlVVJJO1xuICB0aGlzLl9uZXh0ID0gbnVsbDtcbiAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICB0aGlzLl9fZGF0YV9fID0gZGF0dW07XG59XG5cbkVudGVyTm9kZS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBFbnRlck5vZGUsXG4gIGFwcGVuZENoaWxkOiBmdW5jdGlvbihjaGlsZCkgeyByZXR1cm4gdGhpcy5fcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZCwgdGhpcy5fbmV4dCk7IH0sXG4gIGluc2VydEJlZm9yZTogZnVuY3Rpb24oY2hpbGQsIG5leHQpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIG5leHQpOyB9LFxuICBxdWVyeVNlbGVjdG9yOiBmdW5jdGlvbihzZWxlY3RvcikgeyByZXR1cm4gdGhpcy5fcGFyZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpOyB9LFxuICBxdWVyeVNlbGVjdG9yQWxsOiBmdW5jdGlvbihzZWxlY3RvcikgeyByZXR1cm4gdGhpcy5fcGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpOyB9XG59O1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCB7RW50ZXJOb2RlfSBmcm9tIFwiLi9lbnRlci5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuLi9jb25zdGFudC5qc1wiO1xuXG5mdW5jdGlvbiBiaW5kSW5kZXgocGFyZW50LCBncm91cCwgZW50ZXIsIHVwZGF0ZSwgZXhpdCwgZGF0YSkge1xuICB2YXIgaSA9IDAsXG4gICAgICBub2RlLFxuICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGg7XG5cbiAgLy8gUHV0IGFueSBub24tbnVsbCBub2RlcyB0aGF0IGZpdCBpbnRvIHVwZGF0ZS5cbiAgLy8gUHV0IGFueSBudWxsIG5vZGVzIGludG8gZW50ZXIuXG4gIC8vIFB1dCBhbnkgcmVtYWluaW5nIGRhdGEgaW50byBlbnRlci5cbiAgZm9yICg7IGkgPCBkYXRhTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBub2RlLl9fZGF0YV9fID0gZGF0YVtpXTtcbiAgICAgIHVwZGF0ZVtpXSA9IG5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudGVyW2ldID0gbmV3IEVudGVyTm9kZShwYXJlbnQsIGRhdGFbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFB1dCBhbnkgbm9uLW51bGwgbm9kZXMgdGhhdCBkb27igJl0IGZpdCBpbnRvIGV4aXQuXG4gIGZvciAoOyBpIDwgZ3JvdXBMZW5ndGg7ICsraSkge1xuICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBiaW5kS2V5KHBhcmVudCwgZ3JvdXAsIGVudGVyLCB1cGRhdGUsIGV4aXQsIGRhdGEsIGtleSkge1xuICB2YXIgaSxcbiAgICAgIG5vZGUsXG4gICAgICBub2RlQnlLZXlWYWx1ZSA9IG5ldyBNYXAsXG4gICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aCxcbiAgICAgIGtleVZhbHVlcyA9IG5ldyBBcnJheShncm91cExlbmd0aCksXG4gICAgICBrZXlWYWx1ZTtcblxuICAvLyBDb21wdXRlIHRoZSBrZXkgZm9yIGVhY2ggbm9kZS5cbiAgLy8gSWYgbXVsdGlwbGUgbm9kZXMgaGF2ZSB0aGUgc2FtZSBrZXksIHRoZSBkdXBsaWNhdGVzIGFyZSBhZGRlZCB0byBleGl0LlxuICBmb3IgKGkgPSAwOyBpIDwgZ3JvdXBMZW5ndGg7ICsraSkge1xuICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgIGtleVZhbHVlc1tpXSA9IGtleVZhbHVlID0ga2V5LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApICsgXCJcIjtcbiAgICAgIGlmIChub2RlQnlLZXlWYWx1ZS5oYXMoa2V5VmFsdWUpKSB7XG4gICAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZUJ5S2V5VmFsdWUuc2V0KGtleVZhbHVlLCBub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBDb21wdXRlIHRoZSBrZXkgZm9yIGVhY2ggZGF0dW0uXG4gIC8vIElmIHRoZXJlIGEgbm9kZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXksIGpvaW4gYW5kIGFkZCBpdCB0byB1cGRhdGUuXG4gIC8vIElmIHRoZXJlIGlzIG5vdCAob3IgdGhlIGtleSBpcyBhIGR1cGxpY2F0ZSksIGFkZCBpdCB0byBlbnRlci5cbiAgZm9yIChpID0gMDsgaSA8IGRhdGFMZW5ndGg7ICsraSkge1xuICAgIGtleVZhbHVlID0ga2V5LmNhbGwocGFyZW50LCBkYXRhW2ldLCBpLCBkYXRhKSArIFwiXCI7XG4gICAgaWYgKG5vZGUgPSBub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWUpKSB7XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICBub2RlQnlLZXlWYWx1ZS5kZWxldGUoa2V5VmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBBZGQgYW55IHJlbWFpbmluZyBub2RlcyB0aGF0IHdlcmUgbm90IGJvdW5kIHRvIGRhdGEgdG8gZXhpdC5cbiAgZm9yIChpID0gMDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKG5vZGVCeUtleVZhbHVlLmdldChrZXlWYWx1ZXNbaV0pID09PSBub2RlKSkge1xuICAgICAgZXhpdFtpXSA9IG5vZGU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRhdHVtKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuX19kYXRhX187XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLCBkYXR1bSk7XG5cbiAgdmFyIGJpbmQgPSBrZXkgPyBiaW5kS2V5IDogYmluZEluZGV4LFxuICAgICAgcGFyZW50cyA9IHRoaXMuX3BhcmVudHMsXG4gICAgICBncm91cHMgPSB0aGlzLl9ncm91cHM7XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB2YWx1ZSA9IGNvbnN0YW50KHZhbHVlKTtcblxuICBmb3IgKHZhciBtID0gZ3JvdXBzLmxlbmd0aCwgdXBkYXRlID0gbmV3IEFycmF5KG0pLCBlbnRlciA9IG5ldyBBcnJheShtKSwgZXhpdCA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICB2YXIgcGFyZW50ID0gcGFyZW50c1tqXSxcbiAgICAgICAgZ3JvdXAgPSBncm91cHNbal0sXG4gICAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgICBkYXRhID0gYXJyYXlsaWtlKHZhbHVlLmNhbGwocGFyZW50LCBwYXJlbnQgJiYgcGFyZW50Ll9fZGF0YV9fLCBqLCBwYXJlbnRzKSksXG4gICAgICAgIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aCxcbiAgICAgICAgZW50ZXJHcm91cCA9IGVudGVyW2pdID0gbmV3IEFycmF5KGRhdGFMZW5ndGgpLFxuICAgICAgICB1cGRhdGVHcm91cCA9IHVwZGF0ZVtqXSA9IG5ldyBBcnJheShkYXRhTGVuZ3RoKSxcbiAgICAgICAgZXhpdEdyb3VwID0gZXhpdFtqXSA9IG5ldyBBcnJheShncm91cExlbmd0aCk7XG5cbiAgICBiaW5kKHBhcmVudCwgZ3JvdXAsIGVudGVyR3JvdXAsIHVwZGF0ZUdyb3VwLCBleGl0R3JvdXAsIGRhdGEsIGtleSk7XG5cbiAgICAvLyBOb3cgY29ubmVjdCB0aGUgZW50ZXIgbm9kZXMgdG8gdGhlaXIgZm9sbG93aW5nIHVwZGF0ZSBub2RlLCBzdWNoIHRoYXRcbiAgICAvLyBhcHBlbmRDaGlsZCBjYW4gaW5zZXJ0IHRoZSBtYXRlcmlhbGl6ZWQgZW50ZXIgbm9kZSBiZWZvcmUgdGhpcyBub2RlLFxuICAgIC8vIHJhdGhlciB0aGFuIGF0IHRoZSBlbmQgb2YgdGhlIHBhcmVudCBub2RlLlxuICAgIGZvciAodmFyIGkwID0gMCwgaTEgPSAwLCBwcmV2aW91cywgbmV4dDsgaTAgPCBkYXRhTGVuZ3RoOyArK2kwKSB7XG4gICAgICBpZiAocHJldmlvdXMgPSBlbnRlckdyb3VwW2kwXSkge1xuICAgICAgICBpZiAoaTAgPj0gaTEpIGkxID0gaTAgKyAxO1xuICAgICAgICB3aGlsZSAoIShuZXh0ID0gdXBkYXRlR3JvdXBbaTFdKSAmJiArK2kxIDwgZGF0YUxlbmd0aCk7XG4gICAgICAgIHByZXZpb3VzLl9uZXh0ID0gbmV4dCB8fCBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSA9IG5ldyBTZWxlY3Rpb24odXBkYXRlLCBwYXJlbnRzKTtcbiAgdXBkYXRlLl9lbnRlciA9IGVudGVyO1xuICB1cGRhdGUuX2V4aXQgPSBleGl0O1xuICByZXR1cm4gdXBkYXRlO1xufVxuXG4vLyBHaXZlbiBzb21lIGRhdGEsIHRoaXMgcmV0dXJucyBhbiBhcnJheS1saWtlIHZpZXcgb2YgaXQ6IGFuIG9iamVjdCB0aGF0XG4vLyBleHBvc2VzIGEgbGVuZ3RoIHByb3BlcnR5IGFuZCBhbGxvd3MgbnVtZXJpYyBpbmRleGluZy4gTm90ZSB0aGF0IHVubGlrZVxuLy8gc2VsZWN0QWxsLCB0aGlzIGlzbuKAmXQgd29ycmllZCBhYm91dCDigJxsaXZl4oCdIGNvbGxlY3Rpb25zIGJlY2F1c2UgdGhlIHJlc3VsdGluZ1xuLy8gYXJyYXkgd2lsbCBvbmx5IGJlIHVzZWQgYnJpZWZseSB3aGlsZSBkYXRhIGlzIGJlaW5nIGJvdW5kLiAoSXQgaXMgcG9zc2libGUgdG9cbi8vIGNhdXNlIHRoZSBkYXRhIHRvIGNoYW5nZSB3aGlsZSBpdGVyYXRpbmcgYnkgdXNpbmcgYSBrZXkgZnVuY3Rpb24sIGJ1dCBwbGVhc2Vcbi8vIGRvbuKAmXQ7IHdl4oCZZCByYXRoZXIgYXZvaWQgYSBncmF0dWl0b3VzIGNvcHkuKVxuZnVuY3Rpb24gYXJyYXlsaWtlKGRhdGEpIHtcbiAgcmV0dXJuIHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiICYmIFwibGVuZ3RoXCIgaW4gZGF0YVxuICAgID8gZGF0YSAvLyBBcnJheSwgVHlwZWRBcnJheSwgTm9kZUxpc3QsIGFycmF5LWxpa2VcbiAgICA6IEFycmF5LmZyb20oZGF0YSk7IC8vIE1hcCwgU2V0LCBpdGVyYWJsZSwgc3RyaW5nLCBvciBhbnl0aGluZyBlbHNlXG59XG4iLCJpbXBvcnQgc3BhcnNlIGZyb20gXCIuL3NwYXJzZS5qc1wiO1xuaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9leGl0IHx8IHRoaXMuX2dyb3Vwcy5tYXAoc3BhcnNlKSwgdGhpcy5fcGFyZW50cyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvbmVudGVyLCBvbnVwZGF0ZSwgb25leGl0KSB7XG4gIHZhciBlbnRlciA9IHRoaXMuZW50ZXIoKSwgdXBkYXRlID0gdGhpcywgZXhpdCA9IHRoaXMuZXhpdCgpO1xuICBpZiAodHlwZW9mIG9uZW50ZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGVudGVyID0gb25lbnRlcihlbnRlcik7XG4gICAgaWYgKGVudGVyKSBlbnRlciA9IGVudGVyLnNlbGVjdGlvbigpO1xuICB9IGVsc2Uge1xuICAgIGVudGVyID0gZW50ZXIuYXBwZW5kKG9uZW50ZXIgKyBcIlwiKTtcbiAgfVxuICBpZiAob251cGRhdGUgIT0gbnVsbCkge1xuICAgIHVwZGF0ZSA9IG9udXBkYXRlKHVwZGF0ZSk7XG4gICAgaWYgKHVwZGF0ZSkgdXBkYXRlID0gdXBkYXRlLnNlbGVjdGlvbigpO1xuICB9XG4gIGlmIChvbmV4aXQgPT0gbnVsbCkgZXhpdC5yZW1vdmUoKTsgZWxzZSBvbmV4aXQoZXhpdCk7XG4gIHJldHVybiBlbnRlciAmJiB1cGRhdGUgPyBlbnRlci5tZXJnZSh1cGRhdGUpLm9yZGVyKCkgOiB1cGRhdGU7XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29udGV4dCkge1xuICB2YXIgc2VsZWN0aW9uID0gY29udGV4dC5zZWxlY3Rpb24gPyBjb250ZXh0LnNlbGVjdGlvbigpIDogY29udGV4dDtcblxuICBmb3IgKHZhciBncm91cHMwID0gdGhpcy5fZ3JvdXBzLCBncm91cHMxID0gc2VsZWN0aW9uLl9ncm91cHMsIG0wID0gZ3JvdXBzMC5sZW5ndGgsIG0xID0gZ3JvdXBzMS5sZW5ndGgsIG0gPSBNYXRoLm1pbihtMCwgbTEpLCBtZXJnZXMgPSBuZXcgQXJyYXkobTApLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwMCA9IGdyb3VwczBbal0sIGdyb3VwMSA9IGdyb3VwczFbal0sIG4gPSBncm91cDAubGVuZ3RoLCBtZXJnZSA9IG1lcmdlc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXAwW2ldIHx8IGdyb3VwMVtpXSkge1xuICAgICAgICBtZXJnZVtpXSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IGogPCBtMDsgKytqKSB7XG4gICAgbWVyZ2VzW2pdID0gZ3JvdXBzMFtqXTtcbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKG1lcmdlcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAtMSwgbSA9IGdyb3Vwcy5sZW5ndGg7ICsraiA8IG07KSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSBncm91cC5sZW5ndGggLSAxLCBuZXh0ID0gZ3JvdXBbaV0sIG5vZGU7IC0taSA+PSAwOykge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBpZiAobmV4dCAmJiBub2RlLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKG5leHQpIF4gNCkgbmV4dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCBuZXh0KTtcbiAgICAgICAgbmV4dCA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29tcGFyZSkge1xuICBpZiAoIWNvbXBhcmUpIGNvbXBhcmUgPSBhc2NlbmRpbmc7XG5cbiAgZnVuY3Rpb24gY29tcGFyZU5vZGUoYSwgYikge1xuICAgIHJldHVybiBhICYmIGIgPyBjb21wYXJlKGEuX19kYXRhX18sIGIuX19kYXRhX18pIDogIWEgLSAhYjtcbiAgfVxuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHNvcnRncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHNvcnRncm91cCA9IHNvcnRncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHNvcnRncm91cFtpXSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICAgIHNvcnRncm91cC5zb3J0KGNvbXBhcmVOb2RlKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHNvcnRncm91cHMsIHRoaXMuX3BhcmVudHMpLm9yZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogYSA+PSBiID8gMCA6IE5hTjtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbMF07XG4gIGFyZ3VtZW50c1swXSA9IHRoaXM7XG4gIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gIHJldHVybiB0aGlzO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKHRoaXMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgIHZhciBub2RlID0gZ3JvdXBbaV07XG4gICAgICBpZiAobm9kZSkgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgbGV0IHNpemUgPSAwO1xuICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcykgKytzaXplOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHJldHVybiBzaXplO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiAhdGhpcy5ub2RlKCk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaykge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSBjYWxsYmFjay5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cbiIsImltcG9ydCBuYW1lc3BhY2UgZnJvbSBcIi4uL25hbWVzcGFjZS5qc1wiO1xuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlTlMoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudE5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIHZhbHVlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgZWxzZSB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB2KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uTlMoZnVsbG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIGVsc2UgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIHYpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLm5vZGUoKTtcbiAgICByZXR1cm4gZnVsbG5hbWUubG9jYWxcbiAgICAgICAgPyBub2RlLmdldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbClcbiAgICAgICAgOiBub2RlLmdldEF0dHJpYnV0ZShmdWxsbmFtZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJSZW1vdmVOUyA6IGF0dHJSZW1vdmUpIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJGdW5jdGlvbk5TIDogYXR0ckZ1bmN0aW9uKVxuICAgICAgOiAoZnVsbG5hbWUubG9jYWwgPyBhdHRyQ29uc3RhbnROUyA6IGF0dHJDb25zdGFudCkpKShmdWxsbmFtZSwgdmFsdWUpKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5vZGUpIHtcbiAgcmV0dXJuIChub2RlLm93bmVyRG9jdW1lbnQgJiYgbm9kZS5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3KSAvLyBub2RlIGlzIGEgTm9kZVxuICAgICAgfHwgKG5vZGUuZG9jdW1lbnQgJiYgbm9kZSkgLy8gbm9kZSBpcyBhIFdpbmRvd1xuICAgICAgfHwgbm9kZS5kZWZhdWx0VmlldzsgLy8gbm9kZSBpcyBhIERvY3VtZW50XG59XG4iLCJpbXBvcnQgZGVmYXVsdFZpZXcgZnJvbSBcIi4uL3dpbmRvdy5qc1wiO1xuXG5mdW5jdGlvbiBzdHlsZVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUNvbnN0YW50KG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gICAgZWxzZSB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHYsIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgPyB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgICAgICAgID8gc3R5bGVSZW1vdmUgOiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgPyBzdHlsZUZ1bmN0aW9uXG4gICAgICAgICAgICA6IHN0eWxlQ29uc3RhbnQpKG5hbWUsIHZhbHVlLCBwcmlvcml0eSA9PSBudWxsID8gXCJcIiA6IHByaW9yaXR5KSlcbiAgICAgIDogc3R5bGVWYWx1ZSh0aGlzLm5vZGUoKSwgbmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHlsZVZhbHVlKG5vZGUsIG5hbWUpIHtcbiAgcmV0dXJuIG5vZGUuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKVxuICAgICAgfHwgZGVmYXVsdFZpZXcobm9kZSkuZ2V0Q29tcHV0ZWRTdHlsZShub2RlLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpO1xufVxuIiwiZnVuY3Rpb24gcHJvcGVydHlSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgZGVsZXRlIHRoaXNbbmFtZV07XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5Q29uc3RhbnQobmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXNbbmFtZV0gPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcHJvcGVydHlGdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIGRlbGV0ZSB0aGlzW25hbWVdO1xuICAgIGVsc2UgdGhpc1tuYW1lXSA9IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgPyB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IHByb3BlcnR5UmVtb3ZlIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IHByb3BlcnR5RnVuY3Rpb25cbiAgICAgICAgICA6IHByb3BlcnR5Q29uc3RhbnQpKG5hbWUsIHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKClbbmFtZV07XG59XG4iLCJmdW5jdGlvbiBjbGFzc0FycmF5KHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnRyaW0oKS5zcGxpdCgvXnxcXHMrLyk7XG59XG5cbmZ1bmN0aW9uIGNsYXNzTGlzdChub2RlKSB7XG4gIHJldHVybiBub2RlLmNsYXNzTGlzdCB8fCBuZXcgQ2xhc3NMaXN0KG5vZGUpO1xufVxuXG5mdW5jdGlvbiBDbGFzc0xpc3Qobm9kZSkge1xuICB0aGlzLl9ub2RlID0gbm9kZTtcbiAgdGhpcy5fbmFtZXMgPSBjbGFzc0FycmF5KG5vZGUuZ2V0QXR0cmlidXRlKFwiY2xhc3NcIikgfHwgXCJcIik7XG59XG5cbkNsYXNzTGlzdC5wcm90b3R5cGUgPSB7XG4gIGFkZDogZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpID0gdGhpcy5fbmFtZXMuaW5kZXhPZihuYW1lKTtcbiAgICBpZiAoaSA8IDApIHtcbiAgICAgIHRoaXMuX25hbWVzLnB1c2gobmFtZSk7XG4gICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMuX25hbWVzLmpvaW4oXCIgXCIpKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpID0gdGhpcy5fbmFtZXMuaW5kZXhPZihuYW1lKTtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICB0aGlzLl9uYW1lcy5zcGxpY2UoaSwgMSk7XG4gICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMuX25hbWVzLmpvaW4oXCIgXCIpKTtcbiAgICB9XG4gIH0sXG4gIGNvbnRhaW5zOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSkgPj0gMDtcbiAgfVxufTtcblxuZnVuY3Rpb24gY2xhc3NlZEFkZChub2RlLCBuYW1lcykge1xuICB2YXIgbGlzdCA9IGNsYXNzTGlzdChub2RlKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbikgbGlzdC5hZGQobmFtZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkUmVtb3ZlKG5vZGUsIG5hbWVzKSB7XG4gIHZhciBsaXN0ID0gY2xhc3NMaXN0KG5vZGUpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gIHdoaWxlICgrK2kgPCBuKSBsaXN0LnJlbW92ZShuYW1lc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRUcnVlKG5hbWVzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjbGFzc2VkQWRkKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZEZhbHNlKG5hbWVzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjbGFzc2VkUmVtb3ZlKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZEZ1bmN0aW9uKG5hbWVzLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgKHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgPyBjbGFzc2VkQWRkIDogY2xhc3NlZFJlbW92ZSkodGhpcywgbmFtZXMpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgbmFtZXMgPSBjbGFzc0FycmF5KG5hbWUgKyBcIlwiKTtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgbGlzdCA9IGNsYXNzTGlzdCh0aGlzLm5vZGUoKSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgaWYgKCFsaXN0LmNvbnRhaW5zKG5hbWVzW2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZWFjaCgodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gY2xhc3NlZEZ1bmN0aW9uIDogdmFsdWVcbiAgICAgID8gY2xhc3NlZFRydWVcbiAgICAgIDogY2xhc3NlZEZhbHNlKShuYW1lcywgdmFsdWUpKTtcbn1cbiIsImZ1bmN0aW9uIHRleHRSZW1vdmUoKSB7XG4gIHRoaXMudGV4dENvbnRlbnQgPSBcIlwiO1xufVxuXG5mdW5jdGlvbiB0ZXh0Q29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHYgPT0gbnVsbCA/IFwiXCIgOiB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2godmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gdGV4dFJlbW92ZSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gdGV4dEZ1bmN0aW9uXG4gICAgICAgICAgOiB0ZXh0Q29uc3RhbnQpKHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKCkudGV4dENvbnRlbnQ7XG59XG4iLCJmdW5jdGlvbiBodG1sUmVtb3ZlKCkge1xuICB0aGlzLmlubmVySFRNTCA9IFwiXCI7XG59XG5cbmZ1bmN0aW9uIGh0bWxDb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaHRtbEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5pbm5lckhUTUwgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IGh0bWxSZW1vdmUgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGh0bWxGdW5jdGlvblxuICAgICAgICAgIDogaHRtbENvbnN0YW50KSh2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpLmlubmVySFRNTDtcbn1cbiIsImZ1bmN0aW9uIHJhaXNlKCkge1xuICBpZiAodGhpcy5uZXh0U2libGluZykgdGhpcy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChyYWlzZSk7XG59XG4iLCJmdW5jdGlvbiBsb3dlcigpIHtcbiAgaWYgKHRoaXMucHJldmlvdXNTaWJsaW5nKSB0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMsIHRoaXMucGFyZW50Tm9kZS5maXJzdENoaWxkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gobG93ZXIpO1xufVxuIiwiaW1wb3J0IGNyZWF0b3IgZnJvbSBcIi4uL2NyZWF0b3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgY3JlYXRlID0gdHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIiA/IG5hbWUgOiBjcmVhdG9yKG5hbWUpO1xuICByZXR1cm4gdGhpcy5zZWxlY3QoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwZW5kQ2hpbGQoY3JlYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9KTtcbn1cbiIsImltcG9ydCBjcmVhdG9yIGZyb20gXCIuLi9jcmVhdG9yLmpzXCI7XG5pbXBvcnQgc2VsZWN0b3IgZnJvbSBcIi4uL3NlbGVjdG9yLmpzXCI7XG5cbmZ1bmN0aW9uIGNvbnN0YW50TnVsbCgpIHtcbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIGJlZm9yZSkge1xuICB2YXIgY3JlYXRlID0gdHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIiA/IG5hbWUgOiBjcmVhdG9yKG5hbWUpLFxuICAgICAgc2VsZWN0ID0gYmVmb3JlID09IG51bGwgPyBjb25zdGFudE51bGwgOiB0eXBlb2YgYmVmb3JlID09PSBcImZ1bmN0aW9uXCIgPyBiZWZvcmUgOiBzZWxlY3RvcihiZWZvcmUpO1xuICByZXR1cm4gdGhpcy5zZWxlY3QoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zZXJ0QmVmb3JlKGNyZWF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLCBzZWxlY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCBudWxsKTtcbiAgfSk7XG59XG4iLCJmdW5jdGlvbiByZW1vdmUoKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmVtb3ZlKTtcbn1cbiIsImZ1bmN0aW9uIHNlbGVjdGlvbl9jbG9uZVNoYWxsb3coKSB7XG4gIHZhciBjbG9uZSA9IHRoaXMuY2xvbmVOb2RlKGZhbHNlKSwgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICByZXR1cm4gcGFyZW50ID8gcGFyZW50Lmluc2VydEJlZm9yZShjbG9uZSwgdGhpcy5uZXh0U2libGluZykgOiBjbG9uZTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uX2Nsb25lRGVlcCgpIHtcbiAgdmFyIGNsb25lID0gdGhpcy5jbG9uZU5vZGUodHJ1ZSksIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgcmV0dXJuIHBhcmVudCA/IHBhcmVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMubmV4dFNpYmxpbmcpIDogY2xvbmU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGRlZXApIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGRlZXAgPyBzZWxlY3Rpb25fY2xvbmVEZWVwIDogc2VsZWN0aW9uX2Nsb25lU2hhbGxvdyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLnByb3BlcnR5KFwiX19kYXRhX19cIiwgdmFsdWUpXG4gICAgICA6IHRoaXMubm9kZSgpLl9fZGF0YV9fO1xufVxuIiwiZnVuY3Rpb24gY29udGV4dExpc3RlbmVyKGxpc3RlbmVyKSB7XG4gIHJldHVybiBmdW5jdGlvbihldmVudCkge1xuICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQsIHRoaXMuX19kYXRhX18pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBvblJlbW92ZSh0eXBlbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uID0gdGhpcy5fX29uO1xuICAgIGlmICghb24pIHJldHVybjtcbiAgICBmb3IgKHZhciBqID0gMCwgaSA9IC0xLCBtID0gb24ubGVuZ3RoLCBvOyBqIDwgbTsgKytqKSB7XG4gICAgICBpZiAobyA9IG9uW2pdLCAoIXR5cGVuYW1lLnR5cGUgfHwgby50eXBlID09PSB0eXBlbmFtZS50eXBlKSAmJiBvLm5hbWUgPT09IHR5cGVuYW1lLm5hbWUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciwgby5vcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9uWysraV0gPSBvO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoKytpKSBvbi5sZW5ndGggPSBpO1xuICAgIGVsc2UgZGVsZXRlIHRoaXMuX19vbjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25BZGQodHlwZW5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb24gPSB0aGlzLl9fb24sIG8sIGxpc3RlbmVyID0gY29udGV4dExpc3RlbmVyKHZhbHVlKTtcbiAgICBpZiAob24pIGZvciAodmFyIGogPSAwLCBtID0gb24ubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgICBpZiAoKG8gPSBvbltqXSkudHlwZSA9PT0gdHlwZW5hbWUudHlwZSAmJiBvLm5hbWUgPT09IHR5cGVuYW1lLm5hbWUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciwgby5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciA9IGxpc3RlbmVyLCBvLm9wdGlvbnMgPSBvcHRpb25zKTtcbiAgICAgICAgby52YWx1ZSA9IHZhbHVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlbmFtZS50eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgbyA9IHt0eXBlOiB0eXBlbmFtZS50eXBlLCBuYW1lOiB0eXBlbmFtZS5uYW1lLCB2YWx1ZTogdmFsdWUsIGxpc3RlbmVyOiBsaXN0ZW5lciwgb3B0aW9uczogb3B0aW9uc307XG4gICAgaWYgKCFvbikgdGhpcy5fX29uID0gW29dO1xuICAgIGVsc2Ugb24ucHVzaChvKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHlwZW5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlbmFtZXMgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIpLCBpLCBuID0gdHlwZW5hbWVzLmxlbmd0aCwgdDtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgb24gPSB0aGlzLm5vZGUoKS5fX29uO1xuICAgIGlmIChvbikgZm9yICh2YXIgaiA9IDAsIG0gPSBvbi5sZW5ndGgsIG87IGogPCBtOyArK2opIHtcbiAgICAgIGZvciAoaSA9IDAsIG8gPSBvbltqXTsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAoKHQgPSB0eXBlbmFtZXNbaV0pLnR5cGUgPT09IG8udHlwZSAmJiB0Lm5hbWUgPT09IG8ubmFtZSkge1xuICAgICAgICAgIHJldHVybiBvLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIG9uID0gdmFsdWUgPyBvbkFkZCA6IG9uUmVtb3ZlO1xuICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB0aGlzLmVhY2gob24odHlwZW5hbWVzW2ldLCB2YWx1ZSwgb3B0aW9ucykpO1xuICByZXR1cm4gdGhpcztcbn1cbiIsImltcG9ydCBkZWZhdWx0VmlldyBmcm9tIFwiLi4vd2luZG93LmpzXCI7XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQobm9kZSwgdHlwZSwgcGFyYW1zKSB7XG4gIHZhciB3aW5kb3cgPSBkZWZhdWx0Vmlldyhub2RlKSxcbiAgICAgIGV2ZW50ID0gd2luZG93LkN1c3RvbUV2ZW50O1xuXG4gIGlmICh0eXBlb2YgZXZlbnQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGV2ZW50ID0gbmV3IGV2ZW50KHR5cGUsIHBhcmFtcyk7XG4gIH0gZWxzZSB7XG4gICAgZXZlbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudFwiKTtcbiAgICBpZiAocGFyYW1zKSBldmVudC5pbml0RXZlbnQodHlwZSwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlKSwgZXZlbnQuZGV0YWlsID0gcGFyYW1zLmRldGFpbDtcbiAgICBlbHNlIGV2ZW50LmluaXRFdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UpO1xuICB9XG5cbiAgbm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hDb25zdGFudCh0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkaXNwYXRjaEV2ZW50KHRoaXMsIHR5cGUsIHBhcmFtcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRnVuY3Rpb24odHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gdGhpcy5lYWNoKCh0eXBlb2YgcGFyYW1zID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gZGlzcGF0Y2hGdW5jdGlvblxuICAgICAgOiBkaXNwYXRjaENvbnN0YW50KSh0eXBlLCBwYXJhbXMpKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKigpIHtcbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGgsIG5vZGU7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHlpZWxkIG5vZGU7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgc2VsZWN0aW9uX3NlbGVjdCBmcm9tIFwiLi9zZWxlY3QuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0QWxsIGZyb20gXCIuL3NlbGVjdEFsbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RDaGlsZCBmcm9tIFwiLi9zZWxlY3RDaGlsZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbiBmcm9tIFwiLi9zZWxlY3RDaGlsZHJlbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9maWx0ZXIgZnJvbSBcIi4vZmlsdGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2RhdGEgZnJvbSBcIi4vZGF0YS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lbnRlciBmcm9tIFwiLi9lbnRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9leGl0IGZyb20gXCIuL2V4aXQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fam9pbiBmcm9tIFwiLi9qb2luLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX21lcmdlIGZyb20gXCIuL21lcmdlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX29yZGVyIGZyb20gXCIuL29yZGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NvcnQgZnJvbSBcIi4vc29ydC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jYWxsIGZyb20gXCIuL2NhbGwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbm9kZXMgZnJvbSBcIi4vbm9kZXMuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbm9kZSBmcm9tIFwiLi9ub2RlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NpemUgZnJvbSBcIi4vc2l6ZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lbXB0eSBmcm9tIFwiLi9lbXB0eS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lYWNoIGZyb20gXCIuL2VhY2guanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fYXR0ciBmcm9tIFwiLi9hdHRyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3N0eWxlIGZyb20gXCIuL3N0eWxlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3Byb3BlcnR5IGZyb20gXCIuL3Byb3BlcnR5LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2NsYXNzZWQgZnJvbSBcIi4vY2xhc3NlZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl90ZXh0IGZyb20gXCIuL3RleHQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faHRtbCBmcm9tIFwiLi9odG1sLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3JhaXNlIGZyb20gXCIuL3JhaXNlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2xvd2VyIGZyb20gXCIuL2xvd2VyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2FwcGVuZCBmcm9tIFwiLi9hcHBlbmQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faW5zZXJ0IGZyb20gXCIuL2luc2VydC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9yZW1vdmUgZnJvbSBcIi4vcmVtb3ZlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2Nsb25lIGZyb20gXCIuL2Nsb25lLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2RhdHVtIGZyb20gXCIuL2RhdHVtLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX29uIGZyb20gXCIuL29uLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2Rpc3BhdGNoIGZyb20gXCIuL2Rpc3BhdGNoLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2l0ZXJhdG9yIGZyb20gXCIuL2l0ZXJhdG9yLmpzXCI7XG5cbmV4cG9ydCB2YXIgcm9vdCA9IFtudWxsXTtcblxuZXhwb3J0IGZ1bmN0aW9uIFNlbGVjdGlvbihncm91cHMsIHBhcmVudHMpIHtcbiAgdGhpcy5fZ3JvdXBzID0gZ3JvdXBzO1xuICB0aGlzLl9wYXJlbnRzID0gcGFyZW50cztcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbihbW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF1dLCByb290KTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uX3NlbGVjdGlvbigpIHtcbiAgcmV0dXJuIHRoaXM7XG59XG5cblNlbGVjdGlvbi5wcm90b3R5cGUgPSBzZWxlY3Rpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogU2VsZWN0aW9uLFxuICBzZWxlY3Q6IHNlbGVjdGlvbl9zZWxlY3QsXG4gIHNlbGVjdEFsbDogc2VsZWN0aW9uX3NlbGVjdEFsbCxcbiAgc2VsZWN0Q2hpbGQ6IHNlbGVjdGlvbl9zZWxlY3RDaGlsZCxcbiAgc2VsZWN0Q2hpbGRyZW46IHNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbixcbiAgZmlsdGVyOiBzZWxlY3Rpb25fZmlsdGVyLFxuICBkYXRhOiBzZWxlY3Rpb25fZGF0YSxcbiAgZW50ZXI6IHNlbGVjdGlvbl9lbnRlcixcbiAgZXhpdDogc2VsZWN0aW9uX2V4aXQsXG4gIGpvaW46IHNlbGVjdGlvbl9qb2luLFxuICBtZXJnZTogc2VsZWN0aW9uX21lcmdlLFxuICBzZWxlY3Rpb246IHNlbGVjdGlvbl9zZWxlY3Rpb24sXG4gIG9yZGVyOiBzZWxlY3Rpb25fb3JkZXIsXG4gIHNvcnQ6IHNlbGVjdGlvbl9zb3J0LFxuICBjYWxsOiBzZWxlY3Rpb25fY2FsbCxcbiAgbm9kZXM6IHNlbGVjdGlvbl9ub2RlcyxcbiAgbm9kZTogc2VsZWN0aW9uX25vZGUsXG4gIHNpemU6IHNlbGVjdGlvbl9zaXplLFxuICBlbXB0eTogc2VsZWN0aW9uX2VtcHR5LFxuICBlYWNoOiBzZWxlY3Rpb25fZWFjaCxcbiAgYXR0cjogc2VsZWN0aW9uX2F0dHIsXG4gIHN0eWxlOiBzZWxlY3Rpb25fc3R5bGUsXG4gIHByb3BlcnR5OiBzZWxlY3Rpb25fcHJvcGVydHksXG4gIGNsYXNzZWQ6IHNlbGVjdGlvbl9jbGFzc2VkLFxuICB0ZXh0OiBzZWxlY3Rpb25fdGV4dCxcbiAgaHRtbDogc2VsZWN0aW9uX2h0bWwsXG4gIHJhaXNlOiBzZWxlY3Rpb25fcmFpc2UsXG4gIGxvd2VyOiBzZWxlY3Rpb25fbG93ZXIsXG4gIGFwcGVuZDogc2VsZWN0aW9uX2FwcGVuZCxcbiAgaW5zZXJ0OiBzZWxlY3Rpb25faW5zZXJ0LFxuICByZW1vdmU6IHNlbGVjdGlvbl9yZW1vdmUsXG4gIGNsb25lOiBzZWxlY3Rpb25fY2xvbmUsXG4gIGRhdHVtOiBzZWxlY3Rpb25fZGF0dW0sXG4gIG9uOiBzZWxlY3Rpb25fb24sXG4gIGRpc3BhdGNoOiBzZWxlY3Rpb25fZGlzcGF0Y2gsXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiBzZWxlY3Rpb25faXRlcmF0b3Jcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNlbGVjdGlvbjtcbiIsImltcG9ydCB7U2VsZWN0aW9uLCByb290fSBmcm9tIFwiLi9zZWxlY3Rpb24vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBuZXcgU2VsZWN0aW9uKFtbZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcildXSwgW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF0pXG4gICAgICA6IG5ldyBTZWxlY3Rpb24oW1tzZWxlY3Rvcl1dLCByb290KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnN0cnVjdG9yLCBmYWN0b3J5LCBwcm90b3R5cGUpIHtcbiAgY29uc3RydWN0b3IucHJvdG90eXBlID0gZmFjdG9yeS5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gIHByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGNvbnN0cnVjdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKHBhcmVudCwgZGVmaW5pdGlvbikge1xuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQucHJvdG90eXBlKTtcbiAgZm9yICh2YXIga2V5IGluIGRlZmluaXRpb24pIHByb3RvdHlwZVtrZXldID0gZGVmaW5pdGlvbltrZXldO1xuICByZXR1cm4gcHJvdG90eXBlO1xufVxuIiwiaW1wb3J0IGRlZmluZSwge2V4dGVuZH0gZnJvbSBcIi4vZGVmaW5lLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBDb2xvcigpIHt9XG5cbmV4cG9ydCB2YXIgZGFya2VyID0gMC43O1xuZXhwb3J0IHZhciBicmlnaHRlciA9IDEgLyBkYXJrZXI7XG5cbnZhciByZUkgPSBcIlxcXFxzKihbKy1dP1xcXFxkKylcXFxccypcIixcbiAgICByZU4gPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPylcXFxccypcIixcbiAgICByZVAgPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPyklXFxcXHMqXCIsXG4gICAgcmVIZXggPSAvXiMoWzAtOWEtZl17Myw4fSkkLyxcbiAgICByZVJnYkludGVnZXIgPSBuZXcgUmVnRXhwKGBecmdiXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfVxcXFwpJGApLFxuICAgIHJlUmdiUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5yZ2JcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVSZ2JhSW50ZWdlciA9IG5ldyBSZWdFeHAoYF5yZ2JhXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfSwke3JlTn1cXFxcKSRgKSxcbiAgICByZVJnYmFQZXJjZW50ID0gbmV3IFJlZ0V4cChgXnJnYmFcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9LCR7cmVOfVxcXFwpJGApLFxuICAgIHJlSHNsUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xcXFxcKCR7cmVOfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVIc2xhUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xhXFxcXCgke3JlTn0sJHtyZVB9LCR7cmVQfSwke3JlTn1cXFxcKSRgKTtcblxudmFyIG5hbWVkID0ge1xuICBhbGljZWJsdWU6IDB4ZjBmOGZmLFxuICBhbnRpcXVld2hpdGU6IDB4ZmFlYmQ3LFxuICBhcXVhOiAweDAwZmZmZixcbiAgYXF1YW1hcmluZTogMHg3ZmZmZDQsXG4gIGF6dXJlOiAweGYwZmZmZixcbiAgYmVpZ2U6IDB4ZjVmNWRjLFxuICBiaXNxdWU6IDB4ZmZlNGM0LFxuICBibGFjazogMHgwMDAwMDAsXG4gIGJsYW5jaGVkYWxtb25kOiAweGZmZWJjZCxcbiAgYmx1ZTogMHgwMDAwZmYsXG4gIGJsdWV2aW9sZXQ6IDB4OGEyYmUyLFxuICBicm93bjogMHhhNTJhMmEsXG4gIGJ1cmx5d29vZDogMHhkZWI4ODcsXG4gIGNhZGV0Ymx1ZTogMHg1ZjllYTAsXG4gIGNoYXJ0cmV1c2U6IDB4N2ZmZjAwLFxuICBjaG9jb2xhdGU6IDB4ZDI2OTFlLFxuICBjb3JhbDogMHhmZjdmNTAsXG4gIGNvcm5mbG93ZXJibHVlOiAweDY0OTVlZCxcbiAgY29ybnNpbGs6IDB4ZmZmOGRjLFxuICBjcmltc29uOiAweGRjMTQzYyxcbiAgY3lhbjogMHgwMGZmZmYsXG4gIGRhcmtibHVlOiAweDAwMDA4YixcbiAgZGFya2N5YW46IDB4MDA4YjhiLFxuICBkYXJrZ29sZGVucm9kOiAweGI4ODYwYixcbiAgZGFya2dyYXk6IDB4YTlhOWE5LFxuICBkYXJrZ3JlZW46IDB4MDA2NDAwLFxuICBkYXJrZ3JleTogMHhhOWE5YTksXG4gIGRhcmtraGFraTogMHhiZGI3NmIsXG4gIGRhcmttYWdlbnRhOiAweDhiMDA4YixcbiAgZGFya29saXZlZ3JlZW46IDB4NTU2YjJmLFxuICBkYXJrb3JhbmdlOiAweGZmOGMwMCxcbiAgZGFya29yY2hpZDogMHg5OTMyY2MsXG4gIGRhcmtyZWQ6IDB4OGIwMDAwLFxuICBkYXJrc2FsbW9uOiAweGU5OTY3YSxcbiAgZGFya3NlYWdyZWVuOiAweDhmYmM4ZixcbiAgZGFya3NsYXRlYmx1ZTogMHg0ODNkOGIsXG4gIGRhcmtzbGF0ZWdyYXk6IDB4MmY0ZjRmLFxuICBkYXJrc2xhdGVncmV5OiAweDJmNGY0ZixcbiAgZGFya3R1cnF1b2lzZTogMHgwMGNlZDEsXG4gIGRhcmt2aW9sZXQ6IDB4OTQwMGQzLFxuICBkZWVwcGluazogMHhmZjE0OTMsXG4gIGRlZXBza3libHVlOiAweDAwYmZmZixcbiAgZGltZ3JheTogMHg2OTY5NjksXG4gIGRpbWdyZXk6IDB4Njk2OTY5LFxuICBkb2RnZXJibHVlOiAweDFlOTBmZixcbiAgZmlyZWJyaWNrOiAweGIyMjIyMixcbiAgZmxvcmFsd2hpdGU6IDB4ZmZmYWYwLFxuICBmb3Jlc3RncmVlbjogMHgyMjhiMjIsXG4gIGZ1Y2hzaWE6IDB4ZmYwMGZmLFxuICBnYWluc2Jvcm86IDB4ZGNkY2RjLFxuICBnaG9zdHdoaXRlOiAweGY4ZjhmZixcbiAgZ29sZDogMHhmZmQ3MDAsXG4gIGdvbGRlbnJvZDogMHhkYWE1MjAsXG4gIGdyYXk6IDB4ODA4MDgwLFxuICBncmVlbjogMHgwMDgwMDAsXG4gIGdyZWVueWVsbG93OiAweGFkZmYyZixcbiAgZ3JleTogMHg4MDgwODAsXG4gIGhvbmV5ZGV3OiAweGYwZmZmMCxcbiAgaG90cGluazogMHhmZjY5YjQsXG4gIGluZGlhbnJlZDogMHhjZDVjNWMsXG4gIGluZGlnbzogMHg0YjAwODIsXG4gIGl2b3J5OiAweGZmZmZmMCxcbiAga2hha2k6IDB4ZjBlNjhjLFxuICBsYXZlbmRlcjogMHhlNmU2ZmEsXG4gIGxhdmVuZGVyYmx1c2g6IDB4ZmZmMGY1LFxuICBsYXduZ3JlZW46IDB4N2NmYzAwLFxuICBsZW1vbmNoaWZmb246IDB4ZmZmYWNkLFxuICBsaWdodGJsdWU6IDB4YWRkOGU2LFxuICBsaWdodGNvcmFsOiAweGYwODA4MCxcbiAgbGlnaHRjeWFuOiAweGUwZmZmZixcbiAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IDB4ZmFmYWQyLFxuICBsaWdodGdyYXk6IDB4ZDNkM2QzLFxuICBsaWdodGdyZWVuOiAweDkwZWU5MCxcbiAgbGlnaHRncmV5OiAweGQzZDNkMyxcbiAgbGlnaHRwaW5rOiAweGZmYjZjMSxcbiAgbGlnaHRzYWxtb246IDB4ZmZhMDdhLFxuICBsaWdodHNlYWdyZWVuOiAweDIwYjJhYSxcbiAgbGlnaHRza3libHVlOiAweDg3Y2VmYSxcbiAgbGlnaHRzbGF0ZWdyYXk6IDB4Nzc4ODk5LFxuICBsaWdodHNsYXRlZ3JleTogMHg3Nzg4OTksXG4gIGxpZ2h0c3RlZWxibHVlOiAweGIwYzRkZSxcbiAgbGlnaHR5ZWxsb3c6IDB4ZmZmZmUwLFxuICBsaW1lOiAweDAwZmYwMCxcbiAgbGltZWdyZWVuOiAweDMyY2QzMixcbiAgbGluZW46IDB4ZmFmMGU2LFxuICBtYWdlbnRhOiAweGZmMDBmZixcbiAgbWFyb29uOiAweDgwMDAwMCxcbiAgbWVkaXVtYXF1YW1hcmluZTogMHg2NmNkYWEsXG4gIG1lZGl1bWJsdWU6IDB4MDAwMGNkLFxuICBtZWRpdW1vcmNoaWQ6IDB4YmE1NWQzLFxuICBtZWRpdW1wdXJwbGU6IDB4OTM3MGRiLFxuICBtZWRpdW1zZWFncmVlbjogMHgzY2IzNzEsXG4gIG1lZGl1bXNsYXRlYmx1ZTogMHg3YjY4ZWUsXG4gIG1lZGl1bXNwcmluZ2dyZWVuOiAweDAwZmE5YSxcbiAgbWVkaXVtdHVycXVvaXNlOiAweDQ4ZDFjYyxcbiAgbWVkaXVtdmlvbGV0cmVkOiAweGM3MTU4NSxcbiAgbWlkbmlnaHRibHVlOiAweDE5MTk3MCxcbiAgbWludGNyZWFtOiAweGY1ZmZmYSxcbiAgbWlzdHlyb3NlOiAweGZmZTRlMSxcbiAgbW9jY2FzaW46IDB4ZmZlNGI1LFxuICBuYXZham93aGl0ZTogMHhmZmRlYWQsXG4gIG5hdnk6IDB4MDAwMDgwLFxuICBvbGRsYWNlOiAweGZkZjVlNixcbiAgb2xpdmU6IDB4ODA4MDAwLFxuICBvbGl2ZWRyYWI6IDB4NmI4ZTIzLFxuICBvcmFuZ2U6IDB4ZmZhNTAwLFxuICBvcmFuZ2VyZWQ6IDB4ZmY0NTAwLFxuICBvcmNoaWQ6IDB4ZGE3MGQ2LFxuICBwYWxlZ29sZGVucm9kOiAweGVlZThhYSxcbiAgcGFsZWdyZWVuOiAweDk4ZmI5OCxcbiAgcGFsZXR1cnF1b2lzZTogMHhhZmVlZWUsXG4gIHBhbGV2aW9sZXRyZWQ6IDB4ZGI3MDkzLFxuICBwYXBheWF3aGlwOiAweGZmZWZkNSxcbiAgcGVhY2hwdWZmOiAweGZmZGFiOSxcbiAgcGVydTogMHhjZDg1M2YsXG4gIHBpbms6IDB4ZmZjMGNiLFxuICBwbHVtOiAweGRkYTBkZCxcbiAgcG93ZGVyYmx1ZTogMHhiMGUwZTYsXG4gIHB1cnBsZTogMHg4MDAwODAsXG4gIHJlYmVjY2FwdXJwbGU6IDB4NjYzMzk5LFxuICByZWQ6IDB4ZmYwMDAwLFxuICByb3N5YnJvd246IDB4YmM4ZjhmLFxuICByb3lhbGJsdWU6IDB4NDE2OWUxLFxuICBzYWRkbGVicm93bjogMHg4YjQ1MTMsXG4gIHNhbG1vbjogMHhmYTgwNzIsXG4gIHNhbmR5YnJvd246IDB4ZjRhNDYwLFxuICBzZWFncmVlbjogMHgyZThiNTcsXG4gIHNlYXNoZWxsOiAweGZmZjVlZSxcbiAgc2llbm5hOiAweGEwNTIyZCxcbiAgc2lsdmVyOiAweGMwYzBjMCxcbiAgc2t5Ymx1ZTogMHg4N2NlZWIsXG4gIHNsYXRlYmx1ZTogMHg2YTVhY2QsXG4gIHNsYXRlZ3JheTogMHg3MDgwOTAsXG4gIHNsYXRlZ3JleTogMHg3MDgwOTAsXG4gIHNub3c6IDB4ZmZmYWZhLFxuICBzcHJpbmdncmVlbjogMHgwMGZmN2YsXG4gIHN0ZWVsYmx1ZTogMHg0NjgyYjQsXG4gIHRhbjogMHhkMmI0OGMsXG4gIHRlYWw6IDB4MDA4MDgwLFxuICB0aGlzdGxlOiAweGQ4YmZkOCxcbiAgdG9tYXRvOiAweGZmNjM0NyxcbiAgdHVycXVvaXNlOiAweDQwZTBkMCxcbiAgdmlvbGV0OiAweGVlODJlZSxcbiAgd2hlYXQ6IDB4ZjVkZWIzLFxuICB3aGl0ZTogMHhmZmZmZmYsXG4gIHdoaXRlc21va2U6IDB4ZjVmNWY1LFxuICB5ZWxsb3c6IDB4ZmZmZjAwLFxuICB5ZWxsb3dncmVlbjogMHg5YWNkMzJcbn07XG5cbmRlZmluZShDb2xvciwgY29sb3IsIHtcbiAgY29weShjaGFubmVscykge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyB0aGlzLmNvbnN0cnVjdG9yLCB0aGlzLCBjaGFubmVscyk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiB0aGlzLnJnYigpLmRpc3BsYXlhYmxlKCk7XG4gIH0sXG4gIGhleDogY29sb3JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IGNvbG9yX2Zvcm1hdEhleCxcbiAgZm9ybWF0SGV4ODogY29sb3JfZm9ybWF0SGV4OCxcbiAgZm9ybWF0SHNsOiBjb2xvcl9mb3JtYXRIc2wsXG4gIGZvcm1hdFJnYjogY29sb3JfZm9ybWF0UmdiLFxuICB0b1N0cmluZzogY29sb3JfZm9ybWF0UmdiXG59KTtcblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4KCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRIZXgoKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4OCgpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0SGV4OCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRIc2woKSB7XG4gIHJldHVybiBoc2xDb252ZXJ0KHRoaXMpLmZvcm1hdEhzbCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRSZ2IoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdFJnYigpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb2xvcihmb3JtYXQpIHtcbiAgdmFyIG0sIGw7XG4gIGZvcm1hdCA9IChmb3JtYXQgKyBcIlwiKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIChtID0gcmVIZXguZXhlYyhmb3JtYXQpKSA/IChsID0gbVsxXS5sZW5ndGgsIG0gPSBwYXJzZUludChtWzFdLCAxNiksIGwgPT09IDYgPyByZ2JuKG0pIC8vICNmZjAwMDBcbiAgICAgIDogbCA9PT0gMyA/IG5ldyBSZ2IoKG0gPj4gOCAmIDB4ZikgfCAobSA+PiA0ICYgMHhmMCksIChtID4+IDQgJiAweGYpIHwgKG0gJiAweGYwKSwgKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSwgMSkgLy8gI2YwMFxuICAgICAgOiBsID09PSA4ID8gcmdiYShtID4+IDI0ICYgMHhmZiwgbSA+PiAxNiAmIDB4ZmYsIG0gPj4gOCAmIDB4ZmYsIChtICYgMHhmZikgLyAweGZmKSAvLyAjZmYwMDAwMDBcbiAgICAgIDogbCA9PT0gNCA/IHJnYmEoKG0gPj4gMTIgJiAweGYpIHwgKG0gPj4gOCAmIDB4ZjApLCAobSA+PiA4ICYgMHhmKSB8IChtID4+IDQgJiAweGYwKSwgKG0gPj4gNCAmIDB4ZikgfCAobSAmIDB4ZjApLCAoKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSkgLyAweGZmKSAvLyAjZjAwMFxuICAgICAgOiBudWxsKSAvLyBpbnZhbGlkIGhleFxuICAgICAgOiAobSA9IHJlUmdiSW50ZWdlci5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdLCBtWzJdLCBtWzNdLCAxKSAvLyByZ2IoMjU1LCAwLCAwKVxuICAgICAgOiAobSA9IHJlUmdiUGVyY2VudC5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCAxKSAvLyByZ2IoMTAwJSwgMCUsIDAlKVxuICAgICAgOiAobSA9IHJlUmdiYUludGVnZXIuZXhlYyhmb3JtYXQpKSA/IHJnYmEobVsxXSwgbVsyXSwgbVszXSwgbVs0XSkgLy8gcmdiYSgyNTUsIDAsIDAsIDEpXG4gICAgICA6IChtID0gcmVSZ2JhUGVyY2VudC5leGVjKGZvcm1hdCkpID8gcmdiYShtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCBtWzRdKSAvLyByZ2IoMTAwJSwgMCUsIDAlLCAxKVxuICAgICAgOiAobSA9IHJlSHNsUGVyY2VudC5leGVjKGZvcm1hdCkpID8gaHNsYShtWzFdLCBtWzJdIC8gMTAwLCBtWzNdIC8gMTAwLCAxKSAvLyBoc2woMTIwLCA1MCUsIDUwJSlcbiAgICAgIDogKG0gPSByZUhzbGFQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyBoc2xhKG1bMV0sIG1bMl0gLyAxMDAsIG1bM10gLyAxMDAsIG1bNF0pIC8vIGhzbGEoMTIwLCA1MCUsIDUwJSwgMSlcbiAgICAgIDogbmFtZWQuaGFzT3duUHJvcGVydHkoZm9ybWF0KSA/IHJnYm4obmFtZWRbZm9ybWF0XSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgICAgIDogZm9ybWF0ID09PSBcInRyYW5zcGFyZW50XCIgPyBuZXcgUmdiKE5hTiwgTmFOLCBOYU4sIDApXG4gICAgICA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIHJnYm4obikge1xuICByZXR1cm4gbmV3IFJnYihuID4+IDE2ICYgMHhmZiwgbiA+PiA4ICYgMHhmZiwgbiAmIDB4ZmYsIDEpO1xufVxuXG5mdW5jdGlvbiByZ2JhKHIsIGcsIGIsIGEpIHtcbiAgaWYgKGEgPD0gMCkgciA9IGcgPSBiID0gTmFOO1xuICByZXR1cm4gbmV3IFJnYihyLCBnLCBiLCBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYkNvbnZlcnQobykge1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBSZ2I7XG4gIG8gPSBvLnJnYigpO1xuICByZXR1cm4gbmV3IFJnYihvLnIsIG8uZywgby5iLCBvLm9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmdiKHIsIGcsIGIsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyByZ2JDb252ZXJ0KHIpIDogbmV3IFJnYihyLCBnLCBiLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZ2IociwgZywgYiwgb3BhY2l0eSkge1xuICB0aGlzLnIgPSArcjtcbiAgdGhpcy5nID0gK2c7XG4gIHRoaXMuYiA9ICtiO1xuICB0aGlzLm9wYWNpdHkgPSArb3BhY2l0eTtcbn1cblxuZGVmaW5lKFJnYiwgcmdiLCBleHRlbmQoQ29sb3IsIHtcbiAgYnJpZ2h0ZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBicmlnaHRlciA6IE1hdGgucG93KGJyaWdodGVyLCBrKTtcbiAgICByZXR1cm4gbmV3IFJnYih0aGlzLnIgKiBrLCB0aGlzLmcgKiBrLCB0aGlzLmIgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBkYXJrZXIgOiBNYXRoLnBvdyhkYXJrZXIsIGspO1xuICAgIHJldHVybiBuZXcgUmdiKHRoaXMuciAqIGssIHRoaXMuZyAqIGssIHRoaXMuYiAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY2xhbXAoKSB7XG4gICAgcmV0dXJuIG5ldyBSZ2IoY2xhbXBpKHRoaXMuciksIGNsYW1waSh0aGlzLmcpLCBjbGFtcGkodGhpcy5iKSwgY2xhbXBhKHRoaXMub3BhY2l0eSkpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gKC0wLjUgPD0gdGhpcy5yICYmIHRoaXMuciA8IDI1NS41KVxuICAgICAgICAmJiAoLTAuNSA8PSB0aGlzLmcgJiYgdGhpcy5nIDwgMjU1LjUpXG4gICAgICAgICYmICgtMC41IDw9IHRoaXMuYiAmJiB0aGlzLmIgPCAyNTUuNSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5vcGFjaXR5ICYmIHRoaXMub3BhY2l0eSA8PSAxKTtcbiAgfSxcbiAgaGV4OiByZ2JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IHJnYl9mb3JtYXRIZXgsXG4gIGZvcm1hdEhleDg6IHJnYl9mb3JtYXRIZXg4LFxuICBmb3JtYXRSZ2I6IHJnYl9mb3JtYXRSZ2IsXG4gIHRvU3RyaW5nOiByZ2JfZm9ybWF0UmdiXG59KSk7XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXgoKSB7XG4gIHJldHVybiBgIyR7aGV4KHRoaXMucil9JHtoZXgodGhpcy5nKX0ke2hleCh0aGlzLmIpfWA7XG59XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXg4KCkge1xuICByZXR1cm4gYCMke2hleCh0aGlzLnIpfSR7aGV4KHRoaXMuZyl9JHtoZXgodGhpcy5iKX0ke2hleCgoaXNOYU4odGhpcy5vcGFjaXR5KSA/IDEgOiB0aGlzLm9wYWNpdHkpICogMjU1KX1gO1xufVxuXG5mdW5jdGlvbiByZ2JfZm9ybWF0UmdiKCkge1xuICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gIHJldHVybiBgJHthID09PSAxID8gXCJyZ2IoXCIgOiBcInJnYmEoXCJ9JHtjbGFtcGkodGhpcy5yKX0sICR7Y2xhbXBpKHRoaXMuZyl9LCAke2NsYW1waSh0aGlzLmIpfSR7YSA9PT0gMSA/IFwiKVwiIDogYCwgJHthfSlgfWA7XG59XG5cbmZ1bmN0aW9uIGNsYW1wYShvcGFjaXR5KSB7XG4gIHJldHVybiBpc05hTihvcGFjaXR5KSA/IDEgOiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBvcGFjaXR5KSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1waSh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKHZhbHVlKSB8fCAwKSk7XG59XG5cbmZ1bmN0aW9uIGhleCh2YWx1ZSkge1xuICB2YWx1ZSA9IGNsYW1waSh2YWx1ZSk7XG4gIHJldHVybiAodmFsdWUgPCAxNiA/IFwiMFwiIDogXCJcIikgKyB2YWx1ZS50b1N0cmluZygxNik7XG59XG5cbmZ1bmN0aW9uIGhzbGEoaCwgcywgbCwgYSkge1xuICBpZiAoYSA8PSAwKSBoID0gcyA9IGwgPSBOYU47XG4gIGVsc2UgaWYgKGwgPD0gMCB8fCBsID49IDEpIGggPSBzID0gTmFOO1xuICBlbHNlIGlmIChzIDw9IDApIGggPSBOYU47XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHNsQ29udmVydChvKSB7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbmV3IEhzbChvLmgsIG8ucywgby5sLCBvLm9wYWNpdHkpO1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBIc2w7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbztcbiAgbyA9IG8ucmdiKCk7XG4gIHZhciByID0gby5yIC8gMjU1LFxuICAgICAgZyA9IG8uZyAvIDI1NSxcbiAgICAgIGIgPSBvLmIgLyAyNTUsXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgaCA9IE5hTixcbiAgICAgIHMgPSBtYXggLSBtaW4sXG4gICAgICBsID0gKG1heCArIG1pbikgLyAyO1xuICBpZiAocykge1xuICAgIGlmIChyID09PSBtYXgpIGggPSAoZyAtIGIpIC8gcyArIChnIDwgYikgKiA2O1xuICAgIGVsc2UgaWYgKGcgPT09IG1heCkgaCA9IChiIC0gcikgLyBzICsgMjtcbiAgICBlbHNlIGggPSAociAtIGcpIC8gcyArIDQ7XG4gICAgcyAvPSBsIDwgMC41ID8gbWF4ICsgbWluIDogMiAtIG1heCAtIG1pbjtcbiAgICBoICo9IDYwO1xuICB9IGVsc2Uge1xuICAgIHMgPSBsID4gMCAmJiBsIDwgMSA/IDAgOiBoO1xuICB9XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIG8ub3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoc2woaCwgcywgbCwgb3BhY2l0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGhzbENvbnZlcnQoaCkgOiBuZXcgSHNsKGgsIHMsIGwsIG9wYWNpdHkgPT0gbnVsbCA/IDEgOiBvcGFjaXR5KTtcbn1cblxuZnVuY3Rpb24gSHNsKGgsIHMsIGwsIG9wYWNpdHkpIHtcbiAgdGhpcy5oID0gK2g7XG4gIHRoaXMucyA9ICtzO1xuICB0aGlzLmwgPSArbDtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShIc2wsIGhzbCwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gYnJpZ2h0ZXIgOiBNYXRoLnBvdyhicmlnaHRlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIGRhcmtlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGRhcmtlciA6IE1hdGgucG93KGRhcmtlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICB2YXIgaCA9IHRoaXMuaCAlIDM2MCArICh0aGlzLmggPCAwKSAqIDM2MCxcbiAgICAgICAgcyA9IGlzTmFOKGgpIHx8IGlzTmFOKHRoaXMucykgPyAwIDogdGhpcy5zLFxuICAgICAgICBsID0gdGhpcy5sLFxuICAgICAgICBtMiA9IGwgKyAobCA8IDAuNSA/IGwgOiAxIC0gbCkgKiBzLFxuICAgICAgICBtMSA9IDIgKiBsIC0gbTI7XG4gICAgcmV0dXJuIG5ldyBSZ2IoXG4gICAgICBoc2wycmdiKGggPj0gMjQwID8gaCAtIDI0MCA6IGggKyAxMjAsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGgsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGggPCAxMjAgPyBoICsgMjQwIDogaCAtIDEyMCwgbTEsIG0yKSxcbiAgICAgIHRoaXMub3BhY2l0eVxuICAgICk7XG4gIH0sXG4gIGNsYW1wKCkge1xuICAgIHJldHVybiBuZXcgSHNsKGNsYW1waCh0aGlzLmgpLCBjbGFtcHQodGhpcy5zKSwgY2xhbXB0KHRoaXMubCksIGNsYW1wYSh0aGlzLm9wYWNpdHkpKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuICgwIDw9IHRoaXMucyAmJiB0aGlzLnMgPD0gMSB8fCBpc05hTih0aGlzLnMpKVxuICAgICAgICAmJiAoMCA8PSB0aGlzLmwgJiYgdGhpcy5sIDw9IDEpXG4gICAgICAgICYmICgwIDw9IHRoaXMub3BhY2l0eSAmJiB0aGlzLm9wYWNpdHkgPD0gMSk7XG4gIH0sXG4gIGZvcm1hdEhzbCgpIHtcbiAgICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gICAgcmV0dXJuIGAke2EgPT09IDEgPyBcImhzbChcIiA6IFwiaHNsYShcIn0ke2NsYW1waCh0aGlzLmgpfSwgJHtjbGFtcHQodGhpcy5zKSAqIDEwMH0lLCAke2NsYW1wdCh0aGlzLmwpICogMTAwfSUke2EgPT09IDEgPyBcIilcIiA6IGAsICR7YX0pYH1gO1xuICB9XG59KSk7XG5cbmZ1bmN0aW9uIGNsYW1waCh2YWx1ZSkge1xuICB2YWx1ZSA9ICh2YWx1ZSB8fCAwKSAlIDM2MDtcbiAgcmV0dXJuIHZhbHVlIDwgMCA/IHZhbHVlICsgMzYwIDogdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNsYW1wdCh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdmFsdWUgfHwgMCkpO1xufVxuXG4vKiBGcm9tIEZ2RCAxMy4zNywgQ1NTIENvbG9yIE1vZHVsZSBMZXZlbCAzICovXG5mdW5jdGlvbiBoc2wycmdiKGgsIG0xLCBtMikge1xuICByZXR1cm4gKGggPCA2MCA/IG0xICsgKG0yIC0gbTEpICogaCAvIDYwXG4gICAgICA6IGggPCAxODAgPyBtMlxuICAgICAgOiBoIDwgMjQwID8gbTEgKyAobTIgLSBtMSkgKiAoMjQwIC0gaCkgLyA2MFxuICAgICAgOiBtMSkgKiAyNTU7XG59XG4iLCJleHBvcnQgZGVmYXVsdCB4ID0+ICgpID0+IHg7XG4iLCJpbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcblxuZnVuY3Rpb24gbGluZWFyKGEsIGQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYSArIHQgKiBkO1xuICB9O1xufVxuXG5mdW5jdGlvbiBleHBvbmVudGlhbChhLCBiLCB5KSB7XG4gIHJldHVybiBhID0gTWF0aC5wb3coYSwgeSksIGIgPSBNYXRoLnBvdyhiLCB5KSAtIGEsIHkgPSAxIC8geSwgZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBNYXRoLnBvdyhhICsgdCAqIGIsIHkpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHVlKGEsIGIpIHtcbiAgdmFyIGQgPSBiIC0gYTtcbiAgcmV0dXJuIGQgPyBsaW5lYXIoYSwgZCA+IDE4MCB8fCBkIDwgLTE4MCA/IGQgLSAzNjAgKiBNYXRoLnJvdW5kKGQgLyAzNjApIDogZCkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdhbW1hKHkpIHtcbiAgcmV0dXJuICh5ID0gK3kpID09PSAxID8gbm9nYW1tYSA6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYiAtIGEgPyBleHBvbmVudGlhbChhLCBiLCB5KSA6IGNvbnN0YW50KGlzTmFOKGEpID8gYiA6IGEpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBub2dhbW1hKGEsIGIpIHtcbiAgdmFyIGQgPSBiIC0gYTtcbiAgcmV0dXJuIGQgPyBsaW5lYXIoYSwgZCkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbn1cbiIsImltcG9ydCB7cmdiIGFzIGNvbG9yUmdifSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCBiYXNpcyBmcm9tIFwiLi9iYXNpcy5qc1wiO1xuaW1wb3J0IGJhc2lzQ2xvc2VkIGZyb20gXCIuL2Jhc2lzQ2xvc2VkLmpzXCI7XG5pbXBvcnQgbm9nYW1tYSwge2dhbW1hfSBmcm9tIFwiLi9jb2xvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gcmdiR2FtbWEoeSkge1xuICB2YXIgY29sb3IgPSBnYW1tYSh5KTtcblxuICBmdW5jdGlvbiByZ2Ioc3RhcnQsIGVuZCkge1xuICAgIHZhciByID0gY29sb3IoKHN0YXJ0ID0gY29sb3JSZ2Ioc3RhcnQpKS5yLCAoZW5kID0gY29sb3JSZ2IoZW5kKSkuciksXG4gICAgICAgIGcgPSBjb2xvcihzdGFydC5nLCBlbmQuZyksXG4gICAgICAgIGIgPSBjb2xvcihzdGFydC5iLCBlbmQuYiksXG4gICAgICAgIG9wYWNpdHkgPSBub2dhbW1hKHN0YXJ0Lm9wYWNpdHksIGVuZC5vcGFjaXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgc3RhcnQuciA9IHIodCk7XG4gICAgICBzdGFydC5nID0gZyh0KTtcbiAgICAgIHN0YXJ0LmIgPSBiKHQpO1xuICAgICAgc3RhcnQub3BhY2l0eSA9IG9wYWNpdHkodCk7XG4gICAgICByZXR1cm4gc3RhcnQgKyBcIlwiO1xuICAgIH07XG4gIH1cblxuICByZ2IuZ2FtbWEgPSByZ2JHYW1tYTtcblxuICByZXR1cm4gcmdiO1xufSkoMSk7XG5cbmZ1bmN0aW9uIHJnYlNwbGluZShzcGxpbmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbG9ycykge1xuICAgIHZhciBuID0gY29sb3JzLmxlbmd0aCxcbiAgICAgICAgciA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgZyA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgYiA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgaSwgY29sb3I7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgY29sb3IgPSBjb2xvclJnYihjb2xvcnNbaV0pO1xuICAgICAgcltpXSA9IGNvbG9yLnIgfHwgMDtcbiAgICAgIGdbaV0gPSBjb2xvci5nIHx8IDA7XG4gICAgICBiW2ldID0gY29sb3IuYiB8fCAwO1xuICAgIH1cbiAgICByID0gc3BsaW5lKHIpO1xuICAgIGcgPSBzcGxpbmUoZyk7XG4gICAgYiA9IHNwbGluZShiKTtcbiAgICBjb2xvci5vcGFjaXR5ID0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgY29sb3IuciA9IHIodCk7XG4gICAgICBjb2xvci5nID0gZyh0KTtcbiAgICAgIGNvbG9yLmIgPSBiKHQpO1xuICAgICAgcmV0dXJuIGNvbG9yICsgXCJcIjtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIHJnYkJhc2lzID0gcmdiU3BsaW5lKGJhc2lzKTtcbmV4cG9ydCB2YXIgcmdiQmFzaXNDbG9zZWQgPSByZ2JTcGxpbmUoYmFzaXNDbG9zZWQpO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICBpZiAoIWIpIGIgPSBbXTtcbiAgdmFyIG4gPSBhID8gTWF0aC5taW4oYi5sZW5ndGgsIGEubGVuZ3RoKSA6IDAsXG4gICAgICBjID0gYi5zbGljZSgpLFxuICAgICAgaTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSBjW2ldID0gYVtpXSAqICgxIC0gdCkgKyBiW2ldICogdDtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtYmVyQXJyYXkoeCkge1xuICByZXR1cm4gQXJyYXlCdWZmZXIuaXNWaWV3KHgpICYmICEoeCBpbnN0YW5jZW9mIERhdGFWaWV3KTtcbn1cbiIsImltcG9ydCB2YWx1ZSBmcm9tIFwiLi92YWx1ZS5qc1wiO1xuaW1wb3J0IG51bWJlckFycmF5LCB7aXNOdW1iZXJBcnJheX0gZnJvbSBcIi4vbnVtYmVyQXJyYXkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gKGlzTnVtYmVyQXJyYXkoYikgPyBudW1iZXJBcnJheSA6IGdlbmVyaWNBcnJheSkoYSwgYik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmljQXJyYXkoYSwgYikge1xuICB2YXIgbmIgPSBiID8gYi5sZW5ndGggOiAwLFxuICAgICAgbmEgPSBhID8gTWF0aC5taW4obmIsIGEubGVuZ3RoKSA6IDAsXG4gICAgICB4ID0gbmV3IEFycmF5KG5hKSxcbiAgICAgIGMgPSBuZXcgQXJyYXkobmIpLFxuICAgICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgbmE7ICsraSkgeFtpXSA9IHZhbHVlKGFbaV0sIGJbaV0pO1xuICBmb3IgKDsgaSA8IG5iOyArK2kpIGNbaV0gPSBiW2ldO1xuXG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG5hOyArK2kpIGNbaV0gPSB4W2ldKHQpO1xuICAgIHJldHVybiBjO1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgZCA9IG5ldyBEYXRlO1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gZC5zZXRUaW1lKGEgKiAoMSAtIHQpICsgYiAqIHQpLCBkO1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYSAqICgxIC0gdCkgKyBiICogdDtcbiAgfTtcbn1cbiIsImltcG9ydCB2YWx1ZSBmcm9tIFwiLi92YWx1ZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBpID0ge30sXG4gICAgICBjID0ge30sXG4gICAgICBrO1xuXG4gIGlmIChhID09PSBudWxsIHx8IHR5cGVvZiBhICE9PSBcIm9iamVjdFwiKSBhID0ge307XG4gIGlmIChiID09PSBudWxsIHx8IHR5cGVvZiBiICE9PSBcIm9iamVjdFwiKSBiID0ge307XG5cbiAgZm9yIChrIGluIGIpIHtcbiAgICBpZiAoayBpbiBhKSB7XG4gICAgICBpW2tdID0gdmFsdWUoYVtrXSwgYltrXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNba10gPSBiW2tdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChrIGluIGkpIGNba10gPSBpW2tdKHQpO1xuICAgIHJldHVybiBjO1xuICB9O1xufVxuIiwiaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxudmFyIHJlQSA9IC9bLStdPyg/OlxcZCtcXC4/XFxkKnxcXC4/XFxkKykoPzpbZUVdWy0rXT9cXGQrKT8vZyxcbiAgICByZUIgPSBuZXcgUmVnRXhwKHJlQS5zb3VyY2UsIFwiZ1wiKTtcblxuZnVuY3Rpb24gemVybyhiKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25lKGIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYih0KSArIFwiXCI7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGJpID0gcmVBLmxhc3RJbmRleCA9IHJlQi5sYXN0SW5kZXggPSAwLCAvLyBzY2FuIGluZGV4IGZvciBuZXh0IG51bWJlciBpbiBiXG4gICAgICBhbSwgLy8gY3VycmVudCBtYXRjaCBpbiBhXG4gICAgICBibSwgLy8gY3VycmVudCBtYXRjaCBpbiBiXG4gICAgICBicywgLy8gc3RyaW5nIHByZWNlZGluZyBjdXJyZW50IG51bWJlciBpbiBiLCBpZiBhbnlcbiAgICAgIGkgPSAtMSwgLy8gaW5kZXggaW4gc1xuICAgICAgcyA9IFtdLCAvLyBzdHJpbmcgY29uc3RhbnRzIGFuZCBwbGFjZWhvbGRlcnNcbiAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcblxuICAvLyBDb2VyY2UgaW5wdXRzIHRvIHN0cmluZ3MuXG4gIGEgPSBhICsgXCJcIiwgYiA9IGIgKyBcIlwiO1xuXG4gIC8vIEludGVycG9sYXRlIHBhaXJzIG9mIG51bWJlcnMgaW4gYSAmIGIuXG4gIHdoaWxlICgoYW0gPSByZUEuZXhlYyhhKSlcbiAgICAgICYmIChibSA9IHJlQi5leGVjKGIpKSkge1xuICAgIGlmICgoYnMgPSBibS5pbmRleCkgPiBiaSkgeyAvLyBhIHN0cmluZyBwcmVjZWRlcyB0aGUgbmV4dCBudW1iZXIgaW4gYlxuICAgICAgYnMgPSBiLnNsaWNlKGJpLCBicyk7XG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYnM7XG4gICAgfVxuICAgIGlmICgoYW0gPSBhbVswXSkgPT09IChibSA9IGJtWzBdKSkgeyAvLyBudW1iZXJzIGluIGEgJiBiIG1hdGNoXG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBibTsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYm07XG4gICAgfSBlbHNlIHsgLy8gaW50ZXJwb2xhdGUgbm9uLW1hdGNoaW5nIG51bWJlcnNcbiAgICAgIHNbKytpXSA9IG51bGw7XG4gICAgICBxLnB1c2goe2k6IGksIHg6IG51bWJlcihhbSwgYm0pfSk7XG4gICAgfVxuICAgIGJpID0gcmVCLmxhc3RJbmRleDtcbiAgfVxuXG4gIC8vIEFkZCByZW1haW5zIG9mIGIuXG4gIGlmIChiaSA8IGIubGVuZ3RoKSB7XG4gICAgYnMgPSBiLnNsaWNlKGJpKTtcbiAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICBlbHNlIHNbKytpXSA9IGJzO1xuICB9XG5cbiAgLy8gU3BlY2lhbCBvcHRpbWl6YXRpb24gZm9yIG9ubHkgYSBzaW5nbGUgbWF0Y2guXG4gIC8vIE90aGVyd2lzZSwgaW50ZXJwb2xhdGUgZWFjaCBvZiB0aGUgbnVtYmVycyBhbmQgcmVqb2luIHRoZSBzdHJpbmcuXG4gIHJldHVybiBzLmxlbmd0aCA8IDIgPyAocVswXVxuICAgICAgPyBvbmUocVswXS54KVxuICAgICAgOiB6ZXJvKGIpKVxuICAgICAgOiAoYiA9IHEubGVuZ3RoLCBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG87IGkgPCBiOyArK2kpIHNbKG8gPSBxW2ldKS5pXSA9IG8ueCh0KTtcbiAgICAgICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgICAgICB9KTtcbn1cbiIsImltcG9ydCB7Y29sb3J9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IHJnYiBmcm9tIFwiLi9yZ2IuanNcIjtcbmltcG9ydCB7Z2VuZXJpY0FycmF5fSBmcm9tIFwiLi9hcnJheS5qc1wiO1xuaW1wb3J0IGRhdGUgZnJvbSBcIi4vZGF0ZS5qc1wiO1xuaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcbmltcG9ydCBvYmplY3QgZnJvbSBcIi4vb2JqZWN0LmpzXCI7XG5pbXBvcnQgc3RyaW5nIGZyb20gXCIuL3N0cmluZy5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgbnVtYmVyQXJyYXksIHtpc051bWJlckFycmF5fSBmcm9tIFwiLi9udW1iZXJBcnJheS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciB0ID0gdHlwZW9mIGIsIGM7XG4gIHJldHVybiBiID09IG51bGwgfHwgdCA9PT0gXCJib29sZWFuXCIgPyBjb25zdGFudChiKVxuICAgICAgOiAodCA9PT0gXCJudW1iZXJcIiA/IG51bWJlclxuICAgICAgOiB0ID09PSBcInN0cmluZ1wiID8gKChjID0gY29sb3IoYikpID8gKGIgPSBjLCByZ2IpIDogc3RyaW5nKVxuICAgICAgOiBiIGluc3RhbmNlb2YgY29sb3IgPyByZ2JcbiAgICAgIDogYiBpbnN0YW5jZW9mIERhdGUgPyBkYXRlXG4gICAgICA6IGlzTnVtYmVyQXJyYXkoYikgPyBudW1iZXJBcnJheVxuICAgICAgOiBBcnJheS5pc0FycmF5KGIpID8gZ2VuZXJpY0FycmF5XG4gICAgICA6IHR5cGVvZiBiLnZhbHVlT2YgIT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgYi50b1N0cmluZyAhPT0gXCJmdW5jdGlvblwiIHx8IGlzTmFOKGIpID8gb2JqZWN0XG4gICAgICA6IG51bWJlcikoYSwgYik7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBhID0gK2EsIGIgPSArYiwgZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKGEgKiAoMSAtIHQpICsgYiAqIHQpO1xuICB9O1xufVxuIiwidmFyIGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJO1xuXG5leHBvcnQgdmFyIGlkZW50aXR5ID0ge1xuICB0cmFuc2xhdGVYOiAwLFxuICB0cmFuc2xhdGVZOiAwLFxuICByb3RhdGU6IDAsXG4gIHNrZXdYOiAwLFxuICBzY2FsZVg6IDEsXG4gIHNjYWxlWTogMVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYiwgYywgZCwgZSwgZikge1xuICB2YXIgc2NhbGVYLCBzY2FsZVksIHNrZXdYO1xuICBpZiAoc2NhbGVYID0gTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIpKSBhIC89IHNjYWxlWCwgYiAvPSBzY2FsZVg7XG4gIGlmIChza2V3WCA9IGEgKiBjICsgYiAqIGQpIGMgLT0gYSAqIHNrZXdYLCBkIC09IGIgKiBza2V3WDtcbiAgaWYgKHNjYWxlWSA9IE1hdGguc3FydChjICogYyArIGQgKiBkKSkgYyAvPSBzY2FsZVksIGQgLz0gc2NhbGVZLCBza2V3WCAvPSBzY2FsZVk7XG4gIGlmIChhICogZCA8IGIgKiBjKSBhID0gLWEsIGIgPSAtYiwgc2tld1ggPSAtc2tld1gsIHNjYWxlWCA9IC1zY2FsZVg7XG4gIHJldHVybiB7XG4gICAgdHJhbnNsYXRlWDogZSxcbiAgICB0cmFuc2xhdGVZOiBmLFxuICAgIHJvdGF0ZTogTWF0aC5hdGFuMihiLCBhKSAqIGRlZ3JlZXMsXG4gICAgc2tld1g6IE1hdGguYXRhbihza2V3WCkgKiBkZWdyZWVzLFxuICAgIHNjYWxlWDogc2NhbGVYLFxuICAgIHNjYWxlWTogc2NhbGVZXG4gIH07XG59XG4iLCJpbXBvcnQgZGVjb21wb3NlLCB7aWRlbnRpdHl9IGZyb20gXCIuL2RlY29tcG9zZS5qc1wiO1xuXG52YXIgc3ZnTm9kZTtcblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNzcyh2YWx1ZSkge1xuICBjb25zdCBtID0gbmV3ICh0eXBlb2YgRE9NTWF0cml4ID09PSBcImZ1bmN0aW9uXCIgPyBET01NYXRyaXggOiBXZWJLaXRDU1NNYXRyaXgpKHZhbHVlICsgXCJcIik7XG4gIHJldHVybiBtLmlzSWRlbnRpdHkgPyBpZGVudGl0eSA6IGRlY29tcG9zZShtLmEsIG0uYiwgbS5jLCBtLmQsIG0uZSwgbS5mKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU3ZnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gaWRlbnRpdHk7XG4gIGlmICghc3ZnTm9kZSkgc3ZnTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiZ1wiKTtcbiAgc3ZnTm9kZS5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgdmFsdWUpO1xuICBpZiAoISh2YWx1ZSA9IHN2Z05vZGUudHJhbnNmb3JtLmJhc2VWYWwuY29uc29saWRhdGUoKSkpIHJldHVybiBpZGVudGl0eTtcbiAgdmFsdWUgPSB2YWx1ZS5tYXRyaXg7XG4gIHJldHVybiBkZWNvbXBvc2UodmFsdWUuYSwgdmFsdWUuYiwgdmFsdWUuYywgdmFsdWUuZCwgdmFsdWUuZSwgdmFsdWUuZik7XG59XG4iLCJpbXBvcnQgbnVtYmVyIGZyb20gXCIuLi9udW1iZXIuanNcIjtcbmltcG9ydCB7cGFyc2VDc3MsIHBhcnNlU3ZnfSBmcm9tIFwiLi9wYXJzZS5qc1wiO1xuXG5mdW5jdGlvbiBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZSwgcHhDb21tYSwgcHhQYXJlbiwgZGVnUGFyZW4pIHtcblxuICBmdW5jdGlvbiBwb3Aocykge1xuICAgIHJldHVybiBzLmxlbmd0aCA/IHMucG9wKCkgKyBcIiBcIiA6IFwiXCI7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFuc2xhdGUoeGEsIHlhLCB4YiwgeWIsIHMsIHEpIHtcbiAgICBpZiAoeGEgIT09IHhiIHx8IHlhICE9PSB5Yikge1xuICAgICAgdmFyIGkgPSBzLnB1c2goXCJ0cmFuc2xhdGUoXCIsIG51bGwsIHB4Q29tbWEsIG51bGwsIHB4UGFyZW4pO1xuICAgICAgcS5wdXNoKHtpOiBpIC0gNCwgeDogbnVtYmVyKHhhLCB4Yil9LCB7aTogaSAtIDIsIHg6IG51bWJlcih5YSwgeWIpfSk7XG4gICAgfSBlbHNlIGlmICh4YiB8fCB5Yikge1xuICAgICAgcy5wdXNoKFwidHJhbnNsYXRlKFwiICsgeGIgKyBweENvbW1hICsgeWIgKyBweFBhcmVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByb3RhdGUoYSwgYiwgcywgcSkge1xuICAgIGlmIChhICE9PSBiKSB7XG4gICAgICBpZiAoYSAtIGIgPiAxODApIGIgKz0gMzYwOyBlbHNlIGlmIChiIC0gYSA+IDE4MCkgYSArPSAzNjA7IC8vIHNob3J0ZXN0IHBhdGhcbiAgICAgIHEucHVzaCh7aTogcy5wdXNoKHBvcChzKSArIFwicm90YXRlKFwiLCBudWxsLCBkZWdQYXJlbikgLSAyLCB4OiBudW1iZXIoYSwgYil9KTtcbiAgICB9IGVsc2UgaWYgKGIpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInJvdGF0ZShcIiArIGIgKyBkZWdQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2tld1goYSwgYiwgcywgcSkge1xuICAgIGlmIChhICE9PSBiKSB7XG4gICAgICBxLnB1c2goe2k6IHMucHVzaChwb3AocykgKyBcInNrZXdYKFwiLCBudWxsLCBkZWdQYXJlbikgLSAyLCB4OiBudW1iZXIoYSwgYil9KTtcbiAgICB9IGVsc2UgaWYgKGIpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInNrZXdYKFwiICsgYiArIGRlZ1BhcmVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzY2FsZSh4YSwgeWEsIHhiLCB5YiwgcywgcSkge1xuICAgIGlmICh4YSAhPT0geGIgfHwgeWEgIT09IHliKSB7XG4gICAgICB2YXIgaSA9IHMucHVzaChwb3AocykgKyBcInNjYWxlKFwiLCBudWxsLCBcIixcIiwgbnVsbCwgXCIpXCIpO1xuICAgICAgcS5wdXNoKHtpOiBpIC0gNCwgeDogbnVtYmVyKHhhLCB4Yil9LCB7aTogaSAtIDIsIHg6IG51bWJlcih5YSwgeWIpfSk7XG4gICAgfSBlbHNlIGlmICh4YiAhPT0gMSB8fCB5YiAhPT0gMSkge1xuICAgICAgcy5wdXNoKHBvcChzKSArIFwic2NhbGUoXCIgKyB4YiArIFwiLFwiICsgeWIgKyBcIilcIik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgcyA9IFtdLCAvLyBzdHJpbmcgY29uc3RhbnRzIGFuZCBwbGFjZWhvbGRlcnNcbiAgICAgICAgcSA9IFtdOyAvLyBudW1iZXIgaW50ZXJwb2xhdG9yc1xuICAgIGEgPSBwYXJzZShhKSwgYiA9IHBhcnNlKGIpO1xuICAgIHRyYW5zbGF0ZShhLnRyYW5zbGF0ZVgsIGEudHJhbnNsYXRlWSwgYi50cmFuc2xhdGVYLCBiLnRyYW5zbGF0ZVksIHMsIHEpO1xuICAgIHJvdGF0ZShhLnJvdGF0ZSwgYi5yb3RhdGUsIHMsIHEpO1xuICAgIHNrZXdYKGEuc2tld1gsIGIuc2tld1gsIHMsIHEpO1xuICAgIHNjYWxlKGEuc2NhbGVYLCBhLnNjYWxlWSwgYi5zY2FsZVgsIGIuc2NhbGVZLCBzLCBxKTtcbiAgICBhID0gYiA9IG51bGw7IC8vIGdjXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHZhciBpID0gLTEsIG4gPSBxLmxlbmd0aCwgbztcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBzWyhvID0gcVtpXSkuaV0gPSBvLngodCk7XG4gICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgIH07XG4gIH07XG59XG5cbmV4cG9ydCB2YXIgaW50ZXJwb2xhdGVUcmFuc2Zvcm1Dc3MgPSBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZUNzcywgXCJweCwgXCIsIFwicHgpXCIsIFwiZGVnKVwiKTtcbmV4cG9ydCB2YXIgaW50ZXJwb2xhdGVUcmFuc2Zvcm1TdmcgPSBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZVN2ZywgXCIsIFwiLCBcIilcIiwgXCIpXCIpO1xuIiwidmFyIGZyYW1lID0gMCwgLy8gaXMgYW4gYW5pbWF0aW9uIGZyYW1lIHBlbmRpbmc/XG4gICAgdGltZW91dCA9IDAsIC8vIGlzIGEgdGltZW91dCBwZW5kaW5nP1xuICAgIGludGVydmFsID0gMCwgLy8gYXJlIGFueSB0aW1lcnMgYWN0aXZlP1xuICAgIHBva2VEZWxheSA9IDEwMDAsIC8vIGhvdyBmcmVxdWVudGx5IHdlIGNoZWNrIGZvciBjbG9jayBza2V3XG4gICAgdGFza0hlYWQsXG4gICAgdGFza1RhaWwsXG4gICAgY2xvY2tMYXN0ID0gMCxcbiAgICBjbG9ja05vdyA9IDAsXG4gICAgY2xvY2tTa2V3ID0gMCxcbiAgICBjbG9jayA9IHR5cGVvZiBwZXJmb3JtYW5jZSA9PT0gXCJvYmplY3RcIiAmJiBwZXJmb3JtYW5jZS5ub3cgPyBwZXJmb3JtYW5jZSA6IERhdGUsXG4gICAgc2V0RnJhbWUgPSB0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiICYmIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQod2luZG93KSA6IGZ1bmN0aW9uKGYpIHsgc2V0VGltZW91dChmLCAxNyk7IH07XG5cbmV4cG9ydCBmdW5jdGlvbiBub3coKSB7XG4gIHJldHVybiBjbG9ja05vdyB8fCAoc2V0RnJhbWUoY2xlYXJOb3cpLCBjbG9ja05vdyA9IGNsb2NrLm5vdygpICsgY2xvY2tTa2V3KTtcbn1cblxuZnVuY3Rpb24gY2xlYXJOb3coKSB7XG4gIGNsb2NrTm93ID0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRpbWVyKCkge1xuICB0aGlzLl9jYWxsID1cbiAgdGhpcy5fdGltZSA9XG4gIHRoaXMuX25leHQgPSBudWxsO1xufVxuXG5UaW1lci5wcm90b3R5cGUgPSB0aW1lci5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUaW1lcixcbiAgcmVzdGFydDogZnVuY3Rpb24oY2FsbGJhY2ssIGRlbGF5LCB0aW1lKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY2FsbGJhY2sgaXMgbm90IGEgZnVuY3Rpb25cIik7XG4gICAgdGltZSA9ICh0aW1lID09IG51bGwgPyBub3coKSA6ICt0aW1lKSArIChkZWxheSA9PSBudWxsID8gMCA6ICtkZWxheSk7XG4gICAgaWYgKCF0aGlzLl9uZXh0ICYmIHRhc2tUYWlsICE9PSB0aGlzKSB7XG4gICAgICBpZiAodGFza1RhaWwpIHRhc2tUYWlsLl9uZXh0ID0gdGhpcztcbiAgICAgIGVsc2UgdGFza0hlYWQgPSB0aGlzO1xuICAgICAgdGFza1RhaWwgPSB0aGlzO1xuICAgIH1cbiAgICB0aGlzLl9jYWxsID0gY2FsbGJhY2s7XG4gICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgc2xlZXAoKTtcbiAgfSxcbiAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2NhbGwpIHtcbiAgICAgIHRoaXMuX2NhbGwgPSBudWxsO1xuICAgICAgdGhpcy5fdGltZSA9IEluZmluaXR5O1xuICAgICAgc2xlZXAoKTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lcihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgdmFyIHQgPSBuZXcgVGltZXI7XG4gIHQucmVzdGFydChjYWxsYmFjaywgZGVsYXksIHRpbWUpO1xuICByZXR1cm4gdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVyRmx1c2goKSB7XG4gIG5vdygpOyAvLyBHZXQgdGhlIGN1cnJlbnQgdGltZSwgaWYgbm90IGFscmVhZHkgc2V0LlxuICArK2ZyYW1lOyAvLyBQcmV0ZW5kIHdl4oCZdmUgc2V0IGFuIGFsYXJtLCBpZiB3ZSBoYXZlbuKAmXQgYWxyZWFkeS5cbiAgdmFyIHQgPSB0YXNrSGVhZCwgZTtcbiAgd2hpbGUgKHQpIHtcbiAgICBpZiAoKGUgPSBjbG9ja05vdyAtIHQuX3RpbWUpID49IDApIHQuX2NhbGwuY2FsbCh1bmRlZmluZWQsIGUpO1xuICAgIHQgPSB0Ll9uZXh0O1xuICB9XG4gIC0tZnJhbWU7XG59XG5cbmZ1bmN0aW9uIHdha2UoKSB7XG4gIGNsb2NrTm93ID0gKGNsb2NrTGFzdCA9IGNsb2NrLm5vdygpKSArIGNsb2NrU2tldztcbiAgZnJhbWUgPSB0aW1lb3V0ID0gMDtcbiAgdHJ5IHtcbiAgICB0aW1lckZsdXNoKCk7XG4gIH0gZmluYWxseSB7XG4gICAgZnJhbWUgPSAwO1xuICAgIG5hcCgpO1xuICAgIGNsb2NrTm93ID0gMDtcbiAgfVxufVxuXG5mdW5jdGlvbiBwb2tlKCkge1xuICB2YXIgbm93ID0gY2xvY2subm93KCksIGRlbGF5ID0gbm93IC0gY2xvY2tMYXN0O1xuICBpZiAoZGVsYXkgPiBwb2tlRGVsYXkpIGNsb2NrU2tldyAtPSBkZWxheSwgY2xvY2tMYXN0ID0gbm93O1xufVxuXG5mdW5jdGlvbiBuYXAoKSB7XG4gIHZhciB0MCwgdDEgPSB0YXNrSGVhZCwgdDIsIHRpbWUgPSBJbmZpbml0eTtcbiAgd2hpbGUgKHQxKSB7XG4gICAgaWYgKHQxLl9jYWxsKSB7XG4gICAgICBpZiAodGltZSA+IHQxLl90aW1lKSB0aW1lID0gdDEuX3RpbWU7XG4gICAgICB0MCA9IHQxLCB0MSA9IHQxLl9uZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0MiA9IHQxLl9uZXh0LCB0MS5fbmV4dCA9IG51bGw7XG4gICAgICB0MSA9IHQwID8gdDAuX25leHQgPSB0MiA6IHRhc2tIZWFkID0gdDI7XG4gICAgfVxuICB9XG4gIHRhc2tUYWlsID0gdDA7XG4gIHNsZWVwKHRpbWUpO1xufVxuXG5mdW5jdGlvbiBzbGVlcCh0aW1lKSB7XG4gIGlmIChmcmFtZSkgcmV0dXJuOyAvLyBTb29uZXN0IGFsYXJtIGFscmVhZHkgc2V0LCBvciB3aWxsIGJlLlxuICBpZiAodGltZW91dCkgdGltZW91dCA9IGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgdmFyIGRlbGF5ID0gdGltZSAtIGNsb2NrTm93OyAvLyBTdHJpY3RseSBsZXNzIHRoYW4gaWYgd2UgcmVjb21wdXRlZCBjbG9ja05vdy5cbiAgaWYgKGRlbGF5ID4gMjQpIHtcbiAgICBpZiAodGltZSA8IEluZmluaXR5KSB0aW1lb3V0ID0gc2V0VGltZW91dCh3YWtlLCB0aW1lIC0gY2xvY2subm93KCkgLSBjbG9ja1NrZXcpO1xuICAgIGlmIChpbnRlcnZhbCkgaW50ZXJ2YWwgPSBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoIWludGVydmFsKSBjbG9ja0xhc3QgPSBjbG9jay5ub3coKSwgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChwb2tlLCBwb2tlRGVsYXkpO1xuICAgIGZyYW1lID0gMSwgc2V0RnJhbWUod2FrZSk7XG4gIH1cbn1cbiIsImltcG9ydCB7VGltZXJ9IGZyb20gXCIuL3RpbWVyLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICB2YXIgdCA9IG5ldyBUaW1lcjtcbiAgZGVsYXkgPSBkZWxheSA9PSBudWxsID8gMCA6ICtkZWxheTtcbiAgdC5yZXN0YXJ0KGVsYXBzZWQgPT4ge1xuICAgIHQuc3RvcCgpO1xuICAgIGNhbGxiYWNrKGVsYXBzZWQgKyBkZWxheSk7XG4gIH0sIGRlbGF5LCB0aW1lKTtcbiAgcmV0dXJuIHQ7XG59XG4iLCJpbXBvcnQge2Rpc3BhdGNofSBmcm9tIFwiZDMtZGlzcGF0Y2hcIjtcbmltcG9ydCB7dGltZXIsIHRpbWVvdXR9IGZyb20gXCJkMy10aW1lclwiO1xuXG52YXIgZW1wdHlPbiA9IGRpc3BhdGNoKFwic3RhcnRcIiwgXCJlbmRcIiwgXCJjYW5jZWxcIiwgXCJpbnRlcnJ1cHRcIik7XG52YXIgZW1wdHlUd2VlbiA9IFtdO1xuXG5leHBvcnQgdmFyIENSRUFURUQgPSAwO1xuZXhwb3J0IHZhciBTQ0hFRFVMRUQgPSAxO1xuZXhwb3J0IHZhciBTVEFSVElORyA9IDI7XG5leHBvcnQgdmFyIFNUQVJURUQgPSAzO1xuZXhwb3J0IHZhciBSVU5OSU5HID0gNDtcbmV4cG9ydCB2YXIgRU5ESU5HID0gNTtcbmV4cG9ydCB2YXIgRU5ERUQgPSA2O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlLCBuYW1lLCBpZCwgaW5kZXgsIGdyb3VwLCB0aW1pbmcpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uO1xuICBpZiAoIXNjaGVkdWxlcykgbm9kZS5fX3RyYW5zaXRpb24gPSB7fTtcbiAgZWxzZSBpZiAoaWQgaW4gc2NoZWR1bGVzKSByZXR1cm47XG4gIGNyZWF0ZShub2RlLCBpZCwge1xuICAgIG5hbWU6IG5hbWUsXG4gICAgaW5kZXg6IGluZGV4LCAvLyBGb3IgY29udGV4dCBkdXJpbmcgY2FsbGJhY2suXG4gICAgZ3JvdXA6IGdyb3VwLCAvLyBGb3IgY29udGV4dCBkdXJpbmcgY2FsbGJhY2suXG4gICAgb246IGVtcHR5T24sXG4gICAgdHdlZW46IGVtcHR5VHdlZW4sXG4gICAgdGltZTogdGltaW5nLnRpbWUsXG4gICAgZGVsYXk6IHRpbWluZy5kZWxheSxcbiAgICBkdXJhdGlvbjogdGltaW5nLmR1cmF0aW9uLFxuICAgIGVhc2U6IHRpbWluZy5lYXNlLFxuICAgIHRpbWVyOiBudWxsLFxuICAgIHN0YXRlOiBDUkVBVEVEXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBnZXQobm9kZSwgaWQpO1xuICBpZiAoc2NoZWR1bGUuc3RhdGUgPiBDUkVBVEVEKSB0aHJvdyBuZXcgRXJyb3IoXCJ0b28gbGF0ZTsgYWxyZWFkeSBzY2hlZHVsZWRcIik7XG4gIHJldHVybiBzY2hlZHVsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBnZXQobm9kZSwgaWQpO1xuICBpZiAoc2NoZWR1bGUuc3RhdGUgPiBTVEFSVEVEKSB0aHJvdyBuZXcgRXJyb3IoXCJ0b28gbGF0ZTsgYWxyZWFkeSBydW5uaW5nXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gbm9kZS5fX3RyYW5zaXRpb247XG4gIGlmICghc2NoZWR1bGUgfHwgIShzY2hlZHVsZSA9IHNjaGVkdWxlW2lkXSkpIHRocm93IG5ldyBFcnJvcihcInRyYW5zaXRpb24gbm90IGZvdW5kXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZShub2RlLCBpZCwgc2VsZikge1xuICB2YXIgc2NoZWR1bGVzID0gbm9kZS5fX3RyYW5zaXRpb24sXG4gICAgICB0d2VlbjtcblxuICAvLyBJbml0aWFsaXplIHRoZSBzZWxmIHRpbWVyIHdoZW4gdGhlIHRyYW5zaXRpb24gaXMgY3JlYXRlZC5cbiAgLy8gTm90ZSB0aGUgYWN0dWFsIGRlbGF5IGlzIG5vdCBrbm93biB1bnRpbCB0aGUgZmlyc3QgY2FsbGJhY2shXG4gIHNjaGVkdWxlc1tpZF0gPSBzZWxmO1xuICBzZWxmLnRpbWVyID0gdGltZXIoc2NoZWR1bGUsIDAsIHNlbGYudGltZSk7XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGUoZWxhcHNlZCkge1xuICAgIHNlbGYuc3RhdGUgPSBTQ0hFRFVMRUQ7XG4gICAgc2VsZi50aW1lci5yZXN0YXJ0KHN0YXJ0LCBzZWxmLmRlbGF5LCBzZWxmLnRpbWUpO1xuXG4gICAgLy8gSWYgdGhlIGVsYXBzZWQgZGVsYXkgaXMgbGVzcyB0aGFuIG91ciBmaXJzdCBzbGVlcCwgc3RhcnQgaW1tZWRpYXRlbHkuXG4gICAgaWYgKHNlbGYuZGVsYXkgPD0gZWxhcHNlZCkgc3RhcnQoZWxhcHNlZCAtIHNlbGYuZGVsYXkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnQoZWxhcHNlZCkge1xuICAgIHZhciBpLCBqLCBuLCBvO1xuXG4gICAgLy8gSWYgdGhlIHN0YXRlIGlzIG5vdCBTQ0hFRFVMRUQsIHRoZW4gd2UgcHJldmlvdXNseSBlcnJvcmVkIG9uIHN0YXJ0LlxuICAgIGlmIChzZWxmLnN0YXRlICE9PSBTQ0hFRFVMRUQpIHJldHVybiBzdG9wKCk7XG5cbiAgICBmb3IgKGkgaW4gc2NoZWR1bGVzKSB7XG4gICAgICBvID0gc2NoZWR1bGVzW2ldO1xuICAgICAgaWYgKG8ubmFtZSAhPT0gc2VsZi5uYW1lKSBjb250aW51ZTtcblxuICAgICAgLy8gV2hpbGUgdGhpcyBlbGVtZW50IGFscmVhZHkgaGFzIGEgc3RhcnRpbmcgdHJhbnNpdGlvbiBkdXJpbmcgdGhpcyBmcmFtZSxcbiAgICAgIC8vIGRlZmVyIHN0YXJ0aW5nIGFuIGludGVycnVwdGluZyB0cmFuc2l0aW9uIHVudGlsIHRoYXQgdHJhbnNpdGlvbiBoYXMgYVxuICAgICAgLy8gY2hhbmNlIHRvIHRpY2sgKGFuZCBwb3NzaWJseSBlbmQpOyBzZWUgZDMvZDMtdHJhbnNpdGlvbiM1NCFcbiAgICAgIGlmIChvLnN0YXRlID09PSBTVEFSVEVEKSByZXR1cm4gdGltZW91dChzdGFydCk7XG5cbiAgICAgIC8vIEludGVycnVwdCB0aGUgYWN0aXZlIHRyYW5zaXRpb24sIGlmIGFueS5cbiAgICAgIGlmIChvLnN0YXRlID09PSBSVU5OSU5HKSB7XG4gICAgICAgIG8uc3RhdGUgPSBFTkRFRDtcbiAgICAgICAgby50aW1lci5zdG9wKCk7XG4gICAgICAgIG8ub24uY2FsbChcImludGVycnVwdFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBvLmluZGV4LCBvLmdyb3VwKTtcbiAgICAgICAgZGVsZXRlIHNjaGVkdWxlc1tpXTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2FuY2VsIGFueSBwcmUtZW1wdGVkIHRyYW5zaXRpb25zLlxuICAgICAgZWxzZSBpZiAoK2kgPCBpZCkge1xuICAgICAgICBvLnN0YXRlID0gRU5ERUQ7XG4gICAgICAgIG8udGltZXIuc3RvcCgpO1xuICAgICAgICBvLm9uLmNhbGwoXCJjYW5jZWxcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgby5pbmRleCwgby5ncm91cCk7XG4gICAgICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVmZXIgdGhlIGZpcnN0IHRpY2sgdG8gZW5kIG9mIHRoZSBjdXJyZW50IGZyYW1lOyBzZWUgZDMvZDMjMTU3Ni5cbiAgICAvLyBOb3RlIHRoZSB0cmFuc2l0aW9uIG1heSBiZSBjYW5jZWxlZCBhZnRlciBzdGFydCBhbmQgYmVmb3JlIHRoZSBmaXJzdCB0aWNrIVxuICAgIC8vIE5vdGUgdGhpcyBtdXN0IGJlIHNjaGVkdWxlZCBiZWZvcmUgdGhlIHN0YXJ0IGV2ZW50OyBzZWUgZDMvZDMtdHJhbnNpdGlvbiMxNiFcbiAgICAvLyBBc3N1bWluZyB0aGlzIGlzIHN1Y2Nlc3NmdWwsIHN1YnNlcXVlbnQgY2FsbGJhY2tzIGdvIHN0cmFpZ2h0IHRvIHRpY2suXG4gICAgdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGlmIChzZWxmLnN0YXRlID09PSBTVEFSVEVEKSB7XG4gICAgICAgIHNlbGYuc3RhdGUgPSBSVU5OSU5HO1xuICAgICAgICBzZWxmLnRpbWVyLnJlc3RhcnQodGljaywgc2VsZi5kZWxheSwgc2VsZi50aW1lKTtcbiAgICAgICAgdGljayhlbGFwc2VkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIERpc3BhdGNoIHRoZSBzdGFydCBldmVudC5cbiAgICAvLyBOb3RlIHRoaXMgbXVzdCBiZSBkb25lIGJlZm9yZSB0aGUgdHdlZW4gYXJlIGluaXRpYWxpemVkLlxuICAgIHNlbGYuc3RhdGUgPSBTVEFSVElORztcbiAgICBzZWxmLm9uLmNhbGwoXCJzdGFydFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKTtcbiAgICBpZiAoc2VsZi5zdGF0ZSAhPT0gU1RBUlRJTkcpIHJldHVybjsgLy8gaW50ZXJydXB0ZWRcbiAgICBzZWxmLnN0YXRlID0gU1RBUlRFRDtcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHR3ZWVuLCBkZWxldGluZyBudWxsIHR3ZWVuLlxuICAgIHR3ZWVuID0gbmV3IEFycmF5KG4gPSBzZWxmLnR3ZWVuLmxlbmd0aCk7XG4gICAgZm9yIChpID0gMCwgaiA9IC0xOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobyA9IHNlbGYudHdlZW5baV0udmFsdWUuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKSkge1xuICAgICAgICB0d2VlblsrK2pdID0gbztcbiAgICAgIH1cbiAgICB9XG4gICAgdHdlZW4ubGVuZ3RoID0gaiArIDE7XG4gIH1cblxuICBmdW5jdGlvbiB0aWNrKGVsYXBzZWQpIHtcbiAgICB2YXIgdCA9IGVsYXBzZWQgPCBzZWxmLmR1cmF0aW9uID8gc2VsZi5lYXNlLmNhbGwobnVsbCwgZWxhcHNlZCAvIHNlbGYuZHVyYXRpb24pIDogKHNlbGYudGltZXIucmVzdGFydChzdG9wKSwgc2VsZi5zdGF0ZSA9IEVORElORywgMSksXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IHR3ZWVuLmxlbmd0aDtcblxuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICB0d2VlbltpXS5jYWxsKG5vZGUsIHQpO1xuICAgIH1cblxuICAgIC8vIERpc3BhdGNoIHRoZSBlbmQgZXZlbnQuXG4gICAgaWYgKHNlbGYuc3RhdGUgPT09IEVORElORykge1xuICAgICAgc2VsZi5vbi5jYWxsKFwiZW5kXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIHNlbGYuaW5kZXgsIHNlbGYuZ3JvdXApO1xuICAgICAgc3RvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgc2VsZi5zdGF0ZSA9IEVOREVEO1xuICAgIHNlbGYudGltZXIuc3RvcCgpO1xuICAgIGRlbGV0ZSBzY2hlZHVsZXNbaWRdO1xuICAgIGZvciAodmFyIGkgaW4gc2NoZWR1bGVzKSByZXR1cm47IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBkZWxldGUgbm9kZS5fX3RyYW5zaXRpb247XG4gIH1cbn1cbiIsImltcG9ydCB7U1RBUlRJTkcsIEVORElORywgRU5ERUR9IGZyb20gXCIuL3RyYW5zaXRpb24vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSwgbmFtZSkge1xuICB2YXIgc2NoZWR1bGVzID0gbm9kZS5fX3RyYW5zaXRpb24sXG4gICAgICBzY2hlZHVsZSxcbiAgICAgIGFjdGl2ZSxcbiAgICAgIGVtcHR5ID0gdHJ1ZSxcbiAgICAgIGk7XG5cbiAgaWYgKCFzY2hlZHVsZXMpIHJldHVybjtcblxuICBuYW1lID0gbmFtZSA9PSBudWxsID8gbnVsbCA6IG5hbWUgKyBcIlwiO1xuXG4gIGZvciAoaSBpbiBzY2hlZHVsZXMpIHtcbiAgICBpZiAoKHNjaGVkdWxlID0gc2NoZWR1bGVzW2ldKS5uYW1lICE9PSBuYW1lKSB7IGVtcHR5ID0gZmFsc2U7IGNvbnRpbnVlOyB9XG4gICAgYWN0aXZlID0gc2NoZWR1bGUuc3RhdGUgPiBTVEFSVElORyAmJiBzY2hlZHVsZS5zdGF0ZSA8IEVORElORztcbiAgICBzY2hlZHVsZS5zdGF0ZSA9IEVOREVEO1xuICAgIHNjaGVkdWxlLnRpbWVyLnN0b3AoKTtcbiAgICBzY2hlZHVsZS5vbi5jYWxsKGFjdGl2ZSA/IFwiaW50ZXJydXB0XCIgOiBcImNhbmNlbFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzY2hlZHVsZS5pbmRleCwgc2NoZWR1bGUuZ3JvdXApO1xuICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gIH1cblxuICBpZiAoZW1wdHkpIGRlbGV0ZSBub2RlLl9fdHJhbnNpdGlvbjtcbn1cbiIsImltcG9ydCBpbnRlcnJ1cHQgZnJvbSBcIi4uL2ludGVycnVwdC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgaW50ZXJydXB0KHRoaXMsIG5hbWUpO1xuICB9KTtcbn1cbiIsImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIHR3ZWVuUmVtb3ZlKGlkLCBuYW1lKSB7XG4gIHZhciB0d2VlbjAsIHR3ZWVuMTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIHR3ZWVuID0gc2NoZWR1bGUudHdlZW47XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIHR3ZWVuIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIHR3ZWVuIGFuZCB3ZeKAmXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmICh0d2VlbiAhPT0gdHdlZW4wKSB7XG4gICAgICB0d2VlbjEgPSB0d2VlbjAgPSB0d2VlbjtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gdHdlZW4xLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAodHdlZW4xW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICB0d2VlbjEgPSB0d2VlbjEuc2xpY2UoKTtcbiAgICAgICAgICB0d2VlbjEuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NoZWR1bGUudHdlZW4gPSB0d2VlbjE7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHR3ZWVuRnVuY3Rpb24oaWQsIG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0d2VlbjAsIHR3ZWVuMTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICB0d2VlbiA9IHNjaGVkdWxlLnR3ZWVuO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCB0d2VlbiB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCB0d2VlbiBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAodHdlZW4gIT09IHR3ZWVuMCkge1xuICAgICAgdHdlZW4xID0gKHR3ZWVuMCA9IHR3ZWVuKS5zbGljZSgpO1xuICAgICAgZm9yICh2YXIgdCA9IHtuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWV9LCBpID0gMCwgbiA9IHR3ZWVuMS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKHR3ZWVuMVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgdHdlZW4xW2ldID0gdDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGkgPT09IG4pIHR3ZWVuMS5wdXNoKHQpO1xuICAgIH1cblxuICAgIHNjaGVkdWxlLnR3ZWVuID0gdHdlZW4xO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICBuYW1lICs9IFwiXCI7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIHR3ZWVuID0gZ2V0KHRoaXMubm9kZSgpLCBpZCkudHdlZW47XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0d2Vlbi5sZW5ndGgsIHQ7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgodCA9IHR3ZWVuW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIHJldHVybiB0LnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHZhbHVlID09IG51bGwgPyB0d2VlblJlbW92ZSA6IHR3ZWVuRnVuY3Rpb24pKGlkLCBuYW1lLCB2YWx1ZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHdlZW5WYWx1ZSh0cmFuc2l0aW9uLCBuYW1lLCB2YWx1ZSkge1xuICB2YXIgaWQgPSB0cmFuc2l0aW9uLl9pZDtcblxuICB0cmFuc2l0aW9uLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKTtcbiAgICAoc2NoZWR1bGUudmFsdWUgfHwgKHNjaGVkdWxlLnZhbHVlID0ge30pKVtuYW1lXSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuIGdldChub2RlLCBpZCkudmFsdWVbbmFtZV07XG4gIH07XG59XG4iLCJpbXBvcnQge2NvbG9yfSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCB7aW50ZXJwb2xhdGVOdW1iZXIsIGludGVycG9sYXRlUmdiLCBpbnRlcnBvbGF0ZVN0cmluZ30gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGM7XG4gIHJldHVybiAodHlwZW9mIGIgPT09IFwibnVtYmVyXCIgPyBpbnRlcnBvbGF0ZU51bWJlclxuICAgICAgOiBiIGluc3RhbmNlb2YgY29sb3IgPyBpbnRlcnBvbGF0ZVJnYlxuICAgICAgOiAoYyA9IGNvbG9yKGIpKSA/IChiID0gYywgaW50ZXJwb2xhdGVSZ2IpXG4gICAgICA6IGludGVycG9sYXRlU3RyaW5nKShhLCBiKTtcbn1cbiIsImltcG9ydCB7aW50ZXJwb2xhdGVUcmFuc2Zvcm1TdmcgYXMgaW50ZXJwb2xhdGVUcmFuc2Zvcm19IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtuYW1lc3BhY2V9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7dHdlZW5WYWx1ZX0gZnJvbSBcIi4vdHdlZW4uanNcIjtcbmltcG9ydCBpbnRlcnBvbGF0ZSBmcm9tIFwiLi9pbnRlcnBvbGF0ZS5qc1wiO1xuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlTlMoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50KG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnROUyhmdWxsbmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb24obmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAsIHZhbHVlMSA9IHZhbHVlKHRoaXMpLCBzdHJpbmcxO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgcmV0dXJuIHZvaWQgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uTlMoZnVsbG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwLCB2YWx1ZTEgPSB2YWx1ZSh0aGlzKSwgc3RyaW5nMTtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHJldHVybiB2b2lkIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpLCBpID0gZnVsbG5hbWUgPT09IFwidHJhbnNmb3JtXCIgPyBpbnRlcnBvbGF0ZVRyYW5zZm9ybSA6IGludGVycG9sYXRlO1xuICByZXR1cm4gdGhpcy5hdHRyVHdlZW4obmFtZSwgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckZ1bmN0aW9uTlMgOiBhdHRyRnVuY3Rpb24pKGZ1bGxuYW1lLCBpLCB0d2VlblZhbHVlKHRoaXMsIFwiYXR0ci5cIiArIG5hbWUsIHZhbHVlKSlcbiAgICAgIDogdmFsdWUgPT0gbnVsbCA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJSZW1vdmVOUyA6IGF0dHJSZW1vdmUpKGZ1bGxuYW1lKVxuICAgICAgOiAoZnVsbG5hbWUubG9jYWwgPyBhdHRyQ29uc3RhbnROUyA6IGF0dHJDb25zdGFudCkoZnVsbG5hbWUsIGksIHZhbHVlKSk7XG59XG4iLCJpbXBvcnQge25hbWVzcGFjZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuXG5mdW5jdGlvbiBhdHRySW50ZXJwb2xhdGUobmFtZSwgaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIGkuY2FsbCh0aGlzLCB0KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJJbnRlcnBvbGF0ZU5TKGZ1bGxuYW1lLCBpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIGkuY2FsbCh0aGlzLCB0KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJUd2Vlbk5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIGF0dHJJbnRlcnBvbGF0ZU5TKGZ1bGxuYW1lLCBpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZnVuY3Rpb24gYXR0clR3ZWVuKG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgYXR0ckludGVycG9sYXRlKG5hbWUsIGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIga2V5ID0gXCJhdHRyLlwiICsgbmFtZTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG4gIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgKGZ1bGxuYW1lLmxvY2FsID8gYXR0clR3ZWVuTlMgOiBhdHRyVHdlZW4pKGZ1bGxuYW1lLCB2YWx1ZSkpO1xufVxuIiwiaW1wb3J0IHtnZXQsIGluaXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGRlbGF5RnVuY3Rpb24oaWQsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpbml0KHRoaXMsIGlkKS5kZWxheSA9ICt2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkZWxheUNvbnN0YW50KGlkLCB2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPSArdmFsdWUsIGZ1bmN0aW9uKCkge1xuICAgIGluaXQodGhpcywgaWQpLmRlbGF5ID0gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCgodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGRlbGF5RnVuY3Rpb25cbiAgICAgICAgICA6IGRlbGF5Q29uc3RhbnQpKGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmRlbGF5O1xufVxuIiwiaW1wb3J0IHtnZXQsIHNldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZHVyYXRpb25GdW5jdGlvbihpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZHVyYXRpb24gPSArdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZHVyYXRpb25Db25zdGFudChpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID0gK3ZhbHVlLCBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmR1cmF0aW9uID0gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCgodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGR1cmF0aW9uRnVuY3Rpb25cbiAgICAgICAgICA6IGR1cmF0aW9uQ29uc3RhbnQpKGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmR1cmF0aW9uO1xufVxuIiwiaW1wb3J0IHtnZXQsIHNldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZWFzZUNvbnN0YW50KGlkLCB2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZWFzZSA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goZWFzZUNvbnN0YW50KGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmVhc2U7XG59XG4iLCJpbXBvcnQge3NldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZWFzZVZhcnlpbmcoaWQsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHR5cGVvZiB2ICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgICBzZXQodGhpcywgaWQpLmVhc2UgPSB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMuZWFjaChlYXNlVmFyeWluZyh0aGlzLl9pZCwgdmFsdWUpKTtcbn1cbiIsImltcG9ydCB7bWF0Y2hlcn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICBpZiAodHlwZW9mIG1hdGNoICE9PSBcImZ1bmN0aW9uXCIpIG1hdGNoID0gbWF0Y2hlcihtYXRjaCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IFtdLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIG1hdGNoLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSB7XG4gICAgICAgIHN1Ymdyb3VwLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cywgdGhpcy5fbmFtZSwgdGhpcy5faWQpO1xufVxuIiwiaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0cmFuc2l0aW9uKSB7XG4gIGlmICh0cmFuc2l0aW9uLl9pZCAhPT0gdGhpcy5faWQpIHRocm93IG5ldyBFcnJvcjtcblxuICBmb3IgKHZhciBncm91cHMwID0gdGhpcy5fZ3JvdXBzLCBncm91cHMxID0gdHJhbnNpdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24obWVyZ2VzLCB0aGlzLl9wYXJlbnRzLCB0aGlzLl9uYW1lLCB0aGlzLl9pZCk7XG59XG4iLCJpbXBvcnQge2dldCwgc2V0LCBpbml0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBzdGFydChuYW1lKSB7XG4gIHJldHVybiAobmFtZSArIFwiXCIpLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykuZXZlcnkoZnVuY3Rpb24odCkge1xuICAgIHZhciBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICByZXR1cm4gIXQgfHwgdCA9PT0gXCJzdGFydFwiO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gb25GdW5jdGlvbihpZCwgbmFtZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG9uMCwgb24xLCBzaXQgPSBzdGFydChuYW1lKSA/IGluaXQgOiBzZXQ7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzaXQodGhpcywgaWQpLFxuICAgICAgICBvbiA9IHNjaGVkdWxlLm9uO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCBhIGRpc3BhdGNoIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIGRpc3BhdGNoIGFuZCB3ZeKAmXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmIChvbiAhPT0gb24wKSAob24xID0gKG9uMCA9IG9uKS5jb3B5KCkpLm9uKG5hbWUsIGxpc3RlbmVyKTtcblxuICAgIHNjaGVkdWxlLm9uID0gb24xO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCBsaXN0ZW5lcikge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDJcbiAgICAgID8gZ2V0KHRoaXMubm9kZSgpLCBpZCkub24ub24obmFtZSlcbiAgICAgIDogdGhpcy5lYWNoKG9uRnVuY3Rpb24oaWQsIG5hbWUsIGxpc3RlbmVyKSk7XG59XG4iLCJmdW5jdGlvbiByZW1vdmVGdW5jdGlvbihpZCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMuX190cmFuc2l0aW9uKSBpZiAoK2kgIT09IGlkKSByZXR1cm47XG4gICAgaWYgKHBhcmVudCkgcGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub24oXCJlbmQucmVtb3ZlXCIsIHJlbW92ZUZ1bmN0aW9uKHRoaXMuX2lkKSk7XG59XG4iLCJpbXBvcnQge3NlbGVjdG9yfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZCA9IHRoaXMuX2lkO1xuXG4gIGlmICh0eXBlb2Ygc2VsZWN0ICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IHNlbGVjdG9yKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgc3Vibm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiAoc3Vibm9kZSA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkpIHtcbiAgICAgICAgaWYgKFwiX19kYXRhX19cIiBpbiBub2RlKSBzdWJub2RlLl9fZGF0YV9fID0gbm9kZS5fX2RhdGFfXztcbiAgICAgICAgc3ViZ3JvdXBbaV0gPSBzdWJub2RlO1xuICAgICAgICBzY2hlZHVsZShzdWJncm91cFtpXSwgbmFtZSwgaWQsIGksIHN1Ymdyb3VwLCBnZXQobm9kZSwgaWQpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLCJpbXBvcnQge3NlbGVjdG9yQWxsfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZCA9IHRoaXMuX2lkO1xuXG4gIGlmICh0eXBlb2Ygc2VsZWN0ICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IHNlbGVjdG9yQWxsKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gW10sIHBhcmVudHMgPSBbXSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgZm9yICh2YXIgY2hpbGRyZW4gPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCksIGNoaWxkLCBpbmhlcml0ID0gZ2V0KG5vZGUsIGlkKSwgayA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGsgPCBsOyArK2spIHtcbiAgICAgICAgICBpZiAoY2hpbGQgPSBjaGlsZHJlbltrXSkge1xuICAgICAgICAgICAgc2NoZWR1bGUoY2hpbGQsIG5hbWUsIGlkLCBrLCBjaGlsZHJlbiwgaW5oZXJpdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN1Ymdyb3Vwcy5wdXNoKGNoaWxkcmVuKTtcbiAgICAgICAgcGFyZW50cy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihzdWJncm91cHMsIHBhcmVudHMsIG5hbWUsIGlkKTtcbn1cbiIsImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5cbnZhciBTZWxlY3Rpb24gPSBzZWxlY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsImltcG9ydCB7aW50ZXJwb2xhdGVUcmFuc2Zvcm1Dc3MgYXMgaW50ZXJwb2xhdGVUcmFuc2Zvcm19IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtzdHlsZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5pbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgaW50ZXJwb2xhdGUgZnJvbSBcIi4vaW50ZXJwb2xhdGUuanNcIjtcblxuZnVuY3Rpb24gc3R5bGVOdWxsKG5hbWUsIGludGVycG9sYXRlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKSxcbiAgICAgICAgc3RyaW5nMSA9ICh0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpLCBzdHlsZSh0aGlzLCBuYW1lKSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHN0cmluZzEwID0gc3RyaW5nMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlQ29uc3RhbnQobmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlRnVuY3Rpb24obmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKSxcbiAgICAgICAgdmFsdWUxID0gdmFsdWUodGhpcyksXG4gICAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgc3RyaW5nMSA9IHZhbHVlMSA9ICh0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpLCBzdHlsZSh0aGlzLCBuYW1lKSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiAoc3RyaW5nMTAgPSBzdHJpbmcxLCBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZU1heWJlUmVtb3ZlKGlkLCBuYW1lKSB7XG4gIHZhciBvbjAsIG9uMSwgbGlzdGVuZXIwLCBrZXkgPSBcInN0eWxlLlwiICsgbmFtZSwgZXZlbnQgPSBcImVuZC5cIiArIGtleSwgcmVtb3ZlO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgb24gPSBzY2hlZHVsZS5vbixcbiAgICAgICAgbGlzdGVuZXIgPSBzY2hlZHVsZS52YWx1ZVtrZXldID09IG51bGwgPyByZW1vdmUgfHwgKHJlbW92ZSA9IHN0eWxlUmVtb3ZlKG5hbWUpKSA6IHVuZGVmaW5lZDtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAob24gIT09IG9uMCB8fCBsaXN0ZW5lcjAgIT09IGxpc3RlbmVyKSAob24xID0gKG9uMCA9IG9uKS5jb3B5KCkpLm9uKGV2ZW50LCBsaXN0ZW5lcjAgPSBsaXN0ZW5lcik7XG5cbiAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciBpID0gKG5hbWUgKz0gXCJcIikgPT09IFwidHJhbnNmb3JtXCIgPyBpbnRlcnBvbGF0ZVRyYW5zZm9ybSA6IGludGVycG9sYXRlO1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlTnVsbChuYW1lLCBpKSlcbiAgICAgIC5vbihcImVuZC5zdHlsZS5cIiArIG5hbWUsIHN0eWxlUmVtb3ZlKG5hbWUpKVxuICAgIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZUZ1bmN0aW9uKG5hbWUsIGksIHR3ZWVuVmFsdWUodGhpcywgXCJzdHlsZS5cIiArIG5hbWUsIHZhbHVlKSkpXG4gICAgICAuZWFjaChzdHlsZU1heWJlUmVtb3ZlKHRoaXMuX2lkLCBuYW1lKSlcbiAgICA6IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlQ29uc3RhbnQobmFtZSwgaSwgdmFsdWUpLCBwcmlvcml0eSlcbiAgICAgIC5vbihcImVuZC5zdHlsZS5cIiArIG5hbWUsIG51bGwpO1xufVxuIiwiZnVuY3Rpb24gc3R5bGVJbnRlcnBvbGF0ZShuYW1lLCBpLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgaS5jYWxsKHRoaXMsIHQpLCBwcmlvcml0eSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlVHdlZW4obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciB0LCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdCA9IChpMCA9IGkpICYmIHN0eWxlSW50ZXJwb2xhdGUobmFtZSwgaSwgcHJpb3JpdHkpO1xuICAgIHJldHVybiB0O1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIga2V5ID0gXCJzdHlsZS5cIiArIChuYW1lICs9IFwiXCIpO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHJldHVybiAoa2V5ID0gdGhpcy50d2VlbihrZXkpKSAmJiBrZXkuX3ZhbHVlO1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCBudWxsKTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgc3R5bGVUd2VlbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkgPT0gbnVsbCA/IFwiXCIgOiBwcmlvcml0eSkpO1xufVxuIiwiaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuXG5mdW5jdGlvbiB0ZXh0Q29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUxID0gdmFsdWUodGhpcyk7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlMSA9PSBudWxsID8gXCJcIiA6IHZhbHVlMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMudHdlZW4oXCJ0ZXh0XCIsIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IHRleHRGdW5jdGlvbih0d2VlblZhbHVlKHRoaXMsIFwidGV4dFwiLCB2YWx1ZSkpXG4gICAgICA6IHRleHRDb25zdGFudCh2YWx1ZSA9PSBudWxsID8gXCJcIiA6IHZhbHVlICsgXCJcIikpO1xufVxuIiwiZnVuY3Rpb24gdGV4dEludGVycG9sYXRlKGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gaS5jYWxsKHRoaXMsIHQpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0VHdlZW4odmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiB0ZXh0SW50ZXJwb2xhdGUoaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBrZXkgPSBcInRleHRcIjtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIHRleHRUd2Vlbih2YWx1ZSkpO1xufVxuIiwiaW1wb3J0IHtUcmFuc2l0aW9uLCBuZXdJZH0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzY2hlZHVsZSwge2dldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBuYW1lID0gdGhpcy5fbmFtZSxcbiAgICAgIGlkMCA9IHRoaXMuX2lkLFxuICAgICAgaWQxID0gbmV3SWQoKTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICB2YXIgaW5oZXJpdCA9IGdldChub2RlLCBpZDApO1xuICAgICAgICBzY2hlZHVsZShub2RlLCBuYW1lLCBpZDEsIGksIGdyb3VwLCB7XG4gICAgICAgICAgdGltZTogaW5oZXJpdC50aW1lICsgaW5oZXJpdC5kZWxheSArIGluaGVyaXQuZHVyYXRpb24sXG4gICAgICAgICAgZGVsYXk6IDAsXG4gICAgICAgICAgZHVyYXRpb246IGluaGVyaXQuZHVyYXRpb24sXG4gICAgICAgICAgZWFzZTogaW5oZXJpdC5lYXNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihncm91cHMsIHRoaXMuX3BhcmVudHMsIG5hbWUsIGlkMSk7XG59XG4iLCJpbXBvcnQge3NldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBvbjAsIG9uMSwgdGhhdCA9IHRoaXMsIGlkID0gdGhhdC5faWQsIHNpemUgPSB0aGF0LnNpemUoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBjYW5jZWwgPSB7dmFsdWU6IHJlamVjdH0sXG4gICAgICAgIGVuZCA9IHt2YWx1ZTogZnVuY3Rpb24oKSB7IGlmICgtLXNpemUgPT09IDApIHJlc29sdmUoKTsgfX07XG5cbiAgICB0aGF0LmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICAgIG9uID0gc2NoZWR1bGUub247XG5cbiAgICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIGRpc3BhdGNoIGFuZCB3ZeKAmXJlIGRvbmUhXG4gICAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgICBpZiAob24gIT09IG9uMCkge1xuICAgICAgICBvbjEgPSAob24wID0gb24pLmNvcHkoKTtcbiAgICAgICAgb24xLl8uY2FuY2VsLnB1c2goY2FuY2VsKTtcbiAgICAgICAgb24xLl8uaW50ZXJydXB0LnB1c2goY2FuY2VsKTtcbiAgICAgICAgb24xLl8uZW5kLnB1c2goZW5kKTtcbiAgICAgIH1cblxuICAgICAgc2NoZWR1bGUub24gPSBvbjE7XG4gICAgfSk7XG5cbiAgICAvLyBUaGUgc2VsZWN0aW9uIHdhcyBlbXB0eSwgcmVzb2x2ZSBlbmQgaW1tZWRpYXRlbHlcbiAgICBpZiAoc2l6ZSA9PT0gMCkgcmVzb2x2ZSgpO1xuICB9KTtcbn1cbiIsImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9hdHRyIGZyb20gXCIuL2F0dHIuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2F0dHJUd2VlbiBmcm9tIFwiLi9hdHRyVHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2RlbGF5IGZyb20gXCIuL2RlbGF5LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9kdXJhdGlvbiBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZWFzZSBmcm9tIFwiLi9lYXNlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lYXNlVmFyeWluZyBmcm9tIFwiLi9lYXNlVmFyeWluZy5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZmlsdGVyIGZyb20gXCIuL2ZpbHRlci5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fbWVyZ2UgZnJvbSBcIi4vbWVyZ2UuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX29uIGZyb20gXCIuL29uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9yZW1vdmUgZnJvbSBcIi4vcmVtb3ZlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3QgZnJvbSBcIi4vc2VsZWN0LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3RBbGwgZnJvbSBcIi4vc2VsZWN0QWxsLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3Rpb24gZnJvbSBcIi4vc2VsZWN0aW9uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zdHlsZSBmcm9tIFwiLi9zdHlsZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc3R5bGVUd2VlbiBmcm9tIFwiLi9zdHlsZVR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90ZXh0IGZyb20gXCIuL3RleHQuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RleHRUd2VlbiBmcm9tIFwiLi90ZXh0VHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RyYW5zaXRpb24gZnJvbSBcIi4vdHJhbnNpdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdHdlZW4gZnJvbSBcIi4vdHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2VuZCBmcm9tIFwiLi9lbmQuanNcIjtcblxudmFyIGlkID0gMDtcblxuZXhwb3J0IGZ1bmN0aW9uIFRyYW5zaXRpb24oZ3JvdXBzLCBwYXJlbnRzLCBuYW1lLCBpZCkge1xuICB0aGlzLl9ncm91cHMgPSBncm91cHM7XG4gIHRoaXMuX3BhcmVudHMgPSBwYXJlbnRzO1xuICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgdGhpcy5faWQgPSBpZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNpdGlvbihuYW1lKSB7XG4gIHJldHVybiBzZWxlY3Rpb24oKS50cmFuc2l0aW9uKG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV3SWQoKSB7XG4gIHJldHVybiArK2lkO1xufVxuXG52YXIgc2VsZWN0aW9uX3Byb3RvdHlwZSA9IHNlbGVjdGlvbi5wcm90b3R5cGU7XG5cblRyYW5zaXRpb24ucHJvdG90eXBlID0gdHJhbnNpdGlvbi5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2l0aW9uLFxuICBzZWxlY3Q6IHRyYW5zaXRpb25fc2VsZWN0LFxuICBzZWxlY3RBbGw6IHRyYW5zaXRpb25fc2VsZWN0QWxsLFxuICBzZWxlY3RDaGlsZDogc2VsZWN0aW9uX3Byb3RvdHlwZS5zZWxlY3RDaGlsZCxcbiAgc2VsZWN0Q2hpbGRyZW46IHNlbGVjdGlvbl9wcm90b3R5cGUuc2VsZWN0Q2hpbGRyZW4sXG4gIGZpbHRlcjogdHJhbnNpdGlvbl9maWx0ZXIsXG4gIG1lcmdlOiB0cmFuc2l0aW9uX21lcmdlLFxuICBzZWxlY3Rpb246IHRyYW5zaXRpb25fc2VsZWN0aW9uLFxuICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uX3RyYW5zaXRpb24sXG4gIGNhbGw6IHNlbGVjdGlvbl9wcm90b3R5cGUuY2FsbCxcbiAgbm9kZXM6IHNlbGVjdGlvbl9wcm90b3R5cGUubm9kZXMsXG4gIG5vZGU6IHNlbGVjdGlvbl9wcm90b3R5cGUubm9kZSxcbiAgc2l6ZTogc2VsZWN0aW9uX3Byb3RvdHlwZS5zaXplLFxuICBlbXB0eTogc2VsZWN0aW9uX3Byb3RvdHlwZS5lbXB0eSxcbiAgZWFjaDogc2VsZWN0aW9uX3Byb3RvdHlwZS5lYWNoLFxuICBvbjogdHJhbnNpdGlvbl9vbixcbiAgYXR0cjogdHJhbnNpdGlvbl9hdHRyLFxuICBhdHRyVHdlZW46IHRyYW5zaXRpb25fYXR0clR3ZWVuLFxuICBzdHlsZTogdHJhbnNpdGlvbl9zdHlsZSxcbiAgc3R5bGVUd2VlbjogdHJhbnNpdGlvbl9zdHlsZVR3ZWVuLFxuICB0ZXh0OiB0cmFuc2l0aW9uX3RleHQsXG4gIHRleHRUd2VlbjogdHJhbnNpdGlvbl90ZXh0VHdlZW4sXG4gIHJlbW92ZTogdHJhbnNpdGlvbl9yZW1vdmUsXG4gIHR3ZWVuOiB0cmFuc2l0aW9uX3R3ZWVuLFxuICBkZWxheTogdHJhbnNpdGlvbl9kZWxheSxcbiAgZHVyYXRpb246IHRyYW5zaXRpb25fZHVyYXRpb24sXG4gIGVhc2U6IHRyYW5zaXRpb25fZWFzZSxcbiAgZWFzZVZhcnlpbmc6IHRyYW5zaXRpb25fZWFzZVZhcnlpbmcsXG4gIGVuZDogdHJhbnNpdGlvbl9lbmQsXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiBzZWxlY3Rpb25fcHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl1cbn07XG4iLCJleHBvcnQgZnVuY3Rpb24gY3ViaWNJbih0KSB7XG4gIHJldHVybiB0ICogdCAqIHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdWJpY091dCh0KSB7XG4gIHJldHVybiAtLXQgKiB0ICogdCArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdWJpY0luT3V0KHQpIHtcbiAgcmV0dXJuICgodCAqPSAyKSA8PSAxID8gdCAqIHQgKiB0IDogKHQgLT0gMikgKiB0ICogdCArIDIpIC8gMjtcbn1cbiIsImltcG9ydCB7VHJhbnNpdGlvbiwgbmV3SWR9IGZyb20gXCIuLi90cmFuc2l0aW9uL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUgZnJvbSBcIi4uL3RyYW5zaXRpb24vc2NoZWR1bGUuanNcIjtcbmltcG9ydCB7ZWFzZUN1YmljSW5PdXR9IGZyb20gXCJkMy1lYXNlXCI7XG5pbXBvcnQge25vd30gZnJvbSBcImQzLXRpbWVyXCI7XG5cbnZhciBkZWZhdWx0VGltaW5nID0ge1xuICB0aW1lOiBudWxsLCAvLyBTZXQgb24gdXNlLlxuICBkZWxheTogMCxcbiAgZHVyYXRpb246IDI1MCxcbiAgZWFzZTogZWFzZUN1YmljSW5PdXRcbn07XG5cbmZ1bmN0aW9uIGluaGVyaXQobm9kZSwgaWQpIHtcbiAgdmFyIHRpbWluZztcbiAgd2hpbGUgKCEodGltaW5nID0gbm9kZS5fX3RyYW5zaXRpb24pIHx8ICEodGltaW5nID0gdGltaW5nW2lkXSkpIHtcbiAgICBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGB0cmFuc2l0aW9uICR7aWR9IG5vdCBmb3VuZGApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGltaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBpZCxcbiAgICAgIHRpbWluZztcblxuICBpZiAobmFtZSBpbnN0YW5jZW9mIFRyYW5zaXRpb24pIHtcbiAgICBpZCA9IG5hbWUuX2lkLCBuYW1lID0gbmFtZS5fbmFtZTtcbiAgfSBlbHNlIHtcbiAgICBpZCA9IG5ld0lkKCksICh0aW1pbmcgPSBkZWZhdWx0VGltaW5nKS50aW1lID0gbm93KCksIG5hbWUgPSBuYW1lID09IG51bGwgPyBudWxsIDogbmFtZSArIFwiXCI7XG4gIH1cblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzY2hlZHVsZShub2RlLCBuYW1lLCBpZCwgaSwgZ3JvdXAsIHRpbWluZyB8fCBpbmhlcml0KG5vZGUsIGlkKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKGdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwiaW1wb3J0IHtzZWxlY3Rpb259IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCBzZWxlY3Rpb25faW50ZXJydXB0IGZyb20gXCIuL2ludGVycnVwdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl90cmFuc2l0aW9uIGZyb20gXCIuL3RyYW5zaXRpb24uanNcIjtcblxuc2VsZWN0aW9uLnByb3RvdHlwZS5pbnRlcnJ1cHQgPSBzZWxlY3Rpb25faW50ZXJydXB0O1xuc2VsZWN0aW9uLnByb3RvdHlwZS50cmFuc2l0aW9uID0gc2VsZWN0aW9uX3RyYW5zaXRpb247XG4iLCJleHBvcnQgZnVuY3Rpb24gaW5pdFJhbmdlKGRvbWFpbiwgcmFuZ2UpIHtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiBicmVhaztcbiAgICBjYXNlIDE6IHRoaXMucmFuZ2UoZG9tYWluKTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhpcy5yYW5nZShyYW5nZSkuZG9tYWluKGRvbWFpbik7IGJyZWFrO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdEludGVycG9sYXRvcihkb21haW4sIGludGVycG9sYXRvcikge1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IGJyZWFrO1xuICAgIGNhc2UgMToge1xuICAgICAgaWYgKHR5cGVvZiBkb21haW4gPT09IFwiZnVuY3Rpb25cIikgdGhpcy5pbnRlcnBvbGF0b3IoZG9tYWluKTtcbiAgICAgIGVsc2UgdGhpcy5yYW5nZShkb21haW4pO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHRoaXMuZG9tYWluKGRvbWFpbik7XG4gICAgICBpZiAodHlwZW9mIGludGVycG9sYXRvciA9PT0gXCJmdW5jdGlvblwiKSB0aGlzLmludGVycG9sYXRvcihpbnRlcnBvbGF0b3IpO1xuICAgICAgZWxzZSB0aGlzLnJhbmdlKGludGVycG9sYXRvcik7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQge0ludGVybk1hcH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuXG5leHBvcnQgY29uc3QgaW1wbGljaXQgPSBTeW1ib2woXCJpbXBsaWNpdFwiKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb3JkaW5hbCgpIHtcbiAgdmFyIGluZGV4ID0gbmV3IEludGVybk1hcCgpLFxuICAgICAgZG9tYWluID0gW10sXG4gICAgICByYW5nZSA9IFtdLFxuICAgICAgdW5rbm93biA9IGltcGxpY2l0O1xuXG4gIGZ1bmN0aW9uIHNjYWxlKGQpIHtcbiAgICBsZXQgaSA9IGluZGV4LmdldChkKTtcbiAgICBpZiAoaSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodW5rbm93biAhPT0gaW1wbGljaXQpIHJldHVybiB1bmtub3duO1xuICAgICAgaW5kZXguc2V0KGQsIGkgPSBkb21haW4ucHVzaChkKSAtIDEpO1xuICAgIH1cbiAgICByZXR1cm4gcmFuZ2VbaSAlIHJhbmdlLmxlbmd0aF07XG4gIH1cblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZG9tYWluLnNsaWNlKCk7XG4gICAgZG9tYWluID0gW10sIGluZGV4ID0gbmV3IEludGVybk1hcCgpO1xuICAgIGZvciAoY29uc3QgdmFsdWUgb2YgXykge1xuICAgICAgaWYgKGluZGV4Lmhhcyh2YWx1ZSkpIGNvbnRpbnVlO1xuICAgICAgaW5kZXguc2V0KHZhbHVlLCBkb21haW4ucHVzaCh2YWx1ZSkgLSAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9O1xuXG4gIHNjYWxlLnJhbmdlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHJhbmdlID0gQXJyYXkuZnJvbShfKSwgc2NhbGUpIDogcmFuZ2Uuc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gb3JkaW5hbChkb21haW4sIHJhbmdlKS51bmtub3duKHVua25vd24pO1xuICB9O1xuXG4gIGluaXRSYW5nZS5hcHBseShzY2FsZSwgYXJndW1lbnRzKTtcblxuICByZXR1cm4gc2NhbGU7XG59XG4iLCJpbXBvcnQge3JhbmdlIGFzIHNlcXVlbmNlfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7aW5pdFJhbmdlfSBmcm9tIFwiLi9pbml0LmpzXCI7XG5pbXBvcnQgb3JkaW5hbCBmcm9tIFwiLi9vcmRpbmFsLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJhbmQoKSB7XG4gIHZhciBzY2FsZSA9IG9yZGluYWwoKS51bmtub3duKHVuZGVmaW5lZCksXG4gICAgICBkb21haW4gPSBzY2FsZS5kb21haW4sXG4gICAgICBvcmRpbmFsUmFuZ2UgPSBzY2FsZS5yYW5nZSxcbiAgICAgIHIwID0gMCxcbiAgICAgIHIxID0gMSxcbiAgICAgIHN0ZXAsXG4gICAgICBiYW5kd2lkdGgsXG4gICAgICByb3VuZCA9IGZhbHNlLFxuICAgICAgcGFkZGluZ0lubmVyID0gMCxcbiAgICAgIHBhZGRpbmdPdXRlciA9IDAsXG4gICAgICBhbGlnbiA9IDAuNTtcblxuICBkZWxldGUgc2NhbGUudW5rbm93bjtcblxuICBmdW5jdGlvbiByZXNjYWxlKCkge1xuICAgIHZhciBuID0gZG9tYWluKCkubGVuZ3RoLFxuICAgICAgICByZXZlcnNlID0gcjEgPCByMCxcbiAgICAgICAgc3RhcnQgPSByZXZlcnNlID8gcjEgOiByMCxcbiAgICAgICAgc3RvcCA9IHJldmVyc2UgPyByMCA6IHIxO1xuICAgIHN0ZXAgPSAoc3RvcCAtIHN0YXJ0KSAvIE1hdGgubWF4KDEsIG4gLSBwYWRkaW5nSW5uZXIgKyBwYWRkaW5nT3V0ZXIgKiAyKTtcbiAgICBpZiAocm91bmQpIHN0ZXAgPSBNYXRoLmZsb29yKHN0ZXApO1xuICAgIHN0YXJ0ICs9IChzdG9wIC0gc3RhcnQgLSBzdGVwICogKG4gLSBwYWRkaW5nSW5uZXIpKSAqIGFsaWduO1xuICAgIGJhbmR3aWR0aCA9IHN0ZXAgKiAoMSAtIHBhZGRpbmdJbm5lcik7XG4gICAgaWYgKHJvdW5kKSBzdGFydCA9IE1hdGgucm91bmQoc3RhcnQpLCBiYW5kd2lkdGggPSBNYXRoLnJvdW5kKGJhbmR3aWR0aCk7XG4gICAgdmFyIHZhbHVlcyA9IHNlcXVlbmNlKG4pLm1hcChmdW5jdGlvbihpKSB7IHJldHVybiBzdGFydCArIHN0ZXAgKiBpOyB9KTtcbiAgICByZXR1cm4gb3JkaW5hbFJhbmdlKHJldmVyc2UgPyB2YWx1ZXMucmV2ZXJzZSgpIDogdmFsdWVzKTtcbiAgfVxuXG4gIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChkb21haW4oXyksIHJlc2NhbGUoKSkgOiBkb21haW4oKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChbcjAsIHIxXSA9IF8sIHIwID0gK3IwLCByMSA9ICtyMSwgcmVzY2FsZSgpKSA6IFtyMCwgcjFdO1xuICB9O1xuXG4gIHNjYWxlLnJhbmdlUm91bmQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIFtyMCwgcjFdID0gXywgcjAgPSArcjAsIHIxID0gK3IxLCByb3VuZCA9IHRydWUsIHJlc2NhbGUoKTtcbiAgfTtcblxuICBzY2FsZS5iYW5kd2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYmFuZHdpZHRoO1xuICB9O1xuXG4gIHNjYWxlLnN0ZXAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gc3RlcDtcbiAgfTtcblxuICBzY2FsZS5yb3VuZCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyb3VuZCA9ICEhXywgcmVzY2FsZSgpKSA6IHJvdW5kO1xuICB9O1xuXG4gIHNjYWxlLnBhZGRpbmcgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ0lubmVyID0gTWF0aC5taW4oMSwgcGFkZGluZ091dGVyID0gK18pLCByZXNjYWxlKCkpIDogcGFkZGluZ0lubmVyO1xuICB9O1xuXG4gIHNjYWxlLnBhZGRpbmdJbm5lciA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwYWRkaW5nSW5uZXIgPSBNYXRoLm1pbigxLCBfKSwgcmVzY2FsZSgpKSA6IHBhZGRpbmdJbm5lcjtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nT3V0ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ091dGVyID0gK18sIHJlc2NhbGUoKSkgOiBwYWRkaW5nT3V0ZXI7XG4gIH07XG5cbiAgc2NhbGUuYWxpZ24gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoYWxpZ24gPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBfKSksIHJlc2NhbGUoKSkgOiBhbGlnbjtcbiAgfTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGJhbmQoZG9tYWluKCksIFtyMCwgcjFdKVxuICAgICAgICAucm91bmQocm91bmQpXG4gICAgICAgIC5wYWRkaW5nSW5uZXIocGFkZGluZ0lubmVyKVxuICAgICAgICAucGFkZGluZ091dGVyKHBhZGRpbmdPdXRlcilcbiAgICAgICAgLmFsaWduKGFsaWduKTtcbiAgfTtcblxuICByZXR1cm4gaW5pdFJhbmdlLmFwcGx5KHJlc2NhbGUoKSwgYXJndW1lbnRzKTtcbn1cblxuZnVuY3Rpb24gcG9pbnRpc2goc2NhbGUpIHtcbiAgdmFyIGNvcHkgPSBzY2FsZS5jb3B5O1xuXG4gIHNjYWxlLnBhZGRpbmcgPSBzY2FsZS5wYWRkaW5nT3V0ZXI7XG4gIGRlbGV0ZSBzY2FsZS5wYWRkaW5nSW5uZXI7XG4gIGRlbGV0ZSBzY2FsZS5wYWRkaW5nT3V0ZXI7XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwb2ludGlzaChjb3B5KCkpO1xuICB9O1xuXG4gIHJldHVybiBzY2FsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvaW50KCkge1xuICByZXR1cm4gcG9pbnRpc2goYmFuZC5hcHBseShudWxsLCBhcmd1bWVudHMpLnBhZGRpbmdJbm5lcigxKSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb25zdGFudHMoeCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBudW1iZXIoeCkge1xuICByZXR1cm4gK3g7XG59XG4iLCJpbXBvcnQge2Jpc2VjdH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2ludGVycG9sYXRlIGFzIGludGVycG9sYXRlVmFsdWUsIGludGVycG9sYXRlTnVtYmVyLCBpbnRlcnBvbGF0ZVJvdW5kfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxudmFyIHVuaXQgPSBbMCwgMV07XG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eSh4KSB7XG4gIHJldHVybiB4O1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemUoYSwgYikge1xuICByZXR1cm4gKGIgLT0gKGEgPSArYSkpXG4gICAgICA/IGZ1bmN0aW9uKHgpIHsgcmV0dXJuICh4IC0gYSkgLyBiOyB9XG4gICAgICA6IGNvbnN0YW50KGlzTmFOKGIpID8gTmFOIDogMC41KTtcbn1cblxuZnVuY3Rpb24gY2xhbXBlcihhLCBiKSB7XG4gIHZhciB0O1xuICBpZiAoYSA+IGIpIHQgPSBhLCBhID0gYiwgYiA9IHQ7XG4gIHJldHVybiBmdW5jdGlvbih4KSB7IHJldHVybiBNYXRoLm1heChhLCBNYXRoLm1pbihiLCB4KSk7IH07XG59XG5cbi8vIG5vcm1hbGl6ZShhLCBiKSh4KSB0YWtlcyBhIGRvbWFpbiB2YWx1ZSB4IGluIFthLGJdIGFuZCByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIHBhcmFtZXRlciB0IGluIFswLDFdLlxuLy8gaW50ZXJwb2xhdGUoYSwgYikodCkgdGFrZXMgYSBwYXJhbWV0ZXIgdCBpbiBbMCwxXSBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyByYW5nZSB2YWx1ZSB4IGluIFthLGJdLlxuZnVuY3Rpb24gYmltYXAoZG9tYWluLCByYW5nZSwgaW50ZXJwb2xhdGUpIHtcbiAgdmFyIGQwID0gZG9tYWluWzBdLCBkMSA9IGRvbWFpblsxXSwgcjAgPSByYW5nZVswXSwgcjEgPSByYW5nZVsxXTtcbiAgaWYgKGQxIDwgZDApIGQwID0gbm9ybWFsaXplKGQxLCBkMCksIHIwID0gaW50ZXJwb2xhdGUocjEsIHIwKTtcbiAgZWxzZSBkMCA9IG5vcm1hbGl6ZShkMCwgZDEpLCByMCA9IGludGVycG9sYXRlKHIwLCByMSk7XG4gIHJldHVybiBmdW5jdGlvbih4KSB7IHJldHVybiByMChkMCh4KSk7IH07XG59XG5cbmZ1bmN0aW9uIHBvbHltYXAoZG9tYWluLCByYW5nZSwgaW50ZXJwb2xhdGUpIHtcbiAgdmFyIGogPSBNYXRoLm1pbihkb21haW4ubGVuZ3RoLCByYW5nZS5sZW5ndGgpIC0gMSxcbiAgICAgIGQgPSBuZXcgQXJyYXkoaiksXG4gICAgICByID0gbmV3IEFycmF5KGopLFxuICAgICAgaSA9IC0xO1xuXG4gIC8vIFJldmVyc2UgZGVzY2VuZGluZyBkb21haW5zLlxuICBpZiAoZG9tYWluW2pdIDwgZG9tYWluWzBdKSB7XG4gICAgZG9tYWluID0gZG9tYWluLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIHJhbmdlID0gcmFuZ2Uuc2xpY2UoKS5yZXZlcnNlKCk7XG4gIH1cblxuICB3aGlsZSAoKytpIDwgaikge1xuICAgIGRbaV0gPSBub3JtYWxpemUoZG9tYWluW2ldLCBkb21haW5baSArIDFdKTtcbiAgICByW2ldID0gaW50ZXJwb2xhdGUocmFuZ2VbaV0sIHJhbmdlW2kgKyAxXSk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oeCkge1xuICAgIHZhciBpID0gYmlzZWN0KGRvbWFpbiwgeCwgMSwgaikgLSAxO1xuICAgIHJldHVybiByW2ldKGRbaV0oeCkpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weShzb3VyY2UsIHRhcmdldCkge1xuICByZXR1cm4gdGFyZ2V0XG4gICAgICAuZG9tYWluKHNvdXJjZS5kb21haW4oKSlcbiAgICAgIC5yYW5nZShzb3VyY2UucmFuZ2UoKSlcbiAgICAgIC5pbnRlcnBvbGF0ZShzb3VyY2UuaW50ZXJwb2xhdGUoKSlcbiAgICAgIC5jbGFtcChzb3VyY2UuY2xhbXAoKSlcbiAgICAgIC51bmtub3duKHNvdXJjZS51bmtub3duKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtZXIoKSB7XG4gIHZhciBkb21haW4gPSB1bml0LFxuICAgICAgcmFuZ2UgPSB1bml0LFxuICAgICAgaW50ZXJwb2xhdGUgPSBpbnRlcnBvbGF0ZVZhbHVlLFxuICAgICAgdHJhbnNmb3JtLFxuICAgICAgdW50cmFuc2Zvcm0sXG4gICAgICB1bmtub3duLFxuICAgICAgY2xhbXAgPSBpZGVudGl0eSxcbiAgICAgIHBpZWNld2lzZSxcbiAgICAgIG91dHB1dCxcbiAgICAgIGlucHV0O1xuXG4gIGZ1bmN0aW9uIHJlc2NhbGUoKSB7XG4gICAgdmFyIG4gPSBNYXRoLm1pbihkb21haW4ubGVuZ3RoLCByYW5nZS5sZW5ndGgpO1xuICAgIGlmIChjbGFtcCAhPT0gaWRlbnRpdHkpIGNsYW1wID0gY2xhbXBlcihkb21haW5bMF0sIGRvbWFpbltuIC0gMV0pO1xuICAgIHBpZWNld2lzZSA9IG4gPiAyID8gcG9seW1hcCA6IGJpbWFwO1xuICAgIG91dHB1dCA9IGlucHV0ID0gbnVsbDtcbiAgICByZXR1cm4gc2NhbGU7XG4gIH1cblxuICBmdW5jdGlvbiBzY2FsZSh4KSB7XG4gICAgcmV0dXJuIHggPT0gbnVsbCB8fCBpc05hTih4ID0gK3gpID8gdW5rbm93biA6IChvdXRwdXQgfHwgKG91dHB1dCA9IHBpZWNld2lzZShkb21haW4ubWFwKHRyYW5zZm9ybSksIHJhbmdlLCBpbnRlcnBvbGF0ZSkpKSh0cmFuc2Zvcm0oY2xhbXAoeCkpKTtcbiAgfVxuXG4gIHNjYWxlLmludmVydCA9IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gY2xhbXAodW50cmFuc2Zvcm0oKGlucHV0IHx8IChpbnB1dCA9IHBpZWNld2lzZShyYW5nZSwgZG9tYWluLm1hcCh0cmFuc2Zvcm0pLCBpbnRlcnBvbGF0ZU51bWJlcikpKSh5KSkpO1xuICB9O1xuXG4gIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChkb21haW4gPSBBcnJheS5mcm9tKF8sIG51bWJlciksIHJlc2NhbGUoKSkgOiBkb21haW4uc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyYW5nZSA9IEFycmF5LmZyb20oXyksIHJlc2NhbGUoKSkgOiByYW5nZS5zbGljZSgpO1xuICB9O1xuXG4gIHNjYWxlLnJhbmdlUm91bmQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIHJhbmdlID0gQXJyYXkuZnJvbShfKSwgaW50ZXJwb2xhdGUgPSBpbnRlcnBvbGF0ZVJvdW5kLCByZXNjYWxlKCk7XG4gIH07XG5cbiAgc2NhbGUuY2xhbXAgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoY2xhbXAgPSBfID8gdHJ1ZSA6IGlkZW50aXR5LCByZXNjYWxlKCkpIDogY2xhbXAgIT09IGlkZW50aXR5O1xuICB9O1xuXG4gIHNjYWxlLmludGVycG9sYXRlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGludGVycG9sYXRlID0gXywgcmVzY2FsZSgpKSA6IGludGVycG9sYXRlO1xuICB9O1xuXG4gIHNjYWxlLnVua25vd24gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodW5rbm93biA9IF8sIHNjYWxlKSA6IHVua25vd247XG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHQsIHUpIHtcbiAgICB0cmFuc2Zvcm0gPSB0LCB1bnRyYW5zZm9ybSA9IHU7XG4gICAgcmV0dXJuIHJlc2NhbGUoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29udGludW91cygpIHtcbiAgcmV0dXJuIHRyYW5zZm9ybWVyKCkoaWRlbnRpdHksIGlkZW50aXR5KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5pY2UoZG9tYWluLCBpbnRlcnZhbCkge1xuICBkb21haW4gPSBkb21haW4uc2xpY2UoKTtcblxuICB2YXIgaTAgPSAwLFxuICAgICAgaTEgPSBkb21haW4ubGVuZ3RoIC0gMSxcbiAgICAgIHgwID0gZG9tYWluW2kwXSxcbiAgICAgIHgxID0gZG9tYWluW2kxXSxcbiAgICAgIHQ7XG5cbiAgaWYgKHgxIDwgeDApIHtcbiAgICB0ID0gaTAsIGkwID0gaTEsIGkxID0gdDtcbiAgICB0ID0geDAsIHgwID0geDEsIHgxID0gdDtcbiAgfVxuXG4gIGRvbWFpbltpMF0gPSBpbnRlcnZhbC5mbG9vcih4MCk7XG4gIGRvbWFpbltpMV0gPSBpbnRlcnZhbC5jZWlsKHgxKTtcbiAgcmV0dXJuIGRvbWFpbjtcbn1cbiIsImNvbnN0IHQwID0gbmV3IERhdGUsIHQxID0gbmV3IERhdGU7XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lSW50ZXJ2YWwoZmxvb3JpLCBvZmZzZXRpLCBjb3VudCwgZmllbGQpIHtcblxuICBmdW5jdGlvbiBpbnRlcnZhbChkYXRlKSB7XG4gICAgcmV0dXJuIGZsb29yaShkYXRlID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMCA/IG5ldyBEYXRlIDogbmV3IERhdGUoK2RhdGUpKSwgZGF0ZTtcbiAgfVxuXG4gIGludGVydmFsLmZsb29yID0gKGRhdGUpID0+IHtcbiAgICByZXR1cm4gZmxvb3JpKGRhdGUgPSBuZXcgRGF0ZSgrZGF0ZSkpLCBkYXRlO1xuICB9O1xuXG4gIGludGVydmFsLmNlaWwgPSAoZGF0ZSkgPT4ge1xuICAgIHJldHVybiBmbG9vcmkoZGF0ZSA9IG5ldyBEYXRlKGRhdGUgLSAxKSksIG9mZnNldGkoZGF0ZSwgMSksIGZsb29yaShkYXRlKSwgZGF0ZTtcbiAgfTtcblxuICBpbnRlcnZhbC5yb3VuZCA9IChkYXRlKSA9PiB7XG4gICAgY29uc3QgZDAgPSBpbnRlcnZhbChkYXRlKSwgZDEgPSBpbnRlcnZhbC5jZWlsKGRhdGUpO1xuICAgIHJldHVybiBkYXRlIC0gZDAgPCBkMSAtIGRhdGUgPyBkMCA6IGQxO1xuICB9O1xuXG4gIGludGVydmFsLm9mZnNldCA9IChkYXRlLCBzdGVwKSA9PiB7XG4gICAgcmV0dXJuIG9mZnNldGkoZGF0ZSA9IG5ldyBEYXRlKCtkYXRlKSwgc3RlcCA9PSBudWxsID8gMSA6IE1hdGguZmxvb3Ioc3RlcCkpLCBkYXRlO1xuICB9O1xuXG4gIGludGVydmFsLnJhbmdlID0gKHN0YXJ0LCBzdG9wLCBzdGVwKSA9PiB7XG4gICAgY29uc3QgcmFuZ2UgPSBbXTtcbiAgICBzdGFydCA9IGludGVydmFsLmNlaWwoc3RhcnQpO1xuICAgIHN0ZXAgPSBzdGVwID09IG51bGwgPyAxIDogTWF0aC5mbG9vcihzdGVwKTtcbiAgICBpZiAoIShzdGFydCA8IHN0b3ApIHx8ICEoc3RlcCA+IDApKSByZXR1cm4gcmFuZ2U7IC8vIGFsc28gaGFuZGxlcyBJbnZhbGlkIERhdGVcbiAgICBsZXQgcHJldmlvdXM7XG4gICAgZG8gcmFuZ2UucHVzaChwcmV2aW91cyA9IG5ldyBEYXRlKCtzdGFydCkpLCBvZmZzZXRpKHN0YXJ0LCBzdGVwKSwgZmxvb3JpKHN0YXJ0KTtcbiAgICB3aGlsZSAocHJldmlvdXMgPCBzdGFydCAmJiBzdGFydCA8IHN0b3ApO1xuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICBpbnRlcnZhbC5maWx0ZXIgPSAodGVzdCkgPT4ge1xuICAgIHJldHVybiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICAgIGlmIChkYXRlID49IGRhdGUpIHdoaWxlIChmbG9vcmkoZGF0ZSksICF0ZXN0KGRhdGUpKSBkYXRlLnNldFRpbWUoZGF0ZSAtIDEpO1xuICAgIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgICBpZiAoZGF0ZSA+PSBkYXRlKSB7XG4gICAgICAgIGlmIChzdGVwIDwgMCkgd2hpbGUgKCsrc3RlcCA8PSAwKSB7XG4gICAgICAgICAgd2hpbGUgKG9mZnNldGkoZGF0ZSwgLTEpLCAhdGVzdChkYXRlKSkge30gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1lbXB0eVxuICAgICAgICB9IGVsc2Ugd2hpbGUgKC0tc3RlcCA+PSAwKSB7XG4gICAgICAgICAgd2hpbGUgKG9mZnNldGkoZGF0ZSwgKzEpLCAhdGVzdChkYXRlKSkge30gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1lbXB0eVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgaWYgKGNvdW50KSB7XG4gICAgaW50ZXJ2YWwuY291bnQgPSAoc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgdDAuc2V0VGltZSgrc3RhcnQpLCB0MS5zZXRUaW1lKCtlbmQpO1xuICAgICAgZmxvb3JpKHQwKSwgZmxvb3JpKHQxKTtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKGNvdW50KHQwLCB0MSkpO1xuICAgIH07XG5cbiAgICBpbnRlcnZhbC5ldmVyeSA9IChzdGVwKSA9PiB7XG4gICAgICBzdGVwID0gTWF0aC5mbG9vcihzdGVwKTtcbiAgICAgIHJldHVybiAhaXNGaW5pdGUoc3RlcCkgfHwgIShzdGVwID4gMCkgPyBudWxsXG4gICAgICAgICAgOiAhKHN0ZXAgPiAxKSA/IGludGVydmFsXG4gICAgICAgICAgOiBpbnRlcnZhbC5maWx0ZXIoZmllbGRcbiAgICAgICAgICAgICAgPyAoZCkgPT4gZmllbGQoZCkgJSBzdGVwID09PSAwXG4gICAgICAgICAgICAgIDogKGQpID0+IGludGVydmFsLmNvdW50KDAsIGQpICUgc3RlcCA9PT0gMCk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBpbnRlcnZhbDtcbn1cbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuXG5leHBvcnQgY29uc3QgbWlsbGlzZWNvbmQgPSB0aW1lSW50ZXJ2YWwoKCkgPT4ge1xuICAvLyBub29wXG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQgLSBzdGFydDtcbn0pO1xuXG4vLyBBbiBvcHRpbWl6ZWQgaW1wbGVtZW50YXRpb24gZm9yIHRoaXMgc2ltcGxlIGNhc2UuXG5taWxsaXNlY29uZC5ldmVyeSA9IChrKSA9PiB7XG4gIGsgPSBNYXRoLmZsb29yKGspO1xuICBpZiAoIWlzRmluaXRlKGspIHx8ICEoayA+IDApKSByZXR1cm4gbnVsbDtcbiAgaWYgKCEoayA+IDEpKSByZXR1cm4gbWlsbGlzZWNvbmQ7XG4gIHJldHVybiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICBkYXRlLnNldFRpbWUoTWF0aC5mbG9vcihkYXRlIC8gaykgKiBrKTtcbiAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogayk7XG4gIH0sIChzdGFydCwgZW5kKSA9PiB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBrO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBtaWxsaXNlY29uZHMgPSBtaWxsaXNlY29uZC5yYW5nZTtcbiIsImV4cG9ydCBjb25zdCBkdXJhdGlvblNlY29uZCA9IDEwMDA7XG5leHBvcnQgY29uc3QgZHVyYXRpb25NaW51dGUgPSBkdXJhdGlvblNlY29uZCAqIDYwO1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uSG91ciA9IGR1cmF0aW9uTWludXRlICogNjA7XG5leHBvcnQgY29uc3QgZHVyYXRpb25EYXkgPSBkdXJhdGlvbkhvdXIgKiAyNDtcbmV4cG9ydCBjb25zdCBkdXJhdGlvbldlZWsgPSBkdXJhdGlvbkRheSAqIDc7XG5leHBvcnQgY29uc3QgZHVyYXRpb25Nb250aCA9IGR1cmF0aW9uRGF5ICogMzA7XG5leHBvcnQgY29uc3QgZHVyYXRpb25ZZWFyID0gZHVyYXRpb25EYXkgKiAzNjU7XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcbmltcG9ydCB7ZHVyYXRpb25TZWNvbmR9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBzZWNvbmQgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRUaW1lKGRhdGUgLSBkYXRlLmdldE1pbGxpc2Vjb25kcygpKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBkdXJhdGlvblNlY29uZCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uU2Vjb25kO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDU2Vjb25kcygpO1xufSk7XG5cbmV4cG9ydCBjb25zdCBzZWNvbmRzID0gc2Vjb25kLnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uTWludXRlLCBkdXJhdGlvblNlY29uZH0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVNaW51dGUgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRUaW1lKGRhdGUgLSBkYXRlLmdldE1pbGxpc2Vjb25kcygpIC0gZGF0ZS5nZXRTZWNvbmRzKCkgKiBkdXJhdGlvblNlY29uZCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25NaW51dGUpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbk1pbnV0ZTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldE1pbnV0ZXMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdGltZU1pbnV0ZXMgPSB0aW1lTWludXRlLnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjTWludXRlID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDU2Vjb25kcygwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBkdXJhdGlvbk1pbnV0ZSk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uTWludXRlO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDTWludXRlcygpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1dGNNaW51dGVzID0gdXRjTWludXRlLnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uSG91ciwgZHVyYXRpb25NaW51dGUsIGR1cmF0aW9uU2Vjb25kfSBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuXG5leHBvcnQgY29uc3QgdGltZUhvdXIgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRUaW1lKGRhdGUgLSBkYXRlLmdldE1pbGxpc2Vjb25kcygpIC0gZGF0ZS5nZXRTZWNvbmRzKCkgKiBkdXJhdGlvblNlY29uZCAtIGRhdGUuZ2V0TWludXRlcygpICogZHVyYXRpb25NaW51dGUpO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGR1cmF0aW9uSG91cik7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uSG91cjtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldEhvdXJzKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHRpbWVIb3VycyA9IHRpbWVIb3VyLnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjSG91ciA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ01pbnV0ZXMoMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25Ib3VyKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25Ib3VyO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDSG91cnMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdXRjSG91cnMgPSB1dGNIb3VyLnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uRGF5LCBkdXJhdGlvbk1pbnV0ZX0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVEYXkgPSB0aW1lSW50ZXJ2YWwoXG4gIGRhdGUgPT4gZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKSxcbiAgKGRhdGUsIHN0ZXApID0+IGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSArIHN0ZXApLFxuICAoc3RhcnQsIGVuZCkgPT4gKGVuZCAtIHN0YXJ0IC0gKGVuZC5nZXRUaW1lem9uZU9mZnNldCgpIC0gc3RhcnQuZ2V0VGltZXpvbmVPZmZzZXQoKSkgKiBkdXJhdGlvbk1pbnV0ZSkgLyBkdXJhdGlvbkRheSxcbiAgZGF0ZSA9PiBkYXRlLmdldERhdGUoKSAtIDFcbik7XG5cbmV4cG9ydCBjb25zdCB0aW1lRGF5cyA9IHRpbWVEYXkucmFuZ2U7XG5cbmV4cG9ydCBjb25zdCB1dGNEYXkgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VVRDRGF0ZShkYXRlLmdldFVUQ0RhdGUoKSArIHN0ZXApO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbkRheTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ0RhdGUoKSAtIDE7XG59KTtcblxuZXhwb3J0IGNvbnN0IHV0Y0RheXMgPSB1dGNEYXkucmFuZ2U7XG5cbmV4cG9ydCBjb25zdCB1bml4RGF5ID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25EYXk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gTWF0aC5mbG9vcihkYXRlIC8gZHVyYXRpb25EYXkpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1bml4RGF5cyA9IHVuaXhEYXkucmFuZ2U7XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcbmltcG9ydCB7ZHVyYXRpb25NaW51dGUsIGR1cmF0aW9uV2Vla30gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZnVuY3Rpb24gdGltZVdlZWtkYXkoaSkge1xuICByZXR1cm4gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gKGRhdGUuZ2V0RGF5KCkgKyA3IC0gaSkgJSA3KTtcbiAgICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSArIHN0ZXAgKiA3KTtcbiAgfSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgICByZXR1cm4gKGVuZCAtIHN0YXJ0IC0gKGVuZC5nZXRUaW1lem9uZU9mZnNldCgpIC0gc3RhcnQuZ2V0VGltZXpvbmVPZmZzZXQoKSkgKiBkdXJhdGlvbk1pbnV0ZSkgLyBkdXJhdGlvbldlZWs7XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgdGltZVN1bmRheSA9IHRpbWVXZWVrZGF5KDApO1xuZXhwb3J0IGNvbnN0IHRpbWVNb25kYXkgPSB0aW1lV2Vla2RheSgxKTtcbmV4cG9ydCBjb25zdCB0aW1lVHVlc2RheSA9IHRpbWVXZWVrZGF5KDIpO1xuZXhwb3J0IGNvbnN0IHRpbWVXZWRuZXNkYXkgPSB0aW1lV2Vla2RheSgzKTtcbmV4cG9ydCBjb25zdCB0aW1lVGh1cnNkYXkgPSB0aW1lV2Vla2RheSg0KTtcbmV4cG9ydCBjb25zdCB0aW1lRnJpZGF5ID0gdGltZVdlZWtkYXkoNSk7XG5leHBvcnQgY29uc3QgdGltZVNhdHVyZGF5ID0gdGltZVdlZWtkYXkoNik7XG5cbmV4cG9ydCBjb25zdCB0aW1lU3VuZGF5cyA9IHRpbWVTdW5kYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZU1vbmRheXMgPSB0aW1lTW9uZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVUdWVzZGF5cyA9IHRpbWVUdWVzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVXZWRuZXNkYXlzID0gdGltZVdlZG5lc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lVGh1cnNkYXlzID0gdGltZVRodXJzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVGcmlkYXlzID0gdGltZUZyaWRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lU2F0dXJkYXlzID0gdGltZVNhdHVyZGF5LnJhbmdlO1xuXG5mdW5jdGlvbiB1dGNXZWVrZGF5KGkpIHtcbiAgcmV0dXJuIHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICAgIGRhdGUuc2V0VVRDRGF0ZShkYXRlLmdldFVUQ0RhdGUoKSAtIChkYXRlLmdldFVUQ0RheSgpICsgNyAtIGkpICUgNyk7XG4gICAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgKyBzdGVwICogNyk7XG4gIH0sIChzdGFydCwgZW5kKSA9PiB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbldlZWs7XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgdXRjU3VuZGF5ID0gdXRjV2Vla2RheSgwKTtcbmV4cG9ydCBjb25zdCB1dGNNb25kYXkgPSB1dGNXZWVrZGF5KDEpO1xuZXhwb3J0IGNvbnN0IHV0Y1R1ZXNkYXkgPSB1dGNXZWVrZGF5KDIpO1xuZXhwb3J0IGNvbnN0IHV0Y1dlZG5lc2RheSA9IHV0Y1dlZWtkYXkoMyk7XG5leHBvcnQgY29uc3QgdXRjVGh1cnNkYXkgPSB1dGNXZWVrZGF5KDQpO1xuZXhwb3J0IGNvbnN0IHV0Y0ZyaWRheSA9IHV0Y1dlZWtkYXkoNSk7XG5leHBvcnQgY29uc3QgdXRjU2F0dXJkYXkgPSB1dGNXZWVrZGF5KDYpO1xuXG5leHBvcnQgY29uc3QgdXRjU3VuZGF5cyA9IHV0Y1N1bmRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNNb25kYXlzID0gdXRjTW9uZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y1R1ZXNkYXlzID0gdXRjVHVlc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNXZWRuZXNkYXlzID0gdXRjV2VkbmVzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y1RodXJzZGF5cyA9IHV0Y1RodXJzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y0ZyaWRheXMgPSB1dGNGcmlkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjU2F0dXJkYXlzID0gdXRjU2F0dXJkYXkucmFuZ2U7XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVNb250aCA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldERhdGUoMSk7XG4gIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldE1vbnRoKGRhdGUuZ2V0TW9udGgoKSArIHN0ZXApO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIGVuZC5nZXRNb250aCgpIC0gc3RhcnQuZ2V0TW9udGgoKSArIChlbmQuZ2V0RnVsbFllYXIoKSAtIHN0YXJ0LmdldEZ1bGxZZWFyKCkpICogMTI7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRNb250aCgpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB0aW1lTW9udGhzID0gdGltZU1vbnRoLnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjTW9udGggPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENEYXRlKDEpO1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRVVENNb250aChkYXRlLmdldFVUQ01vbnRoKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQuZ2V0VVRDTW9udGgoKSAtIHN0YXJ0LmdldFVUQ01vbnRoKCkgKyAoZW5kLmdldFVUQ0Z1bGxZZWFyKCkgLSBzdGFydC5nZXRVVENGdWxsWWVhcigpKSAqIDEyO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDTW9udGgoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdXRjTW9udGhzID0gdXRjTW9udGgucmFuZ2U7XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVZZWFyID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0TW9udGgoMCwgMSk7XG4gIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldEZ1bGxZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSArIHN0ZXApO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIGVuZC5nZXRGdWxsWWVhcigpIC0gc3RhcnQuZ2V0RnVsbFllYXIoKTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCk7XG59KTtcblxuLy8gQW4gb3B0aW1pemVkIGltcGxlbWVudGF0aW9uIGZvciB0aGlzIHNpbXBsZSBjYXNlLlxudGltZVllYXIuZXZlcnkgPSAoaykgPT4ge1xuICByZXR1cm4gIWlzRmluaXRlKGsgPSBNYXRoLmZsb29yKGspKSB8fCAhKGsgPiAwKSA/IG51bGwgOiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICBkYXRlLnNldEZ1bGxZZWFyKE1hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpIC8gaykgKiBrKTtcbiAgICBkYXRlLnNldE1vbnRoKDAsIDEpO1xuICAgIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBzdGVwICogayk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHRpbWVZZWFycyA9IHRpbWVZZWFyLnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjWWVhciA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ01vbnRoKDAsIDEpO1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRVVENGdWxsWWVhcihkYXRlLmdldFVUQ0Z1bGxZZWFyKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQuZ2V0VVRDRnVsbFllYXIoKSAtIHN0YXJ0LmdldFVUQ0Z1bGxZZWFyKCk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENGdWxsWWVhcigpO1xufSk7XG5cbi8vIEFuIG9wdGltaXplZCBpbXBsZW1lbnRhdGlvbiBmb3IgdGhpcyBzaW1wbGUgY2FzZS5cbnV0Y1llYXIuZXZlcnkgPSAoaykgPT4ge1xuICByZXR1cm4gIWlzRmluaXRlKGsgPSBNYXRoLmZsb29yKGspKSB8fCAhKGsgPiAwKSA/IG51bGwgOiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICBkYXRlLnNldFVUQ0Z1bGxZZWFyKE1hdGguZmxvb3IoZGF0ZS5nZXRVVENGdWxsWWVhcigpIC8gaykgKiBrKTtcbiAgICBkYXRlLnNldFVUQ01vbnRoKDAsIDEpO1xuICAgIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgZGF0ZS5zZXRVVENGdWxsWWVhcihkYXRlLmdldFVUQ0Z1bGxZZWFyKCkgKyBzdGVwICogayk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHV0Y1llYXJzID0gdXRjWWVhci5yYW5nZTtcbiIsImltcG9ydCB7YmlzZWN0b3IsIHRpY2tTdGVwfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7ZHVyYXRpb25EYXksIGR1cmF0aW9uSG91ciwgZHVyYXRpb25NaW51dGUsIGR1cmF0aW9uTW9udGgsIGR1cmF0aW9uU2Vjb25kLCBkdXJhdGlvbldlZWssIGR1cmF0aW9uWWVhcn0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcbmltcG9ydCB7bWlsbGlzZWNvbmR9IGZyb20gXCIuL21pbGxpc2Vjb25kLmpzXCI7XG5pbXBvcnQge3NlY29uZH0gZnJvbSBcIi4vc2Vjb25kLmpzXCI7XG5pbXBvcnQge3RpbWVNaW51dGUsIHV0Y01pbnV0ZX0gZnJvbSBcIi4vbWludXRlLmpzXCI7XG5pbXBvcnQge3RpbWVIb3VyLCB1dGNIb3VyfSBmcm9tIFwiLi9ob3VyLmpzXCI7XG5pbXBvcnQge3RpbWVEYXksIHVuaXhEYXl9IGZyb20gXCIuL2RheS5qc1wiO1xuaW1wb3J0IHt0aW1lU3VuZGF5LCB1dGNTdW5kYXl9IGZyb20gXCIuL3dlZWsuanNcIjtcbmltcG9ydCB7dGltZU1vbnRoLCB1dGNNb250aH0gZnJvbSBcIi4vbW9udGguanNcIjtcbmltcG9ydCB7dGltZVllYXIsIHV0Y1llYXJ9IGZyb20gXCIuL3llYXIuanNcIjtcblxuZnVuY3Rpb24gdGlja2VyKHllYXIsIG1vbnRoLCB3ZWVrLCBkYXksIGhvdXIsIG1pbnV0ZSkge1xuXG4gIGNvbnN0IHRpY2tJbnRlcnZhbHMgPSBbXG4gICAgW3NlY29uZCwgIDEsICAgICAgZHVyYXRpb25TZWNvbmRdLFxuICAgIFtzZWNvbmQsICA1LCAgNSAqIGR1cmF0aW9uU2Vjb25kXSxcbiAgICBbc2Vjb25kLCAxNSwgMTUgKiBkdXJhdGlvblNlY29uZF0sXG4gICAgW3NlY29uZCwgMzAsIDMwICogZHVyYXRpb25TZWNvbmRdLFxuICAgIFttaW51dGUsICAxLCAgICAgIGR1cmF0aW9uTWludXRlXSxcbiAgICBbbWludXRlLCAgNSwgIDUgKiBkdXJhdGlvbk1pbnV0ZV0sXG4gICAgW21pbnV0ZSwgMTUsIDE1ICogZHVyYXRpb25NaW51dGVdLFxuICAgIFttaW51dGUsIDMwLCAzMCAqIGR1cmF0aW9uTWludXRlXSxcbiAgICBbICBob3VyLCAgMSwgICAgICBkdXJhdGlvbkhvdXIgIF0sXG4gICAgWyAgaG91ciwgIDMsICAzICogZHVyYXRpb25Ib3VyICBdLFxuICAgIFsgIGhvdXIsICA2LCAgNiAqIGR1cmF0aW9uSG91ciAgXSxcbiAgICBbICBob3VyLCAxMiwgMTIgKiBkdXJhdGlvbkhvdXIgIF0sXG4gICAgWyAgIGRheSwgIDEsICAgICAgZHVyYXRpb25EYXkgICBdLFxuICAgIFsgICBkYXksICAyLCAgMiAqIGR1cmF0aW9uRGF5ICAgXSxcbiAgICBbICB3ZWVrLCAgMSwgICAgICBkdXJhdGlvbldlZWsgIF0sXG4gICAgWyBtb250aCwgIDEsICAgICAgZHVyYXRpb25Nb250aCBdLFxuICAgIFsgbW9udGgsICAzLCAgMyAqIGR1cmF0aW9uTW9udGggXSxcbiAgICBbICB5ZWFyLCAgMSwgICAgICBkdXJhdGlvblllYXIgIF1cbiAgXTtcblxuICBmdW5jdGlvbiB0aWNrcyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgICBjb25zdCByZXZlcnNlID0gc3RvcCA8IHN0YXJ0O1xuICAgIGlmIChyZXZlcnNlKSBbc3RhcnQsIHN0b3BdID0gW3N0b3AsIHN0YXJ0XTtcbiAgICBjb25zdCBpbnRlcnZhbCA9IGNvdW50ICYmIHR5cGVvZiBjb3VudC5yYW5nZSA9PT0gXCJmdW5jdGlvblwiID8gY291bnQgOiB0aWNrSW50ZXJ2YWwoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgICBjb25zdCB0aWNrcyA9IGludGVydmFsID8gaW50ZXJ2YWwucmFuZ2Uoc3RhcnQsICtzdG9wICsgMSkgOiBbXTsgLy8gaW5jbHVzaXZlIHN0b3BcbiAgICByZXR1cm4gcmV2ZXJzZSA/IHRpY2tzLnJldmVyc2UoKSA6IHRpY2tzO1xuICB9XG5cbiAgZnVuY3Rpb24gdGlja0ludGVydmFsKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IE1hdGguYWJzKHN0b3AgLSBzdGFydCkgLyBjb3VudDtcbiAgICBjb25zdCBpID0gYmlzZWN0b3IoKFssLCBzdGVwXSkgPT4gc3RlcCkucmlnaHQodGlja0ludGVydmFscywgdGFyZ2V0KTtcbiAgICBpZiAoaSA9PT0gdGlja0ludGVydmFscy5sZW5ndGgpIHJldHVybiB5ZWFyLmV2ZXJ5KHRpY2tTdGVwKHN0YXJ0IC8gZHVyYXRpb25ZZWFyLCBzdG9wIC8gZHVyYXRpb25ZZWFyLCBjb3VudCkpO1xuICAgIGlmIChpID09PSAwKSByZXR1cm4gbWlsbGlzZWNvbmQuZXZlcnkoTWF0aC5tYXgodGlja1N0ZXAoc3RhcnQsIHN0b3AsIGNvdW50KSwgMSkpO1xuICAgIGNvbnN0IFt0LCBzdGVwXSA9IHRpY2tJbnRlcnZhbHNbdGFyZ2V0IC8gdGlja0ludGVydmFsc1tpIC0gMV1bMl0gPCB0aWNrSW50ZXJ2YWxzW2ldWzJdIC8gdGFyZ2V0ID8gaSAtIDEgOiBpXTtcbiAgICByZXR1cm4gdC5ldmVyeShzdGVwKTtcbiAgfVxuXG4gIHJldHVybiBbdGlja3MsIHRpY2tJbnRlcnZhbF07XG59XG5cbmNvbnN0IFt1dGNUaWNrcywgdXRjVGlja0ludGVydmFsXSA9IHRpY2tlcih1dGNZZWFyLCB1dGNNb250aCwgdXRjU3VuZGF5LCB1bml4RGF5LCB1dGNIb3VyLCB1dGNNaW51dGUpO1xuY29uc3QgW3RpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbF0gPSB0aWNrZXIodGltZVllYXIsIHRpbWVNb250aCwgdGltZVN1bmRheSwgdGltZURheSwgdGltZUhvdXIsIHRpbWVNaW51dGUpO1xuXG5leHBvcnQge3V0Y1RpY2tzLCB1dGNUaWNrSW50ZXJ2YWwsIHRpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbH07XG4iLCJpbXBvcnQge1xuICB0aW1lRGF5LFxuICB0aW1lU3VuZGF5LFxuICB0aW1lTW9uZGF5LFxuICB0aW1lVGh1cnNkYXksXG4gIHRpbWVZZWFyLFxuICB1dGNEYXksXG4gIHV0Y1N1bmRheSxcbiAgdXRjTW9uZGF5LFxuICB1dGNUaHVyc2RheSxcbiAgdXRjWWVhclxufSBmcm9tIFwiZDMtdGltZVwiO1xuXG5mdW5jdGlvbiBsb2NhbERhdGUoZCkge1xuICBpZiAoMCA8PSBkLnkgJiYgZC55IDwgMTAwKSB7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgtMSwgZC5tLCBkLmQsIGQuSCwgZC5NLCBkLlMsIGQuTCk7XG4gICAgZGF0ZS5zZXRGdWxsWWVhcihkLnkpO1xuICAgIHJldHVybiBkYXRlO1xuICB9XG4gIHJldHVybiBuZXcgRGF0ZShkLnksIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpO1xufVxuXG5mdW5jdGlvbiB1dGNEYXRlKGQpIHtcbiAgaWYgKDAgPD0gZC55ICYmIGQueSA8IDEwMCkge1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoLTEsIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpKTtcbiAgICBkYXRlLnNldFVUQ0Z1bGxZZWFyKGQueSk7XG4gICAgcmV0dXJuIGRhdGU7XG4gIH1cbiAgcmV0dXJuIG5ldyBEYXRlKERhdGUuVVRDKGQueSwgZC5tLCBkLmQsIGQuSCwgZC5NLCBkLlMsIGQuTCkpO1xufVxuXG5mdW5jdGlvbiBuZXdEYXRlKHksIG0sIGQpIHtcbiAgcmV0dXJuIHt5OiB5LCBtOiBtLCBkOiBkLCBIOiAwLCBNOiAwLCBTOiAwLCBMOiAwfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZm9ybWF0TG9jYWxlKGxvY2FsZSkge1xuICB2YXIgbG9jYWxlX2RhdGVUaW1lID0gbG9jYWxlLmRhdGVUaW1lLFxuICAgICAgbG9jYWxlX2RhdGUgPSBsb2NhbGUuZGF0ZSxcbiAgICAgIGxvY2FsZV90aW1lID0gbG9jYWxlLnRpbWUsXG4gICAgICBsb2NhbGVfcGVyaW9kcyA9IGxvY2FsZS5wZXJpb2RzLFxuICAgICAgbG9jYWxlX3dlZWtkYXlzID0gbG9jYWxlLmRheXMsXG4gICAgICBsb2NhbGVfc2hvcnRXZWVrZGF5cyA9IGxvY2FsZS5zaG9ydERheXMsXG4gICAgICBsb2NhbGVfbW9udGhzID0gbG9jYWxlLm1vbnRocyxcbiAgICAgIGxvY2FsZV9zaG9ydE1vbnRocyA9IGxvY2FsZS5zaG9ydE1vbnRocztcblxuICB2YXIgcGVyaW9kUmUgPSBmb3JtYXRSZShsb2NhbGVfcGVyaW9kcyksXG4gICAgICBwZXJpb2RMb29rdXAgPSBmb3JtYXRMb29rdXAobG9jYWxlX3BlcmlvZHMpLFxuICAgICAgd2Vla2RheVJlID0gZm9ybWF0UmUobG9jYWxlX3dlZWtkYXlzKSxcbiAgICAgIHdlZWtkYXlMb29rdXAgPSBmb3JtYXRMb29rdXAobG9jYWxlX3dlZWtkYXlzKSxcbiAgICAgIHNob3J0V2Vla2RheVJlID0gZm9ybWF0UmUobG9jYWxlX3Nob3J0V2Vla2RheXMpLFxuICAgICAgc2hvcnRXZWVrZGF5TG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9zaG9ydFdlZWtkYXlzKSxcbiAgICAgIG1vbnRoUmUgPSBmb3JtYXRSZShsb2NhbGVfbW9udGhzKSxcbiAgICAgIG1vbnRoTG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9tb250aHMpLFxuICAgICAgc2hvcnRNb250aFJlID0gZm9ybWF0UmUobG9jYWxlX3Nob3J0TW9udGhzKSxcbiAgICAgIHNob3J0TW9udGhMb29rdXAgPSBmb3JtYXRMb29rdXAobG9jYWxlX3Nob3J0TW9udGhzKTtcblxuICB2YXIgZm9ybWF0cyA9IHtcbiAgICBcImFcIjogZm9ybWF0U2hvcnRXZWVrZGF5LFxuICAgIFwiQVwiOiBmb3JtYXRXZWVrZGF5LFxuICAgIFwiYlwiOiBmb3JtYXRTaG9ydE1vbnRoLFxuICAgIFwiQlwiOiBmb3JtYXRNb250aCxcbiAgICBcImNcIjogbnVsbCxcbiAgICBcImRcIjogZm9ybWF0RGF5T2ZNb250aCxcbiAgICBcImVcIjogZm9ybWF0RGF5T2ZNb250aCxcbiAgICBcImZcIjogZm9ybWF0TWljcm9zZWNvbmRzLFxuICAgIFwiZ1wiOiBmb3JtYXRZZWFySVNPLFxuICAgIFwiR1wiOiBmb3JtYXRGdWxsWWVhcklTTyxcbiAgICBcIkhcIjogZm9ybWF0SG91cjI0LFxuICAgIFwiSVwiOiBmb3JtYXRIb3VyMTIsXG4gICAgXCJqXCI6IGZvcm1hdERheU9mWWVhcixcbiAgICBcIkxcIjogZm9ybWF0TWlsbGlzZWNvbmRzLFxuICAgIFwibVwiOiBmb3JtYXRNb250aE51bWJlcixcbiAgICBcIk1cIjogZm9ybWF0TWludXRlcyxcbiAgICBcInBcIjogZm9ybWF0UGVyaW9kLFxuICAgIFwicVwiOiBmb3JtYXRRdWFydGVyLFxuICAgIFwiUVwiOiBmb3JtYXRVbml4VGltZXN0YW1wLFxuICAgIFwic1wiOiBmb3JtYXRVbml4VGltZXN0YW1wU2Vjb25kcyxcbiAgICBcIlNcIjogZm9ybWF0U2Vjb25kcyxcbiAgICBcInVcIjogZm9ybWF0V2Vla2RheU51bWJlck1vbmRheSxcbiAgICBcIlVcIjogZm9ybWF0V2Vla051bWJlclN1bmRheSxcbiAgICBcIlZcIjogZm9ybWF0V2Vla051bWJlcklTTyxcbiAgICBcIndcIjogZm9ybWF0V2Vla2RheU51bWJlclN1bmRheSxcbiAgICBcIldcIjogZm9ybWF0V2Vla051bWJlck1vbmRheSxcbiAgICBcInhcIjogbnVsbCxcbiAgICBcIlhcIjogbnVsbCxcbiAgICBcInlcIjogZm9ybWF0WWVhcixcbiAgICBcIllcIjogZm9ybWF0RnVsbFllYXIsXG4gICAgXCJaXCI6IGZvcm1hdFpvbmUsXG4gICAgXCIlXCI6IGZvcm1hdExpdGVyYWxQZXJjZW50XG4gIH07XG5cbiAgdmFyIHV0Y0Zvcm1hdHMgPSB7XG4gICAgXCJhXCI6IGZvcm1hdFVUQ1Nob3J0V2Vla2RheSxcbiAgICBcIkFcIjogZm9ybWF0VVRDV2Vla2RheSxcbiAgICBcImJcIjogZm9ybWF0VVRDU2hvcnRNb250aCxcbiAgICBcIkJcIjogZm9ybWF0VVRDTW9udGgsXG4gICAgXCJjXCI6IG51bGwsXG4gICAgXCJkXCI6IGZvcm1hdFVUQ0RheU9mTW9udGgsXG4gICAgXCJlXCI6IGZvcm1hdFVUQ0RheU9mTW9udGgsXG4gICAgXCJmXCI6IGZvcm1hdFVUQ01pY3Jvc2Vjb25kcyxcbiAgICBcImdcIjogZm9ybWF0VVRDWWVhcklTTyxcbiAgICBcIkdcIjogZm9ybWF0VVRDRnVsbFllYXJJU08sXG4gICAgXCJIXCI6IGZvcm1hdFVUQ0hvdXIyNCxcbiAgICBcIklcIjogZm9ybWF0VVRDSG91cjEyLFxuICAgIFwialwiOiBmb3JtYXRVVENEYXlPZlllYXIsXG4gICAgXCJMXCI6IGZvcm1hdFVUQ01pbGxpc2Vjb25kcyxcbiAgICBcIm1cIjogZm9ybWF0VVRDTW9udGhOdW1iZXIsXG4gICAgXCJNXCI6IGZvcm1hdFVUQ01pbnV0ZXMsXG4gICAgXCJwXCI6IGZvcm1hdFVUQ1BlcmlvZCxcbiAgICBcInFcIjogZm9ybWF0VVRDUXVhcnRlcixcbiAgICBcIlFcIjogZm9ybWF0VW5peFRpbWVzdGFtcCxcbiAgICBcInNcIjogZm9ybWF0VW5peFRpbWVzdGFtcFNlY29uZHMsXG4gICAgXCJTXCI6IGZvcm1hdFVUQ1NlY29uZHMsXG4gICAgXCJ1XCI6IGZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJNb25kYXksXG4gICAgXCJVXCI6IGZvcm1hdFVUQ1dlZWtOdW1iZXJTdW5kYXksXG4gICAgXCJWXCI6IGZvcm1hdFVUQ1dlZWtOdW1iZXJJU08sXG4gICAgXCJ3XCI6IGZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJTdW5kYXksXG4gICAgXCJXXCI6IGZvcm1hdFVUQ1dlZWtOdW1iZXJNb25kYXksXG4gICAgXCJ4XCI6IG51bGwsXG4gICAgXCJYXCI6IG51bGwsXG4gICAgXCJ5XCI6IGZvcm1hdFVUQ1llYXIsXG4gICAgXCJZXCI6IGZvcm1hdFVUQ0Z1bGxZZWFyLFxuICAgIFwiWlwiOiBmb3JtYXRVVENab25lLFxuICAgIFwiJVwiOiBmb3JtYXRMaXRlcmFsUGVyY2VudFxuICB9O1xuXG4gIHZhciBwYXJzZXMgPSB7XG4gICAgXCJhXCI6IHBhcnNlU2hvcnRXZWVrZGF5LFxuICAgIFwiQVwiOiBwYXJzZVdlZWtkYXksXG4gICAgXCJiXCI6IHBhcnNlU2hvcnRNb250aCxcbiAgICBcIkJcIjogcGFyc2VNb250aCxcbiAgICBcImNcIjogcGFyc2VMb2NhbGVEYXRlVGltZSxcbiAgICBcImRcIjogcGFyc2VEYXlPZk1vbnRoLFxuICAgIFwiZVwiOiBwYXJzZURheU9mTW9udGgsXG4gICAgXCJmXCI6IHBhcnNlTWljcm9zZWNvbmRzLFxuICAgIFwiZ1wiOiBwYXJzZVllYXIsXG4gICAgXCJHXCI6IHBhcnNlRnVsbFllYXIsXG4gICAgXCJIXCI6IHBhcnNlSG91cjI0LFxuICAgIFwiSVwiOiBwYXJzZUhvdXIyNCxcbiAgICBcImpcIjogcGFyc2VEYXlPZlllYXIsXG4gICAgXCJMXCI6IHBhcnNlTWlsbGlzZWNvbmRzLFxuICAgIFwibVwiOiBwYXJzZU1vbnRoTnVtYmVyLFxuICAgIFwiTVwiOiBwYXJzZU1pbnV0ZXMsXG4gICAgXCJwXCI6IHBhcnNlUGVyaW9kLFxuICAgIFwicVwiOiBwYXJzZVF1YXJ0ZXIsXG4gICAgXCJRXCI6IHBhcnNlVW5peFRpbWVzdGFtcCxcbiAgICBcInNcIjogcGFyc2VVbml4VGltZXN0YW1wU2Vjb25kcyxcbiAgICBcIlNcIjogcGFyc2VTZWNvbmRzLFxuICAgIFwidVwiOiBwYXJzZVdlZWtkYXlOdW1iZXJNb25kYXksXG4gICAgXCJVXCI6IHBhcnNlV2Vla051bWJlclN1bmRheSxcbiAgICBcIlZcIjogcGFyc2VXZWVrTnVtYmVySVNPLFxuICAgIFwid1wiOiBwYXJzZVdlZWtkYXlOdW1iZXJTdW5kYXksXG4gICAgXCJXXCI6IHBhcnNlV2Vla051bWJlck1vbmRheSxcbiAgICBcInhcIjogcGFyc2VMb2NhbGVEYXRlLFxuICAgIFwiWFwiOiBwYXJzZUxvY2FsZVRpbWUsXG4gICAgXCJ5XCI6IHBhcnNlWWVhcixcbiAgICBcIllcIjogcGFyc2VGdWxsWWVhcixcbiAgICBcIlpcIjogcGFyc2Vab25lLFxuICAgIFwiJVwiOiBwYXJzZUxpdGVyYWxQZXJjZW50XG4gIH07XG5cbiAgLy8gVGhlc2UgcmVjdXJzaXZlIGRpcmVjdGl2ZSBkZWZpbml0aW9ucyBtdXN0IGJlIGRlZmVycmVkLlxuICBmb3JtYXRzLnggPSBuZXdGb3JtYXQobG9jYWxlX2RhdGUsIGZvcm1hdHMpO1xuICBmb3JtYXRzLlggPSBuZXdGb3JtYXQobG9jYWxlX3RpbWUsIGZvcm1hdHMpO1xuICBmb3JtYXRzLmMgPSBuZXdGb3JtYXQobG9jYWxlX2RhdGVUaW1lLCBmb3JtYXRzKTtcbiAgdXRjRm9ybWF0cy54ID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlLCB1dGNGb3JtYXRzKTtcbiAgdXRjRm9ybWF0cy5YID0gbmV3Rm9ybWF0KGxvY2FsZV90aW1lLCB1dGNGb3JtYXRzKTtcbiAgdXRjRm9ybWF0cy5jID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlVGltZSwgdXRjRm9ybWF0cyk7XG5cbiAgZnVuY3Rpb24gbmV3Rm9ybWF0KHNwZWNpZmllciwgZm9ybWF0cykge1xuICAgIHJldHVybiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICB2YXIgc3RyaW5nID0gW10sXG4gICAgICAgICAgaSA9IC0xLFxuICAgICAgICAgIGogPSAwLFxuICAgICAgICAgIG4gPSBzcGVjaWZpZXIubGVuZ3RoLFxuICAgICAgICAgIGMsXG4gICAgICAgICAgcGFkLFxuICAgICAgICAgIGZvcm1hdDtcblxuICAgICAgaWYgKCEoZGF0ZSBpbnN0YW5jZW9mIERhdGUpKSBkYXRlID0gbmV3IERhdGUoK2RhdGUpO1xuXG4gICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICBpZiAoc3BlY2lmaWVyLmNoYXJDb2RlQXQoaSkgPT09IDM3KSB7XG4gICAgICAgICAgc3RyaW5nLnB1c2goc3BlY2lmaWVyLnNsaWNlKGosIGkpKTtcbiAgICAgICAgICBpZiAoKHBhZCA9IHBhZHNbYyA9IHNwZWNpZmllci5jaGFyQXQoKytpKV0pICE9IG51bGwpIGMgPSBzcGVjaWZpZXIuY2hhckF0KCsraSk7XG4gICAgICAgICAgZWxzZSBwYWQgPSBjID09PSBcImVcIiA/IFwiIFwiIDogXCIwXCI7XG4gICAgICAgICAgaWYgKGZvcm1hdCA9IGZvcm1hdHNbY10pIGMgPSBmb3JtYXQoZGF0ZSwgcGFkKTtcbiAgICAgICAgICBzdHJpbmcucHVzaChjKTtcbiAgICAgICAgICBqID0gaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3RyaW5nLnB1c2goc3BlY2lmaWVyLnNsaWNlKGosIGkpKTtcbiAgICAgIHJldHVybiBzdHJpbmcuam9pbihcIlwiKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gbmV3UGFyc2Uoc3BlY2lmaWVyLCBaKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgdmFyIGQgPSBuZXdEYXRlKDE5MDAsIHVuZGVmaW5lZCwgMSksXG4gICAgICAgICAgaSA9IHBhcnNlU3BlY2lmaWVyKGQsIHNwZWNpZmllciwgc3RyaW5nICs9IFwiXCIsIDApLFxuICAgICAgICAgIHdlZWssIGRheTtcbiAgICAgIGlmIChpICE9IHN0cmluZy5sZW5ndGgpIHJldHVybiBudWxsO1xuXG4gICAgICAvLyBJZiBhIFVOSVggdGltZXN0YW1wIGlzIHNwZWNpZmllZCwgcmV0dXJuIGl0LlxuICAgICAgaWYgKFwiUVwiIGluIGQpIHJldHVybiBuZXcgRGF0ZShkLlEpO1xuICAgICAgaWYgKFwic1wiIGluIGQpIHJldHVybiBuZXcgRGF0ZShkLnMgKiAxMDAwICsgKFwiTFwiIGluIGQgPyBkLkwgOiAwKSk7XG5cbiAgICAgIC8vIElmIHRoaXMgaXMgdXRjUGFyc2UsIG5ldmVyIHVzZSB0aGUgbG9jYWwgdGltZXpvbmUuXG4gICAgICBpZiAoWiAmJiAhKFwiWlwiIGluIGQpKSBkLlogPSAwO1xuXG4gICAgICAvLyBUaGUgYW0tcG0gZmxhZyBpcyAwIGZvciBBTSwgYW5kIDEgZm9yIFBNLlxuICAgICAgaWYgKFwicFwiIGluIGQpIGQuSCA9IGQuSCAlIDEyICsgZC5wICogMTI7XG5cbiAgICAgIC8vIElmIHRoZSBtb250aCB3YXMgbm90IHNwZWNpZmllZCwgaW5oZXJpdCBmcm9tIHRoZSBxdWFydGVyLlxuICAgICAgaWYgKGQubSA9PT0gdW5kZWZpbmVkKSBkLm0gPSBcInFcIiBpbiBkID8gZC5xIDogMDtcblxuICAgICAgLy8gQ29udmVydCBkYXktb2Ytd2VlayBhbmQgd2Vlay1vZi15ZWFyIHRvIGRheS1vZi15ZWFyLlxuICAgICAgaWYgKFwiVlwiIGluIGQpIHtcbiAgICAgICAgaWYgKGQuViA8IDEgfHwgZC5WID4gNTMpIHJldHVybiBudWxsO1xuICAgICAgICBpZiAoIShcIndcIiBpbiBkKSkgZC53ID0gMTtcbiAgICAgICAgaWYgKFwiWlwiIGluIGQpIHtcbiAgICAgICAgICB3ZWVrID0gdXRjRGF0ZShuZXdEYXRlKGQueSwgMCwgMSkpLCBkYXkgPSB3ZWVrLmdldFVUQ0RheSgpO1xuICAgICAgICAgIHdlZWsgPSBkYXkgPiA0IHx8IGRheSA9PT0gMCA/IHV0Y01vbmRheS5jZWlsKHdlZWspIDogdXRjTW9uZGF5KHdlZWspO1xuICAgICAgICAgIHdlZWsgPSB1dGNEYXkub2Zmc2V0KHdlZWssIChkLlYgLSAxKSAqIDcpO1xuICAgICAgICAgIGQueSA9IHdlZWsuZ2V0VVRDRnVsbFllYXIoKTtcbiAgICAgICAgICBkLm0gPSB3ZWVrLmdldFVUQ01vbnRoKCk7XG4gICAgICAgICAgZC5kID0gd2Vlay5nZXRVVENEYXRlKCkgKyAoZC53ICsgNikgJSA3O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdlZWsgPSBsb2NhbERhdGUobmV3RGF0ZShkLnksIDAsIDEpKSwgZGF5ID0gd2Vlay5nZXREYXkoKTtcbiAgICAgICAgICB3ZWVrID0gZGF5ID4gNCB8fCBkYXkgPT09IDAgPyB0aW1lTW9uZGF5LmNlaWwod2VlaykgOiB0aW1lTW9uZGF5KHdlZWspO1xuICAgICAgICAgIHdlZWsgPSB0aW1lRGF5Lm9mZnNldCh3ZWVrLCAoZC5WIC0gMSkgKiA3KTtcbiAgICAgICAgICBkLnkgPSB3ZWVrLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgZC5tID0gd2Vlay5nZXRNb250aCgpO1xuICAgICAgICAgIGQuZCA9IHdlZWsuZ2V0RGF0ZSgpICsgKGQudyArIDYpICUgNztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChcIldcIiBpbiBkIHx8IFwiVVwiIGluIGQpIHtcbiAgICAgICAgaWYgKCEoXCJ3XCIgaW4gZCkpIGQudyA9IFwidVwiIGluIGQgPyBkLnUgJSA3IDogXCJXXCIgaW4gZCA/IDEgOiAwO1xuICAgICAgICBkYXkgPSBcIlpcIiBpbiBkID8gdXRjRGF0ZShuZXdEYXRlKGQueSwgMCwgMSkpLmdldFVUQ0RheSgpIDogbG9jYWxEYXRlKG5ld0RhdGUoZC55LCAwLCAxKSkuZ2V0RGF5KCk7XG4gICAgICAgIGQubSA9IDA7XG4gICAgICAgIGQuZCA9IFwiV1wiIGluIGQgPyAoZC53ICsgNikgJSA3ICsgZC5XICogNyAtIChkYXkgKyA1KSAlIDcgOiBkLncgKyBkLlUgKiA3IC0gKGRheSArIDYpICUgNztcbiAgICAgIH1cblxuICAgICAgLy8gSWYgYSB0aW1lIHpvbmUgaXMgc3BlY2lmaWVkLCBhbGwgZmllbGRzIGFyZSBpbnRlcnByZXRlZCBhcyBVVEMgYW5kIHRoZW5cbiAgICAgIC8vIG9mZnNldCBhY2NvcmRpbmcgdG8gdGhlIHNwZWNpZmllZCB0aW1lIHpvbmUuXG4gICAgICBpZiAoXCJaXCIgaW4gZCkge1xuICAgICAgICBkLkggKz0gZC5aIC8gMTAwIHwgMDtcbiAgICAgICAgZC5NICs9IGQuWiAlIDEwMDtcbiAgICAgICAgcmV0dXJuIHV0Y0RhdGUoZCk7XG4gICAgICB9XG5cbiAgICAgIC8vIE90aGVyd2lzZSwgYWxsIGZpZWxkcyBhcmUgaW4gbG9jYWwgdGltZS5cbiAgICAgIHJldHVybiBsb2NhbERhdGUoZCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlU3BlY2lmaWVyKGQsIHNwZWNpZmllciwgc3RyaW5nLCBqKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgICBuID0gc3BlY2lmaWVyLmxlbmd0aCxcbiAgICAgICAgbSA9IHN0cmluZy5sZW5ndGgsXG4gICAgICAgIGMsXG4gICAgICAgIHBhcnNlO1xuXG4gICAgd2hpbGUgKGkgPCBuKSB7XG4gICAgICBpZiAoaiA+PSBtKSByZXR1cm4gLTE7XG4gICAgICBjID0gc3BlY2lmaWVyLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgIGlmIChjID09PSAzNykge1xuICAgICAgICBjID0gc3BlY2lmaWVyLmNoYXJBdChpKyspO1xuICAgICAgICBwYXJzZSA9IHBhcnNlc1tjIGluIHBhZHMgPyBzcGVjaWZpZXIuY2hhckF0KGkrKykgOiBjXTtcbiAgICAgICAgaWYgKCFwYXJzZSB8fCAoKGogPSBwYXJzZShkLCBzdHJpbmcsIGopKSA8IDApKSByZXR1cm4gLTE7XG4gICAgICB9IGVsc2UgaWYgKGMgIT0gc3RyaW5nLmNoYXJDb2RlQXQoaisrKSkge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGo7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVBlcmlvZChkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IHBlcmlvZFJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLnAgPSBwZXJpb2RMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlU2hvcnRXZWVrZGF5KGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gc2hvcnRXZWVrZGF5UmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICAgIHJldHVybiBuID8gKGQudyA9IHNob3J0V2Vla2RheUxvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VXZWVrZGF5KGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gd2Vla2RheVJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLncgPSB3ZWVrZGF5TG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVNob3J0TW9udGgoZCwgc3RyaW5nLCBpKSB7XG4gICAgdmFyIG4gPSBzaG9ydE1vbnRoUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICAgIHJldHVybiBuID8gKGQubSA9IHNob3J0TW9udGhMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTW9udGgoZCwgc3RyaW5nLCBpKSB7XG4gICAgdmFyIG4gPSBtb250aFJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLm0gPSBtb250aExvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VMb2NhbGVEYXRlVGltZShkLCBzdHJpbmcsIGkpIHtcbiAgICByZXR1cm4gcGFyc2VTcGVjaWZpZXIoZCwgbG9jYWxlX2RhdGVUaW1lLCBzdHJpbmcsIGkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VMb2NhbGVEYXRlKGQsIHN0cmluZywgaSkge1xuICAgIHJldHVybiBwYXJzZVNwZWNpZmllcihkLCBsb2NhbGVfZGF0ZSwgc3RyaW5nLCBpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTG9jYWxlVGltZShkLCBzdHJpbmcsIGkpIHtcbiAgICByZXR1cm4gcGFyc2VTcGVjaWZpZXIoZCwgbG9jYWxlX3RpbWUsIHN0cmluZywgaSk7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRTaG9ydFdlZWtkYXkoZCkge1xuICAgIHJldHVybiBsb2NhbGVfc2hvcnRXZWVrZGF5c1tkLmdldERheSgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFdlZWtkYXkoZCkge1xuICAgIHJldHVybiBsb2NhbGVfd2Vla2RheXNbZC5nZXREYXkoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRTaG9ydE1vbnRoKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3Nob3J0TW9udGhzW2QuZ2V0TW9udGgoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRNb250aChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9tb250aHNbZC5nZXRNb250aCgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFBlcmlvZChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9wZXJpb2RzWysoZC5nZXRIb3VycygpID49IDEyKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRRdWFydGVyKGQpIHtcbiAgICByZXR1cm4gMSArIH5+KGQuZ2V0TW9udGgoKSAvIDMpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDU2hvcnRXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3Nob3J0V2Vla2RheXNbZC5nZXRVVENEYXkoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRVVENXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3dlZWtkYXlzW2QuZ2V0VVRDRGF5KCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDU2hvcnRNb250aChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9zaG9ydE1vbnRoc1tkLmdldFVUQ01vbnRoKCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDTW9udGgoZCkge1xuICAgIHJldHVybiBsb2NhbGVfbW9udGhzW2QuZ2V0VVRDTW9udGgoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRVVENQZXJpb2QoZCkge1xuICAgIHJldHVybiBsb2NhbGVfcGVyaW9kc1srKGQuZ2V0VVRDSG91cnMoKSA+PSAxMildO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDUXVhcnRlcihkKSB7XG4gICAgcmV0dXJuIDEgKyB+fihkLmdldFVUQ01vbnRoKCkgLyAzKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZm9ybWF0OiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBmID0gbmV3Rm9ybWF0KHNwZWNpZmllciArPSBcIlwiLCBmb3JtYXRzKTtcbiAgICAgIGYudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBmO1xuICAgIH0sXG4gICAgcGFyc2U6IGZ1bmN0aW9uKHNwZWNpZmllcikge1xuICAgICAgdmFyIHAgPSBuZXdQYXJzZShzcGVjaWZpZXIgKz0gXCJcIiwgZmFsc2UpO1xuICAgICAgcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3BlY2lmaWVyOyB9O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfSxcbiAgICB1dGNGb3JtYXQ6IGZ1bmN0aW9uKHNwZWNpZmllcikge1xuICAgICAgdmFyIGYgPSBuZXdGb3JtYXQoc3BlY2lmaWVyICs9IFwiXCIsIHV0Y0Zvcm1hdHMpO1xuICAgICAgZi50b1N0cmluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3BlY2lmaWVyOyB9O1xuICAgICAgcmV0dXJuIGY7XG4gICAgfSxcbiAgICB1dGNQYXJzZTogZnVuY3Rpb24oc3BlY2lmaWVyKSB7XG4gICAgICB2YXIgcCA9IG5ld1BhcnNlKHNwZWNpZmllciArPSBcIlwiLCB0cnVlKTtcbiAgICAgIHAudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgfTtcbn1cblxudmFyIHBhZHMgPSB7XCItXCI6IFwiXCIsIFwiX1wiOiBcIiBcIiwgXCIwXCI6IFwiMFwifSxcbiAgICBudW1iZXJSZSA9IC9eXFxzKlxcZCsvLCAvLyBub3RlOiBpZ25vcmVzIG5leHQgZGlyZWN0aXZlXG4gICAgcGVyY2VudFJlID0gL14lLyxcbiAgICByZXF1b3RlUmUgPSAvW1xcXFxeJCorP3xbXFxdKCkue31dL2c7XG5cbmZ1bmN0aW9uIHBhZCh2YWx1ZSwgZmlsbCwgd2lkdGgpIHtcbiAgdmFyIHNpZ24gPSB2YWx1ZSA8IDAgPyBcIi1cIiA6IFwiXCIsXG4gICAgICBzdHJpbmcgPSAoc2lnbiA/IC12YWx1ZSA6IHZhbHVlKSArIFwiXCIsXG4gICAgICBsZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICByZXR1cm4gc2lnbiArIChsZW5ndGggPCB3aWR0aCA/IG5ldyBBcnJheSh3aWR0aCAtIGxlbmd0aCArIDEpLmpvaW4oZmlsbCkgKyBzdHJpbmcgOiBzdHJpbmcpO1xufVxuXG5mdW5jdGlvbiByZXF1b3RlKHMpIHtcbiAgcmV0dXJuIHMucmVwbGFjZShyZXF1b3RlUmUsIFwiXFxcXCQmXCIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRSZShuYW1lcykge1xuICByZXR1cm4gbmV3IFJlZ0V4cChcIl4oPzpcIiArIG5hbWVzLm1hcChyZXF1b3RlKS5qb2luKFwifFwiKSArIFwiKVwiLCBcImlcIik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdExvb2t1cChuYW1lcykge1xuICByZXR1cm4gbmV3IE1hcChuYW1lcy5tYXAoKG5hbWUsIGkpID0+IFtuYW1lLnRvTG93ZXJDYXNlKCksIGldKSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2Vla2RheU51bWJlclN1bmRheShkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMSkpO1xuICByZXR1cm4gbiA/IChkLncgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtkYXlOdW1iZXJNb25kYXkoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyAoZC51ID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrTnVtYmVyU3VuZGF5KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuVSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2Vla051bWJlcklTTyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLlYgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtOdW1iZXJNb25kYXkoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5XID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VGdWxsWWVhcihkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgNCkpO1xuICByZXR1cm4gbiA/IChkLnkgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVllYXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC55ID0gK25bMF0gKyAoK25bMF0gPiA2OCA/IDE5MDAgOiAyMDAwKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVpvbmUoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gL14oWil8KFsrLV1cXGRcXGQpKD86Oj8oXFxkXFxkKSk/Ly5leGVjKHN0cmluZy5zbGljZShpLCBpICsgNikpO1xuICByZXR1cm4gbiA/IChkLlogPSBuWzFdID8gMCA6IC0oblsyXSArIChuWzNdIHx8IFwiMDBcIikpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlUXVhcnRlcihkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMSkpO1xuICByZXR1cm4gbiA/IChkLnEgPSBuWzBdICogMyAtIDMsIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNb250aE51bWJlcihkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLm0gPSBuWzBdIC0gMSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZURheU9mTW9udGgoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5kID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VEYXlPZlllYXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDMpKTtcbiAgcmV0dXJuIG4gPyAoZC5tID0gMCwgZC5kID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VIb3VyMjQoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5IID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNaW51dGVzKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuTSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU2Vjb25kcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLlMgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZU1pbGxpc2Vjb25kcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMykpO1xuICByZXR1cm4gbiA/IChkLkwgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZU1pY3Jvc2Vjb25kcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgNikpO1xuICByZXR1cm4gbiA/IChkLkwgPSBNYXRoLmZsb29yKG5bMF0gLyAxMDAwKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZUxpdGVyYWxQZXJjZW50KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IHBlcmNlbnRSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMSkpO1xuICByZXR1cm4gbiA/IGkgKyBuWzBdLmxlbmd0aCA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVVuaXhUaW1lc3RhbXAoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICByZXR1cm4gbiA/IChkLlEgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVVuaXhUaW1lc3RhbXBTZWNvbmRzKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgcmV0dXJuIG4gPyAoZC5zID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF5T2ZNb250aChkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXREYXRlKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRIb3VyMjQoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0SG91cnMoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEhvdXIxMihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRIb3VycygpICUgMTIgfHwgMTIsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXlPZlllYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKDEgKyB0aW1lRGF5LmNvdW50KHRpbWVZZWFyKGQpLCBkKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdE1pbGxpc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRNaWxsaXNlY29uZHMoKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdE1pY3Jvc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBmb3JtYXRNaWxsaXNlY29uZHMoZCwgcCkgKyBcIjAwMFwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNb250aE51bWJlcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRNb250aCgpICsgMSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdE1pbnV0ZXMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0TWludXRlcygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0U2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRTZWNvbmRzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrZGF5TnVtYmVyTW9uZGF5KGQpIHtcbiAgdmFyIGRheSA9IGQuZ2V0RGF5KCk7XG4gIHJldHVybiBkYXkgPT09IDAgPyA3IDogZGF5O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrTnVtYmVyU3VuZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh0aW1lU3VuZGF5LmNvdW50KHRpbWVZZWFyKGQpIC0gMSwgZCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBkSVNPKGQpIHtcbiAgdmFyIGRheSA9IGQuZ2V0RGF5KCk7XG4gIHJldHVybiAoZGF5ID49IDQgfHwgZGF5ID09PSAwKSA/IHRpbWVUaHVyc2RheShkKSA6IHRpbWVUaHVyc2RheS5jZWlsKGQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrTnVtYmVySVNPKGQsIHApIHtcbiAgZCA9IGRJU08oZCk7XG4gIHJldHVybiBwYWQodGltZVRodXJzZGF5LmNvdW50KHRpbWVZZWFyKGQpLCBkKSArICh0aW1lWWVhcihkKS5nZXREYXkoKSA9PT0gNCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrZGF5TnVtYmVyU3VuZGF5KGQpIHtcbiAgcmV0dXJuIGQuZ2V0RGF5KCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFdlZWtOdW1iZXJNb25kYXkoZCwgcCkge1xuICByZXR1cm4gcGFkKHRpbWVNb25kYXkuY291bnQodGltZVllYXIoZCkgLSAxLCBkKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFllYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0RnVsbFllYXIoKSAlIDEwMCwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFllYXJJU08oZCwgcCkge1xuICBkID0gZElTTyhkKTtcbiAgcmV0dXJuIHBhZChkLmdldEZ1bGxZZWFyKCkgJSAxMDAsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRGdWxsWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRGdWxsWWVhcklTTyhkLCBwKSB7XG4gIHZhciBkYXkgPSBkLmdldERheSgpO1xuICBkID0gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB0aW1lVGh1cnNkYXkoZCkgOiB0aW1lVGh1cnNkYXkuY2VpbChkKTtcbiAgcmV0dXJuIHBhZChkLmdldEZ1bGxZZWFyKCkgJSAxMDAwMCwgcCwgNCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFpvbmUoZCkge1xuICB2YXIgeiA9IGQuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgcmV0dXJuICh6ID4gMCA/IFwiLVwiIDogKHogKj0gLTEsIFwiK1wiKSlcbiAgICAgICsgcGFkKHogLyA2MCB8IDAsIFwiMFwiLCAyKVxuICAgICAgKyBwYWQoeiAlIDYwLCBcIjBcIiwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0RheU9mTW9udGgoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDRGF0ZSgpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDSG91cjI0KGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0hvdXJzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENIb3VyMTIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDSG91cnMoKSAlIDEyIHx8IDEyLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDRGF5T2ZZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZCgxICsgdXRjRGF5LmNvdW50KHV0Y1llYXIoZCksIGQpLCBwLCAzKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDTWlsbGlzZWNvbmRzKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ01pbGxpc2Vjb25kcygpLCBwLCAzKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDTWljcm9zZWNvbmRzKGQsIHApIHtcbiAgcmV0dXJuIGZvcm1hdFVUQ01pbGxpc2Vjb25kcyhkLCBwKSArIFwiMDAwXCI7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01vbnRoTnVtYmVyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ01vbnRoKCkgKyAxLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDTWludXRlcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENNaW51dGVzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENTZWNvbmRzKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ1NlY29uZHMoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJNb25kYXkoZCkge1xuICB2YXIgZG93ID0gZC5nZXRVVENEYXkoKTtcbiAgcmV0dXJuIGRvdyA9PT0gMCA/IDcgOiBkb3c7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtOdW1iZXJTdW5kYXkoZCwgcCkge1xuICByZXR1cm4gcGFkKHV0Y1N1bmRheS5jb3VudCh1dGNZZWFyKGQpIC0gMSwgZCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBVVENkSVNPKGQpIHtcbiAgdmFyIGRheSA9IGQuZ2V0VVRDRGF5KCk7XG4gIHJldHVybiAoZGF5ID49IDQgfHwgZGF5ID09PSAwKSA/IHV0Y1RodXJzZGF5KGQpIDogdXRjVGh1cnNkYXkuY2VpbChkKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDV2Vla051bWJlcklTTyhkLCBwKSB7XG4gIGQgPSBVVENkSVNPKGQpO1xuICByZXR1cm4gcGFkKHV0Y1RodXJzZGF5LmNvdW50KHV0Y1llYXIoZCksIGQpICsgKHV0Y1llYXIoZCkuZ2V0VVRDRGF5KCkgPT09IDQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDV2Vla2RheU51bWJlclN1bmRheShkKSB7XG4gIHJldHVybiBkLmdldFVUQ0RheSgpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrTnVtYmVyTW9uZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh1dGNNb25kYXkuY291bnQodXRjWWVhcihkKSAtIDEsIGQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENGdWxsWWVhcigpICUgMTAwLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDWWVhcklTTyhkLCBwKSB7XG4gIGQgPSBVVENkSVNPKGQpO1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDRnVsbFllYXIoKSAlIDEwMCwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0Z1bGxZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0Z1bGxZZWFyKCkgJSAxMDAwMCwgcCwgNCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0Z1bGxZZWFySVNPKGQsIHApIHtcbiAgdmFyIGRheSA9IGQuZ2V0VVRDRGF5KCk7XG4gIGQgPSAoZGF5ID49IDQgfHwgZGF5ID09PSAwKSA/IHV0Y1RodXJzZGF5KGQpIDogdXRjVGh1cnNkYXkuY2VpbChkKTtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0Z1bGxZZWFyKCkgJSAxMDAwMCwgcCwgNCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1pvbmUoKSB7XG4gIHJldHVybiBcIiswMDAwXCI7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdExpdGVyYWxQZXJjZW50KCkge1xuICByZXR1cm4gXCIlXCI7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVuaXhUaW1lc3RhbXAoZCkge1xuICByZXR1cm4gK2Q7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVuaXhUaW1lc3RhbXBTZWNvbmRzKGQpIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoK2QgLyAxMDAwKTtcbn1cbiIsImltcG9ydCBmb3JtYXRMb2NhbGUgZnJvbSBcIi4vbG9jYWxlLmpzXCI7XG5cbnZhciBsb2NhbGU7XG5leHBvcnQgdmFyIHRpbWVGb3JtYXQ7XG5leHBvcnQgdmFyIHRpbWVQYXJzZTtcbmV4cG9ydCB2YXIgdXRjRm9ybWF0O1xuZXhwb3J0IHZhciB1dGNQYXJzZTtcblxuZGVmYXVsdExvY2FsZSh7XG4gIGRhdGVUaW1lOiBcIiV4LCAlWFwiLFxuICBkYXRlOiBcIiUtbS8lLWQvJVlcIixcbiAgdGltZTogXCIlLUk6JU06JVMgJXBcIixcbiAgcGVyaW9kczogW1wiQU1cIiwgXCJQTVwiXSxcbiAgZGF5czogW1wiU3VuZGF5XCIsIFwiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIl0sXG4gIHNob3J0RGF5czogW1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdLFxuICBtb250aHM6IFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdLFxuICBzaG9ydE1vbnRoczogW1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCJdXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVmYXVsdExvY2FsZShkZWZpbml0aW9uKSB7XG4gIGxvY2FsZSA9IGZvcm1hdExvY2FsZShkZWZpbml0aW9uKTtcbiAgdGltZUZvcm1hdCA9IGxvY2FsZS5mb3JtYXQ7XG4gIHRpbWVQYXJzZSA9IGxvY2FsZS5wYXJzZTtcbiAgdXRjRm9ybWF0ID0gbG9jYWxlLnV0Y0Zvcm1hdDtcbiAgdXRjUGFyc2UgPSBsb2NhbGUudXRjUGFyc2U7XG4gIHJldHVybiBsb2NhbGU7XG59XG4iLCJpbXBvcnQge3RpbWVZZWFyLCB0aW1lTW9udGgsIHRpbWVXZWVrLCB0aW1lRGF5LCB0aW1lSG91ciwgdGltZU1pbnV0ZSwgdGltZVNlY29uZCwgdGltZVRpY2tzLCB0aW1lVGlja0ludGVydmFsfSBmcm9tIFwiZDMtdGltZVwiO1xuaW1wb3J0IHt0aW1lRm9ybWF0fSBmcm9tIFwiZDMtdGltZS1mb3JtYXRcIjtcbmltcG9ydCBjb250aW51b3VzLCB7Y29weX0gZnJvbSBcIi4vY29udGludW91cy5qc1wiO1xuaW1wb3J0IHtpbml0UmFuZ2V9IGZyb20gXCIuL2luaXQuanNcIjtcbmltcG9ydCBuaWNlIGZyb20gXCIuL25pY2UuanNcIjtcblxuZnVuY3Rpb24gZGF0ZSh0KSB7XG4gIHJldHVybiBuZXcgRGF0ZSh0KTtcbn1cblxuZnVuY3Rpb24gbnVtYmVyKHQpIHtcbiAgcmV0dXJuIHQgaW5zdGFuY2VvZiBEYXRlID8gK3QgOiArbmV3IERhdGUoK3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsZW5kYXIodGlja3MsIHRpY2tJbnRlcnZhbCwgeWVhciwgbW9udGgsIHdlZWssIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIGZvcm1hdCkge1xuICB2YXIgc2NhbGUgPSBjb250aW51b3VzKCksXG4gICAgICBpbnZlcnQgPSBzY2FsZS5pbnZlcnQsXG4gICAgICBkb21haW4gPSBzY2FsZS5kb21haW47XG5cbiAgdmFyIGZvcm1hdE1pbGxpc2Vjb25kID0gZm9ybWF0KFwiLiVMXCIpLFxuICAgICAgZm9ybWF0U2Vjb25kID0gZm9ybWF0KFwiOiVTXCIpLFxuICAgICAgZm9ybWF0TWludXRlID0gZm9ybWF0KFwiJUk6JU1cIiksXG4gICAgICBmb3JtYXRIb3VyID0gZm9ybWF0KFwiJUkgJXBcIiksXG4gICAgICBmb3JtYXREYXkgPSBmb3JtYXQoXCIlYSAlZFwiKSxcbiAgICAgIGZvcm1hdFdlZWsgPSBmb3JtYXQoXCIlYiAlZFwiKSxcbiAgICAgIGZvcm1hdE1vbnRoID0gZm9ybWF0KFwiJUJcIiksXG4gICAgICBmb3JtYXRZZWFyID0gZm9ybWF0KFwiJVlcIik7XG5cbiAgZnVuY3Rpb24gdGlja0Zvcm1hdChkYXRlKSB7XG4gICAgcmV0dXJuIChzZWNvbmQoZGF0ZSkgPCBkYXRlID8gZm9ybWF0TWlsbGlzZWNvbmRcbiAgICAgICAgOiBtaW51dGUoZGF0ZSkgPCBkYXRlID8gZm9ybWF0U2Vjb25kXG4gICAgICAgIDogaG91cihkYXRlKSA8IGRhdGUgPyBmb3JtYXRNaW51dGVcbiAgICAgICAgOiBkYXkoZGF0ZSkgPCBkYXRlID8gZm9ybWF0SG91clxuICAgICAgICA6IG1vbnRoKGRhdGUpIDwgZGF0ZSA/ICh3ZWVrKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdERheSA6IGZvcm1hdFdlZWspXG4gICAgICAgIDogeWVhcihkYXRlKSA8IGRhdGUgPyBmb3JtYXRNb250aFxuICAgICAgICA6IGZvcm1hdFllYXIpKGRhdGUpO1xuICB9XG5cbiAgc2NhbGUuaW52ZXJ0ID0gZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiBuZXcgRGF0ZShpbnZlcnQoeSkpO1xuICB9O1xuXG4gIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IGRvbWFpbihBcnJheS5mcm9tKF8sIG51bWJlcikpIDogZG9tYWluKCkubWFwKGRhdGUpO1xuICB9O1xuXG4gIHNjYWxlLnRpY2tzID0gZnVuY3Rpb24oaW50ZXJ2YWwpIHtcbiAgICB2YXIgZCA9IGRvbWFpbigpO1xuICAgIHJldHVybiB0aWNrcyhkWzBdLCBkW2QubGVuZ3RoIC0gMV0sIGludGVydmFsID09IG51bGwgPyAxMCA6IGludGVydmFsKTtcbiAgfTtcblxuICBzY2FsZS50aWNrRm9ybWF0ID0gZnVuY3Rpb24oY291bnQsIHNwZWNpZmllcikge1xuICAgIHJldHVybiBzcGVjaWZpZXIgPT0gbnVsbCA/IHRpY2tGb3JtYXQgOiBmb3JtYXQoc3BlY2lmaWVyKTtcbiAgfTtcblxuICBzY2FsZS5uaWNlID0gZnVuY3Rpb24oaW50ZXJ2YWwpIHtcbiAgICB2YXIgZCA9IGRvbWFpbigpO1xuICAgIGlmICghaW50ZXJ2YWwgfHwgdHlwZW9mIGludGVydmFsLnJhbmdlICE9PSBcImZ1bmN0aW9uXCIpIGludGVydmFsID0gdGlja0ludGVydmFsKGRbMF0sIGRbZC5sZW5ndGggLSAxXSwgaW50ZXJ2YWwgPT0gbnVsbCA/IDEwIDogaW50ZXJ2YWwpO1xuICAgIHJldHVybiBpbnRlcnZhbCA/IGRvbWFpbihuaWNlKGQsIGludGVydmFsKSkgOiBzY2FsZTtcbiAgfTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNvcHkoc2NhbGUsIGNhbGVuZGFyKHRpY2tzLCB0aWNrSW50ZXJ2YWwsIHllYXIsIG1vbnRoLCB3ZWVrLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmb3JtYXQpKTtcbiAgfTtcblxuICByZXR1cm4gc2NhbGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRpbWUoKSB7XG4gIHJldHVybiBpbml0UmFuZ2UuYXBwbHkoY2FsZW5kYXIodGltZVRpY2tzLCB0aW1lVGlja0ludGVydmFsLCB0aW1lWWVhciwgdGltZU1vbnRoLCB0aW1lV2VlaywgdGltZURheSwgdGltZUhvdXIsIHRpbWVNaW51dGUsIHRpbWVTZWNvbmQsIHRpbWVGb3JtYXQpLmRvbWFpbihbbmV3IERhdGUoMjAwMCwgMCwgMSksIG5ldyBEYXRlKDIwMDAsIDAsIDIpXSksIGFyZ3VtZW50cyk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gVHJhbnNmb3JtKGssIHgsIHkpIHtcbiAgdGhpcy5rID0gaztcbiAgdGhpcy54ID0geDtcbiAgdGhpcy55ID0geTtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFRyYW5zZm9ybSxcbiAgc2NhbGU6IGZ1bmN0aW9uKGspIHtcbiAgICByZXR1cm4gayA9PT0gMSA/IHRoaXMgOiBuZXcgVHJhbnNmb3JtKHRoaXMuayAqIGssIHRoaXMueCwgdGhpcy55KTtcbiAgfSxcbiAgdHJhbnNsYXRlOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIHggPT09IDAgJiB5ID09PSAwID8gdGhpcyA6IG5ldyBUcmFuc2Zvcm0odGhpcy5rLCB0aGlzLnggKyB0aGlzLmsgKiB4LCB0aGlzLnkgKyB0aGlzLmsgKiB5KTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIFtwb2ludFswXSAqIHRoaXMuayArIHRoaXMueCwgcG9pbnRbMV0gKiB0aGlzLmsgKyB0aGlzLnldO1xuICB9LFxuICBhcHBseVg6IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4geCAqIHRoaXMuayArIHRoaXMueDtcbiAgfSxcbiAgYXBwbHlZOiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIHkgKiB0aGlzLmsgKyB0aGlzLnk7XG4gIH0sXG4gIGludmVydDogZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICByZXR1cm4gWyhsb2NhdGlvblswXSAtIHRoaXMueCkgLyB0aGlzLmssIChsb2NhdGlvblsxXSAtIHRoaXMueSkgLyB0aGlzLmtdO1xuICB9LFxuICBpbnZlcnRYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuICh4IC0gdGhpcy54KSAvIHRoaXMuaztcbiAgfSxcbiAgaW52ZXJ0WTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiAoeSAtIHRoaXMueSkgLyB0aGlzLms7XG4gIH0sXG4gIHJlc2NhbGVYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHguY29weSgpLmRvbWFpbih4LnJhbmdlKCkubWFwKHRoaXMuaW52ZXJ0WCwgdGhpcykubWFwKHguaW52ZXJ0LCB4KSk7XG4gIH0sXG4gIHJlc2NhbGVZOiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIHkuY29weSgpLmRvbWFpbih5LnJhbmdlKCkubWFwKHRoaXMuaW52ZXJ0WSwgdGhpcykubWFwKHkuaW52ZXJ0LCB5KSk7XG4gIH0sXG4gIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyB0aGlzLnggKyBcIixcIiArIHRoaXMueSArIFwiKSBzY2FsZShcIiArIHRoaXMuayArIFwiKVwiO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIGlkZW50aXR5ID0gbmV3IFRyYW5zZm9ybSgxLCAwLCAwKTtcblxudHJhbnNmb3JtLnByb3RvdHlwZSA9IFRyYW5zZm9ybS5wcm90b3R5cGU7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zZm9ybShub2RlKSB7XG4gIHdoaWxlICghbm9kZS5fX3pvb20pIGlmICghKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSByZXR1cm4gaWRlbnRpdHk7XG4gIHJldHVybiBub2RlLl9fem9vbTtcbn1cbiIsImltcG9ydCB7IFJlYWN0RWxlbWVudCwgY3JlYXRlRWxlbWVudCwgdXNlRWZmZWN0LCB1c2VSZWYgfSBmcm9tIFwicmVhY3RcIjtcbmltcG9ydCB7IENhdGFsb2dSZWxlYXNlQ2hhcnRDb250YWluZXJQcm9wcyB9IGZyb20gXCIuLi90eXBpbmdzL0NhdGFsb2dSZWxlYXNlQ2hhcnRQcm9wc1wiO1xuaW1wb3J0ICogYXMgZDMgZnJvbSBcImQzXCI7XG5cbmltcG9ydCBcIi4vdWkvQ2F0YWxvZ1JlbGVhc2VDaGFydC5jc3NcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIENhdGFsb2dSZWxlYXNlQ2hhcnQoeyBuYW1lIH06IENhdGFsb2dSZWxlYXNlQ2hhcnRDb250YWluZXJQcm9wcyk6IFJlYWN0RWxlbWVudCB7XG4gICAgY29uc3QgY2hhcnRSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpO1xuXG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKCFjaGFydFJlZi5jdXJyZW50KSByZXR1cm47XG5cbiAgICAgICAgLy8gQ2xlYXIgYW55IGV4aXN0aW5nIGNoYXJ0XG4gICAgICAgIGQzLnNlbGVjdChjaGFydFJlZi5jdXJyZW50KS5zZWxlY3RBbGwoXCIqXCIpLnJlbW92ZSgpO1xuXG4gICAgICAgIC8vIERhdGEgc3RydWN0dXJlXG4gICAgICAgIGNvbnN0IGluZHVzdHJpZXMgPSBbXG4gICAgICAgICAgICB7IG5hbWU6IFwiQWVyb3NwYWNlICYgRGVmZW5zZVwiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDIzLCAxMCwgMSksIGN1cnJlbnQ6IG5ldyBEYXRlKDIwMjQsIDExLCAxKSwgdXBjb21pbmc6IFwiMjUwNlwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiQXV0b21vdGl2ZVwiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDIzLCAyLCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNCwgNSwgMSksIHVwY29taW5nOiBcIlRCRFwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiQmF0dGVyeVwiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDI1LCAwLCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNSwgNCwgMSksIHVwY29taW5nOiBcIjI1MDdcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIkNQJlJcIiwgcmV0aXJlZDogbmV3IERhdGUoMjAyNCwgOCwgMSksIGN1cnJlbnQ6IG5ldyBEYXRlKDIwMjQsIDExLCAxKSwgdXBjb21pbmc6IFwiVEJEXCIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJFbGVjdHJvbmljc1wiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDI1LCAyLCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNSwgNCwgMSksIHVwY29taW5nOiBcIjI1MDhcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIkVuZXJneSAmIFV0aWxpdGllc1wiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDI0LCA4LCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNSwgMSwgMSksIHVwY29taW5nOiBcIjI1MDVcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIkhlYXZ5IEVxdWlwbWVudFwiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDIzLCA1LCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyMywgNSwgMSksIHVwY29taW5nOiBcIlRCRFwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiSW5kdXN0cmlhbCBNYWNoaW5lcnlcIiwgcmV0aXJlZDogbmV3IERhdGUoMjAyNSwgMiwgMSksIGN1cnJlbnQ6IG5ldyBEYXRlKDIwMjUsIDUsIDEpLCB1cGNvbWluZzogXCIyNTA5XCIgfSxcbiAgICAgICAgICAgIHsgbmFtZTogXCJNYXJpbmVcIiwgcmV0aXJlZDogbmV3IERhdGUoMjAyNCwgMiwgMSksIGN1cnJlbnQ6IG5ldyBEYXRlKDIwMjQsIDIsIDEpLCB1cGNvbWluZzogXCJUQkRcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIk1lZGljYWwgRGV2aWNlc1wiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDI0LCA5LCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNSwgMCwgMSksIHVwY29taW5nOiBcIlRCRFwiIH0sXG4gICAgICAgICAgICB7IG5hbWU6IFwiUGhhcm1hY2V1dGljYWxzXCIsIHJldGlyZWQ6IG5ldyBEYXRlKDIwMjQsIDEwLCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNSwgMiwgMSksIHVwY29taW5nOiBcIjI1MDZcIiB9LFxuICAgICAgICAgICAgeyBuYW1lOiBcIlNlbWljb25kdWN0b3IgRGV2aWNlc1wiLCByZXRpcmVkOiBuZXcgRGF0ZSgyMDI0LCAxLCAxKSwgY3VycmVudDogbmV3IERhdGUoMjAyNCwgNCwgMSksIHVwY29taW5nOiBcIlRCRFwiIH1cbiAgICAgICAgXTtcblxuICAgICAgICAvLyBDaGFydCBkaW1lbnNpb25zXG4gICAgICAgIGNvbnN0IG1hcmdpbiA9IHsgdG9wOiA4MCwgcmlnaHQ6IDE1MCwgYm90dG9tOiA0MCwgbGVmdDogMTgwIH07XG4gICAgICAgIGNvbnN0IHdpZHRoID0gMTIwMCAtIG1hcmdpbi5sZWZ0IC0gbWFyZ2luLnJpZ2h0O1xuICAgICAgICBjb25zdCBoZWlnaHQgPSA2MDAgLSBtYXJnaW4udG9wIC0gbWFyZ2luLmJvdHRvbTtcblxuICAgICAgICAvLyBDcmVhdGUgU1ZHXG4gICAgICAgIGNvbnN0IHN2ZyA9IGQzLnNlbGVjdChjaGFydFJlZi5jdXJyZW50KVxuICAgICAgICAgICAgLmFwcGVuZChcInN2Z1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCB3aWR0aCArIG1hcmdpbi5sZWZ0ICsgbWFyZ2luLnJpZ2h0KVxuICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgaGVpZ2h0ICsgbWFyZ2luLnRvcCArIG1hcmdpbi5ib3R0b20pXG4gICAgICAgICAgICAuYXBwZW5kKFwiZ1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHRyYW5zbGF0ZSgke21hcmdpbi5sZWZ0fSwke21hcmdpbi50b3B9KWApO1xuXG4gICAgICAgIC8vIFRpbWUgc2NhbGVcbiAgICAgICAgY29uc3QgdGltZVNjYWxlID0gZDMuc2NhbGVUaW1lKClcbiAgICAgICAgICAgIC5kb21haW4oW25ldyBEYXRlKDIwMjIsIDcsIDEpLCBuZXcgRGF0ZSgyMDI1LCAxMSwgMzEpXSlcbiAgICAgICAgICAgIC5yYW5nZShbMCwgd2lkdGhdKTtcblxuICAgICAgICAvLyBZIHNjYWxlIGZvciBpbmR1c3RyaWVzXG4gICAgICAgIGNvbnN0IHlTY2FsZSA9IGQzLnNjYWxlQmFuZCgpXG4gICAgICAgICAgICAuZG9tYWluKGluZHVzdHJpZXMubWFwKGQgPT4gZC5uYW1lKSlcbiAgICAgICAgICAgIC5yYW5nZShbMCwgaGVpZ2h0XSlcbiAgICAgICAgICAgIC5wYWRkaW5nKDAuMyk7XG5cbiAgICAgICAgLy8gQWRkIHRpbWVsaW5lIGRhdGVzXG4gICAgICAgIGNvbnN0IHRpbWVsaW5lRGF0ZXMgPSBbXG4gICAgICAgICAgICBuZXcgRGF0ZSgyMDIyLCA3LCAxKSxcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjMsIDIsIDEpLFxuICAgICAgICAgICAgbmV3IERhdGUoMjAyMywgOSwgMSksXG4gICAgICAgICAgICBuZXcgRGF0ZSgyMDI0LCAzLCAxKSxcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjQsIDEwLCAxKSxcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjUsIDQsIDEpLFxuICAgICAgICAgICAgbmV3IERhdGUoMjAyNSwgMTEsIDEpXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gRHJhdyBtYWluIHRpbWVsaW5lXG4gICAgICAgIHN2Zy5hcHBlbmQoXCJsaW5lXCIpXG4gICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidGltZWxpbmUtbGluZVwiKVxuICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCAwKVxuICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCAtNDApXG4gICAgICAgICAgICAuYXR0cihcIngyXCIsIHdpZHRoKVxuICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCAtNDApO1xuXG4gICAgICAgIC8vIEFkZCB0aW1lbGluZSBtYXJrZXJzIGFuZCBsYWJlbHNcbiAgICAgICAgdGltZWxpbmVEYXRlcy5mb3JFYWNoKGRhdGUgPT4ge1xuICAgICAgICAgICAgY29uc3QgeCA9IHRpbWVTY2FsZShkYXRlKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImNpcmNsZVwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY3hcIiwgeClcbiAgICAgICAgICAgICAgICAuYXR0cihcImN5XCIsIC00MClcbiAgICAgICAgICAgICAgICAuYXR0cihcInJcIiwgNClcbiAgICAgICAgICAgICAgICAuYXR0cihcImZpbGxcIiwgXCIjMmM1MjgyXCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdmcuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJkYXRlLXRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgeClcbiAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgLTUwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIilcbiAgICAgICAgICAgICAgICAudGV4dChkMy50aW1lRm9ybWF0KFwiJWItJXlcIikoZGF0ZSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBBZGQgdG9kYXkncyBkYXRlXG4gICAgICAgIGNvbnN0IHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICAgICAgY29uc3QgdG9kYXlYID0gdGltZVNjYWxlKHRvZGF5KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFRvZGF5J3MgdmVydGljYWwgbGluZVxuICAgICAgICBzdmcuYXBwZW5kKFwibGluZVwiKVxuICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInRvZGF5LWxpbmVcIilcbiAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgdG9kYXlYKVxuICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCAtNDApXG4gICAgICAgICAgICAuYXR0cihcIngyXCIsIHRvZGF5WClcbiAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgaGVpZ2h0KTtcbiAgICAgICAgXG4gICAgICAgIC8vIFRvZGF5J3MgY2lyY2xlXG4gICAgICAgIHN2Zy5hcHBlbmQoXCJjaXJjbGVcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0b2RheS1jaXJjbGVcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY3hcIiwgdG9kYXlYKVxuICAgICAgICAgICAgLmF0dHIoXCJjeVwiLCAtNDApXG4gICAgICAgICAgICAuYXR0cihcInJcIiwgOCk7XG4gICAgICAgIFxuICAgICAgICAvLyBUb2RheSdzIGRhdGUgbGFiZWxcbiAgICAgICAgc3ZnLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0b2RheS10ZXh0XCIpXG4gICAgICAgICAgICAuYXR0cihcInhcIiwgdG9kYXlYKVxuICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIC02NSlcbiAgICAgICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJtaWRkbGVcIilcbiAgICAgICAgICAgIC50ZXh0KGQzLnRpbWVGb3JtYXQoXCIlLW0vJS1kLyVZXCIpKHRvZGF5KSk7XG5cbiAgICAgICAgLy8gRHJhdyBpbmR1c3RyeSByb3dzXG4gICAgICAgIGluZHVzdHJpZXMuZm9yRWFjaCgoaW5kdXN0cnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHkgPSB5U2NhbGUoaW5kdXN0cnkubmFtZSkhICsgeVNjYWxlLmJhbmR3aWR0aCgpIC8gMjtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSW5kdXN0cnkgbmFtZVxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiaW5kdXN0cnktdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCAtMTApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgKyA1KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwidGV4dC1hbmNob3JcIiwgXCJlbmRcIilcbiAgICAgICAgICAgICAgICAudGV4dChpbmR1c3RyeS5uYW1lKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSW5kdXN0cnkgbGluZVxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiaW5kdXN0cnktbGluZVwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgMClcbiAgICAgICAgICAgICAgICAuYXR0cihcInkxXCIsIHkpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCB3aWR0aClcbiAgICAgICAgICAgICAgICAuYXR0cihcInkyXCIsIHkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDb250aW51aXR5IGxpbmUgYmV0d2VlbiByZXRpcmVkIGFuZCBjdXJyZW50XG4gICAgICAgICAgICBpZiAoaW5kdXN0cnkucmV0aXJlZCAmJiBpbmR1c3RyeS5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0aXJlZFggPSB0aW1lU2NhbGUoaW5kdXN0cnkucmV0aXJlZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFggPSB0aW1lU2NhbGUoaW5kdXN0cnkuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImNvbnRpbnVpdHktbGluZVwiKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIngxXCIsIHJldGlyZWRYKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInkxXCIsIHkpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgY3VycmVudFgpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEZ1dHVyZSBjb250aW51aXR5IGxpbmUgZnJvbSBjdXJyZW50IHRvIHVwY29taW5nXG4gICAgICAgICAgICBsZXQgdXBjb21pbmdYUG9zID0gd2lkdGggKyAyMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGluZHVzdHJ5LnVwY29taW5nICE9PSBcIlRCRFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeWVhciA9IHBhcnNlSW50KFwiMjBcIiArIGluZHVzdHJ5LnVwY29taW5nLnN1YnN0cmluZygwLCAyKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9udGggPSBwYXJzZUludChpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMiwgNCkpIC0gMTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cGNvbWluZ0RhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHVwY29taW5nRGF0ZSA8PSB0aW1lU2NhbGUuZG9tYWluKClbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdXBjb21pbmdYUG9zID0gdGltZVNjYWxlKHVwY29taW5nRGF0ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXBjb21pbmdYUG9zID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1cGNvbWluZ1hQb3MgPSB3aWR0aCArIDIwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaW5kdXN0cnkuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRYID0gdGltZVNjYWxlKGluZHVzdHJ5LmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIGxldCBsaW5lRW5kWCA9IHVwY29taW5nWFBvcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoaW5kdXN0cnkudXBjb21pbmcgPT09IFwiVEJEXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZUVuZFggPSB3aWR0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGNvbWluZ0RhdGUgPSBuZXcgRGF0ZShwYXJzZUludChcIjIwXCIgKyBpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMCwyKSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoaW5kdXN0cnkudXBjb21pbmcuc3Vic3RyaW5nKDIsNCkpLTEsMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGNvbWluZ0RhdGUgPiB0aW1lU2NhbGUuZG9tYWluKClbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVFbmRYID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lRW5kWCA9IHRpbWVTY2FsZSh1cGNvbWluZ0RhdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImZ1dHVyZS1jb250aW51aXR5LWxpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCBjdXJyZW50WClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCB5KVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIngyXCIsIGxpbmVFbmRYKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInkyXCIsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBSZXRpcmVkIG1hcmtlciAoZGlhbW9uZClcbiAgICAgICAgICAgIGlmIChpbmR1c3RyeS5yZXRpcmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0aXJlZFggPSB0aW1lU2NhbGUoaW5kdXN0cnkucmV0aXJlZCk7XG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInJldGlyZWQtbWFya2VyXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCByZXRpcmVkWCAtIDEwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgeSAtIDEwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDIwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCAyMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyeFwiLCAxMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHJvdGF0ZSg0NSAke3JldGlyZWRYfSAke3l9KWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDdXJyZW50IG1hcmtlciAoZGlhbW9uZClcbiAgICAgICAgICAgIGlmIChpbmR1c3RyeS5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFggPSB0aW1lU2NhbGUoaW5kdXN0cnkuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImN1cnJlbnQtbWFya2VyXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBjdXJyZW50WCAtIDEwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgeSAtIDEwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDIwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCAyMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyeFwiLCAxMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHJvdGF0ZSg0NSAke2N1cnJlbnRYfSAke3l9KWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBVcGNvbWluZyBib3hcbiAgICAgICAgICAgIGxldCBib3hYID0gdXBjb21pbmdYUG9zO1xuICAgICAgICAgICAgaWYgKGluZHVzdHJ5LnVwY29taW5nICE9PSBcIlRCRFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeWVhciA9IHBhcnNlSW50KFwiMjBcIiArIGluZHVzdHJ5LnVwY29taW5nLnN1YnN0cmluZygwLCAyKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9udGggPSBwYXJzZUludChpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMiwgNCkpIC0gMTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cGNvbWluZ0RhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSk7XG4gICAgICAgICAgICAgICAgaWYgKHVwY29taW5nRGF0ZSA8PSB0aW1lU2NhbGUuZG9tYWluKClbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgYm94WCA9IHRpbWVTY2FsZSh1cGNvbWluZ0RhdGUpIC0gMzA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYm94WCA9IHdpZHRoICsgMjA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBib3hYID0gd2lkdGggKyAyMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidXBjb21pbmctYm94XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIGJveFgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgLSAxNSlcbiAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDYwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiaGVpZ2h0XCIsIDMwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwicnhcIiwgNCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInVwY29taW5nLXRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgYm94WCArIDMwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCB5ICsgNSlcbiAgICAgICAgICAgICAgICAudGV4dChpbmR1c3RyeS51cGNvbWluZyk7XG4gICAgICAgIH0pO1xuICAgIH0sIFtdKTtcblxuICAgIHJldHVybiAoXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPXtgY2F0YWxvZy1yZWxlYXNlLWNoYXJ0ICR7bmFtZX1gfT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2hhcnQtY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgPGgxIGNsYXNzTmFtZT1cImNoYXJ0LXRpdGxlXCI+Q2F0YWxvZyBSZWxlYXNlIFNjaGVkdWxlPC9oMT5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxlZ2VuZFwiPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxlZ2VuZC1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cImxlZ2VuZC1zeW1ib2xcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPHJlY3QgeD1cIjJcIiB5PVwiMlwiIHdpZHRoPVwiMTZcIiBoZWlnaHQ9XCIxNlwiIHJ4PVwiNTAlXCIgY2xhc3NOYW1lPVwicmV0aXJlZC1tYXJrZXJcIi8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlJldGlyZWQgQ2F0YWxvZzwvc3Bhbj5cbiAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGVnZW5kLWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzdmcgY2xhc3NOYW1lPVwibGVnZW5kLXN5bWJvbFwiIHZpZXdCb3g9XCIwIDAgMjAgMjBcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8cmVjdCB4PVwiMlwiIHk9XCIyXCIgd2lkdGg9XCIxNlwiIGhlaWdodD1cIjE2XCIgcng9XCI1MCVcIiBjbGFzc05hbWU9XCJjdXJyZW50LW1hcmtlclwiLz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHNwYW4+Q3VycmVudCBDYXRhbG9nPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsZWdlbmQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPHN2ZyBjbGFzc05hbWU9XCJsZWdlbmQtc3ltYm9sXCIgdmlld0JveD1cIjAgMCAyMCAyMFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxyZWN0IHg9XCIyXCIgeT1cIjJcIiB3aWR0aD1cIjE2XCIgaGVpZ2h0PVwiMTZcIiByeD1cIjJcIiBjbGFzc05hbWU9XCJ1cGNvbWluZy1ib3hcIi8+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlVwY29taW5nIENhdGFsb2c8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxlZ2VuZC1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3ZnIGNsYXNzTmFtZT1cImxlZ2VuZC1zeW1ib2xcIiB2aWV3Qm94PVwiMCAwIDIwIDIwXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjEwXCIgY3k9XCIxMFwiIHI9XCI1XCIgY2xhc3NOYW1lPVwidG9kYXktY2lyY2xlXCIvPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5Ub2RheSdzIERhdGU8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIDxkaXYgcmVmPXtjaGFydFJlZn0gaWQ9XCJjaGFydFwiPjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvZGl2PlxuICAgICk7XG59Il0sIm5hbWVzIjpbImFzY2VuZGluZyIsImEiLCJiIiwiTmFOIiwiZGVzY2VuZGluZyIsImJpc2VjdG9yIiwiZiIsImNvbXBhcmUxIiwiY29tcGFyZTIiLCJkZWx0YSIsImxlbmd0aCIsImQiLCJ4IiwiemVybyIsImxlZnQiLCJsbyIsImhpIiwibWlkIiwicmlnaHQiLCJjZW50ZXIiLCJpIiwibnVtYmVyIiwiYXNjZW5kaW5nQmlzZWN0IiwiYmlzZWN0UmlnaHQiLCJJbnRlcm5NYXAiLCJNYXAiLCJjb25zdHJ1Y3RvciIsImVudHJpZXMiLCJrZXkiLCJrZXlvZiIsIk9iamVjdCIsImRlZmluZVByb3BlcnRpZXMiLCJfaW50ZXJuIiwidmFsdWUiLCJfa2V5Iiwic2V0IiwiZ2V0IiwiaW50ZXJuX2dldCIsImhhcyIsImludGVybl9zZXQiLCJkZWxldGUiLCJpbnRlcm5fZGVsZXRlIiwidmFsdWVPZiIsImUxMCIsIk1hdGgiLCJzcXJ0IiwiZTUiLCJlMiIsInRpY2tTcGVjIiwic3RhcnQiLCJzdG9wIiwiY291bnQiLCJzdGVwIiwibWF4IiwicG93ZXIiLCJmbG9vciIsImxvZzEwIiwiZXJyb3IiLCJwb3ciLCJmYWN0b3IiLCJpMSIsImkyIiwiaW5jIiwicm91bmQiLCJ0aWNrSW5jcmVtZW50IiwidGlja1N0ZXAiLCJyZXZlcnNlIiwicmFuZ2UiLCJuIiwiYXJndW1lbnRzIiwiY2VpbCIsIkFycmF5Iiwibm9vcCIsImRpc3BhdGNoIiwiXyIsInQiLCJ0ZXN0IiwiRXJyb3IiLCJEaXNwYXRjaCIsInBhcnNlVHlwZW5hbWVzIiwidHlwZW5hbWVzIiwidHlwZXMiLCJ0cmltIiwic3BsaXQiLCJtYXAiLCJuYW1lIiwiaW5kZXhPZiIsInNsaWNlIiwiaGFzT3duUHJvcGVydHkiLCJ0eXBlIiwicHJvdG90eXBlIiwib24iLCJ0eXBlbmFtZSIsImNhbGxiYWNrIiwiVCIsImNvcHkiLCJjYWxsIiwidGhhdCIsImFyZ3MiLCJhcHBseSIsImMiLCJjb25jYXQiLCJwdXNoIiwieGh0bWwiLCJzdmciLCJ4bGluayIsInhtbCIsInhtbG5zIiwicHJlZml4IiwibmFtZXNwYWNlcyIsInNwYWNlIiwibG9jYWwiLCJjcmVhdG9ySW5oZXJpdCIsImRvY3VtZW50Iiwib3duZXJEb2N1bWVudCIsInVyaSIsIm5hbWVzcGFjZVVSSSIsImRvY3VtZW50RWxlbWVudCIsImNyZWF0ZUVsZW1lbnQiLCJjcmVhdGVFbGVtZW50TlMiLCJjcmVhdG9yRml4ZWQiLCJmdWxsbmFtZSIsIm5hbWVzcGFjZSIsIm5vbmUiLCJzZWxlY3RvciIsInF1ZXJ5U2VsZWN0b3IiLCJzZWxlY3QiLCJncm91cHMiLCJfZ3JvdXBzIiwibSIsInN1Ymdyb3VwcyIsImoiLCJncm91cCIsInN1Ymdyb3VwIiwibm9kZSIsInN1Ym5vZGUiLCJfX2RhdGFfXyIsIlNlbGVjdGlvbiIsIl9wYXJlbnRzIiwiYXJyYXkiLCJpc0FycmF5IiwiZnJvbSIsImVtcHR5IiwicXVlcnlTZWxlY3RvckFsbCIsImFycmF5QWxsIiwic2VsZWN0b3JBbGwiLCJwYXJlbnRzIiwibWF0Y2hlcyIsImNoaWxkTWF0Y2hlciIsImZpbmQiLCJjaGlsZEZpbmQiLCJtYXRjaCIsImNoaWxkcmVuIiwiY2hpbGRGaXJzdCIsImZpcnN0RWxlbWVudENoaWxkIiwiZmlsdGVyIiwiY2hpbGRyZW5GaWx0ZXIiLCJzZWxlY3RBbGwiLCJtYXRjaGVyIiwidXBkYXRlIiwiX2VudGVyIiwic3BhcnNlIiwiRW50ZXJOb2RlIiwicGFyZW50IiwiZGF0dW0iLCJfbmV4dCIsIl9wYXJlbnQiLCJhcHBlbmRDaGlsZCIsImNoaWxkIiwiaW5zZXJ0QmVmb3JlIiwibmV4dCIsImJpbmRJbmRleCIsImVudGVyIiwiZXhpdCIsImRhdGEiLCJncm91cExlbmd0aCIsImRhdGFMZW5ndGgiLCJiaW5kS2V5Iiwibm9kZUJ5S2V5VmFsdWUiLCJrZXlWYWx1ZXMiLCJrZXlWYWx1ZSIsImJpbmQiLCJjb25zdGFudCIsImFycmF5bGlrZSIsImVudGVyR3JvdXAiLCJ1cGRhdGVHcm91cCIsImV4aXRHcm91cCIsImkwIiwicHJldmlvdXMiLCJfZXhpdCIsIm9uZW50ZXIiLCJvbnVwZGF0ZSIsIm9uZXhpdCIsInNlbGVjdGlvbiIsImFwcGVuZCIsInJlbW92ZSIsIm1lcmdlIiwib3JkZXIiLCJjb250ZXh0IiwiZ3JvdXBzMCIsImdyb3VwczEiLCJtMCIsIm0xIiwibWluIiwibWVyZ2VzIiwiZ3JvdXAwIiwiZ3JvdXAxIiwiY29tcGFyZURvY3VtZW50UG9zaXRpb24iLCJwYXJlbnROb2RlIiwiY29tcGFyZSIsImNvbXBhcmVOb2RlIiwic29ydGdyb3VwcyIsInNvcnRncm91cCIsInNvcnQiLCJzaXplIiwiYXR0clJlbW92ZSIsInJlbW92ZUF0dHJpYnV0ZSIsImF0dHJSZW1vdmVOUyIsInJlbW92ZUF0dHJpYnV0ZU5TIiwiYXR0ckNvbnN0YW50Iiwic2V0QXR0cmlidXRlIiwiYXR0ckNvbnN0YW50TlMiLCJzZXRBdHRyaWJ1dGVOUyIsImF0dHJGdW5jdGlvbiIsInYiLCJhdHRyRnVuY3Rpb25OUyIsImdldEF0dHJpYnV0ZU5TIiwiZ2V0QXR0cmlidXRlIiwiZWFjaCIsImRlZmF1bHRWaWV3Iiwic3R5bGVSZW1vdmUiLCJzdHlsZSIsInJlbW92ZVByb3BlcnR5Iiwic3R5bGVDb25zdGFudCIsInByaW9yaXR5Iiwic2V0UHJvcGVydHkiLCJzdHlsZUZ1bmN0aW9uIiwic3R5bGVWYWx1ZSIsImdldFByb3BlcnR5VmFsdWUiLCJnZXRDb21wdXRlZFN0eWxlIiwicHJvcGVydHlSZW1vdmUiLCJwcm9wZXJ0eUNvbnN0YW50IiwicHJvcGVydHlGdW5jdGlvbiIsImNsYXNzQXJyYXkiLCJzdHJpbmciLCJjbGFzc0xpc3QiLCJDbGFzc0xpc3QiLCJfbm9kZSIsIl9uYW1lcyIsImFkZCIsImpvaW4iLCJzcGxpY2UiLCJjb250YWlucyIsImNsYXNzZWRBZGQiLCJuYW1lcyIsImxpc3QiLCJjbGFzc2VkUmVtb3ZlIiwiY2xhc3NlZFRydWUiLCJjbGFzc2VkRmFsc2UiLCJjbGFzc2VkRnVuY3Rpb24iLCJ0ZXh0UmVtb3ZlIiwidGV4dENvbnRlbnQiLCJ0ZXh0Q29uc3RhbnQiLCJ0ZXh0RnVuY3Rpb24iLCJodG1sUmVtb3ZlIiwiaW5uZXJIVE1MIiwiaHRtbENvbnN0YW50IiwiaHRtbEZ1bmN0aW9uIiwicmFpc2UiLCJuZXh0U2libGluZyIsImxvd2VyIiwicHJldmlvdXNTaWJsaW5nIiwiZmlyc3RDaGlsZCIsImNyZWF0ZSIsImNyZWF0b3IiLCJjb25zdGFudE51bGwiLCJiZWZvcmUiLCJyZW1vdmVDaGlsZCIsInNlbGVjdGlvbl9jbG9uZVNoYWxsb3ciLCJjbG9uZSIsImNsb25lTm9kZSIsInNlbGVjdGlvbl9jbG9uZURlZXAiLCJkZWVwIiwicHJvcGVydHkiLCJjb250ZXh0TGlzdGVuZXIiLCJsaXN0ZW5lciIsImV2ZW50Iiwib25SZW1vdmUiLCJfX29uIiwibyIsInJlbW92ZUV2ZW50TGlzdGVuZXIiLCJvcHRpb25zIiwib25BZGQiLCJhZGRFdmVudExpc3RlbmVyIiwiZGlzcGF0Y2hFdmVudCIsInBhcmFtcyIsIndpbmRvdyIsIkN1c3RvbUV2ZW50IiwiY3JlYXRlRXZlbnQiLCJpbml0RXZlbnQiLCJidWJibGVzIiwiY2FuY2VsYWJsZSIsImRldGFpbCIsImRpc3BhdGNoQ29uc3RhbnQiLCJkaXNwYXRjaEZ1bmN0aW9uIiwicm9vdCIsInNlbGVjdGlvbl9zZWxlY3Rpb24iLCJzZWxlY3Rpb25fc2VsZWN0Iiwic2VsZWN0aW9uX3NlbGVjdEFsbCIsInNlbGVjdENoaWxkIiwic2VsZWN0aW9uX3NlbGVjdENoaWxkIiwic2VsZWN0Q2hpbGRyZW4iLCJzZWxlY3Rpb25fc2VsZWN0Q2hpbGRyZW4iLCJzZWxlY3Rpb25fZmlsdGVyIiwic2VsZWN0aW9uX2RhdGEiLCJzZWxlY3Rpb25fZW50ZXIiLCJzZWxlY3Rpb25fZXhpdCIsInNlbGVjdGlvbl9qb2luIiwic2VsZWN0aW9uX21lcmdlIiwic2VsZWN0aW9uX29yZGVyIiwic2VsZWN0aW9uX3NvcnQiLCJzZWxlY3Rpb25fY2FsbCIsIm5vZGVzIiwic2VsZWN0aW9uX25vZGVzIiwic2VsZWN0aW9uX25vZGUiLCJzZWxlY3Rpb25fc2l6ZSIsInNlbGVjdGlvbl9lbXB0eSIsInNlbGVjdGlvbl9lYWNoIiwiYXR0ciIsInNlbGVjdGlvbl9hdHRyIiwic2VsZWN0aW9uX3N0eWxlIiwic2VsZWN0aW9uX3Byb3BlcnR5IiwiY2xhc3NlZCIsInNlbGVjdGlvbl9jbGFzc2VkIiwidGV4dCIsInNlbGVjdGlvbl90ZXh0IiwiaHRtbCIsInNlbGVjdGlvbl9odG1sIiwic2VsZWN0aW9uX3JhaXNlIiwic2VsZWN0aW9uX2xvd2VyIiwic2VsZWN0aW9uX2FwcGVuZCIsImluc2VydCIsInNlbGVjdGlvbl9pbnNlcnQiLCJzZWxlY3Rpb25fcmVtb3ZlIiwic2VsZWN0aW9uX2Nsb25lIiwic2VsZWN0aW9uX2RhdHVtIiwic2VsZWN0aW9uX29uIiwic2VsZWN0aW9uX2Rpc3BhdGNoIiwiU3ltYm9sIiwiaXRlcmF0b3IiLCJzZWxlY3Rpb25faXRlcmF0b3IiLCJmYWN0b3J5IiwiZXh0ZW5kIiwiZGVmaW5pdGlvbiIsIkNvbG9yIiwiZGFya2VyIiwiYnJpZ2h0ZXIiLCJyZUkiLCJyZU4iLCJyZVAiLCJyZUhleCIsInJlUmdiSW50ZWdlciIsIlJlZ0V4cCIsInJlUmdiUGVyY2VudCIsInJlUmdiYUludGVnZXIiLCJyZVJnYmFQZXJjZW50IiwicmVIc2xQZXJjZW50IiwicmVIc2xhUGVyY2VudCIsIm5hbWVkIiwiYWxpY2VibHVlIiwiYW50aXF1ZXdoaXRlIiwiYXF1YSIsImFxdWFtYXJpbmUiLCJhenVyZSIsImJlaWdlIiwiYmlzcXVlIiwiYmxhY2siLCJibGFuY2hlZGFsbW9uZCIsImJsdWUiLCJibHVldmlvbGV0IiwiYnJvd24iLCJidXJseXdvb2QiLCJjYWRldGJsdWUiLCJjaGFydHJldXNlIiwiY2hvY29sYXRlIiwiY29yYWwiLCJjb3JuZmxvd2VyYmx1ZSIsImNvcm5zaWxrIiwiY3JpbXNvbiIsImN5YW4iLCJkYXJrYmx1ZSIsImRhcmtjeWFuIiwiZGFya2dvbGRlbnJvZCIsImRhcmtncmF5IiwiZGFya2dyZWVuIiwiZGFya2dyZXkiLCJkYXJra2hha2kiLCJkYXJrbWFnZW50YSIsImRhcmtvbGl2ZWdyZWVuIiwiZGFya29yYW5nZSIsImRhcmtvcmNoaWQiLCJkYXJrcmVkIiwiZGFya3NhbG1vbiIsImRhcmtzZWFncmVlbiIsImRhcmtzbGF0ZWJsdWUiLCJkYXJrc2xhdGVncmF5IiwiZGFya3NsYXRlZ3JleSIsImRhcmt0dXJxdW9pc2UiLCJkYXJrdmlvbGV0IiwiZGVlcHBpbmsiLCJkZWVwc2t5Ymx1ZSIsImRpbWdyYXkiLCJkaW1ncmV5IiwiZG9kZ2VyYmx1ZSIsImZpcmVicmljayIsImZsb3JhbHdoaXRlIiwiZm9yZXN0Z3JlZW4iLCJmdWNoc2lhIiwiZ2FpbnNib3JvIiwiZ2hvc3R3aGl0ZSIsImdvbGQiLCJnb2xkZW5yb2QiLCJncmF5IiwiZ3JlZW4iLCJncmVlbnllbGxvdyIsImdyZXkiLCJob25leWRldyIsImhvdHBpbmsiLCJpbmRpYW5yZWQiLCJpbmRpZ28iLCJpdm9yeSIsImtoYWtpIiwibGF2ZW5kZXIiLCJsYXZlbmRlcmJsdXNoIiwibGF3bmdyZWVuIiwibGVtb25jaGlmZm9uIiwibGlnaHRibHVlIiwibGlnaHRjb3JhbCIsImxpZ2h0Y3lhbiIsImxpZ2h0Z29sZGVucm9keWVsbG93IiwibGlnaHRncmF5IiwibGlnaHRncmVlbiIsImxpZ2h0Z3JleSIsImxpZ2h0cGluayIsImxpZ2h0c2FsbW9uIiwibGlnaHRzZWFncmVlbiIsImxpZ2h0c2t5Ymx1ZSIsImxpZ2h0c2xhdGVncmF5IiwibGlnaHRzbGF0ZWdyZXkiLCJsaWdodHN0ZWVsYmx1ZSIsImxpZ2h0eWVsbG93IiwibGltZSIsImxpbWVncmVlbiIsImxpbmVuIiwibWFnZW50YSIsIm1hcm9vbiIsIm1lZGl1bWFxdWFtYXJpbmUiLCJtZWRpdW1ibHVlIiwibWVkaXVtb3JjaGlkIiwibWVkaXVtcHVycGxlIiwibWVkaXVtc2VhZ3JlZW4iLCJtZWRpdW1zbGF0ZWJsdWUiLCJtZWRpdW1zcHJpbmdncmVlbiIsIm1lZGl1bXR1cnF1b2lzZSIsIm1lZGl1bXZpb2xldHJlZCIsIm1pZG5pZ2h0Ymx1ZSIsIm1pbnRjcmVhbSIsIm1pc3R5cm9zZSIsIm1vY2Nhc2luIiwibmF2YWpvd2hpdGUiLCJuYXZ5Iiwib2xkbGFjZSIsIm9saXZlIiwib2xpdmVkcmFiIiwib3JhbmdlIiwib3JhbmdlcmVkIiwib3JjaGlkIiwicGFsZWdvbGRlbnJvZCIsInBhbGVncmVlbiIsInBhbGV0dXJxdW9pc2UiLCJwYWxldmlvbGV0cmVkIiwicGFwYXlhd2hpcCIsInBlYWNocHVmZiIsInBlcnUiLCJwaW5rIiwicGx1bSIsInBvd2RlcmJsdWUiLCJwdXJwbGUiLCJyZWJlY2NhcHVycGxlIiwicmVkIiwicm9zeWJyb3duIiwicm95YWxibHVlIiwic2FkZGxlYnJvd24iLCJzYWxtb24iLCJzYW5keWJyb3duIiwic2VhZ3JlZW4iLCJzZWFzaGVsbCIsInNpZW5uYSIsInNpbHZlciIsInNreWJsdWUiLCJzbGF0ZWJsdWUiLCJzbGF0ZWdyYXkiLCJzbGF0ZWdyZXkiLCJzbm93Iiwic3ByaW5nZ3JlZW4iLCJzdGVlbGJsdWUiLCJ0YW4iLCJ0ZWFsIiwidGhpc3RsZSIsInRvbWF0byIsInR1cnF1b2lzZSIsInZpb2xldCIsIndoZWF0Iiwid2hpdGUiLCJ3aGl0ZXNtb2tlIiwieWVsbG93IiwieWVsbG93Z3JlZW4iLCJkZWZpbmUiLCJjb2xvciIsImNoYW5uZWxzIiwiYXNzaWduIiwiZGlzcGxheWFibGUiLCJyZ2IiLCJoZXgiLCJjb2xvcl9mb3JtYXRIZXgiLCJmb3JtYXRIZXgiLCJmb3JtYXRIZXg4IiwiY29sb3JfZm9ybWF0SGV4OCIsImZvcm1hdEhzbCIsImNvbG9yX2Zvcm1hdEhzbCIsImZvcm1hdFJnYiIsImNvbG9yX2Zvcm1hdFJnYiIsInRvU3RyaW5nIiwiaHNsQ29udmVydCIsImZvcm1hdCIsImwiLCJ0b0xvd2VyQ2FzZSIsImV4ZWMiLCJwYXJzZUludCIsInJnYm4iLCJSZ2IiLCJyZ2JhIiwiaHNsYSIsInIiLCJnIiwicmdiQ29udmVydCIsIm9wYWNpdHkiLCJrIiwiY2xhbXAiLCJjbGFtcGkiLCJjbGFtcGEiLCJyZ2JfZm9ybWF0SGV4IiwicmdiX2Zvcm1hdEhleDgiLCJyZ2JfZm9ybWF0UmdiIiwiaXNOYU4iLCJoIiwicyIsIkhzbCIsImhzbCIsIm0yIiwiaHNsMnJnYiIsImNsYW1waCIsImNsYW1wdCIsImxpbmVhciIsImV4cG9uZW50aWFsIiwieSIsImdhbW1hIiwibm9nYW1tYSIsInJnYkdhbW1hIiwiZW5kIiwiY29sb3JSZ2IiLCJpc051bWJlckFycmF5IiwiQXJyYXlCdWZmZXIiLCJpc1ZpZXciLCJEYXRhVmlldyIsImdlbmVyaWNBcnJheSIsIm5iIiwibmEiLCJEYXRlIiwic2V0VGltZSIsInJlQSIsInJlQiIsInNvdXJjZSIsIm9uZSIsImJpIiwibGFzdEluZGV4IiwiYW0iLCJibSIsImJzIiwicSIsImluZGV4IiwiZGF0ZSIsIm51bWJlckFycmF5Iiwib2JqZWN0IiwiZGVncmVlcyIsIlBJIiwiaWRlbnRpdHkiLCJ0cmFuc2xhdGVYIiwidHJhbnNsYXRlWSIsInJvdGF0ZSIsInNrZXdYIiwic2NhbGVYIiwic2NhbGVZIiwiZSIsImF0YW4yIiwiYXRhbiIsInN2Z05vZGUiLCJwYXJzZUNzcyIsIkRPTU1hdHJpeCIsIldlYktpdENTU01hdHJpeCIsImlzSWRlbnRpdHkiLCJkZWNvbXBvc2UiLCJwYXJzZVN2ZyIsInRyYW5zZm9ybSIsImJhc2VWYWwiLCJjb25zb2xpZGF0ZSIsIm1hdHJpeCIsImludGVycG9sYXRlVHJhbnNmb3JtIiwicGFyc2UiLCJweENvbW1hIiwicHhQYXJlbiIsImRlZ1BhcmVuIiwicG9wIiwidHJhbnNsYXRlIiwieGEiLCJ5YSIsInhiIiwieWIiLCJzY2FsZSIsImludGVycG9sYXRlVHJhbnNmb3JtQ3NzIiwiaW50ZXJwb2xhdGVUcmFuc2Zvcm1TdmciLCJmcmFtZSIsInRpbWVvdXQiLCJpbnRlcnZhbCIsInBva2VEZWxheSIsInRhc2tIZWFkIiwidGFza1RhaWwiLCJjbG9ja0xhc3QiLCJjbG9ja05vdyIsImNsb2NrU2tldyIsImNsb2NrIiwicGVyZm9ybWFuY2UiLCJub3ciLCJzZXRGcmFtZSIsInJlcXVlc3RBbmltYXRpb25GcmFtZSIsInNldFRpbWVvdXQiLCJjbGVhck5vdyIsIlRpbWVyIiwiX2NhbGwiLCJfdGltZSIsInRpbWVyIiwicmVzdGFydCIsImRlbGF5IiwidGltZSIsIlR5cGVFcnJvciIsInNsZWVwIiwiSW5maW5pdHkiLCJ0aW1lckZsdXNoIiwidW5kZWZpbmVkIiwid2FrZSIsIm5hcCIsInBva2UiLCJ0MCIsInQxIiwidDIiLCJjbGVhclRpbWVvdXQiLCJjbGVhckludGVydmFsIiwic2V0SW50ZXJ2YWwiLCJlbGFwc2VkIiwiZW1wdHlPbiIsImVtcHR5VHdlZW4iLCJDUkVBVEVEIiwiU0NIRURVTEVEIiwiU1RBUlRJTkciLCJTVEFSVEVEIiwiUlVOTklORyIsIkVORElORyIsIkVOREVEIiwiaWQiLCJ0aW1pbmciLCJzY2hlZHVsZXMiLCJfX3RyYW5zaXRpb24iLCJ0d2VlbiIsImR1cmF0aW9uIiwiZWFzZSIsInN0YXRlIiwiaW5pdCIsInNjaGVkdWxlIiwic2VsZiIsInRpY2siLCJhY3RpdmUiLCJpbnRlcnJ1cHQiLCJ0d2VlblJlbW92ZSIsInR3ZWVuMCIsInR3ZWVuMSIsInR3ZWVuRnVuY3Rpb24iLCJfaWQiLCJ0d2VlblZhbHVlIiwidHJhbnNpdGlvbiIsImludGVycG9sYXRlTnVtYmVyIiwiaW50ZXJwb2xhdGVSZ2IiLCJpbnRlcnBvbGF0ZVN0cmluZyIsImludGVycG9sYXRlIiwidmFsdWUxIiwic3RyaW5nMDAiLCJzdHJpbmcxIiwiaW50ZXJwb2xhdGUwIiwic3RyaW5nMCIsInN0cmluZzEwIiwiYXR0clR3ZWVuIiwiYXR0ckludGVycG9sYXRlIiwiYXR0ckludGVycG9sYXRlTlMiLCJhdHRyVHdlZW5OUyIsIl92YWx1ZSIsImRlbGF5RnVuY3Rpb24iLCJkZWxheUNvbnN0YW50IiwiZHVyYXRpb25GdW5jdGlvbiIsImR1cmF0aW9uQ29uc3RhbnQiLCJlYXNlQ29uc3RhbnQiLCJlYXNlVmFyeWluZyIsIlRyYW5zaXRpb24iLCJfbmFtZSIsImV2ZXJ5Iiwib25GdW5jdGlvbiIsIm9uMCIsIm9uMSIsInNpdCIsInJlbW92ZUZ1bmN0aW9uIiwiaW5oZXJpdCIsInN0eWxlTnVsbCIsInN0eWxlTWF5YmVSZW1vdmUiLCJsaXN0ZW5lcjAiLCJzdHlsZVR3ZWVuIiwic3R5bGVJbnRlcnBvbGF0ZSIsInRleHRJbnRlcnBvbGF0ZSIsInRleHRUd2VlbiIsImlkMCIsImlkMSIsIm5ld0lkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZWplY3QiLCJjYW5jZWwiLCJzZWxlY3Rpb25fcHJvdG90eXBlIiwidHJhbnNpdGlvbl9zZWxlY3QiLCJ0cmFuc2l0aW9uX3NlbGVjdEFsbCIsInRyYW5zaXRpb25fZmlsdGVyIiwidHJhbnNpdGlvbl9tZXJnZSIsInRyYW5zaXRpb25fc2VsZWN0aW9uIiwidHJhbnNpdGlvbl90cmFuc2l0aW9uIiwidHJhbnNpdGlvbl9vbiIsInRyYW5zaXRpb25fYXR0ciIsInRyYW5zaXRpb25fYXR0clR3ZWVuIiwidHJhbnNpdGlvbl9zdHlsZSIsInRyYW5zaXRpb25fc3R5bGVUd2VlbiIsInRyYW5zaXRpb25fdGV4dCIsInRyYW5zaXRpb25fdGV4dFR3ZWVuIiwidHJhbnNpdGlvbl9yZW1vdmUiLCJ0cmFuc2l0aW9uX3R3ZWVuIiwidHJhbnNpdGlvbl9kZWxheSIsInRyYW5zaXRpb25fZHVyYXRpb24iLCJ0cmFuc2l0aW9uX2Vhc2UiLCJ0cmFuc2l0aW9uX2Vhc2VWYXJ5aW5nIiwidHJhbnNpdGlvbl9lbmQiLCJjdWJpY0luT3V0IiwiZGVmYXVsdFRpbWluZyIsImVhc2VDdWJpY0luT3V0Iiwic2VsZWN0aW9uX2ludGVycnVwdCIsInNlbGVjdGlvbl90cmFuc2l0aW9uIiwiaW5pdFJhbmdlIiwiZG9tYWluIiwiaW1wbGljaXQiLCJvcmRpbmFsIiwidW5rbm93biIsImJhbmQiLCJvcmRpbmFsUmFuZ2UiLCJyMCIsInIxIiwiYmFuZHdpZHRoIiwicGFkZGluZ0lubmVyIiwicGFkZGluZ091dGVyIiwiYWxpZ24iLCJyZXNjYWxlIiwidmFsdWVzIiwic2VxdWVuY2UiLCJyYW5nZVJvdW5kIiwicGFkZGluZyIsImNvbnN0YW50cyIsInVuaXQiLCJub3JtYWxpemUiLCJjbGFtcGVyIiwiYmltYXAiLCJkMCIsImQxIiwicG9seW1hcCIsImJpc2VjdCIsInRhcmdldCIsInRyYW5zZm9ybWVyIiwiaW50ZXJwb2xhdGVWYWx1ZSIsInVudHJhbnNmb3JtIiwicGllY2V3aXNlIiwib3V0cHV0IiwiaW5wdXQiLCJpbnZlcnQiLCJpbnRlcnBvbGF0ZVJvdW5kIiwidSIsImNvbnRpbnVvdXMiLCJuaWNlIiwieDAiLCJ4MSIsInRpbWVJbnRlcnZhbCIsImZsb29yaSIsIm9mZnNldGkiLCJmaWVsZCIsIm9mZnNldCIsImlzRmluaXRlIiwibWlsbGlzZWNvbmQiLCJkdXJhdGlvblNlY29uZCIsImR1cmF0aW9uTWludXRlIiwiZHVyYXRpb25Ib3VyIiwiZHVyYXRpb25EYXkiLCJkdXJhdGlvbldlZWsiLCJkdXJhdGlvbk1vbnRoIiwiZHVyYXRpb25ZZWFyIiwic2Vjb25kIiwiZ2V0TWlsbGlzZWNvbmRzIiwiZ2V0VVRDU2Vjb25kcyIsInRpbWVNaW51dGUiLCJnZXRTZWNvbmRzIiwiZ2V0TWludXRlcyIsInV0Y01pbnV0ZSIsInNldFVUQ1NlY29uZHMiLCJnZXRVVENNaW51dGVzIiwidGltZUhvdXIiLCJnZXRIb3VycyIsInV0Y0hvdXIiLCJzZXRVVENNaW51dGVzIiwiZ2V0VVRDSG91cnMiLCJ0aW1lRGF5Iiwic2V0SG91cnMiLCJzZXREYXRlIiwiZ2V0RGF0ZSIsImdldFRpbWV6b25lT2Zmc2V0IiwidXRjRGF5Iiwic2V0VVRDSG91cnMiLCJzZXRVVENEYXRlIiwiZ2V0VVRDRGF0ZSIsInVuaXhEYXkiLCJ0aW1lV2Vla2RheSIsImdldERheSIsInRpbWVTdW5kYXkiLCJ0aW1lTW9uZGF5IiwidGltZVR1ZXNkYXkiLCJ0aW1lV2VkbmVzZGF5IiwidGltZVRodXJzZGF5IiwidGltZUZyaWRheSIsInRpbWVTYXR1cmRheSIsInV0Y1dlZWtkYXkiLCJnZXRVVENEYXkiLCJ1dGNTdW5kYXkiLCJ1dGNNb25kYXkiLCJ1dGNUdWVzZGF5IiwidXRjV2VkbmVzZGF5IiwidXRjVGh1cnNkYXkiLCJ1dGNGcmlkYXkiLCJ1dGNTYXR1cmRheSIsInRpbWVNb250aCIsInNldE1vbnRoIiwiZ2V0TW9udGgiLCJnZXRGdWxsWWVhciIsInV0Y01vbnRoIiwic2V0VVRDTW9udGgiLCJnZXRVVENNb250aCIsImdldFVUQ0Z1bGxZZWFyIiwidGltZVllYXIiLCJzZXRGdWxsWWVhciIsInV0Y1llYXIiLCJzZXRVVENGdWxsWWVhciIsInRpY2tlciIsInllYXIiLCJtb250aCIsIndlZWsiLCJkYXkiLCJob3VyIiwibWludXRlIiwidGlja0ludGVydmFscyIsInRpY2tzIiwidGlja0ludGVydmFsIiwiYWJzIiwidGltZVRpY2tzIiwidGltZVRpY2tJbnRlcnZhbCIsImxvY2FsRGF0ZSIsIkgiLCJNIiwiUyIsIkwiLCJ1dGNEYXRlIiwiVVRDIiwibmV3RGF0ZSIsImZvcm1hdExvY2FsZSIsImxvY2FsZSIsImxvY2FsZV9kYXRlVGltZSIsImRhdGVUaW1lIiwibG9jYWxlX2RhdGUiLCJsb2NhbGVfdGltZSIsImxvY2FsZV9wZXJpb2RzIiwicGVyaW9kcyIsImxvY2FsZV93ZWVrZGF5cyIsImRheXMiLCJsb2NhbGVfc2hvcnRXZWVrZGF5cyIsInNob3J0RGF5cyIsImxvY2FsZV9tb250aHMiLCJtb250aHMiLCJsb2NhbGVfc2hvcnRNb250aHMiLCJzaG9ydE1vbnRocyIsInBlcmlvZFJlIiwiZm9ybWF0UmUiLCJwZXJpb2RMb29rdXAiLCJmb3JtYXRMb29rdXAiLCJ3ZWVrZGF5UmUiLCJ3ZWVrZGF5TG9va3VwIiwic2hvcnRXZWVrZGF5UmUiLCJzaG9ydFdlZWtkYXlMb29rdXAiLCJtb250aFJlIiwibW9udGhMb29rdXAiLCJzaG9ydE1vbnRoUmUiLCJzaG9ydE1vbnRoTG9va3VwIiwiZm9ybWF0cyIsImZvcm1hdFNob3J0V2Vla2RheSIsImZvcm1hdFdlZWtkYXkiLCJmb3JtYXRTaG9ydE1vbnRoIiwiZm9ybWF0TW9udGgiLCJmb3JtYXREYXlPZk1vbnRoIiwiZm9ybWF0TWljcm9zZWNvbmRzIiwiZm9ybWF0WWVhcklTTyIsImZvcm1hdEZ1bGxZZWFySVNPIiwiZm9ybWF0SG91cjI0IiwiZm9ybWF0SG91cjEyIiwiZm9ybWF0RGF5T2ZZZWFyIiwiZm9ybWF0TWlsbGlzZWNvbmRzIiwiZm9ybWF0TW9udGhOdW1iZXIiLCJmb3JtYXRNaW51dGVzIiwiZm9ybWF0UGVyaW9kIiwiZm9ybWF0UXVhcnRlciIsImZvcm1hdFVuaXhUaW1lc3RhbXAiLCJmb3JtYXRVbml4VGltZXN0YW1wU2Vjb25kcyIsImZvcm1hdFNlY29uZHMiLCJmb3JtYXRXZWVrZGF5TnVtYmVyTW9uZGF5IiwiZm9ybWF0V2Vla051bWJlclN1bmRheSIsImZvcm1hdFdlZWtOdW1iZXJJU08iLCJmb3JtYXRXZWVrZGF5TnVtYmVyU3VuZGF5IiwiZm9ybWF0V2Vla051bWJlck1vbmRheSIsImZvcm1hdFllYXIiLCJmb3JtYXRGdWxsWWVhciIsImZvcm1hdFpvbmUiLCJmb3JtYXRMaXRlcmFsUGVyY2VudCIsInV0Y0Zvcm1hdHMiLCJmb3JtYXRVVENTaG9ydFdlZWtkYXkiLCJmb3JtYXRVVENXZWVrZGF5IiwiZm9ybWF0VVRDU2hvcnRNb250aCIsImZvcm1hdFVUQ01vbnRoIiwiZm9ybWF0VVRDRGF5T2ZNb250aCIsImZvcm1hdFVUQ01pY3Jvc2Vjb25kcyIsImZvcm1hdFVUQ1llYXJJU08iLCJmb3JtYXRVVENGdWxsWWVhcklTTyIsImZvcm1hdFVUQ0hvdXIyNCIsImZvcm1hdFVUQ0hvdXIxMiIsImZvcm1hdFVUQ0RheU9mWWVhciIsImZvcm1hdFVUQ01pbGxpc2Vjb25kcyIsImZvcm1hdFVUQ01vbnRoTnVtYmVyIiwiZm9ybWF0VVRDTWludXRlcyIsImZvcm1hdFVUQ1BlcmlvZCIsImZvcm1hdFVUQ1F1YXJ0ZXIiLCJmb3JtYXRVVENTZWNvbmRzIiwiZm9ybWF0VVRDV2Vla2RheU51bWJlck1vbmRheSIsImZvcm1hdFVUQ1dlZWtOdW1iZXJTdW5kYXkiLCJmb3JtYXRVVENXZWVrTnVtYmVySVNPIiwiZm9ybWF0VVRDV2Vla2RheU51bWJlclN1bmRheSIsImZvcm1hdFVUQ1dlZWtOdW1iZXJNb25kYXkiLCJmb3JtYXRVVENZZWFyIiwiZm9ybWF0VVRDRnVsbFllYXIiLCJmb3JtYXRVVENab25lIiwicGFyc2VzIiwicGFyc2VTaG9ydFdlZWtkYXkiLCJwYXJzZVdlZWtkYXkiLCJwYXJzZVNob3J0TW9udGgiLCJwYXJzZU1vbnRoIiwicGFyc2VMb2NhbGVEYXRlVGltZSIsInBhcnNlRGF5T2ZNb250aCIsInBhcnNlTWljcm9zZWNvbmRzIiwicGFyc2VZZWFyIiwicGFyc2VGdWxsWWVhciIsInBhcnNlSG91cjI0IiwicGFyc2VEYXlPZlllYXIiLCJwYXJzZU1pbGxpc2Vjb25kcyIsInBhcnNlTW9udGhOdW1iZXIiLCJwYXJzZU1pbnV0ZXMiLCJwYXJzZVBlcmlvZCIsInBhcnNlUXVhcnRlciIsInBhcnNlVW5peFRpbWVzdGFtcCIsInBhcnNlVW5peFRpbWVzdGFtcFNlY29uZHMiLCJwYXJzZVNlY29uZHMiLCJwYXJzZVdlZWtkYXlOdW1iZXJNb25kYXkiLCJwYXJzZVdlZWtOdW1iZXJTdW5kYXkiLCJwYXJzZVdlZWtOdW1iZXJJU08iLCJwYXJzZVdlZWtkYXlOdW1iZXJTdW5kYXkiLCJwYXJzZVdlZWtOdW1iZXJNb25kYXkiLCJwYXJzZUxvY2FsZURhdGUiLCJwYXJzZUxvY2FsZVRpbWUiLCJwYXJzZVpvbmUiLCJwYXJzZUxpdGVyYWxQZXJjZW50IiwibmV3Rm9ybWF0IiwiWCIsInNwZWNpZmllciIsInBhZCIsImNoYXJDb2RlQXQiLCJwYWRzIiwiY2hhckF0IiwibmV3UGFyc2UiLCJaIiwicGFyc2VTcGVjaWZpZXIiLCJRIiwicCIsIlYiLCJ3IiwiVyIsIlUiLCJ1dGNGb3JtYXQiLCJ1dGNQYXJzZSIsIm51bWJlclJlIiwicGVyY2VudFJlIiwicmVxdW90ZVJlIiwiZmlsbCIsIndpZHRoIiwic2lnbiIsInJlcXVvdGUiLCJyZXBsYWNlIiwiZElTTyIsInoiLCJnZXRVVENNaWxsaXNlY29uZHMiLCJkb3ciLCJVVENkSVNPIiwidGltZUZvcm1hdCIsImRlZmF1bHRMb2NhbGUiLCJjYWxlbmRhciIsImZvcm1hdE1pbGxpc2Vjb25kIiwiZm9ybWF0U2Vjb25kIiwiZm9ybWF0TWludXRlIiwiZm9ybWF0SG91ciIsImZvcm1hdERheSIsImZvcm1hdFdlZWsiLCJ0aWNrRm9ybWF0IiwidGltZVdlZWsiLCJ0aW1lU2Vjb25kIiwiVHJhbnNmb3JtIiwicG9pbnQiLCJhcHBseVgiLCJhcHBseVkiLCJsb2NhdGlvbiIsImludmVydFgiLCJpbnZlcnRZIiwicmVzY2FsZVgiLCJyZXNjYWxlWSIsInVzZVJlZiIsInVzZUVmZmVjdCIsImQzLnNlbGVjdCIsImQzLnNjYWxlVGltZSIsImQzLnNjYWxlQmFuZCIsImQzLnRpbWVGb3JtYXQiXSwibWFwcGluZ3MiOiI7O0VBQWUsU0FBU0EsV0FBU0EsQ0FBQ0MsQ0FBQyxFQUFFQyxDQUFDLEVBQUU7RUFDdEMsRUFBQSxPQUFPRCxDQUFDLElBQUksSUFBSSxJQUFJQyxDQUFDLElBQUksSUFBSSxHQUFHQyxHQUFHLEdBQUdGLENBQUMsR0FBR0MsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHRCxDQUFDLEdBQUdDLENBQUMsR0FBRyxDQUFDLEdBQUdELENBQUMsSUFBSUMsQ0FBQyxHQUFHLENBQUMsR0FBR0MsR0FBRyxDQUFBO0VBQ2pGOztFQ0ZlLFNBQVNDLFVBQVVBLENBQUNILENBQUMsRUFBRUMsQ0FBQyxFQUFFO0VBQ3ZDLEVBQUEsT0FBT0QsQ0FBQyxJQUFJLElBQUksSUFBSUMsQ0FBQyxJQUFJLElBQUksR0FBR0MsR0FBRyxHQUMvQkQsQ0FBQyxHQUFHRCxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQ1ZDLENBQUMsR0FBR0Qs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QVUsRUFBRSxRQUFRO0VBQ3BCQyxFQUFBQSxTQUFTLEVBQUUsUUFBUTtFQUNuQkMsRUFBQUEsSUFBSSxFQUFFLFFBQVE7RUFDZEMsRUFBQUEsSUFBSSxFQUFFLFFBQVE7RUFDZEMsRUFBQUEsSUFBSSxFQUFFLFFBQVE7RUFDZEMsRUFBQUEsVUFBVSxFQUFFLFFBQVE7RUFDcEJDLEVBQUFBLE1BQU0sRUFBRSxRQUFRO0VBQ2hCQyxFQUFBQSxhQUFhLEVBQUUsUUFBUTtFQUN2QkMsRUFBQUEsR0FBRyxFQUFFLFFBQVE7RUFDYkMsRUFBQUEsU0FBUyxFQUFFLFFBQVE7RUFDbkJDLEVBQUFBLFNBQVMsRUFBRSxRQUFRO0VBQ25CQyxFQUFBQSxXQUFXLEVBQUUsUUFBUTtFQUNyQkMsRUFBQUEsTUFBTSxFQUFFLFFBQVE7RUFDaEJDLEVBQUFBLFVBQVUsRUFBRSxRQUFRO0VBQ3BCQyxFQUFBQSxRQUFRLEVBQUUsUUFBUTtFQUNsQkMsRUFBQUEsUUFBUSxFQUFFLFFBQVE7RUFDbEJDLEVBQUFBLE1BQU0sRUFBRSxRQUFRO0VBQ2hCQyxFQUFBQSxNQUFNLEVBQUUsUUFBUTtFQUNoQkMsRUFBQUEsT0FBTyxFQUFFLFFBQVE7RUFDakJDLEVBQUFBLFNBQVMsRUFBRSxRQUFRO0VBQ25CQyxFQUFBQSxTQUFTLEVBQUUsUUFBUTtFQUNuQkMsRUFBQUEsU0FBUyxFQUFFLFFBQVE7RUFDbkJDLEVBQUFBLElBQUksRUFBRSxRQUFRO0VBQ2RDLEVBQUFBLFdBQVcsRUFBRSxRQUFRO0VBQ3JCQyxFQUFBQSxTQUFTLEVBQUUsUUFBUTtFQUNuQkMsRUFBQUEsR0FBRyxFQUFFLFFBQVE7RUFDYkMsRUFBQUEsSUFBSSxFQUFFLFFBQVE7RUFDZEMsRUFBQUEsT0FBTyxFQUFFLFFBQVE7RUFDakJDLEVBQUFBLE1BQU0sRUFBRSxRQUFRO0VBQ2hCQyxFQUFBQSxTQUFTLEVBQUUsUUFBUTtFQUNuQkMsRUFBQUEsTUFBTSxFQUFFLFFBQVE7RUFDaEJDLEVBQUFBLEtBQUssRUFBRSxRQUFRO0VBQ2ZDLEVBQUFBLEtBQUssRUFBRSxRQUFR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a0JBQ05BLG1CQUFLLENBQUEsS0FBQSxFQUFBLEVBQUEsU0FBUyxFQUFDLGFBQWEsRUFBQTtFQUN4QixvQkFBQUEsbUJBQUEsQ0FBQSxLQUFBLEVBQUEsRUFBSyxTQUFTLEVBQUMsZUFBZSxFQUFDLE9BQU8sRUFBQyxXQUFXLEVBQUE7RUFDOUMsd0JBQUFBLG1CQUFBLENBQUEsUUFBQSxFQUFBLEVBQVEsRUFBRSxFQUFDLElBQUksRUFBQyxFQUFFLEVBQUMsSUFBSSxFQUFDLENBQUMsRUFBQyxHQUFHLEVBQUMsU0FBUyxFQUFDLGNBQWMsR0FBRSxDQUN0RDtFQUNOLG9CQUFBQSxtQkFBQSxDQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsY0FBQSxDQUF5QixDQUN2QixDQUNKO2NBRU5BLG1CQUFLLENBQUEsS0FBQSxFQUFBLEVBQUEsR0FBRyxFQUFFLFFBQVEsRUFBRSxFQUFFLEVBQUMsT0FBTyxFQUFPLENBQUEsQ0FDbkMsQ0FDSixFQUNSO0VBQ047Ozs7Ozs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyLDMzLDM0LDM1LDM2LDM3LDM4LDM5LDQwLDQxLDQyLDQzLDQ0LDQ1LDQ2LDQ3LDQ4LDQ5LDUwLDUxLDUyLDUzLDU0LDU1LDU2LDU3LDU4LDU5LDYwLDYxLDYyLDYzLDY0LDY1LDY2LDY3LDY4LDY5LDcwLDcxLDcyLDczLDc0LDc1LDc2LDc3LDc4LDc5LDgwLDgxLDgyLDgzLDg0LDg1LDg2LDg3LDg4LDg5LDkwLDkxLDkyLDkzLDk0LDk1LDk2LDk3LDk4LDk5LDEwMCwxMDEsMTAyLDEwMywxMDQsMTA1LDEwNiwxMDcsMTA4LDEwOSwxMTAsMTExLDExMiwxMTMsMTE0LDExNSwxMTYsMTE3LDExOCwxMTksMTIwLDEyMSwxMjJdfQ==
