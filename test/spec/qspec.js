//- JavaScript source code

//- qspec.js ~~
//
//  Jasmine (http://pivotal.github.com/jasmine/) BDD Specs for Quanah, written
//  in an effort to:
//    * Provide a degree of documentation
//    * Learn the damn thing
//    * Provide a way to catch changes made in Quanah's API
//
//  The actually interesting, i.e. expressive of Quanah's use, code takes place in
//  the describe(...) blocks; everything prior is just helpers.
//
//                                                      ~~ (c) DER, 6 Apr 2012

(function(){
  "use strict";
  var getAvars, toType, onerror;

  // Pragmas for JSHint
  /*globals describe:false it:false beforeEach:false expect:false Q:false*/
  /*globals jasmine:false console:false*/

  // Utility Additions and functions
  getAvars = function getAvars(){
    // Returns an avar whose val is an array of avars, with one for each
    // of the arguments (or each element of the first argument if it is
    // an array.
    var avars = [], arg, args, i, temp;
    if ( toType(arguments[0]) === "array" ) args = arguments[0];
    else args = arguments;
    for ( i in args) {
      if ( args.hasOwnProperty(i) === false ) continue;
      arg = args[i];
      temp = Q.avar({ val:arg });
      temp.onerror = onerror;
      avars.push(temp);
    }
    temp = Q.avar({ val:avars });
    temp.onerror = onerror;
    return temp;
  };

  toType = function toType(obj) {
        return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
  };

  onerror = function (msg) {
    console.error(msg);
  };

  beforeEach(function(){

    var customMatchers, setMatcherMessage;

    setMatcherMessage = function(message, matcher_context){
          matcher_context.message = function(){return message;};
    };

    customMatchers = {};

    customMatchers.toBeA = function toBeA(expected_type){
      return toType(this.actual) === expected_type;
    };

    customMatchers.toBeAFunction = function toBeAFunction(){
      return toType(this.actual) === 'function';
    };

    customMatchers.toBeAObject = function toBeAObject(){
      return toType(this.actual) === 'object';
    };

    customMatchers.toBeAUuid = function toBeAUuid(){
      return (this.actual.match(/[0-9abcdef]{32}/)) !== null;
    };

    customMatchers.toContainPrefixes = function toContainPrefixes(expected){
      var key;
      for (key in expected){
        if (expected.hasOwnProperty(key) && this.actual[key] !== expected[key]){
          setMatcherMessage(
              "Expected "+this.actual[key]+" to be "+expected[key]+", with prefix "+key+".",
              this
          );
          return false;
        }
      }
      return true;
    };

    this.addMatchers(customMatchers);

  });

  // The Overall Spec
  describe("Quanah", function(){

    it("should be awesome", function(){
      expect(true).toBeTruthy();
    });

    it("should place function Q on the Object prototype", function(){
      expect(Object.prototype.hasOwnProperty('Q')).toBeTruthy();
    });

    it("shoud provide the quanah API", function(){
      //Needs a better "should" string...
      var api, thing;
      api = {
        avar : 'function',
        ply : 'function',
        map : 'function',
        reduce : 'function',
        when : 'function'
      };
      for ( thing in api ){
        if (api.hasOwnProperty(thing)){
          expect(typeof Q[thing]).toBe(api[thing]);
        }
      }
    });

  });

  describe("Quanah Avars", function(){

    describe("Avar Creation", function(){

      it("should allow creation of Avars with no spec", function(){
        var x = Q.avar();
        expect(x).toBeAObject();
        expect(x.key).toBeAUuid();
        expect(x.val).toBeNull();
      });

      it("should allow creation of Avars with only a key", function(){
        var x = Q.avar({ key : "a" });
        expect(x).toBeAObject();
        expect(x.key).toEqual("a");
        expect(x.val).toBeNull();
      });

      it("should allow creation of Avars with only a val", function(){
        var x = Q.avar({ val : "a" });
        expect(x).toBeAObject();
        expect(x.key).toBeAUuid();
        expect(x.val).toEqual("a");
      });

      it("should allow creation of Avars with a key and val", function(){
        var x = Q.avar({ key : "a", val : 12345 });
        expect(x).toBeAObject();
        expect(x.key).toEqual("a");
        expect(x.val).toEqual(12345);
      });

      it("should allow creation of Avars with a stringified avar", function(){
        var x, y, z;
        x = Q.avar({ key : "a", val : 12345 });
        y = JSON.stringify(x);
        z = Q.avar(y);
        expect(x).toEqual(z);
      });

    });

    describe("Avar Access", function(){

      var avars, vals, i, spy;

      beforeEach(function(){
        vals = [1234, "1234", [1,2,3,4], {a:1, b:2}, function(){}];
        avars = getAvars(vals);
        spy = jasmine.createSpy();
      });

      xit("should be retrievable as JSON with toJSON()", function(){
        // Disabled until toJSON is better specified,
        // e.g. for functions as vals
        var x, spec;
        spec = { key : "a", val : "12345"};
        x = Q.avar(spec);
        expect(x.toJSON()).toEqual(spec);
        avars.onready = Q.ply(function(k,v){
          expect(v.toJSON().val).toEqual(vals[k]);
          spy();
        });
        expect(spy.callCount).toEqual(5);
      });

      it("should allow the value to be retrieved as a string with toString()", function(){
        avars.onready = Q.ply(function(k,v){
          expect(v.toString()).toEqual(vals[k].toString());
          spy();
        });
        expect(spy.callCount).toEqual(5);
      });

      it("should allow the value to be retrieved with valueOf()", function(){
        avars.onready = Q.ply(function(k,v){
          expect(v.valueOf()).toEqual(vals[k]);
          spy();
        });
        expect(spy.callCount).toEqual(5);
      });

    });

    describe("Avar execution", function(){

      var x, spy;

      beforeEach(function(){
        x = Q.avar();
        spy = jasmine.createSpy();
      });

      it("should allow computations to be run with Avar.onready", function(){
        x = Q.avar({ val:0 });
        x.onready = function (evt) {
          this.val += 1;
          evt.exit();
        };
        expect(x.val).toEqual(1);
      });

      it("should apply Avar.onready's sequentially", function(){
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

      it("should allow an onready to pause execution using evt.stay()", function(){
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

      it("should not execute the next onready block if evt.exit() is not called", function(){
        x.onready = function (evt) {
          this.val = "value";
        };
        x.onready = function (evt) {
          spy();
          evt.exit();
        };
        expect(spy).not.toHaveBeenCalled();
      });

      it("should execute the onerror block if evt.fail() is called", function(){
        x.onerror = function (msg) {
          expect(msg).toEqual("Oh Noes!!");
          spy();
        };
        x.onready = function (evt) {
          evt.fail("Oh Noes!!");
        };
        expect(spy).toHaveBeenCalled();
      });

      it("should allow iteration over iterable avars with Q.ply", function(){
        var vals, avars, afterVals, i, doubleIt;
        vals = [[1,2,3,4], {a:1,b:2,c:3,d:4}];
        afterVals = [[2,4,6,8], {a:2,b:4,c:6,d:8}];
        avars = getAvars(vals);
        doubleIt = function (k,v) { this.val *= 2; };
        for ( i in vals ){
          if ( vals.hasOwnProperty(i) === false ) continue;
          avars[i].onready = Q.ply(doubleIt);
          avars[i].onready = function (evt) {
            expect(this.val).toEqual(afterVals[i]);
            evt.exit();
          }
        }
      });

    });

  });

}());
