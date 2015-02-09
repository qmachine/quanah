//- JavaScript source code

//- quanah.js ~~
//
//  See https://quanah.readthedocs.org/en/latest/ for more information.
//
//                                                      ~~ (c) SRW, 14 Nov 2012
//                                                  ~~ last updated 08 Feb 2015

/* @flow */

/*jshint es3: true, maxparams: 2, quotmark: single, strict: true */

/*jslint indent: 4, maxlen: 80 */

/*properties
    apply, avar, call, can_run_remotely, def, epitaph, exit, exports, f, fail,
    global, hasOwnProperty, length, on, onerror, prototype, push, Q, QUANAH,
    queue, ready, run_remotely, send, shift, slice, snooze, stay, sync, val, x
*/

(Function.prototype.call.call(function (that, lib) {
    'use strict';

 // This strict anonymous closure is the first of two; this one focuses on
 // exporting the library for use by other programs, while the second one
 // contains the code for the library itself. The primary reason to decompose a
 // single closure into two is to "quarantine" all references to the global
 // object into one closure (this one) so that the library code can be written
 // as portably as possible. Unfortunately, detecting which object in the
 // environment should be treated as _the_ global object is much more difficult
 // than it should be -- strict mode disables the `call` method's default
 // behavior of replacing `null` with the global object. Luckily, we can work
 // around that by passing a reference to the enclosing scope as an argument at
 // the same time and testing to see if strict mode has done its deed. This
 // task is not hard in the usual browser context because we know that the
 // global object is `window`, but CommonJS implementations such as RingoJS
 // confound the issue by modifying the scope chain, running scripts in
 // sandboxed contexts, and using identifiers like `global` carelessly ...

    /*global global: false, module: false */

 // Declare a variable to hold a reference to the global object.

    var g;

 // Store a reference to the global object.

    if (this === null) {
     // Strict mode has captured us, but we already passed a reference :-)
        g = (typeof global === 'object') ? global : that;
    } else {
     // Strict mode isn't supported in this environment, and we need to make
     // sure we don't get fooled by Rhino's `global` function.
        g = (typeof this.global === 'object') ? this.global : this;
    }

 // Export Quanah as a CommonJS module or as a property of the global object.

    if (typeof module === 'object') {
     // Assume CommonJS-ish conventions are being used. In Node.js, modules are
     // cached when loaded, so we can safely assume that this code will only
     // execute once and therefore will never overwrite "itself".
        module.exports = lib;
    } else if (g.hasOwnProperty('QUANAH') === false) {
     // Assume browser-inspired "namespace" convention by assigning single
     // object to a new all-caps global property. If the target name is already
     // present, assume that Quanah has already been loaded.
        g.QUANAH = lib;
    }

 // That's all, folks!

    return;

}, null, this, (function () {
    'use strict';

 // This second strict anonymous closure defines Quanah in a way that is
 // completely sandboxed from the global object. Unfortunately, a disadvantage
 // of this approach is that it may eliminate the use of opt-in asm.js, but no
 // functions are strong candidates for that anyway. The entire library is
 // written in a subset of ECMAScript that is so old and well-supported that
 // Quanah actually runs correctly as ActionScript 2.0.

 // Declarations

    var AVar, avar, can_run_remotely, def, is_Function, loop, queue,
        run_locally, run_remotely, sync, user_defs;

 // Definitions

    AVar = function AVar(val) {
     // This function constructs "asynchronous variables" ("avars"). An avar is
     // a generic container for any other JavaScript type.
        var state, that;
        state = {'epitaph': null, 'onerror': null, 'queue': [], 'ready': true};
        that = this;
        that.send = function (name, arg) {
         // This function is an instance method for manipulating the internal
         // state of an avar. Its design was originally inspired by the
         // message-passing style used in Objective-C. Its name and functional
         // signature were later changed to mimic Ruby's `Object.send`.
            switch (name) {
            case 'exit':
             // A computation involving this avar has succeeded, and we will
             // now prepare to enable the application of the next transform in
             // the queue, unless this avar has already failed. The extra check
             // may not actually be necessary, but there's no harm in playing
             // it safe right now until I can formally prove that there are no
             // race conditions.
                state.ready = (state.epitaph === null);
                break;
            case 'fail':
             // A computation involving this avar has failed, and we will now
             // suspend all computations that depend on it indefinitely by
             // overwriting the queue with a fresh one. This is also important
             // because JavaScript's garbage collector can't free the memory
             // unless we release these references. We will also try to call
             // `onerror` if one has been defined.
                if (state.epitaph === null) {
                 // We don't want to overwrite the original error by accident,
                 // since that would be an utter nightmare for debugging.
                    state.epitaph = arg;
                }
                state.queue = [];
                state.ready = false;
                if (is_Function(state.onerror)) {
                    state.onerror.call(that, state.epitaph);
                }
                break;
            case 'onerror':
             // This arm was originally added as an experiment into supporting
             // an event-driven idiom inspired by Node.js, but "error" is still
             // the only event available. New "fail" and "stay" events are
             // under consideration, but they will be added only if they enable
             // behavior that was previously impossible.
                if (is_Function(arg)) {
                 // An `onerror` listener has been provided for this avar, but
                 // we need to make sure that it hasn't already failed in some
                 // previous computation. If the avar has already failed, we
                 // will store the listener and also call it immediately.
                    state.onerror = arg;
                    if (state.epitaph !== null) {
                        that.send('fail', state.epitaph);
                    }
                }
                break;
            case 'queue':
             // The next transformation to be applied to this avar will be put
             // into an instance-specific queue before it ends up in the main
             // task queue (`queue`).
                if (is_Function(arg)) {
                    state.queue.push(arg);
                } else if (arg instanceof AVar) {
                    sync(arg, that).Q(function (evt) {
                     // This function allows Quanah to postpone execution of
                     // the given task until both `f` and `x` are ready. The
                     // following line is given in the form `f.call(x, evt)`.
                     // Instead of checking that `arg.val` is a function, the
                     // strategy here is to allow type errors to be caught by
                     // `run_locally` or `run_remotely`.
                        (arg.val).call(that, evt);
                        return;
                    });
                } else {
                    that.send('fail', 'Transformation must be a function.');
                }
                break;
            case 'stay':
             // A computation that depends on this avar has been postponed,
             // but that computation will be put back into the queue directly
             // by `local_call`. In many JS environments, it will be sufficient
             // for us simply to wait for `loop` to be called again, but I
             // am now realizing that some environments *should* run a function
             // here. (My guess is that, if `stay` is called in an environment
             // such as Spidermonkey that lacks an event loop, then it may not
             // be possible to guarantee that `loop` will ever run. In such an
             // environment, I can think of very few cases for which using
             // `stay` is a good idea; to fix this edge case may involve the
             // addition of a user-defined integration with the native event
             // loop.) For consistency with `exit` and `fail`, `stay` accepts
             // a message argument, but right now that argument won't be used.
                break;
            default:
             // When this arm is chosen, either an error exists in Quanah or
             // else a user is re-programming Quanah's guts; in either case, it
             // may be useful to capture the error. Another possibility is that
             // a user is trying to trigger `loop` using an obsolete idiom that
             // involved calling `send` without any arguments.
                that.send('fail', 'Invalid `send` to "' + name + '"');
            }
         // Now, if the avar is ready for its next transform, "lock" the avar
         // and add a new task to the main task queue (`queue`).
            if ((state.ready === true) && (state.queue.length > 0)) {
                state.ready = false;
             // The use of `push` here is for consistency with a FIFO ordering,
             // but for a long time `unshift` was used here instead. The reason
             // for using `unshift` was because of a questionable assumption
             // that, because the new task would *definitely* never have been
             // `stay`ed, trying it first before working through the rest of
             // the queue again would require less cycles through the queue in
             // the long term. Performance isn't a primary concern right now,
             // though, so ... `push` it is.
                queue.push({'f': state.queue.shift(), 'x': that});
            }
         // Finally, run `loop` to trigger execution for the main queue.
            loop();
            return that;
        };
        that.val = val;
        return that;
    };

    avar = function (val) {
     // This function enables the user to avoid the `new` keyword, which is
     // useful because object-oriented programming in JS is not typically
     // well-understood by users.
        return new AVar(val);
    };

    can_run_remotely = function (task) {
     // This function exists to keep the abstraction in `loop` as clean and
     // close to English as possible. It tests for the existence of particular
     // user-defined functions so that `loop` can decide whether to use local
     // or remote execution for a given task. Note also that the `=== true` is
     // meaningful here because it requires the user-defined function to return
     // a boolean `true` rather than a truthy value like `[]`.
        return ((is_Function(user_defs.can_run_remotely))   &&
                (is_Function(user_defs.run_remotely))       &&
                (user_defs.can_run_remotely(task) === true));
    };

    def = function (obj) {
     // This function enables the user to redefine "internal" functions from
     // outside the giant anonymous closure. In particular, this allows users
     // to "port" Quanah as a concurrency model for use with almost any storage
     // or messaging system. For a real-world example, check out the browser
     // client for QMachine (https://github.com/qmachine/qm-browser-client). In
     // the past, only the first definition provided for a given method would
     // be used, because Quanah's development was largely driven by the needs
     // of QMachine, and concerns about a malicious user's ability to "hijack"
     // a worker by redefining "low-level" functions seemed important. It is
     // now very clear, however, that security concerns of that nature are not
     // Quanah's responsibility. In the future, it is most likely that the
     // "namespace module" itself will be used to store external definitions,
     // because that would allow individuals with security concerns to use
     // `Object.defineProperty` to prevent their code from being overwritten.
        var key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                user_defs[key] = obj[key];
            }
        }
        return;
    };

    is_Function = function (f) {
     // This function returns `true` only if and only if the input argument
     // `f` is a function. The second condition is necessary to avoid a false
     // positive when `f` is a regular expression. Quanah's priority is always
     // to behave according to the ECMAScript standard, and thus it doesn't try
     // to handle bugs like http://git.io/WcNQEQ or http://git.io/bZIaQw. Also,
     // note that an avar with a function as its `val` will return `false`.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    loop = function () {
     // This function contains the execution center for Quanah. It's pretty
     // simple, really -- it just runs the first available task in its queue
     // (`queue`) in an execution context appropriate for that particular task.
     // That's all it does. It makes no attempt to run every task in the queue
     // every time it is called, because instead it assumes it will be called
     // repeatedly until the entire program has executed. For example, every
     // time an avar receives a `send` message, `loop` will run. Because `loop`
     // only runs a single task from its queue for each invocation, that queue
     // can be shared safely across multiple execution contexts simultaneously,
     // and it makes no difference if the separate contexts are due to
     // recursion or to special objects such as Web Workers. The `loop`
     // function selects an execution context using conditional tests that
     // determine whether a given task can be distributed faithfully to
     // external resources for execution or not; if a task cannot be
     // distributed faithfully, then it will be executed by the local machine.
        var task = queue.shift();
        if (task !== undefined) {
            if (can_run_remotely(task)) {
                run_remotely(task);
            } else {
                run_locally(task);
            }
        }
        return;
    };

    queue = [];

    run_locally = function (task) {
     // This function applies the transformation `f` to `x` for method `f` and
     // property `x` of the input object `task` by calling `f` with `evt` as an
     // input argument and `x` as the `this` value. The advantage of performing
     // transformations this way (versus computing `f(x)` directly) is that it
     // allows the user to indicate the program's logic explicitly even when
     // the program's control is difficult or impossible to predict, as is
     // commonly the case in JavaScript when working with callback functions.
     // Note also that this function acts almost entirely by side effects.
        try {
            task.f.call(task.x, {
             // This is the object that defines the input argument given to the
             // transformation `f`; it is most often called `evt`. It is an
             // object literal that provides `exit`, `fail`, and `stay` methods
             // that send messages to `task.x` for flow control. Quanah used to
             // store a reference to this object so that users could override
             // the `fail` method, but no one ever found a reason to do that.
                'exit': function (message) {
                 // This function indicates successful completion.
                    task.x.send('exit', message);
                    return;
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
                    task.x.send('fail', message);
                    return;
                },
                'stay': function (message) {
                 // This function allows a user to postpone execution, and it
                 // is particularly useful for delaying execution until some
                 // condition is met -- it can be used to write non-blocking
                 // `while` and `until` constructs, for example. Since the
                 // ECMAScript standard lacks anything resembling a package
                 // manager, the `stay` method also comes in handy for delaying
                 // execution until an external library has loaded. Of course,
                 // if execution has been delayed, when will it run again? The
                 // short answer is unsatisfying: it cannot never be _known_.
                 // Future publications will detail this idea by explaining why
                 // leaving execution guarantees to chance is acceptable when
                 // the probability approaches 1 :-)
                 //
                 // NOTE: Don't push back onto the queue until _after_ sending
                 // the `stay` message. Invoking `send` also invokes `loop`,
                 // which consequently exhausts the recursion stack depth limit
                 // immediately if there's only one task to be run.
                    task.x.send('stay', message);
                    queue.push(task);
                    if (is_Function(user_defs.snooze)) {
                        user_defs.snooze(loop);
                    }
                    return;
                }
            });
        } catch (err) {
         // In early versions of Quanah, `stay` threw a special `Error` type as
         // a crude form of message passing, but because Quanah no longer
         // throws errors, it can assume that all caught errors are failures.
            task.x.send('fail', err);
        }
        return;
    };

    run_remotely = function (task) {
     // This function exists only to forward input arguments to a user-defined
     // function which may or may not ever be provided. JS doesn't crash in a
     // situation like this because `can_run_remotely` tests for the existence
     // of the user-defined method before delegating to `run_remotely`. Note
     // that the lines below should not be simplified into a single line; then
     // current form ensures that `run_remotely` always returns `undefined`,
     // because user-provided definitions may not adhere to the prescribed
     // signature ;-)
        user_defs.run_remotely(task);
        return;
    };

    sync = function () {
     // This function takes any number of arguments, any number of which may
     // be avars, and it outputs a new avar which acts as a "sync point". The
     // syntax here is designed to mimic `Array.concat`. The avar returned by
     // this function will have a slightly modified form of `AVar.prototype.Q`
     // placed directly onto it as an instance method as a means to provide a
     // nice way of distinguishing a "normal" avar from a "sync point". Any
     // functions that are fed into the `Q` method will wait for all input
     // arguments' outstanding queues to empty before executing, and exiting
     // will allow each of the inputs to begin working through its individual
     // queue again. Also, a sync point can still be used as a prerequisite to
     // execution even when the sync point depends on one of the other
     // prerequisites. (Although the immediate usefulness of this capability
     // isn't obvious, it turns out to be crucially important for expressing
     // certain concurrency patterns idiomatically.)
     //
     // NOTE: What happens here if an avar which has already failed is used in
     // a `sync` statement? Does the `sync` fail immediately, as expected?
     //
     // NOTE: The instance method `Q` that gets added to a sync point is not
     // a perfect substitute for the instance `send` method it already has ...
     //
        var args, flag, i, stack, temp, x, y;
        args = Array.prototype.slice.call(arguments);
        stack = args.slice();
        x = [];
        y = avar();
        while (stack.length > 0) {
         // This `while` loop replaces the previous `union` function, which
         // called itself recursively to create an array `x` of unique
         // dependencies from the input arguments `args`. Instead, Quanah uses
         // an array-based stack here with a `while` loop as a means to avoid
         // the treacherous function recursion stack and its unpredictably
         // limited depth, since a user could potentially write fiendishly
         // complicated code that would actually overflow that limit. Anyway,
         // the prerequisites of compound avars will be added, but the compound
         // avars themselves will not be added. Performing this operation is
         // what allows Quanah to "un-nest" `sync` statements in a single pass
         // without constructing a directed acyclic graph or preprocessing the
         // source code :-)
            temp = stack.shift();
            if ((temp instanceof AVar) && (temp.hasOwnProperty('Q'))) {
             // This arm "flattens" dependencies for array-based recursion.
                Array.prototype.push.apply(stack, temp.val);
            } else {
             // This arm ensures that elements are unique.
                flag = false;
                for (i = 0; (flag === false) && (i < x.length); i += 1) {
                    flag = (temp === x[i]);
                }
                if (flag === false) {
                    x.push(temp);
                }
            }
        }
        y.Q = function (f) {
         // This function is an instance-specific "Method Q".
            if (f instanceof AVar) {
                return y.send('queue', f);
            }
            var blocker, count, egress, j, m, n, ready;
            blocker = function (evt) {
             // This function stores the `evt` argument into an array that will
             // be used later by the input argument to `f`.
                egress.push(evt);
                return count();
            };
            count = function () {
             // This function is a simple counting semaphore that closes over
             // some private state variables in order to delay the execution of
             // `f` until certain conditions are satisfied.
                m += 1;
                ready = (m === n);
                return loop();
            };
            egress = [];
            m = 0;
            n = x.length;
            ready = (m === n);
            for (j = 0; j < n; j += 1) {
                if (x[j] instanceof AVar) {
                    x[j].Q(blocker);
                } else {
                    count();
                }
            }
            y.send('queue', function (evt) {
             // This function uses closure over private state variables and the
             // input argument `f` to delay execution and to run `f` with a
             // modified version of the `evt` argument it will receive. This
             // function will be put into `y`'s queue, but it will not run
             // until `ready` is `true`.
                if (ready === false) {
                    return evt.stay('Acquiring "lock" ...');
                }
                f.call(this, {
                 // These methods close over the `evt` argument as well as
                 // the `egress` array so that invocations of the control
                 // statements `exit`, `fail`, and `stay` are forwarded to
                 // all of the original arguments given to `sync`.
                    'exit': function (message) {
                     // This function signals successful completion :-)
                        var index;
                        for (index = 0; index < egress.length; index += 1) {
                            egress[index].exit(message);
                        }
                        return evt.exit(message);
                    },
                    'fail': function (message) {
                     // This function signals a failed execution :-(
                        var index;
                        for (index = 0; index < egress.length; index += 1) {
                            egress[index].fail(message);
                        }
                        return evt.fail(message);
                    },
                    'stay': function (message) {
                     // This function postpones execution temporarily. Although
                     // it seems reasonable that `stay` should match the forms
                     // of `exit` and `fail`, such behavior doesn't really make
                     // sense. Telling all the blocked avars to stay is silly
                     // because they're already blocked. Moreover, it would
                     // cause them all to run the non-idempotent `blocker`
                     // function again -- not a good move!
                     /*
                        var index;
                        for (index = 0; index < egress.length; index += 1) {
                            egress[index].stay(message);
                        }
                     */
                        return evt.stay(message);
                    }
                });
                return;
            });
            return y;
        };
        return y;
    };

    user_defs = {};

 // Prototype definitions

    AVar.prototype.on = function (event_name, listener) {
     // This function's only current use is to allow users to set custom error
     // handlers, but by mimicking the same idiom used by jQuery and Node.js, I
     // am hoping to leave Quanah plenty of room to grow later :-)
        return this.send('on' + event_name, listener);
    };

    AVar.prototype.Q = function (f) {
     // This function is the infamous "Method Q" that once doubled as the
     // "namespace" for Quanah. Here, it is defined as a chainable prototype
     // method for avars that takes a single input argument. The input argument
     // is expected to be either a monadic (single variable) function or else
     // an avar with a monadic function as its `val`.
        return ((this instanceof AVar) ? this : avar(this)).send('queue', f);
    };

 // That's all, folks!

    return {'avar': avar, 'def': def, 'sync': sync};

}())));

//- vim:set syntax=javascript:
