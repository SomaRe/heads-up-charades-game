<script>
    let {selectedDeck = $bindable(null), timeLimit, adjustTime, startCountdown} = $props();
</script>

<div class="p-4 flex flex-col items-center justify-center min-h-screen">
    <h2 class="text-2xl font-bold mb-6">{selectedDeck.title}</h2>
    <div class="flex items-center gap-4 mb-6">
      <button class="btn btn-circle" onclick={() => adjustTime(-15)}>-</button
      >
      <span class="text-xl">{timeLimit}s</span>
      <button class="btn btn-circle" onclick={() => adjustTime(15)}>+</button>
    </div>
    <button class="btn btn-primary btn-lg" onclick={startCountdown}>
      Start Game
    </button>
    <button class="btn btn-ghost mt-4" onclick={() => (selectedDeck = null)}>
      Back
    </button>
  </div>