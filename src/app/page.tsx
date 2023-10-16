import Link from "next/link";
import styles from "./home.module.css";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className={styles.navbar}>
        <div className={`${styles.nav1}`}>
          <div className={`${styles.icon} `}>
            <Image src="/logo.png" alt="logo" width={30} height={30} />
            <div className={`${styles.name}`}>
              <div>Quix</div>
              <div className={`${styles.smallname} text-md`}>.ai</div>
            </div>
          </div>
          <div className={`${styles.links}`}>
            <div className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer">
              About
            </div>
            <div className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer">
              Components
            </div>
            <div className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer">
              Documentation
            </div>
            <div className="transition-colors hover:text-foreground/80 text-foreground/60 cursor-pointer">
              Examples
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href="/login"
            className="px-3 py-1.5 border rounded-lg text-foreground font-normal text-foreground/80 font-semibold text-sm"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="px-3 py-1.5 border rounded-lg bg-foreground text-background font-semibold text-sm"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </>
  );
}
