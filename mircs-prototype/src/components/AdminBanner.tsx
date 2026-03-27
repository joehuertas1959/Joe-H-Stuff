// RFP-HPD-1954933: HPD System Announcement Banner
// Admin-configurable global message displayed across portal pages

const DEMO_MESSAGE = 'The HPD Electronic Firearms Permit System is now live. All Permit to Acquire (PTA) applications must be submitted electronically. Contact HPD Firearms Unit: (808) 529-3371 or firearms@honolulupd.org.';

export default function AdminBanner() {
  return (
    <div className="admin-banner" role="region" aria-label="System Announcement">
      <strong>📢 HPD System Notice:</strong> {DEMO_MESSAGE}
    </div>
  );
}
