<script>
  let { countdown, isNeutral, debugOrientation, checkNeutralPosition, isCountingDown = $bindable(), startGame} = $props();

  const countdownOrientationHandler = (event) => {
    checkNeutralPosition(event);
  };
  window.addEventListener("deviceorientation", countdownOrientationHandler);

  // Start countdown once neutral position is detected
  const waitForNeutral = setInterval(() => {
    if (isNeutral) {
      clearInterval(waitForNeutral);
      window.removeEventListener("deviceorientation", countdownOrientationHandler); // Clean up
      countdown = 3;
      const countInterval = setInterval(() => {
        countdown--;
        if (countdown === 0) {
          clearInterval(countInterval);
          startGame();
        }
      }, 1000);
    }
  }, 100);

</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-primary">
  {#if !isNeutral}
    <div class="text-center p-4">
      <div class="text-2xl font-bold text-primary-content mb-4">
        {#if debugOrientation === 'landscape'}
          Hold your phone flat and parallel to the ground
        {:else}
          Hold your phone upright and straight
        {/if}
      </div>
      <!-- Simple phone icon/indicator -->
      <div class="mb-4">
        <div class="w-20 h-32 border-4 border-primary-content rounded-lg mx-auto relative">
          <div class="absolute top-2 w-8 h-1 bg-primary-content rounded-full left-1/2 transform -translate-x-1/2"></div>
        </div>
      </div>
      <div class="text-lg text-primary-content opacity-80">
        {#if debugOrientation === 'landscape'}
          Keep the screen facing you
        {:else}
          Keep the screen facing you at eye level
        {/if}
      </div>
    </div>
  {:else}
    <span class="text-8xl font-bold text-primary-content">{countdown}</span>
  {/if}
</div>