import "./App.css";
import Board from "./components/Board";
import React, { useState, createContext, useEffect,useContext,useCallback } from "react";
import wordBank from "./wordle-bank.txt";

export const AppContext = createContext();

function App() {

  const boardDefault = [
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
    ["", "", "", "", ""],
  ];
  const [board, setBoard] = useState(boardDefault);
  const [currAttempt, setCurrAttempt] = useState({ attempt: 0, letter: 0 });
  const [wordSet, setWordSet] = useState(new Set());
  const [correctWord, setCorrectWord] = useState("");
  const [disabledLetters, setDisabledLetters] = useState([]);
  const [almostLetters, setAlmostLetters] = useState([]);
  const [correctLetters, setCorrectLetters] = useState([]);
  const [gameOver, setGameOver] = useState({
    gameOver: false,
    guessedWord: false,
  });

  const generateWordSet = async () => {
    let wordSet;
    let todaysWord;
    await fetch(wordBank)
      .then((response) => response.text())
      .then((result) => {
        const wordArr = result.split("\n");
        todaysWord = wordArr[Math.floor(Math.random() * wordArr.length)].trim(); // Remove trailing \r
        wordSet = new Set(wordArr.map((word) => word.trim())); // Remove \r from all words
      });
  
    return { wordSet, todaysWord };
  };

  useEffect(() => {
    generateWordSet().then((words) => {
      console.log(words)
      setWordSet(words.wordSet);
      setCorrectWord(words.todaysWord);
    });
  }, []);

  const onEnter = () => {
    if (currAttempt.letter !== 5) return;

    let currWord = "";
    for (let i = 0; i < 5; i++) {
      currWord += board[currAttempt.attempt][i];
    }
    if (wordSet.has(currWord.toLowerCase())) {
      if (currWord === correctWord.toUpperCase()) {
        setGameOver({ gameOver: true, guessedWord: true });
        return;
      }
      else if (currAttempt.attempt === 5) {
        setGameOver({ gameOver: true, guessedWord: false });
        return;
      }
      else{
        setCurrAttempt({ attempt: currAttempt.attempt + 1, letter: 0 });
      }
    } else {
      alert("Word not found");
    }

  };

  const onDelete = () => {
    if (currAttempt.letter === 0) return;
    const newBoard = [...board];
    newBoard[currAttempt.attempt][currAttempt.letter - 1] = "";
    setBoard(newBoard);
    setCurrAttempt({ ...currAttempt, letter: currAttempt.letter - 1 });
  };

  const onSelectLetter = (key) => {
    if (currAttempt.letter > 4) return;
    const newBoard = [...board];
    newBoard[currAttempt.attempt][currAttempt.letter] = key;
    setBoard(newBoard);
    setCurrAttempt({
      attempt: currAttempt.attempt,
      letter: currAttempt.letter + 1,
    });
  };

  const Key=({ keyVal, bigKey, disabled,almost,correct})=>{
    const { gameOver, onSelectLetter, onDelete, onEnter } =
    useContext(AppContext);
  
  const selectLetter = () => {
    if (gameOver.gameOver) return;
    if (keyVal === "ENTER") {
      onEnter();
    } else if (keyVal === "DELETE") {
      onDelete();
    } else {
      onSelectLetter(keyVal);
    }
  };
  return (
    <div
      className="key"
      id={bigKey ? "big" : correct? "correct":disabled?"disabled":almost?"almost": undefined }
      onClick={selectLetter}
    >
      {keyVal}
    </div>
  );
  }

  const Keyboard=()=>{
    const keys1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
    const keys2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
    const keys3 = ["Z", "X", "C", "V", "B", "N", "M"];
  
    const {
      board,
      disabledLetters,
      currAttempt,
      gameOver,
      onSelectLetter,
      onEnter,
      onDelete,
      almostLetters,
      correctLetters
    } = useContext(AppContext);
  
    const handleKeyboard = useCallback(
      (event) => {
        if (gameOver.gameOver) return;
        if (event.key === "Enter") {
          onEnter();
        } else if (event.key === "Backspace") {
          onDelete();
        } else {
          keys1.forEach((key) => {
            if (event.key.toLowerCase() === key.toLowerCase()) {
              onSelectLetter(key);
            }
          });
          keys2.forEach((key) => {
            if (event.key.toLowerCase() === key.toLowerCase()) {
              onSelectLetter(key);
            }
          });
          keys3.forEach((key) => {
            if (event.key.toLowerCase() === key.toLowerCase()) {
              onSelectLetter(key);
            }
          });
        }
      },
      [currAttempt]
    );
    useEffect(() => {
      document.addEventListener("keydown", handleKeyboard);
  
      return () => {
        document.removeEventListener("keydown", handleKeyboard);
      };
    }, [handleKeyboard]);
  
    return (
      <div className="keyboard" onKeyDown={handleKeyboard}>
        <div className="line1">
          {keys1.map((key) => {
            return <Key keyVal={key} disabled={disabledLetters.includes(key)} almost={almostLetters.includes(key)} correct={correctLetters.includes(key)}/>;
          })}
        </div>
        <div className="line2">
          {keys2.map((key) => {
            return <Key keyVal={key} disabled={disabledLetters.includes(key)} almost={almostLetters.includes(key)} correct={correctLetters.includes(key)} />;
          })}
        </div>
        <div className="line3">
          <Key keyVal={"ENTER"} bigKey />
          {keys3.map((key) => {
            return <Key keyVal={key} disabled={disabledLetters.includes(key)} almost={almostLetters.includes(key)} correct={correctLetters.includes(key)} />;
          })}
          <Key keyVal={"DELETE"} bigKey />
        </div>
      </div>
    );
  }

  

  return (
    <div className="App">
      <nav>
        <h1>Wordle</h1>
      </nav>
      <AppContext.Provider
        value={{
          board,
          setBoard,
          currAttempt,
          setCurrAttempt,
          correctWord,
          onSelectLetter,
          onDelete,
          onEnter,
          setDisabledLetters,
          disabledLetters,
          gameOver,
          correctLetters,
          setCorrectLetters,
          almostLetters,
          setAlmostLetters
        }}
      >
        <div className="game">
          <Board />
          {gameOver.gameOver ? <div className="gameOver">
      <h3>
        {gameOver.guessedWord
          ? "You Correctly Guessed the Wordle"
          : "You Failed to Guess the Word"}
      </h3>
      <h1>Correct Word: {correctWord}</h1>
      {gameOver.guessedWord && (
        <h3>You guessed in {currAttempt.attempt +1} attempts</h3>
      )}
    </div> : <Keyboard />}
        </div>
      </AppContext.Provider>
    </div>
  );
}

export default App;
