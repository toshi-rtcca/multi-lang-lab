FROM golang:1.24

WORKDIR /app
COPY go.mod ./
COPY *.go ./

RUN go build -o n-queens .

ENTRYPOINT ["./n-queens"]
