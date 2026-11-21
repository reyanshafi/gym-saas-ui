import {
  billingCurrency,
  reportingTimeZone,
} from "@/shared/lib/business-defaults";

export default function PlatformSettings() {
  return (
    <section className="panel" aria-labelledby="platform-defaults">
      <div className="panel-header">
        <h2 id="platform-defaults">Platform defaults</h2>
      </div>
      <div className="dialog-body">
        <dl className="profile-fields">
          <div>
            <dt>Billing currency</dt>
            <dd>{billingCurrency}</dd>
          </div>
          <div>
            <dt>Reporting time zone</dt>
            <dd>{reportingTimeZone}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
