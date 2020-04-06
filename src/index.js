import cloudscraper from 'cloudscraper';
import speakeasy from 'speakeasy';

const BUYER_REGEX = /<li class=".*memberListItem.*">[\s\S]+?<h3 class="username"><a.*href="members\/[\w\d-]+\.(\d+)\/".*>([\w\d-]+)<\/a><\/h3>[\s\S]+?<\/li>/g;
const PAGINATION_REGEX = /<div class="PageNav".*>[\s\S]*<nav>(?:\n*<a.+>(\d+)<\/a>\n*)+\n*<a.+>Next.+<\/a>\n*<\/nav>/;

class SpigotSite {
  constructor(username, password, tfaSecret) {
    this.username = username;
    this.password = password;
    this.tfaSecret = tfaSecret;
  }

  getTfaCode() {
    return speakeasy.totp({
      secret: this.tfaSecret,
      encoding: 'base32',
    });
  }

  async loginToSpigot() {
    await cloudscraper.get({ uri: 'https://www.spigotmc.org/' });
    await cloudscraper.post({
      uri: 'https://www.spigotmc.org/login/login',
      formData: {
        login: this.username,
        password: this.password,
        register: 0,
        remember: 1,
        cookie_check: 1,
      },
    });
    await cloudscraper.post({
      uri: 'https://www.spigotmc.org/login/two-step',
      formData: {
        code: this.getTfaCode(),
        trust: 1,
        provider: 'totp',
        _xfConfirm: 1,
        _xfToken: '',
        remember: 1,
        redirect: '/',
      },
    });
  }

  async getBuyersList(resource) {
    const buyers = [];
    // Get first page of buyers
    const buyersResponse = await cloudscraper.get({
      uri: `https://www.spigotmc.org/resources/${resource}/buyers`,
    });
    // See how many pages are there
    const pageLimit = (PAGINATION_REGEX.exec(buyersResponse) || [])[1];
    const parseResponse = (body) =>
      buyers.push(...[...body.matchAll(BUYER_REGEX)].map((v) => ({ id: v[1], username: v[2] })));
    parseResponse(buyersResponse);
    // Request the buyers from the other pages
    if (pageLimit)
      for (let i = 2; i <= pageLimit; i++) {
        const buyersResponsePage = await cloudscraper.get({
          uri: `https://www.spigotmc.org/resources/${resource}/buyers?page=${i}`,
        });
        parseResponse(buyersResponsePage);
      }
    return buyers;
  }
}

export default SpigotSite;
