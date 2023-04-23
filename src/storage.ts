import { TableSchema } from "@google-cloud/bigquery";
import { createTableIfDoesNotExist } from "./bigquery";

const PULL_REQUEST_TABLE_NAME = "pull_request";

interface PullRequestData {
  author: string;
  url: string;
  id: number;
  repository: string;
  title: string;
  created_at?: string;
  merged: boolean;
  merged_at?: string;
  merged_by?: string;
  comments: number;
  review_comments: number;
  additions: number;
  deletions: number;
  changed_files: number;
}

const PULL_REQUEST_SCHEMA: TableSchema = {
  fields: [
    {
      name: "author",
      type: "STRING",
    },
    {
      name: "url",
      type: "STRING",
    },
    {
      name: "id",
      type: "INTEGER",
    },
    {
      name: "repository",
      type: "STRING",
    },
    {
      name: "title",
      type: "STRING",
    },
    {
      name: "created_at",
      type: "DATETIME",
    },
    {
      name: "merged",
      type: "BOOLEAN",
    },
    {
      name: "merged_at",
      type: "DATETIME",
    },
    {
      name: "merged_by",
      type: "STRING",
    },
    {
      name: "comments",
      type: "INTEGER",
    },
    {
      name: "review_comments",
      type: "INTEGER",
    },
    {
      name: "additions",
      type: "INTEGER",
    },
    {
      name: "deletions",
      type: "INTEGER",
    },
    {
      name: "changed_files",
      type: "INTEGER",
    },
  ],
};
const PULL_REQUEST_PARTITION_FIELD = "created_at";

const savePullRequest = async (
  pullRequest: PullRequestData,
  dataset: string
): Promise<void> => {
  console.log("Getting table");
  const table = await createTableIfDoesNotExist(
    dataset,
    PULL_REQUEST_TABLE_NAME,
    PULL_REQUEST_SCHEMA,
    PULL_REQUEST_PARTITION_FIELD
  );

  console.log("Inserting");
  await table.insert([pullRequest]);
};

export { PullRequestData, savePullRequest };
