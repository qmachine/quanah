//- JavaScript source code

//- ply.js ~~
//                                                      ~~ (c) SRW, 04 Mar 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, avar, isArrayLike, map, ply, puts, reduce, when;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    isArrayLike = function (x) {
     // This function is useful for identifying an "Array-Like Object", which
     // is an object whose 'length' property represents its maximum numerical
     // property key. Such objects may use Array methods generically, and for
     // iteration this can be especially useful. The two surprises here are
     // functions and strings. A function has a 'length' property representing
     // its arity (number of input arguments), unfortunately, so it cannot be
     // considered an Array-Like Object. A string is actually a primitive, not
     // an object, but it can still be used as an Array-Like Object :-)
        return ((x !== null) &&
                (x !== undefined) &&
                (typeof x !== 'function') &&
                (x.hasOwnProperty('length')));
    };

    map = function (f) {
     // This function needs documentation.
        return function (evt) {
         // This function needs documentation.
            var x, y;
            x = (this.hasOwnProperty('isready')) ? this.val[0] : this;
            y = avar({val: x.val});
            y.onerror = function (message) {
             // This function needs documentation.
                return evt.fail(message);
            };
            y.onready = ply(function (key, val) {
             // This function needs documentation.
                y.val[key] = {f: f, x: val};
                return;
            });
            y.onready = ply(function (key, val) {
             // This function needs documentation.
                val.y = val.f(val.x);
                return;
            });
            y.onready = ply(function (key, val) {
             // This function needs documentation.
                x.val[key] = val.y;
                return;
            });
            y.onready = function (y_evt) {
             // This function needs documentation.
                y_evt.exit();
                return evt.exit();
            };
            return;
        };
    };

    ply = function (f) {
     // This function needs documentation.
        return function (evt) {
         // This function needs documentation.
            var elements, g, key, n, x;
            g = function (f, key, val) {
             // This function needs documentation.
                var temp = avar({val: {f: f, key: key, val: val}});
                temp.onerror = function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                };
                temp.onready = function (evt) {
                 // This function needs documentation.
                    this.val.f(this.val.key, this.val.val);
                    return evt.exit();
                };
                return temp;
            };
            elements = [];
            x = (this.hasOwnProperty('isready')) ? this.val[0].val : this.val;
            if (isArrayLike(x)) {
                n = x.length;
                for (key = 0; key < n; key += 1) {
                    elements.push(g(f, key, x[key]));
                }
            } else if (x instanceof Object) {
                for (key in x) {
                    if (x.hasOwnProperty(key)) {
                        elements.push(g(f, key, x[key]));
                    }
                }
            } else {
                return evt.fail('Cannot "ply" this value (' + x + ')');
            }
            when.apply(this, elements).onready = function (when_evt) {
             // This function needs documentation.
                when_evt.exit();
                return evt.exit();
            };
            return;
        };
    };

    puts = function () {
     // This function is my own self-contained output logging utility.
        var hOP, isFunction, join;
        hOP = function (obj, name) {
         // See "hOP.js" for more information.
            return ((obj !== null)      &&
                    (obj !== undefined) &&
                    (obj.hasOwnProperty(name)));
        };
        isFunction = function (f) {
         // See "isFunction.js" for more information.
            return ((typeof f === 'function') && (f instanceof Function));
        };
        join = Array.prototype.join;
        if (hOP(global, 'system') && isFunction(global.system.print)) {
         // Narwhal-JSC, Narwhal (w/ Rhino engine), and RingoJS
            puts = function () {
                global.system.print(join.call(arguments, ' '));
                return;
            };
        } else if (hOP(global, 'console') && isFunction(global.console.log)) {
         // Node.js and modern web browsers
            puts = function () {
                global.console.log(join.call(arguments, ' '));
                return;
            };
        } else if (isFunction(global.alert)) {
         // Crusty old web browsers
            puts = function () {
                global.alert(join.call(arguments, ' '));
                return;
            };
        } else if (hOP(global, 'print') && isFunction(global.print)) {
         // JavaScriptCore, Rhino, Spidermonkey (==> 'couchjs' also), D8/V8
            puts = function () {
                global.print(join.call(arguments, ' '));
                return;
            };
        } else if (isFunction(global.postMessage)) {
         // Web Worker contexts (must be tied to some 'bee.onmessage' handler
         // in the invoking webpage's environment, though ...).
            puts = function () {
                global.postMessage(join.call(arguments, ' '));
                return;
            };
        } else {
         // This is the place where only the naughtiest of implementations
         // will land. Unfortunately, Adobe/Mozilla Tamarin is one of them.
            puts = function () {
             // This is a last resort, trust me.
                /*global print: false */
                if (isFunction(print)) {
                    print(join.call(arguments, ' '));
                    return;
                }
                throw new Error('The "puts" definition fell through.');
            };
        }
        puts.apply(this, arguments);
        return;
    };

    reduce = function (f) {
     // This function needs documentation.
        return function (evt) {
         // This function needs documentation.
            var x, y;
            x = (this.hasOwnProperty('isready')) ? this.val[0] : this;
            y = avar({val: x.val});
            y.onerror = function (message) {
             // This function needs documentation.
                return evt.fail(message);
            };
            y.onready = function (evt) {
             // This function needs documentation.
                var flag, key, n, pairs, x;
                flag = true;
                pairs = [];
                x = y.val;
                if (isArrayLike(x)) {
                    n = x.length;
                    if ((n % 2) === 1) {
                        pairs.push(x[0]);
                        for (key = 1; key < n; key += 2) {
                            pairs.push([x[key], x[key + 1]]);
                        }
                    } else {
                        for (key = 0; key < n; key += 2) {
                            pairs.push([x[key], x[key + 1]]);
                        }
                    }
                } else if (x instanceof Object) {
                    for (key in x) {
                        if (x.hasOwnProperty(key)) {
                            if (flag) {
                                pairs.push([x[key]]);
                            } else {
                                (pairs[pairs.length - 1]).push(x[key]);
                            }
                            flag = (!flag);
                        }
                    }
                } else {
                    pairs.push([x]);
                }
                y.val = pairs;
                return evt.exit();
            };
            y.onready = map(function (each) {
             // This function needs documentation.
                return (each instanceof Array) ? {f: f, x: each} : each;
            });
            y.onready = map(function (each) {
             // This function needs documentation.
                var flag;
                flag = ((each !== null) &&
                        (each !== undefined) &&
                        (each.hasOwnProperty('f')) &&
                        (each.hasOwnProperty('x')));
                return (flag) ? each.f(each.x[0], each.x[1]) : each;
            });
            y.onready = function (y_evt) {
             // This function needs documentation.
                if (y.val.length > 1) {
                    x.val = y.val;
                    y_evt.exit();
                    return evt.stay('Re-reducing ...');
                }
                x.val = y.val[0];
                y_evt.exit();
                return evt.exit();
            };
            return;
        };
    };

    when = Q.when;

 // Demonstrations

    (function () {

        var demo, disp, sum;

        demo = function (obj) {
         // This function needs documentation.
            var x = avar(obj);
            x.error = function (message) {
             // This function needs documentation.
                puts('Error:', message);
                return;
            };
            x.onready = disp;
            when(x).isready = map(function (each) {
             // This function needs documentation.
                return 3 * each;
            });
            x.onready = map(function (each) {
             // This function needs documentation.
                return each + 1;
            });
            x.onready = disp;
            x.onready = sum;
            x.onready = disp;
            return;
        };

        disp = function (evt) {
         // This function needs documentation.
            puts(JSON.stringify(this.val));
            return evt.exit();
        };

        sum = reduce(function (a, b) {
         // This function needs documentation.
            return a + b;
        });

        demo({val: [1, 2, 3, 4, 5]});

        demo({val: {a: 5, b: 6, c: 7, d: 8}});

        return;

    }());

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (outer_scope) {
    'use strict';
 // See the bottom of "quanah.js" for documentation.
    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : outer_scope;
    }
    return (typeof this.global === 'object') ? this.global : this;
}, null, this)));

//- vim:set syntax=javascript:
