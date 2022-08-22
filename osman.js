String.prototype.escapeUnicode = function () {
    return this.replace(/\\\\u([0-9a-f]{4})/g, (whole, group1) => String.fromCharCode(parseInt(group1, 16)));
};
String.prototype.escapeRegExp = function () {
    return this.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};
Object.defineProperty(String.prototype, 'unicodeEscaped', {
    get: function () { return this.replace(/\\\\u([0-9a-f]{4})/g, (whole, group1) => String.fromCharCode(parseInt(group1, 16))); }
});
Object.defineProperty(String.prototype, 'regExpEscaped', {
    get: function () { return this.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
});
String.prototype.getBetweenAll = function (...args) {
    args = args.map(a => a.escapeRegExp());
    let result = Array.from(this.match(new RegExp(`(?<=${args[0]})(.*?)(?=\s*${args[1]})`, "g")));
    return result;
};
String.prototype.getBetween = function (...args) {
    return this.getBetweenAll(...args)[0];
};
String.prototype.padCenter = function (maxLength, fillString = " ") {
    return this.padStart(this.length + Math.floor((maxLength - this.length) / 2), fillString).padEnd(maxLength, fillString);
};
String.prototype.replaceAll = function (searchValue, replaceValue) {
    return this.replace(new RegExp(searchValue, "g"), replaceValue);
};
String.prototype.replaceAllWithArray = function (searchValue, replaceArray = []) {
    let str = this;
    let match = this.match(new RegExp(searchValue.escapeRegExp()));
    if (!match || !replaceArray.length) return str.toString();
    str = str.replace(searchValue, replaceArray.shift());
    return str.replaceAllWithArray(searchValue, replaceArray).toString();
};
String.prototype.format = function () {
    let str = this.toString();
    if (arguments.length) {
        let t = typeof arguments[0];
        let key;
        let args = ("string" === t || "number" === t) ? Array.prototype.slice.call(arguments) : arguments[0];
        for (key in args) {
            str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
        }
    }
    return str;
};
String.prototype.reverse = function () {
    return this.split('').reverse().join('');
}
Object.defineProperty(String.prototype, 'reversed', {
    get: function () { return this.split('').reverse().join(''); }
});
String.prototype.replaceEnd = function (...args) {
    return this.reversed.replace(...args.map(s => typeof s == "string" ? s.reversed : s)).reversed;
};
String.prototype.toIntR = function (radix) {
    return parseInt(this, radix);
};
Object.defineProperty(String.prototype, 'toInt', {
    get: function () { return parseInt(this); }
});


Object.defineProperty(Array.prototype, 'unique', {
    get: function () { return this.filter((v, i, a) => a.indexOf(v) == i); }
});
Object.defineProperty(Array.prototype, 'valid', {
    get: function () { return this.filter(v => v != undefined && v != null); }
});
Object.defineProperty(Array.prototype, 'trueItems', {
    get: function () { return this.filter(v => v); }
});
Object.defineProperty(Array.prototype, 'falseItems', {
    get: function () { return this.filter(v => !v); }
});
Array.prototype.shuffle = function () {
    for (let i = this.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this[i], this[j]] = [this[j], this[i]];
    }
    return this;
};
Object.defineProperty(Array.prototype, 'shuffled', {
    get: function () { return Array.from(this).shuffle(); }
});
Array.prototype.insert = function (index, ...values) {
    this.splice(index, 0, ...values);
    return this;
};
Array.prototype.pushIn = function (index, ...values) {
    this.splice(index + 1, 0, ...values);
    return this.length;
};
Array.prototype.removeIndex = function (i) {
    return this.splice(i, 1);
};
Array.prototype.removeIndexes = function (...args) {
    let result = [];
    args.sort();
    args.forEach((v, i, a) => {
        result.push(this.splice(v - i, 1)); // The indexes will be shifted once after each deletion, so we need to reduce the indexes for each deletion count.
    });
    return result.flat();
};
Array.prototype.remove = function (...args) {
    return this.removeIndexes(...args.map(e => this.findIndex(v => v == e)).filter(i => i != -1));
};
Array.prototype.removeFilter = function (predicate, thisArg) {
    return this.remove(...this.filter(predicate, thisArg));
};
Array.prototype.removeFind = function (predicate, thisArg) {
    let item = this.find(predicate, thisArg);
    if (item)
        return this.remove(item)[0];
};
Array.prototype.swapIndexes = function (i, j) {
    [this[i], this[j]] = [this[j], this[i]];
    return this;
};
Array.prototype.swap = function (v1, v2) {
    let i = this.findIndex(v => v == v1);
    let j = this.findIndex(v => v == v2);
    if (i != -1 && j != -1)
        this.swapIndexes(i, j);
    return this;
};
Array.prototype.swapFind = function (f1, f2) {
    let i = this.findIndex(f1);
    let j = this.findIndex(f2);
    if (i != -1 && j != -1)
        this.swapIndexes(i, j);
    return this;
};
Object.defineProperty(Array.prototype, 'randomIndex', {
    get: function () { return Math.floor((Math.random() * this.length)); }
});
Object.defineProperty(Array.prototype, 'random', {
    get: function () { return this[this.randomIndex]; }
});
Array.prototype.copyBasic = function () {
    return [...this];
};
Array.prototype.copyJSON = function () {
    return JSON.parse(JSON.stringify(this));
};
Array.prototype.toIntR = function (radix) {
    return this.map(v => parseInt(v, radix));
};
Object.defineProperty(Array.prototype, 'toInt', {
    get: function () { return this.map(v => parseInt(v)); }
});
Object.defineProperty(Array.prototype, 'first', {
    get: function () { return this[0]; },
    set: function (v) { this[0] = v; }
});
Object.defineProperty(Array.prototype, 'last', {
    get: function () { return this[this.length - 1]; },
    set: function (v) { this[this.length - 1] = v; }
});

Array.getDepth = function getArrayDepth(array) {
    return array instanceof Array ? Math.max(0, ...array.map(getArrayDepth)) + 1 : 0;
}

Object.defineProperty(Array.prototype, 'depth', {
    get: function () { return Array.getDepth(this); }
});
Object.defineProperty(Array.prototype, 'straight', {
    get: function () { return this.flat(Infinity); }
});


Array.create = (count, value) => new Array(~~count).fill(value);
Array.createMap = (count, callbackfn, thisArg) => Array.create(count).map(callbackfn, thisArg);

Array.merge = (...arrs) => [...arrs.flat()];

Array.withNumbers = (start, end) => end != undefined ?
    Array.createMap(end - start + 1, (v, i, a) => (start - 1) + (i + 1)) :
    Array.createMap(start - 1 - 0 + 1, (v, i, a) => (0 - 1) + (i + 1));

Array.prototype.chunk = function (chunkSize) {
    return this.reduce((all, one, i) => {
        const ci = ~~(i / chunkSize);
        if (!chunkSize) all[i] = []; else all[ci] = [].concat((all[ci] || []), one);
        return all
    }, []);
};
Array.prototype.chunkCenter = function (chunkSize) {
    return this.chunk(chunkSize).map(a => a.length == chunkSize ? a : (Array.merge(Array.create((chunkSize - a.length) / 2), ...a, Array.create((chunkSize - a.length) / 2))));
};