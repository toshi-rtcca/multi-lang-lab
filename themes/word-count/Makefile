py-run:
	cd python && uv run word_count --input ../../../shared/fixtures/word-count.txt

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts --input ../../../shared/fixtures/word-count.txt

ts-test:
	cd typescript && bun test

go-run:
	cd go && docker build -t word-count-go . && docker run --rm -v $(CURDIR)/../../shared:/shared word-count-go --input /shared/fixtures/word-count.txt

go-test:
	cd go && docker build -t word-count-go . && docker run --rm --entrypoint go word-count-go test -v
