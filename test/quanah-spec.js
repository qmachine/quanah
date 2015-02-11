//- JavaScript source code

//- quanah-spec.js ~~
//
//  Many of these tests were originally contributed by David Robbins for use
//  with Jasmine. I have rewritten almost all of it for use with Mocha, but I
//  am grateful to him for demonstrating how useful unit tests are :-)
//
//                                                      ~~ (c) SRW, 17 Nov 2012
//                                                  ~~ last updated 11 Feb 2015

/* @flow */

(function () {
    'use strict';

 // Pragmas

    /*global beforeEach: false, describe: false, it: false */

    /*jshint es3: true, maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80, node: true */

    /*properties
        a, an, avar, be, constructor, error, equal, exit, fail, have, key,
        length, log, name, nextTick, on, Q, PI, property, prototype, push,
        random, send, sync, to, toString, val, valueOf
    */

 // Declarations

    var expect;

 // Definitions

    expect = require('expect.js');

 // Tests

    describe('Quanah', function () {
     // This is the actual specification :-)

        var avar, quanah, sync;
        beforeEach(function () {
         // This function needs documentation.
            avar = require('../src/quanah').avar;
            quanah = require('../src/quanah');
            sync = require('../src/quanah').sync;
            return;
        });

        it('should be awesome', function () {
            expect(true).to.equal(true);
        });

        it('should be an object', function () {
            expect(quanah).to.be.an('object');
        });

        it('should have its own `avar` method', function () {
            expect(quanah).to.have.property('avar');
            expect(quanah.avar).to.be.a('function');
            expect(quanah.avar.length).to.equal(1); // check arity
        });

        it('should have its own `sync` method', function () {
            expect(quanah).to.have.property('sync');
            expect(quanah.sync).to.be.a('function');
            expect(quanah.sync.length).to.equal(0);
        });

        it('should be able to replace an avar\'s `val`', function (done) {
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

        it('should be able to replace `this.val`', function (done) {
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

        it('should survive deliberate failures', function (done) {
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

        it('should allow `.on` and `.Q` commutatively', function (done) {
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

        it('should survive unexpected failures', function (done) {
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

        it('should wait for "nested avars" to finish', function (done) {
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

        it('should wait for short async operations', function (done) {
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

        it('should wait for long[er] async operations', function (done) {
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

        it('should relay error messages from "nested avars"', function (done) {
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
        it('should always present the same `key`', function (done) {
            var f, results;
            f = function (evt) {
             // This function needs documentation.
                results.push(this.key);
                return evt.exit();
            };
            results = [];
            avar({val: Math.random()}).Q(f).Q(f).Q(f).Q(f).Q(function (evt) {
             // This function needs documentation.
                var first, i;
                first = results[0];
                for (i = 0; i < results.length; i += 1) {
                    if (results[i] !== first) {
                        return evt.fail('Test failed.');
                    }
                }
                done();
                return evt.exit();
            }).on('fail', function (message) {
             // This function needs documentation.
                console.error('Error:', message);
                return;
            });
        });
     */

        it('should support avar functions', function (done) {
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

     /*
        it('should not affect assignment to a `Q` property', function () {
            ({}).Q = 5;
        });
     */

        describe('An avar', function () {
         // This function needs documentation.
            var x;
            beforeEach(function () {
             // This function needs documentation.
                x = avar();
                return;
            });
            it('should have a constructor called "AVar"', function () {
                expect(x.constructor.name).to.equal('AVar');
            });
            it('should have a `send` instance method', function () {
                expect(x).to.have.property('send');
                expect(x.send).to.be.a('function');
            });
         /*
            it('should have a `key` instance property', function () {
                expect(x).to.have.property('key');
                expect(x.key).to.be.a('string');
            });
         */
            it('should have a `val` instance property', function () {
                expect(x).to.have.property('val');
                expect(x.val).to.equal(undefined);
            });
            it('should have an `on` prototype method', function () {
                expect(x.constructor.prototype).to.have.property('on');
                expect(x.on).to.be.a('function');
                expect(x.on.length).to.equal(2);
            });
            it('should have a `Q` prototype method', function () {
                expect(x.constructor.prototype).to.have.property('Q');
                expect(x.constructor.prototype.Q).to.be.a('function');
                expect(x.constructor.prototype.Q.length).to.equal(1);
            });
         /*
            it('should have a `revive` prototype method', function () {
                expect(x.constructor.prototype).to.have.property('revive');
                expect(x.revive).to.be.a('function');
                expect(x.revive.length).to.equal(0);
            });
            it('should have a `toString` prototype method', function () {
                expect(x.constructor.prototype).to.have.property('toString');
                expect(x.toString).to.be.a('function');
                expect(x.toString.length).to.equal(0);
            });
            it('should have a `valueOf` prototype method', function () {
                expect(x.constructor.prototype).to.have.property('valueOf');
                expect(x.valueOf).to.be.a('function');
                expect(x.valueOf.length).to.equal(0);
            });
         */
            return;
        });

     /*
        describe('The `AVar.prototype.toString` method', function () {
         // This function needs documentation.
            var x;
            beforeEach(function () {
             // This function needs documentation.
                x = avar();
                return;
            });
            it('should propagate arguments for buffers', function () {
                x.val = new Buffer('hello');
                expect(x.toString('base64')).to.equal('aGVsbG8=');
            });
            it('should propagate arguments for numbers', function () {
                x.val = 34;
                expect(x.toString(8)).to.equal('42');
            });
            return;
        });
     */

        describe('The `sync` method', function () {
         // This function needs documentation.
            var f, fa, x, xa, y, ya, z, za;
            beforeEach(function () {
             // This function needs documentation.
                f = function (evt) {
                 // This function needs documentation.
                    var i, n, temp;
                    n = this.val.length;
                    temp = 0;
                    for (i = 0; i < n; i += 1) {
                        temp += this.val[i];
                    }
                    this.val = temp;
                    return evt.exit();
                };
                fa = avar(f);
                x = 2;
                xa = avar(x);
                y = 3;
                ya = avar(y);
                z = 4;
                za = avar(z);
                return;
            });

            it('should work when no vars are given', function (done) {
                sync().Q(function (evt) {
                 // This function records the current behavior, but this
                 // behavior may change really soon, because I don't find this
                 // nearly as intuitive now as I did when I first wrote `sync`.
                    expect(this.val).to.be.an(Array);
                    expect(this.val.length).to.equal(0);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

         /*
            it('should work for "afunc(avar)"', function (done) {
                sync(xa).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(2);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var)"', function (done) {
                sync(x).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(2);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(avar, avar)"', function (done) {
                sync(xa, ya).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(avar, var)"', function (done) {
                sync(xa, y).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var, avar)"', function (done) {
                sync(x, ya).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var, var)"', function (done) {
                sync(x, y).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(avar, avar, avar)"', function (done) {
                sync(xa, ya, za).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(avar, avar, var)"', function (done) {
                sync(xa, ya, z).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(avar, var, avar)"', function (done) {
                sync(xa, y, za).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var, avar, avar)"', function (done) {
                sync(x, ya, za).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var, avar, var)"', function (done) {
                sync(x, ya, z).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var, var, var)"', function (done) {
                sync(x, y, z).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar)"', function (done) {
                sync(xa).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(2);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var)"', function (done) {
                sync(x).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(2);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, avar)"', function (done) {
                sync(xa, ya).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, var)"', function (done) {
                sync(xa, y).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, avar)"', function (done) {
                sync(x, ya).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, var)"', function (done) {
                sync(x, y).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, avar, avar)"', function (bye) {
                sync(xa, ya, za).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    bye();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, avar, var)"', function (done) {
                sync(xa, ya, z).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, var, avar)"', function (done) {
                sync(xa, y, za).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, var, var)"', function (done) {
                sync(xa, y, z).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, avar, avar)"', function (done) {
                sync(x, ya, za).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, avar, var)"', function (done) {
                sync(x, ya, z).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, var, avar)"', function (done) {
                sync(x, y, za).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, var, var)"', function (done) {
                sync(x, y, z).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work via `apply`', function (done) {
                sync.apply(null, [xa, ya, za]).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('fail', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

         */

        });

        return;

    });

 /*
    describe('Quanah AVars', function () {

        var avar;

        beforeEach(function () {
         // This function needs documentation.
            Object.prototype.Q = require('../src/quanah');
            avar = Object.prototype.Q.avar;
            return;
        });

        describe('AVar Creation', function () {

            it('should allow creation of AVars with no spec', function () {
                var x = avar();
                expect(x).toBeAObject();
                expect(x.key).toBeAUuid();
                expect(x.val).toBeNull();
            });

            it('should allow creation of AVars with only a key', function () {
                var x = Q.avar({key: 'a'});
                expect(x).toBeAObject();
                expect(x.key).toEqual("a");
                expect(x.val).toBeNull();
            });

            it('should allow creation of AVars with only a val', function () {
                var x = Q.avar({val: 'a'});
                expect(x).toBeAObject();
                expect(x.key).toBeAUuid();
                expect(x.val).toEqual("a");
            });

            it('should allow creation of AVars with key and val', function () {
                var x = Q.avar({key: 'a', val: 12345});
                expect(x).toBeAObject();
                expect(x.key).toEqual("a");
                expect(x.val).toEqual(12345);
            });

            it('should construct AVar from a stringified avar', function () {
                var x, y, z;
                x = Q.avar({key: 'a', val: 12345});
                y = JSON.stringify(x);
                z = Q.avar(y);
                expect(x).toEqual(z);
            });

            return;

        });

        describe('Avar Access', function () {

            var avars, vals, spy;

            beforeEach(function () {
                vals = [
                    1234, '1234', [1, 2, 3, 4], {a: 1, b: 2}, function () {}
                ];
                avars = getAvars(vals);
                spy = jasmine.createSpy();
            });

            xit('should be retrievable as JSON with toJSON()', function () {
             // Disabled until toJSON is better specified,
             // e.g. for functions as vals
                var x, spec;
                spec = {key: 'a', val: '12345'};
                x = Q.avar(spec);
                expect(x.toJSON()).toEqual(spec);
                avars.onready = Q.ply(function (k, v) {
                    expect(v.toJSON().val).toEqual(vals[k]);
                    spy();
                });
                expect(spy.callCount).toEqual(5);
            });

            it('coerces val to string when toString is called', function () {
                avars.onready = Q.ply(function (k, v) {
                    expect(v.toString()).toEqual(vals[k].toString());
                    spy();
                });
                expect(spy.callCount).toEqual(5);
            });

            it('returns raw val when valueOf is called', function () {
                avars.onready = Q.ply(function (k, v) {
                    expect(v.valueOf()).toEqual(vals[k]);
                    spy();
                });
                expect(spy.callCount).toEqual(5);
            });

            return;

        });

        describe('Avar execution', function () {

            var x, spy;

            beforeEach(function () {
                x = Q.avar();
                spy = jasmine.createSpy();
            });

            it('runs computations assigned to onready', function () {
                x = Q.avar({val: 0});
                x.onready = function (evt) {
                    this.val += 1;
                    evt.exit();
                };
                expect(x.val).toEqual(1);
            });

            it("should apply Avar.onready's sequentially", function () {
                x.onready = function (evt) {
                    this.val = "dogs";
                    evt.exit();
                };
                x.onready = function (evt) {
                    expect(this.val).toEqual("dogs");
                    this.val = "cats";
                    evt.exit();
                };
                x.onready = function (evt) {
                    expect(this.val).toEqual("cats");
                    evt.exit();
                };
            });

            it('stays execution when evt.stay is called', function () {
                x.onready = function (evt) {
                    this.val = "before";
                    evt.exit();
                };
                x.onready = function (evt) {
                    evt.stay();
                };
                x.onready = function (evt) {
                    spy();
                    evt.exit();
                };
                expect(spy).not.toHaveBeenCalled();
            });

            it('does not execute next onready w/o evt.exit call', function () {
                x.onready = function (evt) {
                    this.val = "value";
                };
                x.onready = function (evt) {
                    spy();
                    evt.exit();
                };
                expect(spy).not.toHaveBeenCalled();
            });

            it('executes onerror handler if evt.fail is called', function () {
                x.onerror = function (msg) {
                    expect(msg).toEqual("Oh Noes!!");
                    spy();
                };
                x.onready = function (evt) {
                    evt.fail("Oh Noes!!");
                };
                expect(spy).toHaveBeenCalled();
            });

            xit('allows iteration over "iterables" via Q.ply', function () {
                var vals, avars, afterVals, i, doubleIt, checkIt;
                vals = [[1, 2, 3, 4], {a: 1, b: 2, c: 3, d: 4}];
                afterVals = [[2, 4, 6, 8], {a: 2, b: 4, c: 6, d: 8}];
                avars = getAvars(vals).val;
                doubleIt = function () {
                    this.val *= 2;
                };
                checkIt = function (i) {
                    return function (evt) {
                        expect(this.val).toEqual(afterVals[i]);
                        spy();
                        evt.exit();
                    };
                };
                for (i in vals) {
                 // Could be replaced with ply ... but that would be cheating?
                    if (vals.hasOwnProperty(i)) {
                        avars[i].onready = Q.ply(doubleIt);
                        avars[i].onready = checkIt(i);
                    }
                }
                expect(spy.callCount).toBe(2);
            });

            it('stays execution for long-running onready', function () {
                var done, tic, x;
                tic = Date.now();
                done = false;
                x = Q.avar();
                x.onerror = onerror;
                x.onready = function (evt) {
                    if ((Date.now() - tic) < 2000) {
                        return evt.stay();
                    }
                    done = true;
                    this.val = "finished";
                    return evt.exit();
                };
                x.onready = function (evt) {
                    done = true;
                    return evt.exit();
                };
                waitsFor(function () {
                    x.revive();
                    return done;
                }, 'Never finished.', 3000);
                runs(function () {
                    expect(x.val).toEqual('finished');
                });
            });

        });

    });

 */

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
