FROM debian:bookworm

WORKDIR /app/

RUN apt update -y
RUN apt full-upgrade -y
RUN apt install cmake wget git gcc g++ -y 

RUN wget https://go.dev/dl/go1.22.1.linux-amd64.tar.gz
RUN rm -rf /usr/local/go && tar -C /usr/local -xzf go1.22.1.linux-amd64.tar.gz
ENV PATH=$PATH:/usr/local/go/bin

ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_ORIGINS=http://192.168.1.11,http://192.168.1.22

COPY . .

RUN go generate ./...
RUN go build .

CMD [ "go","run","main.go","serve" ]
