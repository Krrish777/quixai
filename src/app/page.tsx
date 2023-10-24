import Link from "next/link";
import styles from "./home.module.css";
import Image from "next/image";
import { MainNav } from "@/components/main-nav";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SiteFooter } from "@/components/site-footer";
const menuitems = [
  {
    title: "Features",
    href: "/#features",
  },
  {
    title: "Pricing",
    href: "/pricing",
  },
  {
    title: "Blog",
    href: "/blog",
  },
  {
    title: "Documentation",
    href: "/docs",
  },
];

export default function Home() {
  return (
    <div className={` flex min-h-screen flex-col`}>
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <MainNav items={menuitems} />
          <nav>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "secondary", size: "default" })
              )}
            >
              Login
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        {" "}
        <>
          <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
            <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
              <Link
                href={"/"}
                className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
              >
                Follow along on Twitter
              </Link>
              <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
                Assignments Just Got Easier - Try Quix Now!
              </h1>

              <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
                Quix.ai is an innovative tool designed for educators, making
                seamless assignment creation effortless from various input
                sources including PDFs, texts, external links, and more.
              </p>
              <div className="space-x-4">
                <Link
                  href="/login"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Get Started
                </Link>
                <div
                  rel="noreferrer"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "lg" })
                  )}
                >
                  Learn more
                </div>
              </div>
            </div>
          </section>
          <section
            id="features"
            className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24"
          >
            <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
              <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
                Features
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Designed for educators and students, our platform evolves with your needs. We&apos;re here to make teaching and learning effortless.
              </p>
            </div>
            <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <img src="flearning.png" className="h-12 w-12 fill-current" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Effortless Student Management Made Simple with classrooms
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <img
                    src="fassignment.png"
                    className="h-12 w-12 fill-current"
                  />
                  <div className="space-y-2">
                    <h3 className="font-bold">Assignment Creation</h3>
                    <p className="text-sm text-muted-foreground">
                      Seamless Assignment Creation with Just Topics, PDFs, Text,
                      and More.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <img src="fanounce.png" className="h-12 w-12 fill-current" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Announcemt</h3>
                    <p className="text-sm text-muted-foreground">
                    Keep your class updated with ease by making announcements through our platform
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                  <img src="report.png" className="h-12 w-12 fill-current" />
                  <div className="space-y-2">
                    <h3 className="font-bold">Report</h3>
                    <p className="text-sm text-muted-foreground">
                    Gain valuable insights into each assignment outcomes.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <img src="notes.png" className="h-12 w-12 fill-current"/>
                  <div className="space-y-2">
                    <h3 className="font-bold">materials</h3>
                    <p className="text-sm text-muted-foreground">
                    Simplify the distribution of course materials by uploading them directly to your class.
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative overflow-hidden rounded-lg border bg-background p-2">
                <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <img src="signed.png" className="h-12 w-12 fill-current"/>
                  <div className="space-y-2">
                    <h3 className="font-bold">Assignment Correction</h3>
                    <p className="text-sm text-muted-foreground">
                    Simplify the assignment correction process through our automatic assignemt correction
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* <div className="mx-auto text-center md:max-w-[58rem]">
              <p className="leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                Taxonomy also includes a blog and a full-featured documentation
                site built using Contentlayer and MDX.
              </p>
            </div> */}
          </section>
          <section
            id="open-source"
            className="container py-8 md:py-12 lg:py-24"
          >
            <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
              <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
                Built by
              </h2>
              <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                This project is built by {" "}
                <Link
                  href={"https://twitter.com/mygodlon"}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-4"
                >
                  Chandan
                </Link>
                .{" "}
              </p>
              {/* {stars && (
                <Link
                  href={siteConfig.links.github}
                  target="_blank"
                  rel="noreferrer"
                  className="flex"
                >
                  <div className="flex h-10 w-10 items-center justify-center space-x-2 rounded-md border border-muted bg-muted">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="h-5 w-5 text-foreground"
                    >
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path>
                    </svg>
                  </div>
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-y-8 border-l-0 border-r-8 border-solid border-muted border-y-transparent"></div>
                    <div className="flex h-10 items-center rounded-md border border-muted bg-muted px-4 font-medium">
                      {stars} stars on GitHub
                    </div>
                  </div>
                </Link>
              )} */}
            </div>
          </section>
        </>
      </main>
      {/* <SiteFooter /> */}
    </div>
  );
}
