
#  Сервис планирования подарков 'Wishlist'. Backend  

##  Description

Сервис "Wishlist" позволяет создавать вишлисты (списки подарков, которые пользователи хотели бы получить), а для друзей пользователя -- резервировать подарки. Кроме того, сервис является платформой для публичных вишлистов, где пользователи могут делиться своими идеями для подарков.

Приложение состоит из системы пользователей, системы аутентификации и авторизации, системы вишлистов и подарков со следующими функциями:

 - Вишлисты для друзей с возможностью резервирования подарков как друзьями, так и неавторизованными пользователям;
 - Автозаполнение данных подарка по URL;
 - Раздел "Идеи для подарков" с публичными вишлистами пользователей и возможностью добавления подарков в свои вишлисты;
 - Приватные вишлисты для планирования;
 - Антивишлисты;
 - Совместное редактирование вишлистов (соавторство);
 - Уведомления о входящих заявках в друзья и в соавторы, а также напоминания о днях рождениях друзей;
 - Уведомление о бронировании с помощью email. 

## Демонстрация работы

[Ссылка на видео демонстрации работы](https://youtu.be/QgmfEt7cMr4)

## Stack

 - NestJS -- для серверного приложения;
 - Sequelize -- ORM для СУБД PostgreSQL;
 - Typescript;
 - Jest -- для Unit-тестирования;
 - Cheerio -- для веб-скрейпинга подарков.

##  Installation

```bash

$  npm  install

```

##  Running the app

```bash

# development

$  npm  run  start

# watch mode

$  npm  run  start:dev

# production mode

$  npm  run  start:prod

```

##  Test  

```bash

# unit tests

$  npm  run  test

```
