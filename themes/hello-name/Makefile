.PHONY: test py-test ts-test go-test rs-test

test: py-test ts-test go-test rs-test

py-run:
	cd python && uv run hello_name $(if $(NAME),--name=$(NAME),)

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts $(if $(NAME),--name=$(NAME),)

ts-test:
	cd typescript && bun test

go-run:
	cd go && go run . $(if $(NAME),--name=$(NAME),)

go-test:
	cd go && go test -v ./...

rs-run:
	cd rust && cargo run -- $(if $(NAME),--name=$(NAME),)

rs-test:
	cd rust && cargo test
