//- JavaScript source code

//- qspec.js ~~
//
//  Jasmine (http://pivotal.github.com/jasmine/) BDD Specs for Quanah, written
//  in an effort to:
//    * Provide a degree of documentation
//    * Learn the damn thing
//    * Provide a way to catch changes made in Quanah's API
//
//                                                      ~~ (c) DER, 6 Apr 2012

(function(){
  "use strict";

  // Pragmas for JSHint
  /*globals describe:false it:false beforeEach:false expect:false Q:false*/

  // Utility Additions
  beforeEach(function(){

    var toType, customMatchers, setMatcherMessage;

    toType = function toType(obj) {
          return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
    };

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

  describe("Quanah", function(){

    it("should be awesome", function(){
      expect(true).toBeTruthy();
    });

  });

}());
