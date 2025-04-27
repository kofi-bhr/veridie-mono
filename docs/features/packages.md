# Package Management System

## Overview
The package management system allows consultants to create and manage their service packages, while enabling users to purchase and schedule sessions. The system integrates with Stripe for payments and Calendly for scheduling.

## Features

### For Consultants

#### Package Management
- Create, edit, and manage service packages
- Set pricing, duration, and availability
- Integrate Calendly links for scheduling
- Track package purchases and scheduling status

```typescript
// Example: Creating a new package
const result = await createPackage({
  title: "1-Hour Consultation",
  description: "One-on-one consultation session",
  price: 100,
  duration: 60,
  is_active: true,
  calendly_link: "https://calendly.com/consultant/session"
});
```

#### Contact Settings
- Manage contact information (email, phone)
- Customize welcome message template
- Control when contact details are revealed to purchasers

### For Users

#### Purchase Flow
1. View package details
2. Click purchase button
3. Complete Stripe checkout
4. Receive success confirmation
5. Access consultant contact information
6. Schedule session via Calendly

#### Post-Purchase
- View consultant contact information
- Schedule session through Calendly
- Read welcome message
- Track scheduling status

## Implementation Details

### Database Schema

```sql
-- Packages table
create table packages (
  id uuid primary key default uuid_generate_v4(),
  consultant_id uuid references consultants(id),
  title text not null,
  description text,
  price numeric not null,
  duration integer,
  is_active boolean default true,
  calendly_link text,
  created_at timestamp with time zone default now()
);

-- Purchases table
create table purchases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  package_id uuid references packages(id),
  consultant_id uuid references consultants(id),
  status text not null,
  stripe_payment_intent_id text,
  contact_initiated boolean default false,
  calendly_scheduled boolean default false,
  created_at timestamp with time zone default now()
);
```

### API Endpoints

#### Package Management
- `POST /api/packages` - Create package
- `PUT /api/packages/:id` - Update package
- `GET /api/packages/:id` - Get package details

#### Purchase Flow
- `POST /api/checkout/sessions` - Create Stripe checkout session
- `POST /api/purchases/:id/contact` - Track contact info view
- `POST /api/purchases/:id/schedule` - Track Calendly scheduling

### Components

#### Consultant Components
- `PackageForm` - Create/edit package form
- `PackageList` - Grid view of packages
- `ContactSettingsTab` - Manage contact settings

#### User Components
- `PackageDetails` - Package information and purchase
- `PurchaseSuccess` - Post-purchase information

## Testing

### Unit Tests
- Package validation
- Form components
- API endpoints

### E2E Tests
- Complete purchase flow
- Contact information reveal
- Scheduling integration

## Security Considerations

### Payment Processing
- All payments handled through Stripe
- Platform fee automatically calculated
- Secure transfer to consultant accounts

### Data Protection
- Contact information revealed only after purchase
- Calendly links validated for security
- User authentication required for purchases

## Error Handling

### Common Scenarios
1. Invalid Calendly links
2. Failed payments
3. Missing contact information
4. Scheduling failures

### User Feedback
- Toast notifications for actions
- Clear error messages
- Guided resolution steps

## Future Improvements

### Planned Features
1. Package analytics for consultants
2. Bulk package management
3. Advanced scheduling options
4. Custom payment terms

### Performance Optimizations
1. Caching package data
2. Optimistic UI updates
3. Lazy loading components
