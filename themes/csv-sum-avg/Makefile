.PHONY: test py-test ts-test go-test rs-test

test: py-test ts-test go-test rs-test

py-run:
	cd python && uv run csv_sum_avg --input-csv ../../../shared/fixtures/csv-sum-avg.csv --output-csv /tmp/csv-sum-avg-output.csv && cat /tmp/csv-sum-avg-output.csv

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts --input-csv ../../../shared/fixtures/csv-sum-avg.csv --output-csv /tmp/csv-sum-avg-output.csv && cat /tmp/csv-sum-avg-output.csv

ts-test:
	cd typescript && bun test

go-run:
	cd go && go run . --input-csv ../../../shared/fixtures/csv-sum-avg.csv --output-csv /tmp/csv-sum-avg-output.csv && cat /tmp/csv-sum-avg-output.csv

go-test:
	cd go && go test -v ./...

rs-run:
	cd rust && cargo run -- --input-csv ../../../shared/fixtures/csv-sum-avg.csv --output-csv /tmp/csv-sum-avg-output.csv && cat /tmp/csv-sum-avg-output.csv

rs-test:
	cd rust && cargo test
