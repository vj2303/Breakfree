# Assessment Center Data Structure

This document outlines the expected data structure for activities and assignments in the Assessment Center.

## Activities Structure

The activities should be passed in the following format:

```json
[
  {
    "activityType": "INBOX_ACTIVITY",
    "activityId": "687cfa7967791b3839b99c04",
    "competencyLibraryId": "68a47dbb67791b3839b99c27",
    "displayOrder": 2
  }
]
```

### Field Descriptions:
- `activityType`: The type of activity (e.g., "INBOX_ACTIVITY", "CASE_STUDY")
- `activityId`: The unique identifier for the specific activity content
- `competencyLibraryId`: The ID of the competency library this activity is mapped to
- `displayOrder`: The order in which activities should be displayed

## Assignments Structure

The assignments should be passed in the following format:

```json
[
  {
    "groupId": "group_id_1",
    "participants": [
      {
        "participantId": "participant_id_1",
        "activityIds": ["case_study_id_1", "inbox_activity_id_1"],
        "assessorId": "assessor_user_id_1"
      },
      {
        "participantId": "participant_id_2",
        "activityIds": ["case_study_id_1"],
        "assessorId": "assessor_user_id_2"
      }
    ]
  },
  {
    "groupId": "group_id_2",
    "participants": [
      {
        "participantId": "participant_id_3",
        "activityIds": ["inbox_activity_id_1"],
        "assessorId": "assessor_user_id_3"
      }
    ]
  }
]
```

### Field Descriptions:
- `groupId`: The unique identifier for the group
- `participants`: Array of participants in the group
  - `participantId`: The unique identifier for the participant
  - `activityIds`: Array of activity IDs assigned to this participant
  - `assessorId`: The unique identifier for the assessor assigned to this participant

## Implementation Details

### 1. Context Interface Updates
The `FormData` interface has been updated to use the new structure:
- `assignments` now uses `GroupAssignment[]` instead of the old `Assignment[]`
- New interfaces: `AssignmentParticipant` and `GroupAssignment`

### 2. Data Transformation
The `buildPayloadPreview` function properly transforms the form data:
- Maps activity types to the correct format (e.g., "case-study" → "CASE_STUDY")
- Sets `competencyLibraryId` from the selected competencies
- Ensures proper `displayOrder` for activities
- Maintains the nested structure for assignments

### 3. Step Components
- **SelectContentStep**: Handles activity selection and mapping
- **SelectCompetenciesStep**: Manages competency selection
- **ParticipantAssessorManagementStep**: Handles participant and assessor assignments

### 4. Data Flow
1. User selects activities in SelectContentStep
2. User selects competencies in SelectCompetenciesStep
3. User configures participant-assessor mappings in ParticipantAssessorManagementStep
4. Data is transformed and submitted via the API

## Validation

The system includes console logging at each step to help debug data flow:
- Step save events log current state
- Final submission logs the complete payload structure
- Activities and assignments are logged separately for verification

## API Endpoint

The data is submitted to: `POST /api/assessment-centers`

The payload includes all the required fields properly formatted according to the specifications above.
