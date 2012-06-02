//- JavaScript source code

//- key-baton.js ~~
//
//  This test ensures that the 'key' property of an avar doesn't "change" (as
//  presented to the user) when using either Method Q or 'onready' assignment.
//
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

 // Definitions

 // Demonstrations

    (function () {
     // This function needs documentation.
        var f, results;
        f = function (evt) {
         // This function needs documentation.
            results.push(this.key);
            return evt.exit();
        };
        results = [];
        (Math.random()).Q(f).Q(f).Q(f).Q(f).Q(function (evt) {
         // This function needs documentation.
            var first, i;
            first = results[0];
            for (i = 0; i < results.length; i += 1) {
                if (results[i] !== first) {
                    return evt.fail('Test failed.');
                }
            }
            return evt.exit();
        }).onerror = function (message) {
         // This function needs documentation.
            throw (message instanceof Error) ? message : new Error(message);
        };
        return;
    }());

 // That's all, folks!

    return;

});

//- vim:set syntax=javascript:
