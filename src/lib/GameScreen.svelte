<script>
    let {
        timeLimit,
        timeRemaining,
        currentWord,
        score,
        isDev,
        debugBeta,
        debugGamma,
        debugOrientation,
        activeTiltValue,
        lastGestureType,
        remainingWords
    } = $props();
</script>

<div
  class="flex items-center justify-center min-h-screen bg-secondary relative"
>
  <!-- Timer -->
  <div class="absolute top-0 left-0 right-0 h-2 bg-secondary-content/20">
    <div
      class="h-full bg-primary transition-all duration-1000"
      style="width: {(timeRemaining / timeLimit) * 100}%"
    ></div>
  </div>
  <div
    class="absolute top-4 left-1/2 -translate-x-1/2 text-2xl font-bold text-secondary-content"
  >
    {timeRemaining}s
  </div>
  <div class="text-center">
    <h1 class="text-6xl font-bold text-secondary-content mb-4">
      {currentWord}
    </h1>
    <p class="text-xl text-secondary-content">Score: {score}</p>
  </div>
  {#if isDev}
    <!-- Debug info (only visible in dev mode) -->
    <div
      class="absolute top-4 right-4 bg-black/50 p-2 rounded text-white text-sm"
    >
      <p>Mode: {debugOrientation}</p>
      <p>Gamma (left/right): {debugGamma}°</p>
      <p>Beta (forward/back): {debugBeta}°</p>
      <p>
        Active Tilt: {activeTiltValue}° ({debugOrientation === "landscape"
          ? "gamma"
          : "beta"})
      </p>
      <p>Current State: {lastGestureType}</p>
      <p>Words left: {remainingWords.length}</p>
    </div>
  {/if}
</div>
