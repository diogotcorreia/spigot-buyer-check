# spigot-buyer-list

A NodeJS package that allows you to fetch the buyers list on Spigot for a premium plugin

## Code Examples

Using this package is pretty straight forward. Here is some sample code:

```javascript
import SpigotSite from 'spigot-buyer-list';

const getBuyers = async () => {
  try {
    const spigotSite = new SpigotSite('username', 'password', 'tfaSecret');
    await loginToSpigot();
    // getBuyersList(resourceId)
    const buyers = await getBuyersList(30331); // [{id: 123456, username: "user"}, ...]
  } catch (e) {
    console.err('Failed to fetch buyer list', e);
  }
};
```

## Contributing

Feel free to submit a PR or open an issue if you want something improved with this package.
Remember to run `yarn format` (or `npm run format`) before commiting (in case of code changes).
