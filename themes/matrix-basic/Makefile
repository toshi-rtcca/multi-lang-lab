.PHONY: test py-test ts-test go-test rs-test

test: py-test ts-test go-test rs-test

py-test:
	cd python && uv run pytest

ts-test:
	cd typescript && bun test

go-test:
	cd go && go test -v ./...

rs-test:
	cd rust && cargo test
