//- JavaScript source code

//- quanah-spec.js ~~
//
//  These tests were originally contributed by David Robbins on 06 April 2012
//  for use with Jasmine (http://pivotal.github.com/jasmine/). The current form
//  is designed for use with Mocha (https://github.com/visionmedia/mocha) as
//  part of an NPM-based workflow.
//
//                                                      ~~ (c) SRW, 17 Nov 2012

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

        it('should place function Q on the Object prototype', function () {
            expect(Object.prototype.hasOwnProperty('Q')).toBeTruthy();
        });

        it('should provide the Quanah API', function () {
         // Needs a better "should" string...
            var api, thing;
            api = {
                avar:   'function',
                def:    'function',
                ply:    'function',
                //volunteer: 'function',
                when :  'function'
            };
            for (thing in api) {
                if (api.hasOwnProperty(thing)) {
                    expect(typeof Q[thing]).toBe(api[thing]);
                }
            }
        });

    });

    describe('Quanah AVars', function () {

        describe('AVar Creation', function () {

            it('should allow creation of AVars with no spec', function () {
                var x = Q.avar();
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
                /*jslint unparam: true */
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
                    x.comm();
                    return done;
                }, 'Never finished.', 3000);
                runs(function () {
                    expect(x.val).toEqual('finished');
                });
            });

        });

    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
