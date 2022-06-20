import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import styles from '../styles/Home.module.css'
import { accessToken, getCSRF, getSignUpGithub, getProtected, postLogout, postRefresh, postSignIn, postSignUp } from '../modules/auth/auth'
import { useSession, signIn, signOut } from "next-auth/react"

const Home: NextPage = () => {
  const [state, setState] = useState<string[]>([]);
  const [authToken, setAuthToken] = useState(null);

  useEffect(() => {
    const asyncCalls = async () =>{
      await getCSRF();
      const body = await postRefresh();
      setAuthToken(body.data.accessToken);
    }
    asyncCalls()
  }, [])
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <h1 style={{ color:  authToken ? 'green' : 'red '}}>
          Is logged: {(!!authToken).toString()}
        </h1>

        <hr />

        <a href="http://localhost:4000/auth/github">
          <button>Github signIn</button>
        </a>

        <button onClick={() => {
          postSignUp({
            "email": "test@gmail.pl",
            "password": "pass"
          });
        }}>Sign Up Email</button>

        
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
          try {
            const body = await getProtected();
            setState(body.data);
          } catch (error) {
            setState(['missing', 'access', 'token']);
          }
        }}>Protected</button>

        <ul>
          {state?.map(el => <li key={el}>{el}</li>)}
        </ul>
        
      </main>
    </div>
  )
}

export default Home
