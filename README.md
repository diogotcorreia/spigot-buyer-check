# spigot-buyer-list

![npm](https://img.shields.io/npm/v/spigot-buyer-list)
![npm bundle size](https://img.shields.io/bundlephobia/min/spigot-buyer-list)
![GitHub issues](https://img.shields.io/github/issues/diogotcorreia/spigot-buyer-list)
![GitHub pull requests](https://img.shields.io/github/issues-pr/diogotcorreia/spigot-buyer-list)
![NPM](https://img.shields.io/npm/l/spigot-buyer-list)
![GitHub last commit](https://img.shields.io/github/last-commit/diogotcorreia/spigot-buyer-list)

A NodeJS package that allows you to fetch the buyers list on Spigot for a premium plugin

## Installation

This package can be installed from NPM using `npm` or `yarn`.

```
npm install spigot-buyer-list
```

```
yarn add spigot-buyer-list
```

## Code Examples

Using this package is pretty straight forward. Here is some sample code:

```javascript
import SpigotSite from 'spigot-buyer-list';

const getBuyers = async () => {
  try {
    const spigotSite = new SpigotSite('username', 'password', 'tfaSecret');
    await spigotSite.loginToSpigot();
    // getBuyersList(resourceId)
    const buyers = await spigotSite.getBuyersList(30331); // [{id: 123456, username: "user"}, ...]
  } catch (e) {
    console.error('Failed to fetch buyer list', e);
  }
};
```

## Contributing

Feel free to submit a PR or open an issue if you want something improved with this package.
Remember to run `yarn format` (or `npm run format`) before commiting (in case of code changes).
