import SubResourceTab from '../../common/SubResourceTab.jsx'
import { professionalReferences } from '../../../api/index.js'

export default function ReferencesTab({ doctorId }) {
  return (
    <SubResourceTab
      queryKey={['professionalReferences', doctorId]}
      fetchFn={() => professionalReferences.list(doctorId)}
      createFn={(data) => professionalReferences.create(doctorId, data)}
      updateFn={(subId, data) => professionalReferences.update(doctorId, subId, data)}
      deleteFn={(subId) => professionalReferences.delete(doctorId, subId)}
      title="Professional References (3 required)"
      fields={[
        { name: 'ref_name', label: 'Reference Name', required: true },
        { name: 'specialty', label: 'Specialty' },
        { name: 'relationship', label: 'Relationship' },
        { name: 'phone', label: 'Phone' },
        { name: 'email', label: 'Email', type: 'email' },
        { name: 'years_known', label: 'Years Known', type: 'number' },
      ]}
      renderRow={(row) => (
        <div>
          <span className="font-medium">{row.ref_name}</span>
          {row.specialty && <span className="text-gray-500 ml-2">— {row.specialty}</span>}
          {row.relationship && <span className="text-gray-400 ml-2 text-xs">({row.relationship})</span>}
          {row.email && <span className="text-gray-400 ml-2 text-xs">{row.email}</span>}
        </div>
      )}
    />
  )
}
