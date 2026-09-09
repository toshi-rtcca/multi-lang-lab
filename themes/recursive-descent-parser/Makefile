py-run:
	cd python && uv run recursive-descent-parser "1 + 2 * (3 - 4)"

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts "1 + 2 * (3 - 4)"

ts-test:
	cd typescript && bun test

go-run:
	cd go && docker build -t recursive-descent-parser-go . && docker run --rm recursive-descent-parser-go "1 + 2 * (3 - 4)"

go-test:
	cd go && docker build -t recursive-descent-parser-go . && docker run --rm --entrypoint go recursive-descent-parser-go test -v

rs-run:
	cd rust && docker build -t recursive-descent-parser-rust . && docker run --rm recursive-descent-parser-rust "1 + 2 * (3 - 4)"

rs-test:
	cd rust && docker build -t recursive-descent-parser-rust . && docker run --rm --entrypoint cargo recursive-descent-parser-rust test
