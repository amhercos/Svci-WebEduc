import React, { useState } from 'react';
import './PokemonGame.css';

const getRandomPokemonId = () => Math.floor(Math.random() * 151) + 1;

const flashVariants = [
  'flash-shine',
  'flash-electric',
  'flash-fairy',
  'flash-fiery',
  'flash-aurora',
  'flash-water',
  'flash-psychic',
  'flash-dragon',
  'flash-grass',

];

const PokemonGame = ({ onComplete }) => {
  const [pokemon, setPokemon] = useState(null);
  const [showPokeball, setShowPokeball] = useState(true);
  const [glow, setGlow] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [flashDone, setFlashDone] = useState(false);
  const [flashClass, setFlashClass] = useState('flash-shine');

  const baseUrl = import.meta.env.BASE_URL;

  const fetchPokemon = async () => {
    const id = getRandomPokemonId();
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await response.json();
      setPokemon({
        name: data.name,
        imageUrl: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      });
    } catch (error) {
      console.error('Failed to fetch Pokémon:', error);
    }
  };

  const handlePokeballClick = () => {
    const randomFlash = flashVariants[Math.floor(Math.random() * flashVariants.length)];
    setFlashClass(randomFlash);
    setGlow(true);

    setTimeout(() => setShowPokeball(false), 1500);
    setTimeout(() => {
      setGlow(false);
      setFlashDone(true);
      setReveal(true);
      fetchPokemon();
    }, 4000);
  };

  const backgroundImageUrl = flashDone
    ? `${baseUrl}pokemonBackground.jpg`
    : `${baseUrl}wordInputBackground.jpg`;

  return (
    <div
      className="absolute inset-0 bg-cover bg-center flex flex-col items-center justify-center text-white space-y-6 px-4"
      style={{ backgroundImage: `url(${backgroundImageUrl})` }}
    >
      {glow && <div className={`flash-overlay ${flashClass}`}></div>}

      {showPokeball && (
        <div
          className="z-10 cursor-pointer transition-transform hover:scale-110"
          onClick={handlePokeballClick}
        >
          <img
            src={`${baseUrl}pokeball.svg`}
            alt="Pokéball"
            className="w-60 h-60 sm:w-42 sm:h-42 md:w-50 md:h-50 lg:w-100 lg:h-100 drop-shadow-2xl"
          />
        </div>
      )}

      {reveal && pokemon && (
        <div className="z-10 flex flex-col items-center space-y-6 text-center transition-opacity duration-500">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold drop-shadow-lg text-yellow-300 tracking-wide mt-4">
            You caught a Pokémon!
          </h2>
          <img
            src={pokemon.imageUrl}
            alt={pokemon.name}
            className="w-40 h-40 sm:w-52 sm:h-52 md:w-64 md:h-64 lg:w-160 lg:h-120 object-contain drop-shadow-2xl"
          />
          <p className="text-2xl uppercase sm:text-3xl md:text-4xl font-bold drop-shadow-md text-white">
            {pokemon.name}
          </p>
          <button
            onClick={onComplete}
            className="mt-4 font-extrabold px-6 py-3 sm:px-8 sm:py-3 bg-gradient-to-r from-pink-500 to-yellow-400 hover:from-pink-500 hover:to-yellow-600 text-white text-base sm:text-lg rounded-full shadow-lg transition-transform transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      )}
    </div>
  );
};

export default PokemonGame;
