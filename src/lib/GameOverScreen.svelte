<script>
    let {selectDeck, selectedDeck = $bindable(null), isGameOver = $bindable(false), score, correctWords, passedWords} = $props();
</script>


<div class="p-4 flex flex-col items-center min-h-screen">
    <h2 class="text-3xl font-bold mb-6">Game Over!</h2>
    <p class="text-2xl mb-4">Final Score: {score}</p>
    <div class="w-full max-w-md">
      <h3 class="text-xl font-bold mb-2">Results:</h3>
      <div class="space-y-2">
        {#each selectedDeck.words as word}
          {#if correctWords.includes(word)}
            <div class="p-2 bg-success/20 rounded font-bold">
              {word}
            </div>
          {:else if passedWords.includes(word)}
            <div class="p-2 bg-base-200 rounded">
              {word}
            </div>
          {/if}
        {/each}
      </div>
    </div>
    <div class="mt-6 space-x-4">
      <button
        class="btn btn-primary"
        onclick={() => {
          isGameOver = false;
          selectDeck(selectedDeck);
        }}
      >
        Play Again
      </button>
      <button
        class="btn btn-ghost"
        onclick={() => {
          isGameOver = false;
          selectedDeck = null;
        }}
      >
        Choose Different Deck
      </button>
    </div>
  </div>