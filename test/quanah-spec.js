//- JavaScript source code

//- quanah-spec.js ~~
//
//  These tests will likely be completely reworked in the near future ...
//
//                                                      ~~ (c) SRW, 17 Nov 2012
//                                                  ~~ last updated 31 May 2015

/*eslint new-cap: 0 */

/*eslint-env node */

/* @flow */

/*global beforeEach: false, describe: false, it: false */

/*jshint es3: true, maxparams: 2, quotmark: double, strict: true */

/*jslint indent: 4, maxlen: 80, node: true */

/*properties
    a, an, avar, be, call, constructor, error, equal, exit, fail,
    getPrototypeOf, have, key, length, log, name, nextTick, not, on, own, Q,
    PI, property, prototype, push, random, send, snooze, stay, sync, timeout,
    to, val
*/

(function () {
    "use strict";

 // Declarations

    var expect;

 // Definitions

    expect = require("expect.js");

 // Tests

    describe("Quanah", function () {

        var AVar, avar, quanah, sync;

        beforeEach(function () {
            AVar = require("../src/quanah").avar().constructor;
            avar = require("../src/quanah").avar;
            quanah = require("../src/quanah");
            sync = require("../src/quanah").sync;
        });

        describe("The `AVar` constructor function", function () {

            it("is a function", function () {
                expect(AVar).to.be.a(Function);
            });

            it("accepts a single, optional argument", function () {
                expect(AVar.length).to.equal(1);
                expect(new AVar()).to.be.an(AVar);
            });

        });

        describe("`AVar.prototype`", function () {

            it("is an object", function () {
                expect(AVar.prototype).to.be.an(Object);
            });

            it("inherits directly from `Object.prototype`", function () {
                var proto = Object.getPrototypeOf(AVar.prototype);
                expect(proto).to.equal(Object.prototype);
            });

            it("provides an `on` method", function () {
                expect(AVar.prototype).to.have.property("on");
                expect(AVar.prototype.on).to.be.a(Function);
            });

            it("provides a `Q` method", function () {
                expect(AVar.prototype).to.have.own.property("Q");
                expect(AVar.prototype.Q).to.be.a(Function);
            });

        });

        describe("The `AVar.prototype.on` method", function () {

            it("accepts two arguments", function () {
                expect(AVar.prototype.on.length).to.equal(2);
            });

            it("returns the same avar", function () {
                var x, y;
                x = avar();
                y = x.on("fail", function (message) {
                 // This is a typical error handler for Node.js.
                    console.log("Error:", message);
                    return;
                });
                expect(x).to.equal(y);
            });

            it("cannot be called as a function", function () {
                var x;
                try {
                    x = AVar.prototype.on();
                } catch (err) {
                    x = err;
                }
                expect(x).to.be.an(Error);
            });

        });

        describe("The `AVar.prototype.Q` method", function () {

            it("accepts one argument", function () {
                expect(AVar.prototype.Q.length).to.equal(1);
            });

            it("`fail`s the avar when no argument is given", function (done) {
                avar().Q().on("fail", function () {
                    done();
                });
            });

            it("returns the same avar", function () {
                var x, y;
                x = avar();
                y = x.Q(function (signal) {
                 // This function doesn't do anything; it's just for testing.
                    return signal.exit();
                });
                expect(x).to.equal(y);
            });

            it("cannot be called as a function", function () {
                var x;
                try {
                    x = AVar.prototype.Q();
                } catch (err) {
                    x = err;
                }
                expect(x).to.be.an(Error);
            });

            it("does not support generic calls", function () {
                var x;
                try {
                    x = AVar.prototype.Q.call(null, function (signal) {
                     // This function doesn't do anything ...
                        return signal.exit();
                    });
                } catch (err) {
                    x = err;
                }
                expect(x).not.to.be.an(AVar);
                expect(x).to.be.an(Error);
            });

        });

        describe("The `avar` function", function () {

            it("has the same arity as the `AVar` constructor", function () {
                expect(avar.length).to.equal(AVar.length);
            });

            it("works when no arguments are given", function (done) {
                avar().Q(function (signal) {
                 // This function records the current behavior.
                    expect(this.val).to.be(undefined);
                    done();
                    return signal.exit();
                }).on("fail", function (message) {
                    console.error("Error:", message);
                    return;
                });
            });

         /*
            it("cannot be used as a method", function () {
             // What I mean here is that `avar.call(this, val)` is exactly the
             // same as `avar(val)`, for all possible values of `this` ...
            });
         */

        });

        describe("The `sync` function", function () {

            it("returns an avar", function () {
                expect(sync(1, 2, 3)).to.be.an(AVar);
            });

            it("puts input arguments into `val` as an array", function (done) {
                sync(2, 3).Q(function (signal) {
                    expect(this.val).to.be.an(Array);
                    expect(this.val[0] + this.val[1]).to.equal(5);
                    done();
                    return signal.exit();
                }).on("fail", function (message) {
                    console.error("Error:", message);
                    return done();
                });
            });

            it("works when no arguments are given", function (done) {
                sync().Q(function (signal) {
                 // This function records the current behavior, but this
                 // behavior may change really soon, because I don't find this
                 // nearly as intuitive now as I did when I first wrote `sync`.
                    expect(this.val).to.be.an(Array);
                    expect(this.val.length).to.equal(0);
                    done();
                    return signal.exit();
                }).on("fail", function (message) {
                    console.error("Error:", message);
                    return;
                });
            });

            it("keeps input arrays separate", function (done) {
             // This is just to make sure it doesn't accidentally concatenate
             // arrays, because the internal logic is tricky :-P
                sync([2], [3]).Q(function (signal) {
                    expect(this.val[0][0] + this.val[1][0]).to.equal(5);
                    done();
                    return signal.exit();
                }).on("fail", function (message) {
                    console.error("Error:", message);
                    return done();
                });
            });

         /*
            it("cannot be used as a method", function () {
             // What I mean here is that `sync.call(this, val)` is exactly the
             // same as `sync(val)`, for all possible values of `this` ...
            });
         */

        });

        describe("An avar", function () {

            var x;

            beforeEach(function () {
                x = avar();
            });

            it("is an instance of `AVar`", function () {
                expect(x).to.be.an(AVar);
            });

            it("is an instance of `Object`", function () {
             // This is a consequence of its prototype chain, but there's no
             // harm in checking to be sure.
                expect(x).to.be.an(Object);
            });

            it("has a `send` instance method", function () {
                expect(x).to.have.own.property("send");
                expect(x.send).to.be.a(Function);
            });

            it("has a `val` instance property", function () {
                expect(x).to.have.own.property("val");
                expect(x.val).to.equal(undefined);
            });

        });

        describe("An avar's `send` method", function () {

            var x;

            beforeEach(function () {
                x = avar();
            });

            it("accepts two arguments", function () {
                expect(x.send.length).to.equal(2);
            });

            it("always returns the same avar", function () {
                var y = x.send("(name)", "(optional argument)");
                expect(y).to.equal(x);
            });

            it("forwards `fail` when no arguments are given", function (done) {
                x.send().on("fail", function () {
                    done();
                });
            });

            it("forwards `fail` when given an unknown `name`", function (done) {
                x.send("ooga", "booga").on("fail", function () {
                    done();
                });
            });

        });

        describe("An avar's `val` property", function () {

            it("is the same value provided to the constructor", function () {
                var x, y;
                x = Math.random();
                y = avar(x);
                expect(x).to.equal(y.val);
            });

            it("can be another avar", function () {
             // This test prohibits the old "copy constructor" pattern.
                var x = avar(avar());
                expect(x.val).to.be.an(AVar);
            });

        });

        describe("A syncpoint", function () {

            var x;

            beforeEach(function () {
                x = sync();
                return;
            });

            it("is an instance of `AVar`", function () {
                expect(x).to.be.an(AVar);
            });

            it("is an instance of `Object`", function () {
             // This is a consequence of its prototype chain, but there's no
             // harm in checking to be sure.
                expect(x).to.be.an(Object);
            });

            it("has an array as its `val`", function () {
                expect(x.val).to.be.an(Array);
            });

            it("has an instance method `Q`", function () {
                expect(x).to.have.own.property("Q");
                expect(x.Q).to.be.a(Function);
                expect(x.Q).not.to.equal(AVar.prototype.Q);
            });

        });

        describe("The `Q` instance method of a syncpoint", function () {

            it("accepts one argument", function () {
                expect(sync().Q.length).to.equal(1);
            });

            it("`fail`s the avar when no argument is given", function (done) {
                sync().Q().on("fail", function () {
                    done();
                });
            });

            it("returns the same avar", function () {
                var x, y;
                x = sync();
                y = x.Q(function (signal) {
                 // This function doesn't do anything; it's just for testing.
                    return signal.exit();
                });
                expect(x).to.equal(y);
            });

        });

     // Behavior tests

        it("is awesome", function () {
            expect(true).to.equal(true);
        });

        it("is an object", function () {
            expect(quanah).to.be.an(Object);
        });

        it("has its own `avar` method", function () {
            expect(quanah).to.have.own.property("avar");
            expect(quanah.avar).to.be.a(Function);
            expect(quanah.avar.length).to.equal(1); // check arity
        });

        it("has its own `sync` method", function () {
            expect(quanah).to.have.own.property("sync");
            expect(quanah.sync).to.be.a(Function);
            expect(quanah.sync.length).to.equal(0);
        });

        it("does not affect assignment to a `Q` property", function () {
         // Even though "Method Q" is no longer an `Object.prototype` method,
         // it doesn't hurt anything to run this test.
            var x = {};
            x.Q = 5;
        });

        it("can replace an avar's `val`", function (done) {
            var x = avar();
            x.Q(function (signal) {
             // This function needs documentation.
                x.val = Math.PI;
                return signal.exit();
            }).Q(function (signal) {
             // This function needs documentation.
                expect(this.val).to.equal(Math.PI);
                done();
                return signal.exit();
            });
        });

        it("can replace `this.val`", function (done) {
            var x = avar();
            x.Q(function (signal) {
             // This function needs documentation.
                this.val = Math.PI;
                return signal.exit();
            }).Q(function (signal) {
             // This function needs documentation.
                expect(x.val).to.equal(Math.PI);
                done();
                return signal.exit();
            });
        });

        it("survives deliberate failures", function (done) {
            var x = avar("This test fails deliberately :-)");
            x.Q(function (signal) {
             // This function needs documentation.
                return signal.fail(x.val);
            }).on("fail", function (message) {
             // This function needs documentation.
                expect(message).to.equal(x.val);
                return done();
            }).Q(function (signal) {
             // This function needs documentation.
                console.log("This should _NOT_ appear in the output!");
                return signal.exit();
            });
        });

        it("allows `.on` and `.Q` commutatively", function (done) {
            var x = avar("This test fails deliberately :-)");
            x.Q(function (signal) {
             // This function needs documentation.
                return signal.fail(x.val);
            }).Q(function (signal) {
             // This function needs documentation.
                console.log("This should _NOT_ appear in the output!");
                return signal.exit();
            }).on("fail", function (message) {
             // This function needs documentation.
                expect(message).to.equal(x.val);
                return done();
            });
        });

        it("survives unexpected failures", function (done) {
            var x = avar();
            x.Q(function (signal) {
             // This fails because `x.val` is not a function, which simulates a
             // programming error (as opposed to an uncaught `throw`).
                x.val("Hi mom!");
                return signal.exit();
            }).Q(function (signal) {
             // This function needs documentation.
                console.log("This should _NOT_ appear in the output!");
                return signal.exit();
            }).on("fail", function () {
             // This function needs documentation.
                return done();
            });
        });

        it("waits for 'nested avars' to finish", function (done) {
            var x = avar();
            x.Q(function (outer) {
             // This function needs documentation.
                var temp = avar();
                temp.Q(function (inner) {
                 // This function needs documentation.
                    temp.val = Math.random();
                    return inner.exit();
                }).Q(function (inner) {
                 // This function needs documentation.
                    inner.exit();
                    return outer.exit();
                });
                return;
            }).Q(function (signal) {
             // This function needs documentation.
                done();
                return signal.exit();
            });
        });

        it("waits for short async operations", function (done) {
            var x = avar();
            x.Q(function (signal) {
             // NOTE: Should we also test `setImmediate`?
                process.nextTick(signal.exit);
                return;
            }).Q(function (signal) {
             // This function needs documentation.
                done();
                return signal.exit();
            });
        });

        it("waits for long[er] async operations", function (done) {
            var x = avar();
            x.Q(function (signal) {
             // This function needs documentation.
                setTimeout(signal.exit, 0);
                return;
            }).Q(function (signal) {
             // This function needs documentation.
                done();
                return signal.exit();
            });
        });

        it("relays error messages from 'nested avars'", function (done) {
            var x = avar();
            x.Q(function (outer) {
             // This function needs documentation.
                var temp = avar("This fails deliberately.");
                temp.Q(function (inner) {
                 // This function needs documentation.
                    return inner.fail(temp.val);
                }).Q(function (inner) {
                 // This function needs documentation.
                    console.log("This should _NOT_ appear in the output!");
                    inner.exit();
                    return outer.exit();
                }).on("fail", function (message) {
                 // This function needs documentation.
                    return outer.fail(message);
                });
                return;
            }).Q(function (signal) {
             // This function needs documentation.
                console.log("This should _NOT_ appear in the output!");
                return signal.exit();
            }).on("fail", function (message) {
             // This function needs documentation.
                expect(message).to.equal("This fails deliberately.");
                return done();
            });
        });

        it("relays errors downstream to syncpoints", function (done) {

            var x, y, z;

            x = avar(2);
            y = avar(2);
            z = sync(x, y);

            x.Q(function (signal) {
                this.val += 2;
                return signal.exit();
            });

            y.Q(function (signal) {
                return signal.fail("Failing upstream deliberately ...");
            });

            z.Q(function (signal) {
                console.log("This should _NOT_ appear in the output!");
                return signal.exit();
            }).on("fail", function (message) {
                expect(message).to.be("Failed prerequisite(s) for syncpoint");
                return done();
            });

        });

     /*
        it("relays errors upstream from syncpoints", function () {
         // ...
        });

        it("can sync a single avar", function (done) {
         // ...
        });

        it("can sync an avar with itself", function (done) {
         // ...
        });

        it("can sync an avar with a var", function (done) {
         // ...
        });

        it("can sync a syncpoint", function (done) {
         // ...
        });

        it("can sync a syncpoint with itself", function (done) {
         // ...
        });

        it("can sync an avar with a syncpoint", function (done) {
         // ...
        });

        it("can sync a var with a syncpoint", function (done) {
         // ...
        });

        it("can sync an avar, a syncpoint, and a var", function (done) {
         // ...
        });
     */

        it("supports queueing 'functables'", function (done) {
            var functable, x;
            functable = {
                "call": function (that, signal) {
                 // This function is extremely meta. Details forthcoming.
                    that.val += 2;
                    return signal.exit();
                }
            };
            x = avar(2);
            x.on("fail", function (message) {
             // This is weird stuff, man ...
                throw message;
            }).Q(functable).Q(function (signal) {
             // Did it work?
                expect(x.val).to.equal(4);
                done();
                return signal.exit();
            });
        });

        it("supports 'functables' as `onfail` listeners", function (done) {
            var onfail, x;
            onfail = {
                "call": function (that, message) {
                 // This function is extremely meta. Details forthcoming.
                    expect(that).to.be(x);
                    expect(message).to.equal(x.val);
                    done();
                    return;
                }
            };
            x = avar("The struggle is real.");
            x.on("fail", onfail).Q(function (signal) {
             // This function is expected to fail, btw.
                return signal.fail(x.val);
            });
        });

        it("survives infinite loops", function (done) {
            this.timeout(60 * 1000);
            quanah.snooze = function (tick) {
                if (typeof setImmediate === "function") {
                    setImmediate(tick);
                } else {
                    setTimeout(tick, 0);
                }
                return;
            };
            avar(0).Q(function (outer) {
                this.val += 1;
                if (this.val === 1e4) {
                    done();
                    return;
                }
                avar().Q(function (inner) {
                    inner.exit();
                    return outer.stay("Looping ...");
                }).on("fail", function (err) {
                    console.error("Error: " + err);
                    return outer.stay("Looping ...");
                });
                return;
            });
            return;
        });

        return;

    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
