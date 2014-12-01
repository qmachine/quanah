//- JavaScript source code

//- until.js ~~
//
//  This program demonstrates an `until` method that provides a chainable,
//  non-blocking loop for Quanah. The method will work in any JS environment,
//  but the demonstration here is tailored for Node.js.
//
//                                                      ~~ (c) SRW, 01 Dec 2014
//                                                  ~~ last updated 01 Dec 2014

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        avar, call, constructor, error, exit, log, on, prototype, Q, random,
        revive, stay, until, val
    */

 // Declarations

    var AVar, avar, trigger;

 // Definitions

    AVar = require('quanah').avar().constructor;

    avar = require('quanah').avar;

    trigger = setInterval(avar().revive, 0);

 // Prototype definitions

    AVar.prototype.until = function (f) {
     // This function provides a chainable, non-blocking `until` loop by using
     // a function `f` to represent the body of the loop.
        this.Q(function (evt) {
         // This function evaluates `f` and repeats if the output is `false`.
            if (f.call(this) === false) {
                return evt.stay();
            }
            return evt.exit();
        });
        return this;
    };

 // Demonstrations

    avar(2).until(function () {
     // This function needs documentation.
        this.val += Math.random();
        return (this.val > 5);
    }).Q(function (evt) {
     // This function prints the results to screen.
        console.log(this.val);
        clearInterval(trigger);
        return evt.exit();
    }).on('error', function (message) {
        console.error('Error:', message);
        return;
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
