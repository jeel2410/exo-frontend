# ExoTrack Admin Panel - Complete User Guide

## Table of Contents
1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [User Roles](#user-roles)
4. [Authentication](#authentication)
5. [Project Manager Features](#project-manager-features)
6. [Contractor/User Features](#contractoruser-features)
7. [Common Features](#common-features)
8. [Technical Details](#technical-details)

---

## Introduction

ExoTrack is a comprehensive project and contract management system built with React 19, TypeScript, and Tailwind CSS. This guide covers all administrative features available in the management panel, excluding client-facing functionalities.

### Technology Stack
- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query) for server state
- **Routing**: React Router v7
- **Forms**: Formik with Yup validation
- **Internationalization**: i18next (English/French)
- **API Base**: `https://exotrack.makuta.cash/api/V1`

---

## System Overview

### Architecture
The system uses a role-based access control (RBAC) architecture with two primary user types:
- **Project Manager** (`project_manager`)
- **Contractor/User** (`user`)

### Authentication Method
- JWT token-based authentication
- Custom header: `VAuthorization: Bearer {token}`
- Token stored in localStorage
- Auto-redirect based on user role

---

## User Roles

### Project Manager
**Primary Responsibilities:**
- Create and manage projects
- View project dashboard with analytics
- Monitor project progress
- View contracts and requests across all projects
- Archive/restore projects
- Manage project documentation

### Contractor/User
**Primary Responsibilities:**
- Create and manage contracts
- Submit payment requests
- Track request status through workflow stages
- Upload supporting documents
- View assigned projects
- Monitor contract budgets

---

## Authentication

### Sign In
**Route:** `/sign-in`

**Features:**
- Email/password authentication
- Role-based automatic redirection
- Remember me functionality
- Password visibility toggle
- Error handling with toast notifications

**Post-Login Redirection:**
- Project Managers → Project Dashboard (`/`)
- Contractors → Request List (`/requests`)

### Sign Up
**Route:** `/sign-up`

**Required Information:**
- First Name
- Last Name
- Company Name
- Email Address
- Password
- Password Confirmation

**Features:**
- Real-time validation
- Strong password requirements
- Email verification (via OTP)
- Duplicate email detection

### Password Recovery

#### Forgot Password
**Route:** `/forgot-password`

**Process:**
1. Enter registered email
2. Receive OTP via email
3. Verify OTP on next screen
4. Set new password

#### OTP Verification
**Route:** `/otp-verification`

**Features:**
- 6-digit OTP input
- Resend OTP option
- OTP expiration handling
- Auto-submit when complete

#### Reset Password
**Route:** `/reset-password`

**Requirements:**
- New password entry
- Password confirmation
- Minimum 8 characters
- Must include uppercase, lowercase, number, and special character

---

## Project Manager Features

### Dashboard Overview
**Route:** `/` or `/project-dashboard`

#### Summary Cards
The dashboard displays three key metrics:

1. **Total Projects**
   - Count of all projects
   - Icon: File/Violet

2. **Total Amount (USD)**
   - Sum of all project amounts in USD
   - Formatted with French thousands separator (space) and decimal (dot)
   - Example: 10,000.50 → "10 000.50"
   - Icon: USD/Green

3. **Total Amount (CDF)**
   - Sum of all project amounts in CDF (Congolese Franc)
   - Same formatting as USD
   - Icon: CDF/Cream

#### Project Table
**Columns:**
- Row Selection (checkbox)
- Project ID/Reference
- Project Name
- Amount (with currency)
- Created Date
- Number of Requests
- Status (Active/Draft/Archived)
- End Date
- Funded By
- Actions (View, Edit, Archive)

**Features:**
- **Search:** Real-time search by project name or reference
- **Filter by Date:** Start date and end date range
- **Pagination:** Configurable rows per page (8, 16, 32)
- **Bulk Actions:** 
  - Multi-select projects
  - Bulk archive selected projects
- **Archive Toggle:** View active or archived projects
- **Sorting:** Click column headers to sort

**Table Actions:**
- **View Details:** Navigate to project details page
- **Edit Project:** Navigate to edit form with pre-filled data
- **Archive Project:** Move project to archived state (single or bulk)

### Create Project
**Route:** `/create-project`

#### Project Information Form
**Required Fields:**

1. **Project Name**
   - Text input
   - Maximum 255 characters
   - Required

2. **Funded By**
   - Multi-select dropdown
   - Options loaded from API
   - Support for multiple funders
   - Required

3. **Project Reference**
   - Unique identifier
   - Text input
   - Validation for duplicate references
   - Required

4. **Amount**
   - Numeric input
   - Formatted with proper separators
   - Required

5. **Currency**
   - Dropdown selection
   - Options: USD, CDF, EUR, GBP
   - Required

6. **Begin Date**
   - Date picker
   - Format: YYYY-MM-DD
   - Required

7. **End Date**
   - Date picker
   - Must be after begin date
   - Required

8. **Description**
   - Rich text editor (TipTap)
   - Supports formatting:
     - Bold, Italic, Underline
     - Bullet points, Numbered lists
     - Headings
   - Optional

#### Project Addresses
**Multiple addresses can be added:**

**Address Fields:**
- Country (required)
- Province/State (required)
- City (required)
- Municipality/District (required)

**Address Management:**
- Add new address (button)
- Remove address (per row)
- Address validation
- Minimum 1 address required

#### Document Upload
**Features:**
- Drag-and-drop file upload
- Multiple file support
- Supported formats: PDF, DOC, DOCX, XLS, XLSX, images
- Maximum file size: 10MB per file
- Progress indicator during upload
- File preview
- Delete uploaded files
- Rename documents

**Document Management:**
- View uploaded documents
- Download documents
- Delete documents (confirmation required)
- Update document names

#### Form Actions
1. **Save as Draft**
   - Saves project without publishing
   - Can be edited later
   - Status: "Draft"

2. **Publish**
   - Makes project active
   - Status: "Active"
   - Cannot be modified without unpublishing

3. **Cancel**
   - Discards changes
   - Returns to dashboard
   - Confirmation prompt if data entered

#### Form Validation
- Real-time field validation
- Error messages in current language
- Form-level validation on submit
- Duplicate reference detection
- Date range validation
- Amount format validation

### Edit Project
**Route:** `/edit-project/:projectId`

**Features:**
- Pre-filled form with existing data
- Same validation as create
- Update existing documents
- Add new documents
- Maintains project history
- Preserve document associations

**Update Process:**
1. Loads existing project data
2. Displays in editable form
3. Allows modifications
4. Validates changes
5. Saves updates
6. Confirms success

### Project Details
**Route:** `/project-details/:projectId`

**Available to:** Project Managers and Contractors

#### Project Information Panel
**Display Fields:**
- Project Name
- Project Reference
- Amount (with currency badge)
- Project Begin Date
- Project End Date
- Funded By
- Description (rendered HTML)
- Status Badge
- Last Updated timestamp

#### Address Information Table
**Columns:**
- Country
- Province/State
- City
- Municipality/District

**Features:**
- Sortable columns
- Responsive design
- Mobile-optimized view

#### Requests Table
**Columns:**
- Request Number
- Amount (with currency)
- Created Date
- Status (with color-coded badge)
- Sub-status
- Actions (View Details)

**Status Colors:**
- Pending: Yellow
- Approved: Green
- Rejected: Red
- In Progress: Blue
- Draft: Gray

#### Document List
**Display:**
- Document name
- File type icon
- File size
- Upload date
- Download button
- View preview (for images/PDFs)

**Actions:**
- Download document
- View in new tab
- Print (for PDFs)

#### Comments Section
**Features:**
- Add comments
- View comment history
- User attribution
- Timestamp
- Edit own comments
- Delete own comments (with confirmation)

**Comment Display:**
- User profile picture
- User name
- Comment timestamp
- Comment text
- Edit/Delete buttons (for own comments)

### Archive Management

#### Archive Projects
**Methods:**
1. **Single Archive:**
   - Click archive icon on project row
   - Confirmation dialog
   - Moves to archived state

2. **Bulk Archive:**
   - Select multiple projects (checkboxes)
   - Click "Archive (n)" button
   - Confirmation dialog with count
   - Archives all selected

**Archive Behavior:**
- Projects remain viewable
- Cannot create new contracts
- Cannot submit new requests
- Shows "Archived" status badge
- Separate archived view

#### View Archived Projects
**Toggle Button:** "Show Archived Projects"

**Features:**
- Filters to archived projects only
- Same search and filter capabilities
- Cannot edit archived projects
- Can restore projects (unarchive)

**Archived Project Display:**
- Grayed out appearance
- "Archived" badge
- Limited actions available
- View-only mode

---

## Contractor/User Features

### Request Dashboard
**Route:** `/` or `/requests`

**Default landing page for contractors**

#### Search and Filter
**Search Bar:**
- Search by request number
- Real-time search
- Clear search button
- Loading indicator

**Date Filter:**
- Start date
- End date
- Apply filter button
- Clear filter option
- Date range picker

**Stage Filter:**
- Dropdown selection
- Filter by workflow stage:
  - All Stages (default)
  - Application Submission
  - Secretariat Review
  - Coordinator Review
  - Financial Review
  - Calculation Notes Transmission
  - FO Preparation
  - FO Validation
  - Coordinator Final Validation
  - Ministerial Review
  - Title Generation

#### Request Table
**Columns:**
- Request Number (unique ID)
- Amount (with currency)
- Total Amount (includes taxes)
- Created Date
- Status (current workflow stage)
- Sub-status
- Actions (View, Edit)

**Features:**
- Pagination (8, 16, 32 rows)
- Sortable columns
- Status color coding
- Responsive design
- Mobile-optimized view

**Empty State:**
- Displayed when no requests exist
- "Create Request" call-to-action
- Helpful messaging

### Contract Management

#### Contract List
**Route:** `/contract`

**Features:**
- View all contracts
- Search by contract name or reference
- Filter by date range
- Toggle archived contracts
- Pagination

**Contract List Table Columns:**
- Project Name
- Contract Name
- Reference
- Contracting Agency Name
- Agency Person Name & Position
- Awarded Company Name
- Company Person Name & Position
- Amount (with currency)
- Place
- Date of Signing
- Number of Requests
- Status
- Actions (View, Edit, Archive)

#### Create Contract
**Route:** `/create-contract/:projectId`

**Multi-step Process:**

##### Step 1: Select Project
**Route:** `/contract-project-list`

**Features:**
- List of available projects
- Search projects
- Filter by status
- Project selection table
- Continue to contract form

**Project Selection Table:**
- Project Name
- Reference
- Amount
- Currency
- Status
- Select button

##### Step 2: Contract Information Form

**Contracting Agency Section:**
1. **Agency Name**
   - Text input
   - Required
   - Maximum 255 characters

2. **Person Name**
   - Text input
   - Required
   - Maximum 100 characters

3. **Person Position**
   - Text input
   - Required
   - Maximum 100 characters

**Awarded Company Section:**
1. **Company Name**
   - Text input
   - Required
   - Maximum 255 characters

2. **Person Name**
   - Text input
   - Required
   - Maximum 100 characters

3. **Person Position**
   - Text input
   - Required
   - Maximum 100 characters

**Contract Details:**
1. **Contract Name**
   - Text input
   - Required
   - Maximum 255 characters

2. **Contract Reference**
   - Unique identifier
   - Text input
   - Required
   - Validation for duplicates

3. **Amount**
   - Numeric input
   - Required
   - Formatted display

4. **Currency**
   - Dropdown
   - Options: USD, CDF, EUR, GBP
   - Required

5. **Place**
   - Text input
   - Required
   - Location of contract signing

6. **Date of Signing**
   - Date picker
   - Required
   - Format: YYYY-MM-DD

**Document Upload:**
- Contract documents
- Supporting files
- Same upload features as project
- Multiple files supported

**Form Actions:**
- Save as Draft
- Submit for Review
- Cancel

##### Step 3: Review and Confirm
**Modal Display:**
- Summary of contract information
- Contracting agency details
- Awarded company details
- Contract amount and currency
- Documents list
- Confirm button
- Edit button (returns to form)

#### Edit Contract
**Route:** `/edit-contract/:contractId`

**Features:**
- Pre-filled contract form
- Same validation as create
- Update contract details
- Cannot change project association
- Must maintain contract integrity

**Restrictions:**
- Cannot edit if requests exist (warning)
- Cannot change amount if requests approved
- Maintains audit trail

#### Contract Details
**Route:** `/contract-details/:contractId`

**Available to:** Contractors and Project Managers

##### Contract Summary Cards
**Three metrics displayed:**

1. **Total Requests**
   - Count of all requests
   - All status included

2. **Approved Requests**
   - Count of approved requests
   - Green indicator

3. **Pending Requests**
   - Count of pending requests
   - Yellow indicator

4. **Rejected Requests**
   - Count of rejected requests
   - Red indicator

5. **Total Request Amount**
   - Sum of all request amounts
   - Formatted with currency

##### Contract Information Panel
**Display Fields:**
- Contract Name
- Contract Reference
- Project Name (linked)
- Contracting Agency Details:
  - Agency Name
  - Person Name
  - Position
- Awarded Company Details:
  - Company Name
  - Person Name
  - Position
- Amount (with currency badge)
- Place
- Date of Signing
- Created Date
- Number of Requests

##### Requests Table
**Displays all requests under this contract:**

**Columns:**
- Request Number
- Amount
- Total Amount (with tax)
- Created Date
- Current Status
- Sub-status
- Actions (View, Edit)

**Features:**
- Search requests
- Filter by date range
- Status filtering
- Pagination
- Sort by columns

**Request Actions:**
- **View Details:** Opens request detail page
- **Edit Request:** Navigate to edit form (if editable)

##### Contract Documents
**Document List:**
- Contract document
- Supporting documents
- Downloadable
- Preview available

**Document Actions:**
- Download
- View in browser
- Print
- Delete (if authorized)

##### Create Request from Contract
**Button:** "Create Request"

**Flow:**
1. Click create request button
2. Redirects to request creation form
3. Contract pre-selected
4. Project pre-selected
5. Fill request details

#### Archive Contract
**Features:**
- Archive button on contract row
- Confirmation dialog
- Moves to archived state
- Cannot create new requests
- View-only mode

**View Archived Contracts:**
- Toggle "Show Archived"
- Filter archived contracts
- Same display features
- Limited actions

### Create Request

#### Select Contract
**Route:** `/select-contract`

**Purpose:** Choose which contract the request belongs to

**Features:**
- List all active contracts
- Display contract details
- Show remaining budget
- Filter contracts
- Search functionality

**Contract Selection Table:**
- Contract Name
- Contract Reference
- Project Name
- Amount
- Currency
- Available Budget
- Number of Requests
- Select button

**No Contract State:**
- Modal displays if no contracts exist
- "Create Contract" call-to-action
- Helpful guidance message

#### Add Request Form
**Route:** `/add-request/:projectId/:contractId`

**Edit Route:** `/edit-request/:contractId/:requestId`

##### Breadcrumb Navigation
- Dashboard
- Contract Details
- Create/Edit Request

##### Contract Summary Display
**Shows:**
- Contract Name
- Contract Amount with Currency Badge
- Project Reference
- Remaining Budget
- Number of Existing Requests

##### Request Information

**Financial Authority Selection:**
1. **Acquisition Locale (Local Acquisition)**
   - Badge: Green "D"
   - Tax Category: location_acquisition
   - Additional Fields:
     - Issue Date
     - Nature of Operation

2. **Importation**
   - Badge: Teal "R"
   - Tax Category: importation
   - Additional Fields:
     - IT/IC Code
     - Tariff Position

**Address Selection:**
- Dropdown of project addresses
- Single selection required
- Display format: "Country, Province, City, Municipality"
- Validation: Must select address

**Request Letter:**
- Rich text editor
- Supports HTML formatting
- Required field
- Minimum length validation
- Save draft functionality

##### Entity/Items Table
**Columns:**
1. **Label**
   - Item description
   - Text input
   - Required
   - Maximum 500 characters

2. **Quantity**
   - Numeric input
   - Required
   - Minimum: 1
   - Decimal support (up to 2 places)

3. **Unit Price**
   - Numeric input
   - Required
   - Currency auto-matched to contract
   - Formatted display

4. **Tax Rate (%)**
   - Numeric input
   - Required
   - Range: 0-100
   - Default: 0

5. **Custom Duties** (for Importation)
   - Text input
   - Optional
   - Maximum 100 characters

6. **Reference** (for Importation)
   - Text input
   - Optional
   - Maximum 100 characters

7. **Total**
   - Auto-calculated
   - Formula: Quantity × Unit Price
   - Read-only
   - Formatted display

8. **Tax Amount**
   - Auto-calculated
   - Formula: Total × (Tax Rate / 100)
   - Read-only
   - Formatted display

9. **VAT Included**
   - Auto-calculated
   - Formula: Total + Tax Amount
   - Read-only
   - Formatted display

10. **Status**
    - Dropdown
    - Options: Active, Inactive
    - Default: Active

11. **Actions**
    - Edit row
    - Delete row (confirmation required)

**Table Features:**
- Add new row button
- Remove row button
- Inline editing
- Real-time calculation
- Row reordering (drag & drop)
- Copy row
- Duplicate detection

**Calculation Summary Cards:**
Displayed below table:

1. **Total Entities**
   - Count of items
   - Icon: File

2. **Total Amount**
   - Sum of all totals
   - Currency from contract
   - Icon: Currency

3. **Total Tax Amount**
   - Sum of all tax amounts
   - Currency from contract
   - Icon: Currency

4. **Total Amount with Tax**
   - Grand total
   - Sum of all VAT included
   - Currency from contract
   - Highlighted display

**Automatic Features:**
- Real-time calculations
- Currency formatting
- Budget validation
- Running totals
- Warning if exceeds contract amount

##### Document Upload Section
**Categories:**

1. **Mandatory Documents**
   - Required for submission
   - Specific document types
   - Validation on submit
   - Red indicator if missing

2. **Additional Documents**
   - Optional supporting files
   - Any file type
   - No validation required

**Upload Features:**
- Drag-and-drop zone
- Browse files button
- Multiple file upload
- Progress bar per file
- File size limit: 10MB
- Supported formats: PDF, DOC, DOCX, XLS, XLSX, Images
- File preview
- Delete uploaded files
- Rename documents

**Document Display:**
- File name
- File type icon
- File size
- Upload progress
- Status indicator
- Actions (View, Download, Delete)

##### Budget Validation
**Real-time Checks:**
- Sum of all requests vs contract amount
- Warning if exceeds budget
- Error message display
- Prevents submission if over budget
- Shows remaining budget

**Validation Rules:**
- Total request amount ≤ Contract amount
- Must have at least 1 entity
- All required fields filled
- Valid tax rates
- Valid quantities and prices

##### Form Actions

1. **Save Draft**
   - Saves current state
   - Can edit later
   - No validation required
   - Status: "Draft"

2. **Submit Request**
   - Full validation
   - Budget check
   - Document check
   - Confirmation modal
   - Status: "Application Submission"

3. **Cancel**
   - Discards changes
   - Confirmation prompt
   - Returns to contract details

##### Submission Confirmation Modal
**Displays:**
- Request summary
- Total amount
- Number of entities
- Document count
- Financial authority type
- Confirm button
- Edit button

#### Edit Request
**Route:** `/edit-request/:contractId/:requestId`

**Features:**
- Pre-filled form with existing data
- Same validation as create
- Cannot edit if in certain statuses:
  - Approved
  - In Payment
  - Completed
- Maintains request history
- Update documents
- Modify entities

**Edit Restrictions by Status:**
- **Draft:** Full editing
- **Application Submission:** Full editing
- **Under Review:** Limited editing (documents only)
- **Approved:** View only
- **Rejected:** Can resubmit with changes

**Update Process:**
1. Load existing request data
2. Display in editable form
3. Allow modifications
4. Validate changes
5. Save updates
6. Update status if needed
7. Notify relevant parties

### Request Details
**Route:** `/request-details/:requestId`

**Available to:** Contractors and Project Managers

#### Request Information Panel
**Display:**
- Request Number
- Associated Project (linked)
- Associated Contract (linked)
- Financial Authority (badge)
- Request Date
- Current Status (colored badge)
- Sub-status
- Total Amount (with currency)
- Total Tax Amount
- Grand Total (highlighted)

#### Status Timeline/Progress
**Visual workflow display:**
Shows request progress through stages:

1. Application Submission
2. Secretariat Review
3. Coordinator Review
4. Financial Review
5. Calculation Notes Transmission
6. FO Preparation
7. FO Validation
8. Coordinator Final Validation
9. Ministerial Review
10. Title Generation

**Progress Features:**
- Current stage highlighted
- Completed stages (green checkmark)
- Pending stages (gray)
- Stage dates and timestamps
- Reviewer information (if available)

#### Request Letter
**Display:**
- Rendered HTML content
- Full formatting preserved
- Print option
- Copy text option

#### Items/Entities Table
**Columns:**
- Label/Description
- Quantity
- Unit Price (with currency)
- Tax Rate (%)
- Total Amount
- Tax Amount
- Amount with VAT
- Status
- Custom Duties (if applicable)
- Reference (if applicable)

**Features:**
- Read-only view
- Formatted numbers
- Currency display
- Total row at bottom
- Export to Excel/PDF

#### Supporting Documents
**Document Categories:**
1. Mandatory Documents
2. Additional Documents
3. System-generated Documents (e.g., calculation notes)

**Document Display:**
- Document name
- Category badge
- File type icon
- File size
- Upload date
- Uploaded by (user name)
- Actions (Download, View)

**Document Actions:**
- Download individual file
- Download all as ZIP
- View in browser (for supported formats)
- Print (for PDFs)

#### Comments and History
**Comments Section:**
- Chronological display
- User attribution
- Timestamps
- Add new comment
- Edit own comments
- Delete own comments
- Reply to comments (threaded)

**History Log:**
- Status changes
- Modifications made
- User who made change
- Timestamp
- Change description
- Previous/new values

#### Request Actions (Based on Role and Status)

**Contractor Actions:**
- Edit (if editable status)
- Delete (if draft)
- Withdraw request
- Add comment
- Upload additional documents

**Project Manager Actions:**
- Review request
- Approve/Reject
- Request changes
- Add review comments
- Change status
- Generate reports

---

## Common Features

### Profile Management
**Route:** `/edit-profile`

**Available to:** All authenticated users

#### Profile Header
**Displays:**
- Profile picture (or initials avatar)
- Full name
- Email address
- Company name
- Last updated timestamp

**Profile Picture Upload:**
- Click to upload
- Drag-and-drop support
- Image preview
- Crop/resize tool
- Supported formats: JPG, PNG, GIF
- Maximum size: 5MB
- Avatar fallback (initials)

#### Basic Information Tab

**Editable Fields:**
1. **First Name**
   - Text input
   - Required
   - Maximum 50 characters

2. **Last Name**
   - Text input
   - Required
   - Maximum 50 characters

3. **Company Name**
   - Text input
   - Required
   - Maximum 100 characters

4. **Mobile Number**
   - Phone input with country code selector
   - International format
   - Optional
   - Validation for valid phone number

5. **Country Code**
   - Dropdown with flags
   - Auto-detect from browser
   - Required if mobile provided

**Form Actions:**
- Save Changes (button)
- Cancel (button)
- Real-time validation
- Success notification

**Update Process:**
1. Modify fields
2. Click Save Changes
3. Validate input
4. Upload new profile picture (if changed)
5. Update profile data
6. Show success message
7. Refresh profile display

#### Security Tab

**Change Email Section:**
**Fields:**
1. **Current Email**
   - Display only
   - Cannot edit directly

2. **New Email**
   - Email input
   - Required
   - Validation for valid email
   - Check for duplicate

3. **Verification**
   - OTP sent to new email
   - 6-digit code
   - Time-limited
   - Resend option

**Process:**
1. Enter new email
2. Click "Send Verification Code"
3. Receive OTP at new email
4. Enter OTP in modal
5. Verify code
6. Email updated
7. Success notification

**Change Password Section:**
**Fields:**
1. **Current Password**
   - Password input
   - Required
   - Show/hide toggle

2. **New Password**
   - Password input
   - Required
   - Minimum 8 characters
   - Must contain:
     - Uppercase letter
     - Lowercase letter
     - Number
     - Special character
   - Strength indicator
   - Show/hide toggle

3. **Confirm New Password**
   - Password input
   - Required
   - Must match new password
   - Show/hide toggle

**Password Requirements Display:**
- Visual checklist
- Green checkmark for met requirements
- Red X for unmet requirements
- Real-time validation

**Process:**
1. Enter current password
2. Enter new password
3. Confirm new password
4. Click "Update Password"
5. Validate all fields
6. Check current password
7. Update password
8. Force logout (security)
9. Redirect to login

**Security Features:**
- Password strength meter
- Breach detection (optional)
- Two-factor authentication setup (future)
- Active sessions management (future)

#### Logout Button
**Location:** Bottom of sidebar

**Action:**
- Opens logout confirmation modal
- Clear local storage
- Clear session data
- Redirect to login page
- Close all active connections

**Logout Modal:**
- Confirmation message
- "Yes, Logout" button
- "Cancel" button
- Warning about unsaved changes

### Help & Support
**Route:** `/help`

**Available to:** All users (including guests)

#### FAQ Section
**Categories:**
- Getting Started
- Projects
- Contracts
- Requests
- Account Management
- Troubleshooting

**Features:**
- Expandable/collapsible questions
- Search FAQ
- Filter by category
- Print friendly
- Multi-language support

**FAQ Structure:**
- Question title
- Detailed answer
- Related questions links
- "Was this helpful?" feedback
- Contact support link

#### Contact Support Form
**Fields:**
1. **Name**
   - Auto-filled if logged in
   - Text input
   - Required

2. **Email**
   - Auto-filled if logged in
   - Email input
   - Required

3. **Subject**
   - Text input
   - Required
   - Maximum 200 characters

4. **Category**
   - Dropdown
   - Options: Technical, Billing, Feature Request, Other
   - Required

5. **Message**
   - Textarea
   - Required
   - Minimum 50 characters
   - Maximum 1000 characters

6. **Attachments**
   - Optional file upload
   - Screenshots, documents
   - Maximum 5 files
   - 10MB total limit

**Form Actions:**
- Submit (button)
- Clear form (button)
- Save draft (auto-save)

**Submission Process:**
1. Fill form
2. Attach files (if needed)
3. Click Submit
4. Validate fields
5. Send to support system
6. Generate ticket number
7. Send confirmation email
8. Display success message

#### Documentation Links
**Available Resources:**
- User Guide (PDF)
- Video Tutorials
- API Documentation (for developers)
- Release Notes
- System Requirements

#### System Status
**Display:**
- Current system status
- Scheduled maintenance
- Recent incidents
- Performance metrics

### Navigation

#### App Header
**Elements:**
- Logo (click to go home)
- Role-based navigation tabs
- User dropdown menu
- Language switcher (EN/FR)
- Notifications bell

**Project Manager Navigation Tabs:**
- Dashboard
- Projects
- Help

**Contractor Navigation Tabs:**
- Requests
- Contracts
- Projects (view only)
- Help

#### User Dropdown Menu
**Options:**
- Profile (with avatar)
- Edit Profile
- Settings
- Logout

**Features:**
- Hover to open
- Click outside to close
- Keyboard navigation
- Smooth animations

#### Sidebar (Mobile)
**Features:**
- Hamburger menu toggle
- Slide-in animation
- Backdrop overlay
- Same navigation options as header
- Close button
- Swipe to close

**Sidebar State:**
- Stored in context
- Persists across pages
- Responsive behavior
- Auto-collapse on route change (mobile)

#### Breadcrumbs
**Display:**
- Current page hierarchy
- Clickable links to parent pages
- Separator icons
- Truncation for long paths
- Responsive behavior

**Example:**
Dashboard > Projects > Project Details > Edit

#### Back Button
**Features:**
- Appears on detail pages
- Browser back history
- Confirmation if unsaved changes
- Arrow icon + "Back" text

### Notifications
**Types:**
1. **Toast Notifications**
   - Success (green)
   - Error (red)
   - Warning (yellow)
   - Info (blue)

**Features:**
- Auto-dismiss (5 seconds)
- Manual dismiss (X button)
- Stack multiple notifications
- Slide-in animation
- Position: Top-right

**Notification Triggers:**
- Form submission success/failure
- Data save/update
- Network errors
- Validation errors
- Permission issues

2. **In-App Notifications** (Future)
   - Bell icon in header
   - Badge count
   - Notification dropdown
   - Mark as read
   - Clear all

### Data Tables (Common Features)

#### Search
**Features:**
- Real-time search
- Debounced input (500ms)
- Search icon indicator
- Clear search button
- Search across multiple columns
- Case-insensitive

**Search Behavior:**
- Updates on Enter key
- Updates on Search button click
- Resets to page 1 on new search
- Maintains other filters

#### Filters
**Date Range Filter:**
- Start date picker
- End date picker
- Apply button
- Clear button
- Date validation (start < end)
- Format: YYYY-MM-DD

**Status Filter:**
- Dropdown selection
- Multiple status options
- "All" option to clear filter
- Applies immediately

**Filter Panel:**
- Dropdown overlay
- Click outside to close
- Apply/Clear buttons
- Filter indicator badge

#### Pagination
**Features:**
- Rows per page selector (8, 16, 32)
- Previous/Next buttons
- Page number display
- Total pages display
- Disabled state for first/last page
- Maintains filters on page change

**Pagination Display:**
- "Page X of Y"
- "Rows per page: [Dropdown]"
- Navigation arrows

#### Sorting
**Features:**
- Click column header to sort
- Ascending/descending toggle
- Sort indicator icon (up/down arrow)
- Default sort (usually by date/name)
- Maintains filters and search

#### Column Management
**Features:**
- Show/hide columns (future)
- Reorder columns (future)
- Resize columns (future)
- Column presets (future)

#### Empty States
**Displays when:**
- No data exists
- Search returns no results
- Filters exclude all records

**Empty State Elements:**
- Illustration/icon
- Helpful message
- Primary action button (e.g., "Create New")
- Secondary action (e.g., "Clear Filters")

#### Loading States
**Skeleton Loaders:**
- Project details skeleton
- Project list skeleton
- Contract details skeleton
- Contract list skeleton
- Request details skeleton
- Request list skeleton

**Features:**
- Animated shimmer effect
- Matches actual layout
- Responsive design
- Smooth transition to real content

#### Row Actions
**Common Actions:**
- View (eye icon)
- Edit (pencil icon)
- Delete (trash icon)
- Archive (archive icon)
- More actions (three dots menu)

**Action Menus:**
- Hover to show
- Dropdown for multiple actions
- Confirmation for destructive actions
- Disabled state for unavailable actions
- Tooltips on hover

#### Responsive Behavior
**Mobile View:**
- Horizontal scroll for wide tables
- Sticky first column
- Reduced columns (priority columns only)
- Card view alternative (future)
- Touch-friendly action buttons

**Tablet View:**
- Adjusted column widths
- Maintained functionality
- Optimized spacing
- Touch-friendly targets

### Multi-language Support

#### Language Switcher
**Location:** Header (top-right)

**Supported Languages:**
1. English (EN) - Flag: 🇺🇸
2. French (FR) - Flag: 🇫🇷

**Features:**
- Dropdown or toggle button
- Flag icons
- Language names
- Active language highlighted
- Persists selection (localStorage)

**Language Change Behavior:**
- Instant UI update
- No page reload
- Maintains current page state
- Updates all text strings
- Formats dates/numbers correctly

#### Translated Elements
**UI Elements:**
- All labels and buttons
- Form field labels
- Error messages
- Success messages
- Validation messages
- Empty state messages
- Table headers
- Modal titles and content
- Help text and tooltips

**Date Formats:**
- EN: MM/DD/YYYY
- FR: DD/MM/YYYY

**Number Formats:**
- Thousands separator: space (both languages)
- Decimal separator: . (dot) for both
- Example: 10 000.50

**Currency Display:**
- Symbol position based on language
- EN: $10 000.50
- FR: 10 000.50 $

#### Translation Keys
**Organized by Feature:**
- auth.* (authentication)
- dashboard.* (dashboard)
- project.* (projects)
- contract.* (contracts)
- request.* (requests)
- common.* (common elements)
- error.* (error messages)
- validation.* (validation messages)

### Error Handling

#### Error Types

**1. Validation Errors**
- Display inline under field
- Red text color
- Icon indicator
- Real-time validation
- Clear on field update

**2. Network Errors**
- Toast notification
- Generic error message
- Retry button
- Check internet connection message

**3. API Errors**
- Parsed error messages
- User-friendly translation
- Error codes (for support)
- Toast notification

**4. Permission Errors**
- Redirect to login (if token expired)
- "Access Denied" message
- Contact admin message
- 403 error page

**5. Not Found Errors**
- 404 error page
- Friendly message
- Return to dashboard button
- Helpful links

#### Error Messages

**Display Locations:**
- Toast notifications (temporary)
- Inline form errors (persistent)
- Alert boxes (important)
- Error pages (navigation errors)

**Error Message Structure:**
- Clear description
- Actionable next steps
- Support contact (for critical errors)
- Error code (for technical support)

**Example Error Messages:**
- "Failed to save project. Please try again."
- "Invalid email format. Please check and retry."
- "Session expired. Please log in again."
- "You don't have permission to perform this action."
- "Network error. Please check your connection."

### Data Formatting

#### Amount Formatting
**Standard Format:**
- French thousands separator (space)
- English decimal separator (dot)
- Always 2 decimal places
- No negative display (validation prevents)

**Examples:**
- 10000.50 → "10 000.50"
- 1000000 → "1 000 000.00"
- 50.5 → "50.50"
- 0 → "0.00"

**Formatting Function:**
```typescript
formatAmount(amount: number | string): string
```
Location: `src/utils/numberFormat.ts`

**Usage in Components:**
- DashboardCard (automatic)
- All currency displays
- Table amount columns
- Summary totals

#### Date Formatting
**Display Formats:**
- Short: YYYY/MM/DD
- Long: Month DD, YYYY
- Timestamp: YYYY-MM-DD HH:mm:ss

**Formatting Functions:**
- moment.js library
- Format: moment(date).format("YYYY/MM/DD")
- Localized based on language setting

**Date Pickers:**
- Calendar popup
- Month/year navigation
- Date range selection
- Min/max date constraints
- Disabled dates (past dates for end date, etc.)

#### Status Formatting
**Status Badges:**
- Colored background
- White or contrasting text
- Rounded corners
- Icon (optional)
- Uppercase text

**Status Colors:**
- Active/Approved: Green (#10B981)
- Pending: Yellow (#F59E0B)
- Draft: Gray (#6B7280)
- Rejected: Red (#EF4444)
- Archived: Blue (#3B82F6)

**Badge Component:**
- Reusable component
- Props: status, color, icon
- Responsive sizing
- Tooltip with full status name

---

## Technical Details

### API Structure

#### Base URL
```
https://exotrack.makuta.cash/api/V1
```

#### Authentication
**Header:**
```
VAuthorization: Bearer {token}
```

**Token Storage:**
- localStorage key: "user"
- Format: JSON string
- Contains: token, user data, role

#### API Endpoints

**Authentication:**
- POST `/auth/login` - Sign in
- POST `/auth/register` - Sign up
- POST `/auth/forgot-password` - Request password reset
- POST `/auth/verify-otp` - Verify OTP
- POST `/auth/reset-password` - Reset password
- GET `/auth/profile` - Get user profile
- PUT `/auth/profile` - Update profile
- POST `/auth/change-password` - Change password
- POST `/auth/change-email` - Change email

**Projects:**
- POST `/project/create` - Create project
- POST `/project/view` - Get project details
- POST `/project/list` - List projects (with filters)
- POST `/project/update` - Update project (uses project_id)
- DELETE `/project/delete` - Delete projects (soft delete)
- DELETE `/project/archive` - Archive projects
- POST `/project/list-address` - List project addresses

**Contracts:**
- POST `/contract/create` - Create contract
- POST `/contract/view` - Get contract details
- POST `/contract/list` - List contracts (with filters)
- POST `/contract/update` - Update contract
- DELETE `/contract/archive` - Archive contract
- POST `/contract/project-list` - List projects for contract creation

**Requests:**
- POST `/request/create` - Create request
- POST `/request/view` - Get request details
- POST `/request/list` - List requests (with filters)
- POST `/request/update` - Update request
- DELETE `/request/delete` - Delete request

**Files:**
- POST `/document/upload` - Upload file
- DELETE `/document/remove` - Remove file
- PUT `/document/rename` - Rename file

**Home/Dashboard:**
- POST `/home/dashboard` - Get dashboard data (project manager)

#### API Request Format

**Pagination:**
```json
{
  "limit": 8,
  "offset": 0
}
```

**Search:**
```json
{
  "search": "search term"
}
```

**Date Filter:**
```json
{
  "start_date": "YYYY-MM-DD",
  "end_date": "YYYY-MM-DD"
}
```

**Status Filter:**
```json
{
  "status": "active" | "draft" | "archived"
}
```

#### API Response Format

**Success Response:**
```json
{
  "status": 200,
  "data": { ... },
  "message": "Success message"
}
```

**List Response:**
```json
{
  "status": 200,
  "data": [ ... ],
  "total": 100,
  "message": "Success"
}
```

**Error Response:**
```json
{
  "status": 400,
  "message": "Error message",
  "errors": {
    "field": ["Error detail"]
  }
}
```

### State Management

#### Context Providers

**1. AuthContext**
Location: `src/context/AuthContext.tsx`

**Provides:**
- user (current user data)
- login(email, password)
- logout()
- isAuthenticated
- userRole (project_manager | user)

**Usage:**
```typescript
const { user, login, logout } = useAuth();
```

**2. LoaderProvider**
Location: `src/context/LoaderProvider.tsx`

**Provides:**
- loading (boolean)
- setLoading(value: boolean)

**Usage:**
```typescript
const { loading, setLoading } = useLoading();
```

**3. SidebarContext**
Location: `src/context/SidebarContext.tsx`

**Provides:**
- sidebarOpen (boolean)
- setSidebarOpen(value: boolean)
- toggleSidebar()

**Usage:**
```typescript
const { sidebarOpen, toggleSidebar } = useSidebar();
```

#### React Query

**Configuration:**
- Stale time: 5 minutes
- Cache time: 10 minutes
- Retry: 3 times
- Retry delay: exponential backoff

**Query Keys Structure:**
- `['project', projectId]`
- `['contract', contractId]`
- `['request', requestId]`
- `['contracts', filters]`
- `['requests', filters]`

**Mutations:**
- Optimistic updates (for edit operations)
- Automatic refetch on success
- Error handling with toast
- Loading states

### Routing

#### Route Protection

**PublicRoute:**
- Redirects authenticated users to dashboard
- Used for: login, signup, forgot password

**ProtectedRoute:**
- Requires authentication
- Redirects to login if not authenticated
- Used for: profile, settings

**RoleBasedRoute:**
- Requires authentication AND specific role
- Redirects if wrong role
- Used for: role-specific features

#### Route Structure

```
/ - Home (role-based redirect)
/sign-in - Sign in page
/sign-up - Sign up page
/forgot-password - Forgot password
/otp-verification - OTP verification
/reset-password - Reset password

/project-dashboard - Project list (project manager)
/create-project - Create project form
/edit-project/:projectId - Edit project form
/project-details/:projectId - Project details

/contract - Contract list (user)
/contract-project-list - Select project for contract
/create-contract/:projectId - Create contract form
/edit-contract/:contractId - Edit contract form
/contract-details/:contractId - Contract details

/requests - Request list (user)
/select-contract - Select contract for request
/add-request/:projectId/:contractId - Create request
/edit-request/:contractId/:requestId - Edit request
/request-details/:requestId - Request details

/edit-profile - Edit profile
/help - Help and support
```

### Form Validation

#### Validation Library
**Yup:** Schema-based validation

#### Common Validation Rules

**Email:**
```typescript
email: Yup.string()
  .email("Invalid email format")
  .required("Email is required")
```

**Password:**
```typescript
password: Yup.string()
  .min(8, "Password must be at least 8 characters")
  .matches(/[A-Z]/, "Must contain uppercase letter")
  .matches(/[a-z]/, "Must contain lowercase letter")
  .matches(/[0-9]/, "Must contain number")
  .matches(/[@$!%*?&#]/, "Must contain special character")
  .required("Password is required")
```

**Amount:**
```typescript
amount: Yup.number()
  .positive("Amount must be positive")
  .required("Amount is required")
```

**Date:**
```typescript
beginDate: Yup.date()
  .required("Begin date is required"),
endDate: Yup.date()
  .min(Yup.ref('beginDate'), "End date must be after begin date")
  .required("End date is required")
```

**Required Field:**
```typescript
fieldName: Yup.string()
  .required("Field is required")
  .max(255, "Maximum 255 characters")
```

#### Form Handling with Formik

**Features:**
- Initial values
- Validation schema
- onSubmit handler
- Error display
- Touched state
- Dirty state (unsaved changes)

**Example Usage:**
```typescript
const formik = useFormik({
  initialValues: {...},
  validationSchema: validationSchema,
  onSubmit: (values) => {
    // Handle submission
  }
});
```

### File Upload

#### Upload Service
Location: `src/services/project.service.ts`

**Upload Function:**
```typescript
async uploadFile(data: FormData, config?: any)
```

**FormData Structure:**
```
file: File object
type: "document" | "image"
```

#### Upload Component
Location: `src/components/common/UploadFile.tsx`

**Props:**
- files: UploadedFile[]
- onFilesChange: (files: UploadedFile[]) => void
- maxFiles?: number
- maxSize?: number (in bytes)
- acceptedTypes?: string[]

**Features:**
- Drag-and-drop zone
- File browser dialog
- Progress tracking
- Error handling
- File preview
- Delete files
- Rename files

#### UploadedFile Interface
```typescript
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  upload_date?: string;
}
```

### Security Features

#### Authentication
- JWT token-based
- Token expiration handling
- Auto-logout on token expiry
- Refresh token (future)

#### Authorization
- Role-based access control (RBAC)
- Route-level protection
- Component-level permissions
- API-level validation

#### Data Protection
- Input sanitization
- XSS prevention
- CSRF protection
- Secure headers

#### Password Security
- Strong password requirements
- Password hashing (server-side)
- No password storage in frontend
- Secure password reset flow

### Performance Optimization

#### Code Splitting
- Route-based code splitting
- Lazy loading for pages
- Dynamic imports
- Reduced initial bundle size

#### Caching
- React Query caching
- Browser caching
- Service worker (future)
- Static asset caching

#### Optimizations
- Image optimization
- Debounced search inputs
- Virtualized lists (for large tables)
- Memoized components
- Optimistic updates

### Responsive Design

#### Breakpoints
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px
- Large Desktop: > 1280px

#### Mobile Features
- Touch-friendly buttons (min 44px)
- Responsive tables (horizontal scroll)
- Collapsible navigation
- Bottom sheet modals
- Swipe gestures

#### Tablet Features
- Hybrid layout
- Adjusted spacing
- Optimized images
- Touch and mouse support

### Accessibility

#### WCAG Compliance
- Level AA compliance target
- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management

#### Keyboard Shortcuts
- Tab navigation
- Enter to submit
- Escape to close modals
- Arrow keys in dropdowns

#### Screen Reader Support
- Semantic HTML
- ARIA landmarks
- Alt text for images
- Form labels
- Error announcements

---

## Troubleshooting

### Common Issues

#### Cannot Login
**Possible Causes:**
- Incorrect email/password
- Account not activated
- Network issue
- Token expired

**Solutions:**
1. Check credentials
2. Verify email address
3. Reset password if forgotten
4. Check internet connection
5. Clear browser cache
6. Try different browser

#### Page Not Loading
**Possible Causes:**
- Network error
- Server down
- Permission issue
- Invalid route

**Solutions:**
1. Refresh page
2. Check internet connection
3. Verify login status
4. Clear browser cache
5. Check system status

#### Form Won't Submit
**Possible Causes:**
- Validation errors
- Network issue
- File too large
- Required fields missing

**Solutions:**
1. Check for error messages
2. Ensure all required fields filled
3. Verify file sizes
4. Check internet connection
5. Try again after a moment

#### Upload Failed
**Possible Causes:**
- File too large
- Unsupported format
- Network timeout
- Server storage full

**Solutions:**
1. Check file size (max 10MB)
2. Verify file format
3. Try smaller file
4. Retry upload
5. Contact support if persists

#### Data Not Updating
**Possible Causes:**
- Cache issue
- Sync delay
- Permission issue
- Network error

**Solutions:**
1. Refresh page
2. Clear browser cache
3. Log out and log back in
4. Check permissions
5. Wait a moment and retry

### Error Codes

**400 Bad Request**
- Invalid input data
- Check form validation

**401 Unauthorized**
- Not logged in
- Token expired
- Log in again

**403 Forbidden**
- No permission
- Contact administrator
- Check user role

**404 Not Found**
- Resource doesn't exist
- Check URL
- Resource may be deleted

**500 Internal Server Error**
- Server issue
- Try again later
- Contact support if persists

---

## Best Practices

### For Project Managers

1. **Project Creation:**
   - Use descriptive project names
   - Add complete project information
   - Upload all relevant documents
   - Set realistic timelines
   - Verify budget amounts

2. **Monitoring:**
   - Check dashboard regularly
   - Review pending requests promptly
   - Monitor project progress
   - Track budget usage
   - Respond to contractor questions

3. **Communication:**
   - Add clear comments
   - Respond within 24 hours
   - Request clarification when needed
   - Document decisions
   - Keep contractors informed

### For Contractors

1. **Contract Creation:**
   - Verify contract details carefully
   - Upload signed contract documents
   - Ensure amount matches project
   - Select correct project
   - Review before submitting

2. **Request Submission:**
   - Provide detailed item descriptions
   - Verify calculations
   - Upload all required documents
   - Select correct financial authority
   - Double-check before submit

3. **Documentation:**
   - Keep documents organized
   - Use clear file names
   - Upload high-quality scans
   - Include all required documents
   - Update documents if requested

4. **Communication:**
   - Respond to review comments
   - Provide requested information promptly
   - Ask questions when unclear
   - Check request status regularly
   - Update contact information

### For All Users

1. **Security:**
   - Use strong passwords
   - Never share login credentials
   - Log out on shared computers
   - Update password regularly
   - Report suspicious activity

2. **Data Entry:**
   - Double-check all information
   - Use consistent formatting
   - Verify amounts and dates
   - Save drafts frequently
   - Proofread before submit

3. **System Usage:**
   - Keep browser updated
   - Use supported browsers (Chrome, Firefox, Edge)
   - Clear cache if issues occur
   - Report bugs to support
   - Provide feedback for improvements

---

## Appendix

### Keyboard Shortcuts

**Global:**
- `Ctrl/Cmd + S`: Save (in forms)
- `Esc`: Close modals
- `Tab`: Navigate fields
- `Enter`: Submit forms
- `Ctrl/Cmd + F`: Search (in tables)

**Navigation:**
- `Alt + D`: Dashboard
- `Alt + P`: Profile
- `Alt + H`: Help

### Browser Support

**Fully Supported:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Partially Supported:**
- Internet Explorer 11 (limited features)
- Older browser versions (basic functionality)

**Recommended:**
- Chrome (latest)
- Firefox (latest)
- Edge (latest)

### System Requirements

**Minimum:**
- Internet connection: 1 Mbps
- RAM: 4GB
- Screen resolution: 1024x768
- JavaScript enabled
- Cookies enabled

**Recommended:**
- Internet connection: 5 Mbps+
- RAM: 8GB+
- Screen resolution: 1920x1080
- Modern browser
- Ad blocker disabled

### Glossary

**Terms:**

- **Contract:** Agreement between contracting agency and awarded company
- **Entity:** Individual item or service in a request
- **Financial Authority:** Type of tax category (Local Acquisition or Importation)
- **Project:** High-level initiative with budget and timeline
- **Request:** Payment request submitted under a contract
- **Status:** Current state of project/contract/request
- **Sub-status:** Detailed status within a workflow stage

**Roles:**

- **Project Manager:** User who creates and manages projects
- **Contractor/User:** User who creates contracts and submits requests
- **Administrator:** System admin with full access (not covered in this guide)

### Contact Information

**Technical Support:**
- Email: [To be provided]
- Phone: [To be provided]
- Hours: [To be provided]

**General Inquiries:**
- Email: [To be provided]
- Website: [To be provided]

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-02 | Initial documentation | System |

---

*This user guide is subject to updates as new features are added to the system. Always refer to the latest version available in the application's Help section.*
