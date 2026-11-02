.PHONY: test py-test ts-test go-test rs-test

test: py-test ts-test go-test rs-test

py-run:
	cd python && uv run recursive-descent-parser "1 + 2 * (3 - 4)"

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts "1 + 2 * (3 - 4)"

ts-test:
	cd typescript && bun test

go-run:
	cd go && go run . "1 + 2 * (3 - 4)"

go-test:
	cd go && go test -v ./...

rs-run:
	cd rust && cargo run -- "1 + 2 * (3 - 4)"

rs-test:
	cd rust && cargo test
