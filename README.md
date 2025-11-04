# AI-Powered Insurance Claims Dashboard

A modern claims management dashboard for insurance companies featuring AI-powered damage assessment and automated claim processing.

## Features

### Core Dashboard Features
- **Claims List View**: Comprehensive list of all insurance claims with real-time status updates
- **Advanced Filtering**: Filter claims by status, priority, and custom search criteria
- **Smart Search**: Search across claim numbers, policyholder names, policy numbers, and vehicle information
- **Multi-Sort Options**: Sort claims by date, priority, or estimated repair cost
- **Status Overview**: Dashboard cards showing claim counts by status

### Claim Detail View
- **Complete Claim Information**: View all policyholder and vehicle details
- **AI Assessment Display**: Visual representation of AI-generated damage assessments
- **Confidence Scoring**: See AI confidence levels for each claim
- **Damage Analysis**: Detailed breakdown of damage type, severity, and affected parts
- **Cost Estimates**: AI-generated repair cost estimates
- **Notes & Comments**: Add and view internal notes with categorization
- **Status Management**: Update claim status with action buttons

### AI Assessment Features
- Multiple damage types: scratch, dent, structural, paint, glass, mechanical
- Severity classification: minor, moderate, severe, total loss
- Affected parts tracking
- Confidence scoring (0-100%)
- Cost estimation

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite

## Database Schema

### Tables
1. **claims** - Core claim information
2. **ai_assessments** - AI-generated damage assessments
3. **damage_images** - Uploaded damage photos
4. **claim_notes** - Agent notes and comments
5. **claim_history** - Audit trail of all changes

## Getting Started

### Prerequisites
- Node.js 18+ installed
- Supabase account and project

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Add your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. The database schema has been automatically created with sample data

### Running the Application

Development mode:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Claim Statuses

- **Pending Review**: Newly submitted claims awaiting initial review
- **Under Review**: Claims actively being reviewed by agents
- **Requires Manual Review**: Claims flagged for manual inspection (low AI confidence)
- **Approved**: Claims approved for repair
- **Rejected**: Claims denied

## Priority Levels

- **Urgent**: Requires immediate attention
- **High**: Important claims needing quick review
- **Medium**: Standard priority
- **Low**: Non-urgent claims

## Sample Data

The application includes 8 sample claims with various statuses, priorities, and AI assessments for testing and demonstration purposes.

## Key Features by User Story

### As a Claims Agent, I want to:

1. **View all pending claims** - Filter by "Pending Review" status
2. **See AI confidence scores** - Displayed on each claim card and detail view
3. **Review damage assessments** - Detailed breakdown in claim detail modal
4. **Add notes to claims** - Internal notes with categorization
5. **Update claim status** - One-click status updates with audit trail
6. **Search and filter claims** - Advanced search and multi-filter capabilities
7. **Sort claims by priority** - Multiple sort options available

## Future Enhancements (Not Implemented)

Based on the PRD, these features are planned for future releases:
- Image upload and viewing
- Real-time AI damage assessment integration
- Adjuster assignment workflow
- Approval/rejection workflows with email notifications
- Advanced analytics and reporting
- Bulk operations
- Export functionality

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for all operations
- Audit trail for all claim modifications
- Secure API access through Supabase

## Performance

- Optimized queries with database indexes
- Efficient filtering and sorting
- Responsive design for all screen sizes
- Fast build times with Vite

## Browser Support

Modern browsers supporting ES2020+:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

This is a prototype application for demonstration purposes.
