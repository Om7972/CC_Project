resource "aws_sns_topic" "alerts" {
  name = "${local.name}-alerts"
  tags = local.common_tags
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email
}

resource "aws_cloudwatch_metric_alarm" "api_error_rate" {
  alarm_name          = "${local.name}-api-error-rate-pct"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 5
  datapoints_to_alarm = 5
  threshold           = 1
  alarm_description   = "Approximate ALB target 5XX rate > 1% for five consecutive 1-minute periods."
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]

  metric_query {
    id          = "e1"
    expression  = "IF(requests==0,0,(errors/requests)*100)"
    label       = "ErrorRatePct"
    return_data = true
  }

  metric_query {
    id          = "errors"
    return_data = false
    metric {
      metric_name = "HTTPCode_Target_5XX_Count"
      namespace   = "AWS/ApplicationELB"
      period      = 60
      stat        = "Sum"
      dimensions = {
        LoadBalancer = aws_lb.api.arn_suffix
      }
    }
  }

  metric_query {
    id          = "requests"
    return_data = false
    metric {
      metric_name = "RequestCount"
      namespace   = "AWS/ApplicationELB"
      period      = 60
      stat        = "Sum"
      dimensions = {
        LoadBalancer = aws_lb.api.arn_suffix
      }
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "api_latency_p99" {
  alarm_name          = "${local.name}-api-latency-p99"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  datapoints_to_alarm = 3
  threshold           = 5
  metric_name          = "TargetResponseTime"
  namespace            = "AWS/ApplicationELB"
  period               = 60
  extended_statistic   = "p99"
  alarm_description   = "ALB target response time p99 > 5s"
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    LoadBalancer = aws_lb.api.arn_suffix
  }
}

locals {
  sqs_queue_name = var.sqs_queue_arn != "" ? element(split(":", var.sqs_queue_arn), 5) : ""
}

resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "${local.name}-ops"

  dashboard_body = jsonencode({
    widgets = concat(
      [
        {
          type   = "metric"
          x      = 0
          y      = 0
          width  = 12
          height = 6
          properties = {
            title   = "ALB requests & target 5XX"
            region  = var.aws_region
            view    = "timeSeries"
            stacked = false
            metrics = [
              ["AWS/ApplicationELB", "RequestCount", "LoadBalancer", aws_lb.api.arn_suffix],
              [".", "HTTPCode_Target_5XX_Count", ".", "."],
            ]
            period = 60
            stat   = "Sum"
          }
        },
        {
          type   = "metric"
          x      = 12
          y      = 0
          width  = 12
          height = 6
          properties = {
            title   = "ALB target latency (p99)"
            region  = var.aws_region
            view    = "timeSeries"
            metrics = [
              ["AWS/ApplicationELB", "TargetResponseTime", "LoadBalancer", aws_lb.api.arn_suffix, { stat = "p99" }],
            ]
            period = 60
          }
        },
        {
          type   = "metric"
          x      = 0
          y      = 6
          width  = 12
          height = 6
          properties = {
            title   = "ECS CPU / memory"
            region  = var.aws_region
            view    = "timeSeries"
            metrics = [
              ["AWS/ECS", "CPUUtilization", "ClusterName", aws_ecs_cluster.main.name, "ServiceName", aws_ecs_service.api.name],
              [".", "MemoryUtilization", ".", ".", ".", "."],
            ]
            period = 60
            stat   = "Average"
          }
        }
      ],
      var.sqs_queue_arn != "" ? [
        {
          type   = "metric"
          x      = 12
          y      = 6
          width  = 12
          height = 6
          properties = {
            title   = "SQS approximate messages visible"
            region  = var.aws_region
            view    = "timeSeries"
            metrics = [
              ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", local.sqs_queue_name],
            ]
            period = 60
            stat   = "Average"
          }
        }
      ] : []
    )
  })
}
