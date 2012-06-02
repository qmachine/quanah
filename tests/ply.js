//- JavaScript source code

//- ply.js ~~
//                                                      ~~ (c) SRW, 01 Jun 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

 // Declarations

    var Q, avar, dmap, dply, dreduce, isArrayLike, ply, puts, when;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    dmap = function (f) {
     // This function needs documentation.
        return function (evt) {
         // This function needs documentation.
            var x, y;
            x = (this.hasOwnProperty('isready')) ? this.val[0] : this;
            y = avar(x);
            y.onerror = function (message) {
             // This function needs documentation.
                return evt.fail(message);
            };
            y.onready = function (evt) {
             // This function needs documentation.
                ply(y.val).by(function (key, val) {
                 // This function needs documentation.
                    y.val[key] = {f: f, x: val};
                    return;
                });
                return evt.exit();
            };
            y.onready = dply(function (key, val) {
             // This function needs documentation.
                val.y = val.f(val.x);
                return;
            });
            y.onready = function (y_evt) {
             // This function needs documentation.
                ply(y.val).by(function (key, val) {
                 // This function needs documentation.
                    x.val[key] = val.y;
                    return;
                });
                y_evt.exit();
                return evt.exit();
            };
            return;
        };
    };

    dply = ply = Q.ply;

    dreduce = function (f) {
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
            y.onready = dmap(function (each) {
             // This function needs documentation.
                return (each instanceof Array) ? {f: f, x: each} : each;
            });
            y.onready = dmap(function (each) {
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
            puts = function () {
             // This function is typically used by Narwhal and RingoJS. Since
             // Narwhal can be powered by any conforming engine, I should warn
             // you that I've only tested it on JSC and Rhino engines.
                global.system.print(join.call(arguments, ' '));
                return;
            };
        } else if (hOP(global, 'console') && isFunction(global.console.log)) {
            puts = function () {
             // This function is typically used by Node.js and by modern web
             // browsers that have a developer's console.
                global.console.log(join.call(arguments, ' '));
                return;
            };
        } else if (isFunction(global.alert)) {
            puts = function () {
             // This function is a fallback definition used by "crusty old web
             // browsers" that lack a developer's console. Falling back to the
             // 'alert' function is possibly the most obnoxious thing I could
             // have done, but I'll try and find some other alternatives soon.
                global.alert(join.call(arguments, ' '));
                return;
            };
        } else if (hOP(global, 'print') && isFunction(global.print)) {
         // JavaScriptCore, Rhino, Spidermonkey (==> 'couchjs' also), D8/V8
            puts = function () {
             // This function is typically used by server-side developers'
             // shells like JavaScriptCore, Rhino, Spidermonkey, and V8. A
             // few variations include 'couchjs', 'd8', and 'mongo'.
                global.print(join.call(arguments, ' '));
                return;
            };
        } else if (isFunction(global.postMessage)) {
            puts = function () {
             // This function is typically used by a Web Worker, but it isn't
             // a standalone definition. It must be tied through in the main
             // browser context to some 'bee.onmessage' handler ...
                global.postMessage(join.call(arguments, ' '));
                return;
            };
        } else {
         // This is the place where only the naughtiest of implementations
         // will land. Unfortunately, Adobe/Mozilla Tamarin is one of them.
            puts = function () {
             // This function definition is a last resort, trust me. Only the
             // naughtiest of implementations will land here. Unfortunately,
             // Adobe/Mozilla Tamarin is one of them. Although it's mainly an
             // ActionScript engine at the moment, major ECMAScript upgrades
             // are planned to roll out here later in the year ...
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
            when(x).isready = dmap(function (each) {
             // This function needs documentation.
                return 3 * each;
            });
            x.onready = dmap(function (each) {
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

        sum = dreduce(function (a, b) {
         // This function needs documentation.
            return a + b;
        });

        demo({val: [1, 2, 3, 4, 5]});

        demo({val: {a: 5, b: 6, c: 7, d: 8}});

        return;

    }());

 // That's all, folks!

    return;

}(function (outer_scope) {
    'use strict';
 // See "getGlobal.js" for more information.
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : outer_scope;
    } else {
        return (typeof this.global === 'object') ? this.global : this;
    }
}.call(null, this)));

//- vim:set syntax=javascript:
