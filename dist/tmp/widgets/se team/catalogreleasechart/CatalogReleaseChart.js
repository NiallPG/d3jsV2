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
      const chartRef = react.useRef(null);
      // Points to the div where the D3.js chart will be rendered. 
      // D3 needs direct DOM access to create SVG elements, so this ref 
      // provides a stable reference to the chart container.
      const containerRef = react.useRef(null); // Refs don't trigger re-renders when changed
      // Points to the outer container div. Used to measure the widget's 
      // available width for responsive sizing.
      const [dimensions, setDimensions] = react.useState({ width: 0, height: chartHeight });
      // State to hold the dimensions of the chart, stuff is calculated dynamically
      // so width is just a placeholder until the first resize.
      const [industries, setIndustries] = react.useState([]);
      // State to hold the processed industry data from the Mendix data source.
      // Handle resize
      react.useEffect(() => {
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
      react.useEffect(() => {
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
      react.useEffect(() => {
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
      react.useEffect(() => {
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
      }, [dimensions, industries, showToday, onItemClick, theme]);
      // Loading state
      if (!catalogData || catalogData.status === "loading" /* ValueStatus.Loading */) {
          return (react.createElement("div", { className: `catalog-release-chart ${name}`, ref: containerRef },
              react.createElement("div", { className: "chart-container" },
                  react.createElement("h1", { className: "chart-title" }, chartTitle),
                  react.createElement("div", { className: "loading-message" }, "Loading catalog data..."))));
      }
      // Error state
      if (catalogData.status === "unavailable" /* ValueStatus.Unavailable */) {
          return (react.createElement("div", { className: `catalog-release-chart ${name}`, ref: containerRef },
              react.createElement("div", { className: "chart-container" },
                  react.createElement("h1", { className: "chart-title" }, chartTitle),
                  react.createElement("div", { className: "error-message" }, "Unable to load catalog data. Please check your data source configuration."))));
      }
      // No data state
      if (!catalogData.items || catalogData.items.length === 0) {
          return (react.createElement("div", { className: `catalog-release-chart ${name}`, ref: containerRef },
              react.createElement("div", { className: "chart-container" },
                  react.createElement("h1", { className: "chart-title" }, chartTitle),
                  react.createElement("div", { className: "no-data-message" }, "No catalog data available. Please add catalog release schedules to see the chart."))));
      }
      return (react.createElement("div", { className: "catalog-release-chart", "data-theme": useDarkMode ? "dark" : "light" },
          react.createElement("div", { className: "chart-container", ref: containerRef },
              chartTitle && react.createElement("h1", { className: "chart-title" }, chartTitle),
              enableLegend && (react.createElement("div", { className: "legend" },
                  react.createElement("div", { className: "legend-item" },
                      react.createElement("div", { className: "legend-symbol retired-marker" }),
                      react.createElement("span", null, "Retired")),
                  react.createElement("div", { className: "legend-item" },
                      react.createElement("div", { className: "legend-symbol current-marker" }),
                      react.createElement("span", null, "Current")),
                  react.createElement("div", { className: "legend-item" },
                      react.createElement("div", { className: "legend-symbol upcoming-box" }),
                      react.createElement("span", null, "Upcoming")))),
              react.createElement("div", { id: "chart", ref: chartRef }))));
  }

  exports.CatalogReleaseChart = CatalogReleaseChart;

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQ2F0YWxvZ1JlbGVhc2VDaGFydC5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9hc2NlbmRpbmcuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2Rlc2NlbmRpbmcuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2Jpc2VjdG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy9udW1iZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtYXJyYXkvc3JjL2Jpc2VjdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9pbnRlcm5tYXAvc3JjL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWFycmF5L3NyYy90aWNrcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1hcnJheS9zcmMvcmFuZ2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtZGlzcGF0Y2gvc3JjL2Rpc3BhdGNoLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvbmFtZXNwYWNlcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL25hbWVzcGFjZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NyZWF0b3IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rvci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9zZWxlY3QuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9hcnJheS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdG9yQWxsLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NlbGVjdEFsbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL21hdGNoZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0Q2hpbGQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vc2VsZWN0Q2hpbGRyZW4uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZmlsdGVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NwYXJzZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9lbnRlci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL2NvbnN0YW50LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2RhdGEuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZXhpdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9qb2luLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL21lcmdlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL29yZGVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NvcnQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vY2FsbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9ub2Rlcy5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9ub2RlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3NpemUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZW1wdHkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vZWFjaC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9hdHRyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvd2luZG93LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3N0eWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3Byb3BlcnR5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2NsYXNzZWQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vdGV4dC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9odG1sLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL3JhaXNlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2xvd2VyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2FwcGVuZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zZWxlY3Rpb24vc3JjL3NlbGVjdGlvbi9pbnNlcnQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2VsZWN0aW9uL3NyYy9zZWxlY3Rpb24vcmVtb3ZlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Nsb25lLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2RhdHVtLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL29uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2Rpc3BhdGNoLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2l0ZXJhdG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0aW9uL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNlbGVjdGlvbi9zcmMvc2VsZWN0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWNvbG9yL3NyYy9kZWZpbmUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtY29sb3Ivc3JjL2NvbG9yLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9jb25zdGFudC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvY29sb3IuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3JnYi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvbnVtYmVyQXJyYXkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL2FycmF5LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9kYXRlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy9udW1iZXIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL29iamVjdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvc3RyaW5nLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLWludGVycG9sYXRlL3NyYy92YWx1ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvcm91bmQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9kZWNvbXBvc2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtaW50ZXJwb2xhdGUvc3JjL3RyYW5zZm9ybS9wYXJzZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1pbnRlcnBvbGF0ZS9zcmMvdHJhbnNmb3JtL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWVyL3NyYy90aW1lci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lci9zcmMvdGltZW91dC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NjaGVkdWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL2ludGVycnVwdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy9zZWxlY3Rpb24vaW50ZXJydXB0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vdHdlZW4uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9pbnRlcnBvbGF0ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2F0dHIuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9hdHRyVHdlZW4uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9kZWxheS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2R1cmF0aW9uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZWFzZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL2Vhc2VWYXJ5aW5nLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZmlsdGVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vbWVyZ2UuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi9vbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3JlbW92ZS5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdEFsbC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3NlbGVjdGlvbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3N0eWxlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vc3R5bGVUd2Vlbi5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10cmFuc2l0aW9uL3NyYy90cmFuc2l0aW9uL3RleHQuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi90ZXh0VHdlZW4uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvdHJhbnNpdGlvbi90cmFuc2l0aW9uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vZW5kLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRyYW5zaXRpb24vc3JjL3RyYW5zaXRpb24vaW5kZXguanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtZWFzZS9zcmMvY3ViaWMuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL3RyYW5zaXRpb24uanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdHJhbnNpdGlvbi9zcmMvc2VsZWN0aW9uL2luZGV4LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9pbml0LmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9vcmRpbmFsLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9iYW5kLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9jb25zdGFudC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy1zY2FsZS9zcmMvbnVtYmVyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9jb250aW51b3VzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXNjYWxlL3NyYy9uaWNlLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL2ludGVydmFsLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL21pbGxpc2Vjb25kLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL2R1cmF0aW9uLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL3NlY29uZC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9taW51dGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvaG91ci5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9kYXkuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS9zcmMvd2Vlay5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy9tb250aC5qcyIsIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy9kMy10aW1lL3NyYy95ZWFyLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUvc3JjL3RpY2tzLmpzIiwiLi4vLi4vLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2QzLXRpbWUtZm9ybWF0L3NyYy9sb2NhbGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtdGltZS1mb3JtYXQvc3JjL2RlZmF1bHRMb2NhbGUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtc2NhbGUvc3JjL3RpbWUuanMiLCIuLi8uLi8uLi8uLi8uLi9ub2RlX21vZHVsZXMvZDMtem9vbS9zcmMvdHJhbnNmb3JtLmpzIiwiLi4vLi4vLi4vLi4vLi4vc3JjL0NhdGFsb2dSZWxlYXNlQ2hhcnQudHN4Il0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhID09IG51bGwgfHwgYiA9PSBudWxsID8gTmFOIDogYSA8IGIgPyAtMSA6IGEgPiBiID8gMSA6IGEgPj0gYiA/IDAgOiBOYU47XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBkZXNjZW5kaW5nKGEsIGIpIHtcbiAgcmV0dXJuIGEgPT0gbnVsbCB8fCBiID09IG51bGwgPyBOYU5cbiAgICA6IGIgPCBhID8gLTFcbiAgICA6IGIgPiBhID8gMVxuICAgIDogYiA+PSBhID8gMFxuICAgIDogTmFOO1xufVxuIiwiaW1wb3J0IGFzY2VuZGluZyBmcm9tIFwiLi9hc2NlbmRpbmcuanNcIjtcbmltcG9ydCBkZXNjZW5kaW5nIGZyb20gXCIuL2Rlc2NlbmRpbmcuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gYmlzZWN0b3IoZikge1xuICBsZXQgY29tcGFyZTEsIGNvbXBhcmUyLCBkZWx0YTtcblxuICAvLyBJZiBhbiBhY2Nlc3NvciBpcyBzcGVjaWZpZWQsIHByb21vdGUgaXQgdG8gYSBjb21wYXJhdG9yLiBJbiB0aGlzIGNhc2Ugd2VcbiAgLy8gY2FuIHRlc3Qgd2hldGhlciB0aGUgc2VhcmNoIHZhbHVlIGlzIChzZWxmLSkgY29tcGFyYWJsZS4gV2UgY2Fu4oCZdCBkbyB0aGlzXG4gIC8vIGZvciBhIGNvbXBhcmF0b3IgKGV4Y2VwdCBmb3Igc3BlY2lmaWMsIGtub3duIGNvbXBhcmF0b3JzKSBiZWNhdXNlIHdlIGNhbuKAmXRcbiAgLy8gdGVsbCBpZiB0aGUgY29tcGFyYXRvciBpcyBzeW1tZXRyaWMsIGFuZCBhbiBhc3ltbWV0cmljIGNvbXBhcmF0b3IgY2Fu4oCZdCBiZVxuICAvLyB1c2VkIHRvIHRlc3Qgd2hldGhlciBhIHNpbmdsZSB2YWx1ZSBpcyBjb21wYXJhYmxlLlxuICBpZiAoZi5sZW5ndGggIT09IDIpIHtcbiAgICBjb21wYXJlMSA9IGFzY2VuZGluZztcbiAgICBjb21wYXJlMiA9IChkLCB4KSA9PiBhc2NlbmRpbmcoZihkKSwgeCk7XG4gICAgZGVsdGEgPSAoZCwgeCkgPT4gZihkKSAtIHg7XG4gIH0gZWxzZSB7XG4gICAgY29tcGFyZTEgPSBmID09PSBhc2NlbmRpbmcgfHwgZiA9PT0gZGVzY2VuZGluZyA/IGYgOiB6ZXJvO1xuICAgIGNvbXBhcmUyID0gZjtcbiAgICBkZWx0YSA9IGY7XG4gIH1cblxuICBmdW5jdGlvbiBsZWZ0KGEsIHgsIGxvID0gMCwgaGkgPSBhLmxlbmd0aCkge1xuICAgIGlmIChsbyA8IGhpKSB7XG4gICAgICBpZiAoY29tcGFyZTEoeCwgeCkgIT09IDApIHJldHVybiBoaTtcbiAgICAgIGRvIHtcbiAgICAgICAgY29uc3QgbWlkID0gKGxvICsgaGkpID4+PiAxO1xuICAgICAgICBpZiAoY29tcGFyZTIoYVttaWRdLCB4KSA8IDApIGxvID0gbWlkICsgMTtcbiAgICAgICAgZWxzZSBoaSA9IG1pZDtcbiAgICAgIH0gd2hpbGUgKGxvIDwgaGkpO1xuICAgIH1cbiAgICByZXR1cm4gbG87XG4gIH1cblxuICBmdW5jdGlvbiByaWdodChhLCB4LCBsbyA9IDAsIGhpID0gYS5sZW5ndGgpIHtcbiAgICBpZiAobG8gPCBoaSkge1xuICAgICAgaWYgKGNvbXBhcmUxKHgsIHgpICE9PSAwKSByZXR1cm4gaGk7XG4gICAgICBkbyB7XG4gICAgICAgIGNvbnN0IG1pZCA9IChsbyArIGhpKSA+Pj4gMTtcbiAgICAgICAgaWYgKGNvbXBhcmUyKGFbbWlkXSwgeCkgPD0gMCkgbG8gPSBtaWQgKyAxO1xuICAgICAgICBlbHNlIGhpID0gbWlkO1xuICAgICAgfSB3aGlsZSAobG8gPCBoaSk7XG4gICAgfVxuICAgIHJldHVybiBsbztcbiAgfVxuXG4gIGZ1bmN0aW9uIGNlbnRlcihhLCB4LCBsbyA9IDAsIGhpID0gYS5sZW5ndGgpIHtcbiAgICBjb25zdCBpID0gbGVmdChhLCB4LCBsbywgaGkgLSAxKTtcbiAgICByZXR1cm4gaSA+IGxvICYmIGRlbHRhKGFbaSAtIDFdLCB4KSA+IC1kZWx0YShhW2ldLCB4KSA/IGkgLSAxIDogaTtcbiAgfVxuXG4gIHJldHVybiB7bGVmdCwgY2VudGVyLCByaWdodH07XG59XG5cbmZ1bmN0aW9uIHplcm8oKSB7XG4gIHJldHVybiAwO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gbnVtYmVyKHgpIHtcbiAgcmV0dXJuIHggPT09IG51bGwgPyBOYU4gOiAreDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uKiBudW1iZXJzKHZhbHVlcywgdmFsdWVvZikge1xuICBpZiAodmFsdWVvZiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZm9yIChsZXQgdmFsdWUgb2YgdmFsdWVzKSB7XG4gICAgICBpZiAodmFsdWUgIT0gbnVsbCAmJiAodmFsdWUgPSArdmFsdWUpID49IHZhbHVlKSB7XG4gICAgICAgIHlpZWxkIHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBsZXQgaW5kZXggPSAtMTtcbiAgICBmb3IgKGxldCB2YWx1ZSBvZiB2YWx1ZXMpIHtcbiAgICAgIGlmICgodmFsdWUgPSB2YWx1ZW9mKHZhbHVlLCArK2luZGV4LCB2YWx1ZXMpKSAhPSBudWxsICYmICh2YWx1ZSA9ICt2YWx1ZSkgPj0gdmFsdWUpIHtcbiAgICAgICAgeWllbGQgdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgYXNjZW5kaW5nIGZyb20gXCIuL2FzY2VuZGluZy5qc1wiO1xuaW1wb3J0IGJpc2VjdG9yIGZyb20gXCIuL2Jpc2VjdG9yLmpzXCI7XG5pbXBvcnQgbnVtYmVyIGZyb20gXCIuL251bWJlci5qc1wiO1xuXG5jb25zdCBhc2NlbmRpbmdCaXNlY3QgPSBiaXNlY3Rvcihhc2NlbmRpbmcpO1xuZXhwb3J0IGNvbnN0IGJpc2VjdFJpZ2h0ID0gYXNjZW5kaW5nQmlzZWN0LnJpZ2h0O1xuZXhwb3J0IGNvbnN0IGJpc2VjdExlZnQgPSBhc2NlbmRpbmdCaXNlY3QubGVmdDtcbmV4cG9ydCBjb25zdCBiaXNlY3RDZW50ZXIgPSBiaXNlY3RvcihudW1iZXIpLmNlbnRlcjtcbmV4cG9ydCBkZWZhdWx0IGJpc2VjdFJpZ2h0O1xuIiwiZXhwb3J0IGNsYXNzIEludGVybk1hcCBleHRlbmRzIE1hcCB7XG4gIGNvbnN0cnVjdG9yKGVudHJpZXMsIGtleSA9IGtleW9mKSB7XG4gICAgc3VwZXIoKTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydGllcyh0aGlzLCB7X2ludGVybjoge3ZhbHVlOiBuZXcgTWFwKCl9LCBfa2V5OiB7dmFsdWU6IGtleX19KTtcbiAgICBpZiAoZW50cmllcyAhPSBudWxsKSBmb3IgKGNvbnN0IFtrZXksIHZhbHVlXSBvZiBlbnRyaWVzKSB0aGlzLnNldChrZXksIHZhbHVlKTtcbiAgfVxuICBnZXQoa2V5KSB7XG4gICAgcmV0dXJuIHN1cGVyLmdldChpbnRlcm5fZ2V0KHRoaXMsIGtleSkpO1xuICB9XG4gIGhhcyhrZXkpIHtcbiAgICByZXR1cm4gc3VwZXIuaGFzKGludGVybl9nZXQodGhpcywga2V5KSk7XG4gIH1cbiAgc2V0KGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gc3VwZXIuc2V0KGludGVybl9zZXQodGhpcywga2V5KSwgdmFsdWUpO1xuICB9XG4gIGRlbGV0ZShrZXkpIHtcbiAgICByZXR1cm4gc3VwZXIuZGVsZXRlKGludGVybl9kZWxldGUodGhpcywga2V5KSk7XG4gIH1cbn1cblxuZXhwb3J0IGNsYXNzIEludGVyblNldCBleHRlbmRzIFNldCB7XG4gIGNvbnN0cnVjdG9yKHZhbHVlcywga2V5ID0ga2V5b2YpIHtcbiAgICBzdXBlcigpO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0aWVzKHRoaXMsIHtfaW50ZXJuOiB7dmFsdWU6IG5ldyBNYXAoKX0sIF9rZXk6IHt2YWx1ZToga2V5fX0pO1xuICAgIGlmICh2YWx1ZXMgIT0gbnVsbCkgZm9yIChjb25zdCB2YWx1ZSBvZiB2YWx1ZXMpIHRoaXMuYWRkKHZhbHVlKTtcbiAgfVxuICBoYXModmFsdWUpIHtcbiAgICByZXR1cm4gc3VwZXIuaGFzKGludGVybl9nZXQodGhpcywgdmFsdWUpKTtcbiAgfVxuICBhZGQodmFsdWUpIHtcbiAgICByZXR1cm4gc3VwZXIuYWRkKGludGVybl9zZXQodGhpcywgdmFsdWUpKTtcbiAgfVxuICBkZWxldGUodmFsdWUpIHtcbiAgICByZXR1cm4gc3VwZXIuZGVsZXRlKGludGVybl9kZWxldGUodGhpcywgdmFsdWUpKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBpbnRlcm5fZ2V0KHtfaW50ZXJuLCBfa2V5fSwgdmFsdWUpIHtcbiAgY29uc3Qga2V5ID0gX2tleSh2YWx1ZSk7XG4gIHJldHVybiBfaW50ZXJuLmhhcyhrZXkpID8gX2ludGVybi5nZXQoa2V5KSA6IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBpbnRlcm5fc2V0KHtfaW50ZXJuLCBfa2V5fSwgdmFsdWUpIHtcbiAgY29uc3Qga2V5ID0gX2tleSh2YWx1ZSk7XG4gIGlmIChfaW50ZXJuLmhhcyhrZXkpKSByZXR1cm4gX2ludGVybi5nZXQoa2V5KTtcbiAgX2ludGVybi5zZXQoa2V5LCB2YWx1ZSk7XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gaW50ZXJuX2RlbGV0ZSh7X2ludGVybiwgX2tleX0sIHZhbHVlKSB7XG4gIGNvbnN0IGtleSA9IF9rZXkodmFsdWUpO1xuICBpZiAoX2ludGVybi5oYXMoa2V5KSkge1xuICAgIHZhbHVlID0gX2ludGVybi5nZXQoa2V5KTtcbiAgICBfaW50ZXJuLmRlbGV0ZShrZXkpO1xuICB9XG4gIHJldHVybiB2YWx1ZTtcbn1cblxuZnVuY3Rpb24ga2V5b2YodmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiA/IHZhbHVlLnZhbHVlT2YoKSA6IHZhbHVlO1xufVxuIiwiY29uc3QgZTEwID0gTWF0aC5zcXJ0KDUwKSxcbiAgICBlNSA9IE1hdGguc3FydCgxMCksXG4gICAgZTIgPSBNYXRoLnNxcnQoMik7XG5cbmZ1bmN0aW9uIHRpY2tTcGVjKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBjb25zdCBzdGVwID0gKHN0b3AgLSBzdGFydCkgLyBNYXRoLm1heCgwLCBjb3VudCksXG4gICAgICBwb3dlciA9IE1hdGguZmxvb3IoTWF0aC5sb2cxMChzdGVwKSksXG4gICAgICBlcnJvciA9IHN0ZXAgLyBNYXRoLnBvdygxMCwgcG93ZXIpLFxuICAgICAgZmFjdG9yID0gZXJyb3IgPj0gZTEwID8gMTAgOiBlcnJvciA+PSBlNSA/IDUgOiBlcnJvciA+PSBlMiA/IDIgOiAxO1xuICBsZXQgaTEsIGkyLCBpbmM7XG4gIGlmIChwb3dlciA8IDApIHtcbiAgICBpbmMgPSBNYXRoLnBvdygxMCwgLXBvd2VyKSAvIGZhY3RvcjtcbiAgICBpMSA9IE1hdGgucm91bmQoc3RhcnQgKiBpbmMpO1xuICAgIGkyID0gTWF0aC5yb3VuZChzdG9wICogaW5jKTtcbiAgICBpZiAoaTEgLyBpbmMgPCBzdGFydCkgKytpMTtcbiAgICBpZiAoaTIgLyBpbmMgPiBzdG9wKSAtLWkyO1xuICAgIGluYyA9IC1pbmM7XG4gIH0gZWxzZSB7XG4gICAgaW5jID0gTWF0aC5wb3coMTAsIHBvd2VyKSAqIGZhY3RvcjtcbiAgICBpMSA9IE1hdGgucm91bmQoc3RhcnQgLyBpbmMpO1xuICAgIGkyID0gTWF0aC5yb3VuZChzdG9wIC8gaW5jKTtcbiAgICBpZiAoaTEgKiBpbmMgPCBzdGFydCkgKytpMTtcbiAgICBpZiAoaTIgKiBpbmMgPiBzdG9wKSAtLWkyO1xuICB9XG4gIGlmIChpMiA8IGkxICYmIDAuNSA8PSBjb3VudCAmJiBjb3VudCA8IDIpIHJldHVybiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQgKiAyKTtcbiAgcmV0dXJuIFtpMSwgaTIsIGluY107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRpY2tzKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgaWYgKCEoY291bnQgPiAwKSkgcmV0dXJuIFtdO1xuICBpZiAoc3RhcnQgPT09IHN0b3ApIHJldHVybiBbc3RhcnRdO1xuICBjb25zdCByZXZlcnNlID0gc3RvcCA8IHN0YXJ0LCBbaTEsIGkyLCBpbmNdID0gcmV2ZXJzZSA/IHRpY2tTcGVjKHN0b3AsIHN0YXJ0LCBjb3VudCkgOiB0aWNrU3BlYyhzdGFydCwgc3RvcCwgY291bnQpO1xuICBpZiAoIShpMiA+PSBpMSkpIHJldHVybiBbXTtcbiAgY29uc3QgbiA9IGkyIC0gaTEgKyAxLCB0aWNrcyA9IG5ldyBBcnJheShuKTtcbiAgaWYgKHJldmVyc2UpIHtcbiAgICBpZiAoaW5jIDwgMCkgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHRpY2tzW2ldID0gKGkyIC0gaSkgLyAtaW5jO1xuICAgIGVsc2UgZm9yIChsZXQgaSA9IDA7IGkgPCBuOyArK2kpIHRpY2tzW2ldID0gKGkyIC0gaSkgKiBpbmM7XG4gIH0gZWxzZSB7XG4gICAgaWYgKGluYyA8IDApIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMSArIGkpIC8gLWluYztcbiAgICBlbHNlIGZvciAobGV0IGkgPSAwOyBpIDwgbjsgKytpKSB0aWNrc1tpXSA9IChpMSArIGkpICogaW5jO1xuICB9XG4gIHJldHVybiB0aWNrcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tJbmNyZW1lbnQoc3RhcnQsIHN0b3AsIGNvdW50KSB7XG4gIHN0b3AgPSArc3RvcCwgc3RhcnQgPSArc3RhcnQsIGNvdW50ID0gK2NvdW50O1xuICByZXR1cm4gdGlja1NwZWMoc3RhcnQsIHN0b3AsIGNvdW50KVsyXTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpY2tTdGVwKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICBzdG9wID0gK3N0b3AsIHN0YXJ0ID0gK3N0YXJ0LCBjb3VudCA9ICtjb3VudDtcbiAgY29uc3QgcmV2ZXJzZSA9IHN0b3AgPCBzdGFydCwgaW5jID0gcmV2ZXJzZSA/IHRpY2tJbmNyZW1lbnQoc3RvcCwgc3RhcnQsIGNvdW50KSA6IHRpY2tJbmNyZW1lbnQoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgcmV0dXJuIChyZXZlcnNlID8gLTEgOiAxKSAqIChpbmMgPCAwID8gMSAvIC1pbmMgOiBpbmMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gcmFuZ2Uoc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgc3RhcnQgPSArc3RhcnQsIHN0b3AgPSArc3RvcCwgc3RlcCA9IChuID0gYXJndW1lbnRzLmxlbmd0aCkgPCAyID8gKHN0b3AgPSBzdGFydCwgc3RhcnQgPSAwLCAxKSA6IG4gPCAzID8gMSA6ICtzdGVwO1xuXG4gIHZhciBpID0gLTEsXG4gICAgICBuID0gTWF0aC5tYXgoMCwgTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCkpIHwgMCxcbiAgICAgIHJhbmdlID0gbmV3IEFycmF5KG4pO1xuXG4gIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgcmFuZ2VbaV0gPSBzdGFydCArIGkgKiBzdGVwO1xuICB9XG5cbiAgcmV0dXJuIHJhbmdlO1xufVxuIiwidmFyIG5vb3AgPSB7dmFsdWU6ICgpID0+IHt9fTtcblxuZnVuY3Rpb24gZGlzcGF0Y2goKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gYXJndW1lbnRzLmxlbmd0aCwgXyA9IHt9LCB0OyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKCEodCA9IGFyZ3VtZW50c1tpXSArIFwiXCIpIHx8ICh0IGluIF8pIHx8IC9bXFxzLl0vLnRlc3QodCkpIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgdHlwZTogXCIgKyB0KTtcbiAgICBfW3RdID0gW107XG4gIH1cbiAgcmV0dXJuIG5ldyBEaXNwYXRjaChfKTtcbn1cblxuZnVuY3Rpb24gRGlzcGF0Y2goXykge1xuICB0aGlzLl8gPSBfO1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMsIHR5cGVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICBpZiAodCAmJiAhdHlwZXMuaGFzT3duUHJvcGVydHkodCkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0KTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuRGlzcGF0Y2gucHJvdG90eXBlID0gZGlzcGF0Y2gucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRGlzcGF0Y2gsXG4gIG9uOiBmdW5jdGlvbih0eXBlbmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgXyA9IHRoaXMuXyxcbiAgICAgICAgVCA9IHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lICsgXCJcIiwgXyksXG4gICAgICAgIHQsXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IFQubGVuZ3RoO1xuXG4gICAgLy8gSWYgbm8gY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmV0dXJuIHRoZSBjYWxsYmFjayBvZiB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSAmJiAodCA9IGdldChfW3RdLCB0eXBlbmFtZS5uYW1lKSkpIHJldHVybiB0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIGEgdHlwZSB3YXMgc3BlY2lmaWVkLCBzZXQgdGhlIGNhbGxiYWNrIGZvciB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICAvLyBPdGhlcndpc2UsIGlmIGEgbnVsbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZW1vdmUgY2FsbGJhY2tzIG9mIHRoZSBnaXZlbiBuYW1lLlxuICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIGVsc2UgaWYgKGNhbGxiYWNrID09IG51bGwpIGZvciAodCBpbiBfKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBjb3B5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29weSA9IHt9LCBfID0gdGhpcy5fO1xuICAgIGZvciAodmFyIHQgaW4gXykgY29weVt0XSA9IF9bdF0uc2xpY2UoKTtcbiAgICByZXR1cm4gbmV3IERpc3BhdGNoKGNvcHkpO1xuICB9LFxuICBjYWxsOiBmdW5jdGlvbih0eXBlLCB0aGF0KSB7XG4gICAgaWYgKChuID0gYXJndW1lbnRzLmxlbmd0aCAtIDIpID4gMCkgZm9yICh2YXIgYXJncyA9IG5ldyBBcnJheShuKSwgaSA9IDAsIG4sIHQ7IGkgPCBuOyArK2kpIGFyZ3NbaV0gPSBhcmd1bWVudHNbaSArIDJdO1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9LFxuICBhcHBseTogZnVuY3Rpb24odHlwZSwgdGhhdCwgYXJncykge1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh2YXIgdCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0KHR5cGUsIG5hbWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aCwgYzsgaSA8IG47ICsraSkge1xuICAgIGlmICgoYyA9IHR5cGVbaV0pLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzZXQodHlwZSwgbmFtZSwgY2FsbGJhY2spIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIGlmICh0eXBlW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHR5cGVbaV0gPSBub29wLCB0eXBlID0gdHlwZS5zbGljZSgwLCBpKS5jb25jYXQodHlwZS5zbGljZShpICsgMSkpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB0eXBlLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiBjYWxsYmFja30pO1xuICByZXR1cm4gdHlwZTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGlzcGF0Y2g7XG4iLCJleHBvcnQgdmFyIHhodG1sID0gXCJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hodG1sXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgc3ZnOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsXG4gIHhodG1sOiB4aHRtbCxcbiAgeGxpbms6IFwiaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGlua1wiLFxuICB4bWw6IFwiaHR0cDovL3d3dy53My5vcmcvWE1MLzE5OTgvbmFtZXNwYWNlXCIsXG4gIHhtbG5zOiBcImh0dHA6Ly93d3cudzMub3JnLzIwMDAveG1sbnMvXCJcbn07XG4iLCJpbXBvcnQgbmFtZXNwYWNlcyBmcm9tIFwiLi9uYW1lc3BhY2VzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIHByZWZpeCA9IG5hbWUgKz0gXCJcIiwgaSA9IHByZWZpeC5pbmRleE9mKFwiOlwiKTtcbiAgaWYgKGkgPj0gMCAmJiAocHJlZml4ID0gbmFtZS5zbGljZSgwLCBpKSkgIT09IFwieG1sbnNcIikgbmFtZSA9IG5hbWUuc2xpY2UoaSArIDEpO1xuICByZXR1cm4gbmFtZXNwYWNlcy5oYXNPd25Qcm9wZXJ0eShwcmVmaXgpID8ge3NwYWNlOiBuYW1lc3BhY2VzW3ByZWZpeF0sIGxvY2FsOiBuYW1lfSA6IG5hbWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tcHJvdG90eXBlLWJ1aWx0aW5zXG59XG4iLCJpbXBvcnQgbmFtZXNwYWNlIGZyb20gXCIuL25hbWVzcGFjZS5qc1wiO1xuaW1wb3J0IHt4aHRtbH0gZnJvbSBcIi4vbmFtZXNwYWNlcy5qc1wiO1xuXG5mdW5jdGlvbiBjcmVhdG9ySW5oZXJpdChuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZG9jdW1lbnQgPSB0aGlzLm93bmVyRG9jdW1lbnQsXG4gICAgICAgIHVyaSA9IHRoaXMubmFtZXNwYWNlVVJJO1xuICAgIHJldHVybiB1cmkgPT09IHhodG1sICYmIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5uYW1lc3BhY2VVUkkgPT09IHhodG1sXG4gICAgICAgID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChuYW1lKVxuICAgICAgICA6IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyh1cmksIG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBjcmVhdG9yRml4ZWQoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudE5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpO1xuICByZXR1cm4gKGZ1bGxuYW1lLmxvY2FsXG4gICAgICA/IGNyZWF0b3JGaXhlZFxuICAgICAgOiBjcmVhdG9ySW5oZXJpdCkoZnVsbG5hbWUpO1xufVxuIiwiZnVuY3Rpb24gbm9uZSgpIHt9XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBzZWxlY3RvciA9PSBudWxsID8gbm9uZSA6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpO1xuICB9O1xufVxuIiwiaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2VsZWN0b3IgZnJvbSBcIi4uL3NlbGVjdG9yLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICBpZiAodHlwZW9mIHNlbGVjdCAhPT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBzZWxlY3RvcihzZWxlY3QpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIHN1Ym5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKHN1Ym5vZGUgPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCkpKSB7XG4gICAgICAgIGlmIChcIl9fZGF0YV9fXCIgaW4gbm9kZSkgc3Vibm9kZS5fX2RhdGFfXyA9IG5vZGUuX19kYXRhX187XG4gICAgICAgIHN1Ymdyb3VwW2ldID0gc3Vibm9kZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFNlbGVjdGlvbihzdWJncm91cHMsIHRoaXMuX3BhcmVudHMpO1xufVxuIiwiLy8gR2l2ZW4gc29tZXRoaW5nIGFycmF5IGxpa2UgKG9yIG51bGwpLCByZXR1cm5zIHNvbWV0aGluZyB0aGF0IGlzIHN0cmljdGx5IGFuXG4vLyBhcnJheS4gVGhpcyBpcyB1c2VkIHRvIGVuc3VyZSB0aGF0IGFycmF5LWxpa2Ugb2JqZWN0cyBwYXNzZWQgdG8gZDMuc2VsZWN0QWxsXG4vLyBvciBzZWxlY3Rpb24uc2VsZWN0QWxsIGFyZSBjb252ZXJ0ZWQgaW50byBwcm9wZXIgYXJyYXlzIHdoZW4gY3JlYXRpbmcgYVxuLy8gc2VsZWN0aW9uOyB3ZSBkb27igJl0IGV2ZXIgd2FudCB0byBjcmVhdGUgYSBzZWxlY3Rpb24gYmFja2VkIGJ5IGEgbGl2ZVxuLy8gSFRNTENvbGxlY3Rpb24gb3IgTm9kZUxpc3QuIEhvd2V2ZXIsIG5vdGUgdGhhdCBzZWxlY3Rpb24uc2VsZWN0QWxsIHdpbGwgdXNlIGFcbi8vIHN0YXRpYyBOb2RlTGlzdCBhcyBhIGdyb3VwLCBzaW5jZSBpdCBzYWZlbHkgZGVyaXZlZCBmcm9tIHF1ZXJ5U2VsZWN0b3JBbGwuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBhcnJheSh4KSB7XG4gIHJldHVybiB4ID09IG51bGwgPyBbXSA6IEFycmF5LmlzQXJyYXkoeCkgPyB4IDogQXJyYXkuZnJvbSh4KTtcbn1cbiIsImZ1bmN0aW9uIGVtcHR5KCkge1xuICByZXR1cm4gW107XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdG9yKSB7XG4gIHJldHVybiBzZWxlY3RvciA9PSBudWxsID8gZW1wdHkgOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5xdWVyeVNlbGVjdG9yQWxsKHNlbGVjdG9yKTtcbiAgfTtcbn1cbiIsImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IGFycmF5IGZyb20gXCIuLi9hcnJheS5qc1wiO1xuaW1wb3J0IHNlbGVjdG9yQWxsIGZyb20gXCIuLi9zZWxlY3RvckFsbC5qc1wiO1xuXG5mdW5jdGlvbiBhcnJheUFsbChzZWxlY3QpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBhcnJheShzZWxlY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICBpZiAodHlwZW9mIHNlbGVjdCA9PT0gXCJmdW5jdGlvblwiKSBzZWxlY3QgPSBhcnJheUFsbChzZWxlY3QpO1xuICBlbHNlIHNlbGVjdCA9IHNlbGVjdG9yQWxsKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gW10sIHBhcmVudHMgPSBbXSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgc3ViZ3JvdXBzLnB1c2goc2VsZWN0LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKTtcbiAgICAgICAgcGFyZW50cy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHN1Ymdyb3VwcywgcGFyZW50cyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihzZWxlY3Rvcikge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMubWF0Y2hlcyhzZWxlY3Rvcik7XG4gIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGlsZE1hdGNoZXIoc2VsZWN0b3IpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKG5vZGUpIHtcbiAgICByZXR1cm4gbm9kZS5tYXRjaGVzKHNlbGVjdG9yKTtcbiAgfTtcbn1cblxuIiwiaW1wb3J0IHtjaGlsZE1hdGNoZXJ9IGZyb20gXCIuLi9tYXRjaGVyLmpzXCI7XG5cbnZhciBmaW5kID0gQXJyYXkucHJvdG90eXBlLmZpbmQ7XG5cbmZ1bmN0aW9uIGNoaWxkRmluZChtYXRjaCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZpbmQuY2FsbCh0aGlzLmNoaWxkcmVuLCBtYXRjaCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGNoaWxkRmlyc3QoKSB7XG4gIHJldHVybiB0aGlzLmZpcnN0RWxlbWVudENoaWxkO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICByZXR1cm4gdGhpcy5zZWxlY3QobWF0Y2ggPT0gbnVsbCA/IGNoaWxkRmlyc3RcbiAgICAgIDogY2hpbGRGaW5kKHR5cGVvZiBtYXRjaCA9PT0gXCJmdW5jdGlvblwiID8gbWF0Y2ggOiBjaGlsZE1hdGNoZXIobWF0Y2gpKSk7XG59XG4iLCJpbXBvcnQge2NoaWxkTWF0Y2hlcn0gZnJvbSBcIi4uL21hdGNoZXIuanNcIjtcblxudmFyIGZpbHRlciA9IEFycmF5LnByb3RvdHlwZS5maWx0ZXI7XG5cbmZ1bmN0aW9uIGNoaWxkcmVuKCkge1xuICByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLmNoaWxkcmVuKTtcbn1cblxuZnVuY3Rpb24gY2hpbGRyZW5GaWx0ZXIobWF0Y2gpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBmaWx0ZXIuY2FsbCh0aGlzLmNoaWxkcmVuLCBtYXRjaCk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG1hdGNoKSB7XG4gIHJldHVybiB0aGlzLnNlbGVjdEFsbChtYXRjaCA9PSBudWxsID8gY2hpbGRyZW5cbiAgICAgIDogY2hpbGRyZW5GaWx0ZXIodHlwZW9mIG1hdGNoID09PSBcImZ1bmN0aW9uXCIgPyBtYXRjaCA6IGNoaWxkTWF0Y2hlcihtYXRjaCkpKTtcbn1cbiIsImltcG9ydCB7U2VsZWN0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuaW1wb3J0IG1hdGNoZXIgZnJvbSBcIi4uL21hdGNoZXIuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obWF0Y2gpIHtcbiAgaWYgKHR5cGVvZiBtYXRjaCAhPT0gXCJmdW5jdGlvblwiKSBtYXRjaCA9IG1hdGNoZXIobWF0Y2gpO1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHN1Ymdyb3VwcyA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgc3ViZ3JvdXAgPSBzdWJncm91cHNbal0gPSBbXSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiBtYXRjaC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkge1xuICAgICAgICBzdWJncm91cC5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih1cGRhdGUpIHtcbiAgcmV0dXJuIG5ldyBBcnJheSh1cGRhdGUubGVuZ3RoKTtcbn1cbiIsImltcG9ydCBzcGFyc2UgZnJvbSBcIi4vc3BhcnNlLmpzXCI7XG5pbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHRoaXMuX2VudGVyIHx8IHRoaXMuX2dyb3Vwcy5tYXAoc3BhcnNlKSwgdGhpcy5fcGFyZW50cyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBFbnRlck5vZGUocGFyZW50LCBkYXR1bSkge1xuICB0aGlzLm93bmVyRG9jdW1lbnQgPSBwYXJlbnQub3duZXJEb2N1bWVudDtcbiAgdGhpcy5uYW1lc3BhY2VVUkkgPSBwYXJlbnQubmFtZXNwYWNlVVJJO1xuICB0aGlzLl9uZXh0ID0gbnVsbDtcbiAgdGhpcy5fcGFyZW50ID0gcGFyZW50O1xuICB0aGlzLl9fZGF0YV9fID0gZGF0dW07XG59XG5cbkVudGVyTm9kZS5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBFbnRlck5vZGUsXG4gIGFwcGVuZENoaWxkOiBmdW5jdGlvbihjaGlsZCkgeyByZXR1cm4gdGhpcy5fcGFyZW50Lmluc2VydEJlZm9yZShjaGlsZCwgdGhpcy5fbmV4dCk7IH0sXG4gIGluc2VydEJlZm9yZTogZnVuY3Rpb24oY2hpbGQsIG5leHQpIHsgcmV0dXJuIHRoaXMuX3BhcmVudC5pbnNlcnRCZWZvcmUoY2hpbGQsIG5leHQpOyB9LFxuICBxdWVyeVNlbGVjdG9yOiBmdW5jdGlvbihzZWxlY3RvcikgeyByZXR1cm4gdGhpcy5fcGFyZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpOyB9LFxuICBxdWVyeVNlbGVjdG9yQWxsOiBmdW5jdGlvbihzZWxlY3RvcikgeyByZXR1cm4gdGhpcy5fcGFyZW50LnF1ZXJ5U2VsZWN0b3JBbGwoc2VsZWN0b3IpOyB9XG59O1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oeCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCB7RW50ZXJOb2RlfSBmcm9tIFwiLi9lbnRlci5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuLi9jb25zdGFudC5qc1wiO1xuXG5mdW5jdGlvbiBiaW5kSW5kZXgocGFyZW50LCBncm91cCwgZW50ZXIsIHVwZGF0ZSwgZXhpdCwgZGF0YSkge1xuICB2YXIgaSA9IDAsXG4gICAgICBub2RlLFxuICAgICAgZ3JvdXBMZW5ndGggPSBncm91cC5sZW5ndGgsXG4gICAgICBkYXRhTGVuZ3RoID0gZGF0YS5sZW5ndGg7XG5cbiAgLy8gUHV0IGFueSBub24tbnVsbCBub2RlcyB0aGF0IGZpdCBpbnRvIHVwZGF0ZS5cbiAgLy8gUHV0IGFueSBudWxsIG5vZGVzIGludG8gZW50ZXIuXG4gIC8vIFB1dCBhbnkgcmVtYWluaW5nIGRhdGEgaW50byBlbnRlci5cbiAgZm9yICg7IGkgPCBkYXRhTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICBub2RlLl9fZGF0YV9fID0gZGF0YVtpXTtcbiAgICAgIHVwZGF0ZVtpXSA9IG5vZGU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVudGVyW2ldID0gbmV3IEVudGVyTm9kZShwYXJlbnQsIGRhdGFbaV0pO1xuICAgIH1cbiAgfVxuXG4gIC8vIFB1dCBhbnkgbm9uLW51bGwgbm9kZXMgdGhhdCBkb27igJl0IGZpdCBpbnRvIGV4aXQuXG4gIGZvciAoOyBpIDwgZ3JvdXBMZW5ndGg7ICsraSkge1xuICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBiaW5kS2V5KHBhcmVudCwgZ3JvdXAsIGVudGVyLCB1cGRhdGUsIGV4aXQsIGRhdGEsIGtleSkge1xuICB2YXIgaSxcbiAgICAgIG5vZGUsXG4gICAgICBub2RlQnlLZXlWYWx1ZSA9IG5ldyBNYXAsXG4gICAgICBncm91cExlbmd0aCA9IGdyb3VwLmxlbmd0aCxcbiAgICAgIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aCxcbiAgICAgIGtleVZhbHVlcyA9IG5ldyBBcnJheShncm91cExlbmd0aCksXG4gICAgICBrZXlWYWx1ZTtcblxuICAvLyBDb21wdXRlIHRoZSBrZXkgZm9yIGVhY2ggbm9kZS5cbiAgLy8gSWYgbXVsdGlwbGUgbm9kZXMgaGF2ZSB0aGUgc2FtZSBrZXksIHRoZSBkdXBsaWNhdGVzIGFyZSBhZGRlZCB0byBleGl0LlxuICBmb3IgKGkgPSAwOyBpIDwgZ3JvdXBMZW5ndGg7ICsraSkge1xuICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgIGtleVZhbHVlc1tpXSA9IGtleVZhbHVlID0ga2V5LmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApICsgXCJcIjtcbiAgICAgIGlmIChub2RlQnlLZXlWYWx1ZS5oYXMoa2V5VmFsdWUpKSB7XG4gICAgICAgIGV4aXRbaV0gPSBub2RlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9kZUJ5S2V5VmFsdWUuc2V0KGtleVZhbHVlLCBub2RlKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBDb21wdXRlIHRoZSBrZXkgZm9yIGVhY2ggZGF0dW0uXG4gIC8vIElmIHRoZXJlIGEgbm9kZSBhc3NvY2lhdGVkIHdpdGggdGhpcyBrZXksIGpvaW4gYW5kIGFkZCBpdCB0byB1cGRhdGUuXG4gIC8vIElmIHRoZXJlIGlzIG5vdCAob3IgdGhlIGtleSBpcyBhIGR1cGxpY2F0ZSksIGFkZCBpdCB0byBlbnRlci5cbiAgZm9yIChpID0gMDsgaSA8IGRhdGFMZW5ndGg7ICsraSkge1xuICAgIGtleVZhbHVlID0ga2V5LmNhbGwocGFyZW50LCBkYXRhW2ldLCBpLCBkYXRhKSArIFwiXCI7XG4gICAgaWYgKG5vZGUgPSBub2RlQnlLZXlWYWx1ZS5nZXQoa2V5VmFsdWUpKSB7XG4gICAgICB1cGRhdGVbaV0gPSBub2RlO1xuICAgICAgbm9kZS5fX2RhdGFfXyA9IGRhdGFbaV07XG4gICAgICBub2RlQnlLZXlWYWx1ZS5kZWxldGUoa2V5VmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbnRlcltpXSA9IG5ldyBFbnRlck5vZGUocGFyZW50LCBkYXRhW2ldKTtcbiAgICB9XG4gIH1cblxuICAvLyBBZGQgYW55IHJlbWFpbmluZyBub2RlcyB0aGF0IHdlcmUgbm90IGJvdW5kIHRvIGRhdGEgdG8gZXhpdC5cbiAgZm9yIChpID0gMDsgaSA8IGdyb3VwTGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKG5vZGUgPSBncm91cFtpXSkgJiYgKG5vZGVCeUtleVZhbHVlLmdldChrZXlWYWx1ZXNbaV0pID09PSBub2RlKSkge1xuICAgICAgZXhpdFtpXSA9IG5vZGU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIGRhdHVtKG5vZGUpIHtcbiAgcmV0dXJuIG5vZGUuX19kYXRhX187XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gQXJyYXkuZnJvbSh0aGlzLCBkYXR1bSk7XG5cbiAgdmFyIGJpbmQgPSBrZXkgPyBiaW5kS2V5IDogYmluZEluZGV4LFxuICAgICAgcGFyZW50cyA9IHRoaXMuX3BhcmVudHMsXG4gICAgICBncm91cHMgPSB0aGlzLl9ncm91cHM7XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB2YWx1ZSA9IGNvbnN0YW50KHZhbHVlKTtcblxuICBmb3IgKHZhciBtID0gZ3JvdXBzLmxlbmd0aCwgdXBkYXRlID0gbmV3IEFycmF5KG0pLCBlbnRlciA9IG5ldyBBcnJheShtKSwgZXhpdCA9IG5ldyBBcnJheShtKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICB2YXIgcGFyZW50ID0gcGFyZW50c1tqXSxcbiAgICAgICAgZ3JvdXAgPSBncm91cHNbal0sXG4gICAgICAgIGdyb3VwTGVuZ3RoID0gZ3JvdXAubGVuZ3RoLFxuICAgICAgICBkYXRhID0gYXJyYXlsaWtlKHZhbHVlLmNhbGwocGFyZW50LCBwYXJlbnQgJiYgcGFyZW50Ll9fZGF0YV9fLCBqLCBwYXJlbnRzKSksXG4gICAgICAgIGRhdGFMZW5ndGggPSBkYXRhLmxlbmd0aCxcbiAgICAgICAgZW50ZXJHcm91cCA9IGVudGVyW2pdID0gbmV3IEFycmF5KGRhdGFMZW5ndGgpLFxuICAgICAgICB1cGRhdGVHcm91cCA9IHVwZGF0ZVtqXSA9IG5ldyBBcnJheShkYXRhTGVuZ3RoKSxcbiAgICAgICAgZXhpdEdyb3VwID0gZXhpdFtqXSA9IG5ldyBBcnJheShncm91cExlbmd0aCk7XG5cbiAgICBiaW5kKHBhcmVudCwgZ3JvdXAsIGVudGVyR3JvdXAsIHVwZGF0ZUdyb3VwLCBleGl0R3JvdXAsIGRhdGEsIGtleSk7XG5cbiAgICAvLyBOb3cgY29ubmVjdCB0aGUgZW50ZXIgbm9kZXMgdG8gdGhlaXIgZm9sbG93aW5nIHVwZGF0ZSBub2RlLCBzdWNoIHRoYXRcbiAgICAvLyBhcHBlbmRDaGlsZCBjYW4gaW5zZXJ0IHRoZSBtYXRlcmlhbGl6ZWQgZW50ZXIgbm9kZSBiZWZvcmUgdGhpcyBub2RlLFxuICAgIC8vIHJhdGhlciB0aGFuIGF0IHRoZSBlbmQgb2YgdGhlIHBhcmVudCBub2RlLlxuICAgIGZvciAodmFyIGkwID0gMCwgaTEgPSAwLCBwcmV2aW91cywgbmV4dDsgaTAgPCBkYXRhTGVuZ3RoOyArK2kwKSB7XG4gICAgICBpZiAocHJldmlvdXMgPSBlbnRlckdyb3VwW2kwXSkge1xuICAgICAgICBpZiAoaTAgPj0gaTEpIGkxID0gaTAgKyAxO1xuICAgICAgICB3aGlsZSAoIShuZXh0ID0gdXBkYXRlR3JvdXBbaTFdKSAmJiArK2kxIDwgZGF0YUxlbmd0aCk7XG4gICAgICAgIHByZXZpb3VzLl9uZXh0ID0gbmV4dCB8fCBudWxsO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHVwZGF0ZSA9IG5ldyBTZWxlY3Rpb24odXBkYXRlLCBwYXJlbnRzKTtcbiAgdXBkYXRlLl9lbnRlciA9IGVudGVyO1xuICB1cGRhdGUuX2V4aXQgPSBleGl0O1xuICByZXR1cm4gdXBkYXRlO1xufVxuXG4vLyBHaXZlbiBzb21lIGRhdGEsIHRoaXMgcmV0dXJucyBhbiBhcnJheS1saWtlIHZpZXcgb2YgaXQ6IGFuIG9iamVjdCB0aGF0XG4vLyBleHBvc2VzIGEgbGVuZ3RoIHByb3BlcnR5IGFuZCBhbGxvd3MgbnVtZXJpYyBpbmRleGluZy4gTm90ZSB0aGF0IHVubGlrZVxuLy8gc2VsZWN0QWxsLCB0aGlzIGlzbuKAmXQgd29ycmllZCBhYm91dCDigJxsaXZl4oCdIGNvbGxlY3Rpb25zIGJlY2F1c2UgdGhlIHJlc3VsdGluZ1xuLy8gYXJyYXkgd2lsbCBvbmx5IGJlIHVzZWQgYnJpZWZseSB3aGlsZSBkYXRhIGlzIGJlaW5nIGJvdW5kLiAoSXQgaXMgcG9zc2libGUgdG9cbi8vIGNhdXNlIHRoZSBkYXRhIHRvIGNoYW5nZSB3aGlsZSBpdGVyYXRpbmcgYnkgdXNpbmcgYSBrZXkgZnVuY3Rpb24sIGJ1dCBwbGVhc2Vcbi8vIGRvbuKAmXQ7IHdl4oCZZCByYXRoZXIgYXZvaWQgYSBncmF0dWl0b3VzIGNvcHkuKVxuZnVuY3Rpb24gYXJyYXlsaWtlKGRhdGEpIHtcbiAgcmV0dXJuIHR5cGVvZiBkYXRhID09PSBcIm9iamVjdFwiICYmIFwibGVuZ3RoXCIgaW4gZGF0YVxuICAgID8gZGF0YSAvLyBBcnJheSwgVHlwZWRBcnJheSwgTm9kZUxpc3QsIGFycmF5LWxpa2VcbiAgICA6IEFycmF5LmZyb20oZGF0YSk7IC8vIE1hcCwgU2V0LCBpdGVyYWJsZSwgc3RyaW5nLCBvciBhbnl0aGluZyBlbHNlXG59XG4iLCJpbXBvcnQgc3BhcnNlIGZyb20gXCIuL3NwYXJzZS5qc1wiO1xuaW1wb3J0IHtTZWxlY3Rpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbih0aGlzLl9leGl0IHx8IHRoaXMuX2dyb3Vwcy5tYXAoc3BhcnNlKSwgdGhpcy5fcGFyZW50cyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihvbmVudGVyLCBvbnVwZGF0ZSwgb25leGl0KSB7XG4gIHZhciBlbnRlciA9IHRoaXMuZW50ZXIoKSwgdXBkYXRlID0gdGhpcywgZXhpdCA9IHRoaXMuZXhpdCgpO1xuICBpZiAodHlwZW9mIG9uZW50ZXIgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGVudGVyID0gb25lbnRlcihlbnRlcik7XG4gICAgaWYgKGVudGVyKSBlbnRlciA9IGVudGVyLnNlbGVjdGlvbigpO1xuICB9IGVsc2Uge1xuICAgIGVudGVyID0gZW50ZXIuYXBwZW5kKG9uZW50ZXIgKyBcIlwiKTtcbiAgfVxuICBpZiAob251cGRhdGUgIT0gbnVsbCkge1xuICAgIHVwZGF0ZSA9IG9udXBkYXRlKHVwZGF0ZSk7XG4gICAgaWYgKHVwZGF0ZSkgdXBkYXRlID0gdXBkYXRlLnNlbGVjdGlvbigpO1xuICB9XG4gIGlmIChvbmV4aXQgPT0gbnVsbCkgZXhpdC5yZW1vdmUoKTsgZWxzZSBvbmV4aXQoZXhpdCk7XG4gIHJldHVybiBlbnRlciAmJiB1cGRhdGUgPyBlbnRlci5tZXJnZSh1cGRhdGUpLm9yZGVyKCkgOiB1cGRhdGU7XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29udGV4dCkge1xuICB2YXIgc2VsZWN0aW9uID0gY29udGV4dC5zZWxlY3Rpb24gPyBjb250ZXh0LnNlbGVjdGlvbigpIDogY29udGV4dDtcblxuICBmb3IgKHZhciBncm91cHMwID0gdGhpcy5fZ3JvdXBzLCBncm91cHMxID0gc2VsZWN0aW9uLl9ncm91cHMsIG0wID0gZ3JvdXBzMC5sZW5ndGgsIG0xID0gZ3JvdXBzMS5sZW5ndGgsIG0gPSBNYXRoLm1pbihtMCwgbTEpLCBtZXJnZXMgPSBuZXcgQXJyYXkobTApLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwMCA9IGdyb3VwczBbal0sIGdyb3VwMSA9IGdyb3VwczFbal0sIG4gPSBncm91cDAubGVuZ3RoLCBtZXJnZSA9IG1lcmdlc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXAwW2ldIHx8IGdyb3VwMVtpXSkge1xuICAgICAgICBtZXJnZVtpXSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgZm9yICg7IGogPCBtMDsgKytqKSB7XG4gICAgbWVyZ2VzW2pdID0gZ3JvdXBzMFtqXTtcbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKG1lcmdlcywgdGhpcy5fcGFyZW50cyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIGogPSAtMSwgbSA9IGdyb3Vwcy5sZW5ndGg7ICsraiA8IG07KSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSBncm91cC5sZW5ndGggLSAxLCBuZXh0ID0gZ3JvdXBbaV0sIG5vZGU7IC0taSA+PSAwOykge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBpZiAobmV4dCAmJiBub2RlLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKG5leHQpIF4gNCkgbmV4dC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShub2RlLCBuZXh0KTtcbiAgICAgICAgbmV4dCA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQge1NlbGVjdGlvbn0gZnJvbSBcIi4vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oY29tcGFyZSkge1xuICBpZiAoIWNvbXBhcmUpIGNvbXBhcmUgPSBhc2NlbmRpbmc7XG5cbiAgZnVuY3Rpb24gY29tcGFyZU5vZGUoYSwgYikge1xuICAgIHJldHVybiBhICYmIGIgPyBjb21wYXJlKGEuX19kYXRhX18sIGIuX19kYXRhX18pIDogIWEgLSAhYjtcbiAgfVxuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgbSA9IGdyb3Vwcy5sZW5ndGgsIHNvcnRncm91cHMgPSBuZXcgQXJyYXkobSksIGogPSAwOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIG4gPSBncm91cC5sZW5ndGgsIHNvcnRncm91cCA9IHNvcnRncm91cHNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSB7XG4gICAgICAgIHNvcnRncm91cFtpXSA9IG5vZGU7XG4gICAgICB9XG4gICAgfVxuICAgIHNvcnRncm91cC5zb3J0KGNvbXBhcmVOb2RlKTtcbiAgfVxuXG4gIHJldHVybiBuZXcgU2VsZWN0aW9uKHNvcnRncm91cHMsIHRoaXMuX3BhcmVudHMpLm9yZGVyKCk7XG59XG5cbmZ1bmN0aW9uIGFzY2VuZGluZyhhLCBiKSB7XG4gIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogYSA+PSBiID8gMCA6IE5hTjtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKCkge1xuICB2YXIgY2FsbGJhY2sgPSBhcmd1bWVudHNbMF07XG4gIGFyZ3VtZW50c1swXSA9IHRoaXM7XG4gIGNhbGxiYWNrLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gIHJldHVybiB0aGlzO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiBBcnJheS5mcm9tKHRoaXMpO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgIHZhciBub2RlID0gZ3JvdXBbaV07XG4gICAgICBpZiAobm9kZSkgcmV0dXJuIG5vZGU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgbGV0IHNpemUgPSAwO1xuICBmb3IgKGNvbnN0IG5vZGUgb2YgdGhpcykgKytzaXplOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXVudXNlZC12YXJzXG4gIHJldHVybiBzaXplO1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiAhdGhpcy5ub2RlKCk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihjYWxsYmFjaykge1xuXG4gIGZvciAodmFyIGdyb3VwcyA9IHRoaXMuX2dyb3VwcywgaiA9IDAsIG0gPSBncm91cHMubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgZm9yICh2YXIgZ3JvdXAgPSBncm91cHNbal0sIGkgPSAwLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwW2ldKSBjYWxsYmFjay5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn1cbiIsImltcG9ydCBuYW1lc3BhY2UgZnJvbSBcIi4uL25hbWVzcGFjZS5qc1wiO1xuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlTlMoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50KG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB2YWx1ZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJDb25zdGFudE5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIHZhbHVlKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgZWxzZSB0aGlzLnNldEF0dHJpYnV0ZShuYW1lLCB2KTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uTlMoZnVsbG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHYgPT0gbnVsbCkgdGhpcy5yZW1vdmVBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIGVsc2UgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIHYpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIG5vZGUgPSB0aGlzLm5vZGUoKTtcbiAgICByZXR1cm4gZnVsbG5hbWUubG9jYWxcbiAgICAgICAgPyBub2RlLmdldEF0dHJpYnV0ZU5TKGZ1bGxuYW1lLnNwYWNlLCBmdWxsbmFtZS5sb2NhbClcbiAgICAgICAgOiBub2RlLmdldEF0dHJpYnV0ZShmdWxsbmFtZSk7XG4gIH1cblxuICByZXR1cm4gdGhpcy5lYWNoKCh2YWx1ZSA9PSBudWxsXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJSZW1vdmVOUyA6IGF0dHJSZW1vdmUpIDogKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJGdW5jdGlvbk5TIDogYXR0ckZ1bmN0aW9uKVxuICAgICAgOiAoZnVsbG5hbWUubG9jYWwgPyBhdHRyQ29uc3RhbnROUyA6IGF0dHJDb25zdGFudCkpKShmdWxsbmFtZSwgdmFsdWUpKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5vZGUpIHtcbiAgcmV0dXJuIChub2RlLm93bmVyRG9jdW1lbnQgJiYgbm9kZS5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3KSAvLyBub2RlIGlzIGEgTm9kZVxuICAgICAgfHwgKG5vZGUuZG9jdW1lbnQgJiYgbm9kZSkgLy8gbm9kZSBpcyBhIFdpbmRvd1xuICAgICAgfHwgbm9kZS5kZWZhdWx0VmlldzsgLy8gbm9kZSBpcyBhIERvY3VtZW50XG59XG4iLCJpbXBvcnQgZGVmYXVsdFZpZXcgZnJvbSBcIi4uL3dpbmRvdy5qc1wiO1xuXG5mdW5jdGlvbiBzdHlsZVJlbW92ZShuYW1lKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUNvbnN0YW50KG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5zdHlsZS5zZXRQcm9wZXJ0eShuYW1lLCB2YWx1ZSwgcHJpb3JpdHkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZUZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gICAgZWxzZSB0aGlzLnN0eWxlLnNldFByb3BlcnR5KG5hbWUsIHYsIHByaW9yaXR5KTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgPyB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgICAgICAgID8gc3R5bGVSZW1vdmUgOiB0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgICAgPyBzdHlsZUZ1bmN0aW9uXG4gICAgICAgICAgICA6IHN0eWxlQ29uc3RhbnQpKG5hbWUsIHZhbHVlLCBwcmlvcml0eSA9PSBudWxsID8gXCJcIiA6IHByaW9yaXR5KSlcbiAgICAgIDogc3R5bGVWYWx1ZSh0aGlzLm5vZGUoKSwgbmFtZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHlsZVZhbHVlKG5vZGUsIG5hbWUpIHtcbiAgcmV0dXJuIG5vZGUuc3R5bGUuZ2V0UHJvcGVydHlWYWx1ZShuYW1lKVxuICAgICAgfHwgZGVmYXVsdFZpZXcobm9kZSkuZ2V0Q29tcHV0ZWRTdHlsZShub2RlLCBudWxsKS5nZXRQcm9wZXJ0eVZhbHVlKG5hbWUpO1xufVxuIiwiZnVuY3Rpb24gcHJvcGVydHlSZW1vdmUobmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgZGVsZXRlIHRoaXNbbmFtZV07XG4gIH07XG59XG5cbmZ1bmN0aW9uIHByb3BlcnR5Q29uc3RhbnQobmFtZSwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXNbbmFtZV0gPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gcHJvcGVydHlGdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHYgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmICh2ID09IG51bGwpIGRlbGV0ZSB0aGlzW25hbWVdO1xuICAgIGVsc2UgdGhpc1tuYW1lXSA9IHY7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID4gMVxuICAgICAgPyB0aGlzLmVhY2goKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IHByb3BlcnR5UmVtb3ZlIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IHByb3BlcnR5RnVuY3Rpb25cbiAgICAgICAgICA6IHByb3BlcnR5Q29uc3RhbnQpKG5hbWUsIHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKClbbmFtZV07XG59XG4iLCJmdW5jdGlvbiBjbGFzc0FycmF5KHN0cmluZykge1xuICByZXR1cm4gc3RyaW5nLnRyaW0oKS5zcGxpdCgvXnxcXHMrLyk7XG59XG5cbmZ1bmN0aW9uIGNsYXNzTGlzdChub2RlKSB7XG4gIHJldHVybiBub2RlLmNsYXNzTGlzdCB8fCBuZXcgQ2xhc3NMaXN0KG5vZGUpO1xufVxuXG5mdW5jdGlvbiBDbGFzc0xpc3Qobm9kZSkge1xuICB0aGlzLl9ub2RlID0gbm9kZTtcbiAgdGhpcy5fbmFtZXMgPSBjbGFzc0FycmF5KG5vZGUuZ2V0QXR0cmlidXRlKFwiY2xhc3NcIikgfHwgXCJcIik7XG59XG5cbkNsYXNzTGlzdC5wcm90b3R5cGUgPSB7XG4gIGFkZDogZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpID0gdGhpcy5fbmFtZXMuaW5kZXhPZihuYW1lKTtcbiAgICBpZiAoaSA8IDApIHtcbiAgICAgIHRoaXMuX25hbWVzLnB1c2gobmFtZSk7XG4gICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMuX25hbWVzLmpvaW4oXCIgXCIpKTtcbiAgICB9XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBpID0gdGhpcy5fbmFtZXMuaW5kZXhPZihuYW1lKTtcbiAgICBpZiAoaSA+PSAwKSB7XG4gICAgICB0aGlzLl9uYW1lcy5zcGxpY2UoaSwgMSk7XG4gICAgICB0aGlzLl9ub2RlLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIHRoaXMuX25hbWVzLmpvaW4oXCIgXCIpKTtcbiAgICB9XG4gIH0sXG4gIGNvbnRhaW5zOiBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuX25hbWVzLmluZGV4T2YobmFtZSkgPj0gMDtcbiAgfVxufTtcblxuZnVuY3Rpb24gY2xhc3NlZEFkZChub2RlLCBuYW1lcykge1xuICB2YXIgbGlzdCA9IGNsYXNzTGlzdChub2RlKSwgaSA9IC0xLCBuID0gbmFtZXMubGVuZ3RoO1xuICB3aGlsZSAoKytpIDwgbikgbGlzdC5hZGQobmFtZXNbaV0pO1xufVxuXG5mdW5jdGlvbiBjbGFzc2VkUmVtb3ZlKG5vZGUsIG5hbWVzKSB7XG4gIHZhciBsaXN0ID0gY2xhc3NMaXN0KG5vZGUpLCBpID0gLTEsIG4gPSBuYW1lcy5sZW5ndGg7XG4gIHdoaWxlICgrK2kgPCBuKSBsaXN0LnJlbW92ZShuYW1lc1tpXSk7XG59XG5cbmZ1bmN0aW9uIGNsYXNzZWRUcnVlKG5hbWVzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjbGFzc2VkQWRkKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZEZhbHNlKG5hbWVzKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBjbGFzc2VkUmVtb3ZlKHRoaXMsIG5hbWVzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gY2xhc3NlZEZ1bmN0aW9uKG5hbWVzLCB2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgKHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgPyBjbGFzc2VkQWRkIDogY2xhc3NlZFJlbW92ZSkodGhpcywgbmFtZXMpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgbmFtZXMgPSBjbGFzc0FycmF5KG5hbWUgKyBcIlwiKTtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgbGlzdCA9IGNsYXNzTGlzdCh0aGlzLm5vZGUoKSksIGkgPSAtMSwgbiA9IG5hbWVzLmxlbmd0aDtcbiAgICB3aGlsZSAoKytpIDwgbikgaWYgKCFsaXN0LmNvbnRhaW5zKG5hbWVzW2ldKSkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgcmV0dXJuIHRoaXMuZWFjaCgodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gY2xhc3NlZEZ1bmN0aW9uIDogdmFsdWVcbiAgICAgID8gY2xhc3NlZFRydWVcbiAgICAgIDogY2xhc3NlZEZhbHNlKShuYW1lcywgdmFsdWUpKTtcbn1cbiIsImZ1bmN0aW9uIHRleHRSZW1vdmUoKSB7XG4gIHRoaXMudGV4dENvbnRlbnQgPSBcIlwiO1xufVxuXG5mdW5jdGlvbiB0ZXh0Q29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHYgPT0gbnVsbCA/IFwiXCIgOiB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2godmFsdWUgPT0gbnVsbFxuICAgICAgICAgID8gdGV4dFJlbW92ZSA6ICh0eXBlb2YgdmFsdWUgPT09IFwiZnVuY3Rpb25cIlxuICAgICAgICAgID8gdGV4dEZ1bmN0aW9uXG4gICAgICAgICAgOiB0ZXh0Q29uc3RhbnQpKHZhbHVlKSlcbiAgICAgIDogdGhpcy5ub2RlKCkudGV4dENvbnRlbnQ7XG59XG4iLCJmdW5jdGlvbiBodG1sUmVtb3ZlKCkge1xuICB0aGlzLmlubmVySFRNTCA9IFwiXCI7XG59XG5cbmZ1bmN0aW9uIGh0bWxDb25zdGFudCh2YWx1ZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5pbm5lckhUTUwgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaHRtbEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdGhpcy5pbm5lckhUTUwgPSB2ID09IG51bGwgPyBcIlwiIDogdjtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAgID8gdGhpcy5lYWNoKHZhbHVlID09IG51bGxcbiAgICAgICAgICA/IGh0bWxSZW1vdmUgOiAodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGh0bWxGdW5jdGlvblxuICAgICAgICAgIDogaHRtbENvbnN0YW50KSh2YWx1ZSkpXG4gICAgICA6IHRoaXMubm9kZSgpLmlubmVySFRNTDtcbn1cbiIsImZ1bmN0aW9uIHJhaXNlKCkge1xuICBpZiAodGhpcy5uZXh0U2libGluZykgdGhpcy5wYXJlbnROb2RlLmFwcGVuZENoaWxkKHRoaXMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMuZWFjaChyYWlzZSk7XG59XG4iLCJmdW5jdGlvbiBsb3dlcigpIHtcbiAgaWYgKHRoaXMucHJldmlvdXNTaWJsaW5nKSB0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHRoaXMsIHRoaXMucGFyZW50Tm9kZS5maXJzdENoaWxkKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gobG93ZXIpO1xufVxuIiwiaW1wb3J0IGNyZWF0b3IgZnJvbSBcIi4uL2NyZWF0b3IuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSkge1xuICB2YXIgY3JlYXRlID0gdHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIiA/IG5hbWUgOiBjcmVhdG9yKG5hbWUpO1xuICByZXR1cm4gdGhpcy5zZWxlY3QoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuYXBwZW5kQ2hpbGQoY3JlYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykpO1xuICB9KTtcbn1cbiIsImltcG9ydCBjcmVhdG9yIGZyb20gXCIuLi9jcmVhdG9yLmpzXCI7XG5pbXBvcnQgc2VsZWN0b3IgZnJvbSBcIi4uL3NlbGVjdG9yLmpzXCI7XG5cbmZ1bmN0aW9uIGNvbnN0YW50TnVsbCgpIHtcbiAgcmV0dXJuIG51bGw7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIGJlZm9yZSkge1xuICB2YXIgY3JlYXRlID0gdHlwZW9mIG5hbWUgPT09IFwiZnVuY3Rpb25cIiA/IG5hbWUgOiBjcmVhdG9yKG5hbWUpLFxuICAgICAgc2VsZWN0ID0gYmVmb3JlID09IG51bGwgPyBjb25zdGFudE51bGwgOiB0eXBlb2YgYmVmb3JlID09PSBcImZ1bmN0aW9uXCIgPyBiZWZvcmUgOiBzZWxlY3RvcihiZWZvcmUpO1xuICByZXR1cm4gdGhpcy5zZWxlY3QoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaW5zZXJ0QmVmb3JlKGNyZWF0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpLCBzZWxlY3QuYXBwbHkodGhpcywgYXJndW1lbnRzKSB8fCBudWxsKTtcbiAgfSk7XG59XG4iLCJmdW5jdGlvbiByZW1vdmUoKSB7XG4gIHZhciBwYXJlbnQgPSB0aGlzLnBhcmVudE5vZGU7XG4gIGlmIChwYXJlbnQpIHBhcmVudC5yZW1vdmVDaGlsZCh0aGlzKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLmVhY2gocmVtb3ZlKTtcbn1cbiIsImZ1bmN0aW9uIHNlbGVjdGlvbl9jbG9uZVNoYWxsb3coKSB7XG4gIHZhciBjbG9uZSA9IHRoaXMuY2xvbmVOb2RlKGZhbHNlKSwgcGFyZW50ID0gdGhpcy5wYXJlbnROb2RlO1xuICByZXR1cm4gcGFyZW50ID8gcGFyZW50Lmluc2VydEJlZm9yZShjbG9uZSwgdGhpcy5uZXh0U2libGluZykgOiBjbG9uZTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uX2Nsb25lRGVlcCgpIHtcbiAgdmFyIGNsb25lID0gdGhpcy5jbG9uZU5vZGUodHJ1ZSksIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgcmV0dXJuIHBhcmVudCA/IHBhcmVudC5pbnNlcnRCZWZvcmUoY2xvbmUsIHRoaXMubmV4dFNpYmxpbmcpIDogY2xvbmU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGRlZXApIHtcbiAgcmV0dXJuIHRoaXMuc2VsZWN0KGRlZXAgPyBzZWxlY3Rpb25fY2xvbmVEZWVwIDogc2VsZWN0aW9uX2Nsb25lU2hhbGxvdyk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLnByb3BlcnR5KFwiX19kYXRhX19cIiwgdmFsdWUpXG4gICAgICA6IHRoaXMubm9kZSgpLl9fZGF0YV9fO1xufVxuIiwiZnVuY3Rpb24gY29udGV4dExpc3RlbmVyKGxpc3RlbmVyKSB7XG4gIHJldHVybiBmdW5jdGlvbihldmVudCkge1xuICAgIGxpc3RlbmVyLmNhbGwodGhpcywgZXZlbnQsIHRoaXMuX19kYXRhX18pO1xuICB9O1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5mdW5jdGlvbiBvblJlbW92ZSh0eXBlbmFtZSkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG9uID0gdGhpcy5fX29uO1xuICAgIGlmICghb24pIHJldHVybjtcbiAgICBmb3IgKHZhciBqID0gMCwgaSA9IC0xLCBtID0gb24ubGVuZ3RoLCBvOyBqIDwgbTsgKytqKSB7XG4gICAgICBpZiAobyA9IG9uW2pdLCAoIXR5cGVuYW1lLnR5cGUgfHwgby50eXBlID09PSB0eXBlbmFtZS50eXBlKSAmJiBvLm5hbWUgPT09IHR5cGVuYW1lLm5hbWUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciwgby5vcHRpb25zKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG9uWysraV0gPSBvO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoKytpKSBvbi5sZW5ndGggPSBpO1xuICAgIGVsc2UgZGVsZXRlIHRoaXMuX19vbjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25BZGQodHlwZW5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgb24gPSB0aGlzLl9fb24sIG8sIGxpc3RlbmVyID0gY29udGV4dExpc3RlbmVyKHZhbHVlKTtcbiAgICBpZiAob24pIGZvciAodmFyIGogPSAwLCBtID0gb24ubGVuZ3RoOyBqIDwgbTsgKytqKSB7XG4gICAgICBpZiAoKG8gPSBvbltqXSkudHlwZSA9PT0gdHlwZW5hbWUudHlwZSAmJiBvLm5hbWUgPT09IHR5cGVuYW1lLm5hbWUpIHtcbiAgICAgICAgdGhpcy5yZW1vdmVFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciwgby5vcHRpb25zKTtcbiAgICAgICAgdGhpcy5hZGRFdmVudExpc3RlbmVyKG8udHlwZSwgby5saXN0ZW5lciA9IGxpc3RlbmVyLCBvLm9wdGlvbnMgPSBvcHRpb25zKTtcbiAgICAgICAgby52YWx1ZSA9IHZhbHVlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuICAgIHRoaXMuYWRkRXZlbnRMaXN0ZW5lcih0eXBlbmFtZS50eXBlLCBsaXN0ZW5lciwgb3B0aW9ucyk7XG4gICAgbyA9IHt0eXBlOiB0eXBlbmFtZS50eXBlLCBuYW1lOiB0eXBlbmFtZS5uYW1lLCB2YWx1ZTogdmFsdWUsIGxpc3RlbmVyOiBsaXN0ZW5lciwgb3B0aW9uczogb3B0aW9uc307XG4gICAgaWYgKCFvbikgdGhpcy5fX29uID0gW29dO1xuICAgIGVsc2Ugb24ucHVzaChvKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odHlwZW5hbWUsIHZhbHVlLCBvcHRpb25zKSB7XG4gIHZhciB0eXBlbmFtZXMgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIpLCBpLCBuID0gdHlwZW5hbWVzLmxlbmd0aCwgdDtcblxuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICB2YXIgb24gPSB0aGlzLm5vZGUoKS5fX29uO1xuICAgIGlmIChvbikgZm9yICh2YXIgaiA9IDAsIG0gPSBvbi5sZW5ndGgsIG87IGogPCBtOyArK2opIHtcbiAgICAgIGZvciAoaSA9IDAsIG8gPSBvbltqXTsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAoKHQgPSB0eXBlbmFtZXNbaV0pLnR5cGUgPT09IG8udHlwZSAmJiB0Lm5hbWUgPT09IG8ubmFtZSkge1xuICAgICAgICAgIHJldHVybiBvLnZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybjtcbiAgfVxuXG4gIG9uID0gdmFsdWUgPyBvbkFkZCA6IG9uUmVtb3ZlO1xuICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSB0aGlzLmVhY2gob24odHlwZW5hbWVzW2ldLCB2YWx1ZSwgb3B0aW9ucykpO1xuICByZXR1cm4gdGhpcztcbn1cbiIsImltcG9ydCBkZWZhdWx0VmlldyBmcm9tIFwiLi4vd2luZG93LmpzXCI7XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRXZlbnQobm9kZSwgdHlwZSwgcGFyYW1zKSB7XG4gIHZhciB3aW5kb3cgPSBkZWZhdWx0Vmlldyhub2RlKSxcbiAgICAgIGV2ZW50ID0gd2luZG93LkN1c3RvbUV2ZW50O1xuXG4gIGlmICh0eXBlb2YgZXZlbnQgPT09IFwiZnVuY3Rpb25cIikge1xuICAgIGV2ZW50ID0gbmV3IGV2ZW50KHR5cGUsIHBhcmFtcyk7XG4gIH0gZWxzZSB7XG4gICAgZXZlbnQgPSB3aW5kb3cuZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudFwiKTtcbiAgICBpZiAocGFyYW1zKSBldmVudC5pbml0RXZlbnQodHlwZSwgcGFyYW1zLmJ1YmJsZXMsIHBhcmFtcy5jYW5jZWxhYmxlKSwgZXZlbnQuZGV0YWlsID0gcGFyYW1zLmRldGFpbDtcbiAgICBlbHNlIGV2ZW50LmluaXRFdmVudCh0eXBlLCBmYWxzZSwgZmFsc2UpO1xuICB9XG5cbiAgbm9kZS5kaXNwYXRjaEV2ZW50KGV2ZW50KTtcbn1cblxuZnVuY3Rpb24gZGlzcGF0Y2hDb25zdGFudCh0eXBlLCBwYXJhbXMpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkaXNwYXRjaEV2ZW50KHRoaXMsIHR5cGUsIHBhcmFtcyk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoRnVuY3Rpb24odHlwZSwgcGFyYW1zKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gZGlzcGF0Y2hFdmVudCh0aGlzLCB0eXBlLCBwYXJhbXMuYXBwbHkodGhpcywgYXJndW1lbnRzKSk7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHR5cGUsIHBhcmFtcykge1xuICByZXR1cm4gdGhpcy5lYWNoKCh0eXBlb2YgcGFyYW1zID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gZGlzcGF0Y2hGdW5jdGlvblxuICAgICAgOiBkaXNwYXRjaENvbnN0YW50KSh0eXBlLCBwYXJhbXMpKTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKigpIHtcbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBqID0gMCwgbSA9IGdyb3Vwcy5sZW5ndGg7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgaSA9IDAsIG4gPSBncm91cC5sZW5ndGgsIG5vZGU7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHlpZWxkIG5vZGU7XG4gICAgfVxuICB9XG59XG4iLCJpbXBvcnQgc2VsZWN0aW9uX3NlbGVjdCBmcm9tIFwiLi9zZWxlY3QuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fc2VsZWN0QWxsIGZyb20gXCIuL3NlbGVjdEFsbC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RDaGlsZCBmcm9tIFwiLi9zZWxlY3RDaGlsZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbiBmcm9tIFwiLi9zZWxlY3RDaGlsZHJlbi5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9maWx0ZXIgZnJvbSBcIi4vZmlsdGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2RhdGEgZnJvbSBcIi4vZGF0YS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lbnRlciBmcm9tIFwiLi9lbnRlci5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9leGl0IGZyb20gXCIuL2V4aXQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fam9pbiBmcm9tIFwiLi9qb2luLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX21lcmdlIGZyb20gXCIuL21lcmdlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX29yZGVyIGZyb20gXCIuL29yZGVyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NvcnQgZnJvbSBcIi4vc29ydC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9jYWxsIGZyb20gXCIuL2NhbGwuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbm9kZXMgZnJvbSBcIi4vbm9kZXMuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fbm9kZSBmcm9tIFwiLi9ub2RlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3NpemUgZnJvbSBcIi4vc2l6ZS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lbXB0eSBmcm9tIFwiLi9lbXB0eS5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9lYWNoIGZyb20gXCIuL2VhY2guanNcIjtcbmltcG9ydCBzZWxlY3Rpb25fYXR0ciBmcm9tIFwiLi9hdHRyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3N0eWxlIGZyb20gXCIuL3N0eWxlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3Byb3BlcnR5IGZyb20gXCIuL3Byb3BlcnR5LmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2NsYXNzZWQgZnJvbSBcIi4vY2xhc3NlZC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl90ZXh0IGZyb20gXCIuL3RleHQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faHRtbCBmcm9tIFwiLi9odG1sLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX3JhaXNlIGZyb20gXCIuL3JhaXNlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2xvd2VyIGZyb20gXCIuL2xvd2VyLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2FwcGVuZCBmcm9tIFwiLi9hcHBlbmQuanNcIjtcbmltcG9ydCBzZWxlY3Rpb25faW5zZXJ0IGZyb20gXCIuL2luc2VydC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl9yZW1vdmUgZnJvbSBcIi4vcmVtb3ZlLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2Nsb25lIGZyb20gXCIuL2Nsb25lLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2RhdHVtIGZyb20gXCIuL2RhdHVtLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX29uIGZyb20gXCIuL29uLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2Rpc3BhdGNoIGZyb20gXCIuL2Rpc3BhdGNoLmpzXCI7XG5pbXBvcnQgc2VsZWN0aW9uX2l0ZXJhdG9yIGZyb20gXCIuL2l0ZXJhdG9yLmpzXCI7XG5cbmV4cG9ydCB2YXIgcm9vdCA9IFtudWxsXTtcblxuZXhwb3J0IGZ1bmN0aW9uIFNlbGVjdGlvbihncm91cHMsIHBhcmVudHMpIHtcbiAgdGhpcy5fZ3JvdXBzID0gZ3JvdXBzO1xuICB0aGlzLl9wYXJlbnRzID0gcGFyZW50cztcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uKCkge1xuICByZXR1cm4gbmV3IFNlbGVjdGlvbihbW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF1dLCByb290KTtcbn1cblxuZnVuY3Rpb24gc2VsZWN0aW9uX3NlbGVjdGlvbigpIHtcbiAgcmV0dXJuIHRoaXM7XG59XG5cblNlbGVjdGlvbi5wcm90b3R5cGUgPSBzZWxlY3Rpb24ucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogU2VsZWN0aW9uLFxuICBzZWxlY3Q6IHNlbGVjdGlvbl9zZWxlY3QsXG4gIHNlbGVjdEFsbDogc2VsZWN0aW9uX3NlbGVjdEFsbCxcbiAgc2VsZWN0Q2hpbGQ6IHNlbGVjdGlvbl9zZWxlY3RDaGlsZCxcbiAgc2VsZWN0Q2hpbGRyZW46IHNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbixcbiAgZmlsdGVyOiBzZWxlY3Rpb25fZmlsdGVyLFxuICBkYXRhOiBzZWxlY3Rpb25fZGF0YSxcbiAgZW50ZXI6IHNlbGVjdGlvbl9lbnRlcixcbiAgZXhpdDogc2VsZWN0aW9uX2V4aXQsXG4gIGpvaW46IHNlbGVjdGlvbl9qb2luLFxuICBtZXJnZTogc2VsZWN0aW9uX21lcmdlLFxuICBzZWxlY3Rpb246IHNlbGVjdGlvbl9zZWxlY3Rpb24sXG4gIG9yZGVyOiBzZWxlY3Rpb25fb3JkZXIsXG4gIHNvcnQ6IHNlbGVjdGlvbl9zb3J0LFxuICBjYWxsOiBzZWxlY3Rpb25fY2FsbCxcbiAgbm9kZXM6IHNlbGVjdGlvbl9ub2RlcyxcbiAgbm9kZTogc2VsZWN0aW9uX25vZGUsXG4gIHNpemU6IHNlbGVjdGlvbl9zaXplLFxuICBlbXB0eTogc2VsZWN0aW9uX2VtcHR5LFxuICBlYWNoOiBzZWxlY3Rpb25fZWFjaCxcbiAgYXR0cjogc2VsZWN0aW9uX2F0dHIsXG4gIHN0eWxlOiBzZWxlY3Rpb25fc3R5bGUsXG4gIHByb3BlcnR5OiBzZWxlY3Rpb25fcHJvcGVydHksXG4gIGNsYXNzZWQ6IHNlbGVjdGlvbl9jbGFzc2VkLFxuICB0ZXh0OiBzZWxlY3Rpb25fdGV4dCxcbiAgaHRtbDogc2VsZWN0aW9uX2h0bWwsXG4gIHJhaXNlOiBzZWxlY3Rpb25fcmFpc2UsXG4gIGxvd2VyOiBzZWxlY3Rpb25fbG93ZXIsXG4gIGFwcGVuZDogc2VsZWN0aW9uX2FwcGVuZCxcbiAgaW5zZXJ0OiBzZWxlY3Rpb25faW5zZXJ0LFxuICByZW1vdmU6IHNlbGVjdGlvbl9yZW1vdmUsXG4gIGNsb25lOiBzZWxlY3Rpb25fY2xvbmUsXG4gIGRhdHVtOiBzZWxlY3Rpb25fZGF0dW0sXG4gIG9uOiBzZWxlY3Rpb25fb24sXG4gIGRpc3BhdGNoOiBzZWxlY3Rpb25fZGlzcGF0Y2gsXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiBzZWxlY3Rpb25faXRlcmF0b3Jcbn07XG5cbmV4cG9ydCBkZWZhdWx0IHNlbGVjdGlvbjtcbiIsImltcG9ydCB7U2VsZWN0aW9uLCByb290fSBmcm9tIFwiLi9zZWxlY3Rpb24vaW5kZXguanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oc2VsZWN0b3IpIHtcbiAgcmV0dXJuIHR5cGVvZiBzZWxlY3RvciA9PT0gXCJzdHJpbmdcIlxuICAgICAgPyBuZXcgU2VsZWN0aW9uKFtbZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcildXSwgW2RvY3VtZW50LmRvY3VtZW50RWxlbWVudF0pXG4gICAgICA6IG5ldyBTZWxlY3Rpb24oW1tzZWxlY3Rvcl1dLCByb290KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNvbnN0cnVjdG9yLCBmYWN0b3J5LCBwcm90b3R5cGUpIHtcbiAgY29uc3RydWN0b3IucHJvdG90eXBlID0gZmFjdG9yeS5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gIHByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IGNvbnN0cnVjdG9yO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKHBhcmVudCwgZGVmaW5pdGlvbikge1xuICB2YXIgcHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShwYXJlbnQucHJvdG90eXBlKTtcbiAgZm9yICh2YXIga2V5IGluIGRlZmluaXRpb24pIHByb3RvdHlwZVtrZXldID0gZGVmaW5pdGlvbltrZXldO1xuICByZXR1cm4gcHJvdG90eXBlO1xufVxuIiwiaW1wb3J0IGRlZmluZSwge2V4dGVuZH0gZnJvbSBcIi4vZGVmaW5lLmpzXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBDb2xvcigpIHt9XG5cbmV4cG9ydCB2YXIgZGFya2VyID0gMC43O1xuZXhwb3J0IHZhciBicmlnaHRlciA9IDEgLyBkYXJrZXI7XG5cbnZhciByZUkgPSBcIlxcXFxzKihbKy1dP1xcXFxkKylcXFxccypcIixcbiAgICByZU4gPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPylcXFxccypcIixcbiAgICByZVAgPSBcIlxcXFxzKihbKy1dPyg/OlxcXFxkKlxcXFwuKT9cXFxcZCsoPzpbZUVdWystXT9cXFxcZCspPyklXFxcXHMqXCIsXG4gICAgcmVIZXggPSAvXiMoWzAtOWEtZl17Myw4fSkkLyxcbiAgICByZVJnYkludGVnZXIgPSBuZXcgUmVnRXhwKGBecmdiXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfVxcXFwpJGApLFxuICAgIHJlUmdiUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5yZ2JcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVSZ2JhSW50ZWdlciA9IG5ldyBSZWdFeHAoYF5yZ2JhXFxcXCgke3JlSX0sJHtyZUl9LCR7cmVJfSwke3JlTn1cXFxcKSRgKSxcbiAgICByZVJnYmFQZXJjZW50ID0gbmV3IFJlZ0V4cChgXnJnYmFcXFxcKCR7cmVQfSwke3JlUH0sJHtyZVB9LCR7cmVOfVxcXFwpJGApLFxuICAgIHJlSHNsUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xcXFxcKCR7cmVOfSwke3JlUH0sJHtyZVB9XFxcXCkkYCksXG4gICAgcmVIc2xhUGVyY2VudCA9IG5ldyBSZWdFeHAoYF5oc2xhXFxcXCgke3JlTn0sJHtyZVB9LCR7cmVQfSwke3JlTn1cXFxcKSRgKTtcblxudmFyIG5hbWVkID0ge1xuICBhbGljZWJsdWU6IDB4ZjBmOGZmLFxuICBhbnRpcXVld2hpdGU6IDB4ZmFlYmQ3LFxuICBhcXVhOiAweDAwZmZmZixcbiAgYXF1YW1hcmluZTogMHg3ZmZmZDQsXG4gIGF6dXJlOiAweGYwZmZmZixcbiAgYmVpZ2U6IDB4ZjVmNWRjLFxuICBiaXNxdWU6IDB4ZmZlNGM0LFxuICBibGFjazogMHgwMDAwMDAsXG4gIGJsYW5jaGVkYWxtb25kOiAweGZmZWJjZCxcbiAgYmx1ZTogMHgwMDAwZmYsXG4gIGJsdWV2aW9sZXQ6IDB4OGEyYmUyLFxuICBicm93bjogMHhhNTJhMmEsXG4gIGJ1cmx5d29vZDogMHhkZWI4ODcsXG4gIGNhZGV0Ymx1ZTogMHg1ZjllYTAsXG4gIGNoYXJ0cmV1c2U6IDB4N2ZmZjAwLFxuICBjaG9jb2xhdGU6IDB4ZDI2OTFlLFxuICBjb3JhbDogMHhmZjdmNTAsXG4gIGNvcm5mbG93ZXJibHVlOiAweDY0OTVlZCxcbiAgY29ybnNpbGs6IDB4ZmZmOGRjLFxuICBjcmltc29uOiAweGRjMTQzYyxcbiAgY3lhbjogMHgwMGZmZmYsXG4gIGRhcmtibHVlOiAweDAwMDA4YixcbiAgZGFya2N5YW46IDB4MDA4YjhiLFxuICBkYXJrZ29sZGVucm9kOiAweGI4ODYwYixcbiAgZGFya2dyYXk6IDB4YTlhOWE5LFxuICBkYXJrZ3JlZW46IDB4MDA2NDAwLFxuICBkYXJrZ3JleTogMHhhOWE5YTksXG4gIGRhcmtraGFraTogMHhiZGI3NmIsXG4gIGRhcmttYWdlbnRhOiAweDhiMDA4YixcbiAgZGFya29saXZlZ3JlZW46IDB4NTU2YjJmLFxuICBkYXJrb3JhbmdlOiAweGZmOGMwMCxcbiAgZGFya29yY2hpZDogMHg5OTMyY2MsXG4gIGRhcmtyZWQ6IDB4OGIwMDAwLFxuICBkYXJrc2FsbW9uOiAweGU5OTY3YSxcbiAgZGFya3NlYWdyZWVuOiAweDhmYmM4ZixcbiAgZGFya3NsYXRlYmx1ZTogMHg0ODNkOGIsXG4gIGRhcmtzbGF0ZWdyYXk6IDB4MmY0ZjRmLFxuICBkYXJrc2xhdGVncmV5OiAweDJmNGY0ZixcbiAgZGFya3R1cnF1b2lzZTogMHgwMGNlZDEsXG4gIGRhcmt2aW9sZXQ6IDB4OTQwMGQzLFxuICBkZWVwcGluazogMHhmZjE0OTMsXG4gIGRlZXBza3libHVlOiAweDAwYmZmZixcbiAgZGltZ3JheTogMHg2OTY5NjksXG4gIGRpbWdyZXk6IDB4Njk2OTY5LFxuICBkb2RnZXJibHVlOiAweDFlOTBmZixcbiAgZmlyZWJyaWNrOiAweGIyMjIyMixcbiAgZmxvcmFsd2hpdGU6IDB4ZmZmYWYwLFxuICBmb3Jlc3RncmVlbjogMHgyMjhiMjIsXG4gIGZ1Y2hzaWE6IDB4ZmYwMGZmLFxuICBnYWluc2Jvcm86IDB4ZGNkY2RjLFxuICBnaG9zdHdoaXRlOiAweGY4ZjhmZixcbiAgZ29sZDogMHhmZmQ3MDAsXG4gIGdvbGRlbnJvZDogMHhkYWE1MjAsXG4gIGdyYXk6IDB4ODA4MDgwLFxuICBncmVlbjogMHgwMDgwMDAsXG4gIGdyZWVueWVsbG93OiAweGFkZmYyZixcbiAgZ3JleTogMHg4MDgwODAsXG4gIGhvbmV5ZGV3OiAweGYwZmZmMCxcbiAgaG90cGluazogMHhmZjY5YjQsXG4gIGluZGlhbnJlZDogMHhjZDVjNWMsXG4gIGluZGlnbzogMHg0YjAwODIsXG4gIGl2b3J5OiAweGZmZmZmMCxcbiAga2hha2k6IDB4ZjBlNjhjLFxuICBsYXZlbmRlcjogMHhlNmU2ZmEsXG4gIGxhdmVuZGVyYmx1c2g6IDB4ZmZmMGY1LFxuICBsYXduZ3JlZW46IDB4N2NmYzAwLFxuICBsZW1vbmNoaWZmb246IDB4ZmZmYWNkLFxuICBsaWdodGJsdWU6IDB4YWRkOGU2LFxuICBsaWdodGNvcmFsOiAweGYwODA4MCxcbiAgbGlnaHRjeWFuOiAweGUwZmZmZixcbiAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6IDB4ZmFmYWQyLFxuICBsaWdodGdyYXk6IDB4ZDNkM2QzLFxuICBsaWdodGdyZWVuOiAweDkwZWU5MCxcbiAgbGlnaHRncmV5OiAweGQzZDNkMyxcbiAgbGlnaHRwaW5rOiAweGZmYjZjMSxcbiAgbGlnaHRzYWxtb246IDB4ZmZhMDdhLFxuICBsaWdodHNlYWdyZWVuOiAweDIwYjJhYSxcbiAgbGlnaHRza3libHVlOiAweDg3Y2VmYSxcbiAgbGlnaHRzbGF0ZWdyYXk6IDB4Nzc4ODk5LFxuICBsaWdodHNsYXRlZ3JleTogMHg3Nzg4OTksXG4gIGxpZ2h0c3RlZWxibHVlOiAweGIwYzRkZSxcbiAgbGlnaHR5ZWxsb3c6IDB4ZmZmZmUwLFxuICBsaW1lOiAweDAwZmYwMCxcbiAgbGltZWdyZWVuOiAweDMyY2QzMixcbiAgbGluZW46IDB4ZmFmMGU2LFxuICBtYWdlbnRhOiAweGZmMDBmZixcbiAgbWFyb29uOiAweDgwMDAwMCxcbiAgbWVkaXVtYXF1YW1hcmluZTogMHg2NmNkYWEsXG4gIG1lZGl1bWJsdWU6IDB4MDAwMGNkLFxuICBtZWRpdW1vcmNoaWQ6IDB4YmE1NWQzLFxuICBtZWRpdW1wdXJwbGU6IDB4OTM3MGRiLFxuICBtZWRpdW1zZWFncmVlbjogMHgzY2IzNzEsXG4gIG1lZGl1bXNsYXRlYmx1ZTogMHg3YjY4ZWUsXG4gIG1lZGl1bXNwcmluZ2dyZWVuOiAweDAwZmE5YSxcbiAgbWVkaXVtdHVycXVvaXNlOiAweDQ4ZDFjYyxcbiAgbWVkaXVtdmlvbGV0cmVkOiAweGM3MTU4NSxcbiAgbWlkbmlnaHRibHVlOiAweDE5MTk3MCxcbiAgbWludGNyZWFtOiAweGY1ZmZmYSxcbiAgbWlzdHlyb3NlOiAweGZmZTRlMSxcbiAgbW9jY2FzaW46IDB4ZmZlNGI1LFxuICBuYXZham93aGl0ZTogMHhmZmRlYWQsXG4gIG5hdnk6IDB4MDAwMDgwLFxuICBvbGRsYWNlOiAweGZkZjVlNixcbiAgb2xpdmU6IDB4ODA4MDAwLFxuICBvbGl2ZWRyYWI6IDB4NmI4ZTIzLFxuICBvcmFuZ2U6IDB4ZmZhNTAwLFxuICBvcmFuZ2VyZWQ6IDB4ZmY0NTAwLFxuICBvcmNoaWQ6IDB4ZGE3MGQ2LFxuICBwYWxlZ29sZGVucm9kOiAweGVlZThhYSxcbiAgcGFsZWdyZWVuOiAweDk4ZmI5OCxcbiAgcGFsZXR1cnF1b2lzZTogMHhhZmVlZWUsXG4gIHBhbGV2aW9sZXRyZWQ6IDB4ZGI3MDkzLFxuICBwYXBheWF3aGlwOiAweGZmZWZkNSxcbiAgcGVhY2hwdWZmOiAweGZmZGFiOSxcbiAgcGVydTogMHhjZDg1M2YsXG4gIHBpbms6IDB4ZmZjMGNiLFxuICBwbHVtOiAweGRkYTBkZCxcbiAgcG93ZGVyYmx1ZTogMHhiMGUwZTYsXG4gIHB1cnBsZTogMHg4MDAwODAsXG4gIHJlYmVjY2FwdXJwbGU6IDB4NjYzMzk5LFxuICByZWQ6IDB4ZmYwMDAwLFxuICByb3N5YnJvd246IDB4YmM4ZjhmLFxuICByb3lhbGJsdWU6IDB4NDE2OWUxLFxuICBzYWRkbGVicm93bjogMHg4YjQ1MTMsXG4gIHNhbG1vbjogMHhmYTgwNzIsXG4gIHNhbmR5YnJvd246IDB4ZjRhNDYwLFxuICBzZWFncmVlbjogMHgyZThiNTcsXG4gIHNlYXNoZWxsOiAweGZmZjVlZSxcbiAgc2llbm5hOiAweGEwNTIyZCxcbiAgc2lsdmVyOiAweGMwYzBjMCxcbiAgc2t5Ymx1ZTogMHg4N2NlZWIsXG4gIHNsYXRlYmx1ZTogMHg2YTVhY2QsXG4gIHNsYXRlZ3JheTogMHg3MDgwOTAsXG4gIHNsYXRlZ3JleTogMHg3MDgwOTAsXG4gIHNub3c6IDB4ZmZmYWZhLFxuICBzcHJpbmdncmVlbjogMHgwMGZmN2YsXG4gIHN0ZWVsYmx1ZTogMHg0NjgyYjQsXG4gIHRhbjogMHhkMmI0OGMsXG4gIHRlYWw6IDB4MDA4MDgwLFxuICB0aGlzdGxlOiAweGQ4YmZkOCxcbiAgdG9tYXRvOiAweGZmNjM0NyxcbiAgdHVycXVvaXNlOiAweDQwZTBkMCxcbiAgdmlvbGV0OiAweGVlODJlZSxcbiAgd2hlYXQ6IDB4ZjVkZWIzLFxuICB3aGl0ZTogMHhmZmZmZmYsXG4gIHdoaXRlc21va2U6IDB4ZjVmNWY1LFxuICB5ZWxsb3c6IDB4ZmZmZjAwLFxuICB5ZWxsb3dncmVlbjogMHg5YWNkMzJcbn07XG5cbmRlZmluZShDb2xvciwgY29sb3IsIHtcbiAgY29weShjaGFubmVscykge1xuICAgIHJldHVybiBPYmplY3QuYXNzaWduKG5ldyB0aGlzLmNvbnN0cnVjdG9yLCB0aGlzLCBjaGFubmVscyk7XG4gIH0sXG4gIGRpc3BsYXlhYmxlKCkge1xuICAgIHJldHVybiB0aGlzLnJnYigpLmRpc3BsYXlhYmxlKCk7XG4gIH0sXG4gIGhleDogY29sb3JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IGNvbG9yX2Zvcm1hdEhleCxcbiAgZm9ybWF0SGV4ODogY29sb3JfZm9ybWF0SGV4OCxcbiAgZm9ybWF0SHNsOiBjb2xvcl9mb3JtYXRIc2wsXG4gIGZvcm1hdFJnYjogY29sb3JfZm9ybWF0UmdiLFxuICB0b1N0cmluZzogY29sb3JfZm9ybWF0UmdiXG59KTtcblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4KCkge1xuICByZXR1cm4gdGhpcy5yZ2IoKS5mb3JtYXRIZXgoKTtcbn1cblxuZnVuY3Rpb24gY29sb3JfZm9ybWF0SGV4OCgpIHtcbiAgcmV0dXJuIHRoaXMucmdiKCkuZm9ybWF0SGV4OCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRIc2woKSB7XG4gIHJldHVybiBoc2xDb252ZXJ0KHRoaXMpLmZvcm1hdEhzbCgpO1xufVxuXG5mdW5jdGlvbiBjb2xvcl9mb3JtYXRSZ2IoKSB7XG4gIHJldHVybiB0aGlzLnJnYigpLmZvcm1hdFJnYigpO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb2xvcihmb3JtYXQpIHtcbiAgdmFyIG0sIGw7XG4gIGZvcm1hdCA9IChmb3JtYXQgKyBcIlwiKS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgcmV0dXJuIChtID0gcmVIZXguZXhlYyhmb3JtYXQpKSA/IChsID0gbVsxXS5sZW5ndGgsIG0gPSBwYXJzZUludChtWzFdLCAxNiksIGwgPT09IDYgPyByZ2JuKG0pIC8vICNmZjAwMDBcbiAgICAgIDogbCA9PT0gMyA/IG5ldyBSZ2IoKG0gPj4gOCAmIDB4ZikgfCAobSA+PiA0ICYgMHhmMCksIChtID4+IDQgJiAweGYpIHwgKG0gJiAweGYwKSwgKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSwgMSkgLy8gI2YwMFxuICAgICAgOiBsID09PSA4ID8gcmdiYShtID4+IDI0ICYgMHhmZiwgbSA+PiAxNiAmIDB4ZmYsIG0gPj4gOCAmIDB4ZmYsIChtICYgMHhmZikgLyAweGZmKSAvLyAjZmYwMDAwMDBcbiAgICAgIDogbCA9PT0gNCA/IHJnYmEoKG0gPj4gMTIgJiAweGYpIHwgKG0gPj4gOCAmIDB4ZjApLCAobSA+PiA4ICYgMHhmKSB8IChtID4+IDQgJiAweGYwKSwgKG0gPj4gNCAmIDB4ZikgfCAobSAmIDB4ZjApLCAoKChtICYgMHhmKSA8PCA0KSB8IChtICYgMHhmKSkgLyAweGZmKSAvLyAjZjAwMFxuICAgICAgOiBudWxsKSAvLyBpbnZhbGlkIGhleFxuICAgICAgOiAobSA9IHJlUmdiSW50ZWdlci5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdLCBtWzJdLCBtWzNdLCAxKSAvLyByZ2IoMjU1LCAwLCAwKVxuICAgICAgOiAobSA9IHJlUmdiUGVyY2VudC5leGVjKGZvcm1hdCkpID8gbmV3IFJnYihtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCAxKSAvLyByZ2IoMTAwJSwgMCUsIDAlKVxuICAgICAgOiAobSA9IHJlUmdiYUludGVnZXIuZXhlYyhmb3JtYXQpKSA/IHJnYmEobVsxXSwgbVsyXSwgbVszXSwgbVs0XSkgLy8gcmdiYSgyNTUsIDAsIDAsIDEpXG4gICAgICA6IChtID0gcmVSZ2JhUGVyY2VudC5leGVjKGZvcm1hdCkpID8gcmdiYShtWzFdICogMjU1IC8gMTAwLCBtWzJdICogMjU1IC8gMTAwLCBtWzNdICogMjU1IC8gMTAwLCBtWzRdKSAvLyByZ2IoMTAwJSwgMCUsIDAlLCAxKVxuICAgICAgOiAobSA9IHJlSHNsUGVyY2VudC5leGVjKGZvcm1hdCkpID8gaHNsYShtWzFdLCBtWzJdIC8gMTAwLCBtWzNdIC8gMTAwLCAxKSAvLyBoc2woMTIwLCA1MCUsIDUwJSlcbiAgICAgIDogKG0gPSByZUhzbGFQZXJjZW50LmV4ZWMoZm9ybWF0KSkgPyBoc2xhKG1bMV0sIG1bMl0gLyAxMDAsIG1bM10gLyAxMDAsIG1bNF0pIC8vIGhzbGEoMTIwLCA1MCUsIDUwJSwgMSlcbiAgICAgIDogbmFtZWQuaGFzT3duUHJvcGVydHkoZm9ybWF0KSA/IHJnYm4obmFtZWRbZm9ybWF0XSkgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1wcm90b3R5cGUtYnVpbHRpbnNcbiAgICAgIDogZm9ybWF0ID09PSBcInRyYW5zcGFyZW50XCIgPyBuZXcgUmdiKE5hTiwgTmFOLCBOYU4sIDApXG4gICAgICA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIHJnYm4obikge1xuICByZXR1cm4gbmV3IFJnYihuID4+IDE2ICYgMHhmZiwgbiA+PiA4ICYgMHhmZiwgbiAmIDB4ZmYsIDEpO1xufVxuXG5mdW5jdGlvbiByZ2JhKHIsIGcsIGIsIGEpIHtcbiAgaWYgKGEgPD0gMCkgciA9IGcgPSBiID0gTmFOO1xuICByZXR1cm4gbmV3IFJnYihyLCBnLCBiLCBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJnYkNvbnZlcnQobykge1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBSZ2I7XG4gIG8gPSBvLnJnYigpO1xuICByZXR1cm4gbmV3IFJnYihvLnIsIG8uZywgby5iLCBvLm9wYWNpdHkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcmdiKHIsIGcsIGIsIG9wYWNpdHkpIHtcbiAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPT09IDEgPyByZ2JDb252ZXJ0KHIpIDogbmV3IFJnYihyLCBnLCBiLCBvcGFjaXR5ID09IG51bGwgPyAxIDogb3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBSZ2IociwgZywgYiwgb3BhY2l0eSkge1xuICB0aGlzLnIgPSArcjtcbiAgdGhpcy5nID0gK2c7XG4gIHRoaXMuYiA9ICtiO1xuICB0aGlzLm9wYWNpdHkgPSArb3BhY2l0eTtcbn1cblxuZGVmaW5lKFJnYiwgcmdiLCBleHRlbmQoQ29sb3IsIHtcbiAgYnJpZ2h0ZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBicmlnaHRlciA6IE1hdGgucG93KGJyaWdodGVyLCBrKTtcbiAgICByZXR1cm4gbmV3IFJnYih0aGlzLnIgKiBrLCB0aGlzLmcgKiBrLCB0aGlzLmIgKiBrLCB0aGlzLm9wYWNpdHkpO1xuICB9LFxuICBkYXJrZXIoaykge1xuICAgIGsgPSBrID09IG51bGwgPyBkYXJrZXIgOiBNYXRoLnBvdyhkYXJrZXIsIGspO1xuICAgIHJldHVybiBuZXcgUmdiKHRoaXMuciAqIGssIHRoaXMuZyAqIGssIHRoaXMuYiAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY2xhbXAoKSB7XG4gICAgcmV0dXJuIG5ldyBSZ2IoY2xhbXBpKHRoaXMuciksIGNsYW1waSh0aGlzLmcpLCBjbGFtcGkodGhpcy5iKSwgY2xhbXBhKHRoaXMub3BhY2l0eSkpO1xuICB9LFxuICBkaXNwbGF5YWJsZSgpIHtcbiAgICByZXR1cm4gKC0wLjUgPD0gdGhpcy5yICYmIHRoaXMuciA8IDI1NS41KVxuICAgICAgICAmJiAoLTAuNSA8PSB0aGlzLmcgJiYgdGhpcy5nIDwgMjU1LjUpXG4gICAgICAgICYmICgtMC41IDw9IHRoaXMuYiAmJiB0aGlzLmIgPCAyNTUuNSlcbiAgICAgICAgJiYgKDAgPD0gdGhpcy5vcGFjaXR5ICYmIHRoaXMub3BhY2l0eSA8PSAxKTtcbiAgfSxcbiAgaGV4OiByZ2JfZm9ybWF0SGV4LCAvLyBEZXByZWNhdGVkISBVc2UgY29sb3IuZm9ybWF0SGV4LlxuICBmb3JtYXRIZXg6IHJnYl9mb3JtYXRIZXgsXG4gIGZvcm1hdEhleDg6IHJnYl9mb3JtYXRIZXg4LFxuICBmb3JtYXRSZ2I6IHJnYl9mb3JtYXRSZ2IsXG4gIHRvU3RyaW5nOiByZ2JfZm9ybWF0UmdiXG59KSk7XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXgoKSB7XG4gIHJldHVybiBgIyR7aGV4KHRoaXMucil9JHtoZXgodGhpcy5nKX0ke2hleCh0aGlzLmIpfWA7XG59XG5cbmZ1bmN0aW9uIHJnYl9mb3JtYXRIZXg4KCkge1xuICByZXR1cm4gYCMke2hleCh0aGlzLnIpfSR7aGV4KHRoaXMuZyl9JHtoZXgodGhpcy5iKX0ke2hleCgoaXNOYU4odGhpcy5vcGFjaXR5KSA/IDEgOiB0aGlzLm9wYWNpdHkpICogMjU1KX1gO1xufVxuXG5mdW5jdGlvbiByZ2JfZm9ybWF0UmdiKCkge1xuICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gIHJldHVybiBgJHthID09PSAxID8gXCJyZ2IoXCIgOiBcInJnYmEoXCJ9JHtjbGFtcGkodGhpcy5yKX0sICR7Y2xhbXBpKHRoaXMuZyl9LCAke2NsYW1waSh0aGlzLmIpfSR7YSA9PT0gMSA/IFwiKVwiIDogYCwgJHthfSlgfWA7XG59XG5cbmZ1bmN0aW9uIGNsYW1wYShvcGFjaXR5KSB7XG4gIHJldHVybiBpc05hTihvcGFjaXR5KSA/IDEgOiBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBvcGFjaXR5KSk7XG59XG5cbmZ1bmN0aW9uIGNsYW1waSh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMjU1LCBNYXRoLnJvdW5kKHZhbHVlKSB8fCAwKSk7XG59XG5cbmZ1bmN0aW9uIGhleCh2YWx1ZSkge1xuICB2YWx1ZSA9IGNsYW1waSh2YWx1ZSk7XG4gIHJldHVybiAodmFsdWUgPCAxNiA/IFwiMFwiIDogXCJcIikgKyB2YWx1ZS50b1N0cmluZygxNik7XG59XG5cbmZ1bmN0aW9uIGhzbGEoaCwgcywgbCwgYSkge1xuICBpZiAoYSA8PSAwKSBoID0gcyA9IGwgPSBOYU47XG4gIGVsc2UgaWYgKGwgPD0gMCB8fCBsID49IDEpIGggPSBzID0gTmFOO1xuICBlbHNlIGlmIChzIDw9IDApIGggPSBOYU47XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIGEpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHNsQ29udmVydChvKSB7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbmV3IEhzbChvLmgsIG8ucywgby5sLCBvLm9wYWNpdHkpO1xuICBpZiAoIShvIGluc3RhbmNlb2YgQ29sb3IpKSBvID0gY29sb3Iobyk7XG4gIGlmICghbykgcmV0dXJuIG5ldyBIc2w7XG4gIGlmIChvIGluc3RhbmNlb2YgSHNsKSByZXR1cm4gbztcbiAgbyA9IG8ucmdiKCk7XG4gIHZhciByID0gby5yIC8gMjU1LFxuICAgICAgZyA9IG8uZyAvIDI1NSxcbiAgICAgIGIgPSBvLmIgLyAyNTUsXG4gICAgICBtaW4gPSBNYXRoLm1pbihyLCBnLCBiKSxcbiAgICAgIG1heCA9IE1hdGgubWF4KHIsIGcsIGIpLFxuICAgICAgaCA9IE5hTixcbiAgICAgIHMgPSBtYXggLSBtaW4sXG4gICAgICBsID0gKG1heCArIG1pbikgLyAyO1xuICBpZiAocykge1xuICAgIGlmIChyID09PSBtYXgpIGggPSAoZyAtIGIpIC8gcyArIChnIDwgYikgKiA2O1xuICAgIGVsc2UgaWYgKGcgPT09IG1heCkgaCA9IChiIC0gcikgLyBzICsgMjtcbiAgICBlbHNlIGggPSAociAtIGcpIC8gcyArIDQ7XG4gICAgcyAvPSBsIDwgMC41ID8gbWF4ICsgbWluIDogMiAtIG1heCAtIG1pbjtcbiAgICBoICo9IDYwO1xuICB9IGVsc2Uge1xuICAgIHMgPSBsID4gMCAmJiBsIDwgMSA/IDAgOiBoO1xuICB9XG4gIHJldHVybiBuZXcgSHNsKGgsIHMsIGwsIG8ub3BhY2l0eSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBoc2woaCwgcywgbCwgb3BhY2l0eSkge1xuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA9PT0gMSA/IGhzbENvbnZlcnQoaCkgOiBuZXcgSHNsKGgsIHMsIGwsIG9wYWNpdHkgPT0gbnVsbCA/IDEgOiBvcGFjaXR5KTtcbn1cblxuZnVuY3Rpb24gSHNsKGgsIHMsIGwsIG9wYWNpdHkpIHtcbiAgdGhpcy5oID0gK2g7XG4gIHRoaXMucyA9ICtzO1xuICB0aGlzLmwgPSArbDtcbiAgdGhpcy5vcGFjaXR5ID0gK29wYWNpdHk7XG59XG5cbmRlZmluZShIc2wsIGhzbCwgZXh0ZW5kKENvbG9yLCB7XG4gIGJyaWdodGVyKGspIHtcbiAgICBrID0gayA9PSBudWxsID8gYnJpZ2h0ZXIgOiBNYXRoLnBvdyhicmlnaHRlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIGRhcmtlcihrKSB7XG4gICAgayA9IGsgPT0gbnVsbCA/IGRhcmtlciA6IE1hdGgucG93KGRhcmtlciwgayk7XG4gICAgcmV0dXJuIG5ldyBIc2wodGhpcy5oLCB0aGlzLnMsIHRoaXMubCAqIGssIHRoaXMub3BhY2l0eSk7XG4gIH0sXG4gIHJnYigpIHtcbiAgICB2YXIgaCA9IHRoaXMuaCAlIDM2MCArICh0aGlzLmggPCAwKSAqIDM2MCxcbiAgICAgICAgcyA9IGlzTmFOKGgpIHx8IGlzTmFOKHRoaXMucykgPyAwIDogdGhpcy5zLFxuICAgICAgICBsID0gdGhpcy5sLFxuICAgICAgICBtMiA9IGwgKyAobCA8IDAuNSA/IGwgOiAxIC0gbCkgKiBzLFxuICAgICAgICBtMSA9IDIgKiBsIC0gbTI7XG4gICAgcmV0dXJuIG5ldyBSZ2IoXG4gICAgICBoc2wycmdiKGggPj0gMjQwID8gaCAtIDI0MCA6IGggKyAxMjAsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGgsIG0xLCBtMiksXG4gICAgICBoc2wycmdiKGggPCAxMjAgPyBoICsgMjQwIDogaCAtIDEyMCwgbTEsIG0yKSxcbiAgICAgIHRoaXMub3BhY2l0eVxuICAgICk7XG4gIH0sXG4gIGNsYW1wKCkge1xuICAgIHJldHVybiBuZXcgSHNsKGNsYW1waCh0aGlzLmgpLCBjbGFtcHQodGhpcy5zKSwgY2xhbXB0KHRoaXMubCksIGNsYW1wYSh0aGlzLm9wYWNpdHkpKTtcbiAgfSxcbiAgZGlzcGxheWFibGUoKSB7XG4gICAgcmV0dXJuICgwIDw9IHRoaXMucyAmJiB0aGlzLnMgPD0gMSB8fCBpc05hTih0aGlzLnMpKVxuICAgICAgICAmJiAoMCA8PSB0aGlzLmwgJiYgdGhpcy5sIDw9IDEpXG4gICAgICAgICYmICgwIDw9IHRoaXMub3BhY2l0eSAmJiB0aGlzLm9wYWNpdHkgPD0gMSk7XG4gIH0sXG4gIGZvcm1hdEhzbCgpIHtcbiAgICBjb25zdCBhID0gY2xhbXBhKHRoaXMub3BhY2l0eSk7XG4gICAgcmV0dXJuIGAke2EgPT09IDEgPyBcImhzbChcIiA6IFwiaHNsYShcIn0ke2NsYW1waCh0aGlzLmgpfSwgJHtjbGFtcHQodGhpcy5zKSAqIDEwMH0lLCAke2NsYW1wdCh0aGlzLmwpICogMTAwfSUke2EgPT09IDEgPyBcIilcIiA6IGAsICR7YX0pYH1gO1xuICB9XG59KSk7XG5cbmZ1bmN0aW9uIGNsYW1waCh2YWx1ZSkge1xuICB2YWx1ZSA9ICh2YWx1ZSB8fCAwKSAlIDM2MDtcbiAgcmV0dXJuIHZhbHVlIDwgMCA/IHZhbHVlICsgMzYwIDogdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNsYW1wdCh2YWx1ZSkge1xuICByZXR1cm4gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdmFsdWUgfHwgMCkpO1xufVxuXG4vKiBGcm9tIEZ2RCAxMy4zNywgQ1NTIENvbG9yIE1vZHVsZSBMZXZlbCAzICovXG5mdW5jdGlvbiBoc2wycmdiKGgsIG0xLCBtMikge1xuICByZXR1cm4gKGggPCA2MCA/IG0xICsgKG0yIC0gbTEpICogaCAvIDYwXG4gICAgICA6IGggPCAxODAgPyBtMlxuICAgICAgOiBoIDwgMjQwID8gbTEgKyAobTIgLSBtMSkgKiAoMjQwIC0gaCkgLyA2MFxuICAgICAgOiBtMSkgKiAyNTU7XG59XG4iLCJleHBvcnQgZGVmYXVsdCB4ID0+ICgpID0+IHg7XG4iLCJpbXBvcnQgY29uc3RhbnQgZnJvbSBcIi4vY29uc3RhbnQuanNcIjtcblxuZnVuY3Rpb24gbGluZWFyKGEsIGQpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYSArIHQgKiBkO1xuICB9O1xufVxuXG5mdW5jdGlvbiBleHBvbmVudGlhbChhLCBiLCB5KSB7XG4gIHJldHVybiBhID0gTWF0aC5wb3coYSwgeSksIGIgPSBNYXRoLnBvdyhiLCB5KSAtIGEsIHkgPSAxIC8geSwgZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBNYXRoLnBvdyhhICsgdCAqIGIsIHkpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaHVlKGEsIGIpIHtcbiAgdmFyIGQgPSBiIC0gYTtcbiAgcmV0dXJuIGQgPyBsaW5lYXIoYSwgZCA+IDE4MCB8fCBkIDwgLTE4MCA/IGQgLSAzNjAgKiBNYXRoLnJvdW5kKGQgLyAzNjApIDogZCkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdhbW1hKHkpIHtcbiAgcmV0dXJuICh5ID0gK3kpID09PSAxID8gbm9nYW1tYSA6IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gYiAtIGEgPyBleHBvbmVudGlhbChhLCBiLCB5KSA6IGNvbnN0YW50KGlzTmFOKGEpID8gYiA6IGEpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBub2dhbW1hKGEsIGIpIHtcbiAgdmFyIGQgPSBiIC0gYTtcbiAgcmV0dXJuIGQgPyBsaW5lYXIoYSwgZCkgOiBjb25zdGFudChpc05hTihhKSA/IGIgOiBhKTtcbn1cbiIsImltcG9ydCB7cmdiIGFzIGNvbG9yUmdifSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCBiYXNpcyBmcm9tIFwiLi9iYXNpcy5qc1wiO1xuaW1wb3J0IGJhc2lzQ2xvc2VkIGZyb20gXCIuL2Jhc2lzQ2xvc2VkLmpzXCI7XG5pbXBvcnQgbm9nYW1tYSwge2dhbW1hfSBmcm9tIFwiLi9jb2xvci5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gcmdiR2FtbWEoeSkge1xuICB2YXIgY29sb3IgPSBnYW1tYSh5KTtcblxuICBmdW5jdGlvbiByZ2Ioc3RhcnQsIGVuZCkge1xuICAgIHZhciByID0gY29sb3IoKHN0YXJ0ID0gY29sb3JSZ2Ioc3RhcnQpKS5yLCAoZW5kID0gY29sb3JSZ2IoZW5kKSkuciksXG4gICAgICAgIGcgPSBjb2xvcihzdGFydC5nLCBlbmQuZyksXG4gICAgICAgIGIgPSBjb2xvcihzdGFydC5iLCBlbmQuYiksXG4gICAgICAgIG9wYWNpdHkgPSBub2dhbW1hKHN0YXJ0Lm9wYWNpdHksIGVuZC5vcGFjaXR5KTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgc3RhcnQuciA9IHIodCk7XG4gICAgICBzdGFydC5nID0gZyh0KTtcbiAgICAgIHN0YXJ0LmIgPSBiKHQpO1xuICAgICAgc3RhcnQub3BhY2l0eSA9IG9wYWNpdHkodCk7XG4gICAgICByZXR1cm4gc3RhcnQgKyBcIlwiO1xuICAgIH07XG4gIH1cblxuICByZ2IuZ2FtbWEgPSByZ2JHYW1tYTtcblxuICByZXR1cm4gcmdiO1xufSkoMSk7XG5cbmZ1bmN0aW9uIHJnYlNwbGluZShzcGxpbmUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGNvbG9ycykge1xuICAgIHZhciBuID0gY29sb3JzLmxlbmd0aCxcbiAgICAgICAgciA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgZyA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgYiA9IG5ldyBBcnJheShuKSxcbiAgICAgICAgaSwgY29sb3I7XG4gICAgZm9yIChpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgY29sb3IgPSBjb2xvclJnYihjb2xvcnNbaV0pO1xuICAgICAgcltpXSA9IGNvbG9yLnIgfHwgMDtcbiAgICAgIGdbaV0gPSBjb2xvci5nIHx8IDA7XG4gICAgICBiW2ldID0gY29sb3IuYiB8fCAwO1xuICAgIH1cbiAgICByID0gc3BsaW5lKHIpO1xuICAgIGcgPSBzcGxpbmUoZyk7XG4gICAgYiA9IHNwbGluZShiKTtcbiAgICBjb2xvci5vcGFjaXR5ID0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgICAgY29sb3IuciA9IHIodCk7XG4gICAgICBjb2xvci5nID0gZyh0KTtcbiAgICAgIGNvbG9yLmIgPSBiKHQpO1xuICAgICAgcmV0dXJuIGNvbG9yICsgXCJcIjtcbiAgICB9O1xuICB9O1xufVxuXG5leHBvcnQgdmFyIHJnYkJhc2lzID0gcmdiU3BsaW5lKGJhc2lzKTtcbmV4cG9ydCB2YXIgcmdiQmFzaXNDbG9zZWQgPSByZ2JTcGxpbmUoYmFzaXNDbG9zZWQpO1xuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICBpZiAoIWIpIGIgPSBbXTtcbiAgdmFyIG4gPSBhID8gTWF0aC5taW4oYi5sZW5ndGgsIGEubGVuZ3RoKSA6IDAsXG4gICAgICBjID0gYi5zbGljZSgpLFxuICAgICAgaTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbjsgKytpKSBjW2ldID0gYVtpXSAqICgxIC0gdCkgKyBiW2ldICogdDtcbiAgICByZXR1cm4gYztcbiAgfTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtYmVyQXJyYXkoeCkge1xuICByZXR1cm4gQXJyYXlCdWZmZXIuaXNWaWV3KHgpICYmICEoeCBpbnN0YW5jZW9mIERhdGFWaWV3KTtcbn1cbiIsImltcG9ydCB2YWx1ZSBmcm9tIFwiLi92YWx1ZS5qc1wiO1xuaW1wb3J0IG51bWJlckFycmF5LCB7aXNOdW1iZXJBcnJheX0gZnJvbSBcIi4vbnVtYmVyQXJyYXkuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gKGlzTnVtYmVyQXJyYXkoYikgPyBudW1iZXJBcnJheSA6IGdlbmVyaWNBcnJheSkoYSwgYik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmljQXJyYXkoYSwgYikge1xuICB2YXIgbmIgPSBiID8gYi5sZW5ndGggOiAwLFxuICAgICAgbmEgPSBhID8gTWF0aC5taW4obmIsIGEubGVuZ3RoKSA6IDAsXG4gICAgICB4ID0gbmV3IEFycmF5KG5hKSxcbiAgICAgIGMgPSBuZXcgQXJyYXkobmIpLFxuICAgICAgaTtcblxuICBmb3IgKGkgPSAwOyBpIDwgbmE7ICsraSkgeFtpXSA9IHZhbHVlKGFbaV0sIGJbaV0pO1xuICBmb3IgKDsgaSA8IG5iOyArK2kpIGNbaV0gPSBiW2ldO1xuXG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChpID0gMDsgaSA8IG5hOyArK2kpIGNbaV0gPSB4W2ldKHQpO1xuICAgIHJldHVybiBjO1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICB2YXIgZCA9IG5ldyBEYXRlO1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gZC5zZXRUaW1lKGEgKiAoMSAtIHQpICsgYiAqIHQpLCBkO1xuICB9O1xufVxuIiwiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYikge1xuICByZXR1cm4gYSA9ICthLCBiID0gK2IsIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYSAqICgxIC0gdCkgKyBiICogdDtcbiAgfTtcbn1cbiIsImltcG9ydCB2YWx1ZSBmcm9tIFwiLi92YWx1ZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciBpID0ge30sXG4gICAgICBjID0ge30sXG4gICAgICBrO1xuXG4gIGlmIChhID09PSBudWxsIHx8IHR5cGVvZiBhICE9PSBcIm9iamVjdFwiKSBhID0ge307XG4gIGlmIChiID09PSBudWxsIHx8IHR5cGVvZiBiICE9PSBcIm9iamVjdFwiKSBiID0ge307XG5cbiAgZm9yIChrIGluIGIpIHtcbiAgICBpZiAoayBpbiBhKSB7XG4gICAgICBpW2tdID0gdmFsdWUoYVtrXSwgYltrXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNba10gPSBiW2tdO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgZm9yIChrIGluIGkpIGNba10gPSBpW2tdKHQpO1xuICAgIHJldHVybiBjO1xuICB9O1xufVxuIiwiaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxudmFyIHJlQSA9IC9bLStdPyg/OlxcZCtcXC4/XFxkKnxcXC4/XFxkKykoPzpbZUVdWy0rXT9cXGQrKT8vZyxcbiAgICByZUIgPSBuZXcgUmVnRXhwKHJlQS5zb3VyY2UsIFwiZ1wiKTtcblxuZnVuY3Rpb24gemVybyhiKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYjtcbiAgfTtcbn1cblxuZnVuY3Rpb24gb25lKGIpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gYih0KSArIFwiXCI7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGJpID0gcmVBLmxhc3RJbmRleCA9IHJlQi5sYXN0SW5kZXggPSAwLCAvLyBzY2FuIGluZGV4IGZvciBuZXh0IG51bWJlciBpbiBiXG4gICAgICBhbSwgLy8gY3VycmVudCBtYXRjaCBpbiBhXG4gICAgICBibSwgLy8gY3VycmVudCBtYXRjaCBpbiBiXG4gICAgICBicywgLy8gc3RyaW5nIHByZWNlZGluZyBjdXJyZW50IG51bWJlciBpbiBiLCBpZiBhbnlcbiAgICAgIGkgPSAtMSwgLy8gaW5kZXggaW4gc1xuICAgICAgcyA9IFtdLCAvLyBzdHJpbmcgY29uc3RhbnRzIGFuZCBwbGFjZWhvbGRlcnNcbiAgICAgIHEgPSBbXTsgLy8gbnVtYmVyIGludGVycG9sYXRvcnNcblxuICAvLyBDb2VyY2UgaW5wdXRzIHRvIHN0cmluZ3MuXG4gIGEgPSBhICsgXCJcIiwgYiA9IGIgKyBcIlwiO1xuXG4gIC8vIEludGVycG9sYXRlIHBhaXJzIG9mIG51bWJlcnMgaW4gYSAmIGIuXG4gIHdoaWxlICgoYW0gPSByZUEuZXhlYyhhKSlcbiAgICAgICYmIChibSA9IHJlQi5leGVjKGIpKSkge1xuICAgIGlmICgoYnMgPSBibS5pbmRleCkgPiBiaSkgeyAvLyBhIHN0cmluZyBwcmVjZWRlcyB0aGUgbmV4dCBudW1iZXIgaW4gYlxuICAgICAgYnMgPSBiLnNsaWNlKGJpLCBicyk7XG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYnM7XG4gICAgfVxuICAgIGlmICgoYW0gPSBhbVswXSkgPT09IChibSA9IGJtWzBdKSkgeyAvLyBudW1iZXJzIGluIGEgJiBiIG1hdGNoXG4gICAgICBpZiAoc1tpXSkgc1tpXSArPSBibTsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICAgIGVsc2Ugc1srK2ldID0gYm07XG4gICAgfSBlbHNlIHsgLy8gaW50ZXJwb2xhdGUgbm9uLW1hdGNoaW5nIG51bWJlcnNcbiAgICAgIHNbKytpXSA9IG51bGw7XG4gICAgICBxLnB1c2goe2k6IGksIHg6IG51bWJlcihhbSwgYm0pfSk7XG4gICAgfVxuICAgIGJpID0gcmVCLmxhc3RJbmRleDtcbiAgfVxuXG4gIC8vIEFkZCByZW1haW5zIG9mIGIuXG4gIGlmIChiaSA8IGIubGVuZ3RoKSB7XG4gICAgYnMgPSBiLnNsaWNlKGJpKTtcbiAgICBpZiAoc1tpXSkgc1tpXSArPSBiczsgLy8gY29hbGVzY2Ugd2l0aCBwcmV2aW91cyBzdHJpbmdcbiAgICBlbHNlIHNbKytpXSA9IGJzO1xuICB9XG5cbiAgLy8gU3BlY2lhbCBvcHRpbWl6YXRpb24gZm9yIG9ubHkgYSBzaW5nbGUgbWF0Y2guXG4gIC8vIE90aGVyd2lzZSwgaW50ZXJwb2xhdGUgZWFjaCBvZiB0aGUgbnVtYmVycyBhbmQgcmVqb2luIHRoZSBzdHJpbmcuXG4gIHJldHVybiBzLmxlbmd0aCA8IDIgPyAocVswXVxuICAgICAgPyBvbmUocVswXS54KVxuICAgICAgOiB6ZXJvKGIpKVxuICAgICAgOiAoYiA9IHEubGVuZ3RoLCBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgZm9yICh2YXIgaSA9IDAsIG87IGkgPCBiOyArK2kpIHNbKG8gPSBxW2ldKS5pXSA9IG8ueCh0KTtcbiAgICAgICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgICAgICB9KTtcbn1cbiIsImltcG9ydCB7Y29sb3J9IGZyb20gXCJkMy1jb2xvclwiO1xuaW1wb3J0IHJnYiBmcm9tIFwiLi9yZ2IuanNcIjtcbmltcG9ydCB7Z2VuZXJpY0FycmF5fSBmcm9tIFwiLi9hcnJheS5qc1wiO1xuaW1wb3J0IGRhdGUgZnJvbSBcIi4vZGF0ZS5qc1wiO1xuaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcbmltcG9ydCBvYmplY3QgZnJvbSBcIi4vb2JqZWN0LmpzXCI7XG5pbXBvcnQgc3RyaW5nIGZyb20gXCIuL3N0cmluZy5qc1wiO1xuaW1wb3J0IGNvbnN0YW50IGZyb20gXCIuL2NvbnN0YW50LmpzXCI7XG5pbXBvcnQgbnVtYmVyQXJyYXksIHtpc051bWJlckFycmF5fSBmcm9tIFwiLi9udW1iZXJBcnJheS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHZhciB0ID0gdHlwZW9mIGIsIGM7XG4gIHJldHVybiBiID09IG51bGwgfHwgdCA9PT0gXCJib29sZWFuXCIgPyBjb25zdGFudChiKVxuICAgICAgOiAodCA9PT0gXCJudW1iZXJcIiA/IG51bWJlclxuICAgICAgOiB0ID09PSBcInN0cmluZ1wiID8gKChjID0gY29sb3IoYikpID8gKGIgPSBjLCByZ2IpIDogc3RyaW5nKVxuICAgICAgOiBiIGluc3RhbmNlb2YgY29sb3IgPyByZ2JcbiAgICAgIDogYiBpbnN0YW5jZW9mIERhdGUgPyBkYXRlXG4gICAgICA6IGlzTnVtYmVyQXJyYXkoYikgPyBudW1iZXJBcnJheVxuICAgICAgOiBBcnJheS5pc0FycmF5KGIpID8gZ2VuZXJpY0FycmF5XG4gICAgICA6IHR5cGVvZiBiLnZhbHVlT2YgIT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgYi50b1N0cmluZyAhPT0gXCJmdW5jdGlvblwiIHx8IGlzTmFOKGIpID8gb2JqZWN0XG4gICAgICA6IG51bWJlcikoYSwgYik7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbihhLCBiKSB7XG4gIHJldHVybiBhID0gK2EsIGIgPSArYiwgZnVuY3Rpb24odCkge1xuICAgIHJldHVybiBNYXRoLnJvdW5kKGEgKiAoMSAtIHQpICsgYiAqIHQpO1xuICB9O1xufVxuIiwidmFyIGRlZ3JlZXMgPSAxODAgLyBNYXRoLlBJO1xuXG5leHBvcnQgdmFyIGlkZW50aXR5ID0ge1xuICB0cmFuc2xhdGVYOiAwLFxuICB0cmFuc2xhdGVZOiAwLFxuICByb3RhdGU6IDAsXG4gIHNrZXdYOiAwLFxuICBzY2FsZVg6IDEsXG4gIHNjYWxlWTogMVxufTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oYSwgYiwgYywgZCwgZSwgZikge1xuICB2YXIgc2NhbGVYLCBzY2FsZVksIHNrZXdYO1xuICBpZiAoc2NhbGVYID0gTWF0aC5zcXJ0KGEgKiBhICsgYiAqIGIpKSBhIC89IHNjYWxlWCwgYiAvPSBzY2FsZVg7XG4gIGlmIChza2V3WCA9IGEgKiBjICsgYiAqIGQpIGMgLT0gYSAqIHNrZXdYLCBkIC09IGIgKiBza2V3WDtcbiAgaWYgKHNjYWxlWSA9IE1hdGguc3FydChjICogYyArIGQgKiBkKSkgYyAvPSBzY2FsZVksIGQgLz0gc2NhbGVZLCBza2V3WCAvPSBzY2FsZVk7XG4gIGlmIChhICogZCA8IGIgKiBjKSBhID0gLWEsIGIgPSAtYiwgc2tld1ggPSAtc2tld1gsIHNjYWxlWCA9IC1zY2FsZVg7XG4gIHJldHVybiB7XG4gICAgdHJhbnNsYXRlWDogZSxcbiAgICB0cmFuc2xhdGVZOiBmLFxuICAgIHJvdGF0ZTogTWF0aC5hdGFuMihiLCBhKSAqIGRlZ3JlZXMsXG4gICAgc2tld1g6IE1hdGguYXRhbihza2V3WCkgKiBkZWdyZWVzLFxuICAgIHNjYWxlWDogc2NhbGVYLFxuICAgIHNjYWxlWTogc2NhbGVZXG4gIH07XG59XG4iLCJpbXBvcnQgZGVjb21wb3NlLCB7aWRlbnRpdHl9IGZyb20gXCIuL2RlY29tcG9zZS5qc1wiO1xuXG52YXIgc3ZnTm9kZTtcblxuLyogZXNsaW50LWRpc2FibGUgbm8tdW5kZWYgKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUNzcyh2YWx1ZSkge1xuICBjb25zdCBtID0gbmV3ICh0eXBlb2YgRE9NTWF0cml4ID09PSBcImZ1bmN0aW9uXCIgPyBET01NYXRyaXggOiBXZWJLaXRDU1NNYXRyaXgpKHZhbHVlICsgXCJcIik7XG4gIHJldHVybiBtLmlzSWRlbnRpdHkgPyBpZGVudGl0eSA6IGRlY29tcG9zZShtLmEsIG0uYiwgbS5jLCBtLmQsIG0uZSwgbS5mKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBhcnNlU3ZnKHZhbHVlKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gaWRlbnRpdHk7XG4gIGlmICghc3ZnTm9kZSkgc3ZnTm9kZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsIFwiZ1wiKTtcbiAgc3ZnTm9kZS5zZXRBdHRyaWJ1dGUoXCJ0cmFuc2Zvcm1cIiwgdmFsdWUpO1xuICBpZiAoISh2YWx1ZSA9IHN2Z05vZGUudHJhbnNmb3JtLmJhc2VWYWwuY29uc29saWRhdGUoKSkpIHJldHVybiBpZGVudGl0eTtcbiAgdmFsdWUgPSB2YWx1ZS5tYXRyaXg7XG4gIHJldHVybiBkZWNvbXBvc2UodmFsdWUuYSwgdmFsdWUuYiwgdmFsdWUuYywgdmFsdWUuZCwgdmFsdWUuZSwgdmFsdWUuZik7XG59XG4iLCJpbXBvcnQgbnVtYmVyIGZyb20gXCIuLi9udW1iZXIuanNcIjtcbmltcG9ydCB7cGFyc2VDc3MsIHBhcnNlU3ZnfSBmcm9tIFwiLi9wYXJzZS5qc1wiO1xuXG5mdW5jdGlvbiBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZSwgcHhDb21tYSwgcHhQYXJlbiwgZGVnUGFyZW4pIHtcblxuICBmdW5jdGlvbiBwb3Aocykge1xuICAgIHJldHVybiBzLmxlbmd0aCA/IHMucG9wKCkgKyBcIiBcIiA6IFwiXCI7XG4gIH1cblxuICBmdW5jdGlvbiB0cmFuc2xhdGUoeGEsIHlhLCB4YiwgeWIsIHMsIHEpIHtcbiAgICBpZiAoeGEgIT09IHhiIHx8IHlhICE9PSB5Yikge1xuICAgICAgdmFyIGkgPSBzLnB1c2goXCJ0cmFuc2xhdGUoXCIsIG51bGwsIHB4Q29tbWEsIG51bGwsIHB4UGFyZW4pO1xuICAgICAgcS5wdXNoKHtpOiBpIC0gNCwgeDogbnVtYmVyKHhhLCB4Yil9LCB7aTogaSAtIDIsIHg6IG51bWJlcih5YSwgeWIpfSk7XG4gICAgfSBlbHNlIGlmICh4YiB8fCB5Yikge1xuICAgICAgcy5wdXNoKFwidHJhbnNsYXRlKFwiICsgeGIgKyBweENvbW1hICsgeWIgKyBweFBhcmVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByb3RhdGUoYSwgYiwgcywgcSkge1xuICAgIGlmIChhICE9PSBiKSB7XG4gICAgICBpZiAoYSAtIGIgPiAxODApIGIgKz0gMzYwOyBlbHNlIGlmIChiIC0gYSA+IDE4MCkgYSArPSAzNjA7IC8vIHNob3J0ZXN0IHBhdGhcbiAgICAgIHEucHVzaCh7aTogcy5wdXNoKHBvcChzKSArIFwicm90YXRlKFwiLCBudWxsLCBkZWdQYXJlbikgLSAyLCB4OiBudW1iZXIoYSwgYil9KTtcbiAgICB9IGVsc2UgaWYgKGIpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInJvdGF0ZShcIiArIGIgKyBkZWdQYXJlbik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2tld1goYSwgYiwgcywgcSkge1xuICAgIGlmIChhICE9PSBiKSB7XG4gICAgICBxLnB1c2goe2k6IHMucHVzaChwb3AocykgKyBcInNrZXdYKFwiLCBudWxsLCBkZWdQYXJlbikgLSAyLCB4OiBudW1iZXIoYSwgYil9KTtcbiAgICB9IGVsc2UgaWYgKGIpIHtcbiAgICAgIHMucHVzaChwb3AocykgKyBcInNrZXdYKFwiICsgYiArIGRlZ1BhcmVuKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzY2FsZSh4YSwgeWEsIHhiLCB5YiwgcywgcSkge1xuICAgIGlmICh4YSAhPT0geGIgfHwgeWEgIT09IHliKSB7XG4gICAgICB2YXIgaSA9IHMucHVzaChwb3AocykgKyBcInNjYWxlKFwiLCBudWxsLCBcIixcIiwgbnVsbCwgXCIpXCIpO1xuICAgICAgcS5wdXNoKHtpOiBpIC0gNCwgeDogbnVtYmVyKHhhLCB4Yil9LCB7aTogaSAtIDIsIHg6IG51bWJlcih5YSwgeWIpfSk7XG4gICAgfSBlbHNlIGlmICh4YiAhPT0gMSB8fCB5YiAhPT0gMSkge1xuICAgICAgcy5wdXNoKHBvcChzKSArIFwic2NhbGUoXCIgKyB4YiArIFwiLFwiICsgeWIgKyBcIilcIik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIGIpIHtcbiAgICB2YXIgcyA9IFtdLCAvLyBzdHJpbmcgY29uc3RhbnRzIGFuZCBwbGFjZWhvbGRlcnNcbiAgICAgICAgcSA9IFtdOyAvLyBudW1iZXIgaW50ZXJwb2xhdG9yc1xuICAgIGEgPSBwYXJzZShhKSwgYiA9IHBhcnNlKGIpO1xuICAgIHRyYW5zbGF0ZShhLnRyYW5zbGF0ZVgsIGEudHJhbnNsYXRlWSwgYi50cmFuc2xhdGVYLCBiLnRyYW5zbGF0ZVksIHMsIHEpO1xuICAgIHJvdGF0ZShhLnJvdGF0ZSwgYi5yb3RhdGUsIHMsIHEpO1xuICAgIHNrZXdYKGEuc2tld1gsIGIuc2tld1gsIHMsIHEpO1xuICAgIHNjYWxlKGEuc2NhbGVYLCBhLnNjYWxlWSwgYi5zY2FsZVgsIGIuc2NhbGVZLCBzLCBxKTtcbiAgICBhID0gYiA9IG51bGw7IC8vIGdjXG4gICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgIHZhciBpID0gLTEsIG4gPSBxLmxlbmd0aCwgbztcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBzWyhvID0gcVtpXSkuaV0gPSBvLngodCk7XG4gICAgICByZXR1cm4gcy5qb2luKFwiXCIpO1xuICAgIH07XG4gIH07XG59XG5cbmV4cG9ydCB2YXIgaW50ZXJwb2xhdGVUcmFuc2Zvcm1Dc3MgPSBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZUNzcywgXCJweCwgXCIsIFwicHgpXCIsIFwiZGVnKVwiKTtcbmV4cG9ydCB2YXIgaW50ZXJwb2xhdGVUcmFuc2Zvcm1TdmcgPSBpbnRlcnBvbGF0ZVRyYW5zZm9ybShwYXJzZVN2ZywgXCIsIFwiLCBcIilcIiwgXCIpXCIpO1xuIiwidmFyIGZyYW1lID0gMCwgLy8gaXMgYW4gYW5pbWF0aW9uIGZyYW1lIHBlbmRpbmc/XG4gICAgdGltZW91dCA9IDAsIC8vIGlzIGEgdGltZW91dCBwZW5kaW5nP1xuICAgIGludGVydmFsID0gMCwgLy8gYXJlIGFueSB0aW1lcnMgYWN0aXZlP1xuICAgIHBva2VEZWxheSA9IDEwMDAsIC8vIGhvdyBmcmVxdWVudGx5IHdlIGNoZWNrIGZvciBjbG9jayBza2V3XG4gICAgdGFza0hlYWQsXG4gICAgdGFza1RhaWwsXG4gICAgY2xvY2tMYXN0ID0gMCxcbiAgICBjbG9ja05vdyA9IDAsXG4gICAgY2xvY2tTa2V3ID0gMCxcbiAgICBjbG9jayA9IHR5cGVvZiBwZXJmb3JtYW5jZSA9PT0gXCJvYmplY3RcIiAmJiBwZXJmb3JtYW5jZS5ub3cgPyBwZXJmb3JtYW5jZSA6IERhdGUsXG4gICAgc2V0RnJhbWUgPSB0eXBlb2Ygd2luZG93ID09PSBcIm9iamVjdFwiICYmIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPyB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQod2luZG93KSA6IGZ1bmN0aW9uKGYpIHsgc2V0VGltZW91dChmLCAxNyk7IH07XG5cbmV4cG9ydCBmdW5jdGlvbiBub3coKSB7XG4gIHJldHVybiBjbG9ja05vdyB8fCAoc2V0RnJhbWUoY2xlYXJOb3cpLCBjbG9ja05vdyA9IGNsb2NrLm5vdygpICsgY2xvY2tTa2V3KTtcbn1cblxuZnVuY3Rpb24gY2xlYXJOb3coKSB7XG4gIGNsb2NrTm93ID0gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFRpbWVyKCkge1xuICB0aGlzLl9jYWxsID1cbiAgdGhpcy5fdGltZSA9XG4gIHRoaXMuX25leHQgPSBudWxsO1xufVxuXG5UaW1lci5wcm90b3R5cGUgPSB0aW1lci5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUaW1lcixcbiAgcmVzdGFydDogZnVuY3Rpb24oY2FsbGJhY2ssIGRlbGF5LCB0aW1lKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiY2FsbGJhY2sgaXMgbm90IGEgZnVuY3Rpb25cIik7XG4gICAgdGltZSA9ICh0aW1lID09IG51bGwgPyBub3coKSA6ICt0aW1lKSArIChkZWxheSA9PSBudWxsID8gMCA6ICtkZWxheSk7XG4gICAgaWYgKCF0aGlzLl9uZXh0ICYmIHRhc2tUYWlsICE9PSB0aGlzKSB7XG4gICAgICBpZiAodGFza1RhaWwpIHRhc2tUYWlsLl9uZXh0ID0gdGhpcztcbiAgICAgIGVsc2UgdGFza0hlYWQgPSB0aGlzO1xuICAgICAgdGFza1RhaWwgPSB0aGlzO1xuICAgIH1cbiAgICB0aGlzLl9jYWxsID0gY2FsbGJhY2s7XG4gICAgdGhpcy5fdGltZSA9IHRpbWU7XG4gICAgc2xlZXAoKTtcbiAgfSxcbiAgc3RvcDogZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuX2NhbGwpIHtcbiAgICAgIHRoaXMuX2NhbGwgPSBudWxsO1xuICAgICAgdGhpcy5fdGltZSA9IEluZmluaXR5O1xuICAgICAgc2xlZXAoKTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lcihjYWxsYmFjaywgZGVsYXksIHRpbWUpIHtcbiAgdmFyIHQgPSBuZXcgVGltZXI7XG4gIHQucmVzdGFydChjYWxsYmFjaywgZGVsYXksIHRpbWUpO1xuICByZXR1cm4gdDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRpbWVyRmx1c2goKSB7XG4gIG5vdygpOyAvLyBHZXQgdGhlIGN1cnJlbnQgdGltZSwgaWYgbm90IGFscmVhZHkgc2V0LlxuICArK2ZyYW1lOyAvLyBQcmV0ZW5kIHdl4oCZdmUgc2V0IGFuIGFsYXJtLCBpZiB3ZSBoYXZlbuKAmXQgYWxyZWFkeS5cbiAgdmFyIHQgPSB0YXNrSGVhZCwgZTtcbiAgd2hpbGUgKHQpIHtcbiAgICBpZiAoKGUgPSBjbG9ja05vdyAtIHQuX3RpbWUpID49IDApIHQuX2NhbGwuY2FsbCh1bmRlZmluZWQsIGUpO1xuICAgIHQgPSB0Ll9uZXh0O1xuICB9XG4gIC0tZnJhbWU7XG59XG5cbmZ1bmN0aW9uIHdha2UoKSB7XG4gIGNsb2NrTm93ID0gKGNsb2NrTGFzdCA9IGNsb2NrLm5vdygpKSArIGNsb2NrU2tldztcbiAgZnJhbWUgPSB0aW1lb3V0ID0gMDtcbiAgdHJ5IHtcbiAgICB0aW1lckZsdXNoKCk7XG4gIH0gZmluYWxseSB7XG4gICAgZnJhbWUgPSAwO1xuICAgIG5hcCgpO1xuICAgIGNsb2NrTm93ID0gMDtcbiAgfVxufVxuXG5mdW5jdGlvbiBwb2tlKCkge1xuICB2YXIgbm93ID0gY2xvY2subm93KCksIGRlbGF5ID0gbm93IC0gY2xvY2tMYXN0O1xuICBpZiAoZGVsYXkgPiBwb2tlRGVsYXkpIGNsb2NrU2tldyAtPSBkZWxheSwgY2xvY2tMYXN0ID0gbm93O1xufVxuXG5mdW5jdGlvbiBuYXAoKSB7XG4gIHZhciB0MCwgdDEgPSB0YXNrSGVhZCwgdDIsIHRpbWUgPSBJbmZpbml0eTtcbiAgd2hpbGUgKHQxKSB7XG4gICAgaWYgKHQxLl9jYWxsKSB7XG4gICAgICBpZiAodGltZSA+IHQxLl90aW1lKSB0aW1lID0gdDEuX3RpbWU7XG4gICAgICB0MCA9IHQxLCB0MSA9IHQxLl9uZXh0O1xuICAgIH0gZWxzZSB7XG4gICAgICB0MiA9IHQxLl9uZXh0LCB0MS5fbmV4dCA9IG51bGw7XG4gICAgICB0MSA9IHQwID8gdDAuX25leHQgPSB0MiA6IHRhc2tIZWFkID0gdDI7XG4gICAgfVxuICB9XG4gIHRhc2tUYWlsID0gdDA7XG4gIHNsZWVwKHRpbWUpO1xufVxuXG5mdW5jdGlvbiBzbGVlcCh0aW1lKSB7XG4gIGlmIChmcmFtZSkgcmV0dXJuOyAvLyBTb29uZXN0IGFsYXJtIGFscmVhZHkgc2V0LCBvciB3aWxsIGJlLlxuICBpZiAodGltZW91dCkgdGltZW91dCA9IGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgdmFyIGRlbGF5ID0gdGltZSAtIGNsb2NrTm93OyAvLyBTdHJpY3RseSBsZXNzIHRoYW4gaWYgd2UgcmVjb21wdXRlZCBjbG9ja05vdy5cbiAgaWYgKGRlbGF5ID4gMjQpIHtcbiAgICBpZiAodGltZSA8IEluZmluaXR5KSB0aW1lb3V0ID0gc2V0VGltZW91dCh3YWtlLCB0aW1lIC0gY2xvY2subm93KCkgLSBjbG9ja1NrZXcpO1xuICAgIGlmIChpbnRlcnZhbCkgaW50ZXJ2YWwgPSBjbGVhckludGVydmFsKGludGVydmFsKTtcbiAgfSBlbHNlIHtcbiAgICBpZiAoIWludGVydmFsKSBjbG9ja0xhc3QgPSBjbG9jay5ub3coKSwgaW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChwb2tlLCBwb2tlRGVsYXkpO1xuICAgIGZyYW1lID0gMSwgc2V0RnJhbWUod2FrZSk7XG4gIH1cbn1cbiIsImltcG9ydCB7VGltZXJ9IGZyb20gXCIuL3RpbWVyLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGNhbGxiYWNrLCBkZWxheSwgdGltZSkge1xuICB2YXIgdCA9IG5ldyBUaW1lcjtcbiAgZGVsYXkgPSBkZWxheSA9PSBudWxsID8gMCA6ICtkZWxheTtcbiAgdC5yZXN0YXJ0KGVsYXBzZWQgPT4ge1xuICAgIHQuc3RvcCgpO1xuICAgIGNhbGxiYWNrKGVsYXBzZWQgKyBkZWxheSk7XG4gIH0sIGRlbGF5LCB0aW1lKTtcbiAgcmV0dXJuIHQ7XG59XG4iLCJpbXBvcnQge2Rpc3BhdGNofSBmcm9tIFwiZDMtZGlzcGF0Y2hcIjtcbmltcG9ydCB7dGltZXIsIHRpbWVvdXR9IGZyb20gXCJkMy10aW1lclwiO1xuXG52YXIgZW1wdHlPbiA9IGRpc3BhdGNoKFwic3RhcnRcIiwgXCJlbmRcIiwgXCJjYW5jZWxcIiwgXCJpbnRlcnJ1cHRcIik7XG52YXIgZW1wdHlUd2VlbiA9IFtdO1xuXG5leHBvcnQgdmFyIENSRUFURUQgPSAwO1xuZXhwb3J0IHZhciBTQ0hFRFVMRUQgPSAxO1xuZXhwb3J0IHZhciBTVEFSVElORyA9IDI7XG5leHBvcnQgdmFyIFNUQVJURUQgPSAzO1xuZXhwb3J0IHZhciBSVU5OSU5HID0gNDtcbmV4cG9ydCB2YXIgRU5ESU5HID0gNTtcbmV4cG9ydCB2YXIgRU5ERUQgPSA2O1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihub2RlLCBuYW1lLCBpZCwgaW5kZXgsIGdyb3VwLCB0aW1pbmcpIHtcbiAgdmFyIHNjaGVkdWxlcyA9IG5vZGUuX190cmFuc2l0aW9uO1xuICBpZiAoIXNjaGVkdWxlcykgbm9kZS5fX3RyYW5zaXRpb24gPSB7fTtcbiAgZWxzZSBpZiAoaWQgaW4gc2NoZWR1bGVzKSByZXR1cm47XG4gIGNyZWF0ZShub2RlLCBpZCwge1xuICAgIG5hbWU6IG5hbWUsXG4gICAgaW5kZXg6IGluZGV4LCAvLyBGb3IgY29udGV4dCBkdXJpbmcgY2FsbGJhY2suXG4gICAgZ3JvdXA6IGdyb3VwLCAvLyBGb3IgY29udGV4dCBkdXJpbmcgY2FsbGJhY2suXG4gICAgb246IGVtcHR5T24sXG4gICAgdHdlZW46IGVtcHR5VHdlZW4sXG4gICAgdGltZTogdGltaW5nLnRpbWUsXG4gICAgZGVsYXk6IHRpbWluZy5kZWxheSxcbiAgICBkdXJhdGlvbjogdGltaW5nLmR1cmF0aW9uLFxuICAgIGVhc2U6IHRpbWluZy5lYXNlLFxuICAgIHRpbWVyOiBudWxsLFxuICAgIHN0YXRlOiBDUkVBVEVEXG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBnZXQobm9kZSwgaWQpO1xuICBpZiAoc2NoZWR1bGUuc3RhdGUgPiBDUkVBVEVEKSB0aHJvdyBuZXcgRXJyb3IoXCJ0b28gbGF0ZTsgYWxyZWFkeSBzY2hlZHVsZWRcIik7XG4gIHJldHVybiBzY2hlZHVsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldChub2RlLCBpZCkge1xuICB2YXIgc2NoZWR1bGUgPSBnZXQobm9kZSwgaWQpO1xuICBpZiAoc2NoZWR1bGUuc3RhdGUgPiBTVEFSVEVEKSB0aHJvdyBuZXcgRXJyb3IoXCJ0b28gbGF0ZTsgYWxyZWFkeSBydW5uaW5nXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXQobm9kZSwgaWQpIHtcbiAgdmFyIHNjaGVkdWxlID0gbm9kZS5fX3RyYW5zaXRpb247XG4gIGlmICghc2NoZWR1bGUgfHwgIShzY2hlZHVsZSA9IHNjaGVkdWxlW2lkXSkpIHRocm93IG5ldyBFcnJvcihcInRyYW5zaXRpb24gbm90IGZvdW5kXCIpO1xuICByZXR1cm4gc2NoZWR1bGU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZShub2RlLCBpZCwgc2VsZikge1xuICB2YXIgc2NoZWR1bGVzID0gbm9kZS5fX3RyYW5zaXRpb24sXG4gICAgICB0d2VlbjtcblxuICAvLyBJbml0aWFsaXplIHRoZSBzZWxmIHRpbWVyIHdoZW4gdGhlIHRyYW5zaXRpb24gaXMgY3JlYXRlZC5cbiAgLy8gTm90ZSB0aGUgYWN0dWFsIGRlbGF5IGlzIG5vdCBrbm93biB1bnRpbCB0aGUgZmlyc3QgY2FsbGJhY2shXG4gIHNjaGVkdWxlc1tpZF0gPSBzZWxmO1xuICBzZWxmLnRpbWVyID0gdGltZXIoc2NoZWR1bGUsIDAsIHNlbGYudGltZSk7XG5cbiAgZnVuY3Rpb24gc2NoZWR1bGUoZWxhcHNlZCkge1xuICAgIHNlbGYuc3RhdGUgPSBTQ0hFRFVMRUQ7XG4gICAgc2VsZi50aW1lci5yZXN0YXJ0KHN0YXJ0LCBzZWxmLmRlbGF5LCBzZWxmLnRpbWUpO1xuXG4gICAgLy8gSWYgdGhlIGVsYXBzZWQgZGVsYXkgaXMgbGVzcyB0aGFuIG91ciBmaXJzdCBzbGVlcCwgc3RhcnQgaW1tZWRpYXRlbHkuXG4gICAgaWYgKHNlbGYuZGVsYXkgPD0gZWxhcHNlZCkgc3RhcnQoZWxhcHNlZCAtIHNlbGYuZGVsYXkpO1xuICB9XG5cbiAgZnVuY3Rpb24gc3RhcnQoZWxhcHNlZCkge1xuICAgIHZhciBpLCBqLCBuLCBvO1xuXG4gICAgLy8gSWYgdGhlIHN0YXRlIGlzIG5vdCBTQ0hFRFVMRUQsIHRoZW4gd2UgcHJldmlvdXNseSBlcnJvcmVkIG9uIHN0YXJ0LlxuICAgIGlmIChzZWxmLnN0YXRlICE9PSBTQ0hFRFVMRUQpIHJldHVybiBzdG9wKCk7XG5cbiAgICBmb3IgKGkgaW4gc2NoZWR1bGVzKSB7XG4gICAgICBvID0gc2NoZWR1bGVzW2ldO1xuICAgICAgaWYgKG8ubmFtZSAhPT0gc2VsZi5uYW1lKSBjb250aW51ZTtcblxuICAgICAgLy8gV2hpbGUgdGhpcyBlbGVtZW50IGFscmVhZHkgaGFzIGEgc3RhcnRpbmcgdHJhbnNpdGlvbiBkdXJpbmcgdGhpcyBmcmFtZSxcbiAgICAgIC8vIGRlZmVyIHN0YXJ0aW5nIGFuIGludGVycnVwdGluZyB0cmFuc2l0aW9uIHVudGlsIHRoYXQgdHJhbnNpdGlvbiBoYXMgYVxuICAgICAgLy8gY2hhbmNlIHRvIHRpY2sgKGFuZCBwb3NzaWJseSBlbmQpOyBzZWUgZDMvZDMtdHJhbnNpdGlvbiM1NCFcbiAgICAgIGlmIChvLnN0YXRlID09PSBTVEFSVEVEKSByZXR1cm4gdGltZW91dChzdGFydCk7XG5cbiAgICAgIC8vIEludGVycnVwdCB0aGUgYWN0aXZlIHRyYW5zaXRpb24sIGlmIGFueS5cbiAgICAgIGlmIChvLnN0YXRlID09PSBSVU5OSU5HKSB7XG4gICAgICAgIG8uc3RhdGUgPSBFTkRFRDtcbiAgICAgICAgby50aW1lci5zdG9wKCk7XG4gICAgICAgIG8ub24uY2FsbChcImludGVycnVwdFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBvLmluZGV4LCBvLmdyb3VwKTtcbiAgICAgICAgZGVsZXRlIHNjaGVkdWxlc1tpXTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2FuY2VsIGFueSBwcmUtZW1wdGVkIHRyYW5zaXRpb25zLlxuICAgICAgZWxzZSBpZiAoK2kgPCBpZCkge1xuICAgICAgICBvLnN0YXRlID0gRU5ERUQ7XG4gICAgICAgIG8udGltZXIuc3RvcCgpO1xuICAgICAgICBvLm9uLmNhbGwoXCJjYW5jZWxcIiwgbm9kZSwgbm9kZS5fX2RhdGFfXywgby5pbmRleCwgby5ncm91cCk7XG4gICAgICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVmZXIgdGhlIGZpcnN0IHRpY2sgdG8gZW5kIG9mIHRoZSBjdXJyZW50IGZyYW1lOyBzZWUgZDMvZDMjMTU3Ni5cbiAgICAvLyBOb3RlIHRoZSB0cmFuc2l0aW9uIG1heSBiZSBjYW5jZWxlZCBhZnRlciBzdGFydCBhbmQgYmVmb3JlIHRoZSBmaXJzdCB0aWNrIVxuICAgIC8vIE5vdGUgdGhpcyBtdXN0IGJlIHNjaGVkdWxlZCBiZWZvcmUgdGhlIHN0YXJ0IGV2ZW50OyBzZWUgZDMvZDMtdHJhbnNpdGlvbiMxNiFcbiAgICAvLyBBc3N1bWluZyB0aGlzIGlzIHN1Y2Nlc3NmdWwsIHN1YnNlcXVlbnQgY2FsbGJhY2tzIGdvIHN0cmFpZ2h0IHRvIHRpY2suXG4gICAgdGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGlmIChzZWxmLnN0YXRlID09PSBTVEFSVEVEKSB7XG4gICAgICAgIHNlbGYuc3RhdGUgPSBSVU5OSU5HO1xuICAgICAgICBzZWxmLnRpbWVyLnJlc3RhcnQodGljaywgc2VsZi5kZWxheSwgc2VsZi50aW1lKTtcbiAgICAgICAgdGljayhlbGFwc2VkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIERpc3BhdGNoIHRoZSBzdGFydCBldmVudC5cbiAgICAvLyBOb3RlIHRoaXMgbXVzdCBiZSBkb25lIGJlZm9yZSB0aGUgdHdlZW4gYXJlIGluaXRpYWxpemVkLlxuICAgIHNlbGYuc3RhdGUgPSBTVEFSVElORztcbiAgICBzZWxmLm9uLmNhbGwoXCJzdGFydFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKTtcbiAgICBpZiAoc2VsZi5zdGF0ZSAhPT0gU1RBUlRJTkcpIHJldHVybjsgLy8gaW50ZXJydXB0ZWRcbiAgICBzZWxmLnN0YXRlID0gU1RBUlRFRDtcblxuICAgIC8vIEluaXRpYWxpemUgdGhlIHR3ZWVuLCBkZWxldGluZyBudWxsIHR3ZWVuLlxuICAgIHR3ZWVuID0gbmV3IEFycmF5KG4gPSBzZWxmLnR3ZWVuLmxlbmd0aCk7XG4gICAgZm9yIChpID0gMCwgaiA9IC0xOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobyA9IHNlbGYudHdlZW5baV0udmFsdWUuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBzZWxmLmluZGV4LCBzZWxmLmdyb3VwKSkge1xuICAgICAgICB0d2VlblsrK2pdID0gbztcbiAgICAgIH1cbiAgICB9XG4gICAgdHdlZW4ubGVuZ3RoID0gaiArIDE7XG4gIH1cblxuICBmdW5jdGlvbiB0aWNrKGVsYXBzZWQpIHtcbiAgICB2YXIgdCA9IGVsYXBzZWQgPCBzZWxmLmR1cmF0aW9uID8gc2VsZi5lYXNlLmNhbGwobnVsbCwgZWxhcHNlZCAvIHNlbGYuZHVyYXRpb24pIDogKHNlbGYudGltZXIucmVzdGFydChzdG9wKSwgc2VsZi5zdGF0ZSA9IEVORElORywgMSksXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IHR3ZWVuLmxlbmd0aDtcblxuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICB0d2VlbltpXS5jYWxsKG5vZGUsIHQpO1xuICAgIH1cblxuICAgIC8vIERpc3BhdGNoIHRoZSBlbmQgZXZlbnQuXG4gICAgaWYgKHNlbGYuc3RhdGUgPT09IEVORElORykge1xuICAgICAgc2VsZi5vbi5jYWxsKFwiZW5kXCIsIG5vZGUsIG5vZGUuX19kYXRhX18sIHNlbGYuaW5kZXgsIHNlbGYuZ3JvdXApO1xuICAgICAgc3RvcCgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3AoKSB7XG4gICAgc2VsZi5zdGF0ZSA9IEVOREVEO1xuICAgIHNlbGYudGltZXIuc3RvcCgpO1xuICAgIGRlbGV0ZSBzY2hlZHVsZXNbaWRdO1xuICAgIGZvciAodmFyIGkgaW4gc2NoZWR1bGVzKSByZXR1cm47IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tdW51c2VkLXZhcnNcbiAgICBkZWxldGUgbm9kZS5fX3RyYW5zaXRpb247XG4gIH1cbn1cbiIsImltcG9ydCB7U1RBUlRJTkcsIEVORElORywgRU5ERUR9IGZyb20gXCIuL3RyYW5zaXRpb24vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obm9kZSwgbmFtZSkge1xuICB2YXIgc2NoZWR1bGVzID0gbm9kZS5fX3RyYW5zaXRpb24sXG4gICAgICBzY2hlZHVsZSxcbiAgICAgIGFjdGl2ZSxcbiAgICAgIGVtcHR5ID0gdHJ1ZSxcbiAgICAgIGk7XG5cbiAgaWYgKCFzY2hlZHVsZXMpIHJldHVybjtcblxuICBuYW1lID0gbmFtZSA9PSBudWxsID8gbnVsbCA6IG5hbWUgKyBcIlwiO1xuXG4gIGZvciAoaSBpbiBzY2hlZHVsZXMpIHtcbiAgICBpZiAoKHNjaGVkdWxlID0gc2NoZWR1bGVzW2ldKS5uYW1lICE9PSBuYW1lKSB7IGVtcHR5ID0gZmFsc2U7IGNvbnRpbnVlOyB9XG4gICAgYWN0aXZlID0gc2NoZWR1bGUuc3RhdGUgPiBTVEFSVElORyAmJiBzY2hlZHVsZS5zdGF0ZSA8IEVORElORztcbiAgICBzY2hlZHVsZS5zdGF0ZSA9IEVOREVEO1xuICAgIHNjaGVkdWxlLnRpbWVyLnN0b3AoKTtcbiAgICBzY2hlZHVsZS5vbi5jYWxsKGFjdGl2ZSA/IFwiaW50ZXJydXB0XCIgOiBcImNhbmNlbFwiLCBub2RlLCBub2RlLl9fZGF0YV9fLCBzY2hlZHVsZS5pbmRleCwgc2NoZWR1bGUuZ3JvdXApO1xuICAgIGRlbGV0ZSBzY2hlZHVsZXNbaV07XG4gIH1cblxuICBpZiAoZW1wdHkpIGRlbGV0ZSBub2RlLl9fdHJhbnNpdGlvbjtcbn1cbiIsImltcG9ydCBpbnRlcnJ1cHQgZnJvbSBcIi4uL2ludGVycnVwdC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgaW50ZXJydXB0KHRoaXMsIG5hbWUpO1xuICB9KTtcbn1cbiIsImltcG9ydCB7Z2V0LCBzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIHR3ZWVuUmVtb3ZlKGlkLCBuYW1lKSB7XG4gIHZhciB0d2VlbjAsIHR3ZWVuMTtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzY2hlZHVsZSA9IHNldCh0aGlzLCBpZCksXG4gICAgICAgIHR3ZWVuID0gc2NoZWR1bGUudHdlZW47XG5cbiAgICAvLyBJZiB0aGlzIG5vZGUgc2hhcmVkIHR3ZWVuIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIHR3ZWVuIGFuZCB3ZeKAmXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmICh0d2VlbiAhPT0gdHdlZW4wKSB7XG4gICAgICB0d2VlbjEgPSB0d2VlbjAgPSB0d2VlbjtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gdHdlZW4xLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgICAgICBpZiAodHdlZW4xW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgICAgICB0d2VlbjEgPSB0d2VlbjEuc2xpY2UoKTtcbiAgICAgICAgICB0d2VlbjEuc3BsaWNlKGksIDEpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2NoZWR1bGUudHdlZW4gPSB0d2VlbjE7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHR3ZWVuRnVuY3Rpb24oaWQsIG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0d2VlbjAsIHR3ZWVuMTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICB0d2VlbiA9IHNjaGVkdWxlLnR3ZWVuO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCB0d2VlbiB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCB0d2VlbiBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAodHdlZW4gIT09IHR3ZWVuMCkge1xuICAgICAgdHdlZW4xID0gKHR3ZWVuMCA9IHR3ZWVuKS5zbGljZSgpO1xuICAgICAgZm9yICh2YXIgdCA9IHtuYW1lOiBuYW1lLCB2YWx1ZTogdmFsdWV9LCBpID0gMCwgbiA9IHR3ZWVuMS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgaWYgKHR3ZWVuMVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgICAgdHdlZW4xW2ldID0gdDtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGkgPT09IG4pIHR3ZWVuMS5wdXNoKHQpO1xuICAgIH1cblxuICAgIHNjaGVkdWxlLnR3ZWVuID0gdHdlZW4xO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICBuYW1lICs9IFwiXCI7XG5cbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgdmFyIHR3ZWVuID0gZ2V0KHRoaXMubm9kZSgpLCBpZCkudHdlZW47XG4gICAgZm9yICh2YXIgaSA9IDAsIG4gPSB0d2Vlbi5sZW5ndGgsIHQ7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgodCA9IHR3ZWVuW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIHJldHVybiB0LnZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIHJldHVybiB0aGlzLmVhY2goKHZhbHVlID09IG51bGwgPyB0d2VlblJlbW92ZSA6IHR3ZWVuRnVuY3Rpb24pKGlkLCBuYW1lLCB2YWx1ZSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHdlZW5WYWx1ZSh0cmFuc2l0aW9uLCBuYW1lLCB2YWx1ZSkge1xuICB2YXIgaWQgPSB0cmFuc2l0aW9uLl9pZDtcblxuICB0cmFuc2l0aW9uLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKTtcbiAgICAoc2NoZWR1bGUudmFsdWUgfHwgKHNjaGVkdWxlLnZhbHVlID0ge30pKVtuYW1lXSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gIH0pO1xuXG4gIHJldHVybiBmdW5jdGlvbihub2RlKSB7XG4gICAgcmV0dXJuIGdldChub2RlLCBpZCkudmFsdWVbbmFtZV07XG4gIH07XG59XG4iLCJpbXBvcnQge2NvbG9yfSBmcm9tIFwiZDMtY29sb3JcIjtcbmltcG9ydCB7aW50ZXJwb2xhdGVOdW1iZXIsIGludGVycG9sYXRlUmdiLCBpbnRlcnBvbGF0ZVN0cmluZ30gZnJvbSBcImQzLWludGVycG9sYXRlXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKGEsIGIpIHtcbiAgdmFyIGM7XG4gIHJldHVybiAodHlwZW9mIGIgPT09IFwibnVtYmVyXCIgPyBpbnRlcnBvbGF0ZU51bWJlclxuICAgICAgOiBiIGluc3RhbmNlb2YgY29sb3IgPyBpbnRlcnBvbGF0ZVJnYlxuICAgICAgOiAoYyA9IGNvbG9yKGIpKSA/IChiID0gYywgaW50ZXJwb2xhdGVSZ2IpXG4gICAgICA6IGludGVycG9sYXRlU3RyaW5nKShhLCBiKTtcbn1cbiIsImltcG9ydCB7aW50ZXJwb2xhdGVUcmFuc2Zvcm1TdmcgYXMgaW50ZXJwb2xhdGVUcmFuc2Zvcm19IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtuYW1lc3BhY2V9IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCB7dHdlZW5WYWx1ZX0gZnJvbSBcIi4vdHdlZW4uanNcIjtcbmltcG9ydCBpbnRlcnBvbGF0ZSBmcm9tIFwiLi9pbnRlcnBvbGF0ZS5qc1wiO1xuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlKG5hbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyUmVtb3ZlTlMoZnVsbG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckNvbnN0YW50KG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZTEpIHtcbiAgdmFyIHN0cmluZzAwLFxuICAgICAgc3RyaW5nMSA9IHZhbHVlMSArIFwiXCIsXG4gICAgICBpbnRlcnBvbGF0ZTA7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyQ29uc3RhbnROUyhmdWxsbmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhdHRyRnVuY3Rpb24obmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAsIHZhbHVlMSA9IHZhbHVlKHRoaXMpLCBzdHJpbmcxO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgcmV0dXJuIHZvaWQgdGhpcy5yZW1vdmVBdHRyaWJ1dGUobmFtZSk7XG4gICAgc3RyaW5nMCA9IHRoaXMuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYXR0ckZ1bmN0aW9uTlMoZnVsbG5hbWUsIGludGVycG9sYXRlLCB2YWx1ZSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxMCxcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwLCB2YWx1ZTEgPSB2YWx1ZSh0aGlzKSwgc3RyaW5nMTtcbiAgICBpZiAodmFsdWUxID09IG51bGwpIHJldHVybiB2b2lkIHRoaXMucmVtb3ZlQXR0cmlidXRlTlMoZnVsbG5hbWUuc3BhY2UsIGZ1bGxuYW1lLmxvY2FsKTtcbiAgICBzdHJpbmcwID0gdGhpcy5nZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwpO1xuICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIHJldHVybiBzdHJpbmcwID09PSBzdHJpbmcxID8gbnVsbFxuICAgICAgICA6IHN0cmluZzAgPT09IHN0cmluZzAwICYmIHN0cmluZzEgPT09IHN0cmluZzEwID8gaW50ZXJwb2xhdGUwXG4gICAgICAgIDogKHN0cmluZzEwID0gc3RyaW5nMSwgaW50ZXJwb2xhdGUwID0gaW50ZXJwb2xhdGUoc3RyaW5nMDAgPSBzdHJpbmcwLCB2YWx1ZTEpKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgdmFyIGZ1bGxuYW1lID0gbmFtZXNwYWNlKG5hbWUpLCBpID0gZnVsbG5hbWUgPT09IFwidHJhbnNmb3JtXCIgPyBpbnRlcnBvbGF0ZVRyYW5zZm9ybSA6IGludGVycG9sYXRlO1xuICByZXR1cm4gdGhpcy5hdHRyVHdlZW4obmFtZSwgdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgID8gKGZ1bGxuYW1lLmxvY2FsID8gYXR0ckZ1bmN0aW9uTlMgOiBhdHRyRnVuY3Rpb24pKGZ1bGxuYW1lLCBpLCB0d2VlblZhbHVlKHRoaXMsIFwiYXR0ci5cIiArIG5hbWUsIHZhbHVlKSlcbiAgICAgIDogdmFsdWUgPT0gbnVsbCA/IChmdWxsbmFtZS5sb2NhbCA/IGF0dHJSZW1vdmVOUyA6IGF0dHJSZW1vdmUpKGZ1bGxuYW1lKVxuICAgICAgOiAoZnVsbG5hbWUubG9jYWwgPyBhdHRyQ29uc3RhbnROUyA6IGF0dHJDb25zdGFudCkoZnVsbG5hbWUsIGksIHZhbHVlKSk7XG59XG4iLCJpbXBvcnQge25hbWVzcGFjZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuXG5mdW5jdGlvbiBhdHRySW50ZXJwb2xhdGUobmFtZSwgaSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc2V0QXR0cmlidXRlKG5hbWUsIGkuY2FsbCh0aGlzLCB0KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJJbnRlcnBvbGF0ZU5TKGZ1bGxuYW1lLCBpKSB7XG4gIHJldHVybiBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5zZXRBdHRyaWJ1dGVOUyhmdWxsbmFtZS5zcGFjZSwgZnVsbG5hbWUubG9jYWwsIGkuY2FsbCh0aGlzLCB0KSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGF0dHJUd2Vlbk5TKGZ1bGxuYW1lLCB2YWx1ZSkge1xuICB2YXIgdDAsIGkwO1xuICBmdW5jdGlvbiB0d2VlbigpIHtcbiAgICB2YXIgaSA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKGkgIT09IGkwKSB0MCA9IChpMCA9IGkpICYmIGF0dHJJbnRlcnBvbGF0ZU5TKGZ1bGxuYW1lLCBpKTtcbiAgICByZXR1cm4gdDA7XG4gIH1cbiAgdHdlZW4uX3ZhbHVlID0gdmFsdWU7XG4gIHJldHVybiB0d2Vlbjtcbn1cblxuZnVuY3Rpb24gYXR0clR3ZWVuKG5hbWUsIHZhbHVlKSB7XG4gIHZhciB0MCwgaTA7XG4gIGZ1bmN0aW9uIHR3ZWVuKCkge1xuICAgIHZhciBpID0gdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICBpZiAoaSAhPT0gaTApIHQwID0gKGkwID0gaSkgJiYgYXR0ckludGVycG9sYXRlKG5hbWUsIGkpO1xuICAgIHJldHVybiB0MDtcbiAgfVxuICB0d2Vlbi5fdmFsdWUgPSB2YWx1ZTtcbiAgcmV0dXJuIHR3ZWVuO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICB2YXIga2V5ID0gXCJhdHRyLlwiICsgbmFtZTtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICB2YXIgZnVsbG5hbWUgPSBuYW1lc3BhY2UobmFtZSk7XG4gIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgKGZ1bGxuYW1lLmxvY2FsID8gYXR0clR3ZWVuTlMgOiBhdHRyVHdlZW4pKGZ1bGxuYW1lLCB2YWx1ZSkpO1xufVxuIiwiaW1wb3J0IHtnZXQsIGluaXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmZ1bmN0aW9uIGRlbGF5RnVuY3Rpb24oaWQsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICBpbml0KHRoaXMsIGlkKS5kZWxheSA9ICt2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBkZWxheUNvbnN0YW50KGlkLCB2YWx1ZSkge1xuICByZXR1cm4gdmFsdWUgPSArdmFsdWUsIGZ1bmN0aW9uKCkge1xuICAgIGluaXQodGhpcywgaWQpLmRlbGF5ID0gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCgodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGRlbGF5RnVuY3Rpb25cbiAgICAgICAgICA6IGRlbGF5Q29uc3RhbnQpKGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmRlbGF5O1xufVxuIiwiaW1wb3J0IHtnZXQsIHNldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZHVyYXRpb25GdW5jdGlvbihpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZHVyYXRpb24gPSArdmFsdWUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZHVyYXRpb25Db25zdGFudChpZCwgdmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlID0gK3ZhbHVlLCBmdW5jdGlvbigpIHtcbiAgICBzZXQodGhpcywgaWQpLmR1cmF0aW9uID0gdmFsdWU7XG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBpZCA9IHRoaXMuX2lkO1xuXG4gIHJldHVybiBhcmd1bWVudHMubGVuZ3RoXG4gICAgICA/IHRoaXMuZWFjaCgodHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCJcbiAgICAgICAgICA/IGR1cmF0aW9uRnVuY3Rpb25cbiAgICAgICAgICA6IGR1cmF0aW9uQ29uc3RhbnQpKGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmR1cmF0aW9uO1xufVxuIiwiaW1wb3J0IHtnZXQsIHNldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZWFzZUNvbnN0YW50KGlkLCB2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHNldCh0aGlzLCBpZCkuZWFzZSA9IHZhbHVlO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aFxuICAgICAgPyB0aGlzLmVhY2goZWFzZUNvbnN0YW50KGlkLCB2YWx1ZSkpXG4gICAgICA6IGdldCh0aGlzLm5vZGUoKSwgaWQpLmVhc2U7XG59XG4iLCJpbXBvcnQge3NldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZnVuY3Rpb24gZWFzZVZhcnlpbmcoaWQsIHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdiA9IHZhbHVlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgaWYgKHR5cGVvZiB2ICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgICBzZXQodGhpcywgaWQpLmVhc2UgPSB2O1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih2YWx1ZSkge1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcjtcbiAgcmV0dXJuIHRoaXMuZWFjaChlYXNlVmFyeWluZyh0aGlzLl9pZCwgdmFsdWUpKTtcbn1cbiIsImltcG9ydCB7bWF0Y2hlcn0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihtYXRjaCkge1xuICBpZiAodHlwZW9mIG1hdGNoICE9PSBcImZ1bmN0aW9uXCIpIG1hdGNoID0gbWF0Y2hlcihtYXRjaCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IFtdLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKChub2RlID0gZ3JvdXBbaV0pICYmIG1hdGNoLmNhbGwobm9kZSwgbm9kZS5fX2RhdGFfXywgaSwgZ3JvdXApKSB7XG4gICAgICAgIHN1Ymdyb3VwLnB1c2gobm9kZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKHN1Ymdyb3VwcywgdGhpcy5fcGFyZW50cywgdGhpcy5fbmFtZSwgdGhpcy5faWQpO1xufVxuIiwiaW1wb3J0IHtUcmFuc2l0aW9ufSBmcm9tIFwiLi9pbmRleC5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbih0cmFuc2l0aW9uKSB7XG4gIGlmICh0cmFuc2l0aW9uLl9pZCAhPT0gdGhpcy5faWQpIHRocm93IG5ldyBFcnJvcjtcblxuICBmb3IgKHZhciBncm91cHMwID0gdGhpcy5fZ3JvdXBzLCBncm91cHMxID0gdHJhbnNpdGlvbi5fZ3JvdXBzLCBtMCA9IGdyb3VwczAubGVuZ3RoLCBtMSA9IGdyb3VwczEubGVuZ3RoLCBtID0gTWF0aC5taW4obTAsIG0xKSwgbWVyZ2VzID0gbmV3IEFycmF5KG0wKSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cDAgPSBncm91cHMwW2pdLCBncm91cDEgPSBncm91cHMxW2pdLCBuID0gZ3JvdXAwLmxlbmd0aCwgbWVyZ2UgPSBtZXJnZXNbal0gPSBuZXcgQXJyYXkobiksIG5vZGUsIGkgPSAwOyBpIDwgbjsgKytpKSB7XG4gICAgICBpZiAobm9kZSA9IGdyb3VwMFtpXSB8fCBncm91cDFbaV0pIHtcbiAgICAgICAgbWVyZ2VbaV0gPSBub2RlO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBqIDwgbTA7ICsraikge1xuICAgIG1lcmdlc1tqXSA9IGdyb3VwczBbal07XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24obWVyZ2VzLCB0aGlzLl9wYXJlbnRzLCB0aGlzLl9uYW1lLCB0aGlzLl9pZCk7XG59XG4iLCJpbXBvcnQge2dldCwgc2V0LCBpbml0fSBmcm9tIFwiLi9zY2hlZHVsZS5qc1wiO1xuXG5mdW5jdGlvbiBzdGFydChuYW1lKSB7XG4gIHJldHVybiAobmFtZSArIFwiXCIpLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykuZXZlcnkoZnVuY3Rpb24odCkge1xuICAgIHZhciBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICByZXR1cm4gIXQgfHwgdCA9PT0gXCJzdGFydFwiO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gb25GdW5jdGlvbihpZCwgbmFtZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG9uMCwgb24xLCBzaXQgPSBzdGFydChuYW1lKSA/IGluaXQgOiBzZXQ7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2NoZWR1bGUgPSBzaXQodGhpcywgaWQpLFxuICAgICAgICBvbiA9IHNjaGVkdWxlLm9uO1xuXG4gICAgLy8gSWYgdGhpcyBub2RlIHNoYXJlZCBhIGRpc3BhdGNoIHdpdGggdGhlIHByZXZpb3VzIG5vZGUsXG4gICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIGRpc3BhdGNoIGFuZCB3ZeKAmXJlIGRvbmUhXG4gICAgLy8gT3RoZXJ3aXNlLCBjb3B5LW9uLXdyaXRlLlxuICAgIGlmIChvbiAhPT0gb24wKSAob24xID0gKG9uMCA9IG9uKS5jb3B5KCkpLm9uKG5hbWUsIGxpc3RlbmVyKTtcblxuICAgIHNjaGVkdWxlLm9uID0gb24xO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lLCBsaXN0ZW5lcikge1xuICB2YXIgaWQgPSB0aGlzLl9pZDtcblxuICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDJcbiAgICAgID8gZ2V0KHRoaXMubm9kZSgpLCBpZCkub24ub24obmFtZSlcbiAgICAgIDogdGhpcy5lYWNoKG9uRnVuY3Rpb24oaWQsIG5hbWUsIGxpc3RlbmVyKSk7XG59XG4iLCJmdW5jdGlvbiByZW1vdmVGdW5jdGlvbihpZCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBhcmVudCA9IHRoaXMucGFyZW50Tm9kZTtcbiAgICBmb3IgKHZhciBpIGluIHRoaXMuX190cmFuc2l0aW9uKSBpZiAoK2kgIT09IGlkKSByZXR1cm47XG4gICAgaWYgKHBhcmVudCkgcGFyZW50LnJlbW92ZUNoaWxkKHRoaXMpO1xuICB9O1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIHRoaXMub24oXCJlbmQucmVtb3ZlXCIsIHJlbW92ZUZ1bmN0aW9uKHRoaXMuX2lkKSk7XG59XG4iLCJpbXBvcnQge3NlbGVjdG9yfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZCA9IHRoaXMuX2lkO1xuXG4gIGlmICh0eXBlb2Ygc2VsZWN0ICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IHNlbGVjdG9yKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gbmV3IEFycmF5KG0pLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBzdWJncm91cCA9IHN1Ymdyb3Vwc1tqXSA9IG5ldyBBcnJheShuKSwgbm9kZSwgc3Vibm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmICgobm9kZSA9IGdyb3VwW2ldKSAmJiAoc3Vibm9kZSA9IHNlbGVjdC5jYWxsKG5vZGUsIG5vZGUuX19kYXRhX18sIGksIGdyb3VwKSkpIHtcbiAgICAgICAgaWYgKFwiX19kYXRhX19cIiBpbiBub2RlKSBzdWJub2RlLl9fZGF0YV9fID0gbm9kZS5fX2RhdGFfXztcbiAgICAgICAgc3ViZ3JvdXBbaV0gPSBzdWJub2RlO1xuICAgICAgICBzY2hlZHVsZShzdWJncm91cFtpXSwgbmFtZSwgaWQsIGksIHN1Ymdyb3VwLCBnZXQobm9kZSwgaWQpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV3IFRyYW5zaXRpb24oc3ViZ3JvdXBzLCB0aGlzLl9wYXJlbnRzLCBuYW1lLCBpZCk7XG59XG4iLCJpbXBvcnQge3NlbGVjdG9yQWxsfSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQge1RyYW5zaXRpb259IGZyb20gXCIuL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUsIHtnZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHNlbGVjdCkge1xuICB2YXIgbmFtZSA9IHRoaXMuX25hbWUsXG4gICAgICBpZCA9IHRoaXMuX2lkO1xuXG4gIGlmICh0eXBlb2Ygc2VsZWN0ICE9PSBcImZ1bmN0aW9uXCIpIHNlbGVjdCA9IHNlbGVjdG9yQWxsKHNlbGVjdCk7XG5cbiAgZm9yICh2YXIgZ3JvdXBzID0gdGhpcy5fZ3JvdXBzLCBtID0gZ3JvdXBzLmxlbmd0aCwgc3ViZ3JvdXBzID0gW10sIHBhcmVudHMgPSBbXSwgaiA9IDA7IGogPCBtOyArK2opIHtcbiAgICBmb3IgKHZhciBncm91cCA9IGdyb3Vwc1tqXSwgbiA9IGdyb3VwLmxlbmd0aCwgbm9kZSwgaSA9IDA7IGkgPCBuOyArK2kpIHtcbiAgICAgIGlmIChub2RlID0gZ3JvdXBbaV0pIHtcbiAgICAgICAgZm9yICh2YXIgY2hpbGRyZW4gPSBzZWxlY3QuY2FsbChub2RlLCBub2RlLl9fZGF0YV9fLCBpLCBncm91cCksIGNoaWxkLCBpbmhlcml0ID0gZ2V0KG5vZGUsIGlkKSwgayA9IDAsIGwgPSBjaGlsZHJlbi5sZW5ndGg7IGsgPCBsOyArK2spIHtcbiAgICAgICAgICBpZiAoY2hpbGQgPSBjaGlsZHJlbltrXSkge1xuICAgICAgICAgICAgc2NoZWR1bGUoY2hpbGQsIG5hbWUsIGlkLCBrLCBjaGlsZHJlbiwgaW5oZXJpdCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN1Ymdyb3Vwcy5wdXNoKGNoaWxkcmVuKTtcbiAgICAgICAgcGFyZW50cy5wdXNoKG5vZGUpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihzdWJncm91cHMsIHBhcmVudHMsIG5hbWUsIGlkKTtcbn1cbiIsImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5cbnZhciBTZWxlY3Rpb24gPSBzZWxlY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBTZWxlY3Rpb24odGhpcy5fZ3JvdXBzLCB0aGlzLl9wYXJlbnRzKTtcbn1cbiIsImltcG9ydCB7aW50ZXJwb2xhdGVUcmFuc2Zvcm1Dc3MgYXMgaW50ZXJwb2xhdGVUcmFuc2Zvcm19IGZyb20gXCJkMy1pbnRlcnBvbGF0ZVwiO1xuaW1wb3J0IHtzdHlsZX0gZnJvbSBcImQzLXNlbGVjdGlvblwiO1xuaW1wb3J0IHtzZXR9IGZyb20gXCIuL3NjaGVkdWxlLmpzXCI7XG5pbXBvcnQge3R3ZWVuVmFsdWV9IGZyb20gXCIuL3R3ZWVuLmpzXCI7XG5pbXBvcnQgaW50ZXJwb2xhdGUgZnJvbSBcIi4vaW50ZXJwb2xhdGUuanNcIjtcblxuZnVuY3Rpb24gc3R5bGVOdWxsKG5hbWUsIGludGVycG9sYXRlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKSxcbiAgICAgICAgc3RyaW5nMSA9ICh0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpLCBzdHlsZSh0aGlzLCBuYW1lKSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHN0cmluZzEwID0gc3RyaW5nMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlUmVtb3ZlKG5hbWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuc3R5bGUucmVtb3ZlUHJvcGVydHkobmFtZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlQ29uc3RhbnQobmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlMSkge1xuICB2YXIgc3RyaW5nMDAsXG4gICAgICBzdHJpbmcxID0gdmFsdWUxICsgXCJcIixcbiAgICAgIGludGVycG9sYXRlMDtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdHJpbmcwID0gc3R5bGUodGhpcywgbmFtZSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlRnVuY3Rpb24obmFtZSwgaW50ZXJwb2xhdGUsIHZhbHVlKSB7XG4gIHZhciBzdHJpbmcwMCxcbiAgICAgIHN0cmluZzEwLFxuICAgICAgaW50ZXJwb2xhdGUwO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHN0cmluZzAgPSBzdHlsZSh0aGlzLCBuYW1lKSxcbiAgICAgICAgdmFsdWUxID0gdmFsdWUodGhpcyksXG4gICAgICAgIHN0cmluZzEgPSB2YWx1ZTEgKyBcIlwiO1xuICAgIGlmICh2YWx1ZTEgPT0gbnVsbCkgc3RyaW5nMSA9IHZhbHVlMSA9ICh0aGlzLnN0eWxlLnJlbW92ZVByb3BlcnR5KG5hbWUpLCBzdHlsZSh0aGlzLCBuYW1lKSk7XG4gICAgcmV0dXJuIHN0cmluZzAgPT09IHN0cmluZzEgPyBudWxsXG4gICAgICAgIDogc3RyaW5nMCA9PT0gc3RyaW5nMDAgJiYgc3RyaW5nMSA9PT0gc3RyaW5nMTAgPyBpbnRlcnBvbGF0ZTBcbiAgICAgICAgOiAoc3RyaW5nMTAgPSBzdHJpbmcxLCBpbnRlcnBvbGF0ZTAgPSBpbnRlcnBvbGF0ZShzdHJpbmcwMCA9IHN0cmluZzAsIHZhbHVlMSkpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBzdHlsZU1heWJlUmVtb3ZlKGlkLCBuYW1lKSB7XG4gIHZhciBvbjAsIG9uMSwgbGlzdGVuZXIwLCBrZXkgPSBcInN0eWxlLlwiICsgbmFtZSwgZXZlbnQgPSBcImVuZC5cIiArIGtleSwgcmVtb3ZlO1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNjaGVkdWxlID0gc2V0KHRoaXMsIGlkKSxcbiAgICAgICAgb24gPSBzY2hlZHVsZS5vbixcbiAgICAgICAgbGlzdGVuZXIgPSBzY2hlZHVsZS52YWx1ZVtrZXldID09IG51bGwgPyByZW1vdmUgfHwgKHJlbW92ZSA9IHN0eWxlUmVtb3ZlKG5hbWUpKSA6IHVuZGVmaW5lZDtcblxuICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgIC8vIGp1c3QgYXNzaWduIHRoZSB1cGRhdGVkIHNoYXJlZCBkaXNwYXRjaCBhbmQgd2XigJlyZSBkb25lIVxuICAgIC8vIE90aGVyd2lzZSwgY29weS1vbi13cml0ZS5cbiAgICBpZiAob24gIT09IG9uMCB8fCBsaXN0ZW5lcjAgIT09IGxpc3RlbmVyKSAob24xID0gKG9uMCA9IG9uKS5jb3B5KCkpLm9uKGV2ZW50LCBsaXN0ZW5lcjAgPSBsaXN0ZW5lcik7XG5cbiAgICBzY2hlZHVsZS5vbiA9IG9uMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciBpID0gKG5hbWUgKz0gXCJcIikgPT09IFwidHJhbnNmb3JtXCIgPyBpbnRlcnBvbGF0ZVRyYW5zZm9ybSA6IGludGVycG9sYXRlO1xuICByZXR1cm4gdmFsdWUgPT0gbnVsbCA/IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlTnVsbChuYW1lLCBpKSlcbiAgICAgIC5vbihcImVuZC5zdHlsZS5cIiArIG5hbWUsIHN0eWxlUmVtb3ZlKG5hbWUpKVxuICAgIDogdHlwZW9mIHZhbHVlID09PSBcImZ1bmN0aW9uXCIgPyB0aGlzXG4gICAgICAuc3R5bGVUd2VlbihuYW1lLCBzdHlsZUZ1bmN0aW9uKG5hbWUsIGksIHR3ZWVuVmFsdWUodGhpcywgXCJzdHlsZS5cIiArIG5hbWUsIHZhbHVlKSkpXG4gICAgICAuZWFjaChzdHlsZU1heWJlUmVtb3ZlKHRoaXMuX2lkLCBuYW1lKSlcbiAgICA6IHRoaXNcbiAgICAgIC5zdHlsZVR3ZWVuKG5hbWUsIHN0eWxlQ29uc3RhbnQobmFtZSwgaSwgdmFsdWUpLCBwcmlvcml0eSlcbiAgICAgIC5vbihcImVuZC5zdHlsZS5cIiArIG5hbWUsIG51bGwpO1xufVxuIiwiZnVuY3Rpb24gc3R5bGVJbnRlcnBvbGF0ZShuYW1lLCBpLCBwcmlvcml0eSkge1xuICByZXR1cm4gZnVuY3Rpb24odCkge1xuICAgIHRoaXMuc3R5bGUuc2V0UHJvcGVydHkobmFtZSwgaS5jYWxsKHRoaXMsIHQpLCBwcmlvcml0eSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHN0eWxlVHdlZW4obmFtZSwgdmFsdWUsIHByaW9yaXR5KSB7XG4gIHZhciB0LCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdCA9IChpMCA9IGkpICYmIHN0eWxlSW50ZXJwb2xhdGUobmFtZSwgaSwgcHJpb3JpdHkpO1xuICAgIHJldHVybiB0O1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKG5hbWUsIHZhbHVlLCBwcmlvcml0eSkge1xuICB2YXIga2V5ID0gXCJzdHlsZS5cIiArIChuYW1lICs9IFwiXCIpO1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHJldHVybiAoa2V5ID0gdGhpcy50d2VlbihrZXkpKSAmJiBrZXkuX3ZhbHVlO1xuICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIHRoaXMudHdlZW4oa2V5LCBudWxsKTtcbiAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3I7XG4gIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgc3R5bGVUd2VlbihuYW1lLCB2YWx1ZSwgcHJpb3JpdHkgPT0gbnVsbCA/IFwiXCIgOiBwcmlvcml0eSkpO1xufVxuIiwiaW1wb3J0IHt0d2VlblZhbHVlfSBmcm9tIFwiLi90d2Vlbi5qc1wiO1xuXG5mdW5jdGlvbiB0ZXh0Q29uc3RhbnQodmFsdWUpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgIHRoaXMudGV4dENvbnRlbnQgPSB2YWx1ZTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gdGV4dEZ1bmN0aW9uKHZhbHVlKSB7XG4gIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWUxID0gdmFsdWUodGhpcyk7XG4gICAgdGhpcy50ZXh0Q29udGVudCA9IHZhbHVlMSA9PSBudWxsID8gXCJcIiA6IHZhbHVlMTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24odmFsdWUpIHtcbiAgcmV0dXJuIHRoaXMudHdlZW4oXCJ0ZXh0XCIsIHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiXG4gICAgICA/IHRleHRGdW5jdGlvbih0d2VlblZhbHVlKHRoaXMsIFwidGV4dFwiLCB2YWx1ZSkpXG4gICAgICA6IHRleHRDb25zdGFudCh2YWx1ZSA9PSBudWxsID8gXCJcIiA6IHZhbHVlICsgXCJcIikpO1xufVxuIiwiZnVuY3Rpb24gdGV4dEludGVycG9sYXRlKGkpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLnRleHRDb250ZW50ID0gaS5jYWxsKHRoaXMsIHQpO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0ZXh0VHdlZW4odmFsdWUpIHtcbiAgdmFyIHQwLCBpMDtcbiAgZnVuY3Rpb24gdHdlZW4oKSB7XG4gICAgdmFyIGkgPSB2YWx1ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIGlmIChpICE9PSBpMCkgdDAgPSAoaTAgPSBpKSAmJiB0ZXh0SW50ZXJwb2xhdGUoaSk7XG4gICAgcmV0dXJuIHQwO1xuICB9XG4gIHR3ZWVuLl92YWx1ZSA9IHZhbHVlO1xuICByZXR1cm4gdHdlZW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uKHZhbHVlKSB7XG4gIHZhciBrZXkgPSBcInRleHRcIjtcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAxKSByZXR1cm4gKGtleSA9IHRoaXMudHdlZW4oa2V5KSkgJiYga2V5Ll92YWx1ZTtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiB0aGlzLnR3ZWVuKGtleSwgbnVsbCk7XG4gIGlmICh0eXBlb2YgdmFsdWUgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yO1xuICByZXR1cm4gdGhpcy50d2VlbihrZXksIHRleHRUd2Vlbih2YWx1ZSkpO1xufVxuIiwiaW1wb3J0IHtUcmFuc2l0aW9uLCBuZXdJZH0gZnJvbSBcIi4vaW5kZXguanNcIjtcbmltcG9ydCBzY2hlZHVsZSwge2dldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBuYW1lID0gdGhpcy5fbmFtZSxcbiAgICAgIGlkMCA9IHRoaXMuX2lkLFxuICAgICAgaWQxID0gbmV3SWQoKTtcblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICB2YXIgaW5oZXJpdCA9IGdldChub2RlLCBpZDApO1xuICAgICAgICBzY2hlZHVsZShub2RlLCBuYW1lLCBpZDEsIGksIGdyb3VwLCB7XG4gICAgICAgICAgdGltZTogaW5oZXJpdC50aW1lICsgaW5oZXJpdC5kZWxheSArIGluaGVyaXQuZHVyYXRpb24sXG4gICAgICAgICAgZGVsYXk6IDAsXG4gICAgICAgICAgZHVyYXRpb246IGluaGVyaXQuZHVyYXRpb24sXG4gICAgICAgICAgZWFzZTogaW5oZXJpdC5lYXNlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXcgVHJhbnNpdGlvbihncm91cHMsIHRoaXMuX3BhcmVudHMsIG5hbWUsIGlkMSk7XG59XG4iLCJpbXBvcnQge3NldH0gZnJvbSBcIi4vc2NoZWR1bGUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24oKSB7XG4gIHZhciBvbjAsIG9uMSwgdGhhdCA9IHRoaXMsIGlkID0gdGhhdC5faWQsIHNpemUgPSB0aGF0LnNpemUoKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHZhciBjYW5jZWwgPSB7dmFsdWU6IHJlamVjdH0sXG4gICAgICAgIGVuZCA9IHt2YWx1ZTogZnVuY3Rpb24oKSB7IGlmICgtLXNpemUgPT09IDApIHJlc29sdmUoKTsgfX07XG5cbiAgICB0aGF0LmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2NoZWR1bGUgPSBzZXQodGhpcywgaWQpLFxuICAgICAgICAgIG9uID0gc2NoZWR1bGUub247XG5cbiAgICAgIC8vIElmIHRoaXMgbm9kZSBzaGFyZWQgYSBkaXNwYXRjaCB3aXRoIHRoZSBwcmV2aW91cyBub2RlLFxuICAgICAgLy8ganVzdCBhc3NpZ24gdGhlIHVwZGF0ZWQgc2hhcmVkIGRpc3BhdGNoIGFuZCB3ZeKAmXJlIGRvbmUhXG4gICAgICAvLyBPdGhlcndpc2UsIGNvcHktb24td3JpdGUuXG4gICAgICBpZiAob24gIT09IG9uMCkge1xuICAgICAgICBvbjEgPSAob24wID0gb24pLmNvcHkoKTtcbiAgICAgICAgb24xLl8uY2FuY2VsLnB1c2goY2FuY2VsKTtcbiAgICAgICAgb24xLl8uaW50ZXJydXB0LnB1c2goY2FuY2VsKTtcbiAgICAgICAgb24xLl8uZW5kLnB1c2goZW5kKTtcbiAgICAgIH1cblxuICAgICAgc2NoZWR1bGUub24gPSBvbjE7XG4gICAgfSk7XG5cbiAgICAvLyBUaGUgc2VsZWN0aW9uIHdhcyBlbXB0eSwgcmVzb2x2ZSBlbmQgaW1tZWRpYXRlbHlcbiAgICBpZiAoc2l6ZSA9PT0gMCkgcmVzb2x2ZSgpO1xuICB9KTtcbn1cbiIsImltcG9ydCB7c2VsZWN0aW9ufSBmcm9tIFwiZDMtc2VsZWN0aW9uXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9hdHRyIGZyb20gXCIuL2F0dHIuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2F0dHJUd2VlbiBmcm9tIFwiLi9hdHRyVHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2RlbGF5IGZyb20gXCIuL2RlbGF5LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9kdXJhdGlvbiBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZWFzZSBmcm9tIFwiLi9lYXNlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9lYXNlVmFyeWluZyBmcm9tIFwiLi9lYXNlVmFyeWluZy5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fZmlsdGVyIGZyb20gXCIuL2ZpbHRlci5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fbWVyZ2UgZnJvbSBcIi4vbWVyZ2UuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX29uIGZyb20gXCIuL29uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9yZW1vdmUgZnJvbSBcIi4vcmVtb3ZlLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3QgZnJvbSBcIi4vc2VsZWN0LmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3RBbGwgZnJvbSBcIi4vc2VsZWN0QWxsLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zZWxlY3Rpb24gZnJvbSBcIi4vc2VsZWN0aW9uLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl9zdHlsZSBmcm9tIFwiLi9zdHlsZS5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fc3R5bGVUd2VlbiBmcm9tIFwiLi9zdHlsZVR3ZWVuLmpzXCI7XG5pbXBvcnQgdHJhbnNpdGlvbl90ZXh0IGZyb20gXCIuL3RleHQuanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RleHRUd2VlbiBmcm9tIFwiLi90ZXh0VHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX3RyYW5zaXRpb24gZnJvbSBcIi4vdHJhbnNpdGlvbi5qc1wiO1xuaW1wb3J0IHRyYW5zaXRpb25fdHdlZW4gZnJvbSBcIi4vdHdlZW4uanNcIjtcbmltcG9ydCB0cmFuc2l0aW9uX2VuZCBmcm9tIFwiLi9lbmQuanNcIjtcblxudmFyIGlkID0gMDtcblxuZXhwb3J0IGZ1bmN0aW9uIFRyYW5zaXRpb24oZ3JvdXBzLCBwYXJlbnRzLCBuYW1lLCBpZCkge1xuICB0aGlzLl9ncm91cHMgPSBncm91cHM7XG4gIHRoaXMuX3BhcmVudHMgPSBwYXJlbnRzO1xuICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgdGhpcy5faWQgPSBpZDtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gdHJhbnNpdGlvbihuYW1lKSB7XG4gIHJldHVybiBzZWxlY3Rpb24oKS50cmFuc2l0aW9uKG5hbWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbmV3SWQoKSB7XG4gIHJldHVybiArK2lkO1xufVxuXG52YXIgc2VsZWN0aW9uX3Byb3RvdHlwZSA9IHNlbGVjdGlvbi5wcm90b3R5cGU7XG5cblRyYW5zaXRpb24ucHJvdG90eXBlID0gdHJhbnNpdGlvbi5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBUcmFuc2l0aW9uLFxuICBzZWxlY3Q6IHRyYW5zaXRpb25fc2VsZWN0LFxuICBzZWxlY3RBbGw6IHRyYW5zaXRpb25fc2VsZWN0QWxsLFxuICBzZWxlY3RDaGlsZDogc2VsZWN0aW9uX3Byb3RvdHlwZS5zZWxlY3RDaGlsZCxcbiAgc2VsZWN0Q2hpbGRyZW46IHNlbGVjdGlvbl9wcm90b3R5cGUuc2VsZWN0Q2hpbGRyZW4sXG4gIGZpbHRlcjogdHJhbnNpdGlvbl9maWx0ZXIsXG4gIG1lcmdlOiB0cmFuc2l0aW9uX21lcmdlLFxuICBzZWxlY3Rpb246IHRyYW5zaXRpb25fc2VsZWN0aW9uLFxuICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uX3RyYW5zaXRpb24sXG4gIGNhbGw6IHNlbGVjdGlvbl9wcm90b3R5cGUuY2FsbCxcbiAgbm9kZXM6IHNlbGVjdGlvbl9wcm90b3R5cGUubm9kZXMsXG4gIG5vZGU6IHNlbGVjdGlvbl9wcm90b3R5cGUubm9kZSxcbiAgc2l6ZTogc2VsZWN0aW9uX3Byb3RvdHlwZS5zaXplLFxuICBlbXB0eTogc2VsZWN0aW9uX3Byb3RvdHlwZS5lbXB0eSxcbiAgZWFjaDogc2VsZWN0aW9uX3Byb3RvdHlwZS5lYWNoLFxuICBvbjogdHJhbnNpdGlvbl9vbixcbiAgYXR0cjogdHJhbnNpdGlvbl9hdHRyLFxuICBhdHRyVHdlZW46IHRyYW5zaXRpb25fYXR0clR3ZWVuLFxuICBzdHlsZTogdHJhbnNpdGlvbl9zdHlsZSxcbiAgc3R5bGVUd2VlbjogdHJhbnNpdGlvbl9zdHlsZVR3ZWVuLFxuICB0ZXh0OiB0cmFuc2l0aW9uX3RleHQsXG4gIHRleHRUd2VlbjogdHJhbnNpdGlvbl90ZXh0VHdlZW4sXG4gIHJlbW92ZTogdHJhbnNpdGlvbl9yZW1vdmUsXG4gIHR3ZWVuOiB0cmFuc2l0aW9uX3R3ZWVuLFxuICBkZWxheTogdHJhbnNpdGlvbl9kZWxheSxcbiAgZHVyYXRpb246IHRyYW5zaXRpb25fZHVyYXRpb24sXG4gIGVhc2U6IHRyYW5zaXRpb25fZWFzZSxcbiAgZWFzZVZhcnlpbmc6IHRyYW5zaXRpb25fZWFzZVZhcnlpbmcsXG4gIGVuZDogdHJhbnNpdGlvbl9lbmQsXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiBzZWxlY3Rpb25fcHJvdG90eXBlW1N5bWJvbC5pdGVyYXRvcl1cbn07XG4iLCJleHBvcnQgZnVuY3Rpb24gY3ViaWNJbih0KSB7XG4gIHJldHVybiB0ICogdCAqIHQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdWJpY091dCh0KSB7XG4gIHJldHVybiAtLXQgKiB0ICogdCArIDE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjdWJpY0luT3V0KHQpIHtcbiAgcmV0dXJuICgodCAqPSAyKSA8PSAxID8gdCAqIHQgKiB0IDogKHQgLT0gMikgKiB0ICogdCArIDIpIC8gMjtcbn1cbiIsImltcG9ydCB7VHJhbnNpdGlvbiwgbmV3SWR9IGZyb20gXCIuLi90cmFuc2l0aW9uL2luZGV4LmpzXCI7XG5pbXBvcnQgc2NoZWR1bGUgZnJvbSBcIi4uL3RyYW5zaXRpb24vc2NoZWR1bGUuanNcIjtcbmltcG9ydCB7ZWFzZUN1YmljSW5PdXR9IGZyb20gXCJkMy1lYXNlXCI7XG5pbXBvcnQge25vd30gZnJvbSBcImQzLXRpbWVyXCI7XG5cbnZhciBkZWZhdWx0VGltaW5nID0ge1xuICB0aW1lOiBudWxsLCAvLyBTZXQgb24gdXNlLlxuICBkZWxheTogMCxcbiAgZHVyYXRpb246IDI1MCxcbiAgZWFzZTogZWFzZUN1YmljSW5PdXRcbn07XG5cbmZ1bmN0aW9uIGluaGVyaXQobm9kZSwgaWQpIHtcbiAgdmFyIHRpbWluZztcbiAgd2hpbGUgKCEodGltaW5nID0gbm9kZS5fX3RyYW5zaXRpb24pIHx8ICEodGltaW5nID0gdGltaW5nW2lkXSkpIHtcbiAgICBpZiAoIShub2RlID0gbm9kZS5wYXJlbnROb2RlKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGB0cmFuc2l0aW9uICR7aWR9IG5vdCBmb3VuZGApO1xuICAgIH1cbiAgfVxuICByZXR1cm4gdGltaW5nO1xufVxuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbihuYW1lKSB7XG4gIHZhciBpZCxcbiAgICAgIHRpbWluZztcblxuICBpZiAobmFtZSBpbnN0YW5jZW9mIFRyYW5zaXRpb24pIHtcbiAgICBpZCA9IG5hbWUuX2lkLCBuYW1lID0gbmFtZS5fbmFtZTtcbiAgfSBlbHNlIHtcbiAgICBpZCA9IG5ld0lkKCksICh0aW1pbmcgPSBkZWZhdWx0VGltaW5nKS50aW1lID0gbm93KCksIG5hbWUgPSBuYW1lID09IG51bGwgPyBudWxsIDogbmFtZSArIFwiXCI7XG4gIH1cblxuICBmb3IgKHZhciBncm91cHMgPSB0aGlzLl9ncm91cHMsIG0gPSBncm91cHMubGVuZ3RoLCBqID0gMDsgaiA8IG07ICsraikge1xuICAgIGZvciAodmFyIGdyb3VwID0gZ3JvdXBzW2pdLCBuID0gZ3JvdXAubGVuZ3RoLCBub2RlLCBpID0gMDsgaSA8IG47ICsraSkge1xuICAgICAgaWYgKG5vZGUgPSBncm91cFtpXSkge1xuICAgICAgICBzY2hlZHVsZShub2RlLCBuYW1lLCBpZCwgaSwgZ3JvdXAsIHRpbWluZyB8fCBpbmhlcml0KG5vZGUsIGlkKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5ldyBUcmFuc2l0aW9uKGdyb3VwcywgdGhpcy5fcGFyZW50cywgbmFtZSwgaWQpO1xufVxuIiwiaW1wb3J0IHtzZWxlY3Rpb259IGZyb20gXCJkMy1zZWxlY3Rpb25cIjtcbmltcG9ydCBzZWxlY3Rpb25faW50ZXJydXB0IGZyb20gXCIuL2ludGVycnVwdC5qc1wiO1xuaW1wb3J0IHNlbGVjdGlvbl90cmFuc2l0aW9uIGZyb20gXCIuL3RyYW5zaXRpb24uanNcIjtcblxuc2VsZWN0aW9uLnByb3RvdHlwZS5pbnRlcnJ1cHQgPSBzZWxlY3Rpb25faW50ZXJydXB0O1xuc2VsZWN0aW9uLnByb3RvdHlwZS50cmFuc2l0aW9uID0gc2VsZWN0aW9uX3RyYW5zaXRpb247XG4iLCJleHBvcnQgZnVuY3Rpb24gaW5pdFJhbmdlKGRvbWFpbiwgcmFuZ2UpIHtcbiAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgY2FzZSAwOiBicmVhaztcbiAgICBjYXNlIDE6IHRoaXMucmFuZ2UoZG9tYWluKTsgYnJlYWs7XG4gICAgZGVmYXVsdDogdGhpcy5yYW5nZShyYW5nZSkuZG9tYWluKGRvbWFpbik7IGJyZWFrO1xuICB9XG4gIHJldHVybiB0aGlzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdEludGVycG9sYXRvcihkb21haW4sIGludGVycG9sYXRvcikge1xuICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICBjYXNlIDA6IGJyZWFrO1xuICAgIGNhc2UgMToge1xuICAgICAgaWYgKHR5cGVvZiBkb21haW4gPT09IFwiZnVuY3Rpb25cIikgdGhpcy5pbnRlcnBvbGF0b3IoZG9tYWluKTtcbiAgICAgIGVsc2UgdGhpcy5yYW5nZShkb21haW4pO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHRoaXMuZG9tYWluKGRvbWFpbik7XG4gICAgICBpZiAodHlwZW9mIGludGVycG9sYXRvciA9PT0gXCJmdW5jdGlvblwiKSB0aGlzLmludGVycG9sYXRvcihpbnRlcnBvbGF0b3IpO1xuICAgICAgZWxzZSB0aGlzLnJhbmdlKGludGVycG9sYXRvcik7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHRoaXM7XG59XG4iLCJpbXBvcnQge0ludGVybk1hcH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2luaXRSYW5nZX0gZnJvbSBcIi4vaW5pdC5qc1wiO1xuXG5leHBvcnQgY29uc3QgaW1wbGljaXQgPSBTeW1ib2woXCJpbXBsaWNpdFwiKTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gb3JkaW5hbCgpIHtcbiAgdmFyIGluZGV4ID0gbmV3IEludGVybk1hcCgpLFxuICAgICAgZG9tYWluID0gW10sXG4gICAgICByYW5nZSA9IFtdLFxuICAgICAgdW5rbm93biA9IGltcGxpY2l0O1xuXG4gIGZ1bmN0aW9uIHNjYWxlKGQpIHtcbiAgICBsZXQgaSA9IGluZGV4LmdldChkKTtcbiAgICBpZiAoaSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodW5rbm93biAhPT0gaW1wbGljaXQpIHJldHVybiB1bmtub3duO1xuICAgICAgaW5kZXguc2V0KGQsIGkgPSBkb21haW4ucHVzaChkKSAtIDEpO1xuICAgIH1cbiAgICByZXR1cm4gcmFuZ2VbaSAlIHJhbmdlLmxlbmd0aF07XG4gIH1cblxuICBzY2FsZS5kb21haW4gPSBmdW5jdGlvbihfKSB7XG4gICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gZG9tYWluLnNsaWNlKCk7XG4gICAgZG9tYWluID0gW10sIGluZGV4ID0gbmV3IEludGVybk1hcCgpO1xuICAgIGZvciAoY29uc3QgdmFsdWUgb2YgXykge1xuICAgICAgaWYgKGluZGV4Lmhhcyh2YWx1ZSkpIGNvbnRpbnVlO1xuICAgICAgaW5kZXguc2V0KHZhbHVlLCBkb21haW4ucHVzaCh2YWx1ZSkgLSAxKTtcbiAgICB9XG4gICAgcmV0dXJuIHNjYWxlO1xuICB9O1xuXG4gIHNjYWxlLnJhbmdlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHJhbmdlID0gQXJyYXkuZnJvbShfKSwgc2NhbGUpIDogcmFuZ2Uuc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS51bmtub3duID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKHVua25vd24gPSBfLCBzY2FsZSkgOiB1bmtub3duO1xuICB9O1xuXG4gIHNjYWxlLmNvcHkgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gb3JkaW5hbChkb21haW4sIHJhbmdlKS51bmtub3duKHVua25vd24pO1xuICB9O1xuXG4gIGluaXRSYW5nZS5hcHBseShzY2FsZSwgYXJndW1lbnRzKTtcblxuICByZXR1cm4gc2NhbGU7XG59XG4iLCJpbXBvcnQge3JhbmdlIGFzIHNlcXVlbmNlfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7aW5pdFJhbmdlfSBmcm9tIFwiLi9pbml0LmpzXCI7XG5pbXBvcnQgb3JkaW5hbCBmcm9tIFwiLi9vcmRpbmFsLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGJhbmQoKSB7XG4gIHZhciBzY2FsZSA9IG9yZGluYWwoKS51bmtub3duKHVuZGVmaW5lZCksXG4gICAgICBkb21haW4gPSBzY2FsZS5kb21haW4sXG4gICAgICBvcmRpbmFsUmFuZ2UgPSBzY2FsZS5yYW5nZSxcbiAgICAgIHIwID0gMCxcbiAgICAgIHIxID0gMSxcbiAgICAgIHN0ZXAsXG4gICAgICBiYW5kd2lkdGgsXG4gICAgICByb3VuZCA9IGZhbHNlLFxuICAgICAgcGFkZGluZ0lubmVyID0gMCxcbiAgICAgIHBhZGRpbmdPdXRlciA9IDAsXG4gICAgICBhbGlnbiA9IDAuNTtcblxuICBkZWxldGUgc2NhbGUudW5rbm93bjtcblxuICBmdW5jdGlvbiByZXNjYWxlKCkge1xuICAgIHZhciBuID0gZG9tYWluKCkubGVuZ3RoLFxuICAgICAgICByZXZlcnNlID0gcjEgPCByMCxcbiAgICAgICAgc3RhcnQgPSByZXZlcnNlID8gcjEgOiByMCxcbiAgICAgICAgc3RvcCA9IHJldmVyc2UgPyByMCA6IHIxO1xuICAgIHN0ZXAgPSAoc3RvcCAtIHN0YXJ0KSAvIE1hdGgubWF4KDEsIG4gLSBwYWRkaW5nSW5uZXIgKyBwYWRkaW5nT3V0ZXIgKiAyKTtcbiAgICBpZiAocm91bmQpIHN0ZXAgPSBNYXRoLmZsb29yKHN0ZXApO1xuICAgIHN0YXJ0ICs9IChzdG9wIC0gc3RhcnQgLSBzdGVwICogKG4gLSBwYWRkaW5nSW5uZXIpKSAqIGFsaWduO1xuICAgIGJhbmR3aWR0aCA9IHN0ZXAgKiAoMSAtIHBhZGRpbmdJbm5lcik7XG4gICAgaWYgKHJvdW5kKSBzdGFydCA9IE1hdGgucm91bmQoc3RhcnQpLCBiYW5kd2lkdGggPSBNYXRoLnJvdW5kKGJhbmR3aWR0aCk7XG4gICAgdmFyIHZhbHVlcyA9IHNlcXVlbmNlKG4pLm1hcChmdW5jdGlvbihpKSB7IHJldHVybiBzdGFydCArIHN0ZXAgKiBpOyB9KTtcbiAgICByZXR1cm4gb3JkaW5hbFJhbmdlKHJldmVyc2UgPyB2YWx1ZXMucmV2ZXJzZSgpIDogdmFsdWVzKTtcbiAgfVxuXG4gIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChkb21haW4oXyksIHJlc2NhbGUoKSkgOiBkb21haW4oKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChbcjAsIHIxXSA9IF8sIHIwID0gK3IwLCByMSA9ICtyMSwgcmVzY2FsZSgpKSA6IFtyMCwgcjFdO1xuICB9O1xuXG4gIHNjYWxlLnJhbmdlUm91bmQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIFtyMCwgcjFdID0gXywgcjAgPSArcjAsIHIxID0gK3IxLCByb3VuZCA9IHRydWUsIHJlc2NhbGUoKTtcbiAgfTtcblxuICBzY2FsZS5iYW5kd2lkdGggPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYmFuZHdpZHRoO1xuICB9O1xuXG4gIHNjYWxlLnN0ZXAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gc3RlcDtcbiAgfTtcblxuICBzY2FsZS5yb3VuZCA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyb3VuZCA9ICEhXywgcmVzY2FsZSgpKSA6IHJvdW5kO1xuICB9O1xuXG4gIHNjYWxlLnBhZGRpbmcgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ0lubmVyID0gTWF0aC5taW4oMSwgcGFkZGluZ091dGVyID0gK18pLCByZXNjYWxlKCkpIDogcGFkZGluZ0lubmVyO1xuICB9O1xuXG4gIHNjYWxlLnBhZGRpbmdJbm5lciA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChwYWRkaW5nSW5uZXIgPSBNYXRoLm1pbigxLCBfKSwgcmVzY2FsZSgpKSA6IHBhZGRpbmdJbm5lcjtcbiAgfTtcblxuICBzY2FsZS5wYWRkaW5nT3V0ZXIgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAocGFkZGluZ091dGVyID0gK18sIHJlc2NhbGUoKSkgOiBwYWRkaW5nT3V0ZXI7XG4gIH07XG5cbiAgc2NhbGUuYWxpZ24gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoYWxpZ24gPSBNYXRoLm1heCgwLCBNYXRoLm1pbigxLCBfKSksIHJlc2NhbGUoKSkgOiBhbGlnbjtcbiAgfTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGJhbmQoZG9tYWluKCksIFtyMCwgcjFdKVxuICAgICAgICAucm91bmQocm91bmQpXG4gICAgICAgIC5wYWRkaW5nSW5uZXIocGFkZGluZ0lubmVyKVxuICAgICAgICAucGFkZGluZ091dGVyKHBhZGRpbmdPdXRlcilcbiAgICAgICAgLmFsaWduKGFsaWduKTtcbiAgfTtcblxuICByZXR1cm4gaW5pdFJhbmdlLmFwcGx5KHJlc2NhbGUoKSwgYXJndW1lbnRzKTtcbn1cblxuZnVuY3Rpb24gcG9pbnRpc2goc2NhbGUpIHtcbiAgdmFyIGNvcHkgPSBzY2FsZS5jb3B5O1xuXG4gIHNjYWxlLnBhZGRpbmcgPSBzY2FsZS5wYWRkaW5nT3V0ZXI7XG4gIGRlbGV0ZSBzY2FsZS5wYWRkaW5nSW5uZXI7XG4gIGRlbGV0ZSBzY2FsZS5wYWRkaW5nT3V0ZXI7XG5cbiAgc2NhbGUuY29weSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBwb2ludGlzaChjb3B5KCkpO1xuICB9O1xuXG4gIHJldHVybiBzY2FsZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHBvaW50KCkge1xuICByZXR1cm4gcG9pbnRpc2goYmFuZC5hcHBseShudWxsLCBhcmd1bWVudHMpLnBhZGRpbmdJbm5lcigxKSk7XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjb25zdGFudHMoeCkge1xuICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHg7XG4gIH07XG59XG4iLCJleHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBudW1iZXIoeCkge1xuICByZXR1cm4gK3g7XG59XG4iLCJpbXBvcnQge2Jpc2VjdH0gZnJvbSBcImQzLWFycmF5XCI7XG5pbXBvcnQge2ludGVycG9sYXRlIGFzIGludGVycG9sYXRlVmFsdWUsIGludGVycG9sYXRlTnVtYmVyLCBpbnRlcnBvbGF0ZVJvdW5kfSBmcm9tIFwiZDMtaW50ZXJwb2xhdGVcIjtcbmltcG9ydCBjb25zdGFudCBmcm9tIFwiLi9jb25zdGFudC5qc1wiO1xuaW1wb3J0IG51bWJlciBmcm9tIFwiLi9udW1iZXIuanNcIjtcblxudmFyIHVuaXQgPSBbMCwgMV07XG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eSh4KSB7XG4gIHJldHVybiB4O1xufVxuXG5mdW5jdGlvbiBub3JtYWxpemUoYSwgYikge1xuICByZXR1cm4gKGIgLT0gKGEgPSArYSkpXG4gICAgICA/IGZ1bmN0aW9uKHgpIHsgcmV0dXJuICh4IC0gYSkgLyBiOyB9XG4gICAgICA6IGNvbnN0YW50KGlzTmFOKGIpID8gTmFOIDogMC41KTtcbn1cblxuZnVuY3Rpb24gY2xhbXBlcihhLCBiKSB7XG4gIHZhciB0O1xuICBpZiAoYSA+IGIpIHQgPSBhLCBhID0gYiwgYiA9IHQ7XG4gIHJldHVybiBmdW5jdGlvbih4KSB7IHJldHVybiBNYXRoLm1heChhLCBNYXRoLm1pbihiLCB4KSk7IH07XG59XG5cbi8vIG5vcm1hbGl6ZShhLCBiKSh4KSB0YWtlcyBhIGRvbWFpbiB2YWx1ZSB4IGluIFthLGJdIGFuZCByZXR1cm5zIHRoZSBjb3JyZXNwb25kaW5nIHBhcmFtZXRlciB0IGluIFswLDFdLlxuLy8gaW50ZXJwb2xhdGUoYSwgYikodCkgdGFrZXMgYSBwYXJhbWV0ZXIgdCBpbiBbMCwxXSBhbmQgcmV0dXJucyB0aGUgY29ycmVzcG9uZGluZyByYW5nZSB2YWx1ZSB4IGluIFthLGJdLlxuZnVuY3Rpb24gYmltYXAoZG9tYWluLCByYW5nZSwgaW50ZXJwb2xhdGUpIHtcbiAgdmFyIGQwID0gZG9tYWluWzBdLCBkMSA9IGRvbWFpblsxXSwgcjAgPSByYW5nZVswXSwgcjEgPSByYW5nZVsxXTtcbiAgaWYgKGQxIDwgZDApIGQwID0gbm9ybWFsaXplKGQxLCBkMCksIHIwID0gaW50ZXJwb2xhdGUocjEsIHIwKTtcbiAgZWxzZSBkMCA9IG5vcm1hbGl6ZShkMCwgZDEpLCByMCA9IGludGVycG9sYXRlKHIwLCByMSk7XG4gIHJldHVybiBmdW5jdGlvbih4KSB7IHJldHVybiByMChkMCh4KSk7IH07XG59XG5cbmZ1bmN0aW9uIHBvbHltYXAoZG9tYWluLCByYW5nZSwgaW50ZXJwb2xhdGUpIHtcbiAgdmFyIGogPSBNYXRoLm1pbihkb21haW4ubGVuZ3RoLCByYW5nZS5sZW5ndGgpIC0gMSxcbiAgICAgIGQgPSBuZXcgQXJyYXkoaiksXG4gICAgICByID0gbmV3IEFycmF5KGopLFxuICAgICAgaSA9IC0xO1xuXG4gIC8vIFJldmVyc2UgZGVzY2VuZGluZyBkb21haW5zLlxuICBpZiAoZG9tYWluW2pdIDwgZG9tYWluWzBdKSB7XG4gICAgZG9tYWluID0gZG9tYWluLnNsaWNlKCkucmV2ZXJzZSgpO1xuICAgIHJhbmdlID0gcmFuZ2Uuc2xpY2UoKS5yZXZlcnNlKCk7XG4gIH1cblxuICB3aGlsZSAoKytpIDwgaikge1xuICAgIGRbaV0gPSBub3JtYWxpemUoZG9tYWluW2ldLCBkb21haW5baSArIDFdKTtcbiAgICByW2ldID0gaW50ZXJwb2xhdGUocmFuZ2VbaV0sIHJhbmdlW2kgKyAxXSk7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24oeCkge1xuICAgIHZhciBpID0gYmlzZWN0KGRvbWFpbiwgeCwgMSwgaikgLSAxO1xuICAgIHJldHVybiByW2ldKGRbaV0oeCkpO1xuICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29weShzb3VyY2UsIHRhcmdldCkge1xuICByZXR1cm4gdGFyZ2V0XG4gICAgICAuZG9tYWluKHNvdXJjZS5kb21haW4oKSlcbiAgICAgIC5yYW5nZShzb3VyY2UucmFuZ2UoKSlcbiAgICAgIC5pbnRlcnBvbGF0ZShzb3VyY2UuaW50ZXJwb2xhdGUoKSlcbiAgICAgIC5jbGFtcChzb3VyY2UuY2xhbXAoKSlcbiAgICAgIC51bmtub3duKHNvdXJjZS51bmtub3duKCkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtZXIoKSB7XG4gIHZhciBkb21haW4gPSB1bml0LFxuICAgICAgcmFuZ2UgPSB1bml0LFxuICAgICAgaW50ZXJwb2xhdGUgPSBpbnRlcnBvbGF0ZVZhbHVlLFxuICAgICAgdHJhbnNmb3JtLFxuICAgICAgdW50cmFuc2Zvcm0sXG4gICAgICB1bmtub3duLFxuICAgICAgY2xhbXAgPSBpZGVudGl0eSxcbiAgICAgIHBpZWNld2lzZSxcbiAgICAgIG91dHB1dCxcbiAgICAgIGlucHV0O1xuXG4gIGZ1bmN0aW9uIHJlc2NhbGUoKSB7XG4gICAgdmFyIG4gPSBNYXRoLm1pbihkb21haW4ubGVuZ3RoLCByYW5nZS5sZW5ndGgpO1xuICAgIGlmIChjbGFtcCAhPT0gaWRlbnRpdHkpIGNsYW1wID0gY2xhbXBlcihkb21haW5bMF0sIGRvbWFpbltuIC0gMV0pO1xuICAgIHBpZWNld2lzZSA9IG4gPiAyID8gcG9seW1hcCA6IGJpbWFwO1xuICAgIG91dHB1dCA9IGlucHV0ID0gbnVsbDtcbiAgICByZXR1cm4gc2NhbGU7XG4gIH1cblxuICBmdW5jdGlvbiBzY2FsZSh4KSB7XG4gICAgcmV0dXJuIHggPT0gbnVsbCB8fCBpc05hTih4ID0gK3gpID8gdW5rbm93biA6IChvdXRwdXQgfHwgKG91dHB1dCA9IHBpZWNld2lzZShkb21haW4ubWFwKHRyYW5zZm9ybSksIHJhbmdlLCBpbnRlcnBvbGF0ZSkpKSh0cmFuc2Zvcm0oY2xhbXAoeCkpKTtcbiAgfVxuXG4gIHNjYWxlLmludmVydCA9IGZ1bmN0aW9uKHkpIHtcbiAgICByZXR1cm4gY2xhbXAodW50cmFuc2Zvcm0oKGlucHV0IHx8IChpbnB1dCA9IHBpZWNld2lzZShyYW5nZSwgZG9tYWluLm1hcCh0cmFuc2Zvcm0pLCBpbnRlcnBvbGF0ZU51bWJlcikpKSh5KSkpO1xuICB9O1xuXG4gIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChkb21haW4gPSBBcnJheS5mcm9tKF8sIG51bWJlciksIHJlc2NhbGUoKSkgOiBkb21haW4uc2xpY2UoKTtcbiAgfTtcblxuICBzY2FsZS5yYW5nZSA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IChyYW5nZSA9IEFycmF5LmZyb20oXyksIHJlc2NhbGUoKSkgOiByYW5nZS5zbGljZSgpO1xuICB9O1xuXG4gIHNjYWxlLnJhbmdlUm91bmQgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIHJhbmdlID0gQXJyYXkuZnJvbShfKSwgaW50ZXJwb2xhdGUgPSBpbnRlcnBvbGF0ZVJvdW5kLCByZXNjYWxlKCk7XG4gIH07XG5cbiAgc2NhbGUuY2xhbXAgPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAoY2xhbXAgPSBfID8gdHJ1ZSA6IGlkZW50aXR5LCByZXNjYWxlKCkpIDogY2xhbXAgIT09IGlkZW50aXR5O1xuICB9O1xuXG4gIHNjYWxlLmludGVycG9sYXRlID0gZnVuY3Rpb24oXykge1xuICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gKGludGVycG9sYXRlID0gXywgcmVzY2FsZSgpKSA6IGludGVycG9sYXRlO1xuICB9O1xuXG4gIHNjYWxlLnVua25vd24gPSBmdW5jdGlvbihfKSB7XG4gICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyAodW5rbm93biA9IF8sIHNjYWxlKSA6IHVua25vd247XG4gIH07XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKHQsIHUpIHtcbiAgICB0cmFuc2Zvcm0gPSB0LCB1bnRyYW5zZm9ybSA9IHU7XG4gICAgcmV0dXJuIHJlc2NhbGUoKTtcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY29udGludW91cygpIHtcbiAgcmV0dXJuIHRyYW5zZm9ybWVyKCkoaWRlbnRpdHksIGlkZW50aXR5KTtcbn1cbiIsImV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIG5pY2UoZG9tYWluLCBpbnRlcnZhbCkge1xuICBkb21haW4gPSBkb21haW4uc2xpY2UoKTtcblxuICB2YXIgaTAgPSAwLFxuICAgICAgaTEgPSBkb21haW4ubGVuZ3RoIC0gMSxcbiAgICAgIHgwID0gZG9tYWluW2kwXSxcbiAgICAgIHgxID0gZG9tYWluW2kxXSxcbiAgICAgIHQ7XG5cbiAgaWYgKHgxIDwgeDApIHtcbiAgICB0ID0gaTAsIGkwID0gaTEsIGkxID0gdDtcbiAgICB0ID0geDAsIHgwID0geDEsIHgxID0gdDtcbiAgfVxuXG4gIGRvbWFpbltpMF0gPSBpbnRlcnZhbC5mbG9vcih4MCk7XG4gIGRvbWFpbltpMV0gPSBpbnRlcnZhbC5jZWlsKHgxKTtcbiAgcmV0dXJuIGRvbWFpbjtcbn1cbiIsImNvbnN0IHQwID0gbmV3IERhdGUsIHQxID0gbmV3IERhdGU7XG5cbmV4cG9ydCBmdW5jdGlvbiB0aW1lSW50ZXJ2YWwoZmxvb3JpLCBvZmZzZXRpLCBjb3VudCwgZmllbGQpIHtcblxuICBmdW5jdGlvbiBpbnRlcnZhbChkYXRlKSB7XG4gICAgcmV0dXJuIGZsb29yaShkYXRlID0gYXJndW1lbnRzLmxlbmd0aCA9PT0gMCA/IG5ldyBEYXRlIDogbmV3IERhdGUoK2RhdGUpKSwgZGF0ZTtcbiAgfVxuXG4gIGludGVydmFsLmZsb29yID0gKGRhdGUpID0+IHtcbiAgICByZXR1cm4gZmxvb3JpKGRhdGUgPSBuZXcgRGF0ZSgrZGF0ZSkpLCBkYXRlO1xuICB9O1xuXG4gIGludGVydmFsLmNlaWwgPSAoZGF0ZSkgPT4ge1xuICAgIHJldHVybiBmbG9vcmkoZGF0ZSA9IG5ldyBEYXRlKGRhdGUgLSAxKSksIG9mZnNldGkoZGF0ZSwgMSksIGZsb29yaShkYXRlKSwgZGF0ZTtcbiAgfTtcblxuICBpbnRlcnZhbC5yb3VuZCA9IChkYXRlKSA9PiB7XG4gICAgY29uc3QgZDAgPSBpbnRlcnZhbChkYXRlKSwgZDEgPSBpbnRlcnZhbC5jZWlsKGRhdGUpO1xuICAgIHJldHVybiBkYXRlIC0gZDAgPCBkMSAtIGRhdGUgPyBkMCA6IGQxO1xuICB9O1xuXG4gIGludGVydmFsLm9mZnNldCA9IChkYXRlLCBzdGVwKSA9PiB7XG4gICAgcmV0dXJuIG9mZnNldGkoZGF0ZSA9IG5ldyBEYXRlKCtkYXRlKSwgc3RlcCA9PSBudWxsID8gMSA6IE1hdGguZmxvb3Ioc3RlcCkpLCBkYXRlO1xuICB9O1xuXG4gIGludGVydmFsLnJhbmdlID0gKHN0YXJ0LCBzdG9wLCBzdGVwKSA9PiB7XG4gICAgY29uc3QgcmFuZ2UgPSBbXTtcbiAgICBzdGFydCA9IGludGVydmFsLmNlaWwoc3RhcnQpO1xuICAgIHN0ZXAgPSBzdGVwID09IG51bGwgPyAxIDogTWF0aC5mbG9vcihzdGVwKTtcbiAgICBpZiAoIShzdGFydCA8IHN0b3ApIHx8ICEoc3RlcCA+IDApKSByZXR1cm4gcmFuZ2U7IC8vIGFsc28gaGFuZGxlcyBJbnZhbGlkIERhdGVcbiAgICBsZXQgcHJldmlvdXM7XG4gICAgZG8gcmFuZ2UucHVzaChwcmV2aW91cyA9IG5ldyBEYXRlKCtzdGFydCkpLCBvZmZzZXRpKHN0YXJ0LCBzdGVwKSwgZmxvb3JpKHN0YXJ0KTtcbiAgICB3aGlsZSAocHJldmlvdXMgPCBzdGFydCAmJiBzdGFydCA8IHN0b3ApO1xuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICBpbnRlcnZhbC5maWx0ZXIgPSAodGVzdCkgPT4ge1xuICAgIHJldHVybiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICAgIGlmIChkYXRlID49IGRhdGUpIHdoaWxlIChmbG9vcmkoZGF0ZSksICF0ZXN0KGRhdGUpKSBkYXRlLnNldFRpbWUoZGF0ZSAtIDEpO1xuICAgIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgICBpZiAoZGF0ZSA+PSBkYXRlKSB7XG4gICAgICAgIGlmIChzdGVwIDwgMCkgd2hpbGUgKCsrc3RlcCA8PSAwKSB7XG4gICAgICAgICAgd2hpbGUgKG9mZnNldGkoZGF0ZSwgLTEpLCAhdGVzdChkYXRlKSkge30gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1lbXB0eVxuICAgICAgICB9IGVsc2Ugd2hpbGUgKC0tc3RlcCA+PSAwKSB7XG4gICAgICAgICAgd2hpbGUgKG9mZnNldGkoZGF0ZSwgKzEpLCAhdGVzdChkYXRlKSkge30gLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1lbXB0eVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgaWYgKGNvdW50KSB7XG4gICAgaW50ZXJ2YWwuY291bnQgPSAoc3RhcnQsIGVuZCkgPT4ge1xuICAgICAgdDAuc2V0VGltZSgrc3RhcnQpLCB0MS5zZXRUaW1lKCtlbmQpO1xuICAgICAgZmxvb3JpKHQwKSwgZmxvb3JpKHQxKTtcbiAgICAgIHJldHVybiBNYXRoLmZsb29yKGNvdW50KHQwLCB0MSkpO1xuICAgIH07XG5cbiAgICBpbnRlcnZhbC5ldmVyeSA9IChzdGVwKSA9PiB7XG4gICAgICBzdGVwID0gTWF0aC5mbG9vcihzdGVwKTtcbiAgICAgIHJldHVybiAhaXNGaW5pdGUoc3RlcCkgfHwgIShzdGVwID4gMCkgPyBudWxsXG4gICAgICAgICAgOiAhKHN0ZXAgPiAxKSA/IGludGVydmFsXG4gICAgICAgICAgOiBpbnRlcnZhbC5maWx0ZXIoZmllbGRcbiAgICAgICAgICAgICAgPyAoZCkgPT4gZmllbGQoZCkgJSBzdGVwID09PSAwXG4gICAgICAgICAgICAgIDogKGQpID0+IGludGVydmFsLmNvdW50KDAsIGQpICUgc3RlcCA9PT0gMCk7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBpbnRlcnZhbDtcbn1cbiIsImltcG9ydCB7dGltZUludGVydmFsfSBmcm9tIFwiLi9pbnRlcnZhbC5qc1wiO1xuXG5leHBvcnQgY29uc3QgbWlsbGlzZWNvbmQgPSB0aW1lSW50ZXJ2YWwoKCkgPT4ge1xuICAvLyBub29wXG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQgLSBzdGFydDtcbn0pO1xuXG4vLyBBbiBvcHRpbWl6ZWQgaW1wbGVtZW50YXRpb24gZm9yIHRoaXMgc2ltcGxlIGNhc2UuXG5taWxsaXNlY29uZC5ldmVyeSA9IChrKSA9PiB7XG4gIGsgPSBNYXRoLmZsb29yKGspO1xuICBpZiAoIWlzRmluaXRlKGspIHx8ICEoayA+IDApKSByZXR1cm4gbnVsbDtcbiAgaWYgKCEoayA+IDEpKSByZXR1cm4gbWlsbGlzZWNvbmQ7XG4gIHJldHVybiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICBkYXRlLnNldFRpbWUoTWF0aC5mbG9vcihkYXRlIC8gaykgKiBrKTtcbiAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogayk7XG4gIH0sIChzdGFydCwgZW5kKSA9PiB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBrO1xuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBtaWxsaXNlY29uZHMgPSBtaWxsaXNlY29uZC5yYW5nZTtcbiIsImV4cG9ydCBjb25zdCBkdXJhdGlvblNlY29uZCA9IDEwMDA7XG5leHBvcnQgY29uc3QgZHVyYXRpb25NaW51dGUgPSBkdXJhdGlvblNlY29uZCAqIDYwO1xuZXhwb3J0IGNvbnN0IGR1cmF0aW9uSG91ciA9IGR1cmF0aW9uTWludXRlICogNjA7XG5leHBvcnQgY29uc3QgZHVyYXRpb25EYXkgPSBkdXJhdGlvbkhvdXIgKiAyNDtcbmV4cG9ydCBjb25zdCBkdXJhdGlvbldlZWsgPSBkdXJhdGlvbkRheSAqIDc7XG5leHBvcnQgY29uc3QgZHVyYXRpb25Nb250aCA9IGR1cmF0aW9uRGF5ICogMzA7XG5leHBvcnQgY29uc3QgZHVyYXRpb25ZZWFyID0gZHVyYXRpb25EYXkgKiAzNjU7XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcbmltcG9ydCB7ZHVyYXRpb25TZWNvbmR9IGZyb20gXCIuL2R1cmF0aW9uLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBzZWNvbmQgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRUaW1lKGRhdGUgLSBkYXRlLmdldE1pbGxpc2Vjb25kcygpKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBkdXJhdGlvblNlY29uZCk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uU2Vjb25kO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDU2Vjb25kcygpO1xufSk7XG5cbmV4cG9ydCBjb25zdCBzZWNvbmRzID0gc2Vjb25kLnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uTWludXRlLCBkdXJhdGlvblNlY29uZH0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVNaW51dGUgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRUaW1lKGRhdGUgLSBkYXRlLmdldE1pbGxpc2Vjb25kcygpIC0gZGF0ZS5nZXRTZWNvbmRzKCkgKiBkdXJhdGlvblNlY29uZCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25NaW51dGUpO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbk1pbnV0ZTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldE1pbnV0ZXMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdGltZU1pbnV0ZXMgPSB0aW1lTWludXRlLnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjTWludXRlID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDU2Vjb25kcygwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VGltZSgrZGF0ZSArIHN0ZXAgKiBkdXJhdGlvbk1pbnV0ZSk7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uTWludXRlO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDTWludXRlcygpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1dGNNaW51dGVzID0gdXRjTWludXRlLnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uSG91ciwgZHVyYXRpb25NaW51dGUsIGR1cmF0aW9uU2Vjb25kfSBmcm9tIFwiLi9kdXJhdGlvbi5qc1wiO1xuXG5leHBvcnQgY29uc3QgdGltZUhvdXIgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRUaW1lKGRhdGUgLSBkYXRlLmdldE1pbGxpc2Vjb25kcygpIC0gZGF0ZS5nZXRTZWNvbmRzKCkgKiBkdXJhdGlvblNlY29uZCAtIGRhdGUuZ2V0TWludXRlcygpICogZHVyYXRpb25NaW51dGUpO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRUaW1lKCtkYXRlICsgc3RlcCAqIGR1cmF0aW9uSG91cik7XG59LCAoc3RhcnQsIGVuZCkgPT4ge1xuICByZXR1cm4gKGVuZCAtIHN0YXJ0KSAvIGR1cmF0aW9uSG91cjtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldEhvdXJzKCk7XG59KTtcblxuZXhwb3J0IGNvbnN0IHRpbWVIb3VycyA9IHRpbWVIb3VyLnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjSG91ciA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ01pbnV0ZXMoMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFRpbWUoK2RhdGUgKyBzdGVwICogZHVyYXRpb25Ib3VyKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25Ib3VyO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDSG91cnMoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdXRjSG91cnMgPSB1dGNIb3VyLnJhbmdlO1xuIiwiaW1wb3J0IHt0aW1lSW50ZXJ2YWx9IGZyb20gXCIuL2ludGVydmFsLmpzXCI7XG5pbXBvcnQge2R1cmF0aW9uRGF5LCBkdXJhdGlvbk1pbnV0ZX0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVEYXkgPSB0aW1lSW50ZXJ2YWwoXG4gIGRhdGUgPT4gZGF0ZS5zZXRIb3VycygwLCAwLCAwLCAwKSxcbiAgKGRhdGUsIHN0ZXApID0+IGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSArIHN0ZXApLFxuICAoc3RhcnQsIGVuZCkgPT4gKGVuZCAtIHN0YXJ0IC0gKGVuZC5nZXRUaW1lem9uZU9mZnNldCgpIC0gc3RhcnQuZ2V0VGltZXpvbmVPZmZzZXQoKSkgKiBkdXJhdGlvbk1pbnV0ZSkgLyBkdXJhdGlvbkRheSxcbiAgZGF0ZSA9PiBkYXRlLmdldERhdGUoKSAtIDFcbik7XG5cbmV4cG9ydCBjb25zdCB0aW1lRGF5cyA9IHRpbWVEYXkucmFuZ2U7XG5cbmV4cG9ydCBjb25zdCB1dGNEYXkgPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbn0sIChkYXRlLCBzdGVwKSA9PiB7XG4gIGRhdGUuc2V0VVRDRGF0ZShkYXRlLmdldFVUQ0RhdGUoKSArIHN0ZXApO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbkRheTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldFVUQ0RhdGUoKSAtIDE7XG59KTtcblxuZXhwb3J0IGNvbnN0IHV0Y0RheXMgPSB1dGNEYXkucmFuZ2U7XG5cbmV4cG9ydCBjb25zdCB1bml4RGF5ID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiAoZW5kIC0gc3RhcnQpIC8gZHVyYXRpb25EYXk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gTWF0aC5mbG9vcihkYXRlIC8gZHVyYXRpb25EYXkpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB1bml4RGF5cyA9IHVuaXhEYXkucmFuZ2U7XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcbmltcG9ydCB7ZHVyYXRpb25NaW51dGUsIGR1cmF0aW9uV2Vla30gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcblxuZnVuY3Rpb24gdGltZVdlZWtkYXkoaSkge1xuICByZXR1cm4gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gICAgZGF0ZS5zZXREYXRlKGRhdGUuZ2V0RGF0ZSgpIC0gKGRhdGUuZ2V0RGF5KCkgKyA3IC0gaSkgJSA3KTtcbiAgICBkYXRlLnNldEhvdXJzKDAsIDAsIDAsIDApO1xuICB9LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICAgIGRhdGUuc2V0RGF0ZShkYXRlLmdldERhdGUoKSArIHN0ZXAgKiA3KTtcbiAgfSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgICByZXR1cm4gKGVuZCAtIHN0YXJ0IC0gKGVuZC5nZXRUaW1lem9uZU9mZnNldCgpIC0gc3RhcnQuZ2V0VGltZXpvbmVPZmZzZXQoKSkgKiBkdXJhdGlvbk1pbnV0ZSkgLyBkdXJhdGlvbldlZWs7XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgdGltZVN1bmRheSA9IHRpbWVXZWVrZGF5KDApO1xuZXhwb3J0IGNvbnN0IHRpbWVNb25kYXkgPSB0aW1lV2Vla2RheSgxKTtcbmV4cG9ydCBjb25zdCB0aW1lVHVlc2RheSA9IHRpbWVXZWVrZGF5KDIpO1xuZXhwb3J0IGNvbnN0IHRpbWVXZWRuZXNkYXkgPSB0aW1lV2Vla2RheSgzKTtcbmV4cG9ydCBjb25zdCB0aW1lVGh1cnNkYXkgPSB0aW1lV2Vla2RheSg0KTtcbmV4cG9ydCBjb25zdCB0aW1lRnJpZGF5ID0gdGltZVdlZWtkYXkoNSk7XG5leHBvcnQgY29uc3QgdGltZVNhdHVyZGF5ID0gdGltZVdlZWtkYXkoNik7XG5cbmV4cG9ydCBjb25zdCB0aW1lU3VuZGF5cyA9IHRpbWVTdW5kYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdGltZU1vbmRheXMgPSB0aW1lTW9uZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVUdWVzZGF5cyA9IHRpbWVUdWVzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVXZWRuZXNkYXlzID0gdGltZVdlZG5lc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lVGh1cnNkYXlzID0gdGltZVRodXJzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHRpbWVGcmlkYXlzID0gdGltZUZyaWRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB0aW1lU2F0dXJkYXlzID0gdGltZVNhdHVyZGF5LnJhbmdlO1xuXG5mdW5jdGlvbiB1dGNXZWVrZGF5KGkpIHtcbiAgcmV0dXJuIHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICAgIGRhdGUuc2V0VVRDRGF0ZShkYXRlLmdldFVUQ0RhdGUoKSAtIChkYXRlLmdldFVUQ0RheSgpICsgNyAtIGkpICUgNyk7XG4gICAgZGF0ZS5zZXRVVENIb3VycygwLCAwLCAwLCAwKTtcbiAgfSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgICBkYXRlLnNldFVUQ0RhdGUoZGF0ZS5nZXRVVENEYXRlKCkgKyBzdGVwICogNyk7XG4gIH0sIChzdGFydCwgZW5kKSA9PiB7XG4gICAgcmV0dXJuIChlbmQgLSBzdGFydCkgLyBkdXJhdGlvbldlZWs7XG4gIH0pO1xufVxuXG5leHBvcnQgY29uc3QgdXRjU3VuZGF5ID0gdXRjV2Vla2RheSgwKTtcbmV4cG9ydCBjb25zdCB1dGNNb25kYXkgPSB1dGNXZWVrZGF5KDEpO1xuZXhwb3J0IGNvbnN0IHV0Y1R1ZXNkYXkgPSB1dGNXZWVrZGF5KDIpO1xuZXhwb3J0IGNvbnN0IHV0Y1dlZG5lc2RheSA9IHV0Y1dlZWtkYXkoMyk7XG5leHBvcnQgY29uc3QgdXRjVGh1cnNkYXkgPSB1dGNXZWVrZGF5KDQpO1xuZXhwb3J0IGNvbnN0IHV0Y0ZyaWRheSA9IHV0Y1dlZWtkYXkoNSk7XG5leHBvcnQgY29uc3QgdXRjU2F0dXJkYXkgPSB1dGNXZWVrZGF5KDYpO1xuXG5leHBvcnQgY29uc3QgdXRjU3VuZGF5cyA9IHV0Y1N1bmRheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNNb25kYXlzID0gdXRjTW9uZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y1R1ZXNkYXlzID0gdXRjVHVlc2RheS5yYW5nZTtcbmV4cG9ydCBjb25zdCB1dGNXZWRuZXNkYXlzID0gdXRjV2VkbmVzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y1RodXJzZGF5cyA9IHV0Y1RodXJzZGF5LnJhbmdlO1xuZXhwb3J0IGNvbnN0IHV0Y0ZyaWRheXMgPSB1dGNGcmlkYXkucmFuZ2U7XG5leHBvcnQgY29uc3QgdXRjU2F0dXJkYXlzID0gdXRjU2F0dXJkYXkucmFuZ2U7XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVNb250aCA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldERhdGUoMSk7XG4gIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldE1vbnRoKGRhdGUuZ2V0TW9udGgoKSArIHN0ZXApO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIGVuZC5nZXRNb250aCgpIC0gc3RhcnQuZ2V0TW9udGgoKSArIChlbmQuZ2V0RnVsbFllYXIoKSAtIHN0YXJ0LmdldEZ1bGxZZWFyKCkpICogMTI7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRNb250aCgpO1xufSk7XG5cbmV4cG9ydCBjb25zdCB0aW1lTW9udGhzID0gdGltZU1vbnRoLnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjTW9udGggPSB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgZGF0ZS5zZXRVVENEYXRlKDEpO1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRVVENNb250aChkYXRlLmdldFVUQ01vbnRoKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQuZ2V0VVRDTW9udGgoKSAtIHN0YXJ0LmdldFVUQ01vbnRoKCkgKyAoZW5kLmdldFVUQ0Z1bGxZZWFyKCkgLSBzdGFydC5nZXRVVENGdWxsWWVhcigpKSAqIDEyO1xufSwgKGRhdGUpID0+IHtcbiAgcmV0dXJuIGRhdGUuZ2V0VVRDTW9udGgoKTtcbn0pO1xuXG5leHBvcnQgY29uc3QgdXRjTW9udGhzID0gdXRjTW9udGgucmFuZ2U7XG4iLCJpbXBvcnQge3RpbWVJbnRlcnZhbH0gZnJvbSBcIi4vaW50ZXJ2YWwuanNcIjtcblxuZXhwb3J0IGNvbnN0IHRpbWVZZWFyID0gdGltZUludGVydmFsKChkYXRlKSA9PiB7XG4gIGRhdGUuc2V0TW9udGgoMCwgMSk7XG4gIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG59LCAoZGF0ZSwgc3RlcCkgPT4ge1xuICBkYXRlLnNldEZ1bGxZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSArIHN0ZXApO1xufSwgKHN0YXJ0LCBlbmQpID0+IHtcbiAgcmV0dXJuIGVuZC5nZXRGdWxsWWVhcigpIC0gc3RhcnQuZ2V0RnVsbFllYXIoKTtcbn0sIChkYXRlKSA9PiB7XG4gIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCk7XG59KTtcblxuLy8gQW4gb3B0aW1pemVkIGltcGxlbWVudGF0aW9uIGZvciB0aGlzIHNpbXBsZSBjYXNlLlxudGltZVllYXIuZXZlcnkgPSAoaykgPT4ge1xuICByZXR1cm4gIWlzRmluaXRlKGsgPSBNYXRoLmZsb29yKGspKSB8fCAhKGsgPiAwKSA/IG51bGwgOiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICBkYXRlLnNldEZ1bGxZZWFyKE1hdGguZmxvb3IoZGF0ZS5nZXRGdWxsWWVhcigpIC8gaykgKiBrKTtcbiAgICBkYXRlLnNldE1vbnRoKDAsIDEpO1xuICAgIGRhdGUuc2V0SG91cnMoMCwgMCwgMCwgMCk7XG4gIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgZGF0ZS5zZXRGdWxsWWVhcihkYXRlLmdldEZ1bGxZZWFyKCkgKyBzdGVwICogayk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHRpbWVZZWFycyA9IHRpbWVZZWFyLnJhbmdlO1xuXG5leHBvcnQgY29uc3QgdXRjWWVhciA9IHRpbWVJbnRlcnZhbCgoZGF0ZSkgPT4ge1xuICBkYXRlLnNldFVUQ01vbnRoKDAsIDEpO1xuICBkYXRlLnNldFVUQ0hvdXJzKDAsIDAsIDAsIDApO1xufSwgKGRhdGUsIHN0ZXApID0+IHtcbiAgZGF0ZS5zZXRVVENGdWxsWWVhcihkYXRlLmdldFVUQ0Z1bGxZZWFyKCkgKyBzdGVwKTtcbn0sIChzdGFydCwgZW5kKSA9PiB7XG4gIHJldHVybiBlbmQuZ2V0VVRDRnVsbFllYXIoKSAtIHN0YXJ0LmdldFVUQ0Z1bGxZZWFyKCk7XG59LCAoZGF0ZSkgPT4ge1xuICByZXR1cm4gZGF0ZS5nZXRVVENGdWxsWWVhcigpO1xufSk7XG5cbi8vIEFuIG9wdGltaXplZCBpbXBsZW1lbnRhdGlvbiBmb3IgdGhpcyBzaW1wbGUgY2FzZS5cbnV0Y1llYXIuZXZlcnkgPSAoaykgPT4ge1xuICByZXR1cm4gIWlzRmluaXRlKGsgPSBNYXRoLmZsb29yKGspKSB8fCAhKGsgPiAwKSA/IG51bGwgOiB0aW1lSW50ZXJ2YWwoKGRhdGUpID0+IHtcbiAgICBkYXRlLnNldFVUQ0Z1bGxZZWFyKE1hdGguZmxvb3IoZGF0ZS5nZXRVVENGdWxsWWVhcigpIC8gaykgKiBrKTtcbiAgICBkYXRlLnNldFVUQ01vbnRoKDAsIDEpO1xuICAgIGRhdGUuc2V0VVRDSG91cnMoMCwgMCwgMCwgMCk7XG4gIH0sIChkYXRlLCBzdGVwKSA9PiB7XG4gICAgZGF0ZS5zZXRVVENGdWxsWWVhcihkYXRlLmdldFVUQ0Z1bGxZZWFyKCkgKyBzdGVwICogayk7XG4gIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IHV0Y1llYXJzID0gdXRjWWVhci5yYW5nZTtcbiIsImltcG9ydCB7YmlzZWN0b3IsIHRpY2tTdGVwfSBmcm9tIFwiZDMtYXJyYXlcIjtcbmltcG9ydCB7ZHVyYXRpb25EYXksIGR1cmF0aW9uSG91ciwgZHVyYXRpb25NaW51dGUsIGR1cmF0aW9uTW9udGgsIGR1cmF0aW9uU2Vjb25kLCBkdXJhdGlvbldlZWssIGR1cmF0aW9uWWVhcn0gZnJvbSBcIi4vZHVyYXRpb24uanNcIjtcbmltcG9ydCB7bWlsbGlzZWNvbmR9IGZyb20gXCIuL21pbGxpc2Vjb25kLmpzXCI7XG5pbXBvcnQge3NlY29uZH0gZnJvbSBcIi4vc2Vjb25kLmpzXCI7XG5pbXBvcnQge3RpbWVNaW51dGUsIHV0Y01pbnV0ZX0gZnJvbSBcIi4vbWludXRlLmpzXCI7XG5pbXBvcnQge3RpbWVIb3VyLCB1dGNIb3VyfSBmcm9tIFwiLi9ob3VyLmpzXCI7XG5pbXBvcnQge3RpbWVEYXksIHVuaXhEYXl9IGZyb20gXCIuL2RheS5qc1wiO1xuaW1wb3J0IHt0aW1lU3VuZGF5LCB1dGNTdW5kYXl9IGZyb20gXCIuL3dlZWsuanNcIjtcbmltcG9ydCB7dGltZU1vbnRoLCB1dGNNb250aH0gZnJvbSBcIi4vbW9udGguanNcIjtcbmltcG9ydCB7dGltZVllYXIsIHV0Y1llYXJ9IGZyb20gXCIuL3llYXIuanNcIjtcblxuZnVuY3Rpb24gdGlja2VyKHllYXIsIG1vbnRoLCB3ZWVrLCBkYXksIGhvdXIsIG1pbnV0ZSkge1xuXG4gIGNvbnN0IHRpY2tJbnRlcnZhbHMgPSBbXG4gICAgW3NlY29uZCwgIDEsICAgICAgZHVyYXRpb25TZWNvbmRdLFxuICAgIFtzZWNvbmQsICA1LCAgNSAqIGR1cmF0aW9uU2Vjb25kXSxcbiAgICBbc2Vjb25kLCAxNSwgMTUgKiBkdXJhdGlvblNlY29uZF0sXG4gICAgW3NlY29uZCwgMzAsIDMwICogZHVyYXRpb25TZWNvbmRdLFxuICAgIFttaW51dGUsICAxLCAgICAgIGR1cmF0aW9uTWludXRlXSxcbiAgICBbbWludXRlLCAgNSwgIDUgKiBkdXJhdGlvbk1pbnV0ZV0sXG4gICAgW21pbnV0ZSwgMTUsIDE1ICogZHVyYXRpb25NaW51dGVdLFxuICAgIFttaW51dGUsIDMwLCAzMCAqIGR1cmF0aW9uTWludXRlXSxcbiAgICBbICBob3VyLCAgMSwgICAgICBkdXJhdGlvbkhvdXIgIF0sXG4gICAgWyAgaG91ciwgIDMsICAzICogZHVyYXRpb25Ib3VyICBdLFxuICAgIFsgIGhvdXIsICA2LCAgNiAqIGR1cmF0aW9uSG91ciAgXSxcbiAgICBbICBob3VyLCAxMiwgMTIgKiBkdXJhdGlvbkhvdXIgIF0sXG4gICAgWyAgIGRheSwgIDEsICAgICAgZHVyYXRpb25EYXkgICBdLFxuICAgIFsgICBkYXksICAyLCAgMiAqIGR1cmF0aW9uRGF5ICAgXSxcbiAgICBbICB3ZWVrLCAgMSwgICAgICBkdXJhdGlvbldlZWsgIF0sXG4gICAgWyBtb250aCwgIDEsICAgICAgZHVyYXRpb25Nb250aCBdLFxuICAgIFsgbW9udGgsICAzLCAgMyAqIGR1cmF0aW9uTW9udGggXSxcbiAgICBbICB5ZWFyLCAgMSwgICAgICBkdXJhdGlvblllYXIgIF1cbiAgXTtcblxuICBmdW5jdGlvbiB0aWNrcyhzdGFydCwgc3RvcCwgY291bnQpIHtcbiAgICBjb25zdCByZXZlcnNlID0gc3RvcCA8IHN0YXJ0O1xuICAgIGlmIChyZXZlcnNlKSBbc3RhcnQsIHN0b3BdID0gW3N0b3AsIHN0YXJ0XTtcbiAgICBjb25zdCBpbnRlcnZhbCA9IGNvdW50ICYmIHR5cGVvZiBjb3VudC5yYW5nZSA9PT0gXCJmdW5jdGlvblwiID8gY291bnQgOiB0aWNrSW50ZXJ2YWwoc3RhcnQsIHN0b3AsIGNvdW50KTtcbiAgICBjb25zdCB0aWNrcyA9IGludGVydmFsID8gaW50ZXJ2YWwucmFuZ2Uoc3RhcnQsICtzdG9wICsgMSkgOiBbXTsgLy8gaW5jbHVzaXZlIHN0b3BcbiAgICByZXR1cm4gcmV2ZXJzZSA/IHRpY2tzLnJldmVyc2UoKSA6IHRpY2tzO1xuICB9XG5cbiAgZnVuY3Rpb24gdGlja0ludGVydmFsKHN0YXJ0LCBzdG9wLCBjb3VudCkge1xuICAgIGNvbnN0IHRhcmdldCA9IE1hdGguYWJzKHN0b3AgLSBzdGFydCkgLyBjb3VudDtcbiAgICBjb25zdCBpID0gYmlzZWN0b3IoKFssLCBzdGVwXSkgPT4gc3RlcCkucmlnaHQodGlja0ludGVydmFscywgdGFyZ2V0KTtcbiAgICBpZiAoaSA9PT0gdGlja0ludGVydmFscy5sZW5ndGgpIHJldHVybiB5ZWFyLmV2ZXJ5KHRpY2tTdGVwKHN0YXJ0IC8gZHVyYXRpb25ZZWFyLCBzdG9wIC8gZHVyYXRpb25ZZWFyLCBjb3VudCkpO1xuICAgIGlmIChpID09PSAwKSByZXR1cm4gbWlsbGlzZWNvbmQuZXZlcnkoTWF0aC5tYXgodGlja1N0ZXAoc3RhcnQsIHN0b3AsIGNvdW50KSwgMSkpO1xuICAgIGNvbnN0IFt0LCBzdGVwXSA9IHRpY2tJbnRlcnZhbHNbdGFyZ2V0IC8gdGlja0ludGVydmFsc1tpIC0gMV1bMl0gPCB0aWNrSW50ZXJ2YWxzW2ldWzJdIC8gdGFyZ2V0ID8gaSAtIDEgOiBpXTtcbiAgICByZXR1cm4gdC5ldmVyeShzdGVwKTtcbiAgfVxuXG4gIHJldHVybiBbdGlja3MsIHRpY2tJbnRlcnZhbF07XG59XG5cbmNvbnN0IFt1dGNUaWNrcywgdXRjVGlja0ludGVydmFsXSA9IHRpY2tlcih1dGNZZWFyLCB1dGNNb250aCwgdXRjU3VuZGF5LCB1bml4RGF5LCB1dGNIb3VyLCB1dGNNaW51dGUpO1xuY29uc3QgW3RpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbF0gPSB0aWNrZXIodGltZVllYXIsIHRpbWVNb250aCwgdGltZVN1bmRheSwgdGltZURheSwgdGltZUhvdXIsIHRpbWVNaW51dGUpO1xuXG5leHBvcnQge3V0Y1RpY2tzLCB1dGNUaWNrSW50ZXJ2YWwsIHRpbWVUaWNrcywgdGltZVRpY2tJbnRlcnZhbH07XG4iLCJpbXBvcnQge1xuICB0aW1lRGF5LFxuICB0aW1lU3VuZGF5LFxuICB0aW1lTW9uZGF5LFxuICB0aW1lVGh1cnNkYXksXG4gIHRpbWVZZWFyLFxuICB1dGNEYXksXG4gIHV0Y1N1bmRheSxcbiAgdXRjTW9uZGF5LFxuICB1dGNUaHVyc2RheSxcbiAgdXRjWWVhclxufSBmcm9tIFwiZDMtdGltZVwiO1xuXG5mdW5jdGlvbiBsb2NhbERhdGUoZCkge1xuICBpZiAoMCA8PSBkLnkgJiYgZC55IDwgMTAwKSB7XG4gICAgdmFyIGRhdGUgPSBuZXcgRGF0ZSgtMSwgZC5tLCBkLmQsIGQuSCwgZC5NLCBkLlMsIGQuTCk7XG4gICAgZGF0ZS5zZXRGdWxsWWVhcihkLnkpO1xuICAgIHJldHVybiBkYXRlO1xuICB9XG4gIHJldHVybiBuZXcgRGF0ZShkLnksIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpO1xufVxuXG5mdW5jdGlvbiB1dGNEYXRlKGQpIHtcbiAgaWYgKDAgPD0gZC55ICYmIGQueSA8IDEwMCkge1xuICAgIHZhciBkYXRlID0gbmV3IERhdGUoRGF0ZS5VVEMoLTEsIGQubSwgZC5kLCBkLkgsIGQuTSwgZC5TLCBkLkwpKTtcbiAgICBkYXRlLnNldFVUQ0Z1bGxZZWFyKGQueSk7XG4gICAgcmV0dXJuIGRhdGU7XG4gIH1cbiAgcmV0dXJuIG5ldyBEYXRlKERhdGUuVVRDKGQueSwgZC5tLCBkLmQsIGQuSCwgZC5NLCBkLlMsIGQuTCkpO1xufVxuXG5mdW5jdGlvbiBuZXdEYXRlKHksIG0sIGQpIHtcbiAgcmV0dXJuIHt5OiB5LCBtOiBtLCBkOiBkLCBIOiAwLCBNOiAwLCBTOiAwLCBMOiAwfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZm9ybWF0TG9jYWxlKGxvY2FsZSkge1xuICB2YXIgbG9jYWxlX2RhdGVUaW1lID0gbG9jYWxlLmRhdGVUaW1lLFxuICAgICAgbG9jYWxlX2RhdGUgPSBsb2NhbGUuZGF0ZSxcbiAgICAgIGxvY2FsZV90aW1lID0gbG9jYWxlLnRpbWUsXG4gICAgICBsb2NhbGVfcGVyaW9kcyA9IGxvY2FsZS5wZXJpb2RzLFxuICAgICAgbG9jYWxlX3dlZWtkYXlzID0gbG9jYWxlLmRheXMsXG4gICAgICBsb2NhbGVfc2hvcnRXZWVrZGF5cyA9IGxvY2FsZS5zaG9ydERheXMsXG4gICAgICBsb2NhbGVfbW9udGhzID0gbG9jYWxlLm1vbnRocyxcbiAgICAgIGxvY2FsZV9zaG9ydE1vbnRocyA9IGxvY2FsZS5zaG9ydE1vbnRocztcblxuICB2YXIgcGVyaW9kUmUgPSBmb3JtYXRSZShsb2NhbGVfcGVyaW9kcyksXG4gICAgICBwZXJpb2RMb29rdXAgPSBmb3JtYXRMb29rdXAobG9jYWxlX3BlcmlvZHMpLFxuICAgICAgd2Vla2RheVJlID0gZm9ybWF0UmUobG9jYWxlX3dlZWtkYXlzKSxcbiAgICAgIHdlZWtkYXlMb29rdXAgPSBmb3JtYXRMb29rdXAobG9jYWxlX3dlZWtkYXlzKSxcbiAgICAgIHNob3J0V2Vla2RheVJlID0gZm9ybWF0UmUobG9jYWxlX3Nob3J0V2Vla2RheXMpLFxuICAgICAgc2hvcnRXZWVrZGF5TG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9zaG9ydFdlZWtkYXlzKSxcbiAgICAgIG1vbnRoUmUgPSBmb3JtYXRSZShsb2NhbGVfbW9udGhzKSxcbiAgICAgIG1vbnRoTG9va3VwID0gZm9ybWF0TG9va3VwKGxvY2FsZV9tb250aHMpLFxuICAgICAgc2hvcnRNb250aFJlID0gZm9ybWF0UmUobG9jYWxlX3Nob3J0TW9udGhzKSxcbiAgICAgIHNob3J0TW9udGhMb29rdXAgPSBmb3JtYXRMb29rdXAobG9jYWxlX3Nob3J0TW9udGhzKTtcblxuICB2YXIgZm9ybWF0cyA9IHtcbiAgICBcImFcIjogZm9ybWF0U2hvcnRXZWVrZGF5LFxuICAgIFwiQVwiOiBmb3JtYXRXZWVrZGF5LFxuICAgIFwiYlwiOiBmb3JtYXRTaG9ydE1vbnRoLFxuICAgIFwiQlwiOiBmb3JtYXRNb250aCxcbiAgICBcImNcIjogbnVsbCxcbiAgICBcImRcIjogZm9ybWF0RGF5T2ZNb250aCxcbiAgICBcImVcIjogZm9ybWF0RGF5T2ZNb250aCxcbiAgICBcImZcIjogZm9ybWF0TWljcm9zZWNvbmRzLFxuICAgIFwiZ1wiOiBmb3JtYXRZZWFySVNPLFxuICAgIFwiR1wiOiBmb3JtYXRGdWxsWWVhcklTTyxcbiAgICBcIkhcIjogZm9ybWF0SG91cjI0LFxuICAgIFwiSVwiOiBmb3JtYXRIb3VyMTIsXG4gICAgXCJqXCI6IGZvcm1hdERheU9mWWVhcixcbiAgICBcIkxcIjogZm9ybWF0TWlsbGlzZWNvbmRzLFxuICAgIFwibVwiOiBmb3JtYXRNb250aE51bWJlcixcbiAgICBcIk1cIjogZm9ybWF0TWludXRlcyxcbiAgICBcInBcIjogZm9ybWF0UGVyaW9kLFxuICAgIFwicVwiOiBmb3JtYXRRdWFydGVyLFxuICAgIFwiUVwiOiBmb3JtYXRVbml4VGltZXN0YW1wLFxuICAgIFwic1wiOiBmb3JtYXRVbml4VGltZXN0YW1wU2Vjb25kcyxcbiAgICBcIlNcIjogZm9ybWF0U2Vjb25kcyxcbiAgICBcInVcIjogZm9ybWF0V2Vla2RheU51bWJlck1vbmRheSxcbiAgICBcIlVcIjogZm9ybWF0V2Vla051bWJlclN1bmRheSxcbiAgICBcIlZcIjogZm9ybWF0V2Vla051bWJlcklTTyxcbiAgICBcIndcIjogZm9ybWF0V2Vla2RheU51bWJlclN1bmRheSxcbiAgICBcIldcIjogZm9ybWF0V2Vla051bWJlck1vbmRheSxcbiAgICBcInhcIjogbnVsbCxcbiAgICBcIlhcIjogbnVsbCxcbiAgICBcInlcIjogZm9ybWF0WWVhcixcbiAgICBcIllcIjogZm9ybWF0RnVsbFllYXIsXG4gICAgXCJaXCI6IGZvcm1hdFpvbmUsXG4gICAgXCIlXCI6IGZvcm1hdExpdGVyYWxQZXJjZW50XG4gIH07XG5cbiAgdmFyIHV0Y0Zvcm1hdHMgPSB7XG4gICAgXCJhXCI6IGZvcm1hdFVUQ1Nob3J0V2Vla2RheSxcbiAgICBcIkFcIjogZm9ybWF0VVRDV2Vla2RheSxcbiAgICBcImJcIjogZm9ybWF0VVRDU2hvcnRNb250aCxcbiAgICBcIkJcIjogZm9ybWF0VVRDTW9udGgsXG4gICAgXCJjXCI6IG51bGwsXG4gICAgXCJkXCI6IGZvcm1hdFVUQ0RheU9mTW9udGgsXG4gICAgXCJlXCI6IGZvcm1hdFVUQ0RheU9mTW9udGgsXG4gICAgXCJmXCI6IGZvcm1hdFVUQ01pY3Jvc2Vjb25kcyxcbiAgICBcImdcIjogZm9ybWF0VVRDWWVhcklTTyxcbiAgICBcIkdcIjogZm9ybWF0VVRDRnVsbFllYXJJU08sXG4gICAgXCJIXCI6IGZvcm1hdFVUQ0hvdXIyNCxcbiAgICBcIklcIjogZm9ybWF0VVRDSG91cjEyLFxuICAgIFwialwiOiBmb3JtYXRVVENEYXlPZlllYXIsXG4gICAgXCJMXCI6IGZvcm1hdFVUQ01pbGxpc2Vjb25kcyxcbiAgICBcIm1cIjogZm9ybWF0VVRDTW9udGhOdW1iZXIsXG4gICAgXCJNXCI6IGZvcm1hdFVUQ01pbnV0ZXMsXG4gICAgXCJwXCI6IGZvcm1hdFVUQ1BlcmlvZCxcbiAgICBcInFcIjogZm9ybWF0VVRDUXVhcnRlcixcbiAgICBcIlFcIjogZm9ybWF0VW5peFRpbWVzdGFtcCxcbiAgICBcInNcIjogZm9ybWF0VW5peFRpbWVzdGFtcFNlY29uZHMsXG4gICAgXCJTXCI6IGZvcm1hdFVUQ1NlY29uZHMsXG4gICAgXCJ1XCI6IGZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJNb25kYXksXG4gICAgXCJVXCI6IGZvcm1hdFVUQ1dlZWtOdW1iZXJTdW5kYXksXG4gICAgXCJWXCI6IGZvcm1hdFVUQ1dlZWtOdW1iZXJJU08sXG4gICAgXCJ3XCI6IGZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJTdW5kYXksXG4gICAgXCJXXCI6IGZvcm1hdFVUQ1dlZWtOdW1iZXJNb25kYXksXG4gICAgXCJ4XCI6IG51bGwsXG4gICAgXCJYXCI6IG51bGwsXG4gICAgXCJ5XCI6IGZvcm1hdFVUQ1llYXIsXG4gICAgXCJZXCI6IGZvcm1hdFVUQ0Z1bGxZZWFyLFxuICAgIFwiWlwiOiBmb3JtYXRVVENab25lLFxuICAgIFwiJVwiOiBmb3JtYXRMaXRlcmFsUGVyY2VudFxuICB9O1xuXG4gIHZhciBwYXJzZXMgPSB7XG4gICAgXCJhXCI6IHBhcnNlU2hvcnRXZWVrZGF5LFxuICAgIFwiQVwiOiBwYXJzZVdlZWtkYXksXG4gICAgXCJiXCI6IHBhcnNlU2hvcnRNb250aCxcbiAgICBcIkJcIjogcGFyc2VNb250aCxcbiAgICBcImNcIjogcGFyc2VMb2NhbGVEYXRlVGltZSxcbiAgICBcImRcIjogcGFyc2VEYXlPZk1vbnRoLFxuICAgIFwiZVwiOiBwYXJzZURheU9mTW9udGgsXG4gICAgXCJmXCI6IHBhcnNlTWljcm9zZWNvbmRzLFxuICAgIFwiZ1wiOiBwYXJzZVllYXIsXG4gICAgXCJHXCI6IHBhcnNlRnVsbFllYXIsXG4gICAgXCJIXCI6IHBhcnNlSG91cjI0LFxuICAgIFwiSVwiOiBwYXJzZUhvdXIyNCxcbiAgICBcImpcIjogcGFyc2VEYXlPZlllYXIsXG4gICAgXCJMXCI6IHBhcnNlTWlsbGlzZWNvbmRzLFxuICAgIFwibVwiOiBwYXJzZU1vbnRoTnVtYmVyLFxuICAgIFwiTVwiOiBwYXJzZU1pbnV0ZXMsXG4gICAgXCJwXCI6IHBhcnNlUGVyaW9kLFxuICAgIFwicVwiOiBwYXJzZVF1YXJ0ZXIsXG4gICAgXCJRXCI6IHBhcnNlVW5peFRpbWVzdGFtcCxcbiAgICBcInNcIjogcGFyc2VVbml4VGltZXN0YW1wU2Vjb25kcyxcbiAgICBcIlNcIjogcGFyc2VTZWNvbmRzLFxuICAgIFwidVwiOiBwYXJzZVdlZWtkYXlOdW1iZXJNb25kYXksXG4gICAgXCJVXCI6IHBhcnNlV2Vla051bWJlclN1bmRheSxcbiAgICBcIlZcIjogcGFyc2VXZWVrTnVtYmVySVNPLFxuICAgIFwid1wiOiBwYXJzZVdlZWtkYXlOdW1iZXJTdW5kYXksXG4gICAgXCJXXCI6IHBhcnNlV2Vla051bWJlck1vbmRheSxcbiAgICBcInhcIjogcGFyc2VMb2NhbGVEYXRlLFxuICAgIFwiWFwiOiBwYXJzZUxvY2FsZVRpbWUsXG4gICAgXCJ5XCI6IHBhcnNlWWVhcixcbiAgICBcIllcIjogcGFyc2VGdWxsWWVhcixcbiAgICBcIlpcIjogcGFyc2Vab25lLFxuICAgIFwiJVwiOiBwYXJzZUxpdGVyYWxQZXJjZW50XG4gIH07XG5cbiAgLy8gVGhlc2UgcmVjdXJzaXZlIGRpcmVjdGl2ZSBkZWZpbml0aW9ucyBtdXN0IGJlIGRlZmVycmVkLlxuICBmb3JtYXRzLnggPSBuZXdGb3JtYXQobG9jYWxlX2RhdGUsIGZvcm1hdHMpO1xuICBmb3JtYXRzLlggPSBuZXdGb3JtYXQobG9jYWxlX3RpbWUsIGZvcm1hdHMpO1xuICBmb3JtYXRzLmMgPSBuZXdGb3JtYXQobG9jYWxlX2RhdGVUaW1lLCBmb3JtYXRzKTtcbiAgdXRjRm9ybWF0cy54ID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlLCB1dGNGb3JtYXRzKTtcbiAgdXRjRm9ybWF0cy5YID0gbmV3Rm9ybWF0KGxvY2FsZV90aW1lLCB1dGNGb3JtYXRzKTtcbiAgdXRjRm9ybWF0cy5jID0gbmV3Rm9ybWF0KGxvY2FsZV9kYXRlVGltZSwgdXRjRm9ybWF0cyk7XG5cbiAgZnVuY3Rpb24gbmV3Rm9ybWF0KHNwZWNpZmllciwgZm9ybWF0cykge1xuICAgIHJldHVybiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICB2YXIgc3RyaW5nID0gW10sXG4gICAgICAgICAgaSA9IC0xLFxuICAgICAgICAgIGogPSAwLFxuICAgICAgICAgIG4gPSBzcGVjaWZpZXIubGVuZ3RoLFxuICAgICAgICAgIGMsXG4gICAgICAgICAgcGFkLFxuICAgICAgICAgIGZvcm1hdDtcblxuICAgICAgaWYgKCEoZGF0ZSBpbnN0YW5jZW9mIERhdGUpKSBkYXRlID0gbmV3IERhdGUoK2RhdGUpO1xuXG4gICAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgICBpZiAoc3BlY2lmaWVyLmNoYXJDb2RlQXQoaSkgPT09IDM3KSB7XG4gICAgICAgICAgc3RyaW5nLnB1c2goc3BlY2lmaWVyLnNsaWNlKGosIGkpKTtcbiAgICAgICAgICBpZiAoKHBhZCA9IHBhZHNbYyA9IHNwZWNpZmllci5jaGFyQXQoKytpKV0pICE9IG51bGwpIGMgPSBzcGVjaWZpZXIuY2hhckF0KCsraSk7XG4gICAgICAgICAgZWxzZSBwYWQgPSBjID09PSBcImVcIiA/IFwiIFwiIDogXCIwXCI7XG4gICAgICAgICAgaWYgKGZvcm1hdCA9IGZvcm1hdHNbY10pIGMgPSBmb3JtYXQoZGF0ZSwgcGFkKTtcbiAgICAgICAgICBzdHJpbmcucHVzaChjKTtcbiAgICAgICAgICBqID0gaSArIDE7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgc3RyaW5nLnB1c2goc3BlY2lmaWVyLnNsaWNlKGosIGkpKTtcbiAgICAgIHJldHVybiBzdHJpbmcuam9pbihcIlwiKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gbmV3UGFyc2Uoc3BlY2lmaWVyLCBaKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgdmFyIGQgPSBuZXdEYXRlKDE5MDAsIHVuZGVmaW5lZCwgMSksXG4gICAgICAgICAgaSA9IHBhcnNlU3BlY2lmaWVyKGQsIHNwZWNpZmllciwgc3RyaW5nICs9IFwiXCIsIDApLFxuICAgICAgICAgIHdlZWssIGRheTtcbiAgICAgIGlmIChpICE9IHN0cmluZy5sZW5ndGgpIHJldHVybiBudWxsO1xuXG4gICAgICAvLyBJZiBhIFVOSVggdGltZXN0YW1wIGlzIHNwZWNpZmllZCwgcmV0dXJuIGl0LlxuICAgICAgaWYgKFwiUVwiIGluIGQpIHJldHVybiBuZXcgRGF0ZShkLlEpO1xuICAgICAgaWYgKFwic1wiIGluIGQpIHJldHVybiBuZXcgRGF0ZShkLnMgKiAxMDAwICsgKFwiTFwiIGluIGQgPyBkLkwgOiAwKSk7XG5cbiAgICAgIC8vIElmIHRoaXMgaXMgdXRjUGFyc2UsIG5ldmVyIHVzZSB0aGUgbG9jYWwgdGltZXpvbmUuXG4gICAgICBpZiAoWiAmJiAhKFwiWlwiIGluIGQpKSBkLlogPSAwO1xuXG4gICAgICAvLyBUaGUgYW0tcG0gZmxhZyBpcyAwIGZvciBBTSwgYW5kIDEgZm9yIFBNLlxuICAgICAgaWYgKFwicFwiIGluIGQpIGQuSCA9IGQuSCAlIDEyICsgZC5wICogMTI7XG5cbiAgICAgIC8vIElmIHRoZSBtb250aCB3YXMgbm90IHNwZWNpZmllZCwgaW5oZXJpdCBmcm9tIHRoZSBxdWFydGVyLlxuICAgICAgaWYgKGQubSA9PT0gdW5kZWZpbmVkKSBkLm0gPSBcInFcIiBpbiBkID8gZC5xIDogMDtcblxuICAgICAgLy8gQ29udmVydCBkYXktb2Ytd2VlayBhbmQgd2Vlay1vZi15ZWFyIHRvIGRheS1vZi15ZWFyLlxuICAgICAgaWYgKFwiVlwiIGluIGQpIHtcbiAgICAgICAgaWYgKGQuViA8IDEgfHwgZC5WID4gNTMpIHJldHVybiBudWxsO1xuICAgICAgICBpZiAoIShcIndcIiBpbiBkKSkgZC53ID0gMTtcbiAgICAgICAgaWYgKFwiWlwiIGluIGQpIHtcbiAgICAgICAgICB3ZWVrID0gdXRjRGF0ZShuZXdEYXRlKGQueSwgMCwgMSkpLCBkYXkgPSB3ZWVrLmdldFVUQ0RheSgpO1xuICAgICAgICAgIHdlZWsgPSBkYXkgPiA0IHx8IGRheSA9PT0gMCA/IHV0Y01vbmRheS5jZWlsKHdlZWspIDogdXRjTW9uZGF5KHdlZWspO1xuICAgICAgICAgIHdlZWsgPSB1dGNEYXkub2Zmc2V0KHdlZWssIChkLlYgLSAxKSAqIDcpO1xuICAgICAgICAgIGQueSA9IHdlZWsuZ2V0VVRDRnVsbFllYXIoKTtcbiAgICAgICAgICBkLm0gPSB3ZWVrLmdldFVUQ01vbnRoKCk7XG4gICAgICAgICAgZC5kID0gd2Vlay5nZXRVVENEYXRlKCkgKyAoZC53ICsgNikgJSA3O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdlZWsgPSBsb2NhbERhdGUobmV3RGF0ZShkLnksIDAsIDEpKSwgZGF5ID0gd2Vlay5nZXREYXkoKTtcbiAgICAgICAgICB3ZWVrID0gZGF5ID4gNCB8fCBkYXkgPT09IDAgPyB0aW1lTW9uZGF5LmNlaWwod2VlaykgOiB0aW1lTW9uZGF5KHdlZWspO1xuICAgICAgICAgIHdlZWsgPSB0aW1lRGF5Lm9mZnNldCh3ZWVrLCAoZC5WIC0gMSkgKiA3KTtcbiAgICAgICAgICBkLnkgPSB3ZWVrLmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgZC5tID0gd2Vlay5nZXRNb250aCgpO1xuICAgICAgICAgIGQuZCA9IHdlZWsuZ2V0RGF0ZSgpICsgKGQudyArIDYpICUgNztcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChcIldcIiBpbiBkIHx8IFwiVVwiIGluIGQpIHtcbiAgICAgICAgaWYgKCEoXCJ3XCIgaW4gZCkpIGQudyA9IFwidVwiIGluIGQgPyBkLnUgJSA3IDogXCJXXCIgaW4gZCA/IDEgOiAwO1xuICAgICAgICBkYXkgPSBcIlpcIiBpbiBkID8gdXRjRGF0ZShuZXdEYXRlKGQueSwgMCwgMSkpLmdldFVUQ0RheSgpIDogbG9jYWxEYXRlKG5ld0RhdGUoZC55LCAwLCAxKSkuZ2V0RGF5KCk7XG4gICAgICAgIGQubSA9IDA7XG4gICAgICAgIGQuZCA9IFwiV1wiIGluIGQgPyAoZC53ICsgNikgJSA3ICsgZC5XICogNyAtIChkYXkgKyA1KSAlIDcgOiBkLncgKyBkLlUgKiA3IC0gKGRheSArIDYpICUgNztcbiAgICAgIH1cblxuICAgICAgLy8gSWYgYSB0aW1lIHpvbmUgaXMgc3BlY2lmaWVkLCBhbGwgZmllbGRzIGFyZSBpbnRlcnByZXRlZCBhcyBVVEMgYW5kIHRoZW5cbiAgICAgIC8vIG9mZnNldCBhY2NvcmRpbmcgdG8gdGhlIHNwZWNpZmllZCB0aW1lIHpvbmUuXG4gICAgICBpZiAoXCJaXCIgaW4gZCkge1xuICAgICAgICBkLkggKz0gZC5aIC8gMTAwIHwgMDtcbiAgICAgICAgZC5NICs9IGQuWiAlIDEwMDtcbiAgICAgICAgcmV0dXJuIHV0Y0RhdGUoZCk7XG4gICAgICB9XG5cbiAgICAgIC8vIE90aGVyd2lzZSwgYWxsIGZpZWxkcyBhcmUgaW4gbG9jYWwgdGltZS5cbiAgICAgIHJldHVybiBsb2NhbERhdGUoZCk7XG4gICAgfTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlU3BlY2lmaWVyKGQsIHNwZWNpZmllciwgc3RyaW5nLCBqKSB7XG4gICAgdmFyIGkgPSAwLFxuICAgICAgICBuID0gc3BlY2lmaWVyLmxlbmd0aCxcbiAgICAgICAgbSA9IHN0cmluZy5sZW5ndGgsXG4gICAgICAgIGMsXG4gICAgICAgIHBhcnNlO1xuXG4gICAgd2hpbGUgKGkgPCBuKSB7XG4gICAgICBpZiAoaiA+PSBtKSByZXR1cm4gLTE7XG4gICAgICBjID0gc3BlY2lmaWVyLmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgIGlmIChjID09PSAzNykge1xuICAgICAgICBjID0gc3BlY2lmaWVyLmNoYXJBdChpKyspO1xuICAgICAgICBwYXJzZSA9IHBhcnNlc1tjIGluIHBhZHMgPyBzcGVjaWZpZXIuY2hhckF0KGkrKykgOiBjXTtcbiAgICAgICAgaWYgKCFwYXJzZSB8fCAoKGogPSBwYXJzZShkLCBzdHJpbmcsIGopKSA8IDApKSByZXR1cm4gLTE7XG4gICAgICB9IGVsc2UgaWYgKGMgIT0gc3RyaW5nLmNoYXJDb2RlQXQoaisrKSkge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGo7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVBlcmlvZChkLCBzdHJpbmcsIGkpIHtcbiAgICB2YXIgbiA9IHBlcmlvZFJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLnAgPSBwZXJpb2RMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlU2hvcnRXZWVrZGF5KGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gc2hvcnRXZWVrZGF5UmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICAgIHJldHVybiBuID8gKGQudyA9IHNob3J0V2Vla2RheUxvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VXZWVrZGF5KGQsIHN0cmluZywgaSkge1xuICAgIHZhciBuID0gd2Vla2RheVJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLncgPSB3ZWVrZGF5TG9va3VwLmdldChuWzBdLnRvTG93ZXJDYXNlKCkpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVNob3J0TW9udGgoZCwgc3RyaW5nLCBpKSB7XG4gICAgdmFyIG4gPSBzaG9ydE1vbnRoUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICAgIHJldHVybiBuID8gKGQubSA9IHNob3J0TW9udGhMb29rdXAuZ2V0KG5bMF0udG9Mb3dlckNhc2UoKSksIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTW9udGgoZCwgc3RyaW5nLCBpKSB7XG4gICAgdmFyIG4gPSBtb250aFJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgICByZXR1cm4gbiA/IChkLm0gPSBtb250aExvb2t1cC5nZXQoblswXS50b0xvd2VyQ2FzZSgpKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VMb2NhbGVEYXRlVGltZShkLCBzdHJpbmcsIGkpIHtcbiAgICByZXR1cm4gcGFyc2VTcGVjaWZpZXIoZCwgbG9jYWxlX2RhdGVUaW1lLCBzdHJpbmcsIGkpO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VMb2NhbGVEYXRlKGQsIHN0cmluZywgaSkge1xuICAgIHJldHVybiBwYXJzZVNwZWNpZmllcihkLCBsb2NhbGVfZGF0ZSwgc3RyaW5nLCBpKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlTG9jYWxlVGltZShkLCBzdHJpbmcsIGkpIHtcbiAgICByZXR1cm4gcGFyc2VTcGVjaWZpZXIoZCwgbG9jYWxlX3RpbWUsIHN0cmluZywgaSk7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRTaG9ydFdlZWtkYXkoZCkge1xuICAgIHJldHVybiBsb2NhbGVfc2hvcnRXZWVrZGF5c1tkLmdldERheSgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFdlZWtkYXkoZCkge1xuICAgIHJldHVybiBsb2NhbGVfd2Vla2RheXNbZC5nZXREYXkoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRTaG9ydE1vbnRoKGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3Nob3J0TW9udGhzW2QuZ2V0TW9udGgoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRNb250aChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9tb250aHNbZC5nZXRNb250aCgpXTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFBlcmlvZChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9wZXJpb2RzWysoZC5nZXRIb3VycygpID49IDEyKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRRdWFydGVyKGQpIHtcbiAgICByZXR1cm4gMSArIH5+KGQuZ2V0TW9udGgoKSAvIDMpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDU2hvcnRXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3Nob3J0V2Vla2RheXNbZC5nZXRVVENEYXkoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRVVENXZWVrZGF5KGQpIHtcbiAgICByZXR1cm4gbG9jYWxlX3dlZWtkYXlzW2QuZ2V0VVRDRGF5KCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDU2hvcnRNb250aChkKSB7XG4gICAgcmV0dXJuIGxvY2FsZV9zaG9ydE1vbnRoc1tkLmdldFVUQ01vbnRoKCldO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDTW9udGgoZCkge1xuICAgIHJldHVybiBsb2NhbGVfbW9udGhzW2QuZ2V0VVRDTW9udGgoKV07XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRVVENQZXJpb2QoZCkge1xuICAgIHJldHVybiBsb2NhbGVfcGVyaW9kc1srKGQuZ2V0VVRDSG91cnMoKSA+PSAxMildO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VVRDUXVhcnRlcihkKSB7XG4gICAgcmV0dXJuIDEgKyB+fihkLmdldFVUQ01vbnRoKCkgLyAzKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZm9ybWF0OiBmdW5jdGlvbihzcGVjaWZpZXIpIHtcbiAgICAgIHZhciBmID0gbmV3Rm9ybWF0KHNwZWNpZmllciArPSBcIlwiLCBmb3JtYXRzKTtcbiAgICAgIGYudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBmO1xuICAgIH0sXG4gICAgcGFyc2U6IGZ1bmN0aW9uKHNwZWNpZmllcikge1xuICAgICAgdmFyIHAgPSBuZXdQYXJzZShzcGVjaWZpZXIgKz0gXCJcIiwgZmFsc2UpO1xuICAgICAgcC50b1N0cmluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3BlY2lmaWVyOyB9O1xuICAgICAgcmV0dXJuIHA7XG4gICAgfSxcbiAgICB1dGNGb3JtYXQ6IGZ1bmN0aW9uKHNwZWNpZmllcikge1xuICAgICAgdmFyIGYgPSBuZXdGb3JtYXQoc3BlY2lmaWVyICs9IFwiXCIsIHV0Y0Zvcm1hdHMpO1xuICAgICAgZi50b1N0cmluZyA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gc3BlY2lmaWVyOyB9O1xuICAgICAgcmV0dXJuIGY7XG4gICAgfSxcbiAgICB1dGNQYXJzZTogZnVuY3Rpb24oc3BlY2lmaWVyKSB7XG4gICAgICB2YXIgcCA9IG5ld1BhcnNlKHNwZWNpZmllciArPSBcIlwiLCB0cnVlKTtcbiAgICAgIHAudG9TdHJpbmcgPSBmdW5jdGlvbigpIHsgcmV0dXJuIHNwZWNpZmllcjsgfTtcbiAgICAgIHJldHVybiBwO1xuICAgIH1cbiAgfTtcbn1cblxudmFyIHBhZHMgPSB7XCItXCI6IFwiXCIsIFwiX1wiOiBcIiBcIiwgXCIwXCI6IFwiMFwifSxcbiAgICBudW1iZXJSZSA9IC9eXFxzKlxcZCsvLCAvLyBub3RlOiBpZ25vcmVzIG5leHQgZGlyZWN0aXZlXG4gICAgcGVyY2VudFJlID0gL14lLyxcbiAgICByZXF1b3RlUmUgPSAvW1xcXFxeJCorP3xbXFxdKCkue31dL2c7XG5cbmZ1bmN0aW9uIHBhZCh2YWx1ZSwgZmlsbCwgd2lkdGgpIHtcbiAgdmFyIHNpZ24gPSB2YWx1ZSA8IDAgPyBcIi1cIiA6IFwiXCIsXG4gICAgICBzdHJpbmcgPSAoc2lnbiA/IC12YWx1ZSA6IHZhbHVlKSArIFwiXCIsXG4gICAgICBsZW5ndGggPSBzdHJpbmcubGVuZ3RoO1xuICByZXR1cm4gc2lnbiArIChsZW5ndGggPCB3aWR0aCA/IG5ldyBBcnJheSh3aWR0aCAtIGxlbmd0aCArIDEpLmpvaW4oZmlsbCkgKyBzdHJpbmcgOiBzdHJpbmcpO1xufVxuXG5mdW5jdGlvbiByZXF1b3RlKHMpIHtcbiAgcmV0dXJuIHMucmVwbGFjZShyZXF1b3RlUmUsIFwiXFxcXCQmXCIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRSZShuYW1lcykge1xuICByZXR1cm4gbmV3IFJlZ0V4cChcIl4oPzpcIiArIG5hbWVzLm1hcChyZXF1b3RlKS5qb2luKFwifFwiKSArIFwiKVwiLCBcImlcIik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdExvb2t1cChuYW1lcykge1xuICByZXR1cm4gbmV3IE1hcChuYW1lcy5tYXAoKG5hbWUsIGkpID0+IFtuYW1lLnRvTG93ZXJDYXNlKCksIGldKSk7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2Vla2RheU51bWJlclN1bmRheShkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMSkpO1xuICByZXR1cm4gbiA/IChkLncgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtkYXlOdW1iZXJNb25kYXkoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDEpKTtcbiAgcmV0dXJuIG4gPyAoZC51ID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VXZWVrTnVtYmVyU3VuZGF5KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuVSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlV2Vla051bWJlcklTTyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLlYgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVdlZWtOdW1iZXJNb25kYXkoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5XID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VGdWxsWWVhcihkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgNCkpO1xuICByZXR1cm4gbiA/IChkLnkgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVllYXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC55ID0gK25bMF0gKyAoK25bMF0gPiA2OCA/IDE5MDAgOiAyMDAwKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVpvbmUoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gL14oWil8KFsrLV1cXGRcXGQpKD86Oj8oXFxkXFxkKSk/Ly5leGVjKHN0cmluZy5zbGljZShpLCBpICsgNikpO1xuICByZXR1cm4gbiA/IChkLlogPSBuWzFdID8gMCA6IC0oblsyXSArIChuWzNdIHx8IFwiMDBcIikpLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlUXVhcnRlcihkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMSkpO1xuICByZXR1cm4gbiA/IChkLnEgPSBuWzBdICogMyAtIDMsIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNb250aE51bWJlcihkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLm0gPSBuWzBdIC0gMSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZURheU9mTW9udGgoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5kID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VEYXlPZlllYXIoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDMpKTtcbiAgcmV0dXJuIG4gPyAoZC5tID0gMCwgZC5kID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VIb3VyMjQoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSwgaSArIDIpKTtcbiAgcmV0dXJuIG4gPyAoZC5IID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gcGFyc2VNaW51dGVzKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGksIGkgKyAyKSk7XG4gIHJldHVybiBuID8gKGQuTSA9ICtuWzBdLCBpICsgblswXS5sZW5ndGgpIDogLTE7XG59XG5cbmZ1bmN0aW9uIHBhcnNlU2Vjb25kcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMikpO1xuICByZXR1cm4gbiA/IChkLlMgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZU1pbGxpc2Vjb25kcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMykpO1xuICByZXR1cm4gbiA/IChkLkwgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZU1pY3Jvc2Vjb25kcyhkLCBzdHJpbmcsIGkpIHtcbiAgdmFyIG4gPSBudW1iZXJSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgNikpO1xuICByZXR1cm4gbiA/IChkLkwgPSBNYXRoLmZsb29yKG5bMF0gLyAxMDAwKSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZUxpdGVyYWxQZXJjZW50KGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IHBlcmNlbnRSZS5leGVjKHN0cmluZy5zbGljZShpLCBpICsgMSkpO1xuICByZXR1cm4gbiA/IGkgKyBuWzBdLmxlbmd0aCA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVVuaXhUaW1lc3RhbXAoZCwgc3RyaW5nLCBpKSB7XG4gIHZhciBuID0gbnVtYmVyUmUuZXhlYyhzdHJpbmcuc2xpY2UoaSkpO1xuICByZXR1cm4gbiA/IChkLlEgPSArblswXSwgaSArIG5bMF0ubGVuZ3RoKSA6IC0xO1xufVxuXG5mdW5jdGlvbiBwYXJzZVVuaXhUaW1lc3RhbXBTZWNvbmRzKGQsIHN0cmluZywgaSkge1xuICB2YXIgbiA9IG51bWJlclJlLmV4ZWMoc3RyaW5nLnNsaWNlKGkpKTtcbiAgcmV0dXJuIG4gPyAoZC5zID0gK25bMF0sIGkgKyBuWzBdLmxlbmd0aCkgOiAtMTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF5T2ZNb250aChkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXREYXRlKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRIb3VyMjQoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0SG91cnMoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEhvdXIxMihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRIb3VycygpICUgMTIgfHwgMTIsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXREYXlPZlllYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKDEgKyB0aW1lRGF5LmNvdW50KHRpbWVZZWFyKGQpLCBkKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdE1pbGxpc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRNaWxsaXNlY29uZHMoKSwgcCwgMyk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdE1pY3Jvc2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBmb3JtYXRNaWxsaXNlY29uZHMoZCwgcCkgKyBcIjAwMFwiO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRNb250aE51bWJlcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRNb250aCgpICsgMSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdE1pbnV0ZXMoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0TWludXRlcygpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0U2Vjb25kcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRTZWNvbmRzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrZGF5TnVtYmVyTW9uZGF5KGQpIHtcbiAgdmFyIGRheSA9IGQuZ2V0RGF5KCk7XG4gIHJldHVybiBkYXkgPT09IDAgPyA3IDogZGF5O1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrTnVtYmVyU3VuZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh0aW1lU3VuZGF5LmNvdW50KHRpbWVZZWFyKGQpIC0gMSwgZCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBkSVNPKGQpIHtcbiAgdmFyIGRheSA9IGQuZ2V0RGF5KCk7XG4gIHJldHVybiAoZGF5ID49IDQgfHwgZGF5ID09PSAwKSA/IHRpbWVUaHVyc2RheShkKSA6IHRpbWVUaHVyc2RheS5jZWlsKGQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrTnVtYmVySVNPKGQsIHApIHtcbiAgZCA9IGRJU08oZCk7XG4gIHJldHVybiBwYWQodGltZVRodXJzZGF5LmNvdW50KHRpbWVZZWFyKGQpLCBkKSArICh0aW1lWWVhcihkKS5nZXREYXkoKSA9PT0gNCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRXZWVrZGF5TnVtYmVyU3VuZGF5KGQpIHtcbiAgcmV0dXJuIGQuZ2V0RGF5KCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFdlZWtOdW1iZXJNb25kYXkoZCwgcCkge1xuICByZXR1cm4gcGFkKHRpbWVNb25kYXkuY291bnQodGltZVllYXIoZCkgLSAxLCBkKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFllYXIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0RnVsbFllYXIoKSAlIDEwMCwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFllYXJJU08oZCwgcCkge1xuICBkID0gZElTTyhkKTtcbiAgcmV0dXJuIHBhZChkLmdldEZ1bGxZZWFyKCkgJSAxMDAsIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRGdWxsWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRGdWxsWWVhcigpICUgMTAwMDAsIHAsIDQpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRGdWxsWWVhcklTTyhkLCBwKSB7XG4gIHZhciBkYXkgPSBkLmdldERheSgpO1xuICBkID0gKGRheSA+PSA0IHx8IGRheSA9PT0gMCkgPyB0aW1lVGh1cnNkYXkoZCkgOiB0aW1lVGh1cnNkYXkuY2VpbChkKTtcbiAgcmV0dXJuIHBhZChkLmdldEZ1bGxZZWFyKCkgJSAxMDAwMCwgcCwgNCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFpvbmUoZCkge1xuICB2YXIgeiA9IGQuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgcmV0dXJuICh6ID4gMCA/IFwiLVwiIDogKHogKj0gLTEsIFwiK1wiKSlcbiAgICAgICsgcGFkKHogLyA2MCB8IDAsIFwiMFwiLCAyKVxuICAgICAgKyBwYWQoeiAlIDYwLCBcIjBcIiwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0RheU9mTW9udGgoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDRGF0ZSgpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDSG91cjI0KGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0hvdXJzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENIb3VyMTIoZCwgcCkge1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDSG91cnMoKSAlIDEyIHx8IDEyLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDRGF5T2ZZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZCgxICsgdXRjRGF5LmNvdW50KHV0Y1llYXIoZCksIGQpLCBwLCAzKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDTWlsbGlzZWNvbmRzKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ01pbGxpc2Vjb25kcygpLCBwLCAzKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDTWljcm9zZWNvbmRzKGQsIHApIHtcbiAgcmV0dXJuIGZvcm1hdFVUQ01pbGxpc2Vjb25kcyhkLCBwKSArIFwiMDAwXCI7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ01vbnRoTnVtYmVyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ01vbnRoKCkgKyAxLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDTWludXRlcyhkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENNaW51dGVzKCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENTZWNvbmRzKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ1NlY29uZHMoKSwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtkYXlOdW1iZXJNb25kYXkoZCkge1xuICB2YXIgZG93ID0gZC5nZXRVVENEYXkoKTtcbiAgcmV0dXJuIGRvdyA9PT0gMCA/IDcgOiBkb3c7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1dlZWtOdW1iZXJTdW5kYXkoZCwgcCkge1xuICByZXR1cm4gcGFkKHV0Y1N1bmRheS5jb3VudCh1dGNZZWFyKGQpIC0gMSwgZCksIHAsIDIpO1xufVxuXG5mdW5jdGlvbiBVVENkSVNPKGQpIHtcbiAgdmFyIGRheSA9IGQuZ2V0VVRDRGF5KCk7XG4gIHJldHVybiAoZGF5ID49IDQgfHwgZGF5ID09PSAwKSA/IHV0Y1RodXJzZGF5KGQpIDogdXRjVGh1cnNkYXkuY2VpbChkKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDV2Vla051bWJlcklTTyhkLCBwKSB7XG4gIGQgPSBVVENkSVNPKGQpO1xuICByZXR1cm4gcGFkKHV0Y1RodXJzZGF5LmNvdW50KHV0Y1llYXIoZCksIGQpICsgKHV0Y1llYXIoZCkuZ2V0VVRDRGF5KCkgPT09IDQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDV2Vla2RheU51bWJlclN1bmRheShkKSB7XG4gIHJldHVybiBkLmdldFVUQ0RheSgpO1xufVxuXG5mdW5jdGlvbiBmb3JtYXRVVENXZWVrTnVtYmVyTW9uZGF5KGQsIHApIHtcbiAgcmV0dXJuIHBhZCh1dGNNb25kYXkuY291bnQodXRjWWVhcihkKSAtIDEsIGQpLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDWWVhcihkLCBwKSB7XG4gIHJldHVybiBwYWQoZC5nZXRVVENGdWxsWWVhcigpICUgMTAwLCBwLCAyKTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0VVRDWWVhcklTTyhkLCBwKSB7XG4gIGQgPSBVVENkSVNPKGQpO1xuICByZXR1cm4gcGFkKGQuZ2V0VVRDRnVsbFllYXIoKSAlIDEwMCwgcCwgMik7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0Z1bGxZZWFyKGQsIHApIHtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0Z1bGxZZWFyKCkgJSAxMDAwMCwgcCwgNCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ0Z1bGxZZWFySVNPKGQsIHApIHtcbiAgdmFyIGRheSA9IGQuZ2V0VVRDRGF5KCk7XG4gIGQgPSAoZGF5ID49IDQgfHwgZGF5ID09PSAwKSA/IHV0Y1RodXJzZGF5KGQpIDogdXRjVGh1cnNkYXkuY2VpbChkKTtcbiAgcmV0dXJuIHBhZChkLmdldFVUQ0Z1bGxZZWFyKCkgJSAxMDAwMCwgcCwgNCk7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVUQ1pvbmUoKSB7XG4gIHJldHVybiBcIiswMDAwXCI7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdExpdGVyYWxQZXJjZW50KCkge1xuICByZXR1cm4gXCIlXCI7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVuaXhUaW1lc3RhbXAoZCkge1xuICByZXR1cm4gK2Q7XG59XG5cbmZ1bmN0aW9uIGZvcm1hdFVuaXhUaW1lc3RhbXBTZWNvbmRzKGQpIHtcbiAgcmV0dXJuIE1hdGguZmxvb3IoK2QgLyAxMDAwKTtcbn1cbiIsImltcG9ydCBmb3JtYXRMb2NhbGUgZnJvbSBcIi4vbG9jYWxlLmpzXCI7XG5cbnZhciBsb2NhbGU7XG5leHBvcnQgdmFyIHRpbWVGb3JtYXQ7XG5leHBvcnQgdmFyIHRpbWVQYXJzZTtcbmV4cG9ydCB2YXIgdXRjRm9ybWF0O1xuZXhwb3J0IHZhciB1dGNQYXJzZTtcblxuZGVmYXVsdExvY2FsZSh7XG4gIGRhdGVUaW1lOiBcIiV4LCAlWFwiLFxuICBkYXRlOiBcIiUtbS8lLWQvJVlcIixcbiAgdGltZTogXCIlLUk6JU06JVMgJXBcIixcbiAgcGVyaW9kczogW1wiQU1cIiwgXCJQTVwiXSxcbiAgZGF5czogW1wiU3VuZGF5XCIsIFwiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIl0sXG4gIHNob3J0RGF5czogW1wiU3VuXCIsIFwiTW9uXCIsIFwiVHVlXCIsIFwiV2VkXCIsIFwiVGh1XCIsIFwiRnJpXCIsIFwiU2F0XCJdLFxuICBtb250aHM6IFtcIkphbnVhcnlcIiwgXCJGZWJydWFyeVwiLCBcIk1hcmNoXCIsIFwiQXByaWxcIiwgXCJNYXlcIiwgXCJKdW5lXCIsIFwiSnVseVwiLCBcIkF1Z3VzdFwiLCBcIlNlcHRlbWJlclwiLCBcIk9jdG9iZXJcIiwgXCJOb3ZlbWJlclwiLCBcIkRlY2VtYmVyXCJdLFxuICBzaG9ydE1vbnRoczogW1wiSmFuXCIsIFwiRmViXCIsIFwiTWFyXCIsIFwiQXByXCIsIFwiTWF5XCIsIFwiSnVuXCIsIFwiSnVsXCIsIFwiQXVnXCIsIFwiU2VwXCIsIFwiT2N0XCIsIFwiTm92XCIsIFwiRGVjXCJdXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gZGVmYXVsdExvY2FsZShkZWZpbml0aW9uKSB7XG4gIGxvY2FsZSA9IGZvcm1hdExvY2FsZShkZWZpbml0aW9uKTtcbiAgdGltZUZvcm1hdCA9IGxvY2FsZS5mb3JtYXQ7XG4gIHRpbWVQYXJzZSA9IGxvY2FsZS5wYXJzZTtcbiAgdXRjRm9ybWF0ID0gbG9jYWxlLnV0Y0Zvcm1hdDtcbiAgdXRjUGFyc2UgPSBsb2NhbGUudXRjUGFyc2U7XG4gIHJldHVybiBsb2NhbGU7XG59XG4iLCJpbXBvcnQge3RpbWVZZWFyLCB0aW1lTW9udGgsIHRpbWVXZWVrLCB0aW1lRGF5LCB0aW1lSG91ciwgdGltZU1pbnV0ZSwgdGltZVNlY29uZCwgdGltZVRpY2tzLCB0aW1lVGlja0ludGVydmFsfSBmcm9tIFwiZDMtdGltZVwiO1xuaW1wb3J0IHt0aW1lRm9ybWF0fSBmcm9tIFwiZDMtdGltZS1mb3JtYXRcIjtcbmltcG9ydCBjb250aW51b3VzLCB7Y29weX0gZnJvbSBcIi4vY29udGludW91cy5qc1wiO1xuaW1wb3J0IHtpbml0UmFuZ2V9IGZyb20gXCIuL2luaXQuanNcIjtcbmltcG9ydCBuaWNlIGZyb20gXCIuL25pY2UuanNcIjtcblxuZnVuY3Rpb24gZGF0ZSh0KSB7XG4gIHJldHVybiBuZXcgRGF0ZSh0KTtcbn1cblxuZnVuY3Rpb24gbnVtYmVyKHQpIHtcbiAgcmV0dXJuIHQgaW5zdGFuY2VvZiBEYXRlID8gK3QgOiArbmV3IERhdGUoK3QpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY2FsZW5kYXIodGlja3MsIHRpY2tJbnRlcnZhbCwgeWVhciwgbW9udGgsIHdlZWssIGRheSwgaG91ciwgbWludXRlLCBzZWNvbmQsIGZvcm1hdCkge1xuICB2YXIgc2NhbGUgPSBjb250aW51b3VzKCksXG4gICAgICBpbnZlcnQgPSBzY2FsZS5pbnZlcnQsXG4gICAgICBkb21haW4gPSBzY2FsZS5kb21haW47XG5cbiAgdmFyIGZvcm1hdE1pbGxpc2Vjb25kID0gZm9ybWF0KFwiLiVMXCIpLFxuICAgICAgZm9ybWF0U2Vjb25kID0gZm9ybWF0KFwiOiVTXCIpLFxuICAgICAgZm9ybWF0TWludXRlID0gZm9ybWF0KFwiJUk6JU1cIiksXG4gICAgICBmb3JtYXRIb3VyID0gZm9ybWF0KFwiJUkgJXBcIiksXG4gICAgICBmb3JtYXREYXkgPSBmb3JtYXQoXCIlYSAlZFwiKSxcbiAgICAgIGZvcm1hdFdlZWsgPSBmb3JtYXQoXCIlYiAlZFwiKSxcbiAgICAgIGZvcm1hdE1vbnRoID0gZm9ybWF0KFwiJUJcIiksXG4gICAgICBmb3JtYXRZZWFyID0gZm9ybWF0KFwiJVlcIik7XG5cbiAgZnVuY3Rpb24gdGlja0Zvcm1hdChkYXRlKSB7XG4gICAgcmV0dXJuIChzZWNvbmQoZGF0ZSkgPCBkYXRlID8gZm9ybWF0TWlsbGlzZWNvbmRcbiAgICAgICAgOiBtaW51dGUoZGF0ZSkgPCBkYXRlID8gZm9ybWF0U2Vjb25kXG4gICAgICAgIDogaG91cihkYXRlKSA8IGRhdGUgPyBmb3JtYXRNaW51dGVcbiAgICAgICAgOiBkYXkoZGF0ZSkgPCBkYXRlID8gZm9ybWF0SG91clxuICAgICAgICA6IG1vbnRoKGRhdGUpIDwgZGF0ZSA/ICh3ZWVrKGRhdGUpIDwgZGF0ZSA/IGZvcm1hdERheSA6IGZvcm1hdFdlZWspXG4gICAgICAgIDogeWVhcihkYXRlKSA8IGRhdGUgPyBmb3JtYXRNb250aFxuICAgICAgICA6IGZvcm1hdFllYXIpKGRhdGUpO1xuICB9XG5cbiAgc2NhbGUuaW52ZXJ0ID0gZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiBuZXcgRGF0ZShpbnZlcnQoeSkpO1xuICB9O1xuXG4gIHNjYWxlLmRvbWFpbiA9IGZ1bmN0aW9uKF8pIHtcbiAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IGRvbWFpbihBcnJheS5mcm9tKF8sIG51bWJlcikpIDogZG9tYWluKCkubWFwKGRhdGUpO1xuICB9O1xuXG4gIHNjYWxlLnRpY2tzID0gZnVuY3Rpb24oaW50ZXJ2YWwpIHtcbiAgICB2YXIgZCA9IGRvbWFpbigpO1xuICAgIHJldHVybiB0aWNrcyhkWzBdLCBkW2QubGVuZ3RoIC0gMV0sIGludGVydmFsID09IG51bGwgPyAxMCA6IGludGVydmFsKTtcbiAgfTtcblxuICBzY2FsZS50aWNrRm9ybWF0ID0gZnVuY3Rpb24oY291bnQsIHNwZWNpZmllcikge1xuICAgIHJldHVybiBzcGVjaWZpZXIgPT0gbnVsbCA/IHRpY2tGb3JtYXQgOiBmb3JtYXQoc3BlY2lmaWVyKTtcbiAgfTtcblxuICBzY2FsZS5uaWNlID0gZnVuY3Rpb24oaW50ZXJ2YWwpIHtcbiAgICB2YXIgZCA9IGRvbWFpbigpO1xuICAgIGlmICghaW50ZXJ2YWwgfHwgdHlwZW9mIGludGVydmFsLnJhbmdlICE9PSBcImZ1bmN0aW9uXCIpIGludGVydmFsID0gdGlja0ludGVydmFsKGRbMF0sIGRbZC5sZW5ndGggLSAxXSwgaW50ZXJ2YWwgPT0gbnVsbCA/IDEwIDogaW50ZXJ2YWwpO1xuICAgIHJldHVybiBpbnRlcnZhbCA/IGRvbWFpbihuaWNlKGQsIGludGVydmFsKSkgOiBzY2FsZTtcbiAgfTtcblxuICBzY2FsZS5jb3B5ID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGNvcHkoc2NhbGUsIGNhbGVuZGFyKHRpY2tzLCB0aWNrSW50ZXJ2YWwsIHllYXIsIG1vbnRoLCB3ZWVrLCBkYXksIGhvdXIsIG1pbnV0ZSwgc2Vjb25kLCBmb3JtYXQpKTtcbiAgfTtcblxuICByZXR1cm4gc2NhbGU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRpbWUoKSB7XG4gIHJldHVybiBpbml0UmFuZ2UuYXBwbHkoY2FsZW5kYXIodGltZVRpY2tzLCB0aW1lVGlja0ludGVydmFsLCB0aW1lWWVhciwgdGltZU1vbnRoLCB0aW1lV2VlaywgdGltZURheSwgdGltZUhvdXIsIHRpbWVNaW51dGUsIHRpbWVTZWNvbmQsIHRpbWVGb3JtYXQpLmRvbWFpbihbbmV3IERhdGUoMjAwMCwgMCwgMSksIG5ldyBEYXRlKDIwMDAsIDAsIDIpXSksIGFyZ3VtZW50cyk7XG59XG4iLCJleHBvcnQgZnVuY3Rpb24gVHJhbnNmb3JtKGssIHgsIHkpIHtcbiAgdGhpcy5rID0gaztcbiAgdGhpcy54ID0geDtcbiAgdGhpcy55ID0geTtcbn1cblxuVHJhbnNmb3JtLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFRyYW5zZm9ybSxcbiAgc2NhbGU6IGZ1bmN0aW9uKGspIHtcbiAgICByZXR1cm4gayA9PT0gMSA/IHRoaXMgOiBuZXcgVHJhbnNmb3JtKHRoaXMuayAqIGssIHRoaXMueCwgdGhpcy55KTtcbiAgfSxcbiAgdHJhbnNsYXRlOiBmdW5jdGlvbih4LCB5KSB7XG4gICAgcmV0dXJuIHggPT09IDAgJiB5ID09PSAwID8gdGhpcyA6IG5ldyBUcmFuc2Zvcm0odGhpcy5rLCB0aGlzLnggKyB0aGlzLmsgKiB4LCB0aGlzLnkgKyB0aGlzLmsgKiB5KTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIFtwb2ludFswXSAqIHRoaXMuayArIHRoaXMueCwgcG9pbnRbMV0gKiB0aGlzLmsgKyB0aGlzLnldO1xuICB9LFxuICBhcHBseVg6IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4geCAqIHRoaXMuayArIHRoaXMueDtcbiAgfSxcbiAgYXBwbHlZOiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIHkgKiB0aGlzLmsgKyB0aGlzLnk7XG4gIH0sXG4gIGludmVydDogZnVuY3Rpb24obG9jYXRpb24pIHtcbiAgICByZXR1cm4gWyhsb2NhdGlvblswXSAtIHRoaXMueCkgLyB0aGlzLmssIChsb2NhdGlvblsxXSAtIHRoaXMueSkgLyB0aGlzLmtdO1xuICB9LFxuICBpbnZlcnRYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuICh4IC0gdGhpcy54KSAvIHRoaXMuaztcbiAgfSxcbiAgaW52ZXJ0WTogZnVuY3Rpb24oeSkge1xuICAgIHJldHVybiAoeSAtIHRoaXMueSkgLyB0aGlzLms7XG4gIH0sXG4gIHJlc2NhbGVYOiBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHguY29weSgpLmRvbWFpbih4LnJhbmdlKCkubWFwKHRoaXMuaW52ZXJ0WCwgdGhpcykubWFwKHguaW52ZXJ0LCB4KSk7XG4gIH0sXG4gIHJlc2NhbGVZOiBmdW5jdGlvbih5KSB7XG4gICAgcmV0dXJuIHkuY29weSgpLmRvbWFpbih5LnJhbmdlKCkubWFwKHRoaXMuaW52ZXJ0WSwgdGhpcykubWFwKHkuaW52ZXJ0LCB5KSk7XG4gIH0sXG4gIHRvU3RyaW5nOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCJ0cmFuc2xhdGUoXCIgKyB0aGlzLnggKyBcIixcIiArIHRoaXMueSArIFwiKSBzY2FsZShcIiArIHRoaXMuayArIFwiKVwiO1xuICB9XG59O1xuXG5leHBvcnQgdmFyIGlkZW50aXR5ID0gbmV3IFRyYW5zZm9ybSgxLCAwLCAwKTtcblxudHJhbnNmb3JtLnByb3RvdHlwZSA9IFRyYW5zZm9ybS5wcm90b3R5cGU7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHRyYW5zZm9ybShub2RlKSB7XG4gIHdoaWxlICghbm9kZS5fX3pvb20pIGlmICghKG5vZGUgPSBub2RlLnBhcmVudE5vZGUpKSByZXR1cm4gaWRlbnRpdHk7XG4gIHJldHVybiBub2RlLl9fem9vbTtcbn1cbiIsImltcG9ydCB7IFJlYWN0RWxlbWVudCwgY3JlYXRlRWxlbWVudCwgdXNlRWZmZWN0LCB1c2VSZWYsIHVzZVN0YXRlIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBDYXRhbG9nUmVsZWFzZUNoYXJ0Q29udGFpbmVyUHJvcHMgfSBmcm9tIFwiLi4vdHlwaW5ncy9DYXRhbG9nUmVsZWFzZUNoYXJ0UHJvcHNcIjtcbmltcG9ydCB7IFZhbHVlU3RhdHVzIH0gZnJvbSBcIm1lbmRpeFwiO1xuaW1wb3J0ICogYXMgZDMgZnJvbSBcImQzXCI7XG5cbi8vIE1haW4gcmVhY3QgY29tcG9uZW50IGZvciB0aGUgQ2F0YWxvZyBSZWxlYXNlIENoYXJ0XG4vLyBSZW5kZXJzIGQzIGNoYXJ0XG5cbmltcG9ydCBcIi4vdWkvQ2F0YWxvZ1JlbGVhc2VDaGFydC5jc3NcIjtcblxuaW50ZXJmYWNlIEluZHVzdHJ5RGF0YSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHJldGlyZWQ6IERhdGU7XG4gICAgY3VycmVudDogRGF0ZTtcbiAgICB1cGNvbWluZzogc3RyaW5nO1xufVxuXG4vLyBUaGVtZSBjb2xvcnNcbmNvbnN0IGxpZ2h0VGhlbWUgPSB7XG4gICAgYmFja2dyb3VuZDogXCIjZmZmZmZmXCIsXG4gICAgdGV4dDogXCIjMzMzMzMzXCIsXG4gICAgcHJpbWFyeTogXCIjMmM1MjgyXCIsXG4gICAgc2Vjb25kYXJ5OiBcIiM3NTc1NzVcIixcbiAgICBhY2NlbnQ6IFwiI2ZmOTgwMFwiLFxuICAgIHN1Y2Nlc3M6IFwiIzhiYzM0YVwiLFxuICAgIG11dGVkOiBcIiM5ZTllOWVcIixcbiAgICBib3JkZXI6IFwiI2UwZTBlMFwiXG59O1xuXG5jb25zdCBkYXJrVGhlbWUgPSB7XG4gICAgYmFja2dyb3VuZDogXCIjMDEwMDI4XCIsXG4gICAgdGV4dDogXCIjZmZmZmZmXCIsXG4gICAgcHJpbWFyeTogXCIjMDBjYmQzXCIsXG4gICAgc2Vjb25kYXJ5OiBcIiM5YjljYTRcIixcbiAgICBhY2NlbnQ6IFwiIzAwY2JkM1wiLFxuICAgIHN1Y2Nlc3M6IFwiIzAwY2JkM1wiLFxuICAgIG11dGVkOiBcIiM5YjljYTRcIixcbiAgICBib3JkZXI6IFwiIzIzMjMzYlwiXG59O1xuXG5leHBvcnQgZnVuY3Rpb24gQ2F0YWxvZ1JlbGVhc2VDaGFydChwcm9wczogQ2F0YWxvZ1JlbGVhc2VDaGFydENvbnRhaW5lclByb3BzKTogUmVhY3RFbGVtZW50IHtcbiAgICBjb25zdCB7XG4gICAgICAgIG5hbWUsXG4gICAgICAgIGNhdGFsb2dEYXRhLFxuICAgICAgICBuYW1lQXR0cmlidXRlLFxuICAgICAgICByZXRpcmVkRGF0ZUF0dHJpYnV0ZSxcbiAgICAgICAgY3VycmVudERhdGVBdHRyaWJ1dGUsXG4gICAgICAgIHVwY29taW5nQ29kZUF0dHJpYnV0ZSxcbiAgICAgICAgY2hhcnRUaXRsZSxcbiAgICAgICAgZW5hYmxlTGVnZW5kLFxuICAgICAgICBvbkl0ZW1DbGljayxcbiAgICAgICAgcmVmcmVzaEludGVydmFsLFxuICAgICAgICBjaGFydEhlaWdodCxcbiAgICAgICAgc2hvd1RvZGF5LFxuICAgICAgICB1c2VEYXJrTW9kZVxuICAgIH0gPSBwcm9wcztcblxuICAgIGNvbnN0IHRoZW1lID0gdXNlRGFya01vZGUgPyBkYXJrVGhlbWUgOiBsaWdodFRoZW1lO1xuXG4gICAgY29uc3QgY2hhcnRSZWYgPSB1c2VSZWY8SFRNTERpdkVsZW1lbnQ+KG51bGwpO1xuICAgIC8vIFBvaW50cyB0byB0aGUgZGl2IHdoZXJlIHRoZSBEMy5qcyBjaGFydCB3aWxsIGJlIHJlbmRlcmVkLiBcbiAgICAvLyBEMyBuZWVkcyBkaXJlY3QgRE9NIGFjY2VzcyB0byBjcmVhdGUgU1ZHIGVsZW1lbnRzLCBzbyB0aGlzIHJlZiBcbiAgICAvLyBwcm92aWRlcyBhIHN0YWJsZSByZWZlcmVuY2UgdG8gdGhlIGNoYXJ0IGNvbnRhaW5lci5cblxuXG4gICAgY29uc3QgY29udGFpbmVyUmVmID0gdXNlUmVmPEhUTUxEaXZFbGVtZW50PihudWxsKTsgLy8gUmVmcyBkb24ndCB0cmlnZ2VyIHJlLXJlbmRlcnMgd2hlbiBjaGFuZ2VkXG4gICAgLy8gUG9pbnRzIHRvIHRoZSBvdXRlciBjb250YWluZXIgZGl2LiBVc2VkIHRvIG1lYXN1cmUgdGhlIHdpZGdldCdzIFxuICAgIC8vIGF2YWlsYWJsZSB3aWR0aCBmb3IgcmVzcG9uc2l2ZSBzaXppbmcuXG5cbiAgICBjb25zdCBbZGltZW5zaW9ucywgc2V0RGltZW5zaW9uc10gPSB1c2VTdGF0ZSh7IHdpZHRoOiAwLCBoZWlnaHQ6IGNoYXJ0SGVpZ2h0IH0pO1xuICAgIC8vIFN0YXRlIHRvIGhvbGQgdGhlIGRpbWVuc2lvbnMgb2YgdGhlIGNoYXJ0LCBzdHVmZiBpcyBjYWxjdWxhdGVkIGR5bmFtaWNhbGx5XG4gICAgLy8gc28gd2lkdGggaXMganVzdCBhIHBsYWNlaG9sZGVyIHVudGlsIHRoZSBmaXJzdCByZXNpemUuXG5cbiAgICBjb25zdCBbaW5kdXN0cmllcywgc2V0SW5kdXN0cmllc10gPSB1c2VTdGF0ZTxJbmR1c3RyeURhdGFbXT4oW10pO1xuICAgIC8vIFN0YXRlIHRvIGhvbGQgdGhlIHByb2Nlc3NlZCBpbmR1c3RyeSBkYXRhIGZyb20gdGhlIE1lbmRpeCBkYXRhIHNvdXJjZS5cblxuICAgIC8vIEhhbmRsZSByZXNpemVcbiAgICB1c2VFZmZlY3QoKCkgPT4ge1xuICAgICAgICBjb25zdCBoYW5kbGVSZXNpemUgPSAoKSA9PiB7XG4gICAgICAgICAgICBpZiAoY29udGFpbmVyUmVmLmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB7IHdpZHRoIH0gPSBjb250YWluZXJSZWYuY3VycmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgICAgICAgICBzZXREaW1lbnNpb25zKHtcbiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IGNoYXJ0SGVpZ2h0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgaGFuZGxlUmVzaXplKCk7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCBoYW5kbGVSZXNpemUpO1xuICAgICAgICBcbiAgICAgICAgY29uc3QgcmVzaXplT2JzZXJ2ZXIgPSBuZXcgUmVzaXplT2JzZXJ2ZXIoaGFuZGxlUmVzaXplKTtcbiAgICAgICAgaWYgKGNvbnRhaW5lclJlZi5jdXJyZW50KSB7XG4gICAgICAgICAgICByZXNpemVPYnNlcnZlci5vYnNlcnZlKGNvbnRhaW5lclJlZi5jdXJyZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcigncmVzaXplJywgaGFuZGxlUmVzaXplKTtcbiAgICAgICAgICAgIHJlc2l6ZU9ic2VydmVyLmRpc2Nvbm5lY3QoKTtcbiAgICAgICAgfTtcbiAgICB9LCBbY2hhcnRIZWlnaHRdKTtcblxuICAgIC8vIFByb2Nlc3MgZGF0YSBmcm9tIE1lbmRpeCBkYXRhIHNvdXJjZVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChjYXRhbG9nRGF0YSAmJiBjYXRhbG9nRGF0YS5zdGF0dXMgPT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSAmJiBjYXRhbG9nRGF0YS5pdGVtcykge1xuICAgICAgICAgICAgY29uc3QgcHJvY2Vzc2VkSW5kdXN0cmllczogSW5kdXN0cnlEYXRhW10gPSBjYXRhbG9nRGF0YS5pdGVtc1xuICAgICAgICAgICAgICAgIC5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBuYW1lID0gbmFtZUF0dHJpYnV0ZS5nZXQoaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXRpcmVkRGF0ZSA9IHJldGlyZWREYXRlQXR0cmlidXRlLmdldChpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnREYXRlID0gY3VycmVudERhdGVBdHRyaWJ1dGUuZ2V0KGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXBjb21pbmdDb2RlID0gdXBjb21pbmdDb2RlQXR0cmlidXRlLmdldChpdGVtKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gVmFsaWRhdGUgdGhhdCBhbGwgcmVxdWlyZWQgZGF0YSBpcyBhdmFpbGFibGVcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuYW1lLnN0YXR1cyAhPT0gVmFsdWVTdGF0dXMuQXZhaWxhYmxlIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0aXJlZERhdGUuc3RhdHVzICE9PSBWYWx1ZVN0YXR1cy5BdmFpbGFibGUgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdXJyZW50RGF0ZS5zdGF0dXMgIT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwY29taW5nQ29kZS5zdGF0dXMgIT09IFZhbHVlU3RhdHVzLkF2YWlsYWJsZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6IG5hbWUudmFsdWUgfHwgXCJcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXRpcmVkOiByZXRpcmVkRGF0ZS52YWx1ZSB8fCBuZXcgRGF0ZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQ6IGN1cnJlbnREYXRlLnZhbHVlIHx8IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXBjb21pbmc6IHVwY29taW5nQ29kZS52YWx1ZSB8fCBcIlRCRFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHByb2Nlc3NpbmcgY2F0YWxvZyBkYXRhIGl0ZW06XCIsIGVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKChpdGVtKTogaXRlbSBpcyBJbmR1c3RyeURhdGEgPT4gaXRlbSAhPT0gbnVsbClcbiAgICAgICAgICAgICAgICAuc29ydCgoYSwgYikgPT4gYS5uYW1lLmxvY2FsZUNvbXBhcmUoYi5uYW1lKSk7IC8vIFNvcnQgYWxwaGFiZXRpY2FsbHkgYnkgbmFtZVxuXG4gICAgICAgICAgICBzZXRJbmR1c3RyaWVzKHByb2Nlc3NlZEluZHVzdHJpZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0SW5kdXN0cmllcyhbXSk7XG4gICAgICAgIH1cbiAgICB9LCBbY2F0YWxvZ0RhdGEsIG5hbWVBdHRyaWJ1dGUsIHJldGlyZWREYXRlQXR0cmlidXRlLCBjdXJyZW50RGF0ZUF0dHJpYnV0ZSwgdXBjb21pbmdDb2RlQXR0cmlidXRlXSk7XG5cbiAgICAvLyBBdXRvLXJlZnJlc2ggZnVuY3Rpb25hbGl0eVxuICAgIHVzZUVmZmVjdCgoKSA9PiB7XG4gICAgICAgIGlmIChyZWZyZXNoSW50ZXJ2YWwgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBpbnRlcnZhbCA9IHNldEludGVydmFsKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoY2F0YWxvZ0RhdGEgJiYgY2F0YWxvZ0RhdGEucmVsb2FkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhdGFsb2dEYXRhLnJlbG9hZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHJlZnJlc2hJbnRlcnZhbCAqIDEwMDApO1xuXG4gICAgICAgICAgICByZXR1cm4gKCkgPT4gY2xlYXJJbnRlcnZhbChpbnRlcnZhbCk7XG4gICAgICAgIH1cbiAgICB9LCBbcmVmcmVzaEludGVydmFsLCBjYXRhbG9nRGF0YV0pO1xuXG4gICAgLy8gUmVuZGVyIGNoYXJ0XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKCFjaGFydFJlZi5jdXJyZW50IHx8IGRpbWVuc2lvbnMud2lkdGggPT09IDAgfHwgaW5kdXN0cmllcy5sZW5ndGggPT09IDApIHJldHVybjtcblxuICAgICAgICAvLyBDbGVhciBhbnkgZXhpc3RpbmcgY2hhcnRcbiAgICAgICAgZDMuc2VsZWN0KGNoYXJ0UmVmLmN1cnJlbnQpLnNlbGVjdEFsbChcIipcIikucmVtb3ZlKCk7XG5cbiAgICAgICAgLy8gUmVzcG9uc2l2ZSBtYXJnaW5zIGJhc2VkIG9uIGNvbnRhaW5lciB3aWR0aFxuICAgICAgICBjb25zdCBtYXJnaW4gPSB7XG4gICAgICAgICAgICB0b3A6IDgwLFxuICAgICAgICAgICAgcmlnaHQ6IGRpbWVuc2lvbnMud2lkdGggPCA4MDAgPyAxMDAgOiAxNTAsXG4gICAgICAgICAgICBib3R0b206IDQwLFxuICAgICAgICAgICAgbGVmdDogZGltZW5zaW9ucy53aWR0aCA8IDgwMCA/IDEyMCA6IDE4MFxuICAgICAgICB9O1xuICAgICAgICBcbiAgICAgICAgY29uc3Qgd2lkdGggPSBkaW1lbnNpb25zLndpZHRoIC0gbWFyZ2luLmxlZnQgLSBtYXJnaW4ucmlnaHQ7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IGRpbWVuc2lvbnMuaGVpZ2h0IC0gbWFyZ2luLnRvcCAtIG1hcmdpbi5ib3R0b207XG5cbiAgICAgICAgLy8gQ3JlYXRlIFNWRyB3aXRoIHZpZXdCb3ggZm9yIGJldHRlciBzY2FsaW5nXG4gICAgICAgIGNvbnN0IHN2ZyA9IGQzLnNlbGVjdChjaGFydFJlZi5jdXJyZW50KVxuICAgICAgICAgICAgLmFwcGVuZChcInN2Z1wiKVxuICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCBkaW1lbnNpb25zLndpZHRoKVxuICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgZGltZW5zaW9ucy5oZWlnaHQpXG4gICAgICAgICAgICAuYXR0cihcInZpZXdCb3hcIiwgYDAgMCAke2RpbWVuc2lvbnMud2lkdGh9ICR7ZGltZW5zaW9ucy5oZWlnaHR9YClcbiAgICAgICAgICAgIC5hdHRyKFwicHJlc2VydmVBc3BlY3RSYXRpb1wiLCBcInhNaWRZTWlkIG1lZXRcIilcbiAgICAgICAgICAgIC5hcHBlbmQoXCJnXCIpXG4gICAgICAgICAgICAuYXR0cihcInRyYW5zZm9ybVwiLCBgdHJhbnNsYXRlKCR7bWFyZ2luLmxlZnR9LCR7bWFyZ2luLnRvcH0pYCk7XG5cbiAgICAgICAgLy8gVGltZSBzY2FsZVxuICAgICAgICBjb25zdCB0aW1lU2NhbGUgPSBkMy5zY2FsZVRpbWUoKVxuICAgICAgICAgICAgLmRvbWFpbihbbmV3IERhdGUoMjAyMiwgNywgMSksIG5ldyBEYXRlKDIwMjUsIDExLCAzMSldKVxuICAgICAgICAgICAgLnJhbmdlKFswLCB3aWR0aF0pO1xuXG4gICAgICAgIC8vIFkgc2NhbGUgZm9yIGluZHVzdHJpZXNcbiAgICAgICAgY29uc3QgeVNjYWxlID0gZDMuc2NhbGVCYW5kKClcbiAgICAgICAgICAgIC5kb21haW4oaW5kdXN0cmllcy5tYXAoZCA9PiBkLm5hbWUpKVxuICAgICAgICAgICAgLnJhbmdlKFswLCBoZWlnaHRdKVxuICAgICAgICAgICAgLnBhZGRpbmcoMC4zKTtcblxuICAgICAgICAvLyBBZGQgdGltZWxpbmUgZGF0ZXNcbiAgICAgICAgY29uc3QgdGltZWxpbmVEYXRlcyA9IFtcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjIsIDcsIDEpLFxuICAgICAgICAgICAgbmV3IERhdGUoMjAyMywgMiwgMSksXG4gICAgICAgICAgICBuZXcgRGF0ZSgyMDIzLCA5LCAxKSxcbiAgICAgICAgICAgIG5ldyBEYXRlKDIwMjQsIDMsIDEpLFxuICAgICAgICAgICAgbmV3IERhdGUoMjAyNCwgMTAsIDEpLFxuICAgICAgICAgICAgbmV3IERhdGUoMjAyNSwgNCwgMSksXG4gICAgICAgICAgICBuZXcgRGF0ZSgyMDI1LCAxMSwgMSlcbiAgICAgICAgXTtcblxuICAgICAgICAvLyBEcmF3IG1haW4gdGltZWxpbmVcbiAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0aW1lbGluZS1saW5lXCIpXG4gICAgICAgICAgICAuYXR0cihcIngxXCIsIDApXG4gICAgICAgICAgICAuYXR0cihcInkxXCIsIC00MClcbiAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgd2lkdGgpXG4gICAgICAgICAgICAuYXR0cihcInkyXCIsIC00MCk7XG5cbiAgICAgICAgLy8gQWRkIHRpbWVsaW5lIG1hcmtlcnMgYW5kIGxhYmVsc1xuICAgICAgICB0aW1lbGluZURhdGVzLmZvckVhY2goZGF0ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCB4ID0gdGltZVNjYWxlKGRhdGUpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBzdmcuYXBwZW5kKFwiY2lyY2xlXCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjeFwiLCB4KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY3lcIiwgLTQwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiclwiLCA0KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiZmlsbFwiLCB0aGVtZS5wcmltYXJ5KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiZGF0ZS10ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIHgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIC01MClcbiAgICAgICAgICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgICAgICAgICAgLnRleHQoZDMudGltZUZvcm1hdChcIiViLSV5XCIpKGRhdGUpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8gQWRkIHRvZGF5J3MgZGF0ZSAoaWYgZW5hYmxlZClcbiAgICAgICAgaWYgKHNob3dUb2RheSkge1xuICAgICAgICAgICAgY29uc3QgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgICAgICAgICAgY29uc3QgdG9kYXlYID0gdGltZVNjYWxlKHRvZGF5KTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVG9kYXkncyB2ZXJ0aWNhbCBsaW5lXG4gICAgICAgICAgICBzdmcuYXBwZW5kKFwibGluZVwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0b2RheS1saW5lXCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCB0b2RheVgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCAtNDApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCB0b2RheVgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5MlwiLCBoZWlnaHQpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBUb2RheSdzIGNpcmNsZVxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImNpcmNsZVwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ0b2RheS1jaXJjbGVcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImN4XCIsIHRvZGF5WClcbiAgICAgICAgICAgICAgICAuYXR0cihcImN5XCIsIC00MClcbiAgICAgICAgICAgICAgICAuYXR0cihcInJcIiwgOCk7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIFRvZGF5J3MgZGF0ZSBsYWJlbFxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcInRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwidG9kYXktdGV4dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCB0b2RheVgpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIC02NSlcbiAgICAgICAgICAgICAgICAuYXR0cihcInRleHQtYW5jaG9yXCIsIFwibWlkZGxlXCIpXG4gICAgICAgICAgICAgICAgLnRleHQoZDMudGltZUZvcm1hdChcIiUtbS8lLWQvJVlcIikodG9kYXkpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEFkanVzdCBmb250IHNpemVzIGZvciBzbWFsbGVyIHNjcmVlbnNcbiAgICAgICAgY29uc3QgZm9udFNpemUgPSBkaW1lbnNpb25zLndpZHRoIDwgODAwID8gXCIxMnB4XCIgOiBcIjE0cHhcIjtcblxuICAgICAgICAvLyBEcmF3IGluZHVzdHJ5IHJvd3NcbiAgICAgICAgaW5kdXN0cmllcy5mb3JFYWNoKChpbmR1c3RyeSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgeSA9IHlTY2FsZShpbmR1c3RyeS5uYW1lKSEgKyB5U2NhbGUuYmFuZHdpZHRoKCkgLyAyO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBJbmR1c3RyeSBuYW1lXG4gICAgICAgICAgICBzdmcuYXBwZW5kKFwidGV4dFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJpbmR1c3RyeS10ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4XCIsIC0xMClcbiAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgeSArIDUpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ0ZXh0LWFuY2hvclwiLCBcImVuZFwiKVxuICAgICAgICAgICAgICAgIC5zdHlsZShcImZvbnQtc2l6ZVwiLCBmb250U2l6ZSlcbiAgICAgICAgICAgICAgICAudGV4dChpbmR1c3RyeS5uYW1lKTtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gSW5kdXN0cnkgbGluZVxuICAgICAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcImNsYXNzXCIsIFwiaW5kdXN0cnktbGluZVwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieDFcIiwgMClcbiAgICAgICAgICAgICAgICAuYXR0cihcInkxXCIsIHkpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJ4MlwiLCB3aWR0aClcbiAgICAgICAgICAgICAgICAuYXR0cihcInkyXCIsIHkpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBDb250aW51aXR5IGxpbmUgYmV0d2VlbiByZXRpcmVkIGFuZCBjdXJyZW50XG4gICAgICAgICAgICBpZiAoaW5kdXN0cnkucmV0aXJlZCAmJiBpbmR1c3RyeS5jdXJyZW50KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0aXJlZFggPSB0aW1lU2NhbGUoaW5kdXN0cnkucmV0aXJlZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudFggPSB0aW1lU2NhbGUoaW5kdXN0cnkuY3VycmVudCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImNvbnRpbnVpdHktbGluZVwiKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIngxXCIsIHJldGlyZWRYKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInkxXCIsIHkpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieDJcIiwgY3VycmVudFgpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieTJcIiwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEZ1dHVyZSBjb250aW51aXR5IGxpbmUgZnJvbSBjdXJyZW50IHRvIHVwY29taW5nXG4gICAgICAgICAgICBsZXQgdXBjb21pbmdYUG9zID0gd2lkdGggKyAyMDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgaWYgKGluZHVzdHJ5LnVwY29taW5nICE9PSBcIlRCRFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeWVhciA9IHBhcnNlSW50KFwiMjBcIiArIGluZHVzdHJ5LnVwY29taW5nLnN1YnN0cmluZygwLCAyKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9udGggPSBwYXJzZUludChpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMiwgNCkpIC0gMTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cGNvbWluZ0RhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHVwY29taW5nRGF0ZSA8PSB0aW1lU2NhbGUuZG9tYWluKClbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgdXBjb21pbmdYUG9zID0gdGltZVNjYWxlKHVwY29taW5nRGF0ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdXBjb21pbmdYUG9zID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB1cGNvbWluZ1hQb3MgPSB3aWR0aCArIDIwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAoaW5kdXN0cnkuY3VycmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRYID0gdGltZVNjYWxlKGluZHVzdHJ5LmN1cnJlbnQpO1xuICAgICAgICAgICAgICAgIGxldCBsaW5lRW5kWCA9IHVwY29taW5nWFBvcztcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAoaW5kdXN0cnkudXBjb21pbmcgPT09IFwiVEJEXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgbGluZUVuZFggPSB3aWR0aDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB1cGNvbWluZ0RhdGUgPSBuZXcgRGF0ZShwYXJzZUludChcIjIwXCIgKyBpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMCwyKSksIFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoaW5kdXN0cnkudXBjb21pbmcuc3Vic3RyaW5nKDIsNCkpLTEsMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1cGNvbWluZ0RhdGUgPiB0aW1lU2NhbGUuZG9tYWluKClbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbmVFbmRYID0gd2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5lRW5kWCA9IHRpbWVTY2FsZSh1cGNvbWluZ0RhdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgc3ZnLmFwcGVuZChcImxpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImZ1dHVyZS1jb250aW51aXR5LWxpbmVcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ4MVwiLCBjdXJyZW50WClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5MVwiLCB5KVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIngyXCIsIGxpbmVFbmRYKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInkyXCIsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBSZXRpcmVkIG1hcmtlciAoZGlhbW9uZClcbiAgICAgICAgICAgIGlmIChpbmR1c3RyeS5yZXRpcmVkKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0aXJlZFggPSB0aW1lU2NhbGUoaW5kdXN0cnkucmV0aXJlZCk7XG4gICAgICAgICAgICAgICAgY29uc3QgcmV0aXJlZE1hcmtlciA9IHN2Zy5hcHBlbmQoXCJyZWN0XCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJyZXRpcmVkLW1hcmtlclwiKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgcmV0aXJlZFggLSAxMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ5XCIsIHkgLSAxMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ3aWR0aFwiLCAyMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMjApXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwicnhcIiwgMTApXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwidHJhbnNmb3JtXCIsIGByb3RhdGUoNDUgJHtyZXRpcmVkWH0gJHt5fSlgKVxuICAgICAgICAgICAgICAgICAgICAuc3R5bGUoXCJjdXJzb3JcIiwgb25JdGVtQ2xpY2sgPyBcInBvaW50ZXJcIiA6IFwiZGVmYXVsdFwiKTtcblxuICAgICAgICAgICAgICAgIGlmIChvbkl0ZW1DbGljaykge1xuICAgICAgICAgICAgICAgICAgICByZXRpcmVkTWFya2VyLm9uKFwiY2xpY2tcIiwgKCkgPT4gb25JdGVtQ2xpY2suZXhlY3V0ZSgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIEN1cnJlbnQgbWFya2VyIChkaWFtb25kKVxuICAgICAgICAgICAgaWYgKGluZHVzdHJ5LmN1cnJlbnQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50WCA9IHRpbWVTY2FsZShpbmR1c3RyeS5jdXJyZW50KTtcbiAgICAgICAgICAgICAgICBjb25zdCBjdXJyZW50TWFya2VyID0gc3ZnLmFwcGVuZChcInJlY3RcIilcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcImN1cnJlbnQtbWFya2VyXCIpXG4gICAgICAgICAgICAgICAgICAgIC5hdHRyKFwieFwiLCBjdXJyZW50WCAtIDEwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgeSAtIDEwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcIndpZHRoXCIsIDIwKVxuICAgICAgICAgICAgICAgICAgICAuYXR0cihcImhlaWdodFwiLCAyMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJyeFwiLCAxMClcbiAgICAgICAgICAgICAgICAgICAgLmF0dHIoXCJ0cmFuc2Zvcm1cIiwgYHJvdGF0ZSg0NSAke2N1cnJlbnRYfSAke3l9KWApXG4gICAgICAgICAgICAgICAgICAgIC5zdHlsZShcImN1cnNvclwiLCBvbkl0ZW1DbGljayA/IFwicG9pbnRlclwiIDogXCJkZWZhdWx0XCIpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG9uSXRlbUNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRNYXJrZXIub24oXCJjbGlja1wiLCAoKSA9PiBvbkl0ZW1DbGljay5leGVjdXRlKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gVXBjb21pbmcgYm94IC0gYWRqdXN0ZWQgcG9zaXRpb25pbmdcbiAgICAgICAgICAgIGxldCBib3hYID0gdXBjb21pbmdYUG9zO1xuICAgICAgICAgICAgaWYgKGluZHVzdHJ5LnVwY29taW5nICE9PSBcIlRCRFwiKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgeWVhciA9IHBhcnNlSW50KFwiMjBcIiArIGluZHVzdHJ5LnVwY29taW5nLnN1YnN0cmluZygwLCAyKSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9udGggPSBwYXJzZUludChpbmR1c3RyeS51cGNvbWluZy5zdWJzdHJpbmcoMiwgNCkpIC0gMTtcbiAgICAgICAgICAgICAgICBjb25zdCB1cGNvbWluZ0RhdGUgPSBuZXcgRGF0ZSh5ZWFyLCBtb250aCwgMSk7XG4gICAgICAgICAgICAgICAgaWYgKHVwY29taW5nRGF0ZSA8PSB0aW1lU2NhbGUuZG9tYWluKClbMV0pIHtcbiAgICAgICAgICAgICAgICAgICAgYm94WCA9IHRpbWVTY2FsZSh1cGNvbWluZ0RhdGUpIC0gMzA7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgYm94WCA9IHdpZHRoIC0gNzA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBib3hYID0gd2lkdGggLSA3MDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdXBjb21pbmdCb3ggPSBzdmcuYXBwZW5kKFwicmVjdFwiKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwiY2xhc3NcIiwgXCJ1cGNvbWluZy1ib3hcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgYm94WClcbiAgICAgICAgICAgICAgICAuYXR0cihcInlcIiwgeSAtIDE1KVxuICAgICAgICAgICAgICAgIC5hdHRyKFwid2lkdGhcIiwgNjApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJoZWlnaHRcIiwgMzApXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJyeFwiLCA0KVxuICAgICAgICAgICAgICAgIC5zdHlsZShcImN1cnNvclwiLCBvbkl0ZW1DbGljayA/IFwicG9pbnRlclwiIDogXCJkZWZhdWx0XCIpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBpZiAob25JdGVtQ2xpY2spIHtcbiAgICAgICAgICAgICAgICB1cGNvbWluZ0JveC5vbihcImNsaWNrXCIsICgpID0+IG9uSXRlbUNsaWNrLmV4ZWN1dGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIHN2Zy5hcHBlbmQoXCJ0ZXh0XCIpXG4gICAgICAgICAgICAgICAgLmF0dHIoXCJjbGFzc1wiLCBcInVwY29taW5nLXRleHRcIilcbiAgICAgICAgICAgICAgICAuYXR0cihcInhcIiwgYm94WCArIDMwKVxuICAgICAgICAgICAgICAgIC5hdHRyKFwieVwiLCB5ICsgNSlcbiAgICAgICAgICAgICAgICAuc3R5bGUoXCJmb250LXNpemVcIiwgZm9udFNpemUpXG4gICAgICAgICAgICAgICAgLnRleHQoaW5kdXN0cnkudXBjb21pbmcpO1xuICAgICAgICB9KTtcbiAgICB9LCBbZGltZW5zaW9ucywgaW5kdXN0cmllcywgc2hvd1RvZGF5LCBvbkl0ZW1DbGljaywgdGhlbWVdKTtcblxuICAgIC8vIExvYWRpbmcgc3RhdGVcbiAgICBpZiAoIWNhdGFsb2dEYXRhIHx8IGNhdGFsb2dEYXRhLnN0YXR1cyA9PT0gVmFsdWVTdGF0dXMuTG9hZGluZykge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BjYXRhbG9nLXJlbGVhc2UtY2hhcnQgJHtuYW1lfWB9IHJlZj17Y29udGFpbmVyUmVmfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNoYXJ0LWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwiY2hhcnQtdGl0bGVcIj57Y2hhcnRUaXRsZX08L2gxPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxvYWRpbmctbWVzc2FnZVwiPkxvYWRpbmcgY2F0YWxvZyBkYXRhLi4uPC9kaXY+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBFcnJvciBzdGF0ZVxuICAgIGlmIChjYXRhbG9nRGF0YS5zdGF0dXMgPT09IFZhbHVlU3RhdHVzLlVuYXZhaWxhYmxlKSB7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17YGNhdGFsb2ctcmVsZWFzZS1jaGFydCAke25hbWV9YH0gcmVmPXtjb250YWluZXJSZWZ9PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2hhcnQtY29udGFpbmVyXCI+XG4gICAgICAgICAgICAgICAgICAgIDxoMSBjbGFzc05hbWU9XCJjaGFydC10aXRsZVwiPntjaGFydFRpdGxlfTwvaDE+XG4gICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZXJyb3ItbWVzc2FnZVwiPlVuYWJsZSB0byBsb2FkIGNhdGFsb2cgZGF0YS4gUGxlYXNlIGNoZWNrIHlvdXIgZGF0YSBzb3VyY2UgY29uZmlndXJhdGlvbi48L2Rpdj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICApO1xuICAgIH1cblxuICAgIC8vIE5vIGRhdGEgc3RhdGVcbiAgICBpZiAoIWNhdGFsb2dEYXRhLml0ZW1zIHx8IGNhdGFsb2dEYXRhLml0ZW1zLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9e2BjYXRhbG9nLXJlbGVhc2UtY2hhcnQgJHtuYW1lfWB9IHJlZj17Y29udGFpbmVyUmVmfT5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNoYXJ0LWNvbnRhaW5lclwiPlxuICAgICAgICAgICAgICAgICAgICA8aDEgY2xhc3NOYW1lPVwiY2hhcnQtdGl0bGVcIj57Y2hhcnRUaXRsZX08L2gxPlxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cIm5vLWRhdGEtbWVzc2FnZVwiPk5vIGNhdGFsb2cgZGF0YSBhdmFpbGFibGUuIFBsZWFzZSBhZGQgY2F0YWxvZyByZWxlYXNlIHNjaGVkdWxlcyB0byBzZWUgdGhlIGNoYXJ0LjwvZGl2PlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjYXRhbG9nLXJlbGVhc2UtY2hhcnRcIiBkYXRhLXRoZW1lPXt1c2VEYXJrTW9kZSA/IFwiZGFya1wiIDogXCJsaWdodFwifT5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY2hhcnQtY29udGFpbmVyXCIgcmVmPXtjb250YWluZXJSZWZ9PlxuICAgICAgICAgICAgICAgIHtjaGFydFRpdGxlICYmIDxoMSBjbGFzc05hbWU9XCJjaGFydC10aXRsZVwiPntjaGFydFRpdGxlfTwvaDE+fVxuICAgICAgICAgICAgICAgIHtlbmFibGVMZWdlbmQgJiYgKFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxlZ2VuZFwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsZWdlbmQtaXRlbVwiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGVnZW5kLXN5bWJvbCByZXRpcmVkLW1hcmtlclwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlJldGlyZWQ8L3NwYW4+XG4gICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibGVnZW5kLWl0ZW1cIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxlZ2VuZC1zeW1ib2wgY3VycmVudC1tYXJrZXJcIj48L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8c3Bhbj5DdXJyZW50PC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxlZ2VuZC1pdGVtXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJsZWdlbmQtc3ltYm9sIHVwY29taW5nLWJveFwiPjwvZGl2PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxzcGFuPlVwY29taW5nPC9zcGFuPlxuICAgICAgICAgICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgICl9XG4gICAgICAgICAgICAgICAgPGRpdiBpZD1cImNoYXJ0XCIgcmVmPXtjaGFydFJlZn0+PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgKTtcbn0iXSwibmFtZXMiOlsiYXNjZW5kaW5nIiwiYSIsImIiLCJOYU4iLCJkZXNjZW5kaW5nIiwiYmlzZWN0b3IiLCJmIiwiY29tcGFyZTEiLCJjb21wYXJlMiIsImRlbHRhIiwibGVuZ3RoIiwiZCIsIngiLCJ6ZXJvIiwibGVmdCIsImxvIiwiaGkiLCJtaWQiLCJyaWdodCIsImNlbnRlciIsImkiLCJudW1iZXIiLCJhc2NlbmRpbmdCaXNlY3QiLCJiaXNlY3RSaWdodCIsIkludGVybk1hcCIsIk1hcCIsImNvbnN0cnVjdG9yIiwiZW50cmllcyIsImtleSIsImtleW9mIiwiT2JqZWN0IiwiZGVmaW5lUHJvcGVydGllcyIsIl9pbnRlcm4iLCJ2YWx1ZSIsIl9rZXkiLCJzZXQiLCJnZXQiLCJpbnRlcm5fZ2V0IiwiaGFzIiwiaW50ZXJuX3NldCIsImRlbGV0ZSIsImludGVybl9kZWxldGUiLCJ2YWx1ZU9mIiwiZTEwIiwiTWF0aCIsInNxcnQiLCJlNSIsImUyIiwidGlja1NwZWMiLCJzdGFydCIsInN0b3AiLCJjb3VudCIsInN0ZXAiLCJtYXgiLCJwb3dlciIsImZsb29yIiwibG9nMTAiLCJlcnJvciIsInBvdyIsImZhY3RvciIsImkxIiwiaTIiLCJpbmMiLCJyb3VuZCIsInRpY2tJbmNyZW1lbnQiLCJ0aWNrU3RlcCIsInJldmVyc2UiLCJyYW5nZSIsIm4iLCJhcmd1bWVudHMiLCJjZWlsIiwiQXJyYXkiLCJub29wIiwiZGlzcGF0Y2giLCJfIiwidCIsInRlc3QiLCJFcnJvciIsIkRpc3BhdGNoIiwicGFyc2VUeXBlbmFtZXMiLCJ0eXBlbmFtZXMiLCJ0eXBlcyIsInRyaW0iLCJzcGxpdCIsIm1hcCIsIm5hbWUiLCJpbmRleE9mIiwic2xpY2UiLCJoYXNPd25Qcm9wZXJ0eSIsInR5cGUiLCJwcm90b3R5cGUiLCJvbiIsInR5cGVuYW1lIiwiY2FsbGJhY2siLCJUIiwiY29weSIsImNhbGwiLCJ0aGF0IiwiYXJncyIsImFwcGx5IiwiYyIsImNvbmNhdCIsInB1c2giLCJ4aHRtbCIsInN2ZyIsInhsaW5rIiwieG1sIiwieG1sbnMiLCJwcmVmaXgiLCJuYW1lc3BhY2VzIiwic3BhY2UiLCJsb2NhbCIsImNyZWF0b3JJbmhlcml0IiwiZG9jdW1lbnQiLCJvd25lckRvY3VtZW50IiwidXJpIiwibmFtZXNwYWNlVVJJIiwiZG9jdW1lbnRFbGVtZW50IiwiY3JlYXRlRWxlbWVudCIsImNyZWF0ZUVsZW1lbnROUyIsImNyZWF0b3JGaXhlZCIsImZ1bGxuYW1lIiwibmFtZXNwYWNlIiwibm9uZSIsInNlbGVjdG9yIiwicXVlcnlTZWxlY3RvciIsInNlbGVjdCIsImdyb3VwcyIsIl9ncm91cHMiLCJtIiwic3ViZ3JvdXBzIiwiaiIsImdyb3VwIiwic3ViZ3JvdXAiLCJub2RlIiwic3Vibm9kZSIsIl9fZGF0YV9fIiwiU2VsZWN0aW9uIiwiX3BhcmVudHMiLCJhcnJheSIsImlzQXJyYXkiLCJmcm9tIiwiZW1wdHkiLCJxdWVyeVNlbGVjdG9yQWxsIiwiYXJyYXlBbGwiLCJzZWxlY3RvckFsbCIsInBhcmVudHMiLCJtYXRjaGVzIiwiY2hpbGRNYXRjaGVyIiwiZmluZCIsImNoaWxkRmluZCIsIm1hdGNoIiwiY2hpbGRyZW4iLCJjaGlsZEZpcnN0IiwiZmlyc3RFbGVtZW50Q2hpbGQiLCJmaWx0ZXIiLCJjaGlsZHJlbkZpbHRlciIsInNlbGVjdEFsbCIsIm1hdGNoZXIiLCJ1cGRhdGUiLCJfZW50ZXIiLCJzcGFyc2UiLCJFbnRlck5vZGUiLCJwYXJlbnQiLCJkYXR1bSIsIl9uZXh0IiwiX3BhcmVudCIsImFwcGVuZENoaWxkIiwiY2hpbGQiLCJpbnNlcnRCZWZvcmUiLCJuZXh0IiwiYmluZEluZGV4IiwiZW50ZXIiLCJleGl0IiwiZGF0YSIsImdyb3VwTGVuZ3RoIiwiZGF0YUxlbmd0aCIsImJpbmRLZXkiLCJub2RlQnlLZXlWYWx1ZSIsImtleVZhbHVlcyIsImtleVZhbHVlIiwiYmluZCIsImNvbnN0YW50IiwiYXJyYXlsaWtlIiwiZW50ZXJHcm91cCIsInVwZGF0ZUdyb3VwIiwiZXhpdEdyb3VwIiwiaTAiLCJwcmV2aW91cyIsIl9leGl0Iiwib25lbnRlciIsIm9udXBkYXRlIiwib25leGl0Iiwic2VsZWN0aW9uIiwiYXBwZW5kIiwicmVtb3ZlIiwibWVyZ2UiLCJvcmRlciIsImNvbnRleHQiLCJncm91cHMwIiwiZ3JvdXBzMSIsIm0wIiwibTEiLCJtaW4iLCJtZXJnZXMiLCJncm91cDAiLCJncm91cDEiLCJjb21wYXJlRG9jdW1lbnRQb3NpdGlvbiIsInBhcmVudE5vZGUiLCJjb21wYXJlIiwiY29tcGFyZU5vZGUiLCJzb3J0Z3JvdXBzIiwic29ydGdyb3VwIiwic29ydCIsInNpemUiLCJhdHRyUmVtb3ZlIiwicmVtb3ZlQXR0cmlidXRlIiwiYXR0clJlbW92ZU5TIiwicmVtb3ZlQXR0cmlidXRlTlMiLCJhdHRyQ29uc3RhbnQiLCJzZXRBdHRyaWJ1dGUiLCJhdHRyQ29uc3RhbnROUyIsInNldEF0dHJpYnV0ZU5TIiwiYXR0ckZ1bmN0aW9uIiwidiIsImF0dHJGdW5jdGlvbk5TIiwiZ2V0QXR0cmlidXRlTlMiLCJnZXRBdHRyaWJ1dGUiLCJlYWNoIiwiZGVmYXVsdFZpZXciLCJzdHlsZVJlbW92ZSIsInN0eWxlIiwicmVtb3ZlUHJvcGVydHkiLCJzdHlsZUNvbnN0YW50IiwicHJpb3JpdHkiLCJzZXRQcm9wZXJ0eSIsInN0eWxlRnVuY3Rpb24iLCJzdHlsZVZhbHVlIiwiZ2V0UHJvcGVydHlWYWx1ZSIsImdldENvbXB1dGVkU3R5bGUiLCJwcm9wZXJ0eVJlbW92ZSIsInByb3BlcnR5Q29uc3RhbnQiLCJwcm9wZXJ0eUZ1bmN0aW9uIiwiY2xhc3NBcnJheSIsInN0cmluZyIsImNsYXNzTGlzdCIsIkNsYXNzTGlzdCIsIl9ub2RlIiwiX25hbWVzIiwiYWRkIiwiam9pbiIsInNwbGljZSIsImNvbnRhaW5zIiwiY2xhc3NlZEFkZCIsIm5hbWVzIiwibGlzdCIsImNsYXNzZWRSZW1vdmUiLCJjbGFzc2VkVHJ1ZSIsImNsYXNzZWRGYWxzZSIsImNsYXNzZWRGdW5jdGlvbiIsInRleHRSZW1vdmUiLCJ0ZXh0Q29udGVudCIsInRleHRDb25zdGFudCIsInRleHRGdW5jdGlvbiIsImh0bWxSZW1vdmUiLCJpbm5lckhUTUwiLCJodG1sQ29uc3RhbnQiLCJodG1sRnVuY3Rpb24iLCJyYWlzZSIsIm5leHRTaWJsaW5nIiwibG93ZXIiLCJwcmV2aW91c1NpYmxpbmciLCJmaXJzdENoaWxkIiwiY3JlYXRlIiwiY3JlYXRvciIsImNvbnN0YW50TnVsbCIsImJlZm9yZSIsInJlbW92ZUNoaWxkIiwic2VsZWN0aW9uX2Nsb25lU2hhbGxvdyIsImNsb25lIiwiY2xvbmVOb2RlIiwic2VsZWN0aW9uX2Nsb25lRGVlcCIsImRlZXAiLCJwcm9wZXJ0eSIsImNvbnRleHRMaXN0ZW5lciIsImxpc3RlbmVyIiwiZXZlbnQiLCJvblJlbW92ZSIsIl9fb24iLCJvIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9wdGlvbnMiLCJvbkFkZCIsImFkZEV2ZW50TGlzdGVuZXIiLCJkaXNwYXRjaEV2ZW50IiwicGFyYW1zIiwid2luZG93IiwiQ3VzdG9tRXZlbnQiLCJjcmVhdGVFdmVudCIsImluaXRFdmVudCIsImJ1YmJsZXMiLCJjYW5jZWxhYmxlIiwiZGV0YWlsIiwiZGlzcGF0Y2hDb25zdGFudCIsImRpc3BhdGNoRnVuY3Rpb24iLCJyb290Iiwic2VsZWN0aW9uX3NlbGVjdGlvbiIsInNlbGVjdGlvbl9zZWxlY3QiLCJzZWxlY3Rpb25fc2VsZWN0QWxsIiwic2VsZWN0Q2hpbGQiLCJzZWxlY3Rpb25fc2VsZWN0Q2hpbGQiLCJzZWxlY3RDaGlsZHJlbiIsInNlbGVjdGlvbl9zZWxlY3RDaGlsZHJlbiIsInNlbGVjdGlvbl9maWx0ZXIiLCJzZWxlY3Rpb25fZGF0YSIsInNlbGVjdGlvbl9lbnRlciIsInNlbGVjdGlvbl9leGl0Iiwic2VsZWN0aW9uX2pvaW4iLCJzZWxlY3Rpb25fbWVyZ2UiLCJzZWxlY3Rpb25fb3JkZXIiLCJzZWxlY3Rpb25fc29ydCIsInNlbGVjdGlvbl9jYWxsIiwibm9kZXMiLCJzZWxlY3Rpb25fbm9kZXMiLCJzZWxlY3Rpb25fbm9kZSIsInNlbGVjdGlvbl9zaXplIiwic2VsZWN0aW9uX2VtcHR5Iiwic2VsZWN0aW9uX2VhY2giLCJhdHRyIiwic2VsZWN0aW9uX2F0dHIiLCJzZWxlY3Rpb25fc3R5bGUiLCJzZWxlY3Rpb25fcHJvcGVydHkiLCJjbGFzc2VkIiwic2VsZWN0aW9uX2NsYXNzZWQiLCJ0ZXh0Iiwic2VsZWN0aW9uX3RleHQiLCJodG1sIiwic2VsZWN0aW9uX2h0bWwiLCJzZWxlY3Rpb25fcmFpc2UiLCJzZWxlY3Rpb25fbG93ZXIiLCJzZWxlY3Rpb25fYXBwZW5kIiwiaW5zZXJ0Iiwic2VsZWN0aW9uX2luc2VydCIsInNlbGVjdGlvbl9yZW1vdmUiLCJzZWxlY3Rpb25fY2xvbmUiLCJzZWxlY3Rpb25fZGF0dW0iLCJzZWxlY3Rpb25fb24iLCJzZWxlY3Rpb25fZGlzcGF0Y2giLCJTeW1ib2wiLCJpdGVyYXRvciIsInNlbGVjdGlvbl9pdGVyYXRvciIsImZhY3RvcnkiLCJleHRlbmQiLCJkZWZpbml0aW9uIiwiQ29sb3IiLCJkYXJrZXIiLCJicmlnaHRlciIsInJlSSIsInJlTiIsInJlUCIsInJlSGV4IiwicmVSZ2JJbnRlZ2VyIiwiUmVnRXhwIiwicmVSZ2JQZXJjZW50IiwicmVSZ2JhSW50ZWdlciIsInJlUmdiYVBlcmNlbnQiLCJyZUhzbFBlcmNlbnQiLCJyZUhzbGFQZXJjZW50IiwibmFtZWQiLCJhbGljZWJsdWUiLCJhbnRpcXVld2hpdGUiLCJhcXVhIiwiYXF1YW1hcmluZSIsImF6dXJlIiwiYmVpZ2UiLCJiaXNxdWUiLCJibGFjayIsImJsYW5jaGVkYWxtb25kIiwiYmx1ZSIsImJsdWV2aW9sZXQiLCJicm93biIsImJ1cmx5d29vZCIsImNhZGV0Ymx1ZSIsImNoYXJ0cmV1c2UiLCJjaG9jb2xhdGUiLCJjb3JhbCIsImNvcm5mbG93ZXJibHVlIiwiY29ybnNpbGsiLCJjcmltc29uIiwiY3lhbiIsImRhcmtibHVlIiwiZGFya2N5YW4iLCJkYXJrZ29sZGVucm9kIiwiZGFya2dyYXkiLCJkYXJrZ3JlZW4iLCJkYXJrZ3JleSIsImRhcmtraGFraSIsImRhcmttYWdlbnRhIiwiZGFya29saXZlZ3JlZW4iLCJkYXJrb3JhbmdlIiwiZGFya29yY2hpZCIsImRhcmtyZWQiLCJkYXJrc2FsbW9uIiwiZGFya3NlYWdyZWVuIiwiZGFya3NsYXRlYmx1ZSIsImRhcmtzbGF0ZWdyYXkiLCJkYXJrc2xhdGVncmV5IiwiZGFya3R1cnF1b2lzZSIsImRhcmt2aW9sZXQiLCJkZWVwcGluayIsImRlZXBza3libHVlIiwiZGltZ3JheSIsImRpbWdyZXkiLCJkb2RnZXJibHVlIiwiZmlyZWJyaWNrIiwiZmxvcmFsd2hpdGUiLCJmb3Jlc3RncmVlbiIsImZ1Y2hzaWEiLCJnYWluc2Jvcm8iLCJnaG9zdHdoaXRlIiwiZ29sZCIsImdvbGRlbnJvZCIsImdyYXkiLCJncmVlbiIsImdyZWVueWVsbG93IiwiZ3JleSIsImhvbmV5ZGV3IiwiaG90cGluayIsImluZGlhbnJlZCIsImluZGlnbyIsIml2b3J5Iiwia2hha2kiLCJsYXZlbmRlciIsImxhdmVuZGVyYmx1c2giLCJsYXduZ3JlZW4iLCJsZW1vbmNoaWZmb24iLCJsaWdodGJsdWUiLCJsaWdodGNvcmFsIiwibGlnaHRjeWFuIiwibGlnaHRnb2xkZW5yb2R5ZWxsb3ciLCJsaWdodGdyYXkiLCJsaWdodGdyZWVuIiwibGlnaHRncmV5IiwibGlnaHRwaW5rIiwibGlnaHRzYWxtb24iLCJsaWdodHNlYWdyZWVuIiwibGlnaHRza3libHVlIiwibGlnaHRzbGF0ZWdyYXkiLCJsaWdodHNsYXRlZ3JleSIsImxpZ2h0c3RlZWxibHVlIiwibGlnaHR5ZWxsb3ciLCJsaW1lIiwibGltZWdyZWVuIiwibGluZW4iLCJtYWdlbnRhIiwibWFyb29uIiwibWVkaXVtYXF1YW1hcmluZSIsIm1lZGl1bWJsdWUiLCJtZWRpdW1vcmNoaWQiLCJtZWRpdW1wdXJwbGUiLCJtZWRpdW1zZWFncmVlbiIsIm1lZGl1bXNsYXRlYmx1ZSIsIm1lZGl1bXNwcmluZ2dyZWVuIiwibWVkaXVtdHVycXVvaXNlIiwibWVkaXVtdmlvbGV0cmVkIiwibWlkbmlnaHRibHVlIiwibWludGNyZWFtIiwibWlzdHlyb3NlIiwibW9jY2FzaW4iLCJuYXZham93aGl0ZSIsIm5hdnkiLCJvbGRsYWNlIiwib2xpdmUiLCJvbGl2ZWRyYWIiLCJvcmFuZ2UiLCJvcmFuZ2VyZWQiLCJvcmNoaWQiLCJwYWxlZ29sZGVucm9kIiwicGFsZWdyZWVuIiwicGFsZXR1cnF1b2lzZSIsInBhbGV2aW9sZXRyZWQiLCJwYXBheWF3aGlwIiwicGVhY2hwdWZmIiwicGVydSIsInBpbmsiLCJwbHVtIiwicG93ZGVyYmx1ZSIsInB1cnBsZSIsInJlYmVjY2FwdXJwbGUiLCJyZWQiLCJyb3N5YnJvd24iLCJyb3lhbGJsdWUiLCJzYWRkbGVicm93biIsInNhbG1vbiIsInNhbmR5YnJvd24iLCJzZWFncmVlbiIsInNlYXNoZWxsIiwic2llbm5hIiwic2lsdmVyIiwic2t5Ymx1ZSIsInNsYXRlYmx1ZSIsInNsYXRlZ3JheSIsInNsYXRlZ3JleSIsInNub3ciLCJzcHJpbmdncmVlbiIsInN0ZWVsYmx1ZSIsInRhbiIsInRlYWwiLCJ0aGlzdGxlIiwidG9tYXRvIiwidHVycXVvaXNlIiwidmlvbGV0Iiwid2hlYXQiLCJ3aGl0ZSIsIndoaXRlc21va2UiLCJ5ZWxsb3ciLCJ5ZWxsb3dncmVlbiIsImRlZmluZSIsImNvbG9yIiwiY2hhbm5lbHMiLCJhc3NpZ24iLCJkaXNwbGF5YWJsZSIsInJnYiIsImhleCIsImNvbG9yX2Zvcm1hdEhleCIsImZvcm1hdEhleCIsImZvcm1hdEhleDgiLCJjb2xvcl9mb3JtYXRIZXg4IiwiZm9ybWF0SHNsIiwiY29sb3JfZm9ybWF0SHNsIiwiZm9ybWF0UmdiIiwiY29sb3JfZm9ybWF0UmdiIiwidG9TdHJpbmciLCJoc2xDb252ZXJ0IiwiZm9ybWF0IiwibCIsInRvTG93ZXJDYXNlIiwiZXhlYyIsInBhcnNlSW50IiwicmdibiIsIlJnYiIsInJnYmEiLCJoc2xhIiwiciIsImciLCJyZ2JDb252ZXJ0Iiwib3BhY2l0eSIsImsiLCJjbGFtcCIsImNsYW1waSIsImNsYW1wYSIsInJnYl9mb3JtYXRIZXgiLCJyZ2JfZm9ybWF0SGV4OCIsInJnYl9mb3JtYXRSZ2IiLCJpc05hTiIsImgiLCJzIiwiSHNsIiwiaHNsIiwibTIiLCJoc2wycmdiIiwiY2xhbXBoIiwiY2xhbXB0IiwibGluZWFyIiwiZXhwb25lbnRpYWwiLCJ5IiwiZ2FtbWEiLCJub2dhbW1hIiwicmdiR2FtbWEiLCJlbmQiLCJjb2xvclJnYiIsImlzTnVtYmVyQXJyYXkiLCJBcnJheUJ1ZmZlciIsImlzVmlldyIsIkRhdGFWaWV3IiwiZ2VuZXJpY0FycmF5IiwibmIiLCJuYSIsIkRhdGUiLCJzZXRUaW1lIiwicmVBIiwicmVCIiwic291cmNlIiwib25lIiwiYmkiLCJsYXN0SW5kZXgiLCJhbSIsImJtIiwiYnMiLCJxIiwiaW5kZXgiLCJkYXRlIiwibnVtYmVyQXJyYXkiLCJvYmplY3QiLCJkZWdyZWVzIiwiUEkiLCJpZGVudGl0eSIsInRyYW5zbGF0ZVgiLCJ0cmFuc2xhdGVZIiwicm90YXRlIiwic2tld1giLCJzY2FsZVgiLCJzY2FsZVkiLCJlIiwiYXRhbjIiLCJhdGFuIiwic3ZnTm9kZSIsInBhcnNlQ3NzIiwiRE9NTWF0cml4IiwiV2ViS2l0Q1NTTWF0cml4IiwiaXNJZGVudGl0eSIsImRlY29tcG9zZSIsInBhcnNlU3ZnIiwidHJhbnNmb3JtIiwiYmFzZVZhbCIsImNvbnNvbGlkYXRlIiwibWF0cml4IiwiaW50ZXJwb2xhdGVUcmFuc2Zvcm0iLCJwYXJzZSIsInB4Q29tbWEiLCJweFBhcmVuIiwiZGVnUGFyZW4iLCJwb3AiLCJ0cmFuc2xhdGUiLCJ4YSIsInlhIiwieGIiLCJ5YiIsInNjYWxlIiwiaW50ZXJwb2xhdGVUcmFuc2Zvcm1Dc3MiLCJpbnRlcnBvbGF0ZVRyYW5zZm9ybVN2ZyIsImZyYW1lIiwidGltZW91dCIsImludGVydmFsIiwicG9rZURlbGF5IiwidGFza0hlYWQiLCJ0YXNrVGFpbCIsImNsb2NrTGFzdCIsImNsb2NrTm93IiwiY2xvY2tTa2V3IiwiY2xvY2siLCJwZXJmb3JtYW5jZSIsIm5vdyIsInNldEZyYW1lIiwicmVxdWVzdEFuaW1hdGlvbkZyYW1lIiwic2V0VGltZW91dCIsImNsZWFyTm93IiwiVGltZXIiLCJfY2FsbCIsIl90aW1lIiwidGltZXIiLCJyZXN0YXJ0IiwiZGVsYXkiLCJ0aW1lIiwiVHlwZUVycm9yIiwic2xlZXAiLCJJbmZpbml0eSIsInRpbWVyRmx1c2giLCJ1bmRlZmluZWQiLCJ3YWtlIiwibmFwIiwicG9rZSIsInQwIiwidDEiLCJ0MiIsImNsZWFyVGltZW91dCIsImNsZWFySW50ZXJ2YWwiLCJzZXRJbnRlcnZhbCIsImVsYXBzZWQiLCJlbXB0eU9uIiwiZW1wdHlUd2VlbiIsIkNSRUFURUQiLCJTQ0hFRFVMRUQiLCJTVEFSVElORyIsIlNUQVJURUQiLCJSVU5OSU5HIiwiRU5ESU5HIiwiRU5ERUQiLCJpZCIsInRpbWluZyIsInNjaGVkdWxlcyIsIl9fdHJhbnNpdGlvbiIsInR3ZWVuIiwiZHVyYXRpb24iLCJlYXNlIiwic3RhdGUiLCJpbml0Iiwic2NoZWR1bGUiLCJzZWxmIiwidGljayIsImFjdGl2ZSIsImludGVycnVwdCIsInR3ZWVuUmVtb3ZlIiwidHdlZW4wIiwidHdlZW4xIiwidHdlZW5GdW5jdGlvbiIsIl9pZCIsInR3ZWVuVmFsdWUiLCJ0cmFuc2l0aW9uIiwiaW50ZXJwb2xhdGVOdW1iZXIiLCJpbnRlcnBvbGF0ZVJnYiIsImludGVycG9sYXRlU3RyaW5nIiwiaW50ZXJwb2xhdGUiLCJ2YWx1ZTEiLCJzdHJpbmcwMCIsInN0cmluZzEiLCJpbnRlcnBvbGF0ZTAiLCJzdHJpbmcwIiwic3RyaW5nMTAiLCJhdHRyVHdlZW4iLCJhdHRySW50ZXJwb2xhdGUiLCJhdHRySW50ZXJwb2xhdGVOUyIsImF0dHJUd2Vlbk5TIiwiX3ZhbHVlIiwiZGVsYXlGdW5jdGlvbiIsImRlbGF5Q29uc3RhbnQiLCJkdXJhdGlvbkZ1bmN0aW9uIiwiZHVyYXRpb25Db25zdGFudCIsImVhc2VDb25zdGFudCIsImVhc2VWYXJ5aW5nIiwiVHJhbnNpdGlvbiIsIl9uYW1lIiwiZXZlcnkiLCJvbkZ1bmN0aW9uIiwib24wIiwib24xIiwic2l0IiwicmVtb3ZlRnVuY3Rpb24iLCJpbmhlcml0Iiwic3R5bGVOdWxsIiwic3R5bGVNYXliZVJlbW92ZSIsImxpc3RlbmVyMCIsInN0eWxlVHdlZW4iLCJzdHlsZUludGVycG9sYXRlIiwidGV4dEludGVycG9sYXRlIiwidGV4dFR3ZWVuIiwiaWQwIiwiaWQxIiwibmV3SWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsImNhbmNlbCIsInNlbGVjdGlvbl9wcm90b3R5cGUiLCJ0cmFuc2l0aW9uX3NlbGVjdCIsInRyYW5zaXRpb25fc2VsZWN0QWxsIiwidHJhbnNpdGlvbl9maWx0ZXIiLCJ0cmFuc2l0aW9uX21lcmdlIiwidHJhbnNpdGlvbl9zZWxlY3Rpb24iLCJ0cmFuc2l0aW9uX3RyYW5zaXRpb24iLCJ0cmFuc2l0aW9uX29uIiwidHJhbnNpdGlvbl9hdHRyIiwidHJhbnNpdGlvbl9hdHRyVHdlZW4iLCJ0cmFuc2l0aW9uX3N0eWxlIiwidHJhbnNpdGlvbl9zdHlsZVR3ZWVuIiwidHJhbnNpdGlvbl90ZXh0IiwidHJhbnNpdGlvbl90ZXh0VHdlZW4iLCJ0cmFuc2l0aW9uX3JlbW92ZSIsInRyYW5zaXRpb25fdHdlZW4iLCJ0cmFuc2l0aW9uX2RlbGF5IiwidHJhbnNpdGlvbl9kdXJhdGlvbiIsInRyYW5zaXRpb25fZWFzZSIsInRyYW5zaXRpb25fZWFzZVZhcnlpbmciLCJ0cmFuc2l0aW9uX2VuZCIsImN1YmljSW5PdXQiLCJkZWZhdWx0VGltaW5nIiwiZWFzZUN1YmljSW5PdXQiLCJzZWxlY3Rpb25faW50ZXJydXB0Iiwic2VsZWN0aW9uX3RyYW5zaXRpb24iLCJpbml0UmFuZ2UiLCJkb21haW4iLCJpbXBsaWNpdCIsIm9yZGluYWwiLCJ1bmtub3duIiwiYmFuZCIsIm9yZGluYWxSYW5nZSIsInIwIiwicjEiLCJiYW5kd2lkdGgiLCJwYWRkaW5nSW5uZXIiLCJwYWRkaW5nT3V0ZXIiLCJhbGlnbiIsInJlc2NhbGUiLCJ2YWx1ZXMiLCJzZXF1ZW5jZSIsInJhbmdlUm91bmQiLCJwYWRkaW5nIiwiY29uc3RhbnRzIiwidW5pdCIsIm5vcm1hbGl6ZSIsImNsYW1wZXIiLCJiaW1hcCIsImQwIiwiZDEiLCJwb2x5bWFwIiwiYmlzZWN0IiwidGFyZ2V0IiwidHJhbnNmb3JtZXIiLCJpbnRlcnBvbGF0ZVZhbHVlIiwidW50cmFuc2Zvcm0iLCJwaWVjZXdpc2UiLCJvdXRwdXQiLCJpbnB1dCIsImludmVydCIsImludGVycG9sYXRlUm91bmQiLCJ1IiwiY29udGludW91cyIsIm5pY2UiLCJ4MCIsIngxIiwidGltZUludGVydmFsIiwiZmxvb3JpIiwib2Zmc2V0aSIsImZpZWxkIiwib2Zmc2V0IiwiaXNGaW5pdGUiLCJtaWxsaXNlY29uZCIsImR1cmF0aW9uU2Vjb25kIiwiZHVyYXRpb25NaW51dGUiLCJkdXJhdGlvbkhvdXIiLCJkdXJhdGlvbkRheSIsImR1cmF0aW9uV2VlayIsImR1cmF0aW9uTW9udGgiLCJkdXJhdGlvblllYXIiLCJzZWNvbmQiLCJnZXRNaWxsaXNlY29uZHMiLCJnZXRVVENTZWNvbmRzIiwidGltZU1pbnV0ZSIsImdldFNlY29uZHMiLCJnZXRNaW51dGVzIiwidXRjTWludXRlIiwic2V0VVRDU2Vjb25kcyIsImdldFVUQ01pbnV0ZXMiLCJ0aW1lSG91ciIsImdldEhvdXJzIiwidXRjSG91ciIsInNldFVUQ01pbnV0ZXMiLCJnZXRVVENIb3VycyIsInRpbWVEYXkiLCJzZXRIb3VycyIsInNldERhdGUiLCJnZXREYXRlIiwiZ2V0VGltZXpvbmVPZmZzZXQiLCJ1dGNEYXkiLCJzZXRVVENIb3VycyIsInNldFVUQ0RhdGUiLCJnZXRVVENEYXRlIiwidW5peERheSIsInRpbWVXZWVrZGF5IiwiZ2V0RGF5IiwidGltZVN1bmRheSIsInRpbWVNb25kYXkiLCJ0aW1lVHVlc2RheSIsInRpbWVXZWRuZXNkYXkiLCJ0aW1lVGh1cnNkYXkiLCJ0aW1lRnJpZGF5IiwidGltZVNhdHVyZGF5IiwidXRjV2Vla2RheSIsImdldFVUQ0RheSIsInV0Y1N1bmRheSIsInV0Y01vbmRheSIsInV0Y1R1ZXNkYXkiLCJ1dGNXZWRuZXNkYXkiLCJ1dGNUaHVyc2RheSIsInV0Y0ZyaWRheSIsInV0Y1NhdHVyZGF5IiwidGltZU1vbnRoIiwic2V0TW9udGgiLCJnZXRNb250aCIsImdldEZ1bGxZZWFyIiwidXRjTW9udGgiLCJzZXRVVENNb250aCIsImdldFVUQ01vbnRoIiwiZ2V0VVRDRnVsbFllYXIiLCJ0aW1lWWVhciIsInNldEZ1bGxZZWFyIiwidXRjWWVhciIsInNldFVUQ0Z1bGxZZWFyIiwidGlja2VyIiwieWVhciIsIm1vbnRoIiwid2VlayIsImRheSIsImhvdXIiLCJtaW51dGUiLCJ0aWNrSW50ZXJ2YWxzIiwidGlja3MiLCJ0aWNrSW50ZXJ2YWwiLCJhYnMiLCJ0aW1lVGlja3MiLCJ0aW1lVGlja0ludGVydmFsIiwibG9jYWxEYXRlIiwiSCIsIk0iLCJTIiwiTCIsInV0Y0RhdGUiLCJVVEMiLCJuZXdEYXRlIiwiZm9ybWF0TG9jYWxlIiwibG9jYWxlIiwibG9jYWxlX2RhdGVUaW1lIiwiZGF0ZVRpbWUiLCJsb2NhbGVfZGF0ZSIsImxvY2FsZV90aW1lIiwibG9jYWxlX3BlcmlvZHMiLCJwZXJpb2RzIiwibG9jYWxlX3dlZWtkYXlzIiwiZGF5cyIsImxvY2FsZV9zaG9ydFdlZWtkYXlzIiwic2hvcnREYXlzIiwibG9jYWxlX21vbnRocyIsIm1vbnRocyIsImxvY2FsZV9zaG9ydE1vbnRocyIsInNob3J0TW9udGhzIiwicGVyaW9kUmUiLCJmb3JtYXRSZSIsInBlcmlvZExvb2t1cCIsImZvcm1hdExvb2t1cCIsIndlZWtkYXlSZSIsIndlZWtkYXlMb29rdXAiLCJzaG9ydFdlZWtkYXlSZSIsInNob3J0V2Vla2RheUxvb2t1cCIsIm1vbnRoUmUiLCJtb250aExvb2t1cCIsInNob3J0TW9udGhSZSIsInNob3J0TW9udGhMb29rdXAiLCJmb3JtYXRzIiwiZm9ybWF0U2hvcnRXZWVrZGF5IiwiZm9ybWF0V2Vla2RheSIsImZvcm1hdFNob3J0TW9udGgiLCJmb3JtYXRNb250aCIsImZvcm1hdERheU9mTW9udGgiLCJmb3JtYXRNaWNyb3NlY29uZHMiLCJmb3JtYXRZZWFySVNPIiwiZm9ybWF0RnVsbFllYXJJU08iLCJmb3JtYXRIb3VyMjQiLCJmb3JtYXRIb3VyMTIiLCJmb3JtYXREYXlPZlllYXIiLCJmb3JtYXRNaWxsaXNlY29uZHMiLCJmb3JtYXRNb250aE51bWJlciIsImZvcm1hdE1pbnV0ZXMiLCJmb3JtYXRQZXJpb2QiLCJmb3JtYXRRdWFydGVyIiwiZm9ybWF0VW5peFRpbWVzdGFtcCIsImZvcm1hdFVuaXhUaW1lc3RhbXBTZWNvbmRzIiwiZm9ybWF0U2Vjb25kcyIsImZvcm1hdFdlZWtkYXlOdW1iZXJNb25kYXkiLCJmb3JtYXRXZWVrTnVtYmVyU3VuZGF5IiwiZm9ybWF0V2Vla051bWJlcklTTyIsImZvcm1hdFdlZWtkYXlOdW1iZXJTdW5kYXkiLCJmb3JtYXRXZWVrTnVtYmVyTW9uZGF5IiwiZm9ybWF0WWVhciIsImZvcm1hdEZ1bGxZZWFyIiwiZm9ybWF0Wm9uZSIsImZvcm1hdExpdGVyYWxQZXJjZW50IiwidXRjRm9ybWF0cyIsImZvcm1hdFVUQ1Nob3J0V2Vla2RheSIsImZvcm1hdFVUQ1dlZWtkYXkiLCJmb3JtYXRVVENTaG9ydE1vbnRoIiwiZm9ybWF0VVRDTW9udGgiLCJmb3JtYXRVVENEYXlPZk1vbnRoIiwiZm9ybWF0VVRDTWljcm9zZWNvbmRzIiwiZm9ybWF0VVRDWWVhcklTTyIsImZvcm1hdFVUQ0Z1bGxZZWFySVNPIiwiZm9ybWF0VVRDSG91cjI0IiwiZm9ybWF0VVRDSG91cjEyIiwiZm9ybWF0VVRDRGF5T2ZZZWFyIiwiZm9ybWF0VVRDTWlsbGlzZWNvbmRzIiwiZm9ybWF0VVRDTW9udGhOdW1iZXIiLCJmb3JtYXRVVENNaW51dGVzIiwiZm9ybWF0VVRDUGVyaW9kIiwiZm9ybWF0VVRDUXVhcnRlciIsImZvcm1hdFVUQ1NlY29uZHMiLCJmb3JtYXRVVENXZWVrZGF5TnVtYmVyTW9uZGF5IiwiZm9ybWF0VVRDV2Vla051bWJlclN1bmRheSIsImZvcm1hdFVUQ1dlZWtOdW1iZXJJU08iLCJmb3JtYXRVVENXZWVrZGF5TnVtYmVyU3VuZGF5IiwiZm9ybWF0VVRDV2Vla051bWJlck1vbmRheSIsImZvcm1hdFVUQ1llYXIiLCJmb3JtYXRVVENGdWxsWWVhciIsImZvcm1hdFVUQ1pvbmUiLCJwYXJzZXMiLCJwYXJzZVNob3J0V2Vla2RheSIsInBhcnNlV2Vla2RheSIsInBhcnNlU2hvcnRNb250aCIsInBhcnNlTW9udGgiLCJwYXJzZUxvY2FsZURhdGVUaW1lIiwicGFyc2VEYXlPZk1vbnRoIiwicGFyc2VNaWNyb3NlY29uZHMiLCJwYXJzZVllYXIiLCJwYXJzZUZ1bGxZZWFyIiwicGFyc2VIb3VyMjQiLCJwYXJzZURheU9mWWVhciIsInBhcnNlTWlsbGlzZWNvbmRzIiwicGFyc2VNb250aE51bWJlciIsInBhcnNlTWludXRlcyIsInBhcnNlUGVyaW9kIiwicGFyc2VRdWFydGVyIiwicGFyc2VVbml4VGltZXN0YW1wIiwicGFyc2VVbml4VGltZXN0YW1wU2Vjb25kcyIsInBhcnNlU2Vjb25kcyIsInBhcnNlV2Vla2RheU51bWJlck1vbmRheSIsInBhcnNlV2Vla051bWJlclN1bmRheSIsInBhcnNlV2Vla051bWJlcklTTyIsInBhcnNlV2Vla2RheU51bWJlclN1bmRheSIsInBhcnNlV2Vla051bWJlck1vbmRheSIsInBhcnNlTG9jYWxlRGF0ZSIsInBhcnNlTG9jYWxlVGltZSIsInBhcnNlWm9uZSIsInBhcnNlTGl0ZXJhbFBlcmNlbnQiLCJuZXdGb3JtYXQiLCJYIiwic3BlY2lmaWVyIiwicGFkIiwiY2hhckNvZGVBdCIsInBhZHMiLCJjaGFyQXQiLCJuZXdQYXJzZSIsIloiLCJwYXJzZVNwZWNpZmllciIsIlEiLCJwIiwiViIsInciLCJXIiwiVSIsInV0Y0Zvcm1hdCIsInV0Y1BhcnNlIiwibnVtYmVyUmUiLCJwZXJjZW50UmUiLCJyZXF1b3RlUmUiLCJmaWxsIiwid2lkdGgiLCJzaWduIiwicmVxdW90ZSIsInJlcGxhY2UiLCJkSVNPIiwieiIsImdldFVUQ01pbGxpc2Vjb25kcyIsImRvdyIsIlVUQ2RJU08iLCJ0aW1lRm9ybWF0IiwiZGVmYXVsdExvY2FsZSIsImNhbGVuZGFyIiwiZm9ybWF0TWlsbGlzZWNvbmQiLCJmb3JtYXRTZWNvbmQiLCJmb3JtYXRNaW51dGUiLCJmb3JtYXRIb3VyIiwiZm9ybWF0RGF5IiwiZm9ybWF0V2VlayIsInRpY2tGb3JtYXQiLCJ0aW1lV2VlayIsInRpbWVTZWNvbmQiLCJUcmFuc2Zvcm0iLCJwb2ludCIsImFwcGx5WCIsImFwcGx5WSIsImxvY2F0aW9uIiwiaW52ZXJ0WCIsImludmVydFkiLCJyZXNjYWxlWCIsInJlc2NhbGVZIiwidXNlUmVmIiwidXNlU3RhdGUiLCJ1c2VFZmZlY3QiLCJkMy5zZWxlY3QiLCJkMy5zY2FsZVRpbWUiLCJkMy5zY2FsZUJhbmQiLCJkMy50aW1lRm9ybWF0Il0sIm1hcHBpbmdzIjoiOztFQUFlLFNBQVNBLFdBQVNBLENBQUNDLENBQUMsRUFBRUMsQ0FBQyxFQUFFO0VBQ3RDLEVBQUEsT0FBT0QsQ0FBQyxJQUFJLElBQUksSUFBSUMsQ0FBQyxJQUFJLElBQUksR0FBR0MsR0FBRyxHQUFHRixDQUFDLEdBQUdDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBR0QsQ0FBQyxHQUFHQyxDQUFDLEdBQUcsQ0FBQyxHQUFHRCxDQUFDLElBQUlDLENBQUMsR0FBRyxDQUFDLEdBQUdDLEdBQUcsQ0FBQTtFQUNqRjs7RUNGZSxTQUFTQyxVQUFVQSxDQUFDSCxDQUFDLEVBQUVDLENBQUMsRUFBRTtFQUN2QyxFQUFBLE9BQU9ELENBQUMsSUFBSSxJQUFJLElBQUlDLENBQUMsSUFBSSxJQUFJLEdBQUdDLEdBQUcsR0FDL0JELENBQUMsR0FBR0QsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUNWQyxDQUFDLEdBQUdELENBQUMsR0FBRyxDQUFDLEdBQ1RDLENBQUMsSUFBSUQsQ0FBQyxHQUFHLENBQUMsR0FDVkUsR0FBRyxDQUFBO0VBQ1Q7O0VDSGUsU0FBU0UsUUFBUUEsQ0FBQ0MsQ0FBQyxFQUFFO0VBQ2xDLEVBQUEsSUFBSUMsUUFBUSxFQUFFQyxRQUFRLEVBQUVDLEtBQUssQ0FBQTs7RUFFN0I7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBLEVBQUEsSUFBSUgsQ0FBQyxDQUFDSSxNQUFNLEtBQUssQ0FBQyxFQUFFO0VBQ2xCSCxJQUFBQSxRQUFRLEdBQUdQLFdBQVMsQ0FBQTtFQUNwQlEsSUFBQUEsUUFBUSxHQUFHQSxDQUFDRyxDQUFDLEVBQUVDLENBQUMsS0FBS1osV0FBUyxDQUFDTSxDQUFDLENBQUNLLENBQUMsQ0FBQyxFQUFFQyxDQUFDLENBQUMsQ0FB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QyxHQUFHSSxJQUFJLENBQUMxWixDQUFDLENBQUM7RUFBQyxJQUN4RnNaLENBQUMsS0FBSyxDQUFDLEdBQUcsSUFBSUssR0FBRyxDQUFFM1osQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUtBLENBQUMsSUFBSSxDQUFDLEdBQUcsSUFBSyxFQUFHQSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBS0EsQ0FBQyxHQUFHLElBQUssRUFBRyxDQUFDQSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBS0EsQ0FBQyxHQUFHLEdBQUksRUFBRSxDQUFDLENBQUM7RUFBQyxJQUNsSHNaLENBQUMsS0FBSyxDQUFDLEdBQUdNLElBQUksQ0FBQzVaLENBQUMsSUFBSSxFQUFFLEdBQUcsSUFBSSxFQUFFQSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksRUFBRUEsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFJLEVBQUUsQ0FBQ0EsQ0FBQyxHQUFHLElBQUksSUFBSSxJQUFJLENBQUM7TUFDaEZzWixDQUFDLEtBQUssQ0FBQyxHQUFHTSxJQUFJLENBQUU1WixDQUFDLElBQUksRUFBRSxHQUFHLEdBQUcsR0FBS0EsQ0FBQyxJQUFJLENBQUMsR0FBRyxJQUFLLEVBQUdBLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFLQSxDQUFDLElBQUksQ0FBQyxHQUFHLElBQUssRUFBR0EsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUtBLENBQUMsR0FBRyxJQUFLLEVBQUUsQ0FBRSxDQUFDQSxDQUFDLEdBQUcsR0FBRyxLQUFLLENBQUMsR0FBS0EsQ0FBQyxHQUFHLEdBQUksSUFBSSxJQUFJLENBQUM7RUFBQyxJQUN4SixJQUFJO0VBQUUsTUFDTixDQUFDQSxDQUFDLEdBQUd3TyxZQUFZLENBQUNnTCxJQUFJLENBQUNILE1BQU0sQ0FBQyxJQUFJLElBQUlNLEdBQUcsQ0FBQzNaLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRUEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFQSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUs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QSxFQUFFLFVBQVUsQ0FBTTtFQUMzRCxZQUFBLFlBQVksS0FDVEEsbUJBQUssQ0FBQSxLQUFBLEVBQUEsRUFBQSxTQUFTLEVBQUMsUUFBUSxFQUFBO2tCQUNuQkEsbUJBQUssQ0FBQSxLQUFBLEVBQUEsRUFBQSxTQUFTLEVBQUMsYUFBYSxFQUFBO3NCQUN4QkEsbUJBQUssQ0FBQSxLQUFBLEVBQUEsRUFBQSxTQUFTLEVBQUMsOEJBQThCLEVBQU8sQ0FBQTtFQUNwRCxvQkFBQUEsbUJBQUEsQ0FBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsQ0FBb0IsQ0FDbEI7a0JBQ05BLG1CQUFLLENBQUEsS0FBQSxFQUFBLEVBQUEsU0FBUyxFQUFDLGFBQWEsRUFBQTtzQkFDeEJBLG1CQUFLLENBQUEsS0FBQSxFQUFBLEVBQUEsU0FBUyxFQUFDLDhCQUE4QixFQUFPLENBQUE7RUFDcEQsb0JBQUFBLG1CQUFBLENBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxTQUFBLENBQW9CLENBQ2xCO2tCQUNOQSxtQkFBSyxDQUFBLEtBQUEsRUFBQSxFQUFBLFNBQVMsRUFBQyxhQUFhLEVBQUE7c0JBQ3hCQSxtQkFBSyxDQUFBLEtBQUEsRUFBQSxFQUFBLFNBQVMsRUFBQyw0QkFBNEIsRUFBTyxDQUFBO3NCQUNsREEsbUJBQXFCLENBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxVQUFBLENBQUEsQ0FDbkIsQ0FDSixDQUNUO2NBQ0RBLG1CQUFLLENBQUEsS0FBQSxFQUFBLEVBQUEsRUFBRSxFQUFDLE9BQU8sRUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFRLENBQUEsQ0FDbkMsQ0FDSixFQUNSO0VBQ047Ozs7Ozs7OyIsInhfZ29vZ2xlX2lnbm9yZUxpc3QiOlswLDEsMiwzLDQsNSw2LDcsOCw5LDEwLDExLDEyLDEzLDE0LDE1LDE2LDE3LDE4LDE5LDIwLDIxLDIyLDIzLDI0LDI1LDI2LDI3LDI4LDI5LDMwLDMxLDMyLDMzLDM0LDM1LDM2LDM3LDM4LDM5LDQwLDQxLDQyLDQzLDQ0LDQ1LDQ2LDQ3LDQ4LDQ5LDUwLDUxLDUyLDUzLDU0LDU1LDU2LDU3LDU4LDU5LDYwLDYxLDYyLDYzLDY0LDY1LDY2LDY3LDY4LDY5LDcwLDcxLDcyLDczLDc0LDc1LDc2LDc3LDc4LDc5LDgwLDgxLDgyLDgzLDg0LDg1LDg2LDg3LDg4LDg5LDkwLDkxLDkyLDkzLDk0LDk1LDk2LDk3LDk4LDk5LDEwMCwxMDEsMTAyLDEwMywxMDQsMTA1LDEwNiwxMDcsMTA4LDEwOSwxMTAsMTExLDExMiwxMTMsMTE0LDExNSwxMTYsMTE3LDExOCwxMTksMTIwLDEyMSwxMjJdfQ==
