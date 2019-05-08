FROM ubuntu:18.04

ARG TRAVIS_COMMIT
ARG TRAVIS_TAG

COPY . /app

ENV DEBIAN_FRONTEND noninteractive
ENV FORCE_COLOR 1

# dependecies:
# - build-essential: compiling with node-gyp
# - gdebi-core: installing chrome
# - wget: to get stuff, duh
# - curl: also to get stuff
# - xvfb: to run headless electron tests
# - gnupg: apparently needed to run node
# - chrome: too lazy to figure out electron dependencies
# - node: for testing things

RUN apt update -qq
RUN apt install --yes -qq build-essential gdebi-core wget xvfb curl gnupg
RUN wget -q https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
RUN gdebi --non-interactive --quiet google-chrome-stable_current_amd64.deb
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash \
    && apt install --yes nodejs

RUN node -v
RUN npm -v

WORKDIR /app

RUN npm ci --unsafe-perm
RUN npm run citest
RUN npm run package -- --version $TRAVIS_COMMIT --tag $TRAVIS_TAG --upload

FROM ubuntu:18.04

COPY --from=0 /app/dist /dist