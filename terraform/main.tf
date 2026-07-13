# Main configuration entry point.
# You can configure remote backends (like AWS S3) here if needed.
# By default, Terraform uses the local backend to store state files.

terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
