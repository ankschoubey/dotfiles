import { Journal } from "./types";
import { execSync } from "child_process";

const DB_PATH = `${process.env.HOME}/Library/Group Containers/5U8NS4GX82.dayoneapp2/Data/Documents/DayOne.sqlite`;

export function readJournals(): Journal[] {
  const output = execSync(
    `sqlite3 -json "${DB_PATH}" "SELECT Z_PK as id, ZNAME as name, ZSORTORDER as sortOrder FROM ZJOURNAL WHERE ZHIDDEN = 0 ORDER BY ZSORTORDER;"`,
    { timeout: 5000, encoding: "utf-8" },
  );

  return JSON.parse(output) as Journal[];
}
