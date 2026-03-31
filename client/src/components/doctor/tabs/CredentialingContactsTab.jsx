import SubResourceTab from '../../common/SubResourceTab.jsx'
import { credentialingContacts } from '../../../api/index.js'
import { CONTACT_TYPES } from '../../../utils/constants.js'

export default function CredentialingContactsTab({ doctorId }) {
  return (
    <SubResourceTab
      queryKey={['credentialingContacts', doctorId]}
      fetchFn={() => credentialingContacts.list(doctorId)}
      createFn={(data) => credentialingContacts.create(doctorId, data)}
      updateFn={(subId, data) => credentialingContacts.update(doctorId, subId, data)}
      deleteFn={(subId) => credentialingContacts.delete(doctorId, subId)}
      title="Credentialing Contacts"
      fields={[
        { name: 'contact_name', label: 'Name', required: true },
        { name: 'title', label: 'Title' },
        { name: 'organization', label: 'Organization' },
        { name: 'contact_type', label: 'Contact Type', type: 'select', options: CONTACT_TYPES },
        { name: 'phone', label: 'Phone' },
        { name: 'fax', label: 'Fax' },
        { name: 'email', label: 'Email', type: 'email' },
      ]}
      renderRow={(row) => (
        <div>
          <span className="font-medium">{row.contact_name}</span>
          {row.title && <span className="text-gray-500 ml-2">— {row.title}</span>}
          {row.contact_type && <span className="ml-2 badge-gray capitalize">{row.contact_type.replace('_', ' ')}</span>}
          {row.email && <span className="text-gray-400 ml-2 text-xs">{row.email}</span>}
        </div>
      )}
    />
  )
}
