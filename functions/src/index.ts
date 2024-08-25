import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { Account } from "./types/Account";
import axios from "axios";
import * as querystring from "querystring";

import { GeneratedText } from "./types/Text";

admin.initializeApp();
export const createAccount = functions.auth.user().onCreate(async (user) => {
  try {
    // Check if the account already exists
    const accountRef = admin.firestore().collection("accounts").doc(user.uid);
    const accountSnapshot = await accountRef.get();

    if (accountSnapshot.exists) {
      console.log("Account already exists.");
      return;
    }

    // Create the initial account data
    const initialAccount: Account = {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || "New User",
      score: 6.0,
      unknownWords: [],
    };

    // Create the account
    await accountRef.set(initialAccount);
    console.log("Account created successfully:", initialAccount);
  } catch (error) {
    console.error("Error creating account:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to create account"
    );
  }
});

const API_KEY = "vLlPMpZ0FD4eF3QjUnfrv-_oi2zQj53la10qqQxc0HPi";
const TOKEN_URL = "https://iam.cloud.ibm.com/identity/token";
const GENERATION_URL =
  "https://us-south.ml.cloud.ibm.com/ml/v1/text/generation?version=2023-05-29";

async function getAccessToken(apiKey: string): Promise<string> {
  const data = querystring.stringify({
    grant_type: "urn:ibm:params:oauth:grant-type:apikey",
    apikey: apiKey,
  });

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  try {
    const response = await axios.post(TOKEN_URL, data, config);
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to get access token:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("Response data:", error.response.data);
      console.error("Response status:", error.response.status);
    }
    throw new functions.https.HttpsError(
      "internal",
      "Failed to get access token"
    );
  }
}
async function generateText(
  prompt: string,
  accessToken: string
): Promise<string> {
  const body = {
    input: prompt,
    parameters: {
      decoding_method: "sample",
      max_new_tokens: 500,
      temperature: 0.7,
      top_k: 50,
      top_p: 1,
      repetition_penalty: 1,
    },
    model_id: "meta-llama/llama-3-405b-instruct",
    project_id: "761d2bec-ffdd-47fc-a86f-6f09b649cb22",
    moderations: {
      hap: {
        input: {
          enabled: true,
          threshold: 0.5,
          mask: {
            remove_entity_value: true,
          },
        },
        output: {
          enabled: true,
          threshold: 0.5,
          mask: {
            remove_entity_value: true,
          },
        },
      },
    },
  };

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    const response = await axios.post(GENERATION_URL, body, { headers });
    if (response.status !== 200) {
      throw new Error(`Non-200 response: ${response.status}`);
    }
    return response.data.results[0].generated_text;
  } catch (error) {
    console.error("Failed to generate text:", error);
    throw new functions.https.HttpsError("internal", "Failed to generate text");
  }
}

export const generatePracticeText = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const uid = context.auth.uid;

    try {
      // Fetch the user's account to get their current score
      const accountDoc = await admin
        .firestore()
        .collection("accounts")
        .doc(uid)
        .get();
      if (!accountDoc.exists) {
        throw new functions.https.HttpsError(
          "not-found",
          "User account not found"
        );
      }

      const accountData = accountDoc.data();
      const currentLevel = accountData?.score || 6.0; // Default to 6.0 if score is not set

      const accessToken = await getAccessToken(API_KEY);
      const prompt = `Generate a short text of around 4 sentences meant for a student of around IELTS ${currentLevel.toFixed(
        1
      )}. It must include vocabulary around that level. Generate ONLY the text and no explanations, no answers, ONLY THE TEXT(THIS IS VERY VERY IMPORTANT).`;
      const generatedText = await generateText(prompt, accessToken);

      // Create a new document reference to get the ID before setting the data
      const docRef = admin
        .firestore()
        .collection("accounts")
        .doc(uid)
        .collection("generatedText")
        .doc();

      const generatedTextData: GeneratedText = {
        id: docRef.id,
        text: generatedText,
        uid: uid,
        score: currentLevel,
        createdAt: Date.now(),
        completed: false,
        suggested_words: [],
        unkown_words: [],
      };

      // Set the data using the document reference
      await docRef.set(generatedTextData);

      return generatedTextData;
    } catch (error) {
      console.error("Error generating practice text:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to generate practice text"
      );
    }
  }
);

async function determineIELTSLevel(
  difficultWords: string[],
  accessToken: string
): Promise<number> {
  const body = {
    input: `Estimate the IELTS score of this person, provide only the numerical value (e.g., 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0, 5.5, 6.0. 6.5, 7.0, 7.5, 8.0, 8.5, 9.0) and NOTHING else based on the following words which the found. DO NOT RETURN ANYTHING ELSE.

    Input: difficult_words = [${difficultWords.join(", ")}]
    `,
    parameters: {
      decoding_method: "sample",
      max_new_tokens: 200,
      temperature: 0.7,
      top_k: 50,
      top_p: 1,
      repetition_penalty: 1,
    },
    model_id: "google/flan-t5-xl",
    project_id: "761d2bec-ffdd-47fc-a86f-6f09b649cb22",
    moderations: {
      hap: {
        input: {
          enabled: true,
          threshold: 0.5,
          mask: {
            remove_entity_value: true,
          },
        },
        output: {
          enabled: true,
          threshold: 0.5,
          mask: {
            remove_entity_value: true,
          },
        },
      },
    },
  };

  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`,
  };

  try {
    const response = await axios.post(GENERATION_URL, body, { headers });
    const estimatedLevel = parseFloat(response.data.results[0].generated_text);
    if (isNaN(estimatedLevel)) {
      throw new Error("Failed to parse estimated IELTS level");
    }
    return estimatedLevel;
  } catch (error) {
    console.error("Failed to determine IELTS level:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to determine IELTS level"
    );
  }
}

export const processSelectedWords = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "User must be authenticated"
      );
    }

    const { selectedWords, generatedTextId } = data;
    const uid = context.auth.uid;

    try {
      const accessToken = await getAccessToken(API_KEY);
      const estimatedLevel = await determineIELTSLevel(
        selectedWords,
        accessToken
      );

      // Update user's IELTS score
      await admin.firestore().collection("accounts").doc(uid).update({
        score: estimatedLevel,
      });

      // Update the generatedText document
      await admin
        .firestore()
        .collection("accounts")
        .doc(uid)
        .collection("generatedText")
        .doc(generatedTextId)
        .update({
          completed: true,
          score: estimatedLevel,
          unkown_words: selectedWords,
        });

      // Fetch word meanings (you'll need to implement this part based on your word database)
      const wordMeanings = await fetchWordMeanings(selectedWords);

      return {
        success: true,
        newScore: estimatedLevel,
        unknownWords: wordMeanings,
      };
    } catch (error) {
      console.error("Error processing selected words:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Failed to process selected words"
      );
    }
  }
);

// You'll need to implement this function based on your word database
async function fetchWordMeanings(
  words: string[]
): Promise<Record<string, string>> {
  // This is a placeholder. Replace with actual implementation to fetch word meanings.
  return words.reduce((acc, word) => {
    acc[word] = "Placeholder meaning for " + word;
    return acc;
  }, {} as Record<string, string>);
}
