<template>
  <div class="flex flex-row items-center my-4">
    <div class="card-white flex flex-col items-center py-4 w-20">
      <strong class="text-3xl">{{ days }}</strong>
      <p style="font-size: x-small">days</p>
    </div>
    <span class="m-3 font-bold text-3xl">:</span>
    <div class="card-white flex flex-col items-center py-4 w-20">
      <strong class="text-3xl">{{ hours }}</strong>
      <p style="font-size: x-small">hours</p>
    </div>
    <span class="m-3 font-bold text-3xl">:</span>
    <div class="card-white flex flex-col items-center py-4 w-20">
      <strong class="text-3xl">{{ minutes }}</strong>
      <p style="font-size: x-small">minutes</p>
    </div>
    <span class="m-3 font-bold text-3xl">:</span>
    <div class="card-white flex flex-col items-center py-4 w-20">
      <strong class="text-3xl">{{ seconds }}</strong>
      <p style="font-size: x-small">seconds</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import dayjs from 'dayjs';

const props = defineProps({
  dateTimeTo: { type: [Date, String, Number], required: true },
});

let refreshTimeInterval: any = null as any;

const days = ref(0);
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);

onMounted(() => {
  if (props.dateTimeTo) {
    refreshTimeInterval = setInterval(() => {
      refreshTime();
    }, 1000);
  }
});

onBeforeUnmount(() => {
  clearInterval(refreshTimeInterval);
});

function refreshTime() {
  const currDate = dayjs(new Date());
  let tmpDate = dayjs(props.dateTimeTo);

  const daysToEnd = tmpDate.diff(currDate, 'days');
  tmpDate = tmpDate.subtract(daysToEnd, 'days');

  const hoursToEnd = tmpDate.diff(currDate, 'hours');
  tmpDate = tmpDate.subtract(hoursToEnd, 'hours');

  const minutesToEnd = tmpDate.diff(currDate, 'minutes');
  tmpDate = tmpDate.subtract(minutesToEnd, 'minutes');

  const secondsToEnd = tmpDate.diff(currDate, 'seconds');

  days.value = daysToEnd;
  hours.value = hoursToEnd;
  minutes.value = minutesToEnd;
  seconds.value = secondsToEnd;
}
</script>
