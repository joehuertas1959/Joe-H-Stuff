// REQ-0022: Post Global/Admin Messages
const DEMO_MESSAGE = 'IMPORTANT: The Massachusetts Electronic Firearms Registry is now live as of October 2, 2025. All firearms must be registered electronically. Visit mass.gov/firearms-services for details.';

export default function AdminBanner() {
  return (
    <div className="admin-banner" role="region" aria-label="System Announcement">
      <strong>📢 System Announcement:</strong> {DEMO_MESSAGE}
    </div>
  );
}
