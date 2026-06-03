FROM golang:1.24

WORKDIR /app
COPY go.mod ./
COPY *.go ./

RUN go build -o datetime_basic .

ENTRYPOINT ["./datetime_basic"]
