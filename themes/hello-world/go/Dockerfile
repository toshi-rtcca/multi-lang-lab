FROM golang:1.24-alpine

WORKDIR /app

COPY go.mod ./
COPY *.go ./

RUN go build -o hello_world .

CMD ["./hello_world"]
