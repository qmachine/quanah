#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for development on the Quanah library.
#
#                                                       ~~ (c) SRW, 17 Nov 2012
#                                                   ~~ last updated 11 Feb 2015

PROJECT_ROOT    :=  $(realpath $(dir $(firstword $(MAKEFILE_LIST))))

include $(PROJECT_ROOT)/share/macros.make

NODE    :=  $(call contingent, nodejs node)
NPM     :=  $(call contingent, npm)
RM      :=  $(call contingent, grm rm) -rf

.PHONY: all clean clobber distclean reset run
.SILENT: ;

'': help;

all: run

clean: reset
	@   cd $(PROJECT_ROOT)/docs/ && $(MAKE) $@

clobber: clean

distclean: clobber
	@   $(RM) $(addprefix $(PROJECT_ROOT)/, \
                .d8_history \
                .v8_history \
                docs/_static/ \
                node_modules/ \
                npm-debug.log \
                *.tgz \
            )

help:
	@   $(call show-usage-info)

reset:
	@   $(call contingent, clear)

run: check

###

.PHONY: check test

check: $(PROJECT_ROOT)/node_modules/
	@   $(NPM) test
	@   $(NODE) $(PROJECT_ROOT)/examples/until.js

test: check

###

$(PROJECT_ROOT)/node_modules/: $(PROJECT_ROOT)/package.json
	@   $(NPM) install

###

#-  NOTE: The following rule is still experimental and should not be used in
#   production, especially if you are planning to convert the resulting output
#   back into JavaScript again for deployment. Such files might pass the unit
#   tests but still contain bugs and/or security vulnerabilities.

%.coffee: %.js
	@   $(call contingent, js2coffee) $< > $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
