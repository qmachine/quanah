//- JavaScript source code

//- hello-full.js ~~
//
//  This program is _not_ a simple "Hello world" program. Instead, it serves as
//  a minimal example of the rigor with which Quanah has been designed. I don't
//  expect anyone else to code this way, but I still want to provide resources
//  for those who are or aspire to become expert-level JavaScript programmers.
//
//                                                      ~~ (c) SRW, 17 Nov 2012
//                                                  ~~ last updated 24 Nov 2014

(function () {
    'use strict';

 // Pragmas

    /*global puts: false, QUANAH: false */

    /*jslint indent: 4, maxlen: 80 */

 // Declarations

    var avar, x;

 // Definitions

    avar = QUANAH.avar;

    x = avar('Hello world!');

 // Demonstration

    x.Q(function (evt) {
     // This function needs documentation.
        puts(this.val);
        return evt.exit();
    }).on('error', function (message) {
     // This function needs documentation.
        throw new Error(message);
    });

 // That's all, folks!

    return;

}());

//- vim:set syntax=javascript:
