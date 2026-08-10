import type { AdFormatId } from '@telyad/types';

export interface PhonePreviewProps {
  formatId: AdFormatId;
  fields: Record<string, string>;
}

/** Handset preview, ported from the prototype device mockups. */
export function PhonePreview({ formatId, fields }: PhonePreviewProps) {
  return (
    <div className="tly-phone">
      <div className="tly-phone-notch" />
      {renderPreview(formatId, fields)}
    </div>
  );
}

function renderPreview(formatId: AdFormatId, f: Record<string, string>) {
  switch (formatId) {
    case 'stk':
      return (
        <div className="tly-stk-dialog">
          <div className="tly-stk-header">{f.serviceName || 'MTN Service'}</div>
          <div className="tly-stk-body">{f.body || f.menuTitle || 'Your STK message preview appears here.'}</div>
          <div className="tly-stk-btns">
            <div className="tly-stk-btn primary">{f.option1 || 'Accept'}</div>
            {f.option2 && <div className="tly-stk-btn">{f.option2}</div>}
            <div className="tly-stk-btn">{f.option3 || 'Cancel'}</div>
          </div>
        </div>
      );
    case 'sms':
      return (
        <>
          <div className="tly-sms-bubble">{f.message || 'Your SMS message preview appears here.'}</div>
          <div className="tly-sms-meta">{f.senderId || 'MTNOffers'} · now</div>
        </>
      );
    case 'ussd':
      return (
        <div className="tly-ussd-screen">
          {f.menuText || `${f.shortCode || '*8022#'}\n\n1. Continue\n2. Learn more\n0. Exit`}
        </div>
      );
    case 'wap':
      return (
        <div className="tly-generic-preview">
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{f.title || 'WAP Push'}</div>
          <div>{f.body || 'Tap to open the zero-rated landing page.'}</div>
          <div className="tly-mono" style={{ marginTop: 10, fontSize: 11 }}>
            {f.url || 'http://mtn.ng/offer'}
          </div>
        </div>
      );
    case 'obd':
      return (
        <div className="tly-generic-preview">
          <div style={{ fontSize: 34 }}>📞</div>
          <div style={{ fontWeight: 700, margin: '8px 0' }}>Incoming voice message</div>
          <div>{f.script ? f.script.slice(0, 120) : 'Your IVR voice script preview.'}</div>
        </div>
      );
    default:
      return <div className="tly-generic-preview">Preview</div>;
  }
}
