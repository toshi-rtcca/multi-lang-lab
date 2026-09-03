py-run:
	cd python && uv run n-queens --n 8

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts --n 8

ts-test:
	cd typescript && bun test

go-run:
	cd go && docker build -t n-queens-go . && docker run --rm n-queens-go --n 8

go-test:
	cd go && docker build -t n-queens-go . && docker run --rm --entrypoint go n-queens-go test -v

rs-run:
	cd rust && docker build -t n-queens-rust . && docker run --rm n-queens-rust --n 8

rs-test:
	cd rust && docker build -t n-queens-rust . && docker run --rm --entrypoint cargo n-queens-rust test
