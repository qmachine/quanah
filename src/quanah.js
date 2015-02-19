//- JavaScript source code

//- quanah.js ~~
//
//  See https://quanah.readthedocs.org/en/latest/ for more information.
//
//                                                      ~~ (c) SRW, 14 Nov 2012
//                                                  ~~ last updated 19 Feb 2015

/*eslint camelcase: 0, new-cap: 0, quotes: [2, "single"] */

/* @flow */

/*jshint es3: true, maxparams: 2, quotmark: single, strict: true */

/*jslint indent: 4, maxlen: 80 */

/*properties
    apply, avar, call, can_run_remotely, epitaph, exit, exports, f, fail,
    global, hasOwnProperty, length, on, onfail, prototype, push, Q, QUANAH,
    queue, ready, run_remotely, send, shift, slice, snooze, stay, sync, val, x
*/

Function.prototype.call.call(function (that, quanah) {
    'use strict';

 // This strict anonymous closure is the first of two; this one focuses on
 // exporting the module for use by other programs, and it will run after the
 // second closure, which contains the code for the module itself. The primary
 // reason to decompose a single closure into two is to "quarantine" all
 // references to the global object into one closure (this one) so that the
 // module code can be written as independently of its environment as possible.
 // Unfortunately, detecting which object in the environment should be treated
 // as _the_ global object is much more difficult than it should be -- strict
 // mode disables the `call` method's default behavior of replacing `null` with
 // the global object. Luckily, we can work around that by passing a reference
 // to the enclosing scope as an argument at the same time and testing to see
 // if strict mode has done its deed. This task is not hard in the usual
 // browser context because we know that the global object is `window`, but
 // CommonJS implementations such as RingoJS confound the issue by modifying
 // the scope chain, running scripts in sandboxed contexts, and using
 // identifiers like `global` carelessly ...

    /*global global: false, module: false */

 // Declare a variable to hold a reference to the global object.

    var g;

 // Store a reference to the global object.

    if (this === null) {
     // Strict mode has captured us, but we already passed a reference :-)
        g = (typeof global === 'object') ? global : that;
    } else {
     // Strict mode isn't supported in this environment, and we need to make
     // sure we don't get fooled by Mozilla Rhino's `global` function.
        g = (typeof this.global === 'object') ? this.global : this;
    }

 // Export Quanah as a CommonJS module or as a property of the global object.

    if (typeof module === 'object') {
     // Assume CommonJS-ish conventions are being used. In Node.js, modules are
     // cached when loaded, so we can safely assume that this code will only
     // execute once and therefore will never overwrite "itself".
        module.exports = quanah;
    } else if (g.hasOwnProperty('QUANAH') === false) {
     // Assume browser-inspired "namespace" convention by assigning a single
     // object to a new all-caps global property. If the target name is already
     // present, assume that Quanah has already been loaded.
        g.QUANAH = quanah;
    }

 // That's all, folks!

    return;

}, null, this, (function (quanah) {
    'use strict';

 // This second strict anonymous closure defines Quanah in a way that is
 // completely sandboxed from the global object. Unfortunately, a disadvantage
 // of this approach is that it may eliminate the use of opt-in asm.js, but no
 // functions are strong candidates for that anyway. All code is written in a
 // subset of ECMAScript that is so old and well-supported that it also runs
 // correctly as ActionScript 2.0.

 // The input argument to this closure, `quanah`, is an object literal, `{}`,
 // and it will be used as a "namespace" to which methods and properties will
 // be added within the closure. Specifically, it will end up more like a Ruby
 // module -- a "bag of functions". Anything added to this object will be
 // available to scopes both inside and outside of this anonymous closure.
 // Because Quanah can delegate dynamically to functions that are defined
 // externally to this closure, users can adapt the behavior of Quanah's
 // "internal" functions for use with any environment. Additionally, this
 // allows the application developer to control the governance of the
 // definitions. Developers with concerns about malicious users' abilities to
 // "hijack" remote contexts by redefining "low-level" functions can use
 // `Object.defineProperty` in modern JavaScript environments to prevent their
 // code from being overwritten, for example.

 // Declarations

    var AVar, avar, can_run_remotely, is_Function, queue, run_locally,
        run_remotely, sync, tick;

 // Definitions

    AVar = function (val) {
     // This function constructs "asynchronous variables" ("avars"). An avar is
     // a generic container for any other JavaScript type. In the past, this
     // function was both given a name _and_ assigned to a variable reference,
     // mainly to prevent lambda lifting and to ensure that it had the same
     // look-and-feel of the native constructor functions. The same goals are
     // probably better achieved by custom `toString` methods, though, and thus
     // the code here has been simplified in order to appease various linters.
        var state, that;
        state = {'onfail': [], 'queue': [], 'ready': true};
        that = this;
        that.send = function (name, arg) {
         // This function is an instance method for manipulating the internal
         // state of an avar. Its interface was originally inspired by the
         // message-passing style used in Objective-C. Its name and functional
         // signature were later changed to mimic Ruby's `Object.send`. Note
         // that this function acts almost entirely by side effects. It no
         // longer calls itself recursively, but because it can call `sync`, it
         // can still end up recursing indirectly.
            var i;
            if (name === 'exit') {
             // A computation involving this avar has succeeded, and we will
             // now prepare to enable the application of the next transform in
             // the queue, unless this avar has already failed. That unusual
             // (but easily handled) edge case can occur, for example, when an
             // avar fails upstream of a syncpoint. Because `fail` accepts an
             // argument, `exit` also accepts one, but obviously it will not be
             // used ...
                state.ready = (state.hasOwnProperty('epitaph') === false);
            } else if (name === 'fail') {
             // A computation involving this avar has failed, and we will now
             // suspend all computations that depend on it indefinitely by
             // overwriting the queue with a fresh one. This is also important
             // because JavaScript's garbage collector can't free the memory
             // unless we release these references. We will also call any
             // `onfail` listeners that have been provided -- these will not be
             // overwritten.
                if (state.hasOwnProperty('epitaph') === false) {
                 // We don't want to overwrite the original error message by
                 // accident, because that would complicate debugging.
                    state.epitaph = arg;
                }
                state.queue = [];
                state.ready = false;
                for (i = 0; i < state.onfail.length; i += 1) {
                    state.onfail[i].call(that, state.epitaph);
                }
            } else if (name === 'onfail') {
             // This arm was originally added as an experiment into supporting
             // an event-driven idiom inspired by Node.js, but "fail" is still
             // the only event available. (Matching "exit" and "stay" events
             // are under consideration, but they will be added only if they
             // enable behavior that was previously impossible.) Note that no
             // typechecking is performed here, because failing silently here
             // for the case when `arg` isn't a function would make debugging
             // _really_ painful. (Note also that `arg` need not even be a real
             // function; it can be any object for which a `call` method is
             // available.) Assuming, then, that a function has been provided,
             // Quanah needs to make sure that the avar hasn't already failed
             // in a previous computation. If it has, then the listener is
             // assigned and also immediately invoked.
                state.onfail.push(arg);
                if (state.hasOwnProperty('epitaph')) {
                    arg.call(that, state.epitaph);
                }
            } else if (name === 'queue') {
             // The next transformation to be applied to this avar will be put
             // into an instance-specific queue before it ends up in the main
             // task queue (`queue`). Although `arg` is expected to be either a
             // function or an avar that will have a function as its `val`,
             // typechecking is not enforced at this time. Instead, the idea
             // here is to allow type errors to be caught by `run_locally` or
             // `run_remotely`.
                if (arg instanceof AVar) {
                    sync(arg, that).Q(function (signal) {
                     // This function allows Quanah to postpone execution of
                     // the given task until both `f` and `x` are ready. The
                     // following line takes the form `f.call(x, signal)`.
                        (arg.val).call(that, signal);
                     // This line is separate to ensure that the returned value
                     // is always `undefined`.
                        return;
                    });
                } else {
                    state.queue.push(arg);
                }
         /*
            } else if (name === 'stay') {
             // A computation that depends on this avar has been postponed, but
             // that computation will be put back into the queue directly by
             // `run_locally`. In many JavaScript environments, it will be
             // sufficient for us simply to wait for `tick` to be called again,
             // but I am now realizing that some environments _should_ run a
             // function here. (My guess is that, if `stay` is called in an
             // environment such as Spidermonkey that lacks an event loop, then
             // it may not be possible to guarantee that `tick` will ever run.
             // In such an environment, I can think of very few cases for which
             // using `stay` is a good idea; to fix this edge case may involve
             // the addition of a user-defined integration with the native
             // event loop.) For consistency with `exit` and `fail`, `stay`
             // accepts a message argument, but right now that argument won't
             // be used.
            } else {
             // When this arm is chosen, either an error exists in Quanah or
             // else a user is re-programming Quanah's guts; in either case, it
             // may be useful to capture the error. Another possibility is that
             // a user is trying to trigger `tick` using an obsolete idiom that
             // involved calling `send` without any arguments.
                that.send('fail', 'Invalid `send` to "' + name + '"');
         */
            }
         // Now, if the avar is ready for its next transform, "lock" the avar
         // and add a new task to the main task queue (`queue`).
            if ((state.ready === true) && (state.queue.length > 0)) {
                state.ready = false;
             // The use of `push` here is for consistency with a FIFO ordering,
             // but for a long time `unshift` was used here instead. The reason
             // for using `unshift` was because of a questionable assumption
             // that, because the new task would _definitely_ never have been
             // `stay`ed, trying it first before working through the rest of
             // the queue again would require less cycles through the queue in
             // the long term. Performance isn't a primary concern right now,
             // though, so ... `push` it is.
                queue.push({'f': state.queue.shift(), 'x': that});
            }
         // Finally, run `tick` to trigger execution for the main queue.
            tick();
            return that;
        };
        that.val = val;
        return that;
    };

    avar = quanah.avar = function (val) {
     // This function enables the user to avoid the `new` keyword, which is
     // useful because object-oriented programming in JavaScript is not
     // typically well-understood by users.
        return new AVar(val);
    };

    can_run_remotely = function (task) {
     // This function exists to keep the abstraction in `tick` as clean and
     // close to English as possible. It tests for the existence of particular
     // user-defined functions so that `tick` can decide whether to use local
     // or remote execution for a given task. Note also that the `=== true` is
     // meaningful here because it requires the user-defined function to return
     // a boolean `true` rather than a truthy value like `[]`.
        return ((is_Function(quanah.can_run_remotely)) &&
                (is_Function(quanah.run_remotely)) &&
                (quanah.can_run_remotely(task) === true));
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

    queue = [];

    run_locally = function (task) {
     // This function applies the transformation `f` to `x` for method `f` and
     // property `x` of the input object `task`. It calls `f` with `x` as the
     // `this` value, along with an object with methods to control execution as
     // an input argument. The advantage of performing transformations this way
     // (versus computing `f(x)` directly) is that it allows/forces the user to
     // indicate the program's logic explicitly even when the program's control
     // is difficult or impossible to predict, as is commonly the case in
     // JavaScript when working with callback functions. Note also that this
     // function acts almost entirely by side effects.
        try {
            task.f.call(task.x, {
             // This is the object that defines the input argument given to the
             // transformation `f`; it is often called `evt` or `signal`. It is
             // an object literal that provides `exit`, `fail`, and `stay`
             // methods that send messages to the task's input data, `task.x`,
             // for flow control. Quanah used to store a reference to this
             // object so that users could override the `fail` method, but no
             // one ever found a reason to do that. Note also that each method
             // ensures a `return` type of `undefined` explicitly. The reason
             // for this is because user-provided functions cannot be assumed
             // to adhere to prescribed signatures, and testing returned types
             // dynamically is expensive and beyond the scope of Quanah.
                'exit': function (message) {
                 // This function indicates successful completion. Note that
                 // `message` is currently ignored by `send`.
                    task.x.send('exit', message);
                    return;
                },
                'fail': function (message) {
                 // This function indicates a failure, and it is intended to
                 // replace the `throw new Error(...)` idiom, primarily because
                 // capturing errors that are thrown during remote execution
                 // are very difficult to capture and return to the invoking
                 // contexts otherwise. Although the name `run_locally` was
                 // chosen to indicate that the invocation and execution occur
                 // in the same JavaScript context, it does not always imply
                 // that the local context was the "original context". For
                 // example, a QMachine volunteer might actually import tasks
                 // from other machines into its own task queue; in such a
                 // case, the "original invocation" may have come from a
                 // "remote" machine, with respect to execution. The `fail`
                 // method is provided as a means to `throw` exceptions across
                 // arbitrary contexts. It also provides a clean alternative to
                 // error catching for asynchronous callback functions, because
                 // a `try/catch` block like this cannot catch those errors.
                    task.x.send('fail', message);
                    return;
                },
                'stay': function (message) {
                 // This function allows a user to postpone execution, and it
                 // is particularly useful for delaying execution until some
                 // condition is met -- it can be used to write non-blocking
                 // `while` and `until` constructs, for example. Since the
                 // ECMAScript standard lacks anything resembling a package
                 // manager, for example, the `stay` method can be used to
                 // defer execution until an external module has loaded. Of
                 // course, if execution has been deferred, when will it run
                 // again? The short answer is unsatisfying: it cannot never be
                 // _known_. Future publications will detail this idea by
                 // explaining why leaving execution guarantees to chance is
                 // acceptable when the probability approaches 1 :-)
                 //
                 // NOTE: Don't push back onto the queue until _after_ sending
                 // the `stay` message. Invoking `send` also invokes `tick`,
                 // which consequently exhausts the recursion stack depth limit
                 // immediately if there's only one task to be run.
                    task.x.send('stay', message);
                    queue.push(task);
                    if (is_Function(quanah.snooze)) {
                        quanah.snooze(tick);
                    }
                    return;
                }
            });
        } catch (err) {
         // Because Quanah never throws exceptions of its own, `err` is assumed
         // to be a task-level failure. Do not rely on Quanah to catch thrown
         // exceptions, however -- especially for callbacks to asynchronous
         // functions!
            task.x.send('fail', err);
        }
        return;
    };

    run_remotely = function (task) {
     // This function exists only to forward input arguments to a user-defined
     // function which may or may not ever be provided. JavaScript will not
     // crash in a situation like this because `can_run_remotely` tests for the
     // existence of the user-defined method before calling `run_remotely`.
     // Note that the lines below should not be simplified into a single line;
     // these lines ensure that `run_remotely` always returns `undefined`, even
     // if the user-provided `quanah.run_remotely` has an incorrect signature.
        quanah.run_remotely(task);
        return;
    };

    sync = quanah.sync = function () {
     // This function takes any number of arguments, any number of which may
     // be avars, and it outputs a new avar which acts as a "syncpoint". The
     // avar returned by this function will have a slightly modified form of
     // `AVar.prototype.Q` placed directly onto it as an instance method as a
     // means to provide a nice way of distinguishing a "normal" avar from a
     // "syncpoint". Any functions that are fed into the `Q` method will wait
     // for all input arguments' outstanding queues to empty before executing,
     // and exiting will allow each of the inputs to begin working through its
     // individual queue again. Also, a syncpoint can still be used as a
     // prerequisite to execution even when the syncpoint depends on one of
     // the other prerequisites. (Although the immediate usefulness of this
     // capability isn't obvious, it turns out to be crucially important for
     // expressing certain concurrency patterns idiomatically.)
     //
     // NOTE: What happens here if an avar which has already failed is used in
     // a `sync` statement? Does the `sync` fail immediately, as expected?
     //
     // NOTE: The instance method `Q` that gets added to a syncpoint is not
     // a perfect substitute for the instance `send` method it already has ...
     //
        var args, flag, i, temp, x, y;
        args = Array.prototype.slice.call(arguments);
        x = [];
        y = avar(args.slice());
        while (args.length > 0) {
         // This `while` loop replaces the previous `union` function, which
         // called itself recursively to create an array `x` of unique
         // dependencies from the input arguments `args`. Instead, Quanah uses
         // an array along with a `while` loop as a means to avoid recursion,
         // because the recursion depth limit is unpredictable in JavaScript.
         // The prerequisites of compound avars will be added, but the compound
         // avars themselves will not be added. Performing this operation is
         // what allows Quanah to "un-nest" `sync` statements in a single pass
         // without constructing a directed acyclic graph or preprocessing the
         // source code :-)
            temp = args.shift();
            if ((temp instanceof AVar) && (temp.hasOwnProperty('Q'))) {
             // This arm "flattens" dependencies for array-based recursion.
                Array.prototype.push.apply(args, temp.val);
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
         // This function is an instance-specific "Method Q". If that bothers
         // you, don't use it ;-)
            var block_execution, count, handle_error, j, m, n, status;
            if (f instanceof AVar) {
                return y.send('queue', f);
            }
            block_execution = function (outer_signal) {
             // This function blocks further progress through an individual
             // avar's queue until a nested avar exits.
                count();
                avar().Q(function (inner_signal) {
                 // This function checks to see if the syncpoint has finished
                 // executing yet. If so, it releases its "parent" avar, which
                 // was locked because it was being used by the syncpoint.
                    if (status === 'running') {
                        return inner_signal.stay();
                    }
                    inner_signal.exit();
                    return outer_signal.exit();
                });
                return;
            };
            count = function () {
             // This function is a simple counting semaphore that closes over
             // some private state variables in order to delay the execution of
             // `f` until certain conditions are satisfied.
                m += 1;
                if ((m === n) && (status === 'waiting')) {
                    status = 'running';
                }
                return;
            };
            handle_error = function () {
             // This function ensures that any failures by upstream avars are
             // communicated to the downstream syncpoint.
                status = 'failed';
                return;
            };
            m = 0;
            n = x.length;
            status = (m === n) ? 'running' : 'waiting';
            for (j = 0; j < n; j += 1) {
                if (x[j] instanceof AVar) {
                    x[j].Q(block_execution).on('fail', handle_error);
                } else {
                    count();
                }
            }
            return y.send('queue', function (signal) {
             // This function uses closure over private state variables and the
             // input argument `f` to delay execution and to run `f` with a
             // modified version of the `signal` argument it will receive. This
             // function will be put into `y`'s queue, but it will not run
             // until all prerequisites are ready to proceed.
                if (status === 'failed') {
                    signal.fail('Failed prerequisite(s) for syncpoint');
                } else if (status === 'waiting') {
                    signal.stay();
                } else {
                 // NOTE: The use of `this` in the following line can be
                 // replaced by `y` instead, but doing so might have major
                 // consequences for downstream applications such as QMachine.
                    f.call(this, {
                     // These methods extend those provided by the `signal`
                     // object in order to modify the standard behavior.
                        'exit': function (message) {
                         // This function signals successful completion :-)
                            status = 'done';
                            return signal.exit(message);
                        },
                        'fail': function (message) {
                         // This function signals a failed execution :-(
                            handle_error();
                            return signal.fail(message);
                        },
                        'stay': signal.stay
                    });
                }
                return;
            });
        };
        return y;
    };

    tick = function () {
     // This function contains the execution center for Quanah. It's pretty
     // simple, really -- it just runs the first available task in its queue
     // (`queue`) in an execution context appropriate for that particular task.
     // That's all it does. It makes no attempt to run every task in the queue
     // every time it is called, because instead it assumes it will be called
     // repeatedly until the entire program has executed. For example, every
     // time an avar receives a `send` message, `tick` will run. Because `tick`
     // only runs a single task from its queue for each invocation, that queue
     // can be shared safely across multiple execution contexts simultaneously,
     // and it makes no difference if the separate contexts are due to
     // recursion or to special objects such as Web Workers. The `tick`
     // function selects an execution context conditionally, and its behavior
     // can be modified by the presence of externally-provided definitions.
        var task = queue.shift();
        if (task instanceof Object) {
            if (can_run_remotely(task)) {
                run_remotely(task);
            } else {
                run_locally(task);
            }
        }
        return;
    };

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
     // an avar with a monadic function as its `val`. This function can be used
     // generically via `AVar.prototype.Q.call(x, f)` for arbitrary types, but
     // it's more fun (and reckless) to assign it to `Object.prototype.Q` ;-)
        return ((this instanceof AVar) ? this : avar(this)).send('queue', f);
    };

 // That's all, folks!

    return quanah;

}({})));

//- vim:set syntax=javascript:
