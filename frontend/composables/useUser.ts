import { useMessage } from 'naive-ui';
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
        getUsers();
        getStatistics();
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
    if (userStore.promises.statistics) {
      await userStore.promises.statistics;
    } else if (!userStore.hasStatistics) {
      await fetchStatistics();
    }
    return userStore.statistics;
  }
  async function getUsers() {
    if (userStore.promises.users) {
      await userStore.promises.users;
    } else if (!userStore.hasUsers) {
      await fetchUsers();
    }
    return userStore.users;
  }

  /** FETCH */
  async function fetchUsers() {
    userStore.loading = true;
    try {
      userStore.promises.users = $api.get<UsersResponse>('/users', { itemsPerPage: 10000 });
      const { data } = await userStore.promises.users;
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
      userStore.promises.statistics = $api.get<StatisticsResponse>('/statistics');
      const { data } = await userStore.promises.statistics;
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
      message.success('Recipients are successfully added.');

      await fetchUsers();
      await fetchStatistics();
      checkUnfinishedRecipients();

      return true;
    } catch (e) {
      handleError(e);
      return false;
    }
  }

  async function sendEmails(): Promise<boolean> {
    try {
      const { data } = await $api.post<SuccessResponse>('/send-claim-mail');
      if (data.success) {
        message.success(
          'Emails have been sent successfully to all recipients! They will receive a link to claim their NFTs. Users with wallets will receive their NFTs.'
        );
      }
      return !!data.success;
    } catch (e) {
      handleError(e);
    }
    return false;
  }

  /** Recipients polling */
  function checkUnfinishedRecipients() {
    const unfinishedRecipient = userStore.users.find(item => Number(item.airdrop_status) <= AirdropStatus.PENDING);
    if (unfinishedRecipient === undefined) {
      return;
    }

    clearInterval(recipientInterval);
    recipientInterval = setInterval(async () => {
      await fetchUsers();
      const recipient = userStore.users.find(item => Number(item.airdrop_status) <= AirdropStatus.PENDING);
      if (!recipient || recipient.airdrop_status >= AirdropStatus.EMAIL_SENT) {
        clearInterval(recipientInterval);
      }
    }, 10000);
  }

  return {
    saveRecipients,
    fetchBalance,
    fetchStatistics,
    fetchUsers,
    getBalance,
    getUsers,
    getStatistics,
    sendEmails,
  };
}
