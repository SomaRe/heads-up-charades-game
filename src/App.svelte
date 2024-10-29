<script>
  import { onMount } from "svelte";
  import HomeScreen from "./lib/HomeScreen.svelte";
  import PreGameScreen from "./lib/PreGameScreen.svelte";
  import CountdownScreen from "./lib/CountdownScreen.svelte";
  import GameOverScreen from "./lib/GameOverScreen.svelte";

  // Runes for state management
  let selectedDeck = $state(null);
  let timeLimit = $state(60);
  let currentWord = $state("");
  let isPlaying = $state(false);
  let score = $state(0);
  let isFullscreen = $state(false);
  let countdown = $state(3);
  let isCountingDown = $state(false);
  let isGameOver = $state(false);

  // Debug values for orientation
  let debugBeta = $state(0);
  let debugGamma = $state(0);
  let debugOrientation = $state("");
  let activeTiltValue = $state(0);
  let lastGestureType = $state("");
  let timeRemaining = $state(0);
  let passedWords = $state([]);
  let correctWords = $state([]);
  let isDev = $state(true);

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

  let gameTimer = $state(0);
  let orientationHandler;
  let remainingWords = $state([]);

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
      await screen.orientation["lock"]("landscape");
    } catch (err) {
      console.error("Fullscreen or orientation lock failed:", err);
      alert("Fullscreen or orientation lock failed: " + err);
      // return;
    }
    isCountingDown = true;
    countdown = 3;
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
    const COOLDOWN = 1000; // cooldown between gestures
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
        if (Math.abs(tiltValue) >= 50 && Math.abs(tiltValue) <= 90) {
          // This is our neutral zone (phone relatively flat)
          lastGestureType = "NEUTRAL (±50° to ±90°)";
        } else if (tiltValue < 0) {
          // Right tilt (gamma becomes more negative)
          lastGesture = now;
          lastGestureType = "CORRECT (Right tilt < -30°)";
          handleCorrect();
        } else if (tiltValue > 0) {
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
    <HomeScreen {decks} {selectDeck} {toggleDevMode}></HomeScreen>
  {:else if !isPlaying && !isCountingDown && !isGameOver}
    <PreGameScreen bind:selectedDeck {timeLimit} {adjustTime} {startCountdown}
    ></PreGameScreen>
  {:else if isCountingDown}
    <CountdownScreen {countdown}></CountdownScreen>
  {:else if isPlaying}
    <GameScreen
      {timeLimit}
      {timeRemaining}
      {currentWord}
      {score}
      {isDev}
      {debugBeta}
      {debugGamma}
      {debugOrientation}
      {activeTiltValue}
      {lastGestureType}
      {remainingWords}
    ></GameScreen>
  {:else if isGameOver}
    <GameOverScreen
      {selectDeck}
      bind:selectedDeck
      bind:isGameOver
      {score}
      {correctWords}
      {passedWords}
    ></GameOverScreen>
  {/if}
</div>
