# 🎉 Over-the-Head Charades Game

This is a fun **Over-the-Head Charades Game** built with **Svelte**, **Vite**, **Tailwind CSS**, and **daisyUI**. The game allows players to select a deck of words, hold the device over their head, and guess the word based on clues from their friends. The game uses device orientation to detect gestures for correct or passed guesses.

## 🚀 Features

- **Deck Selection**: Choose from various pre-made decks (e.g., Super Powers, IMDb Top 100 Movies, Famous Landmarks, etc.).
- **Device Orientation**: The game uses device orientation to detect gestures (tilt left to pass, tilt right for correct).
- **Countdown Timer**: A countdown timer starts the game once the device is in a neutral position.
- **Score Tracking**: Tracks correct and passed words during the game.
- **Game Over Screen**: Displays the final score and allows players to restart or select a new deck.
- **Developer Mode**: Toggle developer mode to see debug information like device orientation values.

## 🧑‍💻 Getting Started

### Prerequisites

- **Node.js** (v14 or higher)
- **npm** or **yarn**

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/over-the-head-charades.git
   cd over-the-head-charades
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

### Build for Production

To build the project for production:

```bash
npm run build
```

The production-ready files will be in the `dist/` folder.

## 🛠 Configuration

### Tailwind CSS + daisyUI

This project uses **Tailwind CSS** for styling, along with **daisyUI** for pre-built UI components. You can configure Tailwind in the `tailwind.config.js` file and customize daisyUI components as needed.

## 📱 iOS Device Issues

Unfortunately, the game currently has issues on iOS devices due to restrictions on accessing device orientation data in Safari. Apple requires explicit user permission for motion and orientation data, and even then, the behavior can be inconsistent.

### Workarounds/Compromises for iOS:

- **User Permissions**: Ensure that users grant permission for motion and orientation data. You can prompt them to enable this in their device settings.
- **Fallback UI**: Consider adding a fallback UI for iOS users where they can manually swipe to pass or mark a word as correct.
- **Orientation Lock**: iOS devices may not support programmatic orientation locking. You may need to instruct users to manually lock their device in landscape mode.

We are actively exploring workarounds to improve the experience on iOS devices.

## 📚 Future Features (Backend)

In the future, we plan to add backend functionality to enhance the game experience. Here's a checklist of potential features:

- [ ] **Popular Decks**: Fetch popular decks from the backend and display them on the home screen.
- [ ] **Search Decks**: Implement a search feature to find decks by title or category.
- [ ] **Custom Decks**: Allow users to create custom decks and upload them to the server.
  - [ ] **Public or Private**: Users can choose to make their custom decks public or private.
  - [ ] **18+ Content**: Add an option to mark decks as 18+.
- [ ] **User Authentication**: Implement login and registration for users.
  - [ ] **Firebase Authentication**: Use Firebase for handling user authentication.
  - [ ] **Supabase Authentication**: Alternatively, use Supabase for authentication.
- [ ] **LLM Integration**: Use a Large Language Model (LLM) API (e.g., OpenAI) to expand decks or generate new words.
  - [ ] **API Key Management**: Securely store and manage API keys for LLM services.
  - [ ] **Deck Expansion**: Allow users to expand existing decks using LLM-generated content.

## 🛠 Technologies Used

- **Svelte**: Frontend framework for building reactive user interfaces.
- **Vite**: Fast build tool for modern web development.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **daisyUI**: Tailwind CSS component library for pre-built UI components.
- **Firebase** (planned): For backend services like authentication and database.
- **Supabase** (planned): Alternative backend option for authentication and database.
- **OpenAI API** (planned): For LLM-based deck expansion.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request if you have any improvements or bug fixes.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
