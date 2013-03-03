//- JavaScript source code

//- quanah-spec.js ~~
//
//  These tests were originally contributed by David Robbins on 06 April 2012
//  for use with Jasmine (http://pivotal.github.com/jasmine/). The current form
//  is designed for use with Mocha (https://github.com/visionmedia/mocha) as
//  part of an NPM-based workflow.
//
//                                                      ~~ (c) SRW, 17 Nov 2012
//                                                  ~~ last updated 02 Mar 2013

(function () {
    'use strict';

 // Pragmas

    /*global beforeEach: false, describe: false, it: false */

    /*jslint indent: 4, maxlen: 80, node: true */

 // Declarations

    var expect;

 // Definitions

    expect = require('expect.js');

 // Tests

    describe('Quanah', function () {
     // This is the actual specification :-)
        var avar;
        beforeEach(function () {
         // This function needs documentation.
            Object.prototype.Q = require('../src/quanah');
            avar = Object.prototype.Q.avar;
            return;
        });

        it('should be awesome', function () {
            expect(true).to.equal(true);
        });

        it('should be a function', function () {
            expect(Object.prototype.Q).to.be.a('function');
        });

        it('should have its own `avar` method', function () {
            expect(Object.prototype.Q).to.have.property('avar');
            expect(Object.prototype.Q.avar).to.be.a('function');
        });

        it('should have its own `def` method', function () {
            expect(Object.prototype.Q).to.have.property('def');
            expect(Object.prototype.Q.def).to.be.a('function');
        });

        it('should have its own `when` method', function () {
            expect(Object.prototype.Q).to.have.property('when');
            expect(Object.prototype.Q.when).to.be.a('function');
        });

        it('should directly transform boolean literals', function (done) {
            true.Q(function (evt) {
             // This function needs documentation.
                this.val = (this.val === true);
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                expect(this.val).to.equal(true);
                done();
                return evt.exit();
            });
        });

        it('should directly transform number literals', function (done) {
            (2).Q(function (evt) {
             // This function needs documentation.
                this.val += 2;
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                expect(this.val).to.equal(4);
                done();
                return evt.exit();
            });
        });

        it('should directly transform object literals', function (done) {
            ({a: 2}).Q(function (evt) {
             // This function needs documentation.
                this.val.a += 2;
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                expect(this.val.a).to.equal(4);
                done();
                return evt.exit();
            });
        });

        it('should directly transform string literals', function (done) {
            ('Hello').Q(function (evt) {
             // This function needs documentation.
                this.val += ' world!';
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                expect(this.val).to.equal('Hello world!');
                done();
                return evt.exit();
            });
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
            var x = avar({val: 'This test fails deliberately :-)'});
            x.Q(function (evt) {
             // This function needs documentation.
                return evt.fail(x.val);
            }).on('error', function (message) {
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
            var x = avar({val: 'This test fails deliberately :-)'});
            x.Q(function (evt) {
             // This function needs documentation.
                return evt.fail(x.val);
            }).Q(function (evt) {
             // This function needs documentation.
                console.log('This should _NOT_ appear in the output!');
                return evt.exit();
            }).on('error', function (message) {
             // This function needs documentation.
                expect(message).to.equal(x.val);
                return done();
            });
        });

        it('should survive unexpected failures', function (done) {
            var x = avar();
            x.Q(function (evt) {
             // This function needs documentation.
                x.val('Hi mom!');
                return evt.exit();
            }).Q(function (evt) {
             // This function needs documentation.
                console.log('This should _NOT_ appear in the output!');
                return evt.exit();
            }).on('error', function (message) {
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
             // This function needs documentation.
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
                var temp = avar({val: 'This fails deliberately.'});
                temp.Q(function (temp_evt) {
                 // This function needs documentation.
                    return temp_evt.fail(temp.val);
                }).Q(function (temp_evt) {
                 // This function needs documentation.
                    console.log('This should _NOT_ appear in the output!');
                    temp_evt.exit();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    return evt.fail(message);
                });
                return;
            }).Q(function (evt) {
             // This function needs documentation.
                console.log('This should _NOT_ appear in the output!');
                return evt.exit();
            }).on('error', function (message) {
             // This function needs documentation.
                expect(message).to.equal('This fails deliberately.');
                return done();
            });
        });

        it('should always present the same `key`', function (done) {
            var f, results;
            f = function (evt) {
             // This function needs documentation.
                results.push(this.key);
                return evt.exit();
            };
            results = [];
            (Math.random()).Q(f).Q(f).Q(f).Q(f).Q(f).Q(function (evt) {
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
            }).on('error', function (message) {
             // This function needs documentation.
                console.error('Error:', message);
                return;
            });
        });

        it('should not affect assignment to a `Q` property', function () {
            ({}).Q = 5;
        });

        describe('An avar', function () {
         // This function needs documentation.
            var x;
            beforeEach(function () {
             // This function needs documentation.
                x = avar();
                return;
            });
            it('should have a `comm` instance method', function () {
                expect(x).to.have.property('comm');
                expect(x.comm).to.be.a('function');
            });
            it('should have a `key` instance property', function () {
                expect(x).to.have.property('key');
                expect(x.key).to.be.a('string');
            });
            it('should have a `val` instance property', function () {
                expect(x).to.have.property('val');
                expect(x.val).to.equal(null);
            });
            it('should have an `on` prototype method', function () {
                expect(x.constructor.prototype).to.have.property('on');
                expect(x.on).to.be.a('function');
            });
            it('should have a `revive` prototype method', function () {
                expect(x.constructor.prototype).to.have.property('revive');
                expect(x.revive).to.be.a('function');
            });
            it('should have a `toString` prototype method', function () {
                expect(x.constructor.prototype).to.have.property('toString');
                expect(x.toString).to.be.a('function');
            });
            it('should have a `valueOf` prototype method', function () {
                expect(x.constructor.prototype).to.have.property('valueOf');
                expect(x.valueOf).to.be.a('function');
            });
            return;
        });

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

        describe('The `when` method', function () {
         // This function needs documentation.
            var f, fa, when, x, xa, y, ya, z, za;
            beforeEach(function () {
             // This function needs documentation.
                f = function (evt) {
                 // This function needs documentation.
                    var i, n, y;
                    n = this.val.length;
                    y = 0;
                    for (i = 0; i < n; i += 1) {
                        y += this.val[i];
                    }
                    this.val = y;
                    return evt.exit();
                };
                fa = avar({val: f});
                when = Object.prototype.Q.when;
                x = 2;
                xa = avar({val: x});
                y = 3;
                ya = avar({val: y});
                z = 4;
                za = avar({val: z});
                return;
            });

         /*
            it('should work when no vars are given', function (done) {
                when().Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(null);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });
         */

            it('should work for "afunc(avar)"', function (done) {
                when(xa).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(2);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var)"', function (done) {
                when(x).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(2);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(avar, avar)"', function (done) {
                when(xa, ya).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(avar, var)"', function (done) {
                when(xa, y).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var, avar)"', function (done) {
                when(x, ya).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var, var)"', function (done) {
                when(x, y).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(avar, avar, avar)"', function (done) {
                when(xa, ya, za).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(avar, avar, var)"', function (done) {
                when(xa, ya, z).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(avar, var, avar)"', function (done) {
                when(xa, y, za).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var, avar, avar)"', function (done) {
                when(x, ya, za).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var, avar, var)"', function (done) {
                when(x, ya, z).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "afunc(var, var, var)"', function (done) {
                when(x, y, z).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar)"', function (done) {
                when(xa).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(2);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var)"', function (done) {
                when(x).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(2);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, avar)"', function (done) {
                when(xa, ya).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, var)"', function (done) {
                when(xa, y).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, avar)"', function (done) {
                when(x, ya).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, var)"', function (done) {
                when(x, y).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(5);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, avar, avar)"', function (bye) {
                when(xa, ya, za).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    bye();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, avar, var)"', function (done) {
                when(xa, ya, z).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, var, avar)"', function (done) {
                when(xa, y, za).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(avar, var, var)"', function (done) {
                when(xa, y, z).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, avar, avar)"', function (done) {
                when(x, ya, za).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, avar, var)"', function (done) {
                when(x, ya, z).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, var, avar)"', function (done) {
                when(x, y, za).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work for "function(var, var, var)"', function (done) {
                when(x, y, z).Q(f).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

            it('should work via `apply`', function (done) {
                when.apply(null, [xa, ya, za]).Q(fa).Q(function (evt) {
                 // This function needs documentation.
                    expect(this.val).to.equal(9);
                    done();
                    return evt.exit();
                }).on('error', function (message) {
                 // This function needs documentation.
                    console.error('Error:', message);
                    return;
                });
            });

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
