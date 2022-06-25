import '../styles/globals.css'
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {  
  // return (<SessionProvider session={session}>
  //   <Component {...pageProps} />
  // </SessionProvider>)

  return <Component {...pageProps} />
}

export default MyApp
