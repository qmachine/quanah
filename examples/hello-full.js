//- JavaScript source code

//- hello-full.js ~~
//
//  This program is _not_ a simple "Hello world" program. Instead, it serves as
//  a minimal example of the rigor with which Quanah has been designed. I don't
//  expect anyone else to code this way, but I still want to provide resources
//  for those who are or aspire to become expert-level JavaScript programmers.
//
//                                                      ~~ (c) SRW, 17 Nov 2012

(function () {
    'use strict';

 // Pragmas

    /*global puts: false */

    /*jslint indent: 4, maxlen: 80 */

 // Demonstration

    ('Hello world!').Q(function (evt) {
     // This function needs documentation.
        puts(this.val);
        return evt.exit();
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
