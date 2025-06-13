// api to get locations in nigeria and their cities
// note: using fetch because of server side caching nextjs
/**
 * Fetches all states in Nigeria from the API
 * @returns {Promise<string[]>} List of states
 * @throws {Error} If the request fails
 */
export const fetchStates = async (): Promise<string[]> => {
  try {
    const response = await fetch("https://nga-states-lga.onrender.com/fetch");
    if (!response.ok) {
      throw new Error("Failed to fetch states");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching states:", error);
    throw error;
  }
};

/**
 * Fetches all LGAs for a specific state in Nigeria
 * @param {string} state - The state to fetch LGAs for
 * @returns {Promise<string[]>} List of LGAs
 * @throws {Error} If the request fails
 */
export const fetchLGAs = async (state: string): Promise<string[]> => {
  try {
    const response = await fetch(
      `https://nga-states-lga.onrender.com/?state=${state}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch LGAs");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching LGAs:", error);
    throw error;
  }
};
