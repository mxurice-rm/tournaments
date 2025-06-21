import dotenv from "dotenv";
import { database } from "@/database";
import { user } from "@/database/schema";
import { eq } from "drizzle-orm";

dotenv.config();

async function registerUser() {
  try {
    console.log("📨 Attempting to register a new user...");
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/sign-up/email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Admin",
          email: "admin@test.de",
          password: "adminadmin",
          username: "admin",
        }),
      },
    );

    const data = await response.json();

    if (response.ok) {
      console.log("✅ User successfully registered!");
      return data;
    } else {
      console.error(`❌ API Error: ${data.message}`);
      return null;
    }
  } catch (error) {
    console.error("❌ An error occurred while registering the user:", error);
    return null;
  }
}

async function updateUserRole(userId: string) {
  try {
    console.log(`🔄 Updating role for user with ID: ${userId}...`);
    const updatedUser = await database
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.id, userId))
      .returning();

    if (updatedUser.length > 0) {
      console.log("✅ User role successfully updated to admin!");
    } else {
      console.error("❌ Failed to update the user role.");
    }
  } catch (error) {
    console.error(
      "❌ An error occurred while updating the user's role:",
      error,
    );
  }
}

async function main() {
  console.log("🚀 Starting user creation process...");

  const userData = await registerUser();
  if (!userData) {
    console.error("❌ User registration failed. Process terminated.");
    return;
  }

  const userId = userData.user.id;
  await updateUserRole(userId);

  console.log("🎉 Process completed!");
}

main().catch((error) =>
  console.error("🔥 Something went horribly wrong:", error),
);
