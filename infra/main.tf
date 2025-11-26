terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.2.0"
}

provider "aws" {
  region = var.region
}

############################
# Variables
############################
variable "region" {
  description = "AWS region"
  default     = "ap-southeast-2"
}

variable "ami" {
  description = "AMI id to use for EC2 (compatible with your OS choice)"
  default     = "ami-0b8d527345fdace59"
}

variable "instance_type" {
  default = "t2.micro"
}

variable "vpc_id" {
  default = "vpc-0eeaa6ff77da19c28"
}

variable "subnet_id" {
  default = "subnet-0ac726e995d2c54f8"
}

variable "artifact_bucket" {
  description = "S3 bucket name where backend JAR is stored"
  default     = "starry-night-media"
}

variable "media_bucket_name" {
  description = "Name for S3 media bucket"
  default     = "starry-night-media"
}

variable "domain" {
  description = "The FQDN for the backend (api.yourdomain.tld)"
  default     = "api.codecreator127.xyz"
}

variable "letsencrypt_email" {
  description = "Email used for Let's Encrypt registration"
  default     = "codecreator127@gmail.com"
}

variable "key_name" {
  description = "EC2 keypair name for SSH access (optional, leave empty to skip)"
  default     = ""
}

############################
# S3 media bucket (existing in your earlier config)
############################
resource "aws_s3_bucket" "media_bucket" {
  bucket = var.media_bucket_name
  acl    = "private"
}

############################
# IAM Role and Instance Profile for EC2 (S3 access)
############################
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

data "aws_iam_policy_document" "media_access" {
  statement {
    effect = "Allow"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
      "s3:ListBucket"
    ]
    resources = [
      aws_s3_bucket.media_bucket.arn,
      "${aws_s3_bucket.media_bucket.arn}/*"
    ]
  }
}

resource "aws_iam_role_policy" "media_access_policy" {
  name   = "media-access-policy"
  role   = aws_iam_role.ec2_role.id
  policy = data.aws_iam_policy_document.media_access.json
}

resource "aws_iam_instance_profile" "ec2_profile" {
  name = "starry-night-backend-ec2-profile-tf"
  role = aws_iam_role.ec2_role.name
}

############################
# Security Group
############################
resource "aws_security_group" "backend_sg" {
  name        = "backend-sg-tf"
  description = "Allow SSH, HTTP, HTTPS"
  vpc_id      = var.vpc_id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"] # tighten to your IP in production
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Keep Postgres locked to localhost where appropriate
  ingress {
    description = "Postgres (localhost only)"
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

  tags = {
    Name = "backend-sg-tf"
  }
}

############################
# EC2 Instance
############################
resource "aws_instance" "backend" {
  ami                         = var.ami
  instance_type               = var.instance_type
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [aws_security_group.backend_sg.id]
  iam_instance_profile        = aws_iam_instance_profile.ec2_profile.name
  associate_public_ip_address = true

  user_data = templatefile("${path.module}/user_data.sh", {
    artifact_bucket      = var.artifact_bucket
    domain               = var.domain
    letsencrypt_email    = var.letsencrypt_email
  })


  tags = {
    Name = "backend-ec2"
  }
}


############################
# Outputs
############################
output "backend_public_ip" {
  value = aws_instance.backend.public_ip
}

output "backend_public_dns" {
  value = aws_instance.backend.public_dns
}

output "backend_domain" {
  value = var.domain
}
