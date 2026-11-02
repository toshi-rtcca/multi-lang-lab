.PHONY: test py-test ts-test go-test rs-test

test: py-test ts-test go-test rs-test

py-run:
	cd python && uv run n-queens --n 8

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts --n 8

ts-test:
	cd typescript && bun test

go-run:
	cd go && go run . --n 8

go-test:
	cd go && go test -v ./...

rs-run:
	cd rust && cargo run -- --n 8

rs-test:
	cd rust && cargo test
