#-  GNU Makefile

#-  Makefile ~~
#
#   This contains live instructions for development on the Quanah module.
#
#                                                       ~~ (c) SRW, 17 Nov 2012
#                                                   ~~ last updated 16 Mar 2015

PROJECT_ROOT    :=  $(realpath $(dir $(firstword $(MAKEFILE_LIST))))

include $(PROJECT_ROOT)/share/macros.make

FIND    :=  $(call contingent, find)
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
	@   $(FIND) $(PROJECT_ROOT) -type f -name '.[dv]8_history' \
                -exec $(RM) {} +

distclean: clobber
	@   $(RM) $(addprefix $(PROJECT_ROOT)/, \
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

#-  NOTE: The following rule is experimental, but then again, if you're reading
#   a Makefile, you probably understand the "risks" of using experimental code
#   in production :-P

%.coffee: %.js
	@   $(call contingent, js2coffee) $< > $@                       ;   \
            echo '#- vim:set syntax=coffee:' >> $@

###

%:
	@   $(call alert, 'No target "$@" found.')

#-  vim:set syntax=make:
