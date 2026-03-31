import SubResourceTab from '../../common/SubResourceTab.jsx'
import { specialties } from '../../../api/index.js'
import { formatDate } from '../../../utils/dateHelpers.js'

export default function SpecialtiesTab({ doctorId }) {
  return (
    <SubResourceTab
      queryKey={['specialties', doctorId]}
      fetchFn={() => specialties.list(doctorId)}
      createFn={(data) => specialties.create(doctorId, data)}
      updateFn={(subId, data) => specialties.update(doctorId, subId, data)}
      deleteFn={(subId) => specialties.delete(doctorId, subId)}
      title="Specialties"
      fields={[
        { name: 'specialty_name', label: 'Specialty', required: true },
        { name: 'board_certified', label: 'Board Certified', type: 'checkbox', checkLabel: 'Board certified' },
        { name: 'certifying_board', label: 'Certifying Board' },
        { name: 'initial_cert_date', label: 'Initial Cert Date', type: 'date' },
        { name: 'recert_date', label: 'Recertification Date', type: 'date' },
        { name: 'expiration_date', label: 'Expiration Date', type: 'date' },
      ]}
      renderRow={(row) => (
        <div>
          <span className="font-medium">{row.specialty_name}</span>
          {row.board_certified ? <span className="ml-2 badge-green">Board Certified</span> : null}
          {row.certifying_board && <span className="text-gray-500 ml-2">— {row.certifying_board}</span>}
          {row.expiration_date && <span className="text-gray-400 ml-2 text-xs">Exp: {formatDate(row.expiration_date)}</span>}
        </div>
      )}
    />
  )
}
