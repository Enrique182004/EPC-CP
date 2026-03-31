import SubResourceTab from '../../common/SubResourceTab.jsx'
import { professionalIds } from '../../../api/index.js'
import { ID_TYPES } from '../../../utils/constants.js'
import { formatDate, expirationColor } from '../../../utils/dateHelpers.js'
import clsx from 'clsx'

const colorClass = { red: 'text-red-600', yellow: 'text-yellow-600', green: 'text-green-600', gray: 'text-gray-400' }

export default function ProfessionalIdsTab({ doctorId }) {
  return (
    <SubResourceTab
      queryKey={['professionalIds', doctorId]}
      fetchFn={() => professionalIds.list(doctorId)}
      createFn={(data) => professionalIds.create(doctorId, data)}
      updateFn={(subId, data) => professionalIds.update(doctorId, subId, data)}
      deleteFn={(subId) => professionalIds.delete(doctorId, subId)}
      title="Professional IDs"
      fields={[
        { name: 'id_type', label: 'ID Type', required: true, type: 'select', options: ID_TYPES },
        { name: 'id_number', label: 'ID Number', required: true },
        { name: 'state', label: 'State' },
        { name: 'issue_date', label: 'Issue Date', type: 'date' },
        { name: 'expiration_date', label: 'Expiration Date', type: 'date' },
        { name: 'status', label: 'Status', type: 'select', options: ['active','inactive','pending'] },
      ]}
      renderRow={(row) => (
        <div>
          <span className="font-medium">{row.id_type}</span>
          {row.state && <span className="text-gray-500 ml-1">({row.state})</span>}
          <span className="ml-2 text-gray-500">#{row.id_number}</span>
          {row.expiration_date && (
            <span className={clsx('ml-3 text-xs font-medium', colorClass[expirationColor(row.expiration_date)])}>
              Exp: {formatDate(row.expiration_date)}
            </span>
          )}
        </div>
      )}
    />
  )
}
