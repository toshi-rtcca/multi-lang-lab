.PHONY: test py-test ts-test go-test rs-test

test: py-test ts-test go-test rs-test

py-run:
	cd python && uv run reverse_string $(INPUT)

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts $(INPUT)

ts-test:
	cd typescript && bun test

go-run:
	cd go && go run . $(INPUT)

go-test:
	cd go && go test -v ./...

rs-run:
	cd rust && cargo run -- $(INPUT)

rs-test:
	cd rust && cargo test
