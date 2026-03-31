import SubResourceTab from '../../common/SubResourceTab.jsx'
import { employmentHistory } from '../../../api/index.js'

export default function EmploymentHistoryTab({ doctorId }) {
  return (
    <SubResourceTab
      queryKey={['employmentHistory', doctorId]}
      fetchFn={() => employmentHistory.list(doctorId)}
      createFn={(data) => employmentHistory.create(doctorId, data)}
      updateFn={(subId, data) => employmentHistory.update(doctorId, subId, data)}
      deleteFn={(subId) => employmentHistory.delete(doctorId, subId)}
      title="Employment History"
      fields={[
        { name: 'employer_name', label: 'Employer Name', required: true },
        { name: 'position_title', label: 'Position / Title' },
        { name: 'address', label: 'Address' },
        { name: 'city', label: 'City' },
        { name: 'state', label: 'State' },
        { name: 'zip', label: 'ZIP' },
        { name: 'phone', label: 'Phone' },
        { name: 'start_date', label: 'Start Date', type: 'date', required: true },
        { name: 'end_date', label: 'End Date', type: 'date' },
        { name: 'reason_for_leaving', label: 'Reason for Leaving', type: 'textarea', span: 'full' },
        { name: 'is_current', label: 'Current Employer', type: 'checkbox', checkLabel: 'Currently employed here' },
      ]}
      renderRow={(row) => (
        <div>
          <span className="font-medium">{row.employer_name}</span>
          {row.position_title && <span className="text-gray-500 ml-2">— {row.position_title}</span>}
          {row.is_current ? <span className="ml-2 badge-green">Current</span> : null}
          <span className="text-gray-400 ml-2 text-xs">
            {row.start_date?.slice(0,4)}{row.end_date ? ` – ${row.end_date.slice(0,4)}` : row.is_current ? ' – Present' : ''}
          </span>
        </div>
      )}
    />
  )
}
