############################
# Existing S3 Media Bucket
############################
resource "aws_s3_bucket" "media_bucket" {
  bucket = var.media_bucket_name
}

############################
# IAM Policies (Native)
############################
## Assume role policy for EC2

data "aws_iam_policy_document" "backend_role_assume" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role" "ec2_role" {
  name               = "backend-ec2-role-tf"
  assume_role_policy = data.aws_iam_policy_document.backend_role_assume.json
}

## Policy: Allow EC2 to read/write to media bucket

data "aws_iam_policy_document" "media_access" {
  statement {
    effect = "Allow"

    actions = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.media_bucket.arn}/*"]
  }
}

resource "aws_iam_role_policy" "media_access_policy" {
  name   = "media-access-policy"
  role   = aws_iam_role.ec2_role.id
  policy = data.aws_iam_policy_document.media_access.json
}

## Instance Profile
resource "aws_iam_instance_profile" "ec2_profile" {
  name = "starry-night-backend-ec2-profile-tf"
  role = aws_iam_role.ec2_role.name
}

############################
# Security Groups
############################
resource "aws_security_group" "backend_sg" {
  name        = "backend-sg-tf"
  description = "Allow SSH, backend traffic, and Postgres"
  vpc_id      = var.vpc_id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = var.backend_port
    to_port     = var.backend_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["127.0.0.1/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

############################
# EC2 Backend Instance with Postgres + Backend
############################
resource "aws_instance" "backend" {
  ami                         = var.ami
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [aws_security_group.backend_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name
  associate_public_ip_address = true

  user_data = <<-EOF
              #!/bin/bash
              set -e

              sudo apt-get update
              sudo apt-get install -y unzip curl postgresql postgresql-contrib openjdk-17-jdk-headless

              # Install AWS CLI v2
              curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
              unzip awscliv2.zip
              sudo ./aws/install
              rm awscliv2.zip

              # Create app directory
              mkdir -p /home/ubuntu/app
              cd /home/ubuntu/app

              # Download backend artifact from S3
              aws s3 cp s3://${var.artifact_bucket}/fullstack-1.0-SNAPSHOT.jar ./fullstack-1.0-SNAPSHOT.jar

              # Start Postgres
              sudo systemctl enable postgresql
              sudo systemctl start postgresql

              # Set up basic Postgres database
              sudo -u postgres psql -c "CREATE USER fullstack WITH PASSWORD 'password';"
              sudo -u postgres psql -c "CREATE DATABASE fullstack OWNER fullstack;"

              # Run backend
              nohup java -jar fullstack-1.0-SNAPSHOT.jar --server.address=0.0.0.0 > nohup.out 2>&1 &
              EOF


  tags = {
    Name = "backend-ec2"
  }
}

############################
# Outputs
############################
output "backend_ip" {
  value = aws_instance.backend.public_ip
}

output "media_bucket_name" {
  value = aws_s3_bucket.media_bucket.bucket
}

############################
# Variables
############################
variable "region" {
  default = "ap-southeast-2"
}
variable "artifact_bucket" {
  default = "starry-night-media"
}
variable "media_bucket_name" {
  default = "starry-night-media"
}
variable "vpc_id" {
  default = "vpc-0eeaa6ff77da19c28"
}
variable "subnet_id" {
  default = "subnet-0ac726e995d2c54f8"
}
variable "ami" {
  default = "ami-0b8d527345fdace59"
}
variable "instance_type" {
  default = "t2.micro"
}
variable "backend_port" { default = 8080 }
