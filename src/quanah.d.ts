//- TypeScript 1.4 source code

//- quanah.d.ts ~~
//
//  This file defines Quanah as an "ambient external module" for TypeScript :-)
//
//                                                      ~~ (c) SRW, 13 Mar 2015
//                                                  ~~ last updated 20 Mar 2015

declare module "quanah" {

    interface AVar {
        on(name: string, listener: (message?: any) => void): AVar;
        Q(f: AVar | Transform): AVar;
        send(name: string, arg: any): AVar;
        val: any;
    }

    interface Task {
        f: Transform;
        x: AVar;
    }

    interface Transform {
        call(that: AVar, signal: {
            exit: (message?: any) => void;
            fail: (message?: any) => void;
            stay: (message?: any) => void;
        }): void;
    }

    function avar(val?: any): AVar;
    function canRunRemotely(task: Task): boolean;           // user-provided
    function runRemotely(task: Task): void;                 // user-provided
    function snooze(tick: () => void): void;                // user-provided
    function sync(... any): AVar;

}

//- vim:set syntax=typescript:
