# Build from the theme root: docker build -f go/Dockerfile .
FROM golang:1.24

COPY cases.json /cases.json
WORKDIR /app
COPY go/go.mod ./
COPY go/*.go ./

ENTRYPOINT ["go", "test", "-v", "./..."]
