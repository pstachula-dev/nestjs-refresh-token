import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import { accessToken, getProtected, postLogout, postRefresh, postSignIn, postSignUp } from './modules/auth/auth'

const Home: NextPage = () => {
  const [state, setState] = useState([]);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    postRefresh().then(body => {
      setAuthToken(body.data.accessToken)
    })
  }, [])
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1>Auth App: {authToken}</h1>

        <button onClick={() => {
          postSignUp({
            "email": "test@gmail.pl",
            "password": "pass"
          });
        }}>Sign Up</button>

        
        <button onClick={async () => {
          const body = await postSignIn({
            "email": "test@gmail.pl",
            "password": "pass"
          });
          setAuthToken(body.data.accessToken)
        }}>Login</button>

        <button onClick={() => {
          postLogout();
          setAuthToken(null)
        }}>Logout</button>

        <button onClick={async () => {
          const body = await postRefresh();
          setAuthToken(body.data.accessToken)
        }}>RefreshToken</button>

        <button onClick={async () => {
          const body = await getProtected();
          setState(body.data);
        }}>Protected</button>

        <ul>
          {state?.map(el => <li key={el}>{el}</li>)}
        </ul>
        
      </main>
    </div>
  )
}

export default Home
