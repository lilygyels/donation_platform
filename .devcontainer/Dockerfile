ARG VARIANT="18-bullseye"
FROM mcr.microsoft.com/vscode/devcontainers/javascript-node:0-${VARIANT}
RUN apt-get update
RUN apt-get -y install curl gnupg
#Install Ping
RUN apt-get install iputils-ping -y
#Install Docker CLI
RUN apt-get -y install \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg-agent \
    software-properties-common
RUN curl -fsSL https://download.docker.com/linux/debian/gpg | apt-key add -
RUN apt-key fingerprint 0EBFCD88
RUN add-apt-repository \
    "deb [arch=amd64] https://download.docker.com/linux/debian \
    $(lsb_release -cs) \
    stable"
RUN apt-get update
RUN apt-get -y install docker-ce-cli
# Install Heroku-CLI
RUN curl https://cli-assets.heroku.com/install-ubuntu.sh | sh
RUN npm install -g babel-runtime
RUN npm install -g truffle@5.3.4
RUN npm install -g @truffle/hdwallet-provider
RUN npm install -g web3