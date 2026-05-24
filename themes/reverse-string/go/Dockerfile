FROM golang:1.24-alpine

WORKDIR /app

COPY go.mod ./
COPY *.go ./

RUN go mod tidy
RUN go build -o reverse_string .

ENTRYPOINT ["./reverse_string"]
