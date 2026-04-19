variable "aws_region" {
  type        = string
  description = "Must be us-east-1 so one ACM certificate works for ALB and CloudFront + WAF CLOUDFRONT scope."
  default     = "us-east-1"

  validation {
    condition     = var.aws_region == "us-east-1"
    error_message = "Set aws_region to us-east-1 for this reference architecture."
  }
}

variable "project_name" {
  type    = string
  default = "cloudmart"
}

variable "environment" {
  type        = string
  description = "e.g. staging | production"
  default     = "production"
}

variable "domain_name" {
  type        = string
  description = "Apex or subdomain for the app (e.g. app.example.com). Used for ACM, CloudFront, optional Route53."
}

variable "hosted_zone_id" {
  type        = string
  description = "Route53 hosted zone ID for domain_name. Leave empty to skip DNS records (manage ACM validation manually)."
  default     = ""
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "ecs_desired_count" {
  type    = number
  default = 2
}

variable "ecs_cpu" {
  type    = number
  default = 512
}

variable "ecs_memory" {
  type    = number
  default = 1024
}

variable "mongo_uri" {
  type        = string
  sensitive   = true
  description = "MongoDB connection string (Atlas or EC2 Mongo in VPC). Pass via env / -var-file (do not commit)."
}

variable "sqs_queue_arn" {
  type        = string
  description = "Optional existing SQS queue ARN for order events (least-privilege IAM)."
  default     = ""
}

variable "alert_email" {
  type        = string
  description = "Email for SNS alarm notifications (confirm subscription after apply)."
}

variable "github_org" {
  type        = string
  description = "GitHub org or user for OIDC trust."
}

variable "github_repo" {
  type        = string
  description = "Repository name only (no org)."
}

variable "github_oidc_provider_arn" {
  type        = string
  description = "Existing IAM OIDC provider ARN for token.actions.githubusercontent.com. Leave empty to create one (skip creation if your account already has this provider)."
  default     = ""
}

variable "github_environments" {
  type        = list(string)
  description = "GitHub environment names allowed to assume the deploy role (e.g. staging, production)."
  default     = ["staging", "production"]
}

variable "image_tag" {
  type        = string
  description = "Container image tag in ECR (CI typically pushes commit SHA or latest)."
  default     = "latest"
}
