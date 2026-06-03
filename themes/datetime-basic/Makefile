py-run:
	cd python && uv run datetime_basic --input-date 2024-01-15

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts --input-date 2024-01-15

ts-test:
	cd typescript && bun test

go-run:
	cd go && docker build -t datetime-basic-go . && docker run --rm datetime-basic-go --input-date 2024-01-15

go-test:
	cd go && docker build -t datetime-basic-go . && docker run --rm --entrypoint go datetime-basic-go test -v

rs-run:
	cd rust && docker build -t datetime-basic-rust . && docker run --rm datetime-basic-rust --input-date 2024-01-15

rs-test:
	cd rust && docker build -t datetime-basic-rust . && docker run --rm --entrypoint cargo datetime-basic-rust test
