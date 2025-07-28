function GameIntro({ onContinue, gameTitle }) {
    return (
      <div className="text-center">
        <h2 className="text-xl">🎮 Let's Play a Game!</h2>
        <h1 className="text-[100px] mt-4 font-bold">{gameTitle}</h1>
        <p className="text-lg">Are you ready?</p>
        <button
          onClick={onContinue}
          className="mt-4 text-xl px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          🚀 Start Game
        </button>
      </div>
    )
  }
  
  export default GameIntro
  