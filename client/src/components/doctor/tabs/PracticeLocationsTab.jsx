import SubResourceTab from '../../common/SubResourceTab.jsx'
import { practiceLocations } from '../../../api/index.js'

export default function PracticeLocationsTab({ doctorId }) {
  return (
    <SubResourceTab
      queryKey={['practiceLocations', doctorId]}
      fetchFn={() => practiceLocations.list(doctorId)}
      createFn={(data) => practiceLocations.create(doctorId, data)}
      updateFn={(subId, data) => practiceLocations.update(doctorId, subId, data)}
      deleteFn={(subId) => practiceLocations.delete(doctorId, subId)}
      title="Practice Locations"
      fields={[
        { name: 'location_name', label: 'Location Name', required: true },
        { name: 'address', label: 'Address', span: 'full' },
        { name: 'city', label: 'City' },
        { name: 'state', label: 'State' },
        { name: 'zip', label: 'ZIP' },
        { name: 'phone', label: 'Phone' },
        { name: 'fax', label: 'Fax' },
        { name: 'group_npi', label: 'Group NPI' },
        { name: 'tax_id', label: 'Tax ID' },
        { name: 'is_primary', label: 'Primary Location', type: 'checkbox', checkLabel: 'This is the primary location' },
      ]}
      renderRow={(row) => (
        <div>
          <span className="font-medium">{row.location_name}</span>
          {row.is_primary ? <span className="ml-2 badge-blue">Primary</span> : null}
          {row.city && <span className="text-gray-500 ml-2">— {row.city}, {row.state}</span>}
          {row.phone && <span className="text-gray-400 ml-2 text-xs">{row.phone}</span>}
        </div>
      )}
    />
  )
}
