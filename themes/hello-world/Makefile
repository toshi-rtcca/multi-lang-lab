.PHONY: test py-test ts-test go-test rs-test

test: py-test ts-test go-test rs-test

py-run:
	cd python && uv run hello_world

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts

ts-test:
	cd typescript && bun test

go-run:
	cd go && go run .

go-test:
	cd go && go test -v ./...

rs-run:
	cd rust && cargo run

rs-test:
	cd rust && cargo test
