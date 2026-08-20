import User from "../models/User.js";

export async function fixUsernameIndex() {
  const collection = User.collection;
  const indexes = await collection.indexes();
  const usernameIndex = indexes.find((index) => index.name === "username_1");

  if (usernameIndex) {
    try {
      await collection.dropIndex("username_1");
      console.log("Dropped username_1 index.");
    } catch (error) {
      console.warn("Could not drop username_1 index:", error.message);
    }
  }

  const result = await collection.updateMany(
    { $or: [{ username: null }, { username: "" }] },
    { $unset: { username: "" } }
  );

  if (result.modifiedCount > 0) {
    console.log(`Removed empty username from ${result.modifiedCount} user(s).`);
  }

  await User.syncIndexes();
  console.log("Ensured sparse unique index on users.username.");
}
