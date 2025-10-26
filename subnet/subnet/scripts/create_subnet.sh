#!/bin/bash

# Set variables for subnet creation
SUBNET_NAME="MyCustomSubnet"
SUBNET_ID=12345
TOKEN_SYMBOL="MCS"
GAS_FEE="low"
VM_TYPE="SubnetEVM"

# Create the subnet configuration
echo "Creating subnet configuration..."
cat <<EOF > subnet/config/subnet-config.json
{
  "name": "$SUBNET_NAME",
  "subnetId": $SUBNET_ID,
  "tokenSymbol": "$TOKEN_SYMBOL",
  "gasFee": "$GAS_FEE",
  "vmType": "$VM_TYPE"
}
EOF

# Create the subnet using the HBAR CLI
echo "Creating subnet..."
HBAR-cli create-subnet --config subnet/config/subnet-config.json

# Check if the subnet was created successfully
if [ $? -eq 0 ]; then
  echo "Subnet $SUBNET_NAME created successfully with ID $SUBNET_ID."
else
  echo "Failed to create subnet."
  exit 1
fi

# Optionally, you can add additional commands to deploy blockchains or perform other tasks here.