//- JavaScript source code

//- quanah-lite.js ~~
//
//  This version restricts the 10% of Quanah that receives 90% of complaints,
//  namely, "Method Q".
//
//                                                      ~~ (c) SRW, 25 May 2013
//                                                  ~~ last updated 12 Jun 2013

(function (global) {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80 */

    /*properties
        add_to_queue, apply, avar, call, can_run_remotely, comm, concat, def,
        done, epitaph, exit, f, fail, hasOwnProperty, key, length, onerror,
        prototype, push, Q, QUANAH, queue, random, ready, revive, run_remotely,
        shift, slice, stay, sync, toString, unshift, val, valueOf, wait_for, x
    */

 // Prerequisites

    if (global.hasOwnProperty('QUANAH')) {
     // Exit early if Quanah is already available in the global environment.
        return;
    }

 // Declarations

    var AVar, avar, can_run_remotely, def, global_queue, is_Function, revive,
        run_locally, run_remotely, user_defs, uuid;

 // Definitions

    AVar = function AVar(obj) {
     // This function constructs "avars", which are generic containers for
     // "asynchronous variables".
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
         // This function provides a mechanism for manipulating the internal
         // state of an avar without providing direct access to that state. It
         // was inspired by the message-passing style used in Objective-C.
            var args, key, message;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    args = [].concat(obj[key]);
                    message = key;
                }
            }
            switch (message) {
            case 'add_to_queue':
             // The next transformation to be applied to this avar will be put
             // into an instance-specific queue before it ends up in the main
             // task queue (`global_queue`). Because retriggering execution by
             // sending `done` messages recursively requires a lot of extra
             // overhead, we'll just go ahead and retrigger execution directly.
                if (is_Function(args[0])) {
                    state.queue.push(args[0]);
                    if (state.ready === true) {
                        state.ready = false;
                        global_queue.unshift({f: state.queue.shift(), x: that});
                    }
                } else if (args[0] instanceof AVar) {
                    args[0].sync(that).Q(function (evt) {
                     // This function allows Quanah to postpone execution of
                     // the given task until both `f` and `x` are ready. The
                     // following line is given in the form `f.call(x, evt)`.
                        (this.val[0].val).call(this.val[1], evt);
                        return;
                    });
                } else {
                    that.comm({'fail': 'Transformation must be a function.'});
                }
                break;
            case 'done':
             // A computation involving this avar has succeeded, and we will
             // now prepare to run the next computation that depends on it by
             // transferring it into the `revive` queue.
                state.ready = true;
                if (state.queue.length > 0) {
                    state.ready = false;
                    global_queue.unshift({f: state.queue.shift(), x: that});
                }
                break;
            case 'fail':
             // A computation involving this avar has failed, and we will now
             // suspend all computations that depend on it indefinitely by
             // overwriting the queue with a fresh one. This is also important
             // because the garbage collector can't free the memory unless we
             // release these references. We will also try to call `onerror`
             // if one has been defined.
                if (state.epitaph === null) {
                 // We don't want to overwrite the original error by accident,
                 // since that would be an utter nightmare for debugging.
                    state.epitaph = args;
                }
                state.queue = [];
                state.ready = false;
                if (is_Function(state.onerror)) {
                    state.onerror.apply(that, state.epitaph);
                }
                break;
            case 'on':
             // This one is an experiment ...
                if ((args[0] === 'error') && (is_Function(args[1]))) {
                 // A computation has defined an `onerror` handler for this
                 // avar, but we need to make sure that it hasn't already
                 // failed in some previous computation. If the avar has
                 // already failed, we will store the handler and also fire it
                 // immediately.
                    state.onerror = args[1];
                    if (state.epitaph !== null) {
                        that.comm({'fail': state.epitaph});
                    }
                }
                break;
            case 'stay':
             // A computation that depends on this avar has been postponed,
             // but that computation will be put back into the queue directly
             // by `local_call`. Thus, nothing actually needs to happen here;
             // we just need to wait. For consistency with `exit` and `fail`,
             // I allow `stay` to take a message argument, but right now it
             // doesn't actually do anything. In the future, however, I may
             // enable a verbose mode for debugging that outputs the message.
                break;
            default:
             // When this arm is chosen, either an error exists in Quanah or
             // else a user is re-programming Quanah's guts; in either case, it
             // may be useful to capture the error. Another possibility is that
             // a user is trying to trigger `revive` using an obsolete idiom
             // that involved calling `that.comm` without any arguments.
                that.comm({'fail': 'Invalid `comm` message "' + message + '"'});
            }
            return revive();
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
        return ((is_Function(user_defs.can_run_remotely))   &&
                (is_Function(user_defs.run_remotely))       &&
                (user_defs.can_run_remotely(task)));
    };

    def = function (obj) {
     // This function enables the user to redefine "internal" functions from
     // outside the giant anonymous closure. In particular, this allows users
     // to "port" Quanah as a concurrency model for use with almost any storage
     // or messaging system.
        var key;
        for (key in obj) {
            if ((obj.hasOwnProperty(key)) && (user_defs[key] === null)) {
                user_defs[key] = obj[key];
            }
        }
        return;
    };

    global_queue = [];

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
     // (`global_queue`), and it selects an execution context conditionally.
     // That's all it does. It makes no attempt to run every task in the queue
     // every time it is called, because instead Quanah uses a strategy in
     // which it tries to call `revive` as many times as necessary to process
     // an entire program correctly. For example, every time an avar receives a
     // `comm` message, `revive` will run. Because `revive` only runs a single
     // task from the queue for each invocation, its queue can be shared safely
     // across multiple execution "contexts" simultaneously, and it makes no
     // difference if the separate contexts are due to recursion or to special
     // objects such as Web Workers. The `revive` function selects a context
     // for execution using conditional tests that determine whether a given
     // computation can be distributed to external resources for execution, and
     // if they cannot be distributed, execution occurs on the local machine.
        var task = global_queue.shift();
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
                    global_queue.push(obj);
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
        user_defs.run_remotely(task);
        return;
    };

    user_defs = {can_run_remotely: null, run_remotely: null};

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

    AVar.prototype.Q = function method_Q(f) {
     // This function is the infamous "Method Q" that acted as a "namespace"
     // for previous versions of Quanah. Here, it is defined as a prototype
     // method for avars, but if you assign it to `Object.prototype.Q`, it will
     // work for any native value except `null` or `undefined`. It expects its
     // argument to be a function of a single variable or else an avar with
     // such a function as its `val`.
        var x = (this instanceof AVar) ? this : avar({val: this});
        x.comm({'add_to_queue': f});
        return x;
    };

    AVar.prototype.revive = function () {
     // This function is an efficient syntactic sugar for triggering `revive`
     // from code external to this giant anonymous closure. Because `this` is
     // returned, this method is "chainable".
        revive();
        return this;
    };

    AVar.prototype.sync = function () {
     // This function will fill the niche of Quanah's `when` function. The idea
     // will be to use it like `Array.prototype.concat` (`[].concat(x, y, z)`):
     //
     //     avar().sync(x, y, z).Q(f).on('error', g);
     //
        return this;
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

    global.QUANAH = {avar: avar, def: def};

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
