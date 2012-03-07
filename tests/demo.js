//- JavaScript source code

//- demo.js ~~
//                                                      ~~ (c) SRW, 07 Mar 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, avar, demos, map, ply, reduce, puts, when;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    demos = [

        function () {
         // This function corresponds to 'demos[0]'.
            var x = avar({val: 2});
            x.onready = function (evt) {
             // This function needs documentation.
                puts(this);
                return evt.exit();
            };
            x.onready = function (evt) {
             // This function runs locally because it closes over 'x'.
                x.val += 2;
                return evt.exit();
            };
            x.onready = function (evt) {
             // This function runs locally because it closes over 'puts'.
                puts(this);
                return evt.exit();
            };
            x.onready = function (evt) {
             // This function is distributable.
                this.val *= 5;
                return evt.exit();
            };
            x.onready = function (evt) {
             // This function runs locally because it closes over 'puts'.
                puts(this);
                return evt.exit();
            };
            return;
        },

        function () {
         // This function corresponds to 'demos[1]'.
            var x = avar();
            x.onready = function (evt) {
             // Here, we're going to crash an avar deliberately to see if
             // Quanah can handle it. The twist, of course, is that we won't
             // define the 'onerror' handler beforehand.
                return evt.fail('deliberate oops');
            };
            x.onerror = function (message) {
             // This function needs documentation.
                puts('Error:', message);
                return;
            };
            x.onready = function (evt) {
             // This function needs documentation.
                puts('THIS SHOULD NOT APPEAR IN THE OUTPUT!');
                return evt.exit();
            };
            return;
        },

        function () {
         // This function corresponds to 'demos[2]'.
            var x, y;
            x = avar({val: [1, 2, 3, 4, 5]});
            y = avar({val: [5, 6, 7]});
            when(x, y).areready = function (evt) {
             // This function needs documentation.
                ply(x, y).by(puts);
                return evt.exit();
            };
            x.onerror = y.onerror = function (message) {
             // This function needs documentation.
                puts('Error:', message);
                return;
            };
            return;
        },

        function () {
         // This function corresponds to 'demos[3]'.
            var x = avar({val: 0});
            x.onerror = function (message) {
             // This function needs documentation.
                puts('Error:', message);
                return;
            };
            x.onready = function (evt) {
             // This function helps show whether 'AVar.prototype.valueOf' is
             // faster when written with 'switch' or 'if'. As of February 5,
             // there's no real advantage in Spidermonkey or JavaScriptCore,
             // but the 'if' statement is waaay faster in V8.
                var i, n;
                n = 1e6;
                for (i = 0; i < n; i += 1) {
                    this.val = this + 1;
                }
                puts(this.val);
                return evt.exit();
            };
            return;
        },

        function () {
         // This function corresponds to 'demos[4]'. It tests the ability to
         // store the result of a 'when' statement for repeated uses. It also
         // tests the ability to "nest" 'when' statements -- versions before
         // February 10 could not run this function correctly.
            var x, y, z;
            x = avar({val: 6});
            y = avar({val: 7});
            z = when(x, y);
            x.onerror = y.onerror = z.onerror = function (message) {
             // This function needs documentation.
                puts('Error:', message);
                return;
            };
            z.onready = function (evt) {
             // This function needs documentation.
                puts(this);
                return evt.exit();
            };
            z.onready = function (evt) {
             // This function needs documentation.
                puts(this.val[0] * this.val[1]);
                return evt.exit();
            };
            when(x, y).areready = function (evt) {
             // This function needs documentation.
                puts('Ready:', x, y);
                return evt.exit();
            };
            when(x, when(y, z)).areready = function (evt) {
             // This function did not run correctly in previous versions.
                puts('Quanah can unnest "when" statements!');
                return evt.exit();
            };
            return;
        },

        function () {
         // This function corresponds to 'demos[5]'. It tests Quanah's ability
         // to chain a bunch of 'onready' handlers using Method Q and to end
         // the chain with an 'onerror' handler.
            (5).Q(function (evt) {
             // This function needs documentation.
                puts('Before:', this.val);
                return evt.exit();
            }).Q(function (evt) {
             // This function is distributable.
                this.val *= 10;
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                puts(' After:', this.val);
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                if (isNaN(this.val) === false) {
                    return evt.fail('deliberate oops (#2)');
                }
                return evt.exit();
            }).onerror = function (message) {
             // This function needs documentation.
                puts('Error:', message);
                return;
            };
            return;
        },

        function () {
         // This function corresponds to 'demos[6]'. Currently, Quanah won't
         // allow you to assign an avar to an 'onready' handler, but it's not
         // hard to do -- I just need to move most of Method Q's code directly
         // into 'comm'. I haven't finished considering its consequences yet,
         // so for now we're going to have to disable this demonstration.
            var f, x;
            f = avar();
            x = avar();
            f.onready = function (evt) {
             // This function needs documentation.
                f.val = function (evt) {
                 // This function is intended to be assigned to an avar's
                 // 'onready' "handler".
                    puts(this);
                    return evt.exit();
                };
                return evt.exit();
            };
            x.onerror = function (message) {
             // This function needs documentation.
                puts('Error:', message);
                return;
            };
            x.onready = function (evt) {
             // This function needs documentation.
                x.val = 'I am an unsuspecting avar.';
                return evt.exit();
            };
            x.onready = f;
            x.onready = function (evt) {
             // This function needs documentation.
                puts('Holy cow, I really expected this to fail!');
                return evt.exit();
            };
            return;
        },

        function () {
         // This function corresponds to 'demos[7]'.
            var f, x, y;
            f = avar({
                val: function (evt) {
                 // This function needs documentation.
                    puts('AFunc?');
                    return evt.exit();
                }
            });
            x = avar({val: Math.PI});
            y = avar({val: [5, 6, 7, 8]});
            f.onerror = x.onerror = y.onerror = function (message) {
             // This function needs documentation.
                puts('Error:', message);
                return;
            };
            f.onready = function (evt) {
             // This function needs documentation.
                f.val = function (evt) {
                 // This function needs documentation.
                    puts('[afunc]:', this);
                    return evt.exit();
                };
                return evt.exit();
            };
            x.onready = y.onready = f;
            when(x).isready = when(y).isready = f;
            when(x, y).areready = f;
            f.onready = function (evt) {
             // This function needs documentation.
                puts('Demo 9 is finished.');
                return evt.exit();
            };
            return;
        },

        function () {
         // This function corresponds to 'demos[8]'.
            var sum, triple, x;
            sum = reduce(function (a, b) {
             // This function needs documentation.
                return a + b;
            });
            triple = map(function (each) {
             // This function needs documentation.
                return 3 * each;
            });
            x = ([5, 6, 7, 8]).Q(triple).Q(sum);
            x.onerror = function (message) {
             // This function needs documentation.
                puts('Error:', message);
                return;
            };
            when(x).isready = function (evt) {
             // This function needs documentation.
                puts(this.val[0].val);
                return evt.exit();
            };
            return;
        },

        function () {
         // This function corresponds to 'demo[9]'. This one is NASTY!
            (10).Q(function countdown(evt) {
             // This function needs documentation.
                var x = (this.hasOwnProperty('isready')) ? this.val[0] : this;
                if (x.val <= 0) {
                    x.val = 'Blastoff!';
                    return evt.exit();
                }
                (x.val - 1).Q(countdown).Q(function (temp_evt) {
                 // This function needs documentation.
                    x.val += (' ... ' + this.val);
                    temp_evt.exit();
                    return evt.exit();
                }).onerror = evt.fail;
                return;
            }).Q(function (evt) {
             // This function needs documentation.
                puts(this);
                return evt.exit();
            }).onerror = function (message) {
             // This function needs documentation.
                puts('Error:', message);
                return;
            };
            return;
        }

    ];

    map = Q.map;

    ply = function () {
     // This function is a generalized "zippered" iterator that also works
     // extremely well for key-value pairs, and it serves as the "fallback"
     // definition for the generic 'Q.ply' method. It is incredibly useful in
     // JavaScript because hash-like objects are so common in that language.
     // It provides access not only to the values of its input arguments, but
     // also to the index at which each set of values was found.
        var args, i, key, obj, n, toc, x;
        args = Array.prototype.slice.call(arguments);
        n = args.length;
        toc = {};
        x = [];
        for (i = 0; i < n; i += 1) {
            if ((args[i] !== null) && (args[i] !== undefined)) {
                obj = args[i].valueOf();
                for (key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (toc.hasOwnProperty(key) === false) {
                            toc[key] = x.push([key]) - 1;
                        }
                        x[toc[key]][i + 1] = obj[key];
                    }
                }
            }
        }
        return {
            by: function (f) {
             // This function forgoes "type checking" because 'ply' is only
             // available in an anonymous closure for demonstration purposes.
             // Thus, I already know it's only going to receive functions ;-)
                var i, n;
                n = x.length;
                for (i = 0; i < n; i += 1) {
                    f.apply(this, x[i]);
                }
                return;
            }
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

    reduce = Q.reduce;

    when = Q.when;

 // Out-of-scope definitions ("exports")

    global.demo = function () {

     // This function lets me export a bunch of demonstrations without having
     // to invoke them directly, which was causing problems when I wanted to
     // test the 'Q.volunteer' function.

        var excludes, i, n;

        excludes = [3, 6];

        n = demos.length;

        for (i = 0; i < n; i += 1) {
            if (excludes.indexOf(i) === (-1)) {
                puts('Running Demo ' + i + ' ...');
                demos[i]();
            }
        }

        puts('Done.');

        return;

    };

 // Invocations (for server-side JavaScript implementations)

    if (global.hasOwnProperty('navigator') === false) {

        global.demo();

    } else if (global.hasOwnProperty('phantom')) {

        (function () {
         // This function sets a timeout inside PhantomJS such that, if no
         // 'revive' has run in the last 1000 ms, the program will exit. The
         // reason for this is simple: web browsers don't exit when they hit
         // EOF, and PhantomJS embeds a web browser; control can only exit if
         // ordered explicitly. This function also demonstrates how useful an
         // avar can be for writing an infinite loop ;-)
            var timer, x;
            timer = global.setTimeout(global.phantom.exit, 1000);
            x = avar();
            x.onready = function (evt) {
             // This function will always run locally because it closes over
             // a reference to 'timer'.
                global.clearTimeout(timer);
                timer = global.setTimeout(global.phantom.exit, 1000);
                return evt.stay('alive');
            };
            return;
        }());

        global.demo();

    } else if (global.hasOwnProperty('system')) {

        global.demo();

    }

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
