//- JavaScript source code

//- evil_comm.js ~~
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

    var Q, avar, isFunction, puts;

 // Definitions

    Q = Object.prototype.Q;

    avar = Q.avar;

    isFunction = function (f) {
     // This function needs documentation.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    puts = checker.puts;

 // Demonstration

    (function () {

        var stolen_secret, temp, x;

        x = avar();

        temp = x.comm;

        try {
            x.comm = function evil_comm(message) {
             // This function correctly redefines the instance method in older
             // versions of JavaScript, such as Spidermonkey 1.8.0.
                stolen_secret = message.secret;
                temp(message);
                return;
            };
        } catch (err) {
         // Modern JavaScript implementations should end up here.
        }

        x.comm({fail: 'This will be ignored ...', secret: stolen_secret});

        x.onerror = function (message) {
         // This function needs documentation.
            puts('CRASH:', message);
            return;
        };

        x.onready = function (evt) {
         // This function needs documentation.
            puts('Attempting the hijack ...');
            return evt.exit();
        };

        x.comm({fail: 'Evil wins the day!', secret: stolen_secret});

        x.onready = function (evt) {
         // This function needs documentation.
            puts('Good prevailed!');
            return evt.exit();
        };

        return;

    }());

 // That's all, folks!

    return;

});

//- vim:set syntax=javascript:
