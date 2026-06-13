import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { StudentProfile } from '@/types/student';

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid');
  if (!uid) return NextResponse.json({ error: 'UID required' }, { status: 400 });

  try {
    const docRef = doc(db, 'profiles', uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      return NextResponse.json({ profile: null });
    }
    return NextResponse.json({ profile: docSnap.data() as StudentProfile });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { uid, profile } = await req.json();
    if (!uid) return NextResponse.json({ error: 'UID required' }, { status: 400 });

    const docRef = doc(db, 'profiles', uid);
    await setDoc(docRef, {
      ...profile,
      uid,
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
