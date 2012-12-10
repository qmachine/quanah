//- JavaScript source code

//- quanah.js ~~
//                                                      ~~ (c) SRW, 14 Nov 2012
//                                                  ~~ last updated 06 Dec 2012

(function () {
    'use strict';

 // Pragmas

    /*jslint indent: 4, maxlen: 80 */

    /*properties
        Q, add_to_queue, apply, avar, call, can_run_remotely, comm, concat,
        def, done, epitaph, exit, exports, f, fail, hasOwnProperty, key,
        length, on, onerror, prototype, push, queue, random, ready, revive,
        run_remotely, shift, slice, stay, toString, unshift, val, valueOf,
        when, x
    */

 // Prerequisites

    if (Object.prototype.hasOwnProperty('Q') === true) {
        return;
    }

 // Declarations

    var AVar, avar, can_run_remotely, def, is_Function, quanah, queue, revive,
        run_locally, run_remotely, user_defs, uuid, when;

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
            var args, key, message;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) {
                    args = [].concat(obj[key]);
                    message = key;
                }
            }
            if (args === undefined) {
                return;
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
                     // the given task until both `f` and `x` are ready.
                        var f, x;
                        f = this.val[0].val;
                        x = this.val[1];
                        f.call(x, evt);
                        return;
                    });
                } else {
                    that.comm({fail: 'Transformation must be a function.'});
                }
                break;
            case 'done':
             // A computation involving this avar has succeeded, and we will
             // now prepare to run the next computation that depends on it by
             // transferring it into the `revive` queue.
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
                        that.comm({fail: state.epitaph});
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
             // else a user is re-programming Quanah's guts; in both cases, it
             // is probably useful to capture the error ...
                that.comm({fail: 'Invalid `comm` message "' + message + '"'});
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
     // This function needs documentation.
        return new AVar(obj);
    };

    can_run_remotely = function (task) {
     // This function needs documentation.
        return ((is_Function(user_defs.can_run_remotely))   &&
                (is_Function(user_defs.run_remotely))       &&
                (user_defs.can_run_remotely(task)));
    };

    def = function (obj) {
     // This function needs documentation.
        var key;
        for (key in obj) {
            if ((obj.hasOwnProperty(key)) && (user_defs[key] === null)) {
                user_defs[key] = obj[key];
            }
        }
        return;
    };

    is_Function = function (f) {
     // This function needs documentation.
        return ((typeof f === 'function') && (f instanceof Function));
    };

    quanah = function (f) {
     // This function acts as the "namespace" for Quanah, but it is far
     // more useful when assigned to `Object.prototype.Q`, because then
     // it can be used as a method of any native value except `null` and
     // `undefined`. It expects its argument to be a function of a single
     // variable or else an avar whose `val` property is such a function.
        var x = (this instanceof AVar) ? this : avar({val: this});
        x.comm({'add_to_queue': f});
        return x;
    };

    queue = [];

    revive = function () {
     // This function needs documentation.
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
     // This function needs documentation.
        user_defs.run_remotely(task);
        return;
    };

    user_defs = {
        can_run_remotely:   null,
        run_remotely:       null
    };

    uuid = function () {
     // This function generates random hexadecimal UUIDs of length 32.
        var y = Math.random().toString(16);
        if (y.length === 1) {
         // This shouldn't ever happen in JavaScript, but Adobe/Mozilla Tamarin
         // has some weird quirks due to its ActionScript roots.
            y = '';
            while (y.length < 32) {
                y += (Math.random() * 1e16).toString(16);
            }
            y = y.slice(0, 32);
        } else {
         // Every other JS implementation I have tried will use this instead.
            y = y.slice(2, 32);
            while (y.length < 32) {
                y += Math.random().toString(16).slice(2, 34 - y.length);
            }
        }
        return y;
    };

    when = function () {
     // This function needs documentation.
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
                flag = true;
                for (i = 0; (flag === true) && (i < x.length); i += 1) {
                    flag = (temp !== x[i]);
                }
                if (flag === true) {
                    x.push(temp);
                }
            }
        }
        y.Q = function (f) {
         // This function needs documentation.
            if (f instanceof AVar) {
                y.comm({add_to_queue: f});
                return y;
            }
            var blocker, count, egress, i, m, n, ready;
            blocker = function (evt) {
             // This function needs documentation.
                egress.push(evt);
                count();
                return;
            };
            count = function () {
             // This function needs documentation.
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
         // NOTE: Do not change `x.length` to `n` in the next line!
            for (i = 0; i < n; i += 1) {
                if (x[i] instanceof AVar) {
                    x[i].Q(blocker);
                } else {
                    count();
                }
            }
            y.comm({add_to_queue: function (evt) {
             // This function uses closure over private state variables and the
             // input argument `f` to delay execution and to run `f` with a
             // modified version of the `evt` argument it will receive. This
             // function will be put into `y`'s queue, but it won't not run
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
                        n = egress.length;
                        for (i = 0; i < n; i += 1) {
                            egress[i].exit(message);
                        }
                        return evt.exit(message);
                    },
                    fail: function (message) {
                     // This function signals a failed execution :-(
                        var i, n;
                        n = egress.length;
                        for (i = 0; i < n; i += 1) {
                            egress[i].fail(message);
                        }
                        return evt.fail(message);
                    },
                    stay: function (message) {
                     // This function delays execution until later.
                        var i, n;
                        n = egress.length;
                        for (i = 0; i < n; i += 1) {
                            egress[i].stay(message);
                        }
                        return evt.stay(message);
                    }
                });
                return;                 //- NOTE: I removed an extra `revive`.
            }});
            return y;
        };
        return y;
    };

 // Prototype definitions

    AVar.prototype.on = function () {
     // This function needs documentation.
        this.comm({'on': Array.prototype.slice.call(arguments)});
        return this;
    };

    AVar.prototype.revive = function () {
     // This function is syntactic sugar for triggering a `revive` from code
     // external to this giant anonymous closure. Currently, the same effect
     // can be achieved by invoking `x.comm()` for some avar `x`, but that
     // technique is deprecated.
        return revive();
    };

    AVar.prototype.toString = function () {
     // This function delegates to the avar's `val` property if possible.
        if ((this.val === null) || (this.val === undefined)) {
            return this.val;
        }
        return this.val.toString.apply(this.val, arguments);
    };

    AVar.prototype.valueOf = function () {
     // This function delegates to the avar's `val` property if possible.
        if ((this.val === null) || (this.val === undefined)) {
            return this.val;
        }
        return this.val.valueOf.apply(this.val, arguments);
    };

 // Out-of-scope definitions

    Object.prototype.Q = quanah;

    Object.prototype.Q.avar = avar;

    Object.prototype.Q.def = def;

    Object.prototype.Q.when = when;

    (function () {
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
