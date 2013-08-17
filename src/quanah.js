//- JavaScript source code

//- quanah.js ~~
//
//  This file is also available from git.io/q.js and bit.ly/quanahjs :-P
//
//                                                      ~~ (c) SRW, 14 Nov 2012
//                                                  ~~ last updated 17 Aug 2013

(function () {
    'use strict';

 // Pragmas

    /*jshint maxparams: 1, quotmark: single, strict: true */

    /*jslint indent: 4, maxlen: 80 */

    /*properties
        Q, add_to_queue, apply, avar, call, can_run_remotely, comm, concat,
        configurable, def, defineProperty, done, epitaph, exit, exports, f,
        fail, hasOwnProperty, key, length, on, onerror, prototype, push, queue,
        random, ready, revive, run_remotely, shift, slice, stay, toString,
        unshift, val, value, valueOf, when, writable, x
    */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q')) {
     // Exit early if Quanah's "Method Q" is already present.
        return;
    }

 // Declarations

    var AVar, avar, can_run_remotely, def, is_Function, queue, revive,
        run_locally, run_remotely, user_defs, uuid, when;

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
        that.comm = function comm(obj) {
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
             // task queue (`queue`). Because retriggering execution by sending
             // `done` messages recursively requires a lot of extra overhead,
             // we'll just go ahead and retrigger execution directly.
                if (is_Function(args[0])) {
                    state.queue.push(args[0]);
                    if (state.ready === true) {
                        state.ready = false;
                        queue.unshift({f: state.queue.shift(), x: that});
                    }
                } else if (args[0] instanceof AVar) {
                    when(args[0], that).Q(function (evt) {
                     // This function allows Quanah to postpone execution of
                     // the given task until both `f` and `x` are ready. The
                     // following line is given in the form `f.call(x, evt)`.
                        (this.val[0].val).call(this.val[1], evt);
                        return;
                    });
                } else {
                    comm({'fail': 'Transformation must be a function.'});
                }
                break;
            case 'done':
             // A computation involving this avar has succeeded, and we will
             // now prepare to run the next computation that depends on it by
             // transferring it from the avar's individual queue into the
             // global `queue` used by the `revive` function.
                state.ready = true;
                if (state.queue.length > 0) {
                    state.ready = false;
                    queue.unshift({f: state.queue.shift(), x: that});
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
                        comm({'fail': state.epitaph});
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
             // that involved calling `comm` without any arguments.
                comm({'fail': 'Invalid `comm` message "' + message + '"'});
            }
            return revive();
        };
        if (that.hasOwnProperty('key') === false) {
            that.key = uuid();
        }
        if (that.hasOwnProperty('val') === false) {
            that.val = null;
        }
     // At this point, we will never use `key` or `obj` again, and the `comm`
     // instance method shadows those names, but I'm not sure if we need to
     // destroy the references ourselves explicitly for garbage collection ...
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

    is_Function = function (f) {
     // This function returns `true` only if and only if the input argument
     // `f` is a function. The second condition is necessary to avoid a false
     // positive when `f` is a regular expression. Please note that an avar
     // whose `val` property is a function will still return `false`.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    queue = [];

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
                    queue.push(obj);
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

    user_defs = {
        can_run_remotely:   null,
        run_remotely:       null
    };

    uuid = function () {
     // This function generates random hexadecimal strings of length 32. These
     // strings don't satisfy RFC 4122 or anything, but they're conceptually
     // the same as UUIDs.
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

    when = function () {
     // This function takes any number of arguments, any number of which may
     // be avars, and outputs a special "compound" avar whose `val` property is
     // an array of the original input arguments. The compound avar also has a
     // slightly modified form of `Object.prototype.Q` placed directly onto it
     // as an instance method; this provides a nice way of distinguishing a
     // "normal" avar from a compound one. It no longer creates the instance
     // methods `isready`/`areready` because, even though those were really
     // pretty and had a nice interpretation in English, the use of setters was
     // confusing to many of my peers. Any functions that are fed into the `Q`
     // method will wait for all input arguments' outstanding queues to empty
     // before executing, and exiting will allow each of the inputs to begin
     // working through its individual queue again. Also, a compound avar can
     // still be used as a prerequisite to execution even when the compound
     // avar depends on one of the other prerequisites, and although the
     // immediate usefulness of this ability may not be obvious, it will turn
     // out to be crucially important for expressing certain concurrency
     // patterns idiomatically :-)
     //
     // NOTE: What happens here if an avar which has already failed is used in
     // a `when` statement? Does the `when` fail immediately, as expected?
     //
     // NOTE: The instance method `Q` that gets added to a compound avar is not
     // a perfect substitute for the instance `comm` method it already has ...
     //
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
                y.comm({'add_to_queue': f});
                return y;
            }
            var blocker, count, egress, i, m, n, ready;
            blocker = function (evt) {
             // This function stores the `evt` argument into an array so we can
             // prevent further execution involving `val` until after we call
             // the input argument `f`.
                egress.push(evt);
                return count();
            };
            count = function () {
             // This function is a simple counting semaphore that closes over
             // some private state variables in order to delay the execution of
             // `f` until certain conditions are satisfied.
                m += 1;
                if (m === n) {
                    ready = true;
                }
                return revive();
            };
            egress = [];
            m = 0;
            n = x.length;
            ready = false;
            for (i = 0; i < n; i += 1) {
                if (x[i] instanceof AVar) {
                    x[i].Q(blocker);
                } else {
                    count();
                }
            }
            y.comm({'add_to_queue': function (evt) {
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
                 // all of the original arguments given to `when`.
                    exit: function (message) {
                     // This function signals successful completion :-)
                        var i, n;
                        for (i = 0, n = egress.length; i < n; i += 1) {
                            egress[i].exit(message);
                        }
                        return evt.exit(message);
                    },
                    fail: function (message) {
                     // This function signals a failed execution :-(
                        var i, n;
                        for (i = 0, n = egress.length; i < n; i += 1) {
                            egress[i].fail(message);
                        }
                        return evt.fail(message);
                    },
                    stay: function (message) {
                     // This function postpones execution temporarily.
                        var i, n;
                        for (i = 0, n = egress.length; i < n; i += 1) {
                            egress[i].stay(message);
                        }
                        return evt.stay(message);
                    }
                });
                return;
            }});
            return y;
        };
        return y;
    };

 // Prototype definitions

    AVar.prototype.on = function () {
     // This function's only current use is to allow users to set custom error
     // handlers, but by mimicking the same idiom used by jQuery and Node.js, I
     // am hoping to leave myself plenty of room to grow later :-)
        this.comm({'on': Array.prototype.slice.call(arguments)});
        return this;
    };

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

    (function (method_Q) {
     // This function uses ES5.1 property descriptors if they are available in
     // order to hide "Method Q" from `for .. in` loops. I did this originally
     // as an attempt to reduce conflicts with jQuery et al., but it also has
     // security implications that I will need to revisit in the near future.
        if (Object.hasOwnProperty('defineProperty')) {
            Object.defineProperty(Object.prototype, 'Q', {
             // NOTE: ES5.1 property descriptors' values default to `false`.
                configurable: true,
                //enumerable: false,
                writable: true,
                value: method_Q
            });
        } else {
            Object.prototype.Q = method_Q;
        }
        return;
    }(function method_Q(f) {
     // This function acts as a "namespace" for Quanah as well as its most
     // important syntactic sugar -- "Method Q". This function can be used as
     // a method of any native value except `null` or `undefined`. It expects
     // its argument to be a function of a single variable or else an avar with
     // such a function as its `val`.
        if (Object.prototype.Q !== method_Q) {
            throw new Error('"Method Q" is not available.');
        }
        var x = (this instanceof AVar) ? this : avar({val: this});
        x.comm({'add_to_queue': f});
        return x;
    }));

    Object.prototype.Q.avar = avar;

    Object.prototype.Q.def = def;

    Object.prototype.Q.when = when;

    (function () {
     // This function runs in Node.js, PhantomJS, and RingoJS, which means it
     // may work with other CommonJS-ish package loaders, too. I am not certain
     // whether this function adds much value, however, because the mere act of
     // loading Quanah loads "Method Q" anyway ...
        /*jslint node: true */
        if (typeof module === 'object') {
            module.exports = Object.prototype.Q;
        }
        return;
    }());

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
