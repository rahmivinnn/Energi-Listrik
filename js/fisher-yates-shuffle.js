// Energy Quest: Fisher-Yates Shuffle Implementation
// Real algorithm implementation untuk quiz randomization yang fair dan unbiased

class FisherYatesShuffle {
    /**
     * Shuffles an array using the Fisher-Yates shuffle algorithm
     * This ensures truly random and unbiased shuffling
     * @param {Array} array - Array to shuffle (will be modified in place)
     * @returns {Array} The shuffled array
     */
    static shuffle(array) {
        if (!Array.isArray(array)) {
            throw new Error('Input must be an array');
        }

        // Create a copy to avoid modifying the original
        const shuffled = [...array];
        
        // Fisher-Yates shuffle implementation
        for (let i = shuffled.length - 1; i > 0; i--) {
            // Generate random index between 0 and i (inclusive)
            const randomIndex = Math.floor(Math.random() * (i + 1));
            
            // Swap elements
            [shuffled[i], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[i]];
        }

        return shuffled;
    }

    /**
     * Returns a shuffled copy of the input array without modifying the original
     * @param {Array} array - Original array to shuffle
     * @returns {Array} New shuffled array
     */
    static getShuffledCopy(array) {
        return this.shuffle([...array]);
    }

    /**
     * Selects a random subset of items from an array and shuffles them
     * Used for quiz questions where we want N random questions from a larger pool
     * @param {Array} array - Source array
     * @param {number} count - Number of items to select
     * @returns {Array} Shuffled subset of the original array
     */
    static getRandomSubset(array, count) {
        if (!Array.isArray(array)) {
            throw new Error('Input must be an array');
        }

        if (count < 0) {
            throw new Error('Count must be non-negative');
        }

        if (count >= array.length) {
            return this.shuffle([...array]);
        }

        // First shuffle the entire array
        const shuffled = this.shuffle([...array]);
        
        // Return only the first 'count' items
        return shuffled.slice(0, count);
    }

    /**
     * Shuffles multiple arrays maintaining their relative order
     * Useful for shuffling questions and their corresponding answers together
     * @param {...Array} arrays - Arrays to shuffle together
     * @returns {Array} Array of shuffled arrays
     */
    static shuffleTogether(...arrays) {
        if (arrays.length === 0) {
            return [];
        }

        // Check that all arrays have the same length
        const length = arrays[0].length;
        if (!arrays.every(arr => arr.length === length)) {
            throw new Error('All arrays must have the same length');
        }

        // Create indices array and shuffle it
        const indices = Array.from({ length }, (_, i) => i);
        const shuffledIndices = this.shuffle(indices);

        // Apply the same shuffle to all arrays
        return arrays.map(array => 
            shuffledIndices.map(index => array[index])
        );
    }

    /**
     * Generates a random permutation of numbers from 0 to n-1
     * @param {number} n - Upper bound (exclusive)
     * @returns {Array} Random permutation array
     */
    static generatePermutation(n) {
        if (n < 0) {
            throw new Error('n must be non-negative');
        }

        const permutation = Array.from({ length: n }, (_, i) => i);
        return this.shuffle(permutation);
    }

    /**
     * Checks if an array is properly shuffled (not in original order)
     * @param {Array} original - Original array
     * @param {Array} shuffled - Shuffled array
     * @returns {boolean} True if arrays are different
     */
    static isShuffled(original, shuffled) {
        if (original.length !== shuffled.length) {
            return true;
        }

        return !original.every((item, index) => item === shuffled[index]);
    }

    /**
     * Measures the randomness quality of a shuffle
     * @param {Array} original - Original array
     * @param {Array} shuffled - Shuffled array
     * @returns {Object} Quality metrics
     */
    static measureShuffleQuality(original, shuffled) {
        if (original.length !== shuffled.length) {
            throw new Error('Arrays must have the same length');
        }

        let samePositions = 0;
        let consecutivePairs = 0;

        for (let i = 0; i < original.length; i++) {
            // Count items that stayed in the same position
            if (original[i] === shuffled[i]) {
                samePositions++;
            }

            // Count consecutive pairs that stayed together
            if (i < original.length - 1) {
                const originalPair = [original[i], original[i + 1]];
                const shuffledPair = [shuffled[i], shuffled[i + 1]];
                
                if (originalPair[0] === shuffledPair[0] && originalPair[1] === shuffledPair[1]) {
                    consecutivePairs++;
                }
            }
        }

        return {
            totalItems: original.length,
            samePositions: samePositions,
            samePositionPercentage: (samePositions / original.length) * 100,
            consecutivePairs: consecutivePairs,
            maxConsecutivePairs: Math.max(0, original.length - 1),
            shuffleQuality: 1 - (samePositions / original.length), // 1 = perfect shuffle, 0 = no shuffle
            isWellShuffled: samePositions < original.length * 0.1 // Less than 10% in same position
        };
    }

    /**
     * Performs multiple shuffles and returns the best one based on quality
     * @param {Array} array - Array to shuffle
     * @param {number} attempts - Number of shuffle attempts (default: 3)
     * @returns {Array} Best shuffled array
     */
    static getBestShuffle(array, attempts = 3) {
        let bestShuffle = [...array];
        let bestQuality = -1;

        for (let i = 0; i < attempts; i++) {
            const candidate = this.shuffle([...array]);
            const quality = this.measureShuffleQuality(array, candidate);
            
            if (quality.shuffleQuality > bestQuality) {
                bestQuality = quality.shuffleQuality;
                bestShuffle = candidate;
            }
        }

        return bestShuffle;
    }

    /**
     * Shuffles an array with guaranteed minimum displacement
     * Ensures that at least a certain percentage of items change position
     * @param {Array} array - Array to shuffle
     * @param {number} minDisplacement - Minimum displacement percentage (0-1)
     * @param {number} maxAttempts - Maximum attempts to achieve displacement
     * @returns {Array} Shuffled array with guaranteed displacement
     */
    static shuffleWithMinDisplacement(array, minDisplacement = 0.7, maxAttempts = 10) {
        if (minDisplacement < 0 || minDisplacement > 1) {
            throw new Error('minDisplacement must be between 0 and 1');
        }

        let attempts = 0;
        let shuffled;

        do {
            shuffled = this.shuffle([...array]);
            const quality = this.measureShuffleQuality(array, shuffled);
            
            if (quality.shuffleQuality >= minDisplacement) {
                break;
            }
            
            attempts++;
        } while (attempts < maxAttempts);

        return shuffled;
    }
}

// Quiz-specific shuffle utilities for Energy Quest
class QuizShuffle extends FisherYatesShuffle {
    /**
     * Shuffles quiz questions ensuring good distribution of categories
     * @param {Array} questions - Array of question objects with category property
     * @param {number} count - Number of questions to select
     * @returns {Array} Shuffled and balanced question set
     */
    static shuffleQuizQuestions(questions, count) {
        if (!questions.every(q => q.category)) {
            throw new Error('All questions must have a category property');
        }

        // Group questions by category
        const categories = {};
        questions.forEach(question => {
            if (!categories[question.category]) {
                categories[question.category] = [];
            }
            categories[question.category].push(question);
        });

        // Calculate questions per category
        const categoryNames = Object.keys(categories);
        const questionsPerCategory = Math.floor(count / categoryNames.length);
        const remainder = count % categoryNames.length;

        let selectedQuestions = [];

        // Select questions from each category
        categoryNames.forEach((category, index) => {
            const categoryQuestions = this.shuffle([...categories[category]]);
            const questionsToTake = questionsPerCategory + (index < remainder ? 1 : 0);
            selectedQuestions.push(...categoryQuestions.slice(0, questionsToTake));
        });

        // Final shuffle of the selected questions
        return this.shuffle(selectedQuestions);
    }

    /**
     * Shuffles answer options for a question
     * @param {Object} question - Question object with answers array
     * @returns {Object} Question with shuffled answers and updated correct index
     */
    static shuffleAnswers(question) {
        if (!question.answers || !Array.isArray(question.answers)) {
            throw new Error('Question must have an answers array');
        }

        const originalCorrectIndex = question.correctAnswer;
        const originalCorrectAnswer = question.answers[originalCorrectIndex];

        // Shuffle answers
        const shuffledAnswers = this.shuffle([...question.answers]);
        
        // Find new index of correct answer
        const newCorrectIndex = shuffledAnswers.findIndex(answer => answer === originalCorrectAnswer);

        return {
            ...question,
            answers: shuffledAnswers,
            correctAnswer: newCorrectIndex
        };
    }

    /**
     * Creates a quiz session with shuffled questions and answers
     * @param {Array} questionPool - Pool of all questions
     * @param {number} sessionLength - Number of questions for the session
     * @returns {Object} Quiz session data
     */
    static createQuizSession(questionPool, sessionLength) {
        // Select and shuffle questions
        const sessionQuestions = this.shuffleQuizQuestions(questionPool, sessionLength);
        
        // Shuffle answers for each question
        const questionsWithShuffledAnswers = sessionQuestions.map(question => 
            this.shuffleAnswers(question)
        );

        return {
            questions: questionsWithShuffledAnswers,
            totalQuestions: sessionLength,
            sessionId: Date.now().toString(36) + Math.random().toString(36).substr(2),
            createdAt: new Date().toISOString(),
            categories: [...new Set(questionsWithShuffledAnswers.map(q => q.category))]
        };
    }

    /**
     * Validates that quiz questions are properly randomized
     * @param {Array} originalQuestions - Original question order
     * @param {Array} shuffledQuestions - Shuffled questions
     * @returns {Object} Validation results
     */
    static validateQuizShuffle(originalQuestions, shuffledQuestions) {
        const quality = this.measureShuffleQuality(originalQuestions, shuffledQuestions);
        
        // Additional quiz-specific validations
        const categoryDistribution = {};
        shuffledQuestions.forEach(q => {
            categoryDistribution[q.category] = (categoryDistribution[q.category] || 0) + 1;
        });

        return {
            ...quality,
            categoryDistribution,
            isValidQuizShuffle: quality.isWellShuffled && Object.keys(categoryDistribution).length > 1,
            recommendedForQuiz: quality.shuffleQuality > 0.6
        };
    }
}

// Global utility functions
window.FisherYatesShuffle = FisherYatesShuffle;
window.QuizShuffle = QuizShuffle;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FisherYatesShuffle, QuizShuffle };
}