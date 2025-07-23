/**
 * Authentication and Request Guards Module
 * 
 * This module provides utility functions for protecting routes and API endpoints
 * by enforcing authentication and HTTP method requirements. These guards are designed
 * to be used in React Router loaders and actions to ensure proper access control
 * and request validation.
 * 
 * The module includes:
 * - Authentication guard to ensure a user is logged in
 * - HTTP method guard to ensure requests use the correct HTTP method
 * - User data helper to get current user info
 */
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { data, redirect } from "react-router";
import { db } from "~/core/db/drizzle-client.server";
import { users } from "~/core/db/schema";
import { eq } from "drizzle-orm";

/**
 * Require user authentication for a route or action
 * 
 * This function checks if a user is currently authenticated by querying the Supabase
 * client. If no user is found, it throws a 401 Unauthorized response, which will be
 * handled by React Router's error boundary system.
 * 
 * @example
 * // In a loader or action function
 * export async function loader({ request }: LoaderArgs) {
 *   const [client] = makeServerClient(request);
 *   await requireAuthentication(client);
 *   
 *   // Continue with authenticated logic...
 *   return json({ ... });
 * }
 * 
 * @param client - The Supabase client instance to use for authentication check
 * @throws {Response} 401 Unauthorized if no user is authenticated
 */
export async function requireAuthentication(client: SupabaseClient) {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) {
    throw data(null, { status: 401 });
  }
}

/**
 * Require a specific HTTP method for a route action
 * 
 * This function returns a middleware that checks if the incoming request uses
 * the specified HTTP method. If not, it throws a 405 Method Not Allowed response.
 * This is useful for ensuring that endpoints only accept the intended HTTP methods.
 * 
 * @example
 * // In an action function
 * export async function action({ request }: ActionArgs) {
 *   requireMethod('POST')(request);
 *   
 *   // Continue with POST-specific logic...
 *   return json({ ... });
 * }
 * 
 * @param method - The required HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE')
 * @returns A function that validates the request method
 * @throws {Response} 405 Method Not Allowed if the request uses an incorrect method
 */
export function requireMethod(method: string) {
  return (request: Request) => {
    if (request.method !== method) {
      throw data(null, { status: 405 });
    }
  };
}

/**
 * Get the current authenticated user with database info
 * 
 * This function retrieves the authenticated user from Supabase and fetches
 * their corresponding database record. Useful for getting user profile data,
 * subscription status, AI usage limits, etc.
 * 
 * @param client - The Supabase client instance
 * @returns User data from database or null if not authenticated
 */
export async function getCurrentUser(client: SupabaseClient) {
  const {
    data: { user },
  } = await client.auth.getUser();
  
  if (!user) return null;
  
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });
  
  return dbUser;
}

/**
 * Require user authentication and return user data
 * 
 * Combines authentication check with user data retrieval.
 * Throws if user is not authenticated or not found in database.
 * 
 * @param client - The Supabase client instance
 * @returns Authenticated user data from database
 * @throws {Response} 401 if not authenticated, 404 if user not in database
 */
export async function requireUser(client: SupabaseClient) {
  const {
    data: { user },
  } = await client.auth.getUser();
  
  if (!user) {
    throw redirect("/auth/login");
  }
  
  const dbUser = await db.query.users.findFirst({
    where: eq(users.id, user.id),
  });
  
  if (!dbUser) {
    // 사용자가 인증되었지만 DB에 없는 경우 (첫 로그인)
    throw redirect("/onboarding");
  }
  
  return dbUser;
}
