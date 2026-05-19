py-run:
	cd python && uv run hello_name $(if $(NAME),--name=$(NAME),)

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts $(if $(NAME),--name=$(NAME),)

ts-test:
	cd typescript && bun test

go-run:
	cd go && docker build -t hello-name-go . && docker run --rm hello-name-go $(if $(NAME),--name=$(NAME),)

go-test:
	cd go && docker build -t hello-name-go . && docker run --rm hello-name-go go test -v

rs-run:
	cd rust && docker build -t hello-name-rust . && docker run --rm hello-name-rust $(if $(NAME),--name=$(NAME),)

rs-test:
	cd rust && docker build -t hello-name-rust . && docker run --rm hello-name-rust cargo test
