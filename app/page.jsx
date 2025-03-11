"use client";

import Image from 'next/image';
import SearchIcon from './Search.svg';
import StarIcon from './Star.svg';
import { useEffect, useState } from 'react';
import Chart from 'chart.js/auto';

export default function Home() {
  const [user, setUser] = useState('')
  const [userData, setUserData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [repos, setRepos] = useState([])
  const [suggestions, setSuggestions] = useState([]);


  useEffect(() => {


    const fetchSuggestions = async () => {
      if (!user.trim()) {
        setSuggestions([]);
        return;
      }
      try {
        const res = await fetch(`https://api.github.com/search/users?q=${user}&per_page=5`);
        const data = await res.json();
        setSuggestions(data.items || []);
      } catch (err) {
        setSuggestions([]);
      }
    };
    const bounce = setTimeout(() => fetchSuggestions(), 500);
    return () => clearTimeout(bounce);
  }, [user])

  async function getGithub(name) {
    if (!name.trim()) return;
    setIsLoading(true);
    setError(null)
    try {

      const res = await fetch(`https://api.github.com/users/${name}`, { next: { revalidate: 0 } });
      if (!res.ok) {
        throw new Error('User not found');
      }
      const data = await res.json();

      setUserData(data);
      setUser('')
      // Fetch user repositories
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
      setUserData(null);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSearch = () => {
    getGithub(user);
  };

  return (
    <main className=" flex min-h-screen flex-col items-center justify-between pt-6">
      <div className="flex flex-col gap-6 w-full max-w-md">
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className='flex bg-gray-100 rounded p-4 justify-between items-center shadow-sm'>
          <input
            type='text'
            placeholder='Who are you looking for ?'
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className='text-xs focus:outline-0'
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

        {suggestions.length > 0 && (
          <div className=" w-full  bg-white shadow-lg rounded-md overflow-hidden">
            {suggestions.map((user) => (
              <div
                key={user.id}
                className="px-4 py-2  cursor-pointer flex items-center gap-2"
                onClick={() => { setUser(user.login); getGithub(user.login); setSuggestions([]); }}
              >
                <img src={user.avatar_url} className="w-6 h-6 rounded-full" />
                {user.login}
              </div>
            ))}
          </div>
        )}

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
              <div className="bg-gray-50 p-4 rounded-lg mt-4 mb-4">
                <h3 className="text-base font-semibold mb-2">Repository Summary</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
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
              <div className='h-96 overflow-y-auto overflow-x-hidden'>
                {repos.map((repo) => (
                  <div key={repo.id} className='py-6 px-2 rounded transition duration-150 ease-in-out hover:scale-100 hover:shadow-lg cursor-pointer  '>
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