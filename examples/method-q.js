//- JavaScript source code

//- method-q.js ~~
//                                                      ~~ (c) SRW, 03 Apr 2015
//                                                  ~~ last updated 03 Apr 2015

/*eslint new-cap: 0, no-extend-native: 0 */

/*eslint-env node */

/* @flow */

/*jshint maxparams: 1, quotmark: double, strict: true */

/*jslint indent: 4, maxlen: 80, node: true */

/*properties
    avar, constructor, error, exit, hasOwnProperty, log, on, nextTick, print,
    prototype, Q, send, setImmediate, snooze, val
*/

(function (quanah) {
    "use strict";

 // Declarations

    var AVar, avar;

 // Definitions

    AVar = quanah.avar().constructor;

    avar = quanah.avar;

 // Prototype definitions

    AVar.prototype.print = function () {
     // This function is just shorthand that mimics QMachine's browser client.
        return this.Q(function (signal) {
         // This function prints the current `val` to stdout.
            console.log(this.val);
            return signal.exit();
        }).on("fail", function (message) {
         // This function prints errors to stderr if anything goes wrong.
            console.error("Error:", message);
            return;
        });
    };

    Object.prototype.Q = function (f) {
     // This function adds a Method Q for all variables that are neither `null`
     // nor `undefined`. It is based on early versions of Quanah's API, which
     // the author found convenient and highly entertaining even though it was
     // eventually shown to cause weird errors with libraries like jQuery and
     // Google Visualization. Of course, using a capital letter "Q" irritates
     // some folks ... #yolo
        return ((this instanceof AVar) ? this : avar(this)).send("queue", f);
    };

 // Out-of-scope definitions

    quanah.snooze = function (tick) {
     // This function, which has been added to the Quanah module externally, is
     // analogous to a human who hits the "snooze" button on an alarm clock
     // because it tells Quanah to come back later and try again (to resume
     // execution).
        if (global.hasOwnProperty("setImmediate")) {
            global.setImmediate(tick);
        } else if (process.hasOwnProperty("nextTick")) {
         // See http://goo.gl/8HMpVX.
            process.nextTick(tick);
        }
        return;
    };

 // Demonstration

    (2).Q(function (signal) {
     // This function simply adds `2` to the avar that is created on-the-fly
     // by `Object.prototype.Q`.
        this.val += 2;
        return signal.exit();
    }).print();

 // That's all, folks!

    return;

}(require("../")));

//- vim:set syntax=javascript:
