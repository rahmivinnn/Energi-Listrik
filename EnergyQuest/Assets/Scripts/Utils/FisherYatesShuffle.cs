using System.Collections.Generic;
using UnityEngine;

namespace EnergyQuest.Utils
{
    public static class FisherYatesShuffle
    {
        /// <summary>
        /// Shuffles a list using the Fisher-Yates shuffle algorithm
        /// This ensures truly random and unbiased shuffling
        /// </summary>
        /// <typeparam name="T">Type of items in the list</typeparam>
        /// <param name="list">List to shuffle</param>
        public static void Shuffle<T>(IList<T> list)
        {
            int n = list.Count;
            
            // Fisher-Yates shuffle implementation
            for (int i = n - 1; i > 0; i--)
            {
                // Generate random index between 0 and i (inclusive)
                int randomIndex = Random.Range(0, i + 1);
                
                // Swap elements
                T temp = list[i];
                list[i] = list[randomIndex];
                list[randomIndex] = temp;
            }
        }

        /// <summary>
        /// Returns a shuffled copy of the input list without modifying the original
        /// </summary>
        /// <typeparam name="T">Type of items in the list</typeparam>
        /// <param name="originalList">Original list to shuffle</param>
        /// <returns>New shuffled list</returns>
        public static List<T> GetShuffledCopy<T>(IList<T> originalList)
        {
            List<T> shuffledList = new List<T>(originalList);
            Shuffle(shuffledList);
            return shuffledList;
        }

        /// <summary>
        /// Selects a random subset of items from a list and shuffles them
        /// Used for quiz questions where we want N random questions from a larger pool
        /// </summary>
        /// <typeparam name="T">Type of items in the list</typeparam>
        /// <param name="originalList">Source list</param>
        /// <param name="count">Number of items to select</param>
        /// <returns>Shuffled subset of the original list</returns>
        public static List<T> GetRandomSubset<T>(IList<T> originalList, int count)
        {
            if (count >= originalList.Count)
            {
                return GetShuffledCopy(originalList);
            }

            // Create a copy and shuffle it
            List<T> shuffledCopy = GetShuffledCopy(originalList);
            
            // Return only the first 'count' items
            List<T> subset = new List<T>();
            for (int i = 0; i < count; i++)
            {
                subset.Add(shuffledCopy[i]);
            }

            return subset;
        }
    }
}