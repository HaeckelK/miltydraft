FROM php:latest

ARG UID=1000
ARG GID=1000
RUN addgroup --gid $GID appuser \
    && useradd -u $UID --gid $GID -m appuser

RUN apt-get update
RUN apt-get install unzip -y

RUN mkdir /app

RUN curl -sS https://getcomposer.org/installer -o /tmp/composer-setup.php
RUN HASH=`curl -sS https://composer.github.io/installer.sig` && \
    php -r "if (hash_file('SHA384', '/tmp/composer-setup.php') === '$HASH') { echo 'Installer verified'; } else { echo 'Installer corrupt'; unlink('composer-setup.php'); } echo PHP_EOL;"

RUN php /tmp/composer-setup.php --install-dir=/usr/local/bin --filename=composer

WORKDIR /app

# TODO I had to manually mkdir /app/drafts, and composer install once running
# because the composer directory is /app so disk mount is overwriting it
COPY ./src/composer.json /app

RUN chown -R appuser:appuser /app

USER appuser

RUN composer install

# TODO because I'm not using an apache server you need to go to
# http://localhost:8000/draft.php?id=X to get the draft page to work

# TODO docker run --rm -p 8444:8000 -v ${PWD}/src:/app delete-me

CMD ["php", "-S", "0.0.0.0:8000"]
