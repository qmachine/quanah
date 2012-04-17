//- JavaScript source code

//- ply.js ~~
//                                                      ~~ (c) SRW, 16 Apr 2012

(function (env) {
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

    dply = function (f) {
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
                temp.onready = function (evt) {
                 // This function needs documentation.
                    x.val[key] = this.val.val;
                    return evt.exit();
                };
                return temp;
            };
            elements = [];
            x = (this.hasOwnProperty('isready')) ? this.val[0] : this;
            if (isArrayLike(x.val)) {
                n = x.val.length;
                for (key = 0; key < n; key += 1) {
                    elements.push(g(f, key, x.val[key]));
                }
            } else if (x.val instanceof Object) {
                for (key in x.val) {
                    if (x.val.hasOwnProperty(key)) {
                        elements.push(g(f, key, x.val[key]));
                    }
                }
            } else {
                return evt.fail('Cannot "ply" this value (' + x.val + ')');
            }
            when.apply(this, elements).onready = function (when_evt) {
             // This function needs documentation.
                when_evt.exit();
                return evt.exit();
            };
            return;
        };
    };

    ply = function (x) {
     // This function is a general-purpose iterator for key-value pairs, and
     // it works exceptionally well in JavaScript because hash-like objects
     // are so common in this language. This definition itself is an optimized
     // version that depends on assumptions about how it is used within the
     // giant anonymous closure to which it belongs. If performance becomes a
     // strong enough motivation, I will probably end up inlining the loops
     // anyway, but if you enjoy functional patterns as I do, take a look at
     // my "generic.js" for a more careful treatment of "basic" iteration :-)
        return {
            by: function (f) {
             // NOTE: I probably can't optimize this function for use only on
             // arrays and objects because 'serialize' uses it on functions.
                if (isFunction(f) === false) {
                    throw new TypeError('"ply..by" expects a function');
                }
                var key, n;
                if (isArrayLike(x)) {
                 // This arm takes advantage of the fact that indexed 'for'
                 // loops are substantially faster than 'for in' loops.
                    n = x.length;
                    for (key = 0; key < n; key += 1) {
                        f(key, x[key]);
                    }
                } else if (x instanceof Object) {
                    for (key in x) {
                        if (x.hasOwnProperty(key)) {
                            f(key, x[key]);
                        }
                    }
                } else {
                 // I've never really liked this as a fallback definition, but
                 // it still helps to have it here, just in case.
                    f(undefined, x);
                }
                return;
            }
        };
    };

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
     // This function needs documentation.
        // ...
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

}());

//- vim:set syntax=javascript:
