//- JavaScript source code

//- until.js ~~
//
//  This program demonstrates an `until` method that provides a chainable,
//  non-blocking loop for Quanah. The method will work in any JS environment,
//  but the demonstration here is tailored for Node.js.
//
//                                                      ~~ (c) SRW, 01 Dec 2014
//                                                  ~~ last updated 13 Feb 2015

/*eslint new-cap: 0, quotes: [2, "single"] */

/*eslint-env node */

/* @flow */

/*jshint maxparams: 1, quotmark: single, strict: true */

/*jslint indent: 4, maxlen: 80, node: true */

/*properties
    avar, call, constructor, error, exit, log, on, nextTick, print, prototype,
    Q, random, snooze, stay, until, val
*/

(function () {
    'use strict';

 // First, extend definitions for Quanah by providing a `snooze` function,
 // which is analogous to a human who hits the "snooze" button on an alarm
 // clock because it tells Quanah to come back later :-P

    require('../').snooze = process.nextTick; // see also: http://goo.gl/8HMpVX

 // Declarations

    var AVar, avar;

 // Definitions

    AVar = require('../').avar().constructor;

    avar = require('../').avar;

 // Prototype definitions

    AVar.prototype.print = function () {
     // This function is just shorthand that mimics QMachine's browser client.
        this.Q(function (signal) {
         // This function prints the current `val` to stdout.
            console.log(this.val);
            return signal.exit();
        }).on('fail', function (message) {
         // This function prints errors to stderr if anything goes wrong.
            console.error('Error:', message);
            return;
        });
        return this;
    };

    AVar.prototype.until = function (f) {
     // This function provides a chainable, non-blocking `until` loop by using
     // a function `f` to represent the body of the loop.
        this.Q(function (signal) {
         // This function evaluates `f` and repeats if the output is `false`.
            if (f.call(this) === false) {
                return signal.stay();
            }
            return signal.exit();
        });
        return this;
    };

 // Demonstration

    avar(2).until(function () {
     // This function will be treated like the block of a `while` loop, but
     // the loop will run asynchronously :-)
        this.val += Math.random();
        return (this.val > 5);
    }).print();

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
