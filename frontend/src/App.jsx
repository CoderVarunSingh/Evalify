import { SignInButton, UserButton } from '@clerk/react'

function App() {

  return (
    <>
     <h1>Welcome to the app</h1>

     <Signedout>
      <SignInButton mode="modal">
        <button>Login</button>
      </SignInButton>
     </Signedout>

     <SignedIn>
      <Signedout/>
     </SignedIn>

     <UserButton/>
    </>
  )
}

export default App;