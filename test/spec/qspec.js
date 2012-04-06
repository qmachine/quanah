//- JavaScript source code

//- qspec.js ~~
//
//  Jasmine (http://pivotal.github.com/jasmine/) BDD Specs for Quanah, written
//  in an effort to:
//    * Provide a degree of documentation
//    * Learn the damn thing
//    * Provide a way to catch changes made in Quanah's API
//
//  The actually interesting, expressive of Quanah's use code takes place in
//  the describe(...) blocks; everything prior is just helpers.
//
//                                                      ~~ (c) DER, 6 Apr 2012

(function(){
  "use strict";
  var getAvars, toType;

  // Pragmas for JSHint
  /*globals describe:false it:false beforeEach:false expect:false Q:false*/

  // Utility Additions and functions
  getAvars = function getAvars(){
    // Returns an array with each of the arguments as the val of an avar
    var avars = [], arg, args, i;
    if ( toType(arguments[0]) === "array" ) args = arguments[0];
    else args = arguments;
    for ( i in args) {
      if ( args.hasOwnProperty(i) === false ) continue;
      arg = args[i];
      avars.push( Q.avar({ val:arg }) );
    }
    return avars;
  };

  toType = function toType(obj) {
        return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
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
        avar : 'function'
      };
      for ( thing in api ){
        if (api.hasOwnProperty(thing)){
          expect(typeof Q[thing]).toBe(api[thing]);
        }
      }
    });

  });

  describe("Quanah Avars", function(){

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

    it("should be retrievable as JSON", function(){
      var x, spec;
      spec = { key : "a", val : "12345"};
      x = Q.avar(spec);
      expect(x.toJSON()).toEqual(spec);
    });

    it("should allow the value to be retrieved as a string", function(){
      var avars, vals, i;
      vals = [1234, "1234", [1,2,3,4], {a:1, b:2}];
      avars = getAvars(vals);
      for ( i in vals ){
        if ( vals.hasOwnProperty(i) === false ) continue;
        expect(avars[i].toString()).toEqual(vals[i].toString());
      }
    });

    it("should allow the value to be retrieved", function(){
      var avars, vals, i;
      vals = [1234, "1234", [1,2,3,4], {a:1, b:2}];
      avars = getAvars(vals);
      for ( i in vals ){
        if ( vals.hasOwnProperty(i) === false ) continue;
        expect(avars[i].valueOf()).toEqual(vals[i]);
      }
    });

    it("should allow computations to be run with Avar.onready", function(){
      var x = Q.avar({ val:0 });
      x.onready = function (evt) {
        this.val += 1;
        evt.exit();
      };
      expect(x.val).toEqual(1);
    });

    it("should apply Avar.onready's sequentially", function(){
      var x = Q.avar();
      x.onready = function (evt) {
        this.val = "dogs";
        evt.exit();
      };
      x.onready = function (evt) {
        expect(this.val).toEqual("dogs");
        evt.exit();
      };
      x.onready = function (evt) {
        this.val = "cats";
        evt.exit();
      };
      x.onready = function (evt) {
        expect(this.val).toEqual("cats");
        evt.exit();
      };
    });

    it("should ", function(){
    });

  });

}());
