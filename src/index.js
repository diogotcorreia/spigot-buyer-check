import speakeasy from 'speakeasy';
import axios from 'axios';
import qs from 'qs';
import { encodeCookies, getCookiesFromHeader } from './utils';

const BUYER_REGEX = /<li class=".*memberListItem.*">[\s\S]+?<h3 class="username"><a.*href="members\/[\w\d]+\.(\d+)\/".*>([\w\d]+)<\/a><\/h3>[\s\S]+?<\/li>/g;
const PAGINATION_REGEX = /<div class="PageNav".*>[\s\S]*<nav>(?:\n*<a.+>(\d+)<\/a>\n*)+\n*<a.+>Next.+<\/a>\n*<\/nav>/g;

class SpigotSite {
  constructor(username, password, tfaSecret) {
    this.username = username;
    this.password = password;
    this.tfaSecret = tfaSecret;
    this.cookies = {};
  }

  getTfaCode() {
    return speakeasy.totp({
      secret: this.tfaSecret,
      encoding: 'base32',
    });
  }

  async loginToSpigot() {
    // Gets session cookies from main page
    const cookieResponse = await axios.get('https://www.spigotmc.org');
    this.cookies = {
      ...this.cookies,
      ...getCookiesFromHeader(cookieResponse.headers['set-cookie']),
    };

    // Logs in (validates token)
    const loginResponse = await axios.post(
      'https://www.spigotmc.org/login/login',
      qs.stringify({
        login: this.username,
        password: this.password,
        register: 0,
        remember: 1,
        cookie_check: 1,
      }),
      {
        responseType: 'document',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: 'https://www.spigotmc.org/login/login',
          Cookie: encodeCookies(this.cookies),
        },
      }
    );
    // This request probably doesn't return new cookies, but it's here just in case
    this.cookies = {
      ...this.cookies,
      ...getCookiesFromHeader(loginResponse.headers['set-cookie']),
    };

    // Authenticate with TFA
    const tfaResponse = await axios.post(
      'https://www.spigotmc.org/login/two-step',
      qs.stringify({
        code: this.getTfaCode(),
        trust: 1,
        provider: 'totp',
        _xfConfirm: 1,
        _xfToken: '',
        remember: 1,
        redirect: '/',
        save: 'Confirm',
      }),
      {
        responseType: 'document',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Referer: 'https://www.spigotmc.org/login/two-step',
          Cookie: encodeCookies(this.cookies),
        },
        maxRedirects: 0,
        validateStatus: (status) => status === 303,
      }
    );
    this.cookies = {
      ...this.cookies,
      ...getCookiesFromHeader(tfaResponse.headers['set-cookie']),
    };
  }

  async getBuyersList(resource) {
    const buyers = [];
    // Get first page of buyers
    const buyersResponse = (
      await axios.get(`https://www.spigotmc.org/resources/${resource}/buyers`, {
        responseType: 'document',
        headers: {
          Cookie: encodeCookies(this.cookies),
        },
      })
    ).data;
    // See how many pages are there
    const pageLimit = PAGINATION_REGEX.exec(buyersResponse)[1];
    const parseResponse = (body) =>
      buyers.push(...[...body.matchAll(BUYER_REGEX)].map((v) => ({ id: v[1], username: v[2] })));
    parseResponse(buyersResponse);
    // Request the buyers from the other pages
    for (let i = 2; i <= pageLimit; i++) {
      const buyersResponsePage = (
        await axios.get(`https://www.spigotmc.org/resources/${resource}/buyers?page=${i}`, {
          responseType: 'document',
          headers: {
            Cookie: encodeCookies(this.cookies),
          },
        })
      ).data;
      parseResponse(buyersResponsePage);
    }
    return buyers;
  }
}

export default SpigotSite;
