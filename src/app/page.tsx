import styles from "@/app/page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div>|{process.env.FIREBASE_TEST}|</div>
      <div>|{process.env.FIREBASE_HIDE_TEST}|</div>
    </main>
  );
}
