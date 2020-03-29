# Be The Hero
Esse projeto é resultado da semana OmniStack 11.0, da RocketSeat com o professor [Diego Fernandes](https://github.com/diego3g).
O nome do projeto é Be The Hero, onde utilizamos Node/Express no backend e no frontend React.JS
Temos também o App Mobile desenvolvido em React Native

# Pré-requisitos
Para o funcionamento correto da aplicação, é necessário apenas o Node em versão maior ou igual a 13.0.0

# Instalação
## Backend
Abra a pasta "backend" no terminal, e rode o comando "npm install".

## Frontend
Abra a pasta "frontend" no terminal, e rode o comando "npm install".

## Mobile
Abra a pasta "mobile" no terminal, e rode o comando "npm install".

# Documentação

## Backend
Todo o backend foi feito utilizando o [Express](https://expressjs.com)
Toda a comunicação do backend com o banco de dados (SQLite) é feita utilizando o Knex.
Então antes de dar um "npm start" na aplicação, não esqueça de rodar "npx knex migrate:latest".

As rotas se encontram no arquivo "routes.js" e utilizam o [Celebrate](https://www.npmjs.com/package/celebrate) para validar as rotas.
O [Celebrate](https://www.npmjs.com/package/celebrate) é um middleware para Express que utiliza o [Joi](https://hapi.dev/module/joi/).

## Frontend
O frontend foi feito utilizando o [ReactJS](https://pt-br.reactjs.org/).
As requisições para a API foram feitas utilizando o [AXIOS](https://github.com/axios/axios).
E as rotas se encontram no arquivo "routes.js"

## Mobile
O mobile da aplicação foi feita utilizando o [React Native](https://reactnative.dev/) e o [Expo](https://expo.io/).
As requisições para a API foram feitas utilizando o [AXIOS](https://github.com/axios/axios).
E as rotas se encontram no arquivo "routes.js"
