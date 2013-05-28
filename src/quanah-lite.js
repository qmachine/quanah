//- JavaScript source code

//- quanah-lite.js ~~
//
//  This version restricts the 10% of Quanah that receives 90% of complaints,
//  namely, "Method Q".
//
//                                                      ~~ (c) SRW, 25 May 2013
//                                                  ~~ last updated 28 May 2013

(function (global) {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80 */

    /*properties
        apply, avar, call, can_run_remotely, comm, def, done, epitaph, exit, f,
        fail, global_queue, hasOwnProperty, key, length, onerror, prototype,
        push, QUANAH, queue, random, ready, revive, run_remotely, shift, slice,
        stay, sync, toString, val, valueOf, x
    */

 // Prerequisites

    if (global.hasOwnProperty('QUANAH')) {
     // Exit early if Quanah is already available in the global environment.
        return;
    }

 // Declarations

    var AVar, avar, can_run_remotely, def, is_Function, revive, run_locally,
        run_remotely, state, sync, uuid;

 // Definitions

    AVar = function AVar(obj) {
     // This function needs documentation.
        var key, state, that;
        state = {
            epitaph:    null,
            onerror:    null,
            queue:      [],
            ready:      true
        };
        that = this;
        for (key in obj) {
            if ((obj.hasOwnProperty(key)) && (key !== 'comm')) {
                that[key] = obj[key];
            }
        }
        that.comm = function (obj) {
         // This function needs documentation.
            // ...
            return;
        };
        if (that.hasOwnProperty('key') === false) {
            that.key = uuid();
        }
        if (that.hasOwnProperty('val') === false) {
            that.val = null;
        }
        return that;
    };

    avar = function (obj) {
     // This function enables the user to avoid the `new` keyword, which is
     // useful because OOP in JS is not typically well-understood by users.
        return new AVar(obj);
    };

    can_run_remotely = function (task) {
     // This function exists to keep the abstraction in `revive` as clean and
     // close to English as possible. It tests for the existence of particular
     // user-defined functions so that `revive` can decide whether to use local
     // or remote execution for a given task.
        return ((is_Function(state.can_run_remotely))   &&
                (is_Function(state.run_remotely))       &&
                (state.can_run_remotely(task)));
    };

    def = function (obj) {
     // This function enables the user to redefine "internal" functions from
     // outside the giant anonymous closure. In particular, this allows users
     // to "port" Quanah as a concurrency model for use with almost any storage
     // or messaging system.
        var key;
        for (key in obj) {
            if ((obj.hasOwnProperty(key)) && (state[key] === null)) {
                state[key] = obj[key];
            }
        }
        return;
    };

    is_Function = function (f) {
     // This function returns `true` only if and only if the input argument
     // `f` is a function. The second condition is necessary to avoid a false
     // positive when `f` is a regular expression. Please note that an avar
     // whose `val` property is a function will still return `false`.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    revive = function () {
     // This function contains the execution center for Quanah. It's pretty
     // simple, really -- it just runs the first available task in its queue
     // (`queue`), and it selects an execution context conditionally. That's
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
     // computation can be distributed to external resources for execution, and
     // if they cannot be distributed, execution occurs on the local machine.
        var task = state.global_queue.shift();
        if (task !== undefined) {
            if (can_run_remotely(task)) {
                run_remotely(task);
            } else {
                run_locally(task);
            }
        }
        return;
    };

    run_locally = function (obj) {
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
                'exit': function (message) {
                 // This function indicates successful completion.
                    return obj.x.comm({'done': message});
                },
                'fail': function (message) {
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
                    return obj.x.comm({'fail': message});
                },
                'stay': function (message) {
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
                 // NOTE: Don't push back onto the queue until _after_ you send
                 // the `stay` message. Invoking `comm` also invokes `revive`,
                 // which consequently exhausts the recursion stack depth limit
                 // immediately if there's only one task to be run.
                    obj.x.comm({'stay': message});
                    state.global_queue.push(obj);
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

    run_remotely = function (task) {
     // This function exists only to forward input arguments to a user-defined
     // function which may or may not ever be provided. JS doesn't crash in a
     // situation like this because `can_run_remotely` tests for the existence
     // of the user-defined method before delegating to `run_remotely`.
        state.run_remotely(task);
        return;
    };

    state = {
        can_run_remotely: null,
        global_queue: [],
        run_remotely: null
    };

    sync = function () {
     // This function takes the place of Quanah's `when` function. It has been
     // renamed here because the idiom that inspired the previous name is no
     // longer available anyway (`when(x, y).areready` ...).
        var y = avar();
        // ...
        return y;
    };

    uuid = function () {
     // This function generates random hexadecimal UUIDs of length 32.
        var y = Math.random().toString(16).slice(2, 32);
        if (y === '') {
         // This shouldn't ever happen in JavaScript, but Adobe/Mozilla Tamarin
         // has some weird quirks due to its ActionScript roots.
            while (y.length < 32) {
                y += (Math.random() * 1e16).toString(16);
            }
            y = y.slice(0, 32);
        } else {
         // Every other JS implementation I have tried will use this instead.
            while (y.length < 32) {
                y += Math.random().toString(16).slice(2, 34 - y.length);
            }
        }
        return y;
    };

 // Prototype definitions

    AVar.prototype.revive = function () {
     // This function is an efficient syntactic sugar for triggering `revive`
     // from code external to this giant anonymous closure. Note that it does
     // not use `this`, which means that it may be a vestigial definition from
     // when I worried too much about limiting users' direct access to internal
     // functions.
        return revive();
    };

    AVar.prototype.toString = function () {
     // This function delegates to the avar's `val` property if possible. The
     // code here differs from the code for `AVar.prototype.valueOf` because it
     // assumes that the returned value should have a particular type (string).
     // My reasoning here is that, if the returned value were not a string, the
     // JS engine would still coerce it to a string, but not until after the
     // JIT compiler's type inference freaked out. Since we know that these
     // values should eventually become strings anyway, we can circumvent that
     // coercion and thereby improve performance.
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
