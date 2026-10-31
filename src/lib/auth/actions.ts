'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/auth/server';

export async function login(formData: FormData) {
  try {
    const supabase = await createClient();

    const credentials = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    };

    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      return { error: error.message };
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { error: message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function register(formData: FormData) {
  try {
    const supabase = await createClient();

    const fullName = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${siteUrl}/api/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, message: 'Check your email to confirm your account.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { error: message };
  }
}

export async function forgotPassword(formData: FormData) {
  try {
    const supabase = await createClient();

    const email = formData.get('email') as string;
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/api/auth/reset-password`,
    });

    if (error) {
      return { error: error.message };
    }

    return { success: true, message: 'Password reset link sent. Check your email.' };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
    return { error: message };
  }
}

export async function logout() {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {
    // If client cannot be created, proceed with redirect
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
