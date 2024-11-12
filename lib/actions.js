"use server";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "./prisma";

const client = new OAuth2Client();

export async function googleLogin(credential) {
  console.log("Google Login");
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
    });
    console.log("Google login ticket:", ticket);
    const payload = ticket.getPayload();
    console.log("Google login payload:", payload);
    const { sub, email, name, picture } = payload;
    console.log("Google login sub:", sub);
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
    const cookieStore = await cookies();
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
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");
  if (!sessionToken?.value) {
    console.log("Token not found. redirecting to login");
    redirect("/");
  }
  const session = jwt.verify(sessionToken?.value, process.env.JWT_SECRET);
  const user = await prisma.user.update({
    where: { id: session.id },
    data
  });
  revalidatePath("/profile");
  return user;
}

export async function getMyProfile() {
  console.log("Get my profile");
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session_token");
  console.log("Session token:", sessionToken);
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
  const cookieStore = await cookies();
  cookieStore.delete("session_token");
  redirect("/");
}