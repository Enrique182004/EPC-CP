import SubResourceTab from "../../common/SubResourceTab.jsx";
import { liabilityInsurance } from "../../../api/index.js";
import { COVERAGE_TYPES } from "../../../utils/constants.js";
import { formatDate, expirationColor } from "../../../utils/dateHelpers.js";
import clsx from "clsx";

const colorClass = {
  red: "text-red-600 font-semibold",
  yellow: "text-yellow-600",
  green: "text-green-600",
  gray: "text-gray-400",
};

export default function LiabilityInsuranceTab({ doctorId }) {
  return (
    <SubResourceTab
      queryKey={["liabilityInsurance", doctorId]}
      fetchFn={() => liabilityInsurance.list(doctorId)}
      createFn={(data) => liabilityInsurance.create(doctorId, data)}
      updateFn={(subId, data) =>
        liabilityInsurance.update(doctorId, subId, data)
      }
      deleteFn={(subId) => liabilityInsurance.delete(doctorId, subId)}
      title="Professional Liability Insurance"
      fields={[
        { name: "carrier_name", label: "Carrier Name", required: true },
        { name: "policy_number", label: "Policy Number", required: true },
        {
          name: "coverage_type",
          label: "Coverage Type",
          type: "select",
          options: COVERAGE_TYPES,
        },
        {
          name: "per_occurrence_limit",
          label: "Per Occurrence Limit ($)",
          type: "number",
        },
        {
          name: "aggregate_limit",
          label: "Aggregate Limit ($)",
          type: "number",
        },
        {
          name: "effective_date",
          label: "Effective Date",
          type: "date",
          required: true,
        },
        {
          name: "expiration_date",
          label: "Expiration Date",
          type: "date",
          required: true,
        },
        {
          name: "is_current",
          label: "Current Policy",
          type: "checkbox",
          checkLabel: "This is the current policy",
        },
        {
          name: "tail_coverage",
          label: "Tail Coverage",
          type: "checkbox",
          checkLabel: "Has tail coverage",
        },
        {
          name: "tail_effective_date",
          label: "Tail Effective Date",
          type: "date",
        },
        {
          name: "tail_expiration_date",
          label: "Tail Expiration Date",
          type: "date",
        },
      ]}
      renderRow={(row) => (
        <div>
          <span className="font-medium">{row.carrier_name}</span>
          <span className="text-gray-500 ml-2">#{row.policy_number}</span>
          {row.is_current ? (
            <span className="ml-2 badge-green">Current</span>
          ) : null}
          {row.expiration_date && (
            <span
              className={clsx(
                "ml-3 text-xs",
                colorClass[expirationColor(row.expiration_date)],
              )}
            >
              Exp: {formatDate(row.expiration_date)}
            </span>
          )}
          {row.per_occurrence_limit && (
            <span className="text-gray-400 ml-2 text-xs">
              ${Number(row.per_occurrence_limit).toLocaleString()} / $
              {Number(row.aggregate_limit || 0).toLocaleString()}
            </span>
          )}
        </div>
      )}
    />
  );
}
