//- JavaScript source code

//- quanah.js ~~
//
//  See https://quanah.readthedocs.org/en/latest/ for more information.
//
//                                                      ~~ (c) SRW, 14 Nov 2012
//                                                  ~~ last updated 21 May 2015

/*eslint */

/* @flow */

/*jshint es3: true, maxparams: 2, quotmark: double, strict: true */

/*jslint indent: 4, maxlen: 80 */

/*properties
    apply, avar, call, canRunRemotely, epitaph, exit, exports, f, fail, global,
    hasOwnProperty, length, on, onfail, prototype, push, Q, QUANAH, queue,
    ready, runRemotely, send, shift, slice, snooze, stay, sync, val, x
*/

/*! Quanah | (c) Sean Wilkinson | http://www.apache.org/licenses/LICENSE-2.0 */

(function (env, init) {
    "use strict";

 // Anonymous closure #1
 // ====================
 //
 // This strict anonymous closure is the first of two, in order of appearance
 // as well as in order of execution. Its sole purpose is to export the module
 // for the current environment so Quanah can be used by other JavaScript
 // programs.

    /*global module: false */

 // "Approximate" reference to global object
 // ----------------------------------------
 //
 // The first step is to attempt to store a reference to the global object, but
 // not to obsess over the details too much. The "strict mode" environments
 // that first appeared in ECMAScript 5 make it challenging to reference the
 // global object directly from within this closure, and the easiest solution
 // is to feed `this` from the invoking scope into this closure as the `env`
 // input argument. Of course, `this` may not actually reference the global
 // object, because some JavaScript environments -- RingoJS, for example -- use
 // non-standard scope chains. Fortunately, all of the "difficult" cases will
 // use the CommonJS module loading convention instead, and thus there is no
 // reason to stress out _too_ much :-)

    var global = (typeof env.global === "object") ? env.global : env;

 // Module export
 // -------------
 //
 // The rest of this closure initializes and exports Quanah as a module if and
 // only if it has not already been loaded. The second argument to the closure,
 // `init`, is the second closure that was mentioned in the introduction, and
 // it contains the code necessary to add methods and properties to an object
 // in order to create the Quanah module. The primary reason to decompose a
 // single closure into two is to "quarantine" all references to the global
 // object into one closure (this one) so that the module code can be written
 // as independently of its environment as possible.

    if ((typeof module === "object") && (typeof module.exports === "object")) {
     // Assume CommonJS conventions. In Node.js, modules are cached when they
     // are loaded, which allows the assumption that the `init` code will only
     // run once. RingoJS will also choose this branch, but thanks to the
     // second condition, the MongoDB shell will not.
        module.exports = init({});
    } else if (global.hasOwnProperty("QUANAH") === false) {
     // Assume browser-inspired "namespace" convention by assigning a single
     // object to a new all-caps global property. The `init` code will only run
     // once because this branch can only run once by construction.
        global.QUANAH = init({});
    }

 // That's all, folks!

    return;

}(this, function (quanah) {
    "use strict";

 // Anonymous closure #2
 // ====================
 //
 // This second strict anonymous closure defines Quanah in a way that is
 // completely sandboxed from the global object. One potential disadvantage of
 // this approach is that it may disable the use of opt-in asm.js, but Quanah
 // optimizes for simplicity and correctness rather than performance anyway.
 // Its code is written in a subset of ECMAScript so old and well-supported
 // that it also runs correctly as ActionScript 2.0.
 //
 // The input argument to this closure, `quanah`, will be an object to which
 // methods will be added as a "namespace". Specifically, the result will be
 // more like a Ruby module -- a "bag of functions". All methods and properties
 // added to the module will be available in-scope both inside and outside of
 // this anonymous closure. Because Quanah delegates dynamically to functions
 // that are defined externally to this closure, users can modify and optimize
 // the behavior of Quanah for different environments. As a bonus, this design
 // enables users to control the governance of the definitions. Developers with
 // concerns about malicious users' abilities to "hijack" remote contexts by
 // redefining "low-level" functions can use `Object.defineProperty` in modern
 // JavaScript environments to prevent their code from being overwritten, for
 // example.

 // Variable declarations
 // ---------------------
 //
 // JavaScript uses function-level scope, instead of block-level scope, which
 // can be confusing for programmers coming from languages like C. There are
 // some distinct advantages to declaring variables sooner rather than later in
 // JavaScript, and thus the standard convention is to declare variables at the
 // beginning of the scope -- the first line of the function itself.

    var AVar, canRunRemotely, isFunction, queue, runLocally, runRemotely, tick;

 // Variable definitions
 // --------------------
 //
 // Definitions are separated from declarations deliberately in order to avoid
 // certain problems that occur when functions use undefined references. The
 // definitions are sorted alphabetically because it is convenient and natural.

    AVar = function (val) {
     // This function constructs "asynchronous variables" ("avars"). An avar is
     // a generic container for any other JavaScript type. The constructors for
     // native types use named functions, but there is no language requirement
     // for this; in fact, linting tools developed by the open-source community
     // support the current anonymous design instead.
        var state, that;
        state = {"onfail": [], "queue": [], "ready": true};
        that = this;
        that.send = function (name, arg) {
         // This function is an instance method for manipulating the internal
         // state of an avar. Its interface was originally inspired by the
         // message-passing style used in Objective-C. Its name and functional
         // signature were later changed to mimic Ruby's `Object.send`. Note
         // that this function acts almost entirely by side effects. It no
         // longer calls itself recursively, but because it can call `sync`, it
         // can still end up recursing indirectly.
            if (name === "exit") {
             // A computation involving this avar has succeeded, and we will
             // now prepare to enable the application of the next transform in
             // the queue, unless this avar has already failed. That unusual
             // (but easily handled) edge case can occur, for example, when an
             // avar fails upstream of a syncpoint. Because `fail` accepts an
             // argument, `exit` also accepts one, but it will not be used.
                state.ready = (state.hasOwnProperty("epitaph") === false);
            } else if (name === "fail") {
             // A computation involving this avar has failed, and we will now
             // suspend all computations that depend on it indefinitely by
             // overwriting the queue with a fresh one. This is also important
             // because JavaScript's garbage collector can't free the memory
             // unless we release these references. We will also call any
             // `onfail` listeners that have been provided, and we will remove
             // each one after calling it.
                if (state.hasOwnProperty("epitaph") === false) {
                 // Always preserve the original error message because it helps
                 // to simplify debugging.
                    state.epitaph = arg;
                }
                state.queue = [];
                state.ready = false;
                while (state.onfail.length > 0) {
                    state.onfail.shift().call(that, state.epitaph);
                }
            } else if (name === "onfail") {
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
             // in a previous computation. If it has already failed, the newly
             // provided listener will be invoked immediately but not stored.
                state.onfail.push(arg);
                if (state.hasOwnProperty("epitaph")) {
                    state.onfail.shift().call(that, state.epitaph);
                }
            } else if (name === "queue") {
             // The next transformation to be applied to this avar will be put
             // into an instance-specific queue before it ends up in the main
             // task queue (`queue`). Although `arg` is expected to be either a
             // function or an object that will respond to a `call` method as
             // if it were a function, typechecking is not enforced right here.
             // Instead, the idea is to allow type errors to be caught by
             // `runLocally` or `runRemotely`.
                state.queue.push(arg);
         /*
            } else if (name === "stay") {
             // A computation that depends on this avar has been deferred, but
             // that computation will be put back into the queue directly by
             // `runLocally`. For consistency with the "exit" and "fail"
             // messages, "stay" accepts an argument, but the current code
             // ignores that argument.
         */
            } else if (name !== "stay") {
             // This arm corresponds to a typical `else` arm, but it has a
             // guard because there is no arm to handle the `name === "stay"`
             // case. (It would be an empty block, and that would irritate the
             // linters.) A common way to end up here occurs when a seasoned
             // JavaScripter tries to write `x.on("error", listener)` instead
             // of `x.on("fail", listener)`.
                return that.send("fail", "Invalid `send`: '" + name + "'");
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
                queue.push({"f": state.queue.shift(), "x": that});
            }
         // Finally, call `tick` to trigger execution for the main queue.
            tick();
            return that;
        };
        that.val = val;
        return that;
    };

    canRunRemotely = function (task) {
     // This function exists to keep the abstraction in `tick` as clean and
     // close to English as possible. It tests for the existence of particular
     // user-defined functions so that `tick` can decide whether to use local
     // or remote execution for a given task. Note also that the `=== true` is
     // meaningful here because it requires the user-defined function to return
     // a boolean `true` rather than a truthy value like `[]`.
        return ((isFunction(quanah.canRunRemotely)) &&
                (isFunction(quanah.runRemotely)) &&
                (quanah.canRunRemotely(task) === true));
    };

    isFunction = function (f) {
     // This function returns `true` only if and only if the input argument
     // `f` is a function. The second condition is necessary to avoid a false
     // positive when `f` is a regular expression in older browsers. Quanah's
     // priority is always to behave according to the ECMAScript standard, but
     // the ES3.1 standard neglected this part; see http://goo.gl/C5F8Wh for
     // discussion. Quanah doesn't try to handle bugs like http://git.io/WcNQEQ
     // or http://git.io/bZIaQw. Also, note that an avar with a function as its
     // `val` will return `false`.
        return ((typeof f === "function") && (f instanceof Function));
    };

    queue = [];

    runLocally = function (task) {
     // This function applies the transformation `f` to `x` for method `f` and
     // property `x` of the input object `task`. It calls `f` with `x` as the
     // `this` value, along with an object with methods to control execution as
     // an input argument. The advantage of performing transformations this way
     // (versus computing `f(x)` directly) is that it allows/forces the user to
     // indicate the program's logic explicitly even when the program's control
     // is difficult or impossible to predict, as is commonly the case in
     // JavaScript when working with callback functions. Note also that this
     // function acts entirely by side effects.
        try {
         // An interesting consequence of the use of `task.f.call` instead of
         // `Function.prototype.call(f,` is that the function `task.f` can be
         // replaced by a "callable object" -- an object with a `call` method.
         // This idea is already available in languages such as Lua and Ruby,
         // but JavaScript tends to restrict metaprogramming. A different paper
         // on this concept's consequences for JavaScript is forthcoming.
            task.f.call(task.x, {
             // This is the object that defines the input argument given to the
             // transformation `f`; it is often called `evt` or `signal`. It is
             // an object literal that provides `exit`, `fail`, and `stay`
             // methods that send messages to the task's input data, `task.x`,
             // for flow control. Quanah used to store a reference to this
             // object so that users could override the `fail` method, but no
             // one ever found a reason to do that. Note also that each method
             // ensures a `return` type of `undefined`. The reason for this is
             // because user-provided functions cannot be assumed to adhere to
             // prescribed signatures, and testing returned types dynamically
             // is expensive and beyond the scope of Quanah.
                "exit": function (message) {
                 // This function indicates successful completion. Note that
                 // `message` is currently ignored by `send`.
                    task.x.send("exit", message);
                    return;
                },
                "fail": function (message) {
                 // This function indicates a failure, and it is intended to
                 // replace the `throw new Error(...)` idiom, primarily because
                 // capturing errors that are thrown during remote execution
                 // are very difficult to capture and return to the invoking
                 // contexts otherwise. Although the name `runLocally` was
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
                    task.x.send("fail", message);
                    return;
                },
                "stay": function (message) {
                 // This function allows a user to postpone execution, and it
                 // is particularly useful for delaying execution until some
                 // condition is met; it can be used to write non-blocking
                 // `while` and `until` constructs, for example. Since the
                 // ECMAScript standard lacks anything resembling a package
                 // manager, for example, the `stay` method can be used to
                 // defer execution until an external module has loaded. Of
                 // course, if execution has been deferred, _when_ will it run
                 // again? The short answer is unsatisfying: it can never be
                 // _known_. In JavaScript environments that lack asynchronous
                 // functions, using `stay` is a bad idea because there are
                 // situations in which tasks may get "stuck". Discussion and
                 // examples are coming soon in an academic manuscript.
                 //
                 // NOTE: Don't push back onto the queue until _after_ sending
                 // the `stay` message. (When there is only one task to run, it
                 // causes a problem because `send` invokes `tick`, which means
                 // that the task would be pushed back onto the queue and then
                 // immediately run again, where it would `stay` again because
                 // no other tasks would have run yet; this would result in an
                 // error for exceeding the recursion stack depth limit.)
                 //
                    task.x.send("stay", message);
                    queue.push(task);
                    if (isFunction(quanah.snooze)) {
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
            task.x.send("fail", err);
        }
        return;
    };

    runRemotely = function (task) {
     // This function exists only to forward input arguments to a user-defined
     // function which may or may not ever be provided. JavaScript will not
     // crash in a situation like this because `canRunRemotely` tests for the
     // existence of the user-defined method before calling `runRemotely`. Note
     // that the lines below should not be simplified into a single line; these
     // lines ensure that `runRemotely` always returns `undefined`, even if the
     // user-provided `quanah.runRemotely` has an incorrect signature.
     //
     // NOTE: Would it be easier to understand if `quanah.runRemotely(task)`
     // were just inlined directly into `tick`? The argument for separating it
     // into its own function is for consistency in `tick`, but the argument
     // for inlining it is that it would show clearly that the behavior of
     // Quanah can be modified externally to this closure ...
     //
        quanah.runRemotely(task);
        return;
    };

    tick = function () {
     // This function contains the execution center for Quanah. It's pretty
     // simple, really; it just runs the first available task in its queue
     // (`queue`) in an execution context appropriate for that particular task.
     // That's all it does. It makes no attempt to run every task in the queue
     // every time it is called, because instead it assumes it will be called
     // repeatedly until the entire program has executed. For example, every
     // time an avar receives a `send` message, `tick` will run. Because `tick`
     // only runs a single task from its queue for each invocation, execution
     // is re-entrant. In other words, access to the queue can be shared safely
     // by multiple execution contexts simultaneously, without any need to make
     // a distinction between recursing contexts or platform features like Web
     // Workers. The `tick` function selects an execution context based on the
     // presence or absence of external function definitions. Note that the
     // check that `task` is an object checks indirectly that `queue` was
     // non-empty, and it also provides type hints for tools like Flow.
        var task = queue.shift();
        if (task instanceof Object) {
            if (canRunRemotely(task)) {
                runRemotely(task);
            } else {
                runLocally(task);
            }
        }
        return;
    };

 // Prototype definitions
 // ---------------------
 //
 // In JavaScript, object-oriented programming is based on prototypes rather
 // than classes. Objects inherit methods and properties _dynamically_ based on
 // the functions used to construct them, and instance methods take precedence
 // over prototype methods with the same name. Internally, Quanah uses instance
 // methods as a "private API" when manipulating avars, but it is expected that
 // users will rely almost exclusively on Quanah's "public API", which is based
 // on the following prototype methods.

    AVar.prototype.on = function (type, listener) {
     // This method provides an idiom for event-driven programming that will be
     // familiar to anyone who has ever used jQuery or Node.js. Currently, the
     // only valid `type` is "fail", but more event types may be added in the
     // future.
        return this.send("on" + type, listener);
    };

    AVar.prototype.Q = function (f) {
     // This function, affectionately called "Method Q", provides syntactic
     // sugar for "queue"-ing new tasks to transform data. It is a chainable
     // prototype method that expects a single input argument which should be
     // either a monadic (single variable) function or else a "callable object"
     // that responds to a `call` method in exactly the same way.
        return this.send("queue", f);
    };

 // Module initialization
 // ---------------------
 //
 // Add the `avar` and `sync` methods to the `quanah` "namespace" object as the
 // last step before returning it to the invoking scope. For reference, the
 // public interfaces for Quanah are specified in TypeScript in another file,
 // "src/quanah.d.ts", in the project repository.

    quanah.avar = function (val) {
     // This function enables the user to avoid the `new` keyword, which is
     // useful because object-oriented programming in JavaScript is not
     // typically well-understood by users.
        return new AVar(val);
    };

    quanah.sync = function () {
     // This function takes any number of arguments, any number of which may
     // be avars, and it outputs a new avar which acts as a "syncpoint". The
     // avar returned by this function will have its own `Q` instance method
     // which will take precedence over the `AVar.prototype.Q` method. The
     // reason for this is simple: it is a convenience method for a common
     // problem in concurrent programming, and its purpose is to shield the
     // user from the ugly business of implementing semaphores et al. Any
     // functions that are fed into the `Q` method will wait for all input
     // arguments' outstanding queues to empty before executing, and exiting
     // will allow each of the inputs to resume processing its individual queue
     // again. Also, a syncpoint can still be used as a prerequisite even when
     // the syncpoint depends on one of the other prerequisites. (Although the
     // immediate usefulness of this capability isn't obvious, it turns out to
     // be crucially important for expressing certain concurrency patterns
     // idiomatically.)
        var args, i, temp, unique, x, y;
        args = Array.prototype.slice.call(arguments);
        x = [];
        y = new AVar(args.slice());
        y.Q = function (f) {
         // This function is an instance-specific "Method Q". If that bothers
         // you, don't use it ;-)
            var count, j, pending, relay, status, wait;
            count = function () {
             // This function is a simple counting semaphore that closes over
             // some private state variables in order to delay the execution of
             // `f` until certain conditions are satisfied.
                pending -= 1;
                if ((pending === 0) && (status === "waiting")) {
                    status = "running";
                }
                return;
            };
            pending = x.length;
            relay = function () {
             // This function ensures that any failures by upstream avars are
             // communicated to the downstream syncpoint.
                status = "failed";
                return;
            };
            status = (pending === 0) ? "running" : "waiting";
            wait = function (outer) {
             // This function blocks further progress through an individual
             // avar's queue until a nested avar exits.
                var nested = new AVar(count());
                nested.send("queue", function (inner) {
                 // This function checks to see if the syncpoint has finished
                 // executing yet. If so, it releases its "parent" avar, which
                 // was locked because it was being used by the syncpoint.
                    if (status === "running") {
                        return inner.stay();
                    }
                    inner.exit();
                    return outer.exit();
                });
                return;
            };
         // NOTE: The reason for checking `status` as a condition for the `for`
         // loop is to avoid memory bloat from adding unneeded event listeners.
            for (j = 0; (j < x.length) && (status !== "failed"); j += 1) {
                if (x[j] instanceof AVar) {
                    x[j].send("onfail", relay).send("queue", wait);
                } else {
                    count();
                }
            }
         // NOTE: In the next line, an `onfail` listener is added to `y`. This
         // might be a problem for syncpoints that will be reused a lot because
         // this means that a new listener will be added on every call to the
         // instance method `Q`, and they will only be removed upon failure.
         // This could also induce memory bloat because the listeners close
         // over the other variables in this scope.
            return y.send("onfail", relay).send("queue", function (signal) {
             // This function uses closure over private state variables and the
             // input argument `f` to defer execution. This function will be
             // put into `y`'s queue, and it will not run until all of the
             // prerequisites are ready.
                if (status === "failed") {
                    signal.fail("Failed prerequisite(s) for syncpoint");
                } else if (status === "waiting") {
                    signal.stay();
                } else {
                    f.call(y, signal);
                }
                return;
            }).send("queue", function (signal) {
             // This function indirectly "releases" everything upon successful
             // completion by updating shared state in such a way that each of
             // the prerequisite avars will naturally resume execution.
                status = "done";
                return signal.exit();
            });
        };
        while (args.length > 0) {
         // This `while` loop replaces the previous `union` function, which
         // called itself recursively to create an array `x` of unique
         // prerequisites from the input arguments `args`. Instead, Quanah uses
         // an array along with a `while` loop as a means to avoid recursion,
         // because the recursion depth limit is unpredictable in JavaScript.
         // The prerequisites of syncpoints will be added, but the syncpoints
         // themselves will not be added. Performing this operation is what
         // allows Quanah to "un-nest" `sync` statements in one pass at runtime
         // without constructing a directed acyclic graph or preprocessing the
         // source code.
            temp = args.shift();
            if ((temp instanceof AVar) && (temp.hasOwnProperty("Q"))) {
             // This arm "flattens" prerequisites for array-based recursion by
             // appending copies of the `val` arrays of other syncpoints. It
             // also assumes that users will not add instance methods named "Q"
             // to avars, so that it may assume `val` will be an array.
                Array.prototype.push.apply(args, temp.val);
            } else {
             // This arm ensures that elements are unique by comparing each
             // element to be added against all previously added elements. It
             // would be much more efficient to use `Array.prototype.indexOf`,
             // but that method wasn't available until ECMAScript 5. This could
             // also be replaced by a `for` loop with an empty block, but the
             // linters would go berserk.
                for (unique = true, i = 0; unique && (i < x.length); i += 1) {
                    unique = (temp !== x[i]);
                }
                Array.prototype.push.apply(x, unique ? [temp] : []);
            }
        }
        return y;
    };

 // Exit anonymous closure #2
 // -------------------------
 //
 // Finally, having transformed the input object into a module that implements
 // Quanah's interfaces, return the module back to anonymous closure #1.

    return quanah;

}));

//- vim:set syntax=javascript:
