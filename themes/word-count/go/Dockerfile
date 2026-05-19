FROM golang:1.24

WORKDIR /app
COPY go.mod ./
COPY *.go ./

RUN go build -o word_count .

ENTRYPOINT ["./word_count"]
