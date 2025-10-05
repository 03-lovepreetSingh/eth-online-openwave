pragma solidity ^0.8.20;

/**
 * @title HackathonSplit
 * @dev Handles splitting payments among contributors and maintainers for hackathon projects.
 */ 
contract HackathonSplit {
    struct Split {
        uint256 totalAmount;
        uint256 contributorShare;
        uint256 maintainerShare;
    }

    event PaymentSplit(
        bytes32 indexed projectId,
        uint256 totalAmount,
        uint256 contributorShare,
        uint256 maintainerShare
    );

    /**
     * @dev Calculates the split amounts based on vote counts.
     * @param totalAmount The total amount to be split (in wei).
     * @param contributorVotes Number of contributor votes.
     * @param maintainerVotes Number of maintainer votes.
     * @return split The calculated Split struct.
     */
    function calculateSplit(
        uint256 totalAmount,
        uint256 contributorVotes,
        uint256 maintainerVotes
    ) external pure returns (Split memory split) {
        require(contributorVotes + maintainerVotes > 0, "No votes");
        uint256 totalVotes = contributorVotes + maintainerVotes;
        split.totalAmount = totalAmount;
        split.contributorShare = (totalAmount * contributorVotes) / totalVotes;
        split.maintainerShare = totalAmount - split.contributorShare;
    }

    /**
     * @dev Executes the payment split to contributors and maintainers.
     * @param projectId Identifier for the project (bytes32).
     * @param contributors Array of contributor addresses.
     * @param maintainers Array of maintainer addresses.
     * @param contributorShares Corresponding shares for contributors (in wei).
     * @param maintainerShares Corresponding shares for maintainers (in wei).
     */
    function executeSplit(
        bytes32 projectId,
        address[] calldata contributors,
        address[] calldata maintainers,
        uint256[] calldata contributorShares,
        uint256[] calldata maintainerShares
    ) external payable {
        require(msg.value > 0, "No funds sent");
        uint256 totalContrib = _sumArray(contributorShares);
        uint256 totalMaint = _sumArray(maintainerShares);
        require(totalContrib + totalMaint == msg.value, "Mismatch amounts");

        // Transfer to contributors
        for (uint256 i = 0; i < contributors.length; i++) {
            payable(contributors[i]).transfer(contributorShares[i]);
        }

        // Transfer to maintainers
        for (uint256 i = 0; i < maintainers.length; i++) {
            payable(maintainers[i]).transfer(maintainerShares[i]);
        }

        emit PaymentSplit(projectId, msg.value, totalContrib, totalMaint);
    }

    function _sumArray(uint256[] calldata arr) internal pure returns (uint256 sum) {
        for (uint256 i = 0; i < arr.length; i++) {
            sum += arr[i];
        }
    }
}