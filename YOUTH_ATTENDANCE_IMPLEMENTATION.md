# Youth Attendance Code Split - Implementation Summary

## Files Created/Updated

### 1. **Type Definitions**
   - **File**: `src/types/youthAttendance.type.ts`
   - **Purpose**: Defines all TypeScript interfaces for youth attendance
   - **Includes**:
     - `YouthAttendance` - Main attendance record interface
     - `CreateYouthAttendanceData` - Data for creating records
     - `UpdateYouthAttendanceData` - Data for updating records
     - `YouthAttendanceFilters` - Filter options
     - Response types

### 2. **API Endpoints**
   - **File**: `src/api/admin.api.ts`
   - **New Methods Added**:
     - `getYouthAttendance(filters)` - Fetch attendance records with filters
     - `getYouthAttendanceById(yaId)` - Fetch single record
     - `createYouthAttendance(data)` - Create new record
     - `updateYouthAttendance(yaId, data)` - Update existing record
     - `deleteYouthAttendance(yaId)` - Delete record
     - `uploadYouthAttendanceCSV(fileData, attendanceType)` - Bulk upload via CSV

### 3. **Custom Hook**
   - **File**: `src/modules/admin/hooks/useYouthAttendance.ts`
   - **Exports**:
     - `useYouthAttendance(filters)` - Query hook for fetching records
     - `useYouthAttendanceById(yaId)` - Query hook for single record
     - `useCreateYouthAttendance()` - Mutation hook for creating
     - `useUpdateYouthAttendance()` - Mutation hook for updating
     - `useDeleteYouthAttendance()` - Mutation hook for deleting
     - `useUploadYouthAttendanceCSV()` - Mutation hook for CSV upload

### 4. **Schema**
   - **File**: `src/modules/admin/schemas/youthMinistry/youthAttendance.schema.ts`
   - **Updated**: Zod schema now includes all fields from API payload
   - **Fields**:
     - Location: state_id, region_id, district_id, group_id, old_group_id
     - Attendance Type: weekly or revival
     - Date Info: year, month, week (for weekly)
     - Numbers: male, female, member_boys, member_girls, visitor_boys, visitor_girls
     - Optional: challenges, solutions, testimony, remarks

### 5. **UI Components** (Code Split)

#### Header Component
- **File**: `src/modules/admin/pages/attendance/youthAttendance/components/YouthAttendanceHeader.tsx`
- **Features**: Title, add button, export button

#### Dialog Component
- **File**: `src/modules/admin/pages/attendance/youthAttendance/components/YouthAttendanceDialog.tsx`
- **Features**:
  - Form with cascading location selectors
  - Date selection (month, year, week for weekly)
  - Attendance numbers input
  - Optional text fields (challenges, solutions, testimony, remarks)
  - Validation with error messages

#### Table Component
- **File**: `src/modules/admin/pages/attendance/youthAttendance/components/YouthAttendanceTable.tsx`
- **Features**:
  - Display attendance records
  - Edit and delete actions
  - Loading skeleton states
  - Empty state message

#### Filters Component
- **File**: `src/modules/admin/pages/attendance/youthAttendance/components/YouthAttendanceFilters.tsx`
- **Features**:
  - Month selector
  - Year selector
  - Filter and reset buttons
  - Real-time filter application

#### Components Index
- **File**: `src/modules/admin/pages/attendance/youthAttendance/components/index.ts`
- **Exports**: All components for easy importing

## API Endpoints Implemented

Based on Swagger documentation:

1. **GET** `/youth-attendance/youth-attendance` - List attendance records
   - Query params: attendance_type, year, month
   - Filters by user access level
   
2. **POST** `/youth-attendance/youth-attendance` - Create record
   - Supports 'weekly' or 'revival' types
   
3. **POST** `/youth-attendance/youth-attendance/upload` - Bulk CSV upload
   - Query param: attendance_type (weekly|revival)
   
4. **GET** `/youth-attendance/youth-attendance/{ya_id}` - Get single record
   
5. **PUT** `/youth-attendance/youth-attendance/{ya_id}` - Update record
   
6. **DELETE** `/youth-attendance/youth-attendance/{ya_id}` - Delete record

## Usage Example

```tsx
import { useYouthAttendance, useCreateYouthAttendance } from '@/modules/admin/hooks/useYouthAttendance'
import { YouthAttendanceDialog, YouthAttendanceTable } from '@/modules/admin/pages/attendance/youthAttendance/components'

function MyComponent() {
  const { data, isLoading } = useYouthAttendance({ attendance_type: 'weekly' })
  const createMutation = useCreateYouthAttendance()

  const handleSave = async (data) => {
    await createMutation.mutateAsync(data)
  }

  return (
    <div>
      <YouthAttendanceTable data={data?.data || []} isLoading={isLoading} />
      <YouthAttendanceDialog onSave={handleSave} />
    </div>
  )
}
```

## Features

✅ Fully typed with TypeScript
✅ React Query integration for data management
✅ Zod validation for forms
✅ Cascading location filters
✅ Support for both weekly and revival attendance
✅ Bulk CSV upload support
✅ Error handling and user feedback
✅ Skeleton loading states
✅ Responsive UI with Chakra-UI
✅ Modular component architecture

## Next Steps

1. Update `YouthWeeklyAttendance.tsx` and `YouthRevivalAttendance.tsx` to use new components
2. Implement export functionality (CSV, Excel, PDF)
3. Add confirmation dialogs for delete operations
4. Implement bulk edit features if needed
5. Add pagination for large datasets
