"use client";

import Image from 'next/image';
import SearchIcon from './Search.svg';
import StarIcon from './Star.svg';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserContext } from './context/UserContext';

export default function Home() {
  const router = useRouter();
  const { setComparisonData } = useUserContext();

  const [user, setUser] = useState('')
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [repos, setRepos] = useState([])

  const [mainSuggestions, setMainSuggestions] = useState([]);
  const [compareSuggestions, setCompareSuggestions] = useState([]);

  const [compare, setCompare] = useState(false)
  const [usertocompare, setUsertocompare] = useState('')
  const [usertocomparedata, setUsertocomparedata] = useState([])
  const [activeInput, setActiveInput] = useState('');

  useEffect(() => {
    if (!user.trim()) {
      setMainSuggestions([]);
      return;
    }

    const fetchMainSuggestions = async () => {
      try {
        const res = await fetch(`https://api.github.com/search/users?q=${user}&per_page=5`);
        const data = await res.json();
        setMainSuggestions(data.items || []);
      } catch (err) {
        setMainSuggestions([]);
      }
    };

    const bounce = setTimeout(() => fetchMainSuggestions(), 500);
    return () => clearTimeout(bounce);
  }, [user]);

  useEffect(() => {
    if (!usertocompare.trim()) {
      setCompareSuggestions([]);
      return;
    }

    const fetchCompareSuggestions = async () => {
      try {
        const res = await fetch(`https://api.github.com/search/users?q=${usertocompare}&per_page=5`);
        const data = await res.json();
        setCompareSuggestions(data.items || []);
      } catch (err) {
        setCompareSuggestions([]);
      }
    };

    const bounce = setTimeout(() => fetchCompareSuggestions(), 500);
    return () => clearTimeout(bounce);
  }, [usertocompare]);



  async function getGithub(name) {
    if (!name.trim()) return null;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`https://api.github.com/users/${name}`, { next: { revalidate: 0 } });
      if (!res.ok) {
        throw new Error('User not found');
      }
      const data = await res.json();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function getRepo(name) {
    try {
      const reposres = await fetch(`https://api.github.com/users/${name}/repos?sort=updated&per_page=1000`, {
        next: { revalidate: 0 }
      });

      if (reposres.ok) {
        const reposdata = await reposres.json();
        setRepos(reposdata);
      }
    } catch (err) {
      setError(err.message);
      setRepos([]);
    }
  }

  const handleSearch = async () => {
    const data = await getGithub(user);
    setUserData(data);
    if (data) {
      getRepo(user);
    }
    setMainSuggestions([]);
  };

  const handleCompare = async () => {
    const data = await getGithub(usertocompare);
    setUsertocomparedata(data);
    setCompareSuggestions([]);

  };

  const handleComparison = () => {
    if (userData && usertocomparedata) {
      setComparisonData({
        userData: userData,
        userToCompareData: usertocomparedata
      });

      // Navigate to comparison page
      router.push('/comparison');
    }
  };


  return (
    <main className=" flex min-h-screen flex-col items-center justify-between pt-6">
      <div className="flex flex-col gap-6 w-full max-w-md">
        <div>
          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className='flex bg-gray-100 rounded p-4 items-center shadow-sm'>
            <input
              type='text'
              placeholder='Who are you looking for ?'
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className='text-xs focus:outline-0 w-[95%]'
            />
            <Image
              src={SearchIcon}
              width={20}
              height={20}
              alt="Search"
              className="cursor-pointer"
              onClick={handleSearch}
            />
          </form>
          {mainSuggestions.length > 0 && (
            <div className=" w-full  bg-white shadow-lg rounded-md overflow-hidden">
              {mainSuggestions.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-2  cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    setUser(user.login);
                    handleSearch(); setMainSuggestions([]);
                  }}
                >
                  <img src={user.avatar_url} className="w-6 h-6 rounded-full" />
                  {user.login}
                </div>
              ))}
            </div>
          )}
        </div>




        {compare && <div>
          <form onSubmit={(e) => { e.preventDefault(); handleCompare(); }}
            className='flex bg-gray-100 rounded p-4 j items-center shadow-sm'>

            <input
              type='text'
              placeholder='Compare With'
              value={usertocompare}
              onChange={(e) => setUsertocompare(e.target.value)}
              className='text-xs focus:outline-0 w-[95%]'
            />
            <Image
              src={SearchIcon}
              width={20}
              height={20}
              alt="Search"
              className="cursor-pointer"
              onClick={handleSearch}
            />
          </form>
          {compareSuggestions.length > 0 && (
            <div className=" w-full  bg-white shadow-lg mt-3 rounded-md overflow-hidden">
              {compareSuggestions.map((user) => (
                <div
                  key={user.id}
                  className="px-4 py-2  cursor-pointer flex items-center gap-2"
                  onClick={() => {
                    setUsertocompare(user.login);
                    handleCompare();
                    setCompareSuggestions([]);
                  }
                  }
                >
                  <img src={user.avatar_url} className="w-6 h-6 rounded-full" />
                  {user.login}
                </div>
              ))}
            </div>
          )}
          <div className='flex flex-row-reverse mt-3 '><button onClick={handleComparison} className='bg-blue-600 text-sm text-white p-3 rounded cursor-pointer  '>Compare</button></div>
        </div>
        }

        <p className='text-blue-600 text-xs underline flex flex-row-reverse cursor-pointer' onClick={() => setCompare(!compare)}>          {compare ? 'Cancel comparison' : 'Compare with another user?'}
        </p>


        {error && <p className="text-center text-red-500">{error}</p>}
        {isLoading && <p className="text-center text-gray-500">Loading...</p>}

        {userData && (
          <div className=" flex flex-col  bg-white rounded-lg shadow p-6 ">
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
            {repos.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg mt-4 mb-4 text-black">
                <h3 className="text-base font-semibold mb-2">Repository Summary</h3>
                <div className="grid md:grid-cols-2 gap-2 text-sm">
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="font-medium">Total Repos</p>
                    <p className="text-xl font-bold">{repos.length}</p>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="font-medium">Total Stars</p>
                    <p className="text-xl font-bold">{repos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}</p>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="font-medium">Total Forks</p>
                    <p className="text-xl font-bold">{repos.reduce((sum, repo) => sum + repo.forks_count, 0)}</p>
                  </div>
                  <div className="bg-white p-2 rounded shadow-sm">
                    <p className="font-medium">Avg. Stars</p>
                    <p className="text-xl font-bold">{(repos.reduce((sum, repo) => sum + repo.stargazers_count, 0) / repos.length).toFixed(1)}</p>
                  </div>
                </div>

              </div>
            )}
            {repos.length > 0 ? (
              <div className='h-96 overflow-y-auto overflow-x-hidden px-1'>
                {repos.map((repo) => (
                  <div key={repo.id} className='py-4 px-3 my-2 rounded-lg border border-gray-100 transition duration-150 ease-in-out hover:scale-100 hover:shadow-lg cursor-pointer  '>
                    <div className='flex justify-between'>
                      <a href={repo.html_url} target="_blank" className="font-medium text-blue-600 cursor-pointer">{repo.name}</a>
                      <div className="flex items-center mt-2">
                        <Image
                          src={StarIcon}
                          width={20}
                          height={20}
                          alt="Star"
                          style={{ filter: "invert(80%) sepia(75%) saturate(552%) hue-rotate(359deg) brightness(101%) contrast(107%)" }}
                        />
                        <span className="text-sm font-bold  ml-1">{repo.stargazers_count}</span>
                      </div>
                    </div>
                    {repo.description && (
                      <p className="text-sm text-gray-600 my-1">{repo.description}</p>
                    )}

                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 p-5">No Public Repositories</p>
            )}

          </div>

        )}
      </div>

    </main>
  )
}