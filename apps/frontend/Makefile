#	Install dependencies: npm install --save-dev esbuild typescript

SRC		:=	src/main.ts
RM		:=	rm -rf

OUT_DIR	:=	dist
BUNDLE	:=	$(OUT_DIR)/bundle.js

MODULES	:=	node_modules

.PHONY: all build clean

all: build

build: $(BUNDLE)

$(OUT_DIR): $(MODULES)
	mkdir -p $(OUT_DIR)
	cp node_modules/@babylonjs/havok/lib/umd/HavokPhysics.wasm $(OUT_DIR)/HavokPhysics.wasm

$(MODULES):
	npm install --save babylonjs @babylonjs/core @babylonjs/havok @babylonjs/gui

$(BUNDLE): $(MODULES) $(OUT_DIR) $(SRC)
	npx esbuild $(SRC) --bundle --outfile=$(BUNDLE) --platform=browser

clean:
	$(RM) $(OUT_DIR)

fclean: clean
	$(RM) $(MODULES)

re: clean all
fullre: fclean all
