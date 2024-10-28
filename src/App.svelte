<script>
  import { onMount } from "svelte";

  // Runes for state management
  let selectedDeck = null;
  let timeLimit = 60;
  let currentWord = "";
  let isPlaying = false;
  let score = 0;
  let isFullscreen = false;
  let countdown = 5;
  let isCountingDown = false;
  let isGameOver = false;

  // Debug values for orientation
  let debugBeta = 0;
  let debugGamma = 0;
  let debugOrientation = "";
  let activeTiltValue = 0;
  let lastGestureType = "";
  let timeRemaining = 0;
  let passedWords = [];
  let correctWords = [];
  let isDev = true; // Toggle for dev mode

  // Game decks
  const decks = [
    {
      id: "bollywood",
      title: "Bollywood",
      words: [
        "Shah Rukh Khan",
        "DDLJ",
        "Sholay",
        "Amitabh Bachchan",
        "Gabbar Singh",
        "Mogambo",
        "Kuch Kuch Hota Hai",
        "Kabhi Khushi Kabhi Gham",
        "Raj Kapoor",
        "Madhuri Dixit",
      ],
    },
    {
      id: "food",
      title: "Indian Food",
      words: [
        "Butter Chicken",
        "Biryani",
        "Samosa",
        "Dosa",
        "Pani Puri",
        "Chole Bhature",
        "Vada Pav",
        "Gulab Jamun",
        "Masala Dosa",
        "Palak Paneer",
      ],
    },
    {
      id: "places",
      title: "Indian Places",
      words: [
        "Taj Mahal",
        "Gateway of India",
        "Red Fort",
        "Varanasi",
        "Jaipur",
        "Kerala Backwaters",
        "Qutub Minar",
        "Golden Temple",
        "Mysore Palace",
        "Victoria Memorial",
      ],
    },
    {
      id: "brands",
      title: "Indian Brands",
      words: [
        "Tata",
        "Reliance",
        "Amul",
        "Bajaj",
        "Mahindra",
        "Parle-G",
        "Air India",
        "Flipkart",
        "HDFC",
        "Wipro",
      ],
    },
    {
      id: "sports",
      title: "Indian Sports",
      words: [
        "Cricket",
        "Kabaddi",
        "Hockey",
        "Sachin Tendulkar",
        "Virat Kohli",
        "MS Dhoni",
        "PV Sindhu",
        "Sania Mirza",
        "Mary Kom",
        "Abhinav Bindra",
      ],
    },
  ];

  let gameTimer;
  let orientationHandler;
  let remainingWords = [];

  // Function to handle deck selection
  function selectDeck(deck) {
    selectedDeck = deck;
    timeLimit = 60;
    remainingWords = [...deck.words];
    isGameOver = false;
  }

  // Function to adjust time limit
  function adjustTime(amount) {
    timeLimit = Math.max(15, timeLimit + amount);
  }

  // Function to start countdown
  async function startCountdown() {
    try {
      await document.documentElement.requestFullscreen();
      await screen.orientation['lock']("landscape");
    } catch (err) {
      console.error("Fullscreen or orientation lock failed:", err);
      alert("Fullscreen or orientation lock failed: " + err);
      // return;
    }
    isCountingDown = true;
    countdown = 5;
    const countInterval = setInterval(() => {
      countdown--;
      if (countdown === 0) {
        clearInterval(countInterval);
        startGame();
      }
    }, 1000);
  }

  // Function to start game
  async function startGame() {
    isCountingDown = false;
    isPlaying = true;
    score = 0;
    remainingWords = [...selectedDeck.words];
    lastGestureType = "";
    setupOrientationHandler();
    pickNewWord();
    startTimer();
  }

  // Function to pick new word
  function pickNewWord() {
    if (remainingWords.length === 0) {
      endGame();
      return;
    }
    const randomIndex = Math.floor(Math.random() * remainingWords.length);
    currentWord = remainingWords[randomIndex];
    remainingWords.splice(randomIndex, 1);
  }

  // Function to handle device orientation
  function setupOrientationHandler() {
    let lastGesture = Date.now();
    const COOLDOWN = 500; // cooldown between gestures
    orientationHandler = (event) => {
      const now = Date.now();

      // Update debug values
      debugBeta = Math.round(event.beta);
      debugGamma = Math.round(event.gamma);
      debugOrientation = window.matchMedia("(orientation: landscape)").matches
        ? "landscape"
        : "portrait";

      if (now - lastGesture < COOLDOWN) return;

      const isLandscape = window.matchMedia("(orientation: landscape)").matches;

      // CORRECTED: Use gamma for landscape (left/right tilt)
      let tiltValue;
      if (isLandscape) {
        tiltValue = event.gamma; // Left/right tilt in landscape
        activeTiltValue = Math.round(tiltValue);

        // For landscape:
        // Neutral: gamma is around ±90° (phone held flat)
        // Right tilt: gamma goes towards -90° to -60°
        // Left tilt: gamma goes towards 90° to 60°
        if (Math.abs(tiltValue) >= 60 && Math.abs(tiltValue) <= 90) {
          // This is our neutral zone (phone relatively flat)
          lastGestureType = "NEUTRAL (±60° to ±90°)";
        } else if (tiltValue < -30) {
          // Right tilt (gamma becomes more negative)
          lastGesture = now;
          lastGestureType = "CORRECT (Right tilt < -30°)";
          handleCorrect();
        } else if (tiltValue > 30) {
          // Left tilt (gamma becomes more positive)
          lastGesture = now;
          lastGestureType = "PASS (Left tilt > 30°)";
          handlePass();
        } else {
          // Small tilts between -30° and 30°
          lastGestureType = "MOVING (±30°)";
        }
      } else {
        // Portrait mode
        tiltValue = event.beta;
        activeTiltValue = Math.round(tiltValue);

        if (tiltValue >= 75 && tiltValue <= 105) {
          // Neutral zone (phone relatively vertical)
          lastGestureType = "NEUTRAL (75° to 105°)";
        } else if (tiltValue < 75) {
          // Forward tilt (beta decreases)
          lastGesture = now;
          lastGestureType = "CORRECT (Forward tilt < 75°)";
          handleCorrect();
        } else if (tiltValue > 105) {
          // Backward tilt (beta increases)
          lastGesture = now;
          lastGestureType = "PASS (Backward tilt > 105°)";
          handlePass();
        }
      }
    };
    window.addEventListener("deviceorientation", orientationHandler);
  }

  // Function to handle correct answer
  function handleCorrect() {
    score++;
    correctWords = [...correctWords, currentWord];
    pickNewWord();
  }

  // Function to handle pass
  function handlePass() {
    passedWords = [...passedWords, currentWord];
    pickNewWord();
  }

  function toggleDevMode() {
    isDev = !isDev;
  }

  // Function to start timer
  function startTimer() {
    timeRemaining = timeLimit;
    gameTimer = setInterval(() => {
      if (timeRemaining <= 1) {
        timeRemaining = 0;
        endGame();
      } else {
        timeRemaining--;
      }
    }, 1000);
  }

  // Function to end game
  function endGame() {
     isPlaying = false;
     isGameOver = true;
     if (gameTimer) {
       clearInterval(gameTimer);
       gameTimer = null;
     }
     if (orientationHandler) {
       window.removeEventListener("deviceorientation", orientationHandler);
       orientationHandler = null;
     }
     if (document.fullscreenElement) {
       document.exitFullscreen().catch((err) => {
         console.error("Error exiting fullscreen:", err);
       });
     }
     try {
       screen.orientation.unlock();
     } catch (err) {
       console.error("Orientation unlock failed:", err);
     }
   }

  // Cleanup on component unmount
  onMount(() => {
    return () => {
      if (gameTimer) clearInterval(gameTimer);
      if (orientationHandler) {
        window.removeEventListener("deviceorientation", orientationHandler);
      }
    };
  });
</script>

<div class="min-h-screen bg-base-200">
  {#if !selectedDeck}
    <!-- Home Screen -->
    <div class="p-4">
      <h1 class="text-3xl font-bold text-center mb-6">Heads Up Charades</h1>
      <div class="grid grid-cols-2 gap-4">
        {#each decks as deck}
          <button class="btn btn-primary h-32" onclick={() => selectDeck(deck)}>
            {deck.title}
          </button>
        {/each}
      </div>
      <button
        class="btn btn-circle btn-ghost absolute top-4 right-4"
        onclick={toggleDevMode}
        aria-label="Settings"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>
    </div>
  {:else if !isPlaying && !isCountingDown && !isGameOver}
    <!-- Pre-game Screen -->
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
  {:else if isCountingDown}
    <!-- Countdown Screen -->
    <div class="flex items-center justify-center min-h-screen bg-primary">
      <span class="text-8xl font-bold text-primary-content">{countdown}</span>
    </div>
  {:else if isPlaying}
    <!-- Game Screen -->
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
    {:else if isGameOver}
    <!-- Game Over Screen -->
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
              <div class="p-2 bg-base-200 rounded text-base-content/50">
                {word}
              </div>
            {:else}
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
        <button class="btn btn-ghost" onclick={() => {
          isGameOver = false;
          selectedDeck = null;
        }}>
          Choose Different Deck
        </button>
      </div>
    </div>
  {/if}
</div>
