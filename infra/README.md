# CloudMart AWS infrastructure (Terraform)

This stack deploys **ECS Fargate** (API), **ALB + ACM**, **S3 + CloudFront** (React static assets), **WAF**, **ElastiCache Redis**, **Route53** (optional), **CloudWatch** dashboard + **SNS** alarms, and a **GitHub OIDC** deploy role.

## Prerequisites

- Terraform >= 1.5, AWS CLI configured
- **MongoDB Atlas** (recommended) or MongoDB reachable from private subnets — set `mongo_uri` in `terraform.tfvars` (sensitive)
- Domain + **Route53 hosted zone** in the same account (optional but recommended for ACM DNS validation)
- **GitHub** repository and **Environments** named `staging` and `production` with required secrets/variables (see below)

## Apply

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars — never commit secrets

terraform init
terraform plan
terraform apply
```

After apply:

1. Confirm **SNS email subscription** for alerts.
2. If `hosted_zone_id` was empty, complete **ACM certificate validation** in the console, then re-run apply if listeners failed.
3. Push an API image to the printed **ECR** URL, then ECS will stabilize (task definition references that registry).
4. Update **Secrets Manager** `MONGO_URI` if you rotated Atlas credentials (secret may ignore drift if you changed it in the console).

## GitHub Actions

Set repository or **environment** secret:

| Secret          | Description                    |
|-----------------|--------------------------------|
| `AWS_ROLE_ARN`  | Output `github_actions_role_arn` |

Set **environment** `vars` (staging + production as needed):

| Variable                     | Example / source                          |
|-----------------------------|-------------------------------------------|
| `AWS_REGION`                | `us-east-1`                               |
| `ECR_REPOSITORY`            | Output ECR repo **name** (not URL)        |
| `ECS_CLUSTER`               | Output `ecs_cluster_name`                 |
| `ECS_SERVICE`               | Output `ecs_service_name`                 |
| `S3_BUCKET`                 | Output `frontend_s3_bucket`               |
| `CLOUDFRONT_DISTRIBUTION_ID`| Output `cloudfront_distribution_id`       |
| `VITE_API_URL`              | `https://your-domain.com/api`             |

Workflows: `.github/workflows/ci.yml` (tests + frontend build), `.github/workflows/deploy.yml` (ECR push, ECS rolling deploy, S3 sync, CloudFront invalidation).

## Notes

- **Region** is fixed to **us-east-1** so one **ACM** certificate serves **ALB** and **CloudFront**, and **WAF** uses `CLOUDFRONT` scope correctly.
- **MongoDB Atlas** is typically accessed over the public internet with TLS; for VPC-only Mongo, use **Atlas PrivateLink / VPC peering** and security groups accordingly.
- **OIDC provider**: if your account already has `token.actions.githubusercontent.com`, set `github_oidc_provider_arn` in tfvars and remove the duplicate creation attempt.
