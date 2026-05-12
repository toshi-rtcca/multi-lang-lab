py-run:
	cd python && uv run hello_world

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts

ts-test:
	cd typescript && bun test

go-run:
	cd go && docker build -t hello-world-go . && docker run --rm hello-world-go

go-test:
	cd go && docker build -t hello-world-go . && docker run --rm hello-world-go go test -v
