import SubResourceTab from '../../common/SubResourceTab.jsx'
import { hospitalAffiliations } from '../../../api/index.js'
import { AFFILIATION_TYPES } from '../../../utils/constants.js'

export default function HospitalAffiliationsTab({ doctorId }) {
  return (
    <SubResourceTab
      queryKey={['hospitalAffiliations', doctorId]}
      fetchFn={() => hospitalAffiliations.list(doctorId)}
      createFn={(data) => hospitalAffiliations.create(doctorId, data)}
      updateFn={(subId, data) => hospitalAffiliations.update(doctorId, subId, data)}
      deleteFn={(subId) => hospitalAffiliations.delete(doctorId, subId)}
      title="Hospital Affiliations"
      fields={[
        { name: 'hospital_name', label: 'Hospital Name', required: true },
        { name: 'affiliation_type', label: 'Affiliation Type', type: 'select', options: AFFILIATION_TYPES },
        { name: 'department', label: 'Department' },
        { name: 'address', label: 'Address' },
        { name: 'city', label: 'City' },
        { name: 'state', label: 'State' },
        { name: 'zip', label: 'ZIP' },
        { name: 'start_date', label: 'Start Date', type: 'date' },
        { name: 'end_date', label: 'End Date', type: 'date' },
        { name: 'privileges_requested', label: 'Privileges Requested', type: 'textarea', span: 'full' },
      ]}
      renderRow={(row) => (
        <div>
          <span className="font-medium">{row.hospital_name}</span>
          {row.affiliation_type && <span className="ml-2 badge-gray capitalize">{row.affiliation_type}</span>}
          {row.department && <span className="text-gray-500 ml-2">— {row.department}</span>}
          {row.city && <span className="text-gray-400 ml-2 text-xs">{row.city}, {row.state}</span>}
        </div>
      )}
    />
  )
}
