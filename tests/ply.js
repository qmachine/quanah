//- JavaScript source code

//- ply.js ~~
//                                                      ~~ (c) SRW, 01 Mar 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, avar, global, isArrayLike, map, ply, puts, reduce, when;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    global = Q.global;

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
            y.onready = ply(function (key, val, evt) {
             // This function needs documentation.
                var temp = avar({val: {f: f, x: val}});
                temp.onerror = function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                };
                temp.onready = function (evt) {
                 // This function needs documentation.
                    this.val.y = this.val.f(this.val.x);
                    return evt.exit();
                };
                temp.onready = function (temp_evt) {
                 // This function needs documentation.
                    x.val[key] = this.val.y;
                    temp_evt.exit();
                    return evt.exit();
                };
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
                    this.val.f(this.val.key, this.val.val, evt);
                    return;
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
            // ...
            return evt.exit();
        };
    };

    when = Q.when;

 // Demonstrations

    (function () {

        var demo, disp, sum, x;

        demo = function (obj) {
         // This function needs documentation.
            var x = avar(obj);
            x.error = function (message) {
             // This function needs documentation.
                puts('Error:', message);
                return;
            };
            x.onready = function (evt) {
             // This function needs documentation.
                puts(JSON.stringify(this.val));
                return evt.exit();
            };
            when(x).isready = map(function (each) {
             // This function needs documentation.
                return 3 * each;
            });
            x.onready = map(function (each) {
             // This function needs documentation.
                return each + 1;
            });
            x.onready = function (evt) {
             // This function needs documentation.
                puts(JSON.stringify(this.val));
                return evt.exit();
            };
            return;
        };

        disp = function (evt) {
         // This function needs documentation.
            puts(this);
            return evt.exit();
        };

        sum = reduce(function (a, b) {
         // This function needs documentation.
            return a + b;
        });

        x = avar({val: [1, 2, 3, 4, 5]});

        x.onerror = function (message) {
         // This function needs documentation.
            puts('Error:', message);
            return;
        };

        x.onready = function (evt) {
         // This function needs documentation.
            puts('Running "ply" demo ...');
            return evt.exit();
        };

        x.onready = ply(function (key, val, evt) {
         // This function needs documentation.
            puts(key, val);
            return evt.exit();
        });

        when(x).isready = ply(function (key, val, evt) {
         // This function needs documentation.
            puts('when', key, val);
            return evt.exit();
        });

        demo({val: [1, 2, 3, 4, 5]});

        demo({val: {a: 5, b: 6, c: 7, d: 8}});

        x.onready = function (evt) {
         // This function needs documentation.
            puts('Done with "ply" demo.');
            return evt.exit();
        };

        return;

    }());

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
