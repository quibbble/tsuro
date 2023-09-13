# Tsuro

[![Netlify Status](https://api.netlify.com/api/v1/badges/e3eb6923-fc68-46cb-86f3-d8eb3c131025/deploy-status)](https://app.netlify.com/sites/tsuro-quibbble/deploys)

Tsuro game website. Play at [tsuro.quibbble.com](https://tsuro.quibbble.com).

This repo contains [ReactJS](https://react.dev) frontend code and makes use of custom React components found at [boardgame](https://github.com/quibbble/boardgame). Game logic can be found at [go-tsuro](https://github.com/quibbble/go-tsuro). Server logic can be found at [go-quibbble](https://github.com/quibbble/go-quibbble). 

[![Quibbble Tsuro](screenshot.png)](https://tsuro.quibbble.com)

## Run Locally

- Generate a personal `GITHUB_ACCESS_TOKEN` with package read permissions. Read more about it [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry).
- Create a `.npmrc` file in the `tsuro` root director with the following:
```
//npm.pkg.github.com/:_authToken=<GITHUB_ACCESS_TOKEN>
@quibbble:boardgame=https://npm.pkg.github.com
```
- Run `npm i`.
- Run the quibbble server ([go-quibbble](https://github.com/quibbble/go-quibbble)) locally on port `8080`.
- Create a `.env.local` file in the `tsuro` root directory with the following:
```
REACT_APP_HOST="http://127.0.0.1:8080"
REACT_APP_WEBSOCKET="ws://127.0.0.1:8080"
```
- Run `npm start`.
