//- JavaScript source code

//- one-way-ticket.js ~~
//                                                      ~~ (c) SRW, 02 Jun 2012

/*global CHUBBY: false */

CHUBBY(function (checker) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === false) {
        throw new Error('Method Q is missing.');
    }

 // Declarations

    var Q, avar, puts;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    puts = checker.puts;

 // Demonstrations

    (function () {

        var x = Q.avar();

        x.onerror = function (message) {
         // This function needs documentation.
            puts('Error:', message);
            return;
        };

        x.onready = function f(evt) {
         // This function needs documentation.
            var that = this;
            f.g = function () {
             // This function needs documentation.
                that.val = 'It works.';
                return evt.exit();
            };
            return f.g();
        };

        x.onready = function (evt) {
         // This function needs documentation.
            puts('Results:', this);
            return evt.exit();
        };

        return;

    }());

 // That's all, folks!

    return;

});

//- vim:set syntax=javascript:
