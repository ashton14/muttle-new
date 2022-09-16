import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { SavedExerciseOffering } from '../../lib/api';
import { useAuth } from '../../lib/context/AuthContext';
import { useAuthenticatedApi } from '../../lib/context/AuthenticatedApiContext';

export default function Assignment() {
  const [exerciseOffering, setExerciseOffering] = useState<SavedExerciseOffering>();
  const router = useRouter();
  const { authInfo: { userInfo }} = useAuth();
  const inviteCode = router.query.inviteCode as string;
  const { getUserAssignment } = useAuthenticatedApi();

  useEffect(() => {
    const fetchExerciseOffering = async () => {
      if (userInfo) {
        const exerciseOffering = await getUserAssignment(userInfo?.id, inviteCode);
        setExerciseOffering(exerciseOffering);
      }
    };

    fetchExerciseOffering();
  }, [getUserAssignment, inviteCode, userInfo]);

  return (
    <>
      {`Exercise offering is ${exerciseOffering?.id}`}
    </>
  );
};
