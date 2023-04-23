import { BigQuery, Table, TableSchema } from "@google-cloud/bigquery";

const bigQueryClient = new BigQuery();

const createTableIfDoesNotExist = async (
  datasetName: string,
  tableName: string,
  schema: TableSchema,
  partitionField: string
): Promise<Table> => {
  const dataset = bigQueryClient.dataset(datasetName);
  const table = dataset.table(tableName);
  const [exists] = await table.exists();

  if (!exists) {
    console.log(`Creating table ${tableName}`);
    const [t] = await table.create({
      schema: schema.fields,
      timePartitioning: { type: "DAY", field: partitionField },
    });

    console.log(`Created table ${t.id}`);
    return t;
  } else {
    console.log("table exists");
  }
  return table;
};

export { createTableIfDoesNotExist };
