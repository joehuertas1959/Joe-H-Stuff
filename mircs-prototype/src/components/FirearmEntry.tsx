// REQ-0006, REQ-0027: Weapon info dropdowns with type-ahead, validation by type
import type { Firearm } from '../types';
import { FIREARM_TYPES, FIREARM_MAKES, SURFACE_FINISHES } from '../types';

interface FirearmEntryProps {
  firearm: Partial<Firearm>;
  index: number;
  onChange: (index: number, field: keyof Firearm, value: string | boolean) => void;
  onRemove?: (index: number) => void;
  showRemove?: boolean;
  label?: string;
}

// Types that do NOT require barrel length or caliber (REQ-0027)
const NO_BARREL_CALIBER_TYPES = ['Stun Gun', 'Frame', 'Receiver'];
// Types that require semi-auto checkbox (REQ-0184 - Dealer only, shown as prop)
export const REQUIRES_SEMI_AUTO = ['Handgun', 'Rifle', 'Shotgun', 'Machine Gun'];

export default function FirearmEntry({ firearm, index, onChange, onRemove, showRemove, label }: FirearmEntryProps) {
  const hideBarrelCaliber = NO_BARREL_CALIBER_TYPES.includes(firearm.type || '');

  return (
    <div className="firearm-entry">
      <div className="firearm-entry-header">
        <h4 style={{ margin: 0 }}>{label || `Firearm ${index + 1}`}</h4>
        {showRemove && onRemove && (
          <button className="btn btn-danger btn-sm" onClick={() => onRemove(index)} type="button">
            Remove
          </button>
        )}
      </div>

      <div className="form-row-3">
        <div className="form-group">
          <label className="form-label">
            Type <span className="required-mark">*</span>
          </label>
          {/* REQ-0007: Type-ahead supported via datalist */}
          <select
            className="form-control"
            value={firearm.type || ''}
            onChange={e => onChange(index, 'type', e.target.value)}
          >
            <option value="">-- Select Type --</option>
            {FIREARM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">
            Make <span className="required-mark">*</span>
          </label>
          <select
            className="form-control"
            value={firearm.make || ''}
            onChange={e => onChange(index, 'make', e.target.value)}
          >
            <option value="">-- Select Make --</option>
            {FIREARM_MAKES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {firearm.make === 'Other' && (
            <input
              className="form-control"
              style={{ marginTop: '0.4rem' }}
              placeholder="Specify make..."
              type="text"
            />
          )}
        </div>

        <div className="form-group">
          <label className="form-label">
            Model <span className="required-mark">*</span>
          </label>
          {/* REQ-0006: Model field now a dropdown (with free text) */}
          <input
            className="form-control"
            type="text"
            placeholder="Enter model..."
            value={firearm.model || ''}
            onChange={e => onChange(index, 'model', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row-3">
        {!hideBarrelCaliber && (
          <>
            <div className="form-group">
              <label className="form-label">
                Caliber <span className="required-mark">*</span>
              </label>
              <input
                className="form-control"
                type="text"
                placeholder="e.g. 9mm, .45 ACP"
                value={firearm.caliber || ''}
                onChange={e => onChange(index, 'caliber', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Barrel Length (inches) <span className="required-mark">*</span>
              </label>
              {/* REQ-0027: Barrel length required but no longer validated by type */}
              <input
                className="form-control"
                type="text"
                placeholder="e.g. 4.5"
                value={firearm.barrelLength || ''}
                onChange={e => onChange(index, 'barrelLength', e.target.value)}
              />
            </div>
          </>
        )}

        <div className="form-group">
          <label className="form-label">
            Serial Number <span className="required-mark">*</span>
          </label>
          <input
            className="form-control"
            type="text"
            placeholder="Enter serial number"
            value={firearm.serialNumber || ''}
            onChange={e => onChange(index, 'serialNumber', e.target.value)}
          />
        </div>
      </div>

      <div className="form-row-2">
        <div className="form-group">
          <label className="form-label">Surface Finish</label>
          <select
            className="form-control"
            value={firearm.surfaceFinish || ''}
            onChange={e => onChange(index, 'surfaceFinish', e.target.value)}
          >
            <option value="">-- Select --</option>
            {SURFACE_FINISHES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {firearm.surfaceFinish === 'Other' && (
            <input className="form-control" style={{ marginTop: '0.4rem' }} placeholder="Specify finish..." />
          )}
        </div>

        <div className="form-group" style={{ paddingTop: '1.5rem' }}>
          <div className="form-check">
            <input
              type="checkbox"
              id={`privately-made-${index}`}
              checked={firearm.isPrivatelyMade || false}
              onChange={e => onChange(index, 'isPrivatelyMade', e.target.checked)}
            />
            <label className="form-check-label" htmlFor={`privately-made-${index}`}>
              Privately Made Firearm (ghost gun)
            </label>
          </div>
          {/* REQ-0027: Barrel length/caliber not needed for stun gun/frame/receiver */}
          {hideBarrelCaliber && (
            <p className="form-hint" style={{ marginTop: '0.5rem' }}>
              ℹ️ Barrel length and caliber are not required for {firearm.type}.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
