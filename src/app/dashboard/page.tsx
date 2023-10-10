import Listofassignments from "@/components/pagecomponents/listofassignments";
import styles from "@/components/pagecomponents/styles.module.css";
import { Icons } from "@/components/ui/Icons";
import Link from "next/link";

const page = () => {
  return (
    <div>
      <div className={styles.dash}>Dashboard</div>
      <div className={styles.services}>
        <Link href="/dashboard/topic">
          <div className={`${styles.box}`}>
            <div className={styles.servicelg}>
              <Icons.Topic />
              <div>Topic</div>
            </div>
            <div className={styles.txt}>
              Enter a topic name from any fields and generate questions
            </div>
          </div>
        </Link>
        <Link href="/dashboard/text">
          <div className={`${styles.box} `}>
            <div className={styles.servicelg}>
              <Icons.Text />
              <div>Text</div>
            </div>
            <div className={styles.txt}>
              Enter a text/paragraph and generate questions from the given
              Paragraph
            </div>
          </div>
        </Link>
        <Link href="/dashboard/pdf">
          <div className={`${styles.box} `}>
            <div className={styles.servicelg}>
              <Icons.Pdf />
              <div>Pdf</div>
            </div>
            <div className={styles.txt}>
              Attach a pdf and get questions generated from the content of the
              pdf
            </div>
          </div>
        </Link>

        <div className={`${styles.box} `}>
          <div className={styles.servicelg}>
            <Icons.Link />
            <div>Link</div>
          </div>
          <div className={styles.txt}>
            Enter an External Link and Generate Questions (coming soon !!)
          </div>
        </div>

        <div className={`${styles.box}`}>
          <div className={styles.servicelg}>
            <Icons.Video />
            Video
          </div>
          <div className={styles.txt}>
            Enter a valid Youtube Link and generate questions (coming soon !!)
          </div>
        </div>
      </div>
      <Listofassignments />
    </div>
  );
};

export default page;
