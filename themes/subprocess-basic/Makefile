py-run:
	cd python && uv run sort-ls-l --path ../../../shared/fixtures/subprocess-basic

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts --path ../../../shared/fixtures/subprocess-basic

ts-test:
	cd typescript && bun test

go-run:
	cd go && docker build -t subprocess-basic-go . && docker run --rm -v $(CURDIR)/../../shared:/shared subprocess-basic-go --path /shared/fixtures/subprocess-basic

go-test:
	cd go && docker build -t subprocess-basic-go . && docker run --rm --entrypoint go subprocess-basic-go test -v

rs-run:
	cd rust && docker build -t subprocess-basic-rust . && docker run --rm -v $(CURDIR)/../../shared:/shared subprocess-basic-rust --path /shared/fixtures/subprocess-basic

rs-test:
	cd rust && docker build -t subprocess-basic-rust . && docker run --rm --entrypoint cargo subprocess-basic-rust test
