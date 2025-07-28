function MiniGame({ onComplete }) {
    return (
      <div className="mt-4 text-center">
        <p className="text-lg">Mini-game coming soon!</p>
        <button
          onClick={onComplete}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
        >
          I finished the game!
        </button>
      </div>
    )
  }
  
  export default MiniGame
  