import { ToolbarPosition } from '../stores/toolbarStore';
import { UserPreferences } from '../types';

const API_BASE_URL = '/api/user/preferences';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Sleep utility for retry delays
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Calculate exponential backoff delay
 */
const getRetryDelay = (attempt: number): number => {
  return INITIAL_RETRY_DELAY * Math.pow(2, attempt);
};

/**
 * Save user preferences to the API with retry logic
 * @param userId - The user ID
 * @param toolbarPosition - The toolbar position to save
 * @returns The saved preferences, or null if all retries failed
 */
export const saveUserPreferences = async (
  userId: string,
  toolbarPosition: ToolbarPosition
): Promise<UserPreferences | null> => {
  const preferences: Partial<UserPreferences> = {
    userId,
    toolbarPosition,
    updatedAt: new Date(),
  };

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as UserPreferences;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed to save preferences:`, error);
      
      // If this was the last attempt, return null
      if (attempt === MAX_RETRIES - 1) {
        console.error('All retry attempts exhausted for saving preferences');
        return null;
      }
      
      // Wait before retrying with exponential backoff
      const delay = getRetryDelay(attempt);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  return null;
};

/**
 * Load user preferences from the API with retry logic
 * @param userId - The user ID
 * @returns The user preferences, or null if not found or all retries failed
 */
export const loadUserPreferences = async (
  userId: string
): Promise<UserPreferences | null> => {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}?userId=${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        // No preferences found, this is not an error
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data as UserPreferences;
    } catch (error) {
      console.error(`Attempt ${attempt + 1} failed to load preferences:`, error);
      
      // If this was the last attempt, return null
      if (attempt === MAX_RETRIES - 1) {
        console.error('All retry attempts exhausted for loading preferences');
        return null;
      }
      
      // Wait before retrying with exponential backoff
      const delay = getRetryDelay(attempt);
      console.log(`Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  return null;
};
