"use client";

import { useUserContext } from '../context/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Comparison() {
    const { comparisonData } = useUserContext();
    const router = useRouter();
    const { userData, userToCompareData } = comparisonData;

    useEffect(() => {
        if (!userData || !userToCompareData) {
            router.push('/');
        }
    }, [userData, userToCompareData, router]);


    return (
        <main className="flex min-h-screen flex-col items-center  p-6">
            <h3 className="text-base font-semibold mb-2">GitHub User Comparison</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className='flex gap-4 pb-5 border-b-1 border-b-gray-400 '>
                        <img
                            src={userData.avatar_url}
                            width={80}
                            height={80}
                            className="rounded-full mb-4 h-20 w-20 object-cover"
                        />
                        <div className='text-start ' >
                            <h2 className="text-xl font-bold">{userData.name || userData.login}</h2>
                            {userData.bio && <p className="text-gray-600 text-start mt-2 text-sm">{userData.bio}</p>}

                        </div>
                    </div>
                    <div className="mt-4">
                        <p><span className="font-medium">Followers:</span> {userData.followers}</p>
                        <p><span className="font-medium">Following:</span> {userData.following}</p>
                        <p><span className="font-medium">Public Repos:</span> {userData.public_repos}</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className='flex gap-4 pb-5 border-b-1 border-b-gray-400 '>
                        <img
                            src={userToCompareData.avatar_url}
                            width={80}
                            height={80}
                            className="rounded-full mb-4 h-20 w-20 object-cover"
                        />
                        <div className='text-start ' >
                            <h2 className="text-xl font-bold">{userToCompareData.name || userToCompareData.login}</h2>
                            {userData.bio && <p className="text-gray-600 text-start mt-2 text-sm">{userToCompareData.bio}</p>}

                        </div>
                    </div>
                    <div className="mt-4">
                        <p><span className="font-medium">Followers:</span> {userToCompareData.followers}</p>
                        <p><span className="font-medium">Following:</span> {userToCompareData.following}</p>
                        <p><span className="font-medium">Public Repos:</span> {userToCompareData.public_repos}</p>
                    </div>
                </div>
            </div>
        </main>
    );
}