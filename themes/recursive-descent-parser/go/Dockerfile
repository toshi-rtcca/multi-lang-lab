FROM golang:1.24

WORKDIR /app
COPY go.mod ./
COPY *.go ./

RUN go build -o recursive-descent-parser .

ENTRYPOINT ["./recursive-descent-parser"]
