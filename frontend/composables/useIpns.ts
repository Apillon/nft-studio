export default function useIpns() {
  const ipnsStore = useIpnsStore();
  const { handleError } = useErrors();

  async function getLink(ipns: string, type = 'ipfs'): Promise<null | IPNS> {
    if (ipnsStore.hasIpns(ipns)) {
      return ipnsStore.links[ipns];
    }
    try {
      const { data } = await $api.get<IpnsResponse>('/ipns-link/' + ipns, { type });
      const url = URL.parse(data.link);

      ipnsStore.links[ipns] = {
        link: `${url?.origin}${url?.pathname}`,
        token: url?.search || '',
      };
      return ipnsStore.links[ipns];
    } catch (error) {
      handleError(error);
    }
    return null;
  }

  async function parseLink(url: string) {
    if (url.startsWith('ipns://') || url.startsWith('ipfs://')) {
      const ipnsUrl = new URL(url);
      const type = url.startsWith('ipns://') ? 'ipns' : 'ipfs';
      const ipns = await getLink(ipnsUrl.hostname, type);

      return ipns ? `${ipns.link}${removeLastSlash(ipnsUrl.pathname)}${ipns.token}` : url;
    }
    return url;
  }
  return { parseLink };
}
