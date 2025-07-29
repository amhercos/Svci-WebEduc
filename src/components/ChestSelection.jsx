// src/components/ChestSelection.jsx
function ChestSelection({ onChestClick }) {
  const base = import.meta.env.BASE_URL;

  return (
    <div
      className="absolute inset-0 bg-cover bg-center flex flex-col items-center justify-center text-white"
      style={{ backgroundImage: `url('${base}chestSelection.jpg')` }}
    >
      <div className="flex justify-center gap-10">
        {[1, 2, 3].map((num) => (
          <div
            key={num}
            onClick={onChestClick}
            className="relative group cursor-pointer transition-transform hover:scale-110"
          >
            <div className="absolute inset-0 rounded-full animate-pulse bg-yellow-400 opacity-1 blur-xl z-0 group-hover:opacity-40 transition duration-500"></div>
            <img
              src={`${base}Chest.svg`}
              alt={`Treasure Chest ${num}`}
              className="relative z-10 w-90 drop-shadow-2xl"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export default ChestSelection;
