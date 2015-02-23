//- JavaScript source code

//- quanah-spec.js ~~
//
//  These tests will likely be completely reworked in the near future ...
//
//                                                      ~~ (c) SRW, 17 Nov 2012
//                                                  ~~ last updated 22 Feb 2015

/*eslint camelcase: 0, new-cap: 0, quotes: [2, "single"] */

/*eslint-env node */

/* @flow */

/*global beforeEach: false, describe: false, it: false */

/*jshint es3: true, maxparams: 2, quotmark: single, strict: true */

/*jslint indent: 4, maxlen: 80, node: true */

/*properties
    a, an, avar, be, call, constructor, error, equal, exit, fail,
    getPrototypeOf, have, key, length, log, name, nextTick, not, on, own, Q,
    PI, property, prototype, push, random, send, sync, to, val
*/

(function () {
    'use strict';

 // Declarations

    var expect;

 // Definitions

    expect = require('expect.js');

 // Tests

    describe('Quanah', function () {

        var AVar, avar, quanah, sync;

        beforeEach(function () {
            AVar = require('../src/quanah').avar().constructor;
            avar = require('../src/quanah').avar;
            quanah = require('../src/quanah');
            sync = require('../src/quanah').sync;
        });

        describe('The `AVar` constructor function', function () {

            it('is a function', function () {
                expect(AVar).to.be.a(Function);
            });

            it('accepts a single, optional argument', function () {
                expect(AVar.length).to.equal(1);
                expect(new AVar()).to.be.an(AVar);
            });

        });

        describe('`AVar.prototype`', function () {

            it('is an object', function () {
                expect(AVar.prototype).to.be.an(Object);
            });

            it('"inherits" directly from `Object.prototype`', function () {
                var proto = Object.getPrototypeOf(AVar.prototype);
                expect(proto).to.equal(Object.prototype);
            });

            it('provides an `on` method', function () {
                expect(AVar.prototype).to.have.property('on');
                expect(AVar.prototype.on).to.be.a(Function);
            });

            it('provides a `Q` method', function () {
                expect(AVar.prototype).to.have.own.property('Q');
                expect(AVar.prototype.Q).to.be.a(Function);
            });

        });

        describe('The `AVar.prototype.on` method', function () {

            it('accepts two arguments', function () {
                expect(AVar.prototype.on.length).to.equal(2);
            });

            it('returns the same avar', function () {
                var x, y;
                x = avar();
                y = x.on('fail', function (message) {
                 // This is a typical error handler for Node.js.
                    console.log('Error:', message);
                    return;
                });
                expect(x).to.equal(y);
            });

        });

        describe('The `AVar.prototype.Q` method', function () {

            it('accepts one argument', function () {
                expect(AVar.prototype.Q.length).to.equal(1);
            });

            it('returns the same avar', function () {
                var x, y;
                x = avar();
                y = x.Q(function (signal) {
                 // This function doesn't do anything; it's just for testing.
                    return signal.exit();
                });
                expect(x).to.equal(y);
            });

            it('supports generic calls', function () {
                var x = AVar.prototype.Q.call(null, function (signal) {
                 // This function doesn't do anything; it's just for testing.
                    return signal.exit();
                });
                expect(x).to.be.an(AVar);
            });

        });

        describe('The `avar` function', function () {

            it('has the same arity as the `AVar` constructor', function () {
                expect(avar.length).to.equal(AVar.length);
            });

        });

        describe('An avar', function () {

            var x;

            beforeEach(function () {
                x = avar();
            });

            it('is an instance of `AVar`', function () {
                expect(x).to.be.an(AVar);
            });

            it('is an instance of `Object`', function () {
             // This is a consequence of its prototype chain, but there's no
             // harm in checking to be sure.
                expect(x).to.be.an(Object);
            });

            it('has a `send` instance method', function () {
                expect(x).to.have.own.property('send');
                expect(x.send).to.be.a(Function);
            });

            it('has a `val` instance property', function () {
                expect(x).to.have.own.property('val');
                expect(x.val).to.equal(undefined);
            });

        });

        describe('An avar\'s `send` method', function () {

            var x;

            beforeEach(function () {
                x = avar();
            });

            it('accepts two arguments', function () {
                expect(x.send.length).to.equal(2);
            });

            it('always returns the same avar', function () {
                var y = x.send('(name)', '(optional argument)');
                expect(y).to.equal(x);
            });

        });

        describe('An avar\'s `val` property', function () {

            it('is the same value provided to the constructor', function () {
                var x, y;
                x = Math.random();
                y = avar(x);
                expect(x).to.equal(y.val);
            });

            it('can be another avar', function () {
             // This test prohibits the old "copy constructor" pattern.
                var x = avar(avar());
                expect(x.val).to.be.an(AVar);
            });

        });

        describe('A syncpoint', function () {

            var x;

            beforeEach(function () {
                x = sync();
                return;
            });

            it('is an instance of `AVar`', function () {
                expect(x).to.be.an(AVar);
            });

            it('is an instance of `Object`', function () {
             // This is a consequence of its prototype chain, but there's no
             // harm in checking to be sure.
                expect(x).to.be.an(Object);
            });

            it('has an array as its `val`', function () {
                expect(x.val).to.be.an(Array);
            });

            it('has an instance method `Q`', function () {
                expect(x).to.have.own.property('Q');
                expect(x.Q).to.be.a(Function);
                expect(x.Q).not.to.equal(AVar.prototype.Q);
            });

        });

        describe('The `Q` instance method of a syncpoint', function () {

            it('works when no arguments are given', function (done) {
                sync().Q(function (evt) {
                 // This function records the current behavior, but this
                 // behavior may change really soon, because I don't find this
                 // nearly as intuitive now as I did when I first wrote `sync`.
                    expect(this.val).to.be.an(Array);
                    expect(this.val.length).to.equal(0);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                    console.error('Error:', message);
                    return done();
                });
            });

            it('puts input arguments into `val` as an array', function (done) {
                sync(2, 3).Q(function (signal) {
                    expect(this.val[0] + this.val[1]).to.equal(5);
                    done();
                    return signal.exit();
                }).on('fail', function (message) {
                    console.error('Error:', message);
                    return done();
                });
            });


            it('keeps input arrays separate', function (done) {
             // This is just to make sure it doesn't accidentally concatenate
             // arrays, because the internal logic is tricky :-P
                sync([2], [3]).Q(function (signal) {
                    expect(this.val[0][0] + this.val[1][0]).to.equal(5);
                    done();
                    return signal.exit();
                }).on('fail', function (message) {
                    console.error('Error:', message);
                    return done();
                });
            });

        });

     // Behavior tests

        it('is awesome', function () {
            expect(true).to.equal(true);
        });

        it('is an object', function () {
            expect(quanah).to.be.an(Object);
        });

        it('has its own `avar` method', function () {
            expect(quanah).to.have.own.property('avar');
            expect(quanah.avar).to.be.a(Function);
            expect(quanah.avar.length).to.equal(1); // check arity
        });

        it('has its own `sync` method', function () {
            expect(quanah).to.have.own.property('sync');
            expect(quanah.sync).to.be.a(Function);
            expect(quanah.sync.length).to.equal(0);
        });

     /*
        it('does not affect assignment to a `Q` property', function () {
         // This test isn't relevant anymore, now that "Method Q" is no longer
         // a method of `Object.prototype` ...
            var x = {};
            x.Q = 5;
        });
     */

        it('can replace an avar\'s `val`', function (done) {
            var x = avar();
            x.Q(function (evt) {
             // This function needs documentation.
                x.val = Math.PI;
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                expect(this.val).to.equal(Math.PI);
                done();
                return evt.exit();
            });
        });

        it('can replace `this.val`', function (done) {
            var x = avar();
            x.Q(function (evt) {
             // This function needs documentation.
                this.val = Math.PI;
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                expect(x.val).to.equal(Math.PI);
                done();
                return evt.exit();
            });
        });

        it('survives deliberate failures', function (done) {
            var x = avar('This test fails deliberately :-)');
            x.Q(function (evt) {
             // This function needs documentation.
                return evt.fail(x.val);
            }).on('fail', function (message) {
             // This function needs documentation.
                expect(message).to.equal(x.val);
                return done();
            }).Q(function (evt) {
             // This function needs documentation.
                console.log('This should _NOT_ appear in the output!');
                return evt.exit();
            });
        });

        it('allows `.on` and `.Q` commutatively', function (done) {
            var x = avar('This test fails deliberately :-)');
            x.Q(function (evt) {
             // This function needs documentation.
                return evt.fail(x.val);
            }).Q(function (evt) {
             // This function needs documentation.
                console.log('This should _NOT_ appear in the output!');
                return evt.exit();
            }).on('fail', function (message) {
             // This function needs documentation.
                expect(message).to.equal(x.val);
                return done();
            });
        });

        it('survives unexpected failures', function (done) {
            var x = avar();
            x.Q(function (evt) {
             // This fails because `x.val` is not a function, which simulates a
             // programming error (as opposed to an uncaught `throw`).
                x.val('Hi mom!');
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                console.log('This should _NOT_ appear in the output!');
                return evt.exit();
            }).on('fail', function () {
             // This function needs documentation.
                return done();
            });
        });

        it('waits for "nested avars" to finish', function (done) {
            var x = avar();
            x.Q(function (evt) {
             // This function needs documentation.
                var temp = avar();
                temp.Q(function (temp_evt) {
                 // This function needs documentation.
                    temp.val = Math.random();
                    return temp_evt.exit();
                }).Q(function (temp_evt) {
                 // This function needs documentation.
                    temp_evt.exit();
                    return evt.exit();
                });
                return;
            }).Q(function (evt) {
             // This function needs documentation.
                done();
                return evt.exit();
            });
        });

        it('waits for short async operations', function (done) {
            var x = avar();
            x.Q(function (evt) {
             // NOTE: Should we also test `setImmediate`?
                process.nextTick(evt.exit);
                return;
            }).Q(function (evt) {
             // This function needs documentation.
                done();
                return evt.exit();
            });
        });

        it('waits for long[er] async operations', function (done) {
            var x = avar();
            x.Q(function (evt) {
             // This function needs documentation.
                setTimeout(evt.exit, 0);
                return;
            }).Q(function (evt) {
             // This function needs documentation.
                done();
                return evt.exit();
            });
        });

        it('relays error messages from "nested avars"', function (done) {
            var x = avar();
            x.Q(function (evt) {
             // This function needs documentation.
                var temp = avar('This fails deliberately.');
                temp.Q(function (temp_evt) {
                 // This function needs documentation.
                    return temp_evt.fail(temp.val);
                }).Q(function (temp_evt) {
                 // This function needs documentation.
                    console.log('This should _NOT_ appear in the output!');
                    temp_evt.exit();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                });
                return;
            }).Q(function (evt) {
             // This function needs documentation.
                console.log('This should _NOT_ appear in the output!');
                return evt.exit();
            }).on('fail', function (message) {
             // This function needs documentation.
                expect(message).to.equal('This fails deliberately.');
                return done();
            });
        });

     /*
        it('relays errors downstream to syncpoints', function () {
         // ...
        });

        it('relays errors upstream from syncpoints', function () {
         // ...
        });
     */

        it('supports avar functions', function (done) {
            var f, x;
            f = avar(function (evt) {
             // This function also happens to be "distributable".
                this.val += 2;
                return evt.exit();
            });
            x = avar(2);
            x.Q(f).Q(function (evt) {
             // This function needs documentation.
                if (this.val !== 4) {
                    return evt.fail('Computed result was not 4.');
                }
                done();
                return evt.exit();
            });
        });

        it('supports "functables"', function (done) {
            var f, proxy, x;
            f = function (signal) {
             // This function will be called indirectly...
                this.val += 2;
                return signal.exit();
            };
            proxy = {
                'call': function (that, signal) {
                 // This function is extremely meta. Details forthcoming.
                    return f.call(that, signal);
                }
            };
            x = avar(2);
            x.on('fail', function (message) {
             // This is weird stuff, man ...
                throw message;
            }).Q(proxy).Q(function (signal) {
             // Did it work?
                expect(x.val).to.equal(4);
                done();
                return signal.exit();
            });
        });

        it('supports avar "functables"', function (done) {
            var f, proxy, x;
            f = function (signal) {
             // This function will be called indirectly...
                this.val += 2;
                return signal.exit();
            };
            proxy = avar({
                'call': function (that, signal) {
                 // This function is extremely meta. Details forthcoming.
                    return f.call(that, signal);
                }
            });
            x = avar(2);
            x.on('fail', function (message) {
             // This is weird stuff, man ...
                throw message;
            }).Q(proxy).Q(function (signal) {
             // Did it work?
                expect(x.val).to.equal(4);
                done();
                return signal.exit();
            });
        });

        return;

    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
