"use server";

import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { parseStringify } from "../utils";

export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();
    const response = await account.createEmailPasswordSession(email, password);

    return parseStringify(response);
  } catch (error) {
    console.log("Sign-in error", error);
  }
};

export const signUp = async (userData: SignUpParams) => {
  //   console.log("userData", userData);
  // if (userData) console.log("userData", userData);
  try {
    const { email, password, firstName, lastName } = userData;
    console.log(email);

    // Mutation / Database / Make fetch
    const { account } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );

    const session = await account.createEmailPasswordSession(email, password);

    const cookieStore = await cookies();

    cookieStore.set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUserAccount);
  } catch (error) {
    console.log("Sign up error: ", error);
  }
};

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const user = await account.get();

    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createAdminClient(); // this returns an object containing account property

    const cookieStore = await cookies();

    cookieStore.delete("appwrite-session");

    await account.deleteSession("current");
  } catch (error) {
    console.log("Log out error: ", error);
    return null;
  }
};
