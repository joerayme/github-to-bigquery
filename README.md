# GitHub to BigQuery Webhook

This project takes GitHub webhooks and sinks them to BigQuery.

## Deploying

Create a GCP project and enable the following APIs:

```
gcloud services enable --project <project> artifactregistry.googleapis.com bigquery.googleapis.com bigquerymigration.googleapis.com bigquerystorage.googleapis.com cloudapis.googleapis.com cloudbuild.googleapis.com clouddebugger.googleapis.com cloudfunctions.googleapis.com cloudtrace.googleapis.com containerregistry.googleapis.com datastore.googleapis.com deploymentmanager.googleapis.com logging.googleapis.com monitoring.googleapis.com pubsub.googleapis.com run.googleapis.com secretmanager.googleapis.com servicemanagement.googleapis.com serviceusage.googleapis.com source.googleapis.com sql-component.googleapis.com storage-api.googleapis.com storage-component.googleapis.com storage.googleapis.com
```

Create a GitHub Webhook secret:

```
SECRET=$(ruby -rsecurerandom -e 'puts SecureRandom.hex(20)')
echo -n "$SECRET" | gcloud secrets create --project <project> "github-webhook-secret" --replication-policy automatic --data-file -
```

Create a service account:

```
gcloud iam service-accounts create github-webhook
```

Allow the service account to access the secret and write to BigQuery:

```
gcloud projects add-iam-policy-binding <project> --member serviceAccount:github-webhook@<project>.iam.gserviceaccount.com --role roles/secretmanager.secretAccessor
gcloud projects add-iam-policy-binding <project> --member serviceAccount:github-webhook@<project>.iam.gserviceaccount.com --role roles/bigquery.dataEditor
```

[Create a BigQuery dataset](https://cloud.google.com/bigquery/docs/datasets#create-dataset) called `github`.

Deploy the function:

```
gcloud functions deploy GitHubHandler --region <region> --project <project> --runtime nodejs18 --trigger-http --gen2 --set-secrets "GITHUB_WEBHOOK_SECRET=github-webhook-secret:latest" --service-account github-webhook@<project>.iam.gserviceaccount.com
```

Set up the invoker policy:

```
gcloud functions add-invoker-policy-binding GitHubHandler --region="<region>" --member="allUsers"
```
