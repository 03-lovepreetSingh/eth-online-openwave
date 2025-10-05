#!/bin/bash

# This script automates the deployment of a new blockchain within the U2U subnet.

# Load subnet configuration
SUBNET_CONFIG_FILE="../config/subnet-config.json"
SUBNET_ID=$(jq -r '.subnetId' $SUBNET_CONFIG_FILE)
VM_ID=$(jq -r '.vmId' $SUBNET_CONFIG_FILE)
TOKEN_SYMBOL=$(jq -r '.tokenSymbol' $SUBNET_CONFIG_FILE)

# Load genesis configuration
GENESIS_CONFIG_FILE="../genesis/genesis.json"
GENESIS_DATA=$(cat $GENESIS_CONFIG_FILE)

# Create the blockchain
echo "Deploying blockchain in subnet with ID: $SUBNET_ID"
echo "Using VM ID: $VM_ID and Token Symbol: $TOKEN_SYMBOL"

# Command to create the blockchain
U2U-cli create-chain \
  --subnet-id $SUBNET_ID \
  --vm-id $VM_ID \
  --genesis "$GENESIS_DATA" \
  --token-symbol $TOKEN_SYMBOL

echo "Blockchain deployed successfully!"