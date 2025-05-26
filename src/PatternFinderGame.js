import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const cn = (...classes) => classes.filter(Boolean).join(' ');
// Helper function to generate a simple pattern (for demonstration)
// Helper function to generate a simple pattern (for demonstration)
const generatePattern = (level) => {
    const operations = ['*', '+', '-', '/'];
    const numOperations = Math.min(level, operations.length);
    const selectedOperations = operations.slice(0, numOperations);
    const operation = selectedOperations[Math.floor(Math.random() * numOperations)];

    const base = Math.floor(Math.random() * 10) + 1;
    const operand2 = Math.floor(Math.random() * 10) + (operation === '/' ? 1 : 0);
    const addend = Math.floor(Math.random() * 5);

    const examples = [];
    for (let i = 1; i <= 3; i++) {
        let result;
        switch (operation) {
            case '+':
                result = base + i * operand2;
                break;
            case '-':
                result = base - i * operand2;
                break;
            case '*':
                result = base * i * operand2;
                break;
            case '/':
                result = Math.floor(base / (i * operand2));
                break;
            default:
                result = base * i;
        }
        if (level > 3) {
            result += addend;
        }
        examples.push(`f(${i}) = ${result}`);
    }

    let solution;
     switch (operation) {
        case '+':
            solution = level > 3 ? `f(x) = ${base} + x * ${operand2} + ${addend}` : `f(x) = ${base} + x * ${operand2}`;
            break;
        case '-':
            solution = level > 3 ? `f(x) = ${base} - x * ${operand2} + ${addend}` : `f(x) = ${base} - x * ${operand2}`;
            break;
        case '*':
             solution = level > 3 ? `f(x) = ${base} * x * ${operand2} + ${addend}` :  `f(x) = ${base} * x * ${operand2}`;
            break;
        case '/':
            solution = level > 3 ? `f(x) = ${base} / (x * ${operand2}) + ${addend}` :  `f(x) = ${base} / (x * ${operand2})`;
            break;
        default:
            solution = level > 3 ? `f(x) = ${base} * x + ${addend}` : `f(x) = ${base} * x`;
    }

    // Generate incorrect options (more sophisticated logic needed for better options)
    const incorrectOptions = [];
     if (operation === '*')
    {
         incorrectOptions.push(`f(x) = ${base * operand2} + x`); // Incorrect: Addition instead of multiplication
         incorrectOptions.push(`f(x) = ${base} * x + ${operand2}`);
    }
    else if (operation === '+') {
        incorrectOptions.push(`f(x) = ${base} * x * ${operand2}`);
        incorrectOptions.push(`f(x) = ${base} + x`);
    }
     else if (operation === '-') {
        incorrectOptions.push(`f(x) = ${base} * x * ${operand2}`);
        incorrectOptions.push(`f(x) = ${base} - x`);
    }
    else if (operation === '/') {
        incorrectOptions.push(`f(x) = ${base} * x * ${operand2}`);
        incorrectOptions.push(`f(x) = ${base} /  x`);
    }
    else{
        incorrectOptions.push(`f(x) = ${base} + x`);
        incorrectOptions.push(`f(x) = ${base} * x * 2`);
    }
    const options = [solution, ...incorrectOptions.slice(0, 2)]; // Ensure 3 options
    shuffleArray(options); // Shuffle the options

    return {
        examples,
        solution,
        level,
        options,
    };
};

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

const PatternFinderGame = () => {
    const [currentPattern, setCurrentPattern] = useState(generatePattern(1));
    const [userAnswer, setUserAnswer] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);
    const [gameOver, setGameOver] = useState(false);
    const [attempts, setAttempts] = useState(3);
    const [feedback, setFeedback] = useState('');
    const [correctAnswers, setCorrectAnswers] = useState(0);

    // Function to generate a new pattern
    const nextPattern = useCallback(() => {
        if (isCorrect) {
            setScore((prevScore) => prevScore + attempts * 10);
            setCorrectAnswers(prevCorrectAnswers => prevCorrectAnswers + 1);
        }
        if (level < 3) { // Changed from 5 to 3
            setLevel((prevLevel) => prevLevel + 1);
        }

        if (level >= 3) {
            setGameOver(true); // End game after level 3
            return;
        }
        const newPattern = generatePattern(level < 3 ? level + 1 : level); //changed from 5 to 3
        setCurrentPattern(newPattern);
        setUserAnswer(null); // Reset user answer
        setIsCorrect(null);
        setAttempts(3);
        setFeedback('');
    }, [isCorrect, level, attempts, correctAnswers]);

    // Use useEffect to update currentPattern when level changes
    useEffect(() => {
        setCurrentPattern(generatePattern(level));
    }, [level]);

    const handleAnswerSelection = (selectedAnswer) => {
        if (attempts <= 0) return;

        setUserAnswer(selectedAnswer); // Store selected answer
        const correctSolution = currentPattern.solution;

        if (selectedAnswer === correctSolution) {
            setIsCorrect(true);
            setFeedback('Correct!');
            setScore(prevScore => prevScore + attempts * 10);
            setCorrectAnswers(prevCorrectAnswers => prevCorrectAnswers + 1);
            setTimeout(nextPattern, 1500);
        } else {
            setIsCorrect(false);
            setAttempts((prevAttempts) => prevAttempts - 1);
            setFeedback(`Incorrect! Attempts left: ${attempts - 1} The correct answer was ${correctSolution}`);
            setTimeout(nextPattern, 1500); // ADDED THIS LINE: Proceed to next level after incorrect answer
            if (attempts <= 1) {
                setGameOver(true);
                setFeedback(`Game Over! The correct answer was ${correctSolution}.`);
            }
        }
    };

    const resetGame = () => {
        setLevel(1);
        setScore(0);
        setGameOver(false);
        setUserAnswer(null);
        setIsCorrect(null);
        setAttempts(3);
        setCurrentPattern(generatePattern(1));
        setFeedback('');
        setCorrectAnswers(0);
    };

    const getGeniusRating = () => {
        // const percentage = (score / 300) * 100; // Max score is 300 (3 levels * 100)
        let percentage = 0;
        if (correctAnswers === 3)
        {
            percentage = 100;
        }
        else if (correctAnswers === 2)
        {
             percentage = 50;
        }
        else if (correctAnswers === 1)
        {
            percentage = 25;
        }
        else{
            percentage = 0;
        }
        let rating = '';
        if (percentage === 100) {
            rating = 'an absolute Antiunification Genius!';
        } else if (percentage === 50) {
            rating = 'a Master of Antiunification!';
        } else if (percentage === 25) {
            rating = 'a very skilled Antiunifier!';
        } else {
            rating = 'an Antiunification Novice!';
        }
        return `You are ${rating} (${percentage.toFixed(0)}%)`;
    };

    // const buttonClassName = cn(
    //     "bg-blue-500/90 text-white hover:bg-blue-500/80 transition-colors px-6 py-2 rounded-md",
    //     {
    //         "bg-green-500/90 hover:bg-green-500/80": isCorrect === true,
    //         "bg-red-500/90 hover:bg-red-500/80"    : isCorrect === false,
    //         "opacity-50 cursor-not-allowed": attempts <= 0,
    //     }
    // );
    let buttonClassName = "bg-blue-500/90 text-white hover:bg-blue-500/80 transition-colors px-6 py-2 rounded-md";

      if (isCorrect === true) {
        buttonClassName = "bg-green-500/90 text-white hover:bg-green-500/80 transition-colors px-6 py-2 rounded-md";
    } else if (isCorrect === false) {
        buttonClassName = "bg-red-500/90 text-white hover:bg-red-500/80 transition-colors px-6 py-2 rounded-md";
    } else if (attempts <= 0) {
        buttonClassName = "opacity-50 cursor-not-allowed bg-blue-500/90 text-white hover:bg-blue-500/80 transition-colors px-6 py-2 rounded-md";
    }


    return (
        <div style={{
            minHeight: '100vh',
            backgroundImage: 'linear-gradient(to bottom right, #1f2937, #374151)', // Tailwind equivalent: from-gray-900 to-gray-800
            color: '#fff', // text-white
            padding: '1rem',  // p-4
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{ maxWidth: '4xl', width: '100%', spaceY: '2rem' }}> {/* Tailwind equivalent: max-w-4xl w-full space-y-8 */}
                <h1 style={{
                    fontSize: '2.25rem', // text-4xl
                    fontWeight: 'bold',  // font-bold
                    textAlign: 'center', // text-center
                    backgroundImage: 'linear-gradient(to right, #60a5fa, #8b5cf6)', // from-blue-400 to-purple-400
                    color: 'transparent',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    display: 'inline-block'
                }}>
                    Pattern Finder
                </h1>

                <AnimatePresence>
                    {!gameOver ? (
                        <motion.div
                            key={currentPattern.level}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            style={{ spaceY: '1rem' }} // Tailwind equivalent: space-y-4
                        >
                            <div style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)', // bg-white/5
                                backdropFilter: 'blur(10px)',             // backdrop-blur-md
                                border: '1px solid rgba(255, 255, 255, 0.1)', // border-white/10
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // shadow-lg
                                borderRadius: '0.75rem', // rounded-xl
                                padding: '1.5rem'       // p-6
                            }}>
                                <div style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '0.5rem' }}>Level {currentPattern.level}</div> {/* text-2xl text-white mb-2 */}
                                <div style={{ color: '#d1d5db', marginBottom: '1rem' }}>
                                    Find the function that generates these examples:
                                </div>
                                <div style={{ marginBottom: '1rem', spaceY: '0.5rem' }}>
                                    {currentPattern.examples.map((example, index) => (
                                        <p key={index} style={{ fontSize: '1.125rem', color: '#e5e7eb' }}>
                                            {example}
                                        </p>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {currentPattern.options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelection(option)}
                                            disabled={isCorrect !== null || attempts <= 0}
                                            style={{
                                                width: '100%',
                                                textAlign: 'left',
                                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                                transition: 'background-color 0.3s ease',
                                                color: '#fff',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                borderRadius: '0.375rem',
                                                padding: '0.5rem 1rem',
                                                cursor: attempts <= 0 ? 'not-allowed' : 'pointer',
                                                ...(isCorrect === true && userAnswer === option
                                                    ? { backgroundColor: 'rgba(52, 211, 153, 0.9)', borderColor: '#34d399' }
                                                    : isCorrect === false && userAnswer === option
                                                        ? { backgroundColor: 'rgba(248, 113, 113, 0.9)', borderColor: '#f87171' }
                                                        : {}),
                                                opacity: attempts <= 0 ? 0.5 : 1,
                                            }}
                                        >
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                {feedback && (
                                    <p style={{
                                        marginTop: '1rem',
                                        textAlign: 'center',
                                        transition: 'color 0.3s ease',
                                        color: isCorrect === true ? '#6ee7b7' : '#fca5a5'
                                    }}>
                                        {feedback}
                                    </p>
                                )}
                                 <p style={{ marginTop: '1rem', color: '#9ca3af' }}>Score: {score}</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                                borderRadius: '0.75rem',
                                padding: '2rem',
                                textAlign: 'center'
                            }}
                        >
                            <h2 style={{ fontSize: '1.875rem', fontWeight: 'semibold', color: '#fff', marginBottom: '1rem' }}>Game Over!</h2>
                            <p style={{ fontSize: '1.125rem', color: '#d1d5db', marginBottom: '1.5rem' }}>Your final score is: {score}</p>
                             <p style={{ fontSize: '1.125rem', color: '#d1d5db', marginBottom: '1.5rem' }}>{getGeniusRating()}</p>
                            <button
                                onClick={resetGame}
                                style={{
                                    backgroundColor: 'rgba(52, 211, 153, 0.9)',
                                    color: '#fff',
                                    transition: 'background-color 0.3s ease',
                                    padding: '0.75rem 2rem',
                                    borderRadius: '0.375rem',
                                    hover: { backgroundColor: 'rgba(52, 211, 153, 0.8)' },
                                    cursor: 'pointer'
                                }}
                            >
                                Play Again
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default PatternFinderGame;







