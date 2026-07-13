FROM golang:1.24

WORKDIR /app
COPY go.mod ./
COPY *.go ./

RUN go build -o sort-ls-l .

ENTRYPOINT ["./sort-ls-l"]

