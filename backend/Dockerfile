FROM node:16

RUN apt-get update -qq && \
  apt-get install -y --fix-missing \
    libssl-dev openssl make gcc

# Download and build Python 3.7.12
WORKDIR /opt
RUN wget https://www.python.org/ftp/python/3.7.12/Python-3.7.12.tgz && \
  tar zxvf Python-3.7.12.tgz

WORKDIR /opt/Python-3.7.12
RUN ./configure &&  \
  make && make install && \
  ln -fs /opt/Python-3.7.12/Python /usr/bin/python3.7

WORKDIR /app

# Install pip dependencies
COPY requirements.txt .
RUN python3.7 -m pip install -r requirements.txt

# Install Node project dependencies
COPY package.json .
COPY yarn.lock .

COPY . .

RUN yarn install

RUN yarn run typeorm migration:run

EXPOSE 80

CMD ["yarn", "start"]
