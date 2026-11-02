.PHONY: test py-test ts-test go-test rs-test

test: py-test ts-test go-test rs-test

py-run:
	cd python && uv run sort-ls-l --path ../../../shared/fixtures/subprocess-basic

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts --path ../../../shared/fixtures/subprocess-basic

ts-test:
	cd typescript && bun test

go-run:
	cd go && go run . --path ../../../shared/fixtures/subprocess-basic

go-test:
	cd go && go test -v ./...

rs-run:
	cd rust && cargo run -- --path ../../../shared/fixtures/subprocess-basic

rs-test:
	cd rust && cargo test
