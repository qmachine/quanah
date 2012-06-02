//- JavaScript source code

//- chubby-checker.js ~~
//
//  This program provides a very simple mechanism for running some of my old
//  tests. I will only continue development on this sort of tool if Jasmine
//  et al. cannot be run conveniently as part of the current workflow.
//
//                                                      ~~ (c) SRW, 02 Jun 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

 // Prerequisites

    if (global.hasOwnProperty('CHUBBY')) {
     // Exit early if the `CHUBBY` checker is already defined.
        return;
    }

 // Declarations

    var puts;

 // Definitions

    puts = function () {
     // This function is my own self-contained output logging utility.
        var hOP, isFunction, join;
        hOP = function (obj, name) {
         // See "hOP.js" for more information.
            return ((obj !== null)      &&
                    (obj !== undefined) &&
                    (obj.hasOwnProperty(name)));
        };
        isFunction = function (f) {
         // See "isFunction.js" for more information.
            return ((typeof f === 'function') && (f instanceof Function));
        };
        join = Array.prototype.join;
        if (hOP(global, 'system') && isFunction(global.system.print)) {
            puts = function () {
             // This function is typically used by Narwhal and RingoJS. Since
             // Narwhal can be powered by any conforming engine, I should warn
             // you that I've only tested it on JSC and Rhino engines.
                global.system.print(join.call(arguments, ' '));
                return;
            };
        } else if (hOP(global, 'console') && isFunction(global.console.log)) {
            puts = function () {
             // This function is typically used by Node.js and by modern web
             // browsers that have a developer's console.
                global.console.log(join.call(arguments, ' '));
                return;
            };
        } else if (isFunction(global.alert)) {
            puts = function () {
             // This function is a fallback definition used by "crusty old web
             // browsers" that lack a developer's console. Falling back to the
             // 'alert' function is possibly the most obnoxious thing I could
             // have done, but I'll try and find some other alternatives soon.
                global.alert(join.call(arguments, ' '));
                return;
            };
        } else if (hOP(global, 'print') && isFunction(global.print)) {
         // JavaScriptCore, Rhino, Spidermonkey (==> 'couchjs' also), D8/V8
            puts = function () {
             // This function is typically used by server-side developers'
             // shells like JavaScriptCore, Rhino, Spidermonkey, and V8. A
             // few variations include 'couchjs', 'd8', and 'mongo'.
                global.print(join.call(arguments, ' '));
                return;
            };
        } else if (isFunction(global.postMessage)) {
            puts = function () {
             // This function is typically used by a Web Worker, but it isn't
             // a standalone definition. It must be tied through in the main
             // browser context to some 'bee.onmessage' handler ...
                global.postMessage(join.call(arguments, ' '));
                return;
            };
        } else {
         // This is the place where only the naughtiest of implementations
         // will land. Unfortunately, Adobe/Mozilla Tamarin is one of them.
            puts = function () {
             // This function definition is a last resort, trust me. Only the
             // naughtiest of implementations will land here. Unfortunately,
             // Adobe/Mozilla Tamarin is one of them. Although it's mainly an
             // ActionScript engine at the moment, major ECMAScript upgrades
             // are planned to roll out here later in the year ...
                /*global print: false */
                if (isFunction(print)) {
                    print(join.call(arguments, ' '));
                    return;
                }
                throw new Error('The "puts" definition fell through.');
            };
        }
        puts.apply(this, arguments);
        return;
    };

 // Out-of-scope definitions and invocations

    puts('Loading CHUBBY ...');

    global.CHUBBY = function (f) {
     // This function needs documentation.
        f.call(global, {
            puts: puts
        });
        return;
    };

 // That's all, folks!

    return;

}(Function.prototype.call.call(function (that) {
    'use strict';
 // See the bottom of "quanah.js" for documentation.
    /*jslint indent: 4, maxlen: 80 */
    /*global global: true */
    if (this === null) {
        return (typeof global === 'object') ? global : that;
    }
    return (typeof this.global === 'object') ? this.global : this;
}, null, this)));

//- vim:set syntax=javascript:
