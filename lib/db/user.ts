import 'server-only';
import { currentUser } from '@clerk/nextjs/server';
import { db } from '.';

/** Returns the database user for the signed-in Clerk user, creating it on first use. */
export async function getDbUser() {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const name =
    clerkUser.username ||
    [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(' ') ||
    null;

  return db.user.upsert({
    where: { clerkId: clerkUser.id },
    update: { name, imageUrl: clerkUser.imageUrl },
    create: { clerkId: clerkUser.id, name, imageUrl: clerkUser.imageUrl },
  });
}

export async function requireDbUser() {
  const user = await getDbUser();
  if (!user) throw new Error('Not signed in');
  return user;
}
