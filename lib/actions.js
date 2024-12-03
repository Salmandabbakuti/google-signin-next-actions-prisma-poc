"use server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "./prisma";

const client = new OAuth2Client({
  clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
});

const updateUserSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" }),
  bio: z.string().optional(),
  picture: z.string().url().optional(),
  country: z.string().optional(),
  phone: z
    .string()
    .min(8, { message: "Phone number must be at least 8 digits" })
    .max(15, { message: "Phone number must be at most 15 digits" })
    .optional()
});

export async function googleLogin(credential) {
  console.log("Google Login");
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
    });
    const payload = ticket.getPayload();
    console.log("Google login payload:", payload);
    const { sub, email, name, picture } = payload;
    //check if user exists, if not create
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        lastActiveAt: new Date()
      },
      create: { sub, name, email, picture }
    });
    console.log("Google login user:", user);
    const sessionToken = jwt.sign(
      { id: user.id, email, sub, name },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h"
      }
    );
    const cookieStore = cookies();
    cookieStore.set("session_token", sessionToken);
  } catch (error) {
    console.error("Google login failure:", error);
    throw new Error("Google login failed");
  }
  redirect("/profile");
}

// validate jwt token and update profile
// return updated user
// revalidate the profile page
export async function updateMyProfile(data) {
  console.log("Update profile data:", data);
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("session_token");
  if (!sessionToken?.value) {
    console.log("Token not found. redirecting to login");
    redirect("/");
  }
  const session = jwt.verify(sessionToken?.value, process.env.JWT_SECRET);
  const validatedData = updateUserSchema.parse(data);
  const user = await prisma.user.update({
    where: { id: session.id },
    data: validatedData
  });
  revalidatePath("/profile");
  return user;
}

export async function getMyProfile() {
  console.log("Get my profile");
  const cookieStore = cookies();
  const sessionToken = cookieStore.get("session_token");
  if (!sessionToken?.value) {
    console.log("Token not found. redirecting to login");
    redirect("/");
  }
  const session = jwt.verify(sessionToken?.value, process.env.JWT_SECRET);
  return prisma.user.findUnique({
    where: { id: session.id }
  });
}

export async function logout() {
  console.log("Logout user");
  const cookieStore = cookies();
  cookieStore.delete("session_token");
  redirect("/");
}
