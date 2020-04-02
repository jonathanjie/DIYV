FROM debian:latest

RUN export DEBIAN_FRONTEND=noninteractive

#INSTALL standard packages
RUN apt-get update && apt-get install -y yarn git curl openssh-client python3-pip

#INSTALL NODE JS
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash -
RUN apt-get install -y nodejs

#ssh
COPY docker-build/id_rsa /root/.ssh/id_rsa
RUN chmod 600 /root/.ssh/id_rsa
COPY docker-build/id_rsa /root/.ssh/id_rsa.pub
RUN chmod 600 /root/.ssh/id_rsa.pub
COPY docker-build/config /root/.ssh/config
RUN chmod 400 /root/.ssh/config

#WORKDIR
RUN mkdir /opt/projects
WORKDIR /opt/projects

COPY src diyv-rest-psemillawebhook
WORKDIR /opt/projects/diyv-rest-psemillawebhook

RUN yarn install
COMMAND node app
