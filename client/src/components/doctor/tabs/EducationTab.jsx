import SubResourceTab from "../../common/SubResourceTab.jsx";
import { education } from "../../../api/index.js";
import { EDUCATION_TYPES } from "../../../utils/constants.js";

export default function EducationTab({ doctorId }) {
  return (
    <SubResourceTab
      queryKey={["education", doctorId]}
      fetchFn={() => education.list(doctorId)}
      createFn={(data) => education.create(doctorId, data)}
      updateFn={(subId, data) => education.update(doctorId, subId, data)}
      deleteFn={(subId) => education.delete(doctorId, subId)}
      title="Education & Professional Training"
      fields={[
        {
          name: "education_type",
          label: "Type",
          required: true,
          type: "select",
          options: EDUCATION_TYPES,
        },
        { name: "institution_name", label: "Institution Name", required: true },
        { name: "degree", label: "Degree" },
        { name: "specialty", label: "Specialty/Program" },
        { name: "city", label: "City" },
        { name: "state", label: "State" },
        { name: "country", label: "Country" },
        { name: "start_date", label: "Start Date", type: "date" },
        { name: "end_date", label: "End Date", type: "date" },
      ]}
      renderRow={(row) => (
        <div>
          <span className="font-medium capitalize">
            {row.education_type.replaceAll("_", " ")}
          </span>
          <span className="mx-1 text-gray-400">—</span>
          <span>{row.institution_name}</span>
          {row.degree && (
            <span className="text-gray-500 ml-2">({row.degree})</span>
          )}
          {row.end_date && (
            <span className="text-gray-400 ml-2 text-xs">
              {row.end_date?.slice(0, 4)}
            </span>
          )}
        </div>
      )}
    />
  );
}
