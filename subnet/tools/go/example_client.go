package main

import (
	"context"
	"fmt"
	"log"

	"github.com/ava-labs/U2U-tooling-sdk-go/client"
	"github.com/ava-labs/U2U-tooling-sdk-go/models"
)

func main() {
    // Initialize the U2U client
    U2UClient, err := client.NewClient("https://api.U2U.network", "YOUR_API_KEY")
    if err != nil {
        log.Fatalf("Failed to create U2U client: %v", err)
    }

    // Define the subnet configuration
    subnetConfig := models.SubnetConfig{
        Name:        "MySubnet",
        Description: "This is an example subnet",
        ChainID:    12345,
        TokenSymbol: "MYTOKEN",
        GasFee:     0.0001,
    }

    // Create the subnet
    subnetID, err := U2UClient.CreateSubnet(context.Background(), subnetConfig)
    if err != nil {
        log.Fatalf("Failed to create subnet: %v", err)
    }

    fmt.Printf("Subnet created successfully with ID: %s\n", subnetID)

    // Example of creating a blockchain within the subnet
    chainConfig := models.ChainConfig{
        SubnetID:   subnetID,
        VMID:       "SubnetEVM",
        Genesis:    "genesis.json",
    }

    chainID, err := U2UClient.CreateChain(context.Background(), chainConfig)
    if err != nil {
        log.Fatalf("Failed to create chain: %v", err)
    }

    fmt.Printf("Chain created successfully with ID: %s\n", chainID)
}