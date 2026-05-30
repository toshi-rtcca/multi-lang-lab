py-run:
	cd python && uv run csv_sum_avg --input-csv ../../../shared/fixtures/csv-sum-avg.csv --output-csv /tmp/csv-sum-avg-output.csv && cat /tmp/csv-sum-avg-output.csv

py-test:
	cd python && uv run pytest

ts-run:
	cd typescript && bun run src/main.ts --input-csv ../../../shared/fixtures/csv-sum-avg.csv --output-csv /tmp/csv-sum-avg-output.csv && cat /tmp/csv-sum-avg-output.csv

ts-test:
	cd typescript && bun test

go-run:
	cd go && docker build -t csv-sum-avg-go . && docker run --rm -v $(CURDIR)/../../shared:/shared -v /tmp:/tmp csv-sum-avg-go --input-csv /shared/fixtures/csv-sum-avg.csv --output-csv /tmp/csv-sum-avg-output.csv && cat /tmp/csv-sum-avg-output.csv

go-test:
	cd go && docker build -t csv-sum-avg-go . && docker run --rm --entrypoint go csv-sum-avg-go test -v

rs-run:
	cd rust && docker build -t csv-sum-avg-rust . && docker run --rm -v $(CURDIR)/../../shared:/shared -v /tmp:/tmp csv-sum-avg-rust --input-csv /shared/fixtures/csv-sum-avg.csv --output-csv /tmp/csv-sum-avg-output.csv && cat /tmp/csv-sum-avg-output.csv

rs-test:
	cd rust && docker build -t csv-sum-avg-rust . && docker run --rm --entrypoint cargo csv-sum-avg-rust test
