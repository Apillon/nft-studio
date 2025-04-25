import { AirdropStatus } from '~/lib/values/general.values';

export default function useUser() {
  const message = useMessage();
  const userStore = useUserStore();
  const { handleError } = useErrors();
  const { isLoggedIn } = useWalletConnect();

  let recipientInterval: any = null;

  onUnmounted(() => {
    clearInterval(recipientInterval);
  });

  watch(
    () => isLoggedIn.value,
    _ => {
      if (isLoggedIn.value) {
        fetchUsers();
        fetchStatistics();
      }
    },
    { immediate: true }
  );

  /** GETTERS */
  async function getBalance() {
    if (!userStore.hasBalance) {
      await fetchBalance();
    }
    return userStore.balance;
  }
  async function getStatistics() {
    if (!userStore.hasStatistics) {
      await fetchStatistics();
    }
    return userStore.statistics;
  }
  async function getUsers() {
    if (!userStore.hasUsers) {
      await fetchUsers();
    }
    return userStore.statistics;
  }

  /** FETCH */
  async function fetchUsers() {
    userStore.loading = true;
    try {
      const { data } = await $api.get<UsersResponse>('/users', { itemsPerPage: 10000 });
      userStore.users = data.items;

      /** Users pooling */
      checkUnfinishedRecipients();
    } catch (e) {
      handleError(e);
    }
    userStore.loading = false;
  }

  async function fetchBalance() {
    try {
      const { data } = await $api.get<BalanceResponse>('/project');
      userStore.balance = data.balance;
    } catch (error) {
      handleError(error);
    }
  }
  async function fetchStatistics() {
    try {
      const { data } = await $api.get<StatisticsResponse>('/statistics');
      userStore.statistics = data;
    } catch (error) {
      handleError(error);
    }
  }

  /** ACTIONS */
  async function saveRecipients(items: UserInterface[]) {
    if (!items?.length) {
      message.warning('Upload CSV file and add some recipients first.');
      return false;
    }

    try {
      await $api.post<SuccessResponse>('/users', { users: items });

      userStore.users = [...userStore.users, ...items];
      message.success('Recipients are successfully added.');

      await fetchStatistics();
      checkUnfinishedRecipients();

      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  }

  /** Recipients polling */
  function checkUnfinishedRecipients() {
    const unfinishedRecipient = userStore.users.find(
      item => item.airdrop_status === AirdropStatus.PENDING
    );
    if (unfinishedRecipient === undefined) {
      return;
    }

    clearInterval(recipientInterval);
    recipientInterval = setInterval(async () => {
      await getUsers();
      const recipient = userStore.users.find(item => item.airdrop_status === AirdropStatus.PENDING);
      if (!recipient || recipient.airdrop_status >= AirdropStatus.EMAIL_SENT) {
        clearInterval(recipientInterval);
      }
    }, 10000);
  }

  return {
    saveRecipients,
    fetchBalance,
    getBalance,
    getUsers,
    getStatistics,
  };
}
