import { useUser, SignInButton, UserButton } from "@clerk/react";

function App() {
  const { isSignedIn } = useUser();

  return (
    <>
      <h1 style={{ fontSize: "40px", color: "black" }}>
        Welcome to the app
      </h1>

      {!isSignedIn && (
        <SignInButton mode="modal">
          <button>Login</button>
        </SignInButton>
      )}

      {isSignedIn && <UserButton />}
    </>
  );
}

// function App() {
//   return <h1 style={{ fontSize: "40px", color: "black" }}>VISIBLE ✅</h1>;
// }

export default App;