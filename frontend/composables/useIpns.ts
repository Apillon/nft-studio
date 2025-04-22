const ipnsLink = ref('');
const ipnsToken = ref('');

export default function useClaim() {
  const { handleError } = useErrors();

  async function getIpns(ipns: string) {
    if (ipnsLink.value && ipnsToken.value) {
      // return;
    }
    try {
      const { data } = await $api.get<IpnsResponse>('/ipns-link/' + ipns);
      const url = URL.parse(data.link);
      ipnsLink.value = `${url?.origin}${url?.pathname}`;
      ipnsToken.value = url?.search || '';
    } catch (error) {
      handleError(error);
    }
  }

  async function parseIpnsLink(url: string) {
    if (url.startsWith('ipns://')) {
      const ipnsUrl = new URL(url);
      await getIpns(ipnsUrl.hostname);
      return `${ipnsLink.value}${ipnsUrl.pathname}${ipnsToken.value}`;
    } else if (url.startsWith('ipfs://')) {
      return parseImage(url);
    }

    return url;
  }
  return { parseIpnsLink };
}
