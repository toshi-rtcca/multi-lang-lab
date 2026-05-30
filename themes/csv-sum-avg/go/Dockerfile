FROM golang:1.24

WORKDIR /app
COPY go.mod ./
COPY *.go ./

RUN go build -o csv_sum_avg .

ENTRYPOINT ["./csv_sum_avg"]
