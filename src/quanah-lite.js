//- JavaScript source code

//- quanah-lite.js ~~
//
//  This version restricts the 10% of Quanah that receives 90% of complaints,
//  namely, "Method Q".
//
//                                                      ~~ (c) SRW, 25 May 2013
//                                                  ~~ last updated 25 May 2013

(function (global) {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80 */

    /*properties
        apply, avar, def, hasOwnProperty, prototype, QUANAH, sync, toJSON,
        toString, val, valueOf
    */

 // Prerequisites

    if (global.hasOwnProperty('QUANAH')) {
     // Exit early if Quanah is already available in the global environment.
        return;
    }

 // Declarations

    var AVar, avar, def, sync;

 // Definitions

    AVar = function AVar() {
     // This function needs documentation.
        var that;
        that = this;
        // ...
        return that;
    };

    avar = function (obj) {
     // This function enables the user to avoid the `new` keyword, which is
     // useful because OOP in JS is not typically well-understood by users.
        return new AVar(obj);
    };

    def = function () {
     // This function needs documentation.
        // ...
        return;
    };

    sync = function () {
     // This function needs documentation.
        var y = avar();
        // ...
        return y;
    };

 // Prototype definitions

    AVar.prototype.toString = function () {
     // This function delegates to the avar's `val` property if possible. The
     // code here differs from the code for `AVar.prototype.valueOf` because it
     // assumes that the returned value should have a particular type (string).
     // My reasoning here is that, if the returned value were not a string, the
     // JS engine will coerce it to a string; for the `null` and `undefined`
     // cases, we can circumvent that coercion and thereby improve performance.
        if (this.val === null) {
            return 'null';
        }
        if (this.val === undefined) {
            return 'undefined';
        }
        return this.val.toString.apply(this.val, arguments);
    };

    AVar.prototype.valueOf = function () {
     // This function delegates to the avar's `val` property. It would be easy
     // simply to return the value of the avar's `val` and let the JS engine
     // decide what to do with it, but that approach assumes that no value's
     // `valueOf` method ever uses input arguments. That assumption could be
     // supported by a careful reading of the ES5.1 standard (June 2011), but
     // the priority here is correctness -- not performance -- and therefore
     // this method has been designed for generic use.
        if ((this.val === null) || (this.val === undefined)) {
            return this.val;
        }
        return this.val.valueOf.apply(this.val, arguments);
    };

 // Out-of-scope definitions

    global.QUANAH = {
        avar:   avar,
        def:    def,
        sync:   sync
    };

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (that) {
    'use strict';

 // This strict anonymous closure encapsulates the logic for detecting which
 // object in the environment should be treated as _the_ global object. It's
 // not as easy as you may think -- strict mode disables the `call` method's
 // default behavior of replacing `null` with the global object. Luckily, we
 // can work around that by passing a reference to the enclosing scope as an
 // argument at the same time and testing to see if strict mode has done its
 // deed. This task is not hard in the usual browser context because we know
 // that the global object is `window`, but CommonJS implementations such as
 // RingoJS confound the issue by modifying the scope chain, running scripts
 // in sandboxed contexts, and using identifiers like `global` carelessly ...

    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    /*properties global */

    if (this === null) {

     // Strict mode has captured us, but we already passed a reference :-)

        return (typeof global === 'object') ? global : that;

    }

 // Strict mode isn't supported in this environment, but we need to make sure
 // we don't get fooled by Rhino's `global` function.

    return (typeof this.global === 'object') ? this.global : this;

}, null, this)));

//- vim:set syntax=javascript:
