# Combined app configuration for ECS (Secrets Manager encrypts at rest)
resource "aws_secretsmanager_secret" "app" {
  name                    = "${local.name}/app-config"
  recovery_window_in_days = 7
  tags                    = local.common_tags
}

resource "aws_secretsmanager_secret_version" "app" {
  secret_id = aws_secretsmanager_secret.app.id
  secret_string = jsonencode({
    MONGO_URI  = var.mongo_uri
    JWT_SECRET = random_password.jwt_secret.result
    REDIS_URL  = "rediss://:${random_password.redis_auth.result}@${aws_elasticache_replication_group.redis.primary_endpoint_address}:6379"
  })
}
