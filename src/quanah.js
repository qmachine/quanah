//- JavaScript source code

//- quanah.js ~~
//
//  Quanah does not support module systems and instead creates a single Object
//  prototype method, `Q`, that it uses as a namespace. The general consensus
//  in the community is that modifying the native prototypes is a Bad Thing,
//  but I have found that Quanah's "Method Q" is actually a beautiful solution
//  for a number of JavaScript's problems with code reuse. It packages methods
//  and properties into a single, globally available object that runs correctly
//  in "modern" JavaScript, and users can test for its existence without any
//  special knowledge about a particular module system's quirks. In the end,
//  the decision to use "Method Q" as a native prototype method is definitely
//  motivated by the syntactic sugar it enables, but the only alternative would
//  be to create a single global variable anyway, and I'd get just as many
//  flames over that strategy ;-)
//
//  To-do list:
//
//  -   annotate for the Closure Compiler as documented here:
//        https://developers.google.com/closure/compiler/docs/js-for-compiler
//  -   remove type-checks in user-unreachable functions where appropriate
//  -   replace `throw` statements with `evt.fail` statements for robustness
//  -   rewrite `onready` assignments as `comm` invocations (optional)
//  -   rewrite `remote_call` in terms of a single avar to be like `volunteer`
//  -   verify correct getter/setter handling in `shallow_copy`
//
//  Open questions:
//
//  -   Can users' own JSLINT pragmas circumvent the `isClosed` function?
//      -   I know that enabling ADsafe in JSLINT can prevent this, but it
//          also seems to restrict too many other [useful] things ...
//
//  -   Is Quanah a kernel?
//      -   If so, is it "re-entrant"? See http://goo.gl/985r.
//
//  -   Should the `serialize` function try to correct the following "mistake"
//      in JSON itself?
//
//          x = [5, 6, 7, 8];
//          x.hello = 'world';
//          JSON.stringify(x); // --> "[5,6,7,8]"
//
//  Recently solved:
//
//  ->  Q:  Can Quanah return remotely distributed [memoized] functions?
//      A:  Yes, but only for a subset. It is, in fact, possible to construct
//          serializable functions that, after transformations are applied on
//          a remote machine, can no longer be serialized.
//
//              function f(x) {
//                  var cache = {};
//                  f.g = function (x) {
//                      return cache;
//                  };
//                  return f.g(x);
//              }
//
//  ->  Q:  Could Quanah actually support ActionScript?
//      A:  Yes, but probably not without a pretty significant amount of work.
//          I had conjectured it would be easy, since replacing
//              x.onready = f;
//          with
//              x.comm({secret: secret, set_onready: f});
//          is pretty trivial, but I had overlooked the fact that the AVar
//          prototype definitions use ES5 getters and setters, too. I would
//          need to abandon most (if not all) use of getters and setters ...
//
//                                                      ~~ (c) SRW, 15 Jul 2012

(function (global) {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

    /*global JSLINT: false */

    /*properties
        Q, adsafe, anon, apply, areready, atob, avar, bitwise, browser, btoa,
        by, call, cap, charCodeAt, comm, concat, configurable, continue, css,
        debug, defineProperty, devel, done, enumerable, epitaph, eqeq, es5,
        evil, exit, f, fail, forin, fragment, fromCharCode, get, get_onerror,
        get_onready, hasOwnProperty, indexOf, init, jobs, key, length, newcap,
        node, nomen, on, onerror, onready, parse, passfail, plusplus, ply,
        predef, properties, prototype, push, queue, random, read, ready,
        regexp, replace, rhino, safe, secret, set, set_onerror, set_onready,
        shift, slice, sloppy, status, stay, stringify, stupid, sub, test, todo,
        toJSON, toSource, toString, undef, unparam, unshift, val, value,
        valueOf, vars, volunteer, when, white, windows, writable, write, x
    */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q')) {
     // Exit early because the framework is either already present or else
     // would overwrite existing extensions to the Object prototype object.
     // This may throw an error in the future to help remind other people
     // not to squat on this particular "namespace" ;-)
        return;
    }

    if (Object.hasOwnProperty('defineProperty') === false) {
     //
     // Why should I require platform support for getters and setters?
     // Some compelling arguments can be found here: http://goo.gl/e9rhh.
     // In the future, I may rewrite Quanah without getters and setters
     // to increase performance, but for now, it's probably a better idea
     // for you just to update your platform -- especially if you want to
     // use Quanah to distribute your computations for you. Because each
     // avar has a `comm` method that must be "hidden" (non-enumerable) or
     // else the avar cannot be serialized, your programs will always be
     // run serially unless you use a reasonably modern platform!
     //
     // For more information, see the documentation at http://goo.gl/xXHKr.
     //
        throw new Error('Platform lacks support for getters and setters.');
    }

 // Declarations

    var atob, AVar, avar, btoa, comm, deserialize, defineProperty, init,
        isClosed, isFunction, local_call, ply, remote_call, revive, secret,
        serialize, shallow_copy, stack, sys, update_local, update_remote,
        uuid, volunteer, when;

 // Definitions

    atob = function (input) {
     // This function redefines itself during its first invocation.
        if (isFunction(global.atob)) {
            atob = global.atob;
        } else {
            atob = function (input) {
             // This function decodes a string which has been encoded using
             // base64 encoding. It isn't part of JavaScript or any standard,
             // but it is a DOM Level 0 method, and it is extremely useful to
             // have around ;-)
                /*jslint bitwise: true */
                if ((/^[A-z0-9\+\/\=]*$/).test(input) === false) {
                    throw new Error('Invalid base64 characters: ' + input);
                }
                var a, output, ch1, ch2, ch3, en1, en2, en3, en4, i, n;
                n = input.length;
                output = '';
                if (n > 0) {
                    a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg' +
                        'hijklmnopqrstuvwxyz0123456789+/=';
                 // NOTE: This `for` loop may actually require sequentiality
                 // as currently written. I converted it from a `do..while`
                 // implementation, but I will write it as a `map` soon :-)
                    for (i = 0; i < n; i += 4) {
                        en1 = a.indexOf(input[i]);
                        en2 = a.indexOf(input[i + 1]);
                        en3 = a.indexOf(input[i + 2]);
                        en4 = a.indexOf(input[i + 3]);
                        ch1 = ((en1 << 2) | (en2 >> 4));
                        ch2 = (((en2 & 15) << 4) | (en3 >> 2));
                        ch3 = (((en3 & 3) << 6) | en4);
                        output += String.fromCharCode(ch1);
                        if (en3 !== 64) {
                            output += String.fromCharCode(ch2);
                        }
                        if (en4 !== 64) {
                            output += String.fromCharCode(ch3);
                        }
                    }
                }
                return output;
            };
        }
        return atob(input);
    };

    AVar = function AVar(spec) {
     // This function is a constructor for the fundamental building block of
     // Quanah itself -- the AVar "type". An avar has its own mutable `key` and
     // `val` properties as well as an immutable `comm` method for simple
     // message-passing. The idea behind avars is to distill concepts like
     // "futures" and "lazy evaluation" into a simple API that encourages the
     // programmer to specify a sequence of transformations to be applied in
     // order to data. For each avar, such a sequence is stored as a first-in,
     // first-out (FIFO) queue and executed according to messages the avar
     // receives through its `comm` method.
        var state, temp, that;
        state = {
            epitaph:    null,
            onerror:    null,
            queue:      [],
            ready:      true
        };
        that = this;
        defineProperty(that, 'comm', {
            configurable: false,
            enumerable: false,
            writable: false,
            value: function (message) {
             // This function is a "hidden" instance method that forwards the
             // messages it receives to `comm` along with the internal `state`
             // of the avar that received the message. We "hide" this method
             // by making it non-enumerable so that avars can be serialized,
             // but unfortunately this means that JavaScript engines lacking
             // support for ECMAScript 5 metaprogramming will be unable to
             // distribute code for remote execution.
                comm.call(that, state, message);
                return;
            }
        });
        if ((spec === null) || (spec === undefined)) {
            temp = {};
        } else if ((typeof spec === 'string') || (spec instanceof String)) {
            temp = deserialize(spec);
        } else {
            temp = spec;
        }
        shallow_copy(temp, that);
        if (that.hasOwnProperty('key') === false) {
            that.key = uuid();
        }
        if (that.hasOwnProperty('val') === false) {
            that.val = null;
        }
        return that;
    };

    avar = function (spec) {
     // This function enables the user to avoid the `new` keyword, which is
     // useful because OOP in JS is not typically well-understood by users.
        return new AVar(spec);
    };

    btoa = function () {
     // This function redefines itself during its first invocation.
        if (isFunction(global.btoa)) {
            btoa = global.btoa;
        } else {
            btoa = function (input) {
             // This function encodes binary data into a base64 string. It
             // isn't part of JavaScript or any standard, but it _is_ a DOM
             // Level 0 method, and it is extremely useful to have around.
             // Unfortunately, it throws an error in most browsers if you feed
             // it Unicode --> http://goo.gl/3fLFs.
                /*jslint bitwise: true */
                var a, output, ch1, ch2, ch3, en1, en2, en3, en4, i, n;
                n = input.length;
                output = '';
                if (n > 0) {
                    a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefg' +
                        'hijklmnopqrstuvwxyz0123456789+/=';
                 // NOTE: This `for` loop may actually require sequentiality
                 // as currently written. I converted it from a `do..while`
                 // implementation, but I will write it as a `map` soon :-)
                    for (i = 0; i < input.length; i += 3) {
                        ch1 = input.charCodeAt(i);
                        ch2 = input.charCodeAt(i + 1);
                        ch3 = input.charCodeAt(i + 2);
                        en1 = (ch1 >> 2);
                        en2 = (((ch1 & 3) << 4) | (ch2 >> 4));
                        en3 = (((ch2 & 15) << 2) | (ch3 >> 6));
                        en4 = (ch3 & 63);
                        if (isNaN(ch2)) {
                            en3 = en4 = 64;
                        } else if (isNaN(ch3)) {
                            en4 = 64;
                        }
                        output += (a[en1] + a[en2] + a[en3] + a[en4]);
                    }
                }
                return output;
            };
        }
        return btoa.apply(this, arguments);
    };

    comm = function (inside, outside) {
     // This function provides a simple messaging system for avars that uses
     // mutual closure over the `secret` variable to restrict access to each
     // avar's private state. I don't use `ply` inside this function anymore
     // because this function is called so frequently and edited so rarely
     // that the convenience/performance tradeoff now favors performance.
        var args, key, message, special, x;
        special = false;
        x = this;
        if (outside instanceof Object) {
         // First, we need to inspect the object.
            for (key in outside) {
                if (outside.hasOwnProperty(key)) {
                    if ((key === 'secret') && (outside[key] === secret)) {
                        special = true;
                    } else {
                        message = key;
                        args = [].concat(outside[key]);
                    }
                }
            }
        }
        if (special === true) {
            switch (message) {
            case 'done':
             // A computation involving this avar has succeeded, and we will
             // now prepare to run the next computation that depends on it by
             // transferring it into the `revive` queue.
                inside.ready = true;
                if (inside.queue.length > 0) {
                    inside.ready = false;
                    stack.unshift({f: inside.queue.shift(), x: x});
                }
                break;
            case 'fail':
             // A computation involving this avar has failed, and we will now
             // suspend all computations that depend on it indefinitely by
             // overwriting the queue with a fresh one. This is also important
             // because the garbage collector can't free the memory unless we
             // release these references. We will also try to call `onerror`
             // if one has been defined.
                if (inside.epitaph === null) {
                 // We don't want to overwrite the original error by accident,
                 // since that would be an utter nightmare for debugging.
                    inside.epitaph = args;
                }
                inside.queue = [];
                inside.ready = false;
                if (isFunction(inside.onerror)) {
                    inside.onerror.apply(x, inside.epitaph);
                }
                break;
            case 'get_onerror':
             // A computation requests to inspect the `onerror` handler's
             // current value, but rather than return it as the result of the
             // `comm` invocation itself, we will pass it by reference.
                args[0].onerror = inside.onerror;
                break;
            case 'get_onready':
             // A computation requests to inspect the `onready` handler's
             // current value, but rather than return it as the result of the
             // `comm` invocation itself, we will pass it by reference.
                args[0].onready = inside.queue[0];
                break;
            case 'set_onerror':
             // A computation has defined an `onerror` handler for this avar,
             // but we need to make sure that it hasn't already failed in some
             // previous computation. If the avar has already failed, we will
             // store the handler and also fire it immediately.
                inside.onerror = args[0];
                if (inside.epitaph !== null) {
                    x.comm({fail: inside.epitaph, secret: secret});
                }
                break;
            case 'set_onready':
             // A computation has defined an `onready` handler for this avar,
             // and to avoid overwriting the current handler, we will push it
             // onto the avar's individual queue and re-trigger execution. I
             // used to send a `done` message recursively if appropriate, but
             // that strategy requires a _lot_ of overhead and is only one
             // line shorter than re-triggering execution directly.
                if (isFunction(args[0])) {
                    inside.queue.push(args[0]);
                    if (inside.ready === true) {
                        inside.ready = false;
                        stack.unshift({f: inside.queue.shift(), x: x});
                    }
                } else if (args[0] instanceof AVar) {
                    when(args[0], x).areready = function (evt) {
                     // This function allows Quanah to postpone execution of
                     // the given task until both `f` and `x` are ready.
                        var f, x;
                        f = this.val[0].val;
                        x = this.val[1];
                        f.call(x, evt);
                        return;
                    };
                } else {
                    x.comm({
                        fail: 'Assigned value must be a function',
                        secret: secret
                    });
                }
                break;
            case 'stay':
             // A computation that depends on this avar has been postponed,
             // but that computation will be put back into the stack directly
             // by `local_call`. Thus, nothing actually needs to happen here;
             // we just need to wait. For consistency with `exit` and `fail`,
             // I allow `stay` to take a message argument, but right now it
             // doesn't actually do anything. In the future, however, I may
             // enable a verbose mode for debugging that outputs the message.
                break;
            default:
             // When this arm is chosen, an error must exist in Quanah itself.
             // In such a case, we may try to rely on user-submitted reports,
             // but right now we just hope we can capture the error ...
                x.comm({
                    fail: 'Invalid `comm` message "' + message + '"',
                    secret: secret
                });
            }
        }
     // NOTE: Is it a good idea to invoke `revive` every time? It does shorten
     // my code a little, of course, but the rationale here is that it helps
     // prevent a situation in which the progression through a non-empty queue
     // halts because no events remain to trigger execution. Another advantage
     // is that I can externally trigger a `revive` by invoking `x.comm()`.
        return revive();
    };

    defineProperty = Object.defineProperty;

    deserialize = function ($x) {
     // This function is a JSON-based deserialization utility that can invert
     // the `serialize` function provided herein. Unfortunately, no `fromJSON`
     // equivalent exists for obvious reasons -- it would have to be a String
     // prototype method, and it would have to be extensible for all types.
     // NOTE: This definition could stand to be optimized, but I recommend
     // leaving it as-is until improving performance is absolutely critical.
        /*jslint unparam: true */
        return JSON.parse($x, function (key, val) {
         // This function is provided to `JSON.parse` as the optional second
         // parameter that its documentation refers to as a `revive` function.
         // NOTE: This is not the same kind of function as Quanah's `revive`!
            var f, pattern;
            pattern = /^\[FUNCTION ([A-z0-9\+\/\=]+) ([A-z0-9\+\/\=]+)\]$/;
            if ((typeof val === 'string') || (val instanceof String)) {
                if (pattern.test(val)) {
                    val.replace(pattern, function ($0, code, props) {
                     // This function is provided to the String prototype's
                     // `replace` method and uses references to the enclosing
                     // scope to return results. I wrote things this way in
                     // order to avoid changing the type of `val` and thereby
                     // confusing the JIT compilers, but I'm not certain that
                     // using nested closures is any faster anyway. For that
                     // matter, calling the regular expression twice may be
                     // slower than calling it once and processing its output
                     // conditionally, and that way might be clearer, too ...
                        /*jslint evil: true */
                        f = ((new Function('return ' + atob(code)))());
                        shallow_copy(deserialize(atob(props)), f);
                        return;
                    });
                }
            }
            return (f !== undefined) ? f : val;
        });
    };

    init = function (obj) {
     // This function enables the user to redefine "internal" functions from
     // outside the giant anonymous closure. In particular, this allows users
     // to port Quanah for use with any persistent storage system by simply
     // implementing specific routines and providing them to Quanah by way of
     // this `init` function.
        ply(obj).by(function (key, val) {
         // This function traverses the input object in search of definitions,
         // but it will only store a definition as a method of the internal
         // `sys` object once per key. If an external definition has already
         // been assigned internally, it cannot be redefined. The policy here
         // is for simplicity, but it does add a small measure of security.
         // Because order isn't important here, the use of `ply` is justified.
            if ((sys[key] === null) && (isFunction(val))) {
                sys[key] = val;
            }
            return;
        });
        return revive();
    };

    isClosed = function (x) {
     // This function tests an input argument `x` for references that "close"
     // over external references from another scope. This function solves a
     // very important problem in JavaScript because function serialization is
     // extremely difficult to perform rigorously. Most programmers consider a
     // function only as its source code representation, but because it is also
     // a closure and JavaScript has lexical scope, the exact "place" in the
     // code where the code existed is important, too. A third consideration is
     // that a function is also an object which can have methods and properties
     // of its own, and these need to be included in the serializated form. I
     // puzzled over this problem and eventually concluded that because I may
     // not be able to serialize an entire scope (I haven't solved that yet), I
     // _can_ get the source code representation of a function from within most
     // JavaScript implementations even though it isn't part of the ECMAScript
     // standard (June 2011). Thus, if a static analysis tool were able to
     // parse the source code representation to confirm that the function did
     // not depend on its scope, then I might be able to serialize it, provided
     // that it did not contain any methods that depended on their scopes. Of
     // course, writing such a tool is a huge undertaking, so instead I just
     // used a fantastic program by Douglas Crockford, JSLINT, which contains
     // an expertly-written parser with configurable parameters. A bonus here
     // is that JSLINT allows me to avoid a number of other unsavory problems,
     // such as functions that log messages to a console -- such functions may
     // or may not be serializable, but their executions should definitely
     // occur on the same machines that invoked them! Anyway, this function is
     // only one solution to the serialization problem, and I welcome feedback
     // from others who may have battled the same problems :-)
        /*jslint unparam: true */
        var $f, flag, left, right;
        flag = false;
        left = '(function () {\nreturn ';
        right = ';\n}());';
        if (x instanceof Object) {
            if (isFunction(x)) {
                if (isFunction(x.toJSON)) {
                    $f = x.toJSON();
                } else if (isFunction(x.toSource)) {
                    $f = x.toSource();
                } else if (isFunction(x.toString)) {
                    $f = x.toString();
                } else {
                 // If we fall this far, we're probably in trouble anyway, but
                 // we aren't out of options yet. We could try to coerce to a
                 // string by adding an empty string or calling the String
                 // constructor without the `new` keyword, but I'm not sure if
                 // either would cause Quanah itself to fail JSLINT. Of course,
                 // we can always just play it safe and return `true` early to
                 // induce local execution of the function -- let's do that!
                    return true;
                }
             // By this point, `$f` must be defined, and it must be a string
             // or else the next line will fail when we try to remove leading
             // and trailing parentheses in order to appease JSLINT.
                $f = left + $f.replace(/^[(]|[)]$/g, '') + right;
             // Now, we send our function's serialized form `$f` into JSLINT
             // for analysis, taking care to disable all options that are not
             // directly relevant to determining if the function is suitable
             // for running in some remote JavaScript environment. If JSLINT
             // returns `false` because the scan fails for some reason, the
             // answer to our question would be `true`, which is why we have
             // to negate JSLINT's output.
                flag = (false === JSLINT($f, {
                 // JSLINT configuration options, as of version 2012-07-13:
                    adsafe:     false,  //- enforce ADsafe rules?
                    anon:       true,   //- allow `function()`?
                    bitwise:    true,   //- allow use of bitwise operators?
                    browser:    false,  //- assume browser as JS environment?
                    cap:        true,   //- allow uppercase HTML?
                    //confusion:true,   //- allow inconsistent type usage?
                    'continue': true,   //- allow continuation statement?
                    css:        true,   //- allow CSS workarounds?
                    debug:      false,  //- allow debugger statements?
                    devel:      false,  //- allow output logging?
                    eqeq:       true,   //- allow `==` instead of `===`?
                    es5:        true,   //- allow ECMAScript 5 syntax?
                    evil:       false,  //- allow the `eval` statement?
                    forin:      true,   //- allow unfiltered `for..in`?
                    fragment:   true,   //- allow HTML fragments?
                    //indent:   4,
                    //maxerr:   1,
                    //maxlen:   80,
                    newcap:     true,   //- constructors must be capitalized?
                    node:       false,  //- assume Node.js as JS environment?
                    nomen:      true,   //- allow names' dangling underscores?
                    on:         false,  //- allow HTML event handlers
                    passfail:   true,   //- halt the scan on the first error?
                    plusplus:   true,   //- allow `++` and `--` usage?
                    predef:     {},     //- predefined global variables
                    properties: false,  //- require JSLINT /*properties */?
                    regexp:     true,   //- allow `.` in regexp literals?
                    rhino:      false,  //- assume Rhino as JS environment?
                    safe:       false,  //- enforce safe subset of ADsafe?
                    sloppy:     true,   //- ES5 strict mode pragma is optional?
                    stupid:     true,   //- allow `*Sync` calls in Node.js?
                    sub:        true,   //- allow all forms of subset notation?
                    todo:       true,   //- allow comments that start with TODO
                    undef:      false,  //- allow out-of-order definitions?
                    unparam:    true,   //- allow unused parameters?
                    vars:       true,   //- allow multiple `var` statements?
                    white:      true,   //- allow sloppy whitespace?
                    //widget:   false,//- assume Yahoo widget JS environment?
                    windows:    false   //- assume Windows OS?
                }));
            }
            ply(x).by(function (key, val) {
             // This function examines all methods and properties of `x`
             // recursively to make sure none of those are closed, either.
             // Because order isn't important, use of `ply` is justified.
                if (flag === false) {
                    flag = isClosed(val);
                }
                return;
            });
        }
        return flag;
    };

    isFunction = function (f) {
     // This function returns `true` only if and only if the input argument
     // `f` is a function. The second condition is necessary to avoid a false
     // positive when `f` is a regular expression. Please note that an avar
     // whose `val` property is a function will still return `false`.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    local_call = function (obj) {
     // This function applies the transformation `f` to `x` for method `f` and
     // property `x` of the input object `obj` by calling `f` with `evt` as an
     // input argument and `x` as the `this` value. The advantage of performing
     // transformations this way versus computing `f(x)` directly is that it
     // allows the user to indicate the program's logic explicitly even when
     // the program's control is difficult or impossible to predict, as is
     // commonly the case in JavaScript when working with callback functions.
        var evt;
        try {
            evt = {
             // This is the `evt` object, an object literal with methods that
             // send messages to `obj.x` for execution control. Methods can
             // be replaced by the user from within the calling function `f`
             // without affecting the execution of computations :-)
                exit: function (message) {
                 // This function indicates successful completion.
                    return obj.x.comm({done: message, secret: secret});
                },
                fail: function (message) {
                 // This function indicates a failure, and it is intended to
                 // replace the `throw new Error(...)` idiom, primarily because
                 // capturing errors that are thrown during remote execution
                 // are very difficult to capture and return to the invoking
                 // contexts otherwise. Although `local_call` is named "local"
                 // to indicate that the invocation and execution occur on the
                 // same machine, the `volunteer` function actually imports
                 // tasks from other machines before invoking and executing
                 // them; therefore, the "original invocation" may have come
                 // from a "remote" machine, with respect to execution. Thus,
                 // Quanah encourages users to replace `throw` with `fail` in
                 // their programs to solve the remote error capture problem.
                    return obj.x.comm({fail: message, secret: secret});
                },
                stay: function (message) {
                 // This function allows a user to postpone execution, and it
                 // is particularly useful for delaying execution until some
                 // condition is met -- it can be used to write non-blocking
                 // `while` and `until` constructs, for example. Since the
                 // ECMAScript standard lacks anything resembling a package
                 // manager, the `stay` method also comes in handy for delaying
                 // execution until an external library has loaded. Of course,
                 // if you delay the execution, when will it run again? The
                 // short answer is unsatisfying: you can never _know_. For a
                 // longer answer, you'll have to wait for my upcoming papers
                 // that explain why leaving execution guarantees to chance is
                 // perfectly acceptable when the probability approachs 1 :-)
                 //
                 // NOTE: Don't push back onto the stack until _after_ you send
                 // the `stay` message. Invoking `comm` also invokes `revive`,
                 // which consequently exhausts the recursion stack depth limit
                 // immediately if there's only one task to be run.
                    obj.x.comm({stay: message, secret: secret});
                    stack.push(obj);
                    return;
                }
            };
         // After all the setup, the actual invocation is anticlimactic ;-)
            obj.f.call(obj.x, evt);
        } catch (err) {
         // In early versions of Quanah, `stay` threw a special Error type as
         // a crude form of message passing, but because it no longer throws
         // errors, we can assume that all caught errors are failures. Because
         // the user may have chosen to replace the `evt.fail` method with a
         // personal routine, I have deliberately reused that reference here,
         // to honor the user's wishes.
            evt.fail(err);
        }
        return;
    };

    ply = function (f) {
     // This function takes advantage of JavaScript's lack of a type system in
     // order to provide a single functional iterator for either synchronous
     // (blocking) or asynchronous (non-blocking) use cases. Both cases use
     // distinct English-inspired idioms to express their operations without
     // requiring configuration flags or type inferences like most libraries
     // would do. Natural languages often rely heavily on context, but they
     // rarely, if ever, require preprocessing or configuration files full of
     // Booleans -- why, then, should a programming language do so? Here, the
     // idioms motivated by `ply` let JavaScript skip the elaborate inferences
     // by taking advantage of the language's _lack_ of a type system, and the
     // resulting code is more concise, expressive, and performant :-)
        var args, y;
        args = Array.prototype.slice.call(arguments);
        y = function (evt) {
         // This function acts as the "asynchronous definition" for the `ply`
         // function, and it will only be invoked if it is assigned to the
         // `onready` handler of an avar; otherwise, it simply takes the place
         // of the object literal that would normally be used to enable `by`.
         // If this definition is invoked, then `f` must have been a function,
         // and if it isn't, Quanah's `evt.fail` function will be invoked :-)
         //
         // NOTE: Any time that we know `this` is an avar, we are justified in
         // accessing the `val` property directly; otherwise, I recommend that
         // you use `valueOf()` instead so that generic programming with arrays
         // and objects will still work correctly.
            if ((this.hasOwnProperty('isready')) ||
                    (this.hasOwnProperty('areready'))) {
             // The avar to which we assigned this function must have been
             // created by the `when` function, which means that its `val`
             // property is an array of avars designed to be used with the
             // Function prototype's `apply` method :-)
                ply.apply(this, this.val).by(f);
            } else {
                ply(this.val).by(f);
            }
            return evt.exit();
        };
        y.by = function (f) {
         // This function is a general-purpose iterator for key-value pairs,
         // and it works exceptionally well in JavaScript because hash-like
         // objects are so common in this language. This definition itself is
         // a little slower than previous versions because they were optimized
         // for internal use. In performance-critical sections of Quanah that
         // run often but rarely change, I have inlined loops as appropriate.
         // It is difficult to optimize code for use with modern JIT compilers,
         // and my own recommendation is to hand-optimize with loops only if
         // you're truly obsessed with performance -- it's a lot of work, and
         // the auto-detecting and delegating dynamically in order to use the
         // fastest possible loop pattern adds overhead that can be difficult
         // to optimize for use in real-world applications. That said, if you
         // have ideas for how to make `ply` run more efficiently, by all means
         // drop me a line! :-)
            if (isFunction(f) === false) {
                throw new TypeError('`ply..by` expects a function.');
            }
            var i, key, obj, n, toc, x;
            n = args.length;
            toc = {};
            x = [];
            for (i = 0; i < n; i += 1) {
                if ((args[i] !== null) && (args[i] !== undefined)) {
                    obj = args[i].valueOf();
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            if (toc.hasOwnProperty(key) === false) {
                                toc[key] = x.push([key]) - 1;
                            }
                            x[toc[key]][i + 1] = obj[key];
                        }
                    }
                }
            }
            n = x.length;
            for (i = 0; i < n; i += 1) {
                f.apply(this, x[i]);
            }
            return;
        };
        return y;
    };

    remote_call = function (obj) {
     // This function distributes computations to remote execution nodes by
     // constructing a task that represents the computation, writing it to a
     // shared storage, polling for changes to its status, and then reading
     // the new values back into the local variables. My strategy is to use
     // a bunch of temporary avars that only execute locally -- on this part
     // I must be very careful, because remote calls should be able to make
     // remote calls of their own, but execution of a remote call should not
     // require remote calls of its own! A publication is forthcoming, and at
     // that point I'll simply use a self-citation as an explanation :-)
        var f, first, x;
     // Step 1: copy the computation's function and data into fresh instances,
     // define some error handlers, and write the copies to the "filesystem".
        f = avar({val: obj.f});
        first = true;
        x = avar(obj.x);
        f.onerror = x.onerror = function (message) {
         // This function tells the original `x` that something has gone awry.
            if (first === true) {
                first = false;
                obj.x.comm({fail: message, secret: secret});
            }
            return;
        };
        f.onready = x.onready = update_remote;
     // Step 2: Use a `when` statement to represent the remote computation and
     // track its execution status on whatever system is using Quanah.
        when(f, x).areready = function (evt) {
         // This function creates a `task` object to represent the computation
         // and monitors its status by "polling" the "filesystem" for changes.
            var task;
            task = avar({status: 'waiting', val: {f: f.key, x: x.key}});
            task.onerror = function (message) {
             // This function alerts `f` and `x` that something has gone awry.
                return evt.fail(message);
            };
            task.onready = update_remote;
            task.onready = function (evt) {
             // This function polls for changes in the `status` property using
             // a variation on the `update_local` function as a non-blocking
             // `while` loop -- hooray for disposable avars!
                var temp = sys.read(task);
                temp.onerror = function (message) {
                 // This alerts `task` that something has gone awry.
                    return evt.fail(message);
                };
                temp.onready = function (temp_evt) {
                 // This function analyzes the results of the `read` operation
                 // to determine if the `task` computation is ready to proceed.
                    switch (temp.status) {
                    case 'done':
                        task.val = temp.val;
                        evt.exit();
                        break;
                    case 'failed':
                        evt.fail(temp.val.epitaph);
                        break;
                    default:
                        evt.stay('Waiting for results ...');
                    }
                    return temp_evt.exit();
                };
                return;
            };
            task.onready = function (task_evt) {
             // This function ends the enclosing `when` statement.
                task_evt.exit();
                return evt.exit();
            };
            return;
        };
     // Step 3: Update the local instances of `f` and `x` by retrieving the
     // remote versions' representations. If possible, these operations will
     // run concurrently.
        f.onready = x.onready = update_local;
     // Step 4: Use a `when` statement to wait for the updates in Step 3 to
     // finish before copying the new values into the original `obj` argument.
        when(f, x).areready = function (evt) {
         // This function copies the new values into the old object. Please
         // note that we cannot simply write `obj.foo = foo` because we would
         // lose the original avar's internal state!
            obj.f = f.val;
            obj.x.val = x.val;
            obj.x.comm({done: [], secret: secret});
            return evt.exit();
        };
        return;
    };

    revive = function () {
     // This function contains the execution center for Quanah. It's pretty
     // simple, really -- it just runs the first available task in its queue
     // (`stack`), and it selects an execution context conditionally. That's
     // all it does. It makes no attempt to run every task in the queue every
     // time it is called, because instead Quanah uses a strategy in which it
     // tries to call `revive` as many times as necessary to process an entire
     // program correctly. For example, every time an avar receives a `comm`
     // message, `revive` will run. Because `revive` only runs a single task
     // from the queue for each invocation, its queue can be shared safely
     // across multiple execution "contexts" simultaneously, and it makes no
     // difference if the separate contexts are due to recursion or to special
     // objects such as Web Workers. The `revive` function selects a context
     // for execution using conditional tests that determine whether a given
     // computation can be distributed to external resources for execution, but
     // it can always fall back to executing on the invoking machine :-)
        var task = stack.shift();
        if (task !== undefined) {
            if (typeof JSON === 'undefined') {
             // We can't serialize the computation anyway.
                local_call(task);
            } else if (typeof JSLINT === 'undefined') {
             // We can't decide if the computation can be serialized.
                local_call(task);
            } else if ((sys.read === null) || (sys.write === null)) {
             // We can't distribute the computation.
                local_call(task);
            } else if (isClosed(task)) {
             // The task isn't serializable.
                local_call(task);
            } else {
             // The task is serializable, and we are able to distribute it :-)
                remote_call(task);
            }
        }
        return;
    };

    secret = {
     // This object requires a _lot_ of explanation! The AVar instance method
     // `comm` restricts messaging by only acting upon messages that include
     // a reference to `secret`; such a strategy implicitly trusts any other
     // function contained within the same closure because JavaScript closures
     // cannot be made to give up their secrets. (See Crockford's "JS:TGP" for
     // a discussion.) Unfortunately, modern browsers' JavaScript development
     // consoles allow users to inspect the values of variables directly, at
     // which point a user might be able to obtain the `secret`, which used to
     // be a number generated by `Math.random`. Notice, however, that I said
     // you can obtain the _value_ of `secret`; objects pass by reference in
     // JS. Thus, if `secret` is a number, a user can fake holding a reference
     // to it because numbers pass by value, but if `secret` is an object, a
     // user cannot fake a reference to it simply by knowing its value. There
     // may still be ways to obtain a reference to `secret` using breakpoints
     // in the debugger, but ultimately there isn't any reason to _try_ to get
     // a reference, unless users want to lock up their own personal machines
     // or compute incorrect answers. In the latter case, plans for upcoming
     // versions of Quanah include independent verification anyway :-)
    };

    serialize = function (x) {
     // This is a JSON-based serializer that not only understands functions,
     // but also understands that functions are objects with properties! It
     // depends on `btoa`, which unfortunately has issues with UTF-8 strings.
     // I haven't found a test case yet that proves I need to work around the
     // problem, but if I do, I will follow the post at http://goo.gl/cciXV.
        /*jslint unparam: true */
        return JSON.stringify(x, function replacer(key, val) {
            var obj, $val;
            if (isFunction(val)) {
             // If the input argument `x` was actually a function, we have to
             // perform two steps to serialize the function because functions
             // are objects in JavaScript. The first step is to consider the
             // function as only its "action", represented as the source code
             // of the original function. The second step is to consider the
             // function as only an object with its own methods and properties
             // that must be preserved as source code also. (We can assume that
             // scope need not be preserved because `serialize` is only called
             // when `isClosed` returns `false`.)
                obj = {};
                $val = '[FUNCTION ';
                if (isFunction(val.toJSON)) {
                    $val += btoa(val.toJSON());
                } else if (isFunction(val.toSource)) {
                    $val += btoa(val.toSource());
                } else if (isFunction(val.toString)) {
                    $val += btoa(val.toString());
                } else {
                 // Here, we just hope for the best. This arm shouldn't ever
                 // run, actually, since we've likely already caught problems
                 // that would land here in the `isClosed` function.
                    $val += btoa(val);
                }
                ply(val).by(function f(key, val) {
                 // This function copies methods and properties from the
                 // function stored in `val` onto an object `obj` so they can
                 // be serialized separately from the function itself, but it
                 // only transfers the ones a function wouldn't normally have,
                 // using this function (`f`) itself as a reference. Because
                 // order isn't important, the use of `ply` is justified here.
                    if (f.hasOwnProperty(key) === false) {
                        obj[key] = val;
                    }
                    return;
                });
             // Now, we use recursion to serialize the methods and properties.
                $val += (' ' + btoa(serialize(obj)) + ']');
            }
            return ($val === undefined) ? val : $val;
        });
    };

    shallow_copy = function (x, y) {
     // This function copies the properties of `x` to `y`, specifying `y` as
     // object literal if it was not provided as an input argument. It does
     // not perform a "deep copy", which means that properties whose values
     // are objects will be "copied by reference" rather than by value. Right
     // now, I see no reason to worry about deep copies or getters / setters.
        if (y === undefined) {
         // At one point, I used a test here that `arguments.length === 1`,
         // but it offended JSLint:
         //     "Do not mutate parameter 'y' when using 'arguments'."
            y = {};
        }
        var key;
        for (key in x) {
            if (x.hasOwnProperty(key)) {
                y[key] = x[key];
            }
        }
        return y;
    };

    stack = [];

    sys = {
     // This object contains stubs for methods and properties that can be
     // defined externally using the `Q.init` method. For more information,
     // read the comments in the `init` function's definition.
        jobs:   null,
        read:   null,
        write:  null
    };

    update_local = function (evt) {
     // This function is used in the `remote_call` and `volunteer` functions
     // to update the local copy of an avar so that its `val` property matches
     // the one from its remote representation. It is written as a function of
     // `evt` because it is intended to be assigned to `onready`.
        if (sys.read === null) {
            return evt.stay('Waiting for a `read` definition ...');
        }
        var local, temp;
        local = this;
        temp = sys.read(local);
        temp.onerror = function (message) {
         // This function tells `local` that something has gone awry.
            return evt.fail(message);
        };
        temp.onready = function (temp_evt) {
         // Here, we copy the remote representation into the local one.
            shallow_copy(temp, local);
            temp_evt.exit();
            return evt.exit();
        };
        return;
    };

    update_remote = function (evt) {
     // This function is used in the `remote_call` and `volunteer` functions
     // to update the remote copy of an avar so that its `val` property matches
     // the one from its local representation. It is written as a function of
     // `evt` because it is intended to be assigned to `onready`.
        if (sys.write === null) {
            return evt.stay('Waiting for a `write` definition ...');
        }
        var temp = sys.write(this);
        temp.onerror = function (message) {
         // This tells the local avar (`this`) that something has gone awry.
            return evt.fail(message);
        };
        temp.onready = function (temp_evt) {
         // This function just releases execution for the local avar (`this`).
            temp_evt.exit();
            return evt.exit();
        };
        return;
    };

    uuid = function () {
     // This function generates random hexadecimal UUIDs of length 32. It will
     // not work correctly in ActionScript, but I have written such a function
     // before and will include it again here if ever it is needed.
        var y = '';
        while (y.length < 32) {
            y += Math.random().toString(16).slice(2, 34 - y.length);
        }
        return y;
    };

    volunteer = function () {
     // This function, combined with `remote_call`, provides the remote code
     // execution mechanism in Quanah. When `remote_call` on one machine sends
     // a serialized task to another machine, that other machine runs it with
     // the `volunteer` function. This function outputs the avar representing
     // the task so that the underlying system (not Quanah) can control system
     // resources itself. Examples will be included in the distribution that
     // will accompany the upcoming publication(s).
        var task = avar();
        task.onready = function (evt) {
         // This function retrieves the key of a task from the queue so we
         // can retrieve that task's full description. If no tasks are found,
         // we will simply check back later :-)
            if (sys.jobs === null) {
                return evt.fail('Waiting for a `jobs` definition ...');
            }
            var temp = sys.jobs();
            temp.onerror = function (message) {
             // This function notifies `task` that something has gone wrong
             // during retrieval and interpretation of its description.
                return evt.fail(message);
            };
            temp.onready = function (temp_evt) {
             // This function chooses a task from the queue and runs it. The
             // current form simply chooses the first available, but I could
             // just as easily choose randomly by assigning weights to the
             // elements of the queue.
                if ((temp.val instanceof Array) === false) {
                 // This seems like a common problem that will occur whenever
                 // users begin implementing custom storage mechanisms.
                    return temp_evt.fail('`jobs` should return an array');
                }
                if (temp.val.length === 0) {
                 // Here, we choose to `fail` not because this is a dreadful
                 // occurrence or something, but because this decision allows
                 // us to avoid running subsequent functions whose assumptions
                 // depend precisely on having found a task to run. If we were
                 // instead to `stay` and wait for something to do, it would
                 // be much harder to tune Quanah externally.
                    return temp_evt.fail('Nothing to do ...');
                }
                task.key = temp.val[0];
                temp_evt.exit();
                return evt.exit();
            };
            return;
        };
        task.onready = update_local;
        task.onready = function (evt) {
         // This function changes the `status` property of the local `task`
         // object we just synced from remote; the next step, obviously, is
         // to sync back to remote so that the abstract task will disappear
         // from the "waiting" queue.
            task.status = 'running';
            return evt.exit();
        };
        task.onready = update_remote;
        task.onready = function (evt) {
         // This function executes the abstract task by recreating `f` and `x`
         // and running them in the local environment. Since we know `task` is
         // serializable, we cannot simply add its deserialized form to the
         // local machine's queue (`stack`), because `revive` would just send
         // it back out for remote execution again. Thus, we deliberately close
         // over local variables like `avar` in order to restrict execution to
         // the current environment. The transform defined in `task.val.f` is
         // still able to distribute its own sub-tasks for remote execution.
            var f, first, x;
            f = avar({key: task.val.f});
            first = true;
            x = avar({key: task.val.x});
            f.onerror = x.onerror = function (message) {
             // This function runs if execution of the abstract task fails.
             // The use of a `first` value prevents this function from running
             // more than once, because aside from annoying the programmer by
             // returning lots of error messages on his or her screen, such a
             // situation can also wreak all kinds of havoc for reentrancy.
                var temp_f, temp_x;
                if (first) {
                    first = false;
                    task.val.epitaph = message;
                    task.status = 'failed';
                    temp_f = avar(f);
                    temp_x = avar(x);
                    temp_f = temp_x = update_remote;
                    when(temp_f, temp_x).areready = function (temp_evt) {
                     // This function runs only when the error messages have
                     // finished syncing to remote storage successfully.
                        temp_evt.exit();
                        return evt.exit();
                    };
                }
                return;
            };
            f.onready = x.onready = update_local;
            when(f, x).areready = function (evt) {
             // This function contains the _actual_ execution. (Boring, huh?)
                f.val.call(x, evt);
                return;
            };
         //
         // Here, I would like to have a function that checks `f` and `x` to
         // using `isClosed` to ensure that the results it returns to the
         // invoking machine are the same as the results it computed, because
         // it _is_ actually possible to write a serializable function which
         // renders itself unserializable during its evaluation. Specifically,
         // if the results are not serializable and we are therefore unable to
         // return an accurate representation of the results, then I want to
         // send a special signal to the invoking machine to let it know that,
         // although no error has occurred, results will not be returned; the
         // invoking machine would then execute the "offending" task itself.
         // I have included a simple outline of such a function:
         //
         //     when(f, x).areready = function (evt) {
         //         if (isClosed(f.val) || isClosed(x.val)) {
         //             return evt.abort('Results will not be returned.');
         //         }
         //         return evt.exit();
         //     };
         //
            f.onready = x.onready = update_remote;
            when(f, x).areready = function (temp_evt) {
             // This function only executes when the task has successfully
             // executed and the transformed values of `f` and `x` are synced
             // back to remote storage. Thus, we are now free to send the
             // signal for successful completion to the invoking machine by
             // updating the `status` property locally and syncing to remote.
                task.status = 'done';
                temp_evt.exit();
                return evt.exit();
            };
            return;
        };
        task.onready = update_remote;
        return task;
    };

    when = function () {
     // This function takes any number of arguments, any number of which may
     // be avars, and outputs a special "compound" avar whose `val` property is
     // an array of the original input arguments. The compound avar also has an
     // extra instance method (either `isready` or `areready`) that forwards
     // its input arguments to the `onready` handler to provide syntactic sugar
     // with a nice interpretation in English. Any functions assigned to the
     // `onready` handler will wait for all input arguments' outstanding queues
     // to empty before executing, and exiting will allow each of the inputs
     // to begin working through its individual queue again. Also, a compound
     // avar can still be used as a prerequisite to execution even when the
     // compound avar depends on one of the other prerequisites, and although
     // the immediate usefulness of this ability may not be obvious, it will
     // turn out to be crucially important for expressing certain concurrency
     // patterns idiomatically :-)
        var args, flag, i, stack, temp, x, y;
        args = Array.prototype.slice.call(arguments);
        stack = args.slice();
        x = [];
        y = avar({val: args});
        while (stack.length > 0) {
         // This `while` loop replaces the previous `union` function, which
         // called itself recursively to create an array `x` of unique
         // dependencies from the input arguments `args`. Instead, I am using
         // an array-based stack here with a `while` loop as a means to avoid
         // the treacherous function recursion stack and its unpredictably
         // limited depth, since a user could potentially write fiendishly
         // complicated code that would actually overflow that limit. Anyway,
         // the prerequisites of compound avars will be added, but the compound
         // avars themselves will not be added. Performing this operation is
         // what allows Quanah to "un-nest" `when` statements in a single pass
         // without constructing a directed acyclic graph or preprocessing the
         // source code :-)
            temp = stack.shift();
            if ((temp instanceof AVar) &&
                    (temp.hasOwnProperty('isready') ||
                    (temp.hasOwnProperty('areready')))) {
             // This arm "flattens" dependencies for array-based recursion.
                Array.prototype.push.apply(stack, temp.val);
            } else {
             // This arm ensures that elements are unique.
                flag = true;
                for (i = 0; (flag === true) && (i < x.length); i += 1) {
                    flag = (temp !== x[i]);
                }
                if (flag === true) {
                    x.push(temp);
                }
            }
        }
        y.onerror = function (message) {
         // This function runs when something "terrible" has occurred.
            /*jslint unparam: true */
            ply(x).by(function (key, val) {
             // This function passes `message` to each avar in `x`. For the
             // other elements, there isn't much we can do, so we ignore them.
                if (val instanceof AVar) {
                    val.comm({fail: message, secret: secret});
                }
                return;
            });
            return;
        };
        defineProperty(y, 'onready', {
            configurable: false,
            enumerable: false,
            get: function () {
             // This getter passes a temporary object to `comm` in order to
             // return a reference to the next function in the avar's queue,
             // because `comm` itself doesn't return anything.
                var temp = {};
                y.comm({get_onready: temp, secret: secret});
                return temp.onready;
            },
            set: function (f) {
             // This setter "absorbs" `f`, which is expected to be a function,
             // and it stores it in the queue for `y` to execute later.
                /*jslint unparam: true */
                if (f instanceof AVar) {
                    y.comm({set_onready: f, secret: secret});
                    return;
                }
                var count, egress, g, n, ready;
                count = function () {
                 // This function is a simple counting semaphore that closes
                 // over some private state variables in order to delay the
                 // execution of `f` until certain conditions are satisfied.
                    n -= 1;
                    if (n === 0) {
                        ready = true;
                    }
                    return revive();
                };
                egress = [];
                g = function (evt) {
                 // This function uses closure over private state variables
                 // and the input argument `f` to delay execution and to run
                 // `f` with a modified version of the `evt` argument it will
                 // receive. This function will be assigned to `y.onready`,
                 // but it will not run until `ready` is `true`.
                    if (ready === false) {
                        return evt.stay('Acquiring "lock" ...');
                    }
                    if (isFunction(f) === false) {
                        return evt.fail('Assigned value must be a function');
                    }
                    f.call(this, {
                     // These methods close over the `evt` argument as well as
                     // the `egress` array so that invocations of the control
                     // statements `exit`, `fail`, and `stay` are forwarded to
                     // all of the original arguments given to `when`.
                        exit: function (message) {
                         // This function signals successful completion :-)
                            ply(egress).by(function (key, evt) {
                             // This is a "forEach" ==> `ply` is justified.
                                return evt.exit(message);
                            });
                            return evt.exit(message);
                        },
                        fail: function (message) {
                         // This function signals a failed execution :-(
                            ply(egress).by(function (key, evt) {
                             // This is a "forEach" ==> `ply` is justified.
                                return evt.fail(message);
                            });
                            return evt.fail(message);
                        },
                        stay: function (message) {
                         // This function delays execution until later.
                            ply(egress).by(function (key, evt) {
                             // This is a "forEach" ==> `ply` is justified.
                                return evt.stay(message);
                            });
                            return evt.stay(message);
                        }
                    });
                    return revive();    //- NOTE: Is this change justified?
                };
                n = x.length;
                ready = false;
                ply(x).by(function (key, val) {
                 // This function traverses the unique arguments to `when`.
                 // Because order isn't important, using `ply` is justified.
                    if (val instanceof AVar) {
                        val.onready = function (evt) {
                         // This function stores the `evt` argument into an
                         // array so we can prevent further execution involving
                         // `val` until after `g` calls the input argument `f`.
                            egress.push(evt);
                            count();
                            return;
                        };
                    } else {
                     // There's no reason to wait for it because it isn't an
                     // avar, so we'll go ahead and decrement the counter.
                        count();
                    }
                    return;
                });
                return y.comm({set_onready: g, secret: secret});
            }
        });
        defineProperty(y, ((args.length < 2) ? 'is' : 'are') + 'ready', {
            configurable: false,
            enumerable: false,
            get: function () {
             // This getter "forwards" to the avar's `onready` handler as a
             // means to let the code read more idiomatically in English.
                return y.onready;
            },
            set: function (f) {
             // This setter "forwards" to the avar's `onready` handler as a
             // means to let the code read more idiomatically in English.
                y.onready = f;
                return;
            }
        });
        return y;
    };

 // Prototype definitions

    defineProperty(AVar.prototype, 'onerror', {
        configurable: false,
        enumerable: false,
        get: function () {
         // This getter passes a temporary object to `comm` in order to return
         // a reference to the private `onerror` value, since `comm` itself
         // doesn't return anything.
            var temp = {};
            this.comm({get_onerror: temp, secret: secret});
            return temp.onerror;
        },
        set: function (f) {
         // This setter "absorbs" a function `f` and forwards it to `comm` so
         // that it can be stored as a handler for `this.onerror`. We don't
         // actually need to use `isFunction` because if it's not a function,
         // it will never run anyway -- see the `comm` definition.
            return this.comm({set_onerror: f, secret: secret});
        }
    });

    defineProperty(AVar.prototype, 'onready', {
        configurable: false,
        enumerable: false,
        get: function () {
         // This getter passes a temporary object to `comm` in order to return
         // a reference to the private `onready` value, since `comm` itself
         // doesn't return anything.
            var temp = {};
            this.comm({get_onready: temp, secret: secret});
            return temp.onready;
        },
        set: function (f) {
         // This setter "absorbs" a function `f` and forwards it to `comm` so
         // that it can be stored into a queue for subsequent execution. As a
         // bullet-proofing measure, I have moved the `isFunction` check into
         // the `comm` definition. Because there's only one place in the code
         // that can manipulate an avar's queue, assumptions about that queue
         // should be located as near there as possible to avoid oversight.
            return this.comm({set_onready: f, secret: secret});
        }
    });

    defineProperty(AVar.prototype, 'revive', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function () {
         // This function is syntactic sugar for triggering a `revive` from
         // code external to this giant anonymous closure. Currently, the same
         // effect can be achieved by invoking `x.comm()` for some avar `x`,
         // but that technique is deprecated now.
            return revive();
        }
    });

    defineProperty(AVar.prototype, 'toJSON', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function () {
         // This function exists as a way to ensure that `JSON.stringify` can
         // serialize avars correctly, because that function will delegate to
         // an input argument's `toJSON` prototype method if one is available.
         // Thus, providing this function allows Quanah to use its own format
         // for serialization without making it impossibly hard for users to
         // implement the abstract filesystem routines.
            return JSON.parse(serialize(shallow_copy(this)));
        }
    });

    defineProperty(AVar.prototype, 'toString', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function () {
         // This function "forwards" to the avar's `val` property if possible.
            if ((this.val === null) || (this.val === undefined)) {
                return this.val;
            }
            return this.val.toString.apply(this.val, arguments);
        }
    });

    defineProperty(AVar.prototype, 'valueOf', {
        configurable: false,
        enumerable: true,
        writable: false,
        value: function () {
         // This function "forwards" to the avar's `val` property if possible.
            if ((this.val === null) || (this.val === undefined)) {
                return this.val;
            }
            return this.val.valueOf.apply(this.val, arguments);
        }
    });

 // Out-of-scope definitions

    defineProperty(Object.prototype, 'Q', {
     // Modifying the native prototype objects is extremely poor taste,
     // so we need to do this as invisibly as possible. To that end, I
     // have added the new method using `defineProperty` instead of by
     // assigning directly because then I can edit ES5 meta-properties.
        configurable: false,
        enumerable: false,
        writable: false,
        value: function (f) {
         // This function is globally available as `Object.prototype.Q`, and
         // it also acts as the "namespace" for Quanah. It can be used with
         // any JavaScript value except `null` and `undefined`, and it expects
         // one argument which is either a function of a single variable or
         // else an avar whose value is such a function.
            var x = (this instanceof AVar) ? this : avar({val: this});
            x.onready = f;
            return x;
        }
    });

    (function () {

     // This function constructs a temporary "namespace" object `obj` and
     // then copies its methods and properties onto Method Q for "export".

        var obj;

        obj = {
            avar:       avar,
            init:       init,
            ply:        ply,
            volunteer:  volunteer,
            when:       when
        };

        ply(obj).by(function (key, val) {
         // This function copies the methods and properties of `obj` onto
         // Method Q as a simple means for "export". Because order is not
         // important, the use of `ply` here is justified.
            defineProperty(Object.prototype.Q, key, {
                configurable: false,
                enumerable: true,
                writable: false,
                value: val
            });
            return;
        });

        return;

    }());

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

 // NOTE: This function is invoked by a "generic" `call` to appease a recent
 // JSLINT update (~ 16 Feb 2012) that hates the `function () {}.call()` form.
 // I first revised it to use a `[function () {}][0].call()` form that I have
 // used previously for writing quines, but I realized that it would probably
 // be "targeted" in the future as well, since `[].map()` won't pass JSLINT.
 // Thus, we use `call` "generically" in order to change the `this` binding
 // for an anonymous function without ever storing it (and thereby naming it).
 // I'm not sure yet if JSLINT is even correct on this issue because I haven't
 // dissected the ES5.1 syntax yet, but this does accomplish my purpose :-)

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
