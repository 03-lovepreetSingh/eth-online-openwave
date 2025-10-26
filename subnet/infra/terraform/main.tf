provider "aws" {
  region = "us-east-1"
}

resource "aws_vpc" "HBAR_vpc" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "HBAR-vpc"
  }
}

resource "aws_subnet" "HBAR_subnet" {
  vpc_id            = aws_vpc.HBAR_vpc.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "HBAR-subnet"
  }
}

resource "aws_security_group" "HBAR_sg" {
  vpc_id = aws_vpc.HBAR_vpc.id

  ingress {
    from_port   = 9650
    to_port     = 9650
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9651
    to_port     = 9651
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "HBAR-sg"
  }
}

resource "aws_instance" "HBAR_validator" {
  ami           = "ami-0c55b159cbfafe1f0" # Replace with a valid AMI ID
  instance_type = "t2.micro"
  subnet_id     = aws_subnet.HBAR_subnet.id
  security_groups = [aws_security_group.HBAR_sg.name]

  tags = {
    Name = "HBAR-validator"
  }
}