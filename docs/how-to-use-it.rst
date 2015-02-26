How to use it
=============


Loading the module
------------------

Quanah_ is versatile enough to run in any JavaScript environment, but it can be
tricky to figure out how to do it in a given environment. While by no means
exhaustive, the following directions cover most of the common environments. The
main idea is to demonstrate how to load Quanah and store a reference to it as
``quanah``.


.. Adobe / Mozilla Tamarin shell
.. ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
.. (coming soon)


ArangoDB shell
~~~~~~~~~~~~~~

.. code-block:: javascript

    var quanah = require("quanah");


.. CouchDB
.. ~~~~~~~
.. (coming soon)


Google D8 / V8 shells
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    load("quanah.js");
    var quanah = QUANAH;


.. io.js
.. ~~~~~
.. (coming soon)


JavaScriptCore shell
~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    load("quanah.js");
    var quanah = QUANAH;


jrunscript
~~~~~~~~~~

.. code-block:: javascript

    load("quanah.js");
    var quanah = QUANAH;


MongoDB shell
~~~~~~~~~~~~~

.. code-block:: javascript

    load("quanah.js");
    var quanah = QUANAH;


Mozilla Rhino
~~~~~~~~~~~~~

.. code-block:: javascript

    load("quanah.js");
    var quanah = QUANAH;


Mozilla Spidermonkey shell
~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: javascript

    load("quanah.js");
    var quanah = QUANAH;


Node.js
~~~~~~~

.. code-block:: javascript

    var quanah = require("./quanah");


PhantomJS
~~~~~~~~~

.. code-block:: javascript

    var quanah = require("./quanah");


RingoJS
~~~~~~~

.. code-block:: javascript

    var quanah = require("./quanah");


Web browsers
~~~~~~~~~~~~

Browsers can be the easiest or hardest to load external code with, depending on
the strategy that you choose. The easiest route is to add one line to an HTML
page:

.. code-block:: html

    <script src="quanah.js"></script>

Then, the programs that use Quanah should be loaded in the same way, by lines
that occur later in the page. To reference Quanah, those programs only need to
contain the following:

.. code-block:: javascript

    var quanah = QUANAH;

To load Quanah dynamically is more complicated, and it demonstrates nicely why
Quanah itself is so useful:

.. code-block:: javascript

    var script = document.createElement("script");
    script.onload = function () {
        var quanah = QUANAH;
     // (your code goes here)
    };
    script.src = "quanah.js";
    document.body.appendChild(script);

The problem with the second strategy is that it requires some extra knowledge
about asynchronous programming, which is precisely what Quanah was originally
designed to simplify.


.. ----------------------------
.. include:: external-links.rst

