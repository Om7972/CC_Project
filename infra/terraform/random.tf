resource "random_password" "redis_auth" {
  length  = 32
  special = false
}

resource "random_password" "jwt_secret" {
  length  = 48
  special = true
}
