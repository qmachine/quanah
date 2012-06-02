//- JavaScript source code

//- ply.js ~~
//                                                      ~~ (c) SRW, 02 Jun 2012

/*global CHUBBY: false */

CHUBBY(function (checker) {
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

    puts = checker.puts;

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

});

//- vim:set syntax=javascript:
