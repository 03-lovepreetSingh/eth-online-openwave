# Hackathon Feature Technical Specification

## Database Schema

### 1. Hackathons Table
```sql
CREATE TABLE hackathons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(256) NOT NULL,
    description TEXT,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    image_url VARCHAR(256),
    status VARCHAR(50), -- 'upcoming', 'active', 'completed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(256) REFERENCES users(id)
);
```

### 2. Hack Projects Table
```sql
CREATE TABLE hack_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hackathon_id UUID REFERENCES hackathons(id),
    project_name VARCHAR(256) NOT NULL,
    description TEXT,
    repository VARCHAR(256),
    image_url VARCHAR(256),
    owner_id VARCHAR(256) REFERENCES users(id),
    team_members JSONB, -- Array of user IDs
    tech_stack JSONB,
    contract_address VARCHAR(256),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Project Votes Table
```sql
CREATE TABLE project_votes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES hack_projects(id),
    voter_id VARCHAR(256) REFERENCES users(id),
    vote_type VARCHAR(50), -- 'contributor' or 'maintainer'
    vote_weight INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(project_id, voter_id) -- Prevent duplicate votes
);
```

### 4. Project Split Payments Table
```sql
CREATE TABLE project_split_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES hack_projects(id),
    total_amount VARCHAR(256),
    contributor_share VARCHAR(256),
    maintainer_share VARCHAR(256),
    transaction_hash VARCHAR(256),
    status VARCHAR(50), -- 'pending', 'completed', 'failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Smart Contract Interface

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IHackathonSplit {
    struct Split {
        uint256 totalAmount;
        uint256 contributorShare;
        uint256 maintainerShare;
    }
    
    event PaymentSplit(
        bytes32 projectId,
        uint256 totalAmount,
        uint256 contributorShare,
        uint256 maintainerShare
    );
    
    function calculateSplit(
        uint256 totalAmount,
        uint256 contributorVotes,
        uint256 maintainerVotes
    ) external pure returns (Split memory);
    
    function executeSplit(
        bytes32 projectId,
        address[] calldata contributors,
        address[] calldata maintainers,
        uint256[] calldata contributorShares,
        uint256[] calldata maintainerShares
    ) external payable;
}
```

## API Routes

### 1. Hackathon Management
- `POST /api/hackathons/create` - Create new hackathon
- `GET /api/hackathons/list` - List all hackathons
- `GET /api/hackathons/{id}` - Get hackathon details
- `PUT /api/hackathons/{id}` - Update hackathon
- `DELETE /api/hackathons/{id}` - Delete hackathon

### 2. Hack Projects
- `POST /api/hack-projects/create` - Create new project
- `GET /api/hack-projects/list/{hackathonId}` - List projects by hackathon
- `GET /api/hack-projects/{id}` - Get project details
- `PUT /api/hack-projects/{id}` - Update project
- `DELETE /api/hack-projects/{id}` - Delete project

### 3. Voting System
- `POST /api/hack-projects/vote` - Submit vote
- `GET /api/hack-projects/{id}/votes` - Get project votes
- `DELETE /api/hack-projects/vote/{id}` - Remove vote

### 4. Split Payments
- `POST /api/hack-projects/split` - Execute split payment
- `GET /api/hack-projects/{id}/splits` - Get split payment history

## Frontend Routes

### 1. Hackathon Pages
- `/hackathons` - List all hackathons
- `/hackathons/[id]` - Hackathon details
- `/hackathons/[id]/submit` - Submit project
- `/hackathons/[id]/projects` - View all projects

### 2. Project Pages
- `/hackathons/[hackathonId]/projects/[id]` - Project details
- `/hackathons/[hackathonId]/projects/[id]/vote` - Voting interface

## Implementation Notes

1. **Authentication & Authorization**
   - Use existing auth system
   - Add role-based access for hackathon management
   - Implement vote verification

2. **Smart Contract Integration**
   - Deploy on same network as existing contracts
   - Implement proper error handling
   - Add events for important actions

3. **UI Components**
   - Follow existing design system
   - Reuse existing components where possible
   - Implement responsive design

4. **Testing Strategy**
   - Unit tests for smart contracts
   - API integration tests
   - E2E tests for critical U2Us