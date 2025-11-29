# Management Reports - Data Analysis & API Design

## 1. Data Structure Analysis

### Existing Database Models

#### AssessmentCenter
- Contains assessment details
- Has `competencyIds` array linking to CompetencyLibrary
- Has `createdBy` for ownership

#### AssessmentAssignment
- Links `assessmentCenterId` to `groupId`
- Contains `participants` array with:
  - `participantId`
  - `activityIds` (assigned activities)
  - `assessorId`

#### Participant
- Basic participant info: `name`, `email`, `designation`, `managerName`
- Missing: `userCode`, `contactNo` (needed for UI)

#### Group
- Contains `participantIds` array
- Has `name`, `admin`, `adminEmail`

#### AssessorScore
- Key model for scoring data
- Contains:
  - `participantId`, `assessorId`, `assessmentCenterId`
  - `competencyScores`: JSON object `{ competencyId: { subCompetencyName: score } }`
  - `status`: DRAFT, SUBMITTED, FINALIZED
  - `submittedAt`: timestamp

#### AssignmentSubmission
- Participant submissions
- Has `submissionStatus`: DRAFT, SUBMITTED, UNDER_REVIEW, REVIEWED, NEEDS_REVISION
- Links to `participantId`, `assessmentCenterId`, `activityId`

#### CompetencyLibrary
- Contains `competencyName` and `subCompetencyNames` array

### Data Requirements for UI

#### 1. Assessments Card
**Data Needed:**
- Total assessments count
- Assigned count (participants with assignments)
- In progress count (submissions with status SUBMITTED or UNDER_REVIEW)
- Completed count (submissions with status REVIEWED or AssessorScore with status FINALIZED)

**Calculation:**
```typescript
// Total assessments = count of AssessmentAssignment records
// Assigned = count of unique participants in AssessmentAssignment
// In progress = count of AssignmentSubmission with status SUBMITTED or UNDER_REVIEW
// Completed = count of AssessorScore with status FINALIZED
```

#### 2. Competency Card
**Data Needed:**
- Average score per competency across all participants
- Competency name and average score

**Calculation:**
```typescript
// For each CompetencyLibrary:
// 1. Get all AssessorScore records for the assessment center
// 2. Extract scores for this competency from competencyScores JSON
// 3. Calculate average across all participants
```

#### 3. Group Details
**Data Needed:**
- Group name
- Participants list with:
  - User code (may need to add to Participant model or generate)
  - Name, Email, Designation, Contact no (may need to add), Manager Name

**Note:** `userCode` and `contactNo` fields may need to be added to Participant model or generated.

#### 4. Application Average vs Readiness Graph
**Data Needed:**
- For selected participant:
  - Competency names
  - Application Average: Average of scores from AssessorScore.competencyScores
  - Readiness: Calculated value (may be from a different source or calculated field)

**Calculation:**
```typescript
// Application Average = Average of all sub-competency scores for each competency
// Readiness = May need clarification on source (could be from pre-assessment or calculated)
```

#### 5. Pre vs Post Assessment
**Data Needed:**
- Pre-assessment scores (may need separate model or use first assessment)
- Post-assessment scores (from AssessorScore)
- Improvement calculation

**Note:** Pre-assessment data may not exist in current schema. May need to:
- Use first assessment as pre-assessment
- Or add a PreAssessment model
- Or use initial AssessorScore as baseline

## 2. API Endpoints Design

### GET /api/management-reports/overview
**Purpose:** Get assessments overview statistics

**Response:**
```json
{
  "success": true,
  "data": {
    "totalAssessments": 240,
    "assigned": 34,
    "inProgress": 74,
    "completed": 14,
    "assignedPercentage": 63,
    "inProgressPercentage": 88,
    "completedPercentage": 43
  }
}
```

### GET /api/management-reports/competencies
**Purpose:** Get average competency scores

**Query Params:**
- `assessmentCenterId` (optional): Filter by assessment center
- `search` (optional): Search by competency name

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "competencyId": "id",
      "competencyName": "Delighting Customer: Solution and experience Creator",
      "averageScore": 2.0
    }
  ]
}
```

### GET /api/management-reports/groups
**Purpose:** Get groups with participants

**Query Params:**
- `assessmentCenterId` (optional): Filter by assessment center
- `groupId` (optional): Get specific group
- `search` (optional): Search by participant name

**Response:**
```json
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": "groupId",
        "name": "Group A",
        "participants": [
          {
            "id": "participantId",
            "userCode": "#67364764",
            "name": "Sakshi Gupta",
            "email": "sakshi76gupta@gmail.com",
            "designation": "Manager",
            "contactNo": "8948958988",
            "managerName": "Sakshi Gupta"
          }
        ]
      }
    ]
  }
}
```

### GET /api/management-reports/participant/:participantId/application-readiness
**Purpose:** Get application average vs readiness data for a participant

**Query Params:**
- `assessmentCenterId`: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "participantId": "id",
    "participantName": "Sakshi Gupta",
    "competencies": [
      {
        "competencyId": "id",
        "competencyName": "Delighting Customer: Solution and experience Creator",
        "applicationAverage": 2.0,
        "readiness": 3.0,
        "activities": [
          {
            "activityId": "id",
            "activityName": "Case Study",
            "assessorName": "Assessor Name",
            "scores": {
              "competencyId": 2.0
            }
          }
        ],
        "average": 2.06,
        "forGraph": 30,
        "residual": 60,
        "total": 3
      }
    ]
  }
}
```

### GET /api/management-reports/participant/:participantId/pre-post-assessment
**Purpose:** Get pre vs post assessment comparison

**Query Params:**
- `assessmentCenterId`: Required

**Response:**
```json
{
  "success": true,
  "data": {
    "participantId": "id",
    "participantName": "Sakshi Gupta",
    "competencies": [
      {
        "competencyId": "id",
        "competencyName": "Delighting Customer: Solution and experience Creator",
        "preAssessmentApp": 1.8,
        "preAssessmentApp2": 2.6,
        "improvement": 0.8,
        "postAssessmentReadiness": 2.14
      }
    ]
  }
}
```

## 3. Database Schema Updates Needed

### Participant Model
May need to add:
- `userCode?: String` - Unique user code (e.g., "#67364764")
- `contactNo?: String` - Contact number

### PreAssessment Model (Optional)
If pre-assessment data needs to be stored separately:
```prisma
model PreAssessment {
  id                  String   @id @default(auto()) @map("_id") @db.ObjectId
  participantId       String   @db.ObjectId
  assessmentCenterId  String   @db.ObjectId
  competencyScores    Json     // Same structure as AssessorScore
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@unique([participantId, assessmentCenterId])
  @@map("pre_assessments")
}
```

## 4. Implementation Notes

1. **User Code Generation:** If not stored, can generate from participant ID or email hash
2. **Contact Number:** May need to add to Participant model or use a separate contact info model
3. **Pre-Assessment:** If not available, can use first assessment as baseline or mark as "N/A"
4. **Readiness Calculation:** Need to clarify the formula for readiness score
5. **Activity Names:** Need to fetch activity names from CaseStudy or InboxActivity based on activityId

