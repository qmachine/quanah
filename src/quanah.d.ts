//- TypeScript definition file

//- quanah.d.ts ~~
//
//  This file contains a work-in-progress specification of Quanah's public
//  interfaces using TypeScript. In the future, I hope to integrate Quanah with
//  the DefinitelyTyped repository (http://definitelytyped.org/).
//
//                                                      ~~ (c) SRW, 14 Mar 2015
//                                                  ~~ last updated 14 Mar 2015

interface AVar {
    on(name: string, listener: Listener): AVar;
    Q(f: AVar | Transform): AVar;
    send(name: string, arg?: any): AVar;
    val: any;
}

interface Listener {
    (message?: any): void;
}

interface Quanah {
    avar(val?: any): AVar;
    canRunRemotely(task: Task): boolean;
    runRemotely(task: Task): void;
    snooze(tick: () => void): any;
    sync(... any): AVar;
}

interface Task {
    f: Transform;
    x: AVar;
}

interface Transform {
    call(that: AVar, signal: {
        exit: Listener;
        fail: Listener;
        stay: Listener;
    }): void;
}

declare module "quanah" {
    export = Quanah;
}

//- vim:set syntax=typescript:
