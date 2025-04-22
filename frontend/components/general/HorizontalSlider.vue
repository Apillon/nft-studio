<template>
  <div ref="slider" class="overflow-x-auto scrollable">
    <slot />
  </div>
</template>

<script lang="ts" setup>
const slider = ref();

onMounted(() => {
  if (slider.value) {
    makeSlider();
  }
});

function makeSlider() {
  let mouseDown = false;
  let startX: number, scrollLeft: number;

  const startDragging = (e: MouseEvent) => {
    mouseDown = true;
    startX = e.pageX - slider.value.offsetLeft;
    scrollLeft = slider.value.scrollLeft;
  };

  const stopDragging = () => {
    mouseDown = false;
  };

  slider.value.addEventListener('mousemove', (e: MouseEvent) => {
    e.preventDefault();
    if (!mouseDown) {
      return;
    }
    const x = e.pageX - slider.value.offsetLeft;
    const scroll = x - startX;
    slider.value.scrollLeft = scrollLeft - scroll;
  });

  slider.value.addEventListener('mousedown', startDragging, false);
  slider.value.addEventListener('mouseup', stopDragging, false);
  slider.value.addEventListener('mouseleave', stopDragging, false);
}
</script>
