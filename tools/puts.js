//- JavaScript source code

//- puts.js ~~
//                                                      ~~ (c) SRW, 17 Nov 2012
//                                                  ~~ last updated 05 Oct 2013

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

    /*properties alert, apply, call, console, hasOwnProperty, join, log,
        postMessage, print, println, prototype, puts, stdout, system
    */

 // Out-of-scope definitions

    global.puts = function () {
     // This function is my own self-contained output logging utility.
        var hOP, isFunction, join;
        hOP = function (obj, name) {
         // This function simply abbreviates the `hasOwnProperty` method
         // lookup. To perform the check correctly, you have to check if `obj`
         // would even have the method `hasOwnProperty`, and full rigor gets
         // old really fast.
            return ((obj !== null)      &&
                    (obj !== undefined) &&
                    (obj.hasOwnProperty(name)));
        };
        isFunction = function (f) {
         // This function returns `true` if and only if input argument `f` is a
         // function. The second condition is necessary to avoid a false
         // positive in a pre-ES5 environment when `f` is a regular expression.
            return ((typeof f === 'function') && (f instanceof Function));
        };
        join = Array.prototype.join;
        if (hOP(global, 'system') && isFunction(global.system.print)) {
            global.puts = function () {
             // This function is typically used by Narwhal and RingoJS. Since
             // Narwhal can be powered by any conforming engine, I should warn
             // you that I've only tested it on JSC and Rhino engines.
                global.system.print(join.call(arguments, ' '));
                return;
            };
        } else if (hOP(global, 'system') && isFunction(global.system.stdout)) {
            global.puts = function () {
             // This function is typically used by v8cgi. Its support here is
             // experimental; see http://code.google.com/p/v8cgi/ for info.
                global.system.stdout(join.call(arguments, ' ') + '\n');
                return;
            };
        } else if (hOP(global, 'console') && isFunction(global.console.log)) {
            global.puts = function () {
             // This function is typically used by Node.js and by modern web
             // browsers that have a developer's console.
                global.console.log(join.call(arguments, ' '));
                return;
            };
        } else if (isFunction(global.alert)) {
            global.puts = function () {
             // This function is a fallback definition used by "crusty old web
             // browsers" that lack a developer's console. Falling back to the
             // 'alert' function is possibly the most obnoxious thing I could
             // have done, but I'll try and find some other alternatives soon.
                global.alert(join.call(arguments, ' '));
                return;
            };
        } else if (hOP(global, 'println') && isFunction(global.println)) {
            global.puts = function () {
             // This function is typically used by 'jrunscript', which is a
             // JS environment that comes bundled with Java itself.
                global.println(join.call(arguments, ' '));
                return;
            };
        } else if (hOP(global, 'print') && isFunction(global.print)) {
            global.puts = function () {
             // This function is typically used by server-side developers'
             // shells like JavaScriptCore, Rhino, Spidermonkey, and V8. A
             // few variations include 'couchjs', 'd8', and 'mongo'.
                global.print(join.call(arguments, ' '));
                return;
            };
        } else if (isFunction(global.postMessage)) {
            global.puts = function () {
             // This function is typically used by a Web Worker, but it isn't
             // a standalone definition. It must be tied through in the main
             // browser context to some 'bee.onmessage' handler ...
                global.postMessage(join.call(arguments, ' '));
                return;
            };
        } else {
         // This is the place where only the naughtiest of implementations
         // will land. Unfortunately, Adobe/Mozilla Tamarin is one of them.
            global.puts = function () {
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
                throw new Error('The `puts` definition fell through.');
            };
        }
        global.puts.apply(this, arguments);
        return;
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
    /*global global: false */
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
