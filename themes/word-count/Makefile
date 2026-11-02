.PHONY: test py-test ts-test go-test rs-test

test: py-test ts-test go-test rs-test

py-run:
	cd python && uv run word_count --input ../../../shared/fixtures/word-count.txt

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts --input ../../../shared/fixtures/word-count.txt

ts-test:
	cd typescript && bun test

go-run:
	cd go && go run . --input ../../../shared/fixtures/word-count.txt

go-test:
	cd go && go test -v ./...

rs-run:
	cd rust && cargo run -- --input ../../../shared/fixtures/word-count.txt

rs-test:
	cd rust && cargo test
