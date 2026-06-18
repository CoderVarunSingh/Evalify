import { StreamChat } from "stream-chat";
import { ENV } from "./env.js";
import { StreamClient } from "@stream-io/node-sdk";

const apiKey = ENV.STREAM_API_KEY;
const apiSecret = ENV.STREAM_API_SECRET;

if (!apikey || !apiSecret) {
  console.error("STREAM_API_KEY and STREAM_API_SECRET are missing");
}

export const steamClient = new StreamClient(apiKey, apiSecret);
export const chatClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await chatClient.upsertUser(userData)
    console.log(`Stream user with ID ${userData.id} upserted successfully.`);
  } catch (error) {
    console.error("Error upserting stream user:", error);
  }
};


export const deleteStreamUser = async (userData) => {
  try {
    await chatClient.deleteUser(userData.id)
    console.log(`Stream user with ID ${userData.id} deleted successfully.`);
  } catch (error) {
    console.error("Error deleting the stream user:", error);
  }
};
