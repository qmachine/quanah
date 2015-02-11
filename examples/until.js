//- JavaScript source code

//- until.js ~~
//
//  This program demonstrates an `until` method that provides a chainable,
//  non-blocking loop for Quanah. The method will work in any JS environment,
//  but the demonstration here is tailored for Node.js.
//
//                                                      ~~ (c) SRW, 01 Dec 2014
//                                                  ~~ last updated 11 Feb 2015

/* @flow */

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        avar, call, constructor, error, exit, log, on, nextTick, print,
        prototype, Q, random, snooze, stay, until, val
    */

 // Prerequisites

 // Extend definitions for Quanah by providing a `snooze` function, which is
 // analogous to a human who hits the "snooze" button on an alarm clock because
 // it tells Quanah to come back later :-P

    require('../').snooze = process.nextTick; // see also: http://goo.gl/8HMpVX

 // Declarations

    var AVar, avar;

 // Definitions

    AVar = require('../').avar().constructor;

    avar = require('../').avar;

 // Prototype definitions

    AVar.prototype.print = function () {
     // This function is just shorthand that mimics QMachine's browser client.
        this.Q(function (evt) {
         // This function prints the current `val` to stdout.
            console.log(this.val);
            return evt.exit();
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
        this.Q(function (evt) {
         // This function evaluates `f` and repeats if the output is `false`.
            if (f.call(this) === false) {
                return evt.stay();
            }
            return evt.exit();
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
