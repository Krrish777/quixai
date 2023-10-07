import Link from "next/link";

export default function Home() {
  return (
    <>
      home page
      <Link href="/login">Login</Link>
      <Link href="/signup">Signup</Link>
    </>
  );
}
