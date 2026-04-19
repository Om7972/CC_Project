output "vpc_id" {
  value       = aws_vpc.main.id
  description = "VPC ID for MongoDB Atlas VPC peering / security reference."
}

output "ecr_repository_url" {
  value       = aws_ecr_repository.api.repository_url
  description = "docker build -t $ECR_URL:tag ./backend && docker push"
}

output "ecs_cluster_name" {
  value       = aws_ecs_cluster.main.name
  description = "ECS cluster hosting the API service."
}

output "ecs_service_name" {
  value       = aws_ecs_service.api.name
  description = "ECS service name for UpdateService deployments."
}

output "alb_dns_name" {
  value       = aws_lb.api.dns_name
  description = "Direct ALB DNS (use CloudFront /api in production)."
}

output "cloudfront_domain_name" {
  value       = aws_cloudfront_distribution.main.domain_name
  description = "CloudFront domain (CNAME target if not using Route53 in this account)."
}

output "cloudfront_distribution_id" {
  value       = aws_cloudfront_distribution.main.id
  description = "For aws cloudfront create-invalidation."
}

output "frontend_s3_bucket" {
  value       = aws_s3_bucket.frontend.bucket
  description = "Sync Vite dist here after build."
}

output "github_actions_role_arn" {
  value       = aws_iam_role.github_deploy.arn
  description = "Set as GitHub secret AWS_ROLE_ARN for OIDC."
}

output "app_secrets_manager_arn" {
  value       = aws_secretsmanager_secret.app.arn
  sensitive   = true
  description = "ECS reads MONGO_URI, JWT_SECRET, REDIS_URL from this secret."
}

output "redis_primary_endpoint" {
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
  description = "ElastiCache Redis (TLS); also embedded in Secrets Manager REDIS_URL."
}

output "sns_alerts_topic_arn" {
  value       = aws_sns_topic.alerts.arn
  description = "Subscribe additional endpoints to this topic if needed."
}

output "cloudwatch_dashboard_name" {
  value       = aws_cloudwatch_dashboard.main.dashboard_name
  description = "Open in CloudWatch console."
}
