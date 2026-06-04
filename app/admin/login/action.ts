'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_PASSWORD } from '@/env';

export async function loginAction(formData: FormData) {
  const password = formData.get('password');

  if (password === ADMIN_PASSWORD) {
    (await cookies()).set('admin_password', ADMIN_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });
    
    redirect('/admin');
  }

  return { error: 'Invalid password' };
}
