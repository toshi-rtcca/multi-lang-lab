.PHONY: test py-test ts-test go-test rs-test

test: py-test ts-test go-test rs-test

py-test:
	cd python && uv run pytest

ts-test:
	cd typescript && bun test

# Go and Rust build from the theme root so the image can include cases.json.
go-test:
	docker build -t http-get-go -f go/Dockerfile . && docker run --rm http-get-go

rs-test:
	docker build -t http-get-rust -f rust/Dockerfile . && docker run --rm http-get-rust
