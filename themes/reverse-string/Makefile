py-run:
	cd python && uv run reverse_string $(INPUT)

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts $(INPUT)

ts-test:
	cd typescript && bun test

go-run:
	cd go && docker build -t reverse-string-go . && docker run --rm reverse-string-go $(INPUT)

go-test:
	cd go && docker build -t reverse-string-go . && docker run --rm reverse-string-go go test -v

rs-run:
	cd rust && docker build -t reverse-string-rust . && docker run --rm reverse-string-rust $(INPUT)

rs-test:
	cd rust && docker build -t reverse-string-rust . && docker run --rm reverse-string-rust cargo test
