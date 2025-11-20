# Care Gap Management System

A professional healthcare application interface for managing patient care gaps. The system coordinates between nurses (quick questionnaires) and doctors (comprehensive gap review).

## Features

### Nurse View
- Patient selection from Supabase storage
- Loads patient data and triggers n8n workflow
- Quick questionnaire interface
- Multiple input types (date, yes/no, number, dropdown)
- Real-time validation
- Success state with immediate feedback
- Closes care gaps automatically based on responses

### Doctor View
- Comprehensive care gap dashboard
- Advanced filtering by coverage, specialty, and status
- Grouped view by coverage and specialty
- Expandable gap cards with detailed information
- Quick actions (export, schedule, create care plan)
- Real-time statistics

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Focus indicators
- Skip links
- ARIA labels and roles

### Design Features
- Professional healthcare aesthetic
- Medical blue color palette
- Responsive design (mobile, tablet, desktop)
- Status indicators (closed, open, priority, pending)
- Priority badges (high, medium, low)
- Coverage indicators
- Smooth animations (respects reduced motion)

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons
- **Supabase** for storage and database
- **n8n** for workflow automation

## Getting Started

### Prerequisites

1. **Supabase Account** - You need access to the Supabase project
2. **Node.js** - Version 18 or higher
3. **n8n Webhook** - The webhook endpoint must be active

### Supabase Setup

Before running the application, you need to configure Supabase:

1. See **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** for detailed instructions
2. Get your Supabase anon key from the dashboard
3. Create a `.env` file with your credentials
4. Upload patient `.txt` files to the storage bucket

### Workflow Overview

The application integrates Supabase and n8n:

```
1. Nurse selects patient → Loads .txt file from Supabase Storage
2. File content → CORS Proxy → n8n Webhook (POST with patient data)
3. n8n workflow processes → "Respond to Webhook" node returns questionnaire
4. Nurse completes questionnaire → Submit answers → n8n Webhook
5. n8n processes answers → Updates records
```

### Installation

```bash
npm install
```

### Development

**Step 1: Start the CORS Proxy (Required for n8n webhook)**

In one terminal:
```bash
# Windows
START_PROXY.bat

# Mac/Linux
npm install express cors node-fetch@2
node proxy-server.js
```

The proxy will run on `http://localhost:3002`

**Step 2: Start the React App**

In another terminal:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Build

```bash
npm run build
```

### Preview

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── PatientHeader.tsx
│   ├── NurseView.tsx
│   ├── DoctorView.tsx
│   ├── StatusBadge.tsx
│   ├── PriorityBadge.tsx
│   └── CoverageBadge.tsx
├── data/
│   └── mockData.ts      # Sample data
├── lib/
│   └── utils.ts         # Utility functions
├── types/
│   └── index.ts         # TypeScript types
├── App.tsx              # Main application
└── main.tsx             # Entry point
```

## Usage

### Nurse Workflow

1. Navigate to the Nurse View tab
2. Answer the 3 priority questions for the patient
3. Submit the questionnaire
4. View immediate results (gaps closed/still open)

### Doctor Workflow

1. Navigate to the Doctor View tab
2. Review all care gaps (17 total in demo)
3. Use filters to focus on specific gaps
4. Expand gap cards to view details
5. Take actions (schedule, mark complete, add notes)
6. Export reports or create care plans

## Customization

### Colors

Edit `tailwind.config.js` and `src/index.css` to customize the color scheme.

### Mock Data

Edit `src/data/mockData.ts` to change patient information, questions, or care gaps.

### Components

All components are in `src/components/` and can be customized as needed.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
